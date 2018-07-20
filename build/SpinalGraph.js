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

var _SpinalNetwork = require("./SpinalNetwork");

var _SpinalNetwork2 = _interopRequireDefault(_SpinalNetwork);

var _SpinalDevice = require("./SpinalDevice");

var _SpinalDevice2 = _interopRequireDefault(_SpinalDevice);

var _SpinalEndpoint = require("./SpinalEndpoint");

var _SpinalEndpoint2 = _interopRequireDefault(_SpinalEndpoint);

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
    globalType.spinal.contextStudio.SpinalNetwork = _SpinalNetwork2.default;
    globalType.spinal.contextStudio.SpinalDevice = _SpinalDevice2.default;
    globalType.spinal.contextStudio.SpinalEndpoint = _SpinalEndpoint2.default;
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
    } else {
      name = _element.constructor.name;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TcGluYWxHcmFwaC5qcyJdLCJuYW1lcyI6WyJzcGluYWxDb3JlIiwicmVxdWlyZSIsImdsb2JhbFR5cGUiLCJ3aW5kb3ciLCJnbG9iYWwiLCJTcGluYWxHcmFwaCIsIk1vZGVsIiwiY29uc3RydWN0b3IiLCJfbmFtZSIsIl9zdGFydGluZ05vZGUiLCJQdHIiLCJuYW1lIiwiRmlsZVN5c3RlbSIsIl9zaWdfc2VydmVyIiwiYWRkX2F0dHIiLCJleHRlcm5hbElkTm9kZU1hcHBpbmciLCJndWlkQWJzdHJhY3ROb2RlTWFwcGluZyIsInN0YXJ0aW5nTm9kZSIsIm5vZGVMaXN0IiwiTHN0Iiwibm9kZUxpc3RCeUVsZW1lbnRUeXBlIiwicmVsYXRpb25MaXN0IiwicmVsYXRpb25MaXN0QnlUeXBlIiwiYXBwc0xpc3QiLCJhcHBzTGlzdEJ5VHlwZSIsInJlc2VydmVkUmVsYXRpb25zTmFtZXMiLCJpbml0Iiwic3BpbmFsIiwiY29udGV4dFN0dWRpbyIsImdyYXBoIiwiU3BpbmFsTm9kZSIsIlNwaW5hbFJlbGF0aW9uIiwiQWJzdHJhY3RFbGVtZW50IiwiQklNRWxlbWVudCIsIlNwaW5hbE5ldHdvcmsiLCJTcGluYWxEZXZpY2UiLCJTcGluYWxFbmRwb2ludCIsIlV0aWxpdGllcyIsImdldE5vZGVCeWRiSWQiLCJfZGJJZCIsIl9leHRlcm5hbElkIiwiZ2V0RXh0ZXJuYWxJZCIsIkJJTUVsZW1lbnQxIiwiaW5pdEV4dGVybmFsSWQiLCJub2RlIiwiYWRkTm9kZUFzeW5jIiwidHlwZSIsImdldCIsImJpbmQiLCJfY2xhc3NpZnlCSU1FbGVtZW50Tm9kZSIsIl9ub2RlIiwiY2xhc3NpZnlOb2RlIiwiZ2V0RGJJZEJ5Tm9kZSIsImVsZW1lbnQiLCJwcm9taXNlTG9hZCIsImlkIiwic2V0TmFtZSIsInNldCIsInNldFN0YXJ0aW5nTm9kZSIsIl9hZGRFeHRlcm5hbElkTm9kZU1hcHBpbmdFbnRyeSIsIl9FbGVtZW50SWQiLCJfZGJpZCIsImV4dGVybmFsSWQiLCJ1bmJpbmQiLCJfZWxlbWVudCIsImluaXRFeHRlcm5hbElkQXN5bmMiLCJjb25zb2xlIiwibG9nIiwiYWRkTm9kZSIsInRoZW4iLCJyZWxhdGVkR3JhcGgiLCJsb2FkIiwicHVzaCIsIm5vZGVMaXN0T2ZUeXBlIiwiYWRkU2ltcGxlUmVsYXRpb25Bc3luYyIsIl9yZWxhdGlvblR5cGUiLCJfaXNEaXJlY3RlZCIsImlzUmVzZXJ2ZWQiLCJub2RlMiIsInJlbCIsImFkZFJlbGF0aW9uIiwiYWRkU2ltcGxlUmVsYXRpb24iLCJyZWxhdGlvblR5cGUiLCJpc0RpcmVjdGVkIiwiYWRkU2ltcGxlUmVsYXRpb25CeUFwcCIsImFwcE5hbWUiLCJoYXNSZXNlcnZhdGlvbkNyZWRlbnRpYWxzIiwiY29udGFpbnNBcHAiLCJlcnJvciIsInJlbGF0aW9uIiwiaW5kZXgiLCJub2RlTGlzdDEiLCJsZW5ndGgiLCJhZGREaXJlY3RlZFJlbGF0aW9uUGFyZW50Iiwibm9kZUxpc3QyIiwiYWRkRGlyZWN0ZWRSZWxhdGlvbkNoaWxkIiwiYWRkTm9uRGlyZWN0ZWRSZWxhdGlvbiIsIl9jbGFzc2lmeVJlbGF0aW9uIiwiYWRkUmVsYXRpb25zIiwiX3JlbGF0aW9ucyIsInJlbGF0aW9uTGlzdE9mVHlwZSIsImFwcCIsIl9jbGFzc2lmeVJlbGF0aW9ucyIsIl9hZGROb3RFeGlzdGluZ05vZGVzRnJvbUxpc3QiLCJfbGlzdCIsImkiLCJjb250YWluc0xzdEJ5SWQiLCJfYWRkTm90RXhpc3RpbmdOb2Rlc0Zyb21SZWxhdGlvbiIsIl9yZWxhdGlvbiIsImdldEFwcHNCeVR5cGUiLCJhcHBUeXBlIiwiZ2V0Q29udGV4dCIsInJlbGF0aW9uc1R5cGVzTHN0IiwiY29udGV4dCIsIlNwaW5hbENvbnRleHQiLCJjb250ZXh0TGlzdCIsImdldEFwcCIsInJlbGF0ZWRTcGluYWxHcmFwaCIsInNwaW5hbEFwcGxpY2F0aW9uIiwiU3BpbmFsQXBwbGljYXRpb24iLCJnZXRBcHBzTmFtZXMiLCJfYXR0cmlidXRlX25hbWVzIiwicmVzZXJ2ZVVu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Ozs7OztBQVFBQyw0QkFBMEJ4QyxZQUExQixFQUF3Q21CLEdBQXhDLEVBQTZDO0FBQzNDLFFBQ0UsT0FBTyxLQUFLNUUsc0JBQUwsQ0FBNEJ5RCxZQUE1QixDQUFQLEtBQXFELFdBQXJELElBQ0EsT0FBTyxLQUFLNUQsa0JBQUwsQ0FBd0I0RCxZQUF4QixDQUFQLEtBQWlELFdBRm5ELEVBR0U7QUFDQSxXQUFLekQsc0JBQUwsQ0FBNEJYLFFBQTVCLENBQXFDO0FBQ25DLFNBQUNvRSxZQUFELEdBQWdCbUIsSUFBSTFGLElBQUosQ0FBU29DLEdBQVQ7QUFEbUIsT0FBckM7QUFHQXNELFVBQUlzQixlQUFKLENBQW9CekMsWUFBcEI7QUFDQSxhQUFPLElBQVA7QUFDRCxLQVRELE1BU08sSUFDTCxPQUFPLEtBQUt6RCxzQkFBTCxDQUE0QnlELFlBQTVCLENBQVAsS0FBcUQsV0FEaEQsRUFFTDtBQUNBaEIsY0FBUXNCLEtBQVIsQ0FDRU4sZUFDQSw4QkFEQSxHQUVBbUIsSUFBSTFGLElBQUosQ0FBU29DLEdBQVQsRUFGQSxHQUdBLCtCQUhBLEdBSUEsS0FBS3RCLHNCQUFMLENBQTRCeUQsWUFBNUIsQ0FMRjtBQU9BLGFBQU8sS0FBUDtBQUNELEtBWE0sTUFXQSxJQUFJLE9BQU8sS0FBSzVELGtCQUFMLENBQXdCNEQsWUFBeEIsQ0FBUCxLQUNULFdBREssRUFDUTtBQUNiaEIsY0FBUXNCLEtBQVIsQ0FDRU4sZUFDQSw4QkFEQSxHQUVBbUIsSUFBSTFGLElBQUosQ0FBU29DLEdBQVQsRUFGQSxHQUdBLHFDQUpGO0FBTUQ7QUFDRjtBQW5vQndDOztrQkFzb0I1QjFDLFc7O0FBQ2ZMLFdBQVc0SCxlQUFYLENBQTJCLENBQUN2SCxXQUFELENBQTNCIiwiZmlsZSI6IlNwaW5hbEdyYXBoLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3Qgc3BpbmFsQ29yZSA9IHJlcXVpcmUoXCJzcGluYWwtY29yZS1jb25uZWN0b3Jqc1wiKTtcbmNvbnN0IGdsb2JhbFR5cGUgPSB0eXBlb2Ygd2luZG93ID09PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogd2luZG93O1xuaW1wb3J0IFNwaW5hbE5vZGUgZnJvbSBcIi4vU3BpbmFsTm9kZVwiO1xuaW1wb3J0IFNwaW5hbFJlbGF0aW9uIGZyb20gXCIuL1NwaW5hbFJlbGF0aW9uXCI7XG5pbXBvcnQgQWJzdHJhY3RFbGVtZW50IGZyb20gXCIuL0Fic3RyYWN0RWxlbWVudFwiO1xuaW1wb3J0IEJJTUVsZW1lbnQgZnJvbSBcIi4vQklNRWxlbWVudFwiO1xuaW1wb3J0IFNwaW5hbEFwcGxpY2F0aW9uIGZyb20gXCIuL1NwaW5hbEFwcGxpY2F0aW9uXCI7XG5pbXBvcnQgU3BpbmFsQ29udGV4dCBmcm9tIFwiLi9TcGluYWxDb250ZXh0XCI7XG5pbXBvcnQgU3BpbmFsTmV0d29yayBmcm9tIFwiLi9TcGluYWxOZXR3b3JrXCJcbmltcG9ydCBTcGluYWxEZXZpY2UgZnJvbSBcIi4vU3BpbmFsRGV2aWNlXCJcbmltcG9ydCBTcGluYWxFbmRwb2ludCBmcm9tIFwiLi9TcGluYWxFbmRwb2ludFwiXG5cbmltcG9ydCB7XG4gIFV0aWxpdGllc1xufSBmcm9tIFwiLi9VdGlsaXRpZXNcIjtcbi8qKlxuICogVGhlIGNvcmUgb2YgdGhlIGludGVyYWN0aW9ucyBiZXR3ZWVuIHRoZSBCSU1FbGVtZW50cyBOb2RlcyBhbmQgb3RoZXIgTm9kZXMoRG9jcywgVGlja2V0cywgZXRjIC4uKVxuICogQGNsYXNzIFNwaW5hbEdyYXBoXG4gKiBAZXh0ZW5kcyB7TW9kZWx9XG4gKi9cbmNsYXNzIFNwaW5hbEdyYXBoIGV4dGVuZHMgZ2xvYmFsVHlwZS5Nb2RlbCB7XG4gIC8qKlxuICAgKkNyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgU3BpbmFsR3JhcGguXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbX25hbWU9dF1cbiAgICogQHBhcmFtIHtQdHJ9IFtfc3RhcnRpbmdOb2RlPW5ldyBQdHIoMCldXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgY29uc3RydWN0b3IoX25hbWUgPSBcInRcIiwgX3N0YXJ0aW5nTm9kZSA9IG5ldyBQdHIoMCksIG5hbWUgPSBcIlNwaW5hbEdyYXBoXCIpIHtcbiAgICBzdXBlcigpO1xuICAgIGlmIChGaWxlU3lzdGVtLl9zaWdfc2VydmVyKSB7XG4gICAgICB0aGlzLmFkZF9hdHRyKHtcbiAgICAgICAgbmFtZTogX25hbWUsXG4gICAgICAgIGV4dGVybmFsSWROb2RlTWFwcGluZzogbmV3IE1vZGVsKCksXG4gICAgICAgIGd1aWRBYnN0cmFjdE5vZGVNYXBwaW5nOiBuZXcgTW9kZWwoKSxcbiAgICAgICAgc3RhcnRpbmdOb2RlOiBfc3RhcnRpbmdOb2RlLFxuICAgICAgICBub2RlTGlzdDogbmV3IFB0cihuZXcgTHN0KCkpLFxuICAgICAgICBub2RlTGlzdEJ5RWxlbWVudFR5cGU6IG5ldyBNb2RlbCgpLFxuICAgICAgICByZWxhdGlvbkxpc3Q6IG5ldyBQdHIobmV3IExzdCgpKSxcbiAgICAgICAgcmVsYXRpb25MaXN0QnlUeXBlOiBuZXcgTW9kZWwoKSxcbiAgICAgICAgYXBwc0xpc3Q6IG5ldyBNb2RlbCgpLFxuICAgICAgICBhcHBzTGlzdEJ5VHlwZTogbmV3IE1vZGVsKCksXG4gICAgICAgIHJlc2VydmVkUmVsYXRpb25zTmFtZXM6IG5ldyBNb2RlbCgpXG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqZnVuY3Rpb25cbiAgICpUbyBwdXQgdXNlZCBmdW5jdGlvbnMgYXMgd2VsbCBhcyB0aGUgU3BpbmFsR3JhcGggbW9kZWwgaW4gdGhlIGdsb2JhbCBzY29wZVxuICAgKi9cbiAgaW5pdCgpIHtcbiAgICBnbG9iYWxUeXBlLnNwaW5hbC5jb250ZXh0U3R1ZGlvID0ge307XG4gICAgZ2xvYmFsVHlwZS5zcGluYWwuY29udGV4dFN0dWRpby5ncmFwaCA9IHRoaXM7XG4gICAgZ2xvYmFsVHlwZS5zcGluYWwuY29udGV4dFN0dWRpby5TcGluYWxOb2RlID0gU3BpbmFsTm9kZTtcbiAgICBnbG9iYWxUeXBlLnNwaW5hbC5jb250ZXh0U3R1ZGlvLlNwaW5hbFJlbGF0aW9uID0gU3BpbmFsUmVsYXRpb247XG4gICAgZ2xvYmFsVHlwZS5zcGluYWwuY29udGV4dFN0dWRpby5BYnN0cmFjdEVsZW1lbnQgPSBBYnN0cmFjdEVsZW1lbnQ7XG4gICAgZ2xvYmFsVHlwZS5zcGluYWwuY29udGV4dFN0dWRpby5CSU1FbGVtZW50ID0gQklNRWxlbWVudDtcbiAgICBnbG9iYWxUeXBlLnNwaW5hbC5jb250ZXh0U3R1ZGlvLlNwaW5hbE5ldHdvcmsgPSBTcGluYWxOZXR3b3JrO1xuICAgIGdsb2JhbFR5cGUuc3BpbmFsLmNvbnRleHRTdHVkaW8uU3BpbmFsRGV2aWNlID0gU3BpbmFsRGV2aWNlO1xuICAgIGdsb2JhbFR5cGUuc3BpbmFsLmNvbnRleHRTdHVkaW8uU3BpbmFsRW5kcG9pbnQgPSBTcGluYWxFbmRwb2ludDtcbiAgICBnbG9iYWxUeXBlLnNwaW5hbC5jb250ZXh0U3R1ZGlvLlV0aWxpdGllcyA9IFV0aWxpdGllcztcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IF9kYklkXG4gICAqIEByZXR1cm5zIFByb21pc2Ugb2YgdGhlIGNvcnJlc3BvbmRpbmcgTm9kZSBvciB0aGUgY3JlYXRlZCBvbmUgaWYgbm90IGV4aXN0aW5nXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgYXN5bmMgZ2V0Tm9kZUJ5ZGJJZChfZGJJZCkge1xuICAgIGxldCBfZXh0ZXJuYWxJZCA9IGF3YWl0IFV0aWxpdGllcy5nZXRFeHRlcm5hbElkKF9kYklkKTtcbiAgICBpZiAodHlwZW9mIHRoaXMuZXh0ZXJuYWxJZE5vZGVNYXBwaW5nW19leHRlcm5hbElkXSAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgIHJldHVybiB0aGlzLmV4dGVybmFsSWROb2RlTWFwcGluZ1tfZXh0ZXJuYWxJZF07XG4gICAgZWxzZSB7XG4gICAgICBsZXQgQklNRWxlbWVudDEgPSBuZXcgQklNRWxlbWVudChfZGJJZCk7XG4gICAgICBCSU1FbGVtZW50MS5pbml0RXh0ZXJuYWxJZCgpO1xuICAgICAgbGV0IG5vZGUgPSBhd2FpdCB0aGlzLmFkZE5vZGVBc3luYyhCSU1FbGVtZW50MSk7XG4gICAgICBpZiAoQklNRWxlbWVudDEudHlwZS5nZXQoKSA9PT0gXCJcIikge1xuICAgICAgICBCSU1FbGVtZW50MS50eXBlLmJpbmQodGhpcy5fY2xhc3NpZnlCSU1FbGVtZW50Tm9kZS5iaW5kKHRoaXMsIG5vZGUpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBub2RlO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxOb2RlfSBfbm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIGFzeW5jIF9jbGFzc2lmeUJJTUVsZW1lbnROb2RlKF9ub2RlKSB7XG4gICAgLy9UT0RPIERFTEVURSBPTEQgQ0xBU1NJRklDQVRJT05cbiAgICB0aGlzLmNsYXNzaWZ5Tm9kZShfbm9kZSk7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZX0gX25vZGVcbiAgICogQHJldHVybnMgUHJvbWlzZSBvZiBkYklkIFtudW1iZXJdXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgYXN5bmMgZ2V0RGJJZEJ5Tm9kZShfbm9kZSkge1xuICAgIGxldCBlbGVtZW50ID0gYXdhaXQgVXRpbGl0aWVzLnByb21pc2VMb2FkKF9ub2RlLmVsZW1lbnQpO1xuICAgIGlmIChlbGVtZW50IGluc3RhbmNlb2YgQklNRWxlbWVudCkge1xuICAgICAgcmV0dXJuIGVsZW1lbnQuaWQuZ2V0KCk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gX25hbWVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBzZXROYW1lKF9uYW1lKSB7XG4gICAgdGhpcy5uYW1lLnNldChfbmFtZSk7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7UHRyfSBfc3RhcnRpbmdOb2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgc2V0U3RhcnRpbmdOb2RlKF9zdGFydGluZ05vZGUpIHtcbiAgICB0aGlzLnN0YXJ0aW5nTm9kZS5zZXQoX3N0YXJ0aW5nTm9kZSk7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBfRWxlbWVudElkIC0gdGhlIEVsZW1lbnQgRXh0ZXJuYWxJZFxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGV9IF9ub2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgYXN5bmMgX2FkZEV4dGVybmFsSWROb2RlTWFwcGluZ0VudHJ5KF9FbGVtZW50SWQsIF9ub2RlKSB7XG4gICAgbGV0IF9kYmlkID0gX0VsZW1lbnRJZC5nZXQoKTtcbiAgICBpZiAodHlwZW9mIF9kYmlkID09IFwibnVtYmVyXCIpXG4gICAgICBpZiAoX2RiaWQgIT0gMCkge1xuICAgICAgICBsZXQgZXh0ZXJuYWxJZCA9IGF3YWl0IFV0aWxpdGllcy5nZXRFeHRlcm5hbElkKF9kYmlkKTtcbiAgICAgICAgbGV0IGVsZW1lbnQgPSBhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQoX25vZGUuZWxlbWVudCk7XG4gICAgICAgIGF3YWl0IGVsZW1lbnQuaW5pdEV4dGVybmFsSWQoKTtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmV4dGVybmFsSWROb2RlTWFwcGluZ1tleHRlcm5hbElkXSA9PT0gXCJ1bmRlZmluZWRcIilcbiAgICAgICAgICB0aGlzLmV4dGVybmFsSWROb2RlTWFwcGluZy5hZGRfYXR0cih7XG4gICAgICAgICAgICBbZXh0ZXJuYWxJZF06IF9ub2RlXG4gICAgICAgICAgfSk7XG4gICAgICAgIF9FbGVtZW50SWQudW5iaW5kKFxuICAgICAgICAgIHRoaXMuX2FkZEV4dGVybmFsSWROb2RlTWFwcGluZ0VudHJ5LmJpbmQodGhpcywgX0VsZW1lbnRJZCxcbiAgICAgICAgICAgIF9ub2RlKVxuICAgICAgICApO1xuICAgICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge01vZGVsfSBfZWxlbWVudCAtIGFueSBzdWJjbGFzcyBvZiBNb2RlbFxuICAgKiBAcmV0dXJucyBQcm9taXNlIG9mIHRoZSBjcmVhdGVkIE5vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBhc3luYyBhZGROb2RlQXN5bmMoX2VsZW1lbnQpIHtcbiAgICBsZXQgbmFtZSA9IFwiXCI7XG4gICAgaWYgKF9lbGVtZW50IGluc3RhbmNlb2YgQklNRWxlbWVudCkge1xuICAgICAgYXdhaXQgX2VsZW1lbnQuaW5pdEV4dGVybmFsSWRBc3luYygpO1xuICAgICAgaWYgKFxuICAgICAgICB0eXBlb2YgdGhpcy5leHRlcm5hbElkTm9kZU1hcHBpbmdbX2VsZW1lbnQuZXh0ZXJuYWxJZC5nZXQoKV0gIT09XG4gICAgICAgIFwidW5kZWZpbmVkXCJcbiAgICAgICkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkJJTSBPQkpFQ1QgTk9ERSBBTFJFQURZIEVYSVNUU1wiKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXh0ZXJuYWxJZE5vZGVNYXBwaW5nW19lbGVtZW50LmV4dGVybmFsSWQuZ2V0KCldO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoX2VsZW1lbnQgaW5zdGFuY2VvZiBBYnN0cmFjdEVsZW1lbnQpIHtcbiAgICAgIGlmIChcbiAgICAgICAgdHlwZW9mIHRoaXMuZ3VpZEFic3RyYWN0Tm9kZU1hcHBpbmdbX2VsZW1lbnQuaWQuZ2V0KCldICE9PVxuICAgICAgICBcInVuZGVmaW5lZFwiXG4gICAgICApIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJBQlNUUkFDVCBPQkpFQ1QgTk9ERSBBTFJFQURZIEVYSVNUU1wiKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3VpZEFic3RyYWN0Tm9kZU1hcHBpbmdbX2VsZW1lbnQuaWQuZ2V0KCldO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodHlwZW9mIF9lbGVtZW50Lm5hbWUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIG5hbWUgPSBfZWxlbWVudC5uYW1lLmdldCgpO1xuICAgIH1cbiAgICBsZXQgbm9kZSA9IG5ldyBTcGluYWxOb2RlKG5hbWUsIF9lbGVtZW50LCB0aGlzKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtNb2RlbH0gX2VsZW1lbnQgLSBhbnkgc3ViY2xhc3Mgb2YgTW9kZWxcbiAgICogQHJldHVybnMgdGhlIGNyZWF0ZWQgTm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIGFkZE5vZGUoX2VsZW1lbnQpIHtcbiAgICBsZXQgbmFtZSA9IFwiXCI7XG4gICAgaWYgKF9lbGVtZW50IGluc3RhbmNlb2YgQklNRWxlbWVudCkge1xuICAgICAgX2VsZW1lbnQuaW5pdEV4dGVybmFsSWQoKTtcbiAgICAgIGlmIChcbiAgICAgICAgdHlwZW9mIHRoaXMuZXh0ZXJuYWxJZE5vZGVNYXBwaW5nW19lbGVtZW50LmV4dGVybmFsSWQuZ2V0KCldICE9PVxuICAgICAgICBcInVuZGVmaW5lZFwiXG4gICAgICApIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJCSU0gT0JKRUNUIE5PREUgQUxSRUFEWSBFWElTVFNcIik7XG4gICAgICAgIHJldHVybiB0aGlzLmV4dGVybmFsSWROb2RlTWFwcGluZ1tfZWxlbWVudC5leHRlcm5hbElkLmdldCgpXTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKF9lbGVtZW50IGluc3RhbmNlb2YgQWJzdHJhY3RFbGVtZW50KSB7XG4gICAgICBpZiAoXG4gICAgICAgIHR5cGVvZiB0aGlzLmd1aWRBYnN0cmFjdE5vZGVNYXBwaW5nW19lbGVtZW50LmlkLmdldCgpXSAhPT1cbiAgICAgICAgXCJ1bmRlZmluZWRcIlxuICAgICAgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQUJTVFJBQ1QgT0JKRUNUIE5PREUgQUxSRUFEWSBFWElTVFNcIik7XG4gICAgICAgIHJldHVybiB0aGlzLmd1aWRBYnN0cmFjdE5vZGVNYXBwaW5nW19lbGVtZW50LmlkLmdldCgpXTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHR5cGVvZiBfZWxlbWVudC5uYW1lICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBuYW1lID0gX2VsZW1lbnQubmFtZS5nZXQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZSA9IF9lbGVtZW50LmNvbnN0cnVjdG9yLm5hbWU7XG4gICAgfVxuICAgIGxldCBub2RlID0gbmV3IFNwaW5hbE5vZGUobmFtZSwgX2VsZW1lbnQsIHRoaXMpO1xuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgLyoqXG4gICAqICBPYnNlcnZlcyB0aGUgdHlwZSBvZiB0aGUgZWxlbWVudCBpbnNpZGUgdGhlIG5vZGUgYWRkIENsYXNzaWZ5IGl0LlxuICAgKiAgSXQgcHV0cyBpdCBpbiB0aGUgVW5jbGFzc2lmaWVkIGxpc3QgT3RoZXJ3aXNlLlxuICAgKiBJdCBhZGRzIHRoZSBub2RlIHRvIHRoZSBtYXBwaW5nIGxpc3Qgd2l0aCBFeHRlcm5hbElkIGlmIHRoZSBPYmplY3QgaXMgb2YgdHlwZSBCSU1FbGVtZW50XG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZX0gX25vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBjbGFzc2lmeU5vZGUoX25vZGUpIHtcbiAgICBVdGlsaXRpZXMucHJvbWlzZUxvYWQoX25vZGUuZWxlbWVudCkudGhlbihlbGVtZW50ID0+IHtcbiAgICAgIGlmICh0eXBlb2YgX25vZGUucmVsYXRlZEdyYXBoID09PSBcInVuZGVmaW5lZFwiKSBfbm9kZS5yZWxhdGVkR3JhcGhcbiAgICAgICAgLnNldChcbiAgICAgICAgICB0aGlzKTtcbiAgICAgIHRoaXMubm9kZUxpc3QubG9hZChub2RlTGlzdCA9PiB7XG4gICAgICAgIG5vZGVMaXN0LnB1c2goX25vZGUpO1xuICAgICAgfSk7XG4gICAgICBsZXQgdHlwZSA9IFwiVW5jbGFzc2lmaWVkXCI7XG4gICAgICBpZiAodHlwZW9mIGVsZW1lbnQudHlwZSAhPSBcInVuZGVmaW5lZFwiICYmIGVsZW1lbnQudHlwZS5nZXQoKSAhPVxuICAgICAgICBcIlwiKSB7XG4gICAgICAgIHR5cGUgPSBlbGVtZW50LnR5cGUuZ2V0KCk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5ub2RlTGlzdEJ5RWxlbWVudFR5cGVbdHlwZV0pIHtcbiAgICAgICAgdGhpcy5ub2RlTGlzdEJ5RWxlbWVudFR5cGVbdHlwZV0ubG9hZChub2RlTGlzdE9mVHlwZSA9PiB7XG4gICAgICAgICAgbm9kZUxpc3RPZlR5cGUucHVzaChfbm9kZSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IG5vZGVMaXN0T2ZUeXBlID0gbmV3IExzdCgpO1xuICAgICAgICBub2RlTGlzdE9mVHlwZS5wdXNoKF9ub2RlKTtcbiAgICAgICAgdGhpcy5ub2RlTGlzdEJ5RWxlbWVudFR5cGUuYWRkX2F0dHIoe1xuICAgICAgICAgIFt0eXBlXTogbmV3IFB0cihub2RlTGlzdE9mVHlwZSlcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEJJTUVsZW1lbnQpIHtcbiAgICAgICAgbGV0IF9kYmlkID0gZWxlbWVudC5pZC5nZXQoKTtcbiAgICAgICAgaWYgKHR5cGVvZiBfZGJpZCA9PSBcIm51bWJlclwiKVxuICAgICAgICAgIGlmIChfZGJpZCAhPSAwKSB7XG4gICAgICAgICAgICB0aGlzLl9hZGRFeHRlcm5hbElkTm9kZU1hcHBpbmdFbnRyeShlbGVtZW50LmlkLCBfbm9kZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsZW1lbnQuaWQuYmluZChcbiAgICAgICAgICAgICAgdGhpcy5fYWRkRXh0ZXJuYWxJZE5vZGVNYXBwaW5nRW50cnkuYmluZChudWxsLCBlbGVtZW50LmlkLFxuICAgICAgICAgICAgICAgIF9ub2RlKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBBYnN0cmFjdEVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5ndWlkQWJzdHJhY3ROb2RlTWFwcGluZy5hZGRfYXR0cih7XG4gICAgICAgICAgW2VsZW1lbnQuaWQuZ2V0KCldOiBfbm9kZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8vIGFkZE5vZGVzKF92ZXJ0aWNlcykge1xuICAvLyAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBfdmVydGljZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gIC8vICAgICB0aGlzLmNsYXNzaWZ5Tm9kZShfdmVydGljZXNbaW5kZXhdKVxuICAvLyAgIH1cbiAgLy8gfVxuICAvKipcbiAgICogIEl0IGNyZWF0ZXMgdGhlIG5vZGUgY29ycmVzcG9uZGluZyB0byB0aGUgX2VsZW1lbnQsXG4gICAqIHRoZW4gaXQgY3JlYXRlcyBhIHNpbXBsZSByZWxhdGlvbiBvZiBjbGFzcyBTcGluYWxSZWxhdGlvbiBvZiB0eXBlOl90eXBlLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gX3JlbGF0aW9uVHlwZVxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGV9IF9ub2RlXG4gICAqIEBwYXJhbSB7TW9kZWx9IF9lbGVtZW50IC0gYW55IHN1YmNsYXNzIG9mIE1vZGVsXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW19pc0RpcmVjdGVkPWZhbHNlXVxuICAgKiBAcmV0dXJucyBhIFByb21pc2Ugb2YgdGhlIGNyZWF0ZWQgcmVsYXRpb25cbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBhc3luYyBhZGRTaW1wbGVSZWxhdGlvbkFzeW5jKFxuICAgIF9yZWxhdGlvblR5cGUsXG4gICAgX25vZGUsXG4gICAgX2VsZW1lbnQsXG4gICAgX2lzRGlyZWN0ZWQgPSBmYWxzZVxuICApIHtcbiAgICBpZiAoIXRoaXMuaXNSZXNlcnZlZChfcmVsYXRpb25UeXBlKSkge1xuICAgICAgbGV0IG5vZGUyID0gYXdhaXQgdGhpcy5hZGROb2RlQXN5bmMoX2VsZW1lbnQpO1xuICAgICAgbGV0IHJlbCA9IG5ldyBTcGluYWxSZWxhdGlvbihcbiAgICAgICAgX3JlbGF0aW9uVHlwZSwgW19ub2RlXSwgW25vZGUyXSxcbiAgICAgICAgX2lzRGlyZWN0ZWRcbiAgICAgICk7XG4gICAgICB0aGlzLmFkZFJlbGF0aW9uKHJlbCk7XG4gICAgICByZXR1cm4gcmVsO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgX3JlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGlzIHJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW19yZWxhdGlvblR5cGVdXG4gICAgICApO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICogIEl0IGNyZWF0ZXMgdGhlIG5vZGUgY29ycmVzcG9uZGluZyB0byB0aGUgX2VsZW1lbnQsXG4gICAqIHRoZW4gaXQgY3JlYXRlcyBhIHNpbXBsZSByZWxhdGlvbiBvZiBjbGFzcyBTcGluYWxSZWxhdGlvbiBvZiB0eXBlOl90eXBlLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZX0gbm9kZVxuICAgKiBAcGFyYW0ge01vZGVsfSBlbGVtZW50IC0gYW55IHN1YmNsYXNzIG9mIE1vZGVsXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGlyZWN0ZWQ9ZmFsc2VdXG4gICAqIEByZXR1cm5zIGEgUHJvbWlzZSBvZiB0aGUgY3JlYXRlZCByZWxhdGlvblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIGFkZFNpbXBsZVJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgbm9kZSwgZWxlbWVudCwgaXNEaXJlY3RlZCA9IGZhbHNlKSB7XG4gICAgaWYgKCF0aGlzLmlzUmVzZXJ2ZWQoX3JlbGF0aW9uVHlwZSkpIHtcbiAgICAgIGxldCBub2RlMiA9IHRoaXMuYWRkTm9kZShlbGVtZW50KTtcbiAgICAgIGxldCByZWwgPSBuZXcgU3BpbmFsUmVsYXRpb24ocmVsYXRpb25UeXBlLCBbbm9kZV0sIFtub2RlMl0sXG4gICAgICAgIGlzRGlyZWN0ZWQpO1xuICAgICAgdGhpcy5hZGRSZWxhdGlvbihyZWwpO1xuICAgICAgcmV0dXJuIHJlbDtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIF9yZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tfcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHBhcmFtIHtTcGluYWxOb2RlfSBub2RlXG4gICAqIEBwYXJhbSB7TW9kZWx9IGVsZW1lbnQgLSBhbnkgc3ViY2xhc3Mgb2YgTW9kZWxcbiAgICogQHBhcmFtIHtib29sZWFufSBbaXNEaXJlY3RlZD1mYWxzZV1cbiAgICogQHJldHVybnMgdGhlIGNyZWF0ZWQgUmVsYXRpb24sIHVuZGVmaW5lZCBvdGhlcndpc2VcbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBhZGRTaW1wbGVSZWxhdGlvbkJ5QXBwKFxuICAgIGFwcE5hbWUsXG4gICAgcmVsYXRpb25UeXBlLFxuICAgIG5vZGUsXG4gICAgZWxlbWVudCxcbiAgICBpc0RpcmVjdGVkID0gZmFsc2VcbiAgKSB7XG4gICAgaWYgKHRoaXMuaGFzUmVzZXJ2YXRpb25DcmVkZW50aWFscyhfcmVsYXRpb25UeXBlLCBhcHBOYW1lKSkge1xuICAgICAgaWYgKHRoaXMuY29udGFpbnNBcHAoYXBwTmFtZSkpIHtcbiAgICAgICAgbGV0IG5vZGUyID0gdGhpcy5hZGROb2RlKGVsZW1lbnQpO1xuICAgICAgICBsZXQgcmVsID0gbmV3IFNwaW5hbFJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgW25vZGVdLCBbbm9kZTJdLFxuICAgICAgICAgIGlzRGlyZWN0ZWQpO1xuICAgICAgICB0aGlzLmFkZFJlbGF0aW9uKHJlbCwgYXBwTmFtZSk7XG4gICAgICAgIHJldHVybiByZWw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKGFwcE5hbWUgKyBcIiBkb2VzIG5vdCBleGlzdFwiKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIF9yZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tfcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb259IHJlbGF0aW9uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgYWRkUmVsYXRpb24ocmVsYXRpb24sIGFwcE5hbWUpIHtcbiAgICBpZiAodGhpcy5oYXNSZXNlcnZhdGlvbkNyZWRlbnRpYWxzKHJlbGF0aW9uLnR5cGUuZ2V0KCksIGFwcE5hbWUpKSB7XG4gICAgICBpZiAocmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKSkge1xuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcmVsYXRpb24ubm9kZUxpc3QxLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgIGNvbnN0IG5vZGUgPSByZWxhdGlvbi5ub2RlTGlzdDFbaW5kZXhdO1xuICAgICAgICAgIG5vZGUuYWRkRGlyZWN0ZWRSZWxhdGlvblBhcmVudChyZWxhdGlvbiwgYXBwTmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHJlbGF0aW9uLm5vZGVMaXN0Mi5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICBjb25zdCBub2RlID0gcmVsYXRpb24ubm9kZUxpc3QyW2luZGV4XTtcbiAgICAgICAgICBub2RlLmFkZERpcmVjdGVkUmVsYXRpb25DaGlsZChyZWxhdGlvbiwgYXBwTmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCByZWxhdGlvbi5ub2RlTGlzdDEubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgY29uc3Qgbm9kZSA9IHJlbGF0aW9uLm5vZGVMaXN0MVtpbmRleF07XG4gICAgICAgICAgbm9kZS5hZGROb25EaXJlY3RlZFJlbGF0aW9uKHJlbGF0aW9uLCBhcHBOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcmVsYXRpb24ubm9kZUxpc3QyLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgIGNvbnN0IG5vZGUgPSByZWxhdGlvbi5ub2RlTGlzdDJbaW5kZXhdO1xuICAgICAgICAgIG5vZGUuYWRkTm9uRGlyZWN0ZWRSZWxhdGlvbihyZWxhdGlvbiwgYXBwTmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuX2NsYXNzaWZ5UmVsYXRpb24ocmVsYXRpb24sIGFwcE5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb24udHlwZS5nZXQoKSArXG4gICAgICAgIFwiIGlzIHJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uLnR5cGUuZ2V0KCldXG4gICAgICApO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbltdfSBfcmVsYXRpb25zXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgYWRkUmVsYXRpb25zKF9yZWxhdGlvbnMpIHtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX3JlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IHJlbGF0aW9uID0gX3JlbGF0aW9uc1tpbmRleF07XG4gICAgICB0aGlzLmFkZFJlbGF0aW9uKHJlbGF0aW9uKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFscmVsYXRpb259IHJlbGF0aW9uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgX2NsYXNzaWZ5UmVsYXRpb24ocmVsYXRpb24sIGFwcE5hbWUpIHtcbiAgICB0aGlzLnJlbGF0aW9uTGlzdC5sb2FkKHJlbGF0aW9uTGlzdCA9PiB7XG4gICAgICByZWxhdGlvbkxpc3QucHVzaChyZWxhdGlvbik7XG4gICAgfSk7XG4gICAgaWYgKHRoaXMucmVsYXRpb25MaXN0QnlUeXBlW3JlbGF0aW9uLnR5cGUuZ2V0KCldKSB7XG4gICAgICB0aGlzLnJlbGF0aW9uTGlzdEJ5VHlwZVtyZWxhdGlvbi50eXBlLmdldCgpXS5sb2FkKHJlbGF0aW9uTGlzdE9mVHlwZSA9PiB7XG4gICAgICAgIHJlbGF0aW9uTGlzdE9mVHlwZS5wdXNoKHJlbGF0aW9uKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcmVsYXRpb25MaXN0T2ZUeXBlID0gbmV3IExzdCgpO1xuICAgICAgcmVsYXRpb25MaXN0T2ZUeXBlLnB1c2gocmVsYXRpb24pO1xuICAgICAgdGhpcy5yZWxhdGlvbkxpc3RCeVR5cGUuYWRkX2F0dHIoe1xuICAgICAgICBbcmVsYXRpb24udHlwZS5nZXQoKV06IG5ldyBQdHIocmVsYXRpb25MaXN0T2ZUeXBlKVxuICAgICAgfSk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgYXBwTmFtZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgaWYgKHRoaXMuY29udGFpbnNBcHAoYXBwTmFtZSkpXG4gICAgICAgIHRoaXMuYXBwc0xpc3RbYXBwTmFtZV0ubG9hZChhcHAgPT4ge1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIHR5cGVvZiBhcHBbcmVsYXRpb24udHlwZS5nZXQoKV0gPT09XG4gICAgICAgICAgICBcInVuZGVmaW5lZFwiXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBhcHAuYWRkUmVsYXRpb24ocmVsYXRpb24pXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cbiAgfVxuICAvKipcbiAgICpjaGVja3MgaWYgdGhpcyBncmFwaCBjb250YWlucyBjb250YWlucyBhIHNwZWNpZmljIEFwcFxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAcmV0dXJucyBCb29sZWFuXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgY29udGFpbnNBcHAoYXBwTmFtZSkge1xuICAgIHJldHVybiB0eXBlb2YgdGhpcy5hcHBzTGlzdFthcHBOYW1lXSAhPT0gXCJ1bmRlZmluZWRcIjtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgaXNSZXNlcnZlZChyZWxhdGlvblR5cGUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHRoaXMucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvblR5cGVdICE9PSBcInVuZGVmaW5lZFwiO1xuICB9XG4gIC8qKlxuICAgKiAgY2hlY2tzIGlmIHRoZSBhcHAgaGFzIHRoZSByaWdodCB0byB1c2UgYSByZXNlcnZlZCByZWxhdGlvblxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBoYXNSZXNlcnZhdGlvbkNyZWRlbnRpYWxzKHJlbGF0aW9uVHlwZSwgYXBwTmFtZSkge1xuICAgIHJldHVybiAoIXRoaXMuaXNSZXNlcnZlZChyZWxhdGlvblR5cGUpIHx8XG4gICAgICAodGhpcy5pc1Jlc2VydmVkKHJlbGF0aW9uVHlwZSkgJiZcbiAgICAgICAgdGhpcy5yZXNlcnZlZFJlbGF0aW9uc05hbWVzKHJlbGF0aW9uVHlwZSkgPT09IGFwcE5hbWUpXG4gICAgKTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbnN9IHJlbGF0aW9uc1xuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIF9jbGFzc2lmeVJlbGF0aW9ucyhfcmVsYXRpb25zKSB7XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IF9yZWxhdGlvbnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICB0aGlzLl9jbGFzc2lmeVJlbGF0aW9uKF9yZWxhdGlvbnNbaW5kZXhdKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZVtdfSBfbGlzdFxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIF9hZGROb3RFeGlzdGluZ05vZGVzRnJvbUxpc3QoX2xpc3QpIHtcbiAgICB0aGlzLm5vZGVMaXN0LmxvYWQobm9kZUxpc3QgPT4ge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBfbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgbm9kZSA9IF9saXN0W2ldO1xuICAgICAgICBpZiAoIVV0aWxpdGllcy5jb250YWluc0xzdEJ5SWQobm9kZUxpc3QsIG5vZGUpKSB7XG4gICAgICAgICAgdGhpcy5jbGFzc2lmeU5vZGUobm9kZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbltdfSBfcmVsYXRpb25cbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBfYWRkTm90RXhpc3RpbmdOb2Rlc0Zyb21SZWxhdGlvbihfcmVsYXRpb24pIHtcbiAgICB0aGlzLl9hZGROb3RFeGlzdGluZ05vZGVzRnJvbUxpc3QoX3JlbGF0aW9uLm5vZGVMaXN0MSk7XG4gICAgdGhpcy5fYWRkTm90RXhpc3RpbmdOb2Rlc0Zyb21MaXN0KF9yZWxhdGlvbi5ub2RlTGlzdDIpO1xuICB9XG5cblxuICAvLyBhc3luYyBnZXRBbGxDb250ZXh0cygpIHtcbiAgLy8gICBsZXQgcmVzID0gW11cbiAgLy8gICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5hcHBzTGlzdC5fYXR0cmlidXRlX25hbWVzLmxlbmd0aDsgaW5kZXgrKykge1xuICAvLyAgICAgbGV0IGtleSA9IHRoaXMuYXBwc0xpc3QuX2F0dHJpYnV0ZV9uYW1lc1tpbmRleF1cbiAgLy8gICAgIGlmIChrZXkuaW5jbHVkZXMoXCJfQ1wiLCBrZXkubGVuZ3RoIC0gMikpIHtcbiAgLy8gICAgICAgY29uc3QgY29udGV4dCA9IHRoaXMuYXBwc0xpc3Rba2V5XTtcbiAgLy8gICAgICAgcmVzLnB1c2goYXdhaXQgVXRpbGl0aWVzLnByb21pc2VMb2FkKGNvbnRleHQpKVxuICAvLyAgICAgfVxuXG4gIC8vICAgfVxuICAvLyAgIHJldHVybiByZXM7XG4gIC8vIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBUeXBlXG4gICAqIEByZXR1cm5zIGFsbCBBcHBzIG9mIGEgc3BlY2lmaWMgdHlwZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIGFzeW5jIGdldEFwcHNCeVR5cGUoYXBwVHlwZSkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5hcHBzTGlzdEJ5VHlwZVthcHBUeXBlXSAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgIHJldHVybiBhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQodGhpcy5hcHBzTGlzdEJ5VHlwZVthcHBUeXBlXSlcbiAgfVxuXG5cblxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHBhcmFtIHtzdHJpbmdbXX0gcmVsYXRpb25zVHlwZXNMc3RcbiAgICogQHBhcmFtIHtTcGluYWxHcmFwaH0gW3JlbGF0ZWRHcmFwaD10aGlzXVxuICAgKiBAcGFyYW0ge1B0cn0gc3RhcnRpbmdOb2RlXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSBvZiB0aGUgY3JlYXRlZCBDb250ZXh0XG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgYXN5bmMgZ2V0Q29udGV4dChuYW1lLCByZWxhdGlvbnNUeXBlc0xzdCwgcmVsYXRlZEdyYXBoID0gdGhpcyxcbiAgICBzdGFydGluZ05vZGUsICkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5hcHBzTGlzdFtuYW1lXSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgbGV0IGNvbnRleHQgPSBuZXcgU3BpbmFsQ29udGV4dChcbiAgICAgICAgbmFtZSxcbiAgICAgICAgcmVsYXRpb25zVHlwZXNMc3QsXG4gICAgICAgIHJlbGF0ZWRHcmFwaCxcbiAgICAgICAgc3RhcnRpbmdOb2RlXG4gICAgICApO1xuICAgICAgdGhpcy5hcHBzTGlzdC5hZGRfYXR0cih7XG4gICAgICAgIFtuYW1lXTogbmV3IFB0cihjb250ZXh0KVxuICAgICAgfSk7XG4gICAgICBpZiAodHlwZW9mIHRoaXMuYXBwc0xpc3RCeVR5cGUuY29udGV4dCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICB0aGlzLmFwcHNMaXN0QnlUeXBlLmFkZF9hdHRyKHtcbiAgICAgICAgICBjb250ZXh0OiBuZXcgUHRyKG5ldyBMc3QoW2NvbnRleHRdKSlcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgY29udGV4dExpc3QgPSBhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQodGhpcy5hcHBzTGlzdEJ5VHlwZS5jb250ZXh0KVxuICAgICAgICBjb250ZXh0TGlzdC5wdXNoKGNvbnRleHQpXG4gICAgICB9XG4gICAgICByZXR1cm4gY29udGV4dDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGF3YWl0IFV0aWxpdGllcy5wcm9taXNlTG9hZCh0aGlzLmFwcHNMaXN0W25hbWVdKVxuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHBhcmFtIHtzdHJpbmdbXX0gcmVsYXRpb25zVHlwZXNMc3RcbiAgICogQHBhcmFtIHtTcGluYWxHcmFwaH0gW3JlbGF0ZWRTcGluYWxHcmFwaD10aGlzXVxuICAgKiBAcmV0dXJucyBBIHByb21pc2Ugb2YgdGhlIGNyZWF0ZWQgQXBwXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgYXN5bmMgZ2V0QXBwKG5hbWUsIHJlbGF0aW9uc1R5cGVzTHN0LCByZWxhdGVkU3BpbmFsR3JhcGggPSB0aGlzKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLmFwcHNMaXN0W25hbWVdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBsZXQgc3BpbmFsQXBwbGljYXRpb24gPSBuZXcgU3BpbmFsQXBwbGljYXRpb24oXG4gICAgICAgIG5hbWUsXG4gICAgICAgIHJlbGF0aW9uc1R5cGVzTHN0LFxuICAgICAgICByZWxhdGVkU3BpbmFsR3JhcGhcbiAgICAgICk7XG4gICAgICB0aGlzLmFwcHNMaXN0LmFkZF9hdHRyKHtcbiAgICAgICAgW25hbWVdOiBuZXcgUHRyKHNwaW5hbEFwcGxpY2F0aW9uKVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gc3BpbmFsQXBwbGljYXRpb247XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQodGhpcy5hcHBzTGlzdFtuYW1lXSlcbiAgICAgIC8vIGNvbnNvbGUuZXJyb3IoXG4gICAgICAvLyAgIG5hbWUgK1xuICAgICAgLy8gICBcIiBhcyB3ZWxsIGFzIFwiICtcbiAgICAgIC8vICAgdGhpcy5nZXRBcHBzTmFtZXMoKSArXG4gICAgICAvLyAgIFwiIGhhdmUgYmVlbiBhbHJlYWR5IHVzZWQsIHBsZWFzZSBjaG9vc2UgYW5vdGhlciBhcHBsaWNhdGlvbiBuYW1lXCJcbiAgICAgIC8vICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEByZXR1cm5zIGFuIGFycmF5IG9mIGFwcHMgbmFtZXNcbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBnZXRBcHBzTmFtZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuYXBwc0xpc3QuX2F0dHJpYnV0ZV9uYW1lcztcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcGFyYW0ge1NwaW5hbEFwcGxpY2F0aW9ufSBhcHBcbiAgICogQHJldHVybnMgYm9vbGVhblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIHJlc2VydmVVbmlxdWVSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlLCBhcHApIHtcbiAgICBpZiAoXG4gICAgICB0eXBlb2YgdGhpcy5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uVHlwZV0gPT09IFwidW5kZWZpbmVkXCIgJiZcbiAgICAgIHR5cGVvZiB0aGlzLnJlbGF0aW9uTGlzdEJ5VHlwZVtyZWxhdGlvblR5cGVdID09PSBcInVuZGVmaW5lZFwiXG4gICAgKSB7XG4gICAgICB0aGlzLnJlc2VydmVkUmVsYXRpb25zTmFtZXMuYWRkX2F0dHIoe1xuICAgICAgICBbcmVsYXRpb25UeXBlXTogYXBwLm5hbWUuZ2V0KClcbiAgICAgIH0pO1xuICAgICAgYXBwLmFkZFJlbGF0aW9uVHlwZShyZWxhdGlvblR5cGUpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgIHR5cGVvZiB0aGlzLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb25UeXBlXSAhPT0gXCJ1bmRlZmluZWRcIlxuICAgICkge1xuICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgaGFzIG5vdCBiZWVuIGFkZGVkIHRvIGFwcDogXCIgK1xuICAgICAgICBhcHAubmFtZS5nZXQoKSArXG4gICAgICAgIFwiLENhdXNlIDogYWxyZWFkeSBSZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvblR5cGVdXG4gICAgICApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMucmVsYXRpb25MaXN0QnlUeXBlW3JlbGF0aW9uVHlwZV0gIT09XG4gICAgICBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICByZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBoYXMgbm90IGJlZW4gYWRkZWQgdG8gYXBwOiBcIiArXG4gICAgICAgIGFwcC5uYW1lLmdldCgpICtcbiAgICAgICAgXCIsQ2F1c2UgOiBhbHJlYWR5IFVzZWQgYnkgb3RoZXIgQXBwc1wiXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBTcGluYWxHcmFwaDtcbnNwaW5hbENvcmUucmVnaXN0ZXJfbW9kZWxzKFtTcGluYWxHcmFwaF0pOyJdfQ==