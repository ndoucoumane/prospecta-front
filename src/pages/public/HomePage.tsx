import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Megaphone,
  MessageSquare,
  Kanban,
  Target,
  BarChart3,
  Bot,
  Building2,
  Check,
  ArrowRight,
  Phone,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { FAQSection } from '../../components/landing/FAQSection';

export const HomePage: React.FC = () => {
  return (
    <div className="bg-white">
      {/* 14 & 15. HERO SECTION: Typographic, clean, white background, no gradient, no 3D */}
      <section className="py-20 md:py-28 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Main Hero Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
            <span className="text-blue-600">Prospectez mieux.</span> <br className="hidden sm:inline" />
            Convertissez davantage.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto font-normal">
            Prospecta centralise vos prospects, vos campagnes, vos conversations et vos opportunités pour permettre à votre équipe commerciale de travailler plus efficacement au Sénégal et dans la région.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Commencer gratuitement
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Découvrir la plateforme
              </Button>
            </Link>
          </div>

          {/* Trust points */}
          <div className="mt-10 pt-8 border-t border-gray-100 flex flex-wrap justify-center items-center gap-6 sm:gap-10 text-xs text-gray-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-green-600" />
              Adapté au marché sénégalais (FCFA & WhatsApp)
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-green-600" />
              Séquences multicanales intelligentes
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-green-600" />
              Contrôle humain systématique sur l'IA
            </span>
          </div>
        </div>
      </section>

      {/* 74. COMMENT ÇA FONCTIONNE (4 étapes simples) */}
      <section className="py-16 md:py-20 border-b border-gray-200 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Comment fonctionne Prospecta
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Une méthodologie commerciale éprouvée pour transformer les cibles en clients récurrents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                num: '01',
                title: 'Définissez votre cible',
                desc: 'Identifiez votre profil client idéal (secteurs, taille, décideurs clés à Dakar et en province).',
              },
              {
                num: '02',
                title: 'Trouvez et qualifiez vos prospects',
                desc: 'Importez vos bases ou ajoutez vos contacts avec un score de pertinence commerciale objectif.',
              },
              {
                num: '03',
                title: 'Lancez vos campagnes',
                desc: 'Automatisez vos séquences personnalisées en alternant Email professionnel et WhatsApp.',
              },
              {
                num: '04',
                title: 'Transformez les réponses en opportunités',
                desc: 'Répondez instantanément avec assistance IA et suivez l\'avancement dans le pipeline de vente.',
              },
            ].map((step) => (
              <div
                key={step.num}
                className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-blue-600 tracking-wider font-mono">
                    {step.num}
                  </span>
                  <h3 className="text-base font-semibold text-gray-900 mt-3 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 16. SECTION PRODUIT (4 capacités en grille 2 colonnes desktop, 1 colonne mobile) */}
      <section id="solutions" className="py-16 md:py-24 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Toute votre prospection, au même endroit.
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Quatre piliers interconnectés pour structurer le développement commercial de votre entreprise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Prospects */}
            <div className="border border-gray-200 rounded-lg p-6 bg-white">
              <div className="w-9 h-9 rounded-md bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Prospects & Entreprises</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                Centralisez vos contacts professionnels sénégalais. Visualisez les décideurs, leur historique d'interactions et leur score commercial calculé sur des critères concrets.
              </p>
              <ul className="space-y-2 text-xs text-gray-700">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                  Scoring commercial de 0 à 100 fondé sur la valeur ICP
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                  Import CSV et validation des données de contact
                </li>
              </ul>
            </div>

            {/* Campagnes */}
            <div className="border border-gray-200 rounded-lg p-6 bg-white">
              <div className="w-9 h-9 rounded-md bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-4">
                <Megaphone className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Campagnes & Séquences</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                Construisez des campagnes multicanales sans friction. Alternez intelligemment entre emails professionnels et messages WhatsApp pour maximiser votre taux de réponse.
              </p>
              <ul className="space-y-2 text-xs text-gray-700">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                  Séquences automatisées avec délais configurables
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                  Variables dynamiques (prénom, entreprise, fonction)
                </li>
              </ul>
            </div>

            {/* Conversations */}
            <div className="border border-gray-200 rounded-lg p-6 bg-white">
              <div className="w-9 h-9 rounded-md bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Boîte de Réception Unifiée</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                Ne perdez aucun fil. Traitez toutes vos réponses WhatsApp et Email dans une interface unique, avec assistance rédactionnelle pour répondre en quelques secondes.
              </p>
              <ul className="space-y-2 text-xs text-gray-700">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                  Badges de canaux explicites (WhatsApp, Email, SMS)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                  Suggestions de réponses prêtes à éditer
                </li>
              </ul>
            </div>

            {/* Pipeline */}
            <div className="border border-gray-200 rounded-lg p-6 bg-white">
              <div className="w-9 h-9 rounded-md bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-4">
                <Kanban className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Pipeline & Opportunités</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                Suivez la progression de vos deals d'un simple coup d'œil. Vue Kanban à 8 étapes commerciales, montants en FCFA et prévisions de signature précises.
              </p>
              <ul className="space-y-2 text-xs text-gray-700">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                  De la première prise de contact à la clôture gagnée
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                  Montants et devises adaptés (FCFA par défaut)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 75. FEATURES GRID */}
      <section className="py-16 md:py-20 border-b border-gray-200 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Fonctionnalités conçues pour les ventes B2B
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Des outils concrets et sobres pour simplifier le travail quotidien des équipes commerciales.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: <Target className="w-4 h-4 text-blue-600" />,
                title: 'Prospection ciblée',
                desc: 'Trouvez et filtrez les prospects selon le secteur, la ville (Dakar, Thiès, Saly...) et la fonction.',
              },
              {
                icon: <Users className="w-4 h-4 text-blue-600" />,
                title: 'Lead scoring',
                desc: 'Classez instantanément vos leads selon leur niveau d\'adéquation avec votre offre commerciale.',
              },
              {
                icon: <Bot className="w-4 h-4 text-blue-600" />,
                title: 'Assistance IA sobre',
                desc: 'Générez des messages et des synthèses d\'entreprises toujours éditables par un humain.',
              },
              {
                icon: <Megaphone className="w-4 h-4 text-blue-600" />,
                title: 'Campagnes automatisées',
                desc: 'Programmez des séquences de contact multicanales et suivez leurs statistiques de délivrance.',
              },
              {
                icon: <Phone className="w-4 h-4 text-blue-600" />,
                title: 'WhatsApp Business',
                desc: 'Connectez votre canal WhatsApp d\'entreprise pour toucher vos décideurs là où ils répondent.',
              },
              {
                icon: <Building2 className="w-4 h-4 text-blue-600" />,
                title: 'Fiches entreprises',
                desc: 'Accédez à l\'annuaire complet des organisations cibles et à l\'historique des contacts associés.',
              },
              {
                icon: <MessageSquare className="w-4 h-4 text-blue-600" />,
                title: 'Conversations unifiées',
                desc: 'Centralisez l\'ensemble des échanges prospects pour éviter tout doublon dans l\'équipe.',
              },
              {
                icon: <Kanban className="w-4 h-4 text-blue-600" />,
                title: 'Pipeline Kanban',
                desc: 'Pilotez l\'entonnoir commercial étape par étape avec gestion des montants prévisionnels.',
              },
              {
                icon: <BarChart3 className="w-4 h-4 text-blue-600" />,
                title: 'Analyses & KPI',
                desc: 'Mesurez le taux de conversion, le volume de rendez-vous et le retour sur investissement.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white border border-gray-200 rounded-md p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded bg-blue-50 border border-blue-200 flex items-center justify-center mb-3">
                    {f.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1.5">{f.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOIRE AUX QUESTIONS (FAQ) */}
      <FAQSection />

      {/* CTA SECTION */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Prêt à accélérer la prospection commerciale de votre entreprise ?
          </h2>
          <p className="text-sm text-gray-600 mt-3 max-w-xl mx-auto">
            Rejoignez les équipes commerciales au Sénégal qui utilisent Prospecta pour structurer leur prospection et générer des opportunités chaque semaine.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/signup">
              <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Créer un compte entreprise
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">
                Consulter l'espace démo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
