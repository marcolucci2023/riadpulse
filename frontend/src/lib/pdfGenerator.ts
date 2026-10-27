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

function fmt(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const LABELS: Record<string, string> = {
  site_web: "Visibilit\u00e9",
  pricing: "Prix",
  reputation: "R\u00e9putation",
  commissions: "R\u00e9servations directes",
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
  if (g === "A") return { title: "Excellente performance", color: C.green };
  if (g === "B") return { title: "Bonnes bases, potentiel inexploit\u00e9", color: C.gold };
  if (g === "C") return { title: "Lacunes significatives", color: C.terra };
  return { title: "Situation critique", color: C.red };
}

function moduleDiag(key: string, score: number, f: FormData): string {
  const s = Math.round(score);
  const b = getBench(f);
  if (key === "site_web") {
    if (s < 30) return `Votre site web est inexistant ou inaccessible. Avec ${f.num_rooms} chambres \u00e0 remplir, vos clients potentiels ne vous trouvent pas en ligne. Chaque jour sans site visible, vous perdez des r\u00e9servations directes au profit des OTA.`;
    if (s < 60) return `Votre site existe mais les indicateurs sugg\u00e8rent un potentiel de conversion sous-exploit\u00e9. Des am\u00e9liorations de design, de vitesse ou de parcours de r\u00e9servation pourraient r\u00e9duire votre d\u00e9pendance aux OTA.`;
    if (s < 80) return `Votre site est fonctionnel et les indicateurs disponibles sugg\u00e8rent un bon potentiel. Une optimisation SEO et du parcours de r\u00e9servation pourrait augmenter vos r\u00e9servations directes.`;
    return `Votre visibilit\u00e9 digitale est solide. Les indicateurs sugg\u00e8rent un bon positionnement. Quelques ajustements SEO pourraient renforcer votre avantage.`;
  }
  if (key === "pricing") {
    if (s < 30) return `Vos tarifs semblent d\u00e9connect\u00e9s du march\u00e9. ADR de ${f.current_price_mad} MAD contre une m\u00e9diane de ${b.adr} MAD pour les ${f.stars} \u00e9toiles \u00e0 ${f.city}. Un \u00e9cart important signale un potentiel d'optimisation.`;
    if (s < 60) return `Votre pricing manque probablement de flexibilit\u00e9. La demande \u00e0 ${f.city} varie fortement entre haute et basse saison. Un calendrier tarifaire dynamique pourrait am\u00e9liorer votre RevPAR.`;
    if (s < 80) return `Votre strat\u00e9gie tarifaire est coh\u00e9rente. ADR de ${f.current_price_mad} MAD proche de la m\u00e9diane (${b.adr} MAD). Un revenue management dynamique pourrait augmenter votre RevPAR de 10 \u00e0 20%.`;
    return `Votre strat\u00e9gie tarifaire est bien positionn\u00e9e. ADR de ${f.current_price_mad} MAD coh\u00e9rent avec le march\u00e9. Affinez vos tarifs \u00e9v\u00e9nements et last-minute.`;
  }
  if (key === "reputation") {
    if (s < 30) return `Votre e-r\u00e9putation n\u00e9cessite une attention urgente. ${f.booking_reviews} avis Booking, note de ${f.booking_score}/10. En dessous de 8.0, la visibilit\u00e9 dans les r\u00e9sultats de recherche diminue fortement.`;
    if (s < 60) return `Vos avis sont corrects mais perfectibles. ${f.booking_reviews} avis sur Booking, note de ${f.booking_score}/10. Passer au-dessus de 8.5 pourrait d\u00e9clencher un effet de pr\u00e9f\u00e9rence.`;
    if (s < 80) return `Votre r\u00e9putation est bonne. ${f.booking_reviews} avis, note de ${f.booking_score}/10, au-dessus de la m\u00e9diane. Continuez \u00e0 solliciter des avis post-s\u00e9jour et \u00e0 r\u00e9pondre \u00e0 100% des commentaires.`;
    return `Votre r\u00e9putation en ligne est excellente. ${f.booking_reviews} avis, note de ${f.booking_score}/10. L'enjeu est maintenant de consolider cet avantage et de le valoriser sur vos canaux directs.`;
  }
  if (key === "commissions") {
    if (f.direct_percent < 10) return `Vous d\u00e9pendez massivement des OTA. ${f.booking_percent}% Booking + ${f.airbnb_percent}% Airbnb + ${f.expedia_percent}% Expedia = seulement ${f.direct_percent}% en direct. Une part significative de votre CA part en commissions.`;
    if (f.direct_percent < 20) return `Vous commencez \u00e0 capter du direct (${f.direct_percent}%) mais les OTA dominent encore votre mix. Un site optimis\u00e9 + canal WhatsApp direct pourrait basculer 10-15% du volume.`;
    if (f.direct_percent < 30) return `Votre mix s'\u00e9quilibre. ${f.direct_percent}% de direct, proche de la m\u00e9diane \u00e0 ${f.city}. Continuez \u00e0 investir : email, fid\u00e9lisation, offres exclusives.`;
    return `Votre mix est excellent. ${f.direct_percent}% de direct pour ${f.num_rooms} chambres. Vous ma\u00eetrisez vos co\u00fbts d'acquisition.`;
  }
  return "";
}

function getActions(data: GlobalAuditResponse, f: FormData) {
  const items: { pri: string; module: string; action: string; impact: string; effort: string; delai: string; score: number }[] = [];
  const subs = data.sub_scores || {};
  const b = getBench(f);
  const ca = f.annual_revenue_mad || 0;

  for (const [key, sub] of Object.entries(subs)) {
    const s = sub.score || 0;
    const label = LABELS[key] || key;
    const isHigh = s >= 90;

    if (key === "site_web") {
      if (s < 30) items.push({ pri: "P1", module: label, action: "Cr\u00e9er un site one-page avec moteur de r\u00e9servation (Mews, Cloudbeds)", impact: `+${fmt(ca * 0.08)} MAD`, effort: "Moyen", delai: "30j", score: s });
      else if (s < 60) items.push({ pri: "P2", module: label, action: "Ajouter bouton R\u00e9server + photos HD + page tarifs claire", impact: `+${fmt(ca * 0.05)} MAD`, effort: "Faible", delai: "15j", score: s });
      else items.push({ pri: "P3", module: label, action: `Optimiser SEO local (Google Business + mots-cl\u00e9s '${f.city} riad')`, impact: `+${fmt(ca * 0.03)} MAD`, effort: "Faible", delai: "30j", score: s });
    }
    if (key === "pricing") {
      if (s < 30) items.push({ pri: "P1", module: label, action: `R\u00e9aligner ADR sur m\u00e9diane ${b.adr} MAD + cr\u00e9er 3 saisons tarifaires`, impact: `+${fmt(ca * 0.12)} MAD`, effort: "Moyen", delai: "15j", score: s });
      else if (s < 60) items.push({ pri: "P1", module: label, action: "Calendrier dynamique : haute/basse/intersaison + tarifs \u00e9v\u00e9nements", impact: `+${fmt(ca * 0.08)} MAD`, effort: "Moyen", delai: "30j", score: s });
      else items.push({ pri: "P3", module: label, action: "Offres last-minute et early-bird pour lisser l'occupation", impact: `+${fmt(ca * 0.04)} MAD`, effort: "Faible", delai: "15j", score: s });
    }
    if (key === "reputation") {
      if (s < 30) items.push({ pri: "P1", module: label, action: "Syst\u00e8me collecte avis post-s\u00e9jour (WhatsApp + email J+1)", impact: `+${fmt(ca * 0.06)} MAD`, effort: "Faible", delai: "15j", score: s });
      else if (s < 60) items.push({ pri: "P2", module: label, action: "R\u00e9pondre 100% des avis en 24h + r\u00e9soudre 3 plaintes r\u00e9currentes", impact: `+${fmt(ca * 0.04)} MAD`, effort: "Faible", delai: "30j", score: s });
      else items.push({ pri: "P4", module: label, action: isHigh ? "Consolider l'avantage : publier les meilleurs avis sur le site, d\u00e9velopper Google et maintenir le processus de r\u00e9ponse" : "Publier les meilleurs avis sur le site + diversifier Google", impact: isHigh ? "Protection" : `+${fmt(ca * 0.02)} MAD`, effort: "Faible", delai: "15j", score: s });
    }
    if (key === "commissions") {
      if (s < 30) items.push({ pri: "P1", module: label, action: "Canal WhatsApp Business + offre exclusive '-10% en direct'", impact: `+${fmt(ca * 0.10)} MAD`, effort: "Faible", delai: "7j", score: s });
      else if (s < 60) items.push({ pri: "P2", module: label, action: "Programme fid\u00e9lisation email + offre retour clients", impact: `+${fmt(ca * 0.06)} MAD`, effort: "Moyen", delai: "30j", score: s });
      else items.push({ pri: "P3", module: label, action: "N\u00e9gocier commissions OTA (volume > 500 nuits = levier)", impact: `+${fmt(ca * 0.03)} MAD`, effort: "Moyen", delai: "60j", score: s });
    }
  }

  items.sort((a, b) => a.score - b.score);
  return items.slice(0, 5);
}

function conclusionParas(data: GlobalAuditResponse, f: FormData, gain12: number, central: number, recov: number): string[] {
  const g = data.grade || "C";
  const score = data.global_score || 0;
  const ca = f.annual_revenue_mad || 0;
  const pct = ca > 0 ? Math.round((central / ca) * 100) : 0;

  if (g === "A") return [
    `${f.riad_name} fait partie des riads les plus performants de ${f.city} avec un score de ${score}/100.`,
    `L'opportunit\u00e9 de croissance estim\u00e9e est d'environ ${fmt(central)} MAD/an, bien en dessous de la moyenne du secteur.`,
    `Notre accompagnement vous fera passer de \u00ab tr\u00e8s bon \u00bb \u00e0 \u00ab r\u00e9f\u00e9rence du march\u00e9 \u00bb en optimisant les derniers d\u00e9tails.`,
    `Prochaine \u00e9tape : un appel de 15 minutes pour identifier les 2-3 leviers restants.`,
  ];
  if (g === "B") return [
    `${f.riad_name} pr\u00e9sente une opportunit\u00e9 de croissance estim\u00e9e \u00e0 environ ${fmt(central)} MAD par an, principalement li\u00e9e au pricing et au d\u00e9veloppement des r\u00e9servations directes.`,
    `Avec un score de ${score}/100, vous \u00eates au-dessus de la moyenne mais loin du potentiel r\u00e9el de votre \u00e9tablissement.`,
    `Selon les cas accompagn\u00e9s, une r\u00e9cup\u00e9ration de 25 \u00e0 40% de cette opportunit\u00e9 est envisageable en 90 jours, sous r\u00e9serve de l'ex\u00e9cution des recommandations.`,
    `Prochaine \u00e9tape : un audit vid\u00e9o personnalis\u00e9 de 3 minutes pour voir exactement o\u00f9 agir.`,
  ];
  if (g === "C") return [
    `${f.riad_name} sous-performe par rapport \u00e0 ses concurrents directs. L'opportunit\u00e9 de croissance est estim\u00e9e \u00e0 environ ${fmt(central)} MAD/an, soit ${fmt(central / 12)} MAD/mois.`,
    `Une part significative de cette opportunit\u00e9 est r\u00e9cup\u00e9rable avec des actions concr\u00e8tes en 6 mois.`,
    `Selon les cas accompagn\u00e9s, une progression de +5 \u00e0 +10 points est envisageable en 90 jours, sous r\u00e9serve de l'ex\u00e9cution du plan d'action.`,
    `Prochaine \u00e9tape : un diagnostic complet avec plan d'action personnalis\u00e9.`,
  ];
  return [
    `${f.riad_name} est en urgence digitale. L'opportunit\u00e9 de croissance est estim\u00e9e \u00e0 environ ${fmt(central)} MAD sur un CA de ${fmt(ca)} MAD, soit ${pct}% de votre chiffre d'affaires.`,
    `Chaque mois sans action repr\u00e9sente environ ${fmt(central / 12)} MAD de revenu potentiel non capt\u00e9.`,
    `La situation est r\u00e9versible. Avec un accompagnement structur\u00e9, une r\u00e9cup\u00e9ration significative est envisageable en 12 mois.`,
    `Prochaine \u00e9tape : un appel prioritaire cette semaine pour \u00e9tablir un plan d'action imm\u00e9diat.`,
  ];
}

export function generatePDF(data: GlobalAuditResponse, form: FormData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const H = 297;
  const gi = gradeInfo(data.grade);
  const b = getBench(form);
  const ca = form.annual_revenue_mad || 0;
  const score = data.global_score || 0;
  const subs = data.sub_scores || {};

  const perteTheo = ca > 0 ? Math.round(ca * (1 - score / 100)) : (data.total_annual_loss_mad || 0);
  const facteur = perteTheo > 0 ? Math.round(((data.total_annual_loss_mad || perteTheo) / perteTheo) * 1000) / 10 : 100;
  const central = Math.round(perteTheo * facteur / 100);
  const fourchetteBasse = Math.round(perteTheo * 0.70);
  const fourchetteHaute = perteTheo;
  const recov = Math.round(central * 0.70);
  const gain3 = Math.round(recov * 0.25);
  const gain6 = Math.round(recov * 0.55);
  const gain12 = Math.round(recov * 0.85);
  const residuel12 = central - gain12;

  const sorted = Object.entries(subs).sort((a, b) => (a[1].score || 0) - (b[1].score || 0));
  const weakestKey = sorted[0]?.[0] || "pricing";
  const weakestWeight = subs[weakestKey]?.weight || 0.25;
  const wPctVal = weakestWeight <= 1 ? weakestWeight : weakestWeight / 100;
  const scoreGain90 = Math.round(10 * wPctVal * 10) / 10;
  const target90 = Math.min(100, Math.round((score + scoreGain90) * 10) / 10);
  const target12 = Math.min(100, Math.round(score + 10));

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
  doc.text(`${form.city}  |  ${form.stars} \u00e9toiles  |  ${form.num_rooms} chambres`, 20, 92);

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
  doc.setFontSize(13);
  doc.setTextColor(...C.gold);
  doc.setFont("helvetica", "bold");
  doc.text(`~${fmt(central)} MAD`, 118, 152);
  doc.setFontSize(9);
  doc.setTextColor(...C.muted);
  doc.setFont("helvetica", "normal");
  doc.text("Opportunit\u00e9 annuelle estim\u00e9e", 118, 160);
  doc.setFontSize(7);
  doc.text(`Fourchette : ${fmt(fourchetteBasse)} - ${fmt(fourchetteHaute)}`, 118, 167);

  doc.setFontSize(9);
  doc.setTextColor(...C.muted);
  doc.text(`Rapport g\u00e9n\u00e9r\u00e9 le ${new Date().toLocaleDateString("fr-FR")}`, 20, 272);
  doc.text("RiadPulse - Audit Digital pour Riads et H\u00f4tels Ind\u00e9pendants au Maroc", 20, 280);

  // ── PAGE 2 : RESUME ──
  doc.addPage();
  bg();
  header("R\u00e9sum\u00e9 Ex\u00e9cutif", `${form.riad_name} - ${form.city} - Score ${score}/100 (${data.grade})`);

  let y = 48;
  for (const [key, sub] of Object.entries(subs)) {
    const label = LABELS[key] || key;
    const s = Math.round(sub.score || 0);
    const w = sub.weight || 0.25;
    const wPct = w <= 1 ? Math.round(w * 100) : Math.round(w);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.white);
    doc.text(`${label} : ${s}/100`, 20, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...C.muted);
    doc.text(`(poids ${wPct}%)`, 110, y);
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
  let impactText = "";
  if (ca > 0) {
    impactText = `Opportunit\u00e9 th\u00e9orique : ${fmt(perteTheo)} MAD/an (CA x (1 - score/100)). `;
    impactText += `Facteur d'ajustement : ${facteur}%. `;
    impactText += `Estimation centrale : ${fmt(central)} MAD/an (${fmt(Math.round(central / 10.8))} EUR). `;
    impactText += `Fourchette indicative (70%-100% du potentiel) : ${fmt(fourchetteBasse)} \u00e0 ${fmt(fourchetteHaute)} MAD. `;
    impactText += `Cela repr\u00e9sente environ ${Math.round((central / ca) * 100)}% de votre CA.`;
  } else {
    impactText = `Opportunit\u00e9 estim\u00e9e : ${fmt(central)} MAD/an. Renseignez votre CA annuel pour une analyse pr\u00e9cise.`;
  }
  doc.text(doc.splitTextToSize(impactText, 165), 20, y);

  // ── PAGE 3 : METHODOLOGIE ──
  doc.addPage();
  bg();
  header("M\u00e9thodologie et Sources");

  const metho = [
    "Cet audit est g\u00e9n\u00e9r\u00e9 \u00e0 partir de vos donn\u00e9es et de benchmarks sectoriels.",
    "",
    "Niveau de confiance : Moyen",
    "L'analyse repose sur des donn\u00e9es d\u00e9clar\u00e9es, des benchmarks publics et des",
    "hypoth\u00e8ses de commission. Les r\u00e9sultats financiers sont des estimations",
    "indicatives et ne constituent pas une pr\u00e9vision garantie.",
    "",
    "Donn\u00e9es d\u00e9clar\u00e9es par l'\u00e9tablissement :",
    "- CA annuel, taux d'occupation, ADR, nombre de chambres",
    "- Notes et volumes d'avis (Booking, TripAdvisor, Google)",
    "- R\u00e9partition des canaux de r\u00e9servation",
    "",
    "Donn\u00e9es observ\u00e9es automatiquement :",
    "- Accessibilit\u00e9 et technologie du site web (audit HTTP)",
    "",
    "Benchmarks et hypoth\u00e8ses :",
    "- M\u00e9dianes par ville et \u00e9toiles : Observatoire du Tourisme Maroc 2024-2025",
    "- Taux de commission utilis\u00e9s dans la simulation : Booking 18%, Airbnb 15%,",
    "  Expedia 20%. Ces taux sont des hypoth\u00e8ses et peuvent varier selon le",
    "  contrat, le programme partenaire et les options activ\u00e9es.",
    "- Taux de change : 1 EUR = 10.8 MAD",
    "",
    "Marge d'incertitude :",
    "- Les r\u00e9sultats financiers sont estim\u00e9s \u00e0 +/- 20-30% pr\u00e8s",
    "- Les benchmarks sont des m\u00e9dianes : votre situation peut varier",
    "- Cet audit ne remplace pas une analyse comptable approfondie",
  ];

  y = 42;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.light);
  for (const line of metho) {
    if (!line) { y += 3; continue; }
    doc.text(line, 20, y);
    y += 5.2;
  }

  // ── PAGE 4 : BENCHMARK ──
  doc.addPage();
  bg();
  header("Benchmark Local", `${form.riad_name} vs m\u00e9diane ${form.stars} \u00e9toiles \u00e0 ${form.city}`);

  const adrDiff = form.current_price_mad - b.adr;
  const adrPct = b.adr > 0 ? Math.round((adrDiff / b.adr) * 100) : 0;
  const noteDiff = (form.booking_score - b.booking).toFixed(1);
  const revDiff = form.booking_reviews - b.reviews;
  const dirDiff = form.direct_percent - b.direct;

  const benchRows = [
    ["Indicateur", "Votre riad", "M\u00e9diane", "\u00c9cart"],
    ["ADR (MAD)", `${fmt(form.current_price_mad)}`, `${fmt(b.adr)}`, `${adrDiff >= 0 ? "+" : ""}${adrPct}%`],
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
    styles: { cellPadding: 5 },
    columnStyles: {
      0: { cellWidth: 42, halign: "left", fontStyle: "bold" },
      1: { cellWidth: 32, halign: "right" },
      2: { cellWidth: 32, halign: "right" },
      3: { cellWidth: 28, halign: "right" },
    },
    margin: { left: 25, right: 25 },
  });

  y = (doc as any).lastAutoTable.finalY + 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...C.white);
  doc.text("Analyse", 20, y);
  y += 7;

  let analysis = "";
  if (adrDiff < -100) analysis += `Votre ADR est ${Math.abs(adrDiff)} MAD sous la m\u00e9diane. Il pourrait y avoir une marge d'augmentation. `;
  else if (adrDiff > 200) analysis += `Votre ADR est ${adrDiff} MAD au-dessus de la m\u00e9diane. Votre r\u00e9putation (${form.booking_score}/10) semble justifier ce positionnement. `;
  else if (adrDiff > 0) analysis += `Votre ADR est l\u00e9g\u00e8rement au-dessus de la m\u00e9diane, ce qui est coh\u00e9rent avec votre positionnement. `;
  else analysis += `Votre ADR est align\u00e9 avec le march\u00e9. `;

  if (Number(noteDiff) < -0.3) analysis += `Votre note Booking est sous la m\u00e9diane. Chaque +0.1 point peut augmenter la conversion de 3-5%. `;
  else if (Number(noteDiff) > 0.5) analysis += `Votre note Booking d\u00e9passe la m\u00e9diane de ${noteDiff} points : avantage concurrentiel significatif. `;

  if (dirDiff < -10) analysis += `Votre part de direct est ${Math.abs(dirDiff)} pts sous la m\u00e9diane. Une optimisation du canal direct pourrait r\u00e9duire vos commissions.`;
  else if (dirDiff > 5) analysis += `Votre part de direct est excellente pour votre cat\u00e9gorie.`;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.light);
  doc.text(doc.splitTextToSize(analysis, 155), 20, y);

  // ── PAGE 5 : COMMISSIONS ──
  doc.addPage();
  bg();
  header("Calculateur Commissions OTA", `CA annuel : ${fmt(ca)} MAD`);

  let bk = form.booking_percent || 0;
  let ab = form.airbnb_percent || 0;
  let ex = form.expedia_percent || 0;
  let dr = form.direct_percent || 0;
  let totalCh = bk + ab + ex + dr;

  if (totalCh > 0 && totalCh < 100) {
    const missing = 100 - totalCh;
    const otaTotal = bk + ab + ex;
    if (otaTotal > 0) {
      const addBk = Math.round(missing * bk / otaTotal);
      const addAb = Math.round(missing * ab / otaTotal);
      const addEx = missing - addBk - addAb;
      bk += addBk;
      ab += addAb;
      ex += addEx;
    } else {
      bk = Math.round(missing * 0.73);
      ab = Math.round(missing * 0.20);
      ex = missing - bk - ab;
    }
    totalCh = 100;
  }

  const commBk = Math.round(ca * (bk / 100) * 0.18);
  const commAb = Math.round(ca * (ab / 100) * 0.15);
  const commEx = Math.round(ca * (ex / 100) * 0.20);
  const totalComm = commBk + commAb + commEx;

  if (totalCh === 0) {
    y = 45;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...C.gold);
    doc.text("R\u00e9partition des canaux non renseign\u00e9e.", 20, y);
    y += 8;
    doc.setFontSize(9);
    doc.setTextColor(...C.light);
    const avgComm = Math.round(ca * 0.55 * 0.18 + ca * 0.15 * 0.15 + ca * 0.05 * 0.2);
    const noDataText = `Pour un riad ${form.stars} \u00e9toiles \u00e0 ${form.city}, la r\u00e9partition moyenne est : Booking 55%, Airbnb 15%, Expedia 5%, Direct 25%. Sur votre CA de ${fmt(ca)} MAD, cela repr\u00e9senterait environ ${fmt(avgComm)} MAD de commissions OTA par an. Relancez l'audit en remplissant les champs pour un calcul pr\u00e9cis.`;
    doc.text(doc.splitTextToSize(noDataText, 165), 20, y);
  } else {
    const commRows = [
      ["Canal", "% CA", "Revenu", "Taux", "Co\u00fbt/an"],
      ["Booking.com", `${bk}%`, `${fmt(ca * bk / 100)}`, "18%", `${fmt(commBk)}`],
      ["Airbnb", `${ab}%`, `${fmt(ca * ab / 100)}`, "15%", `${fmt(commAb)}`],
      ["Expedia", `${ex}%`, `${fmt(ca * ex / 100)}`, "20%", `${fmt(commEx)}`],
      ["Direct", `${dr}%`, `${fmt(ca * dr / 100)}`, "0%", "0"],
      ["TOTAL", `${totalCh}%`, `${fmt(ca)}`, "-", `${fmt(totalComm)}`],
    ];

    autoTable(doc, {
      startY: 42,
      head: [commRows[0]],
      body: commRows.slice(1),
      headStyles: { fillColor: C.terra, textColor: C.white, fontStyle: "bold", fontSize: 8, halign: "center" },
      bodyStyles: { fontSize: 8, textColor: C.light, halign: "center" },
      alternateRowStyles: { fillColor: C.surface },
      theme: "grid",
      styles: { cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 30, halign: "left", fontStyle: "bold" },
        1: { cellWidth: 20 },
        2: { cellWidth: 35 },
        3: { cellWidth: 18 },
        4: { cellWidth: 30 },
      },
      margin: { left: 25, right: 25 },
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
    doc.text(`Co\u00fbt estim\u00e9 des commissions OTA : ${fmt(totalComm)} MAD/an`, 20, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.light);
    const newBk = Math.max(5, Math.round(bk * 0.7));
    const newAb = Math.max(3, Math.round(ab * 0.8));
    const newEx = Math.max(2, Math.round(ex * 0.6));
    const newDr = 100 - newBk - newAb - newEx;
    const newComm = Math.round(ca * (newBk / 100) * 0.18 + ca * (newAb / 100) * 0.15 + ca * (newEx / 100) * 0.2);
    const saving = totalComm - newComm;

    const scText = `En basculant vers ${newBk}% Booking / ${newAb}% Airbnb / ${newEx}% Expedia / ${newDr}% direct, vos commissions passeraient de ${fmt(totalComm)} \u00e0 ${fmt(newComm)} MAD. \u00c9conomie potentielle : ${fmt(saving)} MAD/an, soit environ ${Math.round(saving / Math.max(form.current_price_mad, 1))} nuits gratuites.`;
    doc.text(doc.splitTextToSize(scText, 165), 20, y);
    y += 20;

    doc.setFontSize(7);
    doc.setTextColor(...C.muted);
    doc.text("Note : les taux de commission sont des hypoth\u00e8ses de simulation. Les taux r\u00e9els d\u00e9pendent de vos contrats OTA.", 20, y);
  }

  // ── PAGE 6 : PLAN D'ACTION ──
  doc.addPage();
  bg();
  header("Plan d'Action Personnalis\u00e9", `Bas\u00e9 sur vos scores r\u00e9els - ${form.riad_name}`);

  const actions = getActions(data, form);
  if (actions.length > 0) {
    const actRows = [
      ["Pri", "Axe", "Action", "Impact", "Effort", "D\u00e9lai"],
      ...actions.map(a => [a.pri, a.module, a.action, a.impact, a.effort, a.delai]),
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
        0: { cellWidth: 10, fontStyle: "bold", textColor: C.terra },
        1: { cellWidth: 28, fontStyle: "bold" },
        2: { cellWidth: 62 },
        3: { cellWidth: 22, textColor: C.green },
        4: { cellWidth: 16 },
        5: { cellWidth: 14 },
      },
      margin: { left: 20, right: 20 },
    });
  }

  y = actions.length > 0 ? (doc as any).lastAutoTable.finalY + 10 : 50;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text("Ces actions combinent un impact potentiel \u00e9lev\u00e9 et un effort de mise en oeuvre mod\u00e9r\u00e9.", 20, y);
  y += 5;
  doc.text("Les impacts financiers sont des estimations indicatives bas\u00e9es sur votre CA et les benchmarks locaux.", 20, y);

  // ── PAGE 7 : 30/60/90 ──
  doc.addPage();
  bg();
  header("Plan 30 / 60 / 90 Jours", "Feuille de route adapt\u00e9e \u00e0 vos faiblesses identifi\u00e9es");

  const w1 = LABELS[sorted[0]?.[0]] || "Visibilit\u00e9";
  const w2 = LABELS[sorted[1]?.[0]] || "Prix";
  const w3 = LABELS[sorted[2]?.[0]] || "R\u00e9putation";

  const phases = [
    { label: "JOURS 1-30", color: C.red, text: `Corriger ${w1} (score le plus faible). Objectif : +10 points sur cet axe, soit +${scoreGain90} point(s) sur le score global. Actions imm\u00e9diates \u00e0 fort impact.` },
    { label: "JOURS 31-60", color: C.gold, text: `Attaquer ${w2}. Mettre en place outils et process. Premi\u00e8res mesures de r\u00e9sultat sur ${w1}.` },
    { label: "JOURS 61-90", color: C.green, text: `Optimiser ${w3} + consolider les gains. Audit de suivi pour mesurer la progression globale.` },
  ];

  y = 48;
  for (const p of phases) {
    doc.setFillColor(...C.surface);
    doc.roundedRect(20, y, 170, 35, 3, 3, "F");
    doc.setFillColor(...p.color);
    doc.roundedRect(20, y, 4, 35, 2, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...p.color);
    doc.text(p.label, 30, y + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.light);
    doc.text(doc.splitTextToSize(p.text, 145), 30, y + 16);
    y += 43;
  }

  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.white);
  doc.text(`Objectif 90 jours : ${score}/100 vers ~${target90}/100 (am\u00e9lioration du ${LABELS[weakestKey] || "pricing"}).`, 20, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.light);
  doc.text(`Objectif 12 mois : atteindre ~${target12}/100 avec l'am\u00e9lioration combin\u00e9e de tous les axes.`, 20, y);
  y += 6;
  doc.setFontSize(7);
  doc.setTextColor(...C.muted);
  doc.text("Estimation indicative, d\u00e9pendante de l'ex\u00e9cution effective des recommandations.", 20, y);

  // ── PAGE 8 : PROJECTION ──
  doc.addPage();
  bg();
  header("Projection Avant / Apr\u00e8s", `Gain additionnel projet\u00e9 \u00e0 12 mois : ${fmt(gain12)} MAD`);

  const projRows = [
    ["Horizon", "Gain additionnel", "Nouveau CA", "Leviers"],
    ["3 mois", `+${fmt(gain3)} MAD`, `${fmt(ca + gain3)} MAD`, "Site web, pricing, canal WhatsApp direct"],
    ["6 mois", `+${fmt(gain6)} MAD`, `${fmt(ca + gain6)} MAD`, "Gestion tarifaire / revenue management + r\u00e9putation"],
    ["12 mois", `+${fmt(gain12)} MAD`, `${fmt(ca + gain12)} MAD`, "Canal direct dominant, pricing dynamique"],
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

  y = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.white);
  doc.text(`Gain projet\u00e9 \u00e0 12 mois : ${fmt(gain12)} MAD (85% de l'opportunit\u00e9 r\u00e9cup\u00e9rable)`, 20, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.light);
  doc.text(`Opportunit\u00e9 r\u00e9siduelle \u00e0 12 mois : ${fmt(residuel12)} MAD`, 20, y);
  y += 8;

  doc.setFontSize(9);
  doc.setTextColor(...C.light);
  doc.text(`Pour 1 500 MAD investis dans l'audit, le gain potentiel \u00e0 12 mois est de ${fmt(gain12)} MAD.`, 20, y);
  y += 6;
  doc.setFontSize(7);
  doc.setTextColor(...C.muted);
  doc.text("Projections bas\u00e9es sur l'application de 80% des actions recommand\u00e9es. R\u00e9sultats non garantis.", 20, y);

  // ── PAGE 9 : OFFRES ──
  doc.addPage();
  bg();
  header("Nos Offres d'Accompagnement");

  const offers = [
    { name: "Audit Flash", price: "500 MAD", desc: "Diagnostic complet, score sur 100, benchmark local et 4 priorit\u00e9s d'action principales.", color: C.muted },
    { name: "Audit Complet + Vid\u00e9o  (RECOMMAND\u00c9)", price: "1 500 MAD", desc: "PDF + vid\u00e9o Loom 3 min + plan d\u00e9taill\u00e9 + 1 mois de suivi WhatsApp.", color: C.terra },
    { name: "Suivi Mensuel", price: "700 MAD/mois", desc: "Reporting mensuel, ajustement pricing, r\u00e9putation et accompagnement continu.", color: C.gold },
  ];

  y = 45;
  for (const o of offers) {
    const h = o.name.includes("RECOMMAND") ? 48 : 42;
    doc.setFillColor(...C.surface);
    doc.roundedRect(20, y, 170, h, 3, 3, "F");
    doc.setFillColor(...o.color);
    doc.roundedRect(20, y, 4, h, 2, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...o.color);
    doc.text(o.name, 30, y + 10);
    doc.setFontSize(14);
    doc.text(o.price, 140, y + 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...C.light);
    const descLines = doc.splitTextToSize(o.desc, 145);
    doc.text(descLines, 30, y + 20);
    y += h + 8;
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

  const paras = conclusionParas(data, form, gain12, central, recov);
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
  doc.text("Pr\u00eat \u00e0 passer \u00e0 l'action ?", 45, y + 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Contactez-nous sur WhatsApp pour votre diagnostic personnalis\u00e9", 35, y + 25);

  doc.setFontSize(7);
  doc.setTextColor(...C.muted);
  doc.text(`RiadPulse 2026 - Rapport g\u00e9n\u00e9r\u00e9 le ${new Date().toLocaleDateString("fr-FR")} pour ${form.riad_name}`, 20, 280);
  doc.text("Les r\u00e9sultats de cet audit sont des estimations indicatives et ne constituent pas une garantie de r\u00e9sultat.", 20, 286);

  doc.save(`Audit_${(form.riad_name || "Riad").replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`);
}