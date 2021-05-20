# Apple Contacts to Obsidian CRM

## Description

For years I've been recording notes and prayer requests for people in Google Contacts using [Cardhop](https://flexibits.com/cardhop) and Alfred. After losing birthdays, notes, and just weird syncing issues, I'm wanting to move this to plain text that I can manage in git.

### Primary Objective:
- export Notes
- export web of Related Names

This script crawls through Contacts.app on a Mac using JXA, and creates files for any contact that has an entry in the Notes field. It also supports creating links for Related Names, because I've dreamed of having a plain text style CRM that I can visualize relationships and remember people.

## Running...

```bash
osascript contacts.js
```
