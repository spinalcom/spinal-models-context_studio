const spinalCore = require("spinal-core-connectorjs");
const globalType = typeof window === "undefined" ? global : window;
import AbstractElement from "./AbstractElement";
import SpinalNode from "./SpinalNode";

let getViewer = function() {
  return globalType.v;
};

import { Utilities } from "./Utilities";

import SpinalApplication from "./SpinalApplication";

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
   * @param {Object[]} models
   * @param {Model} [Interactions= new Model()]
   * @param {SpinaNode} [startingNode = new SpinalNode("root",new AbstractElement(_name, "root"))]
   * @param {SpinalGraph} relatedGraph
   * @param {string} [name="SpinalContext"]
   * @memberof SpinalContext
   */
  constructor(
    _name,
    relationsTypesLst,
    models,
    Interactions = new globalType.Model(),
    startingNode = new SpinalNode("root", new AbstractElement(_name, "root")),
    relatedGraph,
    name = "SpinalContext"
  ) {
    super(_name, relationsTypesLst, relatedGraph);
    if (FileSystem._sig_server) {
      this.add_attr({
        models: models,
        startingNode: startingNode,
        Interactions: Interactions,
        contextImage: new Lst()
      });
    }
  }
}
export default SpinalContext;
spinalCore.register_models([SpinalContext]);
