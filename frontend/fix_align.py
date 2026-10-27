path = 'src/app/score/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

old = "const recalc = recalcScore({ city, stars: Number(stars) || 3, adr: Number(price) || 0, directPct: Number(direct) || 0, responseRate: Number(responseRate) || 0, bookingScore: Number(bookingScore) || 0, taScore: Number(taScore) || 0, googleScore: Number(googleScore) || 0, totalReviews: (Number(bookingReviews) || 0) + (Number(taReviews) || 0) + (Number(googleReviews) || 0), occupancyRate: (Number(occupancy) || 60) / 100, ca: Number(revenue) || 0 });"

new = """const recalc = recalcScore({ city, stars: Number(stars) || 3, adr: Number(price) || 0, directPct: Number(direct) || 0, responseRate: Number(responseRate) || 0, bookingScore: Number(bookingScore) || 0, taScore: Number(taScore) || 0, googleScore: Number(googleScore) || 0, totalReviews: (Number(bookingReviews) || 0) + (Number(taReviews) || 0) + (Number(googleReviews) || 0), occupancyRate: (Number(occupancy) || 60) / 100, ca: Number(revenue) || 0 });
            // Aligner avec le PDF : utiliser scores backend pour pricing/distribution/revenue
            const bMods = result.modules || {};
            Object.entries(bMods).forEach(([k, v]: [string, any]) => {
              const kl = k.toLowerCase();
              if (kl.includes('pric') || kl.includes('tarif') || kl.includes('adr')) recalc.modules.pricing = v.score;
              if (kl.includes('distrib') || kl.includes('channel') || kl.includes('canal')) recalc.modules.distribution = v.score;
              if (kl.includes('revenue') || kl.includes('rev') || kl.includes('occup') || kl.includes('income')) recalc.modules.revenue = v.score;
            });
            recalc.score = Math.round((recalc.modules.pricing + recalc.modules.distribution + recalc.modules.reputation + recalc.modules.revenue) / 4 * 10) / 10;
            recalc.perteTheo = Math.round((Number(revenue) || 0) * (1 - recalc.score / 100));
            recalc.central = Math.round(recalc.perteTheo * 0.8);"""

if old in c:
    c = c.replace(old, new, 1)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(c)
    print('Done - alignment fix applied')
else:
    print('ERROR: target string not found')