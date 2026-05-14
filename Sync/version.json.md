# hatches Versionierung

## Überblick

hatches nutzt ein **inkrementelles Release-System** mit Stages. Je näher eine Version an `stable` ist, desto simpler wird die angezeigte Versionsnummer.

---

## Format

### Vollformat (intern)
```
[Major].[Minor].[Patch].[Date]-[Stage].[Count][Tag]
0.0.5.14.23-dev.4g
└┘└┘└──┘└────┘ └──┘ └┘ └┘ └┘
 │  │   │    │     │  │  │ └─ Tag (Buchstabe: a=1st, b=2nd...)
 │  │   │    │     │  │  └─ Count (Iterationszähler)
 │  │   │    │     │  └─ Stage (dev/a/b/pre/stable)
 │  │   │    │     └─ Datum (YYMMDD)
 │  │   │    └─ Feature-Patch (Feature.MinorPatch)
 │  │   └─ Minor (Hauptversionsnummer)
 └──┘└──┘└── Minor (Major = 0 bis stable)
```

### Anzeigeformat (öffentlich)

| Stage | Vollformat | Angezeigt |
|-------|-----------|----------|
| **dev** | `0.0.5.14.23-dev.4g` | `5.14-dev` |
| **alpha** | `0.5.14.23-a.4g` | `5.14-alpha` |
| **beta** | `0.0.5-b.14a` | `5-beta` |
| **pre** | `0.0.0-pre.5a` | `pre` |
| **stable** | `0.0.05a` | `5.0` |

**Je näher an stable, desto kürzer** — das ist gewollt.

---

## Stage-Reihenfolge

```
dev → a → b → pre → stable
 │    │   │   │      │
 │    │   │   │      └── Erste stabile Version (z.B. 5.0)
 │    │   │   └── Pre-Release (letzte Tests vor stable)
 │    │   └── Beta (Feature-Set steht, Bugfixing)
 │    └── Alpha (Features locked, am härten)
 └── Development (aktive Entwicklung, API kann ändern)
```

---

## Stage-Erklärung

| Stage | Bedeutung |
|-------|----------|
| **dev** | Aktive Entwicklung. API und Features können sich jederzeit ändern. |
| **a (alpha)** | Feature-Set ist locked. Härtung und Stabilisierung. |
| **b (beta)** | Keine neuen Features mehr. Nur noch Bugfixes. |
| **pre** | Fast stable. Letzte Tests, finale Polierung. |
| **stable** | Produktionsreif. Wird nur noch bei kritischen Bugs geupdated. |

---

## Count & Tag

Der Count `[Count][Tag]` zählt die Iteration innerhalb einer Stage:

- **Tag**: Buchstabe `a, b, c, d, e...` = 1., 2., 3., 4., 5. Iteration
- **Count**: Zahl hinter dem Tag = wie oft der gleiche Tag wiederholt wurde

```
0.0.5.14.23-dev.4g
                    └──┘
                     Tag = g = 7. Iteration
                     Count = 4 = 4. Mal der g-Tag verwendet
```

Beispiel-Aufstieg:
```
0.0.5.14.23-dev.1g  →  0.0.5.14.23-dev.2g  →  0.0.5.14.23-dev.3g
                         (2. Mal g)              (3. Mal g)
```

---

## Major.Minor.Patch

```
0.0.5.14
└┘└──┘└──┘
 │   │   └─ Patch (Bugfixes, kleine Änderungen)
 │   └─ Minor (neue Features)
 └─ Major (0 = pre-stable, 1+ = stable)
```

Bis zur ersten stable Version ist `Major = 0`. Erst wenn wir stable erreichen wird `Major` auf `1` (oder höher) gesetzt.

---

## Praxis-Beispiele

### Release einer neuen Feature-Version
```
Aktuell:   0.0.5.14.23-dev.4g (5.14-dev)
Ziel:      0.0.5.15.01-dev.1a (5.15-dev)
```
Minor erhöht sich (5.14 → 5.15), Count+Tag resetten.

### Aufstieg in Stage
```
dev → alpha:
Aktuell:   0.0.5.14.23-dev.4g  (5.14-dev)
Alpha:     0.5.14.23-a.4g       (5.14-alpha)
```
Stage ändert sich, Tag bleibt gleich.

### Stable Release
```
Pre:       0.0.0-pre.5a  (pre)
Stable:    0.0.05a       (5.0)
```
Das Format schrumpft drastisch — nur noch `[Major].[Minor]`.

---

## Warum so komplex?

1. **Intern**: Präzises Tracking aller Iterationen, Datums, Stages
2. **Extern**: Einfache, lesbare Versionen für User (`5.14-dev` statt `0.0.5.14.23-dev.4g`)
3. **Automatisierbar**: Git tags, CI/CD, Changelogs können das volle Format nutzen
4. **Historisch**: Jede Version ist eindeutig identifizierbar

---

## Verwendung in Code

```typescript
// version.json auslesen
const version = require('./version.json');

// Display für User
console.log(version.current_display); // "5.14-dev"

// Intern für Vergleiche
console.log(version.current); // "0.0.5.14.23-dev.4g"

// Stage prüfen
const stage = version.releases[version.current].stage; // "dev"
```

---

## Changelog-Regel

- **Neue Feature-Minor**: Zähler hoch (`5.14` → `5.15`)
- **Bugfix-Patch**: Patch hoch (`5.14.23` → `5.14.24`)
- **Stage-Wechsel**: Tag bleibt, Stage ändert sich
- **Stable**: Major hoch, alles andere reset

---

*Letztes Update: 2026-05-14*