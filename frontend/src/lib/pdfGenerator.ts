import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface AuditResult {
  global_score: number;
  modules: Record<string, { score: number; weight: number; details: string }>;
  loss?: number;
  estimated_loss_mad?: number;
  estimated_loss?: number;
  potential_loss_mad?: number;
  annual_loss_mad?: number;
  recommendations?: string[];
}

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

const fmt = (n: number): string =>
  Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

const grade = (s: number): { letter: string; title: string; color: [number, number, number] } => {
  if (s >= 85) return { letter: "A", title: "Excellent", color: [34, 139, 34] };
  if (s >= 70) return { letter: "B", title: "Bon", color: [218, 165, 32] };
  if (s >= 55) return { letter: "C", title: "Moyen", color: [231, 111, 81] };
  return { letter: "D", title: "A ameliorer", color: [192, 57, 43] };
};

type Bench = { adr: number; booking: number; reviews: number; direct: number };

const BENCH: Record<string, Record<number, Bench>> = {
  Marrakech: {
    3: { adr: 550, booking: 7.8, reviews: 150, direct: 20 },
    4: { adr: 850, booking: 8.2, reviews: 200, direct: 25 },
    5: { adr: 1400, booking: 8.8, reviews: 300, direct: 30 },
  },
  Fes: {
    3: { adr: 400, booking: 7.5, reviews: 100, direct: 18 },
    4: { adr: 650, booking: 8.0, reviews: 150, direct: 22 },
    5: { adr: 1100, booking: 8.6, reviews: 250, direct: 28 },
  },
  Essaouira: {
    3: { adr: 450, booking: 7.6, reviews: 80, direct: 22 },
    4: { adr: 700, booking: 8.1, reviews: 120, direct: 28 },
    5: { adr: 1200, booking: 8.7, reviews: 200, direct: 32 },
  },
  Casablanca: {
    3: { adr: 500, booking: 7.4, reviews: 120, direct: 15 },
    4: { adr: 800, booking: 7.9, reviews: 180, direct: 20 },
    5: { adr: 1300, booking: 8.5, reviews: 280, direct: 25 },
  },
  Tanger: {
    3: { adr: 420, booking: 7.5, reviews: 90, direct: 18 },
    4: { adr: 680, booking: 8.0, reviews: 140, direct: 22 },
    5: { adr: 1100, booking: 8.5, reviews: 220, direct: 27 },
  },
  Chefchaouen: {
    3: { adr: 350, booking: 7.7, reviews: 60, direct: 25 },
    4: { adr: 550, booking: 8.2, reviews: 100, direct: 30 },
    5: { adr: 900, booking: 8.6, reviews: 150, direct: 35 },
  },
  Rabat: {
    3: { adr: 480, booking: 7.4, reviews: 100, direct: 16 },
    4: { adr: 750, booking: 7.9, reviews: 160, direct: 20 },
    5: { adr: 1200, booking: 8.5, reviews: 250, direct: 25 },
  },
  "El Jadida": {
    3: { adr: 380, booking: 7.3, reviews: 50, direct: 20 },
    4: { adr: 600, booking: 7.8, reviews: 80, direct: 25 },
    5: { adr: 950, booking: 8.4, reviews: 130, direct: 30 },
  },
};

const getBench = (city: string, stars: number): Bench => {
  const cb = BENCH[city];
  if (cb) {
    const s = Math.max(3, Math.min(5, Math.round(stars))) as 3 | 4 | 5;
    if (cb[s]) return cb[s];
  }
  const d: Record<number, Bench> = {
    3: { adr: 450, booking: 7.5, reviews: 100, direct: 20 },
    4: { adr: 700, booking: 8.0, reviews: 150, direct: 25 },
    5: { adr: 1200, booking: 8.6, reviews: 250, direct: 30 },
  };
  return d[Math.max(3, Math.min(5, Math.round(stars)))];
};

/* ------------------------------------------------------------------ */
/*  Calcul des scores de modules a partir du formulaire                */
/* ------------------------------------------------------------------ */

const calcPricingScore = (form: FormData, bench: Bench): number => {
  const ratio = form.current_price_mad / Math.max(bench.adr, 1);
  if (ratio >= 0.85 && ratio <= 1.15) return 82;
  if (ratio >= 0.7 && ratio <= 1.3) return 65;
  if (ratio >= 0.55 && ratio <= 1.6) return 48;
  return 35;
};

const calcDistributionScore = (form: FormData, bench: Bench): number => {
  const directRatio = form.direct_percent / Math.max(bench.direct, 1);
  const base = Math.min(100, Math.round(directRatio * 65 + 20));
  const responseBonus = Math.round((form.response_rate_percent / 100) * 10);
  return Math.min(100, base + responseBonus);
};

const toScale10 = (score: number, alreadyOn10: boolean): number => {
  if (score <= 0) return 0;
  if (alreadyOn10) return Math.min(10, score);
  return score <= 5 ? Math.min(10, score * 2) : Math.min(10, score);
};

const calcReputationScore = (form: FormData): number => {
  const b10 = toScale10(form.booking_score, true);
  const t10 = toScale10(form.tripadvisor_score, false);
  const g10 = toScale10(form.google_score, false);
  const br = Math.max(0, form.booking_reviews);
  const tr = Math.max(0, form.tripadvisor_reviews);
  const gr = Math.max(0, form.google_reviews);
  const wSum = (b10 > 0 ? br : 0) + (t10 > 0 ? tr : 0) + (g10 > 0 ? gr : 0);
  let avg: number;
  if (wSum > 0) {
    avg = ((b10 > 0 ? b10 * br : 0) + (t10 > 0 ? t10 * tr : 0) + (g10 > 0 ? g10 * gr : 0)) / wSum;
  } else {
    const scores: number[] = [];
    if (b10 > 0) scores.push(b10);
    if (t10 > 0) scores.push(t10);
    if (g10 > 0) scores.push(g10);
    if (scores.length === 0) return 50;
    avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  }
  const reviewCount = br + tr + gr;
  const volumeBonus = Math.min(10, Math.round(reviewCount / 50));
  return Math.min(100, Math.round(avg * 9 + volumeBonus));
};

