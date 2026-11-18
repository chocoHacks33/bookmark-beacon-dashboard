const test = require("node:test");
const assert = require("node:assert/strict");

const {
  bookmarkCardMarkup,
  bookmarks,
  collectionMarkup,
  copyBookmarkLink,
  formatDate,
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
  assert.match(markup, /data-copy-url="https:\/\/example.com\/accessible-color"/);
  assert.match(markup, /Copy link to A practical guide to accessible color/);
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

test("copy link writes the bookmark URL to the clipboard", async () => {
  let copiedText = "";
  const clipboard = {
    async writeText(value) {
      copiedText = value;
    },
  };

  assert.equal(await copyBookmarkLink(bookmarks[0].url, clipboard), true);
  assert.equal(copiedText, bookmarks[0].url);
});

test("copy link reports unavailable and rejected clipboards", async () => {
  assert.equal(await copyBookmarkLink(bookmarks[0].url, undefined), false);
  assert.equal(
    await copyBookmarkLink(bookmarks[0].url, {
      async writeText() {
        throw new Error("permission denied");
      },
    }),
    false,
  );
});
