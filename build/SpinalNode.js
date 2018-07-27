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
   * @param {Model| SpinalNode} element - Model:any subclass of Model
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
                if (element.constructor.name != "SpinalNode") node2 = this.relatedGraph.addNode(element);
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
        if (appRelation.type.get() === relationType) res.push(appRelation);else if (!appRelation.isDirected.get() && appRelation.type.get() + "-" === relationType) res.push(appRelation);else if (appRelation.type.get() + ">" === relationType) res.push(appRelation);else if (appRelation.type.get() + "<" === relationType) res.push(appRelation);
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
    if (this.hasAppDefined(appName) && typeof this.apps[appName][relationType] !== "undefined" || this.hasAppDefined(appName) && typeof this.apps[appName][relationType + "-"] !== "undefined" || this.hasAppDefined(appName) && typeof this.apps[appName][relationType + ">"] !== "undefined" || this.hasAppDefined(appName) && typeof this.apps[appName][relationType + "<"] !== "undefined") return true;else {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TcGluYWxOb2RlLmpzIl0sIm5hbWVzIjpbInNwaW5hbENvcmUiLCJyZXF1aXJlIiwiZ2xvYmFsVHlwZSIsIndpbmRvdyIsImdsb2JhbCIsImdldFZpZXdlciIsInYiLCJTcGluYWxOb2RlIiwiTW9kZWwiLCJjb25zdHJ1Y3RvciIsIl9uYW1lIiwiZWxlbWVudCIsInJlbGF0ZWRHcmFwaCIsInJlbGF0aW9ucyIsIm5hbWUiLCJGaWxlU3lzdGVtIiwiX3NpZ19zZXJ2ZXIiLCJhZGRfYXR0ciIsImlkIiwiVXRpbGl0aWVzIiwiZ3VpZCIsIlB0ciIsImFwcHMiLCJjbGFzc2lmeU5vZGUiLCJBcnJheSIsImlzQXJyYXkiLCJMc3QiLCJhZGRSZWxhdGlvbnMiLCJhZGRSZWxhdGlvbiIsInNldFR5cGUiLCJ0eXBlIiwiZ2V0QXBwc05hbWVzIiwiX2F0dHJpYnV0ZV9uYW1lcyIsImdldEVsZW1lbnQiLCJwcm9taXNlTG9hZCIsImdldEFwcHMiLCJyZXMiLCJpbmRleCIsImxlbmd0aCIsImFwcE5hbWUiLCJwdXNoIiwiYXBwc0xpc3QiLCJoYXNSZWxhdGlvbiIsImFkZERpcmVjdGVkUmVsYXRpb25QYXJlbnQiLCJyZWxhdGlvbiIsImdldCIsImNvbmNhdCIsImFkZFJlbGF0aW9uQnlBcHAiLCJhZGREaXJlY3RlZFJlbGF0aW9uQ2hpbGQiLCJhZGROb25EaXJlY3RlZFJlbGF0aW9uIiwiaXNSZXNlcnZlZCIsIm5hbWVUbXAiLCJsaXN0IiwiY29uc29sZSIsImxvZyIsInJlc2VydmVkUmVsYXRpb25zTmFtZXMiLCJoYXNSZXNlcnZhdGlvbkNyZWRlbnRpYWxzIiwiY29udGFpbnNBcHAiLCJlcnJvciIsImFkZFNpbXBsZVJlbGF0aW9uIiwicmVsYXRpb25UeXBlIiwiaXNEaXJlY3RlZCIsIm5vZGUyIiwiYWRkTm9kZSIsIm5vZGUiLCJyZWwiLCJTcGluYWxSZWxhdGlvbiIsImFkZFNpbXBsZVJlbGF0aW9uQnlBcHAiLCJhZGRUb0V4aXN0aW5nUmVsYXRpb24iLCJhc1BhcmVudCIsImV4aXN0aW5nUmVsYXRpb25zIiwiZ2V0UmVsYXRpb25zIiwiaXNQYXJlbnQiLCJhZGROb2RldG9Ob2RlTGlzdDEiLCJhZGROb2RldG9Ob2RlTGlzdDIiLCJhZGRUb0V4aXN0aW5nUmVsYXRpb25CeUFwcCIsImFwcFJlbGF0aW9ucyIsImdldFJlbGF0aW9uc0J5QXBwTmFtZSIsIl9jbGFzc2lmeVJlbGF0aW9uIiwiX3JlbGF0aW9uIiwibG9hZCIsImkiLCJyZWxMaXN0IiwiaiIsImdldFJlbGF0aW9uc0J5VHlwZSIsImluY2x1ZGVzIiwidDEiLCJ0MiIsInQzIiwiaGFzQXBwRGVmaW5lZCIsImFwcFJlbGF0aW9uIiwiZ2V0UmVsYXRpb25zQnlBcHAiLCJhcHAiLCJnZXRSZWxhdGlvbnNCeUFwcE5hbWVCeVR5cGUiLCJoYXNSZWxhdGlvbkJ5QXBwQnlUeXBlRGVmaW5lZCIsImdldFJlbGF0aW9uc0J5QXBwQnlUeXBlIiwiaW5Ob2RlTGlzdCIsIl9ub2RlbGlzdCIsImdldE5laWdoYm9ycyIsIm5laWdoYm9ycyIsIm5vZGVMaXN0MSIsIm5vZGVMaXN0MiIsImFsbEJ1dE1lQnlJZCIsImdldENoaWxkcmVuQnlSZWxhdGlvblR5cGUiLCJnZXROb2RlTGlzdDIiLCJnZXROb2RlTGlzdDEiLCJjb250YWluc0xzdEJ5SWQiLCJnZXRDaGlsZHJlbkJ5QXBwQnlSZWxhdGlvbiIsInJlbGF0aW9uVG1wIiwiZ2V0Q2hpbGRyZW5FbGVtZW50c0J5QXBwQnlSZWxhdGlvbiIsImdldENoaWxkcmVuRWxlbWVudHNCeVJlbGF0aW9uVHlwZSIsImdldFBhcmVudHNCeVJlbGF0aW9uVHlwZSIsInJlbW92ZVJlbGF0aW9uIiwicmVsYXRpb25Mc3QiLCJjYW5kaWRhdGVSZWxhdGlvbiIsInNwbGljZSIsInJlbW92ZVJlbGF0aW9ucyIsIl9yZWxhdGlvbnMiLCJyZW1vdmVSZWxhdGlvblR5cGUiLCJyZW1fYXR0ciIsIndhcm4iLCJ0b0pzb24iLCJ0b0pzb25XaXRoUmVsYXRpb25zIiwidG9JZmMiLCJyZWdp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QkFGVyxHQUVXTixPQUZ4QjtBQUdBLGFBQU8sS0FBUDtBQUNEO0FBQ0Y7QUFDRDs7Ozs7O0FBTUFrRixXQUFTO0FBQ1AsV0FBTztBQUNMdkcsVUFBSSxLQUFLQSxFQUFMLENBQVEyQixHQUFSLEVBREM7QUFFTC9CLFlBQU0sS0FBS0EsSUFBTCxDQUFVK0IsR0FBVixFQUZEO0FBR0xsQyxlQUFTO0FBSEosS0FBUDtBQUtEO0FBQ0Q7Ozs7OztBQU1BK0csd0JBQXNCO0FBQ3BCLFFBQUk3RyxZQUFZLEVBQWhCO0FBQ0EsU0FBSyxJQUFJd0IsUUFBUSxDQUFqQixFQUFvQkEsUUFBUSxLQUFLa0MsWUFBTCxHQUFvQmpDLE1BQWhELEVBQXdERCxPQUF4RCxFQUFpRTtBQUMvRCxZQUFNTyxXQUFXLEtBQUsyQixZQUFMLEdBQW9CbEMsS0FBcEIsQ0FBakI7QUFDQXhCLGdCQUFVMkIsSUFBVixDQUFlSSxTQUFTNkUsTUFBVCxFQUFmO0FBQ0Q7QUFDRCxXQUFPO0FBQ0x2RyxVQUFJLEtBQUtBLEVBQUwsQ0FBUTJCLEdBQVIsRUFEQztBQUVML0IsWUFBTSxLQUFLQSxJQUFMLENBQVUrQixHQUFWLEVBRkQ7QUFHTGxDLGVBQVMsSUFISjtBQUlMRSxpQkFBV0E7QUFKTixLQUFQO0FBTUQ7QUFDRDs7Ozs7O0FBTUEsUUFBTThHLEtBQU4sR0FBYztBQUNaLFFBQUloSCxVQUFVLE1BQU1RLHFCQUFVZSxXQUFWLENBQXNCLEtBQUt2QixPQUEzQixDQUFwQjtBQUNBLFdBQU9BLFFBQVFnSCxLQUFSLEVBQVA7QUFDRDtBQS83QnVDO2tCQWk4QjNCcEgsVTs7QUFDZlAsV0FBVzRILGVBQVgsQ0FBMkIsQ0FBQ3JILFVBQUQsQ0FBM0IiLCJmaWxlIjoiU3BpbmFsTm9kZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHNwaW5hbENvcmUgPSByZXF1aXJlKFwic3BpbmFsLWNvcmUtY29ubmVjdG9yanNcIik7XG5jb25zdCBnbG9iYWxUeXBlID0gdHlwZW9mIHdpbmRvdyA9PT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHdpbmRvdztcbmltcG9ydCBTcGluYWxSZWxhdGlvbiBmcm9tIFwiLi9TcGluYWxSZWxhdGlvblwiO1xubGV0IGdldFZpZXdlciA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gZ2xvYmFsVHlwZS52O1xufTtcblxuaW1wb3J0IHtcbiAgVXRpbGl0aWVzXG59IGZyb20gXCIuL1V0aWxpdGllc1wiO1xuLyoqXG4gKlxuICpcbiAqIEBleHBvcnRcbiAqIEBjbGFzcyBTcGluYWxOb2RlXG4gKiBAZXh0ZW5kcyB7TW9kZWx9XG4gKi9cbmNsYXNzIFNwaW5hbE5vZGUgZXh0ZW5kcyBnbG9iYWxUeXBlLk1vZGVsIHtcbiAgLyoqXG4gICAqQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBTcGluYWxOb2RlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0ge01vZGVsfSBlbGVtZW50IC0gYW55IHN1YmNsYXNzIG9mIE1vZGVsXG4gICAqIEBwYXJhbSB7U3BpbmFsR3JhcGh9IHJlbGF0ZWRHcmFwaFxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9uW119IHJlbGF0aW9uc1xuICAgKiBAcGFyYW0ge3N0cmluZ30gW25hbWU9XCJTcGluYWxOb2RlXCJdXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBjb25zdHJ1Y3RvcihfbmFtZSwgZWxlbWVudCwgcmVsYXRlZEdyYXBoLCByZWxhdGlvbnMsIG5hbWUgPSBcIlNwaW5hbE5vZGVcIikge1xuICAgIHN1cGVyKCk7XG4gICAgaWYgKEZpbGVTeXN0ZW0uX3NpZ19zZXJ2ZXIpIHtcbiAgICAgIHRoaXMuYWRkX2F0dHIoe1xuICAgICAgICBpZDogVXRpbGl0aWVzLmd1aWQodGhpcy5jb25zdHJ1Y3Rvci5uYW1lKSxcbiAgICAgICAgbmFtZTogX25hbWUsXG4gICAgICAgIGVsZW1lbnQ6IG5ldyBQdHIoZWxlbWVudCksXG4gICAgICAgIHJlbGF0aW9uczogbmV3IE1vZGVsKCksXG4gICAgICAgIGFwcHM6IG5ldyBNb2RlbCgpLFxuICAgICAgICByZWxhdGVkR3JhcGg6IHJlbGF0ZWRHcmFwaFxuICAgICAgfSk7XG4gICAgICBpZiAodHlwZW9mIHRoaXMucmVsYXRlZEdyYXBoICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHRoaXMucmVsYXRlZEdyYXBoLmNsYXNzaWZ5Tm9kZSh0aGlzKTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgcmVsYXRpb25zICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHJlbGF0aW9ucykgfHwgcmVsYXRpb25zIGluc3RhbmNlb2YgTHN0KVxuICAgICAgICAgIHRoaXMuYWRkUmVsYXRpb25zKHJlbGF0aW9ucyk7XG4gICAgICAgIGVsc2UgdGhpcy5hZGRSZWxhdGlvbihyZWxhdGlvbnMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIHNldFR5cGUodHlwZSkge1xuICAgIGlmICh0eXBlb2YgdGhpcy50eXBlID09PSBcInVuZGVmaW5lZFwiKVxuICAgICAgdGhpcy5hZGRfYXR0cih7XG4gICAgICAgIHR5cGU6IHR5cGVcbiAgICAgIH0pXG4gICAgZWxzZVxuICAgICAgdGhpcy50eXBlID0gdHlwZVxuICB9XG5cbiAgLy8gcmVnaXN0ZXJBcHAoYXBwKSB7XG4gIC8vICAgdGhpcy5hcHBzLmFkZF9hdHRyKHtcbiAgLy8gICAgIFthcHAubmFtZS5nZXQoKV06IG5ldyBQdHIoYXBwKVxuICAvLyAgIH0pXG4gIC8vIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEByZXR1cm5zIGFsbCBhcHBsaWNhdGlvbnMgbmFtZXMgYXMgc3RyaW5nXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBnZXRBcHBzTmFtZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuYXBwcy5fYXR0cmlidXRlX25hbWVzO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyBBIHByb21pc2Ugb2YgdGhlIHJlbGF0ZWQgRWxlbWVudCBcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGFzeW5jIGdldEVsZW1lbnQoKSB7XG4gICAgcmV0dXJuIGF3YWl0IFV0aWxpdGllcy5wcm9taXNlTG9hZCh0aGlzLmVsZW1lbnQpXG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEByZXR1cm5zIGFsbCBhcHBsaWNhdGlvbnNcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGFzeW5jIGdldEFwcHMoKSB7XG4gICAgbGV0IHJlcyA9IFtdXG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMuYXBwcy5fYXR0cmlidXRlX25hbWVzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgYXBwTmFtZSA9IHRoaXMuYXBwcy5fYXR0cmlidXRlX25hbWVzW2luZGV4XTtcbiAgICAgIHJlcy5wdXNoKGF3YWl0IFV0aWxpdGllcy5wcm9taXNlTG9hZCh0aGlzLnJlbGF0ZWRHcmFwaC5hcHBzTGlzdFtcbiAgICAgICAgYXBwTmFtZV0pKVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIC8vIC8qKlxuICAvLyAgKlxuICAvLyAgKlxuICAvLyAgKiBAcGFyYW0geyp9IHJlbGF0aW9uVHlwZVxuICAvLyAgKiBAcGFyYW0geyp9IHJlbGF0aW9uXG4gIC8vICAqIEBwYXJhbSB7Kn0gYXNQYXJlbnRcbiAgLy8gICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgLy8gICovXG4gIC8vIGNoYW5nZURlZmF1bHRSZWxhdGlvbihyZWxhdGlvblR5cGUsIHJlbGF0aW9uLCBhc1BhcmVudCkge1xuICAvLyAgICAgaWYgKHJlbGF0aW9uLmlzRGlyZWN0ZWQuZ2V0KCkpIHtcbiAgLy8gICAgICAgaWYgKGFzUGFyZW50KSB7XG4gIC8vICAgICAgICAgVXRpbGl0aWVzLnB1dE9uVG9wTHN0KHRoaXMucmVsYXRpb25zW3JlbGF0aW9uVHlwZSArIFwiPlwiXSwgcmVsYXRpb24pO1xuICAvLyAgICAgICB9IGVsc2Uge1xuICAvLyAgICAgICAgIFV0aWxpdGllcy5wdXRPblRvcExzdCh0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIjxcIl0sIHJlbGF0aW9uKTtcbiAgLy8gICAgICAgfVxuICAvLyAgICAgfSBlbHNlIHtcbiAgLy8gICAgICAgVXRpbGl0aWVzLnB1dE9uVG9wTHN0KHRoaXMucmVsYXRpb25zW3JlbGF0aW9uVHlwZSArIFwiLVwiXSwgcmVsYXRpb24pO1xuICAvLyAgICAgfVxuICAvLyAgIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGhhc1JlbGF0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnJlbGF0aW9ucy5sZW5ndGggIT09IDA7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb259IHJlbGF0aW9uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhZGREaXJlY3RlZFJlbGF0aW9uUGFyZW50KHJlbGF0aW9uLCBhcHBOYW1lKSB7XG4gICAgbGV0IG5hbWUgPSByZWxhdGlvbi50eXBlLmdldCgpO1xuICAgIG5hbWUgPSBuYW1lLmNvbmNhdChcIj5cIik7XG4gICAgaWYgKHR5cGVvZiBhcHBOYW1lID09PSBcInVuZGVmaW5lZFwiKSB0aGlzLmFkZFJlbGF0aW9uKHJlbGF0aW9uLCBuYW1lKTtcbiAgICBlbHNlIHRoaXMuYWRkUmVsYXRpb25CeUFwcChyZWxhdGlvbiwgbmFtZSwgYXBwTmFtZSk7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb259IHJlbGF0aW9uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhZGREaXJlY3RlZFJlbGF0aW9uQ2hpbGQocmVsYXRpb24sIGFwcE5hbWUpIHtcbiAgICBsZXQgbmFtZSA9IHJlbGF0aW9uLnR5cGUuZ2V0KCk7XG4gICAgbmFtZSA9IG5hbWUuY29uY2F0KFwiPFwiKTtcbiAgICBpZiAodHlwZW9mIGFwcE5hbWUgPT09IFwidW5kZWZpbmVkXCIpIHRoaXMuYWRkUmVsYXRpb24ocmVsYXRpb24sIG5hbWUpO1xuICAgIGVsc2UgdGhpcy5hZGRSZWxhdGlvbkJ5QXBwKHJlbGF0aW9uLCBuYW1lLCBhcHBOYW1lKTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbn0gcmVsYXRpb25cbiAgICogQHBhcmFtIHtzdHJpbmd9IGFwcE5hbWVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGFkZE5vbkRpcmVjdGVkUmVsYXRpb24ocmVsYXRpb24sIGFwcE5hbWUpIHtcbiAgICBsZXQgbmFtZSA9IHJlbGF0aW9uLnR5cGUuZ2V0KCk7XG4gICAgbmFtZSA9IG5hbWUuY29uY2F0KFwiLVwiKTtcbiAgICBpZiAodHlwZW9mIGFwcE5hbWUgPT09IFwidW5kZWZpbmVkXCIpIHRoaXMuYWRkUmVsYXRpb24ocmVsYXRpb24sIG5hbWUpO1xuICAgIGVsc2UgdGhpcy5hZGRSZWxhdGlvbkJ5QXBwKHJlbGF0aW9uLCBuYW1lLCBhcHBOYW1lKTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbn0gcmVsYXRpb25cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGFkZFJlbGF0aW9uKHJlbGF0aW9uLCBuYW1lKSB7XG4gICAgaWYgKCF0aGlzLnJlbGF0ZWRHcmFwaC5pc1Jlc2VydmVkKHJlbGF0aW9uLnR5cGUuZ2V0KCkpKSB7XG4gICAgICBsZXQgbmFtZVRtcCA9IHJlbGF0aW9uLnR5cGUuZ2V0KCk7XG4gICAgICBpZiAodHlwZW9mIG5hbWUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgbmFtZVRtcCA9IG5hbWU7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHRoaXMucmVsYXRpb25zW25hbWVUbXBdICE9PSBcInVuZGVmaW5lZFwiKVxuICAgICAgICB0aGlzLnJlbGF0aW9uc1tuYW1lVG1wXS5wdXNoKHJlbGF0aW9uKTtcbiAgICAgIGVsc2Uge1xuICAgICAgICBsZXQgbGlzdCA9IG5ldyBMc3QoKTtcbiAgICAgICAgbGlzdC5wdXNoKHJlbGF0aW9uKTtcbiAgICAgICAgdGhpcy5yZWxhdGlvbnMuYWRkX2F0dHIoe1xuICAgICAgICAgIFtuYW1lVG1wXTogbGlzdFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIHJlbGF0aW9uLnR5cGUuZ2V0KCkgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVsYXRlZEdyYXBoLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb24udHlwZS5nZXQoKV1cbiAgICAgICk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9ufSByZWxhdGlvblxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtcmVsYXRpb24gTmFtZSBpZiBub3Qgb3JnaW5hbGx5IGRlZmluZWRcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFwcE5hbWVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGFkZFJlbGF0aW9uQnlBcHAocmVsYXRpb24sIG5hbWUsIGFwcE5hbWUpIHtcbiAgICBpZiAodGhpcy5yZWxhdGVkR3JhcGguaGFzUmVzZXJ2YXRpb25DcmVkZW50aWFscyhyZWxhdGlvbi50eXBlLmdldCgpLFxuICAgICAgICBhcHBOYW1lKSkge1xuICAgICAgaWYgKHRoaXMucmVsYXRlZEdyYXBoLmNvbnRhaW5zQXBwKGFwcE5hbWUpKSB7XG4gICAgICAgIGxldCBuYW1lVG1wID0gcmVsYXRpb24udHlwZS5nZXQoKTtcbiAgICAgICAgaWYgKHR5cGVvZiBuYW1lICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgbmFtZVRtcCA9IG5hbWU7XG4gICAgICAgICAgLy8gcmVsYXRpb24ubmFtZS5zZXQobmFtZVRtcClcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHRoaXMucmVsYXRpb25zW25hbWVUbXBdICE9PSBcInVuZGVmaW5lZFwiKVxuICAgICAgICAgIHRoaXMucmVsYXRpb25zW25hbWVUbXBdLnB1c2gocmVsYXRpb24pO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBsZXQgbGlzdCA9IG5ldyBMc3QoKTtcbiAgICAgICAgICBsaXN0LnB1c2gocmVsYXRpb24pO1xuICAgICAgICAgIHRoaXMucmVsYXRpb25zLmFkZF9hdHRyKHtcbiAgICAgICAgICAgIFtuYW1lVG1wXTogbGlzdFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5hcHBzW2FwcE5hbWVdICE9PSBcInVuZGVmaW5lZFwiKVxuICAgICAgICAgIHRoaXMuYXBwc1thcHBOYW1lXS5hZGRfYXR0cih7XG4gICAgICAgICAgICBbbmFtZVRtcF06IHJlbGF0aW9uXG4gICAgICAgICAgfSk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGxldCBsaXN0ID0gbmV3IE1vZGVsKCk7XG4gICAgICAgICAgbGlzdC5hZGRfYXR0cih7XG4gICAgICAgICAgICBbbmFtZVRtcF06IHJlbGF0aW9uXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5hcHBzLmFkZF9hdHRyKHtcbiAgICAgICAgICAgIFthcHBOYW1lXTogbGlzdFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKGFwcE5hbWUgKyBcIiBkb2VzIG5vdCBleGlzdFwiKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIHJlbGF0aW9uLnR5cGUuZ2V0KCkgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVsYXRlZEdyYXBoLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb24udHlwZS5nZXQoKV1cbiAgICAgICk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEBwYXJhbSB7TW9kZWx9IGVsZW1lbnQgLSBhbmQgc3ViY2xhc3Mgb2YgTW9kZWxcbiAgICogQHBhcmFtIHtib29sZWFufSBbaXNEaXJlY3RlZD1mYWxzZV1cbiAgICogQHJldHVybnMgdGhlIGNyZWF0ZWQgcmVsYXRpb24sIHVuZGVmaW5lZCBvdGhlcndpc2VcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGFkZFNpbXBsZVJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgZWxlbWVudCwgaXNEaXJlY3RlZCA9IGZhbHNlKSB7XG4gICAgaWYgKCF0aGlzLnJlbGF0ZWRHcmFwaC5pc1Jlc2VydmVkKHJlbGF0aW9uVHlwZSkpIHtcbiAgICAgIGxldCByZXMgPSB7fVxuICAgICAgbGV0IG5vZGUyID0gdGhpcy5yZWxhdGVkR3JhcGguYWRkTm9kZShlbGVtZW50KTtcbiAgICAgIHJlcy5ub2RlID0gbm9kZTJcbiAgICAgIGxldCByZWwgPSBuZXcgU3BpbmFsUmVsYXRpb24ocmVsYXRpb25UeXBlLCBbdGhpc10sIFtub2RlMl0sXG4gICAgICAgIGlzRGlyZWN0ZWQpO1xuICAgICAgcmVzLnJlbGF0aW9uID0gcmVsXG4gICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5hZGRSZWxhdGlvbihyZWwpO1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIHJlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGlzIHJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5yZWxhdGVkR3JhcGgucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvblR5cGVdXG4gICAgICApO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFwcE5hbWVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcGFyYW0ge01vZGVsfSBlbGVtZW50XG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGlyZWN0ZWQ9ZmFsc2VdXG4gICAqIEByZXR1cm5zIHRoZSBjcmVhdGVkIHJlbGF0aW9uXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhZGRTaW1wbGVSZWxhdGlvbkJ5QXBwKGFwcE5hbWUsIHJlbGF0aW9uVHlwZSwgZWxlbWVudCwgaXNEaXJlY3RlZCA9IGZhbHNlKSB7XG4gICAgaWYgKHRoaXMucmVsYXRlZEdyYXBoLmhhc1Jlc2VydmF0aW9uQ3JlZGVudGlhbHMocmVsYXRpb25UeXBlLCBhcHBOYW1lKSkge1xuICAgICAgaWYgKHRoaXMucmVsYXRlZEdyYXBoLmNvbnRhaW5zQXBwKGFwcE5hbWUpKSB7XG4gICAgICAgIGxldCByZXMgPSB7fVxuICAgICAgICBsZXQgbm9kZTIgPSB0aGlzLnJlbGF0ZWRHcmFwaC5hZGROb2RlKGVsZW1lbnQpO1xuICAgICAgICByZXMubm9kZSA9IG5vZGUyXG4gICAgICAgIGxldCByZWwgPSBuZXcgU3BpbmFsUmVsYXRpb24ocmVsYXRpb25UeXBlLCBbdGhpc10sIFtub2RlMl0sXG4gICAgICAgICAgaXNEaXJlY3RlZCk7XG4gICAgICAgIHJlcy5yZWxhdGlvbiA9IHJlbFxuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5hZGRSZWxhdGlvbihyZWwsIGFwcE5hbWUpO1xuICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihhcHBOYW1lICsgXCIgZG9lcyBub3QgZXhpc3RcIik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICByZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVsYXRlZEdyYXBoLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHBhcmFtIHtNb2RlbH0gZWxlbWVudCAtIGFueSBzdWJjbGFzcyBvZiBNb2RlbFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0RpcmVjdGVkPWZhbHNlXVxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFthc1BhcmVudD1mYWxzZV1cbiAgICogQHJldHVybnMgYW4gT2JqZWN0IG9mIDEpcmVsYXRpb246dGhlIHJlbGF0aW9uIHdpdGggdGhlIGFkZGVkIGVsZW1lbnQgbm9kZSBpbiAobm9kZUxpc3QyKSwgMilub2RlOiB0aGUgY3JlYXRlZCBub2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhZGRUb0V4aXN0aW5nUmVsYXRpb24oXG4gICAgcmVsYXRpb25UeXBlLFxuICAgIGVsZW1lbnQsXG4gICAgaXNEaXJlY3RlZCA9IGZhbHNlLFxuICAgIGFzUGFyZW50ID0gZmFsc2VcbiAgKSB7XG4gICAgbGV0IHJlcyA9IHt9XG4gICAgaWYgKCF0aGlzLnJlbGF0ZWRHcmFwaC5pc1Jlc2VydmVkKHJlbGF0aW9uVHlwZSkpIHtcbiAgICAgIGxldCBleGlzdGluZ1JlbGF0aW9ucyA9IHRoaXMuZ2V0UmVsYXRpb25zKCk7XG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgZXhpc3RpbmdSZWxhdGlvbnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IHJlbGF0aW9uID0gZXhpc3RpbmdSZWxhdGlvbnNbaW5kZXhdO1xuICAgICAgICByZXMucmVsYXRpb24gPSByZWxhdGlvblxuICAgICAgICBpZiAoXG4gICAgICAgICAgcmVsYXRpb25UeXBlID09PSByZWxhdGlvblR5cGUgJiZcbiAgICAgICAgICBpc0RpcmVjdGVkID09PSByZWxhdGlvbi5pc0RpcmVjdGVkLmdldCgpXG4gICAgICAgICkge1xuICAgICAgICAgIGlmIChpc0RpcmVjdGVkICYmIHRoaXMuaXNQYXJlbnQocmVsYXRpb24pKSB7XG4gICAgICAgICAgICBub2RlMiA9IHRoaXMucmVsYXRlZEdyYXBoLmFkZE5vZGUoZWxlbWVudCk7XG4gICAgICAgICAgICByZXMubm9kZSA9IG5vZGUyO1xuICAgICAgICAgICAgaWYgKGFzUGFyZW50KSB7XG4gICAgICAgICAgICAgIHJlbGF0aW9uLmFkZE5vZGV0b05vZGVMaXN0MShub2RlMik7XG4gICAgICAgICAgICAgIG5vZGUyLmFkZERpcmVjdGVkUmVsYXRpb25QYXJlbnQocmVsYXRpb24pO1xuICAgICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVsYXRpb24uYWRkTm9kZXRvTm9kZUxpc3QyKG5vZGUyKTtcbiAgICAgICAgICAgICAgbm9kZTIuYWRkRGlyZWN0ZWRSZWxhdGlvbkNoaWxkKHJlbGF0aW9uKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKCFpc0RpcmVjdGVkKSB7XG4gICAgICAgICAgICBub2RlMiA9IHRoaXMucmVsYXRlZEdyYXBoLmFkZE5vZGUoZWxlbWVudCk7XG4gICAgICAgICAgICByZXMubm9kZSA9IG5vZGUyO1xuICAgICAgICAgICAgcmVsYXRpb24uYWRkTm9kZXRvTm9kZUxpc3QyKG5vZGUyKTtcbiAgICAgICAgICAgIG5vZGUyLmFkZE5vbkRpcmVjdGVkUmVsYXRpb24ocmVsYXRpb24pO1xuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmFkZFNpbXBsZVJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgZWxlbWVudCwgaXNEaXJlY3RlZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICByZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVsYXRlZEdyYXBoLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHBhcmFtIHtNb2RlbHwgU3BpbmFsTm9kZX0gZWxlbWVudCAtIE1vZGVsOmFueSBzdWJjbGFzcyBvZiBNb2RlbFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0RpcmVjdGVkPWZhbHNlXVxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFthc1BhcmVudD1mYWxzZV1cbiAgICogQHJldHVybnMgYW4gT2JqZWN0IG9mIDEpcmVsYXRpb246dGhlIHJlbGF0aW9uIHdpdGggdGhlIGFkZGVkIGVsZW1lbnQgbm9kZSBpbiAobm9kZUxpc3QyKSwgMilub2RlOiB0aGUgY3JlYXRlZCBub2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhZGRUb0V4aXN0aW5nUmVsYXRpb25CeUFwcChcbiAgICBhcHBOYW1lLFxuICAgIHJlbGF0aW9uVHlwZSxcbiAgICBlbGVtZW50LFxuICAgIGlzRGlyZWN0ZWQgPSBmYWxzZSxcbiAgICBhc1BhcmVudCA9IGZhbHNlXG4gICkge1xuICAgIGxldCByZXMgPSB7fVxuICAgIGxldCBub2RlMiA9IG51bGxcbiAgICBpZiAodGhpcy5yZWxhdGVkR3JhcGguaGFzUmVzZXJ2YXRpb25DcmVkZW50aWFscyhyZWxhdGlvblR5cGUsIGFwcE5hbWUpKSB7XG4gICAgICBpZiAodGhpcy5yZWxhdGVkR3JhcGguY29udGFpbnNBcHAoYXBwTmFtZSkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmFwcHNbYXBwTmFtZV0gIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBsZXQgYXBwUmVsYXRpb25zID0gdGhpcy5nZXRSZWxhdGlvbnNCeUFwcE5hbWUoYXBwTmFtZSk7XG4gICAgICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGFwcFJlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICAgIGNvbnN0IHJlbGF0aW9uID0gYXBwUmVsYXRpb25zW2luZGV4XTtcbiAgICAgICAgICAgIHJlcy5yZWxhdGlvbiA9IHJlbGF0aW9uXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgIHJlbGF0aW9uLnR5cGUuZ2V0KCkgPT09IHJlbGF0aW9uVHlwZSAmJlxuICAgICAgICAgICAgICBpc0RpcmVjdGVkID09PSByZWxhdGlvbi5pc0RpcmVjdGVkLmdldCgpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgaWYgKGlzRGlyZWN0ZWQgJiYgdGhpcy5pc1BhcmVudChyZWxhdGlvbikpIHtcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5jb25zdHJ1Y3Rvci5uYW1lICE9IFwiU3BpbmFsTm9kZVwiKVxuICAgICAgICAgICAgICAgICAgbm9kZTIgPSB0aGlzLnJlbGF0ZWRHcmFwaC5hZGROb2RlKGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIHJlcy5ub2RlID0gbm9kZTI7XG4gICAgICAgICAgICAgICAgaWYgKGFzUGFyZW50KSB7XG4gICAgICAgICAgICAgICAgICByZWxhdGlvbi5hZGROb2RldG9Ob2RlTGlzdDEobm9kZTIpO1xuICAgICAgICAgICAgICAgICAgbm9kZTIuYWRkRGlyZWN0ZWRSZWxhdGlvblBhcmVudChyZWxhdGlvbiwgYXBwTmFtZSk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICByZWxhdGlvbi5hZGROb2RldG9Ob2RlTGlzdDIobm9kZTIpO1xuICAgICAgICAgICAgICAgICAgbm9kZTIuYWRkRGlyZWN0ZWRSZWxhdGlvbkNoaWxkKHJlbGF0aW9uLCBhcHBOYW1lKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFpc0RpcmVjdGVkKSB7XG4gICAgICAgICAgICAgICAgbm9kZTIgPSB0aGlzLnJlbGF0ZWRHcmFwaC5hZGROb2RlKGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIHJlcy5ub2RlID0gbm9kZTI7XG4gICAgICAgICAgICAgICAgcmVsYXRpb24uYWRkTm9kZXRvTm9kZUxpc3QyKG5vZGUyKTtcbiAgICAgICAgICAgICAgICBub2RlMi5hZGROb25EaXJlY3RlZFJlbGF0aW9uKHJlbGF0aW9uLCBhcHBOYW1lKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmFkZFNpbXBsZVJlbGF0aW9uQnlBcHAoXG4gICAgICAgICAgYXBwTmFtZSxcbiAgICAgICAgICByZWxhdGlvblR5cGUsXG4gICAgICAgICAgZWxlbWVudCxcbiAgICAgICAgICBpc0RpcmVjdGVkXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKGFwcE5hbWUgKyBcIiBkb2VzIG5vdCBleGlzdFwiKTtcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICByZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVsYXRlZEdyYXBoLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuXG5cblxuICAvLyBhZGRSZWxhdGlvbjIoX3JlbGF0aW9uLCBfbmFtZSkge1xuICAvLyAgIGxldCBjbGFzc2lmeSA9IGZhbHNlO1xuICAvLyAgIGxldCBuYW1lID0gX3JlbGF0aW9uLnR5cGUuZ2V0KCk7XG4gIC8vICAgaWYgKHR5cGVvZiBfbmFtZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAvLyAgICAgbmFtZSA9IF9uYW1lO1xuICAvLyAgIH1cbiAgLy8gICBpZiAodHlwZW9mIHRoaXMucmVsYXRpb25zW19yZWxhdGlvbi50eXBlLmdldCgpXSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAvLyAgICAgaWYgKF9yZWxhdGlvbi5pc0RpcmVjdGVkLmdldCgpKSB7XG4gIC8vICAgICAgIGZvciAoXG4gIC8vICAgICAgICAgbGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLnJlbGF0aW9uc1tfcmVsYXRpb24udHlwZS5nZXQoKV0ubGVuZ3RoOyBpbmRleCsrXG4gIC8vICAgICAgICkge1xuICAvLyAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLnJlbGF0aW9uc1tfcmVsYXRpb24udHlwZS5nZXQoKV1baW5kZXhdO1xuICAvLyAgICAgICAgIGlmIChcbiAgLy8gICAgICAgICAgIFV0aWxpdGllcy5hcnJheXNFcXVhbChcbiAgLy8gICAgICAgICAgICAgX3JlbGF0aW9uLmdldE5vZGVMaXN0MUlkcygpLFxuICAvLyAgICAgICAgICAgICBlbGVtZW50LmdldE5vZGVMaXN0MUlkcygpXG4gIC8vICAgICAgICAgICApXG4gIC8vICAgICAgICAgKSB7XG4gIC8vICAgICAgICAgICBlbGVtZW50LmFkZE5vdEV4aXN0aW5nVmVydGljZXN0b05vZGVMaXN0MihfcmVsYXRpb24ubm9kZUxpc3QyKTtcbiAgLy8gICAgICAgICB9IGVsc2Uge1xuICAvLyAgICAgICAgICAgZWxlbWVudC5wdXNoKF9yZWxhdGlvbik7XG4gIC8vICAgICAgICAgICBjbGFzc2lmeSA9IHRydWU7XG4gIC8vICAgICAgICAgfVxuICAvLyAgICAgICB9XG4gIC8vICAgICB9IGVsc2Uge1xuICAvLyAgICAgICB0aGlzLnJlbGF0aW9uc1tfcmVsYXRpb24udHlwZS5nZXQoKV0uYWRkTm90RXhpc3RpbmdWZXJ0aWNlc3RvUmVsYXRpb24oXG4gIC8vICAgICAgICAgX3JlbGF0aW9uXG4gIC8vICAgICAgICk7XG4gIC8vICAgICB9XG4gIC8vICAgfSBlbHNlIHtcbiAgLy8gICAgIGlmIChfcmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKSkge1xuICAvLyAgICAgICBsZXQgbGlzdCA9IG5ldyBMc3QoKTtcbiAgLy8gICAgICAgbGlzdC5wdXNoKF9yZWxhdGlvbik7XG4gIC8vICAgICAgIHRoaXMucmVsYXRpb25zLmFkZF9hdHRyKHtcbiAgLy8gICAgICAgICBbbmFtZV06IGxpc3RcbiAgLy8gICAgICAgfSk7XG4gIC8vICAgICAgIHRoaXMuX2NsYXNzaWZ5UmVsYXRpb24oX3JlbGF0aW9uKTtcbiAgLy8gICAgIH0gZWxzZSB7XG4gIC8vICAgICAgIHRoaXMucmVsYXRpb25zLmFkZF9hdHRyKHtcbiAgLy8gICAgICAgICBbbmFtZV06IF9yZWxhdGlvblxuICAvLyAgICAgICB9KTtcbiAgLy8gICAgICAgY2xhc3NpZnkgPSB0cnVlO1xuICAvLyAgICAgfVxuICAvLyAgIH1cbiAgLy8gICBpZiAoY2xhc3NpZnkpIHRoaXMuX2NsYXNzaWZ5UmVsYXRpb24oX3JlbGF0aW9uKTtcbiAgLy8gfVxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9ufSBfcmVsYXRpb25cbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIF9jbGFzc2lmeVJlbGF0aW9uKF9yZWxhdGlvbikge1xuICAgIHRoaXMucmVsYXRlZEdyYXBoLmxvYWQocmVsYXRlZEdyYXBoID0+IHtcbiAgICAgIHJlbGF0ZWRHcmFwaC5fY2xhc3NpZnlSZWxhdGlvbihfcmVsYXRpb24pO1xuICAgIH0pO1xuICB9XG5cbiAgLy9UT0RPIDpOb3RXb3JraW5nXG4gIC8vIGFkZFJlbGF0aW9uKF9yZWxhdGlvbikge1xuICAvLyAgIHRoaXMuYWRkUmVsYXRpb24oX3JlbGF0aW9uKVxuICAvLyAgIHRoaXMucmVsYXRlZEdyYXBoLmxvYWQocmVsYXRlZEdyYXBoID0+IHtcbiAgLy8gICAgIHJlbGF0ZWRHcmFwaC5fYWRkTm90RXhpc3RpbmdWZXJ0aWNlc0Zyb21SZWxhdGlvbihfcmVsYXRpb24pXG4gIC8vICAgfSlcbiAgLy8gfVxuICAvL1RPRE8gOk5vdFdvcmtpbmdcbiAgLy8gYWRkUmVsYXRpb25zKF9yZWxhdGlvbnMpIHtcbiAgLy8gICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX3JlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgLy8gICAgIHRoaXMuYWRkUmVsYXRpb24oX3JlbGF0aW9uc1tpbmRleF0pO1xuICAvLyAgIH1cbiAgLy8gfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgYWxsIHRoZSByZWxhdGlvbnMgb2YgdGhpcyBOb2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBnZXRSZWxhdGlvbnMoKSB7XG4gICAgbGV0IHJlcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5yZWxhdGlvbnMuX2F0dHJpYnV0ZV9uYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgcmVsTGlzdCA9IHRoaXMucmVsYXRpb25zW3RoaXMucmVsYXRpb25zLl9hdHRyaWJ1dGVfbmFtZXNbaV1dO1xuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCByZWxMaXN0Lmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGNvbnN0IHJlbGF0aW9uID0gcmVsTGlzdFtqXTtcbiAgICAgICAgcmVzLnB1c2gocmVsYXRpb24pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZVxuICAgKiBAcmV0dXJucyBhbGwgcmVsYXRpb25zIG9mIGEgc3BlY2lmaWMgcmVsYXRpb24gdHlwZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgZ2V0UmVsYXRpb25zQnlUeXBlKHR5cGUpIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgaWYgKCF0eXBlLmluY2x1ZGVzKFwiPlwiLCB0eXBlLmxlbmd0aCAtIDIpICYmXG4gICAgICAhdHlwZS5pbmNsdWRlcyhcIjxcIiwgdHlwZS5sZW5ndGggLSAyKSAmJlxuICAgICAgIXR5cGUuaW5jbHVkZXMoXCItXCIsIHR5cGUubGVuZ3RoIC0gMilcbiAgICApIHtcbiAgICAgIGxldCB0MSA9IHR5cGUuY29uY2F0KFwiPlwiKTtcbiAgICAgIHJlcyA9IFV0aWxpdGllcy5jb25jYXQocmVzLCB0aGlzLmdldFJlbGF0aW9ucyh0MSkpO1xuICAgICAgbGV0IHQyID0gdHlwZS5jb25jYXQoXCI8XCIpO1xuICAgICAgcmVzID0gVXRpbGl0aWVzLmNvbmNhdChyZXMsIHRoaXMuZ2V0UmVsYXRpb25zKHQyKSk7XG4gICAgICBsZXQgdDMgPSB0eXBlLmNvbmNhdChcIi1cIik7XG4gICAgICByZXMgPSBVdGlsaXRpZXMuY29uY2F0KHJlcywgdGhpcy5nZXRSZWxhdGlvbnModDMpKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0aW9uc1t0eXBlXSAhPT0gXCJ1bmRlZmluZWRcIikgcmVzID0gdGhpcy5yZWxhdGlvbnNbXG4gICAgICB0eXBlXTtcbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAcmV0dXJucyBhbiBhcnJheSBvZiBhbGwgcmVsYXRpb25zIG9mIGEgc3BlY2lmaWMgYXBwIGZvciB0aGlzIG5vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGdldFJlbGF0aW9uc0J5QXBwTmFtZShhcHBOYW1lKSB7XG4gICAgbGV0IHJlcyA9IFtdO1xuICAgIGlmICh0aGlzLmhhc0FwcERlZmluZWQoYXBwTmFtZSkpIHtcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLmFwcHNbYXBwTmFtZV0uX2F0dHJpYnV0ZV9uYW1lcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgYXBwUmVsYXRpb24gPSB0aGlzLmFwcHNbYXBwTmFtZV1bdGhpcy5hcHBzW2FwcE5hbWVdLl9hdHRyaWJ1dGVfbmFtZXNbXG4gICAgICAgICAgaW5kZXhdXTtcbiAgICAgICAgcmVzLnB1c2goYXBwUmVsYXRpb24pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgLy8gLyoqXG4gIC8vICAqXG4gIC8vICAqXG4gIC8vICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gIC8vICAqIEByZXR1cm5zIGFuIG9iamVjdCBvZiBhbGwgcmVsYXRpb25zIG9mIGEgc3BlY2lmaWMgYXBwIGZvciB0aGlzIG5vZGVcbiAgLy8gICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgLy8gICovXG4gIC8vIGdldFJlbGF0aW9uc1dpdGhLZXlzQnlBcHBOYW1lKGFwcE5hbWUpIHtcbiAgLy8gICBpZiAodGhpcy5oYXNBcHBEZWZpbmVkKGFwcE5hbWUpKSB7XG4gIC8vICAgICByZXR1cm4gdGhpcy5hcHBzW2FwcE5hbWVdO1xuICAvLyAgIH1cbiAgLy8gfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxBcHBsaWNhdGlvbn0gYXBwXG4gICAqIEByZXR1cm5zIGFsbCByZWxhdGlvbnMgb2YgYSBzcGVjaWZpYyBhcHBcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGdldFJlbGF0aW9uc0J5QXBwKGFwcCkge1xuICAgIGxldCBhcHBOYW1lID0gYXBwLm5hbWUuZ2V0KClcbiAgICByZXR1cm4gdGhpcy5nZXRSZWxhdGlvbnNCeUFwcE5hbWUoYXBwTmFtZSlcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFwcE5hbWVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBhbGwgcmVsYXRpb25zIG9mIGEgc3BlY2lmaWMgYXBwIG9mIGEgc3BlY2lmaWMgdHlwZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgZ2V0UmVsYXRpb25zQnlBcHBOYW1lQnlUeXBlKGFwcE5hbWUsIHJlbGF0aW9uVHlwZSkge1xuICAgIGxldCByZXMgPSBbXTtcbiAgICBpZiAodGhpcy5oYXNSZWxhdGlvbkJ5QXBwQnlUeXBlRGVmaW5lZChhcHBOYW1lLCByZWxhdGlvblR5cGUpKSB7XG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5hcHBzW2FwcE5hbWVdLl9hdHRyaWJ1dGVfbmFtZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IGFwcFJlbGF0aW9uID0gdGhpcy5hcHBzW2FwcE5hbWVdW3RoaXMuYXBwc1thcHBOYW1lXS5fYXR0cmlidXRlX25hbWVzW1xuICAgICAgICAgIGluZGV4XV07XG4gICAgICAgIGlmIChhcHBSZWxhdGlvbi50eXBlLmdldCgpID09PSByZWxhdGlvblR5cGUpIHJlcy5wdXNoKGFwcFJlbGF0aW9uKTtcbiAgICAgICAgZWxzZSBpZiAoIWFwcFJlbGF0aW9uLmlzRGlyZWN0ZWQuZ2V0KCkgJiYgYXBwUmVsYXRpb24udHlwZS5nZXQoKSArXG4gICAgICAgICAgXCItXCIgPT09IHJlbGF0aW9uVHlwZSkgcmVzLnB1c2goYXBwUmVsYXRpb24pO1xuICAgICAgICBlbHNlIGlmIChhcHBSZWxhdGlvbi50eXBlLmdldCgpICsgXCI+XCIgPT09IHJlbGF0aW9uVHlwZSkgcmVzLnB1c2goXG4gICAgICAgICAgYXBwUmVsYXRpb24pO1xuICAgICAgICBlbHNlIGlmIChhcHBSZWxhdGlvbi50eXBlLmdldCgpICsgXCI8XCIgPT09IHJlbGF0aW9uVHlwZSkgcmVzLnB1c2goXG4gICAgICAgICAgYXBwUmVsYXRpb24pO1xuXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsQXBwbGljYXRpb259IGFwcFxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEByZXR1cm5zIGFsbCByZWxhdGlvbnMgb2YgYSBzcGVjaWZpYyBhcHAgb2YgYSBzcGVjaWZpYyB0eXBlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBnZXRSZWxhdGlvbnNCeUFwcEJ5VHlwZShhcHAsIHJlbGF0aW9uVHlwZSkge1xuICAgIGxldCBhcHBOYW1lID0gYXBwLm5hbWUuZ2V0KClcbiAgICByZXR1cm4gdGhpcy5nZXRSZWxhdGlvbnNCeUFwcE5hbWVCeVR5cGUoYXBwTmFtZSwgcmVsYXRpb25UeXBlKVxuXG4gIH1cbiAgLyoqXG4gICAqICB2ZXJpZnkgaWYgYW4gZWxlbWVudCBpcyBhbHJlYWR5IGluIGdpdmVuIG5vZGVMaXN0XG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZVtdfSBfbm9kZWxpc3RcbiAgICogQHJldHVybnMgYm9vbGVhblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgaW5Ob2RlTGlzdChfbm9kZWxpc3QpIHtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX25vZGVsaXN0Lmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgZWxlbWVudCA9IF9ub2RlbGlzdFtpbmRleF07XG4gICAgICBpZiAoZWxlbWVudC5pZC5nZXQoKSA9PT0gdGhpcy5pZC5nZXQoKSkgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vVE9ETyBnZXRDaGlsZHJlbiwgZ2V0UGFyZW50XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlIC0gb3B0aW9uYWxcbiAgICogQHJldHVybnMgYSBsaXN0IG9mIG5laWdoYm9ycyBub2RlcyBcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGdldE5laWdoYm9ycyhyZWxhdGlvblR5cGUpIHtcbiAgICBsZXQgbmVpZ2hib3JzID0gW107XG4gICAgbGV0IHJlbGF0aW9ucyA9IHRoaXMuZ2V0UmVsYXRpb25zKHJlbGF0aW9uVHlwZSk7XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHJlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IHJlbGF0aW9uID0gcmVsYXRpb25zW2luZGV4XTtcbiAgICAgIGlmIChyZWxhdGlvbi5pc0RpcmVjdGVkLmdldCgpKSB7XG4gICAgICAgIGlmICh0aGlzLmluTm9kZUxpc3QocmVsYXRpb24ubm9kZUxpc3QxKSlcbiAgICAgICAgICBuZWlnaGJvcnMgPSBVdGlsaXRpZXMuY29uY2F0KG5laWdoYm9ycywgcmVsYXRpb24ubm9kZUxpc3QyKTtcbiAgICAgICAgZWxzZSBuZWlnaGJvcnMgPSBVdGlsaXRpZXMuY29uY2F0KG5laWdoYm9ycywgcmVsYXRpb24ubm9kZUxpc3QxKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5laWdoYm9ycyA9IFV0aWxpdGllcy5jb25jYXQoXG4gICAgICAgICAgbmVpZ2hib3JzLFxuICAgICAgICAgIFV0aWxpdGllcy5hbGxCdXRNZUJ5SWQocmVsYXRpb24ubm9kZUxpc3QxKVxuICAgICAgICApO1xuICAgICAgICBuZWlnaGJvcnMgPSBVdGlsaXRpZXMuY29uY2F0KFxuICAgICAgICAgIG5laWdoYm9ycyxcbiAgICAgICAgICBVdGlsaXRpZXMuYWxsQnV0TWVCeUlkKHJlbGF0aW9uLm5vZGVMaXN0MilcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5laWdoYm9ycztcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEByZXR1cm5zIGFycmF5IG9mIHNwaW5hbE5vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGdldENoaWxkcmVuQnlSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlKSB7XG4gICAgbGV0IHJlcyA9IFtdXG4gICAgaWYgKHRoaXMucmVsYXRpb25zW3JlbGF0aW9uVHlwZSArIFwiPlwiXSlcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIj5cIl0ubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IHJlbGF0aW9uID0gdGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCI+XCJdW2luZGV4XTtcbiAgICAgICAgbGV0IG5vZGVMaXN0MiA9IHJlbGF0aW9uLmdldE5vZGVMaXN0MigpO1xuICAgICAgICByZXMgPSBVdGlsaXRpZXMuY29uY2F0KHJlcywgbm9kZUxpc3QyKVxuICAgICAgfVxuICAgIHJldHVybiByZXNcbiAgfVxuXG4gIC8vVE9ET1xuICAvLyAvKipcbiAgLy8gICpcbiAgLy8gICpcbiAgLy8gICogQHBhcmFtIHtzdHJpbmd8U3BpbmFsUmVsYXRpb259IHJlbGF0aW9uXG4gIC8vICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgLy8gICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgLy8gICovXG4gIC8vIGlzUGFyZW50KHJlbGF0aW9uKSB7XG4gIC8vICAgaWYgKHR5cGVvZiByZWxhdGlvbiA9PT0gXCJzdHJpbmdcIikge1xuICAvLyAgICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0aW9uc1tyZWxhdGlvbiArIFwiPlwiXSAhPSBcInVuZGVmaW5lZFwiKSB7XG4gIC8vICAgICAgIGxldCByZWxhdGlvbnMgPSB0aGlzLnJlbGF0aW9uc1tyZWxhdGlvbiArIFwiPlwiXVxuICAvLyAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcmVsYXRpb25zLmxlbmd0aDsgaW5kZXgrKykge1xuICAvLyAgICAgICAgIGNvbnN0IHJlbGF0aW9uID0gcmVsYXRpb25zW2luZGV4XTtcbiAgLy8gICAgICAgICBsZXQgbm9kZUxpc3QxID0gcmVsYXRpb24uZ2V0Tm9kZUxpc3QxKClcbiAgLy8gICAgICAgICByZXR1cm4gVXRpbGl0aWVzLmNvbnRhaW5zTHN0QnlJZChub2RlTGlzdDEsIHRoaXMpXG4gIC8vICAgICAgIH1cbiAgLy8gICAgIH1cbiAgLy8gICB9IGVsc2Uge1xuICAvLyAgICAgbGV0IG5vZGVMaXN0MSA9IHJlbGF0aW9uLmdldE5vZGVMaXN0MSgpXG4gIC8vICAgICByZXR1cm4gVXRpbGl0aWVzLmNvbnRhaW5zTHN0QnlJZChub2RlTGlzdDEsIHRoaXMpXG4gIC8vICAgfVxuICAvLyAgIHJldHVybiBmYWxzZTtcbiAgLy8gfVxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9ufSByZWxhdGlvblxuICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBpc1BhcmVudChyZWxhdGlvbikge1xuICAgIGxldCBub2RlTGlzdDEgPSByZWxhdGlvbi5nZXROb2RlTGlzdDEoKVxuICAgIHJldHVybiBVdGlsaXRpZXMuY29udGFpbnNMc3RCeUlkKG5vZGVMaXN0MSwgdGhpcylcbiAgfVxuXG4gIC8vVE9ET1xuICAvLyAvKipcbiAgLy8gICpcbiAgLy8gICpcbiAgLy8gICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbn0gcmVsYXRpb25cbiAgLy8gICogQHJldHVybnMgYm9vbGVhblxuICAvLyAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAvLyAgKi9cbiAgLy8gaXNDaGlsZChyZWxhdGlvbikge1xuICAvLyAgIGxldCBub2RlTGlzdDIgPSByZWxhdGlvbi5nZXROb2RlTGlzdDIoKVxuICAvLyAgIHJldHVybiBVdGlsaXRpZXMuY29udGFpbnNMc3RCeUlkKG5vZGVMaXN0MiwgdGhpcylcbiAgLy8gfVxuXG4gIC8vVE9ETyBPcHRpbWl6ZVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmcgfCBTcGluYWxBcHBsaWNhdGlvbn0gYXBwTmFtZVxuICAgKiBAcGFyYW0ge3N0cmluZyB8IFNwaW5hbFJlbGF0aW9ufSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgYXJyYXkgb2Ygc3BpbmFsTm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgZ2V0Q2hpbGRyZW5CeUFwcEJ5UmVsYXRpb24oYXBwLCByZWxhdGlvbikge1xuICAgIGxldCBhcHBOYW1lID0gXCJcIlxuICAgIGxldCByZWxhdGlvblR5cGUgPSBcIlwiXG4gICAgbGV0IHJlcyA9IFtdXG4gICAgaWYgKHR5cGVvZiBhcHAgIT0gXCJzdHJpbmdcIilcbiAgICAgIGFwcE5hbWUgPSBhcHAubmFtZS5nZXQoKVxuICAgIGVsc2VcbiAgICAgIGFwcE5hbWUgPSBhcHBcbiAgICBpZiAodHlwZW9mIGFwcCAhPSBcInN0cmluZ1wiKVxuICAgICAgcmVsYXRpb25UeXBlID0gcmVsYXRpb24ubmFtZS5nZXQoKVxuICAgIGVsc2VcbiAgICAgIHJlbGF0aW9uVHlwZSA9IHJlbGF0aW9uXG4gICAgaWYgKHR5cGVvZiB0aGlzLmFwcHNbYXBwTmFtZV0gIT0gXCJ1bmRlZmluZWRcIiAmJiB0eXBlb2YgdGhpcy5hcHBzW1xuICAgICAgICBhcHBOYW1lXVtyZWxhdGlvblR5cGUgKyBcIj5cIl0gIT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgbGV0IHJlbGF0aW9uVG1wID0gdGhpcy5hcHBzW2FwcE5hbWVdW3JlbGF0aW9uVHlwZSArIFwiPlwiXVxuICAgICAgbGV0IG5vZGVMaXN0MiA9IHJlbGF0aW9uVG1wLmdldE5vZGVMaXN0MigpXG4gICAgICByZXMgPSBVdGlsaXRpZXMuY29uY2F0KHJlcywgbm9kZUxpc3QyKVxuICAgIH1cbiAgICByZXR1cm4gcmVzXG4gIH1cblxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmcgfCBTcGluYWxBcHBsaWNhdGlvbn0gYXBwTmFtZVxuICAgKiBAcGFyYW0ge3N0cmluZyB8IFNwaW5hbFJlbGF0aW9ufSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgIEEgcHJvbWlzZSBvZiBhbiBhcnJheSBvZiBNb2RlbHNcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGFzeW5jIGdldENoaWxkcmVuRWxlbWVudHNCeUFwcEJ5UmVsYXRpb24oYXBwLCByZWxhdGlvbikge1xuICAgIGxldCBhcHBOYW1lID0gXCJcIlxuICAgIGxldCByZWxhdGlvblR5cGUgPSBcIlwiXG4gICAgbGV0IHJlcyA9IFtdXG4gICAgaWYgKHR5cGVvZiBhcHAgIT0gXCJzdHJpbmdcIilcbiAgICAgIGFwcE5hbWUgPSBhcHAubmFtZS5nZXQoKVxuICAgIGVsc2VcbiAgICAgIGFwcE5hbWUgPSBhcHBcbiAgICBpZiAodHlwZW9mIGFwcCAhPSBcInN0cmluZ1wiKVxuICAgICAgcmVsYXRpb25UeXBlID0gcmVsYXRpb24ubmFtZS5nZXQoKVxuICAgIGVsc2VcbiAgICAgIHJlbGF0aW9uVHlwZSA9IHJlbGF0aW9uXG4gICAgaWYgKHR5cGVvZiB0aGlzLmFwcHNbYXBwTmFtZV0gIT0gXCJ1bmRlZmluZWRcIiAmJiB0eXBlb2YgdGhpcy5hcHBzW1xuICAgICAgICBhcHBOYW1lXVtyZWxhdGlvblR5cGUgKyBcIj5cIl0gIT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgbGV0IHJlbGF0aW9uVG1wID0gdGhpcy5hcHBzW2FwcE5hbWVdW3JlbGF0aW9uVHlwZSArIFwiPlwiXVxuICAgICAgbGV0IG5vZGVMaXN0MiA9IHJlbGF0aW9uVG1wLmdldE5vZGVMaXN0MigpXG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgbm9kZUxpc3QyLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCBub2RlID0gbm9kZUxpc3QyW2luZGV4XTtcbiAgICAgICAgcmVzLnB1c2goYXdhaXQgbm9kZS5nZXRFbGVtZW50KCkpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXNcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSBvZiBhbiBhcnJheSBvZiBNb2RlbHNcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGFzeW5jIGdldENoaWxkcmVuRWxlbWVudHNCeVJlbGF0aW9uVHlwZShyZWxhdGlvblR5cGUpIHtcbiAgICBsZXQgcmVzID0gW11cbiAgICBpZiAodGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCI+XCJdKVxuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMucmVsYXRpb25zW3JlbGF0aW9uVHlwZSArIFwiPlwiXS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgcmVsYXRpb24gPSB0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIj5cIl1baW5kZXhdO1xuICAgICAgICBsZXQgbm9kZUxpc3QyID0gcmVsYXRpb24uZ2V0Tm9kZUxpc3QyKCk7XG4gICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBub2RlTGlzdDIubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVMaXN0MltpbmRleF07XG4gICAgICAgICAgcmVzLnB1c2goYXdhaXQgVXRpbGl0aWVzLnByb21pc2VMb2FkKG5vZGUuZWxlbWVudCkpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICByZXR1cm4gcmVzXG4gIH1cblxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBhcnJheSBvZiBzcGluYWxOb2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBnZXRQYXJlbnRzQnlSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlKSB7XG4gICAgbGV0IHJlcyA9IFtdXG4gICAgaWYgKHRoaXMucmVsYXRpb25zW3JlbGF0aW9uVHlwZSArIFwiPFwiXSlcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIjxcIl0ubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IHJlbGF0aW9uID0gdGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCI8XCJdW2luZGV4XTtcbiAgICAgICAgbGV0IG5vZGVMaXN0MSA9IHJlbGF0aW9uLmdldE5vZGVMaXN0MSgpO1xuICAgICAgICByZXMgPSBVdGlsaXRpZXMuY29uY2F0KHJlcywgbm9kZUxpc3QxKVxuICAgICAgfVxuICAgIHJldHVybiByZXNcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbn0gX3JlbGF0aW9uXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICByZW1vdmVSZWxhdGlvbihfcmVsYXRpb24pIHtcbiAgICBsZXQgcmVsYXRpb25Mc3QgPSB0aGlzLnJlbGF0aW9uc1tfcmVsYXRpb24udHlwZS5nZXQoKV07XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHJlbGF0aW9uTHN0Lmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgY2FuZGlkYXRlUmVsYXRpb24gPSByZWxhdGlvbkxzdFtpbmRleF07XG4gICAgICBpZiAoX3JlbGF0aW9uLmlkLmdldCgpID09PSBjYW5kaWRhdGVSZWxhdGlvbi5pZC5nZXQoKSlcbiAgICAgICAgcmVsYXRpb25Mc3Quc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb25bXX0gX3JlbGF0aW9uc1xuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgcmVtb3ZlUmVsYXRpb25zKF9yZWxhdGlvbnMpIHtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX3JlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHRoaXMucmVtb3ZlUmVsYXRpb24oX3JlbGF0aW9uc1tpbmRleF0pO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgcmVtb3ZlUmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHJlbGF0aW9uVHlwZSkgfHwgcmVsYXRpb25UeXBlIGluc3RhbmNlb2YgTHN0KVxuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHJlbGF0aW9uVHlwZS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgdHlwZSA9IHJlbGF0aW9uVHlwZVtpbmRleF07XG4gICAgICAgIHRoaXMucmVsYXRpb25zLnJlbV9hdHRyKHR5cGUpO1xuICAgICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5yZWxhdGlvbnMucmVtX2F0dHIocmVsYXRpb25UeXBlKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGhhc0FwcERlZmluZWQoYXBwTmFtZSkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5hcHBzW2FwcE5hbWVdICE9PSBcInVuZGVmaW5lZFwiKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICBlbHNlIHtcbiAgICAgIGNvbnNvbGUud2FybihcImFwcCBcIiArIGFwcE5hbWUgK1xuICAgICAgICBcIiBpcyBub3QgZGVmaW5lZCBmb3Igbm9kZSBcIiArIHRoaXMubmFtZS5nZXQoKSk7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgYm9vbGVhbiBcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGhhc1JlbGF0aW9uQnlBcHBCeVR5cGVEZWZpbmVkKGFwcE5hbWUsIHJlbGF0aW9uVHlwZSkge1xuICAgIGlmICh0aGlzLmhhc0FwcERlZmluZWQoYXBwTmFtZSkgJiYgdHlwZW9mIHRoaXMuYXBwc1thcHBOYW1lXVtcbiAgICAgICAgcmVsYXRpb25UeXBlXG4gICAgICBdICE9PVxuICAgICAgXCJ1bmRlZmluZWRcIiB8fCB0aGlzLmhhc0FwcERlZmluZWQoYXBwTmFtZSkgJiYgdHlwZW9mIHRoaXMuYXBwc1tcbiAgICAgICAgYXBwTmFtZV1bXG4gICAgICAgIHJlbGF0aW9uVHlwZSArIFwiLVwiXG4gICAgICBdICE9PVxuICAgICAgXCJ1bmRlZmluZWRcIiB8fCB0aGlzLmhhc0FwcERlZmluZWQoYXBwTmFtZSkgJiYgdHlwZW9mIHRoaXMuYXBwc1tcbiAgICAgICAgYXBwTmFtZV1bXG4gICAgICAgIHJlbGF0aW9uVHlwZSArIFwiPlwiXG4gICAgICBdICE9PVxuICAgICAgXCJ1bmRlZmluZWRcIiB8fCB0aGlzLmhhc0FwcERlZmluZWQoYXBwTmFtZSkgJiYgdHlwZW9mIHRoaXMuYXBwc1tcbiAgICAgICAgYXBwTmFtZV1bXG4gICAgICAgIHJlbGF0aW9uVHlwZSArIFwiPFwiXG4gICAgICBdICE9PVxuICAgICAgXCJ1bmRlZmluZWRcIilcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oXCJyZWxhdGlvbiBcIiArIHJlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGlzIG5vdCBkZWZpbmVkIGZvciBub2RlIFwiICsgdGhpcy5uYW1lLmdldCgpICtcbiAgICAgICAgXCIgZm9yIGFwcGxpY2F0aW9uIFwiICsgYXBwTmFtZSk7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEByZXR1cm5zIEEganNvbiByZXByZXNlbnRpbmcgdGhlIG5vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIHRvSnNvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IHRoaXMuaWQuZ2V0KCksXG4gICAgICBuYW1lOiB0aGlzLm5hbWUuZ2V0KCksXG4gICAgICBlbGVtZW50OiBudWxsXG4gICAgfTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgQSBqc29uIHJlcHJlc2VudGluZyB0aGUgbm9kZSB3aXRoIGl0cyByZWxhdGlvbnNcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIHRvSnNvbldpdGhSZWxhdGlvbnMoKSB7XG4gICAgbGV0IHJlbGF0aW9ucyA9IFtdO1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLmdldFJlbGF0aW9ucygpLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgcmVsYXRpb24gPSB0aGlzLmdldFJlbGF0aW9ucygpW2luZGV4XTtcbiAgICAgIHJlbGF0aW9ucy5wdXNoKHJlbGF0aW9uLnRvSnNvbigpKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiB0aGlzLmlkLmdldCgpLFxuICAgICAgbmFtZTogdGhpcy5uYW1lLmdldCgpLFxuICAgICAgZWxlbWVudDogbnVsbCxcbiAgICAgIHJlbGF0aW9uczogcmVsYXRpb25zXG4gICAgfTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgQW4gSUZDIGxpa2UgZm9ybWF0IHJlcHJlc2VudGluZyB0aGUgbm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYXN5bmMgdG9JZmMoKSB7XG4gICAgbGV0IGVsZW1lbnQgPSBhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQodGhpcy5lbGVtZW50KTtcbiAgICByZXR1cm4gZWxlbWVudC50b0lmYygpO1xuICB9XG59XG5leHBvcnQgZGVmYXVsdCBTcGluYWxOb2RlXG5zcGluYWxDb3JlLnJlZ2lzdGVyX21vZGVscyhbU3BpbmFsTm9kZV0pOyJdfQ==