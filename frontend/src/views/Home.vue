<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import { useGlobalStore, useChatStore } from '../store';
import TopBar from '@/components/TopBar.vue';
import SideBar from '@/components/SideBar.vue';
import Task from '@/components/Task.vue';
import NewTask from '@/components/NewTask.vue';
import { ArrowPathIcon, PlusCircleIcon } from '@heroicons/vue/24/solid';
import { AdjustmentsHorizontalIcon, ChatBubbleBottomCenterIcon, Cog6ToothIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import NewFolder from '@/components/NewFolder.vue';
import NewGroup from '@/components/NewGroup.vue';
import FolderPopup from '@/components/FolderPopup.vue';
import GroupPopup from '@/components/GroupPopup.vue';
import Chat from '@/components/Chat.vue';
import CarbonCalculator from '@/components/CarbonCalculator.vue';

const showSideBar = ref(true);
const showNewTask = ref(false);
const showFolderDetails = ref(false);
const showGroupDetails = ref(false);
const showFilters = ref(false);

const global = useGlobalStore();
const chat = useChatStore();

const toggleChat = () => chat.showChat = !chat.showChat;
const toggleSideBar = () => showSideBar.value = !showSideBar.value;

const toggleFilters = () => {
  global.filters.status = 'Select a status';
  global.filters.priority = 'Select a priority';
  showFilters.value = !showFilters.value;
};

const resetFilters = () => {
  global.filters.status = 'Select a status';
  global.filters.priority = 'Select a priority';
};

const selectedTask = ref(null);
const selectTask = (task) => { selectedTask.value = task; };

const WEEKLY_OBJECTIVE_G = 115000;

const totalCarbon = computed(() =>
  global.filteredTasks.reduce((sum, t) => sum + (t.carbon_impact || 0), 0)
);

const carbonPercent = computed(() =>
  Math.min(Math.round((totalCarbon.value / WEEKLY_OBJECTIVE_G) * 100), 100)
);

const carbonBarColor = computed(() => {
  if (carbonPercent.value >= 100) return '#dc2626';
  if (carbonPercent.value >= 80) return '#d97706';
  return '#22c55e';
});

const currentPage = ref(1);
const TASKS_PER_PAGE = 5;

const buildParams = () => {
  const params = { page: currentPage.value, limit: TASKS_PER_PAGE };
  const binder = global.selectedBinder;
  if (binder.name !== 'All tasks') {
    if (binder.id) params.group_id = binder.id;
    else params.folder_name = binder.name;
  }
  if (global.filters.status !== 'Select a status') params.status = global.filters.status;
  if (global.filters.priority !== 'Select a priority') params.priority = global.filters.priority;
  return params;
};

const prevPage = () => {
  if (currentPage.value > 1) { currentPage.value--; global.fetchTasks(buildParams()); }
};
const nextPage = () => {
  if (currentPage.value < global.taskPagination.totalPages) { currentPage.value++; global.fetchTasks(buildParams()); }
};

watch(
  [() => global.filters.status, () => global.filters.priority, () => global.selectedBinder],
  () => { currentPage.value = 1; global.fetchTasks(buildParams()); }
);

onMounted(async () => {
  await global.fetchTasks(buildParams());
  await global.fetchUsers();
});
</script>

<template>
  <div class="flex flex-col h-screen overflow-hidden">

    <TopBar :toggle="toggleSideBar"/>

    <div class="flex flex-row flex-1 overflow-hidden">

      <SideBar v-if="showSideBar"/>

      <!-- Main content -->
      <div class="flex-1 flex flex-row overflow-hidden p-3 gap-3">

        <!-- Tasks column -->
        <div class="flex flex-col flex-1 overflow-hidden min-w-0">

          <!-- Action bar -->
          <div class="flex flex-wrap gap-2 mb-3">
            <button class="btn-ghost text-xs py-1.5 px-3" @click="showNewTask = true">
              <PlusCircleIcon class="w-4 h-4" style="color:#22c55e"/>
              Nouvelle tâche
            </button>
            <button class="btn-ghost text-xs py-1.5 px-3" @click="toggleFilters"
                    :style="showFilters ? 'background:rgba(34,197,94,0.08);border-color:rgba(34,197,94,0.2);color:#15803d' : ''">
              <AdjustmentsHorizontalIcon class="w-4 h-4"/>
              Filtres
            </button>
            <button
              v-if="global.selectedBinder.name !== 'All tasks'"
              class="btn-ghost text-xs py-1.5 px-3"
              @click="global.selectedBinder.id ? showGroupDetails = true : showFolderDetails = true"
            >
              <Cog6ToothIcon class="w-4 h-4"/>
              {{ global.selectedBinder.name }}
            </button>
          </div>

          <!-- Carbon bar -->
          <div v-if="totalCarbon > 0" class="glass rounded-xl px-4 py-3 mb-3">
            <div class="flex items-center justify-between text-xs mb-2">
              <span class="font-semibold" style="color:#15803d">🌱 {{ totalCarbon }}g CO₂e</span>
              <span class="font-medium"
                    :style="{ color: carbonPercent >= 100 ? '#dc2626' : '#6b7280' }">
                {{ carbonPercent }}% de l'objectif hebdo (115 kg)
              </span>
            </div>
            <div class="w-full rounded-full h-1.5" style="background:rgba(0,0,0,0.06)">
              <div
                class="h-1.5 rounded-full transition-all duration-500"
                :style="{ width: carbonPercent + '%', background: carbonBarColor, boxShadow: `0 0 6px ${carbonBarColor}50` }"
              ></div>
            </div>
            <p v-if="carbonPercent >= 100" class="text-xs mt-1.5 font-semibold" style="color:#dc2626">
              Objectif dépassé — 115 kg CO₂ / semaine
            </p>
          </div>

          <!-- Filters -->
          <div v-if="showFilters" class="glass rounded-xl px-4 py-3 mb-3 flex flex-wrap gap-2 items-center">
            <select v-model="global.filters.status" class="glass-field" style="width:auto;min-width:130px">
              <option value="Select a status">Tous les statuts</option>
              <option>to do</option>
              <option>doing</option>
              <option>done</option>
            </select>
            <select v-model="global.filters.priority" class="glass-field" style="width:auto;min-width:130px">
              <option value="Select a priority">Toutes priorités</option>
              <option>low</option>
              <option>mid</option>
              <option>high</option>
            </select>
            <button class="btn-ghost text-xs py-1.5 px-3" @click="resetFilters">
              <ArrowPathIcon class="w-3.5 h-3.5"/>
              Réinitialiser
            </button>
          </div>

          <!-- Task list -->
          <div class="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
            <div
              v-for="task in global.tasks"
              :key="task.id"
              @click="selectTask(task)"
              class="cursor-pointer rounded-xl transition-all duration-200"
              :style="selectedTask?.id === task.id
                ? 'outline:2px solid rgba(34,197,94,0.45);outline-offset:1px'
                : ''"
            >
              <Task :task="task"/>
            </div>

            <div v-if="!global.tasks?.length" class="flex flex-col items-center justify-center py-14 text-center">
              <span class="text-4xl mb-3">🌿</span>
              <p class="text-sm" style="color:#9ca3af">Aucune tâche pour le moment</p>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="global.taskPagination.totalPages > 1"
               class="flex items-center justify-center gap-4 mt-3 pt-3"
               style="border-top:1px solid rgba(0,0,0,0.06)">
            <button @click="prevPage" :disabled="currentPage === 1" class="btn-ghost text-xs py-1.5 px-3">
              ← Précédent
            </button>
            <span class="text-xs" style="color:#6b7280">{{ currentPage }} / {{ global.taskPagination.totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage === global.taskPagination.totalPages" class="btn-ghost text-xs py-1.5 px-3">
              Suivant →
            </button>
          </div>
        </div>

        <!-- Right panel -->
        <div class="flex flex-col gap-3 w-80 shrink-0 overflow-y-auto pb-1">

          <CarbonCalculator :selectedTask="selectedTask"/>

          <!-- Chat (group only) -->
          <div v-if="global.selectedBinder?.id">
            <div v-if="!chat.showChat" class="flex justify-end">
              <button @click="toggleChat" class="btn-ghost px-4 py-2.5">
                <ChatBubbleBottomCenterIcon class="w-5 h-5" style="color:#22c55e"/>
                Chat
              </button>
            </div>

            <div v-else class="glass rounded-2xl overflow-hidden flex flex-col" style="height:420px">
              <div class="flex justify-between items-center px-4 py-3 shrink-0"
                   style="border-bottom:1px solid rgba(0,0,0,0.06)">
                <div class="flex items-center gap-2">
                  <ChatBubbleBottomCenterIcon class="w-4 h-4" style="color:#22c55e"/>
                  <span class="text-sm font-semibold" style="color:#111827">{{ global.selectedBinder.name }}</span>
                </div>
                <button @click="toggleChat" class="btn-icon">
                  <XMarkIcon class="w-4 h-4"/>
                </button>
              </div>
              <Chat class="flex-1 min-h-0"/>
            </div>
          </div>

        </div>
      </div>
    </div>

    <NewTask :show="showNewTask" @close="showNewTask = false" :selectedBinder="global.selectedBinder"/>
    <FolderPopup :show="showFolderDetails" @close="showFolderDetails = false" :folder="global.selectedBinder"/>
    <GroupPopup :show="showGroupDetails" @close="showGroupDetails = false" :group="global.selectedBinder"/>
    <NewFolder @close="global.showNewFolder = false"/>
    <NewGroup @close="global.showNewGroup = false"/>
  </div>
</template>
