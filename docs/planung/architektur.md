# NEXUS-SYNC — Architecture Document

> **Status:** Entwurf / Planning
> **Erstellt:** 2026-05-14
> **Version:** 0.2

---

## 0. Brand / Logo

```
┌─────────────────────────────────────┐
│                                     │
│    ╭━━━━━━━━━━━━━━━━━━━━━━━━━━╮    │
│    ┃                           ┃    │
│    ┃  ╔═══╗   ╔═══╗           ┃    │
│    ┃  ║   ║   ║   ║   Mint    ┃    │
│    ┃  ║ H ║   ║ H ║   #3CC79A ┃    │
│    ┃  ║   ║   ║   ║           ┃    │
│    ┃  ╚═══╝   ╚═══╝           ┃    │
│    ╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯    │
│                                     │
└─────────────────────────────────────┘
```

**Hatches Logo Treatment** — Mint Squircle · weißes H · perspective Crossbar
- *Primary:* Mint `#3CC79A` → `#138A6E` gradient
- *Mark:* Weißes "H" auf Mint Squircle
- *Wordmark:* "hatches" in Inter 700, mit grünem Glow-Dot

---

## 1. Vision & Overview

NEXUS-SYNC ist ein **lokal-first Messenger + Streaming-Platform**, inspiriert von Discord, aber mit Fokus auf **Privatsphäre, Dezentralisierung und Selbsthosting**.

Das Kernprinzip: **Deine Daten belong to dir** — lokal gespeichert, E2E-verschlüsselt, nur transparent syncen wenn du es willst und einem Team beitrittst.


**Für Agent Developer:** NEXUS-SYNC bietet eine offene **Agent API**, damit AI Agents als vollwertige Teilnehmer in Channels, Streams und Teams agieren können — mit eigener Identität, verschlüsselter Kommunikation und Zugriff auf alle Plattform-Features.

---

## 2. Agent API für Agent Developers

---

### 2.1 Konzept

```
┌─────────────────────────────────────────────────────────────────┐
│                       AGENT DEVELOPER                            │
│  Buildet einen AI Agent → Registriert ihn → Läuft lokal        │
│                            │                                    │
│                            ▼                                    │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    AGENT API                               │ │
│  │  (Local SDK / Remote Gateway)                             │ │
│  └───────────────────────────────────────────────────────────┘ │
│                            │                                    │
│         ┌──────────────────┼──────────────────┐                 │
│         ▼                  ▼                  ▼                 │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐            │
│  │  Channels   │   │   Streams   │   │    Teams    │            │
│  │  lesen/    │   │   hosten/   │   │  beitreten/ │            │
│  │  schreiben  │   │   ansehen   │   │  verwalten  │            │
│  └─────────────┘   └─────────────┘   └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

**Warum? (Use Cases)**

| Use Case | Beschreibung |
|----------|---------------|
| **AI Companion** | Persönlicher Agent der in deinen Channels liest und antwortet |
| **Team Assistant** | Agent der Team-Meetings joined, transkribiert, zusammenfasst |
| **Content Moderator** | Agent der Nachrichten prüft, moderiert, filtert |
| **Stream Companion** | Agent der Live-Streams kommentiert, Q&A führt |
| **Knowledge Agent** | Liest Dokumentation, beantwortet Fragen in Channels |
| **Automated Actions** | Agent führt Tasks aus (Reminders, Tickets, etc.) |
| **Multi-Agent Chat** | Agent-zu-Agent Kommunikation für verteilte Systeme |
| **Agent Networks** | Agenten verschiedener Developer interagieren über Teams |

### 2.2 Agent Identity

Jeder Agent hat eine eigene Identity — vergleichbar mit einem User-Account, aber für Machines:

```typescript
interface AgentIdentity {
  agentId: string;           // UUID, global eindeutig
  developerId: string;       // UUID des Agent-Entwicklers
  displayName: string;      // "@yuri-ai", "Coding-Assistant"
  description: string;      // "General purpose coding assistant"
  avatarUrl?: string;
  
