const express = require('express');
const {
  signalerAbsence,
  getAbsencesEleve,
  getAbsencesClasse,
  updateAbsence,
  getStatistiquesAbsences
} = require('../controllers/absenceController');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/absences:
 *   post:
 *     summary: Signaler une absence, retard ou exclusion
 *     tags: [Absences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - type
 *               - eleveId
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-15"
 *               type:
 *                 type: string
 *                 enum: [ABSENCE, RETARD, EXCLUSION]
 *                 example: "ABSENCE"
 *               heureDebut:
 *                 type: string
 *                 example: "08:00"
 *                 description: "Requis pour les retards"
 *               heureFin:
 *                 type: string
 *                 example: "09:00"
 *               motif:
 *                 type: string
 *                 example: "Maladie"
 *               commentaire:
 *                 type: string
 *                 example: "Élève souffrant, absent toute la journée"
 *               eleveId:
 *                 type: string
 *               matiereId:
 *                 type: string
 *                 description: "Optionnel, pour absence à un cours spécifique"
 *     responses:
 *       201:
 *         description: Absence signalée avec succès
 *       400:
 *         description: Données invalides
 *       403:
 *         description: Accès interdit
 */
router.post('/', auth, requireRole('ADMIN', 'ENSEIGNANT'), signalerAbsence);

/**
 * @swagger
 * /api/absences/eleve/{eleveId}:
 *   get:
 *     summary: Récupérer les absences d'un élève
 *     tags: [Absences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eleveId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: dateDebut
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dateFin
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [ABSENCE, RETARD, EXCLUSION]
 *     responses:
 *       200:
 *         description: Absences de l'élève avec statistiques
 *       403:
 *         description: Accès non autorisé
 */
router.get('/eleve/:eleveId', auth, getAbsencesEleve);

/**
 * @swagger
 * /api/absences/classe/{classeId}:
 *   get:
 *     summary: Récupérer les absences d'une classe
 *     tags: [Absences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classeId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [ABSENCE, RETARD, EXCLUSION]
 *     responses:
 *       200:
 *         description: Absences de la classe
 *       404:
 *         description: Classe non trouvée
 *       403:
 *         description: Accès non autorisé
 */
router.get('/classe/:classeId', auth, getAbsencesClasse);

/**
 * @swagger
 * /api/absences/{id}:
 *   put:
 *     summary: Mettre à jour une absence (justifier, modifier)
 *     tags: [Absences]
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
 *               justifie:
 *                 type: boolean
 *                 example: true
 *               motif:
 *                 type: string
 *                 example: "Rendez-vous médical"
 *               commentaire:
 *                 type: string
 *                 example: "Justificatif médical fourni"
 *     responses:
 *       200:
 *         description: Absence mise à jour
 *       404:
 *         description: Absence non trouvée
 */
router.put('/:id', auth, requireRole('ADMIN', 'ENSEIGNANT'), updateAbsence);

/**
 * @swagger
 * /api/absences/statistiques:
 *   get:
 *     summary: Récupérer les statistiques d'absences
 *     tags: [Absences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: classeId
 *         schema:
 *           type: string
 *       - in: query
 *         name: eleveId
 *         schema:
 *           type: string
 *       - in: query
 *         name: dateDebut
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dateFin
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Statistiques d'absences
 *       403:
 *         description: Accès non autorisé
 */
router.get('/statistiques', auth, getStatistiquesAbsences);

module.exports = router;