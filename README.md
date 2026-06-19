# Sanji's All Blue Restaurant

A web application for the legendary Grand Line restaurant, Sanji's All Blue, allowing users to browse thematic menus from the four seas, place orders, track deliveries in real time, and leave verified customer reviews.

## Run & Operate (Windows)

To start the application on Windows, you can use either the automatic startup script or run the commands manually.

### Option 1: Automatic Startup (Recommended)
Double-click the `start.bat` file in File Explorer, or run it in your terminal:
```powershell
.\start.bat
```
This automatically starts both the frontend and backend servers in separate command windows.

### Option 2: Running in VS Code Terminal
1. Open the terminal panel in VS Code with **`Ctrl + \``**.
2. Run the **API Server** in the first terminal tab:
   ```powershell
   npx pnpm@9 --filter @workspace/api-server run start
   ```
3. Open a second terminal tab (click the **`+`** icon) and run the **Frontend**:
   ```powershell
   npx pnpm@9 --filter @workspace/all-blue run dev
   ```

Once both servers are running, open **`http://localhost:5173`** in your browser.

### Other Useful Commands
Since `pnpm` is not installed globally on this machine, always use `npx pnpm@9`:
- `npx pnpm@9 run typecheck` — full typecheck across all packages
- `npx pnpm@9 run build` — typecheck + build all packages
- `npx pnpm@9 --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `npx pnpm@9 --filter @workspace/db run push` — push PostgreSQL DB schema changes to the Neon database
- **Database:** PostgreSQL (hosted on Neon)

## Stack

- **Package Manager & Workspaces:** pnpm workspaces, Node.js 20+, TypeScript 5.9
- **Frontend:** React, Vite, Tailwind CSS, Shadcn UI
- **API Server:** Express 5
- **Database:** PostgreSQL (Neon Cloud) + Drizzle ORM
- **Validation:** Zod (`zod/v4`), `drizzle-zod`
- **API Codegen:** Orval (automatically generated from OpenAPI specs)
- **Build Tooling:** esbuild (CJS/ESM bundling)


## Architecture decisions

- **PostgreSQL Database:** Migrated from SQLite to a PostgreSQL architecture hosted on Neon to ensure high availability, data persistence, and cloud deployment compatibility.
- **Verified Reviews Flow (Industry Best Practice):** Changed the reviews model from public submissions to order-linked reviews. Reviews can only be submitted for verified, delivered orders belonging to the logged-in user, preventing review spam and duplicate feedback.
- **Testimonials Feed:** The main Reviews page renders a read-only testimonials feed and directs registered users to the Track Orders page to leave validated reviews.
- **Instant Client Cache Invalidation:** Uses TanStack React Query to invalidate and re-fetch review queries instantly upon form submission, offering an updated UX immediately.

## Product Capabilities

- **Seas Themed Menus:** Interactive menu cards showing legendary items from the North Blue, East Blue, South Blue, and West Blue.
- **Live Order Tracking:** Users can track their active orders in real time. Order progress states (Pending, Preparing, Out for Delivery, Delivered) are animated with custom Lottie animations.
- **Verified Order Reviews:** Allows users to leave an inline star rating (1-5 stars) and a textual comment directly on their delivered orders.
- **Order History:** A collapsible past transaction list showing details, order item breakdowns, total cost, and specific kitchen comments.

## Gotchas

- **DB Push:** Always run `npx pnpm@9 --filter @workspace/db run push` after editing database schemas in `lib/db/src/schema` to ensure the live Neon database schema is synchronized.
- **Spec Updates:** If you change any endpoint logic or spec contracts in `lib/api-spec/`, run `npx pnpm@9 --filter @workspace/api-spec run codegen` to regenerate the typed queries and schemas.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