  // Cryptografische Keys
  publicKey: string;         // Für E2E-Verschlüsselung
  signingKey: string;       // Für Nachrichten-Signatur (Ed25519)
  
  // Capabilities (was kann der Agent)
  capabilities: AgentCapabilities;
  
  // Rechte
  permissions: Permission[];
  
  // Metadata
  version: string;          // Agent-Version
  endpoint?: string;        // Optional: Remote-Endpoint falls Agent extern läuft
  createdAt: number;
}


interface AgentCapabilities {
  canReadChannels: boolean;
  canWriteMessages: boolean;
  canHostStream: boolean;
  canWatchStream: boolean;
  canManageTeam: boolean;
  canInviteOthers: boolean;
  canCreateChannels: boolean;
}
```

### 2.3 Agent SDK

**Location:** `packages/agent-sdk`

```typescript
import { NexusAgent } from '@nexus-sync/agent-sdk';

// Agent erstellen
const agent = new NexusAgent({
  name: 'yuri-ai',
  description: 'Personal assistant for CoreNEXUS',
  capabilities: {
    canReadChannels: true,
    canWriteMessages: true,
    canHostStream: false,
    canWatchStream: true,
  }
});


// Mit Gateway verbinden
await agent.connect({
  gatewayUrl: 'ws://localhost:8080',
  teamId: 'team_core',
  authToken: process.env.AGENT_AUTH_TOKEN
});

// Channel abonnieren
const channel = agent.joinChannel('general');
channel.on('message', async (msg) => {
  if (msg.content.startsWith('@yuri')) {
    const reply = await agent.think(msg.content);
    channel.send(reply);
  }
});

// Stream beobachten
const stream = agent.watchStream('stream_live_123');
stream.on('data', (frame) => { /* ... */ });

// Cleanup
await agent.disconnect();
```

### 2.4 Agent API Endpoints

**Für Agent-Developer, die nicht das SDK nutzen wollen:**

```
# Agent Registration
POST   /api/v1/agents/register
GET    /api/v1/agents/:agentId
PUT    /api/v1/agents/:agentId
DELETE /api/v1/agents/:agentId

# Authentication
POST   /api/v1/agents/auth/token        # Agent-spezifisches Token
POST   /api/v1/agents/auth/refresh

# Channels
GET    /api/v1/teams/:teamId/channels
POST   /api/v1/channels/:channelId/subscribe
DELETE /api/v1/channels/:channelId/unsubscribe

# Messages
GET    /api/v1/channels/:channelId/messages
POST   /api/v1/channels/:channelId/messages
PUT    /api/v1/messages/:messageId
DELETE /api/v1/messages/:messageId

# Streams
POST   /api/v1/streams/start
POST   /api/v1/streams/:streamId/view
DELETE /api/v1/streams/:streamId/leave

# Teams
GET    /api/v1/teams/:teamId
POST   /api/v1/teams/:teamId/join
DELETE /api/v1/teams/:teamId/leave

# Real-time Events (WebSocket)
WS     /api/v1/agents/events
```

**Request/Response Format:**

```json
// POST /api/v1/channels/:channelId/messages
{
  "content": "encrypted_content_base64",
  "attachments": [],
  "replyTo": "msg_456",
  "sign": "ed25519_signature"
}


// Response
{
  "messageId": "msg_789",
  "timestamp": 1715664000000,
  "status": "delivered"
}
```


### 2.5 Agent Authentication

**Agent Token Flow:**


```
1. Developer registers Agent → bekommt agentId + secret
2. Agent authenticates → POST /auth/token mit agentId + secret
3. Gateway returns JWT (mit agentId, capabilities, teamId scopes)
4. Agent nutzt JWT für alle API calls
5. JWT expires → refresh mit /auth/refresh
```

**JWT Structure:**

```json
{
  "sub": "agent_abc123",
  "developerId": "dev_xyz",
  "teamIds": ["team_core", "team_personal"],
  "capabilities": {
    "canReadChannels": true,
    "canWriteMessages": true,
    ...
  },
  "iat": 1715664000,
  "exp": 1715667600
}
```

### 2.6 Agent Permissions & Capabilities

**Permission Model:**

```
Team Owner
  └── kann Agents einladen/entfernen
  └── kann Agent-Capabilities einschränken
  └── kann Feature-Flags setzen

