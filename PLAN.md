# Hymui – Neustartplan

## 1. Ziel

Hymui wird als local-first, AI-first Projektplanungstool für beliebige
Projekte neu aufgebaut. Menschen planen persönliche, kreative, organisatorische
und technische Projekte gemeinsam mit spezialisierten AI Agents. Boards, Docs,
Planner, optionale Integrationen und Agents sind Teile eines gemeinsamen
Projektmodells und keine getrennten Produkte.

Software- und Webentwicklung ist das erste umfangreiche Vorlagen- und
Agent-Paket, aber keine Grenze des Core-Produkts. Ein Projekt muss ohne
Repository, Programmcode oder technische Begriffe vollständig funktionieren.

Eine gemeinsame Codebasis liefert drei gleichwertige Editionen:

| Edition | Zweck | Datenbank | Dateispeicher | Betrieb |
| --- | --- | --- | --- | --- |
| Local | Persönlich, offline und ohne Serverkenntnisse | PGlite | Lokales Dateisystem | Docker-freier lokaler Start |
| Self-hosted | Teams auf eigener Infrastruktur | PostgreSQL, MySQL, MariaDB oder experimentell MSSQL | Lokales Dateisystem oder S3-kompatibel | Getrennte Frontend-, API- und Worker-Dienste |
| Hosted | Von Hymui betriebener Dienst | Verwaltetes PostgreSQL | Verwalteter S3-kompatibler Speicher | Getrennte skalierbare Dienste mit automatischem Betrieb |

Alle Editionen verwenden dieselben Fachmodule, dieselbe API und dasselbe
Oberflächenverhalten. Editionen dürfen nicht als getrennte Forks entstehen.

## 2. Verbindliche technische Entscheidungen

- Frontend: Nuxt 4 mit Vue 3 und TypeScript als eigenständig deploybare
  Client-Anwendung; die Hymui-App wird ohne fachliche SSR- oder
  Serverlogik gebaut
- Eine Web-App für alle Editionen: Hosted, Self-hosted und Local verwenden
  denselben Frontend-Build und dieselben Browser-Routen
- Backend: Fastify mit TypeScript als eigenständige, versionierte API
- Hintergrundarbeit: separater Worker für Agents, Imports, Exporte,
  Bildverarbeitung und andere lange Aufgaben
- Kein Astro
- Keine Nuxt/Nitro Server Routes für Fachlogik oder Datenzugriff
- Der Frontend-Build besteht aus unabhängig auslieferbaren statischen Assets;
  eine spätere öffentliche Marketingseite ist davon getrennt
- API-Vertrag: `/api/v1`, typisierte Schemas und ein generierter
  Frontend-Client
- Datenzugriff: Drizzle ORM hinter einer eigenen Repository-Schicht
- Local-Datenbank: PGlite mit persistenter Speicherung
- Server-Datenbanken: PostgreSQL, MySQL, MariaDB und experimentell MSSQL
- Dateiablage: austauschbare Treiber für lokales Dateisystem und S3-kompatible
  Objektspeicher
- Styling: SCSS in eigenständigen `.scss`-Dateien; keine CSS-Regeln in
  TypeScript- oder Vue-Dateien
- Kein Tailwind, kein CSS-in-JS, keine Inline-Styles und keine
  Utility-Class-Sammlung als Ersatz für semantische Komponentenstyles
- Styling: eigenes kleines Designsystem mit konsistenten Popovers, Dropdowns,
  Dialogen, Formularen und Tastatursteuerung
- UI-Architektur: wiederverwendbare, zusammensetzbare Komponenten nach einem
  verbindlichen Baukastenprinzip; keine kopierten Controls oder Navigationen
- Erweiterbarkeit: stabile Extension Points und ein versionierter Plugin-Vertrag
  werden von Tag 1 mitgedacht, auch wenn externe Plugins erst später aktiviert
  werden
- AI Agents: eine providerneutrale Agent-Runtime, kontrollierte Tools,
  Freigaben, Budgets und Audit-Logs gehören ab Tag 1 zum Core
- Optionale Repository-Anbindung: lokale Git-Repositories und externe
  Git-Anbieter werden für Entwicklungsprojekte hinter einem gemeinsamen
  RepositoryPort integriert
- Identität und Föderation: Accounts gehören ihrer Heimatinstanz; Self-hosted
  benötigt keinen zentralen Hymui-Account. Instanzen können über ein
  versioniertes, ActivityPub-orientiertes Hymui-Profil zusammenarbeiten
- Sprachen ab dem ersten Bildschirm: Deutsch und Englisch; keine fest
  eingebauten UI-Texte außerhalb des Übersetzungssystems
- Tests: Unit-, Contract-, Integrations- und Browser-Tests
- Releasepakete: Docker-Images für amd64 und arm64 sowie eine dockerfreie
  Local-/Desktop-Distribution zuerst für macOS und Linux
- Windows wird vollständig als Web-Client unterstützt; die installierbare
  Windows-Local-/Desktop-Ausgabe folgt nach dem ersten Release

Der lokale Paketierungsweg wird in einem technischen Prototyp validiert, bevor
Produktfunktionen implementiert werden. Der Prototyp muss Start, Update,
persistente PGlite-Daten, lokale Uploads und Backup/Wiederherstellung auf allen
zunächst auf macOS und Linux beweisen. Die Oberfläche bleibt dabei immer
dieselbe Hymui-Web-App – im Browser oder in der Desktop-Shell.

## 3. Architektur

```text
Nuxt Frontend
    |
    | HTTPS: /api/v1 + Events
    v
Fastify Backend API
    |
    v
Hymui Core
    |-- Identity and permissions
    |-- Projects
    |-- Boards and cards
    |-- Docs
    |-- Planner
    |-- Search
    |-- Import and export
    |-- Agent runs and approvals
    |
    +-- AgentRuntime
    |     |-- ModelProviderPort
    |     |-- AgentToolRegistry
    |     |-- ApprovalPolicy
    |     `-- RunQueue
    |             |
    |             v
    |        Agent Worker
    |
    +-- RepositoryPort
    |     |-- Local Git adapter
    |     `-- Hosted Git adapter
    |
    +-- FederationPort
    |     |-- Actor discovery
    |     |-- Signed inbox/outbox delivery
    |     |-- Remote membership
    |     `-- Instance trust policy
    |
    +-- DatabasePort
    |     |-- PGlite/PostgreSQL adapter
    |     |-- MySQL adapter
    |     |-- MariaDB adapter
    |     `-- MSSQL adapter
    |
    `-- StoragePort
          |-- Local filesystem adapter
          `-- S3-compatible adapter
```

Die UI greift in jeder Edition ausschließlich über die versionierte Hymui-API
auf Daten zu. Datenbank-, Speicher-, Modellanbieter-, Repository- und
Editionsdetails dürfen nicht in Vue-Komponenten gelangen.

Frontend und Backend werden auch in einem Monorepo als getrennte Anwendungen
behandelt:

- Das Frontend importiert keinen Datenbankadapter und keinen Backend-Service.
- Das Backend importiert keine Vue-Komponente und kein Frontend-SCSS.
- Nur API-Verträge, der generierte API-Client und bewusst gemeinsame
  primitive Typen dürfen die Grenze überschreiten.
- Der Worker verwendet Core-Services und Ports, bietet aber keine
  Browser-Endpunkte an.
- Local startet die getrennten Teile gemeinsam, um eine einfache Installation
  zu bieten; die Kommunikation läuft trotzdem über dieselbe API.

Für Self-hosted und Hosted werden Frontend, Backend und Worker getrennt gebaut,
versioniert, überwacht und skaliert. Ein Reverse Proxy kann sie unter einer
gemeinsamen Origin bereitstellen:

```text
/             -> Frontend
/api/v1/*     -> Backend
/events/*     -> Backend-Realtime
```

Dadurch sind im Normalbetrieb keine weit geöffneten CORS-Regeln notwendig.

Die identische Web-App läuft je Edition unter unterschiedlichen Ursprüngen:

```text
Local         http://127.0.0.1:<port>
Self-hosted   https://hymui.example.org
Hosted       https://app.hymui.example
```

API-Basis, Event-Endpunkt und öffentliche Basis-URL werden zur Laufzeit
konfiguriert. Im Frontend werden keine editionsspezifischen URLs eingebaut.

Vorgeschlagene Repository-Struktur:

