# Home Decor — API

REST API for a Home Decor e-commerce platform — Express, TypeScript, MongoDB, Socket.IO.

Frontend repository: https://github.com/saida9402/Home-decor-react

## Stack

- **Runtime / language:** Node.js, TypeScript
- **Server:** Express, EJS (admin views), Morgan
- **Database:** MongoDB via Mongoose
- **Realtime:** Socket.IO
- **Auth / sessions:** JSON Web Tokens, bcryptjs, express-session, connect-mongodb-session, cookie-parser
- **Uploads:** Multer, fs-extra
- **Other:** CORS, dotenv, moment, uuid, node-fetch

## Requirements

- Node.js **16.20.2** (see `.nvmrc`)
- MongoDB instance (local or remote)

## Installation

```bash
git clone https://github.com/saida9402/Home-decor-api.git
cd Home-decor-api
npm ci
cp .env.example .env    # then fill in the values
npm run build
npm run start:prod
```

## Development

```bash
npm run start:dev       # nodemon + ts-node, runs on the port defined by PORT in .env (3003 by default)
```

## Environment variables

Copy `.env.example` to `.env` and set each value.

| Variable | Purpose |
|---|---|
| `MONGO_URL` | MongoDB connection string |
| `SESSION_SECRET` | Secret used to sign express-session cookies |
| `SECRET_TOKEN` | Secret used to sign and verify JWTs |
| `PORT` | Port the HTTP server listens on |
| `GEMINI_API_KEY` | API key for the Gemini-backed AI endpoint |

## Deployment

The server runs under PM2 in `fork` mode (required for stable Socket.IO connections), using the Node 16 binary provided by nvm.

```bash
./deploy.sh
```

The script pulls the latest `master`, installs dependencies with `npm ci`, builds to `dist/`, then starts or restarts the PM2 process defined in `process.config.js` and persists the process list with `pm2 save`.

Useful PM2 commands:

```bash
pm2 status
pm2 logs HOME-DECOR
pm2 restart HOME-DECOR
```

## Project structure

```
src/
├── server.ts          HTTP + Socket.IO server entry point
├── app.ts             Express app: middleware, view engine, static files
├── router.ts          Public API routes
├── router-admin.ts    Admin panel routes
├── controllers/       Request handlers (ai, member, order, product, seller)
├── models/            Business logic services (Auth, Member, Order, Product, View, Ai)
├── schema/            Mongoose models (Member, Order, OrderItem, Product, View)
├── libs/              Shared config, error definitions, enums, types, utils
├── views/             EJS templates for the admin panel
└── public/            Static assets served by Express (css, js, img)
```

User-uploaded files are stored in `uploads/` and are excluded from version control.
