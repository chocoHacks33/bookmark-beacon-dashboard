const test = require("node:test");
const assert = require("node:assert/strict");

const {
  bookmarkCardMarkup,
  bookmarks,
  collectionMarkup,
  formatDate,
  summarizeBookmarks,
  summarizeCollections,
  summarizeTags,
  tagInsightMarkup,
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

test("tag insight returns a stable ranked top five", () => {
  const taggedBookmarks = [
    ...bookmarks,
    { ...bookmarks[0], id: "second-accessibility-link", tags: ["accessibility", "web"] },
  ];

  assert.deepEqual(summarizeTags(taggedBookmarks), [
    { tag: "accessibility", count: 2 },
    { tag: "web", count: 2 },
    { tag: "architecture", count: 1 },
    { tag: "color", count: 1 },
    { tag: "data", count: 1 },
  ]);
  assert.deepEqual(summarizeTags([], 3), []);
});

test("tag chart labels counts and scales bars against the leader", () => {
  const markup = tagInsightMarkup([
    { ...bookmarks[0], tags: ["design", "accessibility"] },
    { ...bookmarks[1], tags: ["design"] },
  ]);

  assert.match(markup, /#design: 2 saved links/);
  assert.match(markup, /#accessibility: 1 saved link/);
  assert.match(markup, /width: 100%/);
  assert.match(markup, /width: 50%/);
});
