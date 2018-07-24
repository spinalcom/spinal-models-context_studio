"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _SpinalRelation = require("./SpinalRelation");

var _SpinalRelation2 = _interopRequireDefault(_SpinalRelation);

var _Utilities = require("./Utilities");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const spinalCore = require("spinal-core-connectorjs");
const globalType = typeof window === "undefined" ? global : window;

let getViewer = function () {
  return globalType.v;
};

/**
 *
 *
 * @export
 * @class SpinalNode
 * @extends {Model}
 */
class SpinalNode extends globalType.Model {
  /**
   *Creates an instance of SpinalNode.
   * @param {string} name
   * @param {Model} element - any subclass of Model
   * @param {SpinalGraph} relatedGraph
   * @param {SpinalRelation[]} relations
   * @param {string} [name="SpinalNode"]
   * @memberof SpinalNode
   */
  constructor(_name, element, relatedGraph, relations, name = "SpinalNode") {
    super();
    if (FileSystem._sig_server) {
      this.add_attr({
        name: _name,
        element: new Ptr(element),
        relations: new Model(),
        apps: new Model(),
        relatedGraph: relatedGraph
      });
      if (typeof this.relatedGraph !== "undefined") {
        this.relatedGraph.classifyNode(this);
      }
      if (typeof _relations !== "undefined") {
        if (Array.isArray(_relations) || _relations instanceof Lst) this.addRelations(_relations);else this.addRelation(_relations);
      }
    }
  }

  // registerApp(app) {
  //   this.apps.add_attr({
  //     [app.name.get()]: new Ptr(app)
  //   })
  // }
  /**
   *
   *
   * @returns all applications names as string
   * @memberof SpinalNode
   */
  getAppsNames() {
    return this.apps._attribute_names;
  }
  /**
   *
   *
   * @returns A promise of the related Element 
   * @memberof SpinalNode
   */
  async getElement() {
    return await _Utilities.Utilities.promiseLoad(this.element);
  }
  /**
   *
   *
   * @returns all applications
   * @memberof SpinalNode
   */
  async getApps() {
    let res = [];
    for (let index = 0; index < this.apps._attribute_names.length; index++) {
      const appName = this.apps._attribute_names[index];
      res.push((await _Utilities.Utilities.promiseLoad(this.relatedGraph.appsList[appName])));
    }
    return res;
  }
  // /**
  //  *
  //  *
  //  * @param {*} relationType
  //  * @param {*} relation
  //  * @param {*} asParent
  //  * @memberof SpinalNode
  //  */
  // changeDefaultRelation(relationType, relation, asParent) {
  //     if (relation.isDirected.get()) {
  //       if (asParent) {
  //         Utilities.putOnTopLst(this.relations[relationType + ">"], relation);
  //       } else {
  //         Utilities.putOnTopLst(this.relations[relationType + "<"], relation);
  //       }
  //     } else {
  //       Utilities.putOnTopLst(this.relations[relationType + "-"], relation);
  //     }
  //   }
  /**
   *
   *
   * @returns boolean
   * @memberof SpinalNode
   */
  hasRelation() {
    return this.relations.length !== 0;
  }
  /**
   *
   *
   * @param {SpinalRelation} relation
   * @param {string} appName
   * @memberof SpinalNode
   */
  addDirectedRelationParent(relation, appName) {
    let name = relation.type.get();
    name = name.concat(">");
    if (typeof appName === "undefined") this.addRelation(relation, name);else this.addRelationByApp(relation, name, appName);
  }
  /**
   *
   *
   * @param {SpinalRelation} relation
   * @param {string} appName
   * @memberof SpinalNode
   */
  addDirectedRelationChild(relation, appName) {
    let name = relation.type.get();
    name = name.concat("<");
    if (typeof appName === "undefined") this.addRelation(relation, name);else this.addRelationByApp(relation, name, appName);
  }
  /**
   *
   *
   * @param {SpinalRelation} relation
   * @param {string} appName
   * @memberof SpinalNode
   */
  addNonDirectedRelation(relation, appName) {
    let name = relation.type.get();
    name = name.concat("-");
    if (typeof appName === "undefined") this.addRelation(relation, name);else this.addRelationByApp(relation, name, appName);
  }
  /**
   *
   *
   * @param {SpinalRelation} relation
   * @param {string} name
   * @memberof SpinalNode
   */
  addRelation(relation, name) {
    if (!this.relatedGraph.isReserved(relation.type.get())) {
      let nameTmp = relation.type.get();
      if (typeof name !== "undefined") {
        nameTmp = name;
      }
      if (typeof this.relations[nameTmp] !== "undefined") this.relations[nameTmp].push(relation);else {
        let list = new Lst();
        list.push(relation);
        this.relations.add_attr({
          [nameTmp]: list
        });
      }
    } else {
      console.log(relation.type.get() + " is reserved by " + this.relatedGraph.reservedRelationsNames[relation.type.get()]);
    }
  }
  /**
   *
   *
   * @param {SpinalRelation} relation
   * @param {string} name -relation Name if not orginally defined
   * @param {string} appName
   * @memberof SpinalNode
   */
  addRelationByApp(relation, name, appName) {
    if (this.relatedGraph.hasReservationCredentials(relation.type.get(), appName)) {
      if (this.relatedGraph.containsApp(appName)) {
        let nameTmp = relation.type.get();
        if (typeof name !== "undefined") {
          nameTmp = name;
        }
        if (typeof this.relations[nameTmp] !== "undefined") this.relations[nameTmp].push(relation);else {
          let list = new Lst();
          list.push(relation);
          this.relations.add_attr({
            [nameTmp]: list
          });
        }
        if (typeof this.apps[appName] !== "undefined") this.apps[appName].add_attr({
          [nameTmp]: relation
        });else {
          let list = new Model();
          list.add_attr({
            [nameTmp]: relation
          });
          this.apps.add_attr({
            [appName]: list
          });
        }
      } else {
        console.error(appName + " does not exist");
      }
    } else {
      console.log(relation.type.get() + " is reserved by " + this.relatedGraph.reservedRelationsNames[relation.type.get()]);
    }
  }
  /**
   *
   *
   * @param {string} relationType
   * @param {Model} element - and subclass of Model
   * @param {boolean} [isDirected=false]
   * @returns the created relation, undefined otherwise
   * @memberof SpinalNode
   */
  addSimpleRelation(relationType, element, isDirected = false) {
    if (!this.relatedGraph.isReserved(relationType)) {
      let res = {};
      let node2 = this.relatedGraph.addNode(element);
      res.node = node2;
      let rel = new _SpinalRelation2.default(relationType, [this], [node2], isDirected);
      res.relation = rel;
      this.relatedGraph.addRelation(rel);
      return res;
    } else {
      console.log(relationType + " is reserved by " + this.relatedGraph.reservedRelationsNames[relationType]);
    }
  }
  /**
   *
   *
   * @param {string} appName
   * @param {string} relationType
   * @param {Model} element
   * @param {boolean} [isDirected=false]
   * @returns the created relation
   * @memberof SpinalNode
   */
  addSimpleRelationByApp(appName, relationType, element, isDirected = false) {
    if (this.relatedGraph.hasReservationCredentials(relationType, appName)) {
      if (this.relatedGraph.containsApp(appName)) {
        let res = {};
        let node2 = this.relatedGraph.addNode(element);
        res.node = node2;
        let rel = new _SpinalRelation2.default(relationType, [this], [node2], isDirected);
        res.relation = rel;
        this.relatedGraph.addRelation(rel, appName);
        return res;
      } else {
        console.error(appName + " does not exist");
      }
    } else {
      console.log(relationType + " is reserved by " + this.relatedGraph.reservedRelationsNames[relationType]);
    }
  }
  /**
   *
   *
   * @param {string} relationType
   * @param {Model} element - any subclass of Model
   * @param {boolean} [isDirected=false]
   * @param {boolean} [asParent=false]
   * @returns an Object of 1)relation:the relation with the added element node in (nodeList2), 2)node: the created node
   * @memberof SpinalNode
   */
  addToExistingRelation(relationType, element, isDirected = false, asParent = false) {
    let res = {};
    if (!this.relatedGraph.isReserved(relationType)) {
      let existingRelations = this.getRelations();
      for (let index = 0; index < existingRelations.length; index++) {
        const relation = existingRelations[index];
        res.relation = relation;
        if (relationType === relationType && isDirected === relation.isDirected.get()) {
          node2 = this.relatedGraph.addNode(element);
          res.node = node2;
          if (isDirected) {
            if (asParent) {
              relation.addNodetoNodeList1(node2);
              node2.addDirectedRelationParent(relation);
              return res;
            } else {
              relation.addNodetoNodeList2(node2);
              node2.addDirectedRelationChild(relation);
              return res;
            }
          } else {
            relation.addNodetoNodeList2(node2);
            node2.addNonDirectedRelation(relation);
            return res;
          }
        }
      }
      return this.addSimpleRelation(relationType, element, isDirected);
    } else {
      console.log(relationType + " is reserved by " + this.relatedGraph.reservedRelationsNames[relationType]);
    }
  }
  /**
   *
   *
   * @param {string} appName
   * @param {string} relationType
   * @param {Model} element - any subclass of Model
   * @param {boolean} [isDirected=false]
   * @param {boolean} [asParent=false]
   * @returns an Object of 1)relation:the relation with the added element node in (nodeList2), 2)node: the created node
   * @memberof SpinalNode
   */
  addToExistingRelationByApp(appName, relationType, element, isDirected = false, asParent = false) {
    let res = {};
    let node2 = null;
    if (this.relatedGraph.hasReservationCredentials(relationType, appName)) {
      if (this.relatedGraph.containsApp(appName)) {
        if (typeof this.apps[appName] !== "undefined") {
          let appRelations = this.getRelationsByAppName(appName);
          for (let index = 0; index < appRelations.length; index++) {
            const relation = appRelations[index];
            res.relation = relation;
            if (relation.type.get() === relationType && isDirected === relation.isDirected.get()) {
              node2 = this.relatedGraph.addNode(element);
              res.node = node2;
              if (isDirected) {
                if (asParent) {
                  relation.addNodetoNodeList1(node2);
                  node2.addDirectedRelationParent(relation, appName);
                  return res;
                } else {
                  relation.addNodetoNodeList2(node2);
                  node2.addDirectedRelationChild(relation, appName);
                  return res;
                }
              } else {
                relation.addNodetoNodeList2(node2);
                node2.addNonDirectedRelation(relation, appName);
                return res;
              }
            }
          }
        }
        return this.addSimpleRelationByApp(appName, relationType, element, isDirected);
      } else {
        console.error(appName + " does not exist");
      }
      console.log(relationType + " is reserved by " + this.relatedGraph.reservedRelationsNames[relationType]);
    }
  }

