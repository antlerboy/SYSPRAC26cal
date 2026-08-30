const DATA = window.SYSPRAC_DATA;
const META = DATA.meta;
const EVENTS = DATA.events;
const NON_PROGRAMME_KINDS = new Set(["conference", "day"]);

function compactDate(value) {
  return value.replaceAll("-", "");
}

function utcDateTime(value) {
  return new Date(value).toISOString().replaceAll("-", "").replaceAll(":", "").replace(/\.\d{3}Z$/, "Z");
}

function eventLocation(event) {
  return event.room ? `${event.room}, ${META.venue}` : META.venue;
}

function eventDescription(event) {
  const parts = [];
  if (event.speakers) parts.push(event.speakers);
  if (event.description) parts.push(event.description);
  parts.push(`Official provisional programme: ${META.officialSchedule}`);
  return parts.join("\n\n");
}

function eventDates(event) {
  if (event.allDay) {
    return {
      googleStart: compactDate(event.start),
      googleEnd: compactDate(event.endExclusive),
      outlookStart: event.start,
      outlookEnd: event.endExclusive
    };
  }
  return {
    googleStart: utcDateTime(event.start),
    googleEnd: utcDateTime(event.end),
    outlookStart: new Date(event.start).toISOString(),
    outlookEnd: new Date(event.end).toISOString()
  };
}

function providerUrl(event, provider) {
  const dates = eventDates(event);
  const description = eventDescription(event);
  const location = eventLocation(event);

  if (provider === "google") {
    const url = new URL("https://calendar.google.com/calendar/render");
    url.searchParams.set("action", "TEMPLATE");
    url.searchParams.set("text", event.title);
    url.searchParams.set("dates", `${dates.googleStart}/${dates.googleEnd}`);
    url.searchParams.set("details", description);
    url.searchParams.set("location", location);
    return url.toString();
  }

  if (provider === "outlook" || provider === "office365") {
    const host = provider === "office365"
      ? "https://outlook.office.com/calendar/0/deeplink/compose"
      : "https://outlook.live.com/calendar/0/deeplink/compose";
    const url = new URL(host);
    url.searchParams.set("path", "/calendar/action/compose");
    url.searchParams.set("rru", "addevent");
    url.searchParams.set("subject", event.title);
    url.searchParams.set("startdt", dates.outlookStart);
    url.searchParams.set("enddt", dates.outlookEnd);
    url.searchParams.set("body", description);
    url.searchParams.set("location", location);
    if (event.allDay) url.searchParams.set("allday", "true");
    return url.toString();
  }

  throw new Error(`Unknown calendar provider: ${provider}`);
}

function escapeIcs(value = "") {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replaceAll("\r\n", "\\n")
    .replaceAll("\n", "\\n");
}

function icsEventLines(event) {
  const lines = [
    "BEGIN:VEVENT",
    `UID:sysprac26-${event.id}@systemspractice.org`,
    "DTSTAMP:20260830T183000Z",
    `SUMMARY:${escapeIcs(event.title)}`,
    `LOCATION:${escapeIcs(eventLocation(event))}`,
    `DESCRIPTION:${escapeIcs(eventDescription(event))}`,
    `URL:${event.url}`
  ];

  if (event.allDay) {
    lines.push(`DTSTART;VALUE=DATE:${compactDate(event.start)}`);
    lines.push(`DTEND;VALUE=DATE:${compactDate(event.endExclusive)}`);
  } else {
    lines.push(`DTSTART:${utcDateTime(event.start)}`);
    lines.push(`DTEND:${utcDateTime(event.end)}`);
  }
  lines.push("END:VEVENT");
  return lines;
}

function icsForEvents(events, calendarName = "SysPrac26") {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SCiO//SysPrac26 Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcs(calendarName)}`
  ];
  for (const event of events) lines.push(...icsEventLines(event));
  lines.push("END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}

function downloadIcs(events, filename) {
  const blob = new Blob([icsForEvents(events)], { type: "text/calendar;charset=utf-8" });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
}

function basePageUrl() {
  const url = new URL(window.location.href);
  url.hash = "";
  url.search = "";
  url.pathname = url.pathname.replace(/(?:index|embed|links)\.html$/, "");
  if (!url.pathname.endsWith("/")) url.pathname += "/";
  return url;
}

function stableLink(eventId, provider) {
  const url = basePageUrl();
  url.searchParams.set("event", eventId);
  url.searchParams.set("to", provider);
  return url.toString();
}

function embedLink(eventId) {
  const url = basePageUrl();
  url.pathname += "embed.html";
  url.searchParams.set("event", eventId);
  return url.toString();
}

function timeLabel(event) {
  if (event.allDay) return "All day";
  const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: META.timezone });
  return `${fmt.format(new Date(event.start))}–${fmt.format(new Date(event.end))}`;
}

function dayLabel(date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: META.timezone
  }).format(new Date(`${date}T12:00:00Z`));
}

