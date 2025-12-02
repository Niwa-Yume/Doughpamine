<template>
  <ion-modal :is-open="isOpen" @didDismiss="handleClose" class="rename-modal-wrapper">
    <div class="rename-modal">
      <button class="modal-close" @click="handleClose" aria-label="Fermer">
        <ion-icon :icon="closeOutline"></ion-icon>
      </button>

      <div class="modal-header">
        <h2 class="modal-title">Renommer ton levain</h2>
        <p class="modal-subtitle">
          Choisis un nom unique pour ton compagnon !
        </p>
      </div>

      <div class="modal-body">
        <div class="input-wrapper">
          <label for="levain-name" class="input-label">Nouveau nom</label>
          <input
            id="levain-name"
            v-model="newName"
            type="text"
            class="levain-input"
            placeholder="Ex: Roger, Bouboule, Champion..."
            :maxlength="50"
            @keyup.enter="handleRename"
            autofocus
          />
          <div class="input-footer">
            <span class="character-count">{{ newName.length }} / 50</span>
          </div>
        </div>

        <p v-if="errorMessage" class="error-message">
          ⚠️ {{ errorMessage }}
        </p>
      </div>

      <div class="modal-actions">
        <button
          class="btn btn-secondary"
          @click="handleClose"
          :disabled="isRenaming"
        >
          Annuler
        </button>
        <button
          class="btn btn-primary"
          @click="handleRename"
          :disabled="!canRename || isRenaming"
        >
          {{ isRenaming ? 'En cours...' : 'Renommer' }}
        </button>
      </div>
    </div>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { IonModal, IonIcon } from '@ionic/vue';
import { closeOutline } from 'ionicons/icons';
import { useDough } from '@/composables/useDough';

const props = defineProps<{
  isOpen: boolean;
  currentName: string;
}>();

const emit = defineEmits<{
  close: [];
  renamed: [newName: string];
}>();

const { renameLevain } = useDough();

const newName = ref('');
const isRenaming = ref(false);
const errorMessage = ref('');

const canRename = computed(() => {
  const trimmed = newName.value.trim();
  return trimmed.length > 0 && trimmed !== props.currentName;
});

async function handleRename() {
  if (!canRename.value) return;

  isRenaming.value = true;
  errorMessage.value = '';

  try {
    await renameLevain(newName.value);
    emit('renamed', newName.value.trim());
    handleClose();
  } catch (e: any) {
    errorMessage.value = e.message || 'Erreur lors du renommage';
  } finally {
    isRenaming.value = false;
  }
}

function handleClose() {
  newName.value = '';
  errorMessage.value = '';
  emit('close');
}
</script>

