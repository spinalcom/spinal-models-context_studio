const spinalCore = require("spinal-core-connectorjs");
const globalType = typeof window === "undefined" ? global : window;
import {
  Utilities
} from "./Utilities";
/**
 *
 *
 * @class SpinalLog
 * @extends {Model}
 */
class SpinalLog extends globalType.Model {
  constructor(endpointName, type, user, message, endpointNode, value) {
    super();
    this.add_attr({
      id: Utilities.guid(type),
      name: endpointName,
      type: (() => {
        if (type == "min")
          return "SpinalThresholdMin";
        return "SpinalThresholdMax";
      })(),
      date_begin: Date.now(),
      date_end: Date.now(),
      user: user,
      message: message,
      value: value,
      endpoint: new Ptr(endpointNode)

    })
  }
}

export default SpinalLog;
spinalCore.register_models([SpinalLog]);