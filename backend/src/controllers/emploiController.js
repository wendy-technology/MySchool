const prisma = require('../config/database');
const { z } = require('zod');

const creneauSchema = z.object({
  jour: z.enum(['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE']),
  heureDebut: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format d\'heure invalide (HH:MM)'),
  heureFin: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format d\'heure invalide (HH:MM)'),
  ordre: z.number().int().min(1).max(12),
  etablissementId: z.string().min(1, 'Établissement requis')
});

const coursSchema = z.object({
  creneauId: z.string().min(1, 'Créneau requis'),
  matiereId: z.string().min(1, 'Matière requise'),
  enseignantId: z.string().min(1, 'Enseignant requis'),
  classeId: z.string().min(1, 'Classe requise'),
  salleId: z.string().optional()
});

const salleSchema = z.object({
  nom: z.string().min(1, 'Nom de salle requis'),
  capacite: z.number().int().min(1).max(100),
  type: z.string().optional(),
  etablissementId: z.string().min(1, 'Établissement requis')
});

// ================================
// GESTION DES CRÉNEAUX
// ================================

const createCreneau = async (req, res) => {
  try {
    const validatedData = creneauSchema.parse(req.body);

    if (req.user.role !== 'ADMIN' && req.user.etablissementId !== validatedData.etablissementId) {
      return res.status(403).json({ message: 'Vous ne pouvez créer des créneaux que dans votre établissement' });
    }

    // Vérifier que les heures sont cohérentes
    const [heureDebutH, heureDebutM] = validatedData.heureDebut.split(':').map(Number);
    const [heureFinH, heureFinM] = validatedData.heureFin.split(':').map(Number);
    const minutesDebut = heureDebutH * 60 + heureDebutM;
    const minutesFin = heureFinH * 60 + heureFinM;

    if (minutesFin <= minutesDebut) {
      return res.status(400).json({ message: 'L\'heure de fin doit être postérieure à l\'heure de début' });
    }

    // Vérifier qu'il n'y a pas de conflit avec un autre créneau
    const creneauExistant = await prisma.creneau.findFirst({
      where: {
        etablissementId: validatedData.etablissementId,
        jour: validatedData.jour,
        OR: [
          { ordre: validatedData.ordre },
          {
            AND: [
              { heureDebut: { lt: validatedData.heureFin } },
              { heureFin: { gt: validatedData.heureDebut } }
            ]
          }
        ]
      }
    });

    if (creneauExistant) {
      return res.status(400).json({ 
        message: 'Un créneau existe déjà à ce moment ou avec cet ordre' 
      });
    }

    const creneau = await prisma.creneau.create({
      data: validatedData,
      include: {
        etablissement: {
          select: {
            nom: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Créneau créé avec succès',
      creneau
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: error.errors
      });
    }
    
    console.error('Erreur lors de la création du créneau:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const getCreneauxEtablissement = async (req, res) => {
  try {
    const { etablissementId } = req.params;

    if (req.user.role !== 'ADMIN' && req.user.etablissementId !== etablissementId) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const creneaux = await prisma.creneau.findMany({
      where: { etablissementId },
      include: {
        _count: {
          select: {
            cours: true
          }
        }
      },
      orderBy: [
        { jour: 'asc' },
        { ordre: 'asc' }
      ]
    });

    // Grouper par jour
    const creneauxParJour = creneaux.reduce((acc, creneau) => {
      if (!acc[creneau.jour]) {
        acc[creneau.jour] = [];
      }
      acc[creneau.jour].push(creneau);
      return acc;
    }, {});

    res.json({
      creneaux: creneauxParJour,
      total: creneaux.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des créneaux:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

// ================================
// GESTION DES COURS
// ================================

const programmerCours = async (req, res) => {
  try {
    const validatedData = coursSchema.parse(req.body);

    // Vérifier que le créneau existe
    const creneau = await prisma.creneau.findUnique({
      where: { id: validatedData.creneauId },
      include: {
        etablissement: true
      }
    });

    if (!creneau) {
      return res.status(400).json({ message: 'Créneau non trouvé' });
    }

    if (req.user.role !== 'ADMIN' && req.user.etablissementId !== creneau.etablissement.id) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    // Vérifier que la matière est enseignée dans cette classe par cet enseignant
    const matiereClasse = await prisma.matiereClasse.findFirst({
      where: {
        matiereId: validatedData.matiereId,
        classeId: validatedData.classeId,
        enseignantId: validatedData.enseignantId
      }
    });

    if (!matiereClasse) {
      return res.status(400).json({ 
        message: 'Cet enseignant n\'enseigne pas cette matière dans cette classe' 
      });
    }

    // Vérifier les conflits
    const conflits = await prisma.cours.findFirst({
      where: {
        creneauId: validatedData.creneauId,
        OR: [
          { classeId: validatedData.classeId },
          { enseignantId: validatedData.enseignantId },
          ...(validatedData.salleId ? [{ salleId: validatedData.salleId }] : [])
        ]
      }
    });

    if (conflits) {
      return res.status(400).json({ 
        message: 'Conflit détecté : la classe, l\'enseignant ou la salle est déjà occupée à ce créneau' 
      });
    }

    const cours = await prisma.cours.create({
      data: validatedData,
      include: {
        creneau: {
          select: {
            jour: true,
            heureDebut: true,
            heureFin: true,
            ordre: true
          }
        },
        matiere: {
          select: {
            nom: true,
            nomArabe: true,
            code: true,
            couleur: true
          }
        },
        enseignant: {
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
        },
        salle: {
          select: {
            nom: true,
            type: true,
            capacite: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Cours programmé avec succès',
      cours
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: error.errors
      });
    }
    
    console.error('Erreur lors de la programmation du cours:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const getEmploiDuTempsClasse = async (req, res) => {
  try {
    const { classeId } = req.params;

    // Vérifier que la classe existe et les permissions
    const classe = await prisma.classe.findUnique({
      where: { id: classeId },
      include: {
        etablissement: true
      }
    });

    if (!classe) {
      return res.status(404).json({ message: 'Classe non trouvée' });
    }

    // Vérifier les permissions selon le rôle
    if (req.user.role === 'ELEVE') {
      const eleve = await prisma.eleve.findUnique({
        where: { userId: req.user.id },
        select: { classeId: true }
      });
      
      if (!eleve || eleve.classeId !== classeId) {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }
    } else if (req.user.role === 'PARENT') {
      const enfants = await prisma.parentEleve.findMany({
        where: {
          parent: { userId: req.user.id }
        },
        include: {
          eleve: {
            select: { classeId: true }
          }
        }
      });
      
      const classeIds = enfants.map(pe => pe.eleve.classeId);
      if (!classeIds.includes(classeId)) {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }
    } else if (req.user.role !== 'ADMIN' && req.user.etablissementId !== classe.etablissementId) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const cours = await prisma.cours.findMany({
      where: { classeId },
      include: {
        creneau: {
          select: {
            jour: true,
            heureDebut: true,
            heureFin: true,
            ordre: true
          }
        },
        matiere: {
          select: {
            nom: true,
            nomArabe: true,
            code: true,
            couleur: true
          }
        },
        enseignant: {
          select: {
            nom: true,
            prenom: true
          }
        },
        salle: {
          select: {
            nom: true,
            type: true
          }
        }
      },
      orderBy: [
        { creneau: { jour: 'asc' } },
        { creneau: { ordre: 'asc' } }
      ]
    });

    // Organiser par jour et créneau
    const emploiDuTemps = cours.reduce((acc, cours) => {
      const jour = cours.creneau.jour;
      if (!acc[jour]) {
        acc[jour] = [];
      }
      acc[jour].push(cours);
      return acc;
    }, {});

    res.json({
      classe: {
        id: classe.id,
        nom: classe.nom,
        niveau: classe.niveau,
        cycle: classe.cycle
      },
      emploiDuTemps,
      totalCours: cours.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'emploi du temps:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const getEmploiDuTempsEnseignant = async (req, res) => {
  try {
    const { enseignantId } = req.params;

    // Vérifier les permissions
    if (req.user.role === 'ENSEIGNANT' && req.user.id !== enseignantId) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const cours = await prisma.cours.findMany({
      where: { enseignantId },
      include: {
        creneau: {
          select: {
            jour: true,
            heureDebut: true,
            heureFin: true,
            ordre: true
          }
        },
        matiere: {
          select: {
            nom: true,
            nomArabe: true,
            code: true,
            couleur: true
          }
        },
        classe: {
          select: {
            nom: true,
            niveau: true,
            cycle: true
          }
        },
        salle: {
          select: {
            nom: true,
            type: true
          }
        }
      },
      orderBy: [
        { creneau: { jour: 'asc' } },
        { creneau: { ordre: 'asc' } }
      ]
    });

    // Organiser par jour
    const emploiDuTemps = cours.reduce((acc, cours) => {
      const jour = cours.creneau.jour;
      if (!acc[jour]) {
        acc[jour] = [];
      }
      acc[jour].push(cours);
      return acc;
    }, {});

    // Calculer les statistiques
    const stats = {
      totalCours: cours.length,
      coursParJour: Object.keys(emploiDuTemps).reduce((acc, jour) => {
        acc[jour] = emploiDuTemps[jour].length;
        return acc;
      }, {}),
      matieresEnseignees: [...new Set(cours.map(c => c.matiere.code))].length,
      classesEnseignees: [...new Set(cours.map(c => c.classe.nom))].length
    };

    res.json({
      emploiDuTemps,
      statistiques: stats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'emploi du temps enseignant:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const updateCours = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = coursSchema.partial().parse(req.body);

    const cours = await prisma.cours.findUnique({
      where: { id },
      include: {
        creneau: {
          include: {
            etablissement: true
          }
        }
      }
    });

    if (!cours) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }

    if (req.user.role !== 'ADMIN' && req.user.etablissementId !== cours.creneau.etablissement.id) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    // Vérifier les conflits si on change le créneau, l'enseignant, la classe ou la salle
    if (updateData.creneauId || updateData.enseignantId || updateData.classeId || updateData.salleId) {
      const conflits = await prisma.cours.findFirst({
        where: {
          id: { not: id },
          creneauId: updateData.creneauId || cours.creneauId,
          OR: [
            { classeId: updateData.classeId || cours.classeId },
            { enseignantId: updateData.enseignantId || cours.enseignantId },
            ...(updateData.salleId || cours.salleId ? [{ salleId: updateData.salleId || cours.salleId }] : [])
          ]
        }
      });

      if (conflits) {
        return res.status(400).json({ 
          message: 'Conflit détecté avec un autre cours' 
        });
      }
    }

    const coursMisAJour = await prisma.cours.update({
      where: { id },
      data: updateData,
      include: {
        creneau: {
          select: {
            jour: true,
            heureDebut: true,
            heureFin: true
          }
        },
        matiere: {
          select: {
            nom: true,
            code: true
          }
        },
        enseignant: {
          select: {
            nom: true,
            prenom: true
          }
        },
        classe: {
          select: {
            nom: true
          }
        },
        salle: {
          select: {
            nom: true
          }
        }
      }
    });

    res.json({
      message: 'Cours mis à jour avec succès',
      cours: coursMisAJour
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: error.errors
      });
    }
    
    console.error('Erreur lors de la mise à jour du cours:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const deleteCours = async (req, res) => {
  try {
    const { id } = req.params;

    const cours = await prisma.cours.findUnique({
      where: { id },
      include: {
        creneau: {
          include: {
            etablissement: true
          }
        }
      }
    });

    if (!cours) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }

    if (req.user.role !== 'ADMIN' && req.user.etablissementId !== cours.creneau.etablissement.id) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    await prisma.cours.delete({
      where: { id }
    });

    res.json({ message: 'Cours supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du cours:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

// ================================
// GESTION DES SALLES
// ================================

const createSalle = async (req, res) => {
  try {
    const validatedData = salleSchema.parse(req.body);

    if (req.user.role !== 'ADMIN' && req.user.etablissementId !== validatedData.etablissementId) {
      return res.status(403).json({ message: 'Vous ne pouvez créer des salles que dans votre établissement' });
    }

    const salle = await prisma.salle.create({
      data: validatedData,
      include: {
        etablissement: {
          select: {
            nom: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Salle créée avec succès',
      salle
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: error.errors
      });
    }
    
    console.error('Erreur lors de la création de la salle:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const getSallesEtablissement = async (req, res) => {
  try {
    const { etablissementId } = req.params;

    if (req.user.role !== 'ADMIN' && req.user.etablissementId !== etablissementId) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const salles = await prisma.salle.findMany({
      where: { etablissementId },
      include: {
        _count: {
          select: {
            cours: true
          }
        }
      },
      orderBy: {
        nom: 'asc'
      }
    });

    res.json({
      salles,
      total: salles.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des salles:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const getDisponibiliteSalle = async (req, res) => {
  try {
    const { id } = req.params;
    const { jour } = req.query;

    const salle = await prisma.salle.findUnique({
      where: { id }
    });

    if (!salle) {
      return res.status(404).json({ message: 'Salle non trouvée' });
    }

    if (req.user.role !== 'ADMIN' && req.user.etablissementId !== salle.etablissementId) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const where = { salleId: id };
    if (jour) {
      where.creneau = { jour };
    }

    const coursOccupes = await prisma.cours.findMany({
      where,
      include: {
        creneau: {
          select: {
            jour: true,
            heureDebut: true,
            heureFin: true,
            ordre: true
          }
        },
        classe: {
          select: {
            nom: true
          }
        },
        matiere: {
          select: {
            nom: true,
            code: true
          }
        }
      },
      orderBy: [
        { creneau: { jour: 'asc' } },
        { creneau: { ordre: 'asc' } }
      ]
    });

    res.json({
      salle: {
        id: salle.id,
        nom: salle.nom,
        capacite: salle.capacite,
        type: salle.type
      },
      coursOccupes,
      tauxOccupation: coursOccupes.length
    });
  } catch (error) {
    console.error('Erreur lors de la vérification de disponibilité:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

module.exports = {
  createCreneau,
  getCreneauxEtablissement,
  programmerCours,
  getEmploiDuTempsClasse,
  getEmploiDuTempsEnseignant,
  updateCours,
  deleteCours,
  createSalle,
  getSallesEtablissement,
  getDisponibiliteSalle
};