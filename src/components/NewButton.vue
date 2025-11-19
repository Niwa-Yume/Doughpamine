<!--
  NewButton - Bouton interactif avec effet de pression et retour haptique

  Props:
  - className: Classes CSS additionnelles (défaut: "")
  - text: Texte du bouton (défaut: "NOURRIR")
  - textClassName: Classes CSS pour le texte (défaut: "")
  - variant: Variante de couleur ('primary' | 'secondary') (défaut: 'primary')

  Événements:
  - click: Émis au relâchement du bouton (après la pression)

  Exemple:
  <NewButton text="CONFIRMER" variant="secondary" @click="handleClick" />
-->
<template>
  <div
    :class="['new-button', className, variantClass, { 'is-pressed': isPressed }]"
    role="button"
    tabindex="0"
    @pointerdown="handlePressStart"
    @pointerup="handlePressEnd"
    @pointercancel="handlePressEnd"
    @pointerleave="handlePressEnd"
    @keydown.space.prevent="handlePressStart"
    @keydown.enter.prevent="handlePressStart"
    @keyup.space.prevent="handlePressEnd"
    @keyup.enter.prevent="handlePressEnd"
  >
    <div :class="['new-button__text', textClassName]">
      <slot>{{ text }}</slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";

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
    className: {
      type: String,
      default: ""
    },
    text: {
      type: String,
      default: "NOURRIR"
    },
    textClassName: {
      type: String,
      default: ""
    },
    variant: {
      type: String as () => 'primary' | 'secondary',
      default: 'primary',
      validator: (value: string) => ['primary', 'secondary'].includes(value),
    }
  },
  data() {
    return {
      isPressed: false
    };
  },
  computed: {
    /**
     * Calcule la classe CSS de variante selon le prop
     */
    variantClass(): string {
      return this.variant === 'secondary' ? 'variant-marron-clair' : '';
    }
  },
  methods: {
    /**
     * Gère le début de la pression (pointer/touch down)
     * Déclenche l'animation et le retour haptique
     */
    handlePressStart() {
      this.isPressed = true;
      this.triggerHapticFeedback();
    },

    /**
     * Gère la fin de la pression (pointer/touch up)
     * Émet l'événement click si le bouton était pressé
     */
    handlePressEnd() {
      if (this.isPressed) {
        this.isPressed = false;
        this.$emit('click');
      }
    },

    /**
     * Déclenche un retour haptique léger si disponible (natif mobile)
     */
    triggerHapticFeedback() {
      if (Haptics?.impact) {
        Haptics.impact({ style: 'light' }).catch(() => {
          // Ignore les erreurs silencieusement
        });
      }
    },
  },
});
</script>

<style scoped>
.new-button {
  align-items: center;
  background-color: var(--color-primary);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--border-radius-full);
  box-shadow: var(--shadow-md);
  display: inline-flex;
  gap: 10px;
  justify-content: center;
  overflow: hidden;
  padding: var(--spacing-md) calc(var(--spacing-xl) * 2.5);
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
  transition: var(--transition-button);
}

/**
 * Effet pressé: enfoncement + ombre réduite + léger fondu
 * Utilisé pour le feedback visuel lors de l'interaction
 */
.new-button.is-pressed {
  transform: translateY(2px) scale(0.98);
  box-shadow: var(--shadow-sm);
  filter: brightness(0.95);
}

/**
 * Variante secondaire - Marron clair
 */
.new-button.variant-marron-clair {
  background-color: var(--color-secondary);
}

.new-button__text {
  align-items: center;
  color: var(--pure-white);
  display: flex;
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  font-weight: 800;
  justify-content: center;
  letter-spacing: -0.36px;
  line-height: normal;
  position: relative;
  text-align: center;
  width: fit-content;
}
</style>


