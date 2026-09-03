import { Prisma } from "@prisma/client";

/**
 * Authoritative Payroll Money & Rounding Policy (Task 05.2)
 *
 * POLICY CONTRACT:
 * - Precision Engine: Prisma.Decimal (arbitrary-precision decimal arithmetic)
 * - Standard Scale: 2 decimal places (cents/paise)
 * - Rounding Mode: ROUND_HALF_UP (standard financial accounting)
 * - Currencies: Tenant-configured (defaults to INR; also supports USD, EUR, GBP)
 *   All currently supported tenant currencies utilize 2 minor unit digits.
 * - Proration: Multiplies monthly component by payableDays first, then divides by
 *   workingDays before rounding to 2 decimal places, preventing intermediate rational truncation.
 */
export class PayrollMoney {
  static readonly SCALE = 2;
  static readonly ROUNDING_MODE = Prisma.Decimal.ROUND_HALF_UP;

  /**
   * Convert any numeric/string/Decimal input into an authoritative Prisma.Decimal
   */
  static toDecimal(val: Prisma.Decimal | number | string | null | undefined): Prisma.Decimal {
    if (val === null || val === undefined || val === "") {
      return new Prisma.Decimal(0);
    }
    if (val instanceof Prisma.Decimal) {
      return val;
    }
    return new Prisma.Decimal(val);
  }

  /**
   * Round to standard payroll financial scale (2 decimal places, ROUND_HALF_UP)
   */
  static round(d: Prisma.Decimal | number | string): Prisma.Decimal {
    const dec = this.toDecimal(d);
    return dec.toDecimalPlaces(this.SCALE, this.ROUNDING_MODE);
  }

  /**
   * Add two monetary values with decimal precision
   */
  static add(
    a: Prisma.Decimal | number | string,
    b: Prisma.Decimal | number | string
  ): Prisma.Decimal {
    return this.toDecimal(a).add(this.toDecimal(b));
  }

  /**
   * Subtract two monetary values with decimal precision
   */
  static sub(
    a: Prisma.Decimal | number | string,
    b: Prisma.Decimal | number | string
  ): Prisma.Decimal {
    return this.toDecimal(a).sub(this.toDecimal(b));
  }

  /**
   * Multiply monetary value by a factor or percentage
   */
  static mul(
    a: Prisma.Decimal | number | string,
    factor: Prisma.Decimal | number | string
  ): Prisma.Decimal {
    return this.toDecimal(a).mul(this.toDecimal(factor));
  }

  /**
   * Divide monetary value by an integer or decimal denominator
   */
  static div(
    a: Prisma.Decimal | number | string,
    divisor: Prisma.Decimal | number | string
  ): Prisma.Decimal {
    const div = this.toDecimal(divisor);
    if (div.isZero()) {
      return new Prisma.Decimal(0);
    }
    return this.toDecimal(a).div(div);
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
    const wDays = this.toDecimal(workingDays);
    const pDays = this.toDecimal(payableDays);
    const amount = this.toDecimal(monthlyAmount);

    if (wDays.isZero() || pDays.isZero() || amount.isZero()) {
      return new Prisma.Decimal(0);
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
    let total = new Prisma.Decimal(0);
    for (const item of items) {
      total = total.add(this.toDecimal(item));
    }
    return total;
  }
}
