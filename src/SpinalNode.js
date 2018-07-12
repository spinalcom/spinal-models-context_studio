const spinalCore = require("spinal-core-connectorjs");
const globalType = typeof window === "undefined" ? global : window;
let getViewer = function() {
  return globalType.v;
};

export default class SpinalNode extends globalType.Model {
  constructor(_name, _element, _graph, _relations) {
    super();
    if (FileSystem._sig_server) {
      this.add_attr({
        name: _name,
        id: this.guid(),
        element: _element,
        relations: new Model(),
        graph: new Ptr(_graph)
      });
      if (typeof this.graph !== "undefined") {
        this.graph.load(g => {
          g.addVertex(this);
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



  addRelation(_relation) {
    this.graph.load(graph => {
      graph.addRelation(_relation)
      graph._addNotExistingVerticesFromRelation(_relation)
    })
    if (typeof this.relations[_relation.type.get()] !== "undefined")
      this.relations[_relation.type.get()].load(relationList => {
        relationList.push(_relation)
      })
    else {
      let list = new Lst();
      list.push(_relation)
      this.relations.add_attr({
        [_relation.type.get()]: new Ptr(list)
      })
    }
  }

  addRelations(_relations) {
    for (let index = 0; index < _relations.length; index++) {
      this.addRelation(_relations[index]);
    }
  }

  promiseLoad(_ptr) {
    return new Promise(resolve => {
      _ptr.load(resolve);
    });
  }

  async getRelations(_type) {
    let res = []
    if (typeof _type === "undefined") {
      for (let index = 0; index < this.relations.attr_attribute_names.length; index++) {
        const attribute = this.relations.attr_attribute_names[index];
        let relList = await this.promiseLoad(attribute)
        for (let index = 0; index < relList.length; index++) {
          const relation = relList[index];
          res.push(relation)
        }
      }
      return res;
    } else {
      let relList = await this.promiseLoad(this.relations[_type])
      return relList;
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

  async getNeighbors(_type) {
    neighbors = []
    let relations = await this.getRelations(_type)
    for (let index = 0; index < relations.length; index++) {
      const relation = relations[index];
      if (relation.isDirected.get()) {
        if (this.inVertexList(relation.vertexlist1))
          neighbors = neighbors.concat(relation.vertexlist2)
        else
          neighbors = neighbors.concat(relation.vertexlist1)
      } else {
        neighbors = neighbors.concat(this.allButMe(relation.vertexlist1));
        neighbors = neighbors.concat(this.allButMe(relation.vertexlist2))
      }
    }
    return neighbors
  }



  async removeRelation(_relation) {
    let relationLst = await this.promiseLoad(this.relations[_relation
      .type
      .get()])
    for (let index = 0; index < relationLst.length; index++) {
      const candidateRelation = relationLst[index];
      if (_relation.id.get() === candidateRelation.id.get())
        relationLst.splice(index, 1)
    }
  }

  async removeRelations(_relations) {
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