<script setup>
import { onMounted } from 'vue';
import NewButton from './NewButton.vue';
import { useGlobalStore } from '@/store';
import { FolderIcon, UserGroupIcon } from '@heroicons/vue/24/outline';

const global = useGlobalStore();
const selectBinder = (binder) => { global.setSelectedBinder(binder); };

onMounted(async () => {
  await global.fetchFolders();
  await global.fetchGroups();
});
</script>

<template>
  <div class="glass flex flex-col w-52 shrink-0 overflow-y-auto"
       style="border-radius:0;border-left:none;border-top:none;border-bottom:none;border-right:1px solid rgba(0,0,0,0.07)">

    <!-- Folders -->
    <div class="p-3 pb-2">
      <div class="flex items-center gap-1.5 mb-2 px-1">
        <FolderIcon class="w-3.5 h-3.5" style="color:#9ca3af"/>
        <span class="text-xs font-bold uppercase tracking-widest" style="color:#9ca3af">Dossiers</span>
      </div>

      <button
        class="w-full text-left px-3 py-1.5 rounded-xl text-sm transition-all duration-150 mb-0.5"
        :style="global.selectedBinder.name === 'All tasks'
          ? 'background:rgba(22,163,74,0.1);color:#15803d;font-weight:600'
          : 'color:#374151'"
        :class="global.selectedBinder.name !== 'All tasks' ? 'hover:bg-black/5' : ''"
        @click="selectBinder({ name: 'All tasks', id: 0 })"
      >
        Toutes les tâches
      </button>

      <button
        v-for="folder in global.folders"
        :key="folder.name"
        class="w-full text-left px-3 py-1.5 rounded-xl text-sm transition-all duration-150 mb-0.5 flex items-center gap-1.5 min-w-0"
        :style="(global.selectedBinder.name === folder.name && !global.selectedBinder.id)
          ? 'background:rgba(22,163,74,0.1);color:#15803d;font-weight:600'
          : 'color:#374151'"
        :class="!(global.selectedBinder.name === folder.name && !global.selectedBinder.id) ? 'hover:bg-black/5' : ''"
        @click="selectBinder(folder)"
      >
        <span>📁</span><span class="truncate">{{ folder.name }}</span>
      </button>

      <NewButton label="Nouveau" @click="global.showNewFolder = true"/>
    </div>

    <div style="border-top:1px solid rgba(0,0,0,0.05);margin:0 12px"></div>

    <!-- Groups -->
    <div class="p-3 pb-2">
      <div class="flex items-center gap-1.5 mb-2 px-1">
        <UserGroupIcon class="w-3.5 h-3.5" style="color:#9ca3af"/>
        <span class="text-xs font-bold uppercase tracking-widest" style="color:#9ca3af">Groupes</span>
      </div>

      <button
        v-for="group in global.groups"
        :key="group.name"
        class="w-full text-left px-3 py-1.5 rounded-xl text-sm transition-all duration-150 mb-0.5 flex items-center gap-1.5 min-w-0"
        :style="global.selectedBinder.id === group.id
          ? 'background:rgba(22,163,74,0.1);color:#15803d;font-weight:600'
          : 'color:#374151'"
        :class="global.selectedBinder.id !== group.id ? 'hover:bg-black/5' : ''"
        @click="selectBinder(group)"
      >
        <span>👥</span><span class="truncate">{{ group.name }}</span>
      </button>

      <NewButton label="Nouveau" @click="global.showNewGroup = true"/>
    </div>
  </div>
</template>
