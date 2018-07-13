const spinalCore = require("spinal-core-connectorjs");
const globalType = typeof window === "undefined" ? global : window;
let getViewer = function() {
  return globalType.v;
};

import {
  Utilities
} from "./Utilities"


export default class SpinalNode extends globalType.Model {
  constructor(_name, _element, _graph, _relations) {
    super();
    if (FileSystem._sig_server) {
      this.add_attr({
        name: _name,
        id: this.guid(),
        element: new Ptr(_element),
        relations: new Model(),
        graph: new Ptr(_graph)
      });
      if (typeof this.graph !== "undefined") {
        this.graph.load(g => {
          g.classifyVertex(this);
        })
      }
      if (typeof _relations !== "undefined") {
        if (Array.isArray(_relations) || _relations instanceof Lst)
          this.addRelations(_relations)
        else
          this.addRelation(_relations)
      }
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

  hasRelation() {
    return this.relations.length !== 0;
  }

  addDirectedRelationChild(_relation) {
    let name = _relation.type.get()
    name = name.replace(/e?.$/, "edBy")
    this.addRelation(_relation, name)
  }

  addRelation(_relation, _name) {
    let name = _relation.type.get()
    if (typeof _name !== "undefined") {
      name = _name
    }
    if (typeof this.relations[_relation.type.get()] !== "undefined")
      this.relations[_relation.type.get()].push(_relation);
    else {
      let list = new Lst();
      list.push(_relation)
      this.relations.add_attr({
        [name]: list
      })
    }
  }


  addRelation2(_relation, _name) {
    let classify = false;
    let name = _relation.type.get()
    if (typeof _name !== "undefined") {
      name = _name
    }
    if (typeof this.relations[_relation.type.get()] !== "undefined") {
      if (_relation.isDirected.get()) {
        for (let index = 0; index < this.relations[_relation.type.get()].length; index++) {
          const element = this.relations[_relation.type.get()][index];
          if (Utilities.arraysEqual(_relation.getVertexList1Ids(),
              element.getVertexList1Ids())) {
            element.addNotExistingVerticestoVertexList2(_relation.vertexList2)
          } else {
            element.push(_relation);
            classify = true
          }
        }
      } else {
        this.relations[_relation.type.get()].addNotExistingVerticestoRelation(
          _relation)
      }
    } else {
      if (_relation.isDirected.get()) {
        let list = new Lst();
        list.push(_relation)
        this.relations.add_attr({
          [name]: list
        })
        this._classifyRelation(_relation);
      } else {
        this.relations.add_attr({
          [name]: _relation
        })
        classify = true

      }
    }
    if (classify) this._classifyRelation(_relation);
  }

  _classifyRelation(_relation) {
    this.graph.load(graph => {
      graph._classifyRelation(_relation)
    })
  }

  //TODO :NotWorking
  // addRelation(_relation) {
  //   this.addRelation(_relation)
  //   this.graph.load(graph => {
  //     graph._addNotExistingVerticesFromRelation(_relation)
  //   })
  // }
  //TODO :NotWorking
  // addRelations(_relations) {
  //   for (let index = 0; index < _relations.length; index++) {
  //     this.addRelation(_relations[index]);
  //   }
  // }


  getRelations(_type) {
    let res = []
    if (typeof _type === "undefined") {
      for (let index = 0; index < this.relations._attribute_names.length; index++) {
        const relList = this.relations[this.relations._attribute_names[
          index]];
        for (let index = 0; index < relList.length; index++) {
          const relation = relList[index];
          res.push(relation)
        }
      }
      return res;
    } else {
      return this.relations[_type];
    }
  }



  inVertexList(_vertexlist) {
    for (let index = 0; index < _vertexlist.length; index++) {
      const element = _vertexlist[index];
      if (element.id.get() === this.id.get())
        return true
    }
    return false
  }

  allButMe(_list) {
    let res = []
    for (let index = 0; index < _list.length; index++) {
      const vertex = _list[index];
      if (vertex.id.get() != this.id.get()) {
        res.push(vertex)
      }
      return res;
    }
  }

  getNeighbors(_type) {
    let neighbors = []
    let relations = this.getRelations(_type)
    for (let index = 0; index < relations.length; index++) {
      const relation = relations[index];
      if (relation.isDirected.get()) {
        if (this.inVertexList(relation.vertexList1))
          neighbors = neighbors.concat(relation.vertexList2)
        else
          neighbors = neighbors.concat(relation.vertexList1)
      } else {
        neighbors = neighbors.concat(this.allButMe(relation.vertexList1));
        neighbors = neighbors.concat(this.allButMe(relation.vertexList2))
      }
    }
    return neighbors
  }



  removeRelation(_relation) {
    let relationLst = this.relations[_relation.type.get()]
    for (let index = 0; index < relationLst.length; index++) {
      const candidateRelation = relationLst[index];
      if (_relation.id.get() === candidateRelation.id.get())
        relationLst.splice(index, 1)
    }
  }

  removeRelations(_relations) {
    for (let index = 0; index < _relations.length; index++) {
      this.removeRelation(_relations[index])
    }
  }

  removeRelationType(_type) {
    if (Array.isArray(_type) || _type instanceof Lst)
      for (let index = 0; index < _type.length; index++) {
        const type = _type[index];
        this.relations.rem_attr(type)
      }
    else {
      this.relations.rem_attr(_type)
    }
  }

}

spinalCore.register_models([SpinalNode]);