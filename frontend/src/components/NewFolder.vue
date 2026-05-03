<script setup>
import { ref } from 'vue';
import { XMarkIcon } from '@heroicons/vue/24/outline';
import { useGlobalStore } from '@/store';

const global = useGlobalStore();
const emit = defineEmits(['close']);

const name = ref('');
const resetFields = () => { name.value = ''; };
const close = () => { resetFields(); emit('close'); };

const handleSubmit = async () => {
  await global.createFolder({ name: name.value });
  await global.fetchFolders();
  close();
};
</script>

<template>
  <div v-if="global.showNewFolder" class="modal-overlay" @click.self="close">
    <div class="glass-strong rounded-2xl p-6 w-full max-w-sm relative overflow-hidden">
      <div class="absolute top-0 left-[15%] right-[15%] h-px pointer-events-none"
           style="background:linear-gradient(90deg,transparent,rgba(255,255,255,1),transparent)"></div>

      <header class="flex justify-between items-center mb-5">
        <h2 class="text-base font-bold" style="color:#111827">Nouveau dossier</h2>
        <button @click="close" class="btn-icon"><XMarkIcon class="w-4 h-4"/></button>
      </header>

      <form @submit.prevent="handleSubmit" class="flex flex-col gap-3">
        <div>
          <label class="glass-label">Nom *</label>
          <input v-model="name" type="text" class="glass-field" required placeholder="Nom du dossier"/>
        </div>
        <div class="flex justify-end gap-2 mt-2 pt-4" style="border-top:1px solid rgba(0,0,0,0.06)">
          <button type="button" @click="close" class="btn-ghost">Annuler</button>
          <button type="submit" class="btn-primary">Créer</button>
        </div>
      </form>
    </div>
  </div>
</template>
