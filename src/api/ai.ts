import type { Channel } from '../types';

export const aiApi = {
  async generateCampaignMessage(params: {
    channel: Channel;
    objective: string;
    icp: string;
    stepNumber: number;
  }): Promise<{ subject?: string; content: string }> {
    await new Promise((r) => setTimeout(r, 600));

    if (params.channel === 'whatsapp') {
      return {
        content: `Bonjour {{firstName}},\n\nJe me permets de vous contacter car j'ai vu votre rôle clé chez {{companyName}} à {{city}}.\n\nNous aidons les entreprises du secteur à automatiser la qualification de leurs prospects commerciaux et à obtenir des rendez-vous ciblés.\n\nSeriez-vous ouvert à échanger 10 minutes cette semaine ?\n\nBien cordialement,\nMor Keblink — Prospecta`,
      };
    }

    if (params.stepNumber === 1) {
      return {
        subject: 'Opportunités de croissance commerciale chez {{companyName}}',
        content: `Bonjour {{firstName}},\n\nJ'ai suivi avec intérêt le positionnement de {{companyName}} sur le marché à {{city}}.\n\nDans votre secteur, la prospection manuelle consomme souvent jusqu'à 60% du temps des équipes commerciales, au détriment de la clôture des affaires.\n\nProspecta vous permet de cibler les entreprises pertinentes au Sénégal, de personnaliser vos approches (Email et WhatsApp) et de ne consacrer votre temps qu'aux prospects réellement qualifiés.\n\nAuriez-vous 15 minutes ce jeudi ou vendredi pour un rapide point d'étape ?\n\nBien à vous,\nMor Keblink\nDirecteur Commercial — Prospecta Sénégal`,
      };
    }

    return {
      subject: 'Relance suite à mon message — {{firstName}}',
      content: `Bonjour {{firstName}},\n\nJe fais suite à mon précédent message concernant la gestion de votre prospection commerciale chez {{companyName}}.\n\nSi le sujet n'est pas prioritaire ce mois-ci, n'hésitez pas à me l'indiquer. Dans le cas contraire, seriez-vous disponible la semaine prochaine pour un rapide échange ?\n\nBien cordialement,\nMor Keblink`,
    };
  },

  async generateConversationReply(params: {
    lastMessage: string;
    prospectName: string;
    companyName: string;
  }): Promise<string> {
    await new Promise((r) => setTimeout(r, 500));

    const lower = params.lastMessage.toLowerCase();
    if (lower.includes('tarif') || lower.includes('prix') || lower.includes('coût')) {
      return `Bonjour ${params.prospectName}, merci pour votre intérêt. Nos offres débutent à 50 000 FCFA/mois (Starter) et s'adaptent selon la taille de votre équipe commerciale. Seriez-vous disponible pour un court appel afin d'adapter la proposition aux objectifs de ${params.companyName} ?`;
    }

    if (lower.includes('rendez-vous') || lower.includes('disponible') || lower.includes('démonstration') || lower.includes('demo')) {
      return `Bonjour ${params.prospectName}, c'est noté avec plaisir ! Je vous propose ce jeudi à 11h00 (heure de Dakar) ou vendredi à 15h00 pour une démonstration ciblée. Quel créneau vous conviendrait le mieux ?`;
    }

    return `Bonjour ${params.prospectName}, merci pour votre retour. Nous serions ravis d'approfondir ce point ensemble. Quelle serait la meilleure façon de caler un échange de 15 minutes cette semaine ?`;
  },
};
