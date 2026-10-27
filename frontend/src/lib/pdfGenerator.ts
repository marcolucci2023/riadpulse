// frontend/src/lib/pdfGenerator.ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AuditResult {
  global_score: number;
  modules: {
    pricing: { score: number; weight: number; details: string };
    distribution: { score: number; weight: number; details: string };
    reputation: { score: number; weight: number; details: string };
    revenue: { score: number; weight: number; details: string };
  };
  loss: number;
  recommendations: string[];
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

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const fmt = (n: number): string =>
  Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

const grade = (s: number): { letter: string; title: string; color: [number, number, number] } => {
  if (s >= 85) return { letter: "A", title: "Excellent", color: [34, 139, 34] };
  if (s >= 70) return { letter: "B", title: "Bon", color: [218, 165, 32] };
  if (s >= 55) return { letter: "C", title: "Moyen", color: [231, 111, 81] };
  return { letter: "D", title: "A am\u00e9liorer", color: [192, 57, 43] };
};

/* ------------------------------------------------------------------ */
/*  Benchmarks locaux (Observatoire du Tourisme Maroc 2023-2024)       */
/* ------------------------------------------------------------------ */

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
  const cityBench = BENCH[city];
  if (cityBench) {
    const s = Math.max(3, Math.min(5, Math.round(stars))) as 3 | 4 | 5;
    if (cityBench[s]) return cityBench[s];
  }
  const defaults: Record<number, Bench> = {
    3: { adr: 450, booking: 7.5, reviews: 100, direct: 20 },
    4: { adr: 700, booking: 8.0, reviews: 150, direct: 25 },
    5: { adr: 1200, booking: 8.6, reviews: 250, direct: 30 },
  };
  return defaults[Math.max(3, Math.min(5, Math.round(stars)))];
};

/* ------------------------------------------------------------------ */
/*  Diagnostic par module                                              */
/* ------------------------------------------------------------------ */

