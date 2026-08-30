# SYSPRAC26 calendar helper

Static calendar tools for SysPrac26, 21–22 September 2026 at Cranfield University.

The repo is designed for two uses:

1. a standalone programme builder, where attendees choose sessions and download one personal `.ics` calendar; and
2. stable per-event calendar links that can be embedded directly on the SysPrac26 conference website.

## Public URLs

Once GitHub Pages is enabled:

- Standalone programme builder: https://antlerboy.github.io/SYSPRAC26cal/
- Full link directory for website editors: https://antlerboy.github.io/SYSPRAC26cal/links.html
- Whole-conference embed strip: https://antlerboy.github.io/SYSPRAC26cal/embed.html
- Whole-conference static ICS: https://antlerboy.github.io/SYSPRAC26cal/sysprac26.ics

## Stable link scheme

Every event has a stable ID in `data.js`.

For example, Benjamin Taylor's day-one workshop has the ID:

`d1-w4-relational-place-based-public-services`

Direct links are therefore:

- Google: `https://antlerboy.github.io/SYSPRAC26cal/?event=d1-w4-relational-place-based-public-services&to=google`
- Outlook.com: `https://antlerboy.github.io/SYSPRAC26cal/?event=d1-w4-relational-place-based-public-services&to=outlook`
- Microsoft 365: `https://antlerboy.github.io/SYSPRAC26cal/?event=d1-w4-relational-place-based-public-services&to=office365`
- Apple / ICS: `https://antlerboy.github.io/SYSPRAC26cal/?event=d1-w4-relational-place-based-public-services&to=ics`
- Embeddable four-button strip: `https://antlerboy.github.io/SYSPRAC26cal/embed.html?event=d1-w4-relational-place-based-public-services`

The same pattern works for every talk, workshop, panel, plenary, and AGM. `links.html` generates the complete directory.

## Whole conference

- Google: https://antlerboy.github.io/SYSPRAC26cal/?event=conference&to=google
- Outlook.com: https://antlerboy.github.io/SYSPRAC26cal/?event=conference&to=outlook
- Microsoft 365: https://antlerboy.github.io/SYSPRAC26cal/?event=conference&to=office365
- Apple / ICS: https://antlerboy.github.io/SYSPRAC26cal/?event=conference&to=ics

`day-1` and `day-2` can be substituted for `conference`.

## Programme data

`data.js` is the single canonical source used by the site. It currently represents the provisional Schedule26 programme reviewed on 30 August 2026, corresponding to the published `Schedule draft v0.4`.

The official programme remains:

https://www.systemspractice.org/Schedule26

Workshop end times are inferred from the row-spans in the official web timetable: a workshop occupies the full parallel-session block in which it appears. This assumption is stated visibly on the programme builder and should be checked when the official schedule changes.

## Updating the programme

Edit `data.js`. Keep existing event IDs stable where possible, even if title, room, speaker, or time changes. Stable IDs mean conference-site links continue to work after programme changes.

The browser generates Google, Outlook, Microsoft 365, and ICS links from this data. There is no second provider-specific calendar dataset to maintain.

The static `sysprac26.ics` is only the simple all-day whole-conference entry. Individual events and personal programmes are generated from `data.js`.

## GitHub Pages

`.github/workflows/pages.yml` deploys the repository from `main` using GitHub Actions.

For a new repository, GitHub requires Pages to be enabled once in the repository settings:

`Settings → Pages → Build and deployment → Source: GitHub Actions`

After that, pushes to `main` deploy automatically.
