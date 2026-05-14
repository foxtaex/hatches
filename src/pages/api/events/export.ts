import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

function icsDate(date: Date, allDay = false): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  if (allDay) {
    return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`;
  }
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

function escapeIcs(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function foldLine(line: string): string {
  // RFC 5545: lines longer than 75 octets must be folded
  const result: string[] = [];
  let remaining = line;
  while (remaining.length > 75) {
    result.push(remaining.slice(0, 75));
    remaining = " " + remaining.slice(75);
  }
  result.push(remaining);
  return result.join("\r\n");
}

export const GET: APIRoute = async ({ locals }) => {
  const user = (locals as any).user;
  if (!user) {
    return new Response(JSON.stringify({ error: "Nicht angemeldet" }), { status: 401 });
  }

  const events = await prisma.event.findMany({
    orderBy: { start: "asc" },
  });

  const now = new Date();
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Hatches//Planner//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    foldLine(`X-WR-CALNAME:Hatches Planner`),
  ];

  for (const event of events) {
    const startDate = new Date(event.start);
    const dtstart = event.allDay
      ? `DTSTART;VALUE=DATE:${icsDate(startDate, true)}`
      : `DTSTART:${icsDate(startDate)}`;

    const dtend = event.end
      ? (event.allDay
          ? `DTEND;VALUE=DATE:${icsDate(new Date(event.end), true)}`
          : `DTEND:${icsDate(new Date(event.end))}`)
      : null;

    const rrule = event.recurring
      ? `RRULE:FREQ=${event.recurring.toUpperCase()}${event.recurringEnd ? `;UNTIL=${icsDate(new Date(event.recurringEnd))}` : ""}`
      : null;

    lines.push("BEGIN:VEVENT");
    lines.push(foldLine(`UID:hatches-event-${event.id}@hatches`));
    lines.push(foldLine(`DTSTAMP:${icsDate(now)}`));
    lines.push(foldLine(dtstart));
    if (dtend) lines.push(foldLine(dtend));
    if (rrule) lines.push(foldLine(rrule));
    lines.push(foldLine(`SUMMARY:${escapeIcs(event.title)}`));
    if (event.description) lines.push(foldLine(`DESCRIPTION:${escapeIcs(event.description)}`));
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  const icsContent = lines.join("\r\n");

  return new Response(icsContent, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="hatches-planner.ics"`,
    },
  });
};
