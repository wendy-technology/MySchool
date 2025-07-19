require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const authRoutes = require('./routes/auth');
const etablissementRoutes = require('./routes/etablissements');
const userRoutes = require('./routes/users');
const classeRoutes = require('./routes/classes');
const matiereRoutes = require('./routes/matieres');

// Nouveaux modules Phase 2A
const evaluationRoutes = require('./routes/evaluations');
const noteRoutes = require('./routes/notes');
const bulletinRoutes = require('./routes/bulletins');
const absenceRoutes = require('./routes/absences');
const justificatifRoutes = require('./routes/justificatifs');
const emploiDuTempsRoutes = require('./routes/emploi-du-temps');

const app = express();
const PORT = process.env.PORT || 3000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Trop de requêtes depuis cette IP, réessayez plus tard.'
});

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MySchool API',
      version: '1.0.0',
      description: 'API REST pour système de gestion scolaire algérien'
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Serveur de développement'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(helmet());
app.use(cors());
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/etablissements', etablissementRoutes);
app.use('/api/utilisateurs', userRoutes);
app.use('/api/classes', classeRoutes);
app.use('/api/matieres', matiereRoutes);

// Nouveaux modules Phase 2A
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/bulletins', bulletinRoutes);
app.use('/api/absences', absenceRoutes);
app.use('/api/justificatifs', justificatifRoutes);
app.use('/api/emploi-du-temps', emploiDuTempsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'MySchool API is running',
    timestamp: new Date().toISOString() 
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur MySchool démarré sur le port ${PORT}`);
  console.log(`📚 Documentation API: http://localhost:${PORT}/api-docs`);
});

module.exports = app;