const calcReputationAvg = (form: FormData): number => {
  const b10 = toScale10(form.booking_score, true);
  const t10 = toScale10(form.tripadvisor_score, false);
  const g10 = toScale10(form.google_score, false);
  const br = Math.max(0, form.booking_reviews);
  const tr = Math.max(0, form.tripadvisor_reviews);
  const gr = Math.max(0, form.google_reviews);
  const wSum = (b10 > 0 ? br : 0) + (t10 > 0 ? tr : 0) + (g10 > 0 ? gr : 0);
  if (wSum > 0) {
    return Math.round(((b10 > 0 ? b10 * br : 0) + (t10 > 0 ? t10 * tr : 0) + (g10 > 0 ? g10 * gr : 0)) / wSum * 10) / 10;
  }
  const scores: number[] = [];
  if (b10 > 0) scores.push(b10);
  if (t10 > 0) scores.push(t10);
  if (g10 > 0) scores.push(g10);
  if (scores.length === 0) return 5;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10;
};

const calcRevenueScore = (form: FormData): number => {
  const occ = form.occupancy_rate * 100;
  if (occ >= 80) return 85;
  if (occ >= 70) return 72;
  if (occ >= 60) return 60;
  if (occ >= 50) return 50;
  return 40;
};

/* ------------------------------------------------------------------ */
/*  Diagnostic par module                                              */
/* ------------------------------------------------------------------ */

const moduleDiag = (key: string, score: number, form: FormData, bench: Bench): string => {
  if (key === "pricing") {
    const note = " Le score Prix evalue l'adaptation des tarifs a la saison, a la demande et au delai de reservation, pas uniquement le niveau de l'ADR.";
    const adrDiff = Math.abs(form.current_price_mad - bench.adr);
    const adrAligne = adrDiff < 50;
    const adrHaut = form.current_price_mad > bench.adr + 50;
    const adrBas = form.current_price_mad < bench.adr - 50;
    if (score >= 80) {
      return "Votre ADR de " + fmt(form.current_price_mad) + " MAD est bien positionne par rapport a la mediane locale de " + fmt(bench.adr) + " MAD. Votre grille tarifaire est dynamique et adaptee au marche." + note;
    }
    if (score >= 60) {
      if (adrAligne) return "Votre ADR de " + fmt(form.current_price_mad) + " MAD est aligne sur la mediane locale. La strategie tarifaire pourrait etre affinee pour mieux capter la haute saison." + note;
      if (adrHaut) return "Votre ADR de " + fmt(form.current_price_mad) + " MAD est " + fmt(adrDiff) + " MAD au-dessus de la mediane. La strategie tarifaire pourrait etre affinee selon la saisonnalite." + note;
      return "Votre ADR de " + fmt(form.current_price_mad) + " MAD est " + fmt(adrDiff) + " MAD en dessous de la mediane. Une legere revalorisation en haute saison est envisageable." + note;
    }
    if (adrAligne) return "Votre ADR de " + fmt(form.current_price_mad) + " MAD est aligne sur la mediane locale, mais le score Prix de " + score + "/100 indique que votre grille tarifaire manque de dynamisme : elle ne s'adapte pas assez a la saisonnalite, aux evenements locaux et au delai de reservation." + note;
    if (adrHaut) return "Votre ADR de " + fmt(form.current_price_mad) + " MAD est " + fmt(adrDiff) + " MAD au-dessus de la mediane locale. Cet ecart, combine a un score de " + score + "/100, suggere une survalorisation qui peut penaliser votre taux d'occupation." + note;
    return "Votre ADR de " + fmt(form.current_price_mad) + " MAD est " + fmt(adrDiff) + " MAD en dessous de la mediane locale. Le score de " + score + "/100 confirme une sous-valorisation : vous laissez de la marge sur la table." + note;
  }
  if (key === "distribution") {
    if (form.direct_percent < 10) return "Vous dependez fortement des OTA : seulement " + form.direct_percent + "% de vos reservations sont directes. Une part importante de votre CA peut donc etre soumise a des commissions.";
    if (form.direct_percent < bench.direct) return "Votre part de reservations directes atteint " + form.direct_percent + "%, soit " + (bench.direct - form.direct_percent) + " points sous la mediane locale de " + bench.direct + "%. Le potentiel prioritaire consiste a developper le canal direct grace a l'email, a la fidelisation et aux offres exclusives.";
    if (form.direct_percent === bench.direct) return "Votre part de reservations directes atteint " + form.direct_percent + "%, au niveau de la mediane locale. Continuez a developper l'email, la fidelisation et les offres exclusives.";
    return "Votre part de reservations directes atteint " + form.direct_percent + "%, au-dessus de la mediane locale de " + bench.direct + "%. Continuez a valoriser vos canaux directs et a maitriser vos couts d'acquisition.";
  }
    if (key === "reputation") {
    const avg = calcReputationAvg(form);
    const tot = form.booking_reviews + form.tripadvisor_reviews + form.google_reviews;
    const platforms = "3 plateforme(s) (Booking, TripAdvisor, Google)";
    if (score >= 80) return "Votre note moyenne de " + avg.toFixed(1) + "/10 sur " + platforms + " (" + fmt(tot) + " avis au total) temoigne d'une bonne reputation. Maintenez ce niveau.";
    if (score >= 60) return "Votre note moyenne de " + avg.toFixed(1) + "/10 sur " + platforms + " (" + fmt(tot) + " avis au total) est correcte mais peut progresser. Un plan de reponse systematique aux avis est recommande.";
    return "Votre note moyenne de " + avg.toFixed(1) + "/10 sur " + platforms + " (" + fmt(tot) + " avis au total) est en dessous des standards. La gestion active des avis est une priorite.";
  }
  if (key === "revenue") {
    const occ = Math.round(form.occupancy_rate * 100);
    if (score >= 80) return "Votre taux d'occupation de " + occ + "% et votre CA de " + fmt(form.annual_revenue_mad) + " MAD indiquent une bonne performance commerciale.";
    if (score >= 60) return "Votre taux d'occupation de " + occ + "% et votre CA de " + fmt(form.annual_revenue_mad) + " MAD montrent un potentiel de croissance significatif.";
    return "Votre taux d'occupation de " + occ + "% et votre CA de " + fmt(form.annual_revenue_mad) + " MAD revelent un important potentiel inexploite.";
  }
  return "";
};

