<template>
  <ion-page>
    <ModernNavBar />
    <ion-content :fullscreen="true" class="gradient-hero">
      <section class="px-4 py-6 max-w-md mx-auto">
        <!-- État de chargement session/dough -->
        <div v-if="!sessionLoaded" class="flex flex-col items-center justify-center h-[60vh] gap-3">
          <ion-spinner name="crescent"></ion-spinner>
          <p class="text-sm text-[color:var(--ion-text-color)]/70">Chargement…</p>
        </div>

        <!-- Dashboard connecté avec levain -->
        <div v-else-if="isAuthenticated && dough" class="space-y-4">
          <!-- En-tête compact mobile -->
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl glass-surface flex items-center justify-center">
              <ion-img :src="mascotSrc" alt="Mascotte" class="w-10 h-10 object-contain" />
            </div>
            <div class="min-w-0">
              <h1 class="text-xl font-extrabold text-[color:var(--ion-color-primary)] truncate">{{ dough.name }}</h1>
              <div class="flex items-center gap-2 mt-1">
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="statusChipClass">{{ statusLabel }}</span>
                <span class="text-xs text-[color:var(--ion-text-color)]/70">Dernier repas: {{ lastFedHuman }}</span>
              </div>
            </div>
          </div>

          <!-- Carte principale "Duolingo-like" -->
          <div class="glass-surface p-4 rounded-2xl">
            <!-- Streak + dopamine visuals -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="relative w-10 h-10 rounded-xl bg-[color:var(--ion-color-tertiary)]/10 flex items-center justify-center">
                  <IonIcon :icon="flame" class="text-[22px] text-[color:var(--ion-color-tertiary)] flame-flicker" aria-hidden="true"/>
                </div>
                <div>
                  <div class="text-base font-bold text-[color:var(--ion-color-primary)]">🔥 {{ dough.streak }} jours heureux</div>
                  <div class="text-xs text-[color:var(--ion-text-color)]/70">Garde la flamme allumée ✨</div>
                </div>
              </div>
              <button class="text-xs font-semibold text-[color:var(--ion-color-tertiary)]" @click="goToScore">Voir score</button>
            </div>

            <!-- Mascotte au centre -->
            <div class="mt-3 flex justify-center">
              <div class="relative w-40 h-40 rounded-[20px] soft-depth flex items-center justify-center select-none">
                <ion-img :src="mascotSrc" alt="Mascotte Doughpamine" class="w-32 h-32 object-contain" />
                <div class="absolute -inset-2 -z-10 rounded-[24px]" :style="glowStyle"></div>
              </div>
            </div>

            <!-- Actions principales (mobile-first, 1 colonne) -->
            <div class="mt-4 grid grid-cols-1 gap-2">
              <ion-button expand="block" size="large" color="tertiary" class="h-12 font-semibold" @click="onFeed">
                <div class="flex items-center gap-2">
                  <IonIcon :icon="flame" class="text-lg" aria-hidden="true"/>
                  <span>Nourrir</span>
                </div>
              </ion-button>
              <ion-button expand="block" size="large" color="success" fill="outline" class="h-12 font-semibold" @click="onFridge">
                <div class="flex items-center gap-2">
                  <IonIcon :icon="snowIcon" class="text-lg" aria-hidden="true"/>
                  <span>Mettre au frais</span>
                </div>
              </ion-button>
              <ion-button expand="block" size="large" color="secondary" class="h-12 font-semibold" @click="onCustomize">
                <div class="flex items-center gap-2">
                  <IonIcon :icon="colorPalette" class="text-lg" aria-hidden="true"/>
                  <span>Personnaliser</span>
                </div>
              </ion-button>
            </div>
          </div>

          <!-- Aide rapide -->
          <p class="text-center text-xs text-[color:var(--ion-text-color)]/60">Astuce: nourris-le chaque jour pour booster ta streak 💪</p>
        </div>

        <!-- Connecté sans levain: proposition de création -->
        <div v-else-if="isAuthenticated && !dough" class="space-y-4 text-center">
          <div class="glass-surface p-6 rounded-2xl">
            <ion-img src="/assets/mascott/Version de base.png" alt="Mascotte" class="w-24 h-24 mx-auto" />
            <h2 class="mt-2 text-lg font-bold text-[color:var(--ion-color-primary)]">Crée ton levain</h2>
            <p class="text-sm text-[color:var(--ion-text-color)]/70">Tu n’as pas encore de levain lié à ton compte.</p>
            <div class="mt-4 grid grid-cols-1 gap-2">
              <ion-button expand="block" color="tertiary" @click="goCreate">Créer mon levain</ion-button>
              <ion-button expand="block" color="success" fill="outline" @click="goCreate">Lier un levain existant</ion-button>
            </div>
          </div>
        </div>

        <!-- Non connecté: fallback light -->
        <div v-else class="text-center space-y-4">
          <h1 class="text-2xl font-extrabold text-[color:var(--ion-color-primary)]">Nourris ton levain. Nourris ta dopamine. 🍞🔥</h1>
          <p class="text-sm text-[color:var(--ion-text-color)]/70">Connecte-toi pour retrouver ton levain et ta progression.</p>
          <ion-button color="tertiary" @click="goAuth">Se connecter</ion-button>
        </div>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { IonContent, IonPage, IonButton, IonImg, IonIcon, IonSpinner } from '@ionic/vue'
