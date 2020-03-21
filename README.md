# Kindle Highlights

A small side-project to be able to extract the sentences I highlight during my
reading on my Kindle in order to later be able to easily make sentence cards for
my Japanese studies according to the [Mass Immersion Approach][mia].

[mia]: https://massimmersionapproach.com

Of course you can use this to extract the sentences for whatever your purpose
may be.

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
./bin/extract-highlights <path/to/your/file.html> | ./bin/save-highlights
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

After you've saved some highlights into the database, there is also a convenient
script you can use to export the highlights into a convenient format.

```sh
./bin/export-highlights <path/to/database/file.sqlite> [--book_title <SQL LIKE statement>]
```

It would output something like the following:

```
オーバーロード1　不死者の王
==============

ネックレスはアウラのものに酷似しているが、銀色のドングリ。

アウラに比べれば武装は少ない。
```

### Nuking

The `save-highlights` script has a `--nuke` flag, which if used will delete the
contents of the database before inserting new data.

This is meant to be used for a new card making session.  E.g. two days ago you
saved all your highlights and exported them, today you want to do it again but
ignoring the previous highlights, well you can do so by using the `--nuke` flag,
as it'll delete the previous records and thus when you export again you won't
have the old data again.

Use that flow if it matches your flow.

## How it works

(The technical version.)

How this project works is you have two scripts.

### `extract-highlights`

Which takes in the path to an HTML file, extracts the highlighted sentences,
and outputs them to stdout.

```sh
./bin/extract-highlights オーバーロード.html
```

### `save-highlights`

Which saves the highlights it receives into an SQLite3 database, avoiding
saving duplicates.  It only accepts input through stdin.

E.g.

```sh
echo '{"book_title":"新世紀エヴァンゲリオン","highlights":[{"text":"あんたぁばかぁー？","location":"292"]}' | ./bin/save-highlights
```

The `database.sqlite` would now contain the following record:

```
1|新世紀エヴァンゲリオン|あんたぁばかぁー？|292|2020-03-21T11:05:24.519Z
```

And it has a `--nuke` flag, which will clear the database before saving the
highlights into the database.
