"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { GlobalAuditResponse } from "./api";

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

const C = {
  bg: [10, 22, 40] as [number, number, number],
  surface: [15, 29, 50] as [number, number, number],
  terra: [231, 111, 81] as [number, number, number],
  gold: [244, 162, 97] as [number, number, number],
  green: [46, 196, 134] as [number, number, number],
  red: [239, 68, 68] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  muted: [148, 163, 184] as [number, number, number],
  light: [203, 213, 225] as [number, number, number],
};

const LABELS: Record<string, string> = {
  site_web: "Visibilite",
  pricing: "Prix",
  reputation: "Reputation",
  commissions: "Reservations directes",
};

const BENCH: Record<number, Record<string, { adr: number; booking: number; reviews: number; direct: number }>> = {
  3: {
    Marrakech: { adr: 550, booking: 7.8, reviews: 150, direct: 20 },
    Fes: { adr: 400, booking: 7.6, reviews: 100, direct: 18 },
    Essaouira: { adr: 450, booking: 7.9, reviews: 80, direct: 22 },
    Casablanca: { adr: 500, booking: 7.5, reviews: 60, direct: 15 },
    Tanger: { adr: 420, booking: 7.7, reviews: 70, direct: 17 },
    Chefchaouen: { adr: 350, booking: 8.0, reviews: 90, direct: 25 },
    Rabat: { adr: 480, booking: 7.4, reviews: 50, direct: 14 },
    "El Jadida": { adr: 380, booking: 7.3, reviews: 40, direct: 12 },
  },
  4: {
    Marrakech: { adr: 850, booking: 8.2, reviews: 200, direct: 25 },
    Fes: { adr: 650, booking: 8.0, reviews: 150, direct: 22 },
    Essaouira: { adr: 700, booking: 8.3, reviews: 120, direct: 27 },
    Casablanca: { adr: 750, booking: 7.9, reviews: 100, direct: 20 },
    Tanger: { adr: 680, booking: 8.1, reviews: 110, direct: 22 },
    Chefchaouen: { adr: 550, booking: 8.4, reviews: 130, direct: 30 },
    Rabat: { adr: 720, booking: 7.8, reviews: 80, direct: 18 },
    "El Jadida": { adr: 580, booking: 7.7, reviews: 60, direct: 16 },
  },
  5: {
    Marrakech: { adr: 1400, booking: 8.8, reviews: 300, direct: 30 },
    Fes: { adr: 1000, booking: 8.5, reviews: 200, direct: 27 },
    Essaouira: { adr: 1100, booking: 8.7, reviews: 180, direct: 32 },
    Casablanca: { adr: 1200, booking: 8.4, reviews: 150, direct: 25 },
    Tanger: { adr: 1050, booking: 8.6, reviews: 170, direct: 28 },
    Chefchaouen: { adr: 900, booking: 8.9, reviews: 200, direct: 35 },
    Rabat: { adr: 1100, booking: 8.3, reviews: 120, direct: 23 },
    "El Jadida": { adr: 850, booking: 8.2, reviews: 100, direct: 20 },
  },
};

function getBench(f: FormData) {
  const s = BENCH[f.stars] || BENCH[3];
  return s[f.city] || s["Marrakech"];
}

function gradeInfo(g: string) {
  if (g === "A") return { title: "Excellente performance", color: C.green, urgency: "Optimisation" };
  if (g === "B") return { title: "Bonnes bases, potentiel inexploite", color: C.gold, urgency: "Amelioration" };
  if (g === "C") return { title: "Lacunes significatives", color: C.terra, urgency: "Prioritaire" };
  return { title: "Situation critique", color: C.red, urgency: "Urgent" };
}

