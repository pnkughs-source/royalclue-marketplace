# Bemady.com API + Website Setup

This package is prepared for your domain:

- Public website: `https://bemady.com`
- API backend: `https://api.bemady.com`
- Admin API prefix: `/api/portal-bemady-9f2a7c`

The public website has no direct admin navigation requirement. The backend admin API is protected by JWT httpOnly cookies, CSRF token, CORS allowlist, rate limits, Helmet, and MongoDB.

## 1. DNS records

Open your domain provider DNS panel and add:

```text
A    @      YOUR_SERVER_IP
A    www    YOUR_SERVER_IP
A    api    YOUR_SERVER_IP
```

## 2. Upload frontend

Upload these public files to your web root:

```text
/var/www/bemady.com/public/
  index.html
  css/
  js/
```

## 3. Upload backend

Upload `backend/` to your server, example:

```text
/var/www/bemady.com/backend/
```

Then run:

```bash
cd /var/www/bemady.com/backend
npm install
cp .env.production.bemady.example .env
```

Edit `.env` and change:

```text
MONGO_URI=your_mongodb_uri
JWT_ACCESS_SECRET=long_random_secret
JWT_REFRESH_SECRET=another_long_random_secret
ADMIN_EMAIL=admin@bemady.com
ADMIN_PASSWORD=your_strong_password
OPTIONAL_ADMIN_2FA_CODE=optional_code
```

Create first admin:

```bash
npm run seed:admin
```

Start API with PM2:

```bash
npm install -g pm2
pm2 start ../deploy/ecosystem.config.js
pm2 save
pm2 startup
```

## 4. Nginx

Copy:

```text
deploy/nginx-bemady.conf
```

to:

```text
/etc/nginx/sites-available/bemady.com
```

Enable it:

```bash
sudo ln -s /etc/nginx/sites-available/bemady.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 5. SSL

Install SSL certificate:

```bash
sudo certbot --nginx -d bemady.com -d www.bemady.com -d api.bemady.com
```

## 6. Test

Open:

```text
https://bemady.com
https://api.bemady.com/health
```

API health should show:

```json
{ "ok": true }
```

## 7. Important security note

Do not keep admin password in frontend. This backend keeps admin credentials in MongoDB and secrets in `.env`.

Do not share your `.env` file.
