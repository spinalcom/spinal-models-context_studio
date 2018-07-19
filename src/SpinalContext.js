const spinalCore = require("spinal-core-connectorjs");
const globalType = typeof window === "undefined" ? global : window;
let getViewer = function() {
  return globalType.v;
};

import {
  Utilities
} from "./Utilities"

import
SpinalApplication
from "./SpinalApplication"

/**
 *
 *
 * @class SpinalContext
 * @extends {SpinalApplication}
 */


class SpinalContext extends SpinalApplication {
  /**
   *Creates an instance of SpinalContext.
   * @param {string} name
   * @param {string[]} relationsTypesLst
   * @param {SpinalGraph} relatedGraph
   * @param {SpinaNode} startingNode
   * @param {string} [name="SpinalContext"]
   * @memberof SpinalContext
   */
  constructor(_name, relationsTypesLst, relatedGraph, startingNode, name =
    "SpinalContext") {
    super(_name, relationsTypesLst, relatedGraph);
    if (FileSystem._sig_server) {
      this.add_attr({
        startingNode: startingNode || new Ptr(0),
        contextImage: new Lst()
      });
    }
  }
}
export default SpinalContext;
spinalCore.register_models([SpinalContext]);