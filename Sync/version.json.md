# hatches Versionierung

## Überblick

hatches nutzt ein **inkrementelles Release-System** mit Stages. Je näher eine Version an `stable` ist, desto simpler wird die angezeigte Versionsnummer.

---

## Format

### Vollformat (intern)
```
[Major].[Minor].[Patch].[YYMMDD]-[Stage].[BugfixCount][MiniUpdateCount][WeekTag]
0.0.5.14.23-dev.4g
└┘└┘└──┘└────┘ └──┘ └──┘ └──┘ └──┘
 │  │   │    │     │  │    │    │ └─ WeekTag (a-m = Wochentag So-Sa)
 │  │   │    │     │  │    │    └─ Mini-Update-Zähler
 │  │   │    │     │  │    └─ Bugfix-Zähler an diesem Tag
 │  │   │    │     │  └─ Stage (dev/a/b/pre)
 │  │   │    │     └─ Datum (YYMMDD kurz: 23)
 │  │   │    └─ Patch-Level
 │  │   └─ Minor (Feature-Patch)
 │  └─ Minor
 └──┘└── Major
```

### Anzeigeformate

| Stage | Vollformat | Angezeigt | Angezeigt (simplified) |
|-------|-----------|-----------|--------|
| **dev** | `1.2.5.14.23-dev.4g` | `1.2.5.14.23-dev.4g` | `5.14-dev` |
| **alpha** | `0.5.14.23-a.4g` | `5.14.23-alpha` | `5.14-alpha` |
| **beta** | `0.0.5-b.14a` | `5-beta` | `5-beta` |
| **pre** | `0.0.0-pre.5a` | `pre` | `pre` |
| **stable** | `0.0.05a` | `5.0` | `5.0` |

---

## Zähler-Erklärung

### BugfixCount
Der erste Buchstabe nach dem Stage zählt die **Bugfixes an diesem Tag**:
```
dev.1g = 1 Bugfix heute (g = Samstag)
dev.2g = 2 Bugfixes heute
dev.3g = 3 Bugfixes heute
```

### MiniUpdateCount
Der zweite Buchstabe zählt die **Mini-Updates** (kleine Änderungen ohne neue Features):
```
dev.1g = 1 Mini-Update heute
dev.1h = 2 Mini-Updates heute (neuer Tag, neuer Mini-Fix)
```

### WeekTag (a-m)
Der WeekTag zeigt den **Wochentag** an und läuft **a-m = 13 Wochen**:

```
a = Sonntag     (Woche 1)
b = Montag     (Woche 2)
c = Dienstag   (Woche 3)
d = Mittwoch   (Woche 4)
e = Donnerstag (Woche 5)
f = Freitag    (Woche 6)
g = Samstag    (Woche 7)
h = Sonntag     (Woche 8)
... und so weiter bis Woche 13 (m)
```

Der WeekTag ist vor allem für **Mini-Fixes** relevant und wird nur hochgezählt wenn ein Fix an einem neuen Tag stattfindet.

---

## Stage-Reihenfolge

```
dev → a → b → pre → stable
 │    │   │   │      │
 │    │   │   │      └── Erste stabile Version (z.B. 5.0)
 │    │   │   └── Pre-Release (letzte Tests vor stable)
 │    │   └── Beta (Feature-Set steht, Bugfixing)
 │    └── Alpha (Features locked, am härten)
 └── Development (aktive Entwicklung)
```

---

## Version-Typen

| Typ | Wann | Was passiert |
|-----|------|------------|
| **Bugfix** | Kleine Fixes, Hotfixes | BugfixCount hoch, Mini+WeekTag bleiben |
| **Mini-Update** | Kleine Änderungen ohne neue Features | BugfixCount reset, MiniUpdateCount hoch |
| **Update** | Neue Features | Minor hoch, alle Zähler reset |
| **Release** | Geplant, stable | Stable-Format, stark vereinfacht |

---

## Praxis-Beispiele

### Bugfix am selben Tag
```
0.0.5.14.23-dev.1g  →  0.0.5.14.23-dev.2g  →  0.0.5.14.23-dev.3g
     (1. Bugfix)          (2. Bugfix)           (3. Bugfix)
```

### Mini-Update ( neuer Fix aber kleiner)
```
0.0.5.14.23-dev.1g  →  0.0.5.14.23-dev.1h
                            Bugfix = 1, Mini neu (h = neuer Tag aber Mini-Fix)
```

### Neuer Tag = neuer WeekTag
```
0.0.5.14.23-dev.4g  →  0.0.5.14.24-dev.1a
                            (24 = neuer Tag, a = Sonntag)
```

### Major-Update (neue Features)
```
0.0.5.14.23-dev.4g  →  0.0.5.15.01-dev.1a
                         Minor hoch, alle Zähler reset
```

### Aufstieg in Stage
```
dev → alpha:
0.0.5.14.23-dev.4g  →  0.5.14.23-a.4g
                         Format ändert sich! (kein Datum vorne)
```

### Stable Release
```
0.0.0-pre.5a  →  0.0.05a  →  5.0
                    (vereinfacht)
```

---

## Versionierungsregeln

1. **Bugfix**: BugfixCount `1→2→3` — bleibt in der Woche gleich
2. **Neuer Tag**: WeekTag ändert sich (a→b→c...), BugfixCount reset zu `1`
3. **Mini-Update**: MiniUpdateCount hoch (1→2→3...)
4. **Neue Feature**: Minor hoch, alle Zähler reset → `5.14→5.15`
5. **Stage-Wechsel**: Format ändert sich, erkennbar an der Stage

---

## Warum so detailliert?

- **Intern**: Präzises Tracking: welcher Bugfix, wann, wie oft, welcher Tag
- **Display**: User sehen einfache Versionen (`5.14-dev`)
- **Automatisierbar**: CI/CD kann aus `0.0.5.14.23-dev.4g` direkt den nächsten Build berechnen
- **Historisch**: Jede Version ist eindeutig identifizierbar

---

## Changelog-Vorlage

```markdown
## [5.14.23] - [Datum] - dev
### Bugfixes
- #1 Fix: ...
- #2 Fix: ...

## [5.15.01] - [Datum] - dev
### Features
- Neue Funktion: ...
### Bugfixes
- Fix: ...
```

---

*Letztes Update: 2026-05-14*