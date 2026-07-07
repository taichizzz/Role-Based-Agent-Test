# AniTrack

AniTrack is a single-page anime watchlist built with vanilla HTML, CSS, and JavaScript. It lets you add anime entries, track watched episodes, automatically mark entries as completed, rate completed anime, filter the list, delete items, and keep data in `localStorage` across reloads.

## Files
- `index.html` – page structure
- `style.css` – dark theme and responsive layout
- `app.js` – state, rendering, filtering, rating, and persistence logic

## Setup
1. Clone or download this repository.
2. Open `index.html` directly in a modern web browser.
3. No installation, package manager, or build step is required.

## Usage
1. Enter an anime title and a total episode count of `1` or more.
2. Click **Add Anime** to create a new watching entry.
3. Use the `+` and `-` buttons to update watched episodes.
4. When watched episodes reach the total episode count, the entry automatically becomes **Completed**.
5. If you decrease a completed entry below the total episode count, it becomes **Watching** again and its star rating resets.
6. Rate completed entries with the 1-to-5 star buttons.
7. Use the **All**, **Watching**, and **Completed** tabs to filter the list.
8. Click **Delete** to remove an entry.
9. The list and current filter persist in `localStorage` after reloads.
10. When no entries match the current view, AniTrack shows an empty-state message.

## Notes
- Duplicate titles are allowed.
- Blank titles are rejected.
- Total episodes must be an integer value of `1` or greater.
