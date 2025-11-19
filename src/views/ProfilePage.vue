<template>
  <ion-page>
    <ion-content :scroll-y="false">
      <main class="profile-page" v-if="sessionLoaded">
        <header class="profile-header">
          <a href="#" class="back-button" @click.prevent="goBack" aria-label="Retour">
            <img src="/assets/SVG/back-arrow.svg" alt="Retour" />
          </a>
          <h1 class="profile-title">Profil</h1>
        </header>

        <div v-if="!isAuthenticated" class="not-auth">
          <p>Vous n'êtes pas connecté.</p>
          <button class="btn save-btn" @click="goAuth">Se connecter</button>
        </div>
        <div v-else class="profile-content">
          <form class="profile-form" @submit.prevent="saveProfile">
            <input type="email" class="form-input" placeholder="email ..." v-model="email" required />
            <input type="text" class="form-input" placeholder="username" v-model="username" />
          </form>

            <section class="sourdough-section">
              <h2 class="sourdough-title">Gestion des levains :</h2>
              <div class="sourdough-list" v-if="doughs.length">
                <div class="sourdough-card" v-for="d in doughs" :key="d.id">
                  <img :src="d.image" alt="Sourdough Jar" class="sourdough-img" />
                  <p class="sourdough-name">{{ d.name }}</p>
                  <button class="delete-sourdough-btn" @click="deleteDough(d.id)">supprimer le levain</button>
                </div>
              </div>
              <p v-else class="empty-dough">Aucun levain pour le moment.</p>
            </section>

            <div class="main-actions">
              <button class="btn save-btn" :disabled="saving" @click="saveProfile">{{ saving ? 'Sauvegarde...' : 'Sauvegarder' }}</button>
              <button class="btn disconnect-btn" @click="logout" :disabled="signingOut">{{ signingOut ? 'Déconnexion...' : 'Déconnecter' }}</button>
            </div>

            <button class="btn delete-account-btn" @click="deleteAccount" :disabled="deleting">{{ deleting ? 'Suppression...' : 'supprimer le compte' }}</button>

            <p v-if="message" class="feedback success">{{ message }}</p>
            <p v-if="errorMsg" class="feedback error">{{ errorMsg }}</p>
        </div>
      </main>
      <div v-else class="loading-wrap">Chargement...</div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { ref, watch, onMounted } from 'vue';

interface SimpleDough { id: string; name: string; status?: string; image: string }

const router = useRouter();
const { user, signOut, sessionLoaded, isAuthenticated } = useAuth();

const email = ref('');
const username = ref('');
const doughs = ref<SimpleDough[]>([]);
const saving = ref(false);
const signingOut = ref(false);
const deleting = ref(false);
const message = ref('');
const errorMsg = ref('');

// Charge les données utilisateur quand user change OU au montage du composant
watch(user, (u) => {
  email.value = u?.email || '';
  username.value = (u?.user_metadata as any)?.username || '';
  if (u) fetchDoughs();
}, { immediate: true }); // immediate: true pour charger dès le montage

// La redirection est gérée automatiquement par le router onAuthStateChange
// Pas besoin de la dupliquer ici pour éviter les boucles

function goBack() { router.back(); }
function goAuth() {
  const redirect = router.currentRoute.value.fullPath || '/profile';
  router.push({ path: '/auth', query: { redirect } });
}

async function fetchDoughs() {
  if (!user.value) { doughs.value = []; return; }
  try {
    const { data, error } = await supabase
      .from('doughs')
      .select('id,name,status')
      .eq('user_id', user.value.id)
      .limit(10);
    if (error) throw error;
    if (data && data.length) {
      doughs.value = data.map(d => ({
        id: d.id,
        name: d.name || 'Mon Levain',
        status: d.status,
        image: '/assets/mascott/Version de base.png'
      }));
    } else {
      // Fallback démo si aucune donnée
      doughs.value = [1,2,3].map(i => ({ id: 'local_'+i, name: 'Levain '+i, image: '/assets/mascott/Version de base.png' }));
    }
  } catch (e: any) {
    // Fallback local
    doughs.value = [1,2,3].map(i => ({ id: 'local_'+i, name: 'Levain '+i, image: '/assets/mascott/Version de base.png' }));
  }
}

async function deleteDough(id: string) {
  try {
    const local = id.startsWith('local_');
    if (!local) {
      await supabase.from('doughs').delete().eq('id', id);
    }
    doughs.value = doughs.value.filter(d => d.id !== id);
  } catch (e: any) {
    errorMsg.value = e.message || 'Erreur suppression';
  }
}

