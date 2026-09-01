/**
 * TASK 32 — HR LETTER GENERATOR ENGINE
 * Automatically merges employee profile, employment history, CTC, and designation data into official letter templates.
 */

export interface LetterEmployeeContext {
  fullName: string;
  employeeCode: string;
  designation: string;
  department: string;
  joiningDate: string;
  relievingDate?: string;
  annualCtc?: number;
  monthlyGross?: number;
  companyName: string;
  companyAddress: string;
  currentDate: string;
}

export type LetterTypeEnum =
  | "EMPLOYMENT_CONFIRMATION"
  | "EXPERIENCE_LETTER"
  | "PROMOTION_LETTER"
  | "SALARY_CERTIFICATE"
  | "ADDRESS_PROOF"
  | "INTERNSHIP_LETTER"
  | "RELIEVING_LETTER";

export class LetterGeneratorEngine {
  /**
   * Default template definitions for official company letters.
   */
  static getTemplate(type: LetterTypeEnum): string {
    switch (type) {
      case "EMPLOYMENT_CONFIRMATION":
        return `TO WHOMSOEVER IT MAY CONCERN

Date: {{currentDate}}

This is to certify that {{fullName}} (Employee ID: {{employeeCode}}) is a bonafide full-time employee of {{companyName}}.

Details of Employment:
- Designation: {{designation}}
- Department: {{department}}
- Date of Joining: {{joiningDate}}
- Employment Status: Permanent / Confirmed

This certificate is issued upon the request of the employee for official records.

Sincerely,
Human Resources Department
{{companyName}}`;

      case "SALARY_CERTIFICATE":
        return `SALARY & EMPLOYMENT CERTIFICATE

Date: {{currentDate}}

This is to certify that {{fullName}} (Employee ID: {{employeeCode}}) is employed with {{companyName}} as {{designation}} in the {{department}} department since {{joiningDate}}.

Compensation Breakdown:
- Annual CTC: ₹{{annualCtc}} per annum
- Monthly Gross Salary: ₹{{monthlyGross}} per month

This certificate is issued at the request of the employee for banking/loan/visa facilitation.

Authorized Signatory,
{{companyName}}`;

      case "EXPERIENCE_LETTER":
        return `EXPERIENCE & SERVICE CERTIFICATE

Date: {{currentDate}}

This is to certify that {{fullName}} was employed with {{companyName}} from {{joiningDate}} to {{relievingDate}} as {{designation}}.

During their tenure in the {{department}} department, {{fullName}} demonstrated high dedication, professional integrity, and exemplary performance.

We wish them all success in their future professional endeavors.

Human Resources Department
{{companyName}}`;

      case "PROMOTION_LETTER":
        return `PROMOTION & APPRAISAL APPOINTMENT LETTER

Date: {{currentDate}}

Dear {{fullName}},

We are pleased to inform you that in recognition of your stellar contributions to {{companyName}}, you have been promoted to {{designation}} in the {{department}} department.

Your revised Annual CTC is ₹{{annualCtc}} effective immediately. All other employment terms remain in full force.

Congratulations on this well-deserved milestone!

Management & HR,
{{companyName}}`;

      default:
        return `OFFICIAL VERIFICATION LETTER

Date: {{currentDate}}

This letter confirms that {{fullName}} (Employee ID: {{employeeCode}}) is currently associated with {{companyName}} as {{designation}} in the {{department}} department.

Human Resources Department
{{companyName}}`;
    }
  }

  /**
   * Merge employee context variables into template text.
   */
  static renderLetter(type: LetterTypeEnum, context: LetterEmployeeContext): { title: string; content: string } {
    let template = this.getTemplate(type);

    const replacements: Record<string, string> = {
      "{{fullName}}": context.fullName,
      "{{employeeCode}}": context.employeeCode,
      "{{designation}}": context.designation,
      "{{department}}": context.department,
      "{{joiningDate}}": context.joiningDate,
      "{{relievingDate}}": context.relievingDate || "Present",
      "{{annualCtc}}": context.annualCtc ? context.annualCtc.toLocaleString("en-IN") : "N/A",
      "{{monthlyGross}}": context.monthlyGross ? context.monthlyGross.toLocaleString("en-IN") : "N/A",
      "{{companyName}}": context.companyName,
      "{{companyAddress}}": context.companyAddress,
      "{{currentDate}}": context.currentDate
    };

    for (const [placeholder, value] of Object.entries(replacements)) {
      template = template.replaceAll(placeholder, value);
    }

    const titleMap: Record<LetterTypeEnum, string> = {
      EMPLOYMENT_CONFIRMATION: `Employment Confirmation Letter - ${context.fullName}`,
      EXPERIENCE_LETTER: `Experience & Relieving Letter - ${context.fullName}`,
      PROMOTION_LETTER: `Promotion Letter - ${context.fullName}`,
      SALARY_CERTIFICATE: `Salary Certificate - ${context.fullName}`,
      ADDRESS_PROOF: `Address Verification Letter - ${context.fullName}`,
      INTERNSHIP_LETTER: `Internship Certificate - ${context.fullName}`,
      RELIEVING_LETTER: `Relieving Certificate - ${context.fullName}`
    };

    return {
      title: titleMap[type] || `HR Letter - ${context.fullName}`,
      content: template
    };
  }
}
