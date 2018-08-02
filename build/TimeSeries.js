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
   * @memberof TimeSeries
   */
  constructor(_name = "5 minutes", windowSize = 60, frequence = 5, // in s
  history = new Lst(), name = "TimeSeries") {
    super();
    if (FileSystem._sig_server) {
      this.add_attr({
        id: _Utilities.Utilities.guid(this.constructor.name),
        name: _name,
        windowSize: windowSize,
        frequence: frequence,
        history: history
      });
    }
  }

  addToHistory(value) {
    if (this.history.length < this.windowSize) {
      this.history.push(value);
    } else {
      this.history.splice(0, 1);
      this.history.push(value);
    }
  }
}
exports.default = TimeSeries;

spinalCore.register_models([TimeSeries]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9UaW1lU2VyaWVzLmpzIl0sIm5hbWVzIjpbInNwaW5hbENvcmUiLCJyZXF1aXJlIiwiZ2xvYmFsVHlwZSIsIndpbmRvdyIsImdsb2JhbCIsIlRpbWVTZXJpZXMiLCJNb2RlbCIsImNvbnN0cnVjdG9yIiwiX25hbWUiLCJ3aW5kb3dTaXplIiwiZnJlcXVlbmNlIiwiaGlzdG9yeSIsIkxzdCIsIm5hbWUiLCJGaWxlU3lzdGVtIiwiX3NpZ19zZXJ2ZXIiLCJhZGRfYXR0ciIsImlkIiwiVXRpbGl0aWVzIiwiZ3VpZCIsImFkZFRvSGlzdG9yeSIsInZhbHVlIiwibGVuZ3RoIiwicHVzaCIsInNwbGljZSIsInJlZ2lzdGVyX21vZGVscyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBRUE7O0FBRkEsTUFBTUEsYUFBYUMsUUFBUSx5QkFBUixDQUFuQjtBQUNBLE1BQU1DLGFBQWEsT0FBT0MsTUFBUCxLQUFrQixXQUFsQixHQUFnQ0MsTUFBaEMsR0FBeUNELE1BQTVEOztBQUVBOzs7Ozs7QUFNQSxNQUFNRSxVQUFOLFNBQXlCSCxXQUFXSSxLQUFwQyxDQUEwQztBQUN4Qzs7Ozs7Ozs7QUFRQUMsY0FDRUMsUUFBUSxXQURWLEVBRUVDLGFBQWEsRUFGZixFQUdFQyxZQUFZLENBSGQsRUFHaUI7QUFDZkMsWUFBVSxJQUFJQyxHQUFKLEVBSlosRUFLRUMsT0FBTyxZQUxULEVBTUU7QUFDQTtBQUNBLFFBQUlDLFdBQVdDLFdBQWYsRUFBNEI7QUFDMUIsV0FBS0MsUUFBTCxDQUFjO0FBQ1pDLFlBQUlDLHFCQUFVQyxJQUFWLENBQWUsS0FBS1osV0FBTCxDQUFpQk0sSUFBaEMsQ0FEUTtBQUVaQSxjQUFNTCxLQUZNO0FBR1pDLG9CQUFZQSxVQUhBO0FBSVpDLG1CQUFXQSxTQUpDO0FBS1pDLGlCQUFTQTtBQUxHLE9BQWQ7QUFPRDtBQUNGOztBQUVEUyxlQUFhQyxLQUFiLEVBQW9CO0FBQ2xCLFFBQUksS0FBS1YsT0FBTCxDQUFhVyxNQUFiLEdBQXNCLEtBQUtiLFVBQS9CLEVBQTJDO0FBQ3pDLFdBQUtFLE9BQUwsQ0FBYVksSUFBYixDQUFrQkYsS0FBbEI7QUFDRCxLQUZELE1BRU87QUFDTCxXQUFLVixPQUFMLENBQWFhLE1BQWIsQ0FBb0IsQ0FBcEIsRUFBdUIsQ0FBdkI7QUFDQSxXQUFLYixPQUFMLENBQWFZLElBQWIsQ0FBa0JGLEtBQWxCO0FBQ0Q7QUFDRjtBQW5DdUM7a0JBcUMzQmhCLFU7O0FBQ2ZMLFdBQVd5QixlQUFYLENBQTJCLENBQUNwQixVQUFELENBQTNCIiwiZmlsZSI6IlRpbWVTZXJpZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBzcGluYWxDb3JlID0gcmVxdWlyZShcInNwaW5hbC1jb3JlLWNvbm5lY3RvcmpzXCIpO1xuY29uc3QgZ2xvYmFsVHlwZSA9IHR5cGVvZiB3aW5kb3cgPT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB3aW5kb3c7XG5pbXBvcnQgeyBVdGlsaXRpZXMgfSBmcm9tIFwiLi9VdGlsaXRpZXNcIjtcbi8qKlxuICpcbiAqXG4gKiBAY2xhc3MgVGltZVNlcmllc1xuICogQGV4dGVuZHMge01vZGVsfVxuICovXG5jbGFzcyBUaW1lU2VyaWVzIGV4dGVuZHMgZ2xvYmFsVHlwZS5Nb2RlbCB7XG4gIC8qKlxuICAgKkNyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgVGltZVNlcmllcy5cbiAgICogQHBhcmFtIHtzdHJpbmd9IFtfbmFtZT1cIjUgbWludXRlc1wiXVxuICAgKiBAcGFyYW0ge251bWJlcn0gW3dpbmRvd1NpemU9NjBdXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbZnJlcXVlbmNlPTVdIC0gaW4gc2Vjb25kXG4gICAqIEBwYXJhbSB7THN0fSBbaGlzdG9yeT1uZXcgTHN0KCldXG4gICAqIEBtZW1iZXJvZiBUaW1lU2VyaWVzXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBfbmFtZSA9IFwiNSBtaW51dGVzXCIsXG4gICAgd2luZG93U2l6ZSA9IDYwLFxuICAgIGZyZXF1ZW5jZSA9IDUsIC8vIGluIHNcbiAgICBoaXN0b3J5ID0gbmV3IExzdCgpLFxuICAgIG5hbWUgPSBcIlRpbWVTZXJpZXNcIlxuICApIHtcbiAgICBzdXBlcigpO1xuICAgIGlmIChGaWxlU3lzdGVtLl9zaWdfc2VydmVyKSB7XG4gICAgICB0aGlzLmFkZF9hdHRyKHtcbiAgICAgICAgaWQ6IFV0aWxpdGllcy5ndWlkKHRoaXMuY29uc3RydWN0b3IubmFtZSksXG4gICAgICAgIG5hbWU6IF9uYW1lLFxuICAgICAgICB3aW5kb3dTaXplOiB3aW5kb3dTaXplLFxuICAgICAgICBmcmVxdWVuY2U6IGZyZXF1ZW5jZSxcbiAgICAgICAgaGlzdG9yeTogaGlzdG9yeVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgYWRkVG9IaXN0b3J5KHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuaGlzdG9yeS5sZW5ndGggPCB0aGlzLndpbmRvd1NpemUpIHtcbiAgICAgIHRoaXMuaGlzdG9yeS5wdXNoKHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5oaXN0b3J5LnNwbGljZSgwLCAxKTtcbiAgICAgIHRoaXMuaGlzdG9yeS5wdXNoKHZhbHVlKTtcbiAgICB9XG4gIH1cbn1cbmV4cG9ydCBkZWZhdWx0IFRpbWVTZXJpZXM7XG5zcGluYWxDb3JlLnJlZ2lzdGVyX21vZGVscyhbVGltZVNlcmllc10pO1xuIl19