# Kindle Highlights

<https://greduan.github.io/kindle-highlights>

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

> \<You have reached the clipping limit for this item>

Fantastic, thank you DRM limitations.

I looked into it and <https://clippings.io> works nicely to do extract the
highlights.  However:

- It is clunky as hell.
- You'd export all your sentences every time and there's no easy straightforward
    way to only export the sentences that you've gathered since last time.
- If it had an easy way to delete sentences that'd be fine, but it doesn't.

So I made my own thing.

## Development

Requirements:

- Node.js (tested with v10.16.3).
- Yarn (tested with v1.19.1).

```sh
git clone https://github.com/greduan/kindle-highlights
cd kindle-highlights
yarn
```

Then you can run a simple local server, I just use Python for this, here's the
commands for the different versions:

```sh
python2.7 -m SimpleHTTPServer
python3 -m http.server
```

And now you can visit `http://localhost:8000`.