Agent Developer
  └── kann eigene Agents registrieren
  └── kann Agents aktualisieren/löschen
  └── muss Agent-Secret sicher speichern

Agent (zur Laufzeit)
  └── kann nur das, was ihm erlaubt wurde
  └── pro Team unterschiedliche Rechte möglich
  └── Identity ist an seinen Public Key gebunden
```

**Capability Scopes:**

| Capability | Beschreibung |
|------------|---------------|
| `canReadChannels` | Channel-Nachrichten lesen |
| `canWriteMessages` | Nachrichten senden |
| `canHostStream` | Stream starten/hosten |
| `canWatchStream` | Stream ansehen (View Only) |
| `canManageTeam` | Team-Einstellungen ändern |
| `canInviteOthers` | Andere Agents/User einladen |
| `canCreateChannels` | Neue Channels erstellen |

### 2.7 Streaming API für Agents

**Agent als Stream Host:**

```typescript
// Stream starten
const stream = await agent.startStream({
  channelId: 'stream_channel',
  title: 'Live Coding: Building a distributed system',
  settings: {
    maxViewers: 100,
    recordingEnabled: true,
    chatEnabled: true
  }
});

// Video Frames senden
stream.sendFrame(videoFrame);  // H.264/RTX encoded

// Stream beenden
await stream.end();
```

**Agent als Stream Viewer:**

```typescript
// Stream beobachten
const viewer = agent.watchStream('stream_abc');

viewer.on('frame', (frame) => {
  // Video Frame verarbeiten
});

viewer.on('chat', (msg) => {
  // Chat Message
});

viewer.on('reaction', (emoji) => {
  // Viewer Reaction
});

await viewer.leave();
```

### 2.8 Multi-Agent Patterns

**Pattern 1: Agent Pipeline**

```
User → @assistant-1 (Router) → @expert-crypto (Antwort) → Channel
                                    ↓
                              @assistant-1 (Zusammenfassung)
```

**Pattern 2: Agent Committee**

```
User fragt → Parallel:
             ├── @analyst-data
             ├── @analyst-trends
             └── @analyst-risk
             → @synthesizer (Zusammenfassung) → Channel
```

**Pattern 3: Handoff**

```
@general-bot erkennt Intent → @specialized-bot übernehmen lassen
```

**Pattern 4: Cross-Team Agents**

```
Team-A Agent-1  ←→  Shared Channel  ←→  Team-B Agent-2
                      (beide Teams)
