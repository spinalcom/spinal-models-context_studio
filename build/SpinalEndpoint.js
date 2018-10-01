"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Utilities = require("./Utilities");

const spinalCore = require("spinal-core-connectorjs");
const globalType = typeof window === "undefined" ? global : window;

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
  constructor(_name = "", path = "", currentValue = 0, unit = "", dataType, min = 0, max = 0, dataNature = "", alarmType, oldAlarmType = "normal", name = "SpinalEndpoint") {
    super();
    if (FileSystem._sig_server) {
      this.add_attr({
        id: _Utilities.Utilities.guid(this.constructor.name),
        name: _name,
        path: path,
        currentValue: currentValue,
        unit: unit,
        dataType: new Choice(0, ["Null", "Boolean", "Unsigned", "Unsigned8", "Unsigned16", "Unsigned32", "Integer", "Integer16", "Real", "Double", "OctetString", "CharacterString", "BitString", "Enumerated", "Date", "Time", "Array", "DateTime", "Long", "String", "Duration"]),
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

      if (typeof dataType !== "undefined") this.dataType.set(dataType);

      if (typeof alarmType !== "undefined") this.dataType.set(alarmType);
    }
  }
}
exports.default = SpinalEndpoint;

spinalCore.register_models([SpinalEndpoint]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TcGluYWxFbmRwb2ludC5qcyJdLCJuYW1lcyI6WyJzcGluYWxDb3JlIiwicmVxdWlyZSIsImdsb2JhbFR5cGUiLCJ3aW5kb3ciLCJnbG9iYWwiLCJTcGluYWxFbmRwb2ludCIsIk1vZGVsIiwiY29uc3RydWN0b3IiLCJfbmFtZSIsInBhdGgiLCJjdXJyZW50VmFsdWUiLCJ1bml0IiwiZGF0YVR5cGUiLCJtaW4iLCJtYXgiLCJkYXRhTmF0dXJlIiwiYWxhcm1UeXBlIiwib2xkQWxhcm1UeXBlIiwibmFtZSIsIkZpbGVTeXN0ZW0iLCJfc2lnX3NlcnZlciIsImFkZF9hdHRyIiwiaWQiLCJVdGlsaXRpZXMiLCJndWlkIiwiQ2hvaWNlIiwic2V1aWxNaW4iLCJ2YWx1ZSIsImFjdGl2ZSIsInNldWlsTWF4IiwiY3VycmVudExvZyIsInNldCIsInJlZ2lzdGVyX21vZGVscyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBRUE7O0FBRkEsTUFBTUEsYUFBYUMsUUFBUSx5QkFBUixDQUFuQjtBQUNBLE1BQU1DLGFBQWEsT0FBT0MsTUFBUCxLQUFrQixXQUFsQixHQUFnQ0MsTUFBaEMsR0FBeUNELE1BQTVEOztBQUlBOzs7Ozs7QUFNQSxNQUFNRSxjQUFOLFNBQTZCSCxXQUFXSSxLQUF4QyxDQUE4QztBQUM1Qzs7Ozs7Ozs7Ozs7OztBQWFBQyxjQUFZQyxRQUFRLEVBQXBCLEVBQXdCQyxPQUFPLEVBQS9CLEVBQW1DQyxlQUFlLENBQWxELEVBQXFEQyxPQUFPLEVBQTVELEVBQWdFQyxRQUFoRSxFQUNFQyxNQUNBLENBRkYsRUFHRUMsTUFDQSxDQUpGLEVBS0VDLGFBQWEsRUFMZixFQU1FQyxTQU5GLEVBT0VDLGVBQWUsUUFQakIsRUFRRUMsT0FDQSxnQkFURixFQVNvQjtBQUNsQjtBQUNBLFFBQUlDLFdBQVdDLFdBQWYsRUFBNEI7QUFDMUIsV0FBS0MsUUFBTCxDQUFjO0FBQ1pDLFlBQUlDLHFCQUFVQyxJQUFWLENBQWUsS0FBS2pCLFdBQUwsQ0FBaUJXLElBQWhDLENBRFE7QUFFWkEsY0FBTVYsS0FGTTtBQUdaQyxjQUFNQSxJQUhNO0FBSVpDLHNCQUFjQSxZQUpGO0FBS1pDLGNBQU1BLElBTE07QUFNWkMsa0JBQVUsSUFBSWEsTUFBSixDQUFXLENBQVgsRUFBYyxDQUFDLE1BQUQsRUFBUyxTQUFULEVBQW9CLFVBQXBCLEVBQ3RCLFdBRHNCLEVBQ1QsWUFEUyxFQUNLLFlBREwsRUFDbUIsU0FEbkIsRUFFdEIsV0FGc0IsRUFFVCxNQUZTLEVBRUQsUUFGQyxFQUVTLGFBRlQsRUFHdEIsaUJBSHNCLEVBR0gsV0FIRyxFQUdVLFlBSFYsRUFHd0IsTUFIeEIsRUFJdEIsTUFKc0IsRUFJZCxPQUpjLEVBSUwsVUFKSyxFQUlPLE1BSlAsRUFJZSxRQUpmLEVBSXlCLFVBSnpCLENBQWQsQ0FORTtBQVlaQyxrQkFBVTtBQUNSQyxpQkFBT2QsR0FEQztBQUVSZSxrQkFBUTtBQUZBLFNBWkU7QUFnQlpDLGtCQUFVO0FBQ1JGLGlCQUFPYixHQURDO0FBRVJjLGtCQUFRO0FBRkEsU0FoQkU7QUFvQlpaLG1CQUFXLElBQUlTLE1BQUosQ0FBVyxDQUFYLEVBQWMsQ0FBQyxLQUFELEVBQVEsUUFBUixFQUFrQixLQUFsQixDQUFkLENBcEJDO0FBcUJaUixzQkFBY0EsWUFyQkY7QUFzQlpGLG9CQUFZQSxVQXRCQTtBQXVCWmUsb0JBQVksSUFBSXhCLEtBQUo7QUF2QkEsT0FBZDs7QUEwQkEsVUFBSSxPQUFPTSxRQUFQLEtBQW9CLFdBQXhCLEVBQ0UsS0FBS0EsUUFBTCxDQUFjbUIsR0FBZCxDQUFrQm5CLFFBQWxCOztBQUVGLFVBQUksT0FBT0ksU0FBUCxLQUFxQixXQUF6QixFQUNFLEtBQUtKLFFBQUwsQ0FBY21CLEdBQWQsQ0FBa0JmLFNBQWxCO0FBQ0g7QUFDRjtBQTFEMkM7a0JBNEQvQlgsYzs7QUFDZkwsV0FBV2dDLGVBQVgsQ0FBMkIsQ0FBQzNCLGNBQUQsQ0FBM0IiLCJmaWxlIjoiU3BpbmFsRW5kcG9pbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBzcGluYWxDb3JlID0gcmVxdWlyZShcInNwaW5hbC1jb3JlLWNvbm5lY3RvcmpzXCIpO1xuY29uc3QgZ2xvYmFsVHlwZSA9IHR5cGVvZiB3aW5kb3cgPT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB3aW5kb3c7XG5pbXBvcnQge1xuICBVdGlsaXRpZXNcbn0gZnJvbSBcIi4vVXRpbGl0aWVzXCI7XG4vKipcbiAqXG4gKlxuICogQGNsYXNzIFNwaW5hbEVuZHBvaW50XG4gKiBAZXh0ZW5kcyB7TW9kZWx9XG4gKi9cbmNsYXNzIFNwaW5hbEVuZHBvaW50IGV4dGVuZHMgZ2xvYmFsVHlwZS5Nb2RlbCB7XG4gIC8qKlxuICAgKkNyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgU3BpbmFsRW5kcG9pbnQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbX25hbWU9XCJcIl1cbiAgICogQHBhcmFtIHtzdHJpbmd9IFtwYXRoPVwiXCJdXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbY3VycmVudFZhbHVlPTBdXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbdW5pdD1cIlwiXVxuICAgKiBAcGFyYW0ge3N0cmluZ30gW2RhdGFUeXBlPVwiTnVsbFwiXVxuICAgKiBAcGFyYW0ge09ian0gW3NldWlsTWluPXt2YWx1ZTogMCxhY3RpdmUgOiBmYWxzZX1dXG4gICAqIEBwYXJhbSB7T2JqfSBbc2V1aWxNYXg9e3ZhbHVlOjAsYWN0aXZlOiBmYWxzZX1dXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbZGF0YU5hdHVyZT1cIlwiXSBleGFtcGxlIDogdGVtcGVyYXR1cmVcbiAgICogQHBhcmFtIHtzdHJpbmd9IFtuYW1lPVwiU3BpbmFsRW5kcG9pbnRcIl1cbiAgICogQG1lbWJlcm9mIFNwaW5hbEVuZHBvaW50XG4gICAqL1xuICBjb25zdHJ1Y3RvcihfbmFtZSA9IFwiXCIsIHBhdGggPSBcIlwiLCBjdXJyZW50VmFsdWUgPSAwLCB1bml0ID0gXCJcIiwgZGF0YVR5cGUsXG4gICAgbWluID1cbiAgICAwLFxuICAgIG1heCA9XG4gICAgMCxcbiAgICBkYXRhTmF0dXJlID0gXCJcIixcbiAgICBhbGFybVR5cGUsXG4gICAgb2xkQWxhcm1UeXBlID0gXCJub3JtYWxcIixcbiAgICBuYW1lID1cbiAgICBcIlNwaW5hbEVuZHBvaW50XCIpIHtcbiAgICBzdXBlcigpO1xuICAgIGlmIChGaWxlU3lzdGVtLl9zaWdfc2VydmVyKSB7XG4gICAgICB0aGlzLmFkZF9hdHRyKHtcbiAgICAgICAgaWQ6IFV0aWxpdGllcy5ndWlkKHRoaXMuY29uc3RydWN0b3IubmFtZSksXG4gICAgICAgIG5hbWU6IF9uYW1lLFxuICAgICAgICBwYXRoOiBwYXRoLFxuICAgICAgICBjdXJyZW50VmFsdWU6IGN1cnJlbnRWYWx1ZSxcbiAgICAgICAgdW5pdDogdW5pdCxcbiAgICAgICAgZGF0YVR5cGU6IG5ldyBDaG9pY2UoMCwgW1wiTnVsbFwiLCBcIkJvb2xlYW5cIiwgXCJVbnNpZ25lZFwiLFxuICAgICAgICAgIFwiVW5zaWduZWQ4XCIsIFwiVW5zaWduZWQxNlwiLCBcIlVuc2lnbmVkMzJcIiwgXCJJbnRlZ2VyXCIsXG4gICAgICAgICAgXCJJbnRlZ2VyMTZcIiwgXCJSZWFsXCIsIFwiRG91YmxlXCIsIFwiT2N0ZXRTdHJpbmdcIixcbiAgICAgICAgICBcIkNoYXJhY3RlclN0cmluZ1wiLCBcIkJpdFN0cmluZ1wiLCBcIkVudW1lcmF0ZWRcIiwgXCJEYXRlXCIsXG4gICAgICAgICAgXCJUaW1lXCIsIFwiQXJyYXlcIiwgXCJEYXRlVGltZVwiLCBcIkxvbmdcIiwgXCJTdHJpbmdcIiwgXCJEdXJhdGlvblwiXG4gICAgICAgIF0pLFxuICAgICAgICBzZXVpbE1pbjoge1xuICAgICAgICAgIHZhbHVlOiBtaW4sXG4gICAgICAgICAgYWN0aXZlOiBmYWxzZVxuICAgICAgICB9LFxuICAgICAgICBzZXVpbE1heDoge1xuICAgICAgICAgIHZhbHVlOiBtYXgsXG4gICAgICAgICAgYWN0aXZlOiBmYWxzZVxuICAgICAgICB9LFxuICAgICAgICBhbGFybVR5cGU6IG5ldyBDaG9pY2UoMSwgW1wibWluXCIsIFwibm9ybWFsXCIsIFwibWF4XCJdKSxcbiAgICAgICAgb2xkQWxhcm1UeXBlOiBvbGRBbGFybVR5cGUsXG4gICAgICAgIGRhdGFOYXR1cmU6IGRhdGFOYXR1cmUsXG4gICAgICAgIGN1cnJlbnRMb2c6IG5ldyBNb2RlbCgpXG4gICAgICB9KTtcblxuICAgICAgaWYgKHR5cGVvZiBkYXRhVHlwZSAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgICAgdGhpcy5kYXRhVHlwZS5zZXQoZGF0YVR5cGUpO1xuXG4gICAgICBpZiAodHlwZW9mIGFsYXJtVHlwZSAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgICAgdGhpcy5kYXRhVHlwZS5zZXQoYWxhcm1UeXBlKTtcbiAgICB9XG4gIH1cbn1cbmV4cG9ydCBkZWZhdWx0IFNwaW5hbEVuZHBvaW50O1xuc3BpbmFsQ29yZS5yZWdpc3Rlcl9tb2RlbHMoW1NwaW5hbEVuZHBvaW50XSkiXX0=