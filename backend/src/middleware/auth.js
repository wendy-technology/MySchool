const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token d\'accès requis' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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
      return res.status(401).json({ message: 'Utilisateur non autorisé' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentification requise' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès non autorisé pour ce rôle' });
    }

    next();
  };
};

const requireSameEtablissement = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentification requise' });
  }

  if (req.user.role === 'ADMIN') {
    return next();
  }

  const etablissementId = req.params.etablissementId || req.body.etablissementId;
  
  if (etablissementId && etablissementId !== req.user.etablissementId) {
    return res.status(403).json({ message: 'Accès limité à votre établissement' });
  }

  next();
};

module.exports = {
  auth,
  requireRole,
  requireSameEtablissement
};