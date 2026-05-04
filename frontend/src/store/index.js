import { defineStore } from "pinia";
import { axiosInstance } from "@/lib/axios";
import { io } from "socket.io-client";

const order = {'to do': 0, 'doing': 1, 'done': 2};
const priority = {'low': 0, 'mid': 1, 'high': 2};

export const useToastStore = defineStore('toast', {
    state: () => ({
      message: '',
      type: '',
      isVisible: false,
    }),
    actions: {
      show(type, message) {
        this.type = type
        this.message = message
        this.isVisible = true
  
        setTimeout(() => {
          this.isVisible = false
        }, 3000)
      },
      hide() {
        this.isVisible = false
      },
    },
});

export const useAuthStore = defineStore('auth', {
  state: ()=>({
    user: null,
    isLoading: false,
  }),
  actions: {
    async login(data) {
      const toast = useToastStore()
      this.isLoading = true
      try {
        const res = await axiosInstance.post('/auth/login', data)
        this.user = res.data.user
        toast.show('success', res.data.message)
        return { success: true }
      } catch (error) {
        const msg = error.response?.data?.error || 'Server error'
        toast.show(error.response?.status === 500 ? 'warning' : 'error', msg)
        return { success: false }
      } finally {
        this.isLoading = false
      }
    },
    async signup(data) {
      const toast = useToastStore();
      this.isLoading = true;
      try {
        const res = await axiosInstance.post('/auth/signup', data);
        this.user = res.data.user;
        toast.show('success', res.data.message);
        return { success: true }
      } catch (error) {
        const msg = error.response?.data?.error || 'Server error';
        toast.show(error.response?.status === 500 ? 'warning' : 'error', msg);
        return { success: false };
      } finally {
        this.isLoading = false;
      }
    },
    async refreshUser(silent = false){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.get('/auth/check');
        this.user = res.data;
      } catch (error) {
        if (!silent) toast.show('error', error.response?.data?.error);
      }
    },
    async logout(){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.post("/auth/logout");
        this.user = null;
        toast.show('success', res.data.message);
      } catch (error) {
        toast.show('error', error.response?.data?.error);
      }
    },
    async updateUser(username){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.put("/auth/update", {username});
        this.user = res.data.user;
        toast.show('success', res.data.message)
      } catch (error) {
        toast.show('error', error.response?.data?.error);
      }
    },
    async deleteAccount(){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.delete("/auth/delete");
        this.user = null;
        toast.show('success', res.data.message);
        return { success: true };
      } catch (error) {
        toast.show('error', error.response?.data?.error);
        return { success: false };
      }
    }
  }
});

