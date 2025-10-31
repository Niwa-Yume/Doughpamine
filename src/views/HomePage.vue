<template>
  <div class="v">
    <div class="icon-de-profile">
      <img class="vector-2" alt="Vector" :src="vector" />
    </div>
    <!-- Widget AI Jotform via composant dédié -->
    <JotformAgent />

    <div class="tat-du-levain">Actif</div>
    <NewButton class="bouton-nourri-levain" />
    <div class="levain-tat-de-base">
      <img class="vector-3" alt="Vector" :src="mascotte" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import NewButton from "@/components/NewButton.vue";
import JotformAgent from "@/components/JotformAgent.vue";

const mascotte = "/assets/gif/levain basique.gif";
const vector = "/assets/SVG/vector.svg";

export default defineComponent({
  name: "HomePage",
  components: {
    NewButton,
    JotformAgent,
  },
  data() {
    return {
      mascotte,
      vector,
    };
  },
});
</script>

<style>
.v {
  background-color: #f4e2c9;
  border-radius: 15px;
  height: 844px;
  overflow: hidden;
  position: relative;
  width: 390px;
}

/* Ajout d’un décor à droite en arrière-plan pour l’effet carrousel */
.v::after {
  content: "";
  position: absolute;
  top: 247px; /* aligné verticalement sur la mascotte */
  right: -70px; /* un peu plus à droite qu’avant (-40px) */
  width: 227px; /* même taille que le cercle */
  height: 227px; /* même taille que le cercle */
  background: url("/assets/mascott/Version_de_base-removebg-preview.png") center / contain no-repeat;
  opacity: 0.25; /* opacité douce pour le fond */
  filter: drop-shadow(0 2px 0 rgba(0,0,0,.15));
  pointer-events: none;
  z-index: 0;
}

.icon-de-profile {
  height: 24px;
  left: 251px;
  position: absolute;
  top: 76px;
  width: 24px;
  z-index: 1;
}

.vector-2 {
  height: 25.00%;
  left: 16.67%;
  position: absolute;
  top: 58.33%;
  width: 58.33%;
}

.tat-du-levain {
  align-items: center;
  color: #000000;
  display: flex;
  font-size: 36.5px;
  font-weight: 400;
  height: 48px;
  justify-content: center;
  left: 153px;
  letter-spacing: -0.73px;
  line-height: normal;
  position: absolute;
  top: 520px;
  width: 82px;
  z-index: 1;
}

.bouton-nourri-levain {
  display: flex !important;
  left: 46px !important;
  position: absolute !important;
  top: 707px !important;
  width: 298px !important;
  z-index: 1;
}

/* Conteneur cercle pour la mascotte */
.levain-tat-de-base {
  border-radius: 50%;
  height: 227px;
  left: 80px;
  position: absolute;
  top: 247px;
  width: 227px;
  overflow: hidden;
  z-index: 1; /* au-dessus du décor de droite */
}

/* L’image remplit le cercle et est recadrée */
.levain-tat-de-base .vector-3 {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}
</style>