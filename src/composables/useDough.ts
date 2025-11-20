import { ref, computed, watchEffect } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/composables/useAuth'

type DoughStatus = 'new' | 'fed' | 'active' | 'hungry' | 'starving' | 'frozen' | 'dead'

export interface Dough {
  id: string
  user_id: string
  name: string
  status: DoughStatus
  age_days?: number | null
  last_fed: string | null
  created_at: string
}

const dough = ref<Dough | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

function nowISO() { return new Date().toISOString() }

export function useDough() {
  const { user, isAuthenticated } = useAuth()

  async function fetchDough() {
    if (!isAuthenticated.value || !user.value?.id) {
      dough.value = null
      return
    }
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('doughs')
        .select('*')
        .eq('user_id', user.value.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!err && data) {
        dough.value = data as Dough
        // Mettre à jour le statut basé sur le temps écoulé
        updateStatus()
      } else {
        dough.value = null
      }
    } catch (e: any) {
      error.value = e?.message ?? 'Unknown error'
      dough.value = null
    } finally {
      loading.value = false
    }
  }

  function updateStatus() {
    if (!dough.value || !dough.value.last_fed) return

    const now = new Date()
    const lastFed = new Date(dough.value.last_fed)
    const hoursElapsed = Math.floor((now.getTime() - lastFed.getTime()) / (1000 * 60 * 60))

    let newStatus: DoughStatus = dough.value.status

    if (dough.value.status === 'frozen') {
      // Ne pas changer le statut si le levain est congelé
      return
    }

    if (hoursElapsed >= 72) {
      newStatus = 'dead' // Plus de 72h
    } else if (hoursElapsed >= 48) {
      newStatus = 'starving' // Entre 48h et 72h
    } else if (hoursElapsed >= 24) {
      newStatus = 'hungry' // Entre 24h et 48h
    } else if (hoursElapsed >= 12) {
      newStatus = 'active' // Entre 12h et 24h
    } else {
      newStatus = 'fed' // Moins de 12h
    }

    if (newStatus !== dough.value.status) {
      dough.value.status = newStatus
      persist()
    }
  }

  async function persist() {
    if (!dough.value) return

    try {
      const { error: err } = await supabase
        .from('doughs')
        .update({
          status: dough.value.status,
          last_fed: dough.value.last_fed,
          age_days: dough.value.age_days
        })
        .eq('id', dough.value.id)

      if (err) throw err
    } catch (e) {
      console.error('Erreur lors de la persistance:', e)
    }
  }

  async function feed() {
    if (!dough.value) return

    dough.value.status = 'fed'
    dough.value.last_fed = nowISO()

    // Incrémenter l'âge si le levain a plus d'un jour
    if (dough.value.age_days !== null && dough.value.age_days !== undefined) {
      dough.value.age_days += 1
    }

    await persist()
  }

  async function freeze() {
    if (!dough.value) return
    dough.value.status = 'frozen'
    await persist()
  }

  async function unfreeze() {
    if (!dough.value) return
    dough.value.status = 'active'
    dough.value.last_fed = nowISO()
    await persist()
  }

  const lastFedHuman = computed(() => {
    if (!dough.value?.last_fed) return 'Jamais'
    const diffMs = Date.now() - new Date(dough.value.last_fed).getTime()
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    if (hours < 1) return 'Il y a quelques minutes'
    if (hours === 1) return 'Il y a 1 heure'
    if (hours < 24) return `Il y a ${hours} heures`
    const days = Math.floor(hours / 24)
    return days === 1 ? 'Il y a 1 jour' : `Il y a ${days} jours`
  })

  const timeUntilHungry = computed(() => {
    if (!dough.value?.last_fed) return 0
    const lastFed = new Date(dough.value.last_fed)
    const hungryTime = new Date(lastFed.getTime() + 24 * 60 * 60 * 1000) // 24h après
    const remaining = hungryTime.getTime() - Date.now()
    return Math.max(0, remaining)
  })

  const hoursElapsed = computed(() => {
    if (!dough.value?.last_fed) return 0
    const diffMs = Date.now() - new Date(dough.value.last_fed).getTime()
    return Math.floor(diffMs / (1000 * 60 * 60))
  })

  // Rafraîchir quand l'utilisateur change
  watchEffect(() => {
    if (isAuthenticated.value) fetchDough()
    else { dough.value = null }
  })

  // Mettre à jour le statut toutes les minutes
  setInterval(() => {
    if (dough.value) updateStatus()
  }, 60000)

  return {
    dough,
    loading,
    error,
    fetchDough,
    feed,
    freeze,
    unfreeze,
    lastFedHuman,
    timeUntilHungry,
    hoursElapsed,
  }
}

