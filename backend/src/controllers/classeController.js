const prisma = require('../config/database');
const { z } = require('zod');

const classeSchema = z.object({
  nom: z.string().min(1, 'Nom de classe requis'),
  nomArabe: z.string().optional(),
  niveau: z.enum([
    'CP', 'CE1', 'CE2', 'CM1', 'CM2',
    'PREMIERE_AM', 'DEUXIEME_AM', 'TROISIEME_AM', 'QUATRIEME_AM',
    'PREMIERE_AS', 'DEUXIEME_AS', 'TERMINALE'
  ]),
  cycle: z.enum(['PRIMAIRE', 'MOYEN', 'SECONDAIRE']),
  filiere: z.enum([
    'GENERAL', 'SCIENCES_EXPERIMENTALES', 'MATHEMATIQUES', 
    'LETTRES_PHILOSOPHIE', 'LANGUES_ETRANGERES', 'GESTION_ECONOMIE'
  ]).default('GENERAL'),
  effectifMax: z.number().int().min(1).max(50).default(35),
  salleClasse: z.string().optional(),
  etablissementId: z.string().min(1, 'Établissement requis'),
  anneeScolaireId: z.string().min(1, 'Année scolaire requise')
});

const getClasses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const where = {};
    
    if (req.query.niveau) {
      where.niveau = req.query.niveau;
    }

    if (req.query.cycle) {
      where.cycle = req.query.cycle;
    }

    if (req.query.anneeScolaireId) {
      where.anneeScolaireId = req.query.anneeScolaireId;
    }

    if (req.user.role !== 'ADMIN') {
      where.etablissementId = req.user.etablissementId;
    } else if (req.query.etablissementId) {
      where.etablissementId = req.query.etablissementId;
    }

    const [classes, total] = await Promise.all([
      prisma.classe.findMany({
        where,
        skip,
        take: limit,
        include: {
          etablissement: {
            select: {
              nom: true,
              nomArabe: true
            }
          },
          anneeScolaire: {
            select: {
              nom: true,
              estActive: true
            }
          },
          _count: {
            select: {
              eleves: true,
              matiereClasses: true
            }
          }
        },
        orderBy: [
          { cycle: 'asc' },
          { niveau: 'asc' },
          { nom: 'asc' }
        ]
      }),
      prisma.classe.count({ where })
    ]);

    res.json({
      classes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des classes:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const getClasseById = async (req, res) => {
  try {
    const { id } = req.params;

    const classe = await prisma.classe.findUnique({
      where: { id },
      include: {
        etablissement: {
          select: {
            id: true,
            nom: true,
            nomArabe: true
          }
        },
        anneeScolaire: {
          select: {
            id: true,
            nom: true,
            estActive: true
          }
        },
        eleves: {
          include: {
            user: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                nomArabe: true,
                prenomArabe: true,
                dateNaissance: true
              }
            }
          },
          orderBy: {
            user: {
              nom: 'asc'
            }
          }
        },
        matiereClasses: {
          include: {
            matiere: {
              select: {
                id: true,
                nom: true,
                nomArabe: true,
                code: true,
                coefficient: true,
                couleur: true
              }
            },
            enseignant: {
              include: {
                user: {
                  select: {
                    id: true,
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

    if (!classe) {
      return res.status(404).json({ message: 'Classe non trouvée' });
    }

    if (req.user.role !== 'ADMIN' && req.user.etablissementId !== classe.etablissementId) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    res.json({ classe });
  } catch (error) {
    console.error('Erreur lors de la récupération de la classe:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const createClasse = async (req, res) => {
  try {
    const validatedData = classeSchema.parse(req.body);

    if (req.user.role !== 'ADMIN' && req.user.etablissementId !== validatedData.etablissementId) {
      return res.status(403).json({ message: 'Vous ne pouvez créer des classes que dans votre établissement' });
    }

    const etablissement = await prisma.etablissement.findUnique({
      where: { id: validatedData.etablissementId }
    });

    if (!etablissement) {
      return res.status(400).json({ message: 'Établissement non trouvé' });
    }

    const anneeScolaire = await prisma.anneeScolaire.findUnique({
      where: { id: validatedData.anneeScolaireId }
    });

    if (!anneeScolaire) {
      return res.status(400).json({ message: 'Année scolaire non trouvée' });
    }

    const existingClasse = await prisma.classe.findFirst({
      where: {
        nom: validatedData.nom,
        anneeScolaireId: validatedData.anneeScolaireId,
        etablissementId: validatedData.etablissementId
      }
    });

    if (existingClasse) {
      return res.status(400).json({ message: 'Une classe avec ce nom existe déjà pour cette année scolaire' });
    }

    const classe = await prisma.classe.create({
      data: validatedData,
      include: {
        etablissement: {
          select: {
            nom: true
          }
        },
        anneeScolaire: {
          select: {
            nom: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Classe créée avec succès',
      classe
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: error.errors
      });
    }
    
    console.error('Erreur lors de la création de la classe:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const updateClasse = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = classeSchema.partial().parse(req.body);

    const classe = await prisma.classe.findUnique({
      where: { id }
    });

    if (!classe) {
      return res.status(404).json({ message: 'Classe non trouvée' });
    }

    if (req.user.role !== 'ADMIN' && req.user.etablissementId !== classe.etablissementId) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const updatedClasse = await prisma.classe.update({
      where: { id },
      data: validatedData,
      include: {
        etablissement: {
          select: {
            nom: true
          }
        },
        anneeScolaire: {
          select: {
            nom: true
          }
        }
      }
    });

    res.json({
      message: 'Classe mise à jour avec succès',
      classe: updatedClasse
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: error.errors
      });
    }
    
    console.error('Erreur lors de la mise à jour de la classe:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const deleteClasse = async (req, res) => {
  try {
    const { id } = req.params;

    const classe = await prisma.classe.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            eleves: true
          }
        }
      }
    });

    if (!classe) {
      return res.status(404).json({ message: 'Classe non trouvée' });
    }

    if (req.user.role !== 'ADMIN' && req.user.etablissementId !== classe.etablissementId) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    if (classe._count.eleves > 0) {
      return res.status(400).json({
        message: 'Impossible de supprimer une classe contenant des élèves'
      });
    }

    await prisma.classe.delete({
      where: { id }
    });

    res.json({ message: 'Classe supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la classe:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const getClasseEleves = async (req, res) => {
  try {
    const { id } = req.params;

    const classe = await prisma.classe.findUnique({
      where: { id },
      select: {
        id: true,
        nom: true,
        etablissementId: true
      }
    });

    if (!classe) {
      return res.status(404).json({ message: 'Classe non trouvée' });
    }

    if (req.user.role !== 'ADMIN' && req.user.etablissementId !== classe.etablissementId) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const eleves = await prisma.eleve.findMany({
      where: { classeId: id },
      include: {
        user: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            nomArabe: true,
            prenomArabe: true,
            dateNaissance: true,
            email: true,
            telephone: true
          }
        },
        parentsEleves: {
          include: {
            parent: {
              include: {
                user: {
                  select: {
                    nom: true,
                    prenom: true,
                    telephone: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        user: {
          nom: 'asc'
        }
      }
    });

    res.json({
      classe: {
        id: classe.id,
        nom: classe.nom
      },
      eleves
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des élèves:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

module.exports = {
  getClasses,
  getClasseById,
  createClasse,
  updateClasse,
  deleteClasse,
  getClasseEleves
};