```

### 2.9 Agent Registry ( öffentlich)

**Offenes Agent-Verzeichnis** für Discovery:

```
GET /api/v1/agents registry
Response:
{
  "agents": [
    {
      "agentId": "agent_yuri",
      "displayName": "Yuri",
      "description": "Personal AI assistant",
      "developerId": "dev_core",
      "capabilities": [...],
      "rating": 4.8,
      "tags": ["assistant", "coding", "german"]
    }
  ]
}
```

**Agent hinzufügen:**


```typescript
// Optional: Agent öffentlich listen
await agent.registerPublic({
  tags: ['assistant', 'coding'],
  description: 'General purpose coding assistant',
  website: 'https://yuri.ai'
});
```

### 2.10 Security & Safety

**Developer Verification:**

- Developer muss sich authenticieren (OAuth/WebAuthn)
- Agent-Code kann verifiziert werden (optional signing)
- Agent-Aktionen werden geloggt (Audit Trail)

**Rate Limiting:**

- Per Agent: X messages/minute
- Per Developer: Y agents pro Team
- Per Team: Z total API calls/minute

**Safety Features:**

| Feature | Beschreibung |
|---------|---------------|
| **Content Filter** | Agent kann markiert werden dass Nachrichten gefiltert werden |
| **Human Approval** | Bestimmte Actions brauchen Human-OK vorher |
| **Sandbox Mode** | Agent kann nur lesen, nicht schreiben |
| **Quota Alerts** | Developer wird gewarnt bei hohem API-Usage |

---

## 3. Design-Prinzipien

| Prinzip | Beschreibung |
|---------|-------------|
| **Lokal-First** | Alle Daten landen zuerst lokal. Server sind optional und transparent. |
| **Privacy by Default** | Private Inhalte sind E2E-verschlüsselt, auch auf dem Server. |
| **Team-Sync Opt-In** | Nur wenn du einem Team beitrittst → Daten syncen zum Server. |
| **Self-Hostable** | Jeder kann seinen eigenen Gateway betreiben. Kein vendor lock-in. |
| **Host-Kontrolle** | Server-Hosts können Features ein-/ausschalten (Backup, Sync, Streaming). |
| **Agent-First** | AI Agents sind First-Class Citizens mit eigener Identity und Capabilities. |

---

## 4. System-Architektur

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   UI Layer   │  │  Sync Engine │  │  Crypto Engine       │   │
│  │  (Web/TUI)   │  │  (Local DB)  │  │  (E2E En/Decryption) │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│         │                │                     │                │
│         └────────────────┴─────────────────────┘                │
│                          │                                        │
│                    Local SQLite                                 │
│                  (IndexedDB on Web)                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ (wenn Team beigetreten)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SYNC GATEWAY                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  HTTP/WebSocket │  │  Sync Logic │  │  Storage Adapter    │   │
│  │  Server       │  │  (Conflict   │  │  (S3/Local/Cloud)   │   │
│  │              │  │  Resolution)  │  │                     │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND SERVICES (Optional)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Stream Hub  │  │  File Backup │  │  Team Management     │   │
│  │  (WebRTC)    │  │  Service     │  │  & Billing           │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Datenmodell

### 5.1 Entitäten (User + Agent)

```
Agent
├── id: UUID
├── developerId: UUID
├── displayName: String
├── description: String
├── avatar: String (URL)
├── publicKey: String
├── signingKey: String (Ed25519)
├── capabilities: AgentCapabilities
├── permissions: Permission[]
├── endpoint: String (optional, falls extern)
├── version: String
└── createdAt: Timestamp
```

**User:**
```
User
├── id: UUID
├── publicKey: String
├── privateKey: String (lokal gespeichert, NIEMALS zum Server)
├── displayName: String
├── avatar: String (URL oder inline)
└── settings: JSON
```

**Team:**
```
Team
├── id: UUID
├── name: String
├── ownerId: UUID
├── members: UUID[]
├── gatewayUrl: String
├── features: FeatureFlags
│   ├── syncEnabled: Boolean
│   ├── backupEnabled: Boolean
│   ├── streamingEnabled: Boolean
│   └── maxStorageBytes: Number
└── encryptionKey: String (shared secret für Team, E2E)
```

**Channel:**
```
Channel
├── id: UUID
├── teamId: UUID
├── name: String
├── type: "public" | "private" | "stream"
├── encryptionKey: String (pro Channel)
└── messages: Message[]
```

**Message:**
```
Message
├── id: UUID
├── channelId: UUID
├── authorId: UUID
├── content: String (verschlüsselt)
├── attachments: Attachment[]
├── createdAt: Timestamp
└── editedAt: Timestamp (nullable)
```

**Attachment:**
```
Attachment
├── id: UUID
├── messageId: UUID
├── type: "file" | "image" | "video" | "audio"
├── url: String (verschlüsselt referenziert)
├── encryptionKey: String
└── metadata: JSON
```

**Stream:**
```
Stream
├── id: UUID
├── channelId: UUID
├── hostId: UUID
├── status: "live" | "ended"
├── webrtcSession: String
└── viewers: UUID[]
```

### 5.2 Lokale Datenbank (SQLite Schema)

```sql
-- Agent-spezifische Tabellen
CREATE TABLE local_agents (
    id TEXT PRIMARY KEY,
    developer_id TEXT,
    display_name TEXT,
    public_key TEXT,
    signing_key_encrypted BLOB,
    capabilities_encrypted BLOB,
    endpoint TEXT,
    updated_at INTEGER
);

