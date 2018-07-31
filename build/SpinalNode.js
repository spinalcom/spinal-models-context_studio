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
   * @param {string} appName
   * @param {string} type
   * @memberof SpinalNode
   */
  addType(appName, type) {
    if (typeof this.type === "undefined") this.add_attr({
      type: new Model()
    });
    this.type.add_attr({
      [appName]: type
    });
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

  /**
   *
   *
   * @param {string | SpinalApplication} app
   * @param {string | SpinalRelation} relation
   * @param {SpinalNode} node
   * @param {boolean} [isDirected=false]
   * @memberof SpinalNode
   */
  removeFromExistingRelationByApp(app, relation, node, isDirected = false) {
    let appName = "";
    if (typeof app != "string") appName = app.name.get();else appName = app;
    let relationType = "";
    if (typeof relation != "string") relationType = relation.type.get();else relationType = relation;
    let relations = this.getRelationsByAppNameByType(appName, relationType);
    for (let index = 0; index < relations.length; index++) {
      const relation = relations[index];
      if (relation.isDirected.get() === isDirected) relation.removeFromNodeList2(node);
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
   * @param {string} asParent
   * @returns an array of all relations of a specific app for this node
   * @memberof SpinalNode
   */
  getRelationsByAppName(appName, asParent) {
    let res = [];
    if (this.hasAppDefined(appName)) {
      for (let index = 0; index < this.apps[appName]._attribute_names.length; index++) {
        if (typeof asParent != "undefined") {
          if (this.apps[appName]._attribute_names[index].includes(">", this.apps[appName]._attribute_names[index].length - 2)) {
            const appRelationList = this.apps[appName][this.apps[appName]._attribute_names[index]];
            for (let index = 0; index < appRelationList.length; index++) {
              const relation = appRelationList[index];
              res.push(relation);
            }
          }
        } else {
          const appRelationList = this.apps[appName][this.apps[appName]._attribute_names[index]];
          for (let index = 0; index < appRelationList.length; index++) {
            const relation = appRelationList[index];
            res.push(relation);
          }
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
   * @param {SpinalApplication | string} app
   * @param {string} asParent
   * @returns all relations of a specific app
   * @memberof SpinalNode
   */
  getRelationsByApp(app, asParent) {
    let appName = "";
    if (typeof app != "string") appName = app.name.get();else appName = app;
    return this.getRelationsByAppName(appName, asParent);
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

  getChildrenByApp(app) {
    let res = [];
    if (this.hasChildren()) {
      let relations = this.getRelationsByApp(app, true);
      for (let index = 0; index < relations.length; index++) {
        const relation = relations[index];
        res = res.concat(this.getChildrenByAppByRelation(app, relation));
      }
    }
    return res;
  }
  /**
   *
   *
   * @returns boolean
   * @memberof SpinalNode
   */
  hasChildren() {
    for (let index = 0; index < this.relations._attribute_names.length; index++) {
      const relationsName = this.relations._attribute_names[index];
      if (relationsName.includes(">", relationsName.length - 2)) return true;
    }
    return false;
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
   * @param {string | SpinalApplication} app
   * @param {string | SpinalRelation} relationType
   * @returns array of spinalNode
   * @memberof SpinalNode
   */
  getChildrenByAppByRelation(app, relation) {
    let appName = "";
    let relationType = "";
    let res = [];
    if (typeof app != "string") appName = app.name.get();else appName = app;
    if (typeof relation != "string") relationType = relation.type.get();else relationType = relation;
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
    if (typeof relation != "string") relationType = relation.type.get();else relationType = relation;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TcGluYWxOb2RlLmpzIl0sIm5hbWVzIjpbInNwaW5hbENvcmUiLCJyZXF1aXJlIiwiZ2xvYmFsVHlwZSIsIndpbmRvdyIsImdsb2JhbCIsImdldFZpZXdlciIsInYiLCJTcGluYWxOb2RlIiwiTW9kZWwiLCJjb25zdHJ1Y3RvciIsIl9uYW1lIiwiZWxlbWVudCIsInJlbGF0ZWRHcmFwaCIsInJlbGF0aW9ucyIsIm5hbWUiLCJGaWxlU3lzdGVtIiwiX3NpZ19zZXJ2ZXIiLCJhZGRfYXR0ciIsImlkIiwiVXRpbGl0aWVzIiwiZ3VpZCIsIlB0ciIsImFwcHMiLCJjbGFzc2lmeU5vZGUiLCJBcnJheSIsImlzQXJyYXkiLCJMc3QiLCJhZGRSZWxhdGlvbnMiLCJhZGRSZWxhdGlvbiIsImFkZFR5cGUiLCJhcHBOYW1lIiwidHlwZSIsImdldEFwcHNOYW1lcyIsIl9hdHRyaWJ1dGVfbmFtZXMiLCJnZXRFbGVtZW50IiwicHJvbWlzZUxvYWQiLCJnZXRBcHBzIiwicmVzIiwiaW5kZXgiLCJsZW5ndGgiLCJwdXNoIiwiYXBwc0xpc3QiLCJoYXNSZWxhdGlvbiIsImFkZERpcmVjdGVkUmVsYXRpb25QYXJlbnQiLCJyZWxhdGlvbiIsImdldCIsImNvbmNhdCIsImFkZFJlbGF0aW9uQnlBcHAiLCJhZGREaXJlY3RlZFJlbGF0aW9uQ2hpbGQiLCJhZGROb25EaXJlY3RlZFJlbGF0aW9uIiwiaXNSZXNlcnZlZCIsIm5hbWVUbXAiLCJsaXN0IiwiY29uc29sZSIsImxvZyIsInJlc2VydmVkUmVsYXRpb25zTmFtZXMiLCJoYXNSZXNlcnZhdGlvbkNyZWRlbnRpYWxzIiwiY29udGFpbnNBcHAiLCJyZWxhdGlvbkxpc3QiLCJhcHAiLCJlcnJvciIsImFkZFNpbXBsZVJlbGF0aW9uIiwicmVsYXRpb25UeXBlIiwiaXNEaXJlY3RlZCIsIm5vZGUyIiwiYWRkTm9kZSIsIm5vZGUiLCJyZWwiLCJTcGluYWxSZWxhdGlvbiIsImFkZFNpbXBsZVJlbGF0aW9uQnlBcHAiLCJhc05vZGUiLCJhZGRUb0V4aXN0aW5nUmVsYXRpb24iLCJhc1BhcmVudCIsImV4aXN0aW5nUmVsYXRpb25zIiwiZ2V0UmVsYXRpb25zIiwiaXNQYXJlbnQiLCJhZGROb2RldG9Ob2RlTGlzdDEiLCJhZGROb2RldG9Ob2RlTGlzdDIiLCJhZGRUb0V4aXN0aW5nUmVsYXRpb25CeUFwcCIsImFwcFJlbGF0aW9ucyIsImdldFJlbGF0aW9uc0J5QXBwTmFtZSIsInJlbW92ZUZyb21FeGlzdGluZ1JlbGF0aW9uQnlBcHAiLCJnZXRSZWxhdGlvbnNCeUFwcE5hbWVCeVR5cGUiLCJyZW1vdmVGcm9tTm9kZUxpc3QyIiwiX2NsYXNzaWZ5UmVsYXRpb24iLCJfcmVsYXRpb24iLCJsb2FkIiwiaSIsInJlbExpc3QiLCJqIiwiZ2V0UmVsYXRpb25zQnlUeXBlIiwiaW5jbHVkZXMiLCJ0MSIsInQyIiwidDMiLCJoYXNBcHBEZWZpbmVkIiwiYXBwUmVsYXRpb25MaXN0IiwiZ2V0UmVsYXRpb25zQnlBcHAiLCJoYXNSZWxhdGlvbkJ5QXBwQnlUeXBlRGVmaW5lZCIsImdldFJlbGF0aW9uc0J5QXBwQnlUeXBlIiwiaW5Ob2RlTGlzdCIsIl9ub2RlbGlzdCIsImdldE5laWdoYm9ycyIsIm5laWdoYm9ycyIsIm5vZGVMaXN0MSIsIm5vZGVMaXN0MiIsImFsbEJ1dE1lQnlJZCIsImdldENoaWxkcmVuQnlBcHAiLCJoYXNDaGlsZHJlbiIsImdldENoaWxkcmVuQnlBcHBCeVJlbGF0aW9uIiwicmVsYXRpb25zTmFtZSIsImdldENoaWxkcmVuQnlSZWxhdGlvblR5cGUiLCJnZXROb2RlTGlzdDIiLCJnZXROb2RlTGlzdDEiLCJjb250YWluc0xzdEJ5SWQiLCJnZXRDaGlsZHJlbkVsZW1lbnRzQnlBcHBCeVJlbGF0aW9uIiwicmVsYXRpb25UbXAiLCJnZXRDaGlsZHJlbkVsZW1lbnRzQnlSZWxhdGlvblR5cGUiLCJnZXRQYXJlbnRzQnlSZWxhdGlvblR5cGUiLCJyZW1vdmVSZWxhdGlvbiIsInJlbGF0aW9uTHN0IiwiY2FuZGlkYXRlUmVsYXRpb24iLCJzcGxpY2UiLCJyZW1vdmVSZWxhdGlvbnMiLCJfcmVsYXRpb25zIiwicmVtb3ZlUmVsYXRpb25UeXBlIiwicmVtX2F0dHIiLCJ3YXJuIiwidG9Kc29uIiwidG9Kc29uV2l0aFJlbGF0aW9ucyIsInRvSWZjIiwicmVnaXN0ZXJfbW9kZWxzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFFQTs7OztBQUtBOzs7O0FBUEEsTUFBTUEsYUFBYUMsUUFBUSx5QkFBUixDQUFuQjtBQUNBLE1BQU1DLGFBQWEsT0FBT0MsTUFBUCxLQUFrQixXQUFsQixHQUFnQ0MsTUFBaEMsR0FBeUNELE1BQTVEOztBQUVBLElBQUlFLFlBQVksWUFBVztBQUN6QixTQUFPSCxXQUFXSSxDQUFsQjtBQUNELENBRkQ7O0FBT0E7Ozs7Ozs7QUFPQSxNQUFNQyxVQUFOLFNBQXlCTCxXQUFXTSxLQUFwQyxDQUEwQztBQUN4Qzs7Ozs7Ozs7O0FBU0FDLGNBQVlDLEtBQVosRUFBbUJDLE9BQW5CLEVBQTRCQyxZQUE1QixFQUEwQ0MsU0FBMUMsRUFBcURDLE9BQU8sWUFBNUQsRUFBMEU7QUFDeEU7QUFDQSxRQUFJQyxXQUFXQyxXQUFmLEVBQTRCO0FBQzFCLFdBQUtDLFFBQUwsQ0FBYztBQUNaQyxZQUFJQyxxQkFBVUMsSUFBVixDQUFlLEtBQUtYLFdBQUwsQ0FBaUJLLElBQWhDLENBRFE7QUFFWkEsY0FBTUosS0FGTTtBQUdaQyxpQkFBUyxJQUFJVSxHQUFKLENBQVFWLE9BQVIsQ0FIRztBQUlaRSxtQkFBVyxJQUFJTCxLQUFKLEVBSkM7QUFLWmMsY0FBTSxJQUFJZCxLQUFKLEVBTE07QUFNWkksc0JBQWNBO0FBTkYsT0FBZDtBQVFBLFVBQUksT0FBTyxLQUFLQSxZQUFaLEtBQTZCLFdBQWpDLEVBQThDO0FBQzVDLGFBQUtBLFlBQUwsQ0FBa0JXLFlBQWxCLENBQStCLElBQS9CO0FBQ0Q7QUFDRCxVQUFJLE9BQU9WLFNBQVAsS0FBcUIsV0FBekIsRUFBc0M7QUFDcEMsWUFBSVcsTUFBTUMsT0FBTixDQUFjWixTQUFkLEtBQTRC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YztBQUNaLFFBQUl2SCxVQUFVLE1BQU1RLHFCQUFVZ0IsV0FBVixDQUFzQixLQUFLeEIsT0FBM0IsQ0FBcEI7QUFDQSxXQUFPQSxRQUFRdUgsS0FBUixFQUFQO0FBQ0Q7QUF0aUN1QztrQkF3aUMzQjNILFU7O0FBQ2ZQLFdBQVdtSSxlQUFYLENBQTJCLENBQUM1SCxVQUFELENBQTNCIiwiZmlsZSI6IlNwaW5hbE5vZGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBzcGluYWxDb3JlID0gcmVxdWlyZShcInNwaW5hbC1jb3JlLWNvbm5lY3RvcmpzXCIpO1xuY29uc3QgZ2xvYmFsVHlwZSA9IHR5cGVvZiB3aW5kb3cgPT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB3aW5kb3c7XG5pbXBvcnQgU3BpbmFsUmVsYXRpb24gZnJvbSBcIi4vU3BpbmFsUmVsYXRpb25cIjtcbmxldCBnZXRWaWV3ZXIgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGdsb2JhbFR5cGUudjtcbn07XG5cbmltcG9ydCB7XG4gIFV0aWxpdGllc1xufSBmcm9tIFwiLi9VdGlsaXRpZXNcIjtcbi8qKlxuICpcbiAqXG4gKiBAZXhwb3J0XG4gKiBAY2xhc3MgU3BpbmFsTm9kZVxuICogQGV4dGVuZHMge01vZGVsfVxuICovXG5jbGFzcyBTcGluYWxOb2RlIGV4dGVuZHMgZ2xvYmFsVHlwZS5Nb2RlbCB7XG4gIC8qKlxuICAgKkNyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgU3BpbmFsTm9kZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHBhcmFtIHtNb2RlbH0gZWxlbWVudCAtIGFueSBzdWJjbGFzcyBvZiBNb2RlbFxuICAgKiBAcGFyYW0ge1NwaW5hbEdyYXBofSByZWxhdGVkR3JhcGhcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbltdfSByZWxhdGlvbnNcbiAgICogQHBhcmFtIHtzdHJpbmd9IFtuYW1lPVwiU3BpbmFsTm9kZVwiXVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgY29uc3RydWN0b3IoX25hbWUsIGVsZW1lbnQsIHJlbGF0ZWRHcmFwaCwgcmVsYXRpb25zLCBuYW1lID0gXCJTcGluYWxOb2RlXCIpIHtcbiAgICBzdXBlcigpO1xuICAgIGlmIChGaWxlU3lzdGVtLl9zaWdfc2VydmVyKSB7XG4gICAgICB0aGlzLmFkZF9hdHRyKHtcbiAgICAgICAgaWQ6IFV0aWxpdGllcy5ndWlkKHRoaXMuY29uc3RydWN0b3IubmFtZSksXG4gICAgICAgIG5hbWU6IF9uYW1lLFxuICAgICAgICBlbGVtZW50OiBuZXcgUHRyKGVsZW1lbnQpLFxuICAgICAgICByZWxhdGlvbnM6IG5ldyBNb2RlbCgpLFxuICAgICAgICBhcHBzOiBuZXcgTW9kZWwoKSxcbiAgICAgICAgcmVsYXRlZEdyYXBoOiByZWxhdGVkR3JhcGhcbiAgICAgIH0pO1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0ZWRHcmFwaCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5jbGFzc2lmeU5vZGUodGhpcyk7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHJlbGF0aW9ucyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShyZWxhdGlvbnMpIHx8IHJlbGF0aW9ucyBpbnN0YW5jZW9mIExzdClcbiAgICAgICAgICB0aGlzLmFkZFJlbGF0aW9ucyhyZWxhdGlvbnMpO1xuICAgICAgICBlbHNlIHRoaXMuYWRkUmVsYXRpb24ocmVsYXRpb25zKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhZGRUeXBlKGFwcE5hbWUsIHR5cGUpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMudHlwZSA9PT0gXCJ1bmRlZmluZWRcIilcbiAgICAgIHRoaXMuYWRkX2F0dHIoe1xuICAgICAgICB0eXBlOiBuZXcgTW9kZWwoKVxuICAgICAgfSlcbiAgICB0aGlzLnR5cGUuYWRkX2F0dHIoe1xuICAgICAgW2FwcE5hbWVdOiB0eXBlXG4gICAgfSlcbiAgfVxuXG4gIC8vIHJlZ2lzdGVyQXBwKGFwcCkge1xuICAvLyAgIHRoaXMuYXBwcy5hZGRfYXR0cih7XG4gIC8vICAgICBbYXBwLm5hbWUuZ2V0KCldOiBuZXcgUHRyKGFwcClcbiAgLy8gICB9KVxuICAvLyB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyBhbGwgYXBwbGljYXRpb25zIG5hbWVzIGFzIHN0cmluZ1xuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgZ2V0QXBwc05hbWVzKCkge1xuICAgIHJldHVybiB0aGlzLmFwcHMuX2F0dHJpYnV0ZV9uYW1lcztcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgQSBwcm9taXNlIG9mIHRoZSByZWxhdGVkIEVsZW1lbnQgXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhc3luYyBnZXRFbGVtZW50KCkge1xuICAgIHJldHVybiBhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQodGhpcy5lbGVtZW50KVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyBhbGwgYXBwbGljYXRpb25zXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhc3luYyBnZXRBcHBzKCkge1xuICAgIGxldCByZXMgPSBbXVxuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLmFwcHMuX2F0dHJpYnV0ZV9uYW1lcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IGFwcE5hbWUgPSB0aGlzLmFwcHMuX2F0dHJpYnV0ZV9uYW1lc1tpbmRleF07XG4gICAgICByZXMucHVzaChhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQodGhpcy5yZWxhdGVkR3JhcGguYXBwc0xpc3RbXG4gICAgICAgIGFwcE5hbWVdKSlcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICAvLyAvKipcbiAgLy8gICpcbiAgLy8gICpcbiAgLy8gICogQHBhcmFtIHsqfSByZWxhdGlvblR5cGVcbiAgLy8gICogQHBhcmFtIHsqfSByZWxhdGlvblxuICAvLyAgKiBAcGFyYW0geyp9IGFzUGFyZW50XG4gIC8vICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gIC8vICAqL1xuICAvLyBjaGFuZ2VEZWZhdWx0UmVsYXRpb24ocmVsYXRpb25UeXBlLCByZWxhdGlvbiwgYXNQYXJlbnQpIHtcbiAgLy8gICAgIGlmIChyZWxhdGlvbi5pc0RpcmVjdGVkLmdldCgpKSB7XG4gIC8vICAgICAgIGlmIChhc1BhcmVudCkge1xuICAvLyAgICAgICAgIFV0aWxpdGllcy5wdXRPblRvcExzdCh0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIj5cIl0sIHJlbGF0aW9uKTtcbiAgLy8gICAgICAgfSBlbHNlIHtcbiAgLy8gICAgICAgICBVdGlsaXRpZXMucHV0T25Ub3BMc3QodGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCI8XCJdLCByZWxhdGlvbik7XG4gIC8vICAgICAgIH1cbiAgLy8gICAgIH0gZWxzZSB7XG4gIC8vICAgICAgIFV0aWxpdGllcy5wdXRPblRvcExzdCh0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIi1cIl0sIHJlbGF0aW9uKTtcbiAgLy8gICAgIH1cbiAgLy8gICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBoYXNSZWxhdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5yZWxhdGlvbnMubGVuZ3RoICE9PSAwO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9ufSByZWxhdGlvblxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYWRkRGlyZWN0ZWRSZWxhdGlvblBhcmVudChyZWxhdGlvbiwgYXBwTmFtZSkge1xuICAgIGxldCBuYW1lID0gcmVsYXRpb24udHlwZS5nZXQoKTtcbiAgICBuYW1lID0gbmFtZS5jb25jYXQoXCI+XCIpO1xuICAgIGlmICh0eXBlb2YgYXBwTmFtZSA9PT0gXCJ1bmRlZmluZWRcIikgdGhpcy5hZGRSZWxhdGlvbihyZWxhdGlvbiwgbmFtZSk7XG4gICAgZWxzZSB0aGlzLmFkZFJlbGF0aW9uQnlBcHAocmVsYXRpb24sIG5hbWUsIGFwcE5hbWUpO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9ufSByZWxhdGlvblxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYWRkRGlyZWN0ZWRSZWxhdGlvbkNoaWxkKHJlbGF0aW9uLCBhcHBOYW1lKSB7XG4gICAgbGV0IG5hbWUgPSByZWxhdGlvbi50eXBlLmdldCgpO1xuICAgIG5hbWUgPSBuYW1lLmNvbmNhdChcIjxcIik7XG4gICAgaWYgKHR5cGVvZiBhcHBOYW1lID09PSBcInVuZGVmaW5lZFwiKSB0aGlzLmFkZFJlbGF0aW9uKHJlbGF0aW9uLCBuYW1lKTtcbiAgICBlbHNlIHRoaXMuYWRkUmVsYXRpb25CeUFwcChyZWxhdGlvbiwgbmFtZSwgYXBwTmFtZSk7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb259IHJlbGF0aW9uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhZGROb25EaXJlY3RlZFJlbGF0aW9uKHJlbGF0aW9uLCBhcHBOYW1lKSB7XG4gICAgbGV0IG5hbWUgPSByZWxhdGlvbi50eXBlLmdldCgpO1xuICAgIG5hbWUgPSBuYW1lLmNvbmNhdChcIi1cIik7XG4gICAgaWYgKHR5cGVvZiBhcHBOYW1lID09PSBcInVuZGVmaW5lZFwiKSB0aGlzLmFkZFJlbGF0aW9uKHJlbGF0aW9uLCBuYW1lKTtcbiAgICBlbHNlIHRoaXMuYWRkUmVsYXRpb25CeUFwcChyZWxhdGlvbiwgbmFtZSwgYXBwTmFtZSk7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb259IHJlbGF0aW9uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhZGRSZWxhdGlvbihyZWxhdGlvbiwgbmFtZSkge1xuICAgIGlmICghdGhpcy5yZWxhdGVkR3JhcGguaXNSZXNlcnZlZChyZWxhdGlvbi50eXBlLmdldCgpKSkge1xuICAgICAgbGV0IG5hbWVUbXAgPSByZWxhdGlvbi50eXBlLmdldCgpO1xuICAgICAgaWYgKHR5cGVvZiBuYW1lICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIG5hbWVUbXAgPSBuYW1lO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0aW9uc1tuYW1lVG1wXSAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgICAgdGhpcy5yZWxhdGlvbnNbbmFtZVRtcF0ucHVzaChyZWxhdGlvbik7XG4gICAgICBlbHNlIHtcbiAgICAgICAgbGV0IGxpc3QgPSBuZXcgTHN0KCk7XG4gICAgICAgIGxpc3QucHVzaChyZWxhdGlvbik7XG4gICAgICAgIHRoaXMucmVsYXRpb25zLmFkZF9hdHRyKHtcbiAgICAgICAgICBbbmFtZVRtcF06IGxpc3RcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICByZWxhdGlvbi50eXBlLmdldCgpICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uLnR5cGUuZ2V0KCldXG4gICAgICApO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbn0gcmVsYXRpb25cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLXJlbGF0aW9uIE5hbWUgaWYgbm90IG9yZ2luYWxseSBkZWZpbmVkXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhZGRSZWxhdGlvbkJ5QXBwKHJlbGF0aW9uLCBuYW1lLCBhcHBOYW1lKSB7XG4gICAgaWYgKHRoaXMucmVsYXRlZEdyYXBoLmhhc1Jlc2VydmF0aW9uQ3JlZGVudGlhbHMocmVsYXRpb24udHlwZS5nZXQoKSxcbiAgICAgICAgYXBwTmFtZSkpIHtcbiAgICAgIGlmICh0aGlzLnJlbGF0ZWRHcmFwaC5jb250YWluc0FwcChhcHBOYW1lKSkge1xuICAgICAgICBsZXQgbmFtZVRtcCA9IHJlbGF0aW9uLnR5cGUuZ2V0KCk7XG4gICAgICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgIG5hbWVUbXAgPSBuYW1lO1xuICAgICAgICAgIC8vIHJlbGF0aW9uLm5hbWUuc2V0KG5hbWVUbXApXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0aW9uc1tuYW1lVG1wXSAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgICAgICB0aGlzLnJlbGF0aW9uc1tuYW1lVG1wXS5wdXNoKHJlbGF0aW9uKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgbGV0IGxpc3QgPSBuZXcgTHN0KCk7XG4gICAgICAgICAgbGlzdC5wdXNoKHJlbGF0aW9uKTtcbiAgICAgICAgICB0aGlzLnJlbGF0aW9ucy5hZGRfYXR0cih7XG4gICAgICAgICAgICBbbmFtZVRtcF06IGxpc3RcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHRoaXMuYXBwc1thcHBOYW1lXSAhPT0gXCJ1bmRlZmluZWRcIiAmJiB0eXBlb2YgdGhpcy5hcHBzW1xuICAgICAgICAgICAgYXBwTmFtZV1bbmFtZVRtcF0gIT09IFwidW5kZWZpbmVkXCIpXG4gICAgICAgICAgdGhpcy5hcHBzW2FwcE5hbWVdW25hbWVUbXBdLnB1c2gocmVsYXRpb24pXG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiB0aGlzLmFwcHNbYXBwTmFtZV0gIT09IFwidW5kZWZpbmVkXCIgJiYgdHlwZW9mIHRoaXNcbiAgICAgICAgICAuYXBwc1tcbiAgICAgICAgICAgIGFwcE5hbWVdW25hbWVUbXBdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgbGV0IHJlbGF0aW9uTGlzdCA9IG5ldyBMc3QoKVxuICAgICAgICAgIHJlbGF0aW9uTGlzdC5wdXNoKHJlbGF0aW9uKVxuICAgICAgICAgIHRoaXMuYXBwc1thcHBOYW1lXS5hZGRfYXR0cih7XG4gICAgICAgICAgICBbbmFtZVRtcF06IHJlbGF0aW9uTGlzdFxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxldCBhcHAgPSBuZXcgTW9kZWwoKTtcbiAgICAgICAgICBsZXQgcmVsYXRpb25MaXN0ID0gbmV3IExzdCgpXG4gICAgICAgICAgcmVsYXRpb25MaXN0LnB1c2gocmVsYXRpb24pXG4gICAgICAgICAgYXBwLmFkZF9hdHRyKHtcbiAgICAgICAgICAgIFtuYW1lVG1wXTogcmVsYXRpb25MaXN0XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5hcHBzLmFkZF9hdHRyKHtcbiAgICAgICAgICAgIFthcHBOYW1lXTogYXBwXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYXBwTmFtZSArIFwiIGRvZXMgbm90IGV4aXN0XCIpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb24udHlwZS5nZXQoKSArXG4gICAgICAgIFwiIGlzIHJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5yZWxhdGVkR3JhcGgucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvbi50eXBlLmdldCgpXVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHBhcmFtIHtNb2RlbH0gZWxlbWVudCAtIGFuZCBzdWJjbGFzcyBvZiBNb2RlbFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0RpcmVjdGVkPWZhbHNlXVxuICAgKiBAcmV0dXJucyB0aGUgY3JlYXRlZCByZWxhdGlvbiwgdW5kZWZpbmVkIG90aGVyd2lzZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYWRkU2ltcGxlUmVsYXRpb24ocmVsYXRpb25UeXBlLCBlbGVtZW50LCBpc0RpcmVjdGVkID0gZmFsc2UpIHtcbiAgICBpZiAoIXRoaXMucmVsYXRlZEdyYXBoLmlzUmVzZXJ2ZWQocmVsYXRpb25UeXBlKSkge1xuICAgICAgbGV0IHJlcyA9IHt9XG4gICAgICBsZXQgbm9kZTIgPSB0aGlzLnJlbGF0ZWRHcmFwaC5hZGROb2RlKGVsZW1lbnQpO1xuICAgICAgcmVzLm5vZGUgPSBub2RlMlxuICAgICAgbGV0IHJlbCA9IG5ldyBTcGluYWxSZWxhdGlvbihyZWxhdGlvblR5cGUsIFt0aGlzXSwgW25vZGUyXSxcbiAgICAgICAgaXNEaXJlY3RlZCk7XG4gICAgICByZXMucmVsYXRpb24gPSByZWxcbiAgICAgIHRoaXMucmVsYXRlZEdyYXBoLmFkZFJlbGF0aW9uKHJlbCk7XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uVHlwZV1cbiAgICAgICk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEBwYXJhbSB7TW9kZWwgfFNwaW5hbE5vZGV9IGVsZW1lbnRcbiAgICogQHBhcmFtIHtib29sZWFufSBbaXNEaXJlY3RlZD1mYWxzZV1cbiAgICogQHBhcmFtIHtib29sZWFufSBbYXNOb2RlPWZhbHNlXSAtIHRvIHB1dCBhIFNwaW5hbE5vZGUgaW5zaWRlIGEgU3BpbmFsTm9kZVxuICAgKiBAcmV0dXJucyB0aGUgY3JlYXRlZCByZWxhdGlvblxuICAgKiBcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGFkZFNpbXBsZVJlbGF0aW9uQnlBcHAoYXBwTmFtZSwgcmVsYXRpb25UeXBlLCBlbGVtZW50LCBpc0RpcmVjdGVkID0gZmFsc2UsXG4gICAgYXNOb2RlID0gZmFsc2UpIHtcbiAgICBpZiAodGhpcy5yZWxhdGVkR3JhcGguaGFzUmVzZXJ2YXRpb25DcmVkZW50aWFscyhyZWxhdGlvblR5cGUsIGFwcE5hbWUpKSB7XG4gICAgICBpZiAodGhpcy5yZWxhdGVkR3JhcGguY29udGFpbnNBcHAoYXBwTmFtZSkpIHtcbiAgICAgICAgbGV0IHJlcyA9IHt9XG4gICAgICAgIGxldCBub2RlMiA9IGVsZW1lbnRcbiAgICAgICAgaWYgKGFzTm9kZSB8fCBlbGVtZW50LmNvbnN0cnVjdG9yLm5hbWUgIT0gXCJTcGluYWxOb2RlXCIpXG4gICAgICAgICAgbm9kZTIgPSB0aGlzLnJlbGF0ZWRHcmFwaC5hZGROb2RlKGVsZW1lbnQpO1xuICAgICAgICByZXMubm9kZSA9IG5vZGUyXG4gICAgICAgIGxldCByZWwgPSBuZXcgU3BpbmFsUmVsYXRpb24ocmVsYXRpb25UeXBlLCBbdGhpc10sIFtub2RlMl0sXG4gICAgICAgICAgaXNEaXJlY3RlZCk7XG4gICAgICAgIHJlcy5yZWxhdGlvbiA9IHJlbFxuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5hZGRSZWxhdGlvbihyZWwsIGFwcE5hbWUpO1xuICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihhcHBOYW1lICsgXCIgZG9lcyBub3QgZXhpc3RcIik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICByZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVsYXRlZEdyYXBoLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHBhcmFtIHtNb2RlbH0gZWxlbWVudCAtIGFueSBzdWJjbGFzcyBvZiBNb2RlbFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0RpcmVjdGVkPWZhbHNlXVxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFthc1BhcmVudD1mYWxzZV1cbiAgICogQHJldHVybnMgYW4gT2JqZWN0IG9mIDEpcmVsYXRpb246dGhlIHJlbGF0aW9uIHdpdGggdGhlIGFkZGVkIGVsZW1lbnQgbm9kZSBpbiAobm9kZUxpc3QyKSwgMilub2RlOiB0aGUgY3JlYXRlZCBub2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhZGRUb0V4aXN0aW5nUmVsYXRpb24oXG4gICAgcmVsYXRpb25UeXBlLFxuICAgIGVsZW1lbnQsXG4gICAgaXNEaXJlY3RlZCA9IGZhbHNlLFxuICAgIGFzUGFyZW50ID0gZmFsc2VcbiAgKSB7XG4gICAgbGV0IHJlcyA9IHt9XG4gICAgaWYgKCF0aGlzLnJlbGF0ZWRHcmFwaC5pc1Jlc2VydmVkKHJlbGF0aW9uVHlwZSkpIHtcbiAgICAgIGxldCBleGlzdGluZ1JlbGF0aW9ucyA9IHRoaXMuZ2V0UmVsYXRpb25zKCk7XG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgZXhpc3RpbmdSZWxhdGlvbnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IHJlbGF0aW9uID0gZXhpc3RpbmdSZWxhdGlvbnNbaW5kZXhdO1xuICAgICAgICByZXMucmVsYXRpb24gPSByZWxhdGlvblxuICAgICAgICBpZiAoXG4gICAgICAgICAgcmVsYXRpb25UeXBlID09PSByZWxhdGlvblR5cGUgJiZcbiAgICAgICAgICBpc0RpcmVjdGVkID09PSByZWxhdGlvbi5pc0RpcmVjdGVkLmdldCgpXG4gICAgICAgICkge1xuICAgICAgICAgIGlmIChpc0RpcmVjdGVkICYmIHRoaXMuaXNQYXJlbnQocmVsYXRpb24pKSB7XG4gICAgICAgICAgICBub2RlMiA9IHRoaXMucmVsYXRlZEdyYXBoLmFkZE5vZGUoZWxlbWVudCk7XG4gICAgICAgICAgICByZXMubm9kZSA9IG5vZGUyO1xuICAgICAgICAgICAgaWYgKGFzUGFyZW50KSB7XG4gICAgICAgICAgICAgIHJlbGF0aW9uLmFkZE5vZGV0b05vZGVMaXN0MShub2RlMik7XG4gICAgICAgICAgICAgIG5vZGUyLmFkZERpcmVjdGVkUmVsYXRpb25QYXJlbnQocmVsYXRpb24pO1xuICAgICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVsYXRpb24uYWRkTm9kZXRvTm9kZUxpc3QyKG5vZGUyKTtcbiAgICAgICAgICAgICAgbm9kZTIuYWRkRGlyZWN0ZWRSZWxhdGlvbkNoaWxkKHJlbGF0aW9uKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKCFpc0RpcmVjdGVkKSB7XG4gICAgICAgICAgICBub2RlMiA9IHRoaXMucmVsYXRlZEdyYXBoLmFkZE5vZGUoZWxlbWVudCk7XG4gICAgICAgICAgICByZXMubm9kZSA9IG5vZGUyO1xuICAgICAgICAgICAgcmVsYXRpb24uYWRkTm9kZXRvTm9kZUxpc3QyKG5vZGUyKTtcbiAgICAgICAgICAgIG5vZGUyLmFkZE5vbkRpcmVjdGVkUmVsYXRpb24ocmVsYXRpb24pO1xuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmFkZFNpbXBsZVJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgZWxlbWVudCwgaXNEaXJlY3RlZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICByZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVsYXRlZEdyYXBoLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHBhcmFtIHtNb2RlbHwgU3BpbmFsTm9kZX0gZWxlbWVudCAtIE1vZGVsOmFueSBzdWJjbGFzcyBvZiBNb2RlbFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0RpcmVjdGVkPWZhbHNlXVxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFthc1BhcmVudD1mYWxzZV1cbiAgICogQHBhcmFtIHtib29sZWFufSBbYXNOb2RlPWZhbHNlXSAtIHRvIHB1dCBhIFNwaW5hbE5vZGUgaW5zaWRlIGEgU3BpbmFsTm9kZVxuICAgKiBAcmV0dXJucyBhbiBPYmplY3Qgb2YgMSlyZWxhdGlvbjp0aGUgcmVsYXRpb24gd2l0aCB0aGUgYWRkZWQgZWxlbWVudCBub2RlIGluIChub2RlTGlzdDIpLCAyKW5vZGU6IHRoZSBjcmVhdGVkIG5vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGFkZFRvRXhpc3RpbmdSZWxhdGlvbkJ5QXBwKFxuICAgIGFwcE5hbWUsXG4gICAgcmVsYXRpb25UeXBlLFxuICAgIGVsZW1lbnQsXG4gICAgaXNEaXJlY3RlZCA9IGZhbHNlLFxuICAgIGFzUGFyZW50ID0gZmFsc2UsXG4gICAgYXNOb2RlID0gZmFsc2VcbiAgKSB7XG4gICAgbGV0IHJlcyA9IHt9XG4gICAgbGV0IG5vZGUyID0gZWxlbWVudDsgLy9pbml0aWFsaXplXG4gICAgaWYgKHRoaXMucmVsYXRlZEdyYXBoLmhhc1Jlc2VydmF0aW9uQ3JlZGVudGlhbHMocmVsYXRpb25UeXBlLCBhcHBOYW1lKSkge1xuICAgICAgaWYgKHRoaXMucmVsYXRlZEdyYXBoLmNvbnRhaW5zQXBwKGFwcE5hbWUpKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5hcHBzW2FwcE5hbWVdICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgbGV0IGFwcFJlbGF0aW9ucyA9IHRoaXMuZ2V0UmVsYXRpb25zQnlBcHBOYW1lKGFwcE5hbWUpO1xuICAgICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBhcHBSZWxhdGlvbnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgICBjb25zdCByZWxhdGlvbiA9IGFwcFJlbGF0aW9uc1tpbmRleF07XG4gICAgICAgICAgICByZXMucmVsYXRpb24gPSByZWxhdGlvblxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICByZWxhdGlvbi50eXBlLmdldCgpID09PSByZWxhdGlvblR5cGUgJiZcbiAgICAgICAgICAgICAgaXNEaXJlY3RlZCA9PT0gcmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgIGlmIChpc0RpcmVjdGVkICYmIHRoaXMuaXNQYXJlbnQocmVsYXRpb24pKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFzTm9kZSB8fCBlbGVtZW50LmNvbnN0cnVjdG9yLm5hbWUgIT0gXCJTcGluYWxOb2RlXCIpXG4gICAgICAgICAgICAgICAgICBub2RlMiA9IHRoaXMucmVsYXRlZEdyYXBoLmFkZE5vZGUoZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgcmVzLm5vZGUgPSBub2RlMjtcbiAgICAgICAgICAgICAgICBpZiAoYXNQYXJlbnQpIHtcbiAgICAgICAgICAgICAgICAgIHJlbGF0aW9uLmFkZE5vZGV0b05vZGVMaXN0MShub2RlMik7XG4gICAgICAgICAgICAgICAgICBub2RlMi5hZGREaXJlY3RlZFJlbGF0aW9uUGFyZW50KHJlbGF0aW9uLCBhcHBOYW1lKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHJlbGF0aW9uLmFkZE5vZGV0b05vZGVMaXN0Mihub2RlMik7XG4gICAgICAgICAgICAgICAgICBub2RlMi5hZGREaXJlY3RlZFJlbGF0aW9uQ2hpbGQocmVsYXRpb24sIGFwcE5hbWUpO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoIWlzRGlyZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoYXNOb2RlIHx8IGVsZW1lbnQuY29uc3RydWN0b3IubmFtZSAhPSBcIlNwaW5hbE5vZGVcIilcbiAgICAgICAgICAgICAgICAgIG5vZGUyID0gdGhpcy5yZWxhdGVkR3JhcGguYWRkTm9kZShlbGVtZW50KTtcbiAgICAgICAgICAgICAgICByZXMubm9kZSA9IG5vZGUyO1xuICAgICAgICAgICAgICAgIHJlbGF0aW9uLmFkZE5vZGV0b05vZGVMaXN0Mihub2RlMik7XG4gICAgICAgICAgICAgICAgbm9kZTIuYWRkTm9uRGlyZWN0ZWRSZWxhdGlvbihyZWxhdGlvbiwgYXBwTmFtZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5hZGRTaW1wbGVSZWxhdGlvbkJ5QXBwKFxuICAgICAgICAgIGFwcE5hbWUsXG4gICAgICAgICAgcmVsYXRpb25UeXBlLFxuICAgICAgICAgIGVsZW1lbnQsXG4gICAgICAgICAgaXNEaXJlY3RlZFxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihhcHBOYW1lICsgXCIgZG9lcyBub3QgZXhpc3RcIik7XG4gICAgICB9XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uVHlwZV1cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nIHwgU3BpbmFsQXBwbGljYXRpb259IGFwcFxuICAgKiBAcGFyYW0ge3N0cmluZyB8IFNwaW5hbFJlbGF0aW9ufSByZWxhdGlvblxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGV9IG5vZGVcbiAgICogQHBhcmFtIHtib29sZWFufSBbaXNEaXJlY3RlZD1mYWxzZV1cbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIHJlbW92ZUZyb21FeGlzdGluZ1JlbGF0aW9uQnlBcHAoXG4gICAgYXBwLFxuICAgIHJlbGF0aW9uLFxuICAgIG5vZGUsXG4gICAgaXNEaXJlY3RlZCA9IGZhbHNlKSB7XG4gICAgbGV0IGFwcE5hbWUgPSBcIlwiXG4gICAgaWYgKHR5cGVvZiBhcHAgIT0gXCJzdHJpbmdcIilcbiAgICAgIGFwcE5hbWUgPSBhcHAubmFtZS5nZXQoKVxuICAgIGVsc2VcbiAgICAgIGFwcE5hbWUgPSBhcHBcbiAgICBsZXQgcmVsYXRpb25UeXBlID0gXCJcIlxuICAgIGlmICh0eXBlb2YgcmVsYXRpb24gIT0gXCJzdHJpbmdcIilcbiAgICAgIHJlbGF0aW9uVHlwZSA9IHJlbGF0aW9uLnR5cGUuZ2V0KClcbiAgICBlbHNlXG4gICAgICByZWxhdGlvblR5cGUgPSByZWxhdGlvblxuICAgIGxldCByZWxhdGlvbnMgPSB0aGlzLmdldFJlbGF0aW9uc0J5QXBwTmFtZUJ5VHlwZShhcHBOYW1lLCByZWxhdGlvblR5cGUpXG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHJlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IHJlbGF0aW9uID0gcmVsYXRpb25zW2luZGV4XTtcbiAgICAgIGlmIChyZWxhdGlvbi5pc0RpcmVjdGVkLmdldCgpID09PSBpc0RpcmVjdGVkKVxuICAgICAgICByZWxhdGlvbi5yZW1vdmVGcm9tTm9kZUxpc3QyKG5vZGUpXG4gICAgfVxuXG4gIH1cblxuXG5cblxuICAvLyBhZGRSZWxhdGlvbjIoX3JlbGF0aW9uLCBfbmFtZSkge1xuICAvLyAgIGxldCBjbGFzc2lmeSA9IGZhbHNlO1xuICAvLyAgIGxldCBuYW1lID0gX3JlbGF0aW9uLnR5cGUuZ2V0KCk7XG4gIC8vICAgaWYgKHR5cGVvZiBfbmFtZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAvLyAgICAgbmFtZSA9IF9uYW1lO1xuICAvLyAgIH1cbiAgLy8gICBpZiAodHlwZW9mIHRoaXMucmVsYXRpb25zW19yZWxhdGlvbi50eXBlLmdldCgpXSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAvLyAgICAgaWYgKF9yZWxhdGlvbi5pc0RpcmVjdGVkLmdldCgpKSB7XG4gIC8vICAgICAgIGZvciAoXG4gIC8vICAgICAgICAgbGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLnJlbGF0aW9uc1tfcmVsYXRpb24udHlwZS5nZXQoKV0ubGVuZ3RoOyBpbmRleCsrXG4gIC8vICAgICAgICkge1xuICAvLyAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLnJlbGF0aW9uc1tfcmVsYXRpb24udHlwZS5nZXQoKV1baW5kZXhdO1xuICAvLyAgICAgICAgIGlmIChcbiAgLy8gICAgICAgICAgIFV0aWxpdGllcy5hcnJheXNFcXVhbChcbiAgLy8gICAgICAgICAgICAgX3JlbGF0aW9uLmdldE5vZGVMaXN0MUlkcygpLFxuICAvLyAgICAgICAgICAgICBlbGVtZW50LmdldE5vZGVMaXN0MUlkcygpXG4gIC8vICAgICAgICAgICApXG4gIC8vICAgICAgICAgKSB7XG4gIC8vICAgICAgICAgICBlbGVtZW50LmFkZE5vdEV4aXN0aW5nVmVydGljZXN0b05vZGVMaXN0MihfcmVsYXRpb24ubm9kZUxpc3QyKTtcbiAgLy8gICAgICAgICB9IGVsc2Uge1xuICAvLyAgICAgICAgICAgZWxlbWVudC5wdXNoKF9yZWxhdGlvbik7XG4gIC8vICAgICAgICAgICBjbGFzc2lmeSA9IHRydWU7XG4gIC8vICAgICAgICAgfVxuICAvLyAgICAgICB9XG4gIC8vICAgICB9IGVsc2Uge1xuICAvLyAgICAgICB0aGlzLnJlbGF0aW9uc1tfcmVsYXRpb24udHlwZS5nZXQoKV0uYWRkTm90RXhpc3RpbmdWZXJ0aWNlc3RvUmVsYXRpb24oXG4gIC8vICAgICAgICAgX3JlbGF0aW9uXG4gIC8vICAgICAgICk7XG4gIC8vICAgICB9XG4gIC8vICAgfSBlbHNlIHtcbiAgLy8gICAgIGlmIChfcmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKSkge1xuICAvLyAgICAgICBsZXQgbGlzdCA9IG5ldyBMc3QoKTtcbiAgLy8gICAgICAgbGlzdC5wdXNoKF9yZWxhdGlvbik7XG4gIC8vICAgICAgIHRoaXMucmVsYXRpb25zLmFkZF9hdHRyKHtcbiAgLy8gICAgICAgICBbbmFtZV06IGxpc3RcbiAgLy8gICAgICAgfSk7XG4gIC8vICAgICAgIHRoaXMuX2NsYXNzaWZ5UmVsYXRpb24oX3JlbGF0aW9uKTtcbiAgLy8gICAgIH0gZWxzZSB7XG4gIC8vICAgICAgIHRoaXMucmVsYXRpb25zLmFkZF9hdHRyKHtcbiAgLy8gICAgICAgICBbbmFtZV06IF9yZWxhdGlvblxuICAvLyAgICAgICB9KTtcbiAgLy8gICAgICAgY2xhc3NpZnkgPSB0cnVlO1xuICAvLyAgICAgfVxuICAvLyAgIH1cbiAgLy8gICBpZiAoY2xhc3NpZnkpIHRoaXMuX2NsYXNzaWZ5UmVsYXRpb24oX3JlbGF0aW9uKTtcbiAgLy8gfVxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9ufSBfcmVsYXRpb25cbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIF9jbGFzc2lmeVJlbGF0aW9uKF9yZWxhdGlvbikge1xuICAgIHRoaXMucmVsYXRlZEdyYXBoLmxvYWQocmVsYXRlZEdyYXBoID0+IHtcbiAgICAgIHJlbGF0ZWRHcmFwaC5fY2xhc3NpZnlSZWxhdGlvbihfcmVsYXRpb24pO1xuICAgIH0pO1xuICB9XG5cbiAgLy9UT0RPIDpOb3RXb3JraW5nXG4gIC8vIGFkZFJlbGF0aW9uKF9yZWxhdGlvbikge1xuICAvLyAgIHRoaXMuYWRkUmVsYXRpb24oX3JlbGF0aW9uKVxuICAvLyAgIHRoaXMucmVsYXRlZEdyYXBoLmxvYWQocmVsYXRlZEdyYXBoID0+IHtcbiAgLy8gICAgIHJlbGF0ZWRHcmFwaC5fYWRkTm90RXhpc3RpbmdWZXJ0aWNlc0Zyb21SZWxhdGlvbihfcmVsYXRpb24pXG4gIC8vICAgfSlcbiAgLy8gfVxuICAvL1RPRE8gOk5vdFdvcmtpbmdcbiAgLy8gYWRkUmVsYXRpb25zKF9yZWxhdGlvbnMpIHtcbiAgLy8gICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX3JlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgLy8gICAgIHRoaXMuYWRkUmVsYXRpb24oX3JlbGF0aW9uc1tpbmRleF0pO1xuICAvLyAgIH1cbiAgLy8gfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgYWxsIHRoZSByZWxhdGlvbnMgb2YgdGhpcyBOb2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBnZXRSZWxhdGlvbnMoKSB7XG4gICAgbGV0IHJlcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5yZWxhdGlvbnMuX2F0dHJpYnV0ZV9uYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgcmVsTGlzdCA9IHRoaXMucmVsYXRpb25zW3RoaXMucmVsYXRpb25zLl9hdHRyaWJ1dGVfbmFtZXNbaV1dO1xuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCByZWxMaXN0Lmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGNvbnN0IHJlbGF0aW9uID0gcmVsTGlzdFtqXTtcbiAgICAgICAgcmVzLnB1c2gocmVsYXRpb24pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZVxuICAgKiBAcmV0dXJucyBhbGwgcmVsYXRpb25zIG9mIGEgc3BlY2lmaWMgcmVsYXRpb24gdHlwZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgZ2V0UmVsYXRpb25zQnlUeXBlKHR5cGUpIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgaWYgKCF0eXBlLmluY2x1ZGVzKFwiPlwiLCB0eXBlLmxlbmd0aCAtIDIpICYmXG4gICAgICAhdHlwZS5pbmNsdWRlcyhcIjxcIiwgdHlwZS5sZW5ndGggLSAyKSAmJlxuICAgICAgIXR5cGUuaW5jbHVkZXMoXCItXCIsIHR5cGUubGVuZ3RoIC0gMilcbiAgICApIHtcbiAgICAgIGxldCB0MSA9IHR5cGUuY29uY2F0KFwiPlwiKTtcbiAgICAgIHJlcyA9IFV0aWxpdGllcy5jb25jYXQocmVzLCB0aGlzLmdldFJlbGF0aW9ucyh0MSkpO1xuICAgICAgbGV0IHQyID0gdHlwZS5jb25jYXQoXCI8XCIpO1xuICAgICAgcmVzID0gVXRpbGl0aWVzLmNvbmNhdChyZXMsIHRoaXMuZ2V0UmVsYXRpb25zKHQyKSk7XG4gICAgICBsZXQgdDMgPSB0eXBlLmNvbmNhdChcIi1cIik7XG4gICAgICByZXMgPSBVdGlsaXRpZXMuY29uY2F0KHJlcywgdGhpcy5nZXRSZWxhdGlvbnModDMpKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0aW9uc1t0eXBlXSAhPT0gXCJ1bmRlZmluZWRcIikgcmVzID0gdGhpcy5yZWxhdGlvbnNbXG4gICAgICB0eXBlXTtcbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXNQYXJlbnRcbiAgICogQHJldHVybnMgYW4gYXJyYXkgb2YgYWxsIHJlbGF0aW9ucyBvZiBhIHNwZWNpZmljIGFwcCBmb3IgdGhpcyBub2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBnZXRSZWxhdGlvbnNCeUFwcE5hbWUoYXBwTmFtZSwgYXNQYXJlbnQpIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgaWYgKHRoaXMuaGFzQXBwRGVmaW5lZChhcHBOYW1lKSkge1xuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMuYXBwc1thcHBOYW1lXS5fYXR0cmlidXRlX25hbWVzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBpZiAodHlwZW9mIGFzUGFyZW50ICE9IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBpZiAodGhpcy5hcHBzW2FwcE5hbWVdLl9hdHRyaWJ1dGVfbmFtZXNbaW5kZXhdLmluY2x1ZGVzKFwiPlwiLCB0aGlzXG4gICAgICAgICAgICAgIC5hcHBzW2FwcE5hbWVdLl9hdHRyaWJ1dGVfbmFtZXNbaW5kZXhdLmxlbmd0aCAtIDIpKSB7XG4gICAgICAgICAgICBjb25zdCBhcHBSZWxhdGlvbkxpc3QgPSB0aGlzLmFwcHNbYXBwTmFtZV1bdGhpcy5hcHBzW2FwcE5hbWVdLl9hdHRyaWJ1dGVfbmFtZXNbXG4gICAgICAgICAgICAgIGluZGV4XV07XG4gICAgICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgYXBwUmVsYXRpb25MaXN0Lmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgICBjb25zdCByZWxhdGlvbiA9IGFwcFJlbGF0aW9uTGlzdFtpbmRleF07XG4gICAgICAgICAgICAgIHJlcy5wdXNoKHJlbGF0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgYXBwUmVsYXRpb25MaXN0ID0gdGhpcy5hcHBzW2FwcE5hbWVdW3RoaXMuYXBwc1thcHBOYW1lXS5fYXR0cmlidXRlX25hbWVzW1xuICAgICAgICAgICAgaW5kZXhdXTtcbiAgICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgYXBwUmVsYXRpb25MaXN0Lmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgY29uc3QgcmVsYXRpb24gPSBhcHBSZWxhdGlvbkxpc3RbaW5kZXhdO1xuICAgICAgICAgICAgcmVzLnB1c2gocmVsYXRpb24pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgLy8gLyoqXG4gIC8vICAqXG4gIC8vICAqXG4gIC8vICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gIC8vICAqIEByZXR1cm5zIGFuIG9iamVjdCBvZiBhbGwgcmVsYXRpb25zIG9mIGEgc3BlY2lmaWMgYXBwIGZvciB0aGlzIG5vZGVcbiAgLy8gICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgLy8gICovXG4gIC8vIGdldFJlbGF0aW9uc1dpdGhLZXlzQnlBcHBOYW1lKGFwcE5hbWUpIHtcbiAgLy8gICBpZiAodGhpcy5oYXNBcHBEZWZpbmVkKGFwcE5hbWUpKSB7XG4gIC8vICAgICByZXR1cm4gdGhpcy5hcHBzW2FwcE5hbWVdO1xuICAvLyAgIH1cbiAgLy8gfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxBcHBsaWNhdGlvbiB8IHN0cmluZ30gYXBwXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhc1BhcmVudFxuICAgKiBAcmV0dXJucyBhbGwgcmVsYXRpb25zIG9mIGEgc3BlY2lmaWMgYXBwXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBnZXRSZWxhdGlvbnNCeUFwcChhcHAsIGFzUGFyZW50KSB7XG4gICAgbGV0IGFwcE5hbWUgPSBcIlwiXG4gICAgaWYgKHR5cGVvZiBhcHAgIT0gXCJzdHJpbmdcIilcbiAgICAgIGFwcE5hbWUgPSBhcHAubmFtZS5nZXQoKVxuICAgIGVsc2VcbiAgICAgIGFwcE5hbWUgPSBhcHBcbiAgICByZXR1cm4gdGhpcy5nZXRSZWxhdGlvbnNCeUFwcE5hbWUoYXBwTmFtZSwgYXNQYXJlbnQpXG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgYWxsIHJlbGF0aW9ucyBvZiBhIHNwZWNpZmljIGFwcCBvZiBhIHNwZWNpZmljIHR5cGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGdldFJlbGF0aW9uc0J5QXBwTmFtZUJ5VHlwZShhcHBOYW1lLCByZWxhdGlvblR5cGUpIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgaWYgKHRoaXMuaGFzUmVsYXRpb25CeUFwcEJ5VHlwZURlZmluZWQoYXBwTmFtZSwgcmVsYXRpb25UeXBlKSkge1xuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMuYXBwc1thcHBOYW1lXS5fYXR0cmlidXRlX25hbWVzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCBhcHBSZWxhdGlvbkxpc3QgPSB0aGlzLmFwcHNbYXBwTmFtZV1bdGhpcy5hcHBzW2FwcE5hbWVdLl9hdHRyaWJ1dGVfbmFtZXNbXG4gICAgICAgICAgaW5kZXhdXTtcbiAgICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGFwcFJlbGF0aW9uTGlzdC5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICBjb25zdCByZWxhdGlvbiA9IGFwcFJlbGF0aW9uTGlzdFtpbmRleF07XG4gICAgICAgICAgaWYgKHJlbGF0aW9uLnR5cGUuZ2V0KCkgPT09IHJlbGF0aW9uVHlwZSkgcmVzLnB1c2gocmVsYXRpb24pO1xuICAgICAgICAgIGVsc2UgaWYgKCFyZWxhdGlvbi5pc0RpcmVjdGVkLmdldCgpICYmIHJlbGF0aW9uLnR5cGUuZ2V0KCkgK1xuICAgICAgICAgICAgXCItXCIgPT09IHJlbGF0aW9uVHlwZSkgcmVzLnB1c2gocmVsYXRpb24pO1xuICAgICAgICAgIGVsc2UgaWYgKHJlbGF0aW9uLnR5cGUuZ2V0KCkgKyBcIj5cIiA9PT0gcmVsYXRpb25UeXBlKSByZXMucHVzaChcbiAgICAgICAgICAgIHJlbGF0aW9uKTtcbiAgICAgICAgICBlbHNlIGlmIChyZWxhdGlvbi50eXBlLmdldCgpICsgXCI8XCIgPT09IHJlbGF0aW9uVHlwZSkgcmVzLnB1c2goXG4gICAgICAgICAgICByZWxhdGlvbik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxBcHBsaWNhdGlvbn0gYXBwXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgYWxsIHJlbGF0aW9ucyBvZiBhIHNwZWNpZmljIGFwcCBvZiBhIHNwZWNpZmljIHR5cGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGdldFJlbGF0aW9uc0J5QXBwQnlUeXBlKGFwcCwgcmVsYXRpb25UeXBlKSB7XG5cbiAgICBsZXQgYXBwTmFtZSA9IGFwcC5uYW1lLmdldCgpXG4gICAgcmV0dXJuIHRoaXMuZ2V0UmVsYXRpb25zQnlBcHBOYW1lQnlUeXBlKGFwcE5hbWUsIHJlbGF0aW9uVHlwZSlcblxuICB9XG4gIC8qKlxuICAgKiAgdmVyaWZ5IGlmIGFuIGVsZW1lbnQgaXMgYWxyZWFkeSBpbiBnaXZlbiBub2RlTGlzdFxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGVbXX0gX25vZGVsaXN0XG4gICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGluTm9kZUxpc3QoX25vZGVsaXN0KSB7XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IF9ub2RlbGlzdC5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSBfbm9kZWxpc3RbaW5kZXhdO1xuICAgICAgaWYgKGVsZW1lbnQuaWQuZ2V0KCkgPT09IHRoaXMuaWQuZ2V0KCkpIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvL1RPRE8gZ2V0Q2hpbGRyZW4sIGdldFBhcmVudFxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZSAtIG9wdGlvbmFsXG4gICAqIEByZXR1cm5zIGEgbGlzdCBvZiBuZWlnaGJvcnMgbm9kZXMgXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBnZXROZWlnaGJvcnMocmVsYXRpb25UeXBlKSB7XG4gICAgbGV0IG5laWdoYm9ycyA9IFtdO1xuICAgIGxldCByZWxhdGlvbnMgPSB0aGlzLmdldFJlbGF0aW9ucyhyZWxhdGlvblR5cGUpO1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCByZWxhdGlvbnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCByZWxhdGlvbiA9IHJlbGF0aW9uc1tpbmRleF07XG4gICAgICBpZiAocmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKSkge1xuICAgICAgICBpZiAodGhpcy5pbk5vZGVMaXN0KHJlbGF0aW9uLm5vZGVMaXN0MSkpXG4gICAgICAgICAgbmVpZ2hib3JzID0gVXRpbGl0aWVzLmNvbmNhdChuZWlnaGJvcnMsIHJlbGF0aW9uLm5vZGVMaXN0Mik7XG4gICAgICAgIGVsc2UgbmVpZ2hib3JzID0gVXRpbGl0aWVzLmNvbmNhdChuZWlnaGJvcnMsIHJlbGF0aW9uLm5vZGVMaXN0MSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZWlnaGJvcnMgPSBVdGlsaXRpZXMuY29uY2F0KFxuICAgICAgICAgIG5laWdoYm9ycyxcbiAgICAgICAgICBVdGlsaXRpZXMuYWxsQnV0TWVCeUlkKHJlbGF0aW9uLm5vZGVMaXN0MSlcbiAgICAgICAgKTtcbiAgICAgICAgbmVpZ2hib3JzID0gVXRpbGl0aWVzLmNvbmNhdChcbiAgICAgICAgICBuZWlnaGJvcnMsXG4gICAgICAgICAgVXRpbGl0aWVzLmFsbEJ1dE1lQnlJZChyZWxhdGlvbi5ub2RlTGlzdDIpXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZWlnaGJvcnM7XG4gIH1cblxuICBnZXRDaGlsZHJlbkJ5QXBwKGFwcCkge1xuICAgIGxldCByZXMgPSBbXVxuICAgIGlmICh0aGlzLmhhc0NoaWxkcmVuKCkpIHtcbiAgICAgIGxldCByZWxhdGlvbnMgPSB0aGlzLmdldFJlbGF0aW9uc0J5QXBwKGFwcCwgdHJ1ZSk7XG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcmVsYXRpb25zLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCByZWxhdGlvbiA9IHJlbGF0aW9uc1tpbmRleF07XG4gICAgICAgIHJlcyA9IHJlcy5jb25jYXQodGhpcy5nZXRDaGlsZHJlbkJ5QXBwQnlSZWxhdGlvbihhcHAsIHJlbGF0aW9uKSlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBoYXNDaGlsZHJlbigpIHtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5yZWxhdGlvbnMuX2F0dHJpYnV0ZV9uYW1lcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IHJlbGF0aW9uc05hbWUgPSB0aGlzLnJlbGF0aW9ucy5fYXR0cmlidXRlX25hbWVzW2luZGV4XTtcbiAgICAgIGlmIChyZWxhdGlvbnNOYW1lLmluY2x1ZGVzKFwiPlwiLCByZWxhdGlvbnNOYW1lLmxlbmd0aCAtIDIpKVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEByZXR1cm5zIGFycmF5IG9mIHNwaW5hbE5vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGdldENoaWxkcmVuQnlSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlKSB7XG4gICAgbGV0IHJlcyA9IFtdXG4gICAgaWYgKHRoaXMucmVsYXRpb25zW3JlbGF0aW9uVHlwZSArIFwiPlwiXSlcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIj5cIl0ubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IHJlbGF0aW9uID0gdGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCI+XCJdW2luZGV4XTtcbiAgICAgICAgbGV0IG5vZGVMaXN0MiA9IHJlbGF0aW9uLmdldE5vZGVMaXN0MigpO1xuICAgICAgICByZXMgPSBVdGlsaXRpZXMuY29uY2F0KHJlcywgbm9kZUxpc3QyKVxuICAgICAgfVxuICAgIHJldHVybiByZXNcbiAgfVxuXG4gIC8vVE9ET1xuICAvLyAvKipcbiAgLy8gICpcbiAgLy8gICpcbiAgLy8gICogQHBhcmFtIHtzdHJpbmd8U3BpbmFsUmVsYXRpb259IHJlbGF0aW9uXG4gIC8vICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgLy8gICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgLy8gICovXG4gIC8vIGlzUGFyZW50KHJlbGF0aW9uKSB7XG4gIC8vICAgaWYgKHR5cGVvZiByZWxhdGlvbiA9PT0gXCJzdHJpbmdcIikge1xuICAvLyAgICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0aW9uc1tyZWxhdGlvbiArIFwiPlwiXSAhPSBcInVuZGVmaW5lZFwiKSB7XG4gIC8vICAgICAgIGxldCByZWxhdGlvbnMgPSB0aGlzLnJlbGF0aW9uc1tyZWxhdGlvbiArIFwiPlwiXVxuICAvLyAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcmVsYXRpb25zLmxlbmd0aDsgaW5kZXgrKykge1xuICAvLyAgICAgICAgIGNvbnN0IHJlbGF0aW9uID0gcmVsYXRpb25zW2luZGV4XTtcbiAgLy8gICAgICAgICBsZXQgbm9kZUxpc3QxID0gcmVsYXRpb24uZ2V0Tm9kZUxpc3QxKClcbiAgLy8gICAgICAgICByZXR1cm4gVXRpbGl0aWVzLmNvbnRhaW5zTHN0QnlJZChub2RlTGlzdDEsIHRoaXMpXG4gIC8vICAgICAgIH1cbiAgLy8gICAgIH1cbiAgLy8gICB9IGVsc2Uge1xuICAvLyAgICAgbGV0IG5vZGVMaXN0MSA9IHJlbGF0aW9uLmdldE5vZGVMaXN0MSgpXG4gIC8vICAgICByZXR1cm4gVXRpbGl0aWVzLmNvbnRhaW5zTHN0QnlJZChub2RlTGlzdDEsIHRoaXMpXG4gIC8vICAgfVxuICAvLyAgIHJldHVybiBmYWxzZTtcbiAgLy8gfVxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9ufSByZWxhdGlvblxuICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBpc1BhcmVudChyZWxhdGlvbikge1xuICAgIGxldCBub2RlTGlzdDEgPSByZWxhdGlvbi5nZXROb2RlTGlzdDEoKVxuICAgIHJldHVybiBVdGlsaXRpZXMuY29udGFpbnNMc3RCeUlkKG5vZGVMaXN0MSwgdGhpcylcbiAgfVxuXG4gIC8vVE9ET1xuICAvLyAvKipcbiAgLy8gICpcbiAgLy8gICpcbiAgLy8gICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbn0gcmVsYXRpb25cbiAgLy8gICogQHJldHVybnMgYm9vbGVhblxuICAvLyAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAvLyAgKi9cbiAgLy8gaXNDaGlsZChyZWxhdGlvbikge1xuICAvLyAgIGxldCBub2RlTGlzdDIgPSByZWxhdGlvbi5nZXROb2RlTGlzdDIoKVxuICAvLyAgIHJldHVybiBVdGlsaXRpZXMuY29udGFpbnNMc3RCeUlkKG5vZGVMaXN0MiwgdGhpcylcbiAgLy8gfVxuXG4gIC8vVE9ETyBPcHRpbWl6ZVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmcgfCBTcGluYWxBcHBsaWNhdGlvbn0gYXBwXG4gICAqIEBwYXJhbSB7c3RyaW5nIHwgU3BpbmFsUmVsYXRpb259IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBhcnJheSBvZiBzcGluYWxOb2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBnZXRDaGlsZHJlbkJ5QXBwQnlSZWxhdGlvbihhcHAsIHJlbGF0aW9uKSB7XG4gICAgbGV0IGFwcE5hbWUgPSBcIlwiXG4gICAgbGV0IHJlbGF0aW9uVHlwZSA9IFwiXCJcbiAgICBsZXQgcmVzID0gW11cbiAgICBpZiAodHlwZW9mIGFwcCAhPSBcInN0cmluZ1wiKVxuICAgICAgYXBwTmFtZSA9IGFwcC5uYW1lLmdldCgpXG4gICAgZWxzZVxuICAgICAgYXBwTmFtZSA9IGFwcFxuICAgIGlmICh0eXBlb2YgcmVsYXRpb24gIT0gXCJzdHJpbmdcIilcbiAgICAgIHJlbGF0aW9uVHlwZSA9IHJlbGF0aW9uLnR5cGUuZ2V0KClcbiAgICBlbHNlXG4gICAgICByZWxhdGlvblR5cGUgPSByZWxhdGlvblxuICAgIGlmICh0eXBlb2YgdGhpcy5hcHBzW2FwcE5hbWVdICE9IFwidW5kZWZpbmVkXCIgJiYgdHlwZW9mIHRoaXMuYXBwc1tcbiAgICAgICAgYXBwTmFtZV1bcmVsYXRpb25UeXBlICsgXCI+XCJdICE9IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLmFwcHNbYXBwTmFtZV1bcmVsYXRpb25UeXBlICsgXCI+XCJdLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCByZWxhdGlvbiA9IHRoaXMuYXBwc1thcHBOYW1lXVtyZWxhdGlvblR5cGUgKyBcIj5cIl1baW5kZXhdO1xuICAgICAgICBsZXQgbm9kZUxpc3QyID0gcmVsYXRpb24uZ2V0Tm9kZUxpc3QyKClcbiAgICAgICAgcmVzID0gVXRpbGl0aWVzLmNvbmNhdChyZXMsIG5vZGVMaXN0MilcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nIHwgU3BpbmFsQXBwbGljYXRpb259IGFwcE5hbWVcbiAgICogQHBhcmFtIHtzdHJpbmcgfCBTcGluYWxSZWxhdGlvbn0gcmVsYXRpb25UeXBlXG4gICAqIEByZXR1cm5zICBBIHByb21pc2Ugb2YgYW4gYXJyYXkgb2YgTW9kZWxzXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhc3luYyBnZXRDaGlsZHJlbkVsZW1lbnRzQnlBcHBCeVJlbGF0aW9uKGFwcCwgcmVsYXRpb24pIHtcbiAgICBsZXQgYXBwTmFtZSA9IFwiXCJcbiAgICBsZXQgcmVsYXRpb25UeXBlID0gXCJcIlxuICAgIGxldCByZXMgPSBbXVxuICAgIGlmICh0eXBlb2YgYXBwICE9IFwic3RyaW5nXCIpXG4gICAgICBhcHBOYW1lID0gYXBwLm5hbWUuZ2V0KClcbiAgICBlbHNlXG4gICAgICBhcHBOYW1lID0gYXBwXG4gICAgaWYgKHR5cGVvZiByZWxhdGlvbiAhPSBcInN0cmluZ1wiKVxuICAgICAgcmVsYXRpb25UeXBlID0gcmVsYXRpb24udHlwZS5nZXQoKVxuICAgIGVsc2VcbiAgICAgIHJlbGF0aW9uVHlwZSA9IHJlbGF0aW9uXG4gICAgaWYgKHR5cGVvZiB0aGlzLmFwcHNbYXBwTmFtZV0gIT0gXCJ1bmRlZmluZWRcIiAmJiB0eXBlb2YgdGhpcy5hcHBzW1xuICAgICAgICBhcHBOYW1lXVtyZWxhdGlvblR5cGUgKyBcIj5cIl0gIT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgbGV0IHJlbGF0aW9uVG1wID0gdGhpcy5hcHBzW2FwcE5hbWVdW3JlbGF0aW9uVHlwZSArIFwiPlwiXVxuICAgICAgbGV0IG5vZGVMaXN0MiA9IHJlbGF0aW9uVG1wLmdldE5vZGVMaXN0MigpXG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgbm9kZUxpc3QyLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCBub2RlID0gbm9kZUxpc3QyW2luZGV4XTtcbiAgICAgICAgcmVzLnB1c2goYXdhaXQgbm9kZS5nZXRFbGVtZW50KCkpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXNcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSBvZiBhbiBhcnJheSBvZiBNb2RlbHNcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGFzeW5jIGdldENoaWxkcmVuRWxlbWVudHNCeVJlbGF0aW9uVHlwZShyZWxhdGlvblR5cGUpIHtcbiAgICBsZXQgcmVzID0gW11cbiAgICBpZiAodGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCI+XCJdKVxuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMucmVsYXRpb25zW3JlbGF0aW9uVHlwZSArIFwiPlwiXS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgcmVsYXRpb24gPSB0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIj5cIl1baW5kZXhdO1xuICAgICAgICBsZXQgbm9kZUxpc3QyID0gcmVsYXRpb24uZ2V0Tm9kZUxpc3QyKCk7XG4gICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBub2RlTGlzdDIubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVMaXN0MltpbmRleF07XG4gICAgICAgICAgcmVzLnB1c2goYXdhaXQgVXRpbGl0aWVzLnByb21pc2VMb2FkKG5vZGUuZWxlbWVudCkpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICByZXR1cm4gcmVzXG4gIH1cblxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBhcnJheSBvZiBzcGluYWxOb2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBnZXRQYXJlbnRzQnlSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlKSB7XG4gICAgbGV0IHJlcyA9IFtdXG4gICAgaWYgKHRoaXMucmVsYXRpb25zW3JlbGF0aW9uVHlwZSArIFwiPFwiXSlcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIjxcIl0ubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IHJlbGF0aW9uID0gdGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCI8XCJdW2luZGV4XTtcbiAgICAgICAgbGV0IG5vZGVMaXN0MSA9IHJlbGF0aW9uLmdldE5vZGVMaXN0MSgpO1xuICAgICAgICByZXMgPSBVdGlsaXRpZXMuY29uY2F0KHJlcywgbm9kZUxpc3QxKVxuICAgICAgfVxuICAgIHJldHVybiByZXNcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbn0gX3JlbGF0aW9uXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICByZW1vdmVSZWxhdGlvbihfcmVsYXRpb24pIHtcbiAgICBsZXQgcmVsYXRpb25Mc3QgPSB0aGlzLnJlbGF0aW9uc1tfcmVsYXRpb24udHlwZS5nZXQoKV07XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHJlbGF0aW9uTHN0Lmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgY2FuZGlkYXRlUmVsYXRpb24gPSByZWxhdGlvbkxzdFtpbmRleF07XG4gICAgICBpZiAoX3JlbGF0aW9uLmlkLmdldCgpID09PSBjYW5kaWRhdGVSZWxhdGlvbi5pZC5nZXQoKSlcbiAgICAgICAgcmVsYXRpb25Mc3Quc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb25bXX0gX3JlbGF0aW9uc1xuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgcmVtb3ZlUmVsYXRpb25zKF9yZWxhdGlvbnMpIHtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX3JlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHRoaXMucmVtb3ZlUmVsYXRpb24oX3JlbGF0aW9uc1tpbmRleF0pO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgcmVtb3ZlUmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHJlbGF0aW9uVHlwZSkgfHwgcmVsYXRpb25UeXBlIGluc3RhbmNlb2YgTHN0KVxuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHJlbGF0aW9uVHlwZS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgdHlwZSA9IHJlbGF0aW9uVHlwZVtpbmRleF07XG4gICAgICAgIHRoaXMucmVsYXRpb25zLnJlbV9hdHRyKHR5cGUpO1xuICAgICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5yZWxhdGlvbnMucmVtX2F0dHIocmVsYXRpb25UeXBlKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGhhc0FwcERlZmluZWQoYXBwTmFtZSkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5hcHBzW2FwcE5hbWVdICE9PSBcInVuZGVmaW5lZFwiKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICBlbHNlIHtcbiAgICAgIGNvbnNvbGUud2FybihcImFwcCBcIiArIGFwcE5hbWUgK1xuICAgICAgICBcIiBpcyBub3QgZGVmaW5lZCBmb3Igbm9kZSBcIiArIHRoaXMubmFtZS5nZXQoKSk7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgYm9vbGVhbiBcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGhhc1JlbGF0aW9uQnlBcHBCeVR5cGVEZWZpbmVkKGFwcE5hbWUsIHJlbGF0aW9uVHlwZSkge1xuICAgIGlmICh0aGlzLmhhc0FwcERlZmluZWQoYXBwTmFtZSkgJiYgdHlwZW9mIHRoaXMuYXBwc1thcHBOYW1lXVtcbiAgICAgICAgcmVsYXRpb25UeXBlXG4gICAgICBdICE9PVxuICAgICAgXCJ1bmRlZmluZWRcIiB8fCB0aGlzLmhhc0FwcERlZmluZWQoYXBwTmFtZSkgJiYgdHlwZW9mIHRoaXMuYXBwc1tcbiAgICAgICAgYXBwTmFtZV1bXG4gICAgICAgIHJlbGF0aW9uVHlwZSArIFwiLVwiXG4gICAgICBdICE9PVxuICAgICAgXCJ1bmRlZmluZWRcIiB8fCB0aGlzLmhhc0FwcERlZmluZWQoYXBwTmFtZSkgJiYgdHlwZW9mIHRoaXMuYXBwc1tcbiAgICAgICAgYXBwTmFtZV1bXG4gICAgICAgIHJlbGF0aW9uVHlwZSArIFwiPlwiXG4gICAgICBdICE9PVxuICAgICAgXCJ1bmRlZmluZWRcIiB8fCB0aGlzLmhhc0FwcERlZmluZWQoYXBwTmFtZSkgJiYgdHlwZW9mIHRoaXMuYXBwc1tcbiAgICAgICAgYXBwTmFtZV1bXG4gICAgICAgIHJlbGF0aW9uVHlwZSArIFwiPFwiXG4gICAgICBdICE9PVxuICAgICAgXCJ1bmRlZmluZWRcIilcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oXCJyZWxhdGlvbiBcIiArIHJlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGlzIG5vdCBkZWZpbmVkIGZvciBub2RlIFwiICsgdGhpcy5uYW1lLmdldCgpICtcbiAgICAgICAgXCIgZm9yIGFwcGxpY2F0aW9uIFwiICsgYXBwTmFtZSk7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEByZXR1cm5zIEEganNvbiByZXByZXNlbnRpbmcgdGhlIG5vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIHRvSnNvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IHRoaXMuaWQuZ2V0KCksXG4gICAgICBuYW1lOiB0aGlzLm5hbWUuZ2V0KCksXG4gICAgICBlbGVtZW50OiBudWxsXG4gICAgfTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgQSBqc29uIHJlcHJlc2VudGluZyB0aGUgbm9kZSB3aXRoIGl0cyByZWxhdGlvbnNcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIHRvSnNvbldpdGhSZWxhdGlvbnMoKSB7XG4gICAgbGV0IHJlbGF0aW9ucyA9IFtdO1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLmdldFJlbGF0aW9ucygpLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgcmVsYXRpb24gPSB0aGlzLmdldFJlbGF0aW9ucygpW2luZGV4XTtcbiAgICAgIHJlbGF0aW9ucy5wdXNoKHJlbGF0aW9uLnRvSnNvbigpKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiB0aGlzLmlkLmdldCgpLFxuICAgICAgbmFtZTogdGhpcy5uYW1lLmdldCgpLFxuICAgICAgZWxlbWVudDogbnVsbCxcbiAgICAgIHJlbGF0aW9uczogcmVsYXRpb25zXG4gICAgfTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgQW4gSUZDIGxpa2UgZm9ybWF0IHJlcHJlc2VudGluZyB0aGUgbm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYXN5bmMgdG9JZmMoKSB7XG4gICAgbGV0IGVsZW1lbnQgPSBhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQodGhpcy5lbGVtZW50KTtcbiAgICByZXR1cm4gZWxlbWVudC50b0lmYygpO1xuICB9XG59XG5leHBvcnQgZGVmYXVsdCBTcGluYWxOb2RlXG5zcGluYWxDb3JlLnJlZ2lzdGVyX21vZGVscyhbU3BpbmFsTm9kZV0pOyJdfQ==