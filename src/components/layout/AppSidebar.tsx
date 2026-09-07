import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Megaphone,
  MessageSquare,
  Kanban,
  BarChart3,
  Settings,
  X,
  LogOut,
} from 'lucide-react';
import { ProspectaLogo } from '../common/ProspectaLogo';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../app/providers/AuthProvider';

interface AppSidebarProps {
  onCloseMobile?: () => void;
  isMobile?: boolean;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  onCloseMobile,
  isMobile = false,
}) => {
  const { user, organization, logout } = useAuth();

  const principalNav = [
    { label: 'Tableau de bord', to: '/app', icon: LayoutDashboard, end: true },
    { label: 'Prospects', to: '/app/prospects', icon: Users, end: false },
    { label: 'Entreprises', to: '/app/companies', icon: Building2, end: false },
    { label: 'Campagnes', to: '/app/campaigns', icon: Megaphone, end: false },
    { label: 'Conversations', to: '/app/conversations', icon: MessageSquare, end: false },
    { label: 'Pipeline', to: '/app/pipeline', icon: Kanban, end: false },
  ];

  const analyseNav = [
    { label: 'Analyses', to: '/app/analytics', icon: BarChart3, end: false },
  ];

  const configNav = [
    { label: 'Paramètres', to: '/app/settings', icon: Settings, end: false },
  ];

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors select-none ${
      isActive
        ? 'bg-[#EFF6FF] text-[#1D4ED8]'
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <aside
      className={`w-64 bg-white border-r border-gray-200 flex flex-col justify-between h-full select-none ${
        isMobile ? 'h-full' : ''
      }`}
      aria-label="Menu principal"
    >
      {/* Top Header & Logo */}
      <div className="flex flex-col">
        <div className="h-16 px-4 border-b border-gray-200 flex items-center justify-between">
          <Link to="/app" onClick={onCloseMobile} className="flex items-center">
            <ProspectaLogo size="md" />
          </Link>
          {isMobile && onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-md"
              aria-label="Fermer le menu de navigation"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="p-3 space-y-6 overflow-y-auto">
          {/* Section: Principal */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Principal
            </div>
            <div className="space-y-1">
              {principalNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={onCloseMobile}
                    className={linkClass}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Section: Analyse */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Analyse
            </div>
            <div className="space-y-1">
              {analyseNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={onCloseMobile}
                    className={linkClass}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Section: Configuration */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Configuration
            </div>
            <div className="space-y-1">
              {configNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={onCloseMobile}
                    className={linkClass}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </nav>
      </div>

      {/* Bottom User Area */}
      <div className="p-3 border-t border-gray-200 bg-white">
        <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition-colors">
          <Link
            to="/app/settings"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 min-w-0"
          >
            <Avatar
              name={`${user?.firstName || 'Mor'} ${user?.lastName || 'Keblink'}`}
              size="sm"
            />
            <div className="min-w-0 flex flex-col text-left">
              <span className="text-xs font-semibold text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-[11px] text-gray-500 truncate">
                {organization?.name || 'Prospecta Sénégal'}
              </span>
            </div>
          </Link>
          <button
            onClick={() => logout()}
            className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors"
            title="Déconnexion"
            aria-label="Déconnexion"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
