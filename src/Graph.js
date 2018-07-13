const spinalCore = require("spinal-core-connectorjs");
const globalType = typeof window === "undefined" ? global : window;
import SpinalNode from "./SpinalNode"
import SpinalRelation from "./SpinalRelation"
import AbstractElement from "./AbstractElement"
import BIMElement from "./BIMElement"


import {
  Utilities
} from "./Utilities"


export default class Graph extends globalType.Model {
  constructor(_name, _startingVertex, name = "Graph") {
    super();
    if (FileSystem._sig_server) {
      this.add_attr({
        name: _name || "",
        externalIdVertexDic: new Model(),
        startingVertex: _startingVertex || new Ptr(0),
        vertexList: new Ptr(new Lst()),
        vertexListByElementType: new Model(),
        relationList: new Ptr(new Lst()),
        relationListByType: new Model()
      });
    }
  }

  init() {
    globalType.spinal.contextStudio = {}
    globalType.spinal.contextStudio.graph = this
    globalType.spinal.contextStudio.SpinalNode = SpinalNode
    globalType.spinal.contextStudio.SpinalRelation = SpinalRelation
    globalType.spinal.contextStudio.AbstractElement = AbstractElement
    globalType.spinal.contextStudio.BIMElement = BIMElement
    globalType.spinal.contextStudio.Utilities = Utilities
  }

  async getNodeBydbId(_dbId) {
    let _externalId = await Utilities.getExternalId(_dbId)
    return this.externalIdVertexDic[_externalId]
  }

  async getDbIdByNode(_vertex) {
    let element = await Utilities.promiseLoad(_vertex.element)
    if (element instanceof BIMElement) {
      let _dbId = await Utilities.getDbIdByExternalId(element.id.get())
      return _dbId;
    }
  }



  guid() {
    return (
      this.constructor.name +
      "-" +
      this.s4() +
      this.s4() +
      "-" +
      this.s4() +
      "-" +
      this.s4() +
      "-" +
      this.s4() +
      "-" +
      this.s4() +
      this.s4() +
      this.s4() +
      "-" +
      Date.now().toString(16)
    );
  }

  s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  setName(_name) {
    this.name.set(_name)
  }

  setStartingVertex(_startingVertex) {
    this.mod_attr("startingVertex", new Ptr(_startingVertex))
  }

  async _addExternalIdVertexDicEntry(_ElementId, _vertex) {
    let _dbid = _ElementId.get()
    if (typeof _dbid == "number")
      if (_dbid != 0) {
        let externalId = await Utilities.getExternalId(_dbid)
        if (typeof this.externalIdVertexDic[externalId] === "undefined")
          this.externalIdVertexDic.add_attr({
            [externalId]: _vertex
          })
        _ElementId.unbind(this._addExternalIdVertexDicEntry.bind(null,
          _ElementId))
      }
  }

  addVertex(_element) {
    if (_element instanceof BIMElement && typeof this.externalIdVertexDic[
        _element.id.get()] !== "undefined") {
      console.log("BIM OBJECT NODE ALREADY EXISTS");
      return this.externalIdVertexDic[_element.id.get()]
    } else {
      let name = ""
      if (typeof _element.name !== "undefined") {
        name = _element.name.get();
      }
      let vertex = new SpinalNode(name, _element, this);
      return vertex;
    }
  }

  classifyVertex(_vertex) {
    Utilities.promiseLoad(_vertex.element).then(element => {
      _vertex.graph.set(this);
      this.vertexList.load(vertexList => {
        vertexList.push(_vertex)
      })
      let type = element.constructor.name
      if (typeof element.type != "undefined") {
        type = element.type.get()
      }
      if (this.vertexListByElementType[type]) {
        this.vertexListByElementType[type].load(
          vertexListOfType => {
            vertexListOfType.push(_vertex)
          })
      } else {
        let vertexListOfType = new Lst()
        vertexListOfType.push(_vertex);
        this.vertexListByElementType.add_attr({
          [type]: new Ptr(
            vertexListOfType)
        })
      }
      if (element instanceof BIMElement) {
        let _dbid = element.id.get()
        if (typeof _dbid == "number")
          if (_dbid != 0) {
            this._addExternalIdVertexDicEntry(element.id, _vertex)
          }
        else {
          element.id.bind(this._addExternalIdVertexDicEntry.bind(null,
            element.id, _vertex))
        }
      }
    })
  }

  addVertices(_vertices) {
    for (let index = 0; index < _vertices.length; index++) {
      this.classifyVertex(_vertices[index])
    }
  }

  addRelation(_relation) {
    for (let index = 0; index < _relation.vertexList1.length; index++) {
      const vertex = _relation.vertexList1[index];
      vertex.addRelation(_relation)
    }
    if (_relation.isDirected.get()) {
      for (let index = 0; index < _relation.vertexList2.length; index++) {
        const vertex = _relation.vertexList2[index];
        vertex.addDirectedRelationChild(_relation)
      }
    } else {
      for (let index = 0; index < _relation.vertexList2.length; index++) {
        const vertex = _relation.vertexList2[index];
        vertex.addRelation(_relation)
      }
    }
    this._classifyRelation(_relation);
  }

  addRelations(_relations) {
    for (let index = 0; index < _relations.length; index++) {
      const relation = _relations[index];
      this.addRelation(relation)
    }
  }



  _classifyRelation(_relation) {
    this.relationList.load(relationList => {
      relationList.push(_relation)
    })
    if (this.relationListByType[_relation.type.get()]) {
      this.relationListByType[_relation.type.get()].load(
        relationListOfType => {
          relationListOfType.push(_relation)
        })
    } else {
      let relationListOfType = new Lst()
      relationListOfType.push(_relation);
      this.relationListByType.add_attr({
        [_relation.type.get()]: new Ptr(
          relationListOfType)
      })
    }
  }

  _classifyRelations(_relations) {
    for (let index = 0; index < _relations.length; index++) {
      this.classRelation(_relations[index])
    }
  }



  _addNotExistingVerticesFromList(_list) {
    this.vertexList.load(vertexList => {
      for (let i = 0; i < _list.length; i++) {
        let vertex = _list[i];
        if (!Utilities.contains(vertexList, vertex)) {
          this.classifyVertex(vertex)
          console.log("test");
        }
      }
    })
  }

  _addNotExistingVerticesFromRelation(_relation) {
    this._addNotExistingVerticesFromList(_relation.vertexList1)
    this._addNotExistingVerticesFromList(_relation.vertexList2)
  }

}

spinalCore.register_models([Graph])