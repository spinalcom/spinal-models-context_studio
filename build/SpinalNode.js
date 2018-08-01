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
    console.log("test");

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
        console.log(isDirected);

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
   * @param {string | SpinalRelation|[string]|[SpinalRelation]} relationType
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
    console.log(relationType);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TcGluYWxOb2RlLmpzIl0sIm5hbWVzIjpbInNwaW5hbENvcmUiLCJyZXF1aXJlIiwiZ2xvYmFsVHlwZSIsIndpbmRvdyIsImdsb2JhbCIsImdldFZpZXdlciIsInYiLCJTcGluYWxOb2RlIiwiTW9kZWwiLCJjb25zdHJ1Y3RvciIsIl9uYW1lIiwiZWxlbWVudCIsInJlbGF0ZWRHcmFwaCIsInJlbGF0aW9ucyIsIm5hbWUiLCJGaWxlU3lzdGVtIiwiX3NpZ19zZXJ2ZXIiLCJhZGRfYXR0ciIsImlkIiwiVXRpbGl0aWVzIiwiZ3VpZCIsIlB0ciIsImFwcHMiLCJjbGFzc2lmeU5vZGUiLCJBcnJheSIsImlzQXJyYXkiLCJMc3QiLCJhZGRSZWxhdGlvbnMiLCJhZGRSZWxhdGlvbiIsImFkZFR5cGUiLCJhcHBOYW1lIiwidHlwZSIsImdldEFwcHNOYW1lcyIsIl9hdHRyaWJ1dGVfbmFtZXMiLCJnZXRFbGVtZW50IiwicHJvbWlzZUxvYWQiLCJnZXRBcHBzIiwicmVzIiwiaW5kZXgiLCJsZW5ndGgiLCJwdXNoIiwiYXBwc0xpc3QiLCJoYXNSZWxhdGlvbiIsImFkZERpcmVjdGVkUmVsYXRpb25QYXJlbnQiLCJyZWxhdGlvbiIsImdldCIsImNvbmNhdCIsImFkZFJlbGF0aW9uQnlBcHAiLCJhZGREaXJlY3RlZFJlbGF0aW9uQ2hpbGQiLCJhZGROb25EaXJlY3RlZFJlbGF0aW9uIiwiaXNSZXNlcnZlZCIsIm5hbWVUbXAiLCJsaXN0IiwiY29uc29sZSIsImxvZyIsInJlc2VydmVkUmVsYXRpb25zTmFtZXMiLCJoYXNSZXNlcnZhdGlvbkNyZWRlbnRpYWxzIiwiY29udGFpbnNBcHAiLCJyZWxhdGlvbkxpc3QiLCJhcHAiLCJlcnJvciIsImFkZFNpbXBsZVJlbGF0aW9uIiwicmVsYXRpb25UeXBlIiwiaXNEaXJlY3RlZCIsIm5vZGUyIiwiYWRkTm9kZSIsIm5vZGUiLCJyZWwiLCJTcGluYWxSZWxhdGlvbiIsImFkZFNpbXBsZVJlbGF0aW9uQnlBcHAiLCJhc05vZGUiLCJhZGRUb0V4aXN0aW5nUmVsYXRpb24iLCJhc1BhcmVudCIsImV4aXN0aW5nUmVsYXRpb25zIiwiZ2V0UmVsYXRpb25zIiwiaXNQYXJlbnQiLCJhZGROb2RldG9Ob2RlTGlzdDEiLCJhZGROb2RldG9Ob2RlTGlzdDIiLCJhZGRUb0V4aXN0aW5nUmVsYXRpb25CeUFwcCIsImFwcFJlbGF0aW9ucyIsImdldFJlbGF0aW9uc0J5QXBwTmFtZSIsInJlbW92ZUZyb21FeGlzdGluZ1JlbGF0aW9uQnlBcHAiLCJnZXRSZWxhdGlvbnNCeUFwcE5hbWVCeVR5cGUiLCJyZW1vdmVGcm9tTm9kZUxpc3QyIiwicmVtb3ZlUmVsYXRpb24iLCJfY2xhc3NpZnlSZWxhdGlvbiIsIl9yZWxhdGlvbiIsImxvYWQiLCJyZWxMaXN0IiwiaiIsImkiLCJnZXRSZWxhdGlvbnNCeVR5cGUiLCJpbmNsdWRlcyIsInQxIiwidDIiLCJ0MyIsImhhc0FwcERlZmluZWQiLCJhcHBSZWxhdGlvbkxpc3QiLCJnZXRSZWxhdGlvbnNCeUFwcCIsImhhc1JlbGF0aW9uQnlBcHBCeVR5cGVEZWZpbmVkIiwiZ2V0UmVsYXRpb25zQnlBcHBCeVR5cGUiLCJpbk5vZGVMaXN0IiwiX25vZGVsaXN0IiwiZ2V0TmVpZ2hib3JzIiwibmVpZ2hib3JzIiwibm9kZUxpc3QxIiwibm9kZUxpc3QyIiwiYWxsQnV0TWVCeUlkIiwiZ2V0Q2hpbGRyZW5CeUFwcCIsImhhc0NoaWxkcmVuIiwiZ2V0Q2hpbGRyZW5CeUFwcEJ5UmVsYXRpb24iLCJwcm9wIiwicmVsYXRpb25Mc3QiLCJyZWxhdGlvbnNOYW1lIiwiZ2V0Q2hpbGRyZW5CeVJlbGF0aW9uVHlwZSIsImdldE5vZGVMaXN0MiIsImdldE5vZGVMaXN0MSIsImNvbnRhaW5zTHN0QnlJZCIsImdldENoaWxkcmVuRWxlbWVudHNCeUFwcEJ5UmVsYXRpb24iLCJyZWxhdGlvblRtcCIsImdldENoaWxkcmVuRWxlbWVudHNCeVJlbGF0aW9uVHlwZSIsImdldFBhcmVudHNCeVJlbGF0aW9uVHlwZSIsImNhbmRpZGF0ZVJlbGF0aW9uIiwic3BsaWNlIiwicmVtb3ZlUmVsYXRpb25zIiwiX3JlbGF0aW9ucyIsInJlbW92ZVJlbGF0aW9uVHlwZSIsInJlbV9hdHRyIiwid2FybiIsInRvSnNvbiIsInRvSnNvbldpdGhSZWxhdGlvbnMiLCJ0b0lmYyIsInJlZ2lzdGVyX21vZGVscyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBRUE7Ozs7QUFLQTs7OztBQVBBLE1BQU1BLGFBQWFDLFFBQVEseUJBQVIsQ0FBbkI7QUFDQSxNQUFNQyxhQUFhLE9BQU9DLE1BQVAsS0FBa0IsV0FBbEIsR0FBZ0NDLE1BQWhDLEdBQXlDRCxNQUE1RDs7QUFFQSxJQUFJRSxZQUFZLFlBQVc7QUFDekIsU0FBT0gsV0FBV0ksQ0FBbEI7QUFDRCxDQUZEOztBQU9BOzs7Ozs7O0FBT0EsTUFBTUMsVUFBTixTQUF5QkwsV0FBV00sS0FBcEMsQ0FBMEM7QUFDeEM7Ozs7Ozs7OztBQVNBQyxjQUFZQyxLQUFaLEVBQW1CQyxPQUFuQixFQUE0QkMsWUFBNUIsRUFBMENDLFNBQTFDLEVBQXFEQyxPQUFPLFlBQTVELEVBQTBFO0FBQ3hFO0FBQ0EsUUFBSUMsV0FBV0MsV0FBZixFQUE0QjtBQUMxQixXQUFLQyxRQUFMLENBQWM7QUFDWkMsWUFBSUMscUJBQVVDLElBQVYsQ0FBZSxLQUFLWCxXQUFMLENBQWlCSyxJQUFoQyxDQURRO0FBRVpBLGNBQU1KLEtBRk07QUFHWkMsaUJBQVMsSUFBSVUsR0FBSixDQUFRVixPQUFSLENBSEc7QUFJWkUsbUJBQVcsSUFBSUwsS0FBSixFQUpDO0FBS1pjLGNBQU0sSUFBSWQsS0FBSixFQUxNO0FBTVpJLHNCQUFjQTtBQU5GLE9BQWQ7QUFRQSxVQUFJLE9BQU8sS0FBS0EsWUFBWixLQUE2QixXQUFqQyxFQUE4QztBQUM1QyxhQUFLQSxZQUFMLENBQWtCVyxZQUFsQixDQUErQixJQUEvQjtBQUNEO0FBQ0QsVUFBSSxPQUFPVixTQUFQLEtBQXFCLFdBQXpCLEVBQXNDO0FBQ3BDLFlBQUlXLE1BQU1DLE9BQU4sQ0FBY1osU0FB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O0FBQ0EsV0FBT0EsUUFBUXdILEtBQVIsRUFBUDtBQUNEO0FBdm9DdUM7a0JBeW9DM0I1SCxVOztBQUNmUCxXQUFXb0ksZUFBWCxDQUEyQixDQUFDN0gsVUFBRCxDQUEzQiIsImZpbGUiOiJTcGluYWxOb2RlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3Qgc3BpbmFsQ29yZSA9IHJlcXVpcmUoXCJzcGluYWwtY29yZS1jb25uZWN0b3Jqc1wiKTtcbmNvbnN0IGdsb2JhbFR5cGUgPSB0eXBlb2Ygd2luZG93ID09PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogd2luZG93O1xuaW1wb3J0IFNwaW5hbFJlbGF0aW9uIGZyb20gXCIuL1NwaW5hbFJlbGF0aW9uXCI7XG5sZXQgZ2V0Vmlld2VyID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBnbG9iYWxUeXBlLnY7XG59O1xuXG5pbXBvcnQge1xuICBVdGlsaXRpZXNcbn0gZnJvbSBcIi4vVXRpbGl0aWVzXCI7XG4vKipcbiAqXG4gKlxuICogQGV4cG9ydFxuICogQGNsYXNzIFNwaW5hbE5vZGVcbiAqIEBleHRlbmRzIHtNb2RlbH1cbiAqL1xuY2xhc3MgU3BpbmFsTm9kZSBleHRlbmRzIGdsb2JhbFR5cGUuTW9kZWwge1xuICAvKipcbiAgICpDcmVhdGVzIGFuIGluc3RhbmNlIG9mIFNwaW5hbE5vZGUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIEBwYXJhbSB7TW9kZWx9IGVsZW1lbnQgLSBhbnkgc3ViY2xhc3Mgb2YgTW9kZWxcbiAgICogQHBhcmFtIHtTcGluYWxHcmFwaH0gcmVsYXRlZEdyYXBoXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb25bXX0gcmVsYXRpb25zXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbbmFtZT1cIlNwaW5hbE5vZGVcIl1cbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGNvbnN0cnVjdG9yKF9uYW1lLCBlbGVtZW50LCByZWxhdGVkR3JhcGgsIHJlbGF0aW9ucywgbmFtZSA9IFwiU3BpbmFsTm9kZVwiKSB7XG4gICAgc3VwZXIoKTtcbiAgICBpZiAoRmlsZVN5c3RlbS5fc2lnX3NlcnZlcikge1xuICAgICAgdGhpcy5hZGRfYXR0cih7XG4gICAgICAgIGlkOiBVdGlsaXRpZXMuZ3VpZCh0aGlzLmNvbnN0cnVjdG9yLm5hbWUpLFxuICAgICAgICBuYW1lOiBfbmFtZSxcbiAgICAgICAgZWxlbWVudDogbmV3IFB0cihlbGVtZW50KSxcbiAgICAgICAgcmVsYXRpb25zOiBuZXcgTW9kZWwoKSxcbiAgICAgICAgYXBwczogbmV3IE1vZGVsKCksXG4gICAgICAgIHJlbGF0ZWRHcmFwaDogcmVsYXRlZEdyYXBoXG4gICAgICB9KTtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5yZWxhdGVkR3JhcGggIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgdGhpcy5yZWxhdGVkR3JhcGguY2xhc3NpZnlOb2RlKHRoaXMpO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiByZWxhdGlvbnMgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocmVsYXRpb25zKSB8fCByZWxhdGlvbnMgaW5zdGFuY2VvZiBMc3QpXG4gICAgICAgICAgdGhpcy5hZGRSZWxhdGlvbnMocmVsYXRpb25zKTtcbiAgICAgICAgZWxzZSB0aGlzLmFkZFJlbGF0aW9uKHJlbGF0aW9ucyk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYWRkVHlwZShhcHBOYW1lLCB0eXBlKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnR5cGUgPT09IFwidW5kZWZpbmVkXCIpXG4gICAgICB0aGlzLmFkZF9hdHRyKHtcbiAgICAgICAgdHlwZTogbmV3IE1vZGVsKClcbiAgICAgIH0pXG4gICAgdGhpcy50eXBlLmFkZF9hdHRyKHtcbiAgICAgIFthcHBOYW1lXTogdHlwZVxuICAgIH0pXG4gIH1cblxuICAvLyByZWdpc3RlckFwcChhcHApIHtcbiAgLy8gICB0aGlzLmFwcHMuYWRkX2F0dHIoe1xuICAvLyAgICAgW2FwcC5uYW1lLmdldCgpXTogbmV3IFB0cihhcHApXG4gIC8vICAgfSlcbiAgLy8gfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgYWxsIGFwcGxpY2F0aW9ucyBuYW1lcyBhcyBzdHJpbmdcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGdldEFwcHNOYW1lcygpIHtcbiAgICByZXR1cm4gdGhpcy5hcHBzLl9hdHRyaWJ1dGVfbmFtZXM7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSBvZiB0aGUgcmVsYXRlZCBFbGVtZW50IFxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYXN5bmMgZ2V0RWxlbWVudCgpIHtcbiAgICByZXR1cm4gYXdhaXQgVXRpbGl0aWVzLnByb21pc2VMb2FkKHRoaXMuZWxlbWVudClcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgYWxsIGFwcGxpY2F0aW9uc1xuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYXN5bmMgZ2V0QXBwcygpIHtcbiAgICBsZXQgcmVzID0gW11cbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5hcHBzLl9hdHRyaWJ1dGVfbmFtZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCBhcHBOYW1lID0gdGhpcy5hcHBzLl9hdHRyaWJ1dGVfbmFtZXNbaW5kZXhdO1xuICAgICAgcmVzLnB1c2goYXdhaXQgVXRpbGl0aWVzLnByb21pc2VMb2FkKHRoaXMucmVsYXRlZEdyYXBoLmFwcHNMaXN0W1xuICAgICAgICBhcHBOYW1lXSkpXG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbiAgLy8gLyoqXG4gIC8vICAqXG4gIC8vICAqXG4gIC8vICAqIEBwYXJhbSB7Kn0gcmVsYXRpb25UeXBlXG4gIC8vICAqIEBwYXJhbSB7Kn0gcmVsYXRpb25cbiAgLy8gICogQHBhcmFtIHsqfSBhc1BhcmVudFxuICAvLyAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAvLyAgKi9cbiAgLy8gY2hhbmdlRGVmYXVsdFJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgcmVsYXRpb24sIGFzUGFyZW50KSB7XG4gIC8vICAgICBpZiAocmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKSkge1xuICAvLyAgICAgICBpZiAoYXNQYXJlbnQpIHtcbiAgLy8gICAgICAgICBVdGlsaXRpZXMucHV0T25Ub3BMc3QodGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCI+XCJdLCByZWxhdGlvbik7XG4gIC8vICAgICAgIH0gZWxzZSB7XG4gIC8vICAgICAgICAgVXRpbGl0aWVzLnB1dE9uVG9wTHN0KHRoaXMucmVsYXRpb25zW3JlbGF0aW9uVHlwZSArIFwiPFwiXSwgcmVsYXRpb24pO1xuICAvLyAgICAgICB9XG4gIC8vICAgICB9IGVsc2Uge1xuICAvLyAgICAgICBVdGlsaXRpZXMucHV0T25Ub3BMc3QodGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCItXCJdLCByZWxhdGlvbik7XG4gIC8vICAgICB9XG4gIC8vICAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgYm9vbGVhblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgaGFzUmVsYXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucmVsYXRpb25zLmxlbmd0aCAhPT0gMDtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbn0gcmVsYXRpb25cbiAgICogQHBhcmFtIHtzdHJpbmd9IGFwcE5hbWVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGFkZERpcmVjdGVkUmVsYXRpb25QYXJlbnQocmVsYXRpb24sIGFwcE5hbWUpIHtcbiAgICBsZXQgbmFtZSA9IHJlbGF0aW9uLnR5cGUuZ2V0KCk7XG4gICAgbmFtZSA9IG5hbWUuY29uY2F0KFwiPlwiKTtcbiAgICBpZiAodHlwZW9mIGFwcE5hbWUgPT09IFwidW5kZWZpbmVkXCIpIHRoaXMuYWRkUmVsYXRpb24ocmVsYXRpb24sIG5hbWUpO1xuICAgIGVsc2UgdGhpcy5hZGRSZWxhdGlvbkJ5QXBwKHJlbGF0aW9uLCBuYW1lLCBhcHBOYW1lKTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbn0gcmVsYXRpb25cbiAgICogQHBhcmFtIHtzdHJpbmd9IGFwcE5hbWVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGFkZERpcmVjdGVkUmVsYXRpb25DaGlsZChyZWxhdGlvbiwgYXBwTmFtZSkge1xuICAgIGxldCBuYW1lID0gcmVsYXRpb24udHlwZS5nZXQoKTtcbiAgICBuYW1lID0gbmFtZS5jb25jYXQoXCI8XCIpO1xuICAgIGlmICh0eXBlb2YgYXBwTmFtZSA9PT0gXCJ1bmRlZmluZWRcIikgdGhpcy5hZGRSZWxhdGlvbihyZWxhdGlvbiwgbmFtZSk7XG4gICAgZWxzZSB0aGlzLmFkZFJlbGF0aW9uQnlBcHAocmVsYXRpb24sIG5hbWUsIGFwcE5hbWUpO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9ufSByZWxhdGlvblxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYWRkTm9uRGlyZWN0ZWRSZWxhdGlvbihyZWxhdGlvbiwgYXBwTmFtZSkge1xuICAgIGxldCBuYW1lID0gcmVsYXRpb24udHlwZS5nZXQoKTtcbiAgICBuYW1lID0gbmFtZS5jb25jYXQoXCItXCIpO1xuICAgIGlmICh0eXBlb2YgYXBwTmFtZSA9PT0gXCJ1bmRlZmluZWRcIikgdGhpcy5hZGRSZWxhdGlvbihyZWxhdGlvbiwgbmFtZSk7XG4gICAgZWxzZSB0aGlzLmFkZFJlbGF0aW9uQnlBcHAocmVsYXRpb24sIG5hbWUsIGFwcE5hbWUpO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9ufSByZWxhdGlvblxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYWRkUmVsYXRpb24ocmVsYXRpb24sIG5hbWUpIHtcbiAgICBpZiAoIXRoaXMucmVsYXRlZEdyYXBoLmlzUmVzZXJ2ZWQocmVsYXRpb24udHlwZS5nZXQoKSkpIHtcbiAgICAgIGxldCBuYW1lVG1wID0gcmVsYXRpb24udHlwZS5nZXQoKTtcbiAgICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBuYW1lVG1wID0gbmFtZTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgdGhpcy5yZWxhdGlvbnNbbmFtZVRtcF0gIT09IFwidW5kZWZpbmVkXCIpXG4gICAgICAgIHRoaXMucmVsYXRpb25zW25hbWVUbXBdLnB1c2gocmVsYXRpb24pO1xuICAgICAgZWxzZSB7XG4gICAgICAgIGxldCBsaXN0ID0gbmV3IExzdCgpO1xuICAgICAgICBsaXN0LnB1c2gocmVsYXRpb24pO1xuICAgICAgICB0aGlzLnJlbGF0aW9ucy5hZGRfYXR0cih7XG4gICAgICAgICAgW25hbWVUbXBdOiBsaXN0XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb24udHlwZS5nZXQoKSArXG4gICAgICAgIFwiIGlzIHJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5yZWxhdGVkR3JhcGgucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvbi50eXBlLmdldCgpXVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb259IHJlbGF0aW9uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC1yZWxhdGlvbiBOYW1lIGlmIG5vdCBvcmdpbmFsbHkgZGVmaW5lZFxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYWRkUmVsYXRpb25CeUFwcChyZWxhdGlvbiwgbmFtZSwgYXBwTmFtZSkge1xuICAgIGNvbnNvbGUubG9nKFwidGVzdFwiKTtcblxuICAgIGlmICh0aGlzLnJlbGF0ZWRHcmFwaC5oYXNSZXNlcnZhdGlvbkNyZWRlbnRpYWxzKHJlbGF0aW9uLnR5cGUuZ2V0KCksXG4gICAgICAgIGFwcE5hbWUpKSB7XG4gICAgICBpZiAodGhpcy5yZWxhdGVkR3JhcGguY29udGFpbnNBcHAoYXBwTmFtZSkpIHtcbiAgICAgICAgbGV0IG5hbWVUbXAgPSByZWxhdGlvbi50eXBlLmdldCgpO1xuICAgICAgICBpZiAodHlwZW9mIG5hbWUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBuYW1lVG1wID0gbmFtZTtcbiAgICAgICAgICAvLyByZWxhdGlvbi5uYW1lLnNldChuYW1lVG1wKVxuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5yZWxhdGlvbnNbbmFtZVRtcF0gIT09IFwidW5kZWZpbmVkXCIpXG4gICAgICAgICAgdGhpcy5yZWxhdGlvbnNbbmFtZVRtcF0ucHVzaChyZWxhdGlvbik7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGxldCBsaXN0ID0gbmV3IExzdCgpO1xuICAgICAgICAgIGxpc3QucHVzaChyZWxhdGlvbik7XG4gICAgICAgICAgdGhpcy5yZWxhdGlvbnMuYWRkX2F0dHIoe1xuICAgICAgICAgICAgW25hbWVUbXBdOiBsaXN0XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmFwcHNbYXBwTmFtZV0gIT09IFwidW5kZWZpbmVkXCIgJiYgdHlwZW9mIHRoaXMuYXBwc1tcbiAgICAgICAgICAgIGFwcE5hbWVdW25hbWVUbXBdICE9PSBcInVuZGVmaW5lZFwiKVxuICAgICAgICAgIHRoaXMuYXBwc1thcHBOYW1lXVtuYW1lVG1wXS5wdXNoKHJlbGF0aW9uKVxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgdGhpcy5hcHBzW2FwcE5hbWVdICE9PSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiB0aGlzXG4gICAgICAgICAgLmFwcHNbXG4gICAgICAgICAgICBhcHBOYW1lXVtuYW1lVG1wXSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgIGxldCByZWxhdGlvbkxpc3QgPSBuZXcgTHN0KClcbiAgICAgICAgICByZWxhdGlvbkxpc3QucHVzaChyZWxhdGlvbilcbiAgICAgICAgICB0aGlzLmFwcHNbYXBwTmFtZV0uYWRkX2F0dHIoe1xuICAgICAgICAgICAgW25hbWVUbXBdOiByZWxhdGlvbkxpc3RcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsZXQgYXBwID0gbmV3IE1vZGVsKCk7XG4gICAgICAgICAgbGV0IHJlbGF0aW9uTGlzdCA9IG5ldyBMc3QoKVxuICAgICAgICAgIHJlbGF0aW9uTGlzdC5wdXNoKHJlbGF0aW9uKVxuICAgICAgICAgIGFwcC5hZGRfYXR0cih7XG4gICAgICAgICAgICBbbmFtZVRtcF06IHJlbGF0aW9uTGlzdFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMuYXBwcy5hZGRfYXR0cih7XG4gICAgICAgICAgICBbYXBwTmFtZV06IGFwcFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKGFwcE5hbWUgKyBcIiBkb2VzIG5vdCBleGlzdFwiKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIHJlbGF0aW9uLnR5cGUuZ2V0KCkgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVsYXRlZEdyYXBoLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb24udHlwZS5nZXQoKV1cbiAgICAgICk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEBwYXJhbSB7TW9kZWx9IGVsZW1lbnQgLSBhbmQgc3ViY2xhc3Mgb2YgTW9kZWxcbiAgICogQHBhcmFtIHtib29sZWFufSBbaXNEaXJlY3RlZD1mYWxzZV1cbiAgICogQHJldHVybnMgdGhlIGNyZWF0ZWQgcmVsYXRpb24sIHVuZGVmaW5lZCBvdGhlcndpc2VcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGFkZFNpbXBsZVJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgZWxlbWVudCwgaXNEaXJlY3RlZCA9IGZhbHNlKSB7XG4gICAgaWYgKCF0aGlzLnJlbGF0ZWRHcmFwaC5pc1Jlc2VydmVkKHJlbGF0aW9uVHlwZSkpIHtcbiAgICAgIGxldCByZXMgPSB7fVxuICAgICAgbGV0IG5vZGUyID0gdGhpcy5yZWxhdGVkR3JhcGguYWRkTm9kZShlbGVtZW50KTtcbiAgICAgIHJlcy5ub2RlID0gbm9kZTJcbiAgICAgIGxldCByZWwgPSBuZXcgU3BpbmFsUmVsYXRpb24ocmVsYXRpb25UeXBlLCBbdGhpc10sIFtub2RlMl0sXG4gICAgICAgIGlzRGlyZWN0ZWQpO1xuICAgICAgcmVzLnJlbGF0aW9uID0gcmVsXG4gICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5hZGRSZWxhdGlvbihyZWwpO1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIHJlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGlzIHJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5yZWxhdGVkR3JhcGgucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvblR5cGVdXG4gICAgICApO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFwcE5hbWVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcGFyYW0ge01vZGVsIHxTcGluYWxOb2RlfSBlbGVtZW50XG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGlyZWN0ZWQ9ZmFsc2VdXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2FzTm9kZT1mYWxzZV0gLSB0byBwdXQgYSBTcGluYWxOb2RlIGluc2lkZSBhIFNwaW5hbE5vZGVcbiAgICogQHJldHVybnMgdGhlIGNyZWF0ZWQgcmVsYXRpb25cbiAgICogXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhZGRTaW1wbGVSZWxhdGlvbkJ5QXBwKGFwcE5hbWUsIHJlbGF0aW9uVHlwZSwgZWxlbWVudCwgaXNEaXJlY3RlZCA9IGZhbHNlLFxuICAgIGFzTm9kZSA9IGZhbHNlKSB7XG4gICAgaWYgKHRoaXMucmVsYXRlZEdyYXBoLmhhc1Jlc2VydmF0aW9uQ3JlZGVudGlhbHMocmVsYXRpb25UeXBlLCBhcHBOYW1lKSkge1xuICAgICAgaWYgKHRoaXMucmVsYXRlZEdyYXBoLmNvbnRhaW5zQXBwKGFwcE5hbWUpKSB7XG4gICAgICAgIGxldCByZXMgPSB7fVxuICAgICAgICBsZXQgbm9kZTIgPSBlbGVtZW50XG4gICAgICAgIGlmIChhc05vZGUgfHwgZWxlbWVudC5jb25zdHJ1Y3Rvci5uYW1lICE9IFwiU3BpbmFsTm9kZVwiKVxuICAgICAgICAgIG5vZGUyID0gdGhpcy5yZWxhdGVkR3JhcGguYWRkTm9kZShlbGVtZW50KTtcbiAgICAgICAgcmVzLm5vZGUgPSBub2RlMlxuICAgICAgICBsZXQgcmVsID0gbmV3IFNwaW5hbFJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgW3RoaXNdLCBbbm9kZTJdLFxuICAgICAgICAgIGlzRGlyZWN0ZWQpO1xuICAgICAgICByZXMucmVsYXRpb24gPSByZWxcbiAgICAgICAgdGhpcy5yZWxhdGVkR3JhcGguYWRkUmVsYXRpb24ocmVsLCBhcHBOYW1lKTtcbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYXBwTmFtZSArIFwiIGRvZXMgbm90IGV4aXN0XCIpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uVHlwZV1cbiAgICAgICk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEBwYXJhbSB7TW9kZWx9IGVsZW1lbnQgLSBhbnkgc3ViY2xhc3Mgb2YgTW9kZWxcbiAgICogQHBhcmFtIHtib29sZWFufSBbaXNEaXJlY3RlZD1mYWxzZV1cbiAgICogQHBhcmFtIHtib29sZWFufSBbYXNQYXJlbnQ9ZmFsc2VdXG4gICAqIEByZXR1cm5zIGFuIE9iamVjdCBvZiAxKXJlbGF0aW9uOnRoZSByZWxhdGlvbiB3aXRoIHRoZSBhZGRlZCBlbGVtZW50IG5vZGUgaW4gKG5vZGVMaXN0MiksIDIpbm9kZTogdGhlIGNyZWF0ZWQgbm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYWRkVG9FeGlzdGluZ1JlbGF0aW9uKFxuICAgIHJlbGF0aW9uVHlwZSxcbiAgICBlbGVtZW50LFxuICAgIGlzRGlyZWN0ZWQgPSBmYWxzZSxcbiAgICBhc1BhcmVudCA9IGZhbHNlXG4gICkge1xuICAgIGxldCByZXMgPSB7fVxuICAgIGlmICghdGhpcy5yZWxhdGVkR3JhcGguaXNSZXNlcnZlZChyZWxhdGlvblR5cGUpKSB7XG4gICAgICBsZXQgZXhpc3RpbmdSZWxhdGlvbnMgPSB0aGlzLmdldFJlbGF0aW9ucygpO1xuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGV4aXN0aW5nUmVsYXRpb25zLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCByZWxhdGlvbiA9IGV4aXN0aW5nUmVsYXRpb25zW2luZGV4XTtcbiAgICAgICAgcmVzLnJlbGF0aW9uID0gcmVsYXRpb25cbiAgICAgICAgaWYgKFxuICAgICAgICAgIHJlbGF0aW9uVHlwZSA9PT0gcmVsYXRpb25UeXBlICYmXG4gICAgICAgICAgaXNEaXJlY3RlZCA9PT0gcmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKVxuICAgICAgICApIHtcbiAgICAgICAgICBpZiAoaXNEaXJlY3RlZCAmJiB0aGlzLmlzUGFyZW50KHJlbGF0aW9uKSkge1xuICAgICAgICAgICAgbm9kZTIgPSB0aGlzLnJlbGF0ZWRHcmFwaC5hZGROb2RlKGVsZW1lbnQpO1xuICAgICAgICAgICAgcmVzLm5vZGUgPSBub2RlMjtcbiAgICAgICAgICAgIGlmIChhc1BhcmVudCkge1xuICAgICAgICAgICAgICByZWxhdGlvbi5hZGROb2RldG9Ob2RlTGlzdDEobm9kZTIpO1xuICAgICAgICAgICAgICBub2RlMi5hZGREaXJlY3RlZFJlbGF0aW9uUGFyZW50KHJlbGF0aW9uKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlbGF0aW9uLmFkZE5vZGV0b05vZGVMaXN0Mihub2RlMik7XG4gICAgICAgICAgICAgIG5vZGUyLmFkZERpcmVjdGVkUmVsYXRpb25DaGlsZChyZWxhdGlvbik7XG4gICAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmICghaXNEaXJlY3RlZCkge1xuICAgICAgICAgICAgbm9kZTIgPSB0aGlzLnJlbGF0ZWRHcmFwaC5hZGROb2RlKGVsZW1lbnQpO1xuICAgICAgICAgICAgcmVzLm5vZGUgPSBub2RlMjtcbiAgICAgICAgICAgIHJlbGF0aW9uLmFkZE5vZGV0b05vZGVMaXN0Mihub2RlMik7XG4gICAgICAgICAgICBub2RlMi5hZGROb25EaXJlY3RlZFJlbGF0aW9uKHJlbGF0aW9uKTtcbiAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5hZGRTaW1wbGVSZWxhdGlvbihyZWxhdGlvblR5cGUsIGVsZW1lbnQsIGlzRGlyZWN0ZWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uVHlwZV1cbiAgICAgICk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEBwYXJhbSB7TW9kZWx8IFNwaW5hbE5vZGV9IGVsZW1lbnQgLSBNb2RlbDphbnkgc3ViY2xhc3Mgb2YgTW9kZWxcbiAgICogQHBhcmFtIHtib29sZWFufSBbaXNEaXJlY3RlZD1mYWxzZV1cbiAgICogQHBhcmFtIHtib29sZWFufSBbYXNQYXJlbnQ9ZmFsc2VdXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2FzTm9kZT1mYWxzZV0gLSB0byBwdXQgYSBTcGluYWxOb2RlIGluc2lkZSBhIFNwaW5hbE5vZGVcbiAgICogQHJldHVybnMgYW4gT2JqZWN0IG9mIDEpcmVsYXRpb246dGhlIHJlbGF0aW9uIHdpdGggdGhlIGFkZGVkIGVsZW1lbnQgbm9kZSBpbiAobm9kZUxpc3QyKSwgMilub2RlOiB0aGUgY3JlYXRlZCBub2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhZGRUb0V4aXN0aW5nUmVsYXRpb25CeUFwcChcbiAgICBhcHBOYW1lLFxuICAgIHJlbGF0aW9uVHlwZSxcbiAgICBlbGVtZW50LFxuICAgIGlzRGlyZWN0ZWQgPSBmYWxzZSxcbiAgICBhc1BhcmVudCA9IGZhbHNlLFxuICAgIGFzTm9kZSA9IGZhbHNlXG4gICkge1xuICAgIGxldCByZXMgPSB7fVxuICAgIGxldCBub2RlMiA9IGVsZW1lbnQ7IC8vaW5pdGlhbGl6ZVxuICAgIGlmICh0aGlzLnJlbGF0ZWRHcmFwaC5oYXNSZXNlcnZhdGlvbkNyZWRlbnRpYWxzKHJlbGF0aW9uVHlwZSwgYXBwTmFtZSkpIHtcbiAgICAgIGlmICh0aGlzLnJlbGF0ZWRHcmFwaC5jb250YWluc0FwcChhcHBOYW1lKSkge1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMuYXBwc1thcHBOYW1lXSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgIGxldCBhcHBSZWxhdGlvbnMgPSB0aGlzLmdldFJlbGF0aW9uc0J5QXBwTmFtZShhcHBOYW1lKTtcbiAgICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgYXBwUmVsYXRpb25zLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgY29uc3QgcmVsYXRpb24gPSBhcHBSZWxhdGlvbnNbaW5kZXhdO1xuICAgICAgICAgICAgcmVzLnJlbGF0aW9uID0gcmVsYXRpb25cbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgcmVsYXRpb24udHlwZS5nZXQoKSA9PT0gcmVsYXRpb25UeXBlICYmXG4gICAgICAgICAgICAgIGlzRGlyZWN0ZWQgPT09IHJlbGF0aW9uLmlzRGlyZWN0ZWQuZ2V0KClcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICBpZiAoaXNEaXJlY3RlZCAmJiB0aGlzLmlzUGFyZW50KHJlbGF0aW9uKSkge1xuICAgICAgICAgICAgICAgIGlmIChhc05vZGUgfHwgZWxlbWVudC5jb25zdHJ1Y3Rvci5uYW1lICE9IFwiU3BpbmFsTm9kZVwiKVxuICAgICAgICAgICAgICAgICAgbm9kZTIgPSB0aGlzLnJlbGF0ZWRHcmFwaC5hZGROb2RlKGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIHJlcy5ub2RlID0gbm9kZTI7XG4gICAgICAgICAgICAgICAgaWYgKGFzUGFyZW50KSB7XG4gICAgICAgICAgICAgICAgICByZWxhdGlvbi5hZGROb2RldG9Ob2RlTGlzdDEobm9kZTIpO1xuICAgICAgICAgICAgICAgICAgbm9kZTIuYWRkRGlyZWN0ZWRSZWxhdGlvblBhcmVudChyZWxhdGlvbiwgYXBwTmFtZSk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICByZWxhdGlvbi5hZGROb2RldG9Ob2RlTGlzdDIobm9kZTIpO1xuICAgICAgICAgICAgICAgICAgbm9kZTIuYWRkRGlyZWN0ZWRSZWxhdGlvbkNoaWxkKHJlbGF0aW9uLCBhcHBOYW1lKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFpc0RpcmVjdGVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFzTm9kZSB8fCBlbGVtZW50LmNvbnN0cnVjdG9yLm5hbWUgIT0gXCJTcGluYWxOb2RlXCIpXG4gICAgICAgICAgICAgICAgICBub2RlMiA9IHRoaXMucmVsYXRlZEdyYXBoLmFkZE5vZGUoZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgcmVzLm5vZGUgPSBub2RlMjtcbiAgICAgICAgICAgICAgICByZWxhdGlvbi5hZGROb2RldG9Ob2RlTGlzdDIobm9kZTIpO1xuICAgICAgICAgICAgICAgIG5vZGUyLmFkZE5vbkRpcmVjdGVkUmVsYXRpb24ocmVsYXRpb24sIGFwcE5hbWUpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkU2ltcGxlUmVsYXRpb25CeUFwcChcbiAgICAgICAgICBhcHBOYW1lLFxuICAgICAgICAgIHJlbGF0aW9uVHlwZSxcbiAgICAgICAgICBlbGVtZW50LFxuICAgICAgICAgIGlzRGlyZWN0ZWRcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYXBwTmFtZSArIFwiIGRvZXMgbm90IGV4aXN0XCIpO1xuICAgICAgfVxuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIHJlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGlzIHJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5yZWxhdGVkR3JhcGgucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvblR5cGVdXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiAgcGFyZW50IHJlbW92ZSB0aGUgY2hpbGQgZm9yIG5vd1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZyB8IFNwaW5hbEFwcGxpY2F0aW9ufSBhcHBcbiAgICogQHBhcmFtIHtzdHJpbmcgfCBTcGluYWxSZWxhdGlvbn0gcmVsYXRpb25cbiAgICogQHBhcmFtIHtTcGluYWxOb2RlfSBub2RlXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGlyZWN0ZWQ9ZmFsc2VdXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICByZW1vdmVGcm9tRXhpc3RpbmdSZWxhdGlvbkJ5QXBwKFxuICAgIGFwcCxcbiAgICByZWxhdGlvbixcbiAgICBub2RlLFxuICAgIGlzRGlyZWN0ZWQgPSBmYWxzZSkge1xuICAgIGxldCBhcHBOYW1lID0gXCJcIlxuICAgIGlmICh0eXBlb2YgYXBwICE9IFwic3RyaW5nXCIpXG4gICAgICBhcHBOYW1lID0gYXBwLm5hbWUuZ2V0KClcbiAgICBlbHNlXG4gICAgICBhcHBOYW1lID0gYXBwXG4gICAgbGV0IHJlbGF0aW9uVHlwZSA9IFwiXCJcbiAgICBpZiAodHlwZW9mIHJlbGF0aW9uICE9IFwic3RyaW5nXCIpXG4gICAgICByZWxhdGlvblR5cGUgPSByZWxhdGlvbi50eXBlLmdldCgpXG4gICAgZWxzZVxuICAgICAgcmVsYXRpb25UeXBlID0gcmVsYXRpb25cbiAgICBsZXQgcmVsYXRpb25zID0gdGhpcy5nZXRSZWxhdGlvbnNCeUFwcE5hbWVCeVR5cGUoYXBwTmFtZSwgcmVsYXRpb25UeXBlKVxuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCByZWxhdGlvbnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCByZWxhdGlvbiA9IHJlbGF0aW9uc1tpbmRleF07XG4gICAgICBpZiAocmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKSA9PT0gaXNEaXJlY3RlZCkge1xuICAgICAgICByZWxhdGlvbi5yZW1vdmVGcm9tTm9kZUxpc3QyKG5vZGUpXG4gICAgICAgIGNvbnNvbGUubG9nKGlzRGlyZWN0ZWQpO1xuXG4gICAgICAgIG5vZGUucmVtb3ZlUmVsYXRpb24ocmVsYXRpb24sIGFwcCwgaXNEaXJlY3RlZClcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuXG5cblxuICAvLyBhZGRSZWxhdGlvbjIoX3JlbGF0aW9uLCBfbmFtZSkge1xuICAvLyAgIGxldCBjbGFzc2lmeSA9IGZhbHNlO1xuICAvLyAgIGxldCBuYW1lID0gX3JlbGF0aW9uLnR5cGUuZ2V0KCk7XG4gIC8vICAgaWYgKHR5cGVvZiBfbmFtZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAvLyAgICAgbmFtZSA9IF9uYW1lO1xuICAvLyAgIH1cbiAgLy8gICBpZiAodHlwZW9mIHRoaXMucmVsYXRpb25zW19yZWxhdGlvbi50eXBlLmdldCgpXSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAvLyAgICAgaWYgKF9yZWxhdGlvbi5pc0RpcmVjdGVkLmdldCgpKSB7XG4gIC8vICAgICAgIGZvciAoXG4gIC8vICAgICAgICAgbGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLnJlbGF0aW9uc1tfcmVsYXRpb24udHlwZS5nZXQoKV0ubGVuZ3RoOyBpbmRleCsrXG4gIC8vICAgICAgICkge1xuICAvLyAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLnJlbGF0aW9uc1tfcmVsYXRpb24udHlwZS5nZXQoKV1baW5kZXhdO1xuICAvLyAgICAgICAgIGlmIChcbiAgLy8gICAgICAgICAgIFV0aWxpdGllcy5hcnJheXNFcXVhbChcbiAgLy8gICAgICAgICAgICAgX3JlbGF0aW9uLmdldE5vZGVMaXN0MUlkcygpLFxuICAvLyAgICAgICAgICAgICBlbGVtZW50LmdldE5vZGVMaXN0MUlkcygpXG4gIC8vICAgICAgICAgICApXG4gIC8vICAgICAgICAgKSB7XG4gIC8vICAgICAgICAgICBlbGVtZW50LmFkZE5vdEV4aXN0aW5nVmVydGljZXN0b05vZGVMaXN0MihfcmVsYXRpb24ubm9kZUxpc3QyKTtcbiAgLy8gICAgICAgICB9IGVsc2Uge1xuICAvLyAgICAgICAgICAgZWxlbWVudC5wdXNoKF9yZWxhdGlvbik7XG4gIC8vICAgICAgICAgICBjbGFzc2lmeSA9IHRydWU7XG4gIC8vICAgICAgICAgfVxuICAvLyAgICAgICB9XG4gIC8vICAgICB9IGVsc2Uge1xuICAvLyAgICAgICB0aGlzLnJlbGF0aW9uc1tfcmVsYXRpb24udHlwZS5nZXQoKV0uYWRkTm90RXhpc3RpbmdWZXJ0aWNlc3RvUmVsYXRpb24oXG4gIC8vICAgICAgICAgX3JlbGF0aW9uXG4gIC8vICAgICAgICk7XG4gIC8vICAgICB9XG4gIC8vICAgfSBlbHNlIHtcbiAgLy8gICAgIGlmIChfcmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKSkge1xuICAvLyAgICAgICBsZXQgbGlzdCA9IG5ldyBMc3QoKTtcbiAgLy8gICAgICAgbGlzdC5wdXNoKF9yZWxhdGlvbik7XG4gIC8vICAgICAgIHRoaXMucmVsYXRpb25zLmFkZF9hdHRyKHtcbiAgLy8gICAgICAgICBbbmFtZV06IGxpc3RcbiAgLy8gICAgICAgfSk7XG4gIC8vICAgICAgIHRoaXMuX2NsYXNzaWZ5UmVsYXRpb24oX3JlbGF0aW9uKTtcbiAgLy8gICAgIH0gZWxzZSB7XG4gIC8vICAgICAgIHRoaXMucmVsYXRpb25zLmFkZF9hdHRyKHtcbiAgLy8gICAgICAgICBbbmFtZV06IF9yZWxhdGlvblxuICAvLyAgICAgICB9KTtcbiAgLy8gICAgICAgY2xhc3NpZnkgPSB0cnVlO1xuICAvLyAgICAgfVxuICAvLyAgIH1cbiAgLy8gICBpZiAoY2xhc3NpZnkpIHRoaXMuX2NsYXNzaWZ5UmVsYXRpb24oX3JlbGF0aW9uKTtcbiAgLy8gfVxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9ufSBfcmVsYXRpb25cbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIF9jbGFzc2lmeVJlbGF0aW9uKF9yZWxhdGlvbikge1xuICAgIHRoaXMucmVsYXRlZEdyYXBoLmxvYWQocmVsYXRlZEdyYXBoID0+IHtcbiAgICAgIHJlbGF0ZWRHcmFwaC5fY2xhc3NpZnlSZWxhdGlvbihfcmVsYXRpb24pO1xuICAgIH0pO1xuICB9XG5cbiAgLy9UT0RPIDpOb3RXb3JraW5nXG4gIC8vIGFkZFJlbGF0aW9uKF9yZWxhdGlvbikge1xuICAvLyAgIHRoaXMuYWRkUmVsYXRpb24oX3JlbGF0aW9uKVxuICAvLyAgIHRoaXMucmVsYXRlZEdyYXBoLmxvYWQocmVsYXRlZEdyYXBoID0+IHtcbiAgLy8gICAgIHJlbGF0ZWRHcmFwaC5fYWRkTm90RXhpc3RpbmdWZXJ0aWNlc0Zyb21SZWxhdGlvbihfcmVsYXRpb24pXG4gIC8vICAgfSlcbiAgLy8gfVxuICAvL1RPRE8gOk5vdFdvcmtpbmdcbiAgLy8gYWRkUmVsYXRpb25zKF9yZWxhdGlvbnMpIHtcbiAgLy8gICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX3JlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgLy8gICAgIHRoaXMuYWRkUmVsYXRpb24oX3JlbGF0aW9uc1tpbmRleF0pO1xuICAvLyAgIH1cbiAgLy8gfVxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyBhbGwgdGhlIHJlbGF0aW9ucyBvZiB0aGlzIE5vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGdldFJlbGF0aW9ucyhyZWxhdGlvblR5cGUpIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgaWYgKHR5cGVvZiByZWxhdGlvblR5cGUgIT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGVdICE9IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgbGV0IHJlbExpc3QgPSB0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGVdXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcmVsTGlzdC5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGNvbnN0IHJlbGF0aW9uID0gcmVsTGlzdFtqXTtcbiAgICAgICAgICByZXMucHVzaChyZWxhdGlvbik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXNcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnJlbGF0aW9ucy5fYXR0cmlidXRlX25hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCByZWxMaXN0ID0gdGhpcy5yZWxhdGlvbnNbdGhpcy5yZWxhdGlvbnMuX2F0dHJpYnV0ZV9uYW1lc1tpXV07XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHJlbExpc3QubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgY29uc3QgcmVsYXRpb24gPSByZWxMaXN0W2pdO1xuICAgICAgICByZXMucHVzaChyZWxhdGlvbik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gICAqIEByZXR1cm5zIGFsbCByZWxhdGlvbnMgb2YgYSBzcGVjaWZpYyByZWxhdGlvbiB0eXBlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBnZXRSZWxhdGlvbnNCeVR5cGUodHlwZSkge1xuICAgIGxldCByZXMgPSBbXTtcbiAgICBpZiAoIXR5cGUuaW5jbHVkZXMoXCI+XCIsIHR5cGUubGVuZ3RoIC0gMikgJiZcbiAgICAgICF0eXBlLmluY2x1ZGVzKFwiPFwiLCB0eXBlLmxlbmd0aCAtIDIpICYmXG4gICAgICAhdHlwZS5pbmNsdWRlcyhcIi1cIiwgdHlwZS5sZW5ndGggLSAyKVxuICAgICkge1xuICAgICAgbGV0IHQxID0gdHlwZS5jb25jYXQoXCI+XCIpO1xuICAgICAgcmVzID0gcmVzLmNvbmNhdCh0aGlzLmdldFJlbGF0aW9ucyh0MSkpO1xuICAgICAgbGV0IHQyID0gdHlwZS5jb25jYXQoXCI8XCIpO1xuICAgICAgcmVzID0gcmVzLmNvbmNhdCh0aGlzLmdldFJlbGF0aW9ucyh0MikpO1xuICAgICAgbGV0IHQzID0gdHlwZS5jb25jYXQoXCItXCIpO1xuICAgICAgcmVzID0gcmVzLmNvbmNhdCh0aGlzLmdldFJlbGF0aW9ucyh0MykpO1xuICAgIH1cbiAgICAvLyBpZiAodHlwZW9mIHRoaXMucmVsYXRpb25zW3R5cGVdICE9PSBcInVuZGVmaW5lZFwiKSByZXMgPSB0aGlzLnJlbGF0aW9uc1tcbiAgICAvLyAgIHR5cGVdO1xuICAgIHJldHVybiByZXM7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhc1BhcmVudFxuICAgKiBAcmV0dXJucyBhbiBhcnJheSBvZiBhbGwgcmVsYXRpb25zIG9mIGEgc3BlY2lmaWMgYXBwIGZvciB0aGlzIG5vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGdldFJlbGF0aW9uc0J5QXBwTmFtZShhcHBOYW1lLCBhc1BhcmVudCkge1xuICAgIGxldCByZXMgPSBbXTtcbiAgICBpZiAodGhpcy5oYXNBcHBEZWZpbmVkKGFwcE5hbWUpKSB7XG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5hcHBzW2FwcE5hbWVdLl9hdHRyaWJ1dGVfbmFtZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYXNQYXJlbnQgIT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgIGlmICh0aGlzLmFwcHNbYXBwTmFtZV0uX2F0dHJpYnV0ZV9uYW1lc1tpbmRleF0uaW5jbHVkZXMoXCI+XCIsIHRoaXNcbiAgICAgICAgICAgICAgLmFwcHNbYXBwTmFtZV0uX2F0dHJpYnV0ZV9uYW1lc1tpbmRleF0ubGVuZ3RoIC0gMikpIHtcbiAgICAgICAgICAgIGNvbnN0IGFwcFJlbGF0aW9uTGlzdCA9IHRoaXMuYXBwc1thcHBOYW1lXVt0aGlzLmFwcHNbYXBwTmFtZV0uX2F0dHJpYnV0ZV9uYW1lc1tcbiAgICAgICAgICAgICAgaW5kZXhdXTtcbiAgICAgICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBhcHBSZWxhdGlvbkxpc3QubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHJlbGF0aW9uID0gYXBwUmVsYXRpb25MaXN0W2luZGV4XTtcbiAgICAgICAgICAgICAgcmVzLnB1c2gocmVsYXRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBhcHBSZWxhdGlvbkxpc3QgPSB0aGlzLmFwcHNbYXBwTmFtZV1bdGhpcy5hcHBzW2FwcE5hbWVdLl9hdHRyaWJ1dGVfbmFtZXNbXG4gICAgICAgICAgICBpbmRleF1dO1xuICAgICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBhcHBSZWxhdGlvbkxpc3QubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgICBjb25zdCByZWxhdGlvbiA9IGFwcFJlbGF0aW9uTGlzdFtpbmRleF07XG4gICAgICAgICAgICByZXMucHVzaChyZWxhdGlvbik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cblxuICAvLyAvKipcbiAgLy8gICpcbiAgLy8gICpcbiAgLy8gICogQHBhcmFtIHtzdHJpbmd9IGFwcE5hbWVcbiAgLy8gICogQHJldHVybnMgYW4gb2JqZWN0IG9mIGFsbCByZWxhdGlvbnMgb2YgYSBzcGVjaWZpYyBhcHAgZm9yIHRoaXMgbm9kZVxuICAvLyAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAvLyAgKi9cbiAgLy8gZ2V0UmVsYXRpb25zV2l0aEtleXNCeUFwcE5hbWUoYXBwTmFtZSkge1xuICAvLyAgIGlmICh0aGlzLmhhc0FwcERlZmluZWQoYXBwTmFtZSkpIHtcbiAgLy8gICAgIHJldHVybiB0aGlzLmFwcHNbYXBwTmFtZV07XG4gIC8vICAgfVxuICAvLyB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbEFwcGxpY2F0aW9uIHwgc3RyaW5nfSBhcHBcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFzUGFyZW50XG4gICAqIEByZXR1cm5zIGFsbCByZWxhdGlvbnMgb2YgYSBzcGVjaWZpYyBhcHBcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGdldFJlbGF0aW9uc0J5QXBwKGFwcCwgYXNQYXJlbnQpIHtcbiAgICBsZXQgYXBwTmFtZSA9IFwiXCJcbiAgICBpZiAodHlwZW9mIGFwcCAhPSBcInN0cmluZ1wiKVxuICAgICAgYXBwTmFtZSA9IGFwcC5uYW1lLmdldCgpXG4gICAgZWxzZVxuICAgICAgYXBwTmFtZSA9IGFwcFxuICAgIHJldHVybiB0aGlzLmdldFJlbGF0aW9uc0J5QXBwTmFtZShhcHBOYW1lLCBhc1BhcmVudClcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFwcE5hbWVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBhbGwgcmVsYXRpb25zIG9mIGEgc3BlY2lmaWMgYXBwIG9mIGEgc3BlY2lmaWMgdHlwZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgZ2V0UmVsYXRpb25zQnlBcHBOYW1lQnlUeXBlKGFwcE5hbWUsIHJlbGF0aW9uVHlwZSkge1xuICAgIGxldCByZXMgPSBbXTtcbiAgICBpZiAodGhpcy5oYXNSZWxhdGlvbkJ5QXBwQnlUeXBlRGVmaW5lZChhcHBOYW1lLCByZWxhdGlvblR5cGUpKSB7XG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5hcHBzW2FwcE5hbWVdLl9hdHRyaWJ1dGVfbmFtZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IGFwcFJlbGF0aW9uTGlzdCA9IHRoaXMuYXBwc1thcHBOYW1lXVt0aGlzLmFwcHNbYXBwTmFtZV0uX2F0dHJpYnV0ZV9uYW1lc1tcbiAgICAgICAgICBpbmRleF1dO1xuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgYXBwUmVsYXRpb25MaXN0Lmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgIGNvbnN0IHJlbGF0aW9uID0gYXBwUmVsYXRpb25MaXN0W2luZGV4XTtcbiAgICAgICAgICBpZiAocmVsYXRpb24udHlwZS5nZXQoKSA9PT0gcmVsYXRpb25UeXBlKSByZXMucHVzaChyZWxhdGlvbik7XG4gICAgICAgICAgZWxzZSBpZiAoIXJlbGF0aW9uLmlzRGlyZWN0ZWQuZ2V0KCkgJiYgcmVsYXRpb24udHlwZS5nZXQoKSArXG4gICAgICAgICAgICBcIi1cIiA9PT0gcmVsYXRpb25UeXBlKSByZXMucHVzaChyZWxhdGlvbik7XG4gICAgICAgICAgZWxzZSBpZiAocmVsYXRpb24udHlwZS5nZXQoKSArIFwiPlwiID09PSByZWxhdGlvblR5cGUpIHJlcy5wdXNoKFxuICAgICAgICAgICAgcmVsYXRpb24pO1xuICAgICAgICAgIGVsc2UgaWYgKHJlbGF0aW9uLnR5cGUuZ2V0KCkgKyBcIjxcIiA9PT0gcmVsYXRpb25UeXBlKSByZXMucHVzaChcbiAgICAgICAgICAgIHJlbGF0aW9uKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbEFwcGxpY2F0aW9ufSBhcHBcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBhbGwgcmVsYXRpb25zIG9mIGEgc3BlY2lmaWMgYXBwIG9mIGEgc3BlY2lmaWMgdHlwZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgZ2V0UmVsYXRpb25zQnlBcHBCeVR5cGUoYXBwLCByZWxhdGlvblR5cGUpIHtcblxuICAgIGxldCBhcHBOYW1lID0gYXBwLm5hbWUuZ2V0KClcbiAgICByZXR1cm4gdGhpcy5nZXRSZWxhdGlvbnNCeUFwcE5hbWVCeVR5cGUoYXBwTmFtZSwgcmVsYXRpb25UeXBlKVxuXG4gIH1cbiAgLyoqXG4gICAqICB2ZXJpZnkgaWYgYW4gZWxlbWVudCBpcyBhbHJlYWR5IGluIGdpdmVuIG5vZGVMaXN0XG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZVtdfSBfbm9kZWxpc3RcbiAgICogQHJldHVybnMgYm9vbGVhblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgaW5Ob2RlTGlzdChfbm9kZWxpc3QpIHtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX25vZGVsaXN0Lmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgZWxlbWVudCA9IF9ub2RlbGlzdFtpbmRleF07XG4gICAgICBpZiAoZWxlbWVudC5pZC5nZXQoKSA9PT0gdGhpcy5pZC5nZXQoKSkgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vVE9ETyBnZXRQYXJlbnRcbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nIHwgU3BpbmFsQXBwbGljYXRpb259IGFwcE5hbWUgLSBvcHRpb25hbFxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlIC0gb3B0aW9uYWxcbiAgICogQHJldHVybnMgYSBsaXN0IG9mIG5laWdoYm9ycyBub2RlcyBcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGdldE5laWdoYm9ycyhyZWxhdGlvblR5cGUsIGFwcCkge1xuICAgIGxldCBhcHBOYW1lID0gXCJcIlxuICAgIGlmICh0eXBlb2YgYXBwICE9IFwic3RyaW5nXCIpXG4gICAgICBhcHBOYW1lID0gYXBwLm5hbWUuZ2V0KClcbiAgICBlbHNlXG4gICAgICBhcHBOYW1lID0gYXBwXG4gICAgbGV0IG5laWdoYm9ycyA9IFtdO1xuICAgIGxldCByZWxhdGlvbnMgPSBudWxsXG4gICAgaWYgKHR5cGVvZiByZWxhdGlvblR5cGUgPT0gXCJ1bmRlZmluZWRcIiAmJiB0eXBlb2YgYXBwTmFtZSA9PSBcInVuZGVmaW5lZFwiKVxuICAgICAgcmVsYXRpb25zID0gdGhpcy5nZXRSZWxhdGlvbnMoKTtcbiAgICBlbHNlIGlmICh0eXBlb2YgcmVsYXRpb25UeXBlICE9IFwidW5kZWZpbmVkXCIgJiYgdHlwZW9mIGFwcE5hbWUgPT1cbiAgICAgIFwidW5kZWZpbmVkXCIpXG4gICAgICByZWxhdGlvbnMgPSB0aGlzLmdldFJlbGF0aW9uc0J5VHlwZShyZWxhdGlvblR5cGUpO1xuICAgIGVsc2UgaWYgKHR5cGVvZiByZWxhdGlvblR5cGUgPT0gXCJ1bmRlZmluZWRcIiAmJiB0eXBlb2YgYXBwTmFtZSAhPVxuICAgICAgXCJ1bmRlZmluZWRcIilcbiAgICAgIHJlbGF0aW9ucyA9IHRoaXMuZ2V0UmVsYXRpb25zQnlBcHAoYXBwTmFtZSk7XG4gICAgZWxzZVxuICAgICAgcmVsYXRpb25zID0gdGhpcy5nZXRSZWxhdGlvbnNCeUFwcE5hbWVCeVR5cGUoYXBwTmFtZSwgcmVsYXRpb25UeXBlKTtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcmVsYXRpb25zLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgcmVsYXRpb24gPSByZWxhdGlvbnNbaW5kZXhdO1xuICAgICAgaWYgKHJlbGF0aW9uLmlzRGlyZWN0ZWQuZ2V0KCkpIHtcbiAgICAgICAgaWYgKHRoaXMuaW5Ob2RlTGlzdChyZWxhdGlvbi5ub2RlTGlzdDEpKVxuICAgICAgICAgIG5laWdoYm9ycyA9IFV0aWxpdGllcy5jb25jYXQobmVpZ2hib3JzLCByZWxhdGlvbi5ub2RlTGlzdDIpO1xuICAgICAgICBlbHNlIG5laWdoYm9ycyA9IFV0aWxpdGllcy5jb25jYXQobmVpZ2hib3JzLCByZWxhdGlvbi5ub2RlTGlzdDEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmVpZ2hib3JzID0gVXRpbGl0aWVzLmNvbmNhdChcbiAgICAgICAgICBuZWlnaGJvcnMsXG4gICAgICAgICAgVXRpbGl0aWVzLmFsbEJ1dE1lQnlJZChyZWxhdGlvbi5ub2RlTGlzdDEsIHRoaXMpXG4gICAgICAgICk7XG4gICAgICAgIG5laWdoYm9ycyA9IFV0aWxpdGllcy5jb25jYXQoXG4gICAgICAgICAgbmVpZ2hib3JzLFxuICAgICAgICAgIFV0aWxpdGllcy5hbGxCdXRNZUJ5SWQocmVsYXRpb24ubm9kZUxpc3QyLCB0aGlzKVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmVpZ2hib3JzO1xuICB9XG5cblxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxBcHBsaWNhdGlvbiB8IHN0cmluZ30gYXBwXG4gICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGdldENoaWxkcmVuQnlBcHAoYXBwKSB7XG4gICAgbGV0IHJlcyA9IFtdXG4gICAgaWYgKHRoaXMuaGFzQ2hpbGRyZW4oYXBwKSkge1xuICAgICAgbGV0IHJlbGF0aW9ucyA9IHRoaXMuZ2V0UmVsYXRpb25zQnlBcHAoYXBwLCB0cnVlKTtcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCByZWxhdGlvbnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IHJlbGF0aW9uID0gcmVsYXRpb25zW2luZGV4XTtcbiAgICAgICAgcmVzID0gcmVzLmNvbmNhdCh0aGlzLmdldENoaWxkcmVuQnlBcHBCeVJlbGF0aW9uKGFwcCwgcmVsYXRpb24pKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzXG4gIH1cblxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxBcHBsaWNhdGlvbnwgc3RyaW5nfSBhcHBcbiAgICogQHJldHVybnMgYm9vbGVhblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgaGFzQ2hpbGRyZW4oYXBwKSB7XG4gICAgaWYgKHR5cGVvZiBhcHAgIT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgbGV0IGFwcE5hbWUgPSBcIlwiXG4gICAgICBpZiAodHlwZW9mIGFwcCAhPSBcInN0cmluZ1wiKVxuICAgICAgICBhcHBOYW1lID0gYXBwLm5hbWUuZ2V0KClcbiAgICAgIGVsc2VcbiAgICAgICAgYXBwTmFtZSA9IGFwcFxuICAgICAgaWYgKHRoaXMuaGFzQXBwRGVmaW5lZChhcHBOYW1lKSkge1xuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5hcHBzW2FwcE5hbWVdLl9hdHRyaWJ1dGVfbmFtZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgY29uc3QgcHJvcCA9IHRoaXMuYXBwc1thcHBOYW1lXS5fYXR0cmlidXRlX25hbWVzW2luZGV4XVxuICAgICAgICAgIGNvbnN0IHJlbGF0aW9uTHN0ID0gdGhpcy5hcHBzW2FwcE5hbWVdW3Byb3BdO1xuICAgICAgICAgIGlmIChwcm9wLmluY2x1ZGVzKFwiPlwiLCBwcm9wLmxlbmd0aCAtIDIpKVxuICAgICAgICAgICAgaWYgKHJlbGF0aW9uTHN0Lmxlbmd0aCA+IDApXG4gICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMucmVsYXRpb25zLl9hdHRyaWJ1dGVfbmFtZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCByZWxhdGlvbnNOYW1lID0gdGhpcy5yZWxhdGlvbnMuX2F0dHJpYnV0ZV9uYW1lc1tpbmRleF07XG4gICAgICBpZiAocmVsYXRpb25zTmFtZS5pbmNsdWRlcyhcIj5cIiwgcmVsYXRpb25zTmFtZS5sZW5ndGggLSAyKSlcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBhcnJheSBvZiBzcGluYWxOb2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBnZXRDaGlsZHJlbkJ5UmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSkge1xuICAgIGxldCByZXMgPSBbXVxuICAgIGlmICh0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIj5cIl0pXG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCI+XCJdLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCByZWxhdGlvbiA9IHRoaXMucmVsYXRpb25zW3JlbGF0aW9uVHlwZSArIFwiPlwiXVtpbmRleF07XG4gICAgICAgIGxldCBub2RlTGlzdDIgPSByZWxhdGlvbi5nZXROb2RlTGlzdDIoKTtcbiAgICAgICAgcmVzID0gVXRpbGl0aWVzLmNvbmNhdChyZXMsIG5vZGVMaXN0MilcbiAgICAgIH1cbiAgICByZXR1cm4gcmVzXG4gIH1cblxuICAvL1RPRE9cbiAgLy8gLyoqXG4gIC8vICAqXG4gIC8vICAqXG4gIC8vICAqIEBwYXJhbSB7c3RyaW5nfFNwaW5hbFJlbGF0aW9ufSByZWxhdGlvblxuICAvLyAgKiBAcmV0dXJucyBib29sZWFuXG4gIC8vICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gIC8vICAqL1xuICAvLyBpc1BhcmVudChyZWxhdGlvbikge1xuICAvLyAgIGlmICh0eXBlb2YgcmVsYXRpb24gPT09IFwic3RyaW5nXCIpIHtcbiAgLy8gICAgIGlmICh0eXBlb2YgdGhpcy5yZWxhdGlvbnNbcmVsYXRpb24gKyBcIj5cIl0gIT0gXCJ1bmRlZmluZWRcIikge1xuICAvLyAgICAgICBsZXQgcmVsYXRpb25zID0gdGhpcy5yZWxhdGlvbnNbcmVsYXRpb24gKyBcIj5cIl1cbiAgLy8gICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHJlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgLy8gICAgICAgICBjb25zdCByZWxhdGlvbiA9IHJlbGF0aW9uc1tpbmRleF07XG4gIC8vICAgICAgICAgbGV0IG5vZGVMaXN0MSA9IHJlbGF0aW9uLmdldE5vZGVMaXN0MSgpXG4gIC8vICAgICAgICAgcmV0dXJuIFV0aWxpdGllcy5jb250YWluc0xzdEJ5SWQobm9kZUxpc3QxLCB0aGlzKVxuICAvLyAgICAgICB9XG4gIC8vICAgICB9XG4gIC8vICAgfSBlbHNlIHtcbiAgLy8gICAgIGxldCBub2RlTGlzdDEgPSByZWxhdGlvbi5nZXROb2RlTGlzdDEoKVxuICAvLyAgICAgcmV0dXJuIFV0aWxpdGllcy5jb250YWluc0xzdEJ5SWQobm9kZUxpc3QxLCB0aGlzKVxuICAvLyAgIH1cbiAgLy8gICByZXR1cm4gZmFsc2U7XG4gIC8vIH1cblxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbn0gcmVsYXRpb25cbiAgICogQHJldHVybnMgYm9vbGVhblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgaXNQYXJlbnQocmVsYXRpb24pIHtcbiAgICBsZXQgbm9kZUxpc3QxID0gcmVsYXRpb24uZ2V0Tm9kZUxpc3QxKClcbiAgICByZXR1cm4gVXRpbGl0aWVzLmNvbnRhaW5zTHN0QnlJZChub2RlTGlzdDEsIHRoaXMpXG4gIH1cblxuICAvL1RPRE9cbiAgLy8gLyoqXG4gIC8vICAqXG4gIC8vICAqXG4gIC8vICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb259IHJlbGF0aW9uXG4gIC8vICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgLy8gICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgLy8gICovXG4gIC8vIGlzQ2hpbGQocmVsYXRpb24pIHtcbiAgLy8gICBsZXQgbm9kZUxpc3QyID0gcmVsYXRpb24uZ2V0Tm9kZUxpc3QyKClcbiAgLy8gICByZXR1cm4gVXRpbGl0aWVzLmNvbnRhaW5zTHN0QnlJZChub2RlTGlzdDIsIHRoaXMpXG4gIC8vIH1cblxuICAvL1RPRE8gT3B0aW1pemVcbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nIHwgU3BpbmFsQXBwbGljYXRpb259IGFwcFxuICAgKiBAcGFyYW0ge3N0cmluZyB8IFNwaW5hbFJlbGF0aW9ufFtzdHJpbmddfFtTcGluYWxSZWxhdGlvbl19IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBhcnJheSBvZiBzcGluYWxOb2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBnZXRDaGlsZHJlbkJ5QXBwQnlSZWxhdGlvbihhcHAsIHJlbGF0aW9uKSB7XG4gICAgbGV0IGFwcE5hbWUgPSBcIlwiXG4gICAgbGV0IHJlbGF0aW9uVHlwZSA9IFwiXCJcbiAgICBsZXQgcmVzID0gW11cbiAgICBpZiAodHlwZW9mIGFwcCAhPSBcInN0cmluZ1wiKVxuICAgICAgYXBwTmFtZSA9IGFwcC5uYW1lLmdldCgpXG4gICAgZWxzZVxuICAgICAgYXBwTmFtZSA9IGFwcFxuICAgIGlmIChBcnJheS5pc0FycmF5KHJlbGF0aW9uKSkge1xuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHJlbGF0aW9uLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCByZWwgPSByZWxhdGlvbltpbmRleF07XG4gICAgICAgIHJlcyA9IHJlcy5jb25jYXQodGhpcy5nZXRDaGlsZHJlbkJ5QXBwQnlSZWxhdGlvbihhcHAsIHJlbCkpXG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHJlbGF0aW9uICE9IFwic3RyaW5nXCIpXG4gICAgICByZWxhdGlvblR5cGUgPSByZWxhdGlvbi50eXBlLmdldCgpXG4gICAgZWxzZVxuICAgICAgcmVsYXRpb25UeXBlID0gcmVsYXRpb25cbiAgICBpZiAodHlwZW9mIHRoaXMuYXBwc1thcHBOYW1lXSAhPSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiB0aGlzLmFwcHNbXG4gICAgICAgIGFwcE5hbWVdW3JlbGF0aW9uVHlwZSArIFwiPlwiXSAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5hcHBzW2FwcE5hbWVdW3JlbGF0aW9uVHlwZSArIFwiPlwiXS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgcmVsYXRpb24gPSB0aGlzLmFwcHNbYXBwTmFtZV1bcmVsYXRpb25UeXBlICsgXCI+XCJdW2luZGV4XTtcbiAgICAgICAgbGV0IG5vZGVMaXN0MiA9IHJlbGF0aW9uLmdldE5vZGVMaXN0MigpXG4gICAgICAgIHJlcyA9IFV0aWxpdGllcy5jb25jYXQocmVzLCBub2RlTGlzdDIpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXNcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZyB8IFNwaW5hbEFwcGxpY2F0aW9ufSBhcHBOYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nIHwgU3BpbmFsUmVsYXRpb259IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyAgQSBwcm9taXNlIG9mIGFuIGFycmF5IG9mIE1vZGVsc1xuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYXN5bmMgZ2V0Q2hpbGRyZW5FbGVtZW50c0J5QXBwQnlSZWxhdGlvbihhcHAsIHJlbGF0aW9uKSB7XG4gICAgbGV0IGFwcE5hbWUgPSBcIlwiXG4gICAgbGV0IHJlbGF0aW9uVHlwZSA9IFwiXCJcbiAgICBsZXQgcmVzID0gW11cbiAgICBpZiAodHlwZW9mIGFwcCAhPSBcInN0cmluZ1wiKVxuICAgICAgYXBwTmFtZSA9IGFwcC5uYW1lLmdldCgpXG4gICAgZWxzZVxuICAgICAgYXBwTmFtZSA9IGFwcFxuICAgIGlmICh0eXBlb2YgcmVsYXRpb24gIT0gXCJzdHJpbmdcIilcbiAgICAgIHJlbGF0aW9uVHlwZSA9IHJlbGF0aW9uLnR5cGUuZ2V0KClcbiAgICBlbHNlXG4gICAgICByZWxhdGlvblR5cGUgPSByZWxhdGlvblxuICAgIGlmICh0eXBlb2YgdGhpcy5hcHBzW2FwcE5hbWVdICE9IFwidW5kZWZpbmVkXCIgJiYgdHlwZW9mIHRoaXMuYXBwc1tcbiAgICAgICAgYXBwTmFtZV1bcmVsYXRpb25UeXBlICsgXCI+XCJdICE9IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGxldCByZWxhdGlvblRtcCA9IHRoaXMuYXBwc1thcHBOYW1lXVtyZWxhdGlvblR5cGUgKyBcIj5cIl1cbiAgICAgIGxldCBub2RlTGlzdDIgPSByZWxhdGlvblRtcC5nZXROb2RlTGlzdDIoKVxuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IG5vZGVMaXN0Mi5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVMaXN0MltpbmRleF07XG4gICAgICAgIHJlcy5wdXNoKGF3YWl0IG5vZGUuZ2V0RWxlbWVudCgpKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzXG4gIH1cblxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBBIHByb21pc2Ugb2YgYW4gYXJyYXkgb2YgTW9kZWxzXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhc3luYyBnZXRDaGlsZHJlbkVsZW1lbnRzQnlSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlKSB7XG4gICAgbGV0IHJlcyA9IFtdXG4gICAgaWYgKHRoaXMucmVsYXRpb25zW3JlbGF0aW9uVHlwZSArIFwiPlwiXSlcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIj5cIl0ubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IHJlbGF0aW9uID0gdGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCI+XCJdW2luZGV4XTtcbiAgICAgICAgbGV0IG5vZGVMaXN0MiA9IHJlbGF0aW9uLmdldE5vZGVMaXN0MigpO1xuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgbm9kZUxpc3QyLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgIGNvbnN0IG5vZGUgPSBub2RlTGlzdDJbaW5kZXhdO1xuICAgICAgICAgIHJlcy5wdXNoKGF3YWl0IFV0aWxpdGllcy5wcm9taXNlTG9hZChub2RlLmVsZW1lbnQpKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgcmV0dXJuIHJlc1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgYXJyYXkgb2Ygc3BpbmFsTm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgZ2V0UGFyZW50c0J5UmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSkge1xuICAgIGxldCByZXMgPSBbXVxuICAgIGlmICh0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIjxcIl0pXG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCI8XCJdLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCByZWxhdGlvbiA9IHRoaXMucmVsYXRpb25zW3JlbGF0aW9uVHlwZSArIFwiPFwiXVtpbmRleF07XG4gICAgICAgIGxldCBub2RlTGlzdDEgPSByZWxhdGlvbi5nZXROb2RlTGlzdDEoKTtcbiAgICAgICAgcmVzID0gVXRpbGl0aWVzLmNvbmNhdChyZXMsIG5vZGVMaXN0MSlcbiAgICAgIH1cbiAgICByZXR1cm4gcmVzXG4gIH1cblxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbiB8IHN0cmluZ30gcmVsYXRpb25cbiAgICogQHBhcmFtIHtTcGluYWxBcHBsaWNhdGlvbiB8IHN0cmluZ30gYXBwIC0gb3B0aW9uYWxcbiAgICogQHBhcmFtIHtib29sZWFufSBpc0RpcmVjdGVkIC0gb3B0aW9uYWxcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIHJlbW92ZVJlbGF0aW9uKHJlbGF0aW9uLCBhcHAsIGlzRGlyZWN0ZWQpIHtcbiAgICBsZXQgcmVsYXRpb25UeXBlID0gXCJcIlxuICAgIGlmICh0eXBlb2YgcmVsYXRpb24gIT0gJ3N0cmluZycpXG4gICAgICByZWxhdGlvblR5cGUgPSByZWxhdGlvbi50eXBlLmdldCgpXG4gICAgZWxzZSByZWxhdGlvblR5cGUgPSByZWxhdGlvblxuXG4gICAgbGV0IGFwcE5hbWUgPSBcIlwiXG4gICAgaWYgKHR5cGVvZiBhcHAgIT0gJ3N0cmluZycpXG4gICAgICBhcHBOYW1lID0gYXBwLm5hbWUuZ2V0KClcbiAgICBlbHNlIGFwcE5hbWUgPSBhcHBcblxuICAgIGlmICh0eXBlb2YgaXNEaXJlY3RlZCAhPSBcInVuZGVmaW5lZFwiKVxuICAgICAgaWYgKGlzRGlyZWN0ZWQpXG4gICAgICAgIHJlbGF0aW9uVHlwZSA9IHJlbGF0aW9uVHlwZS5jb25jYXQoJzwnKVxuICAgIGVsc2VcbiAgICAgIHJlbGF0aW9uVHlwZSA9IHJlbGF0aW9uVHlwZS5jb25jYXQoJy0nKVxuICAgIGNvbnNvbGUubG9nKHJlbGF0aW9uVHlwZSk7XG5cbiAgICBpZiAodHlwZW9mIHRoaXMucmVsYXRpb25zW3JlbGF0aW9uVHlwZV0gIT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgbGV0IHJlbGF0aW9uTHN0ID0gdGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlXTtcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCByZWxhdGlvbkxzdC5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgY2FuZGlkYXRlUmVsYXRpb24gPSByZWxhdGlvbkxzdFtpbmRleF07XG4gICAgICAgIGlmIChyZWxhdGlvbi5pZC5nZXQoKSA9PT0gY2FuZGlkYXRlUmVsYXRpb24uaWQuZ2V0KCkpXG4gICAgICAgICAgcmVsYXRpb25Mc3Quc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMuaGFzQXBwRGVmaW5lZChhcHBOYW1lKSAmJlxuICAgICAgdHlwZW9mIHRoaXMuYXBwc1thcHBOYW1lXVtyZWxhdGlvblR5cGVdICE9IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGxldCByZWxhdGlvbkxzdCA9IHRoaXMuYXBwc1thcHBOYW1lXVtyZWxhdGlvblR5cGVdO1xuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHJlbGF0aW9uTHN0Lmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCBjYW5kaWRhdGVSZWxhdGlvbiA9IHJlbGF0aW9uTHN0W2luZGV4XTtcbiAgICAgICAgaWYgKHJlbGF0aW9uLmlkLmdldCgpID09PSBjYW5kaWRhdGVSZWxhdGlvbi5pZC5nZXQoKSlcbiAgICAgICAgICByZWxhdGlvbkxzdC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cblxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9uW119IF9yZWxhdGlvbnNcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIHJlbW92ZVJlbGF0aW9ucyhfcmVsYXRpb25zKSB7XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IF9yZWxhdGlvbnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICB0aGlzLnJlbW92ZVJlbGF0aW9uKF9yZWxhdGlvbnNbaW5kZXhdKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIHJlbW92ZVJlbGF0aW9uVHlwZShyZWxhdGlvblR5cGUpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShyZWxhdGlvblR5cGUpIHx8IHJlbGF0aW9uVHlwZSBpbnN0YW5jZW9mIExzdClcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCByZWxhdGlvblR5cGUubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IHR5cGUgPSByZWxhdGlvblR5cGVbaW5kZXhdO1xuICAgICAgICB0aGlzLnJlbGF0aW9ucy5yZW1fYXR0cih0eXBlKTtcbiAgICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMucmVsYXRpb25zLnJlbV9hdHRyKHJlbGF0aW9uVHlwZSk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBoYXNBcHBEZWZpbmVkKGFwcE5hbWUpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMuYXBwc1thcHBOYW1lXSAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oXCJhcHAgXCIgKyBhcHBOYW1lICtcbiAgICAgICAgXCIgaXMgbm90IGRlZmluZWQgZm9yIG5vZGUgXCIgKyB0aGlzLm5hbWUuZ2V0KCkpO1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEByZXR1cm5zIGJvb2xlYW4gXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBoYXNSZWxhdGlvbkJ5QXBwQnlUeXBlRGVmaW5lZChhcHBOYW1lLCByZWxhdGlvblR5cGUpIHtcbiAgICBpZiAodGhpcy5oYXNBcHBEZWZpbmVkKGFwcE5hbWUpICYmIHR5cGVvZiB0aGlzLmFwcHNbYXBwTmFtZV1bXG4gICAgICAgIHJlbGF0aW9uVHlwZVxuICAgICAgXSAhPT1cbiAgICAgIFwidW5kZWZpbmVkXCIgfHwgdGhpcy5oYXNBcHBEZWZpbmVkKGFwcE5hbWUpICYmIHR5cGVvZiB0aGlzLmFwcHNbXG4gICAgICAgIGFwcE5hbWVdW1xuICAgICAgICByZWxhdGlvblR5cGUgKyBcIi1cIlxuICAgICAgXSAhPT1cbiAgICAgIFwidW5kZWZpbmVkXCIgfHwgdGhpcy5oYXNBcHBEZWZpbmVkKGFwcE5hbWUpICYmIHR5cGVvZiB0aGlzLmFwcHNbXG4gICAgICAgIGFwcE5hbWVdW1xuICAgICAgICByZWxhdGlvblR5cGUgKyBcIj5cIlxuICAgICAgXSAhPT1cbiAgICAgIFwidW5kZWZpbmVkXCIgfHwgdGhpcy5oYXNBcHBEZWZpbmVkKGFwcE5hbWUpICYmIHR5cGVvZiB0aGlzLmFwcHNbXG4gICAgICAgIGFwcE5hbWVdW1xuICAgICAgICByZWxhdGlvblR5cGUgKyBcIjxcIlxuICAgICAgXSAhPT1cbiAgICAgIFwidW5kZWZpbmVkXCIpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKFwicmVsYXRpb24gXCIgKyByZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyBub3QgZGVmaW5lZCBmb3Igbm9kZSBcIiArIHRoaXMubmFtZS5nZXQoKSArXG4gICAgICAgIFwiIGZvciBhcHBsaWNhdGlvbiBcIiArIGFwcE5hbWUpO1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyBBIGpzb24gcmVwcmVzZW50aW5nIHRoZSBub2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICB0b0pzb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiB0aGlzLmlkLmdldCgpLFxuICAgICAgbmFtZTogdGhpcy5uYW1lLmdldCgpLFxuICAgICAgZWxlbWVudDogbnVsbFxuICAgIH07XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEByZXR1cm5zIEEganNvbiByZXByZXNlbnRpbmcgdGhlIG5vZGUgd2l0aCBpdHMgcmVsYXRpb25zXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICB0b0pzb25XaXRoUmVsYXRpb25zKCkge1xuICAgIGxldCByZWxhdGlvbnMgPSBbXTtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5nZXRSZWxhdGlvbnMoKS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IHJlbGF0aW9uID0gdGhpcy5nZXRSZWxhdGlvbnMoKVtpbmRleF07XG4gICAgICByZWxhdGlvbnMucHVzaChyZWxhdGlvbi50b0pzb24oKSk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBpZDogdGhpcy5pZC5nZXQoKSxcbiAgICAgIG5hbWU6IHRoaXMubmFtZS5nZXQoKSxcbiAgICAgIGVsZW1lbnQ6IG51bGwsXG4gICAgICByZWxhdGlvbnM6IHJlbGF0aW9uc1xuICAgIH07XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEByZXR1cm5zIEFuIElGQyBsaWtlIGZvcm1hdCByZXByZXNlbnRpbmcgdGhlIG5vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGFzeW5jIHRvSWZjKCkge1xuICAgIGxldCBlbGVtZW50ID0gYXdhaXQgVXRpbGl0aWVzLnByb21pc2VMb2FkKHRoaXMuZWxlbWVudCk7XG4gICAgcmV0dXJuIGVsZW1lbnQudG9JZmMoKTtcbiAgfVxufVxuZXhwb3J0IGRlZmF1bHQgU3BpbmFsTm9kZVxuc3BpbmFsQ29yZS5yZWdpc3Rlcl9tb2RlbHMoW1NwaW5hbE5vZGVdKTsiXX0=