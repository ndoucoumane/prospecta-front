import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from '../layouts/PublicLayout';
import { AppLayout } from '../layouts/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Public Pages
import { HomePage } from '../../pages/public/HomePage';
import { FeaturesPage } from '../../pages/public/FeaturesPage';
import { PricingPage } from '../../pages/public/PricingPage';
import { AboutPage } from '../../pages/public/AboutPage';
import { ContactPage } from '../../pages/public/ContactPage';
import { LoginPage } from '../../pages/auth/LoginPage';
import { SignupPage } from '../../pages/auth/SignupPage';

// App Pages
import { DashboardPage } from '../../pages/app/DashboardPage';
import { ProspectsPage } from '../../pages/app/prospects/ProspectsPage';
import { ProspectDetailPage } from '../../pages/app/prospects/ProspectDetailPage';
import { CompaniesPage } from '../../pages/app/companies/CompaniesPage';
import { CompanyDetailPage } from '../../pages/app/companies/CompanyDetailPage';
import { DiscoveryPage } from '../../pages/app/discovery/DiscoveryPage';
import { LeadListsPage } from '../../pages/app/lists/LeadListsPage';
import { CampaignsPage } from '../../pages/app/campaigns/CampaignsPage';
import { CampaignBuilderPage } from '../../pages/app/campaigns/CampaignBuilderPage';
import { CampaignDetailPage } from '../../pages/app/campaigns/CampaignDetailPage';
import { ConversationsPage } from '../../pages/app/conversations/ConversationsPage';
import { TasksPage } from '../../pages/app/tasks/TasksPage';
import { PipelinePage } from '../../pages/app/pipeline/PipelinePage';
import { AnalyticsPage } from '../../pages/app/analytics/AnalyticsPage';
import { SettingsPage } from '../../pages/app/settings/SettingsPage';
import { WhatsAppSettingsPage } from '../../pages/app/settings/WhatsAppSettingsPage';
import { OnboardingPage } from '../../pages/auth/OnboardingPage';

// Common
import { NotFoundPage } from '../../pages/common/NotFoundPage';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* 11. Public Layout Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      {/* Standalone Auth & Onboarding Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* 80. Protected SaaS App Routes */}
      <Route path="/app" element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          {/* Prospection */}
          <Route path="prospects" element={<ProspectsPage />} />
          <Route path="prospects/:id" element={<ProspectDetailPage />} />
          <Route path="companies" element={<CompaniesPage />} />
          <Route path="companies/:id" element={<CompanyDetailPage />} />
          <Route path="discovery" element={<DiscoveryPage />} />
          <Route path="lists" element={<LeadListsPage />} />

          {/* Engagement */}
          <Route path="campaigns" element={<CampaignsPage />} />
          <Route path="campaigns/new" element={<CampaignBuilderPage />} />
          <Route path="campaigns/:id" element={<CampaignDetailPage />} />
          <Route path="conversations" element={<ConversationsPage />} />
          <Route path="tasks" element={<TasksPage />} />

          {/* CRM */}
          <Route path="pipeline" element={<PipelinePage />} />

          {/* Analyse */}
          <Route path="analytics" element={<AnalyticsPage />} />

          {/* Configuration */}
          <Route path="settings" element={<SettingsPage />} />
          <Route path="settings/channels/whatsapp" element={<WhatsAppSettingsPage />} />
        </Route>
      </Route>

      {/* Redirect /dashboard to /app for compatibility */}
      <Route path="/dashboard" element={<Navigate to="/app" replace />} />

      {/* 81. 404 Page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
