// Type augmentation for jspdf-autotable
import "jspdf";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: Record<string, unknown>) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}
