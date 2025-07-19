const prisma = require('../config/database');
const { z } = require('zod');

const etablissementSchema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  nomArabe: z.string().optional(),
  adresse: z.string().min(1, 'Adresse requise'),
  adresseArabe: z.string().optional(),
  wilaya: z.string().min(1, 'Wilaya requise'),
  commune: z.string().min(1, 'Commune requise'),
  telephone: z.string().optional(),
  email: z.string().email('Format d\'email invalide').optional(),
  directeur: z.string().optional(),
  directeurArabe: z.string().optional()
});

const createEtablissement = async (req, res) => {
  try {
    const validatedData = etablissementSchema.parse(req.body);

    const etablissement = await prisma.etablissement.create({
      data: validatedData
    });

    res.status(201).json({
      message: 'Établissement créé avec succès',
      etablissement
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: error.errors
      });
    }
    
    console.error('Erreur lors de la création de l\'établissement:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const getEtablissements = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const where = {};
    
    if (req.query.wilaya) {
      where.wilaya = {
        contains: req.query.wilaya,
        mode: 'insensitive'
      };
    }

    if (req.query.search) {
      where.OR = [
        { nom: { contains: req.query.search, mode: 'insensitive' } },
        { nomArabe: { contains: req.query.search, mode: 'insensitive' } }
      ];
    }

    if (req.user.role !== 'ADMIN') {
      where.id = req.user.etablissementId;
    }

    const [etablissements, total] = await Promise.all([
      prisma.etablissement.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              utilisateurs: true,
              classes: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.etablissement.count({ where })
    ]);

    res.json({
      etablissements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des établissements:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const getEtablissementById = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'ADMIN' && req.user.etablissementId !== id) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const etablissement = await prisma.etablissement.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            utilisateurs: true,
            classes: true,
            anneeScolaires: true
          }
        },
        anneeScolaires: {
          where: { estActive: true },
          include: {
            _count: {
              select: {
                classes: true
              }
            }
          }
        }
      }
    });

    if (!etablissement) {
      return res.status(404).json({ message: 'Établissement non trouvé' });
    }

    res.json({ etablissement });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'établissement:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const updateEtablissement = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.user.role !== 'ADMIN' && req.user.etablissementId !== id) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const validatedData = etablissementSchema.partial().parse(req.body);

    const etablissement = await prisma.etablissement.findUnique({
      where: { id }
    });

    if (!etablissement) {
      return res.status(404).json({ message: 'Établissement non trouvé' });
    }

    const updatedEtablissement = await prisma.etablissement.update({
      where: { id },
      data: validatedData
    });

    res.json({
      message: 'Établissement mis à jour avec succès',
      etablissement: updatedEtablissement
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: error.errors
      });
    }
    
    console.error('Erreur lors de la mise à jour de l\'établissement:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const deleteEtablissement = async (req, res) => {
  try {
    const { id } = req.params;

    const etablissement = await prisma.etablissement.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            utilisateurs: true
          }
        }
      }
    });

    if (!etablissement) {
      return res.status(404).json({ message: 'Établissement non trouvé' });
    }

    if (etablissement._count.utilisateurs > 0) {
      return res.status(400).json({
        message: 'Impossible de supprimer un établissement avec des utilisateurs'
      });
    }

    await prisma.etablissement.delete({
      where: { id }
    });

    res.json({ message: 'Établissement supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'établissement:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

module.exports = {
  createEtablissement,
  getEtablissements,
  getEtablissementById,
  updateEtablissement,
  deleteEtablissement
};