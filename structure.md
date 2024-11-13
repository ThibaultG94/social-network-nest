# Social Network NestJS Project Structure

```
social-network-nest/
├── dist/                      # Dossier de build
├── node_modules/              # Dépendances
├── src/
│   ├── config/               # Configuration centralisée
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   ├── mail.config.ts    # Pour les emails de réinitialisation
│   │   ├── cors.config.ts
│   │   └── validation.config.ts
│   │
│   ├── types/               # Types globaux
│   │   ├── express.d.ts     # Extension des types Express
│   │   ├── pagination.ts    # Types pour la pagination
│   │   └── responses.ts     # Types de réponses API
│   │
│   ├── utils/              # Fonctions utilitaires
│   │   ├── validators/
│   │   │   ├── date.validator.ts
│   │   │   ├── password.validator.ts
│   │   │   └── username.validator.ts
│   │   ├── formatters/
│   │   │   ├── date.formatter.ts
│   │   │   └── response.formatter.ts
│   │   └── helpers/
│   │       ├── file.helper.ts
│   │       └── crypto.helper.ts
│   │
│   ├── auth/               # Module d'authentification
│   │   ├── dto/
│   │   │   ├── register.dto.ts
│   │   │   ├── login.dto.ts
│   │   │   ├── forgot-password.dto.ts
│   │   │   └── reset-password.dto.ts
│   │   ├── interfaces/
│   │   │   ├── jwt-payload.interface.ts
│   │   │   └── request-with-user.interface.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   ├── auth.controller.spec.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.spec.ts
│   │   └── auth.service.ts
│   │
│   ├── common/            # Éléments partagés
│   │   ├── decorators/
│   │   │   └── public.decorator.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts
|   |   ├── interceptors/
|   |   │   ├── transform.interceptor.ts
|   |   │   ├── timeout.interceptor.ts
|   |   │   └── logging.interceptor.ts
│   │   ├── middleware/
│   │   │   └── logger.middleware.ts
│   │   └── pipes/
│   │       ├── parse-uuid.pipe.ts
│   │       └── validation.pipe.ts
│   │
│   ├── users/            # Module utilisateurs
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   └── update-user.dto.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   ├── users.controller.spec.ts
│   │   ├── users.controller.ts
│   │   ├── users.module.ts
│   │   ├── users.service.spec.ts
│   │   └── users.service.ts
│   │
│   ├── posts/           # Module publications
│   │   ├── dto/
│   │   │   ├── create-post.dto.ts
│   │   │   └── update-post.dto.ts
│   │   ├── entities/
│   │   │   └── post.entity.ts
│   │   ├── posts.controller.spec.ts
│   │   ├── posts.controller.ts
│   │   ├── posts.module.ts
│   │   ├── posts.service.spec.ts
│   │   └── posts.service.ts
│   │
│   ├── follows/         # Module abonnements
│   │   ├── dto/
│   │   │   ├── create-follow.dto.ts
│   │   │   └── update-follow.dto.ts
│   │   ├── entities/
│   │   │   └── follow.entity.ts
│   │   ├── follows.controller.spec.ts
│   │   ├── follows.controller.ts
│   │   ├── follows.module.ts
│   │   ├── follows.service.spec.ts
│   │   └── follows.service.ts
│   │
│   ├── likes/           # Module j'aime
│   │   ├── dto/
│   │   │   ├── create-like.dto.ts
│   │   │   └── update-like.dto.ts
│   │   ├── entities/
│   │   │   └── like.entity.ts
│   │   ├── likes.controller.spec.ts
│   │   ├── likes.controller.ts
│   │   ├── likes.module.ts
│   │   ├── likes.service.spec.ts
│   │   └── likes.service.ts
│   │
│   ├── app.controller.spec.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts
│
├── test/               # Tests organisés
│   ├── e2e/           # Tests end-to-end
│   │   ├── auth/
│   │   │   └── auth.e2e-spec.ts
│   │   ├── users/
│   │   │   └── users.e2e-spec.ts
│   │   └── posts/
│   │       └── posts.e2e-spec.ts
|   ├── integration/
|   │   ├── auth/
|   │   │   └── auth.integration.spec.ts
|   │   ├── users/
|   │   │   └── users.integration.spec.ts
|   │   └── posts/
|   │       └── posts.integration.spec.ts
|   ├── unit/
|   │   ├── utils/
|   │   │   ├── validators.spec.ts
|   │   │   ├── formatters.spec.ts
|   │   │   └── helpers.spec.ts
|   │   └── common/
|   │       ├── interceptors/
|   │       │   └── transform.interceptor.spec.ts
|   │       ├── pipes/
|   │       │   └── parse-uuid.pipe.spec.ts
|   │       └── guards/
|   │           └── jwt-auth.guard.spec.ts
│   ├── mocks/        # Mocks réutilisables
│   │   ├── repositories/
│   │   └── services/
│   ├── fixtures/     # Données de test
│   │   ├── users.fixture.ts
│   │   └── posts.fixture.ts
│   └── helpers/      # Utilitaires de test
│       ├── database.helper.ts
│       └── auth.helper.ts
│
├── .env              # Variables d'environnement
├── .eslintrc.js     # Configuration ESLint
├── .gitignore       # Fichiers ignorés par Git
├── .prettierrc      # Configuration Prettier
├── captain-definition  # Configuration CapRover
├── nest-cli.json      # Configuration NestJS CLI
├── package.json       # Dépendances et scripts
├── README.md         # Documentation principale
├── structure.md      # Documentation de la structure
├── tsconfig.build.json  # Configuration TypeScript pour build
└── tsconfig.json       # Configuration TypeScript principale
```

## Description des modules

### src/config/

Configuration centralisée de l'application (base de données, JWT, etc.).

### src/types/

Types TypeScript globaux et interfaces partagées.

### src/utils/

Fonctions utilitaires réutilisables dans toute l'application.

### src/auth/

Module d'authentification complet avec JWT et réinitialisation de mot de passe.

### src/common/

Éléments partagés : décorateurs, filtres, guards, middleware et pipes.

### src/users/

Gestion complète des utilisateurs et de leurs profils.

### src/posts/

Gestion des publications du réseau social.

### src/follows/

Système d'abonnements entre utilisateurs.

### src/likes/

Système de "j'aime" pour les publications.

## Configuration et déploiement

- **.env**: Variables d'environnement pour le développement
- **captain-definition**: Configuration pour le déploiement avec CapRover
- Les variables d'environnement de production sont gérées via l'interface CapRover

## Tests

Organisation des tests en trois catégories :

- Tests E2E pour les scénarios complets
- Mocks pour simuler les dépendances
- Fixtures pour les données de test

## Points de sécurité

1. JWT Authentication
2. Protection des routes avec Guards
3. Validation des données (DTOs)
4. Gestion globale des exceptions
5. Logging des requêtes
6. Hachage des mots de passe
7. Protection contre les UUID invalides

## Configuration globale

- Validation des DTOs
- Transformation automatique des types
- Préfixe API global
- CORS configuré
- Compression des réponses
- Sécurité avec Helmet
