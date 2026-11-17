const bookmarks = [
  {
    id: "accessible-color",
    title: "A practical guide to accessible color",
    url: "https://example.com/accessible-color",
    domain: "designnotes.example",
    collection: "Design",
    tags: ["accessibility", "color"],
    savedOn: "2026-11-16",
    read: false,
    favorite: true,
  },
  {
    id: "browser-storage",
    title: "Choosing browser storage for small apps",
    url: "https://example.com/browser-storage",
    domain: "webcraft.example",
    collection: "Development",
    tags: ["javascript", "architecture"],
    savedOn: "2026-11-15",
    read: true,
    favorite: false,
  },
  {
    id: "writing-briefs",
    title: "Writing product briefs people actually read",
    url: "https://example.com/writing-briefs",
    domain: "productfield.example",
    collection: "Product",
    tags: ["writing", "planning"],
    savedOn: "2026-11-13",
    read: false,
    favorite: false,
  },
  {
    id: "focus-systems",
    title: "Simple systems for deeper focus",
    url: "https://example.com/focus-systems",
    domain: "workwell.example",
    collection: "Productivity",
    tags: ["focus", "habits"],
    savedOn: "2026-11-11",
    read: false,
    favorite: true,
  },
  {
    id: "data-story",
    title: "Make a small dataset tell a clear story",
    url: "https://example.com/data-story",
    domain: "chartroom.example",
    collection: "Design",
    tags: ["data", "visualization"],
    savedOn: "2026-11-08",
    read: true,
    favorite: true,
  },
  {
    id: "web-performance",
    title: "A calm approach to web performance",
    url: "https://example.com/web-performance",
    domain: "fastpages.example",
    collection: "Development",
    tags: ["performance", "web"],
    savedOn: "2026-11-02",
    read: false,
    favorite: false,
  },
];

function formatDate(dateString) {
  return new Intl.DateTimeFormat("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${dateString}T00:00:00Z`));
}

function summarizeBookmarks(items) {
  return {
    total: items.length,
    unread: items.filter((bookmark) => !bookmark.read).length,
    favorites: items.filter((bookmark) => bookmark.favorite).length,
    collections: new Set(items.map((bookmark) => bookmark.collection)).size,
  };
}

function summarizeCollections(items) {
  const counts = items.reduce((summary, bookmark) => {
    summary[bookmark.collection] = (summary[bookmark.collection] || 0) + 1;
    return summary;
  }, {});

  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function bookmarkCardMarkup(bookmark) {
  const status = bookmark.read ? "Read" : "Unread";
  const favorite = bookmark.favorite
    ? '<span class="favorite" aria-label="Favorite bookmark">★</span>'
    : "";

  return `
    <article class="bookmark-card">
      <div class="bookmark-card__body">
        <div class="bookmark-meta">
          <span>${bookmark.collection}</span>
          <span>${status}</span>
        </div>
        <h3><a href="${bookmark.url}">${bookmark.title}</a></h3>
        <p class="domain">${bookmark.domain}</p>
        <div class="tag-list" aria-label="Tags">
          ${bookmark.tags.map((tag) => `<span>#${tag}</span>`).join("")}
        </div>
      </div>
      <div class="bookmark-card__aside">
        ${favorite}
        <time datetime="${bookmark.savedOn}">${formatDate(bookmark.savedOn)}</time>
      </div>
    </article>
  `;
}

function collectionMarkup(items) {
  const total = items.length;
  return summarizeCollections(items)
    .map(({ name, count }) => {
      const percentage = total ? Math.round((count / total) * 100) : 0;
      return `
        <div class="collection-row">
          <div>
            <strong>${name}</strong>
            <span>${count} ${count === 1 ? "link" : "links"}</span>
          </div>
          <div
            class="collection-track"
            role="progressbar"
            aria-label="${name}: ${count} of ${total} links"
            aria-valuemin="0"
            aria-valuemax="${total}"
            aria-valuenow="${count}"
          >
            <span style="width: ${percentage}%"></span>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderDashboard(items = bookmarks) {
  const summary = summarizeBookmarks(items);
  document.querySelector("#bookmark-count").textContent = summary.total;
  document.querySelector("#unread-count").textContent = summary.unread;
  document.querySelector("#collection-count").textContent = summary.collections;
  document.querySelector("#favorite-count").textContent = summary.favorites;
  document.querySelector("#library-count").textContent = `${summary.total} links`;
  document.querySelector("#bookmark-list").innerHTML = items
    .map(bookmarkCardMarkup)
    .join("");
  document.querySelector("#collection-list").innerHTML = collectionMarkup(items);
}

if (typeof document !== "undefined") {
  renderDashboard();
}

if (typeof module !== "undefined") {
  module.exports = {
    bookmarkCardMarkup,
    bookmarks,
    collectionMarkup,
    formatDate,
    summarizeBookmarks,
    summarizeCollections,
  };
}

