import { toastController } from '@ionic/vue';

export interface ToastOptions {
  message: string;
  duration?: number;
  position?: 'top' | 'middle' | 'bottom';
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark';
  header?: string;
  icon?: string;
  cssClass?: string | string[];
}

export function useToast() {
  /**
   * Affiche un toast générique - Auto-dismiss sans bouton
   */
  async function showToast(options: ToastOptions) {
    const cssClasses = ['custom-toast'];

    if (options.cssClass) {
      if (Array.isArray(options.cssClass)) {
        cssClasses.push(...options.cssClass);
      } else {
        cssClasses.push(options.cssClass);
      }
    }

    const toast = await toastController.create({
      header: options.header,
      message: options.message,
      duration: options.duration || 4000,
      position: options.position || 'top',
      color: options.color,
      icon: options.icon,
      buttons: [], // PAS DE BOUTONS - Auto-dismiss uniquement
      cssClass: cssClasses
    });

    await toast.present();
    return toast;
  }

  /**
   * Affiche un toast de succès avec un design moderne
   */
  async function showSuccess(message: string, header?: string) {
    return showToast({
      header: header || '✅ Succès !',
      message,
      cssClass: 'toast-success',
      duration: 3000,
      position: 'top'
    });
  }

  /**
   * Affiche un toast d'erreur avec un design visible
   */
  async function showError(message: string, header?: string) {
    return showToast({
      header: header || '❌ Oups...',
      message,
      cssClass: 'toast-error',
      duration: 4500,
      position: 'top'
    });
  }

  /**
   * Affiche un toast d'information avec un design informatif
   */
  async function showInfo(message: string, header?: string) {
    return showToast({
      header: header || 'ℹ️ Information',
      message,
      cssClass: 'toast-info',
      duration: 3500,
      position: 'top'
    });
  }

  /**
   * Affiche un toast d'avertissement avec un design d'alerte
   */
  async function showWarning(message: string, header?: string) {
    return showToast({
      header: header || '⚠️ Attention !',
      message,
      cssClass: 'toast-warning',
      duration: 5000,
      position: 'top'
    });
  }

  /**
   * Affiche un toast pour un changement d'état de levain
   * Compact et auto-dismiss
   */
  async function showStateChangeToast(emoji: string, title: string, description: string, tips?: string) {
    let formattedMessage = description;

    if (tips) {
      formattedMessage += `\n\n💡 ${tips}`;
    }

    return showToast({
      header: `${emoji} ${title}`,
      message: formattedMessage,
      cssClass: ['toast-state-change', 'toast-top'],
      duration: 6000,
      position: 'top'
    });
  }

  /**
   * Affiche un toast personnalisé pour le nourrissage réussi
   */
  async function showFeedSuccess(newState: string) {
    return showToast({
      header: '🍞 Levain nourri',
      message: `Votre levain est maintenant : ${newState}`,
      cssClass: 'toast-success',
      duration: 3500
    });
  }

  /**
   * Affiche un toast de rappel sympathique
   */
  async function showReminder(message: string) {
    return showToast({
      header: '🔔 Rappel',
      message,
      cssClass: 'toast-info',
      duration: 5000
    });
  }

  return {
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showStateChangeToast,
    showFeedSuccess,
    showReminder
  };
}

