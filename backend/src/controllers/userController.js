const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { z } = require('zod');

const userSchema = z.object({
  email: z.string().email('Format d\'email invalide'),
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
  etablissementId: z.string().min(1, 'Établissement requis'),
  motDePasse: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères').optional(),
  
  // Données spécifiques selon le rôle
  enseignant: z.object({
    matricule: z.string().optional(),
    specialite: z.string().min(1, 'Spécialité requise'),
    specialiteArabe: z.string().optional()
  }).optional(),
  
  eleve: z.object({
    numeroEleve: z.string().optional(),
    classeId: z.string().optional()
  }).optional(),
  
  parent: z.object({
    profession: z.string().optional(),
    professionArabe: z.string().optional(),
    enfants: z.array(z.object({
      eleveId: z.string(),
      lienParente: z.string()
    })).optional()
  }).optional()
});

const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const where = {};
    
    if (req.query.role) {
      where.role = req.query.role;
    }

    if (req.query.search) {
      where.OR = [
        { nom: { contains: req.query.search, mode: 'insensitive' } },
        { prenom: { contains: req.query.search, mode: 'insensitive' } },
        { email: { contains: req.query.search, mode: 'insensitive' } }
      ];
    }

    if (req.user.role !== 'ADMIN') {
      where.etablissementId = req.user.etablissementId;
    } else if (req.query.etablissementId) {
      where.etablissementId = req.query.etablissementId;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          nom: true,
          prenom: true,
          nomArabe: true,
          prenomArabe: true,
          telephone: true,
          role: true,
          estActif: true,
          createdAt: true,
          etablissement: {
            select: {
              id: true,
              nom: true,
              nomArabe: true
            }
          },
          enseignant: {
            select: {
              matricule: true,
              specialite: true,
              specialiteArabe: true
            }
          },
          eleve: {
            select: {
              numeroEleve: true,
              classe: {
                select: {
                  id: true,
                  nom: true,
                  niveau: true,
                  cycle: true
                }
              }
            }
          },
          parent: {
            select: {
              profession: true,
              professionArabe: true,
              parentsEleves: {
                select: {
                  lienParente: true,
                  eleve: {
                    select: {
                      id: true,
                      numeroEleve: true,
                      user: {
                        select: {
                          nom: true,
                          prenom: true
                        }
                      },
                      classe: {
                        select: {
                          nom: true,
                          niveau: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        nomArabe: true,
        prenomArabe: true,
        telephone: true,
        adresse: true,
        adresseArabe: true,
        dateNaissance: true,
        lieuNaissance: true,
        role: true,
        estActif: true,
        createdAt: true,
        updatedAt: true,
        etablissement: {
          select: {
            id: true,
            nom: true,
            nomArabe: true
          }
        },
        enseignant: {
          include: {
            matiereClasses: {
              include: {
                matiere: true,
                classe: {
                  select: {
                    id: true,
                    nom: true,
                    niveau: true,
                    cycle: true
                  }
                }
              }
            }
          }
        },
        eleve: {
          include: {
            classe: {
              select: {
                id: true,
                nom: true,
                niveau: true,
                cycle: true,
                filiere: true
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
                        telephone: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        parent: {
          include: {
            parentsEleves: {
              include: {
                eleve: {
                  include: {
                    user: {
                      select: {
                        nom: true,
                        prenom: true
                      }
                    },
                    classe: {
                      select: {
                        nom: true,
                        niveau: true,
                        cycle: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    if (req.user.role !== 'ADMIN' && req.user.etablissementId !== user.etablissement.id) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const createUser = async (req, res) => {
  try {
    const validatedData = userSchema.parse(req.body);
    const { motDePasse, dateNaissance, enseignant, eleve, parent, ...userData } = validatedData;

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

    if (req.user.role !== 'ADMIN' && req.user.etablissementId !== userData.etablissementId) {
      return res.status(403).json({ message: 'Vous ne pouvez créer des utilisateurs que dans votre établissement' });
    }

    const hashedPassword = motDePasse ? await bcrypt.hash(motDePasse, 12) : await bcrypt.hash('motdepasse123', 12);

    const user = await prisma.user.create({
      data: {
        ...userData,
        motDePasse: hashedPassword,
        dateNaissance: dateNaissance ? new Date(dateNaissance) : null
      }
    });

    if (userData.role === 'ENSEIGNANT' && enseignant) {
      await prisma.enseignant.create({
        data: {
          userId: user.id,
          matricule: enseignant.matricule || `ENS${Date.now()}`,
          specialite: enseignant.specialite,
          specialiteArabe: enseignant.specialiteArabe
        }
      });
    } else if (userData.role === 'ELEVE' && eleve) {
      await prisma.eleve.create({
        data: {
          userId: user.id,
          numeroEleve: eleve.numeroEleve || `EL${Date.now()}`,
          classeId: eleve.classeId
        }
      });
    } else if (userData.role === 'PARENT' && parent) {
      const parentRecord = await prisma.parent.create({
        data: {
          userId: user.id,
          profession: parent.profession,
          professionArabe: parent.professionArabe
        }
      });

      if (parent.enfants && parent.enfants.length > 0) {
        await prisma.parentEleve.createMany({
          data: parent.enfants.map(enfant => ({
            parentId: parentRecord.id,
            eleveId: enfant.eleveId,
            lienParente: enfant.lienParente
          }))
        });
      }
    }

    const createdUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        etablissement: {
          select: {
            nom: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: createdUser
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: error.errors
      });
    }
    
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    if (req.user.role !== 'ADMIN' && req.user.etablissementId !== user.etablissementId) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const updateData = { ...updates };
    delete updateData.motDePasse;
    delete updateData.enseignant;
    delete updateData.eleve;
    delete updateData.parent;

    if (updates.motDePasse) {
      updateData.motDePasse = await bcrypt.hash(updates.motDePasse, 12);
    }

    if (updates.dateNaissance) {
      updateData.dateNaissance = new Date(updates.dateNaissance);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        estActif: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'Utilisateur mis à jour avec succès',
      user: updatedUser
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    if (req.user.role !== 'ADMIN' && req.user.etablissementId !== user.etablissementId) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    await prisma.user.delete({
      where: { id }
    });

    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    if (req.user.role !== 'ADMIN' && req.user.etablissementId !== user.etablissementId) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { estActif: !user.estActif },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        estActif: true
      }
    });

    res.json({
      message: `Utilisateur ${updatedUser.estActif ? 'activé' : 'désactivé'} avec succès`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Erreur lors du changement de statut:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus
};