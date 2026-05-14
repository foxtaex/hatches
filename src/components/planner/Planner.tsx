import { useState, useEffect, useCallback, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft, faChevronRight, faPlus, faXmark, faTrash,
  faCalendarDays, faCalendarWeek, faList, faFileArrowDown,
} from "@fortawesome/free-solid-svg-icons";

interface Team { id: number; name: string; color: string }
interface User { id: number; username: string; displayName: string | null }
interface Event {
  id: number; title: string; description: string | null;
  start: string; end: string | null; allDay: boolean; color: string;
  recurring: string | null; recurringEnd: string | null;
  teamId: number | null; team: Team | null;
  createdById: number | null; createdBy: User | null;
}

interface DueCard {
  id: number;
  title: string;
  dueDate: string;
  priority: string | null;
  column: { title: string; board: { id: number; name: string } };
}

type ViewMode = "month" | "week" | "agenda";

const WEEKDAYS_LONG = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
const WEEKDAYS_SHORT = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];
const COLORS = [
  "#3CC79A", "#3b82f6", "#a855f7", "#f97316", "#ef4444",
  "#eab308", "#14b8a6", "#ec4899", "#6366f1", "#84cc16",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  const d = new Date(year, month, 1).getDay();
  return (d + 6) % 7; // Mon-based
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}
function getWeekStart(date: Date) {
  // Monday as week start
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}
function pad(n: number) { return String(n).padStart(2, "0"); }
function dateToInputValue(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function dateToDateValue(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

interface EventFormData {
  title: string; description: string; start: string; end: string;
  allDay: boolean; color: string; recurring: string; teamId: string;
}
const emptyForm = (): EventFormData => ({
  title: "", description: "", start: "", end: "",
  allDay: false, color: "#3CC79A", recurring: "", teamId: "",
});

// ── Event Chip ───────────────────────────────────────────
function EventChip({ event, onClick }: { event: Event; onClick: () => void }) {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="text-[10px] font-medium px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity"
      style={{ background: event.color + "33", color: event.color, border: `1px solid ${event.color}44` }}
    >
      {!event.allDay && <span className="opacity-70 mr-1">{formatTime(event.start)}</span>}
      {event.title}
    </div>
  );
}

// ── Due Card Chip ────────────────────────────────────────
function DueCardChip({ card }: { card: DueCard }) {
  return (
    <a
      href={`/board?boardId=${card.column.board.id}`}
      onClick={e => e.stopPropagation()}
      className="text-[10px] font-medium px-1.5 py-0.5 rounded truncate flex items-center gap-1 hover:opacity-80 transition-opacity"
      style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)", border: "1px dashed rgba(255,255,255,0.15)" }}
      title={`${card.column.board.name} › ${card.column.title}`}
    >
      <span>📌</span>
      {card.title}
    </a>
  );
}