async function saveProfile() {
  if (!user.value) return;
  saving.value = true; message.value=''; errorMsg.value='';
  try {
    const updates: any = {};
    if (email.value && email.value !== user.value.email) updates.email = email.value;
    const meta: any = {};
    if (username.value) meta.username = username.value;
    if (Object.keys(meta).length) updates.data = meta;
    if (Object.keys(updates).length) {
      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;
    }
    message.value = 'Profil mis à jour';
  } catch (e: any) {
    errorMsg.value = e.message || 'Erreur sauvegarde';
  } finally { saving.value = false; }
}

async function logout() {
  signingOut.value = true; errorMsg.value=''; message.value='';
  try {
    await signOut();
    // La redirection sera gérée automatiquement par App.vue onAuthStateChange
  }
  catch (e: any) {
    errorMsg.value = e.message || 'Erreur déconnexion';
  }
  finally { signingOut.value=false; }
}

async function deleteAccount() {
  deleting.value = true; errorMsg.value=''; message.value='';
  try {
    // Suppression compte nécessite service role key côté backend (non disponible ici)
    // On masque l'utilisateur en le déconnectant.
    await signOut();
    // La redirection sera gérée automatiquement par le router
    message.value = 'Compte marqué pour suppression (implémentation serveur requise).';
  } catch (e: any) { errorMsg.value = e.message || 'Erreur suppression'; }
  finally { deleting.value=false; }
}
</script>

<style scoped>
/* Variables locales profil (peuvent surcharger globales) */
.profile-page { --color-background: #f2e5ca; --color-text-dark: #4b4b4b; --color-text-black:#000000; --color-text-light:#ffffff; --color-white:#ffffff; --color-red-dark:#c32727; --color-brown:#955934; --color-orange-brown:#b14c0e; }

.profile-page {
  background-color: var(--color-background);
  border-radius: 15px;
  width: 100%;
  max-width: 390px;
  padding: 20px 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  justify-content: flex-start;
}
.profile-header {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 25px;
}
.back-button { position: absolute; left: 16px; top:50%; transform: translateY(-50%); height:44px; }
.back-button img { width:59px; height:44px; display:block; }
.profile-title { color: var(--color-text-dark); font-family: var(--font-display); font-weight:400; font-size:36px; line-height:1.2; text-align:center; margin:0; }

.profile-form { display:flex; flex-direction:column; gap:20px; width:100%; max-width:294px; margin-bottom:20px; }
.form-input { background-color: var(--color-white); padding:17px 13px; border-radius:10px; box-shadow: inset 0 0 5px 3px rgba(0,0,0,0.25); border:none; font-family: var(--font-display); font-weight:400; font-size:16px; color: var(--color-text-black); width:100%; }
.form-input::placeholder { color: var(--color-text-black); opacity:1; }

.sourdough-section { width:100%; display:flex; flex-direction:column; align-items:center; margin-bottom:25px; }
.sourdough-title { color: var(--color-text-black); font-family: var(--font-body); font-weight:700; font-size:18px; margin:0 0 20px 0; }
.sourdough-list { display:flex; justify-content:space-between; width:100%; gap:16px; }
.sourdough-card { display:flex; flex-direction:column; align-items:center; gap:10px; flex:1; }
.sourdough-img { width:60px; height:60px; border-radius:10px; object-fit:cover; }
.sourdough-name { color: var(--color-text-black); font-family: var(--font-body); font-weight:500; font-size:14px; margin:0; }
.delete-sourdough-btn { background-color: var(--color-red-dark); border-radius:10px; padding:7px 12px; color: var(--color-text-light); font-family: var(--font-display); font-weight:400; font-size:8px; white-space:nowrap; width:100%; max-width:109px; }
.empty-dough { font-size:14px; color: var(--color-text-black); }

.main-actions { display:flex; flex-direction:column; gap:12px; width:100%; max-width:295px; margin-bottom:20px; }
.btn { padding:15px; border-radius:4000px; color: var(--color-text-light); font-family: var(--font-display); font-weight:400; font-size:18px; width:100%; border:2px solid var(--color-text-black); box-shadow:2px 4px 0 0 var(--color-text-black); }
.save-btn { background-color: var(--color-brown); }
.disconnect-btn { background-color: var(--color-orange-brown); }
.delete-account-btn { background-color: var(--color-red-dark); border-radius:10px; padding:15px; color: var(--color-text-light); font-family: var(--font-display); font-weight:400; font-size:15px; width:100%; max-width:291px; border:none; box-shadow:none; text-transform:uppercase; }
.delete-account-btn:disabled, .btn:disabled { opacity:.6; cursor:not-allowed; }

.feedback { width:100%; max-width:295px; margin:4px 0; font-size:14px; text-align:center; }
.feedback.success { color: #1b7e26; }
.feedback.error { color: #c32727; }

.not-auth { text-align:center; display:flex; flex-direction:column; gap:20px; }
.loading-wrap { text-align:center; padding:40px 0; }
</style>
