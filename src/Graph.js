const spinalCore = require("spinal-core-connectorjs");
const globalType = typeof window === "undefined" ? global : window;

export default class Graph extends globalType.Model {
  constructor(_name, _startingVertex, name = "Graph") {
    super();
    if (FileSystem._sig_server) {
      this.add_attr({
        name: _name || "",
        startingVertex: _startingVertex || new Ptr(0),
        vertexList: new Ptr(new Lst()),
        vertexListByElementType: new Model(),
        relationList: new Ptr(new Lst()),
        relationListByType: new Model()
      });
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

  addStartingVertex(_startingVertex) {
    this.mod_attr("startingVertex", new Ptr(_startingVertex))
  }

  addVertex(_vertex) {
    _vertex.graph.set(this);
    this.vertexList.load(vertexList => {
      vertexList.push(_vertex)
    })
    if (this.vertexListByElementType[_vertex.element.type.get()]) {
      this.vertexListByElementType[_vertex.element.type.get()].load(
        vertexListOfType => {
          vertexListOfType.push(_vertex)
        })
    } else {
      let vertexListOfType = new Lst()
      vertexListOfType.push(_vertex);
      this.vertexListByElementType.add_attr({
        [_vertex.element.type.get()]: new Ptr(
          vertexListOfType)
      })
    }
  }

  addVertices(_vertices) {
    for (let index = 0; index < _vertices.length; index++) {
      this.addVertex(_vertices[index])
    }
  }



  addRelation(_relation) {
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

  addRelations(_relations) {
    for (let index = 0; index < _relations.length; index++) {
      this.addRelation(_relations[index])
    }
  }

  static _contains(_list, _vertex) {
    for (let index = 0; index < _list.length; index++) {
      const element = _list[index];
      if (element.id.get() == _vertex.id.get())
        return true
    }
    return false
  }

  _addNotExistingVerticesFromList(_list) {
    this.vertexList.load(vertexList => {
      for (let i = 0; i < _list.length; i++) {
        let vertex = _list[i];
        if (!Graph._contains(vertexList, vertex))
          this.addVertex(vertex)
      }
    })
  }

  _addNotExistingVerticesFromRelation(_relation) {
    this._addNotExistingVerticesFromList(_relation.vertexList1)
    this._addNotExistingVerticesFromList(_relation.vertexList2)
  }

}

spinalCore.register_models([Graph])