import ModernNavBar from '@/components/ModernNavBar.vue'
import { useRouter } from 'vue-router'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { flame, colorPalette, snow, snowOutline } from 'ionicons/icons'
import { useAuth } from '@/composables/useAuth'
import { useDough } from '@/composables/useDough'

const router = useRouter()
const { user, isAuthenticated, sessionLoaded } = useAuth()
const { dough, feed, refrigerate, lastFedHuman } = useDough()

const snowIcon = snow || snowOutline

const statusLabel = computed(() => {
  switch (dough.value?.status) {
    case 'active': return 'Actif'
    case 'fridge': return 'Au frais'
    default: return 'Affamé'
  }
})
const statusChipClass = computed(() => {
  const s = dough.value?.status
  if (s === 'active') return 'bg-[rgba(167,232,189,0.35)] text-[color:var(--ion-color-success)]'
  if (s === 'fridge') return 'bg-[rgba(0,0,0,0.05)] text-[color:var(--ion-text-color)]/70'
  return 'bg-[rgba(255,138,0,0.15)] text-[color:var(--ion-color-tertiary)]'
})

const mascotSrc = computed(() => {
  const s = dough.value?.status
  if (s === 'active') return '/assets/mascott/Version Active.png'
  return '/assets/mascott/Version de base.png'
})

// Glow décoratif autour de la mascotte
const glowStyle = ref({
  background: 'radial-gradient(120px 120px at 30% 30%, rgba(167,232,189,0.35), transparent 70%),\
               radial-gradient(140px 140px at 70% 70%, rgba(255,179,171,0.3), transparent 70%),\
               radial-gradient(200px 120px at 50% 0%, rgba(255,138,0,0.18), transparent 70%)'
})

// Actions
async function onFeed() {
  try { await Haptics.impact({ style: ImpactStyle.Medium }) } catch {}
  await feed()
}
async function onFridge() {
  try { await Haptics.impact({ style: ImpactStyle.Light }) } catch {}
  await refrigerate()
}
function onCustomize() { router.push('/profile') }

// Navigation
function goToScore() { router.push('/score') }
function goCreate() { router.push('/create-dough') }
function goAuth() { router.push('/auth') }
</script>

<style scoped>
.flame-flicker { animation: flameFlicker 1.2s infinite ease-in-out; }
@keyframes flameFlicker {
  0%, 100% { transform: translateY(0) scale(1); filter: drop-shadow(0 0 6px rgba(255,138,0,0.35)); }
  50% { transform: translateY(-1px) scale(1.05); filter: drop-shadow(0 0 10px rgba(255,138,0,0.55)); }
}
</style>
