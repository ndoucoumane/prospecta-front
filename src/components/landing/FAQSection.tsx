import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  action?: {
    label: string;
    href: string;
  };
}

export const defaultFaqItems: FAQItem[] = [
  {
    id: 'quest-ce-que-prospecta',
    question: "Qu'est-ce que Prospecta ?",
    answer:
      "Prospecta est une plateforme SaaS de prospection commerciale conçue pour aider les entreprises à trouver, qualifier et contacter leurs prospects, puis à suivre les échanges et les opportunités commerciales depuis un espace unique.",
  },
  {
    id: 'a-qui-sadresse-prospecta',
    question: "À qui s'adresse Prospecta ?",
    answer:
      "Prospecta s'adresse principalement aux entreprises, équipes commerciales, agences et professionnels B2B qui souhaitent structurer et améliorer leur prospection. La plateforme est particulièrement pensée pour répondre aux réalités des entreprises au Sénégal et en Afrique, tout en étant conçue pour évoluer vers d'autres marchés.",
  },
  {
    id: 'comment-prospecta-aide-trouver-qualifier',
    question: "Comment Prospecta aide-t-il à trouver et qualifier des prospects ?",
    answer:
      "Prospecta permet de centraliser vos prospects et de les organiser selon différents critères comme le secteur d'activité, la localisation, le poste ou la taille de l'entreprise. Chaque prospect peut également recevoir un score de pertinence afin d'identifier plus facilement les contacts correspondant à votre cible commerciale.",
  },
  {
    id: 'ia-creer-messages-prospection',
    question: "L'intelligence artificielle peut-elle créer mes messages de prospection ?",
    answer:
      "Oui. Prospecta peut utiliser l'intelligence artificielle pour analyser le contexte d'un prospect et proposer des messages personnalisés. Vous conservez toutefois le contrôle sur les contenus générés : les messages peuvent être modifiés et validés avant leur utilisation dans une campagne.",
  },
  {
    id: 'canaux-prospection-disponibles',
    question: "Quels canaux de prospection sont disponibles ?",
    answer:
      "Prospecta est conçu pour prendre en charge plusieurs canaux de communication, notamment l'email et WhatsApp Business, avec la possibilité d'étendre progressivement les canaux disponibles. Les fonctionnalités accessibles dépendent de la configuration de votre organisation et des intégrations activées.",
  },
  {
    id: 'comment-commencer-avec-prospecta',
    question: "Comment commencer avec Prospecta ?",
    answer:
      "Créez votre compte, configurez votre organisation et définissez votre cible commerciale. Vous pourrez ensuite ajouter ou importer vos prospects, créer votre première campagne et construire une séquence de prospection. Prospecta vous accompagne ensuite dans le suivi des réponses et des opportunités.",
    action: {
      label: "Commencer avec Prospecta",
      href: "/signup",
    },
  },
];

interface FAQSectionProps {
  items?: FAQItem[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  items = defaultFaqItems,
  title = "Foire aux questions",
  subtitle = "Les réponses aux questions les plus fréquentes sur Prospecta.",
  className = "",
}) => {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className={`py-16 md:py-24 border-b border-gray-200 bg-white ${className}`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2
            id="faq-title"
            className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900"
          >
            {title}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-3 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Accordion Container: flat, bordered, no shadow */}
        <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 bg-white overflow-hidden">
          {items.map((item) => {
            const isOpen = openId === item.id;
            const headingId = `faq-question-${item.id}`;
            const panelId = `faq-answer-${item.id}`;

            return (
              <article key={item.id} className="transition-colors">
                <h3>
                  <button
                    type="button"
                    id={headingId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleItem(item.id)}
                    className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left text-sm sm:text-base font-semibold text-gray-900 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors cursor-pointer select-none"
                  >
                    <span className="leading-snug">{item.question}</span>
                    <span
                      className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                        isOpen ? 'rotate-180 text-blue-600' : ''
                      }`}
                      aria-hidden="true"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </span>
                  </button>
                </h3>

                {isOpen && (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={headingId}
                    className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed space-y-4"
                  >
                    <p>{item.answer}</p>
                    {item.action && (
                      <div className="pt-2">
                        <Link to={item.action.href}>
                          <Button
                            size="sm"
                            variant="secondary"
                            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                          >
                            {item.action.label}
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {/* CTA Block post-FAQ */}
        <div className="mt-14 p-6 sm:p-8 border border-gray-200 rounded-lg bg-gray-50/75 text-center max-w-2xl mx-auto space-y-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            Prêt à structurer votre prospection ?
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
            Commencez à utiliser Prospecta et centralisez votre prospection commerciale dans un seul espace.
          </p>
          <div className="pt-1">
            <Link to="/signup">
              <Button size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Commencer avec Prospecta
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
