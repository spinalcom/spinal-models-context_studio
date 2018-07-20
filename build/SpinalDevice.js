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
 * @class SpinalDevice
 * @extends {globalType.Model}
 */
class SpinalDevice extends globalType.Model {
  /**
   *Creates an instance of SpinalDevice.
   * @param {string} [name=""] 
   * @param {string} [path=""] 
   * @param {string} [type="Sensor"] - one of ["Sensor", "Router", "Actuator"]
   * @param {string} [protocolType=""] 
   * @param {string} [ipAddress="127.0.0.1"]
   * @param {string} [name="SpinalDevice"]
   * @memberof SpinalDevice
   */
  constructor(_name = "", path = "", type, protocolType, ipAddress = "127.0.0.1", name = "SpinalDevice") {
    super();
    if (FileSystem._sig_server) {
      this.add_attr({
        id: _Utilities.Utilities.guid(this.constructor.name),
        name: _name,
        path: path,
        type: new Choice(0, ["Sensor", "Router", "Actuator"]),
        protocolType: protocolType,
        ipAddress: ipAddress
      });
      if (typeof type !== "undefined") this.type.set(type);
    }
  }

}
exports.default = SpinalDevice;

spinalCore.register_models([SpinalDevice]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TcGluYWxEZXZpY2UuanMiXSwibmFtZXMiOlsic3BpbmFsQ29yZSIsInJlcXVpcmUiLCJnbG9iYWxUeXBlIiwid2luZG93IiwiZ2xvYmFsIiwiU3BpbmFsRGV2aWNlIiwiTW9kZWwiLCJjb25zdHJ1Y3RvciIsIl9uYW1lIiwicGF0aCIsInR5cGUiLCJwcm90b2NvbFR5cGUiLCJpcEFkZHJlc3MiLCJuYW1lIiwiRmlsZVN5c3RlbSIsIl9zaWdfc2VydmVyIiwiYWRkX2F0dHIiLCJpZCIsIlV0aWxpdGllcyIsImd1aWQiLCJDaG9pY2UiLCJzZXQiLCJyZWdpc3Rlcl9tb2RlbHMiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUdBOztBQUhBLE1BQU1BLGFBQWFDLFFBQVEseUJBQVIsQ0FBbkI7QUFDQSxNQUFNQyxhQUFhLE9BQU9DLE1BQVAsS0FBa0IsV0FBbEIsR0FBZ0NDLE1BQWhDLEdBQXlDRCxNQUE1RDs7QUFLQTs7Ozs7O0FBTUEsTUFBTUUsWUFBTixTQUEyQkgsV0FBV0ksS0FBdEMsQ0FBNEM7QUFDMUM7Ozs7Ozs7Ozs7QUFVQUMsY0FBWUMsUUFBUSxFQUFwQixFQUF3QkMsT0FBTyxFQUEvQixFQUFtQ0MsSUFBbkMsRUFBeUNDLFlBQXpDLEVBQXVEQyxZQUNyRCxXQURGLEVBRUVDLE9BQ0EsY0FIRixFQUdrQjtBQUNoQjtBQUNBLFFBQUlDLFdBQVdDLFdBQWYsRUFBNEI7QUFDMUIsV0FBS0MsUUFBTCxDQUFjO0FBQ1pDLFlBQUlDLHFCQUFVQyxJQUFWLENBQWUsS0FBS1osV0FBTCxDQUFpQk0sSUFBaEMsQ0FEUTtBQUVaQSxjQUFNTCxLQUZNO0FBR1pDLGNBQU1BLElBSE07QUFJWkMsY0FBTSxJQUFJVSxNQUFKLENBQVcsQ0FBWCxFQUFjLENBQUMsUUFBRCxFQUFXLFFBQVgsRUFBcUIsVUFBckIsQ0FBZCxDQUpNO0FBS1pULHNCQUFjQSxZQUxGO0FBTVpDLG1CQUFXQTtBQU5DLE9BQWQ7QUFRQSxVQUFJLE9BQU9GLElBQVAsS0FBZ0IsV0FBcEIsRUFDRSxLQUFLQSxJQUFMLENBQVVXLEdBQVYsQ0FBY1gsSUFBZDtBQUNIO0FBQ0Y7O0FBNUJ5QztrQkErQjdCTCxZOztBQUNmTCxXQUFXc0IsZUFBWCxDQUEyQixDQUFDakIsWUFBRCxDQUEzQiIsImZpbGUiOiJTcGluYWxEZXZpY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBzcGluYWxDb3JlID0gcmVxdWlyZShcInNwaW5hbC1jb3JlLWNvbm5lY3RvcmpzXCIpO1xuY29uc3QgZ2xvYmFsVHlwZSA9IHR5cGVvZiB3aW5kb3cgPT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB3aW5kb3c7XG5cbmltcG9ydCB7XG4gIFV0aWxpdGllc1xufSBmcm9tIFwiLi9VdGlsaXRpZXNcIjtcbi8qKlxuICpcbiAqXG4gKiBAY2xhc3MgU3BpbmFsRGV2aWNlXG4gKiBAZXh0ZW5kcyB7Z2xvYmFsVHlwZS5Nb2RlbH1cbiAqL1xuY2xhc3MgU3BpbmFsRGV2aWNlIGV4dGVuZHMgZ2xvYmFsVHlwZS5Nb2RlbCB7XG4gIC8qKlxuICAgKkNyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgU3BpbmFsRGV2aWNlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gW25hbWU9XCJcIl0gXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbcGF0aD1cIlwiXSBcbiAgICogQHBhcmFtIHtzdHJpbmd9IFt0eXBlPVwiU2Vuc29yXCJdIC0gb25lIG9mIFtcIlNlbnNvclwiLCBcIlJvdXRlclwiLCBcIkFjdHVhdG9yXCJdXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbcHJvdG9jb2xUeXBlPVwiXCJdIFxuICAgKiBAcGFyYW0ge3N0cmluZ30gW2lwQWRkcmVzcz1cIjEyNy4wLjAuMVwiXVxuICAgKiBAcGFyYW0ge3N0cmluZ30gW25hbWU9XCJTcGluYWxEZXZpY2VcIl1cbiAgICogQG1lbWJlcm9mIFNwaW5hbERldmljZVxuICAgKi9cbiAgY29uc3RydWN0b3IoX25hbWUgPSBcIlwiLCBwYXRoID0gXCJcIiwgdHlwZSwgcHJvdG9jb2xUeXBlLCBpcEFkZHJlc3MgPVxuICAgIFwiMTI3LjAuMC4xXCIsXG4gICAgbmFtZSA9XG4gICAgXCJTcGluYWxEZXZpY2VcIikge1xuICAgIHN1cGVyKCk7XG4gICAgaWYgKEZpbGVTeXN0ZW0uX3NpZ19zZXJ2ZXIpIHtcbiAgICAgIHRoaXMuYWRkX2F0dHIoe1xuICAgICAgICBpZDogVXRpbGl0aWVzLmd1aWQodGhpcy5jb25zdHJ1Y3Rvci5uYW1lKSxcbiAgICAgICAgbmFtZTogX25hbWUsXG4gICAgICAgIHBhdGg6IHBhdGgsXG4gICAgICAgIHR5cGU6IG5ldyBDaG9pY2UoMCwgW1wiU2Vuc29yXCIsIFwiUm91dGVyXCIsIFwiQWN0dWF0b3JcIl0pLFxuICAgICAgICBwcm90b2NvbFR5cGU6IHByb3RvY29sVHlwZSxcbiAgICAgICAgaXBBZGRyZXNzOiBpcEFkZHJlc3NcbiAgICAgIH0pO1xuICAgICAgaWYgKHR5cGVvZiB0eXBlICE9PSBcInVuZGVmaW5lZFwiKVxuICAgICAgICB0aGlzLnR5cGUuc2V0KHR5cGUpO1xuICAgIH1cbiAgfVxuXG59XG5leHBvcnQgZGVmYXVsdCBTcGluYWxEZXZpY2U7XG5zcGluYWxDb3JlLnJlZ2lzdGVyX21vZGVscyhbU3BpbmFsRGV2aWNlXSkiXX0=