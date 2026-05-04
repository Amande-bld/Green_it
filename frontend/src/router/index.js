import { createRouter, createWebHistory } from 'vue-router';
import Welcome from '../views/Welcome.vue';
import Login from '../views/Login.vue';
import Signup from '../views/Signup.vue';
import Home from '../views/Home.vue';
import Admin from '../views/Admin.vue';
import { useAuthStore } from '../store'

const routes = [
  { path: '/', name: 'Welcome', component: Welcome },
  { path: '/login', name: 'Login', component: Login },
  { path: '/signup', name: 'Signup', component: Signup },
  { path: '/home', name: 'Home', component: Home, meta: {auth: true} },
  { path: '/admin', name: 'Admin', component: Admin, meta: {auth: true, admin: true} },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, _from, next) => {
  const auth = useAuthStore()
  const isPublicRoute = ['Login', 'Welcome', 'Signup'].includes(to.name);

  if (!auth.user) {
    await auth.refreshUser(isPublicRoute);
  }

  if (to.meta.auth && !auth.user) {
    next('/')
  } else if (to.meta.admin && !auth.user?.is_admin) {
    next('/home')
  } else if (['Login', 'Signup'].includes(to.name) && auth.user) {
    next('/home')
  } else {
    next()
  }
})


export default router;
