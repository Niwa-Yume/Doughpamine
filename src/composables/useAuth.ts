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
  user.value = session?.user ?? null;
  // Assure que sessionLoaded est positionné même si initSession n'a pas encore été appelé
  if (!sessionLoaded.value) {
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
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  // user.value sera mis à null automatiquement par onAuthStateChange
}

// Google OAuth (Web)
async function signInWithGoogle(redirectPath: string = '/home') {
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

// Fonction pour obtenir la page de redirection appropriée après connexion
async function getRedirectPath(): Promise<string> {
  if (!user.value?.id) return '/auth';

  // Vérifier si l'utilisateur a un levain (prendre le plus récent)
  const { data: levainList } = await supabase
    .from('levains')
    .select('id')
    .eq('user_id', user.value.id)
    .order('created_at', { ascending: false })
    .limit(1);

  // Si pas de levain, rediriger vers la création
  if (!levainList || levainList.length === 0) {
    return '/create-dough';
  }

  // Sinon, rediriger vers la page d'accueil
  return '/home';
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
    signInWithGoogle,
    refreshSession: initSession,
    getRedirectPath,
  };
}
