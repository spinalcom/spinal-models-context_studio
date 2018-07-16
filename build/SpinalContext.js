"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Utilities = require("./Utilities");

const spinalCore = require("spinal-core-connectorjs");
const globalType = typeof window === "undefined" ? global : window;
let getViewer = function () {
  return globalType.v;
};

class SpinalContext extends globalType.Model {
  constructor(_name, _usedRelations, _startingNode, _usedGraph, name = "SpinalContext") {
    super();
    if (FileSystem._sig_server) {
      this.add_attr({
        id: _Utilities.Utilities.guid(this.constructor.name),
        name: _name || "",
        usedRelations: _usedRelations || new Lst(),
        startingNode: _startingNode,
        usedGraph: _usedGraph,
        contextImage: new Lst()
      });
    }
  }
}

exports.default = SpinalContext;
spinalCore.register_models([SpinalContext]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TcGluYWxDb250ZXh0LmpzIl0sIm5hbWVzIjpbInNwaW5hbENvcmUiLCJyZXF1aXJlIiwiZ2xvYmFsVHlwZSIsIndpbmRvdyIsImdsb2JhbCIsImdldFZpZXdlciIsInYiLCJTcGluYWxDb250ZXh0IiwiTW9kZWwiLCJjb25zdHJ1Y3RvciIsIl9uYW1lIiwiX3VzZWRSZWxhdGlvbnMiLCJfc3RhcnRpbmdOb2RlIiwiX3VzZWRHcmFwaCIsIm5hbWUiLCJGaWxlU3lzdGVtIiwiX3NpZ19zZXJ2ZXIiLCJhZGRfYXR0ciIsImlkIiwiVXRpbGl0aWVzIiwiZ3VpZCIsInVzZWRSZWxhdGlvbnMiLCJMc3QiLCJzdGFydGluZ05vZGUiLCJ1c2VkR3JhcGgiLCJjb250ZXh0SW1hZ2UiLCJyZWdpc3Rlcl9tb2RlbHMiXSwibWFwcGluZ3MiOiI7Ozs7OztBQU1BOztBQU5BLE1BQU1BLGFBQWFDLFFBQVEseUJBQVIsQ0FBbkI7QUFDQSxNQUFNQyxhQUFhLE9BQU9DLE1BQVAsS0FBa0IsV0FBbEIsR0FBZ0NDLE1BQWhDLEdBQXlDRCxNQUE1RDtBQUNBLElBQUlFLFlBQVksWUFBVztBQUN6QixTQUFPSCxXQUFXSSxDQUFsQjtBQUNELENBRkQ7O0FBUWUsTUFBTUMsYUFBTixTQUE0QkwsV0FBV00sS0FBdkMsQ0FBNkM7QUFDMURDLGNBQVlDLEtBQVosRUFBbUJDLGNBQW5CLEVBQW1DQyxhQUFuQyxFQUFrREMsVUFBbEQsRUFBOERDLE9BQzVELGVBREYsRUFDbUI7QUFDakI7QUFDQSxRQUFJQyxXQUFXQyxXQUFmLEVBQTRCO0FBQzFCLFdBQUtDLFFBQUwsQ0FBYztBQUNaQyxZQUFJQyxxQkFBVUMsSUFBVixDQUFlLEtBQUtYLFdBQUwsQ0FBaUJLLElBQWhDLENBRFE7QUFFWkEsY0FBTUosU0FBUyxFQUZIO0FBR1pXLHVCQUFlVixrQkFBa0IsSUFBSVcsR0FBSixFQUhyQjtBQUlaQyxzQkFBY1gsYUFKRjtBQUtaWSxtQkFBV1gsVUFMQztBQU1aWSxzQkFBYyxJQUFJSCxHQUFKO0FBTkYsT0FBZDtBQVFEO0FBQ0Y7QUFkeUQ7O2tCQUF2Q2YsYTtBQWlCckJQLFdBQVcwQixlQUFYLENBQTJCLENBQUNuQixhQUFELENBQTNCIiwiZmlsZSI6IlNwaW5hbENvbnRleHQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBzcGluYWxDb3JlID0gcmVxdWlyZShcInNwaW5hbC1jb3JlLWNvbm5lY3RvcmpzXCIpO1xuY29uc3QgZ2xvYmFsVHlwZSA9IHR5cGVvZiB3aW5kb3cgPT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB3aW5kb3c7XG5sZXQgZ2V0Vmlld2VyID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBnbG9iYWxUeXBlLnY7XG59O1xuXG5pbXBvcnQge1xuICBVdGlsaXRpZXNcbn0gZnJvbSBcIi4vVXRpbGl0aWVzXCJcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3BpbmFsQ29udGV4dCBleHRlbmRzIGdsb2JhbFR5cGUuTW9kZWwge1xuICBjb25zdHJ1Y3RvcihfbmFtZSwgX3VzZWRSZWxhdGlvbnMsIF9zdGFydGluZ05vZGUsIF91c2VkR3JhcGgsIG5hbWUgPVxuICAgIFwiU3BpbmFsQ29udGV4dFwiKSB7XG4gICAgc3VwZXIoKTtcbiAgICBpZiAoRmlsZVN5c3RlbS5fc2lnX3NlcnZlcikge1xuICAgICAgdGhpcy5hZGRfYXR0cih7XG4gICAgICAgIGlkOiBVdGlsaXRpZXMuZ3VpZCh0aGlzLmNvbnN0cnVjdG9yLm5hbWUpLFxuICAgICAgICBuYW1lOiBfbmFtZSB8fCBcIlwiLFxuICAgICAgICB1c2VkUmVsYXRpb25zOiBfdXNlZFJlbGF0aW9ucyB8fCBuZXcgTHN0KCksXG4gICAgICAgIHN0YXJ0aW5nTm9kZTogX3N0YXJ0aW5nTm9kZSxcbiAgICAgICAgdXNlZEdyYXBoOiBfdXNlZEdyYXBoLFxuICAgICAgICBjb250ZXh0SW1hZ2U6IG5ldyBMc3QoKVxuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG5cbnNwaW5hbENvcmUucmVnaXN0ZXJfbW9kZWxzKFtTcGluYWxDb250ZXh0XSk7Il19