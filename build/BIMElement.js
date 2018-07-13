"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
const spinalCore = require("spinal-core-connectorjs");
const globalType = typeof window === "undefined" ? global : window;
const BIMForge = require("spinal-models-bim_forge");

class BIMElement extends BIMForge.SpinalBIMObjectForge {
  constructor(_id, _name, _type, name = "BIMElement") {
    super(_id, _name, 0);
    if (FileSystem._sig_server) {
      this.add_attr({
        type: _type || ""
      });
    }
    // this.name = _name;
    // this.mod_attr('id', this.guid())
  }

  // guid() {
  //   return (
  //     this.constructor.name +
  //     "-" +
  //     this.s4() +
  //     this.s4() +
  //     "-" +
  //     this.s4() +
  //     "-" +
  //     this.s4() +
  //     "-" +
  //     this.s4() +
  //     "-" +
  //     this.s4() +
  //     this.s4() +
  //     this.s4() +
  //     "-" +
  //     Date.now().toString(16)
  //   );
  // }

  // s4() {
  //   return Math.floor((1 + Math.random()) * 0x10000)
  //     .toString(16)
  //     .substring(1);
  // }

  setName(_name) {
    this.name.set(_name);
  }

}

exports.default = BIMElement;
spinalCore.register_models([BIMElement]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9CSU1FbGVtZW50LmpzIl0sIm5hbWVzIjpbInNwaW5hbENvcmUiLCJyZXF1aXJlIiwiZ2xvYmFsVHlwZSIsIndpbmRvdyIsImdsb2JhbCIsIkJJTUZvcmdlIiwiQklNRWxlbWVudCIsIlNwaW5hbEJJTU9iamVjdEZvcmdlIiwiY29uc3RydWN0b3IiLCJfaWQiLCJfbmFtZSIsIl90eXBlIiwibmFtZSIsIkZpbGVTeXN0ZW0iLCJfc2lnX3NlcnZlciIsImFkZF9hdHRyIiwidHlwZSIsInNldE5hbWUiLCJzZXQiLCJyZWdpc3Rlcl9tb2RlbHMiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsTUFBTUEsYUFBYUMsUUFBUSx5QkFBUixDQUFuQjtBQUNBLE1BQU1DLGFBQWEsT0FBT0MsTUFBUCxLQUFrQixXQUFsQixHQUFnQ0MsTUFBaEMsR0FBeUNELE1BQTVEO0FBQ0EsTUFBTUUsV0FBV0osUUFBUSx5QkFBUixDQUFqQjs7QUFFZSxNQUFNSyxVQUFOLFNBQXlCRCxTQUFTRSxvQkFBbEMsQ0FBdUQ7QUFDcEVDLGNBQVlDLEdBQVosRUFBaUJDLEtBQWpCLEVBQXdCQyxLQUF4QixFQUErQkMsT0FBTyxZQUF0QyxFQUFvRDtBQUNsRCxVQUFNSCxHQUFOLEVBQVdDLEtBQVgsRUFBa0IsQ0FBbEI7QUFDQSxRQUFJRyxXQUFXQyxXQUFmLEVBQTRCO0FBQzFCLFdBQUtDLFFBQUwsQ0FBYztBQUNaQyxjQUFNTCxTQUFTO0FBREgsT0FBZDtBQUdEO0FBQ0Q7QUFDQTtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQU0sVUFBUVAsS0FBUixFQUFlO0FBQ2IsU0FBS0UsSUFBTCxDQUFVTSxHQUFWLENBQWNSLEtBQWQ7QUFDRDs7QUF6Q21FOztrQkFBakRKLFU7QUE2Q3JCTixXQUFXbUIsZUFBWCxDQUEyQixDQUFDYixVQUFELENBQTNCIiwiZmlsZSI6IkJJTUVsZW1lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBzcGluYWxDb3JlID0gcmVxdWlyZShcInNwaW5hbC1jb3JlLWNvbm5lY3RvcmpzXCIpO1xuY29uc3QgZ2xvYmFsVHlwZSA9IHR5cGVvZiB3aW5kb3cgPT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB3aW5kb3c7XG5jb25zdCBCSU1Gb3JnZSA9IHJlcXVpcmUoXCJzcGluYWwtbW9kZWxzLWJpbV9mb3JnZVwiKTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQklNRWxlbWVudCBleHRlbmRzIEJJTUZvcmdlLlNwaW5hbEJJTU9iamVjdEZvcmdlIHtcbiAgY29uc3RydWN0b3IoX2lkLCBfbmFtZSwgX3R5cGUsIG5hbWUgPSBcIkJJTUVsZW1lbnRcIikge1xuICAgIHN1cGVyKF9pZCwgX25hbWUsIDApO1xuICAgIGlmIChGaWxlU3lzdGVtLl9zaWdfc2VydmVyKSB7XG4gICAgICB0aGlzLmFkZF9hdHRyKHtcbiAgICAgICAgdHlwZTogX3R5cGUgfHwgXCJcIlxuICAgICAgfSk7XG4gICAgfVxuICAgIC8vIHRoaXMubmFtZSA9IF9uYW1lO1xuICAgIC8vIHRoaXMubW9kX2F0dHIoJ2lkJywgdGhpcy5ndWlkKCkpXG4gIH1cblxuICAvLyBndWlkKCkge1xuICAvLyAgIHJldHVybiAoXG4gIC8vICAgICB0aGlzLmNvbnN0cnVjdG9yLm5hbWUgK1xuICAvLyAgICAgXCItXCIgK1xuICAvLyAgICAgdGhpcy5zNCgpICtcbiAgLy8gICAgIHRoaXMuczQoKSArXG4gIC8vICAgICBcIi1cIiArXG4gIC8vICAgICB0aGlzLnM0KCkgK1xuICAvLyAgICAgXCItXCIgK1xuICAvLyAgICAgdGhpcy5zNCgpICtcbiAgLy8gICAgIFwiLVwiICtcbiAgLy8gICAgIHRoaXMuczQoKSArXG4gIC8vICAgICBcIi1cIiArXG4gIC8vICAgICB0aGlzLnM0KCkgK1xuICAvLyAgICAgdGhpcy5zNCgpICtcbiAgLy8gICAgIHRoaXMuczQoKSArXG4gIC8vICAgICBcIi1cIiArXG4gIC8vICAgICBEYXRlLm5vdygpLnRvU3RyaW5nKDE2KVxuICAvLyAgICk7XG4gIC8vIH1cblxuICAvLyBzNCgpIHtcbiAgLy8gICByZXR1cm4gTWF0aC5mbG9vcigoMSArIE1hdGgucmFuZG9tKCkpICogMHgxMDAwMClcbiAgLy8gICAgIC50b1N0cmluZygxNilcbiAgLy8gICAgIC5zdWJzdHJpbmcoMSk7XG4gIC8vIH1cblxuICBzZXROYW1lKF9uYW1lKSB7XG4gICAgdGhpcy5uYW1lLnNldChfbmFtZSlcbiAgfVxuXG59XG5cbnNwaW5hbENvcmUucmVnaXN0ZXJfbW9kZWxzKFtCSU1FbGVtZW50XSkiXX0=