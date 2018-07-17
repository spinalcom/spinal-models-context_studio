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
      return this.appsList[name];
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9HcmFwaC5qcyJdLCJuYW1lcyI6WyJzcGluYWxDb3JlIiwicmVxdWlyZSIsImdsb2JhbFR5cGUiLCJ3aW5kb3ciLCJnbG9iYWwiLCJHcmFwaCIsIk1vZGVsIiwiY29uc3RydWN0b3IiLCJfbmFtZSIsIl9zdGFydGluZ05vZGUiLCJQdHIiLCJuYW1lIiwiRmlsZVN5c3RlbSIsIl9zaWdfc2VydmVyIiwiYWRkX2F0dHIiLCJleHRlcm5hbElkTm9kZU1hcHBpbmciLCJndWlkQWJzdHJhY3ROb2RlTWFwcGluZyIsInN0YXJ0aW5nTm9kZSIsIm5vZGVMaXN0IiwiTHN0Iiwibm9kZUxpc3RCeUVsZW1lbnRUeXBlIiwicmVsYXRpb25MaXN0IiwicmVsYXRpb25MaXN0QnlUeXBlIiwiY29udGV4dExpc3QiLCJhcHBzTGlzdCIsInJlc2VydmVkUmVsYXRpb25zTmFtZXMiLCJpbml0Iiwic3BpbmFsIiwiY29udGV4dFN0dWRpbyIsImdyYXBoIiwiU3BpbmFsTm9kZSIsIlNwaW5hbFJlbGF0aW9uIiwiQWJzdHJhY3RFbGVtZW50IiwiQklNRWxlbWVudCIsIlV0aWxpdGllcyIsImdldE5vZGVCeWRiSWQiLCJfZGJJZCIsIl9leHRlcm5hbElkIiwiZ2V0RXh0ZXJuYWxJZCIsIkJJTUVsZW1lbnQxIiwiaW5pdEV4dGVybmFsSWQiLCJub2RlIiwiYWRkTm9kZUFzeW5jIiwidHlwZSIsImdldCIsImJpbmQiLCJfY2xhc3NpZnlCSU1FbGVtZW50Tm9kZSIsIl9ub2RlIiwiY2xhc3NpZnlOb2RlIiwiZ2V0RGJJZEJ5Tm9kZSIsImVsZW1lbnQiLCJwcm9taXNlTG9hZCIsImlkIiwic2V0TmFtZSIsInNldCIsInNldFN0YXJ0aW5nTm9kZSIsIl9hZGRFeHRlcm5hbElkTm9kZU1hcHBpbmdFbnRyeSIsIl9FbGVtZW50SWQiLCJfZGJpZCIsImV4dGVybmFsSWQiLCJ1bmJpbmQiLCJfZWxlbWVudCIsImluaXRFeHRlcm5hbElkQXN5bmMiLCJjb25zb2xlIiwibG9nIiwiYWRkTm9kZSIsInRoZW4iLCJsb2FkIiwicHVzaCIsIm5vZGVMaXN0T2ZUeXBlIiwiYWRkU2ltcGxlUmVsYXRpb25Bc3luYyIsIl9yZWxhdGlvblR5cGUiLCJfaXNEaXJlY3RlZCIsImlzUmVzZXJ2ZWQiLCJub2RlMiIsInJlbCIsImFkZFJlbGF0aW9uIiwiYWRkU2ltcGxlUmVsYXRpb24iLCJyZWxhdGlvblR5cGUiLCJpc0RpcmVjdGVkIiwiYWRkU2ltcGxlUmVsYXRpb25CeUFwcCIsImFwcE5hbWUiLCJoYXNSZXNlcnZhdGlvbkNyZWRlbnRpYWxzIiwiY29udGFpbnNBcHAiLCJlcnJvciIsInJlbGF0aW9uIiwiaW5kZXgiLCJub2RlTGlzdDEiLCJsZW5ndGgiLCJhZGREaXJlY3RlZFJlbGF0aW9uUGFyZW50Iiwibm9kZUxpc3QyIiwiYWRkRGlyZWN0ZWRSZWxhdGlvbkNoaWxkIiwiYWRkTm9uRGlyZWN0ZWRSZWxhdGlvbiIsIl9jbGFzc2lmeVJlbGF0aW9uIiwiYWRkUmVsYXRpb25zIiwiX3JlbGF0aW9ucyIsInJlbGF0aW9uTGlzdE9mVHlwZSIsIl9jbGFzc2lmeVJlbGF0aW9ucyIsIl9hZGROb3RFeGlzdGluZ05vZGVzRnJvbUxpc3QiLCJfbGlzdCIsImkiLCJjb250YWluc0xzdEJ5SWQiLCJfYWRkTm90RXhpc3RpbmdOb2Rlc0Zyb21SZWxhdGlvbiIsIl9yZWxhdGlvbiIsImFkZENvbnRleHQiLCJfdXNlZFJlbGF0aW9ucyIsIl91c2VkR3JhcGgiLCJjb250ZXh0IiwiU3BpbmFsQ29udGV4dCIsImdldEFwcCIsInJlbGF0aW9uc1R5cGVzTHN0IiwicmVsYXRlZEdyYXBoIiwic3BpbmFsQXBwbGljYXRpb24iLCJTcGluYWxBcHBsaWNhdGlvbiIsImdldEFwcHNOYW1lcyIsIl9hdHRyaWJ1dGVfbmFtZXMiLCJyZXNlcnZlVW5pcXVlUmVsYXRpb25UeXBlIiwiYXBwIiwiYWRkUmVsYXRpb25UeXBlIiwicmVnaXN0ZXJfbW9kZWxzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7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U2lDLEdBQVQsRUFGQSxHQUdBLCtCQUhBLEdBSUEsS0FBS25CLHNCQUFMLENBQTRCcUQsWUFBNUIsQ0FMRjtBQU9BLGFBQU8sS0FBUDtBQUNELEtBWE0sTUFXQSxJQUFJLE9BQU8sS0FBS3hELGtCQUFMLENBQXdCd0QsWUFBeEIsQ0FBUCxLQUFpRCxXQUFyRCxFQUFrRTtBQUN2RWYsY0FBUXFCLEtBQVIsQ0FDRU4sZUFDQSw4QkFEQSxHQUVBdUMsSUFBSTFHLElBQUosQ0FBU2lDLEdBQVQsRUFGQSxHQUdBLHFDQUpGO0FBTUQ7QUFDRjtBQS9nQmtDOztrQkFraEJ0QnZDLEs7O0FBQ2ZMLFdBQVd1SCxlQUFYLENBQTJCLENBQUNsSCxLQUFELENBQTNCIiwiZmlsZSI6IkdyYXBoLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3Qgc3BpbmFsQ29yZSA9IHJlcXVpcmUoXCJzcGluYWwtY29yZS1jb25uZWN0b3Jqc1wiKTtcbmNvbnN0IGdsb2JhbFR5cGUgPSB0eXBlb2Ygd2luZG93ID09PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogd2luZG93O1xuaW1wb3J0IFNwaW5hbE5vZGUgZnJvbSBcIi4vU3BpbmFsTm9kZVwiO1xuaW1wb3J0IFNwaW5hbFJlbGF0aW9uIGZyb20gXCIuL1NwaW5hbFJlbGF0aW9uXCI7XG5pbXBvcnQgQWJzdHJhY3RFbGVtZW50IGZyb20gXCIuL0Fic3RyYWN0RWxlbWVudFwiO1xuaW1wb3J0IEJJTUVsZW1lbnQgZnJvbSBcIi4vQklNRWxlbWVudFwiO1xuaW1wb3J0IFNwaW5hbENvbnRleHQgZnJvbSBcIi4vU3BpbmFsQ29udGV4dFwiO1xuaW1wb3J0IFNwaW5hbEFwcGxpY2F0aW9uIGZyb20gXCIuL1NwaW5hbEFwcGxpY2F0aW9uXCI7XG5cbmltcG9ydCB7XG4gIFV0aWxpdGllc1xufSBmcm9tIFwiLi9VdGlsaXRpZXNcIjtcbi8qKlxuICogVGhlIGNvcmUgb2YgdGhlIGludGVyYWN0aW9ucyBiZXR3ZWVuIHRoZSBCSU1FbGVtZW50cyBOb2RlcyBhbmQgb3RoZXIgTm9kZXMoRG9jcywgVGlja2V0cywgZXRjIC4uKVxuICovXG5jbGFzcyBHcmFwaCBleHRlbmRzIGdsb2JhbFR5cGUuTW9kZWwge1xuICAvKipcbiAgICpDcmVhdGVzIGFuIGluc3RhbmNlIG9mIEdyYXBoLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gW19uYW1lPXRdXG4gICAqIEBwYXJhbSB7UHRyfSBbX3N0YXJ0aW5nTm9kZT1uZXcgUHRyKDApXVxuICAgKiBAbWVtYmVyb2YgR3JhcGhcbiAgICovXG4gIGNvbnN0cnVjdG9yKF9uYW1lID0gXCJ0XCIsIF9zdGFydGluZ05vZGUgPSBuZXcgUHRyKDApLCBuYW1lID0gXCJHcmFwaFwiKSB7XG4gICAgc3VwZXIoKTtcbiAgICBpZiAoRmlsZVN5c3RlbS5fc2lnX3NlcnZlcikge1xuICAgICAgdGhpcy5hZGRfYXR0cih7XG4gICAgICAgIG5hbWU6IF9uYW1lLFxuICAgICAgICBleHRlcm5hbElkTm9kZU1hcHBpbmc6IG5ldyBNb2RlbCgpLFxuICAgICAgICBndWlkQWJzdHJhY3ROb2RlTWFwcGluZzogbmV3IE1vZGVsKCksXG4gICAgICAgIHN0YXJ0aW5nTm9kZTogX3N0YXJ0aW5nTm9kZSxcbiAgICAgICAgbm9kZUxpc3Q6IG5ldyBQdHIobmV3IExzdCgpKSxcbiAgICAgICAgbm9kZUxpc3RCeUVsZW1lbnRUeXBlOiBuZXcgTW9kZWwoKSxcbiAgICAgICAgcmVsYXRpb25MaXN0OiBuZXcgUHRyKG5ldyBMc3QoKSksXG4gICAgICAgIHJlbGF0aW9uTGlzdEJ5VHlwZTogbmV3IE1vZGVsKCksXG4gICAgICAgIGNvbnRleHRMaXN0OiBuZXcgTHN0KCksXG4gICAgICAgIGFwcHNMaXN0OiBuZXcgTW9kZWwoKSxcbiAgICAgICAgcmVzZXJ2ZWRSZWxhdGlvbnNOYW1lczogbmV3IE1vZGVsKClcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpmdW5jdGlvblxuICAgKlRvIHB1dCB1c2VkIGZ1bmN0aW9ucyBhcyB3ZWxsIGFzIHRoZSBncmFwaCBtb2RlbCBpbiB0aGUgZ2xvYmFsIHNjb3BlXG4gICAqL1xuICBpbml0KCkge1xuICAgIGdsb2JhbFR5cGUuc3BpbmFsLmNvbnRleHRTdHVkaW8gPSB7fTtcbiAgICBnbG9iYWxUeXBlLnNwaW5hbC5jb250ZXh0U3R1ZGlvLmdyYXBoID0gdGhpcztcbiAgICBnbG9iYWxUeXBlLnNwaW5hbC5jb250ZXh0U3R1ZGlvLlNwaW5hbE5vZGUgPSBTcGluYWxOb2RlO1xuICAgIGdsb2JhbFR5cGUuc3BpbmFsLmNvbnRleHRTdHVkaW8uU3BpbmFsUmVsYXRpb24gPSBTcGluYWxSZWxhdGlvbjtcbiAgICBnbG9iYWxUeXBlLnNwaW5hbC5jb250ZXh0U3R1ZGlvLkFic3RyYWN0RWxlbWVudCA9IEFic3RyYWN0RWxlbWVudDtcbiAgICBnbG9iYWxUeXBlLnNwaW5hbC5jb250ZXh0U3R1ZGlvLkJJTUVsZW1lbnQgPSBCSU1FbGVtZW50O1xuICAgIGdsb2JhbFR5cGUuc3BpbmFsLmNvbnRleHRTdHVkaW8uVXRpbGl0aWVzID0gVXRpbGl0aWVzO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gX2RiSWRcbiAgICogQHJldHVybnMgUHJvbWlzZSBvZiB0aGUgY29ycmVzcG9uZGluZyBOb2RlIG9yIHRoZSBjcmVhdGVkIG9uZSBpZiBub3QgZXhpc3RpbmdcbiAgICogQG1lbWJlcm9mIEdyYXBoXG4gICAqL1xuICBhc3luYyBnZXROb2RlQnlkYklkKF9kYklkKSB7XG4gICAgbGV0IF9leHRlcm5hbElkID0gYXdhaXQgVXRpbGl0aWVzLmdldEV4dGVybmFsSWQoX2RiSWQpO1xuICAgIGlmICh0eXBlb2YgdGhpcy5leHRlcm5hbElkTm9kZU1hcHBpbmdbX2V4dGVybmFsSWRdICE9PSBcInVuZGVmaW5lZFwiKVxuICAgICAgcmV0dXJuIHRoaXMuZXh0ZXJuYWxJZE5vZGVNYXBwaW5nW19leHRlcm5hbElkXTtcbiAgICBlbHNlIHtcbiAgICAgIGxldCBCSU1FbGVtZW50MSA9IG5ldyBCSU1FbGVtZW50KF9kYklkKTtcbiAgICAgIEJJTUVsZW1lbnQxLmluaXRFeHRlcm5hbElkKCk7XG4gICAgICBsZXQgbm9kZSA9IGF3YWl0IHRoaXMuYWRkTm9kZUFzeW5jKEJJTUVsZW1lbnQxKTtcbiAgICAgIGlmIChCSU1FbGVtZW50MS50eXBlLmdldCgpID09PSBcIlwiKSB7XG4gICAgICAgIEJJTUVsZW1lbnQxLnR5cGUuYmluZCh0aGlzLl9jbGFzc2lmeUJJTUVsZW1lbnROb2RlLmJpbmQodGhpcywgbm9kZSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGV9IF9ub2RlXG4gICAqIEBtZW1iZXJvZiBHcmFwaFxuICAgKi9cbiAgYXN5bmMgX2NsYXNzaWZ5QklNRWxlbWVudE5vZGUoX25vZGUpIHtcbiAgICAvL1RPRE8gREVMRVRFIE9MRCBDTEFTU0lGSUNBVElPTlxuICAgIHRoaXMuY2xhc3NpZnlOb2RlKF9ub2RlKTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxOb2RlfSBfbm9kZVxuICAgKiBAcmV0dXJucyBQcm9taXNlIG9mIGRiSWQgW251bWJlcl1cbiAgICogQG1lbWJlcm9mIEdyYXBoXG4gICAqL1xuICBhc3luYyBnZXREYklkQnlOb2RlKF9ub2RlKSB7XG4gICAgbGV0IGVsZW1lbnQgPSBhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQoX25vZGUuZWxlbWVudCk7XG4gICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBCSU1FbGVtZW50KSB7XG4gICAgICByZXR1cm4gZWxlbWVudC5pZC5nZXQoKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBfbmFtZVxuICAgKiBAbWVtYmVyb2YgR3JhcGhcbiAgICovXG4gIHNldE5hbWUoX25hbWUpIHtcbiAgICB0aGlzLm5hbWUuc2V0KF9uYW1lKTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtQdHJ9IF9zdGFydGluZ05vZGVcbiAgICogQG1lbWJlcm9mIEdyYXBoXG4gICAqL1xuICBzZXRTdGFydGluZ05vZGUoX3N0YXJ0aW5nTm9kZSkge1xuICAgIHRoaXMuc3RhcnRpbmdOb2RlLnNldChfc3RhcnRpbmdOb2RlKTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IF9FbGVtZW50SWQgLSB0aGUgRWxlbWVudCBFeHRlcm5hbElkXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZX0gX25vZGVcbiAgICogQG1lbWJlcm9mIEdyYXBoXG4gICAqL1xuICBhc3luYyBfYWRkRXh0ZXJuYWxJZE5vZGVNYXBwaW5nRW50cnkoX0VsZW1lbnRJZCwgX25vZGUpIHtcbiAgICBsZXQgX2RiaWQgPSBfRWxlbWVudElkLmdldCgpO1xuICAgIGlmICh0eXBlb2YgX2RiaWQgPT0gXCJudW1iZXJcIilcbiAgICAgIGlmIChfZGJpZCAhPSAwKSB7XG4gICAgICAgIGxldCBleHRlcm5hbElkID0gYXdhaXQgVXRpbGl0aWVzLmdldEV4dGVybmFsSWQoX2RiaWQpO1xuICAgICAgICBsZXQgZWxlbWVudCA9IGF3YWl0IFV0aWxpdGllcy5wcm9taXNlTG9hZChfbm9kZS5lbGVtZW50KTtcbiAgICAgICAgYXdhaXQgZWxlbWVudC5pbml0RXh0ZXJuYWxJZCgpO1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMuZXh0ZXJuYWxJZE5vZGVNYXBwaW5nW2V4dGVybmFsSWRdID09PSBcInVuZGVmaW5lZFwiKVxuICAgICAgICAgIHRoaXMuZXh0ZXJuYWxJZE5vZGVNYXBwaW5nLmFkZF9hdHRyKHtcbiAgICAgICAgICAgIFtleHRlcm5hbElkXTogX25vZGVcbiAgICAgICAgICB9KTtcbiAgICAgICAgX0VsZW1lbnRJZC51bmJpbmQoXG4gICAgICAgICAgdGhpcy5fYWRkRXh0ZXJuYWxJZE5vZGVNYXBwaW5nRW50cnkuYmluZCh0aGlzLCBfRWxlbWVudElkLFxuICAgICAgICAgICAgX25vZGUpXG4gICAgICAgICk7XG4gICAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7TW9kZWx9IF9lbGVtZW50IC0gYW55IHN1YkNsYXNzIG9mIE1vZGVsXG4gICAqIEByZXR1cm5zIFByb21pc2Ugb2YgdGhlIGNyZWF0ZWQgTm9kZVxuICAgKiBAbWVtYmVyb2YgR3JhcGhcbiAgICovXG4gIGFzeW5jIGFkZE5vZGVBc3luYyhfZWxlbWVudCkge1xuICAgIGxldCBuYW1lID0gXCJcIjtcbiAgICBpZiAoX2VsZW1lbnQgaW5zdGFuY2VvZiBCSU1FbGVtZW50KSB7XG4gICAgICBhd2FpdCBfZWxlbWVudC5pbml0RXh0ZXJuYWxJZEFzeW5jKCk7XG4gICAgICBpZiAoXG4gICAgICAgIHR5cGVvZiB0aGlzLmV4dGVybmFsSWROb2RlTWFwcGluZ1tfZWxlbWVudC5leHRlcm5hbElkLmdldCgpXSAhPT1cbiAgICAgICAgXCJ1bmRlZmluZWRcIlxuICAgICAgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQklNIE9CSkVDVCBOT0RFIEFMUkVBRFkgRVhJU1RTXCIpO1xuICAgICAgICByZXR1cm4gdGhpcy5leHRlcm5hbElkTm9kZU1hcHBpbmdbX2VsZW1lbnQuZXh0ZXJuYWxJZC5nZXQoKV07XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChfZWxlbWVudCBpbnN0YW5jZW9mIEFic3RyYWN0RWxlbWVudCkge1xuICAgICAgaWYgKFxuICAgICAgICB0eXBlb2YgdGhpcy5ndWlkQWJzdHJhY3ROb2RlTWFwcGluZ1tfZWxlbWVudC5pZC5nZXQoKV0gIT09XG4gICAgICAgIFwidW5kZWZpbmVkXCJcbiAgICAgICkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkFCU1RSQUNUIE9CSkVDVCBOT0RFIEFMUkVBRFkgRVhJU1RTXCIpO1xuICAgICAgICByZXR1cm4gdGhpcy5ndWlkQWJzdHJhY3ROb2RlTWFwcGluZ1tfZWxlbWVudC5pZC5nZXQoKV07XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0eXBlb2YgX2VsZW1lbnQubmFtZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgbmFtZSA9IF9lbGVtZW50Lm5hbWUuZ2V0KCk7XG4gICAgfVxuICAgIGxldCBub2RlID0gbmV3IFNwaW5hbE5vZGUobmFtZSwgX2VsZW1lbnQsIHRoaXMpO1xuICAgIHJldHVybiBub2RlO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge01vZGVsfSBfZWxlbWVudCAtIGFueSBzdWJDbGFzcyBvZiBNb2RlbFxuICAgKiBAcmV0dXJucyB0aGUgY3JlYXRlZCBOb2RlXG4gICAqIEBtZW1iZXJvZiBHcmFwaFxuICAgKi9cbiAgYWRkTm9kZShfZWxlbWVudCkge1xuICAgIGxldCBuYW1lID0gXCJcIjtcbiAgICBpZiAoX2VsZW1lbnQgaW5zdGFuY2VvZiBCSU1FbGVtZW50KSB7XG4gICAgICBfZWxlbWVudC5pbml0RXh0ZXJuYWxJZCgpO1xuICAgICAgaWYgKFxuICAgICAgICB0eXBlb2YgdGhpcy5leHRlcm5hbElkTm9kZU1hcHBpbmdbX2VsZW1lbnQuZXh0ZXJuYWxJZC5nZXQoKV0gIT09XG4gICAgICAgIFwidW5kZWZpbmVkXCJcbiAgICAgICkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkJJTSBPQkpFQ1QgTk9ERSBBTFJFQURZIEVYSVNUU1wiKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXh0ZXJuYWxJZE5vZGVNYXBwaW5nW19lbGVtZW50LmV4dGVybmFsSWQuZ2V0KCldO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoX2VsZW1lbnQgaW5zdGFuY2VvZiBBYnN0cmFjdEVsZW1lbnQpIHtcbiAgICAgIGlmIChcbiAgICAgICAgdHlwZW9mIHRoaXMuZ3VpZEFic3RyYWN0Tm9kZU1hcHBpbmdbX2VsZW1lbnQuaWQuZ2V0KCldICE9PVxuICAgICAgICBcInVuZGVmaW5lZFwiXG4gICAgICApIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJBQlNUUkFDVCBPQkpFQ1QgTk9ERSBBTFJFQURZIEVYSVNUU1wiKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3VpZEFic3RyYWN0Tm9kZU1hcHBpbmdbX2VsZW1lbnQuaWQuZ2V0KCldO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodHlwZW9mIF9lbGVtZW50Lm5hbWUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIG5hbWUgPSBfZWxlbWVudC5uYW1lLmdldCgpO1xuICAgIH1cbiAgICBsZXQgbm9kZSA9IG5ldyBTcGluYWxOb2RlKG5hbWUsIF9lbGVtZW50LCB0aGlzKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIC8qKlxuICAgKiAgT2JzZXJ2ZXMgdGhlIHR5cGUgb2YgdGhlIGVsZW1lbnQgaW5zaWRlIHRoZSBub2RlIGFkZCBDbGFzc2lmeSBpdC5cbiAgICogIEl0IHB1dHMgaXQgaW4gdGhlIFVuY2xhc3NpZmllZCBsaXN0IE90aGVyd2lzZS5cbiAgICogSXQgYWRkcyB0aGUgbm9kZSB0byB0aGUgbWFwcGluZyBsaXN0IHdpdGggRXh0ZXJuYWxJZCBpZiB0aGUgT2JqZWN0IGlzIG9mIHR5cGUgQklNRWxlbWVudFxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGV9IF9ub2RlXG4gICAqIEBtZW1iZXJvZiBHcmFwaFxuICAgKi9cbiAgY2xhc3NpZnlOb2RlKF9ub2RlKSB7XG4gICAgVXRpbGl0aWVzLnByb21pc2VMb2FkKF9ub2RlLmVsZW1lbnQpLnRoZW4oZWxlbWVudCA9PiB7XG4gICAgICBpZiAodHlwZW9mIF9ub2RlLmdyYXBoID09PSBcInVuZGVmaW5lZFwiKSBfbm9kZS5ncmFwaC5zZXQodGhpcyk7XG4gICAgICB0aGlzLm5vZGVMaXN0LmxvYWQobm9kZUxpc3QgPT4ge1xuICAgICAgICBub2RlTGlzdC5wdXNoKF9ub2RlKTtcbiAgICAgIH0pO1xuICAgICAgbGV0IHR5cGUgPSBcIlVuY2xhc3NpZmllZFwiO1xuICAgICAgaWYgKHR5cGVvZiBlbGVtZW50LnR5cGUgIT0gXCJ1bmRlZmluZWRcIiAmJiBlbGVtZW50LnR5cGUuZ2V0KCkgIT1cbiAgICAgICAgXCJcIikge1xuICAgICAgICB0eXBlID0gZWxlbWVudC50eXBlLmdldCgpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMubm9kZUxpc3RCeUVsZW1lbnRUeXBlW3R5cGVdKSB7XG4gICAgICAgIHRoaXMubm9kZUxpc3RCeUVsZW1lbnRUeXBlW3R5cGVdLmxvYWQobm9kZUxpc3RPZlR5cGUgPT4ge1xuICAgICAgICAgIG5vZGVMaXN0T2ZUeXBlLnB1c2goX25vZGUpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBub2RlTGlzdE9mVHlwZSA9IG5ldyBMc3QoKTtcbiAgICAgICAgbm9kZUxpc3RPZlR5cGUucHVzaChfbm9kZSk7XG4gICAgICAgIHRoaXMubm9kZUxpc3RCeUVsZW1lbnRUeXBlLmFkZF9hdHRyKHtcbiAgICAgICAgICBbdHlwZV06IG5ldyBQdHIobm9kZUxpc3RPZlR5cGUpXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBCSU1FbGVtZW50KSB7XG4gICAgICAgIGxldCBfZGJpZCA9IGVsZW1lbnQuaWQuZ2V0KCk7XG4gICAgICAgIGlmICh0eXBlb2YgX2RiaWQgPT0gXCJudW1iZXJcIilcbiAgICAgICAgICBpZiAoX2RiaWQgIT0gMCkge1xuICAgICAgICAgICAgdGhpcy5fYWRkRXh0ZXJuYWxJZE5vZGVNYXBwaW5nRW50cnkoZWxlbWVudC5pZCwgX25vZGUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbGVtZW50LmlkLmJpbmQoXG4gICAgICAgICAgICAgIHRoaXMuX2FkZEV4dGVybmFsSWROb2RlTWFwcGluZ0VudHJ5LmJpbmQobnVsbCwgZWxlbWVudC5pZCxcbiAgICAgICAgICAgICAgICBfbm9kZSlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChlbGVtZW50IGluc3RhbmNlb2YgQWJzdHJhY3RFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuZ3VpZEFic3RyYWN0Tm9kZU1hcHBpbmcuYWRkX2F0dHIoe1xuICAgICAgICAgIFtlbGVtZW50LmlkLmdldCgpXTogX25vZGVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvLyBhZGROb2RlcyhfdmVydGljZXMpIHtcbiAgLy8gICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX3ZlcnRpY2VzLmxlbmd0aDsgaW5kZXgrKykge1xuICAvLyAgICAgdGhpcy5jbGFzc2lmeU5vZGUoX3ZlcnRpY2VzW2luZGV4XSlcbiAgLy8gICB9XG4gIC8vIH1cbiAgLyoqXG4gICAqICBJdCBjcmVhdGVzIHRoZSBub2RlIGNvcnJlc3BvbmRpbmcgdG8gdGhlIF9lbGVtZW50LFxuICAgKiB0aGVuIGl0IGNyZWF0ZXMgYSBzaW1wbGUgcmVsYXRpb24gb2YgY2xhc3MgU3BpbmFsUmVsYXRpb24gb2YgdHlwZTpfdHlwZS5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IF9yZWxhdGlvblR5cGVcbiAgICogQHBhcmFtIHtTcGluYWxOb2RlfSBfbm9kZVxuICAgKiBAcGFyYW0ge01vZGVsfSBfZWxlbWVudCAtIGFueSBzdWJDbGFzcyBvZiBNb2RlbFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtfaXNEaXJlY3RlZD1mYWxzZV1cbiAgICogQHJldHVybnMgYSBQcm9taXNlIG9mIHRoZSBjcmVhdGVkIHJlbGF0aW9uXG4gICAqIEBtZW1iZXJvZiBHcmFwaFxuICAgKi9cbiAgYXN5bmMgYWRkU2ltcGxlUmVsYXRpb25Bc3luYyhcbiAgICBfcmVsYXRpb25UeXBlLFxuICAgIF9ub2RlLFxuICAgIF9lbGVtZW50LFxuICAgIF9pc0RpcmVjdGVkID0gZmFsc2VcbiAgKSB7XG4gICAgaWYgKCF0aGlzLmlzUmVzZXJ2ZWQoX3JlbGF0aW9uVHlwZSkpIHtcbiAgICAgIGxldCBub2RlMiA9IGF3YWl0IHRoaXMuYWRkTm9kZUFzeW5jKF9lbGVtZW50KTtcbiAgICAgIGxldCByZWwgPSBuZXcgU3BpbmFsUmVsYXRpb24oXG4gICAgICAgIF9yZWxhdGlvblR5cGUsIFtfbm9kZV0sIFtub2RlMl0sXG4gICAgICAgIF9pc0RpcmVjdGVkXG4gICAgICApO1xuICAgICAgdGhpcy5hZGRSZWxhdGlvbihyZWwpO1xuICAgICAgcmV0dXJuIHJlbDtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIF9yZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tfcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqICBJdCBjcmVhdGVzIHRoZSBub2RlIGNvcnJlc3BvbmRpbmcgdG8gdGhlIF9lbGVtZW50LFxuICAgKiB0aGVuIGl0IGNyZWF0ZXMgYSBzaW1wbGUgcmVsYXRpb24gb2YgY2xhc3MgU3BpbmFsUmVsYXRpb24gb2YgdHlwZTpfdHlwZS5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGV9IG5vZGVcbiAgICogQHBhcmFtIHtNb2RlbH0gZWxlbWVudCAtIGFueSBzdWJDbGFzcyBvZiBNb2RlbFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0RpcmVjdGVkPWZhbHNlXVxuICAgKiBAcmV0dXJucyBhIFByb21pc2Ugb2YgdGhlIGNyZWF0ZWQgcmVsYXRpb25cbiAgICogQG1lbWJlcm9mIEdyYXBoXG4gICAqL1xuICBhZGRTaW1wbGVSZWxhdGlvbihyZWxhdGlvblR5cGUsIG5vZGUsIGVsZW1lbnQsIGlzRGlyZWN0ZWQgPSBmYWxzZSkge1xuICAgIGlmICghdGhpcy5pc1Jlc2VydmVkKF9yZWxhdGlvblR5cGUpKSB7XG4gICAgICBsZXQgbm9kZTIgPSB0aGlzLmFkZE5vZGUoZWxlbWVudCk7XG4gICAgICBsZXQgcmVsID0gbmV3IFNwaW5hbFJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgW25vZGVdLCBbbm9kZTJdLFxuICAgICAgICBpc0RpcmVjdGVkKTtcbiAgICAgIHRoaXMuYWRkUmVsYXRpb24ocmVsKTtcbiAgICAgIHJldHVybiByZWw7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICBfcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbX3JlbGF0aW9uVHlwZV1cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgYWRkU2ltcGxlUmVsYXRpb25CeUFwcChcbiAgICBhcHBOYW1lLFxuICAgIHJlbGF0aW9uVHlwZSxcbiAgICBub2RlLFxuICAgIGVsZW1lbnQsXG4gICAgaXNEaXJlY3RlZCA9IGZhbHNlXG4gICkge1xuICAgIGlmICh0aGlzLmhhc1Jlc2VydmF0aW9uQ3JlZGVudGlhbHMoX3JlbGF0aW9uVHlwZSwgYXBwTmFtZSkpIHtcbiAgICAgIGlmICh0aGlzLmNvbnRhaW5zQXBwKGFwcE5hbWUpKSB7XG4gICAgICAgIGxldCBub2RlMiA9IHRoaXMuYWRkTm9kZShlbGVtZW50KTtcbiAgICAgICAgbGV0IHJlbCA9IG5ldyBTcGluYWxSZWxhdGlvbihyZWxhdGlvblR5cGUsIFtub2RlXSwgW25vZGUyXSxcbiAgICAgICAgICBpc0RpcmVjdGVkKTtcbiAgICAgICAgdGhpcy5hZGRSZWxhdGlvbihyZWwsIGFwcE5hbWUpO1xuICAgICAgICByZXR1cm4gcmVsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihhcHBOYW1lICsgXCIgZG9lcyBub3QgZXhpc3RcIik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICBfcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbX3JlbGF0aW9uVHlwZV1cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgYWRkUmVsYXRpb24ocmVsYXRpb24sIGFwcE5hbWUpIHtcbiAgICBpZiAodGhpcy5oYXNSZXNlcnZhdGlvbkNyZWRlbnRpYWxzKHJlbGF0aW9uLnR5cGUuZ2V0KCksIGFwcE5hbWUpKSB7XG4gICAgICBpZiAocmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKSkge1xuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcmVsYXRpb24ubm9kZUxpc3QxLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgIGNvbnN0IG5vZGUgPSByZWxhdGlvbi5ub2RlTGlzdDFbaW5kZXhdO1xuICAgICAgICAgIG5vZGUuYWRkRGlyZWN0ZWRSZWxhdGlvblBhcmVudChyZWxhdGlvbiwgYXBwTmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHJlbGF0aW9uLm5vZGVMaXN0Mi5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICBjb25zdCBub2RlID0gcmVsYXRpb24ubm9kZUxpc3QyW2luZGV4XTtcbiAgICAgICAgICBub2RlLmFkZERpcmVjdGVkUmVsYXRpb25DaGlsZChyZWxhdGlvbiwgYXBwTmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCByZWxhdGlvbi5ub2RlTGlzdDEubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgY29uc3Qgbm9kZSA9IHJlbGF0aW9uLm5vZGVMaXN0MVtpbmRleF07XG4gICAgICAgICAgbm9kZS5hZGROb25EaXJlY3RlZFJlbGF0aW9uKHJlbGF0aW9uLCBhcHBOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcmVsYXRpb24ubm9kZUxpc3QyLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgIGNvbnN0IG5vZGUgPSByZWxhdGlvbi5ub2RlTGlzdDJbaW5kZXhdO1xuICAgICAgICAgIG5vZGUuYWRkTm9uRGlyZWN0ZWRSZWxhdGlvbihyZWxhdGlvbiwgYXBwTmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuX2NsYXNzaWZ5UmVsYXRpb24ocmVsYXRpb24sIGFwcE5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb24udHlwZS5nZXQoKSArXG4gICAgICAgIFwiIGlzIHJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uLnR5cGUuZ2V0KCldXG4gICAgICApO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbnN9IF9yZWxhdGlvbnNcbiAgICogQG1lbWJlcm9mIEdyYXBoXG4gICAqL1xuICBhZGRSZWxhdGlvbnMoX3JlbGF0aW9ucykge1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBfcmVsYXRpb25zLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgcmVsYXRpb24gPSBfcmVsYXRpb25zW2luZGV4XTtcbiAgICAgIHRoaXMuYWRkUmVsYXRpb24ocmVsYXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIF9jbGFzc2lmeVJlbGF0aW9uKHJlbGF0aW9uLCBhcHBOYW1lKSB7XG4gICAgdGhpcy5yZWxhdGlvbkxpc3QubG9hZChyZWxhdGlvbkxpc3QgPT4ge1xuICAgICAgcmVsYXRpb25MaXN0LnB1c2gocmVsYXRpb24pO1xuICAgIH0pO1xuICAgIGlmICh0aGlzLnJlbGF0aW9uTGlzdEJ5VHlwZVtyZWxhdGlvbi50eXBlLmdldCgpXSkge1xuICAgICAgdGhpcy5yZWxhdGlvbkxpc3RCeVR5cGVbcmVsYXRpb24udHlwZS5nZXQoKV0ubG9hZChyZWxhdGlvbkxpc3RPZlR5cGUgPT4ge1xuICAgICAgICByZWxhdGlvbkxpc3RPZlR5cGUucHVzaChyZWxhdGlvbik7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHJlbGF0aW9uTGlzdE9mVHlwZSA9IG5ldyBMc3QoKTtcbiAgICAgIHJlbGF0aW9uTGlzdE9mVHlwZS5wdXNoKHJlbGF0aW9uKTtcbiAgICAgIHRoaXMucmVsYXRpb25MaXN0QnlUeXBlLmFkZF9hdHRyKHtcbiAgICAgICAgW3JlbGF0aW9uLnR5cGUuZ2V0KCldOiBuZXcgUHRyKHJlbGF0aW9uTGlzdE9mVHlwZSlcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGFwcE5hbWUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGlmIChcbiAgICAgICAgdHlwZW9mIHRoaXMuYXBwc0xpc3RbYXBwTmFtZV1bcmVsYXRpb24udHlwZS5nZXQoKV0gPT09XG4gICAgICAgIFwidW5kZWZpbmVkXCJcbiAgICAgICkge1xuICAgICAgICB0aGlzLmFwcHNMaXN0W2FwcE5hbWVdLmFkZFJlbGF0aW9uKHJlbGF0aW9uKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbnRhaW5zQXBwKGFwcE5hbWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHRoaXMuYXBwc0xpc3RbYXBwTmFtZV0gIT09IFwidW5kZWZpbmVkXCI7XG4gIH1cblxuICBpc1Jlc2VydmVkKHJlbGF0aW9uVHlwZSkge1xuICAgIHJldHVybiB0eXBlb2YgdGhpcy5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uVHlwZV0gIT09IFwidW5kZWZpbmVkXCI7XG4gIH1cblxuICBoYXNSZXNlcnZhdGlvbkNyZWRlbnRpYWxzKHJlbGF0aW9uVHlwZSwgYXBwTmFtZSkge1xuICAgIHJldHVybiAoIXRoaXMuaXNSZXNlcnZlZChyZWxhdGlvblR5cGUpIHx8XG4gICAgICAodGhpcy5pc1Jlc2VydmVkKHJlbGF0aW9uVHlwZSkgJiZcbiAgICAgICAgdGhpcy5yZXNlcnZlZFJlbGF0aW9uc05hbWVzKHJlbGF0aW9uVHlwZSkgPT09IGFwcE5hbWUpXG4gICAgKTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbnN9IHJlbGF0aW9uc1xuICAgKiBAbWVtYmVyb2YgR3JhcGhcbiAgICovXG4gIF9jbGFzc2lmeVJlbGF0aW9ucyhfcmVsYXRpb25zKSB7XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IF9yZWxhdGlvbnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICB0aGlzLl9jbGFzc2lmeVJlbGF0aW9uKF9yZWxhdGlvbnNbaW5kZXhdKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7THN0fSBfbGlzdFxuICAgKiBAbWVtYmVyb2YgR3JhcGhcbiAgICovXG4gIF9hZGROb3RFeGlzdGluZ05vZGVzRnJvbUxpc3QoX2xpc3QpIHtcbiAgICB0aGlzLm5vZGVMaXN0LmxvYWQobm9kZUxpc3QgPT4ge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBfbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgbm9kZSA9IF9saXN0W2ldO1xuICAgICAgICBpZiAoIVV0aWxpdGllcy5jb250YWluc0xzdEJ5SWQobm9kZUxpc3QsIG5vZGUpKSB7XG4gICAgICAgICAgdGhpcy5jbGFzc2lmeU5vZGUobm9kZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbnN9IF9yZWxhdGlvblxuICAgKiBAbWVtYmVyb2YgR3JhcGhcbiAgICovXG4gIF9hZGROb3RFeGlzdGluZ05vZGVzRnJvbVJlbGF0aW9uKF9yZWxhdGlvbikge1xuICAgIHRoaXMuX2FkZE5vdEV4aXN0aW5nTm9kZXNGcm9tTGlzdChfcmVsYXRpb24ubm9kZUxpc3QxKTtcbiAgICB0aGlzLl9hZGROb3RFeGlzdGluZ05vZGVzRnJvbUxpc3QoX3JlbGF0aW9uLm5vZGVMaXN0Mik7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBfbmFtZVxuICAgKiBAcGFyYW0ge3N0cmluZ3N9IF91c2VkUmVsYXRpb25zXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZX0gX3N0YXJ0aW5nTm9kZVxuICAgKiBAcGFyYW0ge0dyYXBofSBbX3VzZWRHcmFwaD10aGlzXVxuICAgKiBAcmV0dXJucyBUaGUgY3JlYXRlZCBDb250ZXh0XG4gICAqIEBtZW1iZXJvZiBHcmFwaFxuICAgKi9cbiAgYWRkQ29udGV4dChfbmFtZSwgX3VzZWRSZWxhdGlvbnMsIF9zdGFydGluZ05vZGUsIF91c2VkR3JhcGggPSB0aGlzKSB7XG4gICAgbGV0IGNvbnRleHQgPSBuZXcgU3BpbmFsQ29udGV4dChcbiAgICAgIF9uYW1lLFxuICAgICAgX3VzZWRSZWxhdGlvbnMsXG4gICAgICBfc3RhcnRpbmdOb2RlLFxuICAgICAgX3VzZWRHcmFwaFxuICAgICk7XG4gICAgdGhpcy5jb250ZXh0TGlzdC5wdXNoKGNvbnRleHQpO1xuICAgIHJldHVybiBjb250ZXh0O1xuICB9XG5cbiAgZ2V0QXBwKG5hbWUsIHJlbGF0aW9uc1R5cGVzTHN0LCByZWxhdGVkR3JhcGggPSB0aGlzKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLmFwcHNMaXN0W25hbWVdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBsZXQgc3BpbmFsQXBwbGljYXRpb24gPSBuZXcgU3BpbmFsQXBwbGljYXRpb24oXG4gICAgICAgIG5hbWUsXG4gICAgICAgIHJlbGF0aW9uc1R5cGVzTHN0LFxuICAgICAgICByZWxhdGVkR3JhcGhcbiAgICAgICk7XG4gICAgICB0aGlzLmFwcHNMaXN0LmFkZF9hdHRyKHtcbiAgICAgICAgW25hbWVdOiBzcGluYWxBcHBsaWNhdGlvblxuICAgICAgfSk7XG4gICAgICByZXR1cm4gc3BpbmFsQXBwbGljYXRpb247XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmFwcHNMaXN0W25hbWVdXG4gICAgICAvLyBjb25zb2xlLmVycm9yKFxuICAgICAgLy8gICBuYW1lICtcbiAgICAgIC8vICAgXCIgYXMgd2VsbCBhcyBcIiArXG4gICAgICAvLyAgIHRoaXMuZ2V0QXBwc05hbWVzKCkgK1xuICAgICAgLy8gICBcIiBoYXZlIGJlZW4gYWxyZWFkeSB1c2VkLCBwbGVhc2UgY2hvb3NlIGFub3RoZXIgYXBwbGljYXRpb24gbmFtZVwiXG4gICAgICAvLyApO1xuICAgIH1cbiAgfVxuXG4gIGdldEFwcHNOYW1lcygpIHtcbiAgICB0aGlzLmFwcHNMaXN0Ll9hdHRyaWJ1dGVfbmFtZXM7XG4gIH1cblxuICByZXNlcnZlVW5pcXVlUmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSwgYXBwKSB7XG4gICAgaWYgKFxuICAgICAgdHlwZW9mIHRoaXMucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvblR5cGVdID09PSBcInVuZGVmaW5lZFwiICYmXG4gICAgICB0eXBlb2YgdGhpcy5yZWxhdGlvbkxpc3RCeVR5cGVbcmVsYXRpb25UeXBlXSA9PT0gXCJ1bmRlZmluZWRcIlxuICAgICkge1xuICAgICAgdGhpcy5yZXNlcnZlZFJlbGF0aW9uc05hbWVzLmFkZF9hdHRyKHtcbiAgICAgICAgW3JlbGF0aW9uVHlwZV06IGFwcC5uYW1lLmdldCgpXG4gICAgICB9KTtcbiAgICAgIGFwcC5hZGRSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICB0eXBlb2YgdGhpcy5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uVHlwZV0gIT09IFwidW5kZWZpbmVkXCJcbiAgICApIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgIHJlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGhhcyBub3QgYmVlbiBhZGRlZCB0byBhcHA6IFwiICtcbiAgICAgICAgYXBwLm5hbWUuZ2V0KCkgK1xuICAgICAgICBcIixDYXVzZSA6IGFscmVhZHkgUmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLnJlbGF0aW9uTGlzdEJ5VHlwZVtyZWxhdGlvblR5cGVdICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICByZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBoYXMgbm90IGJlZW4gYWRkZWQgdG8gYXBwOiBcIiArXG4gICAgICAgIGFwcC5uYW1lLmdldCgpICtcbiAgICAgICAgXCIsQ2F1c2UgOiBhbHJlYWR5IFVzZWQgYnkgb3RoZXIgQXBwc1wiXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBHcmFwaDtcbnNwaW5hbENvcmUucmVnaXN0ZXJfbW9kZWxzKFtHcmFwaF0pOyJdfQ==