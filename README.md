# SYSPRAC26 calendar links

A small static calendar helper for SysPrac26, 21–22 September 2026 at Cranfield University.

It is designed to work in two ways:

1. as a standalone GitHub Pages page; and
2. as stable individual calendar links that can be embedded directly on the SysPrac26 conference website.

## Public URLs

When GitHub Pages is deployed, the expected public URL is:

- Standalone page: https://antlerboy.github.io/SYSPRAC26cal/
- Compact embeddable strip: https://antlerboy.github.io/SYSPRAC26cal/embed.html
- Calendar feed / ICS file: https://antlerboy.github.io/SYSPRAC26cal/sysprac26.ics

Stable direct links for the whole conference:

- Google Calendar: https://antlerboy.github.io/SYSPRAC26cal/?event=conference&to=google
- Outlook.com: https://antlerboy.github.io/SYSPRAC26cal/?event=conference&to=outlook
- Microsoft 365: https://antlerboy.github.io/SYSPRAC26cal/?event=conference&to=office365
- Apple Calendar / universal ICS: https://antlerboy.github.io/SYSPRAC26cal/?event=conference&to=ics

The same pattern works for the individual days by substituting `day-1` or `day-2` for `conference`.

## Canonical event data

`events.json` is the canonical data source used by the web page. The conference is deliberately represented as an all-day event across 21–22 September. This avoids baking disputed or changing programme start/end times into users' calendars while the detailed programme is still provisional.

The official programme remains:

https://www.systemspractice.org/Schedule26

## Updating

Change `events.json` for the web links. If the whole-conference details change, update `sysprac26.ics` as well so the downloadable/subscribable file remains consistent.

The direct conference-site links above do not need to change when event details are edited here.

## GitHub Pages

`.github/workflows/pages.yml` deploys the repository to GitHub Pages from `main`. The workflow asks GitHub to enable Pages automatically where the repository settings permit it.
