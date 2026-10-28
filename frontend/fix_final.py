# ============================================================
# CORRECTION 1 : Source plus recente
# ============================================================
path_pdf = 'src/lib/pdfGenerator.ts'
with open(path_pdf, 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    'Observatoire du Tourisme 2023-2024',
    'Observatoire du Tourisme Maroc 2024-2025 et donnees OTA publiques 2025'
)

# ============================================================
# CORRECTION 2 : Methodologie dynamique (niveau de confiance)
# ============================================================
old_conf = '    "Niveau de confiance : Moyen.",'
new_conf = '''    "Niveau de confiance : " + (score >= 75 ? "Eleve" : score >= 55 ? "Moyen" : "Faible") + ". Les donnees declarees n'ont pas ete verifiees de maniere independante. Le niveau de confiance reflete la coherence interne de vos donnees.",'''

c = c.replace(old_conf, new_conf, 1)

# Supprimer la ligne redondante qui suivait
c = c.replace(
    '    "Le score global est calcule comme la moyenne ponderee des 4 modules affiches (Prix, Distribution, Reputation, Revenus). Les donnees declarees n\'ont pas ete verifiees de maniere independante.",',
    '    "Le score global est calcule comme la moyenne ponderee des 4 modules affiches (Prix, Distribution, Reputation, Revenus).",'
)

# ============================================================
# CORRECTION 3 : Plan 30/60/90 dynamique et realiste
# ============================================================
old_plan = '''  const phases = [
    { title: "Jours 1-30 : Fondations", items: ["Auditer la grille tarifaire de " + weakest.label.toLowerCase() + " et identifier les incoherences", "Mettre en place un tableau de bord de suivi hebdomadaire", "Former l'equipe aux bonnes pratiques identifiees dans ce rapport"] },
    { title: "Jours 31-60 : Acceleration", items: ["Deployer les premieres actions correctives sur " + weakest.label.toLowerCase(), "Tester 2 a 3 leviers de croissance a fort impact", "Mesurer les premiers resultats et ajuster la strategie"] },
    { title: "Jours 61-90 : Consolidation", items: ["Evaluer la progression : objectif " + target90 + "/100 sur le score global", "Automatiser les processus qui ont fait leurs preuves", "Preparer le plan trimestriel suivant"] },
  ];'''

new_plan = '''  const planActions = (wk: string): { t1: string[]; t2: string[]; t3: string[] } => {
    if (wk === "pricing") return {
      t1: ["Appliquer 2 corrections tarifaires immediates (haute/basse saison)", "Creer une grille de prix par periode sur votre Channel Manager", "Verifier que vos tarifs site web sont 10-15% inferieurs a Booking"],
      t2: ["Tester une hausse de 10% sur les chambres les plus demandees", "Mettre en place des tarifs last-minute (-15%) pour combler les trous", "Comparer vos prix chaque semaine avec 3 concurrents directs"],
      t3: ["Mesurer l'impact sur l'ADR et l'occupation vs mois precedent", "Ajuster la grille selon les resultats", "Preparer la strategie tarifaire du trimestre suivant"],
    };
    if (wk === "reputation") return {
      t1: ["Repondre a tous les avis en attente (Booking, TripAdvisor, Google)", "Creer 3 templates de reponse (positif, neutre, negatif)", "Mettre en place un rappel automatique post-sejour par WhatsApp"],
      t2: ["Solliciter activement les avis des clients satisfaits au check-out", "Analyser les avis negatifs pour identifier les problemes recurrents", "Corriger les 2 problemes les plus mentionnes dans les avis"],
      t3: ["Mesurer l'evolution de la note moyenne et du volume d'avis", "Ajuster les templates selon les retours", "Preparer la strategie reputation du trimestre suivant"],
    };
    if (wk === "distribution") return {
      t1: ["Analyser votre mix de canaux actuel et les commissions payees", "Negocier le programme Preferred Booking (15% au lieu de 18%)", "Ajouter un bouton de reservation directe sur votre site web"],
      t2: ["Lancer 1 offre exclusive site web (petit-dejeuner offert, surclassement)", "Configurer un email post-sejour avec lien de reservation directe", "Reduire la dependance au canal le plus couteux de 5%"],
      t3: ["Mesurer l'evolution du mix de canaux et des commissions", "Calculer les economies realisees vs trimestre precedent", "Preparer la strategie distribution du trimestre suivant"],
    };
    return {
      t1: ["Identifier les 3 periodes les plus creuses de l'annee", "Creer 2 packages promotionnels pour la basse saison", "Mettre en place un suivi hebdomadaire occupation + ADR"],
      t2: ["Lancer les packages basse saison sur Booking et le site web", "Diversifier les revenus : transferts, experiences, petit-dejeuner", "Optimiser le calendrier de fermeture/ouverture des chambres"],
      t3: ["Mesurer l'impact sur le taux d'occupation annuel", "Comparer le RevPAR vs trimestre precedent", "Preparer la strategie revenus du trimestre suivant"],
    };
  };
  const pa = planActions(weakest.key);
  const phases = [
    { title: "Jours 1-15 : Actions immediates", items: pa.t1 },
    { title: "Jours 16-45 : Acceleration", items: pa.t2 },
    { title: "Jours 46-90 : Mesure et ajustement", items: pa.t3 },
  ];'''

c = c.replace(old_plan, new_plan, 1)

# ============================================================
# CORRECTION 4 : "Audit Complet + Video" -> "Audit Complet + Plan d'Action"
# ============================================================
c = c.replace(
    '{ name: "Audit Complet + Video", price: "1 500 MAD", desc: "Analyse approfondie avec rapport detaille, video de 15 min commentee, plan d\'action 90 jours et calculateur de commissions personnalise.", tag: "RECOMMANDE" }',
    '{ name: "Audit Complet + Plan d\'Action", price: "1 500 MAD", desc: "Analyse approfondie avec rapport detaille 20 pages, plan d\'action 90 jours personnalise, calculateur de commissions exact et 1 appel de restitution de 30 min.", tag: "RECOMMANDE" }'
)

c = c.replace(
    'Recevez votre Audit Complet + Video de 15 min pour 1 500 MAD.',
    'Recevez votre Audit Complet + Plan d\'Action personnalise pour 1 500 MAD.'
)

with open(path_pdf, 'w', encoding='utf-8') as f:
    f.write(c)
print('Done pdfGenerator.ts')

# ============================================================
# CORRECTION 4b : tarifs/page.tsx
# ============================================================
path_tarifs = 'src/app/tarifs/page.tsx'
with open(path_tarifs, 'r', encoding='utf-8') as f:
    ct = f.read()

ct = ct.replace('Audit Complet + Video', 'Audit Complet + Plan d\'Action')
ct = ct.replace('Video 15 min commentee', 'Appel de restitution 30 min')

with open(path_tarifs, 'w', encoding='utf-8') as f:
    f.write(ct)
print('Done tarifs/page.tsx')

# ============================================================
# CORRECTION 4c : CTAAudit.tsx (si contient Video)
# ============================================================
path_cta = 'src/components/CTAAudit.tsx'
try:
    with open(path_cta, 'r', encoding='utf-8') as f:
        cc = f.read()
    if 'Video' in cc or 'video' in cc:
        cc = cc.replace('Video', 'Plan d\'Action').replace('video', 'plan d\'action')
        with open(path_cta, 'w', encoding='utf-8') as f:
            f.write(cc)
        print('Done CTAAudit.tsx')
    else:
        print('Skip CTAAudit.tsx (no Video mention)')
except:
    print('Skip CTAAudit.tsx (file not found)')

print('All 4 corrections applied')