const moduleDiag = (
  key: string,
  score: number,
  form: FormData,
  bench: Bench
): string => {
  if (key === "pricing") {
    const note =
      " Le score Prix ne mesure pas uniquement le niveau de l'ADR. Il \u00e9value principalement l'adaptation des tarifs \u00e0 la saison, \u00e0 la demande, aux \u00e9v\u00e9nements et au d\u00e9lai de r\u00e9servation.";
    if (score >= 80)
      return `Votre ADR de ${fmt(form.current_price_mad)} MAD est bien positionn\u00e9 par rapport \u00e0 la m\u00e9diane locale de ${fmt(bench.adr)} MAD.${note}`;
    if (score >= 60)
      return `Votre ADR de ${fmt(form.current_price_mad)} MAD est proche de la m\u00e9diane locale de ${fmt(bench.adr)} MAD, mais la strat\u00e9gie tarifaire pourrait \u00eatre affin\u00e9e selon la saisonnalit\u00e9.${note}`;
    return `Votre ADR de ${fmt(form.current_price_mad)} MAD s'\u00e9carte de la m\u00e9diane locale de ${fmt(bench.adr)} MAD. Une r\u00e9vision de la grille tarifaire saisonni\u00e8re est recommand\u00e9e.${note}`;
  }

  if (key === "distribution") {
    if (form.direct_percent < 10) {
      return `Vous d\u00e9pendez fortement des OTA : seulement ${form.direct_percent}% de vos r\u00e9servations sont directes. Une part importante de votre CA peut donc \u00eatre soumise \u00e0 des commissions.`;
    }
    if (form.direct_percent < bench.direct) {
      return `Votre part de r\u00e9servations directes atteint ${form.direct_percent}%, soit ${bench.direct - form.direct_percent} points sous la m\u00e9diane locale de ${bench.direct}%. Le potentiel prioritaire consiste \u00e0 d\u00e9velopper le canal direct gr\u00e2ce \u00e0 l'email, \u00e0 la fid\u00e9lisation et aux offres exclusives.`;
    }
    if (form.direct_percent === bench.direct) {
      return `Votre part de r\u00e9servations directes atteint ${form.direct_percent}%, au niveau de la m\u00e9diane locale. Continuez \u00e0 d\u00e9velopper l'email, la fid\u00e9lisation et les offres exclusives.`;
    }
    return `Votre part de r\u00e9servations directes atteint ${form.direct_percent}%, au-dessus de la m\u00e9diane locale de ${bench.direct}%. Continuez \u00e0 valoriser vos canaux directs et \u00e0 ma\u00eetriser vos co\u00fbts d'acquisition.`;
  }

  if (key === "reputation") {
    const avgNote =
      (form.booking_score + form.tripadvisor_score + form.google_score) / 3;
    const totalReviews =
      form.booking_reviews + form.tripadvisor_reviews + form.google_reviews;
    if (score >= 80)
      return `Votre note moyenne de ${avgNote.toFixed(1)}/10 avec ${fmt(totalReviews)} avis t\u00e9moigne d'une bonne r\u00e9putation en ligne. Maintenez ce niveau de qualit\u00e9.`;
    if (score >= 60)
      return `Votre note moyenne de ${avgNote.toFixed(1)}/10 avec ${fmt(totalReviews)} avis est correcte mais peut progresser. Un plan de r\u00e9ponse syst\u00e9matique aux avis est recommand\u00e9.`;
    return `Votre note moyenne de ${avgNote.toFixed(1)}/10 avec ${fmt(totalReviews)} avis est en dessous des standards du march\u00e9. La gestion active des avis est une priorit\u00e9.`;
  }

  if (key === "revenue") {
    const occ = Math.round(form.occupancy_rate * 100);
    if (score >= 80)
      return `Votre taux d'occupation de ${occ}% et votre CA de ${fmt(form.annual_revenue_mad)} MAD indiquent une bonne performance commerciale.`;
    if (score >= 60)
      return `Votre taux d'occupation de ${occ}% et votre CA de ${fmt(form.annual_revenue_mad)} MAD montrent un potentiel de croissance significatif.`;
    return `Votre taux d'occupation de ${occ}% et votre CA de ${fmt(form.annual_revenue_mad)} MAD r\u00e9v\u00e8lent un important potentiel inexploit\u00e9.`;
  }

  return "";
};

/* ------------------------------------------------------------------ */
/*  Conclusion dynamique                                               */
/* ------------------------------------------------------------------ */

