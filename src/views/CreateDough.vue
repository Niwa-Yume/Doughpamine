<template>
  <div class="choix-levain">
    <div class="titre-page-choix">Création du levain</div>
    <img class="mascotte" alt="Mascotte" :src="mascotteIllustration" />
    <NewButton
        class="bouton-crer-levain"
        text="CRÉER UN LEVAIN"
        textClassName="new-button-instance"
    />
    <NewButton
        class="bouton-lier-levain"
        text="LIER UN LEVAIN"
        textClassName="design-component-instance-node"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import NewButton from "../components/NewButton.vue";

export default defineComponent({
  name: "ChoixLevain",
  components: {
    NewButton,
  },
  data() {
    return {
      mascotteIllustration: "/assets/mascott/Version de base.png",
    } as const;
  },
});
</script>

<style>
.choix-levain {
  background-color: #f2e5ca;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  height: 844px;
  overflow: hidden;
  width: 390px;
}

.choix-levain .titre-page-choix {
  align-items: center;
  color: black;
  display: flex;
  font-size: var(--h1-font-size);
  font-weight: var(--h1-font-weight);
  height: 114px;
  justify-content: center;
  margin-left: 54px;
  margin-top: 107px;
  text-align: center;
  width: 294px;
}

.choix-levain .mascotte {
  align-self: center;
  aspect-ratio: 1;
  height: 189px;
  margin-left: 11px;
  margin-top: 65px;
  mix-blend-mode: darken;
  width: 189px;
}

.choix-levain .bouton-crer-levain {
  display: flex !important;
  height: 57px !important;
  left: unset !important;
  margin-left: 48px !important;
  margin-top: 81px !important;
  top: unset !important;
  width: 296px !important;
}

.choix-levain .new-button-instance {
  margin-left: -14.00px !important;
  margin-right: -10.00px !important;
}

.choix-levain .bouton-lier-levain {
  display: flex !important;
  height: 57px !important;
  left: unset !important;
  margin-left: 48px !important;
  margin-top: 24px !important;
  top: unset !important;
  width: 296px !important;
}

.choix-levain .design-component-instance-node {
  margin-left: -5.00px !important;
  margin-right: -1.00px !important;
}

/* ----------------------------- */
/*      Responsive overrides     */
/* ----------------------------- */
/* Tablet */
@media (min-width: 768px) {
  .choix-levain {
    /* Étend la carte tout en conservant l'empilement vertical */
    width: 100%;
    max-width: 720px;
    height: auto;
    min-height: 100vh;
    margin: 0 auto; /* centre sur l'écran */
    padding: 40px 24px;
    border-radius: 20px;
  }

  .choix-levain .titre-page-choix {
    /* On abandonne les décalages fixes pour centrer proprement */
    margin-left: 0;
    margin-top: 24px;
    margin-right: 0;
    width: auto;
    height: auto;
    font-size: calc(var(--h1-font-size) * 1.2);
  }

  .choix-levain .mascotte {
    margin-left: 0;
    margin-top: 40px;
    width: 240px;
    height: 240px;
  }

  .choix-levain .bouton-crer-levain,
  .choix-levain .bouton-lier-levain {
    /* Les boutons prennent une largeur fluide et sont centrés */
    margin-left: auto !important;
    margin-right: auto !important;
    width: min(420px, 80%) !important;
  }

  .choix-levain .bouton-crer-levain {
    margin-top: 48px !important;
  }

  .choix-levain .bouton-lier-levain {
    margin-top: 24px !important;
  }

  .choix-levain .new-button-instance,
  .choix-levain .design-component-instance-node {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .choix-levain {
    max-width: 960px;
    padding: 56px 32px;
    border-radius: 24px;
  }

  .choix-levain .titre-page-choix {
    font-size: calc(var(--h1-font-size) * 1.4);
  }

  .choix-levain .mascotte {
    width: 300px;
    height: 300px;
    margin-top: 48px;
  }

  .choix-levain .bouton-crer-levain,
  .choix-levain .bouton-lier-levain {
    width: min(520px, 60%) !important;
  }
}
</style>