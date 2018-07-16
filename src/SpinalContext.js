const spinalCore = require("spinal-core-connectorjs");
const globalType = typeof window === "undefined" ? global : window;
let getViewer = function() {
  return globalType.v;
};

import {
  Utilities
} from "./Utilities"

export default class SpinalContext extends globalType.Model {
  constructor(_name, _usedRelations, _startingNode, _usedGraph, name =
    "SpinalContext") {
    super();
    if (FileSystem._sig_server) {
      this.add_attr({
        id: Utilities.guid(this.constructor.name),
        name: _name || "",
        usedRelations: _usedRelations || new Lst(),
        startingNode: _startingNode,
        usedGraph: _usedGraph,
        contextImage: new Lst()
      });
    }
  }
}

spinalCore.register_models([SpinalContext]);