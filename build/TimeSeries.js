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

    if (value) {
      this.history.push(value);
      this.historyDate.push(this.getDate());
    }
  }

  getDate() {
    var t = new Date();
    return t.getFullYear() + "-" + (t.getMonth() + 1) + "-" + t.getDate() + " " + t.getHours() + ":" + t.getMinutes() + ":" + t.getSeconds();
  }
}
exports.default = TimeSeries;

spinalCore.register_models([TimeSeries]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9UaW1lU2VyaWVzLmpzIl0sIm5hbWVzIjpbInNwaW5hbENvcmUiLCJyZXF1aXJlIiwiZ2xvYmFsVHlwZSIsIndpbmRvdyIsImdsb2JhbCIsIlRpbWVTZXJpZXMiLCJNb2RlbCIsImNvbnN0cnVjdG9yIiwiX25hbWUiLCJ3aW5kb3dTaXplIiwiZnJlcXVlbmNlIiwiaGlzdG9yeSIsIkxzdCIsImhpc3RvcnlEYXRlIiwibmFtZSIsIkZpbGVTeXN0ZW0iLCJfc2lnX3NlcnZlciIsImFkZF9hdHRyIiwiaWQiLCJVdGlsaXRpZXMiLCJndWlkIiwiYWRkVG9IaXN0b3J5IiwidmFsdWUiLCJsZW5ndGgiLCJzcGxpY2UiLCJwdXNoIiwiZ2V0RGF0ZSIsInQiLCJEYXRlIiwiZ2V0RnVsbFllYXIiLCJnZXRNb250aCIsImdldEhvdXJzIiwiZ2V0TWludXRlcyIsImdldFNlY29uZHMiLCJyZWdpc3Rlcl9tb2RlbHMiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUVBOztBQUZBLE1BQU1BLGFBQWFDLFFBQVEseUJBQVIsQ0FBbkI7QUFDQSxNQUFNQyxhQUFhLE9BQU9DLE1BQVAsS0FBa0IsV0FBbEIsR0FBZ0NDLE1BQWhDLEdBQXlDRCxNQUE1RDs7QUFJQTs7Ozs7O0FBTUEsTUFBTUUsVUFBTixTQUF5QkgsV0FBV0ksS0FBcEMsQ0FBMEM7QUFDeEM7Ozs7Ozs7OztBQVNBQyxjQUNFQyxRQUFRLFdBRFYsRUFFRUMsYUFBYSxFQUZmLEVBR0VDLFlBQVksQ0FIZCxFQUdpQjtBQUNmQyxZQUFVLElBQUlDLEdBQUosRUFKWixFQUtFQyxjQUFjLElBQUlELEdBQUosRUFMaEIsRUFNRUUsT0FBTyxZQU5ULEVBT0U7QUFDQTtBQUNBLFFBQUlDLFdBQVdDLFdBQWYsRUFBNEI7QUFDMUIsV0FBS0MsUUFBTCxDQUFjO0FBQ1pDLFlBQUlDLHFCQUFVQyxJQUFWLENBQWUsS0FBS2IsV0FBTCxDQUFpQk8sSUFBaEMsQ0FEUTtBQUVaQSxjQUFNTixLQUZNO0FBR1pDLG9CQUFZQSxVQUhBO0FBSVpDLG1CQUFXQSxTQUpDO0FBS1pDLGlCQUFTQSxPQUxHO0FBTVpFLHFCQUFhQTtBQU5ELE9BQWQ7QUFRRDtBQUNGOztBQUVEUSxlQUFhQyxLQUFiLEVBQW9CO0FBQ2xCLFFBQUksS0FBS1gsT0FBTCxDQUFhWSxNQUFiLElBQXVCLEtBQUtkLFVBQWhDLEVBQTRDO0FBQzFDLFdBQUtFLE9BQUwsQ0FBYWEsTUFBYixDQUFvQixDQUFwQixFQUF1QixDQUF2QjtBQUNBLFdBQUtYLFdBQUwsQ0FBaUJXLE1BQWpCLENBQXdCLENBQXhCLEVBQTJCLENBQTNCO0FBQ0Q7O0FBRUQsUUFBSUYsS0FBSixFQUFXO0FBQ1QsV0FBS1gsT0FBTCxDQUFhYyxJQUFiLENBQWtCSCxLQUFsQjtBQUNBLFdBQUtULFdBQUwsQ0FBaUJZLElBQWpCLENBQXNCLEtBQUtDLE9BQUwsRUFBdEI7QUFDRDtBQUdGOztBQUVEQSxZQUFVO0FBQ1IsUUFBSUMsSUFBSSxJQUFJQyxJQUFKLEVBQVI7QUFDQSxXQUFPRCxFQUFFRSxXQUFGLEtBQWtCLEdBQWxCLElBQXlCRixFQUFFRyxRQUFGLEtBQWUsQ0FBeEMsSUFBNkMsR0FBN0MsR0FBbURILEVBQUVELE9BQUYsRUFBbkQsR0FDTCxHQURLLEdBQ0NDLEVBQUVJLFFBQUYsRUFERCxHQUNnQixHQURoQixHQUNzQkosRUFBRUssVUFBRixFQUR0QixHQUN1QyxHQUR2QyxHQUM2Q0wsRUFBRU0sVUFBRixFQURwRDtBQUVEO0FBakR1QztrQkFtRDNCNUIsVTs7QUFDZkwsV0FBV2tDLGVBQVgsQ0FBMkIsQ0FBQzdCLFVBQUQsQ0FBM0IiLCJmaWxlIjoiVGltZVNlcmllcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHNwaW5hbENvcmUgPSByZXF1aXJlKFwic3BpbmFsLWNvcmUtY29ubmVjdG9yanNcIik7XG5jb25zdCBnbG9iYWxUeXBlID0gdHlwZW9mIHdpbmRvdyA9PT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHdpbmRvdztcbmltcG9ydCB7XG4gIFV0aWxpdGllc1xufSBmcm9tIFwiLi9VdGlsaXRpZXNcIjtcbi8qKlxuICpcbiAqXG4gKiBAY2xhc3MgVGltZVNlcmllc1xuICogQGV4dGVuZHMge01vZGVsfVxuICovXG5jbGFzcyBUaW1lU2VyaWVzIGV4dGVuZHMgZ2xvYmFsVHlwZS5Nb2RlbCB7XG4gIC8qKlxuICAgKkNyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgVGltZVNlcmllcy5cbiAgICogQHBhcmFtIHtzdHJpbmd9IFtfbmFtZT1cIjUgbWludXRlc1wiXVxuICAgKiBAcGFyYW0ge251bWJlcn0gW3dpbmRvd1NpemU9NjBdXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbZnJlcXVlbmNlPTVdIC0gaW4gc2Vjb25kXG4gICAqIEBwYXJhbSB7THN0fSBbaGlzdG9yeT1uZXcgTHN0KCldXG4gICAqIEBwYXJhbSB7THN0fSBbaGlzdG9yeURhdGU9bmV3IExzdCgpXVxuICAgKiBAbWVtYmVyb2YgVGltZVNlcmllc1xuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgX25hbWUgPSBcIjUgbWludXRlc1wiLFxuICAgIHdpbmRvd1NpemUgPSA2MCxcbiAgICBmcmVxdWVuY2UgPSA1LCAvLyBpbiBzXG4gICAgaGlzdG9yeSA9IG5ldyBMc3QoKSxcbiAgICBoaXN0b3J5RGF0ZSA9IG5ldyBMc3QoKSxcbiAgICBuYW1lID0gXCJUaW1lU2VyaWVzXCJcbiAgKSB7XG4gICAgc3VwZXIoKTtcbiAgICBpZiAoRmlsZVN5c3RlbS5fc2lnX3NlcnZlcikge1xuICAgICAgdGhpcy5hZGRfYXR0cih7XG4gICAgICAgIGlkOiBVdGlsaXRpZXMuZ3VpZCh0aGlzLmNvbnN0cnVjdG9yLm5hbWUpLFxuICAgICAgICBuYW1lOiBfbmFtZSxcbiAgICAgICAgd2luZG93U2l6ZTogd2luZG93U2l6ZSxcbiAgICAgICAgZnJlcXVlbmNlOiBmcmVxdWVuY2UsXG4gICAgICAgIGhpc3Rvcnk6IGhpc3RvcnksXG4gICAgICAgIGhpc3RvcnlEYXRlOiBoaXN0b3J5RGF0ZVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgYWRkVG9IaXN0b3J5KHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuaGlzdG9yeS5sZW5ndGggPj0gdGhpcy53aW5kb3dTaXplKSB7XG4gICAgICB0aGlzLmhpc3Rvcnkuc3BsaWNlKDAsIDEpO1xuICAgICAgdGhpcy5oaXN0b3J5RGF0ZS5zcGxpY2UoMCwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICB0aGlzLmhpc3RvcnkucHVzaCh2YWx1ZSk7XG4gICAgICB0aGlzLmhpc3RvcnlEYXRlLnB1c2godGhpcy5nZXREYXRlKCkpO1xuICAgIH1cblxuXG4gIH1cblxuICBnZXREYXRlKCkge1xuICAgIHZhciB0ID0gbmV3IERhdGUoKTtcbiAgICByZXR1cm4gdC5nZXRGdWxsWWVhcigpICsgXCItXCIgKyAodC5nZXRNb250aCgpICsgMSkgKyBcIi1cIiArIHQuZ2V0RGF0ZSgpICtcbiAgICAgIFwiIFwiICsgdC5nZXRIb3VycygpICsgXCI6XCIgKyB0LmdldE1pbnV0ZXMoKSArIFwiOlwiICsgdC5nZXRTZWNvbmRzKClcbiAgfVxufVxuZXhwb3J0IGRlZmF1bHQgVGltZVNlcmllcztcbnNwaW5hbENvcmUucmVnaXN0ZXJfbW9kZWxzKFtUaW1lU2VyaWVzXSk7Il19