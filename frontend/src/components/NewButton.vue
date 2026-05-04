<script setup>
defineProps(['label']);
</script>

<template>
  <button
    class="flex items-center gap-1.5 mt-1 px-3 py-1.5 rounded-xl text-xs w-full transition-all duration-150"
    style="color:#22c55e;background:rgba(34,197,94,0.06);border:1px dashed rgba(34,197,94,0.3)"
    onmouseover="this.style.background='rgba(34,197,94,0.1)'"
    onmouseout="this.style.background='rgba(34,197,94,0.06)'"
  >
    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
    {{ label }}
  </button>
</template>
