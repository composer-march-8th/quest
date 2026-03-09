# Cloudflare Worker API for certificates

This Worker provides two endpoints:

- `POST /validate` -> `{ allowed: boolean }`
- `POST /certificate` -> `{ promoCode: string }` for allowed users

## 1) Install Wrangler

```bash
npm i -g wrangler
```

## 2) Login

```bash
wrangler login
```

## 3) Set secret map with real certificates

Run in the `worker` folder:

```bash
wrangler secret put CERTIFICATES_JSON
```

Paste JSON like:

```json
{
  "@test": "PROMO-MARCH8-PLACEHOLDER",
  "@realuser1": "CERT-REAL-001",
  "@realuser2": "CERT-REAL-002"
}
```

## 4) Deploy

```bash
wrangler deploy
```

After deploy you will get URL like:

`https://quest-certificates-api.<subdomain>.workers.dev`

## 5) Connect SPA

In project root create `.env.local`:

```bash
VITE_CERT_API_URL=https://quest-certificates-api.<subdomain>.workers.dev
```

Restart dev server after changing env.
