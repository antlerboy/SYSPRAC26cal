const DATA_URL = "events.json";

function compactDate(dateString) {
  return dateString.replaceAll("-", "");
}

function utcDateTime(dateString) {
  return new Date(dateString)
    .toISOString()
    .replaceAll("-", "")
    .replaceAll(":", "")
    .replace(/\.\d{3}Z$/, "Z");
}

function eventDates(event) {
  if (event.allDay) {
    return {
      googleStart: compactDate(event.start),
      googleEnd: compactDate(event.endExclusive),
      outlookStart: event.start,
      outlookEnd: event.endExclusive,
      yahooStart: compactDate(event.start),
      yahooEnd: compactDate(event.endExclusive)
    };
  }

  return {
    googleStart: utcDateTime(event.start),
    googleEnd: utcDateTime(event.end),
    outlookStart: new Date(event.start).toISOString(),
    outlookEnd: new Date(event.end).toISOString(),
    yahooStart: utcDateTime(event.start),
    yahooEnd: utcDateTime(event.end)
  };
}

function providerUrl(event, provider) {
  const dates = eventDates(event);
  const description = `${event.description}\n\n${event.url}`;

  if (provider === "google") {
    const url = new URL("https://calendar.google.com/calendar/render");
    url.searchParams.set("action", "TEMPLATE");
    url.searchParams.set("text", event.title);
    url.searchParams.set("dates", `${dates.googleStart}/${dates.googleEnd}`);
    url.searchParams.set("details", description);
    url.searchParams.set("location", event.location);
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
    url.searchParams.set("location", event.location);
    if (event.allDay) url.searchParams.set("allday", "true");
    return url.toString();
  }

  if (provider === "yahoo") {
    const url = new URL("https://calendar.yahoo.com/");
    url.searchParams.set("v", "60");
    url.searchParams.set("view", "d");
    url.searchParams.set("type", "20");
    url.searchParams.set("title", event.title);
    url.searchParams.set("st", dates.yahooStart);
    url.searchParams.set("et", dates.yahooEnd);
    url.searchParams.set("desc", description);
    url.searchParams.set("in_loc", event.location);
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

function icsFor(event) {
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SCiO//SysPrac26 Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:sysprac26-${event.id}@systemspractice.org`,
    `DTSTAMP:${now}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    `LOCATION:${escapeIcs(event.location)}`,
    `DESCRIPTION:${escapeIcs(`${event.description}\n\n${event.url}`)}`,
    `URL:${event.url}`
  ];

  if (event.allDay) {
    lines.push(`DTSTART;VALUE=DATE:${compactDate(event.start)}`);
    lines.push(`DTEND;VALUE=DATE:${compactDate(event.endExclusive)}`);
  } else {
    lines.push(`DTSTART:${utcDateTime(event.start)}`);
    lines.push(`DTEND:${utcDateTime(event.end)}`);
  }

  lines.push("END:VEVENT", "END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}

function filenameFor(event) {
  return event.id === "conference" ? "sysprac26.ics" : `sysprac26-${event.id}.ics`;
}

function downloadIcs(event) {
  const blob = new Blob([icsFor(event)], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filenameFor(event);
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function basePageUrl() {
  const url = new URL(window.location.href);
  url.hash = "";
  url.search = "";
  if (url.pathname.endsWith("embed.html")) {
    url.pathname = url.pathname.replace(/embed\.html$/, "");
  } else if (url.pathname.endsWith("index.html")) {
    url.pathname = url.pathname.replace(/index\.html$/, "");
  }
  if (!url.pathname.endsWith("/")) url.pathname += "/";
  return url;
}

function stableLink(eventId, provider) {
  const url = basePageUrl();
  url.searchParams.set("event", eventId);
  url.searchParams.set("to", provider);
  return url.toString();
}

function prettyDates(event) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London"
  });

  if (event.id === "conference") {
    return "21–22 September 2026 · Cranfield University";
  }
  return `${fmt.format(new Date(`${event.start}T12:00:00Z`))} · Cranfield University`;
}

function actionLink(event, provider, label, primary = false) {
  const a = document.createElement("a");
  a.className = `button${primary ? " primary" : ""}`;
  a.href = stableLink(event.id, provider);
  a.textContent = label;
  return a;
}

function renderEvents(data) {
  const host = document.querySelector("#events");
  if (!host) return;

  for (const event of data.events) {
    const card = document.createElement("section");
    card.className = `event-card${event.id === "conference" ? " primary" : ""}`;

    const h2 = document.createElement("h2");
    h2.textContent = event.id === "conference" ? "Whole conference" : event.title;

    const meta = document.createElement("p");
    meta.className = "meta";
    meta.textContent = prettyDates(event);

    const actions = document.createElement("div");
    actions.className = "actions";
    actions.append(
      actionLink(event, "google", "Google Calendar", true),
      actionLink(event, "outlook", "Outlook.com"),
      actionLink(event, "office365", "Microsoft 365"),
      actionLink(event, "ics", "Apple / ICS")
    );

    card.append(h2, meta, actions);
    host.appendChild(card);
  }

  const reviewed = document.querySelector("#last-reviewed");
  if (reviewed && data.meta?.lastReviewed) reviewed.textContent = data.meta.lastReviewed;

  const direct = document.querySelector("#direct-links-list");
  const conference = data.events.find(e => e.id === "conference");
  if (direct && conference) {
    const providers = [
      ["Google Calendar", "google"],
      ["Outlook.com", "outlook"],
      ["Microsoft 365", "office365"],
      ["Apple / universal ICS", "ics"]
    ];
    for (const [label, provider] of providers) {
      const li = document.createElement("li");
      const strong = document.createElement("strong");
      strong.textContent = `${label}: `;
      const code = document.createElement("code");
      code.textContent = stableLink(conference.id, provider);
      li.append(strong, code);
      direct.appendChild(li);
    }
  }
}

async function init() {
  const response = await fetch(DATA_URL, { cache: "no-store" });
  if (!response.ok) throw new Error(`Could not load ${DATA_URL}`);
  const data = await response.json();

  const params = new URLSearchParams(window.location.search);
  const eventId = params.get("event");
  const provider = params.get("to");

  if (eventId && provider) {
    const event = data.events.find(item => item.id === eventId);
    if (!event) throw new Error(`Unknown event: ${eventId}`);

    if (provider === "ics" || provider === "apple") {
      downloadIcs(event);
    } else {
      window.location.replace(providerUrl(event, provider));
      return;
    }
  }

  renderEvents(data);
}

init().catch(error => {
  console.error(error);
  const host = document.querySelector("#events");
  if (host) host.innerHTML = `<section class="event-card"><h2>Calendar links unavailable</h2><p>${error.message}</p></section>`;
});
