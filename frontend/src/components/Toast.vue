<script setup>
import { computed } from 'vue';
import { useToastStore } from '@/store/';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/vue/24/solid';

const toast = useToastStore();

const config = {
  success: { icon: CheckCircleIcon, color: '#16a34a', bg: 'rgba(22,163,74,0.08)', border: 'rgba(22,163,74,0.2)' },
  error:   { icon: XCircleIcon,     color: '#dc2626', bg: 'rgba(220,38,38,0.08)', border: 'rgba(220,38,38,0.2)' },
  warning: { icon: ExclamationTriangleIcon, color: '#d97706', bg: 'rgba(217,119,6,0.08)', border: 'rgba(217,119,6,0.2)' },
};

const current = computed(() => config[toast.type] || config.success);
const IconComponent = computed(() => current.value.icon);
</script>

<template>
  <transition name="fade">
    <div v-if="toast.isVisible" class="fixed top-5 left-1/2 -translate-x-1/2 z-[9999]">
      <div
        class="flex items-center gap-3 px-4 py-3 rounded-2xl min-w-[260px] max-w-sm"
        :style="{
          background: current.bg,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${current.border}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }"
        role="alert"
      >
        <component :is="IconComponent" class="w-5 h-5 shrink-0" :style="{ color: current.color }"/>
        <span class="text-sm font-medium flex-1" style="color:#111827">{{ toast.message }}</span>
        <button @click="toast.hide" class="btn-icon shrink-0" style="border:none;background:none;padding:2px">
          <XMarkIcon class="w-4 h-4" style="color:#9ca3af"/>
        </button>
      </div>
    </div>
  </transition>
</template>