-- Lokale Kopie, alles verschlüsselt gespeichert
CREATE TABLE local_users (
    id TEXT PRIMARY KEY,
    display_name TEXT,
    avatar_url TEXT,
    public_key TEXT,
    settings_encrypted BLOB,
    updated_at INTEGER
);

CREATE TABLE local_teams (
    id TEXT PRIMARY KEY,
    name TEXT,
    gateway_url TEXT,
    features_encrypted BLOB,
    joined_at INTEGER,
    last_sync_at INTEGER
);

CREATE TABLE local_channels (
    id TEXT PRIMARY KEY,
    team_id TEXT REFERENCES local_teams(id),
    name TEXT,
    type TEXT,
    encryption_key_encrypted BLOB,
    last_message_at INTEGER
);

CREATE TABLE local_messages (
    id TEXT PRIMARY KEY,
    channel_id TEXT REFERENCES local_channels(id),
    author_id TEXT,
    content_encrypted BLOB,
    attachments_encrypted BLOB,
    created_at INTEGER,
    sync_status TEXT DEFAULT 'local',  -- local | synced | pending
    FOREIGN KEY (channel_id) REFERENCES local_channels(id)
);

CREATE TABLE sync_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT,  -- message | channel | team
    entity_id TEXT,
    operation TEXT,    -- create | update | delete
    payload_encrypted BLOB,
    created_at INTEGER,
    status TEXT DEFAULT 'pending'  -- pending | synced | failed
);
```

---

## 6. Verschlüsselungs-Strategie

### 6.1 Schlüssel-Hierarchie

```
User Master Key (from password/phrase)
    │
    ├── User Identity Key Pair (asymmetrisch)
    │   ├── Public Key → in Team-Vault
    │   └── Private Key → lokal ONLY, niemals zum Server
    │
    ├── User Symmetric Key (für lokale Daten)
    │
    └── Team Shared Secrets
            │
            ├── [Team-1] Encryption Key
            ├── [Team-2] Encryption Key
            └── ...

Agent Identity Keys (separat von User Keys)
    │
    ├── Agent Signing Key (Ed25519, für Nachrichten-Signatur)
    └── Agent Encryption Key (X25519, für E2E mit anderen Agents/Users)
```

### 6.2 Verschlüsselungs-Flow

```
Sender                           Server                          Empfänger
  │                                │                                │
  │ [E2E Encrypted Message]        │                                │
  │────── (encrypted) ─────────────►│ Server sieht nur Metadaten     │
  │                                │ (channelId, timestamp, size)   │
  │                                │                                │
  │                                │ [E2E Encrypted Message]        │
  │                                │─────── (encrypted) ──────────► │
  │                                │                                │
```

### 6.3 Private vs. Team Inhalte

| Inhalt | Speicherort | Verschlüsselt | Sync |
|--------|-------------|----------------|------|
| Private Nachrichten (DM) | Lokal + Server | E2E | Nur wenn Team |
| Team-Nachrichten | Lokal + Server | Team-Key | Ja, wenn Sync an |
| Private Dateien | Lokal | Master-Key | Nur wenn explizit |
| Team-Dateien | Lokal + Server | Team-Key | Ja, wenn Sync an |

---

## 7. Sync-Protokoll

### 7.1 Sync-Zustandsmaschine

```
                    ┌─────────────┐
                    │   LOCAL     │ ← Neue Nachricht erstellt
                    └──────┬──────┘
                           │ (Team beigetreten & Sync an)
                           ▼
                    ┌─────────────┐
              ┌─────►│  PENDING   │ ← Wartet auf Sync
              │      └──────┬──────┘
              │             │ (Gateway erreichbar)
              │             ▼
              │      ┌─────────────┐
              │      │  SYNCING    │ ← Upload in Progress
              │      └──────┬──────┘
              │             │
              │      ┌──────┴──────┐
              │      ▼             ▼
              │ (erfolgreich)  (fehlgeschlagen)
              │      │             │
              │      ▼             ▼
              │ ┌─────────┐  ┌───────────┐
              │ │ SYNCED  │  │  FAILED   │ → Retry Queue
              │ └─────────┘  └───────────┘
              │
              │ (Offline / Sync aus)
              └────────────────────────► LOCAL