function moduleDiag(key: string, score: number, f: FormData): string {
  const s = Math.round(score);
  const b = getBench(f);
  if (key === "site_web") {
    if (s < 30) return `Votre site web est inexistant ou inaccessible. Avec ${f.num_rooms} chambres a remplir, vos clients potentiels ne vous trouvent pas en ligne. Chaque jour sans site, vous perdez des reservations directes au profit des OTA.`;
    if (s < 60) return `Votre site existe mais ne convertit pas assez. Les visiteurs arrivent et repartent sans reserver. Probleme de design, de vitesse, ou de parcours de reservation. Vous payez des commissions OTA evitables.`;
    if (s < 80) return `Votre site est fonctionnel mais manque d'optimisation SEO et de conversion. Vous captez du trafic mais ne le transformez pas assez en reservations directes.`;
    return `Votre presence en ligne est solide. Votre site convertit bien. Quelques ajustements SEO pourraient vous faire passer au niveau superieur.`;
  }
  if (key === "pricing") {
    if (s < 30) return `Vos tarifs sont deconnectes du marche. ADR de ${f.current_price_mad} MAD contre une mediane de ${b.adr} MAD pour les ${f.stars} etoiles a ${f.city}. Vous etes soit trop cher sans justification, soit trop bas et vous bradez vos chambres.`;
    if (s < 60) return `Votre pricing manque de flexibilite. Vous appliquez probablement un tarif fixe toute l'annee alors que la demande a ${f.city} varie fortement. Vous perdez du CA en haute saison et des clients en basse saison.`;
    if (s < 80) return `Votre strategie tarifaire est correcte. ADR de ${f.current_price_mad} MAD proche de la mediane (${b.adr} MAD). Un revenue management dynamique pourrait augmenter votre RevPAR de 10 a 20%.`;
    return `Votre strategie tarifaire est coherente. ADR de ${f.current_price_mad} MAD bien positionne. Affinez vos tarifs evenements et last-minute pour maximiser le RevPAR.`;
  }
  if (key === "reputation") {
    if (s < 30) return `Votre e-reputation est en danger. ${f.booking_reviews} avis Booking, note de ${f.booking_score}/10. Les voyageurs filtrent par note : en dessous de 8.0, vous etes invisible pour la majorite des recherches.`;
    if (s < 60) return `Vos avis sont corrects mais perfectibles. ${f.booking_reviews} avis sur Booking, note de ${f.booking_score}/10. Vous etes dans la moyenne. Il faut passer au-dessus de 8.5 pour declencher le coup de coeur.`;
    if (s < 80) return `Votre reputation est bonne. ${f.booking_reviews} avis, note de ${f.booking_score}/10. Au-dessus de la mediane. Continuez a solliciter des avis post-sejour et repondez a 100% des commentaires.`;
    return `Vos clients vous adorent. ${f.booking_reviews} avis, note de ${f.booking_score}/10. Vous faites partie du top des ${f.stars} etoiles a ${f.city}. Votre reputation est un avantage concurrentiel majeur.`;
  }
  if (key === "commissions") {
    if (s < 30) return `Vous dependez massivement des OTA. ${f.booking_percent}% Booking + ${f.airbnb_percent}% Airbnb + ${f.expedia_percent}% Expedia = seulement ${f.direct_percent}% en direct. Vous versez des milliers de MAD de commissions evitables.`;
    if (s < 60) return `Vous commencez a capter du direct (${f.direct_percent}%) mais les OTA dominent encore. Chaque reservation Booking a 18% de commission vous coute cher. Un site optimise + WhatsApp peut basculer 10-15% du volume.`;
    if (s < 80) return `Votre mix s'equilibre. ${f.direct_percent}% de direct, au-dessus de la moyenne a ${f.city}. Continuez a investir dans votre canal direct : email, fidelisation, offres exclusives.`;
    return `Votre mix est equilibre. ${f.direct_percent}% de direct est excellent pour ${f.num_rooms} chambres. Vous maitrisez vos couts d'acquisition.`;
  }
  return "";
}

