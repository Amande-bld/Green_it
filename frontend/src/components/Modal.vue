<script setup>
const props = defineProps({
  show: Boolean,
  title: { type: String, default: '' }
});
const emit = defineEmits(['close']);
const close = () => emit('close');
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="close">
    <div class="glass-strong rounded-2xl p-6 w-full max-w-md relative overflow-hidden">
      <div class="absolute top-0 left-[15%] right-[15%] h-px pointer-events-none"
           style="background:linear-gradient(90deg,transparent,rgba(255,255,255,1),transparent)"></div>

      <header class="flex justify-between items-center mb-5">
        <h2 class="text-base font-bold" style="color:#111827">{{ title }}</h2>
        <button @click="close" class="btn-icon">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </header>

      <div style="color:#374151">
        <slot></slot>
      </div>

      <footer class="flex justify-end mt-5 gap-2 pt-4" style="border-top:1px solid rgba(0,0,0,0.06)">
        <slot name="footer">
          <button class="btn-ghost" @click="close">Fermer</button>
        </slot>
      </footer>
    </div>
  </div>
</template>
