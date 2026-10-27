import re

path = 'src/app/score/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Wrap result block in IIFE with recalc variable
old1 = '{result && (\n          <div className="mt-14 space-y-6">'
new1 = '{result && (() => {\n            const recalc = recalcScore({ city, stars: Number(stars) || 3, adr: Number(price) || 0, directPct: Number(direct) || 0, responseRate: Number(responseRate) || 0, bookingScore: Number(bookingScore) || 0, taScore: Number(taScore) || 0, googleScore: Number(googleScore) || 0, totalReviews: (Number(bookingReviews) || 0) + (Number(taReviews) || 0) + (Number(googleReviews) || 0), occupancyRate: (Number(occupancy) || 60) / 100, ca: Number(revenue) || 0 });\n            return (\n          <div className="mt-14 space-y-6">'
c = c.replace(old1, new1, 1)

# 2. Replace all inline recalcScore().xxx calls with recalc.xxx
c = re.sub(r'recalcScore\(\{[^}]+\}\)\.(score|grade|central)', r'recalc.\1', c)

# 3. Replace sub-scores section header
old3 = '{Object.entries(result.sub_scores).map(([key, sub]) => {'
new3 = '{[\n                { key: "pricing", label: "Prix & Tarifs", score: recalc.modules.pricing, weight: 25, icon: Icons.tag },\n                { key: "reputation", label: "Reputation", score: recalc.modules.reputation, weight: 25, icon: Icons.star },\n                { key: "revenue", label: "Revenus", score: recalc.modules.revenue, weight: 25, icon: Icons.chart },\n                { key: "distribution", label: "Distribution", score: recalc.modules.distribution, weight: 25, icon: Icons.globe },\n              ].map((m) => {'
c = c.replace(old3, new3, 1)

# 3b. Replace sub-scores map body
old3b = 'const meta = MODULE_META[key] || { label: key, icon: Icons.check };\n                return (\n                  <ScoreBar\n                    key={key}\n                    label={meta.label}\n                    score={sub.score}\n                    grade={sub.grade}\n                    weight={sub.weight}\n                    icon={meta.icon}\n                  />\n                );\n              })}'
new3b = 'return (\n                <ScoreBar\n                  key={m.key}\n                  label={m.label}\n                  score={m.score}\n                  grade={m.score >= 85 ? "A" : m.score >= 70 ? "B" : m.score >= 55 ? "C" : m.score >= 40 ? "D" : "F"}\n                  weight={m.weight}\n                  icon={m.icon}\n                />\n              );\n            })}'
c = c.replace(old3b, new3b, 1)

# 4. Close IIFE
old4 = '          </div>\n        )}\n      </main>'
new4 = '          </div>\n            );\n          })()}\n      </main>'
c = c.replace(old4, new4, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Done - 4 replacements applied')