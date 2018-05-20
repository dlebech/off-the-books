import reducers from './index';
import * as actions from '../actions';

jest.mock('uuid/v4', () => {
  return jest.fn().mockReturnValue('abcd');
});

it('should add a new category', () => {
  const state = reducers({}, actions.addCategory('Lodging', ''));

  expect(state.categories.data).toContainEqual({
    id: 'abcd',
    name: 'Lodging',
    parent: ''
  });
});

it('should change the name of a category', () => {
  const state = reducers({}, actions.updateCategory('abcd', 'New Name', 'efgh'));
  expect(state.categories.data).toContainEqual({
    id: 'abcd',
    name: 'New Name',
    parent: 'efgh'
  });
});

it('should not update the name for an unknon a category ID', () => {
  const state = reducers({}, actions.updateCategory('doesnotexist', 'New Name'));
  expect(state.categories.data).not.toContainEqual({
    id: 'abcd',
    name: 'New Name',
    parent: ''
  });
});

it('should update the parent of a category', () => {
  const state = reducers({}, actions.setParentCategory('abcd', 'efgh'));
  expect(state.categories.data).toContainEqual({
    id: 'abcd',
    name: 'Food',
    parent: 'efgh'
  });
});

it('should delete a category', () => {
  const state = reducers({}, actions.deleteCategory('abcd'));
  // They all have the same ID in these tests, but it will delete the first one,
  // which is food currently.
  expect(state.categories.data).not.toContainEqual({
    id: 'abcd',
    name: 'Food',
  });
  expect(state.categories.data).toContainEqual({
    id: 'abcd',
    name: 'Travel',
  });
});
