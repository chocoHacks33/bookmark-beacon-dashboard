const test = require("node:test");
const assert = require("node:assert/strict");

const {
  bookmarkCardMarkup,
  bookmarks,
  collectionMarkup,
  formatDate,
  searchBookmarks,
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

test("search matches titles, collections, domains, and tags", () => {
  assert.deepEqual(searchBookmarks(bookmarks, "FOCUS").map(({ id }) => id), [
    "focus-systems",
  ]);
  assert.equal(searchBookmarks(bookmarks, "Development").length, 2);
  assert.deepEqual(searchBookmarks(bookmarks, "visualization").map(({ id }) => id), [
    "data-story",
  ]);
  assert.deepEqual(searchBookmarks(bookmarks, "fastpages").map(({ id }) => id), [
    "web-performance",
  ]);
});

test("blank search returns a new copy and unmatched text returns no results", () => {
  const results = searchBookmarks(bookmarks, "   ");

  assert.deepEqual(results, bookmarks);
  assert.notStrictEqual(results, bookmarks);
  assert.deepEqual(searchBookmarks(bookmarks, "not-in-this-library"), []);
});
