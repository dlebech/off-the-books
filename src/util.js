import moment from 'moment';

/**
 * Given a list of transactions (an array of arrays), guess which column
 * correspond to date, descriptions, etc.
 * @param {Array} transactions - A list of transactions
 */
export const guessColumnSpec = transactions => {
  // Take the last transaction for now since there might be headers at the top.
  const transaction = transactions[transactions.length - 1];
  const columnSpec = transaction.map(t => ({ type: '' }));

  const hasColumnType = columnType => columnSpec.some(c => c.type === columnType);

  for (let i = 0; i < transaction.length; i++) {
    const val = transaction[i];
    // If the type is a string, use it as date or description.
    // If the type is a number, use as amount or total, depending on whether we
    // found one of these already.
    if (typeof val === 'string') {
      if (!hasColumnType('date') && moment(val).isValid()) columnSpec[i].type = 'date';
      else if (!hasColumnType('description')) columnSpec[i].type = 'description';
    } else if (typeof val === 'number') {
      if (!hasColumnType('amount')) columnSpec[i].type = 'amount';
      else columnSpec[i].type = 'total';
    }
  }

  return columnSpec;
};

/**
 * Search for the category with the given ID in the category list.
 * @param {Array} categories - A list of categories to search through
 * @param {String} categoryId - The ID of the category
 * @param {Boolean} [returnFallback] - Optionally return a fallback category, default is true
 */
export const findCategory = (categories, categoryId, returnFallback = true) => {
  const category = categories.find(c => c.id === categoryId);
  if (!category && returnFallback) return { name: 'Uncategorized' };
  return category;
};
