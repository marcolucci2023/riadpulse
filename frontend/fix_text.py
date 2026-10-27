path = 'src/lib/pdfGenerator.ts'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Bug 1: reputation avg — remplacer le calcul brut par calcReputationAvg
old_avg = '''    const scores: number[] = [];
    if (form.booking_score > 0) scores.push(form.booking_score);
    if (form.tripadvisor_score > 0) scores.push(form.tripadvisor_score);
    if (form.google_score > 0) scores.push(form.google_score);
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const tot = form.booking_reviews + form.tripadvisor_reviews + form.google_reviews;
    const platforms = scores.length + " plateforme(s) (Booking, TripAdvisor, Google)";'''

new_avg = '''    const avg = calcReputationAvg(form);
    const tot = form.booking_reviews + form.tripadvisor_reviews + form.google_reviews;
    const platforms = "3 plateforme(s) (Booking, TripAdvisor, Google)";'''

c = c.replace(old_avg, new_avg, 1)

# Bug 2: pricing text — conditionnel aligne vs ecarte
old_price = '    return "Votre ADR de " + fmt(form.current_price_mad) + " MAD s\'ecarte de la mediane locale de " + fmt(bench.adr) + " MAD. Une revision de la grille tarifaire saisonniere est recommandee." + note;'

new_price = '''    const adrDiff = Math.abs(form.current_price_mad - bench.adr);
    if (adrDiff < 50) return "Votre ADR de " + fmt(form.current_price_mad) + " MAD est aligne sur la mediane locale de " + fmt(bench.adr) + " MAD. La grille tarifaire saisonniere semble adaptee." + note;
    if (form.current_price_mad > bench.adr) return "Votre ADR de " + fmt(form.current_price_mad) + " MAD est " + fmt(adrDiff) + " MAD au-dessus de la mediane locale de " + fmt(bench.adr) + " MAD. Verifiez que cet ecart est justifie par la qualite de service." + note;
    return "Votre ADR de " + fmt(form.current_price_mad) + " MAD est " + fmt(adrDiff) + " MAD en dessous de la mediane locale de " + fmt(bench.adr) + " MAD. Une revision de la grille tarifaire saisonniere est recommandee." + note;'''

c = c.replace(old_price, new_price, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Done - 2 text bugs fixed')