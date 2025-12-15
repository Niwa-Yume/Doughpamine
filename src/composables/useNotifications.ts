import { ref } from 'vue'
import { LocalNotifications } from '@capacitor/local-notifications'
import { PushNotifications } from '@capacitor/push-notifications'
import { Capacitor } from '@capacitor/core'
import { parseDelayHours, STATE_DB_TO_MACHINE, LEVAIN_STATE_MACHINE } from '@/config/levainStateMachine'

/**
 * 🔔 Hook pour gérer les notifications push locales et distantes
 *
 * Types de notifications :
 * 1. Notifications locales (planifiées) - Rappels basés sur l'état du levain
 * 2. Notifications push (Firebase/APNs) - Futures fonctionnalités
 */

export function useNotifications() {
  const notificationsEnabled = ref(false)
  const notificationsPermission = ref<'granted' | 'denied' | 'prompt'>('prompt')

  /**
   * 🎯 Demande la permission pour les notifications
   * IMPORTANT : Sur iOS, cette permission doit être demandée en réponse à une action utilisateur
   */
  async function requestPermissions() {
    // Vérifier si on est sur mobile
    if (!Capacitor.isNativePlatform()) {
      console.log('📱 Pas sur une plateforme native, notifications désactivées')
      return false
    }

    try {
      // 1️⃣ Demander la permission pour les notifications locales
      const localPermission = await LocalNotifications.requestPermissions()
      console.log('🔔 Permission notifications locales:', localPermission.display)

      if (localPermission.display === 'granted') {
        notificationsEnabled.value = true
        notificationsPermission.value = 'granted'

        // 2️⃣ Créer le canal de notification Android (obligatoire pour Android 8+)
        if (Capacitor.getPlatform() === 'android') {
          await LocalNotifications.createChannel({
            id: 'levain-reminders',
            name: 'Rappels Levain',
            description: 'Notifications pour prendre soin de votre levain',
            importance: 4, // High importance
            sound: 'notification.wav',
            vibration: true
          })
        }

        // 3️⃣ Configuration des listeners
        setupNotificationListeners()

        return true
      } else {
        notificationsPermission.value = 'denied'
        return false
      }
    } catch (error) {
      console.error('❌ Erreur lors de la demande de permissions:', error)
      return false
    }
  }

  /**
   * 🎧 Configure les listeners pour les interactions avec les notifications
   */
  function setupNotificationListeners() {
    // Quand l'utilisateur tape sur une notification
    LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      console.log('👆 Notification tappée:', notification)
      // Vous pouvez naviguer vers une page spécifique ici
      // Ex: router.push('/home')
    })

    // Quand une notification est reçue (app en premier plan)
    LocalNotifications.addListener('localNotificationReceived', (notification) => {
      console.log('📨 Notification reçue:', notification)
    })
  }

  /**
   * 🗓️ Planifie une notification pour rappeler de nourrir le levain
   * @param levainName - Nom du levain
   * @param currentState - État actuel du levain (nom BDD)
   * @param lastFedAt - Date du dernier nourrissage
   */
  async function scheduleNextFeedingReminder(
    levainName: string,
    currentState: string,
    lastFedAt: string
  ) {
    if (!notificationsEnabled.value) {
      console.log('🔕 Notifications désactivées')
      return
    }

    try {
      // 1️⃣ Annuler toutes les notifications précédentes
      await LocalNotifications.cancel({ notifications: [{ id: 1 }] })

      // 2️⃣ Calculer quand envoyer la notification
      const machineState = STATE_DB_TO_MACHINE[currentState]
      const stateConfig = machineState ? LEVAIN_STATE_MACHINE.states[machineState] : null
      const rienFaireAction = stateConfig?.actions.rien_faire

      if (!rienFaireAction?.delay_h) {
        console.log('⏸️ Pas de transition automatique, pas de notification')
        return
      }

      const delayHours = parseDelayHours(rienFaireAction.delay_h) || 24

      let notificationDelayHours: number
      let notificationTime: Date
      const lastFed = new Date(lastFedAt)

      // ⚡ Gestion spéciale pour les délais courts (< 2h)
      if (delayHours < 2) {
        // Pour l'état "prêt" (0.5h) et autres états courts
        // Envoyer une notification dans 5 minutes pour informer l'utilisateur
        notificationTime = new Date(Date.now() + 5 * 60 * 1000) // Dans 5 minutes
        console.log(`⚡ Délai court détecté (${delayHours}h), notification dans 5 minutes`)
      } else {
        // Pour les délais normaux : notification 1h avant la transition
        notificationDelayHours = Math.max(1, delayHours - 1)
        notificationTime = new Date(lastFed.getTime() + notificationDelayHours * 60 * 60 * 1000)
      }

      // Ne pas planifier si c'est dans le passé
      if (notificationTime.getTime() <= Date.now()) {
        console.log('⏰ Notification déjà passée, pas de planification')
        return
      }

      // 3️⃣ Créer le message selon l'état et le contexte
      const messages = {
        'jeune': {
          title: '🌱 Temps de nourrir votre bébé levain !',
          body: `${levainName} a besoin d'attention pour bien grandir. Jour ${Math.floor((Date.now() - lastFed.getTime()) / (1000 * 60 * 60 * 24))}/6`
        },
        'actif': {
          title: '✨ Votre levain sera bientôt affamé',
          body: `${levainName} doit être nourri dans l'heure qui vient pour rester en forme`
        },
        'prêt': {
          title: '🍞 Levain au pic de forme !',
          body: `${levainName} est prêt à utiliser maintenant ! Profitez-en dans les 2-3h pour faire du pain parfait 🎯`
        },
        'affamé': {
          title: '😋 Votre levain a TRÈS faim !',
          body: `${levainName} n'a pas été nourri depuis longtemps. Nourrissez-le rapidement ! ⏰`
        },
        'négligé': {
          title: '🆘 URGENT : Levain en danger !',
          body: `${levainName} risque de mourir ! Nourrissez-le IMMÉDIATEMENT ou il sera perdu ! 💀`
        },
        'au_frais': {
          title: '❄️ Levain au frais - Rappel',
          body: `${levainName} est au réfrigérateur depuis longtemps. Pensez à le sortir et le nourrir bientôt 🧊`
        }
      }

      const message = messages[machineState as keyof typeof messages] || {
        title: '🔔 Rappel levain',
        body: `Pensez à prendre soin de ${levainName}`
      }

      // 4️⃣ Planifier la notification
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 1,
            title: message.title,
            body: message.body,
            schedule: {
              at: notificationTime
            },
            sound: 'notification.wav',
            channelId: 'levain-reminders',
            extra: {
              levainState: currentState,
              action: 'feed'
            }
          }
        ]
      })

      console.log('✅ Notification planifiée pour:', notificationTime.toLocaleString())
    } catch (error) {
      console.error('❌ Erreur lors de la planification de la notification:', error)
    }
  }

  /**
   * 🔕 Annule toutes les notifications planifiées
   */
  async function cancelAllNotifications() {
    try {
      const pending = await LocalNotifications.getPending()
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({
          notifications: pending.notifications
        })
        console.log(`🔕 ${pending.notifications.length} notification(s) annulée(s)`)
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'annulation des notifications:', error)
    }
  }

  /**
   * 📊 Vérifie les notifications en attente
   */
  async function checkPendingNotifications() {
    try {
      const pending = await LocalNotifications.getPending()
      console.log('📋 Notifications en attente:', pending.notifications)
      return pending.notifications
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des notifications:', error)
      return []
    }
  }

  /**
   * 🚀 Envoie une notification de test
   */
  async function sendTestNotification() {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 999,
            title: '🎉 Notification de test',
            body: 'Les notifications fonctionnent correctement !',
            schedule: {
              at: new Date(Date.now() + 1000 * 5) // Dans 5 secondes
            },
            sound: 'notification.wav',
            channelId: 'levain-reminders'
          }
        ]
      })
      console.log('✅ Notification de test planifiée dans 5 secondes')
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de la notification de test:', error)
    }
  }

  /**
   * 🌍 Configuration future pour les notifications push distantes (Firebase/APNs)
   * Cette fonction sera utile plus tard pour envoyer des notifications depuis Supabase
   */
  async function registerPushNotifications() {
    if (!Capacitor.isNativePlatform()) return

    try {
      // Demander la permission pour les push notifications
      const permission = await PushNotifications.requestPermissions()

      if (permission.receive === 'granted') {
        // S'enregistrer auprès de FCM (Firebase) / APNs (Apple)
        await PushNotifications.register()

        // Écouter le token de l'appareil
        PushNotifications.addListener('registration', async (token) => {
          console.log('🎯 Push notification token:', token.value)

          // TODO : Sauvegarder le token dans Supabase pour envoyer des notifs depuis le backend
          // await supabase.from('user_devices').upsert({
          //   user_id: user.id,
          //   device_token: token.value,
          //   platform: Capacitor.getPlatform()
          // })
        })

        // Écouter les erreurs
        PushNotifications.addListener('registrationError', (error) => {
          console.error('❌ Erreur push notifications:', error)
        })

        // Écouter les notifications reçues
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('📨 Push notification reçue:', notification)
        })
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement push:', error)
    }
  }

  return {
    // État
    notificationsEnabled,
    notificationsPermission,

    // Actions
    requestPermissions,
    scheduleNextFeedingReminder,
    cancelAllNotifications,
    checkPendingNotifications,
    sendTestNotification,
    registerPushNotifications
  }
}

