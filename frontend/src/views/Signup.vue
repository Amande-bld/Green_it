<script setup>
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { UserIcon, EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline';
import { useAuthStore, useToastStore } from '../store';

const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const showConfirm = ref(false);
const router = useRouter();
const auth = useAuthStore();
const toast = useToastStore();

const handleSignup = async () => {
  if (password.value.length < 6) {
    toast.show('error', 'Le mot de passe doit contenir au moins 6 caractères');
    return;
  }
  if (password.value !== confirmPassword.value) {
    toast.show('error', 'Les mots de passe ne correspondent pas');
    return;
  }
  const { success } = await auth.signup({ username: username.value, email: email.value, password: password.value });
  if (success) router.push('/home');
};
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen px-4 py-8">

    <div class="glass-strong relative rounded-3xl px-8 py-10 w-full max-w-sm overflow-hidden">
      <div class="absolute top-0 left-[15%] right-[15%] h-px pointer-events-none"
           style="background:linear-gradient(90deg,transparent,rgba(255,255,255,1),transparent)"></div>

      <div class="text-center mb-8">
        <h1 class="text-3xl font-black" style="color:#111827">To-Doux</h1>
        <p class="mt-1.5 text-sm" style="color:#6b7280">Crée ton compte 🌱</p>
      </div>

      <form @submit.prevent="handleSignup" novalidate class="flex flex-col gap-3.5">

        <div>
          <label class="glass-label" for="username">Pseudo</label>
          <div class="flex items-center glass-field" style="padding:0">
            <UserIcon class="w-4 h-4 shrink-0 ml-3" style="color:#9ca3af"/>
            <input id="username" v-model="username" type="text" placeholder="TonPseudo"
              class="flex-1 bg-transparent outline-none py-2 pr-3 pl-2 text-sm"
              style="color:#111827;border:none;font-family:inherit"/>
          </div>
        </div>

        <div>
          <label class="glass-label" for="email">Email</label>
          <div class="flex items-center glass-field" style="padding:0">
            <EnvelopeIcon class="w-4 h-4 shrink-0 ml-3" style="color:#9ca3af"/>
            <input id="email" v-model="email" type="email" placeholder="toi@exemple.com"
              class="flex-1 bg-transparent outline-none py-2 pr-3 pl-2 text-sm"
              style="color:#111827;border:none;font-family:inherit"/>
          </div>
        </div>

        <div>
          <label class="glass-label" for="password">Mot de passe</label>
          <div class="flex items-center glass-field" style="padding:0">
            <LockClosedIcon class="w-4 h-4 shrink-0 ml-3" style="color:#9ca3af"/>
            <input id="password" v-model="password" :type="showPassword ? 'text' : 'password'"
              placeholder="Min. 6 caractères"
              class="flex-1 bg-transparent outline-none py-2 pl-2 text-sm"
              style="color:#111827;border:none;font-family:inherit"/>
            <button type="button" @click="showPassword = !showPassword"
                    class="mr-2 p-1 rounded-lg transition" style="color:#9ca3af;background:none;border:none">
              <EyeIcon v-if="showPassword" class="w-4 h-4"/>
              <EyeSlashIcon v-else class="w-4 h-4"/>
            </button>
          </div>
        </div>

        <div>
          <label class="glass-label" for="confirm">Confirmer</label>
          <div class="flex items-center glass-field" style="padding:0"
               :style="confirmPassword && confirmPassword !== password ? 'border-color:rgba(220,38,38,0.4)' : ''">
            <LockClosedIcon class="w-4 h-4 shrink-0 ml-3" style="color:#9ca3af"/>
            <input id="confirm" v-model="confirmPassword" :type="showConfirm ? 'text' : 'password'"
              placeholder="Répète le mot de passe"
              class="flex-1 bg-transparent outline-none py-2 pl-2 text-sm"
              style="color:#111827;border:none;font-family:inherit"/>
            <button type="button" @click="showConfirm = !showConfirm"
                    class="mr-2 p-1 rounded-lg transition" style="color:#9ca3af;background:none;border:none">
              <EyeIcon v-if="showConfirm" class="w-4 h-4"/>
              <EyeSlashIcon v-else class="w-4 h-4"/>
            </button>
          </div>
          <p v-if="confirmPassword && confirmPassword !== password" class="text-xs mt-1" style="color:#dc2626">
            Les mots de passe ne correspondent pas
          </p>
        </div>

        <button type="submit" class="btn-primary w-full mt-1" :disabled="auth.isLoading">
          {{ auth.isLoading ? 'Création…' : 'Créer mon compte' }}
        </button>
      </form>

      <p class="text-center mt-5 text-xs" style="color:#6b7280">
        Déjà un compte ?
        <RouterLink to="/login" class="font-semibold" style="color:#16a34a">Se connecter</RouterLink>
      </p>
    </div>

    <p class="mt-6 text-xs" style="color:#9ca3af">🌿 Numérique responsable</p>
  </div>
</template>