```text
apps/
  frontend/               Nuxt-Anwendung ohne Datenbankzugriff
  backend/                Fastify-API
  worker/                 Agent- und Hintergrundaufgaben
  local/                  lokaler Browser-Starter und Proxy
  desktop/                Desktop-Shell und Paketierung für macOS/Linux
packages/
  api-contracts/          versionierte Request-, Response- und Event-Schemas
  api-client/             generierter Client für das Frontend
  core/                   Fachlogik ohne Framework- oder Datenbankabhängigkeit
  agent-runtime/          Runs, Tools, Freigaben, Budgets und Ereignisse
  model-providers/        austauschbare AI-Modelladapter
  repository-connectors/  lokales Git und externe Git-Anbieter
  federation/             Actors, Discovery, Inbox/Outbox und Trust Policy
  database/
    contracts/            Repository-Schnittstellen und Contract-Tests
    postgres/             PGlite/PostgreSQL-Schema und Migrationen
    mysql/                MySQL/MariaDB-Schema und Migrationen
    mssql/                Microsoft-SQL-Server-Schema und Migrationen
  storage/
    local/
    s3/
  ui/                     Designsystem mit Vue-Komponenten und getrenntem SCSS
  plugin-sdk/             Typen, Manifest, Berechtigungen und Extension Points
  i18n/                   Übersetzungen und Locale-Werkzeuge
  import-export/          portables Hymui-Archivformat
```

## 4. Datenbankunterstützung

### 4.1 Unterstützte Anbieter

- PGlite für Local
- PostgreSQL für Self-hosted und Hosted
- MySQL für Self-hosted
- MariaDB für Self-hosted
- Microsoft SQL Server für Self-hosted, zunächst mit dem Status
  `experimental`

PostgreSQL ist die Hosted-Referenz, aber die Fachlogik darf keine
PostgreSQL-Abhängigkeit besitzen. MSSQL wird erst nach bestandener vollständiger
Contract-, Migrations-, Import- und Langzeittestmatrix von `experimental` auf
`supported` hochgestuft. Die konkret unterstützten Datenbankversionen werden in
`SUPPORT.md` festgeschrieben und nur nach erfolgreichen Migrationstests
geändert.

### 4.2 Portables Datenmodell

- IDs werden in der Anwendung erzeugt und als ULID gespeichert.
- Zeitpunkte werden in UTC gespeichert.
- Geld-, Datums- und Sortierwerte erhalten explizite portable Formate.
- Keine PostgreSQL-Arrays oder datenbankspezifischen Enums im Core-Schema.
- JSON wird nur für unkritische Metadaten verwendet. Beziehungen und
  Berechtigungen bleiben normalisierte Tabellen.
- MySQL und MariaDB verwenden ausschließlich InnoDB-Tabellen mit
  Fremdschlüsseln.
- Das portable Core-Modell setzt keinen nativen JSON-Datentyp voraus, da MSSQL
  JSON-Daten als Text behandelt.
- Eindeutige optionale Werte werden nicht allein über datenbankspezifische
  `NULL`-Semantik abgesichert.
- Karten- und Spaltensortierung verwendet einen portablen Rangwert, damit
  Verschieben nicht ständig komplette Listen neu nummeriert.
- Jede Änderung, die mehrere Datensätze betrifft, läuft in einer Transaktion.

### 4.3 Getrennte Migrationen

PostgreSQL/PGlite, MySQL/MariaDB und MSSQL erhalten getrennte, versionierte
SQL-Migrationen. Eine Migration gilt erst als fertig, wenn sie:

1. auf einer leeren Datenbank funktioniert,
2. von jeder unterstützten vorherigen Hymui-Version aktualisiert,
3. bei wiederholtem Start keinen Schaden verursacht,
4. gegen PostgreSQL, MySQL, MariaDB und bei MSSQL-relevanten Änderungen auch
   Microsoft SQL Server getestet wurde,
5. Datenexport und Wiederherstellung nicht beschädigt.

### 4.4 Datenbankkonfiguration

```env
HATCHES_EDITION=local
DATABASE_PROVIDER=pglite
DATABASE_URL=./data/database
```

```env
HATCHES_EDITION=self_hosted
DATABASE_PROVIDER=postgresql
DATABASE_URL=postgresql://...
```

```env
HATCHES_EDITION=self_hosted
DATABASE_PROVIDER=mysql
DATABASE_URL=mysql://...
```

```env
HATCHES_EDITION=self_hosted
DATABASE_PROVIDER=mariadb
DATABASE_URL=mysql://...
```

```env
HATCHES_EDITION=self_hosted
DATABASE_PROVIDER=mssql
DATABASE_URL="sqlserver://host:1433;database=hymui;user=...;password=...;encrypt=true"
```

Zugangsdaten sind ausschließlich Server-Secrets. Sie werden nicht an den
Browser ausgeliefert und nicht in normalen Hymui-Einstellungen bearbeitet.

## 5. Datei- und Objektspeicher

Die Datenbank enthält Metadaten, Berechtigungen und Referenzen. Binärdateien
werden getrennt gespeichert:

- Profilbilder
- Bilder in Markdown-Dokumenten
- Karten- und Dokumentanhänge
- Projektarchive
- verschlüsselte Backups

Unterstützte Treiber:

```env
STORAGE_DRIVER=local
STORAGE_PATH=./data/uploads
```

```env
STORAGE_DRIVER=s3
S3_ENDPOINT=https://...
S3_REGION=...
S3_BUCKET=...
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
```

Der S3-Treiber darf nicht an AWS gebunden sein. Self-hosted muss unter anderem
mit standardkonformen S3-Diensten und MinIO testbar sein. Buckets sind privat;
Zugriffe erfolgen über die Hymui-API oder kurzlebige signierte URLs.

Uploads benötigen Größenlimits, MIME-Prüfung, sichere Dateinamen, Prüfsummen,
atomare Speicherung und eine Berechtigungsprüfung bei jedem Abruf.

## 6. Editionen

### 6.1 Local

- Ein-Klick-Start ohne Docker
- dieselbe Hymui-Web-App wie bei Self-hosted und Hosted
- automatisches Öffnen im Standardbrowser
- optional als installierbare Desktop-App mit derselben Oberfläche
- Bindung an `127.0.0.1` als sichere Voreinstellung
- Vollständig offline verwendbar
- Kein Hosted-Konto erforderlich
- lokales Profil ohne öffentliche Föderationsadresse
- Anmeldung an einer Hosted- oder Self-hosted-Instanz als Client möglich
- PGlite und Uploads in einem klaren Hymui-Datenordner
- Automatische rotierende Backups
- Manueller Export und Import
- Verständliche Datenbank- und Speicherdiagnose
- Aktualisierung ohne Verlust lokaler Daten

Local ist zunächst für eine Person beziehungsweise eine gleichzeitig laufende
Instanz ausgelegt. Gemeinsames Arbeiten im Netzwerk gehört zu Self-hosted.
Der Local-Starter startet Frontend, Backend und Worker gemeinsam und beendet
sie kontrolliert. Es gibt trotzdem keinen direkten Datenzugriff aus dem
Frontend. Die Web-App kann, sofern der Browser es unterstützt, zusätzlich als
PWA installiert werden; dies ist Komfort und keine Voraussetzung.

Die Desktop-App ist eine Shell um dieselbe Web-App und startet dieselben lokalen
Backend- und Worker-Dienste. Sie enthält keine zweite UI und keine eigene
Fachlogik. Desktop-Funktionen wie Dateiauswahl, Benachrichtigungen, Deep Links
und Updates werden hinter einem kleinen `DesktopBridge` gekapselt, damit die
Browser-Version keine Plattformabhängigkeiten erhält.

Plattformreihenfolge:

1. macOS
2. Linux
3. Windows nach dem ersten stabilen Local-Release

Die Windows-Web-App bleibt von Tag 1 unterstützt. Nur der native
Local-/Desktop-Installer wird später geliefert.

Eine Local-Instanz bindet standardmäßig ausschließlich an `127.0.0.1` und kann
daher keine öffentliche föderierte Heimatinstanz sein. Wer eine öffentliche
Identität oder Zusammenarbeit mit anderen Instanzen möchte, meldet die Local-
beziehungsweise Desktop-App als Client an einer Hosted- oder Self-hosted-
Instanz an. Ein unsicheres automatisches Öffnen lokaler Ports findet nicht
statt.

### 6.2 Self-hosted

- Docker Compose als empfohlener Installationsweg
- getrennte Container beziehungsweise Prozesse für Frontend, Backend und Worker
- unabhängige Health- und Readiness-Prüfungen je Dienst
- gemeinsamer Reverse Proxy als empfohlener Einstiegspunkt
- PostgreSQL, MySQL, MariaDB oder experimentell Microsoft SQL Server
- Lokaler oder S3-kompatibler Speicher
- Mehrere Benutzer, Teams und Workspaces
- eigene Accounts und föderierte Identitäten ohne Pflichtkonto bei Hymui
- Föderation vollständig abschaltbar sowie per Allow- und Blocklist steuerbar
- Eigene Domain, TLS-Proxy und SMTP konfigurierbar
- Admin-geführte Updates, Migrationen und Backups
- Health- und Readiness-Endpunkte