  // addRelation2(_relation, _name) {
  //   let classify = false;
  //   let name = _relation.type.get();
  //   if (typeof _name !== "undefined") {
  //     name = _name;
  //   }
  //   if (typeof this.relations[_relation.type.get()] !== "undefined") {
  //     if (_relation.isDirected.get()) {
  //       for (
  //         let index = 0; index < this.relations[_relation.type.get()].length; index++
  //       ) {
  //         const element = this.relations[_relation.type.get()][index];
  //         if (
  //           Utilities.arraysEqual(
  //             _relation.getNodeList1Ids(),
  //             element.getNodeList1Ids()
  //           )
  //         ) {
  //           element.addNotExistingVerticestoNodeList2(_relation.nodeList2);
  //         } else {
  //           element.push(_relation);
  //           classify = true;
  //         }
  //       }
  //     } else {
  //       this.relations[_relation.type.get()].addNotExistingVerticestoRelation(
  //         _relation
  //       );
  //     }
  //   } else {
  //     if (_relation.isDirected.get()) {
  //       let list = new Lst();
  //       list.push(_relation);
  //       this.relations.add_attr({
  //         [name]: list
  //       });
  //       this._classifyRelation(_relation);
  //     } else {
  //       this.relations.add_attr({
  //         [name]: _relation
  //       });
  //       classify = true;
  //     }
  //   }
  //   if (classify) this._classifyRelation(_relation);
  // }

  /**
   *
   *
   * @param {SpinalRelation} _relation
   * @memberof SpinalNode
   */
  _classifyRelation(_relation) {
    this.relatedGraph.load(relatedGraph => {
      relatedGraph._classifyRelation(_relation);
    });
  }

  //TODO :NotWorking
  // addRelation(_relation) {
  //   this.addRelation(_relation)
  //   this.relatedGraph.load(relatedGraph => {
  //     relatedGraph._addNotExistingVerticesFromRelation(_relation)
  //   })
  // }
  //TODO :NotWorking
  // addRelations(_relations) {
  //   for (let index = 0; index < _relations.length; index++) {
  //     this.addRelation(_relations[index]);
  //   }
  // }
  /**
   *
   *
   * @returns all the relations of this Node
   * @memberof SpinalNode
   */
  getRelations() {
    let res = [];
    for (let i = 0; i < this.relations._attribute_names.length; i++) {
      const relList = this.relations[this.relations._attribute_names[i]];
      for (let j = 0; j < relList.length; j++) {
        const relation = relList[j];
        res.push(relation);
      }
    }
    return res;
  }
  /**
   *
   *
   * @param {string} type
   * @returns all relations of a specific relation type
   * @memberof SpinalNode
   */
  getRelationsByType(type) {
    let res = [];
    if (!type.includes(">", type.length - 2) && !type.includes("<", type.length - 2) && !type.includes("-", type.length - 2)) {
      let t1 = type.concat(">");
      res = _Utilities.Utilities.concat(res, this.getRelations(t1));
      let t2 = type.concat("<");
      res = _Utilities.Utilities.concat(res, this.getRelations(t2));
      let t3 = type.concat("-");
      res = _Utilities.Utilities.concat(res, this.getRelations(t3));
    }
    if (typeof this.relations[type] !== "undefined") res = this.relations[type];
    return res;
  }
  /**
   *
   *
   * @param {string} appName
   * @returns all relations of a specific app
   * @memberof SpinalNode
   */
  getRelationsByAppName(appName) {
    let res = [];
    if (this.hasAppDefined(appName)) {
      for (let index = 0; index < this.apps[appName]._attribute_names.length; index++) {
        const appRelation = this.apps[appName][this.apps[appName]._attribute_names[index]];
        res.push(appRelation);
      }
    }
    return res;
  }
  /**
   *
   *
   * @param {SpinalApplication} app
   * @returns all relations of a specific app
   * @memberof SpinalNode
   */
  getRelationsByApp(app) {
    let appName = app.name.get();
    return this.getRelationsByAppName(appName);
  }
  /**
   *
   *
   * @param {string} appName
   * @param {string} relationType
   * @returns all relations of a specific app of a specific type
   * @memberof SpinalNode
   */
  getRelationsByAppNameByType(appName, relationType) {
    let res = [];
    if (this.hasRelationByAppByTypeDefined(appName, relationType)) {
      for (let index = 0; index < this.apps[appName]._attribute_names.length; index++) {
        const appRelation = this.apps[appName][this.apps[appName]._attribute_names[index]];
        if (appRelation.type.get() === relationType) res.push(appRelation);
      }
    }
    return res;
  }
  /**
   *
   *
   * @param {SpinalApplication} app
   * @param {string} relationType
   * @returns all relations of a specific app of a specific type
   * @memberof SpinalNode
   */
  getRelationsByAppByType(app, relationType) {
    let appName = app.name.get();
    return this.getRelationsByAppNameByType(appName, relationType);
  }
  /**
   *  verify if an element is already in given nodeList
   *
   * @param {SpinalNode[]} _nodelist
   * @returns boolean
   * @memberof SpinalNode
   */
  inNodeList(_nodelist) {
    for (let index = 0; index < _nodelist.length; index++) {
      const element = _nodelist[index];
      if (element.id.get() === this.id.get()) return true;
    }
    return false;
  }

  //TODO getChildren, getParent
  /**
   *
   *
   * @param {string} relationType - optional
   * @returns a list of neighbors nodes 
   * @memberof SpinalNode
   */
  getNeighbors(relationType) {
    let neighbors = [];
    let relations = this.getRelations(relationType);
    for (let index = 0; index < relations.length; index++) {
      const relation = relations[index];
      if (relation.isDirected.get()) {
        if (this.inNodeList(relation.nodeList1)) neighbors = _Utilities.Utilities.concat(neighbors, relation.nodeList2);else neighbors = _Utilities.Utilities.concat(neighbors, relation.nodeList1);
      } else {
        neighbors = _Utilities.Utilities.concat(neighbors, _Utilities.Utilities.allButMeById(relation.nodeList1));
        neighbors = _Utilities.Utilities.concat(neighbors, _Utilities.Utilities.allButMeById(relation.nodeList2));
      }
    }
    return neighbors;
  }

  /**
   *
   *
   * @param {string} relationType
   * @returns array of spinalNode
   * @memberof SpinalNode
   */
  getChildrenByRelationType(relationType) {
    let res = [];
    if (this.relations[relationType + ">"]) for (let index = 0; index < this.relations[relationType + ">"].length; index++) {
      const relation = this.relations[relationType + ">"][index];
      let nodeList2 = relation.getNodeList2();
      res = _Utilities.Utilities.concat(res, nodeList2);
    }
    return res;
  }

  //TODO
  // /**
  //  *
  //  *
  //  * @param {string|SpinalRelation} relation
  //  * @returns boolean
  //  * @memberof SpinalNode
  //  */
  // isParent(relation) {
  //   if (typeof relation === "string") {
  //     if (typeof this.relations[relation + ">"] != "undefined") {
  //       let relations = this.relations[relation + ">"]
  //       for (let index = 0; index < relations.length; index++) {
  //         const relation = relations[index];
  //         let nodeList1 = relation.getNodeList1()
  //         return Utilities.containsLstById(nodeList1, this)
  //       }
  //     }
  //   } else {
  //     let nodeList1 = relation.getNodeList1()
  //     return Utilities.containsLstById(nodeList1, this)
  //   }
  //   return false;
  // }

  //TODO
  // /**
  //  *
  //  *
  //  * @param {SpinalRelation} relation
  //  * @returns boolean
  //  * @memberof SpinalNode
  //  */
  // isChild(relation) {
  //   let nodeList2 = relation.getNodeList2()
  //   return Utilities.containsLstById(nodeList2, this)
  // }

  //TODO Optimize
  /**
   *
   *
   * @param {string | SpinalApplication} appName
   * @param {string | SpinalRelation} relationType
   * @returns array of spinalNode
   * @memberof SpinalNode
   */
  getChildrenByAppByRelation(app, relation) {
    let appName = "";
    let relationType = "";
    let res = [];
    if (typeof app != "string") appName = app.name.get();else appName = app;
    if (typeof app != "string") relationType = relation.name.get();else relationType = relation;
    if (typeof this.apps[appName] != "undefined" && typeof this.apps[appName][relationType + ">"] != "undefined") {
      let relationTmp = this.apps[appName][relationType + ">"];
      let nodeList2 = relationTmp.getNodeList2();
      res = _Utilities.Utilities.concat(res, nodeList2);
    }
    return res;
  }

  /**
   *
   *
   * @param {string | SpinalApplication} appName
   * @param {string | SpinalRelation} relationType
   * @returns  A promise of an array of Models
   * @memberof SpinalNode
   */
  async getChildrenElementsByAppByRelation(app, relation) {
    let appName = "";
    let relationType = "";
    let res = [];
    if (typeof app != "string") appName = app.name.get();else appName = app;
    if (typeof app != "string") relationType = relation.name.get();else relationType = relation;
    if (typeof this.apps[appName] != "undefined" && typeof this.apps[appName][relationType + ">"] != "undefined") {
      let relationTmp = this.apps[appName][relationType + ">"];
      let nodeList2 = relationTmp.getNodeList2();
      for (let index = 0; index < nodeList2.length; index++) {
        const node = nodeList2[index];
        res.push((await node.getElement()));
      }
    }
    return res;
  }

  /**
   *
   *
   * @param {string} relationType
   * @returns A promise of an array of Models
   * @memberof SpinalNode
   */
  async getChildrenElementsByRelationType(relationType) {
    let res = [];
    if (this.relations[relationType + ">"]) for (let index = 0; index < this.relations[relationType + ">"].length; index++) {
      const relation = this.relations[relationType + ">"][index];
      let nodeList2 = relation.getNodeList2();
      for (let index = 0; index < nodeList2.length; index++) {
        const node = nodeList2[index];
        res.push((await _Utilities.Utilities.promiseLoad(node.element)));
      }
    }
    return res;
  }

