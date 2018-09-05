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
        relatedGraphPtr: new Ptr(relatedGraph)
      });
      this.relatedGraph = relatedGraph;
      if (typeof relatedGraph !== "undefined") {
        relatedGraph.classifyNode(this);
      }
      if (typeof relations !== "undefined") {
        if (Array.isArray(relations) || relations instanceof Lst) this.addRelations(relations);else this.addRelation(relations);
      }
    }
    if (typeof this.relatedGraph == "undefined") var interval = setInterval(() => {
      if (typeof this.relatedGraphPtr != "undefined") {
        this.relatedGraphPtr.load(t => {
          this.relatedGraph = t;
          clearInterval(interval);
        });
      }
    }, 100);
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
   *  parent remove the child for now
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
      if (relation.isDirected.get() === isDirected) {
        relation.removeFromNodeList2(node);
        node.removeRelation(relation, app, isDirected);
      }
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
  getRelations(relationType) {
    let res = [];
    if (typeof relationType != "undefined") {
      if (typeof this.relations[relationType] != "undefined") {
        let relList = this.relations[relationType];
        for (let j = 0; j < relList.length; j++) {
          const relation = relList[j];
          res.push(relation);
        }
      }
      return res;
    }
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
      res = res.concat(this.getRelations(t1));
      let t2 = type.concat("<");
      res = res.concat(this.getRelations(t2));
      let t3 = type.concat("-");
      res = res.concat(this.getRelations(t3));
    }
    // if (typeof this.relations[type] !== "undefined") res = this.relations[
    //   type];
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

  //TODO getParent
  /**
   *
   *
   * @param {string | SpinalApplication} appName - optional
   * @param {string} relationType - optional
   * @returns a list of neighbors nodes 
   * @memberof SpinalNode
   */
  getNeighbors(relationType, app) {
    let appName = "";
    if (typeof app != "string") appName = app.name.get();else appName = app;
    let neighbors = [];
    let relations = null;
    if (typeof relationType == "undefined" && typeof appName == "undefined") relations = this.getRelations();else if (typeof relationType != "undefined" && typeof appName == "undefined") relations = this.getRelationsByType(relationType);else if (typeof relationType == "undefined" && typeof appName != "undefined") relations = this.getRelationsByApp(appName);else relations = this.getRelationsByAppNameByType(appName, relationType);
    for (let index = 0; index < relations.length; index++) {
      const relation = relations[index];
      if (relation.isDirected.get()) {
        if (this.inNodeList(relation.nodeList1)) neighbors = _Utilities.Utilities.concat(neighbors, relation.nodeList2);else neighbors = _Utilities.Utilities.concat(neighbors, relation.nodeList1);
      } else {
        neighbors = _Utilities.Utilities.concat(neighbors, _Utilities.Utilities.allButMeById(relation.nodeList1, this));
        neighbors = _Utilities.Utilities.concat(neighbors, _Utilities.Utilities.allButMeById(relation.nodeList2, this));
      }
    }
    return neighbors;
  }

  /**
   *
   *
   * @param {SpinalApplication | string} app
   * @returns an Array of all children
   * @memberof SpinalNode
   */
  getChildrenByApp(app) {
    let res = [];
    if (this.hasChildren(app)) {
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
   * @param {SpinalApplication | string} app
   * @returns an Object of children filtered by relationType
   * @memberof SpinalNode
   */
  getChildrenByAppFiltered(app) {
    let res = {};
    if (this.hasChildren(app)) {
      let relations = this.getRelationsByApp(app, true);
      for (let index = 0; index < relations.length; index++) {
        const relation = relations[index];
        res[relation.type.get()] = this.getChildrenByAppByRelation(app, relation);
      }
    }
    return res;
  }

  /**
   *
   *
   * @param {SpinalApplication| string} app
   * @returns boolean
   * @memberof SpinalNode
   */
  hasChildren(app) {
    if (typeof app != "undefined") {
      let appName = "";
      if (typeof app != "string") appName = app.name.get();else appName = app;
      if (this.hasAppDefined(appName)) {
        for (let index = 0; index < this.apps[appName]._attribute_names.length; index++) {
          const prop = this.apps[appName]._attribute_names[index];
          const relationLst = this.apps[appName][prop];
          if (prop.includes(">", prop.length - 2)) if (relationLst.length > 0) return true;
        }
      }
      return false;
    }
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
    if (Array.isArray(relation)) {
      for (let index = 0; index < relation.length; index++) {
        const rel = relation[index];
        res = res.concat(this.getChildrenByAppByRelation(app, rel));
      }
      return res;
    } else if (typeof relation != "string") relationType = relation.type.get();else relationType = relation;
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
   * @param {SpinalRelation | string} relation
   * @param {SpinalApplication | string} app - optional
   * @param {boolean} isDirected - optional
   * @memberof SpinalNode
   */
  removeRelation(relation, app, isDirected) {
    let relationType = "";
    if (typeof relation != 'string') relationType = relation.type.get();else relationType = relation;

    let appName = "";
    if (typeof app != 'string') appName = app.name.get();else appName = app;

    if (typeof isDirected != "undefined") if (isDirected) relationType = relationType.concat('<');else relationType = relationType.concat('-');
    if (typeof this.relations[relationType] != "undefined") {
      let relationLst = this.relations[relationType];
      for (let index = 0; index < relationLst.length; index++) {
        const candidateRelation = relationLst[index];
        if (relation.id.get() === candidateRelation.id.get()) relationLst.splice(index, 1);
      }
    }
    if (this.hasAppDefined(appName) && typeof this.apps[appName][relationType] != "undefined") {
      let relationLst = this.apps[appName][relationType];
      for (let index = 0; index < relationLst.length; index++) {
        const candidateRelation = relationLst[index];
        if (relation.id.get() === candidateRelation.id.get()) relationLst.splice(index, 1);
      }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TcGluYWxOb2RlLmpzIl0sIm5hbWVzIjpbInNwaW5hbENvcmUiLCJyZXF1aXJlIiwiZ2xvYmFsVHlwZSIsIndpbmRvdyIsImdsb2JhbCIsImdldFZpZXdlciIsInYiLCJTcGluYWxOb2RlIiwiTW9kZWwiLCJjb25zdHJ1Y3RvciIsIl9uYW1lIiwiZWxlbWVudCIsInJlbGF0ZWRHcmFwaCIsInJlbGF0aW9ucyIsIm5hbWUiLCJGaWxlU3lzdGVtIiwiX3NpZ19zZXJ2ZXIiLCJhZGRfYXR0ciIsImlkIiwiVXRpbGl0aWVzIiwiZ3VpZCIsIlB0ciIsImFwcHMiLCJyZWxhdGVkR3JhcGhQdHIiLCJjbGFzc2lmeU5vZGUiLCJBcnJheSIsImlzQXJyYXkiLCJMc3QiLCJhZGRSZWxhdGlvbnMiLCJhZGRSZWxhdGlvbiIsImludGVydmFsIiwic2V0SW50ZXJ2YWwiLCJsb2FkIiwidCIsImNsZWFySW50ZXJ2YWwiLCJhZGRUeXBlIiwiYXBwTmFtZSIsInR5cGUiLCJnZXRBcHBzTmFtZXMiLCJfYXR0cmlidXRlX25hbWVzIiwiZ2V0RWxlbWVudCIsInByb21pc2VMb2FkIiwiZ2V0QXBwcyIsInJlcyIsImluZGV4IiwibGVuZ3RoIiwicHVzaCIsImFwcHNMaXN0IiwiaGFzUmVsYXRpb24iLCJhZGREaXJlY3RlZFJlbGF0aW9uUGFyZW50IiwicmVsYXRpb24iLCJnZXQiLCJjb25jYXQiLCJhZGRSZWxhdGlvbkJ5QXBwIiwiYWRkRGlyZWN0ZWRSZWxhdGlvbkNoaWxkIiwiYWRkTm9uRGlyZWN0ZWRSZWxhdGlvbiIsImlzUmVzZXJ2ZWQiLCJuYW1lVG1wIiwibGlzdCIsImNvbnNvbGUiLCJsb2ciLCJyZXNlcnZlZFJlbGF0aW9uc05hbWVzIiwiaGFzUmVzZXJ2YXRpb25DcmVkZW50aWFscyIsImNvbnRhaW5zQXBwIiwicmVsYXRpb25MaXN0IiwiYXBwIiwiZXJyb3IiLCJhZGRTaW1wbGVSZWxhdGlvbiIsInJlbGF0aW9uVHlwZSIsImlzRGlyZWN0ZWQiLCJub2RlMiIsImFkZE5vZGUiLCJub2RlIiwicmVsIiwiU3BpbmFsUmVsYXRpb24iLCJhZGRTaW1wbGVSZWxhdGlvbkJ5QXBwIiwiYXNOb2RlIiwiYWRkVG9FeGlzdGluZ1JlbGF0aW9uIiwiYXNQYXJlbnQiLCJleGlzdGluZ1JlbGF0aW9ucyIsImdldFJlbGF0aW9ucyIsImlzUGFyZW50IiwiYWRkTm9kZXRvTm9kZUxpc3QxIiwiYWRkTm9kZXRvTm9kZUxpc3QyIiwiYWRkVG9FeGlzdGluZ1JlbGF0aW9uQnlBcHAiLCJhcHBSZWxhdGlvbnMiLCJnZXRSZWxhdGlvbnNCeUFwcE5hbWUiLCJyZW1vdmVGcm9tRXhpc3RpbmdSZWxhdGlvbkJ5QXBwIiwiZ2V0UmVsYXRpb25zQnlBcHBOYW1lQnlUeXBlIiwicmVtb3ZlRnJvbU5vZGVMaXN0MiIsInJlbW92ZVJlbGF0aW9uIiwiX2NsYXNzaWZ5UmVsYXRpb24iLCJfcmVsYXRpb24iLCJyZWxMaXN0IiwiaiIsImkiLCJnZXRSZWxhdGlvbnNCeVR5cGUiLCJpbmNsdWRlcyIsInQxIiwidDIiLCJ0MyIsImhhc0FwcERlZmluZWQiLCJhcHBSZWxhdGlvbkxpc3QiLCJnZXRSZWxhdGlvbnNCeUFwcCIsImhhc1JlbGF0aW9uQnlBcHBCeVR5cGVEZWZpbmVkIiwiZ2V0UmVsYXRpb25zQnlBcHBCeVR5cGUiLCJpbk5vZGVMaXN0IiwiX25vZGVsaXN0IiwiZ2V0TmVpZ2hib3JzIiwibmVpZ2hib3JzIiwibm9kZUxpc3QxIiwibm9kZUxpc3QyIiwiYWxsQnV0TWVCeUlkIiwiZ2V0Q2hpbGRyZW5CeUFwcCIsImhhc0NoaWxkcmVuIiwiZ2V0Q2hpbGRyZW5CeUFwcEJ5UmVsYXRpb24iLCJnZXRDaGlsZHJlbkJ5QXBwRmlsdGVyZWQiLCJwcm9wIiwicmVsYXRpb25Mc3QiLCJyZWxhdGlvbnNOYW1lIiwiZ2V0Q2hpbGRyZW5CeVJlbGF0aW9uVHlwZSIsImdldE5vZGVMaXN0MiIsImdldE5vZGVMaXN0MSIsImNvbnRhaW5zTHN0QnlJZCIsImdldENoaWxkcmVuRWxlbWVudHNCeUFwcEJ5UmVsYXRpb24iLCJyZWxhdGlvblRtcCIsImdldENoaWxkcmVuRWxlbWVudHNCeVJlbGF0aW9uVHlwZSIsImdldFBhcmVudHNCeVJlbGF0aW9uVHlwZSIsImNhbmRpZGF0ZVJlbGF0aW9uIiwic3BsaWNlIiwicmVtb3ZlUmVsYXRpb25zIiwiX3JlbGF0aW9ucyIsInJlbW92ZVJlbGF0aW9uVHlwZSIsInJlbV9hdHRyIiwid2FybiIsInRvSnNvbiIsInRvSnNvbldpdGhSZWxhdGlvbnMiLCJ0b0lmYyIsInJlZ2lzdGVyX21vZGVscyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBRUE7Ozs7QUFLQTs7OztBQVBBLE1BQU1BLGFBQWFDLFFBQVEseUJBQVIsQ0FBbkI7QUFDQSxNQUFNQyxhQUFhLE9BQU9DLE1BQVAsS0FBa0IsV0FBbEIsR0FBZ0NDLE1BQWhDLEdBQXlDRCxNQUE1RDs7QUFFQSxJQUFJRSxZQUFZLFlBQVc7QUFDekIsU0FBT0gsV0FBV0ksQ0FBbEI7QUFDRCxDQUZEOztBQU9BOzs7Ozs7O0FBT0EsTUFBTUMsVUFBTixTQUF5QkwsV0FBV00sS0FBcEMsQ0FBMEM7QUFDeEM7Ozs7Ozs7OztBQVNBQyxjQUFZQyxLQUFaLEVBQW1CQyxPQUFuQixFQUE0QkMsWUFBNUIsRUFBMENDLFNBQTFDLEVBQXFEQyxPQUFPLFlBQTVELEVBQTBFO0FBQ3hFO0FBQ0EsUUFBSUMsV0FBV0MsV0FBZixFQUE0QjtBQUMxQixXQUFLQyxRQUFMLENBQWM7QUFDWkMsWUFBSUMscUJBQVVDLElBQVYsQ0FBZSxLQUFLWCxXQUFMLENBQWlCSyxJQUFoQyxDQURRO0FBRVpBLGNBQU1KLEtBRk07QUFHWkMsaUJBQVMsSUFBSVUsR0FBSixDQUFRVixPQUFSLENBSEc7QUFJWkUsbUJBQVcsSUFBSUwsS0FBSixFQUpDO0FBS1pjLGNBQU0sSUFBSWQsS0FBSixFQUxNO0FBTVplLHlCQUFpQixJQUFJRixHQUFKLENBQVFULFlBQVI7QUFOTCxPQUFkO0FBUUEsV0FBS0EsWUFBTCxHQUFvQkEsWUFBcEI7QUFDQSxVQUFJLE9BQU9BLFlBQVAs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Y2xFLFlBQWQsR0FDWCwyQkFEVyxHQUNtQixLQUFLdEQsSUFBTCxDQUFVcUMsR0FBVixFQURuQixHQUVYLG1CQUZXLEdBRVdmLE9BRnhCO0FBR0EsYUFBTyxLQUFQO0FBQ0Q7QUFDRjtBQUNEOzs7Ozs7QUFNQW1HLFdBQVM7QUFDUCxXQUFPO0FBQ0xySCxVQUFJLEtBQUtBLEVBQUwsQ0FBUWlDLEdBQVIsRUFEQztBQUVMckMsWUFBTSxLQUFLQSxJQUFMLENBQVVxQyxHQUFWLEVBRkQ7QUFHTHhDLGVBQVM7QUFISixLQUFQO0FBS0Q7QUFDRDs7Ozs7O0FBTUE2SCx3QkFBc0I7QUFDcEIsUUFBSTNILFlBQVksRUFBaEI7QUFDQSxTQUFLLElBQUkrQixRQUFRLENBQWpCLEVBQW9CQSxRQUFRLEtBQUtvQyxZQUFMLEdBQW9CbkMsTUFBaEQsRUFBd0RELE9BQXhELEVBQWlFO0FBQy9ELFlBQU1NLFdBQVcsS0FBSzhCLFlBQUwsR0FBb0JwQyxLQUFwQixDQUFqQjtBQUNBL0IsZ0JBQVVpQyxJQUFWLENBQWVJLFNBQVNxRixNQUFULEVBQWY7QUFDRDtBQUNELFdBQU87QUFDTHJILFVBQUksS0FBS0EsRUFBTCxDQUFRaUMsR0FBUixFQURDO0FBRUxyQyxZQUFNLEtBQUtBLElBQUwsQ0FBVXFDLEdBQVYsRUFGRDtBQUdMeEMsZUFBUyxJQUhKO0FBSUxFLGlCQUFXQTtBQUpOLEtBQVA7QUFNRDtBQUNEOzs7Ozs7QUFNQSxRQUFNNEgsS0FBTixHQUFjO0FBQ1osUUFBSTlILFVBQVUsTUFBTVEscUJBQVVzQixXQUFWLENBQXNCLEtBQUs5QixPQUEzQixDQUFwQjtBQUNBLFdBQU9BLFFBQVE4SCxLQUFSLEVBQVA7QUFDRDtBQWpxQ3VDO2tCQW1xQzNCbEksVTs7QUFDZlAsV0FBVzBJLGVBQVgsQ0FBMkIsQ0FBQ25JLFVBQUQsQ0FBM0IiLCJmaWxlIjoiU3BpbmFsTm9kZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHNwaW5hbENvcmUgPSByZXF1aXJlKFwic3BpbmFsLWNvcmUtY29ubmVjdG9yanNcIik7XG5jb25zdCBnbG9iYWxUeXBlID0gdHlwZW9mIHdpbmRvdyA9PT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHdpbmRvdztcbmltcG9ydCBTcGluYWxSZWxhdGlvbiBmcm9tIFwiLi9TcGluYWxSZWxhdGlvblwiO1xubGV0IGdldFZpZXdlciA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gZ2xvYmFsVHlwZS52O1xufTtcblxuaW1wb3J0IHtcbiAgVXRpbGl0aWVzXG59IGZyb20gXCIuL1V0aWxpdGllc1wiO1xuLyoqXG4gKlxuICpcbiAqIEBleHBvcnRcbiAqIEBjbGFzcyBTcGluYWxOb2RlXG4gKiBAZXh0ZW5kcyB7TW9kZWx9XG4gKi9cbmNsYXNzIFNwaW5hbE5vZGUgZXh0ZW5kcyBnbG9iYWxUeXBlLk1vZGVsIHtcbiAgLyoqXG4gICAqQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBTcGluYWxOb2RlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0ge01vZGVsfSBlbGVtZW50IC0gYW55IHN1YmNsYXNzIG9mIE1vZGVsXG4gICAqIEBwYXJhbSB7U3BpbmFsR3JhcGh9IHJlbGF0ZWRHcmFwaFxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9uW119IHJlbGF0aW9uc1xuICAgKiBAcGFyYW0ge3N0cmluZ30gW25hbWU9XCJTcGluYWxOb2RlXCJdXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBjb25zdHJ1Y3RvcihfbmFtZSwgZWxlbWVudCwgcmVsYXRlZEdyYXBoLCByZWxhdGlvbnMsIG5hbWUgPSBcIlNwaW5hbE5vZGVcIikge1xuICAgIHN1cGVyKCk7XG4gICAgaWYgKEZpbGVTeXN0ZW0uX3NpZ19zZXJ2ZXIpIHtcbiAgICAgIHRoaXMuYWRkX2F0dHIoe1xuICAgICAgICBpZDogVXRpbGl0aWVzLmd1aWQodGhpcy5jb25zdHJ1Y3Rvci5uYW1lKSxcbiAgICAgICAgbmFtZTogX25hbWUsXG4gICAgICAgIGVsZW1lbnQ6IG5ldyBQdHIoZWxlbWVudCksXG4gICAgICAgIHJlbGF0aW9uczogbmV3IE1vZGVsKCksXG4gICAgICAgIGFwcHM6IG5ldyBNb2RlbCgpLFxuICAgICAgICByZWxhdGVkR3JhcGhQdHI6IG5ldyBQdHIocmVsYXRlZEdyYXBoKSxcbiAgICAgIH0pO1xuICAgICAgdGhpcy5yZWxhdGVkR3JhcGggPSByZWxhdGVkR3JhcGg7XG4gICAgICBpZiAodHlwZW9mIHJlbGF0ZWRHcmFwaCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICByZWxhdGVkR3JhcGguY2xhc3NpZnlOb2RlKHRoaXMpO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiByZWxhdGlvbnMgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocmVsYXRpb25zKSB8fCByZWxhdGlvbnMgaW5zdGFuY2VvZiBMc3QpXG4gICAgICAgICAgdGhpcy5hZGRSZWxhdGlvbnMocmVsYXRpb25zKTtcbiAgICAgICAgZWxzZSB0aGlzLmFkZFJlbGF0aW9uKHJlbGF0aW9ucyk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0eXBlb2YgdGhpcy5yZWxhdGVkR3JhcGggPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgIHZhciBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0ZWRHcmFwaFB0ciAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgdGhpcy5yZWxhdGVkR3JhcGhQdHIubG9hZCh0ID0+IHtcbiAgICAgICAgICAgIHRoaXMucmVsYXRlZEdyYXBoID0gdDtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSwgMTAwKTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYWRkVHlwZShhcHBOYW1lLCB0eXBlKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnR5cGUgPT09IFwidW5kZWZpbmVkXCIpXG4gICAgICB0aGlzLmFkZF9hdHRyKHtcbiAgICAgICAgdHlwZTogbmV3IE1vZGVsKClcbiAgICAgIH0pXG4gICAgdGhpcy50eXBlLmFkZF9hdHRyKHtcbiAgICAgIFthcHBOYW1lXTogdHlwZVxuICAgIH0pXG4gIH1cblxuICAvLyByZWdpc3RlckFwcChhcHApIHtcbiAgLy8gICB0aGlzLmFwcHMuYWRkX2F0dHIoe1xuICAvLyAgICAgW2FwcC5uYW1lLmdldCgpXTogbmV3IFB0cihhcHApXG4gIC8vICAgfSlcbiAgLy8gfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgYWxsIGFwcGxpY2F0aW9ucyBuYW1lcyBhcyBzdHJpbmdcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGdldEFwcHNOYW1lcygpIHtcbiAgICByZXR1cm4gdGhpcy5hcHBzLl9hdHRyaWJ1dGVfbmFtZXM7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSBvZiB0aGUgcmVsYXRlZCBFbGVtZW50IFxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYXN5bmMgZ2V0RWxlbWVudCgpIHtcbiAgICByZXR1cm4gYXdhaXQgVXRpbGl0aWVzLnByb21pc2VMb2FkKHRoaXMuZWxlbWVudClcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgYWxsIGFwcGxpY2F0aW9uc1xuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYXN5bmMgZ2V0QXBwcygpIHtcbiAgICBsZXQgcmVzID0gW11cbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5hcHBzLl9hdHRyaWJ1dGVfbmFtZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCBhcHBOYW1lID0gdGhpcy5hcHBzLl9hdHRyaWJ1dGVfbmFtZXNbaW5kZXhdO1xuICAgICAgcmVzLnB1c2goYXdhaXQgVXRpbGl0aWVzLnByb21pc2VMb2FkKHRoaXMucmVsYXRlZEdyYXBoLmFwcHNMaXN0W1xuICAgICAgICBhcHBOYW1lXSkpXG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbiAgLy8gLyoqXG4gIC8vICAqXG4gIC8vICAqXG4gIC8vICAqIEBwYXJhbSB7Kn0gcmVsYXRpb25UeXBlXG4gIC8vICAqIEBwYXJhbSB7Kn0gcmVsYXRpb25cbiAgLy8gICogQHBhcmFtIHsqfSBhc1BhcmVudFxuICAvLyAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAvLyAgKi9cbiAgLy8gY2hhbmdlRGVmYXVsdFJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgcmVsYXRpb24sIGFzUGFyZW50KSB7XG4gIC8vICAgICBpZiAocmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKSkge1xuICAvLyAgICAgICBpZiAoYXNQYXJlbnQpIHtcbiAgLy8gICAgICAgICBVdGlsaXRpZXMucHV0T25Ub3BMc3QodGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCI+XCJdLCByZWxhdGlvbik7XG4gIC8vICAgICAgIH0gZWxzZSB7XG4gIC8vICAgICAgICAgVXRpbGl0aWVzLnB1dE9uVG9wTHN0KHRoaXMucmVsYXRpb25zW3JlbGF0aW9uVHlwZSArIFwiPFwiXSwgcmVsYXRpb24pO1xuICAvLyAgICAgICB9XG4gIC8vICAgICB9IGVsc2Uge1xuICAvLyAgICAgICBVdGlsaXRpZXMucHV0T25Ub3BMc3QodGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCItXCJdLCByZWxhdGlvbik7XG4gIC8vICAgICB9XG4gIC8vICAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgYm9vbGVhblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgaGFzUmVsYXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucmVsYXRpb25zLmxlbmd0aCAhPT0gMDtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbn0gcmVsYXRpb25cbiAgICogQHBhcmFtIHtzdHJpbmd9IGFwcE5hbWVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGFkZERpcmVjdGVkUmVsYXRpb25QYXJlbnQocmVsYXRpb24sIGFwcE5hbWUpIHtcbiAgICBsZXQgbmFtZSA9IHJlbGF0aW9uLnR5cGUuZ2V0KCk7XG4gICAgbmFtZSA9IG5hbWUuY29uY2F0KFwiPlwiKTtcbiAgICBpZiAodHlwZW9mIGFwcE5hbWUgPT09IFwidW5kZWZpbmVkXCIpIHRoaXMuYWRkUmVsYXRpb24ocmVsYXRpb24sIG5hbWUpO1xuICAgIGVsc2UgdGhpcy5hZGRSZWxhdGlvbkJ5QXBwKHJlbGF0aW9uLCBuYW1lLCBhcHBOYW1lKTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbn0gcmVsYXRpb25cbiAgICogQHBhcmFtIHtzdHJpbmd9IGFwcE5hbWVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGFkZERpcmVjdGVkUmVsYXRpb25DaGlsZChyZWxhdGlvbiwgYXBwTmFtZSkge1xuICAgIGxldCBuYW1lID0gcmVsYXRpb24udHlwZS5nZXQoKTtcbiAgICBuYW1lID0gbmFtZS5jb25jYXQoXCI8XCIpO1xuICAgIGlmICh0eXBlb2YgYXBwTmFtZSA9PT0gXCJ1bmRlZmluZWRcIikgdGhpcy5hZGRSZWxhdGlvbihyZWxhdGlvbiwgbmFtZSk7XG4gICAgZWxzZSB0aGlzLmFkZFJlbGF0aW9uQnlBcHAocmVsYXRpb24sIG5hbWUsIGFwcE5hbWUpO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9ufSByZWxhdGlvblxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYWRkTm9uRGlyZWN0ZWRSZWxhdGlvbihyZWxhdGlvbiwgYXBwTmFtZSkge1xuICAgIGxldCBuYW1lID0gcmVsYXRpb24udHlwZS5nZXQoKTtcbiAgICBuYW1lID0gbmFtZS5jb25jYXQoXCItXCIpO1xuICAgIGlmICh0eXBlb2YgYXBwTmFtZSA9PT0gXCJ1bmRlZmluZWRcIikgdGhpcy5hZGRSZWxhdGlvbihyZWxhdGlvbiwgbmFtZSk7XG4gICAgZWxzZSB0aGlzLmFkZFJlbGF0aW9uQnlBcHAocmVsYXRpb24sIG5hbWUsIGFwcE5hbWUpO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9ufSByZWxhdGlvblxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYWRkUmVsYXRpb24ocmVsYXRpb24sIG5hbWUpIHtcbiAgICBpZiAoIXRoaXMucmVsYXRlZEdyYXBoLmlzUmVzZXJ2ZWQocmVsYXRpb24udHlwZS5nZXQoKSkpIHtcbiAgICAgIGxldCBuYW1lVG1wID0gcmVsYXRpb24udHlwZS5nZXQoKTtcbiAgICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBuYW1lVG1wID0gbmFtZTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgdGhpcy5yZWxhdGlvbnNbbmFtZVRtcF0gIT09IFwidW5kZWZpbmVkXCIpXG4gICAgICAgIHRoaXMucmVsYXRpb25zW25hbWVUbXBdLnB1c2gocmVsYXRpb24pO1xuICAgICAgZWxzZSB7XG4gICAgICAgIGxldCBsaXN0ID0gbmV3IExzdCgpO1xuICAgICAgICBsaXN0LnB1c2gocmVsYXRpb24pO1xuICAgICAgICB0aGlzLnJlbGF0aW9ucy5hZGRfYXR0cih7XG4gICAgICAgICAgW25hbWVUbXBdOiBsaXN0XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb24udHlwZS5nZXQoKSArXG4gICAgICAgIFwiIGlzIHJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5yZWxhdGVkR3JhcGgucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvbi50eXBlLmdldCgpXVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb259IHJlbGF0aW9uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC1yZWxhdGlvbiBOYW1lIGlmIG5vdCBvcmdpbmFsbHkgZGVmaW5lZFxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYWRkUmVsYXRpb25CeUFwcChyZWxhdGlvbiwgbmFtZSwgYXBwTmFtZSkge1xuICAgIGlmICh0aGlzLnJlbGF0ZWRHcmFwaC5oYXNSZXNlcnZhdGlvbkNyZWRlbnRpYWxzKHJlbGF0aW9uLnR5cGUuZ2V0KCksXG4gICAgICAgIGFwcE5hbWUpKSB7XG4gICAgICBpZiAodGhpcy5yZWxhdGVkR3JhcGguY29udGFpbnNBcHAoYXBwTmFtZSkpIHtcbiAgICAgICAgbGV0IG5hbWVUbXAgPSByZWxhdGlvbi50eXBlLmdldCgpO1xuICAgICAgICBpZiAodHlwZW9mIG5hbWUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBuYW1lVG1wID0gbmFtZTtcbiAgICAgICAgICAvLyByZWxhdGlvbi5uYW1lLnNldChuYW1lVG1wKVxuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5yZWxhdGlvbnNbbmFtZVRtcF0gIT09IFwidW5kZWZpbmVkXCIpXG4gICAgICAgICAgdGhpcy5yZWxhdGlvbnNbbmFtZVRtcF0ucHVzaChyZWxhdGlvbik7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGxldCBsaXN0ID0gbmV3IExzdCgpO1xuICAgICAgICAgIGxpc3QucHVzaChyZWxhdGlvbik7XG4gICAgICAgICAgdGhpcy5yZWxhdGlvbnMuYWRkX2F0dHIoe1xuICAgICAgICAgICAgW25hbWVUbXBdOiBsaXN0XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmFwcHNbYXBwTmFtZV0gIT09IFwidW5kZWZpbmVkXCIgJiYgdHlwZW9mIHRoaXMuYXBwc1tcbiAgICAgICAgICAgIGFwcE5hbWVdW25hbWVUbXBdICE9PSBcInVuZGVmaW5lZFwiKVxuICAgICAgICAgIHRoaXMuYXBwc1thcHBOYW1lXVtuYW1lVG1wXS5wdXNoKHJlbGF0aW9uKVxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgdGhpcy5hcHBzW2FwcE5hbWVdICE9PSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiB0aGlzXG4gICAgICAgICAgLmFwcHNbXG4gICAgICAgICAgICBhcHBOYW1lXVtuYW1lVG1wXSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgIGxldCByZWxhdGlvbkxpc3QgPSBuZXcgTHN0KClcbiAgICAgICAgICByZWxhdGlvbkxpc3QucHVzaChyZWxhdGlvbilcbiAgICAgICAgICB0aGlzLmFwcHNbYXBwTmFtZV0uYWRkX2F0dHIoe1xuICAgICAgICAgICAgW25hbWVUbXBdOiByZWxhdGlvbkxpc3RcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsZXQgYXBwID0gbmV3IE1vZGVsKCk7XG4gICAgICAgICAgbGV0IHJlbGF0aW9uTGlzdCA9IG5ldyBMc3QoKVxuICAgICAgICAgIHJlbGF0aW9uTGlzdC5wdXNoKHJlbGF0aW9uKVxuICAgICAgICAgIGFwcC5hZGRfYXR0cih7XG4gICAgICAgICAgICBbbmFtZVRtcF06IHJlbGF0aW9uTGlzdFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMuYXBwcy5hZGRfYXR0cih7XG4gICAgICAgICAgICBbYXBwTmFtZV06IGFwcFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKGFwcE5hbWUgKyBcIiBkb2VzIG5vdCBleGlzdFwiKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIHJlbGF0aW9uLnR5cGUuZ2V0KCkgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVsYXRlZEdyYXBoLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb24udHlwZS5nZXQoKV1cbiAgICAgICk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEBwYXJhbSB7TW9kZWx9IGVsZW1lbnQgLSBhbmQgc3ViY2xhc3Mgb2YgTW9kZWxcbiAgICogQHBhcmFtIHtib29sZWFufSBbaXNEaXJlY3RlZD1mYWxzZV1cbiAgICogQHJldHVybnMgdGhlIGNyZWF0ZWQgcmVsYXRpb24sIHVuZGVmaW5lZCBvdGhlcndpc2VcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGFkZFNpbXBsZVJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgZWxlbWVudCwgaXNEaXJlY3RlZCA9IGZhbHNlKSB7XG4gICAgaWYgKCF0aGlzLnJlbGF0ZWRHcmFwaC5pc1Jlc2VydmVkKHJlbGF0aW9uVHlwZSkpIHtcbiAgICAgIGxldCByZXMgPSB7fVxuICAgICAgbGV0IG5vZGUyID0gdGhpcy5yZWxhdGVkR3JhcGguYWRkTm9kZShlbGVtZW50KTtcbiAgICAgIHJlcy5ub2RlID0gbm9kZTJcbiAgICAgIGxldCByZWwgPSBuZXcgU3BpbmFsUmVsYXRpb24ocmVsYXRpb25UeXBlLCBbdGhpc10sIFtub2RlMl0sXG4gICAgICAgIGlzRGlyZWN0ZWQpO1xuICAgICAgcmVzLnJlbGF0aW9uID0gcmVsXG4gICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5hZGRSZWxhdGlvbihyZWwpO1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIHJlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGlzIHJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5yZWxhdGVkR3JhcGgucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvblR5cGVdXG4gICAgICApO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFwcE5hbWVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcGFyYW0ge01vZGVsIHxTcGluYWxOb2RlfSBlbGVtZW50XG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGlyZWN0ZWQ9ZmFsc2VdXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2FzTm9kZT1mYWxzZV0gLSB0byBwdXQgYSBTcGluYWxOb2RlIGluc2lkZSBhIFNwaW5hbE5vZGVcbiAgICogQHJldHVybnMgdGhlIGNyZWF0ZWQgcmVsYXRpb25cbiAgICogXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhZGRTaW1wbGVSZWxhdGlvbkJ5QXBwKGFwcE5hbWUsIHJlbGF0aW9uVHlwZSwgZWxlbWVudCwgaXNEaXJlY3RlZCA9IGZhbHNlLFxuICAgIGFzTm9kZSA9IGZhbHNlKSB7XG4gICAgaWYgKHRoaXMucmVsYXRlZEdyYXBoLmhhc1Jlc2VydmF0aW9uQ3JlZGVudGlhbHMocmVsYXRpb25UeXBlLCBhcHBOYW1lKSkge1xuICAgICAgaWYgKHRoaXMucmVsYXRlZEdyYXBoLmNvbnRhaW5zQXBwKGFwcE5hbWUpKSB7XG4gICAgICAgIGxldCByZXMgPSB7fVxuICAgICAgICBsZXQgbm9kZTIgPSBlbGVtZW50XG4gICAgICAgIGlmIChhc05vZGUgfHwgZWxlbWVudC5jb25zdHJ1Y3Rvci5uYW1lICE9IFwiU3BpbmFsTm9kZVwiKVxuICAgICAgICAgIG5vZGUyID0gdGhpcy5yZWxhdGVkR3JhcGguYWRkTm9kZShlbGVtZW50KTtcbiAgICAgICAgcmVzLm5vZGUgPSBub2RlMlxuICAgICAgICBsZXQgcmVsID0gbmV3IFNwaW5hbFJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgW3RoaXNdLCBbbm9kZTJdLFxuICAgICAgICAgIGlzRGlyZWN0ZWQpO1xuICAgICAgICByZXMucmVsYXRpb24gPSByZWxcbiAgICAgICAgdGhpcy5yZWxhdGVkR3JhcGguYWRkUmVsYXRpb24ocmVsLCBhcHBOYW1lKTtcbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYXBwTmFtZSArIFwiIGRvZXMgbm90IGV4aXN0XCIpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uVHlwZV1cbiAgICAgICk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEBwYXJhbSB7TW9kZWx9IGVsZW1lbnQgLSBhbnkgc3ViY2xhc3Mgb2YgTW9kZWxcbiAgICogQHBhcmFtIHtib29sZWFufSBbaXNEaXJlY3RlZD1mYWxzZV1cbiAgICogQHBhcmFtIHtib29sZWFufSBbYXNQYXJlbnQ9ZmFsc2VdXG4gICAqIEByZXR1cm5zIGFuIE9iamVjdCBvZiAxKXJlbGF0aW9uOnRoZSByZWxhdGlvbiB3aXRoIHRoZSBhZGRlZCBlbGVtZW50IG5vZGUgaW4gKG5vZGVMaXN0MiksIDIpbm9kZTogdGhlIGNyZWF0ZWQgbm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYWRkVG9FeGlzdGluZ1JlbGF0aW9uKFxuICAgIHJlbGF0aW9uVHlwZSxcbiAgICBlbGVtZW50LFxuICAgIGlzRGlyZWN0ZWQgPSBmYWxzZSxcbiAgICBhc1BhcmVudCA9IGZhbHNlXG4gICkge1xuICAgIGxldCByZXMgPSB7fVxuICAgIGlmICghdGhpcy5yZWxhdGVkR3JhcGguaXNSZXNlcnZlZChyZWxhdGlvblR5cGUpKSB7XG4gICAgICBsZXQgZXhpc3RpbmdSZWxhdGlvbnMgPSB0aGlzLmdldFJlbGF0aW9ucygpO1xuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGV4aXN0aW5nUmVsYXRpb25zLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCByZWxhdGlvbiA9IGV4aXN0aW5nUmVsYXRpb25zW2luZGV4XTtcbiAgICAgICAgcmVzLnJlbGF0aW9uID0gcmVsYXRpb25cbiAgICAgICAgaWYgKFxuICAgICAgICAgIHJlbGF0aW9uVHlwZSA9PT0gcmVsYXRpb25UeXBlICYmXG4gICAgICAgICAgaXNEaXJlY3RlZCA9PT0gcmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKVxuICAgICAgICApIHtcbiAgICAgICAgICBpZiAoaXNEaXJlY3RlZCAmJiB0aGlzLmlzUGFyZW50KHJlbGF0aW9uKSkge1xuICAgICAgICAgICAgbm9kZTIgPSB0aGlzLnJlbGF0ZWRHcmFwaC5hZGROb2RlKGVsZW1lbnQpO1xuICAgICAgICAgICAgcmVzLm5vZGUgPSBub2RlMjtcbiAgICAgICAgICAgIGlmIChhc1BhcmVudCkge1xuICAgICAgICAgICAgICByZWxhdGlvbi5hZGROb2RldG9Ob2RlTGlzdDEobm9kZTIpO1xuICAgICAgICAgICAgICBub2RlMi5hZGREaXJlY3RlZFJlbGF0aW9uUGFyZW50KHJlbGF0aW9uKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlbGF0aW9uLmFkZE5vZGV0b05vZGVMaXN0Mihub2RlMik7XG4gICAgICAgICAgICAgIG5vZGUyLmFkZERpcmVjdGVkUmVsYXRpb25DaGlsZChyZWxhdGlvbik7XG4gICAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmICghaXNEaXJlY3RlZCkge1xuICAgICAgICAgICAgbm9kZTIgPSB0aGlzLnJlbGF0ZWRHcmFwaC5hZGROb2RlKGVsZW1lbnQpO1xuICAgICAgICAgICAgcmVzLm5vZGUgPSBub2RlMjtcbiAgICAgICAgICAgIHJlbGF0aW9uLmFkZE5vZGV0b05vZGVMaXN0Mihub2RlMik7XG4gICAgICAgICAgICBub2RlMi5hZGROb25EaXJlY3RlZFJlbGF0aW9uKHJlbGF0aW9uKTtcbiAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5hZGRTaW1wbGVSZWxhdGlvbihyZWxhdGlvblR5cGUsIGVsZW1lbnQsIGlzRGlyZWN0ZWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uVHlwZV1cbiAgICAgICk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEBwYXJhbSB7TW9kZWx8IFNwaW5hbE5vZGV9IGVsZW1lbnQgLSBNb2RlbDphbnkgc3ViY2xhc3Mgb2YgTW9kZWxcbiAgICogQHBhcmFtIHtib29sZWFufSBbaXNEaXJlY3RlZD1mYWxzZV1cbiAgICogQHBhcmFtIHtib29sZWFufSBbYXNQYXJlbnQ9ZmFsc2VdXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2FzTm9kZT1mYWxzZV0gLSB0byBwdXQgYSBTcGluYWxOb2RlIGluc2lkZSBhIFNwaW5hbE5vZGVcbiAgICogQHJldHVybnMgYW4gT2JqZWN0IG9mIDEpcmVsYXRpb246dGhlIHJlbGF0aW9uIHdpdGggdGhlIGFkZGVkIGVsZW1lbnQgbm9kZSBpbiAobm9kZUxpc3QyKSwgMilub2RlOiB0aGUgY3JlYXRlZCBub2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhZGRUb0V4aXN0aW5nUmVsYXRpb25CeUFwcChcbiAgICBhcHBOYW1lLFxuICAgIHJlbGF0aW9uVHlwZSxcbiAgICBlbGVtZW50LFxuICAgIGlzRGlyZWN0ZWQgPSBmYWxzZSxcbiAgICBhc1BhcmVudCA9IGZhbHNlLFxuICAgIGFzTm9kZSA9IGZhbHNlXG4gICkge1xuICAgIGxldCByZXMgPSB7fVxuICAgIGxldCBub2RlMiA9IGVsZW1lbnQ7IC8vaW5pdGlhbGl6ZVxuICAgIGlmICh0aGlzLnJlbGF0ZWRHcmFwaC5oYXNSZXNlcnZhdGlvbkNyZWRlbnRpYWxzKHJlbGF0aW9uVHlwZSwgYXBwTmFtZSkpIHtcbiAgICAgIGlmICh0aGlzLnJlbGF0ZWRHcmFwaC5jb250YWluc0FwcChhcHBOYW1lKSkge1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMuYXBwc1thcHBOYW1lXSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgIGxldCBhcHBSZWxhdGlvbnMgPSB0aGlzLmdldFJlbGF0aW9uc0J5QXBwTmFtZShhcHBOYW1lKTtcbiAgICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgYXBwUmVsYXRpb25zLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgY29uc3QgcmVsYXRpb24gPSBhcHBSZWxhdGlvbnNbaW5kZXhdO1xuICAgICAgICAgICAgcmVzLnJlbGF0aW9uID0gcmVsYXRpb25cbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgcmVsYXRpb24udHlwZS5nZXQoKSA9PT0gcmVsYXRpb25UeXBlICYmXG4gICAgICAgICAgICAgIGlzRGlyZWN0ZWQgPT09IHJlbGF0aW9uLmlzRGlyZWN0ZWQuZ2V0KClcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICBpZiAoaXNEaXJlY3RlZCAmJiB0aGlzLmlzUGFyZW50KHJlbGF0aW9uKSkge1xuICAgICAgICAgICAgICAgIGlmIChhc05vZGUgfHwgZWxlbWVudC5jb25zdHJ1Y3Rvci5uYW1lICE9IFwiU3BpbmFsTm9kZVwiKVxuICAgICAgICAgICAgICAgICAgbm9kZTIgPSB0aGlzLnJlbGF0ZWRHcmFwaC5hZGROb2RlKGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIHJlcy5ub2RlID0gbm9kZTI7XG4gICAgICAgICAgICAgICAgaWYgKGFzUGFyZW50KSB7XG4gICAgICAgICAgICAgICAgICByZWxhdGlvbi5hZGROb2RldG9Ob2RlTGlzdDEobm9kZTIpO1xuICAgICAgICAgICAgICAgICAgbm9kZTIuYWRkRGlyZWN0ZWRSZWxhdGlvblBhcmVudChyZWxhdGlvbiwgYXBwTmFtZSk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICByZWxhdGlvbi5hZGROb2RldG9Ob2RlTGlzdDIobm9kZTIpO1xuICAgICAgICAgICAgICAgICAgbm9kZTIuYWRkRGlyZWN0ZWRSZWxhdGlvbkNoaWxkKHJlbGF0aW9uLCBhcHBOYW1lKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFpc0RpcmVjdGVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFzTm9kZSB8fCBlbGVtZW50LmNvbnN0cnVjdG9yLm5hbWUgIT0gXCJTcGluYWxOb2RlXCIpXG4gICAgICAgICAgICAgICAgICBub2RlMiA9IHRoaXMucmVsYXRlZEdyYXBoLmFkZE5vZGUoZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgcmVzLm5vZGUgPSBub2RlMjtcbiAgICAgICAgICAgICAgICByZWxhdGlvbi5hZGROb2RldG9Ob2RlTGlzdDIobm9kZTIpO1xuICAgICAgICAgICAgICAgIG5vZGUyLmFkZE5vbkRpcmVjdGVkUmVsYXRpb24ocmVsYXRpb24sIGFwcE5hbWUpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkU2ltcGxlUmVsYXRpb25CeUFwcChcbiAgICAgICAgICBhcHBOYW1lLFxuICAgICAgICAgIHJlbGF0aW9uVHlwZSxcbiAgICAgICAgICBlbGVtZW50LFxuICAgICAgICAgIGlzRGlyZWN0ZWRcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYXBwTmFtZSArIFwiIGRvZXMgbm90IGV4aXN0XCIpO1xuICAgICAgfVxuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIHJlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGlzIHJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5yZWxhdGVkR3JhcGgucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvblR5cGVdXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiAgcGFyZW50IHJlbW92ZSB0aGUgY2hpbGQgZm9yIG5vd1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZyB8IFNwaW5hbEFwcGxpY2F0aW9ufSBhcHBcbiAgICogQHBhcmFtIHtzdHJpbmcgfCBTcGluYWxSZWxhdGlvbn0gcmVsYXRpb25cbiAgICogQHBhcmFtIHtTcGluYWxOb2RlfSBub2RlXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGlyZWN0ZWQ9ZmFsc2VdXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICByZW1vdmVGcm9tRXhpc3RpbmdSZWxhdGlvbkJ5QXBwKFxuICAgIGFwcCxcbiAgICByZWxhdGlvbixcbiAgICBub2RlLFxuICAgIGlzRGlyZWN0ZWQgPSBmYWxzZSkge1xuICAgIGxldCBhcHBOYW1lID0gXCJcIlxuICAgIGlmICh0eXBlb2YgYXBwICE9IFwic3RyaW5nXCIpXG4gICAgICBhcHBOYW1lID0gYXBwLm5hbWUuZ2V0KClcbiAgICBlbHNlXG4gICAgICBhcHBOYW1lID0gYXBwXG4gICAgbGV0IHJlbGF0aW9uVHlwZSA9IFwiXCJcbiAgICBpZiAodHlwZW9mIHJlbGF0aW9uICE9IFwic3RyaW5nXCIpXG4gICAgICByZWxhdGlvblR5cGUgPSByZWxhdGlvbi50eXBlLmdldCgpXG4gICAgZWxzZVxuICAgICAgcmVsYXRpb25UeXBlID0gcmVsYXRpb25cbiAgICBsZXQgcmVsYXRpb25zID0gdGhpcy5nZXRSZWxhdGlvbnNCeUFwcE5hbWVCeVR5cGUoYXBwTmFtZSwgcmVsYXRpb25UeXBlKVxuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCByZWxhdGlvbnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCByZWxhdGlvbiA9IHJlbGF0aW9uc1tpbmRleF07XG4gICAgICBpZiAocmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKSA9PT0gaXNEaXJlY3RlZCkge1xuICAgICAgICByZWxhdGlvbi5yZW1vdmVGcm9tTm9kZUxpc3QyKG5vZGUpXG4gICAgICAgIG5vZGUucmVtb3ZlUmVsYXRpb24ocmVsYXRpb24sIGFwcCwgaXNEaXJlY3RlZClcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuXG5cblxuICAvLyBhZGRSZWxhdGlvbjIoX3JlbGF0aW9uLCBfbmFtZSkge1xuICAvLyAgIGxldCBjbGFzc2lmeSA9IGZhbHNlO1xuICAvLyAgIGxldCBuYW1lID0gX3JlbGF0aW9uLnR5cGUuZ2V0KCk7XG4gIC8vICAgaWYgKHR5cGVvZiBfbmFtZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAvLyAgICAgbmFtZSA9IF9uYW1lO1xuICAvLyAgIH1cbiAgLy8gICBpZiAodHlwZW9mIHRoaXMucmVsYXRpb25zW19yZWxhdGlvbi50eXBlLmdldCgpXSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAvLyAgICAgaWYgKF9yZWxhdGlvbi5pc0RpcmVjdGVkLmdldCgpKSB7XG4gIC8vICAgICAgIGZvciAoXG4gIC8vICAgICAgICAgbGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLnJlbGF0aW9uc1tfcmVsYXRpb24udHlwZS5nZXQoKV0ubGVuZ3RoOyBpbmRleCsrXG4gIC8vICAgICAgICkge1xuICAvLyAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLnJlbGF0aW9uc1tfcmVsYXRpb24udHlwZS5nZXQoKV1baW5kZXhdO1xuICAvLyAgICAgICAgIGlmIChcbiAgLy8gICAgICAgICAgIFV0aWxpdGllcy5hcnJheXNFcXVhbChcbiAgLy8gICAgICAgICAgICAgX3JlbGF0aW9uLmdldE5vZGVMaXN0MUlkcygpLFxuICAvLyAgICAgICAgICAgICBlbGVtZW50LmdldE5vZGVMaXN0MUlkcygpXG4gIC8vICAgICAgICAgICApXG4gIC8vICAgICAgICAgKSB7XG4gIC8vICAgICAgICAgICBlbGVtZW50LmFkZE5vdEV4aXN0aW5nVmVydGljZXN0b05vZGVMaXN0MihfcmVsYXRpb24ubm9kZUxpc3QyKTtcbiAgLy8gICAgICAgICB9IGVsc2Uge1xuICAvLyAgICAgICAgICAgZWxlbWVudC5wdXNoKF9yZWxhdGlvbik7XG4gIC8vICAgICAgICAgICBjbGFzc2lmeSA9IHRydWU7XG4gIC8vICAgICAgICAgfVxuICAvLyAgICAgICB9XG4gIC8vICAgICB9IGVsc2Uge1xuICAvLyAgICAgICB0aGlzLnJlbGF0aW9uc1tfcmVsYXRpb24udHlwZS5nZXQoKV0uYWRkTm90RXhpc3RpbmdWZXJ0aWNlc3RvUmVsYXRpb24oXG4gIC8vICAgICAgICAgX3JlbGF0aW9uXG4gIC8vICAgICAgICk7XG4gIC8vICAgICB9XG4gIC8vICAgfSBlbHNlIHtcbiAgLy8gICAgIGlmIChfcmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKSkge1xuICAvLyAgICAgICBsZXQgbGlzdCA9IG5ldyBMc3QoKTtcbiAgLy8gICAgICAgbGlzdC5wdXNoKF9yZWxhdGlvbik7XG4gIC8vICAgICAgIHRoaXMucmVsYXRpb25zLmFkZF9hdHRyKHtcbiAgLy8gICAgICAgICBbbmFtZV06IGxpc3RcbiAgLy8gICAgICAgfSk7XG4gIC8vICAgICAgIHRoaXMuX2NsYXNzaWZ5UmVsYXRpb24oX3JlbGF0aW9uKTtcbiAgLy8gICAgIH0gZWxzZSB7XG4gIC8vICAgICAgIHRoaXMucmVsYXRpb25zLmFkZF9hdHRyKHtcbiAgLy8gICAgICAgICBbbmFtZV06IF9yZWxhdGlvblxuICAvLyAgICAgICB9KTtcbiAgLy8gICAgICAgY2xhc3NpZnkgPSB0cnVlO1xuICAvLyAgICAgfVxuICAvLyAgIH1cbiAgLy8gICBpZiAoY2xhc3NpZnkpIHRoaXMuX2NsYXNzaWZ5UmVsYXRpb24oX3JlbGF0aW9uKTtcbiAgLy8gfVxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9ufSBfcmVsYXRpb25cbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIF9jbGFzc2lmeVJlbGF0aW9uKF9yZWxhdGlvbikge1xuICAgIHRoaXMucmVsYXRlZEdyYXBoLmxvYWQocmVsYXRlZEdyYXBoID0+IHtcbiAgICAgIHJlbGF0ZWRHcmFwaC5fY2xhc3NpZnlSZWxhdGlvbihfcmVsYXRpb24pO1xuICAgIH0pO1xuICB9XG5cbiAgLy9UT0RPIDpOb3RXb3JraW5nXG4gIC8vIGFkZFJlbGF0aW9uKF9yZWxhdGlvbikge1xuICAvLyAgIHRoaXMuYWRkUmVsYXRpb24oX3JlbGF0aW9uKVxuICAvLyAgIHRoaXMucmVsYXRlZEdyYXBoLmxvYWQocmVsYXRlZEdyYXBoID0+IHtcbiAgLy8gICAgIHJlbGF0ZWRHcmFwaC5fYWRkTm90RXhpc3RpbmdWZXJ0aWNlc0Zyb21SZWxhdGlvbihfcmVsYXRpb24pXG4gIC8vICAgfSlcbiAgLy8gfVxuICAvL1RPRE8gOk5vdFdvcmtpbmdcbiAgLy8gYWRkUmVsYXRpb25zKF9yZWxhdGlvbnMpIHtcbiAgLy8gICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX3JlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgLy8gICAgIHRoaXMuYWRkUmVsYXRpb24oX3JlbGF0aW9uc1tpbmRleF0pO1xuICAvLyAgIH1cbiAgLy8gfVxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyBhbGwgdGhlIHJlbGF0aW9ucyBvZiB0aGlzIE5vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGdldFJlbGF0aW9ucyhyZWxhdGlvblR5cGUpIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgaWYgKHR5cGVvZiByZWxhdGlvblR5cGUgIT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGVdICE9IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgbGV0IHJlbExpc3QgPSB0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGVdXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcmVsTGlzdC5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGNvbnN0IHJlbGF0aW9uID0gcmVsTGlzdFtqXTtcbiAgICAgICAgICByZXMucHVzaChyZWxhdGlvbik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXNcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnJlbGF0aW9ucy5fYXR0cmlidXRlX25hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCByZWxMaXN0ID0gdGhpcy5yZWxhdGlvbnNbdGhpcy5yZWxhdGlvbnMuX2F0dHJpYnV0ZV9uYW1lc1tpXV07XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHJlbExpc3QubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgY29uc3QgcmVsYXRpb24gPSByZWxMaXN0W2pdO1xuICAgICAgICByZXMucHVzaChyZWxhdGlvbik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gICAqIEByZXR1cm5zIGFsbCByZWxhdGlvbnMgb2YgYSBzcGVjaWZpYyByZWxhdGlvbiB0eXBlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBnZXRSZWxhdGlvbnNCeVR5cGUodHlwZSkge1xuICAgIGxldCByZXMgPSBbXTtcbiAgICBpZiAoIXR5cGUuaW5jbHVkZXMoXCI+XCIsIHR5cGUubGVuZ3RoIC0gMikgJiZcbiAgICAgICF0eXBlLmluY2x1ZGVzKFwiPFwiLCB0eXBlLmxlbmd0aCAtIDIpICYmXG4gICAgICAhdHlwZS5pbmNsdWRlcyhcIi1cIiwgdHlwZS5sZW5ndGggLSAyKVxuICAgICkge1xuICAgICAgbGV0IHQxID0gdHlwZS5jb25jYXQoXCI+XCIpO1xuICAgICAgcmVzID0gcmVzLmNvbmNhdCh0aGlzLmdldFJlbGF0aW9ucyh0MSkpO1xuICAgICAgbGV0IHQyID0gdHlwZS5jb25jYXQoXCI8XCIpO1xuICAgICAgcmVzID0gcmVzLmNvbmNhdCh0aGlzLmdldFJlbGF0aW9ucyh0MikpO1xuICAgICAgbGV0IHQzID0gdHlwZS5jb25jYXQoXCItXCIpO1xuICAgICAgcmVzID0gcmVzLmNvbmNhdCh0aGlzLmdldFJlbGF0aW9ucyh0MykpO1xuICAgIH1cbiAgICAvLyBpZiAodHlwZW9mIHRoaXMucmVsYXRpb25zW3R5cGVdICE9PSBcInVuZGVmaW5lZFwiKSByZXMgPSB0aGlzLnJlbGF0aW9uc1tcbiAgICAvLyAgIHR5cGVdO1xuICAgIHJldHVybiByZXM7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhc1BhcmVudFxuICAgKiBAcmV0dXJucyBhbiBhcnJheSBvZiBhbGwgcmVsYXRpb25zIG9mIGEgc3BlY2lmaWMgYXBwIGZvciB0aGlzIG5vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGdldFJlbGF0aW9uc0J5QXBwTmFtZShhcHBOYW1lLCBhc1BhcmVudCkge1xuICAgIGxldCByZXMgPSBbXTtcbiAgICBpZiAodGhpcy5oYXNBcHBEZWZpbmVkKGFwcE5hbWUpKSB7XG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5hcHBzW2FwcE5hbWVdLl9hdHRyaWJ1dGVfbmFtZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYXNQYXJlbnQgIT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgIGlmICh0aGlzLmFwcHNbYXBwTmFtZV0uX2F0dHJpYnV0ZV9uYW1lc1tpbmRleF0uaW5jbHVkZXMoXCI+XCIsIHRoaXNcbiAgICAgICAgICAgICAgLmFwcHNbYXBwTmFtZV0uX2F0dHJpYnV0ZV9uYW1lc1tpbmRleF0ubGVuZ3RoIC0gMikpIHtcbiAgICAgICAgICAgIGNvbnN0IGFwcFJlbGF0aW9uTGlzdCA9IHRoaXMuYXBwc1thcHBOYW1lXVt0aGlzLmFwcHNbYXBwTmFtZV0uX2F0dHJpYnV0ZV9uYW1lc1tcbiAgICAgICAgICAgICAgaW5kZXhdXTtcbiAgICAgICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBhcHBSZWxhdGlvbkxpc3QubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHJlbGF0aW9uID0gYXBwUmVsYXRpb25MaXN0W2luZGV4XTtcbiAgICAgICAgICAgICAgcmVzLnB1c2gocmVsYXRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBhcHBSZWxhdGlvbkxpc3QgPSB0aGlzLmFwcHNbYXBwTmFtZV1bdGhpcy5hcHBzW2FwcE5hbWVdLl9hdHRyaWJ1dGVfbmFtZXNbXG4gICAgICAgICAgICBpbmRleF1dO1xuICAgICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBhcHBSZWxhdGlvbkxpc3QubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgICBjb25zdCByZWxhdGlvbiA9IGFwcFJlbGF0aW9uTGlzdFtpbmRleF07XG4gICAgICAgICAgICByZXMucHVzaChyZWxhdGlvbik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cblxuICAvLyAvKipcbiAgLy8gICpcbiAgLy8gICpcbiAgLy8gICogQHBhcmFtIHtzdHJpbmd9IGFwcE5hbWVcbiAgLy8gICogQHJldHVybnMgYW4gb2JqZWN0IG9mIGFsbCByZWxhdGlvbnMgb2YgYSBzcGVjaWZpYyBhcHAgZm9yIHRoaXMgbm9kZVxuICAvLyAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAvLyAgKi9cbiAgLy8gZ2V0UmVsYXRpb25zV2l0aEtleXNCeUFwcE5hbWUoYXBwTmFtZSkge1xuICAvLyAgIGlmICh0aGlzLmhhc0FwcERlZmluZWQoYXBwTmFtZSkpIHtcbiAgLy8gICAgIHJldHVybiB0aGlzLmFwcHNbYXBwTmFtZV07XG4gIC8vICAgfVxuICAvLyB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbEFwcGxpY2F0aW9uIHwgc3RyaW5nfSBhcHBcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFzUGFyZW50XG4gICAqIEByZXR1cm5zIGFsbCByZWxhdGlvbnMgb2YgYSBzcGVjaWZpYyBhcHBcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGdldFJlbGF0aW9uc0J5QXBwKGFwcCwgYXNQYXJlbnQpIHtcbiAgICBsZXQgYXBwTmFtZSA9IFwiXCJcbiAgICBpZiAodHlwZW9mIGFwcCAhPSBcInN0cmluZ1wiKVxuICAgICAgYXBwTmFtZSA9IGFwcC5uYW1lLmdldCgpXG4gICAgZWxzZVxuICAgICAgYXBwTmFtZSA9IGFwcFxuICAgIHJldHVybiB0aGlzLmdldFJlbGF0aW9uc0J5QXBwTmFtZShhcHBOYW1lLCBhc1BhcmVudClcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFwcE5hbWVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBhbGwgcmVsYXRpb25zIG9mIGEgc3BlY2lmaWMgYXBwIG9mIGEgc3BlY2lmaWMgdHlwZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgZ2V0UmVsYXRpb25zQnlBcHBOYW1lQnlUeXBlKGFwcE5hbWUsIHJlbGF0aW9uVHlwZSkge1xuICAgIGxldCByZXMgPSBbXTtcbiAgICBpZiAodGhpcy5oYXNSZWxhdGlvbkJ5QXBwQnlUeXBlRGVmaW5lZChhcHBOYW1lLCByZWxhdGlvblR5cGUpKSB7XG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5hcHBzW2FwcE5hbWVdLl9hdHRyaWJ1dGVfbmFtZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IGFwcFJlbGF0aW9uTGlzdCA9IHRoaXMuYXBwc1thcHBOYW1lXVt0aGlzLmFwcHNbYXBwTmFtZV0uX2F0dHJpYnV0ZV9uYW1lc1tcbiAgICAgICAgICBpbmRleF1dO1xuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgYXBwUmVsYXRpb25MaXN0Lmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgIGNvbnN0IHJlbGF0aW9uID0gYXBwUmVsYXRpb25MaXN0W2luZGV4XTtcbiAgICAgICAgICBpZiAocmVsYXRpb24udHlwZS5nZXQoKSA9PT0gcmVsYXRpb25UeXBlKSByZXMucHVzaChyZWxhdGlvbik7XG4gICAgICAgICAgZWxzZSBpZiAoIXJlbGF0aW9uLmlzRGlyZWN0ZWQuZ2V0KCkgJiYgcmVsYXRpb24udHlwZS5nZXQoKSArXG4gICAgICAgICAgICBcIi1cIiA9PT0gcmVsYXRpb25UeXBlKSByZXMucHVzaChyZWxhdGlvbik7XG4gICAgICAgICAgZWxzZSBpZiAocmVsYXRpb24udHlwZS5nZXQoKSArIFwiPlwiID09PSByZWxhdGlvblR5cGUpIHJlcy5wdXNoKFxuICAgICAgICAgICAgcmVsYXRpb24pO1xuICAgICAgICAgIGVsc2UgaWYgKHJlbGF0aW9uLnR5cGUuZ2V0KCkgKyBcIjxcIiA9PT0gcmVsYXRpb25UeXBlKSByZXMucHVzaChcbiAgICAgICAgICAgIHJlbGF0aW9uKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbEFwcGxpY2F0aW9ufSBhcHBcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBhbGwgcmVsYXRpb25zIG9mIGEgc3BlY2lmaWMgYXBwIG9mIGEgc3BlY2lmaWMgdHlwZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgZ2V0UmVsYXRpb25zQnlBcHBCeVR5cGUoYXBwLCByZWxhdGlvblR5cGUpIHtcblxuICAgIGxldCBhcHBOYW1lID0gYXBwLm5hbWUuZ2V0KClcbiAgICByZXR1cm4gdGhpcy5nZXRSZWxhdGlvbnNCeUFwcE5hbWVCeVR5cGUoYXBwTmFtZSwgcmVsYXRpb25UeXBlKVxuXG4gIH1cbiAgLyoqXG4gICAqICB2ZXJpZnkgaWYgYW4gZWxlbWVudCBpcyBhbHJlYWR5IGluIGdpdmVuIG5vZGVMaXN0XG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZVtdfSBfbm9kZWxpc3RcbiAgICogQHJldHVybnMgYm9vbGVhblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgaW5Ob2RlTGlzdChfbm9kZWxpc3QpIHtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX25vZGVsaXN0Lmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgZWxlbWVudCA9IF9ub2RlbGlzdFtpbmRleF07XG4gICAgICBpZiAoZWxlbWVudC5pZC5nZXQoKSA9PT0gdGhpcy5pZC5nZXQoKSkgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vVE9ETyBnZXRQYXJlbnRcbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nIHwgU3BpbmFsQXBwbGljYXRpb259IGFwcE5hbWUgLSBvcHRpb25hbFxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlIC0gb3B0aW9uYWxcbiAgICogQHJldHVybnMgYSBsaXN0IG9mIG5laWdoYm9ycyBub2RlcyBcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGdldE5laWdoYm9ycyhyZWxhdGlvblR5cGUsIGFwcCkge1xuICAgIGxldCBhcHBOYW1lID0gXCJcIlxuICAgIGlmICh0eXBlb2YgYXBwICE9IFwic3RyaW5nXCIpXG4gICAgICBhcHBOYW1lID0gYXBwLm5hbWUuZ2V0KClcbiAgICBlbHNlXG4gICAgICBhcHBOYW1lID0gYXBwXG4gICAgbGV0IG5laWdoYm9ycyA9IFtdO1xuICAgIGxldCByZWxhdGlvbnMgPSBudWxsXG4gICAgaWYgKHR5cGVvZiByZWxhdGlvblR5cGUgPT0gXCJ1bmRlZmluZWRcIiAmJiB0eXBlb2YgYXBwTmFtZSA9PSBcInVuZGVmaW5lZFwiKVxuICAgICAgcmVsYXRpb25zID0gdGhpcy5nZXRSZWxhdGlvbnMoKTtcbiAgICBlbHNlIGlmICh0eXBlb2YgcmVsYXRpb25UeXBlICE9IFwidW5kZWZpbmVkXCIgJiYgdHlwZW9mIGFwcE5hbWUgPT1cbiAgICAgIFwidW5kZWZpbmVkXCIpXG4gICAgICByZWxhdGlvbnMgPSB0aGlzLmdldFJlbGF0aW9uc0J5VHlwZShyZWxhdGlvblR5cGUpO1xuICAgIGVsc2UgaWYgKHR5cGVvZiByZWxhdGlvblR5cGUgPT0gXCJ1bmRlZmluZWRcIiAmJiB0eXBlb2YgYXBwTmFtZSAhPVxuICAgICAgXCJ1bmRlZmluZWRcIilcbiAgICAgIHJlbGF0aW9ucyA9IHRoaXMuZ2V0UmVsYXRpb25zQnlBcHAoYXBwTmFtZSk7XG4gICAgZWxzZVxuICAgICAgcmVsYXRpb25zID0gdGhpcy5nZXRSZWxhdGlvbnNCeUFwcE5hbWVCeVR5cGUoYXBwTmFtZSwgcmVsYXRpb25UeXBlKTtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcmVsYXRpb25zLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgcmVsYXRpb24gPSByZWxhdGlvbnNbaW5kZXhdO1xuICAgICAgaWYgKHJlbGF0aW9uLmlzRGlyZWN0ZWQuZ2V0KCkpIHtcbiAgICAgICAgaWYgKHRoaXMuaW5Ob2RlTGlzdChyZWxhdGlvbi5ub2RlTGlzdDEpKVxuICAgICAgICAgIG5laWdoYm9ycyA9IFV0aWxpdGllcy5jb25jYXQobmVpZ2hib3JzLCByZWxhdGlvbi5ub2RlTGlzdDIpO1xuICAgICAgICBlbHNlIG5laWdoYm9ycyA9IFV0aWxpdGllcy5jb25jYXQobmVpZ2hib3JzLCByZWxhdGlvbi5ub2RlTGlzdDEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmVpZ2hib3JzID0gVXRpbGl0aWVzLmNvbmNhdChcbiAgICAgICAgICBuZWlnaGJvcnMsXG4gICAgICAgICAgVXRpbGl0aWVzLmFsbEJ1dE1lQnlJZChyZWxhdGlvbi5ub2RlTGlzdDEsIHRoaXMpXG4gICAgICAgICk7XG4gICAgICAgIG5laWdoYm9ycyA9IFV0aWxpdGllcy5jb25jYXQoXG4gICAgICAgICAgbmVpZ2hib3JzLFxuICAgICAgICAgIFV0aWxpdGllcy5hbGxCdXRNZUJ5SWQocmVsYXRpb24ubm9kZUxpc3QyLCB0aGlzKVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmVpZ2hib3JzO1xuICB9XG5cblxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxBcHBsaWNhdGlvbiB8IHN0cmluZ30gYXBwXG4gICAqIEByZXR1cm5zIGFuIEFycmF5IG9mIGFsbCBjaGlsZHJlblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgZ2V0Q2hpbGRyZW5CeUFwcChhcHApIHtcbiAgICBsZXQgcmVzID0gW11cbiAgICBpZiAodGhpcy5oYXNDaGlsZHJlbihhcHApKSB7XG4gICAgICBsZXQgcmVsYXRpb25zID0gdGhpcy5nZXRSZWxhdGlvbnNCeUFwcChhcHAsIHRydWUpO1xuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHJlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgcmVsYXRpb24gPSByZWxhdGlvbnNbaW5kZXhdO1xuICAgICAgICByZXMgPSByZXMuY29uY2F0KHRoaXMuZ2V0Q2hpbGRyZW5CeUFwcEJ5UmVsYXRpb24oYXBwLCByZWxhdGlvbikpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXNcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbEFwcGxpY2F0aW9uIHwgc3RyaW5nfSBhcHBcbiAgICogQHJldHVybnMgYW4gT2JqZWN0IG9mIGNoaWxkcmVuIGZpbHRlcmVkIGJ5IHJlbGF0aW9uVHlwZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgZ2V0Q2hpbGRyZW5CeUFwcEZpbHRlcmVkKGFwcCkge1xuICAgIGxldCByZXMgPSB7fVxuICAgIGlmICh0aGlzLmhhc0NoaWxkcmVuKGFwcCkpIHtcbiAgICAgIGxldCByZWxhdGlvbnMgPSB0aGlzLmdldFJlbGF0aW9uc0J5QXBwKGFwcCwgdHJ1ZSk7XG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcmVsYXRpb25zLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCByZWxhdGlvbiA9IHJlbGF0aW9uc1tpbmRleF07XG4gICAgICAgIHJlc1tyZWxhdGlvbi50eXBlLmdldCgpXSA9IHRoaXMuZ2V0Q2hpbGRyZW5CeUFwcEJ5UmVsYXRpb24oYXBwLFxuICAgICAgICAgIHJlbGF0aW9uKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzXG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbEFwcGxpY2F0aW9ufCBzdHJpbmd9IGFwcFxuICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBoYXNDaGlsZHJlbihhcHApIHtcbiAgICBpZiAodHlwZW9mIGFwcCAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBsZXQgYXBwTmFtZSA9IFwiXCJcbiAgICAgIGlmICh0eXBlb2YgYXBwICE9IFwic3RyaW5nXCIpXG4gICAgICAgIGFwcE5hbWUgPSBhcHAubmFtZS5nZXQoKVxuICAgICAgZWxzZVxuICAgICAgICBhcHBOYW1lID0gYXBwXG4gICAgICBpZiAodGhpcy5oYXNBcHBEZWZpbmVkKGFwcE5hbWUpKSB7XG4gICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLmFwcHNbYXBwTmFtZV0uX2F0dHJpYnV0ZV9uYW1lcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICBjb25zdCBwcm9wID0gdGhpcy5hcHBzW2FwcE5hbWVdLl9hdHRyaWJ1dGVfbmFtZXNbaW5kZXhdXG4gICAgICAgICAgY29uc3QgcmVsYXRpb25Mc3QgPSB0aGlzLmFwcHNbYXBwTmFtZV1bcHJvcF07XG4gICAgICAgICAgaWYgKHByb3AuaW5jbHVkZXMoXCI+XCIsIHByb3AubGVuZ3RoIC0gMikpXG4gICAgICAgICAgICBpZiAocmVsYXRpb25Mc3QubGVuZ3RoID4gMClcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5yZWxhdGlvbnMuX2F0dHJpYnV0ZV9uYW1lcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IHJlbGF0aW9uc05hbWUgPSB0aGlzLnJlbGF0aW9ucy5fYXR0cmlidXRlX25hbWVzW2luZGV4XTtcbiAgICAgIGlmIChyZWxhdGlvbnNOYW1lLmluY2x1ZGVzKFwiPlwiLCByZWxhdGlvbnNOYW1lLmxlbmd0aCAtIDIpKVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEByZXR1cm5zIGFycmF5IG9mIHNwaW5hbE5vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGdldENoaWxkcmVuQnlSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlKSB7XG4gICAgbGV0IHJlcyA9IFtdXG4gICAgaWYgKHRoaXMucmVsYXRpb25zW3JlbGF0aW9uVHlwZSArIFwiPlwiXSlcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIj5cIl0ubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IHJlbGF0aW9uID0gdGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCI+XCJdW2luZGV4XTtcbiAgICAgICAgbGV0IG5vZGVMaXN0MiA9IHJlbGF0aW9uLmdldE5vZGVMaXN0MigpO1xuICAgICAgICByZXMgPSBVdGlsaXRpZXMuY29uY2F0KHJlcywgbm9kZUxpc3QyKVxuICAgICAgfVxuICAgIHJldHVybiByZXNcbiAgfVxuXG4gIC8vVE9ET1xuICAvLyAvKipcbiAgLy8gICpcbiAgLy8gICpcbiAgLy8gICogQHBhcmFtIHtzdHJpbmd8U3BpbmFsUmVsYXRpb259IHJlbGF0aW9uXG4gIC8vICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgLy8gICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgLy8gICovXG4gIC8vIGlzUGFyZW50KHJlbGF0aW9uKSB7XG4gIC8vICAgaWYgKHR5cGVvZiByZWxhdGlvbiA9PT0gXCJzdHJpbmdcIikge1xuICAvLyAgICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0aW9uc1tyZWxhdGlvbiArIFwiPlwiXSAhPSBcInVuZGVmaW5lZFwiKSB7XG4gIC8vICAgICAgIGxldCByZWxhdGlvbnMgPSB0aGlzLnJlbGF0aW9uc1tyZWxhdGlvbiArIFwiPlwiXVxuICAvLyAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcmVsYXRpb25zLmxlbmd0aDsgaW5kZXgrKykge1xuICAvLyAgICAgICAgIGNvbnN0IHJlbGF0aW9uID0gcmVsYXRpb25zW2luZGV4XTtcbiAgLy8gICAgICAgICBsZXQgbm9kZUxpc3QxID0gcmVsYXRpb24uZ2V0Tm9kZUxpc3QxKClcbiAgLy8gICAgICAgICByZXR1cm4gVXRpbGl0aWVzLmNvbnRhaW5zTHN0QnlJZChub2RlTGlzdDEsIHRoaXMpXG4gIC8vICAgICAgIH1cbiAgLy8gICAgIH1cbiAgLy8gICB9IGVsc2Uge1xuICAvLyAgICAgbGV0IG5vZGVMaXN0MSA9IHJlbGF0aW9uLmdldE5vZGVMaXN0MSgpXG4gIC8vICAgICByZXR1cm4gVXRpbGl0aWVzLmNvbnRhaW5zTHN0QnlJZChub2RlTGlzdDEsIHRoaXMpXG4gIC8vICAgfVxuICAvLyAgIHJldHVybiBmYWxzZTtcbiAgLy8gfVxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9ufSByZWxhdGlvblxuICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBpc1BhcmVudChyZWxhdGlvbikge1xuICAgIGxldCBub2RlTGlzdDEgPSByZWxhdGlvbi5nZXROb2RlTGlzdDEoKVxuICAgIHJldHVybiBVdGlsaXRpZXMuY29udGFpbnNMc3RCeUlkKG5vZGVMaXN0MSwgdGhpcylcbiAgfVxuXG4gIC8vVE9ET1xuICAvLyAvKipcbiAgLy8gICpcbiAgLy8gICpcbiAgLy8gICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbn0gcmVsYXRpb25cbiAgLy8gICogQHJldHVybnMgYm9vbGVhblxuICAvLyAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAvLyAgKi9cbiAgLy8gaXNDaGlsZChyZWxhdGlvbikge1xuICAvLyAgIGxldCBub2RlTGlzdDIgPSByZWxhdGlvbi5nZXROb2RlTGlzdDIoKVxuICAvLyAgIHJldHVybiBVdGlsaXRpZXMuY29udGFpbnNMc3RCeUlkKG5vZGVMaXN0MiwgdGhpcylcbiAgLy8gfVxuXG4gIC8vVE9ETyBPcHRpbWl6ZVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmcgfCBTcGluYWxBcHBsaWNhdGlvbn0gYXBwXG4gICAqIEBwYXJhbSB7c3RyaW5nIHwgU3BpbmFsUmVsYXRpb259IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBhcnJheSBvZiBzcGluYWxOb2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBnZXRDaGlsZHJlbkJ5QXBwQnlSZWxhdGlvbihhcHAsIHJlbGF0aW9uKSB7XG4gICAgbGV0IGFwcE5hbWUgPSBcIlwiXG4gICAgbGV0IHJlbGF0aW9uVHlwZSA9IFwiXCJcbiAgICBsZXQgcmVzID0gW11cbiAgICBpZiAodHlwZW9mIGFwcCAhPSBcInN0cmluZ1wiKVxuICAgICAgYXBwTmFtZSA9IGFwcC5uYW1lLmdldCgpXG4gICAgZWxzZVxuICAgICAgYXBwTmFtZSA9IGFwcFxuICAgIGlmIChBcnJheS5pc0FycmF5KHJlbGF0aW9uKSkge1xuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHJlbGF0aW9uLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCByZWwgPSByZWxhdGlvbltpbmRleF07XG4gICAgICAgIHJlcyA9IHJlcy5jb25jYXQodGhpcy5nZXRDaGlsZHJlbkJ5QXBwQnlSZWxhdGlvbihhcHAsIHJlbCkpXG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHJlbGF0aW9uICE9IFwic3RyaW5nXCIpXG4gICAgICByZWxhdGlvblR5cGUgPSByZWxhdGlvbi50eXBlLmdldCgpXG4gICAgZWxzZVxuICAgICAgcmVsYXRpb25UeXBlID0gcmVsYXRpb25cbiAgICBpZiAodHlwZW9mIHRoaXMuYXBwc1thcHBOYW1lXSAhPSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiB0aGlzLmFwcHNbXG4gICAgICAgIGFwcE5hbWVdW3JlbGF0aW9uVHlwZSArIFwiPlwiXSAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5hcHBzW2FwcE5hbWVdW3JlbGF0aW9uVHlwZSArIFwiPlwiXS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgcmVsYXRpb24gPSB0aGlzLmFwcHNbYXBwTmFtZV1bcmVsYXRpb25UeXBlICsgXCI+XCJdW2luZGV4XTtcbiAgICAgICAgbGV0IG5vZGVMaXN0MiA9IHJlbGF0aW9uLmdldE5vZGVMaXN0MigpXG4gICAgICAgIHJlcyA9IFV0aWxpdGllcy5jb25jYXQocmVzLCBub2RlTGlzdDIpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXNcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZyB8IFNwaW5hbEFwcGxpY2F0aW9ufSBhcHBOYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nIHwgU3BpbmFsUmVsYXRpb259IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyAgQSBwcm9taXNlIG9mIGFuIGFycmF5IG9mIE1vZGVsc1xuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYXN5bmMgZ2V0Q2hpbGRyZW5FbGVtZW50c0J5QXBwQnlSZWxhdGlvbihhcHAsIHJlbGF0aW9uKSB7XG4gICAgbGV0IGFwcE5hbWUgPSBcIlwiXG4gICAgbGV0IHJlbGF0aW9uVHlwZSA9IFwiXCJcbiAgICBsZXQgcmVzID0gW11cbiAgICBpZiAodHlwZW9mIGFwcCAhPSBcInN0cmluZ1wiKVxuICAgICAgYXBwTmFtZSA9IGFwcC5uYW1lLmdldCgpXG4gICAgZWxzZVxuICAgICAgYXBwTmFtZSA9IGFwcFxuICAgIGlmICh0eXBlb2YgcmVsYXRpb24gIT0gXCJzdHJpbmdcIilcbiAgICAgIHJlbGF0aW9uVHlwZSA9IHJlbGF0aW9uLnR5cGUuZ2V0KClcbiAgICBlbHNlXG4gICAgICByZWxhdGlvblR5cGUgPSByZWxhdGlvblxuICAgIGlmICh0eXBlb2YgdGhpcy5hcHBzW2FwcE5hbWVdICE9IFwidW5kZWZpbmVkXCIgJiYgdHlwZW9mIHRoaXMuYXBwc1tcbiAgICAgICAgYXBwTmFtZV1bcmVsYXRpb25UeXBlICsgXCI+XCJdICE9IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGxldCByZWxhdGlvblRtcCA9IHRoaXMuYXBwc1thcHBOYW1lXVtyZWxhdGlvblR5cGUgKyBcIj5cIl1cbiAgICAgIGxldCBub2RlTGlzdDIgPSByZWxhdGlvblRtcC5nZXROb2RlTGlzdDIoKVxuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IG5vZGVMaXN0Mi5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVMaXN0MltpbmRleF07XG4gICAgICAgIHJlcy5wdXNoKGF3YWl0IG5vZGUuZ2V0RWxlbWVudCgpKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzXG4gIH1cblxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBBIHByb21pc2Ugb2YgYW4gYXJyYXkgb2YgTW9kZWxzXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhc3luYyBnZXRDaGlsZHJlbkVsZW1lbnRzQnlSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlKSB7XG4gICAgbGV0IHJlcyA9IFtdXG4gICAgaWYgKHRoaXMucmVsYXRpb25zW3JlbGF0aW9uVHlwZSArIFwiPlwiXSlcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIj5cIl0ubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IHJlbGF0aW9uID0gdGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCI+XCJdW2luZGV4XTtcbiAgICAgICAgbGV0IG5vZGVMaXN0MiA9IHJlbGF0aW9uLmdldE5vZGVMaXN0MigpO1xuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgbm9kZUxpc3QyLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgIGNvbnN0IG5vZGUgPSBub2RlTGlzdDJbaW5kZXhdO1xuICAgICAgICAgIHJlcy5wdXNoKGF3YWl0IFV0aWxpdGllcy5wcm9taXNlTG9hZChub2RlLmVsZW1lbnQpKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgcmV0dXJuIHJlc1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgYXJyYXkgb2Ygc3BpbmFsTm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgZ2V0UGFyZW50c0J5UmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSkge1xuICAgIGxldCByZXMgPSBbXVxuICAgIGlmICh0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIjxcIl0pXG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCI8XCJdLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCByZWxhdGlvbiA9IHRoaXMucmVsYXRpb25zW3JlbGF0aW9uVHlwZSArIFwiPFwiXVtpbmRleF07XG4gICAgICAgIGxldCBub2RlTGlzdDEgPSByZWxhdGlvbi5nZXROb2RlTGlzdDEoKTtcbiAgICAgICAgcmVzID0gVXRpbGl0aWVzLmNvbmNhdChyZXMsIG5vZGVMaXN0MSlcbiAgICAgIH1cbiAgICByZXR1cm4gcmVzXG4gIH1cblxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbiB8IHN0cmluZ30gcmVsYXRpb25cbiAgICogQHBhcmFtIHtTcGluYWxBcHBsaWNhdGlvbiB8IHN0cmluZ30gYXBwIC0gb3B0aW9uYWxcbiAgICogQHBhcmFtIHtib29sZWFufSBpc0RpcmVjdGVkIC0gb3B0aW9uYWxcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIHJlbW92ZVJlbGF0aW9uKHJlbGF0aW9uLCBhcHAsIGlzRGlyZWN0ZWQpIHtcbiAgICBsZXQgcmVsYXRpb25UeXBlID0gXCJcIlxuICAgIGlmICh0eXBlb2YgcmVsYXRpb24gIT0gJ3N0cmluZycpXG4gICAgICByZWxhdGlvblR5cGUgPSByZWxhdGlvbi50eXBlLmdldCgpXG4gICAgZWxzZSByZWxhdGlvblR5cGUgPSByZWxhdGlvblxuXG4gICAgbGV0IGFwcE5hbWUgPSBcIlwiXG4gICAgaWYgKHR5cGVvZiBhcHAgIT0gJ3N0cmluZycpXG4gICAgICBhcHBOYW1lID0gYXBwLm5hbWUuZ2V0KClcbiAgICBlbHNlIGFwcE5hbWUgPSBhcHBcblxuICAgIGlmICh0eXBlb2YgaXNEaXJlY3RlZCAhPSBcInVuZGVmaW5lZFwiKVxuICAgICAgaWYgKGlzRGlyZWN0ZWQpXG4gICAgICAgIHJlbGF0aW9uVHlwZSA9IHJlbGF0aW9uVHlwZS5jb25jYXQoJzwnKVxuICAgIGVsc2VcbiAgICAgIHJlbGF0aW9uVHlwZSA9IHJlbGF0aW9uVHlwZS5jb25jYXQoJy0nKVxuICAgIGlmICh0eXBlb2YgdGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlXSAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBsZXQgcmVsYXRpb25Mc3QgPSB0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGVdO1xuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHJlbGF0aW9uTHN0Lmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCBjYW5kaWRhdGVSZWxhdGlvbiA9IHJlbGF0aW9uTHN0W2luZGV4XTtcbiAgICAgICAgaWYgKHJlbGF0aW9uLmlkLmdldCgpID09PSBjYW5kaWRhdGVSZWxhdGlvbi5pZC5nZXQoKSlcbiAgICAgICAgICByZWxhdGlvbkxzdC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy5oYXNBcHBEZWZpbmVkKGFwcE5hbWUpICYmXG4gICAgICB0eXBlb2YgdGhpcy5hcHBzW2FwcE5hbWVdW3JlbGF0aW9uVHlwZV0gIT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgbGV0IHJlbGF0aW9uTHN0ID0gdGhpcy5hcHBzW2FwcE5hbWVdW3JlbGF0aW9uVHlwZV07XG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcmVsYXRpb25Mc3QubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IGNhbmRpZGF0ZVJlbGF0aW9uID0gcmVsYXRpb25Mc3RbaW5kZXhdO1xuICAgICAgICBpZiAocmVsYXRpb24uaWQuZ2V0KCkgPT09IGNhbmRpZGF0ZVJlbGF0aW9uLmlkLmdldCgpKVxuICAgICAgICAgIHJlbGF0aW9uTHN0LnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuXG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb25bXX0gX3JlbGF0aW9uc1xuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgcmVtb3ZlUmVsYXRpb25zKF9yZWxhdGlvbnMpIHtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX3JlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHRoaXMucmVtb3ZlUmVsYXRpb24oX3JlbGF0aW9uc1tpbmRleF0pO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgcmVtb3ZlUmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHJlbGF0aW9uVHlwZSkgfHwgcmVsYXRpb25UeXBlIGluc3RhbmNlb2YgTHN0KVxuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHJlbGF0aW9uVHlwZS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgdHlwZSA9IHJlbGF0aW9uVHlwZVtpbmRleF07XG4gICAgICAgIHRoaXMucmVsYXRpb25zLnJlbV9hdHRyKHR5cGUpO1xuICAgICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5yZWxhdGlvbnMucmVtX2F0dHIocmVsYXRpb25UeXBlKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGhhc0FwcERlZmluZWQoYXBwTmFtZSkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5hcHBzW2FwcE5hbWVdICE9PSBcInVuZGVmaW5lZFwiKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICBlbHNlIHtcbiAgICAgIGNvbnNvbGUud2FybihcImFwcCBcIiArIGFwcE5hbWUgK1xuICAgICAgICBcIiBpcyBub3QgZGVmaW5lZCBmb3Igbm9kZSBcIiArIHRoaXMubmFtZS5nZXQoKSk7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgYm9vbGVhbiBcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGhhc1JlbGF0aW9uQnlBcHBCeVR5cGVEZWZpbmVkKGFwcE5hbWUsIHJlbGF0aW9uVHlwZSkge1xuICAgIGlmICh0aGlzLmhhc0FwcERlZmluZWQoYXBwTmFtZSkgJiYgdHlwZW9mIHRoaXMuYXBwc1thcHBOYW1lXVtcbiAgICAgICAgcmVsYXRpb25UeXBlXG4gICAgICBdICE9PVxuICAgICAgXCJ1bmRlZmluZWRcIiB8fCB0aGlzLmhhc0FwcERlZmluZWQoYXBwTmFtZSkgJiYgdHlwZW9mIHRoaXMuYXBwc1tcbiAgICAgICAgYXBwTmFtZV1bXG4gICAgICAgIHJlbGF0aW9uVHlwZSArIFwiLVwiXG4gICAgICBdICE9PVxuICAgICAgXCJ1bmRlZmluZWRcIiB8fCB0aGlzLmhhc0FwcERlZmluZWQoYXBwTmFtZSkgJiYgdHlwZW9mIHRoaXMuYXBwc1tcbiAgICAgICAgYXBwTmFtZV1bXG4gICAgICAgIHJlbGF0aW9uVHlwZSArIFwiPlwiXG4gICAgICBdICE9PVxuICAgICAgXCJ1bmRlZmluZWRcIiB8fCB0aGlzLmhhc0FwcERlZmluZWQoYXBwTmFtZSkgJiYgdHlwZW9mIHRoaXMuYXBwc1tcbiAgICAgICAgYXBwTmFtZV1bXG4gICAgICAgIHJlbGF0aW9uVHlwZSArIFwiPFwiXG4gICAgICBdICE9PVxuICAgICAgXCJ1bmRlZmluZWRcIilcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oXCJyZWxhdGlvbiBcIiArIHJlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGlzIG5vdCBkZWZpbmVkIGZvciBub2RlIFwiICsgdGhpcy5uYW1lLmdldCgpICtcbiAgICAgICAgXCIgZm9yIGFwcGxpY2F0aW9uIFwiICsgYXBwTmFtZSk7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEByZXR1cm5zIEEganNvbiByZXByZXNlbnRpbmcgdGhlIG5vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIHRvSnNvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IHRoaXMuaWQuZ2V0KCksXG4gICAgICBuYW1lOiB0aGlzLm5hbWUuZ2V0KCksXG4gICAgICBlbGVtZW50OiBudWxsXG4gICAgfTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgQSBqc29uIHJlcHJlc2VudGluZyB0aGUgbm9kZSB3aXRoIGl0cyByZWxhdGlvbnNcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIHRvSnNvbldpdGhSZWxhdGlvbnMoKSB7XG4gICAgbGV0IHJlbGF0aW9ucyA9IFtdO1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLmdldFJlbGF0aW9ucygpLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgcmVsYXRpb24gPSB0aGlzLmdldFJlbGF0aW9ucygpW2luZGV4XTtcbiAgICAgIHJlbGF0aW9ucy5wdXNoKHJlbGF0aW9uLnRvSnNvbigpKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiB0aGlzLmlkLmdldCgpLFxuICAgICAgbmFtZTogdGhpcy5uYW1lLmdldCgpLFxuICAgICAgZWxlbWVudDogbnVsbCxcbiAgICAgIHJlbGF0aW9uczogcmVsYXRpb25zXG4gICAgfTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgQW4gSUZDIGxpa2UgZm9ybWF0IHJlcHJlc2VudGluZyB0aGUgbm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYXN5bmMgdG9JZmMoKSB7XG4gICAgbGV0IGVsZW1lbnQgPSBhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQodGhpcy5lbGVtZW50KTtcbiAgICByZXR1cm4gZWxlbWVudC50b0lmYygpO1xuICB9XG59XG5leHBvcnQgZGVmYXVsdCBTcGluYWxOb2RlXG5zcGluYWxDb3JlLnJlZ2lzdGVyX21vZGVscyhbU3BpbmFsTm9kZV0pOyJdfQ==