### 6.3 Hosted

- dieselbe responsive Hymui-Web-App wie Local und Self-hosted
- getrennt deploybares Nuxt-Frontend
- unabhängig skalierbare Fastify-API
- unabhängig skalierbare Agent- und Job-Worker
- Verwaltetes PostgreSQL mit Connection Pooling
- Verwalteter privater Objektspeicher
- Automatische Migrationen, Backups und Wiederherstellungstests
- Einladungen und Kontowiederherstellung
- Hosted-Accounts mit einer Hymui-Föderationsadresse
- Zusammenarbeit mit freigegebenen Self-hosted-Instanzen
- Mandantentrennung über verpflichtend gescopte Repository-Aufrufe
- Betriebsmetriken, Audit-Logs und Alarmierung
- Kein Lock-in: vollständiger Export bleibt jederzeit möglich

## 7. Portabilität und kein Lock-in

Jede Edition liest und schreibt dasselbe versionierte `.hymui`-Archiv:

```text
workspace.hymui
  manifest.json
  data/
    records.ndjson
  uploads/
  checksums.json
```

Der Export ist datenbankneutral und enthält keine PostgreSQL-, MySQL-,
MariaDB- oder MSSQL-spezifischen SQL-Dumps. Importtests müssen mindestens diese
Wege abdecken:

```text
PGlite -> PostgreSQL
PGlite -> MySQL
PGlite -> MariaDB
PostgreSQL -> PGlite
MySQL -> PostgreSQL
MariaDB -> PostgreSQL
PGlite -> MSSQL
MSSQL -> PostgreSQL
```

Live-Synchronisierung zwischen Local und Hosted ist kein Bestandteil des ersten
Releases. Zuerst werden zuverlässiger Export, Import, Backup und
Wiederherstellung fertiggestellt.

### 7.1 Identität wie bei Mastodon

Hymui verwendet kein globales Benutzerverzeichnis als technische
Voraussetzung. Ein Account gehört immer genau einer Heimatinstanz. Das
sichtbare Hymui-Handle setzt die Instanz bewusst vor den Benutzernamen:

```text
§team-a.example@alice
§hymui.example@bob
§company.internal@carol
```

Das Zeichen `§` kennzeichnet eine Hymui-Identität. Die Domain kann jede
gültige Instanzdomain einschließlich Subdomain und beliebiger zulässiger
Top-Level-Domain sein, zum Beispiel:

```text
§hymui.net@aice
§projects.company.dev@anna
§team.example.org@sam
```

Das Hymui-Handle ist eine Darstellungs- und Eingabesyntax, keine neue
Internet-URI. Intern bleibt die Identität standardkonform:

```text
Anzeige:      §hymui.example@bob
WebFinger:    acct:bob@hymui.example
Actor-ID:     https://hymui.example/actors/bob
Fediverse:    @bob@hymui.example
```

Suche, Einladungen und Account-Picker akzeptieren sowohl
`§domain@username` als auch `@username@domain` und normalisieren beide auf
dieselbe Actor-ID. Kopieren bietet „Hymui-Handle“ und „Fediverse-Handle“ an.
Das `§` wird niemals Bestandteil von Datenbankschlüsseln, URLs, Signaturen oder
WebFinger-Requests.

Für jede Kommunikation mit dem Backend gilt eine strikte Identitätsgrenze:

- Das Frontend sendet bei Einladungen, Freigaben, Mentions, Rollenänderungen
  und anderen benutzerbezogenen Aktionen niemals nur `@bob`, sondern den
  vollständigen Handle `§hymui.example@bob` oder eine bereits aufgelöste
  Actor-ID.
- Das Backend akzeptiert den vollständigen Handle als Eingabe, löst ihn an
  einer zentralen Stelle auf und arbeitet danach ausschließlich mit der
  unveränderlichen Actor-ID beziehungsweise der internen Account-ID.
- API-Antworten liefern neben der Actor-ID immer den vollständigen kanonischen
  Handle. Das Frontend darf daraus abhängig vom sichtbaren Kontext `@bob`
  machen.
- Einladungslinks und föderierte Nachrichten adressieren den Empfänger über
  seine Actor-ID. Der vollständige Handle wird zusätzlich für Anzeige,
  Bestätigung und Audit-Logs gespeichert.
- Ein nacktes `@bob` ist nur eine komfortable Frontend-Eingabe. Vor dem
  Absenden muss es über den lokalen Namespace eindeutig zu
  `§hymui.example@bob` aufgelöst werden.

Im normalen Frontend wird die kurze Form bevorzugt:

```text
@bob
```

Die vollständige Hymui-Form wird angezeigt, wenn derselbe Benutzername im
aktuellen Kontext zu mehreren Actors gehört:

```text
§hymui.example@bob
§company.example@bob
```

Kollisionsregeln:

- Ist ein Benutzername innerhalb der sichtbaren Ergebnis-, Mitglieder- oder
  Teilnehmermenge eindeutig, zeigt Hymui `@username`.
- Existieren mehrere Actors mit demselben Benutzernamen, zeigen alle
  kollidierenden Einträge `§domain@username`.
- Die aktuelle Instanz besitzt Vorrang für ihren eigenen lokalen
  Username-Namespace. Auf der offiziellen Hymui-Hosted-Instanz ist ein dort
  registrierter `bob` immer der kurze `@bob`.
- Existiert auf der aktuellen Instanz ein lokaler Benutzername, müssen
  gleichnamige Remote-Actors immer vollständig als `§domain@username`
  erscheinen. Der lokale Actor behält die kurze Form.
- Diese Priorität beeinflusst nur Auflösung und Darstellung auf der aktuellen
  Instanz. Sie verändert keine Actor-ID und erklärt die aktuelle Instanz nicht
  zur globalen Eigentümerin eines Namens.
- Auf einer Self-hosted-Instanz gilt dieselbe Regel für deren lokale Accounts.
  Dadurch bleibt jede Heimatinstanz unabhängig und besitzt ihren eigenen
  lokalen Namespace.
- Suche nach einem mehrdeutigen `@username` öffnet eine Auswahl mit Domain,
  Avatar und Heimatinstanz.
- Mentions werden beim Auswählen sofort auf die Actor-ID aufgelöst und nicht als
  ungesicherter Text gespeichert.
- Ändert sich der Kontext später durch eine Kollision, kann die Darstellung
  automatisch von kurz auf vollständig wechseln, ohne die Mention zu ändern.
- Profilansicht, Tooltip und Kopiermenü bieten immer den vollständigen Handle.
- Einladungen, Rollenänderungen, Freigaben, Audit-Logs und andere
  sicherheitsrelevante Ansichten zeigen immer Domain und vollständigen Handle,
  auch wenn der Benutzername aktuell eindeutig ist.
- Avatare und Anzeigenamen dürfen niemals zur Identitätsauflösung verwendet
  werden.

Beispiel:

```text
Projekt A mit nur einem Bob
  -> @bob

Projekt B mit zwei Bobs
  -> @bob
  -> §team.example@bob
```

Beispiel auf der offiziellen Hosted-Instanz:

```text
Lokaler Hosted-Account:
  @bob

Entfernter Account mit gleichem Namen:
  §company.example@bob

Eingabe von @bob:
  -> löst immer den lokalen Hosted-Account auf
```

Wird ein Username auf Hosted erst später lokal registriert, wechseln bereits
bekannte gleichnamige Remote-Actors in der Anzeige automatisch auf ihre
vollständige Form. Gespeicherte Mentions und Mitgliedschaften bleiben korrekt,
weil sie an Actor-IDs und nicht an sichtbare Handles gebunden sind.

Screenreader erhalten statt des alleinstehenden Symbols eine verständliche
Beschriftung wie „Hymui-Account bob auf hymui.example“. Ein lokales,
nicht veröffentlichtes Profil erhält keine scheinbar globale
Föderationsadresse.

Die Heimatinstanz verantwortet Anmeldung, Wiederherstellung, Profil,
Sperrungen und kryptografische Schlüssel. Eine andere Instanz speichert nur die
für Zusammenarbeit erforderliche entfernte Actor-Repräsentation.

Das Identitätsmodell trennt:

