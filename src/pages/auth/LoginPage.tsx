import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ProspectaLogo } from '../../components/common/ProspectaLogo';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../app/providers/AuthProvider';
import { useToast } from '../../app/providers/ToastProvider';
import { Check } from 'lucide-react';

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

  const {
    register,
    handleSubmit,
    setValue,
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
      const msg = err instanceof Error ? err.message : 'Échec de la connexion. Vérifiez vos identifiants.';
      setErrorMsg(msg);
    }
  };

  const handleDemoClick = () => {
    setValue('email', 'mor@prospecta.sn');
    setValue('password', 'password123');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
        {/* Split Screen Container: Flat, Bordered, No Shadow */}
        <div className="grid grid-cols-1 md:grid-cols-2 border border-gray-200 rounded-lg overflow-hidden">
          {/* Left Column: Brand & Value Prop */}
          <div className="bg-gray-50 p-8 sm:p-10 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col justify-between">
            <div>
              <Link to="/" className="inline-block mb-8">
                <ProspectaLogo size="md" showTagline />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-snug">
                Automatisez votre prospection commerciale.
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-3 leading-relaxed">
                Connectez-vous à votre espace pour gérer vos prospects, suivre vos campagnes multicanales et développer votre pipeline d'opportunités.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 space-y-3">
              <div className="flex items-center gap-2 text-xs text-gray-700">
                <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>Centralisation des décideurs au Sénégal</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-700">
                <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>Campagnes Email & WhatsApp officielles</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-700">
                <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>Pipeline de vente en FCFA</span>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="bg-white p-8 sm:p-10 flex flex-col justify-center">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Connexion</h2>
              <p className="text-xs text-gray-500 mt-1">
                Entrez vos identifiants pour accéder au tableau de bord.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Adresse email professionnelle"
                type="email"
                placeholder="mor@entreprise.sn"
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Mot de passe"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={handleDemoClick}
                  className="text-blue-600 hover:text-blue-700 font-medium underline"
                >
                  Remplir compte démo (Mor Keblink)
                </button>
                <span className="text-gray-400">Authentification Keycloak</span>
              </div>

              <Button
                type="submit"
                size="md"
                className="w-full mt-2"
                isLoading={isSubmitting}
              >
                Se connecter
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 text-center text-xs text-gray-600">
              Vous n'avez pas encore de compte ?{' '}
              <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
                S'inscrire
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
