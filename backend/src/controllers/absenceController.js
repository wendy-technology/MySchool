const prisma = require('../config/database');
const { z } = require('zod');

const absenceSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Format de date invalide',
  }),
  type: z.enum(['ABSENCE', 'RETARD', 'EXCLUSION']),
  heureDebut: z.string().optional(),
  heureFin: z.string().optional(),
  motif: z.string().optional(),
  commentaire: z.string().optional(),
  eleveId: z.string().min(1, 'Élève requis'),
  matiereId: z.string().optional()
});

const justificatifSchema = z.object({
  motif: z.string().min(1, 'Motif requis'),
  dateDebut: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Format de date de début invalide',
  }),
  dateFin: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Format de date de fin invalide',
  }),
  document: z.string().url().optional(),
  commentaire: z.string().optional(),
  eleveId: z.string().min(1, 'Élève requis')
});

const signalerAbsence = async (req, res) => {
  try {
    const validatedData = absenceSchema.parse(req.body);

    // Vérifier que l'élève existe et est dans l'établissement
    const eleve = await prisma.eleve.findUnique({
      where: { userId: validatedData.eleveId },
      include: {
        user: {
          select: {
            etablissementId: true,
            nom: true,
            prenom: true
          }
        },
        classe: {
          select: {
            id: true,
            nom: true
          }
        }
      }
    });

    if (!eleve) {
      return res.status(400).json({ message: 'Élève non trouvé' });
    }

    if (req.user.role !== 'ADMIN' && req.user.etablissementId !== eleve.user.etablissementId) {
      return res.status(403).json({ message: 'Vous ne pouvez signaler des absences que dans votre établissement' });
    }

    // Si une matière est spécifiée, vérifier que l'enseignant l'enseigne
    if (validatedData.matiereId && req.user.role === 'ENSEIGNANT') {
      const enseigneMatiere = await prisma.matiereClasse.findFirst({
        where: {
          matiereId: validatedData.matiereId,
          classeId: eleve.classeId,
          enseignant: {
            userId: req.user.id
          }
        }
      });

      if (!enseigneMatiere) {
        return res.status(403).json({ message: 'Vous ne pouvez signaler des absences que pour vos matières' });
      }
    }

    // Vérifier qu'il n'y a pas déjà une absence pour ce jour/élève/matière
    const absenceExistante = await prisma.absence.findFirst({
      where: {
        eleveId: validatedData.eleveId,
        date: {
          gte: new Date(new Date(validatedData.date).setHours(0, 0, 0, 0)),
          lt: new Date(new Date(validatedData.date).setHours(23, 59, 59, 999))
        },
        matiereId: validatedData.matiereId || null
      }
    });

    if (absenceExistante) {
      return res.status(400).json({ message: 'Une absence est déjà signalée pour cette date' });
    }

    const absence = await prisma.absence.create({
      data: {
        ...validatedData,
        date: new Date(validatedData.date),
        enseignantId: req.user.id
      },
      include: {
        eleve: {
          select: {
            nom: true,
            prenom: true,
            eleve: {
              select: {
                numeroEleve: true
              }
            }
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
        }
      }
    });

    res.status(201).json({
      message: 'Absence signalée avec succès',
      absence
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: error.errors
      });
    }
    
    console.error('Erreur lors du signalement de l\'absence:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const getAbsencesEleve = async (req, res) => {
  try {
    const { eleveId } = req.params;
    const dateDebut = req.query.dateDebut;
    const dateFin = req.query.dateFin;
    const type = req.query.type;

    // Vérifier les permissions
    if (req.user.role === 'ELEVE' && req.user.id !== eleveId) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    if (req.user.role === 'PARENT') {
      const isParent = await prisma.parentEleve.findFirst({
        where: {
          parent: { userId: req.user.id },
          eleve: { userId: eleveId }
        }
      });

      if (!isParent) {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }
    }

    const where = { eleveId };

    if (dateDebut && dateFin) {
      where.date = {
        gte: new Date(dateDebut),
        lte: new Date(dateFin)
      };
    }

    if (type) {
      where.type = type;
    }

    const absences = await prisma.absence.findMany({
      where,
      include: {
        matiere: {
          select: {
            nom: true,
            nomArabe: true,
            code: true
          }
        },
        enseignant: {
          select: {
            nom: true,
            prenom: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Calculer des statistiques
    const stats = {
      total: absences.length,
      justifiees: absences.filter(a => a.justifie).length,
      nonJustifiees: absences.filter(a => !a.justifie).length,
      parType: {
        absences: absences.filter(a => a.type === 'ABSENCE').length,
        retards: absences.filter(a => a.type === 'RETARD').length,
        exclusions: absences.filter(a => a.type === 'EXCLUSION').length
      }
    };

    res.json({
      absences,
      statistiques: stats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des absences:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const getAbsencesClasse = async (req, res) => {
  try {
    const { classeId } = req.params;
    const date = req.query.date;
    const type = req.query.type;

    // Vérifier que la classe existe et les permissions
    const classe = await prisma.classe.findUnique({
      where: { id: classeId },
      select: {
        etablissementId: true,
        nom: true
      }
    });

    if (!classe) {
      return res.status(404).json({ message: 'Classe non trouvée' });
    }

    if (req.user.role !== 'ADMIN' && req.user.etablissementId !== classe.etablissementId) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const where = {
      eleve: {
        classeId
      }
    };

    if (date) {
      where.date = {
        gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
        lt: new Date(new Date(date).setHours(23, 59, 59, 999))
      };
    }

    if (type) {
      where.type = type;
    }

    const absences = await prisma.absence.findMany({
      where,
      include: {
        eleve: {
          select: {
            nom: true,
            prenom: true,
            eleve: {
              select: {
                numeroEleve: true
              }
            }
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
        { date: 'desc' },
        { eleve: { nom: 'asc' } }
      ]
    });

    res.json({
      classe: {
        id: classeId,
        nom: classe.nom
      },
      absences,
      total: absences.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des absences de classe:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const updateAbsence = async (req, res) => {
  try {
    const { id } = req.params;
    const { justifie, motif, commentaire } = req.body;

    const absence = await prisma.absence.findUnique({
      where: { id }
    });

    if (!absence) {
      return res.status(404).json({ message: 'Absence non trouvée' });
    }

    if (req.user.role !== 'ADMIN' && absence.enseignantId !== req.user.id) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const updateData = {};
    if (typeof justifie === 'boolean') updateData.justifie = justifie;
    if (motif) updateData.motif = motif;
    if (commentaire) updateData.commentaire = commentaire;

    const absenceMiseAJour = await prisma.absence.update({
      where: { id },
      data: updateData,
      include: {
        eleve: {
          select: {
            nom: true,
            prenom: true
          }
        }
      }
    });

    res.json({
      message: 'Absence mise à jour avec succès',
      absence: absenceMiseAJour
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'absence:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const deposerJustificatif = async (req, res) => {
  try {
    const validatedData = justificatifSchema.parse(req.body);

    // Vérifier les permissions (seuls les parents/élèves peuvent déposer des justificatifs)
    if (req.user.role === 'ELEVE' && req.user.id !== validatedData.eleveId) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    if (req.user.role === 'PARENT') {
      const isParent = await prisma.parentEleve.findFirst({
        where: {
          parent: { userId: req.user.id },
          eleve: { userId: validatedData.eleveId }
        }
      });

      if (!isParent) {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }
    }

    if (req.user.role === 'ENSEIGNANT') {
      return res.status(403).json({ message: 'Les enseignants ne peuvent pas déposer de justificatifs' });
    }

    const justificatif = await prisma.justificatif.create({
      data: {
        ...validatedData,
        dateDebut: new Date(validatedData.dateDebut),
        dateFin: new Date(validatedData.dateFin)
      },
      include: {
        eleve: {
          select: {
            nom: true,
            prenom: true,
            eleve: {
              select: {
                numeroEleve: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      message: 'Justificatif déposé avec succès',
      justificatif
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: error.errors
      });
    }
    
    console.error('Erreur lors du dépôt du justificatif:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const getJustificatifsEleve = async (req, res) => {
  try {
    const { eleveId } = req.params;

    // Vérifier les permissions
    if (req.user.role === 'ELEVE' && req.user.id !== eleveId) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    if (req.user.role === 'PARENT') {
      const isParent = await prisma.parentEleve.findFirst({
        where: {
          parent: { userId: req.user.id },
          eleve: { userId: eleveId }
        }
      });

      if (!isParent) {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }
    }

    const justificatifs = await prisma.justificatif.findMany({
      where: { eleveId },
      include: {
        validateur: {
          select: {
            nom: true,
            prenom: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      justificatifs,
      total: justificatifs.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des justificatifs:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const validerJustificatif = async (req, res) => {
  try {
    const { id } = req.params;
    const { valide, commentaire } = req.body;

    if (typeof valide !== 'boolean') {
      return res.status(400).json({ message: 'Le statut de validation est requis' });
    }

    const justificatif = await prisma.justificatif.findUnique({
      where: { id },
      include: {
        eleve: {
          include: {
            user: {
              select: {
                etablissementId: true
              }
            }
          }
        }
      }
    });

    if (!justificatif) {
      return res.status(404).json({ message: 'Justificatif non trouvé' });
    }

    if (req.user.role !== 'ADMIN' && req.user.etablissementId !== justificatif.eleve.user.etablissementId) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const justificatifMisAJour = await prisma.justificatif.update({
      where: { id },
      data: {
        valide,
        validePar: req.user.id,
        commentaire
      },
      include: {
        eleve: {
          select: {
            nom: true,
            prenom: true
          }
        },
        validateur: {
          select: {
            nom: true,
            prenom: true
          }
        }
      }
    });

    // Si le justificatif est validé, marquer les absences correspondantes comme justifiées
    if (valide) {
      await prisma.absence.updateMany({
        where: {
          eleveId: justificatif.eleveId,
          date: {
            gte: justificatif.dateDebut,
            lte: justificatif.dateFin
          },
          justifie: false
        },
        data: {
          justifie: true,
          motif: justificatif.motif
        }
      });
    }

    res.json({
      message: `Justificatif ${valide ? 'validé' : 'rejeté'} avec succès`,
      justificatif: justificatifMisAJour
    });
  } catch (error) {
    console.error('Erreur lors de la validation du justificatif:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const getStatistiquesAbsences = async (req, res) => {
  try {
    const { classeId, eleveId, dateDebut, dateFin } = req.query;

    let where = {};

    if (eleveId) {
      where.eleveId = eleveId;
    }

    if (classeId) {
      where.eleve = {
        classeId
      };
    }

    if (dateDebut && dateFin) {
      where.date = {
        gte: new Date(dateDebut),
        lte: new Date(dateFin)
      };
    }

    // Restrictions selon le rôle
    if (req.user.role === 'ENSEIGNANT') {
      where.enseignantId = req.user.id;
    }

    const absences = await prisma.absence.findMany({
      where,
      include: {
        eleve: {
          select: {
            user: {
              select: {
                nom: true,
                prenom: true
              }
            }
          }
        }
      }
    });

    // Calculer statistiques globales
    const stats = {
      total: absences.length,
      justifiees: absences.filter(a => a.justifie).length,
      nonJustifiees: absences.filter(a => !a.justifie).length,
      parType: {
        absences: absences.filter(a => a.type === 'ABSENCE').length,
        retards: absences.filter(a => a.type === 'RETARD').length,
        exclusions: absences.filter(a => a.type === 'EXCLUSION').length
      }
    };

    // Statistiques par élève si demandé
    let statsParEleve = {};
    if (classeId && !eleveId) {
      statsParEleve = absences.reduce((acc, absence) => {
        const eleveId = absence.eleveId;
        const eleveNom = `${absence.eleve.user.prenom} ${absence.eleve.user.nom}`;
        
        if (!acc[eleveId]) {
          acc[eleveId] = {
            nom: eleveNom,
            total: 0,
            justifiees: 0,
            nonJustifiees: 0,
            absences: 0,
            retards: 0,
            exclusions: 0
          };
        }
        
        acc[eleveId].total++;
        if (absence.justifie) acc[eleveId].justifiees++;
        else acc[eleveId].nonJustifiees++;
        
        if (absence.type === 'ABSENCE') acc[eleveId].absences++;
        else if (absence.type === 'RETARD') acc[eleveId].retards++;
        else if (absence.type === 'EXCLUSION') acc[eleveId].exclusions++;
        
        return acc;
      }, {});
    }

    res.json({
      statistiques: stats,
      statsParEleve: Object.values(statsParEleve),
      periode: {
        dateDebut,
        dateFin
      }
    });
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

module.exports = {
  signalerAbsence,
  getAbsencesEleve,
  getAbsencesClasse,
  updateAbsence,
  deposerJustificatif,
  getJustificatifsEleve,
  validerJustificatif,
  getStatistiquesAbsences
};