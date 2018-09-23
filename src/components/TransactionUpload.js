import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import * as actions from '../actions';
import UploadForm from './transactionUpload/UploadForm';
import PreviewTable from './transactionUpload/PreviewTable';

class TransactionUpload extends React.Component {
  constructor(props) {
    super(props);

    this.handleSave = this.handleSave.bind(this);

    this.state = { errors: [] };
  }

  handleSave() {
    // TODO: add validation
    this.props.handleSave();
    this.props.history.push('/transactions');
  }

  render() {
    return (
      <React.Fragment>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/transactions">Transactions</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Upload</li>
          </ol>
        </nav>
        <UploadForm
          handleFileChange={this.props.handleFileChange}
          handleSkipRowsChange={this.props.handleSkipRowsChange}
          handleSave={this.handleSave}
          handleCancel={this.props.handleCancel}
          hasTransactions={!!this.props.transactions && this.props.transactions.length > 0}
          skipRows={this.props.skipRows}
        />
        <PreviewTable
          transactions={this.props.transactions}
          skipRows={this.props.skipRows}
          columnSpec={this.props.columnSpec}
          handleColumnTypeChange={this.props.handleColumnTypeChange}
        />
      </React.Fragment>
    );
  }
}

TransactionUpload.propTypes = {
  transactions: PropTypes.arrayOf(PropTypes.array).isRequired,
  skipRows: PropTypes.number.isRequired,
  columnSpec: PropTypes.arrayOf(PropTypes.object),
  handleFileChange: PropTypes.func.isRequired,
  handleSkipRowsChange: PropTypes.func.isRequired,
  handleSave: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleColumnTypeChange: PropTypes.func.isRequired
}

const mapStateToProps = state => {
  return {
    transactions: state.transactions.import.data,
    skipRows: state.transactions.import.skipRows,
    columnSpec: state.transactions.import.columnSpec
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleFileChange: async e => {
      // File needs to be extracted here, because it is unavailable after the
      // dynamic import below for some reason.
      const file = e.target.files[0];

      dispatch(actions.parseTransactionsStart());

      const Papa = await import('papaparse');
      Papa.parse(file, {
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: results => dispatch(actions.parseTransactionsEnd(results.errors, results.data))
      });
    },
    handleSkipRowsChange: e => {
      dispatch(actions.updateSkipRows(Number(e.target.value)))
    },
    handleColumnTypeChange: (columnIndex, columnType) => {
      dispatch(actions.updateColumnType(columnIndex, columnType));
    },
    handleSave: () => {
      dispatch(actions.saveTransactions());
    },
    handleCancel: () => {
      dispatch(actions.cancelTransactions());
    }
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(TransactionUpload)
);