```text
LocalAccount
  -> Anmeldung und Sicherheit auf der Heimatinstanz

FederatedActor
  -> globale Actor-URL und öffentlicher Handle

WorkspaceMembership
  -> Rolle und Rechte in einem konkreten Workspace

ExternalIdentity
  -> optional verknüpftes OIDC-Konto oder Passkey
```

E-Mail-Adressen sind keine globalen IDs. Bei OIDC ist die Kombination aus
Issuer und Subject maßgeblich. Rollen und Workspace-Mitgliedschaften bleiben
immer auf der Instanz beziehungsweise beim Ursprung des Workspaces.

### 7.2 Hymui-Föderation

Hymui orientiert die Server-zu-Server-Kommunikation an ActivityPub und
ActivityStreams 2.0:

- Actor-URLs als globale Identitäten
- Inbox und Outbox für signierte Aktivitäten
- Web-basierte Discovery für Handles und Instanzfähigkeiten
- `Invite`, `Accept`, `Reject`, `Add`, `Remove`, `Create`, `Update`, `Delete`
  und `Undo` als grundlegende Aktivitäten
- Hymui-eigene, versionierte Objekttypen für Projekte, Mitgliedschaften und
  freigegebene Projektartefakte

Hymui dokumentiert ein eigenes Föderationsprofil. Ein beliebiger
Mastodon-Server wird komplexe Hymui-Projekte nicht automatisch verstehen.
Optionale öffentliche Projektankündigungen können später als normale
ActivityStreams-Notizen abgebildet werden.

Ein föderiertes Projekt besitzt eine kanonische Heimatinstanz. Diese Instanz ist
Quelle der Wahrheit für Projekt, Rollen und Berechtigungen. Entfernte Mitglieder
arbeiten über signierte Aktivitäten ihrer Heimatinstanz mit:

```text
Alice@Instanz-A
    -> signierte Projektanfrage
        -> Projekt@Instanz-B
            -> Berechtigung prüfen
                -> anwenden oder ablehnen
                    -> signiertes Ergebnis zurücksenden
```

Nicht jedes Board, Doc oder jeder Agent-Lauf wird automatisch vollständig auf
alle Instanzen repliziert. Übertragen werden nur die für eine genehmigte Aktion
und den berechtigten Empfänger erforderlichen Daten. Sensible Artefakte bleiben
am Projektursprung und werden authentifiziert abgerufen.

### 7.3 Föderationskontrolle

Jede Instanz besitzt eine eigene Trust Policy:

- Föderation aus, eingeschränkt oder offen
- Allowlist und Blocklist für Instanzen
- Sperren einzelner Actors
- maximale Payload-, Datei- und Zustellgrößen
- Rate Limits und Zustellwarteschlangen
- Ablauf und Wiederholung fehlgeschlagener Zustellungen
- Key Rotation und Widerruf
- Audit-Log für eingehende und ausgehende Aktivitäten

Eingehende Remote-Daten gelten als nicht vertrauenswürdig. Signaturen,
Zeitstempel, Ziel, Actor, Objektursprung, Berechtigung und Replay-Schutz werden
vor jeder Änderung geprüft. Föderierte Inhalte werden genauso validiert und
bereinigt wie direkte API-Eingaben.

AI Agents erhalten keine automatische Föderationsberechtigung. Ein Agent kann
entfernte Aktionen nur über ein explizit erlaubtes FederationTool vorschlagen;
externe oder schreibende Zustellungen benötigen eine Freigabe.

### 7.4 Account- und Instanzumzug

Der datenbankneutrale Export bleibt der verlässliche erste Umzugsweg.
Passwort-Hashes, private Signaturschlüssel und fremde Secrets werden nicht
unbemerkt in normale Workspace-Exporte aufgenommen.

Vollständige Actor-Migration zwischen Heimatinstanzen, Weiterleitungsadressen
und automatische Übernahme aller entfernten Beziehungen folgen erst nach einem
eigenen Protokoll- und Sicherheitsreview. Das Datenmodell reserviert dafür
stabile Actor-IDs, Alias- und Nachfolgerbeziehungen.

## 8. Produktstruktur

### 8.1 Navigation

- Das Hymui-Logo führt zur Projektübersicht und ersetzt einen eigenen
  „Projects“-Punkt in der Hauptnavigation.
- Die Hauptmodule sind Planner, Board und Docs.
- Notes wird nicht als separates Produkt weitergeführt; Notizen sind Docs.
- Die Oberfläche funktioniert mit Maus, Touch und Tastatur.

### 8.2 Projekte

- Ein Projekt kann Boards, Docs, Planner-Einträge und externe Links enthalten.
- Repositories sind normale externe Links mit optionalem Anbieter-Icon.
- Ein Projekt kann zusätzlich eine oder mehrere kontrollierte
  Repository-Verbindungen besitzen.
- Repository-Verbindungen sind optional und dürfen allgemeine Projekte nicht
  beeinflussen.
- Projekte können mit einer Vorlage starten oder vollständig frei bleiben.
- Vorlagen konfigurieren Begriffe, Ansichten, Agent-Profile und Startinhalte,
  verändern aber nicht das Core-Datenmodell.
- Eigene und durch Plugins gelieferte Vorlagen sind möglich.
- Projekte dürfen genau eine zusätzliche Ordnerebene besitzen.
- Boards und Docs werden verlinkt, nicht dupliziert.
- Die Projektansicht zeigt den Typ jedes Elements eindeutig an.
- Whiteboard wird als späterer weiterer Elementtyp bereits im Modell
  berücksichtigt, aber nicht im ersten Release implementiert.

### 8.3 Board

- Kanban-Boards mit frei sortierbaren Spalten und Karten
- Board-Einstellungen für Name, Sichtbarkeit, Sprache und Darstellung
- Board-Erstellung über ein eindeutiges Plus-Icon mit verlässlichem Dialog
- Suche über Karten, Beschreibungen, verknüpfte Docs und Metadaten
- Kartenarchiv als eigene Ansicht beziehungsweise Spalte
- Archivierte Karten merken sich Board und Ursprungsspalte für die
  Wiederherstellung
- Karten können ein Doc als Beschreibung anzeigen oder Docs als Anhänge führen
- Bei „als Beschreibung“ wird der Inhalt des ausgewählten Docs dargestellt
- Bei „als Anhang“ erscheinen Doc-Icon und Doc-Titel am Kartenende
- Keine Platzhalter wie „Hallo Welt“ in produktiven Zuständen

### 8.4 Docs

- Markdown schreiben, lesen und in einer geteilten Ansicht bearbeiten
- Bearbeitung in der Vorschau mit einer einzigen synchronen Dokumentquelle
- Robuste Synchronisierung auch nach langen offenen Sitzungen
- Codeblöcke im Discord-ähnlichen Stil
- Syntaxhervorhebung anhand der angegebenen Sprache, zum Beispiel `js`,
  `ts`, `css`, `html` oder `bash`
- Sichere Markdown-Ausgabe ohne ungeprüftes HTML oder Script-Ausführung
- Titel und Doc-Typ überall eindeutig sichtbar
- Anhänge und Bilder über den StoragePort

### 8.5 Planner

- Termine und Aufgaben aus Projekten und Board-Karten
- Klarer Typ-Badge „Projekt“ oder „Karte“
- Verlinkung zum Ursprungsprojekt, Board und zur Karte
- Einheitliche Datums-, Zeitzonen- und Sprachdarstellung

### 8.6 Profile und Sprache

- Profilbild als Upload oder Auswahl eines eingebauten Icons
- Alt-Texte, Dateigrößenlimit und sichere Bildverarbeitung
- Deutsch und Englisch vollständig ab Setup
- Sprachwechsel aktualisiert Navigation, Einstellungen, Dialoge,
  Fehlermeldungen, leere Zustände, Datum und Uhrzeit
- Kein Text darf allein wegen eines Emojis oder betriebssystemspezifischen
  Symbols verständlich sein

### 8.7 AI Agents für beliebige Projekte

AI Agents sind eine Kernfunktion jedes Projekts. Der primäre Ablauf lautet:

```text
Projekt anlegen
  -> Ziel, vorhandene Materialien und optional Integrationen verbinden
      -> Planning Agent analysiert den Kontext
          -> erstellt einen überprüfbaren Vorschlag
              -> Mensch genehmigt
                  -> Docs, Meilensteine und Board-Karten werden angelegt
                      -> weitere Agents führen freigegebene Aufgaben aus
```

Allgemeine Agent-Profile:

