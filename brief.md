# AniTrack Research Brief

## Goal
Build AniTrack, a single-page anime watchlist web app using only vanilla HTML, CSS, and JavaScript with no framework and no build step. Users need to add anime entries, track watched episodes, automatically mark a title as completed when watched episodes reach the total episode count, rate completed titles, filter between all/watching/completed states, delete entries, preserve data in `localStorage`, and see a friendly empty state when no entries exist. The interface must use a dark theme and remain usable on mobile.

## Findings
1. The product request requires a single-page anime watchlist built with vanilla HTML, CSS, and JavaScript only, with no frameworks and no build step. Source: `product-request.md`.
2. The required user actions are: add an anime with a title and total episode count, increase or decrease episodes watched with buttons, delete an entry, filter by `All`, `Watching`, and `Completed`, and rate a completed anime from 1 to 5 stars. Source: `product-request.md`.
3. An entry must automatically become `Completed` when episodes watched equals total episodes. Source: `product-request.md`.
4. All data must persist in `localStorage` across reloads, and the UI must show an empty-state message when the list is empty. Source: `product-request.md`.
5. The interface must use a dark theme and be responsive on mobile, and the repo must include setup and usage instructions in `README.md`. Source: `product-request.md`.
6. Data model decision: each anime entry should be stored as `{ id, title, totalEpisodes, watchedEpisodes, status, rating, createdAt }`. Observation: the request names title, total episodes, watched episodes behavior, completion state, and rating. Inference/decision: explicit `id`, `status`, and `createdAt` fields are needed for stable rendering, filtering, deletion, and ordering. Source: task 2 log entry in `log.md`.
7. ID scheme decision: generate ids as `anime-<Date.now()>-<random base36>`. This is a documented implementation decision to give each entry a distinct identifier even when titles duplicate. Source: task 2 log entry in `log.md`.
8. Completion rule decision: an entry is `Watching` when `watchedEpisodes < totalEpisodes` and `Completed` when `watchedEpisodes === totalEpisodes`. If a completed entry is decreased below the total, it must revert to `Watching` and its `rating` must reset to `0` so rating remains completed-only. Source: task 2 log entry in `log.md`.
9. Validation decision: rating before completion is not allowed; duplicate titles are allowed; total episode count must be an integer greater than or equal to `1`, so zero is rejected. Source: task 2 log entry in `log.md`.
10. Filter behavior decision: `All` shows every entry, `Watching` shows entries where `watchedEpisodes < totalEpisodes`, and `Completed` shows entries where `watchedEpisodes === totalEpisodes`. Source: task 2 log entry in `log.md`.

## Requirements
1. Use only `index.html`, `style.css`, and `app.js` in the browser runtime. Do not introduce frameworks, package managers, or build tooling. Trace: finding 1.
2. The page must be a single-page interface and must load `style.css` and `app.js` from `index.html`. Trace: findings 1 and 5.
3. The page must provide a form with a text input for anime title and a numeric input for total episode count, plus a submit button to add an entry. Trace: finding 2.
4. The title input must reject blank values after trimming. This is a documented validation decision needed to implement “add an anime with a title.” Trace: finding 2 plus task 2 decision.
5. The total episode count input must accept only integer values greater than or equal to `1`; zero and negative totals must be rejected. Trace: finding 9.
6. A new entry must be created with the data model `{ id, title, totalEpisodes, watchedEpisodes, status, rating, createdAt }`, where `watchedEpisodes` starts at `0`, `status` starts as `Watching`, and `rating` starts at `0`. Trace: findings 6 and 8.
7. Each entry id must use the scheme `anime-<Date.now()>-<random base36>`. Trace: finding 7.
8. Duplicate titles must be allowed; entries are distinguished by `id`. Trace: finding 9.
9. Each rendered entry must expose controls to increase watched episodes by 1 and decrease watched episodes by 1. Watched episodes must never drop below `0` and must never exceed `totalEpisodes`. This boundary behavior is a documented implementation decision required to make the buttons safe. Trace: finding 2 plus task 2 decision.
10. When `watchedEpisodes === totalEpisodes`, the entry must automatically switch to `Completed`. When a completed entry is decreased so `watchedEpisodes < totalEpisodes`, it must revert to `Watching` and its rating must reset to `0`. Trace: findings 3 and 8.
11. Rating controls must exist only for completed entries, support values `1` through `5`, and must be disabled or hidden for watching entries. Trace: findings 2 and 9.
12. The page must provide three filter tabs labeled `All`, `Watching`, and `Completed`. `All` shows every entry; `Watching` shows entries with `watchedEpisodes < totalEpisodes`; `Completed` shows entries with `watchedEpisodes === totalEpisodes`. Trace: findings 2 and 10.
13. Each entry must have a delete control that removes it from the rendered list and persisted storage. Trace: finding 2.
14. The app must persist the full entry array and active filter in `localStorage` so entries survive reloads. Persisting the active filter is a documented UI-state decision. Trace: finding 4 plus task 2 decision.
15. When no entries are visible for the active filter, the page must show an empty-state message. This covers both an empty collection and a filter with zero matches. The filtered-case wording is a documented decision to make the state precise. Trace: finding 4 plus task 2 decision.
16. The interface must use a dark theme and must remain responsive on mobile widths. Trace: finding 5.
17. `README.md` must document local setup and usage instructions that match the delivered app behavior. Trace: finding 5.

