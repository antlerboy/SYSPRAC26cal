# SYSPRAC26 calendar helper

Static calendar tools for SysPrac26, 21–22 September 2026 at Cranfield University.

The repo is designed for two uses:

1. a standalone programme builder, where attendees choose sessions and download one personal `.ics` calendar; and
2. stable per-event calendar links that can be embedded directly on the SysPrac26 conference website.

## Live site

GitHub Pages is live and deploys automatically from `main`:

- Standalone programme builder: https://antlerboy.github.io/SYSPRAC26cal/
- Full link directory for website editors: https://antlerboy.github.io/SYSPRAC26cal/links.html
- Whole-conference embed strip: https://antlerboy.github.io/SYSPRAC26cal/embed.html
- Whole-conference static ICS: https://antlerboy.github.io/SYSPRAC26cal/sysprac26.ics

## Stable link scheme

Every event has a stable ID in `data.js` or `extras.js`.

For example, Benjamin Taylor's day-one workshop has the ID:

`d1-w4-relational-place-based-public-services`

Direct links are therefore:

- Google: `https://antlerboy.github.io/SYSPRAC26cal/?event=d1-w4-relational-place-based-public-services&to=google`
- Outlook.com: `https://antlerboy.github.io/SYSPRAC26cal/?event=d1-w4-relational-place-based-public-services&to=outlook`
- Microsoft 365: `https://antlerboy.github.io/SYSPRAC26cal/?event=d1-w4-relational-place-based-public-services&to=office365`
- Apple / ICS: `https://antlerboy.github.io/SYSPRAC26cal/?event=d1-w4-relational-place-based-public-services&to=ics`
- Embeddable four-button strip: `https://antlerboy.github.io/SYSPRAC26cal/embed.html?event=d1-w4-relational-place-based-public-services`

The same pattern works for every talk, workshop, panel, plenary, AGM, and dinner. `links.html` generates the complete directory.

## Whole conference

- Google: https://antlerboy.github.io/SYSPRAC26cal/?event=conference&to=google
- Outlook.com: https://antlerboy.github.io/SYSPRAC26cal/?event=conference&to=outlook
- Microsoft 365: https://antlerboy.github.io/SYSPRAC26cal/?event=conference&to=office365
- Apple / ICS: https://antlerboy.github.io/SYSPRAC26cal/?event=conference&to=ics

`day-1` and `day-2` can be substituted for `conference`.

## Programme data

`data.js` contains the current provisional Schedule26 programme reviewed on 5 September 2026, corresponding to the published `Schedule draft v0.61`.

`extras.js` contains small explicit additions that should not be confused with values printed on the source timetable. It currently adds the published 19:30 dinner with a calendar end time of 22:00, and the tiny bottom-right update dot.

The official programme remains:

https://www.systemspractice.org/Schedule26

Workshop end times are inferred from the row-spans in the official web timetable: a workshop occupies the full parallel-session block in which it appears. This assumption is stated visibly on the programme builder and should be checked when the official schedule changes.

## Update discussion queue

The tiny dot at the bottom-right of the live site links to one lightweight GitHub thread for schedule corrections and updates:

https://github.com/antlerboy/SYSPRAC26cal/issues/1

The daily schedule monitor posts detected public Schedule26 source changes to the same thread.

## Automatic monitoring

`.github/workflows/monitor-schedule.yml` checks the public Schedule26 page every day at 08:00 UTC. It stores a source baseline under `monitor/`. When the published source changes it:

1. calculates the source diff;
2. posts the detected change and diff to issue #1; and
3. records the newly observed source version for the next comparison.

It does not silently rewrite the calendar data. A human still decides how a source change maps onto the stable calendar event records.

## Updating the programme

Edit `data.js` for published programme changes and `extras.js` for deliberate local additions. Keep existing event IDs stable where possible, even if title, room, speaker, or time changes. Stable IDs mean conference-site links continue to work after programme changes.

The browser generates Google, Outlook, Microsoft 365, and ICS links from the programme data. There is no second provider-specific calendar dataset to maintain.

The static `sysprac26.ics` is only the simple all-day whole-conference entry. Individual events and personal programmes are generated in the browser.

## GitHub Pages and validation

`.github/workflows/pages.yml` deploys the repository from `main` using GitHub Actions.

`.github/workflows/validate.yml` checks the JavaScript and core event data, including the deliberate 19:30–22:00 dinner addition, on every push.
