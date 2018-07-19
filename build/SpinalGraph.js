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

var _SpinalApplication = require("./SpinalApplication");

var _SpinalApplication2 = _interopRequireDefault(_SpinalApplication);

var _SpinalContext = require("./SpinalContext");

var _SpinalContext2 = _interopRequireDefault(_SpinalContext);

var _Utilities = require("./Utilities");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const spinalCore = require("spinal-core-connectorjs");
const globalType = typeof window === "undefined" ? global : window;

/**
 * The core of the interactions between the BIMElements Nodes and other Nodes(Docs, Tickets, etc ..)
 * @class SpinalGraph
 * @extends {Model}
 */
class SpinalGraph extends globalType.Model {
  /**
   *Creates an instance of SpinalGraph.
   * @param {string} [_name=t]
   * @param {Ptr} [_startingNode=new Ptr(0)]
   * @memberof SpinalGraph
   */
  constructor(_name = "t", _startingNode = new Ptr(0), name = "SpinalGraph") {
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
        appsList: new Model(),
        appsListByType: new Model(),
        reservedRelationsNames: new Model()
      });
    }
  }
  /**
   *function
   *To put used functions as well as the SpinalGraph model in the global scope
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
   * @memberof SpinalGraph
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
   * @memberof SpinalGraph
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
   * @memberof SpinalGraph
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
   * @memberof SpinalGraph
   */
  setName(_name) {
    this.name.set(_name);
  }
  /**
   *
   *
   * @param {Ptr} _startingNode
   * @memberof SpinalGraph
   */
  setStartingNode(_startingNode) {
    this.startingNode.set(_startingNode);
  }
  /**
   *
   *
   * @param {number} _ElementId - the Element ExternalId
   * @param {SpinalNode} _node
   * @memberof SpinalGraph
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
   * @param {Model} _element - any subclass of Model
   * @returns Promise of the created Node
   * @memberof SpinalGraph
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
   * @param {Model} _element - any subclass of Model
   * @returns the created Node
   * @memberof SpinalGraph
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
   * @memberof SpinalGraph
   */
  classifyNode(_node) {
    _Utilities.Utilities.promiseLoad(_node.element).then(element => {
      if (typeof _node.relatedGraph === "undefined") _node.relatedGraph.set(this);
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
   * @param {Model} _element - any subclass of Model
   * @param {boolean} [_isDirected=false]
   * @returns a Promise of the created relation
   * @memberof SpinalGraph
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
   * @param {Model} element - any subclass of Model
   * @param {boolean} [isDirected=false]
   * @returns a Promise of the created relation
   * @memberof SpinalGraph
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
  /**
   *
   *
   * @param {string} appName
   * @param {string} relationType
   * @param {SpinalNode} node
   * @param {Model} element - any subclass of Model
   * @param {boolean} [isDirected=false]
   * @returns the created Relation, undefined otherwise
   * @memberof SpinalGraph
   */
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
  /**
   *
   *
   * @param {SpinalRelation} relation
   * @param {string} appName
   * @memberof SpinalGraph
   */
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
   * @param {SpinalRelation[]} _relations
   * @memberof SpinalGraph
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
   * @param {Spinalrelation} relation
   * @param {string} appName
   * @memberof SpinalGraph
   */
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
      if (this.containsApp(appName)) this.appsList[appName].load(app => {
        if (typeof app[relation.type.get()] === "undefined") {
          app.addRelation(relation);
        }
      });
    }
  }
  /**
   *checks if this graph contains contains a specific App
   *
   * @param {string} appName
   * @returns Boolean
   * @memberof SpinalGraph
   */
  containsApp(appName) {
    return typeof this.appsList[appName] !== "undefined";
  }
  /**
   *
   *
   * @param {string} relationType
   * @returns boolean
   * @memberof SpinalGraph
   */
  isReserved(relationType) {
    return typeof this.reservedRelationsNames[relationType] !== "undefined";
  }
  /**
   *  checks if the app has the right to use a reserved relation
   *
   * @param {string} relationType
   * @param {string} appName
   * @returns boolean
   * @memberof SpinalGraph
   */
  hasReservationCredentials(relationType, appName) {
    return !this.isReserved(relationType) || this.isReserved(relationType) && this.reservedRelationsNames(relationType) === appName;
  }
  /**
   *
   *
   * @param {SpinalRelations} relations
   * @memberof SpinalGraph
   */
  _classifyRelations(_relations) {
    for (let index = 0; index < _relations.length; index++) {
      this._classifyRelation(_relations[index]);
    }
  }
  /**
   *
   *
   * @param {SpinalNode[]} _list
   * @memberof SpinalGraph
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
   * @param {SpinalRelation[]} _relation
   * @memberof SpinalGraph
   */
  _addNotExistingNodesFromRelation(_relation) {
    this._addNotExistingNodesFromList(_relation.nodeList1);
    this._addNotExistingNodesFromList(_relation.nodeList2);
  }

  // async getAllContexts() {
  //   let res = []
  //   for (let index = 0; index < this.appsList._attribute_names.length; index++) {
  //     let key = this.appsList._attribute_names[index]
  //     if (key.includes("_C", key.length - 2)) {
  //       const context = this.appsList[key];
  //       res.push(await Utilities.promiseLoad(context))
  //     }

  //   }
  //   return res;
  // }
  /**
   *
   *
   * @param {string} appType
   * @returns all Apps of a specific type
   * @memberof SpinalGraph
   */
  async getAppsByType(appType) {
    if (typeof this.appsListByType[appType] !== "undefined") return await _Utilities.Utilities.promiseLoad(this.appsListByType[appType]);
  }

  /**
   *
   *
   * @param {string} name
   * @param {string[]} relationsTypesLst
   * @param {SpinalGraph} [relatedGraph=this]
   * @param {Ptr} startingNode
   * @returns A promise of the created Context
   * @memberof SpinalGraph
   */
  async getContext(name, relationsTypesLst, relatedGraph = this, startingNode) {
    if (typeof this.appsList[name] === "undefined") {
      let context = new _SpinalContext2.default(name, relationsTypesLst, relatedGraph, startingNode);
      this.appsList.add_attr({
        [name]: new Ptr(context)
      });
      if (typeof this.appsListByType.context === "undefined") {
        this.appsListByType.add_attr({
          context: new Ptr(new Lst([context]))
        });
      } else {
        let contextList = await _Utilities.Utilities.promiseLoad(this.appsListByType.context);
        contextList.push(context);
      }
      return context;
    } else {
      return await _Utilities.Utilities.promiseLoad(this.appsList[name]);
    }
  }
  /**
   *
   *
   * @param {string} name
   * @param {string[]} relationsTypesLst
   * @param {SpinalGraph} [relatedSpinalGraph=this]
   * @returns A promise of the created App
   * @memberof SpinalGraph
   */
  async getApp(name, relationsTypesLst, relatedSpinalGraph = this) {
    if (typeof this.appsList[name] === "undefined") {
      let spinalApplication = new _SpinalApplication2.default(name, relationsTypesLst, relatedSpinalGraph);
      this.appsList.add_attr({
        [name]: new Ptr(spinalApplication)
      });
      return spinalApplication;
    } else {
      return await _Utilities.Utilities.promiseLoad(this.appsList[name]);
      // console.error(
      //   name +
      //   " as well as " +
      //   this.getAppsNames() +
      //   " have been already used, please choose another application name"
      // );
    }
  }

  /**
   *
   *
   * @returns an array of apps names
   * @memberof SpinalGraph
   */
  getAppsNames() {
    return this.appsList._attribute_names;
  }
  /**
   *
   *
   * @param {string} relationType
   * @param {SpinalApplication} app
   * @returns boolean
   * @memberof SpinalGraph
   */
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

exports.default = SpinalGraph;

spinalCore.register_models([SpinalGraph]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TcGluYWxHcmFwaC5qcyJdLCJuYW1lcyI6WyJzcGluYWxDb3JlIiwicmVxdWlyZSIsImdsb2JhbFR5cGUiLCJ3aW5kb3ciLCJnbG9iYWwiLCJTcGluYWxHcmFwaCIsIk1vZGVsIiwiY29uc3RydWN0b3IiLCJfbmFtZSIsIl9zdGFydGluZ05vZGUiLCJQdHIiLCJuYW1lIiwiRmlsZVN5c3RlbSIsIl9zaWdfc2VydmVyIiwiYWRkX2F0dHIiLCJleHRlcm5hbElkTm9kZU1hcHBpbmciLCJndWlkQWJzdHJhY3ROb2RlTWFwcGluZyIsInN0YXJ0aW5nTm9kZSIsIm5vZGVMaXN0IiwiTHN0Iiwibm9kZUxpc3RCeUVsZW1lbnRUeXBlIiwicmVsYXRpb25MaXN0IiwicmVsYXRpb25MaXN0QnlUeXBlIiwiYXBwc0xpc3QiLCJhcHBzTGlzdEJ5VHlwZSIsInJlc2VydmVkUmVsYXRpb25zTmFtZXMiLCJpbml0Iiwic3BpbmFsIiwiY29udGV4dFN0dWRpbyIsImdyYXBoIiwiU3BpbmFsTm9kZSIsIlNwaW5hbFJlbGF0aW9uIiwiQWJzdHJhY3RFbGVtZW50IiwiQklNRWxlbWVudCIsIlV0aWxpdGllcyIsImdldE5vZGVCeWRiSWQiLCJfZGJJZCIsIl9leHRlcm5hbElkIiwiZ2V0RXh0ZXJuYWxJZCIsIkJJTUVsZW1lbnQxIiwiaW5pdEV4dGVybmFsSWQiLCJub2RlIiwiYWRkTm9kZUFzeW5jIiwidHlwZSIsImdldCIsImJpbmQiLCJfY2xhc3NpZnlCSU1FbGVtZW50Tm9kZSIsIl9ub2RlIiwiY2xhc3NpZnlOb2RlIiwiZ2V0RGJJZEJ5Tm9kZSIsImVsZW1lbnQiLCJwcm9taXNlTG9hZCIsImlkIiwic2V0TmFtZSIsInNldCIsInNldFN0YXJ0aW5nTm9kZSIsIl9hZGRFeHRlcm5hbElkTm9kZU1hcHBpbmdFbnRyeSIsIl9FbGVtZW50SWQiLCJfZGJpZCIsImV4dGVybmFsSWQiLCJ1bmJpbmQiLCJfZWxlbWVudCIsImluaXRFeHRlcm5hbElkQXN5bmMiLCJjb25zb2xlIiwibG9nIiwiYWRkTm9kZSIsInRoZW4iLCJyZWxhdGVkR3JhcGgiLCJsb2FkIiwicHVzaCIsIm5vZGVMaXN0T2ZUeXBlIiwiYWRkU2ltcGxlUmVsYXRpb25Bc3luYyIsIl9yZWxhdGlvblR5cGUiLCJfaXNEaXJlY3RlZCIsImlzUmVzZXJ2ZWQiLCJub2RlMiIsInJlbCIsImFkZFJlbGF0aW9uIiwiYWRkU2ltcGxlUmVsYXRpb24iLCJyZWxhdGlvblR5cGUiLCJpc0RpcmVjdGVkIiwiYWRkU2ltcGxlUmVsYXRpb25CeUFwcCIsImFwcE5hbWUiLCJoYXNSZXNlcnZhdGlvbkNyZWRlbnRpYWxzIiwiY29udGFpbnNBcHAiLCJlcnJvciIsInJlbGF0aW9uIiwiaW5kZXgiLCJub2RlTGlzdDEiLCJsZW5ndGgiLCJhZGREaXJlY3RlZFJlbGF0aW9uUGFyZW50Iiwibm9kZUxpc3QyIiwiYWRkRGlyZWN0ZWRSZWxhdGlvbkNoaWxkIiwiYWRkTm9uRGlyZWN0ZWRSZWxhdGlvbiIsIl9jbGFzc2lmeVJlbGF0aW9uIiwiYWRkUmVsYXRpb25zIiwiX3JlbGF0aW9ucyIsInJlbGF0aW9uTGlzdE9mVHlwZSIsImFwcCIsIl9jbGFzc2lmeVJlbGF0aW9ucyIsIl9hZGROb3RFeGlzdGluZ05vZGVzRnJvbUxpc3QiLCJfbGlzdCIsImkiLCJjb250YWluc0xzdEJ5SWQiLCJfYWRkTm90RXhpc3RpbmdOb2Rlc0Zyb21SZWxhdGlvbiIsIl9yZWxhdGlvbiIsImdldEFwcHNCeVR5cGUiLCJhcHBUeXBlIiwiZ2V0Q29udGV4dCIsInJlbGF0aW9uc1R5cGVzTHN0IiwiY29udGV4dCIsIlNwaW5hbENvbnRleHQiLCJjb250ZXh0TGlzdCIsImdldEFwcCIsInJlbGF0ZWRTcGluYWxHcmFwaCIsInNwaW5hbEFwcGxpY2F0aW9uIiwiU3BpbmFsQXBwbGljYXRpb24iLCJnZXRBcHBzTmFtZXMiLCJfYXR0cmlidXRlX25hbWVzIiwicmVzZXJ2ZVVuaXF1ZVJlbGF0aW9uVHlwZSIsImFkZFJlbGF0aW9uVHlwZSIsInJlZ2lzdGVyX21v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QU8sSUFBUDtBQUNELEtBVEQsTUFTTyxJQUNMLE9BQU8sS0FBS3RELHNCQUFMLENBQTRCc0QsWUFBNUIsQ0FBUCxLQUFxRCxXQURoRCxFQUVMO0FBQ0FoQixjQUFRc0IsS0FBUixDQUNFTixlQUNBLDhCQURBLEdBRUFtQixJQUFJdkYsSUFBSixDQUFTaUMsR0FBVCxFQUZBLEdBR0EsK0JBSEEsR0FJQSxLQUFLbkIsc0JBQUwsQ0FBNEJzRCxZQUE1QixDQUxGO0FBT0EsYUFBTyxLQUFQO0FBQ0QsS0FYTSxNQVdBLElBQUksT0FBTyxLQUFLekQsa0JBQUwsQ0FBd0J5RCxZQUF4QixDQUFQLEtBQ1QsV0FESyxFQUNRO0FBQ2JoQixjQUFRc0IsS0FBUixDQUNFTixlQUNBLDhCQURBLEdBRUFtQixJQUFJdkYsSUFBSixDQUFTaUMsR0FBVCxFQUZBLEdBR0EscUNBSkY7QUFNRDtBQUNGO0FBOW5Cd0M7O2tCQWlvQjVCdkMsVzs7QUFDZkwsV0FBV3lILGVBQVgsQ0FBMkIsQ0FBQ3BILFdBQUQsQ0FBM0IiLCJmaWxlIjoiU3BpbmFsR3JhcGguanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBzcGluYWxDb3JlID0gcmVxdWlyZShcInNwaW5hbC1jb3JlLWNvbm5lY3RvcmpzXCIpO1xuY29uc3QgZ2xvYmFsVHlwZSA9IHR5cGVvZiB3aW5kb3cgPT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB3aW5kb3c7XG5pbXBvcnQgU3BpbmFsTm9kZSBmcm9tIFwiLi9TcGluYWxOb2RlXCI7XG5pbXBvcnQgU3BpbmFsUmVsYXRpb24gZnJvbSBcIi4vU3BpbmFsUmVsYXRpb25cIjtcbmltcG9ydCBBYnN0cmFjdEVsZW1lbnQgZnJvbSBcIi4vQWJzdHJhY3RFbGVtZW50XCI7XG5pbXBvcnQgQklNRWxlbWVudCBmcm9tIFwiLi9CSU1FbGVtZW50XCI7XG5pbXBvcnQgU3BpbmFsQXBwbGljYXRpb24gZnJvbSBcIi4vU3BpbmFsQXBwbGljYXRpb25cIjtcbmltcG9ydCBTcGluYWxDb250ZXh0IGZyb20gXCIuL1NwaW5hbENvbnRleHRcIjtcblxuaW1wb3J0IHtcbiAgVXRpbGl0aWVzXG59IGZyb20gXCIuL1V0aWxpdGllc1wiO1xuLyoqXG4gKiBUaGUgY29yZSBvZiB0aGUgaW50ZXJhY3Rpb25zIGJldHdlZW4gdGhlIEJJTUVsZW1lbnRzIE5vZGVzIGFuZCBvdGhlciBOb2RlcyhEb2NzLCBUaWNrZXRzLCBldGMgLi4pXG4gKiBAY2xhc3MgU3BpbmFsR3JhcGhcbiAqIEBleHRlbmRzIHtNb2RlbH1cbiAqL1xuY2xhc3MgU3BpbmFsR3JhcGggZXh0ZW5kcyBnbG9iYWxUeXBlLk1vZGVsIHtcbiAgLyoqXG4gICAqQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBTcGluYWxHcmFwaC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IFtfbmFtZT10XVxuICAgKiBAcGFyYW0ge1B0cn0gW19zdGFydGluZ05vZGU9bmV3IFB0cigwKV1cbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBjb25zdHJ1Y3RvcihfbmFtZSA9IFwidFwiLCBfc3RhcnRpbmdOb2RlID0gbmV3IFB0cigwKSwgbmFtZSA9IFwiU3BpbmFsR3JhcGhcIikge1xuICAgIHN1cGVyKCk7XG4gICAgaWYgKEZpbGVTeXN0ZW0uX3NpZ19zZXJ2ZXIpIHtcbiAgICAgIHRoaXMuYWRkX2F0dHIoe1xuICAgICAgICBuYW1lOiBfbmFtZSxcbiAgICAgICAgZXh0ZXJuYWxJZE5vZGVNYXBwaW5nOiBuZXcgTW9kZWwoKSxcbiAgICAgICAgZ3VpZEFic3RyYWN0Tm9kZU1hcHBpbmc6IG5ldyBNb2RlbCgpLFxuICAgICAgICBzdGFydGluZ05vZGU6IF9zdGFydGluZ05vZGUsXG4gICAgICAgIG5vZGVMaXN0OiBuZXcgUHRyKG5ldyBMc3QoKSksXG4gICAgICAgIG5vZGVMaXN0QnlFbGVtZW50VHlwZTogbmV3IE1vZGVsKCksXG4gICAgICAgIHJlbGF0aW9uTGlzdDogbmV3IFB0cihuZXcgTHN0KCkpLFxuICAgICAgICByZWxhdGlvbkxpc3RCeVR5cGU6IG5ldyBNb2RlbCgpLFxuICAgICAgICBhcHBzTGlzdDogbmV3IE1vZGVsKCksXG4gICAgICAgIGFwcHNMaXN0QnlUeXBlOiBuZXcgTW9kZWwoKSxcbiAgICAgICAgcmVzZXJ2ZWRSZWxhdGlvbnNOYW1lczogbmV3IE1vZGVsKClcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpmdW5jdGlvblxuICAgKlRvIHB1dCB1c2VkIGZ1bmN0aW9ucyBhcyB3ZWxsIGFzIHRoZSBTcGluYWxHcmFwaCBtb2RlbCBpbiB0aGUgZ2xvYmFsIHNjb3BlXG4gICAqL1xuICBpbml0KCkge1xuICAgIGdsb2JhbFR5cGUuc3BpbmFsLmNvbnRleHRTdHVkaW8gPSB7fTtcbiAgICBnbG9iYWxUeXBlLnNwaW5hbC5jb250ZXh0U3R1ZGlvLmdyYXBoID0gdGhpcztcbiAgICBnbG9iYWxUeXBlLnNwaW5hbC5jb250ZXh0U3R1ZGlvLlNwaW5hbE5vZGUgPSBTcGluYWxOb2RlO1xuICAgIGdsb2JhbFR5cGUuc3BpbmFsLmNvbnRleHRTdHVkaW8uU3BpbmFsUmVsYXRpb24gPSBTcGluYWxSZWxhdGlvbjtcbiAgICBnbG9iYWxUeXBlLnNwaW5hbC5jb250ZXh0U3R1ZGlvLkFic3RyYWN0RWxlbWVudCA9IEFic3RyYWN0RWxlbWVudDtcbiAgICBnbG9iYWxUeXBlLnNwaW5hbC5jb250ZXh0U3R1ZGlvLkJJTUVsZW1lbnQgPSBCSU1FbGVtZW50O1xuICAgIGdsb2JhbFR5cGUuc3BpbmFsLmNvbnRleHRTdHVkaW8uVXRpbGl0aWVzID0gVXRpbGl0aWVzO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gX2RiSWRcbiAgICogQHJldHVybnMgUHJvbWlzZSBvZiB0aGUgY29ycmVzcG9uZGluZyBOb2RlIG9yIHRoZSBjcmVhdGVkIG9uZSBpZiBub3QgZXhpc3RpbmdcbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBhc3luYyBnZXROb2RlQnlkYklkKF9kYklkKSB7XG4gICAgbGV0IF9leHRlcm5hbElkID0gYXdhaXQgVXRpbGl0aWVzLmdldEV4dGVybmFsSWQoX2RiSWQpO1xuICAgIGlmICh0eXBlb2YgdGhpcy5leHRlcm5hbElkTm9kZU1hcHBpbmdbX2V4dGVybmFsSWRdICE9PSBcInVuZGVmaW5lZFwiKVxuICAgICAgcmV0dXJuIHRoaXMuZXh0ZXJuYWxJZE5vZGVNYXBwaW5nW19leHRlcm5hbElkXTtcbiAgICBlbHNlIHtcbiAgICAgIGxldCBCSU1FbGVtZW50MSA9IG5ldyBCSU1FbGVtZW50KF9kYklkKTtcbiAgICAgIEJJTUVsZW1lbnQxLmluaXRFeHRlcm5hbElkKCk7XG4gICAgICBsZXQgbm9kZSA9IGF3YWl0IHRoaXMuYWRkTm9kZUFzeW5jKEJJTUVsZW1lbnQxKTtcbiAgICAgIGlmIChCSU1FbGVtZW50MS50eXBlLmdldCgpID09PSBcIlwiKSB7XG4gICAgICAgIEJJTUVsZW1lbnQxLnR5cGUuYmluZCh0aGlzLl9jbGFzc2lmeUJJTUVsZW1lbnROb2RlLmJpbmQodGhpcywgbm9kZSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGV9IF9ub2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgYXN5bmMgX2NsYXNzaWZ5QklNRWxlbWVudE5vZGUoX25vZGUpIHtcbiAgICAvL1RPRE8gREVMRVRFIE9MRCBDTEFTU0lGSUNBVElPTlxuICAgIHRoaXMuY2xhc3NpZnlOb2RlKF9ub2RlKTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxOb2RlfSBfbm9kZVxuICAgKiBAcmV0dXJucyBQcm9taXNlIG9mIGRiSWQgW251bWJlcl1cbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBhc3luYyBnZXREYklkQnlOb2RlKF9ub2RlKSB7XG4gICAgbGV0IGVsZW1lbnQgPSBhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQoX25vZGUuZWxlbWVudCk7XG4gICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBCSU1FbGVtZW50KSB7XG4gICAgICByZXR1cm4gZWxlbWVudC5pZC5nZXQoKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBfbmFtZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIHNldE5hbWUoX25hbWUpIHtcbiAgICB0aGlzLm5hbWUuc2V0KF9uYW1lKTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtQdHJ9IF9zdGFydGluZ05vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBzZXRTdGFydGluZ05vZGUoX3N0YXJ0aW5nTm9kZSkge1xuICAgIHRoaXMuc3RhcnRpbmdOb2RlLnNldChfc3RhcnRpbmdOb2RlKTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IF9FbGVtZW50SWQgLSB0aGUgRWxlbWVudCBFeHRlcm5hbElkXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZX0gX25vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBhc3luYyBfYWRkRXh0ZXJuYWxJZE5vZGVNYXBwaW5nRW50cnkoX0VsZW1lbnRJZCwgX25vZGUpIHtcbiAgICBsZXQgX2RiaWQgPSBfRWxlbWVudElkLmdldCgpO1xuICAgIGlmICh0eXBlb2YgX2RiaWQgPT0gXCJudW1iZXJcIilcbiAgICAgIGlmIChfZGJpZCAhPSAwKSB7XG4gICAgICAgIGxldCBleHRlcm5hbElkID0gYXdhaXQgVXRpbGl0aWVzLmdldEV4dGVybmFsSWQoX2RiaWQpO1xuICAgICAgICBsZXQgZWxlbWVudCA9IGF3YWl0IFV0aWxpdGllcy5wcm9taXNlTG9hZChfbm9kZS5lbGVtZW50KTtcbiAgICAgICAgYXdhaXQgZWxlbWVudC5pbml0RXh0ZXJuYWxJZCgpO1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMuZXh0ZXJuYWxJZE5vZGVNYXBwaW5nW2V4dGVybmFsSWRdID09PSBcInVuZGVmaW5lZFwiKVxuICAgICAgICAgIHRoaXMuZXh0ZXJuYWxJZE5vZGVNYXBwaW5nLmFkZF9hdHRyKHtcbiAgICAgICAgICAgIFtleHRlcm5hbElkXTogX25vZGVcbiAgICAgICAgICB9KTtcbiAgICAgICAgX0VsZW1lbnRJZC51bmJpbmQoXG4gICAgICAgICAgdGhpcy5fYWRkRXh0ZXJuYWxJZE5vZGVNYXBwaW5nRW50cnkuYmluZCh0aGlzLCBfRWxlbWVudElkLFxuICAgICAgICAgICAgX25vZGUpXG4gICAgICAgICk7XG4gICAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7TW9kZWx9IF9lbGVtZW50IC0gYW55IHN1YmNsYXNzIG9mIE1vZGVsXG4gICAqIEByZXR1cm5zIFByb21pc2Ugb2YgdGhlIGNyZWF0ZWQgTm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIGFzeW5jIGFkZE5vZGVBc3luYyhfZWxlbWVudCkge1xuICAgIGxldCBuYW1lID0gXCJcIjtcbiAgICBpZiAoX2VsZW1lbnQgaW5zdGFuY2VvZiBCSU1FbGVtZW50KSB7XG4gICAgICBhd2FpdCBfZWxlbWVudC5pbml0RXh0ZXJuYWxJZEFzeW5jKCk7XG4gICAgICBpZiAoXG4gICAgICAgIHR5cGVvZiB0aGlzLmV4dGVybmFsSWROb2RlTWFwcGluZ1tfZWxlbWVudC5leHRlcm5hbElkLmdldCgpXSAhPT1cbiAgICAgICAgXCJ1bmRlZmluZWRcIlxuICAgICAgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQklNIE9CSkVDVCBOT0RFIEFMUkVBRFkgRVhJU1RTXCIpO1xuICAgICAgICByZXR1cm4gdGhpcy5leHRlcm5hbElkTm9kZU1hcHBpbmdbX2VsZW1lbnQuZXh0ZXJuYWxJZC5nZXQoKV07XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChfZWxlbWVudCBpbnN0YW5jZW9mIEFic3RyYWN0RWxlbWVudCkge1xuICAgICAgaWYgKFxuICAgICAgICB0eXBlb2YgdGhpcy5ndWlkQWJzdHJhY3ROb2RlTWFwcGluZ1tfZWxlbWVudC5pZC5nZXQoKV0gIT09XG4gICAgICAgIFwidW5kZWZpbmVkXCJcbiAgICAgICkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkFCU1RSQUNUIE9CSkVDVCBOT0RFIEFMUkVBRFkgRVhJU1RTXCIpO1xuICAgICAgICByZXR1cm4gdGhpcy5ndWlkQWJzdHJhY3ROb2RlTWFwcGluZ1tfZWxlbWVudC5pZC5nZXQoKV07XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0eXBlb2YgX2VsZW1lbnQubmFtZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgbmFtZSA9IF9lbGVtZW50Lm5hbWUuZ2V0KCk7XG4gICAgfVxuICAgIGxldCBub2RlID0gbmV3IFNwaW5hbE5vZGUobmFtZSwgX2VsZW1lbnQsIHRoaXMpO1xuICAgIHJldHVybiBub2RlO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge01vZGVsfSBfZWxlbWVudCAtIGFueSBzdWJjbGFzcyBvZiBNb2RlbFxuICAgKiBAcmV0dXJucyB0aGUgY3JlYXRlZCBOb2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgYWRkTm9kZShfZWxlbWVudCkge1xuICAgIGxldCBuYW1lID0gXCJcIjtcbiAgICBpZiAoX2VsZW1lbnQgaW5zdGFuY2VvZiBCSU1FbGVtZW50KSB7XG4gICAgICBfZWxlbWVudC5pbml0RXh0ZXJuYWxJZCgpO1xuICAgICAgaWYgKFxuICAgICAgICB0eXBlb2YgdGhpcy5leHRlcm5hbElkTm9kZU1hcHBpbmdbX2VsZW1lbnQuZXh0ZXJuYWxJZC5nZXQoKV0gIT09XG4gICAgICAgIFwidW5kZWZpbmVkXCJcbiAgICAgICkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkJJTSBPQkpFQ1QgTk9ERSBBTFJFQURZIEVYSVNUU1wiKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXh0ZXJuYWxJZE5vZGVNYXBwaW5nW19lbGVtZW50LmV4dGVybmFsSWQuZ2V0KCldO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoX2VsZW1lbnQgaW5zdGFuY2VvZiBBYnN0cmFjdEVsZW1lbnQpIHtcbiAgICAgIGlmIChcbiAgICAgICAgdHlwZW9mIHRoaXMuZ3VpZEFic3RyYWN0Tm9kZU1hcHBpbmdbX2VsZW1lbnQuaWQuZ2V0KCldICE9PVxuICAgICAgICBcInVuZGVmaW5lZFwiXG4gICAgICApIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJBQlNUUkFDVCBPQkpFQ1QgTk9ERSBBTFJFQURZIEVYSVNUU1wiKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3VpZEFic3RyYWN0Tm9kZU1hcHBpbmdbX2VsZW1lbnQuaWQuZ2V0KCldO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodHlwZW9mIF9lbGVtZW50Lm5hbWUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIG5hbWUgPSBfZWxlbWVudC5uYW1lLmdldCgpO1xuICAgIH1cbiAgICBsZXQgbm9kZSA9IG5ldyBTcGluYWxOb2RlKG5hbWUsIF9lbGVtZW50LCB0aGlzKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIC8qKlxuICAgKiAgT2JzZXJ2ZXMgdGhlIHR5cGUgb2YgdGhlIGVsZW1lbnQgaW5zaWRlIHRoZSBub2RlIGFkZCBDbGFzc2lmeSBpdC5cbiAgICogIEl0IHB1dHMgaXQgaW4gdGhlIFVuY2xhc3NpZmllZCBsaXN0IE90aGVyd2lzZS5cbiAgICogSXQgYWRkcyB0aGUgbm9kZSB0byB0aGUgbWFwcGluZyBsaXN0IHdpdGggRXh0ZXJuYWxJZCBpZiB0aGUgT2JqZWN0IGlzIG9mIHR5cGUgQklNRWxlbWVudFxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGV9IF9ub2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgY2xhc3NpZnlOb2RlKF9ub2RlKSB7XG4gICAgVXRpbGl0aWVzLnByb21pc2VMb2FkKF9ub2RlLmVsZW1lbnQpLnRoZW4oZWxlbWVudCA9PiB7XG4gICAgICBpZiAodHlwZW9mIF9ub2RlLnJlbGF0ZWRHcmFwaCA9PT0gXCJ1bmRlZmluZWRcIikgX25vZGUucmVsYXRlZEdyYXBoXG4gICAgICAgIC5zZXQoXG4gICAgICAgICAgdGhpcyk7XG4gICAgICB0aGlzLm5vZGVMaXN0LmxvYWQobm9kZUxpc3QgPT4ge1xuICAgICAgICBub2RlTGlzdC5wdXNoKF9ub2RlKTtcbiAgICAgIH0pO1xuICAgICAgbGV0IHR5cGUgPSBcIlVuY2xhc3NpZmllZFwiO1xuICAgICAgaWYgKHR5cGVvZiBlbGVtZW50LnR5cGUgIT0gXCJ1bmRlZmluZWRcIiAmJiBlbGVtZW50LnR5cGUuZ2V0KCkgIT1cbiAgICAgICAgXCJcIikge1xuICAgICAgICB0eXBlID0gZWxlbWVudC50eXBlLmdldCgpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMubm9kZUxpc3RCeUVsZW1lbnRUeXBlW3R5cGVdKSB7XG4gICAgICAgIHRoaXMubm9kZUxpc3RCeUVsZW1lbnRUeXBlW3R5cGVdLmxvYWQobm9kZUxpc3RPZlR5cGUgPT4ge1xuICAgICAgICAgIG5vZGVMaXN0T2ZUeXBlLnB1c2goX25vZGUpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBub2RlTGlzdE9mVHlwZSA9IG5ldyBMc3QoKTtcbiAgICAgICAgbm9kZUxpc3RPZlR5cGUucHVzaChfbm9kZSk7XG4gICAgICAgIHRoaXMubm9kZUxpc3RCeUVsZW1lbnRUeXBlLmFkZF9hdHRyKHtcbiAgICAgICAgICBbdHlwZV06IG5ldyBQdHIobm9kZUxpc3RPZlR5cGUpXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBCSU1FbGVtZW50KSB7XG4gICAgICAgIGxldCBfZGJpZCA9IGVsZW1lbnQuaWQuZ2V0KCk7XG4gICAgICAgIGlmICh0eXBlb2YgX2RiaWQgPT0gXCJudW1iZXJcIilcbiAgICAgICAgICBpZiAoX2RiaWQgIT0gMCkge1xuICAgICAgICAgICAgdGhpcy5fYWRkRXh0ZXJuYWxJZE5vZGVNYXBwaW5nRW50cnkoZWxlbWVudC5pZCwgX25vZGUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbGVtZW50LmlkLmJpbmQoXG4gICAgICAgICAgICAgIHRoaXMuX2FkZEV4dGVybmFsSWROb2RlTWFwcGluZ0VudHJ5LmJpbmQobnVsbCwgZWxlbWVudC5pZCxcbiAgICAgICAgICAgICAgICBfbm9kZSlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChlbGVtZW50IGluc3RhbmNlb2YgQWJzdHJhY3RFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuZ3VpZEFic3RyYWN0Tm9kZU1hcHBpbmcuYWRkX2F0dHIoe1xuICAgICAgICAgIFtlbGVtZW50LmlkLmdldCgpXTogX25vZGVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvLyBhZGROb2RlcyhfdmVydGljZXMpIHtcbiAgLy8gICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX3ZlcnRpY2VzLmxlbmd0aDsgaW5kZXgrKykge1xuICAvLyAgICAgdGhpcy5jbGFzc2lmeU5vZGUoX3ZlcnRpY2VzW2luZGV4XSlcbiAgLy8gICB9XG4gIC8vIH1cbiAgLyoqXG4gICAqICBJdCBjcmVhdGVzIHRoZSBub2RlIGNvcnJlc3BvbmRpbmcgdG8gdGhlIF9lbGVtZW50LFxuICAgKiB0aGVuIGl0IGNyZWF0ZXMgYSBzaW1wbGUgcmVsYXRpb24gb2YgY2xhc3MgU3BpbmFsUmVsYXRpb24gb2YgdHlwZTpfdHlwZS5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IF9yZWxhdGlvblR5cGVcbiAgICogQHBhcmFtIHtTcGluYWxOb2RlfSBfbm9kZVxuICAgKiBAcGFyYW0ge01vZGVsfSBfZWxlbWVudCAtIGFueSBzdWJjbGFzcyBvZiBNb2RlbFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtfaXNEaXJlY3RlZD1mYWxzZV1cbiAgICogQHJldHVybnMgYSBQcm9taXNlIG9mIHRoZSBjcmVhdGVkIHJlbGF0aW9uXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgYXN5bmMgYWRkU2ltcGxlUmVsYXRpb25Bc3luYyhcbiAgICBfcmVsYXRpb25UeXBlLFxuICAgIF9ub2RlLFxuICAgIF9lbGVtZW50LFxuICAgIF9pc0RpcmVjdGVkID0gZmFsc2VcbiAgKSB7XG4gICAgaWYgKCF0aGlzLmlzUmVzZXJ2ZWQoX3JlbGF0aW9uVHlwZSkpIHtcbiAgICAgIGxldCBub2RlMiA9IGF3YWl0IHRoaXMuYWRkTm9kZUFzeW5jKF9lbGVtZW50KTtcbiAgICAgIGxldCByZWwgPSBuZXcgU3BpbmFsUmVsYXRpb24oXG4gICAgICAgIF9yZWxhdGlvblR5cGUsIFtfbm9kZV0sIFtub2RlMl0sXG4gICAgICAgIF9pc0RpcmVjdGVkXG4gICAgICApO1xuICAgICAgdGhpcy5hZGRSZWxhdGlvbihyZWwpO1xuICAgICAgcmV0dXJuIHJlbDtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIF9yZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tfcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqICBJdCBjcmVhdGVzIHRoZSBub2RlIGNvcnJlc3BvbmRpbmcgdG8gdGhlIF9lbGVtZW50LFxuICAgKiB0aGVuIGl0IGNyZWF0ZXMgYSBzaW1wbGUgcmVsYXRpb24gb2YgY2xhc3MgU3BpbmFsUmVsYXRpb24gb2YgdHlwZTpfdHlwZS5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGV9IG5vZGVcbiAgICogQHBhcmFtIHtNb2RlbH0gZWxlbWVudCAtIGFueSBzdWJjbGFzcyBvZiBNb2RlbFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0RpcmVjdGVkPWZhbHNlXVxuICAgKiBAcmV0dXJucyBhIFByb21pc2Ugb2YgdGhlIGNyZWF0ZWQgcmVsYXRpb25cbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBhZGRTaW1wbGVSZWxhdGlvbihyZWxhdGlvblR5cGUsIG5vZGUsIGVsZW1lbnQsIGlzRGlyZWN0ZWQgPSBmYWxzZSkge1xuICAgIGlmICghdGhpcy5pc1Jlc2VydmVkKF9yZWxhdGlvblR5cGUpKSB7XG4gICAgICBsZXQgbm9kZTIgPSB0aGlzLmFkZE5vZGUoZWxlbWVudCk7XG4gICAgICBsZXQgcmVsID0gbmV3IFNwaW5hbFJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgW25vZGVdLCBbbm9kZTJdLFxuICAgICAgICBpc0RpcmVjdGVkKTtcbiAgICAgIHRoaXMuYWRkUmVsYXRpb24ocmVsKTtcbiAgICAgIHJldHVybiByZWw7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICBfcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbX3JlbGF0aW9uVHlwZV1cbiAgICAgICk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZX0gbm9kZVxuICAgKiBAcGFyYW0ge01vZGVsfSBlbGVtZW50IC0gYW55IHN1YmNsYXNzIG9mIE1vZGVsXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGlyZWN0ZWQ9ZmFsc2VdXG4gICAqIEByZXR1cm5zIHRoZSBjcmVhdGVkIFJlbGF0aW9uLCB1bmRlZmluZWQgb3RoZXJ3aXNlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgYWRkU2ltcGxlUmVsYXRpb25CeUFwcChcbiAgICBhcHBOYW1lLFxuICAgIHJlbGF0aW9uVHlwZSxcbiAgICBub2RlLFxuICAgIGVsZW1lbnQsXG4gICAgaXNEaXJlY3RlZCA9IGZhbHNlXG4gICkge1xuICAgIGlmICh0aGlzLmhhc1Jlc2VydmF0aW9uQ3JlZGVudGlhbHMoX3JlbGF0aW9uVHlwZSwgYXBwTmFtZSkpIHtcbiAgICAgIGlmICh0aGlzLmNvbnRhaW5zQXBwKGFwcE5hbWUpKSB7XG4gICAgICAgIGxldCBub2RlMiA9IHRoaXMuYWRkTm9kZShlbGVtZW50KTtcbiAgICAgICAgbGV0IHJlbCA9IG5ldyBTcGluYWxSZWxhdGlvbihyZWxhdGlvblR5cGUsIFtub2RlXSwgW25vZGUyXSxcbiAgICAgICAgICBpc0RpcmVjdGVkKTtcbiAgICAgICAgdGhpcy5hZGRSZWxhdGlvbihyZWwsIGFwcE5hbWUpO1xuICAgICAgICByZXR1cm4gcmVsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihhcHBOYW1lICsgXCIgZG9lcyBub3QgZXhpc3RcIik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICBfcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbX3JlbGF0aW9uVHlwZV1cbiAgICAgICk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9ufSByZWxhdGlvblxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIGFkZFJlbGF0aW9uKHJlbGF0aW9uLCBhcHBOYW1lKSB7XG4gICAgaWYgKHRoaXMuaGFzUmVzZXJ2YXRpb25DcmVkZW50aWFscyhyZWxhdGlvbi50eXBlLmdldCgpLCBhcHBOYW1lKSkge1xuICAgICAgaWYgKHJlbGF0aW9uLmlzRGlyZWN0ZWQuZ2V0KCkpIHtcbiAgICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHJlbGF0aW9uLm5vZGVMaXN0MS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICBjb25zdCBub2RlID0gcmVsYXRpb24ubm9kZUxpc3QxW2luZGV4XTtcbiAgICAgICAgICBub2RlLmFkZERpcmVjdGVkUmVsYXRpb25QYXJlbnQocmVsYXRpb24sIGFwcE5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCByZWxhdGlvbi5ub2RlTGlzdDIubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgY29uc3Qgbm9kZSA9IHJlbGF0aW9uLm5vZGVMaXN0MltpbmRleF07XG4gICAgICAgICAgbm9kZS5hZGREaXJlY3RlZFJlbGF0aW9uQ2hpbGQocmVsYXRpb24sIGFwcE5hbWUpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcmVsYXRpb24ubm9kZUxpc3QxLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgIGNvbnN0IG5vZGUgPSByZWxhdGlvbi5ub2RlTGlzdDFbaW5kZXhdO1xuICAgICAgICAgIG5vZGUuYWRkTm9uRGlyZWN0ZWRSZWxhdGlvbihyZWxhdGlvbiwgYXBwTmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHJlbGF0aW9uLm5vZGVMaXN0Mi5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICBjb25zdCBub2RlID0gcmVsYXRpb24ubm9kZUxpc3QyW2luZGV4XTtcbiAgICAgICAgICBub2RlLmFkZE5vbkRpcmVjdGVkUmVsYXRpb24ocmVsYXRpb24sIGFwcE5hbWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLl9jbGFzc2lmeVJlbGF0aW9uKHJlbGF0aW9uLCBhcHBOYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIHJlbGF0aW9uLnR5cGUuZ2V0KCkgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvbi50eXBlLmdldCgpXVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb25bXX0gX3JlbGF0aW9uc1xuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIGFkZFJlbGF0aW9ucyhfcmVsYXRpb25zKSB7XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IF9yZWxhdGlvbnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCByZWxhdGlvbiA9IF9yZWxhdGlvbnNbaW5kZXhdO1xuICAgICAgdGhpcy5hZGRSZWxhdGlvbihyZWxhdGlvbik7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbHJlbGF0aW9ufSByZWxhdGlvblxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIF9jbGFzc2lmeVJlbGF0aW9uKHJlbGF0aW9uLCBhcHBOYW1lKSB7XG4gICAgdGhpcy5yZWxhdGlvbkxpc3QubG9hZChyZWxhdGlvbkxpc3QgPT4ge1xuICAgICAgcmVsYXRpb25MaXN0LnB1c2gocmVsYXRpb24pO1xuICAgIH0pO1xuICAgIGlmICh0aGlzLnJlbGF0aW9uTGlzdEJ5VHlwZVtyZWxhdGlvbi50eXBlLmdldCgpXSkge1xuICAgICAgdGhpcy5yZWxhdGlvbkxpc3RCeVR5cGVbcmVsYXRpb24udHlwZS5nZXQoKV0ubG9hZChyZWxhdGlvbkxpc3RPZlR5cGUgPT4ge1xuICAgICAgICByZWxhdGlvbkxpc3RPZlR5cGUucHVzaChyZWxhdGlvbik7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHJlbGF0aW9uTGlzdE9mVHlwZSA9IG5ldyBMc3QoKTtcbiAgICAgIHJlbGF0aW9uTGlzdE9mVHlwZS5wdXNoKHJlbGF0aW9uKTtcbiAgICAgIHRoaXMucmVsYXRpb25MaXN0QnlUeXBlLmFkZF9hdHRyKHtcbiAgICAgICAgW3JlbGF0aW9uLnR5cGUuZ2V0KCldOiBuZXcgUHRyKHJlbGF0aW9uTGlzdE9mVHlwZSlcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGFwcE5hbWUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGlmICh0aGlzLmNvbnRhaW5zQXBwKGFwcE5hbWUpKVxuICAgICAgICB0aGlzLmFwcHNMaXN0W2FwcE5hbWVdLmxvYWQoYXBwID0+IHtcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICB0eXBlb2YgYXBwW3JlbGF0aW9uLnR5cGUuZ2V0KCldID09PVxuICAgICAgICAgICAgXCJ1bmRlZmluZWRcIlxuICAgICAgICAgICkge1xuICAgICAgICAgICAgYXBwLmFkZFJlbGF0aW9uKHJlbGF0aW9uKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqY2hlY2tzIGlmIHRoaXMgZ3JhcGggY29udGFpbnMgY29udGFpbnMgYSBzcGVjaWZpYyBBcHBcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFwcE5hbWVcbiAgICogQHJldHVybnMgQm9vbGVhblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIGNvbnRhaW5zQXBwKGFwcE5hbWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHRoaXMuYXBwc0xpc3RbYXBwTmFtZV0gIT09IFwidW5kZWZpbmVkXCI7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgYm9vbGVhblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIGlzUmVzZXJ2ZWQocmVsYXRpb25UeXBlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB0aGlzLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb25UeXBlXSAhPT0gXCJ1bmRlZmluZWRcIjtcbiAgfVxuICAvKipcbiAgICogIGNoZWNrcyBpZiB0aGUgYXBwIGhhcyB0aGUgcmlnaHQgdG8gdXNlIGEgcmVzZXJ2ZWQgcmVsYXRpb25cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgaGFzUmVzZXJ2YXRpb25DcmVkZW50aWFscyhyZWxhdGlvblR5cGUsIGFwcE5hbWUpIHtcbiAgICByZXR1cm4gKCF0aGlzLmlzUmVzZXJ2ZWQocmVsYXRpb25UeXBlKSB8fFxuICAgICAgKHRoaXMuaXNSZXNlcnZlZChyZWxhdGlvblR5cGUpICYmXG4gICAgICAgIHRoaXMucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lcyhyZWxhdGlvblR5cGUpID09PSBhcHBOYW1lKVxuICAgICk7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb25zfSByZWxhdGlvbnNcbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBfY2xhc3NpZnlSZWxhdGlvbnMoX3JlbGF0aW9ucykge1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBfcmVsYXRpb25zLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgdGhpcy5fY2xhc3NpZnlSZWxhdGlvbihfcmVsYXRpb25zW2luZGV4XSk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGVbXX0gX2xpc3RcbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBfYWRkTm90RXhpc3RpbmdOb2Rlc0Zyb21MaXN0KF9saXN0KSB7XG4gICAgdGhpcy5ub2RlTGlzdC5sb2FkKG5vZGVMaXN0ID0+IHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgX2xpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGV0IG5vZGUgPSBfbGlzdFtpXTtcbiAgICAgICAgaWYgKCFVdGlsaXRpZXMuY29udGFpbnNMc3RCeUlkKG5vZGVMaXN0LCBub2RlKSkge1xuICAgICAgICAgIHRoaXMuY2xhc3NpZnlOb2RlKG5vZGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb25bXX0gX3JlbGF0aW9uXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgX2FkZE5vdEV4aXN0aW5nTm9kZXNGcm9tUmVsYXRpb24oX3JlbGF0aW9uKSB7XG4gICAgdGhpcy5fYWRkTm90RXhpc3RpbmdOb2Rlc0Zyb21MaXN0KF9yZWxhdGlvbi5ub2RlTGlzdDEpO1xuICAgIHRoaXMuX2FkZE5vdEV4aXN0aW5nTm9kZXNGcm9tTGlzdChfcmVsYXRpb24ubm9kZUxpc3QyKTtcbiAgfVxuXG5cbiAgLy8gYXN5bmMgZ2V0QWxsQ29udGV4dHMoKSB7XG4gIC8vICAgbGV0IHJlcyA9IFtdXG4gIC8vICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMuYXBwc0xpc3QuX2F0dHJpYnV0ZV9uYW1lcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgLy8gICAgIGxldCBrZXkgPSB0aGlzLmFwcHNMaXN0Ll9hdHRyaWJ1dGVfbmFtZXNbaW5kZXhdXG4gIC8vICAgICBpZiAoa2V5LmluY2x1ZGVzKFwiX0NcIiwga2V5Lmxlbmd0aCAtIDIpKSB7XG4gIC8vICAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzLmFwcHNMaXN0W2tleV07XG4gIC8vICAgICAgIHJlcy5wdXNoKGF3YWl0IFV0aWxpdGllcy5wcm9taXNlTG9hZChjb250ZXh0KSlcbiAgLy8gICAgIH1cblxuICAvLyAgIH1cbiAgLy8gICByZXR1cm4gcmVzO1xuICAvLyB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwVHlwZVxuICAgKiBAcmV0dXJucyBhbGwgQXBwcyBvZiBhIHNwZWNpZmljIHR5cGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBhc3luYyBnZXRBcHBzQnlUeXBlKGFwcFR5cGUpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMuYXBwc0xpc3RCeVR5cGVbYXBwVHlwZV0gIT09IFwidW5kZWZpbmVkXCIpXG4gICAgICByZXR1cm4gYXdhaXQgVXRpbGl0aWVzLnByb21pc2VMb2FkKHRoaXMuYXBwc0xpc3RCeVR5cGVbYXBwVHlwZV0pXG4gIH1cblxuXG5cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nW119IHJlbGF0aW9uc1R5cGVzTHN0XG4gICAqIEBwYXJhbSB7U3BpbmFsR3JhcGh9IFtyZWxhdGVkR3JhcGg9dGhpc11cbiAgICogQHBhcmFtIHtQdHJ9IHN0YXJ0aW5nTm9kZVxuICAgKiBAcmV0dXJucyBBIHByb21pc2Ugb2YgdGhlIGNyZWF0ZWQgQ29udGV4dFxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIGFzeW5jIGdldENvbnRleHQobmFtZSwgcmVsYXRpb25zVHlwZXNMc3QsIHJlbGF0ZWRHcmFwaCA9IHRoaXMsXG4gICAgc3RhcnRpbmdOb2RlLCApIHtcbiAgICBpZiAodHlwZW9mIHRoaXMuYXBwc0xpc3RbbmFtZV0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGxldCBjb250ZXh0ID0gbmV3IFNwaW5hbENvbnRleHQoXG4gICAgICAgIG5hbWUsXG4gICAgICAgIHJlbGF0aW9uc1R5cGVzTHN0LFxuICAgICAgICByZWxhdGVkR3JhcGgsXG4gICAgICAgIHN0YXJ0aW5nTm9kZVxuICAgICAgKTtcbiAgICAgIHRoaXMuYXBwc0xpc3QuYWRkX2F0dHIoe1xuICAgICAgICBbbmFtZV06IG5ldyBQdHIoY29udGV4dClcbiAgICAgIH0pO1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLmFwcHNMaXN0QnlUeXBlLmNvbnRleHQgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgdGhpcy5hcHBzTGlzdEJ5VHlwZS5hZGRfYXR0cih7XG4gICAgICAgICAgY29udGV4dDogbmV3IFB0cihuZXcgTHN0KFtjb250ZXh0XSkpXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IGNvbnRleHRMaXN0ID0gYXdhaXQgVXRpbGl0aWVzLnByb21pc2VMb2FkKHRoaXMuYXBwc0xpc3RCeVR5cGUuY29udGV4dClcbiAgICAgICAgY29udGV4dExpc3QucHVzaChjb250ZXh0KVxuICAgICAgfVxuICAgICAgcmV0dXJuIGNvbnRleHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQodGhpcy5hcHBzTGlzdFtuYW1lXSlcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nW119IHJlbGF0aW9uc1R5cGVzTHN0XG4gICAqIEBwYXJhbSB7U3BpbmFsR3JhcGh9IFtyZWxhdGVkU3BpbmFsR3JhcGg9dGhpc11cbiAgICogQHJldHVybnMgQSBwcm9taXNlIG9mIHRoZSBjcmVhdGVkIEFwcFxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIGFzeW5jIGdldEFwcChuYW1lLCByZWxhdGlvbnNUeXBlc0xzdCwgcmVsYXRlZFNwaW5hbEdyYXBoID0gdGhpcykge1xuICAgIGlmICh0eXBlb2YgdGhpcy5hcHBzTGlzdFtuYW1lXSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgbGV0IHNwaW5hbEFwcGxpY2F0aW9uID0gbmV3IFNwaW5hbEFwcGxpY2F0aW9uKFxuICAgICAgICBuYW1lLFxuICAgICAgICByZWxhdGlvbnNUeXBlc0xzdCxcbiAgICAgICAgcmVsYXRlZFNwaW5hbEdyYXBoXG4gICAgICApO1xuICAgICAgdGhpcy5hcHBzTGlzdC5hZGRfYXR0cih7XG4gICAgICAgIFtuYW1lXTogbmV3IFB0cihzcGluYWxBcHBsaWNhdGlvbilcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHNwaW5hbEFwcGxpY2F0aW9uO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYXdhaXQgVXRpbGl0aWVzLnByb21pc2VMb2FkKHRoaXMuYXBwc0xpc3RbbmFtZV0pXG4gICAgICAvLyBjb25zb2xlLmVycm9yKFxuICAgICAgLy8gICBuYW1lICtcbiAgICAgIC8vICAgXCIgYXMgd2VsbCBhcyBcIiArXG4gICAgICAvLyAgIHRoaXMuZ2V0QXBwc05hbWVzKCkgK1xuICAgICAgLy8gICBcIiBoYXZlIGJlZW4gYWxyZWFkeSB1c2VkLCBwbGVhc2UgY2hvb3NlIGFub3RoZXIgYXBwbGljYXRpb24gbmFtZVwiXG4gICAgICAvLyApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyBhbiBhcnJheSBvZiBhcHBzIG5hbWVzXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgZ2V0QXBwc05hbWVzKCkge1xuICAgIHJldHVybiB0aGlzLmFwcHNMaXN0Ll9hdHRyaWJ1dGVfbmFtZXM7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHBhcmFtIHtTcGluYWxBcHBsaWNhdGlvbn0gYXBwXG4gICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICByZXNlcnZlVW5pcXVlUmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSwgYXBwKSB7XG4gICAgaWYgKFxuICAgICAgdHlwZW9mIHRoaXMucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvblR5cGVdID09PSBcInVuZGVmaW5lZFwiICYmXG4gICAgICB0eXBlb2YgdGhpcy5yZWxhdGlvbkxpc3RCeVR5cGVbcmVsYXRpb25UeXBlXSA9PT0gXCJ1bmRlZmluZWRcIlxuICAgICkge1xuICAgICAgdGhpcy5yZXNlcnZlZFJlbGF0aW9uc05hbWVzLmFkZF9hdHRyKHtcbiAgICAgICAgW3JlbGF0aW9uVHlwZV06IGFwcC5uYW1lLmdldCgpXG4gICAgICB9KTtcbiAgICAgIGFwcC5hZGRSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICB0eXBlb2YgdGhpcy5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uVHlwZV0gIT09IFwidW5kZWZpbmVkXCJcbiAgICApIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgIHJlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGhhcyBub3QgYmVlbiBhZGRlZCB0byBhcHA6IFwiICtcbiAgICAgICAgYXBwLm5hbWUuZ2V0KCkgK1xuICAgICAgICBcIixDYXVzZSA6IGFscmVhZHkgUmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLnJlbGF0aW9uTGlzdEJ5VHlwZVtyZWxhdGlvblR5cGVdICE9PVxuICAgICAgXCJ1bmRlZmluZWRcIikge1xuICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgaGFzIG5vdCBiZWVuIGFkZGVkIHRvIGFwcDogXCIgK1xuICAgICAgICBhcHAubmFtZS5nZXQoKSArXG4gICAgICAgIFwiLENhdXNlIDogYWxyZWFkeSBVc2VkIGJ5IG90aGVyIEFwcHNcIlxuICAgICAgKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU3BpbmFsR3JhcGg7XG5zcGluYWxDb3JlLnJlZ2lzdGVyX21vZGVscyhbU3BpbmFsR3JhcGhdKTsiXX0=