| Agent | Aufgabe | Ergebnis |
| --- | --- | --- |
| Goal Agent | Ziel, Beteiligte und Rahmen klären | Projektbrief und offene Fragen |
| Planning Agent | Ziel in überprüfbare Arbeit zerlegen | Phasen, Meilensteine und Karten |
| Research Agent | bereitgestellte Quellen und Kontext untersuchen | Recherche-Doc und Quellenhinweise |
| Risk Agent | Abhängigkeiten, Unsicherheiten und Risiken prüfen | Risikoliste und Gegenmaßnahmen |
| Review Agent | Ergebnisse mit Ziel und Anforderungen vergleichen | Review und Verbesserungsvorschläge |
| Documentation Agent | Wissen und Änderungen pflegen | Projekt-Docs und Zusammenfassungen |

Das optionale Software-/Webentwicklungspaket ergänzt:

| Agent | Aufgabe | Ergebnis |
| --- | --- | --- |
| Requirements Agent | Nutzer- und Systemanforderungen klären | Anforderungs-Doc |
| Architecture Agent | technische Optionen bewerten | Architektur-Doc und ADRs |
| Repository Agent | Codebasis und Abhängigkeiten analysieren | Repo-Kontext und Risiken |
| Implementation Agent | freigegebene Aufgaben bearbeiten | Patch oder Branch-Vorschlag |
| Code Review Agent | Änderungen technisch prüfen | Review und Testhinweise |

Goal, Planning, Research, Risk und Review sind Bestandteil des ersten Releases.
Das Software-/Webentwicklungspaket liefert zusätzlich Requirements,
Architecture und lesende Repository-Analyse. Schreibende Code-Ausführung bleibt
zunächst experimentell und benötigt eine isolierte Arbeitsumgebung sowie eine
explizite Freigabe.

#### Agent-Runtime

Ein Agent ist kein unkontrollierter Chat. Jeder Lauf besitzt einen
nachvollziehbaren Zustand:

```text
queued
  -> running
      -> waiting_for_approval
          -> running
              -> completed | failed | cancelled
```

Gespeichert werden:

- Agent-Profil und versionierte Anweisungen
- Projekt, Benutzer und auslösender Auftrag
- verwendeter Modellanbieter, Modellbezeichnung und Fähigkeiten
- Status, Start, Ende, Abbruch und Wiederholungen
- sichtbare Nachrichten, Tool-Aufrufe, Ergebnisse und erzeugte Artefakte
- Genehmigungen und Ablehnungen
- Token-, Zeit- und Kostenbudget
- Fehler und sichere Wiederaufnahmeinformationen

Interne verborgene Gedankengänge werden nicht gespeichert oder angezeigt.
Hymui speichert nachvollziehbare Zusammenfassungen, Entscheidungen,
Tool-Aufrufe und Ergebnisse.

#### Providerneutrale Modelle

Die Agent-Runtime hängt ausschließlich an einem `ModelProviderPort`:

```ts
type ModelCapabilities = {
  streaming: boolean;
  structuredOutput: boolean;
  toolCalling: boolean;
  vision: boolean;
  embeddings: boolean;
};
```

Der Core prüft Fähigkeiten und nicht Anbieternamen. Erste Adapter:

- OpenAI
- Anthropic
- lokaler beziehungsweise selbst gehosteter kompatibler Modellendpunkt mit
  Status `experimental`

Local kann vollständig ohne Hymui-Cloud arbeiten, wenn ein lokaler
Modellanbieter konfiguriert ist. Self-hosted verwendet eigene API-Schlüssel oder
lokale Modelle. Hosted kann verwaltete Modelle und später optional eigene
Schlüssel anbieten.

API-Schlüssel bleiben serverseitig, werden verschlüsselt gespeichert und
niemals an Browser, Agent-Ausgaben oder Logs weitergegeben. Vor jedem
Providerwechsel zeigt Hymui, welche Projektdaten den lokalen Rechner
verlassen.

#### Agent-Tools

Agents verändern Hymui ausschließlich über eine versionierte Tool-Registry:

```text
project.read
project.update
docs.read
docs.propose
board.read
board.propose
planner.read
planner.propose
repository.read
repository.search
repository.propose_patch
repository.run_checks
```

Tools besitzen:

- ein typisiertes Ein- und Ausgabeschema,
- einen Workspace- und Projekt-Scope,
- eine Kennzeichnung als lesend oder schreibend,
- eine definierte Freigaberegel,
- Idempotency Keys gegen doppelte Änderungen,
- Zeit-, Größen- und Kostenlimits,
- strukturierte Audit-Ereignisse.

MCP kann später als zusätzlicher Tool-Adapter dienen. Hymui-interne
Fachaktionen bleiben jedoch eigene stabile Tools, damit das Produkt nicht von
einem externen Protokoll oder Modellanbieter abhängt.

#### Freigaben und Autonomie

Freigaben werden nach Wirkung und nicht nach Agenttyp entschieden:

| Aktion | Standard |
| --- | --- |
| Projekt, Board, Docs und Repository lesen | erlaubt innerhalb des Scopes |
| Plan, Doc oder Karten als Vorschau erzeugen | erlaubt |
| Hymui-Daten endgültig verändern | zusammengefasste Freigabe |
| Repository-Dateien verändern | immer Freigabe und isolierte Arbeitskopie |
| Befehle oder Tests ausführen | immer Freigabe und Sandbox |
| Commit, Push, Pull Request oder externe Nachricht | immer Freigabe |
| Löschen, Geheimnisse oder Produktionssysteme | blockiert oder besonders bestätigt |

Workspace-Administratoren können strengere Richtlinien definieren. Agents
dürfen ihre eigenen Berechtigungen nicht verändern oder Freigaben umgehen.

#### Repository-Sicherheit

- Ein Agent arbeitet niemals direkt auf dem Standardbranch.
- Schreibende Runs erhalten eine isolierte Arbeitskopie beziehungsweise einen
  eigenen Worktree.
- Repository-Dateien, Issues und Dokumente gelten als nicht vertrauenswürdiger
  Inhalt und dürfen Agent-Anweisungen nicht überschreiben.
- Geheimnisdateien und konfigurierbare sensible Pfade werden standardmäßig
  ausgeschlossen.
- Diffs, Tests und betroffene Dateien werden vor einer Übernahme angezeigt.
- Abbruch und Aufräumen dürfen die originale Arbeitskopie nicht verändern.
- Externe Repository-Zugänge verwenden minimal notwendige, widerrufbare
  Berechtigungen.

#### Agent-UI

Agents verwenden denselben UI-Baukasten:

- `AgentComposer` für Ziele und Kontext
- `AgentRunStatus` für Laufzustand und Kosten
- `AgentTimeline` für sichtbare Schritte und Tool-Ergebnisse
- `ApprovalCard` für Freigaben
- `ArtifactPreview` für Docs, Pläne, Karten und Diffs
- `AgentPicker` für Profile und Fähigkeiten

Agents sind projektbezogen erreichbar. Globale Übersichten zeigen laufende,
wartende, fehlgeschlagene und abgeschlossene Runs, ohne den Projektkontext zu
verlieren.

#### Projektvorlagen

Erste mitgelieferte Vorlagen:

```text
Leeres Projekt
Allgemeine Projektplanung
Persönliches Projekt
Softwareentwicklung
Webentwicklung
Recherche
Inhalts- und Redaktionsplanung
Veranstaltungsplanung
```

Vorlagen sind Daten und Konfiguration, keine hart verdrahteten Sonderseiten.
Sie können Start-Docs, Spalten, Agent-Profile, Begriffe und empfohlene
Meilensteine liefern. Neue Branchen und Arbeitsweisen werden später über
Vorlagen und Plugins ergänzt, ohne den Hymui-Core umzubauen.

## 9. Designsystem

Das Design bleibt dunkel, ruhig und macOS-inspiriert, darf sich aber nicht auf
native macOS-Steuerelemente verlassen.

### 9.1 Verbindliche SCSS-Regeln

Styles werden ab dem ersten Commit getrennt vom TypeScript- und Vue-Code
organisiert:

```text
components/
  Button/
    Button.vue
    Button.scss
    Button.test.ts
  BoardCard/
    BoardCard.vue
    BoardCard.scss
    BoardCard.test.ts

assets/scss/
  settings/
    _tokens.scss
    _themes.scss
  tools/
    _mixins.scss
    _functions.scss
  generic/
    _reset.scss
    _fonts.scss
  elements/
    _document.scss
    _forms.scss
  objects/
    _layout.scss
    _stack.scss
  utilities/
    _accessibility.scss
  main.scss
```

Eine Vue-Komponente darf eine externe Stylesheet-Datei referenzieren:

```vue
<style scoped lang="scss" src="./Button.scss"></style>
```

Der `<style>`-Block enthält dabei keinen CSS- oder SCSS-Code. Alternativ werden
globale Grundstyles ausschließlich zentral über Nuxt geladen.

