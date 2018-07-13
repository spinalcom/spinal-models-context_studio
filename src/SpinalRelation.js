const spinalCore = require("spinal-core-connectorjs");
const globalType = typeof window === "undefined" ? global : window;
let getViewer = function() {
  return globalType.v;
};

import {
  Utilities
} from "./Utilities"

export default class SpinalRelation extends globalType.Model {
  constructor(_type, _vertexList1, _vertexList2, _isDirected) {
    super();
    if (FileSystem._sig_server) {
      this.add_attr({
        id: this.guid(),
        type: _type,
        vertexList1: _vertexList1,
        vertexList2: _vertexList2,
        isDirected: _isDirected || false
      });
    }
  }

  guid() {
    return (
      this.constructor.name +
      "-" +
      this.s4() +
      this.s4() +
      "-" +
      this.s4() +
      "-" +
      this.s4() +
      "-" +
      this.s4() +
      "-" +
      this.s4() +
      this.s4() +
      this.s4() +
      "-" +
      Date.now().toString(16)
    );
  }

  s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  getVertexList1Ids() {
    let t = []
    for (let index = 0; index < this.vertexList1.length; index++) {
      const element = this.vertexList1[index];
      t.push(element.id.get())
    }
    return t
  }

  getVertexList1List2Ids() {
    let t = []
    for (let index = 0; index < this.vertexList1.length; index++) {
      const element = this.vertexList1[index];
      t.push(element.id.get())
    }
    for (let index = 0; index < this.vertexList2.length; index++) {
      const element = this.vertexList2[index];
      t.push(element.id.get())
    }
    return t
  }

  addNotExistingVertextoVertexList1(_vertex) {
    if (!Utilities.contains(this.vertexList1, _vertex))
      this.vertexList1.push(_vertex)
  }

  addNotExistingVerticestoVertexList1(_vertices) {
    for (let index = 0; index < _vertices.length; index++) {
      const element = _vertices[index];
      this.addNotExistingVertextoVertexList1(element)
    }
  }

  addNotExistingVertextoVertexList2(_vertex) {
    if (!Utilities.contains(this.vertexList2, _vertex))
      this.vertexList2.push(_vertex)
  }

  addNotExistingVerticestoVertexList2(_vertices) {
    console.log(_vertices);

    for (let index = 0; index < _vertices.length; index++) {
      const element = _vertices[index];
      this.addNotExistingVertextoVertexList2(element)
    }
  }

  addNotExistingVertextoRelation(_relation) {
    other = []
    for (let index = 0; index < _relation.vertexList1.length; index++) {
      const element = _relation.vertexList1[index];
      other.push(element)
    }
    for (let index = 0; index < _relation.vertexList2.length; index++) {
      const element = _relation.vertexList2[index];
      other.push(element)
    }

    me = []
    for (let index = 0; index < this.vertexList1.length; index++) {
      const element = this.vertexList1[index];
      me.push(element)
    }
    for (let index = 0; index < this.vertexList2.length; index++) {
      const element = this.vertexList2[index];
      me.push(element)
    }
    for (let index = 0; index < other.length; index++) {
      const vertex = other[index]
      if (!Utilities.contains(me, vertex))
        this.vertexList2.push(vertex)
    }
  }
}

spinalCore.register_models([SpinalRelation]);