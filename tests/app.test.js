const test = require("node:test");
const assert = require("node:assert/strict");

const {
  bookmarkCardMarkup,
  bookmarks,
  collectionMarkup,
  daysSince,
  formatDate,
  getStaleBookmarks,
  summarizeBookmarks,
  summarizeCollections,
} = require("../app.js");

test("starter dashboard includes six distinct bookmarks", () => {
  assert.equal(bookmarks.length, 6);
  assert.equal(new Set(bookmarks.map((bookmark) => bookmark.id)).size, 6);
});

test("summary reports library totals", () => {
  assert.deepEqual(summarizeBookmarks(bookmarks), {
    total: 6,
    unread: 4,
    favorites: 3,
    collections: 4,
  });
});

test("collection summary ranks by count and then name", () => {
  assert.deepEqual(summarizeCollections(bookmarks), [
    { name: "Design", count: 2 },
    { name: "Development", count: 2 },
    { name: "Product", count: 1 },
    { name: "Productivity", count: 1 },
  ]);
});

test("bookmark card includes useful metadata", () => {
  const markup = bookmarkCardMarkup(bookmarks[0]);
  assert.match(markup, /A practical guide to accessible color/);
  assert.match(markup, /Design/);
  assert.match(markup, /#accessibility/);
  assert.match(markup, /Favorite bookmark/);
});

test("collection progress exposes an accessible value", () => {
  const markup = collectionMarkup(bookmarks);
  assert.match(markup, /Design: 2 of 6 links/);
  assert.match(markup, /aria-valuenow="2"/);
  assert.match(markup, /width: 33%/);
});

test("saved dates are rendered without local timezone drift", () => {
  assert.equal(formatDate("2026-11-16"), "16 Nov 2026");
});

test("stale-link audit uses UTC calendar days and a strict age threshold", () => {
  const today = new Date("2026-11-17T18:00:00+08:00");

  assert.equal(daysSince("2026-11-16", today), 1);
  assert.deepEqual(
    getStaleBookmarks(bookmarks, today).map(({ id }) => id),
    ["focus-systems", "web-performance"],
  );
  assert.equal(
    getStaleBookmarks(
      [{ ...bookmarks[0], lastCheckedOn: "2026-10-03" }],
      today,
    ).length,
    0,
  );
});

test("stale bookmarks receive a visible review label", () => {
  const markup = bookmarkCardMarkup(
    bookmarks.find(({ id }) => id === "web-performance"),
    new Date("2026-11-17T00:00:00Z"),
  );

  assert.match(markup, /Needs link review/);
});
