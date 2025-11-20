<template>
  <div class="jotform-header-container">
    <IconListComponent />
    <div ref="anchor" class="jotform-agent-anchor" aria-hidden="true" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onBeforeUnmount, ref } from 'vue'
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
    let domObserver: MutationObserver | null = null

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
      el.style.setProperty('z-index', '9999', 'important')
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
        iframe.style.setProperty('z-index', '2147483647', 'important')
      }

      return true
    }

    const ensureOnce = () => {
      const existingRoot = document.getElementById(`JotformAgent-${props.agentId}`)
      if (existingRoot) return true

      const existingScript = document.querySelector(`script[src*="${props.agentId}/embed.js"]`)
      if (existingScript) return true

      const s = document.createElement('script')
      s.async = true
      s.src = `https://cdn.jotfor.ms/agent/embedjs/${props.agentId}/embed.js`
      s.setAttribute('data-jot-agent', 'true')
      ;(anchor.value ?? document.body).appendChild(s)
      return false
    }

    // Gestion du resize pour recalculer la position
    const handleResize = () => {
      applyStyles()
    }

    onMounted(() => {
      const already = ensureOnce()

      domObserver = new MutationObserver(() => {
        applyStyles()
      })
      domObserver.observe(document.body, { childList: true, subtree: true, attributes: true })

      window.addEventListener('resize', handleResize)

      if (already) applyStyles()
    })

    onBeforeUnmount(() => {
      if (domObserver) { domObserver.disconnect(); domObserver = null }
      window.removeEventListener('resize', handleResize)
    })

    return { anchor }
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

.jotform-agent-anchor {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  pointer-events: none; /* ne bloque aucun clic */
}
</style>
