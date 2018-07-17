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

var _SpinalApplication = require("./SpinalApplication");

var _SpinalApplication2 = _interopRequireDefault(_SpinalApplication);

var _Utilities = require("./Utilities");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const spinalCore = require("spinal-core-connectorjs");
const globalType = typeof window === "undefined" ? global : window;

/**
 * The core of the interactions between the BIMElements Nodes and other Nodes(Docs, Tickets, etc ..)
 */
class Graph extends globalType.Model {
  /**
   *Creates an instance of Graph.
   * @param {string} [_name=t]
   * @param {Ptr} [_startingNode=new Ptr(0)]
   * @memberof Graph
   */
  constructor(_name = "t", _startingNode = new Ptr(0), name = "Graph") {
    super();
    if (FileSystem._sig_server) {
      this.add_attr({
        name: _name,
        externalIdNodeMapping: new Model(),
        guidAbstractNodeMapping: new Model(),
        startingNode: _startingNode,
        nodeList: new Ptr(new Lst()),
        nodeListByElementType: new Model(),
        relationList: new Ptr(new Lst()),
        relationListByType: new Model(),
        contextList: new Lst(),
        appsList: new Model(),
        reservedRelationsNames: new Model()
      });
    }
  }
  /**
   *function
   *To put used functions as well as the graph model in the global scope
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
   * @param {number} _dbId
   * @returns Promise of the corresponding Node or the created one if not existing
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
   * @param {SpinalNode} _node
   * @memberof Graph
   */
  async _classifyBIMElementNode(_node) {
    //TODO DELETE OLD CLASSIFICATION
    this.classifyNode(_node);
  }
  /**
   *
   *
   * @param {SpinalNode} _node
   * @returns Promise of dbId [number]
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
   * @param {string} _name
   * @memberof Graph
   */
  setName(_name) {
    this.name.set(_name);
  }
  /**
   *
   *
   * @param {Ptr} _startingNode
   * @memberof Graph
   */
  setStartingNode(_startingNode) {
    this.startingNode.set(_startingNode);
  }
  /**
   *
   *
   * @param {number} _ElementId - the Element ExternalId
   * @param {SpinalNode} _node
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
   * @param {Model} _element - any subClass of Model
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
   * @param {Model} _element - any subClass of Model
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
   *  Observes the type of the element inside the node add Classify it.
   *  It puts it in the Unclassified list Otherwise.
   * It adds the node to the mapping list with ExternalId if the Object is of type BIMElement
   *
   * @param {SpinalNode} _node
   * @memberof Graph
   */
  classifyNode(_node) {
    _Utilities.Utilities.promiseLoad(_node.element).then(element => {
      if (typeof _node.graph === "undefined") _node.graph.set(this);
      this.nodeList.load(nodeList => {
        nodeList.push(_node);
      });
      let type = "Unclassified";
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
   *  It creates the node corresponding to the _element,
   * then it creates a simple relation of class SpinalRelation of type:_type.
   *
   * @param {string} _relationType
   * @param {SpinalNode} _node
   * @param {Model} _element - any subClass of Model
   * @param {boolean} [_isDirected=false]
   * @returns a Promise of the created relation
   * @memberof Graph
   */
  async addSimpleRelationAsync(_relationType, _node, _element, _isDirected = false) {
    if (!this.isReserved(_relationType)) {
      let node2 = await this.addNodeAsync(_element);
      let rel = new _SpinalRelation2.default(_relationType, [_node], [node2], _isDirected);
      this.addRelation(rel);
      return rel;
    } else {
      console.log(_relationType + " is reserved by " + this.reservedRelationsNames[_relationType]);
    }
  }
  /**
   *
   *  It creates the node corresponding to the _element,
   * then it creates a simple relation of class SpinalRelation of type:_type.
   *
   * @param {string} relationType
   * @param {SpinalNode} node
   * @param {Model} element - any subClass of Model
   * @param {boolean} [isDirected=false]
   * @returns a Promise of the created relation
   * @memberof Graph
   */
  addSimpleRelation(relationType, node, element, isDirected = false) {
    if (!this.isReserved(_relationType)) {
      let node2 = this.addNode(element);
      let rel = new _SpinalRelation2.default(relationType, [node], [node2], isDirected);
      this.addRelation(rel);
      return rel;
    } else {
      console.log(_relationType + " is reserved by " + this.reservedRelationsNames[_relationType]);
    }
  }

  addSimpleRelationByApp(appName, relationType, node, element, isDirected = false) {
    if (this.hasReservationCredentials(_relationType, appName)) {
      if (this.containsApp(appName)) {
        let node2 = this.addNode(element);
        let rel = new _SpinalRelation2.default(relationType, [node], [node2], isDirected);
        this.addRelation(rel, appName);
        return rel;
      } else {
        console.error(appName + " does not exist");
      }
    } else {
      console.log(_relationType + " is reserved by " + this.reservedRelationsNames[_relationType]);
    }
  }

  addRelation(relation, appName) {
    if (this.hasReservationCredentials(relation.type.get(), appName)) {
      if (relation.isDirected.get()) {
        for (let index = 0; index < relation.nodeList1.length; index++) {
          const node = relation.nodeList1[index];
          node.addDirectedRelationParent(relation, appName);
        }
        for (let index = 0; index < relation.nodeList2.length; index++) {
          const node = relation.nodeList2[index];
          node.addDirectedRelationChild(relation, appName);
        }
      } else {
        for (let index = 0; index < relation.nodeList1.length; index++) {
          const node = relation.nodeList1[index];
          node.addNonDirectedRelation(relation, appName);
        }
        for (let index = 0; index < relation.nodeList2.length; index++) {
          const node = relation.nodeList2[index];
          node.addNonDirectedRelation(relation, appName);
        }
      }
      this._classifyRelation(relation, appName);
    } else {
      console.log(relation.type.get() + " is reserved by " + this.reservedRelationsNames[relation.type.get()]);
    }
  }
  /**
   *
   *
   * @param {SpinalRelations} _relations
   * @memberof Graph
   */
  addRelations(_relations) {
    for (let index = 0; index < _relations.length; index++) {
      const relation = _relations[index];
      this.addRelation(relation);
    }
  }

  _classifyRelation(relation, appName) {
    this.relationList.load(relationList => {
      relationList.push(relation);
    });
    if (this.relationListByType[relation.type.get()]) {
      this.relationListByType[relation.type.get()].load(relationListOfType => {
        relationListOfType.push(relation);
      });
    } else {
      let relationListOfType = new Lst();
      relationListOfType.push(relation);
      this.relationListByType.add_attr({
        [relation.type.get()]: new Ptr(relationListOfType)
      });
    }
    if (typeof appName !== "undefined") {
      if (typeof this.appsList[appName][relation.type.get()] === "undefined") {
        this.appsList[appName].addRelation(relation);
      }
    }
  }

  containsApp(appName) {
    return typeof this.appsList[appName] !== "undefined";
  }

  isReserved(relationType) {
    return typeof this.reservedRelationsNames[relationType] !== "undefined";
  }

  hasReservationCredentials(relationType, appName) {
    return !this.isReserved(relationType) || this.isReserved(relationType) && this.reservedRelationsNames(relationType) === appName;
  }
  /**
   *
   *
   * @param {SpinalRelations} relations
   * @memberof Graph
   */
  _classifyRelations(_relations) {
    for (let index = 0; index < _relations.length; index++) {
      this._classifyRelation(_relations[index]);
    }
  }
  /**
   *
   *
   * @param {Lst} _list
   * @memberof Graph
   */
  _addNotExistingNodesFromList(_list) {
    this.nodeList.load(nodeList => {
      for (let i = 0; i < _list.length; i++) {
        let node = _list[i];
        if (!_Utilities.Utilities.containsLstById(nodeList, node)) {
          this.classifyNode(node);
        }
      }
    });
  }
  /**
   *
   *
   * @param {SpinalRelations} _relation
   * @memberof Graph
   */
  _addNotExistingNodesFromRelation(_relation) {
    this._addNotExistingNodesFromList(_relation.nodeList1);
    this._addNotExistingNodesFromList(_relation.nodeList2);
  }
  /**
   *
   *
   * @param {string} _name
   * @param {strings} _usedRelations
   * @param {SpinalNode} _startingNode
   * @param {Graph} [_usedGraph=this]
   * @returns The created Context
   * @memberof Graph
   */
  addContext(_name, _usedRelations, _startingNode, _usedGraph = this) {
    let context = new _SpinalContext2.default(_name, _usedRelations, _startingNode, _usedGraph);
    this.contextList.push(context);
    return context;
  }

  getApp(name, relationsTypesLst, relatedGraph = this) {
    if (typeof this.appsList[name] === "undefined") {
      let spinalApplication = new _SpinalApplication2.default(name, relationsTypesLst, relatedGraph);
      this.appsList.add_attr({
        [name]: spinalApplication
      });
      return spinalApplication;
    } else {
      this.appsList[name];
      // console.error(
      //   name +
      //   " as well as " +
      //   this.getAppsNames() +
      //   " have been already used, please choose another application name"
      // );
    }
  }

  getAppsNames() {
    this.appsList._attribute_names;
  }

  reserveUniqueRelationType(relationType, app) {
    if (typeof this.reservedRelationsNames[relationType] === "undefined" && typeof this.relationListByType[relationType] === "undefined") {
      this.reservedRelationsNames.add_attr({
        [relationType]: app.name.get()
      });
      app.addRelationType(relationType);
      return true;
    } else if (typeof this.reservedRelationsNames[relationType] !== "undefined") {
      console.error(relationType + " has not been added to app: " + app.name.get() + ",Cause : already Reserved by " + this.reservedRelationsNames[relationType]);
      return false;
    } else if (typeof this.relationListByType[relationType] !== "undefined") {
      console.error(relationType + " has not been added to app: " + app.name.get() + ",Cause : already Used by other Apps");
    }
  }
}

exports.default = Graph;

spinalCore.register_models([Graph]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9HcmFwaC5qcyJdLCJuYW1lcyI6WyJzcGluYWxDb3JlIiwicmVxdWlyZSIsImdsb2JhbFR5cGUiLCJ3aW5kb3ciLCJnbG9iYWwiLCJHcmFwaCIsIk1vZGVsIiwiY29uc3RydWN0b3IiLCJfbmFtZSIsIl9zdGFydGluZ05vZGUiLCJQdHIiLCJuYW1lIiwiRmlsZVN5c3RlbSIsIl9zaWdfc2VydmVyIiwiYWRkX2F0dHIiLCJleHRlcm5hbElkTm9kZU1hcHBpbmciLCJndWlkQWJzdHJhY3ROb2RlTWFwcGluZyIsInN0YXJ0aW5nTm9kZSIsIm5vZGVMaXN0IiwiTHN0Iiwibm9kZUxpc3RCeUVsZW1lbnRUeXBlIiwicmVsYXRpb25MaXN0IiwicmVsYXRpb25MaXN0QnlUeXBlIiwiY29udGV4dExpc3QiLCJhcHBzTGlzdCIsInJlc2VydmVkUmVsYXRpb25zTmFtZXMiLCJpbml0Iiwic3BpbmFsIiwiY29udGV4dFN0dWRpbyIsImdyYXBoIiwiU3BpbmFsTm9kZSIsIlNwaW5hbFJlbGF0aW9uIiwiQWJzdHJhY3RFbGVtZW50IiwiQklNRWxlbWVudCIsIlV0aWxpdGllcyIsImdldE5vZGVCeWRiSWQiLCJfZGJJZCIsIl9leHRlcm5hbElkIiwiZ2V0RXh0ZXJuYWxJZCIsIkJJTUVsZW1lbnQxIiwiaW5pdEV4dGVybmFsSWQiLCJub2RlIiwiYWRkTm9kZUFzeW5jIiwidHlwZSIsImdldCIsImJpbmQiLCJfY2xhc3NpZnlCSU1FbGVtZW50Tm9kZSIsIl9ub2RlIiwiY2xhc3NpZnlOb2RlIiwiZ2V0RGJJZEJ5Tm9kZSIsImVsZW1lbnQiLCJwcm9taXNlTG9hZCIsImlkIiwic2V0TmFtZSIsInNldCIsInNldFN0YXJ0aW5nTm9kZSIsIl9hZGRFeHRlcm5hbElkTm9kZU1hcHBpbmdFbnRyeSIsIl9FbGVtZW50SWQiLCJfZGJpZCIsImV4dGVybmFsSWQiLCJ1bmJpbmQiLCJfZWxlbWVudCIsImluaXRFeHRlcm5hbElkQXN5bmMiLCJjb25zb2xlIiwibG9nIiwiYWRkTm9kZSIsInRoZW4iLCJsb2FkIiwicHVzaCIsIm5vZGVMaXN0T2ZUeXBlIiwiYWRkU2ltcGxlUmVsYXRpb25Bc3luYyIsIl9yZWxhdGlvblR5cGUiLCJfaXNEaXJlY3RlZCIsImlzUmVzZXJ2ZWQiLCJub2RlMiIsInJlbCIsImFkZFJlbGF0aW9uIiwiYWRkU2ltcGxlUmVsYXRpb24iLCJyZWxhdGlvblR5cGUiLCJpc0RpcmVjdGVkIiwiYWRkU2ltcGxlUmVsYXRpb25CeUFwcCIsImFwcE5hbWUiLCJoYXNSZXNlcnZhdGlvbkNyZWRlbnRpYWxzIiwiY29udGFpbnNBcHAiLCJlcnJvciIsInJlbGF0aW9uIiwiaW5kZXgiLCJub2RlTGlzdDEiLCJsZW5ndGgiLCJhZGREaXJlY3RlZFJlbGF0aW9uUGFyZW50Iiwibm9kZUxpc3QyIiwiYWRkRGlyZWN0ZWRSZWxhdGlvbkNoaWxkIiwiYWRkTm9uRGlyZWN0ZWRSZWxhdGlvbiIsIl9jbGFzc2lmeVJlbGF0aW9uIiwiYWRkUmVsYXRpb25zIiwiX3JlbGF0aW9ucyIsInJlbGF0aW9uTGlzdE9mVHlwZSIsIl9jbGFzc2lmeVJlbGF0aW9ucyIsIl9hZGROb3RFeGlzdGluZ05vZGVzRnJvbUxpc3QiLCJfbGlzdCIsImkiLCJjb250YWluc0xzdEJ5SWQiLCJfYWRkTm90RXhpc3RpbmdOb2Rlc0Zyb21SZWxhdGlvbiIsIl9yZWxhdGlvbiIsImFkZENvbnRleHQiLCJfdXNlZFJlbGF0aW9ucyIsIl91c2VkR3JhcGgiLCJjb250ZXh0IiwiU3BpbmFsQ29udGV4dCIsImdldEFwcCIsInJlbGF0aW9uc1R5cGVzTHN0IiwicmVsYXRlZEdyYXBoIiwic3BpbmFsQXBwbGljYXRpb24iLCJTcGluYWxBcHBsaWNhdGlvbiIsImdldEFwcHNOYW1lcyIsIl9hdHRyaWJ1dGVfbmFtZXMiLCJyZXNlcnZlVW5pcXVlUmVsYXRpb25UeXBlIiwiYXBwIiwiYWRkUmVsYXRpb25UeXBlIiwicmVnaXN0ZXJfbW9kZWxzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7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QUZBLEdBR0EsK0JBSEEsR0FJQSxLQUFLbkIsc0JBQUwsQ0FBNEJxRCxZQUE1QixDQUxGO0FBT0EsYUFBTyxLQUFQO0FBQ0QsS0FYTSxNQVdBLElBQUksT0FBTyxLQUFLeEQsa0JBQUwsQ0FBd0J3RCxZQUF4QixDQUFQLEtBQWlELFdBQXJELEVBQWtFO0FBQ3ZFZixjQUFRcUIsS0FBUixDQUNFTixlQUNBLDhCQURBLEdBRUF1QyxJQUFJMUcsSUFBSixDQUFTaUMsR0FBVCxFQUZBLEdBR0EscUNBSkY7QUFNRDtBQUNGO0FBL2dCa0M7O2tCQWtoQnRCdkMsSzs7QUFDZkwsV0FBV3VILGVBQVgsQ0FBMkIsQ0FBQ2xILEtBQUQsQ0FBM0IiLCJmaWxlIjoiR3JhcGguanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBzcGluYWxDb3JlID0gcmVxdWlyZShcInNwaW5hbC1jb3JlLWNvbm5lY3RvcmpzXCIpO1xuY29uc3QgZ2xvYmFsVHlwZSA9IHR5cGVvZiB3aW5kb3cgPT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB3aW5kb3c7XG5pbXBvcnQgU3BpbmFsTm9kZSBmcm9tIFwiLi9TcGluYWxOb2RlXCI7XG5pbXBvcnQgU3BpbmFsUmVsYXRpb24gZnJvbSBcIi4vU3BpbmFsUmVsYXRpb25cIjtcbmltcG9ydCBBYnN0cmFjdEVsZW1lbnQgZnJvbSBcIi4vQWJzdHJhY3RFbGVtZW50XCI7XG5pbXBvcnQgQklNRWxlbWVudCBmcm9tIFwiLi9CSU1FbGVtZW50XCI7XG5pbXBvcnQgU3BpbmFsQ29udGV4dCBmcm9tIFwiLi9TcGluYWxDb250ZXh0XCI7XG5pbXBvcnQgU3BpbmFsQXBwbGljYXRpb24gZnJvbSBcIi4vU3BpbmFsQXBwbGljYXRpb25cIjtcblxuaW1wb3J0IHtcbiAgVXRpbGl0aWVzXG59IGZyb20gXCIuL1V0aWxpdGllc1wiO1xuLyoqXG4gKiBUaGUgY29yZSBvZiB0aGUgaW50ZXJhY3Rpb25zIGJldHdlZW4gdGhlIEJJTUVsZW1lbnRzIE5vZGVzIGFuZCBvdGhlciBOb2RlcyhEb2NzLCBUaWNrZXRzLCBldGMgLi4pXG4gKi9cbmNsYXNzIEdyYXBoIGV4dGVuZHMgZ2xvYmFsVHlwZS5Nb2RlbCB7XG4gIC8qKlxuICAgKkNyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgR3JhcGguXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbX25hbWU9dF1cbiAgICogQHBhcmFtIHtQdHJ9IFtfc3RhcnRpbmdOb2RlPW5ldyBQdHIoMCldXG4gICAqIEBtZW1iZXJvZiBHcmFwaFxuICAgKi9cbiAgY29uc3RydWN0b3IoX25hbWUgPSBcInRcIiwgX3N0YXJ0aW5nTm9kZSA9IG5ldyBQdHIoMCksIG5hbWUgPSBcIkdyYXBoXCIpIHtcbiAgICBzdXBlcigpO1xuICAgIGlmIChGaWxlU3lzdGVtLl9zaWdfc2VydmVyKSB7XG4gICAgICB0aGlzLmFkZF9hdHRyKHtcbiAgICAgICAgbmFtZTogX25hbWUsXG4gICAgICAgIGV4dGVybmFsSWROb2RlTWFwcGluZzogbmV3IE1vZGVsKCksXG4gICAgICAgIGd1aWRBYnN0cmFjdE5vZGVNYXBwaW5nOiBuZXcgTW9kZWwoKSxcbiAgICAgICAgc3RhcnRpbmdOb2RlOiBfc3RhcnRpbmdOb2RlLFxuICAgICAgICBub2RlTGlzdDogbmV3IFB0cihuZXcgTHN0KCkpLFxuICAgICAgICBub2RlTGlzdEJ5RWxlbWVudFR5cGU6IG5ldyBNb2RlbCgpLFxuICAgICAgICByZWxhdGlvbkxpc3Q6IG5ldyBQdHIobmV3IExzdCgpKSxcbiAgICAgICAgcmVsYXRpb25MaXN0QnlUeXBlOiBuZXcgTW9kZWwoKSxcbiAgICAgICAgY29udGV4dExpc3Q6IG5ldyBMc3QoKSxcbiAgICAgICAgYXBwc0xpc3Q6IG5ldyBNb2RlbCgpLFxuICAgICAgICByZXNlcnZlZFJlbGF0aW9uc05hbWVzOiBuZXcgTW9kZWwoKVxuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKmZ1bmN0aW9uXG4gICAqVG8gcHV0IHVzZWQgZnVuY3Rpb25zIGFzIHdlbGwgYXMgdGhlIGdyYXBoIG1vZGVsIGluIHRoZSBnbG9iYWwgc2NvcGVcbiAgICovXG4gIGluaXQoKSB7XG4gICAgZ2xvYmFsVHlwZS5zcGluYWwuY29udGV4dFN0dWRpbyA9IHt9O1xuICAgIGdsb2JhbFR5cGUuc3BpbmFsLmNvbnRleHRTdHVkaW8uZ3JhcGggPSB0aGlzO1xuICAgIGdsb2JhbFR5cGUuc3BpbmFsLmNvbnRleHRTdHVkaW8uU3BpbmFsTm9kZSA9IFNwaW5hbE5vZGU7XG4gICAgZ2xvYmFsVHlwZS5zcGluYWwuY29udGV4dFN0dWRpby5TcGluYWxSZWxhdGlvbiA9IFNwaW5hbFJlbGF0aW9uO1xuICAgIGdsb2JhbFR5cGUuc3BpbmFsLmNvbnRleHRTdHVkaW8uQWJzdHJhY3RFbGVtZW50ID0gQWJzdHJhY3RFbGVtZW50O1xuICAgIGdsb2JhbFR5cGUuc3BpbmFsLmNvbnRleHRTdHVkaW8uQklNRWxlbWVudCA9IEJJTUVsZW1lbnQ7XG4gICAgZ2xvYmFsVHlwZS5zcGluYWwuY29udGV4dFN0dWRpby5VdGlsaXRpZXMgPSBVdGlsaXRpZXM7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBfZGJJZFxuICAgKiBAcmV0dXJucyBQcm9taXNlIG9mIHRoZSBjb3JyZXNwb25kaW5nIE5vZGUgb3IgdGhlIGNyZWF0ZWQgb25lIGlmIG5vdCBleGlzdGluZ1xuICAgKiBAbWVtYmVyb2YgR3JhcGhcbiAgICovXG4gIGFzeW5jIGdldE5vZGVCeWRiSWQoX2RiSWQpIHtcbiAgICBsZXQgX2V4dGVybmFsSWQgPSBhd2FpdCBVdGlsaXRpZXMuZ2V0RXh0ZXJuYWxJZChfZGJJZCk7XG4gICAgaWYgKHR5cGVvZiB0aGlzLmV4dGVybmFsSWROb2RlTWFwcGluZ1tfZXh0ZXJuYWxJZF0gIT09IFwidW5kZWZpbmVkXCIpXG4gICAgICByZXR1cm4gdGhpcy5leHRlcm5hbElkTm9kZU1hcHBpbmdbX2V4dGVybmFsSWRdO1xuICAgIGVsc2Uge1xuICAgICAgbGV0IEJJTUVsZW1lbnQxID0gbmV3IEJJTUVsZW1lbnQoX2RiSWQpO1xuICAgICAgQklNRWxlbWVudDEuaW5pdEV4dGVybmFsSWQoKTtcbiAgICAgIGxldCBub2RlID0gYXdhaXQgdGhpcy5hZGROb2RlQXN5bmMoQklNRWxlbWVudDEpO1xuICAgICAgaWYgKEJJTUVsZW1lbnQxLnR5cGUuZ2V0KCkgPT09IFwiXCIpIHtcbiAgICAgICAgQklNRWxlbWVudDEudHlwZS5iaW5kKHRoaXMuX2NsYXNzaWZ5QklNRWxlbWVudE5vZGUuYmluZCh0aGlzLCBub2RlKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbm9kZTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZX0gX25vZGVcbiAgICogQG1lbWJlcm9mIEdyYXBoXG4gICAqL1xuICBhc3luYyBfY2xhc3NpZnlCSU1FbGVtZW50Tm9kZShfbm9kZSkge1xuICAgIC8vVE9ETyBERUxFVEUgT0xEIENMQVNTSUZJQ0FUSU9OXG4gICAgdGhpcy5jbGFzc2lmeU5vZGUoX25vZGUpO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGV9IF9ub2RlXG4gICAqIEByZXR1cm5zIFByb21pc2Ugb2YgZGJJZCBbbnVtYmVyXVxuICAgKiBAbWVtYmVyb2YgR3JhcGhcbiAgICovXG4gIGFzeW5jIGdldERiSWRCeU5vZGUoX25vZGUpIHtcbiAgICBsZXQgZWxlbWVudCA9IGF3YWl0IFV0aWxpdGllcy5wcm9taXNlTG9hZChfbm9kZS5lbGVtZW50KTtcbiAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEJJTUVsZW1lbnQpIHtcbiAgICAgIHJldHVybiBlbGVtZW50LmlkLmdldCgpO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IF9uYW1lXG4gICAqIEBtZW1iZXJvZiBHcmFwaFxuICAgKi9cbiAgc2V0TmFtZShfbmFtZSkge1xuICAgIHRoaXMubmFtZS5zZXQoX25hbWUpO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1B0cn0gX3N0YXJ0aW5nTm9kZVxuICAgKiBAbWVtYmVyb2YgR3JhcGhcbiAgICovXG4gIHNldFN0YXJ0aW5nTm9kZShfc3RhcnRpbmdOb2RlKSB7XG4gICAgdGhpcy5zdGFydGluZ05vZGUuc2V0KF9zdGFydGluZ05vZGUpO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gX0VsZW1lbnRJZCAtIHRoZSBFbGVtZW50IEV4dGVybmFsSWRcbiAgICogQHBhcmFtIHtTcGluYWxOb2RlfSBfbm9kZVxuICAgKiBAbWVtYmVyb2YgR3JhcGhcbiAgICovXG4gIGFzeW5jIF9hZGRFeHRlcm5hbElkTm9kZU1hcHBpbmdFbnRyeShfRWxlbWVudElkLCBfbm9kZSkge1xuICAgIGxldCBfZGJpZCA9IF9FbGVtZW50SWQuZ2V0KCk7XG4gICAgaWYgKHR5cGVvZiBfZGJpZCA9PSBcIm51bWJlclwiKVxuICAgICAgaWYgKF9kYmlkICE9IDApIHtcbiAgICAgICAgbGV0IGV4dGVybmFsSWQgPSBhd2FpdCBVdGlsaXRpZXMuZ2V0RXh0ZXJuYWxJZChfZGJpZCk7XG4gICAgICAgIGxldCBlbGVtZW50ID0gYXdhaXQgVXRpbGl0aWVzLnByb21pc2VMb2FkKF9ub2RlLmVsZW1lbnQpO1xuICAgICAgICBhd2FpdCBlbGVtZW50LmluaXRFeHRlcm5hbElkKCk7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5leHRlcm5hbElkTm9kZU1hcHBpbmdbZXh0ZXJuYWxJZF0gPT09IFwidW5kZWZpbmVkXCIpXG4gICAgICAgICAgdGhpcy5leHRlcm5hbElkTm9kZU1hcHBpbmcuYWRkX2F0dHIoe1xuICAgICAgICAgICAgW2V4dGVybmFsSWRdOiBfbm9kZVxuICAgICAgICAgIH0pO1xuICAgICAgICBfRWxlbWVudElkLnVuYmluZChcbiAgICAgICAgICB0aGlzLl9hZGRFeHRlcm5hbElkTm9kZU1hcHBpbmdFbnRyeS5iaW5kKHRoaXMsIF9FbGVtZW50SWQsXG4gICAgICAgICAgICBfbm9kZSlcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtNb2RlbH0gX2VsZW1lbnQgLSBhbnkgc3ViQ2xhc3Mgb2YgTW9kZWxcbiAgICogQHJldHVybnMgUHJvbWlzZSBvZiB0aGUgY3JlYXRlZCBOb2RlXG4gICAqIEBtZW1iZXJvZiBHcmFwaFxuICAgKi9cbiAgYXN5bmMgYWRkTm9kZUFzeW5jKF9lbGVtZW50KSB7XG4gICAgbGV0IG5hbWUgPSBcIlwiO1xuICAgIGlmIChfZWxlbWVudCBpbnN0YW5jZW9mIEJJTUVsZW1lbnQpIHtcbiAgICAgIGF3YWl0IF9lbGVtZW50LmluaXRFeHRlcm5hbElkQXN5bmMoKTtcbiAgICAgIGlmIChcbiAgICAgICAgdHlwZW9mIHRoaXMuZXh0ZXJuYWxJZE5vZGVNYXBwaW5nW19lbGVtZW50LmV4dGVybmFsSWQuZ2V0KCldICE9PVxuICAgICAgICBcInVuZGVmaW5lZFwiXG4gICAgICApIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJCSU0gT0JKRUNUIE5PREUgQUxSRUFEWSBFWElTVFNcIik7XG4gICAgICAgIHJldHVybiB0aGlzLmV4dGVybmFsSWROb2RlTWFwcGluZ1tfZWxlbWVudC5leHRlcm5hbElkLmdldCgpXTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKF9lbGVtZW50IGluc3RhbmNlb2YgQWJzdHJhY3RFbGVtZW50KSB7XG4gICAgICBpZiAoXG4gICAgICAgIHR5cGVvZiB0aGlzLmd1aWRBYnN0cmFjdE5vZGVNYXBwaW5nW19lbGVtZW50LmlkLmdldCgpXSAhPT1cbiAgICAgICAgXCJ1bmRlZmluZWRcIlxuICAgICAgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQUJTVFJBQ1QgT0JKRUNUIE5PREUgQUxSRUFEWSBFWElTVFNcIik7XG4gICAgICAgIHJldHVybiB0aGlzLmd1aWRBYnN0cmFjdE5vZGVNYXBwaW5nW19lbGVtZW50LmlkLmdldCgpXTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHR5cGVvZiBfZWxlbWVudC5uYW1lICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBuYW1lID0gX2VsZW1lbnQubmFtZS5nZXQoKTtcbiAgICB9XG4gICAgbGV0IG5vZGUgPSBuZXcgU3BpbmFsTm9kZShuYW1lLCBfZWxlbWVudCwgdGhpcyk7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7TW9kZWx9IF9lbGVtZW50IC0gYW55IHN1YkNsYXNzIG9mIE1vZGVsXG4gICAqIEByZXR1cm5zIHRoZSBjcmVhdGVkIE5vZGVcbiAgICogQG1lbWJlcm9mIEdyYXBoXG4gICAqL1xuICBhZGROb2RlKF9lbGVtZW50KSB7XG4gICAgbGV0IG5hbWUgPSBcIlwiO1xuICAgIGlmIChfZWxlbWVudCBpbnN0YW5jZW9mIEJJTUVsZW1lbnQpIHtcbiAgICAgIF9lbGVtZW50LmluaXRFeHRlcm5hbElkKCk7XG4gICAgICBpZiAoXG4gICAgICAgIHR5cGVvZiB0aGlzLmV4dGVybmFsSWROb2RlTWFwcGluZ1tfZWxlbWVudC5leHRlcm5hbElkLmdldCgpXSAhPT1cbiAgICAgICAgXCJ1bmRlZmluZWRcIlxuICAgICAgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQklNIE9CSkVDVCBOT0RFIEFMUkVBRFkgRVhJU1RTXCIpO1xuICAgICAgICByZXR1cm4gdGhpcy5leHRlcm5hbElkTm9kZU1hcHBpbmdbX2VsZW1lbnQuZXh0ZXJuYWxJZC5nZXQoKV07XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChfZWxlbWVudCBpbnN0YW5jZW9mIEFic3RyYWN0RWxlbWVudCkge1xuICAgICAgaWYgKFxuICAgICAgICB0eXBlb2YgdGhpcy5ndWlkQWJzdHJhY3ROb2RlTWFwcGluZ1tfZWxlbWVudC5pZC5nZXQoKV0gIT09XG4gICAgICAgIFwidW5kZWZpbmVkXCJcbiAgICAgICkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkFCU1RSQUNUIE9CSkVDVCBOT0RFIEFMUkVBRFkgRVhJU1RTXCIpO1xuICAgICAgICByZXR1cm4gdGhpcy5ndWlkQWJzdHJhY3ROb2RlTWFwcGluZ1tfZWxlbWVudC5pZC5nZXQoKV07XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0eXBlb2YgX2VsZW1lbnQubmFtZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgbmFtZSA9IF9lbGVtZW50Lm5hbWUuZ2V0KCk7XG4gICAgfVxuICAgIGxldCBub2RlID0gbmV3IFNwaW5hbE5vZGUobmFtZSwgX2VsZW1lbnQsIHRoaXMpO1xuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgLyoqXG4gICAqICBPYnNlcnZlcyB0aGUgdHlwZSBvZiB0aGUgZWxlbWVudCBpbnNpZGUgdGhlIG5vZGUgYWRkIENsYXNzaWZ5IGl0LlxuICAgKiAgSXQgcHV0cyBpdCBpbiB0aGUgVW5jbGFzc2lmaWVkIGxpc3QgT3RoZXJ3aXNlLlxuICAgKiBJdCBhZGRzIHRoZSBub2RlIHRvIHRoZSBtYXBwaW5nIGxpc3Qgd2l0aCBFeHRlcm5hbElkIGlmIHRoZSBPYmplY3QgaXMgb2YgdHlwZSBCSU1FbGVtZW50XG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZX0gX25vZGVcbiAgICogQG1lbWJlcm9mIEdyYXBoXG4gICAqL1xuICBjbGFzc2lmeU5vZGUoX25vZGUpIHtcbiAgICBVdGlsaXRpZXMucHJvbWlzZUxvYWQoX25vZGUuZWxlbWVudCkudGhlbihlbGVtZW50ID0+IHtcbiAgICAgIGlmICh0eXBlb2YgX25vZGUuZ3JhcGggPT09IFwidW5kZWZpbmVkXCIpIF9ub2RlLmdyYXBoLnNldCh0aGlzKTtcbiAgICAgIHRoaXMubm9kZUxpc3QubG9hZChub2RlTGlzdCA9PiB7XG4gICAgICAgIG5vZGVMaXN0LnB1c2goX25vZGUpO1xuICAgICAgfSk7XG4gICAgICBsZXQgdHlwZSA9IFwiVW5jbGFzc2lmaWVkXCI7XG4gICAgICBpZiAodHlwZW9mIGVsZW1lbnQudHlwZSAhPSBcInVuZGVmaW5lZFwiICYmIGVsZW1lbnQudHlwZS5nZXQoKSAhPVxuICAgICAgICBcIlwiKSB7XG4gICAgICAgIHR5cGUgPSBlbGVtZW50LnR5cGUuZ2V0KCk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5ub2RlTGlzdEJ5RWxlbWVudFR5cGVbdHlwZV0pIHtcbiAgICAgICAgdGhpcy5ub2RlTGlzdEJ5RWxlbWVudFR5cGVbdHlwZV0ubG9hZChub2RlTGlzdE9mVHlwZSA9PiB7XG4gICAgICAgICAgbm9kZUxpc3RPZlR5cGUucHVzaChfbm9kZSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IG5vZGVMaXN0T2ZUeXBlID0gbmV3IExzdCgpO1xuICAgICAgICBub2RlTGlzdE9mVHlwZS5wdXNoKF9ub2RlKTtcbiAgICAgICAgdGhpcy5ub2RlTGlzdEJ5RWxlbWVudFR5cGUuYWRkX2F0dHIoe1xuICAgICAgICAgIFt0eXBlXTogbmV3IFB0cihub2RlTGlzdE9mVHlwZSlcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEJJTUVsZW1lbnQpIHtcbiAgICAgICAgbGV0IF9kYmlkID0gZWxlbWVudC5pZC5nZXQoKTtcbiAgICAgICAgaWYgKHR5cGVvZiBfZGJpZCA9PSBcIm51bWJlclwiKVxuICAgICAgICAgIGlmIChfZGJpZCAhPSAwKSB7XG4gICAgICAgICAgICB0aGlzLl9hZGRFeHRlcm5hbElkTm9kZU1hcHBpbmdFbnRyeShlbGVtZW50LmlkLCBfbm9kZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsZW1lbnQuaWQuYmluZChcbiAgICAgICAgICAgICAgdGhpcy5fYWRkRXh0ZXJuYWxJZE5vZGVNYXBwaW5nRW50cnkuYmluZChudWxsLCBlbGVtZW50LmlkLFxuICAgICAgICAgICAgICAgIF9ub2RlKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBBYnN0cmFjdEVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5ndWlkQWJzdHJhY3ROb2RlTWFwcGluZy5hZGRfYXR0cih7XG4gICAgICAgICAgW2VsZW1lbnQuaWQuZ2V0KCldOiBfbm9kZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8vIGFkZE5vZGVzKF92ZXJ0aWNlcykge1xuICAvLyAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBfdmVydGljZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gIC8vICAgICB0aGlzLmNsYXNzaWZ5Tm9kZShfdmVydGljZXNbaW5kZXhdKVxuICAvLyAgIH1cbiAgLy8gfVxuICAvKipcbiAgICogIEl0IGNyZWF0ZXMgdGhlIG5vZGUgY29ycmVzcG9uZGluZyB0byB0aGUgX2VsZW1lbnQsXG4gICAqIHRoZW4gaXQgY3JlYXRlcyBhIHNpbXBsZSByZWxhdGlvbiBvZiBjbGFzcyBTcGluYWxSZWxhdGlvbiBvZiB0eXBlOl90eXBlLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gX3JlbGF0aW9uVHlwZVxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGV9IF9ub2RlXG4gICAqIEBwYXJhbSB7TW9kZWx9IF9lbGVtZW50IC0gYW55IHN1YkNsYXNzIG9mIE1vZGVsXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW19pc0RpcmVjdGVkPWZhbHNlXVxuICAgKiBAcmV0dXJucyBhIFByb21pc2Ugb2YgdGhlIGNyZWF0ZWQgcmVsYXRpb25cbiAgICogQG1lbWJlcm9mIEdyYXBoXG4gICAqL1xuICBhc3luYyBhZGRTaW1wbGVSZWxhdGlvbkFzeW5jKFxuICAgIF9yZWxhdGlvblR5cGUsXG4gICAgX25vZGUsXG4gICAgX2VsZW1lbnQsXG4gICAgX2lzRGlyZWN0ZWQgPSBmYWxzZVxuICApIHtcbiAgICBpZiAoIXRoaXMuaXNSZXNlcnZlZChfcmVsYXRpb25UeXBlKSkge1xuICAgICAgbGV0IG5vZGUyID0gYXdhaXQgdGhpcy5hZGROb2RlQXN5bmMoX2VsZW1lbnQpO1xuICAgICAgbGV0IHJlbCA9IG5ldyBTcGluYWxSZWxhdGlvbihcbiAgICAgICAgX3JlbGF0aW9uVHlwZSwgW19ub2RlXSwgW25vZGUyXSxcbiAgICAgICAgX2lzRGlyZWN0ZWRcbiAgICAgICk7XG4gICAgICB0aGlzLmFkZFJlbGF0aW9uKHJlbCk7XG4gICAgICByZXR1cm4gcmVsO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgX3JlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGlzIHJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW19yZWxhdGlvblR5cGVdXG4gICAgICApO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICogIEl0IGNyZWF0ZXMgdGhlIG5vZGUgY29ycmVzcG9uZGluZyB0byB0aGUgX2VsZW1lbnQsXG4gICAqIHRoZW4gaXQgY3JlYXRlcyBhIHNpbXBsZSByZWxhdGlvbiBvZiBjbGFzcyBTcGluYWxSZWxhdGlvbiBvZiB0eXBlOl90eXBlLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZX0gbm9kZVxuICAgKiBAcGFyYW0ge01vZGVsfSBlbGVtZW50IC0gYW55IHN1YkNsYXNzIG9mIE1vZGVsXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGlyZWN0ZWQ9ZmFsc2VdXG4gICAqIEByZXR1cm5zIGEgUHJvbWlzZSBvZiB0aGUgY3JlYXRlZCByZWxhdGlvblxuICAgKiBAbWVtYmVyb2YgR3JhcGhcbiAgICovXG4gIGFkZFNpbXBsZVJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgbm9kZSwgZWxlbWVudCwgaXNEaXJlY3RlZCA9IGZhbHNlKSB7XG4gICAgaWYgKCF0aGlzLmlzUmVzZXJ2ZWQoX3JlbGF0aW9uVHlwZSkpIHtcbiAgICAgIGxldCBub2RlMiA9IHRoaXMuYWRkTm9kZShlbGVtZW50KTtcbiAgICAgIGxldCByZWwgPSBuZXcgU3BpbmFsUmVsYXRpb24ocmVsYXRpb25UeXBlLCBbbm9kZV0sIFtub2RlMl0sXG4gICAgICAgIGlzRGlyZWN0ZWQpO1xuICAgICAgdGhpcy5hZGRSZWxhdGlvbihyZWwpO1xuICAgICAgcmV0dXJuIHJlbDtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIF9yZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tfcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBhZGRTaW1wbGVSZWxhdGlvbkJ5QXBwKFxuICAgIGFwcE5hbWUsXG4gICAgcmVsYXRpb25UeXBlLFxuICAgIG5vZGUsXG4gICAgZWxlbWVudCxcbiAgICBpc0RpcmVjdGVkID0gZmFsc2VcbiAgKSB7XG4gICAgaWYgKHRoaXMuaGFzUmVzZXJ2YXRpb25DcmVkZW50aWFscyhfcmVsYXRpb25UeXBlLCBhcHBOYW1lKSkge1xuICAgICAgaWYgKHRoaXMuY29udGFpbnNBcHAoYXBwTmFtZSkpIHtcbiAgICAgICAgbGV0IG5vZGUyID0gdGhpcy5hZGROb2RlKGVsZW1lbnQpO1xuICAgICAgICBsZXQgcmVsID0gbmV3IFNwaW5hbFJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgW25vZGVdLCBbbm9kZTJdLFxuICAgICAgICAgIGlzRGlyZWN0ZWQpO1xuICAgICAgICB0aGlzLmFkZFJlbGF0aW9uKHJlbCwgYXBwTmFtZSk7XG4gICAgICAgIHJldHVybiByZWw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKGFwcE5hbWUgKyBcIiBkb2VzIG5vdCBleGlzdFwiKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIF9yZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tfcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBhZGRSZWxhdGlvbihyZWxhdGlvbiwgYXBwTmFtZSkge1xuICAgIGlmICh0aGlzLmhhc1Jlc2VydmF0aW9uQ3JlZGVudGlhbHMocmVsYXRpb24udHlwZS5nZXQoKSwgYXBwTmFtZSkpIHtcbiAgICAgIGlmIChyZWxhdGlvbi5pc0RpcmVjdGVkLmdldCgpKSB7XG4gICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCByZWxhdGlvbi5ub2RlTGlzdDEubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgY29uc3Qgbm9kZSA9IHJlbGF0aW9uLm5vZGVMaXN0MVtpbmRleF07XG4gICAgICAgICAgbm9kZS5hZGREaXJlY3RlZFJlbGF0aW9uUGFyZW50KHJlbGF0aW9uLCBhcHBOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcmVsYXRpb24ubm9kZUxpc3QyLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgIGNvbnN0IG5vZGUgPSByZWxhdGlvbi5ub2RlTGlzdDJbaW5kZXhdO1xuICAgICAgICAgIG5vZGUuYWRkRGlyZWN0ZWRSZWxhdGlvbkNoaWxkKHJlbGF0aW9uLCBhcHBOYW1lKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHJlbGF0aW9uLm5vZGVMaXN0MS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICBjb25zdCBub2RlID0gcmVsYXRpb24ubm9kZUxpc3QxW2luZGV4XTtcbiAgICAgICAgICBub2RlLmFkZE5vbkRpcmVjdGVkUmVsYXRpb24ocmVsYXRpb24sIGFwcE5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCByZWxhdGlvbi5ub2RlTGlzdDIubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgY29uc3Qgbm9kZSA9IHJlbGF0aW9uLm5vZGVMaXN0MltpbmRleF07XG4gICAgICAgICAgbm9kZS5hZGROb25EaXJlY3RlZFJlbGF0aW9uKHJlbGF0aW9uLCBhcHBOYW1lKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5fY2xhc3NpZnlSZWxhdGlvbihyZWxhdGlvbiwgYXBwTmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICByZWxhdGlvbi50eXBlLmdldCgpICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb24udHlwZS5nZXQoKV1cbiAgICAgICk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9uc30gX3JlbGF0aW9uc1xuICAgKiBAbWVtYmVyb2YgR3JhcGhcbiAgICovXG4gIGFkZFJlbGF0aW9ucyhfcmVsYXRpb25zKSB7XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IF9yZWxhdGlvbnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCByZWxhdGlvbiA9IF9yZWxhdGlvbnNbaW5kZXhdO1xuICAgICAgdGhpcy5hZGRSZWxhdGlvbihyZWxhdGlvbik7XG4gICAgfVxuICB9XG5cbiAgX2NsYXNzaWZ5UmVsYXRpb24ocmVsYXRpb24sIGFwcE5hbWUpIHtcbiAgICB0aGlzLnJlbGF0aW9uTGlzdC5sb2FkKHJlbGF0aW9uTGlzdCA9PiB7XG4gICAgICByZWxhdGlvbkxpc3QucHVzaChyZWxhdGlvbik7XG4gICAgfSk7XG4gICAgaWYgKHRoaXMucmVsYXRpb25MaXN0QnlUeXBlW3JlbGF0aW9uLnR5cGUuZ2V0KCldKSB7XG4gICAgICB0aGlzLnJlbGF0aW9uTGlzdEJ5VHlwZVtyZWxhdGlvbi50eXBlLmdldCgpXS5sb2FkKHJlbGF0aW9uTGlzdE9mVHlwZSA9PiB7XG4gICAgICAgIHJlbGF0aW9uTGlzdE9mVHlwZS5wdXNoKHJlbGF0aW9uKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcmVsYXRpb25MaXN0T2ZUeXBlID0gbmV3IExzdCgpO1xuICAgICAgcmVsYXRpb25MaXN0T2ZUeXBlLnB1c2gocmVsYXRpb24pO1xuICAgICAgdGhpcy5yZWxhdGlvbkxpc3RCeVR5cGUuYWRkX2F0dHIoe1xuICAgICAgICBbcmVsYXRpb24udHlwZS5nZXQoKV06IG5ldyBQdHIocmVsYXRpb25MaXN0T2ZUeXBlKVxuICAgICAgfSk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgYXBwTmFtZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgaWYgKFxuICAgICAgICB0eXBlb2YgdGhpcy5hcHBzTGlzdFthcHBOYW1lXVtyZWxhdGlvbi50eXBlLmdldCgpXSA9PT1cbiAgICAgICAgXCJ1bmRlZmluZWRcIlxuICAgICAgKSB7XG4gICAgICAgIHRoaXMuYXBwc0xpc3RbYXBwTmFtZV0uYWRkUmVsYXRpb24ocmVsYXRpb24pXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29udGFpbnNBcHAoYXBwTmFtZSkge1xuICAgIHJldHVybiB0eXBlb2YgdGhpcy5hcHBzTGlzdFthcHBOYW1lXSAhPT0gXCJ1bmRlZmluZWRcIjtcbiAgfVxuXG4gIGlzUmVzZXJ2ZWQocmVsYXRpb25UeXBlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB0aGlzLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb25UeXBlXSAhPT0gXCJ1bmRlZmluZWRcIjtcbiAgfVxuXG4gIGhhc1Jlc2VydmF0aW9uQ3JlZGVudGlhbHMocmVsYXRpb25UeXBlLCBhcHBOYW1lKSB7XG4gICAgcmV0dXJuICghdGhpcy5pc1Jlc2VydmVkKHJlbGF0aW9uVHlwZSkgfHxcbiAgICAgICh0aGlzLmlzUmVzZXJ2ZWQocmVsYXRpb25UeXBlKSAmJlxuICAgICAgICB0aGlzLnJlc2VydmVkUmVsYXRpb25zTmFtZXMocmVsYXRpb25UeXBlKSA9PT0gYXBwTmFtZSlcbiAgICApO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9uc30gcmVsYXRpb25zXG4gICAqIEBtZW1iZXJvZiBHcmFwaFxuICAgKi9cbiAgX2NsYXNzaWZ5UmVsYXRpb25zKF9yZWxhdGlvbnMpIHtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX3JlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHRoaXMuX2NsYXNzaWZ5UmVsYXRpb24oX3JlbGF0aW9uc1tpbmRleF0pO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtMc3R9IF9saXN0XG4gICAqIEBtZW1iZXJvZiBHcmFwaFxuICAgKi9cbiAgX2FkZE5vdEV4aXN0aW5nTm9kZXNGcm9tTGlzdChfbGlzdCkge1xuICAgIHRoaXMubm9kZUxpc3QubG9hZChub2RlTGlzdCA9PiB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IF9saXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxldCBub2RlID0gX2xpc3RbaV07XG4gICAgICAgIGlmICghVXRpbGl0aWVzLmNvbnRhaW5zTHN0QnlJZChub2RlTGlzdCwgbm9kZSkpIHtcbiAgICAgICAgICB0aGlzLmNsYXNzaWZ5Tm9kZShub2RlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9uc30gX3JlbGF0aW9uXG4gICAqIEBtZW1iZXJvZiBHcmFwaFxuICAgKi9cbiAgX2FkZE5vdEV4aXN0aW5nTm9kZXNGcm9tUmVsYXRpb24oX3JlbGF0aW9uKSB7XG4gICAgdGhpcy5fYWRkTm90RXhpc3RpbmdOb2Rlc0Zyb21MaXN0KF9yZWxhdGlvbi5ub2RlTGlzdDEpO1xuICAgIHRoaXMuX2FkZE5vdEV4aXN0aW5nTm9kZXNGcm9tTGlzdChfcmVsYXRpb24ubm9kZUxpc3QyKTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IF9uYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nc30gX3VzZWRSZWxhdGlvbnNcbiAgICogQHBhcmFtIHtTcGluYWxOb2RlfSBfc3RhcnRpbmdOb2RlXG4gICAqIEBwYXJhbSB7R3JhcGh9IFtfdXNlZEdyYXBoPXRoaXNdXG4gICAqIEByZXR1cm5zIFRoZSBjcmVhdGVkIENvbnRleHRcbiAgICogQG1lbWJlcm9mIEdyYXBoXG4gICAqL1xuICBhZGRDb250ZXh0KF9uYW1lLCBfdXNlZFJlbGF0aW9ucywgX3N0YXJ0aW5nTm9kZSwgX3VzZWRHcmFwaCA9IHRoaXMpIHtcbiAgICBsZXQgY29udGV4dCA9IG5ldyBTcGluYWxDb250ZXh0KFxuICAgICAgX25hbWUsXG4gICAgICBfdXNlZFJlbGF0aW9ucyxcbiAgICAgIF9zdGFydGluZ05vZGUsXG4gICAgICBfdXNlZEdyYXBoXG4gICAgKTtcbiAgICB0aGlzLmNvbnRleHRMaXN0LnB1c2goY29udGV4dCk7XG4gICAgcmV0dXJuIGNvbnRleHQ7XG4gIH1cblxuICBnZXRBcHAobmFtZSwgcmVsYXRpb25zVHlwZXNMc3QsIHJlbGF0ZWRHcmFwaCA9IHRoaXMpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMuYXBwc0xpc3RbbmFtZV0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGxldCBzcGluYWxBcHBsaWNhdGlvbiA9IG5ldyBTcGluYWxBcHBsaWNhdGlvbihcbiAgICAgICAgbmFtZSxcbiAgICAgICAgcmVsYXRpb25zVHlwZXNMc3QsXG4gICAgICAgIHJlbGF0ZWRHcmFwaFxuICAgICAgKTtcbiAgICAgIHRoaXMuYXBwc0xpc3QuYWRkX2F0dHIoe1xuICAgICAgICBbbmFtZV06IHNwaW5hbEFwcGxpY2F0aW9uXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBzcGluYWxBcHBsaWNhdGlvbjtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5hcHBzTGlzdFtuYW1lXVxuICAgICAgLy8gY29uc29sZS5lcnJvcihcbiAgICAgIC8vICAgbmFtZSArXG4gICAgICAvLyAgIFwiIGFzIHdlbGwgYXMgXCIgK1xuICAgICAgLy8gICB0aGlzLmdldEFwcHNOYW1lcygpICtcbiAgICAgIC8vICAgXCIgaGF2ZSBiZWVuIGFscmVhZHkgdXNlZCwgcGxlYXNlIGNob29zZSBhbm90aGVyIGFwcGxpY2F0aW9uIG5hbWVcIlxuICAgICAgLy8gKTtcbiAgICB9XG4gIH1cblxuICBnZXRBcHBzTmFtZXMoKSB7XG4gICAgdGhpcy5hcHBzTGlzdC5fYXR0cmlidXRlX25hbWVzO1xuICB9XG5cbiAgcmVzZXJ2ZVVuaXF1ZVJlbGF0aW9uVHlwZShyZWxhdGlvblR5cGUsIGFwcCkge1xuICAgIGlmIChcbiAgICAgIHR5cGVvZiB0aGlzLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb25UeXBlXSA9PT0gXCJ1bmRlZmluZWRcIiAmJlxuICAgICAgdHlwZW9mIHRoaXMucmVsYXRpb25MaXN0QnlUeXBlW3JlbGF0aW9uVHlwZV0gPT09IFwidW5kZWZpbmVkXCJcbiAgICApIHtcbiAgICAgIHRoaXMucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lcy5hZGRfYXR0cih7XG4gICAgICAgIFtyZWxhdGlvblR5cGVdOiBhcHAubmFtZS5nZXQoKVxuICAgICAgfSk7XG4gICAgICBhcHAuYWRkUmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgdHlwZW9mIHRoaXMucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvblR5cGVdICE9PSBcInVuZGVmaW5lZFwiXG4gICAgKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICByZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBoYXMgbm90IGJlZW4gYWRkZWQgdG8gYXBwOiBcIiArXG4gICAgICAgIGFwcC5uYW1lLmdldCgpICtcbiAgICAgICAgXCIsQ2F1c2UgOiBhbHJlYWR5IFJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uVHlwZV1cbiAgICAgICk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5yZWxhdGlvbkxpc3RCeVR5cGVbcmVsYXRpb25UeXBlXSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgaGFzIG5vdCBiZWVuIGFkZGVkIHRvIGFwcDogXCIgK1xuICAgICAgICBhcHAubmFtZS5nZXQoKSArXG4gICAgICAgIFwiLENhdXNlIDogYWxyZWFkeSBVc2VkIGJ5IG90aGVyIEFwcHNcIlxuICAgICAgKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgR3JhcGg7XG5zcGluYWxDb3JlLnJlZ2lzdGVyX21vZGVscyhbR3JhcGhdKTsiXX0=