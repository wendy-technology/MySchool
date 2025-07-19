const express = require('express');
const {
  createEvaluation,
  getEvaluations,
  getEvaluationById,
  updateEvaluation,
  deleteEvaluation,
  saisirNote,
  getNotesEleve,
  getNotesEvaluation
} = require('../controllers/evaluationController');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/evaluations:
 *   post:
 *     summary: Créer une nouvelle évaluation
 *     tags: [Évaluations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titre
 *               - type
 *               - date
 *               - trimestre
 *               - matiereId
 *               - classeId
 *             properties:
 *               titre:
 *                 type: string
 *                 example: "Contrôle Algèbre"
 *               description:
 *                 type: string
 *                 example: "Évaluation sur les équations du second degré"
 *               type:
 *                 type: string
 *                 enum: [CONTROLE_CONTINU, DEVOIR_SURVEILLE, EXAMEN]
 *                 example: "DEVOIR_SURVEILLE"
 *               coefficient:
 *                 type: number
 *                 minimum: 0.5
 *                 maximum: 10
 *                 default: 1.0
 *                 example: 2.0
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-15"
 *               noteMax:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 20
 *                 default: 20.0
 *                 example: 20.0
 *               trimestre:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 3
 *                 example: 2
 *               matiereId:
 *                 type: string
 *               classeId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Évaluation créée avec succès
 *       400:
 *         description: Données invalides
 *       403:
 *         description: Accès interdit
 */
router.post('/', auth, requireRole('ADMIN', 'ENSEIGNANT'), createEvaluation);

/**
 * @swagger
 * /api/evaluations:
 *   get:
 *     summary: Récupérer la liste des évaluations
 *     tags: [Évaluations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: classeId
 *         schema:
 *           type: string
 *       - in: query
 *         name: matiereId
 *         schema:
 *           type: string
 *       - in: query
 *         name: trimestre
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 3
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [CONTROLE_CONTINU, DEVOIR_SURVEILLE, EXAMEN]
 *     responses:
 *       200:
 *         description: Liste des évaluations
 *       401:
 *         description: Non autorisé
 */
router.get('/', auth, getEvaluations);

/**
 * @swagger
 * /api/evaluations/{id}:
 *   get:
 *     summary: Récupérer une évaluation par ID
 *     tags: [Évaluations]
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
 *         description: Détails de l'évaluation
 *       404:
 *         description: Évaluation non trouvée
 */
router.get('/:id', auth, getEvaluationById);

/**
 * @swagger
 * /api/evaluations/{id}:
 *   put:
 *     summary: Mettre à jour une évaluation
 *     tags: [Évaluations]
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
 *               titre:
 *                 type: string
 *               description:
 *                 type: string
 *               coefficient:
 *                 type: number
 *               date:
 *                 type: string
 *                 format: date
 *               noteMax:
 *                 type: number
 *     responses:
 *       200:
 *         description: Évaluation mise à jour
 *       404:
 *         description: Évaluation non trouvée
 */
router.put('/:id', auth, requireRole('ADMIN', 'ENSEIGNANT'), updateEvaluation);

/**
 * @swagger
 * /api/evaluations/{id}:
 *   delete:
 *     summary: Supprimer une évaluation
 *     tags: [Évaluations]
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
 *         description: Évaluation supprimée
 *       400:
 *         description: Impossible de supprimer
 *       404:
 *         description: Évaluation non trouvée
 */
router.delete('/:id', auth, requireRole('ADMIN', 'ENSEIGNANT'), deleteEvaluation);

module.exports = router;