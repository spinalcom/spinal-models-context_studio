"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Utilities = require("./Utilities");

const spinalCore = require("spinal-core-connectorjs");
const globalType = typeof window === "undefined" ? global : window;
let getViewer = function () {
  return globalType.v;
};

class SpinalRelation extends globalType.Model {
  constructor(_type, _nodeList1, _nodeList2, _isDirected, name = "SpinalRelation") {
    super();
    if (FileSystem._sig_server) {
      this.add_attr({
        id: _Utilities.Utilities.guid(this.constructor.name),
        type: _type,
        nodeList1: _nodeList1,
        nodeList2: _nodeList2,
        isDirected: _isDirected || false
      });
    }
  }

  getNodeList1() {
    return this.nodeList1;
  }

  getNodeList2() {
    return this.nodeList2;
  }
  getNodeList1Ids() {
    let t = [];
    for (let index = 0; index < this.nodeList1.length; index++) {
      const element = this.nodeList1[index];
      t.push(element.id.get());
    }
    return t;
  }

  getNodeList2Ids() {
    let t = [];
    for (let index = 0; index < this.nodeList2.length; index++) {
      const element = this.nodeList2[index];
      t.push(element.id.get());
    }
    return t;
  }

  getNodeList1List2Ids() {
    let t = [];
    for (let index = 0; index < this.nodeList1.length; index++) {
      const element = this.nodeList1[index];
      t.push(element.id.get());
    }
    for (let index = 0; index < this.nodeList2.length; index++) {
      const element = this.nodeList2[index];
      t.push(element.id.get());
    }
    return t;
  }

  addNotExistingNodetoNodeList1(_node) {
    if (!_Utilities.Utilities.containsLstById(this.nodeList1, _node)) this.nodeList1.push(_node);
  }

  addNodetoNodeList1(_node) {
    this.nodeList1.push(_node);
  }

  addNotExistingNodestoNodeList1(_nodes) {
    for (let index = 0; index < _nodes.length; index++) {
      const element = _nodes[index];
      this.addNotExistingNodetoNodeList1(element);
    }
  }

  addNodetoNodeList2(_node) {
    this.nodeList2.push(_node);
  }

  addNotExistingNodetoNodeList2(_node) {
    if (!_Utilities.Utilities.containsLstById(this.nodeList2, _node)) this.nodeList2.push(_node);
  }

  addNotExistingNodestoNodeList2(_nodes) {
    console.log(_nodes);

    for (let index = 0; index < _nodes.length; index++) {
      const element = _nodes[index];
      this.addNotExistingNodetoNodeList2(element);
    }
  }

  addNotExistingNodetoRelation(_relation) {
    other = [];
    for (let index = 0; index < _relation.nodeList1.length; index++) {
      const element = _relation.nodeList1[index];
      other.push(element);
    }
    for (let index = 0; index < _relation.nodeList2.length; index++) {
      const element = _relation.nodeList2[index];
      other.push(element);
    }

    me = [];
    for (let index = 0; index < this.nodeList1.length; index++) {
      const element = this.nodeList1[index];
      me.push(element);
    }
    for (let index = 0; index < this.nodeList2.length; index++) {
      const element = this.nodeList2[index];
      me.push(element);
    }
    for (let index = 0; index < other.length; index++) {
      const node = other[index];
      if (!_Utilities.Utilities.containsLstById(me, node)) this.nodeList2.push(node);
    }
  }

  toJson() {
    return {
      id: this.id.get(),
      type: this.type.get(),
      nodeList1: this.getNodeList1Ids(),
      nodeList2: this.getNodeList2Ids(),
      isDirected: this.isDirected.get()
    };
  }

  toIfc(element1Id, element2Id) {
    return this.type + '(' + this.id.get() + ',' + '$' + '$' + element1Id + ',' + element2Id + ');';
  }
}

