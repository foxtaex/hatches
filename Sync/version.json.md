# hatches Versionierung

## Überblick

hatches nutzt ein **inkrementelles Release-System** mit Stages. Je näher eine Version an `stable` ist, desto simpler wird die angezeigte Versionsnummer.

---

## Format

### Vollformat (intern)
```
[Major].[Minor].[Patch].[YYMMDD]-[Stage].[Count][WeekTag]
0.0.5.14.23-dev.4g
└┘└┘└──┘└────┘ └──┘ └┘ └┘ └┘
 │  │   │    │     │  │  │ └─ WeekTag (a-m = 13 Wochen, nur bei Mini-Fixes)
 │  │   │    │     │  │  └─ Count (Iterationszähler)
 │  │   │    │     │  └─ Stage (dev/a/b/pre)
 │  │   │    │     └─ Datum (YYMMDD, kurz: YY oder 23)
 │  │   │    └─ Feature-Patch (Feature.MinorPatch)
 │  │   └─ Patch
 │  └─ Minor (neue Features)
 └──┘└── Major (0 = pre-stable, 1+ = stable)
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
 └── Development (aktive Entwicklung)
```

---

## Count & WeekTag

### Count
Iterationszähler — wie oft diese Version gebaut/getestet wurde.

### WeekTag (a-m)
Der WeekTag läuft von **a bis m (13 Wochen)** — aber **nur bei Mini-Fixes** (Bugfix-Releases innerhalb einer Woche):

```
Woche 1:  a
Woche 2:  b
Woche 3:  c
...
Woche 13: m
(Woche 14: zurück zu a)
```

Bei **Major-Updates** (neue Features) wird der WeekTag zurückgesetzt.

---

## Datums-Praxis

Das Datum im Format ist das **Tagesdatum** beim Bauen:
- `23` = YY (z.B. 2023) oder YYMMDD kurz (z.B. 23.05.14. → 23)

---

## Stage-Erklärung

| Stage | Bedeutung |
|-------|----------|
| **dev** | Aktive Entwicklung. API und Features können sich ändern. |
| **a (alpha)** | Feature-Set ist locked. Härtung und Stabilisierung. |
| **b (beta)** | Keine neuen Features mehr. Nur noch Bugfixes. |
| **pre** | Fast stable. Letzte Tests, finale Polierung. |
| **stable** | Produktionsreif. |

---

## Versions-Typen

| Typ | Wann | Beispiel |
|-----|------|---------|
| **Bugfix** | Kleine Fixes, Mini-Updates | `0.0.5.14.23-dev.4g` mit WeekTag a-m |
| **Mini-Update** | Kleine Änderungen | `0.0.5.14.23-dev.4g` Count hoch |
| **Update** | Neue Features | Minor hoch → `5.15` |
| **Release** | Geplant, stable | Stable-Format → `5.0` |

---

## Praxis-Beispiele

### Bugfix innerhalb einer Woche
```
Montag:     0.0.5.14.23-dev.1g    (1. Bugfix der Woche)
Dienstag:   0.0.5.14.23-dev.2g    (2. Bugfix)
Mittwoch:   0.0.5.14.23-dev.3g    (3. Bugfix)
...
(Same weekTag so lange in derselben Woche)
```

### Mini-Update (ohne neue Features)
```
0.0.5.14.23-dev.1g  →  0.0.5.14.23-dev.1h
                         Count gleich, WeekTag hoch (neuer Tag)
```

### Major-Update (neue Features)
```
0.0.5.14.23-dev.4g  →  0.0.5.15.01-dev.1a
                         Minor hoch (5.14 → 5.15), Count+WeekTag reset
```

### Aufstieg in Stage
```
dev → alpha:
0.0.5.14.23-dev.4g  →  0.5.14.23-a.4g
                         Format ändert sich!
```

---

## Versionierungregeln

1. **Neue Feature-Version**: Minor hoch, Count+WeekTag reset → `5.14` → `5.15`
2. **Bugfix im selben Minor**: Count oder WeekTag hoch
3. **Stage-Wechsel**: Stage ändert sich, Rest bleibt wenn möglich
4. **Stable Release**: Major hoch, alles andere minimal → `0.0.05a` → `5.0`

---

## Changelog-Regel

```
[Major.Minor.Patch] - [Datum] - [Stage]
```

Beispiel:
```
## [5.14] - 26.06.23 - dev
### Features
- Docs: View Mode Toggle
### Bugfixes
- Fix: Editor toggle funktioniert nicht

## [5.13] - 20.06.23 - dev
...
```

---

*Letztes Update: 2026-05-14*