Verboten sind:

- CSS- oder SCSS-Regeln innerhalb von `.vue`- oder `.ts`-Dateien
- `style="..."` in Templates
- dynamisch zusammengesetzte CSS-Strings in TypeScript
- CSS-in-JS-Bibliotheken
- Tailwind oder vergleichbare Utility-First-CSS-Frameworks
- globale, ungescopte Komponentenstyles ohne begründete Ausnahme
- neue Farben, Abstände, Radien oder Schatten außerhalb der Design-Tokens
- Sass-`@import`; gemeinsame SCSS-Module verwenden `@use` und `@forward`
- tief verschachtelte Selektoren; maximal drei Ebenen
- `!important`, außer in dokumentierten Accessibility- oder
  Fremdbibliothek-Ausnahmen

Erlaubt und vorgesehen sind:

- semantische Klassennamen nach einer einheitlichen BEM-ähnlichen Konvention
- SCSS für Struktur, Wiederverwendung und Build-Zeit-Werkzeuge
- CSS Custom Properties für Themes und Werte, die sich zur Laufzeit ändern
- Komponentenvarianten über `data-*`-Attribute oder klar definierte
  Modifier-Klassen
- `prefers-reduced-motion`, `prefers-contrast` und systemunabhängige
  Fokusdarstellungen

Stylelint mit SCSS-Regeln, ESLint und ein zusätzlicher Strukturtest erzwingen
diese Vorgaben in CI. Ein Merge schlägt fehl, wenn Inline-Styles, CSS-in-JS oder
interne Vue-Styles neu hinzukommen.

### 9.2 Design-Tokens

Alle visuellen Grundwerte besitzen zentrale Tokens:

```text
color       Hintergrund, Oberfläche, Text, Rahmen und Status
spacing     Abstände auf einem festen Raster
radius      Radien für Controls, Karten, Popovers und Dialoge
shadow      Ebenen und Fokusdarstellung
type        Schriftfamilien, Größen, Höhen und Gewichte
motion      Dauer und Kurven
z-index     klar benannte Oberflächenebenen
```

SCSS erzeugt daraus die benötigten CSS Custom Properties. Vue und TypeScript
enthalten keine duplizierten Farb-, Abstands- oder Layoutwerte.

### 9.3 Komponenten als Baukasten

Die Oberfläche wird wie ein Lego-System aufgebaut. Kleine stabile Bausteine
werden zu größeren Mustern und anschließend zu Produktfunktionen
zusammengesetzt:

```text
Design-Tokens
  -> UI-Primitives
      -> UI-Controls
          -> UI-Patterns
              -> App-Shells
                  -> Features
```

Beispiel:

```text
UiIcon + UiText
  -> UiButton und UiIconButton
      -> UiMenuItem
          -> UiMenu
              -> UserMenu

UiIcon + UiNavItem
  -> UiNavigation
      -> AppHeader
          -> Hymui AppShell
```

Das UI-Paket wird nach Verantwortung gegliedert:

```text
packages/ui/
  primitives/             Icon, Text, Surface, Divider
  controls/               Button, Input, Select, Checkbox, Tabs
  feedback/               Toast, InlineError, Skeleton, EmptyState
  overlays/               Popover, Menu, Tooltip, Dialog
  navigation/             NavItem, Navigation, Breadcrumbs
  patterns/               SearchBar, UserMenu, ItemPicker
  shells/                 AppShell, SettingsShell, EditorShell
```

Verbindliche Regeln:

- Ein visuelles oder interaktives Muster wird nur einmal implementiert.
- Features verwenden Komponenten aus `packages/ui`; sie kopieren kein
  Button-, Menü-, Formular- oder Navigations-Markup.
- Native `<button>`, `<input>`, `<select>` und `<dialog>` werden grundsätzlich
  nur innerhalb des UI-Pakets verwendet.
- Komponenten enthalten keine Board-, Docs-, Planner- oder
  Datenbank-Fachlogik.
- Komponenten laden keine Daten selbst. Daten und Aktionen kommen über Props,
  Slots, Events und klar definierte Modelle.
- Texte werden nicht hart codiert, sondern vom Aufrufer beziehungsweise aus
  dem Übersetzungssystem übergeben.
- Varianten sind begrenzt, benannt und dokumentiert, zum Beispiel
  `primary`, `secondary`, `danger` und `ghost`.
- Zusammensetzung über Slots und kleine Komponenten hat Vorrang vor einer
  riesigen Komponente mit vielen booleschen Props.
- Icons stammen aus einer zentralen Icon-Komponente und besitzen immer einen
  zugänglichen Namen oder sind explizit dekorativ.
- Jede öffentliche UI-Komponente besitzt TypeScript-Typen, SCSS,
  Accessibility-Tests und dokumentierte Beispiele.
- Änderungen an einer Basiskomponente werden gegen alle bekannten Varianten
  visuell getestet.

Eine wiederverwendbare Navigation erhält ihre Einträge als Daten und Slots:

```ts
type NavigationItem = {
  id: string;
  label: string;
  icon?: IconName;
  to?: string;
  active?: boolean;
  disabled?: boolean;
};
```

Damit können Hauptnavigation, Projekteinstellungen und Seitenleisten dieselben
Nav-Bausteine verwenden, ohne identische komplette Navigationsleisten zu
erzwingen. Die App-Shell setzt diese Bausteine passend zum jeweiligen Kontext
zusammen.

### 9.4 Plugin-fähige UI

Der UI-Baukasten bildet später die öffentliche Plugin-Oberfläche. Plugins
erhalten keine internen Vue-Komponenten oder direkten DOM-Zugriff, sondern eine
kleine versionierte Auswahl stabiler UI-Bausteine und Extension Points.

Vorgesehene Extension Points:

```text
navigation.main
navigation.project
project.item-types
board.card.actions
board.card.badges
docs.toolbar.actions
planner.item.actions
settings.workspace.panels
settings.user.panels
agents.tools
agents.profiles
agents.context
```

Ein Plugin beschreibt sich über ein Manifest:

```ts
type HymuiPluginManifest = {
  id: string;
  name: string;
  version: string;
  apiVersion: string;
  permissions: PluginPermission[];
  extensions: PluginExtension[];
};
```

Verbindliche Plugin-Grenzen:

- Plugins verwenden nur die veröffentlichte Plugin-SDK und keine internen
  Modulpfade.
- Jede Erweiterung wird über eine Registry angemeldet; Features suchen nicht
  selbst im Dateisystem nach Plugins.
- Plugin-Navigation verwendet `UiNavItem`, Plugin-Aktionen verwenden
  `UiButton`, `UiMenuItem` und die zentralen Overlays.
- Plugin-Texte müssen über das Übersetzungssystem laufen.
- Plugins erhalten keine direkte Datenbankverbindung.
- Plugins erhalten keinen direkten Modellanbieter- oder Repository-Zugriff.
  Agent-Fähigkeiten werden ausschließlich als erlaubnispflichtige Tools
  registriert.
- Plugin-Daten werden über einen portablen, namespaceten Storage-Vertrag
  gespeichert, damit sie mit PostgreSQL, MySQL, MariaDB, MSSQL und Exporten
  funktionieren.
- Netzwerk, Dateien, Benutzer, Workspaces und schreibende Aktionen benötigen
  explizite Berechtigungen.
- Plugin-API-Version und Hymui-Kompatibilität werden vor dem Laden geprüft.
- Das Entfernen eines Plugins darf Core-Daten nicht löschen oder Hymui am
  Start hindern.
- Nicht vertrauenswürdiger Plugin-Code benötigt vor einer öffentlichen
  Freigabe eine isolierte Laufzeit; er läuft nicht uneingeschränkt im
  Backend-, Worker- oder Frontendprozess.

Im ersten Release werden Extension Points, Registry, Manifest-Typen und
Plugin-Storage-Verträge intern mitgeliefert und durch mindestens ein
eingebautes Beispiel-Plugin getestet. Installation fremder Plugins und ein
Plugin-Marktplatz folgen erst nach der Sicherheits- und Sandbox-Phase.

### 9.5 Hymui-Logo-System

Die drei gelieferten Logo-Behandlungen sind gleichwertige Teile der
Hymui-Marke und keine Entwürfe, zwischen denen nur eine Variante ausgewählt
wird:

| Variante | Name | Haupteinsatz |
| --- | --- | --- |
| A | Vivid | Standardlogo, App-Icon, Setup, Marketing und starke Markenmomente |
| B | Subtle | dunkle App-Flächen, Sidebar, Navigation und zurückhaltende Kontexte |
| C | Outline | technische Ansichten, Agents, Integrationen, Status- und Akzentmomente |

