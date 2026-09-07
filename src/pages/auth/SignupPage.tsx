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

const signupSchema = z
  .object({
    firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
    lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z.string().email('Adresse email professionnelle non valide'),
    organizationName: z.string().min(2, 'Le nom de l\'organisation est requis'),
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
      organizationName: '',
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
        organizationName: data.organizationName,
        password: data.password,
      });
      showToast('Votre compte organisation a été créé avec succès.');
      navigate('/app', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la création du compte.';
      setErrorMsg(msg);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="text-center mb-6">
          <Link to="/" className="inline-block">
            <ProspectaLogo size="lg" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">
            Créer votre compte
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Démarrez la prospection commerciale pour votre organisation.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-8">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Prénom"
                placeholder="Mor"
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <Input
                label="Nom"
                placeholder="Keblink"
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>

            <Input
              label="Email professionnel"
              type="email"
              placeholder="mor@entreprise.sn"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Nom de l'organisation"
              placeholder="ex: Teranga Solutions"
              helperText="Votre devise commerciale sera configurée par défaut en FCFA (Sénégal)."
              error={errors.organizationName?.message}
              {...register('organizationName')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Mot de passe"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />
              <Input
                label="Confirmation"
                type="password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </div>

            <Button
              type="submit"
              size="md"
              className="w-full mt-3"
              isLoading={isSubmitting}
            >
              Créer mon compte
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 text-center text-xs text-gray-600">
            Déjà inscrit sur Prospecta ?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
