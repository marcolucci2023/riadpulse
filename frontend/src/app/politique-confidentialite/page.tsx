import Header from "@/components/Header";

export default function PolitiqueConfidentialitePage() {
  return (
    <main className="min-h-screen bg-[#0F1A2E] text-white">
      <Header />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-[#D4A843] mb-8">Politique de confidentialité</h1>

        <section className="space-y-6 text-gray-300 text-sm leading-relaxed">
          <p>
            RiadPulse s&apos;engage à protéger la confidentialité de vos données personnelles
            conformément à la loi marocaine n° 09-08 relative à la protection des personnes
            physiques à l&apos;égard du traitement des données à caractère personnel.
          </p>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">1. Données collectées</h2>
            <p>Nous collectons uniquement les données suivantes :</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>Adresse email</strong> : lors de la création de votre compte</li>
              <li><strong>Mot de passe chiffré</strong> : stocké de manière sécurisée (hash bcrypt)</li>
              <li><strong>Données d&apos;audit</strong> : URL de votre site, prix, notes de réputation, répartition OTA</li>
            </ul>
            <p className="mt-2">
              Nous ne collectons <strong>aucune</strong> donnée bancaire, aucun numéro de carte de crédit,
              aucune donnée de géolocalisation.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">2. Finalité du traitement</h2>
            <p>Vos données sont utilisées uniquement pour :</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Vous authentifier sur la plateforme</li>
              <li>Générer les audits digitaux de votre établissement</li>
              <li>Conserver votre historique d&apos;audits</li>
              <li>Vous contacter si vous en faites la demande</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">3. Partage des données</h2>
            <p>
              Nous ne vendons, n&apos;échangeons et ne transférons <strong>jamais</strong> vos données
              personnelles à des tiers. Vos données d&apos;audit ne sont accessibles qu&apos;à vous-même
              via votre compte sécurisé.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">4. Sécurité</h2>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Mots de passe chiffrés avec bcrypt</li>
              <li>Authentification par token JWT</li>
              <li>Connexion HTTPS chiffrée</li>
              <li>Base de données PostgreSQL hébergée sur Neon (infrastructures sécurisées)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">5. Durée de conservation</h2>
            <p>
              Vos données sont conservées tant que votre compte est actif.
              Vous pouvez demander la suppression de votre compte et de toutes vos données
              à tout moment en nous contactant à <strong>contact@riadpulse.ma</strong>.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">6. Vos droits</h2>
            <p>Conformément à la loi 09-08, vous disposez des droits suivants :</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>Droit d&apos;accès</strong> : consulter vos données personnelles</li>
              <li><strong>Droit de rectification</strong> : corriger vos données inexactes</li>
              <li><strong>Droit de suppression</strong> : effacer vos données et votre compte</li>
              <li><strong>Droit d&apos;opposition</strong> : vous opposer au traitement de vos données</li>
            </ul>
            <p className="mt-2">
              Pour exercer ces droits, écrivez-nous à : <strong>contact@riadpulse.ma</strong>
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">7. Cookies</h2>
            <p>
              RiadPulse n&apos;utilise <strong>aucun cookie de tracking</strong> ni aucun outil
              d&apos;analyse tiers (pas de Google Analytics, pas de Facebook Pixel).
              Seuls les tokens d&apos;authentification sont stockés dans le localStorage de votre navigateur.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">8. Contact CNDP</h2>
            <p>
              Si vous estimez que vos droits ne sont pas respectés, vous pouvez déposer
              une réclamation auprès de la <strong>CNDP</strong> (Commission Nationale de contrôle
              de la protection des Données à caractère Personnel) :<br />
              Site web : <a href="https://www.cndp.ma" className="text-[#D4A843] underline" target="_blank" rel="noopener noreferrer">www.cndp.ma</a>
            </p>
          </div>

          <p className="text-gray-500 text-xs mt-8">
            Dernière mise à jour : octobre 2026
          </p>
        </section>
      </div>
    </main>
  );
}