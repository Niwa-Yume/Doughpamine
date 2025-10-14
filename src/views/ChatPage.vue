<template>
  <ion-page>
    <ModernNavBar />
    <ion-content class="ion-padding">
      <div class="chat-container">
        <iframe
          id="JotFormIFrame-0199e1dd7911760488869a65943eb2dbbd18"
          title="Doughpamine AI"
          allow="geolocation; microphone; camera; fullscreen"
          src="https://eu.jotform.com/agent/0199e1dd7911760488869a65943eb2dbbd18?embedMode=iframe&background=0&shadow=1"
          style="max-width:100%; width:100%; height:688px; background: transparent; --pageBackgroundStart: transparent !important; --pageBackgroundEnd: transparent !important;"
        ></iframe>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue';
import ModernNavBar from '@/components/ModernNavBar.vue';
import { onMounted, nextTick } from 'vue';

onMounted(() => {
  const scriptId = 'jotform-embed-handler';
  const iframeId = 'JotFormIFrame-0199e1dd7911760488869a65943eb2dbbd18';
  const selector = `iframe[id='${iframeId}']`;
  const domain = 'https://eu.jotform.com';

  const applyIframeVars = () => {
    const iframe = document.getElementById(iframeId) as HTMLIFrameElement | null;
    if (!iframe) return;
    const s = iframe.style;
    s.setProperty('--pageBackgroundStart', 'transparent', 'important');
    s.setProperty('--pageBackgroundEnd', 'transparent', 'important');
    s.setProperty('background', 'transparent', 'important');
  };

  const initEmbed = () => {
    const handler = (window as any).jotformEmbedHandler as undefined | ((sel: string, domain: string) => void);
    if (typeof handler === 'function') {
      try {
        handler(selector, domain);
      } catch (e) {
        console.warn('Jotform embed handler error:', e);
      }
    }
    // Ré-applique après init au cas où le style a été modifié
    nextTick(() => applyIframeVars());
    setTimeout(applyIframeVars, 300);
  };

  // Assure aussi l’application au chargement de l’iframe
  const iframe = document.getElementById(iframeId) as HTMLIFrameElement | null;
  if (iframe) {
    iframe.addEventListener('load', applyIframeVars, { once: false });
  }

  // Charge le script une seule fois au besoin, puis initialise
  let script = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js';
    script.async = true;
    script.onload = initEmbed;
    document.head.appendChild(script);
  } else {
    initEmbed();
  }
});
</script>

<style scoped>
/* Hauteur par défaut, adaptable selon vos besoins */
.chat-container { width: 100%; background: transparent; }

/* Sécurité supplémentaire: réinitialise aussi les variables sur l'élément iframe */
#JotFormIFrame-0199e1dd7911760488869a65943eb2dbbd18 {
  --pageBackgroundStart: transparent !important;
  --pageBackgroundEnd: transparent !important;
}

/* Optionnel: sur petits écrans on peut réduire la hauteur fixe */
@media (max-width: 420px) {
  #JotFormIFrame-0199e1dd7911760488869a65943eb2dbbd18 { height: 560px !important; }
}
</style>
