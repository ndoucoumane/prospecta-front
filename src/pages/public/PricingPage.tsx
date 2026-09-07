import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const PricingPage: React.FC = () => {
  const plans = [
    {
      name: 'Gratuit',
      badge: 'Découverte',
      price: '0 FCFA',
      period: 'pour toujours',
      description: 'Pour tester les fonctionnalités de base et qualifier vos premiers prospects.',
      features: [
        'Jusqu\'à 50 prospects enregistrés',
        '1 campagne email active',
        'Scoring de base des prospects',
        'Boîte de réception manuelle',
        'Support communautaire',
      ],
      cta: 'Commencer gratuitement',
      variant: 'secondary' as const,
      popular: false,
    },
    {
      name: 'Starter',
      badge: 'Indépendants & PME',
      price: '50 000 FCFA',
      period: 'par mois',
      description: 'Pour les commerciaux indépendants et petites structures souhaitant structurer leur prospection.',
      features: [
        'Jusqu\'à 500 prospects actifs',
        '3 campagnes multicanales actives',
        'Séquences Email & WhatsApp',
        'Assistance IA de rédaction de messages',
        'Pipeline Kanban commercial',
        'Support prioritaire par email',
      ],
      cta: 'Choisir l\'offre Starter',
      variant: 'secondary' as const,
      popular: false,
    },
    {
      name: 'Business',
      badge: 'Recommandé',
      price: '150 000 FCFA',
      period: 'par mois',
      description: 'Pour les équipes commerciales en phase d\'accélération exigeant automatisation et performance.',
      features: [
        'Jusqu\'à 2 500 prospects actifs',
        'Campagnes illimitées',
        'Connexion WhatsApp Business officielle',
        'Scoring IA avancé & analyse d\'entreprises',
        'Boîte de réception unifiée & réponses assistées',
        'Multi-utilisateurs (jusqu\'à 5 commerciaux)',
        'Tableau de bord et analyses de conversion',
      ],
      cta: 'Démarrer avec Business',
      variant: 'primary' as const,
      popular: true,
    },
    {
      name: 'Entreprise',
      badge: 'Sur-mesure',
      price: 'Sur devis',
      period: 'annuel',
      description: 'Pour les grandes organisations, banques, assurances et groupes logistiques.',
      features: [
        'Nombre de prospects illimité',
        'Comptes commerciaux illimités',
        'Intégration API & CRM sur-mesure',
        'Gestion des droits & sécurité avancée',
        'Accompagnement et formation de l\'équipe à Dakar',
        'SLA et support dédié 24/7',
      ],
      cta: 'Demander un devis',
      variant: 'secondary' as const,
      popular: false,
    },
  ];

  return (
    <div className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="blue" size="md" className="mb-4">
            Tarifs transparents
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Des tarifs adaptés aux entreprises au Sénégal
          </h1>
          <p className="text-base text-gray-600 mt-4 leading-relaxed">
            Investissez dans un outil qui rentabilise votre investissement dès les premières opportunités commerciales signées. Facturation en FCFA.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg p-6 bg-white border flex flex-col justify-between ${
                plan.popular
                  ? 'border-blue-600 ring-1 ring-blue-600'
                  : 'border-gray-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                  <Badge variant={plan.popular ? 'blue' : 'gray'} size="sm">
                    {plan.badge}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mb-6 min-h-[36px]">
                  {plan.description}
                </p>

                <div className="mb-6 pb-6 border-b border-gray-100">
                  <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-xs text-gray-500 ml-1.5">{plan.period}</span>
                </div>

                <div className="space-y-3 mb-8">
                  <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Inclus :
                  </p>
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2 text-xs text-gray-600">
                      <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link to="/signup" className="w-full">
                <Button
                  variant={plan.variant}
                  size="md"
                  className="w-full"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ note */}
        <div className="mt-16 text-center text-xs text-gray-500 max-w-xl mx-auto border-t border-gray-100 pt-8">
          Besoin d'un moyen de paiement local (Wave, Orange Money, virement bancaire) ? Notre équipe commerciale à Dakar vous accompagne directement.
        </div>
      </div>
    </div>
  );
};
