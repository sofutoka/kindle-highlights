'use strict';

const readFile = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.readAsText(file);
  });

const getTitle = contents =>
  contents.match(/(Your Kindle Notes For|メモ付きのKindle本):\n(.+)\n/)[2];

const getHighlightsAndLocations = contents => {
  const result = [];
  const regex = RegExp('(Location|位置): ([0-9,]+)\n(.+)\n', 'g');

  let match;
  while ((match = regex.exec(contents)) !== null) {
    result.push({
      location: match[2].replace(',', ''),
      highlight: match[3],
    });
  }

  return result;
};

const generateNewBook = pastedHighlights => ({
  title: pastedHighlights.title,
  batches: [
    {
      highlights: pastedHighlights.highlights.map((text, i) => ({
        text,
        location: pastedHighlights.locations[i],
      })),
      extractedAt: pastedHighlights.extractedAt,
    },
  ],
});

const addNewBatchToBook = (book, newBatch) => {
  const allOldHighlights = _.flattenDeep(
    book.batches.map(a => a.highlights.map(a => a.text))
  );
  const cleanedBatch = {
    ...newBatch,
    highlights: newBatch.highlights.reduce((acc, highlight) => {
      if (!allOldHighlights.includes(highlight.text)) {
        acc.push(highlight);
      }
      return acc;
    }, []),
  };

  return {
    ...book,
    batches: [cleanedBatch, ...book.batches],
  };
};

const updateBooksArray = (booksArray, newBook) => {
  const oldBookIndex = booksArray.findIndex(a => a.title === newBook.title);

  if (oldBookIndex === -1) {
    return [newBook, ...booksArray];
  } else {
    const oldBook = booksArray[oldBookIndex];
    const updatedBook = addNewBatchToBook(oldBook, newBook.batches[0]);

    const booksArrayMinusNewBook = [...booksArray];
    booksArrayMinusNewBook.splice(oldBookIndex, 1);

    return [updatedBook, ...booksArrayMinusNewBook];
  }
};

const app = new Ractive({
  el: '#target',
  template: '#template',

  computed: {
    pastedHighlights() {
      const text = this.get('pastedText');

      const title = getTitle(text);
      const highlightsAndLocations = getHighlightsAndLocations(text);
      const highlights = highlightsAndLocations.map(a => a.highlight);
      const locations = highlightsAndLocations.map(a => a.location);

      this.set('pastedText', '');

      return {
        title,
        highlights,
        locations,
        extractedAt: new Date().toISOString(),
      };
    },

    books() {
      const storedBooks = JSON.parse(
        localStorage.getItem('books') === 'undefined'
          ? 'null'
          : localStorage.getItem('books')
      );
      const pastedHighlights = this.get('pastedHighlights') || null;

      if (storedBooks === null && pastedHighlights === null) {
        console.log('First use.');
        return;
      } else if (storedBooks === null) {
        console.log(
          `The user hasn't used it in the past, but has uploaded a new file.`
        );
        return [generateNewBook(pastedHighlights)];
      } else if (pastedHighlights === null) {
        console.log(
          `The user has used it in the past, but hasn't uploaded a file yet.`
        );
        return storedBooks;
      } else {
        console.log(
          `The user has used it in the past AND has uploaded a new file.`
        );
        return updateBooksArray(storedBooks, generateNewBook(pastedHighlights));
      }
    },
  },

  observe: {
    books(books) {
      localStorage.setItem('books', JSON.stringify(books));
    },
  },
});
