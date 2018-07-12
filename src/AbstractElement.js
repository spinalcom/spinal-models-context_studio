const spinalCore = require("spinal-core-connectorjs");
const globalType = typeof window === "undefined" ? global : window;

export default class AbstractElement extends globalType.Model {
  constructor(_name, _type, name = "AbstractElement") {
    super();
    if (FileSystem._sig_server) {
      this.add_attr({
        name: _name,
        id: this.guid(),
        type: _type
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

  setName(_name) {
    this.name.set(_name)
  }

}

spinalCore.register_models([AbstractElement])