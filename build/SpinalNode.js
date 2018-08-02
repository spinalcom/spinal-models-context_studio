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
   * @returns boolean
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TcGluYWxOb2RlLmpzIl0sIm5hbWVzIjpbInNwaW5hbENvcmUiLCJyZXF1aXJlIiwiZ2xvYmFsVHlwZSIsIndpbmRvdyIsImdsb2JhbCIsImdldFZpZXdlciIsInYiLCJTcGluYWxOb2RlIiwiTW9kZWwiLCJjb25zdHJ1Y3RvciIsIl9uYW1lIiwiZWxlbWVudCIsInJlbGF0ZWRHcmFwaCIsInJlbGF0aW9ucyIsIm5hbWUiLCJGaWxlU3lzdGVtIiwiX3NpZ19zZXJ2ZXIiLCJhZGRfYXR0ciIsImlkIiwiVXRpbGl0aWVzIiwiZ3VpZCIsIlB0ciIsImFwcHMiLCJjbGFzc2lmeU5vZGUiLCJBcnJheSIsImlzQXJyYXkiLCJMc3QiLCJhZGRSZWxhdGlvbnMiLCJhZGRSZWxhdGlvbiIsImFkZFR5cGUiLCJhcHBOYW1lIiwidHlwZSIsImdldEFwcHNOYW1lcyIsIl9hdHRyaWJ1dGVfbmFtZXMiLCJnZXRFbGVtZW50IiwicHJvbWlzZUxvYWQiLCJnZXRBcHBzIiwicmVzIiwiaW5kZXgiLCJsZW5ndGgiLCJwdXNoIiwiYXBwc0xpc3QiLCJoYXNSZWxhdGlvbiIsImFkZERpcmVjdGVkUmVsYXRpb25QYXJlbnQiLCJyZWxhdGlvbiIsImdldCIsImNvbmNhdCIsImFkZFJlbGF0aW9uQnlBcHAiLCJhZGREaXJlY3RlZFJlbGF0aW9uQ2hpbGQiLCJhZGROb25EaXJlY3RlZFJlbGF0aW9uIiwiaXNSZXNlcnZlZCIsIm5hbWVUbXAiLCJsaXN0IiwiY29uc29sZSIsImxvZyIsInJlc2VydmVkUmVsYXRpb25zTmFtZXMiLCJoYXNSZXNlcnZhdGlvbkNyZWRlbnRpYWxzIiwiY29udGFpbnNBcHAiLCJyZWxhdGlvbkxpc3QiLCJhcHAiLCJlcnJvciIsImFkZFNpbXBsZVJlbGF0aW9uIiwicmVsYXRpb25UeXBlIiwiaXNEaXJlY3RlZCIsIm5vZGUyIiwiYWRkTm9kZSIsIm5vZGUiLCJyZWwiLCJTcGluYWxSZWxhdGlvbiIsImFkZFNpbXBsZVJlbGF0aW9uQnlBcHAiLCJhc05vZGUiLCJhZGRUb0V4aXN0aW5nUmVsYXRpb24iLCJhc1BhcmVudCIsImV4aXN0aW5nUmVsYXRpb25zIiwiZ2V0UmVsYXRpb25zIiwiaXNQYXJlbnQiLCJhZGROb2RldG9Ob2RlTGlzdDEiLCJhZGROb2RldG9Ob2RlTGlzdDIiLCJhZGRUb0V4aXN0aW5nUmVsYXRpb25CeUFwcCIsImFwcFJlbGF0aW9ucyIsImdldFJlbGF0aW9uc0J5QXBwTmFtZSIsInJlbW92ZUZyb21FeGlzdGluZ1JlbGF0aW9uQnlBcHAiLCJnZXRSZWxhdGlvbnNCeUFwcE5hbWVCeVR5cGUiLCJyZW1vdmVGcm9tTm9kZUxpc3QyIiwicmVtb3ZlUmVsYXRpb24iLCJfY2xhc3NpZnlSZWxhdGlvbiIsIl9yZWxhdGlvbiIsImxvYWQiLCJyZWxMaXN0IiwiaiIsImkiLCJnZXRSZWxhdGlvbnNCeVR5cGUiLCJpbmNsdWRlcyIsInQxIiwidDIiLCJ0MyIsImhhc0FwcERlZmluZWQiLCJhcHBSZWxhdGlvbkxpc3QiLCJnZXRSZWxhdGlvbnNCeUFwcCIsImhhc1JlbGF0aW9uQnlBcHBCeVR5cGVEZWZpbmVkIiwiZ2V0UmVsYXRpb25zQnlBcHBCeVR5cGUiLCJpbk5vZGVMaXN0IiwiX25vZGVsaXN0IiwiZ2V0TmVpZ2hib3JzIiwibmVpZ2hib3JzIiwibm9kZUxpc3QxIiwibm9kZUxpc3QyIiwiYWxsQnV0TWVCeUlkIiwiZ2V0Q2hpbGRyZW5CeUFwcCIsImhhc0NoaWxkcmVuIiwiZ2V0Q2hpbGRyZW5CeUFwcEJ5UmVsYXRpb24iLCJwcm9wIiwicmVsYXRpb25Mc3QiLCJyZWxhdGlvbnNOYW1lIiwiZ2V0Q2hpbGRyZW5CeVJlbGF0aW9uVHlwZSIsImdldE5vZGVMaXN0MiIsImdldE5vZGVMaXN0MSIsImNvbnRhaW5zTHN0QnlJZCIsImdldENoaWxkcmVuRWxlbWVudHNCeUFwcEJ5UmVsYXRpb24iLCJyZWxhdGlvblRtcCIsImdldENoaWxkcmVuRWxlbWVudHNCeVJlbGF0aW9uVHlwZSIsImdldFBhcmVudHNCeVJlbGF0aW9uVHlwZSIsImNhbmRpZGF0ZVJlbGF0aW9uIiwic3BsaWNlIiwicmVtb3ZlUmVsYXRpb25zIiwiX3JlbGF0aW9ucyIsInJlbW92ZVJlbGF0aW9uVHlwZSIsInJlbV9hdHRyIiwid2FybiIsInRvSnNvbiIsInRvSnNvbldpdGhSZWxhdGlvbnMiLCJ0b0lmYyIsInJlZ2lzdGVyX21vZGVscyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBRUE7Ozs7QUFLQTs7OztBQVBBLE1BQU1BLGFBQWFDLFFBQVEseUJBQVIsQ0FBbkI7QUFDQSxNQUFNQyxhQUFhLE9BQU9DLE1BQVAsS0FBa0IsV0FBbEIsR0FBZ0NDLE1BQWhDLEdBQXlDRCxNQUE1RDs7QUFFQSxJQUFJRSxZQUFZLFlBQVc7QUFDekIsU0FBT0gsV0FBV0ksQ0FBbEI7QUFDRCxDQUZEOztBQU9BOzs7Ozs7O0FBT0EsTUFBTUMsVUFBTixTQUF5QkwsV0FBV00sS0FBcEMsQ0FBMEM7QUFDeEM7Ozs7Ozs7OztBQVNBQyxjQUFZQyxLQUFaLEVBQW1CQyxPQUFuQixFQUE0QkMsWUFBNUIsRUFBMENDLFNBQTFDLEVBQXFEQyxPQUFPLFlBQTVELEVBQTBFO0FBQ3hFO0FBQ0EsUUFBSUMsV0FBV0MsV0FBZixFQUE0QjtBQUMxQixXQUFLQyxRQUFMLENBQWM7QUFDWkMsWUFBSUMscUJBQVVDLElBQVYsQ0FBZSxLQUFLWCxXQUFMLENBQWlCSyxJQUFoQyxDQURRO0FBRVpBLGNBQU1KLEtBRk07QUFHWkMsaUJBQVMsSUFBSVUsR0FBSixDQUFRVixPQUFSLENBSEc7QUFJWkUsbUJBQVcsSUFBSUwsS0FBSixFQUpDO0FBS1pjLGNBQU0sSUFBSWQsS0FBSixFQUxNO0FBTVpJLHNCQUFjQTtBQU5GLE9BQWQ7QUFRQSxVQUFJLE9BQU8sS0FBS0EsWUFBWixLQUE2QixXQUFqQyxFQUE4QztBQUM1QyxhQUFLQSxZQUFMLENBQWtCVyxZQUFsQixDQUErQixJQUEvQjtBQUNEO0FBQ0QsVUFBSSxPQUFPVixTQUFQLEtBQXFCLFdBQXpCLEVBQXNDO0FBQ3BDLFlBQUlXLE1BQU1DLE9BQU4sQ0FBY1osU0FB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QUFELENBQTNCIiwiZmlsZSI6IlNwaW5hbE5vZGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBzcGluYWxDb3JlID0gcmVxdWlyZShcInNwaW5hbC1jb3JlLWNvbm5lY3RvcmpzXCIpO1xuY29uc3QgZ2xvYmFsVHlwZSA9IHR5cGVvZiB3aW5kb3cgPT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB3aW5kb3c7XG5pbXBvcnQgU3BpbmFsUmVsYXRpb24gZnJvbSBcIi4vU3BpbmFsUmVsYXRpb25cIjtcbmxldCBnZXRWaWV3ZXIgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGdsb2JhbFR5cGUudjtcbn07XG5cbmltcG9ydCB7XG4gIFV0aWxpdGllc1xufSBmcm9tIFwiLi9VdGlsaXRpZXNcIjtcbi8qKlxuICpcbiAqXG4gKiBAZXhwb3J0XG4gKiBAY2xhc3MgU3BpbmFsTm9kZVxuICogQGV4dGVuZHMge01vZGVsfVxuICovXG5jbGFzcyBTcGluYWxOb2RlIGV4dGVuZHMgZ2xvYmFsVHlwZS5Nb2RlbCB7XG4gIC8qKlxuICAgKkNyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgU3BpbmFsTm9kZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHBhcmFtIHtNb2RlbH0gZWxlbWVudCAtIGFueSBzdWJjbGFzcyBvZiBNb2RlbFxuICAgKiBAcGFyYW0ge1NwaW5hbEdyYXBofSByZWxhdGVkR3JhcGhcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbltdfSByZWxhdGlvbnNcbiAgICogQHBhcmFtIHtzdHJpbmd9IFtuYW1lPVwiU3BpbmFsTm9kZVwiXVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgY29uc3RydWN0b3IoX25hbWUsIGVsZW1lbnQsIHJlbGF0ZWRHcmFwaCwgcmVsYXRpb25zLCBuYW1lID0gXCJTcGluYWxOb2RlXCIpIHtcbiAgICBzdXBlcigpO1xuICAgIGlmIChGaWxlU3lzdGVtLl9zaWdfc2VydmVyKSB7XG4gICAgICB0aGlzLmFkZF9hdHRyKHtcbiAgICAgICAgaWQ6IFV0aWxpdGllcy5ndWlkKHRoaXMuY29uc3RydWN0b3IubmFtZSksXG4gICAgICAgIG5hbWU6IF9uYW1lLFxuICAgICAgICBlbGVtZW50OiBuZXcgUHRyKGVsZW1lbnQpLFxuICAgICAgICByZWxhdGlvbnM6IG5ldyBNb2RlbCgpLFxuICAgICAgICBhcHBzOiBuZXcgTW9kZWwoKSxcbiAgICAgICAgcmVsYXRlZEdyYXBoOiByZWxhdGVkR3JhcGhcbiAgICAgIH0pO1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0ZWRHcmFwaCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5jbGFzc2lmeU5vZGUodGhpcyk7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHJlbGF0aW9ucyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShyZWxhdGlvbnMpIHx8IHJlbGF0aW9ucyBpbnN0YW5jZW9mIExzdClcbiAgICAgICAgICB0aGlzLmFkZFJlbGF0aW9ucyhyZWxhdGlvbnMpO1xuICAgICAgICBlbHNlIHRoaXMuYWRkUmVsYXRpb24ocmVsYXRpb25zKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhZGRUeXBlKGFwcE5hbWUsIHR5cGUpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMudHlwZSA9PT0gXCJ1bmRlZmluZWRcIilcbiAgICAgIHRoaXMuYWRkX2F0dHIoe1xuICAgICAgICB0eXBlOiBuZXcgTW9kZWwoKVxuICAgICAgfSlcbiAgICB0aGlzLnR5cGUuYWRkX2F0dHIoe1xuICAgICAgW2FwcE5hbWVdOiB0eXBlXG4gICAgfSlcbiAgfVxuXG4gIC8vIHJlZ2lzdGVyQXBwKGFwcCkge1xuICAvLyAgIHRoaXMuYXBwcy5hZGRfYXR0cih7XG4gIC8vICAgICBbYXBwLm5hbWUuZ2V0KCldOiBuZXcgUHRyKGFwcClcbiAgLy8gICB9KVxuICAvLyB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyBhbGwgYXBwbGljYXRpb25zIG5hbWVzIGFzIHN0cmluZ1xuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgZ2V0QXBwc05hbWVzKCkge1xuICAgIHJldHVybiB0aGlzLmFwcHMuX2F0dHJpYnV0ZV9uYW1lcztcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgQSBwcm9taXNlIG9mIHRoZSByZWxhdGVkIEVsZW1lbnQgXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhc3luYyBnZXRFbGVtZW50KCkge1xuICAgIHJldHVybiBhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQodGhpcy5lbGVtZW50KVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyBhbGwgYXBwbGljYXRpb25zXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhc3luYyBnZXRBcHBzKCkge1xuICAgIGxldCByZXMgPSBbXVxuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLmFwcHMuX2F0dHJpYnV0ZV9uYW1lcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IGFwcE5hbWUgPSB0aGlzLmFwcHMuX2F0dHJpYnV0ZV9uYW1lc1tpbmRleF07XG4gICAgICByZXMucHVzaChhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQodGhpcy5yZWxhdGVkR3JhcGguYXBwc0xpc3RbXG4gICAgICAgIGFwcE5hbWVdKSlcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICAvLyAvKipcbiAgLy8gICpcbiAgLy8gICpcbiAgLy8gICogQHBhcmFtIHsqfSByZWxhdGlvblR5cGVcbiAgLy8gICogQHBhcmFtIHsqfSByZWxhdGlvblxuICAvLyAgKiBAcGFyYW0geyp9IGFzUGFyZW50XG4gIC8vICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gIC8vICAqL1xuICAvLyBjaGFuZ2VEZWZhdWx0UmVsYXRpb24ocmVsYXRpb25UeXBlLCByZWxhdGlvbiwgYXNQYXJlbnQpIHtcbiAgLy8gICAgIGlmIChyZWxhdGlvbi5pc0RpcmVjdGVkLmdldCgpKSB7XG4gIC8vICAgICAgIGlmIChhc1BhcmVudCkge1xuICAvLyAgICAgICAgIFV0aWxpdGllcy5wdXRPblRvcExzdCh0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIj5cIl0sIHJlbGF0aW9uKTtcbiAgLy8gICAgICAgfSBlbHNlIHtcbiAgLy8gICAgICAgICBVdGlsaXRpZXMucHV0T25Ub3BMc3QodGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCI8XCJdLCByZWxhdGlvbik7XG4gIC8vICAgICAgIH1cbiAgLy8gICAgIH0gZWxzZSB7XG4gIC8vICAgICAgIFV0aWxpdGllcy5wdXRPblRvcExzdCh0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIi1cIl0sIHJlbGF0aW9uKTtcbiAgLy8gICAgIH1cbiAgLy8gICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBoYXNSZWxhdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5yZWxhdGlvbnMubGVuZ3RoICE9PSAwO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9ufSByZWxhdGlvblxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYWRkRGlyZWN0ZWRSZWxhdGlvblBhcmVudChyZWxhdGlvbiwgYXBwTmFtZSkge1xuICAgIGxldCBuYW1lID0gcmVsYXRpb24udHlwZS5nZXQoKTtcbiAgICBuYW1lID0gbmFtZS5jb25jYXQoXCI+XCIpO1xuICAgIGlmICh0eXBlb2YgYXBwTmFtZSA9PT0gXCJ1bmRlZmluZWRcIikgdGhpcy5hZGRSZWxhdGlvbihyZWxhdGlvbiwgbmFtZSk7XG4gICAgZWxzZSB0aGlzLmFkZFJlbGF0aW9uQnlBcHAocmVsYXRpb24sIG5hbWUsIGFwcE5hbWUpO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9ufSByZWxhdGlvblxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYWRkRGlyZWN0ZWRSZWxhdGlvbkNoaWxkKHJlbGF0aW9uLCBhcHBOYW1lKSB7XG4gICAgbGV0IG5hbWUgPSByZWxhdGlvbi50eXBlLmdldCgpO1xuICAgIG5hbWUgPSBuYW1lLmNvbmNhdChcIjxcIik7XG4gICAgaWYgKHR5cGVvZiBhcHBOYW1lID09PSBcInVuZGVmaW5lZFwiKSB0aGlzLmFkZFJlbGF0aW9uKHJlbGF0aW9uLCBuYW1lKTtcbiAgICBlbHNlIHRoaXMuYWRkUmVsYXRpb25CeUFwcChyZWxhdGlvbiwgbmFtZSwgYXBwTmFtZSk7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb259IHJlbGF0aW9uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhZGROb25EaXJlY3RlZFJlbGF0aW9uKHJlbGF0aW9uLCBhcHBOYW1lKSB7XG4gICAgbGV0IG5hbWUgPSByZWxhdGlvbi50eXBlLmdldCgpO1xuICAgIG5hbWUgPSBuYW1lLmNvbmNhdChcIi1cIik7XG4gICAgaWYgKHR5cGVvZiBhcHBOYW1lID09PSBcInVuZGVmaW5lZFwiKSB0aGlzLmFkZFJlbGF0aW9uKHJlbGF0aW9uLCBuYW1lKTtcbiAgICBlbHNlIHRoaXMuYWRkUmVsYXRpb25CeUFwcChyZWxhdGlvbiwgbmFtZSwgYXBwTmFtZSk7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb259IHJlbGF0aW9uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhZGRSZWxhdGlvbihyZWxhdGlvbiwgbmFtZSkge1xuICAgIGlmICghdGhpcy5yZWxhdGVkR3JhcGguaXNSZXNlcnZlZChyZWxhdGlvbi50eXBlLmdldCgpKSkge1xuICAgICAgbGV0IG5hbWVUbXAgPSByZWxhdGlvbi50eXBlLmdldCgpO1xuICAgICAgaWYgKHR5cGVvZiBuYW1lICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIG5hbWVUbXAgPSBuYW1lO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0aW9uc1tuYW1lVG1wXSAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgICAgdGhpcy5yZWxhdGlvbnNbbmFtZVRtcF0ucHVzaChyZWxhdGlvbik7XG4gICAgICBlbHNlIHtcbiAgICAgICAgbGV0IGxpc3QgPSBuZXcgTHN0KCk7XG4gICAgICAgIGxpc3QucHVzaChyZWxhdGlvbik7XG4gICAgICAgIHRoaXMucmVsYXRpb25zLmFkZF9hdHRyKHtcbiAgICAgICAgICBbbmFtZVRtcF06IGxpc3RcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICByZWxhdGlvbi50eXBlLmdldCgpICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uLnR5cGUuZ2V0KCldXG4gICAgICApO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbn0gcmVsYXRpb25cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLXJlbGF0aW9uIE5hbWUgaWYgbm90IG9yZ2luYWxseSBkZWZpbmVkXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhZGRSZWxhdGlvbkJ5QXBwKHJlbGF0aW9uLCBuYW1lLCBhcHBOYW1lKSB7XG4gICAgaWYgKHRoaXMucmVsYXRlZEdyYXBoLmhhc1Jlc2VydmF0aW9uQ3JlZGVudGlhbHMocmVsYXRpb24udHlwZS5nZXQoKSxcbiAgICAgICAgYXBwTmFtZSkpIHtcbiAgICAgIGlmICh0aGlzLnJlbGF0ZWRHcmFwaC5jb250YWluc0FwcChhcHBOYW1lKSkge1xuICAgICAgICBsZXQgbmFtZVRtcCA9IHJlbGF0aW9uLnR5cGUuZ2V0KCk7XG4gICAgICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgIG5hbWVUbXAgPSBuYW1lO1xuICAgICAgICAgIC8vIHJlbGF0aW9uLm5hbWUuc2V0KG5hbWVUbXApXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0aW9uc1tuYW1lVG1wXSAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgICAgICB0aGlzLnJlbGF0aW9uc1tuYW1lVG1wXS5wdXNoKHJlbGF0aW9uKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgbGV0IGxpc3QgPSBuZXcgTHN0KCk7XG4gICAgICAgICAgbGlzdC5wdXNoKHJlbGF0aW9uKTtcbiAgICAgICAgICB0aGlzLnJlbGF0aW9ucy5hZGRfYXR0cih7XG4gICAgICAgICAgICBbbmFtZVRtcF06IGxpc3RcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHRoaXMuYXBwc1thcHBOYW1lXSAhPT0gXCJ1bmRlZmluZWRcIiAmJiB0eXBlb2YgdGhpcy5hcHBzW1xuICAgICAgICAgICAgYXBwTmFtZV1bbmFtZVRtcF0gIT09IFwidW5kZWZpbmVkXCIpXG4gICAgICAgICAgdGhpcy5hcHBzW2FwcE5hbWVdW25hbWVUbXBdLnB1c2gocmVsYXRpb24pXG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiB0aGlzLmFwcHNbYXBwTmFtZV0gIT09IFwidW5kZWZpbmVkXCIgJiYgdHlwZW9mIHRoaXNcbiAgICAgICAgICAuYXBwc1tcbiAgICAgICAgICAgIGFwcE5hbWVdW25hbWVUbXBdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgbGV0IHJlbGF0aW9uTGlzdCA9IG5ldyBMc3QoKVxuICAgICAgICAgIHJlbGF0aW9uTGlzdC5wdXNoKHJlbGF0aW9uKVxuICAgICAgICAgIHRoaXMuYXBwc1thcHBOYW1lXS5hZGRfYXR0cih7XG4gICAgICAgICAgICBbbmFtZVRtcF06IHJlbGF0aW9uTGlzdFxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxldCBhcHAgPSBuZXcgTW9kZWwoKTtcbiAgICAgICAgICBsZXQgcmVsYXRpb25MaXN0ID0gbmV3IExzdCgpXG4gICAgICAgICAgcmVsYXRpb25MaXN0LnB1c2gocmVsYXRpb24pXG4gICAgICAgICAgYXBwLmFkZF9hdHRyKHtcbiAgICAgICAgICAgIFtuYW1lVG1wXTogcmVsYXRpb25MaXN0XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5hcHBzLmFkZF9hdHRyKHtcbiAgICAgICAgICAgIFthcHBOYW1lXTogYXBwXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYXBwTmFtZSArIFwiIGRvZXMgbm90IGV4aXN0XCIpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb24udHlwZS5nZXQoKSArXG4gICAgICAgIFwiIGlzIHJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5yZWxhdGVkR3JhcGgucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvbi50eXBlLmdldCgpXVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHBhcmFtIHtNb2RlbH0gZWxlbWVudCAtIGFuZCBzdWJjbGFzcyBvZiBNb2RlbFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0RpcmVjdGVkPWZhbHNlXVxuICAgKiBAcmV0dXJucyB0aGUgY3JlYXRlZCByZWxhdGlvbiwgdW5kZWZpbmVkIG90aGVyd2lzZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYWRkU2ltcGxlUmVsYXRpb24ocmVsYXRpb25UeXBlLCBlbGVtZW50LCBpc0RpcmVjdGVkID0gZmFsc2UpIHtcbiAgICBpZiAoIXRoaXMucmVsYXRlZEdyYXBoLmlzUmVzZXJ2ZWQocmVsYXRpb25UeXBlKSkge1xuICAgICAgbGV0IHJlcyA9IHt9XG4gICAgICBsZXQgbm9kZTIgPSB0aGlzLnJlbGF0ZWRHcmFwaC5hZGROb2RlKGVsZW1lbnQpO1xuICAgICAgcmVzLm5vZGUgPSBub2RlMlxuICAgICAgbGV0IHJlbCA9IG5ldyBTcGluYWxSZWxhdGlvbihyZWxhdGlvblR5cGUsIFt0aGlzXSwgW25vZGUyXSxcbiAgICAgICAgaXNEaXJlY3RlZCk7XG4gICAgICByZXMucmVsYXRpb24gPSByZWxcbiAgICAgIHRoaXMucmVsYXRlZEdyYXBoLmFkZFJlbGF0aW9uKHJlbCk7XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uVHlwZV1cbiAgICAgICk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEBwYXJhbSB7TW9kZWwgfFNwaW5hbE5vZGV9IGVsZW1lbnRcbiAgICogQHBhcmFtIHtib29sZWFufSBbaXNEaXJlY3RlZD1mYWxzZV1cbiAgICogQHBhcmFtIHtib29sZWFufSBbYXNOb2RlPWZhbHNlXSAtIHRvIHB1dCBhIFNwaW5hbE5vZGUgaW5zaWRlIGEgU3BpbmFsTm9kZVxuICAgKiBAcmV0dXJucyB0aGUgY3JlYXRlZCByZWxhdGlvblxuICAgKiBcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGFkZFNpbXBsZVJlbGF0aW9uQnlBcHAoYXBwTmFtZSwgcmVsYXRpb25UeXBlLCBlbGVtZW50LCBpc0RpcmVjdGVkID0gZmFsc2UsXG4gICAgYXNOb2RlID0gZmFsc2UpIHtcbiAgICBpZiAodGhpcy5yZWxhdGVkR3JhcGguaGFzUmVzZXJ2YXRpb25DcmVkZW50aWFscyhyZWxhdGlvblR5cGUsIGFwcE5hbWUpKSB7XG4gICAgICBpZiAodGhpcy5yZWxhdGVkR3JhcGguY29udGFpbnNBcHAoYXBwTmFtZSkpIHtcbiAgICAgICAgbGV0IHJlcyA9IHt9XG4gICAgICAgIGxldCBub2RlMiA9IGVsZW1lbnRcbiAgICAgICAgaWYgKGFzTm9kZSB8fCBlbGVtZW50LmNvbnN0cnVjdG9yLm5hbWUgIT0gXCJTcGluYWxOb2RlXCIpXG4gICAgICAgICAgbm9kZTIgPSB0aGlzLnJlbGF0ZWRHcmFwaC5hZGROb2RlKGVsZW1lbnQpO1xuICAgICAgICByZXMubm9kZSA9IG5vZGUyXG4gICAgICAgIGxldCByZWwgPSBuZXcgU3BpbmFsUmVsYXRpb24ocmVsYXRpb25UeXBlLCBbdGhpc10sIFtub2RlMl0sXG4gICAgICAgICAgaXNEaXJlY3RlZCk7XG4gICAgICAgIHJlcy5yZWxhdGlvbiA9IHJlbFxuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5hZGRSZWxhdGlvbihyZWwsIGFwcE5hbWUpO1xuICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihhcHBOYW1lICsgXCIgZG9lcyBub3QgZXhpc3RcIik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICByZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVsYXRlZEdyYXBoLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHBhcmFtIHtNb2RlbH0gZWxlbWVudCAtIGFueSBzdWJjbGFzcyBvZiBNb2RlbFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0RpcmVjdGVkPWZhbHNlXVxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFthc1BhcmVudD1mYWxzZV1cbiAgICogQHJldHVybnMgYW4gT2JqZWN0IG9mIDEpcmVsYXRpb246dGhlIHJlbGF0aW9uIHdpdGggdGhlIGFkZGVkIGVsZW1lbnQgbm9kZSBpbiAobm9kZUxpc3QyKSwgMilub2RlOiB0aGUgY3JlYXRlZCBub2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhZGRUb0V4aXN0aW5nUmVsYXRpb24oXG4gICAgcmVsYXRpb25UeXBlLFxuICAgIGVsZW1lbnQsXG4gICAgaXNEaXJlY3RlZCA9IGZhbHNlLFxuICAgIGFzUGFyZW50ID0gZmFsc2VcbiAgKSB7XG4gICAgbGV0IHJlcyA9IHt9XG4gICAgaWYgKCF0aGlzLnJlbGF0ZWRHcmFwaC5pc1Jlc2VydmVkKHJlbGF0aW9uVHlwZSkpIHtcbiAgICAgIGxldCBleGlzdGluZ1JlbGF0aW9ucyA9IHRoaXMuZ2V0UmVsYXRpb25zKCk7XG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgZXhpc3RpbmdSZWxhdGlvbnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IHJlbGF0aW9uID0gZXhpc3RpbmdSZWxhdGlvbnNbaW5kZXhdO1xuICAgICAgICByZXMucmVsYXRpb24gPSByZWxhdGlvblxuICAgICAgICBpZiAoXG4gICAgICAgICAgcmVsYXRpb25UeXBlID09PSByZWxhdGlvblR5cGUgJiZcbiAgICAgICAgICBpc0RpcmVjdGVkID09PSByZWxhdGlvbi5pc0RpcmVjdGVkLmdldCgpXG4gICAgICAgICkge1xuICAgICAgICAgIGlmIChpc0RpcmVjdGVkICYmIHRoaXMuaXNQYXJlbnQocmVsYXRpb24pKSB7XG4gICAgICAgICAgICBub2RlMiA9IHRoaXMucmVsYXRlZEdyYXBoLmFkZE5vZGUoZWxlbWVudCk7XG4gICAgICAgICAgICByZXMubm9kZSA9IG5vZGUyO1xuICAgICAgICAgICAgaWYgKGFzUGFyZW50KSB7XG4gICAgICAgICAgICAgIHJlbGF0aW9uLmFkZE5vZGV0b05vZGVMaXN0MShub2RlMik7XG4gICAgICAgICAgICAgIG5vZGUyLmFkZERpcmVjdGVkUmVsYXRpb25QYXJlbnQocmVsYXRpb24pO1xuICAgICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVsYXRpb24uYWRkTm9kZXRvTm9kZUxpc3QyKG5vZGUyKTtcbiAgICAgICAgICAgICAgbm9kZTIuYWRkRGlyZWN0ZWRSZWxhdGlvbkNoaWxkKHJlbGF0aW9uKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKCFpc0RpcmVjdGVkKSB7XG4gICAgICAgICAgICBub2RlMiA9IHRoaXMucmVsYXRlZEdyYXBoLmFkZE5vZGUoZWxlbWVudCk7XG4gICAgICAgICAgICByZXMubm9kZSA9IG5vZGUyO1xuICAgICAgICAgICAgcmVsYXRpb24uYWRkTm9kZXRvTm9kZUxpc3QyKG5vZGUyKTtcbiAgICAgICAgICAgIG5vZGUyLmFkZE5vbkRpcmVjdGVkUmVsYXRpb24ocmVsYXRpb24pO1xuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmFkZFNpbXBsZVJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgZWxlbWVudCwgaXNEaXJlY3RlZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICByZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVsYXRlZEdyYXBoLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHBhcmFtIHtNb2RlbHwgU3BpbmFsTm9kZX0gZWxlbWVudCAtIE1vZGVsOmFueSBzdWJjbGFzcyBvZiBNb2RlbFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0RpcmVjdGVkPWZhbHNlXVxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFthc1BhcmVudD1mYWxzZV1cbiAgICogQHBhcmFtIHtib29sZWFufSBbYXNOb2RlPWZhbHNlXSAtIHRvIHB1dCBhIFNwaW5hbE5vZGUgaW5zaWRlIGEgU3BpbmFsTm9kZVxuICAgKiBAcmV0dXJucyBhbiBPYmplY3Qgb2YgMSlyZWxhdGlvbjp0aGUgcmVsYXRpb24gd2l0aCB0aGUgYWRkZWQgZWxlbWVudCBub2RlIGluIChub2RlTGlzdDIpLCAyKW5vZGU6IHRoZSBjcmVhdGVkIG5vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGFkZFRvRXhpc3RpbmdSZWxhdGlvbkJ5QXBwKFxuICAgIGFwcE5hbWUsXG4gICAgcmVsYXRpb25UeXBlLFxuICAgIGVsZW1lbnQsXG4gICAgaXNEaXJlY3RlZCA9IGZhbHNlLFxuICAgIGFzUGFyZW50ID0gZmFsc2UsXG4gICAgYXNOb2RlID0gZmFsc2VcbiAgKSB7XG4gICAgbGV0IHJlcyA9IHt9XG4gICAgbGV0IG5vZGUyID0gZWxlbWVudDsgLy9pbml0aWFsaXplXG4gICAgaWYgKHRoaXMucmVsYXRlZEdyYXBoLmhhc1Jlc2VydmF0aW9uQ3JlZGVudGlhbHMocmVsYXRpb25UeXBlLCBhcHBOYW1lKSkge1xuICAgICAgaWYgKHRoaXMucmVsYXRlZEdyYXBoLmNvbnRhaW5zQXBwKGFwcE5hbWUpKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5hcHBzW2FwcE5hbWVdICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgbGV0IGFwcFJlbGF0aW9ucyA9IHRoaXMuZ2V0UmVsYXRpb25zQnlBcHBOYW1lKGFwcE5hbWUpO1xuICAgICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBhcHBSZWxhdGlvbnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgICBjb25zdCByZWxhdGlvbiA9IGFwcFJlbGF0aW9uc1tpbmRleF07XG4gICAgICAgICAgICByZXMucmVsYXRpb24gPSByZWxhdGlvblxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICByZWxhdGlvbi50eXBlLmdldCgpID09PSByZWxhdGlvblR5cGUgJiZcbiAgICAgICAgICAgICAgaXNEaXJlY3RlZCA9PT0gcmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgIGlmIChpc0RpcmVjdGVkICYmIHRoaXMuaXNQYXJlbnQocmVsYXRpb24pKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFzTm9kZSB8fCBlbGVtZW50LmNvbnN0cnVjdG9yLm5hbWUgIT0gXCJTcGluYWxOb2RlXCIpXG4gICAgICAgICAgICAgICAgICBub2RlMiA9IHRoaXMucmVsYXRlZEdyYXBoLmFkZE5vZGUoZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgcmVzLm5vZGUgPSBub2RlMjtcbiAgICAgICAgICAgICAgICBpZiAoYXNQYXJlbnQpIHtcbiAgICAgICAgICAgICAgICAgIHJlbGF0aW9uLmFkZE5vZGV0b05vZGVMaXN0MShub2RlMik7XG4gICAgICAgICAgICAgICAgICBub2RlMi5hZGREaXJlY3RlZFJlbGF0aW9uUGFyZW50KHJlbGF0aW9uLCBhcHBOYW1lKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHJlbGF0aW9uLmFkZE5vZGV0b05vZGVMaXN0Mihub2RlMik7XG4gICAgICAgICAgICAgICAgICBub2RlMi5hZGREaXJlY3RlZFJlbGF0aW9uQ2hpbGQocmVsYXRpb24sIGFwcE5hbWUpO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoIWlzRGlyZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoYXNOb2RlIHx8IGVsZW1lbnQuY29uc3RydWN0b3IubmFtZSAhPSBcIlNwaW5hbE5vZGVcIilcbiAgICAgICAgICAgICAgICAgIG5vZGUyID0gdGhpcy5yZWxhdGVkR3JhcGguYWRkTm9kZShlbGVtZW50KTtcbiAgICAgICAgICAgICAgICByZXMubm9kZSA9IG5vZGUyO1xuICAgICAgICAgICAgICAgIHJlbGF0aW9uLmFkZE5vZGV0b05vZGVMaXN0Mihub2RlMik7XG4gICAgICAgICAgICAgICAgbm9kZTIuYWRkTm9uRGlyZWN0ZWRSZWxhdGlvbihyZWxhdGlvbiwgYXBwTmFtZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5hZGRTaW1wbGVSZWxhdGlvbkJ5QXBwKFxuICAgICAgICAgIGFwcE5hbWUsXG4gICAgICAgICAgcmVsYXRpb25UeXBlLFxuICAgICAgICAgIGVsZW1lbnQsXG4gICAgICAgICAgaXNEaXJlY3RlZFxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihhcHBOYW1lICsgXCIgZG9lcyBub3QgZXhpc3RcIik7XG4gICAgICB9XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uVHlwZV1cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqICBwYXJlbnQgcmVtb3ZlIHRoZSBjaGlsZCBmb3Igbm93XG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nIHwgU3BpbmFsQXBwbGljYXRpb259IGFwcFxuICAgKiBAcGFyYW0ge3N0cmluZyB8IFNwaW5hbFJlbGF0aW9ufSByZWxhdGlvblxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGV9IG5vZGVcbiAgICogQHBhcmFtIHtib29sZWFufSBbaXNEaXJlY3RlZD1mYWxzZV1cbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIHJlbW92ZUZyb21FeGlzdGluZ1JlbGF0aW9uQnlBcHAoXG4gICAgYXBwLFxuICAgIHJlbGF0aW9uLFxuICAgIG5vZGUsXG4gICAgaXNEaXJlY3RlZCA9IGZhbHNlKSB7XG4gICAgbGV0IGFwcE5hbWUgPSBcIlwiXG4gICAgaWYgKHR5cGVvZiBhcHAgIT0gXCJzdHJpbmdcIilcbiAgICAgIGFwcE5hbWUgPSBhcHAubmFtZS5nZXQoKVxuICAgIGVsc2VcbiAgICAgIGFwcE5hbWUgPSBhcHBcbiAgICBsZXQgcmVsYXRpb25UeXBlID0gXCJcIlxuICAgIGlmICh0eXBlb2YgcmVsYXRpb24gIT0gXCJzdHJpbmdcIilcbiAgICAgIHJlbGF0aW9uVHlwZSA9IHJlbGF0aW9uLnR5cGUuZ2V0KClcbiAgICBlbHNlXG4gICAgICByZWxhdGlvblR5cGUgPSByZWxhdGlvblxuICAgIGxldCByZWxhdGlvbnMgPSB0aGlzLmdldFJlbGF0aW9uc0J5QXBwTmFtZUJ5VHlwZShhcHBOYW1lLCByZWxhdGlvblR5cGUpXG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHJlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IHJlbGF0aW9uID0gcmVsYXRpb25zW2luZGV4XTtcbiAgICAgIGlmIChyZWxhdGlvbi5pc0RpcmVjdGVkLmdldCgpID09PSBpc0RpcmVjdGVkKSB7XG4gICAgICAgIHJlbGF0aW9uLnJlbW92ZUZyb21Ob2RlTGlzdDIobm9kZSlcbiAgICAgICAgbm9kZS5yZW1vdmVSZWxhdGlvbihyZWxhdGlvbiwgYXBwLCBpc0RpcmVjdGVkKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cblxuXG4gIC8vIGFkZFJlbGF0aW9uMihfcmVsYXRpb24sIF9uYW1lKSB7XG4gIC8vICAgbGV0IGNsYXNzaWZ5ID0gZmFsc2U7XG4gIC8vICAgbGV0IG5hbWUgPSBfcmVsYXRpb24udHlwZS5nZXQoKTtcbiAgLy8gICBpZiAodHlwZW9mIF9uYW1lICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gIC8vICAgICBuYW1lID0gX25hbWU7XG4gIC8vICAgfVxuICAvLyAgIGlmICh0eXBlb2YgdGhpcy5yZWxhdGlvbnNbX3JlbGF0aW9uLnR5cGUuZ2V0KCldICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gIC8vICAgICBpZiAoX3JlbGF0aW9uLmlzRGlyZWN0ZWQuZ2V0KCkpIHtcbiAgLy8gICAgICAgZm9yIChcbiAgLy8gICAgICAgICBsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMucmVsYXRpb25zW19yZWxhdGlvbi50eXBlLmdldCgpXS5sZW5ndGg7IGluZGV4KytcbiAgLy8gICAgICAgKSB7XG4gIC8vICAgICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMucmVsYXRpb25zW19yZWxhdGlvbi50eXBlLmdldCgpXVtpbmRleF07XG4gIC8vICAgICAgICAgaWYgKFxuICAvLyAgICAgICAgICAgVXRpbGl0aWVzLmFycmF5c0VxdWFsKFxuICAvLyAgICAgICAgICAgICBfcmVsYXRpb24uZ2V0Tm9kZUxpc3QxSWRzKCksXG4gIC8vICAgICAgICAgICAgIGVsZW1lbnQuZ2V0Tm9kZUxpc3QxSWRzKClcbiAgLy8gICAgICAgICAgIClcbiAgLy8gICAgICAgICApIHtcbiAgLy8gICAgICAgICAgIGVsZW1lbnQuYWRkTm90RXhpc3RpbmdWZXJ0aWNlc3RvTm9kZUxpc3QyKF9yZWxhdGlvbi5ub2RlTGlzdDIpO1xuICAvLyAgICAgICAgIH0gZWxzZSB7XG4gIC8vICAgICAgICAgICBlbGVtZW50LnB1c2goX3JlbGF0aW9uKTtcbiAgLy8gICAgICAgICAgIGNsYXNzaWZ5ID0gdHJ1ZTtcbiAgLy8gICAgICAgICB9XG4gIC8vICAgICAgIH1cbiAgLy8gICAgIH0gZWxzZSB7XG4gIC8vICAgICAgIHRoaXMucmVsYXRpb25zW19yZWxhdGlvbi50eXBlLmdldCgpXS5hZGROb3RFeGlzdGluZ1ZlcnRpY2VzdG9SZWxhdGlvbihcbiAgLy8gICAgICAgICBfcmVsYXRpb25cbiAgLy8gICAgICAgKTtcbiAgLy8gICAgIH1cbiAgLy8gICB9IGVsc2Uge1xuICAvLyAgICAgaWYgKF9yZWxhdGlvbi5pc0RpcmVjdGVkLmdldCgpKSB7XG4gIC8vICAgICAgIGxldCBsaXN0ID0gbmV3IExzdCgpO1xuICAvLyAgICAgICBsaXN0LnB1c2goX3JlbGF0aW9uKTtcbiAgLy8gICAgICAgdGhpcy5yZWxhdGlvbnMuYWRkX2F0dHIoe1xuICAvLyAgICAgICAgIFtuYW1lXTogbGlzdFxuICAvLyAgICAgICB9KTtcbiAgLy8gICAgICAgdGhpcy5fY2xhc3NpZnlSZWxhdGlvbihfcmVsYXRpb24pO1xuICAvLyAgICAgfSBlbHNlIHtcbiAgLy8gICAgICAgdGhpcy5yZWxhdGlvbnMuYWRkX2F0dHIoe1xuICAvLyAgICAgICAgIFtuYW1lXTogX3JlbGF0aW9uXG4gIC8vICAgICAgIH0pO1xuICAvLyAgICAgICBjbGFzc2lmeSA9IHRydWU7XG4gIC8vICAgICB9XG4gIC8vICAgfVxuICAvLyAgIGlmIChjbGFzc2lmeSkgdGhpcy5fY2xhc3NpZnlSZWxhdGlvbihfcmVsYXRpb24pO1xuICAvLyB9XG5cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb259IF9yZWxhdGlvblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgX2NsYXNzaWZ5UmVsYXRpb24oX3JlbGF0aW9uKSB7XG4gICAgdGhpcy5yZWxhdGVkR3JhcGgubG9hZChyZWxhdGVkR3JhcGggPT4ge1xuICAgICAgcmVsYXRlZEdyYXBoLl9jbGFzc2lmeVJlbGF0aW9uKF9yZWxhdGlvbik7XG4gICAgfSk7XG4gIH1cblxuICAvL1RPRE8gOk5vdFdvcmtpbmdcbiAgLy8gYWRkUmVsYXRpb24oX3JlbGF0aW9uKSB7XG4gIC8vICAgdGhpcy5hZGRSZWxhdGlvbihfcmVsYXRpb24pXG4gIC8vICAgdGhpcy5yZWxhdGVkR3JhcGgubG9hZChyZWxhdGVkR3JhcGggPT4ge1xuICAvLyAgICAgcmVsYXRlZEdyYXBoLl9hZGROb3RFeGlzdGluZ1ZlcnRpY2VzRnJvbVJlbGF0aW9uKF9yZWxhdGlvbilcbiAgLy8gICB9KVxuICAvLyB9XG4gIC8vVE9ETyA6Tm90V29ya2luZ1xuICAvLyBhZGRSZWxhdGlvbnMoX3JlbGF0aW9ucykge1xuICAvLyAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBfcmVsYXRpb25zLmxlbmd0aDsgaW5kZXgrKykge1xuICAvLyAgICAgdGhpcy5hZGRSZWxhdGlvbihfcmVsYXRpb25zW2luZGV4XSk7XG4gIC8vICAgfVxuICAvLyB9XG5cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEByZXR1cm5zIGFsbCB0aGUgcmVsYXRpb25zIG9mIHRoaXMgTm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgZ2V0UmVsYXRpb25zKHJlbGF0aW9uVHlwZSkge1xuICAgIGxldCByZXMgPSBbXTtcbiAgICBpZiAodHlwZW9mIHJlbGF0aW9uVHlwZSAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBpZiAodHlwZW9mIHRoaXMucmVsYXRpb25zW3JlbGF0aW9uVHlwZV0gIT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBsZXQgcmVsTGlzdCA9IHRoaXMucmVsYXRpb25zW3JlbGF0aW9uVHlwZV1cbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCByZWxMaXN0Lmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgY29uc3QgcmVsYXRpb24gPSByZWxMaXN0W2pdO1xuICAgICAgICAgIHJlcy5wdXNoKHJlbGF0aW9uKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc1xuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucmVsYXRpb25zLl9hdHRyaWJ1dGVfbmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHJlbExpc3QgPSB0aGlzLnJlbGF0aW9uc1t0aGlzLnJlbGF0aW9ucy5fYXR0cmlidXRlX25hbWVzW2ldXTtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcmVsTGlzdC5sZW5ndGg7IGorKykge1xuICAgICAgICBjb25zdCByZWxhdGlvbiA9IHJlbExpc3Rbal07XG4gICAgICAgIHJlcy5wdXNoKHJlbGF0aW9uKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAgICogQHJldHVybnMgYWxsIHJlbGF0aW9ucyBvZiBhIHNwZWNpZmljIHJlbGF0aW9uIHR5cGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGdldFJlbGF0aW9uc0J5VHlwZSh0eXBlKSB7XG4gICAgbGV0IHJlcyA9IFtdO1xuICAgIGlmICghdHlwZS5pbmNsdWRlcyhcIj5cIiwgdHlwZS5sZW5ndGggLSAyKSAmJlxuICAgICAgIXR5cGUuaW5jbHVkZXMoXCI8XCIsIHR5cGUubGVuZ3RoIC0gMikgJiZcbiAgICAgICF0eXBlLmluY2x1ZGVzKFwiLVwiLCB0eXBlLmxlbmd0aCAtIDIpXG4gICAgKSB7XG4gICAgICBsZXQgdDEgPSB0eXBlLmNvbmNhdChcIj5cIik7XG4gICAgICByZXMgPSByZXMuY29uY2F0KHRoaXMuZ2V0UmVsYXRpb25zKHQxKSk7XG4gICAgICBsZXQgdDIgPSB0eXBlLmNvbmNhdChcIjxcIik7XG4gICAgICByZXMgPSByZXMuY29uY2F0KHRoaXMuZ2V0UmVsYXRpb25zKHQyKSk7XG4gICAgICBsZXQgdDMgPSB0eXBlLmNvbmNhdChcIi1cIik7XG4gICAgICByZXMgPSByZXMuY29uY2F0KHRoaXMuZ2V0UmVsYXRpb25zKHQzKSk7XG4gICAgfVxuICAgIC8vIGlmICh0eXBlb2YgdGhpcy5yZWxhdGlvbnNbdHlwZV0gIT09IFwidW5kZWZpbmVkXCIpIHJlcyA9IHRoaXMucmVsYXRpb25zW1xuICAgIC8vICAgdHlwZV07XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFwcE5hbWVcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFzUGFyZW50XG4gICAqIEByZXR1cm5zIGFuIGFycmF5IG9mIGFsbCByZWxhdGlvbnMgb2YgYSBzcGVjaWZpYyBhcHAgZm9yIHRoaXMgbm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgZ2V0UmVsYXRpb25zQnlBcHBOYW1lKGFwcE5hbWUsIGFzUGFyZW50KSB7XG4gICAgbGV0IHJlcyA9IFtdO1xuICAgIGlmICh0aGlzLmhhc0FwcERlZmluZWQoYXBwTmFtZSkpIHtcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLmFwcHNbYXBwTmFtZV0uX2F0dHJpYnV0ZV9uYW1lcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgaWYgKHR5cGVvZiBhc1BhcmVudCAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgaWYgKHRoaXMuYXBwc1thcHBOYW1lXS5fYXR0cmlidXRlX25hbWVzW2luZGV4XS5pbmNsdWRlcyhcIj5cIiwgdGhpc1xuICAgICAgICAgICAgICAuYXBwc1thcHBOYW1lXS5fYXR0cmlidXRlX25hbWVzW2luZGV4XS5sZW5ndGggLSAyKSkge1xuICAgICAgICAgICAgY29uc3QgYXBwUmVsYXRpb25MaXN0ID0gdGhpcy5hcHBzW2FwcE5hbWVdW3RoaXMuYXBwc1thcHBOYW1lXS5fYXR0cmlidXRlX25hbWVzW1xuICAgICAgICAgICAgICBpbmRleF1dO1xuICAgICAgICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGFwcFJlbGF0aW9uTGlzdC5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICAgICAgY29uc3QgcmVsYXRpb24gPSBhcHBSZWxhdGlvbkxpc3RbaW5kZXhdO1xuICAgICAgICAgICAgICByZXMucHVzaChyZWxhdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IGFwcFJlbGF0aW9uTGlzdCA9IHRoaXMuYXBwc1thcHBOYW1lXVt0aGlzLmFwcHNbYXBwTmFtZV0uX2F0dHJpYnV0ZV9uYW1lc1tcbiAgICAgICAgICAgIGluZGV4XV07XG4gICAgICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGFwcFJlbGF0aW9uTGlzdC5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICAgIGNvbnN0IHJlbGF0aW9uID0gYXBwUmVsYXRpb25MaXN0W2luZGV4XTtcbiAgICAgICAgICAgIHJlcy5wdXNoKHJlbGF0aW9uKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG4gIC8vIC8qKlxuICAvLyAgKlxuICAvLyAgKlxuICAvLyAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAvLyAgKiBAcmV0dXJucyBhbiBvYmplY3Qgb2YgYWxsIHJlbGF0aW9ucyBvZiBhIHNwZWNpZmljIGFwcCBmb3IgdGhpcyBub2RlXG4gIC8vICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gIC8vICAqL1xuICAvLyBnZXRSZWxhdGlvbnNXaXRoS2V5c0J5QXBwTmFtZShhcHBOYW1lKSB7XG4gIC8vICAgaWYgKHRoaXMuaGFzQXBwRGVmaW5lZChhcHBOYW1lKSkge1xuICAvLyAgICAgcmV0dXJuIHRoaXMuYXBwc1thcHBOYW1lXTtcbiAgLy8gICB9XG4gIC8vIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsQXBwbGljYXRpb24gfCBzdHJpbmd9IGFwcFxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXNQYXJlbnRcbiAgICogQHJldHVybnMgYWxsIHJlbGF0aW9ucyBvZiBhIHNwZWNpZmljIGFwcFxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgZ2V0UmVsYXRpb25zQnlBcHAoYXBwLCBhc1BhcmVudCkge1xuICAgIGxldCBhcHBOYW1lID0gXCJcIlxuICAgIGlmICh0eXBlb2YgYXBwICE9IFwic3RyaW5nXCIpXG4gICAgICBhcHBOYW1lID0gYXBwLm5hbWUuZ2V0KClcbiAgICBlbHNlXG4gICAgICBhcHBOYW1lID0gYXBwXG4gICAgcmV0dXJuIHRoaXMuZ2V0UmVsYXRpb25zQnlBcHBOYW1lKGFwcE5hbWUsIGFzUGFyZW50KVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEByZXR1cm5zIGFsbCByZWxhdGlvbnMgb2YgYSBzcGVjaWZpYyBhcHAgb2YgYSBzcGVjaWZpYyB0eXBlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBnZXRSZWxhdGlvbnNCeUFwcE5hbWVCeVR5cGUoYXBwTmFtZSwgcmVsYXRpb25UeXBlKSB7XG4gICAgbGV0IHJlcyA9IFtdO1xuICAgIGlmICh0aGlzLmhhc1JlbGF0aW9uQnlBcHBCeVR5cGVEZWZpbmVkKGFwcE5hbWUsIHJlbGF0aW9uVHlwZSkpIHtcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLmFwcHNbYXBwTmFtZV0uX2F0dHJpYnV0ZV9uYW1lcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgYXBwUmVsYXRpb25MaXN0ID0gdGhpcy5hcHBzW2FwcE5hbWVdW3RoaXMuYXBwc1thcHBOYW1lXS5fYXR0cmlidXRlX25hbWVzW1xuICAgICAgICAgIGluZGV4XV07XG4gICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBhcHBSZWxhdGlvbkxpc3QubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgY29uc3QgcmVsYXRpb24gPSBhcHBSZWxhdGlvbkxpc3RbaW5kZXhdO1xuICAgICAgICAgIGlmIChyZWxhdGlvbi50eXBlLmdldCgpID09PSByZWxhdGlvblR5cGUpIHJlcy5wdXNoKHJlbGF0aW9uKTtcbiAgICAgICAgICBlbHNlIGlmICghcmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKSAmJiByZWxhdGlvbi50eXBlLmdldCgpICtcbiAgICAgICAgICAgIFwiLVwiID09PSByZWxhdGlvblR5cGUpIHJlcy5wdXNoKHJlbGF0aW9uKTtcbiAgICAgICAgICBlbHNlIGlmIChyZWxhdGlvbi50eXBlLmdldCgpICsgXCI+XCIgPT09IHJlbGF0aW9uVHlwZSkgcmVzLnB1c2goXG4gICAgICAgICAgICByZWxhdGlvbik7XG4gICAgICAgICAgZWxzZSBpZiAocmVsYXRpb24udHlwZS5nZXQoKSArIFwiPFwiID09PSByZWxhdGlvblR5cGUpIHJlcy5wdXNoKFxuICAgICAgICAgICAgcmVsYXRpb24pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsQXBwbGljYXRpb259IGFwcFxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEByZXR1cm5zIGFsbCByZWxhdGlvbnMgb2YgYSBzcGVjaWZpYyBhcHAgb2YgYSBzcGVjaWZpYyB0eXBlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBnZXRSZWxhdGlvbnNCeUFwcEJ5VHlwZShhcHAsIHJlbGF0aW9uVHlwZSkge1xuXG4gICAgbGV0IGFwcE5hbWUgPSBhcHAubmFtZS5nZXQoKVxuICAgIHJldHVybiB0aGlzLmdldFJlbGF0aW9uc0J5QXBwTmFtZUJ5VHlwZShhcHBOYW1lLCByZWxhdGlvblR5cGUpXG5cbiAgfVxuICAvKipcbiAgICogIHZlcmlmeSBpZiBhbiBlbGVtZW50IGlzIGFscmVhZHkgaW4gZ2l2ZW4gbm9kZUxpc3RcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxOb2RlW119IF9ub2RlbGlzdFxuICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBpbk5vZGVMaXN0KF9ub2RlbGlzdCkge1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBfbm9kZWxpc3QubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gX25vZGVsaXN0W2luZGV4XTtcbiAgICAgIGlmIChlbGVtZW50LmlkLmdldCgpID09PSB0aGlzLmlkLmdldCgpKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy9UT0RPIGdldFBhcmVudFxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmcgfCBTcGluYWxBcHBsaWNhdGlvbn0gYXBwTmFtZSAtIG9wdGlvbmFsXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGUgLSBvcHRpb25hbFxuICAgKiBAcmV0dXJucyBhIGxpc3Qgb2YgbmVpZ2hib3JzIG5vZGVzIFxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgZ2V0TmVpZ2hib3JzKHJlbGF0aW9uVHlwZSwgYXBwKSB7XG4gICAgbGV0IGFwcE5hbWUgPSBcIlwiXG4gICAgaWYgKHR5cGVvZiBhcHAgIT0gXCJzdHJpbmdcIilcbiAgICAgIGFwcE5hbWUgPSBhcHAubmFtZS5nZXQoKVxuICAgIGVsc2VcbiAgICAgIGFwcE5hbWUgPSBhcHBcbiAgICBsZXQgbmVpZ2hib3JzID0gW107XG4gICAgbGV0IHJlbGF0aW9ucyA9IG51bGxcbiAgICBpZiAodHlwZW9mIHJlbGF0aW9uVHlwZSA9PSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiBhcHBOYW1lID09IFwidW5kZWZpbmVkXCIpXG4gICAgICByZWxhdGlvbnMgPSB0aGlzLmdldFJlbGF0aW9ucygpO1xuICAgIGVsc2UgaWYgKHR5cGVvZiByZWxhdGlvblR5cGUgIT0gXCJ1bmRlZmluZWRcIiAmJiB0eXBlb2YgYXBwTmFtZSA9PVxuICAgICAgXCJ1bmRlZmluZWRcIilcbiAgICAgIHJlbGF0aW9ucyA9IHRoaXMuZ2V0UmVsYXRpb25zQnlUeXBlKHJlbGF0aW9uVHlwZSk7XG4gICAgZWxzZSBpZiAodHlwZW9mIHJlbGF0aW9uVHlwZSA9PSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiBhcHBOYW1lICE9XG4gICAgICBcInVuZGVmaW5lZFwiKVxuICAgICAgcmVsYXRpb25zID0gdGhpcy5nZXRSZWxhdGlvbnNCeUFwcChhcHBOYW1lKTtcbiAgICBlbHNlXG4gICAgICByZWxhdGlvbnMgPSB0aGlzLmdldFJlbGF0aW9uc0J5QXBwTmFtZUJ5VHlwZShhcHBOYW1lLCByZWxhdGlvblR5cGUpO1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCByZWxhdGlvbnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCByZWxhdGlvbiA9IHJlbGF0aW9uc1tpbmRleF07XG4gICAgICBpZiAocmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKSkge1xuICAgICAgICBpZiAodGhpcy5pbk5vZGVMaXN0KHJlbGF0aW9uLm5vZGVMaXN0MSkpXG4gICAgICAgICAgbmVpZ2hib3JzID0gVXRpbGl0aWVzLmNvbmNhdChuZWlnaGJvcnMsIHJlbGF0aW9uLm5vZGVMaXN0Mik7XG4gICAgICAgIGVsc2UgbmVpZ2hib3JzID0gVXRpbGl0aWVzLmNvbmNhdChuZWlnaGJvcnMsIHJlbGF0aW9uLm5vZGVMaXN0MSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZWlnaGJvcnMgPSBVdGlsaXRpZXMuY29uY2F0KFxuICAgICAgICAgIG5laWdoYm9ycyxcbiAgICAgICAgICBVdGlsaXRpZXMuYWxsQnV0TWVCeUlkKHJlbGF0aW9uLm5vZGVMaXN0MSwgdGhpcylcbiAgICAgICAgKTtcbiAgICAgICAgbmVpZ2hib3JzID0gVXRpbGl0aWVzLmNvbmNhdChcbiAgICAgICAgICBuZWlnaGJvcnMsXG4gICAgICAgICAgVXRpbGl0aWVzLmFsbEJ1dE1lQnlJZChyZWxhdGlvbi5ub2RlTGlzdDIsIHRoaXMpXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZWlnaGJvcnM7XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbEFwcGxpY2F0aW9uIHwgc3RyaW5nfSBhcHBcbiAgICogQHJldHVybnMgYm9vbGVhblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgZ2V0Q2hpbGRyZW5CeUFwcChhcHApIHtcbiAgICBsZXQgcmVzID0gW11cbiAgICBpZiAodGhpcy5oYXNDaGlsZHJlbihhcHApKSB7XG4gICAgICBsZXQgcmVsYXRpb25zID0gdGhpcy5nZXRSZWxhdGlvbnNCeUFwcChhcHAsIHRydWUpO1xuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHJlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgcmVsYXRpb24gPSByZWxhdGlvbnNbaW5kZXhdO1xuICAgICAgICByZXMgPSByZXMuY29uY2F0KHRoaXMuZ2V0Q2hpbGRyZW5CeUFwcEJ5UmVsYXRpb24oYXBwLCByZWxhdGlvbikpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXNcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbEFwcGxpY2F0aW9ufCBzdHJpbmd9IGFwcFxuICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBoYXNDaGlsZHJlbihhcHApIHtcbiAgICBpZiAodHlwZW9mIGFwcCAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBsZXQgYXBwTmFtZSA9IFwiXCJcbiAgICAgIGlmICh0eXBlb2YgYXBwICE9IFwic3RyaW5nXCIpXG4gICAgICAgIGFwcE5hbWUgPSBhcHAubmFtZS5nZXQoKVxuICAgICAgZWxzZVxuICAgICAgICBhcHBOYW1lID0gYXBwXG4gICAgICBpZiAodGhpcy5oYXNBcHBEZWZpbmVkKGFwcE5hbWUpKSB7XG4gICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLmFwcHNbYXBwTmFtZV0uX2F0dHJpYnV0ZV9uYW1lcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICBjb25zdCBwcm9wID0gdGhpcy5hcHBzW2FwcE5hbWVdLl9hdHRyaWJ1dGVfbmFtZXNbaW5kZXhdXG4gICAgICAgICAgY29uc3QgcmVsYXRpb25Mc3QgPSB0aGlzLmFwcHNbYXBwTmFtZV1bcHJvcF07XG4gICAgICAgICAgaWYgKHByb3AuaW5jbHVkZXMoXCI+XCIsIHByb3AubGVuZ3RoIC0gMikpXG4gICAgICAgICAgICBpZiAocmVsYXRpb25Mc3QubGVuZ3RoID4gMClcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5yZWxhdGlvbnMuX2F0dHJpYnV0ZV9uYW1lcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IHJlbGF0aW9uc05hbWUgPSB0aGlzLnJlbGF0aW9ucy5fYXR0cmlidXRlX25hbWVzW2luZGV4XTtcbiAgICAgIGlmIChyZWxhdGlvbnNOYW1lLmluY2x1ZGVzKFwiPlwiLCByZWxhdGlvbnNOYW1lLmxlbmd0aCAtIDIpKVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEByZXR1cm5zIGFycmF5IG9mIHNwaW5hbE5vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGdldENoaWxkcmVuQnlSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlKSB7XG4gICAgbGV0IHJlcyA9IFtdXG4gICAgaWYgKHRoaXMucmVsYXRpb25zW3JlbGF0aW9uVHlwZSArIFwiPlwiXSlcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIj5cIl0ubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IHJlbGF0aW9uID0gdGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCI+XCJdW2luZGV4XTtcbiAgICAgICAgbGV0IG5vZGVMaXN0MiA9IHJlbGF0aW9uLmdldE5vZGVMaXN0MigpO1xuICAgICAgICByZXMgPSBVdGlsaXRpZXMuY29uY2F0KHJlcywgbm9kZUxpc3QyKVxuICAgICAgfVxuICAgIHJldHVybiByZXNcbiAgfVxuXG4gIC8vVE9ET1xuICAvLyAvKipcbiAgLy8gICpcbiAgLy8gICpcbiAgLy8gICogQHBhcmFtIHtzdHJpbmd8U3BpbmFsUmVsYXRpb259IHJlbGF0aW9uXG4gIC8vICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgLy8gICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgLy8gICovXG4gIC8vIGlzUGFyZW50KHJlbGF0aW9uKSB7XG4gIC8vICAgaWYgKHR5cGVvZiByZWxhdGlvbiA9PT0gXCJzdHJpbmdcIikge1xuICAvLyAgICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0aW9uc1tyZWxhdGlvbiArIFwiPlwiXSAhPSBcInVuZGVmaW5lZFwiKSB7XG4gIC8vICAgICAgIGxldCByZWxhdGlvbnMgPSB0aGlzLnJlbGF0aW9uc1tyZWxhdGlvbiArIFwiPlwiXVxuICAvLyAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcmVsYXRpb25zLmxlbmd0aDsgaW5kZXgrKykge1xuICAvLyAgICAgICAgIGNvbnN0IHJlbGF0aW9uID0gcmVsYXRpb25zW2luZGV4XTtcbiAgLy8gICAgICAgICBsZXQgbm9kZUxpc3QxID0gcmVsYXRpb24uZ2V0Tm9kZUxpc3QxKClcbiAgLy8gICAgICAgICByZXR1cm4gVXRpbGl0aWVzLmNvbnRhaW5zTHN0QnlJZChub2RlTGlzdDEsIHRoaXMpXG4gIC8vICAgICAgIH1cbiAgLy8gICAgIH1cbiAgLy8gICB9IGVsc2Uge1xuICAvLyAgICAgbGV0IG5vZGVMaXN0MSA9IHJlbGF0aW9uLmdldE5vZGVMaXN0MSgpXG4gIC8vICAgICByZXR1cm4gVXRpbGl0aWVzLmNvbnRhaW5zTHN0QnlJZChub2RlTGlzdDEsIHRoaXMpXG4gIC8vICAgfVxuICAvLyAgIHJldHVybiBmYWxzZTtcbiAgLy8gfVxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9ufSByZWxhdGlvblxuICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBpc1BhcmVudChyZWxhdGlvbikge1xuICAgIGxldCBub2RlTGlzdDEgPSByZWxhdGlvbi5nZXROb2RlTGlzdDEoKVxuICAgIHJldHVybiBVdGlsaXRpZXMuY29udGFpbnNMc3RCeUlkKG5vZGVMaXN0MSwgdGhpcylcbiAgfVxuXG4gIC8vVE9ET1xuICAvLyAvKipcbiAgLy8gICpcbiAgLy8gICpcbiAgLy8gICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbn0gcmVsYXRpb25cbiAgLy8gICogQHJldHVybnMgYm9vbGVhblxuICAvLyAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAvLyAgKi9cbiAgLy8gaXNDaGlsZChyZWxhdGlvbikge1xuICAvLyAgIGxldCBub2RlTGlzdDIgPSByZWxhdGlvbi5nZXROb2RlTGlzdDIoKVxuICAvLyAgIHJldHVybiBVdGlsaXRpZXMuY29udGFpbnNMc3RCeUlkKG5vZGVMaXN0MiwgdGhpcylcbiAgLy8gfVxuXG4gIC8vVE9ETyBPcHRpbWl6ZVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmcgfCBTcGluYWxBcHBsaWNhdGlvbn0gYXBwXG4gICAqIEBwYXJhbSB7c3RyaW5nIHwgU3BpbmFsUmVsYXRpb259IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBhcnJheSBvZiBzcGluYWxOb2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBnZXRDaGlsZHJlbkJ5QXBwQnlSZWxhdGlvbihhcHAsIHJlbGF0aW9uKSB7XG4gICAgbGV0IGFwcE5hbWUgPSBcIlwiXG4gICAgbGV0IHJlbGF0aW9uVHlwZSA9IFwiXCJcbiAgICBsZXQgcmVzID0gW11cbiAgICBpZiAodHlwZW9mIGFwcCAhPSBcInN0cmluZ1wiKVxuICAgICAgYXBwTmFtZSA9IGFwcC5uYW1lLmdldCgpXG4gICAgZWxzZVxuICAgICAgYXBwTmFtZSA9IGFwcFxuICAgIGlmIChBcnJheS5pc0FycmF5KHJlbGF0aW9uKSkge1xuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHJlbGF0aW9uLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCByZWwgPSByZWxhdGlvbltpbmRleF07XG4gICAgICAgIHJlcyA9IHJlcy5jb25jYXQodGhpcy5nZXRDaGlsZHJlbkJ5QXBwQnlSZWxhdGlvbihhcHAsIHJlbCkpXG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHJlbGF0aW9uICE9IFwic3RyaW5nXCIpXG4gICAgICByZWxhdGlvblR5cGUgPSByZWxhdGlvbi50eXBlLmdldCgpXG4gICAgZWxzZVxuICAgICAgcmVsYXRpb25UeXBlID0gcmVsYXRpb25cbiAgICBpZiAodHlwZW9mIHRoaXMuYXBwc1thcHBOYW1lXSAhPSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiB0aGlzLmFwcHNbXG4gICAgICAgIGFwcE5hbWVdW3JlbGF0aW9uVHlwZSArIFwiPlwiXSAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5hcHBzW2FwcE5hbWVdW3JlbGF0aW9uVHlwZSArIFwiPlwiXS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgcmVsYXRpb24gPSB0aGlzLmFwcHNbYXBwTmFtZV1bcmVsYXRpb25UeXBlICsgXCI+XCJdW2luZGV4XTtcbiAgICAgICAgbGV0IG5vZGVMaXN0MiA9IHJlbGF0aW9uLmdldE5vZGVMaXN0MigpXG4gICAgICAgIHJlcyA9IFV0aWxpdGllcy5jb25jYXQocmVzLCBub2RlTGlzdDIpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXNcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZyB8IFNwaW5hbEFwcGxpY2F0aW9ufSBhcHBOYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nIHwgU3BpbmFsUmVsYXRpb259IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyAgQSBwcm9taXNlIG9mIGFuIGFycmF5IG9mIE1vZGVsc1xuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYXN5bmMgZ2V0Q2hpbGRyZW5FbGVtZW50c0J5QXBwQnlSZWxhdGlvbihhcHAsIHJlbGF0aW9uKSB7XG4gICAgbGV0IGFwcE5hbWUgPSBcIlwiXG4gICAgbGV0IHJlbGF0aW9uVHlwZSA9IFwiXCJcbiAgICBsZXQgcmVzID0gW11cbiAgICBpZiAodHlwZW9mIGFwcCAhPSBcInN0cmluZ1wiKVxuICAgICAgYXBwTmFtZSA9IGFwcC5uYW1lLmdldCgpXG4gICAgZWxzZVxuICAgICAgYXBwTmFtZSA9IGFwcFxuICAgIGlmICh0eXBlb2YgcmVsYXRpb24gIT0gXCJzdHJpbmdcIilcbiAgICAgIHJlbGF0aW9uVHlwZSA9IHJlbGF0aW9uLnR5cGUuZ2V0KClcbiAgICBlbHNlXG4gICAgICByZWxhdGlvblR5cGUgPSByZWxhdGlvblxuICAgIGlmICh0eXBlb2YgdGhpcy5hcHBzW2FwcE5hbWVdICE9IFwidW5kZWZpbmVkXCIgJiYgdHlwZW9mIHRoaXMuYXBwc1tcbiAgICAgICAgYXBwTmFtZV1bcmVsYXRpb25UeXBlICsgXCI+XCJdICE9IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGxldCByZWxhdGlvblRtcCA9IHRoaXMuYXBwc1thcHBOYW1lXVtyZWxhdGlvblR5cGUgKyBcIj5cIl1cbiAgICAgIGxldCBub2RlTGlzdDIgPSByZWxhdGlvblRtcC5nZXROb2RlTGlzdDIoKVxuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IG5vZGVMaXN0Mi5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVMaXN0MltpbmRleF07XG4gICAgICAgIHJlcy5wdXNoKGF3YWl0IG5vZGUuZ2V0RWxlbWVudCgpKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzXG4gIH1cblxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBBIHByb21pc2Ugb2YgYW4gYXJyYXkgb2YgTW9kZWxzXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhc3luYyBnZXRDaGlsZHJlbkVsZW1lbnRzQnlSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlKSB7XG4gICAgbGV0IHJlcyA9IFtdXG4gICAgaWYgKHRoaXMucmVsYXRpb25zW3JlbGF0aW9uVHlwZSArIFwiPlwiXSlcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIj5cIl0ubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IHJlbGF0aW9uID0gdGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCI+XCJdW2luZGV4XTtcbiAgICAgICAgbGV0IG5vZGVMaXN0MiA9IHJlbGF0aW9uLmdldE5vZGVMaXN0MigpO1xuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgbm9kZUxpc3QyLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgIGNvbnN0IG5vZGUgPSBub2RlTGlzdDJbaW5kZXhdO1xuICAgICAgICAgIHJlcy5wdXNoKGF3YWl0IFV0aWxpdGllcy5wcm9taXNlTG9hZChub2RlLmVsZW1lbnQpKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgcmV0dXJuIHJlc1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgYXJyYXkgb2Ygc3BpbmFsTm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgZ2V0UGFyZW50c0J5UmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSkge1xuICAgIGxldCByZXMgPSBbXVxuICAgIGlmICh0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIjxcIl0pXG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCI8XCJdLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCByZWxhdGlvbiA9IHRoaXMucmVsYXRpb25zW3JlbGF0aW9uVHlwZSArIFwiPFwiXVtpbmRleF07XG4gICAgICAgIGxldCBub2RlTGlzdDEgPSByZWxhdGlvbi5nZXROb2RlTGlzdDEoKTtcbiAgICAgICAgcmVzID0gVXRpbGl0aWVzLmNvbmNhdChyZXMsIG5vZGVMaXN0MSlcbiAgICAgIH1cbiAgICByZXR1cm4gcmVzXG4gIH1cblxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbiB8IHN0cmluZ30gcmVsYXRpb25cbiAgICogQHBhcmFtIHtTcGluYWxBcHBsaWNhdGlvbiB8IHN0cmluZ30gYXBwIC0gb3B0aW9uYWxcbiAgICogQHBhcmFtIHtib29sZWFufSBpc0RpcmVjdGVkIC0gb3B0aW9uYWxcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIHJlbW92ZVJlbGF0aW9uKHJlbGF0aW9uLCBhcHAsIGlzRGlyZWN0ZWQpIHtcbiAgICBsZXQgcmVsYXRpb25UeXBlID0gXCJcIlxuICAgIGlmICh0eXBlb2YgcmVsYXRpb24gIT0gJ3N0cmluZycpXG4gICAgICByZWxhdGlvblR5cGUgPSByZWxhdGlvbi50eXBlLmdldCgpXG4gICAgZWxzZSByZWxhdGlvblR5cGUgPSByZWxhdGlvblxuXG4gICAgbGV0IGFwcE5hbWUgPSBcIlwiXG4gICAgaWYgKHR5cGVvZiBhcHAgIT0gJ3N0cmluZycpXG4gICAgICBhcHBOYW1lID0gYXBwLm5hbWUuZ2V0KClcbiAgICBlbHNlIGFwcE5hbWUgPSBhcHBcblxuICAgIGlmICh0eXBlb2YgaXNEaXJlY3RlZCAhPSBcInVuZGVmaW5lZFwiKVxuICAgICAgaWYgKGlzRGlyZWN0ZWQpXG4gICAgICAgIHJlbGF0aW9uVHlwZSA9IHJlbGF0aW9uVHlwZS5jb25jYXQoJzwnKVxuICAgIGVsc2VcbiAgICAgIHJlbGF0aW9uVHlwZSA9IHJlbGF0aW9uVHlwZS5jb25jYXQoJy0nKVxuICAgIGlmICh0eXBlb2YgdGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlXSAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBsZXQgcmVsYXRpb25Mc3QgPSB0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGVdO1xuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHJlbGF0aW9uTHN0Lmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCBjYW5kaWRhdGVSZWxhdGlvbiA9IHJlbGF0aW9uTHN0W2luZGV4XTtcbiAgICAgICAgaWYgKHJlbGF0aW9uLmlkLmdldCgpID09PSBjYW5kaWRhdGVSZWxhdGlvbi5pZC5nZXQoKSlcbiAgICAgICAgICByZWxhdGlvbkxzdC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy5oYXNBcHBEZWZpbmVkKGFwcE5hbWUpICYmXG4gICAgICB0eXBlb2YgdGhpcy5hcHBzW2FwcE5hbWVdW3JlbGF0aW9uVHlwZV0gIT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgbGV0IHJlbGF0aW9uTHN0ID0gdGhpcy5hcHBzW2FwcE5hbWVdW3JlbGF0aW9uVHlwZV07XG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcmVsYXRpb25Mc3QubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IGNhbmRpZGF0ZVJlbGF0aW9uID0gcmVsYXRpb25Mc3RbaW5kZXhdO1xuICAgICAgICBpZiAocmVsYXRpb24uaWQuZ2V0KCkgPT09IGNhbmRpZGF0ZVJlbGF0aW9uLmlkLmdldCgpKVxuICAgICAgICAgIHJlbGF0aW9uTHN0LnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuXG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb25bXX0gX3JlbGF0aW9uc1xuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgcmVtb3ZlUmVsYXRpb25zKF9yZWxhdGlvbnMpIHtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX3JlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHRoaXMucmVtb3ZlUmVsYXRpb24oX3JlbGF0aW9uc1tpbmRleF0pO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgcmVtb3ZlUmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHJlbGF0aW9uVHlwZSkgfHwgcmVsYXRpb25UeXBlIGluc3RhbmNlb2YgTHN0KVxuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHJlbGF0aW9uVHlwZS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgdHlwZSA9IHJlbGF0aW9uVHlwZVtpbmRleF07XG4gICAgICAgIHRoaXMucmVsYXRpb25zLnJlbV9hdHRyKHR5cGUpO1xuICAgICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5yZWxhdGlvbnMucmVtX2F0dHIocmVsYXRpb25UeXBlKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGhhc0FwcERlZmluZWQoYXBwTmFtZSkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5hcHBzW2FwcE5hbWVdICE9PSBcInVuZGVmaW5lZFwiKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICBlbHNlIHtcbiAgICAgIGNvbnNvbGUud2FybihcImFwcCBcIiArIGFwcE5hbWUgK1xuICAgICAgICBcIiBpcyBub3QgZGVmaW5lZCBmb3Igbm9kZSBcIiArIHRoaXMubmFtZS5nZXQoKSk7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgYm9vbGVhbiBcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGhhc1JlbGF0aW9uQnlBcHBCeVR5cGVEZWZpbmVkKGFwcE5hbWUsIHJlbGF0aW9uVHlwZSkge1xuICAgIGlmICh0aGlzLmhhc0FwcERlZmluZWQoYXBwTmFtZSkgJiYgdHlwZW9mIHRoaXMuYXBwc1thcHBOYW1lXVtcbiAgICAgICAgcmVsYXRpb25UeXBlXG4gICAgICBdICE9PVxuICAgICAgXCJ1bmRlZmluZWRcIiB8fCB0aGlzLmhhc0FwcERlZmluZWQoYXBwTmFtZSkgJiYgdHlwZW9mIHRoaXMuYXBwc1tcbiAgICAgICAgYXBwTmFtZV1bXG4gICAgICAgIHJlbGF0aW9uVHlwZSArIFwiLVwiXG4gICAgICBdICE9PVxuICAgICAgXCJ1bmRlZmluZWRcIiB8fCB0aGlzLmhhc0FwcERlZmluZWQoYXBwTmFtZSkgJiYgdHlwZW9mIHRoaXMuYXBwc1tcbiAgICAgICAgYXBwTmFtZV1bXG4gICAgICAgIHJlbGF0aW9uVHlwZSArIFwiPlwiXG4gICAgICBdICE9PVxuICAgICAgXCJ1bmRlZmluZWRcIiB8fCB0aGlzLmhhc0FwcERlZmluZWQoYXBwTmFtZSkgJiYgdHlwZW9mIHRoaXMuYXBwc1tcbiAgICAgICAgYXBwTmFtZV1bXG4gICAgICAgIHJlbGF0aW9uVHlwZSArIFwiPFwiXG4gICAgICBdICE9PVxuICAgICAgXCJ1bmRlZmluZWRcIilcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oXCJyZWxhdGlvbiBcIiArIHJlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGlzIG5vdCBkZWZpbmVkIGZvciBub2RlIFwiICsgdGhpcy5uYW1lLmdldCgpICtcbiAgICAgICAgXCIgZm9yIGFwcGxpY2F0aW9uIFwiICsgYXBwTmFtZSk7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEByZXR1cm5zIEEganNvbiByZXByZXNlbnRpbmcgdGhlIG5vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIHRvSnNvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IHRoaXMuaWQuZ2V0KCksXG4gICAgICBuYW1lOiB0aGlzLm5hbWUuZ2V0KCksXG4gICAgICBlbGVtZW50OiBudWxsXG4gICAgfTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgQSBqc29uIHJlcHJlc2VudGluZyB0aGUgbm9kZSB3aXRoIGl0cyByZWxhdGlvbnNcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIHRvSnNvbldpdGhSZWxhdGlvbnMoKSB7XG4gICAgbGV0IHJlbGF0aW9ucyA9IFtdO1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLmdldFJlbGF0aW9ucygpLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgcmVsYXRpb24gPSB0aGlzLmdldFJlbGF0aW9ucygpW2luZGV4XTtcbiAgICAgIHJlbGF0aW9ucy5wdXNoKHJlbGF0aW9uLnRvSnNvbigpKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiB0aGlzLmlkLmdldCgpLFxuICAgICAgbmFtZTogdGhpcy5uYW1lLmdldCgpLFxuICAgICAgZWxlbWVudDogbnVsbCxcbiAgICAgIHJlbGF0aW9uczogcmVsYXRpb25zXG4gICAgfTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgQW4gSUZDIGxpa2UgZm9ybWF0IHJlcHJlc2VudGluZyB0aGUgbm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYXN5bmMgdG9JZmMoKSB7XG4gICAgbGV0IGVsZW1lbnQgPSBhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQodGhpcy5lbGVtZW50KTtcbiAgICByZXR1cm4gZWxlbWVudC50b0lmYygpO1xuICB9XG59XG5leHBvcnQgZGVmYXVsdCBTcGluYWxOb2RlXG5zcGluYWxDb3JlLnJlZ2lzdGVyX21vZGVscyhbU3BpbmFsTm9kZV0pOyJdfQ==