const spinalCore = require("spinal-core-connectorjs");
const globalType = typeof window === "undefined" ? global : window;
import {
  Utilities
} from "./Utilities";
/**
 *
 *
 * @class SpinalEndpoint
 * @extends {Model}
 */
class SpinalEndpoint extends globalType.Model {
  /**
   *Creates an instance of SpinalEndpoint.
   * @param {string} [_name=""]
   * @param {string} [path=""]
   * @param {number} [currentValue=0]
   * @param {string} [unit=""]
   * @param {string} [dataType="Null"]
   * @param {Obj} [seuilMin={value: 0,active : false}]
   * @param {Obj} [seuilMax={value:0,active: false}]
   * @param {string} [dataNature=""] example : temperature
   * @param {string} [name="SpinalEndpoint"]
   * @memberof SpinalEndpoint
   */
  constructor(_name = "", path = "", currentValue = 0, unit = "", dataType,
    min =
    0,
    max =
    0,
    dataNature = "",
    alarmType,
    oldAlarmType = "normal",
    name =
    "SpinalEndpoint") {
    super();
    if (FileSystem._sig_server) {
      this.add_attr({
        id: Utilities.guid(this.constructor.name),
        name: _name,
        path: path,
        currentValue: currentValue,
        unit: unit,
        dataType: new Choice(0, ["Null", "Boolean", "Unsigned",
          "Unsigned8", "Unsigned16", "Unsigned32", "Integer",
          "Integer16", "Real", "Double", "OctetString",
          "CharacterString", "BitString", "Enumerated", "Date",
          "Time", "Array", "DateTime", "Long", "String", "Duration"
        ]),
        seuilMin: {
          value: min,
          active: false
        },
        seuilMax: {
          value: max,
          active: false
        },
        alarmType: new Choice(1, ["min", "normal", "max"]),
        oldAlarmType: oldAlarmType,
        dataNature: dataNature,
        currentLog: new Model()
      });

      if (typeof dataType !== "undefined")
        this.dataType.set(dataType);

      if (typeof alarmType !== "undefined")
        this.dataType.set(alarmType);
    }
  }
}
export default SpinalEndpoint;
spinalCore.register_models([SpinalEndpoint])