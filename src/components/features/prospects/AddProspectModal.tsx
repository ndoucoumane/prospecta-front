import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/Button';
import { prospectsApi } from '../../../api';
import { useToast } from '../../../app/providers/ToastProvider';

const prospectSchema = z.object({
  firstName: z.string().min(2, 'Le prénom est requis'),
  lastName: z.string().min(2, 'Le nom est requis'),
  email: z.string().email('Email professionnel non valide'),
  phone: z.string().min(8, 'Numéro de téléphone requis (+221...)'),
  companyName: z.string().min(2, 'Nom de l\'entreprise requis'),
  jobTitle: z.string().min(2, 'Fonction / Poste requis'),
  city: z.string().min(1, 'Ville requise'),
  sector: z.string().min(1, 'Secteur requis'),
  notes: z.string().optional(),
});

type ProspectFormValues = z.infer<typeof prospectSchema>;

interface AddProspectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProspectAdded: () => void;
}

export const AddProspectModal: React.FC<AddProspectModalProps> = ({
  isOpen,
  onClose,
  onProspectAdded,
}) => {
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProspectFormValues>({
    resolver: zodResolver(prospectSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '+221 77 ',
      companyName: '',
      jobTitle: '',
      city: 'Dakar',
      sector: 'Services B2B',
      notes: '',
    },
  });

  const onSubmit = async (data: ProspectFormValues) => {
    try {
      await prospectsApi.createProspect(data);
      showToast('Prospect créé.');
      reset();
      onProspectAdded();
      onClose();
    } catch {
      showToast('Impossible de créer le prospect.', 'error');
    }
  };

  const cityOptions = [
    { value: 'Dakar', label: 'Dakar' },
    { value: 'Thiès', label: 'Thiès' },
    { value: 'Saly', label: 'Saly / Mbour' },
    { value: 'Saint-Louis', label: 'Saint-Louis' },
    { value: 'Autre', label: 'Autre région' },
  ];

  const sectorOptions = [
    { value: 'Services B2B', label: 'Services B2B' },
    { value: 'Transport & Logistique', label: 'Transport & Logistique' },
    { value: 'Hôtellerie & Restauration', label: 'Hôtellerie & Restauration' },
    { value: 'Agroalimentaire', label: 'Agroalimentaire & Distribution' },
    { value: 'Technologies & Logiciels', label: 'Technologies & Logiciels' },
    { value: 'Banque & Assurance', label: 'Banque & Assurance' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ajouter un prospect"
      description="Renseignez les coordonnées professionnelles du prospect commercial."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Prénom"
            placeholder="Babacar"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Nom"
            placeholder="Ndiaye"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Email professionnel"
            type="email"
            placeholder="b.ndiaye@entreprise.sn"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Téléphone (WhatsApp)"
            placeholder="+221 77 123 45 67"
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Entreprise"
            placeholder="Nom de l'entreprise"
            error={errors.companyName?.message}
            {...register('companyName')}
          />
          <Input
            label="Fonction / Poste"
            placeholder="ex: Directeur Commercial"
            error={errors.jobTitle?.message}
            {...register('jobTitle')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Ville / Région"
            options={cityOptions}
            error={errors.city?.message}
            {...register('city')}
          />
          <Select
            label="Secteur d'activité"
            options={sectorOptions}
            error={errors.sector?.message}
            {...register('sector')}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-700">Notes internes</label>
          <textarea
            rows={2}
            placeholder="Contexte de rencontre, attentes spécifiques..."
            className="w-full bg-white text-gray-900 text-xs rounded-md border border-gray-300 p-2.5 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            {...register('notes')}
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" size="sm" isLoading={isSubmitting}>
            Enregistrer le prospect
          </Button>
        </div>
      </form>
    </Modal>
  );
};