Alle Varianten verwenden dieselbe Grundgeometrie und dieselbe Wortmarke. Sie
werden über einen einzigen wiederverwendbaren Baustein ausgegeben:

```ts
type BrandLogoProps = {
  variant: "vivid" | "subtle" | "outline";
  layout?: "mark" | "lockup" | "compact";
  size?: BrandLogoSize;
  decorative?: boolean;
  label?: string;
};
```

Vorgesehene Verwendung:

```vue
<BrandLogo variant="vivid" layout="mark" />
<BrandLogo variant="subtle" layout="compact" />
<BrandLogo variant="outline" layout="lockup" />
```

Verbindliche Regeln:

- Keine Variante wird aus dem Markenpaket entfernt.
- Produktbereiche wählen eine Variante nach dokumentiertem Kontext und nicht
  nach persönlicher Vorliebe.
- Geometrie, Verläufe, Farben und Wortmarkenabstände stammen aus zentralen
  Brand-Tokens.
- Die Wortmarke wird nicht als normaler Seitentext nachgebaut.
- Kleine Größen erhalten optisch geprüfte, vereinfachte Exporte.
- Glühen und Schatten werden bei kleinen Größen reduziert, damit das Zeichen
  lesbar bleibt.
- Jede Variante besitzt Mark-, Lockup- und Compact-Ausgaben.
- Logo-SVG enthält keine externen Schrift-, Script- oder Netzwerkabhängigkeiten.
- Logos werden nicht über CSS-Filter in andere Varianten umgefärbt.
- Jede Verwendung besitzt entweder einen zugänglichen Namen oder ist als rein
  dekorativ markiert.

Benötigte Produktionsassets:

```text
assets/brand/
  vivid/
    mark.svg
    lockup.svg
    compact.svg
  subtle/
    mark.svg
    lockup.svg
    compact.svg
  outline/
    mark.svg
    lockup.svg
    compact.svg
  raster/
    app-icons/
    favicons/
    social/
```

Aus dem gelieferten Designpaket werden saubere, eigenständige SVG-Quellen und
geprüfte Rasterexporte erzeugt. Die HTML-/React-Designfläche selbst wird nicht
als Produktionskomponente übernommen.

Verbindliche Komponenten:

- Button und IconButton
- Input, Textarea und SearchInput
- Select als kontrolliertes Popover
- Menu und ContextMenu
- Dialog und ConfirmDialog
- Tooltip
- Tabs und SegmentedControl
- Avatar und IconPicker
- BrandLogo
- Toast und InlineError
- Skeleton, EmptyState und ErrorState

Alle Komponenten benötigen Fokusdarstellung, Tastaturbedienung,
Screenreader-Beschriftung, Reduced-Motion-Unterstützung und ausreichende
Kontraste. Native Controls werden nur eingesetzt, wenn Darstellung und Verhalten
auf macOS, Windows und Linux verlässlich gleichwertig sind.

## 10. Suche

Suche wird als eigener `SearchPort` gebaut:

- PGlite/PostgreSQL-Adapter
- MySQL-Adapter
- MariaDB-Adapter
- MSSQL-Adapter mit Status `experimental`

Alle Adapter müssen denselben Suchvertrag erfüllen: gleiche Sichtbarkeitsregeln,
stabile Seitennavigation, definierte Sortierung und keine Daten anderer
Workspaces. Datenbankspezifische Volltextfunktionen dürfen nur innerhalb des
Adapters verwendet werden.

Lange offene Board- oder Docs-Sitzungen dürfen die Suche und Navigation nicht
blockieren. Requests erhalten Abbruchsignale, Timeouts und verständliche
Fehlerzustände.

## 11. Sicherheit und Berechtigungen

- Jede fachliche Abfrage ist an Benutzer und Workspace gebunden.
- Hosted-Mandanten dürfen sich nicht gegenseitig lesen oder verändern.
- Rollen: Owner, Administrator, Member und später Guest
- Servervalidierung für alle Eingaben; Clientvalidierung dient nur der UX
- Passwörter mit modernem Passwort-Hashing
- Sichere, rotierende Sessions
- CSRF-, Origin- und Rate-Limit-Schutz für schreibende Endpunkte
- Markdown-Sanitizing
- Upload- und Download-Autorisierung
- Geheimnisse nur über Serverkonfiguration
- Audit-Ereignisse für Anmeldung, Rollen, Exporte und administrative Änderungen
- Agent-Tools werden nach Wirkung klassifiziert und vor schreibenden oder
  externen Aktionen freigegeben.
- Modell- und Repository-Zugangsdaten werden verschlüsselt und aus Logs,
  Prompts sowie Exporten entfernt.
- Projekt- und Repository-Inhalte gelten gegenüber Agents als nicht
  vertrauenswürdige Daten und nicht als Systemanweisungen.
- Code-Ausführung findet nur in einer begrenzten, kurzlebigen Sandbox statt.
- Jeder Agent-Lauf besitzt Abbruch, Laufzeit-, Token- und Kostenlimits.
- Frontend und Backend laufen mit getrennten Identitäten, Netzwerkregeln und
  minimal notwendigen Berechtigungen.
- Nur Backend und Worker erhalten Datenbank-, Storage-, Modell- und
  Repository-Secrets.
- API-Anfragen und Event-Verbindungen verwenden denselben Authentifizierungs-
  und Workspace-Scope.
- Föderierte Requests benötigen Signaturprüfung, Replay-Schutz,
  Autorisierung, Größenlimits und SSRF-sichere Remote-Auflösung.
- Instanz- und Actor-Blocklisten werden vor Discovery, Abruf und Zustellung
  geprüft.
- Private Föderationsschlüssel sind pro Instanz beziehungsweise Actor
  rotierbar und nur im Backend verfügbar.

## 12. Test- und Supportmatrix

### 12.1 Datenbanken

Jeder Merge in den Hauptbranch führt dieselben Repository-Contract-Tests gegen
folgende Systeme aus:

- PGlite
- PostgreSQL
- MySQL
- MariaDB
- Microsoft SQL Server

### 12.2 Speicher

- lokales temporäres Dateisystem
- S3-kompatibler Testserver
- Fehlerfälle wie abgebrochene Uploads, ungültige Prüfsummen und fehlende
  Objekte

### 12.3 Browser und Systeme

- Chromium
- Firefox
- WebKit
- Web-App-Smoke-Tests unabhängig vom Desktop-Betriebssystem
- Local-/Desktop-Smoke-Tests zunächst auf macOS und Linux
- Docker-Smoke-Tests auf amd64 und arm64

### 12.4 Langzeittests

- Board und Docs über mehrere Stunden geöffnet
- wiederholtes Wechseln zwischen Board, Docs, Planner und Projekten
- viele schnelle Kartenverschiebungen
- gleichzeitige Dokumentänderungen und Autosave
- Datenbankunterbrechung und Wiederverbindung
- sehr lange Markdown-Dokumente und große Boards
- lange Agent-Runs mit Unterbrechung und Wiederaufnahme
- doppelte Webhooks oder Tool-Ergebnisse ohne doppelte Änderungen
- Agent-Abbruch während Datenbank-, Datei- oder Repository-Aktionen
- Provider-Ausfall, Rate Limits und Modellwechsel
- bösartige Anweisungen in Docs, Issues und Repository-Dateien

### 12.5 AI- und Agent-Tests

- identische Tool-Contract-Tests für alle Modellanbieter
- deterministische Tests der Tool- und Freigabelogik ohne echten Modellaufruf
- aufgezeichnete Provider-Antworten für Streaming- und Fehlerfälle
- Evals für Planung, Anforderungsabdeckung und unerlaubte Aktionen
- Budget-, Rate-Limit- und Abbruchtests
- keine Geheimnisse oder fremden Workspace-Daten in Prompts und Logs
- Repository-Sandbox- und Patch-Übernahmetests

### 12.6 Föderationstests

- Actor- und Instanz-Discovery zwischen zwei Testinstanzen
- signierte Inbox-/Outbox-Zustellung
- Invite-, Accept-, Reject-, Undo- und Block-Flows
- Remote-Mitgliedschaft ohne zentrale Account-Datenbank
- abgelaufene, doppelte, manipulierte und falsch adressierte Aktivitäten
- Key Rotation und widerrufene Instanzen
- Allowlist-, Blocklist- und Limited-Federation-Modus
- SSRF-, Redirect-, Payload-, Rate-Limit- und Zustellwiederholungstests
- keine Datenübertragung an unberechtigte Remote-Actors
- gleiche Federation-Contract-Tests auf PostgreSQL, MySQL, MariaDB und MSSQL

