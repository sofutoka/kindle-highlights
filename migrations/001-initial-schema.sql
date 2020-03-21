-- Up
CREATE TABLE highlights (
  id INTEGER PRIMARY KEY,
  book_title TEXT NOT NULL,
  highlight TEXT NOT NULL UNIQUE,
  location INTEGER NOT NULL,
  inserted_at TEXT NOT NULL
);

-- Down
DROP TABLE highlights;
