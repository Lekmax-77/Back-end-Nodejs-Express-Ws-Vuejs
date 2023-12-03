# Express Back-End for Vue.js Workshop

This project is a back-end developed with Node.js and Express, designed for a Vue.js workshop. It utilizes SQLite for database management and implements JWT for authentication.

## Features

- User authentication
- Cards management (create, update, delete)
- API documentation with Swagger

## Prerequisites

- Node.js
- npm (Node Package Manager)

## Installation

1. Clone the repository:

   ```bash
   git clone git@github.com:Lekmax-77/Back-end-Ws-Vuejs.git
   ```

2. Navigate to the project directory:

   ```bash
   cd Back-end-Ws-Vuejs
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

## Starting the Server

To start the server, execute:

```bash
node server.js
```

The server will start and be accessible at `http://localhost:3000`.

## Using the API

Once the server is up, you can access the Swagger API documentation at `http://localhost:3000/api-docs` to view available routes and test the API.

## Main Routes

- `/register`: Registers a new user
- `/login`: Logs in a user and retrieves a JWT
- `/cards`: Retrieves all cards associated with a user
- `/cards/create`: Creates a new card
- `/cards/update`: Updates an existing card
- `/cards/delete`: Deletes a card

## Swagger Documentation Route

- Access the Swagger UI for API documentation at `http://localhost:3000/api-docs`. This interactive documentation allows you to understand and test the API endpoints directly.

## Security

This project uses API keys and JWTs for authentication and route security. Ensure they are correctly configured for secure operation.

## Contact
**Email:** malekgatoufi@gmail.com
