import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GlobalAuditResponse } from "./api";

interface FormData {
  riad_name: string;
  city: string;
  stars: number;
  url: string;
  current_price_mad: number;
  num_rooms: number;
  occupancy_rate: number;
  annual_revenue_mad: number;
  booking_percent: number;
  airbnb_percent: number;
  expedia_percent: number;
  direct_percent: number;
  booking_score: number;
  booking_reviews: number;
  tripadvisor_score: number;
  tripadvisor_reviews: number;
  google_score: number;
  google_reviews: number;
  response_rate_percent: number;
}

const MODULE_NAMES: Record<string, string> = {
  site_web: "Visibilite",
  reputation: "Reputation",
  pricing: "Prix",
  commissions: "Reservations directes",
};

function fmt(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function addFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(14, ph - 16, pw - 14, ph - 16);
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("RiadPulse - Audit digital pour riads au Maroc", 14, ph - 10);
  doc.text("contact@riadpulse.ma | Page " + pageNum + "/" + totalPages, pw - 14, ph - 10, { align: "right" });
}

function addHeader(doc: jsPDF, riadName: string, city: string, date: string) {
  const pw = doc.internal.pageSize.getWidth();
  doc.setFillColor(194, 69, 45);
  doc.rect(0, 0, pw, 32, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("RiadPulse", 14, 16);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Audit digital pour riads et hotels independants au Maroc", 14, 24);
  doc.text(riadName + " - " + city + " | " + date, pw - 14, 24, { align: "right" });
}

export function generatePDF(data: GlobalAuditResponse, form: FormData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const today = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const TOTAL_PAGES = 10;

  // ============================================================
  // PAGE 1 : PAGE DE GARDE
  // ============================================================
  doc.setFillColor(10, 22, 40);
  doc.rect(0, 0, pw, ph, "F");

  // Ligne terracotta en haut
  doc.setFillColor(231, 111, 81);
  doc.rect(0, 0, pw, 4, "F");

  // Logo RiadPulse
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(42);
  doc.setFont("helvetica", "bold");
  doc.text("RiadPulse", pw / 2, 80, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(244, 162, 97);
  doc.text("Audit Digital Complet", pw / 2, 92, { align: "center" });

  // Ligne de séparation
  doc.setDrawColor(231, 111, 81);
  doc.setLineWidth(0.5);
  doc.line(pw / 2 - 30, 100, pw / 2 + 30, 100);

  // Nom du riad
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(form.riad_name, pw / 2, 120, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 190, 210);
  doc.text(form.city + " | " + form.stars + " etoiles | " + form.num_rooms + " chambres", pw / 2, 130, { align: "center" });

  // Score box
  doc.setFillColor(15, 29, 50);
  doc.roundedRect(pw / 2 - 35, 142, 70, 30, 3, 3, "F");
  doc.setDrawColor(244, 162, 97);
  doc.setLineWidth(0.5);
  doc.roundedRect(pw / 2 - 35, 142, 70, 30, 3, 3, "S");

  doc.setTextColor(244, 162, 97);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("" + data.global_score, pw / 2 - 8, 162, { align: "center" });
  doc.setFontSize(12);
  doc.setTextColor(120, 140, 170);
  doc.text("/100", pw / 2 + 18, 162, { align: "center" });

  // Grade
  const gc = data.grade === "A" ? [46, 125, 50] : data.grade === "B" ? [101, 163, 13] : data.grade === "C" ? [234, 179, 8] : data.grade === "D" ? [220, 120, 30] : [200, 50, 50];
  doc.setFillColor(gc[0], gc[1], gc[2]);
  doc.roundedRect(pw / 2 + 22, 148, 10, 10, 1, 1, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(data.grade, pw / 2 + 27, 155, { align: "center" });

  // Date et auditeur
  doc.setTextColor(120, 140, 170);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Date de l'audit : " + today, pw / 2, 190, { align: "center" });
  doc.text("Auditeur : RiadPulse v1.0", pw / 2, 197, { align: "center" });
  doc.text("Type : Audit digital automatise", pw / 2, 204, { align: "center" });

  // Perte
  if (data.total_annual_loss_mad > 0) {
    doc.setFillColor(200, 50, 50);
    doc.setFillColor(200, 50, 50, 30);
    doc.roundedRect(pw / 2 - 45, 215, 90, 16, 2, 2, "F");
    doc.setTextColor(255, 120, 120);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("MANQUE A GAGNER ESTIME", pw / 2, 222, { align: "center" });
    doc.setFontSize(11);
    doc.setTextColor(255, 180, 180);
    doc.text(fmt(data.total_annual_loss_mad) + " MAD/an", pw / 2, 228, { align: "center" });
  }

  // Footer garde
  doc.setTextColor(80, 100, 130);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("Document confidentiel - RiadPulse 2026", pw / 2, ph - 20, { align: "center" });
  doc.text("contact@riadpulse.ma | riadpulse.ma", pw / 2, ph - 14, { align: "center" });

  // ============================================================
  // PAGE 2 : RESUME EXECUTIF
  // ============================================================
  doc.addPage();
  addHeader(doc, form.riad_name, form.city, today);

  doc.setTextColor(27, 42, 74);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Resume executif", 14, 48);

  doc.setFillColor(245, 247, 250);
  doc.roundedRect(14, 54, pw - 28, 35, 3, 3, "F");

  doc.setTextColor(194, 69, 45);
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.text("" + data.global_score, 24, 78);
  doc.setFontSize(12);
  doc.setTextColor(150, 150, 150);
  doc.text("/100", 58, 78);

  doc.setFillColor(gc[0], gc[1], gc[2]);
  doc.roundedRect(72, 66, 14, 14, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(data.grade, 79, 76, { align: "center" });

  if (data.total_annual_loss_mad > 0) {
    doc.setTextColor(194, 69, 45);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("MANQUE A GAGNER ANNUEL", pw - 20, 66, { align: "right" });
    doc.setFontSize(16);
    doc.text(fmt(data.total_annual_loss_mad) + " MAD", pw - 20, 76, { align: "right" });
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.setFont("helvetica", "normal");
    doc.text("environ " + fmt(data.total_annual_loss_eur) + " EUR/an", pw - 20, 82, { align: "right" });
  }

  let y = 98;
  doc.setTextColor(27, 42, 74);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Scores par axe", 14, y);
  y += 6;

  for (const [key, sub] of Object.entries(data.sub_scores)) {
    const name = MODULE_NAMES[key] || key;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(name + " (" + Math.round(sub.weight * 100) + "%)", 14, y);
    doc.setTextColor(27, 42, 74);
    doc.setFont("helvetica", "bold");
    doc.text(sub.score + "/100", 80, y);
    doc.text(sub.grade, 100, y);
    doc.setFillColor(230, 230, 230);
    doc.rect(110, y - 3, 60, 4, "F");
    const bc = sub.score >= 70 ? [46, 125, 50] : sub.score >= 50 ? [234, 179, 8] : [200, 50, 50];
    doc.setFillColor(bc[0], bc[1], bc[2]);
    doc.rect(110, y - 3, 60 * (sub.score / 100), 4, "F");
    y += 7;
  }

  y += 4;
  doc.setTextColor(194, 69, 45);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Top 3 fuites de revenus", 14, y);
  y += 6;

  for (let i = 0; i < Math.min(3, data.top_priorities.length); i++) {
    const p = data.top_priorities[i];
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text((i + 1) + ". " + p.title.substring(0, 65) + " (+" + fmt(p.impact_mad) + " MAD)", 14, y);
    y += 5;
  }

  y += 4;
  doc.setFillColor(240, 248, 240);
  doc.roundedRect(14, y, pw - 28, 14, 2, 2, "F");
  doc.setTextColor(46, 125, 50);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  const roiGain = Math.round(data.total_annual_loss_mad * 0.3);
  doc.text("ROI abonnement : pour 700 MAD/mois (8 400/an), vous recuperez ~" + fmt(roiGain) + " MAD/an", 18, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(80, 120, 80);
  doc.text("en appliquant seulement 2 des 5 actions prioritaires.", 18, y + 11);

  y += 20;
  doc.setTextColor(120, 120, 120);
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text(data.city_position, 14, y);

  addFooter(doc, 2, TOTAL_PAGES);

  // ============================================================
  // PAGE 3 : METHODOLOGIE
  // ============================================================
  doc.addPage();
  addHeader(doc, form.riad_name, form.city, today);

  doc.setTextColor(27, 42, 74);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Methodologie et sources", 14, 48);

  let my = 58;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(194, 69, 45);
  doc.text("Sources de donnees", 14, my);
  my += 6;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(9);
  const sources = [
    "Booking.com : note, nombre d'avis, taux de reponse (donnees declarees)",
    "TripAdvisor : note et volume d'avis (donnees declarees)",
    "Google Business : note et nombre d'avis (donnees declarees)",
    "Site web : audit technique HTTP (HTTPS, vitesse, responsive, technologie)",
    "Tarifs : prix moyen declare (" + fmt(form.current_price_mad) + " MAD) vs medianes par ville",
    "Commissions : taux standard OTA 2024 (Booking 18%, Airbnb 15%, Expedia 20%)",
    "Taux d'occupation : " + Math.round(form.occupancy_rate * 100) + "% | CA annuel : " + fmt(form.annual_revenue_mad) + " MAD (declares)",
  ];
  for (const s of sources) { doc.text("- " + s, 18, my); my += 5; }

  my += 4;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(194, 69, 45);
  doc.setFontSize(10);
  doc.text("Methode de calcul", 14, my);
  my += 6;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(9);
  const methods = [
    "Score global : moyenne ponderee (Reputation 35%, Visibilite 25%, Prix 20%, Reservations directes 20%)",
    "Manque a gagner : somme des gains estimes des 5 actions prioritaires",
    "Benchmark : comparaison avec les medianes par ville (Observatoire du Tourisme Maroc 2024)",
    "Scenarios commissions : calcul du cout reel OTA vs bascule en direct (10/20/30%)",
  ];
  for (const m of methods) { doc.text("- " + m, 18, my); my += 5; }

  my += 6;
  doc.setFillColor(255, 245, 235);
  doc.roundedRect(14, my, pw - 28, 18, 2, 2, "F");
  doc.setTextColor(180, 100, 30);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Limites de l'audit", 18, my + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120, 80, 40);
  doc.text("Les donnees financieres et de reputation sont declaratives. Les benchmarks sont des estimations", 18, my + 10);
  doc.text("basees sur des moyennes publiques. L'audit ne remplace pas une analyse comptable approfondie.", 18, my + 14);

  addFooter(doc, 3, TOTAL_PAGES);

  // ============================================================
  // PAGE 4 : BENCHMARK LOCAL
  // ============================================================
  doc.addPage();
  addHeader(doc, form.riad_name, form.city, today);

  doc.setTextColor(27, 42, 74);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Benchmark local", 14, 48);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Comparaison avec les medianes des riads " + form.stars + " etoiles a " + form.city, 14, 55);

  const benchmarks: Record<string, { adr: number; booking: number; reviews: number; direct: number }> = {
    "Marrakech": { adr: 550, booking: 7.8, reviews: 150, direct: 20 },
    "Fes": { adr: 400, booking: 7.5, reviews: 100, direct: 15 },
    "Essaouira": { adr: 450, booking: 7.9, reviews: 80, direct: 25 },
    "Chefchaouen": { adr: 350, booking: 7.6, reviews: 60, direct: 30 },
    "Tanger": { adr: 500, booking: 7.4, reviews: 90, direct: 18 },
    "Rabat": { adr: 480, booking: 7.3, reviews: 70, direct: 22 },
  };
  const bm = benchmarks[form.city] || benchmarks["Marrakech"];
  const totalReviews = form.booking_reviews + form.tripadvisor_reviews + form.google_reviews;
  const avgNote = form.booking_score > 0 ? form.booking_score : 0;
  const priceDiff = Math.round(((form.current_price_mad - bm.adr) / bm.adr) * 100);

  autoTable(doc, {
    startY: 60,
    head: [["Indicateur", "Votre riad", "Mediane " + form.city, "Ecart"]],
    body: [
      ["Prix moyen (MAD/nuit)", fmt(form.current_price_mad), fmt(bm.adr), (priceDiff > 0 ? "+" : "") + priceDiff + "%"],
      ["Note Booking /10", avgNote > 0 ? avgNote.toFixed(1) : "N/A", bm.booking.toFixed(1), ""],
      ["Volume d'avis total", fmt(totalReviews), fmt(bm.reviews), totalReviews >= bm.reviews ? "+" + Math.round(((totalReviews - bm.reviews) / bm.reviews) * 100) + "%" : Math.round(((totalReviews - bm.reviews) / bm.reviews) * 100) + "%"],
      ["Part reservations directes", Math.round(form.direct_percent) + "%", bm.direct + "%", (Math.round(form.direct_percent) - bm.direct > 0 ? "+" : "") + (Math.round(form.direct_percent) - bm.direct) + " pts"],
    ],
    theme: "striped",
    headStyles: { fillColor: [27, 42, 74], textColor: [255, 255, 255], fontSize: 9, fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 3 },
    margin: { left: 14, right: 14 },
  });

  const bmY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(14, bmY, pw - 28, 20, 2, 2, "F");
  doc.setTextColor(27, 42, 74);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Interpretation", 18, bmY + 6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(8);
  if (priceDiff > 15) {
    doc.text("Vous etes " + priceDiff + "% plus cher que la mediane. Justifie par une reputation superieure ?", 18, bmY + 11);
  } else if (priceDiff < -10) {
    doc.text("Vous etes " + Math.abs(priceDiff) + "% moins cher que la mediane. Marge de hausse possible.", 18, bmY + 11);
  } else {
    doc.text("Votre positionnement tarifaire est proche de la mediane locale.", 18, bmY + 11);
  }
  doc.text("Un ecart de prix doit etre justifie par la reputation, les services et l'experience client.", 18, bmY + 15);

  addFooter(doc, 4, TOTAL_PAGES);

  // ============================================================
  // PAGE 5 : CALCULATEUR COMMISSIONS OTA
  // ============================================================
  doc.addPage();
  addHeader(doc, form.riad_name, form.city, today);

  doc.setTextColor(27, 42, 74);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Calculateur commissions OTA", 14, 48);
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text("CA declare : " + fmt(form.annual_revenue_mad) + " MAD/an", 14, 55);

  const revB = form.annual_revenue_mad * (form.booking_percent / 100);
  const revA = form.annual_revenue_mad * (form.airbnb_percent / 100);
  const revE = form.annual_revenue_mad * (form.expedia_percent / 100);
  const revD = form.annual_revenue_mad * (form.direct_percent / 100);
  const costB = revB * 0.18;
  const costA = revA * 0.15;
  const costE = revE * 0.20;
  const totalCost = costB + costA + costE;

  autoTable(doc, {
    startY: 60,
    head: [["Canal", "Part du CA", "Revenu", "Taux commission", "Cout annuel"]],
    body: [
      ["Booking.com", Math.round(form.booking_percent) + "%", fmt(revB) + " MAD", "18%", fmt(costB) + " MAD"],
      ["Airbnb", Math.round(form.airbnb_percent) + "%", fmt(revA) + " MAD", "15%", fmt(costA) + " MAD"],
      ["Expedia", Math.round(form.expedia_percent) + "%", fmt(revE) + " MAD", "20%", fmt(costE) + " MAD"],
      ["Direct", Math.round(form.direct_percent) + "%", fmt(revD) + " MAD", "0%", "0 MAD"],
    ],
    theme: "striped",
    headStyles: { fillColor: [194, 69, 45], textColor: [255, 255, 255], fontSize: 8, fontStyle: "bold" },
    styles: { fontSize: 8.5, cellPadding: 3 },
    margin: { left: 14, right: 14 },
  });

  const comY = (doc as any).lastAutoTable.finalY + 6;
  doc.setTextColor(194, 69, 45);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Cout total des commissions : " + fmt(totalCost) + " MAD/an", 14, comY);
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.setFont("helvetica", "normal");
  doc.text("soit " + (form.annual_revenue_mad > 0 ? ((totalCost / form.annual_revenue_mad) * 100).toFixed(1) : "0") + "% de votre chiffre d'affaires", 14, comY + 5);

  const scenY = comY + 14;
  doc.setTextColor(27, 42, 74);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Scenarios : basculer des reservations OTA en direct", 14, scenY);

  const otaCost = totalCost;
  const s10 = Math.round(otaCost * 0.10);
  const s20 = Math.round(otaCost * 0.20);
  const s30 = Math.round(otaCost * 0.30);

  autoTable(doc, {
    startY: scenY + 4,
    head: [["Scenario", "Bascule OTA -> direct", "Economie annuelle", "Equivalent nuits"]],
    body: [
      ["Conservateur", "10%", "+" + fmt(s10) + " MAD/an", Math.round(s10 / Math.max(form.current_price_mad, 1)) + " nuits"],
      ["Realiste", "20%", "+" + fmt(s20) + " MAD/an", Math.round(s20 / Math.max(form.current_price_mad, 1)) + " nuits"],
      ["Ambitieux", "30%", "+" + fmt(s30) + " MAD/an", Math.round(s30 / Math.max(form.current_price_mad, 1)) + " nuits"],
    ],
    theme: "striped",
    headStyles: { fillColor: [46, 125, 50], textColor: [255, 255, 255], fontSize: 9, fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 3 },
    margin: { left: 14, right: 14 },
  });

  const scenEnd = (doc as any).lastAutoTable.finalY + 6;
  doc.setFillColor(240, 248, 240);
  doc.roundedRect(14, scenEnd, pw - 28, 12, 2, 2, "F");
  doc.setTextColor(46, 125, 50);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Le scenario realiste (20%) vous fait economiser " + fmt(s20) + " MAD/an.", 18, scenEnd + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(80, 120, 80);
  doc.text("C'est l'equivalent de " + Math.round(s20 / Math.max(form.current_price_mad, 1)) + " nuits gratuites a " + fmt(form.current_price_mad) + " MAD.", 18, scenEnd + 9);

  addFooter(doc, 5, TOTAL_PAGES);

  // ============================================================
  // PAGE 6 : PLAN D'ACTION
  // ============================================================
  doc.addPage();
  addHeader(doc, form.riad_name, form.city, today);

  doc.setTextColor(27, 42, 74);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Plan d'action prioritaire", 14, 48);
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text("5 actions classees par impact financier.", 14, 55);

  if (data.top_priorities.length > 0) {
    const rows = data.top_priorities.map((p) => [
      "#" + p.rank,
      MODULE_NAMES[p.module.toLowerCase()] || p.module,
      p.title.substring(0, 50),
      "+" + fmt(p.impact_mad) + " MAD",
      p.difficulty === "facile" ? "2-4h" : p.difficulty === "moyenne" ? "1-2 sem" : "1-3 mois",
      p.difficulty === "facile" ? "7j" : p.difficulty === "moyenne" ? "30j" : "90j",
    ]);
    autoTable(doc, {
      startY: 60,
      head: [["#", "Axe", "Action", "Impact", "Effort", "Delai"]],
      body: rows,
      theme: "striped",
      headStyles: { fillColor: [194, 69, 45], textColor: [255, 255, 255], fontSize: 8, fontStyle: "bold" },
      styles: { fontSize: 8, cellPadding: 2.5 },
      columnStyles: { 0: { cellWidth: 8, halign: "center", fontStyle: "bold" }, 1: { cellWidth: 28 }, 2: { cellWidth: 62 }, 3: { cellWidth: 30, halign: "right", fontStyle: "bold" }, 4: { cellWidth: 22, halign: "center" }, 5: { cellWidth: 18, halign: "center" } },
      margin: { left: 14, right: 14 },
    });
  }

  const actY = (doc as any).lastAutoTable?.finalY || 140;
  doc.setFillColor(255, 245, 235);
  doc.roundedRect(14, actY + 6, pw - 28, 14, 2, 2, "F");
  doc.setTextColor(180, 100, 30);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Conseil : commencez par les 2 actions 'faciles' cette semaine.", 18, actY + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Elles representent souvent 60% du gain total pour 20% de l'effort.", 18, actY + 16);

  addFooter(doc, 6, TOTAL_PAGES);

  // ============================================================
  // PAGE 7 : PLAN 30/60/90
  // ============================================================
  doc.addPage();
  addHeader(doc, form.riad_name, form.city, today);

  doc.setTextColor(27, 42, 74);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Plan 30 / 60 / 90 jours", 14, 48);
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text("Feuille de route pour transformer votre audit en resultats concrets.", 14, 55);

  let py = 64;
  doc.setFillColor(230, 245, 230);
  doc.roundedRect(14, py, pw - 28, 38, 2, 2, "F");
  doc.setTextColor(46, 125, 50);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Semaine 1-4 : Quick Wins", 18, py + 7);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 100, 60);
  doc.text("- Repondre a TOUS les avis en attente (Booking, TripAdvisor, Google)", 18, py + 13);
  doc.text("- Corriger les erreurs sur la fiche Booking (photos, description, equipements)", 18, py + 18);
  doc.text("- Ajuster les prix basse/haute saison selon le calendrier touristique", 18, py + 23);
  doc.text("- Ajouter un bouton WhatsApp sur le site web et la fiche Google", 18, py + 28);
  doc.text("- Installer un widget de reservation directe (Cloudbeds, LittleHotelier)", 18, py + 33);

  py += 44;
  doc.setFillColor(245, 245, 230);
  doc.roundedRect(14, py, pw - 28, 33, 2, 2, "F");
  doc.setTextColor(180, 150, 30);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Mois 2 : Optimisation", 18, py + 7);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 100, 30);
  doc.text("- Mettre en place des tarifs dynamiques (+20% haute, -15% basse)", 18, py + 13);
  doc.text("- Lancer un programme de fidelite WhatsApp pour les retours en direct", 18, py + 18);
  doc.text("- Optimiser le SEO local (Google Business, mots-cles ville + riad)", 18, py + 23);
  doc.text("- Negocier le statut Preferred Partner avec Booking (si eligible)", 18, py + 28);

  py += 39;
  doc.setFillColor(235, 240, 250);
  doc.roundedRect(14, py, pw - 28, 33, 2, 2, "F");
  doc.setTextColor(50, 80, 150);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Mois 3 : Mesure et acceleration", 18, py + 7);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(50, 70, 120);
  doc.text("- Nouvel audit RiadPulse pour mesurer la progression du score", 18, py + 13);
  doc.text("- Analyser le ratio direct vs OTA et ajuster la strategie", 18, py + 18);
  doc.text("- Tester une hausse de 5% sur les chambres les plus demandees", 18, py + 23);
  doc.text("- Planifier la strategie pour la prochaine haute saison", 18, py + 28);

  addFooter(doc, 7, TOTAL_PAGES);

  // ============================================================
  // PAGE 8 : PROJECTION AVANT/APRES
  // ============================================================
  doc.addPage();
  addHeader(doc, form.riad_name, form.city, today);

  doc.setTextColor(27, 42, 74);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Projection avant / apres", 14, 48);
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text("Estimation si les actions prioritaires sont appliquees.", 14, 55);

  const cs = data.global_score;
  const s3 = Math.min(100, Math.round(cs * 1.15));
  const s6 = Math.min(100, Math.round(cs * 1.30));
  const s12 = Math.min(100, Math.round(cs * 1.50));
  const cl = data.total_annual_loss_mad;

  autoTable(doc, {
    startY: 62,
    head: [["Horizon", "Score cible", "Perte residuelle", "Economie cumulee"]],
    body: [
      ["Aujourd'hui", cs + "/100 (" + data.grade + ")", fmt(cl) + " MAD", "0 MAD"],
      ["3 mois", s3 + "/100", fmt(Math.round(cl * 0.75)) + " MAD", fmt(Math.round(cl * 0.25)) + " MAD"],
      ["6 mois", s6 + "/100", fmt(Math.round(cl * 0.50)) + " MAD", fmt(Math.round(cl * 0.50)) + " MAD"],
      ["12 mois", s12 + "/100", fmt(Math.round(cl * 0.25)) + " MAD", fmt(Math.round(cl * 0.75)) + " MAD"],
    ],
    theme: "striped",
    headStyles: { fillColor: [27, 42, 74], textColor: [255, 255, 255], fontSize: 9, fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 4 },
    margin: { left: 14, right: 14 },
  });

  const projY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFillColor(240, 248, 240);
  doc.roundedRect(14, projY, pw - 28, 22, 2, 2, "F");
  doc.setTextColor(46, 125, 50);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("En 12 mois, vous pourriez economiser :", 18, projY + 7);
  doc.setFontSize(18);
  doc.text(fmt(Math.round(cl * 0.75)) + " MAD", 18, projY + 17);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 120, 80);
  doc.text("soit environ " + fmt(Math.round(cl * 0.75 / 11)) + " EUR", 100, projY + 17);

  doc.setTextColor(120, 120, 120);
  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.text("Projections basees sur l'application de 80% des actions recommandees.", 14, projY + 28);

  addFooter(doc, 8, TOTAL_PAGES);

  // ============================================================
  // PAGE 9 : OFFRES
  // ============================================================
  doc.addPage();
  addHeader(doc, form.riad_name, form.city, today);

  doc.setTextColor(27, 42, 74);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Nos offres d'accompagnement", 14, 48);

  let oy = 58;
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(14, oy, pw - 28, 22, 2, 2, "F");
  doc.setTextColor(27, 42, 74);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Audit Flash - 500 MAD", 18, oy + 7);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("Le rapport que vous tenez entre les mains. Ideal pour un premier diagnostic.", 18, oy + 13);
  doc.text("Generable en 2 minutes sur riadpulse.ma/score", 18, oy + 17);

  oy += 28;
  doc.setFillColor(255, 245, 235);
  doc.roundedRect(14, oy, pw - 28, 28, 2, 2, "F");
  doc.setDrawColor(194, 69, 45);
  doc.setLineWidth(0.5);
  doc.roundedRect(14, oy, pw - 28, 28, 2, 2, "S");
  doc.setTextColor(194, 69, 45);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Audit Complet + Video - 1 500 MAD (RECOMMANDE)", 18, oy + 7);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("Ce rapport + video personnalisee de 3 min commentant vos resultats", 18, oy + 13);
  doc.text("+ benchmark concurrentiel detaille + plan d'action sur mesure", 18, oy + 17);
  doc.text("+ 1 mois de suivi offert", 18, oy + 21);

  oy += 34;
  doc.setFillColor(240, 248, 240);
  doc.roundedRect(14, oy, pw - 28, 22, 2, 2, "F");
  doc.setTextColor(46, 125, 50);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Suivi mensuel - 700 MAD/mois", 18, oy + 7);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("Nouvel audit chaque mois + alertes WhatsApp quand votre score baisse", 18, oy + 13);
  doc.text("+ comparaison avec le mois precedent + recommandations actualisees", 18, oy + 17);

  addFooter(doc, 9, TOTAL_PAGES);

  // ============================================================
  // PAGE 10 : CONCLUSION
  // ============================================================
  doc.addPage();
  doc.setFillColor(10, 22, 40);
  doc.rect(0, 0, pw, ph, "F");
  doc.setFillColor(231, 111, 81);
  doc.rect(0, 0, pw, 4, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Conclusion", pw / 2, 60, { align: "center" });

  doc.setDrawColor(244, 162, 97);
  doc.setLineWidth(0.5);
  doc.line(pw / 2 - 20, 68, pw / 2 + 20, 68);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 190, 210);
  doc.text(form.riad_name + " obtient un score de " + data.global_score + "/100 (" + data.grade + ").", pw / 2, 85, { align: "center" });

  doc.text("Votre manque a gagner estime est de " + fmt(data.total_annual_loss_mad) + " MAD/an.", pw / 2, 95, { align: "center" });

  doc.setTextColor(244, 162, 97);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Ce n'est pas une fatalite.", pw / 2, 110, { align: "center" });

  doc.setTextColor(180, 190, 210);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("En appliquant les 5 actions prioritaires de ce rapport,", pw / 2, 122, { align: "center" });
  doc.text("vous pouvez recuperer jusqu'a " + fmt(Math.round(data.total_annual_loss_mad * 0.75)) + " MAD en 12 mois.", pw / 2, 130, { align: "center" });

  doc.text("La premiere etape : repondre a vos avis en attente cette semaine.", pw / 2, 142, { align: "center" });
  doc.text("La deuxieme : ajuster vos prix pour la prochaine saison.", pw / 2, 150, { align: "center" });

  doc.setFillColor(15, 29, 50);
  doc.roundedRect(pw / 2 - 55, 165, 110, 40, 3, 3, "F");
  doc.setDrawColor(231, 111, 81);
  doc.setLineWidth(0.5);
  doc.roundedRect(pw / 2 - 55, 165, 110, 40, 3, 3, "S");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Pret a passer a l'action ?", pw / 2, 178, { align: "center" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 190, 210);
  doc.text("WhatsApp : +212 6XX XXX XXX", pw / 2, 188, { align: "center" });
  doc.text("Email : contact@riadpulse.ma", pw / 2, 195, { align: "center" });
  doc.text("Web : riadpulse.ma", pw / 2, 202, { align: "center" });

  doc.setTextColor(80, 100, 130);
  doc.setFontSize(7);
  doc.text("Merci de votre confiance. RiadPulse 2026.", pw / 2, ph - 20, { align: "center" });
  doc.text("Page " + TOTAL_PAGES + "/" + TOTAL_PAGES, pw / 2, ph - 14, { align: "center" });

  // ============================================================
  // SAVE
  // ============================================================
  const filename = "RiadPulse_Audit_" + form.riad_name.replace(/[^a-zA-Z0-9]/g, "_") + ".pdf";
  doc.save(filename);
}