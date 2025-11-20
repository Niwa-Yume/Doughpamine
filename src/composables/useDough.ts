import { ref, computed, watchEffect } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/composables/useAuth'

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
      const { data, error: err } = await supabase
        .from('levains')
        .select('*')
        .eq('user_id', user.value.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (err) throw err
      levain.value = data ?? null
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

    const nextLastFed = nowISO()
    const nextState = states.value.find((s) => s.name === DEFAULT_FED_STATE)
      ? DEFAULT_FED_STATE
      : levain.value.current_state_name
    const nextStreak = (levain.value.streak ?? 0) + 1

    const { error: err } = await supabase
      .from('levains')
      .update({
        last_fed_at: nextLastFed,
        current_state_name: nextState,
        streak: nextStreak,
      })
      .eq('id', levain.value.id)

    if (err) throw err

    levain.value = {
      ...levain.value,
      last_fed_at: nextLastFed,
      current_state_name: nextState,
      streak: nextStreak,
    }
  }

  async function updateLevainState(stateName: string) {
    if (!levain.value) return

    const { error: err } = await supabase
      .from('levains')
      .update({ current_state_name: stateName })
      .eq('id', levain.value.id)

    if (err) throw err

    levain.value = {
      ...levain.value,
      current_state_name: stateName,
    }
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
    const lastFed = new Date(levain.value.last_fed_at)
    const hungryTime = new Date(lastFed.getTime() + 24 * 60 * 60 * 1000)
    return Math.max(0, hungryTime.getTime() - Date.now())
  })

  const hoursElapsed = computed(() => {
    if (!levain.value?.last_fed_at) return 0
    const diffMs = Date.now() - new Date(levain.value.last_fed_at).getTime()
    return Math.floor(diffMs / (1000 * 60 * 60))
  })

  /**
   * Calcule l'état du levain basé sur le temps écoulé depuis le dernier nourrissage
   */
  function calculateStateFromTime(hoursElapsed: number, currentState: string): string {
    // Si le levain est au frais ou mort, ne pas changer automatiquement
    if (currentState === 'Au frais' || currentState === 'Mort') {
      return currentState;
    }

    // Logique de dégradation basée sur le temps
    if (hoursElapsed >= 72) {
      return 'Mort'; // Plus de 72h (3 jours)
    } else if (hoursElapsed >= 48) {
      return 'Neglige'; // Entre 48h et 72h (2-3 jours)
    } else if (hoursElapsed >= 24) {
      return 'Affame'; // Entre 24h et 48h (1-2 jours)
    } else if (hoursElapsed >= 12) {
      return 'Actif'; // Entre 12h et 24h
    } else {
      return 'Actif/pret'; // Moins de 12h
    }
  }

  /**
   * Met à jour automatiquement l'état du levain basé sur le temps écoulé
   */
  async function updateStateBasedOnTime() {
    if (!levain.value?.last_fed_at) return;

    const hours = hoursElapsed.value;
    const currentState = levain.value.current_state_name;
    const calculatedState = calculateStateFromTime(hours, currentState);

    // Si l'état calculé est différent de l'état actuel, mettre à jour
    if (calculatedState !== currentState) {
      await updateLevainState(calculatedState);
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

  watchEffect((onCleanup) => {
    if (levain.value) {
      // Vérifier immédiatement
      updateStateBasedOnTime();

      // Puis toutes les 5 minutes
      stateCheckInterval = setInterval(() => {
        updateStateBasedOnTime();
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
    calculateStateFromTime,
    lastFedHuman,
    timeUntilHungry,
    hoursElapsed,
  }
}
