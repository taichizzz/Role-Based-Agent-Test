const STORAGE_KEY = 'anitrack-items';
const FILTER_KEY = 'anitrack-filter';
let animeEntries = [];
let activeFilter = 'All';

const form = document.getElementById('anime-form');
const titleInput = document.getElementById('title-input');
const episodesInput = document.getElementById('episodes-input');
const formError = document.getElementById('form-error');
const animeList = document.getElementById('anime-list');
const emptyState = document.getElementById('empty-state');
const filterTabs = document.getElementById('filter-tabs');

function loadState() {
  const storedEntries = localStorage.getItem(STORAGE_KEY);
  const storedFilter = localStorage.getItem(FILTER_KEY);

  animeEntries = storedEntries ? JSON.parse(storedEntries) : [];
  animeEntries = animeEntries.map((entry) => syncEntryStatus({ ...entry }));
  activeFilter = ['All', 'Watching', 'Completed'].includes(storedFilter) ? storedFilter : 'All';
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(animeEntries));
  localStorage.setItem(FILTER_KEY, activeFilter);
}

function createAnimeEntry(title, totalEpisodes) {
  return {
    id: `anime-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    totalEpisodes,
    watchedEpisodes: 0,
    status: 'Watching',
    rating: 0,
    createdAt: new Date().toISOString()
  };
}

function syncEntryStatus(entry) {
  const normalizedEntry = { ...entry };
  normalizedEntry.watchedEpisodes = Math.min(Math.max(normalizedEntry.watchedEpisodes, 0), normalizedEntry.totalEpisodes);

  if (normalizedEntry.watchedEpisodes === normalizedEntry.totalEpisodes) {
    normalizedEntry.status = 'Completed';
  } else {
    normalizedEntry.status = 'Watching';
    normalizedEntry.rating = 0;
  }

  return normalizedEntry;
}

function renderFilterTabs() {
  const tabs = filterTabs.querySelectorAll('.filter-tab');
  tabs.forEach((tab) => {
    const isActive = tab.dataset.filter === activeFilter;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-pressed', String(isActive));
  });
}

function getVisibleEntries() {
  if (activeFilter === 'Watching') {
    return animeEntries.filter((entry) => entry.watchedEpisodes < entry.totalEpisodes);
  }

  if (activeFilter === 'Completed') {
    return animeEntries.filter((entry) => entry.watchedEpisodes === entry.totalEpisodes);
  }

  return animeEntries;
}

function createRatingMarkup(entry) {
  if (entry.status !== 'Completed') {
    return '';
  }

  return `
    <div class="rating-controls" aria-label="Rate ${entry.title}">
      ${[1, 2, 3, 4, 5]
        .map(
          (ratingValue) => `
            <button
              class="star-button ${entry.rating >= ratingValue ? 'is-selected' : ''}"
              type="button"
              data-action="rate"
              data-id="${entry.id}"
              data-rating="${ratingValue}"
              aria-label="Rate ${entry.title} ${ratingValue} star${ratingValue === 1 ? '' : 's'}"
            >★</button>
          `
        )
        .join('')}
    </div>
  `;
}

function renderAnimeList() {
  const visibleEntries = getVisibleEntries();
  emptyState.hidden = visibleEntries.length > 0;

  animeList.innerHTML = visibleEntries
    .map(
      (entry) => `
        <li class="anime-card ${entry.status === 'Completed' ? 'status-completed' : 'status-watching'}">
          <div class="anime-card__main">
            <h2 class="anime-card__title">${entry.title}</h2>
            <p class="anime-card__meta">Episodes watched: ${entry.watchedEpisodes} / ${entry.totalEpisodes}</p>
            <p class="anime-card__status">Status: ${entry.status}</p>
          </div>
          <div class="anime-card__controls">
            <div class="episode-controls">
              <button class="episode-button decrement-button" type="button" data-action="decrement" data-id="${entry.id}" aria-label="Decrease watched episodes for ${entry.title}">-</button>
              <span class="watched-count">${entry.watchedEpisodes}</span>
              <button class="episode-button increment-button" type="button" data-action="increment" data-id="${entry.id}" aria-label="Increase watched episodes for ${entry.title}">+</button>
            </div>
            ${createRatingMarkup(entry)}
            <button class="delete-button" type="button" data-action="delete" data-id="${entry.id}">Delete</button>
          </div>
        </li>
      `
    )
    .join('');
}

function handleFormSubmit(event) {
  event.preventDefault();
  const title = titleInput.value.trim();
  const totalEpisodes = Number.parseInt(episodesInput.value, 10);

  if (!title) {
    formError.textContent = 'Please enter an anime title.';
    return;
  }

  if (!Number.isInteger(totalEpisodes) || totalEpisodes < 1) {
    formError.textContent = 'Total episodes must be an integer of 1 or more.';
    return;
  }

  formError.textContent = '';
  animeEntries.unshift(createAnimeEntry(title, totalEpisodes));
  saveState();
  renderAnimeList();
  form.reset();
  titleInput.focus();
}

function updateWatchedEpisodes(id, delta) {
  animeEntries = animeEntries.map((entry) => {
    if (entry.id !== id) {
      return entry;
    }

    const watchedEpisodes = Math.min(Math.max(entry.watchedEpisodes + delta, 0), entry.totalEpisodes);
    return syncEntryStatus({ ...entry, watchedEpisodes });
  });

  saveState();
  renderAnimeList();
}

function updateRating(id, rating) {
  animeEntries = animeEntries.map((entry) => {
    if (entry.id !== id || entry.status !== 'Completed') {
      return entry;
    }

    return { ...entry, rating };
  });

  saveState();
  renderAnimeList();
}

function deleteEntry(id) {
  animeEntries = animeEntries.filter((entry) => entry.id !== id);
  saveState();
  renderAnimeList();
}

function setActiveFilter(filter) {
  if (!['All', 'Watching', 'Completed'].includes(filter)) {
    return;
  }

  activeFilter = filter;
  saveState();
  renderFilterTabs();
  renderAnimeList();
}

function initializeApp() {
  loadState();
  renderFilterTabs();
  renderAnimeList();

  form.addEventListener('submit', handleFormSubmit);
  filterTabs.addEventListener('click', (event) => {
    const button = event.target.closest('.filter-tab');
    if (!button) {
      return;
    }

    setActiveFilter(button.dataset.filter);
  });

  animeList.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) {
      return;
    }

    const { action, id, rating } = button.dataset;

    if (action === 'increment') {
      updateWatchedEpisodes(id, 1);
    }

    if (action === 'decrement') {
      updateWatchedEpisodes(id, -1);
    }

    if (action === 'delete') {
      deleteEntry(id);
    }

    if (action === 'rate') {
      updateRating(id, Number.parseInt(rating, 10));
    }
  });
}

initializeApp();
