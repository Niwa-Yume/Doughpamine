<template>
  <ion-page>
    <ion-content class="flex [--background:var(--ion-background-color)]" :fullscreen="true">
      <div class="w-full max-w-[480px] mx-auto px-[1.4rem] flex flex-col items-center sm:pt-[3.2rem]">
        <div class="text-center mb-5">
          <div class="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4">
            <ion-img src="/assets/mascott/avec background.png" alt="Logo" class="w-full h-full object-cover" />
          </div>
          <h1 class="text-[26px] mx-auto mb-2 text-[var(--ion-color-primary)] font-bold text-center">Doughpamine</h1>
          <p class="mt-1 text-sm text-[var(--ion-text-color)] opacity-80">Cuisine & dopamine, connecte-toi 🍪</p>
        </div>

        <ion-segment
          value="mode"
          class="mb-6 w-full h-12 rounded-2xl bg-[#DCC7A5]/30 p-1 shadow-inner"
          @ionChange="toggleMode($event.detail.value)"
        >
          <ion-segment-button
            value="login"
            :checked="mode==='login'"
            class="h-10 rounded-xl transition-all duration-200"
          >
            <ion-label class="font-semibold text-sm">Connexion</ion-label>
          </ion-segment-button>
          <ion-segment-button
            value="signup"
            :checked="mode==='signup'"
            class="h-10 rounded-xl transition-all duration-200"
          >
            <ion-label class="font-semibold text-sm">Inscription</ion-label>
          </ion-segment-button>
        </ion-segment>

        <form class="w-full bg-white border border-[var(--app-color-highlight)] rounded-[18px] p-5 flex flex-col gap-3 shadow-[0_4px_14px_rgba(0,0,0,0.05)]" @submit.prevent="handleSubmit">
          <div class="mb-4">
            <ion-label class="font-semibold mb-2 text-[var(--ion-text-color)]">Email</ion-label>
            <div class="border-2 border-[var(--app-color-highlight)] rounded-xl overflow-hidden">
              <ion-input type="email" v-model.trim="email" required autocomplete="email" inputmode="email" class="px-3 py-2.5 text-base text-[var(--ion-color-dark)]" />
            </div>
          </div>

          <div class="mb-4">
            <ion-label class="font-semibold mb-2 text-[var(--ion-text-color)]">Mot de passe</ion-label>
            <div class="border-2 border-[var(--app-color-highlight)] rounded-xl overflow-hidden">
              <ion-input type="password" v-model="password" required autocomplete="current-password" class="px-3 py-2.5 text-base text-[var(--ion-color-dark)]" />
            </div>
          </div>

          <div v-if="mode==='signup'" class="mb-4">
            <ion-label class="font-semibold mb-2 text-[var(--ion-text-color)]">Confirmer le mot de passe</ion-label>
            <div class="border-2 border-[var(--app-color-highlight)] rounded-xl overflow-hidden">
              <ion-input type="password" v-model="confirm" required autocomplete="new-password" class="px-3 py-2.5 text-base text-[var(--ion-color-dark)]" />
            </div>
          </div>

          <div class="min-h-[22px] flex flex-col gap-1 text-[13px]">
            <ion-text v-if="error" color="danger">{{ error }}</ion-text>
            <ion-text v-if="info" color="secondary">{{ info }}</ion-text>
          </div>

            <ion-button type="submit" expand="block" :disabled="loading">
              <template v-if="!loading">{{ mode==='login' ? 'Se connecter' : 'Créer un compte' }}</template>
              <ion-spinner v-else name="crescent" />
            </ion-button>

          <div class="mt-2.5 text-center" v-if="mode==='login'">
            <button type="button" class="bg-transparent border-0 font-semibold text-[13px] cursor-pointer" >Pas encore de compte ? <a class="test text-blue-500 hover:underline" @click="switchToSignup">Inscription</a> </button>
          </div>
          <div class="mt-2.5 text-center" v-else>
            <button type="button" class="bg-transparent border-0 text-[var(--ion-color-primary)] font-semibold text-[13px] cursor-pointer" @click="switchToLogin">Déjà un compte ? <a class="test text-blue-500 hover:underline" @click="switchToLogin"> Connexion </a> </button>
          </div>
        </form>

        <div class="mt-3">
          <ion-button class="text-white" fill="outline" size="small" @click="goHome">Retour Accueil</ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { supabase } from '@/lib/supabaseClient';
import {
  IonPage, IonContent, IonItem, IonLabel, IonInput, IonButton,
  IonText, IonSpinner, IonSegment, IonSegmentButton, IonImg
} from '@ionic/vue';

const router = useRouter();
const route = useRoute();

const mode = ref<'login' | 'signup'>('login');
const email = ref('');
const password = ref('');
const confirm = ref('');
const loading = ref(false);
const error = ref('');
const info = ref('');

function toggleMode(val: any) {
  if (val === 'login' || val === 'signup') {
    mode.value = val;
    resetMessages();
  }
}
function switchToSignup() { mode.value = 'signup'; resetMessages(); }
function switchToLogin() { mode.value = 'login'; resetMessages(); }
function resetMessages() { error.value = ''; info.value = ''; }

function inferModeFromRoute() {
  const path = route.path.toLowerCase();
  const qMode = (route.query.mode as string)?.toLowerCase();
  if (qMode === 'signup' || qMode === 'register') { mode.value = 'signup'; return; }
  if (qMode === 'login') { mode.value = 'login'; return; }
  if (path.includes('signup') || path.includes('register')) { mode.value = 'signup'; return; }
  mode.value = 'login';
}

onMounted(() => {
  inferModeFromRoute();
});

async function handleSubmit() {
  resetMessages();
  if (!email.value || !password.value) {
    error.value = 'Champs requis.';
    return;
  }
  if (mode.value === 'signup' && password.value !== confirm.value) {
    error.value = 'Les mots de passe ne correspondent pas.';
    return;
  }
  loading.value = true;
  try {
    if (mode.value === 'login') {
      const { error: e } = await supabase.auth.signInWithPassword({ email: email.value, password: password.value });
      if (e) throw e;
      const redirect = (route.query.redirect as string) || '/profile';
      router.replace(redirect);
    } else {
      const { error: e, data } = await supabase.auth.signUp({ email: email.value, password: password.value });
      if (e) throw e;
      if (data.user && !data.session) {
        info.value = 'Compte créé. Vérifie ta boîte mail pour confirmer ton adresse.';
      } else {
        info.value = 'Compte créé !';
        router.replace('/profile');
      }
    }
  } catch (e: any) {
    error.value = e.message || 'Erreur inconnue.';
  } finally {
    loading.value = false;
  }
}

function goHome() { router.push('/home'); }
</script>

<style scoped>
.test{
  color: blue!important;
}

ion-segment {
  --background: transparent;
}

ion-segment-button {
  --color: #7B5E3B;
  --color-checked: #7B5E3B;
  --indicator-color: #DCC7A5;
  --indicator-height: 100%;
  --padding-top: 0;
  --padding-bottom: 0;
  min-height: 2.5rem;
}

ion-segment-button::part(indicator-background) {
  box-shadow: 0 2px 8px rgba(123, 94, 59, 0.15);
}
</style>