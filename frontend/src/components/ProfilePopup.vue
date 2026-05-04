<script setup>
import { ref, watch } from 'vue';
import { XMarkIcon, UserCircleIcon } from '@heroicons/vue/24/outline';
import { useAuthStore } from '@/store';
import { useRouter } from 'vue-router';

const props = defineProps({ show: Boolean });
const router = useRouter();
const auth = useAuthStore();
const emit = defineEmits(['close']);

const username = ref(auth.user?.username || '');
const showDeleteConfirm = ref(false);

watch(() => props.show, (v) => {
  if (v) { username.value = auth.user?.username || ''; showDeleteConfirm.value = false; }
});

const close = () => { username.value = auth.user?.username || ''; showDeleteConfirm.value = false; emit('close'); };
const handleLogout = async () => { await auth.logout(); router.push('/'); };
const handleDeleteAccount = async () => {
  const res = await auth.deleteAccount();
  if (res.success) router.push('/');
};
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="close">
    <div class="glass-strong rounded-2xl p-6 w-full max-w-sm relative overflow-hidden">
      <div class="absolute top-0 left-[15%] right-[15%] h-px pointer-events-none"
           style="background:linear-gradient(90deg,transparent,rgba(255,255,255,1),transparent)"></div>

      <header class="flex justify-between items-center mb-5">
        <div class="flex items-center gap-2">
          <UserCircleIcon class="w-5 h-5" style="color:#22c55e"/>
          <h2 class="text-base font-bold" style="color:#111827">Mon profil</h2>
        </div>
        <button @click="close" class="btn-icon"><XMarkIcon class="w-4 h-4"/></button>
      </header>

      <div class="mb-4">
        <label class="glass-label">Email</label>
        <div class="glass-field" style="color:#6b7280;cursor:default">{{ auth.user?.email }}</div>
      </div>

      <div class="mb-5">
        <label class="glass-label" for="profile-username">Pseudo</label>
        <input id="profile-username" v-model="username" type="text" class="glass-field"
               :placeholder="auth.user?.username"/>
      </div>

      <div class="flex justify-between gap-3 pt-4" style="border-top:1px solid rgba(0,0,0,0.06)">
        <button @click="handleLogout" class="btn-danger">Déconnexion</button>
        <button @click="auth.updateUser(username)" class="btn-primary">Enregistrer</button>
      </div>

      <div v-if="!showDeleteConfirm" class="mt-4 text-center">
        <button @click="showDeleteConfirm = true"
                class="text-sm underline"
                style="color:#9ca3af">
          Supprimer mon compte
        </button>
      </div>

      <div v-else class="mt-4 rounded-xl p-3" style="background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.2)">
        <p class="text-sm mb-3" style="color:#b91c1c">
          Cette action est irréversible. Toutes vos données seront supprimées.
        </p>
        <div class="flex gap-2">
          <button @click="showDeleteConfirm = false" class="btn-secondary flex-1">Annuler</button>
          <button @click="handleDeleteAccount" class="btn-danger flex-1">Confirmer</button>
        </div>
      </div>

    </div>
  </div>
</template>
