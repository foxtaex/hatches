# Feature-Plan: Smart Tables im Markdown-Editor

> **Status:** 📋 Geplant  
> **Priorität:** Nach dem Whiteboard  
> **Modul:** Docs / Markdown-Editor

---

## 1. Vision

Hatches soll Tabellenkalkulationsfunktionen nach dem Vorbild von Excel direkt mit Docs verbinden. Der Einstieg erfolgt über Smart Tables im Markdown-Editor; daraus kann später ein vollständiges Sheets-Modul entstehen.

Markdown bleibt das führende und portable Speicherformat. Beim Wechsel zwischen Quelltext und Smart-Table-Ansicht dürfen keine Daten verloren gehen.

---

## 2. Geplanter Funktionsumfang

- Markdown-Tabellen visuell als Zellenraster bearbeiten
- Zeilen und Spalten hinzufügen, entfernen und verschieben
- Spalten sortieren und filtern
- Zellen per Tastatur und Zwischenablage bearbeiten
- Einfache Formeln: `SUM`, `AVG`, `MIN`, `MAX` und Grundrechenarten
- CSV importieren und exportieren
- Tabelle jederzeit wieder als lesbares GFM-Markdown anzeigen und speichern
- Bestehende Markdown-Tabellen in der Smart-Table-Ansicht öffnen

---

## 3. Ausbaupfad

### Phase 1: Smart Tables in Markdown

- Tabellenraster und Zellnavigation
- Sortieren und Filtern
- einfache Formeln
- CSV-Import und -Export
- verlustfreier Markdown-Roundtrip

### Phase 2: Erweiterte Tabellenkalkulation

- Zelltypen und Formatierung
- Formeln mit Zellbereichen und Referenzen
- Diagramme
- Datenvalidierung und Dropdown-Felder
- Fixieren, Gruppieren und Ausblenden von Bereichen
- `.xlsx`-Import und -Export

### Phase 3: Eigenständiges Sheets-Modul

- mehrere Arbeitsblätter
- Pivot-Tabellen
- Relationen zu Hatches-Docs, Boards und Planner-Daten
- gemeinsame Echtzeitbearbeitung
- Vorlagen für Budgets, Planung, Auswertung und Projektsteuerung
- Automatisierung und KI-gestützte Formeln

Makros oder ausführbare Skripte werden erst nach einem eigenen Sicherheitskonzept geplant.

---

## 4. UX-Konzept

```text
┌────────────────────────────────────────────────┐
│ Tabelle                         [Smart] [Markdown] │
├────────────┬────────────────┬─────────────────┐
│ Aufgabe    │ Aufwand        │ Status          │
├────────────┼────────────────┼─────────────────┤
│ Recherche   │ 4              │ Fertig          │
│ Umsetzung  │ 8              │ Offen           │
├────────────┼────────────────┼─────────────────┤
│ Summe       │ =SUM(B2:B3)    │                 │
└────────────┴────────────────┴─────────────────┘
```

Der Benutzer kann bei einer Markdown-Tabelle zwischen der normalen Markdown-Ansicht und der Smart-Table-Ansicht wechseln.

---

## 5. Datenmodell

- Primärer Inhalt bleibt GFM-Markdown.
- Tabellenwerte werden als normale Markdown-Pipe-Tabelle gespeichert.
- Formeln benötigen eine portable Markdown-Erweiterung, deren Syntax vor der Implementierung festgelegt wird.
- Für die erste Version ist keine neue Prisma-Tabelle vorgesehen.

---

## 6. Implementierungs-Reihenfolge

1. ⬜ Formel- und Metadatenformat definieren
2. ⬜ Markdown-Tabellen sicher parsen und serialisieren
3. ⬜ Smart-Table-Komponente und Zellnavigation bauen
4. ⬜ Zeilen- und Spaltenoperationen ergänzen
5. ⬜ Sortieren und Filtern ergänzen
6. ⬜ einfache Formelauswertung implementieren
7. ⬜ CSV-Import und -Export ergänzen
8. ⬜ Roundtrip-Tests Markdown → Smart Table → Markdown
9. ⬜ Komponenten-Registry, Status und Version aktualisieren
