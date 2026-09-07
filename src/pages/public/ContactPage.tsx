import React, { useState } from 'react';
import { Mail, Phone, MapPin, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../app/providers/ToastProvider';

export const ContactPage: React.FC = () => {
  const { showToast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      showToast('Votre message a été transmis à l\'équipe Prospecta.');
    }, 600);
  };

  return (
    <div className="bg-white py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <Badge variant="blue" size="md" className="mb-4">
            Contact direct
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Échangez avec l'équipe Prospecta
          </h1>
          <p className="text-base text-gray-600 mt-3">
            Vous souhaitez une démonstration personnalisée ou adapter Prospecta aux besoins de votre entreprise ?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Contact Details */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900">
              Nos coordonnées à Dakar
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Nous sommes basés à Dakar et accompagnons les entreprises au Sénégal, en Côte d'Ivoire et dans toute la sous-région UEMOA.
            </p>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-8 h-8 rounded bg-gray-50 border border-gray-200 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>Almadies / Mermoz, Dakar, Sénégal</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-8 h-8 rounded bg-gray-50 border border-gray-200 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <span>+221 77 845 12 34 (Appel & WhatsApp)</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-8 h-8 rounded bg-gray-50 border border-gray-200 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <span>contact@prospecta.sn</span>
              </div>
            </div>

            <div className="bg-blue-50/60 border border-blue-200 rounded-md p-4 text-xs text-blue-900 leading-relaxed">
              <strong>Horaires d'ouverture :</strong> Du lundi au vendredi, de 08h30 à 18h00 GMT (Heure de Dakar).
            </div>
          </div>

          {/* Form */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            {submitted ? (
              <div className="text-center py-10">
                <div className="w-10 h-10 bg-green-50 border border-green-200 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Message envoyé avec succès</h3>
                <p className="text-xs text-gray-600 mt-2 max-w-xs mx-auto">
                  Un conseiller commercial prendra contact avec vous dans un délai de 24 heures ouvrées.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  Envoyer un message
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input label="Prénom" placeholder="ex: Mor" required />
                  <Input label="Nom" placeholder="ex: Ndiaye" required />
                </div>

                <Input
                  label="Email professionnel"
                  type="email"
                  placeholder="contact@entreprise.sn"
                  required
                />

                <Input
                  label="Numéro de téléphone (+221)"
                  placeholder="+221 77 000 00 00"
                  required
                />

                <Input
                  label="Nom de l'entreprise"
                  placeholder="ex: Teranga Logistique"
                  required
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Précisez votre demande ou vos objectifs commerciaux..."
                    className="w-full bg-white text-gray-900 text-sm rounded-md border border-gray-300 p-3 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <Button type="submit" size="md" className="w-full" isLoading={loading}>
                  Envoyer la demande
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
