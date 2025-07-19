const prisma = require('../config/database');
const { z } = require('zod');

const genererBulletinsSchema = z.object({
  classeId: z.string().min(1, 'Classe requise'),
  trimestre: z.number().int().min(1).max(3),
  annee: z.string().min(1, 'Année requise')
});

const calculerMoyenneMatiere = (notes, matiere) => {
  if (notes.length === 0) return 0;
  
  let totalPoints = 0;
  let totalCoefficients = 0;
  
  notes.forEach(note => {
    const coefficient = note.evaluation.coefficient;
    totalPoints += note.valeur * coefficient;
    totalCoefficients += coefficient;
  });
  
  return totalCoefficients > 0 ? totalPoints / totalCoefficients : 0;
};

const calculerMoyenneGenerale = (moyennesMatieres) => {
  if (moyennesMatieres.length === 0) return 0;
  
  let totalPoints = 0;
  let totalCoefficients = 0;
  
  moyennesMatieres.forEach(mm => {
    totalPoints += mm.moyenne * mm.coefficient;
    totalCoefficients += mm.coefficient;
  });
  
  return totalCoefficients > 0 ? totalPoints / totalCoefficients : 0;
};

const calculerRangs = (bulletins) => {
  // Trier par moyenne générale décroissante
  const bulletinsTries = bulletins.sort((a, b) => b.moyenneGenerale - a.moyenneGenerale);
  
  let rang = 1;
  let moyennePrecedente = null;
  let rangReel = 1;
  
  return bulletinsTries.map((bulletin, index) => {
    if (moyennePrecedente !== null && bulletin.moyenneGenerale < moyennePrecedente) {
      rang = rangReel;
    }
    
    moyennePrecedente = bulletin.moyenneGenerale;
    rangReel = index + 1;
    
    return {
      ...bulletin,
      rang
    };
  });
};

