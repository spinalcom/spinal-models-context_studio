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
        id: _Utilities.Utilities.guid(this.constructor.name),
        name: _name,
        element: new Ptr(element),
        relations: new Model(),
        apps: new Model(),
        relatedGraph: relatedGraph
      });
      if (typeof this.relatedGraph !== "undefined") {
        this.relatedGraph.classifyNode(this);
      }
      if (typeof relations !== "undefined") {
        if (Array.isArray(relations) || relations instanceof Lst) this.addRelations(relations);else this.addRelation(relations);
      }
    }
  }
  /**
   *
   *
   * @param {string} type
   * @memberof SpinalNode
   */
  setType(type) {
    if (typeof this.type === "undefined") this.add_attr({
      type: type
    });else this.type = type;
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
          // relation.name.set(nameTmp)
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
          if (isDirected && this.isParent(relation)) {
            node2 = this.relatedGraph.addNode(element);
            res.node = node2;
            if (asParent) {
              relation.addNodetoNodeList1(node2);
              node2.addDirectedRelationParent(relation);
              return res;
            } else {
              relation.addNodetoNodeList2(node2);
              node2.addDirectedRelationChild(relation);
              return res;
            }
          } else if (!isDirected) {
            node2 = this.relatedGraph.addNode(element);
            res.node = node2;
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
              if (isDirected && this.isParent(relation)) {
                node2 = this.relatedGraph.addNode(element);
                res.node = node2;
                if (asParent) {
                  relation.addNodetoNodeList1(node2);
                  node2.addDirectedRelationParent(relation, appName);
                  return res;
                } else {
                  relation.addNodetoNodeList2(node2);
                  node2.addDirectedRelationChild(relation, appName);
                  return res;
                }
              } else if (!isDirected) {
                node2 = this.relatedGraph.addNode(element);
                res.node = node2;
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
   * @returns an array of all relations of a specific app for this node
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

  // /**
  //  *
  //  *
  //  * @param {string} appName
  //  * @returns an object of all relations of a specific app for this node
  //  * @memberof SpinalNode
  //  */
  // getRelationsWithKeysByAppName(appName) {
  //   if (this.hasAppDefined(appName)) {
  //     return this.apps[appName];
  //   }
  // }
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

  /**
   *
   *
   * @param {SpinalRelation} relation
   * @returns boolean
   * @memberof SpinalNode
   */
  isParent(relation) {
    let nodeList1 = relation.getNodeList1();
    return _Utilities.Utilities.containsLstById(nodeList1, this);
  }

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TcGluYWxOb2RlLmpzIl0sIm5hbWVzIjpbInNwaW5hbENvcmUiLCJyZXF1aXJlIiwiZ2xvYmFsVHlwZSIsIndpbmRvdyIsImdsb2JhbCIsImdldFZpZXdlciIsInYiLCJTcGluYWxOb2RlIiwiTW9kZWwiLCJjb25zdHJ1Y3RvciIsIl9uYW1lIiwiZWxlbWVudCIsInJlbGF0ZWRHcmFwaCIsInJlbGF0aW9ucyIsIm5hbWUiLCJGaWxlU3lzdGVtIiwiX3NpZ19zZXJ2ZXIiLCJhZGRfYXR0ciIsImlkIiwiVXRpbGl0aWVzIiwiZ3VpZCIsIlB0ciIsImFwcHMiLCJjbGFzc2lmeU5vZGUiLCJBcnJheSIsImlzQXJyYXkiLCJMc3QiLCJhZGRSZWxhdGlvbnMiLCJhZGRSZWxhdGlvbiIsInNldFR5cGUiLCJ0eXBlIiwiZ2V0QXBwc05hbWVzIiwiX2F0dHJpYnV0ZV9uYW1lcyIsImdldEVsZW1lbnQiLCJwcm9taXNlTG9hZCIsImdldEFwcHMiLCJyZXMiLCJpbmRleCIsImxlbmd0aCIsImFwcE5hbWUiLCJwdXNoIiwiYXBwc0xpc3QiLCJoYXNSZWxhdGlvbiIsImFkZERpcmVjdGVkUmVsYXRpb25QYXJlbnQiLCJyZWxhdGlvbiIsImdldCIsImNvbmNhdCIsImFkZFJlbGF0aW9uQnlBcHAiLCJhZGREaXJlY3RlZFJlbGF0aW9uQ2hpbGQiLCJhZGROb25EaXJlY3RlZFJlbGF0aW9uIiwiaXNSZXNlcnZlZCIsIm5hbWVUbXAiLCJsaXN0IiwiY29uc29sZSIsImxvZyIsInJlc2VydmVkUmVsYXRpb25zTmFtZXMiLCJoYXNSZXNlcnZhdGlvbkNyZWRlbnRpYWxzIiwiY29udGFpbnNBcHAiLCJlcnJvciIsImFkZFNpbXBsZVJlbGF0aW9uIiwicmVsYXRpb25UeXBlIiwiaXNEaXJlY3RlZCIsIm5vZGUyIiwiYWRkTm9kZSIsIm5vZGUiLCJyZWwiLCJTcGluYWxSZWxhdGlvbiIsImFkZFNpbXBsZVJlbGF0aW9uQnlBcHAiLCJhZGRUb0V4aXN0aW5nUmVsYXRpb24iLCJhc1BhcmVudCIsImV4aXN0aW5nUmVsYXRpb25zIiwiZ2V0UmVsYXRpb25zIiwiaXNQYXJlbnQiLCJhZGROb2RldG9Ob2RlTGlzdDEiLCJhZGROb2RldG9Ob2RlTGlzdDIiLCJhZGRUb0V4aXN0aW5nUmVsYXRpb25CeUFwcCIsImFwcFJlbGF0aW9ucyIsImdldFJlbGF0aW9uc0J5QXBwTmFtZSIsIl9jbGFzc2lmeVJlbGF0aW9uIiwiX3JlbGF0aW9uIiwibG9hZCIsImkiLCJyZWxMaXN0IiwiaiIsImdldFJlbGF0aW9uc0J5VHlwZSIsImluY2x1ZGVzIiwidDEiLCJ0MiIsInQzIiwiaGFzQXBwRGVmaW5lZCIsImFwcFJlbGF0aW9uIiwiZ2V0UmVsYXRpb25zQnlBcHAiLCJhcHAiLCJnZXRSZWxhdGlvbnNCeUFwcE5hbWVCeVR5cGUiLCJoYXNSZWxhdGlvbkJ5QXBwQnlUeXBlRGVmaW5lZCIsImdldFJlbGF0aW9uc0J5QXBwQnlUeXBlIiwiaW5Ob2RlTGlzdCIsIl9ub2RlbGlzdCIsImdldE5laWdoYm9ycyIsIm5laWdoYm9ycyIsIm5vZGVMaXN0MSIsIm5vZGVMaXN0MiIsImFsbEJ1dE1lQnlJZCIsImdldENoaWxkcmVuQnlSZWxhdGlvblR5cGUiLCJnZXROb2RlTGlzdDIiLCJnZXROb2RlTGlzdDEiLCJjb250YWluc0xzdEJ5SWQiLCJnZXRDaGlsZHJlbkJ5QXBwQnlSZWxhdGlvbiIsInJlbGF0aW9uVG1wIiwiZ2V0Q2hpbGRyZW5FbGVtZW50c0J5QXBwQnlSZWxhdGlvbiIsImdldENoaWxkcmVuRWxlbWVudHNCeVJlbGF0aW9uVHlwZSIsImdldFBhcmVudHNCeVJlbGF0aW9uVHlwZSIsInJlbW92ZVJlbGF0aW9uIiwicmVsYXRpb25Mc3QiLCJjYW5kaWRhdGVSZWxhdGlvbiIsInNwbGljZSIsInJlbW92ZVJlbGF0aW9ucyIsIl9yZWxhdGlvbnMiLCJyZW1vdmVSZWxhdGlvblR5cGUiLCJyZW1fYXR0ciIsIndhcm4iLCJ0b0pzb24iLCJ0b0pzb25XaXRoUmVsYXRpb25zIiwidG9JZmMiLCJyZWdp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QVc0SCxlQUFYLENBQTJCLENBQUNySCxVQUFELENBQTNCIiwiZmlsZSI6IlNwaW5hbE5vZGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBzcGluYWxDb3JlID0gcmVxdWlyZShcInNwaW5hbC1jb3JlLWNvbm5lY3RvcmpzXCIpO1xuY29uc3QgZ2xvYmFsVHlwZSA9IHR5cGVvZiB3aW5kb3cgPT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB3aW5kb3c7XG5pbXBvcnQgU3BpbmFsUmVsYXRpb24gZnJvbSBcIi4vU3BpbmFsUmVsYXRpb25cIjtcbmxldCBnZXRWaWV3ZXIgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGdsb2JhbFR5cGUudjtcbn07XG5cbmltcG9ydCB7XG4gIFV0aWxpdGllc1xufSBmcm9tIFwiLi9VdGlsaXRpZXNcIjtcbi8qKlxuICpcbiAqXG4gKiBAZXhwb3J0XG4gKiBAY2xhc3MgU3BpbmFsTm9kZVxuICogQGV4dGVuZHMge01vZGVsfVxuICovXG5jbGFzcyBTcGluYWxOb2RlIGV4dGVuZHMgZ2xvYmFsVHlwZS5Nb2RlbCB7XG4gIC8qKlxuICAgKkNyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgU3BpbmFsTm9kZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHBhcmFtIHtNb2RlbH0gZWxlbWVudCAtIGFueSBzdWJjbGFzcyBvZiBNb2RlbFxuICAgKiBAcGFyYW0ge1NwaW5hbEdyYXBofSByZWxhdGVkR3JhcGhcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbltdfSByZWxhdGlvbnNcbiAgICogQHBhcmFtIHtzdHJpbmd9IFtuYW1lPVwiU3BpbmFsTm9kZVwiXVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgY29uc3RydWN0b3IoX25hbWUsIGVsZW1lbnQsIHJlbGF0ZWRHcmFwaCwgcmVsYXRpb25zLCBuYW1lID0gXCJTcGluYWxOb2RlXCIpIHtcbiAgICBzdXBlcigpO1xuICAgIGlmIChGaWxlU3lzdGVtLl9zaWdfc2VydmVyKSB7XG4gICAgICB0aGlzLmFkZF9hdHRyKHtcbiAgICAgICAgaWQ6IFV0aWxpdGllcy5ndWlkKHRoaXMuY29uc3RydWN0b3IubmFtZSksXG4gICAgICAgIG5hbWU6IF9uYW1lLFxuICAgICAgICBlbGVtZW50OiBuZXcgUHRyKGVsZW1lbnQpLFxuICAgICAgICByZWxhdGlvbnM6IG5ldyBNb2RlbCgpLFxuICAgICAgICBhcHBzOiBuZXcgTW9kZWwoKSxcbiAgICAgICAgcmVsYXRlZEdyYXBoOiByZWxhdGVkR3JhcGhcbiAgICAgIH0pO1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0ZWRHcmFwaCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5jbGFzc2lmeU5vZGUodGhpcyk7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHJlbGF0aW9ucyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShyZWxhdGlvbnMpIHx8IHJlbGF0aW9ucyBpbnN0YW5jZW9mIExzdClcbiAgICAgICAgICB0aGlzLmFkZFJlbGF0aW9ucyhyZWxhdGlvbnMpO1xuICAgICAgICBlbHNlIHRoaXMuYWRkUmVsYXRpb24ocmVsYXRpb25zKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBzZXRUeXBlKHR5cGUpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMudHlwZSA9PT0gXCJ1bmRlZmluZWRcIilcbiAgICAgIHRoaXMuYWRkX2F0dHIoe1xuICAgICAgICB0eXBlOiB0eXBlXG4gICAgICB9KVxuICAgIGVsc2VcbiAgICAgIHRoaXMudHlwZSA9IHR5cGVcbiAgfVxuXG4gIC8vIHJlZ2lzdGVyQXBwKGFwcCkge1xuICAvLyAgIHRoaXMuYXBwcy5hZGRfYXR0cih7XG4gIC8vICAgICBbYXBwLm5hbWUuZ2V0KCldOiBuZXcgUHRyKGFwcClcbiAgLy8gICB9KVxuICAvLyB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyBhbGwgYXBwbGljYXRpb25zIG5hbWVzIGFzIHN0cmluZ1xuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgZ2V0QXBwc05hbWVzKCkge1xuICAgIHJldHVybiB0aGlzLmFwcHMuX2F0dHJpYnV0ZV9uYW1lcztcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgQSBwcm9taXNlIG9mIHRoZSByZWxhdGVkIEVsZW1lbnQgXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhc3luYyBnZXRFbGVtZW50KCkge1xuICAgIHJldHVybiBhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQodGhpcy5lbGVtZW50KVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyBhbGwgYXBwbGljYXRpb25zXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhc3luYyBnZXRBcHBzKCkge1xuICAgIGxldCByZXMgPSBbXVxuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLmFwcHMuX2F0dHJpYnV0ZV9uYW1lcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IGFwcE5hbWUgPSB0aGlzLmFwcHMuX2F0dHJpYnV0ZV9uYW1lc1tpbmRleF07XG4gICAgICByZXMucHVzaChhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQodGhpcy5yZWxhdGVkR3JhcGguYXBwc0xpc3RbXG4gICAgICAgIGFwcE5hbWVdKSlcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICAvLyAvKipcbiAgLy8gICpcbiAgLy8gICpcbiAgLy8gICogQHBhcmFtIHsqfSByZWxhdGlvblR5cGVcbiAgLy8gICogQHBhcmFtIHsqfSByZWxhdGlvblxuICAvLyAgKiBAcGFyYW0geyp9IGFzUGFyZW50XG4gIC8vICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gIC8vICAqL1xuICAvLyBjaGFuZ2VEZWZhdWx0UmVsYXRpb24ocmVsYXRpb25UeXBlLCByZWxhdGlvbiwgYXNQYXJlbnQpIHtcbiAgLy8gICAgIGlmIChyZWxhdGlvbi5pc0RpcmVjdGVkLmdldCgpKSB7XG4gIC8vICAgICAgIGlmIChhc1BhcmVudCkge1xuICAvLyAgICAgICAgIFV0aWxpdGllcy5wdXRPblRvcExzdCh0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIj5cIl0sIHJlbGF0aW9uKTtcbiAgLy8gICAgICAgfSBlbHNlIHtcbiAgLy8gICAgICAgICBVdGlsaXRpZXMucHV0T25Ub3BMc3QodGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCI8XCJdLCByZWxhdGlvbik7XG4gIC8vICAgICAgIH1cbiAgLy8gICAgIH0gZWxzZSB7XG4gIC8vICAgICAgIFV0aWxpdGllcy5wdXRPblRvcExzdCh0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIi1cIl0sIHJlbGF0aW9uKTtcbiAgLy8gICAgIH1cbiAgLy8gICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBoYXNSZWxhdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5yZWxhdGlvbnMubGVuZ3RoICE9PSAwO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9ufSByZWxhdGlvblxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYWRkRGlyZWN0ZWRSZWxhdGlvblBhcmVudChyZWxhdGlvbiwgYXBwTmFtZSkge1xuICAgIGxldCBuYW1lID0gcmVsYXRpb24udHlwZS5nZXQoKTtcbiAgICBuYW1lID0gbmFtZS5jb25jYXQoXCI+XCIpO1xuICAgIGlmICh0eXBlb2YgYXBwTmFtZSA9PT0gXCJ1bmRlZmluZWRcIikgdGhpcy5hZGRSZWxhdGlvbihyZWxhdGlvbiwgbmFtZSk7XG4gICAgZWxzZSB0aGlzLmFkZFJlbGF0aW9uQnlBcHAocmVsYXRpb24sIG5hbWUsIGFwcE5hbWUpO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9ufSByZWxhdGlvblxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYWRkRGlyZWN0ZWRSZWxhdGlvbkNoaWxkKHJlbGF0aW9uLCBhcHBOYW1lKSB7XG4gICAgbGV0IG5hbWUgPSByZWxhdGlvbi50eXBlLmdldCgpO1xuICAgIG5hbWUgPSBuYW1lLmNvbmNhdChcIjxcIik7XG4gICAgaWYgKHR5cGVvZiBhcHBOYW1lID09PSBcInVuZGVmaW5lZFwiKSB0aGlzLmFkZFJlbGF0aW9uKHJlbGF0aW9uLCBuYW1lKTtcbiAgICBlbHNlIHRoaXMuYWRkUmVsYXRpb25CeUFwcChyZWxhdGlvbiwgbmFtZSwgYXBwTmFtZSk7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb259IHJlbGF0aW9uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhZGROb25EaXJlY3RlZFJlbGF0aW9uKHJlbGF0aW9uLCBhcHBOYW1lKSB7XG4gICAgbGV0IG5hbWUgPSByZWxhdGlvbi50eXBlLmdldCgpO1xuICAgIG5hbWUgPSBuYW1lLmNvbmNhdChcIi1cIik7XG4gICAgaWYgKHR5cGVvZiBhcHBOYW1lID09PSBcInVuZGVmaW5lZFwiKSB0aGlzLmFkZFJlbGF0aW9uKHJlbGF0aW9uLCBuYW1lKTtcbiAgICBlbHNlIHRoaXMuYWRkUmVsYXRpb25CeUFwcChyZWxhdGlvbiwgbmFtZSwgYXBwTmFtZSk7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb259IHJlbGF0aW9uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhZGRSZWxhdGlvbihyZWxhdGlvbiwgbmFtZSkge1xuICAgIGlmICghdGhpcy5yZWxhdGVkR3JhcGguaXNSZXNlcnZlZChyZWxhdGlvbi50eXBlLmdldCgpKSkge1xuICAgICAgbGV0IG5hbWVUbXAgPSByZWxhdGlvbi50eXBlLmdldCgpO1xuICAgICAgaWYgKHR5cGVvZiBuYW1lICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIG5hbWVUbXAgPSBuYW1lO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0aW9uc1tuYW1lVG1wXSAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgICAgdGhpcy5yZWxhdGlvbnNbbmFtZVRtcF0ucHVzaChyZWxhdGlvbik7XG4gICAgICBlbHNlIHtcbiAgICAgICAgbGV0IGxpc3QgPSBuZXcgTHN0KCk7XG4gICAgICAgIGxpc3QucHVzaChyZWxhdGlvbik7XG4gICAgICAgIHRoaXMucmVsYXRpb25zLmFkZF9hdHRyKHtcbiAgICAgICAgICBbbmFtZVRtcF06IGxpc3RcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICByZWxhdGlvbi50eXBlLmdldCgpICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uLnR5cGUuZ2V0KCldXG4gICAgICApO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbn0gcmVsYXRpb25cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLXJlbGF0aW9uIE5hbWUgaWYgbm90IG9yZ2luYWxseSBkZWZpbmVkXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhZGRSZWxhdGlvbkJ5QXBwKHJlbGF0aW9uLCBuYW1lLCBhcHBOYW1lKSB7XG4gICAgaWYgKHRoaXMucmVsYXRlZEdyYXBoLmhhc1Jlc2VydmF0aW9uQ3JlZGVudGlhbHMocmVsYXRpb24udHlwZS5nZXQoKSxcbiAgICAgICAgYXBwTmFtZSkpIHtcbiAgICAgIGlmICh0aGlzLnJlbGF0ZWRHcmFwaC5jb250YWluc0FwcChhcHBOYW1lKSkge1xuICAgICAgICBsZXQgbmFtZVRtcCA9IHJlbGF0aW9uLnR5cGUuZ2V0KCk7XG4gICAgICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgIG5hbWVUbXAgPSBuYW1lO1xuICAgICAgICAgIC8vIHJlbGF0aW9uLm5hbWUuc2V0KG5hbWVUbXApXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0aW9uc1tuYW1lVG1wXSAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgICAgICB0aGlzLnJlbGF0aW9uc1tuYW1lVG1wXS5wdXNoKHJlbGF0aW9uKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgbGV0IGxpc3QgPSBuZXcgTHN0KCk7XG4gICAgICAgICAgbGlzdC5wdXNoKHJlbGF0aW9uKTtcbiAgICAgICAgICB0aGlzLnJlbGF0aW9ucy5hZGRfYXR0cih7XG4gICAgICAgICAgICBbbmFtZVRtcF06IGxpc3RcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHRoaXMuYXBwc1thcHBOYW1lXSAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgICAgICB0aGlzLmFwcHNbYXBwTmFtZV0uYWRkX2F0dHIoe1xuICAgICAgICAgICAgW25hbWVUbXBdOiByZWxhdGlvblxuICAgICAgICAgIH0pO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBsZXQgbGlzdCA9IG5ldyBNb2RlbCgpO1xuICAgICAgICAgIGxpc3QuYWRkX2F0dHIoe1xuICAgICAgICAgICAgW25hbWVUbXBdOiByZWxhdGlvblxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMuYXBwcy5hZGRfYXR0cih7XG4gICAgICAgICAgICBbYXBwTmFtZV06IGxpc3RcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihhcHBOYW1lICsgXCIgZG9lcyBub3QgZXhpc3RcIik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICByZWxhdGlvbi50eXBlLmdldCgpICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uLnR5cGUuZ2V0KCldXG4gICAgICApO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcGFyYW0ge01vZGVsfSBlbGVtZW50IC0gYW5kIHN1YmNsYXNzIG9mIE1vZGVsXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGlyZWN0ZWQ9ZmFsc2VdXG4gICAqIEByZXR1cm5zIHRoZSBjcmVhdGVkIHJlbGF0aW9uLCB1bmRlZmluZWQgb3RoZXJ3aXNlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhZGRTaW1wbGVSZWxhdGlvbihyZWxhdGlvblR5cGUsIGVsZW1lbnQsIGlzRGlyZWN0ZWQgPSBmYWxzZSkge1xuICAgIGlmICghdGhpcy5yZWxhdGVkR3JhcGguaXNSZXNlcnZlZChyZWxhdGlvblR5cGUpKSB7XG4gICAgICBsZXQgcmVzID0ge31cbiAgICAgIGxldCBub2RlMiA9IHRoaXMucmVsYXRlZEdyYXBoLmFkZE5vZGUoZWxlbWVudCk7XG4gICAgICByZXMubm9kZSA9IG5vZGUyXG4gICAgICBsZXQgcmVsID0gbmV3IFNwaW5hbFJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgW3RoaXNdLCBbbm9kZTJdLFxuICAgICAgICBpc0RpcmVjdGVkKTtcbiAgICAgIHJlcy5yZWxhdGlvbiA9IHJlbFxuICAgICAgdGhpcy5yZWxhdGVkR3JhcGguYWRkUmVsYXRpb24ocmVsKTtcbiAgICAgIHJldHVybiByZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICByZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVsYXRlZEdyYXBoLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHBhcmFtIHtNb2RlbH0gZWxlbWVudFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0RpcmVjdGVkPWZhbHNlXVxuICAgKiBAcmV0dXJucyB0aGUgY3JlYXRlZCByZWxhdGlvblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYWRkU2ltcGxlUmVsYXRpb25CeUFwcChhcHBOYW1lLCByZWxhdGlvblR5cGUsIGVsZW1lbnQsIGlzRGlyZWN0ZWQgPSBmYWxzZSkge1xuICAgIGlmICh0aGlzLnJlbGF0ZWRHcmFwaC5oYXNSZXNlcnZhdGlvbkNyZWRlbnRpYWxzKHJlbGF0aW9uVHlwZSwgYXBwTmFtZSkpIHtcbiAgICAgIGlmICh0aGlzLnJlbGF0ZWRHcmFwaC5jb250YWluc0FwcChhcHBOYW1lKSkge1xuICAgICAgICBsZXQgcmVzID0ge31cbiAgICAgICAgbGV0IG5vZGUyID0gdGhpcy5yZWxhdGVkR3JhcGguYWRkTm9kZShlbGVtZW50KTtcbiAgICAgICAgcmVzLm5vZGUgPSBub2RlMlxuICAgICAgICBsZXQgcmVsID0gbmV3IFNwaW5hbFJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgW3RoaXNdLCBbbm9kZTJdLFxuICAgICAgICAgIGlzRGlyZWN0ZWQpO1xuICAgICAgICByZXMucmVsYXRpb24gPSByZWxcbiAgICAgICAgdGhpcy5yZWxhdGVkR3JhcGguYWRkUmVsYXRpb24ocmVsLCBhcHBOYW1lKTtcbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYXBwTmFtZSArIFwiIGRvZXMgbm90IGV4aXN0XCIpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uVHlwZV1cbiAgICAgICk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEBwYXJhbSB7TW9kZWx9IGVsZW1lbnQgLSBhbnkgc3ViY2xhc3Mgb2YgTW9kZWxcbiAgICogQHBhcmFtIHtib29sZWFufSBbaXNEaXJlY3RlZD1mYWxzZV1cbiAgICogQHBhcmFtIHtib29sZWFufSBbYXNQYXJlbnQ9ZmFsc2VdXG4gICAqIEByZXR1cm5zIGFuIE9iamVjdCBvZiAxKXJlbGF0aW9uOnRoZSByZWxhdGlvbiB3aXRoIHRoZSBhZGRlZCBlbGVtZW50IG5vZGUgaW4gKG5vZGVMaXN0MiksIDIpbm9kZTogdGhlIGNyZWF0ZWQgbm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYWRkVG9FeGlzdGluZ1JlbGF0aW9uKFxuICAgIHJlbGF0aW9uVHlwZSxcbiAgICBlbGVtZW50LFxuICAgIGlzRGlyZWN0ZWQgPSBmYWxzZSxcbiAgICBhc1BhcmVudCA9IGZhbHNlXG4gICkge1xuICAgIGxldCByZXMgPSB7fVxuICAgIGlmICghdGhpcy5yZWxhdGVkR3JhcGguaXNSZXNlcnZlZChyZWxhdGlvblR5cGUpKSB7XG4gICAgICBsZXQgZXhpc3RpbmdSZWxhdGlvbnMgPSB0aGlzLmdldFJlbGF0aW9ucygpO1xuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGV4aXN0aW5nUmVsYXRpb25zLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCByZWxhdGlvbiA9IGV4aXN0aW5nUmVsYXRpb25zW2luZGV4XTtcbiAgICAgICAgcmVzLnJlbGF0aW9uID0gcmVsYXRpb25cbiAgICAgICAgaWYgKFxuICAgICAgICAgIHJlbGF0aW9uVHlwZSA9PT0gcmVsYXRpb25UeXBlICYmXG4gICAgICAgICAgaXNEaXJlY3RlZCA9PT0gcmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKVxuICAgICAgICApIHtcbiAgICAgICAgICBpZiAoaXNEaXJlY3RlZCAmJiB0aGlzLmlzUGFyZW50KHJlbGF0aW9uKSkge1xuICAgICAgICAgICAgbm9kZTIgPSB0aGlzLnJlbGF0ZWRHcmFwaC5hZGROb2RlKGVsZW1lbnQpO1xuICAgICAgICAgICAgcmVzLm5vZGUgPSBub2RlMjtcbiAgICAgICAgICAgIGlmIChhc1BhcmVudCkge1xuICAgICAgICAgICAgICByZWxhdGlvbi5hZGROb2RldG9Ob2RlTGlzdDEobm9kZTIpO1xuICAgICAgICAgICAgICBub2RlMi5hZGREaXJlY3RlZFJlbGF0aW9uUGFyZW50KHJlbGF0aW9uKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlbGF0aW9uLmFkZE5vZGV0b05vZGVMaXN0Mihub2RlMik7XG4gICAgICAgICAgICAgIG5vZGUyLmFkZERpcmVjdGVkUmVsYXRpb25DaGlsZChyZWxhdGlvbik7XG4gICAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmICghaXNEaXJlY3RlZCkge1xuICAgICAgICAgICAgbm9kZTIgPSB0aGlzLnJlbGF0ZWRHcmFwaC5hZGROb2RlKGVsZW1lbnQpO1xuICAgICAgICAgICAgcmVzLm5vZGUgPSBub2RlMjtcbiAgICAgICAgICAgIHJlbGF0aW9uLmFkZE5vZGV0b05vZGVMaXN0Mihub2RlMik7XG4gICAgICAgICAgICBub2RlMi5hZGROb25EaXJlY3RlZFJlbGF0aW9uKHJlbGF0aW9uKTtcbiAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5hZGRTaW1wbGVSZWxhdGlvbihyZWxhdGlvblR5cGUsIGVsZW1lbnQsIGlzRGlyZWN0ZWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uVHlwZV1cbiAgICAgICk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEBwYXJhbSB7TW9kZWx9IGVsZW1lbnQgLSBhbnkgc3ViY2xhc3Mgb2YgTW9kZWxcbiAgICogQHBhcmFtIHtib29sZWFufSBbaXNEaXJlY3RlZD1mYWxzZV1cbiAgICogQHBhcmFtIHtib29sZWFufSBbYXNQYXJlbnQ9ZmFsc2VdXG4gICAqIEByZXR1cm5zIGFuIE9iamVjdCBvZiAxKXJlbGF0aW9uOnRoZSByZWxhdGlvbiB3aXRoIHRoZSBhZGRlZCBlbGVtZW50IG5vZGUgaW4gKG5vZGVMaXN0MiksIDIpbm9kZTogdGhlIGNyZWF0ZWQgbm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYWRkVG9FeGlzdGluZ1JlbGF0aW9uQnlBcHAoXG4gICAgYXBwTmFtZSxcbiAgICByZWxhdGlvblR5cGUsXG4gICAgZWxlbWVudCxcbiAgICBpc0RpcmVjdGVkID0gZmFsc2UsXG4gICAgYXNQYXJlbnQgPSBmYWxzZVxuICApIHtcbiAgICBsZXQgcmVzID0ge31cbiAgICBsZXQgbm9kZTIgPSBudWxsXG4gICAgaWYgKHRoaXMucmVsYXRlZEdyYXBoLmhhc1Jlc2VydmF0aW9uQ3JlZGVudGlhbHMocmVsYXRpb25UeXBlLCBhcHBOYW1lKSkge1xuICAgICAgaWYgKHRoaXMucmVsYXRlZEdyYXBoLmNvbnRhaW5zQXBwKGFwcE5hbWUpKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5hcHBzW2FwcE5hbWVdICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgbGV0IGFwcFJlbGF0aW9ucyA9IHRoaXMuZ2V0UmVsYXRpb25zQnlBcHBOYW1lKGFwcE5hbWUpO1xuICAgICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBhcHBSZWxhdGlvbnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgICBjb25zdCByZWxhdGlvbiA9IGFwcFJlbGF0aW9uc1tpbmRleF07XG4gICAgICAgICAgICByZXMucmVsYXRpb24gPSByZWxhdGlvblxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICByZWxhdGlvbi50eXBlLmdldCgpID09PSByZWxhdGlvblR5cGUgJiZcbiAgICAgICAgICAgICAgaXNEaXJlY3RlZCA9PT0gcmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgIGlmIChpc0RpcmVjdGVkICYmIHRoaXMuaXNQYXJlbnQocmVsYXRpb24pKSB7XG4gICAgICAgICAgICAgICAgbm9kZTIgPSB0aGlzLnJlbGF0ZWRHcmFwaC5hZGROb2RlKGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIHJlcy5ub2RlID0gbm9kZTI7XG4gICAgICAgICAgICAgICAgaWYgKGFzUGFyZW50KSB7XG4gICAgICAgICAgICAgICAgICByZWxhdGlvbi5hZGROb2RldG9Ob2RlTGlzdDEobm9kZTIpO1xuICAgICAgICAgICAgICAgICAgbm9kZTIuYWRkRGlyZWN0ZWRSZWxhdGlvblBhcmVudChyZWxhdGlvbiwgYXBwTmFtZSk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICByZWxhdGlvbi5hZGROb2RldG9Ob2RlTGlzdDIobm9kZTIpO1xuICAgICAgICAgICAgICAgICAgbm9kZTIuYWRkRGlyZWN0ZWRSZWxhdGlvbkNoaWxkKHJlbGF0aW9uLCBhcHBOYW1lKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFpc0RpcmVjdGVkKSB7XG4gICAgICAgICAgICAgICAgbm9kZTIgPSB0aGlzLnJlbGF0ZWRHcmFwaC5hZGROb2RlKGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIHJlcy5ub2RlID0gbm9kZTI7XG4gICAgICAgICAgICAgICAgcmVsYXRpb24uYWRkTm9kZXRvTm9kZUxpc3QyKG5vZGUyKTtcbiAgICAgICAgICAgICAgICBub2RlMi5hZGROb25EaXJlY3RlZFJlbGF0aW9uKHJlbGF0aW9uLCBhcHBOYW1lKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmFkZFNpbXBsZVJlbGF0aW9uQnlBcHAoXG4gICAgICAgICAgYXBwTmFtZSxcbiAgICAgICAgICByZWxhdGlvblR5cGUsXG4gICAgICAgICAgZWxlbWVudCxcbiAgICAgICAgICBpc0RpcmVjdGVkXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKGFwcE5hbWUgKyBcIiBkb2VzIG5vdCBleGlzdFwiKTtcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICByZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVsYXRlZEdyYXBoLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuXG5cblxuICAvLyBhZGRSZWxhdGlvbjIoX3JlbGF0aW9uLCBfbmFtZSkge1xuICAvLyAgIGxldCBjbGFzc2lmeSA9IGZhbHNlO1xuICAvLyAgIGxldCBuYW1lID0gX3JlbGF0aW9uLnR5cGUuZ2V0KCk7XG4gIC8vICAgaWYgKHR5cGVvZiBfbmFtZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAvLyAgICAgbmFtZSA9IF9uYW1lO1xuICAvLyAgIH1cbiAgLy8gICBpZiAodHlwZW9mIHRoaXMucmVsYXRpb25zW19yZWxhdGlvbi50eXBlLmdldCgpXSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAvLyAgICAgaWYgKF9yZWxhdGlvbi5pc0RpcmVjdGVkLmdldCgpKSB7XG4gIC8vICAgICAgIGZvciAoXG4gIC8vICAgICAgICAgbGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLnJlbGF0aW9uc1tfcmVsYXRpb24udHlwZS5nZXQoKV0ubGVuZ3RoOyBpbmRleCsrXG4gIC8vICAgICAgICkge1xuICAvLyAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLnJlbGF0aW9uc1tfcmVsYXRpb24udHlwZS5nZXQoKV1baW5kZXhdO1xuICAvLyAgICAgICAgIGlmIChcbiAgLy8gICAgICAgICAgIFV0aWxpdGllcy5hcnJheXNFcXVhbChcbiAgLy8gICAgICAgICAgICAgX3JlbGF0aW9uLmdldE5vZGVMaXN0MUlkcygpLFxuICAvLyAgICAgICAgICAgICBlbGVtZW50LmdldE5vZGVMaXN0MUlkcygpXG4gIC8vICAgICAgICAgICApXG4gIC8vICAgICAgICAgKSB7XG4gIC8vICAgICAgICAgICBlbGVtZW50LmFkZE5vdEV4aXN0aW5nVmVydGljZXN0b05vZGVMaXN0MihfcmVsYXRpb24ubm9kZUxpc3QyKTtcbiAgLy8gICAgICAgICB9IGVsc2Uge1xuICAvLyAgICAgICAgICAgZWxlbWVudC5wdXNoKF9yZWxhdGlvbik7XG4gIC8vICAgICAgICAgICBjbGFzc2lmeSA9IHRydWU7XG4gIC8vICAgICAgICAgfVxuICAvLyAgICAgICB9XG4gIC8vICAgICB9IGVsc2Uge1xuICAvLyAgICAgICB0aGlzLnJlbGF0aW9uc1tfcmVsYXRpb24udHlwZS5nZXQoKV0uYWRkTm90RXhpc3RpbmdWZXJ0aWNlc3RvUmVsYXRpb24oXG4gIC8vICAgICAgICAgX3JlbGF0aW9uXG4gIC8vICAgICAgICk7XG4gIC8vICAgICB9XG4gIC8vICAgfSBlbHNlIHtcbiAgLy8gICAgIGlmIChfcmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKSkge1xuICAvLyAgICAgICBsZXQgbGlzdCA9IG5ldyBMc3QoKTtcbiAgLy8gICAgICAgbGlzdC5wdXNoKF9yZWxhdGlvbik7XG4gIC8vICAgICAgIHRoaXMucmVsYXRpb25zLmFkZF9hdHRyKHtcbiAgLy8gICAgICAgICBbbmFtZV06IGxpc3RcbiAgLy8gICAgICAgfSk7XG4gIC8vICAgICAgIHRoaXMuX2NsYXNzaWZ5UmVsYXRpb24oX3JlbGF0aW9uKTtcbiAgLy8gICAgIH0gZWxzZSB7XG4gIC8vICAgICAgIHRoaXMucmVsYXRpb25zLmFkZF9hdHRyKHtcbiAgLy8gICAgICAgICBbbmFtZV06IF9yZWxhdGlvblxuICAvLyAgICAgICB9KTtcbiAgLy8gICAgICAgY2xhc3NpZnkgPSB0cnVlO1xuICAvLyAgICAgfVxuICAvLyAgIH1cbiAgLy8gICBpZiAoY2xhc3NpZnkpIHRoaXMuX2NsYXNzaWZ5UmVsYXRpb24oX3JlbGF0aW9uKTtcbiAgLy8gfVxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9ufSBfcmVsYXRpb25cbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIF9jbGFzc2lmeVJlbGF0aW9uKF9yZWxhdGlvbikge1xuICAgIHRoaXMucmVsYXRlZEdyYXBoLmxvYWQocmVsYXRlZEdyYXBoID0+IHtcbiAgICAgIHJlbGF0ZWRHcmFwaC5fY2xhc3NpZnlSZWxhdGlvbihfcmVsYXRpb24pO1xuICAgIH0pO1xuICB9XG5cbiAgLy9UT0RPIDpOb3RXb3JraW5nXG4gIC8vIGFkZFJlbGF0aW9uKF9yZWxhdGlvbikge1xuICAvLyAgIHRoaXMuYWRkUmVsYXRpb24oX3JlbGF0aW9uKVxuICAvLyAgIHRoaXMucmVsYXRlZEdyYXBoLmxvYWQocmVsYXRlZEdyYXBoID0+IHtcbiAgLy8gICAgIHJlbGF0ZWRHcmFwaC5fYWRkTm90RXhpc3RpbmdWZXJ0aWNlc0Zyb21SZWxhdGlvbihfcmVsYXRpb24pXG4gIC8vICAgfSlcbiAgLy8gfVxuICAvL1RPRE8gOk5vdFdvcmtpbmdcbiAgLy8gYWRkUmVsYXRpb25zKF9yZWxhdGlvbnMpIHtcbiAgLy8gICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX3JlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgLy8gICAgIHRoaXMuYWRkUmVsYXRpb24oX3JlbGF0aW9uc1tpbmRleF0pO1xuICAvLyAgIH1cbiAgLy8gfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgYWxsIHRoZSByZWxhdGlvbnMgb2YgdGhpcyBOb2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBnZXRSZWxhdGlvbnMoKSB7XG4gICAgbGV0IHJlcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5yZWxhdGlvbnMuX2F0dHJpYnV0ZV9uYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgcmVsTGlzdCA9IHRoaXMucmVsYXRpb25zW3RoaXMucmVsYXRpb25zLl9hdHRyaWJ1dGVfbmFtZXNbaV1dO1xuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCByZWxMaXN0Lmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGNvbnN0IHJlbGF0aW9uID0gcmVsTGlzdFtqXTtcbiAgICAgICAgcmVzLnB1c2gocmVsYXRpb24pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZVxuICAgKiBAcmV0dXJucyBhbGwgcmVsYXRpb25zIG9mIGEgc3BlY2lmaWMgcmVsYXRpb24gdHlwZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgZ2V0UmVsYXRpb25zQnlUeXBlKHR5cGUpIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgaWYgKCF0eXBlLmluY2x1ZGVzKFwiPlwiLCB0eXBlLmxlbmd0aCAtIDIpICYmXG4gICAgICAhdHlwZS5pbmNsdWRlcyhcIjxcIiwgdHlwZS5sZW5ndGggLSAyKSAmJlxuICAgICAgIXR5cGUuaW5jbHVkZXMoXCItXCIsIHR5cGUubGVuZ3RoIC0gMilcbiAgICApIHtcbiAgICAgIGxldCB0MSA9IHR5cGUuY29uY2F0KFwiPlwiKTtcbiAgICAgIHJlcyA9IFV0aWxpdGllcy5jb25jYXQocmVzLCB0aGlzLmdldFJlbGF0aW9ucyh0MSkpO1xuICAgICAgbGV0IHQyID0gdHlwZS5jb25jYXQoXCI8XCIpO1xuICAgICAgcmVzID0gVXRpbGl0aWVzLmNvbmNhdChyZXMsIHRoaXMuZ2V0UmVsYXRpb25zKHQyKSk7XG4gICAgICBsZXQgdDMgPSB0eXBlLmNvbmNhdChcIi1cIik7XG4gICAgICByZXMgPSBVdGlsaXRpZXMuY29uY2F0KHJlcywgdGhpcy5nZXRSZWxhdGlvbnModDMpKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0aW9uc1t0eXBlXSAhPT0gXCJ1bmRlZmluZWRcIikgcmVzID0gdGhpcy5yZWxhdGlvbnNbXG4gICAgICB0eXBlXTtcbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAcmV0dXJucyBhbiBhcnJheSBvZiBhbGwgcmVsYXRpb25zIG9mIGEgc3BlY2lmaWMgYXBwIGZvciB0aGlzIG5vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGdldFJlbGF0aW9uc0J5QXBwTmFtZShhcHBOYW1lKSB7XG4gICAgbGV0IHJlcyA9IFtdO1xuICAgIGlmICh0aGlzLmhhc0FwcERlZmluZWQoYXBwTmFtZSkpIHtcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLmFwcHNbYXBwTmFtZV0uX2F0dHJpYnV0ZV9uYW1lcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgYXBwUmVsYXRpb24gPSB0aGlzLmFwcHNbYXBwTmFtZV1bdGhpcy5hcHBzW2FwcE5hbWVdLl9hdHRyaWJ1dGVfbmFtZXNbXG4gICAgICAgICAgaW5kZXhdXTtcbiAgICAgICAgcmVzLnB1c2goYXBwUmVsYXRpb24pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgLy8gLyoqXG4gIC8vICAqXG4gIC8vICAqXG4gIC8vICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gIC8vICAqIEByZXR1cm5zIGFuIG9iamVjdCBvZiBhbGwgcmVsYXRpb25zIG9mIGEgc3BlY2lmaWMgYXBwIGZvciB0aGlzIG5vZGVcbiAgLy8gICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgLy8gICovXG4gIC8vIGdldFJlbGF0aW9uc1dpdGhLZXlzQnlBcHBOYW1lKGFwcE5hbWUpIHtcbiAgLy8gICBpZiAodGhpcy5oYXNBcHBEZWZpbmVkKGFwcE5hbWUpKSB7XG4gIC8vICAgICByZXR1cm4gdGhpcy5hcHBzW2FwcE5hbWVdO1xuICAvLyAgIH1cbiAgLy8gfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxBcHBsaWNhdGlvbn0gYXBwXG4gICAqIEByZXR1cm5zIGFsbCByZWxhdGlvbnMgb2YgYSBzcGVjaWZpYyBhcHBcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGdldFJlbGF0aW9uc0J5QXBwKGFwcCkge1xuICAgIGxldCBhcHBOYW1lID0gYXBwLm5hbWUuZ2V0KClcbiAgICByZXR1cm4gdGhpcy5nZXRSZWxhdGlvbnNCeUFwcE5hbWUoYXBwTmFtZSlcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFwcE5hbWVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBhbGwgcmVsYXRpb25zIG9mIGEgc3BlY2lmaWMgYXBwIG9mIGEgc3BlY2lmaWMgdHlwZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgZ2V0UmVsYXRpb25zQnlBcHBOYW1lQnlUeXBlKGFwcE5hbWUsIHJlbGF0aW9uVHlwZSkge1xuICAgIGxldCByZXMgPSBbXTtcbiAgICBpZiAodGhpcy5oYXNSZWxhdGlvbkJ5QXBwQnlUeXBlRGVmaW5lZChhcHBOYW1lLCByZWxhdGlvblR5cGUpKSB7XG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5hcHBzW2FwcE5hbWVdLl9hdHRyaWJ1dGVfbmFtZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IGFwcFJlbGF0aW9uID0gdGhpcy5hcHBzW2FwcE5hbWVdW3RoaXMuYXBwc1thcHBOYW1lXS5fYXR0cmlidXRlX25hbWVzW1xuICAgICAgICAgIGluZGV4XV07XG4gICAgICAgIGlmIChhcHBSZWxhdGlvbi50eXBlLmdldCgpID09PSByZWxhdGlvblR5cGUpIHJlcy5wdXNoKGFwcFJlbGF0aW9uKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxBcHBsaWNhdGlvbn0gYXBwXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgYWxsIHJlbGF0aW9ucyBvZiBhIHNwZWNpZmljIGFwcCBvZiBhIHNwZWNpZmljIHR5cGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGdldFJlbGF0aW9uc0J5QXBwQnlUeXBlKGFwcCwgcmVsYXRpb25UeXBlKSB7XG4gICAgbGV0IGFwcE5hbWUgPSBhcHAubmFtZS5nZXQoKVxuICAgIHJldHVybiB0aGlzLmdldFJlbGF0aW9uc0J5QXBwTmFtZUJ5VHlwZShhcHBOYW1lLCByZWxhdGlvblR5cGUpXG5cbiAgfVxuICAvKipcbiAgICogIHZlcmlmeSBpZiBhbiBlbGVtZW50IGlzIGFscmVhZHkgaW4gZ2l2ZW4gbm9kZUxpc3RcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxOb2RlW119IF9ub2RlbGlzdFxuICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBpbk5vZGVMaXN0KF9ub2RlbGlzdCkge1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBfbm9kZWxpc3QubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gX25vZGVsaXN0W2luZGV4XTtcbiAgICAgIGlmIChlbGVtZW50LmlkLmdldCgpID09PSB0aGlzLmlkLmdldCgpKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy9UT0RPIGdldENoaWxkcmVuLCBnZXRQYXJlbnRcbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGUgLSBvcHRpb25hbFxuICAgKiBAcmV0dXJucyBhIGxpc3Qgb2YgbmVpZ2hib3JzIG5vZGVzIFxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgZ2V0TmVpZ2hib3JzKHJlbGF0aW9uVHlwZSkge1xuICAgIGxldCBuZWlnaGJvcnMgPSBbXTtcbiAgICBsZXQgcmVsYXRpb25zID0gdGhpcy5nZXRSZWxhdGlvbnMocmVsYXRpb25UeXBlKTtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcmVsYXRpb25zLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgcmVsYXRpb24gPSByZWxhdGlvbnNbaW5kZXhdO1xuICAgICAgaWYgKHJlbGF0aW9uLmlzRGlyZWN0ZWQuZ2V0KCkpIHtcbiAgICAgICAgaWYgKHRoaXMuaW5Ob2RlTGlzdChyZWxhdGlvbi5ub2RlTGlzdDEpKVxuICAgICAgICAgIG5laWdoYm9ycyA9IFV0aWxpdGllcy5jb25jYXQobmVpZ2hib3JzLCByZWxhdGlvbi5ub2RlTGlzdDIpO1xuICAgICAgICBlbHNlIG5laWdoYm9ycyA9IFV0aWxpdGllcy5jb25jYXQobmVpZ2hib3JzLCByZWxhdGlvbi5ub2RlTGlzdDEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmVpZ2hib3JzID0gVXRpbGl0aWVzLmNvbmNhdChcbiAgICAgICAgICBuZWlnaGJvcnMsXG4gICAgICAgICAgVXRpbGl0aWVzLmFsbEJ1dE1lQnlJZChyZWxhdGlvbi5ub2RlTGlzdDEpXG4gICAgICAgICk7XG4gICAgICAgIG5laWdoYm9ycyA9IFV0aWxpdGllcy5jb25jYXQoXG4gICAgICAgICAgbmVpZ2hib3JzLFxuICAgICAgICAgIFV0aWxpdGllcy5hbGxCdXRNZUJ5SWQocmVsYXRpb24ubm9kZUxpc3QyKVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmVpZ2hib3JzO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgYXJyYXkgb2Ygc3BpbmFsTm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgZ2V0Q2hpbGRyZW5CeVJlbGF0aW9uVHlwZShyZWxhdGlvblR5cGUpIHtcbiAgICBsZXQgcmVzID0gW11cbiAgICBpZiAodGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCI+XCJdKVxuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMucmVsYXRpb25zW3JlbGF0aW9uVHlwZSArIFwiPlwiXS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgcmVsYXRpb24gPSB0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIj5cIl1baW5kZXhdO1xuICAgICAgICBsZXQgbm9kZUxpc3QyID0gcmVsYXRpb24uZ2V0Tm9kZUxpc3QyKCk7XG4gICAgICAgIHJlcyA9IFV0aWxpdGllcy5jb25jYXQocmVzLCBub2RlTGlzdDIpXG4gICAgICB9XG4gICAgcmV0dXJuIHJlc1xuICB9XG5cbiAgLy9UT0RPXG4gIC8vIC8qKlxuICAvLyAgKlxuICAvLyAgKlxuICAvLyAgKiBAcGFyYW0ge3N0cmluZ3xTcGluYWxSZWxhdGlvbn0gcmVsYXRpb25cbiAgLy8gICogQHJldHVybnMgYm9vbGVhblxuICAvLyAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAvLyAgKi9cbiAgLy8gaXNQYXJlbnQocmVsYXRpb24pIHtcbiAgLy8gICBpZiAodHlwZW9mIHJlbGF0aW9uID09PSBcInN0cmluZ1wiKSB7XG4gIC8vICAgICBpZiAodHlwZW9mIHRoaXMucmVsYXRpb25zW3JlbGF0aW9uICsgXCI+XCJdICE9IFwidW5kZWZpbmVkXCIpIHtcbiAgLy8gICAgICAgbGV0IHJlbGF0aW9ucyA9IHRoaXMucmVsYXRpb25zW3JlbGF0aW9uICsgXCI+XCJdXG4gIC8vICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCByZWxhdGlvbnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gIC8vICAgICAgICAgY29uc3QgcmVsYXRpb24gPSByZWxhdGlvbnNbaW5kZXhdO1xuICAvLyAgICAgICAgIGxldCBub2RlTGlzdDEgPSByZWxhdGlvbi5nZXROb2RlTGlzdDEoKVxuICAvLyAgICAgICAgIHJldHVybiBVdGlsaXRpZXMuY29udGFpbnNMc3RCeUlkKG5vZGVMaXN0MSwgdGhpcylcbiAgLy8gICAgICAgfVxuICAvLyAgICAgfVxuICAvLyAgIH0gZWxzZSB7XG4gIC8vICAgICBsZXQgbm9kZUxpc3QxID0gcmVsYXRpb24uZ2V0Tm9kZUxpc3QxKClcbiAgLy8gICAgIHJldHVybiBVdGlsaXRpZXMuY29udGFpbnNMc3RCeUlkKG5vZGVMaXN0MSwgdGhpcylcbiAgLy8gICB9XG4gIC8vICAgcmV0dXJuIGZhbHNlO1xuICAvLyB9XG5cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb259IHJlbGF0aW9uXG4gICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGlzUGFyZW50KHJlbGF0aW9uKSB7XG4gICAgbGV0IG5vZGVMaXN0MSA9IHJlbGF0aW9uLmdldE5vZGVMaXN0MSgpXG4gICAgcmV0dXJuIFV0aWxpdGllcy5jb250YWluc0xzdEJ5SWQobm9kZUxpc3QxLCB0aGlzKVxuICB9XG5cbiAgLy9UT0RPXG4gIC8vIC8qKlxuICAvLyAgKlxuICAvLyAgKlxuICAvLyAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9ufSByZWxhdGlvblxuICAvLyAgKiBAcmV0dXJucyBib29sZWFuXG4gIC8vICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gIC8vICAqL1xuICAvLyBpc0NoaWxkKHJlbGF0aW9uKSB7XG4gIC8vICAgbGV0IG5vZGVMaXN0MiA9IHJlbGF0aW9uLmdldE5vZGVMaXN0MigpXG4gIC8vICAgcmV0dXJuIFV0aWxpdGllcy5jb250YWluc0xzdEJ5SWQobm9kZUxpc3QyLCB0aGlzKVxuICAvLyB9XG5cbiAgLy9UT0RPIE9wdGltaXplXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZyB8IFNwaW5hbEFwcGxpY2F0aW9ufSBhcHBOYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nIHwgU3BpbmFsUmVsYXRpb259IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBhcnJheSBvZiBzcGluYWxOb2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBnZXRDaGlsZHJlbkJ5QXBwQnlSZWxhdGlvbihhcHAsIHJlbGF0aW9uKSB7XG4gICAgbGV0IGFwcE5hbWUgPSBcIlwiXG4gICAgbGV0IHJlbGF0aW9uVHlwZSA9IFwiXCJcbiAgICBsZXQgcmVzID0gW11cbiAgICBpZiAodHlwZW9mIGFwcCAhPSBcInN0cmluZ1wiKVxuICAgICAgYXBwTmFtZSA9IGFwcC5uYW1lLmdldCgpXG4gICAgZWxzZVxuICAgICAgYXBwTmFtZSA9IGFwcFxuICAgIGlmICh0eXBlb2YgYXBwICE9IFwic3RyaW5nXCIpXG4gICAgICByZWxhdGlvblR5cGUgPSByZWxhdGlvbi5uYW1lLmdldCgpXG4gICAgZWxzZVxuICAgICAgcmVsYXRpb25UeXBlID0gcmVsYXRpb25cbiAgICBpZiAodHlwZW9mIHRoaXMuYXBwc1thcHBOYW1lXSAhPSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiB0aGlzLmFwcHNbXG4gICAgICAgIGFwcE5hbWVdW3JlbGF0aW9uVHlwZSArIFwiPlwiXSAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBsZXQgcmVsYXRpb25UbXAgPSB0aGlzLmFwcHNbYXBwTmFtZV1bcmVsYXRpb25UeXBlICsgXCI+XCJdXG4gICAgICBsZXQgbm9kZUxpc3QyID0gcmVsYXRpb25UbXAuZ2V0Tm9kZUxpc3QyKClcbiAgICAgIHJlcyA9IFV0aWxpdGllcy5jb25jYXQocmVzLCBub2RlTGlzdDIpXG4gICAgfVxuICAgIHJldHVybiByZXNcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZyB8IFNwaW5hbEFwcGxpY2F0aW9ufSBhcHBOYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nIHwgU3BpbmFsUmVsYXRpb259IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyAgQSBwcm9taXNlIG9mIGFuIGFycmF5IG9mIE1vZGVsc1xuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYXN5bmMgZ2V0Q2hpbGRyZW5FbGVtZW50c0J5QXBwQnlSZWxhdGlvbihhcHAsIHJlbGF0aW9uKSB7XG4gICAgbGV0IGFwcE5hbWUgPSBcIlwiXG4gICAgbGV0IHJlbGF0aW9uVHlwZSA9IFwiXCJcbiAgICBsZXQgcmVzID0gW11cbiAgICBpZiAodHlwZW9mIGFwcCAhPSBcInN0cmluZ1wiKVxuICAgICAgYXBwTmFtZSA9IGFwcC5uYW1lLmdldCgpXG4gICAgZWxzZVxuICAgICAgYXBwTmFtZSA9IGFwcFxuICAgIGlmICh0eXBlb2YgYXBwICE9IFwic3RyaW5nXCIpXG4gICAgICByZWxhdGlvblR5cGUgPSByZWxhdGlvbi5uYW1lLmdldCgpXG4gICAgZWxzZVxuICAgICAgcmVsYXRpb25UeXBlID0gcmVsYXRpb25cbiAgICBpZiAodHlwZW9mIHRoaXMuYXBwc1thcHBOYW1lXSAhPSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiB0aGlzLmFwcHNbXG4gICAgICAgIGFwcE5hbWVdW3JlbGF0aW9uVHlwZSArIFwiPlwiXSAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBsZXQgcmVsYXRpb25UbXAgPSB0aGlzLmFwcHNbYXBwTmFtZV1bcmVsYXRpb25UeXBlICsgXCI+XCJdXG4gICAgICBsZXQgbm9kZUxpc3QyID0gcmVsYXRpb25UbXAuZ2V0Tm9kZUxpc3QyKClcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBub2RlTGlzdDIubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBub2RlTGlzdDJbaW5kZXhdO1xuICAgICAgICByZXMucHVzaChhd2FpdCBub2RlLmdldEVsZW1lbnQoKSlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgQSBwcm9taXNlIG9mIGFuIGFycmF5IG9mIE1vZGVsc1xuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYXN5bmMgZ2V0Q2hpbGRyZW5FbGVtZW50c0J5UmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSkge1xuICAgIGxldCByZXMgPSBbXVxuICAgIGlmICh0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIj5cIl0pXG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCI+XCJdLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCByZWxhdGlvbiA9IHRoaXMucmVsYXRpb25zW3JlbGF0aW9uVHlwZSArIFwiPlwiXVtpbmRleF07XG4gICAgICAgIGxldCBub2RlTGlzdDIgPSByZWxhdGlvbi5nZXROb2RlTGlzdDIoKTtcbiAgICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IG5vZGVMaXN0Mi5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICBjb25zdCBub2RlID0gbm9kZUxpc3QyW2luZGV4XTtcbiAgICAgICAgICByZXMucHVzaChhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQobm9kZS5lbGVtZW50KSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIHJldHVybiByZXNcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEByZXR1cm5zIGFycmF5IG9mIHNwaW5hbE5vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGdldFBhcmVudHNCeVJlbGF0aW9uVHlwZShyZWxhdGlvblR5cGUpIHtcbiAgICBsZXQgcmVzID0gW11cbiAgICBpZiAodGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCI8XCJdKVxuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMucmVsYXRpb25zW3JlbGF0aW9uVHlwZSArIFwiPFwiXS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgcmVsYXRpb24gPSB0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIjxcIl1baW5kZXhdO1xuICAgICAgICBsZXQgbm9kZUxpc3QxID0gcmVsYXRpb24uZ2V0Tm9kZUxpc3QxKCk7XG4gICAgICAgIHJlcyA9IFV0aWxpdGllcy5jb25jYXQocmVzLCBub2RlTGlzdDEpXG4gICAgICB9XG4gICAgcmV0dXJuIHJlc1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9ufSBfcmVsYXRpb25cbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIHJlbW92ZVJlbGF0aW9uKF9yZWxhdGlvbikge1xuICAgIGxldCByZWxhdGlvbkxzdCA9IHRoaXMucmVsYXRpb25zW19yZWxhdGlvbi50eXBlLmdldCgpXTtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcmVsYXRpb25Mc3QubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCBjYW5kaWRhdGVSZWxhdGlvbiA9IHJlbGF0aW9uTHN0W2luZGV4XTtcbiAgICAgIGlmIChfcmVsYXRpb24uaWQuZ2V0KCkgPT09IGNhbmRpZGF0ZVJlbGF0aW9uLmlkLmdldCgpKVxuICAgICAgICByZWxhdGlvbkxzdC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbltdfSBfcmVsYXRpb25zXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICByZW1vdmVSZWxhdGlvbnMoX3JlbGF0aW9ucykge1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBfcmVsYXRpb25zLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgdGhpcy5yZW1vdmVSZWxhdGlvbihfcmVsYXRpb25zW2luZGV4XSk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICByZW1vdmVSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkocmVsYXRpb25UeXBlKSB8fCByZWxhdGlvblR5cGUgaW5zdGFuY2VvZiBMc3QpXG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcmVsYXRpb25UeXBlLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCB0eXBlID0gcmVsYXRpb25UeXBlW2luZGV4XTtcbiAgICAgICAgdGhpcy5yZWxhdGlvbnMucmVtX2F0dHIodHlwZSk7XG4gICAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLnJlbGF0aW9ucy5yZW1fYXR0cihyZWxhdGlvblR5cGUpO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFwcE5hbWVcbiAgICogQHJldHVybnMgYm9vbGVhblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgaGFzQXBwRGVmaW5lZChhcHBOYW1lKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLmFwcHNbYXBwTmFtZV0gIT09IFwidW5kZWZpbmVkXCIpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKFwiYXBwIFwiICsgYXBwTmFtZSArXG4gICAgICAgIFwiIGlzIG5vdCBkZWZpbmVkIGZvciBub2RlIFwiICsgdGhpcy5uYW1lLmdldCgpKTtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFwcE5hbWVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBib29sZWFuIFxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgaGFzUmVsYXRpb25CeUFwcEJ5VHlwZURlZmluZWQoYXBwTmFtZSwgcmVsYXRpb25UeXBlKSB7XG4gICAgaWYgKHRoaXMuaGFzQXBwRGVmaW5lZChhcHBOYW1lKSAmJiB0eXBlb2YgdGhpcy5hcHBzW2FwcE5hbWVdW1xuICAgICAgICByZWxhdGlvblR5cGVcbiAgICAgIF0gIT09XG4gICAgICBcInVuZGVmaW5lZFwiKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICBlbHNlIHtcbiAgICAgIGNvbnNvbGUud2FybihcInJlbGF0aW9uIFwiICsgcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgaXMgbm90IGRlZmluZWQgZm9yIG5vZGUgXCIgKyB0aGlzLm5hbWUuZ2V0KCkgK1xuICAgICAgICBcIiBmb3IgYXBwbGljYXRpb24gXCIgKyBhcHBOYW1lKTtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgQSBqc29uIHJlcHJlc2VudGluZyB0aGUgbm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgdG9Kc29uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpZDogdGhpcy5pZC5nZXQoKSxcbiAgICAgIG5hbWU6IHRoaXMubmFtZS5nZXQoKSxcbiAgICAgIGVsZW1lbnQ6IG51bGxcbiAgICB9O1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyBBIGpzb24gcmVwcmVzZW50aW5nIHRoZSBub2RlIHdpdGggaXRzIHJlbGF0aW9uc1xuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgdG9Kc29uV2l0aFJlbGF0aW9ucygpIHtcbiAgICBsZXQgcmVsYXRpb25zID0gW107XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMuZ2V0UmVsYXRpb25zKCkubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCByZWxhdGlvbiA9IHRoaXMuZ2V0UmVsYXRpb25zKClbaW5kZXhdO1xuICAgICAgcmVsYXRpb25zLnB1c2gocmVsYXRpb24udG9Kc29uKCkpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IHRoaXMuaWQuZ2V0KCksXG4gICAgICBuYW1lOiB0aGlzLm5hbWUuZ2V0KCksXG4gICAgICBlbGVtZW50OiBudWxsLFxuICAgICAgcmVsYXRpb25zOiByZWxhdGlvbnNcbiAgICB9O1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyBBbiBJRkMgbGlrZSBmb3JtYXQgcmVwcmVzZW50aW5nIHRoZSBub2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhc3luYyB0b0lmYygpIHtcbiAgICBsZXQgZWxlbWVudCA9IGF3YWl0IFV0aWxpdGllcy5wcm9taXNlTG9hZCh0aGlzLmVsZW1lbnQpO1xuICAgIHJldHVybiBlbGVtZW50LnRvSWZjKCk7XG4gIH1cbn1cbmV4cG9ydCBkZWZhdWx0IFNwaW5hbE5vZGVcbnNwaW5hbENvcmUucmVnaXN0ZXJfbW9kZWxzKFtTcGluYWxOb2RlXSk7Il19