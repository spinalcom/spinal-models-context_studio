"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SpinalContext = exports.SpinalApplication = exports.BIMElement = exports.AbstractElement = exports.SpinalRelation = exports.SpinalNode = exports.SpinalGraph = undefined;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJzcGluYWxDb3JlIiwicmVxdWlyZSIsImdsb2JhbFR5cGUiLCJ3aW5kb3ciLCJnbG9iYWwiLCJnZXRWaWV3ZXIiLCJ2IiwiU3BpbmFsR3JhcGgiLCJTcGluYWxOb2RlIiwiU3BpbmFsUmVsYXRpb24iLCJBYnN0cmFjdEVsZW1lbnQiLCJCSU1FbGVtZW50IiwiU3BpbmFsQXBwbGljYXRpb24iLCJTcGluYWxDb250ZXh0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBeUJBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUEvQkE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE1BQU1BLGFBQWFDLFFBQVEseUJBQVIsQ0FBbkI7QUFDQSxNQUFNQyxhQUFhLE9BQU9DLE1BQVAsS0FBa0IsV0FBbEIsR0FBZ0NDLE1BQWhDLEdBQXlDRCxNQUE1RDtBQUNBLElBQUlFLFlBQVksWUFBVztBQUN6QixTQUFPSCxXQUFXSSxDQUFsQjtBQUNELENBRkQ7O1FBc0JFQyxXLEdBQUFBLHFCO1FBQ0FDLFUsR0FBQUEsb0I7UUFDQUMsYyxHQUFBQSx3QjtRQUNBQyxlLEdBQUFBLHlCO1FBQ0FDLFUsR0FBQUEsb0I7UUFDQUMsaUIsR0FBQUEsMkI7UUFDQUMsYSxHQUFBQSx1QiIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1IFNwaW5hbENvbSAgd3d3LnNwaW5hbGNvbS5jb21cblxuLy8gVGhpcyBmaWxlIGlzIHBhcnQgb2YgU3BpbmFsQ29yZS5cblxuLy8gU3BpbmFsQ29yZSBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4vLyBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbi8vIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4vLyAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuXG4vLyBTb2RhIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4vLyBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuLy8gTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuLy8gR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4vLyBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuLy8gYWxvbmcgd2l0aCBTb2RhLiBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG5cbmNvbnN0IHNwaW5hbENvcmUgPSByZXF1aXJlKFwic3BpbmFsLWNvcmUtY29ubmVjdG9yanNcIik7XG5jb25zdCBnbG9iYWxUeXBlID0gdHlwZW9mIHdpbmRvdyA9PT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHdpbmRvdztcbmxldCBnZXRWaWV3ZXIgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGdsb2JhbFR5cGUudjtcbn1cblxuXG5cblxuaW1wb3J0IFNwaW5hbEdyYXBoIGZyb20gXCIuL1NwaW5hbEdyYXBoXCJcbmltcG9ydCBTcGluYWxOb2RlIGZyb20gXCIuL1NwaW5hbE5vZGVcIlxuaW1wb3J0IFNwaW5hbFJlbGF0aW9uIGZyb20gXCIuL1NwaW5hbFJlbGF0aW9uXCJcbmltcG9ydCBBYnN0cmFjdEVsZW1lbnQgZnJvbSBcIi4vQWJzdHJhY3RFbGVtZW50XCJcbmltcG9ydCBCSU1FbGVtZW50IGZyb20gXCIuL0JJTUVsZW1lbnRcIlxuaW1wb3J0IFNwaW5hbEFwcGxpY2F0aW9uIGZyb20gXCIuL1NwaW5hbEFwcGxpY2F0aW9uXCJcbmltcG9ydCBTcGluYWxDb250ZXh0IGZyb20gXCIuL1NwaW5hbENvbnRleHRcIlxuXG5cblxuXG5cblxuXG5leHBvcnQge1xuICBTcGluYWxHcmFwaCxcbiAgU3BpbmFsTm9kZSxcbiAgU3BpbmFsUmVsYXRpb24sXG4gIEFic3RyYWN0RWxlbWVudCxcbiAgQklNRWxlbWVudCxcbiAgU3BpbmFsQXBwbGljYXRpb24sXG4gIFNwaW5hbENvbnRleHRcbn0iXX0=