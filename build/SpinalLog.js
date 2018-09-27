"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Utilities = require("./Utilities");

var _SpinalEndpoint = require("./SpinalEndpoint");

var _SpinalEndpoint2 = _interopRequireDefault(_SpinalEndpoint);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const spinalCore = require("spinal-core-connectorjs");
const globalType = typeof window === "undefined" ? global : window;

/**
 * @class SpinalLog
 * @extends {Model}
 */
class SpinalLog extends globalType.Model {
  /**
   * 
   * @param {string} endpointName 
   * @param {string} type 
   * @param {string} user 
   * @param {string} message 
   * @param {SpinalEndpoint} endpointNode 
   * @param {number} value 
   */
  constructor(endpointName, type, user, message, endpointNode, value) {
    super();
    this.add_attr({
      id: _Utilities.Utilities.guid(type),
      name: endpointName,
      type: (() => {
        if (type == "min") return "SpinalThresholdMin";
        return "SpinalThresholdMax";
      })(),
      date_begin: Date.now(),
      date_end: Date.now(),
      user: user,
      message: message,
      value: value,
      endpoint: new Ptr(endpointNode)

    });
  }
}

exports.default = SpinalLog;

spinalCore.register_models([SpinalLog]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TcGluYWxMb2cuanMiXSwibmFtZXMiOlsic3BpbmFsQ29yZSIsInJlcXVpcmUiLCJnbG9iYWxUeXBlIiwid2luZG93IiwiZ2xvYmFsIiwiU3BpbmFsTG9nIiwiTW9kZWwiLCJjb25zdHJ1Y3RvciIsImVuZHBvaW50TmFtZSIsInR5cGUiLCJ1c2VyIiwibWVzc2FnZSIsImVuZHBvaW50Tm9kZSIsInZhbHVlIiwiYWRkX2F0dHIiLCJpZCIsIlV0aWxpdGllcyIsImd1aWQiLCJuYW1lIiwiZGF0ZV9iZWdpbiIsIkRhdGUiLCJub3ciLCJkYXRlX2VuZCIsImVuZHBvaW50IiwiUHRyIiwicmVnaXN0ZXJfbW9kZWxzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFFQTs7QUFHQTs7Ozs7O0FBTEEsTUFBTUEsYUFBYUMsUUFBUSx5QkFBUixDQUFuQjtBQUNBLE1BQU1DLGFBQWEsT0FBT0MsTUFBUCxLQUFrQixXQUFsQixHQUFnQ0MsTUFBaEMsR0FBeUNELE1BQTVEOztBQUtBOzs7O0FBSUEsTUFBTUUsU0FBTixTQUF3QkgsV0FBV0ksS0FBbkMsQ0FBeUM7QUFDdkM7Ozs7Ozs7OztBQVNBQyxjQUFZQyxZQUFaLEVBQTBCQyxJQUExQixFQUFnQ0MsSUFBaEMsRUFBc0NDLE9BQXRDLEVBQStDQyxZQUEvQyxFQUE2REMsS0FBN0QsRUFBb0U7QUFDbEU7QUFDQSxTQUFLQyxRQUFMLENBQWM7QUFDWkMsVUFBSUMscUJBQVVDLElBQVYsQ0FBZVIsSUFBZixDQURRO0FBRVpTLFlBQU1WLFlBRk07QUFHWkMsWUFBTSxDQUFDLE1BQU07QUFDWCxZQUFJQSxRQUFRLEtBQVosRUFDRSxPQUFPLG9CQUFQO0FBQ0YsZUFBTyxvQkFBUDtBQUNELE9BSkssR0FITTtBQVFaVSxrQkFBWUMsS0FBS0MsR0FBTCxFQVJBO0FBU1pDLGdCQUFVRixLQUFLQyxHQUFMLEVBVEU7QUFVWlgsWUFBTUEsSUFWTTtBQVdaQyxlQUFTQSxPQVhHO0FBWVpFLGFBQU9BLEtBWks7QUFhWlUsZ0JBQVUsSUFBSUMsR0FBSixDQUFRWixZQUFSOztBQWJFLEtBQWQ7QUFnQkQ7QUE1QnNDOztrQkErQjFCUCxTOztBQUNmTCxXQUFXeUIsZUFBWCxDQUEyQixDQUFDcEIsU0FBRCxDQUEzQiIsImZpbGUiOiJTcGluYWxMb2cuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBzcGluYWxDb3JlID0gcmVxdWlyZShcInNwaW5hbC1jb3JlLWNvbm5lY3RvcmpzXCIpO1xuY29uc3QgZ2xvYmFsVHlwZSA9IHR5cGVvZiB3aW5kb3cgPT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB3aW5kb3c7XG5pbXBvcnQge1xuICBVdGlsaXRpZXNcbn0gZnJvbSBcIi4vVXRpbGl0aWVzXCI7XG5pbXBvcnQgU3BpbmFsRW5kcG9pbnQgZnJvbSBcIi4vU3BpbmFsRW5kcG9pbnRcIjtcbi8qKlxuICogQGNsYXNzIFNwaW5hbExvZ1xuICogQGV4dGVuZHMge01vZGVsfVxuICovXG5jbGFzcyBTcGluYWxMb2cgZXh0ZW5kcyBnbG9iYWxUeXBlLk1vZGVsIHtcbiAgLyoqXG4gICAqIFxuICAgKiBAcGFyYW0ge3N0cmluZ30gZW5kcG9pbnROYW1lIFxuICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVzZXIgXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIFxuICAgKiBAcGFyYW0ge1NwaW5hbEVuZHBvaW50fSBlbmRwb2ludE5vZGUgXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSBcbiAgICovXG4gIGNvbnN0cnVjdG9yKGVuZHBvaW50TmFtZSwgdHlwZSwgdXNlciwgbWVzc2FnZSwgZW5kcG9pbnROb2RlLCB2YWx1ZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5hZGRfYXR0cih7XG4gICAgICBpZDogVXRpbGl0aWVzLmd1aWQodHlwZSksXG4gICAgICBuYW1lOiBlbmRwb2ludE5hbWUsXG4gICAgICB0eXBlOiAoKCkgPT4ge1xuICAgICAgICBpZiAodHlwZSA9PSBcIm1pblwiKVxuICAgICAgICAgIHJldHVybiBcIlNwaW5hbFRocmVzaG9sZE1pblwiO1xuICAgICAgICByZXR1cm4gXCJTcGluYWxUaHJlc2hvbGRNYXhcIjtcbiAgICAgIH0pKCksXG4gICAgICBkYXRlX2JlZ2luOiBEYXRlLm5vdygpLFxuICAgICAgZGF0ZV9lbmQ6IERhdGUubm93KCksXG4gICAgICB1c2VyOiB1c2VyLFxuICAgICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgIGVuZHBvaW50OiBuZXcgUHRyKGVuZHBvaW50Tm9kZSlcblxuICAgIH0pXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU3BpbmFsTG9nO1xuc3BpbmFsQ29yZS5yZWdpc3Rlcl9tb2RlbHMoW1NwaW5hbExvZ10pOyJdfQ==