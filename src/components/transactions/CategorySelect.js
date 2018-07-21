import React from 'react';
import PropTypes from 'prop-types';
import Creatable from 'react-select/lib/Creatable';

/**
 * A select list for choosing a category.
 */
const CategorySelect = props => {
  const onChange = (option, action) => {
    if (action.action === 'select-option') {
      props.handleRowCategory(props.transactionId, option.value)
    }
  };

  const onCreateOption = name => {
    props.handleRowCategory(props.transactionId, null, name);
  };

  return (
    <Creatable
      className="category-select"
      value={props.selectedValue}
      options={props.options}
      onChange={onChange}
      autoFocus={props.focus}
      onCreateOption={onCreateOption}
    />
  );
};

CategorySelect.propTypes = {
  handleRowCategory: PropTypes.func.isRequired,
  transactionId: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired
  })).isRequired,
  focus: PropTypes.bool
};

CategorySelect.defaultProps = {
  focus: false
};

export default CategorySelect;
