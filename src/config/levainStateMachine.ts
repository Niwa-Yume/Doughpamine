
export interface StateAction {
  to: string;
  delay_h?: number | string; // Nombre d'heures ou "2-4" (range)
  count?: number; // Nombre de fois nécessaire (ex: 2 nourrissages)
  max_h?: number; // Durée maximale autorisée
}

export interface LevainState {
  label: string;
  max_delay_h?: number;
  actions: {
    nourrir?: StateAction;
    rien_faire?: StateAction;
    mettre_au_frais?: StateAction;
    sortir?: StateAction;
  };
}

export interface LevainStateMachine {
  initial_state: string;
  states: Record<string, LevainState>;
}

// Mapping noms BDD → noms dans l'app
export const STATE_DB_TO_MACHINE: Record<string, string> = {
    'Jeune': 'jeune',
    'Actif': 'actif',
    'Actif/pret': 'prêt',
    'Affame': 'affamé',
    'Neglige': 'négligé',
    'Au frais': 'au_frais',
    'Mort': 'mort'
};

export const STATE_MACHINE_TO_DB: Record<string, string> = {
    'jeune': 'Jeune',
    'actif': 'Actif',
    'prêt': 'Actif/pret',
    'affamé': 'Affame',
    'négligé': 'Neglige',
    'au_frais': 'Au frais',
    'mort': 'Mort'
};

// Mapping pour l'affichage avec accents UTF-8
export const STATE_DISPLAY_NAMES: Record<string, string> = {
    'Jeune': 'Jeune',
    'Actif': 'Actif',
    'Actif/pret': 'Actif/prêt',
    'Affame': 'Affamé',
    'Neglige': 'Négligé',
    'Au frais': 'Au frais',
    'Mort': 'Mort'
};


export const LEVAIN_STATE_MACHINE: LevainStateMachine = {
  initial_state: 'jeune', // État initial pour un levain créé from scratch
  states: {
    jeune: {
      label: 'Jeune levain en incubation',
      max_delay_h: 168, // 7 jours maximum
      actions: {
        nourrir: { to: 'jeune' }, // Le levain reste jeune quand on le nourrit
        rien_faire: { to: 'actif', delay_h: 144 } // Après 6 jours (144h), il devient actif automatiquement
      }
    },

    actif: {
      label: 'Levain actif',
      max_delay_h: 24,
      actions: {
        nourrir: { to: 'prêt', delay_h: '2-4' },
        rien_faire: { to: 'affamé', delay_h: 24 },
        mettre_au_frais: { to: 'au_frais' }
      }
    },

    prêt: {
      label: 'Levain prêt à l\'emploi',
      max_delay_h: 24,
      actions: {
        rien_faire: { to: 'actif', delay_h: 0.5 },
        mettre_au_frais: { to: 'au_frais', max_h: 504 },
        nourrir: { to: 'prêt', delay_h: '2-4' }
      }
    },

    affamé: {
      label: 'Levain affamé',
      max_delay_h: 12,
      actions: {
        nourrir: { to: 'actif', delay_h: '2-4' },
        rien_faire: { to: 'négligé', delay_h: 12 },
        mettre_au_frais: { to: 'au_frais' }
      }
    },

    négligé: {
      label: 'Levain négligé',
      max_delay_h: 24,
      actions: {
        nourrir: { to: 'affamé' },
        rien_faire: { to: 'mort', delay_h: 24 },
        mettre_au_frais: { to: 'au_frais' }
      }
    },

    au_frais: {
      label: 'Levain conservé au réfrigérateur',
      max_delay_h: 504,
      actions: {
        sortir: { to: 'actif' },
        rien_faire: { to: 'mort', delay_h: 504 }
      }
    },

    mort: {
      label: 'Levain mort (irréversible)',
      actions: {
        nourrir: { to: 'jeune' } // Relancer le levain : retour à la phase d'incubation
      }
    }
  }
};

/**
 * Récupère le label d'affichage complet avec les accents UTF-8 corrects
 */
export function getStateLabel(dbStateName: string): string {
  const machineStateName = STATE_DB_TO_MACHINE[dbStateName];
  if (!machineStateName) return dbStateName;

  const state = LEVAIN_STATE_MACHINE.states[machineStateName];
  return state?.label || dbStateName;
}

/**
 * Récupère le nom court de l'état avec les accents UTF-8 corrects
 * Ex: "Affame" → "Affamé", "Neglige" → "Négligé"
 */
export function getStateDisplayName(dbStateName: string): string {
  return STATE_DISPLAY_NAMES[dbStateName] || dbStateName;
}

/**
 * Calcule le délai en heures (gère "2-4" → retourne la moyenne)
 */
export function parseDelayHours(delay: number | string | undefined): number | null {
  if (!delay) return null;

  if (typeof delay === 'number') return delay;

  // Parse "2-4" → moyenne = 3
  const match = delay.match(/^(\d+)-(\d+)$/);
  if (match) {
    const min = parseInt(match[1]);
    const max = parseInt(match[2]);
    return (min + max) / 2;
  }

  return parseInt(delay) || null;
}

/**
 * Vérifie si une transition automatique doit se produire
 */
export function shouldAutoTransition(
  currentStateName: string,
  lastActionAt: Date,
  auFraisSince: Date | null
): { shouldTransition: boolean; nextState: string | null } {

  const machineStateName = STATE_DB_TO_MACHINE[currentStateName];
  if (!machineStateName) {
    return { shouldTransition: false, nextState: null };
  }

  const state = LEVAIN_STATE_MACHINE.states[machineStateName];
  if (!state) {
    return { shouldTransition: false, nextState: null };
  }

  // Pas de transition automatique pour "mort"
  if (machineStateName === 'mort') {
    return { shouldTransition: false, nextState: null };
  }

  // Cas spécial : au_frais
  if (machineStateName === 'au_frais') {
    if (!auFraisSince) return { shouldTransition: false, nextState: null };

    const hoursAtFrais = (Date.now() - auFraisSince.getTime()) / (1000 * 60 * 60);
    const maxHours = state.max_delay_h || 504;

    if (hoursAtFrais >= maxHours) {
      // Trop longtemps au frais → mort
      return { shouldTransition: true, nextState: STATE_MACHINE_TO_DB['mort'] };
    }

    return { shouldTransition: false, nextState: null };
  }

  // Transition "rien_faire"
  const rienFaireAction = state.actions.rien_faire;
  if (!rienFaireAction) {
    return { shouldTransition: false, nextState: null };
  }

  const delayHours = parseDelayHours(rienFaireAction.delay_h);
  if (!delayHours) {
    return { shouldTransition: false, nextState: null };
  }

  const hoursElapsed = (Date.now() - lastActionAt.getTime()) / (1000 * 60 * 60);

  console.log('⏱️ Vérification délai:', {
    machineStateName,
    delayHours,
    hoursElapsed,
    shouldTransition: hoursElapsed >= delayHours,
    nextState: rienFaireAction.to
  });

  if (hoursElapsed >= delayHours) {
    const nextMachineState = rienFaireAction.to;
    const nextDBState = STATE_MACHINE_TO_DB[nextMachineState];

    return { shouldTransition: true, nextState: nextDBState };
  }

  return { shouldTransition: false, nextState: null };
}

