const spinalCore = require("spinal-core-connectorjs");
const globalType = typeof window === "undefined" ? global : window;

import {
  Utilities
} from "./Utilities";
/**
 *
 *
 * @class SpinalDevice
 * @extends {globalType.Model}
 */
class SpinalDevice extends globalType.Model {
  /**
   *Creates an instance of SpinalDevice.
   * @param {string} [name=""] 
   * @param {string} [path=""] 
   * @param {string} [type="Sensor"] - one of ["Sensor", "Router", "Actuator"]
   * @param {string} [protocolType=""] 
   * @param {string} [ipAddress="127.0.0.1"]
   * @param {string} [name="SpinalDevice"]
   * @memberof SpinalDevice
   */
  constructor(_name = "", path = "", type, protocolType, ipAddress =
    "127.0.0.1",
    name =
    "SpinalDevice") {
    super();
    if (FileSystem._sig_server) {
      this.add_attr({
        id: Utilities.guid(this.constructor.name),
        name: _name,
        path: path,
        type: new Choice(0, ["Sensor", "Router", "Actuator"]),
        protocolType: protocolType,
        ipAddress: ipAddress
      });
      if (typeof type !== "undefined")
        this.type.set(type);
    }
  }

}
export default SpinalDevice;
spinalCore.register_models([SpinalDevice])