/* ------------------------------------------------------------------ */
/*  Conclusion dynamique                                               */
/* ------------------------------------------------------------------ */

const conclusionParas = (g: string, score: number, central: number, recov: number, gain12: number): string[] => {
  const base = "Cette evaluation est indicative et fondee sur les donnees declarees. Les resultats reels dependent de nombreux facteurs operationnels.";
  if (g === "A") return [
    "Votre etablissement obtient un score de " + score + "/100, ce qui le place parmi les meilleurs de sa categorie.",
    "Meme a ce niveau, une opportunite de croissance estimee a ~" + fmt(central) + " MAD subsiste. Le potentiel recuperable realiste est d'environ " + fmt(recov) + " MAD, dont ~" + fmt(gain12) + " MAD realisables dans les 12 premiers mois.",
    base,
  ];
  if (g === "B") return [
    "Votre etablissement obtient un score de " + score + "/100, ce qui constitue une base solide.",
    "Avec un score de " + score + "/100, votre etablissement dispose de bonnes bases mais conserve un potentiel d'amelioration important.",
    "Une opportunite de croissance estimee a ~" + fmt(central) + " MAD a ete identifiee. Le potentiel recuperable realiste est d'environ " + fmt(recov) + " MAD, dont ~" + fmt(gain12) + " MAD realisables dans les 12 premiers mois.",
    base,
  ];
  if (g === "C") return [
    "Votre etablissement obtient un score de " + score + "/100, ce qui revele un potentiel significatif d'amelioration.",
    "Une opportunite de croissance estimee a ~" + fmt(central) + " MAD a ete identifiee. Le potentiel recuperable realiste est d'environ " + fmt(recov) + " MAD, dont ~" + fmt(gain12) + " MAD realisables dans les 12 premiers mois.",
    base,
  ];
  return [
    "Votre etablissement obtient un score de " + score + "/100, ce qui indique des axes d'amelioration majeurs.",
    "Une opportunite de croissance estimee a ~" + fmt(central) + " MAD a ete identifiee. Le potentiel recuperable realiste est d'environ " + fmt(recov) + " MAD, dont ~" + fmt(gain12) + " MAD realisables dans les 12 premiers mois.",
    base,
  ];
};

/* ------------------------------------------------------------------ */
/*  PDF Generator                                                      */
/* ------------------------------------------------------------------ */

