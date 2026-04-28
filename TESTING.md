# RepRun Preview Setup

## Local Setup

From the project folder:

```powershell
cd c:\Users\johnt\Documents\reprun
npm install
docker start reprun-postgres
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Open:

```text
http://localhost:3000
```

If the database container does not exist yet:

```powershell
docker run --name reprun-postgres `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=reprun `
  -p 5433:5432 `
  -d postgres:16
```

The local `.env` should include:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/reprun?schema=public"
AUTH_SECRET="replace-with-a-long-random-secret"
```

## What To Try

1. Generate a report while signed out.
2. Confirm it appears under Previous reports and survives a refresh in the same browser.
3. Create an account from the panel near the top of the app.
4. Generate another report while signed in.
5. Confirm Previous reports says it is saved to the account.
6. Log out and confirm the app returns to browser-only history.
7. Log back in and confirm the account report history returns.
8. Load a saved report and confirm the splits populate the report form.
9. Delete a saved account report and confirm it disappears.

## Verification Commands

Before sharing the app for someone to play around with:

```powershell
npm test
npm run build
```
