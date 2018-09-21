const spinalCore = require("spinal-core-connectorjs");
const globalType = typeof window === "undefined" ? global : window;
import {
  Utilities
} from "./Utilities";
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
  constructor(
    _name = "5 minutes",
    windowSize = 60,
    frequence = 5, // in s
    history = new Lst(),
    historyDate = new Lst(),
    name = "TimeSeries"
  ) {
    super();
    if (FileSystem._sig_server) {
      this.add_attr({
        id: Utilities.guid(this.constructor.name),
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
    return t.getFullYear() + "-" + (t.getMonth() + 1) + "-" + t.getDate() +
      " " + t.getHours() + ":" + t.getMinutes() + ":" + t.getSeconds()
  }
}
export default TimeSeries;
spinalCore.register_models([TimeSeries]);