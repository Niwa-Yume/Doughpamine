import { ref, computed, onMounted } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

const user = ref<User | null>(null);
const sessionLoaded = ref(false);

async function initSession() {
  if (sessionLoaded.value) return;
  const { data } = await supabase.auth.getSession();
  user.value = data.session?.user ?? null;
  sessionLoaded.value = true;
}

supabase.auth.onAuthStateChange((event, session) => {
  console.log('[useAuth] onAuthStateChange:', event, 'user:', session?.user?.email || null);
  user.value = session?.user ?? null;
  // Assure que sessionLoaded est positionné même si initSession n'a pas encore été appelé
  if (!sessionLoaded.value) {
    console.log('[useAuth] sessionLoaded passé à true');
    sessionLoaded.value = true;
  }
});

async function signIn(email: string, password: string) {
  const { error, data } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  user.value = data.user ?? null;
}

async function signUp(email: string, password: string) {
  const { error, data } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  user.value = data.user ?? null;
}

async function signOut() {
  console.log('[useAuth] signOut appelé');
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('[useAuth] Erreur signOut:', error);
    throw error;
  }
  console.log('[useAuth] signOut réussi, onAuthStateChange va mettre user à null');
  // Ne pas mettre user.value = null ici, laisse onAuthStateChange le faire
  // pour éviter les doubles mises à jour et problèmes de timing
}

// Google OAuth (Web)
async function signInWithGoogle(redirectPath: string = '/auth') {
  const redirectTo = `${window.location.origin}${redirectPath}`;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  });
  if (error) throw error;
}

export function useAuth() {
  onMounted(initSession);
  return {
    user: computed(() => user.value),
    isAuthenticated: computed(() => !!user.value),
    sessionLoaded: computed(() => sessionLoaded.value),
    signIn,
    signUp,
    signOut,
    // expose Google OAuth
    signInWithGoogle,
    refreshSession: initSession,
  };
}
