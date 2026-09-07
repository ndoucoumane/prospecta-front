import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Target,
  Megaphone,
  MessageSquare,
  Kanban,
  BarChart3,
  Bot,
  Building2,
  Phone,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const FeaturesPage: React.FC = () => {
  const featuresList = [
    {
      icon: <Users className="w-5 h-5 text-blue-600" />,
      title: 'Gestion unifiée des prospects',
      description: 'Enregistrez, segmentez et suivez chaque contact commercial avec des filtres géographiques (Dakar, Thiès, etc.), sectoriels et décisionnels.',
    },
    {
      icon: <Target className="w-5 h-5 text-blue-600" />,
      title: 'Scoring commercial prédictif',
      description: 'Chaque prospect reçoit une note objective de 0 à 100 basée sur la correspondance avec votre ICP, son pouvoir de décision et ses données vérifiées.',
    },
    {
      icon: <Building2 className="w-5 h-5 text-blue-600" />,
      title: 'Annuaire d\'entreprises sénégalaises',
      description: 'Cartographiez les entreprises cibles avec leurs décideurs rattachés, leur secteur d\'activité et leurs opportunités potentielles.',
    },
    {
      icon: <Megaphone className="w-5 h-5 text-blue-600" />,
      title: 'Séquences de prospection multicanales',
      description: 'Programmez des relances automatiques en alternant intelligemment Email et WhatsApp pour ne laisser aucun prospect sans suivi.',
    },
    {
      icon: <Phone className="w-5 h-5 text-blue-600" />,
      title: 'Intégration WhatsApp Business',
      description: 'Adressez-vous directement aux décideurs sur le canal numéro 1 en Afrique de l\'Ouest, avec respect des politiques et délivrabilité garantie.',
    },
    {
      icon: <Bot className="w-5 h-5 text-blue-600" />,
      title: 'Assistance commerciale par IA',
      description: 'Générez des accroches personnalisées et des synthèses d\'entreprises claires. L\'humain garde toujours la validation finale avant tout envoi.',
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-blue-600" />,
      title: 'Boîte de réception centralisée',
      description: 'Traitez toutes vos réponses dans un flux unique sans jongler entre votre boîte email et votre téléphone professionnel.',
    },
    {
      icon: <Kanban className="w-5 h-5 text-blue-600" />,
      title: 'Pipeline commercial Kanban',
      description: 'Visualisez les 8 étapes clés de conversion (de Nouveau à Gagné) et suivez les montants engagés en FCFA.',
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-blue-600" />,
      title: 'Indicateurs de performance (KPI)',
      description: 'Analysez vos taux de délivrance, taux de réponse et retour sur investissement commercial par campagne et par commercial.',
    },
  ];

  return (
    <div className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Badge variant="blue" size="md" className="mb-4">
            Plateforme complète
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Toutes les fonctionnalités pour structurer vos ventes B2B
          </h1>
          <p className="text-base text-gray-600 mt-4 leading-relaxed">
            Prospecta élimine les tâches chronophages de la prospection pour concentrer votre équipe sur l'essentiel : dialoguer et négocier avec des décideurs qualifiés.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuresList.map((item) => (
            <div
              key={item.title}
              className="border border-gray-200 rounded-lg p-6 bg-white flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link to="/signup">
            <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Essayer gratuitement Prospecta
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
