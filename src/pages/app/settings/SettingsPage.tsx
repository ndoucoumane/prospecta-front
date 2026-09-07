import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User as UserIcon,
  Building2,
  Users,
  Phone,
  Bot,
  Bell,
  Shield,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useToast } from '../../../app/providers/ToastProvider';

export const SettingsPage: React.FC = () => {
  const { user, organization } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<
    'profil' | 'organisation' | 'utilisateurs' | 'canaux' | 'ia' | 'notifications' | 'securite'
  >('profil');

  // Form states
  const [firstName, setFirstName] = useState(user?.firstName || 'Mor');
  const [lastName, setLastName] = useState(user?.lastName || 'Keblink');
  const [email] = useState(user?.email || 'mor@prospecta.sn');
  const [role] = useState(user?.role || 'Directeur Commercial');

  // Org form states
  const [orgName, setOrgName] = useState(organization?.name || 'Prospecta Sénégal');
  const [currency] = useState('FCFA');
  const [timezone] = useState('Africa/Dakar');
  const [phonePrefix] = useState('+221');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Profil mis à jour.');
  };

  const handleSaveOrg = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Paramètres de l\'organisation enregistrés.');
  };

  const tabs = [
    { key: 'profil', label: 'Profil', icon: UserIcon },
    { key: 'organisation', label: 'Organisation', icon: Building2 },
    { key: 'utilisateurs', label: 'Utilisateurs', icon: Users },
    { key: 'canaux', label: 'Canaux', icon: Phone },
    { key: 'ia', label: 'IA', icon: Bot },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'securite', label: 'Sécurité', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* 46. Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Configuration de votre compte, de votre organisation et de vos canaux commerciaux.
        </p>
      </div>

      {/* Settings Navigation Tabs: Flat, Bordered */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-blue-600 text-blue-600 font-bold bg-blue-50/50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {/* Section 1: Profil */}
        {activeTab === 'profil' && (
          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
            <h2 className="text-sm font-bold text-gray-900 pb-2 border-b border-gray-100">
              Informations personnelles
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Prénom"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <Input
                label="Nom"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <Input label="Adresse email professionnelle" value={email} disabled />

            <Input label="Rôle au sein de l'organisation" value={role} disabled />

            <div className="pt-2">
              <Button type="submit" size="sm">
                Enregistrer les modifications
              </Button>
            </div>
          </form>
        )}

        {/* Section 2: Organisation (Sénégal / FCFA / Dakar) */}
        {activeTab === 'organisation' && (
          <form onSubmit={handleSaveOrg} className="space-y-4 max-w-xl">
            <h2 className="text-sm font-bold text-gray-900 pb-2 border-b border-gray-100">
              Paramètres de l'organisation
            </h2>

            <Input
              label="Nom de l'organisation"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input label="Devise" value={currency} disabled />
              <Input label="Fuseau horaire" value={timezone} disabled />
              <Input label="Indicatif pays" value={phonePrefix} disabled />
            </div>

            <p className="text-[11px] text-gray-500 italic">
              Les paramètres monétaires et temporels sont verrouillés sur la zone UEMOA (Sénégal) pour garantir la cohérence des rapports financiers.
            </p>

            <div className="pt-2">
              <Button type="submit" size="sm">
                Mettre à jour l'organisation
              </Button>
            </div>
          </form>
        )}

        {/* Section 3: Utilisateurs */}
        {activeTab === 'utilisateurs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900">Membres de l'équipe commerciale</h2>
              <Button size="sm" variant="secondary">
                Inviter un collaborateur
              </Button>
            </div>

            <div className="border border-gray-200 rounded-md divide-y divide-gray-100 text-xs">
              <div className="p-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-900 block">Mor Keblink (Vous)</span>
                  <span className="text-gray-500">mor@prospecta.sn</span>
                </div>
                <Badge variant="blue" size="sm">
                  Directeur Commercial (Admin)
                </Badge>
              </div>

              <div className="p-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-900 block">Amadou Diallo</span>
                  <span className="text-gray-500">amadou@prospecta.sn</span>
                </div>
                <Badge variant="gray" size="sm">
                  Commercial B2B
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Canaux */}
        {activeTab === 'canaux' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-gray-900 pb-2 border-b border-gray-100">
              Canaux de prospection connectés
            </h2>

            <div className="space-y-3">
              {/* WhatsApp Business Link */}
              <Link
                to="/app/settings/channels/whatsapp"
                className="p-4 border border-gray-200 rounded-md flex items-center justify-between hover:bg-gray-50 transition-colors block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-green-50 border border-green-200 text-green-600 flex items-center justify-center">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">WhatsApp Business</h3>
                    <p className="text-[11px] text-gray-500">
                      Connecté (+221 77 845 12 34) — Séquences et boîte de réception
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>

              {/* Email SMTP */}
              <div className="p-4 border border-gray-200 rounded-md flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">Serveur Email (SMTP / IMAP)</h3>
                    <p className="text-[11px] text-gray-500">
                      mail.prospecta.sn — Envoi d'emails professionnels sans spam
                    </p>
                  </div>
                </div>
                <Badge variant="success" size="sm">
                  Actif
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Section 5: IA */}
        {activeTab === 'ia' && (
          <div className="space-y-4 max-w-xl">
            <h2 className="text-sm font-bold text-gray-900 pb-2 border-b border-gray-100">
              Paramètres de l'assistance commerciale par IA
            </h2>

            <div className="space-y-3 text-xs text-gray-700">
              <label className="flex items-start gap-2.5 p-3 rounded border border-gray-200 bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-gray-300 text-blue-600 mt-0.5 cursor-pointer"
                />
                <div>
                  <strong className="text-gray-900 block">Validation humaine obligatoire</strong>
                  <span className="text-gray-500 text-[11px]">
                    Aucun message généré par l'IA ne peut être envoyé automatiquement sans approbation préalable.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded border border-gray-200 bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-gray-300 text-blue-600 mt-0.5 cursor-pointer"
                />
                <div>
                  <strong className="text-gray-900 block">Sensibilité régionale ouest-africaine</strong>
                  <span className="text-gray-500 text-[11px]">
                    Adapter automatiquement le ton des messages aux usages d'affaires courtois et professionnels du Sénégal.
                  </span>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Section 6: Notifications */}
        {activeTab === 'notifications' && (
          <div className="space-y-4 max-w-xl text-xs">
            <h2 className="text-sm font-bold text-gray-900 pb-2 border-b border-gray-100">
              Alertes & Notifications
            </h2>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 border border-gray-200 rounded">
                <span>Recevoir un email lors d'une nouvelle réponse prospect</span>
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
              </label>

              <label className="flex items-center justify-between p-3 border border-gray-200 rounded">
                <span>Alerte WhatsApp lors d'une prise de rendez-vous confirmée</span>
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
              </label>
            </div>
          </div>
        )}

        {/* Section 7: Sécurité */}
        {activeTab === 'securite' && (
          <div className="space-y-4 max-w-xl text-xs">
            <h2 className="text-sm font-bold text-gray-900 pb-2 border-b border-gray-100">
              Sécurité & Authentification Keycloak
            </h2>

            <div className="p-4 bg-gray-50 rounded border border-gray-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">Fournisseur d'identité (SSO)</span>
                <Badge variant="blue" size="sm">Keycloak IAM</Badge>
              </div>
              <p className="text-[11px] text-gray-600">
                Votre session est sécurisée par jeton cryptographique JWT conforme aux normes OIDC.
              </p>
            </div>

            <div className="pt-2">
              <Button size="sm" variant="secondary">
                Modifier le mot de passe sur Keycloak
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
