# MySchool - Système de Gestion Scolaire Algérien (Full Stack)

API REST complète et interface web pour la gestion des établissements scolaires algériens.

## 🏗️ Architecture du projet

```
MySchool/
├── 📁 backend/          # API REST (Node.js + Express + Prisma)
│   ├── src/             # Code source backend
│   ├── prisma/          # Schéma et seeds base de données
│   ├── package.json     # Dépendances backend
│   └── README.md        # Documentation backend
├── 📁 frontend/         # Interface web (à développer)
│   └── ...              # React/Next.js application
├── package.json         # Scripts globaux
└── README.md           # Ce fichier
```

## 🚀 Démarrage rapide

### **Installation complète**
```bash
# Installer les dépendances globales
npm install

# Installer backend et frontend
npm run install:all
```

### **Développement backend uniquement**
```bash
# Installer les dépendances backend
npm run backend:install

# Configurer la base de données
npm run backend:db:generate
npm run backend:db:push
npm run backend:db:reset

# Démarrer le serveur de développement
npm run backend:dev
```

### **Développement full-stack** (quand frontend sera prêt)
```bash
# Démarrer backend ET frontend en parallèle
npm run dev
```

## 📊 Modules implémentés (Phase 2A)

- ✅ **Authentification JWT** avec rôles (Admin, Enseignant, Élève, Parent)
- ✅ **Gestion des utilisateurs** et établissements
- ✅ **Structure académique** (Classes, Matières, Années scolaires)
- ✅ **Notes & Évaluations** avec calculs automatiques de moyennes
- ✅ **Bulletins trimestriels** avec rangs et appréciations
- ✅ **Absences & Retards** avec système de justificatifs
- ✅ **Emploi du temps** avec créneaux et salles
- ✅ **API REST complète** (25+ endpoints)
- ✅ **Documentation Swagger** interactive

## 🌐 URLs importantes

- **API Backend** : `http://localhost:3000`
- **Documentation Swagger** : `http://localhost:3000/api-docs`
- **Frontend** : `http://localhost:5173` (quand configuré)

## 🎭 Comptes de test

```bash
# Administrateur
Email: admin@cem-ibnkhaldoun.edu.dz
Mot de passe: admin123

# Enseignants
Email: maths@cem-ibnkhaldoun.edu.dz
Email: francais@cem-ibnkhaldoun.edu.dz
Mot de passe: enseignant123

# Élèves
Email: yasmine.benamara@cem-ibnkhaldoun.edu.dz
Mot de passe: eleve123

# Parents
Email: ali.benamara@gmail.com
Mot de passe: parent123
```

## 🔧 Scripts disponibles

### **Scripts globaux** (racine)
- `npm run dev` - Démarrer backend + frontend
- `npm run install:all` - Installer toutes les dépendances

### **Scripts backend**
- `npm run backend:dev` - Serveur de développement
- `npm run backend:start` - Serveur de production
- `npm run backend:test` - Tests unitaires
- `npm run backend:db:*` - Commandes base de données

### **Scripts frontend** (à venir)
- `npm run frontend:dev` - Interface de développement
- `npm run frontend:build` - Build de production

## 🚀 Prochaines étapes

1. **Phase 2B** : Développement interface web (React/Next.js)
2. **Phase 3** : Modules avancés (Examens, Emploi du temps avancé)
3. **Phase 4** : Mobile app (React Native)

## 📞 Support

Pour toute question, créer une issue sur GitHub.

---

## 📂 Documentation détaillée

- [Backend API](./backend/README.md) - Documentation complète de l'API
- Frontend Guide (à venir) - Guide d'utilisation de l'interface