exports.default = SpinalRelation;
spinalCore.register_models([SpinalRelation]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TcGluYWxSZWxhdGlvbi5qcyJdLCJuYW1lcyI6WyJzcGluYWxDb3JlIiwicmVxdWlyZSIsImdsb2JhbFR5cGUiLCJ3aW5kb3ciLCJnbG9iYWwiLCJnZXRWaWV3ZXIiLCJ2IiwiU3BpbmFsUmVsYXRpb24iLCJNb2RlbCIsImNvbnN0cnVjdG9yIiwiX3R5cGUiLCJfbm9kZUxpc3QxIiwiX25vZGVMaXN0MiIsIl9pc0RpcmVjdGVkIiwibmFtZSIsIkZpbGVTeXN0ZW0iLCJfc2lnX3NlcnZlciIsImFkZF9hdHRyIiwiaWQiLCJVdGlsaXRpZXMiLCJndWlkIiwidHlwZSIsIm5vZGVMaXN0MSIsIm5vZGVMaXN0MiIsImlzRGlyZWN0ZWQiLCJnZXROb2RlTGlzdDEiLCJnZXROb2RlTGlzdDIiLCJnZXROb2RlTGlzdDFJZHMiLCJ0IiwiaW5kZXgiLCJsZW5ndGgiLCJlbGVtZW50IiwicHVzaCIsImdldCIsImdldE5vZGVMaXN0MklkcyIsImdldE5vZGVMaXN0MUxpc3QySWRzIiwiYWRkTm90RXhpc3RpbmdOb2RldG9Ob2RlTGlzdDEiLCJfbm9kZSIsImNvbnRhaW5zTHN0QnlJZCIsImFkZE5vZGV0b05vZGVMaXN0MSIsImFkZE5vdEV4aXN0aW5nTm9kZXN0b05vZGVMaXN0MSIsIl9ub2RlcyIsImFkZE5vZGV0b05vZGVMaXN0MiIsImFkZE5vdEV4aXN0aW5nTm9kZXRvTm9kZUxpc3QyIiwiYWRkTm90RXhpc3RpbmdOb2Rlc3RvTm9kZUxpc3QyIiwiY29uc29sZSIsImxvZyIsImFkZE5vdEV4aXN0aW5nTm9kZXRvUmVsYXRpb24iLCJfcmVsYXRpb24iLCJvdGhlciIsIm1lIiwibm9kZSIsInRvSnNvbiIsInRvSWZjIiwiZWxlbWVudDFJZCIsImVsZW1lbnQySWQiLCJyZWdpc3Rlcl9tb2RlbHMiXSwibWFwcGluZ3MiOiI7Ozs7OztBQU1BOztBQU5BLE1BQU1BLGFBQWFDLFFBQVEseUJBQVIsQ0FBbkI7QUFDQSxNQUFNQyxhQUFhLE9BQU9DLE1BQVAsS0FBa0IsV0FBbEIsR0FBZ0NDLE1BQWhDLEdBQXlDRCxNQUE1RDtBQUNBLElBQUlFLFlBQVksWUFBVztBQUN6QixTQUFPSCxXQUFXSSxDQUFsQjtBQUNELENBRkQ7O0FBUWUsTUFBTUMsY0FBTixTQUE2QkwsV0FBV00sS0FBeEMsQ0FBOEM7QUFDM0RDLGNBQVlDLEtBQVosRUFBbUJDLFVBQW5CLEVBQStCQyxVQUEvQixFQUEyQ0MsV0FBM0MsRUFBd0RDLE9BQ3RELGdCQURGLEVBQ29CO0FBQ2xCO0FBQ0EsUUFBSUMsV0FBV0MsV0FBZixFQUE0QjtBQUMxQixXQUFLQyxRQUFMLENBQWM7QUFDWkMsWUFBSUMscUJBQVVDLElBQVYsQ0FBZSxLQUFLWCxXQUFMLENBQWlCSyxJQUFoQyxDQURRO0FBRVpPLGNBQU1YLEtBRk07QUFHWlksbUJBQVdYLFVBSEM7QUFJWlksbUJBQVdYLFVBSkM7QUFLWlksb0JBQVlYLGVBQWU7QUFMZixPQUFkO0FBT0Q7QUFDRjs7QUFFRFksaUJBQWU7QUFDYixXQUFPLEtBQUtILFNBQVo7QUFDRDs7QUFFREksaUJBQWU7QUFDYixXQUFPLEtBQUtILFNBQVo7QUFDRDtBQUNESSxvQkFBa0I7QUFDaEIsUUFBSUMsSUFBSSxFQUFSO0FBQ0EsU0FBSyxJQUFJQyxRQUFRLENBQWpCLEVBQW9CQSxRQUFRLEtBQUtQLFNBQUwsQ0FBZVEsTUFBM0MsRUFBbURELE9BQW5ELEVBQTREO0FBQzFELFlBQU1FLFVBQVUsS0FBS1QsU0FBTCxDQUFlTyxLQUFmLENBQWhCO0FBQ0FELFFBQUVJLElBQUYsQ0FBT0QsUUFBUWIsRUFBUixDQUFXZSxHQUFYLEVBQVA7QUFDRDtBQUNELFdBQU9MLENBQVA7QUFDRDs7QUFFRE0sb0JBQWtCO0FBQ2hCLFFBQUlOLElBQUksRUFBUjtBQUNBLFNBQUssSUFBSUMsUUFBUSxDQUFqQixFQUFvQkEsUUFBUSxLQUFLTixTQUFMLENBQWVPLE1BQTNDLEVBQW1ERCxPQUFuRCxFQUE0RDtBQUMxRCxZQUFNRSxVQUFVLEtBQUtSLFNBQUwsQ0FBZU0sS0FBZixDQUFoQjtBQUNBRCxRQUFFSSxJQUFGLENBQU9ELFFBQVFiLEVBQVIsQ0FBV2UsR0FBWCxFQUFQO0FBQ0Q7QUFDRCxXQUFPTCxDQUFQO0FBQ0Q7O0FBRURPLHlCQUF1QjtBQUNyQixRQUFJUCxJQUFJLEVBQVI7QUFDQSxTQUFLLElBQUlDLFFBQVEsQ0FBakIsRUFBb0JBLFFBQVEsS0FBS1AsU0FBTCxDQUFlUSxNQUEzQyxFQUFtREQsT0FBbkQsRUFBNEQ7QUFDMUQsWUFBTUUsVUFBVSxLQUFLVCxTQUFMLENBQWVPLEtBQWYsQ0FBaEI7QUFDQUQsUUFBRUksSUFBRixDQUFPRCxRQUFRYixFQUFSLENBQVdlLEdBQVgsRUFBUDtBQUNEO0FBQ0QsU0FBSyxJQUFJSixRQUFRLENBQWpCLEVBQW9CQSxRQUFRLEtBQUtOLFNBQUwsQ0FBZU8sTUFBM0MsRUFBbURELE9BQW5ELEVBQTREO0FBQzFELFlBQU1FLFVBQVUsS0FBS1IsU0FBTCxDQUFlTSxLQUFmLENBQWhCO0FBQ0FELFFBQUVJLElBQUYsQ0FBT0QsUUFBUWIsRUFBUixDQUFXZSxHQUFYLEVBQVA7QUFDRDtBQUNELFdBQU9MLENBQVA7QUFDRDs7QUFFRFEsZ0NBQThCQyxLQUE5QixFQUFxQztBQUNuQyxRQUFJLENBQUNsQixxQkFBVW1CLGVBQVYsQ0FBMEIsS0FBS2hCLFNBQS9CLEVBQTBDZSxLQUExQyxDQUFMLEVBQ0UsS0FBS2YsU0FBTCxDQUFlVSxJQUFmLENBQW9CSyxLQUFwQjtBQUNIOztBQUVERSxxQkFBbUJGLEtBQW5CLEVBQTBCO0FBQ3hCLFNBQUtmLFNBQUwsQ0FBZVUsSUFBZixDQUFvQkssS0FBcEI7QUFDRDs7QUFFREcsaUNBQStCQyxNQUEvQixFQUF1QztBQUNyQyxTQUFLLElBQUlaLFFBQVEsQ0FBakIsRUFBb0JBLFFBQVFZLE9BQU9YLE1BQW5DLEVBQTJDRCxPQUEzQyxFQUFvRDtBQUNsRCxZQUFNRSxVQUFVVSxPQUFPWixLQUFQLENBQWhCO0FBQ0EsV0FBS08sNkJBQUwsQ0FBbUNMLE9BQW5DO0FBQ0Q7QUFDRjs7QUFFRFcscUJBQW1CTCxLQUFuQixFQUEwQjtBQUN4QixTQUFLZCxTQUFMLENBQWVTLElBQWYsQ0FBb0JLLEtBQXBCO0FBQ0Q7O0FBRURNLGdDQUE4Qk4sS0FBOUIsRUFBcUM7QUFDbkMsUUFBSSxDQUFDbEIscUJBQVVtQixlQUFWLENBQTBCLEtBQUtmLFNBQS9CLEVBQTBDYyxLQUExQyxDQUFMLEVBQ0UsS0FBS2QsU0FBTCxDQUFlUyxJQUFmLENBQW9CSyxLQUFwQjtBQUNIOztBQUVETyxpQ0FBK0JILE1BQS9CLEVBQXVDO0FBQ3JDSSxZQUFRQyxHQUFSLENBQVlMLE1BQVo7O0FBRUEsU0FBSyxJQUFJWixRQUFRLENBQWpCLEVBQW9CQSxRQUFRWSxPQUFPWCxNQUFuQyxFQUEyQ0QsT0FBM0MsRUFBb0Q7QUFDbEQsWUFBTUUsVUFBVVUsT0FBT1osS0FBUCxDQUFoQjtBQUNBLFdBQUtjLDZCQUFMLENBQW1DWixPQUFuQztBQUNEO0FBQ0Y7O0FBRURnQiwrQkFBNkJDLFNBQTdCLEVBQXdDO0FBQ3RDQyxZQUFRLEVBQVI7QUFDQSxTQUFLLElBQUlwQixRQUFRLENBQWpCLEVBQW9CQSxRQUFRbUIsVUFBVTFCLFNBQVYsQ0FBb0JRLE1BQWhELEVBQXdERCxPQUF4RCxFQUFpRTtBQUMvRCxZQUFNRSxVQUFVaUIsVUFBVTFCLFNBQVYsQ0FBb0JPLEtBQXBCLENBQWhCO0FBQ0FvQixZQUFNakIsSUFBTixDQUFXRCxPQUFYO0FBQ0Q7QUFDRCxTQUFLLElBQUlGLFFBQVEsQ0FBakIsRUFBb0JBLFFBQVFtQixVQUFVekIsU0FBVixDQUFvQk8sTUFBaEQsRUFBd0RELE9BQXhELEVBQWlFO0FBQy9ELFlBQU1FLFVBQVVpQixVQUFVekIsU0FBVixDQUFvQk0sS0FBcEIsQ0FBaEI7QUFDQW9CLFlBQU1qQixJQUFOLENBQVdELE9BQVg7QUFDRDs7QUFFRG1CLFNBQUssRUFBTDtBQUNBLFNBQUssSUFBSXJCLFFBQVEsQ0FBakIsRUFBb0JBLFFBQVEsS0FBS1AsU0FBTCxDQUFlUSxNQUEzQyxFQUFtREQsT0FBbkQsRUFBNEQ7QUFDMUQsWUFBTUUsVUFBVSxLQUFLVCxTQUFMLENBQWVPLEtBQWYsQ0FBaEI7QUFDQXFCLFNBQUdsQixJQUFILENBQVFELE9BQVI7QUFDRDtBQUNELFNBQUssSUFBSUYsUUFBUSxDQUFqQixFQUFvQkEsUUFBUSxLQUFLTixTQUFMLENBQWVPLE1BQTNDLEVBQW1ERCxPQUFuRCxFQUE0RDtBQUMxRCxZQUFNRSxVQUFVLEtBQUtSLFNBQUwsQ0FBZU0sS0FBZixDQUFoQjtBQUNBcUIsU0FBR2xCLElBQUgsQ0FBUUQsT0FBUjtBQUNEO0FBQ0QsU0FBSyxJQUFJRixRQUFRLENBQWpCLEVBQW9CQSxRQUFRb0IsTUFBTW5CLE1BQWxDLEVBQTBDRCxPQUExQyxFQUFtRDtBQUNqRCxZQUFNc0IsT0FBT0YsTUFBTXBCLEtBQU4sQ0FBYjtBQUNBLFVBQUksQ0FBQ1YscUJBQVVtQixlQUFWLENBQTBCWSxFQUExQixFQUE4QkMsSUFBOUIsQ0FBTCxFQUNFLEtBQUs1QixTQUFMLENBQWVTLElBQWYsQ0FBb0JtQixJQUFwQjtBQUNIO0FBQ0Y7O0FBRURDLFdBQVM7QUFDUCxXQUFPO0FBQ0xsQyxVQUFJLEtBQUtBLEVBQUwsQ0FBUWUsR0FBUixFQURDO0FBRUxaLFlBQU0sS0FBS0EsSUFBTCxDQUFVWSxHQUFWLEVBRkQ7QUFHTFgsaUJBQVcsS0FBS0ssZUFBTCxFQUhOO0FBSUxKLGlCQUFXLEtBQUtXLGVBQUwsRUFKTjtBQUtMVixrQkFBWSxLQUFLQSxVQUFMLENBQWdCUyxHQUFoQjtBQUxQLEtBQVA7QUFPRDs7QUFFRG9CLFFBQU1DLFVBQU4sRUFBa0JDLFVBQWxCLEVBQThCO0FBQzVCLFdBQU8sS0FBS2xDLElBQUwsR0FBWSxHQUFaLEdBQWtCLEtBQUtILEVBQUwsQ0FBUWUsR0FBUixFQUFsQixHQUFrQyxHQUFsQyxHQUF3QyxHQUF4QyxHQUE4QyxHQUE5QyxHQUFvRHFCLFVBQXBELEdBQ0wsR0FESyxHQUNDQyxVQURELEdBQ2MsSUFEckI7QUFFRDtBQS9IMEQ7O2tCQUF4Q2hELGM7QUFrSXJCUCxXQUFXd0QsZUFBWCxDQUEyQixDQUFDakQsY0FBRCxDQUEzQiIsImZpbGUiOiJTcGluYWxSZWxhdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHNwaW5hbENvcmUgPSByZXF1aXJlKFwic3BpbmFsLWNvcmUtY29ubmVjdG9yanNcIik7XG5jb25zdCBnbG9iYWxUeXBlID0gdHlwZW9mIHdpbmRvdyA9PT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHdpbmRvdztcbmxldCBnZXRWaWV3ZXIgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGdsb2JhbFR5cGUudjtcbn07XG5cbmltcG9ydCB7XG4gIFV0aWxpdGllc1xufSBmcm9tIFwiLi9VdGlsaXRpZXNcIlxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTcGluYWxSZWxhdGlvbiBleHRlbmRzIGdsb2JhbFR5cGUuTW9kZWwge1xuICBjb25zdHJ1Y3RvcihfdHlwZSwgX25vZGVMaXN0MSwgX25vZGVMaXN0MiwgX2lzRGlyZWN0ZWQsIG5hbWUgPVxuICAgIFwiU3BpbmFsUmVsYXRpb25cIikge1xuICAgIHN1cGVyKCk7XG4gICAgaWYgKEZpbGVTeXN0ZW0uX3NpZ19zZXJ2ZXIpIHtcbiAgICAgIHRoaXMuYWRkX2F0dHIoe1xuICAgICAgICBpZDogVXRpbGl0aWVzLmd1aWQodGhpcy5jb25zdHJ1Y3Rvci5uYW1lKSxcbiAgICAgICAgdHlwZTogX3R5cGUsXG4gICAgICAgIG5vZGVMaXN0MTogX25vZGVMaXN0MSxcbiAgICAgICAgbm9kZUxpc3QyOiBfbm9kZUxpc3QyLFxuICAgICAgICBpc0RpcmVjdGVkOiBfaXNEaXJlY3RlZCB8fCBmYWxzZVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0Tm9kZUxpc3QxKCkge1xuICAgIHJldHVybiB0aGlzLm5vZGVMaXN0MTtcbiAgfVxuXG4gIGdldE5vZGVMaXN0MigpIHtcbiAgICByZXR1cm4gdGhpcy5ub2RlTGlzdDI7XG4gIH1cbiAgZ2V0Tm9kZUxpc3QxSWRzKCkge1xuICAgIGxldCB0ID0gW11cbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5ub2RlTGlzdDEubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5ub2RlTGlzdDFbaW5kZXhdO1xuICAgICAgdC5wdXNoKGVsZW1lbnQuaWQuZ2V0KCkpXG4gICAgfVxuICAgIHJldHVybiB0XG4gIH1cblxuICBnZXROb2RlTGlzdDJJZHMoKSB7XG4gICAgbGV0IHQgPSBbXVxuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLm5vZGVMaXN0Mi5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLm5vZGVMaXN0MltpbmRleF07XG4gICAgICB0LnB1c2goZWxlbWVudC5pZC5nZXQoKSlcbiAgICB9XG4gICAgcmV0dXJuIHRcbiAgfVxuXG4gIGdldE5vZGVMaXN0MUxpc3QySWRzKCkge1xuICAgIGxldCB0ID0gW11cbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5ub2RlTGlzdDEubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5ub2RlTGlzdDFbaW5kZXhdO1xuICAgICAgdC5wdXNoKGVsZW1lbnQuaWQuZ2V0KCkpXG4gICAgfVxuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLm5vZGVMaXN0Mi5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLm5vZGVMaXN0MltpbmRleF07XG4gICAgICB0LnB1c2goZWxlbWVudC5pZC5nZXQoKSlcbiAgICB9XG4gICAgcmV0dXJuIHRcbiAgfVxuXG4gIGFkZE5vdEV4aXN0aW5nTm9kZXRvTm9kZUxpc3QxKF9ub2RlKSB7XG4gICAgaWYgKCFVdGlsaXRpZXMuY29udGFpbnNMc3RCeUlkKHRoaXMubm9kZUxpc3QxLCBfbm9kZSkpXG4gICAgICB0aGlzLm5vZGVMaXN0MS5wdXNoKF9ub2RlKVxuICB9XG5cbiAgYWRkTm9kZXRvTm9kZUxpc3QxKF9ub2RlKSB7XG4gICAgdGhpcy5ub2RlTGlzdDEucHVzaChfbm9kZSlcbiAgfVxuXG4gIGFkZE5vdEV4aXN0aW5nTm9kZXN0b05vZGVMaXN0MShfbm9kZXMpIHtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX25vZGVzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgZWxlbWVudCA9IF9ub2Rlc1tpbmRleF07XG4gICAgICB0aGlzLmFkZE5vdEV4aXN0aW5nTm9kZXRvTm9kZUxpc3QxKGVsZW1lbnQpXG4gICAgfVxuICB9XG5cbiAgYWRkTm9kZXRvTm9kZUxpc3QyKF9ub2RlKSB7XG4gICAgdGhpcy5ub2RlTGlzdDIucHVzaChfbm9kZSlcbiAgfVxuXG4gIGFkZE5vdEV4aXN0aW5nTm9kZXRvTm9kZUxpc3QyKF9ub2RlKSB7XG4gICAgaWYgKCFVdGlsaXRpZXMuY29udGFpbnNMc3RCeUlkKHRoaXMubm9kZUxpc3QyLCBfbm9kZSkpXG4gICAgICB0aGlzLm5vZGVMaXN0Mi5wdXNoKF9ub2RlKVxuICB9XG5cbiAgYWRkTm90RXhpc3RpbmdOb2Rlc3RvTm9kZUxpc3QyKF9ub2Rlcykge1xuICAgIGNvbnNvbGUubG9nKF9ub2Rlcyk7XG5cbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX25vZGVzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgZWxlbWVudCA9IF9ub2Rlc1tpbmRleF07XG4gICAgICB0aGlzLmFkZE5vdEV4aXN0aW5nTm9kZXRvTm9kZUxpc3QyKGVsZW1lbnQpXG4gICAgfVxuICB9XG5cbiAgYWRkTm90RXhpc3RpbmdOb2RldG9SZWxhdGlvbihfcmVsYXRpb24pIHtcbiAgICBvdGhlciA9IFtdXG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IF9yZWxhdGlvbi5ub2RlTGlzdDEubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gX3JlbGF0aW9uLm5vZGVMaXN0MVtpbmRleF07XG4gICAgICBvdGhlci5wdXNoKGVsZW1lbnQpXG4gICAgfVxuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBfcmVsYXRpb24ubm9kZUxpc3QyLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgZWxlbWVudCA9IF9yZWxhdGlvbi5ub2RlTGlzdDJbaW5kZXhdO1xuICAgICAgb3RoZXIucHVzaChlbGVtZW50KVxuICAgIH1cblxuICAgIG1lID0gW11cbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5ub2RlTGlzdDEubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5ub2RlTGlzdDFbaW5kZXhdO1xuICAgICAgbWUucHVzaChlbGVtZW50KVxuICAgIH1cbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5ub2RlTGlzdDIubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5ub2RlTGlzdDJbaW5kZXhdO1xuICAgICAgbWUucHVzaChlbGVtZW50KVxuICAgIH1cbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgb3RoZXIubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCBub2RlID0gb3RoZXJbaW5kZXhdXG4gICAgICBpZiAoIVV0aWxpdGllcy5jb250YWluc0xzdEJ5SWQobWUsIG5vZGUpKVxuICAgICAgICB0aGlzLm5vZGVMaXN0Mi5wdXNoKG5vZGUpXG4gICAgfVxuICB9XG5cbiAgdG9Kc29uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpZDogdGhpcy5pZC5nZXQoKSxcbiAgICAgIHR5cGU6IHRoaXMudHlwZS5nZXQoKSxcbiAgICAgIG5vZGVMaXN0MTogdGhpcy5nZXROb2RlTGlzdDFJZHMoKSxcbiAgICAgIG5vZGVMaXN0MjogdGhpcy5nZXROb2RlTGlzdDJJZHMoKSxcbiAgICAgIGlzRGlyZWN0ZWQ6IHRoaXMuaXNEaXJlY3RlZC5nZXQoKVxuICAgIH1cbiAgfVxuXG4gIHRvSWZjKGVsZW1lbnQxSWQsIGVsZW1lbnQySWQpIHtcbiAgICByZXR1cm4gdGhpcy50eXBlICsgJygnICsgdGhpcy5pZC5nZXQoKSArICcsJyArICckJyArICckJyArIGVsZW1lbnQxSWQgK1xuICAgICAgJywnICsgZWxlbWVudDJJZCArICcpOydcbiAgfVxufVxuXG5zcGluYWxDb3JlLnJlZ2lzdGVyX21vZGVscyhbU3BpbmFsUmVsYXRpb25dKTsiXX0=