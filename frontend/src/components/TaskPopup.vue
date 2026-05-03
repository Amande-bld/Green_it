<script setup>
import { ref, watch, computed } from 'vue';
import { TrashIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import { useGlobalStore } from '@/store';

const props = defineProps({ show: Boolean, task: Object });
const global = useGlobalStore();
const emit = defineEmits(['close']);

const title = ref('');
const description = ref('');
const status = ref('');
const deadline = ref('');
const priority = ref('');
const folder_name = ref('');
const group_id = ref('');
const usernames = ref([]);

const isGroupSelected = computed(() => group_id.value !== '');

watch(folder_name, (v) => { if (v) { group_id.value = ''; usernames.value = []; } });
watch(group_id, async (v) => {
  if (v) { folder_name.value = ''; await global.fetchUsersInGroup(group_id.value); }
});

watch(() => props.task, (task) => {
  if (task) {
    title.value = task.title || '';
    description.value = task.description || '';
    status.value = task.status || '';
    deadline.value = task.deadline ? task.deadline.split('T')[0] : '';
    priority.value = task.priority || '';
    group_id.value = task.group_id || '';
    folder_name.value = task.folder_name || '';
    usernames.value = task.usernames || [];
  }
}, { immediate: true });

const resetFields = () => {
  title.value = props.task.title;
  description.value = props.task.description || '';
  status.value = props.task.status;
  deadline.value = props.task.deadline ? props.task.deadline.split('T')[0] : '';
  priority.value = props.task.priority || '';
  group_id.value = props.task.group_id || '';
  folder_name.value = props.task.folder_name || '';
  usernames.value = props.task.usernames || [];
};

const close = () => { resetFields(); emit('close'); };

const handleDelete = async () => {
  if (confirm(`Supprimer la tâche "${props.task.title}" ?`)) {
    await global.deleteTask(props.task.id);
    close();
    await global.fetchTasks();
  }
};

const handleUpdate = async () => {
  await global.editTask({
    id: props.task.id, title: title.value, description: description.value,
    status: status.value, deadline: deadline.value, priority: priority.value,
    folder_name: folder_name.value, group_id: group_id.value,
    usernames: usernames.value.sort()
  });
  await global.fetchTasks();
  close();
};
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="close">
    <div class="glass-strong rounded-2xl p-6 w-full max-w-md relative overflow-hidden max-h-[90vh] overflow-y-auto">
      <div class="absolute top-0 left-[15%] right-[15%] h-px pointer-events-none"
           style="background:linear-gradient(90deg,transparent,rgba(255,255,255,1),transparent)"></div>

      <header class="flex justify-between items-center mb-5">
        <h2 class="text-base font-bold" style="color:#111827">Détails de la tâche</h2>
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
          <label class="glass-label">Titre</label>
          <input v-model="title" type="text" class="glass-field" :placeholder="task.title"/>
        </div>

        <div>
          <label class="glass-label">Description</label>
          <textarea v-model="description" class="glass-field" rows="2"
                    :placeholder="task.description || 'Description'"></textarea>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="glass-label">Statut</label>
            <select v-model="status" class="glass-field">
              <option disabled value="">Choisir</option>
              <option>to do</option>
              <option>doing</option>
              <option>done</option>
            </select>
          </div>
          <div>
            <label class="glass-label">Priorité</label>
            <select v-model="priority" class="glass-field">
              <option disabled value="">Choisir</option>
              <option>low</option>
              <option>mid</option>
              <option>high</option>
            </select>
          </div>
        </div>

        <div>
          <label class="glass-label">Échéance</label>
          <input v-model="deadline" type="date" class="glass-field"/>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="glass-label">Dossier</label>
            <select v-model="folder_name" class="glass-field" :disabled="group_id !== ''">
              <option value="">Aucun</option>
              <option v-for="f in global.folders" :key="f.name" :value="f.name">{{ f.name }}</option>
            </select>
          </div>
          <div>
            <label class="glass-label">Groupe</label>
            <select v-model="group_id" class="glass-field" :disabled="folder_name !== ''">
              <option value="">Aucun</option>
              <option v-for="g in global.groups" :key="g.id" :value="g.id">{{ g.name }}</option>
            </select>
          </div>
        </div>

        <div v-if="isGroupSelected">
          <label class="glass-label">Membres</label>
          <div class="flex flex-col gap-1 mt-1">
            <label v-for="user in global.groupUsers" :key="user.username"
                   class="flex items-center gap-2 text-sm cursor-pointer" style="color:#374151">
              <input type="checkbox" :value="user.username" v-model="usernames"/>
              {{ user.username }}
            </label>
          </div>
        </div>

        <p class="text-xs" style="color:#9ca3af">
          Créée le {{ new Date(task.date).toLocaleDateString('fr-FR') }}
        </p>

        <div class="flex justify-end gap-2 mt-1 pt-4" style="border-top:1px solid rgba(0,0,0,0.06)">
          <button type="button" @click="close" class="btn-ghost">Fermer</button>
          <button type="submit" class="btn-primary">Enregistrer</button>
        </div>
      </form>
    </div>
  </div>
</template>
