import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  User as UserIcon,
  Building2,
  Users,
  Phone,
  Bot,
  Bell,
  Shield,
  CreditCard,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { LoadingState } from '../../../components/ui/LoadingState';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useToast } from '../../../app/providers/ToastProvider';
import { billingApi, organizationsApi } from '../../../api';
import { PermissionGate } from '../../../security';
import type { OrganizationPlan } from '../../../types/api';

export const SettingsPage: React.FC = () => {
  const { user, organization, role, reloadOrganization } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<
    'profil' | 'organisation' | 'facturation' | 'utilisateurs' | 'canaux' | 'ia' | 'notifications' | 'securite'
  >('profil');

  // Form states
  const [firstName, setFirstName] = useState(user?.firstName || 'Mor');
  const [lastName, setLastName] = useState(user?.lastName || 'Keblink');
  const [email] = useState(user?.email || 'mor@prospecta.sn');

  // Org form states
  const [orgName, setOrgName] = useState(organization?.name || 'Prospecta Sénégal');
  const [currency] = useState('FCFA');
  const [timezone] = useState('Africa/Dakar');
  const [phonePrefix] = useState('+221');

  // Queries for billing (lazy loaded when on facturation tab)
  const { data: subscription, isLoading: isSubLoading } = useQuery({
    queryKey: ['billingSubscription'],
    queryFn: () => billingApi.getSubscription(),
    enabled: activeTab === 'facturation',
  });

  const { data: plans } = useQuery({
    queryKey: ['billingPlans'],
    queryFn: () => billingApi.getPlans(),
    enabled: activeTab === 'facturation',
  });

  const updateOrgMutation = useMutation({
    mutationFn: async () => {
      if (!organization?.id) throw new Error('Identifiant organisation manquant');
      return organizationsApi.updateOrganization(organization.id, {
        name: orgName,
      });
    },
    onSuccess: async () => {
      await reloadOrganization();
      showToast("Paramètres de l'organisation enregistrés avec succès.", 'success');
    },
    onError: (err: unknown) => {
      showToast(err instanceof Error ? err.message : "Erreur de mise à jour", 'error');
    },
  });

  const portalMutation = useMutation({
    mutationFn: () => billingApi.redirectToPortal(),
    onError: (err: unknown) => {
      showToast(err instanceof Error ? err.message : "Impossible d'ouvrir le portail Stripe", 'error');
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: (plan: OrganizationPlan) => billingApi.redirectToCheckout(plan),
    onError: (err: unknown) => {
      showToast(err instanceof Error ? err.message : "Impossible d'initier le paiement Stripe", 'error');
    },
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Profil mis à jour.', 'success');
  };

  const handleSaveOrg = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrgMutation.mutate();
  };

  const tabs = [
    { key: 'profil', label: 'Profil', icon: UserIcon },
    { key: 'organisation', label: 'Organisation', icon: Building2 },
    { key: 'facturation', label: 'Facturation & Forfaits', icon: CreditCard },
    { key: 'utilisateurs', label: 'Utilisateurs', icon: Users },
    { key: 'canaux', label: 'Canaux', icon: Phone },
    { key: 'ia', label: 'IA', icon: Bot },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'securite', label: 'Sécurité', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Configuration de votre compte, de votre organisation, de la facturation et des accès sécurisés.
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
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
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
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        {/* Section 1: Profil */}
        {activeTab === 'profil' && (
          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
            <h2 className="text-sm font-bold text-gray-900 pb-2 border-b border-gray-100">
              Informations personnelles & Rôle
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

            <Input label="Adresse email" value={email} disabled />

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Rôle de sécurité applicatif (RBAC)
              </label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md flex items-center justify-between">
                <div>
                  <span className="font-semibold text-gray-900 text-xs block">{role}</span>
                  <span className="text-[11px] text-gray-500">
                    Déterminé par votre rattachement à l&apos;organisation et votre profil Keycloak IAM.
                  </span>
                </div>
                <Badge variant={role === 'ORG_ADMIN' || role === 'SUPER_ADMIN' ? 'blue' : 'gray'} size="sm">
                  {role}
                </Badge>
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" size="sm">
                Enregistrer les modifications
              </Button>
            </div>
          </form>
        )}

        {/* Section 2: Organisation */}
        {activeTab === 'organisation' && (
          <form onSubmit={handleSaveOrg} className="space-y-4 max-w-xl">
            <h2 className="text-sm font-bold text-gray-900 pb-2 border-b border-gray-100">
              Paramètres de l&apos;organisation
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
              Les paramètres monétaires et temporels sont verrouillés sur la zone UEMOA (Sénégal) pour garantir la cohérence des calculs et du scoring des leads.
            </p>

            <div className="pt-2">
              <PermissionGate
                permission="org:update"
                mode="disable"
                tooltip="Modification réservée aux administrateurs (ORG_ADMIN, SUPER_ADMIN)"
              >
                <Button type="submit" size="sm" isLoading={updateOrgMutation.isPending}>
                  Mettre à jour l&apos;organisation
                </Button>
              </PermissionGate>
            </div>
          </form>
        )}

        {/* Section 3: Facturation & Forfaits Stripe (Section 14) */}
        {activeTab === 'facturation' && (
          <div className="space-y-6 max-w-3xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  Abonnement actif & Gestion de la facturation
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tarification en Francs CFA (XOF) adaptée aux entreprises d&apos;Afrique de l&apos;Ouest avec intégration Stripe sécurisée.
                </p>
              </div>

              <PermissionGate
                permission="billing:manage"
                mode="disable"
                tooltip="Seuls les administrateurs peuvent accéder au portail Stripe"
              >
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => portalMutation.mutate()}
                  isLoading={portalMutation.isPending}
                  leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  Portail Client Stripe
                </Button>
              </PermissionGate>
            </div>

            {/* Current plan banner */}
            {isSubLoading ? (
              <LoadingState message="Chargement de l'abonnement..." type="skeleton" rows={2} />
            ) : subscription ? (
              <div className="p-4 bg-linear-to-r from-blue-50/70 to-indigo-50/50 border border-blue-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="blue" size="md">
                      Plan {subscription.plan}
                    </Badge>
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Statut : {subscription.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 mt-1 font-medium">
                    Quota IA : <strong>{subscription.monthlyAiQuota.toLocaleString()} opérations / mois</strong>
                  </p>
                  {subscription.currentPeriodEnd && (
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Renouvellement le : {new Date(subscription.currentPeriodEnd).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>

                <PermissionGate
                  permission="billing:manage"
                  mode="disable"
                  tooltip="Action réservée aux administrateurs"
                >
                  <Button
                    size="sm"
                    onClick={() => portalMutation.mutate()}
                    isLoading={portalMutation.isPending}
                  >
                    Gérer cartes & factures
                  </Button>
                </PermissionGate>
              </div>
            ) : null}

            {/* Plans Grid */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">
                Formules & Tarifs Prospecta
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(plans || []).map((p) => {
                  const isCurrent = subscription?.plan === p.id;
                  return (
                    <div
                      key={p.id}
                      className={`p-4 rounded-lg border text-xs flex flex-col justify-between transition-all ${
                        isCurrent
                          ? 'border-blue-600 ring-2 ring-blue-600/10 bg-white'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-gray-900 text-sm">{p.name}</span>
                          {isCurrent && (
                            <Badge variant="blue" size="sm">
                              Actif
                            </Badge>
                          )}
                        </div>

                        <p className="text-[11px] text-gray-500 mb-3 min-h-[32px] leading-relaxed">
                          {p.description}
                        </p>

                        <div className="mb-4">
                          <span className="text-xl font-extrabold text-gray-900 font-mono">
                            {p.price === 0 ? 'Gratuit' : `${p.price.toLocaleString()} FCFA`}
                          </span>
                          {p.price > 0 && <span className="text-gray-500 text-[11px]"> / mois</span>}
                        </div>

                        <ul className="space-y-1.5 mb-4 text-[11px] text-gray-600">
                          {p.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-2 border-t border-gray-100">
                        {isCurrent ? (
                          <Button size="sm" variant="secondary" disabled className="w-full">
                            Forfait actuel
                          </Button>
                        ) : (
                          <PermissionGate
                            permission="billing:manage"
                            mode="disable"
                            tooltip="Action réservée aux administrateurs (ORG_ADMIN)"
                          >
                            <Button
                              size="sm"
                              className="w-full"
                              isLoading={checkoutMutation.isPending}
                              onClick={() => checkoutMutation.mutate(p.id)}
                            >
                              Choisir ce forfait
                            </Button>
                          </PermissionGate>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Utilisateurs */}
        {activeTab === 'utilisateurs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900">Membres de l&apos;équipe commerciale</h2>
              <PermissionGate
                permission="team:manage"
                mode="disable"
                tooltip="Action réservée aux administrateurs"
              >
                <Button size="sm" variant="secondary">
                  Inviter un collaborateur
                </Button>
              </PermissionGate>
            </div>

            <div className="border border-gray-200 rounded-md divide-y divide-gray-100 text-xs">
              <div className="p-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-900 block">
                    {user?.firstName} {user?.lastName} (Vous)
                  </span>
                  <span className="text-gray-500">{user?.email}</span>
                </div>
                <Badge variant="blue" size="sm">
                  {role}
                </Badge>
              </div>

              <div className="p-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-900 block">Amadou Diallo</span>
                  <span className="text-gray-500">amadou@prospecta.sn</span>
                </div>
                <Badge variant="gray" size="sm">
                  SALES_REP
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Section 5: Canaux */}
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
                    <h3 className="text-xs font-bold text-gray-900">WhatsApp Business API</h3>
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
                      mail.prospecta.sn — Envoi d&apos;emails professionnels sans spam
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

        {/* Section 6: IA */}
        {activeTab === 'ia' && (
          <div className="space-y-4 max-w-xl">
            <h2 className="text-sm font-bold text-gray-900 pb-2 border-b border-gray-100">
              Paramètres de l&apos;assistance commerciale par IA
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
                    Aucun message généré par l&apos;IA ne peut être envoyé automatiquement sans approbation préalable.
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
                    Adapter automatiquement le ton des messages aux usages d&apos;affaires courtois et professionnels du Sénégal et de l&apos;espace UEMOA.
                  </span>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Section 7: Notifications */}
        {activeTab === 'notifications' && (
          <div className="space-y-4 max-w-xl text-xs">
            <h2 className="text-sm font-bold text-gray-900 pb-2 border-b border-gray-100">
              Alertes & Notifications
            </h2>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 border border-gray-200 rounded">
                <span>Recevoir un email lors d&apos;une nouvelle réponse prospect</span>
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
              </label>

              <label className="flex items-center justify-between p-3 border border-gray-200 rounded">
                <span>Alerte WhatsApp lors d&apos;une prise de rendez-vous confirmée</span>
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
              </label>
            </div>
          </div>
        )}

        {/* Section 8: Sécurité */}
        {activeTab === 'securite' && (
          <div className="space-y-4 max-w-xl text-xs">
            <h2 className="text-sm font-bold text-gray-900 pb-2 border-b border-gray-100">
              Sécurité, Traçabilité & Contrôle d&apos;Accès RBAC
            </h2>

            <div className="p-4 bg-gray-50 rounded border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">Fournisseur d&apos;identité (IAM)</span>
                <Badge variant="blue" size="sm">Keycloak OIDC</Badge>
              </div>
              <p className="text-[11px] text-gray-600">
                Chaque requête HTTP injecte automatiquement un token JWT et un identifiant de trace cryptographique <code>X-Trace-Id</code> pour garantir la conformité et l&apos;auditabilité.
              </p>

              <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-gray-900 block">Votre niveau d&apos;habilitation</span>
                  <span className="text-[11px] text-gray-500">
                    {role === 'ORG_ADMIN' || role === 'SUPER_ADMIN'
                      ? 'Accès complet administrateur (Facturation, organisation, gestion)'
                      : role === 'SALES_MANAGER'
                      ? 'Accès management commercial (Campagnes, pipeline, prospects)'
                      : 'Accès commercial individuel (Prospection, enrichissement, inbox)'}
                  </span>
                </div>
                <Badge variant={role === 'ORG_ADMIN' ? 'blue' : 'gray'} size="sm">
                  {role}
                </Badge>
              </div>
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