<style scoped>
/* Container principal du modal */
.rename-modal {
  position: relative;
  max-width: 450px;
  width: 90vw;
  margin: auto;
  background-color: var(--color-background, #F2E5CA);
  border-radius: var(--border-radius-xl, 20px);
  padding: var(--spacing-xl, 32px) var(--spacing-md, 16px); /* Réduit le padding horizontal pour mobile */
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg, 24px);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Bouton de fermeture */
.modal-close {
  position: absolute;
  top: var(--spacing-md, 16px);
  right: var(--spacing-md, 16px);
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-xs, 4px);
  color: var(--color-text-secondary, #4b4b4b);
  transition: all var(--transition-fast, 120ms ease);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.modal-close:hover {
  color: var(--color-text-primary, #000);
  background-color: rgba(0, 0, 0, 0.05);
  transform: scale(1.1);
}

.modal-close ion-icon {
  font-size: 24px;
}

/* En-tête du modal */
.modal-header {
  text-align: center;
  margin-bottom: var(--spacing-sm, 8px);
}

.modal-title {
  font-family: var(--font-display, 'ADLaM Display', cursive, sans-serif);
  font-size: var(--font-size-2xl, 32px);
  font-weight: 400;
  color: var(--color-text-primary, #000);
  letter-spacing: -0.5px;
  margin: 0 0 var(--spacing-sm, 8px) 0;
  line-height: 1.2;
}

.modal-subtitle {
  font-family: var(--font-body, 'Roboto', Arial, sans-serif);
  font-size: var(--font-size-base, 16px);
  color: var(--color-text-secondary, #4b4b4b);
  margin: 0;
  line-height: 1.5;
}

/* Corps du modal */
.modal-body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 16px);
}

/* Wrapper de l'input */
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs, 4px);
}

.input-label {
  font-family: var(--font-body, 'Roboto', Arial, sans-serif);
  font-size: var(--font-size-sm, 14px);
  font-weight: 500;
  color: var(--color-text-primary, #000);
  margin-bottom: var(--spacing-xs, 4px);
}

/* Input stylisé */
.levain-input {
  width: 100%;
  height: 56px;
  padding: 0 var(--spacing-md, 16px);
  background-color: var(--pure-white, #FFFFFF);
  border: 2px solid var(--color-border, #000);
  border-radius: var(--border-radius-md, 8px);
  box-shadow: var(--shadow-md, 2px 4px 0 0 rgba(0, 0, 0, 1));
  font-family: var(--font-body, 'Roboto', Arial, sans-serif);
  font-size: var(--font-size-lg, 18px);
  color: var(--color-text-primary, #000);
  transition: all var(--transition-base, 200ms ease);
}

.levain-input:focus {
  outline: none;
  border-color: var(--marron, #955934);
  box-shadow: 2px 4px 0 0 var(--marron, #955934);
  transform: translateY(-2px);
}

.levain-input::placeholder {
  color: var(--color-text-light, #757575);
  opacity: 0.7;
}

/* Footer de l'input (compteur de caractères) */
.input-footer {
  display: flex;
  justify-content: flex-end;
  padding: 0 var(--spacing-xs, 4px);
}

.character-count {
  font-family: var(--font-body, 'Roboto', Arial, sans-serif);
  font-size: var(--font-size-xs, 12px);
  color: var(--color-text-secondary, #4b4b4b);
  font-weight: 500;
}

/* Message d'erreur */
.error-message {
  background-color: rgba(244, 67, 54, 0.1);
  border-left: 4px solid var(--color-error, #f44336);
  padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
  border-radius: var(--border-radius-sm, 4px);
  color: var(--color-error, #f44336);
  font-family: var(--font-body, 'Roboto', Arial, sans-serif);
  font-size: var(--font-size-sm, 14px);
  margin: 0;
  line-height: 1.4;
}

/* Actions du modal */
.modal-actions {
  display: flex;
  gap:4px;
  margin-top: var(--spacing-sm, 8px);
}

/* Boutons */
.btn {
  flex: 1;
  height: var(--button-height-sm, 57px);
  border-radius: var(--border-radius-full, 9999px);
  border: 2px solid var(--color-border, #000);
  box-shadow: var(--shadow-md, 2px 4px 0 0 rgba(0, 0, 0, 1));
  font-family: var(--font-display, 'ADLaM Display', cursive, sans-serif);
  font-size: var(--font-size-lg, 18px);
  font-weight: 400;
  cursor: pointer;
  transition: var(--transition-button);
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 2px 6px 0 0 rgba(0, 0, 0, 1);
}

.btn:active:not(:disabled) {
  transform: translateY(2px);
  box-shadow: 0 2px 0 0 rgba(0, 0, 0, 1);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(0.3);
}

/* Bouton primaire */
.btn-primary {
  background-color: var(--marron, #955934);
  color: var(--pure-white, #FFFFFF);
}

.btn-primary:hover:not(:disabled) {
  background-color: #a66844;
}

/* Bouton secondaire */
.btn-secondary {
  background-color: var(--pure-white, #FFFFFF);
  color: var(--color-text-primary, #000);
}

.btn-secondary:hover:not(:disabled) {
  background-color: #f5f5f5;
}

/* ========================================
   RESPONSIVE - Petits mobiles
   ======================================== */
@media (max-width: 374px) {
  .rename-modal {
    padding: var(--spacing-lg, 24px) var(--spacing-sm, 8px);
  }

  .btn {
    font-size: 14px;
    padding: 0 6px;
    letter-spacing: 0;
  }

  .modal-actions {
    gap: 4px;
  }
}

/* ========================================
   RESPONSIVE - Tablet & Desktop
   ======================================== */
@media (min-width: 768px) {
  .rename-modal {
    max-width: 500px;
    padding: var(--spacing-3xl, 48px) var(--spacing-2xl, 40px);
  }

  .modal-title {
    font-size: calc(var(--font-size-2xl, 32px) * 1.1);
  }

  .modal-subtitle {
    font-size: var(--font-size-lg, 18px);
  }

  .levain-input {
    height: 60px;
    font-size: var(--font-size-xl, 24px);
  }

  .btn {
    height: var(--button-height-md, 71px);
    font-size: 18px;
    letter-spacing: 0.4px;
    padding: 0 var(--spacing-lg, 24px);
  }

  .modal-actions {
    gap:8px;
  }

  .modal-close {
    width: 36px;
    height: 36px;
  }

  .modal-close ion-icon {
    font-size: 28px;
  }
}

@media (min-width: 1024px) {
  .rename-modal {
    max-width: 550px;
  }

  .btn {
    font-size: var(--font-size-xl, 24px);
    padding: 0 var(--spacing-xl, 32px);
  }

  .modal-actions {
    gap:8px;
  }
}
</style>

