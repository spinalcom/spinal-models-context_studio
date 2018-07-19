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
let getViewer = function() {
  return globalType.v;
}




import SpinalGraph from "./SpinalGraph"
import SpinalNode from "./SpinalNode"
import SpinalRelation from "./SpinalRelation"
import AbstractElement from "./AbstractElement"
import BIMElement from "./BIMElement"
import SpinalApplication from "./SpinalApplication"
import SpinalContext from "./SpinalContext"







export {
  SpinalGraph,
  SpinalNode,
  SpinalRelation,
  AbstractElement,
  BIMElement,
  SpinalApplication,
  SpinalContext
}