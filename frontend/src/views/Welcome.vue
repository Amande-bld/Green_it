<script setup>
import { RouterLink } from 'vue-router';
import image from '../logo.avif';
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen px-4">

    <!-- Glass card -->
    <div class="glass-strong relative rounded-3xl px-10 py-12 flex flex-col items-center gap-7 w-full max-w-sm overflow-hidden">
      <!-- Top shine -->
      <div class="absolute top-0 left-[15%] right-[15%] h-px pointer-events-none"
           style="background:linear-gradient(90deg,transparent,rgba(255,255,255,1),transparent)"></div>

      <!-- Logo -->
      <div class="relative">
        <div class="absolute inset-0 rounded-2xl"
             style="background:radial-gradient(circle,rgba(34,197,94,0.2) 0%,transparent 70%);filter:blur(10px)"></div>
        <img :src="image" alt="To-Doux" loading="lazy"
             class="relative w-20 h-20 rounded-2xl object-cover"
             style="box-shadow:0 8px 28px rgba(34,197,94,0.22),0 2px 8px rgba(0,0,0,0.08)"/>
      </div>

      <!-- Brand -->
      <div class="text-center">
        <h1 class="text-5xl font-black tracking-tight leading-none" style="color:#111827">To-Doux</h1>
        <p class="mt-2.5 font-semibold text-base" style="color:#16a34a">To-Doux pour la Terre 🌱</p>
      </div>

      <!-- Tagline -->
      <p class="text-sm text-center leading-relaxed" style="color:#6b7280">
        Gérez vos tâches tout en mesurant<br>votre empreinte carbone.
      </p>

      <!-- CTAs -->
      <div class="flex gap-3 w-full">
        <RouterLink
          to="/login"
          class="flex-1 text-center py-3 rounded-2xl font-semibold text-sm transition-all duration-200"
          style="background:rgba(22,163,74,0.08);border:1px solid rgba(22,163,74,0.2);color:#15803d"
          onmouseover="this.style.background='rgba(22,163,74,0.13)'"
          onmouseout="this.style.background='rgba(22,163,74,0.08)'"
        >
          Connexion
        </RouterLink>
        <RouterLink
          to="/signup"
          class="flex-1 text-center py-3 rounded-2xl font-semibold text-sm text-white transition-all duration-200"
          style="background:linear-gradient(135deg,#22c55e,#16a34a);box-shadow:0 4px 16px rgba(34,197,94,0.3)"
        >
          S'inscrire
        </RouterLink>
      </div>
    </div>

    <p class="mt-8 text-xs" style="color:#9ca3af">🌿 Numérique responsable</p>
  </div>
</template>
