"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TimeSeries = exports.SpinalEndpoint = exports.SpinalDevice = exports.SpinalNetwork = exports.SpinalContext = exports.SpinalApplication = exports.BIMElement = exports.AbstractElement = exports.SpinalRelation = exports.SpinalNode = exports.SpinalGraph = undefined;

var _SpinalGraph = require("./SpinalGraph");

var _SpinalGraph2 = _interopRequireDefault(_SpinalGraph);

var _SpinalNode = require("./SpinalNode");

var _SpinalNode2 = _interopRequireDefault(_SpinalNode);

var _SpinalRelation = require("./SpinalRelation");

var _SpinalRelation2 = _interopRequireDefault(_SpinalRelation);

var _AbstractElement = require("./AbstractElement");

var _AbstractElement2 = _interopRequireDefault(_AbstractElement);

var _BIMElement = require("./BIMElement");

var _BIMElement2 = _interopRequireDefault(_BIMElement);

var _SpinalApplication = require("./SpinalApplication");

var _SpinalApplication2 = _interopRequireDefault(_SpinalApplication);

var _SpinalContext = require("./SpinalContext");

var _SpinalContext2 = _interopRequireDefault(_SpinalContext);

var _SpinalNetwork = require("./SpinalNetwork");

var _SpinalNetwork2 = _interopRequireDefault(_SpinalNetwork);

var _SpinalDevice = require("./SpinalDevice");

var _SpinalDevice2 = _interopRequireDefault(_SpinalDevice);

var _SpinalEndpoint = require("./SpinalEndpoint");

var _SpinalEndpoint2 = _interopRequireDefault(_SpinalEndpoint);

var _TimeSeries = require("./TimeSeries");

var _TimeSeries2 = _interopRequireDefault(_TimeSeries);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Copyright 2015 SpinalCom  www.spinalcom.com

// This file is part of SpinalCore.

// SpinalCore is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Soda is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
// You should have received a copy of the GNU General Public License
// along with Soda. If not, see <http://www.gnu.org/licenses/>.

const spinalCore = require("spinal-core-connectorjs");
const globalType = typeof window === "undefined" ? global : window;
let getViewer = function () {
  return globalType.v;
};

