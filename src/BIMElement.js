const spinalCore = require("spinal-core-connectorjs");
const globalType = typeof window === "undefined" ? global : window;
const BIMForge = require("spinal-models-bim_forge");

export default class BIMElement extends BIMForge.SpinalBIMObjectForge {
  constructor(_name, _type, name = "BIMElement") {
    super(0, _name, 0);
    if (FileSystem._sig_server) {
      this.add_attr({
        type: _type || ""
      });
    }
    // this.name = _name;
    this.mod_attr('id', this.guid())
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

  setName(_name) {
    this.name.set(_name)
  }

}

spinalCore.register_models([BIMElement])