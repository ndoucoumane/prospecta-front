import { apiGet, apiPost, executeWithPermission } from './client';
import type {
  BillingPlanResponse,
  SubscriptionResponse,
  CheckoutSessionRequest,
  CheckoutSessionResponse,
  CustomerPortalRequest,
  CustomerPortalResponse,
} from '../types/api';

export const billingApi = {
  /**
   * GET /api/v1/billing/plans
   * Consulter les formules et tarifs disponibles (FREE, STARTER, BUSINESS) en FCFA / XOF
   */
  async getPlans(): Promise<BillingPlanResponse[]> {
    return executeWithPermission('billing:view', async () => {
      return apiGet<BillingPlanResponse[]>('/api/v1/billing/plans');
    });
  },

  /**
   * GET /api/v1/billing/subscription
   * Consulter l'état de l'abonnement actif de l'organisation
   */
  async getSubscription(): Promise<SubscriptionResponse> {
    return executeWithPermission('billing:view', async () => {
      return apiGet<SubscriptionResponse>('/api/v1/billing/subscription');
    });
  },

  /**
   * POST /api/v1/billing/checkout
   * Initier une session de paiement Stripe Checkout (Redirection vers checkoutUrl)
   * Réservé aux administrateurs (ORG_ADMIN, SUPER_ADMIN)
   */
  async createCheckoutSession(
    payload: CheckoutSessionRequest
  ): Promise<CheckoutSessionResponse> {
    return executeWithPermission('billing:manage', async () => {
      return apiPost<CheckoutSessionResponse>('/api/v1/billing/checkout', payload);
    });
  },

  /**
   * POST /api/v1/billing/portal
   * Accéder au portail client Stripe (Gestion des cartes et factures)
   * Réservé aux administrateurs (ORG_ADMIN, SUPER_ADMIN)
   */
  async createCustomerPortalSession(
    payload: CustomerPortalRequest
  ): Promise<CustomerPortalResponse> {
    return executeWithPermission('billing:manage', async () => {
      return apiPost<CustomerPortalResponse>('/api/v1/billing/portal', payload);
    });
  },

  /**
   * Utilitaire pour rediriger directement vers Stripe Checkout
   */
  async redirectToCheckout(plan: CheckoutSessionRequest['plan']): Promise<void> {
    return executeWithPermission('billing:manage', async () => {
      const origin = window.location.origin;
      const session = await this.createCheckoutSession({
        plan,
        successUrl: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}/settings/billing`,
      });
      if (session?.checkoutUrl) {
        window.location.href = session.checkoutUrl;
      }
    });
  },

  /**
   * Utilitaire pour rediriger vers le portail client Stripe
   */
  async redirectToPortal(): Promise<void> {
    return executeWithPermission('billing:manage', async () => {
      const origin = window.location.origin;
      const portal = await this.createCustomerPortalSession({
        returnUrl: `${origin}/settings/billing`,
      });
      if (portal?.portalUrl) {
        window.location.href = portal.portalUrl;
      }
    });
  },
};
