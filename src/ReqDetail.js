import React from 'react';

import { ObjectRootLabel, ObjectLabel, ObjectInspector, TableInspector } from 'react-inspector'

const defaultNodeRenderer = ({ depth, name, data, isNonenumerable, expanded }) =>
  depth === 0
    ? <ObjectRootLabel name={name} data={data} />
    : <ObjectLabel name={name} data={data} isNonenumerable={isNonenumerable} />;

class ReqDetail extends React.Component {
  constructor (props) {
    super(props)
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.current !== this.props.current) {
      return true;
    }
    return false;
  }
  render () {
    const ctx = this.props.current;
    if (!ctx) {
      return (<div></div>)
    }
    ctx.request.headersObj = {};
    ctx.request.headers.forEach(item => {
      ctx.request.headersObj[item.name] = item.value;
    })
    ctx.response.headersObj = {};
    ctx.response.headers.forEach(item => {
      ctx.response.headersObj[item.name] = item.value;
    })
    return (
      <div className="ReqDetail">
        <div className="tabList">
          <span className="detail-close" onClick={() => this.props.setCurrentReq(null)}>x</span>
          <span>details</span>
        </div>
        <div className="details-body">
          <div className="detail-label">Request Url:</div>
          <ObjectInspector data={ctx.request.url} nodeRenderer={defaultNodeRenderer} />
          <div className="detail-label">Request Body:</div>
          <ObjectInspector data={ctx.requestBody || null} nodeRenderer={defaultNodeRenderer} expandLevel={1} />
          <div className="detail-label">Response Body:</div>
          <ObjectInspector data={ctx.responseBody || null} nodeRenderer={defaultNodeRenderer} expandLevel={1}/>
          <div className="detail-label">Request: </div>
          <ObjectInspector data={ctx.request} nodeRenderer={defaultNodeRenderer} />
          <div className="detail-label">Response: </div>
          <ObjectInspector data={ctx.response} nodeRenderer={defaultNodeRenderer} />
          <div className="detail-label">All:</div>
          <ObjectInspector data={ctx} nodeRenderer={defaultNodeRenderer} />
        </div>
      </div>
    );
  }
}

export default ReqDetail;
