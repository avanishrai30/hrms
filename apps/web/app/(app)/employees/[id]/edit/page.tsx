"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Field, Input, Panel } from "../../../../../components/ui";
import { apiRequest } from "../../../../../lib/api";

const profileSchema = z.object({
  fullName: z.string().min(2),
  preferredName: z.string().optional(),
  personalEmail: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  profilePhotoObjectKey: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY", ""]).optional()
});

const statusSchema = z.object({
  status: z.enum(["DRAFT", "INVITED", "ACTIVE", "PROBATION", "ON_LEAVE", "NOTICE_PERIOD", "INACTIVE", "ARCHIVED"]),
  reason: z.string().min(8)
});

const documentSchema = z.object({
  documentType: z.enum(["IDENTITY_PROOF", "ADDRESS_PROOF", "OFFER_LETTER", "EMPLOYMENT_AGREEMENT", "BANK_DOCUMENT", "TAX_DOCUMENT", "CUSTOM"]),
  customTypeLabel: z.string().optional(),
  fileName: z.string().min(2),
  mimeType: z.string().min(3),
  sizeBytes: z.coerce.number().int().positive(),
  objectKey: z.string().min(8)
});

const emergencyContactSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(5),
  relationship: z.string().min(2)
});

const bankDetailsSchema = z.object({
  bankName: z.string().min(2),
  accountHolderName: z.string().min(2),
  accountLast4: z.string().min(4).max(4),
  ifscCode: z.string().min(5)
});

const governmentIdsSchema = z.object({
  panLast4: z.string().min(4).max(4).optional().or(z.literal("")),
  aadhaarLast4: z.string().min(4).max(4).optional().or(z.literal("")),
  uan: z.string().optional().or(z.literal(""))
});

const addressSchema = z.object({
  currentAddress: z.object({
    line1: z.string().min(2),
    line2: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().min(4),
    country: z.string().min(2)
  }),
  permanentAddress: z.object({
    line1: z.string().min(2),
    line2: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().min(4),
    country: z.string().min(2)
  })
});

type ProfileForm = z.infer<typeof profileSchema>;
type StatusForm = z.infer<typeof statusSchema>;
type DocumentForm = z.infer<typeof documentSchema>;
type EmergencyContactForm = z.infer<typeof emergencyContactSchema>;
type BankDetailsForm = z.infer<typeof bankDetailsSchema>;
type GovernmentIdsForm = z.infer<typeof governmentIdsSchema>;
type AddressForm = z.infer<typeof addressSchema>;

interface EmployeeDetail {
  id: string;
  fullName: string;
  preferredName?: string;
  personalEmail?: string;
  phone?: string;
  profilePhotoObjectKey?: string;
  status: StatusForm["status"];
  dateOfBirth?: string;
  gender?: string;
  emergencyContact?: Partial<EmergencyContactForm>;
  bankDetails?: Partial<BankDetailsForm>;
  governmentIds?: Partial<GovernmentIdsForm>;
  currentAddress?: Partial<AddressForm["currentAddress"]>;
  permanentAddress?: Partial<AddressForm["permanentAddress"]>;
}

