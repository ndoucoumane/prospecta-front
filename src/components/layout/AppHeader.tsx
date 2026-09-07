import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, User as UserIcon, Building2, Settings, LogOut } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../app/providers/AuthProvider';

interface AppHeaderProps {
  onOpenMobileMenu: () => void;
  title?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenMobileMenu, title }) => {
  const { user, organization, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/app/prospects?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile menu toggle + page title */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden text-gray-500 hover:text-gray-900 p-1.5 rounded-md border border-gray-200"
          aria-label="Ouvrir le menu de navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {title && (
          <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
            {title}
          </h1>
        )}
      </div>

      {/* Right: Global search + User menu */}
      <div className="flex items-center gap-3">
        {/* Global Search form */}
        <form onSubmit={handleSearchSubmit} className="relative hidden sm:block w-48 lg:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un prospect..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-gray-50 border border-gray-300 rounded-md focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-gray-900 placeholder:text-gray-400"
          />
        </form>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
            aria-expanded={userDropdownOpen}
            aria-label="Menu utilisateur"
          >
            <Avatar
              name={`${user?.firstName || 'Mor'} ${user?.lastName || 'Keblink'}`}
              size="sm"
            />
          </button>

          {/* User Menu Dropdown: Flat, Bordered, No Shadow */}
          {userDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md py-1.5 z-50 focus:outline-none"
              role="menu"
            >
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[11px] text-gray-500 truncate mt-0.5">
                  {organization?.name}
                </p>
              </div>

              <div className="py-1 text-xs">
                <Link
                  to="/app/settings"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  role="menuitem"
                >
                  <UserIcon className="w-3.5 h-3.5 text-gray-500" />
                  <span>Mon profil</span>
                </Link>

                <Link
                  to="/app/settings"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  role="menuitem"
                >
                  <Building2 className="w-3.5 h-3.5 text-gray-500" />
                  <span>Organisation</span>
                </Link>

                <Link
                  to="/app/settings"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  role="menuitem"
                >
                  <Settings className="w-3.5 h-3.5 text-gray-500" />
                  <span>Paramètres</span>
                </Link>
              </div>

              <div className="border-t border-gray-100 pt-1">
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left"
                  role="menuitem"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
