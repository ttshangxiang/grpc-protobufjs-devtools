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
    this.clearList = this.clearList.bind(this);

    window.__addReq = (req) => {
      let list = this.state.reqList;
      list = list.concat(req);
      this.setState({reqList: list});
    }
    window.__updateReq = (req) => {
      let list = this.state.reqList;
      let found = false;
      list.forEach((item, index) => {
        if (req._uid === item._uid) {
          list.splice(index, 1, req);
          found = true;
        }
      })
      if (!found) {
        list.push(req);
      }
      list = list.concat([]);
      this.setState({reqList: list});
    }
    window.__refresh = () => {
      this.clearList()
    }
  }

  setCurrentReq (req) {
    this.setState({currentReq: req});
  }

  clearList () {
    this.setState({reqList: [], currentReq: null});
  }

  render () {
    return (
      <div className="App">
        <ReqList list={this.state.reqList}
          current={this.state.currentReq}
          setCurrentReq={this.setCurrentReq}
          clearList={this.clearList} />
        <ReqDetail current={this.state.currentReq}
          setCurrentReq={this.setCurrentReq} />
      </div>
    );
  }
}

export default App;