exports.SpinalGraph = _SpinalGraph2.default;
exports.SpinalNode = _SpinalNode2.default;
exports.SpinalRelation = _SpinalRelation2.default;
exports.AbstractElement = _AbstractElement2.default;
exports.BIMElement = _BIMElement2.default;
exports.SpinalApplication = _SpinalApplication2.default;
exports.SpinalContext = _SpinalContext2.default;
exports.SpinalNetwork = _SpinalNetwork2.default;
exports.SpinalDevice = _SpinalDevice2.default;
exports.SpinalEndpoint = _SpinalEndpoint2.default;
exports.TimeSeries = _TimeSeries2.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJzcGluYWxDb3JlIiwicmVxdWlyZSIsImdsb2JhbFR5cGUiLCJ3aW5kb3ciLCJnbG9iYWwiLCJnZXRWaWV3ZXIiLCJ2IiwiU3BpbmFsR3JhcGgiLCJTcGluYWxOb2RlIiwiU3BpbmFsUmVsYXRpb24iLCJBYnN0cmFjdEVsZW1lbnQiLCJCSU1FbGVtZW50IiwiU3BpbmFsQXBwbGljYXRpb24iLCJTcGluYWxDb250ZXh0IiwiU3BpbmFsTmV0d29yayIsIlNwaW5hbERldmljZSIsIlNwaW5hbEVuZHBvaW50IiwiVGltZVNlcmllcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQXNCQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFoQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE1BQU1BLGFBQWFDLFFBQVEseUJBQVIsQ0FBbkI7QUFDQSxNQUFNQyxhQUFhLE9BQU9DLE1BQVAsS0FBa0IsV0FBbEIsR0FBZ0NDLE1BQWhDLEdBQXlDRCxNQUE1RDtBQUNBLElBQUlFLFlBQVksWUFBVztBQUN6QixTQUFPSCxXQUFXSSxDQUFsQjtBQUNELENBRkQ7O1FBaUJFQyxXLEdBQUFBLHFCO1FBQ0FDLFUsR0FBQUEsb0I7UUFDQUMsYyxHQUFBQSx3QjtRQUNBQyxlLEdBQUFBLHlCO1FBQ0FDLFUsR0FBQUEsb0I7UUFDQUMsaUIsR0FBQUEsMkI7UUFDQUMsYSxHQUFBQSx1QjtRQUNBQyxhLEdBQUFBLHVCO1FBQ0FDLFksR0FBQUEsc0I7UUFDQUMsYyxHQUFBQSx3QjtRQUNBQyxVLEdBQUFBLG9CIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUgU3BpbmFsQ29tICB3d3cuc3BpbmFsY29tLmNvbVxuXG4vLyBUaGlzIGZpbGUgaXMgcGFydCBvZiBTcGluYWxDb3JlLlxuXG4vLyBTcGluYWxDb3JlIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbi8vIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuLy8gdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3Jcbi8vIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG5cbi8vIFNvZGEgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbi8vIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4vLyBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4vLyBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbi8vIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4vLyBhbG9uZyB3aXRoIFNvZGEuIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cblxuY29uc3Qgc3BpbmFsQ29yZSA9IHJlcXVpcmUoXCJzcGluYWwtY29yZS1jb25uZWN0b3Jqc1wiKTtcbmNvbnN0IGdsb2JhbFR5cGUgPSB0eXBlb2Ygd2luZG93ID09PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogd2luZG93O1xubGV0IGdldFZpZXdlciA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gZ2xvYmFsVHlwZS52O1xufTtcblxuaW1wb3J0IFNwaW5hbEdyYXBoIGZyb20gXCIuL1NwaW5hbEdyYXBoXCI7XG5pbXBvcnQgU3BpbmFsTm9kZSBmcm9tIFwiLi9TcGluYWxOb2RlXCI7XG5pbXBvcnQgU3BpbmFsUmVsYXRpb24gZnJvbSBcIi4vU3BpbmFsUmVsYXRpb25cIjtcbmltcG9ydCBBYnN0cmFjdEVsZW1lbnQgZnJvbSBcIi4vQWJzdHJhY3RFbGVtZW50XCI7XG5pbXBvcnQgQklNRWxlbWVudCBmcm9tIFwiLi9CSU1FbGVtZW50XCI7XG5pbXBvcnQgU3BpbmFsQXBwbGljYXRpb24gZnJvbSBcIi4vU3BpbmFsQXBwbGljYXRpb25cIjtcbmltcG9ydCBTcGluYWxDb250ZXh0IGZyb20gXCIuL1NwaW5hbENvbnRleHRcIjtcbmltcG9ydCBTcGluYWxOZXR3b3JrIGZyb20gXCIuL1NwaW5hbE5ldHdvcmtcIjtcbmltcG9ydCBTcGluYWxEZXZpY2UgZnJvbSBcIi4vU3BpbmFsRGV2aWNlXCI7XG5pbXBvcnQgU3BpbmFsRW5kcG9pbnQgZnJvbSBcIi4vU3BpbmFsRW5kcG9pbnRcIjtcbmltcG9ydCBUaW1lU2VyaWVzIGZyb20gXCIuL1RpbWVTZXJpZXNcIjtcblxuZXhwb3J0IHtcbiAgU3BpbmFsR3JhcGgsXG4gIFNwaW5hbE5vZGUsXG4gIFNwaW5hbFJlbGF0aW9uLFxuICBBYnN0cmFjdEVsZW1lbnQsXG4gIEJJTUVsZW1lbnQsXG4gIFNwaW5hbEFwcGxpY2F0aW9uLFxuICBTcGluYWxDb250ZXh0LFxuICBTcGluYWxOZXR3b3JrLFxuICBTcGluYWxEZXZpY2UsXG4gIFNwaW5hbEVuZHBvaW50LFxuICBUaW1lU2VyaWVzXG59O1xuIl19