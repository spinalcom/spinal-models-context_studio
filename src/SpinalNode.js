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
   * @param {Model} element - any subClass of Model
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
        if (Array.isArray(_relations) || _relations instanceof Lst)
          this.addRelations(_relations);
        else this.addRelation(_relations);
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
   * @param {string} name -relation Name if not organilly defined
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
        if (typeof this.apps[appName] !== "undefined")
          this.apps[appName].add_attr({
            [relation.type.get()]: relation
          });
        else {
          let list = new Model();
          list.add_attr({
            [relation.type.get()]: relation
          });
          this.apps.add_attr({
            [appName]: list
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
   * @param {Model} element - and subClass of Model
   * @param {boolean} [isDirected=false]
   * @returns the created relation, undefined otherwise
   * @memberof SpinalNode
   */
  addSimpleRelation(relationType, element, isDirected = false) {
    if (!this.relatedGraph.isReserved(relationType)) {
      let node2 = this.relatedGraph.addNode(element);
      let rel = new SpinalRelation(relationType, [this], [node2],
        isDirected);
      this.relatedGraph.addRelation(rel);
      return rel;
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
   * @param {Model} element
   * @param {boolean} [isDirected=false]
   * @returns the created relation
   * @memberof SpinalNode
   */
  addSimpleRelationByApp(appName, relationType, element, isDirected = false) {
    if (this.relatedGraph.hasReservationCredentials(relationType, appName)) {
      if (this.relatedGraph.containsApp(appName)) {
        let node2 = this.relatedGraph.addNode(element);
        let rel = new SpinalRelation(relationType, [this], [node2],
          isDirected);
        this.relatedGraph.addRelation(rel, appName);
        return rel;
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
   * @param {Model} element - any subClass of Model
   * @param {boolean} [isDirected=false]
   * @param {boolean} [asParent=false]
   * @returns the relation with the added element node in (nodeList2)
   * @memberof SpinalNode
   */
  addToExistingRelation(
    relationType,
    element,
    isDirected = false,
    asParent = false
  ) {
    if (!this.relatedGraph.isReserved(relationType)) {
      let node2 = this.relatedGraph.addNode(element);
      let existingRelations = this.getRelations();
      for (let index = 0; index < existingRelations.length; index++) {
        const relation = existingRelations[index];
        if (
          relationType === relationType &&
          isDirected === relation.isDirected.get()
        ) {
          if (isDirected) {
            if (asParent) {
              relation.addNodetoNodeList1(node2);
              node2.addDirectedRelationParent(relation);
              return relation;
            } else {
              relation.addNodetoNodeList2(node2);
              node2.addDirectedRelationChild(relation);
              return relation;
            }
          } else {
            relation.addNodetoNodeList2(node2);
            node2.addNonDirectedRelation(relation);
            return relation;
          }
        }
      }
      let rel = this.addSimpleRelation(relationType, element, isDirected);
      return rel;
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
   * @param {Model} element - any subClass of Model
   * @param {boolean} [isDirected=false]
   * @param {boolean} [asParent=false]
   * @returns the relation with the added element node in (nodeList2)
   * @memberof SpinalNode
   */
  addToExistingRelationByApp(
    appName,
    relationType,
    element,
    isDirected = false,
    asParent = false
  ) {
    if (this.relatedGraph.hasReservationCredentials(relationType, appName)) {
      if (this.relatedGraph.containsApp(appName)) {
        let node2 = this.relatedGraph.addNode(element);
        if (typeof this.apps[appName] !== "undefined") {
          let appRelations = this.getRelationsByAppName(appName);
          for (let index = 0; index < appRelations.length; index++) {
            const relation = appRelations[index];
            if (
              relation.type.get() === relationType &&
              isDirected === relation.isDirected.get()
            ) {
              if (isDirected) {
                if (asParent) {
                  relation.addNodetoNodeList1(node2);
                  node2.addDirectedRelationParent(relation, appName);
                  return relation;
                } else {
                  relation.addNodetoNodeList2(node2);
                  node2.addDirectedRelationChild(relation, appName);
                  return relation;
                }
              } else {
                relation.addNodetoNodeList2(node2);
                node2.addNonDirectedRelation(relation, appName);
                return relation;
              }
            }
          }
        }
        let rel = this.addSimpleRelationByApp(
          appName,
          relationType,
          element,
          isDirected
        );
        return rel;
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
    if (!type.includes(">", type.length - 2) &&
      !type.includes("<", type.length - 2) &&
      !type.includes("-", type.length - 2)
    ) {
      let t1 = type.concat(">");
      res = Utilities.concat(res, this.getRelations(t1));
      let t2 = type.concat("<");
      res = Utilities.concat(res, this.getRelations(t2));
      let t3 = type.concat("-");
      res = Utilities.concat(res, this.getRelations(t3));
    }
    if (typeof this.relations[type] !== "undefined") res = this.relations[
      type];
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
        const appRelation = this.apps[appName][this.apps[appName]._attribute_names[
          index]];
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
    let appName = app.name.get()
    return this.getRelationsByAppName(appName)
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
        const appRelation = this.apps[appName][this.apps[appName]._attribute_names[
          index]];
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
        if (this.inNodeList(relation.nodeList1))
          neighbors = Utilities.concat(neighbors, relation.nodeList2);
        else neighbors = Utilities.concat(neighbors, relation.nodeList1);
      } else {
        neighbors = Utilities.concat(
          neighbors,
          Utilities.allButMeById(relation.nodeList1)
        );
        neighbors = Utilities.concat(
          neighbors,
          Utilities.allButMeById(relation.nodeList2)
        );
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

  hasAppDefined(appName) {
    if (typeof this.apps[appName] !== "undefined")
      return true
    else {
      console.warn("app " + appName +
        " is not defined for node " + this.name.get());
      return false
    }
  }

  hasRelationByAppByTypeDefined(appName, relationType) {
    if (this.hasAppDefined(appName) && typeof this.apps[appName][
        relationType
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

  toJson() {
    return {
      id: this.id.get(),
      name: this.name.get(),
      element: null
    };
  }

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

  async toIfc() {
    let element = await Utilities.promiseLoad(this.element);
    return element.toIfc();
  }
}
export default SpinalNode
spinalCore.register_models([SpinalNode]);