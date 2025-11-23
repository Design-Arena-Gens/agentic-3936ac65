import type { jsPDF } from "jspdf";

declare module "jspdf-autotable" {
  export interface AutoTableInput {
    startY?: number;
    head?: (string | string[])[];
    body?: (string | number | boolean | null | undefined)[][];
    theme?: "striped" | "grid" | "plain";
    styles?: {
      fontSize?: number;
      cellPadding?: number | [number, number, number, number];
    };
  }

  export default function autoTable(doc: jsPDF, options: AutoTableInput): void;
}

declare module "jspdf" {
  interface jsPDF {
    lastAutoTable?: {
      finalY: number;
    };
  }
}

