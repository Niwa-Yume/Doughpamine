<template>
  <ion-page>
    <ion-content :scroll-y="true">
      <div class="connexion">
        <div class="titre-page-connexion">DoughPamine</div>
        <p>
          Avec Doughpamine, nourrir ton levain devient une routine fun, ludique et motivante.
        </p>
        <img
            class="mascote-accueil"
            alt="Mascote accueil"
            :src="video"
        />
        <div class="div" role="button" tabindex="0" @click="onGoogleClick" @keydown.enter="onGoogleClick">
          <GoogleLogo class="logo-instance" />
          <div class="sign-in-with-google">Continuer avec Google</div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { IonPage, IonContent } from '@ionic/vue';
import { useAuth } from "@/composables/useAuth";
import { useRoute } from "vue-router";
import GoogleLogo from "@/components/GoogleLogo.vue";
import video from "../../public/assets/gif/levain crop.gif";

export default defineComponent({
  name: "Connexion-inscription",
  components: { IonPage, IonContent, GoogleLogo },
  setup() {
    const { signInWithGoogle } = useAuth();
    const route = useRoute();
    const onGoogleClick = () => {
      const redirect = (route.query.redirect as string) || '/profile';
      const callback = `/auth?redirect=${encodeURIComponent(redirect)}`;
      signInWithGoogle(callback);
    };
    return { video, onGoogleClick };
  }
});
</script>

<style>
.connexion {
  background-color: #f2e5ca;
  border-radius: 15.99px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  overflow: hidden;
  width: 100%;
  max-width: 390px;
  margin: 0 auto;
  padding: 0 24px;
}

.connexion .titre-page-connexion {
  align-items: center;
  color: var(--dark-pure-black);
  display: flex;
  font-family: var(--h1-font-family),serif;
  font-size: var(--h1-font-size);
  font-style: var(--h1-font-style);
  font-weight: var(--h1-font-weight);
  height: auto;
  justify-content: center;
  letter-spacing: var(--h1-letter-spacing);
  line-height: var(--h1-line-height);
  margin: 20px 0 0 0;
  text-align: center;
  width: 100%;
  max-width: 294px;
}

.connexion p {
  color: #000000;
  font-family: 'ADLaM Display', serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  text-align: center;
  margin: 16px 0 0 0;
  max-width: 294px;
  padding: 0 12px;
}

.connexion .mascote-accueil {
  height: 372px;
  margin-top: 27px;
  width: auto;
  max-width: 100%;
  object-fit: contain;
}

.connexion .div {
  align-items: center;
  background-color: #ffffff;
  border-radius: 2.6px;
  box-shadow: 0px 1.3px 1.3px #0000002b, 0px 0px 1.3px #00000015;
  display: flex;
  gap: 12.99px;
  height: 71px;
  justify-content: center;
  margin: 39px 0 0 0;
  padding: 1.3px 12.99px 1.3px 1.3px;
  position: relative;
  width: 100%;
  max-width: 294px;
  cursor: pointer;
  transition: transform 0.1s ease;
}

.connexion .div:hover {
  box-shadow: 0px 2px 2px #0000003b, 0px 0px 2px #00000025;
}

.connexion .div:active {
  transform: scale(0.99);
}

.connexion .logo-instance {
  width: 49.35px;
  height: 49.35px;
  flex-shrink: 0;
}

.connexion .sign-in-with-google {
  color: #757575;
  font-size: 18.2px;
  font-weight: 500;
  letter-spacing: 0;
  line-height: normal;
  position: relative;
  white-space: nowrap;
  width: fit-content;
}

/* ----------------------------- */
/*      Responsive overrides     */
/* ----------------------------- */
/* Tablet */
@media (min-width: 768px) {
  .connexion {
    max-width: 600px;
    border-radius: 20px;
    padding: 0 40px;
  }

  .connexion .titre-page-connexion {
    font-size: calc(var(--h1-font-size) * 1.3);
    margin-top: 10px;
    max-width: 400px;
  }

  .connexion p {
    font-size: 18px;
    max-width: 400px;
    margin-top: 20px;
  }

  .connexion .mascote-accueil {
    height: 450px;
    margin-top: 40px;
  }

  .connexion .div {
    max-width: 400px;
    height: 80px;
    margin-top: 50px;
    border-radius: 4px;
  }

  .connexion .logo-instance {
    width: 56px;
    height: 56px;
  }

  .connexion .sign-in-with-google {
    font-size: 20px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .connexion {
    max-width: 700px;
    border-radius: 24px;
    padding: 40px 60px;
    justify-content: center;
  }

  .connexion .titre-page-connexion {
    font-size: calc(var(--h1-font-size) * 1.4);
    margin-top: 40px;
    max-width: 450px;
  }

  .connexion p {
    font-size: 18px;
    max-width: 450px;
    margin-top: 24px;
  }

  .connexion .mascote-accueil {
    height: 380px;
    margin-top: 30px;
  }

  .connexion .div {
    max-width: 450px;
    height: 85px;
    margin-top: 40px;
    border-radius: 6px;
    gap: 16px;
  }

  .connexion .div:hover {
    transform: translateY(-2px);
    box-shadow: 0px 4px 8px #0000003b, 0px 0px 4px #00000025;
  }

  .connexion .div:active {
    transform: translateY(0) scale(0.99);
  }

  .connexion .logo-instance {
    width: 60px;
    height: 60px;
  }

  .connexion .sign-in-with-google {
    font-size: 20px;
  }
}
</style>