export const useGlobalStore = defineStore('global', {
  state: ()=>({
    tasks: [],
    taskPagination: { total: 0, page: 1, totalPages: 1 },
    currentTaskParams: {},
    folders: [],
    groups: [],
    users: [],
    adminUsers: [],
    groupUsers: [],
    taskUsers: [],
    showNewFolder: false,
    showNewGroup: false,
    selectedBinder : {name: "All tasks", id: 0},
    searchedTasks: [],
    filters:{
      status: "Select a status",
      priority: "Select a priority",
      search: null
    }
  }),
  actions: {
    setSelectedBinder(binder){
      this.selectedBinder = binder;
    },
    async health(){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.get('/health');
        toast.show('success', res.data.message);
      } catch (error) {
        toast.show('error', error.response?.data?.error);
      }
    },
    async createTask(data){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.post('/task', data);
        toast.show('success', res.data.message);
      } catch (error) {
        toast.show('error', error.response?.data?.error);
      }
    },
    async fetchTasks(params) {
      const toast = useToastStore();
      if (params !== undefined) this.currentTaskParams = params;
      try {
        const res = await axiosInstance.get('/task', { params: this.currentTaskParams });
        this.tasks = Array.isArray(res.data.data) ? res.data.data : [];
        this.taskPagination = {
          total: res.data.total,
          page: res.data.page,
          totalPages: res.data.totalPages
        };
      } catch (error) {
        toast.show('error', error.response?.data?.error);
      }
    },
    async editStatus(id){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.put('/task', {id});
        const updatedTask = res.data;
        
        const index = this.tasks.findIndex(task=>task.id === id);
        if (index !== -1) this.tasks.splice(index, 1, updatedTask);
        this.tasks.sort((a, b) => order[a.status] - order[b.status]);
      } catch (error) {
        toast.show('error', error.response?.data?.error);
      }
    },
    async editTask(data){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.put('/task/update', {data});
        toast.show('success', res.data.message);
      } catch (error) {
        toast.show('error', error.response?.data?.error); 
      }
    },
    async deleteTask(id){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.delete('/task', {data: {id}});
        toast.show('success', res.data.message);
      } catch (error) {
        toast.show('error', error.response?.data?.error);
      }
    },
    async fetchFolders(){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.get('/folder');
        this.folders = res.data;
      } catch (error) {
        toast.show('error', error.response?.data?.error);
      }
    },
    async fetchGroups(){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.get('/group');
        this.groups = res.data;
      } catch (error) {
        toast.show('error', error.response?.data?.error);
      }
    },
    async createFolder(data){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.post('/folder', data);
        toast.show('success', res.data.message);
      } catch (error) {
        toast.show('error', error.response?.data?.error);
      }
    },
    async createGroup(data){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.post('/group', data);
        toast.show('success', res.data.message);
      } catch (error) {
        toast.show('error', error.response?.data?.error);
      }
    },
    async deleteFolder(folder_name){
      const toast = useToastStore();
      try {
        await axiosInstance.delete('/folder', {data: {folder_name}});
      } catch (error) {
        toast.show('error', error.response?.data?.error);
      }
    },
    async editFolder(data){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.put('/folder', {data});
        toast.show('success', res.data.message);
      } catch (error) {
        toast.show('error', error.response?.data?.error);
      }
    },
    async editGroup(data){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.put('/group/update', data);
        toast.show('success', res.data.message);
      } catch (error) {
        toast.show('error', error.response?.data?.error);
      }
    },
    async quitGroup(group_id){
      const toast = useToastStore();
      try {
        await axiosInstance.delete('/group/quit', {data: {group_id}});
      } catch (error) {
        toast.show('error', error.response?.data?.error);
      }
    },
    async deleteGroup(group_id){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.delete('/group', {data: {group_id}});
        toast.show('success', res.data.message);
      } catch (error) {
        toast.show('error', error.response?.data?.error);
      }
    },
    async fetchAdminUsers(){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.get('/admin/users');
        this.adminUsers = res.data;
      } catch (error) {
        toast.show('error', error.response?.data?.error);
      }
    },
    async adminUpdateUser(oldUsername, newUsername, newEmail){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.put('/admin/user', { oldUsername, newUsername, newEmail });
        toast.show('success', res.data.message);
        await this.fetchAdminUsers(); // Recharge la liste
      } catch (error) {
        toast.show('error', error.response?.data?.error);
      }
    },
    async adminDeleteUser(username){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.delete('/admin/user', { data: { username } });
        toast.show('success', res.data.message);
        await this.fetchAdminUsers(); // Recharge la liste
      } catch (error) {
        toast.show('error', error.response?.data?.error);
      }
    },
    async fetchUsers(){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.get('/user');
        this.users = res.data;
      } catch (error) {
        toast.show('error', error.response?.data?.error);      
      }
    },
    async fetchUsersInGroup(group_id){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.get(`/user/group/${group_id}`);
        this.groupUsers = res.data;
      } catch (error) {
        toast.show('error', error.response?.data?.error);      
      }
    },
    async searchTasks(search){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.get(`/task/${search}`);
        this.searchedTasks = Array.isArray(res.data) ? res.data : [];
        this.filters.search = search;
      } catch (error) {
        toast.show('error', error.response?.data?.error);
      }
    }
  },
  getters: {
    filteredTasks: (state) => {
      if (state.filters.search) return state.searchedTasks ?? [];
      return state.tasks ?? [];
    }
  }
});

export const useChatStore = defineStore('chat', {
  state: ()=>({
    socket: null,
    messages: [],
    showChat: true,
    isConnected: false,
    activeGroupId: null
  }),
  actions: {
    async fetchHistory(group_id){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.get(`/message/${group_id}`);
        this.messages = res.data;
      } catch (error) {
        toast.show('error', error.response?.data?.error);
        this.messages = [];
      }
    },
    connectSocket(){
      const toast = useToastStore();
      const auth = useAuthStore();
      if (!auth.user) return;

      const socketUrl = import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace('/api', '')
        : 'http://localhost:5001';
      this.socket = io(socketUrl, {auth: {username: auth.user.username}});
      this.socket.on("connect", ()=>{
        this.isConnected = true;
      });
      this.socket.on("disconnect", ()=>{
        this.isConnected = false;
      });
      this.socket.on("receive_message", (message)=>{
        if (message.group_id === this.activeGroupId){
          this.messages.push(message);
        }
      });
      this.socket.on("error", (error)=>{
        toast.show('error', error);
      });
    },
    async joinGroup(group_id){
      if (!this.socket) this.connectSocket();

      if (this.activeGroupId) this.socket.emit("leave_group", this.activeGroupId);
      
      this.messages = [];
      this.activeGroupId = group_id;

      this.socket.emit("join_group", group_id);
      await this.fetchHistory(group_id);
    },
    sendMessage(content){
      if (!this.socket || !this.activeGroupId) return;
      this.socket.emit("send_message", {content, groupId: this.activeGroupId});
    },
    disconnectSocket(){
      if (this.socket){
        this.socket.disconnect();
        this.socket = null;
        this.isConnected = false;
      }
    }
  }
});