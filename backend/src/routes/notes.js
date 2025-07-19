const express = require('express');
const {
  saisirNote,
  getNotesEleve,
  getNotesEvaluation
} = require('../controllers/evaluationController');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/notes:
 *   post:
 *     summary: Saisir une note pour un élève
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - valeur
 *               - evaluationId
 *               - eleveId
 *             properties:
 *               valeur:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 20
 *                 example: 15.5
 *               commentaire:
 *                 type: string
 *                 example: "Bon travail, continue tes efforts"
 *               evaluationId:
 *                 type: string
 *               eleveId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Note saisie avec succès
 *       400:
 *         description: Données invalides
 *       403:
 *         description: Accès interdit
 */
router.post('/', auth, requireRole('ADMIN', 'ENSEIGNANT'), saisirNote);

/**
 * @swagger
 * /api/notes/eleve/{eleveId}:
 *   get:
 *     summary: Récupérer les notes d'un élève
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eleveId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: trimestre
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 3
 *       - in: query
 *         name: matiereId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notes de l'élève groupées par matière et trimestre
 *       403:
 *         description: Accès non autorisé
 */
router.get('/eleve/:eleveId', auth, getNotesEleve);

/**
 * @swagger
 * /api/notes/evaluation/{evaluationId}:
 *   get:
 *     summary: Récupérer toutes les notes d'une évaluation
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: evaluationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notes de l'évaluation avec statistiques
 *       404:
 *         description: Évaluation non trouvée
 *       403:
 *         description: Accès non autorisé
 */
router.get('/evaluation/:evaluationId', auth, getNotesEvaluation);

module.exports = router;