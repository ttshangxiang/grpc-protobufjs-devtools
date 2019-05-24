import React from 'react';

class ReqList extends React.Component {

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.list !== this.props.list) {
      return true;
    }
    if (nextProps.current !== this.props.current) {
      return true;
    }
    return false;
  }
  getFileName (url) {
    const arr = url.split('/');
    return arr[arr.length - 1];
  }
  render () {
    return (
      <div className="ReqList">
        <table>
          <thead>
            <tr>
              <th style={{width: 240}}><div>Name</div></th>
              <th style={{width: 60}}><div>Status</div></th>
              <th><div>Url</div></th>
            </tr>
          </thead>
          <tbody>
          {this.props.list.map((item, index) => (
            <tr key={index} onClick={() => this.props.setCurrentReq(item)}
              className={item === this.props.current ? 'active' : ''}>
              <td title={item.request.url}>{this.getFileName(item.request.url)}</td>
              <td>{item.response.status}</td>
              <td title={item.request.url}>{item.request.url}</td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default ReqList;
