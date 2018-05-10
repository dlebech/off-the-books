import { combineReducers } from 'redux';
import { reducer as modalReducer } from 'redux-modal';
import update from 'immutability-helper';
import bayes from 'bayes';
import uuidv4 from 'uuid/v4';
import * as actions from './actions';
import * as util from './util';

const initialApp = {
  isParsing: false,
  storage: {
    localStorage: false
  }
};

const appReducer = (state = initialApp, action) => {
  switch (action.type) {
    case actions.PARSE_TRANSACTIONS_START:
      return update(state, {
        isParsing: { $set: true }
      });
    case actions.PARSE_TRANSACTIONS_END:
      return update(state, {
        isParsing: { $set: false }
      });
    case actions.TOGGLE_LOCAL_STORAGE:
      return update(state, {
        storage: {
          localStorage: {
            $set: action.enabled
          }
        }
      });
    case actions.RESTORE_STATE_FROM_FILE:
      if (!action.newState.app) return state;
      return update(state, {
        $set: action.newState.app
      });
    default:
      return state;
  }
};

const initialEditor = {
  transactionCategories: new Set()
};

const editReducer = (state = initialEditor, action) => {
  switch (action.type) {
    case actions.EDIT_CATEGORY_FOR_ROW:
      let rowsToAdd = action.rowId;
      if (!Array.isArray(rowsToAdd)) {
        rowsToAdd = [rowsToAdd];
      }
      return update(state, {
        transactionCategories: {
          $add: rowsToAdd
        }
      });
    case actions.GUESS_CATEGORY_FOR_ROW:
    case actions.CATEGORIZE_ROW:
      // Remove all editing categories when guessing and categorizing.
      return update(state, {
        transactionCategories: {
          $remove: Array.from(state.transactionCategories)
        }
      });
    default:
      return state;
  }
};

const initialTransactions = {
  import: {
    data: [],
    skipRows: 0,
    columnSpec: []
  },
  data: [],
  categorizer: {
    // XXX: We're using the string representation of the bayes classifier here in
    // order to avoid introducing another state system (the classifer). However,
    // this might not perform very well in the long run, so it's probably a
    // decision that should be re-considered.
    bayes: ''
  }
}

const mapImportToTransactions = transactionsImport => {
  const dateIndex = transactionsImport.columnSpec.findIndex(spec => spec.type === 'date');
  const descIndex = transactionsImport.columnSpec.findIndex(spec => spec.type === 'description');
  const amountIndex = transactionsImport.columnSpec.findIndex(spec => spec.type === 'amount');
  const totalIndex = transactionsImport.columnSpec.findIndex(spec => spec.type === 'total');

  return transactionsImport.data
    .slice(transactionsImport.skipRows)
    .map(transaction => {
      return {
        id: uuidv4(),
        date: transaction[dateIndex],
        description: transaction[descIndex],
        amount: transaction[amountIndex],
        total: transaction[totalIndex],
        category: {
          guess: '',
          confirmed: ''
        }
      };
    });
};

const transactionReducer = (state = initialTransactions, action) => {
  switch (action.type) {
    case actions.PARSE_TRANSACTIONS_END:
      return update(state, {
        import: {
          data: { $set: action.transactions },
          columnSpec: { $set: util.guessColumnSpec(action.transactions) }
        }
      });
    case actions.UPDATE_SKIP_ROWS:
      return update(state, {
        import: {
          skipRows: { $set: action.skipRows }
        }
      });
    case actions.UPDATE_COLUMN_TYPE:
      return update(state, {
        import: {
          columnSpec: {
            [action.columnIndex]: {
              type: {
                $set: action.columnType
              }
            }
          }
        }
      });
    case actions.CANCEL_TRANSACTIONS:
      return update(state, {
        import: {
          $set: initialTransactions.import
        }
      });
    case actions.SAVE_TRANSACTIONS:
      return update(state, {
        import: {
          $set: initialTransactions.import
        },
        data: {
          $set: mapImportToTransactions(state.import)
        }
      });
    case actions.GUESS_CATEGORY_FOR_ROW:
      let rowsToGuess = action.rowId;
      if (!Array.isArray(rowsToGuess)) {
        rowsToGuess = [rowsToGuess];
      }
      const rowIndexes = rowsToGuess
        .map(rowId => state.data.findIndex(row => row.id === rowId))
        .filter(rowIndex => rowIndex >= 0);
      if (rowIndexes.length === 0) return state;
      if (!state.categorizer.bayes) return state;

      const guesstimator = bayes.fromJson(state.categorizer.bayes);

      let newState = state;
      rowIndexes.forEach(i => {
        const guess = guesstimator.categorize(newState.data[i].description);
        console.log(i, guess);
        newState = update(newState, {
          data: {
            [i]: {
              category: {
                guess: {
                  $set: guess
                }
              }
            }
          }
        });
      });
      return newState;
    case actions.CATEGORIZE_ROW:
      const rowIndexCategorize = state.data.findIndex(row => row.id === action.rowId);
      if (rowIndexCategorize < 0) return state;
      // If there's currently no bayes classifier, create a new one.
      const classifier = state.categorizer.bayes ?
        bayes.fromJson(state.categorizer.bayes) :
        bayes();
      if (action.category && state.data[rowIndexCategorize].description) {
        classifier.learn(state.data[rowIndexCategorize].description, action.category);
      }
      return update(state, {
        categorizer: {
          bayes: {
            $set: classifier.toJson()
          }
        },
        data: {
          [rowIndexCategorize]: {
            category: {
              confirmed: {
                $set: action.category
              },
              $unset: ['guess']
            }
          }
        }
      });
    case actions.RESTORE_STATE_FROM_FILE:
      if (!action.newState.transactions) return state;
      return update(state, {
        $set: action.newState.transactions
      });
    default:
      return state;
  }
};

export default combineReducers({
  app: appReducer,
  transactions: transactionReducer,
  modal: modalReducer,
  edit: editReducer
});
