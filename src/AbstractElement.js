const spinalCore = require("spinal-core-connectorjs");
const globalType = typeof window === "undefined" ? global : window;

import {
  Utilities
} from "./Utilities";
export default class AbstractElement extends globalType.Model {
  constructor(_name, _type, name = "AbstractElement") {
    super();
    if (FileSystem._sig_server) {
      this.add_attr({
        name: _name,
        id: Utilities.guid(this.constructor.name),
        type: _type
      });
    }
  }


  setName(_name) {
    this.name.set(_name)
  }

}

spinalCore.register_models([AbstractElement])