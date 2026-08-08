# Putting this on an iPhone with nothing hosted

An iPhone won't run a local web page as an app — save `openers.html` to Files and
iOS renders it in a preview that blocks JavaScript, so the search box and buttons
do nothing. Getting a real home-screen icon out of a web page means hosting it
somewhere, which is the thing we're avoiding.

So this uses an **Apple Shortcut** instead. It gets a home-screen icon, runs with
no signal, and never talks to a server. The Shortcut can't run the line engine,
so the lines come pre-generated in a file the Shortcut reads from your phone.

**What it feels like when it's done:** tap the icon → type a name → a list of ten
lines appears → tap one → it's on your clipboard → paste it into the app.

---

## Part 1 — get the file onto the phone

The file is `dist/iphone/openers.json` — 1,100 girls' names, ten lines each.

1. Get it onto the phone however suits: AirDrop from the Mac, or email it to
   yourself and tap the attachment.
2. Tap **Share** → **Save to Files**.
3. Save it to **iCloud Drive → Shortcuts**. Create that folder if it isn't there.
   (This exact location matters — Part 2 step 3 points at it.)

Keep the filename as `openers.json`.

> Want boys' names too? Use `dist/iphone/openers-all-2000.json` instead — all
> 2,000 names, but 3.2 MB rather than 1.8 MB, so the Shortcut takes noticeably
> longer to open each time. Rename it to `openers.json` when you save it.

## Part 2 — build the Shortcut

Open the **Shortcuts** app and tap **+** to make a new one. For each step below,
tap the search box at the bottom, type the action's name, and tap it to add it.
Add them in this order — each one feeds the next.

| # | Search for | Then set |
| --- | --- | --- |
| 1 | **Ask for Input** | Input Type: **Text**. Prompt: `Whose name?` |
| 2 | **Change Case** | Change the dropdown from *Capitalize* to **lowercase** |
| 3 | **Get File** | Tap to expand. Turn **Show Document Picker** OFF. Set **File Path** to `Shortcuts/openers.json` |
| 4 | **Get Dictionary from Input** | Nothing — it picks up the file on its own |
| 5 | **Get Dictionary Value** | Get **Value** for key → tap the key box, choose the variable **Changed Case** |
| 6 | **Choose from List** | Prompt: `Pick a line` |
| 7 | **Copy to Clipboard** | Nothing to set |

Then tap the name at the top, call it **Openers**, and tap the icon to pick a
color and glyph.

## Part 3 — put it on the home screen

With the Shortcut open, tap the **share icon** at the bottom → **Add to Home
Screen** → **Add**. You now have an icon that works in airplane mode.

---

## If something doesn't work

- **Step 3 errors, or step 6 shows nothing at all.** The path is wrong. Try
  `openers.json` on its own, and check in the Files app that the file really is
  at iCloud Drive → Shortcuts → openers.json.
- **A name finds nothing.** Either it's outside the 1,100, or you typed a full
  name — the Shortcut looks up the first name only, so type `Ella`, not
  `Ella Fitzgerald`. Capitals don't matter; step 2 handles those.
- **It takes a few seconds to open.** That's the file being read. The
  all-2000 file is nearly twice the size and nearly twice the wait — the
  1,100-name one is the faster choice if you don't need boys' names.
- **Step 5 has no "Changed Case" variable to pick.** Step 2 didn't get added, or
  got added after step 3. The order in the table is what makes the variables
  available.

## Regenerating the file

Any change to the lines means a new file:

```bash
cd /home/user/ArtistIQ/openers
node build.js
```

then re-save `dist/iphone/openers.json` over the old one on the phone. The
Shortcut itself doesn't need rebuilding.
