# Green IT — Gestionnaire de tâches éco-responsable

**Green IT** est une application web collaborative de gestion de tâches conçue avec une approche éco-responsable. Elle permet à des équipes d'organiser leurs projets en dossiers et groupes, de suivre l'avancement des tâches (À faire → En cours → Terminé), de communiquer en temps réel via un chat intégré, et de mesurer l'empreinte carbone de leurs activités grâce à un calculateur dédié.



---

## Site déployé

[https://green-it-blue.vercel.app/](https://green-it-blue.vercel.app)

---

## Membres de l'équipe

| Nom | Rôle |
|-----|------|
| **Amandine BLANCHARD** | Authentification : inscription, login, logout, vérification du token JWT, connexion à la base de données MySQL et schéma SQL |
| **Daniel ALEKSIC** | Gestion des tâches : création, modification, suppression, affichage des tâches, organisation en dossiers |
| **Peïo CASTETS** | Groupes et chat — messagerie instantanée via Socket.IO, création et gestion de groupes, store Pinia pour la gestion de l'état global |
| **Thomas BRANDY** | Interface utilisateur : page d'accueil, login, signup, dashboard principal, barre latérale, barre du haut, configuration du router Vue et des appels API avec Axios |
| **Alexandre BRENSKI** | Admin et carbone : gestion des utilisateurs depuis le panel admin, calcul de l'empreinte carbone, gestion du profil utilisateur |

---

## Stack technique et justifications Green IT

| Couche | Technologie | Justification Green IT |
|--------|-------------|------------------------|
| **Frontend** | Vue 3 + Vite | Bundle minimal grâce au tree-shaking de Vite, pas de framework lourd |
| **Style** | Tailwind CSS 4 | Purge automatique du CSS inutilisé, feuilles de style légères |
| **État** | Pinia | Gestion d'état légère, moins de code et moins de ressources consommées |
| **Backend** | Express.js 5 + Node.js | Serveur événementiel single-thread, faible consommation mémoire |
| **Base de données** | MySQL | Requêtes optimisées, schéma normalisé |
| **Temps réel** | Socket.io | Connexion maintenue ouverte, évite les requêtes répétées au serveur |
| **Déploiement frontend** | Vercel | CDN global, mise en cache statique, zéro serveur idle |
| **Déploiement backend** | Railway |  Infrastructure mutualisée |
| **Auth** | JWT + bcrypt | Sans état côté serveur, pas de session stockée en base |

---

## Installation et lancement en local

### Prérequis

- Node.js `^20.19.0` ou `>=22.12.0`
- MySQL 8+
- Git

### 1. Cloner le dépôt

```bash
git clone https://github.com/Amande-bld/Green_it.git
cd Green_it
```

### 2. Créer la base de données

Connectez-vous à votre instance MySQL et exécutez le script de schéma :

```bash
mysql -u root -p < backend/src/models/database.sql
```

### 3. Configurer le backend

```bash
cd backend
cp env.example .env
```

Éditez `.env` avec vos valeurs :

```env
PORT=5001
NODE_ENV=development
MYSQLHOST=localhost
MYSQLPORT=3306
MYSQLUSER=root
MYSQLPASSWORD=votre_mot_de_passe
MYSQLDATABASE=greenit
JWT_SECRET=votre_secret_jwt
FRONTEND_URL=http://localhost:5173
```

Installez les dépendances et démarrez le serveur :

```bash
npm install
npm run dev
```

Le backend écoute sur [http://localhost:5001](http://localhost:5001).

### 4. Configurer le frontend

Dans un nouveau terminal :

```bash
cd frontend
npm install
npm run dev
```

L'application est accessible sur [http://localhost:5173](http://localhost:5173).

---

## Structure du dépôt

```
Green_it/
│
├── backend/                        # Serveur Express.js (API REST + WebSocket)
│   ├── env.example                 # Modèle de variables d'environnement
│   ├── package.json
│   └── src/
│       ├── server.js               # Point d'entrée : Express + Socket.io
│       ├── lib/
│       │   ├── db.js               # Pool de connexions MySQL
│       │   ├── protect.js          # Middleware d'authentification JWT
│       │   ├── socket.js           # Gestion des événements temps réel
│       │   └── utils.js            # Fonctions utilitaires
│       ├── models/
│       │   └── database.sql        # Schéma SQL (7 tables)
│       └── routes/
│           ├── auth.js             # POST /signup, /login, /logout, /check
│           └── api.js              # Tâches, dossiers, groupes, messages
│
├── frontend/                       # Application Vue 3 + Vite
│   ├── vercel.json                 # Config SPA rewrites pour Vercel
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.js                 # Initialisation Vue + Pinia + Router
│       ├── App.vue                 # Composant racine
│       ├── style.css               # Styles globaux Tailwind
│       ├── components/             # Composants réutilisables (modaux, sidebar…)
│       │   ├── CarbonCalculator.vue  # Calculateur d'empreinte carbone
│       │   ├── Chat.vue              # Messagerie temps réel
│       │   ├── Task.vue              # Carte de tâche
│       │   ├── SideBar.vue
│       │   ├── TopBar.vue
│       │   └── …                   # Popups : Folder, Group, Task, Profile
│       ├── views/                  # Pages (routées)
│       │   ├── Welcome.vue         # Page d'accueil publique
│       │   ├── Login.vue
│       │   ├── Signup.vue
│       │   ├── Home.vue            # Dashboard principal (tâches)
│       │   └── Admin.vue           # Interface d'administration
│       ├── router/index.js         # Routes Vue Router
│       ├── store/index.js          # Store Pinia (auth, tâches, groupes…)
│       └── lib/axios.js            # Instance Axios configurée
│
├── dist/                           # Build de production (généré)
├── .gitignore
└── README.md
```

---

## Rapport PDF

[Tou-Doux – Numérique Durable](./docs/Tou-Doux%20%E2%80%93%20Num%C3%A9rique%20Durable%20.pdf)

---

