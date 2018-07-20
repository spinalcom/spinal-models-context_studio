const spinalCore = require("spinal-core-connectorjs");
const globalType = typeof window === "undefined" ? global : window;


import {
  Utilities
} from "./Utilities";
/**
 *
 *
 * @class SpinalNetwork
 * @extends {globalType.Model}
 */
class SpinalNetwork extends globalType.Model {
  /**
   *Creates an instance of SpinalNetwork.
   * @param {string} [_name=""]
   * @param {string} [type=""]
   * @param {string} [host=""]
   * @param {string} [user=""]
   * @param {string} [password=""]
   * @param {Model} [options=new Ptr(0)] - mod_attr to change it
   * @param {string} [name="SpinalNetwork"]
   * @memberof SpinalNetwork
   */
  constructor(_name = "", type = "", host = "", user = "", password = "",
    options = new Ptr(0), name =
    "SpinalNetwork") {
    super();
    if (FileSystem._sig_server) {
      this.add_attr({
        id: Utilities.guid(this.constructor.name),
        name: _name,
        type: type,
        host: host,
        user: user,
        password: password,
        options: options
      });
    }
  }

}
export default SpinalNetwork;
spinalCore.register_models([SpinalNetwork])