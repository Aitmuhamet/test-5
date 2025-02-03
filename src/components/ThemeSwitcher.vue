<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Moon from './SolarMoonBoldDuotone.vue'
import Sun from './SolarSun2BoldDuotone.vue'

const isLight = ref<boolean>(false);

const toggleTheme = (): void => {
    isLight.value = !isLight.value;
    document.documentElement.classList.toggle('light', isLight.value);
    localStorage.setItem('theme', isLight.value ? 'light' : 'dark');
};

onMounted(() => {
    const savedTheme = localStorage.getItem('theme');
    isLight.value = savedTheme === 'light';
    document.documentElement.classList.toggle('light', isLight.value);
});

</script>

<template>
    <button
        @click="toggleTheme"
        class="theme-switcher"
    >
        <Moon v-if="isLight" />
        <Sun v-else />
    </button>
</template>

<style lang="scss">
.theme-switcher {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    padding: 0px;
    border-radius: 8px;
    color: rgb(var(--color-secondary));
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