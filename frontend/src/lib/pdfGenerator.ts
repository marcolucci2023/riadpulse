import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GlobalAuditResponse } from "./api";

const MODULE_NAMES: Record<string, string> = {
  site_web: "Site Web",
  reputation: "Reputation en ligne",
  pricing: "Pricing & Positionnement",
  commissions: "Commissions OTA",
};

function fmt(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function generatePDF(data: GlobalAuditResponse) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const today = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // ===== HEADER TERRACOTTA =====
  doc.setFillColor(194, 69, 45);
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("RiadPulse", 14, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Audit digital pour riads et hotels independants", 14, 28);
  doc.text("Date : " + today, pageWidth - 14, 28, { align: "right" });

  // ===== INFOS DU RIAD =====
  doc.setTextColor(27, 42, 74);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(data.riad_name, 14, 52);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(data.city + " | Audit complet", 14, 58);

  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(14, 63, pageWidth - 14, 63);

  // ===== ENCADRE SCORE GLOBAL =====
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(14, 68, pageWidth - 28, 38, 3, 3, "F");

  doc.setTextColor(194, 69, 45);
  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  doc.text("" + data.global_score, 24, 90);

  doc.setFontSize(14);
  doc.setTextColor(150, 150, 150);
  doc.text("/100", 62, 90);

  doc.setFillColor(
    data.grade === "A" ? 46 : data.grade === "B" ? 101 : data.grade === "C" ? 234 : 220,
    data.grade === "A" ? 125 : data.grade === "B" ? 163 : data.grade === "C" ? 179 : 53,
    data.grade === "A" ? 50 : data.grade === "B" ? 13 : data.grade === "C" ? 8 : 69
  );
  doc.roundedRect(78, 76, 16, 16, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(data.grade, 86, 87, { align: "center" });

  if (data.total_annual_loss_mad > 0) {
    doc.setTextColor(194, 69, 45);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("MANQUE A GAGNER ANNUEL ESTIME", pageWidth - 24, 78, { align: "right" });

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(fmt(data.total_annual_loss_mad) + " MAD/an", pageWidth - 24, 86, { align: "right" });

    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.setFont("helvetica", "normal");
    doc.text("soit env. " + fmt(data.total_annual_loss_eur) + " EUR/an", pageWidth - 24, 93, { align: "right" });
  }

  doc.setTextColor(80, 80, 80);
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text(data.city_position, 14, 113);

  // ===== TABLEAU DES SOUS-SCORES =====
  doc.setTextColor(27, 42, 74);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Detail par module", 14, 123);

  const subScoreRows = Object.entries(data.sub_scores).map(([key, sub]) => [
    MODULE_NAMES[key] || key,
    Math.round(sub.weight * 100) + "%",
    sub.score + "/100",
    sub.grade,
    sub.weighted_score + " pts",
  ]);

  autoTable(doc, {
    startY: 126,
    head: [["Module", "Ponderation", "Score", "Grade", "Points apportes"]],
    body: subScoreRows,
    theme: "striped",
    headStyles: {
      fillColor: [27, 42, 74],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: "bold",
    },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { cellWidth: 30, halign: "center" },
      2: { cellWidth: 30, halign: "center" },
      3: { cellWidth: 25, halign: "center" },
      4: { cellWidth: 35, halign: "center" },
    },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 180;

  // ===== TABLEAU DES PRIORITES =====
  if (data.top_priorities.length > 0) {
    doc.setTextColor(27, 42, 74);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Plan d'action prioritaire", 14, finalY + 10);

    const priorityRows = data.top_priorities.map((p) => [
      "#" + p.rank,
      p.module,
      p.title,
      "+" + fmt(p.impact_mad) + " MAD",
      p.difficulty,
    ]);

    autoTable(doc, {
      startY: finalY + 13,
      head: [["#", "Module", "Action recommandee", "Gain estime", "Difficulte"]],
      body: priorityRows,
      theme: "striped",
      headStyles: {
        fillColor: [194, 69, 45],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: "bold",
      },
      styles: { fontSize: 8.5, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 28 },
        2: { cellWidth: 80 },
        3: { cellWidth: 35, halign: "right" },
        4: { cellWidth: 25, halign: "center" },
      },
      margin: { left: 14, right: 14 },
    });
  }

  // ===== FOOTER =====
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(14, pageHeight - 18, pageWidth - 14, pageHeight - 18);

  doc.setTextColor(130, 130, 130);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Audit genere par RiadPulse - Plateforme d'audit digital pour riads au Maroc",
    14,
    pageHeight - 12
  );
  doc.text(
    "contact@riadpulse.ma | riadpulse.ma",
    pageWidth - 14,
    pageHeight - 12,
    { align: "right" }
  );

  const filename = "RiadPulse_Audit_" + data.riad_name.replace(/[^a-zA-Z0-9]/g, "_") + ".pdf";
  doc.save(filename);
}