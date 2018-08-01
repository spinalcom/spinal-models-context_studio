const spinalCore = require("spinal-core-connectorjs");
const globalType = typeof window === "undefined" ? global : window;
let getViewer = function() {
  return globalType.v;
};

import { Utilities } from "./Utilities";

export default class SpinalRelation extends globalType.Model {
  constructor(
    type,
    nodeList1,
    nodeList2,
    isDirected,
    // _name = "",
    name = "SpinalRelation"
  ) {
    super();
    if (FileSystem._sig_server) {
      this.add_attr({
        id: Utilities.guid(this.constructor.name),
        type: type,
        nodeList1: nodeList1,
        nodeList2: nodeList2,
        isDirected: isDirected || false
        // name: _name
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
    if (!Utilities.containsLstById(this.nodeList1, _node))
      this.nodeList1.push(_node);
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
    if (!Utilities.containsLstById(this.nodeList2, _node))
      this.nodeList2.push(_node);
  }

  addNotExistingNodestoNodeList2(_nodes) {
    console.log(_nodes);

    for (let index = 0; index < _nodes.length; index++) {
      const element = _nodes[index];
      this.addNotExistingNodetoNodeList2(element);
    }
  }

  addNotExistingNodetoRelation(_relation) {
    let other = [];
    for (let index = 0; index < _relation.nodeList1.length; index++) {
      const element = _relation.nodeList1[index];
      other.push(element);
    }
    for (let index = 0; index < _relation.nodeList2.length; index++) {
      const element = _relation.nodeList2[index];
      other.push(element);
    }

    let me = [];
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
      if (!Utilities.containsLstById(me, node)) this.nodeList2.push(node);
    }
  }

  removeFromNodeList2(node) {
    for (let index = 0; index < this.nodeList2.length; index++) {
      const candidateNode = this.nodeList2[index];
      if (node.id.get() === candidateNode.id.get()) {
        this.nodeList2.splice(index, 1);
        return;
      }
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
    return (
      this.type +
      "(" +
      this.id.get() +
      "," +
      "$" +
      "$" +
      element1Id +
      "," +
      element2Id +
      ");"
    );
  }
}

spinalCore.register_models([SpinalRelation]);
