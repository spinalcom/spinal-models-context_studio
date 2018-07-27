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
        if (typeof this.apps[appName] !== "undefined" && typeof this.apps[appName][nameTmp] !== "undefined") this.apps[appName][nameTmp].push(relation);else if (typeof this.apps[appName] !== "undefined" && typeof this.apps[appName][nameTmp] === "undefined") {
          let relationList = new Lst();
          relationList.push(relation);
          this.apps[appName].add_attr({
            [nameTmp]: relationList
          });
        } else {
          let app = new Model();
          let relationList = new Lst();
          relationList.push(relation);
          app.add_attr({
            [nameTmp]: relationList
          });
          this.apps.add_attr({
            [appName]: app
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
   * @param {Model |SpinalNode} element
   * @param {boolean} [isDirected=false]
   * @param {boolean} [asNode=false] - to put a SpinalNode inside a SpinalNode
   * @returns the created relation
   * 
   * @memberof SpinalNode
   */
  addSimpleRelationByApp(appName, relationType, element, isDirected = false, asNode = false) {
    if (this.relatedGraph.hasReservationCredentials(relationType, appName)) {
      if (this.relatedGraph.containsApp(appName)) {
        let res = {};
        let node2 = element;
        if (asNode || element.constructor.name != "SpinalNode") node2 = this.relatedGraph.addNode(element);
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
   * @param {boolean} [asNode=false] - to put a SpinalNode inside a SpinalNode
   * @returns an Object of 1)relation:the relation with the added element node in (nodeList2), 2)node: the created node
   * @memberof SpinalNode
   */
  addToExistingRelationByApp(appName, relationType, element, isDirected = false, asParent = false, asNode = false) {
    let res = {};
    let node2 = element; //initialize
    if (this.relatedGraph.hasReservationCredentials(relationType, appName)) {
      if (this.relatedGraph.containsApp(appName)) {
        if (typeof this.apps[appName] !== "undefined") {
          let appRelations = this.getRelationsByAppName(appName);
          for (let index = 0; index < appRelations.length; index++) {
            const relation = appRelations[index];
            res.relation = relation;
            if (relation.type.get() === relationType && isDirected === relation.isDirected.get()) {
              if (isDirected && this.isParent(relation)) {
                if (asNode || element.constructor.name != "SpinalNode") node2 = this.relatedGraph.addNode(element);
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
                if (asNode || element.constructor.name != "SpinalNode") node2 = this.relatedGraph.addNode(element);
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
        const appRelationList = this.apps[appName][this.apps[appName]._attribute_names[index]];
        for (let index = 0; index < appRelationList.length; index++) {
          const relation = appRelationList[index];
          res.push(relation);
        }
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
        const appRelationList = this.apps[appName][this.apps[appName]._attribute_names[index]];
        for (let index = 0; index < appRelationList.length; index++) {
          const relation = appRelationList[index];
          if (relation.type.get() === relationType) res.push(relation);else if (!relation.isDirected.get() && relation.type.get() + "-" === relationType) res.push(relation);else if (relation.type.get() + ">" === relationType) res.push(relation);else if (relation.type.get() + "<" === relationType) res.push(relation);
        }
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
      for (let index = 0; index < this.apps[appName][relationType + ">"].length; index++) {
        const relation = this.apps[appName][relationType + ">"][index];
        let nodeList2 = relation.getNodeList2();
        res = _Utilities.Utilities.concat(res, nodeList2);
      }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TcGluYWxOb2RlLmpzIl0sIm5hbWVzIjpbInNwaW5hbENvcmUiLCJyZXF1aXJlIiwiZ2xvYmFsVHlwZSIsIndpbmRvdyIsImdsb2JhbCIsImdldFZpZXdlciIsInYiLCJTcGluYWxOb2RlIiwiTW9kZWwiLCJjb25zdHJ1Y3RvciIsIl9uYW1lIiwiZWxlbWVudCIsInJlbGF0ZWRHcmFwaCIsInJlbGF0aW9ucyIsIm5hbWUiLCJGaWxlU3lzdGVtIiwiX3NpZ19zZXJ2ZXIiLCJhZGRfYXR0ciIsImlkIiwiVXRpbGl0aWVzIiwiZ3VpZCIsIlB0ciIsImFwcHMiLCJjbGFzc2lmeU5vZGUiLCJBcnJheSIsImlzQXJyYXkiLCJMc3QiLCJhZGRSZWxhdGlvbnMiLCJhZGRSZWxhdGlvbiIsInNldFR5cGUiLCJ0eXBlIiwiZ2V0QXBwc05hbWVzIiwiX2F0dHJpYnV0ZV9uYW1lcyIsImdldEVsZW1lbnQiLCJwcm9taXNlTG9hZCIsImdldEFwcHMiLCJyZXMiLCJpbmRleCIsImxlbmd0aCIsImFwcE5hbWUiLCJwdXNoIiwiYXBwc0xpc3QiLCJoYXNSZWxhdGlvbiIsImFkZERpcmVjdGVkUmVsYXRpb25QYXJlbnQiLCJyZWxhdGlvbiIsImdldCIsImNvbmNhdCIsImFkZFJlbGF0aW9uQnlBcHAiLCJhZGREaXJlY3RlZFJlbGF0aW9uQ2hpbGQiLCJhZGROb25EaXJlY3RlZFJlbGF0aW9uIiwiaXNSZXNlcnZlZCIsIm5hbWVUbXAiLCJsaXN0IiwiY29uc29sZSIsImxvZyIsInJlc2VydmVkUmVsYXRpb25zTmFtZXMiLCJoYXNSZXNlcnZhdGlvbkNyZWRlbnRpYWxzIiwiY29udGFpbnNBcHAiLCJyZWxhdGlvbkxpc3QiLCJhcHAiLCJlcnJvciIsImFkZFNpbXBsZVJlbGF0aW9uIiwicmVsYXRpb25UeXBlIiwiaXNEaXJlY3RlZCIsIm5vZGUyIiwiYWRkTm9kZSIsIm5vZGUiLCJyZWwiLCJTcGluYWxSZWxhdGlvbiIsImFkZFNpbXBsZVJlbGF0aW9uQnlBcHAiLCJhc05vZGUiLCJhZGRUb0V4aXN0aW5nUmVsYXRpb24iLCJhc1BhcmVudCIsImV4aXN0aW5nUmVsYXRpb25zIiwiZ2V0UmVsYXRpb25zIiwiaXNQYXJlbnQiLCJhZGROb2RldG9Ob2RlTGlzdDEiLCJhZGROb2RldG9Ob2RlTGlzdDIiLCJhZGRUb0V4aXN0aW5nUmVsYXRpb25CeUFwcCIsImFwcFJlbGF0aW9ucyIsImdldFJlbGF0aW9uc0J5QXBwTmFtZSIsIl9jbGFzc2lmeVJlbGF0aW9uIiwiX3JlbGF0aW9uIiwibG9hZCIsImkiLCJyZWxMaXN0IiwiaiIsImdldFJlbGF0aW9uc0J5VHlwZSIsImluY2x1ZGVzIiwidDEiLCJ0MiIsInQzIiwiaGFzQXBwRGVmaW5lZCIsImFwcFJlbGF0aW9uTGlzdCIsImdldFJlbGF0aW9uc0J5QXBwIiwiZ2V0UmVsYXRpb25zQnlBcHBOYW1lQnlUeXBlIiwiaGFzUmVsYXRpb25CeUFwcEJ5VHlwZURlZmluZWQiLCJnZXRSZWxhdGlvbnNCeUFwcEJ5VHlwZSIsImluTm9kZUxpc3QiLCJfbm9kZWxpc3QiLCJnZXROZWlnaGJvcnMiLCJuZWlnaGJvcnMiLCJub2RlTGlzdDEiLCJub2RlTGlzdDIiLCJhbGxCdXRNZUJ5SWQiLCJnZXRDaGlsZHJlbkJ5UmVsYXRpb25UeXBlIiwiZ2V0Tm9kZUxpc3QyIiwiZ2V0Tm9kZUxpc3QxIiwiY29udGFpbnNMc3RCeUlkIiwiZ2V0Q2hpbGRyZW5CeUFwcEJ5UmVsYXRpb24iLCJnZXRDaGlsZHJlbkVsZW1lbnRzQnlBcHBCeVJlbGF0aW9uIiwicmVsYXRpb25UbXAiLCJnZXRDaGlsZHJlbkVsZW1lbnRzQnlSZWxhdGlvblR5cGUiLCJnZXRQYXJlbnRzQnlSZWxhdGlvblR5cGUiLCJyZW1vdmVSZWxhdGlvbiIsInJlbGF0aW9uTHN0IiwiY2FuZGlkYXRlUmVsYXRpb24iLCJzcGxpY2UiLCJyZW1vdmVSZWxhdGlvbnMiLCJfcmVsYXRpb25zIiwicmVtb3ZlUmVsYXRpb25UeXBlIiwicmVtX2F0dHIiLCJ3YXJuIiwidG9Kc29uIiwidG9Kc29u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S0FpQks7QUFDSFQsY0FBUXFFLElBQVIsQ0FBYSxjQUFjNUQsWUFBZCxHQUNYLDJCQURXLEdBQ21CLEtBQUtoRCxJQUFMLENBQVUrQixHQUFWLEVBRG5CLEdBRVgsbUJBRlcsR0FFV04sT0FGeEI7QUFHQSxhQUFPLEtBQVA7QUFDRDtBQUNGO0FBQ0Q7Ozs7OztBQU1Bb0YsV0FBUztBQUNQLFdBQU87QUFDTHpHLFVBQUksS0FBS0EsRUFBTCxDQUFRMkIsR0FBUixFQURDO0FBRUwvQixZQUFNLEtBQUtBLElBQUwsQ0FBVStCLEdBQVYsRUFGRDtBQUdMbEMsZUFBUztBQUhKLEtBQVA7QUFLRDtBQUNEOzs7Ozs7QUFNQWlILHdCQUFzQjtBQUNwQixRQUFJL0csWUFBWSxFQUFoQjtBQUNBLFNBQUssSUFBSXdCLFFBQVEsQ0FBakIsRUFBb0JBLFFBQVEsS0FBS3FDLFlBQUwsR0FBb0JwQyxNQUFoRCxFQUF3REQsT0FBeEQsRUFBaUU7QUFDL0QsWUFBTU8sV0FBVyxLQUFLOEIsWUFBTCxHQUFvQnJDLEtBQXBCLENBQWpCO0FBQ0F4QixnQkFBVTJCLElBQVYsQ0FBZUksU0FBUytFLE1BQVQsRUFBZjtBQUNEO0FBQ0QsV0FBTztBQUNMekcsVUFBSSxLQUFLQSxFQUFMLENBQVEyQixHQUFSLEVBREM7QUFFTC9CLFlBQU0sS0FBS0EsSUFBTCxDQUFVK0IsR0FBVixFQUZEO0FBR0xsQyxlQUFTLElBSEo7QUFJTEUsaUJBQVdBO0FBSk4sS0FBUDtBQU1EO0FBQ0Q7Ozs7OztBQU1BLFFBQU1nSCxLQUFOLEdBQWM7QUFDWixRQUFJbEgsVUFBVSxNQUFNUSxxQkFBVWUsV0FBVixDQUFzQixLQUFLdkIsT0FBM0IsQ0FBcEI7QUFDQSxXQUFPQSxRQUFRa0gsS0FBUixFQUFQO0FBQ0Q7QUF2OUJ1QztrQkF5OUIzQnRILFU7O0FBQ2ZQLFdBQVc4SCxlQUFYLENBQTJCLENBQUN2SCxVQUFELENBQTNCIiwiZmlsZSI6IlNwaW5hbE5vZGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBzcGluYWxDb3JlID0gcmVxdWlyZShcInNwaW5hbC1jb3JlLWNvbm5lY3RvcmpzXCIpO1xuY29uc3QgZ2xvYmFsVHlwZSA9IHR5cGVvZiB3aW5kb3cgPT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB3aW5kb3c7XG5pbXBvcnQgU3BpbmFsUmVsYXRpb24gZnJvbSBcIi4vU3BpbmFsUmVsYXRpb25cIjtcbmxldCBnZXRWaWV3ZXIgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGdsb2JhbFR5cGUudjtcbn07XG5cbmltcG9ydCB7XG4gIFV0aWxpdGllc1xufSBmcm9tIFwiLi9VdGlsaXRpZXNcIjtcbi8qKlxuICpcbiAqXG4gKiBAZXhwb3J0XG4gKiBAY2xhc3MgU3BpbmFsTm9kZVxuICogQGV4dGVuZHMge01vZGVsfVxuICovXG5jbGFzcyBTcGluYWxOb2RlIGV4dGVuZHMgZ2xvYmFsVHlwZS5Nb2RlbCB7XG4gIC8qKlxuICAgKkNyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgU3BpbmFsTm9kZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHBhcmFtIHtNb2RlbH0gZWxlbWVudCAtIGFueSBzdWJjbGFzcyBvZiBNb2RlbFxuICAgKiBAcGFyYW0ge1NwaW5hbEdyYXBofSByZWxhdGVkR3JhcGhcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbltdfSByZWxhdGlvbnNcbiAgICogQHBhcmFtIHtzdHJpbmd9IFtuYW1lPVwiU3BpbmFsTm9kZVwiXVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgY29uc3RydWN0b3IoX25hbWUsIGVsZW1lbnQsIHJlbGF0ZWRHcmFwaCwgcmVsYXRpb25zLCBuYW1lID0gXCJTcGluYWxOb2RlXCIpIHtcbiAgICBzdXBlcigpO1xuICAgIGlmIChGaWxlU3lzdGVtLl9zaWdfc2VydmVyKSB7XG4gICAgICB0aGlzLmFkZF9hdHRyKHtcbiAgICAgICAgaWQ6IFV0aWxpdGllcy5ndWlkKHRoaXMuY29uc3RydWN0b3IubmFtZSksXG4gICAgICAgIG5hbWU6IF9uYW1lLFxuICAgICAgICBlbGVtZW50OiBuZXcgUHRyKGVsZW1lbnQpLFxuICAgICAgICByZWxhdGlvbnM6IG5ldyBNb2RlbCgpLFxuICAgICAgICBhcHBzOiBuZXcgTW9kZWwoKSxcbiAgICAgICAgcmVsYXRlZEdyYXBoOiByZWxhdGVkR3JhcGhcbiAgICAgIH0pO1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0ZWRHcmFwaCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5jbGFzc2lmeU5vZGUodGhpcyk7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHJlbGF0aW9ucyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShyZWxhdGlvbnMpIHx8IHJlbGF0aW9ucyBpbnN0YW5jZW9mIExzdClcbiAgICAgICAgICB0aGlzLmFkZFJlbGF0aW9ucyhyZWxhdGlvbnMpO1xuICAgICAgICBlbHNlIHRoaXMuYWRkUmVsYXRpb24ocmVsYXRpb25zKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBzZXRUeXBlKHR5cGUpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMudHlwZSA9PT0gXCJ1bmRlZmluZWRcIilcbiAgICAgIHRoaXMuYWRkX2F0dHIoe1xuICAgICAgICB0eXBlOiB0eXBlXG4gICAgICB9KVxuICAgIGVsc2VcbiAgICAgIHRoaXMudHlwZSA9IHR5cGVcbiAgfVxuXG4gIC8vIHJlZ2lzdGVyQXBwKGFwcCkge1xuICAvLyAgIHRoaXMuYXBwcy5hZGRfYXR0cih7XG4gIC8vICAgICBbYXBwLm5hbWUuZ2V0KCldOiBuZXcgUHRyKGFwcClcbiAgLy8gICB9KVxuICAvLyB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyBhbGwgYXBwbGljYXRpb25zIG5hbWVzIGFzIHN0cmluZ1xuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgZ2V0QXBwc05hbWVzKCkge1xuICAgIHJldHVybiB0aGlzLmFwcHMuX2F0dHJpYnV0ZV9uYW1lcztcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgQSBwcm9taXNlIG9mIHRoZSByZWxhdGVkIEVsZW1lbnQgXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhc3luYyBnZXRFbGVtZW50KCkge1xuICAgIHJldHVybiBhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQodGhpcy5lbGVtZW50KVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyBhbGwgYXBwbGljYXRpb25zXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhc3luYyBnZXRBcHBzKCkge1xuICAgIGxldCByZXMgPSBbXVxuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLmFwcHMuX2F0dHJpYnV0ZV9uYW1lcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IGFwcE5hbWUgPSB0aGlzLmFwcHMuX2F0dHJpYnV0ZV9uYW1lc1tpbmRleF07XG4gICAgICByZXMucHVzaChhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQodGhpcy5yZWxhdGVkR3JhcGguYXBwc0xpc3RbXG4gICAgICAgIGFwcE5hbWVdKSlcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICAvLyAvKipcbiAgLy8gICpcbiAgLy8gICpcbiAgLy8gICogQHBhcmFtIHsqfSByZWxhdGlvblR5cGVcbiAgLy8gICogQHBhcmFtIHsqfSByZWxhdGlvblxuICAvLyAgKiBAcGFyYW0geyp9IGFzUGFyZW50XG4gIC8vICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gIC8vICAqL1xuICAvLyBjaGFuZ2VEZWZhdWx0UmVsYXRpb24ocmVsYXRpb25UeXBlLCByZWxhdGlvbiwgYXNQYXJlbnQpIHtcbiAgLy8gICAgIGlmIChyZWxhdGlvbi5pc0RpcmVjdGVkLmdldCgpKSB7XG4gIC8vICAgICAgIGlmIChhc1BhcmVudCkge1xuICAvLyAgICAgICAgIFV0aWxpdGllcy5wdXRPblRvcExzdCh0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIj5cIl0sIHJlbGF0aW9uKTtcbiAgLy8gICAgICAgfSBlbHNlIHtcbiAgLy8gICAgICAgICBVdGlsaXRpZXMucHV0T25Ub3BMc3QodGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCI8XCJdLCByZWxhdGlvbik7XG4gIC8vICAgICAgIH1cbiAgLy8gICAgIH0gZWxzZSB7XG4gIC8vICAgICAgIFV0aWxpdGllcy5wdXRPblRvcExzdCh0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIi1cIl0sIHJlbGF0aW9uKTtcbiAgLy8gICAgIH1cbiAgLy8gICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBoYXNSZWxhdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5yZWxhdGlvbnMubGVuZ3RoICE9PSAwO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9ufSByZWxhdGlvblxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYWRkRGlyZWN0ZWRSZWxhdGlvblBhcmVudChyZWxhdGlvbiwgYXBwTmFtZSkge1xuICAgIGxldCBuYW1lID0gcmVsYXRpb24udHlwZS5nZXQoKTtcbiAgICBuYW1lID0gbmFtZS5jb25jYXQoXCI+XCIpO1xuICAgIGlmICh0eXBlb2YgYXBwTmFtZSA9PT0gXCJ1bmRlZmluZWRcIikgdGhpcy5hZGRSZWxhdGlvbihyZWxhdGlvbiwgbmFtZSk7XG4gICAgZWxzZSB0aGlzLmFkZFJlbGF0aW9uQnlBcHAocmVsYXRpb24sIG5hbWUsIGFwcE5hbWUpO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9ufSByZWxhdGlvblxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYWRkRGlyZWN0ZWRSZWxhdGlvbkNoaWxkKHJlbGF0aW9uLCBhcHBOYW1lKSB7XG4gICAgbGV0IG5hbWUgPSByZWxhdGlvbi50eXBlLmdldCgpO1xuICAgIG5hbWUgPSBuYW1lLmNvbmNhdChcIjxcIik7XG4gICAgaWYgKHR5cGVvZiBhcHBOYW1lID09PSBcInVuZGVmaW5lZFwiKSB0aGlzLmFkZFJlbGF0aW9uKHJlbGF0aW9uLCBuYW1lKTtcbiAgICBlbHNlIHRoaXMuYWRkUmVsYXRpb25CeUFwcChyZWxhdGlvbiwgbmFtZSwgYXBwTmFtZSk7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb259IHJlbGF0aW9uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhZGROb25EaXJlY3RlZFJlbGF0aW9uKHJlbGF0aW9uLCBhcHBOYW1lKSB7XG4gICAgbGV0IG5hbWUgPSByZWxhdGlvbi50eXBlLmdldCgpO1xuICAgIG5hbWUgPSBuYW1lLmNvbmNhdChcIi1cIik7XG4gICAgaWYgKHR5cGVvZiBhcHBOYW1lID09PSBcInVuZGVmaW5lZFwiKSB0aGlzLmFkZFJlbGF0aW9uKHJlbGF0aW9uLCBuYW1lKTtcbiAgICBlbHNlIHRoaXMuYWRkUmVsYXRpb25CeUFwcChyZWxhdGlvbiwgbmFtZSwgYXBwTmFtZSk7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb259IHJlbGF0aW9uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhZGRSZWxhdGlvbihyZWxhdGlvbiwgbmFtZSkge1xuICAgIGlmICghdGhpcy5yZWxhdGVkR3JhcGguaXNSZXNlcnZlZChyZWxhdGlvbi50eXBlLmdldCgpKSkge1xuICAgICAgbGV0IG5hbWVUbXAgPSByZWxhdGlvbi50eXBlLmdldCgpO1xuICAgICAgaWYgKHR5cGVvZiBuYW1lICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIG5hbWVUbXAgPSBuYW1lO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0aW9uc1tuYW1lVG1wXSAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgICAgdGhpcy5yZWxhdGlvbnNbbmFtZVRtcF0ucHVzaChyZWxhdGlvbik7XG4gICAgICBlbHNlIHtcbiAgICAgICAgbGV0IGxpc3QgPSBuZXcgTHN0KCk7XG4gICAgICAgIGxpc3QucHVzaChyZWxhdGlvbik7XG4gICAgICAgIHRoaXMucmVsYXRpb25zLmFkZF9hdHRyKHtcbiAgICAgICAgICBbbmFtZVRtcF06IGxpc3RcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICByZWxhdGlvbi50eXBlLmdldCgpICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uLnR5cGUuZ2V0KCldXG4gICAgICApO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbn0gcmVsYXRpb25cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLXJlbGF0aW9uIE5hbWUgaWYgbm90IG9yZ2luYWxseSBkZWZpbmVkXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhZGRSZWxhdGlvbkJ5QXBwKHJlbGF0aW9uLCBuYW1lLCBhcHBOYW1lKSB7XG4gICAgaWYgKHRoaXMucmVsYXRlZEdyYXBoLmhhc1Jlc2VydmF0aW9uQ3JlZGVudGlhbHMocmVsYXRpb24udHlwZS5nZXQoKSxcbiAgICAgICAgYXBwTmFtZSkpIHtcbiAgICAgIGlmICh0aGlzLnJlbGF0ZWRHcmFwaC5jb250YWluc0FwcChhcHBOYW1lKSkge1xuICAgICAgICBsZXQgbmFtZVRtcCA9IHJlbGF0aW9uLnR5cGUuZ2V0KCk7XG4gICAgICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgIG5hbWVUbXAgPSBuYW1lO1xuICAgICAgICAgIC8vIHJlbGF0aW9uLm5hbWUuc2V0KG5hbWVUbXApXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0aW9uc1tuYW1lVG1wXSAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgICAgICB0aGlzLnJlbGF0aW9uc1tuYW1lVG1wXS5wdXNoKHJlbGF0aW9uKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgbGV0IGxpc3QgPSBuZXcgTHN0KCk7XG4gICAgICAgICAgbGlzdC5wdXNoKHJlbGF0aW9uKTtcbiAgICAgICAgICB0aGlzLnJlbGF0aW9ucy5hZGRfYXR0cih7XG4gICAgICAgICAgICBbbmFtZVRtcF06IGxpc3RcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHRoaXMuYXBwc1thcHBOYW1lXSAhPT0gXCJ1bmRlZmluZWRcIiAmJiB0eXBlb2YgdGhpcy5hcHBzW1xuICAgICAgICAgICAgYXBwTmFtZV1bbmFtZVRtcF0gIT09IFwidW5kZWZpbmVkXCIpXG4gICAgICAgICAgdGhpcy5hcHBzW2FwcE5hbWVdW25hbWVUbXBdLnB1c2gocmVsYXRpb24pXG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiB0aGlzLmFwcHNbYXBwTmFtZV0gIT09IFwidW5kZWZpbmVkXCIgJiYgdHlwZW9mIHRoaXNcbiAgICAgICAgICAuYXBwc1tcbiAgICAgICAgICAgIGFwcE5hbWVdW25hbWVUbXBdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgbGV0IHJlbGF0aW9uTGlzdCA9IG5ldyBMc3QoKVxuICAgICAgICAgIHJlbGF0aW9uTGlzdC5wdXNoKHJlbGF0aW9uKVxuICAgICAgICAgIHRoaXMuYXBwc1thcHBOYW1lXS5hZGRfYXR0cih7XG4gICAgICAgICAgICBbbmFtZVRtcF06IHJlbGF0aW9uTGlzdFxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxldCBhcHAgPSBuZXcgTW9kZWwoKTtcbiAgICAgICAgICBsZXQgcmVsYXRpb25MaXN0ID0gbmV3IExzdCgpXG4gICAgICAgICAgcmVsYXRpb25MaXN0LnB1c2gocmVsYXRpb24pXG4gICAgICAgICAgYXBwLmFkZF9hdHRyKHtcbiAgICAgICAgICAgIFtuYW1lVG1wXTogcmVsYXRpb25MaXN0XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5hcHBzLmFkZF9hdHRyKHtcbiAgICAgICAgICAgIFthcHBOYW1lXTogYXBwXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYXBwTmFtZSArIFwiIGRvZXMgbm90IGV4aXN0XCIpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb24udHlwZS5nZXQoKSArXG4gICAgICAgIFwiIGlzIHJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5yZWxhdGVkR3JhcGgucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvbi50eXBlLmdldCgpXVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHBhcmFtIHtNb2RlbH0gZWxlbWVudCAtIGFuZCBzdWJjbGFzcyBvZiBNb2RlbFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0RpcmVjdGVkPWZhbHNlXVxuICAgKiBAcmV0dXJucyB0aGUgY3JlYXRlZCByZWxhdGlvbiwgdW5kZWZpbmVkIG90aGVyd2lzZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYWRkU2ltcGxlUmVsYXRpb24ocmVsYXRpb25UeXBlLCBlbGVtZW50LCBpc0RpcmVjdGVkID0gZmFsc2UpIHtcbiAgICBpZiAoIXRoaXMucmVsYXRlZEdyYXBoLmlzUmVzZXJ2ZWQocmVsYXRpb25UeXBlKSkge1xuICAgICAgbGV0IHJlcyA9IHt9XG4gICAgICBsZXQgbm9kZTIgPSB0aGlzLnJlbGF0ZWRHcmFwaC5hZGROb2RlKGVsZW1lbnQpO1xuICAgICAgcmVzLm5vZGUgPSBub2RlMlxuICAgICAgbGV0IHJlbCA9IG5ldyBTcGluYWxSZWxhdGlvbihyZWxhdGlvblR5cGUsIFt0aGlzXSwgW25vZGUyXSxcbiAgICAgICAgaXNEaXJlY3RlZCk7XG4gICAgICByZXMucmVsYXRpb24gPSByZWxcbiAgICAgIHRoaXMucmVsYXRlZEdyYXBoLmFkZFJlbGF0aW9uKHJlbCk7XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uVHlwZV1cbiAgICAgICk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEBwYXJhbSB7TW9kZWwgfFNwaW5hbE5vZGV9IGVsZW1lbnRcbiAgICogQHBhcmFtIHtib29sZWFufSBbaXNEaXJlY3RlZD1mYWxzZV1cbiAgICogQHBhcmFtIHtib29sZWFufSBbYXNOb2RlPWZhbHNlXSAtIHRvIHB1dCBhIFNwaW5hbE5vZGUgaW5zaWRlIGEgU3BpbmFsTm9kZVxuICAgKiBAcmV0dXJucyB0aGUgY3JlYXRlZCByZWxhdGlvblxuICAgKiBcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGFkZFNpbXBsZVJlbGF0aW9uQnlBcHAoYXBwTmFtZSwgcmVsYXRpb25UeXBlLCBlbGVtZW50LCBpc0RpcmVjdGVkID0gZmFsc2UsXG4gICAgYXNOb2RlID0gZmFsc2UpIHtcbiAgICBpZiAodGhpcy5yZWxhdGVkR3JhcGguaGFzUmVzZXJ2YXRpb25DcmVkZW50aWFscyhyZWxhdGlvblR5cGUsIGFwcE5hbWUpKSB7XG4gICAgICBpZiAodGhpcy5yZWxhdGVkR3JhcGguY29udGFpbnNBcHAoYXBwTmFtZSkpIHtcbiAgICAgICAgbGV0IHJlcyA9IHt9XG4gICAgICAgIGxldCBub2RlMiA9IGVsZW1lbnRcbiAgICAgICAgaWYgKGFzTm9kZSB8fCBlbGVtZW50LmNvbnN0cnVjdG9yLm5hbWUgIT0gXCJTcGluYWxOb2RlXCIpXG4gICAgICAgICAgbm9kZTIgPSB0aGlzLnJlbGF0ZWRHcmFwaC5hZGROb2RlKGVsZW1lbnQpO1xuICAgICAgICByZXMubm9kZSA9IG5vZGUyXG4gICAgICAgIGxldCByZWwgPSBuZXcgU3BpbmFsUmVsYXRpb24ocmVsYXRpb25UeXBlLCBbdGhpc10sIFtub2RlMl0sXG4gICAgICAgICAgaXNEaXJlY3RlZCk7XG4gICAgICAgIHJlcy5yZWxhdGlvbiA9IHJlbFxuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5hZGRSZWxhdGlvbihyZWwsIGFwcE5hbWUpO1xuICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihhcHBOYW1lICsgXCIgZG9lcyBub3QgZXhpc3RcIik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICByZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVsYXRlZEdyYXBoLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHBhcmFtIHtNb2RlbH0gZWxlbWVudCAtIGFueSBzdWJjbGFzcyBvZiBNb2RlbFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0RpcmVjdGVkPWZhbHNlXVxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFthc1BhcmVudD1mYWxzZV1cbiAgICogQHJldHVybnMgYW4gT2JqZWN0IG9mIDEpcmVsYXRpb246dGhlIHJlbGF0aW9uIHdpdGggdGhlIGFkZGVkIGVsZW1lbnQgbm9kZSBpbiAobm9kZUxpc3QyKSwgMilub2RlOiB0aGUgY3JlYXRlZCBub2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhZGRUb0V4aXN0aW5nUmVsYXRpb24oXG4gICAgcmVsYXRpb25UeXBlLFxuICAgIGVsZW1lbnQsXG4gICAgaXNEaXJlY3RlZCA9IGZhbHNlLFxuICAgIGFzUGFyZW50ID0gZmFsc2VcbiAgKSB7XG4gICAgbGV0IHJlcyA9IHt9XG4gICAgaWYgKCF0aGlzLnJlbGF0ZWRHcmFwaC5pc1Jlc2VydmVkKHJlbGF0aW9uVHlwZSkpIHtcbiAgICAgIGxldCBleGlzdGluZ1JlbGF0aW9ucyA9IHRoaXMuZ2V0UmVsYXRpb25zKCk7XG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgZXhpc3RpbmdSZWxhdGlvbnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IHJlbGF0aW9uID0gZXhpc3RpbmdSZWxhdGlvbnNbaW5kZXhdO1xuICAgICAgICByZXMucmVsYXRpb24gPSByZWxhdGlvblxuICAgICAgICBpZiAoXG4gICAgICAgICAgcmVsYXRpb25UeXBlID09PSByZWxhdGlvblR5cGUgJiZcbiAgICAgICAgICBpc0RpcmVjdGVkID09PSByZWxhdGlvbi5pc0RpcmVjdGVkLmdldCgpXG4gICAgICAgICkge1xuICAgICAgICAgIGlmIChpc0RpcmVjdGVkICYmIHRoaXMuaXNQYXJlbnQocmVsYXRpb24pKSB7XG4gICAgICAgICAgICBub2RlMiA9IHRoaXMucmVsYXRlZEdyYXBoLmFkZE5vZGUoZWxlbWVudCk7XG4gICAgICAgICAgICByZXMubm9kZSA9IG5vZGUyO1xuICAgICAgICAgICAgaWYgKGFzUGFyZW50KSB7XG4gICAgICAgICAgICAgIHJlbGF0aW9uLmFkZE5vZGV0b05vZGVMaXN0MShub2RlMik7XG4gICAgICAgICAgICAgIG5vZGUyLmFkZERpcmVjdGVkUmVsYXRpb25QYXJlbnQocmVsYXRpb24pO1xuICAgICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVsYXRpb24uYWRkTm9kZXRvTm9kZUxpc3QyKG5vZGUyKTtcbiAgICAgICAgICAgICAgbm9kZTIuYWRkRGlyZWN0ZWRSZWxhdGlvbkNoaWxkKHJlbGF0aW9uKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKCFpc0RpcmVjdGVkKSB7XG4gICAgICAgICAgICBub2RlMiA9IHRoaXMucmVsYXRlZEdyYXBoLmFkZE5vZGUoZWxlbWVudCk7XG4gICAgICAgICAgICByZXMubm9kZSA9IG5vZGUyO1xuICAgICAgICAgICAgcmVsYXRpb24uYWRkTm9kZXRvTm9kZUxpc3QyKG5vZGUyKTtcbiAgICAgICAgICAgIG5vZGUyLmFkZE5vbkRpcmVjdGVkUmVsYXRpb24ocmVsYXRpb24pO1xuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmFkZFNpbXBsZVJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgZWxlbWVudCwgaXNEaXJlY3RlZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICByZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVsYXRlZEdyYXBoLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHBhcmFtIHtNb2RlbHwgU3BpbmFsTm9kZX0gZWxlbWVudCAtIE1vZGVsOmFueSBzdWJjbGFzcyBvZiBNb2RlbFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0RpcmVjdGVkPWZhbHNlXVxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFthc1BhcmVudD1mYWxzZV1cbiAgICogQHBhcmFtIHtib29sZWFufSBbYXNOb2RlPWZhbHNlXSAtIHRvIHB1dCBhIFNwaW5hbE5vZGUgaW5zaWRlIGEgU3BpbmFsTm9kZVxuICAgKiBAcmV0dXJucyBhbiBPYmplY3Qgb2YgMSlyZWxhdGlvbjp0aGUgcmVsYXRpb24gd2l0aCB0aGUgYWRkZWQgZWxlbWVudCBub2RlIGluIChub2RlTGlzdDIpLCAyKW5vZGU6IHRoZSBjcmVhdGVkIG5vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGFkZFRvRXhpc3RpbmdSZWxhdGlvbkJ5QXBwKFxuICAgIGFwcE5hbWUsXG4gICAgcmVsYXRpb25UeXBlLFxuICAgIGVsZW1lbnQsXG4gICAgaXNEaXJlY3RlZCA9IGZhbHNlLFxuICAgIGFzUGFyZW50ID0gZmFsc2UsXG4gICAgYXNOb2RlID0gZmFsc2VcbiAgKSB7XG4gICAgbGV0IHJlcyA9IHt9XG4gICAgbGV0IG5vZGUyID0gZWxlbWVudDsgLy9pbml0aWFsaXplXG4gICAgaWYgKHRoaXMucmVsYXRlZEdyYXBoLmhhc1Jlc2VydmF0aW9uQ3JlZGVudGlhbHMocmVsYXRpb25UeXBlLCBhcHBOYW1lKSkge1xuICAgICAgaWYgKHRoaXMucmVsYXRlZEdyYXBoLmNvbnRhaW5zQXBwKGFwcE5hbWUpKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5hcHBzW2FwcE5hbWVdICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgbGV0IGFwcFJlbGF0aW9ucyA9IHRoaXMuZ2V0UmVsYXRpb25zQnlBcHBOYW1lKGFwcE5hbWUpO1xuICAgICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBhcHBSZWxhdGlvbnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgICBjb25zdCByZWxhdGlvbiA9IGFwcFJlbGF0aW9uc1tpbmRleF07XG4gICAgICAgICAgICByZXMucmVsYXRpb24gPSByZWxhdGlvblxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICByZWxhdGlvbi50eXBlLmdldCgpID09PSByZWxhdGlvblR5cGUgJiZcbiAgICAgICAgICAgICAgaXNEaXJlY3RlZCA9PT0gcmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgIGlmIChpc0RpcmVjdGVkICYmIHRoaXMuaXNQYXJlbnQocmVsYXRpb24pKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFzTm9kZSB8fCBlbGVtZW50LmNvbnN0cnVjdG9yLm5hbWUgIT0gXCJTcGluYWxOb2RlXCIpXG4gICAgICAgICAgICAgICAgICBub2RlMiA9IHRoaXMucmVsYXRlZEdyYXBoLmFkZE5vZGUoZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgcmVzLm5vZGUgPSBub2RlMjtcbiAgICAgICAgICAgICAgICBpZiAoYXNQYXJlbnQpIHtcbiAgICAgICAgICAgICAgICAgIHJlbGF0aW9uLmFkZE5vZGV0b05vZGVMaXN0MShub2RlMik7XG4gICAgICAgICAgICAgICAgICBub2RlMi5hZGREaXJlY3RlZFJlbGF0aW9uUGFyZW50KHJlbGF0aW9uLCBhcHBOYW1lKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHJlbGF0aW9uLmFkZE5vZGV0b05vZGVMaXN0Mihub2RlMik7XG4gICAgICAgICAgICAgICAgICBub2RlMi5hZGREaXJlY3RlZFJlbGF0aW9uQ2hpbGQocmVsYXRpb24sIGFwcE5hbWUpO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoIWlzRGlyZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoYXNOb2RlIHx8IGVsZW1lbnQuY29uc3RydWN0b3IubmFtZSAhPSBcIlNwaW5hbE5vZGVcIilcbiAgICAgICAgICAgICAgICAgIG5vZGUyID0gdGhpcy5yZWxhdGVkR3JhcGguYWRkTm9kZShlbGVtZW50KTtcbiAgICAgICAgICAgICAgICByZXMubm9kZSA9IG5vZGUyO1xuICAgICAgICAgICAgICAgIHJlbGF0aW9uLmFkZE5vZGV0b05vZGVMaXN0Mihub2RlMik7XG4gICAgICAgICAgICAgICAgbm9kZTIuYWRkTm9uRGlyZWN0ZWRSZWxhdGlvbihyZWxhdGlvbiwgYXBwTmFtZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5hZGRTaW1wbGVSZWxhdGlvbkJ5QXBwKFxuICAgICAgICAgIGFwcE5hbWUsXG4gICAgICAgICAgcmVsYXRpb25UeXBlLFxuICAgICAgICAgIGVsZW1lbnQsXG4gICAgICAgICAgaXNEaXJlY3RlZFxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihhcHBOYW1lICsgXCIgZG9lcyBub3QgZXhpc3RcIik7XG4gICAgICB9XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uVHlwZV1cbiAgICAgICk7XG4gICAgfVxuICB9XG5cblxuXG5cbiAgLy8gYWRkUmVsYXRpb24yKF9yZWxhdGlvbiwgX25hbWUpIHtcbiAgLy8gICBsZXQgY2xhc3NpZnkgPSBmYWxzZTtcbiAgLy8gICBsZXQgbmFtZSA9IF9yZWxhdGlvbi50eXBlLmdldCgpO1xuICAvLyAgIGlmICh0eXBlb2YgX25hbWUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgLy8gICAgIG5hbWUgPSBfbmFtZTtcbiAgLy8gICB9XG4gIC8vICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0aW9uc1tfcmVsYXRpb24udHlwZS5nZXQoKV0gIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgLy8gICAgIGlmIChfcmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKSkge1xuICAvLyAgICAgICBmb3IgKFxuICAvLyAgICAgICAgIGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5yZWxhdGlvbnNbX3JlbGF0aW9uLnR5cGUuZ2V0KCldLmxlbmd0aDsgaW5kZXgrK1xuICAvLyAgICAgICApIHtcbiAgLy8gICAgICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5yZWxhdGlvbnNbX3JlbGF0aW9uLnR5cGUuZ2V0KCldW2luZGV4XTtcbiAgLy8gICAgICAgICBpZiAoXG4gIC8vICAgICAgICAgICBVdGlsaXRpZXMuYXJyYXlzRXF1YWwoXG4gIC8vICAgICAgICAgICAgIF9yZWxhdGlvbi5nZXROb2RlTGlzdDFJZHMoKSxcbiAgLy8gICAgICAgICAgICAgZWxlbWVudC5nZXROb2RlTGlzdDFJZHMoKVxuICAvLyAgICAgICAgICAgKVxuICAvLyAgICAgICAgICkge1xuICAvLyAgICAgICAgICAgZWxlbWVudC5hZGROb3RFeGlzdGluZ1ZlcnRpY2VzdG9Ob2RlTGlzdDIoX3JlbGF0aW9uLm5vZGVMaXN0Mik7XG4gIC8vICAgICAgICAgfSBlbHNlIHtcbiAgLy8gICAgICAgICAgIGVsZW1lbnQucHVzaChfcmVsYXRpb24pO1xuICAvLyAgICAgICAgICAgY2xhc3NpZnkgPSB0cnVlO1xuICAvLyAgICAgICAgIH1cbiAgLy8gICAgICAgfVxuICAvLyAgICAgfSBlbHNlIHtcbiAgLy8gICAgICAgdGhpcy5yZWxhdGlvbnNbX3JlbGF0aW9uLnR5cGUuZ2V0KCldLmFkZE5vdEV4aXN0aW5nVmVydGljZXN0b1JlbGF0aW9uKFxuICAvLyAgICAgICAgIF9yZWxhdGlvblxuICAvLyAgICAgICApO1xuICAvLyAgICAgfVxuICAvLyAgIH0gZWxzZSB7XG4gIC8vICAgICBpZiAoX3JlbGF0aW9uLmlzRGlyZWN0ZWQuZ2V0KCkpIHtcbiAgLy8gICAgICAgbGV0IGxpc3QgPSBuZXcgTHN0KCk7XG4gIC8vICAgICAgIGxpc3QucHVzaChfcmVsYXRpb24pO1xuICAvLyAgICAgICB0aGlzLnJlbGF0aW9ucy5hZGRfYXR0cih7XG4gIC8vICAgICAgICAgW25hbWVdOiBsaXN0XG4gIC8vICAgICAgIH0pO1xuICAvLyAgICAgICB0aGlzLl9jbGFzc2lmeVJlbGF0aW9uKF9yZWxhdGlvbik7XG4gIC8vICAgICB9IGVsc2Uge1xuICAvLyAgICAgICB0aGlzLnJlbGF0aW9ucy5hZGRfYXR0cih7XG4gIC8vICAgICAgICAgW25hbWVdOiBfcmVsYXRpb25cbiAgLy8gICAgICAgfSk7XG4gIC8vICAgICAgIGNsYXNzaWZ5ID0gdHJ1ZTtcbiAgLy8gICAgIH1cbiAgLy8gICB9XG4gIC8vICAgaWYgKGNsYXNzaWZ5KSB0aGlzLl9jbGFzc2lmeVJlbGF0aW9uKF9yZWxhdGlvbik7XG4gIC8vIH1cblxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbn0gX3JlbGF0aW9uXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBfY2xhc3NpZnlSZWxhdGlvbihfcmVsYXRpb24pIHtcbiAgICB0aGlzLnJlbGF0ZWRHcmFwaC5sb2FkKHJlbGF0ZWRHcmFwaCA9PiB7XG4gICAgICByZWxhdGVkR3JhcGguX2NsYXNzaWZ5UmVsYXRpb24oX3JlbGF0aW9uKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vVE9ETyA6Tm90V29ya2luZ1xuICAvLyBhZGRSZWxhdGlvbihfcmVsYXRpb24pIHtcbiAgLy8gICB0aGlzLmFkZFJlbGF0aW9uKF9yZWxhdGlvbilcbiAgLy8gICB0aGlzLnJlbGF0ZWRHcmFwaC5sb2FkKHJlbGF0ZWRHcmFwaCA9PiB7XG4gIC8vICAgICByZWxhdGVkR3JhcGguX2FkZE5vdEV4aXN0aW5nVmVydGljZXNGcm9tUmVsYXRpb24oX3JlbGF0aW9uKVxuICAvLyAgIH0pXG4gIC8vIH1cbiAgLy9UT0RPIDpOb3RXb3JraW5nXG4gIC8vIGFkZFJlbGF0aW9ucyhfcmVsYXRpb25zKSB7XG4gIC8vICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IF9yZWxhdGlvbnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gIC8vICAgICB0aGlzLmFkZFJlbGF0aW9uKF9yZWxhdGlvbnNbaW5kZXhdKTtcbiAgLy8gICB9XG4gIC8vIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEByZXR1cm5zIGFsbCB0aGUgcmVsYXRpb25zIG9mIHRoaXMgTm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgZ2V0UmVsYXRpb25zKCkge1xuICAgIGxldCByZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucmVsYXRpb25zLl9hdHRyaWJ1dGVfbmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHJlbExpc3QgPSB0aGlzLnJlbGF0aW9uc1t0aGlzLnJlbGF0aW9ucy5fYXR0cmlidXRlX25hbWVzW2ldXTtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcmVsTGlzdC5sZW5ndGg7IGorKykge1xuICAgICAgICBjb25zdCByZWxhdGlvbiA9IHJlbExpc3Rbal07XG4gICAgICAgIHJlcy5wdXNoKHJlbGF0aW9uKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAgICogQHJldHVybnMgYWxsIHJlbGF0aW9ucyBvZiBhIHNwZWNpZmljIHJlbGF0aW9uIHR5cGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGdldFJlbGF0aW9uc0J5VHlwZSh0eXBlKSB7XG4gICAgbGV0IHJlcyA9IFtdO1xuICAgIGlmICghdHlwZS5pbmNsdWRlcyhcIj5cIiwgdHlwZS5sZW5ndGggLSAyKSAmJlxuICAgICAgIXR5cGUuaW5jbHVkZXMoXCI8XCIsIHR5cGUubGVuZ3RoIC0gMikgJiZcbiAgICAgICF0eXBlLmluY2x1ZGVzKFwiLVwiLCB0eXBlLmxlbmd0aCAtIDIpXG4gICAgKSB7XG4gICAgICBsZXQgdDEgPSB0eXBlLmNvbmNhdChcIj5cIik7XG4gICAgICByZXMgPSBVdGlsaXRpZXMuY29uY2F0KHJlcywgdGhpcy5nZXRSZWxhdGlvbnModDEpKTtcbiAgICAgIGxldCB0MiA9IHR5cGUuY29uY2F0KFwiPFwiKTtcbiAgICAgIHJlcyA9IFV0aWxpdGllcy5jb25jYXQocmVzLCB0aGlzLmdldFJlbGF0aW9ucyh0MikpO1xuICAgICAgbGV0IHQzID0gdHlwZS5jb25jYXQoXCItXCIpO1xuICAgICAgcmVzID0gVXRpbGl0aWVzLmNvbmNhdChyZXMsIHRoaXMuZ2V0UmVsYXRpb25zKHQzKSk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgdGhpcy5yZWxhdGlvbnNbdHlwZV0gIT09IFwidW5kZWZpbmVkXCIpIHJlcyA9IHRoaXMucmVsYXRpb25zW1xuICAgICAgdHlwZV07XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFwcE5hbWVcbiAgICogQHJldHVybnMgYW4gYXJyYXkgb2YgYWxsIHJlbGF0aW9ucyBvZiBhIHNwZWNpZmljIGFwcCBmb3IgdGhpcyBub2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBnZXRSZWxhdGlvbnNCeUFwcE5hbWUoYXBwTmFtZSkge1xuICAgIGxldCByZXMgPSBbXTtcbiAgICBpZiAodGhpcy5oYXNBcHBEZWZpbmVkKGFwcE5hbWUpKSB7XG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5hcHBzW2FwcE5hbWVdLl9hdHRyaWJ1dGVfbmFtZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IGFwcFJlbGF0aW9uTGlzdCA9IHRoaXMuYXBwc1thcHBOYW1lXVt0aGlzLmFwcHNbYXBwTmFtZV0uX2F0dHJpYnV0ZV9uYW1lc1tcbiAgICAgICAgICBpbmRleF1dO1xuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgYXBwUmVsYXRpb25MaXN0Lmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgIGNvbnN0IHJlbGF0aW9uID0gYXBwUmVsYXRpb25MaXN0W2luZGV4XTtcbiAgICAgICAgICByZXMucHVzaChyZWxhdGlvbik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG4gIC8vIC8qKlxuICAvLyAgKlxuICAvLyAgKlxuICAvLyAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAvLyAgKiBAcmV0dXJucyBhbiBvYmplY3Qgb2YgYWxsIHJlbGF0aW9ucyBvZiBhIHNwZWNpZmljIGFwcCBmb3IgdGhpcyBub2RlXG4gIC8vICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gIC8vICAqL1xuICAvLyBnZXRSZWxhdGlvbnNXaXRoS2V5c0J5QXBwTmFtZShhcHBOYW1lKSB7XG4gIC8vICAgaWYgKHRoaXMuaGFzQXBwRGVmaW5lZChhcHBOYW1lKSkge1xuICAvLyAgICAgcmV0dXJuIHRoaXMuYXBwc1thcHBOYW1lXTtcbiAgLy8gICB9XG4gIC8vIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsQXBwbGljYXRpb259IGFwcFxuICAgKiBAcmV0dXJucyBhbGwgcmVsYXRpb25zIG9mIGEgc3BlY2lmaWMgYXBwXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBnZXRSZWxhdGlvbnNCeUFwcChhcHApIHtcbiAgICBsZXQgYXBwTmFtZSA9IGFwcC5uYW1lLmdldCgpXG4gICAgcmV0dXJuIHRoaXMuZ2V0UmVsYXRpb25zQnlBcHBOYW1lKGFwcE5hbWUpXG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgYWxsIHJlbGF0aW9ucyBvZiBhIHNwZWNpZmljIGFwcCBvZiBhIHNwZWNpZmljIHR5cGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGdldFJlbGF0aW9uc0J5QXBwTmFtZUJ5VHlwZShhcHBOYW1lLCByZWxhdGlvblR5cGUpIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgaWYgKHRoaXMuaGFzUmVsYXRpb25CeUFwcEJ5VHlwZURlZmluZWQoYXBwTmFtZSwgcmVsYXRpb25UeXBlKSkge1xuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMuYXBwc1thcHBOYW1lXS5fYXR0cmlidXRlX25hbWVzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCBhcHBSZWxhdGlvbkxpc3QgPSB0aGlzLmFwcHNbYXBwTmFtZV1bdGhpcy5hcHBzW2FwcE5hbWVdLl9hdHRyaWJ1dGVfbmFtZXNbXG4gICAgICAgICAgaW5kZXhdXTtcbiAgICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGFwcFJlbGF0aW9uTGlzdC5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICBjb25zdCByZWxhdGlvbiA9IGFwcFJlbGF0aW9uTGlzdFtpbmRleF07XG4gICAgICAgICAgaWYgKHJlbGF0aW9uLnR5cGUuZ2V0KCkgPT09IHJlbGF0aW9uVHlwZSkgcmVzLnB1c2gocmVsYXRpb24pO1xuICAgICAgICAgIGVsc2UgaWYgKCFyZWxhdGlvbi5pc0RpcmVjdGVkLmdldCgpICYmIHJlbGF0aW9uLnR5cGUuZ2V0KCkgK1xuICAgICAgICAgICAgXCItXCIgPT09IHJlbGF0aW9uVHlwZSkgcmVzLnB1c2gocmVsYXRpb24pO1xuICAgICAgICAgIGVsc2UgaWYgKHJlbGF0aW9uLnR5cGUuZ2V0KCkgKyBcIj5cIiA9PT0gcmVsYXRpb25UeXBlKSByZXMucHVzaChcbiAgICAgICAgICAgIHJlbGF0aW9uKTtcbiAgICAgICAgICBlbHNlIGlmIChyZWxhdGlvbi50eXBlLmdldCgpICsgXCI8XCIgPT09IHJlbGF0aW9uVHlwZSkgcmVzLnB1c2goXG4gICAgICAgICAgICByZWxhdGlvbik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxBcHBsaWNhdGlvbn0gYXBwXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgYWxsIHJlbGF0aW9ucyBvZiBhIHNwZWNpZmljIGFwcCBvZiBhIHNwZWNpZmljIHR5cGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGdldFJlbGF0aW9uc0J5QXBwQnlUeXBlKGFwcCwgcmVsYXRpb25UeXBlKSB7XG4gICAgbGV0IGFwcE5hbWUgPSBhcHAubmFtZS5nZXQoKVxuICAgIHJldHVybiB0aGlzLmdldFJlbGF0aW9uc0J5QXBwTmFtZUJ5VHlwZShhcHBOYW1lLCByZWxhdGlvblR5cGUpXG5cbiAgfVxuICAvKipcbiAgICogIHZlcmlmeSBpZiBhbiBlbGVtZW50IGlzIGFscmVhZHkgaW4gZ2l2ZW4gbm9kZUxpc3RcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxOb2RlW119IF9ub2RlbGlzdFxuICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBpbk5vZGVMaXN0KF9ub2RlbGlzdCkge1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBfbm9kZWxpc3QubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gX25vZGVsaXN0W2luZGV4XTtcbiAgICAgIGlmIChlbGVtZW50LmlkLmdldCgpID09PSB0aGlzLmlkLmdldCgpKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy9UT0RPIGdldENoaWxkcmVuLCBnZXRQYXJlbnRcbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGUgLSBvcHRpb25hbFxuICAgKiBAcmV0dXJucyBhIGxpc3Qgb2YgbmVpZ2hib3JzIG5vZGVzIFxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgZ2V0TmVpZ2hib3JzKHJlbGF0aW9uVHlwZSkge1xuICAgIGxldCBuZWlnaGJvcnMgPSBbXTtcbiAgICBsZXQgcmVsYXRpb25zID0gdGhpcy5nZXRSZWxhdGlvbnMocmVsYXRpb25UeXBlKTtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcmVsYXRpb25zLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgcmVsYXRpb24gPSByZWxhdGlvbnNbaW5kZXhdO1xuICAgICAgaWYgKHJlbGF0aW9uLmlzRGlyZWN0ZWQuZ2V0KCkpIHtcbiAgICAgICAgaWYgKHRoaXMuaW5Ob2RlTGlzdChyZWxhdGlvbi5ub2RlTGlzdDEpKVxuICAgICAgICAgIG5laWdoYm9ycyA9IFV0aWxpdGllcy5jb25jYXQobmVpZ2hib3JzLCByZWxhdGlvbi5ub2RlTGlzdDIpO1xuICAgICAgICBlbHNlIG5laWdoYm9ycyA9IFV0aWxpdGllcy5jb25jYXQobmVpZ2hib3JzLCByZWxhdGlvbi5ub2RlTGlzdDEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmVpZ2hib3JzID0gVXRpbGl0aWVzLmNvbmNhdChcbiAgICAgICAgICBuZWlnaGJvcnMsXG4gICAgICAgICAgVXRpbGl0aWVzLmFsbEJ1dE1lQnlJZChyZWxhdGlvbi5ub2RlTGlzdDEpXG4gICAgICAgICk7XG4gICAgICAgIG5laWdoYm9ycyA9IFV0aWxpdGllcy5jb25jYXQoXG4gICAgICAgICAgbmVpZ2hib3JzLFxuICAgICAgICAgIFV0aWxpdGllcy5hbGxCdXRNZUJ5SWQocmVsYXRpb24ubm9kZUxpc3QyKVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmVpZ2hib3JzO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgYXJyYXkgb2Ygc3BpbmFsTm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgZ2V0Q2hpbGRyZW5CeVJlbGF0aW9uVHlwZShyZWxhdGlvblR5cGUpIHtcbiAgICBsZXQgcmVzID0gW11cbiAgICBpZiAodGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCI+XCJdKVxuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMucmVsYXRpb25zW3JlbGF0aW9uVHlwZSArIFwiPlwiXS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgcmVsYXRpb24gPSB0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIj5cIl1baW5kZXhdO1xuICAgICAgICBsZXQgbm9kZUxpc3QyID0gcmVsYXRpb24uZ2V0Tm9kZUxpc3QyKCk7XG4gICAgICAgIHJlcyA9IFV0aWxpdGllcy5jb25jYXQocmVzLCBub2RlTGlzdDIpXG4gICAgICB9XG4gICAgcmV0dXJuIHJlc1xuICB9XG5cbiAgLy9UT0RPXG4gIC8vIC8qKlxuICAvLyAgKlxuICAvLyAgKlxuICAvLyAgKiBAcGFyYW0ge3N0cmluZ3xTcGluYWxSZWxhdGlvbn0gcmVsYXRpb25cbiAgLy8gICogQHJldHVybnMgYm9vbGVhblxuICAvLyAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAvLyAgKi9cbiAgLy8gaXNQYXJlbnQocmVsYXRpb24pIHtcbiAgLy8gICBpZiAodHlwZW9mIHJlbGF0aW9uID09PSBcInN0cmluZ1wiKSB7XG4gIC8vICAgICBpZiAodHlwZW9mIHRoaXMucmVsYXRpb25zW3JlbGF0aW9uICsgXCI+XCJdICE9IFwidW5kZWZpbmVkXCIpIHtcbiAgLy8gICAgICAgbGV0IHJlbGF0aW9ucyA9IHRoaXMucmVsYXRpb25zW3JlbGF0aW9uICsgXCI+XCJdXG4gIC8vICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCByZWxhdGlvbnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gIC8vICAgICAgICAgY29uc3QgcmVsYXRpb24gPSByZWxhdGlvbnNbaW5kZXhdO1xuICAvLyAgICAgICAgIGxldCBub2RlTGlzdDEgPSByZWxhdGlvbi5nZXROb2RlTGlzdDEoKVxuICAvLyAgICAgICAgIHJldHVybiBVdGlsaXRpZXMuY29udGFpbnNMc3RCeUlkKG5vZGVMaXN0MSwgdGhpcylcbiAgLy8gICAgICAgfVxuICAvLyAgICAgfVxuICAvLyAgIH0gZWxzZSB7XG4gIC8vICAgICBsZXQgbm9kZUxpc3QxID0gcmVsYXRpb24uZ2V0Tm9kZUxpc3QxKClcbiAgLy8gICAgIHJldHVybiBVdGlsaXRpZXMuY29udGFpbnNMc3RCeUlkKG5vZGVMaXN0MSwgdGhpcylcbiAgLy8gICB9XG4gIC8vICAgcmV0dXJuIGZhbHNlO1xuICAvLyB9XG5cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb259IHJlbGF0aW9uXG4gICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGlzUGFyZW50KHJlbGF0aW9uKSB7XG4gICAgbGV0IG5vZGVMaXN0MSA9IHJlbGF0aW9uLmdldE5vZGVMaXN0MSgpXG4gICAgcmV0dXJuIFV0aWxpdGllcy5jb250YWluc0xzdEJ5SWQobm9kZUxpc3QxLCB0aGlzKVxuICB9XG5cbiAgLy9UT0RPXG4gIC8vIC8qKlxuICAvLyAgKlxuICAvLyAgKlxuICAvLyAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9ufSByZWxhdGlvblxuICAvLyAgKiBAcmV0dXJucyBib29sZWFuXG4gIC8vICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gIC8vICAqL1xuICAvLyBpc0NoaWxkKHJlbGF0aW9uKSB7XG4gIC8vICAgbGV0IG5vZGVMaXN0MiA9IHJlbGF0aW9uLmdldE5vZGVMaXN0MigpXG4gIC8vICAgcmV0dXJuIFV0aWxpdGllcy5jb250YWluc0xzdEJ5SWQobm9kZUxpc3QyLCB0aGlzKVxuICAvLyB9XG5cbiAgLy9UT0RPIE9wdGltaXplXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZyB8IFNwaW5hbEFwcGxpY2F0aW9ufSBhcHBOYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nIHwgU3BpbmFsUmVsYXRpb259IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBhcnJheSBvZiBzcGluYWxOb2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBnZXRDaGlsZHJlbkJ5QXBwQnlSZWxhdGlvbihhcHAsIHJlbGF0aW9uKSB7XG4gICAgbGV0IGFwcE5hbWUgPSBcIlwiXG4gICAgbGV0IHJlbGF0aW9uVHlwZSA9IFwiXCJcbiAgICBsZXQgcmVzID0gW11cbiAgICBpZiAodHlwZW9mIGFwcCAhPSBcInN0cmluZ1wiKVxuICAgICAgYXBwTmFtZSA9IGFwcC5uYW1lLmdldCgpXG4gICAgZWxzZVxuICAgICAgYXBwTmFtZSA9IGFwcFxuICAgIGlmICh0eXBlb2YgYXBwICE9IFwic3RyaW5nXCIpXG4gICAgICByZWxhdGlvblR5cGUgPSByZWxhdGlvbi5uYW1lLmdldCgpXG4gICAgZWxzZVxuICAgICAgcmVsYXRpb25UeXBlID0gcmVsYXRpb25cbiAgICBpZiAodHlwZW9mIHRoaXMuYXBwc1thcHBOYW1lXSAhPSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiB0aGlzLmFwcHNbXG4gICAgICAgIGFwcE5hbWVdW3JlbGF0aW9uVHlwZSArIFwiPlwiXSAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5hcHBzW2FwcE5hbWVdW3JlbGF0aW9uVHlwZSArIFwiPlwiXS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgcmVsYXRpb24gPSB0aGlzLmFwcHNbYXBwTmFtZV1bcmVsYXRpb25UeXBlICsgXCI+XCJdW2luZGV4XTtcbiAgICAgICAgbGV0IG5vZGVMaXN0MiA9IHJlbGF0aW9uLmdldE5vZGVMaXN0MigpXG4gICAgICAgIHJlcyA9IFV0aWxpdGllcy5jb25jYXQocmVzLCBub2RlTGlzdDIpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXNcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZyB8IFNwaW5hbEFwcGxpY2F0aW9ufSBhcHBOYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nIHwgU3BpbmFsUmVsYXRpb259IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyAgQSBwcm9taXNlIG9mIGFuIGFycmF5IG9mIE1vZGVsc1xuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYXN5bmMgZ2V0Q2hpbGRyZW5FbGVtZW50c0J5QXBwQnlSZWxhdGlvbihhcHAsIHJlbGF0aW9uKSB7XG4gICAgbGV0IGFwcE5hbWUgPSBcIlwiXG4gICAgbGV0IHJlbGF0aW9uVHlwZSA9IFwiXCJcbiAgICBsZXQgcmVzID0gW11cbiAgICBpZiAodHlwZW9mIGFwcCAhPSBcInN0cmluZ1wiKVxuICAgICAgYXBwTmFtZSA9IGFwcC5uYW1lLmdldCgpXG4gICAgZWxzZVxuICAgICAgYXBwTmFtZSA9IGFwcFxuICAgIGlmICh0eXBlb2YgYXBwICE9IFwic3RyaW5nXCIpXG4gICAgICByZWxhdGlvblR5cGUgPSByZWxhdGlvbi5uYW1lLmdldCgpXG4gICAgZWxzZVxuICAgICAgcmVsYXRpb25UeXBlID0gcmVsYXRpb25cbiAgICBpZiAodHlwZW9mIHRoaXMuYXBwc1thcHBOYW1lXSAhPSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiB0aGlzLmFwcHNbXG4gICAgICAgIGFwcE5hbWVdW3JlbGF0aW9uVHlwZSArIFwiPlwiXSAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBsZXQgcmVsYXRpb25UbXAgPSB0aGlzLmFwcHNbYXBwTmFtZV1bcmVsYXRpb25UeXBlICsgXCI+XCJdXG4gICAgICBsZXQgbm9kZUxpc3QyID0gcmVsYXRpb25UbXAuZ2V0Tm9kZUxpc3QyKClcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBub2RlTGlzdDIubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBub2RlTGlzdDJbaW5kZXhdO1xuICAgICAgICByZXMucHVzaChhd2FpdCBub2RlLmdldEVsZW1lbnQoKSlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgQSBwcm9taXNlIG9mIGFuIGFycmF5IG9mIE1vZGVsc1xuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYXN5bmMgZ2V0Q2hpbGRyZW5FbGVtZW50c0J5UmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSkge1xuICAgIGxldCByZXMgPSBbXVxuICAgIGlmICh0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIj5cIl0pXG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCI+XCJdLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCByZWxhdGlvbiA9IHRoaXMucmVsYXRpb25zW3JlbGF0aW9uVHlwZSArIFwiPlwiXVtpbmRleF07XG4gICAgICAgIGxldCBub2RlTGlzdDIgPSByZWxhdGlvbi5nZXROb2RlTGlzdDIoKTtcbiAgICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IG5vZGVMaXN0Mi5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICBjb25zdCBub2RlID0gbm9kZUxpc3QyW2luZGV4XTtcbiAgICAgICAgICByZXMucHVzaChhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQobm9kZS5lbGVtZW50KSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIHJldHVybiByZXNcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEByZXR1cm5zIGFycmF5IG9mIHNwaW5hbE5vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGdldFBhcmVudHNCeVJlbGF0aW9uVHlwZShyZWxhdGlvblR5cGUpIHtcbiAgICBsZXQgcmVzID0gW11cbiAgICBpZiAodGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCI8XCJdKVxuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMucmVsYXRpb25zW3JlbGF0aW9uVHlwZSArIFwiPFwiXS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgcmVsYXRpb24gPSB0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIjxcIl1baW5kZXhdO1xuICAgICAgICBsZXQgbm9kZUxpc3QxID0gcmVsYXRpb24uZ2V0Tm9kZUxpc3QxKCk7XG4gICAgICAgIHJlcyA9IFV0aWxpdGllcy5jb25jYXQocmVzLCBub2RlTGlzdDEpXG4gICAgICB9XG4gICAgcmV0dXJuIHJlc1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9ufSBfcmVsYXRpb25cbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIHJlbW92ZVJlbGF0aW9uKF9yZWxhdGlvbikge1xuICAgIGxldCByZWxhdGlvbkxzdCA9IHRoaXMucmVsYXRpb25zW19yZWxhdGlvbi50eXBlLmdldCgpXTtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcmVsYXRpb25Mc3QubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCBjYW5kaWRhdGVSZWxhdGlvbiA9IHJlbGF0aW9uTHN0W2luZGV4XTtcbiAgICAgIGlmIChfcmVsYXRpb24uaWQuZ2V0KCkgPT09IGNhbmRpZGF0ZVJlbGF0aW9uLmlkLmdldCgpKVxuICAgICAgICByZWxhdGlvbkxzdC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbltdfSBfcmVsYXRpb25zXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICByZW1vdmVSZWxhdGlvbnMoX3JlbGF0aW9ucykge1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBfcmVsYXRpb25zLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgdGhpcy5yZW1vdmVSZWxhdGlvbihfcmVsYXRpb25zW2luZGV4XSk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICByZW1vdmVSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkocmVsYXRpb25UeXBlKSB8fCByZWxhdGlvblR5cGUgaW5zdGFuY2VvZiBMc3QpXG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcmVsYXRpb25UeXBlLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCB0eXBlID0gcmVsYXRpb25UeXBlW2luZGV4XTtcbiAgICAgICAgdGhpcy5yZWxhdGlvbnMucmVtX2F0dHIodHlwZSk7XG4gICAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLnJlbGF0aW9ucy5yZW1fYXR0cihyZWxhdGlvblR5cGUpO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFwcE5hbWVcbiAgICogQHJldHVybnMgYm9vbGVhblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgaGFzQXBwRGVmaW5lZChhcHBOYW1lKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLmFwcHNbYXBwTmFtZV0gIT09IFwidW5kZWZpbmVkXCIpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKFwiYXBwIFwiICsgYXBwTmFtZSArXG4gICAgICAgIFwiIGlzIG5vdCBkZWZpbmVkIGZvciBub2RlIFwiICsgdGhpcy5uYW1lLmdldCgpKTtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFwcE5hbWVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBib29sZWFuIFxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgaGFzUmVsYXRpb25CeUFwcEJ5VHlwZURlZmluZWQoYXBwTmFtZSwgcmVsYXRpb25UeXBlKSB7XG4gICAgaWYgKHRoaXMuaGFzQXBwRGVmaW5lZChhcHBOYW1lKSAmJiB0eXBlb2YgdGhpcy5hcHBzW2FwcE5hbWVdW1xuICAgICAgICByZWxhdGlvblR5cGVcbiAgICAgIF0gIT09XG4gICAgICBcInVuZGVmaW5lZFwiIHx8IHRoaXMuaGFzQXBwRGVmaW5lZChhcHBOYW1lKSAmJiB0eXBlb2YgdGhpcy5hcHBzW1xuICAgICAgICBhcHBOYW1lXVtcbiAgICAgICAgcmVsYXRpb25UeXBlICsgXCItXCJcbiAgICAgIF0gIT09XG4gICAgICBcInVuZGVmaW5lZFwiIHx8IHRoaXMuaGFzQXBwRGVmaW5lZChhcHBOYW1lKSAmJiB0eXBlb2YgdGhpcy5hcHBzW1xuICAgICAgICBhcHBOYW1lXVtcbiAgICAgICAgcmVsYXRpb25UeXBlICsgXCI+XCJcbiAgICAgIF0gIT09XG4gICAgICBcInVuZGVmaW5lZFwiIHx8IHRoaXMuaGFzQXBwRGVmaW5lZChhcHBOYW1lKSAmJiB0eXBlb2YgdGhpcy5hcHBzW1xuICAgICAgICBhcHBOYW1lXVtcbiAgICAgICAgcmVsYXRpb25UeXBlICsgXCI8XCJcbiAgICAgIF0gIT09XG4gICAgICBcInVuZGVmaW5lZFwiKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICBlbHNlIHtcbiAgICAgIGNvbnNvbGUud2FybihcInJlbGF0aW9uIFwiICsgcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgaXMgbm90IGRlZmluZWQgZm9yIG5vZGUgXCIgKyB0aGlzLm5hbWUuZ2V0KCkgK1xuICAgICAgICBcIiBmb3IgYXBwbGljYXRpb24gXCIgKyBhcHBOYW1lKTtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgQSBqc29uIHJlcHJlc2VudGluZyB0aGUgbm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgdG9Kc29uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpZDogdGhpcy5pZC5nZXQoKSxcbiAgICAgIG5hbWU6IHRoaXMubmFtZS5nZXQoKSxcbiAgICAgIGVsZW1lbnQ6IG51bGxcbiAgICB9O1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyBBIGpzb24gcmVwcmVzZW50aW5nIHRoZSBub2RlIHdpdGggaXRzIHJlbGF0aW9uc1xuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgdG9Kc29uV2l0aFJlbGF0aW9ucygpIHtcbiAgICBsZXQgcmVsYXRpb25zID0gW107XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMuZ2V0UmVsYXRpb25zKCkubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCByZWxhdGlvbiA9IHRoaXMuZ2V0UmVsYXRpb25zKClbaW5kZXhdO1xuICAgICAgcmVsYXRpb25zLnB1c2gocmVsYXRpb24udG9Kc29uKCkpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IHRoaXMuaWQuZ2V0KCksXG4gICAgICBuYW1lOiB0aGlzLm5hbWUuZ2V0KCksXG4gICAgICBlbGVtZW50OiBudWxsLFxuICAgICAgcmVsYXRpb25zOiByZWxhdGlvbnNcbiAgICB9O1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyBBbiBJRkMgbGlrZSBmb3JtYXQgcmVwcmVzZW50aW5nIHRoZSBub2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhc3luYyB0b0lmYygpIHtcbiAgICBsZXQgZWxlbWVudCA9IGF3YWl0IFV0aWxpdGllcy5wcm9taXNlTG9hZCh0aGlzLmVsZW1lbnQpO1xuICAgIHJldHVybiBlbGVtZW50LnRvSWZjKCk7XG4gIH1cbn1cbmV4cG9ydCBkZWZhdWx0IFNwaW5hbE5vZGVcbnNwaW5hbENvcmUucmVnaXN0ZXJfbW9kZWxzKFtTcGluYWxOb2RlXSk7Il19