  /**
   *
   *
   * @param {string} relationType
   * @returns array of spinalNode
   * @memberof SpinalNode
   */
  getParentsByRelationType(relationType) {
    let res = [];
    if (this.relations[relationType + "<"]) for (let index = 0; index < this.relations[relationType + "<"].length; index++) {
      const relation = this.relations[relationType + "<"][index];
      let nodeList1 = relation.getNodeList1();
      res = _Utilities.Utilities.concat(res, nodeList1);
    }
    return res;
  }
  /**
   *
   *
   * @param {SpinalRelation} _relation
   * @memberof SpinalNode
   */
  removeRelation(_relation) {
    let relationLst = this.relations[_relation.type.get()];
    for (let index = 0; index < relationLst.length; index++) {
      const candidateRelation = relationLst[index];
      if (_relation.id.get() === candidateRelation.id.get()) relationLst.splice(index, 1);
    }
  }
  /**
   *
   *
   * @param {SpinalRelation[]} _relations
   * @memberof SpinalNode
   */
  removeRelations(_relations) {
    for (let index = 0; index < _relations.length; index++) {
      this.removeRelation(_relations[index]);
    }
  }
  /**
   *
   *
   * @param {string} relationType
   * @memberof SpinalNode
   */
  removeRelationType(relationType) {
    if (Array.isArray(relationType) || relationType instanceof Lst) for (let index = 0; index < relationType.length; index++) {
      const type = relationType[index];
      this.relations.rem_attr(type);
    } else {
      this.relations.rem_attr(relationType);
    }
  }
  /**
   *
   *
   * @param {string} appName
   * @returns boolean
   * @memberof SpinalNode
   */
  hasAppDefined(appName) {
    if (typeof this.apps[appName] !== "undefined") return true;else {
      console.warn("app " + appName + " is not defined for node " + this.name.get());
      return false;
    }
  }
  /**
   *
   *
   * @param {string} appName
   * @param {string} relationType
   * @returns boolean 
   * @memberof SpinalNode
   */
  hasRelationByAppByTypeDefined(appName, relationType) {
    if (this.hasAppDefined(appName) && typeof this.apps[appName][relationType] !== "undefined") return true;else {
      console.warn("relation " + relationType + " is not defined for node " + this.name.get() + " for application " + appName);
      return false;
    }
  }
  /**
   *
   *
   * @returns A json representing the node
   * @memberof SpinalNode
   */
  toJson() {
    return {
      id: this.id.get(),
      name: this.name.get(),
      element: null
    };
  }
  /**
   *
   *
   * @returns A json representing the node with its relations
   * @memberof SpinalNode
   */
  toJsonWithRelations() {
    let relations = [];
    for (let index = 0; index < this.getRelations().length; index++) {
      const relation = this.getRelations()[index];
      relations.push(relation.toJson());
    }
    return {
      id: this.id.get(),
      name: this.name.get(),
      element: null,
      relations: relations
    };
  }
  /**
   *
   *
   * @returns An IFC like format representing the node
   * @memberof SpinalNode
   */
  async toIfc() {
    let element = await _Utilities.Utilities.promiseLoad(this.element);
    return element.toIfc();
  }
}
exports.default = SpinalNode;

