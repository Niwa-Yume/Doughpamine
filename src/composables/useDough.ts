import { ref, computed, watchEffect } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/composables/useAuth'
import {
    shouldAutoTransition,
    STATE_DB_TO_MACHINE,
    STATE_MACHINE_TO_DB,
    LEVAIN_STATE_MACHINE, parseDelayHours
} from '@/config/levainStateMachine'

export interface LevainState {
  name: string
  description?: string | null
}

export interface Levain {
  id: string
  user_id: string
  name: string
  current_state_name: string
  last_fed_at: string | null
  streak: number
  skin: string
  created_at: string
}

const levain = ref<Levain | null>(null)
const states = ref<LevainState[]>([])
const loadingLevain = ref(false)
const loadingStates = ref(false)
const error = ref<string | null>(null)
const statesError = ref<string | null>(null)

const DEFAULT_FED_STATE = 'Actif/pret'

function nowISO() { return new Date().toISOString() }

export function useDough() {
  const { user, isAuthenticated } = useAuth()

  async function fetchLevain() {
    if (!isAuthenticated.value || !user.value?.id) {
      levain.value = null
      return
    }

    loadingLevain.value = true
    error.value = null

    try {
      // Prendre le levain le plus récent (gère le cas de plusieurs levains)
      const { data: levainList, error: err } = await supabase
        .from('levains')
        .select('*')
        .eq('user_id', user.value.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (err) throw err
      levain.value = (levainList && levainList.length > 0) ? levainList[0] : null
    } catch (e: any) {
      error.value = e?.message ?? 'Impossible de récupérer le levain'
      levain.value = null
    } finally {
      loadingLevain.value = false
    }
  }

  async function fetchLevainStates() {
    loadingStates.value = true
    statesError.value = null

    try {
      const { data, error: err } = await supabase
        .from('levain_states')
        .select('name, description')
        .order('name', { ascending: true })

      if (err) throw err
      states.value = data ?? []
    } catch (e: any) {
      statesError.value = e?.message ?? 'Impossible de récupérer les états'
      states.value = []
    } finally {
      loadingStates.value = false
    }
  }

    async function feedLevain() {
        if (!levain.value) return

        const currentStateMachine = STATE_DB_TO_MACHINE[levain.value.current_state_name];
        const stateConfig = currentStateMachine ? LEVAIN_STATE_MACHINE.states[currentStateMachine] : null;

        const nextLastFed = nowISO();
        let nextState = levain.value.current_state_name;

        if (stateConfig?.actions.nourrir) {
            const nourrirAction = stateConfig.actions.nourrir;
            const nextMachineState = nourrirAction.to;
            nextState = STATE_MACHINE_TO_DB[nextMachineState] || nextState;
        } else {
            nextState = DEFAULT_FED_STATE;
        }


        const { error: err } = await supabase
            .from('levains')
            .update({
                last_fed_at: nextLastFed,
                current_state_name: nextState
            })
            .eq('id', levain.value.id)

        if (err) throw err

        // ✅ 4. Mettre à jour l'état local
        levain.value = {
            ...levain.value,
            last_fed_at: nextLastFed,
            current_state_name: nextState
        }
    }


    async function updateLevainState(stateName: string) {
    if (!levain.value) return

    // Quand on change manuellement l'état, on met à jour last_fed_at
    // pour éviter les transitions automatiques immédiates
    const now = nowISO();

    const { error: err } = await supabase
      .from('levains')
      .update({
        current_state_name: stateName,
        last_fed_at: now
      })
      .eq('id', levain.value.id)

    if (err) throw err

    levain.value = {
      ...levain.value,
      current_state_name: stateName,
      last_fed_at: now
    }
  }

  /**
   * Met le levain au frais (réfrigérateur)
   */
  async function mettreAuFrais() {
    if (!levain.value) return;

    const nextState = STATE_MACHINE_TO_DB['au_frais'];

    const { error: err } = await supabase
      .from('levains')
      .update({
        current_state_name: nextState
      })
      .eq('id', levain.value.id);

    if (err) throw err;

    levain.value = {
      ...levain.value,
      current_state_name: nextState
    };

  }

  /**
   * Sort le levain du frais (retour à température ambiante)
   */
  async function sortirDuFrais() {
    if (!levain.value) return;

    const nextState = STATE_MACHINE_TO_DB['actif'];

    const { error: err } = await supabase
      .from('levains')
      .update({
        current_state_name: nextState
      })
      .eq('id', levain.value.id);

    if (err) throw err;

    levain.value = {
      ...levain.value,
      current_state_name: nextState
    };

  }

  /**
   * Renomme le levain
   * @param newName - Le nouveau nom du levain
   */
  async function renameLevain(newName: string) {
    if (!levain.value) return;

    const trimmedName = newName.trim();
    if (!trimmedName) {
      throw new Error('Le nom ne peut pas être vide');
    }

    const { error: err } = await supabase
      .from('levains')
      .update({
        name: trimmedName
      })
      .eq('id', levain.value.id);

    if (err) throw err;

    levain.value = {
      ...levain.value,
      name: trimmedName
    };
  }

  const lastFedHuman = computed(() => {
    if (!levain.value?.last_fed_at) return 'Jamais'
    const diffMs = Date.now() - new Date(levain.value.last_fed_at).getTime()
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    if (hours < 1) return 'Il y a quelques minutes'
    if (hours === 1) return 'Il y a 1 heure'
    if (hours < 24) return `Il y a ${hours} heures`
    const days = Math.floor(hours / 24)
    return days === 1 ? 'Il y a 1 jour' : `Il y a ${days} jours`
  })

    const timeUntilHungry = computed(() => {
        if (!levain.value?.last_fed_at) return 0

        const machineState = STATE_DB_TO_MACHINE[levain.value.current_state_name]

        const stateConfig = machineState ? LEVAIN_STATE_MACHINE.states[machineState] : null
        const rienFaireAction = stateConfig?.actions.rien_faire


        if (!rienFaireAction?.delay_h) return 0

        const delayHours = parseDelayHours(rienFaireAction.delay_h) || 24

        const lastFed = new Date(levain.value.last_fed_at)
        const transitionTime = new Date(lastFed.getTime() + delayHours * 60 * 60 * 1000)

        return Math.max(0, transitionTime.getTime() - Date.now())
    })




    const hoursElapsed = computed(() => {
    if (!levain.value?.last_fed_at) return 0
    const diffMs = Date.now() - new Date(levain.value.last_fed_at).getTime()
    return Math.floor(diffMs / (1000 * 60 * 60))
  })

  /**
   * Met à jour automatiquement l'état du levain basé sur le temps écoulé
   * Utilise la machine à états définie dans levainStateMachine.ts
   */
  async function updateStateBasedOnTime() {
    if (!levain.value) return;

    const lastActionAt = levain.value.last_fed_at
      ? new Date(levain.value.last_fed_at)
      : new Date(levain.value.created_at);

    console.log('🕐 updateStateBasedOnTime:', {
      currentState: levain.value.current_state_name,
      lastActionAt,
      now: new Date()
    });

    const { shouldTransition, nextState } = shouldAutoTransition(
      levain.value.current_state_name,
      lastActionAt,
      null // On n'a pas au_frais_since pour l'instant
    );


    if (shouldTransition && nextState) {

      const { error: err } = await supabase
        .from('levains')
        .update({
          current_state_name: nextState
        })
        .eq('id', levain.value.id);

      if (err) {
        return;
      }

      levain.value = {
        ...levain.value,
        current_state_name: nextState
      };

    } else {
      console.log('⏸️ Pas de transition nécessaire');
    }
  }

  watchEffect(() => {
    if (isAuthenticated.value && user.value?.id) {
      fetchLevain()
      fetchLevainStates()
    } else {
      levain.value = null
      states.value = []
    }
  })

  // Vérifier et mettre à jour l'état toutes les 5 minutes
  let stateCheckInterval: NodeJS.Timeout | null = null;
  let isCheckingState = false; // Empêche les vérifications concurrentes

  watchEffect((onCleanup) => {
    if (levain.value && !isCheckingState) {
      // Vérifier immédiatement (avec un petit délai pour éviter les cascades)
      setTimeout(() => {
        if (!isCheckingState) {
          isCheckingState = true;
          updateStateBasedOnTime().finally(() => {
            isCheckingState = false;
          });
        }
      }, 100);

      // Puis toutes les 5 minutes
      if (stateCheckInterval) {
        clearInterval(stateCheckInterval);
      }

      stateCheckInterval = setInterval(() => {
        if (!isCheckingState) {
          isCheckingState = true;
          updateStateBasedOnTime().finally(() => {
            isCheckingState = false;
          });
        }
      }, 5 * 60 * 1000); // 5 minutes
    }

    onCleanup(() => {
      if (stateCheckInterval) {
        clearInterval(stateCheckInterval);
        stateCheckInterval = null;
      }
    });
  });

  return {
    levain,
    states,
    loadingLevain,
    loadingStates,
    error,
    statesError,
    fetchLevain,
    fetchLevainStates,
    feedLevain,
    updateLevainState,
    updateStateBasedOnTime,
    mettreAuFrais,
    sortirDuFrais,
    renameLevain,
    lastFedHuman,
    timeUntilHungry,
    hoursElapsed,
    hasLevain: computed(() => !!levain.value),
  }
}
