const express = require('express');
const {
  deposerJustificatif,
  getJustificatifsEleve,
  validerJustificatif
} = require('../controllers/absenceController');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/justificatifs:
 *   post:
 *     summary: Déposer un justificatif d'absence
 *     tags: [Justificatifs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - motif
 *               - dateDebut
 *               - dateFin
 *               - eleveId
 *             properties:
 *               motif:
 *                 type: string
 *                 example: "Rendez-vous médical"
 *               dateDebut:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-15"
 *               dateFin:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-15"
 *               document:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/certificat-medical.pdf"
 *               commentaire:
 *                 type: string
 *                 example: "Certificat médical en pièce jointe"
 *               eleveId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Justificatif déposé avec succès
 *       400:
 *         description: Données invalides
 *       403:
 *         description: Accès interdit
 */
router.post('/', auth, requireRole('ELEVE', 'PARENT'), deposerJustificatif);

/**
 * @swagger
 * /api/justificatifs/eleve/{eleveId}:
 *   get:
 *     summary: Récupérer les justificatifs d'un élève
 *     tags: [Justificatifs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eleveId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Justificatifs de l'élève
 *       403:
 *         description: Accès non autorisé
 */
router.get('/eleve/:eleveId', auth, getJustificatifsEleve);

/**
 * @swagger
 * /api/justificatifs/{id}/valider:
 *   put:
 *     summary: Valider ou rejeter un justificatif
 *     tags: [Justificatifs]
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
 *               - valide
 *             properties:
 *               valide:
 *                 type: boolean
 *                 example: true
 *               commentaire:
 *                 type: string
 *                 example: "Justificatif accepté, certificat médical valide"
 *     responses:
 *       200:
 *         description: Justificatif validé/rejeté
 *       404:
 *         description: Justificatif non trouvé
 *       403:
 *         description: Accès non autorisé
 */
router.put('/:id/valider', auth, requireRole('ADMIN', 'ENSEIGNANT'), validerJustificatif);

module.exports = router;