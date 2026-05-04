<script setup>
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline';
import { useAuthStore } from '../store';

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const router = useRouter();
const auth = useAuthStore();

const handleLogin = async () => {
  const { success } = await auth.login({ email: email.value, password: password.value });
  if (success) router.push('/home');
};
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen px-4">

    <div class="glass-strong relative rounded-3xl px-8 py-10 w-full max-w-sm overflow-hidden">
      <div class="absolute top-0 left-[15%] right-[15%] h-px pointer-events-none"
           style="background:linear-gradient(90deg,transparent,rgba(255,255,255,1),transparent)"></div>

      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-black" style="color:#111827">To-Doux</h1>
        <p class="mt-1.5 text-sm" style="color:#6b7280">Bon retour 👋</p>
      </div>

      <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
        <div>
          <label class="glass-label" for="email">Email</label>
          <div class="flex items-center glass-field" style="padding:0">
            <EnvelopeIcon class="w-4 h-4 shrink-0 ml-3" style="color:#9ca3af"/>
            <input id="email" v-model="email" type="email" placeholder="toi@exemple.com" required
              class="flex-1 bg-transparent outline-none py-2 pr-3 pl-2 text-sm"
              style="color:#111827;border:none;font-family:inherit"/>
          </div>
        </div>

        <div>
          <label class="glass-label" for="password">Mot de passe</label>
          <div class="flex items-center glass-field" style="padding:0">
            <LockClosedIcon class="w-4 h-4 shrink-0 ml-3" style="color:#9ca3af"/>
            <input id="password" v-model="password" :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••" required
              class="flex-1 bg-transparent outline-none py-2 pl-2 text-sm"
              style="color:#111827;border:none;font-family:inherit"/>
            <button type="button" @click="showPassword = !showPassword"
                    class="mr-2 p-1 rounded-lg transition" style="color:#9ca3af;background:none;border:none">
              <EyeIcon v-if="showPassword" class="w-4 h-4"/>
              <EyeSlashIcon v-else class="w-4 h-4"/>
            </button>
          </div>
        </div>

        <button type="submit" class="btn-primary w-full mt-2" :disabled="auth.isLoading">
          {{ auth.isLoading ? 'Connexion…' : 'Se connecter' }}
        </button>
      </form>

      <p class="text-center mt-5 text-xs" style="color:#6b7280">
        Pas encore de compte ?
        <RouterLink to="/signup" class="font-semibold" style="color:#16a34a">S'inscrire</RouterLink>
      </p>
    </div>

    <p class="mt-8 text-xs" style="color:#9ca3af">🌿 Numérique responsable</p>
  </div>
</template>
