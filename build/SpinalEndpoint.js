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
  constructor(_name = "", path = "", currentValue = 0, unit = "", dataType, min = 0, max = 0, dataNature = "", name = "SpinalEndpoint") {
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
        dataNature: dataNature
      });
      if (typeof dataType !== "undefined") this.dataType.set(dataType);
    }
  }
}
exports.default = SpinalEndpoint;

spinalCore.register_models([SpinalEndpoint]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TcGluYWxFbmRwb2ludC5qcyJdLCJuYW1lcyI6WyJzcGluYWxDb3JlIiwicmVxdWlyZSIsImdsb2JhbFR5cGUiLCJ3aW5kb3ciLCJnbG9iYWwiLCJTcGluYWxFbmRwb2ludCIsIk1vZGVsIiwiY29uc3RydWN0b3IiLCJfbmFtZSIsInBhdGgiLCJjdXJyZW50VmFsdWUiLCJ1bml0IiwiZGF0YVR5cGUiLCJtaW4iLCJtYXgiLCJkYXRhTmF0dXJlIiwibmFtZSIsIkZpbGVTeXN0ZW0iLCJfc2lnX3NlcnZlciIsImFkZF9hdHRyIiwiaWQiLCJVdGlsaXRpZXMiLCJndWlkIiwiQ2hvaWNlIiwic2V1aWxNaW4iLCJ2YWx1ZSIsImFjdGl2ZSIsInNldWlsTWF4Iiwic2V0IiwicmVnaXN0ZXJfbW9kZWxzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFFQTs7QUFGQSxNQUFNQSxhQUFhQyxRQUFRLHlCQUFSLENBQW5CO0FBQ0EsTUFBTUMsYUFBYSxPQUFPQyxNQUFQLEtBQWtCLFdBQWxCLEdBQWdDQyxNQUFoQyxHQUF5Q0QsTUFBNUQ7O0FBSUE7Ozs7OztBQU1BLE1BQU1FLGNBQU4sU0FBNkJILFdBQVdJLEtBQXhDLENBQThDO0FBQzVDOzs7Ozs7Ozs7Ozs7O0FBYUFDLGNBQVlDLFFBQVEsRUFBcEIsRUFBd0JDLE9BQU8sRUFBL0IsRUFBbUNDLGVBQWUsQ0FBbEQsRUFBcURDLE9BQU8sRUFBNUQsRUFBZ0VDLFFBQWhFLEVBQ0VDLE1BQ0EsQ0FGRixFQUdFQyxNQUNBLENBSkYsRUFLRUMsYUFBYSxFQUxmLEVBTUVDLE9BQ0EsZ0JBUEYsRUFPb0I7QUFDbEI7QUFDQSxRQUFJQyxXQUFXQyxXQUFmLEVBQTRCO0FBQzFCLFdBQUtDLFFBQUwsQ0FBYztBQUNaQyxZQUFJQyxxQkFBVUMsSUFBVixDQUFlLEtBQUtmLFdBQUwsQ0FBaUJTLElBQWhDLENBRFE7QUFFWkEsY0FBTVIsS0FGTTtBQUdaQyxjQUFNQSxJQUhNO0FBSVpDLHNCQUFjQSxZQUpGO0FBS1pDLGNBQU1BLElBTE07QUFNWkMsa0JBQVUsSUFBSVcsTUFBSixDQUFXLENBQVgsRUFBYyxDQUFDLE1BQUQsRUFBUyxTQUFULEVBQW9CLFVBQXBCLEVBQ3RCLFdBRHNCLEVBQ1QsWUFEUyxFQUNLLFlBREwsRUFDbUIsU0FEbkIsRUFFdEIsV0FGc0IsRUFFVCxNQUZTLEVBRUQsUUFGQyxFQUVTLGFBRlQsRUFHdEIsaUJBSHNCLEVBR0gsV0FIRyxFQUdVLFlBSFYsRUFHd0IsTUFIeEIsRUFJdEIsTUFKc0IsRUFJZCxPQUpjLEVBSUwsVUFKSyxFQUlPLE1BSlAsRUFJZSxRQUpmLEVBSXlCLFVBSnpCLENBQWQsQ0FORTtBQVlaQyxrQkFBVTtBQUNSQyxpQkFBT1osR0FEQztBQUVSYSxrQkFBUTtBQUZBLFNBWkU7QUFnQlpDLGtCQUFVO0FBQ1JGLGlCQUFPWCxHQURDO0FBRVJZLGtCQUFRO0FBRkEsU0FoQkU7QUFvQlpYLG9CQUFZQTtBQXBCQSxPQUFkO0FBc0JBLFVBQUksT0FBT0gsUUFBUCxLQUFvQixXQUF4QixFQUNFLEtBQUtBLFFBQUwsQ0FBY2dCLEdBQWQsQ0FBa0JoQixRQUFsQjtBQUNIO0FBQ0Y7QUFqRDJDO2tCQW1EL0JQLGM7O0FBQ2ZMLFdBQVc2QixlQUFYLENBQTJCLENBQUN4QixjQUFELENBQTNCIiwiZmlsZSI6IlNwaW5hbEVuZHBvaW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3Qgc3BpbmFsQ29yZSA9IHJlcXVpcmUoXCJzcGluYWwtY29yZS1jb25uZWN0b3Jqc1wiKTtcbmNvbnN0IGdsb2JhbFR5cGUgPSB0eXBlb2Ygd2luZG93ID09PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogd2luZG93O1xuaW1wb3J0IHtcbiAgVXRpbGl0aWVzXG59IGZyb20gXCIuL1V0aWxpdGllc1wiO1xuLyoqXG4gKlxuICpcbiAqIEBjbGFzcyBTcGluYWxFbmRwb2ludFxuICogQGV4dGVuZHMge01vZGVsfVxuICovXG5jbGFzcyBTcGluYWxFbmRwb2ludCBleHRlbmRzIGdsb2JhbFR5cGUuTW9kZWwge1xuICAvKipcbiAgICpDcmVhdGVzIGFuIGluc3RhbmNlIG9mIFNwaW5hbEVuZHBvaW50LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gW19uYW1lPVwiXCJdXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbcGF0aD1cIlwiXVxuICAgKiBAcGFyYW0ge251bWJlcn0gW2N1cnJlbnRWYWx1ZT0wXVxuICAgKiBAcGFyYW0ge3N0cmluZ30gW3VuaXQ9XCJcIl1cbiAgICogQHBhcmFtIHtzdHJpbmd9IFtkYXRhVHlwZT1cIk51bGxcIl1cbiAgICogQHBhcmFtIHtPYmp9IFtzZXVpbE1pbj17dmFsdWU6IDAsYWN0aXZlIDogZmFsc2V9XVxuICAgKiBAcGFyYW0ge09ian0gW3NldWlsTWF4PXt2YWx1ZTowLGFjdGl2ZTogZmFsc2V9XVxuICAgKiBAcGFyYW0ge3N0cmluZ30gW2RhdGFOYXR1cmU9XCJcIl0gZXhhbXBsZSA6IHRlbXBlcmF0dXJlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbbmFtZT1cIlNwaW5hbEVuZHBvaW50XCJdXG4gICAqIEBtZW1iZXJvZiBTcGluYWxFbmRwb2ludFxuICAgKi9cbiAgY29uc3RydWN0b3IoX25hbWUgPSBcIlwiLCBwYXRoID0gXCJcIiwgY3VycmVudFZhbHVlID0gMCwgdW5pdCA9IFwiXCIsIGRhdGFUeXBlLFxuICAgIG1pbiA9XG4gICAgMCxcbiAgICBtYXggPVxuICAgIDAsXG4gICAgZGF0YU5hdHVyZSA9IFwiXCIsXG4gICAgbmFtZSA9XG4gICAgXCJTcGluYWxFbmRwb2ludFwiKSB7XG4gICAgc3VwZXIoKTtcbiAgICBpZiAoRmlsZVN5c3RlbS5fc2lnX3NlcnZlcikge1xuICAgICAgdGhpcy5hZGRfYXR0cih7XG4gICAgICAgIGlkOiBVdGlsaXRpZXMuZ3VpZCh0aGlzLmNvbnN0cnVjdG9yLm5hbWUpLFxuICAgICAgICBuYW1lOiBfbmFtZSxcbiAgICAgICAgcGF0aDogcGF0aCxcbiAgICAgICAgY3VycmVudFZhbHVlOiBjdXJyZW50VmFsdWUsXG4gICAgICAgIHVuaXQ6IHVuaXQsXG4gICAgICAgIGRhdGFUeXBlOiBuZXcgQ2hvaWNlKDAsIFtcIk51bGxcIiwgXCJCb29sZWFuXCIsIFwiVW5zaWduZWRcIixcbiAgICAgICAgICBcIlVuc2lnbmVkOFwiLCBcIlVuc2lnbmVkMTZcIiwgXCJVbnNpZ25lZDMyXCIsIFwiSW50ZWdlclwiLFxuICAgICAgICAgIFwiSW50ZWdlcjE2XCIsIFwiUmVhbFwiLCBcIkRvdWJsZVwiLCBcIk9jdGV0U3RyaW5nXCIsXG4gICAgICAgICAgXCJDaGFyYWN0ZXJTdHJpbmdcIiwgXCJCaXRTdHJpbmdcIiwgXCJFbnVtZXJhdGVkXCIsIFwiRGF0ZVwiLFxuICAgICAgICAgIFwiVGltZVwiLCBcIkFycmF5XCIsIFwiRGF0ZVRpbWVcIiwgXCJMb25nXCIsIFwiU3RyaW5nXCIsIFwiRHVyYXRpb25cIlxuICAgICAgICBdKSxcbiAgICAgICAgc2V1aWxNaW46IHtcbiAgICAgICAgICB2YWx1ZTogbWluLFxuICAgICAgICAgIGFjdGl2ZTogZmFsc2VcbiAgICAgICAgfSxcbiAgICAgICAgc2V1aWxNYXg6IHtcbiAgICAgICAgICB2YWx1ZTogbWF4LFxuICAgICAgICAgIGFjdGl2ZTogZmFsc2VcbiAgICAgICAgfSxcbiAgICAgICAgZGF0YU5hdHVyZTogZGF0YU5hdHVyZVxuICAgICAgfSk7XG4gICAgICBpZiAodHlwZW9mIGRhdGFUeXBlICE9PSBcInVuZGVmaW5lZFwiKVxuICAgICAgICB0aGlzLmRhdGFUeXBlLnNldChkYXRhVHlwZSk7XG4gICAgfVxuICB9XG59XG5leHBvcnQgZGVmYXVsdCBTcGluYWxFbmRwb2ludDtcbnNwaW5hbENvcmUucmVnaXN0ZXJfbW9kZWxzKFtTcGluYWxFbmRwb2ludF0pIl19