export function generatePDF(result: AuditResult, form: FormData): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const H = 297;
  const M = 20;
  const CW = W - 2 * M;

  const bench = getBench(form.city, form.stars);

  /* --- Mapper les modules backend dynamiquement --- */
  const backendMods = Object.entries(result.modules || {});
  const mapped: Record<string, { score: number; weight: number; details: string }> = {};

  backendMods.forEach(([key, val]) => {
    const k = key.toLowerCase();
    if (k.includes("pric") || k.includes("tarif") || k.includes("adr")) mapped.pricing = val;
    else if (k.includes("distrib") || k.includes("channel") || k.includes("canal") || k.includes("ota")) mapped.distribution = val;
    else if (k.includes("reput") || k.includes("review") || k.includes("avis") || k.includes("guest") || k.includes("note")) mapped.reputation = val;
    else if (k.includes("revenue") || k.includes("rev") || k.includes("occup") || k.includes("income")) mapped.revenue = val;
  });

  /* --- Construire les 4 modules : backend si dispo, sinon calcule --- */
  const pricingScore = mapped.pricing?.score ?? calcPricingScore(form, bench);
  const distribScore = mapped.distribution?.score ?? calcDistributionScore(form, bench);
  const reputScore = calcReputationScore(form);
  const revenueScore = mapped.revenue?.score ?? calcRevenueScore(form);

  const w1 = mapped.pricing?.weight ?? 0.25;
  const w2 = mapped.distribution?.weight ?? 0.25;
  const w3 = mapped.reputation?.weight ?? 0.25;
  const w4 = mapped.revenue?.weight ?? 0.25;
  const totalW = w1 + w2 + w3 + w4;

  const mods = [
    { key: "pricing", label: "Prix & Tarifs", score: pricingScore, weight: w1 },
    { key: "distribution", label: "Distribution", score: distribScore, weight: w2 },
    { key: "reputation", label: "Reputation", score: reputScore, weight: w3 },
    { key: "revenue", label: "Revenus", score: revenueScore, weight: w4 },
  ];

  /* --- Score global RECALCULE = moyenne ponderee des 4 modules --- */
  const score = Math.round(mods.reduce((s, m) => s + m.score * m.weight, 0) / totalW * 10) / 10;
  const g = grade(score);
  const ca = form.annual_revenue_mad;
  const perteTheo = Math.round(ca * (1 - score / 100));

  /* --- Calculs financiers coherents --- */
  const facteur = 80;
  const central = Math.round(perteTheo * (facteur / 100));
  const fourchetteLow = Math.round(perteTheo * 0.7);
  const fourchetteHigh = perteTheo;
  const recov = Math.round(central * 0.7);
  const gain3 = Math.round(recov * 0.25);
  const gain6 = Math.round(recov * 0.55);
  const gain12 = Math.round(recov * 0.85);
  const residuel12 = central - gain12;
  const pctGainCentral = central > 0 ? Math.round((gain12 / central) * 1000) / 10 : 0;

  /* --- Tri par score croissant --- */
  mods.sort((a, b) => a.score - b.score);

  const wPct = (w: number) => {
    const v = w ?? 0.25;
    if (isNaN(v) || v <= 0) return 25;
    return v <= 1 ? Math.round(v * 100) : Math.round(v);
  };
  const weakest = mods[0];
  const weakestGain = 10;
  const globalGain90 = Math.round(weakestGain * (wPct(weakest.weight) / 100) * 10) / 10;
  const target90 = Math.min(100, Math.round((score + globalGain90) * 10) / 10);
  const target12 = Math.min(100, Math.round(score + 10));

  /* ================================================================ */
  /*  PAGE 1 : GARDE                                                   */
  /* ================================================================ */
  doc.setFillColor(10, 22, 40);
  doc.rect(0, 0, W, H, "F");
  doc.setFillColor(231, 111, 81);
  doc.rect(0, 0, W, 6, "F");
  doc.setTextColor(244, 162, 97);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("RiadPulse", M, 30);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Audit Flash de Performance Digitale", M, 40);
  doc.setDrawColor(231, 111, 81);
  doc.setLineWidth(0.5);
  doc.line(M, 48, W - M, 48);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(form.riad_name || "Votre Riad", M, 68);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 180, 180);
  const starsStr = form.stars > 0 ? form.stars + " etoiles" : "Non classe";
  doc.text((form.city || "Maroc") + "  |  " + starsStr + "  |  " + (form.num_rooms || 0) + " chambres", M, 80);

  const cx = W / 2;
  const cy = 135;
  const r = 30;
  doc.setDrawColor(40, 50, 70);
  doc.setLineWidth(6);
  doc.circle(cx, cy, r, "S");
  doc.setDrawColor(g.color[0], g.color[1], g.color[2]);
  doc.setLineWidth(6);
  const startA = -90;
  const endA = startA + (score / 100) * 360;
  for (let a = startA; a < endA; a += 2) {
    const a2 = Math.min(a + 2, endA);
    const r1 = (a * Math.PI) / 180;
    const r2 = (a2 * Math.PI) / 180;
    doc.line(cx + r * Math.cos(r1), cy + r * Math.sin(r1), cx + r * Math.cos(r2), cy + r * Math.sin(r2));
  }
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.text(String(score), cx, cy + 4, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("/100", cx, cy + 12, { align: "center" });
  doc.setTextColor(g.color[0], g.color[1], g.color[2]);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Grade " + g.letter + " - " + g.title, cx, cy + r + 18, { align: "center" });

  const boxY = 200;
  doc.setFillColor(20, 30, 50);
  doc.roundedRect(M, boxY, CW, 50, 3, 3, "F");
  doc.setTextColor(180, 180, 180);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Opportunite de croissance estimee", M + 10, boxY + 12);
  doc.setTextColor(244, 162, 97);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("~" + fmt(central) + " MAD", M + 10, boxY + 26);
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Fourchette : " + fmt(fourchetteLow) + " - " + fmt(fourchetteHigh) + " MAD (70%-100% du potentiel theorique)", M + 10, boxY + 38);
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.text("Date du rapport : " + new Date().toLocaleDateString("fr-FR"), M, H - 15);
  doc.text("RiadPulse - Audit genere automatiquement", W - M, H - 15, { align: "right" });

  /* ================================================================ */
  /*  PAGE 2 : RESUME EXECUTIF                                         */
  /* ================================================================ */
  doc.addPage();
  doc.setFillColor(10, 22, 40);
  doc.rect(0, 0, W, H, "F");
  doc.setFillColor(231, 111, 81);
  doc.rect(0, 0, W, 4, "F");
  doc.setTextColor(244, 162, 97);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Resume executif", M, 25);
  let y = 40;
  mods.forEach((m) => {
    const wv = wPct(m.weight);
    doc.setFillColor(20, 30, 50);
    doc.roundedRect(M, y, CW, 32, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(m.label + " (" + wv + "%)", M + 5, y + 8);
    const mc = grade(m.score).color;
    doc.setTextColor(mc[0], mc[1], mc[2]);
    doc.setFontSize(14);
    doc.text(m.score + "/100", W - M - 5, y + 8, { align: "right" });
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const diag = moduleDiag(m.key, m.score, form, bench);
    const dl = doc.splitTextToSize(diag, CW - 10);
    const visibleDiag = dl.length > 2
      ? [dl[0], dl[1].replace(/[,.]$/, "") + "..."]
      : dl;
    doc.text(visibleDiag, M + 5, y + 16);
    y += 38;
  });
  y += 5;
  doc.setFillColor(30, 45, 65);
  doc.roundedRect(M, y, CW, 40, 3, 3, "F");
  doc.setTextColor(244, 162, 97);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Impact financier estime", M + 5, y + 10);
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("CA " + fmt(ca) + " MAD x (1 - " + score + "/100) = " + fmt(perteTheo) + " MAD (perte theorique)", M + 5, y + 20);
  doc.text("Ajustement facteur " + Math.round(facteur) + "% vers opportunite centrale : ~" + fmt(central) + " MAD", M + 5, y + 28);
  doc.text("Fourchette : " + fmt(fourchetteLow) + " - " + fmt(fourchetteHigh) + " MAD (70%-100% du potentiel theorique)", M + 5, y + 36);

  /* ================================================================ */
  /*  PAGE 3 : METHODOLOGIE                                            */
  /* ================================================================ */
  doc.addPage();
  doc.setFillColor(10, 22, 40);
  doc.rect(0, 0, W, H, "F");
  doc.setFillColor(231, 111, 81);
  doc.rect(0, 0, W, 4, "F");
  doc.setTextColor(244, 162, 97);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Methodologie et niveau de confiance", M, 25);
  y = 40;
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const mp = [
    "Ce rapport est genere a partir des donnees que vous avez declarees (chiffre d'affaires, taux d'occupation, repartition des canaux, notes et avis) ainsi que de benchmarks publics du secteur hotelier marocain (Observatoire du Tourisme Maroc 2024-2025 et donnees OTA publiques 2025).",
    "",
    "Niveau de confiance : " + (score >= 75 ? "Eleve" : score >= 55 ? "Moyen" : "Faible") + ". Les donnees declarees n'ont pas ete verifiees de maniere independante. Le niveau de confiance reflete la coherence interne de vos donnees.",
    "",
    "Le score global est calcule comme la moyenne ponderee des 4 modules affiches (Prix, Distribution, Reputation, Revenus).",
    "",
    "Note sur la coherence des donnees : le CA declare peut inclure ou exclure la restauration, les transferts et les extras. L'occupation peut etre annuelle ou saisonniere. L'ADR peut etre le prix moyen effectif ou le prix rack. Le calcul d'opportunite se base sur le CA total declare ; si celui-ci ne couvre qu'une partie de l'activite, l'opportunite reelle peut etre superieure.",
    "",
    "Les projections financieres (pages 7-8) sont des estimations fondees sur des hypotheses de recuperation partielle. Elles ne constituent pas une garantie de resultat.",
    "",
    "Methode de calcul du score : le modele utilise une approximation lineaire ou un score de 100/100 correspond a une performance digitale optimale. Chaque point en dessous de 100 represente un pourcentage theorique de CA non optimise. Cette methode est une simplification ; les resultats reels dependent de nombreux facteurs operationnels.",
    "",
    "Normalisation des avis : les notes de chaque plateforme (Booking /10, TripAdvisor /5, Google /5) sont ramenees sur une echelle commune de 10 pour le calcul de la moyenne.",
    "",
    "Verification de coherence : avec " + form.num_rooms + " chambres, un ADR declare de " + fmt(form.current_price_mad) + " MAD et une occupation de " + Math.round(form.occupancy_rate * 100) + "%, le CA hebergement theorique a plein tarif serait de ~" + fmt(Math.round(form.num_rooms * form.occupancy_rate * 365 * form.current_price_mad)) + " MAD. L'ecart avec le CA declare (" + fmt(ca) + " MAD) indique generalement que l'ADR moyen effectif annuel est inferieur au tarif de reference (tarifs basse saison, remises OTA), ou que le taux d'occupation declare correspond a la haute saison plutot qu'a la moyenne annuelle.",
    "",
    "Commissions : l'economie affichee est calculee sur les commissions brutes OTA. Les couts de marketing, d'acquisition et de paiement lies au canal direct ne sont pas deduits du gain net.",
  ];
  mp.forEach((p) => {
    if (p === "") { y += 5; return; }
    const l = doc.splitTextToSize(p, CW);
    doc.text(l, M, y);
    y += l.length * 5 + 3;
  });

  /* ================================================================ */
  /*  PAGE 4 : BENCHMARK LOCAL                                         */
  /* ================================================================ */
  doc.addPage();
  doc.setFillColor(10, 22, 40);
  doc.rect(0, 0, W, H, "F");
  doc.setFillColor(231, 111, 81);
  doc.rect(0, 0, W, 4, "F");
  doc.setTextColor(244, 162, 97);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Benchmark local", M, 25);
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Comparaison avec la mediane " + form.city + " " + form.stars + " etoiles (sources : Observatoire du Tourisme)", M, 34);
  const adrDiff = form.current_price_mad - bench.adr;
  const bkDiff = Math.round((form.booking_score - bench.booking) * 10) / 10;
  const revDiff = form.booking_reviews - bench.reviews;
  const dirDiff = form.direct_percent - bench.direct;
  const benchRows = [
    ["ADR (prix moyen)", fmt(form.current_price_mad) + " MAD", fmt(bench.adr) + " MAD", (adrDiff >= 0 ? "+" : "") + fmt(adrDiff) + " MAD"],
    ["Note Booking (seul)", form.booking_score + "/10", bench.booking + "/10", (bkDiff >= 0 ? "+" : "") + bkDiff],
    ["Avis Booking (seul)", String(form.booking_reviews), String(bench.reviews), (revDiff >= 0 ? "+" : "") + revDiff],
    ["Reservations directes", form.direct_percent + "%", bench.direct + "%", (dirDiff >= 0 ? "+" : "") + dirDiff + " pts"],
  ];
  autoTable(doc, {
    startY: 42,
    head: [["Indicateur", "Vous", "Mediane", "Ecart"]],
    body: benchRows,
    theme: "grid",
    styles: { cellPadding: 4, fontSize: 9, lineWidth: 0.15, lineColor: [80, 90, 110] },
    headStyles: { fillColor: [231, 111, 81], textColor: [255, 255, 255], fontStyle: "bold", halign: "center" },
    bodyStyles: { fillColor: [20, 30, 50], textColor: [200, 200, 200] },
    alternateRowStyles: { fillColor: [25, 38, 60] },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: "bold", halign: "left" },
      1: { cellWidth: 38, halign: "right" },
      2: { cellWidth: 38, halign: "right" },
      3: { cellWidth: 39, halign: "right" },
    },
    margin: { left: M, right: M },
  });
  y = (doc as any).lastAutoTable.finalY + 12;
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  let ba = "";
  if (adrDiff > 0) ba += "Votre ADR est " + fmt(adrDiff) + " MAD au-dessus de la mediane locale. ";
  else if (adrDiff < 0) ba += "Votre ADR est " + fmt(Math.abs(adrDiff)) + " MAD en dessous de la mediane locale. ";
  else ba += "Votre ADR est aligne sur la mediane locale. ";
  if (dirDiff < 0) ba += "Votre part de direct est " + Math.abs(dirDiff) + " pts sous la mediane : c'est le levier prioritaire.";
  else if (dirDiff > 0) ba += "Votre part de direct depasse la mediane de " + dirDiff + " pts, ce qui est un point fort.";
  else ba += "Votre part de direct est alignee sur la mediane locale.";
  doc.text(doc.splitTextToSize(ba, CW), M, y);

  /* ================================================================ */
  /*  PAGE 5 : CALCULATEUR COMMISSIONS                                 */
  /* ================================================================ */
  doc.addPage();
  doc.setFillColor(10, 22, 40);
  doc.rect(0, 0, W, H, "F");
  doc.setFillColor(231, 111, 81);
  doc.rect(0, 0, W, 4, "F");
  doc.setTextColor(244, 162, 97);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Calculateur de commissions", M, 25);
  let bkP = form.booking_percent;
  let abP = form.airbnb_percent;
  let exP = form.expedia_percent;
  let drP = form.direct_percent;
  const totD = bkP + abP + exP + drP;
  if (totD < 100) {
    const rem = 100 - totD;
    const otaT = bkP + abP + exP;
    if (otaT > 0) {
      bkP = Math.round(bkP + rem * (bkP / otaT));
      abP = Math.round(abP + rem * (abP / otaT));
      exP = 100 - bkP - abP - drP;
    } else {
      bkP = Math.round(rem * 0.73);
      abP = Math.round(rem * 0.2);
      exP = rem - bkP - abP;
    }
  }
  const cBk = 0.18; const cAb = 0.15; const cEx = 0.2; const cDr = 0.03;
  const totalComm = Math.round(ca * (bkP / 100) * cBk + ca * (abP / 100) * cAb + ca * (exP / 100) * cEx + ca * (drP / 100) * cDr);
  const newDr = Math.min(drP + 15, 60);
  const shift = newDr - drP;
  const newBk = Math.max(0, Math.round(bkP - shift * 0.6));
  const newAb = Math.max(0, Math.round(abP - shift * 0.25));
  const newEx = Math.max(0, 100 - newBk - newAb - newDr);
  const newComm = Math.round(ca * (newBk / 100) * cBk + ca * (newAb / 100) * cAb + ca * (newEx / 100) * cEx + ca * (newDr / 100) * cDr);
  const saving = totalComm - newComm;
  y = 38;
  const commRows = [
    ["Booking.com", bkP + "%", "18%", fmt(Math.round(ca * (bkP / 100) * cBk)) + " MAD"],
    ["Airbnb", abP + "%", "15%", fmt(Math.round(ca * (abP / 100) * cAb)) + " MAD"],
    ["Expedia", exP + "%", "20%", fmt(Math.round(ca * (exP / 100) * cEx)) + " MAD"],
    ["Direct", drP + "%", "~3%", fmt(Math.round(ca * (drP / 100) * cDr)) + " MAD"],
    ["TOTAL", "100%", "", fmt(totalComm) + " MAD"],
  ];
  autoTable(doc, {
    startY: y,
    head: [["Canal", "Part", "Commission", "Cout annuel"]],
    body: commRows,
    theme: "grid",
    styles: { cellPadding: 4, fontSize: 9, lineWidth: 0.15, lineColor: [80, 90, 110] },
    headStyles: { fillColor: [231, 111, 81], textColor: [255, 255, 255], fontStyle: "bold", halign: "center" },
    bodyStyles: { fillColor: [20, 30, 50], textColor: [200, 200, 200] },
    alternateRowStyles: { fillColor: [25, 38, 60] },
    columnStyles: {
      0: { cellWidth: 45, fontStyle: "bold" },
      1: { cellWidth: 25, halign: "right" },
      2: { cellWidth: 30, halign: "right" },
      3: { cellWidth: 45, halign: "right" },
    },
    margin: { left: M, right: M },
    didParseCell: (data: any) => {
      if (data.section === "body" && data.row.index === 4) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.textColor = [244, 162, 97];
      }
    },
  });
  y = (doc as any).lastAutoTable.finalY + 12;
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  if (totD < 100) {
    doc.text("Note : le total declare etait de " + totD + "%. La repartition a ete ajustee proportionnellement.", M, y);
    y += 8;
  }
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const scText = "En basculant vers " + newBk + "% Booking / " + newAb + "% Airbnb / " + newEx + "% Expedia / " + newDr + "% direct, vos commissions passeraient de " + fmt(totalComm) + " a " + fmt(newComm) + " MAD. Economie potentielle : " + fmt(saving) + " MAD/an, soit l'equivalent d'environ " + Math.round(saving / Math.max(form.current_price_mad, 1)) + " nuitees au tarif moyen de " + fmt(form.current_price_mad) + " MAD.";
  doc.text(doc.splitTextToSize(scText, CW), M, y);

  /* ================================================================ */
  /*  PAGE 6 : PLAN D'ACTION                                           */
  /* ================================================================ */
  doc.addPage();
  doc.setFillColor(10, 22, 40);
  doc.rect(0, 0, W, H, "F");
  doc.setFillColor(231, 111, 81);
  doc.rect(0, 0, W, 4, "F");
  doc.setTextColor(244, 162, 97);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Plan d'action prioritaire", M, 25);
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("4 priorites principales, classees par impact potentiel et effort modere", M, 34);
  y = 44;
  mods.slice(0, 4).forEach((m, i) => {
    doc.setFillColor(20, 30, 50);
    doc.roundedRect(M, y, CW, 42, 2, 2, "F");
    const pc = grade(m.score).color;
    doc.setFillColor(pc[0], pc[1], pc[2]);
    doc.roundedRect(M, y, 4, 42, 2, 0, "F");
    doc.setTextColor(244, 162, 97);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("P" + (i + 1) + " - " + m.label + " (" + m.score + "/100)", M + 10, y + 9);
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    let at = "";
    if (m.key === "pricing") at = "Mettre en place une grille tarifaire saisonniere dynamique. Ajuster les prix selon la demande, les evenements locaux et le delai de reservation.";
    else if (m.key === "distribution") { if (m.score >= 80 && form.direct_percent >= bench.direct) at = "Protection : votre distribution est deja performante. Maintenez vos efforts sur le canal direct et surveillez l'evolution des commissions OTA."; else at = "Developper le canal direct via un moteur de reservation integre, des offres exclusives site web et une strategie d'email marketing post-sejour."; }
    else if (m.key === "reputation") { if (m.score >= 80) at = "Protection : votre reputation est un atout majeur. Continuez a repondre a 100% des avis et a encourager les clients satisfaits a partager leur experience."; else at = "Instaurer un processus de reponse aux avis sous 24h. Solliciter activement les avis post-sejour par email et WhatsApp."; }
    else if (m.key === "revenue") at = "Optimiser le taux d'occupation en basse saison via des packages et promotions cibles. Diversifier les sources de revenus (transferts, experiences, F&B).";
    doc.text(doc.splitTextToSize(at, CW - 16).slice(0, 3), M + 10, y + 18);
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.text("Impact potentiel eleve et effort modere. Resultats non garantis.", M + 10, y + 36);
    y += 48;
  });

  /* ================================================================ */
  /*  PAGE 7 : PLAN 30/60/90                                           */
  /* ================================================================ */
  doc.addPage();
  doc.setFillColor(10, 22, 40);
  doc.rect(0, 0, W, H, "F");
  doc.setFillColor(231, 111, 81);
  doc.rect(0, 0, W, 4, "F");
  doc.setTextColor(244, 162, 97);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Plan de progression 30 / 60 / 90 jours", M, 25);
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Objectif : +" + weakestGain + " pts sur " + weakest.label + " (de " + weakest.score + " a " + (weakest.score + weakestGain) + "), soit +" + globalGain90 + " pts sur le score global vers " + target90 + "/100.", M, 34);
  const planActions = (wk: string): { t1: string[]; t2: string[]; t3: string[] } => {
    if (wk === "pricing") return {
      t1: ["Appliquer 2 corrections tarifaires immediates (haute/basse saison)", "Creer une grille de prix par periode sur votre Channel Manager", "Verifier que vos tarifs site web sont 10-15% inferieurs a Booking"],
      t2: ["Tester une hausse de 10% sur les chambres les plus demandees", "Mettre en place des tarifs last-minute (-15%) pour combler les trous", "Comparer vos prix chaque semaine avec 3 concurrents directs"],
      t3: ["Mesurer l'impact sur l'ADR et l'occupation vs mois precedent", "Ajuster la grille selon les resultats", "Preparer la strategie tarifaire du trimestre suivant"],
    };
    if (wk === "reputation") return {
      t1: ["Repondre a tous les avis en attente (Booking, TripAdvisor, Google)", "Creer 3 templates de reponse (positif, neutre, negatif)", "Mettre en place un rappel automatique post-sejour par WhatsApp"],
      t2: ["Solliciter activement les avis des clients satisfaits au check-out", "Analyser les avis negatifs pour identifier les problemes recurrents", "Corriger les 2 problemes les plus mentionnes dans les avis"],
      t3: ["Mesurer l'evolution de la note moyenne et du volume d'avis", "Ajuster les templates selon les retours", "Preparer la strategie reputation du trimestre suivant"],
    };
    if (wk === "distribution") return {
      t1: ["Analyser votre mix de canaux actuel et les commissions payees", "Negocier le programme Preferred Booking (15% au lieu de 18%)", "Ajouter un bouton de reservation directe sur votre site web"],
      t2: ["Lancer 1 offre exclusive site web (petit-dejeuner offert, surclassement)", "Configurer un email post-sejour avec lien de reservation directe", "Reduire la dependance au canal le plus couteux de 5%"],
      t3: ["Mesurer l'evolution du mix de canaux et des commissions", "Calculer les economies realisees vs trimestre precedent", "Preparer la strategie distribution du trimestre suivant"],
    };
    return {
      t1: ["Identifier les 3 periodes les plus creuses de l'annee", "Creer 2 packages promotionnels pour la basse saison", "Mettre en place un suivi hebdomadaire occupation + ADR"],
      t2: ["Lancer les packages basse saison sur Booking et le site web", "Diversifier les revenus : transferts, experiences, petit-dejeuner", "Optimiser le calendrier de fermeture/ouverture des chambres"],
      t3: ["Mesurer l'impact sur le taux d'occupation annuel", "Comparer le RevPAR vs trimestre precedent", "Preparer la strategie revenus du trimestre suivant"],
    };
  };
  const pa = planActions(weakest.key);
  const phases = [
    { title: "Jours 1-15 : Actions immediates", items: pa.t1 },
    { title: "Jours 16-45 : Acceleration", items: pa.t2 },
    { title: "Jours 46-90 : Mesure et ajustement", items: pa.t3 },
  ];
  y = 46;
  phases.forEach((ph) => {
    doc.setFillColor(20, 30, 50);
    doc.roundedRect(M, y, CW, 48, 2, 2, "F");
    doc.setTextColor(231, 111, 81);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(ph.title, M + 5, y + 9);
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    ph.items.forEach((it, idx) => { doc.text("- " + it, M + 8, y + 19 + idx * 8); });
    y += 54;
  });
  doc.setTextColor(120, 120, 120);
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text("Ces objectifs sont indicatifs et dependent de la mise en oeuvre effective des actions.", M, y + 5);

  /* ================================================================ */
  /*  PAGE 8 : PROJECTION 12 MOIS                                      */
  /* ================================================================ */
  doc.addPage();
  doc.setFillColor(10, 22, 40);
  doc.rect(0, 0, W, H, "F");
  doc.setFillColor(231, 111, 81);
  doc.rect(0, 0, W, 4, "F");
  doc.setTextColor(244, 162, 97);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Projection a 12 mois", M, 25);
  y = 42;
  const projRows = [
    ["A 3 mois", fmt(gain3) + " MAD", target90 + "/100"],
    ["A 6 mois", fmt(gain6) + " MAD", (Math.round((score + (target12 - score) * 0.55) * 10) / 10) + "/100"],
    ["A 12 mois", fmt(gain12) + " MAD", target12 + "/100"],
  ];
  autoTable(doc, {
    startY: y,
    head: [["Horizon", "Gain cumule estime", "Score cible"]],
    body: projRows,
    theme: "grid",
    styles: { cellPadding: 4, fontSize: 9, lineWidth: 0.15, lineColor: [80, 90, 110] },
    headStyles: { fillColor: [231, 111, 81], textColor: [255, 255, 255], fontStyle: "bold", halign: "center" },
    bodyStyles: { fillColor: [20, 30, 50], textColor: [200, 200, 200] },
    alternateRowStyles: { fillColor: [25, 38, 60] },
    columnStyles: {
      0: { cellWidth: 40, fontStyle: "bold" },
      1: { cellWidth: 55, halign: "right" },
      2: { cellWidth: 40, halign: "right" },
    },
    margin: { left: M, right: M },
  });
  y = (doc as any).lastAutoTable.finalY + 12;
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Gain projete a 12 mois : " + fmt(gain12) + " MAD, soit environ " + pctGainCentral + "% de l'opportunite centrale.", M, y);
  y += 8;
  doc.setTextColor(180, 180, 180);
  doc.setFontSize(9);
  doc.text("Potentiel recuperable total : " + fmt(recov) + " MAD. Le gain a 12 mois represente 85% de ce potentiel.", M, y);
  y += 8;
    const residuelRecup = recov - gain12;
  doc.text("Potentiel recuperable non encore capte a 12 mois : " + fmt(residuelRecup) + " MAD.", M, y);
  y += 8;
  doc.text("Potentiel theorique non capte : " + fmt(residuel12) + " MAD (ecart entre l'opportunite centrale et le gain projete).", M, y);
  y += 14;
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text("Projection indicative fondee sur une mise en oeuvre progressive des recommandations et une recuperation estimee d'environ " + pctGainCentral + "% de l'opportunite identifiee. Resultats non garantis.", M, y);

  /* ================================================================ */
  /*  PAGE 9 : OFFRES                                                  */
  /* ================================================================ */
  doc.addPage();
  doc.setFillColor(10, 22, 40);
  doc.rect(0, 0, W, H, "F");
  doc.setFillColor(231, 111, 81);
  doc.rect(0, 0, W, 4, "F");
  doc.setTextColor(244, 162, 97);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Nos offres d'accompagnement", M, 25);
  y = 42;
  const offers = [
    { name: "Audit Flash", price: "490 MAD", desc: "Diagnostic rapide de votre presence en ligne. Score global, 3 recommandations cles, benchmark local.", tag: "" },
    { name: "Audit Complet + Plan d'Action", price: "1 500 MAD", desc: "Analyse approfondie avec rapport detaille 20 pages, plan d'action 90 jours personnalise, calculateur de commissions exact et 1 appel de restitution de 30 min.", tag: "RECOMMANDE" },
    { name: "Suivi mensuel", price: "700 MAD/mois", desc: "Accompagnement continu : suivi des KPIs, ajustement de la strategie tarifaire, optimisation de la distribution, reporting mensuel.", tag: "" },
  ];
  offers.forEach((o) => {
    const isR = o.tag === "RECOMMANDE";
    doc.setFillColor(isR ? 35 : 20, isR ? 50 : 30, isR ? 70 : 50);
    doc.roundedRect(M, y, CW, 48, 3, 3, "F");
    if (isR) {
      doc.setFillColor(231, 111, 81);
      doc.roundedRect(W - M - 35, y + 3, 30, 7, 1, 1, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(6);
      doc.setFont("helvetica", "bold");
      doc.text(o.tag, W - M - 20, y + 8, { align: "center" });
    }
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(o.name, M + 5, y + 12);
    doc.setTextColor(244, 162, 97);
    doc.setFontSize(14);
    doc.text(o.price, W - M - 5, y + 12, { align: "right" });
    doc.setTextColor(180, 180, 180);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(doc.splitTextToSize(o.desc, CW - 10).slice(0, 3), M + 5, y + 22);
    y += 54;
  });
  y += 5;
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Pour en savoir plus, contactez-nous via WhatsApp ou par email.", M, y);
  doc.text("Paiement par virement bancaire ou en especes.", M, y + 7);

  /* ================================================================ */
  /*  PAGE 10 : CONCLUSION                                             */
  /* ================================================================ */
  doc.addPage();
  doc.setFillColor(10, 22, 40);
  doc.rect(0, 0, W, H, "F");
  doc.setFillColor(231, 111, 81);
  doc.rect(0, 0, W, 4, "F");
  doc.setTextColor(244, 162, 97);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Conclusion", M, 25);
  y = 42;
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const cp = conclusionParas(g.letter, score, central, recov, gain12);
  cp.forEach((p) => {
    const l = doc.splitTextToSize(p, CW);
    doc.text(l, M, y);
    y += l.length * 6 + 4;
  });
  y += 10;
  doc.setFillColor(20, 30, 50);
  doc.roundedRect(M, y, CW, 30, 3, 3, "F");
  doc.setTextColor(244, 162, 97);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Prochaine etape", M + 5, y + 10);
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Recevez votre Audit Complet + Plan d'Action personnalise pour 1 500 MAD.", M + 5, y + 19);
  doc.text("Contactez-nous des maintenant pour passer a l'action.", M + 5, y + 26);
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("RiadPulse - Audit genere le " + new Date().toLocaleDateString("fr-FR") + " - Ce rapport est confidentiel et destine uniquement a l'etablissement concerne.", M, H - 10);

  const fileName = "RiadPulse_Audit_" + (form.riad_name || "Riad").replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30) + "_" + new Date().toISOString().slice(0, 10) + ".pdf";
  doc.save(fileName);
}