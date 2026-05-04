<script setup>
import { useAuthStore, useChatStore, useGlobalStore } from '@/store';
import { onMounted, onUnmounted, ref, nextTick, watch } from 'vue';
import { PaperAirplaneIcon } from '@heroicons/vue/24/outline';

const global = useGlobalStore();
const chat = useChatStore();
const auth = useAuthStore();

const newMessage = ref('');
const messagesContainer = ref(null);

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  });
};

onMounted(() => {
  if (!chat.isConnected) chat.connectSocket();
  if (global.selectedBinder?.id) chat.joinGroup(global.selectedBinder.id);
  scrollToBottom();
});

onUnmounted(() => {
  if (chat.socket && global.selectedBinder?.id) chat.socket.emit('leave_group', global.selectedBinder.id);
});

watch(() => global.selectedBinder, (b) => {
  if (b.id !== chat.activeGroupId) {
    if (!chat.isConnected) chat.connectSocket();
    chat.joinGroup(b.id);
  }
});

watch(() => chat.messages.length, scrollToBottom);

const sendMessage = () => {
  if (newMessage.value.trim()) { chat.sendMessage(newMessage.value); newMessage.value = ''; }
};

const currentUser = auth.user?.username;
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <!-- Messages -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-3 space-y-2">
      <div
        v-for="(msg, i) in chat.messages" :key="i"
        class="flex"
        :class="msg.username === currentUser ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-[75%] px-3 py-2 rounded-2xl text-sm"
          :style="msg.username === currentUser
            ? 'background:rgba(22,163,74,0.12);border:1px solid rgba(22,163,74,0.2);color:#111827;border-bottom-right-radius:4px'
            : 'background:rgba(0,0,0,0.04);border:1px solid rgba(0,0,0,0.07);color:#374151;border-top-left-radius:4px'"
        >
          <p v-if="msg.username !== currentUser" class="text-xs font-bold mb-0.5" style="color:#16a34a">
            {{ msg.username }}
          </p>
          <p class="break-words leading-relaxed">{{ msg.content }}</p>
        </div>
      </div>
      <div v-if="!chat.messages.length" class="text-center text-xs py-4" style="color:#9ca3af">
        Aucun message — commence la conversation !
      </div>
    </div>

    <!-- Input -->
    <div class="p-3 shrink-0" style="border-top:1px solid rgba(0,0,0,0.06)">
      <form @submit.prevent="sendMessage" class="flex gap-2">
        <input
          v-model="newMessage"
          type="text"
          placeholder="Écrire un message…"
          class="glass-field flex-1"
          style="border-radius:16px;padding:0.5rem 1rem"
          :disabled="!chat.isConnected"
        />
        <button type="submit" :disabled="!newMessage.trim()" class="btn-primary px-3 py-2 rounded-2xl">
          <PaperAirplaneIcon class="w-4 h-4"/>
        </button>
      </form>
    </div>
  </div>
</template>
