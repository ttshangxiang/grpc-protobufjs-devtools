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
              <th style={{width: 240}}><div className="name-wrap"><i className="icon icon-clear" onClick={this.props.clearList}></i>Name</div></th>
              <th style={{width: 60}}><div>Status</div></th>
              <th><div>Url</div></th>
            </tr>
          </thead>
        </table>
        <div className={this.props.current ? 'table-scroll table-scroll-petty' : 'table-scroll'}>
          <table>
            <tbody>
            {this.props.list.map((item, index) => (
              <tr key={index} onClick={() => this.props.setCurrentReq(item)}
                className={this.props.current && item._uid === this.props.current._uid ? 'active' : ''}>
                <td style={{width: 240}} title={item.request.url}>{this.getFileName(item.request.url)}</td>
                <td style={{width: 60}}>{item.response.status}</td>
                <td title={item.request.url}>{item.request.url}</td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default ReqList;
