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
   * @param {number} [min=0]
   * @param {number} [max=0]
   * @param {string} [dataNature=""] example : temperature
   * @param {string} [name="SpinalEndpoint"]
   * @memberof SpinalEndpoint
   */
  constructor(_name = "", path = "", currentValue = 0, unit = "", dataType, min = 0, max = 0, dataNature = "", name = "SpinalEndpoint") {
    super();
    if (FileSystem._sig_server) {
      this.add_attr({
        id: _Utilities.Utilities.guid(this.constructor.name),
        name: _name,
        path: path,
        currentValue: currentValue,
        unit: unit,
        dataType: new Choice(0, ["Null", "Boolean", "Unsigned", "Unsigned8", "Unsigned16", "Unsigned32", "Integer", "Integer16", "Real", "Double", "OctetString", "CharacterString", "BitString", "Enumerated", "Date", "Time", "Array"]),
        min: min,
        max: max,
        dataNature: dataNature
      });
      if (typeof dataType !== "undefined") this.dataType.set(dataType);
    }
  }
}
exports.default = SpinalEndpoint;

spinalCore.register_models([SpinalEndpoint]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TcGluYWxFbmRwb2ludC5qcyJdLCJuYW1lcyI6WyJzcGluYWxDb3JlIiwicmVxdWlyZSIsImdsb2JhbFR5cGUiLCJ3aW5kb3ciLCJnbG9iYWwiLCJTcGluYWxFbmRwb2ludCIsIk1vZGVsIiwiY29uc3RydWN0b3IiLCJfbmFtZSIsInBhdGgiLCJjdXJyZW50VmFsdWUiLCJ1bml0IiwiZGF0YVR5cGUiLCJtaW4iLCJtYXgiLCJkYXRhTmF0dXJlIiwibmFtZSIsIkZpbGVTeXN0ZW0iLCJfc2lnX3NlcnZlciIsImFkZF9hdHRyIiwiaWQiLCJVdGlsaXRpZXMiLCJndWlkIiwiQ2hvaWNlIiwic2V0IiwicmVnaXN0ZXJfbW9kZWxzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFFQTs7QUFGQSxNQUFNQSxhQUFhQyxRQUFRLHlCQUFSLENBQW5CO0FBQ0EsTUFBTUMsYUFBYSxPQUFPQyxNQUFQLEtBQWtCLFdBQWxCLEdBQWdDQyxNQUFoQyxHQUF5Q0QsTUFBNUQ7O0FBSUE7Ozs7OztBQU1BLE1BQU1FLGNBQU4sU0FBNkJILFdBQVdJLEtBQXhDLENBQThDO0FBQzVDOzs7Ozs7Ozs7Ozs7O0FBYUFDLGNBQVlDLFFBQVEsRUFBcEIsRUFBd0JDLE9BQU8sRUFBL0IsRUFBbUNDLGVBQWUsQ0FBbEQsRUFBcURDLE9BQU8sRUFBNUQsRUFBZ0VDLFFBQWhFLEVBQ0VDLE1BQ0EsQ0FGRixFQUdFQyxNQUNBLENBSkYsRUFLRUMsYUFBYSxFQUxmLEVBTUVDLE9BQ0EsZ0JBUEYsRUFPb0I7QUFDbEI7QUFDQSxRQUFJQyxXQUFXQyxXQUFmLEVBQTRCO0FBQzFCLFdBQUtDLFFBQUwsQ0FBYztBQUNaQyxZQUFJQyxxQkFBVUMsSUFBVixDQUFlLEtBQUtmLFdBQUwsQ0FBaUJTLElBQWhDLENBRFE7QUFFWkEsY0FBTVIsS0FGTTtBQUdaQyxjQUFNQSxJQUhNO0FBSVpDLHNCQUFjQSxZQUpGO0FBS1pDLGNBQU1BLElBTE07QUFNWkMsa0JBQVUsSUFBSVcsTUFBSixDQUFXLENBQVgsRUFBYyxDQUFDLE1BQUQsRUFBUyxTQUFULEVBQW9CLFVBQXBCLEVBQ3RCLFdBRHNCLEVBQ1QsWUFEUyxFQUNLLFlBREwsRUFDbUIsU0FEbkIsRUFFdEIsV0FGc0IsRUFFVCxNQUZTLEVBRUQsUUFGQyxFQUVTLGFBRlQsRUFHdEIsaUJBSHNCLEVBR0gsV0FIRyxFQUdVLFlBSFYsRUFHd0IsTUFIeEIsRUFJdEIsTUFKc0IsRUFJZCxPQUpjLENBQWQsQ0FORTtBQVlaVixhQUFLQSxHQVpPO0FBYVpDLGFBQUtBLEdBYk87QUFjWkMsb0JBQVlBO0FBZEEsT0FBZDtBQWdCQSxVQUFJLE9BQU9ILFFBQVAsS0FBb0IsV0FBeEIsRUFDRSxLQUFLQSxRQUFMLENBQWNZLEdBQWQsQ0FBa0JaLFFBQWxCO0FBQ0g7QUFDRjtBQTNDMkM7a0JBNkMvQlAsYzs7QUFDZkwsV0FBV3lCLGVBQVgsQ0FBMkIsQ0FBQ3BCLGNBQUQsQ0FBM0IiLCJmaWxlIjoiU3BpbmFsRW5kcG9pbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBzcGluYWxDb3JlID0gcmVxdWlyZShcInNwaW5hbC1jb3JlLWNvbm5lY3RvcmpzXCIpO1xuY29uc3QgZ2xvYmFsVHlwZSA9IHR5cGVvZiB3aW5kb3cgPT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB3aW5kb3c7XG5pbXBvcnQge1xuICBVdGlsaXRpZXNcbn0gZnJvbSBcIi4vVXRpbGl0aWVzXCI7XG4vKipcbiAqXG4gKlxuICogQGNsYXNzIFNwaW5hbEVuZHBvaW50XG4gKiBAZXh0ZW5kcyB7TW9kZWx9XG4gKi9cbmNsYXNzIFNwaW5hbEVuZHBvaW50IGV4dGVuZHMgZ2xvYmFsVHlwZS5Nb2RlbCB7XG4gIC8qKlxuICAgKkNyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgU3BpbmFsRW5kcG9pbnQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbX25hbWU9XCJcIl1cbiAgICogQHBhcmFtIHtzdHJpbmd9IFtwYXRoPVwiXCJdXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbY3VycmVudFZhbHVlPTBdXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbdW5pdD1cIlwiXVxuICAgKiBAcGFyYW0ge3N0cmluZ30gW2RhdGFUeXBlPVwiTnVsbFwiXVxuICAgKiBAcGFyYW0ge251bWJlcn0gW21pbj0wXVxuICAgKiBAcGFyYW0ge251bWJlcn0gW21heD0wXVxuICAgKiBAcGFyYW0ge3N0cmluZ30gW2RhdGFOYXR1cmU9XCJcIl0gZXhhbXBsZSA6IHRlbXBlcmF0dXJlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbbmFtZT1cIlNwaW5hbEVuZHBvaW50XCJdXG4gICAqIEBtZW1iZXJvZiBTcGluYWxFbmRwb2ludFxuICAgKi9cbiAgY29uc3RydWN0b3IoX25hbWUgPSBcIlwiLCBwYXRoID0gXCJcIiwgY3VycmVudFZhbHVlID0gMCwgdW5pdCA9IFwiXCIsIGRhdGFUeXBlLFxuICAgIG1pbiA9XG4gICAgMCxcbiAgICBtYXggPVxuICAgIDAsXG4gICAgZGF0YU5hdHVyZSA9IFwiXCIsXG4gICAgbmFtZSA9XG4gICAgXCJTcGluYWxFbmRwb2ludFwiKSB7XG4gICAgc3VwZXIoKTtcbiAgICBpZiAoRmlsZVN5c3RlbS5fc2lnX3NlcnZlcikge1xuICAgICAgdGhpcy5hZGRfYXR0cih7XG4gICAgICAgIGlkOiBVdGlsaXRpZXMuZ3VpZCh0aGlzLmNvbnN0cnVjdG9yLm5hbWUpLFxuICAgICAgICBuYW1lOiBfbmFtZSxcbiAgICAgICAgcGF0aDogcGF0aCxcbiAgICAgICAgY3VycmVudFZhbHVlOiBjdXJyZW50VmFsdWUsXG4gICAgICAgIHVuaXQ6IHVuaXQsXG4gICAgICAgIGRhdGFUeXBlOiBuZXcgQ2hvaWNlKDAsIFtcIk51bGxcIiwgXCJCb29sZWFuXCIsIFwiVW5zaWduZWRcIixcbiAgICAgICAgICBcIlVuc2lnbmVkOFwiLCBcIlVuc2lnbmVkMTZcIiwgXCJVbnNpZ25lZDMyXCIsIFwiSW50ZWdlclwiLFxuICAgICAgICAgIFwiSW50ZWdlcjE2XCIsIFwiUmVhbFwiLCBcIkRvdWJsZVwiLCBcIk9jdGV0U3RyaW5nXCIsXG4gICAgICAgICAgXCJDaGFyYWN0ZXJTdHJpbmdcIiwgXCJCaXRTdHJpbmdcIiwgXCJFbnVtZXJhdGVkXCIsIFwiRGF0ZVwiLFxuICAgICAgICAgIFwiVGltZVwiLCBcIkFycmF5XCJcbiAgICAgICAgXSksXG4gICAgICAgIG1pbjogbWluLFxuICAgICAgICBtYXg6IG1heCxcbiAgICAgICAgZGF0YU5hdHVyZTogZGF0YU5hdHVyZVxuICAgICAgfSk7XG4gICAgICBpZiAodHlwZW9mIGRhdGFUeXBlICE9PSBcInVuZGVmaW5lZFwiKVxuICAgICAgICB0aGlzLmRhdGFUeXBlLnNldChkYXRhVHlwZSk7XG4gICAgfVxuICB9XG59XG5leHBvcnQgZGVmYXVsdCBTcGluYWxFbmRwb2ludDtcbnNwaW5hbENvcmUucmVnaXN0ZXJfbW9kZWxzKFtTcGluYWxFbmRwb2ludF0pIl19