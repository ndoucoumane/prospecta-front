import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Phone, Check } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useToast } from '../../../app/providers/ToastProvider';
import { authApi } from '../../../api';

export const WhatsAppSettingsPage: React.FC = () => {
  const { organization, reloadOrganization } = useAuth();
  const { showToast } = useToast();

  const isConnected = organization?.whatsappConnected ?? true;

  const handleToggleConnection = async () => {
    try {
      await authApi.updateOrganization({
        whatsappConnected: !isConnected,
      });
      await reloadOrganization();
      showToast(
        isConnected
          ? 'Compte WhatsApp Business déconnecté.'
          : 'Compte WhatsApp Business reconnecté.'
      );
    } catch {
      showToast('Erreur lors de la modification de statut.', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back link */}
      <div>
        <Link
          to="/app/settings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour aux paramètres</span>
        </Link>
      </div>

      {/* 47. WhatsApp Business Settings Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-green-50 border border-green-200 flex items-center justify-center text-green-600 flex-shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">WhatsApp Business</h1>
              <p className="text-xs text-gray-500">
                Canal officiel de messagerie pour vos campagnes et conversations.
              </p>
            </div>
          </div>

          <Badge variant={isConnected ? 'success' : 'gray'} size="md" dot>
            {isConnected ? 'Connecté' : 'Déconnecté'}
          </Badge>
        </div>

        {/* Details: Statut, Numéro, Compte */}
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-md border border-gray-100">
            <div>
              <span className="text-gray-500 block text-[11px]">Statut :</span>
              <span className="font-bold text-gray-900">
                {isConnected ? 'Connecté et actif' : 'En pause / Déconnecté'}
              </span>
            </div>

            <div>
              <span className="text-gray-500 block text-[11px]">Numéro de téléphone :</span>
              <span className="font-bold font-mono text-gray-900">
                {organization?.whatsappPhoneNumber || '+221 77 845 12 34'}
              </span>
            </div>

            <div>
              <span className="text-gray-500 block text-[11px]">Compte WhatsApp Business :</span>
              <span className="font-bold text-gray-900">
                {organization?.whatsappAccountName || 'Prospecta Commercial Business'}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-gray-600 leading-relaxed pt-2">
            <p className="font-semibold text-gray-900">À propos de cette intégration :</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-green-600" />
                <span>Respect des modèles de messages autorisés par Meta.</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-green-600" />
                <span>Synchronisation automatique des réponses dans la boîte de réception unifiée.</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-green-600" />
                <span>Gestion transparente de l'opt-out prospect (conformité locale CDP).</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button: [Déconnecter] */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Dernière vérification API : Aujourd'hui à 12:45 GMT
          </span>
          <Button
            size="sm"
            variant={isConnected ? 'secondary' : 'primary'}
            onClick={handleToggleConnection}
          >
            {isConnected ? 'Déconnecter le numéro' : 'Reconnecter le numéro'}
          </Button>
        </div>
      </div>
    </div>
  );
};
