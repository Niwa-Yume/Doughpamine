<template>
  <div :class="['new-button', className]">
    <div :class="['text', textClassName]">
      <slot>{{ text }}</slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "NewButton",
  props: {
    className: {
      type: String,
      default: "",
    },
    text: {
      type: String,
      default: "NOURRIR",
    },
    textClassName: {
      type: String,
      default: "",
    },
  },
});
</script>

<style>
.new-button {
  align-items: center;
  background-color: var(--marron);
  border: 2px solid;
  border-color: var(--dark-pure-black);
  border-radius: 4000px;
  box-shadow: var(--block-shadow-small);
  display: inline-flex;
  gap: 10px;
  justify-content: center;
  left: 609px;
  overflow: hidden;
  padding: 15px 85px;
  position: relative;
  top: 648px;
}

.new-button .text {
  align-items: center;
  color: var(--pure-white);
  display: flex;
  font-family: "ADLaM Display-Regular", Helvetica;
  font-size: 18px;
  font-weight: 800;
  justify-content: center;
  letter-spacing: -0.36px;
  line-height: normal;
  position: relative;
  text-align: center;
  width: fit-content;
}
</style>