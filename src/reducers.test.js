import bayes from 'bayes';
import reducers from './reducers';
import * as actions from './actions';

jest.mock('uuid/v4', () => {
  return jest.fn(() => 'abcd');
});

it('should set default data', () => {
  const state = reducers({}, { type: 'NOOP' });
  expect(state.app).toEqual({
    isParsing: false,
    storage: {
      localStorage: false 
    },
  });

  expect(state.transactions).toEqual({
    data: [],
    import: {
      data: [],
      skipRows: 0,
      columnSpec: []
    },
    categorizer: {
      bayes: ''
    }
  });
});

it('should handle the parsing start action', () => {
  expect(reducers({}, actions.parseTransactionsStart()).app.isParsing).toEqual(true);
});

it('should handle the toggle persist action', () => {
  expect(reducers({}, actions.toggleLocalStorage(true)).app.storage).toEqual({
    localStorage: true
  });

  expect(reducers({}, actions.toggleLocalStorage(false)).app.storage).toEqual({
    localStorage: false
  });
});

describe('import', () => {
  describe('transaction end', () => {
    it('should store transactions and guess column indexes', () => {
      const state = reducers({ app: { isParsing: true } }, actions.parseTransactionsEnd(null, [['2018-04-06', 'test row', 123, 456]]));
      expect(state.app.isParsing).toEqual(false);
      expect(state.transactions.import).toEqual({
        data: [['2018-04-06', 'test row', 123, 456]],
        skipRows: 0,
        columnSpec: [
          { type: 'date' },
          { type: 'description' },
          { type: 'amount' },
          { type: 'total' }
        ]
      });
    });

    it('should handle columns in different positions', () => {
      const state = reducers({ app: { isParsing: true } }, actions.parseTransactionsEnd(null, [[123, 'test row', 456, '2018-04-06']]));
      expect(state.transactions.import).toEqual({
        data: [[123, 'test row', 456, '2018-04-06']],
        skipRows: 0,
        columnSpec: [
          { type: 'amount' },
          { type: 'description' },
          { type: 'total' },
          { type: 'date' }
        ]
      });
    });
  });

  it('should handle skip rows action', () => {
    const state = reducers({}, actions.updateSkipRows(123));
    expect(state.transactions.import.skipRows).toEqual(123);
  });

  it('should handle column type updates', () => {
    const state = reducers({
      transactions: {
        import: {
          data: [],
          skipRows: 0,
          columnSpec: [{ type: '' }, { type: '' }]
        }
      }
    }, actions.updateColumnType(1, 'description'));

    expect(state.transactions.import).toEqual({
      data: [],
      skipRows: 0,
      columnSpec: [{ type: '' }, { type: 'description' }]
    });
  });

  it('should handle cancel transaction action', () => {
    const state = reducers({
      transactions: {
        import: {
          data: [[0, 1]],
          skipRows: 0,
          columnSpec: [{ type: '' }, { type: '' }]
        }
      }
    }, actions.cancelTransactions());

    expect(state.transactions.import).toEqual({
      data: [],
      skipRows: 0,
      columnSpec: []
    });
  });

  it('should handle save transaction action', () => {
    const state = reducers({
      transactions: {
        import: {
          data: [
            ['some', 'header', 'annoying', 'i know'],
            ['2018-04-06', 'test row', 123, 456]
          ],
          skipRows: 1,
          columnSpec: [
            { type: 'date' },
            { type: 'description' },
            { type: 'amount' },
            { type: 'total' }
          ]
        }
      }
    }, actions.saveTransactions());

    // Sets the data
    expect(state.transactions.data).toEqual([
      {
        id: 'abcd',
        date: '2018-04-06',
        description: 'test row',
        amount: 123,
        total: 456,
        category: {
          guess: '',
          confirmed: ''
        }
      }
    ]);

    // Resets the import
    expect(state.transactions.import).toEqual({
      data: [],
      skipRows: 0,
      columnSpec: []
    });
  });
});

