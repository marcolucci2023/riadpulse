path = 'src/lib/pdfGenerator.ts'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

old = '    "Les projections financieres (pages 7-8) sont des estimations fondees sur des hypotheses de recuperation partielle. Elles ne constituent pas une garantie de resultat.",'

new = '''    "Les projections financieres (pages 7-8) sont des estimations fondees sur des hypotheses de recuperation partielle. Elles ne constituent pas une garantie de resultat.",
    "",
    "Methode de calcul du score : le modele utilise une approximation lineaire ou un score de 100/100 correspond a une performance digitale optimale. Chaque point en dessous de 100 represente un pourcentage theorique de CA non optimise. Cette methode est une simplification ; les resultats reels dependent de nombreux facteurs operationnels.",
    "",
    "Normalisation des avis : les notes de chaque plateforme (Booking /10, TripAdvisor /5, Google /5) sont ramenees sur une echelle commune de 10 pour le calcul de la moyenne.",
    "",
    "Verification de coherence : avec " + form.num_rooms + " chambres, un ADR de " + fmt(form.current_price_mad) + " MAD et une occupation de " + Math.round(form.occupancy_rate * 100) + "%, le CA hebergement theorique serait d'environ " + fmt(Math.round(form.num_rooms * form.occupancy_rate * 365 * form.current_price_mad)) + " MAD. Le CA declare de " + fmt(ca) + " MAD peut inclure la restauration, les transferts, les extras, ou refleter un ADR effectif different du prix rack.",
    "",
    "Commissions : l'economie affichee est calculee sur les commissions brutes OTA. Les couts de marketing, d'acquisition et de paiement lies au canal direct ne sont pas deduits du gain net.",'''

if old in c:
    c = c.replace(old, new, 1)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(c)
    print('Done - 4 credibility improvements applied')
else:
    print('ERROR: target string not found')