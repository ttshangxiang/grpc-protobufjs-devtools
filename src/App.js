import React from 'react';
import ReqList from './ReqList';
import ReqDetail from './ReqDetail';
import './App.css';

class App extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      reqList: [],
      currentReq: null
    }
    this.setCurrentReq = this.setCurrentReq.bind(this);
  }

  setCurrentReq (req) {
    this.setState({currentReq: req});
  }

  componentDidMount () {
    window.__addReq = (req) => {
      let list = this.state.reqList;
      list = list.concat(req);
      this.setState({reqList: list});
    }
    window.__updateReq = (req) => {
      let list = this.state.reqList;
      list.forEach((item, index) => {
        if (req.startedDateTime === item.startedDateTime
          && req.request.url === item.request.url) {
          list.splice(index, 1, req);
        }
      })
      list = list.concat([]);
      this.setState({reqList: list});
    }
  }

  render () {
    return (
      <div className="App">
        <ReqList list={this.state.reqList}
          current={this.state.currentReq}
          setCurrentReq={this.setCurrentReq} />
        <ReqDetail current={this.state.currentReq}
          setCurrentReq={this.setCurrentReq} />
      </div>
    );
  }
}

export default App;
