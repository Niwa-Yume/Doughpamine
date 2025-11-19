<template>
  <div
    :class="['new-button', className, { 'is-pressed': pressed }]"
    role="button"
    tabindex="0"
    @pointerdown="onDown"
    @pointerup="onUp"
    @pointercancel="onUp"
    @pointerleave="onUp"
    @keydown.space.prevent="onKeyboardPress"
    @keydown.enter.prevent="onKeyboardPress"
    @keyup.space.prevent="onKeyboardRelease"
    @keyup.enter.prevent="onKeyboardRelease"
  >
    <div :class="['text', textClassName]">
      <slot>{{ text }}</slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
// Haptics optionnel (Capacitor); encapsulé pour ne pas casser en web pur
let Haptics: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Haptics = require('@capacitor/haptics').Haptics;
} catch {
  // Haptics non disponible (web), on ignore
}

export default defineComponent({
  name: "NewButton",
  props: {
    className: { type: String, default: "" },
    text: { type: String, default: "NOURRIR" },
    textClassName: { type: String, default: "" },
  },
  data() {
    return { pressed: false };
  },
  methods: {
    onDown() {
      this.pressed = true;
      // Retour haptique léger si disponible
      if (Haptics?.impact) {
        Haptics.impact({ style: 'light' }).catch(() => {});
      }
    },
    onUp() {
      if (this.pressed) {
        this.pressed = false;
        // émet un click lors du relâchement
        this.$emit('click');
      }
    },
    onKeyboardPress() {
      this.onDown();
    },
    onKeyboardRelease() {
      this.onUp();
    },
  },
});
</script>

<style>
.new-button {
  align-items: center;
  background-color: var(--marron);
  border: 2px solid;
  border-color: var(--dark-pure-black);
  border-radius: 4000px;
  box-shadow: var(--block-shadow-small);
  display: inline-flex;
  gap: 10px;
  justify-content: center;
  overflow: hidden;
  padding: 15px 85px;
  /* Retrait du positionnement spécifique à une page */
  cursor: pointer;            /* pointeur interactif */
  user-select: none;          /* évite la sélection pendant la pression */
  touch-action: manipulation; /* améliore la réactivité mobile */
  transition: transform 120ms ease, box-shadow 120ms ease, filter 120ms ease;
}

/* Effet pressé: léger enfoncement + ombre réduite + léger fondu */
.new-button.is-pressed {
  transform: translateY(2px) scale(0.98);
  box-shadow: 1px 2px 0 0 rgba(0, 0, 0, 0.85);
  filter: brightness(0.95);
}

/* Variante de couleur marron clair */
.new-button.variant-marron-clair {
  background-color: #DA9942;
}

.new-button .text {
  align-items: center;
  color: var(--pure-white);
  display: flex;
  font-family: "ADLaM Display-Regular", Helvetica, sans-serif;
  font-size: 18px;
  font-weight: 800;
  justify-content: center;
  letter-spacing: -0.36px;
  line-height: normal;
  position: relative;
  text-align: center;
  width: fit-content;
}
</style>
