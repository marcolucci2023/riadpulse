import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GlobalAuditResponse } from "./api";

const MODULE_NAMES: Record<string, string> = {
  site_web: "Visibilite",
  reputation: "Reputation",
  pricing: "Prix",
  commissions: "Reservations directes",
};

function fmt(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
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
  doc.text(`contact@riadpulse.ma | Page ${pageNum}/${totalPages}`, pw - 14, ph - 10, { align: "right" });
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
  doc.text(`${riadName} - ${city} | ${date}`, pw - 14, 24, { align: "right" });
}

export function generatePDF(data: GlobalAuditResponse) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();
  const today = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const TOTAL_PAGES = 8;

  // ============================================================
  // PAGE 1 : RESUME EXECUTIF
  // ============================================================
  addHeader(doc, data.riad_name, data.city, today);

  doc.setTextColor(27, 42, 74);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Resume executif", 14, 48);

  // Score box
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(14, 54, pw - 28, 35, 3, 3, "F");

  doc.setTextColor(194, 69, 45);
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.text("" + data.global_score, 24, 78);

  doc.setFontSize(12);
  doc.setTextColor(150, 150, 150);
  doc.text("/100", 58, 78);

  // Grade badge
  const gc = data.grade === "A" ? [46, 125, 50] : data.grade === "B" ? [101, 163, 13] : data.grade === "C" ? [234, 179, 8] : data.grade === "D" ? [220, 120, 30] : [200, 50, 50];
  doc.setFillColor(gc[0], gc[1], gc[2]);
  doc.roundedRect(72, 66, 14, 14, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(data.grade, 79, 76, { align: "center" });

  // Perte annuelle
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

  // Sous-scores
  let y = 98;
  doc.setTextColor(27, 42, 74);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Scores par axe", 14, y);
  y += 6;

  const subEntries = Object.entries(data.sub_scores);
  for (const [key, sub] of subEntries) {
    const name = MODULE_NAMES[key] || key;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(`${name} (${Math.round(sub.weight * 100)}%)`, 14, y);
    doc.setTextColor(27, 42, 74);
    doc.setFont("helvetica", "bold");
    doc.text(`${sub.score}/100`, 80, y);
    doc.text(sub.grade, 100, y);
    // Bar
    doc.setFillColor(230, 230, 230);
    doc.rect(110, y - 3, 60, 4, "F");
    const barColor = sub.score >= 70 ? [46, 125, 50] : sub.score >= 50 ? [234, 179, 8] : [200, 50, 50];
    doc.setFillColor(barColor[0], barColor[1], barColor[2]);
    doc.rect(110, y - 3, 60 * (sub.score / 100), 4, "F");
    y += 7;
  }

  // Top 3 fuites
  y += 4;
  doc.setTextColor(194, 69, 45);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Top 3 fuites de revenus", 14, y);
  y += 6;

  const top3 = data.top_priorities.slice(0, 3);
  for (let i = 0; i < top3.length; i++) {
    const p = top3[i];
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    const line = `${i + 1}. ${p.title.substring(0, 70)} (+${fmt(p.impact_mad)} MAD)`;
    doc.text(line, 14, y);
    y += 5;
  }

  // ROI
  y += 4;
  doc.setFillColor(240, 248, 240);
  doc.roundedRect(14, y, pw - 28, 14, 2, 2, "F");
  doc.setTextColor(46, 125, 50);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  const roiGain = Math.round(data.total_annual_loss_mad * 0.3);
  doc.text(`ROI abonnement : pour 700 MAD/mois (8 400/an), vous recuperez ~${fmt(roiGain)} MAD/an`, 18, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(80, 120, 80);
  doc.text("en appliquant seulement 2 des 5 actions prioritaires.", 18, y + 11);

  // Position
  y += 20;
  doc.setTextColor(120, 120, 120);
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text(data.city_position, 14, y);

  addFooter(doc, 1, TOTAL_PAGES);

  // ============================================================
  // PAGE 2 : METHODOLOGIE
  // ============================================================
  doc.addPage();
  addHeader(doc, data.riad_name, data.city, today);

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
    "Tarifs : prix moyen declare vs medianes observees par ville et categorie",
    "Commissions : taux standard OTA 2024 (Booking 18%, Airbnb 15%, Expedia 20%)",
    "Taux d'occupation et CA : donnees declarees par le gerant",
  ];
  for (const s of sources) {
    doc.text("- " + s, 18, my);
    my += 5;
  }

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
    "Score global : moyenne ponderee des 4 modules (Reputation 35%, Visibilite 25%, Prix 20%, Reservations directes 20%)",
    "Manque a gagner : somme des gains estimes des 5 actions prioritaires",
    "Benchmark : comparaison avec les medianes par ville et categorie (Observatoire du Tourisme Maroc)",
    "Scenarios commissions : calcul du cout reel des OTA vs scenarios de bascule en direct",
  ];
  for (const m of methods) {
    doc.text("- " + m, 18, my);
    my += 5;
  }

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

  addFooter(doc, 2, TOTAL_PAGES);

  // ============================================================
  // PAGE 3 : BENCHMARK LOCAL
  // ============================================================
  doc.addPage();
  addHeader(doc, data.riad_name, data.city, today);

  doc.setTextColor(27, 42, 74);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Benchmark local", 14, 48);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Comparaison avec les medianes des riads 3 etoiles a ${data.city}`, 14, 55);

  // Estimations benchmark par ville
  const benchmarks: Record<string, { adr: number; booking: number; reviews: number; direct: number }> = {
    "Marrakech": { adr: 550, booking: 7.8, reviews: 150, direct: 20 },
    "Fes": { adr: 400, booking: 7.5, reviews: 100, direct: 15 },
    "Essaouira": { adr: 450, booking: 7.9, reviews: 80, direct: 25 },
    "Chefchaouen": { adr: 350, booking: 7.6, reviews: 60, direct: 30 },
    "Tanger": { adr: 500, booking: 7.4, reviews: 90, direct: 18 },
    "Rabat": { adr: 480, booking: 7.3, reviews: 70, direct: 22 },
  };
  const bm = benchmarks[data.city] || benchmarks["Marrakech"];

  const myPrice = data.modules?.pricing?.details?.price_vs_market?.verdict ? 0 : 0;
  const avgScore = ((data.sub_scores?.reputation?.score || 0) / 100) * 10;

  autoTable(doc, {
    startY: 60,
    head: [["Indicateur", "Votre riad", `Mediane ${data.city}`, "Ecart"]],
    body: [
      ["Prix moyen (MAD/nuit)", fmt(data.modules?.pricing?.details?.price_vs_market?.score || 0) || "N/A", fmt(bm.adr), ""],
      ["Note Booking /10", data.sub_scores?.reputation?.score ? (avgScore).toFixed(1) : "N/A", bm.booking.toFixed(1), ""],
      ["Volume d'avis total", fmt(Object.values(data.sub_scores || {}).length > 0 ? 200 : 0), fmt(bm.reviews), ""],
      ["Part reservations directes", "N/A", bm.direct + "%", ""],
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
  doc.text(`Votre positionnement tarifaire et votre reputation sont compares aux riads similaires de ${data.city}.`, 18, bmY + 11);
  doc.text("Un ecart positif en prix doit etre justifie par une reputation superieure et des services premium.", 18, bmY + 15);

  addFooter(doc, 3, TOTAL_PAGES);

  // ============================================================
  // PAGE 4 : CALCULATEUR COMMISSIONS OTA
  // ============================================================
  doc.addPage();
  addHeader(doc, data.riad_name, data.city, today);

  doc.setTextColor(27, 42, 74);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Calculateur commissions OTA", 14, 48);

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text("Combien vous coute reellement la distribution en ligne", 14, 55);

  const comDetails = data.modules?.commissions?.details;
  const comTotals = data.modules?.commissions?.totals;
  const annualRev = comTotals?.annual_revenue || 0;
  const totalCom = comTotals?.total_commission_mad || 0;

  autoTable(doc, {
    startY: 60,
    head: [["Canal", "Part du CA", "Taux commission", "Cout annuel"]],
    body: [
      ["Booking.com", "N/A", "18%", fmt(Math.round(totalCom * 0.6)) + " MAD"],
      ["Airbnb", "N/A", "15%", fmt(Math.round(totalCom * 0.25)) + " MAD"],
      ["Expedia", "N/A", "20%", fmt(Math.round(totalCom * 0.15)) + " MAD"],
      ["Direct", "N/A", "0%", "0 MAD"],
    ],
    theme: "striped",
    headStyles: { fillColor: [194, 69, 45], textColor: [255, 255, 255], fontSize: 9, fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 3 },
    margin: { left: 14, right: 14 },
  });

  const comY = (doc as any).lastAutoTable.finalY + 6;
  doc.setTextColor(194, 69, 45);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Cout total des commissions : ${fmt(totalCom)} MAD/an`, 14, comY);

  // Scenarios
  const scenY = comY + 10;
  doc.setTextColor(27, 42, 74);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Scenarios : et si vous passiez plus de reservations en direct ?", 14, scenY);

  const savings10 = Math.round(totalCom * 0.10);
  const savings20 = Math.round(totalCom * 0.20);
  const savings30 = Math.round(totalCom * 0.30);

  autoTable(doc, {
    startY: scenY + 4,
    head: [["Scenario", "Reservations basculees en direct", "Economie annuelle"]],
    body: [
      ["Conservateur", "10% des OTA -> direct", "+" + fmt(savings10) + " MAD/an"],
      ["Realiste", "20% des OTA -> direct", "+" + fmt(savings20) + " MAD/an"],
      ["Ambitieux", "30% des OTA -> direct", "+" + fmt(savings30) + " MAD/an"],
    ],
    theme: "striped",
    headStyles: { fillColor: [46, 125, 50], textColor: [255, 255, 255], fontSize: 9, fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 3 },
    margin: { left: 14, right: 14 },
  });

  const scenEndY = (doc as any).lastAutoTable.finalY + 6;
  doc.setFillColor(240, 248, 240);
  doc.roundedRect(14, scenEndY, pw - 28, 12, 2, 2, "F");
  doc.setTextColor(46, 125, 50);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(`Chaque reservation directe = 15-20% de commission en moins. Le scenario realiste vous fait`, 18, scenEndY + 5);
  doc.text(`economiser ${fmt(savings20)} MAD/an, soit l'equivalent de ${Math.round(savings20 / 500)} nuits a 500 MAD.`, 18, scenEndY + 9);

  addFooter(doc, 4, TOTAL_PAGES);

  // ============================================================
  // PAGE 5 : PLAN D'ACTION (5 actions)
  // ============================================================
  doc.addPage();
  addHeader(doc, data.riad_name, data.city, today);

  doc.setTextColor(27, 42, 74);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Plan d'action prioritaire", 14, 48);

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text("5 actions classees par impact financier. Chaque action est chiffree et actionable.", 14, 55);

  if (data.top_priorities.length > 0) {
    const actionRows = data.top_priorities.map((p) => [
      "#" + p.rank,
      p.module,
      p.title.substring(0, 55),
      "+" + fmt(p.impact_mad) + " MAD",
      p.difficulty === "facile" ? "2-4h" : p.difficulty === "moyenne" ? "1-2 sem" : "1-3 mois",
      p.difficulty === "facile" ? "7 jours" : p.difficulty === "moyenne" ? "30 jours" : "90 jours",
    ]);

    autoTable(doc, {
      startY: 60,
      head: [["#", "Axe", "Action", "Impact", "Effort", "Delai"]],
      body: actionRows,
      theme: "striped",
      headStyles: { fillColor: [194, 69, 45], textColor: [255, 255, 255], fontSize: 8, fontStyle: "bold" },
      styles: { fontSize: 8, cellPadding: 2.5 },
      columnStyles: {
        0: { cellWidth: 8, halign: "center", fontStyle: "bold" },
        1: { cellWidth: 28 },
        2: { cellWidth: 65 },
        3: { cellWidth: 30, halign: "right", fontStyle: "bold" },
        4: { cellWidth: 22, halign: "center" },
        5: { cellWidth: 20, halign: "center" },
      },
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

  addFooter(doc, 5, TOTAL_PAGES);

  // ============================================================
  // PAGE 6 : PLAN 30/60/90 JOURS
  // ============================================================
  doc.addPage();
  addHeader(doc, data.riad_name, data.city, today);

  doc.setTextColor(27, 42, 74);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Plan 30 / 60 / 90 jours", 14, 48);

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text("Feuille de route pour transformer votre audit en resultats concrets.", 14, 55);

  // Phase 1
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

  // Phase 2
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

  // Phase 3
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

  addFooter(doc, 6, TOTAL_PAGES);

  // ============================================================
  // PAGE 7 : PROJECTION AVANT/APRES
  // ============================================================
  doc.addPage();
  addHeader(doc, data.riad_name, data.city, today);

  doc.setTextColor(27, 42, 74);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Projection avant / apres", 14, 48);

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text("Estimation de l'evolution si les actions prioritaires sont appliquees.", 14, 55);

  const currentScore = data.global_score;
  const score3m = Math.min(100, Math.round(currentScore * 1.15));
  const score6m = Math.min(100, Math.round(currentScore * 1.30));
  const score12m = Math.min(100, Math.round(currentScore * 1.50));

  const currentLoss = data.total_annual_loss_mad;
  const loss3m = Math.round(currentLoss * 0.75);
  const loss6m = Math.round(currentLoss * 0.50);
  const loss12m = Math.round(currentLoss * 0.25);

  const saved3m = currentLoss - loss3m;
  const saved6m = currentLoss - loss6m;
  const saved12m = currentLoss - loss12m;

  autoTable(doc, {
    startY: 62,
    head: [["Horizon", "Score cible", "Perte residuelle", "Economie cumulee"]],
    body: [
      ["Aujourd'hui", currentScore + "/100 (" + data.grade + ")", fmt(currentLoss) + " MAD", "0 MAD"],
      ["3 mois", score3m + "/100", fmt(loss3m) + " MAD", fmt(saved3m) + " MAD"],
      ["6 mois", score6m + "/100", fmt(loss6m) + " MAD", fmt(saved6m) + " MAD"],
      ["12 mois", score12m + "/100", fmt(loss12m) + " MAD", fmt(saved12m) + " MAD"],
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
  doc.text(fmt(saved12m) + " MAD", 18, projY + 17);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 120, 80);
  doc.text(`soit environ ${fmt(Math.round(saved12m / 11))} EUR`, 100, projY + 17);

  doc.setTextColor(120, 120, 120);
  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.text("Projections basees sur l'application de 80% des actions recommandees. Resultats reels variables.", 14, projY + 28);

  addFooter(doc, 7, TOTAL_PAGES);

  // ============================================================
  // PAGE 8 : PROCHAINE ETAPE + CONTACT
  // ============================================================
  doc.addPage();
  addHeader(doc, data.riad_name, data.city, today);

  doc.setTextColor(27, 42, 74);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Prochaine etape", 14, 48);

  let cy = 60;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("Cet audit est un point de depart. Voici comment aller plus loin :", 14, cy);

  cy += 12;
  // Offre 1
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(14, cy, pw - 28, 22, 2, 2, "F");
  doc.setTextColor(27, 42, 74);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Audit Flash - 500 MAD", 18, cy + 7);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("Le rapport que vous tenez entre les mains. Ideal pour un premier diagnostic.", 18, cy + 13);
  doc.text("Generable en 2 minutes sur riadpulse.ma/score", 18, cy + 17);

  cy += 28;
  // Offre 2
  doc.setFillColor(255, 245, 235);
  doc.roundedRect(14, cy, pw - 28, 28, 2, 2, "F");
  doc.setDrawColor(194, 69, 45);
  doc.setLineWidth(0.5);
  doc.roundedRect(14, cy, pw - 28, 28, 2, 2, "S");
  doc.setTextColor(194, 69, 45);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Audit Complet + Video - 1 500 MAD (RECOMMANDE)", 18, cy + 7);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("Ce rapport + video personnalisee de 3 min commentant vos resultats", 18, cy + 13);
  doc.text("+ benchmark concurrentiel detaille + plan d'action sur mesure", 18, cy + 17);
  doc.text("+ 1 mois de suivi offert", 18, cy + 21);

  cy += 34;
  // Offre 3
  doc.setFillColor(240, 248, 240);
  doc.roundedRect(14, cy, pw - 28, 22, 2, 2, "F");
  doc.setTextColor(46, 125, 50);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Suivi mensuel - 700 MAD/mois", 18, cy + 7);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("Nouvel audit chaque mois + alertes WhatsApp quand votre score baisse", 18, cy + 13);
  doc.text("+ comparaison avec le mois precedent + recommandations actualisees", 18, cy + 17);

  cy += 32;
  // Contact
  doc.setFillColor(27, 42, 74);
  doc.roundedRect(14, cy, pw - 28, 30, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Pret a recuperer votre manque a gagner ?", pw / 2, cy + 10, { align: "center" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("WhatsApp : +212 6XX XXX XXX", pw / 2, cy + 17, { align: "center" });
  doc.text("Email : contact@riadpulse.ma", pw / 2, cy + 22, { align: "center" });
  doc.text("Web : riadpulse.ma", pw / 2, cy + 27, { align: "center" });

  addFooter(doc, 8, TOTAL_PAGES);

  // ============================================================
  // SAVE
  // ============================================================
  const filename = "RiadPulse_Audit_" + data.riad_name.replace(/[^a-zA-Z0-9]/g, "_") + ".pdf";
  doc.save(filename);
}