<script setup>
import { ref, onMounted } from 'vue'

const isLight = ref(false)

const toggleTheme = () => {
    isLight.value = !isLight.value
    document.documentElement.classList.toggle('light', isLight.value)
    localStorage.setItem('theme', isLight.value ? 'light' : 'dark')
}

onMounted(() => {
    const savedTheme = localStorage.getItem('theme')
    isLight.value = savedTheme === 'light'
    document.documentElement.classList.toggle('light', isLight.value)
})
</script>

<template>
    <button
        @click="toggleTheme"
        class="theme-switcher"
    >
        {{ isLight ? '🌙' : '☀️' }}
    </button>
</template>

<style lang="scss">
.theme-switcher {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 5px;
  background-color: rgb(var(--color-primary-bg), .1);
  transition: background-color .3s ease, transform .3s ease;
}
.theme-switcher:hover {
    background-color: rgb(var(--color-secondary), .1);
}
.theme-switcher:active {
    transform: scale(0.3);
    background-color: blue;
}
</style>