## Recommendation
Use a simple client-side architecture: semantic HTML for structure, one JavaScript module in `app.js` for state and rendering, and one stylesheet in `style.css` for layout, dark theme, and responsive behavior. Store all entries in an array, derive `status` from watched-versus-total logic whenever an entry changes, and save the updated array to `localStorage` after every state mutation. Rejected alternatives: (a) computing completion only in the DOM without storing it—rejected because filtering and persistence become less explicit; (b) forbidding duplicate titles—rejected because the request does not forbid them and users may track remakes or separate seasons with the same label; (c) preserving a completed rating after a decrement—rejected because it conflicts with the completed-only rating rule.

## Recommended Structure
### `index.html`
Use the following DOM structure and identifiers exactly:
- `body.app-body`
- `main#app.app-shell`
- `header.app-header`
  - `h1.app-title`
  - `p.app-subtitle`
- `section#add-section.panel`
  - `form#anime-form.anime-form`
    - `label.form-label` wrapping `input#title-input.form-input[type="text"]`
    - `label.form-label` wrapping `input#episodes-input.form-input[type="number"]`
    - `button#add-button.primary-button[type="submit"]`
  - `p#form-error.form-error`
- `section#filters-section.panel`
  - `div#filter-tabs.filter-tabs`
    - `button.filter-tab.active[data-filter="All"]`
    - `button.filter-tab[data-filter="Watching"]`
    - `button.filter-tab[data-filter="Completed"]`
- `section#list-section.panel`
  - `p#empty-state.empty-state`
  - `ul#anime-list.anime-list`
- Include `<link rel="stylesheet" href="style.css">` in the head and `<script src="app.js"></script>` before `</body>`.

### Rendered entry structure from `app.js`
Each entry rendered into `#anime-list` must use:
- `li.anime-card` with either `.status-watching` or `.status-completed`
- child `div.anime-card__main`
  - `h2.anime-card__title`
  - `p.anime-card__meta`
  - `p.anime-card__status`
- child `div.anime-card__controls`
  - `div.episode-controls`
    - `button.episode-button.decrement-button`
    - `span.watched-count`
    - `button.episode-button.increment-button`
  - `div.rating-controls` for completed entries only
    - five `button.star-button` elements with `data-rating="1"` through `data-rating="5"`
  - `button.delete-button`

### `app.js`
Implement these named constants/functions so QA and Engineering can trace behavior clearly:
- `const STORAGE_KEY = 'anitrack-items';`
- `const FILTER_KEY = 'anitrack-filter';`
- `let animeEntries = []`
- `let activeFilter = 'All'`
- `loadState()`
- `saveState()`
- `createAnimeEntry(title, totalEpisodes)`
- `syncEntryStatus(entry)`
- `renderFilterTabs()`
- `renderAnimeList()`
- `handleFormSubmit(event)`
- `updateWatchedEpisodes(id, delta)`
- `updateRating(id, rating)`
- `deleteEntry(id)`
- `setActiveFilter(filter)`
- `initializeApp()`
Attach event listeners through JavaScript, not inline HTML attributes.

### `style.css`
Style the exact ids and classes listed above. Include:
- dark background and elevated panel styling
- clear active-state styling for `.filter-tab.active`
- distinct visual treatment for `.status-watching` vs `.status-completed`
- visible star rating states using `.star-button` and an additional selected-state class such as `.is-selected`
- mobile responsiveness at narrow widths so the form and card controls stack cleanly

## Constraints and Open Risks
- The task does not specify whether filtered empty states should use different wording for “no entries yet” versus “no matches for this filter”; Engineering should keep one generic empty-state message unless QA or LEAD reopens it.
- The product request does not specify whether seasons with the same title should be disambiguated in the UI; allowing duplicate titles satisfies the request but may reduce clarity for users.
- This workflow verifies behavior by file inspection, not by browser execution, so runtime issues such as minor event-binding mistakes may remain an open verification risk until manual testing occurs.
