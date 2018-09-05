const spinalCore = require("spinal-core-connectorjs");
const globalType = typeof window === "undefined" ? global : window;
import SpinalRelation from "./SpinalRelation";
let getViewer = function() {
  return globalType.v;
};

import {
  Utilities
} from "./Utilities";
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
        id: Utilities.guid(this.constructor.name),
        name: _name,
        element: new Ptr(element),
        relations: new Model(),
        apps: new Model(),
        relatedGraphPtr: new Ptr(relatedGraph),
      });
      this.relatedGraph = relatedGraph;
      if (typeof relatedGraph !== "undefined") {
        relatedGraph.classifyNode(this);
      }
      if (typeof relations !== "undefined") {
        if (Array.isArray(relations) || relations instanceof Lst)
          this.addRelations(relations);
        else this.addRelation(relations);
      }
    }
    if (typeof this.relatedGraph == "undefined")
      var interval = setInterval(() => {
        if (typeof this.relatedGraphPtr != "undefined") {
          this.relatedGraphPtr.load(t => {
            this.relatedGraph = t;
            clearInterval(interval)
          })
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
    if (typeof this.type === "undefined")
      this.add_attr({
        type: new Model()
      })
    this.type.add_attr({
      [appName]: type
    })
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
    return await Utilities.promiseLoad(this.element)
  }
  /**
   *
   *
   * @returns all applications
   * @memberof SpinalNode
   */
  async getApps() {
    let res = []
    for (let index = 0; index < this.apps._attribute_names.length; index++) {
      const appName = this.apps._attribute_names[index];
      res.push(await Utilities.promiseLoad(this.relatedGraph.appsList[
        appName]))
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
    if (typeof appName === "undefined") this.addRelation(relation, name);
    else this.addRelationByApp(relation, name, appName);
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
    if (typeof appName === "undefined") this.addRelation(relation, name);
    else this.addRelationByApp(relation, name, appName);
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
    if (typeof appName === "undefined") this.addRelation(relation, name);
    else this.addRelationByApp(relation, name, appName);
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
      if (typeof this.relations[nameTmp] !== "undefined")
        this.relations[nameTmp].push(relation);
      else {
        let list = new Lst();
        list.push(relation);
        this.relations.add_attr({
          [nameTmp]: list
        });
      }
    } else {
      console.log(
        relation.type.get() +
        " is reserved by " +
        this.relatedGraph.reservedRelationsNames[relation.type.get()]
      );
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
    if (this.relatedGraph.hasReservationCredentials(relation.type.get(),
        appName)) {
      if (this.relatedGraph.containsApp(appName)) {
        let nameTmp = relation.type.get();
        if (typeof name !== "undefined") {
          nameTmp = name;
          // relation.name.set(nameTmp)
        }
        if (typeof this.relations[nameTmp] !== "undefined")
          this.relations[nameTmp].push(relation);
        else {
          let list = new Lst();
          list.push(relation);
          this.relations.add_attr({
            [nameTmp]: list
          });
        }
        if (typeof this.apps[appName] !== "undefined" && typeof this.apps[
            appName][nameTmp] !== "undefined")
          this.apps[appName][nameTmp].push(relation)
        else if (typeof this.apps[appName] !== "undefined" && typeof this
          .apps[
            appName][nameTmp] === "undefined") {
          let relationList = new Lst()
          relationList.push(relation)
          this.apps[appName].add_attr({
            [nameTmp]: relationList
          });
        } else {
          let app = new Model();
          let relationList = new Lst()
          relationList.push(relation)
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
      console.log(
        relation.type.get() +
        " is reserved by " +
        this.relatedGraph.reservedRelationsNames[relation.type.get()]
      );
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
      let res = {}
      let node2 = this.relatedGraph.addNode(element);
      res.node = node2
      let rel = new SpinalRelation(relationType, [this], [node2],
        isDirected);
      res.relation = rel
      this.relatedGraph.addRelation(rel);
      return res;
    } else {
      console.log(
        relationType +
        " is reserved by " +
        this.relatedGraph.reservedRelationsNames[relationType]
      );
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
  addSimpleRelationByApp(appName, relationType, element, isDirected = false,
    asNode = false) {
    if (this.relatedGraph.hasReservationCredentials(relationType, appName)) {
      if (this.relatedGraph.containsApp(appName)) {
        let res = {}
        let node2 = element
        if (asNode || element.constructor.name != "SpinalNode")
          node2 = this.relatedGraph.addNode(element);
        res.node = node2
        let rel = new SpinalRelation(relationType, [this], [node2],
          isDirected);
        res.relation = rel
        this.relatedGraph.addRelation(rel, appName);
        return res;
      } else {
        console.error(appName + " does not exist");
      }
    } else {
      console.log(
        relationType +
        " is reserved by " +
        this.relatedGraph.reservedRelationsNames[relationType]
      );
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
  addToExistingRelation(
    relationType,
    element,
    isDirected = false,
    asParent = false
  ) {
    let res = {}
    if (!this.relatedGraph.isReserved(relationType)) {
      let existingRelations = this.getRelations();
      for (let index = 0; index < existingRelations.length; index++) {
        const relation = existingRelations[index];
        res.relation = relation
        if (
          relationType === relationType &&
          isDirected === relation.isDirected.get()
        ) {
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
      console.log(
        relationType +
        " is reserved by " +
        this.relatedGraph.reservedRelationsNames[relationType]
      );
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
  addToExistingRelationByApp(
    appName,
    relationType,
    element,
    isDirected = false,
    asParent = false,
    asNode = false
  ) {
    let res = {}
    let node2 = element; //initialize
    if (this.relatedGraph.hasReservationCredentials(relationType, appName)) {
      if (this.relatedGraph.containsApp(appName)) {
        if (typeof this.apps[appName] !== "undefined") {
          let appRelations = this.getRelationsByAppName(appName);
          for (let index = 0; index < appRelations.length; index++) {
            const relation = appRelations[index];
            res.relation = relation
            if (
              relation.type.get() === relationType &&
              isDirected === relation.isDirected.get()
            ) {
              if (isDirected && this.isParent(relation)) {
                if (asNode || element.constructor.name != "SpinalNode")
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
                if (asNode || element.constructor.name != "SpinalNode")
                  node2 = this.relatedGraph.addNode(element);
                res.node = node2;
                relation.addNodetoNodeList2(node2);
                node2.addNonDirectedRelation(relation, appName);
                return res;
              }
            }
          }
        }
        return this.addSimpleRelationByApp(
          appName,
          relationType,
          element,
          isDirected
        );
      } else {
        console.error(appName + " does not exist");
      }
      console.log(
        relationType +
        " is reserved by " +
        this.relatedGraph.reservedRelationsNames[relationType]
      );
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
  removeFromExistingRelationByApp(
    app,
    relation,
    node,
    isDirected = false) {
    let appName = ""
    if (typeof app != "string")
      appName = app.name.get()
    else
      appName = app
    let relationType = ""
    if (typeof relation != "string")
      relationType = relation.type.get()
    else
      relationType = relation
    let relations = this.getRelationsByAppNameByType(appName, relationType)
    for (let index = 0; index < relations.length; index++) {
      const relation = relations[index];
      if (relation.isDirected.get() === isDirected) {
        relation.removeFromNodeList2(node)
        node.removeRelation(relation, app, isDirected)
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
        let relList = this.relations[relationType]
        for (let j = 0; j < relList.length; j++) {
          const relation = relList[j];
          res.push(relation);
        }
      }
      return res
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
    if (!type.includes(">", type.length - 2) &&
      !type.includes("<", type.length - 2) &&
      !type.includes("-", type.length - 2)
    ) {
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
          if (this.apps[appName]._attribute_names[index].includes(">", this
              .apps[appName]._attribute_names[index].length - 2)) {
            const appRelationList = this.apps[appName][this.apps[appName]._attribute_names[
              index]];
            for (let index = 0; index < appRelationList.length; index++) {
              const relation = appRelationList[index];
              res.push(relation);
            }
          }
        } else {
          const appRelationList = this.apps[appName][this.apps[appName]._attribute_names[
            index]];
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
    let appName = ""
    if (typeof app != "string")
      appName = app.name.get()
    else
      appName = app
    return this.getRelationsByAppName(appName, asParent)
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
        const appRelationList = this.apps[appName][this.apps[appName]._attribute_names[
          index]];
        for (let index = 0; index < appRelationList.length; index++) {
          const relation = appRelationList[index];
          if (relation.type.get() === relationType) res.push(relation);
          else if (!relation.isDirected.get() && relation.type.get() +
            "-" === relationType) res.push(relation);
          else if (relation.type.get() + ">" === relationType) res.push(
            relation);
          else if (relation.type.get() + "<" === relationType) res.push(
            relation);
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

    let appName = app.name.get()
    return this.getRelationsByAppNameByType(appName, relationType)

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
    let appName = ""
    if (typeof app != "string")
      appName = app.name.get()
    else
      appName = app
    let neighbors = [];
    let relations = null
    if (typeof relationType == "undefined" && typeof appName == "undefined")
      relations = this.getRelations();
    else if (typeof relationType != "undefined" && typeof appName ==
      "undefined")
      relations = this.getRelationsByType(relationType);
    else if (typeof relationType == "undefined" && typeof appName !=
      "undefined")
      relations = this.getRelationsByApp(appName);
    else
      relations = this.getRelationsByAppNameByType(appName, relationType);
    for (let index = 0; index < relations.length; index++) {
      const relation = relations[index];
      if (relation.isDirected.get()) {
        if (this.inNodeList(relation.nodeList1))
          neighbors = Utilities.concat(neighbors, relation.nodeList2);
        else neighbors = Utilities.concat(neighbors, relation.nodeList1);
      } else {
        neighbors = Utilities.concat(
          neighbors,
          Utilities.allButMeById(relation.nodeList1, this)
        );
        neighbors = Utilities.concat(
          neighbors,
          Utilities.allButMeById(relation.nodeList2, this)
        );
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
    let res = []
    if (this.hasChildren(app)) {
      let relations = this.getRelationsByApp(app, true);
      for (let index = 0; index < relations.length; index++) {
        const relation = relations[index];
        res = res.concat(this.getChildrenByAppByRelation(app, relation))
      }
    }
    return res
  }

  /**
   *
   *
   * @param {SpinalApplication | string} app
   * @returns an Object of children filtered by relationType
   * @memberof SpinalNode
   */
  getChildrenByAppFiltered(app) {
    let res = {}
    if (this.hasChildren(app)) {
      let relations = this.getRelationsByApp(app, true);
      for (let index = 0; index < relations.length; index++) {
        const relation = relations[index];
        res[relation.type.get()] = this.getChildrenByAppByRelation(app,
          relation)
      }
    }
    return res
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
      let appName = ""
      if (typeof app != "string")
        appName = app.name.get()
      else
        appName = app
      if (this.hasAppDefined(appName)) {
        for (let index = 0; index < this.apps[appName]._attribute_names.length; index++) {
          const prop = this.apps[appName]._attribute_names[index]
          const relationLst = this.apps[appName][prop];
          if (prop.includes(">", prop.length - 2))
            if (relationLst.length > 0)
              return true
        }
      }
      return false;
    }
    for (let index = 0; index < this.relations._attribute_names.length; index++) {
      const relationsName = this.relations._attribute_names[index];
      if (relationsName.includes(">", relationsName.length - 2))
        return true
    }
    return false
  }

  /**
   *
   *
   * @param {string} relationType
   * @returns array of spinalNode
   * @memberof SpinalNode
   */
  getChildrenByRelationType(relationType) {
    let res = []
    if (this.relations[relationType + ">"])
      for (let index = 0; index < this.relations[relationType + ">"].length; index++) {
        const relation = this.relations[relationType + ">"][index];
        let nodeList2 = relation.getNodeList2();
        res = Utilities.concat(res, nodeList2)
      }
    return res
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
    let nodeList1 = relation.getNodeList1()
    return Utilities.containsLstById(nodeList1, this)
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
    let appName = ""
    let relationType = ""
    let res = []
    if (typeof app != "string")
      appName = app.name.get()
    else
      appName = app
    if (Array.isArray(relation)) {
      for (let index = 0; index < relation.length; index++) {
        const rel = relation[index];
        res = res.concat(this.getChildrenByAppByRelation(app, rel))
      }
      return res;
    } else if (typeof relation != "string")
      relationType = relation.type.get()
    else
      relationType = relation
    if (typeof this.apps[appName] != "undefined" && typeof this.apps[
        appName][relationType + ">"] != "undefined") {
      for (let index = 0; index < this.apps[appName][relationType + ">"].length; index++) {
        const relation = this.apps[appName][relationType + ">"][index];
        let nodeList2 = relation.getNodeList2()
        res = Utilities.concat(res, nodeList2)
      }
    }
    return res
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
    let appName = ""
    let relationType = ""
    let res = []
    if (typeof app != "string")
      appName = app.name.get()
    else
      appName = app
    if (typeof relation != "string")
      relationType = relation.type.get()
    else
      relationType = relation
    if (typeof this.apps[appName] != "undefined" && typeof this.apps[
        appName][relationType + ">"] != "undefined") {
      let relationTmp = this.apps[appName][relationType + ">"]
      let nodeList2 = relationTmp.getNodeList2()
      for (let index = 0; index < nodeList2.length; index++) {
        const node = nodeList2[index];
        res.push(await node.getElement())
      }
    }
    return res
  }

  /**
   *
   *
   * @param {string} relationType
   * @returns A promise of an array of Models
   * @memberof SpinalNode
   */
  async getChildrenElementsByRelationType(relationType) {
    let res = []
    if (this.relations[relationType + ">"])
      for (let index = 0; index < this.relations[relationType + ">"].length; index++) {
        const relation = this.relations[relationType + ">"][index];
        let nodeList2 = relation.getNodeList2();
        for (let index = 0; index < nodeList2.length; index++) {
          const node = nodeList2[index];
          res.push(await Utilities.promiseLoad(node.element))
        }
      }
    return res
  }

  /**
   *
   *
   * @param {string} relationType
   * @returns array of spinalNode
   * @memberof SpinalNode
   */
  getParentsByRelationType(relationType) {
    let res = []
    if (this.relations[relationType + "<"])
      for (let index = 0; index < this.relations[relationType + "<"].length; index++) {
        const relation = this.relations[relationType + "<"][index];
        let nodeList1 = relation.getNodeList1();
        res = Utilities.concat(res, nodeList1)
      }
    return res
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
    let relationType = ""
    if (typeof relation != 'string')
      relationType = relation.type.get()
    else relationType = relation

    let appName = ""
    if (typeof app != 'string')
      appName = app.name.get()
    else appName = app

    if (typeof isDirected != "undefined")
      if (isDirected)
        relationType = relationType.concat('<')
    else
      relationType = relationType.concat('-')
    if (typeof this.relations[relationType] != "undefined") {
      let relationLst = this.relations[relationType];
      for (let index = 0; index < relationLst.length; index++) {
        const candidateRelation = relationLst[index];
        if (relation.id.get() === candidateRelation.id.get())
          relationLst.splice(index, 1);
      }
    }
    if (this.hasAppDefined(appName) &&
      typeof this.apps[appName][relationType] != "undefined") {
      let relationLst = this.apps[appName][relationType];
      for (let index = 0; index < relationLst.length; index++) {
        const candidateRelation = relationLst[index];
        if (relation.id.get() === candidateRelation.id.get())
          relationLst.splice(index, 1);
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
    if (Array.isArray(relationType) || relationType instanceof Lst)
      for (let index = 0; index < relationType.length; index++) {
        const type = relationType[index];
        this.relations.rem_attr(type);
      }
    else {
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
    if (typeof this.apps[appName] !== "undefined")
      return true
    else {
      console.warn("app " + appName +
        " is not defined for node " + this.name.get());
      return false
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
    if (this.hasAppDefined(appName) && typeof this.apps[appName][
        relationType
      ] !==
      "undefined" || this.hasAppDefined(appName) && typeof this.apps[
        appName][
        relationType + "-"
      ] !==
      "undefined" || this.hasAppDefined(appName) && typeof this.apps[
        appName][
        relationType + ">"
      ] !==
      "undefined" || this.hasAppDefined(appName) && typeof this.apps[
        appName][
        relationType + "<"
      ] !==
      "undefined")
      return true
    else {
      console.warn("relation " + relationType +
        " is not defined for node " + this.name.get() +
        " for application " + appName);
      return false
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
    let element = await Utilities.promiseLoad(this.element);
    return element.toIfc();
  }
}
export default SpinalNode
spinalCore.register_models([SpinalNode]);