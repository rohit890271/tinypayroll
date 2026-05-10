export type PayType = "hourly" | "salary";
export type TaxFilingStatus = "single" | "married";

export type EmployeeFormInput = {
  businessId: string;
  name: string;
  email: string;
  payType: PayType;
  hourlyRate?: string | null;
  annualSalary?: string | null;
  taxFilingStatus: TaxFilingStatus;
};

export type EmployeeInsertPayload = {
  business_id: string;
  name: string;
  email: string;
  pay_type: PayType;
  hourly_rate: number | null;
  annual_salary: number | null;
  tax_filing_status: TaxFilingStatus;
};

function parseMoney(value: string | null | undefined, fieldName: string): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${fieldName} must be a non-negative number.`);
  }

  return parsed;
}

export function buildEmployeeInsert(input: EmployeeFormInput): EmployeeInsertPayload {
  const base = {
    business_id: input.businessId,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    pay_type: input.payType,
    tax_filing_status: input.taxFilingStatus
  };

  if (input.payType === "hourly") {
    return {
      ...base,
      hourly_rate: parseMoney(input.hourlyRate, "Hourly rate"),
      annual_salary: null
    };
  }

  return {
    ...base,
    hourly_rate: null,
    annual_salary: parseMoney(input.annualSalary, "Annual salary")
  };
}