import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ProspectaLogo } from '../../components/common/ProspectaLogo';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../app/providers/AuthProvider';
import { useToast } from '../../app/providers/ToastProvider';
import { extractApiErrorMessage } from '../../api';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building2,
  RefreshCw,
  Award,
  BarChart3,
  Bell,
} from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Veuillez saisir une adresse email valide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'mor@prospecta.sn',
      password: 'password123',
    },
  });

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/app';

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setErrorMsg(null);
      await login(data.email, data.password);
      showToast('Connexion réussie.');
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg = extractApiErrorMessage(err, 'Échec de la connexion. Vérifiez vos identifiants.');
      setErrorMsg(msg);
    }
  };

  const handleGoogleLogin = () => {
    showToast('La connexion Google sera disponible prochainement dans votre région.');
  };

  return (
    <div className="min-h-screen bg-white grid grid-cols-1 lg:grid-cols-12 overflow-x-hidden">
      {/* LEFT COLUMN: Clean Form & Clickable Logo */}
      <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 min-h-screen bg-white">
        {/* Clickable Logo linking to HomePage */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 group transition-opacity hover:opacity-90"
            aria-label="Retour à la page d'accueil Prospecta"
          >
            <ProspectaLogo size="md" />
          </Link>
        </div>

        {/* Centered Form Content */}
        <div className="w-full max-w-sm mx-auto my-auto py-8">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Bienvenu !
            </h1>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed font-normal">
              Connectez-vous à Prospecta pour piloter vos prospects, vos campagnes multicanales et vos opportunités commerciales.
            </p>
          </div>

          {/* Google Sign-in Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-2.5 px-4 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-3 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Se connecter avec Google</span>
          </button>

          {/* OR Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-gray-400 font-semibold tracking-wider uppercase">
                ou
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700">
              {errorMsg}
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="Adresse Email"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 mt-1.5">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mot de passe"
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 mt-1.5">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              size="md"
              className="w-full font-medium text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2.5 transition-colors"
              isLoading={isSubmitting}
            >
              Se connecter
            </Button>
          </form>

          {/* Sign up link */}
          <p className="mt-5 text-center text-xs text-gray-600">
            Vous n'avez pas de compte ?{' '}
            <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
              S'inscrire
            </Link>
          </p>
        </div>

        {/* Bottom Footer Links */}
        <div className="pt-4 flex items-center justify-center gap-6 text-xs text-gray-400 font-medium">
          <Link to="/about" className="hover:text-gray-600 transition-colors">
            Conditions d'utilisation
          </Link>
          <Link to="/contact" className="hover:text-gray-600 transition-colors">
            Politique de confidentialité
          </Link>
        </div>
      </div>

      {/* RIGHT COLUMN: Deep Blue (#002766) with Screenshot Floating Buttons & White Histogram Card */}
      <div className="hidden lg:flex lg:col-span-7 bg-[#002766] relative overflow-hidden flex-col justify-between pt-8 px-6 lg:px-10 pb-8 select-none min-h-screen">
        {/* Subtle Brand Header / Badge */}
        <div className="relative z-10">
          <div className="text-xs font-semibold text-blue-200 tracking-wider uppercase">
            Plateforme de prospection commerciale B2B
          </div>
        </div>

        {/* 1. FLOATING BUTTONS / PILLS (From the screenshot, placed directly above the histogram card) */}
        <div className="relative z-20 space-y-3">
          {/* Row 1: Bell skeleton (left) + Peter (right) */}
          <div className="flex items-center justify-end gap-3">
            {/* Notification pill with Bell icon & skeleton */}
            <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-1">
                <div className="h-1.5 w-12 bg-gray-200 rounded-sm" />
                <div className="h-1 w-8 bg-gray-100 rounded-sm" />
              </div>
            </div>

            {/* Peter */}
            <div className="bg-white border border-gray-200 rounded-lg p-2.5 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <RefreshCw className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs">
                <div className="font-semibold text-gray-900">Peter</div>
                <div className="text-gray-500 text-[11px]">A changé de poste</div>
              </div>
            </div>
          </div>

          {/* Row 2: Acme and Melissa on the same line */}
          <div className="flex flex-wrap items-center justify-end gap-3">
            {/* Abdoulaye */}
            <div className="bg-white border border-gray-200 rounded-lg p-2.5 sm:p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-semibold text-gray-900">Abdoulaye</div>
                <div className="text-gray-500 text-[11px]">Nouveau Head of Growth recruté</div>
              </div>
            </div>

            {/* Melissa */}
            <div className="bg-white border border-gray-200 rounded-lg p-2.5 sm:p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Award className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs">
                <div className="font-semibold text-gray-900">Melissa</div>
                <div className="text-gray-500 text-[11px]">Promue Directrice des Ventes (VP)</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. PROSPECTING HISTOGRAM CARD IN PURE WHITE (Placed at the place of the table, shifted inward with comfortable spacing) */}
        <div className="relative z-10 mt-6 sm:mt-8 bg-white rounded-xl border border-gray-200 p-6 sm:p-7 w-full overflow-hidden">
          {/* Card Header with Metrics (Fully visible and clearly laid out) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 uppercase tracking-wider">
                <BarChart3 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Résultats de prospection commerciale</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                +68.4% <span className="text-xs sm:text-sm font-normal text-gray-500">de taux de réponse moyen</span>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <div className="text-xs text-gray-500">Pipeline qualifié ce trimestre</div>
              <div className="text-lg sm:text-xl font-bold text-gray-900">
                28 500 000 <span className="text-xs font-medium text-gray-500">FCFA</span>
              </div>
            </div>
          </div>

          {/* Histogram: Progression mensuelle des opportunités qualifiées */}
          <div className="pt-5 pb-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600 mb-3">
              <span className="font-medium">Croissance mensuelle des opportunités qualifiées</span>
              <span className="text-blue-600 font-semibold text-xs shrink-0">
                +340% de conversion sur 6 mois
              </span>
            </div>

            {/* Histogram Bars */}
            <div className="grid grid-cols-6 gap-3 items-end h-32 pt-2">
              {[
                { label: 'Jan', val: 28, count: '+140' },
                { label: 'Fév', val: 42, count: '+220' },
                { label: 'Mar', val: 56, count: '+380' },
                { label: 'Avr', val: 70, count: '+540' },
                { label: 'Mai', val: 84, count: '+720' },
                { label: 'Juin', val: 100, count: '+960', active: true },
              ].map((bar) => (
                <div key={bar.label} className="flex flex-col items-center gap-1.5">
                  <span
                    className={`text-[11px] font-mono ${
                      bar.active ? 'text-emerald-700 font-bold' : 'text-gray-500 font-medium'
                    }`}
                  >
                    {bar.count}
                  </span>
                  <div className="w-full bg-gray-100 rounded-sm h-20 flex items-end overflow-hidden">
                    <div
                      className={`w-full rounded-sm transition-colors duration-200 ${
                        bar.active ? 'bg-emerald-600' : 'bg-blue-600'
                      }`}
                      style={{ height: `${bar.val}%` }}
                    />
                  </div>
                  <span
                    className={`text-xs ${
                      bar.active ? 'text-emerald-700 font-bold' : 'text-gray-600 font-medium'
                    }`}
                  >
                    {bar.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Multichannel Prospecting Breakdown */}
          <div className="mt-5 pt-4 border-t border-gray-200 grid grid-cols-3 gap-3 text-xs">
            <div className="bg-[#F9FAFB] rounded-md p-3 border border-gray-200">
              <div className="text-gray-500 text-[11px]">Emailing B2B enrichi</div>
              <div className="text-gray-900 font-bold text-sm mt-0.5">74% ouverture</div>
              <div className="text-gray-500 text-[11px] mt-0.5">45% du volume global</div>
            </div>
            <div className="bg-[#F9FAFB] rounded-md p-3 border border-gray-200">
              <div className="text-gray-500 text-[11px]">LinkedIn automatisé</div>
              <div className="text-gray-900 font-bold text-sm mt-0.5">62% réponse</div>
              <div className="text-gray-500 text-[11px] mt-0.5">35% du volume global</div>
            </div>
            <div className="bg-[#F9FAFB] rounded-md p-3 border border-gray-200">
              <div className="text-gray-500 text-[11px]">WhatsApp B2B direct</div>
              <div className="text-gray-900 font-bold text-sm mt-0.5">98% délivrabilité</div>
              <div className="text-gray-500 text-[11px] mt-0.5">20% du volume global</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


