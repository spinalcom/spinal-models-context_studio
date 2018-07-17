const spinalCore = require("spinal-core-connectorjs");
const globalType = typeof window === "undefined" ? global : window;
import SpinalNode from "./SpinalNode";
import SpinalRelation from "./SpinalRelation";
import AbstractElement from "./AbstractElement";
import BIMElement from "./BIMElement";
import SpinalContext from "./SpinalContext";
import SpinalApplication from "./SpinalApplication";

import {
  Utilities
} from "./Utilities";
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
    globalType.spinal.contextStudio.SpinalNode = SpinalNode;
    globalType.spinal.contextStudio.SpinalRelation = SpinalRelation;
    globalType.spinal.contextStudio.AbstractElement = AbstractElement;
    globalType.spinal.contextStudio.BIMElement = BIMElement;
    globalType.spinal.contextStudio.Utilities = Utilities;
  }
  /**
   *
   *
   * @param {number} _dbId
   * @returns Promise of the corresponding Node or the created one if not existing
   * @memberof Graph
   */
  async getNodeBydbId(_dbId) {
    let _externalId = await Utilities.getExternalId(_dbId);
    if (typeof this.externalIdNodeMapping[_externalId] !== "undefined")
      return this.externalIdNodeMapping[_externalId];
    else {
      let BIMElement1 = new BIMElement(_dbId);
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
    let element = await Utilities.promiseLoad(_node.element);
    if (element instanceof BIMElement) {
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
    if (typeof _dbid == "number")
      if (_dbid != 0) {
        let externalId = await Utilities.getExternalId(_dbid);
        let element = await Utilities.promiseLoad(_node.element);
        await element.initExternalId();
        if (typeof this.externalIdNodeMapping[externalId] === "undefined")
          this.externalIdNodeMapping.add_attr({
            [externalId]: _node
          });
        _ElementId.unbind(
          this._addExternalIdNodeMappingEntry.bind(this, _ElementId,
            _node)
        );
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
    if (_element instanceof BIMElement) {
      await _element.initExternalIdAsync();
      if (
        typeof this.externalIdNodeMapping[_element.externalId.get()] !==
        "undefined"
      ) {
        console.log("BIM OBJECT NODE ALREADY EXISTS");
        return this.externalIdNodeMapping[_element.externalId.get()];
      }
    } else if (_element instanceof AbstractElement) {
      if (
        typeof this.guidAbstractNodeMapping[_element.id.get()] !==
        "undefined"
      ) {
        console.log("ABSTRACT OBJECT NODE ALREADY EXISTS");
        return this.guidAbstractNodeMapping[_element.id.get()];
      }
    }
    if (typeof _element.name !== "undefined") {
      name = _element.name.get();
    }
    let node = new SpinalNode(name, _element, this);
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
    if (_element instanceof BIMElement) {
      _element.initExternalId();
      if (
        typeof this.externalIdNodeMapping[_element.externalId.get()] !==
        "undefined"
      ) {
        console.log("BIM OBJECT NODE ALREADY EXISTS");
        return this.externalIdNodeMapping[_element.externalId.get()];
      }
    } else if (_element instanceof AbstractElement) {
      if (
        typeof this.guidAbstractNodeMapping[_element.id.get()] !==
        "undefined"
      ) {
        console.log("ABSTRACT OBJECT NODE ALREADY EXISTS");
        return this.guidAbstractNodeMapping[_element.id.get()];
      }
    }
    if (typeof _element.name !== "undefined") {
      name = _element.name.get();
    }
    let node = new SpinalNode(name, _element, this);
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
    Utilities.promiseLoad(_node.element).then(element => {
      if (typeof _node.graph === "undefined") _node.graph.set(this);
      this.nodeList.load(nodeList => {
        nodeList.push(_node);
      });
      let type = "Unclassified";
      if (typeof element.type != "undefined" && element.type.get() !=
        "") {
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
      if (element instanceof BIMElement) {
        let _dbid = element.id.get();
        if (typeof _dbid == "number")
          if (_dbid != 0) {
            this._addExternalIdNodeMappingEntry(element.id, _node);
          } else {
            element.id.bind(
              this._addExternalIdNodeMappingEntry.bind(null, element.id,
                _node)
            );
          }
      } else if (element instanceof AbstractElement) {
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
  async addSimpleRelationAsync(
    _relationType,
    _node,
    _element,
    _isDirected = false
  ) {
    if (!this.isReserved(_relationType)) {
      let node2 = await this.addNodeAsync(_element);
      let rel = new SpinalRelation(
        _relationType, [_node], [node2],
        _isDirected
      );
      this.addRelation(rel);
      return rel;
    } else {
      console.log(
        _relationType +
        " is reserved by " +
        this.reservedRelationsNames[_relationType]
      );
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
      let rel = new SpinalRelation(relationType, [node], [node2],
        isDirected);
      this.addRelation(rel);
      return rel;
    } else {
      console.log(
        _relationType +
        " is reserved by " +
        this.reservedRelationsNames[_relationType]
      );
    }
  }

  addSimpleRelationByApp(
    appName,
    relationType,
    node,
    element,
    isDirected = false
  ) {
    if (this.hasReservationCredentials(_relationType, appName)) {
      if (this.containsApp(appName)) {
        let node2 = this.addNode(element);
        let rel = new SpinalRelation(relationType, [node], [node2],
          isDirected);
        this.addRelation(rel, appName);
        return rel;
      } else {
        console.error(appName + " does not exist");
      }
    } else {
      console.log(
        _relationType +
        " is reserved by " +
        this.reservedRelationsNames[_relationType]
      );
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
      console.log(
        relation.type.get() +
        " is reserved by " +
        this.reservedRelationsNames[relation.type.get()]
      );
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
      if (
        typeof this.appsList[appName][relation.type.get()] ===
        "undefined"
      ) {
        this.appsList[appName].addRelation(relation)
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
    return (!this.isReserved(relationType) ||
      (this.isReserved(relationType) &&
        this.reservedRelationsNames(relationType) === appName)
    );
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
        if (!Utilities.containsLstById(nodeList, node)) {
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
    let context = new SpinalContext(
      _name,
      _usedRelations,
      _startingNode,
      _usedGraph
    );
    this.contextList.push(context);
    return context;
  }

  getApp(name, relationsTypesLst, relatedGraph = this) {
    if (typeof this.appsList[name] === "undefined") {
      let spinalApplication = new SpinalApplication(
        name,
        relationsTypesLst,
        relatedGraph
      );
      this.appsList.add_attr({
        [name]: spinalApplication
      });
      return spinalApplication;
    } else {
      this.appsList[name]
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
    if (
      typeof this.reservedRelationsNames[relationType] === "undefined" &&
      typeof this.relationListByType[relationType] === "undefined"
    ) {
      this.reservedRelationsNames.add_attr({
        [relationType]: app.name.get()
      });
      app.addRelationType(relationType);
      return true;
    } else if (
      typeof this.reservedRelationsNames[relationType] !== "undefined"
    ) {
      console.error(
        relationType +
        " has not been added to app: " +
        app.name.get() +
        ",Cause : already Reserved by " +
        this.reservedRelationsNames[relationType]
      );
      return false;
    } else if (typeof this.relationListByType[relationType] !== "undefined") {
      console.error(
        relationType +
        " has not been added to app: " +
        app.name.get() +
        ",Cause : already Used by other Apps"
      );
    }
  }
}

export default Graph;
spinalCore.register_models([Graph]);