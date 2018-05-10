import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import RestoreData from './RestoreData';

const IntroWithData = props => {
  return (
    <div className="jumbotron">
      <h1 className="display-4">Welcome back!</h1>
      <p className="lead">
        You have {props.numTransactions} transactions so far.
      </p>
      <hr />
      <Link className="btn btn-primary" to="/transaction/upload">
        <FontAwesomeIcon icon="upload" className="mr-1" fixedWidth />
        Upload more transactions
      </Link>
      <Link className="btn btn-secondary mx-2" to="/transaction">
        <FontAwesomeIcon icon="table" className="mr-1" fixedWidth />
        Existing transactions
      </Link>
      <Link className="btn btn-secondary" to="/chart">
        <FontAwesomeIcon icon="chart-bar" className="mr-1" fixedWidth />
        Charts
      </Link>
    </div>
  );
};

const IntroWithoutData = () => {
  return (
    <div className="jumbotron">
      <h1 className="display-4">Off The Books</h1>
      <p className="lead">Privacy-First Bank Transaction Analysis</p>
      <hr />
      <p>
        Catchy headline eh? But seriously, if you have a list of bank
        transactions, and you want to see some pretty graphs, go ahead and
        upload the file here. The data stays in your browser and is not
        shared or stored anywhere else.
      </p>
      <Link className="btn btn-primary btn-lg" to="/transaction/upload">Get Started</Link>
      <RestoreData className="btn btn-secondary btn-lg ml-3">
        Restore Data from File
        <FontAwesomeIcon
          icon="question-circle"
          className="ml-1"
          fixedWidth
          data-tip="If you have been here before, you can restore a previously downloaded data file and continue your work."
          onClick={e => {
            e.stopPropagation();
            return false;
          }}
        />
      </RestoreData>
      <ReactTooltip className="small-tip" />
    </div>
  );
};

const Intro = props => {
  if (props.numTransactions > 0) return <IntroWithData {...props} />;
  return <IntroWithoutData />;
};

const mapStateToProps = state => {
  return {
    numTransactions: state.transactions.data.length
  }
};

export default connect(mapStateToProps)(Intro);