function kindLabel(kind) {
  return ({
    networking: "Networking", plenary: "Plenary", panel: "Panel", fireside: "Fireside chat",
    talk: "Talk", workshop: "Workshop", agm: "AGM", break: "Break", lunch: "Lunch"
  })[kind] || kind;
}

function makeLink(label, href, className = "mini-link") {
  const a = document.createElement("a");
  a.href = href;
  a.className = className;
  a.textContent = label;
  a.target = "_blank";
  a.rel = "noopener";
  return a;
}

function renderOverview() {
  const host = document.querySelector("#overview-events");
  if (!host) return;
  for (const id of ["conference", "day-1", "day-2"]) {
    const event = EVENTS.find(item => item.id === id);
    const card = document.createElement("section");
    card.className = `event-card${id === "conference" ? " primary" : ""}`;
    const h2 = document.createElement("h2");
    h2.textContent = id === "conference" ? "Whole conference" : event.title;
    const p = document.createElement("p");
    p.className = "meta";
    p.textContent = id === "conference" ? "21–22 September 2026 · Cranfield University" : `${dayLabel(event.start)} · Cranfield University`;
    const actions = document.createElement("div");
    actions.className = "actions";
    actions.append(
      makeLink("Google Calendar", stableLink(id, "google"), "button primary"),
      makeLink("Outlook.com", stableLink(id, "outlook"), "button"),
      makeLink("Microsoft 365", stableLink(id, "office365"), "button"),
      makeLink("Apple / ICS", stableLink(id, "ics"), "button")
    );
    card.append(h2, p, actions);
    host.appendChild(card);
  }
}

function programmeEvents() {
  return EVENTS.filter(event => !NON_PROGRAMME_KINDS.has(event.kind));
}

function renderProgramme() {
  const host = document.querySelector("#programme");
  if (!host) return;
  const byDate = new Map();
  for (const event of programmeEvents()) {
    const date = event.start.slice(0, 10);
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date).push(event);
  }

  for (const [date, events] of byDate) {
    events.sort((a, b) => new Date(a.start) - new Date(b.start) || new Date(a.end) - new Date(b.end) || a.room.localeCompare(b.room));
    const section = document.createElement("section");
    section.className = "programme-day";
    const h2 = document.createElement("h2");
    h2.textContent = dayLabel(date);
    section.appendChild(h2);

    for (const event of events) {
      const row = document.createElement("article");
      row.className = `programme-item kind-${event.kind}`;
      row.dataset.eventId = event.id;

      const checkWrap = document.createElement("label");
      checkWrap.className = "event-select";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = event.id;
      checkbox.checked = Boolean(event.defaultSelected);
      checkbox.addEventListener("change", updateSelectionState);
      const sr = document.createElement("span");
      sr.className = "sr-only";
      sr.textContent = `Select ${event.title}`;
      checkWrap.append(checkbox, sr);

      const time = document.createElement("div");
      time.className = "event-time";
      time.textContent = timeLabel(event);

      const body = document.createElement("div");
      body.className = "event-body";
      const title = document.createElement("h3");
      title.textContent = event.title;
      const details = document.createElement("p");
      details.className = "event-details";
      const bits = [kindLabel(event.kind)];
      if (event.room) bits.push(event.room);
      if (event.speakers) bits.push(event.speakers);
      details.textContent = bits.join(" · ");
      body.append(title, details);

      const links = document.createElement("div");
      links.className = "event-links";
      links.append(
        makeLink("Google", stableLink(event.id, "google")),
        makeLink("Outlook", stableLink(event.id, "outlook")),
        makeLink("M365", stableLink(event.id, "office365")),
        makeLink("ICS", stableLink(event.id, "ics"))
      );
      const embed = makeLink("embed", embedLink(event.id));
      embed.title = "Embeddable button strip for this event";
      links.append(embed);

      row.append(checkWrap, time, body, links);
      section.appendChild(row);
    }
    host.appendChild(section);
  }
  updateSelectionState();
}

function selectedEvents() {
  const ids = [...document.querySelectorAll("#programme input[type=checkbox]:checked")].map(input => input.value);
  return ids.map(id => EVENTS.find(event => event.id === id)).filter(Boolean).sort((a, b) => new Date(a.start) - new Date(b.start));
}

function findConflicts(events) {
  const conflicts = [];
  for (let i = 0; i < events.length; i += 1) {
    for (let j = i + 1; j < events.length; j += 1) {
      const a = events[i];
      const b = events[j];
      if (a.allDay || b.allDay) continue;
      if (new Date(a.start) < new Date(b.end) && new Date(b.start) < new Date(a.end)) conflicts.push([a, b]);
    }
  }
  return conflicts;
}