spinalCore.register_models([SpinalNode]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TcGluYWxOb2RlLmpzIl0sIm5hbWVzIjpbInNwaW5hbENvcmUiLCJyZXF1aXJlIiwiZ2xvYmFsVHlwZSIsIndpbmRvdyIsImdsb2JhbCIsImdldFZpZXdlciIsInYiLCJTcGluYWxOb2RlIiwiTW9kZWwiLCJjb25zdHJ1Y3RvciIsIl9uYW1lIiwiZWxlbWVudCIsInJlbGF0ZWRHcmFwaCIsInJlbGF0aW9ucyIsIm5hbWUiLCJGaWxlU3lzdGVtIiwiX3NpZ19zZXJ2ZXIiLCJhZGRfYXR0ciIsIlB0ciIsImFwcHMiLCJjbGFzc2lmeU5vZGUiLCJfcmVsYXRpb25zIiwiQXJyYXkiLCJpc0FycmF5IiwiTHN0IiwiYWRkUmVsYXRpb25zIiwiYWRkUmVsYXRpb24iLCJnZXRBcHBzTmFtZXMiLCJfYXR0cmlidXRlX25hbWVzIiwiZ2V0RWxlbWVudCIsIlV0aWxpdGllcyIsInByb21pc2VMb2FkIiwiZ2V0QXBwcyIsInJlcyIsImluZGV4IiwibGVuZ3RoIiwiYXBwTmFtZSIsInB1c2giLCJhcHBzTGlzdCIsImhhc1JlbGF0aW9uIiwiYWRkRGlyZWN0ZWRSZWxhdGlvblBhcmVudCIsInJlbGF0aW9uIiwidHlwZSIsImdldCIsImNvbmNhdCIsImFkZFJlbGF0aW9uQnlBcHAiLCJhZGREaXJlY3RlZFJlbGF0aW9uQ2hpbGQiLCJhZGROb25EaXJlY3RlZFJlbGF0aW9uIiwiaXNSZXNlcnZlZCIsIm5hbWVUbXAiLCJsaXN0IiwiY29uc29sZSIsImxvZyIsInJlc2VydmVkUmVsYXRpb25zTmFtZXMiLCJoYXNSZXNlcnZhdGlvbkNyZWRlbnRpYWxzIiwiY29udGFpbnNBcHAiLCJlcnJvciIsImFkZFNpbXBsZVJlbGF0aW9uIiwicmVsYXRpb25UeXBlIiwiaXNEaXJlY3RlZCIsIm5vZGUyIiwiYWRkTm9kZSIsIm5vZGUiLCJyZWwiLCJTcGluYWxSZWxhdGlvbiIsImFkZFNpbXBsZVJlbGF0aW9uQnlBcHAiLCJhZGRUb0V4aXN0aW5nUmVsYXRpb24iLCJhc1BhcmVudCIsImV4aXN0aW5nUmVsYXRpb25zIiwiZ2V0UmVsYXRpb25zIiwiYWRkTm9kZXRvTm9kZUxpc3QxIiwiYWRkTm9kZXRvTm9kZUxpc3QyIiwiYWRkVG9FeGlzdGluZ1JlbGF0aW9uQnlBcHAiLCJhcHBSZWxhdGlvbnMiLCJnZXRSZWxhdGlvbnNCeUFwcE5hbWUiLCJfY2xhc3NpZnlSZWxhdGlvbiIsIl9yZWxhdGlvbiIsImxvYWQiLCJpIiwicmVsTGlzdCIsImoiLCJnZXRSZWxhdGlvbnNCeVR5cGUiLCJpbmNsdWRlcyIsInQxIiwidDIiLCJ0MyIsImhhc0FwcERlZmluZWQiLCJhcHBSZWxhdGlvbiIsImdldFJlbGF0aW9uc0J5QXBwIiwiYXBwIiwiZ2V0UmVsYXRpb25zQnlBcHBOYW1lQnlUeXBlIiwiaGFzUmVsYXRpb25CeUFwcEJ5VHlwZURlZmluZWQiLCJnZXRSZWxhdGlvbnNCeUFwcEJ5VHlwZSIsImluTm9kZUxpc3QiLCJfbm9kZWxpc3QiLCJpZCIsImdldE5laWdoYm9ycyIsIm5laWdoYm9ycyIsIm5vZGVMaXN0MSIsIm5vZGVMaXN0MiIsImFsbEJ1dE1lQnlJZCIsImdldENoaWxkcmVuQnlSZWxhdGlvblR5cGUiLCJnZXROb2RlTGlzdDIiLCJnZXRDaGlsZHJlbkJ5QXBwQnlSZWxhdGlvbiIsInJlbGF0aW9uVG1wIiwiZ2V0Q2hpbGRyZW5FbGVtZW50c0J5QXBwQnlSZWxhdGlvbiIsImdldENoaWxkcmVuRWxlbWVudHNCeVJlbGF0aW9uVHlwZSIsImdldFBhcmVudHNCeVJlbGF0aW9uVHlwZSIsImdldE5vZGVMaXN0MSIsInJlbW92ZVJlbGF0aW9uIiwicmVsYXRpb25Mc3QiLCJjYW5kaWRhdGVSZWxhdGlvbiIsInNwbGljZSIsInJlbW92ZVJlbGF0aW9ucyIsInJlbW92ZVJlbGF0aW9uVHlwZSIsInJlbV9hdHRyIiwid2FybiIsInRvSnNvbiIsInRvSnNvbldpdGhSZWxhdGlvbnMiLCJ0b0lmYyIsInJlZ2lzdGVyX21vZGVscyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBRUE7Ozs7QUFLQTs7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YztBQUNaLFFBQUk1RyxVQUFVLE1BQU1tQixxQkFBVUMsV0FBVixDQUFzQixLQUFLcEIsT0FBM0IsQ0FBcEI7QUFDQSxXQUFPQSxRQUFRNEcsS0FBUixFQUFQO0FBQ0Q7QUE5M0J1QztrQkFnNEIzQmhILFU7O0FBQ2ZQLFdBQVd3SCxlQUFYLENBQTJCLENBQUNqSCxVQUFELENBQTNCIiwiZmlsZSI6IlNwaW5hbE5vZGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBzcGluYWxDb3JlID0gcmVxdWlyZShcInNwaW5hbC1jb3JlLWNvbm5lY3RvcmpzXCIpO1xuY29uc3QgZ2xvYmFsVHlwZSA9IHR5cGVvZiB3aW5kb3cgPT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB3aW5kb3c7XG5pbXBvcnQgU3BpbmFsUmVsYXRpb24gZnJvbSBcIi4vU3BpbmFsUmVsYXRpb25cIjtcbmxldCBnZXRWaWV3ZXIgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGdsb2JhbFR5cGUudjtcbn07XG5cbmltcG9ydCB7XG4gIFV0aWxpdGllc1xufSBmcm9tIFwiLi9VdGlsaXRpZXNcIjtcbi8qKlxuICpcbiAqXG4gKiBAZXhwb3J0XG4gKiBAY2xhc3MgU3BpbmFsTm9kZVxuICogQGV4dGVuZHMge01vZGVsfVxuICovXG5jbGFzcyBTcGluYWxOb2RlIGV4dGVuZHMgZ2xvYmFsVHlwZS5Nb2RlbCB7XG4gIC8qKlxuICAgKkNyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgU3BpbmFsTm9kZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHBhcmFtIHtNb2RlbH0gZWxlbWVudCAtIGFueSBzdWJjbGFzcyBvZiBNb2RlbFxuICAgKiBAcGFyYW0ge1NwaW5hbEdyYXBofSByZWxhdGVkR3JhcGhcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbltdfSByZWxhdGlvbnNcbiAgICogQHBhcmFtIHtzdHJpbmd9IFtuYW1lPVwiU3BpbmFsTm9kZVwiXVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgY29uc3RydWN0b3IoX25hbWUsIGVsZW1lbnQsIHJlbGF0ZWRHcmFwaCwgcmVsYXRpb25zLCBuYW1lID0gXCJTcGluYWxOb2RlXCIpIHtcbiAgICBzdXBlcigpO1xuICAgIGlmIChGaWxlU3lzdGVtLl9zaWdfc2VydmVyKSB7XG4gICAgICB0aGlzLmFkZF9hdHRyKHtcbiAgICAgICAgbmFtZTogX25hbWUsXG4gICAgICAgIGVsZW1lbnQ6IG5ldyBQdHIoZWxlbWVudCksXG4gICAgICAgIHJlbGF0aW9uczogbmV3IE1vZGVsKCksXG4gICAgICAgIGFwcHM6IG5ldyBNb2RlbCgpLFxuICAgICAgICByZWxhdGVkR3JhcGg6IHJlbGF0ZWRHcmFwaFxuICAgICAgfSk7XG4gICAgICBpZiAodHlwZW9mIHRoaXMucmVsYXRlZEdyYXBoICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHRoaXMucmVsYXRlZEdyYXBoLmNsYXNzaWZ5Tm9kZSh0aGlzKTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgX3JlbGF0aW9ucyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShfcmVsYXRpb25zKSB8fCBfcmVsYXRpb25zIGluc3RhbmNlb2YgTHN0KVxuICAgICAgICAgIHRoaXMuYWRkUmVsYXRpb25zKF9yZWxhdGlvbnMpO1xuICAgICAgICBlbHNlIHRoaXMuYWRkUmVsYXRpb24oX3JlbGF0aW9ucyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gcmVnaXN0ZXJBcHAoYXBwKSB7XG4gIC8vICAgdGhpcy5hcHBzLmFkZF9hdHRyKHtcbiAgLy8gICAgIFthcHAubmFtZS5nZXQoKV06IG5ldyBQdHIoYXBwKVxuICAvLyAgIH0pXG4gIC8vIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEByZXR1cm5zIGFsbCBhcHBsaWNhdGlvbnMgbmFtZXMgYXMgc3RyaW5nXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBnZXRBcHBzTmFtZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuYXBwcy5fYXR0cmlidXRlX25hbWVzO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyBBIHByb21pc2Ugb2YgdGhlIHJlbGF0ZWQgRWxlbWVudCBcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGFzeW5jIGdldEVsZW1lbnQoKSB7XG4gICAgcmV0dXJuIGF3YWl0IFV0aWxpdGllcy5wcm9taXNlTG9hZCh0aGlzLmVsZW1lbnQpXG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEByZXR1cm5zIGFsbCBhcHBsaWNhdGlvbnNcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGFzeW5jIGdldEFwcHMoKSB7XG4gICAgbGV0IHJlcyA9IFtdXG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMuYXBwcy5fYXR0cmlidXRlX25hbWVzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgYXBwTmFtZSA9IHRoaXMuYXBwcy5fYXR0cmlidXRlX25hbWVzW2luZGV4XTtcbiAgICAgIHJlcy5wdXNoKGF3YWl0IFV0aWxpdGllcy5wcm9taXNlTG9hZCh0aGlzLnJlbGF0ZWRHcmFwaC5hcHBzTGlzdFtcbiAgICAgICAgYXBwTmFtZV0pKVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIC8vIC8qKlxuICAvLyAgKlxuICAvLyAgKlxuICAvLyAgKiBAcGFyYW0geyp9IHJlbGF0aW9uVHlwZVxuICAvLyAgKiBAcGFyYW0geyp9IHJlbGF0aW9uXG4gIC8vICAqIEBwYXJhbSB7Kn0gYXNQYXJlbnRcbiAgLy8gICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgLy8gICovXG4gIC8vIGNoYW5nZURlZmF1bHRSZWxhdGlvbihyZWxhdGlvblR5cGUsIHJlbGF0aW9uLCBhc1BhcmVudCkge1xuICAvLyAgICAgaWYgKHJlbGF0aW9uLmlzRGlyZWN0ZWQuZ2V0KCkpIHtcbiAgLy8gICAgICAgaWYgKGFzUGFyZW50KSB7XG4gIC8vICAgICAgICAgVXRpbGl0aWVzLnB1dE9uVG9wTHN0KHRoaXMucmVsYXRpb25zW3JlbGF0aW9uVHlwZSArIFwiPlwiXSwgcmVsYXRpb24pO1xuICAvLyAgICAgICB9IGVsc2Uge1xuICAvLyAgICAgICAgIFV0aWxpdGllcy5wdXRPblRvcExzdCh0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIjxcIl0sIHJlbGF0aW9uKTtcbiAgLy8gICAgICAgfVxuICAvLyAgICAgfSBlbHNlIHtcbiAgLy8gICAgICAgVXRpbGl0aWVzLnB1dE9uVG9wTHN0KHRoaXMucmVsYXRpb25zW3JlbGF0aW9uVHlwZSArIFwiLVwiXSwgcmVsYXRpb24pO1xuICAvLyAgICAgfVxuICAvLyAgIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGhhc1JlbGF0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnJlbGF0aW9ucy5sZW5ndGggIT09IDA7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb259IHJlbGF0aW9uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhZGREaXJlY3RlZFJlbGF0aW9uUGFyZW50KHJlbGF0aW9uLCBhcHBOYW1lKSB7XG4gICAgbGV0IG5hbWUgPSByZWxhdGlvbi50eXBlLmdldCgpO1xuICAgIG5hbWUgPSBuYW1lLmNvbmNhdChcIj5cIik7XG4gICAgaWYgKHR5cGVvZiBhcHBOYW1lID09PSBcInVuZGVmaW5lZFwiKSB0aGlzLmFkZFJlbGF0aW9uKHJlbGF0aW9uLCBuYW1lKTtcbiAgICBlbHNlIHRoaXMuYWRkUmVsYXRpb25CeUFwcChyZWxhdGlvbiwgbmFtZSwgYXBwTmFtZSk7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb259IHJlbGF0aW9uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhZGREaXJlY3RlZFJlbGF0aW9uQ2hpbGQocmVsYXRpb24sIGFwcE5hbWUpIHtcbiAgICBsZXQgbmFtZSA9IHJlbGF0aW9uLnR5cGUuZ2V0KCk7XG4gICAgbmFtZSA9IG5hbWUuY29uY2F0KFwiPFwiKTtcbiAgICBpZiAodHlwZW9mIGFwcE5hbWUgPT09IFwidW5kZWZpbmVkXCIpIHRoaXMuYWRkUmVsYXRpb24ocmVsYXRpb24sIG5hbWUpO1xuICAgIGVsc2UgdGhpcy5hZGRSZWxhdGlvbkJ5QXBwKHJlbGF0aW9uLCBuYW1lLCBhcHBOYW1lKTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbn0gcmVsYXRpb25cbiAgICogQHBhcmFtIHtzdHJpbmd9IGFwcE5hbWVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGFkZE5vbkRpcmVjdGVkUmVsYXRpb24ocmVsYXRpb24sIGFwcE5hbWUpIHtcbiAgICBsZXQgbmFtZSA9IHJlbGF0aW9uLnR5cGUuZ2V0KCk7XG4gICAgbmFtZSA9IG5hbWUuY29uY2F0KFwiLVwiKTtcbiAgICBpZiAodHlwZW9mIGFwcE5hbWUgPT09IFwidW5kZWZpbmVkXCIpIHRoaXMuYWRkUmVsYXRpb24ocmVsYXRpb24sIG5hbWUpO1xuICAgIGVsc2UgdGhpcy5hZGRSZWxhdGlvbkJ5QXBwKHJlbGF0aW9uLCBuYW1lLCBhcHBOYW1lKTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbn0gcmVsYXRpb25cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGFkZFJlbGF0aW9uKHJlbGF0aW9uLCBuYW1lKSB7XG4gICAgaWYgKCF0aGlzLnJlbGF0ZWRHcmFwaC5pc1Jlc2VydmVkKHJlbGF0aW9uLnR5cGUuZ2V0KCkpKSB7XG4gICAgICBsZXQgbmFtZVRtcCA9IHJlbGF0aW9uLnR5cGUuZ2V0KCk7XG4gICAgICBpZiAodHlwZW9mIG5hbWUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgbmFtZVRtcCA9IG5hbWU7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHRoaXMucmVsYXRpb25zW25hbWVUbXBdICE9PSBcInVuZGVmaW5lZFwiKVxuICAgICAgICB0aGlzLnJlbGF0aW9uc1tuYW1lVG1wXS5wdXNoKHJlbGF0aW9uKTtcbiAgICAgIGVsc2Uge1xuICAgICAgICBsZXQgbGlzdCA9IG5ldyBMc3QoKTtcbiAgICAgICAgbGlzdC5wdXNoKHJlbGF0aW9uKTtcbiAgICAgICAgdGhpcy5yZWxhdGlvbnMuYWRkX2F0dHIoe1xuICAgICAgICAgIFtuYW1lVG1wXTogbGlzdFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIHJlbGF0aW9uLnR5cGUuZ2V0KCkgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVsYXRlZEdyYXBoLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb24udHlwZS5nZXQoKV1cbiAgICAgICk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9ufSByZWxhdGlvblxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtcmVsYXRpb24gTmFtZSBpZiBub3Qgb3JnaW5hbGx5IGRlZmluZWRcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFwcE5hbWVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGFkZFJlbGF0aW9uQnlBcHAocmVsYXRpb24sIG5hbWUsIGFwcE5hbWUpIHtcbiAgICBpZiAodGhpcy5yZWxhdGVkR3JhcGguaGFzUmVzZXJ2YXRpb25DcmVkZW50aWFscyhyZWxhdGlvbi50eXBlLmdldCgpLFxuICAgICAgICBhcHBOYW1lKSkge1xuICAgICAgaWYgKHRoaXMucmVsYXRlZEdyYXBoLmNvbnRhaW5zQXBwKGFwcE5hbWUpKSB7XG4gICAgICAgIGxldCBuYW1lVG1wID0gcmVsYXRpb24udHlwZS5nZXQoKTtcbiAgICAgICAgaWYgKHR5cGVvZiBuYW1lICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgbmFtZVRtcCA9IG5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0aW9uc1tuYW1lVG1wXSAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgICAgICB0aGlzLnJlbGF0aW9uc1tuYW1lVG1wXS5wdXNoKHJlbGF0aW9uKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgbGV0IGxpc3QgPSBuZXcgTHN0KCk7XG4gICAgICAgICAgbGlzdC5wdXNoKHJlbGF0aW9uKTtcbiAgICAgICAgICB0aGlzLnJlbGF0aW9ucy5hZGRfYXR0cih7XG4gICAgICAgICAgICBbbmFtZVRtcF06IGxpc3RcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHRoaXMuYXBwc1thcHBOYW1lXSAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgICAgICB0aGlzLmFwcHNbYXBwTmFtZV0uYWRkX2F0dHIoe1xuICAgICAgICAgICAgW25hbWVUbXBdOiByZWxhdGlvblxuICAgICAgICAgIH0pO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBsZXQgbGlzdCA9IG5ldyBNb2RlbCgpO1xuICAgICAgICAgIGxpc3QuYWRkX2F0dHIoe1xuICAgICAgICAgICAgW25hbWVUbXBdOiByZWxhdGlvblxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMuYXBwcy5hZGRfYXR0cih7XG4gICAgICAgICAgICBbYXBwTmFtZV06IGxpc3RcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihhcHBOYW1lICsgXCIgZG9lcyBub3QgZXhpc3RcIik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICByZWxhdGlvbi50eXBlLmdldCgpICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uLnR5cGUuZ2V0KCldXG4gICAgICApO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcGFyYW0ge01vZGVsfSBlbGVtZW50IC0gYW5kIHN1YmNsYXNzIG9mIE1vZGVsXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGlyZWN0ZWQ9ZmFsc2VdXG4gICAqIEByZXR1cm5zIHRoZSBjcmVhdGVkIHJlbGF0aW9uLCB1bmRlZmluZWQgb3RoZXJ3aXNlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhZGRTaW1wbGVSZWxhdGlvbihyZWxhdGlvblR5cGUsIGVsZW1lbnQsIGlzRGlyZWN0ZWQgPSBmYWxzZSkge1xuICAgIGlmICghdGhpcy5yZWxhdGVkR3JhcGguaXNSZXNlcnZlZChyZWxhdGlvblR5cGUpKSB7XG4gICAgICBsZXQgcmVzID0ge31cbiAgICAgIGxldCBub2RlMiA9IHRoaXMucmVsYXRlZEdyYXBoLmFkZE5vZGUoZWxlbWVudCk7XG4gICAgICByZXMubm9kZSA9IG5vZGUyXG4gICAgICBsZXQgcmVsID0gbmV3IFNwaW5hbFJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgW3RoaXNdLCBbbm9kZTJdLFxuICAgICAgICBpc0RpcmVjdGVkKTtcbiAgICAgIHJlcy5yZWxhdGlvbiA9IHJlbFxuICAgICAgdGhpcy5yZWxhdGVkR3JhcGguYWRkUmVsYXRpb24ocmVsKTtcbiAgICAgIHJldHVybiByZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICByZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVsYXRlZEdyYXBoLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHBhcmFtIHtNb2RlbH0gZWxlbWVudFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0RpcmVjdGVkPWZhbHNlXVxuICAgKiBAcmV0dXJucyB0aGUgY3JlYXRlZCByZWxhdGlvblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYWRkU2ltcGxlUmVsYXRpb25CeUFwcChhcHBOYW1lLCByZWxhdGlvblR5cGUsIGVsZW1lbnQsIGlzRGlyZWN0ZWQgPSBmYWxzZSkge1xuICAgIGlmICh0aGlzLnJlbGF0ZWRHcmFwaC5oYXNSZXNlcnZhdGlvbkNyZWRlbnRpYWxzKHJlbGF0aW9uVHlwZSwgYXBwTmFtZSkpIHtcbiAgICAgIGlmICh0aGlzLnJlbGF0ZWRHcmFwaC5jb250YWluc0FwcChhcHBOYW1lKSkge1xuICAgICAgICBsZXQgcmVzID0ge31cbiAgICAgICAgbGV0IG5vZGUyID0gdGhpcy5yZWxhdGVkR3JhcGguYWRkTm9kZShlbGVtZW50KTtcbiAgICAgICAgcmVzLm5vZGUgPSBub2RlMlxuICAgICAgICBsZXQgcmVsID0gbmV3IFNwaW5hbFJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgW3RoaXNdLCBbbm9kZTJdLFxuICAgICAgICAgIGlzRGlyZWN0ZWQpO1xuICAgICAgICByZXMucmVsYXRpb24gPSByZWxcbiAgICAgICAgdGhpcy5yZWxhdGVkR3JhcGguYWRkUmVsYXRpb24ocmVsLCBhcHBOYW1lKTtcbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYXBwTmFtZSArIFwiIGRvZXMgbm90IGV4aXN0XCIpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uVHlwZV1cbiAgICAgICk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEBwYXJhbSB7TW9kZWx9IGVsZW1lbnQgLSBhbnkgc3ViY2xhc3Mgb2YgTW9kZWxcbiAgICogQHBhcmFtIHtib29sZWFufSBbaXNEaXJlY3RlZD1mYWxzZV1cbiAgICogQHBhcmFtIHtib29sZWFufSBbYXNQYXJlbnQ9ZmFsc2VdXG4gICAqIEByZXR1cm5zIGFuIE9iamVjdCBvZiAxKXJlbGF0aW9uOnRoZSByZWxhdGlvbiB3aXRoIHRoZSBhZGRlZCBlbGVtZW50IG5vZGUgaW4gKG5vZGVMaXN0MiksIDIpbm9kZTogdGhlIGNyZWF0ZWQgbm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYWRkVG9FeGlzdGluZ1JlbGF0aW9uKFxuICAgIHJlbGF0aW9uVHlwZSxcbiAgICBlbGVtZW50LFxuICAgIGlzRGlyZWN0ZWQgPSBmYWxzZSxcbiAgICBhc1BhcmVudCA9IGZhbHNlXG4gICkge1xuICAgIGxldCByZXMgPSB7fVxuICAgIGlmICghdGhpcy5yZWxhdGVkR3JhcGguaXNSZXNlcnZlZChyZWxhdGlvblR5cGUpKSB7XG4gICAgICBsZXQgZXhpc3RpbmdSZWxhdGlvbnMgPSB0aGlzLmdldFJlbGF0aW9ucygpO1xuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGV4aXN0aW5nUmVsYXRpb25zLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCByZWxhdGlvbiA9IGV4aXN0aW5nUmVsYXRpb25zW2luZGV4XTtcbiAgICAgICAgcmVzLnJlbGF0aW9uID0gcmVsYXRpb25cbiAgICAgICAgaWYgKFxuICAgICAgICAgIHJlbGF0aW9uVHlwZSA9PT0gcmVsYXRpb25UeXBlICYmXG4gICAgICAgICAgaXNEaXJlY3RlZCA9PT0gcmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKVxuICAgICAgICApIHtcbiAgICAgICAgICBub2RlMiA9IHRoaXMucmVsYXRlZEdyYXBoLmFkZE5vZGUoZWxlbWVudCk7XG4gICAgICAgICAgcmVzLm5vZGUgPSBub2RlMjtcbiAgICAgICAgICBpZiAoaXNEaXJlY3RlZCkge1xuICAgICAgICAgICAgaWYgKGFzUGFyZW50KSB7XG4gICAgICAgICAgICAgIHJlbGF0aW9uLmFkZE5vZGV0b05vZGVMaXN0MShub2RlMik7XG4gICAgICAgICAgICAgIG5vZGUyLmFkZERpcmVjdGVkUmVsYXRpb25QYXJlbnQocmVsYXRpb24pO1xuICAgICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVsYXRpb24uYWRkTm9kZXRvTm9kZUxpc3QyKG5vZGUyKTtcbiAgICAgICAgICAgICAgbm9kZTIuYWRkRGlyZWN0ZWRSZWxhdGlvbkNoaWxkKHJlbGF0aW9uKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVsYXRpb24uYWRkTm9kZXRvTm9kZUxpc3QyKG5vZGUyKTtcbiAgICAgICAgICAgIG5vZGUyLmFkZE5vbkRpcmVjdGVkUmVsYXRpb24ocmVsYXRpb24pO1xuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmFkZFNpbXBsZVJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgZWxlbWVudCwgaXNEaXJlY3RlZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICByZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVsYXRlZEdyYXBoLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHBhcmFtIHtNb2RlbH0gZWxlbWVudCAtIGFueSBzdWJjbGFzcyBvZiBNb2RlbFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0RpcmVjdGVkPWZhbHNlXVxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFthc1BhcmVudD1mYWxzZV1cbiAgICogQHJldHVybnMgYW4gT2JqZWN0IG9mIDEpcmVsYXRpb246dGhlIHJlbGF0aW9uIHdpdGggdGhlIGFkZGVkIGVsZW1lbnQgbm9kZSBpbiAobm9kZUxpc3QyKSwgMilub2RlOiB0aGUgY3JlYXRlZCBub2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhZGRUb0V4aXN0aW5nUmVsYXRpb25CeUFwcChcbiAgICBhcHBOYW1lLFxuICAgIHJlbGF0aW9uVHlwZSxcbiAgICBlbGVtZW50LFxuICAgIGlzRGlyZWN0ZWQgPSBmYWxzZSxcbiAgICBhc1BhcmVudCA9IGZhbHNlXG4gICkge1xuICAgIGxldCByZXMgPSB7fVxuICAgIGxldCBub2RlMiA9IG51bGxcbiAgICBpZiAodGhpcy5yZWxhdGVkR3JhcGguaGFzUmVzZXJ2YXRpb25DcmVkZW50aWFscyhyZWxhdGlvblR5cGUsIGFwcE5hbWUpKSB7XG4gICAgICBpZiAodGhpcy5yZWxhdGVkR3JhcGguY29udGFpbnNBcHAoYXBwTmFtZSkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmFwcHNbYXBwTmFtZV0gIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBsZXQgYXBwUmVsYXRpb25zID0gdGhpcy5nZXRSZWxhdGlvbnNCeUFwcE5hbWUoYXBwTmFtZSk7XG4gICAgICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGFwcFJlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICAgIGNvbnN0IHJlbGF0aW9uID0gYXBwUmVsYXRpb25zW2luZGV4XTtcbiAgICAgICAgICAgIHJlcy5yZWxhdGlvbiA9IHJlbGF0aW9uXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgIHJlbGF0aW9uLnR5cGUuZ2V0KCkgPT09IHJlbGF0aW9uVHlwZSAmJlxuICAgICAgICAgICAgICBpc0RpcmVjdGVkID09PSByZWxhdGlvbi5pc0RpcmVjdGVkLmdldCgpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgbm9kZTIgPSB0aGlzLnJlbGF0ZWRHcmFwaC5hZGROb2RlKGVsZW1lbnQpO1xuICAgICAgICAgICAgICByZXMubm9kZSA9IG5vZGUyO1xuICAgICAgICAgICAgICBpZiAoaXNEaXJlY3RlZCkge1xuICAgICAgICAgICAgICAgIGlmIChhc1BhcmVudCkge1xuICAgICAgICAgICAgICAgICAgcmVsYXRpb24uYWRkTm9kZXRvTm9kZUxpc3QxKG5vZGUyKTtcbiAgICAgICAgICAgICAgICAgIG5vZGUyLmFkZERpcmVjdGVkUmVsYXRpb25QYXJlbnQocmVsYXRpb24sIGFwcE5hbWUpO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgcmVsYXRpb24uYWRkTm9kZXRvTm9kZUxpc3QyKG5vZGUyKTtcbiAgICAgICAgICAgICAgICAgIG5vZGUyLmFkZERpcmVjdGVkUmVsYXRpb25DaGlsZChyZWxhdGlvbiwgYXBwTmFtZSk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZWxhdGlvbi5hZGROb2RldG9Ob2RlTGlzdDIobm9kZTIpO1xuICAgICAgICAgICAgICAgIG5vZGUyLmFkZE5vbkRpcmVjdGVkUmVsYXRpb24ocmVsYXRpb24sIGFwcE5hbWUpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkU2ltcGxlUmVsYXRpb25CeUFwcChcbiAgICAgICAgICBhcHBOYW1lLFxuICAgICAgICAgIHJlbGF0aW9uVHlwZSxcbiAgICAgICAgICBlbGVtZW50LFxuICAgICAgICAgIGlzRGlyZWN0ZWRcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYXBwTmFtZSArIFwiIGRvZXMgbm90IGV4aXN0XCIpO1xuICAgICAgfVxuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIHJlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGlzIHJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5yZWxhdGVkR3JhcGgucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvblR5cGVdXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG5cblxuXG4gIC8vIGFkZFJlbGF0aW9uMihfcmVsYXRpb24sIF9uYW1lKSB7XG4gIC8vICAgbGV0IGNsYXNzaWZ5ID0gZmFsc2U7XG4gIC8vICAgbGV0IG5hbWUgPSBfcmVsYXRpb24udHlwZS5nZXQoKTtcbiAgLy8gICBpZiAodHlwZW9mIF9uYW1lICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gIC8vICAgICBuYW1lID0gX25hbWU7XG4gIC8vICAgfVxuICAvLyAgIGlmICh0eXBlb2YgdGhpcy5yZWxhdGlvbnNbX3JlbGF0aW9uLnR5cGUuZ2V0KCldICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gIC8vICAgICBpZiAoX3JlbGF0aW9uLmlzRGlyZWN0ZWQuZ2V0KCkpIHtcbiAgLy8gICAgICAgZm9yIChcbiAgLy8gICAgICAgICBsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMucmVsYXRpb25zW19yZWxhdGlvbi50eXBlLmdldCgpXS5sZW5ndGg7IGluZGV4KytcbiAgLy8gICAgICAgKSB7XG4gIC8vICAgICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMucmVsYXRpb25zW19yZWxhdGlvbi50eXBlLmdldCgpXVtpbmRleF07XG4gIC8vICAgICAgICAgaWYgKFxuICAvLyAgICAgICAgICAgVXRpbGl0aWVzLmFycmF5c0VxdWFsKFxuICAvLyAgICAgICAgICAgICBfcmVsYXRpb24uZ2V0Tm9kZUxpc3QxSWRzKCksXG4gIC8vICAgICAgICAgICAgIGVsZW1lbnQuZ2V0Tm9kZUxpc3QxSWRzKClcbiAgLy8gICAgICAgICAgIClcbiAgLy8gICAgICAgICApIHtcbiAgLy8gICAgICAgICAgIGVsZW1lbnQuYWRkTm90RXhpc3RpbmdWZXJ0aWNlc3RvTm9kZUxpc3QyKF9yZWxhdGlvbi5ub2RlTGlzdDIpO1xuICAvLyAgICAgICAgIH0gZWxzZSB7XG4gIC8vICAgICAgICAgICBlbGVtZW50LnB1c2goX3JlbGF0aW9uKTtcbiAgLy8gICAgICAgICAgIGNsYXNzaWZ5ID0gdHJ1ZTtcbiAgLy8gICAgICAgICB9XG4gIC8vICAgICAgIH1cbiAgLy8gICAgIH0gZWxzZSB7XG4gIC8vICAgICAgIHRoaXMucmVsYXRpb25zW19yZWxhdGlvbi50eXBlLmdldCgpXS5hZGROb3RFeGlzdGluZ1ZlcnRpY2VzdG9SZWxhdGlvbihcbiAgLy8gICAgICAgICBfcmVsYXRpb25cbiAgLy8gICAgICAgKTtcbiAgLy8gICAgIH1cbiAgLy8gICB9IGVsc2Uge1xuICAvLyAgICAgaWYgKF9yZWxhdGlvbi5pc0RpcmVjdGVkLmdldCgpKSB7XG4gIC8vICAgICAgIGxldCBsaXN0ID0gbmV3IExzdCgpO1xuICAvLyAgICAgICBsaXN0LnB1c2goX3JlbGF0aW9uKTtcbiAgLy8gICAgICAgdGhpcy5yZWxhdGlvbnMuYWRkX2F0dHIoe1xuICAvLyAgICAgICAgIFtuYW1lXTogbGlzdFxuICAvLyAgICAgICB9KTtcbiAgLy8gICAgICAgdGhpcy5fY2xhc3NpZnlSZWxhdGlvbihfcmVsYXRpb24pO1xuICAvLyAgICAgfSBlbHNlIHtcbiAgLy8gICAgICAgdGhpcy5yZWxhdGlvbnMuYWRkX2F0dHIoe1xuICAvLyAgICAgICAgIFtuYW1lXTogX3JlbGF0aW9uXG4gIC8vICAgICAgIH0pO1xuICAvLyAgICAgICBjbGFzc2lmeSA9IHRydWU7XG4gIC8vICAgICB9XG4gIC8vICAgfVxuICAvLyAgIGlmIChjbGFzc2lmeSkgdGhpcy5fY2xhc3NpZnlSZWxhdGlvbihfcmVsYXRpb24pO1xuICAvLyB9XG5cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb259IF9yZWxhdGlvblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgX2NsYXNzaWZ5UmVsYXRpb24oX3JlbGF0aW9uKSB7XG4gICAgdGhpcy5yZWxhdGVkR3JhcGgubG9hZChyZWxhdGVkR3JhcGggPT4ge1xuICAgICAgcmVsYXRlZEdyYXBoLl9jbGFzc2lmeVJlbGF0aW9uKF9yZWxhdGlvbik7XG4gICAgfSk7XG4gIH1cblxuICAvL1RPRE8gOk5vdFdvcmtpbmdcbiAgLy8gYWRkUmVsYXRpb24oX3JlbGF0aW9uKSB7XG4gIC8vICAgdGhpcy5hZGRSZWxhdGlvbihfcmVsYXRpb24pXG4gIC8vICAgdGhpcy5yZWxhdGVkR3JhcGgubG9hZChyZWxhdGVkR3JhcGggPT4ge1xuICAvLyAgICAgcmVsYXRlZEdyYXBoLl9hZGROb3RFeGlzdGluZ1ZlcnRpY2VzRnJvbVJlbGF0aW9uKF9yZWxhdGlvbilcbiAgLy8gICB9KVxuICAvLyB9XG4gIC8vVE9ETyA6Tm90V29ya2luZ1xuICAvLyBhZGRSZWxhdGlvbnMoX3JlbGF0aW9ucykge1xuICAvLyAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBfcmVsYXRpb25zLmxlbmd0aDsgaW5kZXgrKykge1xuICAvLyAgICAgdGhpcy5hZGRSZWxhdGlvbihfcmVsYXRpb25zW2luZGV4XSk7XG4gIC8vICAgfVxuICAvLyB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyBhbGwgdGhlIHJlbGF0aW9ucyBvZiB0aGlzIE5vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGdldFJlbGF0aW9ucygpIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnJlbGF0aW9ucy5fYXR0cmlidXRlX25hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCByZWxMaXN0ID0gdGhpcy5yZWxhdGlvbnNbdGhpcy5yZWxhdGlvbnMuX2F0dHJpYnV0ZV9uYW1lc1tpXV07XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHJlbExpc3QubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgY29uc3QgcmVsYXRpb24gPSByZWxMaXN0W2pdO1xuICAgICAgICByZXMucHVzaChyZWxhdGlvbik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gICAqIEByZXR1cm5zIGFsbCByZWxhdGlvbnMgb2YgYSBzcGVjaWZpYyByZWxhdGlvbiB0eXBlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBnZXRSZWxhdGlvbnNCeVR5cGUodHlwZSkge1xuICAgIGxldCByZXMgPSBbXTtcbiAgICBpZiAoIXR5cGUuaW5jbHVkZXMoXCI+XCIsIHR5cGUubGVuZ3RoIC0gMikgJiZcbiAgICAgICF0eXBlLmluY2x1ZGVzKFwiPFwiLCB0eXBlLmxlbmd0aCAtIDIpICYmXG4gICAgICAhdHlwZS5pbmNsdWRlcyhcIi1cIiwgdHlwZS5sZW5ndGggLSAyKVxuICAgICkge1xuICAgICAgbGV0IHQxID0gdHlwZS5jb25jYXQoXCI+XCIpO1xuICAgICAgcmVzID0gVXRpbGl0aWVzLmNvbmNhdChyZXMsIHRoaXMuZ2V0UmVsYXRpb25zKHQxKSk7XG4gICAgICBsZXQgdDIgPSB0eXBlLmNvbmNhdChcIjxcIik7XG4gICAgICByZXMgPSBVdGlsaXRpZXMuY29uY2F0KHJlcywgdGhpcy5nZXRSZWxhdGlvbnModDIpKTtcbiAgICAgIGxldCB0MyA9IHR5cGUuY29uY2F0KFwiLVwiKTtcbiAgICAgIHJlcyA9IFV0aWxpdGllcy5jb25jYXQocmVzLCB0aGlzLmdldFJlbGF0aW9ucyh0MykpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHRoaXMucmVsYXRpb25zW3R5cGVdICE9PSBcInVuZGVmaW5lZFwiKSByZXMgPSB0aGlzLnJlbGF0aW9uc1tcbiAgICAgIHR5cGVdO1xuICAgIHJldHVybiByZXM7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEByZXR1cm5zIGFsbCByZWxhdGlvbnMgb2YgYSBzcGVjaWZpYyBhcHBcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGdldFJlbGF0aW9uc0J5QXBwTmFtZShhcHBOYW1lKSB7XG4gICAgbGV0IHJlcyA9IFtdO1xuICAgIGlmICh0aGlzLmhhc0FwcERlZmluZWQoYXBwTmFtZSkpIHtcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLmFwcHNbYXBwTmFtZV0uX2F0dHJpYnV0ZV9uYW1lcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgYXBwUmVsYXRpb24gPSB0aGlzLmFwcHNbYXBwTmFtZV1bdGhpcy5hcHBzW2FwcE5hbWVdLl9hdHRyaWJ1dGVfbmFtZXNbXG4gICAgICAgICAgaW5kZXhdXTtcbiAgICAgICAgcmVzLnB1c2goYXBwUmVsYXRpb24pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbEFwcGxpY2F0aW9ufSBhcHBcbiAgICogQHJldHVybnMgYWxsIHJlbGF0aW9ucyBvZiBhIHNwZWNpZmljIGFwcFxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgZ2V0UmVsYXRpb25zQnlBcHAoYXBwKSB7XG4gICAgbGV0IGFwcE5hbWUgPSBhcHAubmFtZS5nZXQoKVxuICAgIHJldHVybiB0aGlzLmdldFJlbGF0aW9uc0J5QXBwTmFtZShhcHBOYW1lKVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEByZXR1cm5zIGFsbCByZWxhdGlvbnMgb2YgYSBzcGVjaWZpYyBhcHAgb2YgYSBzcGVjaWZpYyB0eXBlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBnZXRSZWxhdGlvbnNCeUFwcE5hbWVCeVR5cGUoYXBwTmFtZSwgcmVsYXRpb25UeXBlKSB7XG4gICAgbGV0IHJlcyA9IFtdO1xuICAgIGlmICh0aGlzLmhhc1JlbGF0aW9uQnlBcHBCeVR5cGVEZWZpbmVkKGFwcE5hbWUsIHJlbGF0aW9uVHlwZSkpIHtcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLmFwcHNbYXBwTmFtZV0uX2F0dHJpYnV0ZV9uYW1lcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgYXBwUmVsYXRpb24gPSB0aGlzLmFwcHNbYXBwTmFtZV1bdGhpcy5hcHBzW2FwcE5hbWVdLl9hdHRyaWJ1dGVfbmFtZXNbXG4gICAgICAgICAgaW5kZXhdXTtcbiAgICAgICAgaWYgKGFwcFJlbGF0aW9uLnR5cGUuZ2V0KCkgPT09IHJlbGF0aW9uVHlwZSkgcmVzLnB1c2goYXBwUmVsYXRpb24pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbEFwcGxpY2F0aW9ufSBhcHBcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBhbGwgcmVsYXRpb25zIG9mIGEgc3BlY2lmaWMgYXBwIG9mIGEgc3BlY2lmaWMgdHlwZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgZ2V0UmVsYXRpb25zQnlBcHBCeVR5cGUoYXBwLCByZWxhdGlvblR5cGUpIHtcbiAgICBsZXQgYXBwTmFtZSA9IGFwcC5uYW1lLmdldCgpXG4gICAgcmV0dXJuIHRoaXMuZ2V0UmVsYXRpb25zQnlBcHBOYW1lQnlUeXBlKGFwcE5hbWUsIHJlbGF0aW9uVHlwZSlcblxuICB9XG4gIC8qKlxuICAgKiAgdmVyaWZ5IGlmIGFuIGVsZW1lbnQgaXMgYWxyZWFkeSBpbiBnaXZlbiBub2RlTGlzdFxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGVbXX0gX25vZGVsaXN0XG4gICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGluTm9kZUxpc3QoX25vZGVsaXN0KSB7XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IF9ub2RlbGlzdC5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSBfbm9kZWxpc3RbaW5kZXhdO1xuICAgICAgaWYgKGVsZW1lbnQuaWQuZ2V0KCkgPT09IHRoaXMuaWQuZ2V0KCkpIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvL1RPRE8gZ2V0Q2hpbGRyZW4sIGdldFBhcmVudFxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZSAtIG9wdGlvbmFsXG4gICAqIEByZXR1cm5zIGEgbGlzdCBvZiBuZWlnaGJvcnMgbm9kZXMgXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBnZXROZWlnaGJvcnMocmVsYXRpb25UeXBlKSB7XG4gICAgbGV0IG5laWdoYm9ycyA9IFtdO1xuICAgIGxldCByZWxhdGlvbnMgPSB0aGlzLmdldFJlbGF0aW9ucyhyZWxhdGlvblR5cGUpO1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCByZWxhdGlvbnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCByZWxhdGlvbiA9IHJlbGF0aW9uc1tpbmRleF07XG4gICAgICBpZiAocmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKSkge1xuICAgICAgICBpZiAodGhpcy5pbk5vZGVMaXN0KHJlbGF0aW9uLm5vZGVMaXN0MSkpXG4gICAgICAgICAgbmVpZ2hib3JzID0gVXRpbGl0aWVzLmNvbmNhdChuZWlnaGJvcnMsIHJlbGF0aW9uLm5vZGVMaXN0Mik7XG4gICAgICAgIGVsc2UgbmVpZ2hib3JzID0gVXRpbGl0aWVzLmNvbmNhdChuZWlnaGJvcnMsIHJlbGF0aW9uLm5vZGVMaXN0MSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZWlnaGJvcnMgPSBVdGlsaXRpZXMuY29uY2F0KFxuICAgICAgICAgIG5laWdoYm9ycyxcbiAgICAgICAgICBVdGlsaXRpZXMuYWxsQnV0TWVCeUlkKHJlbGF0aW9uLm5vZGVMaXN0MSlcbiAgICAgICAgKTtcbiAgICAgICAgbmVpZ2hib3JzID0gVXRpbGl0aWVzLmNvbmNhdChcbiAgICAgICAgICBuZWlnaGJvcnMsXG4gICAgICAgICAgVXRpbGl0aWVzLmFsbEJ1dE1lQnlJZChyZWxhdGlvbi5ub2RlTGlzdDIpXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZWlnaGJvcnM7XG4gIH1cblxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBhcnJheSBvZiBzcGluYWxOb2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBnZXRDaGlsZHJlbkJ5UmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSkge1xuICAgIGxldCByZXMgPSBbXVxuICAgIGlmICh0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIj5cIl0pXG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCI+XCJdLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCByZWxhdGlvbiA9IHRoaXMucmVsYXRpb25zW3JlbGF0aW9uVHlwZSArIFwiPlwiXVtpbmRleF07XG4gICAgICAgIGxldCBub2RlTGlzdDIgPSByZWxhdGlvbi5nZXROb2RlTGlzdDIoKTtcbiAgICAgICAgcmVzID0gVXRpbGl0aWVzLmNvbmNhdChyZXMsIG5vZGVMaXN0MilcbiAgICAgIH1cbiAgICByZXR1cm4gcmVzXG4gIH1cblxuICAvL1RPRE9cbiAgLy8gLyoqXG4gIC8vICAqXG4gIC8vICAqXG4gIC8vICAqIEBwYXJhbSB7c3RyaW5nfFNwaW5hbFJlbGF0aW9ufSByZWxhdGlvblxuICAvLyAgKiBAcmV0dXJucyBib29sZWFuXG4gIC8vICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gIC8vICAqL1xuICAvLyBpc1BhcmVudChyZWxhdGlvbikge1xuICAvLyAgIGlmICh0eXBlb2YgcmVsYXRpb24gPT09IFwic3RyaW5nXCIpIHtcbiAgLy8gICAgIGlmICh0eXBlb2YgdGhpcy5yZWxhdGlvbnNbcmVsYXRpb24gKyBcIj5cIl0gIT0gXCJ1bmRlZmluZWRcIikge1xuICAvLyAgICAgICBsZXQgcmVsYXRpb25zID0gdGhpcy5yZWxhdGlvbnNbcmVsYXRpb24gKyBcIj5cIl1cbiAgLy8gICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHJlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgLy8gICAgICAgICBjb25zdCByZWxhdGlvbiA9IHJlbGF0aW9uc1tpbmRleF07XG4gIC8vICAgICAgICAgbGV0IG5vZGVMaXN0MSA9IHJlbGF0aW9uLmdldE5vZGVMaXN0MSgpXG4gIC8vICAgICAgICAgcmV0dXJuIFV0aWxpdGllcy5jb250YWluc0xzdEJ5SWQobm9kZUxpc3QxLCB0aGlzKVxuICAvLyAgICAgICB9XG4gIC8vICAgICB9XG4gIC8vICAgfSBlbHNlIHtcbiAgLy8gICAgIGxldCBub2RlTGlzdDEgPSByZWxhdGlvbi5nZXROb2RlTGlzdDEoKVxuICAvLyAgICAgcmV0dXJuIFV0aWxpdGllcy5jb250YWluc0xzdEJ5SWQobm9kZUxpc3QxLCB0aGlzKVxuICAvLyAgIH1cbiAgLy8gICByZXR1cm4gZmFsc2U7XG4gIC8vIH1cblxuICAvL1RPRE9cbiAgLy8gLyoqXG4gIC8vICAqXG4gIC8vICAqXG4gIC8vICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb259IHJlbGF0aW9uXG4gIC8vICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgLy8gICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgLy8gICovXG4gIC8vIGlzQ2hpbGQocmVsYXRpb24pIHtcbiAgLy8gICBsZXQgbm9kZUxpc3QyID0gcmVsYXRpb24uZ2V0Tm9kZUxpc3QyKClcbiAgLy8gICByZXR1cm4gVXRpbGl0aWVzLmNvbnRhaW5zTHN0QnlJZChub2RlTGlzdDIsIHRoaXMpXG4gIC8vIH1cblxuICAvL1RPRE8gT3B0aW1pemVcbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nIHwgU3BpbmFsQXBwbGljYXRpb259IGFwcE5hbWVcbiAgICogQHBhcmFtIHtzdHJpbmcgfCBTcGluYWxSZWxhdGlvbn0gcmVsYXRpb25UeXBlXG4gICAqIEByZXR1cm5zIGFycmF5IG9mIHNwaW5hbE5vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGdldENoaWxkcmVuQnlBcHBCeVJlbGF0aW9uKGFwcCwgcmVsYXRpb24pIHtcbiAgICBsZXQgYXBwTmFtZSA9IFwiXCJcbiAgICBsZXQgcmVsYXRpb25UeXBlID0gXCJcIlxuICAgIGxldCByZXMgPSBbXVxuICAgIGlmICh0eXBlb2YgYXBwICE9IFwic3RyaW5nXCIpXG4gICAgICBhcHBOYW1lID0gYXBwLm5hbWUuZ2V0KClcbiAgICBlbHNlXG4gICAgICBhcHBOYW1lID0gYXBwXG4gICAgaWYgKHR5cGVvZiBhcHAgIT0gXCJzdHJpbmdcIilcbiAgICAgIHJlbGF0aW9uVHlwZSA9IHJlbGF0aW9uLm5hbWUuZ2V0KClcbiAgICBlbHNlXG4gICAgICByZWxhdGlvblR5cGUgPSByZWxhdGlvblxuICAgIGlmICh0eXBlb2YgdGhpcy5hcHBzW2FwcE5hbWVdICE9IFwidW5kZWZpbmVkXCIgJiYgdHlwZW9mIHRoaXMuYXBwc1tcbiAgICAgICAgYXBwTmFtZV1bcmVsYXRpb25UeXBlICsgXCI+XCJdICE9IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGxldCByZWxhdGlvblRtcCA9IHRoaXMuYXBwc1thcHBOYW1lXVtyZWxhdGlvblR5cGUgKyBcIj5cIl1cbiAgICAgIGxldCBub2RlTGlzdDIgPSByZWxhdGlvblRtcC5nZXROb2RlTGlzdDIoKVxuICAgICAgcmVzID0gVXRpbGl0aWVzLmNvbmNhdChyZXMsIG5vZGVMaXN0MilcbiAgICB9XG4gICAgcmV0dXJuIHJlc1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nIHwgU3BpbmFsQXBwbGljYXRpb259IGFwcE5hbWVcbiAgICogQHBhcmFtIHtzdHJpbmcgfCBTcGluYWxSZWxhdGlvbn0gcmVsYXRpb25UeXBlXG4gICAqIEByZXR1cm5zICBBIHByb21pc2Ugb2YgYW4gYXJyYXkgb2YgTW9kZWxzXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhc3luYyBnZXRDaGlsZHJlbkVsZW1lbnRzQnlBcHBCeVJlbGF0aW9uKGFwcCwgcmVsYXRpb24pIHtcbiAgICBsZXQgYXBwTmFtZSA9IFwiXCJcbiAgICBsZXQgcmVsYXRpb25UeXBlID0gXCJcIlxuICAgIGxldCByZXMgPSBbXVxuICAgIGlmICh0eXBlb2YgYXBwICE9IFwic3RyaW5nXCIpXG4gICAgICBhcHBOYW1lID0gYXBwLm5hbWUuZ2V0KClcbiAgICBlbHNlXG4gICAgICBhcHBOYW1lID0gYXBwXG4gICAgaWYgKHR5cGVvZiBhcHAgIT0gXCJzdHJpbmdcIilcbiAgICAgIHJlbGF0aW9uVHlwZSA9IHJlbGF0aW9uLm5hbWUuZ2V0KClcbiAgICBlbHNlXG4gICAgICByZWxhdGlvblR5cGUgPSByZWxhdGlvblxuICAgIGlmICh0eXBlb2YgdGhpcy5hcHBzW2FwcE5hbWVdICE9IFwidW5kZWZpbmVkXCIgJiYgdHlwZW9mIHRoaXMuYXBwc1tcbiAgICAgICAgYXBwTmFtZV1bcmVsYXRpb25UeXBlICsgXCI+XCJdICE9IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGxldCByZWxhdGlvblRtcCA9IHRoaXMuYXBwc1thcHBOYW1lXVtyZWxhdGlvblR5cGUgKyBcIj5cIl1cbiAgICAgIGxldCBub2RlTGlzdDIgPSByZWxhdGlvblRtcC5nZXROb2RlTGlzdDIoKVxuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IG5vZGVMaXN0Mi5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVMaXN0MltpbmRleF07XG4gICAgICAgIHJlcy5wdXNoKGF3YWl0IG5vZGUuZ2V0RWxlbWVudCgpKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzXG4gIH1cblxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBBIHByb21pc2Ugb2YgYW4gYXJyYXkgb2YgTW9kZWxzXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhc3luYyBnZXRDaGlsZHJlbkVsZW1lbnRzQnlSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlKSB7XG4gICAgbGV0IHJlcyA9IFtdXG4gICAgaWYgKHRoaXMucmVsYXRpb25zW3JlbGF0aW9uVHlwZSArIFwiPlwiXSlcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIj5cIl0ubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IHJlbGF0aW9uID0gdGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCI+XCJdW2luZGV4XTtcbiAgICAgICAgbGV0IG5vZGVMaXN0MiA9IHJlbGF0aW9uLmdldE5vZGVMaXN0MigpO1xuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgbm9kZUxpc3QyLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgIGNvbnN0IG5vZGUgPSBub2RlTGlzdDJbaW5kZXhdO1xuICAgICAgICAgIHJlcy5wdXNoKGF3YWl0IFV0aWxpdGllcy5wcm9taXNlTG9hZChub2RlLmVsZW1lbnQpKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgcmV0dXJuIHJlc1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgYXJyYXkgb2Ygc3BpbmFsTm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgZ2V0UGFyZW50c0J5UmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSkge1xuICAgIGxldCByZXMgPSBbXVxuICAgIGlmICh0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIjxcIl0pXG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCI8XCJdLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCByZWxhdGlvbiA9IHRoaXMucmVsYXRpb25zW3JlbGF0aW9uVHlwZSArIFwiPFwiXVtpbmRleF07XG4gICAgICAgIGxldCBub2RlTGlzdDEgPSByZWxhdGlvbi5nZXROb2RlTGlzdDEoKTtcbiAgICAgICAgcmVzID0gVXRpbGl0aWVzLmNvbmNhdChyZXMsIG5vZGVMaXN0MSlcbiAgICAgIH1cbiAgICByZXR1cm4gcmVzXG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb259IF9yZWxhdGlvblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgcmVtb3ZlUmVsYXRpb24oX3JlbGF0aW9uKSB7XG4gICAgbGV0IHJlbGF0aW9uTHN0ID0gdGhpcy5yZWxhdGlvbnNbX3JlbGF0aW9uLnR5cGUuZ2V0KCldO1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCByZWxhdGlvbkxzdC5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IGNhbmRpZGF0ZVJlbGF0aW9uID0gcmVsYXRpb25Mc3RbaW5kZXhdO1xuICAgICAgaWYgKF9yZWxhdGlvbi5pZC5nZXQoKSA9PT0gY2FuZGlkYXRlUmVsYXRpb24uaWQuZ2V0KCkpXG4gICAgICAgIHJlbGF0aW9uTHN0LnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9uW119IF9yZWxhdGlvbnNcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIHJlbW92ZVJlbGF0aW9ucyhfcmVsYXRpb25zKSB7XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IF9yZWxhdGlvbnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICB0aGlzLnJlbW92ZVJlbGF0aW9uKF9yZWxhdGlvbnNbaW5kZXhdKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIHJlbW92ZVJlbGF0aW9uVHlwZShyZWxhdGlvblR5cGUpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShyZWxhdGlvblR5cGUpIHx8IHJlbGF0aW9uVHlwZSBpbnN0YW5jZW9mIExzdClcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCByZWxhdGlvblR5cGUubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IHR5cGUgPSByZWxhdGlvblR5cGVbaW5kZXhdO1xuICAgICAgICB0aGlzLnJlbGF0aW9ucy5yZW1fYXR0cih0eXBlKTtcbiAgICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMucmVsYXRpb25zLnJlbV9hdHRyKHJlbGF0aW9uVHlwZSk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBoYXNBcHBEZWZpbmVkKGFwcE5hbWUpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMuYXBwc1thcHBOYW1lXSAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oXCJhcHAgXCIgKyBhcHBOYW1lICtcbiAgICAgICAgXCIgaXMgbm90IGRlZmluZWQgZm9yIG5vZGUgXCIgKyB0aGlzLm5hbWUuZ2V0KCkpO1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEByZXR1cm5zIGJvb2xlYW4gXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBoYXNSZWxhdGlvbkJ5QXBwQnlUeXBlRGVmaW5lZChhcHBOYW1lLCByZWxhdGlvblR5cGUpIHtcbiAgICBpZiAodGhpcy5oYXNBcHBEZWZpbmVkKGFwcE5hbWUpICYmIHR5cGVvZiB0aGlzLmFwcHNbYXBwTmFtZV1bXG4gICAgICAgIHJlbGF0aW9uVHlwZVxuICAgICAgXSAhPT1cbiAgICAgIFwidW5kZWZpbmVkXCIpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKFwicmVsYXRpb24gXCIgKyByZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyBub3QgZGVmaW5lZCBmb3Igbm9kZSBcIiArIHRoaXMubmFtZS5nZXQoKSArXG4gICAgICAgIFwiIGZvciBhcHBsaWNhdGlvbiBcIiArIGFwcE5hbWUpO1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyBBIGpzb24gcmVwcmVzZW50aW5nIHRoZSBub2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICB0b0pzb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiB0aGlzLmlkLmdldCgpLFxuICAgICAgbmFtZTogdGhpcy5uYW1lLmdldCgpLFxuICAgICAgZWxlbWVudDogbnVsbFxuICAgIH07XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEByZXR1cm5zIEEganNvbiByZXByZXNlbnRpbmcgdGhlIG5vZGUgd2l0aCBpdHMgcmVsYXRpb25zXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICB0b0pzb25XaXRoUmVsYXRpb25zKCkge1xuICAgIGxldCByZWxhdGlvbnMgPSBbXTtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5nZXRSZWxhdGlvbnMoKS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IHJlbGF0aW9uID0gdGhpcy5nZXRSZWxhdGlvbnMoKVtpbmRleF07XG4gICAgICByZWxhdGlvbnMucHVzaChyZWxhdGlvbi50b0pzb24oKSk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBpZDogdGhpcy5pZC5nZXQoKSxcbiAgICAgIG5hbWU6IHRoaXMubmFtZS5nZXQoKSxcbiAgICAgIGVsZW1lbnQ6IG51bGwsXG4gICAgICByZWxhdGlvbnM6IHJlbGF0aW9uc1xuICAgIH07XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEByZXR1cm5zIEFuIElGQyBsaWtlIGZvcm1hdCByZXByZXNlbnRpbmcgdGhlIG5vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGFzeW5jIHRvSWZjKCkge1xuICAgIGxldCBlbGVtZW50ID0gYXdhaXQgVXRpbGl0aWVzLnByb21pc2VMb2FkKHRoaXMuZWxlbWVudCk7XG4gICAgcmV0dXJuIGVsZW1lbnQudG9JZmMoKTtcbiAgfVxufVxuZXhwb3J0IGRlZmF1bHQgU3BpbmFsTm9kZVxuc3BpbmFsQ29yZS5yZWdpc3Rlcl9tb2RlbHMoW1NwaW5hbE5vZGVdKTsiXX0=