function getActions(data: GlobalAuditResponse, f: FormData) {
  const items: { module: string; action: string; impact: string; effort: string; delai: string; score: number }[] = [];
  const subs = data.sub_scores || {};
  const b = getBench(f);
  const ca = f.annual_revenue_mad || 0;

  for (const [key, sub] of Object.entries(subs)) {
    const s = sub.score || 0;
    const label = LABELS[key] || key;

    if (key === "site_web") {
      if (s < 30) items.push({ module: label, action: "Creer un site one-page avec moteur de reservation (Mews, Cloudbeds)", impact: `+${Math.round(ca * 0.08)} MAD`, effort: "Moyen", delai: "30j", score: s });
      else if (s < 60) items.push({ module: label, action: "Ajouter bouton Reserver + photos HD + page tarifs claire", impact: `+${Math.round(ca * 0.05)} MAD`, effort: "Faible", delai: "15j", score: s });
      else items.push({ module: label, action: `Optimiser SEO local (Google Business + mots-cles '${f.city} riad')`, impact: `+${Math.round(ca * 0.03)} MAD`, effort: "Faible", delai: "30j", score: s });
    }
    if (key === "pricing") {
      if (s < 30) items.push({ module: label, action: `Realigner ADR sur mediane ${b.adr} MAD + creer 3 saisons tarifaires`, impact: `+${Math.round(ca * 0.12)} MAD`, effort: "Moyen", delai: "15j", score: s });
      else if (s < 60) items.push({ module: label, action: "Calendrier dynamique : haute/basse/shoulder + tarifs evenements", impact: `+${Math.round(ca * 0.08)} MAD`, effort: "Moyen", delai: "30j", score: s });
      else items.push({ module: label, action: "Offres last-minute et early-bird pour lisser l'occupation", impact: `+${Math.round(ca * 0.04)} MAD`, effort: "Faible", delai: "15j", score: s });
    }
    if (key === "reputation") {
      if (s < 30) items.push({ module: label, action: "Systeme collecte avis post-sejour (WhatsApp + email J+1)", impact: `+${Math.round(ca * 0.06)} MAD`, effort: "Faible", delai: "15j", score: s });
      else if (s < 60) items.push({ module: label, action: "Repondre 100% des avis en 24h + resoudre 3 plaintes recurrentes", impact: `+${Math.round(ca * 0.04)} MAD`, effort: "Faible", delai: "30j", score: s });
      else items.push({ module: label, action: "Page 'Ils parlent de nous' sur le site + inciter avis Google", impact: `+${Math.round(ca * 0.02)} MAD`, effort: "Faible", delai: "15j", score: s });
    }
    if (key === "commissions") {
      if (s < 30) items.push({ module: label, action: "WhatsApp Business + offre exclusive '-10% en direct'", impact: `+${Math.round(ca * 0.10)} MAD`, effort: "Faible", delai: "7j", score: s });
      else if (s < 60) items.push({ module: label, action: "Programme fidelisation email + offre retour clients", impact: `+${Math.round(ca * 0.06)} MAD`, effort: "Moyen", delai: "30j", score: s });
      else items.push({ module: label, action: "Negocier commissions OTA (volume > 500 nuits = levier)", impact: `+${Math.round(ca * 0.03)} MAD`, effort: "Moyen", delai: "60j", score: s });
    }
  }

  items.sort((a, b) => a.score - b.score);
  return items.slice(0, 5);
}

function conclusionParas(data: GlobalAuditResponse, f: FormData): string[] {
  const g = data.grade || "C";
  const loss = data.total_annual_loss_mad || 0;
  const score = data.global_score || 0;
  const ca = f.annual_revenue_mad || 0;
  const pct = ca > 0 ? Math.round((loss / ca) * 100) : 0;

  if (g === "A") return [
    `${f.riad_name} fait partie des riads les plus performants de ${f.city} avec un score de ${score}/100.`,
    `Votre perte potentielle est limitee a ${loss.toLocaleString()} MAD/an, bien en dessous de la moyenne.`,
    `Notre accompagnement vous fera passer de 'tres bon' a 'reference du marche' en optimisant les derniers details.`,
    `Prochaine etape : un appel de 15 minutes pour identifier les 2-3 leviers restants.`,
  ];
  if (g === "B") return [
    `${f.riad_name} a de bonnes bases mais laisse filer ${loss.toLocaleString()} MAD par an en opportunites non saisies.`,
    `Avec un score de ${score}/100, vous etes au-dessus de la moyenne mais loin du potentiel reel de votre etablissement.`,
    `En 90 jours, nos clients dans votre situation recuperent en moyenne 25 a 40% de cette perte.`,
    `Prochaine etape : un audit video personnalise de 3 minutes pour voir exactement ou agir.`,
  ];
  if (g === "C") return [
    `${f.riad_name} sous-performe. ${loss.toLocaleString()} MAD de perte annuelle, soit ${Math.round(loss / 12).toLocaleString()} MAD/mois en commissions evitables et chambres vides.`,
    `La bonne nouvelle : ${Math.round(loss * 0.7).toLocaleString()} MAD de cette perte est recuperable avec des actions concretes en 6 mois.`,
    `Nos clients qui demarrent avec un score similaire atteignent +25 points en 90 jours.`,
    `Prochaine etape : un diagnostic complet avec plan d'action personnalise.`,
  ];
  return [
    `${f.riad_name} est en urgence digitale. ${loss.toLocaleString()} MAD de perte sur un CA de ${ca.toLocaleString()} MAD, c'est ${pct}% de votre chiffre d'affaires qui s'evapore.`,
    `Chaque mois sans action, vous perdez ${Math.round(loss / 12).toLocaleString()} MAD.`,
    `La situation est reversible : ${Math.round(loss * 0.7).toLocaleString()} MAD recuperables en 12 mois avec un accompagnement structure.`,
    `Prochaine etape : un appel prioritaire cette semaine pour stopper l'hemorragie.`,
  ];
}

