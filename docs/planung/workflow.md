# Hatches — Planungs-Workflow

> **Regel: Erst planen, dann coden. Kein Code ohne Plan.**

---

## Der Workflow

```
1. IDEE / ANFORDERUNG
        ↓
2. FEATURE PLAN schreiben  (docs/planung/features/<name>.md)
        ↓
3. KOMPONENTEN planen       (Baum, Props, State)
        ↓
4. API ENDPOINTS definieren (Route, Request, Response)
        ↓
5. DB SCHEMA prüfen         (Prisma änderungen nötig?)
        ↓
6. UI/UX SKIZZE             (ASCII Wireframe)
        ↓
7. REVIEW — macht der Plan Sinn?
        ↓
8. IMPLEMENTIEREN           (in der geplanten Reihenfolge)
        ↓
9. STATUS im Plan updaten   (❌ → ✅)
        ↓
10. VERSION bumpen           (Sync/version.json)
```

---

## Regeln

### Feature-Plan ist Pflicht
Jedes neue Feature bekommt einen Plan in `docs/planung/features/`.  
Kein Feature wird ohne Plan gecodet.

### Komponenten-Plan ist Pflicht
Jede neue Komponente wird im Plan dokumentiert:
- Name & Datei
- Props (mit Typen)
- State (was wird lokal gehalten)
- Was rendert sie?
- Welche API ruft sie auf?

### Status immer aktuell halten
Nach der Implementierung:
- `❌ geplant` → `✅ implementiert`
- Datum + Version eintragen

### Keine spontanen Komponenten
Neue Komponenten die während der Implementierung entstehen,  
werden sofort in den Plan eingetragen (nachdokumentieren).

---

## Status-Definitionen

| Status | Bedeutung |
|--------|-----------|
| `📋 Geplant` | Plan existiert, noch nicht implementiert |
| `🔨 In Arbeit` | Implementierung läuft |
| `✅ Implementiert` | Fertig, getestet |
| `🔄 Überarbeitung` | Muss geändert werden |
| `❌ Verworfen` | Wird nicht gebaut |
| `🔮 Future` | Geplant für spätere Version |

---

## Template

Jeder Feature-Plan folgt dem Template in `docs/planung/template.md`.

---

*Zuletzt aktualisiert: 2026-05-15*
