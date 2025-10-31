<template>
  <div class="connexion">
    <div class="titre-page-connexion">DoughPamine</div>
    <img
        class="mascote-accueil"
        alt="Mascote accueil"
        :src="video"
    />
    <div class="div">
      <!-- Remplacement de Logo par IonIcon -->
      <IonIcon :icon="logoGoogle" class="logo-instance text-black" />
      <div class="sign-in-with-google">Connexion avec Google</div>
    </div>
    <div class="div">
      <!-- Remplacement de Logo par IonIcon -->
      <IonIcon :icon="logoGoogle" class="logo-instance text-black" />
      <div class="sign-in-with-google">Inscription avec Google</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { IonIcon } from "@ionic/vue";
import { logoGoogle } from "ionicons/icons";
import video from "../../public/assets/gif/levain crop.gif";

export default defineComponent({
  name: "Connexion-inscription",
  components: {
    IonIcon,
  },
  data() {
    return {
      video,
      logoGoogle,
    };
  },
});
</script>

<style>
.connexion {
  background-color: #f2e5ca;
  border-radius: 15.99px;
  display: flex;
  flex-direction: column;
  height: 844px;
  overflow: hidden;
  width: 390px;
}

.connexion .titre-page-connexion {
  align-items: center;
  color: var(--dark-pure-black);
  display: flex;
  font-family: var(--h1-font-family),serif;
  font-size: var(--h1-font-size);
  font-style: var(--h1-font-style);
  font-weight: var(--h1-font-weight);
  height: 57px;
  justify-content: center;
  letter-spacing: var(--h1-letter-spacing);
  line-height: var(--h1-line-height);
  margin-left: 46px;
  margin-top: 79px;
  text-align: center;
  width: 294px;
}

.connexion .mascote-accueil {
  height: 372px;
  margin-top: 27px;
  width:auto;
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
  margin-left: 48px;
  margin-top: 39px;
  padding: 1.3px 12.99px 1.3px 1.3px;
  position: relative;
  width: 294px;
}

.connexion .logo-instance {
  height: 49.35px !important;
  position: relative !important;
  width: 49.35px !important;
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
</style>