"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function EmployeeForm({ action }: { action: (formData: FormData) => Promise<void> }) {
  const [payType, setPayType] = useState<"hourly" | "salary">("hourly");

  return (
    <form action={action} className="grid gap-5 rounded-[2rem] border border-ink/10 bg-white/85 p-6 shadow-soft">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Employee name" name="name" required />
        <Input label="Email" name="email" type="email" required />
      </div>

      <fieldset className="grid gap-3">
        <legend className="text-sm font-semibold text-ink">Pay type</legend>
        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-cream p-2">
          {(["hourly", "salary"] as const).map((type) => (
            <label key={type} className={`cursor-pointer rounded-xl px-4 py-3 text-center text-sm font-bold capitalize transition ${payType === type ? "bg-payroll text-white" : "text-moss hover:bg-white"}`}>
              <input
                className="sr-only"
                type="radio"
                name="payType"
                value={type}
                checked={payType === type}
                onChange={() => setPayType(type)}
              />
              {type}
            </label>
          ))}
        </div>
      </fieldset>

      {payType === "hourly" ? (
        <Input label="Hourly rate" name="hourlyRate" type="number" min="0" step="0.01" required />
      ) : (
        <Input label="Annual salary" name="annualSalary" type="number" min="0" step="0.01" required />
      )}

      <Select label="Tax filing status" name="taxFilingStatus" defaultValue="single" required>
        <option value="single">Single</option>
        <option value="married">Married</option>
      </Select>

      <Button type="submit">Add Another</Button>
    </form>
  );
}