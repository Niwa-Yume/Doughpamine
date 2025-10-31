<template>
  <div>
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
  },
  setup(props) {
    const anchor = ref<HTMLElement | null>(null)
    let domObserver: MutationObserver | null = null

    const setImportant = (el: HTMLElement | null) => {
      if (!el) return
      const top = `calc(env(safe-area-inset-top, 0px) + ${props.topOffsetPx}px)`
      const left = `calc(env(safe-area-inset-left, 0px) + ${props.leftOffsetPx}px)`
      el.style.setProperty('position', 'fixed', 'important')
      el.style.setProperty('top', top, 'important')
      el.style.setProperty('left', left, 'important')
      el.style.setProperty('right', 'auto', 'important')
      el.style.setProperty('bottom', 'auto', 'important')
      el.style.setProperty('margin', '0', 'important')
      el.style.setProperty('z-index', '9999', 'important')
    }

    const applyStyles = () => {
      const root = document.getElementById(`JotformAgent-${props.agentId}`) as HTMLElement | null
      if (!root) return false

      root.style.setProperty('pointer-events', 'none', 'important')

      const avatar = root.querySelector('.ai-agent-chat-avatar-container') as HTMLElement | null
      if (avatar) {
        setImportant(avatar)
        avatar.style.setProperty('transform', `scale(${props.scale})`, 'important')
        avatar.style.setProperty('transform-origin', 'top left', 'important')
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

    onMounted(() => {
      const already = ensureOnce()

      domObserver = new MutationObserver(() => {
        applyStyles()
      })
      domObserver.observe(document.body, { childList: true, subtree: true, attributes: true })

      if (already) applyStyles()
    })

    onBeforeUnmount(() => {
      if (domObserver) { domObserver.disconnect(); domObserver = null }
    })

    return { anchor }
  }
})
</script>

<style scoped>
.jotform-agent-anchor {
  position: fixed;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  pointer-events: none; /* ne bloque aucun clic */
}
</style>
