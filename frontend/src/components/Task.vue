<script setup>
import { ref, computed } from 'vue';
import { useGlobalStore } from '@/store';
import TaskPopup from './TaskPopup.vue';

const props = defineProps(['task']);
const global = useGlobalStore();
const showTaskPopup = ref(false);

const statusColor = computed(() => {
  if (props.task.status === 'done') return '#16a34a';
  if (props.task.status === 'doing') return '#d97706';
  return '#dc2626';
});

const statusLabel = computed(() => {
  if (props.task.status === 'done') return 'terminé';
  if (props.task.status === 'doing') return 'en cours';
  return 'à faire';
});

const priorityStyle = computed(() => {
  if (props.task.priority === 'high') return 'background:rgba(220,38,38,0.08);color:#dc2626';
  if (props.task.priority === 'mid') return 'background:rgba(217,119,6,0.08);color:#d97706';
  return 'background:rgba(107,114,128,0.08);color:#6b7280';
});

const formattedDeadline = computed(() => {
  if (!props.task.deadline) return '';
  return new Date(props.task.deadline).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
});
</script>

<template>
  <div
    class="glass rounded-xl px-3 py-2.5 transition-all duration-200 relative overflow-hidden cursor-pointer"
    style="border-left-width:3px"
    :style="{ borderLeftColor: statusColor }"
  >
    <!-- Status tint -->
    <div class="absolute left-0 top-0 bottom-0 w-8 pointer-events-none"
         :style="{ background: `linear-gradient(90deg,${statusColor}10,transparent)` }"></div>

    <!-- Title row -->
    <div class="flex items-start justify-between gap-2 relative">
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <button
          class="w-3.5 h-3.5 rounded-full shrink-0 mt-0.5 transition-all duration-200"
          :style="{ background: statusColor, boxShadow: `0 0 5px ${statusColor}60` }"
          @click.stop="global.editStatus(task.id)"
          :title="`Statut : ${statusLabel}`"
        ></button>
        <p class="font-semibold text-sm truncate" style="color:#111827">{{ task.title }}</p>
      </div>
      <button
        class="shrink-0 rounded-lg p-0.5 transition-all duration-150 hover:bg-black/5"
        style="color:#9ca3af"
        @click.stop="showTaskPopup = true"
        title="Détails"
      >
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <circle cx="12" cy="8" r="0.5" fill="currentColor"/>
        </svg>
      </button>
    </div>

    <!-- Chips -->
    <div class="flex flex-wrap gap-1 mt-1.5 ml-5 relative">
      <span class="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
            :style="`background:${statusColor}12;color:${statusColor}`">
        {{ statusLabel }}
      </span>
      <span v-if="task.priority" class="text-[10px] px-1.5 py-0.5 rounded-md font-medium" :style="priorityStyle">
        {{ task.priority }}
      </span>
      <span v-if="task.deadline" class="text-[10px]" style="color:#9ca3af">
        📅 {{ formattedDeadline }}
      </span>
    </div>

    <p v-if="task.description" class="mt-1 ml-5 text-xs italic truncate relative" style="color:#9ca3af">
      {{ task.description }}
    </p>

    <div v-if="task.carbon_impact" class="mt-1.5 ml-5 inline-flex items-center gap-1 text-[10px] font-bold relative"
         style="color:#15803d">
      🌱 {{ task.carbon_impact }}g CO₂e
    </div>

    <p v-if="task.folder_name || task.group_name" class="mt-0.5 ml-5 text-[10px] relative" style="color:#d1d5db">
      {{ task.folder_name || task.group_name }}
    </p>

    <TaskPopup :show="showTaskPopup" :task="task" @close="showTaskPopup = false"/>
  </div>
</template>
