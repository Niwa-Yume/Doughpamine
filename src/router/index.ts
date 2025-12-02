import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import ChatPage from '../views/ChatPage.vue';
import ScorePage from '../views/ScorePage.vue';
import AuthPage from '../views/AuthPage.vue';
import CreateDough from '../views/CreateDough.vue';
import LiaisonLevainPage from '../views/LiaisonLevainPage.vue';
import CreationLevainPage from '../views/CreationLevainPage.vue';
import { supabase } from '@/lib/supabaseClient';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage,
    meta: { title: 'Accueil', requiresAuth: true }
  },
  {
    path: '/create-dough',
    name: 'CreateDough',
    component: CreateDough,
    meta: { title: 'Mon Levain', requiresAuth: true }
  },
  {
    path: '/liaison-levain',
    name: 'LiaisonLevain',
    component: LiaisonLevainPage,
    meta: { title: 'Liaison du Levain', requiresAuth: true }
  },
  {
    path: '/creation-levain',
    name: 'CreationLevain',
    component: CreationLevainPage,
    meta: { title: 'Création du Levain' }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: ChatPage,
    meta: { title: 'Chat AI', requiresAuth: true }
  },
  {
    path: '/score',
    name: 'Score',
    component: ScorePage,
    meta: { title: 'Score', requiresAuth: true }
  },
  {
    path: '/auth',
    alias: ['/login', '/register', '/signup'],
    name: 'Auth',
    component: AuthPage,
    meta: { title: 'Connexion / Inscription' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

let sessionChecked = false;

router.beforeEach(async (to, _from, next) => {
  if (!sessionChecked) {
    await supabase.auth.getSession();
    sessionChecked = true;
  }
  const { data } = await supabase.auth.getSession();
  const authed = !!data.session?.user;

  if (to.meta?.requiresAuth && !authed) {
    next({ path: '/auth', query: { redirect: to.fullPath } });
    return;
  }
  if (['/auth','/login','/register','/signup'].includes(to.path) && authed) {
    // Si query redirect existe, l'utiliser SAUF si c'est vers profile ou score
    const queryRedirect = to.query?.redirect as string;

    // Ignorer les redirections vers profile/score (proviennent souvent de déconnexions)
    const shouldIgnoreRedirect = queryRedirect &&
      (queryRedirect.includes('/profile') || queryRedirect.includes('/score'));

    console.log('🔍 Router: queryRedirect=', queryRedirect, 'shouldIgnoreRedirect=', shouldIgnoreRedirect);

    if (queryRedirect && !shouldIgnoreRedirect) {
      console.log('✅ Router: Redirection vers', queryRedirect);
      next(queryRedirect);
      return;
    }

    // Vérifier si l'utilisateur a un levain
    if (data.session?.user?.id) {
      console.log('🔍 Router: Vérification levain pour user_id=', data.session.user.id);

      try {
        // Prendre le levain le plus récent (order by created_at DESC + limit 1)
        const { data: levainList, error: levainError } = await supabase
          .from('levains')
          .select('id, user_id, name')
          .eq('user_id', data.session.user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        const levainData = levainList && levainList.length > 0 ? levainList[0] : null;

        console.log('🔍 Router: levainData=', levainData, 'error=', levainError);

        // Si erreur de requête, on assume qu'il n'y a pas de levain (sécurité)
        if (levainError) {
          console.warn('⚠️ Router: Erreur lors de la vérification du levain:', levainError);
        }

        const redirect = (levainData && !levainError) ? '/home' : '/create-dough';
        console.log('✅ Router: Redirection finale vers', redirect, 'hasLevain=', !!levainData);
        next(redirect);
        return;
      } catch (error) {
        console.error('❌ Router: Exception lors de la vérification du levain:', error);
        // En cas d'erreur, rediriger vers create-dough par sécurité
        next('/create-dough');
        return;
      }
    }

    // Fallback si pas de session (ne devrait pas arriver)
    console.log('⚠️ Router: Fallback vers /home (pas de session)');
    next('/home');
    return;
  }
  next();
});

// La redirection onAuthStateChange est maintenant gérée dans App.vue avec useIonRouter
// pour une meilleure intégration avec Ionic

export default router
