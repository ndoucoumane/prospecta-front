import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ProspectaLogo } from '../../components/common/ProspectaLogo';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../app/providers/AuthProvider';
import { useToast } from '../../app/providers/ToastProvider';
import { extractApiErrorMessage } from '../../api';
import {
  Building2,
  RefreshCw,
  Award,
  BarChart3,
  Bell,
  Mail,
  Lock,
  User,
} from 'lucide-react';

const signupSchema = z
  .object({
    firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
    lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z.string().email('Adresse email professionnelle non valide'),
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export const SignupPage: React.FC = () => {
  const { signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    try {
      setErrorMsg(null);
      await signup({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      showToast('Votre compte a été créé avec succès.');
      navigate('/app', { replace: true });
    } catch (err: unknown) {
      const msg = extractApiErrorMessage(err, 'Erreur lors de la création du compte.');
      setErrorMsg(msg);
    }
  };

  return (
    <div className="min-h-screen bg-white grid grid-cols-1 lg:grid-cols-12 overflow-x-hidden">
      {/* LEFT COLUMN: Clean Form & Clickable Logo */}
      <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 lg:p-8 xl:p-10 min-h-screen bg-white overflow-y-auto">
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
        <div className="w-full max-w-md mx-auto my-auto py-6">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Créer votre compte
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-gray-500 leading-relaxed font-normal">
              Démarrez la prospection commerciale multicanale pour votre organisation.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Prénom"
                placeholder="Prénom"
                leftIcon={<User className="w-4 h-4" />}
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <Input
                label="Nom"
                placeholder="Nom"
                leftIcon={<User className="w-4 h-4" />}
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>

            <Input
              label="Email professionnel"
              type="email"
              placeholder="Adresse Email"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Mot de passe"
                type="password"
                placeholder="Mot de passe"
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.password?.message}
                {...register('password')}
              />
              <Input
                label="Confirmation"
                type="password"
                placeholder="Confirmation du mot de ...."
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </div>

            <Button
              type="submit"
              size="md"
              className="w-full mt-2 font-medium text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2.5 transition-colors"
              isLoading={isSubmitting}
            >
              Créer mon compte
            </Button>
          </form>

          {/* Login link */}
          <p className="mt-5 text-center text-xs text-gray-600">
            Déjà inscrit sur Prospecta ?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Se connecter
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

          {/* Row 2: Abdoulaye and Melissa on the same line */}
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