```

### 7.2 Conflict Resolution

**Strategy: Last-Write-Wins mit Vector Clocks**

```json
{
  "entity_id": "msg_123",
  "vector_clock": {
    "device_A": 5,
    "device_B": 3
  },
  "content": "...",
  "server_content": "..."
}
```

Bei Konflikt:
1. Höchster Vector-Clock gewinnt
2. Bei Gleichstand: merge automatisch oder User-Manual-Resolution

### 7.3 Sync-Endpoints

```
POST /sync/push
  Body: { entities: EncryptedEntity[], vectorClock: {} }
  Response: { accepted: [], rejected: [], serverClock: {} }

GET /sync/pull?since={vectorClock}
  Response: { entities: EncryptedEntity[], vectorClock: {} }

WebSocket /sync/live
  Bidirectional real-time sync
  Events: push, pull, subscribe, unsubscribe
```

---

## 8. Feature-Flags (Host-Kontrolle)

Server-Hosts können pro Team konfigurieren:

```json
{
  "teamId": "team_abc",
  "features": {
    "sync": {
      "enabled": true,
      "maxEntitiesPerSync": 1000
    },
    "backup": {
      "enabled": true,
      "storageLimitBytes": 5368709120,  // 5GB
      "retentionDays": 30
    },
    "streaming": {
      "enabled": true,
      "maxConcurrentStreams": 5,
      "recordingEnabled": true
    },
    "paid": {
      "enabled": true,
      "pricePerMonth": 5.00,
      "currency": "EUR"
    }
  }
}
```

---

## 9. Tech-Stack Empfehlungen

### 9.1 Client (WebApp)

| Layer | Option | Empfehlung |
|-------|--------|------------|
| **Framework** | React / Svelte / Vue | **Svelte** (kompiliert klein, reaktiv) |
| **State** | Zustand / Redux / Jotai | **Zustand** (simpler, persistierbar) |
| **Local DB** | SQLite (via WASM) / Dexie (IndexedDB) | **Dexie.js** (IndexedDB wrapper) |
| **Crypto** | TweetNaCl / libsodium | **TweetNaCl.js** (E2E, bewährt) |
| **UI-Komponenten** | Shadcn/ui / Radix | **Shadcn/ui** (Headless, anpassbar) |
| **Real-time** | WebSocket / WebRTC | **WebSocket** für Sync, **WebRTC** für Streaming |

### 9.2 Gateway/Server

| Layer | Option | Empfehlung |
|-------|--------|------------|
| **Language** | Rust / Go / Node.js | **Rust** ( performant, type-safe) |
| **WebFramework** | Actix / Iron / Axum (Rust) | **Axum** (ergonomisch, async) |
| **DB** | PostgreSQL / SQLite / RocksDB | **PostgreSQL** (für prod), **SQLite** (für self-host) |
| **Cache** | Redis / Memcached | **Redis** (pub/sub für WebSocket) |
| **Object Storage** | S3 / MinIO / Local | **MinIO** (S3-kompatibel, self-hostbar) |
| **Auth** | JWT / Session | **JWT** (stateless, für Microservices) |

### 9.3 Streaming (Optional)

| Layer | Option |
|-------|--------|
| **Signaling** | self-hosted STUN/TURN (z.B. Coturn) |
| **WebRTC SFU** | mediasoup / Ion-SFU / LiveKit |
| **Recording** | GStreamer / FFmpeg |

---

## 10. Projektstruktur (Monorepo)

```
nexus-sync/
├── packages/
│   ├── client/                 # WebApp
│   │   ├── src/
│   │   │   ├── components/    # UI Components
│   │   │   ├── stores/        # Zustand Stores
│   │   │   ├── crypto/        # E2E Crypto Engine
│   │   │   ├── sync/          # Sync Engine
│   │   │   ├── db/            # Local DB (Dexie)
│   │   │   ├── views/         # Pages / Routes
│   │   │   └── App.svelte
│   │   └── package.json
│   │
│   ├── gateway/                # Sync Gateway Server
│   │   ├── src/
│   │   │   ├── handlers/     # HTTP/WebSocket Handler
│   │   │   ├── sync/          # Sync Logic
│   │   │   ├── storage/       # Storage Adapter
│   │   │   └── main.rs
│   │   └── package.json
│   │
│   └── shared/                 # Geteilte Types / Protokolle
│       ├── types/             # TypeScript Types
│       ├── proto/             # Protocol Buffer Definitions
│       └── crypto/            # Geteilte Crypto-Utils
│
├── docs/
│   └── ARCHITECTURE.md        # Dieses Dokument
│
├── SPEC.md                    # Funktionsspezifikation
│
└── README.md
```

---

## 11. Proof of Concept (PoC) — Nächste Schritte

### Phase 1: Minimal Viable Product

1. **Client Setup** (Svelte + Dexie + TweetNaCl)
   - Local DB mit encrypt/decrypt
   - User Key generieren (Passwort-basiert)

2. **Gateway Minimal** (Node.js oder Rust)
   - Auth: JWT
   - Sync-Endpoints: push/pull
   - WebSocket für Live-Sync

3. **Agent SDK Minimal**
   - Agent Registration + Auth Flow
   - Agent mit Gateway verbinden
   - Channel beitreten, Nachrichten lesen/schreiben

4. **Kanal erstellen** (Team beitreten)
   - Shared Key Austausch (Diffie-Hellman)
   - Nachrichten senden/empfangen

### Phase 2: Erweiterungen

4. **File Sharing** (verschlüsselt)
5. **Streaming** (WebRTC Integration)
6. **Host Dashboard** (Feature-Flags setzen)
7. **Agent Registry** (öffentlich)

### Phase 3: Production

8. **Mobile Apps** (iOS/Android)
9. **Backup Service** (S3/MinIO)
10. **Paid Features** (Billing Integration)
11. **Agent Marketplace** (paid Agents)

---

## 12. Offene Fragen / Decisions Needed

| Frage | Optionen | Empfehlung |
|-------|---------|------------|
| **Protokoll** | Custom JSON over WebSocket oder gRPC oder Matrix-Compat? | Eigens, Matrix-kompatibel wäre nice aber komplex |
| **Identity** | Passwort-basiert oder SSH-Key oder WebAuthn? | Passwort + Optional WebAuthn |
| **File Storage** | Verschlüsselte Chunks auf Server oder komplett Client-side? | Client-side verschlüsseln, Server speichert Blobs |
| **Sync Frequency** | Real-time (WebSocket) oder poll-basiert? | WebSocket, mit poll als fallback |
| **Agent Runtime** | Agent läuft lokal (SDK embedded) oder remote (via endpoint)? | Beides, SDK für lokale Agents, endpoint URL für remote |
| **Agent Signing** | Ed25519 Signatur für alle Agent-Nachrichten? | Ja, für authenticity + integrity |
| **Agent Payments** | Pays-per-agent oder pays-per-team oder subscription? | Hybrid: base subscription + per-agent add-ons |

---

## 13. Ähnliche Projekte / Referenzen

- **Matrix/Element** — closest, aber komplexer, weniger fokussiert auf Streaming
- **Session** — E2E Messenger, Onion-Routing, aber kein Team-Feature
- **Briar** — dezentral, aber nur Android, kein Streaming
- **Delta Chat** — Email-basiert, interessant aber nicht vergleichbar
- **Discord** — Inspiration, aber closed source, kein self-host

**Differenziator:** NEXUS-SYNC ist **Lokal-first + Self-host + Streaming-integriert + Agent-First** in einem.

---

*Letztes Update: 2026-05-14 — v0.2 mit Agent API*