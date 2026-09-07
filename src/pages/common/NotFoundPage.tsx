import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="border border-gray-200 rounded-lg p-10 max-w-md w-full bg-white">
        <span className="text-4xl font-bold text-blue-600 font-mono">404</span>
        <h1 className="text-lg font-bold text-gray-900 mt-3">Cette page n'existe pas.</h1>
        <p className="text-xs text-gray-500 mt-2 mb-6">
          L'adresse demandée est introuvable ou a été déplacée.
        </p>
        <Link to="/app">
          <Button size="md" className="w-full">
            Retour au tableau de bord
          </Button>
        </Link>
      </div>
    </div>
  );
};
