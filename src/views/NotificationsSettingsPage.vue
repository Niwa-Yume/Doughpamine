<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" color="light"></ion-back-button>
        </ion-buttons>
        <ion-title class="toolbar-title">🔔 Notifications</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding" :style="{ '--background': '#F2E5CA' }">
      <div class="settings-container">
        <!-- Section : État des notifications -->
        <div class="settings-section">
          <h2 class="section-title">🔔 Notifications</h2>

          <div class="status-card" :class="notificationsEnabled ? 'enabled' : 'disabled'">
            <div class="status-icon">
              {{ notificationsEnabled ? '✅' : '🔕' }}
            </div>
            <div class="status-text">
              <h3>{{ notificationsEnabled ? 'Activées' : 'Désactivées' }}</h3>
              <p>{{ statusMessage }}</p>
            </div>
          </div>

          <!-- Bouton d'activation -->
          <ion-button
            v-if="!notificationsEnabled"
            expand="block"
            @click="enableNotifications"
            class="enable-button"
          >
            <ion-icon :icon="notifications" slot="start"></ion-icon>
            Activer les notifications
          </ion-button>

          <!-- Bouton de test -->
          <ion-button
            v-if="notificationsEnabled"
            expand="block"
            fill="outline"
            @click="testNotification"
            class="test-button"
          >
            <ion-icon :icon="send" slot="start"></ion-icon>
            Envoyer une notification test (5s)
          </ion-button>
        </div>

        <!-- Section : Notifications en attente -->
        <div class="settings-section" v-if="notificationsEnabled">
          <h2 class="section-title">📋 Notifications planifiées</h2>

          <ion-button
            expand="block"
            fill="clear"
            @click="loadPendingNotifications"
          >
            <ion-icon :icon="refresh" slot="start"></ion-icon>
            Actualiser
          </ion-button>

          <div v-if="pendingNotifications.length === 0" class="empty-state">
            <p>Aucune notification planifiée</p>
          </div>

          <div v-else class="notifications-list">
            <div
              v-for="notif in pendingNotifications"
              :key="notif.id"
              class="notification-item"
            >
              <div class="notif-icon">🔔</div>
              <div class="notif-content">
                <h4>{{ notif.title }}</h4>
                <p>{{ notif.body }}</p>
                <span class="notif-time">
                  {{ formatNotificationTime(notif.schedule?.at) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Annuler toutes les notifications -->
          <ion-button
            v-if="pendingNotifications.length > 0"
            expand="block"
            color="danger"
            fill="outline"
            @click="cancelAll"
          >
            <ion-icon :icon="close" slot="start"></ion-icon>
            Annuler toutes les notifications
          </ion-button>
        </div>

        <!-- Section : Explications -->
        <div class="settings-section">
          <h2 class="section-title">💡 Comment ça marche ?</h2>

          <div class="info-card">
            <p>
              <strong>Notifications intelligentes :</strong>
              L'app vous enverra automatiquement des rappels pour nourrir votre levain
              en fonction de son état actuel.
            </p>
            <ul>
              <li>🌱 <strong>Levain jeune</strong> : Rappel quotidien pendant 6 jours</li>
              <li>✨ <strong>Levain actif</strong> : Rappel 1h avant qu'il ait faim</li>
              <li>😋 <strong>Levain affamé</strong> : Rappel urgent pour le nourrir</li>
              <li>❄️ <strong>Au frais</strong> : Rappel avant qu'il ne meure</li>
            </ul>
            <p class="note">
              💡 <em>Les notifications fonctionnent même quand l'app est fermée !</em>
            </p>
          </div>
        </div>

        <!-- Section : Débug (en développement) -->
        <div class="settings-section" v-if="isDev">
          <h2 class="section-title">🛠️ Debug</h2>
          <div class="debug-info">
            <p><strong>Permission:</strong> {{ notificationsPermission }}</p>
            <p><strong>Plateforme:</strong> {{ platform }}</p>
            <p><strong>Native:</strong> {{ isNative ? 'Oui' : 'Non (Web)' }}</p>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonBackButton,
  IonIcon,
  alertController,
  toastController
} from '@ionic/vue'
import { notifications, send, refresh, close } from 'ionicons/icons'
import { useNotifications } from '@/composables/useNotifications'
import { Capacitor } from '@capacitor/core'

const {
  notificationsEnabled,
  notificationsPermission,
  requestPermissions,
  sendTestNotification,
  checkPendingNotifications,
  cancelAllNotifications
} = useNotifications()

const pendingNotifications = ref<any[]>([])
const platform = ref(Capacitor.getPlatform())
const isNative = ref(Capacitor.isNativePlatform())
const isDev = ref(import.meta.env.DEV)

const statusMessage = computed(() => {
  if (notificationsEnabled.value) {
    return 'Vous recevrez des rappels pour prendre soin de votre levain'
  }
  if (notificationsPermission.value === 'denied') {
    return 'Vous avez refusé les notifications. Activez-les dans les paramètres de votre appareil.'
  }
  return 'Activez les notifications pour ne jamais oublier de nourrir votre levain'
})

async function enableNotifications() {
  const granted = await requestPermissions()

  if (granted) {
    const toast = await toastController.create({
      message: '✅ Notifications activées !',
      duration: 2000,
      color: 'success',
      position: 'top'
    })
    await toast.present()
  } else {
    const alert = await alertController.create({
      header: 'Permission refusée',
      message: 'Pour activer les notifications, allez dans les paramètres de votre appareil.',
      buttons: ['OK']
    })
    await alert.present()
  }
}

async function testNotification() {
  await sendTestNotification()
  const toast = await toastController.create({
    message: '🔔 Notification de test envoyée (dans 5 secondes)',
    duration: 2000,
    color: 'primary',
    position: 'top'
  })
  await toast.present()
}

async function loadPendingNotifications() {
  pendingNotifications.value = await checkPendingNotifications()
}

async function cancelAll() {
  const alert = await alertController.create({
    header: 'Annuler les notifications',
    message: 'Êtes-vous sûr de vouloir annuler toutes les notifications planifiées ?',
    buttons: [
      {
        text: 'Non',
        role: 'cancel'
      },
      {
        text: 'Oui',
        handler: async () => {
          await cancelAllNotifications()
          await loadPendingNotifications()

          const toast = await toastController.create({
            message: '🔕 Notifications annulées',
            duration: 2000,
            color: 'warning',
            position: 'top'
          })
          await toast.present()
        }
      }
    ]
  })
  await alert.present()
}

function formatNotificationTime(date: Date | undefined) {
  if (!date) return 'Date inconnue'

  const notifDate = new Date(date)
  const now = new Date()

  const diffMs = notifDate.getTime() - now.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (diffMs < 0) {
    return 'Passée'
  }

  if (diffHours === 0) {
    return `Dans ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`
  }

  if (diffHours < 24) {
    return `Dans ${diffHours}h${diffMinutes > 0 ? ` ${diffMinutes}min` : ''}`
  }

  const diffDays = Math.floor(diffHours / 24)
  return `Dans ${diffDays} jour${diffDays > 1 ? 's' : ''}`
}

onMounted(() => {
  if (notificationsEnabled.value) {
    loadPendingNotifications()
  }
})
</script>

<style scoped>
/* Toolbar */
.toolbar-title {
  font-family: 'ADLaM Display', cursive, sans-serif;
  font-weight: 700;
  font-size: 1.3rem;
  color: white;
}

.settings-container {
  max-width: 600px;
  margin: 0 auto;
  padding-bottom: 2rem;
}

.settings-section {
  margin-bottom: 1.5rem;
  background: #FFFFFF;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 2px solid #F2E5CA;
}

.section-title {
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0 0 1.25rem 0;
  color: #633216;
  font-family: 'ADLaM Display', cursive, sans-serif;
}

/* Card d'état des notifications */
.status-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.status-card.enabled {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border: 2px solid #4caf50;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);
}

.status-card.disabled {
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
  border: 2px solid #e0e0e0;
}

.status-icon {
  font-size: 3rem;
  line-height: 1;
  flex-shrink: 0;
}

.status-text h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
}

