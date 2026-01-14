# Backend (Node + TypeScript + Prisma)

Minimal backend skeleton using Express, TypeScript and Prisma (SQLite for local demo).

Quick start (Windows):

```powershell
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Endpoints:

- `POST /payments` { amount:number, method:string, metadata?:object } -> creates payment (status `pending`)
- `GET /payments/:id` -> get payment
- `POST /payments/:id/confirm` { status: 'paid'|'failed' } -> simulate confirmation/webhook

Notes:

- Uses SQLite `prisma/dev.db` for local demo. To migrate to Postgres, update `prisma/schema.prisma` datasource and run migrations.
