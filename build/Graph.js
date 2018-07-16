"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _SpinalNode = require("./SpinalNode");

var _SpinalNode2 = _interopRequireDefault(_SpinalNode);

var _SpinalRelation = require("./SpinalRelation");

var _SpinalRelation2 = _interopRequireDefault(_SpinalRelation);

var _AbstractElement = require("./AbstractElement");

var _AbstractElement2 = _interopRequireDefault(_AbstractElement);

var _BIMElement = require("./BIMElement");

var _BIMElement2 = _interopRequireDefault(_BIMElement);

var _SpinalContext = require("./SpinalContext");

var _SpinalContext2 = _interopRequireDefault(_SpinalContext);

var _Utilities = require("./Utilities");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const spinalCore = require("spinal-core-connectorjs");
const globalType = typeof window === "undefined" ? global : window;

/**
 *
 *
 * @export
 * @class Graph
 * @extends {globalType.Model}
 */
class Graph extends globalType.Model {
  /**
   *Creates an instance of Graph.
   * @param {*} _name
   * @param {*} _startingNode
   * @param {string} [name="Graph"]
   * @memberof Graph
   */
  constructor(_name, _startingNode, name = "Graph") {
    super();
    if (FileSystem._sig_server) {
      this.add_attr({
        name: _name || "",
        externalIdNodeMapping: new Model(),
        guidAbstractNodeMapping: new Model(),
        startingNode: _startingNode || new Ptr(0),
        nodeList: new Ptr(new Lst()),
        nodeListByElementType: new Model(),
        relationList: new Ptr(new Lst()),
        relationListByType: new Model(),
        contextList: new Lst()
      });
    }
  }
  /**
   *
   *
   * @memberof Graph
   */
  init() {
    globalType.spinal.contextStudio = {};
    globalType.spinal.contextStudio.graph = this;
    globalType.spinal.contextStudio.SpinalNode = _SpinalNode2.default;
    globalType.spinal.contextStudio.SpinalRelation = _SpinalRelation2.default;
    globalType.spinal.contextStudio.AbstractElement = _AbstractElement2.default;
    globalType.spinal.contextStudio.BIMElement = _BIMElement2.default;
    globalType.spinal.contextStudio.Utilities = _Utilities.Utilities;
  }
  /**
   *
   *
   * @param {*} _dbId
   * @returns Promise of the corresponding Node 
   * @memberof Graph
   */
  async getNodeBydbId(_dbId) {
    let _externalId = await _Utilities.Utilities.getExternalId(_dbId);
    if (typeof this.externalIdNodeMapping[_externalId] !== "undefined") return this.externalIdNodeMapping[_externalId];else {
      let BIMElement1 = new _BIMElement2.default(_dbId);
      BIMElement1.initExternalId();
      let node = await this.addNodeAsync(BIMElement1);
      if (BIMElement1.type.get() === "") {
        BIMElement1.type.bind(this._classifyBIMElementNode.bind(this, node));
      }
      return node;
    }
  }
  /**
   *
   *
   * @param {*} _node
   * @memberof Graph
   */
  async _classifyBIMElementNode(_node) {
    //TODO DELETE OLD CLASSIFICATION
    this.classifyNode(_node);
  }
  /**
   *
   *
   * @param {*} _node
   * @returns dbId
   * @memberof Graph
   */
  async getDbIdByNode(_node) {
    let element = await _Utilities.Utilities.promiseLoad(_node.element);
    if (element instanceof _BIMElement2.default) {
      return element.id.get();
    }
  }
  /**
   *
   *
   * @param {*} _name
   * @memberof Graph
   */
  setName(_name) {
    this.name.set(_name);
  }
  /**
   *
   *
   * @param {*} _startingNode
   * @memberof Graph
   */
  setStartingNode(_startingNode) {
    this.startingNode.set(_startingNode);
  }
  /**
   *
   *
   * @param {*} _ElementId
   * @param {*} _node
   * @memberof Graph
   */
  async _addExternalIdNodeMappingEntry(_ElementId, _node) {
    let _dbid = _ElementId.get();
    if (typeof _dbid == "number") if (_dbid != 0) {
      let externalId = await _Utilities.Utilities.getExternalId(_dbid);
      let element = await _Utilities.Utilities.promiseLoad(_node.element);
      await element.initExternalId();
      if (typeof this.externalIdNodeMapping[externalId] === "undefined") this.externalIdNodeMapping.add_attr({
        [externalId]: _node
      });
      _ElementId.unbind(this._addExternalIdNodeMappingEntry.bind(this, _ElementId, _node));
    }
  }
  /**
   *
   *
   * @param {*} _element
   * @returns Promise of the created Node
   * @memberof Graph
   */
  async addNodeAsync(_element) {
    let name = "";
    if (_element instanceof _BIMElement2.default) {
      await _element.initExternalIdAsync();
      if (typeof this.externalIdNodeMapping[_element.externalId.get()] !== "undefined") {
        console.log("BIM OBJECT NODE ALREADY EXISTS");
        return this.externalIdNodeMapping[_element.externalId.get()];
      }
    } else if (_element instanceof _AbstractElement2.default) {
      if (typeof this.guidAbstractNodeMapping[_element.id.get()] !== "undefined") {
        console.log("ABSTRACT OBJECT NODE ALREADY EXISTS");
        return this.guidAbstractNodeMapping[_element.id.get()];
      }
    }
    if (typeof _element.name !== "undefined") {
      name = _element.name.get();
    }
    let node = new _SpinalNode2.default(name, _element, this);
    return node;
  }
  /**
   *
   *
   * @param {*} _element
   * @returns the created Node
   * @memberof Graph
   */
  addNode(_element) {
    let name = "";
    if (_element instanceof _BIMElement2.default) {
      _element.initExternalId();
      if (typeof this.externalIdNodeMapping[_element.externalId.get()] !== "undefined") {
        console.log("BIM OBJECT NODE ALREADY EXISTS");
        return this.externalIdNodeMapping[_element.externalId.get()];
      }
    } else if (_element instanceof _AbstractElement2.default) {
      if (typeof this.guidAbstractNodeMapping[_element.id.get()] !== "undefined") {
        console.log("ABSTRACT OBJECT NODE ALREADY EXISTS");
        return this.guidAbstractNodeMapping[_element.id.get()];
      }
    }
    if (typeof _element.name !== "undefined") {
      name = _element.name.get();
    }
    let node = new _SpinalNode2.default(name, _element, this);
    return node;
  }
  /**
   *
   *
   * @param {*} _node
   * @memberof Graph
   */
  classifyNode(_node) {
    _Utilities.Utilities.promiseLoad(_node.element).then(element => {
      if (typeof _node.graph === "undefined") _node.graph.set(this);
      this.nodeList.load(nodeList => {
        nodeList.push(_node);
      });
      let type = "UnClassified";
      if (typeof element.type != "undefined" && element.type.get() != "") {
        type = element.type.get();
      }
      if (this.nodeListByElementType[type]) {
        this.nodeListByElementType[type].load(nodeListOfType => {
          nodeListOfType.push(_node);
        });
      } else {
        let nodeListOfType = new Lst();
        nodeListOfType.push(_node);
        this.nodeListByElementType.add_attr({
          [type]: new Ptr(nodeListOfType)
        });
      }
      if (element instanceof _BIMElement2.default) {
        let _dbid = element.id.get();
        if (typeof _dbid == "number") if (_dbid != 0) {
          this._addExternalIdNodeMappingEntry(element.id, _node);
        } else {
          element.id.bind(this._addExternalIdNodeMappingEntry.bind(null, element.id, _node));
        }
      } else if (element instanceof _AbstractElement2.default) {
        this.guidAbstractNodeMapping.add_attr({
          [element.id.get()]: _node
        });
      }
    });
  }

