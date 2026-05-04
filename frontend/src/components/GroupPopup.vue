<script setup>
import { ref, watch } from 'vue';
import { ArrowLeftStartOnRectangleIcon, HomeIcon, TrashIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import { useAuthStore, useGlobalStore } from '@/store';

const props = defineProps({ show: Boolean, group: Object });
const global = useGlobalStore();
const auth = useAuthStore();
const emit = defineEmits(['close']);

const name = ref('');
const description = ref('');
const usernames = ref([]);

const getFreshGroup = () => global.groups.find(g => g.id === props.group.id) || props.group;

const resetFields = () => {
  const g = getFreshGroup();
  name.value = g.name;
  description.value = g.description || '';
  usernames.value = g.usernames || [];
};

const close = () => emit('close');
watch(() => props.show, (v) => { if (v) resetFields(); });

const handleUpdate = async () => {
  await global.editGroup({ id: props.group.id, name: name.value, description: description.value, usernames: usernames.value });
  await global.fetchGroups();
  await global.fetchTasks();
  global.setSelectedBinder({ name: name.value, id: props.group.id });
  close();
};

const handleLeave = async () => {
  if (confirm(`Quitter le groupe "${props.group.name}" ?`)) {
    await global.quitGroup(props.group.id);
    await global.fetchGroups();
    await global.fetchTasks();
    global.setSelectedBinder({ name: 'All tasks', id: 0 });
    close();
  }
};

const handleDelete = async () => {
  if (confirm(`Supprimer le groupe "${props.group.name}" ?`)) {
    await global.deleteGroup(props.group.id);
    await global.fetchGroups();
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
        <h2 class="text-base font-bold" style="color:#111827">Groupe</h2>
        <div class="flex items-center gap-1.5">
          <button v-if="group.createdBy === auth.user.username" @click="handleDelete" class="btn-icon"
                  style="background:rgba(220,38,38,0.07);border-color:rgba(220,38,38,0.15)" title="Supprimer">
            <TrashIcon class="w-4 h-4" style="color:#dc2626"/>
          </button>
          <button @click="handleLeave" class="btn-icon" title="Quitter">
            <ArrowLeftStartOnRectangleIcon class="w-4 h-4" style="color:#dc2626"/>
          </button>
          <button @click="close" class="btn-icon"><XMarkIcon class="w-4 h-4"/></button>
        </div>
      </header>

      <form @submit.prevent="handleUpdate" class="flex flex-col gap-3">
        <div>
          <label class="glass-label">Nom</label>
          <input v-model="name" type="text" class="glass-field" required :placeholder="group.name"/>
        </div>
        <div>
          <label class="glass-label">Description</label>
          <textarea v-model="description" class="glass-field" rows="2"
                    :placeholder="group.description || 'Description'"></textarea>
        </div>
        <div>
          <label class="glass-label">Membres</label>
          <div class="flex flex-col gap-1.5 mt-1">
            <label v-for="user in global.users" :key="user.username"
                   class="flex items-center gap-2 text-sm cursor-pointer" style="color:#374151">
              <input type="checkbox" :value="user.username" v-model="usernames"/>
              <span>{{ user.username }}</span>
              <HomeIcon v-if="group.createdBy === user.username" class="w-3.5 h-3.5" style="color:#22c55e"/>
            </label>
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-2 pt-4" style="border-top:1px solid rgba(0,0,0,0.06)">
          <button type="button" @click="close" class="btn-ghost">Annuler</button>
          <button type="submit" class="btn-primary">Enregistrer</button>
        </div>
      </form>
    </div>
  </div>
</template>
