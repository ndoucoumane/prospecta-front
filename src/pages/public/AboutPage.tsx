import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Check } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-white py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge variant="blue" size="md" className="mb-4">
            Notre Mission
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Bâtir le standard technologique de la prospection commerciale en Afrique
          </h1>
          <p className="text-base text-gray-600 mt-4 leading-relaxed">
            Prospecta est né d'un constat simple à Dakar : la prospection commerciale B2B en Afrique est souvent manuelle, fragmentée et peu outillée.
          </p>
        </div>

        <div className="space-y-8 text-sm text-gray-700 leading-relaxed border-t border-gray-100 pt-8">
          <p>
            Alors que le marché africain connaît une croissance rapide des entreprises et des services B2B, les commerciaux passent encore l'essentiel de leur temps à chercher des coordonnées, rédiger des emails un à un et relancer manuellement sur WhatsApp sans traçabilité.
          </p>

          <p>
            Prospecta rassemble au sein d'une plateforme sobre et robuste les outils essentiels pour structurer le cycle de vente : de l'identification du décideur jusqu'à la signature de l'opportunité.
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Nos engagements fondamentaux
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900">Ancrage régional & pertinence :</strong> Conçu pour les réalités des marchés ouest-africains (WhatsApp officiel, devises locales FCFA, réseau d'entreprises locales).
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900">Sobriété & fiabilité :</strong> Une interface sans artifice, rapide et centrée exclusivement sur le résultat commercial.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900">Intelligence commerciale assistée :</strong> L'IA soutient le travail du commercial sans jamais le remplacer.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link to="/contact">
            <Button variant="secondary" size="md">
              Contacter notre équipe à Dakar
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
