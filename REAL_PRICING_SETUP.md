# Real Pricing Setup

This build is no longer using demo pricing text. Products now follow your requested formula:

- **Market / real price** = full price from live search/API or manual admin input
- **Single price** = 50% of market price
- **Resell/Bulk price** = 30% of market price, meaning 70% less than market

Example: if market price is `$2`, Single becomes `$1`. If market price is `$10`, Resell/Bulk becomes `$3`.

## Use it manually

1. Open `admin.html`.
2. Go to **Products**.
3. Put the real price in the **Market** field.
4. Click **Recalc** for one product, or **Apply 50% / 30%** for all products.
5. The main store updates from localStorage/live sync.

## Use live Google/market sync

Direct browser scraping of Google is unreliable and can be blocked. This build supports a real API-based sync through the backend.

1. Open `backend/.env` and add:

```env
SERPAPI_KEY=your_serpapi_key_here
ADMIN_PASSWORD=admin123
```

2. Start the backend:

```bash
cd backend
npm install
npm start
```

3. Open `admin.html` and click **Sync live prices**.
4. Enter your backend admin password.
5. The backend searches live market results, updates `marketPrice`, then auto-applies the 50% / 30% rules.

If no live price is found for a product, the admin can still enter the Market value manually and click Recalc.


## Unauthorized fix
The admin panel default password and backend password are now aligned. Default password: `mind`. You can still change it in `backend/.env` using `ADMIN_PASSWORD=yourpassword`. After changing `.env`, restart the backend.
