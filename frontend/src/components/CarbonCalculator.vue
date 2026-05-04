<script setup>
import { ref, computed } from 'vue';
import { useGlobalStore } from '@/store';

const props = defineProps({ selectedTask: Object });
const global = useGlobalStore();

const distance = ref(1);
const selectedMode = ref('voiture');

const modes = [
  { id: 'pied',    name: 'À pied', emoji: '🚶', factor: 0,   color: '#94a3b8' },
  { id: 'velo',    name: 'Vélo',   emoji: '🚲', factor: 0,   color: '#22c55e' },
  { id: 'metro',   name: 'Métro',  emoji: '🚇', factor: 5,   color: '#3b82f6' },
  { id: 'bus',     name: 'Bus',    emoji: '🚌', factor: 300, color: '#f97316' },
  { id: 'elec',    name: 'Élec.',  emoji: '⚡', factor: 120, color: '#8b5cf6' },
  { id: 'voiture', name: 'Voiture',emoji: '🚗', factor: 436, color: '#ef4444' },
];

const currentEmission = computed(() => {
  const m = modes.find(m => m.id === selectedMode.value);
  return m ? m.factor * distance.value : 0;
});

const levelInfo = computed(() => {
  if (currentEmission.value < 50) return { text: 'faible', style: 'background:rgba(22,163,74,0.1);color:#15803d' };
  if (currentEmission.value < 200) return { text: 'moyen', style: 'background:rgba(217,119,6,0.1);color:#d97706' };
  return { text: 'élevé', style: 'background:rgba(220,38,38,0.1);color:#dc2626' };
});

const maxEmission = computed(() => Math.max(...modes.map(m => m.factor)) * distance.value || 1);
const getBarWidth = (mode) => ((mode.factor * distance.value) / maxEmission.value) * 100;

const saveToTask = async () => {
  if (!props.selectedTask) return;
  await global.editTask({ ...props.selectedTask, carbon_impact: currentEmission.value });
  await global.fetchTasks();
};
</script>

<template>
  <div class="glass rounded-2xl p-4 w-full">

    <div class="flex items-center gap-2 mb-4">
      <span class="text-base">🌍</span>
      <h3 class="text-sm font-bold" style="color:#111827">Empreinte carbone</h3>
    </div>

    <!-- Transport modes -->
    <div class="mb-4">
      <p class="glass-label mb-2">Mode de transport</p>
      <div class="grid grid-cols-3 gap-1.5">
        <button
          v-for="mode in modes"
          :key="mode.id"
          @click="selectedMode = mode.id"
          class="py-1.5 px-1 rounded-xl text-[11px] font-medium transition-all duration-150 text-center"
          :style="selectedMode === mode.id
            ? 'background:rgba(22,163,74,0.1);border:1px solid rgba(22,163,74,0.3);color:#15803d'
            : 'background:rgba(0,0,0,0.03);border:1px solid rgba(0,0,0,0.07);color:#6b7280'"
        >
          {{ mode.emoji }} {{ mode.name }}
        </button>
      </div>
    </div>

    <!-- Distance -->
    <div class="mb-4">
      <div class="flex justify-between items-center mb-1">
        <p class="glass-label">Distance aller</p>
        <span class="text-sm font-bold" style="color:#16a34a">{{ distance }} km</span>
      </div>
      <input type="range" v-model="distance" min="1" max="50" class="w-full"/>
    </div>

    <!-- Result -->
    <div class="rounded-xl p-3 mb-4" style="background:rgba(0,0,0,0.03);border:1px solid rgba(0,0,0,0.06)">
      <div class="flex items-center justify-between">
        <span class="text-2xl font-black" style="color:#111827">
          {{ currentEmission }}<span class="text-sm font-medium ml-1" style="color:#6b7280">g</span>
        </span>
        <span class="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full" :style="levelInfo.style">
          {{ levelInfo.text }}
        </span>
      </div>
      <p class="text-[10px] mt-0.5" style="color:#9ca3af">CO₂e — aller-retour</p>
    </div>

    <!-- Comparison bars -->
    <div class="space-y-1.5 mb-4">
      <p class="glass-label mb-2">Comparaison</p>
      <div v-for="mode in modes" :key="'c-'+mode.id" class="flex items-center gap-2 text-[11px]">
        <span class="w-10 shrink-0" style="color:#6b7280">{{ mode.emoji }}</span>
        <div class="flex-1 h-1.5 rounded-full overflow-hidden" style="background:rgba(0,0,0,0.06)">
          <div class="h-full rounded-full transition-all duration-500"
               :style="{ width: getBarWidth(mode)+'%', background: mode.color }"></div>
        </div>
        <span class="w-10 text-right font-mono" style="color:#9ca3af">{{ mode.factor * distance }}g</span>
      </div>
    </div>

    <!-- Save -->
    <div class="pt-3" style="border-top:1px solid rgba(0,0,0,0.06)">
      <div v-if="selectedTask">
        <div class="flex items-center gap-2 text-xs mb-2" style="color:#6b7280">
          <span>Cible :</span>
          <span class="px-2 py-0.5 rounded-lg font-semibold"
                style="background:rgba(22,163,74,0.1);color:#15803d">
            {{ selectedTask.title }}
          </span>
        </div>
        <button @click="saveToTask" class="btn-primary w-full text-xs py-2">
          🌱 Enregistrer ({{ currentEmission }}g CO₂e)
        </button>
      </div>
      <div v-else class="text-center text-xs italic py-3 rounded-xl"
           style="color:#9ca3af;background:rgba(0,0,0,0.03);border:1px dashed rgba(0,0,0,0.1)">
        Sélectionne une tâche pour lui associer cette empreinte
      </div>
    </div>
  </div>
</template>
