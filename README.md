# AutoYard: Car Dealership Inventory System

![CI](https://github.com/karthikdevadiga05/car-dealership-inventory/actions/workflows/ci.yml/badge.svg)

A full-stack inventory system for a car dealership, built as a test-driven development kata. Customers browse, search, view and buy vehicles. Admins manage the inventory: add, edit, delete, restock and upload photos.

**Author:** Karthik R Sherigara
**AI chat logs:** [PROMPTS.md](./PROMPTS.md)

## Screenshots

| Sign in | Register |
|---|---|
| ![Sign in](screenshots/login.PNG) | ![Register](screenshots/register.PNG) |

| Home 1 | Home 2 |
|---|---|
| ![Home 1](screenshots/home1.PNG) | ![Home 2](screenshots/home2.PNG) |

| Home 3 | Admin home |
|---|---|
| ![Home 3](screenshots/home3.PNG) | ![Admin home](screenshots/admin_home.PNG) |

| Vehicle details | Confirm purchase |
|---|---|
| ![Vehicle details](screenshots/view_details.PNG) | ![Confirm purchase](screenshots/confirm_purchase.PNG) |

| Purchase confirmation message | Filter |
|---|---|
| ![Purchase confirmation message](screenshots/confirm_purchase_msg.PNG) | ![Filter](screenshots/filter.PNG) |

| Price: low to high | Price: high to low |
|---|---|
| ![Price low to high](screenshots/price_lowtohigh.PNG) | ![Price high to low](screenshots/price_hightolow.PNG) |

| Night mode | Stock unavailable |
|---|---|
| ![Night mode](screenshots/night_mode.PNG) | ![Stock unavailable](screenshots/stock_no.PNG) |

| Features | Add vehicle |
|---|---|
| ![Features](screenshots/features.jpeg) | ![Add vehicle](screenshots/add_vehicle.PNG) |

| Crop image | Edit vehicle |
|---|---|
| ![Crop image](screenshots/crop_img.PNG) | ![Edit vehicle](screenshots/edit_vehicle.PNG) |

| Restock | Stock available |
|---|---|
| ![Restock](screenshots/restoke.PNG) | ![Stock available](screenshots/stock_yes.PNG) |

## Features

**Everyone**
- Register with a name, sign in with JWT authentication, and see a welcome message
- Dashboard with vehicle cards and summary stats
- Search by make, model, category and price range (done on the server)
- Sort by price, low to high or high to low
- "View details" popup with the full photo and details
- Light and dark mode, remembered between visits
- Interactive hero banner: the car follows the pointer and a paint picker changes its colour (motion is switched off for users who prefer reduced motion)
- Responsive layout

**Customers**
- Purchase a chosen quantity through a confirmation popup
- The Purchase button is disabled when a vehicle is out of stock

**Admins**
- Add, edit and delete vehicles
- Restock a vehicle by a chosen quantity
- Upload, crop, zoom, replace or remove a vehicle photo (JPEG, PNG or WebP, up to 2 MB). A vehicle without a photo shows a default car illustration.
- Admins cannot purchase vehicles

Prices are shown in Indian rupees (₹).

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Node.js, TypeScript, Express |
| Database | PostgreSQL (`pg`, plain SQL) |
| Auth | JWT (`jsonwebtoken`), passwords hashed with `bcryptjs` |
| Uploads | `multer` (in memory), stored in PostgreSQL |
| Backend tests | Jest, Supertest, run against a separate test database |
| Frontend | React (Vite), Tailwind CSS, HTML5, CSS3 |
| Frontend tests | Vitest, React Testing Library |
| CI | GitHub Actions |

## API

Every `/api/vehicles` route needs the header `Authorization: Bearer <token>`, except the photo download. Errors are returned as `{ "error": "message" }`.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register with `email`, `password` and an optional `name` |
| POST | `/api/auth/login` | Public | Returns a JWT |
| GET | `/api/auth/me` | Logged in | Current user (`id`, `role`, `email`, `name`) |
| GET | `/api/vehicles` | Logged in | List all vehicles |
| GET | `/api/vehicles/search` | Logged in | Filter by `make`, `model`, `category`, `minPrice`, `maxPrice` |
| POST | `/api/vehicles` | Admin | Add a vehicle |
| PUT | `/api/vehicles/:id` | Admin | Update a vehicle |
| DELETE | `/api/vehicles/:id` | Admin | Delete a vehicle |
| POST | `/api/vehicles/:id/purchase` | Customer | Buy `quantity` units (default 1) |
| POST | `/api/vehicles/:id/restock` | Admin | Add `quantity` units |
| PUT | `/api/vehicles/:id/image` | Admin | Upload a photo (multipart field `image`) |
| DELETE | `/api/vehicles/:id/image` | Admin | Remove the photo |
| GET | `/api/vehicles/:id/image` | Public | Download the photo (an `<img>` tag cannot send a token) |

Each vehicle has a unique `id`, `make`, `model`, `category`, `price` and `quantity`, plus an optional photo.

The kata marks only delete and restock as admin-only, but it also says the add and update forms are for admin users. So the backend restricts create and update to admins too, not only the UI.

## Run it locally

### Prerequisites
- Node.js 22.12 or newer
- PostgreSQL (tested with 16)
- Git

### 1. Clone
```bash
git clone https://github.com/karthikdevadiga05/car-dealership-inventory.git
cd car-dealership-inventory
```

### 2. Create two databases
In pgAdmin (right-click Databases, then Create) or in `psql`:
```sql
CREATE DATABASE car_dealership;
CREATE DATABASE car_dealership_test;
```

### 3. Backend
```bash
cd backend
npm install
```

Create `backend/.env` for the app and `backend/.env.test` for the tests. Replace `YOUR_PASSWORD` with your PostgreSQL password (URL-encode special characters, for example `@` becomes `%40`).

`backend/.env`
```
PORT=3000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/car_dealership
JWT_SECRET=replace-with-a-long-random-string
```

`backend/.env.test`
```
PORT=3001
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/car_dealership_test
JWT_SECRET=test-secret
```

The tests empty the tables they use, so never point `.env.test` at your real database.

Create the tables, seed an admin and sample vehicles, then start the API:
```bash
npm run migrate
npm run seed
npm run dev
```
The API runs on `http://localhost:3000`.

**Seeded admin (development only):** `admin@dealership.com` / `admin123`. Change it by setting `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `ADMIN_NAME` in `.env` before running `npm run seed`. The sample vehicles are added only when the vehicles table is empty. Anyone who registers through the app gets the customer role.

### 4. Frontend
In a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173`. The frontend calls `http://localhost:3000/api` by default. To use another address, set `VITE_API_URL` in `frontend/.env`.

### 5. Run the tests
```bash
cd backend && npm test               # backend tests (uses car_dealership_test)
cd backend && npm run test:coverage  # backend tests with a coverage report
cd frontend && npm test              # frontend tests
```

## Test report

CI runs the backend tests with coverage against a real PostgreSQL service, then runs the frontend tests and build, on every push.

### Backend: Jest and Supertest on real PostgreSQL

```
PASS tests/vehicles.image.test.ts
PASS tests/vehicles.test.ts
PASS tests/inventory.test.ts
PASS tests/vehicles.edge.test.ts
PASS tests/auth.guard.test.ts
PASS tests/auth.register.test.ts
PASS tests/auth.name.test.ts
PASS tests/auth.login.test.ts
PASS tests/auth.password.test.ts
------------------------|---------|----------|---------|---------|-------------------
File                    | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
------------------------|---------|----------|---------|---------|-------------------
All files               |    97.7 |    88.39 |     100 |   98.49 |
 src                    |     100 |      100 |     100 |     100 |
 src/config             |   85.71 |       50 |     100 |   85.71 |
 src/controllers        |     100 |       50 |     100 |     100 |
 src/db                 |     100 |      100 |     100 |     100 |
 src/errors             |     100 |      100 |     100 |     100 |
 src/middleware         |   94.87 |    81.25 |     100 |   94.87 |
 src/repositories       |     100 |     87.5 |     100 |     100 |
 src/routes             |     100 |      100 |     100 |     100 |
 src/services           |   96.66 |     94.3 |     100 |   98.55 |
------------------------|---------|----------|---------|---------|-------------------

Test Suites: 9 passed, 9 total
Tests:       63 passed, 63 total
```

### Frontend: Vitest and React Testing Library

```
 Test Files  11 passed (11)
      Tests  36 passed (36)
```

## How I used TDD

For each backend feature I wrote a failing test, ran it to see it fail for the right reason, and committed it (`test:`). Then I wrote the minimum code to pass and committed that (`feat:`). The history has 11 such Red then Green pairs, for example:

```
test: add failing tests for admin-only vehicle create and update
feat: restrict vehicle create and update to admins
```

There is also a refactor commit that extracts a shared `asyncHandler` from the controllers (`refactor: extract shared asyncHandler from controllers`).

Where the history is not pure TDD:
- The edge-case commit adds tests for behaviour that already worked (404s, invalid input, search by category and model, password hashing). They passed straight away, and the commit message says so.
- The frontend components were written first and tested afterwards. Several UI features (hero banner, sorting, photo cropping) have little or no test coverage.
- The setup, dependency and CI commits have no test-first step.

## Project structure

```
car-dealership-inventory/
├── .github/workflows/ci.yml     CI: backend tests, frontend tests and build
├── backend/
│   ├── src/
│   │   ├── routes/              URL to controller
│   │   ├── controllers/         HTTP in and out only
│   │   ├── services/            business rules and validation (auth, vehicle, image)
│   │   ├── repositories/        all SQL lives here
│   │   ├── middleware/          auth, admin/customer guards, uploads, error handler
│   │   ├── errors/AppError.ts   error that carries an HTTP status
│   │   ├── db/                  pool, schema.sql, migrate, seed
│   │   ├── app.ts, server.ts
│   └── tests/                   Jest + Supertest suites and helpers
├── frontend/
│   └── src/
│       ├── components/          UI components and their tests
│       ├── api.js               the only place that calls the backend
│       ├── AuthContext.jsx      login state
│       └── ui.js, sortVehicles.js, resizeImage.js, cropImage.js, useTheme.js
├── screenshots/
├── PROMPTS.md
└── README.md
```

Layering: routes, then controllers, then services, then repositories. Controllers never touch SQL, and repositories know nothing about HTTP.

## Design notes

- **Security:** bcrypt password hashing, JWT with a 1 day expiry, parameterised SQL everywhere, role checks on the server, and photo uploads checked by their real file bytes instead of the file name.
- **No overselling:** a purchase is a single atomic `UPDATE ... WHERE quantity >= amount`, so two buyers cannot take the same last unit.
- **Photos in PostgreSQL:** the browser crops or shrinks a photo to a JPEG of at most 1280 px, and the server accepts JPEG, PNG or WebP up to 2 MB and stores it in a `BYTEA` column. This avoids file storage and survives hosts that wipe their disk on redeploy. A cloud object store would suit a large catalogue better. The image URL carries a version number, so browsers can cache it safely.
- **Accessibility:** labelled fields, visible focus rings, dialog roles, and a reduced-motion setting for the hero. I did not run a formal accessibility audit.

## Known limitations and next steps

- No pagination on the vehicle list
- No rate limiting on login and register
- The JWT is kept in `localStorage`; an `httpOnly` cookie would be safer against XSS
- If `JWT_SECRET` is not set, the server falls back to a development value, so always set it in production
- CORS is open to all origins
- Purchases only reduce stock. There is no orders table, payment or order history.
- No password reset or email verification
- An admin can only be created through the seed script or the database
- Frontend tests cover individual components, not whole pages such as the dashboard or the login page

## My AI Usage

### Tools
- **Claude (Anthropic)**, through the claude.ai chat, across several conversations. 

### How I used it
- **Planning:** I asked Claude to turn the kata into a step-by-step plan with a TDD order and a commit roadmap.
- **TDD cycles:** for each feature Claude drafted the failing tests first. I ran them to confirm they failed, committed the Red, then added the implementation Claude drafted and committed the Green.
- **Implementation:** Claude drafted the route, controller, service and repository layers, the JWT and bcrypt handling, the SQL queries, the photo upload, and the React components with their Tailwind styling.
- **Debugging:** I pasted terminal errors and Claude helped diagnose them, for example a TypeScript version that `ts-jest` could not use.
- **CI and docs:** Claude drafted the GitHub Actions workflow and this README.
- **My part:** I chose the features (names and a welcome message, quantity popups, photo upload with a default image, dark mode, details popup, sorting, the hero banner), ran the tests after each step, and checked every change in the browser.

Every commit carries a `Co-authored-by: Claude <noreply@anthropic.com>` trailer, because Claude helped with all of them.

### Where the AI was wrong and I corrected it
- The setup commands installed a TypeScript version that `ts-jest` could not use, so I pinned TypeScript to 5.x.
- In the first version any logged-in user could create and update vehicles through the API, and admins could purchase. I noticed the admin purchase problem, and a review with Claude found the create and update gap. I fixed both with a failing test first.
- The first co-author trailers used the email from the kata's template, which belongs to an unrelated GitHub account. I changed to `noreply@anthropic.com`.
- I found my own committed `.env.example` contained a real database password while preparing this README. I replaced it and changed the password.

### Reflection
AI made the repetitive layers and the test scaffolding much faster, and writing the test first meant I always watched a test fail before trusting new code. It was not reliable on its own: several steps needed corrections after I ran them, and some features I had to ask for because they were not in the first plan. The main things I took away are to run every suite after each step and to read the diff before committing.