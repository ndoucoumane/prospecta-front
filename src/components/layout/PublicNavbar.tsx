import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  ChevronDown,
  Users,
  Megaphone,
  MessageSquare,
  Kanban,
  Bot,
  BarChart3,
  Building2,
  Target,
  Check,
  ArrowRight,
} from 'lucide-react';
import { ProspectaLogo } from '../common/ProspectaLogo';
import { Button } from '../ui/Button';

interface SubMenuItem {
  label: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavItem {
  label: string;
  href: string;
  children?: SubMenuItem[];
  footerLink?: {
    label: string;
    href: string;
  };
}

export const PublicNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<Record<string, boolean>>({});
  const navRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const navLinks: NavItem[] = [
    {
      label: 'Fonctionnalités',
      href: '/#fonctionnalites',
      children: [
        {
          label: 'Prospects & Entreprises',
          description: 'Centralisez vos contacts professionnels et scoring ICP.',
          href: '/#prospects',
          icon: Users,
        },
        {
          label: 'Campagnes & Séquences',
          description: 'Automatisez vos relances multicanales Email et WhatsApp.',
          href: '/#campagnes',
          icon: Megaphone,
        },
        {
          label: 'Boîte de Réception Unifiée',
          description: 'Centralisez vos conversations WhatsApp & Email en un seul flux.',
          href: '/#conversations',
          icon: MessageSquare,
        },
        {
          label: 'Pipeline Commercial',
          description: 'Pilotez vos deals et opportunités à chaque étape en FCFA.',
          href: '/#pipeline',
          icon: Kanban,
        },
        {
          label: 'Assistance IA & Scoring',
          description: 'Qualification prédictive et génération de messages pertinents.',
          href: '/#ia-scoring',
          icon: Bot,
        },
        {
          label: 'Analyses & Performance KPI',
          description: 'Suivez le taux de conversion et le retour sur investissement.',
          href: '/#analyses',
          icon: BarChart3,
        },
      ],
      footerLink: {
        label: 'Découvrir la page dédiée aux fonctionnalités',
        href: '/features',
      },
    },
    {
      label: 'Solutions',
      href: '/#solutions',
      children: [
        {
          label: 'Prospection Ventes B2B',
          description: 'Ciblez efficacement les décideurs clés au Sénégal et dans la région.',
          href: '/#solutions',
          icon: Building2,
        },
        {
          label: 'Automatisation WhatsApp & Email',
          description: 'Séquences adaptées aux habitudes de communication locales.',
          href: '/#campagnes',
          icon: Megaphone,
        },
        {
          label: 'Closing & Pipeline Kanban',
          description: 'Structurez vos cycles commerciaux de la prise de contact à la vente.',
          href: '/#pipeline',
          icon: Target,
        },
        {
          label: 'Comment ça fonctionne',
          description: 'Une méthodologie claire en 4 étapes pour convertir vos prospects.',
          href: '/#comment-ca-marche',
          icon: Check,
        },
      ],
    },
    { label: 'Tarifs', href: '/pricing' },
    { label: 'À propos', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = (label: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const toggleMobileAccordion = (label: string) => {
    setMobileExpanded((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const handleNavigate = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);

    if (href.startsWith('/#') || href.startsWith('#')) {
      e.preventDefault();
      const hash = href.startsWith('/#') ? href.slice(2) : href.slice(1);

      if (location.pathname === '/' || location.pathname === '') {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', `/#${hash}`);
        }
      } else {
        navigate(`/#${hash}`);
      }
    }
  };

  const isActive = (path: string) => {
    if (path.startsWith('/#')) {
      return location.pathname === '/' && location.hash === path.slice(1);
    }
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200">
      <div
        ref={navRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
      >
        {/* Left: Logo & Desktop Navigation */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center" aria-label="Accueil Prospecta">
            <ProspectaLogo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2" aria-label="Navigation principale">
            {navLinks.map((link) => {
              const hasChildren = Boolean(link.children && link.children.length > 0);
              const isDropdownOpen = activeDropdown === link.label;

              return (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => hasChildren && handleMouseEnter(link.label)}
                  onMouseLeave={() => hasChildren && handleMouseLeave()}
                >
                  <a
                    href={link.href}
                    onClick={(e) => handleNavigate(e, link.href)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-[15px] font-semibold transition-colors duration-150 ${
                      isActive(link.href) || isDropdownOpen
                        ? 'text-blue-600 bg-blue-50/60'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                    aria-expanded={hasChildren ? isDropdownOpen : undefined}
                    aria-haspopup={hasChildren ? 'true' : undefined}
                  >
                    <span>{link.label}</span>
                    {hasChildren && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isDropdownOpen ? 'rotate-180 text-blue-600' : 'text-gray-400'
                        }`}
                      />
                    )}
                  </a>

                  {/* Dropdown Menu */}
                  {hasChildren && isDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-[540px] bg-white border border-gray-200 rounded-xl shadow-lg p-3 z-50">
                      <div className="grid grid-cols-2 gap-2">
                        {link.children!.map((child) => {
                          const Icon = child.icon;
                          return (
                            <a
                              key={child.label}
                              href={child.href}
                              onClick={(e) => handleNavigate(e, child.href)}
                              className="flex items-start gap-3 p-2.5 rounded-lg border border-transparent hover:border-blue-100 hover:bg-blue-50/60 transition-all duration-150 group"
                            >
                              <div className="p-2 rounded-md bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {child.label}
                                </div>
                                <p className="text-xs text-gray-500 leading-snug mt-0.5">
                                  {child.description}
                                </p>
                              </div>
                            </a>
                          );
                        })}
                      </div>

                      {link.footerLink && (
                        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between px-2 text-xs">
                          <Link
                            to={link.footerLink.href}
                            onClick={() => setActiveDropdown(null)}
                            className="font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition-colors"
                          >
                            <span>{link.footerLink.label}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Right Actions: Connexion / S'inscrire */}
        <div className="hidden md:flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" size="md" className="text-[15px] font-semibold px-3.5 py-2 text-gray-700 hover:text-blue-600">
              Connexion
            </Button>
          </Link>
          <Link to="/signup">
            <Button variant="primary" size="md" className="text-[15px] font-semibold px-4 py-2">
              S'inscrire
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-600 hover:text-gray-900 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            aria-expanded={mobileMenuOpen}
            aria-label="Ouvrir le menu de navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-6 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const hasChildren = Boolean(link.children && link.children.length > 0);
              const isExpanded = mobileExpanded[link.label];

              return (
                <div key={link.label} className="border-b border-gray-100 last:border-0 pb-1">
                  <div className="flex items-center justify-between">
                    <a
                      href={link.href}
                      onClick={(e) => handleNavigate(e, link.href)}
                      className={`text-base font-semibold py-2.5 px-2 rounded-md flex-1 ${
                        isActive(link.href)
                          ? 'text-blue-600 bg-blue-50/60'
                          : 'text-gray-800 hover:text-blue-600'
                      }`}
                    >
                      {link.label}
                    </a>

                    {hasChildren && (
                      <button
                        onClick={() => toggleMobileAccordion(link.label)}
                        className="p-2 text-gray-500 hover:text-gray-800 focus:outline-none"
                        aria-label={`Afficher les sous-menus pour ${link.label}`}
                      >
                        <ChevronDown
                          className={`w-5 h-5 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180 text-blue-600' : ''
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {/* Mobile Accordion Children */}
                  {hasChildren && isExpanded && (
                    <div className="pl-3 pr-1 py-2 space-y-1 bg-gray-50/60 rounded-lg my-1">
                      {link.children!.map((child) => {
                        const Icon = child.icon;
                        return (
                          <a
                            key={child.label}
                            href={child.href}
                            onClick={(e) => handleNavigate(e, child.href)}
                            className="flex items-center gap-2.5 py-2 px-2.5 rounded-md hover:bg-white text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                          >
                            <div className="p-1 rounded bg-blue-50 text-blue-600 shrink-0">
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="truncate">{child.label}</span>
                          </a>
                        );
                      })}

                      {link.footerLink && (
                        <div className="pt-2 border-t border-gray-200/80 px-2 mt-2">
                          <Link
                            to={link.footerLink.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-xs font-semibold text-blue-600 flex items-center gap-1"
                          >
                            <span>{link.footerLink.label}</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="border-t border-gray-200 pt-4 flex flex-col gap-2.5">
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
              <Button variant="secondary" size="md" className="w-full font-semibold">
                Connexion
              </Button>
            </Link>
            <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="w-full">
              <Button variant="primary" size="md" className="w-full font-semibold">
                S'inscrire
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
