const express = require('express');
const {
  genererBulletins,
  getBulletinsEleve,
  getBulletinById,
  updateAppreciation
} = require('../controllers/bulletinController');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/bulletins/generer:
 *   post:
 *     summary: Générer les bulletins trimestriels pour une classe
 *     tags: [Bulletins]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - classeId
 *               - trimestre
 *               - annee
 *             properties:
 *               classeId:
 *                 type: string
 *                 example: "clp1234567890abcdef"
 *               trimestre:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 3
 *                 example: 1
 *               annee:
 *                 type: string
 *                 example: "2023-2024"
 *     responses:
 *       201:
 *         description: Bulletins générés avec succès
 *       400:
 *         description: Données invalides
 *       403:
 *         description: Accès interdit
 */
router.post('/generer', auth, requireRole('ADMIN', 'ENSEIGNANT'), genererBulletins);

/**
 * @swagger
 * /api/bulletins/eleve/{eleveId}:
 *   get:
 *     summary: Récupérer les bulletins d'un élève
 *     tags: [Bulletins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eleveId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: annee
 *         schema:
 *           type: string
 *           example: "2023-2024"
 *     responses:
 *       200:
 *         description: Bulletins de l'élève
 *       403:
 *         description: Accès non autorisé
 */
router.get('/eleve/:eleveId', auth, getBulletinsEleve);

/**
 * @swagger
 * /api/bulletins/{id}:
 *   get:
 *     summary: Récupérer un bulletin détaillé par ID
 *     tags: [Bulletins]
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
 *         description: Bulletin détaillé avec statistiques de classe
 *       404:
 *         description: Bulletin non trouvé
 *       403:
 *         description: Accès non autorisé
 */
router.get('/:id', auth, getBulletinById);

/**
 * @swagger
 * /api/bulletins/{id}/appreciation:
 *   put:
 *     summary: Mettre à jour l'appréciation d'un bulletin
 *     tags: [Bulletins]
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
 *             required:
 *               - appreciation
 *             properties:
 *               appreciation:
 *                 type: string
 *                 example: "Élève sérieux et appliqué. Continuez vos efforts."
 *     responses:
 *       200:
 *         description: Appréciation mise à jour
 *       404:
 *         description: Bulletin non trouvé
 */
router.put('/:id/appreciation', auth, requireRole('ADMIN', 'ENSEIGNANT'), updateAppreciation);

module.exports = router;