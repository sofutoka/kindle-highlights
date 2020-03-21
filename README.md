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

To get all your sentences you can run:

```sql
SELECT highlight FROM highlights ORDER BY inserted_at DESC;
```

## How it works

(The technical version.)

How this project works is you have two scripts.

### `extract-highlights`

Which takes in the path to an HTML file, extracts the highlighted sentences,
and outputs them to stdout.

E.g.

```sh
./bin/extract-highlights オーバーロード.html
```

### `save-highlights`

Which saves the highlights it receives into an SQLite3 database, avoiding
saving duplicates.

E.g.

```sh
echo '{"ueId":"foo","highlights":["あんたぁばかぁー？"]}' | ./bin/save-highlights
```

The `database.sqlite` would now contain the following record:

```
1|foo|あんたぁばかぁー？|2020-03-21T11:05:24.519Z
```
