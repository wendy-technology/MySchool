const prisma = require('../config/database');
const { z } = require('zod');

const matiereSchema = z.object({
  nom: z.string().min(1, 'Nom de matière requis'),
  nomArabe: z.string().optional(),
  code: z.string().min(1, 'Code matière requis').max(10),
  coefficient: z.number().min(0.5).max(10).default(1.0),
  couleur: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Format de couleur invalide').default('#3B82F6')
});

const matiereClasseSchema = z.object({
  matiereId: z.string().min(1, 'Matière requise'),
  classeId: z.string().min(1, 'Classe requise'),
  enseignantId: z.string().min(1, 'Enseignant requis'),
  volumeHoraire: z.number().int().min(1).max(20).default(1)
});

const getMatieres = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const where = {};
    
    if (req.query.search) {
      where.OR = [
        { nom: { contains: req.query.search, mode: 'insensitive' } },
        { nomArabe: { contains: req.query.search, mode: 'insensitive' } },
        { code: { contains: req.query.search, mode: 'insensitive' } }
      ];
    }

    const [matieres, total] = await Promise.all([
      prisma.matiere.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              matiereClasses: true
            }
          }
        },
        orderBy: {
          nom: 'asc'
        }
      }),
      prisma.matiere.count({ where })
    ]);

    res.json({
      matieres,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des matières:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const getMatiereById = async (req, res) => {
  try {
    const { id } = req.params;

    const matiere = await prisma.matiere.findUnique({
      where: { id },
      include: {
        matiereClasses: {
          include: {
            classe: {
              select: {
                id: true,
                nom: true,
                niveau: true,
                cycle: true,
                etablissement: {
                  select: {
                    nom: true
                  }
                }
              }
            },
            enseignant: {
              include: {
                user: {
                  select: {
                    nom: true,
                    prenom: true,
                    nomArabe: true,
                    prenomArabe: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!matiere) {
      return res.status(404).json({ message: 'Matière non trouvée' });
    }

    res.json({ matiere });
  } catch (error) {
    console.error('Erreur lors de la récupération de la matière:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const createMatiere = async (req, res) => {
  try {
    const validatedData = matiereSchema.parse(req.body);

    const existingMatiere = await prisma.matiere.findUnique({
      where: { code: validatedData.code }
    });

    if (existingMatiere) {
      return res.status(400).json({ message: 'Une matière avec ce code existe déjà' });
    }

    const matiere = await prisma.matiere.create({
      data: validatedData
    });

    res.status(201).json({
      message: 'Matière créée avec succès',
      matiere
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: error.errors
      });
    }
    
    console.error('Erreur lors de la création de la matière:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const updateMatiere = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = matiereSchema.partial().parse(req.body);

    const matiere = await prisma.matiere.findUnique({
      where: { id }
    });

    if (!matiere) {
      return res.status(404).json({ message: 'Matière non trouvée' });
    }

    if (validatedData.code && validatedData.code !== matiere.code) {
      const existingMatiere = await prisma.matiere.findUnique({
        where: { code: validatedData.code }
      });

      if (existingMatiere) {
        return res.status(400).json({ message: 'Une matière avec ce code existe déjà' });
      }
    }

    const updatedMatiere = await prisma.matiere.update({
      where: { id },
      data: validatedData
    });

    res.json({
      message: 'Matière mise à jour avec succès',
      matiere: updatedMatiere
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: error.errors
      });
    }
    
    console.error('Erreur lors de la mise à jour de la matière:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const deleteMatiere = async (req, res) => {
  try {
    const { id } = req.params;

    const matiere = await prisma.matiere.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            matiereClasses: true
          }
        }
      }
    });

    if (!matiere) {
      return res.status(404).json({ message: 'Matière non trouvée' });
    }

    if (matiere._count.matiereClasses > 0) {
      return res.status(400).json({
        message: 'Impossible de supprimer une matière assignée à des classes'
      });
    }

    await prisma.matiere.delete({
      where: { id }
    });

    res.json({ message: 'Matière supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la matière:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const assignMatiereToClasse = async (req, res) => {
  try {
    const validatedData = matiereClasseSchema.parse(req.body);

    const matiere = await prisma.matiere.findUnique({
      where: { id: validatedData.matiereId }
    });

    if (!matiere) {
      return res.status(400).json({ message: 'Matière non trouvée' });
    }

    const classe = await prisma.classe.findUnique({
      where: { id: validatedData.classeId }
    });

    if (!classe) {
      return res.status(400).json({ message: 'Classe non trouvée' });
    }

    if (req.user.role !== 'ADMIN' && req.user.etablissementId !== classe.etablissementId) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const enseignant = await prisma.enseignant.findUnique({
      where: { id: validatedData.enseignantId },
      include: {
        user: true
      }
    });

    if (!enseignant) {
      return res.status(400).json({ message: 'Enseignant non trouvé' });
    }

    if (req.user.role !== 'ADMIN' && req.user.etablissementId !== enseignant.user.etablissementId) {
      return res.status(403).json({ message: 'Enseignant non autorisé pour cet établissement' });
    }

    const existingAssignment = await prisma.matiereClasse.findUnique({
      where: {
        matiereId_classeId: {
          matiereId: validatedData.matiereId,
          classeId: validatedData.classeId
        }
      }
    });

    if (existingAssignment) {
      return res.status(400).json({ message: 'Cette matière est déjà assignée à cette classe' });
    }

    const matiereClasse = await prisma.matiereClasse.create({
      data: validatedData,
      include: {
        matiere: {
          select: {
            nom: true,
            nomArabe: true,
            code: true
          }
        },
        classe: {
          select: {
            nom: true,
            niveau: true,
            cycle: true
          }
        },
        enseignant: {
          include: {
            user: {
              select: {
                nom: true,
                prenom: true,
                nomArabe: true,
                prenomArabe: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      message: 'Matière assignée à la classe avec succès',
      assignment: matiereClasse
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: error.errors
      });
    }
    
    console.error('Erreur lors de l\'assignation de la matière:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const unassignMatiereFromClasse = async (req, res) => {
  try {
    const { matiereId, classeId } = req.params;

    const matiereClasse = await prisma.matiereClasse.findUnique({
      where: {
        matiereId_classeId: {
          matiereId,
          classeId
        }
      },
      include: {
        classe: {
          select: {
            etablissementId: true
          }
        }
      }
    });

    if (!matiereClasse) {
      return res.status(404).json({ message: 'Assignation non trouvée' });
    }

    if (req.user.role !== 'ADMIN' && req.user.etablissementId !== matiereClasse.classe.etablissementId) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    await prisma.matiereClasse.delete({
      where: {
        matiereId_classeId: {
          matiereId,
          classeId
        }
      }
    });

    res.json({ message: 'Matière désassignée de la classe avec succès' });
  } catch (error) {
    console.error('Erreur lors de la désassignation de la matière:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

module.exports = {
  getMatieres,
  getMatiereById,
  createMatiere,
  updateMatiere,
  deleteMatiere,
  assignMatiereToClasse,
  unassignMatiereFromClasse
};