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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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
   * @param {number} _dbId
   * @returns Promise of the corresponding Node or the created one if not existing
   * @memberof SpinalGraph
   */
  getNodeBydbId(_dbId) {
    var _this = this;

    return _asyncToGenerator(function* () {
      let _externalId = yield _Utilities.Utilities.getExternalId(_dbId);
      if (typeof _this.externalIdNodeMapping[_externalId] !== "undefined") return _this.externalIdNodeMapping[_externalId];else {
        let BIMElement1 = new _BIMElement2.default(_dbId);
        BIMElement1.initExternalId();
        let node = yield _this.addNodeAsync(BIMElement1);
        if (BIMElement1.type.get() === "") {
          BIMElement1.type.bind(_this._classifyBIMElementNode.bind(_this, node));
        }
        return node;
      }
    })();
  }
  /**
   *
   *
   * @param {SpinalNode} _node
   * @memberof SpinalGraph
   */
  _classifyBIMElementNode(_node) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      //TODO DELETE OLD CLASSIFICATION
      _this2.classifyNode(_node);
    })();
  }
  /**
   *
   *
   * @param {SpinalNode} _node
   * @returns Promise of dbId [number]
   * @memberof SpinalGraph
   */
  getDbIdByNode(_node) {
    return _asyncToGenerator(function* () {
      let element = yield _Utilities.Utilities.promiseLoad(_node.element);
      if (element instanceof _BIMElement2.default) {
        return element.id.get();
      }
    })();
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
  _addExternalIdNodeMappingEntry(_ElementId, _node) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      let _dbid = _ElementId.get();
      if (typeof _dbid == "number") if (_dbid != 0) {
        let externalId = yield _Utilities.Utilities.getExternalId(_dbid);
        let element = yield _Utilities.Utilities.promiseLoad(_node.element);
        yield element.initExternalId();
        if (typeof _this3.externalIdNodeMapping[externalId] === "undefined") _this3.externalIdNodeMapping.add_attr({
          [externalId]: _node
        });
        _ElementId.unbind(_this3._addExternalIdNodeMappingEntry.bind(_this3, _ElementId, _node));
      }
    })();
  }
  /**
   *
   *
   * @param {Model} _element - any subclass of Model
   * @returns Promise of the created Node
   * @memberof SpinalGraph
   */
  addNodeAsync(_element) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      let name = "";
      if (_element instanceof _BIMElement2.default) {
        yield _element.initExternalIdAsync();
        if (typeof _this4.externalIdNodeMapping[_element.externalId.get()] !== "undefined") {
          console.log("BIM OBJECT NODE ALREADY EXISTS");
          return _this4.externalIdNodeMapping[_element.externalId.get()];
        }
      } else if (_element instanceof _AbstractElement2.default) {
        if (typeof _this4.guidAbstractNodeMapping[_element.id.get()] !== "undefined") {
          console.log("ABSTRACT OBJECT NODE ALREADY EXISTS");
          return _this4.guidAbstractNodeMapping[_element.id.get()];
        }
      }
      if (typeof _element.name !== "undefined") {
        name = _element.name.get();
      }
      let node = new _SpinalNode2.default(name, _element, _this4);
      return node;
    })();
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
  addSimpleRelationAsync(_relationType, _node, _element, _isDirected = false) {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      if (!_this5.isReserved(_relationType)) {
        let node2 = yield _this5.addNodeAsync(_element);
        let rel = new _SpinalRelation2.default(_relationType, [_node], [node2], _isDirected);
        _this5.addRelation(rel);
        return rel;
      } else {
        console.log(_relationType + " is reserved by " + _this5.reservedRelationsNames[_relationType]);
      }
    })();
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
  getAppsByType(appType) {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      if (typeof _this6.appsListByType[appType] !== "undefined") return yield _Utilities.Utilities.promiseLoad(_this6.appsListByType[appType]);
    })();
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
  getContext(name, relationsTypesLst, models, Interactions, startingNode, relatedGraph = this) {
    var _this7 = this;

    return _asyncToGenerator(function* () {
      if (typeof _this7.appsList[name] === "undefined") {
        let context = new _SpinalContext2.default(name, relationsTypesLst, models, Interactions, startingNode, relatedGraph);
        _this7.appsList.add_attr({
          [name]: new Ptr(context)
        });

        context.type.set("context");

        if (typeof _this7.appsListByType.context === "undefined") {
          _this7.appsListByType.add_attr({
            context: new Model()
          });
        }
        _this7.appsListByType.context.add_attr({
          [name]: _this7.appsList[name]
        });
        return context;
      } else {
        return yield _Utilities.Utilities.promiseLoad(_this7.appsList[name]);
      }
    })();
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
  getApp(name, relationsTypesLst, relatedSpinalGraph = this) {
    var _this8 = this;

    return _asyncToGenerator(function* () {
      if (typeof _this8.appsList[name] === "undefined") {
        let spinalApplication = new _SpinalApplication2.default(name, relationsTypesLst, relatedSpinalGraph);
        _this8.appsList.add_attr({
          [name]: new Ptr(spinalApplication)
        });
        return spinalApplication;
      } else {
        return yield _Utilities.Utilities.promiseLoad(_this8.appsList[name]);
        // console.error(
        //   name +
        //   " as well as " +
        //   this.getAppsNames() +
        //   " have been already used, please choose another application name"
        // );
      }
    })();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TcGluYWxHcmFwaC5qcyJdLCJuYW1lcyI6WyJzcGluYWxDb3JlIiwicmVxdWlyZSIsImdsb2JhbFR5cGUiLCJ3aW5kb3ciLCJnbG9iYWwiLCJTcGluYWxHcmFwaCIsIk1vZGVsIiwiY29uc3RydWN0b3IiLCJfbmFtZSIsIl9zdGFydGluZ05vZGUiLCJQdHIiLCJuYW1lIiwiRmlsZVN5c3RlbSIsIl9zaWdfc2VydmVyIiwiYWRkX2F0dHIiLCJleHRlcm5hbElkTm9kZU1hcHBpbmciLCJndWlkQWJzdHJhY3ROb2RlTWFwcGluZyIsInN0YXJ0aW5nTm9kZSIsIm5vZGVMaXN0IiwiTHN0Iiwibm9kZUxpc3RCeUVsZW1lbnRUeXBlIiwicmVsYXRpb25MaXN0IiwicmVsYXRpb25MaXN0QnlUeXBlIiwiYXBwc0xpc3QiLCJhcHBzTGlzdEJ5VHlwZSIsInJlc2VydmVkUmVsYXRpb25zTmFtZXMiLCJpbml0Iiwic3BpbmFsIiwiY29udGV4dFN0dWRpbyIsImdyYXBoIiwiU3BpbmFsTm9kZSIsIlNwaW5hbFJlbGF0aW9uIiwiQWJzdHJhY3RFbGVtZW50IiwiQklNRWxlbWVudCIsIlNwaW5hbE5ldHdvcmsiLCJTcGluYWxEZXZpY2UiLCJTcGluYWxFbmRwb2ludCIsIlRpbWVTZXJpZXMiLCJVdGlsaXRpZXMiLCJnZXROb2RlQnlkYklkIiwiX2RiSWQiLCJfZXh0ZXJuYWxJZCIsImdldEV4dGVybmFsSWQiLCJCSU1FbGVtZW50MSIsImluaXRFeHRlcm5hbElkIiwibm9kZSIsImFkZE5vZGVBc3luYyIsInR5cGUiLCJnZXQiLCJiaW5kIiwiX2NsYXNzaWZ5QklNRWxlbWVudE5vZGUiLCJfbm9kZSIsImNsYXNzaWZ5Tm9kZSIsImdldERiSWRCeU5vZGUiLCJlbGVtZW50IiwicHJvbWlzZUxvYWQiLCJpZCIsInNldE5hbWUiLCJzZXQiLCJzZXRTdGFydGluZ05vZGUiLCJfYWRkRXh0ZXJuYWxJZE5vZGVNYXBwaW5nRW50cnkiLCJfRWxlbWVudElkIiwiX2RiaWQiLCJleHRlcm5hbElkIiwidW5iaW5kIiwiX2VsZW1lbnQiLCJpbml0RXh0ZXJuYWxJZEFzeW5jIiwiY29uc29sZSIsImxvZyIsImFkZE5vZGUiLCJ0aGVuIiwicmVsYXRlZEdyYXBoIiwibG9hZCIsInB1c2giLCJub2RlTGlzdE9mVHlwZSIsImFkZFNpbXBsZVJlbGF0aW9uQXN5bmMiLCJfcmVsYXRpb25UeXBlIiwiX2lzRGlyZWN0ZWQiLCJpc1Jlc2VydmVkIiwibm9kZTIiLCJyZWwiLCJhZGRSZWxhdGlvbiIsImFkZFNpbXBsZVJlbGF0aW9uIiwicmVsYXRpb25UeXBlIiwiaXNEaXJlY3RlZCIsImFkZFNpbXBsZVJlbGF0aW9uQnlBcHAiLCJhcHBOYW1lIiwiaGFzUmVzZXJ2YXRpb25DcmVkZW50aWFscyIsImNvbnRhaW5zQXBwIiwiZXJyb3IiLCJyZWxhdGlvbiIsImluZGV4Iiwibm9kZUxpc3QxIiwibGVuZ3RoIiwiYWRkRGlyZWN0ZWRSZWxhdGlvblBhcmVudCIsIm5vZGVMaXN0MiIsImFkZERpcmVjdGVkUmVsYXRpb25DaGlsZCIsImFkZE5vbkRpcmVjdGVkUmVsYXRpb24iLCJfY2xhc3NpZnlSZWxhdGlvbiIsImFkZFJlbGF0aW9ucyIsIl9yZWxhdGlvbnMiLCJyZWxhdGlvbkxpc3RPZlR5cGUiLCJhcHAiLCJfY2xhc3NpZnlSZWxhdGlvbnMiLCJfYWRkTm90RXhpc3RpbmdOb2Rlc0Zyb21MaXN0IiwiX2xpc3QiLCJpIiwiY29udGFpbnNMc3RCeUlkIiwiX2FkZE5vdEV4aXN0aW5nTm9kZXNGcm9tUmVsYXRpb24iLCJfcmVsYXRpb24iLCJnZXRBcHBzQnlUeXBlIiwiYXBwVHlwZSIsImdldENvbnRleHQiLCJyZWxhdGlvbnNUeXBlc0xzdCIsIm1vZGVscyIsIkludGVyYWN0aW9ucyIsImNvbnRleHQiLCJTcGluYWxDb250ZXh0IiwiZ2V0QXBwIiwicmVsYXRlZFNwaW5hbEdyYXBoIiwic3BpbmFsQXBwbGljYXRpb24iLCJTcGluYWxBcHBsaWNhdGlvbiIsImdldEFwcHNOYW1lcyIsIl9hdHRyaWJ1dGVfbmFtZXMiLCJyZXNlcnZlVW5pcXVlUmVsYXRpb25UeXBlIiwiYWRkUmVsYXRpb25UeXBlIiwicmVnaXN0ZXJfbW9kZWxzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUVBOzs7Ozs7QUFiQSxNQUFNQSxhQUFhQyxRQUFRLHlCQUFSLENBQW5CO0FBQ0EsTUFBTUMsYUFBYSxPQUFPQyxNQUFQLEtBQWtCLFdBQWxCLEdBQWdDQyxNQUFoQyxHQUF5Q0QsTUFBNUQ7O0FBZUE7Ozs7O0FBS0EsTUFBTUUsV0FBTixTQUEwQkgsV0FBV0ksS0FBckMsQ0FBMkM7QUFDekM7Ozs7OztBQU1BQyxjQUFZQyxRQUFRLEdBQXBCLEVBQXlCQyxnQkFBZ0IsSUFBSUMsR0FBSixDQUFRLENBQVIsQ0FBekMsRUFBcURDLE9BQU8sYUFBNUQsRUFBMkU7QUFDekU7QUFDQSxRQUFJQyxXQUFXQyxXQUFmLEVBQTRCO0FBQzFCLFdBQUtDLFFBQUwsQ0FBYztBQUNaSCxjQUFNSCxLQURNO0FBRVpPLCtCQUF1QixJQUFJVCxLQUFKLEVBRlg7QUFHWlUsaUNBQXlCLElBQUlWLEtBQUosRUFIYjtBQUlaVyxzQkFBY1IsYUFKRjtBQUtaUyxrQkFBVSxJQUFJUixHQUFKLENBQVEsSUFBSVMsR0FBSixFQUFSLENBTEU7QUFNWkMsK0JBQXVCLElBQUlkLEtBQUosRUFOWDtBQU9aZSxzQkFBYyxJQUFJWCxHQUFKLENBQVEsSUFBSVMsR0FBSixFQUFSLENBUEY7QUFRWkcsNEJBQW9CLElBQUloQixLQUFKLEVBUlI7QUFTWmlCLGtCQUFVLElBQUlqQixLQUFKLEVBVEU7QUFVWmtCLHdCQUFnQixJQUFJbEIsS0FBSixFQVZKO0FBV1ptQixnQ0FBd0IsSUFBSW5CLEtBQUo7QUFYWixPQUFkO0FBYUQ7QUFDRjtBQUNEOzs7O0FBSUFvQixTQUFPO0FBQ0x4QixlQUFXeUIsTUFBWCxDQUFrQkMsYUFBbEIs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R0FBVCxFQUZBLEdBR0EscUNBSkY7QUFNRDtBQUNGO0FBMW9Cd0M7O2tCQTZvQjVCM0MsVzs7QUFDZkwsV0FBVzhILGVBQVgsQ0FBMkIsQ0FBQ3pILFdBQUQsQ0FBM0IiLCJmaWxlIjoiU3BpbmFsR3JhcGguanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBzcGluYWxDb3JlID0gcmVxdWlyZShcInNwaW5hbC1jb3JlLWNvbm5lY3RvcmpzXCIpO1xuY29uc3QgZ2xvYmFsVHlwZSA9IHR5cGVvZiB3aW5kb3cgPT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB3aW5kb3c7XG5pbXBvcnQgU3BpbmFsTm9kZSBmcm9tIFwiLi9TcGluYWxOb2RlXCI7XG5pbXBvcnQgU3BpbmFsUmVsYXRpb24gZnJvbSBcIi4vU3BpbmFsUmVsYXRpb25cIjtcbmltcG9ydCBBYnN0cmFjdEVsZW1lbnQgZnJvbSBcIi4vQWJzdHJhY3RFbGVtZW50XCI7XG5pbXBvcnQgQklNRWxlbWVudCBmcm9tIFwiLi9CSU1FbGVtZW50XCI7XG5pbXBvcnQgU3BpbmFsQXBwbGljYXRpb24gZnJvbSBcIi4vU3BpbmFsQXBwbGljYXRpb25cIjtcbmltcG9ydCBTcGluYWxDb250ZXh0IGZyb20gXCIuL1NwaW5hbENvbnRleHRcIjtcbmltcG9ydCBTcGluYWxOZXR3b3JrIGZyb20gXCIuL1NwaW5hbE5ldHdvcmtcIjtcbmltcG9ydCBTcGluYWxEZXZpY2UgZnJvbSBcIi4vU3BpbmFsRGV2aWNlXCI7XG5pbXBvcnQgU3BpbmFsRW5kcG9pbnQgZnJvbSBcIi4vU3BpbmFsRW5kcG9pbnRcIjtcbmltcG9ydCBUaW1lU2VyaWVzIGZyb20gXCIuL1RpbWVTZXJpZXNcIjtcblxuaW1wb3J0IHtcbiAgVXRpbGl0aWVzXG59IGZyb20gXCIuL1V0aWxpdGllc1wiO1xuLyoqXG4gKiBUaGUgY29yZSBvZiB0aGUgaW50ZXJhY3Rpb25zIGJldHdlZW4gdGhlIEJJTUVsZW1lbnRzIE5vZGVzIGFuZCBvdGhlciBOb2RlcyhEb2NzLCBUaWNrZXRzLCBldGMgLi4pXG4gKiBAY2xhc3MgU3BpbmFsR3JhcGhcbiAqIEBleHRlbmRzIHtNb2RlbH1cbiAqL1xuY2xhc3MgU3BpbmFsR3JhcGggZXh0ZW5kcyBnbG9iYWxUeXBlLk1vZGVsIHtcbiAgLyoqXG4gICAqQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBTcGluYWxHcmFwaC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IFtfbmFtZT10XVxuICAgKiBAcGFyYW0ge1B0cn0gW19zdGFydGluZ05vZGU9bmV3IFB0cigwKV1cbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBjb25zdHJ1Y3RvcihfbmFtZSA9IFwidFwiLCBfc3RhcnRpbmdOb2RlID0gbmV3IFB0cigwKSwgbmFtZSA9IFwiU3BpbmFsR3JhcGhcIikge1xuICAgIHN1cGVyKCk7XG4gICAgaWYgKEZpbGVTeXN0ZW0uX3NpZ19zZXJ2ZXIpIHtcbiAgICAgIHRoaXMuYWRkX2F0dHIoe1xuICAgICAgICBuYW1lOiBfbmFtZSxcbiAgICAgICAgZXh0ZXJuYWxJZE5vZGVNYXBwaW5nOiBuZXcgTW9kZWwoKSxcbiAgICAgICAgZ3VpZEFic3RyYWN0Tm9kZU1hcHBpbmc6IG5ldyBNb2RlbCgpLFxuICAgICAgICBzdGFydGluZ05vZGU6IF9zdGFydGluZ05vZGUsXG4gICAgICAgIG5vZGVMaXN0OiBuZXcgUHRyKG5ldyBMc3QoKSksXG4gICAgICAgIG5vZGVMaXN0QnlFbGVtZW50VHlwZTogbmV3IE1vZGVsKCksXG4gICAgICAgIHJlbGF0aW9uTGlzdDogbmV3IFB0cihuZXcgTHN0KCkpLFxuICAgICAgICByZWxhdGlvbkxpc3RCeVR5cGU6IG5ldyBNb2RlbCgpLFxuICAgICAgICBhcHBzTGlzdDogbmV3IE1vZGVsKCksXG4gICAgICAgIGFwcHNMaXN0QnlUeXBlOiBuZXcgTW9kZWwoKSxcbiAgICAgICAgcmVzZXJ2ZWRSZWxhdGlvbnNOYW1lczogbmV3IE1vZGVsKClcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpmdW5jdGlvblxuICAgKlRvIHB1dCB1c2VkIGZ1bmN0aW9ucyBhcyB3ZWxsIGFzIHRoZSBTcGluYWxHcmFwaCBtb2RlbCBpbiB0aGUgZ2xvYmFsIHNjb3BlXG4gICAqL1xuICBpbml0KCkge1xuICAgIGdsb2JhbFR5cGUuc3BpbmFsLmNvbnRleHRTdHVkaW8gPSB7fTtcbiAgICBnbG9iYWxUeXBlLnNwaW5hbC5jb250ZXh0U3R1ZGlvLmdyYXBoID0gdGhpcztcbiAgICBnbG9iYWxUeXBlLnNwaW5hbC5jb250ZXh0U3R1ZGlvLlNwaW5hbE5vZGUgPSBTcGluYWxOb2RlO1xuICAgIGdsb2JhbFR5cGUuc3BpbmFsLmNvbnRleHRTdHVkaW8uU3BpbmFsUmVsYXRpb24gPSBTcGluYWxSZWxhdGlvbjtcbiAgICBnbG9iYWxUeXBlLnNwaW5hbC5jb250ZXh0U3R1ZGlvLkFic3RyYWN0RWxlbWVudCA9IEFic3RyYWN0RWxlbWVudDtcbiAgICBnbG9iYWxUeXBlLnNwaW5hbC5jb250ZXh0U3R1ZGlvLkJJTUVsZW1lbnQgPSBCSU1FbGVtZW50O1xuICAgIGdsb2JhbFR5cGUuc3BpbmFsLmNvbnRleHRTdHVkaW8uU3BpbmFsTmV0d29yayA9IFNwaW5hbE5ldHdvcms7XG4gICAgZ2xvYmFsVHlwZS5zcGluYWwuY29udGV4dFN0dWRpby5TcGluYWxEZXZpY2UgPSBTcGluYWxEZXZpY2U7XG4gICAgZ2xvYmFsVHlwZS5zcGluYWwuY29udGV4dFN0dWRpby5TcGluYWxFbmRwb2ludCA9IFNwaW5hbEVuZHBvaW50O1xuICAgIGdsb2JhbFR5cGUuc3BpbmFsLmNvbnRleHRTdHVkaW8uVGltZVNlcmllcyA9IFRpbWVTZXJpZXM7XG4gICAgZ2xvYmFsVHlwZS5zcGluYWwuY29udGV4dFN0dWRpby5VdGlsaXRpZXMgPSBVdGlsaXRpZXM7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBfZGJJZFxuICAgKiBAcmV0dXJucyBQcm9taXNlIG9mIHRoZSBjb3JyZXNwb25kaW5nIE5vZGUgb3IgdGhlIGNyZWF0ZWQgb25lIGlmIG5vdCBleGlzdGluZ1xuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIGFzeW5jIGdldE5vZGVCeWRiSWQoX2RiSWQpIHtcbiAgICBsZXQgX2V4dGVybmFsSWQgPSBhd2FpdCBVdGlsaXRpZXMuZ2V0RXh0ZXJuYWxJZChfZGJJZCk7XG4gICAgaWYgKHR5cGVvZiB0aGlzLmV4dGVybmFsSWROb2RlTWFwcGluZ1tfZXh0ZXJuYWxJZF0gIT09IFwidW5kZWZpbmVkXCIpXG4gICAgICByZXR1cm4gdGhpcy5leHRlcm5hbElkTm9kZU1hcHBpbmdbX2V4dGVybmFsSWRdO1xuICAgIGVsc2Uge1xuICAgICAgbGV0IEJJTUVsZW1lbnQxID0gbmV3IEJJTUVsZW1lbnQoX2RiSWQpO1xuICAgICAgQklNRWxlbWVudDEuaW5pdEV4dGVybmFsSWQoKTtcbiAgICAgIGxldCBub2RlID0gYXdhaXQgdGhpcy5hZGROb2RlQXN5bmMoQklNRWxlbWVudDEpO1xuICAgICAgaWYgKEJJTUVsZW1lbnQxLnR5cGUuZ2V0KCkgPT09IFwiXCIpIHtcbiAgICAgICAgQklNRWxlbWVudDEudHlwZS5iaW5kKHRoaXMuX2NsYXNzaWZ5QklNRWxlbWVudE5vZGUuYmluZCh0aGlzLCBub2RlKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbm9kZTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZX0gX25vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBhc3luYyBfY2xhc3NpZnlCSU1FbGVtZW50Tm9kZShfbm9kZSkge1xuICAgIC8vVE9ETyBERUxFVEUgT0xEIENMQVNTSUZJQ0FUSU9OXG4gICAgdGhpcy5jbGFzc2lmeU5vZGUoX25vZGUpO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGV9IF9ub2RlXG4gICAqIEByZXR1cm5zIFByb21pc2Ugb2YgZGJJZCBbbnVtYmVyXVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIGFzeW5jIGdldERiSWRCeU5vZGUoX25vZGUpIHtcbiAgICBsZXQgZWxlbWVudCA9IGF3YWl0IFV0aWxpdGllcy5wcm9taXNlTG9hZChfbm9kZS5lbGVtZW50KTtcbiAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEJJTUVsZW1lbnQpIHtcbiAgICAgIHJldHVybiBlbGVtZW50LmlkLmdldCgpO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IF9uYW1lXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgc2V0TmFtZShfbmFtZSkge1xuICAgIHRoaXMubmFtZS5zZXQoX25hbWUpO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1B0cn0gX3N0YXJ0aW5nTm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIHNldFN0YXJ0aW5nTm9kZShfc3RhcnRpbmdOb2RlKSB7XG4gICAgdGhpcy5zdGFydGluZ05vZGUuc2V0KF9zdGFydGluZ05vZGUpO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gX0VsZW1lbnRJZCAtIHRoZSBFbGVtZW50IEV4dGVybmFsSWRcbiAgICogQHBhcmFtIHtTcGluYWxOb2RlfSBfbm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIGFzeW5jIF9hZGRFeHRlcm5hbElkTm9kZU1hcHBpbmdFbnRyeShfRWxlbWVudElkLCBfbm9kZSkge1xuICAgIGxldCBfZGJpZCA9IF9FbGVtZW50SWQuZ2V0KCk7XG4gICAgaWYgKHR5cGVvZiBfZGJpZCA9PSBcIm51bWJlclwiKVxuICAgICAgaWYgKF9kYmlkICE9IDApIHtcbiAgICAgICAgbGV0IGV4dGVybmFsSWQgPSBhd2FpdCBVdGlsaXRpZXMuZ2V0RXh0ZXJuYWxJZChfZGJpZCk7XG4gICAgICAgIGxldCBlbGVtZW50ID0gYXdhaXQgVXRpbGl0aWVzLnByb21pc2VMb2FkKF9ub2RlLmVsZW1lbnQpO1xuICAgICAgICBhd2FpdCBlbGVtZW50LmluaXRFeHRlcm5hbElkKCk7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5leHRlcm5hbElkTm9kZU1hcHBpbmdbZXh0ZXJuYWxJZF0gPT09IFwidW5kZWZpbmVkXCIpXG4gICAgICAgICAgdGhpcy5leHRlcm5hbElkTm9kZU1hcHBpbmcuYWRkX2F0dHIoe1xuICAgICAgICAgICAgW2V4dGVybmFsSWRdOiBfbm9kZVxuICAgICAgICAgIH0pO1xuICAgICAgICBfRWxlbWVudElkLnVuYmluZChcbiAgICAgICAgICB0aGlzLl9hZGRFeHRlcm5hbElkTm9kZU1hcHBpbmdFbnRyeS5iaW5kKHRoaXMsIF9FbGVtZW50SWQsXG4gICAgICAgICAgICBfbm9kZSlcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtNb2RlbH0gX2VsZW1lbnQgLSBhbnkgc3ViY2xhc3Mgb2YgTW9kZWxcbiAgICogQHJldHVybnMgUHJvbWlzZSBvZiB0aGUgY3JlYXRlZCBOb2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgYXN5bmMgYWRkTm9kZUFzeW5jKF9lbGVtZW50KSB7XG4gICAgbGV0IG5hbWUgPSBcIlwiO1xuICAgIGlmIChfZWxlbWVudCBpbnN0YW5jZW9mIEJJTUVsZW1lbnQpIHtcbiAgICAgIGF3YWl0IF9lbGVtZW50LmluaXRFeHRlcm5hbElkQXN5bmMoKTtcbiAgICAgIGlmIChcbiAgICAgICAgdHlwZW9mIHRoaXMuZXh0ZXJuYWxJZE5vZGVNYXBwaW5nW19lbGVtZW50LmV4dGVybmFsSWQuZ2V0KCldICE9PVxuICAgICAgICBcInVuZGVmaW5lZFwiXG4gICAgICApIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJCSU0gT0JKRUNUIE5PREUgQUxSRUFEWSBFWElTVFNcIik7XG4gICAgICAgIHJldHVybiB0aGlzLmV4dGVybmFsSWROb2RlTWFwcGluZ1tfZWxlbWVudC5leHRlcm5hbElkLmdldCgpXTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKF9lbGVtZW50IGluc3RhbmNlb2YgQWJzdHJhY3RFbGVtZW50KSB7XG4gICAgICBpZiAoXG4gICAgICAgIHR5cGVvZiB0aGlzLmd1aWRBYnN0cmFjdE5vZGVNYXBwaW5nW19lbGVtZW50LmlkLmdldCgpXSAhPT1cbiAgICAgICAgXCJ1bmRlZmluZWRcIlxuICAgICAgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQUJTVFJBQ1QgT0JKRUNUIE5PREUgQUxSRUFEWSBFWElTVFNcIik7XG4gICAgICAgIHJldHVybiB0aGlzLmd1aWRBYnN0cmFjdE5vZGVNYXBwaW5nW19lbGVtZW50LmlkLmdldCgpXTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHR5cGVvZiBfZWxlbWVudC5uYW1lICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBuYW1lID0gX2VsZW1lbnQubmFtZS5nZXQoKTtcbiAgICB9XG4gICAgbGV0IG5vZGUgPSBuZXcgU3BpbmFsTm9kZShuYW1lLCBfZWxlbWVudCwgdGhpcyk7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7TW9kZWx9IF9lbGVtZW50IC0gYW55IHN1YmNsYXNzIG9mIE1vZGVsXG4gICAqIEByZXR1cm5zIHRoZSBjcmVhdGVkIE5vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBhZGROb2RlKF9lbGVtZW50KSB7XG4gICAgbGV0IG5hbWUgPSBcIlwiO1xuICAgIGlmIChfZWxlbWVudCBpbnN0YW5jZW9mIEJJTUVsZW1lbnQpIHtcbiAgICAgIF9lbGVtZW50LmluaXRFeHRlcm5hbElkKCk7XG4gICAgICBpZiAoXG4gICAgICAgIHR5cGVvZiB0aGlzLmV4dGVybmFsSWROb2RlTWFwcGluZ1tfZWxlbWVudC5leHRlcm5hbElkLmdldCgpXSAhPT1cbiAgICAgICAgXCJ1bmRlZmluZWRcIlxuICAgICAgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQklNIE9CSkVDVCBOT0RFIEFMUkVBRFkgRVhJU1RTXCIpO1xuICAgICAgICByZXR1cm4gdGhpcy5leHRlcm5hbElkTm9kZU1hcHBpbmdbX2VsZW1lbnQuZXh0ZXJuYWxJZC5nZXQoKV07XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChfZWxlbWVudCBpbnN0YW5jZW9mIEFic3RyYWN0RWxlbWVudCkge1xuICAgICAgaWYgKFxuICAgICAgICB0eXBlb2YgdGhpcy5ndWlkQWJzdHJhY3ROb2RlTWFwcGluZ1tfZWxlbWVudC5pZC5nZXQoKV0gIT09XG4gICAgICAgIFwidW5kZWZpbmVkXCJcbiAgICAgICkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkFCU1RSQUNUIE9CSkVDVCBOT0RFIEFMUkVBRFkgRVhJU1RTXCIpO1xuICAgICAgICByZXR1cm4gdGhpcy5ndWlkQWJzdHJhY3ROb2RlTWFwcGluZ1tfZWxlbWVudC5pZC5nZXQoKV07XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0eXBlb2YgX2VsZW1lbnQubmFtZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgbmFtZSA9IF9lbGVtZW50Lm5hbWUuZ2V0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5hbWUgPSBfZWxlbWVudC5jb25zdHJ1Y3Rvci5uYW1lO1xuICAgIH1cbiAgICBsZXQgbm9kZSA9IG5ldyBTcGluYWxOb2RlKG5hbWUsIF9lbGVtZW50LCB0aGlzKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIC8qKlxuICAgKiAgT2JzZXJ2ZXMgdGhlIHR5cGUgb2YgdGhlIGVsZW1lbnQgaW5zaWRlIHRoZSBub2RlIGFkZCBDbGFzc2lmeSBpdC5cbiAgICogIEl0IHB1dHMgaXQgaW4gdGhlIFVuY2xhc3NpZmllZCBsaXN0IE90aGVyd2lzZS5cbiAgICogSXQgYWRkcyB0aGUgbm9kZSB0byB0aGUgbWFwcGluZyBsaXN0IHdpdGggRXh0ZXJuYWxJZCBpZiB0aGUgT2JqZWN0IGlzIG9mIHR5cGUgQklNRWxlbWVudFxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGV9IF9ub2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgY2xhc3NpZnlOb2RlKF9ub2RlKSB7XG4gICAgVXRpbGl0aWVzLnByb21pc2VMb2FkKF9ub2RlLmVsZW1lbnQpLnRoZW4oZWxlbWVudCA9PiB7XG4gICAgICBpZiAodHlwZW9mIF9ub2RlLnJlbGF0ZWRHcmFwaCA9PT0gXCJ1bmRlZmluZWRcIilcbiAgICAgICAgX25vZGUucmVsYXRlZEdyYXBoLnNldCh0aGlzKTtcbiAgICAgIHRoaXMubm9kZUxpc3QubG9hZChub2RlTGlzdCA9PiB7XG4gICAgICAgIG5vZGVMaXN0LnB1c2goX25vZGUpO1xuICAgICAgfSk7XG4gICAgICBsZXQgdHlwZSA9IFwiVW5jbGFzc2lmaWVkXCI7XG4gICAgICBpZiAodHlwZW9mIGVsZW1lbnQudHlwZSAhPSBcInVuZGVmaW5lZFwiICYmIGVsZW1lbnQudHlwZS5nZXQoKSAhPVxuICAgICAgICBcIlwiKSB7XG4gICAgICAgIHR5cGUgPSBlbGVtZW50LnR5cGUuZ2V0KCk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5ub2RlTGlzdEJ5RWxlbWVudFR5cGVbdHlwZV0pIHtcbiAgICAgICAgdGhpcy5ub2RlTGlzdEJ5RWxlbWVudFR5cGVbdHlwZV0ubG9hZChub2RlTGlzdE9mVHlwZSA9PiB7XG4gICAgICAgICAgbm9kZUxpc3RPZlR5cGUucHVzaChfbm9kZSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IG5vZGVMaXN0T2ZUeXBlID0gbmV3IExzdCgpO1xuICAgICAgICBub2RlTGlzdE9mVHlwZS5wdXNoKF9ub2RlKTtcbiAgICAgICAgdGhpcy5ub2RlTGlzdEJ5RWxlbWVudFR5cGUuYWRkX2F0dHIoe1xuICAgICAgICAgIFt0eXBlXTogbmV3IFB0cihub2RlTGlzdE9mVHlwZSlcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEJJTUVsZW1lbnQpIHtcbiAgICAgICAgbGV0IF9kYmlkID0gZWxlbWVudC5pZC5nZXQoKTtcbiAgICAgICAgaWYgKHR5cGVvZiBfZGJpZCA9PSBcIm51bWJlclwiKVxuICAgICAgICAgIGlmIChfZGJpZCAhPSAwKSB7XG4gICAgICAgICAgICB0aGlzLl9hZGRFeHRlcm5hbElkTm9kZU1hcHBpbmdFbnRyeShlbGVtZW50LmlkLCBfbm9kZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsZW1lbnQuaWQuYmluZChcbiAgICAgICAgICAgICAgdGhpcy5fYWRkRXh0ZXJuYWxJZE5vZGVNYXBwaW5nRW50cnkuYmluZChudWxsLCBlbGVtZW50LmlkLFxuICAgICAgICAgICAgICAgIF9ub2RlKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBBYnN0cmFjdEVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5ndWlkQWJzdHJhY3ROb2RlTWFwcGluZy5hZGRfYXR0cih7XG4gICAgICAgICAgW2VsZW1lbnQuaWQuZ2V0KCldOiBfbm9kZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8vIGFkZE5vZGVzKF92ZXJ0aWNlcykge1xuICAvLyAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBfdmVydGljZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gIC8vICAgICB0aGlzLmNsYXNzaWZ5Tm9kZShfdmVydGljZXNbaW5kZXhdKVxuICAvLyAgIH1cbiAgLy8gfVxuICAvKipcbiAgICogIEl0IGNyZWF0ZXMgdGhlIG5vZGUgY29ycmVzcG9uZGluZyB0byB0aGUgX2VsZW1lbnQsXG4gICAqIHRoZW4gaXQgY3JlYXRlcyBhIHNpbXBsZSByZWxhdGlvbiBvZiBjbGFzcyBTcGluYWxSZWxhdGlvbiBvZiB0eXBlOl90eXBlLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gX3JlbGF0aW9uVHlwZVxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGV9IF9ub2RlXG4gICAqIEBwYXJhbSB7TW9kZWx9IF9lbGVtZW50IC0gYW55IHN1YmNsYXNzIG9mIE1vZGVsXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW19pc0RpcmVjdGVkPWZhbHNlXVxuICAgKiBAcmV0dXJucyBhIFByb21pc2Ugb2YgdGhlIGNyZWF0ZWQgcmVsYXRpb25cbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBhc3luYyBhZGRTaW1wbGVSZWxhdGlvbkFzeW5jKFxuICAgIF9yZWxhdGlvblR5cGUsXG4gICAgX25vZGUsXG4gICAgX2VsZW1lbnQsXG4gICAgX2lzRGlyZWN0ZWQgPSBmYWxzZVxuICApIHtcbiAgICBpZiAoIXRoaXMuaXNSZXNlcnZlZChfcmVsYXRpb25UeXBlKSkge1xuICAgICAgbGV0IG5vZGUyID0gYXdhaXQgdGhpcy5hZGROb2RlQXN5bmMoX2VsZW1lbnQpO1xuICAgICAgbGV0IHJlbCA9IG5ldyBTcGluYWxSZWxhdGlvbihcbiAgICAgICAgX3JlbGF0aW9uVHlwZSwgW19ub2RlXSwgW25vZGUyXSxcbiAgICAgICAgX2lzRGlyZWN0ZWRcbiAgICAgICk7XG4gICAgICB0aGlzLmFkZFJlbGF0aW9uKHJlbCk7XG4gICAgICByZXR1cm4gcmVsO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgX3JlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGlzIHJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW19yZWxhdGlvblR5cGVdXG4gICAgICApO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICogIEl0IGNyZWF0ZXMgdGhlIG5vZGUgY29ycmVzcG9uZGluZyB0byB0aGUgX2VsZW1lbnQsXG4gICAqIHRoZW4gaXQgY3JlYXRlcyBhIHNpbXBsZSByZWxhdGlvbiBvZiBjbGFzcyBTcGluYWxSZWxhdGlvbiBvZiB0eXBlOl90eXBlLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZX0gbm9kZVxuICAgKiBAcGFyYW0ge01vZGVsfSBlbGVtZW50IC0gYW55IHN1YmNsYXNzIG9mIE1vZGVsXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGlyZWN0ZWQ9ZmFsc2VdXG4gICAqIEByZXR1cm5zIGEgUHJvbWlzZSBvZiB0aGUgY3JlYXRlZCByZWxhdGlvblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIGFkZFNpbXBsZVJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgbm9kZSwgZWxlbWVudCwgaXNEaXJlY3RlZCA9IGZhbHNlKSB7XG4gICAgaWYgKCF0aGlzLmlzUmVzZXJ2ZWQoX3JlbGF0aW9uVHlwZSkpIHtcbiAgICAgIGxldCBub2RlMiA9IHRoaXMuYWRkTm9kZShlbGVtZW50KTtcbiAgICAgIGxldCByZWwgPSBuZXcgU3BpbmFsUmVsYXRpb24ocmVsYXRpb25UeXBlLCBbbm9kZV0sIFtub2RlMl0sXG4gICAgICAgIGlzRGlyZWN0ZWQpO1xuICAgICAgdGhpcy5hZGRSZWxhdGlvbihyZWwpO1xuICAgICAgcmV0dXJuIHJlbDtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIF9yZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tfcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHBhcmFtIHtTcGluYWxOb2RlfSBub2RlXG4gICAqIEBwYXJhbSB7TW9kZWx9IGVsZW1lbnQgLSBhbnkgc3ViY2xhc3Mgb2YgTW9kZWxcbiAgICogQHBhcmFtIHtib29sZWFufSBbaXNEaXJlY3RlZD1mYWxzZV1cbiAgICogQHJldHVybnMgdGhlIGNyZWF0ZWQgUmVsYXRpb24sIHVuZGVmaW5lZCBvdGhlcndpc2VcbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBhZGRTaW1wbGVSZWxhdGlvbkJ5QXBwKFxuICAgIGFwcE5hbWUsXG4gICAgcmVsYXRpb25UeXBlLFxuICAgIG5vZGUsXG4gICAgZWxlbWVudCxcbiAgICBpc0RpcmVjdGVkID0gZmFsc2VcbiAgKSB7XG4gICAgaWYgKHRoaXMuaGFzUmVzZXJ2YXRpb25DcmVkZW50aWFscyhfcmVsYXRpb25UeXBlLCBhcHBOYW1lKSkge1xuICAgICAgaWYgKHRoaXMuY29udGFpbnNBcHAoYXBwTmFtZSkpIHtcbiAgICAgICAgbGV0IG5vZGUyID0gdGhpcy5hZGROb2RlKGVsZW1lbnQpO1xuICAgICAgICBsZXQgcmVsID0gbmV3IFNwaW5hbFJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgW25vZGVdLCBbbm9kZTJdLFxuICAgICAgICAgIGlzRGlyZWN0ZWQpO1xuICAgICAgICB0aGlzLmFkZFJlbGF0aW9uKHJlbCwgYXBwTmFtZSk7XG4gICAgICAgIHJldHVybiByZWw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKGFwcE5hbWUgKyBcIiBkb2VzIG5vdCBleGlzdFwiKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIF9yZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tfcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb259IHJlbGF0aW9uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgYWRkUmVsYXRpb24ocmVsYXRpb24sIGFwcE5hbWUpIHtcbiAgICBpZiAodGhpcy5oYXNSZXNlcnZhdGlvbkNyZWRlbnRpYWxzKHJlbGF0aW9uLnR5cGUuZ2V0KCksIGFwcE5hbWUpKSB7XG4gICAgICBpZiAocmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKSkge1xuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcmVsYXRpb24ubm9kZUxpc3QxLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgIGNvbnN0IG5vZGUgPSByZWxhdGlvbi5ub2RlTGlzdDFbaW5kZXhdO1xuICAgICAgICAgIG5vZGUuYWRkRGlyZWN0ZWRSZWxhdGlvblBhcmVudChyZWxhdGlvbiwgYXBwTmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHJlbGF0aW9uLm5vZGVMaXN0Mi5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICBjb25zdCBub2RlID0gcmVsYXRpb24ubm9kZUxpc3QyW2luZGV4XTtcbiAgICAgICAgICBub2RlLmFkZERpcmVjdGVkUmVsYXRpb25DaGlsZChyZWxhdGlvbiwgYXBwTmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCByZWxhdGlvbi5ub2RlTGlzdDEubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgY29uc3Qgbm9kZSA9IHJlbGF0aW9uLm5vZGVMaXN0MVtpbmRleF07XG4gICAgICAgICAgbm9kZS5hZGROb25EaXJlY3RlZFJlbGF0aW9uKHJlbGF0aW9uLCBhcHBOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcmVsYXRpb24ubm9kZUxpc3QyLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgIGNvbnN0IG5vZGUgPSByZWxhdGlvbi5ub2RlTGlzdDJbaW5kZXhdO1xuICAgICAgICAgIG5vZGUuYWRkTm9uRGlyZWN0ZWRSZWxhdGlvbihyZWxhdGlvbiwgYXBwTmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuX2NsYXNzaWZ5UmVsYXRpb24ocmVsYXRpb24sIGFwcE5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb24udHlwZS5nZXQoKSArXG4gICAgICAgIFwiIGlzIHJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uLnR5cGUuZ2V0KCldXG4gICAgICApO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbltdfSBfcmVsYXRpb25zXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgYWRkUmVsYXRpb25zKF9yZWxhdGlvbnMpIHtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX3JlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IHJlbGF0aW9uID0gX3JlbGF0aW9uc1tpbmRleF07XG4gICAgICB0aGlzLmFkZFJlbGF0aW9uKHJlbGF0aW9uKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFscmVsYXRpb259IHJlbGF0aW9uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgX2NsYXNzaWZ5UmVsYXRpb24ocmVsYXRpb24sIGFwcE5hbWUpIHtcbiAgICB0aGlzLnJlbGF0aW9uTGlzdC5sb2FkKHJlbGF0aW9uTGlzdCA9PiB7XG4gICAgICByZWxhdGlvbkxpc3QucHVzaChyZWxhdGlvbik7XG4gICAgfSk7XG4gICAgaWYgKHRoaXMucmVsYXRpb25MaXN0QnlUeXBlW3JlbGF0aW9uLnR5cGUuZ2V0KCldKSB7XG4gICAgICB0aGlzLnJlbGF0aW9uTGlzdEJ5VHlwZVtyZWxhdGlvbi50eXBlLmdldCgpXS5sb2FkKHJlbGF0aW9uTGlzdE9mVHlwZSA9PiB7XG4gICAgICAgIHJlbGF0aW9uTGlzdE9mVHlwZS5wdXNoKHJlbGF0aW9uKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcmVsYXRpb25MaXN0T2ZUeXBlID0gbmV3IExzdCgpO1xuICAgICAgcmVsYXRpb25MaXN0T2ZUeXBlLnB1c2gocmVsYXRpb24pO1xuICAgICAgdGhpcy5yZWxhdGlvbkxpc3RCeVR5cGUuYWRkX2F0dHIoe1xuICAgICAgICBbcmVsYXRpb24udHlwZS5nZXQoKV06IG5ldyBQdHIocmVsYXRpb25MaXN0T2ZUeXBlKVxuICAgICAgfSk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgYXBwTmFtZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgaWYgKHRoaXMuY29udGFpbnNBcHAoYXBwTmFtZSkpXG4gICAgICAgIHRoaXMuYXBwc0xpc3RbYXBwTmFtZV0ubG9hZChhcHAgPT4ge1xuICAgICAgICAgIGlmICh0eXBlb2YgYXBwW3JlbGF0aW9uLnR5cGUuZ2V0KCldID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICBhcHAuYWRkUmVsYXRpb24ocmVsYXRpb24pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKmNoZWNrcyBpZiB0aGlzIGdyYXBoIGNvbnRhaW5zIGNvbnRhaW5zIGEgc3BlY2lmaWMgQXBwXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEByZXR1cm5zIEJvb2xlYW5cbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBjb250YWluc0FwcChhcHBOYW1lKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB0aGlzLmFwcHNMaXN0W2FwcE5hbWVdICE9PSBcInVuZGVmaW5lZFwiO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBpc1Jlc2VydmVkKHJlbGF0aW9uVHlwZSkge1xuICAgIHJldHVybiB0eXBlb2YgdGhpcy5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uVHlwZV0gIT09IFwidW5kZWZpbmVkXCI7XG4gIH1cbiAgLyoqXG4gICAqICBjaGVja3MgaWYgdGhlIGFwcCBoYXMgdGhlIHJpZ2h0IHRvIHVzZSBhIHJlc2VydmVkIHJlbGF0aW9uXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFwcE5hbWVcbiAgICogQHJldHVybnMgYm9vbGVhblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIGhhc1Jlc2VydmF0aW9uQ3JlZGVudGlhbHMocmVsYXRpb25UeXBlLCBhcHBOYW1lKSB7XG4gICAgcmV0dXJuICghdGhpcy5pc1Jlc2VydmVkKHJlbGF0aW9uVHlwZSkgfHxcbiAgICAgICh0aGlzLmlzUmVzZXJ2ZWQocmVsYXRpb25UeXBlKSAmJlxuICAgICAgICB0aGlzLnJlc2VydmVkUmVsYXRpb25zTmFtZXMocmVsYXRpb25UeXBlKSA9PT0gYXBwTmFtZSlcbiAgICApO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9uc30gcmVsYXRpb25zXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgX2NsYXNzaWZ5UmVsYXRpb25zKF9yZWxhdGlvbnMpIHtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX3JlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHRoaXMuX2NsYXNzaWZ5UmVsYXRpb24oX3JlbGF0aW9uc1tpbmRleF0pO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxOb2RlW119IF9saXN0XG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgX2FkZE5vdEV4aXN0aW5nTm9kZXNGcm9tTGlzdChfbGlzdCkge1xuICAgIHRoaXMubm9kZUxpc3QubG9hZChub2RlTGlzdCA9PiB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IF9saXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxldCBub2RlID0gX2xpc3RbaV07XG4gICAgICAgIGlmICghVXRpbGl0aWVzLmNvbnRhaW5zTHN0QnlJZChub2RlTGlzdCwgbm9kZSkpIHtcbiAgICAgICAgICB0aGlzLmNsYXNzaWZ5Tm9kZShub2RlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9uW119IF9yZWxhdGlvblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIF9hZGROb3RFeGlzdGluZ05vZGVzRnJvbVJlbGF0aW9uKF9yZWxhdGlvbikge1xuICAgIHRoaXMuX2FkZE5vdEV4aXN0aW5nTm9kZXNGcm9tTGlzdChfcmVsYXRpb24ubm9kZUxpc3QxKTtcbiAgICB0aGlzLl9hZGROb3RFeGlzdGluZ05vZGVzRnJvbUxpc3QoX3JlbGF0aW9uLm5vZGVMaXN0Mik7XG4gIH1cblxuICAvLyBhc3luYyBnZXRBbGxDb250ZXh0cygpIHtcbiAgLy8gICBsZXQgcmVzID0gW11cbiAgLy8gICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5hcHBzTGlzdC5fYXR0cmlidXRlX25hbWVzLmxlbmd0aDsgaW5kZXgrKykge1xuICAvLyAgICAgbGV0IGtleSA9IHRoaXMuYXBwc0xpc3QuX2F0dHJpYnV0ZV9uYW1lc1tpbmRleF1cbiAgLy8gICAgIGlmIChrZXkuaW5jbHVkZXMoXCJfQ1wiLCBrZXkubGVuZ3RoIC0gMikpIHtcbiAgLy8gICAgICAgY29uc3QgY29udGV4dCA9IHRoaXMuYXBwc0xpc3Rba2V5XTtcbiAgLy8gICAgICAgcmVzLnB1c2goYXdhaXQgVXRpbGl0aWVzLnByb21pc2VMb2FkKGNvbnRleHQpKVxuICAvLyAgICAgfVxuXG4gIC8vICAgfVxuICAvLyAgIHJldHVybiByZXM7XG4gIC8vIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBUeXBlXG4gICAqIEByZXR1cm5zIGFsbCBBcHBzIG9mIGEgc3BlY2lmaWMgdHlwZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIGFzeW5jIGdldEFwcHNCeVR5cGUoYXBwVHlwZSkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5hcHBzTGlzdEJ5VHlwZVthcHBUeXBlXSAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgIHJldHVybiBhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQodGhpcy5hcHBzTGlzdEJ5VHlwZVthcHBUeXBlXSk7XG4gIH1cblxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHBhcmFtIHtzdHJpbmdbXX0gcmVsYXRpb25zVHlwZXNMc3RcbiAgICogQHBhcmFtIHtPYmplY3RbXX0gbW9kZWxzXG4gICAqIEBwYXJhbSB7TW9kZWx9IFtJbnRlcmFjdGlvbnM9IG5ldyBNb2RlbCgpXVxuICAgKiBAcGFyYW0ge1NwaW5hTm9kZX0gW3N0YXJ0aW5nTm9kZSA9IG5ldyBTcGluYWxOb2RlKG5ldyBBYnN0cmFjdEVsZW1lbnQoX25hbWUsIFwicm9vdFwiKSldXG4gICAqIEBwYXJhbSB7U3BpbmFsR3JhcGh9IFtyZWxhdGVkR3JhcGg9dGhpc11cbiAgICogQHJldHVybnMgQSBwcm9taXNlIG9mIHRoZSBjcmVhdGVkIENvbnRleHRcbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBhc3luYyBnZXRDb250ZXh0KFxuICAgIG5hbWUsXG4gICAgcmVsYXRpb25zVHlwZXNMc3QsXG4gICAgbW9kZWxzLFxuICAgIEludGVyYWN0aW9ucyxcbiAgICBzdGFydGluZ05vZGUsXG4gICAgcmVsYXRlZEdyYXBoID0gdGhpc1xuICApIHtcbiAgICBpZiAodHlwZW9mIHRoaXMuYXBwc0xpc3RbbmFtZV0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGxldCBjb250ZXh0ID0gbmV3IFNwaW5hbENvbnRleHQoXG4gICAgICAgIG5hbWUsXG4gICAgICAgIHJlbGF0aW9uc1R5cGVzTHN0LFxuICAgICAgICBtb2RlbHMsXG4gICAgICAgIEludGVyYWN0aW9ucyxcbiAgICAgICAgc3RhcnRpbmdOb2RlLFxuICAgICAgICByZWxhdGVkR3JhcGhcbiAgICAgICk7XG4gICAgICB0aGlzLmFwcHNMaXN0LmFkZF9hdHRyKHtcbiAgICAgICAgW25hbWVdOiBuZXcgUHRyKGNvbnRleHQpXG4gICAgICB9KTtcblxuICAgICAgY29udGV4dC50eXBlLnNldChcImNvbnRleHRcIilcblxuICAgICAgaWYgKHR5cGVvZiB0aGlzLmFwcHNMaXN0QnlUeXBlLmNvbnRleHQgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgdGhpcy5hcHBzTGlzdEJ5VHlwZS5hZGRfYXR0cih7XG4gICAgICAgICAgY29udGV4dDogbmV3IE1vZGVsKClcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICB0aGlzLmFwcHNMaXN0QnlUeXBlLmNvbnRleHQuYWRkX2F0dHIoe1xuICAgICAgICBbbmFtZV06IHRoaXMuYXBwc0xpc3RbbmFtZV1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGNvbnRleHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQodGhpcy5hcHBzTGlzdFtuYW1lXSk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0ge3N0cmluZ1tdfSByZWxhdGlvbnNUeXBlc0xzdFxuICAgKiBAcGFyYW0ge1NwaW5hbEdyYXBofSBbcmVsYXRlZFNwaW5hbEdyYXBoPXRoaXNdXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSBvZiB0aGUgY3JlYXRlZCBBcHBcbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBhc3luYyBnZXRBcHAobmFtZSwgcmVsYXRpb25zVHlwZXNMc3QsIHJlbGF0ZWRTcGluYWxHcmFwaCA9IHRoaXMpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMuYXBwc0xpc3RbbmFtZV0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGxldCBzcGluYWxBcHBsaWNhdGlvbiA9IG5ldyBTcGluYWxBcHBsaWNhdGlvbihcbiAgICAgICAgbmFtZSxcbiAgICAgICAgcmVsYXRpb25zVHlwZXNMc3QsXG4gICAgICAgIHJlbGF0ZWRTcGluYWxHcmFwaFxuICAgICAgKTtcbiAgICAgIHRoaXMuYXBwc0xpc3QuYWRkX2F0dHIoe1xuICAgICAgICBbbmFtZV06IG5ldyBQdHIoc3BpbmFsQXBwbGljYXRpb24pXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBzcGluYWxBcHBsaWNhdGlvbjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGF3YWl0IFV0aWxpdGllcy5wcm9taXNlTG9hZCh0aGlzLmFwcHNMaXN0W25hbWVdKTtcbiAgICAgIC8vIGNvbnNvbGUuZXJyb3IoXG4gICAgICAvLyAgIG5hbWUgK1xuICAgICAgLy8gICBcIiBhcyB3ZWxsIGFzIFwiICtcbiAgICAgIC8vICAgdGhpcy5nZXRBcHBzTmFtZXMoKSArXG4gICAgICAvLyAgIFwiIGhhdmUgYmVlbiBhbHJlYWR5IHVzZWQsIHBsZWFzZSBjaG9vc2UgYW5vdGhlciBhcHBsaWNhdGlvbiBuYW1lXCJcbiAgICAgIC8vICk7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgYW4gYXJyYXkgb2YgYXBwcyBuYW1lc1xuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIGdldEFwcHNOYW1lcygpIHtcbiAgICByZXR1cm4gdGhpcy5hcHBzTGlzdC5fYXR0cmlidXRlX25hbWVzO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEBwYXJhbSB7U3BpbmFsQXBwbGljYXRpb259IGFwcFxuICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgcmVzZXJ2ZVVuaXF1ZVJlbGF0aW9uVHlwZShyZWxhdGlvblR5cGUsIGFwcCkge1xuICAgIGlmIChcbiAgICAgIHR5cGVvZiB0aGlzLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb25UeXBlXSA9PT0gXCJ1bmRlZmluZWRcIiAmJlxuICAgICAgdHlwZW9mIHRoaXMucmVsYXRpb25MaXN0QnlUeXBlW3JlbGF0aW9uVHlwZV0gPT09IFwidW5kZWZpbmVkXCJcbiAgICApIHtcbiAgICAgIHRoaXMucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lcy5hZGRfYXR0cih7XG4gICAgICAgIFtyZWxhdGlvblR5cGVdOiBhcHAubmFtZS5nZXQoKVxuICAgICAgfSk7XG4gICAgICBhcHAuYWRkUmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgdHlwZW9mIHRoaXMucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvblR5cGVdICE9PSBcInVuZGVmaW5lZFwiXG4gICAgKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICByZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBoYXMgbm90IGJlZW4gYWRkZWQgdG8gYXBwOiBcIiArXG4gICAgICAgIGFwcC5uYW1lLmdldCgpICtcbiAgICAgICAgXCIsQ2F1c2UgOiBhbHJlYWR5IFJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uVHlwZV1cbiAgICAgICk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5yZWxhdGlvbkxpc3RCeVR5cGVbcmVsYXRpb25UeXBlXSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgaGFzIG5vdCBiZWVuIGFkZGVkIHRvIGFwcDogXCIgK1xuICAgICAgICBhcHAubmFtZS5nZXQoKSArXG4gICAgICAgIFwiLENhdXNlIDogYWxyZWFkeSBVc2VkIGJ5IG90aGVyIEFwcHNcIlxuICAgICAgKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU3BpbmFsR3JhcGg7XG5zcGluYWxDb3JlLnJlZ2lzdGVyX21vZGVscyhbU3BpbmFsR3JhcGhdKTsiXX0=