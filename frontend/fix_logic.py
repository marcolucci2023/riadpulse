path = 'src/lib/pdfGenerator.ts'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

old = '"Verification de coherence : avec " + form.num_rooms + " chambres, un ADR de " + fmt(form.current_price_mad) + " MAD et une occupation de " + Math.round(form.occupancy_rate * 100) + "%, le CA hebergement theorique serait d\'environ " + fmt(Math.round(form.num_rooms * form.occupancy_rate * 365 * form.current_price_mad)) + " MAD. Le CA declare de " + fmt(ca) + " MAD peut inclure la restauration, les transferts, les extras, ou refleter un ADR effectif different du prix rack.",'

new = '''"Verification de coherence : avec " + form.num_rooms + " chambres, un ADR declare de " + fmt(form.current_price_mad) + " MAD et une occupation de " + Math.round(form.occupancy_rate * 100) + "%, le CA hebergement theorique a plein tarif serait de ~" + fmt(Math.round(form.num_rooms * form.occupancy_rate * 365 * form.current_price_mad)) + " MAD. L\'ecart avec le CA declare (" + fmt(ca) + " MAD) indique generalement que l\'ADR moyen effectif annuel est inferieur au tarif de reference (tarifs basse saison, remises OTA), ou que le taux d\'occupation declare correspond a la haute saison plutot qu\'a la moyenne annuelle.",'''

if old in c:
    c = c.replace(old, new, 1)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(c)
    print('Done - Logic corrected')
else:
    print('ERROR: target string not found')