## 13. Umsetzungsphasen

### Phase 0 – Technische Beweise

- getrenntes Nuxt-Frontend und Fastify-Backend
- identischer Frontend-Build gegen Local-, Self-hosted- und Hosted-Konfiguration
- versionierter API-Vertrag und generierter TypeScript-Client
- authentifizierter REST-Aufruf und abbrechbarer Event-Stream
- separater Worker mit einer wiederaufnehmbaren Beispielaufgabe
- Self-hosted-Prototyp mit getrennten Frontend-, Backend- und Worker-Containern
- dockerfreie Local- und Desktop-Paketierung auf macOS und Linux
- Nachweis, dass Browser- und Desktop-Shell denselben Frontend-Build verwenden
- PGlite-Persistenz
- Verbindung zu PostgreSQL, MySQL und MariaDB
- Verbindung zu Microsoft SQL Server
- eine Beispielmigration je Dialekt
- MSSQL-CRUD, Transaktionen, Migration und Cross-Database-Import als
  Machbarkeitsnachweis
- Local- und S3-Storage-Prototyp
- Export von einer und Import in eine andere Datenbank
- ein providerneutraler Agent-Lauf mit Streaming und strukturiertem Ergebnis
- ein lesendes und ein freigabepflichtiges schreibendes Agent-Tool
- persistenter, abbrechbarer und wiederaufnehmbarer Agent-Lauf
- lesende Repository-Analyse in einer isolierten Arbeitskopie
- Nachweis, dass Modell-, Agent- und Tool-Daten auf allen Datenbanken portabel
  gespeichert werden
- zwei getrennte Hymui-Instanzen mit Actor-Discovery und signierter
  Testzustellung
- föderierte Einladung eines Remote-Accounts ohne zentrale Account-Datenbank
- Blockieren einer Instanz und sichere Ablehnung wiederholter Zustellung

**Gate:** Keine Produktentwicklung, bevor alle Beweise automatisiert
reproduzierbar sind.

### Phase 1 – Plattformfundament

- Monorepo und Paketgrenzen
- Konfigurations- und Secret-Validierung
- Datenbank- und Storage-Ports
- Migration Runner
- Setup-Assistent
- Benutzer, Sessions, Workspaces und Rollen
- LocalAccount, FederatedActor, Remote-Membership und InstanceTrustPolicy
- Actor-Discovery, signierte Inbox/Outbox und Federation-Queue
- optionaler OIDC-Login und Passkey-fähiges Accountmodell
- Agent-Runtime, ModelProviderPort, Tool-Registry und ApprovalPolicy
- Agent-Run-Queue mit Abbruch, Wiederaufnahme und Budgets
- verschlüsselte Provider- und Repository-Verbindungen
- Deutsch/Englisch
- SCSS-Grundstruktur, Design-Tokens und Stylelint-Regeln
- Baukastenstruktur und Designsystem-Grundkomponenten
- dokumentierte Beispiele und visuelle Tests für alle UI-Bausteine
- Plugin-Manifest, Extension-Registry und ein eingebautes Beispiel-Plugin
- Health- und Fehlerseiten

### Phase 2 – Projekte und Navigation

- Projektübersicht als Startseite
- Hymui-Logo als Home-Link
- Projektstruktur und eine Unterordnerebene
- externe Links und Repository-Links
- Planner-, Board- und Docs-Navigation
- Projektziel und frei konfigurierbare Projektmetadaten
- freie Projekte und konfigurierbare Projektvorlagen
- optionale Repository-Verbindungen
- Goal-, Planning-, Research-, Risk- und Review-Agent
- Software-/Webentwicklungspaket mit Requirements-, Architecture- und
  Repository-Agent
- genehmigte Übernahme von Agent-Vorschlägen in Docs, Meilensteine und Karten
- föderierte Projekteinladung und Remote-Mitgliedschaft zwischen zwei
  Instanzen

### Phase 3 – Boards

- Boards, Spalten, Karten und Sortierung
- Suche
- Archiv und Wiederherstellung
- Board-Einstellungen
- Profil- und Icon-Anzeige
- Doc-Verknüpfung als Beschreibung oder Anhang

### Phase 4 – Docs

- Markdown-Editor und Reader
- synchronisierte Split- und Vorschauansicht
- sichere Markdown-Ausgabe
- Codeblöcke und Syntaxhervorhebung
- Anhänge und Bilder
- lange Sitzungen und Autosave-Konflikte

### Phase 5 – Planner und Integration

- Projekt- und Kartenereignisse
- Typ-Badges und Quellverlinkung
- konsistente Zeit- und Sprachdarstellung

### Phase 6 – Portabilität

- versioniertes `.hymui`-Format
- Export, Import und Wiederherstellung
- automatische Local-Backups
- Cross-Database-Importtests
- Self-hosted Backup-Dokumentation

### Phase 7 – Editionsreife

- Local-Installer und Updatepfad
- signierte beziehungsweise reproduzierbare macOS- und Linux-Pakete
- getrennte Self-hosted Docker-Images und Compose-Vorlage für Frontend,
  Backend und Worker
- getrennte Hosted-Deployments, Monitoring, Skalierung und Backups
- vollständige Browser-, Datenbank- und Plattformmatrix
- Sicherheitsprüfung
- deutsche und englische Dokumentation
- AI-Datenschutz-, Kosten-, Provider- und Freigabedokumentation

## 14. Releasekriterien

Das erste Dev-Release ist erst fertig, wenn:

- Local, Self-hosted und Hosted aus derselben Codebasis gebaut werden,
- alle Editionen denselben Web-App-Frontend-Build verwenden,
- Browser, macOS-Desktop und Linux-Desktop denselben UI-Build verwenden,
- Frontend, Backend und Worker für Self-hosted und Hosted unabhängig gebaut und
  gestartet werden können,
- das Frontend ausschließlich über den versionierten API-Client auf
  Anwendungsdaten zugreift,
- PostgreSQL, MySQL und MariaDB die Contract- und Migrationstests bestehen,
- MSSQL mindestens die festgelegten Experimental-Tests besteht und in UI sowie
  Dokumentation eindeutig als experimentell gekennzeichnet ist,
- PGlite lokal ohne Docker persistent arbeitet,
- lokale und S3-kompatible Speicherung funktionieren,
- ein vollständiger Export zwischen unterschiedlichen Datenbanken importierbar
  ist,
- Goal- und Planning-Agent aus einem allgemeinen Projektziel einen
  überprüfbaren Vorschlag für Docs, Meilensteine und Karten erstellen,
- ein Projekt ohne Repository oder Entwicklungsfunktionen vollständig
  verwendbar ist,
- Agent-Aktionen vollständig gescopt, abbrechbar, budgetiert und auditierbar
  sind,
- kein Agent ohne Freigabe Repository-Dateien oder externe Systeme verändert,
- Self-hosted ohne zentralen Hymui-Account vollständig funktioniert,
- zwei Instanzen Accounts entdecken, Einladungen austauschen und
  Berechtigungen ohne gemeinsame Benutzerdatenbank durchsetzen,
- Föderation abschaltbar ist und Allow-/Blocklisten wirksam sind,
- Board, Docs, Planner und Projekte keine blockierenden Fehler besitzen,
- Deutsch und Englisch vollständig sind,
- lange offene Sitzungen getestet wurden,
- README, README.de, Changelog, Installations- und Backup-Anleitung aktuell sind.

Die SemVer-kompatible Paketversion lautet `6.0.0-dev.0`. In der Oberfläche kann
die gewünschte Produktbezeichnung `v6.0.00-dev` angezeigt werden.

## 15. Nicht im ersten Release

- Live-Synchronisierung zwischen Local und Hosted
- Whiteboard
- native Mobile-Apps
- installierbare Windows-Local-/Desktop-Ausgabe
- Plugin-Marktplatz
- vollständig autonome Codeänderungen ohne menschliche Freigabe
- direkter Produktionszugriff für Agents
- unisolierte Ausführung fremder Befehle oder Plugin-Tools
- vollständige automatische Actor-Migration zwischen Heimatinstanzen
- weitere Datenbankdialekte außerhalb PGlite/PostgreSQL, MySQL, MariaDB und
  experimentellem MSSQL
- datenbankspezifische Funktionen ohne gleichwertigen Fallback

Neue Anbieter werden später nur über bestehende Ports ergänzt. Das Ziel „viele
Systeme unterstützen“ bedeutet standardisierte Protokolle, Contract-Tests und
austauschbare Adapter – nicht unkontrollierte Sonderfälle im Hymui-Core.
