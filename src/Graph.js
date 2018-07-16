const spinalCore = require("spinal-core-connectorjs");
const globalType = typeof window === "undefined" ? global : window;
import SpinalNode from "./SpinalNode";
import SpinalRelation from "./SpinalRelation";
import AbstractElement from "./AbstractElement";
import BIMElement from "./BIMElement";
import SpinalContext from "./SpinalContext";

import {
  Utilities
} from "./Utilities";

export default class Graph extends globalType.Model {
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

  init() {
    globalType.spinal.contextStudio = {};
    globalType.spinal.contextStudio.graph = this;
    globalType.spinal.contextStudio.SpinalNode = SpinalNode;
    globalType.spinal.contextStudio.SpinalRelation = SpinalRelation;
    globalType.spinal.contextStudio.AbstractElement = AbstractElement;
    globalType.spinal.contextStudio.BIMElement = BIMElement;
    globalType.spinal.contextStudio.Utilities = Utilities;
  }

  async getNodeBydbId(_dbId) {
    let _externalId = await Utilities.getExternalId(_dbId);
    if (typeof this.externalIdNodeMapping[_externalId] !== "undefined")
      return this.externalIdNodeMapping[_externalId];
    else {
      let BIMElement1 = new BIMElement(_dbId);
      BIMElement1.initExternalId();
      let node = await this.addNodeAsync(BIMElement1);
      if (BIMElement1.type.get() === "") {
        BIMElement1.type.bind(
          this._classifyBIMElementNode.bind(this, node)
        );
      }
      return node;
    }
  }

  async _classifyBIMElementNode(_node) {
    //TODO DELETE OLD CLASSIFICATION
    this.classifyNode(_node);
  }

  async getDbIdByNode(_node) {
    let element = await Utilities.promiseLoad(_node.element);
    if (element instanceof BIMElement) {
      return element.id.get();
    }
  }

  setName(_name) {
    this.name.set(_name);
  }

  setStartingNode(_startingNode) {
    this.startingNode.set(_startingNode);
  }

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

  classifyNode(_node) {
    Utilities.promiseLoad(_node.element).then(element => {
      if (typeof _node.graph === "undefined") _node.graph.set(this);
      this.nodeList.load(nodeList => {
        nodeList.push(_node);
      });
      let type = "UnClassified";
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

  async addSimpleRelationAsync(_relationType, _node, _element, _isDirected) {
    let node2 = await this.addNodeAsync(_element);
    let rel = new SpinalRelation(_relationType, _node, node2, _isDirected);
    return rel;
  }

  addSimpleRelation(_relationType, _node, _element, _isDirected) {
    let node2 = this.addNode(_element);
    let rel = new SpinalRelation(_relationType, _node, node2, _isDirected);
    return rel;
  }

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
        if (!Utilities.contains(nodeList, node)) {
          this.classifyNode(node);
        }
      }
    });
  }

  _addNotExistingNodesFromRelation(_relation) {
    this._addNotExistingNodesFromList(_relation.nodeList1);
    this._addNotExistingNodesFromList(_relation.nodeList2);
  }

  addContext(_name, _usedRelations, _startingNode, _usedGraph) {
    let context = new SpinalContext(_name, _usedRelations, _startingNode,
      _usedGraph)
    this.contextList.push(context)
    return context;
  }
}

spinalCore.register_models([Graph]);