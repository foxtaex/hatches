# Feature-Plan: Doc-Kommentare und PDF-Export

> **Status:** 📋 Geplant  
> **Priorität:** Nach dem Whiteboard  
> **Modul:** Docs / Markdown-Editor

---

## 1. Vision

Hatches Docs bleibt ein Markdown-basierter Editor. Von klassischen Word-Funktionen werden gezielt nur zwei Funktionen übernommen: Kommentare an Textstellen und der Export eines Dokuments als PDF.

Ein vollständiger Word-Klon, Seitenlayout im Editor und `.docx`-Unterstützung sind nicht vorgesehen.

---

## 2. Kommentare

- Text markieren und einen Kommentar erstellen
- Kommentare einer konkreten Textstelle zuordnen
- Autor, Erstellungszeit und Bearbeitungszeit anzeigen
- Auf Kommentare antworten
- Kommentar als erledigt markieren und wieder öffnen
- Kommentare bearbeiten und löschen
- Erwähnungen von Teammitgliedern vorbereiten
- Rechte für Lesen, Kommentieren und Bearbeiten beachten
- Kommentare getrennt vom Markdown-Inhalt speichern

---

## 3. PDF-Export

- Aktuelles Dokument als PDF exportieren
- Markdown mit Reader-Styles, Tabellen, Bildern und hervorgehobenen Codeblöcken rendern
- Dokumenttitel und optionale Metadaten ausgeben
- Links im PDF anklickbar erhalten
- sinnvolle Seitenumbrüche erzeugen
- helle, druckfreundliche Standarddarstellung verwenden
- Export über einen klaren Button im Docs-Header anbieten

---

## 4. Bewusste Abgrenzung

Nicht geplant sind:

- `.docx`-Import oder -Export
- Word-ähnliche Seitenbearbeitung
- Kopf- und Fußzeilen im Editor
- Serienbriefe
- Word-Makros
- vollständige Änderungsverfolgung

---

## 5. Technische Leitplanken

- Markdown bleibt das führende Dokumentformat.
- Kommentare werden als eigene Datensätze gespeichert und verändern den Markdown-Text nicht.
- Textanker müssen auch nach kleineren Textänderungen möglichst stabil bleiben.
- Der PDF-Export verwendet dieselbe Markdown- und Syntax-Highlighting-Pipeline wie die Vorschau.
- Berechtigungen werden serverseitig geprüft.

---

## 6. Implementierungs-Reihenfolge

1. ⬜ Kommentar-Datenmodell und Textanker festlegen
2. ⬜ Kommentar-API mit Berechtigungsprüfung definieren
3. ⬜ Markierung und Kommentar-Seitenleiste implementieren
4. ⬜ Antworten und Erledigt-Status ergänzen
5. ⬜ PDF-Rendering und Export-Endpunkt implementieren
6. ⬜ PDF-Ausgabe mit Tabellen, Bildern und Codeblöcken testen
7. ⬜ Komponenten-Registry, Status und Version aktualisieren

