const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { generateToken } = require('../utils/jwt');
const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().email('Format d\'email invalide'),
  motDePasse: z.string().min(1, 'Mot de passe requis')
});

const registerSchema = z.object({
  email: z.string().email('Format d\'email invalide'),
  motDePasse: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  nom: z.string().min(1, 'Nom requis'),
  prenom: z.string().min(1, 'Prénom requis'),
  nomArabe: z.string().optional(),
  prenomArabe: z.string().optional(),
  telephone: z.string().optional(),
  adresse: z.string().optional(),
  adresseArabe: z.string().optional(),
  dateNaissance: z.string().optional(),
  lieuNaissance: z.string().optional(),
  role: z.enum(['ADMIN', 'ENSEIGNANT', 'ELEVE', 'PARENT']),
  etablissementId: z.string().min(1, 'Établissement requis')
});

const login = async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, motDePasse } = validatedData;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        etablissement: true,
        enseignant: true,
        eleve: {
          include: {
            classe: true
          }
        },
        parent: {
          include: {
            parentsEleves: {
              include: {
                eleve: {
                  include: {
                    user: true,
                    classe: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user || !user.estActif) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const isValidPassword = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const token = generateToken(user.id);

    const { motDePasse: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Connexion réussie',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: error.errors
      });
    }
    
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const register = async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { motDePasse, dateNaissance, ...userData } = validatedData;

    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    const etablissement = await prisma.etablissement.findUnique({
      where: { id: userData.etablissementId }
    });

    if (!etablissement) {
      return res.status(400).json({ message: 'Établissement non trouvé' });
    }

    const hashedPassword = await bcrypt.hash(motDePasse, 12);

    const user = await prisma.user.create({
      data: {
        ...userData,
        motDePasse: hashedPassword,
        dateNaissance: dateNaissance ? new Date(dateNaissance) : null
      },
      include: {
        etablissement: true
      }
    });

    if (userData.role === 'ENSEIGNANT') {
      await prisma.enseignant.create({
        data: {
          userId: user.id,
          matricule: `ENS${Date.now()}`,
          specialite: 'Non spécifiée'
        }
      });
    } else if (userData.role === 'ELEVE') {
      await prisma.eleve.create({
        data: {
          userId: user.id,
          numeroEleve: `EL${Date.now()}`
        }
      });
    } else if (userData.role === 'PARENT') {
      await prisma.parent.create({
        data: {
          userId: user.id
        }
      });
    }

    const token = generateToken(user.id);

    const { motDePasse: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'Compte créé avec succès',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: error.errors
      });
    }
    
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const getProfile = async (req, res) => {
  try {
    const { motDePasse, ...userWithoutPassword } = req.user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

module.exports = {
  login,
  register,
  getProfile
};