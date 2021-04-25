import update from 'immutability-helper';
import { v4 as uuidv4 } from 'uuid';
import * as actions from '../actions';
import { defaultAccount } from '../data/accounts';

const initialAccounts = {
  data: [defaultAccount]
};

const accountsReducer = (state = initialAccounts, action) => {
  switch (action.type) {
    case actions.ADD_ACCOUNT:
      return update(state, {
        data: {
          $push: [{
            id: uuidv4(),
            name: action.name
          }]
        }
      });
    case actions.UPDATE_ACCOUNT:
      const indexToUpdate = state.data.findIndex(c => c.id === action.accountId);
      if (indexToUpdate < 0) return state;
      return update(state, {
        data: {
          [indexToUpdate]: {
            name: {
              $set: action.name
            },
            currency: {
              $set: action.currency
            }
          }
        }
      });
    case actions.DELETE_ACCOUNT:
      const indexToDelete = state.data.findIndex(c => c.id === action.accountId);
      if (indexToDelete < 0) return state;
      return update(state, {
        data: {
          $splice: [[indexToDelete, 1]]
        }
      });
    case actions.RESTORE_STATE_FROM_FILE:
      if (!action.newState.accounts) return state;
      return update(state, {
        $set: action.newState.accounts
      });
    default:
      return state;
  }
};

export default accountsReducer;