  // addNodes(_vertices) {
  //   for (let index = 0; index < _vertices.length; index++) {
  //     this.classifyNode(_vertices[index])
  //   }
  // }
  /**
   *
   *
   * @param {*} _relationType
   * @param {*} _node
   * @param {*} _element
   * @param {*} _isDirected
   * @returns Promise of the created Relation
   * @memberof Graph
   */
  async addSimpleRelationAsync(_relationType, _node, _element, _isDirected) {
    let node2 = await this.addNodeAsync(_element);
    let rel = new _SpinalRelation2.default(_relationType, [_node], [node2], _isDirected);
    this.addRelation(rel);
    return rel;
  }
  /**
   *
   *
   * @param {*} _relationType
   * @param {*} _node
   * @param {*} _element
   * @param {*} _isDirected
   * @returns the created Relation
   * @memberof Graph
   */
  addSimpleRelation(_relationType, _node, _element, _isDirected) {
    let node2 = this.addNode(_element);
    let rel = new _SpinalRelation2.default(_relationType, [_node], [node2], _isDirected);
    this.addRelation(rel);
    return rel;
  }
  /**
   *
   *
   * @param {*} _relation
   * @memberof Graph
   */
  addRelation(_relation) {

    if (_relation.isDirected.get()) {
      for (let index = 0; index < _relation.nodeList1.length; index++) {
        const node = _relation.nodeList1[index];
        node.addDirectedRelationParent(_relation);
      }
      for (let index = 0; index < _relation.nodeList2.length; index++) {
        const node = _relation.nodeList2[index];
        node.addDirectedRelationChild(_relation);
      }
    } else {
      for (let index = 0; index < _relation.nodeList1.length; index++) {
        const node = _relation.nodeList1[index];
        node.addNonDirectedRelation(_relation);
      }
      for (let index = 0; index < _relation.nodeList2.length; index++) {
        const node = _relation.nodeList2[index];
        node.addNonDirectedRelation(_relation);
      }
    }
    this._classifyRelation(_relation);
  }
  /**
   *
   *
   * @param {*} _relations
   * @memberof Graph
   */
  addRelations(_relations) {
    for (let index = 0; index < _relations.length; index++) {
      const relation = _relations[index];
      this.addRelation(relation);
    }
  }
  /**
   *
   *
   * @param {*} _relation
   * @memberof Graph
   */
  _classifyRelation(_relation) {
    this.relationList.load(relationList => {
      relationList.push(_relation);
    });
    if (this.relationListByType[_relation.type.get()]) {
      this.relationListByType[_relation.type.get()].load(relationListOfType => {
        relationListOfType.push(_relation);
      });
    } else {
      let relationListOfType = new Lst();
      relationListOfType.push(_relation);
      this.relationListByType.add_attr({
        [_relation.type.get()]: new Ptr(relationListOfType)
      });
    }
  }
  /**
   *
   *
   * @param {*} _relations
   * @memberof Graph
   */
  _classifyRelations(_relations) {
    for (let index = 0; index < _relations.length; index++) {
      this.classRelation(_relations[index]);
    }
  }
  /**
   *
   *
   * @param {*} _list
   * @memberof Graph
   */
  _addNotExistingNodesFromList(_list) {
    this.nodeList.load(nodeList => {
      for (let i = 0; i < _list.length; i++) {
        let node = _list[i];
        if (!_Utilities.Utilities.contains(nodeList, node)) {
          this.classifyNode(node);
        }
      }
    });
  }
  /**
   *
   *
   * @param {*} _relation
   * @memberof Graph
   */
  _addNotExistingNodesFromRelation(_relation) {
    this._addNotExistingNodesFromList(_relation.nodeList1);
    this._addNotExistingNodesFromList(_relation.nodeList2);
  }
  /**
   *
   *
   * @param {*} _name
   * @param {*} _usedRelations
   * @param {*} _startingNode
   * @param {*} _usedGraph
   * @returns the created Context
   * @memberof Graph
   */
  addContext(_name, _usedRelations, _startingNode, _usedGraph) {
    let context = new _SpinalContext2.default(_name, _usedRelations, _startingNode, _usedGraph);
    this.contextList.push(context);
    return context;
  }
}

