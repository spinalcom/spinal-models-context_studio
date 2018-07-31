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
   * @param {Object[]} models
   * @param {Model} [Interactions= new Model()]
   * @param {SpinaNode} [startingNode = new SpinalNode(new AbstractElement(_name, "root"))]
   * @param {SpinalGraph} [relatedGraph=this]
   * @returns A promise of the created Context
   * @memberof SpinalGraph
   */
  async getContext(name, relationsTypesLst, models, Interactions, startingNode, relatedGraph = this) {
    if (typeof this.appsList[name] === "undefined") {
      let context = new _SpinalContext2.default(name, relationsTypesLst, models, Interactions, startingNode, relatedGraph);
      this.appsList.add_attr({
        [name]: new Ptr(context)
      });

      context.type.set("context");

      if (typeof this.appsListByType.context === "undefined") {
        this.appsListByType.add_attr({
          context: new Model()
        });
      }
      this.appsListByType.context.add_attr({
        [name]: this.appsList[name]
      });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TcGluYWxHcmFwaC5qcyJdLCJuYW1lcyI6WyJzcGluYWxDb3JlIiwicmVxdWlyZSIsImdsb2JhbFR5cGUiLCJ3aW5kb3ciLCJnbG9iYWwiLCJTcGluYWxHcmFwaCIsIk1vZGVsIiwiY29uc3RydWN0b3IiLCJfbmFtZSIsIl9zdGFydGluZ05vZGUiLCJQdHIiLCJuYW1lIiwiRmlsZVN5c3RlbSIsIl9zaWdfc2VydmVyIiwiYWRkX2F0dHIiLCJleHRlcm5hbElkTm9kZU1hcHBpbmciLCJndWlkQWJzdHJhY3ROb2RlTWFwcGluZyIsInN0YXJ0aW5nTm9kZSIsIm5vZGVMaXN0IiwiTHN0Iiwibm9kZUxpc3RCeUVsZW1lbnRUeXBlIiwicmVsYXRpb25MaXN0IiwicmVsYXRpb25MaXN0QnlUeXBlIiwiYXBwc0xpc3QiLCJhcHBzTGlzdEJ5VHlwZSIsInJlc2VydmVkUmVsYXRpb25zTmFtZXMiLCJpbml0Iiwic3BpbmFsIiwiY29udGV4dFN0dWRpbyIsImdyYXBoIiwiU3BpbmFsTm9kZSIsIlNwaW5hbFJlbGF0aW9uIiwiQWJzdHJhY3RFbGVtZW50IiwiQklNRWxlbWVudCIsIlNwaW5hbE5ldHdvcmsiLCJTcGluYWxEZXZpY2UiLCJTcGluYWxFbmRwb2ludCIsIlV0aWxpdGllcyIsImdldE5vZGVCeWRiSWQiLCJfZGJJZCIsIl9leHRlcm5hbElkIiwiZ2V0RXh0ZXJuYWxJZCIsIkJJTUVsZW1lbnQxIiwiaW5pdEV4dGVybmFsSWQiLCJub2RlIiwiYWRkTm9kZUFzeW5jIiwidHlwZSIsImdldCIsImJpbmQiLCJfY2xhc3NpZnlCSU1FbGVtZW50Tm9kZSIsIl9ub2RlIiwiY2xhc3NpZnlOb2RlIiwiZ2V0RGJJZEJ5Tm9kZSIsImVsZW1lbnQiLCJwcm9taXNlTG9hZCIsImlkIiwic2V0TmFtZSIsInNldCIsInNldFN0YXJ0aW5nTm9kZSIsIl9hZGRFeHRlcm5hbElkTm9kZU1hcHBpbmdFbnRyeSIsIl9FbGVtZW50SWQiLCJfZGJpZCIsImV4dGVybmFsSWQiLCJ1bmJpbmQiLCJfZWxlbWVudCIsImluaXRFeHRlcm5hbElkQXN5bmMiLCJjb25zb2xlIiwibG9nIiwiYWRkTm9kZSIsInRoZW4iLCJyZWxhdGVkR3JhcGgiLCJsb2FkIiwicHVzaCIsIm5vZGVMaXN0T2ZUeXBlIiwiYWRkU2ltcGxlUmVsYXRpb25Bc3luYyIsIl9yZWxhdGlvblR5cGUiLCJfaXNEaXJlY3RlZCIsImlzUmVzZXJ2ZWQiLCJub2RlMiIsInJlbCIsImFkZFJlbGF0aW9uIiwiYWRkU2ltcGxlUmVsYXRpb24iLCJyZWxhdGlvblR5cGUiLCJpc0RpcmVjdGVkIiwiYWRkU2ltcGxlUmVsYXRpb25CeUFwcCIsImFwcE5hbWUiLCJoYXNSZXNlcnZhdGlvbkNyZWRlbnRpYWxzIiwiY29udGFpbnNBcHAiLCJlcnJvciIsInJlbGF0aW9uIiwiaW5kZXgiLCJub2RlTGlzdDEiLCJsZW5ndGgiLCJhZGREaXJlY3RlZFJlbGF0aW9uUGFyZW50Iiwibm9kZUxpc3QyIiwiYWRkRGlyZWN0ZWRSZWxhdGlvbkNoaWxkIiwiYWRkTm9uRGlyZWN0ZWRSZWxhdGlvbiIsIl9jbGFzc2lmeVJlbGF0aW9uIiwiYWRkUmVsYXRpb25zIiwiX3JlbGF0aW9ucyIsInJlbGF0aW9uTGlzdE9mVHlwZSIsImFwcCIsIl9jbGFzc2lmeVJlbGF0aW9ucyIsIl9hZGROb3RFeGlzdGluZ05vZGVzRnJvbUxpc3QiLCJfbGlzdCIsImkiLCJjb250YWluc0xzdEJ5SWQiLCJfYWRkTm90RXhpc3RpbmdOb2Rlc0Zyb21SZWxhdGlvbiIsIl9yZWxhdGlvbiIsImdldEFwcHNCeVR5cGUiLCJhcHBUeXBlIiwiZ2V0Q29udGV4dCIsInJlbGF0aW9uc1R5cGVzTHN0IiwibW9kZWxzIiwiSW50ZXJhY3Rpb25zIiwiY29udGV4dCIsIlNwaW5hbENvbnRleHQiLCJnZXRBcHAiLCJyZWxhdGVkU3BpbmFsR3JhcGgiLCJzcGluYWxBcHBsaWNhdGlvbiIsIlNwaW5hbEFwcGxpY2F0aW9uIiwiZ2V0QXBwc05hbWVzIiwiX2F0dHJpYnV0ZV9uYW1lcyIsInJlc2VydmVVbmlxdWVSZWxhdGlvblR5cGUiLCJhZGRSZWxhdGlvblR5cGUiLCJyZWdpc3Rlcl9tb2RlbHMiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUVBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUVBOzs7O0FBWkEsTUFBTUEsYUFBYUMsUUFBUSx5QkFBUixDQUFuQjtBQUNBLE1BQU1DLGFBQWEsT0FBT0MsTUFBUCxLQUFrQixXQUFsQixHQUFnQ0MsTUFBaEMsR0FBeUNELE1BQTVEOztBQWNBOzs7OztBQUtBLE1BQU1FLFdBQU4sU0FBMEJILFdBQVdJLEtBQXJDLENBQTJDO0FBQ3pDOzs7Ozs7QUFNQUMsY0FBWUMsUUFBUSxHQUFwQixFQUF5QkMsZ0JBQWdCLElBQUlDLEdBQUosQ0FBUSxDQUFSLENBQXpDLEVBQXFEQyxPQUFPLGFBQTVELEVBQTJFO0FBQ3pFO0FBQ0EsUUFBSUMsV0FBV0MsV0FBZixFQUE0QjtBQUMxQixXQUFLQyxRQUFMLENBQWM7QUFDWkgsY0FBTUgsS0FETTtBQUVaTywrQkFBdUIsSUFBSVQsS0FBSixFQUZYO0FBR1pVLGlDQUF5QixJQUFJVixLQUFKLEVBSGI7QUFJWlcsc0JBQWNSLGFBSkY7QUFLWlMsa0JBQVUsSUFBSVIsR0FBSixDQUFRLElBQUlTLEdBQUosRUFBUixDQUxFO0FBTVpDLCtCQUF1QixJQUFJZCxLQUFKLEVBTlg7QUFPWmUsc0JBQWMsSUFBSVgsR0FBSixDQUFRLElBQUlTLEdBQUosRUFBUixDQVBGO0FBUVpHLDRCQUFvQixJQUFJaEIsS0FBSixFQVJSO0FBU1ppQixrQkFBVSxJQUFJakIsS0FBSixFQVRFO0FBVVprQix3QkFBZ0IsSUFBSWxCLEtBQUosRUFWSjtBQVdabUIsZ0NBQXdCLElBQUluQixLQUFKO0FBWFosT0FBZDtBQWFEO0FBQ0Y7QUFDRDs7OztBQUlBb0IsU0FBTztBQUNMeEIsZUFBV3lCLE1BQVgsQ0FBa0JDLGFBQWxCLEdBQWtDLEVBQWxDO0FBQ0ExQixlQUFX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LEtBQUtsRyxRQUFMLENBQWNtRyxnQkFBckI7QUFDRDtBQUNEOzs7Ozs7OztBQVFBQyw0QkFBMEJ6QyxZQUExQixFQUF3Q21CLEdBQXhDLEVBQTZDO0FBQzNDLFFBQ0UsT0FBTyxLQUFLNUUsc0JBQUwsQ0FBNEJ5RCxZQUE1QixDQUFQLEtBQXFELFdBQXJELElBQ0EsT0FBTyxLQUFLNUQsa0JBQUwsQ0FBd0I0RCxZQUF4QixDQUFQLEtBQWlELFdBRm5ELEVBR0U7QUFDQSxXQUFLekQsc0JBQUwsQ0FBNEJYLFFBQTVCLENBQXFDO0FBQ25DLFNBQUNvRSxZQUFELEdBQWdCbUIsSUFBSTFGLElBQUosQ0FBU29DLEdBQVQ7QUFEbUIsT0FBckM7QUFHQXNELFVBQUl1QixlQUFKLENBQW9CMUMsWUFBcEI7QUFDQSxhQUFPLElBQVA7QUFDRCxLQVRELE1BU08sSUFDTCxPQUFPLEtBQUt6RCxzQkFBTCxDQUE0QnlELFlBQTVCLENBQVAsS0FBcUQsV0FEaEQsRUFFTDtBQUNBaEIsY0FBUXNCLEtBQVIsQ0FDRU4sZUFDQSw4QkFEQSxHQUVBbUIsSUFBSTFGLElBQUosQ0FBU29DLEdBQVQsRUFGQSxHQUdBLCtCQUhBLEdBSUEsS0FBS3RCLHNCQUFMLENBQTRCeUQsWUFBNUIsQ0FMRjtBQU9BLGFBQU8sS0FBUDtBQUNELEtBWE0sTUFXQSxJQUFJLE9BQU8sS0FBSzVELGtCQUFMLENBQXdCNEQsWUFBeEIsQ0FBUCxLQUFpRCxXQUFyRCxFQUFrRTtBQUN2RWhCLGNBQVFzQixLQUFSLENBQ0VOLGVBQ0EsOEJBREEsR0FFQW1CLElBQUkxRixJQUFKLENBQVNvQyxHQUFULEVBRkEsR0FHQSxxQ0FKRjtBQU1EO0FBQ0Y7QUF6b0J3Qzs7a0JBNG9CNUIxQyxXOztBQUNmTCxXQUFXNkgsZUFBWCxDQUEyQixDQUFDeEgsV0FBRCxDQUEzQiIsImZpbGUiOiJTcGluYWxHcmFwaC5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHNwaW5hbENvcmUgPSByZXF1aXJlKFwic3BpbmFsLWNvcmUtY29ubmVjdG9yanNcIik7XG5jb25zdCBnbG9iYWxUeXBlID0gdHlwZW9mIHdpbmRvdyA9PT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHdpbmRvdztcbmltcG9ydCBTcGluYWxOb2RlIGZyb20gXCIuL1NwaW5hbE5vZGVcIjtcbmltcG9ydCBTcGluYWxSZWxhdGlvbiBmcm9tIFwiLi9TcGluYWxSZWxhdGlvblwiO1xuaW1wb3J0IEFic3RyYWN0RWxlbWVudCBmcm9tIFwiLi9BYnN0cmFjdEVsZW1lbnRcIjtcbmltcG9ydCBCSU1FbGVtZW50IGZyb20gXCIuL0JJTUVsZW1lbnRcIjtcbmltcG9ydCBTcGluYWxBcHBsaWNhdGlvbiBmcm9tIFwiLi9TcGluYWxBcHBsaWNhdGlvblwiO1xuaW1wb3J0IFNwaW5hbENvbnRleHQgZnJvbSBcIi4vU3BpbmFsQ29udGV4dFwiO1xuaW1wb3J0IFNwaW5hbE5ldHdvcmsgZnJvbSBcIi4vU3BpbmFsTmV0d29ya1wiO1xuaW1wb3J0IFNwaW5hbERldmljZSBmcm9tIFwiLi9TcGluYWxEZXZpY2VcIjtcbmltcG9ydCBTcGluYWxFbmRwb2ludCBmcm9tIFwiLi9TcGluYWxFbmRwb2ludFwiO1xuXG5pbXBvcnQge1xuICBVdGlsaXRpZXNcbn0gZnJvbSBcIi4vVXRpbGl0aWVzXCI7XG4vKipcbiAqIFRoZSBjb3JlIG9mIHRoZSBpbnRlcmFjdGlvbnMgYmV0d2VlbiB0aGUgQklNRWxlbWVudHMgTm9kZXMgYW5kIG90aGVyIE5vZGVzKERvY3MsIFRpY2tldHMsIGV0YyAuLilcbiAqIEBjbGFzcyBTcGluYWxHcmFwaFxuICogQGV4dGVuZHMge01vZGVsfVxuICovXG5jbGFzcyBTcGluYWxHcmFwaCBleHRlbmRzIGdsb2JhbFR5cGUuTW9kZWwge1xuICAvKipcbiAgICpDcmVhdGVzIGFuIGluc3RhbmNlIG9mIFNwaW5hbEdyYXBoLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gW19uYW1lPXRdXG4gICAqIEBwYXJhbSB7UHRyfSBbX3N0YXJ0aW5nTm9kZT1uZXcgUHRyKDApXVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIGNvbnN0cnVjdG9yKF9uYW1lID0gXCJ0XCIsIF9zdGFydGluZ05vZGUgPSBuZXcgUHRyKDApLCBuYW1lID0gXCJTcGluYWxHcmFwaFwiKSB7XG4gICAgc3VwZXIoKTtcbiAgICBpZiAoRmlsZVN5c3RlbS5fc2lnX3NlcnZlcikge1xuICAgICAgdGhpcy5hZGRfYXR0cih7XG4gICAgICAgIG5hbWU6IF9uYW1lLFxuICAgICAgICBleHRlcm5hbElkTm9kZU1hcHBpbmc6IG5ldyBNb2RlbCgpLFxuICAgICAgICBndWlkQWJzdHJhY3ROb2RlTWFwcGluZzogbmV3IE1vZGVsKCksXG4gICAgICAgIHN0YXJ0aW5nTm9kZTogX3N0YXJ0aW5nTm9kZSxcbiAgICAgICAgbm9kZUxpc3Q6IG5ldyBQdHIobmV3IExzdCgpKSxcbiAgICAgICAgbm9kZUxpc3RCeUVsZW1lbnRUeXBlOiBuZXcgTW9kZWwoKSxcbiAgICAgICAgcmVsYXRpb25MaXN0OiBuZXcgUHRyKG5ldyBMc3QoKSksXG4gICAgICAgIHJlbGF0aW9uTGlzdEJ5VHlwZTogbmV3IE1vZGVsKCksXG4gICAgICAgIGFwcHNMaXN0OiBuZXcgTW9kZWwoKSxcbiAgICAgICAgYXBwc0xpc3RCeVR5cGU6IG5ldyBNb2RlbCgpLFxuICAgICAgICByZXNlcnZlZFJlbGF0aW9uc05hbWVzOiBuZXcgTW9kZWwoKVxuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKmZ1bmN0aW9uXG4gICAqVG8gcHV0IHVzZWQgZnVuY3Rpb25zIGFzIHdlbGwgYXMgdGhlIFNwaW5hbEdyYXBoIG1vZGVsIGluIHRoZSBnbG9iYWwgc2NvcGVcbiAgICovXG4gIGluaXQoKSB7XG4gICAgZ2xvYmFsVHlwZS5zcGluYWwuY29udGV4dFN0dWRpbyA9IHt9O1xuICAgIGdsb2JhbFR5cGUuc3BpbmFsLmNvbnRleHRTdHVkaW8uZ3JhcGggPSB0aGlzO1xuICAgIGdsb2JhbFR5cGUuc3BpbmFsLmNvbnRleHRTdHVkaW8uU3BpbmFsTm9kZSA9IFNwaW5hbE5vZGU7XG4gICAgZ2xvYmFsVHlwZS5zcGluYWwuY29udGV4dFN0dWRpby5TcGluYWxSZWxhdGlvbiA9IFNwaW5hbFJlbGF0aW9uO1xuICAgIGdsb2JhbFR5cGUuc3BpbmFsLmNvbnRleHRTdHVkaW8uQWJzdHJhY3RFbGVtZW50ID0gQWJzdHJhY3RFbGVtZW50O1xuICAgIGdsb2JhbFR5cGUuc3BpbmFsLmNvbnRleHRTdHVkaW8uQklNRWxlbWVudCA9IEJJTUVsZW1lbnQ7XG4gICAgZ2xvYmFsVHlwZS5zcGluYWwuY29udGV4dFN0dWRpby5TcGluYWxOZXR3b3JrID0gU3BpbmFsTmV0d29yaztcbiAgICBnbG9iYWxUeXBlLnNwaW5hbC5jb250ZXh0U3R1ZGlvLlNwaW5hbERldmljZSA9IFNwaW5hbERldmljZTtcbiAgICBnbG9iYWxUeXBlLnNwaW5hbC5jb250ZXh0U3R1ZGlvLlNwaW5hbEVuZHBvaW50ID0gU3BpbmFsRW5kcG9pbnQ7XG4gICAgZ2xvYmFsVHlwZS5zcGluYWwuY29udGV4dFN0dWRpby5VdGlsaXRpZXMgPSBVdGlsaXRpZXM7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBfZGJJZFxuICAgKiBAcmV0dXJucyBQcm9taXNlIG9mIHRoZSBjb3JyZXNwb25kaW5nIE5vZGUgb3IgdGhlIGNyZWF0ZWQgb25lIGlmIG5vdCBleGlzdGluZ1xuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIGFzeW5jIGdldE5vZGVCeWRiSWQoX2RiSWQpIHtcbiAgICBsZXQgX2V4dGVybmFsSWQgPSBhd2FpdCBVdGlsaXRpZXMuZ2V0RXh0ZXJuYWxJZChfZGJJZCk7XG4gICAgaWYgKHR5cGVvZiB0aGlzLmV4dGVybmFsSWROb2RlTWFwcGluZ1tfZXh0ZXJuYWxJZF0gIT09IFwidW5kZWZpbmVkXCIpXG4gICAgICByZXR1cm4gdGhpcy5leHRlcm5hbElkTm9kZU1hcHBpbmdbX2V4dGVybmFsSWRdO1xuICAgIGVsc2Uge1xuICAgICAgbGV0IEJJTUVsZW1lbnQxID0gbmV3IEJJTUVsZW1lbnQoX2RiSWQpO1xuICAgICAgQklNRWxlbWVudDEuaW5pdEV4dGVybmFsSWQoKTtcbiAgICAgIGxldCBub2RlID0gYXdhaXQgdGhpcy5hZGROb2RlQXN5bmMoQklNRWxlbWVudDEpO1xuICAgICAgaWYgKEJJTUVsZW1lbnQxLnR5cGUuZ2V0KCkgPT09IFwiXCIpIHtcbiAgICAgICAgQklNRWxlbWVudDEudHlwZS5iaW5kKHRoaXMuX2NsYXNzaWZ5QklNRWxlbWVudE5vZGUuYmluZCh0aGlzLCBub2RlKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbm9kZTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZX0gX25vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBhc3luYyBfY2xhc3NpZnlCSU1FbGVtZW50Tm9kZShfbm9kZSkge1xuICAgIC8vVE9ETyBERUxFVEUgT0xEIENMQVNTSUZJQ0FUSU9OXG4gICAgdGhpcy5jbGFzc2lmeU5vZGUoX25vZGUpO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGV9IF9ub2RlXG4gICAqIEByZXR1cm5zIFByb21pc2Ugb2YgZGJJZCBbbnVtYmVyXVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIGFzeW5jIGdldERiSWRCeU5vZGUoX25vZGUpIHtcbiAgICBsZXQgZWxlbWVudCA9IGF3YWl0IFV0aWxpdGllcy5wcm9taXNlTG9hZChfbm9kZS5lbGVtZW50KTtcbiAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEJJTUVsZW1lbnQpIHtcbiAgICAgIHJldHVybiBlbGVtZW50LmlkLmdldCgpO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IF9uYW1lXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgc2V0TmFtZShfbmFtZSkge1xuICAgIHRoaXMubmFtZS5zZXQoX25hbWUpO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1B0cn0gX3N0YXJ0aW5nTm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIHNldFN0YXJ0aW5nTm9kZShfc3RhcnRpbmdOb2RlKSB7XG4gICAgdGhpcy5zdGFydGluZ05vZGUuc2V0KF9zdGFydGluZ05vZGUpO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gX0VsZW1lbnRJZCAtIHRoZSBFbGVtZW50IEV4dGVybmFsSWRcbiAgICogQHBhcmFtIHtTcGluYWxOb2RlfSBfbm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIGFzeW5jIF9hZGRFeHRlcm5hbElkTm9kZU1hcHBpbmdFbnRyeShfRWxlbWVudElkLCBfbm9kZSkge1xuICAgIGxldCBfZGJpZCA9IF9FbGVtZW50SWQuZ2V0KCk7XG4gICAgaWYgKHR5cGVvZiBfZGJpZCA9PSBcIm51bWJlclwiKVxuICAgICAgaWYgKF9kYmlkICE9IDApIHtcbiAgICAgICAgbGV0IGV4dGVybmFsSWQgPSBhd2FpdCBVdGlsaXRpZXMuZ2V0RXh0ZXJuYWxJZChfZGJpZCk7XG4gICAgICAgIGxldCBlbGVtZW50ID0gYXdhaXQgVXRpbGl0aWVzLnByb21pc2VMb2FkKF9ub2RlLmVsZW1lbnQpO1xuICAgICAgICBhd2FpdCBlbGVtZW50LmluaXRFeHRlcm5hbElkKCk7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5leHRlcm5hbElkTm9kZU1hcHBpbmdbZXh0ZXJuYWxJZF0gPT09IFwidW5kZWZpbmVkXCIpXG4gICAgICAgICAgdGhpcy5leHRlcm5hbElkTm9kZU1hcHBpbmcuYWRkX2F0dHIoe1xuICAgICAgICAgICAgW2V4dGVybmFsSWRdOiBfbm9kZVxuICAgICAgICAgIH0pO1xuICAgICAgICBfRWxlbWVudElkLnVuYmluZChcbiAgICAgICAgICB0aGlzLl9hZGRFeHRlcm5hbElkTm9kZU1hcHBpbmdFbnRyeS5iaW5kKHRoaXMsIF9FbGVtZW50SWQsXG4gICAgICAgICAgICBfbm9kZSlcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtNb2RlbH0gX2VsZW1lbnQgLSBhbnkgc3ViY2xhc3Mgb2YgTW9kZWxcbiAgICogQHJldHVybnMgUHJvbWlzZSBvZiB0aGUgY3JlYXRlZCBOb2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgYXN5bmMgYWRkTm9kZUFzeW5jKF9lbGVtZW50KSB7XG4gICAgbGV0IG5hbWUgPSBcIlwiO1xuICAgIGlmIChfZWxlbWVudCBpbnN0YW5jZW9mIEJJTUVsZW1lbnQpIHtcbiAgICAgIGF3YWl0IF9lbGVtZW50LmluaXRFeHRlcm5hbElkQXN5bmMoKTtcbiAgICAgIGlmIChcbiAgICAgICAgdHlwZW9mIHRoaXMuZXh0ZXJuYWxJZE5vZGVNYXBwaW5nW19lbGVtZW50LmV4dGVybmFsSWQuZ2V0KCldICE9PVxuICAgICAgICBcInVuZGVmaW5lZFwiXG4gICAgICApIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJCSU0gT0JKRUNUIE5PREUgQUxSRUFEWSBFWElTVFNcIik7XG4gICAgICAgIHJldHVybiB0aGlzLmV4dGVybmFsSWROb2RlTWFwcGluZ1tfZWxlbWVudC5leHRlcm5hbElkLmdldCgpXTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKF9lbGVtZW50IGluc3RhbmNlb2YgQWJzdHJhY3RFbGVtZW50KSB7XG4gICAgICBpZiAoXG4gICAgICAgIHR5cGVvZiB0aGlzLmd1aWRBYnN0cmFjdE5vZGVNYXBwaW5nW19lbGVtZW50LmlkLmdldCgpXSAhPT1cbiAgICAgICAgXCJ1bmRlZmluZWRcIlxuICAgICAgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQUJTVFJBQ1QgT0JKRUNUIE5PREUgQUxSRUFEWSBFWElTVFNcIik7XG4gICAgICAgIHJldHVybiB0aGlzLmd1aWRBYnN0cmFjdE5vZGVNYXBwaW5nW19lbGVtZW50LmlkLmdldCgpXTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHR5cGVvZiBfZWxlbWVudC5uYW1lICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBuYW1lID0gX2VsZW1lbnQubmFtZS5nZXQoKTtcbiAgICB9XG4gICAgbGV0IG5vZGUgPSBuZXcgU3BpbmFsTm9kZShuYW1lLCBfZWxlbWVudCwgdGhpcyk7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7TW9kZWx9IF9lbGVtZW50IC0gYW55IHN1YmNsYXNzIG9mIE1vZGVsXG4gICAqIEByZXR1cm5zIHRoZSBjcmVhdGVkIE5vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBhZGROb2RlKF9lbGVtZW50KSB7XG4gICAgbGV0IG5hbWUgPSBcIlwiO1xuICAgIGlmIChfZWxlbWVudCBpbnN0YW5jZW9mIEJJTUVsZW1lbnQpIHtcbiAgICAgIF9lbGVtZW50LmluaXRFeHRlcm5hbElkKCk7XG4gICAgICBpZiAoXG4gICAgICAgIHR5cGVvZiB0aGlzLmV4dGVybmFsSWROb2RlTWFwcGluZ1tfZWxlbWVudC5leHRlcm5hbElkLmdldCgpXSAhPT1cbiAgICAgICAgXCJ1bmRlZmluZWRcIlxuICAgICAgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQklNIE9CSkVDVCBOT0RFIEFMUkVBRFkgRVhJU1RTXCIpO1xuICAgICAgICByZXR1cm4gdGhpcy5leHRlcm5hbElkTm9kZU1hcHBpbmdbX2VsZW1lbnQuZXh0ZXJuYWxJZC5nZXQoKV07XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChfZWxlbWVudCBpbnN0YW5jZW9mIEFic3RyYWN0RWxlbWVudCkge1xuICAgICAgaWYgKFxuICAgICAgICB0eXBlb2YgdGhpcy5ndWlkQWJzdHJhY3ROb2RlTWFwcGluZ1tfZWxlbWVudC5pZC5nZXQoKV0gIT09XG4gICAgICAgIFwidW5kZWZpbmVkXCJcbiAgICAgICkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkFCU1RSQUNUIE9CSkVDVCBOT0RFIEFMUkVBRFkgRVhJU1RTXCIpO1xuICAgICAgICByZXR1cm4gdGhpcy5ndWlkQWJzdHJhY3ROb2RlTWFwcGluZ1tfZWxlbWVudC5pZC5nZXQoKV07XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0eXBlb2YgX2VsZW1lbnQubmFtZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgbmFtZSA9IF9lbGVtZW50Lm5hbWUuZ2V0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5hbWUgPSBfZWxlbWVudC5jb25zdHJ1Y3Rvci5uYW1lO1xuICAgIH1cbiAgICBsZXQgbm9kZSA9IG5ldyBTcGluYWxOb2RlKG5hbWUsIF9lbGVtZW50LCB0aGlzKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIC8qKlxuICAgKiAgT2JzZXJ2ZXMgdGhlIHR5cGUgb2YgdGhlIGVsZW1lbnQgaW5zaWRlIHRoZSBub2RlIGFkZCBDbGFzc2lmeSBpdC5cbiAgICogIEl0IHB1dHMgaXQgaW4gdGhlIFVuY2xhc3NpZmllZCBsaXN0IE90aGVyd2lzZS5cbiAgICogSXQgYWRkcyB0aGUgbm9kZSB0byB0aGUgbWFwcGluZyBsaXN0IHdpdGggRXh0ZXJuYWxJZCBpZiB0aGUgT2JqZWN0IGlzIG9mIHR5cGUgQklNRWxlbWVudFxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGV9IF9ub2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgY2xhc3NpZnlOb2RlKF9ub2RlKSB7XG4gICAgVXRpbGl0aWVzLnByb21pc2VMb2FkKF9ub2RlLmVsZW1lbnQpLnRoZW4oZWxlbWVudCA9PiB7XG4gICAgICBpZiAodHlwZW9mIF9ub2RlLnJlbGF0ZWRHcmFwaCA9PT0gXCJ1bmRlZmluZWRcIilcbiAgICAgICAgX25vZGUucmVsYXRlZEdyYXBoLnNldCh0aGlzKTtcbiAgICAgIHRoaXMubm9kZUxpc3QubG9hZChub2RlTGlzdCA9PiB7XG4gICAgICAgIG5vZGVMaXN0LnB1c2goX25vZGUpO1xuICAgICAgfSk7XG4gICAgICBsZXQgdHlwZSA9IFwiVW5jbGFzc2lmaWVkXCI7XG4gICAgICBpZiAodHlwZW9mIGVsZW1lbnQudHlwZSAhPSBcInVuZGVmaW5lZFwiICYmIGVsZW1lbnQudHlwZS5nZXQoKSAhPVxuICAgICAgICBcIlwiKSB7XG4gICAgICAgIHR5cGUgPSBlbGVtZW50LnR5cGUuZ2V0KCk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5ub2RlTGlzdEJ5RWxlbWVudFR5cGVbdHlwZV0pIHtcbiAgICAgICAgdGhpcy5ub2RlTGlzdEJ5RWxlbWVudFR5cGVbdHlwZV0ubG9hZChub2RlTGlzdE9mVHlwZSA9PiB7XG4gICAgICAgICAgbm9kZUxpc3RPZlR5cGUucHVzaChfbm9kZSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IG5vZGVMaXN0T2ZUeXBlID0gbmV3IExzdCgpO1xuICAgICAgICBub2RlTGlzdE9mVHlwZS5wdXNoKF9ub2RlKTtcbiAgICAgICAgdGhpcy5ub2RlTGlzdEJ5RWxlbWVudFR5cGUuYWRkX2F0dHIoe1xuICAgICAgICAgIFt0eXBlXTogbmV3IFB0cihub2RlTGlzdE9mVHlwZSlcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEJJTUVsZW1lbnQpIHtcbiAgICAgICAgbGV0IF9kYmlkID0gZWxlbWVudC5pZC5nZXQoKTtcbiAgICAgICAgaWYgKHR5cGVvZiBfZGJpZCA9PSBcIm51bWJlclwiKVxuICAgICAgICAgIGlmIChfZGJpZCAhPSAwKSB7XG4gICAgICAgICAgICB0aGlzLl9hZGRFeHRlcm5hbElkTm9kZU1hcHBpbmdFbnRyeShlbGVtZW50LmlkLCBfbm9kZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsZW1lbnQuaWQuYmluZChcbiAgICAgICAgICAgICAgdGhpcy5fYWRkRXh0ZXJuYWxJZE5vZGVNYXBwaW5nRW50cnkuYmluZChudWxsLCBlbGVtZW50LmlkLFxuICAgICAgICAgICAgICAgIF9ub2RlKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBBYnN0cmFjdEVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5ndWlkQWJzdHJhY3ROb2RlTWFwcGluZy5hZGRfYXR0cih7XG4gICAgICAgICAgW2VsZW1lbnQuaWQuZ2V0KCldOiBfbm9kZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8vIGFkZE5vZGVzKF92ZXJ0aWNlcykge1xuICAvLyAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBfdmVydGljZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gIC8vICAgICB0aGlzLmNsYXNzaWZ5Tm9kZShfdmVydGljZXNbaW5kZXhdKVxuICAvLyAgIH1cbiAgLy8gfVxuICAvKipcbiAgICogIEl0IGNyZWF0ZXMgdGhlIG5vZGUgY29ycmVzcG9uZGluZyB0byB0aGUgX2VsZW1lbnQsXG4gICAqIHRoZW4gaXQgY3JlYXRlcyBhIHNpbXBsZSByZWxhdGlvbiBvZiBjbGFzcyBTcGluYWxSZWxhdGlvbiBvZiB0eXBlOl90eXBlLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gX3JlbGF0aW9uVHlwZVxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGV9IF9ub2RlXG4gICAqIEBwYXJhbSB7TW9kZWx9IF9lbGVtZW50IC0gYW55IHN1YmNsYXNzIG9mIE1vZGVsXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW19pc0RpcmVjdGVkPWZhbHNlXVxuICAgKiBAcmV0dXJucyBhIFByb21pc2Ugb2YgdGhlIGNyZWF0ZWQgcmVsYXRpb25cbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBhc3luYyBhZGRTaW1wbGVSZWxhdGlvbkFzeW5jKFxuICAgIF9yZWxhdGlvblR5cGUsXG4gICAgX25vZGUsXG4gICAgX2VsZW1lbnQsXG4gICAgX2lzRGlyZWN0ZWQgPSBmYWxzZVxuICApIHtcbiAgICBpZiAoIXRoaXMuaXNSZXNlcnZlZChfcmVsYXRpb25UeXBlKSkge1xuICAgICAgbGV0IG5vZGUyID0gYXdhaXQgdGhpcy5hZGROb2RlQXN5bmMoX2VsZW1lbnQpO1xuICAgICAgbGV0IHJlbCA9IG5ldyBTcGluYWxSZWxhdGlvbihcbiAgICAgICAgX3JlbGF0aW9uVHlwZSwgW19ub2RlXSwgW25vZGUyXSxcbiAgICAgICAgX2lzRGlyZWN0ZWRcbiAgICAgICk7XG4gICAgICB0aGlzLmFkZFJlbGF0aW9uKHJlbCk7XG4gICAgICByZXR1cm4gcmVsO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgX3JlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGlzIHJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW19yZWxhdGlvblR5cGVdXG4gICAgICApO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICogIEl0IGNyZWF0ZXMgdGhlIG5vZGUgY29ycmVzcG9uZGluZyB0byB0aGUgX2VsZW1lbnQsXG4gICAqIHRoZW4gaXQgY3JlYXRlcyBhIHNpbXBsZSByZWxhdGlvbiBvZiBjbGFzcyBTcGluYWxSZWxhdGlvbiBvZiB0eXBlOl90eXBlLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZX0gbm9kZVxuICAgKiBAcGFyYW0ge01vZGVsfSBlbGVtZW50IC0gYW55IHN1YmNsYXNzIG9mIE1vZGVsXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGlyZWN0ZWQ9ZmFsc2VdXG4gICAqIEByZXR1cm5zIGEgUHJvbWlzZSBvZiB0aGUgY3JlYXRlZCByZWxhdGlvblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIGFkZFNpbXBsZVJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgbm9kZSwgZWxlbWVudCwgaXNEaXJlY3RlZCA9IGZhbHNlKSB7XG4gICAgaWYgKCF0aGlzLmlzUmVzZXJ2ZWQoX3JlbGF0aW9uVHlwZSkpIHtcbiAgICAgIGxldCBub2RlMiA9IHRoaXMuYWRkTm9kZShlbGVtZW50KTtcbiAgICAgIGxldCByZWwgPSBuZXcgU3BpbmFsUmVsYXRpb24ocmVsYXRpb25UeXBlLCBbbm9kZV0sIFtub2RlMl0sXG4gICAgICAgIGlzRGlyZWN0ZWQpO1xuICAgICAgdGhpcy5hZGRSZWxhdGlvbihyZWwpO1xuICAgICAgcmV0dXJuIHJlbDtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIF9yZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tfcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHBhcmFtIHtTcGluYWxOb2RlfSBub2RlXG4gICAqIEBwYXJhbSB7TW9kZWx9IGVsZW1lbnQgLSBhbnkgc3ViY2xhc3Mgb2YgTW9kZWxcbiAgICogQHBhcmFtIHtib29sZWFufSBbaXNEaXJlY3RlZD1mYWxzZV1cbiAgICogQHJldHVybnMgdGhlIGNyZWF0ZWQgUmVsYXRpb24sIHVuZGVmaW5lZCBvdGhlcndpc2VcbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBhZGRTaW1wbGVSZWxhdGlvbkJ5QXBwKFxuICAgIGFwcE5hbWUsXG4gICAgcmVsYXRpb25UeXBlLFxuICAgIG5vZGUsXG4gICAgZWxlbWVudCxcbiAgICBpc0RpcmVjdGVkID0gZmFsc2VcbiAgKSB7XG4gICAgaWYgKHRoaXMuaGFzUmVzZXJ2YXRpb25DcmVkZW50aWFscyhfcmVsYXRpb25UeXBlLCBhcHBOYW1lKSkge1xuICAgICAgaWYgKHRoaXMuY29udGFpbnNBcHAoYXBwTmFtZSkpIHtcbiAgICAgICAgbGV0IG5vZGUyID0gdGhpcy5hZGROb2RlKGVsZW1lbnQpO1xuICAgICAgICBsZXQgcmVsID0gbmV3IFNwaW5hbFJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgW25vZGVdLCBbbm9kZTJdLFxuICAgICAgICAgIGlzRGlyZWN0ZWQpO1xuICAgICAgICB0aGlzLmFkZFJlbGF0aW9uKHJlbCwgYXBwTmFtZSk7XG4gICAgICAgIHJldHVybiByZWw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKGFwcE5hbWUgKyBcIiBkb2VzIG5vdCBleGlzdFwiKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIF9yZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tfcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb259IHJlbGF0aW9uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgYWRkUmVsYXRpb24ocmVsYXRpb24sIGFwcE5hbWUpIHtcbiAgICBpZiAodGhpcy5oYXNSZXNlcnZhdGlvbkNyZWRlbnRpYWxzKHJlbGF0aW9uLnR5cGUuZ2V0KCksIGFwcE5hbWUpKSB7XG4gICAgICBpZiAocmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKSkge1xuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcmVsYXRpb24ubm9kZUxpc3QxLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgIGNvbnN0IG5vZGUgPSByZWxhdGlvbi5ub2RlTGlzdDFbaW5kZXhdO1xuICAgICAgICAgIG5vZGUuYWRkRGlyZWN0ZWRSZWxhdGlvblBhcmVudChyZWxhdGlvbiwgYXBwTmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHJlbGF0aW9uLm5vZGVMaXN0Mi5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICBjb25zdCBub2RlID0gcmVsYXRpb24ubm9kZUxpc3QyW2luZGV4XTtcbiAgICAgICAgICBub2RlLmFkZERpcmVjdGVkUmVsYXRpb25DaGlsZChyZWxhdGlvbiwgYXBwTmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCByZWxhdGlvbi5ub2RlTGlzdDEubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgY29uc3Qgbm9kZSA9IHJlbGF0aW9uLm5vZGVMaXN0MVtpbmRleF07XG4gICAgICAgICAgbm9kZS5hZGROb25EaXJlY3RlZFJlbGF0aW9uKHJlbGF0aW9uLCBhcHBOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcmVsYXRpb24ubm9kZUxpc3QyLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgIGNvbnN0IG5vZGUgPSByZWxhdGlvbi5ub2RlTGlzdDJbaW5kZXhdO1xuICAgICAgICAgIG5vZGUuYWRkTm9uRGlyZWN0ZWRSZWxhdGlvbihyZWxhdGlvbiwgYXBwTmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuX2NsYXNzaWZ5UmVsYXRpb24ocmVsYXRpb24sIGFwcE5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb24udHlwZS5nZXQoKSArXG4gICAgICAgIFwiIGlzIHJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uLnR5cGUuZ2V0KCldXG4gICAgICApO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbltdfSBfcmVsYXRpb25zXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgYWRkUmVsYXRpb25zKF9yZWxhdGlvbnMpIHtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX3JlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IHJlbGF0aW9uID0gX3JlbGF0aW9uc1tpbmRleF07XG4gICAgICB0aGlzLmFkZFJlbGF0aW9uKHJlbGF0aW9uKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFscmVsYXRpb259IHJlbGF0aW9uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgX2NsYXNzaWZ5UmVsYXRpb24ocmVsYXRpb24sIGFwcE5hbWUpIHtcbiAgICB0aGlzLnJlbGF0aW9uTGlzdC5sb2FkKHJlbGF0aW9uTGlzdCA9PiB7XG4gICAgICByZWxhdGlvbkxpc3QucHVzaChyZWxhdGlvbik7XG4gICAgfSk7XG4gICAgaWYgKHRoaXMucmVsYXRpb25MaXN0QnlUeXBlW3JlbGF0aW9uLnR5cGUuZ2V0KCldKSB7XG4gICAgICB0aGlzLnJlbGF0aW9uTGlzdEJ5VHlwZVtyZWxhdGlvbi50eXBlLmdldCgpXS5sb2FkKHJlbGF0aW9uTGlzdE9mVHlwZSA9PiB7XG4gICAgICAgIHJlbGF0aW9uTGlzdE9mVHlwZS5wdXNoKHJlbGF0aW9uKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcmVsYXRpb25MaXN0T2ZUeXBlID0gbmV3IExzdCgpO1xuICAgICAgcmVsYXRpb25MaXN0T2ZUeXBlLnB1c2gocmVsYXRpb24pO1xuICAgICAgdGhpcy5yZWxhdGlvbkxpc3RCeVR5cGUuYWRkX2F0dHIoe1xuICAgICAgICBbcmVsYXRpb24udHlwZS5nZXQoKV06IG5ldyBQdHIocmVsYXRpb25MaXN0T2ZUeXBlKVxuICAgICAgfSk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgYXBwTmFtZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgaWYgKHRoaXMuY29udGFpbnNBcHAoYXBwTmFtZSkpXG4gICAgICAgIHRoaXMuYXBwc0xpc3RbYXBwTmFtZV0ubG9hZChhcHAgPT4ge1xuICAgICAgICAgIGlmICh0eXBlb2YgYXBwW3JlbGF0aW9uLnR5cGUuZ2V0KCldID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICBhcHAuYWRkUmVsYXRpb24ocmVsYXRpb24pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKmNoZWNrcyBpZiB0aGlzIGdyYXBoIGNvbnRhaW5zIGNvbnRhaW5zIGEgc3BlY2lmaWMgQXBwXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEByZXR1cm5zIEJvb2xlYW5cbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBjb250YWluc0FwcChhcHBOYW1lKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB0aGlzLmFwcHNMaXN0W2FwcE5hbWVdICE9PSBcInVuZGVmaW5lZFwiO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBpc1Jlc2VydmVkKHJlbGF0aW9uVHlwZSkge1xuICAgIHJldHVybiB0eXBlb2YgdGhpcy5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uVHlwZV0gIT09IFwidW5kZWZpbmVkXCI7XG4gIH1cbiAgLyoqXG4gICAqICBjaGVja3MgaWYgdGhlIGFwcCBoYXMgdGhlIHJpZ2h0IHRvIHVzZSBhIHJlc2VydmVkIHJlbGF0aW9uXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFwcE5hbWVcbiAgICogQHJldHVybnMgYm9vbGVhblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIGhhc1Jlc2VydmF0aW9uQ3JlZGVudGlhbHMocmVsYXRpb25UeXBlLCBhcHBOYW1lKSB7XG4gICAgcmV0dXJuICghdGhpcy5pc1Jlc2VydmVkKHJlbGF0aW9uVHlwZSkgfHxcbiAgICAgICh0aGlzLmlzUmVzZXJ2ZWQocmVsYXRpb25UeXBlKSAmJlxuICAgICAgICB0aGlzLnJlc2VydmVkUmVsYXRpb25zTmFtZXMocmVsYXRpb25UeXBlKSA9PT0gYXBwTmFtZSlcbiAgICApO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9uc30gcmVsYXRpb25zXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgX2NsYXNzaWZ5UmVsYXRpb25zKF9yZWxhdGlvbnMpIHtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX3JlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHRoaXMuX2NsYXNzaWZ5UmVsYXRpb24oX3JlbGF0aW9uc1tpbmRleF0pO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxOb2RlW119IF9saXN0XG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgX2FkZE5vdEV4aXN0aW5nTm9kZXNGcm9tTGlzdChfbGlzdCkge1xuICAgIHRoaXMubm9kZUxpc3QubG9hZChub2RlTGlzdCA9PiB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IF9saXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxldCBub2RlID0gX2xpc3RbaV07XG4gICAgICAgIGlmICghVXRpbGl0aWVzLmNvbnRhaW5zTHN0QnlJZChub2RlTGlzdCwgbm9kZSkpIHtcbiAgICAgICAgICB0aGlzLmNsYXNzaWZ5Tm9kZShub2RlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9uW119IF9yZWxhdGlvblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIF9hZGROb3RFeGlzdGluZ05vZGVzRnJvbVJlbGF0aW9uKF9yZWxhdGlvbikge1xuICAgIHRoaXMuX2FkZE5vdEV4aXN0aW5nTm9kZXNGcm9tTGlzdChfcmVsYXRpb24ubm9kZUxpc3QxKTtcbiAgICB0aGlzLl9hZGROb3RFeGlzdGluZ05vZGVzRnJvbUxpc3QoX3JlbGF0aW9uLm5vZGVMaXN0Mik7XG4gIH1cblxuICAvLyBhc3luYyBnZXRBbGxDb250ZXh0cygpIHtcbiAgLy8gICBsZXQgcmVzID0gW11cbiAgLy8gICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5hcHBzTGlzdC5fYXR0cmlidXRlX25hbWVzLmxlbmd0aDsgaW5kZXgrKykge1xuICAvLyAgICAgbGV0IGtleSA9IHRoaXMuYXBwc0xpc3QuX2F0dHJpYnV0ZV9uYW1lc1tpbmRleF1cbiAgLy8gICAgIGlmIChrZXkuaW5jbHVkZXMoXCJfQ1wiLCBrZXkubGVuZ3RoIC0gMikpIHtcbiAgLy8gICAgICAgY29uc3QgY29udGV4dCA9IHRoaXMuYXBwc0xpc3Rba2V5XTtcbiAgLy8gICAgICAgcmVzLnB1c2goYXdhaXQgVXRpbGl0aWVzLnByb21pc2VMb2FkKGNvbnRleHQpKVxuICAvLyAgICAgfVxuXG4gIC8vICAgfVxuICAvLyAgIHJldHVybiByZXM7XG4gIC8vIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBUeXBlXG4gICAqIEByZXR1cm5zIGFsbCBBcHBzIG9mIGEgc3BlY2lmaWMgdHlwZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIGFzeW5jIGdldEFwcHNCeVR5cGUoYXBwVHlwZSkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5hcHBzTGlzdEJ5VHlwZVthcHBUeXBlXSAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgIHJldHVybiBhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQodGhpcy5hcHBzTGlzdEJ5VHlwZVthcHBUeXBlXSk7XG4gIH1cblxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHBhcmFtIHtzdHJpbmdbXX0gcmVsYXRpb25zVHlwZXNMc3RcbiAgICogQHBhcmFtIHtPYmplY3RbXX0gbW9kZWxzXG4gICAqIEBwYXJhbSB7TW9kZWx9IFtJbnRlcmFjdGlvbnM9IG5ldyBNb2RlbCgpXVxuICAgKiBAcGFyYW0ge1NwaW5hTm9kZX0gW3N0YXJ0aW5nTm9kZSA9IG5ldyBTcGluYWxOb2RlKG5ldyBBYnN0cmFjdEVsZW1lbnQoX25hbWUsIFwicm9vdFwiKSldXG4gICAqIEBwYXJhbSB7U3BpbmFsR3JhcGh9IFtyZWxhdGVkR3JhcGg9dGhpc11cbiAgICogQHJldHVybnMgQSBwcm9taXNlIG9mIHRoZSBjcmVhdGVkIENvbnRleHRcbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBhc3luYyBnZXRDb250ZXh0KFxuICAgIG5hbWUsXG4gICAgcmVsYXRpb25zVHlwZXNMc3QsXG4gICAgbW9kZWxzLFxuICAgIEludGVyYWN0aW9ucyxcbiAgICBzdGFydGluZ05vZGUsXG4gICAgcmVsYXRlZEdyYXBoID0gdGhpc1xuICApIHtcbiAgICBpZiAodHlwZW9mIHRoaXMuYXBwc0xpc3RbbmFtZV0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGxldCBjb250ZXh0ID0gbmV3IFNwaW5hbENvbnRleHQoXG4gICAgICAgIG5hbWUsXG4gICAgICAgIHJlbGF0aW9uc1R5cGVzTHN0LFxuICAgICAgICBtb2RlbHMsXG4gICAgICAgIEludGVyYWN0aW9ucyxcbiAgICAgICAgc3RhcnRpbmdOb2RlLFxuICAgICAgICByZWxhdGVkR3JhcGhcbiAgICAgICk7XG4gICAgICB0aGlzLmFwcHNMaXN0LmFkZF9hdHRyKHtcbiAgICAgICAgW25hbWVdOiBuZXcgUHRyKGNvbnRleHQpXG4gICAgICB9KTtcblxuICAgICAgY29udGV4dC50eXBlLnNldChcImNvbnRleHRcIilcblxuICAgICAgaWYgKHR5cGVvZiB0aGlzLmFwcHNMaXN0QnlUeXBlLmNvbnRleHQgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgdGhpcy5hcHBzTGlzdEJ5VHlwZS5hZGRfYXR0cih7XG4gICAgICAgICAgY29udGV4dDogbmV3IE1vZGVsKClcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICB0aGlzLmFwcHNMaXN0QnlUeXBlLmNvbnRleHQuYWRkX2F0dHIoe1xuICAgICAgICBbbmFtZV06IHRoaXMuYXBwc0xpc3RbbmFtZV1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGNvbnRleHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQodGhpcy5hcHBzTGlzdFtuYW1lXSk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0ge3N0cmluZ1tdfSByZWxhdGlvbnNUeXBlc0xzdFxuICAgKiBAcGFyYW0ge1NwaW5hbEdyYXBofSBbcmVsYXRlZFNwaW5hbEdyYXBoPXRoaXNdXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSBvZiB0aGUgY3JlYXRlZCBBcHBcbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBhc3luYyBnZXRBcHAobmFtZSwgcmVsYXRpb25zVHlwZXNMc3QsIHJlbGF0ZWRTcGluYWxHcmFwaCA9IHRoaXMpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMuYXBwc0xpc3RbbmFtZV0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGxldCBzcGluYWxBcHBsaWNhdGlvbiA9IG5ldyBTcGluYWxBcHBsaWNhdGlvbihcbiAgICAgICAgbmFtZSxcbiAgICAgICAgcmVsYXRpb25zVHlwZXNMc3QsXG4gICAgICAgIHJlbGF0ZWRTcGluYWxHcmFwaFxuICAgICAgKTtcbiAgICAgIHRoaXMuYXBwc0xpc3QuYWRkX2F0dHIoe1xuICAgICAgICBbbmFtZV06IG5ldyBQdHIoc3BpbmFsQXBwbGljYXRpb24pXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBzcGluYWxBcHBsaWNhdGlvbjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGF3YWl0IFV0aWxpdGllcy5wcm9taXNlTG9hZCh0aGlzLmFwcHNMaXN0W25hbWVdKTtcbiAgICAgIC8vIGNvbnNvbGUuZXJyb3IoXG4gICAgICAvLyAgIG5hbWUgK1xuICAgICAgLy8gICBcIiBhcyB3ZWxsIGFzIFwiICtcbiAgICAgIC8vICAgdGhpcy5nZXRBcHBzTmFtZXMoKSArXG4gICAgICAvLyAgIFwiIGhhdmUgYmVlbiBhbHJlYWR5IHVzZWQsIHBsZWFzZSBjaG9vc2UgYW5vdGhlciBhcHBsaWNhdGlvbiBuYW1lXCJcbiAgICAgIC8vICk7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgYW4gYXJyYXkgb2YgYXBwcyBuYW1lc1xuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIGdldEFwcHNOYW1lcygpIHtcbiAgICByZXR1cm4gdGhpcy5hcHBzTGlzdC5fYXR0cmlidXRlX25hbWVzO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEBwYXJhbSB7U3BpbmFsQXBwbGljYXRpb259IGFwcFxuICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgcmVzZXJ2ZVVuaXF1ZVJlbGF0aW9uVHlwZShyZWxhdGlvblR5cGUsIGFwcCkge1xuICAgIGlmIChcbiAgICAgIHR5cGVvZiB0aGlzLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb25UeXBlXSA9PT0gXCJ1bmRlZmluZWRcIiAmJlxuICAgICAgdHlwZW9mIHRoaXMucmVsYXRpb25MaXN0QnlUeXBlW3JlbGF0aW9uVHlwZV0gPT09IFwidW5kZWZpbmVkXCJcbiAgICApIHtcbiAgICAgIHRoaXMucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lcy5hZGRfYXR0cih7XG4gICAgICAgIFtyZWxhdGlvblR5cGVdOiBhcHAubmFtZS5nZXQoKVxuICAgICAgfSk7XG4gICAgICBhcHAuYWRkUmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgdHlwZW9mIHRoaXMucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvblR5cGVdICE9PSBcInVuZGVmaW5lZFwiXG4gICAgKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICByZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBoYXMgbm90IGJlZW4gYWRkZWQgdG8gYXBwOiBcIiArXG4gICAgICAgIGFwcC5uYW1lLmdldCgpICtcbiAgICAgICAgXCIsQ2F1c2UgOiBhbHJlYWR5IFJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uVHlwZV1cbiAgICAgICk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5yZWxhdGlvbkxpc3RCeVR5cGVbcmVsYXRpb25UeXBlXSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgaGFzIG5vdCBiZWVuIGFkZGVkIHRvIGFwcDogXCIgK1xuICAgICAgICBhcHAubmFtZS5nZXQoKSArXG4gICAgICAgIFwiLENhdXNlIDogYWxyZWFkeSBVc2VkIGJ5IG90aGVyIEFwcHNcIlxuICAgICAgKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU3BpbmFsR3JhcGg7XG5zcGluYWxDb3JlLnJlZ2lzdGVyX21vZGVscyhbU3BpbmFsR3JhcGhdKTsiXX0=