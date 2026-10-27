path = 'src/lib/scoring.ts'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

old = '''export const calcReputationScore = (bookingScore: number, taScore: number, googleScore: number, totalReviews: number): number => {
  const scores: number[] = [];
  if (bookingScore > 0) scores.push(bookingScore);
  if (taScore > 0) scores.push(taScore);
  if (googleScore > 0) scores.push(googleScore);
  if (scores.length === 0) return 50;
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const volBonus = Math.min(10, Math.round(totalReviews / 50));
  return Math.min(100, Math.round(avg * 9 + volBonus));
};'''

new = '''export const toScale10 = (score: number, alreadyOn10: boolean): number => {
  if (score <= 0) return 0;
  if (alreadyOn10) return Math.min(10, score);
  return score <= 5 ? Math.min(10, score * 2) : Math.min(10, score);
};

export const calcReputationScore = (bookingScore: number, taScore: number, googleScore: number, totalReviews: number, bookingReviews?: number, taReviews?: number, googleReviews?: number): number => {
  const b10 = toScale10(bookingScore, true);
  const t10 = toScale10(taScore, false);
  const g10 = toScale10(googleScore, false);
  const br = Math.max(0, bookingReviews ?? 0);
  const tr = Math.max(0, taReviews ?? 0);
  const gr = Math.max(0, googleReviews ?? 0);
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
  const vol = br + tr + gr > 0 ? br + tr + gr : totalReviews;
  const volBonus = Math.min(10, Math.round(vol / 50));
  return Math.min(100, Math.round(avg * 9 + volBonus));
};'''

if old in c:
    c = c.replace(old, new, 1)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(c)
    print('Done scoring.ts')
else:
    print('ERROR scoring.ts: block not found')