exports.default = Graph;
spinalCore.register_models([Graph]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9HcmFwaC5qcyJdLCJuYW1lcyI6WyJzcGluYWxDb3JlIiwicmVxdWlyZSIsImdsb2JhbFR5cGUiLCJ3aW5kb3ciLCJnbG9iYWwiLCJHcmFwaCIsIk1vZGVsIiwiY29uc3RydWN0b3IiLCJfbmFtZSIsIl9zdGFydGluZ05vZGUiLCJuYW1lIiwiRmlsZVN5c3RlbSIsIl9zaWdfc2VydmVyIiwiYWRkX2F0dHIiLCJleHRlcm5hbElkTm9kZU1hcHBpbmciLCJndWlkQWJzdHJhY3ROb2RlTWFwcGluZyIsInN0YXJ0aW5nTm9kZSIsIlB0ciIsIm5vZGVMaXN0IiwiTHN0Iiwibm9kZUxpc3RCeUVsZW1lbnRUeXBlIiwicmVsYXRpb25MaXN0IiwicmVsYXRpb25MaXN0QnlUeXBlIiwiY29udGV4dExpc3QiLCJpbml0Iiwic3BpbmFsIiwiY29udGV4dFN0dWRpbyIsImdyYXBoIiwiU3BpbmFsTm9kZSIsIlNwaW5hbFJlbGF0aW9uIiwiQWJzdHJhY3RFbGVtZW50IiwiQklNRWxlbWVudCIsIlV0aWxpdGllcyIsImdldE5vZGVCeWRiSWQiLCJfZGJJZCIsIl9leHRlcm5hbElkIiwiZ2V0RXh0ZXJuYWxJZCIsIkJJTUVsZW1lbnQxIiwiaW5pdEV4dGVybmFsSWQiLCJub2RlIiwiYWRkTm9kZUFzeW5jIiwidHlwZSIsImdldCIsImJpbmQiLCJfY2xhc3NpZnlCSU1FbGVtZW50Tm9kZSIsIl9ub2RlIiwiY2xhc3NpZnlOb2RlIiwiZ2V0RGJJZEJ5Tm9kZSIsImVsZW1lbnQiLCJwcm9taXNlTG9hZCIsImlkIiwic2V0TmFtZSIsInNldCIsInNldFN0YXJ0aW5nTm9kZSIsIl9hZGRFeHRlcm5hbElkTm9kZU1hcHBpbmdFbnRyeSIsIl9FbGVtZW50SWQiLCJfZGJpZCIsImV4dGVybmFsSWQiLCJ1bmJpbmQiLCJfZWxlbWVudCIsImluaXRFeHRlcm5hbElkQXN5bmMiLCJjb25zb2xlIiwibG9nIiwiYWRkTm9kZSIsInRoZW4iLCJsb2FkIiwicHVzaCIsIm5vZGVMaXN0T2ZUeXBlIiwiYWRkU2ltcGxlUmVsYXRpb25Bc3luYyIsIl9yZWxhdGlvblR5cGUiLCJfaXNEaXJlY3RlZCIsIm5vZGUyIiwicmVsIiwiYWRkUmVsYXRpb24iLCJhZGRTaW1wbGVSZWxhdGlvbiIsIl9yZWxhdGlvbiIsImlzRGlyZWN0ZWQiLCJpbmRleCIsIm5vZGVMaXN0MSIsImxlbmd0aCIsImFkZERpcmVjdGVkUmVsYXRpb25QYXJlbnQiLCJub2RlTGlzdDIiLCJhZGREaXJlY3RlZFJlbGF0aW9uQ2hpbGQiLCJhZGROb25EaXJlY3RlZFJlbGF0aW9uIiwiX2NsYXNzaWZ5UmVsYXRpb24iLCJhZGRSZWxhdGlvbnMiLCJfcmVsYXRpb25zIiwicmVsYXRpb24iLCJyZWxhdGlvbkxpc3RPZlR5cGUiLCJfY2xhc3NpZnlSZWxhdGlvbnMiLCJjbGFzc1JlbGF0aW9uIiwiX2FkZE5vdEV4aXN0aW5nTm9kZXNGcm9tTGlzdCIsIl9saXN0IiwiaSIsImNvbnRhaW5zIiwiX2FkZE5vdEV4aXN0aW5nTm9kZXNGcm9tUmVsYXRpb24iLCJhZGRDb250ZXh0IiwiX3VzZWRSZWxhdGlvbnMiLCJfdXNlZEdyYXBoIiwiY29udGV4dCIsIlNwaW5hbENvbnRleHQiLCJyZWdpc3Rlcl9tb2RlbHMiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUVBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFFQTs7OztBQVJBLE1BQU1BLGFBQWFDLFFBQVEseUJBQVIsQ0FBbkI7QUFDQSxNQUFNQyxhQUFhLE9BQU9DLE1BQVAsS0FBa0IsV0FBbEIsR0FBZ0NDLE1BQWhDLEdBQXlDRCxNQUE1RDs7QUFVQTs7Ozs7OztBQU9lLE1BQU1FLEtBQU4sU0FBb0JILFdBQVdJLEtBQS9CLENBQXFDO0FBQ2xEOzs7Ozs7O0FBT0FDLGNBQVlDLEtBQVosRUFBbUJDLGFBQW5CLEVBQWtDQyxPQUFPLE9BQXpDLEVBQWtEO0FBQ2hEO0FBQ0EsUUFBSUMsV0FBV0MsV0FBZixFQUE0QjtBQUMxQixXQUFLQyxRQUFMLENBQWM7QUFDWkgsY0FB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Q0FBbkI7QUFDRDtBQUNGO0FBQ0Q7Ozs7OztBQU1BYywrQkFBNkJDLEtBQTdCLEVBQW9DO0FBQ2xDLFNBQUsxRSxRQUFMLENBQWMrQyxJQUFkLENBQW1CL0MsWUFBWTtBQUM3QixXQUFLLElBQUkyRSxJQUFJLENBQWIsRUFBZ0JBLElBQUlELE1BQU1iLE1BQTFCLEVBQWtDYyxHQUFsQyxFQUF1QztBQUNyQyxZQUFJdEQsT0FBT3FELE1BQU1DLENBQU4sQ0FBWDtBQUNBLFlBQUksQ0FBQzdELHFCQUFVOEQsUUFBVixDQUFtQjVFLFFBQW5CLEVBQTZCcUIsSUFBN0IsQ0FBTCxFQUF5QztBQUN2QyxlQUFLTyxZQUFMLENBQWtCUCxJQUFsQjtBQUNEO0FBQ0Y7QUFDRixLQVBEO0FBUUQ7QUFDRDs7Ozs7O0FBTUF3RCxtQ0FBaUNwQixTQUFqQyxFQUE0QztBQUMxQyxTQUFLZ0IsNEJBQUwsQ0FBa0NoQixVQUFVRyxTQUE1QztBQUNBLFNBQUthLDRCQUFMLENBQWtDaEIsVUFBVU0sU0FBNUM7QUFDRDtBQUNEOzs7Ozs7Ozs7O0FBVUFlLGFBQVd4RixLQUFYLEVBQWtCeUYsY0FBbEIsRUFBa0N4RixhQUFsQyxFQUFpRHlGLFVBQWpELEVBQTZEO0FBQzNELFFBQUlDLFVBQVUsSUFBSUMsdUJBQUosQ0FBa0I1RixLQUFsQixFQUF5QnlGLGNBQXpCLEVBQXlDeEYsYUFBekMsRUFDWnlGLFVBRFksQ0FBZDtBQUVBLFNBQUszRSxXQUFMLENBQWlCMkMsSUFBakIsQ0FBc0JpQyxPQUF0QjtBQUNBLFdBQU9BLE9BQVA7QUFDRDtBQXpZaUQ7O2tCQUEvQjlGLEs7QUE0WXJCTCxXQUFXcUcsZUFBWCxDQUEyQixDQUFDaEcsS0FBRCxDQUEzQiIsImZpbGUiOiJHcmFwaC5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHNwaW5hbENvcmUgPSByZXF1aXJlKFwic3BpbmFsLWNvcmUtY29ubmVjdG9yanNcIik7XG5jb25zdCBnbG9iYWxUeXBlID0gdHlwZW9mIHdpbmRvdyA9PT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHdpbmRvdztcbmltcG9ydCBTcGluYWxOb2RlIGZyb20gXCIuL1NwaW5hbE5vZGVcIjtcbmltcG9ydCBTcGluYWxSZWxhdGlvbiBmcm9tIFwiLi9TcGluYWxSZWxhdGlvblwiO1xuaW1wb3J0IEFic3RyYWN0RWxlbWVudCBmcm9tIFwiLi9BYnN0cmFjdEVsZW1lbnRcIjtcbmltcG9ydCBCSU1FbGVtZW50IGZyb20gXCIuL0JJTUVsZW1lbnRcIjtcbmltcG9ydCBTcGluYWxDb250ZXh0IGZyb20gXCIuL1NwaW5hbENvbnRleHRcIjtcblxuaW1wb3J0IHtcbiAgVXRpbGl0aWVzXG59IGZyb20gXCIuL1V0aWxpdGllc1wiO1xuLyoqXG4gKlxuICpcbiAqIEBleHBvcnRcbiAqIEBjbGFzcyBHcmFwaFxuICogQGV4dGVuZHMge2dsb2JhbFR5cGUuTW9kZWx9XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyYXBoIGV4dGVuZHMgZ2xvYmFsVHlwZS5Nb2RlbCB7XG4gIC8qKlxuICAgKkNyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgR3JhcGguXG4gICAqIEBwYXJhbSB7Kn0gX25hbWVcbiAgICogQHBhcmFtIHsqfSBfc3RhcnRpbmdOb2RlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbbmFtZT1cIkdyYXBoXCJdXG4gICAqIEBtZW1iZXJvZiBHcmFwaFxuICAgKi9cbiAgY29uc3RydWN0b3IoX25hbWUsIF9zdGFydGluZ05vZGUsIG5hbWUgPSBcIkdyYXBoXCIpIHtcbiAgICBzdXBlcigpO1xuICAgIGlmIChGaWxlU3lzdGVtLl9zaWdfc2VydmVyKSB7XG4gICAgICB0aGlzLmFkZF9hdHRyKHtcbiAgICAgICAgbmFtZTogX25hbWUgfHwgXCJcIixcbiAgICAgICAgZXh0ZXJuYWxJZE5vZGVNYXBwaW5nOiBuZXcgTW9kZWwoKSxcbiAgICAgICAgZ3VpZEFic3RyYWN0Tm9kZU1hcHBpbmc6IG5ldyBNb2RlbCgpLFxuICAgICAgICBzdGFydGluZ05vZGU6IF9zdGFydGluZ05vZGUgfHwgbmV3IFB0cigwKSxcbiAgICAgICAgbm9kZUxpc3Q6IG5ldyBQdHIobmV3IExzdCgpKSxcbiAgICAgICAgbm9kZUxpc3RCeUVsZW1lbnRUeXBlOiBuZXcgTW9kZWwoKSxcbiAgICAgICAgcmVsYXRpb25MaXN0OiBuZXcgUHRyKG5ldyBMc3QoKSksXG4gICAgICAgIHJlbGF0aW9uTGlzdEJ5VHlwZTogbmV3IE1vZGVsKCksXG4gICAgICAgIGNvbnRleHRMaXN0OiBuZXcgTHN0KClcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQG1lbWJlcm9mIEdyYXBoXG4gICAqL1xuICBpbml0KCkge1xuICAgIGdsb2JhbFR5cGUuc3BpbmFsLmNvbnRleHRTdHVkaW8gPSB7fTtcbiAgICBnbG9iYWxUeXBlLnNwaW5hbC5jb250ZXh0U3R1ZGlvLmdyYXBoID0gdGhpcztcbiAgICBnbG9iYWxUeXBlLnNwaW5hbC5jb250ZXh0U3R1ZGlvLlNwaW5hbE5vZGUgPSBTcGluYWxOb2RlO1xuICAgIGdsb2JhbFR5cGUuc3BpbmFsLmNvbnRleHRTdHVkaW8uU3BpbmFsUmVsYXRpb24gPSBTcGluYWxSZWxhdGlvbjtcbiAgICBnbG9iYWxUeXBlLnNwaW5hbC5jb250ZXh0U3R1ZGlvLkFic3RyYWN0RWxlbWVudCA9IEFic3RyYWN0RWxlbWVudDtcbiAgICBnbG9iYWxUeXBlLnNwaW5hbC5jb250ZXh0U3R1ZGlvLkJJTUVsZW1lbnQgPSBCSU1FbGVtZW50O1xuICAgIGdsb2JhbFR5cGUuc3BpbmFsLmNvbnRleHRTdHVkaW8uVXRpbGl0aWVzID0gVXRpbGl0aWVzO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0geyp9IF9kYklkXG4gICAqIEByZXR1cm5zIFByb21pc2Ugb2YgdGhlIGNvcnJlc3BvbmRpbmcgTm9kZSBcbiAgICogQG1lbWJlcm9mIEdyYXBoXG4gICAqL1xuICBhc3luYyBnZXROb2RlQnlkYklkKF9kYklkKSB7XG4gICAgbGV0IF9leHRlcm5hbElkID0gYXdhaXQgVXRpbGl0aWVzLmdldEV4dGVybmFsSWQoX2RiSWQpO1xuICAgIGlmICh0eXBlb2YgdGhpcy5leHRlcm5hbElkTm9kZU1hcHBpbmdbX2V4dGVybmFsSWRdICE9PSBcInVuZGVmaW5lZFwiKVxuICAgICAgcmV0dXJuIHRoaXMuZXh0ZXJuYWxJZE5vZGVNYXBwaW5nW19leHRlcm5hbElkXTtcbiAgICBlbHNlIHtcbiAgICAgIGxldCBCSU1FbGVtZW50MSA9IG5ldyBCSU1FbGVtZW50KF9kYklkKTtcbiAgICAgIEJJTUVsZW1lbnQxLmluaXRFeHRlcm5hbElkKCk7XG4gICAgICBsZXQgbm9kZSA9IGF3YWl0IHRoaXMuYWRkTm9kZUFzeW5jKEJJTUVsZW1lbnQxKTtcbiAgICAgIGlmIChCSU1FbGVtZW50MS50eXBlLmdldCgpID09PSBcIlwiKSB7XG4gICAgICAgIEJJTUVsZW1lbnQxLnR5cGUuYmluZChcbiAgICAgICAgICB0aGlzLl9jbGFzc2lmeUJJTUVsZW1lbnROb2RlLmJpbmQodGhpcywgbm9kZSlcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBub2RlO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHsqfSBfbm9kZVxuICAgKiBAbWVtYmVyb2YgR3JhcGhcbiAgICovXG4gIGFzeW5jIF9jbGFzc2lmeUJJTUVsZW1lbnROb2RlKF9ub2RlKSB7XG4gICAgLy9UT0RPIERFTEVURSBPTEQgQ0xBU1NJRklDQVRJT05cbiAgICB0aGlzLmNsYXNzaWZ5Tm9kZShfbm9kZSk7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7Kn0gX25vZGVcbiAgICogQHJldHVybnMgZGJJZFxuICAgKiBAbWVtYmVyb2YgR3JhcGhcbiAgICovXG4gIGFzeW5jIGdldERiSWRCeU5vZGUoX25vZGUpIHtcbiAgICBsZXQgZWxlbWVudCA9IGF3YWl0IFV0aWxpdGllcy5wcm9taXNlTG9hZChfbm9kZS5lbGVtZW50KTtcbiAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEJJTUVsZW1lbnQpIHtcbiAgICAgIHJldHVybiBlbGVtZW50LmlkLmdldCgpO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHsqfSBfbmFtZVxuICAgKiBAbWVtYmVyb2YgR3JhcGhcbiAgICovXG4gIHNldE5hbWUoX25hbWUpIHtcbiAgICB0aGlzLm5hbWUuc2V0KF9uYW1lKTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHsqfSBfc3RhcnRpbmdOb2RlXG4gICAqIEBtZW1iZXJvZiBHcmFwaFxuICAgKi9cbiAgc2V0U3RhcnRpbmdOb2RlKF9zdGFydGluZ05vZGUpIHtcbiAgICB0aGlzLnN0YXJ0aW5nTm9kZS5zZXQoX3N0YXJ0aW5nTm9kZSk7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7Kn0gX0VsZW1lbnRJZFxuICAgKiBAcGFyYW0geyp9IF9ub2RlXG4gICAqIEBtZW1iZXJvZiBHcmFwaFxuICAgKi9cbiAgYXN5bmMgX2FkZEV4dGVybmFsSWROb2RlTWFwcGluZ0VudHJ5KF9FbGVtZW50SWQsIF9ub2RlKSB7XG4gICAgbGV0IF9kYmlkID0gX0VsZW1lbnRJZC5nZXQoKTtcbiAgICBpZiAodHlwZW9mIF9kYmlkID09IFwibnVtYmVyXCIpXG4gICAgICBpZiAoX2RiaWQgIT0gMCkge1xuICAgICAgICBsZXQgZXh0ZXJuYWxJZCA9IGF3YWl0IFV0aWxpdGllcy5nZXRFeHRlcm5hbElkKF9kYmlkKTtcbiAgICAgICAgbGV0IGVsZW1lbnQgPSBhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQoX25vZGUuZWxlbWVudCk7XG4gICAgICAgIGF3YWl0IGVsZW1lbnQuaW5pdEV4dGVybmFsSWQoKTtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmV4dGVybmFsSWROb2RlTWFwcGluZ1tleHRlcm5hbElkXSA9PT0gXCJ1bmRlZmluZWRcIilcbiAgICAgICAgICB0aGlzLmV4dGVybmFsSWROb2RlTWFwcGluZy5hZGRfYXR0cih7XG4gICAgICAgICAgICBbZXh0ZXJuYWxJZF06IF9ub2RlXG4gICAgICAgICAgfSk7XG4gICAgICAgIF9FbGVtZW50SWQudW5iaW5kKFxuICAgICAgICAgIHRoaXMuX2FkZEV4dGVybmFsSWROb2RlTWFwcGluZ0VudHJ5LmJpbmQodGhpcywgX0VsZW1lbnRJZCxcbiAgICAgICAgICAgIF9ub2RlKVxuICAgICAgICApO1xuICAgICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0geyp9IF9lbGVtZW50XG4gICAqIEByZXR1cm5zIFByb21pc2Ugb2YgdGhlIGNyZWF0ZWQgTm9kZVxuICAgKiBAbWVtYmVyb2YgR3JhcGhcbiAgICovXG4gIGFzeW5jIGFkZE5vZGVBc3luYyhfZWxlbWVudCkge1xuICAgIGxldCBuYW1lID0gXCJcIjtcbiAgICBpZiAoX2VsZW1lbnQgaW5zdGFuY2VvZiBCSU1FbGVtZW50KSB7XG4gICAgICBhd2FpdCBfZWxlbWVudC5pbml0RXh0ZXJuYWxJZEFzeW5jKCk7XG4gICAgICBpZiAoXG4gICAgICAgIHR5cGVvZiB0aGlzLmV4dGVybmFsSWROb2RlTWFwcGluZ1tfZWxlbWVudC5leHRlcm5hbElkLmdldCgpXSAhPT1cbiAgICAgICAgXCJ1bmRlZmluZWRcIlxuICAgICAgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQklNIE9CSkVDVCBOT0RFIEFMUkVBRFkgRVhJU1RTXCIpO1xuICAgICAgICByZXR1cm4gdGhpcy5leHRlcm5hbElkTm9kZU1hcHBpbmdbX2VsZW1lbnQuZXh0ZXJuYWxJZC5nZXQoKV07XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChfZWxlbWVudCBpbnN0YW5jZW9mIEFic3RyYWN0RWxlbWVudCkge1xuICAgICAgaWYgKFxuICAgICAgICB0eXBlb2YgdGhpcy5ndWlkQWJzdHJhY3ROb2RlTWFwcGluZ1tfZWxlbWVudC5pZC5nZXQoKV0gIT09XG4gICAgICAgIFwidW5kZWZpbmVkXCJcbiAgICAgICkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkFCU1RSQUNUIE9CSkVDVCBOT0RFIEFMUkVBRFkgRVhJU1RTXCIpO1xuICAgICAgICByZXR1cm4gdGhpcy5ndWlkQWJzdHJhY3ROb2RlTWFwcGluZ1tfZWxlbWVudC5pZC5nZXQoKV07XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0eXBlb2YgX2VsZW1lbnQubmFtZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgbmFtZSA9IF9lbGVtZW50Lm5hbWUuZ2V0KCk7XG4gICAgfVxuICAgIGxldCBub2RlID0gbmV3IFNwaW5hbE5vZGUobmFtZSwgX2VsZW1lbnQsIHRoaXMpO1xuICAgIHJldHVybiBub2RlO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0geyp9IF9lbGVtZW50XG4gICAqIEByZXR1cm5zIHRoZSBjcmVhdGVkIE5vZGVcbiAgICogQG1lbWJlcm9mIEdyYXBoXG4gICAqL1xuICBhZGROb2RlKF9lbGVtZW50KSB7XG4gICAgbGV0IG5hbWUgPSBcIlwiO1xuICAgIGlmIChfZWxlbWVudCBpbnN0YW5jZW9mIEJJTUVsZW1lbnQpIHtcbiAgICAgIF9lbGVtZW50LmluaXRFeHRlcm5hbElkKCk7XG4gICAgICBpZiAoXG4gICAgICAgIHR5cGVvZiB0aGlzLmV4dGVybmFsSWROb2RlTWFwcGluZ1tfZWxlbWVudC5leHRlcm5hbElkLmdldCgpXSAhPT1cbiAgICAgICAgXCJ1bmRlZmluZWRcIlxuICAgICAgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQklNIE9CSkVDVCBOT0RFIEFMUkVBRFkgRVhJU1RTXCIpO1xuICAgICAgICByZXR1cm4gdGhpcy5leHRlcm5hbElkTm9kZU1hcHBpbmdbX2VsZW1lbnQuZXh0ZXJuYWxJZC5nZXQoKV07XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChfZWxlbWVudCBpbnN0YW5jZW9mIEFic3RyYWN0RWxlbWVudCkge1xuICAgICAgaWYgKFxuICAgICAgICB0eXBlb2YgdGhpcy5ndWlkQWJzdHJhY3ROb2RlTWFwcGluZ1tfZWxlbWVudC5pZC5nZXQoKV0gIT09XG4gICAgICAgIFwidW5kZWZpbmVkXCJcbiAgICAgICkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkFCU1RSQUNUIE9CSkVDVCBOT0RFIEFMUkVBRFkgRVhJU1RTXCIpO1xuICAgICAgICByZXR1cm4gdGhpcy5ndWlkQWJzdHJhY3ROb2RlTWFwcGluZ1tfZWxlbWVudC5pZC5nZXQoKV07XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0eXBlb2YgX2VsZW1lbnQubmFtZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgbmFtZSA9IF9lbGVtZW50Lm5hbWUuZ2V0KCk7XG4gICAgfVxuICAgIGxldCBub2RlID0gbmV3IFNwaW5hbE5vZGUobmFtZSwgX2VsZW1lbnQsIHRoaXMpO1xuICAgIHJldHVybiBub2RlO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0geyp9IF9ub2RlXG4gICAqIEBtZW1iZXJvZiBHcmFwaFxuICAgKi9cbiAgY2xhc3NpZnlOb2RlKF9ub2RlKSB7XG4gICAgVXRpbGl0aWVzLnByb21pc2VMb2FkKF9ub2RlLmVsZW1lbnQpLnRoZW4oZWxlbWVudCA9PiB7XG4gICAgICBpZiAodHlwZW9mIF9ub2RlLmdyYXBoID09PSBcInVuZGVmaW5lZFwiKSBfbm9kZS5ncmFwaC5zZXQodGhpcyk7XG4gICAgICB0aGlzLm5vZGVMaXN0LmxvYWQobm9kZUxpc3QgPT4ge1xuICAgICAgICBub2RlTGlzdC5wdXNoKF9ub2RlKTtcbiAgICAgIH0pO1xuICAgICAgbGV0IHR5cGUgPSBcIlVuQ2xhc3NpZmllZFwiO1xuICAgICAgaWYgKHR5cGVvZiBlbGVtZW50LnR5cGUgIT0gXCJ1bmRlZmluZWRcIiAmJiBlbGVtZW50LnR5cGUuZ2V0KCkgIT1cbiAgICAgICAgXCJcIikge1xuICAgICAgICB0eXBlID0gZWxlbWVudC50eXBlLmdldCgpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMubm9kZUxpc3RCeUVsZW1lbnRUeXBlW3R5cGVdKSB7XG4gICAgICAgIHRoaXMubm9kZUxpc3RCeUVsZW1lbnRUeXBlW3R5cGVdLmxvYWQobm9kZUxpc3RPZlR5cGUgPT4ge1xuICAgICAgICAgIG5vZGVMaXN0T2ZUeXBlLnB1c2goX25vZGUpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBub2RlTGlzdE9mVHlwZSA9IG5ldyBMc3QoKTtcbiAgICAgICAgbm9kZUxpc3RPZlR5cGUucHVzaChfbm9kZSk7XG4gICAgICAgIHRoaXMubm9kZUxpc3RCeUVsZW1lbnRUeXBlLmFkZF9hdHRyKHtcbiAgICAgICAgICBbdHlwZV06IG5ldyBQdHIobm9kZUxpc3RPZlR5cGUpXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBCSU1FbGVtZW50KSB7XG4gICAgICAgIGxldCBfZGJpZCA9IGVsZW1lbnQuaWQuZ2V0KCk7XG4gICAgICAgIGlmICh0eXBlb2YgX2RiaWQgPT0gXCJudW1iZXJcIilcbiAgICAgICAgICBpZiAoX2RiaWQgIT0gMCkge1xuICAgICAgICAgICAgdGhpcy5fYWRkRXh0ZXJuYWxJZE5vZGVNYXBwaW5nRW50cnkoZWxlbWVudC5pZCwgX25vZGUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbGVtZW50LmlkLmJpbmQoXG4gICAgICAgICAgICAgIHRoaXMuX2FkZEV4dGVybmFsSWROb2RlTWFwcGluZ0VudHJ5LmJpbmQobnVsbCwgZWxlbWVudC5pZCxcbiAgICAgICAgICAgICAgICBfbm9kZSlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChlbGVtZW50IGluc3RhbmNlb2YgQWJzdHJhY3RFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuZ3VpZEFic3RyYWN0Tm9kZU1hcHBpbmcuYWRkX2F0dHIoe1xuICAgICAgICAgIFtlbGVtZW50LmlkLmdldCgpXTogX25vZGVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvLyBhZGROb2RlcyhfdmVydGljZXMpIHtcbiAgLy8gICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX3ZlcnRpY2VzLmxlbmd0aDsgaW5kZXgrKykge1xuICAvLyAgICAgdGhpcy5jbGFzc2lmeU5vZGUoX3ZlcnRpY2VzW2luZGV4XSlcbiAgLy8gICB9XG4gIC8vIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7Kn0gX3JlbGF0aW9uVHlwZVxuICAgKiBAcGFyYW0geyp9IF9ub2RlXG4gICAqIEBwYXJhbSB7Kn0gX2VsZW1lbnRcbiAgICogQHBhcmFtIHsqfSBfaXNEaXJlY3RlZFxuICAgKiBAcmV0dXJucyBQcm9taXNlIG9mIHRoZSBjcmVhdGVkIFJlbGF0aW9uXG4gICAqIEBtZW1iZXJvZiBHcmFwaFxuICAgKi9cbiAgYXN5bmMgYWRkU2ltcGxlUmVsYXRpb25Bc3luYyhfcmVsYXRpb25UeXBlLCBfbm9kZSwgX2VsZW1lbnQsIF9pc0RpcmVjdGVkKSB7XG4gICAgbGV0IG5vZGUyID0gYXdhaXQgdGhpcy5hZGROb2RlQXN5bmMoX2VsZW1lbnQpO1xuICAgIGxldCByZWwgPSBuZXcgU3BpbmFsUmVsYXRpb24oX3JlbGF0aW9uVHlwZSwgW19ub2RlXSwgW25vZGUyXSxcbiAgICAgIF9pc0RpcmVjdGVkKTtcbiAgICB0aGlzLmFkZFJlbGF0aW9uKHJlbClcbiAgICByZXR1cm4gcmVsO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0geyp9IF9yZWxhdGlvblR5cGVcbiAgICogQHBhcmFtIHsqfSBfbm9kZVxuICAgKiBAcGFyYW0geyp9IF9lbGVtZW50XG4gICAqIEBwYXJhbSB7Kn0gX2lzRGlyZWN0ZWRcbiAgICogQHJldHVybnMgdGhlIGNyZWF0ZWQgUmVsYXRpb25cbiAgICogQG1lbWJlcm9mIEdyYXBoXG4gICAqL1xuICBhZGRTaW1wbGVSZWxhdGlvbihfcmVsYXRpb25UeXBlLCBfbm9kZSwgX2VsZW1lbnQsIF9pc0RpcmVjdGVkKSB7XG4gICAgbGV0IG5vZGUyID0gdGhpcy5hZGROb2RlKF9lbGVtZW50KTtcbiAgICBsZXQgcmVsID0gbmV3IFNwaW5hbFJlbGF0aW9uKF9yZWxhdGlvblR5cGUsIFtfbm9kZV0sIFtub2RlMl0sXG4gICAgICBfaXNEaXJlY3RlZCk7XG4gICAgdGhpcy5hZGRSZWxhdGlvbihyZWwpXG4gICAgcmV0dXJuIHJlbDtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHsqfSBfcmVsYXRpb25cbiAgICogQG1lbWJlcm9mIEdyYXBoXG4gICAqL1xuICBhZGRSZWxhdGlvbihfcmVsYXRpb24pIHtcblxuICAgIGlmIChfcmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKSkge1xuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IF9yZWxhdGlvbi5ub2RlTGlzdDEubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBfcmVsYXRpb24ubm9kZUxpc3QxW2luZGV4XTtcbiAgICAgICAgbm9kZS5hZGREaXJlY3RlZFJlbGF0aW9uUGFyZW50KF9yZWxhdGlvbik7XG4gICAgICB9XG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX3JlbGF0aW9uLm5vZGVMaXN0Mi5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IF9yZWxhdGlvbi5ub2RlTGlzdDJbaW5kZXhdO1xuICAgICAgICBub2RlLmFkZERpcmVjdGVkUmVsYXRpb25DaGlsZChfcmVsYXRpb24pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX3JlbGF0aW9uLm5vZGVMaXN0MS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IF9yZWxhdGlvbi5ub2RlTGlzdDFbaW5kZXhdO1xuICAgICAgICBub2RlLmFkZE5vbkRpcmVjdGVkUmVsYXRpb24oX3JlbGF0aW9uKTtcbiAgICAgIH1cbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBfcmVsYXRpb24ubm9kZUxpc3QyLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCBub2RlID0gX3JlbGF0aW9uLm5vZGVMaXN0MltpbmRleF07XG4gICAgICAgIG5vZGUuYWRkTm9uRGlyZWN0ZWRSZWxhdGlvbihfcmVsYXRpb24pO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9jbGFzc2lmeVJlbGF0aW9uKF9yZWxhdGlvbik7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7Kn0gX3JlbGF0aW9uc1xuICAgKiBAbWVtYmVyb2YgR3JhcGhcbiAgICovXG4gIGFkZFJlbGF0aW9ucyhfcmVsYXRpb25zKSB7XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IF9yZWxhdGlvbnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCByZWxhdGlvbiA9IF9yZWxhdGlvbnNbaW5kZXhdO1xuICAgICAgdGhpcy5hZGRSZWxhdGlvbihyZWxhdGlvbik7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0geyp9IF9yZWxhdGlvblxuICAgKiBAbWVtYmVyb2YgR3JhcGhcbiAgICovXG4gIF9jbGFzc2lmeVJlbGF0aW9uKF9yZWxhdGlvbikge1xuICAgIHRoaXMucmVsYXRpb25MaXN0LmxvYWQocmVsYXRpb25MaXN0ID0+IHtcbiAgICAgIHJlbGF0aW9uTGlzdC5wdXNoKF9yZWxhdGlvbik7XG4gICAgfSk7XG4gICAgaWYgKHRoaXMucmVsYXRpb25MaXN0QnlUeXBlW19yZWxhdGlvbi50eXBlLmdldCgpXSkge1xuICAgICAgdGhpcy5yZWxhdGlvbkxpc3RCeVR5cGVbX3JlbGF0aW9uLnR5cGUuZ2V0KCldLmxvYWQocmVsYXRpb25MaXN0T2ZUeXBlID0+IHtcbiAgICAgICAgcmVsYXRpb25MaXN0T2ZUeXBlLnB1c2goX3JlbGF0aW9uKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcmVsYXRpb25MaXN0T2ZUeXBlID0gbmV3IExzdCgpO1xuICAgICAgcmVsYXRpb25MaXN0T2ZUeXBlLnB1c2goX3JlbGF0aW9uKTtcbiAgICAgIHRoaXMucmVsYXRpb25MaXN0QnlUeXBlLmFkZF9hdHRyKHtcbiAgICAgICAgW19yZWxhdGlvbi50eXBlLmdldCgpXTogbmV3IFB0cihyZWxhdGlvbkxpc3RPZlR5cGUpXG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7Kn0gX3JlbGF0aW9uc1xuICAgKiBAbWVtYmVyb2YgR3JhcGhcbiAgICovXG4gIF9jbGFzc2lmeVJlbGF0aW9ucyhfcmVsYXRpb25zKSB7XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IF9yZWxhdGlvbnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICB0aGlzLmNsYXNzUmVsYXRpb24oX3JlbGF0aW9uc1tpbmRleF0pO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHsqfSBfbGlzdFxuICAgKiBAbWVtYmVyb2YgR3JhcGhcbiAgICovXG4gIF9hZGROb3RFeGlzdGluZ05vZGVzRnJvbUxpc3QoX2xpc3QpIHtcbiAgICB0aGlzLm5vZGVMaXN0LmxvYWQobm9kZUxpc3QgPT4ge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBfbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgbm9kZSA9IF9saXN0W2ldO1xuICAgICAgICBpZiAoIVV0aWxpdGllcy5jb250YWlucyhub2RlTGlzdCwgbm9kZSkpIHtcbiAgICAgICAgICB0aGlzLmNsYXNzaWZ5Tm9kZShub2RlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0geyp9IF9yZWxhdGlvblxuICAgKiBAbWVtYmVyb2YgR3JhcGhcbiAgICovXG4gIF9hZGROb3RFeGlzdGluZ05vZGVzRnJvbVJlbGF0aW9uKF9yZWxhdGlvbikge1xuICAgIHRoaXMuX2FkZE5vdEV4aXN0aW5nTm9kZXNGcm9tTGlzdChfcmVsYXRpb24ubm9kZUxpc3QxKTtcbiAgICB0aGlzLl9hZGROb3RFeGlzdGluZ05vZGVzRnJvbUxpc3QoX3JlbGF0aW9uLm5vZGVMaXN0Mik7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7Kn0gX25hbWVcbiAgICogQHBhcmFtIHsqfSBfdXNlZFJlbGF0aW9uc1xuICAgKiBAcGFyYW0geyp9IF9zdGFydGluZ05vZGVcbiAgICogQHBhcmFtIHsqfSBfdXNlZEdyYXBoXG4gICAqIEByZXR1cm5zIHRoZSBjcmVhdGVkIENvbnRleHRcbiAgICogQG1lbWJlcm9mIEdyYXBoXG4gICAqL1xuICBhZGRDb250ZXh0KF9uYW1lLCBfdXNlZFJlbGF0aW9ucywgX3N0YXJ0aW5nTm9kZSwgX3VzZWRHcmFwaCkge1xuICAgIGxldCBjb250ZXh0ID0gbmV3IFNwaW5hbENvbnRleHQoX25hbWUsIF91c2VkUmVsYXRpb25zLCBfc3RhcnRpbmdOb2RlLFxuICAgICAgX3VzZWRHcmFwaClcbiAgICB0aGlzLmNvbnRleHRMaXN0LnB1c2goY29udGV4dClcbiAgICByZXR1cm4gY29udGV4dDtcbiAgfVxufVxuXG5zcGluYWxDb3JlLnJlZ2lzdGVyX21vZGVscyhbR3JhcGhdKTsiXX0=