import re

# ============================================================
# 1. scoring.ts — ajouter reviews dans params + appel
# ============================================================
path1 = 'src/lib/scoring.ts'
with open(path1, 'r', encoding='utf-8') as f:
    c1 = f.read()

old_params = '''export function recalcScore(params: {
  city: string; stars: number; adr: number; directPct: number;
  responseRate: number; bookingScore: number; taScore: number;
  googleScore: number; totalReviews: number; occupancyRate: number;
  ca: number;
}): RecalcResult {'''

new_params = '''export function recalcScore(params: {
  city: string; stars: number; adr: number; directPct: number;
  responseRate: number; bookingScore: number; taScore: number;
  googleScore: number; totalReviews: number; occupancyRate: number;
  ca: number; bookingReviews?: number; taReviews?: number; googleReviews?: number;
}): RecalcResult {'''

c1 = c1.replace(old_params, new_params, 1)

old_call = 'const reputation = calcReputationScore(params.bookingScore, params.taScore, params.googleScore, params.totalReviews);'
new_call = 'const reputation = calcReputationScore(params.bookingScore, params.taScore, params.googleScore, params.totalReviews, params.bookingReviews, params.taReviews, params.googleReviews);'
c1 = c1.replace(old_call, new_call, 1)

with open(path1, 'w', encoding='utf-8') as f:
    f.write(c1)
print('Done scoring.ts')

# ============================================================
# 2. pdfGenerator.ts — normalisation locale + texte reputation
# ============================================================
path2 = 'src/lib/pdfGenerator.ts'
with open(path2, 'r', encoding='utf-8') as f:
    c2 = f.read()

old_local = '''const calcReputationScore = (form: FormData): number => {
  const scores: number[] = [];
  if (form.booking_score > 0) scores.push(form.booking_score);
  if (form.tripadvisor_score > 0) scores.push(form.tripadvisor_score);
  if (form.google_score > 0) scores.push(form.google_score);
  if (scores.length === 0) return 50;
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const reviewCount = form.booking_reviews + form.tripadvisor_reviews + form.google_reviews;
  const volumeBonus = Math.min(10, Math.round(reviewCount / 50));
  return Math.min(100, Math.round(avg * 9 + volumeBonus));
};'''

new_local = '''const toScale10 = (score: number, alreadyOn10: boolean): number => {
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
};'''

c2 = c2.replace(old_local, new_local, 1)

# Fix reputation text: replace un-normalized average with normalized
# Pattern: (form.booking_score + form.tripadvisor_score + form.google_score) / 3 or similar
# Also fix the "note moyenne" display
old_avg_pattern = r'\(form\.booking_score\s*\+\s*form\.tripadvisor_score\s*\+\s*form\.google_score\)\s*/\s*3'
c2 = re.sub(old_avg_pattern, 'calcReputationAvg(form)', c2)

with open(path2, 'w', encoding='utf-8') as f:
    f.write(c2)
print('Done pdfGenerator.ts')

# ============================================================
# 3. page.tsx — passer les reviews a recalcScore
# ============================================================
path3 = 'src/app/score/page.tsx'
with open(path3, 'r', encoding='utf-8') as f:
    c3 = f.read()

old_recalc = 'totalReviews: (Number(bookingReviews) || 0) + (Number(taReviews) || 0) + (Number(googleReviews) || 0), occupancyRate: (Number(occupancy) || 60) / 100, ca: Number(revenue) || 0 });'
new_recalc = 'totalReviews: (Number(bookingReviews) || 0) + (Number(taReviews) || 0) + (Number(googleReviews) || 0), occupancyRate: (Number(occupancy) || 60) / 100, ca: Number(revenue) || 0, bookingReviews: Number(bookingReviews) || 0, taReviews: Number(taReviews) || 0, googleReviews: Number(googleReviews) || 0 });'
c3 = c3.replace(old_recalc, new_recalc)

with open(path3, 'w', encoding='utf-8') as f:
    f.write(c3)
print('Done page.tsx')
print('All 3 files fixed')