<template>
  <div v-if="isHomePage" class="jotform-header-container">
    <div class="icon-wrapper-area">
      <IconListComponent />
    </div>
    <div ref="anchor" class="jotform-agent-anchor" aria-hidden="true" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onBeforeUnmount, ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import IconListComponent from './IconListComponent.vue'

export default defineComponent({
  name: 'JotformAgent',
  components: {
    IconListComponent,
  },
  props: {
    agentId: { type: String, default: '0199e1dd7911760488869a65943eb2dbbd18' },
    topOffsetPx: { type: Number, default: 28 },
    leftOffsetPx: { type: Number, default: 12 },
    scale: { type: Number, default: 0.85 },
    centered: { type: Boolean, default: false },
  },
  setup(props) {
    const anchor = ref<HTMLElement | null>(null)
    const route = useRoute()
    const isHomePage = computed(() => route.path === '/home')
    const scriptRef = ref<HTMLScriptElement | null>(null)
    let domObserver: MutationObserver | null = null
    let isAgentActive = false

    const setImportant = (el: HTMLElement | null) => {
      if (!el) return

      // Calcul de la position pour rester dans le conteneur centré max-width: 390px
      const viewportWidth = window.innerWidth;
      const containerMaxWidth = 390;
      const containerLeft = Math.max(0, (viewportWidth - containerMaxWidth) / 2);

      const top = `calc(env(safe-area-inset-top, 0px) + ${props.topOffsetPx}px)`
      const left = `${containerLeft + props.leftOffsetPx}px`;

      el.style.setProperty('position', 'fixed', 'important')
      el.style.setProperty('top', top, 'important')
      el.style.setProperty('left', left, 'important')
      el.style.setProperty('right', 'auto', 'important')
      el.style.setProperty('bottom', 'auto', 'important')
      el.style.setProperty('margin', '0', 'important')
      el.style.setProperty('width', 'fit-content', 'important')
      el.style.setProperty('height', 'fit-content', 'important')
      el.style.setProperty('z-index', '1000', 'important') // Sous les toasts (z-index: 60000)
      el.style.setProperty('transform', `scale(${props.scale})`, 'important')
      el.style.setProperty('transform-origin', 'top left', 'important')
    }

    const applyStyles = () => {
      const root = document.getElementById(`JotformAgent-${props.agentId}`) as HTMLElement | null
      if (!root) return false

      root.style.setProperty('pointer-events', 'none', 'important')

      const avatar = root.querySelector('.ai-agent-chat-avatar-container') as HTMLElement | null
      if (avatar) {
        setImportant(avatar)
        avatar.style.setProperty('pointer-events', 'auto', 'important')
      }

      const iframe = root.querySelector('iframe') as HTMLElement | null
      if (iframe) {
        iframe.style.setProperty('pointer-events', 'auto', 'important')
        iframe.style.setProperty('z-index', '1001', 'important') // Juste au-dessus de l'avatar mais sous les toasts
      }

      return true
    }

    const loadAgentScript = () => {
      const existingRoot = document.getElementById(`JotformAgent-${props.agentId}`)
      if (existingRoot) return true

      if (scriptRef.value) return false

      const s = document.createElement('script')
      s.async = true
      s.src = `https://cdn.jotfor.ms/agent/embedjs/${props.agentId}/embed.js`
      s.setAttribute('data-jot-agent', 'true')
      ;(anchor.value ?? document.body).appendChild(s)
      scriptRef.value = s
      return false
    }

    const cleanupAgentDom = () => {
      document.getElementById(`JotformAgent-${props.agentId}`)?.remove()
      if (scriptRef.value) {
        scriptRef.value.remove()
        scriptRef.value = null
      }
    }

    // Gestion du resize pour recalculer la position
    const handleResize = () => {
      applyStyles()
    }

    const stopObserver = () => {
      if (domObserver) {
        domObserver.disconnect()
        domObserver = null
      }
    }

    const startAgent = () => {
      if (isAgentActive) return
      isAgentActive = true
      const already = loadAgentScript()
      domObserver = new MutationObserver(() => applyStyles())
      domObserver.observe(document.body, { childList: true, subtree: true, attributes: true })
      window.addEventListener('resize', handleResize)
      if (already) applyStyles()
    }

    const stopAgent = () => {
      if (!isAgentActive) return
      isAgentActive = false
      stopObserver()
      window.removeEventListener('resize', handleResize)
      cleanupAgentDom()
    }

    const stopRouteWatch = watch(
      isHomePage,
      (val) => {
        if (val) startAgent()
        else stopAgent()
      },
      { immediate: true }
    )

    onMounted(() => {
      // ensure anchor exists before script injection
      if (isHomePage.value) startAgent()
    })

    onBeforeUnmount(() => {
      stopRouteWatch()
      stopAgent()
    })

    return { anchor, isHomePage }
  }
})
</script>

<style scoped>
.jotform-header-container {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 390px;
  z-index: 9999;
  pointer-events: none;
}

.icon-wrapper-area {
  pointer-events: auto;
}

.jotform-agent-anchor {
  position: absolute;
  top: 0;
  left: 0;
  width: fit-content;
  height: 0;
  pointer-events: none; /* ne bloque aucun clic */
}
</style>
