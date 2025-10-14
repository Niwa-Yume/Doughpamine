import { ref, computed, watchEffect } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/composables/useAuth'

type DoughStatus = 'active' | 'hungry' | 'fridge'

export interface Dough {
  id: string
  user_id: string
  name: string
  status: DoughStatus
  streak: number
  lastFedAt: string | null
}

const dough = ref<Dough | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

function nowISO() { return new Date().toISOString() }

function readLocal(): Dough | null {
  try {
    const raw = localStorage.getItem('demo_dough')
    return raw ? JSON.parse(raw) as Dough : null
  } catch { return null }
}
function writeLocal(val: Dough | null) {
  try {
    if (val) localStorage.setItem('demo_dough', JSON.stringify(val))
    else localStorage.removeItem('demo_dough')
  } catch {}
}

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
      // Tentative Supabase
      const { data, error: err } = await supabase
        .from('doughs')
        .select('id,user_id,name,status,streak,lastFedAt')
        .eq('user_id', user.value.id)
        .limit(1)
        .maybeSingle()

      if (!err && data) {
        dough.value = normalize(data as any)
        writeLocal(dough.value)
      } else {
        // Fallback local si pas de table/données
        dough.value = readLocal() ?? createLocalDefault(user.value.id)
        writeLocal(dough.value)
      }
    } catch (e: any) {
      error.value = e?.message ?? 'Unknown error'
      dough.value = readLocal() ?? createLocalDefault(user.value!.id)
    } finally {
      loading.value = false
    }
  }

  function normalize(d: any): Dough {
    return {
      id: d.id ?? cryptoId(),
      user_id: d.user_id,
      name: d.name ?? 'Mon Levain',
      status: (d.status as DoughStatus) ?? 'hungry',
      streak: typeof d.streak === 'number' ? d.streak : 0,
      lastFedAt: d.lastFedAt ?? null,
    }
  }

  function cryptoId() {
    return (typeof crypto !== 'undefined' && 'randomUUID' in crypto) ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2)
  }

  function createLocalDefault(uid: string): Dough {
    return {
      id: cryptoId(),
      user_id: uid,
      name: 'Mon Levain',
      status: 'hungry',
      streak: Number(localStorage.getItem('streakDays') || 0),
      lastFedAt: null,
    }
  }

  async function persist() {
    writeLocal(dough.value)
    // Best effort Supabase
    try {
      if (dough.value) {
        const payload = { ...dough.value }
        await supabase.from('doughs').upsert(payload, { onConflict: 'id' })
      }
    } catch {}
  }

  async function feed() {
    if (!dough.value) return
    const last = dough.value.lastFedAt ? new Date(dough.value.lastFedAt) : null
    const hoursSince = last ? (Date.now() - last.getTime()) / 36e5 : Infinity
    // Incrémente la streak si > 20h depuis le dernier feed (logique simple)
    if (hoursSince > 20) dough.value.streak += 1
    dough.value.status = 'active'
    dough.value.lastFedAt = nowISO()
    await persist()
  }

  async function refrigerate() {
    if (!dough.value) return
    dough.value.status = 'fridge'
    await persist()
  }

  const lastFedHuman = computed(() => {
    if (!dough.value?.lastFedAt) return 'Jamais'
    const diffMs = Date.now() - new Date(dough.value.lastFedAt).getTime()
    const hours = Math.floor(diffMs / 36e5)
    if (hours < 1) return 'Il y a quelques minutes'
    if (hours === 1) return 'Il y a 1 heure'
    if (hours < 24) return `Il y a ${hours} heures`
    const days = Math.floor(hours / 24)
    return days === 1 ? 'Il y a 1 jour' : `Il y a ${days} jours`
  })

  // Rafraîchir quand l’utilisateur change
  watchEffect(() => {
    if (isAuthenticated.value) fetchDough()
    else { dough.value = null }
  })

  return {
    dough,
    loading,
    error,
    fetchDough,
    feed,
    refrigerate,
    lastFedHuman,
  }
}

