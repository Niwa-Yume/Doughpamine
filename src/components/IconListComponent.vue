<template>
  <div class="icon-list">
    <img src="/assets/icon/flamme.png" alt="Flamme" />
    <img src="/assets/icon/icon de profile.png" alt="Profile" />
  </div>
</template>

<style scoped>
.icon-list {
  position: fixed;
  /* Aligné sur le haut du widget Jotform */
  top: calc(env(safe-area-inset-top, 0px) + 31px);
  /* Positionné plus à droite pour éviter la superposition */
  left: calc(env(safe-area-inset-left, 0px) + 230px);
  
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  
  padding: 10px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 20px;
  /* Assure que la liste est cliquable et au-dessus des autres éléments */
  z-index: 9999;
  pointer-events: auto;
}

img {
  width: 24px;
  height: 24px;
}
</style>
