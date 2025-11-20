<template>
  <div class="icon-list" role="navigation" aria-label="Raccourcis">
    <img src="/assets/icon/flamme.png" alt="Flamme" />
    <img src="/assets/icon/icon de profile.png" alt="Profile" />
  </div>
</template>

<style scoped>
.icon-list {
  position: absolute;
  /* Aligné sur la même ligne que l'avatar Jotform */
  top: calc(env(safe-area-inset-top, 0px) + 28px);
  /* Positionné à droite dans le conteneur parent */
  right: 12px;

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
