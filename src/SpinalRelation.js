const spinalCore = require("spinal-core-connectorjs");
const globalType = typeof window === "undefined" ? global : window;
let getViewer = function() {
  return globalType.v;
};

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


}

spinalCore.register_models([SpinalRelation]);