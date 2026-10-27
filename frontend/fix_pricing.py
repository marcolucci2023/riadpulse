path = 'src/lib/pdfGenerator.ts'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

old = '''  if (key === "pricing") {
    const note = " Le score Prix ne mesure pas uniquement le niveau de l'ADR. Il evalue principalement l'adaptation des tarifs a la saison, a la demande, aux evenements et au delai de reservation.";
    if (score >= 80) return "Votre ADR de " + fmt(form.current_price_mad) + " MAD est bien positionne par rapport a la mediane locale de " + fmt(bench.adr) + " MAD." + note;
    if (score >= 60) return "Votre ADR de " + fmt(form.current_price_mad) + " MAD est proche de la mediane locale de " + fmt(bench.adr) + " MAD, mais la strategie tarifaire pourrait etre affinee selon la saisonnalite." + note;
    const adrDiff = Math.abs(form.current_price_mad - bench.adr);
    if (adrDiff < 50) return "Votre ADR de " + fmt(form.current_price_mad) + " MAD est aligne sur la mediane locale de " + fmt(bench.adr) + " MAD. La grille tarifaire saisonniere semble adaptee." + note;
    if (form.current_price_mad > bench.adr) return "Votre ADR de " + fmt(form.current_price_mad) + " MAD est " + fmt(adrDiff) + " MAD au-dessus de la mediane locale de " + fmt(bench.adr) + " MAD. Verifiez que cet ecart est justifie par la qualite de service." + note;
    return "Votre ADR de " + fmt(form.current_price_mad) + " MAD est " + fmt(adrDiff) + " MAD en dessous de la mediane locale de " + fmt(bench.adr) + " MAD. Une revision de la grille tarifaire saisonniere est recommandee." + note;'''

new = '''  if (key === "pricing") {
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
    return "Votre ADR de " + fmt(form.current_price_mad) + " MAD est " + fmt(adrDiff) + " MAD en dessous de la mediane locale. Le score de " + score + "/100 confirme une sous-valorisation : vous laissez de la marge sur la table." + note;'''

if old in c:
    c = c.replace(old, new, 1)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(c)
    print('Done - pricing text is now fully dynamic')
else:
    print('ERROR: target not found')