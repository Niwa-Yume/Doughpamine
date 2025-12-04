import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface StreakData {
  currentStreak: number
  lastFeedDate: string | null
  bestStreak: number
}

const STORAGE_KEY = 'doughpamine_streak'

export const useStreakStore = defineStore('streak', () => {
  // État
  const currentStreak = ref(0)
  const lastFeedDate = ref<string | null>(null)
  const bestStreak = ref(0)

  // Charger les données depuis le localStorage
  function loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data: StreakData = JSON.parse(stored)
        currentStreak.value = data.currentStreak || 0
        lastFeedDate.value = data.lastFeedDate || null
        bestStreak.value = data.bestStreak || 0
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la streak depuis localStorage:', error)
    }
  }

  // Sauvegarder dans le localStorage
  function saveToStorage() {
    try {
      const data: StreakData = {
        currentStreak: currentStreak.value,
        lastFeedDate: lastFeedDate.value,
        bestStreak: bestStreak.value
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la streak dans localStorage:', error)
    }
  }

  // Mettre à jour la streak lors d'un nourrissage
  function updateStreakOnFeed() {
    const now = new Date()
    const today = now.toISOString().split('T')[0]

    if (!lastFeedDate.value) {
      // Premier nourrissage
      currentStreak.value = 1
      lastFeedDate.value = today
    } else {
      const lastDate = new Date(lastFeedDate.value)
      const lastDay = lastDate.toISOString().split('T')[0]

      if (lastDay === today) {
        // Déjà nourri aujourd'hui, ne rien faire
        return
      }

      // Calculer la différence en jours
      const diffTime = now.getTime() - lastDate.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        // Nourrissage consécutif
        currentStreak.value++
      } else if (diffDays > 1) {
        // Streak cassée
        currentStreak.value = 1
      }

      lastFeedDate.value = today
    }

    // Mettre à jour le meilleur streak si nécessaire
    if (currentStreak.value > bestStreak.value) {
      bestStreak.value = currentStreak.value
    }

    saveToStorage()
  }

  // Réinitialiser la streak
  function resetStreak() {
    currentStreak.value = 0
    lastFeedDate.value = null
    saveToStorage()
  }

  // Réinitialiser complètement (incluant bestStreak)
  function resetAll() {
    currentStreak.value = 0
    lastFeedDate.value = null
    bestStreak.value = 0
    saveToStorage()
  }

  // Vérifier si la streak doit être cassée (si le levain n'a pas été nourri depuis plus de 24h)
  function checkStreakExpiry() {
    if (!lastFeedDate.value) return

    const now = new Date()
    const lastDate = new Date(lastFeedDate.value)
    const diffTime = now.getTime() - lastDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays > 1) {
      // Plus de 24h sans nourrissage, réinitialiser la streak
      currentStreak.value = 0
      saveToStorage()
    }
  }

  // Charger les données au démarrage
  loadFromStorage()

  return {
    // État
    currentStreak: computed(() => currentStreak.value),
    lastFeedDate: computed(() => lastFeedDate.value),
    bestStreak: computed(() => bestStreak.value),

    // Actions
    updateStreakOnFeed,
    resetStreak,
    resetAll,
    checkStreakExpiry,
    loadFromStorage
  }
})

