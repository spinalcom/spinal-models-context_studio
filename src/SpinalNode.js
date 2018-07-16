const spinalCore = require("spinal-core-connectorjs");
const globalType = typeof window === "undefined" ? global : window;
let getViewer = function() {
  return globalType.v;
};

import {
  Utilities
} from "./Utilities";

export default class SpinalNode extends globalType.Model {
  constructor(_name, _element, _graph, _relations, name =
    "SpinalNode") {
    super();
    if (FileSystem._sig_server) {
      this.add_attr({
        name: _name,
        id: Utilities.guid(this.constructor.name),
        element: new Ptr(_element),
        relations: new Model(),
        graph: _graph
      });
      if (typeof this.graph !== "undefined") {
        this.graph.classifyNode(this);
      }
      if (typeof _relations !== "undefined") {
        if (Array.isArray(_relations) || _relations instanceof Lst)
          this.addRelations(_relations);
        else this.addRelation(_relations);
      }
    }
  }



  hasRelation() {
    return this.relations.length !== 0;
  }

  addDirectedRelationParent(_relation) {
    let name = _relation.type.get();
    name = name.concat("<");
    this.addRelation(_relation, name);
  }

  addDirectedRelationChild(_relation) {
    let name = _relation.type.get();
    name = name.concat(">");
    this.addRelation(_relation, name);
  }

  addNonDirectedRelation(_relation) {
    let name = _relation.type.get();
    name = name.concat("-");
    this.addRelation(_relation, name);
  }

  addRelation(_relation, _name) {
    let name = _relation.type.get();
    if (typeof _name !== "undefined") {
      name = _name;
    }
    if (typeof this.relations[name] !== "undefined")
      this.relations[name].push(_relation);
    else {
      let list = new Lst();
      list.push(_relation);
      this.relations.add_attr({
        [name]: list
      });
    }
  }

  addRelation2(_relation, _name) {
    let classify = false;
    let name = _relation.type.get();
    if (typeof _name !== "undefined") {
      name = _name;
    }
    if (typeof this.relations[_relation.type.get()] !== "undefined") {
      if (_relation.isDirected.get()) {
        for (
          let index = 0; index < this.relations[_relation.type.get()].length; index++
        ) {
          const element = this.relations[_relation.type.get()][index];
          if (
            Utilities.arraysEqual(
              _relation.getNodeList1Ids(),
              element.getNodeList1Ids()
            )
          ) {
            element.addNotExistingVerticestoNodeList2(_relation.nodeList2);
          } else {
            element.push(_relation);
            classify = true;
          }
        }
      } else {
        this.relations[_relation.type.get()].addNotExistingVerticestoRelation(
          _relation
        );
      }
    } else {
      if (_relation.isDirected.get()) {
        let list = new Lst();
        list.push(_relation);
        this.relations.add_attr({
          [name]: list
        });
        this._classifyRelation(_relation);
      } else {
        this.relations.add_attr({
          [name]: _relation
        });
        classify = true;
      }
    }
    if (classify) this._classifyRelation(_relation);
  }

  _classifyRelation(_relation) {
    this.graph.load(graph => {
      graph._classifyRelation(_relation);
    });
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
    let res = [];
    if (typeof _type === "undefined") {
      for (
        let i = 0; i < this.relations._attribute_names.length; i++
      ) {
        const relList = this.relations[this.relations._attribute_names[
          i]];
        for (let j = 0; j < relList.length; j++) {
          const relation = relList[j];
          res.push(relation);
        }
      }
      return res;
    } else {
      if (!_type.includes('>', _type.length - 2) &&
        !_type.includes('<', _type.length - 2) &&
        !_type.includes('-', _type.length - 2)) {
        let t1 = _type.concat('>')
        res = Utilities.concat(res, this.getRelations(t1))
        let t2 = _type.concat('<')
        res = Utilities.concat(res, this.getRelations(t2))
        let t3 = _type.concat('-')
        res = Utilities.concat(res, this.getRelations(t3))
      }
      if (typeof this.relations[_type] !== "undefined")
        res = this.relations[_type];
    }
    return res;
  }

  inNodeList(_nodelist) {
    for (let index = 0; index < _nodelist.length; index++) {
      const element = _nodelist[index];
      if (element.id.get() === this.id.get()) return true;
    }
    return false;
  }


  getNeighbors(_type) {
    let neighbors = [];
    let relations = this.getRelations(_type);
    for (let index = 0; index < relations.length; index++) {
      const relation = relations[index];
      if (relation.isDirected.get()) {
        if (this.inNodeList(relation.nodeList1))
          neighbors = Utilities.concat(neighbors, relation.nodeList2);
        else neighbors = Utilities.concat(neighbors, relation.nodeList1);
      } else {
        neighbors = Utilities.concat(neighbors, Utilities.allButMeById(
          relation.nodeList1));
        neighbors = Utilities.concat(neighbors, Utilities.allButMeById(
          relation.nodeList2));
      }
    }
    return neighbors;
  }

  removeRelation(_relation) {
    let relationLst = this.relations[_relation.type.get()];
    for (let index = 0; index < relationLst.length; index++) {
      const candidateRelation = relationLst[index];
      if (_relation.id.get() === candidateRelation.id.get())
        relationLst.splice(index, 1);
    }
  }

  removeRelations(_relations) {
    for (let index = 0; index < _relations.length; index++) {
      this.removeRelation(_relations[index]);
    }
  }

  removeRelationType(_type) {
    if (Array.isArray(_type) || _type instanceof Lst)
      for (let index = 0; index < _type.length; index++) {
        const type = _type[index];
        this.relations.rem_attr(type);
      }
    else {
      this.relations.rem_attr(_type);
    }
  }

  toJson() {
    return {
      id: this.id.get(),
      name: this.name.get(),
      element: null,
    }
  }

  toJsonWithRelations() {
    let relations = []
    for (let index = 0; index < this.getRelations().length; index++) {
      const relation = this.getRelations()[index];
      relations.push(relation.toJson())
    }
    return {
      id: this.id.get(),
      name: this.name.get(),
      element: null,
      relations: relations
    }
  }

  async toIfc() {
    let element = await Utilities.promiseLoad(this.element);
    return element.toIfc()
  }
}

spinalCore.register_models([SpinalNode]);