function updateSelectionState() {
  const chosen = selectedEvents();
  const conflicts = findConflicts(chosen);
  const count = document.querySelector("#selection-count");
  const warning = document.querySelector("#conflict-warning");
  const download = document.querySelector("#download-selected");
  if (count) count.textContent = `${chosen.length} event${chosen.length === 1 ? "" : "s"} selected`;
  if (download) download.disabled = chosen.length === 0;

  document.querySelectorAll(".programme-item").forEach(row => row.classList.remove("has-conflict"));
  for (const [a, b] of conflicts) {
    document.querySelector(`[data-event-id="${CSS.escape(a.id)}"]`)?.classList.add("has-conflict");
    document.querySelector(`[data-event-id="${CSS.escape(b.id)}"]`)?.classList.add("has-conflict");
  }

  if (warning) {
    if (!conflicts.length) {
      warning.hidden = true;
      warning.textContent = "";
    } else {
      warning.hidden = false;
      const examples = conflicts.slice(0, 3).map(([a, b]) => `‘${a.title}’ overlaps ‘${b.title}’`);
      warning.textContent = `${conflicts.length} timetable clash${conflicts.length === 1 ? "" : "es"}: ${examples.join("; ")}${conflicts.length > 3 ? "; …" : ""}. You can still download the calendar.`;
    }
  }
}

function setSelection(mode) {
  for (const input of document.querySelectorAll("#programme input[type=checkbox]")) {
    const event = EVENTS.find(item => item.id === input.value);
    if (mode === "clear") input.checked = false;
    if (mode === "defaults") input.checked = Boolean(event?.defaultSelected);
    if (mode === "breaks") input.checked = Boolean(event?.defaultSelected || ["break", "lunch"].includes(event?.kind));
  }
  updateSelectionState();
}

function wireBuilderControls() {
  document.querySelector("#download-selected")?.addEventListener("click", () => {
    const chosen = selectedEvents();
    if (chosen.length) downloadIcs(chosen, "sysprac26-my-programme.ics");
  });
  document.querySelector("#select-defaults")?.addEventListener("click", () => setSelection("defaults"));
  document.querySelector("#select-breaks")?.addEventListener("click", () => setSelection("breaks"));
  document.querySelector("#clear-selection")?.addEventListener("click", () => setSelection("clear"));
}

function renderEmbed(eventId) {
  const host = document.querySelector("#embed-actions");
  if (!host) return;
  const event = EVENTS.find(item => item.id === eventId) || EVENTS.find(item => item.id === "conference");
  document.querySelector("#embed-title").textContent = event.title;
  host.append(
    makeLink("Google Calendar", stableLink(event.id, "google"), "button primary"),
    makeLink("Outlook.com", stableLink(event.id, "outlook"), "button"),
    makeLink("Microsoft 365", stableLink(event.id, "office365"), "button"),
    makeLink("Apple / ICS", stableLink(event.id, "ics"), "button")
  );
}

function renderLinkDirectory() {
  const host = document.querySelector("#link-directory");
  if (!host) return;
  for (const event of EVENTS) {
    if (["break", "lunch"].includes(event.kind)) continue;
    const row = document.createElement("tr");
    const eventCell = document.createElement("td");
    const title = document.createElement("strong");
    title.textContent = event.title;
    const meta = document.createElement("div");
    meta.className = "small";
    meta.textContent = event.allDay ? event.id : `${timeLabel(event)}${event.room ? ` · ${event.room}` : ""}${event.speakers ? ` · ${event.speakers}` : ""}`;
    eventCell.append(title, meta);
    row.appendChild(eventCell);
    for (const provider of ["google", "outlook", "office365", "ics"]) {
      const cell = document.createElement("td");
      cell.appendChild(makeLink(provider === "office365" ? "M365" : provider, stableLink(event.id, provider)));
      row.appendChild(cell);
    }
    const embedCell = document.createElement("td");
    embedCell.appendChild(makeLink("embed", embedLink(event.id)));
    row.appendChild(embedCell);
    host.appendChild(row);
  }
}

function handleDirectAction() {
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get("event");
  const provider = params.get("to");
  if (!eventId || !provider) return false;
  const event = EVENTS.find(item => item.id === eventId);
  if (!event) throw new Error(`Unknown SysPrac26 event: ${eventId}`);
  if (provider === "ics" || provider === "apple") {
    downloadIcs([event], `sysprac26-${event.id}.ics`);
    const fallback = document.querySelector("#download-fallback");
    if (fallback) {
      fallback.hidden = false;
      fallback.addEventListener("click", () => downloadIcs([event], `sysprac26-${event.id}.ics`));
    }
  } else {
    window.location.replace(providerUrl(event, provider));
  }
  return true;
}

function init() {
  if (!DATA?.events?.length) throw new Error("SysPrac26 programme data did not load.");
  const params = new URLSearchParams(window.location.search);
  if (handleDirectAction()) return;
  renderOverview();
  renderProgramme();
  wireBuilderControls();
  renderEmbed(params.get("event") || "conference");
  renderLinkDirectory();
  document.querySelectorAll("[data-last-reviewed]").forEach(el => { el.textContent = META.lastReviewed; });
  document.querySelectorAll("[data-source-version]").forEach(el => { el.textContent = META.sourceVersion; });
}

try {
  init();
} catch (error) {
  console.error(error);
  const errorBox = document.querySelector("#app-error");
  if (errorBox) {
    errorBox.hidden = false;
    errorBox.textContent = error.message;
  }
}