const conclusionParas = (
  g: string,
  score: number,
  central: number,
  recov: number
): string[] => {
  if (g === "A")
    return [
      `Votre \u00e9tablissement obtient un score de ${score}/100, ce qui le place parmi les meilleurs de sa cat\u00e9gorie.`,
      `M\u00eame \u00e0 ce niveau, une opportunit\u00e9 de croissance estim\u00e9e \u00e0 ~${fmt(central)} MAD subsiste. En r\u00e9cup\u00e9rant une partie de ce potentiel, vous pourriez g\u00e9n\u00e9rer jusqu'\u00e0 ${fmt(recov)} MAD suppl\u00e9mentaires.`,
      "Cette \u00e9valuation est indicative et fond\u00e9e sur les donn\u00e9es d\u00e9clar\u00e9es. Les r\u00e9sultats r\u00e9els d\u00e9pendent de nombreux facteurs op\u00e9rationnels.",
    ];
  if (g === "B")
    return [
      `Votre \u00e9tablissement obtient un score de ${score}/100, ce qui constitue une base solide.`,
      `Avec un score de ${score}/100, votre \u00e9tablissement dispose de bonnes bases mais conserve un potentiel d'am\u00e9lioration important.`,
      `Une opportunit\u00e9 de croissance estim\u00e9e \u00e0 ~${fmt(central)} MAD a \u00e9t\u00e9 identifi\u00e9e. En mettant en \u0153uvre les recommandations cl\u00e9s, vous pourriez r\u00e9cup\u00e9rer environ ${fmt(recov)} MAD.`,
      "Cette \u00e9valuation est indicative et fond\u00e9e sur les donn\u00e9es d\u00e9clar\u00e9es. Les r\u00e9sultats r\u00e9els d\u00e9pendent de nombreux facteurs op\u00e9rationnels.",
    ];
  if (g === "C")
    return [
      `Votre \u00e9tablissement obtient un score de ${score}/100, ce qui r\u00e9v\u00e8le un potentiel significatif d'am\u00e9lioration.`,
      `Une opportunit\u00e9 de croissance estim\u00e9e \u00e0 ~${fmt(central)} MAD a \u00e9t\u00e9 identifi\u00e9e. En priorisant les actions les plus impactantes, vous pourriez r\u00e9cup\u00e9rer environ ${fmt(recov)} MAD.`,
      "Cette \u00e9valuation est indicative et fond\u00e9e sur les donn\u00e9es d\u00e9clar\u00e9es. Les r\u00e9sultats r\u00e9els d\u00e9pendent de nombreux facteurs op\u00e9rationnels.",
    ];
  return [
    `Votre \u00e9tablissement obtient un score de ${score}/100, ce qui indique des axes d'am\u00e9lioration majeurs.`,
    `Une opportunit\u00e9 de croissance estim\u00e9e \u00e0 ~${fmt(central)} MAD a \u00e9t\u00e9 identifi\u00e9e. En agissant sur les leviers prioritaires, vous pourriez r\u00e9cup\u00e9rer environ ${fmt(recov)} MAD.`,
    "Cette \u00e9valuation est indicative et fond\u00e9e sur les donn\u00e9es d\u00e9clar\u00e9es. Les r\u00e9sultats r\u00e9els d\u00e9pendent de nombreux facteurs op\u00e9rationnels.",
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

  const score = Math.round(result.global_score * 10) / 10;
  const g = grade(score);
  const ca = form.annual_revenue_mad;
  const bench = getBench(form.city, form.stars);

  /* --- Calculs financiers coh\u00e9rents --- */
  const perteTheo = Math.round(ca * (1 - score / 100));
  const facteur = perteTheo > 0 ? (result.loss / perteTheo) * 100 : 0;
  const central = Math.round(perteTheo * (facteur / 100));
  const fourchetteLow = Math.round(perteTheo * 0.7);
  const fourchetteHigh = perteTheo;
  const recov = Math.round(central * 0.7);
  const gain3 = Math.round(recov * 0.25);
  const gain6 = Math.round(recov * 0.55);
  const gain12 = Math.round(recov * 0.85);
  const residuel12 = central - gain12;
  const pctGainCentral =
    central > 0 ? Math.round((gain12 / central) * 1000) / 10 : 0;

  /* --- Modules tri\u00e9s par score croissant --- */
  const mods = [
    { key: "pricing", label: "Prix & Tarifs", ...result.modules.pricing },
    {
      key: "distribution",
      label: "Distribution",
      ...result.modules.distribution,
    },
    {
      key: "reputation",
      label: "R\u00e9putation",
      ...result.modules.reputation,
    },
    { key: "revenue", label: "Revenus", ...result.modules.revenue },
  ];
  mods.sort((a, b) => a.score - b.score);

  const wPct = (w: number) => (w <= 1 ? Math.round(w * 100) : Math.round(w));
  const weakest = mods[0];
  const scoreGain90 = Math.round(10 * (wPct(weakest.weight) / 100) * 10) / 10;
  const target90 = Math.min(100, Math.round((score + scoreGain90) * 10) / 10);
  const target12 = Math.min(100, score + 10);

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
  const starsStr =
    form.stars > 0 ? `${form.stars} etoiles` : "Non classe";
  doc.text(`${form.city || "Maroc"}  |  ${starsStr}  |  ${form.num_rooms || 0} chambres`, M, 80);

  /* Score circulaire */
  const cx = W / 2;
  const cy = 135;
  const r = 30;

  doc.setDrawColor(40, 50, 70);
  doc.setLineWidth(6);
  doc.circle(cx, cy, r, "S");

  doc.setDrawColor(g.color[0], g.color[1], g.color[2]);
  doc.setLineWidth(6);
  const arc = (score / 100) * 360;
  doc.arc(cx, cy, r, -90, -90 + arc, "S");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.text(`${score}`, cx, cy + 4, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("/100", cx, cy + 12, { align: "center" });

  doc.setTextColor(g.color[0], g.color[1], g.color[2]);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(`Grade ${g.letter} - ${g.title}`, cx, cy + r + 18, {
    align: "center",
  });

  /* Chiffres cl\u00e9s */
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
  doc.text(`~${fmt(central)} MAD`, M + 10, boxY + 26);

  doc.setTextColor(150, 150, 150);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Fourchette : ${fmt(fourchetteLow)} - ${fmt(fourchetteHigh)} MAD (70%-100% du potentiel theorique)`,
    M + 10,
    boxY + 38
  );

  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.text(
    `Date du rapport : ${new Date().toLocaleDateString("fr-FR")}`,
    M,
    H - 15
  );
  doc.text("RiadPulse - Audit genere automatiquement", W - M, H - 15, {
    align: "right",
  });

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
    const wPctVal = wPct(m.weight);
    doc.setFillColor(20, 30, 50);
    doc.roundedRect(M, y, CW, 32, 2, 2, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`${m.label} (${wPctVal}%)`, M + 5, y + 8);

    const mColor = grade(m.score).color;
    doc.setTextColor(mColor[0], mColor[1], mColor[2]);
    doc.setFontSize(14);
    doc.text(`${m.score}/100`, W - M - 5, y + 8, { align: "right" });

    doc.setTextColor(200, 200, 200);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const diag = moduleDiag(m.key, m.score, form, bench);
    const lines = doc.splitTextToSize(diag, CW - 10);
    doc.text(lines.slice(0, 2), M + 5, y + 16);

    y += 38;
  });

  /* Impact financier */
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
  const formule = `CA ${fmt(ca)} MAD x (1 - ${score}/100) = ${fmt(perteTheo)} MAD (perte theorique)`;
  doc.text(formule, M + 5, y + 20);
  doc.text(
    `Ajustement facteur ${Math.round(facteur)}% vers opportunite centrale : ~${fmt(central)} MAD`,
    M + 5,
    y + 28
  );
  doc.text(
    `Fourchette : ${fmt(fourchetteLow)} - ${fmt(fourchetteHigh)} MAD (70%-100% du potentiel theorique)`,
    M + 5,
    y + 36
  );

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

  const methoParas = [
    "Ce rapport est genere a partir des donnees que vous avez declarees (chiffre d'affaires, taux d'occupation, repartition des canaux, notes et avis) ainsi que de benchmarks publics du secteur hotelier marocain (Observatoire du Tourisme 2023-2024).",
    "",
    "Niveau de confiance : Moyen.",
    "",
    "Les donnees declarees n'ont pas ete verifiees de maniere independante. Le score global est une estimation indicative, pas une mesure certifiee. La fourchette de perte theorique (70%-100%) reflete cette marge d'incertitude.",
    "",
    "Les benchmarks locaux sont des medianes par ville et categorie d'etoiles. Votre etablissement peut legimement se situer au-dessus ou en dessous de ces valeurs selon son positionnement specifique.",
    "",
    "Les projections financieres (pages 7-8) sont des estimations fondees sur des hypotheses de recuperation partielle. Elles ne constituent pas une garantie de resultat.",
  ];

  methoParas.forEach((p) => {
    if (p === "") {
      y += 5;
      return;
    }
    const lines = doc.splitTextToSize(p, CW);
    doc.text(lines, M, y);
    y += lines.length * 5 + 3;
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
  doc.text(
    `Comparaison avec la mediane ${form.city} ${form.stars} etoiles (sources : Observatoire du Tourisme)`,
    M,
    34
  );

  const adrDiff = form.current_price_mad - bench.adr;
  const bkDiff =
    Math.round((form.booking_score - bench.booking) * 10) / 10;
  const revDiff = form.booking_reviews - bench.reviews;
  const dirDiff = form.direct_percent - bench.direct;

  const benchRows = [
    [
      "ADR (prix moyen)",
      `${fmt(form.current_price_mad)} MAD`,
      `${fmt(bench.adr)} MAD`,
      `${adrDiff >= 0 ? "+" : ""}${fmt(adrDiff)} MAD`,
    ],
    [
      "Note Booking",
      `${form.booking_score}/10`,
      `${bench.booking}/10`,
      `${bkDiff >= 0 ? "+" : ""}${bkDiff}`,
    ],
    [
      "Avis Booking",
      `${form.booking_reviews}`,
      `${bench.reviews}`,
      `${revDiff >= 0 ? "+" : ""}${revDiff}`,
    ],
    [
      "Reservations directes",
      `${form.direct_percent}%`,
      `${bench.direct}%`,
      `${dirDiff >= 0 ? "+" : ""}${dirDiff} pts`,
    ],
  ];

  autoTable(doc, {
    startY: 42,
    head: [["Indicateur", "Vous", "Mediane", "Ecart"]],
    body: benchRows,
    headStyles: {
      fillColor: [231, 111, 81],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fillColor: [20, 30, 50],
      textColor: [200, 200, 200],
      fontSize: 9,
    },
    alternateRowStyles: { fillColor: [25, 38, 60] },
    columnStyles: {
      0: { cellWidth: 50, halign: "left", fontStyle: "bold" },
      1: { cellWidth: 35, halign: "right" },
      2: { cellWidth: 35, halign: "right" },
      3: { cellWidth: 35, halign: "right" },
    },
    margin: { left: M, right: M },
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  doc.setTextColor(200, 200, 200);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  let benchAnalysis = "";
  if (adrDiff > 0)
    benchAnalysis += `Votre ADR est ${fmt(adrDiff)} MAD au-dessus de la mediane locale. `;
  else if (adrDiff < 0)
    benchAnalysis += `Votre ADR est ${fmt(Math.abs(adrDiff))} MAD en dessous de la mediane locale. `;
  else benchAnalysis += "Votre ADR est aligne sur la mediane locale. ";

  if (dirDiff < 0)
    benchAnalysis += `Votre part de direct est ${Math.abs(dirDiff)} pts sous la mediane : c'est le levier prioritaire.`;
  else if (dirDiff > 0)
    benchAnalysis += `Votre part de direct depasse la mediane de ${dirDiff} pts, ce qui est un point fort.`;
  else
    benchAnalysis +=
      "Votre part de direct est alignee sur la mediane locale.";

  const bLines = doc.splitTextToSize(benchAnalysis, CW);
  doc.text(bLines, M, y);

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

  /* Auto-redistribution si total < 100 */
  let bkPct = form.booking_percent;
  let abPct = form.airbnb_percent;
  let exPct = form.expedia_percent;
  let drPct = form.direct_percent;
  const totalDeclared = bkPct + abPct + exPct + drPct;

  if (totalDeclared < 100) {
    const remaining = 100 - totalDeclared;
    const otaTotal = bkPct + abPct + exPct;
    if (otaTotal > 0) {
      bkPct = Math.round(bkPct + remaining * (bkPct / otaTotal));
      abPct = Math.round(abPct + remaining * (abPct / otaTotal));
      exPct = 100 - bkPct - abPct - drPct;
    } else {
      bkPct = Math.round(remaining * 0.73);
      abPct = Math.round(remaining * 0.2);
      exPct = remaining - bkPct - abPct;
    }
  }

  const commBk = 0.18;
  const commAb = 0.15;
  const commEx = 0.2;
  const commDr = 0.03;

  const totalComm = Math.round(
    ca *
      (bkPct / 100) * commBk +
      ca * (abPct / 100) * commAb +
      ca * (exPct / 100) * commEx +
      ca * (drPct / 100) * commDr
  );

  const newDr = Math.min(drPct + 15, 60);
  const shift = newDr - drPct;
  const newBk = Math.max(0, Math.round(bkPct - shift * 0.6));
  const newAb = Math.max(0, Math.round(abPct - shift * 0.25));
  const newEx = Math.max(0, 100 - newBk - newAb - newDr);

  const newComm = Math.round(
    ca *
      (newBk / 100) * commBk +
      ca * (newAb / 100) * commAb +
      ca * (newEx / 100) * commEx +
      ca * (newDr / 100) * commDr
  );

  const saving = totalComm - newComm;

  y = 38;
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const commRows = [
    ["Booking.com", `${bkPct}%`, "18%", `${fmt(Math.round(ca * (bkPct / 100) * commBk))} MAD`],
    ["Airbnb", `${abPct}%`, "15%", `${fmt(Math.round(ca * (abPct / 100) * commAb))} MAD`],
    ["Expedia", `${exPct}%`, "20%", `${fmt(Math.round(ca * (exPct / 100) * commEx))} MAD`],
    ["Direct", `${drPct}%`, "~3%", `${fmt(Math.round(ca * (drPct / 100) * commDr))} MAD`],
    ["TOTAL", "100%", "", `${fmt(totalComm)} MAD`],
  ];

  autoTable(doc, {
    startY: y,
    head: [["Canal", "Part", "Commission", "Cout annuel"]],
    body: commRows,
    headStyles: {
      fillColor: [231, 111, 81],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fillColor: [20, 30, 50],
      textColor: [200, 200, 200],
      fontSize: 9,
    },
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
  if (totalDeclared < 100) {
    doc.text(
      `Note : le total declare etait de ${totalDeclared}%. La repartition a ete ajustee proportionnellement.`,
      M,
      y
    );
    y += 8;
  }

  doc.setTextColor(200, 200, 200);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  const scText = `En basculant vers ${newBk}% Booking / ${newAb}% Airbnb / ${newEx}% Expedia / ${newDr}% direct, vos commissions passeraient de ${fmt(totalComm)} a ${fmt(newComm)} MAD. Economie potentielle : ${fmt(saving)} MAD/an, soit l'equivalent d'environ ${Math.round(saving / Math.max(form.current_price_mad, 1))} nuitees au tarif moyen de ${fmt(form.current_price_mad)} MAD.`;

  const scLines = doc.splitTextToSize(scText, CW);
  doc.text(scLines, M, y);

  /* ================================================================ */
  /*  PAGE 6 : PLAN D'ACTION PRIORITAIRE                               */
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
  doc.text(
    "4 priorites principales, classees par impact potentiel et effort modere",
    M,
    34
  );

  y = 44;

  const priorities = mods.slice(0, 4);

  priorities.forEach((m, i) => {
    doc.setFillColor(20, 30, 50);
    doc.roundedRect(M, y, CW, 42, 2, 2, "F");

    const pColor = grade(m.score).color;
    doc.setFillColor(pColor[0], pColor[1], pColor[2]);
    doc.roundedRect(M, y, 4, 42, 2, 0, "F");

    doc.setTextColor(244, 162, 97);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`P${i + 1} - ${m.label} (${m.score}/100)`, M + 10, y + 9);

    doc.setTextColor(200, 200, 200);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");

    let actionText = "";
    if (m.key === "pricing") {
      actionText =
        "Mettre en place une grille tarifaire saisonniere dynamique. Ajuster les prix selon la demande, les evenements locaux et le delai de reservation.";
    } else if (m.key === "distribution") {
      if (m.score >= 80) {
        actionText =
          "Protection : votre distribution est deja performante. Maintenez vos efforts sur le canal direct et surveillez l'evolution des commissions OTA.";
      } else {
        actionText =
          "Developper le canal direct via un moteur de reservation integre, des offres exclusives site web et une strategie d'email marketing post-sejour.";
      }
    } else if (m.key === "reputation") {
      if (m.score >= 90) {
        actionText =
          "Protection : votre reputation est un atout majeur. Continuez a repondre a 100% des avis et a encourager les clients satisfaits a partager leur experience.";
      } else {
        actionText =
          "Instaurer un processus de reponse aux avis sous 24h. Solliciter activement les avis post-sejour par email et WhatsApp.";
      }
    } else if (m.key === "revenue") {
      actionText =
        "Optimiser le taux d'occupation en basse saison via des packages et promotions cibles. Diversifier les sources de revenus (transferts, experiences, F&B).";
    }

    const aLines = doc.splitTextToSize(actionText, CW - 16);
    doc.text(aLines.slice(0, 3), M + 10, y + 18);

    doc.setTextColor(150, 150, 150);
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.text(
      "Impact potentiel eleve et effort modere. Resultats non garantis.",
      M + 10,
      y + 36
    );

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
  doc.text(
    `Objectif realiste : +${scoreGain90} pts sur le module le plus faible (${weakest.label}), vers ${target90}/100 global.`,
    M,
    34
  );

  const phases = [
    {
      title: "Jours 1-30 : Fondations",
      items: [
        `Auditer la grille tarifaire de ${weakest.label.toLowerCase()} et identifier les incoherences`,
        "Mettre en place un tableau de bord de suivi hebdomadaire",
        "Former l'equipe aux bonnes pratiques identifiees dans ce rapport",
      ],
    },
    {
      title: "Jours 31-60 : Acceleration",
      items: [
        `Deployer les premieres actions correctives sur ${weakest.label.toLowerCase()}`,
        "Tester 2 a 3 leviers de croissance a fort impact",
        "Mesurer les premiers resultats et ajuster la strategie",
      ],
    },
    {
      title: "Jours 61-90 : Consolidation",
      items: [
        `Evaluer la progression : objectif ${target90}/100 sur le score global`,
        "Automatiser les processus qui ont fait leurs preuves",
        "Preparer le plan trimestriel suivant",
      ],
    },
  ];

  y = 46;

  phases.forEach((phase) => {
    doc.setFillColor(20, 30, 50);
    doc.roundedRect(M, y, CW, 48, 2, 2, "F");

    doc.setTextColor(231, 111, 81);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(phase.title, M + 5, y + 9);

    doc.setTextColor(200, 200, 200);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    phase.items.forEach((item, idx) => {
      doc.text(`- ${item}`, M + 8, y + 19 + idx * 8);
    });

    y += 54;
  });

  doc.setTextColor(120, 120, 120);
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text(
    "Ces objectifs sont indicatifs et dependent de la mise en oeuvre effective des actions.",
    M,
    y + 5
  );

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
    ["A 3 mois", `${fmt(gain3)} MAD`, `${Math.round(score + (target12 - score) * 0.25 * 10) / 10}/100`],
    ["A 6 mois", `${fmt(gain6)} MAD`, `${Math.round(score + (target12 - score) * 0.55 * 10) / 10}/100`],
    ["A 12 mois", `${fmt(gain12)} MAD`, `${target12}/100`],
  ];

  autoTable(doc, {
    startY: y,
    head: [["Horizon", "Gain cumule estime", "Score cible"]],
    body: projRows,
    headStyles: {
      fillColor: [231, 111, 81],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fillColor: [20, 30, 50],
      textColor: [200, 200, 200],
      fontSize: 9,
    },
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
  doc.text(
    `Gain projete a 12 mois : ${fmt(gain12)} MAD, soit environ ${pctGainCentral}% de l'opportunite centrale.`,
    M,
    y
  );

  y += 10;
  doc.text(
    `Opportunite residuelle a 12 mois : ${fmt(residuel12)} MAD (potentiel restant a capter au-dela de la premiere annee).`,
    M,
    y
  );

  y += 16;
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text(
    `Projection indicative fondee sur une mise en oeuvre progressive des recommandations et une recuperation estimee d'environ ${pctGainCentral}% de l'opportunite identifiee. Resultats non garantis.`,
    M,
    y
  );

  /* ================================================================ */
  /*  PAGE 9 : OFFRES RIADPULSE                                        */
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
    {
      name: "Audit Flash",
      price: "500 MAD",
      desc: "Diagnostic rapide de votre presence en ligne. Score global, 3 recommandations cles, benchmark local.",
      tag: "",
    },
    {
      name: "Audit Complet + Video",
      price: "1 500 MAD",
      desc: "Analyse approfondie avec rapport detaille, video de 15 min commentee, plan d'action 90 jours et calculateur de commissions personnalise.",
      tag: "RECOMMANDE",
    },
    {
      name: "Suivi mensuel",
      price: "700 MAD/mois",
      desc: "Accompagnement continu : suivi des KPIs, ajustement de la strategie tarifaire, optimisation de la distribution, reporting mensuel.",
      tag: "",
    },
  ];

  offers.forEach((offer) => {
    const isRec = offer.tag === "RECOMMANDE";
    doc.setFillColor(isRec ? 35 : 20, isRec ? 50 : 30, isRec ? 70 : 50);
    doc.roundedRect(M, y, CW, 48, 3, 3, "F");

    if (isRec) {
      doc.setFillColor(231, 111, 81);
      doc.roundedRect(W - M - 35, y + 3, 30, 7, 1, 1, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(6);
      doc.setFont("helvetica", "bold");
      doc.text(offer.tag, W - M - 20, y + 8, { align: "center" });
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(offer.name, M + 5, y + 12);

    doc.setTextColor(244, 162, 97);
    doc.setFontSize(14);
    doc.text(offer.price, W - M - 5, y + 12, { align: "right" });

    doc.setTextColor(180, 180, 180);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const oLines = doc.splitTextToSize(offer.desc, CW - 10);
    doc.text(oLines.slice(0, 3), M + 5, y + 22);

    y += 54;
  });

  y += 5;
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Pour en savoir plus, contactez-nous via WhatsApp ou par email.",
    M,
    y
  );
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

  const cParas = conclusionParas(g.letter, score, central, recov);
  cParas.forEach((p) => {
    const lines = doc.splitTextToSize(p, CW);
    doc.text(lines, M, y);
    y += lines.length * 6 + 4;
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
  doc.text(
    "Recevez votre Audit Complet + Video de 15 min pour 1 500 MAD.",
    M + 5,
    y + 19
  );
  doc.text(
    "Contactez-nous des maintenant pour passer a l'action.",
    M + 5,
    y + 26
  );

  /* Footer */
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(
    "RiadPulse - Audit genere le " +
      new Date().toLocaleDateString("fr-FR") +
      " - Ce rapport est confidentiel et destine uniquement a l'etablissement concerne.",
    M,
    H - 10
  );

  /* ================================================================ */
  /*  SAVE                                                             */
  /* ================================================================ */

  const fileName = `RiadPulse_Audit_${(form.riad_name || "Riad")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .substring(0, 30)}_${new Date().toISOString().slice(0, 10)}.pdf`;

  doc.save(fileName);
}