<script setup>
import Toast from '@/components/Toast.vue'
</script>

<template>
  <div class="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true" style="z-index:-1">
    <div class="absolute -top-48 -right-48 w-[520px] h-[520px] rounded-full"
         style="background:radial-gradient(circle,rgba(134,239,172,0.22) 0%,transparent 70%);filter:blur(70px)"></div>
    <div class="absolute -bottom-48 -left-48 w-[520px] h-[520px] rounded-full"
         style="background:radial-gradient(circle,rgba(110,231,183,0.18) 0%,transparent 70%);filter:blur(80px)"></div>
    <div class="absolute top-1/2 left-1/3 w-[400px] h-[400px] rounded-full -translate-y-1/2"
         style="background:radial-gradient(circle,rgba(187,247,208,0.12) 0%,transparent 70%);filter:blur(100px)"></div>
  </div>

  <router-view />
  <Toast />
</template>
