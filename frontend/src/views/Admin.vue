<script setup>
import { onMounted } from 'vue';
import { useGlobalStore } from '@/store';
import { TrashIcon, PencilSquareIcon, ArrowLeftIcon } from '@heroicons/vue/24/outline';
import { useRouter } from 'vue-router';

const global = useGlobalStore();
const router = useRouter();

onMounted(async () => {
  await global.fetchAdminUsers();
});

const handleEdit = (user) => {
  const newUsername = prompt('Modifier le pseudo :', user.username);
  if (!newUsername) return;
  const newEmail = prompt("Modifier l'email :", user.email);
  if (!newEmail) return;
  global.adminUpdateUser(user.username, newUsername, newEmail);
};

const handleDelete = (username) => {
  if (confirm(`Supprimer l'utilisateur "${username}" ? Cette action est irréversible.`)) {
    global.adminDeleteUser(username);
  }
};
</script>

<template>
  <div class="min-h-screen p-6 md:p-10">

    <div class="flex items-center gap-4 mb-8">
      <button @click="router.push('/home')" class="btn-icon">
        <ArrowLeftIcon class="w-5 h-5"/>
      </button>
      <div>
        <h1 class="text-2xl font-black" style="color:#111827">Administration</h1>
        <p class="text-xs mt-0.5" style="color:#6b7280">Gestion des utilisateurs</p>
      </div>
    </div>

    <div class="glass rounded-2xl overflow-hidden">
      <!-- Header row -->
      <div class="grid grid-cols-3 px-5 py-3 text-xs font-semibold uppercase tracking-widest"
           style="color:#6b7280;border-bottom:1px solid rgba(0,0,0,0.06)">
        <span>Pseudo</span>
        <span>Email</span>
        <span class="text-center">Actions</span>
      </div>

      <div v-if="!global.adminUsers?.length" class="px-5 py-10 text-center text-sm" style="color:#9ca3af">
        Aucun utilisateur trouvé
      </div>

      <div
        v-for="user in global.adminUsers"
        :key="user.username"
        class="grid grid-cols-3 px-5 py-3.5 items-center transition-colors"
        style="border-bottom:1px solid rgba(0,0,0,0.04)"
        onmouseover="this.style.background='rgba(0,0,0,0.02)'"
        onmouseout="this.style.background=''"
      >
        <span class="font-medium text-sm" style="color:#111827">{{ user.username }}</span>
        <span class="text-sm" style="color:#6b7280">{{ user.email }}</span>
        <div class="flex justify-center gap-2">
          <button @click="handleEdit(user)" class="btn-icon" title="Modifier"
                  style="background:rgba(59,130,246,0.07);border-color:rgba(59,130,246,0.15)">
            <PencilSquareIcon class="w-4 h-4" style="color:#3b82f6"/>
          </button>
          <button @click="handleDelete(user.username)" class="btn-icon" title="Supprimer"
                  style="background:rgba(239,68,68,0.07);border-color:rgba(239,68,68,0.15)">
            <TrashIcon class="w-4 h-4" style="color:#dc2626"/>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
