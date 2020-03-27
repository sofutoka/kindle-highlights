'use strict';

const readFile = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.readAsText(file);
  });

const extractTagContents = tag => tag.match(/>(.+)</)[1];

const getTitle = fileContents =>
  extractTagContents(fileContents.match(/<h3.*<\/h3>/)[0]);

const getHighlights = fileContents =>
  fileContents.match(/<span id="highlight".*<\/span>/g).map(extractTagContents);

const getLocations = fileContents =>
  fileContents
    .match(/<span id="annotationHighlightHeader".*<\/span>/g)
    .map(extractTagContents)
    .map(a => a.match(/[0-9,]+$/)[0].replace(',', ''));

const generateNewBook = uploadedHighlights => ({
  title: uploadedHighlights.title,
  batches: [
    {
      highlights: uploadedHighlights.highlights
        .map((text, i) => ({
          text,
          location: uploadedHighlights.locations[i],
        }))
        .sort((a, b) => b.location - a.location),
      extractedAt: uploadedHighlights.extractedAt,
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

  on: {
    async parseUpload(ctx) {
      const file = await readFile(ctx.node.files[0]);

      const title = getTitle(file);
      const highlights = getHighlights(file);
      const locations = getLocations(file);

      this.set('uploadedHighlights', {
        title,
        highlights,
        locations,
        extractedAt: new Date().toISOString(),
      });
    },
  },

  computed: {
    books() {
      const storedBooks = JSON.parse(
        localStorage.getItem('books') === 'undefined'
          ? 'null'
          : localStorage.getItem('books')
      );
      const uploadedHighlights = this.get('uploadedHighlights') || null;

      if (storedBooks === null && uploadedHighlights === null) {
        console.log('First use.');
        return;
      } else if (storedBooks === null) {
        console.log(
          `The user hasn't used it in the past, but has uploaded a new file.`
        );
        return [generateNewBook(uploadedHighlights)];
      } else if (uploadedHighlights === null) {
        console.log(
          `The user has used it in the past, but hasn't uploaded a file yet.`
        );
        return storedBooks;
      } else {
        console.log(
          `The user has used it in the past AND has uploaded a new file.`
        );
        return updateBooksArray(
          storedBooks,
          generateNewBook(uploadedHighlights)
        );
      }
    },
  },

  observe: {
    books(books) {
      localStorage.setItem('books', JSON.stringify(books));
    },
  },
});
