/**
 * TinyPayroll — PDF Payslip Generator
 * Pure client-side. Uses jsPDF + jsPDF-AutoTable + JSZip.
 */

import type { PayrollCalc, EnrichedEmployee, BusinessWithCountry } from "@/app/(dashboard)/dashboard/payroll/new/types";
import { formatCurrency } from "@/lib/payroll/formatCurrency";

// ── Lazy imports (browser-only libs) ─────────────────────────────────────────
async function getJsPDF() {
  const { default: JsPDF } = await import("jspdf");
  await import("jspdf-autotable");
  return JsPDF;
}
async function getJSZip() {
  const { default: JSZip } = await import("jszip");
  return JSZip;
}

// ── Date helpers ──────────────────────────────────────────────────────────────
function fmtDate(iso: string, cc: string): string {
  const d = new Date(iso + "T00:00:00");
  if (cc === "IN") {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${dd}/${mm}/${d.getFullYear()}`;
  }
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${d.getFullYear()}`;
}

function monthYear(iso: string, cc: string): string {
  const d = new Date(iso + "T00:00:00");
  if (cc === "IN") {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${months[d.getMonth()]}-${d.getFullYear()}`;
  }
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${mm}-${d.getFullYear()}`;
}

function filename(empName: string, periodStart: string, cc: string): string {
  const name = empName.replace(/\s+/g, "_");
  return `Payslip_${name}_${monthYear(periodStart, cc)}.pdf`;
}

// ── Colour palette ────────────────────────────────────────────────────────────
const C = {
  ink:    [23,  33,  31] as [number, number, number],
  moss:   [82,  103, 92] as [number, number, number],
  payroll:[15,  107, 79] as [number, number, number],
  cream:  [248, 243, 232] as [number, number, number],
  white:  [255, 255, 255] as [number, number, number],
  red:    [185, 28,  28] as [number, number, number],
  light:  [240, 247, 244] as [number, number, number],
};

// ── Core PDF builder ──────────────────────────────────────────────────────────
export type PayslipData = {
  business: BusinessWithCountry;
  employee: EnrichedEmployee;
  calc: PayrollCalc & {
    // extended fields from full engine result
    hours_worked?: number;
    overtime_hours?: number;
    bonus_amount?: number;
    employer_social_security?: number;
    employer_medicare?: number;
    employer_pf?: number;
    employer_esi?: number;
  };
  periodStart: string;
  periodEnd: string;
};

export async function generatePayslipPDF(data: PayslipData): Promise<Blob> {
  const JsPDF = await getJsPDF();
  const doc = new JsPDF({ unit: "mm", format: "a4" });
  // jspdf-autotable augments the doc prototype at runtime
  // eslint-disable-next-line
  const tbl = (doc as Record<string, unknown>).autoTable as Function;
  const boundTbl = tbl.bind(doc);

  const { business, employee, calc, periodStart, periodEnd } = data;
  const cc = business.country_code ?? "US";
  const cur = (n: number) => formatCurrency(n, cc);
  const PAGE_W = 210;
  const MARGIN = 14;
  const COL_W = PAGE_W - MARGIN * 2;

  let y = MARGIN;

  // ── HEADER ─────────────────────────────────────────────────────────────────
  // Left: business name + state
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.ink);
  doc.text(business.name, MARGIN, y);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.moss);
  doc.text(business.state ?? "", MARGIN, y + 5);

  // Right: TinyPayroll branding
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.payroll);
  doc.text("TinyPayroll", PAGE_W - MARGIN, y, { align: "right" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.moss);
  doc.text("Official Payslip", PAGE_W - MARGIN, y + 5, { align: "right" });

  y += 12;
  // Full-width divider
  doc.setDrawColor(...C.payroll);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 6;

  // ── EMPLOYEE INFO ROW ──────────────────────────────────────────────────────
  doc.setFillColor(...C.cream);
  doc.roundedRect(MARGIN, y, COL_W, 14, 2, 2, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.ink);
  doc.text(employee.name, MARGIN + 4, y + 5.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.moss);
  doc.text(
    `${employee.pay_type === "hourly" ? "Hourly" : "Salaried"} Employee`,
    MARGIN + 4, y + 10
  );

  const periodLabel = `Pay Period: ${fmtDate(periodStart, cc)} – ${fmtDate(periodEnd, cc)}`;
  doc.setFontSize(8);
  doc.text(periodLabel, PAGE_W - MARGIN - 4, y + 5.5, { align: "right" });

  y += 20;

  // ── EARNINGS TABLE ─────────────────────────────────────────────────────────
  const overtimeAmt = (calc.overtime_hours ?? 0) > 0
    ? calc.gross_pay - (calc.gross_pay / ((calc.overtime_hours ?? 0) * 1.5 + (calc.hours_worked ?? 0) || 1)) * (calc.hours_worked ?? 0)
    : 0;
  const bonusAmt = calc.bonus_amount ?? 0;
  const basePay = calc.gross_pay - bonusAmt - (overtimeAmt > 0 ? overtimeAmt : 0);

  const earningsRows: [string, string][] = [["Base Pay", cur(Math.max(0, basePay))]];
  if ((calc.overtime_hours ?? 0) > 0) {
    earningsRows.push([`Overtime Pay (${calc.overtime_hours ?? 0} hrs × 1.5×)`, cur(overtimeAmt)]);
  }
  if (bonusAmt > 0) {
    earningsRows.push(["Bonus", cur(bonusAmt)]);
  }

  boundTbl({
    startY: y,
    head: [["Earnings", "Amount"]],
    body: earningsRows,
    foot: [["Gross Pay", cur(calc.gross_pay)]],
    margin: { left: MARGIN, right: MARGIN },
    styles: { fontSize: 9, cellPadding: 3, textColor: C.ink },
    headStyles: { fillColor: C.payroll, textColor: C.white, fontStyle: "bold", fontSize: 9 },
    footStyles: { fillColor: C.light, textColor: C.ink, fontStyle: "bold", fontSize: 9 },
    columnStyles: { 1: { halign: "right" } },
    theme: "grid",
  });

  y = ((doc as Record<string, unknown>).lastAutoTable as { finalY: number }).finalY + 6;

  // ── DEDUCTIONS TABLE ───────────────────────────────────────────────────────
  const deductionRows: [string, string][] = [];

  if (cc === "US") {
    deductionRows.push(["Federal Income Tax", cur(calc.federal_tax ?? 0)]);
    deductionRows.push(["Social Security (6.2%)", cur(calc.social_security ?? 0)]);
    deductionRows.push(["Medicare (1.45%)", cur(calc.medicare ?? 0)]);
  } else {
    deductionRows.push(["TDS", cur(calc.tds ?? 0)]);
    deductionRows.push(["Provident Fund (12%)", cur(calc.employee_pf ?? 0)]);
    if ((calc.employee_esi ?? 0) > 0) {
      deductionRows.push(["ESI (0.75%)", cur(calc.employee_esi ?? 0)]);
    }
    if ((calc.professional_tax ?? 0) > 0) {
      deductionRows.push(["Professional Tax", cur(calc.professional_tax ?? 0)]);
    }
  }

  boundTbl({
    startY: y,
    head: [["Deductions", "Amount"]],
    body: deductionRows,
    foot: [["Total Deductions", cur(calc.total_deductions)]],
    margin: { left: MARGIN, right: MARGIN },
    styles: { fontSize: 9, cellPadding: 3, textColor: C.ink },
    headStyles: { fillColor: C.red, textColor: C.white, fontStyle: "bold", fontSize: 9 },
    footStyles: { fillColor: [254, 242, 242] as [number,number,number], textColor: C.red, fontStyle: "bold", fontSize: 9 },
    columnStyles: { 1: { halign: "right" } },
    theme: "grid",
  });

  y = ((doc as Record<string, unknown>).lastAutoTable as { finalY: number }).finalY + 6;

  // ── NET PAY BOX ────────────────────────────────────────────────────────────
  doc.setFillColor(...C.payroll);
  doc.roundedRect(MARGIN, y, COL_W, 18, 3, 3, "F");
  doc.setTextColor(...C.white);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("NET PAY", MARGIN + 6, y + 7);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(cur(calc.net_pay), PAGE_W - MARGIN - 6, y + 11, { align: "right" });

  y += 25;

  // ── EMPLOYER COST SECTION ──────────────────────────────────────────────────
  const employerRows: [string, string][] = [];

  if (cc === "US") {
    employerRows.push(["Employer SS Match", cur(calc.employer_social_security ?? 0)]);
    employerRows.push(["Employer Medicare Match", cur(calc.employer_medicare ?? 0)]);
  } else {
    employerRows.push(["Employer PF Contribution", cur(calc.employer_pf ?? 0)]);
    if ((calc.employer_esi ?? 0) > 0) {
      employerRows.push(["Employer ESI Contribution", cur(calc.employer_esi ?? 0)]);
    }
  }

  boundTbl({
    startY: y,
    head: [["Employer Cost Breakdown (For Business Owner)", "Amount"]],
    body: employerRows,
    foot: [["Total Employer Cost", cur(calc.employer_total_cost)]],
    margin: { left: MARGIN, right: MARGIN },
    styles: { fontSize: 8, cellPadding: 2.5, textColor: C.moss },
    headStyles: { fillColor: C.cream, textColor: C.moss, fontStyle: "bold", fontSize: 8 },
    footStyles: { fillColor: C.cream, textColor: C.ink, fontStyle: "bold", fontSize: 8 },
    columnStyles: { 1: { halign: "right" } },
    theme: "grid",
  });

  y = ((doc as Record<string, unknown>).lastAutoTable as { finalY: number }).finalY + 8;

  // ── FOOTER ─────────────────────────────────────────────────────────────────
  doc.setDrawColor(...C.moss);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 5;

  const today = new Date().toLocaleDateString(cc === "IN" ? "en-IN" : "en-US", {
    day: "2-digit", month: "short", year: "numeric",
  });
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.moss);
  doc.text("This is a system-generated payslip by TinyPayroll", MARGIN, y);
  doc.text(`Generated on: ${today}`, MARGIN, y + 4.5);
  doc.text("Confidential — For employee use only", MARGIN, y + 9);

  return doc.output("blob") as Blob;
}

// ── Single download trigger ───────────────────────────────────────────────────
export async function downloadPayslip(data: PayslipData): Promise<void> {
  const blob = await generatePayslipPDF(data);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename(data.employee.name, data.periodStart, data.business.country_code ?? "US");
  a.click();
  URL.revokeObjectURL(url);
}

// ── Bulk ZIP download ─────────────────────────────────────────────────────────
export async function downloadAllPayslipsAsZip(
  payslips: PayslipData[],
  businessName: string,
  periodStart: string,
  cc: string
): Promise<void> {
  const JSZip = await getJSZip();
  const zip = new JSZip();

  await Promise.all(
    payslips.map(async (data) => {
      const blob = await generatePayslipPDF(data);
      zip.file(filename(data.employee.name, data.periodStart, cc), blob);
    })
  );

  const content = await zip.generateAsync({ type: "blob" });
  const safeName = businessName.replace(/\s+/g, "_");
  const period = monthYear(periodStart, cc);
  const url = URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  a.download = `TinyPayroll_${safeName}_${period}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
