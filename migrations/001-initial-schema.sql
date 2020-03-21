-- Up
CREATE TABLE highlights (
  id INTEGER PRIMARY KEY,
  ue_id TEXT NOT NULL,
  highlight TEXT NOT NULL UNIQUE,
  inserted_at TEXT NOT NULL
);

-- Down
DROP TABLE highlights;
