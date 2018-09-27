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
 * @class SpinalLog
 * @extends {Model}
 */
class SpinalLog extends globalType.Model {
  constructor(endpointName, type, user, message, endpointNode) {
    super();
    this.add_attr({
      id: _Utilities.Utilities.guid(type),
      name: endpointName,
      type: (() => {
        if (type == "min") return "SpinalThresholdMin";
        return "SpinalThresholdMax";
      })(),
      user: user,
      message: message,
      endpoint: new Ptr(endpointNode)
    });
  }
}

exports.default = SpinalLog;

spinalCore.register_models([SpinalLog]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TcGluYWxMb2cuanMiXSwibmFtZXMiOlsic3BpbmFsQ29yZSIsInJlcXVpcmUiLCJnbG9iYWxUeXBlIiwid2luZG93IiwiZ2xvYmFsIiwiU3BpbmFsTG9nIiwiTW9kZWwiLCJjb25zdHJ1Y3RvciIsImVuZHBvaW50TmFtZSIsInR5cGUiLCJ1c2VyIiwibWVzc2FnZSIsImVuZHBvaW50Tm9kZSIsImFkZF9hdHRyIiwiaWQiLCJVdGlsaXRpZXMiLCJndWlkIiwibmFtZSIsImVuZHBvaW50IiwiUHRyIiwicmVnaXN0ZXJfbW9kZWxzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFFQTs7QUFGQSxNQUFNQSxhQUFhQyxRQUFRLHlCQUFSLENBQW5CO0FBQ0EsTUFBTUMsYUFBYSxPQUFPQyxNQUFQLEtBQWtCLFdBQWxCLEdBQWdDQyxNQUFoQyxHQUF5Q0QsTUFBNUQ7O0FBSUE7Ozs7OztBQU1BLE1BQU1FLFNBQU4sU0FBd0JILFdBQVdJLEtBQW5DLENBQXlDO0FBQ3ZDQyxjQUFZQyxZQUFaLEVBQTBCQyxJQUExQixFQUFnQ0MsSUFBaEMsRUFBc0NDLE9BQXRDLEVBQStDQyxZQUEvQyxFQUE2RDtBQUMzRDtBQUNBLFNBQUtDLFFBQUwsQ0FBYztBQUNaQyxVQUFJQyxxQkFBVUMsSUFBVixDQUFlUCxJQUFmLENBRFE7QUFFWlEsWUFBTVQsWUFGTTtBQUdaQyxZQUFNLENBQUMsTUFBTTtBQUNYLFlBQUlBLFFBQVEsS0FBWixFQUNFLE9BQU8sb0JBQVA7QUFDRixlQUFPLG9CQUFQO0FBQ0QsT0FKSyxHQUhNO0FBUVpDLFlBQU1BLElBUk07QUFTWkMsZUFBU0EsT0FURztBQVVaTyxnQkFBVSxJQUFJQyxHQUFKLENBQVFQLFlBQVI7QUFWRSxLQUFkO0FBWUQ7QUFmc0M7O2tCQWtCMUJQLFM7O0FBQ2ZMLFdBQVdvQixlQUFYLENBQTJCLENBQUNmLFNBQUQsQ0FBM0IiLCJmaWxlIjoiU3BpbmFsTG9nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3Qgc3BpbmFsQ29yZSA9IHJlcXVpcmUoXCJzcGluYWwtY29yZS1jb25uZWN0b3Jqc1wiKTtcbmNvbnN0IGdsb2JhbFR5cGUgPSB0eXBlb2Ygd2luZG93ID09PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogd2luZG93O1xuaW1wb3J0IHtcbiAgVXRpbGl0aWVzXG59IGZyb20gXCIuL1V0aWxpdGllc1wiO1xuLyoqXG4gKlxuICpcbiAqIEBjbGFzcyBTcGluYWxMb2dcbiAqIEBleHRlbmRzIHtNb2RlbH1cbiAqL1xuY2xhc3MgU3BpbmFsTG9nIGV4dGVuZHMgZ2xvYmFsVHlwZS5Nb2RlbCB7XG4gIGNvbnN0cnVjdG9yKGVuZHBvaW50TmFtZSwgdHlwZSwgdXNlciwgbWVzc2FnZSwgZW5kcG9pbnROb2RlKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmFkZF9hdHRyKHtcbiAgICAgIGlkOiBVdGlsaXRpZXMuZ3VpZCh0eXBlKSxcbiAgICAgIG5hbWU6IGVuZHBvaW50TmFtZSxcbiAgICAgIHR5cGU6ICgoKSA9PiB7XG4gICAgICAgIGlmICh0eXBlID09IFwibWluXCIpXG4gICAgICAgICAgcmV0dXJuIFwiU3BpbmFsVGhyZXNob2xkTWluXCI7XG4gICAgICAgIHJldHVybiBcIlNwaW5hbFRocmVzaG9sZE1heFwiO1xuICAgICAgfSkoKSxcbiAgICAgIHVzZXI6IHVzZXIsXG4gICAgICBtZXNzYWdlOiBtZXNzYWdlLFxuICAgICAgZW5kcG9pbnQ6IG5ldyBQdHIoZW5kcG9pbnROb2RlKVxuICAgIH0pXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU3BpbmFsTG9nO1xuc3BpbmFsQ29yZS5yZWdpc3Rlcl9tb2RlbHMoW1NwaW5hbExvZ10pOyJdfQ==