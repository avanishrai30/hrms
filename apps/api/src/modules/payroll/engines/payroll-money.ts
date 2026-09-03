import { BadRequestException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

/**
 * Authoritative Payroll Money & Rounding Policy (Task 05.3)
 *
 * POLICY CONTRACT:
 * - Precision Engine: Prisma.Decimal (arbitrary-precision decimal arithmetic)
 * - Standard Scale: 2 decimal places (cents/paise)
 * - Rounding Mode: ROUND_HALF_UP (standard financial accounting)
 * - Currencies: Tenant-configured (strict required tenant currency; supports INR, USD, EUR, GBP). No automatic INR default.
 *   All currently supported tenant currencies utilize 2 minor unit digits.
 * - Missing Values: strictly rejected by requireDecimal() (null, undefined, "", NaN).
 * - Deliberate Zero: zero() or valid numeric 0 / "0" / "0.00".
 * - Division by Zero: rejected with BadRequestException at primitive level.
 */
export class PayrollMoney {
  static readonly SCALE = 2;
  static readonly ROUNDING_MODE = Prisma.Decimal.ROUND_HALF_UP;

  /**
   * Deliberate zero initializer
   */
  static zero(): Prisma.Decimal {
    return new Prisma.Decimal(0);
  }

  /**
   * Authoritative money parser. Requires valid numeric input.
   * Rejects null, undefined, empty string, NaN, non-numeric strings with BadRequestException.
   * Deliberate zeros (0, "0", 0.00, "0.00") remain valid.
   */
  static requireDecimal(
    val: Prisma.Decimal | number | string | null | undefined,
    fieldName = "financial value"
  ): Prisma.Decimal {
    if (val === null || val === undefined || val === "") {
      throw new BadRequestException(`Missing or unavailable ${fieldName}: financial value is required.`);
    }
    if (val instanceof Prisma.Decimal) {
      if (val.isNaN()) {
        throw new BadRequestException(`Invalid ${fieldName}: value is NaN.`);
      }
      return val;
    }
    if (typeof val === "number") {
      if (!Number.isFinite(val)) {
        throw new BadRequestException(`Invalid ${fieldName}: value must be a finite number.`);
      }
      return new Prisma.Decimal(val);
    }
    if (typeof val === "string") {
      const trimmed = val.trim();
      if (trimmed === "" || isNaN(Number(trimmed))) {
        throw new BadRequestException(`Invalid ${fieldName}: "${val}" is not a valid monetary number.`);
      }
      return new Prisma.Decimal(trimmed);
    }
    throw new BadRequestException(`Invalid ${fieldName}: unsupported value type.`);
  }

  /**
   * Optional decimal conversion (null/undefined returns null)
   */
  static toDecimalOrNull(
    val: Prisma.Decimal | number | string | null | undefined
  ): Prisma.Decimal | null {
    if (val === null || val === undefined || val === "") {
      return null;
    }
    return this.requireDecimal(val);
  }

  /**
   * Round to standard payroll financial scale (2 decimal places, ROUND_HALF_UP)
   */
  static round(d: Prisma.Decimal | number | string): Prisma.Decimal {
    const dec = this.requireDecimal(d, "amount to round");
    return dec.toDecimalPlaces(this.SCALE, this.ROUNDING_MODE);
  }

  /**
   * Add two monetary values with decimal precision
   */
  static add(
    a: Prisma.Decimal | number | string,
    b: Prisma.Decimal | number | string
  ): Prisma.Decimal {
    return this.requireDecimal(a, "addend a").add(this.requireDecimal(b, "addend b"));
  }

  /**
   * Subtract two monetary values with decimal precision
   */
  static sub(
    a: Prisma.Decimal | number | string,
    b: Prisma.Decimal | number | string
  ): Prisma.Decimal {
    return this.requireDecimal(a, "minuend").sub(this.requireDecimal(b, "subtrahend"));
  }

  /**
   * Multiply monetary value by a factor or percentage
   */
  static mul(
    a: Prisma.Decimal | number | string,
    factor: Prisma.Decimal | number | string
  ): Prisma.Decimal {
    return this.requireDecimal(a, "multiplicand").mul(this.requireDecimal(factor, "multiplier"));
  }

  /**
   * Divide monetary value by an integer or decimal denominator.
   * Throws BadRequestException if divisor is zero.
   */
  static div(
    a: Prisma.Decimal | number | string,
    divisor: Prisma.Decimal | number | string
  ): Prisma.Decimal {
    const div = this.requireDecimal(divisor, "divisor");
    if (div.isZero()) {
      throw new BadRequestException("Division by zero in payroll financial arithmetic.");
    }
    return this.requireDecimal(a, "dividend").div(div);
  }

  /**
   * Prorate a monthly component amount based on payable days and working days.
   * Multiplies before dividing to preserve rational accuracy, then rounds once.
   */
  static prorateComponent(
    monthlyAmount: Prisma.Decimal | number | string,
    payableDays: Prisma.Decimal | number | string,
    workingDays: Prisma.Decimal | number | string
  ): Prisma.Decimal {
    const wDays = this.requireDecimal(workingDays, "working days");
    const pDays = this.requireDecimal(payableDays, "payable days");
    const amount = this.requireDecimal(monthlyAmount, "component monthly amount");

    if (wDays.isZero() || pDays.isZero() || amount.isZero()) {
      return this.zero();
    }

    // Ratio = min(1, payableDays / workingDays)
    const effectiveDays = pDays.greaterThan(wDays) ? wDays : pDays;

    return amount
      .mul(effectiveDays)
      .div(wDays)
      .toDecimalPlaces(this.SCALE, this.ROUNDING_MODE);
  }

  /**
   * Sum an array of monetary values precisely
   */
  static sum(items: Array<Prisma.Decimal | number | string>): Prisma.Decimal {
    let total = this.zero();
    for (const item of items) {
      total = total.add(this.requireDecimal(item, "sum item"));
    }
    return total;
  }
}
