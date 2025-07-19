const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Nettoyage de la base de données...');
  
  // Supprimer toutes les données dans l'ordre inverse des dépendances
  await prisma.note.deleteMany();
  await prisma.moyenneMatiere.deleteMany();
  await prisma.bulletin.deleteMany();
  await prisma.evaluation.deleteMany();
  await prisma.absence.deleteMany();
  await prisma.justificatif.deleteMany();
  await prisma.cours.deleteMany();
  await prisma.creneau.deleteMany();
  await prisma.salle.deleteMany();
  await prisma.matiereClasse.deleteMany();
  await prisma.parentEleve.deleteMany();
  await prisma.enseignant.deleteMany();
  await prisma.eleve.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.user.deleteMany();
  await prisma.matiere.deleteMany();
  await prisma.classe.deleteMany();
  await prisma.anneeScolaire.deleteMany();
  await prisma.etablissement.deleteMany();

  console.log('✅ Base de données nettoyée');
  console.log('🌱 Début du seeding...');

  // Créer un établissement scolaire
  const etablissement = await prisma.etablissement.create({
    data: {
      nom: 'CEM Ibn Khaldoun',
      nomArabe: 'متوسطة ابن خلدون',
      adresse: '15 Rue des Frères Boudjelal, Sidi M\'Hamed',
      adresseArabe: '15 شارع الأخوين بوجلال، سيدي امحمد',
      wilaya: 'Alger',
      commune: 'Sidi M\'Hamed',
      telephone: '+213 21 73 45 67',
      email: 'contact@cem-ibnkhaldoun.edu.dz',
      directeur: 'M. Ahmed BENALI',
      directeurArabe: 'السيد أحمد بن علي'
    }
  });

  console.log('✅ Établissement créé:', etablissement.nom);

  // Créer une année scolaire
  const anneeScolaire = await prisma.anneeScolaire.create({
    data: {
      nom: '2023-2024',
      dateDebut: new Date('2023-09-01'),
      dateFin: new Date('2024-06-30'),
      estActive: true,
      etablissementId: etablissement.id
    }
  });

  console.log('✅ Année scolaire créée:', anneeScolaire.nom);

  // Créer des matières
  const matieres = await Promise.all([
    prisma.matiere.create({
      data: {
        nom: 'Mathématiques',
        nomArabe: 'الرياضيات',
        code: 'MATH',
        coefficient: 3.0,
        couleur: '#2563EB'
      }
    }),
    prisma.matiere.create({
      data: {
        nom: 'Français',
        nomArabe: 'اللغة الفرنسية',
        code: 'FR',
        coefficient: 3.0,
        couleur: '#DC2626'
      }
    }),
    prisma.matiere.create({
      data: {
        nom: 'Arabe',
        nomArabe: 'اللغة العربية',
        code: 'AR',
        coefficient: 3.0,
        couleur: '#059669'
      }
    }),
    prisma.matiere.create({
      data: {
        nom: 'Anglais',
        nomArabe: 'اللغة الإنجليزية',
        code: 'EN',
        coefficient: 2.0,
        couleur: '#7C3AED'
      }
    }),
    prisma.matiere.create({
      data: {
        nom: 'Sciences Physiques',
        nomArabe: 'العلوم الفيزيائية',
        code: 'PHY',
        coefficient: 2.0,
        couleur: '#EA580C'
      }
    }),
    prisma.matiere.create({
      data: {
        nom: 'Sciences Naturelles',
        nomArabe: 'العلوم الطبيعية',
        code: 'SVT',
        coefficient: 2.0,
        couleur: '#16A34A'
      }
    }),
    prisma.matiere.create({
      data: {
        nom: 'Histoire-Géographie',
        nomArabe: 'التاريخ والجغرافيا',
        code: 'HG',
        coefficient: 2.0,
        couleur: '#B45309'
      }
    }),
    prisma.matiere.create({
      data: {
        nom: 'Éducation Islamique',
        nomArabe: 'التربية الإسلامية',
        code: 'EI',
        coefficient: 1.0,
        couleur: '#065F46'
      }
    }),
    prisma.matiere.create({
      data: {
        nom: 'Éducation Physique',
        nomArabe: 'التربية البدنية',
        code: 'EPS',
        coefficient: 1.0,
        couleur: '#BE185D'
      }
    })
  ]);

  console.log('✅ Matières créées:', matieres.length);

  // Créer des classes
  const classes = await Promise.all([
    prisma.classe.create({
      data: {
        nom: '1ère AM A',
        nomArabe: 'الأولى متوسط أ',
        niveau: 'PREMIERE_AM',
        cycle: 'MOYEN',
        filiere: 'GENERAL',
        effectifMax: 35,
        salleClasse: 'Salle 1A',
        etablissementId: etablissement.id,
        anneeScolaireId: anneeScolaire.id
      }
    }),
    prisma.classe.create({
      data: {
        nom: '2ème AM B',
        nomArabe: 'الثانية متوسط ب',
        niveau: 'DEUXIEME_AM',
        cycle: 'MOYEN',
        filiere: 'GENERAL',
        effectifMax: 35,
        salleClasse: 'Salle 2B',
        etablissementId: etablissement.id,
        anneeScolaireId: anneeScolaire.id
      }
    }),
    prisma.classe.create({
      data: {
        nom: '4ème AM C',
        nomArabe: 'الرابعة متوسط ج',
        niveau: 'QUATRIEME_AM',
        cycle: 'MOYEN',
        filiere: 'GENERAL',
        effectifMax: 35,
        salleClasse: 'Salle 4C',
        etablissementId: etablissement.id,
        anneeScolaireId: anneeScolaire.id
      }
    })
  ]);

  console.log('✅ Classes créées:', classes.length);

  // Créer un administrateur
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@cem-ibnkhaldoun.edu.dz',
      motDePasse: adminPassword,
      nom: 'BENALI',
      prenom: 'Ahmed',
      nomArabe: 'بن علي',
      prenomArabe: 'أحمد',
      telephone: '+213 555 123 456',
      adresse: 'Alger',
      dateNaissance: new Date('1975-03-15'),
      lieuNaissance: 'Alger',
      role: 'ADMIN',
      etablissementId: etablissement.id
    }
  });

  console.log('✅ Administrateur créé:', admin.email);

  // Créer des enseignants
  const enseignantsData = [
    {
      email: 'maths@cem-ibnkhaldoun.edu.dz',
      nom: 'BOUMEDIENE',
      prenom: 'Fatima',
      nomArabe: 'بومدين',
      prenomArabe: 'فاطمة',
      specialite: 'Mathématiques',
      specialiteArabe: 'الرياضيات'
    },
    {
      email: 'francais@cem-ibnkhaldoun.edu.dz',
      nom: 'MEZIANE',
      prenom: 'Karim',
      nomArabe: 'مزيان',
      prenomArabe: 'كريم',
      specialite: 'Français',
      specialiteArabe: 'اللغة الفرنسية'
    },
    {
      email: 'arabe@cem-ibnkhaldoun.edu.dz',
      nom: 'HADJ',
      prenom: 'Amina',
      nomArabe: 'حاج',
      prenomArabe: 'أمينة',
      specialite: 'Langue Arabe',
      specialiteArabe: 'اللغة العربية'
    }
  ];

  const enseignantPassword = await bcrypt.hash('enseignant123', 12);
  const enseignants = [];

  for (const enseignantData of enseignantsData) {
    const user = await prisma.user.create({
      data: {
        email: enseignantData.email,
        motDePasse: enseignantPassword,
        nom: enseignantData.nom,
        prenom: enseignantData.prenom,
        nomArabe: enseignantData.nomArabe,
        prenomArabe: enseignantData.prenomArabe,
        telephone: '+213 555 ' + Math.floor(Math.random() * 900000 + 100000),
        dateNaissance: new Date(1980 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        role: 'ENSEIGNANT',
        etablissementId: etablissement.id
      }
    });

    const enseignant = await prisma.enseignant.create({
      data: {
        userId: user.id,
        matricule: `ENS${Date.now() + Math.floor(Math.random() * 1000)}`,
        specialite: enseignantData.specialite,
        specialiteArabe: enseignantData.specialiteArabe
      }
    });

    enseignants.push({ user, enseignant });
  }

  console.log('✅ Enseignants créés:', enseignants.length);

  // Créer des élèves
  const elevesData = [
    { nom: 'BENAMARA', prenom: 'Yasmine', nomArabe: 'بن عمارة', prenomArabe: 'ياسمين', classe: 0 },
    { nom: 'CHERIF', prenom: 'Mohammed', nomArabe: 'شريف', prenomArabe: 'محمد', classe: 0 },
    { nom: 'DJELLOUL', prenom: 'Nadia', nomArabe: 'جلول', prenomArabe: 'نادية', classe: 1 },
    { nom: 'FERHAT', prenom: 'Bilal', nomArabe: 'فرحات', prenomArabe: 'بلال', classe: 1 },
    { nom: 'GUERROUDJ', prenom: 'Samira', nomArabe: 'قرودج', prenomArabe: 'سميرة', classe: 2 },
    { nom: 'HAMIDI', prenom: 'Youcef', nomArabe: 'حميدي', prenomArabe: 'يوسف', classe: 2 }
  ];

  const elevePassword = await bcrypt.hash('eleve123', 12);
  const eleves = [];

  for (const eleveData of elevesData) {
    const user = await prisma.user.create({
      data: {
        email: `${eleveData.prenom.toLowerCase()}.${eleveData.nom.toLowerCase()}@cem-ibnkhaldoun.edu.dz`,
        motDePasse: elevePassword,
        nom: eleveData.nom,
        prenom: eleveData.prenom,
        nomArabe: eleveData.nomArabe,
        prenomArabe: eleveData.prenomArabe,
        dateNaissance: new Date(2008 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        role: 'ELEVE',
        etablissementId: etablissement.id
      }
    });

    const eleve = await prisma.eleve.create({
      data: {
        userId: user.id,
        numeroEleve: `EL${Date.now() + Math.floor(Math.random() * 10000)}`,
        classeId: classes[eleveData.classe].id
      }
    });

    eleves.push({ user, eleve });
  }

  console.log('✅ Élèves créés:', eleves.length);

  // Créer des parents
  const parentsData = [
    { nom: 'BENAMARA', prenom: 'Ali', nomArabe: 'بن عمارة', prenomArabe: 'علي', profession: 'Ingénieur', enfantIndex: 0, lien: 'père' },
    { nom: 'CHERIF', prenom: 'Zohra', nomArabe: 'شريف', prenomArabe: 'زهرة', profession: 'Enseignante', enfantIndex: 1, lien: 'mère' },
    { nom: 'DJELLOUL', prenom: 'Omar', nomArabe: 'جلول', prenomArabe: 'عمر', profession: 'Médecin', enfantIndex: 2, lien: 'père' }
  ];

  const parentPassword = await bcrypt.hash('parent123', 12);

  for (const parentData of parentsData) {
    const user = await prisma.user.create({
      data: {
        email: `${parentData.prenom.toLowerCase()}.${parentData.nom.toLowerCase()}@gmail.com`,
        motDePasse: parentPassword,
        nom: parentData.nom,
        prenom: parentData.prenom,
        nomArabe: parentData.nomArabe,
        prenomArabe: parentData.prenomArabe,
        telephone: '+213 555 ' + Math.floor(Math.random() * 900000 + 100000),
        role: 'PARENT',
        etablissementId: etablissement.id
      }
    });

    const parent = await prisma.parent.create({
      data: {
        userId: user.id,
        profession: parentData.profession,
        professionArabe: parentData.profession === 'Ingénieur' ? 'مهندس' : 
                         parentData.profession === 'Enseignante' ? 'أستاذة' : 'طبيب'
      }
    });

    // Lier le parent à l'élève
    await prisma.parentEleve.create({
      data: {
        parentId: parent.id,
        eleveId: eleves[parentData.enfantIndex].eleve.id,
        lienParente: parentData.lien
      }
    });
  }

  console.log('✅ Parents créés et liés aux élèves');

  // Assigner des matières aux classes avec des enseignants
  const assignments = [
    // 1ère AM A
    { matiereIndex: 0, classeIndex: 0, enseignantIndex: 0, volumeHoraire: 5 }, // Maths
    { matiereIndex: 1, classeIndex: 0, enseignantIndex: 1, volumeHoraire: 5 }, // Français
    { matiereIndex: 2, classeIndex: 0, enseignantIndex: 2, volumeHoraire: 4 }, // Arabe
    
    // 2ème AM B
    { matiereIndex: 0, classeIndex: 1, enseignantIndex: 0, volumeHoraire: 5 }, // Maths
    { matiereIndex: 1, classeIndex: 1, enseignantIndex: 1, volumeHoraire: 5 }, // Français
    { matiereIndex: 3, classeIndex: 1, enseignantIndex: 1, volumeHoraire: 3 }, // Anglais
    
    // 4ème AM C
    { matiereIndex: 0, classeIndex: 2, enseignantIndex: 0, volumeHoraire: 6 }, // Maths
    { matiereIndex: 4, classeIndex: 2, enseignantIndex: 0, volumeHoraire: 4 }, // Sciences Physiques
    { matiereIndex: 5, classeIndex: 2, enseignantIndex: 2, volumeHoraire: 3 }  // Sciences Naturelles
  ];

  for (const assignment of assignments) {
    await prisma.matiereClasse.create({
      data: {
        matiereId: matieres[assignment.matiereIndex].id,
        classeId: classes[assignment.classeIndex].id,
        enseignantId: enseignants[assignment.enseignantIndex].enseignant.id,
        volumeHoraire: assignment.volumeHoraire
      }
    });
  }

  console.log('✅ Matières assignées aux classes');

  // ================================
  // PHASE 2A - NOUVEAUX MODULES
  // ================================

  console.log('\n📝 Création des données pour les nouveaux modules...');

  // 1. CRÉER DES CRÉNEAUX HORAIRES
  console.log('🕐 Création des créneaux horaires...');
  
  const joursOuvrables = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI'];
  const creneauxHoraires = [
    { ordre: 1, heureDebut: '08:00', heureFin: '09:00' },
    { ordre: 2, heureDebut: '09:00', heureFin: '10:00' },
    { ordre: 3, heureDebut: '10:15', heureFin: '11:15' },
    { ordre: 4, heureDebut: '11:15', heureFin: '12:15' },
    { ordre: 5, heureDebut: '13:30', heureFin: '14:30' },
    { ordre: 6, heureDebut: '14:30', heureFin: '15:30' }
  ];

  const creneaux = [];
  for (const jour of joursOuvrables) {
    for (const creneau of creneauxHoraires) {
      const nouveauCreneau = await prisma.creneau.create({
        data: {
          jour,
          heureDebut: creneau.heureDebut,
          heureFin: creneau.heureFin,
          ordre: creneau.ordre,
          etablissementId: etablissement.id
        }
      });
      creneaux.push(nouveauCreneau);
    }
  }

  console.log(`✅ ${creneaux.length} créneaux créés`);

  // 2. CRÉER DES SALLES
  console.log('🏫 Création des salles...');
  
  const salles = await Promise.all([
    prisma.salle.create({
      data: {
        nom: 'Salle 101',
        capacite: 35,
        type: 'Classe normale',
        etablissementId: etablissement.id
      }
    }),
    prisma.salle.create({
      data: {
        nom: 'Salle 102',
        capacite: 35,
        type: 'Classe normale',
        etablissementId: etablissement.id
      }
    }),
    prisma.salle.create({
      data: {
        nom: 'Labo Sciences',
        capacite: 24,
        type: 'Laboratoire',
        etablissementId: etablissement.id
      }
    }),
    prisma.salle.create({
      data: {
        nom: 'Salle Informatique',
        capacite: 20,
        type: 'Informatique',
        etablissementId: etablissement.id
      }
    })
  ]);

  console.log(`✅ ${salles.length} salles créées`);

  // 3. PROGRAMMER QUELQUES COURS
  console.log('📅 Programmation des cours...');
  
  const coursExemples = [
    // Lundi
    { matiereIndex: 0, enseignantIndex: 0, creneauIndex: 0, salleIndex: 0 }, // Maths 8h-9h
    { matiereIndex: 1, enseignantIndex: 1, creneauIndex: 1, salleIndex: 0 }, // Français 9h-10h
    { matiereIndex: 2, enseignantIndex: 2, creneauIndex: 2, salleIndex: 0 }, // Arabe 10h15-11h15
    
    // Mardi  
    { matiereIndex: 0, enseignantIndex: 0, creneauIndex: 6, salleIndex: 1 }, // Maths 8h-9h
    { matiereIndex: 1, enseignantIndex: 1, creneauIndex: 7, salleIndex: 1 }, // Français 9h-10h
  ];

  for (const coursData of coursExemples) {
    await prisma.cours.create({
      data: {
        creneauId: creneaux[coursData.creneauIndex].id,
        matiereId: matieres[coursData.matiereIndex].id,
        enseignantId: enseignants[coursData.enseignantIndex].user.id,
        classeId: classes[0].id, // 1ère AM A
        salleId: salles[coursData.salleIndex].id
      }
    });
  }

  console.log(`✅ ${coursExemples.length} cours programmés`);

  // 4. CRÉER DES ÉVALUATIONS
  console.log('📝 Création des évaluations...');
  
  const evaluations = [];
  
  // Évaluations pour chaque matière des 3 premières matières
  for (let i = 0; i < 3; i++) {
    // Évaluation trimestre 1
    const eval1 = await prisma.evaluation.create({
      data: {
        titre: `Contrôle Trimestre 1 - ${matieres[i].nom}`,
        description: `Évaluation du premier trimestre en ${matieres[i].nom}`,
        type: 'DEVOIR_SURVEILLE',
        coefficient: 2.0,
        date: new Date('2023-11-15'),
        noteMax: 20.0,
        trimestre: 1,
        matiereId: matieres[i].id,
        classeId: classes[0].id, // 1ère AM A
        enseignantId: enseignants[i].user.id
      }
    });
    evaluations.push(eval1);

    // Évaluation trimestre 2
    const eval2 = await prisma.evaluation.create({
      data: {
        titre: `Devoir Surveillé - ${matieres[i].nom}`,
        description: `Devoir surveillé du deuxième trimestre`,
        type: 'DEVOIR_SURVEILLE',
        coefficient: 3.0,
        date: new Date('2024-02-10'),
        noteMax: 20.0,
        trimestre: 2,
        matiereId: matieres[i].id,
        classeId: classes[0].id,
        enseignantId: enseignants[i].user.id
      }
    });
    evaluations.push(eval2);
  }

  console.log(`✅ ${evaluations.length} évaluations créées`);

  // 5. SAISIR DES NOTES
  console.log('📊 Saisie des notes...');
  
  const notes = [];
  
  // Pour chaque évaluation, donner des notes aux 2 premiers élèves
  for (const evaluation of evaluations) {
    for (let i = 0; i < 2; i++) {
      const note = await prisma.note.create({
        data: {
          valeur: Math.floor(Math.random() * 8) + 12, // Notes entre 12 et 20
          commentaire: i === 0 ? 'Très bon travail' : 'Bien, peut mieux faire',
          evaluationId: evaluation.id,
          eleveId: eleves[i].user.id
        }
      });
      notes.push(note);
    }
  }

  console.log(`✅ ${notes.length} notes saisies`);

  // 6. GÉNÉRER UN BULLETIN
  console.log('📋 Génération d\'un bulletin exemple...');
  
  // Générer bulletin pour le premier élève, trimestre 1
  const bulletin = await prisma.bulletin.create({
    data: {
      trimestre: 1,
      annee: '2023-2024',
      moyenneGenerale: 15.2,
      rang: 1,
      appreciation: 'Élève sérieux et appliqué. Continuez vos efforts.',
      effectifClasse: 2,
      eleveId: eleves[0].user.id,
      classeId: classes[0].id,
      moyennesMatieres: {
        create: [
          {
            moyenne: 16.0,
            coefficient: 3.0,
            matiereId: matieres[0].id // Maths
          },
          {
            moyenne: 15.5,
            coefficient: 3.0,
            matiereId: matieres[1].id // Français
          },
          {
            moyenne: 14.0,
            coefficient: 3.0,
            matiereId: matieres[2].id // Arabe
          }
        ]
      }
    }
  });

  console.log('✅ Bulletin généré');

  // 7. CRÉER QUELQUES ABSENCES
  console.log('❌ Création d\'absences exemples...');
  
  const absences = await Promise.all([
    prisma.absence.create({
      data: {
        date: new Date('2023-11-20'),
        type: 'ABSENCE',
        justifie: false,
        motif: 'Maladie',
        commentaire: 'Absent toute la journée',
        eleveId: eleves[0].user.id,
        enseignantId: enseignants[0].user.id
      }
    }),
    prisma.absence.create({
      data: {
        date: new Date('2023-11-22'),
        type: 'RETARD',
        heureDebut: '08:15',
        justifie: true,
        motif: 'Transport',
        commentaire: 'Retard de 15 minutes',
        eleveId: eleves[1].user.id,
        matiereId: matieres[0].id,
        enseignantId: enseignants[0].user.id
      }
    })
  ]);

  console.log(`✅ ${absences.length} absences créées`);

  // 8. CRÉER UN JUSTIFICATIF
  console.log('📄 Création d\'un justificatif...');
  
  const justificatif = await prisma.justificatif.create({
    data: {
      motif: 'Certificat médical',
      dateDebut: new Date('2023-11-20'),
      dateFin: new Date('2023-11-20'),
      valide: true,
      commentaire: 'Justificatif médical valide',
      eleveId: eleves[0].user.id,
      validePar: admin.id
    }
  });

  console.log('✅ Justificatif créé');

  console.log('\n🎉 Seeding terminé avec succès!');
  console.log('\n📋 Comptes créés:');
  console.log('👨‍💼 Admin: admin@cem-ibnkhaldoun.edu.dz / admin123');
  console.log('👩‍🏫 Enseignants: [nom]@cem-ibnkhaldoun.edu.dz / enseignant123');
  console.log('👨‍🎓 Élèves: [prenom].[nom]@cem-ibnkhaldoun.edu.dz / eleve123');
  console.log('👨‍👩‍👧‍👦 Parents: [prenom].[nom]@gmail.com / parent123');
  
  console.log('\n📊 Nouvelles données Phase 2A:');
  console.log(`🕐 ${creneaux.length} créneaux horaires`);
  console.log(`🏫 ${salles.length} salles`);
  console.log(`📅 ${coursExemples.length} cours programmés`);
  console.log(`📝 ${evaluations.length} évaluations`);
  console.log(`📊 ${notes.length} notes`);
  console.log(`📋 1 bulletin généré`);
  console.log(`❌ ${absences.length} absences`);
  console.log(`📄 1 justificatif`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });