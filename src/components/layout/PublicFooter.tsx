import React from 'react';
import { Link } from 'react-router-dom';
import { ProspectaLogo } from '../common/ProspectaLogo';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <ProspectaLogo size="md" />
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
              Plateforme B2B de prospection commerciale, qualification intelligente et automatisation multicanale pour les entreprises en Afrique.
            </p>
            <p className="text-xs text-gray-400">
              Dakar, Sénégal
            </p>
          </div>

          {/* Produit */}
          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Produit
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link to="/features" className="hover:text-blue-600 transition-colors">
                  Fonctionnalités
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-blue-600 transition-colors">
                  Tarifs
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-blue-600 transition-colors">
                  Accès Démo
                </Link>
              </li>
            </ul>
          </div>

          {/* Entreprise */}
          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Entreprise
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link to="/about" className="hover:text-blue-600 transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-blue-600 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Légal
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <span className="text-gray-500 cursor-default">Confidentialité</span>
              </li>
              <li>
                <span className="text-gray-500 cursor-default">Conditions d'utilisation</span>
              </li>
              <li>
                <span className="text-gray-500 cursor-default">Conformité RGPD & CDP Sénégal</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Prospecta. Tous droits réservés.</p>
          <p className="mt-2 sm:mt-0">Fait avec rigueur à Dakar — Qualité B2B Internationale</p>
        </div>
      </div>
    </footer>
  );
};
