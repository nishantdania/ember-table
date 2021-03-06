const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function generateAlphabetColumns(columnCount) {
  let columns = [];
  let columnWidth = 180;

  for (let j = 0; j < columnCount; j++) {
    columns.push({
      name: `Col ${ALPHABET[j % 26]}`,
      valuePath: ALPHABET[j % 26],
      width: columnWidth,
      isResizable: true,
      isReorderable: true,
    });
  }

  return columns;
}

export function generateAlphabetRows(columnCount, rowsCount) {
  let rows = [];
  for (let i = 0; i < rowsCount; i++) {
    let obj = {};
    for (let j = 0; j < columnCount; j++) {
      obj[ALPHABET[j % 26]] = ALPHABET[j % 26];
    }
    rows.push(obj);
  }

  return rows;
}
