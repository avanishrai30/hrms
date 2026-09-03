import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { AuditService } from "../audit/audit.service.js";
import {
  type BookingStatus,
  type DeskType,
  type FacilityType,
  type VehicleStatus,
  Prisma
} from "@prisma/client";
import type {
  CreateFacilityDto,
  BookFacilityDto,
  CreateDeskDto,
  AllocateDeskDto,
  CreateVehicleDto,
  BookVehicleDto,
  RecordVehicleLogDto
} from "./facilities.schemas.js";

@Injectable()
export class FacilitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  private async recordAudit(
    tenantId: string,
    action: string,
    resourceType: string,
    resourceId?: string,
    metadata?: Record<string, unknown>,
    userId?: string,
    membershipId?: string
  ) {
    return this.auditService.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action,
      resourceType,
      resourceId,
      metadata: (metadata ?? {}) as unknown as Prisma.InputJsonValue
    });
  }

  private async resolveTenantEmployeeId(
    tenantId: string,
    employeeId: string,
    actorContext: { userId?: string; membershipId?: string },
    label = "Employee"
  ) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, tenantId },
      select: { id: true }
    });
    if (employee) return employee.id;

    if (actorContext.membershipId && actorContext.userId === employeeId) {
      const membership = await this.prisma.tenantMembership.findFirst({
        where: { id: actorContext.membershipId, tenantId },
        select: { employeeId: true }
      });
      if (membership?.employeeId) return membership.employeeId;
    }

    throw new NotFoundException(`${label} with ID "${employeeId}" not found`);
  }

  // -------------------------------------------------------------
  // 1. FACILITIES & ROOM BOOKINGS
  // -------------------------------------------------------------

  async listFacilities(tenantId: string, type?: FacilityType) {
    return this.prisma.facility.findMany({
      where: {
        tenantId,
        isActive: true,
        ...(type && { type })
      },
      include: {
        bookings: {
          where: {
            startTime: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
            status: { in: ["BOOKED", "APPROVED"] as BookingStatus[] }
          },
          include: { employee: true },
          orderBy: { startTime: "asc" }
        }
      },
      orderBy: { name: "asc" }
    });
  }

  async createFacility(
    tenantId: string,
    actorContext: { userId?: string; membershipId?: string },
    dto: CreateFacilityDto
  ) {
    const facility = await this.prisma.facility.create({
      data: {
        tenantId,
        name: dto.name,
        type: dto.type as FacilityType,
        building: dto.building,
        floor: dto.floor,
        capacity: dto.capacity,
        amenities: dto.amenities || []
      }
    });

    await this.recordAudit(
      tenantId,
      "FACILITY_CREATED",
      "Facility",
      facility.id,
      { name: facility.name, type: facility.type },
      actorContext.userId,
      actorContext.membershipId
    );

    return facility;
  }

  async listBookings(tenantId: string, facilityId?: string, date?: string) {
    const startOfDay = date ? new Date(date) : new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.facilityBooking.findMany({
      where: {
        tenantId,
        ...(facilityId && { facilityId }),
        startTime: { gte: startOfDay, lte: endOfDay }
      },
      include: {
        facility: true,
        employee: true
      },
      orderBy: { startTime: "asc" }
    });
  }

  async bookFacility(
    tenantId: string,
    actorContext: { userId?: string; membershipId?: string },
    employeeId: string,
    dto: BookFacilityDto
  ) {
    const resolvedEmployeeId = await this.resolveTenantEmployeeId(tenantId, employeeId, actorContext);
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);

    if (start >= end) {
      throw new BadRequestException("Start time must be before end time");
    }

    const facility = await this.prisma.facility.findFirst({
      where: { id: dto.facilityId, tenantId, isActive: true }
    });
    if (!facility) {
      throw new NotFoundException(`Facility with ID "${dto.facilityId}" not found`);
    }

    // Check conflict
    const conflict = await this.prisma.facilityBooking.findFirst({
      where: {
        tenantId,
        facilityId: dto.facilityId,
        status: { in: ["BOOKED", "APPROVED"] as BookingStatus[] },
        OR: [
          { startTime: { lte: start }, endTime: { gt: start } },
          { startTime: { lt: end }, endTime: { gte: end } },
          { startTime: { gte: start }, endTime: { lte: end } }
        ]
      }
    });

    if (conflict) {
      throw new BadRequestException("The facility is already booked for this time slot");
    }

    const booking = await this.prisma.facilityBooking.create({
      data: {
        tenantId,
        facilityId: dto.facilityId,
        employeeId: resolvedEmployeeId,
        title: dto.title,
        startTime: start,
        endTime: end,
        attendees: dto.attendees,
        purpose: dto.purpose,
        notes: dto.notes,
        status: "BOOKED" as BookingStatus
      }
    });

    await this.recordAudit(
      tenantId,
      "FACILITY_BOOKED",
      "FacilityBooking",
      booking.id,
      { facilityId: dto.facilityId, startTime: start, endTime: end },
      actorContext.userId,
      actorContext.membershipId
    );

    return booking;
  }

  // -------------------------------------------------------------
  // 2. DESKS & ALLOCATIONS
  // -------------------------------------------------------------

  async listDesks(tenantId: string, floor?: string, zone?: string) {
    const desks = await this.prisma.desk.findMany({
      where: {
        tenantId,
        isActive: true,
        ...(floor && { floor }),
        ...(zone && { zone })
      },
      include: {
        allocations: {
          where: { status: "ACTIVE" },
          include: { employee: true }
        }
      },
      orderBy: [{ floor: "asc" }, { deskNumber: "asc" }]
    });

    return desks.map((desk) => {
      const activeAllocation = desk.allocations[0];
      return {
        ...desk,
        isOccupied: Boolean(activeAllocation),
        currentAllocation: activeAllocation
          ? {
              id: activeAllocation.id,
              employeeId: activeAllocation.employee.id,
              employeeName: activeAllocation.employee.fullName,
              isPermanent: activeAllocation.isPermanent
            }
          : null
      };
    });
  }

  async createDesk(
    tenantId: string,
    actorContext: { userId?: string; membershipId?: string },
    dto: CreateDeskDto
  ) {
    const existing = await this.prisma.desk.findFirst({
      where: { tenantId, deskNumber: dto.deskNumber }
    });
    if (existing) {
      throw new BadRequestException(`Desk with number "${dto.deskNumber}" already exists`);
    }

    const desk = await this.prisma.desk.create({
      data: {
        tenantId,
        deskNumber: dto.deskNumber,
        floor: dto.floor,
        zone: dto.zone,
        type: dto.type as DeskType
      }
    });

    await this.recordAudit(
      tenantId,
      "DESK_CREATED",
      "Desk",
      desk.id,
      { deskNumber: desk.deskNumber, floor: desk.floor, zone: desk.zone },
      actorContext.userId,
      actorContext.membershipId
    );

    return desk;
  }

  async allocateDesk(
    tenantId: string,
    actorContext: { userId?: string; membershipId?: string },
    dto: AllocateDeskDto
  ) {
    const desk = await this.prisma.desk.findFirst({
      where: { id: dto.deskId, tenantId, isActive: true },
      include: { allocations: { where: { status: "ACTIVE" } } }
    });

    if (!desk) {
      throw new NotFoundException(`Desk with ID "${dto.deskId}" not found`);
    }

    if (desk.allocations.length > 0) {
      throw new BadRequestException(`Desk "${desk.deskNumber}" is already allocated`);
    }

    const employee = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, tenantId }
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID "${dto.employeeId}" not found`);
    }

    const allocation = await this.prisma.deskAllocation.create({
      data: {
        tenantId,
        deskId: dto.deskId,
        employeeId: dto.employeeId,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        isPermanent: dto.isPermanent,
        status: "ACTIVE"
      }
    });

    await this.recordAudit(
      tenantId,
      "DESK_ALLOCATED",
      "DeskAllocation",
      allocation.id,
      { deskId: dto.deskId, employeeId: dto.employeeId },
      actorContext.userId,
      actorContext.membershipId
    );

    return allocation;
  }

  // -------------------------------------------------------------
  // 3. VEHICLES & LOGS
  // -------------------------------------------------------------

  async listVehicles(tenantId: string, status?: VehicleStatus) {
    return this.prisma.vehicle.findMany({
      where: {
        tenantId,
        ...(status && { status })
      },
      include: {
        bookings: {
          where: {
            startTime: { gte: new Date() },
            status: { in: ["BOOKED", "APPROVED"] as BookingStatus[] }
          },
          include: { employee: true },
          orderBy: { startTime: "asc" }
        },
        logs: {
          orderBy: { recordedAt: "desc" },
          take: 5
        }
      },
      orderBy: { registrationNumber: "asc" }
    });
  }

  async createVehicle(
    tenantId: string,
    actorContext: { userId?: string; membershipId?: string },
    dto: CreateVehicleDto
  ) {
    const existing = await this.prisma.vehicle.findFirst({
      where: { tenantId, registrationNumber: dto.registrationNumber }
    });
    if (existing) {
      throw new BadRequestException(
        `Vehicle with registration "${dto.registrationNumber}" already exists`
      );
    }

    const vehicle = await this.prisma.vehicle.create({
      data: {
        tenantId,
        registrationNumber: dto.registrationNumber,
        make: dto.make,
        model: dto.model,
        type: dto.type,
        capacity: dto.capacity,
        driverName: dto.driverName,
        driverPhone: dto.driverPhone,
        insuranceExpiry: dto.insuranceExpiry ? new Date(dto.insuranceExpiry) : null,
        currentOdometer: dto.currentOdometer,
        notes: dto.notes
      }
    });

    await this.recordAudit(
      tenantId,
      "VEHICLE_CREATED",
      "Vehicle",
      vehicle.id,
      { registrationNumber: vehicle.registrationNumber },
      actorContext.userId,
      actorContext.membershipId
    );

    return vehicle;
  }

  async bookVehicle(
    tenantId: string,
    actorContext: { userId?: string; membershipId?: string },
    employeeId: string,
    dto: BookVehicleDto
  ) {
    const resolvedEmployeeId = await this.resolveTenantEmployeeId(tenantId, employeeId, actorContext);
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: dto.vehicleId, tenantId }
    });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID "${dto.vehicleId}" not found`);
    }

    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);

    const booking = await this.prisma.vehicleBooking.create({
      data: {
        tenantId,
        vehicleId: dto.vehicleId,
        employeeId: resolvedEmployeeId,
        purpose: dto.purpose,
        destination: dto.destination,
        startTime: start,
        endTime: end,
        passengers: dto.passengers,
        notes: dto.notes,
        status: "BOOKED" as BookingStatus
      }
    });

    await this.recordAudit(
      tenantId,
      "VEHICLE_BOOKED",
      "VehicleBooking",
      booking.id,
      { vehicleId: dto.vehicleId, destination: dto.destination },
      actorContext.userId,
      actorContext.membershipId
    );

    return booking;
  }

  async recordVehicleLog(
    tenantId: string,
    actorContext: { userId?: string; membershipId?: string },
    dto: RecordVehicleLogDto
  ) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: dto.vehicleId, tenantId }
    });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID "${dto.vehicleId}" not found`);
    }

    const [log, updatedVehicle] = await this.prisma.$transaction([
      this.prisma.vehicleLog.create({
        data: {
          tenantId,
          vehicleId: dto.vehicleId,
          logType: dto.logType,
          odometerReading: dto.odometerReading,
          fuelLiters: dto.fuelLiters,
          cost: dto.cost,
          remarks: dto.remarks
        }
      }),
      this.prisma.vehicle.update({
        where: { id: dto.vehicleId },
        data: {
          currentOdometer: Math.max(vehicle.currentOdometer, dto.odometerReading)
        }
      })
    ]);

    await this.recordAudit(
      tenantId,
      "VEHICLE_LOG_RECORDED",
      "VehicleLog",
      log.id,
      { vehicleId: dto.vehicleId, logType: dto.logType, odometer: dto.odometerReading },
      actorContext.userId,
      actorContext.membershipId
    );

    return { log, vehicle: updatedVehicle };
  }

  async listMeetingRooms(tenantId: string) {
    return this.prisma.meetingRoom.findMany({
      where: { tenantId, isActive: true },
      orderBy: { name: "asc" }
    });
  }

  async createMeetingRoom(
    tenantId: string,
    actor: { userId: string; membershipId?: string },
    dto: { name: string; capacity: number; floor?: string; building?: string; amenities?: string[] }
  ) {
    const room = await this.prisma.meetingRoom.create({
      data: {
        tenantId,
        name: dto.name,
        capacity: dto.capacity,
        floor: dto.floor,
        building: dto.building,
        amenities: dto.amenities ? (dto.amenities as unknown as Prisma.InputJsonValue) : Prisma.JsonNull
      }
    });

    await this.recordAudit(tenantId, "MEETING_ROOM_CREATED", "MeetingRoom", room.id, { name: room.name }, actor.userId, actor.membershipId);
    return room;
  }

  async listParkingSlots(tenantId: string) {
    return this.prisma.parkingSlot.findMany({
      where: { tenantId },
      orderBy: { slotNumber: "asc" }
    });
  }

  async createParkingSlot(
    tenantId: string,
    actor: { userId: string; membershipId?: string },
    dto: { slotNumber: string; vehicleType: string; isAssigned?: boolean; assignedToName?: string; assignedVehicleNo?: string }
  ) {
    const slot = await this.prisma.parkingSlot.create({
      data: {
        tenantId,
        slotNumber: dto.slotNumber,
        vehicleType: dto.vehicleType,
        isAssigned: dto.isAssigned ?? false,
        assignedToName: dto.assignedToName,
        assignedVehicleNo: dto.assignedVehicleNo
      }
    });

    await this.recordAudit(tenantId, "PARKING_SLOT_CREATED", "ParkingSlot", slot.id, { slotNumber: slot.slotNumber }, actor.userId, actor.membershipId);
    return slot;
  }
}