.status-text p {
  margin: 0;
  font-size: 0.95rem;
  color: #555;
  line-height: 1.4;
}

/* Boutons */
.enable-button {
  margin-top: 1rem;
  --background: linear-gradient(135deg, #955934 0%, #7a4628 100%);
  --box-shadow: 0 4px 12px rgba(149, 89, 52, 0.3);
  font-weight: 600;
  font-size: 1rem;
  height: 52px;
}

.test-button {
  margin-top: 0.75rem;
  --border-color: #955934;
  --color: #955934;
  font-weight: 600;
}

/* État vide */
.empty-state {
  text-align: center;
  padding: 2.5rem 1rem;
  color: #999;
  font-size: 1rem;
  font-style: italic;
}

/* Liste des notifications */
.notifications-list {
  margin: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.notification-item {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  border: 2px solid #F2E5CA;
  border-radius: 12px;
  background: linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.notification-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.notif-icon {
  font-size: 2rem;
  flex-shrink: 0;
  line-height: 1;
}

.notif-content {
  flex: 1;
  min-width: 0;
}

.notif-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #333;
  line-height: 1.3;
}

.notif-content p {
  margin: 0 0 0.75rem 0;
  font-size: 0.95rem;
  color: #666;
  line-height: 1.5;
}

.notif-time {
  display: inline-block;
  font-size: 0.85rem;
  color: #955934;
  font-weight: 600;
  background: #F2E5CA;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
}

/* Card d'information */
.info-card {
  background: linear-gradient(135deg, #FFF9F0 0%, #F2E5CA 100%);
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 5px solid #955934;
  box-shadow: 0 2px 8px rgba(149, 89, 52, 0.1);
}

.info-card p {
  margin: 0 0 1rem 0;
  line-height: 1.6;
  color: #333;
  font-size: 0.95rem;
}

.info-card strong {
  color: #633216;
  font-weight: 700;
}

.info-card ul {
  margin: 1rem 0;
  padding-left: 1.5rem;
  list-style: none;
}

.info-card li {
  margin-bottom: 0.75rem;
  line-height: 1.5;
  color: #444;
  position: relative;
  padding-left: 0.5rem;
}

.info-card li strong {
  color: #633216;
}

.note {
  font-size: 0.9rem;
  color: #666;
  margin-top: 1rem !important;
  padding: 0.75rem;
  background: rgba(149, 89, 52, 0.08);
  border-radius: 8px;
  border-left: 3px solid #955934;
}

/* Debug info */
.debug-info {
  background: linear-gradient(135deg, #263238 0%, #1a1f23 100%);
  color: #aed581;
  padding: 1.25rem;
  border-radius: 12px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.9rem;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

.debug-info p {
  margin: 0.5rem 0;
  line-height: 1.6;
}

.debug-info strong {
  color: #81c784;
}

/* Responsive */
@media (max-width: 640px) {
  .settings-section {
    padding: 1.25rem;
  }

  .section-title {
    font-size: 1.2rem;
  }

  .notification-item {
    padding: 1rem;
  }
}
</style>

