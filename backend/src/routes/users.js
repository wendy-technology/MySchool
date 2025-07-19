const express = require('express');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus
} = require('../controllers/userController');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/utilisateurs:
 *   get:
 *     summary: Récupérer la liste des utilisateurs
 *     tags: [Utilisateurs]
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
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, ENSEIGNANT, ELEVE, PARENT]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: etablissementId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *       401:
 *         description: Non autorisé
 */
router.get('/', auth, getUsers);

/**
 * @swagger
 * /api/utilisateurs:
 *   post:
 *     summary: Créer un nouvel utilisateur
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - nom
 *               - prenom
 *               - role
 *               - etablissementId
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "enseignant@ecole.dz"
 *               nom:
 *                 type: string
 *                 example: "Benali"
 *               prenom:
 *                 type: string
 *                 example: "Mohammed"
 *               nomArabe:
 *                 type: string
 *                 example: "بن علي"
 *               prenomArabe:
 *                 type: string
 *                 example: "محمد"
 *               telephone:
 *                 type: string
 *                 example: "+213 555 123 456"
 *               adresse:
 *                 type: string
 *               dateNaissance:
 *                 type: string
 *                 format: date
 *                 example: "1985-05-15"
 *               role:
 *                 type: string
 *                 enum: [ADMIN, ENSEIGNANT, ELEVE, PARENT]
 *               etablissementId:
 *                 type: string
 *               motDePasse:
 *                 type: string
 *                 minLength: 6
 *               enseignant:
 *                 type: object
 *                 properties:
 *                   specialite:
 *                     type: string
 *                     example: "Mathématiques"
 *                   specialiteArabe:
 *                     type: string
 *                     example: "الرياضيات"
 *               eleve:
 *                 type: object
 *                 properties:
 *                   classeId:
 *                     type: string
 *               parent:
 *                 type: object
 *                 properties:
 *                   profession:
 *                     type: string
 *                   enfants:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         eleveId:
 *                           type: string
 *                         lienParente:
 *                           type: string
 *                           example: "père"
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Données invalides
 */
router.post('/', auth, requireRole('ADMIN', 'ENSEIGNANT'), createUser);

/**
 * @swagger
 * /api/utilisateurs/{id}:
 *   get:
 *     summary: Récupérer un utilisateur par ID
 *     tags: [Utilisateurs]
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
 *         description: Détails de l'utilisateur
 *       404:
 *         description: Utilisateur non trouvé
 */
router.get('/:id', auth, getUserById);

/**
 * @swagger
 * /api/utilisateurs/{id}:
 *   put:
 *     summary: Mettre à jour un utilisateur
 *     tags: [Utilisateurs]
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
 *               email:
 *                 type: string
 *                 format: email
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               nomArabe:
 *                 type: string
 *               prenomArabe:
 *                 type: string
 *               telephone:
 *                 type: string
 *               adresse:
 *                 type: string
 *               motDePasse:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour
 *       404:
 *         description: Utilisateur non trouvé
 */
router.put('/:id', auth, requireRole('ADMIN', 'ENSEIGNANT'), updateUser);

/**
 * @swagger
 * /api/utilisateurs/{id}/toggle-status:
 *   patch:
 *     summary: Activer/désactiver un utilisateur
 *     tags: [Utilisateurs]
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
 *         description: Statut modifié avec succès
 *       404:
 *         description: Utilisateur non trouvé
 */
router.patch('/:id/toggle-status', auth, requireRole('ADMIN'), toggleUserStatus);

/**
 * @swagger
 * /api/utilisateurs/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     tags: [Utilisateurs]
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
 *         description: Utilisateur supprimé
 *       404:
 *         description: Utilisateur non trouvé
 */
router.delete('/:id', auth, requireRole('ADMIN'), deleteUser);

module.exports = router;