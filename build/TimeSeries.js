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
 * @class TimeSeries
 * @extends {Model}
 */
class TimeSeries extends globalType.Model {
  /**
   *Creates an instance of TimeSeries.
   * @param {string} [_name="5 minutes"]
   * @param {number} [windowSize=60]
   * @param {number} [frequence=5] - in second
   * @param {Lst} [history=new Lst()]
   * @param {Lst} [historyDate=new Lst()]
   * @memberof TimeSeries
   */
  constructor(_name = "5 minutes", windowSize = 60, frequence = 5, // in s
  history = new Lst(), historyDate = new Lst(), name = "TimeSeries") {
    super();
    if (FileSystem._sig_server) {
      this.add_attr({
        id: _Utilities.Utilities.guid(this.constructor.name),
        name: _name,
        windowSize: windowSize,
        frequence: frequence,
        history: history,
        historyDate: historyDate
      });
    }
  }

  addToHistory(value) {
    if (this.history.length >= this.windowSize) {
      this.history.splice(0, 1);
      this.historyDate.splice(0, 1);
    }

    this.history.push(value);
    this.historyDate.push(this.getDate());
  }

  getDate() {
    var t = new Date();
    return t.getFullYear() + "-" + (t.getMonth() + 1) + "-" + t.getDate() + " " + t.getHours() + ":" + t.getMinutes() + ":" + t.getSeconds();
  }
}
exports.default = TimeSeries;

