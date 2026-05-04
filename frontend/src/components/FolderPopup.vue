<script setup>
import { ref, watch } from 'vue';
import { TrashIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import { useGlobalStore } from '@/store';

const props = defineProps({ show: Boolean, folder: Object });
const global = useGlobalStore();
const emit = defineEmits(['close']);

const name = ref('');
watch(() => props.folder, (f) => { if (f) name.value = f.name; }, { immediate: true });

const resetFields = () => { name.value = props.folder.name; };
const close = () => { resetFields(); emit('close'); };

const handleUpdate = async () => {
  await global.editFolder({ folder_name: props.folder.name, newFolder_name: name.value });
  await global.fetchFolders();
  await global.fetchTasks({ ...global.currentTaskParams, folder_name: name.value });
  global.setSelectedBinder({ name: name.value, id: 0 });
  close();
};

const handleDelete = async () => {
  if (confirm(`Supprimer le dossier "${props.folder.name}" ?`)) {
    await global.deleteFolder(props.folder.name);
    await global.fetchFolders();
    await global.fetchTasks();
    global.setSelectedBinder({ name: 'All tasks', id: 0 });
    close();
  }
};
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="close">
    <div class="glass-strong rounded-2xl p-6 w-full max-w-sm relative overflow-hidden">
      <div class="absolute top-0 left-[15%] right-[15%] h-px pointer-events-none"
           style="background:linear-gradient(90deg,transparent,rgba(255,255,255,1),transparent)"></div>

      <header class="flex justify-between items-center mb-5">
        <h2 class="text-base font-bold" style="color:#111827">Dossier</h2>
        <div class="flex items-center gap-1.5">
          <button @click="handleDelete" class="btn-icon"
                  style="background:rgba(220,38,38,0.07);border-color:rgba(220,38,38,0.15)" title="Supprimer">
            <TrashIcon class="w-4 h-4" style="color:#dc2626"/>
          </button>
          <button @click="close" class="btn-icon"><XMarkIcon class="w-4 h-4"/></button>
        </div>
      </header>

      <form @submit.prevent="handleUpdate" class="flex flex-col gap-3">
        <div>
          <label class="glass-label">Nom</label>
          <input v-model="name" type="text" class="glass-field" required :placeholder="folder.name"/>
        </div>
        <div class="flex justify-end gap-2 mt-2 pt-4" style="border-top:1px solid rgba(0,0,0,0.06)">
          <button type="button" @click="close" class="btn-ghost">Annuler</button>
          <button type="submit" class="btn-primary">Enregistrer</button>
        </div>
      </form>
    </div>
  </div>
</template>
