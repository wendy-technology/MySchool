const prisma = require('../config/database');
const { z } = require('zod');

const evaluationSchema = z.object({
  titre: z.string().min(1, 'Titre requis'),
  description: z.string().optional(),
  type: z.enum(['CONTROLE_CONTINU', 'DEVOIR_SURVEILLE', 'EXAMEN']),
  coefficient: z.number().min(0.5).max(10).default(1.0),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Format de date invalide',
  }),
  noteMax: z.number().min(1).max(20).default(20.0),
  trimestre: z.number().int().min(1).max(3),
  matiereId: z.string().min(1, 'Matière requise'),
  classeId: z.string().min(1, 'Classe requise')
});

const noteSchema = z.object({
  valeur: z.number().min(0).max(20),
  commentaire: z.string().optional(),
  evaluationId: z.string().min(1, 'Évaluation requise'),
  eleveId: z.string().min(1, 'Élève requis')
});

const createEvaluation = async (req, res) => {
  try {
    const validatedData = evaluationSchema.parse(req.body);

    // Vérifier que l'enseignant enseigne cette matière dans cette classe
    const matiereClasse = await prisma.matiereClasse.findUnique({
      where: {
        matiereId_classeId: {
          matiereId: validatedData.matiereId,
          classeId: validatedData.classeId
        }
      },
      include: {
        enseignant: {
          include: {
            user: true
          }
        }
      }
    });

    if (!matiereClasse) {
      return res.status(400).json({ message: 'Cette matière n\'est pas enseignée dans cette classe' });
    }

    if (req.user.role !== 'ADMIN' && matiereClasse.enseignant.user.id !== req.user.id) {
      return res.status(403).json({ message: 'Vous ne pouvez créer des évaluations que pour vos matières' });
    }

    const evaluation = await prisma.evaluation.create({
      data: {
        ...validatedData,
        date: new Date(validatedData.date),
        enseignantId: req.user.id
      },
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
          select: {
            nom: true,
            prenom: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Évaluation créée avec succès',
      evaluation
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: error.errors
      });
    }
    
    console.error('Erreur lors de la création de l\'évaluation:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const getEvaluations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const where = {};
    
    if (req.query.classeId) {
      where.classeId = req.query.classeId;
    }

    if (req.query.matiereId) {
      where.matiereId = req.query.matiereId;
    }

    if (req.query.trimestre) {
      where.trimestre = parseInt(req.query.trimestre);
    }

    if (req.query.type) {
      where.type = req.query.type;
    }

    // Restrictions selon le rôle
    if (req.user.role === 'ENSEIGNANT') {
      where.enseignantId = req.user.id;
    } else if (req.user.role === 'ELEVE') {
      const eleve = await prisma.eleve.findUnique({
        where: { userId: req.user.id },
        select: { classeId: true }
      });
      if (eleve?.classeId) {
        where.classeId = eleve.classeId;
      }
    } else if (req.user.role === 'PARENT') {
      const enfants = await prisma.parentEleve.findMany({
        where: {
          parent: {
            userId: req.user.id
          }
        },
        include: {
          eleve: {
            select: { classeId: true }
          }
        }
      });
      
      const classeIds = enfants.map(pe => pe.eleve.classeId).filter(Boolean);
      if (classeIds.length > 0) {
        where.classeId = { in: classeIds };
      }
    }

    const [evaluations, total] = await Promise.all([
      prisma.evaluation.findMany({
        where,
        skip,
        take: limit,
        include: {
          matiere: {
            select: {
              nom: true,
              nomArabe: true,
              code: true,
              coefficient: true
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
            select: {
              nom: true,
              prenom: true
            }
          },
          _count: {
            select: {
              notes: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        }
      }),
      prisma.evaluation.count({ where })
    ]);

    res.json({
      evaluations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des évaluations:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const getEvaluationById = async (req, res) => {
  try {
    const { id } = req.params;

    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
      include: {
        matiere: {
          select: {
            nom: true,
            nomArabe: true,
            code: true,
            coefficient: true
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
          select: {
            nom: true,
            prenom: true
          }
        },
        notes: {
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
          },
          orderBy: {
            eleve: {
              nom: 'asc'
            }
          }
        }
      }
    });

    if (!evaluation) {
      return res.status(404).json({ message: 'Évaluation non trouvée' });
    }

    // Vérifier les permissions
    if (req.user.role === 'ENSEIGNANT' && evaluation.enseignantId !== req.user.id) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    res.json({ evaluation });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'évaluation:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const updateEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = evaluationSchema.partial().parse(req.body);

    const evaluation = await prisma.evaluation.findUnique({
      where: { id }
    });

    if (!evaluation) {
      return res.status(404).json({ message: 'Évaluation non trouvée' });
    }

    if (req.user.role !== 'ADMIN' && evaluation.enseignantId !== req.user.id) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const updateData = { ...validatedData };
    if (validatedData.date) {
      updateData.date = new Date(validatedData.date);
    }

    const updatedEvaluation = await prisma.evaluation.update({
      where: { id },
      data: updateData,
      include: {
        matiere: {
          select: {
            nom: true,
            code: true
          }
        },
        classe: {
          select: {
            nom: true
          }
        }
      }
    });

    res.json({
      message: 'Évaluation mise à jour avec succès',
      evaluation: updatedEvaluation
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: error.errors
      });
    }
    
    console.error('Erreur lors de la mise à jour de l\'évaluation:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const deleteEvaluation = async (req, res) => {
  try {
    const { id } = req.params;

    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            notes: true
          }
        }
      }
    });

    if (!evaluation) {
      return res.status(404).json({ message: 'Évaluation non trouvée' });
    }

    if (req.user.role !== 'ADMIN' && evaluation.enseignantId !== req.user.id) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    if (evaluation._count.notes > 0) {
      return res.status(400).json({
        message: 'Impossible de supprimer une évaluation avec des notes'
      });
    }

    await prisma.evaluation.delete({
      where: { id }
    });

    res.json({ message: 'Évaluation supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'évaluation:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const saisirNote = async (req, res) => {
  try {
    const validatedData = noteSchema.parse(req.body);

    const evaluation = await prisma.evaluation.findUnique({
      where: { id: validatedData.evaluationId }
    });

    if (!evaluation) {
      return res.status(400).json({ message: 'Évaluation non trouvée' });
    }

    if (req.user.role !== 'ADMIN' && evaluation.enseignantId !== req.user.id) {
      return res.status(403).json({ message: 'Vous ne pouvez saisir des notes que pour vos évaluations' });
    }

    if (validatedData.valeur > evaluation.noteMax) {
      return res.status(400).json({ 
        message: `La note ne peut pas dépasser ${evaluation.noteMax}` 
      });
    }

    // Vérifier que l'élève est dans la classe de l'évaluation
    const eleve = await prisma.eleve.findUnique({
      where: { userId: validatedData.eleveId },
      select: { classeId: true }
    });

    if (!eleve || eleve.classeId !== evaluation.classeId) {
      return res.status(400).json({ message: 'Élève non trouvé dans cette classe' });
    }

    const note = await prisma.note.upsert({
      where: {
        evaluationId_eleveId: {
          evaluationId: validatedData.evaluationId,
          eleveId: validatedData.eleveId
        }
      },
      update: {
        valeur: validatedData.valeur,
        commentaire: validatedData.commentaire
      },
      create: validatedData,
      include: {
        eleve: {
          select: {
            nom: true,
            prenom: true
          }
        },
        evaluation: {
          select: {
            titre: true,
            noteMax: true,
            matiere: {
              select: {
                nom: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      message: 'Note saisie avec succès',
      note
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: error.errors
      });
    }
    
    console.error('Erreur lors de la saisie de la note:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const getNotesEleve = async (req, res) => {
  try {
    const { eleveId } = req.params;
    const trimestre = req.query.trimestre ? parseInt(req.query.trimestre) : undefined;
    const matiereId = req.query.matiereId;

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

    const where = {
      eleveId
    };

    if (trimestre) {
      where.evaluation = {
        trimestre
      };
    }

    if (matiereId) {
      where.evaluation = {
        ...where.evaluation,
        matiereId
      };
    }

    const notes = await prisma.note.findMany({
      where,
      include: {
        evaluation: {
          select: {
            titre: true,
            type: true,
            date: true,
            noteMax: true,
            coefficient: true,
            trimestre: true,
            matiere: {
              select: {
                nom: true,
                nomArabe: true,
                code: true,
                coefficient: true
              }
            }
          }
        }
      },
      orderBy: {
        evaluation: {
          date: 'desc'
        }
      }
    });

    // Grouper par matière et trimestre
    const notesGroupees = notes.reduce((acc, note) => {
      const matiere = note.evaluation.matiere.code;
      const trim = note.evaluation.trimestre;
      
      if (!acc[matiere]) {
        acc[matiere] = {
          matiere: note.evaluation.matiere,
          trimestres: {}
        };
      }
      
      if (!acc[matiere].trimestres[trim]) {
        acc[matiere].trimestres[trim] = [];
      }
      
      acc[matiere].trimestres[trim].push(note);
      
      return acc;
    }, {});

    res.json({
      notes: notesGroupees,
      total: notes.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notes:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const getNotesEvaluation = async (req, res) => {
  try {
    const { evaluationId } = req.params;

    const evaluation = await prisma.evaluation.findUnique({
      where: { id: evaluationId }
    });

    if (!evaluation) {
      return res.status(404).json({ message: 'Évaluation non trouvée' });
    }

    if (req.user.role === 'ENSEIGNANT' && evaluation.enseignantId !== req.user.id) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const notes = await prisma.note.findMany({
      where: { evaluationId },
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
      },
      orderBy: {
        eleve: {
          nom: 'asc'
        }
      }
    });

    // Calculer statistiques
    const valeurs = notes.map(n => n.valeur);
    const moyenne = valeurs.length > 0 ? valeurs.reduce((a, b) => a + b, 0) / valeurs.length : 0;
    const min = valeurs.length > 0 ? Math.min(...valeurs) : 0;
    const max = valeurs.length > 0 ? Math.max(...valeurs) : 0;

    res.json({
      evaluation: {
        id: evaluation.id,
        titre: evaluation.titre,
        noteMax: evaluation.noteMax,
        date: evaluation.date
      },
      notes,
      statistiques: {
        moyenne: Math.round(moyenne * 100) / 100,
        min,
        max,
        notesCount: notes.length
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notes:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

module.exports = {
  createEvaluation,
  getEvaluations,
  getEvaluationById,
  updateEvaluation,
  deleteEvaluation,
  saisirNote,
  getNotesEleve,
  getNotesEvaluation
};