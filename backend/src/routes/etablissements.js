const express = require('express');
const {
  createEtablissement,
  getEtablissements,
  getEtablissementById,
  updateEtablissement,
  deleteEtablissement
} = require('../controllers/etablissementController');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/etablissements:
 *   get:
 *     summary: Récupérer la liste des établissements
 *     tags: [Établissements]
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
 *         name: wilaya
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des établissements
 *       401:
 *         description: Non autorisé
 */
router.get('/', auth, getEtablissements);

/**
 * @swagger
 * /api/etablissements:
 *   post:
 *     summary: Créer un nouvel établissement
 *     tags: [Établissements]
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
 *               - adresse
 *               - wilaya
 *               - commune
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "École Primaire Ahmed Zabana"
 *               nomArabe:
 *                 type: string
 *                 example: "مدرسة أحمد زبانة الابتدائية"
 *               adresse:
 *                 type: string
 *                 example: "Rue de la Liberté, Alger"
 *               adresseArabe:
 *                 type: string
 *               wilaya:
 *                 type: string
 *                 example: "Alger"
 *               commune:
 *                 type: string
 *                 example: "Alger-Centre"
 *               telephone:
 *                 type: string
 *                 example: "+213 21 123 456"
 *               email:
 *                 type: string
 *                 example: "contact@ecole-zabana.dz"
 *               directeur:
 *                 type: string
 *                 example: "M. Mohammed Benali"
 *               directeurArabe:
 *                 type: string
 *     responses:
 *       201:
 *         description: Établissement créé avec succès
 *       400:
 *         description: Données invalides
 *       403:
 *         description: Accès interdit
 */
router.post('/', auth, requireRole('ADMIN'), createEtablissement);

/**
 * @swagger
 * /api/etablissements/{id}:
 *   get:
 *     summary: Récupérer un établissement par ID
 *     tags: [Établissements]
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
 *         description: Détails de l'établissement
 *       404:
 *         description: Établissement non trouvé
 */
router.get('/:id', auth, getEtablissementById);

/**
 * @swagger
 * /api/etablissements/{id}:
 *   put:
 *     summary: Mettre à jour un établissement
 *     tags: [Établissements]
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
 *               adresse:
 *                 type: string
 *               adresseArabe:
 *                 type: string
 *               wilaya:
 *                 type: string
 *               commune:
 *                 type: string
 *               telephone:
 *                 type: string
 *               email:
 *                 type: string
 *               directeur:
 *                 type: string
 *               directeurArabe:
 *                 type: string
 *     responses:
 *       200:
 *         description: Établissement mis à jour
 *       404:
 *         description: Établissement non trouvé
 */
router.put('/:id', auth, requireRole('ADMIN'), updateEtablissement);

/**
 * @swagger
 * /api/etablissements/{id}:
 *   delete:
 *     summary: Supprimer un établissement
 *     tags: [Établissements]
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
 *         description: Établissement supprimé
 *       400:
 *         description: Impossible de supprimer
 *       404:
 *         description: Établissement non trouvé
 */
router.delete('/:id', auth, requireRole('ADMIN'), deleteEtablissement);

module.exports = router;