describe('guess category', () => {
  it('should guess the category of a single row', () => {
    const state = reducers({
      transactions: {
        categorizer: {
          // A bayes classifier, trained on apple and origami
          bayes: '{"categories":{"hobby":true,"food":true},"docCount":{"hobby":1,"food":1},"totalDocuments":2,"vocabulary":{"origami":true,"apple":true},"vocabularySize":2,"wordCount":{"hobby":1,"food":1},"wordFrequencyCount":{"hobby":{"origami":1},"food":{"apple":1}},"options":{}}'
        },
        data: [
          {
            id: 'abcd',
            date: '2018-04-06',
            description: 'more origami',
            amount: 123,
            total: 456,
            category: {
              guess: '',
              confirmed: ''
            }
          }
        ]
      }
    }, actions.guessCategoryForRow('abcd'));

    // Sets the data
    expect(state.transactions.data[0].category).toEqual({
      guess: 'hobby',
      confirmed: ''
    });
  });

  it('should guess the category of a multiple rows', () => {
    const state = reducers({
      transactions: {
        categorizer: {
          // A bayes classifier, trained on apple and origami
          bayes: '{"categories":{"hobby":true,"food":true},"docCount":{"hobby":1,"food":1},"totalDocuments":2,"vocabulary":{"origami":true,"apple":true},"vocabularySize":2,"wordCount":{"hobby":1,"food":1},"wordFrequencyCount":{"hobby":{"origami":1},"food":{"apple":1}},"options":{}}'
        },
        data: [
          {
            id: 'a',
            description: 'more origami',
            category: {}
          },
          {
            id: 'b',
            description: 'more origami yet',
            category: {}
          },
          {
            id: 'c',
            description: 'so much origami',
            category: {}
          }
        ]
      }
    }, actions.guessCategoryForRow(['a', 'b', 'ok']));

    // Sets the data
    expect(state.transactions.data[0].category).toEqual({
      guess: 'hobby'
    });
    expect(state.transactions.data[1].category).toEqual({
      guess: 'hobby'
    });
    expect(state.transactions.data[2].category).toEqual({});
  });

  it('should add a confirmed category to the classifier', () => {
    const state = reducers({
      transactions: {
        categorizer: {
          bayes: ''
        },
        data: [
          {
            id: 'abcd',
            date: '2018-04-06',
            description: 'origami',
            amount: 123,
            total: 456,
            category: {
              guess: 'travel',
              confirmed: ''
            }
          }
        ]
      }
    }, actions.categorizeRow('abcd', 'hobby'));

    expect(state.transactions.categorizer.bayes).toEqual(
      // Expecting it to be trained on one row now :-)
      '{"categories":{"hobby":true},"docCount":{"hobby":1},"totalDocuments":1,"vocabulary":{"origami":true},"vocabularySize":1,"wordCount":{"hobby":1},"wordFrequencyCount":{"hobby":{"origami":1}},"options":{}}'
    );

    // Sets the data
    expect(state.transactions.data[0].category).toEqual({
      confirmed: 'hobby'
    });
  });

  it('should not add empty categories to classifier', () => {
    const state = reducers({
      transactions: {
        categorizer: {
          bayes: ''
        },
        data: [
          {
            id: 'abcd',
            description: 'origami',
            category: {
              guess: 'travel',
              confirmed: ''
            }
          }
        ]
      }
    }, actions.categorizeRow('abcd', ''));

    // Expect and empty classifier because the category is empty.
    expect(state.transactions.categorizer.bayes).toEqual(
      '{"categories":{},"docCount":{},"totalDocuments":0,"vocabulary":{},"vocabularySize":0,"wordCount":{},"wordFrequencyCount":{},"options":{}}'
    );
  });

  it('should not add empty descriptions to classifier', () => {
    const state = reducers({
      transactions: {
        categorizer: {
          bayes: ''
        },
        data: [
          {
            id: 'abcd',
            description: '',
            category: {
              guess: 'travel',
              confirmed: ''
            }
          }
        ]
      }
    }, actions.categorizeRow('abcd', 'hobby'));

    // Expect and empty classifier because the category is empty.
    expect(state.transactions.categorizer.bayes).toEqual(
      '{"categories":{},"docCount":{},"totalDocuments":0,"vocabulary":{},"vocabularySize":0,"wordCount":{},"wordFrequencyCount":{},"options":{}}'
    );
  });
});

describe('restore from file', () => {
  it('should restore from file', () => {
    const state = reducers({}, actions.restoreStateFromFile({
      transactions: {
        data: [{ id: 'abcd' }]
      }
    }));

    expect(state.transactions.data).toEqual([
      { id: 'abcd' }
    ])
  });
});


it('should add categories being edited', () => {
  const state = reducers({}, actions.editCategoryForRow('a'));
  expect(state.edit.transactionCategories.has('a')).toBeTruthy();
  expect(state.edit.transactionCategories.has('b')).toBeFalsy();
});

it('should clear categories being edited', () => {
  const state = reducers({
    edit: {
      transactionCategories: new Set(['a', 'b'])
    }
  }, actions.guessCategoryForRow('b'));

  expect(state.edit.transactionCategories.size).toEqual(0);
});
