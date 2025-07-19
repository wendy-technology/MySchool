const express = require('express');
const {
  createCreneau,
  getCreneauxEtablissement,
  programmerCours,
  getEmploiDuTempsClasse,
  getEmploiDuTempsEnseignant,
  updateCours,
  deleteCours,
  createSalle,
  getSallesEtablissement,
  getDisponibiliteSalle
} = require('../controllers/emploiController');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// ================================
// ROUTES CRÉNEAUX
// ================================

/**
 * @swagger
 * /api/emploi-du-temps/creneaux:
 *   post:
 *     summary: Créer un nouveau créneau horaire
 *     tags: [Emploi du temps]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jour
 *               - heureDebut
 *               - heureFin
 *               - ordre
 *               - etablissementId
 *             properties:
 *               jour:
 *                 type: string
 *                 enum: [LUNDI, MARDI, MERCREDI, JEUDI, VENDREDI, SAMEDI, DIMANCHE]
 *                 example: "LUNDI"
 *               heureDebut:
 *                 type: string
 *                 pattern: "^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
 *                 example: "08:00"
 *               heureFin:
 *                 type: string
 *                 pattern: "^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
 *                 example: "09:00"
 *               ordre:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 12
 *                 example: 1
 *               etablissementId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Créneau créé avec succès
 *       400:
 *         description: Données invalides ou conflit horaire
 *       403:
 *         description: Accès interdit
 */
router.post('/creneaux', auth, requireRole('ADMIN'), createCreneau);

/**
 * @swagger
 * /api/emploi-du-temps/creneaux/etablissement/{etablissementId}:
 *   get:
 *     summary: Récupérer les créneaux d'un établissement
 *     tags: [Emploi du temps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: etablissementId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Créneaux groupés par jour
 *       403:
 *         description: Accès non autorisé
 */
router.get('/creneaux/etablissement/:etablissementId', auth, getCreneauxEtablissement);

// ================================
// ROUTES COURS
// ================================

/**
 * @swagger
 * /api/emploi-du-temps/cours:
 *   post:
 *     summary: Programmer un nouveau cours
 *     tags: [Emploi du temps]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - creneauId
 *               - matiereId
 *               - enseignantId
 *               - classeId
 *             properties:
 *               creneauId:
 *                 type: string
 *               matiereId:
 *                 type: string
 *               enseignantId:
 *                 type: string
 *               classeId:
 *                 type: string
 *               salleId:
 *                 type: string
 *                 description: "Optionnel"
 *     responses:
 *       201:
 *         description: Cours programmé avec succès
 *       400:
 *         description: Conflit détecté ou données invalides
 *       403:
 *         description: Accès interdit
 */
router.post('/cours', auth, requireRole('ADMIN', 'ENSEIGNANT'), programmerCours);

/**
 * @swagger
 * /api/emploi-du-temps/cours/classe/{classeId}:
 *   get:
 *     summary: Récupérer l'emploi du temps d'une classe
 *     tags: [Emploi du temps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Emploi du temps organisé par jour
 *       404:
 *         description: Classe non trouvée
 *       403:
 *         description: Accès non autorisé
 */
router.get('/cours/classe/:classeId', auth, getEmploiDuTempsClasse);

/**
 * @swagger
 * /api/emploi-du-temps/cours/enseignant/{enseignantId}:
 *   get:
 *     summary: Récupérer l'emploi du temps d'un enseignant
 *     tags: [Emploi du temps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: enseignantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Emploi du temps avec statistiques
 *       403:
 *         description: Accès non autorisé
 */
router.get('/cours/enseignant/:enseignantId', auth, getEmploiDuTempsEnseignant);

/**
 * @swagger
 * /api/emploi-du-temps/cours/{id}:
 *   put:
 *     summary: Modifier un cours programmé
 *     tags: [Emploi du temps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               creneauId:
 *                 type: string
 *               matiereId:
 *                 type: string
 *               enseignantId:
 *                 type: string
 *               classeId:
 *                 type: string
 *               salleId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cours mis à jour
 *       400:
 *         description: Conflit détecté
 *       404:
 *         description: Cours non trouvé
 */
router.put('/cours/:id', auth, requireRole('ADMIN', 'ENSEIGNANT'), updateCours);

/**
 * @swagger
 * /api/emploi-du-temps/cours/{id}:
 *   delete:
 *     summary: Supprimer un cours programmé
 *     tags: [Emploi du temps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cours supprimé
 *       404:
 *         description: Cours non trouvé
 */
router.delete('/cours/:id', auth, requireRole('ADMIN'), deleteCours);

// ================================
// ROUTES SALLES
// ================================

/**
 * @swagger
 * /api/emploi-du-temps/salles:
 *   post:
 *     summary: Créer une nouvelle salle
 *     tags: [Emploi du temps]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - capacite
 *               - etablissementId
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "Salle 101"
 *               capacite:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 example: 35
 *               type:
 *                 type: string
 *                 example: "Informatique"
 *               etablissementId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Salle créée avec succès
 *       400:
 *         description: Données invalides
 *       403:
 *         description: Accès interdit
 */
router.post('/salles', auth, requireRole('ADMIN'), createSalle);

/**
 * @swagger
 * /api/emploi-du-temps/salles/etablissement/{etablissementId}:
 *   get:
 *     summary: Récupérer les salles d'un établissement
 *     tags: [Emploi du temps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: etablissementId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des salles avec nombre de cours
 *       403:
 *         description: Accès non autorisé
 */
router.get('/salles/etablissement/:etablissementId', auth, getSallesEtablissement);

/**
 * @swagger
 * /api/emploi-du-temps/salles/{id}/disponibilite:
 *   get:
 *     summary: Vérifier la disponibilité d'une salle
 *     tags: [Emploi du temps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: jour
 *         schema:
 *           type: string
 *           enum: [LUNDI, MARDI, MERCREDI, JEUDI, VENDREDI, SAMEDI, DIMANCHE]
 *     responses:
 *       200:
 *         description: Disponibilité avec cours occupés
 *       404:
 *         description: Salle non trouvée
 */
router.get('/salles/:id/disponibilite', auth, getDisponibiliteSalle);

module.exports = router;