const test = require("node:test");
const assert = require("node:assert/strict");

const {
  bookmarkCardMarkup,
  bookmarks,
  collectionMarkup,
  formatDate,
  pickUnreadBookmark,
  recommendationMarkup,
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

test("unread recommendations only select from the waiting queue", () => {
  assert.equal(pickUnreadBookmark(bookmarks, 0).id, "accessible-color");
  assert.equal(pickUnreadBookmark(bookmarks, 0.999).id, "web-performance");
});

test("recommendation markup links to the selected bookmark", () => {
  const bookmark = pickUnreadBookmark(bookmarks, 0.5);
  const markup = recommendationMarkup(bookmark);

  assert.match(markup, new RegExp(bookmark.title));
  assert.match(markup, new RegExp(`href="${bookmark.url}"`));
  assert.match(markup, new RegExp(bookmark.collection));
});

test("a completed library gets a clear recommendation message", () => {
  const completed = bookmarks.map((bookmark) => ({ ...bookmark, read: true }));

  assert.equal(pickUnreadBookmark(completed, 0.5), null);
  assert.equal(
    recommendationMarkup(null),
    "Everything is read. Your queue is clear!",
  );
});