spinalCore.register_models([TimeSeries]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9UaW1lU2VyaWVzLmpzIl0sIm5hbWVzIjpbInNwaW5hbENvcmUiLCJyZXF1aXJlIiwiZ2xvYmFsVHlwZSIsIndpbmRvdyIsImdsb2JhbCIsIlRpbWVTZXJpZXMiLCJNb2RlbCIsImNvbnN0cnVjdG9yIiwiX25hbWUiLCJ3aW5kb3dTaXplIiwiZnJlcXVlbmNlIiwiaGlzdG9yeSIsIkxzdCIsImhpc3RvcnlEYXRlIiwibmFtZSIsIkZpbGVTeXN0ZW0iLCJfc2lnX3NlcnZlciIsImFkZF9hdHRyIiwiaWQiLCJVdGlsaXRpZXMiLCJndWlkIiwiYWRkVG9IaXN0b3J5IiwidmFsdWUiLCJsZW5ndGgiLCJzcGxpY2UiLCJwdXNoIiwiZ2V0RGF0ZSIsInQiLCJEYXRlIiwiZ2V0RnVsbFllYXIiLCJnZXRNb250aCIsImdldEhvdXJzIiwiZ2V0TWludXRlcyIsImdldFNlY29uZHMiLCJyZWdpc3Rlcl9tb2RlbHMiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUVBOztBQUZBLE1BQU1BLGFBQWFDLFFBQVEseUJBQVIsQ0FBbkI7QUFDQSxNQUFNQyxhQUFhLE9BQU9DLE1BQVAsS0FBa0IsV0FBbEIsR0FBZ0NDLE1BQWhDLEdBQXlDRCxNQUE1RDs7QUFJQTs7Ozs7O0FBTUEsTUFBTUUsVUFBTixTQUF5QkgsV0FBV0ksS0FBcEMsQ0FBMEM7QUFDeEM7Ozs7Ozs7OztBQVNBQyxjQUNFQyxRQUFRLFdBRFYsRUFFRUMsYUFBYSxFQUZmLEVBR0VDLFlBQVksQ0FIZCxFQUdpQjtBQUNmQyxZQUFVLElBQUlDLEdBQUosRUFKWixFQUtFQyxjQUFjLElBQUlELEdBQUosRUFMaEIsRUFNRUUsT0FBTyxZQU5ULEVBT0U7QUFDQTtBQUNBLFFBQUlDLFdBQVdDLFdBQWYsRUFBNEI7QUFDMUIsV0FBS0MsUUFBTCxDQUFjO0FBQ1pDLFlBQUlDLHFCQUFVQyxJQUFWLENBQWUsS0FBS2IsV0FBTCxDQUFpQk8sSUFBaEMsQ0FEUTtBQUVaQSxjQUFNTixLQUZNO0FBR1pDLG9CQUFZQSxVQUhBO0FBSVpDLG1CQUFXQSxTQUpDO0FBS1pDLGlCQUFTQSxPQUxHO0FBTVpFLHFCQUFhQTtBQU5ELE9BQWQ7QUFRRDtBQUNGOztBQUVEUSxlQUFhQyxLQUFiLEVBQW9CO0FBQ2xCLFFBQUksS0FBS1gsT0FBTCxDQUFhWSxNQUFiLElBQXVCLEtBQUtkLFVBQWhDLEVBQTRDO0FBQzFDLFdBQUtFLE9BQUwsQ0FBYWEsTUFBYixDQUFvQixDQUFwQixFQUF1QixDQUF2QjtBQUNBLFdBQUtYLFdBQUwsQ0FBaUJXLE1BQWpCLENBQXdCLENBQXhCLEVBQTJCLENBQTNCO0FBQ0Q7O0FBRUQsU0FBS2IsT0FBTCxDQUFhYyxJQUFiLENBQWtCSCxLQUFsQjtBQUNBLFNBQUtULFdBQUwsQ0FBaUJZLElBQWpCLENBQXNCLEtBQUtDLE9BQUwsRUFBdEI7QUFFRDs7QUFFREEsWUFBVTtBQUNSLFFBQUlDLElBQUksSUFBSUMsSUFBSixFQUFSO0FBQ0EsV0FBT0QsRUFBRUUsV0FBRixLQUFrQixHQUFsQixJQUF5QkYsRUFBRUcsUUFBRixLQUFlLENBQXhDLElBQTZDLEdBQTdDLEdBQW1ESCxFQUFFRCxPQUFGLEVBQW5ELEdBQ0wsR0FESyxHQUNDQyxFQUFFSSxRQUFGLEVBREQsR0FDZ0IsR0FEaEIsR0FDc0JKLEVBQUVLLFVBQUYsRUFEdEIsR0FDdUMsR0FEdkMsR0FDNkNMLEVBQUVNLFVBQUYsRUFEcEQ7QUFFRDtBQTlDdUM7a0JBZ0QzQjVCLFU7O0FBQ2ZMLFdBQVdrQyxlQUFYLENBQTJCLENBQUM3QixVQUFELENBQTNCIiwiZmlsZSI6IlRpbWVTZXJpZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBzcGluYWxDb3JlID0gcmVxdWlyZShcInNwaW5hbC1jb3JlLWNvbm5lY3RvcmpzXCIpO1xuY29uc3QgZ2xvYmFsVHlwZSA9IHR5cGVvZiB3aW5kb3cgPT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB3aW5kb3c7XG5pbXBvcnQge1xuICBVdGlsaXRpZXNcbn0gZnJvbSBcIi4vVXRpbGl0aWVzXCI7XG4vKipcbiAqXG4gKlxuICogQGNsYXNzIFRpbWVTZXJpZXNcbiAqIEBleHRlbmRzIHtNb2RlbH1cbiAqL1xuY2xhc3MgVGltZVNlcmllcyBleHRlbmRzIGdsb2JhbFR5cGUuTW9kZWwge1xuICAvKipcbiAgICpDcmVhdGVzIGFuIGluc3RhbmNlIG9mIFRpbWVTZXJpZXMuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbX25hbWU9XCI1IG1pbnV0ZXNcIl1cbiAgICogQHBhcmFtIHtudW1iZXJ9IFt3aW5kb3dTaXplPTYwXVxuICAgKiBAcGFyYW0ge251bWJlcn0gW2ZyZXF1ZW5jZT01XSAtIGluIHNlY29uZFxuICAgKiBAcGFyYW0ge0xzdH0gW2hpc3Rvcnk9bmV3IExzdCgpXVxuICAgKiBAcGFyYW0ge0xzdH0gW2hpc3RvcnlEYXRlPW5ldyBMc3QoKV1cbiAgICogQG1lbWJlcm9mIFRpbWVTZXJpZXNcbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIF9uYW1lID0gXCI1IG1pbnV0ZXNcIixcbiAgICB3aW5kb3dTaXplID0gNjAsXG4gICAgZnJlcXVlbmNlID0gNSwgLy8gaW4gc1xuICAgIGhpc3RvcnkgPSBuZXcgTHN0KCksXG4gICAgaGlzdG9yeURhdGUgPSBuZXcgTHN0KCksXG4gICAgbmFtZSA9IFwiVGltZVNlcmllc1wiXG4gICkge1xuICAgIHN1cGVyKCk7XG4gICAgaWYgKEZpbGVTeXN0ZW0uX3NpZ19zZXJ2ZXIpIHtcbiAgICAgIHRoaXMuYWRkX2F0dHIoe1xuICAgICAgICBpZDogVXRpbGl0aWVzLmd1aWQodGhpcy5jb25zdHJ1Y3Rvci5uYW1lKSxcbiAgICAgICAgbmFtZTogX25hbWUsXG4gICAgICAgIHdpbmRvd1NpemU6IHdpbmRvd1NpemUsXG4gICAgICAgIGZyZXF1ZW5jZTogZnJlcXVlbmNlLFxuICAgICAgICBoaXN0b3J5OiBoaXN0b3J5LFxuICAgICAgICBoaXN0b3J5RGF0ZTogaGlzdG9yeURhdGVcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGFkZFRvSGlzdG9yeSh2YWx1ZSkge1xuICAgIGlmICh0aGlzLmhpc3RvcnkubGVuZ3RoID49IHRoaXMud2luZG93U2l6ZSkge1xuICAgICAgdGhpcy5oaXN0b3J5LnNwbGljZSgwLCAxKTtcbiAgICAgIHRoaXMuaGlzdG9yeURhdGUuc3BsaWNlKDAsIDEpO1xuICAgIH1cblxuICAgIHRoaXMuaGlzdG9yeS5wdXNoKHZhbHVlKTtcbiAgICB0aGlzLmhpc3RvcnlEYXRlLnB1c2godGhpcy5nZXREYXRlKCkpO1xuXG4gIH1cblxuICBnZXREYXRlKCkge1xuICAgIHZhciB0ID0gbmV3IERhdGUoKTtcbiAgICByZXR1cm4gdC5nZXRGdWxsWWVhcigpICsgXCItXCIgKyAodC5nZXRNb250aCgpICsgMSkgKyBcIi1cIiArIHQuZ2V0RGF0ZSgpICtcbiAgICAgIFwiIFwiICsgdC5nZXRIb3VycygpICsgXCI6XCIgKyB0LmdldE1pbnV0ZXMoKSArIFwiOlwiICsgdC5nZXRTZWNvbmRzKClcbiAgfVxufVxuZXhwb3J0IGRlZmF1bHQgVGltZVNlcmllcztcbnNwaW5hbENvcmUucmVnaXN0ZXJfbW9kZWxzKFtUaW1lU2VyaWVzXSk7Il19