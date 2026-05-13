# Security Policy

## ⚠️ Vibe-Coded Project — Please Read First

**Hatches is a vibe-coded project.** It was built rapidly with AI assistance and has not undergone a security audit. You should assume there are security vulnerabilities that have not been identified or fixed.

### Recommended deployment scenarios

| Scenario | Safe? |
|---|---|
| Local machine only (`localhost`) | ✅ Fine |
| Private home/office network (intranet) | ✅ Fine |
| Behind a VPN (e.g. WireGuard, Tailscale) | ✅ Fine |
| Internal tunnel to intranet (Cloudflare Tunnel, ngrok, etc.) | ✅ Fine — as long as access is restricted to trusted users |
| Exposed directly to the public internet | ❌ Do not do this |

The key rule: **as long as only trusted people can reach the instance, you're fine.** Whether that's localhost, a LAN, a VPN, or a tunnel that points to your intranet — all good. The hard line is public exposure.

**Hatches has not been tested for security vulnerabilities.** There is no rate limiting, no brute-force protection on login, and the codebase has not been audited for injection vulnerabilities, CSRF, or other common web security issues. Treat it accordingly.

---

## Supported Versions

Only the latest version (`main` branch) receives any updates.

## Reporting a Vulnerability

**Please do not report security vulnerabilities as public GitHub issues.**

Instead, use GitHub's [Private Vulnerability Reporting](../../security/advisories/new).

We'll typically respond within 48 hours.

## Operational Hardening

Even when running locally or on an intranet, these steps reduce your risk:

- Set `SESSION_SECRET` in `.env` to a long random value (at least 32 characters)
- Keep Hatches behind a reverse proxy with HTTPS if accessible over a network (e.g. nginx, Caddy)
- Back up your database regularly (SQLite: copy the volume, PostgreSQL: `pg_dump`)
- Restrict network access to trusted users only
- Do not store sensitive credentials or production secrets inside Hatches
