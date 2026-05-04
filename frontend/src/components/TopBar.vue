<script setup>
import { onMounted, ref } from 'vue';
import { Bars3Icon, MagnifyingGlassIcon, XMarkIcon, Cog8ToothIcon, UserCircleIcon } from '@heroicons/vue/24/outline';
import ProfilePopup from './ProfilePopup.vue';
import { useGlobalStore, useAuthStore } from '@/store';
import { useRouter } from 'vue-router';

const router = useRouter();
const auth = useAuthStore();
const global = useGlobalStore();

defineProps({
  toggle: { type: Function, required: true }
});

const search = ref('');
const showProfilePop = ref(false);

const resetSearch = () => { global.filters.search = null; search.value = ''; };

const debounce = (fn, delay) => {
  let id;
  return (...args) => { clearTimeout(id); id = setTimeout(() => fn(...args), delay); };
};

let debouncedSearch;
onMounted(() => {
  debouncedSearch = debounce(() => { global.searchTasks(search.value); }, 200);
});
</script>

<template>
  <div class="glass flex items-center justify-between px-4 py-2.5 shrink-0 z-10"
       style="border-radius:0;border-left:none;border-right:none;border-top:none;border-bottom:1px solid rgba(0,0,0,0.07)">

    <!-- Left -->
    <div class="flex items-center gap-3">
      <button @click="toggle" class="btn-icon">
        <Bars3Icon class="w-5 h-5"/>
      </button>
      <div class="flex items-center gap-1.5">
        <span class="text-xl font-black leading-none" style="color:#111827">To-Doux</span>
        <span class="text-base">🌿</span>
      </div>
    </div>

    <!-- Center: search -->
    <div class="flex items-center gap-2 rounded-xl px-3 py-1.5 flex-1 max-w-xs mx-6"
         style="background:rgba(0,0,0,0.04);border:1px solid rgba(0,0,0,0.07)">
      <MagnifyingGlassIcon class="w-4 h-4 shrink-0" style="color:#9ca3af"/>
      <input
        v-model="search"
        type="text"
        placeholder="Rechercher…"
        class="flex-1 bg-transparent outline-none text-sm"
        style="color:#111827;border:none;font-family:inherit"
        @input="debouncedSearch"
      />
      <button v-if="search" @click="resetSearch" class="btn-icon" style="border:none;background:none;padding:0;color:#9ca3af">
        <XMarkIcon class="w-4 h-4"/>
      </button>
    </div>

    <!-- Right -->
    <div class="flex items-center gap-2">
      <button v-if="auth.user?.is_admin" @click="router.push('/admin')" class="btn-icon" title="Administration">
        <Cog8ToothIcon class="w-5 h-5"/>
      </button>
      <button @click="showProfilePop = true" class="btn-icon" title="Profil">
        <UserCircleIcon class="w-6 h-6" style="color:#374151"/>
      </button>
    </div>

    <ProfilePopup :show="showProfilePop" @close="showProfilePop = false"/>
  </div>
</template>
