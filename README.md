# Kindle Highlights

A small side-project to be able to extract the sentences I highlight during my
reading on my Kindle in order to later be able to easily make sentence cards for
my Japanese studies according to the [Mass Immersion Approach][mia].

[mia]: https://massimmersionapproach.com

Of course you can use this to extract the sentences for whatever your purpose
may be.

## Inspiration

The need for this project arose when on a fine Saturday morning I went to look
at the `My Clippings.txt` file and lo and behold all of my highlighted sentences
had a nice message:

> <You have reached the clipping limit for this item>

Fantastic, thank you DRM limitations.

I looked into it and https://clippings.io works nicely to do extract the
highlights.  However, it is clunky as hell.  You'd export all your sentences
every time, there's no easy straightforward way to only export the sentences
that you've gathered since last time.

So I made my own tooling, which is this project.

## Setup

Requirements:

- Node.js (tested with v10.16.3).

You just need to install the dependencies with:

```sh
npm install
```

## Usage

The usage is rather simple if you're familiar with the command line.

First you have to download the highlights from Amazon:

1. Visiting https://read.amazon.co.jp/kp/notebook/ (adjust for your Amazon
    domain).
2. Choosing your book.
3. Downloading the page by right clicking and choosing "Save Page As..." or
    similar and saving it as an HTML file in the location of your liking.

Then you can run the scripts as follows:

```sh
./bin/extract-highlights <path/to/your/file.html> | ./bin/import-highlights
```

And now you will have a `database.sqlite` file which will contain the extracted
highlighted sentences and you can access by doing:

```sh
sqlite3 database.sqlite
```

To get all your sentences you can use the following query:

```sql
SELECT book_title, highlight FROM highlights ORDER BY inserted_at DESC, location ASC;
```

### The text exporter

After you've imported some highlights into the database, there is also a
convenient script you can use to export the highlights into a convenient format.

```sh
./bin/export-highlights database.sqlite --latest
```

It would output something like the following:

```
オーバーロード1　不死者の王
==============

ネックレスはアウラのものに酷似しているが、銀色のドングリ。

アウラに比べれば武装は少ない。
```

Because we used the `--latest` flag then for each book it'd only export the most
recently imported batch of highlights.  Very handy.

## How it works

(The technical version.)

How this project works is you have two scripts.

### `extract-highlights`

Which takes in the path to an HTML file, extracts the highlighted sentences,
and outputs them to stdout.

```sh
./bin/extract-highlights オーバーロード.html
```

### `import-highlights`

Which inserts the highlights it receives into an SQLite3 database, avoiding
inserting duplicates.  It only accepts input through stdin.

E.g.

```sh
echo '{"book_title":"新世紀エヴァンゲリオン","highlights":[{"text":"あんたぁばかぁー？","location":"292"]}' | ./bin/import-highlights
```

The `database.sqlite` would now contain the following record:

```
1|新世紀エヴァンゲリオン|あんたぁばかぁー？|292|2020-03-21T11:05:24.519Z
```

And it has a `--nuke` flag, which will clear the database before inserting the
highlights into the database.

### `export-highlights`

Exports the highlights in the given database for a given book.

```sh
./bin/export-highlights <path/to/database/file.sqlite> [--book_title <SQL LIKE statement>] [--latest]
```

Flags:

- `--book_title` allows you to filter which book to export the highlights of.
    Takes in an [SQL LIKE statement][sqllike].
- `--latest` when passed in only exports the latest imported batch, instead of
    everything that has been imported for that book.

[sqllike]: https://www.w3schools.com/SQL/sql_like.asp
