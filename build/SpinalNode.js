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
   * @param {string} name -relation Name if not organilly defined
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
          [relation.type.get()]: relation
        });else {
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
      let node2 = this.relatedGraph.addNode(element);
      let rel = new _SpinalRelation2.default(relationType, [this], [node2], isDirected);
      this.relatedGraph.addRelation(rel);
      return rel;
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
        let node2 = this.relatedGraph.addNode(element);
        let rel = new _SpinalRelation2.default(relationType, [this], [node2], isDirected);
        this.relatedGraph.addRelation(rel, appName);
        return rel;
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
   * @returns the relation with the added element node in (nodeList2)
   * @memberof SpinalNode
   */
  addToExistingRelation(relationType, element, isDirected = false, asParent = false) {
    if (!this.relatedGraph.isReserved(relationType)) {
      let node2 = this.relatedGraph.addNode(element);
      let existingRelations = this.getRelations();
      for (let index = 0; index < existingRelations.length; index++) {
        const relation = existingRelations[index];
        if (relationType === relationType && isDirected === relation.isDirected.get()) {
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
   * @returns the relation with the added element node in (nodeList2)
   * @memberof SpinalNode
   */
  addToExistingRelationByApp(appName, relationType, element, isDirected = false, asParent = false) {
    if (this.relatedGraph.hasReservationCredentials(relationType, appName)) {
      if (this.relatedGraph.containsApp(appName)) {
        let node2 = this.relatedGraph.addNode(element);
        if (typeof this.apps[appName] !== "undefined") {
          let appRelations = this.getRelationsByAppName(appName);
          for (let index = 0; index < appRelations.length; index++) {
            const relation = appRelations[index];
            if (relation.type.get() === relationType && isDirected === relation.isDirected.get()) {
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
        let rel = this.addSimpleRelationByApp(appName, relationType, element, isDirected);
        return rel;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TcGluYWxOb2RlLmpzIl0sIm5hbWVzIjpbInNwaW5hbENvcmUiLCJyZXF1aXJlIiwiZ2xvYmFsVHlwZSIsIndpbmRvdyIsImdsb2JhbCIsImdldFZpZXdlciIsInYiLCJTcGluYWxOb2RlIiwiTW9kZWwiLCJjb25zdHJ1Y3RvciIsIl9uYW1lIiwiZWxlbWVudCIsInJlbGF0ZWRHcmFwaCIsInJlbGF0aW9ucyIsIm5hbWUiLCJGaWxlU3lzdGVtIiwiX3NpZ19zZXJ2ZXIiLCJhZGRfYXR0ciIsIlB0ciIsImFwcHMiLCJjbGFzc2lmeU5vZGUiLCJfcmVsYXRpb25zIiwiQXJyYXkiLCJpc0FycmF5IiwiTHN0IiwiYWRkUmVsYXRpb25zIiwiYWRkUmVsYXRpb24iLCJnZXRBcHBzTmFtZXMiLCJfYXR0cmlidXRlX25hbWVzIiwiZ2V0QXBwcyIsInJlcyIsImluZGV4IiwibGVuZ3RoIiwiYXBwTmFtZSIsInB1c2giLCJVdGlsaXRpZXMiLCJwcm9taXNlTG9hZCIsImFwcHNMaXN0IiwiaGFzUmVsYXRpb24iLCJhZGREaXJlY3RlZFJlbGF0aW9uUGFyZW50IiwicmVsYXRpb24iLCJ0eXBlIiwiZ2V0IiwiY29uY2F0IiwiYWRkUmVsYXRpb25CeUFwcCIsImFkZERpcmVjdGVkUmVsYXRpb25DaGlsZCIsImFkZE5vbkRpcmVjdGVkUmVsYXRpb24iLCJpc1Jlc2VydmVkIiwibmFtZVRtcCIsImxpc3QiLCJjb25zb2xlIiwibG9nIiwicmVzZXJ2ZWRSZWxhdGlvbnNOYW1lcyIsImhhc1Jlc2VydmF0aW9uQ3JlZGVudGlhbHMiLCJjb250YWluc0FwcCIsImVycm9yIiwiYWRkU2ltcGxlUmVsYXRpb24iLCJyZWxhdGlvblR5cGUiLCJpc0RpcmVjdGVkIiwibm9kZTIiLCJhZGROb2RlIiwicmVsIiwiU3BpbmFsUmVsYXRpb24iLCJhZGRTaW1wbGVSZWxhdGlvbkJ5QXBwIiwiYWRkVG9FeGlzdGluZ1JlbGF0aW9uIiwiYXNQYXJlbnQiLCJleGlzdGluZ1JlbGF0aW9ucyIsImdldFJlbGF0aW9ucyIsImFkZE5vZGV0b05vZGVMaXN0MSIsImFkZE5vZGV0b05vZGVMaXN0MiIsImFkZFRvRXhpc3RpbmdSZWxhdGlvbkJ5QXBwIiwiYXBwUmVsYXRpb25zIiwiZ2V0UmVsYXRpb25zQnlBcHBOYW1lIiwiX2NsYXNzaWZ5UmVsYXRpb24iLCJfcmVsYXRpb24iLCJsb2FkIiwiaSIsInJlbExpc3QiLCJqIiwiZ2V0UmVsYXRpb25zQnlUeXBlIiwiaW5jbHVkZXMiLCJ0MSIsInQyIiwidDMiLCJoYXNBcHBEZWZpbmVkIiwiYXBwUmVsYXRpb24iLCJnZXRSZWxhdGlvbnNCeUFwcCIsImFwcCIsImdldFJlbGF0aW9uc0J5QXBwTmFtZUJ5VHlwZSIsImhhc1JlbGF0aW9uQnlBcHBCeVR5cGVEZWZpbmVkIiwiZ2V0UmVsYXRpb25zQnlBcHBCeVR5cGUiLCJpbk5vZGVMaXN0IiwiX25vZGVsaXN0IiwiaWQiLCJnZXROZWlnaGJvcnMiLCJuZWlnaGJvcnMiLCJub2RlTGlzdDEiLCJub2RlTGlzdDIiLCJhbGxCdXRNZUJ5SWQiLCJyZW1vdmVSZWxhdGlvbiIsInJlbGF0aW9uTHN0IiwiY2FuZGlkYXRlUmVsYXRpb24iLCJzcGxpY2UiLCJyZW1vdmVSZWxhdGlvbnMiLCJyZW1vdmVSZWxhdGlvblR5cGUiLCJyZW1fYXR0ciIsIndhcm4iLCJ0b0pzb24iLCJ0b0pzb25XaXRoUmVsYXRpb25zIiwidG9JZmMiLCJyZWdpc3Rlcl9tb2RlbHMiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUVBOzs7O0FBS0E7Ozs7QUFQQSxNQUFNQSxhQUFhQyxRQUFRLHlCQUFSLENBQW5CO0FBQ0EsTUFBTUMsYUFBYSxPQUFPQyxNQUFQLEtBQWtCLFdBQWxCLEdBQWdDQyxNQUFoQyxHQUF5Q0QsTUFBNUQ7O0FBRUEsSUFBSUUsWUFBWSxZQUFXO0FBQ3pCLFNBQU9ILFdBQVdJLENBQWxCO0FBQ0QsQ0FGRDs7QUFPQTs7Ozs7OztBQU9BLE1BQU1DLFVBQU4sU0FBeUJMLFdBQVdNLEtBQXBDLENBQTBDO0FBQ3hDOzs7Ozs7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QUVMNUIsWUFBTSxLQUFLQSxJQUFMLENBQVU0QixHQUFWLEVBRkQ7QUFHTC9CLGVBQVMsSUFISjtBQUlMRSxpQkFBV0E7QUFKTixLQUFQO0FBTUQ7QUFDRDs7Ozs7O0FBTUEsUUFBTWdHLEtBQU4sR0FBYztBQUNaLFFBQUlsRyxVQUFVLE1BQU13QixxQkFBVUMsV0FBVixDQUFzQixLQUFLekIsT0FBM0IsQ0FBcEI7QUFDQSxXQUFPQSxRQUFRa0csS0FBUixFQUFQO0FBQ0Q7QUE3c0J1QztrQkErc0IzQnRHLFU7O0FBQ2ZQLFdBQVc4RyxlQUFYLENBQTJCLENBQUN2RyxVQUFELENBQTNCIiwiZmlsZSI6IlNwaW5hbE5vZGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBzcGluYWxDb3JlID0gcmVxdWlyZShcInNwaW5hbC1jb3JlLWNvbm5lY3RvcmpzXCIpO1xuY29uc3QgZ2xvYmFsVHlwZSA9IHR5cGVvZiB3aW5kb3cgPT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB3aW5kb3c7XG5pbXBvcnQgU3BpbmFsUmVsYXRpb24gZnJvbSBcIi4vU3BpbmFsUmVsYXRpb25cIjtcbmxldCBnZXRWaWV3ZXIgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGdsb2JhbFR5cGUudjtcbn07XG5cbmltcG9ydCB7XG4gIFV0aWxpdGllc1xufSBmcm9tIFwiLi9VdGlsaXRpZXNcIjtcbi8qKlxuICpcbiAqXG4gKiBAZXhwb3J0XG4gKiBAY2xhc3MgU3BpbmFsTm9kZVxuICogQGV4dGVuZHMge01vZGVsfVxuICovXG5jbGFzcyBTcGluYWxOb2RlIGV4dGVuZHMgZ2xvYmFsVHlwZS5Nb2RlbCB7XG4gIC8qKlxuICAgKkNyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgU3BpbmFsTm9kZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHBhcmFtIHtNb2RlbH0gZWxlbWVudCAtIGFueSBzdWJjbGFzcyBvZiBNb2RlbFxuICAgKiBAcGFyYW0ge1NwaW5hbEdyYXBofSByZWxhdGVkR3JhcGhcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbltdfSByZWxhdGlvbnNcbiAgICogQHBhcmFtIHtzdHJpbmd9IFtuYW1lPVwiU3BpbmFsTm9kZVwiXVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgY29uc3RydWN0b3IoX25hbWUsIGVsZW1lbnQsIHJlbGF0ZWRHcmFwaCwgcmVsYXRpb25zLCBuYW1lID0gXCJTcGluYWxOb2RlXCIpIHtcbiAgICBzdXBlcigpO1xuICAgIGlmIChGaWxlU3lzdGVtLl9zaWdfc2VydmVyKSB7XG4gICAgICB0aGlzLmFkZF9hdHRyKHtcbiAgICAgICAgbmFtZTogX25hbWUsXG4gICAgICAgIGVsZW1lbnQ6IG5ldyBQdHIoZWxlbWVudCksXG4gICAgICAgIHJlbGF0aW9uczogbmV3IE1vZGVsKCksXG4gICAgICAgIGFwcHM6IG5ldyBNb2RlbCgpLFxuICAgICAgICByZWxhdGVkR3JhcGg6IHJlbGF0ZWRHcmFwaFxuICAgICAgfSk7XG4gICAgICBpZiAodHlwZW9mIHRoaXMucmVsYXRlZEdyYXBoICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHRoaXMucmVsYXRlZEdyYXBoLmNsYXNzaWZ5Tm9kZSh0aGlzKTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgX3JlbGF0aW9ucyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShfcmVsYXRpb25zKSB8fCBfcmVsYXRpb25zIGluc3RhbmNlb2YgTHN0KVxuICAgICAgICAgIHRoaXMuYWRkUmVsYXRpb25zKF9yZWxhdGlvbnMpO1xuICAgICAgICBlbHNlIHRoaXMuYWRkUmVsYXRpb24oX3JlbGF0aW9ucyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gcmVnaXN0ZXJBcHAoYXBwKSB7XG4gIC8vICAgdGhpcy5hcHBzLmFkZF9hdHRyKHtcbiAgLy8gICAgIFthcHAubmFtZS5nZXQoKV06IG5ldyBQdHIoYXBwKVxuICAvLyAgIH0pXG4gIC8vIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEByZXR1cm5zIGFsbCBhcHBsaWNhdGlvbnMgbmFtZXMgYXMgc3RyaW5nXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBnZXRBcHBzTmFtZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuYXBwcy5fYXR0cmlidXRlX25hbWVzO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyBhbGwgYXBwbGljYXRpb25zXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhc3luYyBnZXRBcHBzKCkge1xuICAgIGxldCByZXMgPSBbXVxuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLmFwcHMuX2F0dHJpYnV0ZV9uYW1lcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IGFwcE5hbWUgPSB0aGlzLmFwcHMuX2F0dHJpYnV0ZV9uYW1lc1tpbmRleF07XG4gICAgICByZXMucHVzaChhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQodGhpcy5yZWxhdGVkR3JhcGguYXBwc0xpc3RbXG4gICAgICAgIGFwcE5hbWVdKSlcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICAvLyAvKipcbiAgLy8gICpcbiAgLy8gICpcbiAgLy8gICogQHBhcmFtIHsqfSByZWxhdGlvblR5cGVcbiAgLy8gICogQHBhcmFtIHsqfSByZWxhdGlvblxuICAvLyAgKiBAcGFyYW0geyp9IGFzUGFyZW50XG4gIC8vICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gIC8vICAqL1xuICAvLyBjaGFuZ2VEZWZhdWx0UmVsYXRpb24ocmVsYXRpb25UeXBlLCByZWxhdGlvbiwgYXNQYXJlbnQpIHtcbiAgLy8gICAgIGlmIChyZWxhdGlvbi5pc0RpcmVjdGVkLmdldCgpKSB7XG4gIC8vICAgICAgIGlmIChhc1BhcmVudCkge1xuICAvLyAgICAgICAgIFV0aWxpdGllcy5wdXRPblRvcExzdCh0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIj5cIl0sIHJlbGF0aW9uKTtcbiAgLy8gICAgICAgfSBlbHNlIHtcbiAgLy8gICAgICAgICBVdGlsaXRpZXMucHV0T25Ub3BMc3QodGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCI8XCJdLCByZWxhdGlvbik7XG4gIC8vICAgICAgIH1cbiAgLy8gICAgIH0gZWxzZSB7XG4gIC8vICAgICAgIFV0aWxpdGllcy5wdXRPblRvcExzdCh0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIi1cIl0sIHJlbGF0aW9uKTtcbiAgLy8gICAgIH1cbiAgLy8gICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBoYXNSZWxhdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5yZWxhdGlvbnMubGVuZ3RoICE9PSAwO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9ufSByZWxhdGlvblxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYWRkRGlyZWN0ZWRSZWxhdGlvblBhcmVudChyZWxhdGlvbiwgYXBwTmFtZSkge1xuICAgIGxldCBuYW1lID0gcmVsYXRpb24udHlwZS5nZXQoKTtcbiAgICBuYW1lID0gbmFtZS5jb25jYXQoXCI+XCIpO1xuICAgIGlmICh0eXBlb2YgYXBwTmFtZSA9PT0gXCJ1bmRlZmluZWRcIikgdGhpcy5hZGRSZWxhdGlvbihyZWxhdGlvbiwgbmFtZSk7XG4gICAgZWxzZSB0aGlzLmFkZFJlbGF0aW9uQnlBcHAocmVsYXRpb24sIG5hbWUsIGFwcE5hbWUpO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9ufSByZWxhdGlvblxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYWRkRGlyZWN0ZWRSZWxhdGlvbkNoaWxkKHJlbGF0aW9uLCBhcHBOYW1lKSB7XG4gICAgbGV0IG5hbWUgPSByZWxhdGlvbi50eXBlLmdldCgpO1xuICAgIG5hbWUgPSBuYW1lLmNvbmNhdChcIjxcIik7XG4gICAgaWYgKHR5cGVvZiBhcHBOYW1lID09PSBcInVuZGVmaW5lZFwiKSB0aGlzLmFkZFJlbGF0aW9uKHJlbGF0aW9uLCBuYW1lKTtcbiAgICBlbHNlIHRoaXMuYWRkUmVsYXRpb25CeUFwcChyZWxhdGlvbiwgbmFtZSwgYXBwTmFtZSk7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb259IHJlbGF0aW9uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhZGROb25EaXJlY3RlZFJlbGF0aW9uKHJlbGF0aW9uLCBhcHBOYW1lKSB7XG4gICAgbGV0IG5hbWUgPSByZWxhdGlvbi50eXBlLmdldCgpO1xuICAgIG5hbWUgPSBuYW1lLmNvbmNhdChcIi1cIik7XG4gICAgaWYgKHR5cGVvZiBhcHBOYW1lID09PSBcInVuZGVmaW5lZFwiKSB0aGlzLmFkZFJlbGF0aW9uKHJlbGF0aW9uLCBuYW1lKTtcbiAgICBlbHNlIHRoaXMuYWRkUmVsYXRpb25CeUFwcChyZWxhdGlvbiwgbmFtZSwgYXBwTmFtZSk7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb259IHJlbGF0aW9uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhZGRSZWxhdGlvbihyZWxhdGlvbiwgbmFtZSkge1xuICAgIGlmICghdGhpcy5yZWxhdGVkR3JhcGguaXNSZXNlcnZlZChyZWxhdGlvbi50eXBlLmdldCgpKSkge1xuICAgICAgbGV0IG5hbWVUbXAgPSByZWxhdGlvbi50eXBlLmdldCgpO1xuICAgICAgaWYgKHR5cGVvZiBuYW1lICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIG5hbWVUbXAgPSBuYW1lO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0aW9uc1tuYW1lVG1wXSAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgICAgdGhpcy5yZWxhdGlvbnNbbmFtZVRtcF0ucHVzaChyZWxhdGlvbik7XG4gICAgICBlbHNlIHtcbiAgICAgICAgbGV0IGxpc3QgPSBuZXcgTHN0KCk7XG4gICAgICAgIGxpc3QucHVzaChyZWxhdGlvbik7XG4gICAgICAgIHRoaXMucmVsYXRpb25zLmFkZF9hdHRyKHtcbiAgICAgICAgICBbbmFtZVRtcF06IGxpc3RcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICByZWxhdGlvbi50eXBlLmdldCgpICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uLnR5cGUuZ2V0KCldXG4gICAgICApO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbn0gcmVsYXRpb25cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLXJlbGF0aW9uIE5hbWUgaWYgbm90IG9yZ2FuaWxseSBkZWZpbmVkXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhZGRSZWxhdGlvbkJ5QXBwKHJlbGF0aW9uLCBuYW1lLCBhcHBOYW1lKSB7XG4gICAgaWYgKHRoaXMucmVsYXRlZEdyYXBoLmhhc1Jlc2VydmF0aW9uQ3JlZGVudGlhbHMocmVsYXRpb24udHlwZS5nZXQoKSxcbiAgICAgICAgYXBwTmFtZSkpIHtcbiAgICAgIGlmICh0aGlzLnJlbGF0ZWRHcmFwaC5jb250YWluc0FwcChhcHBOYW1lKSkge1xuICAgICAgICBsZXQgbmFtZVRtcCA9IHJlbGF0aW9uLnR5cGUuZ2V0KCk7XG4gICAgICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgIG5hbWVUbXAgPSBuYW1lO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5yZWxhdGlvbnNbbmFtZVRtcF0gIT09IFwidW5kZWZpbmVkXCIpXG4gICAgICAgICAgdGhpcy5yZWxhdGlvbnNbbmFtZVRtcF0ucHVzaChyZWxhdGlvbik7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGxldCBsaXN0ID0gbmV3IExzdCgpO1xuICAgICAgICAgIGxpc3QucHVzaChyZWxhdGlvbik7XG4gICAgICAgICAgdGhpcy5yZWxhdGlvbnMuYWRkX2F0dHIoe1xuICAgICAgICAgICAgW25hbWVUbXBdOiBsaXN0XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmFwcHNbYXBwTmFtZV0gIT09IFwidW5kZWZpbmVkXCIpXG4gICAgICAgICAgdGhpcy5hcHBzW2FwcE5hbWVdLmFkZF9hdHRyKHtcbiAgICAgICAgICAgIFtyZWxhdGlvbi50eXBlLmdldCgpXTogcmVsYXRpb25cbiAgICAgICAgICB9KTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgbGV0IGxpc3QgPSBuZXcgTW9kZWwoKTtcbiAgICAgICAgICBsaXN0LmFkZF9hdHRyKHtcbiAgICAgICAgICAgIFtyZWxhdGlvbi50eXBlLmdldCgpXTogcmVsYXRpb25cbiAgICAgICAgICB9KTtcbiAgICAgICAgICB0aGlzLmFwcHMuYWRkX2F0dHIoe1xuICAgICAgICAgICAgW2FwcE5hbWVdOiBsaXN0XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYXBwTmFtZSArIFwiIGRvZXMgbm90IGV4aXN0XCIpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb24udHlwZS5nZXQoKSArXG4gICAgICAgIFwiIGlzIHJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5yZWxhdGVkR3JhcGgucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvbi50eXBlLmdldCgpXVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHBhcmFtIHtNb2RlbH0gZWxlbWVudCAtIGFuZCBzdWJjbGFzcyBvZiBNb2RlbFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0RpcmVjdGVkPWZhbHNlXVxuICAgKiBAcmV0dXJucyB0aGUgY3JlYXRlZCByZWxhdGlvbiwgdW5kZWZpbmVkIG90aGVyd2lzZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYWRkU2ltcGxlUmVsYXRpb24ocmVsYXRpb25UeXBlLCBlbGVtZW50LCBpc0RpcmVjdGVkID0gZmFsc2UpIHtcbiAgICBpZiAoIXRoaXMucmVsYXRlZEdyYXBoLmlzUmVzZXJ2ZWQocmVsYXRpb25UeXBlKSkge1xuICAgICAgbGV0IG5vZGUyID0gdGhpcy5yZWxhdGVkR3JhcGguYWRkTm9kZShlbGVtZW50KTtcbiAgICAgIGxldCByZWwgPSBuZXcgU3BpbmFsUmVsYXRpb24ocmVsYXRpb25UeXBlLCBbdGhpc10sIFtub2RlMl0sXG4gICAgICAgIGlzRGlyZWN0ZWQpO1xuICAgICAgdGhpcy5yZWxhdGVkR3JhcGguYWRkUmVsYXRpb24ocmVsKTtcbiAgICAgIHJldHVybiByZWw7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICByZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVsYXRlZEdyYXBoLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHBhcmFtIHtNb2RlbH0gZWxlbWVudFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0RpcmVjdGVkPWZhbHNlXVxuICAgKiBAcmV0dXJucyB0aGUgY3JlYXRlZCByZWxhdGlvblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYWRkU2ltcGxlUmVsYXRpb25CeUFwcChhcHBOYW1lLCByZWxhdGlvblR5cGUsIGVsZW1lbnQsIGlzRGlyZWN0ZWQgPSBmYWxzZSkge1xuICAgIGlmICh0aGlzLnJlbGF0ZWRHcmFwaC5oYXNSZXNlcnZhdGlvbkNyZWRlbnRpYWxzKHJlbGF0aW9uVHlwZSwgYXBwTmFtZSkpIHtcbiAgICAgIGlmICh0aGlzLnJlbGF0ZWRHcmFwaC5jb250YWluc0FwcChhcHBOYW1lKSkge1xuICAgICAgICBsZXQgbm9kZTIgPSB0aGlzLnJlbGF0ZWRHcmFwaC5hZGROb2RlKGVsZW1lbnQpO1xuICAgICAgICBsZXQgcmVsID0gbmV3IFNwaW5hbFJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgW3RoaXNdLCBbbm9kZTJdLFxuICAgICAgICAgIGlzRGlyZWN0ZWQpO1xuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5hZGRSZWxhdGlvbihyZWwsIGFwcE5hbWUpO1xuICAgICAgICByZXR1cm4gcmVsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihhcHBOYW1lICsgXCIgZG9lcyBub3QgZXhpc3RcIik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICByZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVsYXRlZEdyYXBoLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHBhcmFtIHtNb2RlbH0gZWxlbWVudCAtIGFueSBzdWJjbGFzcyBvZiBNb2RlbFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0RpcmVjdGVkPWZhbHNlXVxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFthc1BhcmVudD1mYWxzZV1cbiAgICogQHJldHVybnMgdGhlIHJlbGF0aW9uIHdpdGggdGhlIGFkZGVkIGVsZW1lbnQgbm9kZSBpbiAobm9kZUxpc3QyKVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYWRkVG9FeGlzdGluZ1JlbGF0aW9uKFxuICAgIHJlbGF0aW9uVHlwZSxcbiAgICBlbGVtZW50LFxuICAgIGlzRGlyZWN0ZWQgPSBmYWxzZSxcbiAgICBhc1BhcmVudCA9IGZhbHNlXG4gICkge1xuICAgIGlmICghdGhpcy5yZWxhdGVkR3JhcGguaXNSZXNlcnZlZChyZWxhdGlvblR5cGUpKSB7XG4gICAgICBsZXQgbm9kZTIgPSB0aGlzLnJlbGF0ZWRHcmFwaC5hZGROb2RlKGVsZW1lbnQpO1xuICAgICAgbGV0IGV4aXN0aW5nUmVsYXRpb25zID0gdGhpcy5nZXRSZWxhdGlvbnMoKTtcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBleGlzdGluZ1JlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgcmVsYXRpb24gPSBleGlzdGluZ1JlbGF0aW9uc1tpbmRleF07XG4gICAgICAgIGlmIChcbiAgICAgICAgICByZWxhdGlvblR5cGUgPT09IHJlbGF0aW9uVHlwZSAmJlxuICAgICAgICAgIGlzRGlyZWN0ZWQgPT09IHJlbGF0aW9uLmlzRGlyZWN0ZWQuZ2V0KClcbiAgICAgICAgKSB7XG4gICAgICAgICAgaWYgKGlzRGlyZWN0ZWQpIHtcbiAgICAgICAgICAgIGlmIChhc1BhcmVudCkge1xuICAgICAgICAgICAgICByZWxhdGlvbi5hZGROb2RldG9Ob2RlTGlzdDEobm9kZTIpO1xuICAgICAgICAgICAgICBub2RlMi5hZGREaXJlY3RlZFJlbGF0aW9uUGFyZW50KHJlbGF0aW9uKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlbGF0aW9uO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVsYXRpb24uYWRkTm9kZXRvTm9kZUxpc3QyKG5vZGUyKTtcbiAgICAgICAgICAgICAgbm9kZTIuYWRkRGlyZWN0ZWRSZWxhdGlvbkNoaWxkKHJlbGF0aW9uKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlbGF0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZWxhdGlvbi5hZGROb2RldG9Ob2RlTGlzdDIobm9kZTIpO1xuICAgICAgICAgICAgbm9kZTIuYWRkTm9uRGlyZWN0ZWRSZWxhdGlvbihyZWxhdGlvbik7XG4gICAgICAgICAgICByZXR1cm4gcmVsYXRpb247XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBsZXQgcmVsID0gdGhpcy5hZGRTaW1wbGVSZWxhdGlvbihyZWxhdGlvblR5cGUsIGVsZW1lbnQsIGlzRGlyZWN0ZWQpO1xuICAgICAgcmV0dXJuIHJlbDtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIHJlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGlzIHJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5yZWxhdGVkR3JhcGgucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvblR5cGVdXG4gICAgICApO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFwcE5hbWVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcGFyYW0ge01vZGVsfSBlbGVtZW50IC0gYW55IHN1YmNsYXNzIG9mIE1vZGVsXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGlyZWN0ZWQ9ZmFsc2VdXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2FzUGFyZW50PWZhbHNlXVxuICAgKiBAcmV0dXJucyB0aGUgcmVsYXRpb24gd2l0aCB0aGUgYWRkZWQgZWxlbWVudCBub2RlIGluIChub2RlTGlzdDIpXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhZGRUb0V4aXN0aW5nUmVsYXRpb25CeUFwcChcbiAgICBhcHBOYW1lLFxuICAgIHJlbGF0aW9uVHlwZSxcbiAgICBlbGVtZW50LFxuICAgIGlzRGlyZWN0ZWQgPSBmYWxzZSxcbiAgICBhc1BhcmVudCA9IGZhbHNlXG4gICkge1xuICAgIGlmICh0aGlzLnJlbGF0ZWRHcmFwaC5oYXNSZXNlcnZhdGlvbkNyZWRlbnRpYWxzKHJlbGF0aW9uVHlwZSwgYXBwTmFtZSkpIHtcbiAgICAgIGlmICh0aGlzLnJlbGF0ZWRHcmFwaC5jb250YWluc0FwcChhcHBOYW1lKSkge1xuICAgICAgICBsZXQgbm9kZTIgPSB0aGlzLnJlbGF0ZWRHcmFwaC5hZGROb2RlKGVsZW1lbnQpO1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMuYXBwc1thcHBOYW1lXSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgIGxldCBhcHBSZWxhdGlvbnMgPSB0aGlzLmdldFJlbGF0aW9uc0J5QXBwTmFtZShhcHBOYW1lKTtcbiAgICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgYXBwUmVsYXRpb25zLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgY29uc3QgcmVsYXRpb24gPSBhcHBSZWxhdGlvbnNbaW5kZXhdO1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICByZWxhdGlvbi50eXBlLmdldCgpID09PSByZWxhdGlvblR5cGUgJiZcbiAgICAgICAgICAgICAgaXNEaXJlY3RlZCA9PT0gcmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgIGlmIChpc0RpcmVjdGVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFzUGFyZW50KSB7XG4gICAgICAgICAgICAgICAgICByZWxhdGlvbi5hZGROb2RldG9Ob2RlTGlzdDEobm9kZTIpO1xuICAgICAgICAgICAgICAgICAgbm9kZTIuYWRkRGlyZWN0ZWRSZWxhdGlvblBhcmVudChyZWxhdGlvbiwgYXBwTmFtZSk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcmVsYXRpb247XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHJlbGF0aW9uLmFkZE5vZGV0b05vZGVMaXN0Mihub2RlMik7XG4gICAgICAgICAgICAgICAgICBub2RlMi5hZGREaXJlY3RlZFJlbGF0aW9uQ2hpbGQocmVsYXRpb24sIGFwcE5hbWUpO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlbGF0aW9uO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZWxhdGlvbi5hZGROb2RldG9Ob2RlTGlzdDIobm9kZTIpO1xuICAgICAgICAgICAgICAgIG5vZGUyLmFkZE5vbkRpcmVjdGVkUmVsYXRpb24ocmVsYXRpb24sIGFwcE5hbWUpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZWxhdGlvbjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsZXQgcmVsID0gdGhpcy5hZGRTaW1wbGVSZWxhdGlvbkJ5QXBwKFxuICAgICAgICAgIGFwcE5hbWUsXG4gICAgICAgICAgcmVsYXRpb25UeXBlLFxuICAgICAgICAgIGVsZW1lbnQsXG4gICAgICAgICAgaXNEaXJlY3RlZFxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gcmVsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihhcHBOYW1lICsgXCIgZG9lcyBub3QgZXhpc3RcIik7XG4gICAgICB9XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uVHlwZV1cbiAgICAgICk7XG4gICAgfVxuICB9XG5cblxuXG5cbiAgLy8gYWRkUmVsYXRpb24yKF9yZWxhdGlvbiwgX25hbWUpIHtcbiAgLy8gICBsZXQgY2xhc3NpZnkgPSBmYWxzZTtcbiAgLy8gICBsZXQgbmFtZSA9IF9yZWxhdGlvbi50eXBlLmdldCgpO1xuICAvLyAgIGlmICh0eXBlb2YgX25hbWUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgLy8gICAgIG5hbWUgPSBfbmFtZTtcbiAgLy8gICB9XG4gIC8vICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0aW9uc1tfcmVsYXRpb24udHlwZS5nZXQoKV0gIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgLy8gICAgIGlmIChfcmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKSkge1xuICAvLyAgICAgICBmb3IgKFxuICAvLyAgICAgICAgIGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5yZWxhdGlvbnNbX3JlbGF0aW9uLnR5cGUuZ2V0KCldLmxlbmd0aDsgaW5kZXgrK1xuICAvLyAgICAgICApIHtcbiAgLy8gICAgICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5yZWxhdGlvbnNbX3JlbGF0aW9uLnR5cGUuZ2V0KCldW2luZGV4XTtcbiAgLy8gICAgICAgICBpZiAoXG4gIC8vICAgICAgICAgICBVdGlsaXRpZXMuYXJyYXlzRXF1YWwoXG4gIC8vICAgICAgICAgICAgIF9yZWxhdGlvbi5nZXROb2RlTGlzdDFJZHMoKSxcbiAgLy8gICAgICAgICAgICAgZWxlbWVudC5nZXROb2RlTGlzdDFJZHMoKVxuICAvLyAgICAgICAgICAgKVxuICAvLyAgICAgICAgICkge1xuICAvLyAgICAgICAgICAgZWxlbWVudC5hZGROb3RFeGlzdGluZ1ZlcnRpY2VzdG9Ob2RlTGlzdDIoX3JlbGF0aW9uLm5vZGVMaXN0Mik7XG4gIC8vICAgICAgICAgfSBlbHNlIHtcbiAgLy8gICAgICAgICAgIGVsZW1lbnQucHVzaChfcmVsYXRpb24pO1xuICAvLyAgICAgICAgICAgY2xhc3NpZnkgPSB0cnVlO1xuICAvLyAgICAgICAgIH1cbiAgLy8gICAgICAgfVxuICAvLyAgICAgfSBlbHNlIHtcbiAgLy8gICAgICAgdGhpcy5yZWxhdGlvbnNbX3JlbGF0aW9uLnR5cGUuZ2V0KCldLmFkZE5vdEV4aXN0aW5nVmVydGljZXN0b1JlbGF0aW9uKFxuICAvLyAgICAgICAgIF9yZWxhdGlvblxuICAvLyAgICAgICApO1xuICAvLyAgICAgfVxuICAvLyAgIH0gZWxzZSB7XG4gIC8vICAgICBpZiAoX3JlbGF0aW9uLmlzRGlyZWN0ZWQuZ2V0KCkpIHtcbiAgLy8gICAgICAgbGV0IGxpc3QgPSBuZXcgTHN0KCk7XG4gIC8vICAgICAgIGxpc3QucHVzaChfcmVsYXRpb24pO1xuICAvLyAgICAgICB0aGlzLnJlbGF0aW9ucy5hZGRfYXR0cih7XG4gIC8vICAgICAgICAgW25hbWVdOiBsaXN0XG4gIC8vICAgICAgIH0pO1xuICAvLyAgICAgICB0aGlzLl9jbGFzc2lmeVJlbGF0aW9uKF9yZWxhdGlvbik7XG4gIC8vICAgICB9IGVsc2Uge1xuICAvLyAgICAgICB0aGlzLnJlbGF0aW9ucy5hZGRfYXR0cih7XG4gIC8vICAgICAgICAgW25hbWVdOiBfcmVsYXRpb25cbiAgLy8gICAgICAgfSk7XG4gIC8vICAgICAgIGNsYXNzaWZ5ID0gdHJ1ZTtcbiAgLy8gICAgIH1cbiAgLy8gICB9XG4gIC8vICAgaWYgKGNsYXNzaWZ5KSB0aGlzLl9jbGFzc2lmeVJlbGF0aW9uKF9yZWxhdGlvbik7XG4gIC8vIH1cblxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbn0gX3JlbGF0aW9uXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBfY2xhc3NpZnlSZWxhdGlvbihfcmVsYXRpb24pIHtcbiAgICB0aGlzLnJlbGF0ZWRHcmFwaC5sb2FkKHJlbGF0ZWRHcmFwaCA9PiB7XG4gICAgICByZWxhdGVkR3JhcGguX2NsYXNzaWZ5UmVsYXRpb24oX3JlbGF0aW9uKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vVE9ETyA6Tm90V29ya2luZ1xuICAvLyBhZGRSZWxhdGlvbihfcmVsYXRpb24pIHtcbiAgLy8gICB0aGlzLmFkZFJlbGF0aW9uKF9yZWxhdGlvbilcbiAgLy8gICB0aGlzLnJlbGF0ZWRHcmFwaC5sb2FkKHJlbGF0ZWRHcmFwaCA9PiB7XG4gIC8vICAgICByZWxhdGVkR3JhcGguX2FkZE5vdEV4aXN0aW5nVmVydGljZXNGcm9tUmVsYXRpb24oX3JlbGF0aW9uKVxuICAvLyAgIH0pXG4gIC8vIH1cbiAgLy9UT0RPIDpOb3RXb3JraW5nXG4gIC8vIGFkZFJlbGF0aW9ucyhfcmVsYXRpb25zKSB7XG4gIC8vICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IF9yZWxhdGlvbnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gIC8vICAgICB0aGlzLmFkZFJlbGF0aW9uKF9yZWxhdGlvbnNbaW5kZXhdKTtcbiAgLy8gICB9XG4gIC8vIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEByZXR1cm5zIGFsbCB0aGUgcmVsYXRpb25zIG9mIHRoaXMgTm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgZ2V0UmVsYXRpb25zKCkge1xuICAgIGxldCByZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucmVsYXRpb25zLl9hdHRyaWJ1dGVfbmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHJlbExpc3QgPSB0aGlzLnJlbGF0aW9uc1t0aGlzLnJlbGF0aW9ucy5fYXR0cmlidXRlX25hbWVzW2ldXTtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcmVsTGlzdC5sZW5ndGg7IGorKykge1xuICAgICAgICBjb25zdCByZWxhdGlvbiA9IHJlbExpc3Rbal07XG4gICAgICAgIHJlcy5wdXNoKHJlbGF0aW9uKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAgICogQHJldHVybnMgYWxsIHJlbGF0aW9ucyBvZiBhIHNwZWNpZmljIHJlbGF0aW9uIHR5cGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGdldFJlbGF0aW9uc0J5VHlwZSh0eXBlKSB7XG4gICAgbGV0IHJlcyA9IFtdO1xuICAgIGlmICghdHlwZS5pbmNsdWRlcyhcIj5cIiwgdHlwZS5sZW5ndGggLSAyKSAmJlxuICAgICAgIXR5cGUuaW5jbHVkZXMoXCI8XCIsIHR5cGUubGVuZ3RoIC0gMikgJiZcbiAgICAgICF0eXBlLmluY2x1ZGVzKFwiLVwiLCB0eXBlLmxlbmd0aCAtIDIpXG4gICAgKSB7XG4gICAgICBsZXQgdDEgPSB0eXBlLmNvbmNhdChcIj5cIik7XG4gICAgICByZXMgPSBVdGlsaXRpZXMuY29uY2F0KHJlcywgdGhpcy5nZXRSZWxhdGlvbnModDEpKTtcbiAgICAgIGxldCB0MiA9IHR5cGUuY29uY2F0KFwiPFwiKTtcbiAgICAgIHJlcyA9IFV0aWxpdGllcy5jb25jYXQocmVzLCB0aGlzLmdldFJlbGF0aW9ucyh0MikpO1xuICAgICAgbGV0IHQzID0gdHlwZS5jb25jYXQoXCItXCIpO1xuICAgICAgcmVzID0gVXRpbGl0aWVzLmNvbmNhdChyZXMsIHRoaXMuZ2V0UmVsYXRpb25zKHQzKSk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgdGhpcy5yZWxhdGlvbnNbdHlwZV0gIT09IFwidW5kZWZpbmVkXCIpIHJlcyA9IHRoaXMucmVsYXRpb25zW1xuICAgICAgdHlwZV07XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFwcE5hbWVcbiAgICogQHJldHVybnMgYWxsIHJlbGF0aW9ucyBvZiBhIHNwZWNpZmljIGFwcFxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgZ2V0UmVsYXRpb25zQnlBcHBOYW1lKGFwcE5hbWUpIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgaWYgKHRoaXMuaGFzQXBwRGVmaW5lZChhcHBOYW1lKSkge1xuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMuYXBwc1thcHBOYW1lXS5fYXR0cmlidXRlX25hbWVzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCBhcHBSZWxhdGlvbiA9IHRoaXMuYXBwc1thcHBOYW1lXVt0aGlzLmFwcHNbYXBwTmFtZV0uX2F0dHJpYnV0ZV9uYW1lc1tcbiAgICAgICAgICBpbmRleF1dO1xuICAgICAgICByZXMucHVzaChhcHBSZWxhdGlvbik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsQXBwbGljYXRpb259IGFwcFxuICAgKiBAcmV0dXJucyBhbGwgcmVsYXRpb25zIG9mIGEgc3BlY2lmaWMgYXBwXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBnZXRSZWxhdGlvbnNCeUFwcChhcHApIHtcbiAgICBsZXQgYXBwTmFtZSA9IGFwcC5uYW1lLmdldCgpXG4gICAgcmV0dXJuIHRoaXMuZ2V0UmVsYXRpb25zQnlBcHBOYW1lKGFwcE5hbWUpXG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgYWxsIHJlbGF0aW9ucyBvZiBhIHNwZWNpZmljIGFwcCBvZiBhIHNwZWNpZmljIHR5cGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGdldFJlbGF0aW9uc0J5QXBwTmFtZUJ5VHlwZShhcHBOYW1lLCByZWxhdGlvblR5cGUpIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgaWYgKHRoaXMuaGFzUmVsYXRpb25CeUFwcEJ5VHlwZURlZmluZWQoYXBwTmFtZSwgcmVsYXRpb25UeXBlKSkge1xuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMuYXBwc1thcHBOYW1lXS5fYXR0cmlidXRlX25hbWVzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCBhcHBSZWxhdGlvbiA9IHRoaXMuYXBwc1thcHBOYW1lXVt0aGlzLmFwcHNbYXBwTmFtZV0uX2F0dHJpYnV0ZV9uYW1lc1tcbiAgICAgICAgICBpbmRleF1dO1xuICAgICAgICBpZiAoYXBwUmVsYXRpb24udHlwZS5nZXQoKSA9PT0gcmVsYXRpb25UeXBlKSByZXMucHVzaChhcHBSZWxhdGlvbik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsQXBwbGljYXRpb259IGFwcFxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEByZXR1cm5zIGFsbCByZWxhdGlvbnMgb2YgYSBzcGVjaWZpYyBhcHAgb2YgYSBzcGVjaWZpYyB0eXBlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBnZXRSZWxhdGlvbnNCeUFwcEJ5VHlwZShhcHAsIHJlbGF0aW9uVHlwZSkge1xuICAgIGxldCBhcHBOYW1lID0gYXBwLm5hbWUuZ2V0KClcbiAgICByZXR1cm4gdGhpcy5nZXRSZWxhdGlvbnNCeUFwcE5hbWVCeVR5cGUoYXBwTmFtZSwgcmVsYXRpb25UeXBlKVxuXG4gIH1cbiAgLyoqXG4gICAqICB2ZXJpZnkgaWYgYW4gZWxlbWVudCBpcyBhbHJlYWR5IGluIGdpdmVuIG5vZGVMaXN0XG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZVtdfSBfbm9kZWxpc3RcbiAgICogQHJldHVybnMgYm9vbGVhblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgaW5Ob2RlTGlzdChfbm9kZWxpc3QpIHtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX25vZGVsaXN0Lmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgZWxlbWVudCA9IF9ub2RlbGlzdFtpbmRleF07XG4gICAgICBpZiAoZWxlbWVudC5pZC5nZXQoKSA9PT0gdGhpcy5pZC5nZXQoKSkgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vVE9ETyBnZXRDaGlsZHJlbiwgZ2V0UGFyZW50XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlIC0gb3B0aW9uYWxcbiAgICogQHJldHVybnMgYSBsaXN0IG9mIG5laWdoYm9ycyBub2RlcyBcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGdldE5laWdoYm9ycyhyZWxhdGlvblR5cGUpIHtcbiAgICBsZXQgbmVpZ2hib3JzID0gW107XG4gICAgbGV0IHJlbGF0aW9ucyA9IHRoaXMuZ2V0UmVsYXRpb25zKHJlbGF0aW9uVHlwZSk7XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHJlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IHJlbGF0aW9uID0gcmVsYXRpb25zW2luZGV4XTtcbiAgICAgIGlmIChyZWxhdGlvbi5pc0RpcmVjdGVkLmdldCgpKSB7XG4gICAgICAgIGlmICh0aGlzLmluTm9kZUxpc3QocmVsYXRpb24ubm9kZUxpc3QxKSlcbiAgICAgICAgICBuZWlnaGJvcnMgPSBVdGlsaXRpZXMuY29uY2F0KG5laWdoYm9ycywgcmVsYXRpb24ubm9kZUxpc3QyKTtcbiAgICAgICAgZWxzZSBuZWlnaGJvcnMgPSBVdGlsaXRpZXMuY29uY2F0KG5laWdoYm9ycywgcmVsYXRpb24ubm9kZUxpc3QxKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5laWdoYm9ycyA9IFV0aWxpdGllcy5jb25jYXQoXG4gICAgICAgICAgbmVpZ2hib3JzLFxuICAgICAgICAgIFV0aWxpdGllcy5hbGxCdXRNZUJ5SWQocmVsYXRpb24ubm9kZUxpc3QxKVxuICAgICAgICApO1xuICAgICAgICBuZWlnaGJvcnMgPSBVdGlsaXRpZXMuY29uY2F0KFxuICAgICAgICAgIG5laWdoYm9ycyxcbiAgICAgICAgICBVdGlsaXRpZXMuYWxsQnV0TWVCeUlkKHJlbGF0aW9uLm5vZGVMaXN0MilcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5laWdoYm9ycztcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbn0gX3JlbGF0aW9uXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICByZW1vdmVSZWxhdGlvbihfcmVsYXRpb24pIHtcbiAgICBsZXQgcmVsYXRpb25Mc3QgPSB0aGlzLnJlbGF0aW9uc1tfcmVsYXRpb24udHlwZS5nZXQoKV07XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHJlbGF0aW9uTHN0Lmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgY2FuZGlkYXRlUmVsYXRpb24gPSByZWxhdGlvbkxzdFtpbmRleF07XG4gICAgICBpZiAoX3JlbGF0aW9uLmlkLmdldCgpID09PSBjYW5kaWRhdGVSZWxhdGlvbi5pZC5nZXQoKSlcbiAgICAgICAgcmVsYXRpb25Mc3Quc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb25bXX0gX3JlbGF0aW9uc1xuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgcmVtb3ZlUmVsYXRpb25zKF9yZWxhdGlvbnMpIHtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX3JlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHRoaXMucmVtb3ZlUmVsYXRpb24oX3JlbGF0aW9uc1tpbmRleF0pO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgcmVtb3ZlUmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHJlbGF0aW9uVHlwZSkgfHwgcmVsYXRpb25UeXBlIGluc3RhbmNlb2YgTHN0KVxuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHJlbGF0aW9uVHlwZS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgdHlwZSA9IHJlbGF0aW9uVHlwZVtpbmRleF07XG4gICAgICAgIHRoaXMucmVsYXRpb25zLnJlbV9hdHRyKHR5cGUpO1xuICAgICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5yZWxhdGlvbnMucmVtX2F0dHIocmVsYXRpb25UeXBlKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGhhc0FwcERlZmluZWQoYXBwTmFtZSkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5hcHBzW2FwcE5hbWVdICE9PSBcInVuZGVmaW5lZFwiKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICBlbHNlIHtcbiAgICAgIGNvbnNvbGUud2FybihcImFwcCBcIiArIGFwcE5hbWUgK1xuICAgICAgICBcIiBpcyBub3QgZGVmaW5lZCBmb3Igbm9kZSBcIiArIHRoaXMubmFtZS5nZXQoKSk7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgYm9vbGVhbiBcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGhhc1JlbGF0aW9uQnlBcHBCeVR5cGVEZWZpbmVkKGFwcE5hbWUsIHJlbGF0aW9uVHlwZSkge1xuICAgIGlmICh0aGlzLmhhc0FwcERlZmluZWQoYXBwTmFtZSkgJiYgdHlwZW9mIHRoaXMuYXBwc1thcHBOYW1lXVtcbiAgICAgICAgcmVsYXRpb25UeXBlXG4gICAgICBdICE9PVxuICAgICAgXCJ1bmRlZmluZWRcIilcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oXCJyZWxhdGlvbiBcIiArIHJlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGlzIG5vdCBkZWZpbmVkIGZvciBub2RlIFwiICsgdGhpcy5uYW1lLmdldCgpICtcbiAgICAgICAgXCIgZm9yIGFwcGxpY2F0aW9uIFwiICsgYXBwTmFtZSk7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEByZXR1cm5zIEEganNvbiByZXByZXNlbnRpbmcgdGhlIG5vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIHRvSnNvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IHRoaXMuaWQuZ2V0KCksXG4gICAgICBuYW1lOiB0aGlzLm5hbWUuZ2V0KCksXG4gICAgICBlbGVtZW50OiBudWxsXG4gICAgfTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgQSBqc29uIHJlcHJlc2VudGluZyB0aGUgbm9kZSB3aXRoIGl0cyByZWxhdGlvbnNcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIHRvSnNvbldpdGhSZWxhdGlvbnMoKSB7XG4gICAgbGV0IHJlbGF0aW9ucyA9IFtdO1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLmdldFJlbGF0aW9ucygpLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgcmVsYXRpb24gPSB0aGlzLmdldFJlbGF0aW9ucygpW2luZGV4XTtcbiAgICAgIHJlbGF0aW9ucy5wdXNoKHJlbGF0aW9uLnRvSnNvbigpKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiB0aGlzLmlkLmdldCgpLFxuICAgICAgbmFtZTogdGhpcy5uYW1lLmdldCgpLFxuICAgICAgZWxlbWVudDogbnVsbCxcbiAgICAgIHJlbGF0aW9uczogcmVsYXRpb25zXG4gICAgfTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgQW4gSUZDIGxpa2UgZm9ybWF0IHJlcHJlc2VudGluZyB0aGUgbm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYXN5bmMgdG9JZmMoKSB7XG4gICAgbGV0IGVsZW1lbnQgPSBhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQodGhpcy5lbGVtZW50KTtcbiAgICByZXR1cm4gZWxlbWVudC50b0lmYygpO1xuICB9XG59XG5leHBvcnQgZGVmYXVsdCBTcGluYWxOb2RlXG5zcGluYWxDb3JlLnJlZ2lzdGVyX21vZGVscyhbU3BpbmFsTm9kZV0pOyJdfQ==