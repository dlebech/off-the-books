import update from 'immutability-helper';
import { v4 as uuidv4 } from 'uuid';
import * as actions from '../actions';
import defaultCategories from '../data/categories';

const initialCategories = {
  data: [].concat(defaultCategories).sort((a, b) => a.name.localeCompare(b.name))
};

const categoriesReducer = (state = initialCategories, action) => {
  switch (action.type) {
    case actions.ADD_CATEGORY:
      return update(state, {
        data: {
          $push: [{
            id: uuidv4(),
            name: action.name,
            parent: action.parentId
          }]
        }
      });
    case actions.UPDATE_CATEGORY:
      const indexToUpdate = state.data.findIndex(c => c.id === action.categoryId);
      if (indexToUpdate < 0) return state;
      return update(state, {
        data: {
          [indexToUpdate]: {
            name: {
              $set: action.name
            },
            parent: {
              $set: action.parentId || ''
            }
          }
        }
      });
    case actions.DELETE_CATEGORY_START:
      const indexToDelete = state.data.findIndex(c => c.id === action.categoryId);
      if (indexToDelete < 0) return state;
      return update(state, {
        data: {
          $splice: [[indexToDelete, 1]]
        }
      });
    case actions.RESTORE_STATE_FROM_FILE:
      if (!action.newState.categories) return state;
      return update(state, {
        $set: action.newState.categories
      });
    default:
      return state;
  }
};

export default categoriesReducer;
