const express = require('express');
const {
  getClasses,
  getClasseById,
  createClasse,
  updateClasse,
  deleteClasse,
  getClasseEleves
} = require('../controllers/classeController');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/classes:
 *   get:
 *     summary: Récupérer la liste des classes
 *     tags: [Classes]
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
 *         name: niveau
 *         schema:
 *           type: string
 *           enum: [CP, CE1, CE2, CM1, CM2, PREMIERE_AM, DEUXIEME_AM, TROISIEME_AM, QUATRIEME_AM, PREMIERE_AS, DEUXIEME_AS, TERMINALE]
 *       - in: query
 *         name: cycle
 *         schema:
 *           type: string
 *           enum: [PRIMAIRE, MOYEN, SECONDAIRE]
 *       - in: query
 *         name: etablissementId
 *         schema:
 *           type: string
 *       - in: query
 *         name: anneeScolaireId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des classes
 *       401:
 *         description: Non autorisé
 */
router.get('/', auth, getClasses);

/**
 * @swagger
 * /api/classes:
 *   post:
 *     summary: Créer une nouvelle classe
 *     tags: [Classes]
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
 *               - niveau
 *               - cycle
 *               - etablissementId
 *               - anneeScolaireId
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "6ème A"
 *               nomArabe:
 *                 type: string
 *                 example: "السادسة أ"
 *               niveau:
 *                 type: string
 *                 enum: [CP, CE1, CE2, CM1, CM2, PREMIERE_AM, DEUXIEME_AM, TROISIEME_AM, QUATRIEME_AM, PREMIERE_AS, DEUXIEME_AS, TERMINALE]
 *                 example: "PREMIERE_AM"
 *               cycle:
 *                 type: string
 *                 enum: [PRIMAIRE, MOYEN, SECONDAIRE]
 *                 example: "MOYEN"
 *               filiere:
 *                 type: string
 *                 enum: [GENERAL, SCIENCES_EXPERIMENTALES, MATHEMATIQUES, LETTRES_PHILOSOPHIE, LANGUES_ETRANGERES, GESTION_ECONOMIE]
 *                 default: "GENERAL"
 *               effectifMax:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 50
 *                 default: 35
 *               salleClasse:
 *                 type: string
 *                 example: "Salle 12"
 *               etablissementId:
 *                 type: string
 *               anneeScolaireId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Classe créée avec succès
 *       400:
 *         description: Données invalides
 */
router.post('/', auth, requireRole('ADMIN', 'ENSEIGNANT'), createClasse);

/**
 * @swagger
 * /api/classes/{id}:
 *   get:
 *     summary: Récupérer une classe par ID
 *     tags: [Classes]
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
 *         description: Détails de la classe
 *       404:
 *         description: Classe non trouvée
 */
router.get('/:id', auth, getClasseById);

/**
 * @swagger
 * /api/classes/{id}/eleves:
 *   get:
 *     summary: Récupérer les élèves d'une classe
 *     tags: [Classes]
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
 *         description: Liste des élèves de la classe
 *       404:
 *         description: Classe non trouvée
 */
router.get('/:id/eleves', auth, getClasseEleves);

/**
 * @swagger
 * /api/classes/{id}:
 *   put:
 *     summary: Mettre à jour une classe
 *     tags: [Classes]
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
 *               niveau:
 *                 type: string
 *                 enum: [CP, CE1, CE2, CM1, CM2, PREMIERE_AM, DEUXIEME_AM, TROISIEME_AM, QUATRIEME_AM, PREMIERE_AS, DEUXIEME_AS, TERMINALE]
 *               cycle:
 *                 type: string
 *                 enum: [PRIMAIRE, MOYEN, SECONDAIRE]
 *               filiere:
 *                 type: string
 *                 enum: [GENERAL, SCIENCES_EXPERIMENTALES, MATHEMATIQUES, LETTRES_PHILOSOPHIE, LANGUES_ETRANGERES, GESTION_ECONOMIE]
 *               effectifMax:
 *                 type: integer
 *               salleClasse:
 *                 type: string
 *     responses:
 *       200:
 *         description: Classe mise à jour
 *       404:
 *         description: Classe non trouvée
 */
router.put('/:id', auth, requireRole('ADMIN', 'ENSEIGNANT'), updateClasse);

/**
 * @swagger
 * /api/classes/{id}:
 *   delete:
 *     summary: Supprimer une classe
 *     tags: [Classes]
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
 *         description: Classe supprimée
 *       400:
 *         description: Impossible de supprimer
 *       404:
 *         description: Classe non trouvée
 */
router.delete('/:id', auth, requireRole('ADMIN'), deleteClasse);

module.exports = router;