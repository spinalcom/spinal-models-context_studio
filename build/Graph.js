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
    let rel = new _SpinalRelation2.default(_relationType, _node, node2, _isDirected);
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
    let rel = new _SpinalRelation2.default(_relationType, _node, node2, _isDirected);
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

  _classifyRelations(_relations) {
    for (let index = 0; index < _relations.length; index++) {
      this.classRelation(_relations[index]);
    }
  }

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
   * @returns the created Relation
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9HcmFwaC5qcyJdLCJuYW1lcyI6WyJzcGluYWxDb3JlIiwicmVxdWlyZSIsImdsb2JhbFR5cGUiLCJ3aW5kb3ciLCJnbG9iYWwiLCJHcmFwaCIsIk1vZGVsIiwiY29uc3RydWN0b3IiLCJfbmFtZSIsIl9zdGFydGluZ05vZGUiLCJuYW1lIiwiRmlsZVN5c3RlbSIsIl9zaWdfc2VydmVyIiwiYWRkX2F0dHIiLCJleHRlcm5hbElkTm9kZU1hcHBpbmciLCJndWlkQWJzdHJhY3ROb2RlTWFwcGluZyIsInN0YXJ0aW5nTm9kZSIsIlB0ciIsIm5vZGVMaXN0IiwiTHN0Iiwibm9kZUxpc3RCeUVsZW1lbnRUeXBlIiwicmVsYXRpb25MaXN0IiwicmVsYXRpb25MaXN0QnlUeXBlIiwiY29udGV4dExpc3QiLCJpbml0Iiwic3BpbmFsIiwiY29udGV4dFN0dWRpbyIsImdyYXBoIiwiU3BpbmFsTm9kZSIsIlNwaW5hbFJlbGF0aW9uIiwiQWJzdHJhY3RFbGVtZW50IiwiQklNRWxlbWVudCIsIlV0aWxpdGllcyIsImdldE5vZGVCeWRiSWQiLCJfZGJJZCIsIl9leHRlcm5hbElkIiwiZ2V0RXh0ZXJuYWxJZCIsIkJJTUVsZW1lbnQxIiwiaW5pdEV4dGVybmFsSWQiLCJub2RlIiwiYWRkTm9kZUFzeW5jIiwidHlwZSIsImdldCIsImJpbmQiLCJfY2xhc3NpZnlCSU1FbGVtZW50Tm9kZSIsIl9ub2RlIiwiY2xhc3NpZnlOb2RlIiwiZ2V0RGJJZEJ5Tm9kZSIsImVsZW1lbnQiLCJwcm9taXNlTG9hZCIsImlkIiwic2V0TmFtZSIsInNldCIsInNldFN0YXJ0aW5nTm9kZSIsIl9hZGRFeHRlcm5hbElkTm9kZU1hcHBpbmdFbnRyeSIsIl9FbGVtZW50SWQiLCJfZGJpZCIsImV4dGVybmFsSWQiLCJ1bmJpbmQiLCJfZWxlbWVudCIsImluaXRFeHRlcm5hbElkQXN5bmMiLCJjb25zb2xlIiwibG9nIiwiYWRkTm9kZSIsInRoZW4iLCJsb2FkIiwicHVzaCIsIm5vZGVMaXN0T2ZUeXBlIiwiYWRkU2ltcGxlUmVsYXRpb25Bc3luYyIsIl9yZWxhdGlvblR5cGUiLCJfaXNEaXJlY3RlZCIsIm5vZGUyIiwicmVsIiwiYWRkUmVsYXRpb24iLCJhZGRTaW1wbGVSZWxhdGlvbiIsIl9yZWxhdGlvbiIsImlzRGlyZWN0ZWQiLCJpbmRleCIsIm5vZGVMaXN0MSIsImxlbmd0aCIsImFkZERpcmVjdGVkUmVsYXRpb25QYXJlbnQiLCJub2RlTGlzdDIiLCJhZGREaXJlY3RlZFJlbGF0aW9uQ2hpbGQiLCJhZGROb25EaXJlY3RlZFJlbGF0aW9uIiwiX2NsYXNzaWZ5UmVsYXRpb24iLCJhZGRSZWxhdGlvbnMiLCJfcmVsYXRpb25zIiwicmVsYXRpb24iLCJyZWxhdGlvbkxpc3RPZlR5cGUiLCJfY2xhc3NpZnlSZWxhdGlvbnMiLCJjbGFzc1JlbGF0aW9uIiwiX2FkZE5vdEV4aXN0aW5nTm9kZXNGcm9tTGlzdCIsIl9saXN0IiwiaSIsImNvbnRhaW5zIiwiX2FkZE5vdEV4aXN0aW5nTm9kZXNGcm9tUmVsYXRpb24iLCJhZGRDb250ZXh0IiwiX3VzZWRSZWxhdGlvbnMiLCJfdXNlZEdyYXBoIiwiY29udGV4dCIsIlNwaW5hbENvbnRleHQiLCJyZWdpc3Rlcl9tb2RlbHMiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUVBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFFQTs7OztBQVJBLE1BQU1BLGFBQWFDLFFBQVEseUJBQVIsQ0FBbkI7QUFDQSxNQUFNQyxhQUFhLE9BQU9DLE1BQVAsS0FBa0IsV0FBbEIsR0FBZ0NDLE1BQWhDLEdBQXlDRCxNQUE1RDs7QUFVQTs7Ozs7OztBQU9lLE1BQU1FLEtBQU4sU0FBb0JILFdBQVdJLEtBQS9CLENBQXFDO0FBQ2xEQyxjQUFZQyxLQUFaLEVBQW1CQyxhQUFuQixFQUFrQ0MsT0FBTyxPQUF6QyxFQUFrRDtBQUNoRDtBQUNBLFFBQUlDLFdBQVdDLFdBQWYsRUFBNEI7QUFDMUIsV0FBS0MsUUFBTCxDQUFjO0FBQ1pILGNBQU1GLFNBQVMsRUFE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QyxJQUFkLENBQW1CL0MsWUFBWTtBQUM3QixXQUFLLElBQUkyRSxJQUFJLENBQWIsRUFBZ0JBLElBQUlELE1BQU1iLE1BQTFCLEVBQWtDYyxHQUFsQyxFQUF1QztBQUNyQyxZQUFJdEQsT0FBT3FELE1BQU1DLENBQU4sQ0FBWDtBQUNBLFlBQUksQ0FBQzdELHFCQUFVOEQsUUFBVixDQUFtQjVFLFFBQW5CLEVBQTZCcUIsSUFBN0IsQ0FBTCxFQUF5QztBQUN2QyxlQUFLTyxZQUFMLENBQWtCUCxJQUFsQjtBQUNEO0FBQ0Y7QUFDRixLQVBEO0FBUUQ7O0FBRUR3RCxtQ0FBaUNwQixTQUFqQyxFQUE0QztBQUMxQyxTQUFLZ0IsNEJBQUwsQ0FBa0NoQixVQUFVRyxTQUE1QztBQUNBLFNBQUthLDRCQUFMLENBQWtDaEIsVUFBVU0sU0FBNUM7QUFDRDtBQUNEOzs7Ozs7Ozs7O0FBVUFlLGFBQVd4RixLQUFYLEVBQWtCeUYsY0FBbEIsRUFBa0N4RixhQUFsQyxFQUFpRHlGLFVBQWpELEVBQTZEO0FBQzNELFFBQUlDLFVBQVUsSUFBSUMsdUJBQUosQ0FBa0I1RixLQUFsQixFQUF5QnlGLGNBQXpCLEVBQXlDeEYsYUFBekMsRUFDWnlGLFVBRFksQ0FBZDtBQUVBLFNBQUszRSxXQUFMLENBQWlCMkMsSUFBakIsQ0FBc0JpQyxPQUF0QjtBQUNBLFdBQU9BLE9BQVA7QUFDRDtBQTNXaUQ7O2tCQUEvQjlGLEs7QUE4V3JCTCxXQUFXcUcsZUFBWCxDQUEyQixDQUFDaEcsS0FBRCxDQUEzQiIsImZpbGUiOiJHcmFwaC5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHNwaW5hbENvcmUgPSByZXF1aXJlKFwic3BpbmFsLWNvcmUtY29ubmVjdG9yanNcIik7XG5jb25zdCBnbG9iYWxUeXBlID0gdHlwZW9mIHdpbmRvdyA9PT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHdpbmRvdztcbmltcG9ydCBTcGluYWxOb2RlIGZyb20gXCIuL1NwaW5hbE5vZGVcIjtcbmltcG9ydCBTcGluYWxSZWxhdGlvbiBmcm9tIFwiLi9TcGluYWxSZWxhdGlvblwiO1xuaW1wb3J0IEFic3RyYWN0RWxlbWVudCBmcm9tIFwiLi9BYnN0cmFjdEVsZW1lbnRcIjtcbmltcG9ydCBCSU1FbGVtZW50IGZyb20gXCIuL0JJTUVsZW1lbnRcIjtcbmltcG9ydCBTcGluYWxDb250ZXh0IGZyb20gXCIuL1NwaW5hbENvbnRleHRcIjtcblxuaW1wb3J0IHtcbiAgVXRpbGl0aWVzXG59IGZyb20gXCIuL1V0aWxpdGllc1wiO1xuLyoqXG4gKlxuICpcbiAqIEBleHBvcnRcbiAqIEBjbGFzcyBHcmFwaFxuICogQGV4dGVuZHMge2dsb2JhbFR5cGUuTW9kZWx9XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyYXBoIGV4dGVuZHMgZ2xvYmFsVHlwZS5Nb2RlbCB7XG4gIGNvbnN0cnVjdG9yKF9uYW1lLCBfc3RhcnRpbmdOb2RlLCBuYW1lID0gXCJHcmFwaFwiKSB7XG4gICAgc3VwZXIoKTtcbiAgICBpZiAoRmlsZVN5c3RlbS5fc2lnX3NlcnZlcikge1xuICAgICAgdGhpcy5hZGRfYXR0cih7XG4gICAgICAgIG5hbWU6IF9uYW1lIHx8IFwiXCIsXG4gICAgICAgIGV4dGVybmFsSWROb2RlTWFwcGluZzogbmV3IE1vZGVsKCksXG4gICAgICAgIGd1aWRBYnN0cmFjdE5vZGVNYXBwaW5nOiBuZXcgTW9kZWwoKSxcbiAgICAgICAgc3RhcnRpbmdOb2RlOiBfc3RhcnRpbmdOb2RlIHx8IG5ldyBQdHIoMCksXG4gICAgICAgIG5vZGVMaXN0OiBuZXcgUHRyKG5ldyBMc3QoKSksXG4gICAgICAgIG5vZGVMaXN0QnlFbGVtZW50VHlwZTogbmV3IE1vZGVsKCksXG4gICAgICAgIHJlbGF0aW9uTGlzdDogbmV3IFB0cihuZXcgTHN0KCkpLFxuICAgICAgICByZWxhdGlvbkxpc3RCeVR5cGU6IG5ldyBNb2RlbCgpLFxuICAgICAgICBjb250ZXh0TGlzdDogbmV3IExzdCgpXG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBtZW1iZXJvZiBHcmFwaFxuICAgKi9cbiAgaW5pdCgpIHtcbiAgICBnbG9iYWxUeXBlLnNwaW5hbC5jb250ZXh0U3R1ZGlvID0ge307XG4gICAgZ2xvYmFsVHlwZS5zcGluYWwuY29udGV4dFN0dWRpby5ncmFwaCA9IHRoaXM7XG4gICAgZ2xvYmFsVHlwZS5zcGluYWwuY29udGV4dFN0dWRpby5TcGluYWxOb2RlID0gU3BpbmFsTm9kZTtcbiAgICBnbG9iYWxUeXBlLnNwaW5hbC5jb250ZXh0U3R1ZGlvLlNwaW5hbFJlbGF0aW9uID0gU3BpbmFsUmVsYXRpb247XG4gICAgZ2xvYmFsVHlwZS5zcGluYWwuY29udGV4dFN0dWRpby5BYnN0cmFjdEVsZW1lbnQgPSBBYnN0cmFjdEVsZW1lbnQ7XG4gICAgZ2xvYmFsVHlwZS5zcGluYWwuY29udGV4dFN0dWRpby5CSU1FbGVtZW50ID0gQklNRWxlbWVudDtcbiAgICBnbG9iYWxUeXBlLnNwaW5hbC5jb250ZXh0U3R1ZGlvLlV0aWxpdGllcyA9IFV0aWxpdGllcztcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHsqfSBfZGJJZFxuICAgKiBAcmV0dXJucyBQcm9taXNlIG9mIHRoZSBjb3JyZXNwb25kaW5nIE5vZGUgXG4gICAqIEBtZW1iZXJvZiBHcmFwaFxuICAgKi9cbiAgYXN5bmMgZ2V0Tm9kZUJ5ZGJJZChfZGJJZCkge1xuICAgIGxldCBfZXh0ZXJuYWxJZCA9IGF3YWl0IFV0aWxpdGllcy5nZXRFeHRlcm5hbElkKF9kYklkKTtcbiAgICBpZiAodHlwZW9mIHRoaXMuZXh0ZXJuYWxJZE5vZGVNYXBwaW5nW19leHRlcm5hbElkXSAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgIHJldHVybiB0aGlzLmV4dGVybmFsSWROb2RlTWFwcGluZ1tfZXh0ZXJuYWxJZF07XG4gICAgZWxzZSB7XG4gICAgICBsZXQgQklNRWxlbWVudDEgPSBuZXcgQklNRWxlbWVudChfZGJJZCk7XG4gICAgICBCSU1FbGVtZW50MS5pbml0RXh0ZXJuYWxJZCgpO1xuICAgICAgbGV0IG5vZGUgPSBhd2FpdCB0aGlzLmFkZE5vZGVBc3luYyhCSU1FbGVtZW50MSk7XG4gICAgICBpZiAoQklNRWxlbWVudDEudHlwZS5nZXQoKSA9PT0gXCJcIikge1xuICAgICAgICBCSU1FbGVtZW50MS50eXBlLmJpbmQoXG4gICAgICAgICAgdGhpcy5fY2xhc3NpZnlCSU1FbGVtZW50Tm9kZS5iaW5kKHRoaXMsIG5vZGUpXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbm9kZTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7Kn0gX25vZGVcbiAgICogQG1lbWJlcm9mIEdyYXBoXG4gICAqL1xuICBhc3luYyBfY2xhc3NpZnlCSU1FbGVtZW50Tm9kZShfbm9kZSkge1xuICAgIC8vVE9ETyBERUxFVEUgT0xEIENMQVNTSUZJQ0FUSU9OXG4gICAgdGhpcy5jbGFzc2lmeU5vZGUoX25vZGUpO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0geyp9IF9ub2RlXG4gICAqIEByZXR1cm5zIGRiSWRcbiAgICogQG1lbWJlcm9mIEdyYXBoXG4gICAqL1xuICBhc3luYyBnZXREYklkQnlOb2RlKF9ub2RlKSB7XG4gICAgbGV0IGVsZW1lbnQgPSBhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQoX25vZGUuZWxlbWVudCk7XG4gICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBCSU1FbGVtZW50KSB7XG4gICAgICByZXR1cm4gZWxlbWVudC5pZC5nZXQoKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7Kn0gX25hbWVcbiAgICogQG1lbWJlcm9mIEdyYXBoXG4gICAqL1xuICBzZXROYW1lKF9uYW1lKSB7XG4gICAgdGhpcy5uYW1lLnNldChfbmFtZSk7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7Kn0gX3N0YXJ0aW5nTm9kZVxuICAgKiBAbWVtYmVyb2YgR3JhcGhcbiAgICovXG4gIHNldFN0YXJ0aW5nTm9kZShfc3RhcnRpbmdOb2RlKSB7XG4gICAgdGhpcy5zdGFydGluZ05vZGUuc2V0KF9zdGFydGluZ05vZGUpO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0geyp9IF9FbGVtZW50SWRcbiAgICogQHBhcmFtIHsqfSBfbm9kZVxuICAgKiBAbWVtYmVyb2YgR3JhcGhcbiAgICovXG4gIGFzeW5jIF9hZGRFeHRlcm5hbElkTm9kZU1hcHBpbmdFbnRyeShfRWxlbWVudElkLCBfbm9kZSkge1xuICAgIGxldCBfZGJpZCA9IF9FbGVtZW50SWQuZ2V0KCk7XG4gICAgaWYgKHR5cGVvZiBfZGJpZCA9PSBcIm51bWJlclwiKVxuICAgICAgaWYgKF9kYmlkICE9IDApIHtcbiAgICAgICAgbGV0IGV4dGVybmFsSWQgPSBhd2FpdCBVdGlsaXRpZXMuZ2V0RXh0ZXJuYWxJZChfZGJpZCk7XG4gICAgICAgIGxldCBlbGVtZW50ID0gYXdhaXQgVXRpbGl0aWVzLnByb21pc2VMb2FkKF9ub2RlLmVsZW1lbnQpO1xuICAgICAgICBhd2FpdCBlbGVtZW50LmluaXRFeHRlcm5hbElkKCk7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5leHRlcm5hbElkTm9kZU1hcHBpbmdbZXh0ZXJuYWxJZF0gPT09IFwidW5kZWZpbmVkXCIpXG4gICAgICAgICAgdGhpcy5leHRlcm5hbElkTm9kZU1hcHBpbmcuYWRkX2F0dHIoe1xuICAgICAgICAgICAgW2V4dGVybmFsSWRdOiBfbm9kZVxuICAgICAgICAgIH0pO1xuICAgICAgICBfRWxlbWVudElkLnVuYmluZChcbiAgICAgICAgICB0aGlzLl9hZGRFeHRlcm5hbElkTm9kZU1hcHBpbmdFbnRyeS5iaW5kKHRoaXMsIF9FbGVtZW50SWQsXG4gICAgICAgICAgICBfbm9kZSlcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHsqfSBfZWxlbWVudFxuICAgKiBAcmV0dXJucyBQcm9taXNlIG9mIHRoZSBjcmVhdGVkIE5vZGVcbiAgICogQG1lbWJlcm9mIEdyYXBoXG4gICAqL1xuICBhc3luYyBhZGROb2RlQXN5bmMoX2VsZW1lbnQpIHtcbiAgICBsZXQgbmFtZSA9IFwiXCI7XG4gICAgaWYgKF9lbGVtZW50IGluc3RhbmNlb2YgQklNRWxlbWVudCkge1xuICAgICAgYXdhaXQgX2VsZW1lbnQuaW5pdEV4dGVybmFsSWRBc3luYygpO1xuICAgICAgaWYgKFxuICAgICAgICB0eXBlb2YgdGhpcy5leHRlcm5hbElkTm9kZU1hcHBpbmdbX2VsZW1lbnQuZXh0ZXJuYWxJZC5nZXQoKV0gIT09XG4gICAgICAgIFwidW5kZWZpbmVkXCJcbiAgICAgICkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkJJTSBPQkpFQ1QgTk9ERSBBTFJFQURZIEVYSVNUU1wiKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXh0ZXJuYWxJZE5vZGVNYXBwaW5nW19lbGVtZW50LmV4dGVybmFsSWQuZ2V0KCldO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoX2VsZW1lbnQgaW5zdGFuY2VvZiBBYnN0cmFjdEVsZW1lbnQpIHtcbiAgICAgIGlmIChcbiAgICAgICAgdHlwZW9mIHRoaXMuZ3VpZEFic3RyYWN0Tm9kZU1hcHBpbmdbX2VsZW1lbnQuaWQuZ2V0KCldICE9PVxuICAgICAgICBcInVuZGVmaW5lZFwiXG4gICAgICApIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJBQlNUUkFDVCBPQkpFQ1QgTk9ERSBBTFJFQURZIEVYSVNUU1wiKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3VpZEFic3RyYWN0Tm9kZU1hcHBpbmdbX2VsZW1lbnQuaWQuZ2V0KCldO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodHlwZW9mIF9lbGVtZW50Lm5hbWUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIG5hbWUgPSBfZWxlbWVudC5uYW1lLmdldCgpO1xuICAgIH1cbiAgICBsZXQgbm9kZSA9IG5ldyBTcGluYWxOb2RlKG5hbWUsIF9lbGVtZW50LCB0aGlzKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHsqfSBfZWxlbWVudFxuICAgKiBAcmV0dXJucyB0aGUgY3JlYXRlZCBOb2RlXG4gICAqIEBtZW1iZXJvZiBHcmFwaFxuICAgKi9cbiAgYWRkTm9kZShfZWxlbWVudCkge1xuICAgIGxldCBuYW1lID0gXCJcIjtcbiAgICBpZiAoX2VsZW1lbnQgaW5zdGFuY2VvZiBCSU1FbGVtZW50KSB7XG4gICAgICBfZWxlbWVudC5pbml0RXh0ZXJuYWxJZCgpO1xuICAgICAgaWYgKFxuICAgICAgICB0eXBlb2YgdGhpcy5leHRlcm5hbElkTm9kZU1hcHBpbmdbX2VsZW1lbnQuZXh0ZXJuYWxJZC5nZXQoKV0gIT09XG4gICAgICAgIFwidW5kZWZpbmVkXCJcbiAgICAgICkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkJJTSBPQkpFQ1QgTk9ERSBBTFJFQURZIEVYSVNUU1wiKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXh0ZXJuYWxJZE5vZGVNYXBwaW5nW19lbGVtZW50LmV4dGVybmFsSWQuZ2V0KCldO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoX2VsZW1lbnQgaW5zdGFuY2VvZiBBYnN0cmFjdEVsZW1lbnQpIHtcbiAgICAgIGlmIChcbiAgICAgICAgdHlwZW9mIHRoaXMuZ3VpZEFic3RyYWN0Tm9kZU1hcHBpbmdbX2VsZW1lbnQuaWQuZ2V0KCldICE9PVxuICAgICAgICBcInVuZGVmaW5lZFwiXG4gICAgICApIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJBQlNUUkFDVCBPQkpFQ1QgTk9ERSBBTFJFQURZIEVYSVNUU1wiKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3VpZEFic3RyYWN0Tm9kZU1hcHBpbmdbX2VsZW1lbnQuaWQuZ2V0KCldO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodHlwZW9mIF9lbGVtZW50Lm5hbWUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIG5hbWUgPSBfZWxlbWVudC5uYW1lLmdldCgpO1xuICAgIH1cbiAgICBsZXQgbm9kZSA9IG5ldyBTcGluYWxOb2RlKG5hbWUsIF9lbGVtZW50LCB0aGlzKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHsqfSBfbm9kZVxuICAgKiBAbWVtYmVyb2YgR3JhcGhcbiAgICovXG4gIGNsYXNzaWZ5Tm9kZShfbm9kZSkge1xuICAgIFV0aWxpdGllcy5wcm9taXNlTG9hZChfbm9kZS5lbGVtZW50KS50aGVuKGVsZW1lbnQgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBfbm9kZS5ncmFwaCA9PT0gXCJ1bmRlZmluZWRcIikgX25vZGUuZ3JhcGguc2V0KHRoaXMpO1xuICAgICAgdGhpcy5ub2RlTGlzdC5sb2FkKG5vZGVMaXN0ID0+IHtcbiAgICAgICAgbm9kZUxpc3QucHVzaChfbm9kZSk7XG4gICAgICB9KTtcbiAgICAgIGxldCB0eXBlID0gXCJVbkNsYXNzaWZpZWRcIjtcbiAgICAgIGlmICh0eXBlb2YgZWxlbWVudC50eXBlICE9IFwidW5kZWZpbmVkXCIgJiYgZWxlbWVudC50eXBlLmdldCgpICE9XG4gICAgICAgIFwiXCIpIHtcbiAgICAgICAgdHlwZSA9IGVsZW1lbnQudHlwZS5nZXQoKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLm5vZGVMaXN0QnlFbGVtZW50VHlwZVt0eXBlXSkge1xuICAgICAgICB0aGlzLm5vZGVMaXN0QnlFbGVtZW50VHlwZVt0eXBlXS5sb2FkKG5vZGVMaXN0T2ZUeXBlID0+IHtcbiAgICAgICAgICBub2RlTGlzdE9mVHlwZS5wdXNoKF9ub2RlKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgbm9kZUxpc3RPZlR5cGUgPSBuZXcgTHN0KCk7XG4gICAgICAgIG5vZGVMaXN0T2ZUeXBlLnB1c2goX25vZGUpO1xuICAgICAgICB0aGlzLm5vZGVMaXN0QnlFbGVtZW50VHlwZS5hZGRfYXR0cih7XG4gICAgICAgICAgW3R5cGVdOiBuZXcgUHRyKG5vZGVMaXN0T2ZUeXBlKVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGlmIChlbGVtZW50IGluc3RhbmNlb2YgQklNRWxlbWVudCkge1xuICAgICAgICBsZXQgX2RiaWQgPSBlbGVtZW50LmlkLmdldCgpO1xuICAgICAgICBpZiAodHlwZW9mIF9kYmlkID09IFwibnVtYmVyXCIpXG4gICAgICAgICAgaWYgKF9kYmlkICE9IDApIHtcbiAgICAgICAgICAgIHRoaXMuX2FkZEV4dGVybmFsSWROb2RlTWFwcGluZ0VudHJ5KGVsZW1lbnQuaWQsIF9ub2RlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWxlbWVudC5pZC5iaW5kKFxuICAgICAgICAgICAgICB0aGlzLl9hZGRFeHRlcm5hbElkTm9kZU1hcHBpbmdFbnRyeS5iaW5kKG51bGwsIGVsZW1lbnQuaWQsXG4gICAgICAgICAgICAgICAgX25vZGUpXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEFic3RyYWN0RWxlbWVudCkge1xuICAgICAgICB0aGlzLmd1aWRBYnN0cmFjdE5vZGVNYXBwaW5nLmFkZF9hdHRyKHtcbiAgICAgICAgICBbZWxlbWVudC5pZC5nZXQoKV06IF9ub2RlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLy8gYWRkTm9kZXMoX3ZlcnRpY2VzKSB7XG4gIC8vICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IF92ZXJ0aWNlcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgLy8gICAgIHRoaXMuY2xhc3NpZnlOb2RlKF92ZXJ0aWNlc1tpbmRleF0pXG4gIC8vICAgfVxuICAvLyB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0geyp9IF9yZWxhdGlvblR5cGVcbiAgICogQHBhcmFtIHsqfSBfbm9kZVxuICAgKiBAcGFyYW0geyp9IF9lbGVtZW50XG4gICAqIEBwYXJhbSB7Kn0gX2lzRGlyZWN0ZWRcbiAgICogQHJldHVybnMgUHJvbWlzZSBvZiB0aGUgY3JlYXRlZCBSZWxhdGlvblxuICAgKiBAbWVtYmVyb2YgR3JhcGhcbiAgICovXG4gIGFzeW5jIGFkZFNpbXBsZVJlbGF0aW9uQXN5bmMoX3JlbGF0aW9uVHlwZSwgX25vZGUsIF9lbGVtZW50LCBfaXNEaXJlY3RlZCkge1xuICAgIGxldCBub2RlMiA9IGF3YWl0IHRoaXMuYWRkTm9kZUFzeW5jKF9lbGVtZW50KTtcbiAgICBsZXQgcmVsID0gbmV3IFNwaW5hbFJlbGF0aW9uKF9yZWxhdGlvblR5cGUsIF9ub2RlLCBub2RlMiwgX2lzRGlyZWN0ZWQpO1xuICAgIHRoaXMuYWRkUmVsYXRpb24ocmVsKVxuICAgIHJldHVybiByZWw7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7Kn0gX3JlbGF0aW9uVHlwZVxuICAgKiBAcGFyYW0geyp9IF9ub2RlXG4gICAqIEBwYXJhbSB7Kn0gX2VsZW1lbnRcbiAgICogQHBhcmFtIHsqfSBfaXNEaXJlY3RlZFxuICAgKiBAcmV0dXJucyB0aGUgY3JlYXRlZCBSZWxhdGlvblxuICAgKiBAbWVtYmVyb2YgR3JhcGhcbiAgICovXG4gIGFkZFNpbXBsZVJlbGF0aW9uKF9yZWxhdGlvblR5cGUsIF9ub2RlLCBfZWxlbWVudCwgX2lzRGlyZWN0ZWQpIHtcbiAgICBsZXQgbm9kZTIgPSB0aGlzLmFkZE5vZGUoX2VsZW1lbnQpO1xuICAgIGxldCByZWwgPSBuZXcgU3BpbmFsUmVsYXRpb24oX3JlbGF0aW9uVHlwZSwgX25vZGUsIG5vZGUyLCBfaXNEaXJlY3RlZCk7XG4gICAgdGhpcy5hZGRSZWxhdGlvbihyZWwpXG4gICAgcmV0dXJuIHJlbDtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHsqfSBfcmVsYXRpb25cbiAgICogQG1lbWJlcm9mIEdyYXBoXG4gICAqL1xuICBhZGRSZWxhdGlvbihfcmVsYXRpb24pIHtcbiAgICBpZiAoX3JlbGF0aW9uLmlzRGlyZWN0ZWQuZ2V0KCkpIHtcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBfcmVsYXRpb24ubm9kZUxpc3QxLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCBub2RlID0gX3JlbGF0aW9uLm5vZGVMaXN0MVtpbmRleF07XG4gICAgICAgIG5vZGUuYWRkRGlyZWN0ZWRSZWxhdGlvblBhcmVudChfcmVsYXRpb24pO1xuICAgICAgfVxuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IF9yZWxhdGlvbi5ub2RlTGlzdDIubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBfcmVsYXRpb24ubm9kZUxpc3QyW2luZGV4XTtcbiAgICAgICAgbm9kZS5hZGREaXJlY3RlZFJlbGF0aW9uQ2hpbGQoX3JlbGF0aW9uKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IF9yZWxhdGlvbi5ub2RlTGlzdDEubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBfcmVsYXRpb24ubm9kZUxpc3QxW2luZGV4XTtcbiAgICAgICAgbm9kZS5hZGROb25EaXJlY3RlZFJlbGF0aW9uKF9yZWxhdGlvbik7XG4gICAgICB9XG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX3JlbGF0aW9uLm5vZGVMaXN0Mi5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IF9yZWxhdGlvbi5ub2RlTGlzdDJbaW5kZXhdO1xuICAgICAgICBub2RlLmFkZE5vbkRpcmVjdGVkUmVsYXRpb24oX3JlbGF0aW9uKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5fY2xhc3NpZnlSZWxhdGlvbihfcmVsYXRpb24pO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0geyp9IF9yZWxhdGlvbnNcbiAgICogQG1lbWJlcm9mIEdyYXBoXG4gICAqL1xuICBhZGRSZWxhdGlvbnMoX3JlbGF0aW9ucykge1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBfcmVsYXRpb25zLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgcmVsYXRpb24gPSBfcmVsYXRpb25zW2luZGV4XTtcbiAgICAgIHRoaXMuYWRkUmVsYXRpb24ocmVsYXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIF9jbGFzc2lmeVJlbGF0aW9uKF9yZWxhdGlvbikge1xuICAgIHRoaXMucmVsYXRpb25MaXN0LmxvYWQocmVsYXRpb25MaXN0ID0+IHtcbiAgICAgIHJlbGF0aW9uTGlzdC5wdXNoKF9yZWxhdGlvbik7XG4gICAgfSk7XG4gICAgaWYgKHRoaXMucmVsYXRpb25MaXN0QnlUeXBlW19yZWxhdGlvbi50eXBlLmdldCgpXSkge1xuICAgICAgdGhpcy5yZWxhdGlvbkxpc3RCeVR5cGVbX3JlbGF0aW9uLnR5cGUuZ2V0KCldLmxvYWQocmVsYXRpb25MaXN0T2ZUeXBlID0+IHtcbiAgICAgICAgcmVsYXRpb25MaXN0T2ZUeXBlLnB1c2goX3JlbGF0aW9uKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcmVsYXRpb25MaXN0T2ZUeXBlID0gbmV3IExzdCgpO1xuICAgICAgcmVsYXRpb25MaXN0T2ZUeXBlLnB1c2goX3JlbGF0aW9uKTtcbiAgICAgIHRoaXMucmVsYXRpb25MaXN0QnlUeXBlLmFkZF9hdHRyKHtcbiAgICAgICAgW19yZWxhdGlvbi50eXBlLmdldCgpXTogbmV3IFB0cihyZWxhdGlvbkxpc3RPZlR5cGUpXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBfY2xhc3NpZnlSZWxhdGlvbnMoX3JlbGF0aW9ucykge1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBfcmVsYXRpb25zLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgdGhpcy5jbGFzc1JlbGF0aW9uKF9yZWxhdGlvbnNbaW5kZXhdKTtcbiAgICB9XG4gIH1cblxuICBfYWRkTm90RXhpc3RpbmdOb2Rlc0Zyb21MaXN0KF9saXN0KSB7XG4gICAgdGhpcy5ub2RlTGlzdC5sb2FkKG5vZGVMaXN0ID0+IHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgX2xpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGV0IG5vZGUgPSBfbGlzdFtpXTtcbiAgICAgICAgaWYgKCFVdGlsaXRpZXMuY29udGFpbnMobm9kZUxpc3QsIG5vZGUpKSB7XG4gICAgICAgICAgdGhpcy5jbGFzc2lmeU5vZGUobm9kZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9hZGROb3RFeGlzdGluZ05vZGVzRnJvbVJlbGF0aW9uKF9yZWxhdGlvbikge1xuICAgIHRoaXMuX2FkZE5vdEV4aXN0aW5nTm9kZXNGcm9tTGlzdChfcmVsYXRpb24ubm9kZUxpc3QxKTtcbiAgICB0aGlzLl9hZGROb3RFeGlzdGluZ05vZGVzRnJvbUxpc3QoX3JlbGF0aW9uLm5vZGVMaXN0Mik7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7Kn0gX25hbWVcbiAgICogQHBhcmFtIHsqfSBfdXNlZFJlbGF0aW9uc1xuICAgKiBAcGFyYW0geyp9IF9zdGFydGluZ05vZGVcbiAgICogQHBhcmFtIHsqfSBfdXNlZEdyYXBoXG4gICAqIEByZXR1cm5zIHRoZSBjcmVhdGVkIFJlbGF0aW9uXG4gICAqIEBtZW1iZXJvZiBHcmFwaFxuICAgKi9cbiAgYWRkQ29udGV4dChfbmFtZSwgX3VzZWRSZWxhdGlvbnMsIF9zdGFydGluZ05vZGUsIF91c2VkR3JhcGgpIHtcbiAgICBsZXQgY29udGV4dCA9IG5ldyBTcGluYWxDb250ZXh0KF9uYW1lLCBfdXNlZFJlbGF0aW9ucywgX3N0YXJ0aW5nTm9kZSxcbiAgICAgIF91c2VkR3JhcGgpXG4gICAgdGhpcy5jb250ZXh0TGlzdC5wdXNoKGNvbnRleHQpXG4gICAgcmV0dXJuIGNvbnRleHQ7XG4gIH1cbn1cblxuc3BpbmFsQ29yZS5yZWdpc3Rlcl9tb2RlbHMoW0dyYXBoXSk7Il19