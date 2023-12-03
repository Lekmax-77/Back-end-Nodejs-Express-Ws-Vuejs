const express = require('express');
const app = express();
const port = 3000;
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Options de configuration Swagger
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Back-end Express',
            version: '1.0.0',
            description: 'This is a back-end with Node.js/Express for Vuejs Workshop',
        },
    },
    apis: ['./server.js'], // Chemin vers les fichiers contenant les commentaires de documentation Swagger
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


const API_KEY = "ef4f85d0-6128-11ee-8c99-0242ac120002";
SECRET_KEY = "ef4f85d0-6128-11ee-8c99-0242ac120002";

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let db = new sqlite3.Database('./mydatabase.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the in-memory SQlite database.');
});

db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL ,
    password TEXT NOT NULL
    )`, (err) => {
    if (err) {
        console.error(err.message);
    }
});

db.run(`CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL,
    priority TEXT NOT NULL,
    user_id INTEGER NOT NULL
    )`, (err) => {
    if (err) {
        console.error(err.message);
    }
});


/**
 * @swagger
 * /cards:
 *   get:
 *     summary: Récupère toutes les cartes associées à un utilisateur
 *     parameters:
 *       - in: header
 *         name: x-access-token
 *         schema:
 *           type: string
 *         required: true
 *         description: JWT Token de l'utilisateur
 *     responses:
 *       200:
 *         description: Liste des cartes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Card'
 *       401:
 *         description: Token non fourni ou invalide
 *       500:
 *         description: Erreur serveur
 */
app.get('/cards', verifyApiKey, (req, res) => {
    const token = req.headers['x-access-token'];

    if (!token) {
        return res.status(401).send({ auth: false, message: 'No token provided.' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        }
        db.all(`SELECT * FROM cards WHERE user_id = ?`, [decoded.id], (err, cards) => {
            if (err) {
                res.status(500).send('Error on the server.');
            } else {
                res.send(cards);
            }
        });
    }
    );


});

/**
 * @swagger
 * /cards/create:
 *   post:
 *     summary: Crée une nouvelle carte
 *     parameters:
 *       - in: header
 *         name: x-access-token
 *         schema:
 *           type: string
 *         required: true
 *         description: JWT Token de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Card'
 *     responses:
 *       201:
 *         description: Carte créée avec succès
 *       400:
 *         description: Impossible de créer la carte
 *       401:
 *         description: Token non fourni ou invalide
 */
app.post('/cards/create', (req, res) => {
    const token = req.headers['x-access-token'];
    const { title, description, status, priority} = req.body;

    if (!token) {
        return res.status(401).send({ auth: false, message: 'No token provided.' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        }
        db.run(`INSERT INTO cards (title, description, status, priority, user_id) VALUES (?, ?, ?, ?, ?)`, [title, description, status, priority, decoded.id], function(err) {
            if (err) {
                res.status(400).send('Unable to create card');
            } else {
                res.status(201).send({ cardId: this.lastID });
            }
        });
    }
    );
});

/**
 * @swagger
 * /cards/update:
 *   post:
 *     summary: Met à jour une carte existante
 *     parameters:
 *       - in: header
 *         name: x-access-token
 *         schema:
 *           type: string
 *         required: true
 *         description: JWT Token de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Card'
 *     responses:
 *       201:
 *         description: Carte mise à jour avec succès
 *       400:
 *         description: Impossible de mettre à jour la carte
 *       401:
 *         description: Token non fourni ou invalide
 */
app.post('/cards/update', (req, res) => {
    const { id, title, description, status, priority } = req.body;
    const token = req.headers['x-access-token'];

    if (!token) {
        return res.status(401).send({ auth: false, message: 'No token provided.' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        }

        db.run(`UPDATE cards SET title = ?, description = ?, status = ?, priority = ? WHERE id = ?`, [title, description, status, priority, id], function(err) {
            if (err) {
                res.status(400).send('Unable to update card');
            } else {
                res.status(201).send({ cardId: id });
            }
        });
    }
    );
});

/**
 * @swagger
 * /cards/delete:
 *   post:
 *     summary: Supprime une carte
 *     parameters:
 *       - in: header
 *         name: x-access-token
 *         schema:
 *           type: string
 *         required: true
 *         description: JWT Token de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID de la carte à supprimer
 *     responses:
 *       201:
 *         description: Carte supprimée avec succès
 *       400:
 *         description: Impossible de supprimer la carte
 *       401:
 *         description: Token non fourni ou invalide
 */
app.post('/cards/delete', verifyApiKey, (req, res) => {
    const token = req.headers['x-access-token'];
    const { id } = req.body;

    if (!token) {
        return res.status(401).send({ auth: false, message: 'No token provided.' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        }

        db.run(`DELETE FROM cards WHERE id = ?`, [id], function(err) {
            if (err) {
                res.status(400).send('Unable to delete card');
            } else {
                res.status(201).send({ cardId: id });
            }
        });
    }
    );
});

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         schema:
 *           type: string
 *         required: true
 *         description: Clé API pour autoriser la création de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email de l'utilisateur
 *               username:
 *                 type: string
 *                 description: Nom d'utilisateur
 *               password:
 *                 type: string
 *                 description: Mot de passe
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Impossible de créer l'utilisateur
 *       403:
 *         description: Clé API invalide
 */
app.post('/register', async (req, res) => {
    const { email, username, password } = req.body;
    const apiKey = req.headers['x-api-key'];

    if (apiKey === API_KEY) {
        db.run(`INSERT INTO users (username, email, password) VALUES (?, ?, ?)`, [username, email, password], function(err) {
            if (err) {
                res.status(400).send('Unable to create user');
            } else {
                res.status(201).send({ userId: this.lastID });
            }
        });
    } else {
        res.status(403).send('Invalid API key');
    }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Connecte un utilisateur et renvoie un JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Le nom d'utilisateur
 *               password:
 *                 type: string
 *                 description: Le mot de passe
 *     responses:
 *       200:
 *         description: Connexion réussie et token renvoyé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT Token pour l'authentification
 *       401:
 *         description: Identifiants incorrects
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err) {
            res.status(500).send('Error on the server.');
        } else if (!user) {
            res.status(404).send('User not found.');
        } else {
            if (password !== user.password) {
                res.status(401).send('Password is not valid.');
            } else {
                const token = jwt.sign({ id: user.id }, SECRET_KEY, {
                    expiresIn: 86400 // expires in 24 hours
                });
                res.send({token: token });
            }
        }
    });
});


// Middleware pour vérifier l'API Key
function verifyApiKey(req, res, next) {
    console.log("wait");
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
        return res.status(403).send({ message: 'No API key provided.' });
    }
    if (apiKey !== API_KEY) {
        return res.status(403).send({ message: 'Invalid API key.' });
    }

    console.log("okay");
    next();
}

app.get('/', (req, res) => {
    res.send('Hello Bebou!');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});



/**
 * @swagger
 * components:
 *   schemas:
 *     Card:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - status
 *         - priority
 *       properties:
 *         id:
 *           type: integer
 *           description: ID de la carte
 *         title:
 *           type: string
 *           description: Titre de la carte
 *         description:
 *           type: string
 *           description: Description de la carte
 *         status:
 *           type: string
 *           description: Statut de la carte
 *         priority:
 *           type: string
 *           description: Priorité de la carte
 *         user_id:
 *           type: integer
 *           description: ID de l'utilisateur associé à la carte
 */