// ── Month View ───────────────────────────────────────────
function MonthView({ year, month, events, dueCards, today, onDayClick, onEventClick }: {
  year: number; month: number; events: Event[]; dueCards: DueCard[]; today: Date;
  onDayClick: (day: number) => void; onEventClick: (e: Event) => void;
}) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  function eventsOnDay(day: number) {
    return events.filter(e => {
      const d = new Date(e.start);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  }

  function dueCardsOnDay(day: number) {
    return dueCards.filter(c => {
      const d = new Date(c.dueDate);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS_SHORT.map(d => (
          <div key={d} className="text-center text-xs font-medium text-white/40 uppercase tracking-wider py-2">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} className="h-28 rounded-xl" />;
          const isToday = isSameDay(new Date(year, month, day), today);
          const dayEvents = eventsOnDay(day);
          const dayCards = dueCardsOnDay(day);
          const totalItems = dayEvents.length + dayCards.length;
          const maxShown = 3;
          const shownEvents = dayEvents.slice(0, maxShown);
          const remainingSlots = maxShown - shownEvents.length;
          const shownCards = dayCards.slice(0, Math.max(0, remainingSlots));
          const overflow = totalItems - shownEvents.length - shownCards.length;
          return (
            <div
              key={i}
              onClick={() => onDayClick(day)}
              className="h-28 rounded-xl p-2 cursor-pointer transition-all border border-transparent hover:border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.04)]"
            >
              <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-1 ${isToday ? "bg-[#3CC79A] text-white" : "text-white/70"}`}>
                {day}
              </div>
              <div className="flex flex-col gap-0.5 overflow-hidden">
                {shownEvents.map(e => (
                  <EventChip key={`e-${e.id}`} event={e} onClick={() => onEventClick(e)} />
                ))}
                {shownCards.map(c => (
                  <DueCardChip key={`c-${c.id}`} card={c} />
                ))}
                {overflow > 0 && (
                  <div className="text-[10px] text-white/40 px-1">+{overflow} weitere</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Week View ────────────────────────────────────────────
function WeekView({ weekStart, events, dueCards, today, onDayClick, onEventClick }: {
  weekStart: Date; events: Event[]; dueCards: DueCard[]; today: Date;
  onDayClick: (date: Date) => void; onEventClick: (e: Event) => void;
}) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  function eventsOnDate(date: Date) {
    return events.filter(e => isSameDay(new Date(e.start), date))
      .sort((a, b) => a.start.localeCompare(b.start));
  }

  function dueCardsOnDate(date: Date) {
    return dueCards.filter(c => isSameDay(new Date(c.dueDate), date));
  }

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="grid grid-cols-7 gap-2 min-h-[500px]">
        {days.map((day, i) => {
          const isToday = isSameDay(day, today);
          const dayEvents = eventsOnDate(day);
          const dayCards = dueCardsOnDate(day);
          return (
            <div
              key={i}
              onClick={() => onDayClick(day)}
              className={`flex flex-col rounded-xl border cursor-pointer transition-all group ${isToday ? "border-[rgba(60,199,154,0.3)] bg-[rgba(60,199,154,0.04)]" : "border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]"}`}
            >
              {/* Day header */}
              <div className={`flex flex-col items-center py-3 border-b ${isToday ? "border-[rgba(60,199,154,0.2)]" : "border-[rgba(255,255,255,0.06)]"}`}>
                <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">{WEEKDAYS_SHORT[i]}</span>
                <span className={`text-lg font-semibold mt-0.5 ${isToday ? "text-[#3CC79A]" : "text-white/80"}`}>{day.getDate()}</span>
                <span className="text-[10px] text-white/30">{MONTHS[day.getMonth()].slice(0, 3)}</span>
              </div>

              {/* Events + Due Cards */}
              <div className="flex-1 p-2 flex flex-col gap-1 overflow-y-auto">
                {dayEvents.map(e => (
                  <div
                    key={`e-${e.id}`}
                    onClick={(ev) => { ev.stopPropagation(); onEventClick(e); }}
                    className="p-1.5 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ background: e.color + "22", border: `1px solid ${e.color}33` }}
                  >
                    <div className="text-[10px] font-medium truncate" style={{ color: e.color }}>{e.title}</div>
                    {!e.allDay && (
                      <div className="text-[9px] text-white/40 mt-0.5">{formatTime(e.start)}</div>
                    )}
                    {e.allDay && <div className="text-[9px] text-white/40 mt-0.5">Ganztägig</div>}
                  </div>
                ))}
                {dayCards.map(c => (
                  <DueCardChip key={`c-${c.id}`} card={c} />
                ))}
                {dayEvents.length === 0 && dayCards.length === 0 && (
                  <div className="flex-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <FontAwesomeIcon icon={faPlus} className="w-3 h-3 text-white/20" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Agenda View ──────────────────────────────────────────
function AgendaView({ events, dueCards, today, onEventClick }: {
  events: Event[]; dueCards: DueCard[]; today: Date; onEventClick: (e: Event) => void;
}) {
  // Next 60 days
  const groups = useMemo(() => {
    const map = new Map<string, { date: Date; events: Event[]; cards: DueCard[] }>();
    const end = new Date(today);
    end.setDate(end.getDate() + 60);

    // Add calendar events
    events
      .filter(e => {
        const d = new Date(e.start);
        return d >= today && d <= end;
      })
      .sort((a, b) => a.start.localeCompare(b.start))
      .forEach(e => {
        const d = new Date(e.start);
        d.setHours(0, 0, 0, 0);
        const key = d.toISOString();
        if (!map.has(key)) map.set(key, { date: d, events: [], cards: [] });
        map.get(key)!.events.push(e);
      });

    // Add due-dated kanban cards
    dueCards
      .filter(c => {
        const d = new Date(c.dueDate);
        return d >= today && d <= end;
      })
      .forEach(c => {
        const d = new Date(c.dueDate);
        d.setHours(0, 0, 0, 0);
        const key = d.toISOString();
        if (!map.has(key)) map.set(key, { date: d, events: [], cards: [] });
        map.get(key)!.cards.push(c);
      });

    return [...map.values()].sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [events, dueCards, today]);

  if (groups.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-white/30 gap-3">
        <FontAwesomeIcon icon={faCalendarDays} className="w-10 h-10 opacity-20" />
        <span className="text-sm">Keine Termine in den nächsten 60 Tagen</span>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        {groups.map(({ date, events: dayEvents, cards: dayCards }) => {
          const isToday = isSameDay(date, today);
          return (
            <div key={date.toISOString()}>
              {/* Date header */}
              <div className={`flex items-center gap-3 mb-3 ${isToday ? "text-[#3CC79A]" : "text-white/50"}`}>
                <div className={`text-2xl font-bold leading-none ${isToday ? "text-[#3CC79A]" : "text-white/70"}`}>
                  {date.getDate()}
                </div>
                <div>
                  <div className="text-sm font-medium">{WEEKDAYS_LONG[(date.getDay() + 6) % 7]}</div>
                  <div className="text-xs opacity-70">{MONTHS[date.getMonth()]} {date.getFullYear()}</div>
                </div>
                {isToday && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[rgba(60,199,154,0.15)] text-[#3CC79A] border border-[rgba(60,199,154,0.2)]">
                    Heute
                  </span>
                )}
              </div>

              {/* Events + Due Cards */}
              <div className="flex flex-col gap-2 pl-12">
                {dayEvents.map(e => (
                  <div
                    key={`e-${e.id}`}
                    onClick={() => onEventClick(e)}
                    className="flex items-start gap-3 p-3 rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ background: e.color + "18", border: `1px solid ${e.color}33` }}
                  >
                    <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: e.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-white/90">{e.title}</div>
                      {!e.allDay && (
                        <div className="text-xs text-white/50 mt-0.5">
                          {formatTime(e.start)}{e.end ? ` – ${formatTime(e.end)}` : ""}
                        </div>
                      )}
                      {e.allDay && <div className="text-xs text-white/50 mt-0.5">Ganztägig</div>}
                      {e.description && <p className="text-xs text-white/40 mt-1 line-clamp-2">{e.description}</p>}
                      {e.team && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ background: e.team.color }} />
                          <span className="text-xs text-white/40">{e.team.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {dayCards.map(c => (
                  <a
                    key={`c-${c.id}`}
                    href={`/board?boardId=${c.column.board.id}`}
                    className="flex items-start gap-3 p-3 rounded-xl hover:opacity-90 transition-opacity"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.12)" }}
                  >
                    <div className="w-1 self-stretch rounded-full flex-shrink-0 bg-white/20" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-white/60">📌 {c.title}</div>
                      <div className="text-xs text-white/35 mt-0.5">
                        {c.column.board.name} › {c.column.title}
                        {c.priority && <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium ${c.priority === "urgent" ? "bg-red-900/40 text-red-400" : c.priority === "high" ? "bg-orange-900/40 text-orange-400" : "bg-zinc-800 text-zinc-500"}`}>{c.priority}</span>}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Planner ─────────────────────────────────────────
export function Planner() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [weekStart, setWeekStart] = useState(() => getWeekStart(today));
  const [events, setEvents] = useState<Event[]>([]);
  const [dueCards, setDueCards] = useState<DueCard[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [form, setForm] = useState<EventFormData>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [view, setView] = useState<ViewMode>("month");

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDueCards = useCallback(async () => {
    try {
      const res = await fetch("/api/board/cards?withDueDate=true");
      const data = await res.json();
      setDueCards(Array.isArray(data) ? data : []);
    } catch {}
  }, []);

  const loadTeams = useCallback(async () => {
    try {
      const res = await fetch("/api/user/teams");
      setTeams(await res.json());
    } catch {}
  }, []);

  useEffect(() => { loadEvents(); loadTeams(); loadDueCards(); }, []);

  // Navigation
  function prevPeriod() {
    if (view === "month") {
      if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1);
    } else if (view === "week") {
      setWeekStart(ws => { const d = new Date(ws); d.setDate(d.getDate() - 7); return d; });
    }
  }
  function nextPeriod() {
    if (view === "month") {
      if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1);
    } else if (view === "week") {
      setWeekStart(ws => { const d = new Date(ws); d.setDate(d.getDate() + 7); return d; });
    }
  }
  function goToToday() {
    const t = new Date();
    setYear(t.getFullYear()); setMonth(t.getMonth());
    setWeekStart(getWeekStart(t));
  }

  function openCreate(date?: Date) {
    const base = date ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, 0) : new Date();
    setEditEvent(null);
    setForm({ ...emptyForm(), start: dateToInputValue(base) });
    setShowModal(true);
  }

  function openEdit(e: Event) {
    setEditEvent(e);
    setForm({
      title: e.title, description: e.description ?? "",
      start: e.start.slice(0, 16), end: e.end ? e.end.slice(0, 16) : "",
      allDay: e.allDay, color: e.color, recurring: e.recurring ?? "",
      teamId: e.teamId ? String(e.teamId) : "",
    });
    setShowModal(true);
  }

  async function saveEvent() {
    if (!form.title.trim() || !form.start) return;
    setSaving(true);
    try {
      const body = {
        title: form.title.trim(), description: form.description || null,
        start: form.start, end: form.end || null, allDay: form.allDay,
        color: form.color, recurring: form.recurring || null, recurringEnd: null,
        teamId: form.teamId ? Number(form.teamId) : null,
      };
      if (editEvent) {
        await fetch(`/api/events/${editEvent.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      } else {
        await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      }
      setShowModal(false);
      loadEvents();
    } finally {
      setSaving(false);
    }
  }

  async function deleteEvent(id: number) {
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    setEvents(ev => ev.filter(e => e.id !== id));
    setShowModal(false);
  }

  // Header label
  const headerLabel = useMemo(() => {
    if (view === "month") return `${MONTHS[month]} ${year}`;
    if (view === "week") {
      const end = new Date(weekStart);
      end.setDate(end.getDate() + 6);
      const startStr = `${weekStart.getDate()}. ${MONTHS[weekStart.getMonth()].slice(0, 3)}`;
      const endStr = weekStart.getMonth() === end.getMonth()
        ? `${end.getDate()}. ${MONTHS[end.getMonth()].slice(0, 3)}`
        : `${end.getDate()}. ${MONTHS[end.getMonth()].slice(0, 3)} ${end.getFullYear()}`;
      return `${startStr} – ${endStr} ${weekStart.getFullYear()}`;
    }
    return "Agenda";
  }, [view, year, month, weekStart]);

  const showNav = view !== "agenda";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center gap-3">
          {showNav && (
            <>
              <button onClick={prevPeriod} className="w-9 h-9 flex items-center justify-center rounded-lg bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)] transition-colors text-white/70 hover:text-white">
                <FontAwesomeIcon icon={faChevronLeft} className="w-3.5 h-3.5" />
              </button>
              <h2 className="text-lg font-semibold text-white/90 min-w-[220px] text-center">{headerLabel}</h2>
              <button onClick={nextPeriod} className="w-9 h-9 flex items-center justify-center rounded-lg bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)] transition-colors text-white/70 hover:text-white">
                <FontAwesomeIcon icon={faChevronRight} className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          {view === "agenda" && (
            <h2 className="text-lg font-semibold text-white/90">Agenda</h2>
          )}
          <button onClick={goToToday} className="px-3 py-1.5 text-sm rounded-lg bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)] text-white/60 hover:text-white/90 transition-colors">
            Heute
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-[rgba(255,255,255,0.06)] rounded-xl p-0.5">
            {([
              { key: "month", icon: faCalendarDays, label: "Monat" },
              { key: "week", icon: faCalendarWeek, label: "Woche" },
              { key: "agenda", icon: faList, label: "Agenda" },
            ] as const).map(({ key, icon, label }) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${view === key ? "bg-[rgba(255,255,255,0.1)] text-white" : "text-white/40 hover:text-white/70"}`}
                title={label}
              >
                <FontAwesomeIcon icon={icon} className="w-3 h-3" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          <a
            href="/api/events/export"
            download="hatches-planner.ics"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[rgba(255,255,255,0.07)] hover:bg-[rgba(255,255,255,0.11)] text-white/70 hover:text-white transition-colors"
            title="Kalender als .ics exportieren"
          >
            <FontAwesomeIcon icon={faFileArrowDown} className="w-3.5 h-3.5" />
            Export
          </a>
          <button onClick={() => openCreate()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[#3CC79A] hover:bg-[#34b389] text-white transition-colors">
            <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
            Neuer Termin
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Views */}
        {view === "month" && (
          <MonthView
            year={year} month={month} events={events} dueCards={dueCards} today={today}
            onDayClick={(day) => {
              setSelectedDay(selectedDay === day ? null : day);
            }}
            onEventClick={openEdit}
          />
        )}
        {view === "week" && (
          <WeekView
            weekStart={weekStart} events={events} dueCards={dueCards} today={today}
            onDayClick={(date) => openCreate(date)}
            onEventClick={openEdit}
          />
        )}
        {view === "agenda" && (
          <AgendaView events={events} dueCards={dueCards} today={today} onEventClick={openEdit} />
        )}

        {/* Month: Side panel for selected day */}
        {view === "month" && selectedDay && (
          <div className="w-72 flex-shrink-0 border-l border-[rgba(255,255,255,0.08)] bg-[rgba(12,12,12,0.6)] p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white/90 text-sm">{selectedDay}. {MONTHS[month]}</h3>
              <button
                onClick={() => openCreate(new Date(year, month, selectedDay))}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-[rgba(60,199,154,0.15)] hover:bg-[rgba(60,199,154,0.25)] text-[#3CC79A] transition-colors"
              >
                <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
              </button>
            </div>
            {(() => {
              const dayEvents = events.filter(e => {
                const d = new Date(e.start);
                return d.getFullYear() === year && d.getMonth() === month && d.getDate() === selectedDay;
              });
              const dayCards = dueCards.filter(c => {
                const d = new Date(c.dueDate);
                return d.getFullYear() === year && d.getMonth() === month && d.getDate() === selectedDay;
              });
              return dayEvents.length === 0 && dayCards.length === 0 ? (
                <p className="text-sm text-white/30 text-center py-6">Keine Termine</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {dayEvents.map(e => (
                    <div
                      key={`e-${e.id}`}
                      onClick={() => openEdit(e)}
                      className="p-3 rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                      style={{ background: e.color + "18", border: `1px solid ${e.color}33` }}
                    >
                      <div className="font-medium text-sm text-white/90 mb-1">{e.title}</div>
                      {!e.allDay && (
                        <div className="text-xs text-white/50">
                          {formatTime(e.start)}{e.end ? ` – ${formatTime(e.end)}` : ""}
                        </div>
                      )}
                      {e.allDay && <div className="text-xs text-white/50">Ganztägig</div>}
                      {e.team && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ background: e.team.color }} />
                          <span className="text-xs text-white/40">{e.team.name}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {dayCards.map(c => (
                    <a
                      key={`c-${c.id}`}
                      href={`/board?boardId=${c.column.board.id}`}
                      className="p-3 rounded-xl hover:opacity-90 transition-opacity block"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.12)" }}
                    >
                      <div className="text-sm text-white/60 mb-0.5">📌 {c.title}</div>
                      <div className="text-xs text-white/35">{c.column.board.name}</div>
                    </a>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md bg-[rgba(22,22,24,0.98)] border border-[rgba(255,255,255,0.1)] rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[rgba(255,255,255,0.08)]">
              <h2 className="text-base font-semibold text-white/90">{editEvent ? "Termin bearbeiten" : "Neuer Termin"}</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.08)] text-white/50 hover:text-white/80 transition-colors">
                <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <input
                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-2.5 text-sm text-white/90 outline-none focus:border-[rgba(60,199,154,0.5)] placeholder:text-white/30 transition-colors"
                placeholder="Titel"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                autoFocus
              />
              <textarea
                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-2.5 text-sm text-white/90 outline-none focus:border-[rgba(60,199,154,0.5)] placeholder:text-white/30 transition-colors resize-none h-20"
                placeholder="Beschreibung (optional)"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />

              <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-white/60">
                <input type="checkbox" checked={form.allDay} onChange={e => setForm(f => ({ ...f, allDay: e.target.checked }))} className="rounded" />
                Ganztägig
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Start</label>
                  <input
                    type={form.allDay ? "date" : "datetime-local"}
                    className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2 text-sm text-white/90 outline-none focus:border-[rgba(60,199,154,0.5)] transition-colors"
                    value={form.allDay ? form.start.slice(0, 10) : form.start}
                    onChange={e => setForm(f => ({ ...f, start: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Ende</label>
                  <input
                    type={form.allDay ? "date" : "datetime-local"}
                    className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2 text-sm text-white/90 outline-none focus:border-[rgba(60,199,154,0.5)] transition-colors"
                    value={form.allDay ? (form.end?.slice(0, 10) ?? "") : form.end}
                    onChange={e => setForm(f => ({ ...f, end: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Wiederholung</label>
                  <select
                    className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2 text-sm text-white/90 outline-none focus:border-[rgba(60,199,154,0.5)] transition-colors"
                    value={form.recurring}
                    onChange={e => setForm(f => ({ ...f, recurring: e.target.value }))}
                  >
                    <option value="">Keine</option>
                    <option value="daily">Täglich</option>
                    <option value="weekly">Wöchentlich</option>
                    <option value="monthly">Monatlich</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Team</label>
                  <select
                    className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2 text-sm text-white/90 outline-none focus:border-[rgba(60,199,154,0.5)] transition-colors"
                    value={form.teamId}
                    onChange={e => setForm(f => ({ ...f, teamId: e.target.value }))}
                  >
                    <option value="">Kein Team</option>
                    {teams.map(t => <option key={t.id} value={String(t.id)}>{t.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-white/40 mb-2 block">Farbe</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setForm(f => ({ ...f, color: c }))}
                      className={`w-6 h-6 rounded-full transition-all ${form.color === c ? "ring-2 ring-white ring-offset-2 ring-offset-[rgba(22,22,24,0.98)] scale-110" : "hover:scale-110"}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 flex items-center gap-3">
              {editEvent && (
                <button onClick={() => deleteEvent(editEvent.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[rgba(239,68,68,0.12)] hover:bg-[rgba(239,68,68,0.2)] text-[#ef4444] transition-colors">
                  <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" /> Löschen
                </button>
              )}
              <button onClick={() => setShowModal(false)}
                className="ml-auto px-4 py-2 rounded-xl text-sm font-medium bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)] text-white/60 hover:text-white/90 transition-colors">
                Abbrechen
              </button>
              <button onClick={saveEvent} disabled={saving || !form.title.trim() || !form.start}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-[#3CC79A] hover:bg-[#34b389] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {saving ? "Speichern…" : editEvent ? "Aktualisieren" : "Erstellen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
