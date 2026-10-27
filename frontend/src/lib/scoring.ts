export type Bench = { adr: number; booking: number; reviews: number; direct: number };

const BENCH: Record<string, Record<number, Bench>> = {
  Marrakech: { 3: { adr: 550, booking: 7.8, reviews: 150, direct: 20 }, 4: { adr: 850, booking: 8.2, reviews: 200, direct: 25 }, 5: { adr: 1400, booking: 8.8, reviews: 300, direct: 30 } },
  Fes: { 3: { adr: 400, booking: 7.5, reviews: 100, direct: 18 }, 4: { adr: 650, booking: 8.0, reviews: 150, direct: 22 }, 5: { adr: 1100, booking: 8.6, reviews: 250, direct: 28 } },
  Essaouira: { 3: { adr: 450, booking: 7.6, reviews: 80, direct: 22 }, 4: { adr: 700, booking: 8.1, reviews: 120, direct: 28 }, 5: { adr: 1200, booking: 8.7, reviews: 200, direct: 32 } },
  Casablanca: { 3: { adr: 500, booking: 7.4, reviews: 120, direct: 15 }, 4: { adr: 800, booking: 7.9, reviews: 180, direct: 20 }, 5: { adr: 1300, booking: 8.5, reviews: 280, direct: 25 } },
  Tanger: { 3: { adr: 420, booking: 7.5, reviews: 90, direct: 18 }, 4: { adr: 680, booking: 8.0, reviews: 140, direct: 22 }, 5: { adr: 1100, booking: 8.5, reviews: 220, direct: 27 } },
  Chefchaouen: { 3: { adr: 350, booking: 7.7, reviews: 60, direct: 25 }, 4: { adr: 550, booking: 8.2, reviews: 100, direct: 30 }, 5: { adr: 900, booking: 8.6, reviews: 150, direct: 35 } },
  Rabat: { 3: { adr: 480, booking: 7.4, reviews: 100, direct: 16 }, 4: { adr: 750, booking: 7.9, reviews: 160, direct: 20 }, 5: { adr: 1200, booking: 8.5, reviews: 250, direct: 25 } },
  "El Jadida": { 3: { adr: 380, booking: 7.3, reviews: 50, direct: 20 }, 4: { adr: 600, booking: 7.8, reviews: 80, direct: 25 }, 5: { adr: 950, booking: 8.4, reviews: 130, direct: 30 } },
};

export const getBench = (city: string, stars: number): Bench => {
  const cb = BENCH[city];
  if (cb) { const s = Math.max(3, Math.min(5, Math.round(stars))) as 3 | 4 | 5; if (cb[s]) return cb[s]; }
  const d: Record<number, Bench> = { 3: { adr: 450, booking: 7.5, reviews: 100, direct: 20 }, 4: { adr: 700, booking: 8.0, reviews: 150, direct: 25 }, 5: { adr: 1200, booking: 8.6, reviews: 250, direct: 30 } };
  return d[Math.max(3, Math.min(5, Math.round(stars)))];
};

export const calcPricingScore = (adr: number, benchAdr: number): number => {
  const ratio = adr / Math.max(benchAdr, 1);
  if (ratio >= 0.85 && ratio <= 1.15) return 82;
  if (ratio >= 0.7 && ratio <= 1.3) return 65;
  if (ratio >= 0.55 && ratio <= 1.6) return 48;
  return 35;
};

export const calcDistributionScore = (directPct: number, benchDirect: number, responseRate: number): number => {
  const ratio = directPct / Math.max(benchDirect, 1);
  const base = Math.min(100, Math.round(ratio * 65 + 20));
  const bonus = Math.round((responseRate / 100) * 10);
  return Math.min(100, base + bonus);
};

export const calcReputationScore = (bookingScore: number, taScore: number, googleScore: number, totalReviews: number): number => {
  const scores: number[] = [];
  if (bookingScore > 0) scores.push(bookingScore);
  if (taScore > 0) scores.push(taScore);
  if (googleScore > 0) scores.push(googleScore);
  if (scores.length === 0) return 50;
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const volBonus = Math.min(10, Math.round(totalReviews / 50));
  return Math.min(100, Math.round(avg * 9 + volBonus));
};

export const calcRevenueScore = (occupancyRate: number): number => {
  const occ = occupancyRate * 100;
  if (occ >= 80) return 85;
  if (occ >= 70) return 72;
  if (occ >= 60) return 60;
  if (occ >= 50) return 50;
  return 40;
};

export interface RecalcResult {
  score: number;
  grade: string;
  gradeTitle: string;
  perteTheo: number;
  central: number;
  modules: { pricing: number; distribution: number; reputation: number; revenue: number };
}

export function recalcScore(params: {
  city: string; stars: number; adr: number; directPct: number;
  responseRate: number; bookingScore: number; taScore: number;
  googleScore: number; totalReviews: number; occupancyRate: number;
  ca: number;
}): RecalcResult {
  const bench = getBench(params.city, params.stars);
  const pricing = calcPricingScore(params.adr, bench.adr);
  const distribution = calcDistributionScore(params.directPct, bench.direct, params.responseRate);
  const reputation = calcReputationScore(params.bookingScore, params.taScore, params.googleScore, params.totalReviews);
  const revenue = calcRevenueScore(params.occupancyRate);
  const score = Math.round((pricing + distribution + reputation + revenue) / 4 * 10) / 10;
  const perteTheo = Math.round(params.ca * (1 - score / 100));
  const central = Math.round(perteTheo * 0.8);
  let grade = "D"; let gradeTitle = "A ameliorer";
  if (score >= 85) { grade = "A"; gradeTitle = "Excellent"; }
  else if (score >= 70) { grade = "B"; gradeTitle = "Bon"; }
  else if (score >= 55) { grade = "C"; gradeTitle = "Moyen"; }
  return { score, grade, gradeTitle, perteTheo, central, modules: { pricing, distribution, reputation, revenue } };
}