export default function EmployeeEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const employee = useQuery({ queryKey: ["employee-edit", id], queryFn: () => apiRequest<EmployeeDetail>(`/employees/${id}`) });
  
  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      preferredName: "",
      personalEmail: "",
      phone: "",
      profilePhotoObjectKey: "",
      dateOfBirth: "",
      gender: ""
    }
  });

  const statusForm = useForm<StatusForm>({
    resolver: zodResolver(statusSchema),
    defaultValues: {
      status: "DRAFT",
      reason: ""
    }
  });

  const documentForm = useForm<DocumentForm>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      documentType: "IDENTITY_PROOF",
      customTypeLabel: "",
      fileName: "",
      mimeType: "application/pdf",
      sizeBytes: 1024,
      objectKey: ""
    }
  });

  const emergencyForm = useForm<EmergencyContactForm>({
    resolver: zodResolver(emergencyContactSchema),
    defaultValues: {
      name: "",
      phone: "",
      relationship: ""
    }
  });

  const bankForm = useForm<BankDetailsForm>({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: {
      bankName: "",
      accountHolderName: "",
      accountLast4: "",
      ifscCode: ""
    }
  });

  const govIdsForm = useForm<GovernmentIdsForm>({
    resolver: zodResolver(governmentIdsSchema),
    defaultValues: {
      panLast4: "",
      aadhaarLast4: "",
      uan: ""
    }
  });

  const addressForm = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      currentAddress: { line1: "", line2: "", city: "", state: "", pincode: "", country: "" },
      permanentAddress: { line1: "", line2: "", city: "", state: "", pincode: "", country: "" }
    }
  });

  useEffect(() => {
    if (employee.data) {
      profileForm.reset({
        fullName: employee.data.fullName ?? "",
        preferredName: employee.data.preferredName ?? "",
        personalEmail: employee.data.personalEmail ?? "",
        phone: employee.data.phone ?? "",
        profilePhotoObjectKey: employee.data.profilePhotoObjectKey ?? "",
        dateOfBirth: employee.data.dateOfBirth ? new Date(employee.data.dateOfBirth).toISOString().split("T")[0] : "",
        gender: (employee.data.gender as ProfileForm["gender"]) ?? ""
      });
      statusForm.reset({
        status: employee.data.status ?? "DRAFT",
        reason: ""
      });
      if (employee.data.emergencyContact) {
        emergencyForm.reset({
          name: employee.data.emergencyContact.name ?? "",
          phone: employee.data.emergencyContact.phone ?? "",
          relationship: employee.data.emergencyContact.relationship ?? ""
        });
      }
      if (employee.data.bankDetails) {
        bankForm.reset({
          bankName: employee.data.bankDetails.bankName ?? "",
          accountHolderName: employee.data.bankDetails.accountHolderName ?? "",
          accountLast4: employee.data.bankDetails.accountLast4 ?? "",
          ifscCode: employee.data.bankDetails.ifscCode ?? ""
        });
      }
      if (employee.data.governmentIds) {
        govIdsForm.reset({
          panLast4: employee.data.governmentIds.panLast4 ?? "",
          aadhaarLast4: employee.data.governmentIds.aadhaarLast4 ?? "",
          uan: employee.data.governmentIds.uan ?? ""
        });
      }
      if (employee.data.currentAddress || employee.data.permanentAddress) {
        addressForm.reset({
          currentAddress: {
            line1: employee.data.currentAddress?.line1 ?? "",
            line2: employee.data.currentAddress?.line2 ?? "",
            city: employee.data.currentAddress?.city ?? "",
            state: employee.data.currentAddress?.state ?? "",
            pincode: employee.data.currentAddress?.pincode ?? "",
            country: employee.data.currentAddress?.country ?? ""
          },
          permanentAddress: {
            line1: employee.data.permanentAddress?.line1 ?? "",
            line2: employee.data.permanentAddress?.line2 ?? "",
            city: employee.data.permanentAddress?.city ?? "",
            state: employee.data.permanentAddress?.state ?? "",
            pincode: employee.data.permanentAddress?.pincode ?? "",
            country: employee.data.permanentAddress?.country ?? ""
          }
        });
      }
    }
  }, [employee.data, profileForm, statusForm, emergencyForm, bankForm, govIdsForm, addressForm]);

  const updateProfile = useMutation({
    mutationFn: (values: ProfileForm) => {
      const payload: Record<string, unknown> = { ...values };
      if (payload.dateOfBirth) payload.dateOfBirth = new Date(payload.dateOfBirth as string).toISOString();
      if (!payload.gender) delete payload.gender;
      return apiRequest(`/employees/${id}`, { method: "PATCH", body: JSON.stringify(emptyToUndefined(payload)) });
    },
    onSuccess: () => router.push(`/employees/${id}`)
  });
  const updateStatus = useMutation({
    mutationFn: (values: StatusForm) => apiRequest(`/employees/${id}/status`, { method: "PATCH", body: JSON.stringify(values) }),
    onSuccess: () => router.push(`/employees/${id}`)
  });
  const createDocument = useMutation({
    mutationFn: (values: DocumentForm) => apiRequest(`/employees/${id}/documents`, { method: "POST", body: JSON.stringify(emptyToUndefined(values)) }),
    onSuccess: () => router.push(`/employees/${id}`)
  });
  const updateEmergency = useMutation({
    mutationFn: (values: EmergencyContactForm) => apiRequest(`/employees/${id}`, { method: "PATCH", body: JSON.stringify({ emergencyContact: values }) }),
    onSuccess: () => router.push(`/employees/${id}`)
  });
  const updateBank = useMutation({
    mutationFn: (values: BankDetailsForm) => apiRequest(`/employees/${id}`, { method: "PATCH", body: JSON.stringify({ bankDetails: values }) }),
    onSuccess: () => router.push(`/employees/${id}`)
  });
  const updateGovIds = useMutation({
    mutationFn: (values: GovernmentIdsForm) => apiRequest(`/employees/${id}`, { method: "PATCH", body: JSON.stringify({ governmentIds: emptyToUndefined(values) }) }),
    onSuccess: () => router.push(`/employees/${id}`)
  });
  const updateAddress = useMutation({
    mutationFn: (values: AddressForm) => apiRequest(`/employees/${id}`, { method: "PATCH", body: JSON.stringify({ currentAddress: values.currentAddress, permanentAddress: values.permanentAddress }) }),
    onSuccess: () => router.push(`/employees/${id}`)
  });

  return (
    <div className="mx-auto grid max-w-4xl gap-6 p-4 md:p-6 lg:p-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Edit employee</h1>
          <p className="mt-1 text-sm text-zinc-600">Update profile details, lifecycle status, and document metadata.</p>
        </div>
        <Link href={`/employees/${id}` as Route}>
          <Button variant="secondary">Profile</Button>
        </Link>
      </header>

      <Panel>
        <form className="grid gap-4" onSubmit={profileForm.handleSubmit((values) => updateProfile.mutate(values))}>
          <h2 className="text-base font-semibold text-zinc-950">Profile</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Full name" error={profileForm.formState.errors.fullName?.message}>
              <Input {...profileForm.register("fullName")} />
            </Field>
            <Field label="Preferred name" error={profileForm.formState.errors.preferredName?.message}>
              <Input {...profileForm.register("preferredName")} />
            </Field>
            <Field label="Personal email" error={profileForm.formState.errors.personalEmail?.message}>
              <Input {...profileForm.register("personalEmail")} type="email" />
            </Field>
            <Field label="Phone" error={profileForm.formState.errors.phone?.message}>
              <Input {...profileForm.register("phone")} />
            </Field>
            <Field label="Date of birth" error={profileForm.formState.errors.dateOfBirth?.message}>
              <Input {...profileForm.register("dateOfBirth")} type="date" />
            </Field>
            <Field label="Gender" error={profileForm.formState.errors.gender?.message}>
              <select className="h-11 rounded-control border border-border bg-surface px-3 text-sm" {...profileForm.register("gender")}>
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </select>
            </Field>
          </div>
          <Field label="Profile photo object key" error={profileForm.formState.errors.profilePhotoObjectKey?.message}>
            <Input {...profileForm.register("profilePhotoObjectKey")} placeholder="tenants/{tenantId}/employees/{employeeId}/photo.jpg" />
          </Field>
          <div className="flex justify-end">
            <Button disabled={updateProfile.isPending} type="submit">{updateProfile.isPending ? "Saving" : "Save profile"}</Button>
          </div>
        </form>
      </Panel>

      <Panel>
        <form className="grid gap-4" onSubmit={statusForm.handleSubmit((values) => updateStatus.mutate(values))}>
          <h2 className="text-base font-semibold text-zinc-950">Status lifecycle</h2>
          <div className="grid gap-4 md:grid-cols-[220px_1fr]">
            <Field label="New status" error={statusForm.formState.errors.status?.message}>
              <select className="h-11 rounded-control border border-border bg-surface px-3 text-sm" {...statusForm.register("status")}>
                <option value="DRAFT">Draft</option>
                <option value="INVITED">Invited</option>
                <option value="ACTIVE">Active</option>
                <option value="PROBATION">Probation</option>
                <option value="ON_LEAVE">On leave</option>
                <option value="NOTICE_PERIOD">Notice period</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </Field>
            <Field label="Reason" error={statusForm.formState.errors.reason?.message}>
              <Input {...statusForm.register("reason")} />
            </Field>
          </div>
          <div className="flex justify-end">
            <Button disabled={updateStatus.isPending} type="submit">{updateStatus.isPending ? "Updating" : "Update status"}</Button>
          </div>
        </form>
      </Panel>

      <Panel>
        <form className="grid gap-4" onSubmit={emergencyForm.handleSubmit((values) => updateEmergency.mutate(values))}>
          <h2 className="text-base font-semibold text-zinc-950">Emergency Contact</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Contact name" error={emergencyForm.formState.errors.name?.message}>
              <Input {...emergencyForm.register("name")} />
            </Field>
            <Field label="Contact phone" error={emergencyForm.formState.errors.phone?.message}>
              <Input {...emergencyForm.register("phone")} />
            </Field>
            <Field label="Relationship" error={emergencyForm.formState.errors.relationship?.message}>
              <Input {...emergencyForm.register("relationship")} />
            </Field>
          </div>
          <div className="flex justify-end">
            <Button disabled={updateEmergency.isPending} type="submit">{updateEmergency.isPending ? "Saving" : "Save contact"}</Button>
          </div>
        </form>
      </Panel>

      <Panel>
        <form className="grid gap-4" onSubmit={bankForm.handleSubmit((values) => updateBank.mutate(values))}>
          <h2 className="text-base font-semibold text-zinc-950">Bank Details</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Bank name" error={bankForm.formState.errors.bankName?.message}>
              <Input {...bankForm.register("bankName")} />
            </Field>
            <Field label="Account holder name" error={bankForm.formState.errors.accountHolderName?.message}>
              <Input {...bankForm.register("accountHolderName")} />
            </Field>
            <Field label="Account last 4" error={bankForm.formState.errors.accountLast4?.message}>
              <Input {...bankForm.register("accountLast4")} />
            </Field>
            <Field label="IFSC code" error={bankForm.formState.errors.ifscCode?.message}>
              <Input {...bankForm.register("ifscCode")} />
            </Field>
          </div>
          <div className="flex justify-end">
            <Button disabled={updateBank.isPending} type="submit">{updateBank.isPending ? "Saving" : "Save bank details"}</Button>
          </div>
        </form>
      </Panel>

      <Panel>
        <form className="grid gap-4" onSubmit={govIdsForm.handleSubmit((values) => updateGovIds.mutate(values))}>
          <h2 className="text-base font-semibold text-zinc-950">Government IDs</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="PAN last 4" error={govIdsForm.formState.errors.panLast4?.message}>
              <Input {...govIdsForm.register("panLast4")} />
            </Field>
            <Field label="Aadhaar last 4" error={govIdsForm.formState.errors.aadhaarLast4?.message}>
              <Input {...govIdsForm.register("aadhaarLast4")} />
            </Field>
            <Field label="UAN" error={govIdsForm.formState.errors.uan?.message}>
              <Input {...govIdsForm.register("uan")} />
            </Field>
          </div>
          <div className="flex justify-end">
            <Button disabled={updateGovIds.isPending} type="submit">{updateGovIds.isPending ? "Saving" : "Save government IDs"}</Button>
          </div>
        </form>
      </Panel>

      <Panel>
        <form className="grid gap-4" onSubmit={addressForm.handleSubmit((values) => updateAddress.mutate(values))}>
          <h2 className="text-base font-semibold text-zinc-950">Address</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="grid gap-4">
              <h3 className="font-medium text-zinc-950">Current address</h3>
              <Field label="Line 1" error={addressForm.formState.errors.currentAddress?.line1?.message}>
                <Input {...addressForm.register("currentAddress.line1")} />
              </Field>
              <Field label="Line 2" error={addressForm.formState.errors.currentAddress?.line2?.message}>
                <Input {...addressForm.register("currentAddress.line2")} />
              </Field>
              <Field label="City" error={addressForm.formState.errors.currentAddress?.city?.message}>
                <Input {...addressForm.register("currentAddress.city")} />
              </Field>
              <Field label="State" error={addressForm.formState.errors.currentAddress?.state?.message}>
                <Input {...addressForm.register("currentAddress.state")} />
              </Field>
              <Field label="Pincode" error={addressForm.formState.errors.currentAddress?.pincode?.message}>
                <Input {...addressForm.register("currentAddress.pincode")} />
              </Field>
              <Field label="Country" error={addressForm.formState.errors.currentAddress?.country?.message}>
                <Input {...addressForm.register("currentAddress.country")} />
              </Field>
            </div>
            
            <div className="grid gap-4">
              <h3 className="font-medium text-zinc-950">Permanent address</h3>
              <Field label="Line 1" error={addressForm.formState.errors.permanentAddress?.line1?.message}>
                <Input {...addressForm.register("permanentAddress.line1")} />
              </Field>
              <Field label="Line 2" error={addressForm.formState.errors.permanentAddress?.line2?.message}>
                <Input {...addressForm.register("permanentAddress.line2")} />
              </Field>
              <Field label="City" error={addressForm.formState.errors.permanentAddress?.city?.message}>
                <Input {...addressForm.register("permanentAddress.city")} />
              </Field>
              <Field label="State" error={addressForm.formState.errors.permanentAddress?.state?.message}>
                <Input {...addressForm.register("permanentAddress.state")} />
              </Field>
              <Field label="Pincode" error={addressForm.formState.errors.permanentAddress?.pincode?.message}>
                <Input {...addressForm.register("permanentAddress.pincode")} />
              </Field>
              <Field label="Country" error={addressForm.formState.errors.permanentAddress?.country?.message}>
                <Input {...addressForm.register("permanentAddress.country")} />
              </Field>
            </div>
          </div>
          <div className="flex justify-end">
            <Button disabled={updateAddress.isPending} type="submit">{updateAddress.isPending ? "Saving" : "Save address"}</Button>
          </div>
        </form>
      </Panel>

      <Panel>
        <form className="grid gap-4" onSubmit={documentForm.handleSubmit((values) => createDocument.mutate(values))}>
          <h2 className="text-base font-semibold text-zinc-950">Document metadata</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Document type" error={documentForm.formState.errors.documentType?.message}>
              <select className="h-11 rounded-control border border-border bg-surface px-3 text-sm" {...documentForm.register("documentType")}>
                <option value="IDENTITY_PROOF">Identity proof</option>
                <option value="ADDRESS_PROOF">Address proof</option>
                <option value="OFFER_LETTER">Offer letter</option>
                <option value="EMPLOYMENT_AGREEMENT">Employment agreement</option>
                <option value="BANK_DOCUMENT">Bank document</option>
                <option value="TAX_DOCUMENT">Tax document</option>
                <option value="CUSTOM">Custom</option>
              </select>
            </Field>
            <Field label="Custom label" error={documentForm.formState.errors.customTypeLabel?.message}>
              <Input {...documentForm.register("customTypeLabel")} />
            </Field>
            <Field label="File name" error={documentForm.formState.errors.fileName?.message}>
              <Input {...documentForm.register("fileName")} />
            </Field>
            <Field label="MIME type" error={documentForm.formState.errors.mimeType?.message}>
              <Input {...documentForm.register("mimeType")} />
            </Field>
            <Field label="Size bytes" error={documentForm.formState.errors.sizeBytes?.message}>
              <Input {...documentForm.register("sizeBytes")} type="number" />
            </Field>
            <Field label="Object key" error={documentForm.formState.errors.objectKey?.message}>
              <Input {...documentForm.register("objectKey")} />
            </Field>
          </div>
          <div className="flex justify-end">
            <Button disabled={createDocument.isPending} type="submit">{createDocument.isPending ? "Adding" : "Add document"}</Button>
          </div>
        </form>
      </Panel>
    </div>
  );
}

function emptyToUndefined<T extends Record<string, unknown>>(values: T) {
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value === "" ? undefined : value]));
}
