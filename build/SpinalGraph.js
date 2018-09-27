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

var _TimeSeries = require("./TimeSeries");

var _TimeSeries2 = _interopRequireDefault(_TimeSeries);

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
    globalType.spinal.contextStudio.TimeSeries = _TimeSeries2.default;
    globalType.spinal.contextStudio.Utilities = _Utilities.Utilities;
  }
  /**
   *
   *
   * @param {number} _dbId id of the object inside the svf (autodesk file)
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
    if (this.hasReservationCredentials(relationType, appName)) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TcGluYWxHcmFwaC5qcyJdLCJuYW1lcyI6WyJzcGluYWxDb3JlIiwicmVxdWlyZSIsImdsb2JhbFR5cGUiLCJ3aW5kb3ciLCJnbG9iYWwiLCJTcGluYWxHcmFwaCIsIk1vZGVsIiwiY29uc3RydWN0b3IiLCJfbmFtZSIsIl9zdGFydGluZ05vZGUiLCJQdHIiLCJuYW1lIiwiRmlsZVN5c3RlbSIsIl9zaWdfc2VydmVyIiwiYWRkX2F0dHIiLCJleHRlcm5hbElkTm9kZU1hcHBpbmciLCJndWlkQWJzdHJhY3ROb2RlTWFwcGluZyIsInN0YXJ0aW5nTm9kZSIsIm5vZGVMaXN0IiwiTHN0Iiwibm9kZUxpc3RCeUVsZW1lbnRUeXBlIiwicmVsYXRpb25MaXN0IiwicmVsYXRpb25MaXN0QnlUeXBlIiwiYXBwc0xpc3QiLCJhcHBzTGlzdEJ5VHlwZSIsInJlc2VydmVkUmVsYXRpb25zTmFtZXMiLCJpbml0Iiwic3BpbmFsIiwiY29udGV4dFN0dWRpbyIsImdyYXBoIiwiU3BpbmFsTm9kZSIsIlNwaW5hbFJlbGF0aW9uIiwiQWJzdHJhY3RFbGVtZW50IiwiQklNRWxlbWVudCIsIlNwaW5hbE5ldHdvcmsiLCJTcGluYWxEZXZpY2UiLCJTcGluYWxFbmRwb2ludCIsIlRpbWVTZXJpZXMiLCJVdGlsaXRpZXMiLCJnZXROb2RlQnlkYklkIiwiX2RiSWQiLCJfZXh0ZXJuYWxJZCIsImdldEV4dGVybmFsSWQiLCJCSU1FbGVtZW50MSIsImluaXRFeHRlcm5hbElkIiwibm9kZSIsImFkZE5vZGVBc3luYyIsInR5cGUiLCJnZXQiLCJiaW5kIiwiX2NsYXNzaWZ5QklNRWxlbWVudE5vZGUiLCJfbm9kZSIsImNsYXNzaWZ5Tm9kZSIsImdldERiSWRCeU5vZGUiLCJlbGVtZW50IiwicHJvbWlzZUxvYWQiLCJpZCIsInNldE5hbWUiLCJzZXQiLCJzZXRTdGFydGluZ05vZGUiLCJfYWRkRXh0ZXJuYWxJZE5vZGVNYXBwaW5nRW50cnkiLCJfRWxlbWVudElkIiwiX2RiaWQiLCJleHRlcm5hbElkIiwidW5iaW5kIiwiX2VsZW1lbnQiLCJpbml0RXh0ZXJuYWxJZEFzeW5jIiwiY29uc29sZSIsImxvZyIsImFkZE5vZGUiLCJ0aGVuIiwicmVsYXRlZEdyYXBoIiwibG9hZCIsInB1c2giLCJub2RlTGlzdE9mVHlwZSIsImFkZFNpbXBsZVJlbGF0aW9uQXN5bmMiLCJfcmVsYXRpb25UeXBlIiwiX2lzRGlyZWN0ZWQiLCJpc1Jlc2VydmVkIiwibm9kZTIiLCJyZWwiLCJhZGRSZWxhdGlvbiIsImFkZFNpbXBsZVJlbGF0aW9uIiwicmVsYXRpb25UeXBlIiwiaXNEaXJlY3RlZCIsImFkZFNpbXBsZVJlbGF0aW9uQnlBcHAiLCJhcHBOYW1lIiwiaGFzUmVzZXJ2YXRpb25DcmVkZW50aWFscyIsImNvbnRhaW5zQXBwIiwiZXJyb3IiLCJyZWxhdGlvbiIsImluZGV4Iiwibm9kZUxpc3QxIiwibGVuZ3RoIiwiYWRkRGlyZWN0ZWRSZWxhdGlvblBhcmVudCIsIm5vZGVMaXN0MiIsImFkZERpcmVjdGVkUmVsYXRpb25DaGlsZCIsImFkZE5vbkRpcmVjdGVkUmVsYXRpb24iLCJfY2xhc3NpZnlSZWxhdGlvbiIsImFkZFJlbGF0aW9ucyIsIl9yZWxhdGlvbnMiLCJyZWxhdGlvbkxpc3RPZlR5cGUiLCJhcHAiLCJfY2xhc3NpZnlSZWxhdGlvbnMiLCJfYWRkTm90RXhpc3RpbmdOb2Rlc0Zyb21MaXN0IiwiX2xpc3QiLCJpIiwiY29udGFpbnNMc3RCeUlkIiwiX2FkZE5vdEV4aXN0aW5nTm9kZXNGcm9tUmVsYXRpb24iLCJfcmVsYXRpb24iLCJnZXRBcHBzQnlUeXBlIiwiYXBwVHlwZSIsImdldENvbnRleHQiLCJyZWxhdGlvbnNUeXBlc0xzdCIsIm1vZGVscyIsIkludGVyYWN0aW9ucyIsImNvbnRleHQiLCJTcGluYWxDb250ZXh0IiwiZ2V0QXBwIiwicmVsYXRlZFNwaW5hbEdyYXBoIiwic3BpbmFsQXBwbGljYXRpb24iLCJTcGluYWxBcHBsaWNhdGlvbiIsImdldEFwcHNOYW1lcyIsIl9hdHRyaWJ1dGVfbmFtZXMiLCJyZXNlcnZlVW5pcXVlUmVsYXRpb25UeXBlIiwiYWRkUmVsYXRpb25UeXBlIiwicmVnaXN0ZXJfbW9kZWxzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUVBOzs7O0FBYkEsTUFBTUEsYUFBYUMsUUFBUSx5QkFBUixDQUFuQjtBQUNBLE1BQU1DLGFBQWEsT0FBT0MsTUFBUCxLQUFrQixXQUFsQixHQUFnQ0MsTUFBaEMsR0FBeUNELE1BQTVEOztBQWVBOzs7OztBQUtBLE1BQU1FLFdBQU4sU0FBMEJILFdBQVdJLEtBQXJDLENBQTJDO0FBQ3pDOzs7Ozs7QUFNQUMsY0FBWUMsUUFBUSxHQUFwQixFQUF5QkMsZ0JBQWdCLElBQUlDLEdBQUosQ0FBUSxDQUFSLENBQXpDLEVBQXFEQyxPQUFPLGFBQTVELEVBQTJFO0FBQ3pFO0FBQ0EsUUFBSUMsV0FBV0MsV0FBZixFQUE0QjtBQUMxQixXQUFLQyxRQUFMLENBQWM7QUFDWkgsY0FBTUgsS0FETTtBQUVaTywrQkFBdUIsSUFBSVQsS0FBSixFQUZYO0FBR1pVLGlDQUF5QixJQUFJVixLQUFKLEVBSGI7QUFJWlcsc0JBQWNSLGFBSkY7QUFLWlMsa0JBQVUsSUFBSVIsR0FBSixDQUFRLElBQUlTLEdBQUosRUFBUixDQUxFO0FBTVpDLCtCQUF1QixJQUFJZCxLQUFKLEVBTlg7QUFPWmUsc0JBQWMsSUFBSVgsR0FBSixDQUFRLElBQUlTLEdBQUosRUFBUixDQVBGO0FBUVpHLDRCQUFvQixJQUFJaEIsS0FBSixFQVJSO0FBU1ppQixrQkFBVSxJQUFJakIsS0FBSixFQVRFO0FBVVprQix3QkFBZ0IsSUFBSWxCLEtBQUosRUFWSjtBQVdabUIsZ0NBQXdCLElBQUluQixLQUFKO0FBWFosT0FBZDtBQWFEO0FBQ0Y7QUFDRDs7OztBQUlBb0IsU0FBTztBQUNMeEIsZUFBV3lCLE1BQVgsQ0FBa0JDLGFBQWxCLEdB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c291cmNlc0NvbnRlbnQiOlsiY29uc3Qgc3BpbmFsQ29yZSA9IHJlcXVpcmUoXCJzcGluYWwtY29yZS1jb25uZWN0b3Jqc1wiKTtcbmNvbnN0IGdsb2JhbFR5cGUgPSB0eXBlb2Ygd2luZG93ID09PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogd2luZG93O1xuaW1wb3J0IFNwaW5hbE5vZGUgZnJvbSBcIi4vU3BpbmFsTm9kZVwiO1xuaW1wb3J0IFNwaW5hbFJlbGF0aW9uIGZyb20gXCIuL1NwaW5hbFJlbGF0aW9uXCI7XG5pbXBvcnQgQWJzdHJhY3RFbGVtZW50IGZyb20gXCIuL0Fic3RyYWN0RWxlbWVudFwiO1xuaW1wb3J0IEJJTUVsZW1lbnQgZnJvbSBcIi4vQklNRWxlbWVudFwiO1xuaW1wb3J0IFNwaW5hbEFwcGxpY2F0aW9uIGZyb20gXCIuL1NwaW5hbEFwcGxpY2F0aW9uXCI7XG5pbXBvcnQgU3BpbmFsQ29udGV4dCBmcm9tIFwiLi9TcGluYWxDb250ZXh0XCI7XG5pbXBvcnQgU3BpbmFsTmV0d29yayBmcm9tIFwiLi9TcGluYWxOZXR3b3JrXCI7XG5pbXBvcnQgU3BpbmFsRGV2aWNlIGZyb20gXCIuL1NwaW5hbERldmljZVwiO1xuaW1wb3J0IFNwaW5hbEVuZHBvaW50IGZyb20gXCIuL1NwaW5hbEVuZHBvaW50XCI7XG5pbXBvcnQgVGltZVNlcmllcyBmcm9tIFwiLi9UaW1lU2VyaWVzXCI7XG5cbmltcG9ydCB7XG4gIFV0aWxpdGllc1xufSBmcm9tIFwiLi9VdGlsaXRpZXNcIjtcbi8qKlxuICogVGhlIGNvcmUgb2YgdGhlIGludGVyYWN0aW9ucyBiZXR3ZWVuIHRoZSBCSU1FbGVtZW50cyBOb2RlcyBhbmQgb3RoZXIgTm9kZXMoRG9jcywgVGlja2V0cywgZXRjIC4uKVxuICogQGNsYXNzIFNwaW5hbEdyYXBoXG4gKiBAZXh0ZW5kcyB7TW9kZWx9XG4gKi9cbmNsYXNzIFNwaW5hbEdyYXBoIGV4dGVuZHMgZ2xvYmFsVHlwZS5Nb2RlbCB7XG4gIC8qKlxuICAgKkNyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgU3BpbmFsR3JhcGguXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbX25hbWU9dF1cbiAgICogQHBhcmFtIHtQdHJ9IFtfc3RhcnRpbmdOb2RlPW5ldyBQdHIoMCldXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgY29uc3RydWN0b3IoX25hbWUgPSBcInRcIiwgX3N0YXJ0aW5nTm9kZSA9IG5ldyBQdHIoMCksIG5hbWUgPSBcIlNwaW5hbEdyYXBoXCIpIHtcbiAgICBzdXBlcigpO1xuICAgIGlmIChGaWxlU3lzdGVtLl9zaWdfc2VydmVyKSB7XG4gICAgICB0aGlzLmFkZF9hdHRyKHtcbiAgICAgICAgbmFtZTogX25hbWUsXG4gICAgICAgIGV4dGVybmFsSWROb2RlTWFwcGluZzogbmV3IE1vZGVsKCksXG4gICAgICAgIGd1aWRBYnN0cmFjdE5vZGVNYXBwaW5nOiBuZXcgTW9kZWwoKSxcbiAgICAgICAgc3RhcnRpbmdOb2RlOiBfc3RhcnRpbmdOb2RlLFxuICAgICAgICBub2RlTGlzdDogbmV3IFB0cihuZXcgTHN0KCkpLFxuICAgICAgICBub2RlTGlzdEJ5RWxlbWVudFR5cGU6IG5ldyBNb2RlbCgpLFxuICAgICAgICByZWxhdGlvbkxpc3Q6IG5ldyBQdHIobmV3IExzdCgpKSxcbiAgICAgICAgcmVsYXRpb25MaXN0QnlUeXBlOiBuZXcgTW9kZWwoKSxcbiAgICAgICAgYXBwc0xpc3Q6IG5ldyBNb2RlbCgpLFxuICAgICAgICBhcHBzTGlzdEJ5VHlwZTogbmV3IE1vZGVsKCksXG4gICAgICAgIHJlc2VydmVkUmVsYXRpb25zTmFtZXM6IG5ldyBNb2RlbCgpXG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqZnVuY3Rpb25cbiAgICpUbyBwdXQgdXNlZCBmdW5jdGlvbnMgYXMgd2VsbCBhcyB0aGUgU3BpbmFsR3JhcGggbW9kZWwgaW4gdGhlIGdsb2JhbCBzY29wZVxuICAgKi9cbiAgaW5pdCgpIHtcbiAgICBnbG9iYWxUeXBlLnNwaW5hbC5jb250ZXh0U3R1ZGlvID0ge307XG4gICAgZ2xvYmFsVHlwZS5zcGluYWwuY29udGV4dFN0dWRpby5ncmFwaCA9IHRoaXM7XG4gICAgZ2xvYmFsVHlwZS5zcGluYWwuY29udGV4dFN0dWRpby5TcGluYWxOb2RlID0gU3BpbmFsTm9kZTtcbiAgICBnbG9iYWxUeXBlLnNwaW5hbC5jb250ZXh0U3R1ZGlvLlNwaW5hbFJlbGF0aW9uID0gU3BpbmFsUmVsYXRpb247XG4gICAgZ2xvYmFsVHlwZS5zcGluYWwuY29udGV4dFN0dWRpby5BYnN0cmFjdEVsZW1lbnQgPSBBYnN0cmFjdEVsZW1lbnQ7XG4gICAgZ2xvYmFsVHlwZS5zcGluYWwuY29udGV4dFN0dWRpby5CSU1FbGVtZW50ID0gQklNRWxlbWVudDtcbiAgICBnbG9iYWxUeXBlLnNwaW5hbC5jb250ZXh0U3R1ZGlvLlNwaW5hbE5ldHdvcmsgPSBTcGluYWxOZXR3b3JrO1xuICAgIGdsb2JhbFR5cGUuc3BpbmFsLmNvbnRleHRTdHVkaW8uU3BpbmFsRGV2aWNlID0gU3BpbmFsRGV2aWNlO1xuICAgIGdsb2JhbFR5cGUuc3BpbmFsLmNvbnRleHRTdHVkaW8uU3BpbmFsRW5kcG9pbnQgPSBTcGluYWxFbmRwb2ludDtcbiAgICBnbG9iYWxUeXBlLnNwaW5hbC5jb250ZXh0U3R1ZGlvLlRpbWVTZXJpZXMgPSBUaW1lU2VyaWVzO1xuICAgIGdsb2JhbFR5cGUuc3BpbmFsLmNvbnRleHRTdHVkaW8uVXRpbGl0aWVzID0gVXRpbGl0aWVzO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gX2RiSWQgaWQgb2YgdGhlIG9iamVjdCBpbnNpZGUgdGhlIHN2ZiAoYXV0b2Rlc2sgZmlsZSlcbiAgICogQHJldHVybnMgUHJvbWlzZSBvZiB0aGUgY29ycmVzcG9uZGluZyBOb2RlIG9yIHRoZSBjcmVhdGVkIG9uZSBpZiBub3QgZXhpc3RpbmdcbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBhc3luYyBnZXROb2RlQnlkYklkKF9kYklkKSB7XG4gICAgbGV0IF9leHRlcm5hbElkID0gYXdhaXQgVXRpbGl0aWVzLmdldEV4dGVybmFsSWQoX2RiSWQpO1xuICAgIGlmICh0eXBlb2YgdGhpcy5leHRlcm5hbElkTm9kZU1hcHBpbmdbX2V4dGVybmFsSWRdICE9PSBcInVuZGVmaW5lZFwiKVxuICAgICAgcmV0dXJuIHRoaXMuZXh0ZXJuYWxJZE5vZGVNYXBwaW5nW19leHRlcm5hbElkXTtcbiAgICBlbHNlIHtcbiAgICAgIGxldCBCSU1FbGVtZW50MSA9IG5ldyBCSU1FbGVtZW50KF9kYklkKTtcbiAgICAgIEJJTUVsZW1lbnQxLmluaXRFeHRlcm5hbElkKCk7XG4gICAgICBsZXQgbm9kZSA9IGF3YWl0IHRoaXMuYWRkTm9kZUFzeW5jKEJJTUVsZW1lbnQxKTtcbiAgICAgIGlmIChCSU1FbGVtZW50MS50eXBlLmdldCgpID09PSBcIlwiKSB7XG4gICAgICAgIEJJTUVsZW1lbnQxLnR5cGUuYmluZCh0aGlzLl9jbGFzc2lmeUJJTUVsZW1lbnROb2RlLmJpbmQodGhpcywgbm9kZSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGV9IF9ub2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgYXN5bmMgX2NsYXNzaWZ5QklNRWxlbWVudE5vZGUoX25vZGUpIHtcbiAgICAvL1RPRE8gREVMRVRFIE9MRCBDTEFTU0lGSUNBVElPTlxuICAgIHRoaXMuY2xhc3NpZnlOb2RlKF9ub2RlKTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxOb2RlfSBfbm9kZVxuICAgKiBAcmV0dXJucyBQcm9taXNlIG9mIGRiSWQgW251bWJlcl1cbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBhc3luYyBnZXREYklkQnlOb2RlKF9ub2RlKSB7XG4gICAgbGV0IGVsZW1lbnQgPSBhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQoX25vZGUuZWxlbWVudCk7XG4gICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBCSU1FbGVtZW50KSB7XG4gICAgICByZXR1cm4gZWxlbWVudC5pZC5nZXQoKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBfbmFtZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIHNldE5hbWUoX25hbWUpIHtcbiAgICB0aGlzLm5hbWUuc2V0KF9uYW1lKTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtQdHJ9IF9zdGFydGluZ05vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBzZXRTdGFydGluZ05vZGUoX3N0YXJ0aW5nTm9kZSkge1xuICAgIHRoaXMuc3RhcnRpbmdOb2RlLnNldChfc3RhcnRpbmdOb2RlKTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IF9FbGVtZW50SWQgLSB0aGUgRWxlbWVudCBFeHRlcm5hbElkXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZX0gX25vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBhc3luYyBfYWRkRXh0ZXJuYWxJZE5vZGVNYXBwaW5nRW50cnkoX0VsZW1lbnRJZCwgX25vZGUpIHtcbiAgICBsZXQgX2RiaWQgPSBfRWxlbWVudElkLmdldCgpO1xuICAgIGlmICh0eXBlb2YgX2RiaWQgPT0gXCJudW1iZXJcIilcbiAgICAgIGlmIChfZGJpZCAhPSAwKSB7XG4gICAgICAgIGxldCBleHRlcm5hbElkID0gYXdhaXQgVXRpbGl0aWVzLmdldEV4dGVybmFsSWQoX2RiaWQpO1xuICAgICAgICBsZXQgZWxlbWVudCA9IGF3YWl0IFV0aWxpdGllcy5wcm9taXNlTG9hZChfbm9kZS5lbGVtZW50KTtcbiAgICAgICAgYXdhaXQgZWxlbWVudC5pbml0RXh0ZXJuYWxJZCgpO1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMuZXh0ZXJuYWxJZE5vZGVNYXBwaW5nW2V4dGVybmFsSWRdID09PSBcInVuZGVmaW5lZFwiKVxuICAgICAgICAgIHRoaXMuZXh0ZXJuYWxJZE5vZGVNYXBwaW5nLmFkZF9hdHRyKHtcbiAgICAgICAgICAgIFtleHRlcm5hbElkXTogX25vZGVcbiAgICAgICAgICB9KTtcbiAgICAgICAgX0VsZW1lbnRJZC51bmJpbmQoXG4gICAgICAgICAgdGhpcy5fYWRkRXh0ZXJuYWxJZE5vZGVNYXBwaW5nRW50cnkuYmluZCh0aGlzLCBfRWxlbWVudElkLFxuICAgICAgICAgICAgX25vZGUpXG4gICAgICAgICk7XG4gICAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7TW9kZWx9IF9lbGVtZW50IC0gYW55IHN1YmNsYXNzIG9mIE1vZGVsXG4gICAqIEByZXR1cm5zIFByb21pc2Ugb2YgdGhlIGNyZWF0ZWQgTm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIGFzeW5jIGFkZE5vZGVBc3luYyhfZWxlbWVudCkge1xuICAgIGxldCBuYW1lID0gXCJcIjtcbiAgICBpZiAoX2VsZW1lbnQgaW5zdGFuY2VvZiBCSU1FbGVtZW50KSB7XG4gICAgICBhd2FpdCBfZWxlbWVudC5pbml0RXh0ZXJuYWxJZEFzeW5jKCk7XG4gICAgICBpZiAoXG4gICAgICAgIHR5cGVvZiB0aGlzLmV4dGVybmFsSWROb2RlTWFwcGluZ1tfZWxlbWVudC5leHRlcm5hbElkLmdldCgpXSAhPT1cbiAgICAgICAgXCJ1bmRlZmluZWRcIlxuICAgICAgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQklNIE9CSkVDVCBOT0RFIEFMUkVBRFkgRVhJU1RTXCIpO1xuICAgICAgICByZXR1cm4gdGhpcy5leHRlcm5hbElkTm9kZU1hcHBpbmdbX2VsZW1lbnQuZXh0ZXJuYWxJZC5nZXQoKV07XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChfZWxlbWVudCBpbnN0YW5jZW9mIEFic3RyYWN0RWxlbWVudCkge1xuICAgICAgaWYgKFxuICAgICAgICB0eXBlb2YgdGhpcy5ndWlkQWJzdHJhY3ROb2RlTWFwcGluZ1tfZWxlbWVudC5pZC5nZXQoKV0gIT09XG4gICAgICAgIFwidW5kZWZpbmVkXCJcbiAgICAgICkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkFCU1RSQUNUIE9CSkVDVCBOT0RFIEFMUkVBRFkgRVhJU1RTXCIpO1xuICAgICAgICByZXR1cm4gdGhpcy5ndWlkQWJzdHJhY3ROb2RlTWFwcGluZ1tfZWxlbWVudC5pZC5nZXQoKV07XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0eXBlb2YgX2VsZW1lbnQubmFtZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgbmFtZSA9IF9lbGVtZW50Lm5hbWUuZ2V0KCk7XG4gICAgfVxuICAgIGxldCBub2RlID0gbmV3IFNwaW5hbE5vZGUobmFtZSwgX2VsZW1lbnQsIHRoaXMpO1xuICAgIHJldHVybiBub2RlO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge01vZGVsfSBfZWxlbWVudCAtIGFueSBzdWJjbGFzcyBvZiBNb2RlbFxuICAgKiBAcmV0dXJucyB0aGUgY3JlYXRlZCBOb2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgYWRkTm9kZShfZWxlbWVudCkge1xuICAgIGxldCBuYW1lID0gXCJcIjtcbiAgICBpZiAoX2VsZW1lbnQgaW5zdGFuY2VvZiBCSU1FbGVtZW50KSB7XG4gICAgICBfZWxlbWVudC5pbml0RXh0ZXJuYWxJZCgpO1xuICAgICAgaWYgKFxuICAgICAgICB0eXBlb2YgdGhpcy5leHRlcm5hbElkTm9kZU1hcHBpbmdbX2VsZW1lbnQuZXh0ZXJuYWxJZC5nZXQoKV0gIT09XG4gICAgICAgIFwidW5kZWZpbmVkXCJcbiAgICAgICkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkJJTSBPQkpFQ1QgTk9ERSBBTFJFQURZIEVYSVNUU1wiKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXh0ZXJuYWxJZE5vZGVNYXBwaW5nW19lbGVtZW50LmV4dGVybmFsSWQuZ2V0KCldO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoX2VsZW1lbnQgaW5zdGFuY2VvZiBBYnN0cmFjdEVsZW1lbnQpIHtcbiAgICAgIGlmIChcbiAgICAgICAgdHlwZW9mIHRoaXMuZ3VpZEFic3RyYWN0Tm9kZU1hcHBpbmdbX2VsZW1lbnQuaWQuZ2V0KCldICE9PVxuICAgICAgICBcInVuZGVmaW5lZFwiXG4gICAgICApIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJBQlNUUkFDVCBPQkpFQ1QgTk9ERSBBTFJFQURZIEVYSVNUU1wiKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3VpZEFic3RyYWN0Tm9kZU1hcHBpbmdbX2VsZW1lbnQuaWQuZ2V0KCldO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodHlwZW9mIF9lbGVtZW50Lm5hbWUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIG5hbWUgPSBfZWxlbWVudC5uYW1lLmdldCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuYW1lID0gX2VsZW1lbnQuY29uc3RydWN0b3IubmFtZTtcbiAgICB9XG4gICAgbGV0IG5vZGUgPSBuZXcgU3BpbmFsTm9kZShuYW1lLCBfZWxlbWVudCwgdGhpcyk7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICAvKipcbiAgICogIE9ic2VydmVzIHRoZSB0eXBlIG9mIHRoZSBlbGVtZW50IGluc2lkZSB0aGUgbm9kZSBhZGQgQ2xhc3NpZnkgaXQuXG4gICAqICBJdCBwdXRzIGl0IGluIHRoZSBVbmNsYXNzaWZpZWQgbGlzdCBPdGhlcndpc2UuXG4gICAqIEl0IGFkZHMgdGhlIG5vZGUgdG8gdGhlIG1hcHBpbmcgbGlzdCB3aXRoIEV4dGVybmFsSWQgaWYgdGhlIE9iamVjdCBpcyBvZiB0eXBlIEJJTUVsZW1lbnRcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxOb2RlfSBfbm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIGNsYXNzaWZ5Tm9kZShfbm9kZSkge1xuICAgIFV0aWxpdGllcy5wcm9taXNlTG9hZChfbm9kZS5lbGVtZW50KS50aGVuKGVsZW1lbnQgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBfbm9kZS5yZWxhdGVkR3JhcGggPT09IFwidW5kZWZpbmVkXCIpXG4gICAgICAgIF9ub2RlLnJlbGF0ZWRHcmFwaC5zZXQodGhpcyk7XG4gICAgICB0aGlzLm5vZGVMaXN0LmxvYWQobm9kZUxpc3QgPT4ge1xuICAgICAgICBub2RlTGlzdC5wdXNoKF9ub2RlKTtcbiAgICAgIH0pO1xuICAgICAgbGV0IHR5cGUgPSBcIlVuY2xhc3NpZmllZFwiO1xuICAgICAgaWYgKHR5cGVvZiBlbGVtZW50LnR5cGUgIT0gXCJ1bmRlZmluZWRcIiAmJiBlbGVtZW50LnR5cGUuZ2V0KCkgIT1cbiAgICAgICAgXCJcIikge1xuICAgICAgICB0eXBlID0gZWxlbWVudC50eXBlLmdldCgpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMubm9kZUxpc3RCeUVsZW1lbnRUeXBlW3R5cGVdKSB7XG4gICAgICAgIHRoaXMubm9kZUxpc3RCeUVsZW1lbnRUeXBlW3R5cGVdLmxvYWQobm9kZUxpc3RPZlR5cGUgPT4ge1xuICAgICAgICAgIG5vZGVMaXN0T2ZUeXBlLnB1c2goX25vZGUpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBub2RlTGlzdE9mVHlwZSA9IG5ldyBMc3QoKTtcbiAgICAgICAgbm9kZUxpc3RPZlR5cGUucHVzaChfbm9kZSk7XG4gICAgICAgIHRoaXMubm9kZUxpc3RCeUVsZW1lbnRUeXBlLmFkZF9hdHRyKHtcbiAgICAgICAgICBbdHlwZV06IG5ldyBQdHIobm9kZUxpc3RPZlR5cGUpXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBCSU1FbGVtZW50KSB7XG4gICAgICAgIGxldCBfZGJpZCA9IGVsZW1lbnQuaWQuZ2V0KCk7XG4gICAgICAgIGlmICh0eXBlb2YgX2RiaWQgPT0gXCJudW1iZXJcIilcbiAgICAgICAgICBpZiAoX2RiaWQgIT0gMCkge1xuICAgICAgICAgICAgdGhpcy5fYWRkRXh0ZXJuYWxJZE5vZGVNYXBwaW5nRW50cnkoZWxlbWVudC5pZCwgX25vZGUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbGVtZW50LmlkLmJpbmQoXG4gICAgICAgICAgICAgIHRoaXMuX2FkZEV4dGVybmFsSWROb2RlTWFwcGluZ0VudHJ5LmJpbmQobnVsbCwgZWxlbWVudC5pZCxcbiAgICAgICAgICAgICAgICBfbm9kZSlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChlbGVtZW50IGluc3RhbmNlb2YgQWJzdHJhY3RFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuZ3VpZEFic3RyYWN0Tm9kZU1hcHBpbmcuYWRkX2F0dHIoe1xuICAgICAgICAgIFtlbGVtZW50LmlkLmdldCgpXTogX25vZGVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvLyBhZGROb2RlcyhfdmVydGljZXMpIHtcbiAgLy8gICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX3ZlcnRpY2VzLmxlbmd0aDsgaW5kZXgrKykge1xuICAvLyAgICAgdGhpcy5jbGFzc2lmeU5vZGUoX3ZlcnRpY2VzW2luZGV4XSlcbiAgLy8gICB9XG4gIC8vIH1cbiAgLyoqXG4gICAqICBJdCBjcmVhdGVzIHRoZSBub2RlIGNvcnJlc3BvbmRpbmcgdG8gdGhlIF9lbGVtZW50LFxuICAgKiB0aGVuIGl0IGNyZWF0ZXMgYSBzaW1wbGUgcmVsYXRpb24gb2YgY2xhc3MgU3BpbmFsUmVsYXRpb24gb2YgdHlwZTpfdHlwZS5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IF9yZWxhdGlvblR5cGVcbiAgICogQHBhcmFtIHtTcGluYWxOb2RlfSBfbm9kZVxuICAgKiBAcGFyYW0ge01vZGVsfSBfZWxlbWVudCAtIGFueSBzdWJjbGFzcyBvZiBNb2RlbFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtfaXNEaXJlY3RlZD1mYWxzZV1cbiAgICogQHJldHVybnMgYSBQcm9taXNlIG9mIHRoZSBjcmVhdGVkIHJlbGF0aW9uXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgYXN5bmMgYWRkU2ltcGxlUmVsYXRpb25Bc3luYyhcbiAgICBfcmVsYXRpb25UeXBlLFxuICAgIF9ub2RlLFxuICAgIF9lbGVtZW50LFxuICAgIF9pc0RpcmVjdGVkID0gZmFsc2VcbiAgKSB7XG4gICAgaWYgKCF0aGlzLmlzUmVzZXJ2ZWQoX3JlbGF0aW9uVHlwZSkpIHtcbiAgICAgIGxldCBub2RlMiA9IGF3YWl0IHRoaXMuYWRkTm9kZUFzeW5jKF9lbGVtZW50KTtcbiAgICAgIGxldCByZWwgPSBuZXcgU3BpbmFsUmVsYXRpb24oXG4gICAgICAgIF9yZWxhdGlvblR5cGUsIFtfbm9kZV0sIFtub2RlMl0sXG4gICAgICAgIF9pc0RpcmVjdGVkXG4gICAgICApO1xuICAgICAgdGhpcy5hZGRSZWxhdGlvbihyZWwpO1xuICAgICAgcmV0dXJuIHJlbDtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIF9yZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tfcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqICBJdCBjcmVhdGVzIHRoZSBub2RlIGNvcnJlc3BvbmRpbmcgdG8gdGhlIF9lbGVtZW50LFxuICAgKiB0aGVuIGl0IGNyZWF0ZXMgYSBzaW1wbGUgcmVsYXRpb24gb2YgY2xhc3MgU3BpbmFsUmVsYXRpb24gb2YgdHlwZTpfdHlwZS5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGV9IG5vZGVcbiAgICogQHBhcmFtIHtNb2RlbH0gZWxlbWVudCAtIGFueSBzdWJjbGFzcyBvZiBNb2RlbFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0RpcmVjdGVkPWZhbHNlXVxuICAgKiBAcmV0dXJucyBhIFByb21pc2Ugb2YgdGhlIGNyZWF0ZWQgcmVsYXRpb25cbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBhZGRTaW1wbGVSZWxhdGlvbihyZWxhdGlvblR5cGUsIG5vZGUsIGVsZW1lbnQsIGlzRGlyZWN0ZWQgPSBmYWxzZSkge1xuICAgIGlmICghdGhpcy5pc1Jlc2VydmVkKF9yZWxhdGlvblR5cGUpKSB7XG4gICAgICBsZXQgbm9kZTIgPSB0aGlzLmFkZE5vZGUoZWxlbWVudCk7XG4gICAgICBsZXQgcmVsID0gbmV3IFNwaW5hbFJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgW25vZGVdLCBbbm9kZTJdLFxuICAgICAgICBpc0RpcmVjdGVkKTtcbiAgICAgIHRoaXMuYWRkUmVsYXRpb24ocmVsKTtcbiAgICAgIHJldHVybiByZWw7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICBfcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbX3JlbGF0aW9uVHlwZV1cbiAgICAgICk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZX0gbm9kZVxuICAgKiBAcGFyYW0ge01vZGVsfSBlbGVtZW50IC0gYW55IHN1YmNsYXNzIG9mIE1vZGVsXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGlyZWN0ZWQ9ZmFsc2VdXG4gICAqIEByZXR1cm5zIHRoZSBjcmVhdGVkIFJlbGF0aW9uLCB1bmRlZmluZWQgb3RoZXJ3aXNlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgYWRkU2ltcGxlUmVsYXRpb25CeUFwcChcbiAgICBhcHBOYW1lLFxuICAgIHJlbGF0aW9uVHlwZSxcbiAgICBub2RlLFxuICAgIGVsZW1lbnQsXG4gICAgaXNEaXJlY3RlZCA9IGZhbHNlXG4gICkge1xuICAgIGlmICh0aGlzLmhhc1Jlc2VydmF0aW9uQ3JlZGVudGlhbHMocmVsYXRpb25UeXBlLCBhcHBOYW1lKSkge1xuICAgICAgaWYgKHRoaXMuY29udGFpbnNBcHAoYXBwTmFtZSkpIHtcbiAgICAgICAgbGV0IG5vZGUyID0gdGhpcy5hZGROb2RlKGVsZW1lbnQpO1xuICAgICAgICBsZXQgcmVsID0gbmV3IFNwaW5hbFJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgW25vZGVdLCBbbm9kZTJdLFxuICAgICAgICAgIGlzRGlyZWN0ZWQpO1xuICAgICAgICB0aGlzLmFkZFJlbGF0aW9uKHJlbCwgYXBwTmFtZSk7XG4gICAgICAgIHJldHVybiByZWw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKGFwcE5hbWUgKyBcIiBkb2VzIG5vdCBleGlzdFwiKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIF9yZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tfcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb259IHJlbGF0aW9uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgYWRkUmVsYXRpb24ocmVsYXRpb24sIGFwcE5hbWUpIHtcbiAgICBpZiAodGhpcy5oYXNSZXNlcnZhdGlvbkNyZWRlbnRpYWxzKHJlbGF0aW9uLnR5cGUuZ2V0KCksIGFwcE5hbWUpKSB7XG4gICAgICBpZiAocmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKSkge1xuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcmVsYXRpb24ubm9kZUxpc3QxLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgIGNvbnN0IG5vZGUgPSByZWxhdGlvbi5ub2RlTGlzdDFbaW5kZXhdO1xuICAgICAgICAgIG5vZGUuYWRkRGlyZWN0ZWRSZWxhdGlvblBhcmVudChyZWxhdGlvbiwgYXBwTmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHJlbGF0aW9uLm5vZGVMaXN0Mi5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICBjb25zdCBub2RlID0gcmVsYXRpb24ubm9kZUxpc3QyW2luZGV4XTtcbiAgICAgICAgICBub2RlLmFkZERpcmVjdGVkUmVsYXRpb25DaGlsZChyZWxhdGlvbiwgYXBwTmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCByZWxhdGlvbi5ub2RlTGlzdDEubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgY29uc3Qgbm9kZSA9IHJlbGF0aW9uLm5vZGVMaXN0MVtpbmRleF07XG4gICAgICAgICAgbm9kZS5hZGROb25EaXJlY3RlZFJlbGF0aW9uKHJlbGF0aW9uLCBhcHBOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcmVsYXRpb24ubm9kZUxpc3QyLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgIGNvbnN0IG5vZGUgPSByZWxhdGlvbi5ub2RlTGlzdDJbaW5kZXhdO1xuICAgICAgICAgIG5vZGUuYWRkTm9uRGlyZWN0ZWRSZWxhdGlvbihyZWxhdGlvbiwgYXBwTmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuX2NsYXNzaWZ5UmVsYXRpb24ocmVsYXRpb24sIGFwcE5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb24udHlwZS5nZXQoKSArXG4gICAgICAgIFwiIGlzIHJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uLnR5cGUuZ2V0KCldXG4gICAgICApO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbltdfSBfcmVsYXRpb25zXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgYWRkUmVsYXRpb25zKF9yZWxhdGlvbnMpIHtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX3JlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IHJlbGF0aW9uID0gX3JlbGF0aW9uc1tpbmRleF07XG4gICAgICB0aGlzLmFkZFJlbGF0aW9uKHJlbGF0aW9uKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFscmVsYXRpb259IHJlbGF0aW9uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgX2NsYXNzaWZ5UmVsYXRpb24ocmVsYXRpb24sIGFwcE5hbWUpIHtcbiAgICB0aGlzLnJlbGF0aW9uTGlzdC5sb2FkKHJlbGF0aW9uTGlzdCA9PiB7XG4gICAgICByZWxhdGlvbkxpc3QucHVzaChyZWxhdGlvbik7XG4gICAgfSk7XG4gICAgaWYgKHRoaXMucmVsYXRpb25MaXN0QnlUeXBlW3JlbGF0aW9uLnR5cGUuZ2V0KCldKSB7XG4gICAgICB0aGlzLnJlbGF0aW9uTGlzdEJ5VHlwZVtyZWxhdGlvbi50eXBlLmdldCgpXS5sb2FkKHJlbGF0aW9uTGlzdE9mVHlwZSA9PiB7XG4gICAgICAgIHJlbGF0aW9uTGlzdE9mVHlwZS5wdXNoKHJlbGF0aW9uKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcmVsYXRpb25MaXN0T2ZUeXBlID0gbmV3IExzdCgpO1xuICAgICAgcmVsYXRpb25MaXN0T2ZUeXBlLnB1c2gocmVsYXRpb24pO1xuICAgICAgdGhpcy5yZWxhdGlvbkxpc3RCeVR5cGUuYWRkX2F0dHIoe1xuICAgICAgICBbcmVsYXRpb24udHlwZS5nZXQoKV06IG5ldyBQdHIocmVsYXRpb25MaXN0T2ZUeXBlKVxuICAgICAgfSk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgYXBwTmFtZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgaWYgKHRoaXMuY29udGFpbnNBcHAoYXBwTmFtZSkpXG4gICAgICAgIHRoaXMuYXBwc0xpc3RbYXBwTmFtZV0ubG9hZChhcHAgPT4ge1xuICAgICAgICAgIGlmICh0eXBlb2YgYXBwW3JlbGF0aW9uLnR5cGUuZ2V0KCldID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICBhcHAuYWRkUmVsYXRpb24ocmVsYXRpb24pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKmNoZWNrcyBpZiB0aGlzIGdyYXBoIGNvbnRhaW5zIGNvbnRhaW5zIGEgc3BlY2lmaWMgQXBwXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEByZXR1cm5zIEJvb2xlYW5cbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBjb250YWluc0FwcChhcHBOYW1lKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB0aGlzLmFwcHNMaXN0W2FwcE5hbWVdICE9PSBcInVuZGVmaW5lZFwiO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBpc1Jlc2VydmVkKHJlbGF0aW9uVHlwZSkge1xuICAgIHJldHVybiB0eXBlb2YgdGhpcy5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uVHlwZV0gIT09IFwidW5kZWZpbmVkXCI7XG4gIH1cbiAgLyoqXG4gICAqICBjaGVja3MgaWYgdGhlIGFwcCBoYXMgdGhlIHJpZ2h0IHRvIHVzZSBhIHJlc2VydmVkIHJlbGF0aW9uXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFwcE5hbWVcbiAgICogQHJldHVybnMgYm9vbGVhblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIGhhc1Jlc2VydmF0aW9uQ3JlZGVudGlhbHMocmVsYXRpb25UeXBlLCBhcHBOYW1lKSB7XG4gICAgcmV0dXJuICghdGhpcy5pc1Jlc2VydmVkKHJlbGF0aW9uVHlwZSkgfHxcbiAgICAgICh0aGlzLmlzUmVzZXJ2ZWQocmVsYXRpb25UeXBlKSAmJlxuICAgICAgICB0aGlzLnJlc2VydmVkUmVsYXRpb25zTmFtZXMocmVsYXRpb25UeXBlKSA9PT0gYXBwTmFtZSlcbiAgICApO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9uc30gcmVsYXRpb25zXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgX2NsYXNzaWZ5UmVsYXRpb25zKF9yZWxhdGlvbnMpIHtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX3JlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHRoaXMuX2NsYXNzaWZ5UmVsYXRpb24oX3JlbGF0aW9uc1tpbmRleF0pO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxOb2RlW119IF9saXN0XG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgX2FkZE5vdEV4aXN0aW5nTm9kZXNGcm9tTGlzdChfbGlzdCkge1xuICAgIHRoaXMubm9kZUxpc3QubG9hZChub2RlTGlzdCA9PiB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IF9saXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxldCBub2RlID0gX2xpc3RbaV07XG4gICAgICAgIGlmICghVXRpbGl0aWVzLmNvbnRhaW5zTHN0QnlJZChub2RlTGlzdCwgbm9kZSkpIHtcbiAgICAgICAgICB0aGlzLmNsYXNzaWZ5Tm9kZShub2RlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9uW119IF9yZWxhdGlvblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIF9hZGROb3RFeGlzdGluZ05vZGVzRnJvbVJlbGF0aW9uKF9yZWxhdGlvbikge1xuICAgIHRoaXMuX2FkZE5vdEV4aXN0aW5nTm9kZXNGcm9tTGlzdChfcmVsYXRpb24ubm9kZUxpc3QxKTtcbiAgICB0aGlzLl9hZGROb3RFeGlzdGluZ05vZGVzRnJvbUxpc3QoX3JlbGF0aW9uLm5vZGVMaXN0Mik7XG4gIH1cblxuICAvLyBhc3luYyBnZXRBbGxDb250ZXh0cygpIHtcbiAgLy8gICBsZXQgcmVzID0gW11cbiAgLy8gICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5hcHBzTGlzdC5fYXR0cmlidXRlX25hbWVzLmxlbmd0aDsgaW5kZXgrKykge1xuICAvLyAgICAgbGV0IGtleSA9IHRoaXMuYXBwc0xpc3QuX2F0dHJpYnV0ZV9uYW1lc1tpbmRleF1cbiAgLy8gICAgIGlmIChrZXkuaW5jbHVkZXMoXCJfQ1wiLCBrZXkubGVuZ3RoIC0gMikpIHtcbiAgLy8gICAgICAgY29uc3QgY29udGV4dCA9IHRoaXMuYXBwc0xpc3Rba2V5XTtcbiAgLy8gICAgICAgcmVzLnB1c2goYXdhaXQgVXRpbGl0aWVzLnByb21pc2VMb2FkKGNvbnRleHQpKVxuICAvLyAgICAgfVxuXG4gIC8vICAgfVxuICAvLyAgIHJldHVybiByZXM7XG4gIC8vIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBUeXBlXG4gICAqIEByZXR1cm5zIGFsbCBBcHBzIG9mIGEgc3BlY2lmaWMgdHlwZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIGFzeW5jIGdldEFwcHNCeVR5cGUoYXBwVHlwZSkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5hcHBzTGlzdEJ5VHlwZVthcHBUeXBlXSAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgIHJldHVybiBhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQodGhpcy5hcHBzTGlzdEJ5VHlwZVthcHBUeXBlXSk7XG4gIH1cblxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHBhcmFtIHtzdHJpbmdbXX0gcmVsYXRpb25zVHlwZXNMc3RcbiAgICogQHBhcmFtIHtPYmplY3RbXX0gbW9kZWxzXG4gICAqIEBwYXJhbSB7TW9kZWx9IFtJbnRlcmFjdGlvbnM9IG5ldyBNb2RlbCgpXVxuICAgKiBAcGFyYW0ge1NwaW5hTm9kZX0gW3N0YXJ0aW5nTm9kZSA9IG5ldyBTcGluYWxOb2RlKG5ldyBBYnN0cmFjdEVsZW1lbnQoX25hbWUsIFwicm9vdFwiKSldXG4gICAqIEBwYXJhbSB7U3BpbmFsR3JhcGh9IFtyZWxhdGVkR3JhcGg9dGhpc11cbiAgICogQHJldHVybnMgQSBwcm9taXNlIG9mIHRoZSBjcmVhdGVkIENvbnRleHRcbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBhc3luYyBnZXRDb250ZXh0KFxuICAgIG5hbWUsXG4gICAgcmVsYXRpb25zVHlwZXNMc3QsXG4gICAgbW9kZWxzLFxuICAgIEludGVyYWN0aW9ucyxcbiAgICBzdGFydGluZ05vZGUsXG4gICAgcmVsYXRlZEdyYXBoID0gdGhpc1xuICApIHtcbiAgICBpZiAodHlwZW9mIHRoaXMuYXBwc0xpc3RbbmFtZV0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGxldCBjb250ZXh0ID0gbmV3IFNwaW5hbENvbnRleHQoXG4gICAgICAgIG5hbWUsXG4gICAgICAgIHJlbGF0aW9uc1R5cGVzTHN0LFxuICAgICAgICBtb2RlbHMsXG4gICAgICAgIEludGVyYWN0aW9ucyxcbiAgICAgICAgc3RhcnRpbmdOb2RlLFxuICAgICAgICByZWxhdGVkR3JhcGhcbiAgICAgICk7XG4gICAgICB0aGlzLmFwcHNMaXN0LmFkZF9hdHRyKHtcbiAgICAgICAgW25hbWVdOiBuZXcgUHRyKGNvbnRleHQpXG4gICAgICB9KTtcblxuICAgICAgY29udGV4dC50eXBlLnNldChcImNvbnRleHRcIilcblxuICAgICAgaWYgKHR5cGVvZiB0aGlzLmFwcHNMaXN0QnlUeXBlLmNvbnRleHQgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgdGhpcy5hcHBzTGlzdEJ5VHlwZS5hZGRfYXR0cih7XG4gICAgICAgICAgY29udGV4dDogbmV3IE1vZGVsKClcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICB0aGlzLmFwcHNMaXN0QnlUeXBlLmNvbnRleHQuYWRkX2F0dHIoe1xuICAgICAgICBbbmFtZV06IHRoaXMuYXBwc0xpc3RbbmFtZV1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGNvbnRleHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQodGhpcy5hcHBzTGlzdFtuYW1lXSk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0ge3N0cmluZ1tdfSByZWxhdGlvbnNUeXBlc0xzdFxuICAgKiBAcGFyYW0ge1NwaW5hbEdyYXBofSBbcmVsYXRlZFNwaW5hbEdyYXBoPXRoaXNdXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSBvZiB0aGUgY3JlYXRlZCBBcHBcbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBhc3luYyBnZXRBcHAobmFtZSwgcmVsYXRpb25zVHlwZXNMc3QsIHJlbGF0ZWRTcGluYWxHcmFwaCA9IHRoaXMpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMuYXBwc0xpc3RbbmFtZV0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGxldCBzcGluYWxBcHBsaWNhdGlvbiA9IG5ldyBTcGluYWxBcHBsaWNhdGlvbihcbiAgICAgICAgbmFtZSxcbiAgICAgICAgcmVsYXRpb25zVHlwZXNMc3QsXG4gICAgICAgIHJlbGF0ZWRTcGluYWxHcmFwaFxuICAgICAgKTtcbiAgICAgIHRoaXMuYXBwc0xpc3QuYWRkX2F0dHIoe1xuICAgICAgICBbbmFtZV06IG5ldyBQdHIoc3BpbmFsQXBwbGljYXRpb24pXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBzcGluYWxBcHBsaWNhdGlvbjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGF3YWl0IFV0aWxpdGllcy5wcm9taXNlTG9hZCh0aGlzLmFwcHNMaXN0W25hbWVdKTtcbiAgICAgIC8vIGNvbnNvbGUuZXJyb3IoXG4gICAgICAvLyAgIG5hbWUgK1xuICAgICAgLy8gICBcIiBhcyB3ZWxsIGFzIFwiICtcbiAgICAgIC8vICAgdGhpcy5nZXRBcHBzTmFtZXMoKSArXG4gICAgICAvLyAgIFwiIGhhdmUgYmVlbiBhbHJlYWR5IHVzZWQsIHBsZWFzZSBjaG9vc2UgYW5vdGhlciBhcHBsaWNhdGlvbiBuYW1lXCJcbiAgICAgIC8vICk7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgYW4gYXJyYXkgb2YgYXBwcyBuYW1lc1xuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIGdldEFwcHNOYW1lcygpIHtcbiAgICByZXR1cm4gdGhpcy5hcHBzTGlzdC5fYXR0cmlidXRlX25hbWVzO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEBwYXJhbSB7U3BpbmFsQXBwbGljYXRpb259IGFwcFxuICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgcmVzZXJ2ZVVuaXF1ZVJlbGF0aW9uVHlwZShyZWxhdGlvblR5cGUsIGFwcCkge1xuICAgIGlmIChcbiAgICAgIHR5cGVvZiB0aGlzLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb25UeXBlXSA9PT0gXCJ1bmRlZmluZWRcIiAmJlxuICAgICAgdHlwZW9mIHRoaXMucmVsYXRpb25MaXN0QnlUeXBlW3JlbGF0aW9uVHlwZV0gPT09IFwidW5kZWZpbmVkXCJcbiAgICApIHtcbiAgICAgIHRoaXMucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lcy5hZGRfYXR0cih7XG4gICAgICAgIFtyZWxhdGlvblR5cGVdOiBhcHAubmFtZS5nZXQoKVxuICAgICAgfSk7XG4gICAgICBhcHAuYWRkUmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgdHlwZW9mIHRoaXMucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvblR5cGVdICE9PSBcInVuZGVmaW5lZFwiXG4gICAgKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICByZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBoYXMgbm90IGJlZW4gYWRkZWQgdG8gYXBwOiBcIiArXG4gICAgICAgIGFwcC5uYW1lLmdldCgpICtcbiAgICAgICAgXCIsQ2F1c2UgOiBhbHJlYWR5IFJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uVHlwZV1cbiAgICAgICk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5yZWxhdGlvbkxpc3RCeVR5cGVbcmVsYXRpb25UeXBlXSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgaGFzIG5vdCBiZWVuIGFkZGVkIHRvIGFwcDogXCIgK1xuICAgICAgICBhcHAubmFtZS5nZXQoKSArXG4gICAgICAgIFwiLENhdXNlIDogYWxyZWFkeSBVc2VkIGJ5IG90aGVyIEFwcHNcIlxuICAgICAgKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU3BpbmFsR3JhcGg7XG5zcGluYWxDb3JlLnJlZ2lzdGVyX21vZGVscyhbU3BpbmFsR3JhcGhdKTtcbiJdfQ==