<script setup>
import { ref, computed, watch } from 'vue';
import { XMarkIcon } from '@heroicons/vue/24/outline';
import { useGlobalStore } from '@/store';

const props = defineProps({ show: Boolean, selectedBinder: Object });
const emit = defineEmits(['close']);
const global = useGlobalStore();

const title = ref('');
const description = ref('');
const status = ref('');
const deadline = ref('');
const priority = ref('');
const usernames = ref([]);
const folder_name = ref('');
const group_id = ref('');

const initializeBinder = (binder) => {
  if (!binder) return;
  if (binder.id) { group_id.value = binder.id; folder_name.value = ''; }
  else if (binder.id === 0) { folder_name.value = ''; group_id.value = ''; }
  else { folder_name.value = binder.name; group_id.value = ''; }
};

watch(() => props.show, (v) => { v ? initializeBinder(props.selectedBinder) : resetFields(); });
watch(() => props.selectedBinder, (b) => { if (props.show) initializeBinder(b); });

const isGroupSelected = computed(() => group_id.value !== '');

watch(folder_name, (v) => { if (v !== '') { group_id.value = ''; usernames.value = []; } });
watch(group_id, async (v) => {
  if (v !== '') { folder_name.value = ''; await global.fetchUsersInGroup(group_id.value); }
});

const resetFields = () => {
  title.value = ''; description.value = ''; status.value = '';
  deadline.value = ''; priority.value = ''; usernames.value = [];
  folder_name.value = ''; group_id.value = '';
};

const close = () => emit('close');

const handleSubmit = async () => {
  if (!title.value || !status.value) { alert('Le titre et le statut sont obligatoires'); return; }
  await global.createTask({
    title: title.value,
    description: description.value || null,
    status: status.value,
    deadline: deadline.value || null,
    priority: priority.value || null,
    folder_name: folder_name.value || null,
    group_id: group_id.value !== '' ? group_id.value : null,
    usernames: isGroupSelected.value && usernames.value.length ? usernames.value : null
  });
  await global.fetchTasks();
  close();
};
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="close">
    <div class="glass-strong rounded-2xl p-6 w-full max-w-md relative overflow-hidden">
      <div class="absolute top-0 left-[15%] right-[15%] h-px pointer-events-none"
           style="background:linear-gradient(90deg,transparent,rgba(255,255,255,1),transparent)"></div>

      <header class="flex justify-between items-center mb-5">
        <h2 class="text-base font-bold" style="color:#111827">Nouvelle tâche</h2>
        <button @click="close" class="btn-icon"><XMarkIcon class="w-4 h-4"/></button>
      </header>

      <form @submit.prevent="handleSubmit" class="flex flex-col gap-3">

        <div>
          <label class="glass-label">Titre *</label>
          <input v-model="title" type="text" class="glass-field" placeholder="Titre de la tâche" required/>
        </div>

        <div>
          <label class="glass-label">Description</label>
          <textarea v-model="description" class="glass-field" rows="2" placeholder="Description (optionnel)"></textarea>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="glass-label">Statut *</label>
            <select v-model="status" class="glass-field" required>
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

        <div class="flex justify-end gap-2 mt-2 pt-4" style="border-top:1px solid rgba(0,0,0,0.06)">
          <button type="button" @click="close" class="btn-ghost">Annuler</button>
          <button type="submit" class="btn-primary">Créer</button>
        </div>
      </form>
    </div>
  </div>
</template>
