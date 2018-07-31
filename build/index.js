"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SpinalEndpoint = exports.SpinalDevice = exports.SpinalNetwork = exports.SpinalContext = exports.SpinalApplication = exports.BIMElement = exports.AbstractElement = exports.SpinalRelation = exports.SpinalNode = exports.SpinalGraph = undefined;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJzcGluYWxDb3JlIiwicmVxdWlyZSIsImdsb2JhbFR5cGUiLCJ3aW5kb3ciLCJnbG9iYWwiLCJnZXRWaWV3ZXIiLCJ2IiwiU3BpbmFsR3JhcGgiLCJTcGluYWxOb2RlIiwiU3BpbmFsUmVsYXRpb24iLCJBYnN0cmFjdEVsZW1lbnQiLCJCSU1FbGVtZW50IiwiU3BpbmFsQXBwbGljYXRpb24iLCJTcGluYWxDb250ZXh0IiwiU3BpbmFsTmV0d29yayIsIlNwaW5hbERldmljZSIsIlNwaW5hbEVuZHBvaW50Il0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBc0JBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUEvQkE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE1BQU1BLGFBQWFDLFFBQVEseUJBQVIsQ0FBbkI7QUFDQSxNQUFNQyxhQUFhLE9BQU9DLE1BQVAsS0FBa0IsV0FBbEIsR0FBZ0NDLE1BQWhDLEdBQXlDRCxNQUE1RDtBQUNBLElBQUlFLFlBQVksWUFBVztBQUN6QixTQUFPSCxXQUFXSSxDQUFsQjtBQUNELENBRkQ7O1FBZ0JFQyxXLEdBQUFBLHFCO1FBQ0FDLFUsR0FBQUEsb0I7UUFDQUMsYyxHQUFBQSx3QjtRQUNBQyxlLEdBQUFBLHlCO1FBQ0FDLFUsR0FBQUEsb0I7UUFDQUMsaUIsR0FBQUEsMkI7UUFDQUMsYSxHQUFBQSx1QjtRQUNBQyxhLEdBQUFBLHVCO1FBQ0FDLFksR0FBQUEsc0I7UUFDQUMsYyxHQUFBQSx3QiIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1IFNwaW5hbENvbSAgd3d3LnNwaW5hbGNvbS5jb21cblxuLy8gVGhpcyBmaWxlIGlzIHBhcnQgb2YgU3BpbmFsQ29yZS5cblxuLy8gU3BpbmFsQ29yZSBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4vLyBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbi8vIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4vLyAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuXG4vLyBTb2RhIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4vLyBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuLy8gTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuLy8gR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4vLyBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuLy8gYWxvbmcgd2l0aCBTb2RhLiBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG5cbmNvbnN0IHNwaW5hbENvcmUgPSByZXF1aXJlKFwic3BpbmFsLWNvcmUtY29ubmVjdG9yanNcIik7XG5jb25zdCBnbG9iYWxUeXBlID0gdHlwZW9mIHdpbmRvdyA9PT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHdpbmRvdztcbmxldCBnZXRWaWV3ZXIgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGdsb2JhbFR5cGUudjtcbn07XG5cbmltcG9ydCBTcGluYWxHcmFwaCBmcm9tIFwiLi9TcGluYWxHcmFwaFwiO1xuaW1wb3J0IFNwaW5hbE5vZGUgZnJvbSBcIi4vU3BpbmFsTm9kZVwiO1xuaW1wb3J0IFNwaW5hbFJlbGF0aW9uIGZyb20gXCIuL1NwaW5hbFJlbGF0aW9uXCI7XG5pbXBvcnQgQWJzdHJhY3RFbGVtZW50IGZyb20gXCIuL0Fic3RyYWN0RWxlbWVudFwiO1xuaW1wb3J0IEJJTUVsZW1lbnQgZnJvbSBcIi4vQklNRWxlbWVudFwiO1xuaW1wb3J0IFNwaW5hbEFwcGxpY2F0aW9uIGZyb20gXCIuL1NwaW5hbEFwcGxpY2F0aW9uXCI7XG5pbXBvcnQgU3BpbmFsQ29udGV4dCBmcm9tIFwiLi9TcGluYWxDb250ZXh0XCI7XG5pbXBvcnQgU3BpbmFsTmV0d29yayBmcm9tIFwiLi9TcGluYWxOZXR3b3JrXCI7XG5pbXBvcnQgU3BpbmFsRGV2aWNlIGZyb20gXCIuL1NwaW5hbERldmljZVwiO1xuaW1wb3J0IFNwaW5hbEVuZHBvaW50IGZyb20gXCIuL1NwaW5hbEVuZHBvaW50XCI7XG5cbmV4cG9ydCB7XG4gIFNwaW5hbEdyYXBoLFxuICBTcGluYWxOb2RlLFxuICBTcGluYWxSZWxhdGlvbixcbiAgQWJzdHJhY3RFbGVtZW50LFxuICBCSU1FbGVtZW50LFxuICBTcGluYWxBcHBsaWNhdGlvbixcbiAgU3BpbmFsQ29udGV4dCxcbiAgU3BpbmFsTmV0d29yayxcbiAgU3BpbmFsRGV2aWNlLFxuICBTcGluYWxFbmRwb2ludFxufTtcbiJdfQ==