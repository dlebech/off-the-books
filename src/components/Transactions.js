import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { show, hide } from 'redux-modal';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import ReactTooltip from 'react-tooltip';
import * as actions from '../actions';
import Confirm from './modals/Confirm';
import NoData from './NoData';
import TransactionTable from './transactions/TransactionTable';

const Transactions = props => {
  if (props.transactions.length === 0) return <NoData />;

  return (
    <React.Fragment>
      <div className="row">
        <div className="col">
          <Link to="/transaction/upload" className="btn btn-outline-primary">
            <FontAwesomeIcon icon="upload" className="mr-1" fixedWidth />
            Add More Transactions
          </Link>
          <button
            className="btn btn-outline-secondary ml-2"
            onClick={() => {
              const unconfirmedIds = props.transactions
                .filter(t => !t.category.confirmed)
                .map(t => t.id);
              props.handleGuessCategoryForRow(unconfirmedIds);
            }}
          >
            <FontAwesomeIcon icon="lightbulb" className="mr-1" fixedWidth />
            Guess missing categories
          </button>
        </div>
      </div>
      <TransactionTable
        transactions={props.transactions}
        categories={props.categories}
        handleRowCategory={props.handleRowCategory}
        handleEditCategoryForRow={props.handleEditCategoryForRow}
        handleDeleteRow={props.handleDeleteRow}
        handleIgnoreRow={props.handleIgnoreRow}
        showModal={props.showModal}
        hideModal={props.hideModal}
      />
      <Confirm />
      <ReactTooltip />
    </React.Fragment>
  );
};

Transactions.propTypes = {
  transactions: PropTypes.arrayOf(PropTypes.object).isRequired,
  categories: PropTypes.arrayOf(PropTypes.object).isRequired
}

const mapStateToProps = state => {
  const transactions = state.transactions.data.map(t => {
    return Object.assign({
      editingCategory: state.edit.transactionCategories.has(t.id)
    }, t);
  })
  return {
    transactions,
    categories: state.categories.data
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleRowCategory: (rowId, category) => {
      dispatch(actions.categorizeRow(rowId, category));
    },
    handleGuessCategoryForRow: rowId => {
      dispatch(actions.guessCategoryForRow(rowId));
    },
    handleEditCategoryForRow: rowId => {
      dispatch(actions.editCategoryForRow(rowId));
    },
    handleDeleteRow: rowId => {
      dispatch(actions.deleteRow(rowId));
    },
    handleIgnoreRow: (rowId, ignore) => {
      dispatch(actions.ignoreRow(rowId, ignore));
    },
    showModal: (...args) => {
      dispatch(show(...args));
    },
    hideModal: (...args) => {
      dispatch(hide(...args));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Transactions)