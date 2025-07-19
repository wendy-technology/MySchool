const express = require('express');
const {
  getMatieres,
  getMatiereById,
  createMatiere,
  updateMatiere,
  deleteMatiere,
  assignMatiereToClasse,
  unassignMatiereFromClasse
} = require('../controllers/matiereController');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/matieres:
 *   get:
 *     summary: Récupérer la liste des matières
 *     tags: [Matières]
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
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des matières
 *       401:
 *         description: Non autorisé
 */
router.get('/', auth, getMatieres);

/**
 * @swagger
 * /api/matieres:
 *   post:
 *     summary: Créer une nouvelle matière
 *     tags: [Matières]
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
 *               - code
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "Mathématiques"
 *               nomArabe:
 *                 type: string
 *                 example: "الرياضيات"
 *               code:
 *                 type: string
 *                 maxLength: 10
 *                 example: "MATH"
 *               coefficient:
 *                 type: number
 *                 minimum: 0.5
 *                 maximum: 10
 *                 default: 1.0
 *                 example: 3.0
 *               couleur:
 *                 type: string
 *                 pattern: "^#[0-9A-Fa-f]{6}$"
 *                 default: "#3B82F6"
 *                 example: "#FF6B35"
 *     responses:
 *       201:
 *         description: Matière créée avec succès
 *       400:
 *         description: Données invalides
 */
router.post('/', auth, requireRole('ADMIN'), createMatiere);

/**
 * @swagger
 * /api/matieres/assign:
 *   post:
 *     summary: Assigner une matière à une classe avec un enseignant
 *     tags: [Matières]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - matiereId
 *               - classeId
 *               - enseignantId
 *             properties:
 *               matiereId:
 *                 type: string
 *                 example: "clp1234567890abcdef"
 *               classeId:
 *                 type: string
 *                 example: "clp1234567890abcdef"
 *               enseignantId:
 *                 type: string
 *                 example: "clp1234567890abcdef"
 *               volumeHoraire:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 20
 *                 default: 1
 *                 example: 4
 *     responses:
 *       201:
 *         description: Matière assignée avec succès
 *       400:
 *         description: Données invalides ou assignation déjà existante
 */
router.post('/assign', auth, requireRole('ADMIN', 'ENSEIGNANT'), assignMatiereToClasse);

/**
 * @swagger
 * /api/matieres/{id}:
 *   get:
 *     summary: Récupérer une matière par ID
 *     tags: [Matières]
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
 *         description: Détails de la matière
 *       404:
 *         description: Matière non trouvée
 */
router.get('/:id', auth, getMatiereById);

/**
 * @swagger
 * /api/matieres/{id}:
 *   put:
 *     summary: Mettre à jour une matière
 *     tags: [Matières]
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
 *               nom:
 *                 type: string
 *               nomArabe:
 *                 type: string
 *               code:
 *                 type: string
 *                 maxLength: 10
 *               coefficient:
 *                 type: number
 *                 minimum: 0.5
 *                 maximum: 10
 *               couleur:
 *                 type: string
 *                 pattern: "^#[0-9A-Fa-f]{6}$"
 *     responses:
 *       200:
 *         description: Matière mise à jour
 *       404:
 *         description: Matière non trouvée
 */
router.put('/:id', auth, requireRole('ADMIN'), updateMatiere);

/**
 * @swagger
 * /api/matieres/{matiereId}/classes/{classeId}:
 *   delete:
 *     summary: Désassigner une matière d'une classe
 *     tags: [Matières]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matiereId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: classeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Matière désassignée avec succès
 *       404:
 *         description: Assignation non trouvée
 */
router.delete('/:matiereId/classes/:classeId', auth, requireRole('ADMIN', 'ENSEIGNANT'), unassignMatiereFromClasse);

/**
 * @swagger
 * /api/matieres/{id}:
 *   delete:
 *     summary: Supprimer une matière
 *     tags: [Matières]
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
 *         description: Matière supprimée
 *       400:
 *         description: Impossible de supprimer
 *       404:
 *         description: Matière non trouvée
 */
router.delete('/:id', auth, requireRole('ADMIN'), deleteMatiere);

module.exports = router;