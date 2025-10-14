import { ref, computed, onMounted } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

const user = ref<User | null>(null);
const sessionLoaded = ref(false);

async function initSession() {
  if (sessionLoaded.value) return;
  const { data } = await supabase.auth.getSession();
  user.value = data.session?.user ?? null;
  sessionLoaded.value = true;
}

supabase.auth.onAuthStateChange((_event, session) => {
  user.value = session?.user ?? null;
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
  user.value = null;
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
    refreshSession: initSession,
  };
}

