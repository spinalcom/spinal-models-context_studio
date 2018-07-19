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
   * @param {Model} _element - any subClass of Model
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
   * @param {Model} _element - any subClass of Model
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
   * @param {Model} _element - any subClass of Model
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
   * @param {Model} element - any subClass of Model
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
   * @memberof SpinalGraph
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
      if (this.containsApp(appName)) this.appsList[appName].load(app => {
        if (typeof app[relation.type.get()] === "undefined") {
          app.addRelation(relation);
        }
      });
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
   * @param {Lst} _list
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
   * @param {SpinalRelations} _relation
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

  async getAppsByType(appType) {
    if (typeof this.appsListByType[appType] !== "undefined") return await _Utilities.Utilities.promiseLoad(this.appsListByType[appType]);
  }

  /**
   *
   *
   * @param {string} name
   * @param {string[]} relationsTypesLst
   * @param {*} [relatedGraph=this]
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
   * @param {*} name
   * @param {*} relationsTypesLst
   * @param {*} [relatedSpinalGraph=this]
   * @returns
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

exports.default = SpinalGraph;

spinalCore.register_models([SpinalGraph]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TcGluYWxHcmFwaC5qcyJdLCJuYW1lcyI6WyJzcGluYWxDb3JlIiwicmVxdWlyZSIsImdsb2JhbFR5cGUiLCJ3aW5kb3ciLCJnbG9iYWwiLCJTcGluYWxHcmFwaCIsIk1vZGVsIiwiY29uc3RydWN0b3IiLCJfbmFtZSIsIl9zdGFydGluZ05vZGUiLCJQdHIiLCJuYW1lIiwiRmlsZVN5c3RlbSIsIl9zaWdfc2VydmVyIiwiYWRkX2F0dHIiLCJleHRlcm5hbElkTm9kZU1hcHBpbmciLCJndWlkQWJzdHJhY3ROb2RlTWFwcGluZyIsInN0YXJ0aW5nTm9kZSIsIm5vZGVMaXN0IiwiTHN0Iiwibm9kZUxpc3RCeUVsZW1lbnRUeXBlIiwicmVsYXRpb25MaXN0IiwicmVsYXRpb25MaXN0QnlUeXBlIiwiYXBwc0xpc3QiLCJhcHBzTGlzdEJ5VHlwZSIsInJlc2VydmVkUmVsYXRpb25zTmFtZXMiLCJpbml0Iiwic3BpbmFsIiwiY29udGV4dFN0dWRpbyIsImdyYXBoIiwiU3BpbmFsTm9kZSIsIlNwaW5hbFJlbGF0aW9uIiwiQWJzdHJhY3RFbGVtZW50IiwiQklNRWxlbWVudCIsIlV0aWxpdGllcyIsImdldE5vZGVCeWRiSWQiLCJfZGJJZCIsIl9leHRlcm5hbElkIiwiZ2V0RXh0ZXJuYWxJZCIsIkJJTUVsZW1lbnQxIiwiaW5pdEV4dGVybmFsSWQiLCJub2RlIiwiYWRkTm9kZUFzeW5jIiwidHlwZSIsImdldCIsImJpbmQiLCJfY2xhc3NpZnlCSU1FbGVtZW50Tm9kZSIsIl9ub2RlIiwiY2xhc3NpZnlOb2RlIiwiZ2V0RGJJZEJ5Tm9kZSIsImVsZW1lbnQiLCJwcm9taXNlTG9hZCIsImlkIiwic2V0TmFtZSIsInNldCIsInNldFN0YXJ0aW5nTm9kZSIsIl9hZGRFeHRlcm5hbElkTm9kZU1hcHBpbmdFbnRyeSIsIl9FbGVtZW50SWQiLCJfZGJpZCIsImV4dGVybmFsSWQiLCJ1bmJpbmQiLCJfZWxlbWVudCIsImluaXRFeHRlcm5hbElkQXN5bmMiLCJjb25zb2xlIiwibG9nIiwiYWRkTm9kZSIsInRoZW4iLCJyZWxhdGVkR3JhcGgiLCJsb2FkIiwicHVzaCIsIm5vZGVMaXN0T2ZUeXBlIiwiYWRkU2ltcGxlUmVsYXRpb25Bc3luYyIsIl9yZWxhdGlvblR5cGUiLCJfaXNEaXJlY3RlZCIsImlzUmVzZXJ2ZWQiLCJub2RlMiIsInJlbCIsImFkZFJlbGF0aW9uIiwiYWRkU2ltcGxlUmVsYXRpb24iLCJyZWxhdGlvblR5cGUiLCJpc0RpcmVjdGVkIiwiYWRkU2ltcGxlUmVsYXRpb25CeUFwcCIsImFwcE5hbWUiLCJoYXNSZXNlcnZhdGlvbkNyZWRlbnRpYWxzIiwiY29udGFpbnNBcHAiLCJlcnJvciIsInJlbGF0aW9uIiwiaW5kZXgiLCJub2RlTGlzdDEiLCJsZW5ndGgiLCJhZGREaXJlY3RlZFJlbGF0aW9uUGFyZW50Iiwibm9kZUxpc3QyIiwiYWRkRGlyZWN0ZWRSZWxhdGlvbkNoaWxkIiwiYWRkTm9uRGlyZWN0ZWRSZWxhdGlvbiIsIl9jbGFzc2lmeVJlbGF0aW9uIiwiYWRkUmVsYXRpb25zIiwiX3JlbGF0aW9ucyIsInJlbGF0aW9uTGlzdE9mVHlwZSIsImFwcCIsIl9jbGFzc2lmeVJlbGF0aW9ucyIsIl9hZGROb3RFeGlzdGluZ05vZGVzRnJvbUxpc3QiLCJfbGlzdCIsImkiLCJjb250YWluc0xzdEJ5SWQiLCJfYWRkTm90RXhpc3RpbmdOb2Rlc0Zyb21SZWxhdGlvbiIsIl9yZWxhdGlvbiIsImdldEFwcHNCeVR5cGUiLCJhcHBUeXBlIiwiZ2V0Q29udGV4dCIsInJlbGF0aW9uc1R5cGVzTHN0IiwiY29udGV4dCIsIlNwaW5hbENvbnRleHQiLCJjb250ZXh0TGlzdCIsImdldEFwcCIsInJlbGF0ZWRTcGluYWxHcmFwaCIsInNwaW5hbEFwcGxpY2F0aW9uIiwiU3BpbmFsQXBwbGljYXRpb24iLCJnZXRBcHBzTmFtZXMiLCJfYXR0cmlidXRlX25hbWVzIiwicmVzZXJ2ZVVuaXF1ZVJlbGF0aW9uVHlwZSIsImFkZFJlbGF0aW9uVHlwZSIsInJlZ2lzdGVyX21v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RU4sZUFDQSw4QkFEQSxHQUVBbUIsSUFBSXZGLElBQUosQ0FBU2lDLEdBQVQsRUFGQSxHQUdBLCtCQUhBLEdBSUEsS0FBS25CLHNCQUFMLENBQTRCc0QsWUFBNUIsQ0FMRjtBQU9BLGFBQU8sS0FBUDtBQUNELEtBWE0sTUFXQSxJQUFJLE9BQU8sS0FBS3pELGtCQUFMLENBQXdCeUQsWUFBeEIsQ0FBUCxLQUNULFdBREssRUFDUTtBQUNiaEIsY0FBUXNCLEtBQVIsQ0FDRU4sZUFDQSw4QkFEQSxHQUVBbUIsSUFBSXZGLElBQUosQ0FBU2lDLEdBQVQsRUFGQSxHQUdBLHFDQUpGO0FBTUQ7QUFDRjtBQWxrQndDOztrQkFxa0I1QnZDLFc7O0FBQ2ZMLFdBQVd5SCxlQUFYLENBQTJCLENBQUNwSCxXQUFELENBQTNCIiwiZmlsZSI6IlNwaW5hbEdyYXBoLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3Qgc3BpbmFsQ29yZSA9IHJlcXVpcmUoXCJzcGluYWwtY29yZS1jb25uZWN0b3Jqc1wiKTtcbmNvbnN0IGdsb2JhbFR5cGUgPSB0eXBlb2Ygd2luZG93ID09PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogd2luZG93O1xuaW1wb3J0IFNwaW5hbE5vZGUgZnJvbSBcIi4vU3BpbmFsTm9kZVwiO1xuaW1wb3J0IFNwaW5hbFJlbGF0aW9uIGZyb20gXCIuL1NwaW5hbFJlbGF0aW9uXCI7XG5pbXBvcnQgQWJzdHJhY3RFbGVtZW50IGZyb20gXCIuL0Fic3RyYWN0RWxlbWVudFwiO1xuaW1wb3J0IEJJTUVsZW1lbnQgZnJvbSBcIi4vQklNRWxlbWVudFwiO1xuaW1wb3J0IFNwaW5hbEFwcGxpY2F0aW9uIGZyb20gXCIuL1NwaW5hbEFwcGxpY2F0aW9uXCI7XG5pbXBvcnQgU3BpbmFsQ29udGV4dCBmcm9tIFwiLi9TcGluYWxDb250ZXh0XCI7XG5cbmltcG9ydCB7XG4gIFV0aWxpdGllc1xufSBmcm9tIFwiLi9VdGlsaXRpZXNcIjtcbi8qKlxuICogVGhlIGNvcmUgb2YgdGhlIGludGVyYWN0aW9ucyBiZXR3ZWVuIHRoZSBCSU1FbGVtZW50cyBOb2RlcyBhbmQgb3RoZXIgTm9kZXMoRG9jcywgVGlja2V0cywgZXRjIC4uKVxuICovXG5jbGFzcyBTcGluYWxHcmFwaCBleHRlbmRzIGdsb2JhbFR5cGUuTW9kZWwge1xuICAvKipcbiAgICpDcmVhdGVzIGFuIGluc3RhbmNlIG9mIFNwaW5hbEdyYXBoLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gW19uYW1lPXRdXG4gICAqIEBwYXJhbSB7UHRyfSBbX3N0YXJ0aW5nTm9kZT1uZXcgUHRyKDApXVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIGNvbnN0cnVjdG9yKF9uYW1lID0gXCJ0XCIsIF9zdGFydGluZ05vZGUgPSBuZXcgUHRyKDApLCBuYW1lID0gXCJTcGluYWxHcmFwaFwiKSB7XG4gICAgc3VwZXIoKTtcbiAgICBpZiAoRmlsZVN5c3RlbS5fc2lnX3NlcnZlcikge1xuICAgICAgdGhpcy5hZGRfYXR0cih7XG4gICAgICAgIG5hbWU6IF9uYW1lLFxuICAgICAgICBleHRlcm5hbElkTm9kZU1hcHBpbmc6IG5ldyBNb2RlbCgpLFxuICAgICAgICBndWlkQWJzdHJhY3ROb2RlTWFwcGluZzogbmV3IE1vZGVsKCksXG4gICAgICAgIHN0YXJ0aW5nTm9kZTogX3N0YXJ0aW5nTm9kZSxcbiAgICAgICAgbm9kZUxpc3Q6IG5ldyBQdHIobmV3IExzdCgpKSxcbiAgICAgICAgbm9kZUxpc3RCeUVsZW1lbnRUeXBlOiBuZXcgTW9kZWwoKSxcbiAgICAgICAgcmVsYXRpb25MaXN0OiBuZXcgUHRyKG5ldyBMc3QoKSksXG4gICAgICAgIHJlbGF0aW9uTGlzdEJ5VHlwZTogbmV3IE1vZGVsKCksXG4gICAgICAgIGFwcHNMaXN0OiBuZXcgTW9kZWwoKSxcbiAgICAgICAgYXBwc0xpc3RCeVR5cGU6IG5ldyBNb2RlbCgpLFxuICAgICAgICByZXNlcnZlZFJlbGF0aW9uc05hbWVzOiBuZXcgTW9kZWwoKVxuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKmZ1bmN0aW9uXG4gICAqVG8gcHV0IHVzZWQgZnVuY3Rpb25zIGFzIHdlbGwgYXMgdGhlIFNwaW5hbEdyYXBoIG1vZGVsIGluIHRoZSBnbG9iYWwgc2NvcGVcbiAgICovXG4gIGluaXQoKSB7XG4gICAgZ2xvYmFsVHlwZS5zcGluYWwuY29udGV4dFN0dWRpbyA9IHt9O1xuICAgIGdsb2JhbFR5cGUuc3BpbmFsLmNvbnRleHRTdHVkaW8uZ3JhcGggPSB0aGlzO1xuICAgIGdsb2JhbFR5cGUuc3BpbmFsLmNvbnRleHRTdHVkaW8uU3BpbmFsTm9kZSA9IFNwaW5hbE5vZGU7XG4gICAgZ2xvYmFsVHlwZS5zcGluYWwuY29udGV4dFN0dWRpby5TcGluYWxSZWxhdGlvbiA9IFNwaW5hbFJlbGF0aW9uO1xuICAgIGdsb2JhbFR5cGUuc3BpbmFsLmNvbnRleHRTdHVkaW8uQWJzdHJhY3RFbGVtZW50ID0gQWJzdHJhY3RFbGVtZW50O1xuICAgIGdsb2JhbFR5cGUuc3BpbmFsLmNvbnRleHRTdHVkaW8uQklNRWxlbWVudCA9IEJJTUVsZW1lbnQ7XG4gICAgZ2xvYmFsVHlwZS5zcGluYWwuY29udGV4dFN0dWRpby5VdGlsaXRpZXMgPSBVdGlsaXRpZXM7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBfZGJJZFxuICAgKiBAcmV0dXJucyBQcm9taXNlIG9mIHRoZSBjb3JyZXNwb25kaW5nIE5vZGUgb3IgdGhlIGNyZWF0ZWQgb25lIGlmIG5vdCBleGlzdGluZ1xuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIGFzeW5jIGdldE5vZGVCeWRiSWQoX2RiSWQpIHtcbiAgICBsZXQgX2V4dGVybmFsSWQgPSBhd2FpdCBVdGlsaXRpZXMuZ2V0RXh0ZXJuYWxJZChfZGJJZCk7XG4gICAgaWYgKHR5cGVvZiB0aGlzLmV4dGVybmFsSWROb2RlTWFwcGluZ1tfZXh0ZXJuYWxJZF0gIT09IFwidW5kZWZpbmVkXCIpXG4gICAgICByZXR1cm4gdGhpcy5leHRlcm5hbElkTm9kZU1hcHBpbmdbX2V4dGVybmFsSWRdO1xuICAgIGVsc2Uge1xuICAgICAgbGV0IEJJTUVsZW1lbnQxID0gbmV3IEJJTUVsZW1lbnQoX2RiSWQpO1xuICAgICAgQklNRWxlbWVudDEuaW5pdEV4dGVybmFsSWQoKTtcbiAgICAgIGxldCBub2RlID0gYXdhaXQgdGhpcy5hZGROb2RlQXN5bmMoQklNRWxlbWVudDEpO1xuICAgICAgaWYgKEJJTUVsZW1lbnQxLnR5cGUuZ2V0KCkgPT09IFwiXCIpIHtcbiAgICAgICAgQklNRWxlbWVudDEudHlwZS5iaW5kKHRoaXMuX2NsYXNzaWZ5QklNRWxlbWVudE5vZGUuYmluZCh0aGlzLCBub2RlKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbm9kZTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZX0gX25vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBhc3luYyBfY2xhc3NpZnlCSU1FbGVtZW50Tm9kZShfbm9kZSkge1xuICAgIC8vVE9ETyBERUxFVEUgT0xEIENMQVNTSUZJQ0FUSU9OXG4gICAgdGhpcy5jbGFzc2lmeU5vZGUoX25vZGUpO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGV9IF9ub2RlXG4gICAqIEByZXR1cm5zIFByb21pc2Ugb2YgZGJJZCBbbnVtYmVyXVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIGFzeW5jIGdldERiSWRCeU5vZGUoX25vZGUpIHtcbiAgICBsZXQgZWxlbWVudCA9IGF3YWl0IFV0aWxpdGllcy5wcm9taXNlTG9hZChfbm9kZS5lbGVtZW50KTtcbiAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEJJTUVsZW1lbnQpIHtcbiAgICAgIHJldHVybiBlbGVtZW50LmlkLmdldCgpO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IF9uYW1lXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgc2V0TmFtZShfbmFtZSkge1xuICAgIHRoaXMubmFtZS5zZXQoX25hbWUpO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1B0cn0gX3N0YXJ0aW5nTm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIHNldFN0YXJ0aW5nTm9kZShfc3RhcnRpbmdOb2RlKSB7XG4gICAgdGhpcy5zdGFydGluZ05vZGUuc2V0KF9zdGFydGluZ05vZGUpO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gX0VsZW1lbnRJZCAtIHRoZSBFbGVtZW50IEV4dGVybmFsSWRcbiAgICogQHBhcmFtIHtTcGluYWxOb2RlfSBfbm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIGFzeW5jIF9hZGRFeHRlcm5hbElkTm9kZU1hcHBpbmdFbnRyeShfRWxlbWVudElkLCBfbm9kZSkge1xuICAgIGxldCBfZGJpZCA9IF9FbGVtZW50SWQuZ2V0KCk7XG4gICAgaWYgKHR5cGVvZiBfZGJpZCA9PSBcIm51bWJlclwiKVxuICAgICAgaWYgKF9kYmlkICE9IDApIHtcbiAgICAgICAgbGV0IGV4dGVybmFsSWQgPSBhd2FpdCBVdGlsaXRpZXMuZ2V0RXh0ZXJuYWxJZChfZGJpZCk7XG4gICAgICAgIGxldCBlbGVtZW50ID0gYXdhaXQgVXRpbGl0aWVzLnByb21pc2VMb2FkKF9ub2RlLmVsZW1lbnQpO1xuICAgICAgICBhd2FpdCBlbGVtZW50LmluaXRFeHRlcm5hbElkKCk7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5leHRlcm5hbElkTm9kZU1hcHBpbmdbZXh0ZXJuYWxJZF0gPT09IFwidW5kZWZpbmVkXCIpXG4gICAgICAgICAgdGhpcy5leHRlcm5hbElkTm9kZU1hcHBpbmcuYWRkX2F0dHIoe1xuICAgICAgICAgICAgW2V4dGVybmFsSWRdOiBfbm9kZVxuICAgICAgICAgIH0pO1xuICAgICAgICBfRWxlbWVudElkLnVuYmluZChcbiAgICAgICAgICB0aGlzLl9hZGRFeHRlcm5hbElkTm9kZU1hcHBpbmdFbnRyeS5iaW5kKHRoaXMsIF9FbGVtZW50SWQsXG4gICAgICAgICAgICBfbm9kZSlcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtNb2RlbH0gX2VsZW1lbnQgLSBhbnkgc3ViQ2xhc3Mgb2YgTW9kZWxcbiAgICogQHJldHVybnMgUHJvbWlzZSBvZiB0aGUgY3JlYXRlZCBOb2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxHcmFwaFxuICAgKi9cbiAgYXN5bmMgYWRkTm9kZUFzeW5jKF9lbGVtZW50KSB7XG4gICAgbGV0IG5hbWUgPSBcIlwiO1xuICAgIGlmIChfZWxlbWVudCBpbnN0YW5jZW9mIEJJTUVsZW1lbnQpIHtcbiAgICAgIGF3YWl0IF9lbGVtZW50LmluaXRFeHRlcm5hbElkQXN5bmMoKTtcbiAgICAgIGlmIChcbiAgICAgICAgdHlwZW9mIHRoaXMuZXh0ZXJuYWxJZE5vZGVNYXBwaW5nW19lbGVtZW50LmV4dGVybmFsSWQuZ2V0KCldICE9PVxuICAgICAgICBcInVuZGVmaW5lZFwiXG4gICAgICApIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJCSU0gT0JKRUNUIE5PREUgQUxSRUFEWSBFWElTVFNcIik7XG4gICAgICAgIHJldHVybiB0aGlzLmV4dGVybmFsSWROb2RlTWFwcGluZ1tfZWxlbWVudC5leHRlcm5hbElkLmdldCgpXTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKF9lbGVtZW50IGluc3RhbmNlb2YgQWJzdHJhY3RFbGVtZW50KSB7XG4gICAgICBpZiAoXG4gICAgICAgIHR5cGVvZiB0aGlzLmd1aWRBYnN0cmFjdE5vZGVNYXBwaW5nW19lbGVtZW50LmlkLmdldCgpXSAhPT1cbiAgICAgICAgXCJ1bmRlZmluZWRcIlxuICAgICAgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQUJTVFJBQ1QgT0JKRUNUIE5PREUgQUxSRUFEWSBFWElTVFNcIik7XG4gICAgICAgIHJldHVybiB0aGlzLmd1aWRBYnN0cmFjdE5vZGVNYXBwaW5nW19lbGVtZW50LmlkLmdldCgpXTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHR5cGVvZiBfZWxlbWVudC5uYW1lICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBuYW1lID0gX2VsZW1lbnQubmFtZS5nZXQoKTtcbiAgICB9XG4gICAgbGV0IG5vZGUgPSBuZXcgU3BpbmFsTm9kZShuYW1lLCBfZWxlbWVudCwgdGhpcyk7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7TW9kZWx9IF9lbGVtZW50IC0gYW55IHN1YkNsYXNzIG9mIE1vZGVsXG4gICAqIEByZXR1cm5zIHRoZSBjcmVhdGVkIE5vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBhZGROb2RlKF9lbGVtZW50KSB7XG4gICAgbGV0IG5hbWUgPSBcIlwiO1xuICAgIGlmIChfZWxlbWVudCBpbnN0YW5jZW9mIEJJTUVsZW1lbnQpIHtcbiAgICAgIF9lbGVtZW50LmluaXRFeHRlcm5hbElkKCk7XG4gICAgICBpZiAoXG4gICAgICAgIHR5cGVvZiB0aGlzLmV4dGVybmFsSWROb2RlTWFwcGluZ1tfZWxlbWVudC5leHRlcm5hbElkLmdldCgpXSAhPT1cbiAgICAgICAgXCJ1bmRlZmluZWRcIlxuICAgICAgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQklNIE9CSkVDVCBOT0RFIEFMUkVBRFkgRVhJU1RTXCIpO1xuICAgICAgICByZXR1cm4gdGhpcy5leHRlcm5hbElkTm9kZU1hcHBpbmdbX2VsZW1lbnQuZXh0ZXJuYWxJZC5nZXQoKV07XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChfZWxlbWVudCBpbnN0YW5jZW9mIEFic3RyYWN0RWxlbWVudCkge1xuICAgICAgaWYgKFxuICAgICAgICB0eXBlb2YgdGhpcy5ndWlkQWJzdHJhY3ROb2RlTWFwcGluZ1tfZWxlbWVudC5pZC5nZXQoKV0gIT09XG4gICAgICAgIFwidW5kZWZpbmVkXCJcbiAgICAgICkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkFCU1RSQUNUIE9CSkVDVCBOT0RFIEFMUkVBRFkgRVhJU1RTXCIpO1xuICAgICAgICByZXR1cm4gdGhpcy5ndWlkQWJzdHJhY3ROb2RlTWFwcGluZ1tfZWxlbWVudC5pZC5nZXQoKV07XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0eXBlb2YgX2VsZW1lbnQubmFtZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgbmFtZSA9IF9lbGVtZW50Lm5hbWUuZ2V0KCk7XG4gICAgfVxuICAgIGxldCBub2RlID0gbmV3IFNwaW5hbE5vZGUobmFtZSwgX2VsZW1lbnQsIHRoaXMpO1xuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgLyoqXG4gICAqICBPYnNlcnZlcyB0aGUgdHlwZSBvZiB0aGUgZWxlbWVudCBpbnNpZGUgdGhlIG5vZGUgYWRkIENsYXNzaWZ5IGl0LlxuICAgKiAgSXQgcHV0cyBpdCBpbiB0aGUgVW5jbGFzc2lmaWVkIGxpc3QgT3RoZXJ3aXNlLlxuICAgKiBJdCBhZGRzIHRoZSBub2RlIHRvIHRoZSBtYXBwaW5nIGxpc3Qgd2l0aCBFeHRlcm5hbElkIGlmIHRoZSBPYmplY3QgaXMgb2YgdHlwZSBCSU1FbGVtZW50XG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZX0gX25vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBjbGFzc2lmeU5vZGUoX25vZGUpIHtcbiAgICBVdGlsaXRpZXMucHJvbWlzZUxvYWQoX25vZGUuZWxlbWVudCkudGhlbihlbGVtZW50ID0+IHtcbiAgICAgIGlmICh0eXBlb2YgX25vZGUucmVsYXRlZEdyYXBoID09PSBcInVuZGVmaW5lZFwiKSBfbm9kZS5yZWxhdGVkR3JhcGhcbiAgICAgICAgLnNldChcbiAgICAgICAgICB0aGlzKTtcbiAgICAgIHRoaXMubm9kZUxpc3QubG9hZChub2RlTGlzdCA9PiB7XG4gICAgICAgIG5vZGVMaXN0LnB1c2goX25vZGUpO1xuICAgICAgfSk7XG4gICAgICBsZXQgdHlwZSA9IFwiVW5jbGFzc2lmaWVkXCI7XG4gICAgICBpZiAodHlwZW9mIGVsZW1lbnQudHlwZSAhPSBcInVuZGVmaW5lZFwiICYmIGVsZW1lbnQudHlwZS5nZXQoKSAhPVxuICAgICAgICBcIlwiKSB7XG4gICAgICAgIHR5cGUgPSBlbGVtZW50LnR5cGUuZ2V0KCk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5ub2RlTGlzdEJ5RWxlbWVudFR5cGVbdHlwZV0pIHtcbiAgICAgICAgdGhpcy5ub2RlTGlzdEJ5RWxlbWVudFR5cGVbdHlwZV0ubG9hZChub2RlTGlzdE9mVHlwZSA9PiB7XG4gICAgICAgICAgbm9kZUxpc3RPZlR5cGUucHVzaChfbm9kZSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IG5vZGVMaXN0T2ZUeXBlID0gbmV3IExzdCgpO1xuICAgICAgICBub2RlTGlzdE9mVHlwZS5wdXNoKF9ub2RlKTtcbiAgICAgICAgdGhpcy5ub2RlTGlzdEJ5RWxlbWVudFR5cGUuYWRkX2F0dHIoe1xuICAgICAgICAgIFt0eXBlXTogbmV3IFB0cihub2RlTGlzdE9mVHlwZSlcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEJJTUVsZW1lbnQpIHtcbiAgICAgICAgbGV0IF9kYmlkID0gZWxlbWVudC5pZC5nZXQoKTtcbiAgICAgICAgaWYgKHR5cGVvZiBfZGJpZCA9PSBcIm51bWJlclwiKVxuICAgICAgICAgIGlmIChfZGJpZCAhPSAwKSB7XG4gICAgICAgICAgICB0aGlzLl9hZGRFeHRlcm5hbElkTm9kZU1hcHBpbmdFbnRyeShlbGVtZW50LmlkLCBfbm9kZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsZW1lbnQuaWQuYmluZChcbiAgICAgICAgICAgICAgdGhpcy5fYWRkRXh0ZXJuYWxJZE5vZGVNYXBwaW5nRW50cnkuYmluZChudWxsLCBlbGVtZW50LmlkLFxuICAgICAgICAgICAgICAgIF9ub2RlKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBBYnN0cmFjdEVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5ndWlkQWJzdHJhY3ROb2RlTWFwcGluZy5hZGRfYXR0cih7XG4gICAgICAgICAgW2VsZW1lbnQuaWQuZ2V0KCldOiBfbm9kZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8vIGFkZE5vZGVzKF92ZXJ0aWNlcykge1xuICAvLyAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBfdmVydGljZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gIC8vICAgICB0aGlzLmNsYXNzaWZ5Tm9kZShfdmVydGljZXNbaW5kZXhdKVxuICAvLyAgIH1cbiAgLy8gfVxuICAvKipcbiAgICogIEl0IGNyZWF0ZXMgdGhlIG5vZGUgY29ycmVzcG9uZGluZyB0byB0aGUgX2VsZW1lbnQsXG4gICAqIHRoZW4gaXQgY3JlYXRlcyBhIHNpbXBsZSByZWxhdGlvbiBvZiBjbGFzcyBTcGluYWxSZWxhdGlvbiBvZiB0eXBlOl90eXBlLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gX3JlbGF0aW9uVHlwZVxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGV9IF9ub2RlXG4gICAqIEBwYXJhbSB7TW9kZWx9IF9lbGVtZW50IC0gYW55IHN1YkNsYXNzIG9mIE1vZGVsXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW19pc0RpcmVjdGVkPWZhbHNlXVxuICAgKiBAcmV0dXJucyBhIFByb21pc2Ugb2YgdGhlIGNyZWF0ZWQgcmVsYXRpb25cbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBhc3luYyBhZGRTaW1wbGVSZWxhdGlvbkFzeW5jKFxuICAgIF9yZWxhdGlvblR5cGUsXG4gICAgX25vZGUsXG4gICAgX2VsZW1lbnQsXG4gICAgX2lzRGlyZWN0ZWQgPSBmYWxzZVxuICApIHtcbiAgICBpZiAoIXRoaXMuaXNSZXNlcnZlZChfcmVsYXRpb25UeXBlKSkge1xuICAgICAgbGV0IG5vZGUyID0gYXdhaXQgdGhpcy5hZGROb2RlQXN5bmMoX2VsZW1lbnQpO1xuICAgICAgbGV0IHJlbCA9IG5ldyBTcGluYWxSZWxhdGlvbihcbiAgICAgICAgX3JlbGF0aW9uVHlwZSwgW19ub2RlXSwgW25vZGUyXSxcbiAgICAgICAgX2lzRGlyZWN0ZWRcbiAgICAgICk7XG4gICAgICB0aGlzLmFkZFJlbGF0aW9uKHJlbCk7XG4gICAgICByZXR1cm4gcmVsO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgX3JlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGlzIHJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW19yZWxhdGlvblR5cGVdXG4gICAgICApO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICogIEl0IGNyZWF0ZXMgdGhlIG5vZGUgY29ycmVzcG9uZGluZyB0byB0aGUgX2VsZW1lbnQsXG4gICAqIHRoZW4gaXQgY3JlYXRlcyBhIHNpbXBsZSByZWxhdGlvbiBvZiBjbGFzcyBTcGluYWxSZWxhdGlvbiBvZiB0eXBlOl90eXBlLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZX0gbm9kZVxuICAgKiBAcGFyYW0ge01vZGVsfSBlbGVtZW50IC0gYW55IHN1YkNsYXNzIG9mIE1vZGVsXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGlyZWN0ZWQ9ZmFsc2VdXG4gICAqIEByZXR1cm5zIGEgUHJvbWlzZSBvZiB0aGUgY3JlYXRlZCByZWxhdGlvblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIGFkZFNpbXBsZVJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgbm9kZSwgZWxlbWVudCwgaXNEaXJlY3RlZCA9IGZhbHNlKSB7XG4gICAgaWYgKCF0aGlzLmlzUmVzZXJ2ZWQoX3JlbGF0aW9uVHlwZSkpIHtcbiAgICAgIGxldCBub2RlMiA9IHRoaXMuYWRkTm9kZShlbGVtZW50KTtcbiAgICAgIGxldCByZWwgPSBuZXcgU3BpbmFsUmVsYXRpb24ocmVsYXRpb25UeXBlLCBbbm9kZV0sIFtub2RlMl0sXG4gICAgICAgIGlzRGlyZWN0ZWQpO1xuICAgICAgdGhpcy5hZGRSZWxhdGlvbihyZWwpO1xuICAgICAgcmV0dXJuIHJlbDtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIF9yZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tfcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBhZGRTaW1wbGVSZWxhdGlvbkJ5QXBwKFxuICAgIGFwcE5hbWUsXG4gICAgcmVsYXRpb25UeXBlLFxuICAgIG5vZGUsXG4gICAgZWxlbWVudCxcbiAgICBpc0RpcmVjdGVkID0gZmFsc2VcbiAgKSB7XG4gICAgaWYgKHRoaXMuaGFzUmVzZXJ2YXRpb25DcmVkZW50aWFscyhfcmVsYXRpb25UeXBlLCBhcHBOYW1lKSkge1xuICAgICAgaWYgKHRoaXMuY29udGFpbnNBcHAoYXBwTmFtZSkpIHtcbiAgICAgICAgbGV0IG5vZGUyID0gdGhpcy5hZGROb2RlKGVsZW1lbnQpO1xuICAgICAgICBsZXQgcmVsID0gbmV3IFNwaW5hbFJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgW25vZGVdLCBbbm9kZTJdLFxuICAgICAgICAgIGlzRGlyZWN0ZWQpO1xuICAgICAgICB0aGlzLmFkZFJlbGF0aW9uKHJlbCwgYXBwTmFtZSk7XG4gICAgICAgIHJldHVybiByZWw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKGFwcE5hbWUgKyBcIiBkb2VzIG5vdCBleGlzdFwiKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIF9yZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tfcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBhZGRSZWxhdGlvbihyZWxhdGlvbiwgYXBwTmFtZSkge1xuICAgIGlmICh0aGlzLmhhc1Jlc2VydmF0aW9uQ3JlZGVudGlhbHMocmVsYXRpb24udHlwZS5nZXQoKSwgYXBwTmFtZSkpIHtcbiAgICAgIGlmIChyZWxhdGlvbi5pc0RpcmVjdGVkLmdldCgpKSB7XG4gICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCByZWxhdGlvbi5ub2RlTGlzdDEubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgY29uc3Qgbm9kZSA9IHJlbGF0aW9uLm5vZGVMaXN0MVtpbmRleF07XG4gICAgICAgICAgbm9kZS5hZGREaXJlY3RlZFJlbGF0aW9uUGFyZW50KHJlbGF0aW9uLCBhcHBOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcmVsYXRpb24ubm9kZUxpc3QyLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgIGNvbnN0IG5vZGUgPSByZWxhdGlvbi5ub2RlTGlzdDJbaW5kZXhdO1xuICAgICAgICAgIG5vZGUuYWRkRGlyZWN0ZWRSZWxhdGlvbkNoaWxkKHJlbGF0aW9uLCBhcHBOYW1lKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHJlbGF0aW9uLm5vZGVMaXN0MS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICBjb25zdCBub2RlID0gcmVsYXRpb24ubm9kZUxpc3QxW2luZGV4XTtcbiAgICAgICAgICBub2RlLmFkZE5vbkRpcmVjdGVkUmVsYXRpb24ocmVsYXRpb24sIGFwcE5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCByZWxhdGlvbi5ub2RlTGlzdDIubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgY29uc3Qgbm9kZSA9IHJlbGF0aW9uLm5vZGVMaXN0MltpbmRleF07XG4gICAgICAgICAgbm9kZS5hZGROb25EaXJlY3RlZFJlbGF0aW9uKHJlbGF0aW9uLCBhcHBOYW1lKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5fY2xhc3NpZnlSZWxhdGlvbihyZWxhdGlvbiwgYXBwTmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICByZWxhdGlvbi50eXBlLmdldCgpICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb24udHlwZS5nZXQoKV1cbiAgICAgICk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9uc30gX3JlbGF0aW9uc1xuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIGFkZFJlbGF0aW9ucyhfcmVsYXRpb25zKSB7XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IF9yZWxhdGlvbnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCByZWxhdGlvbiA9IF9yZWxhdGlvbnNbaW5kZXhdO1xuICAgICAgdGhpcy5hZGRSZWxhdGlvbihyZWxhdGlvbik7XG4gICAgfVxuICB9XG5cbiAgX2NsYXNzaWZ5UmVsYXRpb24ocmVsYXRpb24sIGFwcE5hbWUpIHtcbiAgICB0aGlzLnJlbGF0aW9uTGlzdC5sb2FkKHJlbGF0aW9uTGlzdCA9PiB7XG4gICAgICByZWxhdGlvbkxpc3QucHVzaChyZWxhdGlvbik7XG4gICAgfSk7XG4gICAgaWYgKHRoaXMucmVsYXRpb25MaXN0QnlUeXBlW3JlbGF0aW9uLnR5cGUuZ2V0KCldKSB7XG4gICAgICB0aGlzLnJlbGF0aW9uTGlzdEJ5VHlwZVtyZWxhdGlvbi50eXBlLmdldCgpXS5sb2FkKHJlbGF0aW9uTGlzdE9mVHlwZSA9PiB7XG4gICAgICAgIHJlbGF0aW9uTGlzdE9mVHlwZS5wdXNoKHJlbGF0aW9uKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcmVsYXRpb25MaXN0T2ZUeXBlID0gbmV3IExzdCgpO1xuICAgICAgcmVsYXRpb25MaXN0T2ZUeXBlLnB1c2gocmVsYXRpb24pO1xuICAgICAgdGhpcy5yZWxhdGlvbkxpc3RCeVR5cGUuYWRkX2F0dHIoe1xuICAgICAgICBbcmVsYXRpb24udHlwZS5nZXQoKV06IG5ldyBQdHIocmVsYXRpb25MaXN0T2ZUeXBlKVxuICAgICAgfSk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgYXBwTmFtZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgaWYgKHRoaXMuY29udGFpbnNBcHAoYXBwTmFtZSkpXG4gICAgICAgIHRoaXMuYXBwc0xpc3RbYXBwTmFtZV0ubG9hZChhcHAgPT4ge1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIHR5cGVvZiBhcHBbcmVsYXRpb24udHlwZS5nZXQoKV0gPT09XG4gICAgICAgICAgICBcInVuZGVmaW5lZFwiXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBhcHAuYWRkUmVsYXRpb24ocmVsYXRpb24pXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIGNvbnRhaW5zQXBwKGFwcE5hbWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHRoaXMuYXBwc0xpc3RbYXBwTmFtZV0gIT09IFwidW5kZWZpbmVkXCI7XG4gIH1cblxuICBpc1Jlc2VydmVkKHJlbGF0aW9uVHlwZSkge1xuICAgIHJldHVybiB0eXBlb2YgdGhpcy5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uVHlwZV0gIT09IFwidW5kZWZpbmVkXCI7XG4gIH1cblxuICBoYXNSZXNlcnZhdGlvbkNyZWRlbnRpYWxzKHJlbGF0aW9uVHlwZSwgYXBwTmFtZSkge1xuICAgIHJldHVybiAoIXRoaXMuaXNSZXNlcnZlZChyZWxhdGlvblR5cGUpIHx8XG4gICAgICAodGhpcy5pc1Jlc2VydmVkKHJlbGF0aW9uVHlwZSkgJiZcbiAgICAgICAgdGhpcy5yZXNlcnZlZFJlbGF0aW9uc05hbWVzKHJlbGF0aW9uVHlwZSkgPT09IGFwcE5hbWUpXG4gICAgKTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbnN9IHJlbGF0aW9uc1xuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIF9jbGFzc2lmeVJlbGF0aW9ucyhfcmVsYXRpb25zKSB7XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IF9yZWxhdGlvbnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICB0aGlzLl9jbGFzc2lmeVJlbGF0aW9uKF9yZWxhdGlvbnNbaW5kZXhdKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7THN0fSBfbGlzdFxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIF9hZGROb3RFeGlzdGluZ05vZGVzRnJvbUxpc3QoX2xpc3QpIHtcbiAgICB0aGlzLm5vZGVMaXN0LmxvYWQobm9kZUxpc3QgPT4ge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBfbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgbm9kZSA9IF9saXN0W2ldO1xuICAgICAgICBpZiAoIVV0aWxpdGllcy5jb250YWluc0xzdEJ5SWQobm9kZUxpc3QsIG5vZGUpKSB7XG4gICAgICAgICAgdGhpcy5jbGFzc2lmeU5vZGUobm9kZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbnN9IF9yZWxhdGlvblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsR3JhcGhcbiAgICovXG4gIF9hZGROb3RFeGlzdGluZ05vZGVzRnJvbVJlbGF0aW9uKF9yZWxhdGlvbikge1xuICAgIHRoaXMuX2FkZE5vdEV4aXN0aW5nTm9kZXNGcm9tTGlzdChfcmVsYXRpb24ubm9kZUxpc3QxKTtcbiAgICB0aGlzLl9hZGROb3RFeGlzdGluZ05vZGVzRnJvbUxpc3QoX3JlbGF0aW9uLm5vZGVMaXN0Mik7XG4gIH1cblxuXG4gIC8vIGFzeW5jIGdldEFsbENvbnRleHRzKCkge1xuICAvLyAgIGxldCByZXMgPSBbXVxuICAvLyAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLmFwcHNMaXN0Ll9hdHRyaWJ1dGVfbmFtZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gIC8vICAgICBsZXQga2V5ID0gdGhpcy5hcHBzTGlzdC5fYXR0cmlidXRlX25hbWVzW2luZGV4XVxuICAvLyAgICAgaWYgKGtleS5pbmNsdWRlcyhcIl9DXCIsIGtleS5sZW5ndGggLSAyKSkge1xuICAvLyAgICAgICBjb25zdCBjb250ZXh0ID0gdGhpcy5hcHBzTGlzdFtrZXldO1xuICAvLyAgICAgICByZXMucHVzaChhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQoY29udGV4dCkpXG4gIC8vICAgICB9XG5cbiAgLy8gICB9XG4gIC8vICAgcmV0dXJuIHJlcztcbiAgLy8gfVxuXG4gIGFzeW5jIGdldEFwcHNCeVR5cGUoYXBwVHlwZSkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5hcHBzTGlzdEJ5VHlwZVthcHBUeXBlXSAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgIHJldHVybiBhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQodGhpcy5hcHBzTGlzdEJ5VHlwZVthcHBUeXBlXSlcbiAgfVxuXG5cblxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHBhcmFtIHtzdHJpbmdbXX0gcmVsYXRpb25zVHlwZXNMc3RcbiAgICogQHBhcmFtIHsqfSBbcmVsYXRlZEdyYXBoPXRoaXNdXG4gICAqIEBwYXJhbSB7UHRyfSBzdGFydGluZ05vZGVcbiAgICogQHJldHVybnMgQSBwcm9taXNlIG9mIHRoZSBjcmVhdGVkIENvbnRleHRcbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBhc3luYyBnZXRDb250ZXh0KG5hbWUsIHJlbGF0aW9uc1R5cGVzTHN0LCByZWxhdGVkR3JhcGggPSB0aGlzLFxuICAgIHN0YXJ0aW5nTm9kZSwgKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLmFwcHNMaXN0W25hbWVdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBsZXQgY29udGV4dCA9IG5ldyBTcGluYWxDb250ZXh0KFxuICAgICAgICBuYW1lLFxuICAgICAgICByZWxhdGlvbnNUeXBlc0xzdCxcbiAgICAgICAgcmVsYXRlZEdyYXBoLFxuICAgICAgICBzdGFydGluZ05vZGVcbiAgICAgICk7XG4gICAgICB0aGlzLmFwcHNMaXN0LmFkZF9hdHRyKHtcbiAgICAgICAgW25hbWVdOiBuZXcgUHRyKGNvbnRleHQpXG4gICAgICB9KTtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5hcHBzTGlzdEJ5VHlwZS5jb250ZXh0ID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHRoaXMuYXBwc0xpc3RCeVR5cGUuYWRkX2F0dHIoe1xuICAgICAgICAgIGNvbnRleHQ6IG5ldyBQdHIobmV3IExzdChbY29udGV4dF0pKVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBjb250ZXh0TGlzdCA9IGF3YWl0IFV0aWxpdGllcy5wcm9taXNlTG9hZCh0aGlzLmFwcHNMaXN0QnlUeXBlLmNvbnRleHQpXG4gICAgICAgIGNvbnRleHRMaXN0LnB1c2goY29udGV4dClcbiAgICAgIH1cbiAgICAgIHJldHVybiBjb250ZXh0O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYXdhaXQgVXRpbGl0aWVzLnByb21pc2VMb2FkKHRoaXMuYXBwc0xpc3RbbmFtZV0pXG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0geyp9IG5hbWVcbiAgICogQHBhcmFtIHsqfSByZWxhdGlvbnNUeXBlc0xzdFxuICAgKiBAcGFyYW0geyp9IFtyZWxhdGVkU3BpbmFsR3JhcGg9dGhpc11cbiAgICogQHJldHVybnNcbiAgICogQG1lbWJlcm9mIFNwaW5hbEdyYXBoXG4gICAqL1xuICBhc3luYyBnZXRBcHAobmFtZSwgcmVsYXRpb25zVHlwZXNMc3QsIHJlbGF0ZWRTcGluYWxHcmFwaCA9IHRoaXMpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMuYXBwc0xpc3RbbmFtZV0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGxldCBzcGluYWxBcHBsaWNhdGlvbiA9IG5ldyBTcGluYWxBcHBsaWNhdGlvbihcbiAgICAgICAgbmFtZSxcbiAgICAgICAgcmVsYXRpb25zVHlwZXNMc3QsXG4gICAgICAgIHJlbGF0ZWRTcGluYWxHcmFwaFxuICAgICAgKTtcbiAgICAgIHRoaXMuYXBwc0xpc3QuYWRkX2F0dHIoe1xuICAgICAgICBbbmFtZV06IG5ldyBQdHIoc3BpbmFsQXBwbGljYXRpb24pXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBzcGluYWxBcHBsaWNhdGlvbjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGF3YWl0IFV0aWxpdGllcy5wcm9taXNlTG9hZCh0aGlzLmFwcHNMaXN0W25hbWVdKVxuICAgICAgLy8gY29uc29sZS5lcnJvcihcbiAgICAgIC8vICAgbmFtZSArXG4gICAgICAvLyAgIFwiIGFzIHdlbGwgYXMgXCIgK1xuICAgICAgLy8gICB0aGlzLmdldEFwcHNOYW1lcygpICtcbiAgICAgIC8vICAgXCIgaGF2ZSBiZWVuIGFscmVhZHkgdXNlZCwgcGxlYXNlIGNob29zZSBhbm90aGVyIGFwcGxpY2F0aW9uIG5hbWVcIlxuICAgICAgLy8gKTtcbiAgICB9XG4gIH1cblxuICBnZXRBcHBzTmFtZXMoKSB7XG4gICAgdGhpcy5hcHBzTGlzdC5fYXR0cmlidXRlX25hbWVzO1xuICB9XG5cbiAgcmVzZXJ2ZVVuaXF1ZVJlbGF0aW9uVHlwZShyZWxhdGlvblR5cGUsIGFwcCkge1xuICAgIGlmIChcbiAgICAgIHR5cGVvZiB0aGlzLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb25UeXBlXSA9PT0gXCJ1bmRlZmluZWRcIiAmJlxuICAgICAgdHlwZW9mIHRoaXMucmVsYXRpb25MaXN0QnlUeXBlW3JlbGF0aW9uVHlwZV0gPT09IFwidW5kZWZpbmVkXCJcbiAgICApIHtcbiAgICAgIHRoaXMucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lcy5hZGRfYXR0cih7XG4gICAgICAgIFtyZWxhdGlvblR5cGVdOiBhcHAubmFtZS5nZXQoKVxuICAgICAgfSk7XG4gICAgICBhcHAuYWRkUmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgdHlwZW9mIHRoaXMucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvblR5cGVdICE9PSBcInVuZGVmaW5lZFwiXG4gICAgKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICByZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBoYXMgbm90IGJlZW4gYWRkZWQgdG8gYXBwOiBcIiArXG4gICAgICAgIGFwcC5uYW1lLmdldCgpICtcbiAgICAgICAgXCIsQ2F1c2UgOiBhbHJlYWR5IFJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uVHlwZV1cbiAgICAgICk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5yZWxhdGlvbkxpc3RCeVR5cGVbcmVsYXRpb25UeXBlXSAhPT1cbiAgICAgIFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgIHJlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGhhcyBub3QgYmVlbiBhZGRlZCB0byBhcHA6IFwiICtcbiAgICAgICAgYXBwLm5hbWUuZ2V0KCkgK1xuICAgICAgICBcIixDYXVzZSA6IGFscmVhZHkgVXNlZCBieSBvdGhlciBBcHBzXCJcbiAgICAgICk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNwaW5hbEdyYXBoO1xuc3BpbmFsQ29yZS5yZWdpc3Rlcl9tb2RlbHMoW1NwaW5hbEdyYXBoXSk7Il19