# hatches Versionierung

## Vollformat (intern)

```
[Major].[Minor].[Patch].[YYMMDD]-[Stage].[BugfixCount][MiniUpdateCount][WeekTag]
0.0.5.14.23-dev.4g
└┘└┘└──┘└────┘ └──┘ └──┘ └──┘ └──┘
 │  │   │    │     │  │    │    │ └─ WeekTag = Wochentag So-Sa (0-6)
 │  │   │    │     │  │    │    └─ MiniUpdateCount = wievieltes Mini-Update
 │  │   │    │     │  │    └─ BugfixCount = wievielter Bugfix heute
 │  │   │    │     │  └─ Stage (dev/a/b/pre/stable)
 │  │   │    │     └─ Datum (YYMMDD kurz)
 │  │   │    └─ Patch-Level
 │  │   └─ Minor (Feature-Patch)
 │  └─ Minor
 └──┘└── Major
```

---

## Anzeigeformat (öffentlich)

| Stage | Intern | Angezeigt |
|-------|--------|-----------|
| **dev** | `0.0.5.14.23-dev.4g` | `5.14.23-dev.4g` |
| **dev (full)** | `1.2.5.14.23-dev.4g` | `1.2.5.14.23-dev.4g` |
| **beta** | `1.2.5.14.23-b.0a` | `1.2.5-b.0a` |
| **pre** | `0.0.0-pre.5a` | `pre` |
| **stable** | `1.2.5` | `1.2.5` |

---

## WeekTag = Wochentag (0-6)

```
a = Sonntag = 0
b = Montag  = 1
c = Dienstag = 2
d = Mittwoch = 3
e = Donnerstag = 4
f = Freitag = 5
g = Samstag = 6
```

---

## Week = Woche im Quartal (a-m = 1-13)

Nur relevant bei **Mini-Fixes** — zählt die Woche im Quartal:

```
a = Woche 1
b = Woche 2
c = Woche 3
...
m = Woche 13
```

---

## Zähler-Erklärung

### BugfixCount
Wievielter Bugfix heute (gleicher Tag = gleicher BugfixCount):
```
dev.1g = 1. Bugfix heute
dev.2g = 2. Bugfix heute
dev.3g = 3. Bugfix heute
```

### MiniUpdateCount
Wievieltes Mini-Update seit dem letzten Bugfix:
```
dev.1g = 1. Mini-Update heute
dev.1h = 2. Mini-Update (h = neuer Tag oder neuer Mini-Fix)
```

---

## Version-Typen

| Typ | Wann | Zähler |
|-----|------|--------|
| **Bugfix** | Kleine Fixes | BugfixCount `1→2→3` |
| **Mini-Update** | Kleine Änderungen ohne neue Features | MiniUpdateCount hoch |
| **Update** | Neue Features | Minor hoch, alle Zähler reset |
| **Release** | Stable | Stark vereinfacht |

---

## Stage-Reihenfolge

```
dev → a → b → pre → stable
 │    │   │   │      │
 │    │   │   │      └── Erste stabile Version
 │    │   │   └── Pre-Release
 │    │   └── Beta (Bugfixing)
 │    └── Alpha (Härtung)
 └── Development
```

---

## Praxis-Beispiele

### Bugfix am selben Tag
```
0.0.5.14.23-dev.1g → 0.0.5.14.23-dev.2g → 0.0.5.14.23-dev.3g
     (1. Bugfix)          (2. Bugfix)           (3. Bugfix)
```

### Mini-Update (neuer Tag)
```
0.0.5.14.23-dev.1g → 0.0.5.14.24-dev.1a
                          (neuer Tag = 24, BugfixCount reset)
```

### Neue Feature (Minor hoch)
```
0.0.5.14.23-dev.4g → 0.0.5.15.01-dev.1a
                         Minor hoch, alles reset
```

### Aufstieg in Stage (dev → beta)
```
0.0.5.14.23-dev.4g → 1.2.5-b.0a
                        Format ändert sich!
```

### Stable Release
```
1.2.5-b.0a → 1.2.5
```

---

## Versionierungsregeln

1. **Bugfix**: BugfixCount `1→2→3`, MiniUpdateCount bleibt
2. **Neuer Tag**: BugfixCount reset, WeekTag ändert sich (a→b→c...)
3. **Mini-Update**: MiniUpdateCount hoch (a→b→c... für neue Mini-Fixes)
4. **Neue Feature**: Minor hoch, alle Zähler reset
5. **Stage-Wechsel**: Format wird simpler (dev → beta → pre → stable)

---

*Letztes Update: 2026-05-14*