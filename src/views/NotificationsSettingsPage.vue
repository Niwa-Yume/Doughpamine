<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Paramètres Notifications</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
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
.settings-container {
  max-width: 600px;
  margin: 0 auto;
}

.settings-section {
  margin-bottom: 2rem;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #333;
}

.status-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.status-card.enabled {
  background: #e8f5e9;
  border: 2px solid #4caf50;
}

.status-card.disabled {
  background: #fafafa;
  border: 2px solid #ddd;
}

.status-icon {
  font-size: 2.5rem;
}

.status-text h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.status-text p {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.enable-button {
  margin-top: 1rem;
}

.test-button {
  margin-top: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.notifications-list {
  margin: 1rem 0;
}

.notification-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  background: #fafafa;
}

.notif-icon {
  font-size: 1.5rem;
}

.notif-content {
  flex: 1;
}

.notif-content h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.notif-content p {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #666;
}

.notif-time {
  font-size: 0.85rem;
  color: #999;
  font-style: italic;
}

.info-card {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #2196f3;
}

.info-card p {
  margin: 0 0 0.75rem 0;
  line-height: 1.5;
}

.info-card ul {
  margin: 0.75rem 0;
  padding-left: 1.5rem;
}

.info-card li {
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.note {
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.75rem !important;
}

.debug-info {
  background: #263238;
  color: #aed581;
  padding: 1rem;
  border-radius: 8px;
  font-family: monospace;
}

.debug-info p {
  margin: 0.5rem 0;
}
</style>