export function generatePDF(data: GlobalAuditResponse, form: FormData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const H = 297;
  const gi = gradeInfo(data.grade);
  const b = getBench(form);
  const ca = form.annual_revenue_mad || 0;
  const loss = data.total_annual_loss_mad || 0;
  const lossEur = data.total_annual_loss_eur || 0;
  const score = data.global_score || 0;
  const subs = data.sub_scores || {};

  function bg() {
    doc.setFillColor(...C.bg);
    doc.rect(0, 0, W, H, "F");
    doc.setFillColor(...C.terra);
    doc.rect(0, 0, 6, H, "F");
  }

  function header(title: string, sub?: string) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...C.white);
    doc.text(title, 20, 25);
    if (sub) {
      doc.setFontSize(10);
      doc.setTextColor(...C.muted);
      doc.setFont("helvetica", "normal");
      doc.text(sub, 20, 35);
    }
  }

  // ── PAGE 1 : GARDE ──
  bg();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...C.terra);
  doc.text("RIADPULSE", 20, 30);
  doc.setFontSize(10);
  doc.setTextColor(...C.muted);
  doc.setFont("helvetica", "normal");
  doc.text("Audit Digital Performance", 20, 38);
  doc.setDrawColor(...C.surface);
  doc.line(20, 50, 190, 50);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.setTextColor(...C.white);
  doc.text(form.riad_name || "Votre Riad", 20, 80);

  doc.setFontSize(13);
  doc.setTextColor(...C.muted);
  doc.setFont("helvetica", "normal");
  doc.text(`${form.city}  |  ${form.stars} etoiles  |  ${form.num_rooms} chambres`, 20, 92);

  doc.setFontSize(16);
  doc.setTextColor(...gi.color);
  doc.setFont("helvetica", "bold");
  doc.text(gi.title, 20, 115);

  doc.setFillColor(...C.surface);
  doc.roundedRect(20, 135, 80, 38, 4, 4, "F");
  doc.setFontSize(26);
  doc.setTextColor(...C.terra);
  doc.setFont("helvetica", "bold");
  doc.text(`${score}/100`, 35, 158);
  doc.setFontSize(9);
  doc.setTextColor(...C.muted);
  doc.setFont("helvetica", "normal");
  doc.text("Score global", 35, 167);

  doc.setFillColor(...C.surface);
  doc.roundedRect(110, 135, 80, 38, 4, 4, "F");
  doc.setFontSize(18);
  doc.setTextColor(...C.red);
  doc.setFont("helvetica", "bold");
  doc.text(`-${loss.toLocaleString()} MAD`, 118, 155);
  doc.setFontSize(9);
  doc.setTextColor(...C.muted);
  doc.setFont("helvetica", "normal");
  doc.text("Perte annuelle estimee", 118, 167);

  doc.setFontSize(9);
  doc.setTextColor(...C.muted);
  doc.text(`Rapport genere le ${new Date().toLocaleDateString("fr-FR")}`, 20, 272);
  doc.text("RiadPulse - Audit Digital pour Riads et Hotels Independants au Maroc", 20, 280);

  // ── PAGE 2 : RESUME ──
  doc.addPage();
  bg();
  header("Resume Executif", `${form.riad_name} - ${form.city} - Score ${score}/100 (${data.grade})`);

  let y = 48;
  for (const [key, sub] of Object.entries(subs)) {
    const label = LABELS[key] || key;
    const s = Math.round(sub.score || 0);
    const w = sub.weight || 25;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.white);
    doc.text(`${label} : ${s}/100`, 20, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...C.muted);
    doc.text(`(poids ${w}%)`, 95, y);
    y += 6;

    doc.setFontSize(9);
    doc.setTextColor(...C.light);
    const lines = doc.splitTextToSize(moduleDiag(key, s, form), 165);
    doc.text(lines, 20, y);
    y += lines.length * 4.2 + 7;
  }

  y += 3;
  doc.setDrawColor(...C.surface);
  doc.line(20, y, 190, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...C.terra);
  doc.text("Impact financier", 20, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.light);
  const impactText = ca > 0
    ? `Sur un CA de ${ca.toLocaleString()} MAD, votre score de ${score}/100 genere une perte de ${loss.toLocaleString()} MAD/an (${lossEur.toLocaleString()} EUR). Cela represente ${Math.round((loss / ca) * 100)}% de votre chiffre d'affaires.`
    : `Perte estimee : ${loss.toLocaleString()} MAD/an. Renseignez votre CA annuel pour une analyse financiere precise.`;
  const impLines = doc.splitTextToSize(impactText, 165);
  doc.text(impLines, 20, y);

  // ── PAGE 3 : METHODOLOGIE ──
  doc.addPage();
  bg();
  header("Methodologie et Sources");

  const metho = [
    "Cet audit est genere a partir de vos donnees et de benchmarks sectoriels verifies.",
    "",
    "Sources :",
    "- Observatoire du Tourisme Maroc 2023-2024 (ADR, RevPAR, occupation)",
    "- Agregation Booking / TripAdvisor / Google (notes et avis)",
    "- Commissions : Booking 18%, Airbnb 15%, Expedia 20% (standards 2024)",
    "- Taux de change : 1 EUR = 10.8 MAD",
    "",
    "Scoring :",
    "- 4 axes : Visibilite, Prix, Reputation, Reservations directes",
    "- Chaque axe note sur 100 vs medianes locales par etoiles",
    "- Score global = moyenne ponderee",
    "- Perte = CA x (1 - score/100) x facteur recuperation",
    "",
    "Limites :",
    "- Donnees basees sur vos declarations",
    "- Benchmarks = medianes, votre cas peut varier",
    "- La perte est une estimation, pas un bilan comptable",
  ];

  y = 45;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.light);
  for (const line of metho) {
    if (!line) { y += 3; continue; }
    doc.text(line, 20, y);
    y += 5.5;
  }

  // ── PAGE 4 : BENCHMARK ──
  doc.addPage();
  bg();
  header("Benchmark Local", `Comparaison avec les ${form.stars} etoiles de ${form.city}`);

  const adrDiff = form.current_price_mad - b.adr;
  const adrPct = b.adr > 0 ? Math.round((adrDiff / b.adr) * 100) : 0;
  const noteDiff = (form.booking_score - b.booking).toFixed(1);
  const revDiff = form.booking_reviews - b.reviews;
  const dirDiff = form.direct_percent - b.direct;

  const benchRows = [
    ["Indicateur", "Votre riad", `Mediane ${form.stars}★`, "Ecart"],
    ["ADR (MAD/nuit)", `${form.current_price_mad}`, `${b.adr}`, `${adrDiff >= 0 ? "+" : ""}${adrPct}%`],
    ["Note Booking", `${form.booking_score}/10`, `${b.booking}/10`, `${Number(noteDiff) >= 0 ? "+" : ""}${noteDiff}`],
    ["Avis Booking", `${form.booking_reviews}`, `${b.reviews}`, `${revDiff >= 0 ? "+" : ""}${revDiff}`],
    ["% Direct", `${form.direct_percent}%`, `${b.direct}%`, `${dirDiff >= 0 ? "+" : ""}${dirDiff} pts`],
  ];

  autoTable(doc, {
    startY: 42,
    head: [benchRows[0]],
    body: benchRows.slice(1),
    headStyles: { fillColor: C.terra, textColor: C.white, fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: C.light },
    alternateRowStyles: { fillColor: C.surface },
    theme: "grid",
    styles: { cellPadding: 4 },
    margin: { left: 20, right: 20 },
  });

  y = (doc as any).lastAutoTable.finalY + 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...C.white);
  doc.text("Analyse", 20, y);
  y += 7;

  let analysis = "";
  if (adrDiff < -100) analysis += `Votre ADR est ${Math.abs(adrDiff)} MAD sous la mediane. Vous bradez vos chambres. `;
  else if (adrDiff > 200) analysis += `Votre ADR est ${adrDiff} MAD au-dessus. Votre reputation (${form.booking_score}/10) le justifie. `;
  else if (adrDiff > 0) analysis += `Votre ADR est legerement au-dessus de la mediane, ce qui est coherent avec votre positionnement. `;
  else analysis += `Votre ADR est aligne avec le marche. `;

  if (Number(noteDiff) < -0.3) analysis += `Votre note Booking est sous la mediane. Chaque +0.1 point augmente la conversion de 3-5%. `;
  else if (Number(noteDiff) > 0.5) analysis += `Votre note Booking depasse la mediane de ${noteDiff} points : avantage concurrentiel fort. `;

  if (dirDiff < -10) analysis += `Votre part de direct est ${Math.abs(dirDiff)} pts sous la mediane. Vous surpayez en commissions.`;
  else if (dirDiff > 5) analysis += `Votre part de direct est excellente pour votre categorie.`;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.light);
  doc.text(doc.splitTextToSize(analysis, 165), 20, y);

  // ── PAGE 5 : COMMISSIONS ──
  doc.addPage();
  bg();
  header("Calculateur Commissions OTA", `CA annuel : ${ca.toLocaleString()} MAD`);

  const bk = form.booking_percent || 0;
  const ab = form.airbnb_percent || 0;
  const ex = form.expedia_percent || 0;
  const dr = form.direct_percent || 0;
  const totalCh = bk + ab + ex + dr;

  const commBk = Math.round(ca * (bk / 100) * 0.18);
  const commAb = Math.round(ca * (ab / 100) * 0.15);
  const commEx = Math.round(ca * (ex / 100) * 0.20);
  const totalComm = commBk + commAb + commEx;

  if (totalCh === 0) {
    y = 45;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...C.gold);
    doc.text("Repartition des canaux non renseignee.", 20, y);
    y += 8;
    doc.setFontSize(9);
    doc.setTextColor(...C.light);
    const noDataText = `Vous n'avez pas indique la repartition de vos reservations. Pour un riad ${form.stars} etoiles a ${form.city}, la repartition moyenne est : Booking 55%, Airbnb 15%, Expedia 5%, Direct 25%. Sur votre CA de ${ca.toLocaleString()} MAD, cela representerait environ ${Math.round(ca * 0.55 * 0.18 + ca * 0.15 * 0.15 + ca * 0.05 * 0.2).toLocaleString()} MAD de commissions OTA par an. Relancez l'audit en remplissant les champs de repartition pour un calcul precis.`;
    doc.text(doc.splitTextToSize(noDataText, 165), 20, y);
  } else {
    const commRows = [
      ["Canal", "% du CA", "Revenu via canal", "Commission", "Cout annuel"],
      ["Booking.com", `${bk}%`, `${Math.round(ca * bk / 100).toLocaleString()} MAD`, "18%", `${commBk.toLocaleString()} MAD`],
      ["Airbnb", `${ab}%`, `${Math.round(ca * ab / 100).toLocaleString()} MAD`, "15%", `${commAb.toLocaleString()} MAD`],
      ["Expedia", `${ex}%`, `${Math.round(ca * ex / 100).toLocaleString()} MAD`, "20%", `${commEx.toLocaleString()} MAD`],
      ["Direct", `${dr}%`, `${Math.round(ca * dr / 100).toLocaleString()} MAD`, "0%", "0 MAD"],
      ["TOTAL", `${totalCh}%`, `${ca.toLocaleString()} MAD`, "-", `${totalComm.toLocaleString()} MAD`],
    ];

    autoTable(doc, {
      startY: 42,
      head: [commRows[0]],
      body: commRows.slice(1),
      headStyles: { fillColor: C.terra, textColor: C.white, fontStyle: "bold", fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: C.light },
      alternateRowStyles: { fillColor: C.surface },
      theme: "grid",
      styles: { cellPadding: 3 },
      margin: { left: 20, right: 20 },
      didParseCell: (h: any) => {
        if (h.row.index === commRows.length - 2) {
          h.cell.styles.fontStyle = "bold";
          h.cell.styles.textColor = C.terra;
        }
      },
    });

    y = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.terra);
    doc.text(`Vous versez ${totalComm.toLocaleString()} MAD/an en commissions OTA`, 20, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.light);
    const newBk = Math.round(bk * 0.7);
    const newAb = Math.round(ab * 0.8);
    const newEx = Math.round(ex * 0.6);
    const newDr = 100 - newBk - newAb - newEx;
    const newComm = Math.round(ca * (newBk / 100) * 0.18 + ca * (newAb / 100) * 0.15 + ca * (newEx / 100) * 0.2);
    const saving = totalComm - newComm;

    const scText = `En basculant vers ${newBk}% Booking / ${newAb}% Airbnb / ${newEx}% Expedia / ${newDr}% direct, vos commissions passeraient de ${totalComm.toLocaleString()} a ${newComm.toLocaleString()} MAD. Economie : ${saving.toLocaleString()} MAD/an = ${Math.round(saving / Math.max(form.current_price_mad, 1))} nuits gratuites.`;
    doc.text(doc.splitTextToSize(scText, 165), 20, y);
  }

  // ── PAGE 6 : PLAN D'ACTION ──
  doc.addPage();
  bg();
  header("Plan d'Action Personnalise", `Base sur vos scores reels - ${form.riad_name}`);

  const actions = getActions(data, form);
  if (actions.length > 0) {
    const actRows = [
      ["#", "Axe", "Action", "Impact", "Effort", "Delai"],
      ...actions.map((a, i) => [`${i + 1}`, a.module, a.action, a.impact, a.effort, a.delai]),
    ];

    autoTable(doc, {
      startY: 42,
      head: [actRows[0]],
      body: actRows.slice(1),
      headStyles: { fillColor: C.terra, textColor: C.white, fontStyle: "bold", fontSize: 8 },
      bodyStyles: { fontSize: 7.5, textColor: C.light },
      alternateRowStyles: { fillColor: C.surface },
      theme: "grid",
      styles: { cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 8, fontStyle: "bold", textColor: C.terra },
        1: { cellWidth: 25, fontStyle: "bold" },
        2: { cellWidth: 65 },
        3: { cellWidth: 25, textColor: C.green },
        4: { cellWidth: 18 },
        5: { cellWidth: 18 },
      },
      margin: { left: 20, right: 20 },
    });
  }

  y = actions.length > 0 ? (doc as any).lastAutoTable.finalY + 12 : 50;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.muted);
  doc.text("Conseil : commencez par les 2 actions 'faciles' cette semaine. Elles representent souvent 60% du gain pour 20% de l'effort.", 20, y);

  // ── PAGE 7 : 30/60/90 ──
  doc.addPage();
  bg();
  header("Plan 30 / 60 / 90 Jours", "Feuille de route adaptee a vos faiblesses identifiees");

  const sorted = Object.entries(subs).sort((a, b) => (a[1].score || 0) - (b[1].score || 0));
  const w1 = LABELS[sorted[0]?.[0]] || "Visibilite";
  const w2 = LABELS[sorted[1]?.[0]] || "Prix";
  const w3 = LABELS[sorted[2]?.[0]] || "Reputation";

  const phases = [
    { label: "JOURS 1-30", color: C.red, text: `Corriger ${w1} (score le plus faible). Objectif : +15 points. Actions immediates a fort impact, zero investissement lourd.` },
    { label: "JOURS 31-60", color: C.gold, text: `Attaquer ${w2}. Mettre en place outils et process. Premieres mesures de resultat sur ${w1}.` },
    { label: "JOURS 61-90", color: C.green, text: `Optimiser ${w3} + consolider les gains. Audit de suivi pour mesurer la progression globale.` },
  ];

  y = 48;
  for (const p of phases) {
    doc.setFillColor(...C.surface);
    doc.roundedRect(20, y, 170, 32, 3, 3, "F");
    doc.setFillColor(...p.color);
    doc.roundedRect(20, y, 4, 32, 2, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...p.color);
    doc.text(p.label, 30, y + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.light);
    doc.text(doc.splitTextToSize(p.text, 145), 30, y + 16);
    y += 40;
  }

  y += 5;
  const target = Math.min(100, score + 20);
  const targetLoss = Math.round(loss * 0.6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.white);
  doc.text(`Objectif 90j : ${score}/100 → ${target}/100. Perte : ${loss.toLocaleString()} → ${targetLoss.toLocaleString()} MAD.`, 20, y);

  // ── PAGE 8 : PROJECTION ──
  doc.addPage();
  bg();
  header("Projection Avant / Apres", `Perte recuperable : ${Math.round(loss * 0.7).toLocaleString()} MAD`);

  const recov = loss * 0.7;
  const projRows = [
    ["Horizon", "Gain additionnel", "Nouveau CA", "Leviers"],
    ["3 mois", `+${Math.round(recov * 0.25).toLocaleString()} MAD`, `${Math.round(ca + recov * 0.25).toLocaleString()} MAD`, "Site web, pricing, WhatsApp direct"],
    ["6 mois", `+${Math.round(recov * 0.55).toLocaleString()} MAD`, `${Math.round(ca + recov * 0.55).toLocaleString()} MAD`, "Revenue management + reputation"],
    ["12 mois", `+${Math.round(recov * 0.85).toLocaleString()} MAD`, `${Math.round(ca + recov * 0.85).toLocaleString()} MAD`, "Canal direct dominant, pricing dynamique"],
  ];

  autoTable(doc, {
    startY: 42,
    head: [projRows[0]],
    body: projRows.slice(1),
    headStyles: { fillColor: C.terra, textColor: C.white, fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: C.light },
    alternateRowStyles: { fillColor: C.surface },
    theme: "grid",
    styles: { cellPadding: 5 },
    columnStyles: {
      0: { cellWidth: 25, fontStyle: "bold", textColor: C.gold },
      1: { cellWidth: 35, textColor: C.green },
      2: { cellWidth: 40 },
      3: { cellWidth: 65 },
    },
    margin: { left: 20, right: 20 },
  });

  y = (doc as any).lastAutoTable.finalY + 12;
  const roi = ca > 0 ? Math.round((recov * 0.85) / 1500) : 0;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.white);
  doc.text(`ROI Audit Complet (1 500 MAD) : x${roi} en 12 mois`, 20, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.light);
  doc.text(`Pour chaque dirham investi, vous recuperez ${roi} MAD de revenu additionnel.`, 20, y);

  // ── PAGE 9 : OFFRES ──
  doc.addPage();
  bg();
  header("Nos Offres d'Accompagnement");

  const offers = [
    { name: "Audit Flash", price: "500 MAD", desc: "Ce rapport automatise", features: "Score 100 | 4 axes | Top 5 priorites | Benchmark", color: C.muted },
    { name: "Audit Complet + Video", price: "1 500 MAD", desc: "PDF + Loom 3 min + 1 mois suivi", features: "Tout le Flash + Video + Plan detaille + Suivi WhatsApp", color: C.terra },
    { name: "Suivi Mensuel", price: "700 MAD/mois", desc: "Coaching continu + reporting", features: "Audit mensuel + Alertes + Pricing + Reputation", color: C.gold },
  ];

  y = 45;
  for (const o of offers) {
    doc.setFillColor(...C.surface);
    doc.roundedRect(20, y, 170, 42, 3, 3, "F");
    doc.setFillColor(...o.color);
    doc.roundedRect(20, y, 4, 42, 2, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...o.color);
    doc.text(o.name, 30, y + 10);
    doc.setFontSize(14);
    doc.text(o.price, 140, y + 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...C.muted);
    doc.text(o.desc, 30, y + 18);
    doc.setTextColor(...C.light);
    doc.text(o.features, 30, y + 28);
    y += 50;
  }

  // ── PAGE 10 : CONCLUSION ──
  doc.addPage();
  bg();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...C.white);
  doc.text("Conclusion", 20, 30);
  doc.setDrawColor(...C.surface);
  doc.line(20, 38, 190, 38);

  const paras = conclusionParas(data, form);
  y = 52;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...C.light);
  for (const p of paras) {
    const pl = doc.splitTextToSize(p, 165);
    doc.text(pl, 20, y);
    y += pl.length * 6 + 7;
  }

  y += 10;
  doc.setFillColor(...C.terra);
  doc.roundedRect(20, y, 170, 35, 4, 4, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...C.white);
  doc.text("Pret a passer a l'action ?", 45, y + 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Contactez-nous sur WhatsApp pour votre diagnostic personnalise", 35, y + 25);

  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text(`RiadPulse 2026 - Rapport genere le ${new Date().toLocaleDateString("fr-FR")} pour ${form.riad_name}`, 20, 283);

  doc.save(`Audit_${(form.riad_name || "Riad").replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`);
}