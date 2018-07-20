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
 * @class SpinalNetwork
 * @extends {globalType.Model}
 */
class SpinalNetwork extends globalType.Model {
  /**
   *Creates an instance of SpinalNetwork.
   * @param {string} [_name=""]
   * @param {string} [type=""]
   * @param {string} [host=""]
   * @param {string} [user=""]
   * @param {string} [password=""]
   * @param {Model} [options=new Ptr(0)] - mod_attr to change it
   * @param {string} [name="SpinalNetwork"]
   * @memberof SpinalNetwork
   */
  constructor(_name = "", type = "", host = "", user = "", password = "", options = new Ptr(0), name = "SpinalNetwork") {
    super();
    if (FileSystem._sig_server) {
      this.add_attr({
        id: _Utilities.Utilities.guid(this.constructor.name),
        name: _name,
        type: type,
        host: host,
        user: user,
        password: password,
        options: options
      });
    }
  }

}
exports.default = SpinalNetwork;

spinalCore.register_models([SpinalNetwork]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TcGluYWxOZXR3b3JrLmpzIl0sIm5hbWVzIjpbInNwaW5hbENvcmUiLCJyZXF1aXJlIiwiZ2xvYmFsVHlwZSIsIndpbmRvdyIsImdsb2JhbCIsIlNwaW5hbE5ldHdvcmsiLCJNb2RlbCIsImNvbnN0cnVjdG9yIiwiX25hbWUiLCJ0eXBlIiwiaG9zdCIsInVzZXIiLCJwYXNzd29yZCIsIm9wdGlvbnMiLCJQdHIiLCJuYW1lIiwiRmlsZVN5c3RlbSIsIl9zaWdfc2VydmVyIiwiYWRkX2F0dHIiLCJpZCIsIlV0aWxpdGllcyIsImd1aWQiLCJyZWdpc3Rlcl9tb2RlbHMiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUlBOztBQUpBLE1BQU1BLGFBQWFDLFFBQVEseUJBQVIsQ0FBbkI7QUFDQSxNQUFNQyxhQUFhLE9BQU9DLE1BQVAsS0FBa0IsV0FBbEIsR0FBZ0NDLE1BQWhDLEdBQXlDRCxNQUE1RDs7QUFNQTs7Ozs7O0FBTUEsTUFBTUUsYUFBTixTQUE0QkgsV0FBV0ksS0FBdkMsQ0FBNkM7QUFDM0M7Ozs7Ozs7Ozs7O0FBV0FDLGNBQVlDLFFBQVEsRUFBcEIsRUFBd0JDLE9BQU8sRUFBL0IsRUFBbUNDLE9BQU8sRUFBMUMsRUFBOENDLE9BQU8sRUFBckQsRUFBeURDLFdBQVcsRUFBcEUsRUFDRUMsVUFBVSxJQUFJQyxHQUFKLENBQVEsQ0FBUixDQURaLEVBQ3dCQyxPQUN0QixlQUZGLEVBRW1CO0FBQ2pCO0FBQ0EsUUFBSUMsV0FBV0MsV0FBZixFQUE0QjtBQUMxQixXQUFLQyxRQUFMLENBQWM7QUFDWkMsWUFBSUMscUJBQVVDLElBQVYsQ0FBZSxLQUFLZCxXQUFMLENBQWlCUSxJQUFoQyxDQURRO0FBRVpBLGNBQU1QLEtBRk07QUFHWkMsY0FBTUEsSUFITTtBQUlaQyxjQUFNQSxJQUpNO0FBS1pDLGNBQU1BLElBTE07QUFNWkMsa0JBQVVBLFFBTkU7QUFPWkMsaUJBQVNBO0FBUEcsT0FBZDtBQVNEO0FBQ0Y7O0FBM0IwQztrQkE4QjlCUixhOztBQUNmTCxXQUFXc0IsZUFBWCxDQUEyQixDQUFDakIsYUFBRCxDQUEzQiIsImZpbGUiOiJTcGluYWxOZXR3b3JrLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3Qgc3BpbmFsQ29yZSA9IHJlcXVpcmUoXCJzcGluYWwtY29yZS1jb25uZWN0b3Jqc1wiKTtcbmNvbnN0IGdsb2JhbFR5cGUgPSB0eXBlb2Ygd2luZG93ID09PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogd2luZG93O1xuXG5cbmltcG9ydCB7XG4gIFV0aWxpdGllc1xufSBmcm9tIFwiLi9VdGlsaXRpZXNcIjtcbi8qKlxuICpcbiAqXG4gKiBAY2xhc3MgU3BpbmFsTmV0d29ya1xuICogQGV4dGVuZHMge2dsb2JhbFR5cGUuTW9kZWx9XG4gKi9cbmNsYXNzIFNwaW5hbE5ldHdvcmsgZXh0ZW5kcyBnbG9iYWxUeXBlLk1vZGVsIHtcbiAgLyoqXG4gICAqQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBTcGluYWxOZXR3b3JrLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gW19uYW1lPVwiXCJdXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbdHlwZT1cIlwiXVxuICAgKiBAcGFyYW0ge3N0cmluZ30gW2hvc3Q9XCJcIl1cbiAgICogQHBhcmFtIHtzdHJpbmd9IFt1c2VyPVwiXCJdXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbcGFzc3dvcmQ9XCJcIl1cbiAgICogQHBhcmFtIHtNb2RlbH0gW29wdGlvbnM9bmV3IFB0cigwKV0gLSBtb2RfYXR0ciB0byBjaGFuZ2UgaXRcbiAgICogQHBhcmFtIHtzdHJpbmd9IFtuYW1lPVwiU3BpbmFsTmV0d29ya1wiXVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTmV0d29ya1xuICAgKi9cbiAgY29uc3RydWN0b3IoX25hbWUgPSBcIlwiLCB0eXBlID0gXCJcIiwgaG9zdCA9IFwiXCIsIHVzZXIgPSBcIlwiLCBwYXNzd29yZCA9IFwiXCIsXG4gICAgb3B0aW9ucyA9IG5ldyBQdHIoMCksIG5hbWUgPVxuICAgIFwiU3BpbmFsTmV0d29ya1wiKSB7XG4gICAgc3VwZXIoKTtcbiAgICBpZiAoRmlsZVN5c3RlbS5fc2lnX3NlcnZlcikge1xuICAgICAgdGhpcy5hZGRfYXR0cih7XG4gICAgICAgIGlkOiBVdGlsaXRpZXMuZ3VpZCh0aGlzLmNvbnN0cnVjdG9yLm5hbWUpLFxuICAgICAgICBuYW1lOiBfbmFtZSxcbiAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgaG9zdDogaG9zdCxcbiAgICAgICAgdXNlcjogdXNlcixcbiAgICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkLFxuICAgICAgICBvcHRpb25zOiBvcHRpb25zXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxufVxuZXhwb3J0IGRlZmF1bHQgU3BpbmFsTmV0d29yaztcbnNwaW5hbENvcmUucmVnaXN0ZXJfbW9kZWxzKFtTcGluYWxOZXR3b3JrXSkiXX0=