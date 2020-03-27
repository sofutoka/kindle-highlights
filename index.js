const readFile = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.readAsText(file);
  });

const extractTagContents = tag => tag.match(/>(.+)</)[1];

const getBookTitle = fileContents =>
  extractTagContents(fileContents.match(/<h3.*<\/h3>/)[0]);

const getHighlights = fileContents =>
  fileContents.match(/<span id="highlight".*<\/span>/g).map(extractTagContents);

const getLocations = fileContents =>
  fileContents
    .match(/<span id="annotationHighlightHeader".*<\/span>/g)
    .map(extractTagContents)
    .map(a => a.match(/[0-9,]+$/)[0].replace(',', ''));

const app = new Ractive({
  el: '#target',
  template: '#template',

  on: {
    async parseUpload(ctx) {
      const file = await readFile(ctx.node.files[0]);

      const bookTitle = getBookTitle(file);
      const highlights = getHighlights(file);
      const locations = getLocations(file);

      this.set('highlights', {
        bookTitle,
        highlights,
        locations,
        extractedAt: new Date().toISOString(),
      });
    },
  },

  computed: {
    books() {
      const highlights = this.get('highlights');

      if (highlights === void 0) {
        return;
      }

      return [
        {
          bookTitle: highlights.bookTitle,
          highlights: highlights.highlights.map((text, i) => ({
            text,
            location: highlights.locations[i],
          })),
        },
      ];
    },
  },
});
