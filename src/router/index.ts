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
    meta: { title: 'Chat', requiresAuth: true }
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

router.beforeEach(async (to, from, next) => {
  if (!sessionChecked) {
    await supabase.auth.getSession();
    sessionChecked = true;
  }
  const { data } = await supabase.auth.getSession();
  const authed = !!data.session?.user;

  console.log('🔍 Router: Navigation vers', to.path, 'depuis', from.path);
  console.log('🔍 Router: Session?', !!data.session, 'User?', !!data.session?.user, 'Authed?', authed);
  if (data.session?.user) {
    console.log('🔍 Router: User ID:', data.session.user.id, 'Email:', data.session.user.email);
  }

  // 1. Si la route nécessite l'authentification et que l'utilisateur n'est pas connecté
  if (to.meta?.requiresAuth && !authed) {
    console.log('⚠️ Router: Route protégée, redirection vers /auth');
    next({ path: '/auth', query: { redirect: to.fullPath } });
    return;
  }

  // 2. Si l'utilisateur est connecté et tente d'accéder à /auth
  //    => Le rediriger vers /home
  if (['/auth','/login','/register','/signup'].includes(to.path) && authed) {
    const queryRedirect = to.query?.redirect as string;

    // Si une redirection valide existe dans l'URL (et qu'elle n'est pas /auth elle-même)
    if (queryRedirect && queryRedirect !== '/auth' && !queryRedirect.includes('/login')) {
      console.log('✅ Router: Redirection vers query param:', queryRedirect);
      next(queryRedirect);
      return;
    }

    // Sinon, toujours rediriger vers /home
    // HomePage gérera la logique pour rediriger vers /create-dough si nécessaire
    console.log('✅ Router: Utilisateur connecté depuis /auth, redirection vers /home');
    next('/home');
    return;
  }

  // 3. Vérification supplémentaire : si l'utilisateur va sur /home, vérifier qu'il a un levain
  if (to.path === '/home' && authed && data.session?.user?.id) {
    // Ne pas vérifier si skipCheck=true (venant de la création d'un levain)
    const skipCheck = to.query?.skipCheck === 'true';

    // Ne vérifier que si on ne vient pas de /create-dough ou /creation-levain
    // pour éviter les boucles de redirection
    const comingFromCreation = from.path === '/create-dough' ||
                               from.path === '/creation-levain' ||
                               from.path === '/liaison-levain';

    if (!comingFromCreation && !skipCheck) {
      try {
        const { data: levainList, error: levainError } = await supabase
          .from('levains')
          .select('id')
          .eq('user_id', data.session.user.id)
          .limit(1);

          // --- AJOUT DE LOGS ---
          console.log('🔍 DEBUG LEVAIN CHECK:');
          console.log('👉 User ID cherché :', data.session.user.id);
          console.log('👉 Erreur Supabase :', levainError);
          console.log('👉 Liste trouvée :', levainList);

        const hasLevain = levainList && levainList.length > 0 && !levainError;

        if (!hasLevain) {
          console.log('⚠️ Router: Accès à /home sans levain, redirection vers /create-dough');
          next('/create-dough');
          return;
        }
      } catch (error) {
        console.error('❌ Router: Erreur vérification levain pour /home:', error);
        // En cas d'erreur, laisser passer (HomePage s'en chargera)
      }
    } else if (skipCheck) {
      console.log('✅ Router: skipCheck=true, pas de vérification du levain');
    }
  }

  next();
});

// La redirection onAuthStateChange est maintenant gérée dans App.vue avec useIonRouter
// pour une meilleure intégration avec Ionic

export default router
