# Security Policy

## Supported Versions

Aktuell wird nur die neueste Version (`main`-Branch) mit Sicherheitsupdates versorgt.

## Sicherheitslücke melden

**Bitte keine Sicherheitslücken als öffentliches GitHub Issue melden.**

Stattdessen: GitHub's [Private Vulnerability Reporting](../../security/advisories/new) nutzen.

Wir melden uns in der Regel innerhalb von 48 Stunden.

## Hinweise für den Betrieb

- `SESSION_SECRET` in `.env` auf einen langen Zufallswert setzen (mind. 32 Zeichen)
- Die App sollte **nicht** direkt ohne Reverse-Proxy im Internet erreichbar sein
- Empfohlener Stack: nginx / Caddy als Reverse-Proxy mit HTTPS
- Datenbank-Backups regelmäßig erstellen (SQLite: Volume-Backup, PostgreSQL: `pg_dump`)
