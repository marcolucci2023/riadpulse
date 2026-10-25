import Header from "@/components/Header";

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-[#0F1A2E] text-white">
      <Header />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-[#D4A843] mb-8">Mentions légales</h1>

        <section className="space-y-6 text-gray-300 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-white mb-2">1. Éditeur du site</h2>
            <p>
              <strong>RiadPulse</strong><br />
              Plateforme d&apos;audit digital pour riads et hôtels indépendants au Maroc.<br />
              Fondateur : Omar Marco<br />
              Ville : Casablanca / El Jadida, Maroc<br />
              Email : contact@riadpulse.ma
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">2. Hébergement</h2>
            <p>
              Le frontend de ce site est hébergé par <strong>Vercel Inc.</strong><br />
              340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis<br />
              Site web : <a href="https://vercel.com" className="text-[#D4A843] underline" target="_blank" rel="noopener noreferrer">vercel.com</a>
            </p>
            <p className="mt-2">
              Le backend est hébergé via <strong>Cloudflare Tunnel</strong> (Cloudflare, Inc.)<br />
              101 Townsend St, San Francisco, CA 94107, États-Unis<br />
              Site web : <a href="https://cloudflare.com" className="text-[#D4A843] underline" target="_blank" rel="noopener noreferrer">cloudflare.com</a>
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">3. Propriété intellectuelle</h2>
            <p>
              L&apos;ensemble du contenu de ce site (textes, graphiques, logo, icônes, images, logiciels)
              est la propriété exclusive de RiadPulse, sauf mention contraire.
              Toute reproduction, distribution ou utilisation non autorisée est strictement interdite.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">4. Limitation de responsabilité</h2>
            <p>
              Les audits fournis par RiadPulse sont basés sur des données publiques et des estimations
              algorithmiques. Ils sont donnés à titre indicatif et ne constituent pas un conseil
              financier ou juridique. RiadPulse ne saurait être tenu responsable des décisions
              prises sur la base de ces audits.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">5. Données personnelles</h2>
            <p>
              Conformément à la loi marocaine n° 09-08 relative à la protection des personnes
              physiques à l&apos;égard du traitement des données à caractère personnel, vous disposez
              d&apos;un droit d&apos;accès, de rectification et de suppression de vos données.
              Pour exercer ce droit, contactez-nous à : <strong>contact@riadpulse.ma</strong>
            </p>
            <p className="mt-2">
              Pour plus de détails, consultez notre{" "}
              <a href="/politique-confidentialite" className="text-[#D4A843] underline">
                Politique de confidentialité
              </a>.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">6. Droit applicable</h2>
            <p>
              Les présentes mentions légales sont soumises au droit marocain.
              En cas de litige, les tribunaux compétents seront ceux du ressort de Casablanca.
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