const genererBulletins = async (req, res) => {
  try {
    const validatedData = genererBulletinsSchema.parse(req.body);
    const { classeId, trimestre, annee } = validatedData;

    // Vérifier les permissions
    const classe = await prisma.classe.findUnique({
      where: { id: classeId },
      include: {
        etablissement: true
      }
    });

    if (!classe) {
      return res.status(404).json({ message: 'Classe non trouvée' });
    }

    if (req.user.role !== 'ADMIN' && req.user.etablissementId !== classe.etablissementId) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    // Récupérer tous les élèves de la classe
    const eleves = await prisma.eleve.findMany({
      where: { classeId },
      include: {
        user: {
          select: {
            id: true,
            nom: true,
            prenom: true
          }
        }
      }
    });

    if (eleves.length === 0) {
      return res.status(400).json({ message: 'Aucun élève dans cette classe' });
    }

    // Récupérer toutes les matières enseignées dans cette classe
    const matiereClasses = await prisma.matiereClasse.findMany({
      where: { classeId },
      include: {
        matiere: {
          select: {
            id: true,
            nom: true,
            coefficient: true
          }
        }
      }
    });

    const bulletinsGeneres = [];

    // Générer un bulletin pour chaque élève
    for (const eleve of eleves) {
      try {
        // Vérifier si le bulletin existe déjà
        const bulletinExistant = await prisma.bulletin.findUnique({
          where: {
            eleveId_trimestre_annee: {
              eleveId: eleve.user.id,
              trimestre,
              annee
            }
          }
        });

        if (bulletinExistant) {
          console.log(`Bulletin déjà existant pour ${eleve.user.prenom} ${eleve.user.nom}`);
          continue;
        }

        const moyennesMatieres = [];

        // Calculer la moyenne pour chaque matière
        for (const matiereClasse of matiereClasses) {
          const notes = await prisma.note.findMany({
            where: {
              eleveId: eleve.user.id,
              evaluation: {
                matiereId: matiereClasse.matiere.id,
                classeId,
                trimestre
              }
            },
            include: {
              evaluation: {
                select: {
                  coefficient: true
                }
              }
            }
          });

          const moyenneMatiere = calculerMoyenneMatiere(notes, matiereClasse.matiere);
          
          if (notes.length > 0) { // Seulement si l'élève a des notes dans cette matière
            moyennesMatieres.push({
              matiereId: matiereClasse.matiere.id,
              moyenne: Math.round(moyenneMatiere * 100) / 100,
              coefficient: matiereClasse.matiere.coefficient
            });
          }
        }

        // Calculer la moyenne générale
        const moyenneGenerale = calculerMoyenneGenerale(moyennesMatieres);

        // Créer le bulletin
        const bulletin = await prisma.bulletin.create({
          data: {
            eleveId: eleve.user.id,
            classeId,
            trimestre,
            annee,
            moyenneGenerale: Math.round(moyenneGenerale * 100) / 100,
            effectifClasse: eleves.length,
            moyennesMatieres: {
              create: moyennesMatieres
            }
          },
          include: {
            eleve: {
              select: {
                nom: true,
                prenom: true
              }
            },
            moyennesMatieres: {
              include: {
                matiere: {
                  select: {
                    nom: true,
                    code: true
                  }
                }
              }
            }
          }
        });

        bulletinsGeneres.push(bulletin);
      } catch (error) {
        console.error(`Erreur lors de la génération du bulletin pour ${eleve.user.prenom} ${eleve.user.nom}:`, error);
      }
    }

    // Calculer les rangs pour tous les bulletins de la classe/trimestre/année
    const tousBulletins = await prisma.bulletin.findMany({
      where: {
        classeId,
        trimestre,
        annee
      }
    });

    const bulletinsAvecRangs = calculerRangs(tousBulletins);

    // Mettre à jour les rangs
    for (const bulletin of bulletinsAvecRangs) {
      await prisma.bulletin.update({
        where: { id: bulletin.id },
        data: { rang: bulletin.rang }
      });
    }

    res.status(201).json({
      message: `${bulletinsGeneres.length} bulletins générés avec succès`,
      bulletins: bulletinsGeneres,
      classeInfo: {
        nom: classe.nom,
        trimestre,
        annee,
        effectif: eleves.length
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: error.errors
      });
    }
    
    console.error('Erreur lors de la génération des bulletins:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const getBulletinsEleve = async (req, res) => {
  try {
    const { eleveId } = req.params;
    const annee = req.query.annee;

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
    if (annee) {
      where.annee = annee;
    }

    const bulletins = await prisma.bulletin.findMany({
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
        classe: {
          select: {
            nom: true,
            niveau: true,
            cycle: true
          }
        },
        moyennesMatieres: {
          include: {
            matiere: {
              select: {
                nom: true,
                nomArabe: true,
                code: true
              }
            }
          },
          orderBy: {
            matiere: {
              nom: 'asc'
            }
          }
        }
      },
      orderBy: [
        { annee: 'desc' },
        { trimestre: 'asc' }
      ]
    });

    res.json({
      bulletins,
      eleveInfo: bulletins.length > 0 ? {
        nom: bulletins[0].eleve.nom,
        prenom: bulletins[0].eleve.prenom,
        numeroEleve: bulletins[0].eleve.eleve.numeroEleve
      } : null
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des bulletins:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const getBulletinById = async (req, res) => {
  try {
    const { id } = req.params;

    const bulletin = await prisma.bulletin.findUnique({
      where: { id },
      include: {
        eleve: {
          select: {
            nom: true,
            prenom: true,
            dateNaissance: true,
            eleve: {
              select: {
                numeroEleve: true
              }
            }
          }
        },
        classe: {
          select: {
            nom: true,
            niveau: true,
            cycle: true,
            etablissement: {
              select: {
                nom: true,
                nomArabe: true,
                directeur: true
              }
            }
          }
        },
        moyennesMatieres: {
          include: {
            matiere: {
              select: {
                nom: true,
                nomArabe: true,
                code: true
              }
            }
          },
          orderBy: {
            matiere: {
              nom: 'asc'
            }
          }
        }
      }
    });

    if (!bulletin) {
      return res.status(404).json({ message: 'Bulletin non trouvé' });
    }

    // Vérifier les permissions
    if (req.user.role === 'ELEVE' && req.user.id !== bulletin.eleveId) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    if (req.user.role === 'PARENT') {
      const isParent = await prisma.parentEleve.findFirst({
        where: {
          parent: { userId: req.user.id },
          eleve: { userId: bulletin.eleveId }
        }
      });

      if (!isParent) {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }
    }

    // Calculer des statistiques de classe pour ce trimestre
    const statistiquesClasse = await prisma.bulletin.aggregate({
      where: {
        classeId: bulletin.classeId,
        trimestre: bulletin.trimestre,
        annee: bulletin.annee
      },
      _avg: {
        moyenneGenerale: true
      },
      _min: {
        moyenneGenerale: true
      },
      _max: {
        moyenneGenerale: true
      }
    });

    res.json({
      bulletin,
      statistiquesClasse: {
        moyenneClasse: Math.round((statistiquesClasse._avg.moyenneGenerale || 0) * 100) / 100,
        moyenneMin: statistiquesClasse._min.moyenneGenerale || 0,
        moyenneMax: statistiquesClasse._max.moyenneGenerale || 0
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du bulletin:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const updateAppreciation = async (req, res) => {
  try {
    const { id } = req.params;
    const { appreciation } = req.body;

    if (!appreciation || typeof appreciation !== 'string') {
      return res.status(400).json({ message: 'Appréciation requise' });
    }

    const bulletin = await prisma.bulletin.findUnique({
      where: { id },
      include: {
        classe: {
          select: {
            etablissementId: true
          }
        }
      }
    });

    if (!bulletin) {
      return res.status(404).json({ message: 'Bulletin non trouvé' });
    }

    if (req.user.role !== 'ADMIN' && req.user.etablissementId !== bulletin.classe.etablissementId) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const bulletinMisAJour = await prisma.bulletin.update({
      where: { id },
      data: { appreciation },
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
      message: 'Appréciation mise à jour avec succès',
      bulletin: bulletinMisAJour
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'appréciation:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

module.exports = {
  genererBulletins,
  getBulletinsEleve,
  getBulletinById,
  updateAppreciation
};