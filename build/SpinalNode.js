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
          node2 = this.relatedGraph.addNode(element);
          res.node = node2;
          if (isDirected) {
            if (asParent) {
              relation.addNodetoNodeList1(node2);
              node2.addDirectedRelationParent(relation);
              return res;
            } else {
              relation.addNodetoNodeList2(node2);
              node2.addDirectedRelationChild(relation);
              return res;
            }
          } else {
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
              node2 = this.relatedGraph.addNode(element);
              res.node = node2;
              if (isDirected) {
                if (asParent) {
                  relation.addNodetoNodeList1(node2);
                  node2.addDirectedRelationParent(relation, appName);
                  return res;
                } else {
                  relation.addNodetoNodeList2(node2);
                  node2.addDirectedRelationChild(relation, appName);
                  return res;
                }
              } else {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TcGluYWxOb2RlLmpzIl0sIm5hbWVzIjpbInNwaW5hbENvcmUiLCJyZXF1aXJlIiwiZ2xvYmFsVHlwZSIsIndpbmRvdyIsImdsb2JhbCIsImdldFZpZXdlciIsInYiLCJTcGluYWxOb2RlIiwiTW9kZWwiLCJjb25zdHJ1Y3RvciIsIl9uYW1lIiwiZWxlbWVudCIsInJlbGF0ZWRHcmFwaCIsInJlbGF0aW9ucyIsIm5hbWUiLCJGaWxlU3lzdGVtIiwiX3NpZ19zZXJ2ZXIiLCJhZGRfYXR0ciIsIlB0ciIsImFwcHMiLCJjbGFzc2lmeU5vZGUiLCJfcmVsYXRpb25zIiwiQXJyYXkiLCJpc0FycmF5IiwiTHN0IiwiYWRkUmVsYXRpb25zIiwiYWRkUmVsYXRpb24iLCJnZXRBcHBzTmFtZXMiLCJfYXR0cmlidXRlX25hbWVzIiwiZ2V0QXBwcyIsInJlcyIsImluZGV4IiwibGVuZ3RoIiwiYXBwTmFtZSIsInB1c2giLCJVdGlsaXRpZXMiLCJwcm9taXNlTG9hZCIsImFwcHNMaXN0IiwiaGFzUmVsYXRpb24iLCJhZGREaXJlY3RlZFJlbGF0aW9uUGFyZW50IiwicmVsYXRpb24iLCJ0eXBlIiwiZ2V0IiwiY29uY2F0IiwiYWRkUmVsYXRpb25CeUFwcCIsImFkZERpcmVjdGVkUmVsYXRpb25DaGlsZCIsImFkZE5vbkRpcmVjdGVkUmVsYXRpb24iLCJpc1Jlc2VydmVkIiwibmFtZVRtcCIsImxpc3QiLCJjb25zb2xlIiwibG9nIiwicmVzZXJ2ZWRSZWxhdGlvbnNOYW1lcyIsImhhc1Jlc2VydmF0aW9uQ3JlZGVudGlhbHMiLCJjb250YWluc0FwcCIsImVycm9yIiwiYWRkU2ltcGxlUmVsYXRpb24iLCJyZWxhdGlvblR5cGUiLCJpc0RpcmVjdGVkIiwibm9kZTIiLCJhZGROb2RlIiwibm9kZSIsInJlbCIsIlNwaW5hbFJlbGF0aW9uIiwiYWRkU2ltcGxlUmVsYXRpb25CeUFwcCIsImFkZFRvRXhpc3RpbmdSZWxhdGlvbiIsImFzUGFyZW50IiwiZXhpc3RpbmdSZWxhdGlvbnMiLCJnZXRSZWxhdGlvbnMiLCJhZGROb2RldG9Ob2RlTGlzdDEiLCJhZGROb2RldG9Ob2RlTGlzdDIiLCJhZGRUb0V4aXN0aW5nUmVsYXRpb25CeUFwcCIsImFwcFJlbGF0aW9ucyIsImdldFJlbGF0aW9uc0J5QXBwTmFtZSIsIl9jbGFzc2lmeVJlbGF0aW9uIiwiX3JlbGF0aW9uIiwibG9hZCIsImkiLCJyZWxMaXN0IiwiaiIsImdldFJlbGF0aW9uc0J5VHlwZSIsImluY2x1ZGVzIiwidDEiLCJ0MiIsInQzIiwiaGFzQXBwRGVmaW5lZCIsImFwcFJlbGF0aW9uIiwiZ2V0UmVsYXRpb25zQnlBcHAiLCJhcHAiLCJnZXRSZWxhdGlvbnNCeUFwcE5hbWVCeVR5cGUiLCJoYXNSZWxhdGlvbkJ5QXBwQnlUeXBlRGVmaW5lZCIsImdldFJlbGF0aW9uc0J5QXBwQnlUeXBlIiwiaW5Ob2RlTGlzdCIsIl9ub2RlbGlzdCIsImlkIiwiZ2V0TmVpZ2hib3JzIiwibmVpZ2hib3JzIiwibm9kZUxpc3QxIiwibm9kZUxpc3QyIiwiYWxsQnV0TWVCeUlkIiwicmVtb3ZlUmVsYXRpb24iLCJyZWxhdGlvbkxzdCIsImNhbmRpZGF0ZVJlbGF0aW9uIiwic3BsaWNlIiwicmVtb3ZlUmVsYXRpb25zIiwicmVtb3ZlUmVsYXRpb25UeXBlIiwicmVtX2F0dHIiLCJ3YXJuIiwidG9Kc29uIiwidG9Kc29uV2l0aFJlbGF0aW9ucyIsInRvSWZjIiwicmVnaXN0ZXJfbW9kZWxzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFFQTs7OztBQUtBOzs7O0FBUEEsTUFBTUEsYUFBYUMsUUFBUSx5QkFBUixDQUFuQjtBQUNBLE1BQU1DLGFBQWEsT0FBT0MsTUFBUCxLQUFrQixXQUFsQixHQUFnQ0MsTUFBaEMsR0FBeUNELE1BQTVEOztBQUVBLElBQUlFLFlBQVksWUFBVztBQUN6QixTQUFPSCxXQUFXSSxDQUFsQjtBQUNELENBRkQ7O0FBT0E7Ozs7Ozs7QUFPQSxNQUFNQyxVQUFOLFNBQXlCTCxXQUFXTSxLQUFwQyxDQUEwQztBQUN4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LGVBQVM7QUFISixLQUFQO0FBS0Q7QUFDRDs7Ozs7O0FBTUFrRyx3QkFBc0I7QUFDcEIsUUFBSWhHLFlBQVksRUFBaEI7QUFDQSxTQUFLLElBQUlrQixRQUFRLENBQWpCLEVBQW9CQSxRQUFRLEtBQUtxQyxZQUFMLEdBQW9CcEMsTUFBaEQsRUFBd0RELE9BQXhELEVBQWlFO0FBQy9ELFlBQU1TLFdBQVcsS0FBSzRCLFlBQUwsR0FBb0JyQyxLQUFwQixDQUFqQjtBQUNBbEIsZ0JBQVVxQixJQUFWLENBQWVNLFNBQVNvRSxNQUFULEVBQWY7QUFDRDtBQUNELFdBQU87QUFDTGQsVUFBSSxLQUFLQSxFQUFMLENBQVFwRCxHQUFSLEVBREM7QUFFTDVCLFlBQU0sS0FBS0EsSUFBTCxDQUFVNEIsR0FBVixFQUZEO0FBR0wvQixlQUFTLElBSEo7QUFJTEUsaUJBQVdBO0FBSk4sS0FBUDtBQU1EO0FBQ0Q7Ozs7OztBQU1BLFFBQU1pRyxLQUFOLEdBQWM7QUFDWixRQUFJbkcsVUFBVSxNQUFNd0IscUJBQVVDLFdBQVYsQ0FBc0IsS0FBS3pCLE9BQTNCLENBQXBCO0FBQ0EsV0FBT0EsUUFBUW1HLEtBQVIsRUFBUDtBQUNEO0FBeHRCdUM7a0JBMHRCM0J2RyxVOztBQUNmUCxXQUFXK0csZUFBWCxDQUEyQixDQUFDeEcsVUFBRCxDQUEzQiIsImZpbGUiOiJTcGluYWxOb2RlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3Qgc3BpbmFsQ29yZSA9IHJlcXVpcmUoXCJzcGluYWwtY29yZS1jb25uZWN0b3Jqc1wiKTtcbmNvbnN0IGdsb2JhbFR5cGUgPSB0eXBlb2Ygd2luZG93ID09PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogd2luZG93O1xuaW1wb3J0IFNwaW5hbFJlbGF0aW9uIGZyb20gXCIuL1NwaW5hbFJlbGF0aW9uXCI7XG5sZXQgZ2V0Vmlld2VyID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBnbG9iYWxUeXBlLnY7XG59O1xuXG5pbXBvcnQge1xuICBVdGlsaXRpZXNcbn0gZnJvbSBcIi4vVXRpbGl0aWVzXCI7XG4vKipcbiAqXG4gKlxuICogQGV4cG9ydFxuICogQGNsYXNzIFNwaW5hbE5vZGVcbiAqIEBleHRlbmRzIHtNb2RlbH1cbiAqL1xuY2xhc3MgU3BpbmFsTm9kZSBleHRlbmRzIGdsb2JhbFR5cGUuTW9kZWwge1xuICAvKipcbiAgICpDcmVhdGVzIGFuIGluc3RhbmNlIG9mIFNwaW5hbE5vZGUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIEBwYXJhbSB7TW9kZWx9IGVsZW1lbnQgLSBhbnkgc3ViY2xhc3Mgb2YgTW9kZWxcbiAgICogQHBhcmFtIHtTcGluYWxHcmFwaH0gcmVsYXRlZEdyYXBoXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb25bXX0gcmVsYXRpb25zXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbbmFtZT1cIlNwaW5hbE5vZGVcIl1cbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGNvbnN0cnVjdG9yKF9uYW1lLCBlbGVtZW50LCByZWxhdGVkR3JhcGgsIHJlbGF0aW9ucywgbmFtZSA9IFwiU3BpbmFsTm9kZVwiKSB7XG4gICAgc3VwZXIoKTtcbiAgICBpZiAoRmlsZVN5c3RlbS5fc2lnX3NlcnZlcikge1xuICAgICAgdGhpcy5hZGRfYXR0cih7XG4gICAgICAgIG5hbWU6IF9uYW1lLFxuICAgICAgICBlbGVtZW50OiBuZXcgUHRyKGVsZW1lbnQpLFxuICAgICAgICByZWxhdGlvbnM6IG5ldyBNb2RlbCgpLFxuICAgICAgICBhcHBzOiBuZXcgTW9kZWwoKSxcbiAgICAgICAgcmVsYXRlZEdyYXBoOiByZWxhdGVkR3JhcGhcbiAgICAgIH0pO1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0ZWRHcmFwaCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5jbGFzc2lmeU5vZGUodGhpcyk7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIF9yZWxhdGlvbnMgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoX3JlbGF0aW9ucykgfHwgX3JlbGF0aW9ucyBpbnN0YW5jZW9mIExzdClcbiAgICAgICAgICB0aGlzLmFkZFJlbGF0aW9ucyhfcmVsYXRpb25zKTtcbiAgICAgICAgZWxzZSB0aGlzLmFkZFJlbGF0aW9uKF9yZWxhdGlvbnMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIHJlZ2lzdGVyQXBwKGFwcCkge1xuICAvLyAgIHRoaXMuYXBwcy5hZGRfYXR0cih7XG4gIC8vICAgICBbYXBwLm5hbWUuZ2V0KCldOiBuZXcgUHRyKGFwcClcbiAgLy8gICB9KVxuICAvLyB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyBhbGwgYXBwbGljYXRpb25zIG5hbWVzIGFzIHN0cmluZ1xuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgZ2V0QXBwc05hbWVzKCkge1xuICAgIHJldHVybiB0aGlzLmFwcHMuX2F0dHJpYnV0ZV9uYW1lcztcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgYWxsIGFwcGxpY2F0aW9uc1xuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYXN5bmMgZ2V0QXBwcygpIHtcbiAgICBsZXQgcmVzID0gW11cbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5hcHBzLl9hdHRyaWJ1dGVfbmFtZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCBhcHBOYW1lID0gdGhpcy5hcHBzLl9hdHRyaWJ1dGVfbmFtZXNbaW5kZXhdO1xuICAgICAgcmVzLnB1c2goYXdhaXQgVXRpbGl0aWVzLnByb21pc2VMb2FkKHRoaXMucmVsYXRlZEdyYXBoLmFwcHNMaXN0W1xuICAgICAgICBhcHBOYW1lXSkpXG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbiAgLy8gLyoqXG4gIC8vICAqXG4gIC8vICAqXG4gIC8vICAqIEBwYXJhbSB7Kn0gcmVsYXRpb25UeXBlXG4gIC8vICAqIEBwYXJhbSB7Kn0gcmVsYXRpb25cbiAgLy8gICogQHBhcmFtIHsqfSBhc1BhcmVudFxuICAvLyAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAvLyAgKi9cbiAgLy8gY2hhbmdlRGVmYXVsdFJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgcmVsYXRpb24sIGFzUGFyZW50KSB7XG4gIC8vICAgICBpZiAocmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKSkge1xuICAvLyAgICAgICBpZiAoYXNQYXJlbnQpIHtcbiAgLy8gICAgICAgICBVdGlsaXRpZXMucHV0T25Ub3BMc3QodGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCI+XCJdLCByZWxhdGlvbik7XG4gIC8vICAgICAgIH0gZWxzZSB7XG4gIC8vICAgICAgICAgVXRpbGl0aWVzLnB1dE9uVG9wTHN0KHRoaXMucmVsYXRpb25zW3JlbGF0aW9uVHlwZSArIFwiPFwiXSwgcmVsYXRpb24pO1xuICAvLyAgICAgICB9XG4gIC8vICAgICB9IGVsc2Uge1xuICAvLyAgICAgICBVdGlsaXRpZXMucHV0T25Ub3BMc3QodGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCItXCJdLCByZWxhdGlvbik7XG4gIC8vICAgICB9XG4gIC8vICAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgYm9vbGVhblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgaGFzUmVsYXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucmVsYXRpb25zLmxlbmd0aCAhPT0gMDtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbn0gcmVsYXRpb25cbiAgICogQHBhcmFtIHtzdHJpbmd9IGFwcE5hbWVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGFkZERpcmVjdGVkUmVsYXRpb25QYXJlbnQocmVsYXRpb24sIGFwcE5hbWUpIHtcbiAgICBsZXQgbmFtZSA9IHJlbGF0aW9uLnR5cGUuZ2V0KCk7XG4gICAgbmFtZSA9IG5hbWUuY29uY2F0KFwiPlwiKTtcbiAgICBpZiAodHlwZW9mIGFwcE5hbWUgPT09IFwidW5kZWZpbmVkXCIpIHRoaXMuYWRkUmVsYXRpb24ocmVsYXRpb24sIG5hbWUpO1xuICAgIGVsc2UgdGhpcy5hZGRSZWxhdGlvbkJ5QXBwKHJlbGF0aW9uLCBuYW1lLCBhcHBOYW1lKTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbn0gcmVsYXRpb25cbiAgICogQHBhcmFtIHtzdHJpbmd9IGFwcE5hbWVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGFkZERpcmVjdGVkUmVsYXRpb25DaGlsZChyZWxhdGlvbiwgYXBwTmFtZSkge1xuICAgIGxldCBuYW1lID0gcmVsYXRpb24udHlwZS5nZXQoKTtcbiAgICBuYW1lID0gbmFtZS5jb25jYXQoXCI8XCIpO1xuICAgIGlmICh0eXBlb2YgYXBwTmFtZSA9PT0gXCJ1bmRlZmluZWRcIikgdGhpcy5hZGRSZWxhdGlvbihyZWxhdGlvbiwgbmFtZSk7XG4gICAgZWxzZSB0aGlzLmFkZFJlbGF0aW9uQnlBcHAocmVsYXRpb24sIG5hbWUsIGFwcE5hbWUpO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9ufSByZWxhdGlvblxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYWRkTm9uRGlyZWN0ZWRSZWxhdGlvbihyZWxhdGlvbiwgYXBwTmFtZSkge1xuICAgIGxldCBuYW1lID0gcmVsYXRpb24udHlwZS5nZXQoKTtcbiAgICBuYW1lID0gbmFtZS5jb25jYXQoXCItXCIpO1xuICAgIGlmICh0eXBlb2YgYXBwTmFtZSA9PT0gXCJ1bmRlZmluZWRcIikgdGhpcy5hZGRSZWxhdGlvbihyZWxhdGlvbiwgbmFtZSk7XG4gICAgZWxzZSB0aGlzLmFkZFJlbGF0aW9uQnlBcHAocmVsYXRpb24sIG5hbWUsIGFwcE5hbWUpO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9ufSByZWxhdGlvblxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYWRkUmVsYXRpb24ocmVsYXRpb24sIG5hbWUpIHtcbiAgICBpZiAoIXRoaXMucmVsYXRlZEdyYXBoLmlzUmVzZXJ2ZWQocmVsYXRpb24udHlwZS5nZXQoKSkpIHtcbiAgICAgIGxldCBuYW1lVG1wID0gcmVsYXRpb24udHlwZS5nZXQoKTtcbiAgICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBuYW1lVG1wID0gbmFtZTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgdGhpcy5yZWxhdGlvbnNbbmFtZVRtcF0gIT09IFwidW5kZWZpbmVkXCIpXG4gICAgICAgIHRoaXMucmVsYXRpb25zW25hbWVUbXBdLnB1c2gocmVsYXRpb24pO1xuICAgICAgZWxzZSB7XG4gICAgICAgIGxldCBsaXN0ID0gbmV3IExzdCgpO1xuICAgICAgICBsaXN0LnB1c2gocmVsYXRpb24pO1xuICAgICAgICB0aGlzLnJlbGF0aW9ucy5hZGRfYXR0cih7XG4gICAgICAgICAgW25hbWVUbXBdOiBsaXN0XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb24udHlwZS5nZXQoKSArXG4gICAgICAgIFwiIGlzIHJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5yZWxhdGVkR3JhcGgucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvbi50eXBlLmdldCgpXVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb259IHJlbGF0aW9uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC1yZWxhdGlvbiBOYW1lIGlmIG5vdCBvcmdhbmlsbHkgZGVmaW5lZFxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXBwTmFtZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYWRkUmVsYXRpb25CeUFwcChyZWxhdGlvbiwgbmFtZSwgYXBwTmFtZSkge1xuICAgIGlmICh0aGlzLnJlbGF0ZWRHcmFwaC5oYXNSZXNlcnZhdGlvbkNyZWRlbnRpYWxzKHJlbGF0aW9uLnR5cGUuZ2V0KCksXG4gICAgICAgIGFwcE5hbWUpKSB7XG4gICAgICBpZiAodGhpcy5yZWxhdGVkR3JhcGguY29udGFpbnNBcHAoYXBwTmFtZSkpIHtcbiAgICAgICAgbGV0IG5hbWVUbXAgPSByZWxhdGlvbi50eXBlLmdldCgpO1xuICAgICAgICBpZiAodHlwZW9mIG5hbWUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBuYW1lVG1wID0gbmFtZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHRoaXMucmVsYXRpb25zW25hbWVUbXBdICE9PSBcInVuZGVmaW5lZFwiKVxuICAgICAgICAgIHRoaXMucmVsYXRpb25zW25hbWVUbXBdLnB1c2gocmVsYXRpb24pO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBsZXQgbGlzdCA9IG5ldyBMc3QoKTtcbiAgICAgICAgICBsaXN0LnB1c2gocmVsYXRpb24pO1xuICAgICAgICAgIHRoaXMucmVsYXRpb25zLmFkZF9hdHRyKHtcbiAgICAgICAgICAgIFtuYW1lVG1wXTogbGlzdFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5hcHBzW2FwcE5hbWVdICE9PSBcInVuZGVmaW5lZFwiKVxuICAgICAgICAgIHRoaXMuYXBwc1thcHBOYW1lXS5hZGRfYXR0cih7XG4gICAgICAgICAgICBbcmVsYXRpb24udHlwZS5nZXQoKV06IHJlbGF0aW9uXG4gICAgICAgICAgfSk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGxldCBsaXN0ID0gbmV3IE1vZGVsKCk7XG4gICAgICAgICAgbGlzdC5hZGRfYXR0cih7XG4gICAgICAgICAgICBbcmVsYXRpb24udHlwZS5nZXQoKV06IHJlbGF0aW9uXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5hcHBzLmFkZF9hdHRyKHtcbiAgICAgICAgICAgIFthcHBOYW1lXTogbGlzdFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKGFwcE5hbWUgKyBcIiBkb2VzIG5vdCBleGlzdFwiKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIHJlbGF0aW9uLnR5cGUuZ2V0KCkgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVsYXRlZEdyYXBoLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb24udHlwZS5nZXQoKV1cbiAgICAgICk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEBwYXJhbSB7TW9kZWx9IGVsZW1lbnQgLSBhbmQgc3ViY2xhc3Mgb2YgTW9kZWxcbiAgICogQHBhcmFtIHtib29sZWFufSBbaXNEaXJlY3RlZD1mYWxzZV1cbiAgICogQHJldHVybnMgdGhlIGNyZWF0ZWQgcmVsYXRpb24sIHVuZGVmaW5lZCBvdGhlcndpc2VcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGFkZFNpbXBsZVJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgZWxlbWVudCwgaXNEaXJlY3RlZCA9IGZhbHNlKSB7XG4gICAgaWYgKCF0aGlzLnJlbGF0ZWRHcmFwaC5pc1Jlc2VydmVkKHJlbGF0aW9uVHlwZSkpIHtcbiAgICAgIGxldCByZXMgPSB7fVxuICAgICAgbGV0IG5vZGUyID0gdGhpcy5yZWxhdGVkR3JhcGguYWRkTm9kZShlbGVtZW50KTtcbiAgICAgIHJlcy5ub2RlID0gbm9kZTJcbiAgICAgIGxldCByZWwgPSBuZXcgU3BpbmFsUmVsYXRpb24ocmVsYXRpb25UeXBlLCBbdGhpc10sIFtub2RlMl0sXG4gICAgICAgIGlzRGlyZWN0ZWQpO1xuICAgICAgcmVzLnJlbGF0aW9uID0gcmVsXG4gICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5hZGRSZWxhdGlvbihyZWwpO1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIHJlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGlzIHJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5yZWxhdGVkR3JhcGgucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvblR5cGVdXG4gICAgICApO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFwcE5hbWVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcGFyYW0ge01vZGVsfSBlbGVtZW50XG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGlyZWN0ZWQ9ZmFsc2VdXG4gICAqIEByZXR1cm5zIHRoZSBjcmVhdGVkIHJlbGF0aW9uXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhZGRTaW1wbGVSZWxhdGlvbkJ5QXBwKGFwcE5hbWUsIHJlbGF0aW9uVHlwZSwgZWxlbWVudCwgaXNEaXJlY3RlZCA9IGZhbHNlKSB7XG4gICAgaWYgKHRoaXMucmVsYXRlZEdyYXBoLmhhc1Jlc2VydmF0aW9uQ3JlZGVudGlhbHMocmVsYXRpb25UeXBlLCBhcHBOYW1lKSkge1xuICAgICAgaWYgKHRoaXMucmVsYXRlZEdyYXBoLmNvbnRhaW5zQXBwKGFwcE5hbWUpKSB7XG4gICAgICAgIGxldCByZXMgPSB7fVxuICAgICAgICBsZXQgbm9kZTIgPSB0aGlzLnJlbGF0ZWRHcmFwaC5hZGROb2RlKGVsZW1lbnQpO1xuICAgICAgICByZXMubm9kZSA9IG5vZGUyXG4gICAgICAgIGxldCByZWwgPSBuZXcgU3BpbmFsUmVsYXRpb24ocmVsYXRpb25UeXBlLCBbdGhpc10sIFtub2RlMl0sXG4gICAgICAgICAgaXNEaXJlY3RlZCk7XG4gICAgICAgIHJlcy5yZWxhdGlvbiA9IHJlbFxuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5hZGRSZWxhdGlvbihyZWwsIGFwcE5hbWUpO1xuICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihhcHBOYW1lICsgXCIgZG9lcyBub3QgZXhpc3RcIik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICByZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVsYXRlZEdyYXBoLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHBhcmFtIHtNb2RlbH0gZWxlbWVudCAtIGFueSBzdWJjbGFzcyBvZiBNb2RlbFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0RpcmVjdGVkPWZhbHNlXVxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFthc1BhcmVudD1mYWxzZV1cbiAgICogQHJldHVybnMgYW4gT2JqZWN0IG9mIDEpcmVsYXRpb246dGhlIHJlbGF0aW9uIHdpdGggdGhlIGFkZGVkIGVsZW1lbnQgbm9kZSBpbiAobm9kZUxpc3QyKSwgMilub2RlOiB0aGUgY3JlYXRlZCBub2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBhZGRUb0V4aXN0aW5nUmVsYXRpb24oXG4gICAgcmVsYXRpb25UeXBlLFxuICAgIGVsZW1lbnQsXG4gICAgaXNEaXJlY3RlZCA9IGZhbHNlLFxuICAgIGFzUGFyZW50ID0gZmFsc2VcbiAgKSB7XG4gICAgbGV0IHJlcyA9IHt9XG4gICAgaWYgKCF0aGlzLnJlbGF0ZWRHcmFwaC5pc1Jlc2VydmVkKHJlbGF0aW9uVHlwZSkpIHtcbiAgICAgIGxldCBleGlzdGluZ1JlbGF0aW9ucyA9IHRoaXMuZ2V0UmVsYXRpb25zKCk7XG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgZXhpc3RpbmdSZWxhdGlvbnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IHJlbGF0aW9uID0gZXhpc3RpbmdSZWxhdGlvbnNbaW5kZXhdO1xuICAgICAgICByZXMucmVsYXRpb24gPSByZWxhdGlvblxuICAgICAgICBpZiAoXG4gICAgICAgICAgcmVsYXRpb25UeXBlID09PSByZWxhdGlvblR5cGUgJiZcbiAgICAgICAgICBpc0RpcmVjdGVkID09PSByZWxhdGlvbi5pc0RpcmVjdGVkLmdldCgpXG4gICAgICAgICkge1xuICAgICAgICAgIG5vZGUyID0gdGhpcy5yZWxhdGVkR3JhcGguYWRkTm9kZShlbGVtZW50KTtcbiAgICAgICAgICByZXMubm9kZSA9IG5vZGUyO1xuICAgICAgICAgIGlmIChpc0RpcmVjdGVkKSB7XG4gICAgICAgICAgICBpZiAoYXNQYXJlbnQpIHtcbiAgICAgICAgICAgICAgcmVsYXRpb24uYWRkTm9kZXRvTm9kZUxpc3QxKG5vZGUyKTtcbiAgICAgICAgICAgICAgbm9kZTIuYWRkRGlyZWN0ZWRSZWxhdGlvblBhcmVudChyZWxhdGlvbik7XG4gICAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZWxhdGlvbi5hZGROb2RldG9Ob2RlTGlzdDIobm9kZTIpO1xuICAgICAgICAgICAgICBub2RlMi5hZGREaXJlY3RlZFJlbGF0aW9uQ2hpbGQocmVsYXRpb24pO1xuICAgICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZWxhdGlvbi5hZGROb2RldG9Ob2RlTGlzdDIobm9kZTIpO1xuICAgICAgICAgICAgbm9kZTIuYWRkTm9uRGlyZWN0ZWRSZWxhdGlvbihyZWxhdGlvbik7XG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuYWRkU2ltcGxlUmVsYXRpb24ocmVsYXRpb25UeXBlLCBlbGVtZW50LCBpc0RpcmVjdGVkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIHJlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGlzIHJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5yZWxhdGVkR3JhcGgucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvblR5cGVdXG4gICAgICApO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFwcE5hbWVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcGFyYW0ge01vZGVsfSBlbGVtZW50IC0gYW55IHN1YmNsYXNzIG9mIE1vZGVsXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGlyZWN0ZWQ9ZmFsc2VdXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2FzUGFyZW50PWZhbHNlXVxuICAgKiBAcmV0dXJucyBhbiBPYmplY3Qgb2YgMSlyZWxhdGlvbjp0aGUgcmVsYXRpb24gd2l0aCB0aGUgYWRkZWQgZWxlbWVudCBub2RlIGluIChub2RlTGlzdDIpLCAyKW5vZGU6IHRoZSBjcmVhdGVkIG5vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGFkZFRvRXhpc3RpbmdSZWxhdGlvbkJ5QXBwKFxuICAgIGFwcE5hbWUsXG4gICAgcmVsYXRpb25UeXBlLFxuICAgIGVsZW1lbnQsXG4gICAgaXNEaXJlY3RlZCA9IGZhbHNlLFxuICAgIGFzUGFyZW50ID0gZmFsc2VcbiAgKSB7XG4gICAgbGV0IHJlcyA9IHt9XG4gICAgbGV0IG5vZGUyID0gbnVsbFxuICAgIGlmICh0aGlzLnJlbGF0ZWRHcmFwaC5oYXNSZXNlcnZhdGlvbkNyZWRlbnRpYWxzKHJlbGF0aW9uVHlwZSwgYXBwTmFtZSkpIHtcbiAgICAgIGlmICh0aGlzLnJlbGF0ZWRHcmFwaC5jb250YWluc0FwcChhcHBOYW1lKSkge1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMuYXBwc1thcHBOYW1lXSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgIGxldCBhcHBSZWxhdGlvbnMgPSB0aGlzLmdldFJlbGF0aW9uc0J5QXBwTmFtZShhcHBOYW1lKTtcbiAgICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgYXBwUmVsYXRpb25zLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgY29uc3QgcmVsYXRpb24gPSBhcHBSZWxhdGlvbnNbaW5kZXhdO1xuICAgICAgICAgICAgcmVzLnJlbGF0aW9uID0gcmVsYXRpb25cbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgcmVsYXRpb24udHlwZS5nZXQoKSA9PT0gcmVsYXRpb25UeXBlICYmXG4gICAgICAgICAgICAgIGlzRGlyZWN0ZWQgPT09IHJlbGF0aW9uLmlzRGlyZWN0ZWQuZ2V0KClcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICBub2RlMiA9IHRoaXMucmVsYXRlZEdyYXBoLmFkZE5vZGUoZWxlbWVudCk7XG4gICAgICAgICAgICAgIHJlcy5ub2RlID0gbm9kZTI7XG4gICAgICAgICAgICAgIGlmIChpc0RpcmVjdGVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFzUGFyZW50KSB7XG4gICAgICAgICAgICAgICAgICByZWxhdGlvbi5hZGROb2RldG9Ob2RlTGlzdDEobm9kZTIpO1xuICAgICAgICAgICAgICAgICAgbm9kZTIuYWRkRGlyZWN0ZWRSZWxhdGlvblBhcmVudChyZWxhdGlvbiwgYXBwTmFtZSk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICByZWxhdGlvbi5hZGROb2RldG9Ob2RlTGlzdDIobm9kZTIpO1xuICAgICAgICAgICAgICAgICAgbm9kZTIuYWRkRGlyZWN0ZWRSZWxhdGlvbkNoaWxkKHJlbGF0aW9uLCBhcHBOYW1lKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlbGF0aW9uLmFkZE5vZGV0b05vZGVMaXN0Mihub2RlMik7XG4gICAgICAgICAgICAgICAgbm9kZTIuYWRkTm9uRGlyZWN0ZWRSZWxhdGlvbihyZWxhdGlvbiwgYXBwTmFtZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5hZGRTaW1wbGVSZWxhdGlvbkJ5QXBwKFxuICAgICAgICAgIGFwcE5hbWUsXG4gICAgICAgICAgcmVsYXRpb25UeXBlLFxuICAgICAgICAgIGVsZW1lbnQsXG4gICAgICAgICAgaXNEaXJlY3RlZFxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihhcHBOYW1lICsgXCIgZG9lcyBub3QgZXhpc3RcIik7XG4gICAgICB9XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uVHlwZV1cbiAgICAgICk7XG4gICAgfVxuICB9XG5cblxuXG5cbiAgLy8gYWRkUmVsYXRpb24yKF9yZWxhdGlvbiwgX25hbWUpIHtcbiAgLy8gICBsZXQgY2xhc3NpZnkgPSBmYWxzZTtcbiAgLy8gICBsZXQgbmFtZSA9IF9yZWxhdGlvbi50eXBlLmdldCgpO1xuICAvLyAgIGlmICh0eXBlb2YgX25hbWUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgLy8gICAgIG5hbWUgPSBfbmFtZTtcbiAgLy8gICB9XG4gIC8vICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0aW9uc1tfcmVsYXRpb24udHlwZS5nZXQoKV0gIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgLy8gICAgIGlmIChfcmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKSkge1xuICAvLyAgICAgICBmb3IgKFxuICAvLyAgICAgICAgIGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5yZWxhdGlvbnNbX3JlbGF0aW9uLnR5cGUuZ2V0KCldLmxlbmd0aDsgaW5kZXgrK1xuICAvLyAgICAgICApIHtcbiAgLy8gICAgICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5yZWxhdGlvbnNbX3JlbGF0aW9uLnR5cGUuZ2V0KCldW2luZGV4XTtcbiAgLy8gICAgICAgICBpZiAoXG4gIC8vICAgICAgICAgICBVdGlsaXRpZXMuYXJyYXlzRXF1YWwoXG4gIC8vICAgICAgICAgICAgIF9yZWxhdGlvbi5nZXROb2RlTGlzdDFJZHMoKSxcbiAgLy8gICAgICAgICAgICAgZWxlbWVudC5nZXROb2RlTGlzdDFJZHMoKVxuICAvLyAgICAgICAgICAgKVxuICAvLyAgICAgICAgICkge1xuICAvLyAgICAgICAgICAgZWxlbWVudC5hZGROb3RFeGlzdGluZ1ZlcnRpY2VzdG9Ob2RlTGlzdDIoX3JlbGF0aW9uLm5vZGVMaXN0Mik7XG4gIC8vICAgICAgICAgfSBlbHNlIHtcbiAgLy8gICAgICAgICAgIGVsZW1lbnQucHVzaChfcmVsYXRpb24pO1xuICAvLyAgICAgICAgICAgY2xhc3NpZnkgPSB0cnVlO1xuICAvLyAgICAgICAgIH1cbiAgLy8gICAgICAgfVxuICAvLyAgICAgfSBlbHNlIHtcbiAgLy8gICAgICAgdGhpcy5yZWxhdGlvbnNbX3JlbGF0aW9uLnR5cGUuZ2V0KCldLmFkZE5vdEV4aXN0aW5nVmVydGljZXN0b1JlbGF0aW9uKFxuICAvLyAgICAgICAgIF9yZWxhdGlvblxuICAvLyAgICAgICApO1xuICAvLyAgICAgfVxuICAvLyAgIH0gZWxzZSB7XG4gIC8vICAgICBpZiAoX3JlbGF0aW9uLmlzRGlyZWN0ZWQuZ2V0KCkpIHtcbiAgLy8gICAgICAgbGV0IGxpc3QgPSBuZXcgTHN0KCk7XG4gIC8vICAgICAgIGxpc3QucHVzaChfcmVsYXRpb24pO1xuICAvLyAgICAgICB0aGlzLnJlbGF0aW9ucy5hZGRfYXR0cih7XG4gIC8vICAgICAgICAgW25hbWVdOiBsaXN0XG4gIC8vICAgICAgIH0pO1xuICAvLyAgICAgICB0aGlzLl9jbGFzc2lmeVJlbGF0aW9uKF9yZWxhdGlvbik7XG4gIC8vICAgICB9IGVsc2Uge1xuICAvLyAgICAgICB0aGlzLnJlbGF0aW9ucy5hZGRfYXR0cih7XG4gIC8vICAgICAgICAgW25hbWVdOiBfcmVsYXRpb25cbiAgLy8gICAgICAgfSk7XG4gIC8vICAgICAgIGNsYXNzaWZ5ID0gdHJ1ZTtcbiAgLy8gICAgIH1cbiAgLy8gICB9XG4gIC8vICAgaWYgKGNsYXNzaWZ5KSB0aGlzLl9jbGFzc2lmeVJlbGF0aW9uKF9yZWxhdGlvbik7XG4gIC8vIH1cblxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbn0gX3JlbGF0aW9uXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBfY2xhc3NpZnlSZWxhdGlvbihfcmVsYXRpb24pIHtcbiAgICB0aGlzLnJlbGF0ZWRHcmFwaC5sb2FkKHJlbGF0ZWRHcmFwaCA9PiB7XG4gICAgICByZWxhdGVkR3JhcGguX2NsYXNzaWZ5UmVsYXRpb24oX3JlbGF0aW9uKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vVE9ETyA6Tm90V29ya2luZ1xuICAvLyBhZGRSZWxhdGlvbihfcmVsYXRpb24pIHtcbiAgLy8gICB0aGlzLmFkZFJlbGF0aW9uKF9yZWxhdGlvbilcbiAgLy8gICB0aGlzLnJlbGF0ZWRHcmFwaC5sb2FkKHJlbGF0ZWRHcmFwaCA9PiB7XG4gIC8vICAgICByZWxhdGVkR3JhcGguX2FkZE5vdEV4aXN0aW5nVmVydGljZXNGcm9tUmVsYXRpb24oX3JlbGF0aW9uKVxuICAvLyAgIH0pXG4gIC8vIH1cbiAgLy9UT0RPIDpOb3RXb3JraW5nXG4gIC8vIGFkZFJlbGF0aW9ucyhfcmVsYXRpb25zKSB7XG4gIC8vICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IF9yZWxhdGlvbnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gIC8vICAgICB0aGlzLmFkZFJlbGF0aW9uKF9yZWxhdGlvbnNbaW5kZXhdKTtcbiAgLy8gICB9XG4gIC8vIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEByZXR1cm5zIGFsbCB0aGUgcmVsYXRpb25zIG9mIHRoaXMgTm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgZ2V0UmVsYXRpb25zKCkge1xuICAgIGxldCByZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucmVsYXRpb25zLl9hdHRyaWJ1dGVfbmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHJlbExpc3QgPSB0aGlzLnJlbGF0aW9uc1t0aGlzLnJlbGF0aW9ucy5fYXR0cmlidXRlX25hbWVzW2ldXTtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcmVsTGlzdC5sZW5ndGg7IGorKykge1xuICAgICAgICBjb25zdCByZWxhdGlvbiA9IHJlbExpc3Rbal07XG4gICAgICAgIHJlcy5wdXNoKHJlbGF0aW9uKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAgICogQHJldHVybnMgYWxsIHJlbGF0aW9ucyBvZiBhIHNwZWNpZmljIHJlbGF0aW9uIHR5cGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGdldFJlbGF0aW9uc0J5VHlwZSh0eXBlKSB7XG4gICAgbGV0IHJlcyA9IFtdO1xuICAgIGlmICghdHlwZS5pbmNsdWRlcyhcIj5cIiwgdHlwZS5sZW5ndGggLSAyKSAmJlxuICAgICAgIXR5cGUuaW5jbHVkZXMoXCI8XCIsIHR5cGUubGVuZ3RoIC0gMikgJiZcbiAgICAgICF0eXBlLmluY2x1ZGVzKFwiLVwiLCB0eXBlLmxlbmd0aCAtIDIpXG4gICAgKSB7XG4gICAgICBsZXQgdDEgPSB0eXBlLmNvbmNhdChcIj5cIik7XG4gICAgICByZXMgPSBVdGlsaXRpZXMuY29uY2F0KHJlcywgdGhpcy5nZXRSZWxhdGlvbnModDEpKTtcbiAgICAgIGxldCB0MiA9IHR5cGUuY29uY2F0KFwiPFwiKTtcbiAgICAgIHJlcyA9IFV0aWxpdGllcy5jb25jYXQocmVzLCB0aGlzLmdldFJlbGF0aW9ucyh0MikpO1xuICAgICAgbGV0IHQzID0gdHlwZS5jb25jYXQoXCItXCIpO1xuICAgICAgcmVzID0gVXRpbGl0aWVzLmNvbmNhdChyZXMsIHRoaXMuZ2V0UmVsYXRpb25zKHQzKSk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgdGhpcy5yZWxhdGlvbnNbdHlwZV0gIT09IFwidW5kZWZpbmVkXCIpIHJlcyA9IHRoaXMucmVsYXRpb25zW1xuICAgICAgdHlwZV07XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFwcE5hbWVcbiAgICogQHJldHVybnMgYWxsIHJlbGF0aW9ucyBvZiBhIHNwZWNpZmljIGFwcFxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgZ2V0UmVsYXRpb25zQnlBcHBOYW1lKGFwcE5hbWUpIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgaWYgKHRoaXMuaGFzQXBwRGVmaW5lZChhcHBOYW1lKSkge1xuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMuYXBwc1thcHBOYW1lXS5fYXR0cmlidXRlX25hbWVzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCBhcHBSZWxhdGlvbiA9IHRoaXMuYXBwc1thcHBOYW1lXVt0aGlzLmFwcHNbYXBwTmFtZV0uX2F0dHJpYnV0ZV9uYW1lc1tcbiAgICAgICAgICBpbmRleF1dO1xuICAgICAgICByZXMucHVzaChhcHBSZWxhdGlvbik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsQXBwbGljYXRpb259IGFwcFxuICAgKiBAcmV0dXJucyBhbGwgcmVsYXRpb25zIG9mIGEgc3BlY2lmaWMgYXBwXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBnZXRSZWxhdGlvbnNCeUFwcChhcHApIHtcbiAgICBsZXQgYXBwTmFtZSA9IGFwcC5uYW1lLmdldCgpXG4gICAgcmV0dXJuIHRoaXMuZ2V0UmVsYXRpb25zQnlBcHBOYW1lKGFwcE5hbWUpXG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgYWxsIHJlbGF0aW9ucyBvZiBhIHNwZWNpZmljIGFwcCBvZiBhIHNwZWNpZmljIHR5cGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGdldFJlbGF0aW9uc0J5QXBwTmFtZUJ5VHlwZShhcHBOYW1lLCByZWxhdGlvblR5cGUpIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgaWYgKHRoaXMuaGFzUmVsYXRpb25CeUFwcEJ5VHlwZURlZmluZWQoYXBwTmFtZSwgcmVsYXRpb25UeXBlKSkge1xuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMuYXBwc1thcHBOYW1lXS5fYXR0cmlidXRlX25hbWVzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCBhcHBSZWxhdGlvbiA9IHRoaXMuYXBwc1thcHBOYW1lXVt0aGlzLmFwcHNbYXBwTmFtZV0uX2F0dHJpYnV0ZV9uYW1lc1tcbiAgICAgICAgICBpbmRleF1dO1xuICAgICAgICBpZiAoYXBwUmVsYXRpb24udHlwZS5nZXQoKSA9PT0gcmVsYXRpb25UeXBlKSByZXMucHVzaChhcHBSZWxhdGlvbik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsQXBwbGljYXRpb259IGFwcFxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEByZXR1cm5zIGFsbCByZWxhdGlvbnMgb2YgYSBzcGVjaWZpYyBhcHAgb2YgYSBzcGVjaWZpYyB0eXBlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICBnZXRSZWxhdGlvbnNCeUFwcEJ5VHlwZShhcHAsIHJlbGF0aW9uVHlwZSkge1xuICAgIGxldCBhcHBOYW1lID0gYXBwLm5hbWUuZ2V0KClcbiAgICByZXR1cm4gdGhpcy5nZXRSZWxhdGlvbnNCeUFwcE5hbWVCeVR5cGUoYXBwTmFtZSwgcmVsYXRpb25UeXBlKVxuXG4gIH1cbiAgLyoqXG4gICAqICB2ZXJpZnkgaWYgYW4gZWxlbWVudCBpcyBhbHJlYWR5IGluIGdpdmVuIG5vZGVMaXN0XG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZVtdfSBfbm9kZWxpc3RcbiAgICogQHJldHVybnMgYm9vbGVhblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgaW5Ob2RlTGlzdChfbm9kZWxpc3QpIHtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX25vZGVsaXN0Lmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgZWxlbWVudCA9IF9ub2RlbGlzdFtpbmRleF07XG4gICAgICBpZiAoZWxlbWVudC5pZC5nZXQoKSA9PT0gdGhpcy5pZC5nZXQoKSkgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vVE9ETyBnZXRDaGlsZHJlbiwgZ2V0UGFyZW50XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlIC0gb3B0aW9uYWxcbiAgICogQHJldHVybnMgYSBsaXN0IG9mIG5laWdoYm9ycyBub2RlcyBcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGdldE5laWdoYm9ycyhyZWxhdGlvblR5cGUpIHtcbiAgICBsZXQgbmVpZ2hib3JzID0gW107XG4gICAgbGV0IHJlbGF0aW9ucyA9IHRoaXMuZ2V0UmVsYXRpb25zKHJlbGF0aW9uVHlwZSk7XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHJlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IHJlbGF0aW9uID0gcmVsYXRpb25zW2luZGV4XTtcbiAgICAgIGlmIChyZWxhdGlvbi5pc0RpcmVjdGVkLmdldCgpKSB7XG4gICAgICAgIGlmICh0aGlzLmluTm9kZUxpc3QocmVsYXRpb24ubm9kZUxpc3QxKSlcbiAgICAgICAgICBuZWlnaGJvcnMgPSBVdGlsaXRpZXMuY29uY2F0KG5laWdoYm9ycywgcmVsYXRpb24ubm9kZUxpc3QyKTtcbiAgICAgICAgZWxzZSBuZWlnaGJvcnMgPSBVdGlsaXRpZXMuY29uY2F0KG5laWdoYm9ycywgcmVsYXRpb24ubm9kZUxpc3QxKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5laWdoYm9ycyA9IFV0aWxpdGllcy5jb25jYXQoXG4gICAgICAgICAgbmVpZ2hib3JzLFxuICAgICAgICAgIFV0aWxpdGllcy5hbGxCdXRNZUJ5SWQocmVsYXRpb24ubm9kZUxpc3QxKVxuICAgICAgICApO1xuICAgICAgICBuZWlnaGJvcnMgPSBVdGlsaXRpZXMuY29uY2F0KFxuICAgICAgICAgIG5laWdoYm9ycyxcbiAgICAgICAgICBVdGlsaXRpZXMuYWxsQnV0TWVCeUlkKHJlbGF0aW9uLm5vZGVMaXN0MilcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5laWdoYm9ycztcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbn0gX3JlbGF0aW9uXG4gICAqIEBtZW1iZXJvZiBTcGluYWxOb2RlXG4gICAqL1xuICByZW1vdmVSZWxhdGlvbihfcmVsYXRpb24pIHtcbiAgICBsZXQgcmVsYXRpb25Mc3QgPSB0aGlzLnJlbGF0aW9uc1tfcmVsYXRpb24udHlwZS5nZXQoKV07XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHJlbGF0aW9uTHN0Lmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgY2FuZGlkYXRlUmVsYXRpb24gPSByZWxhdGlvbkxzdFtpbmRleF07XG4gICAgICBpZiAoX3JlbGF0aW9uLmlkLmdldCgpID09PSBjYW5kaWRhdGVSZWxhdGlvbi5pZC5nZXQoKSlcbiAgICAgICAgcmVsYXRpb25Mc3Quc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb25bXX0gX3JlbGF0aW9uc1xuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgcmVtb3ZlUmVsYXRpb25zKF9yZWxhdGlvbnMpIHtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX3JlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHRoaXMucmVtb3ZlUmVsYXRpb24oX3JlbGF0aW9uc1tpbmRleF0pO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgcmVtb3ZlUmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHJlbGF0aW9uVHlwZSkgfHwgcmVsYXRpb25UeXBlIGluc3RhbmNlb2YgTHN0KVxuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHJlbGF0aW9uVHlwZS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgdHlwZSA9IHJlbGF0aW9uVHlwZVtpbmRleF07XG4gICAgICAgIHRoaXMucmVsYXRpb25zLnJlbV9hdHRyKHR5cGUpO1xuICAgICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5yZWxhdGlvbnMucmVtX2F0dHIocmVsYXRpb25UeXBlKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGhhc0FwcERlZmluZWQoYXBwTmFtZSkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5hcHBzW2FwcE5hbWVdICE9PSBcInVuZGVmaW5lZFwiKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICBlbHNlIHtcbiAgICAgIGNvbnNvbGUud2FybihcImFwcCBcIiArIGFwcE5hbWUgK1xuICAgICAgICBcIiBpcyBub3QgZGVmaW5lZCBmb3Igbm9kZSBcIiArIHRoaXMubmFtZS5nZXQoKSk7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBOYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgYm9vbGVhbiBcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIGhhc1JlbGF0aW9uQnlBcHBCeVR5cGVEZWZpbmVkKGFwcE5hbWUsIHJlbGF0aW9uVHlwZSkge1xuICAgIGlmICh0aGlzLmhhc0FwcERlZmluZWQoYXBwTmFtZSkgJiYgdHlwZW9mIHRoaXMuYXBwc1thcHBOYW1lXVtcbiAgICAgICAgcmVsYXRpb25UeXBlXG4gICAgICBdICE9PVxuICAgICAgXCJ1bmRlZmluZWRcIilcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oXCJyZWxhdGlvbiBcIiArIHJlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGlzIG5vdCBkZWZpbmVkIGZvciBub2RlIFwiICsgdGhpcy5uYW1lLmdldCgpICtcbiAgICAgICAgXCIgZm9yIGFwcGxpY2F0aW9uIFwiICsgYXBwTmFtZSk7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEByZXR1cm5zIEEganNvbiByZXByZXNlbnRpbmcgdGhlIG5vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIHRvSnNvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IHRoaXMuaWQuZ2V0KCksXG4gICAgICBuYW1lOiB0aGlzLm5hbWUuZ2V0KCksXG4gICAgICBlbGVtZW50OiBudWxsXG4gICAgfTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgQSBqc29uIHJlcHJlc2VudGluZyB0aGUgbm9kZSB3aXRoIGl0cyByZWxhdGlvbnNcbiAgICogQG1lbWJlcm9mIFNwaW5hbE5vZGVcbiAgICovXG4gIHRvSnNvbldpdGhSZWxhdGlvbnMoKSB7XG4gICAgbGV0IHJlbGF0aW9ucyA9IFtdO1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLmdldFJlbGF0aW9ucygpLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgcmVsYXRpb24gPSB0aGlzLmdldFJlbGF0aW9ucygpW2luZGV4XTtcbiAgICAgIHJlbGF0aW9ucy5wdXNoKHJlbGF0aW9uLnRvSnNvbigpKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiB0aGlzLmlkLmdldCgpLFxuICAgICAgbmFtZTogdGhpcy5uYW1lLmdldCgpLFxuICAgICAgZWxlbWVudDogbnVsbCxcbiAgICAgIHJlbGF0aW9uczogcmVsYXRpb25zXG4gICAgfTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgQW4gSUZDIGxpa2UgZm9ybWF0IHJlcHJlc2VudGluZyB0aGUgbm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsTm9kZVxuICAgKi9cbiAgYXN5bmMgdG9JZmMoKSB7XG4gICAgbGV0IGVsZW1lbnQgPSBhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQodGhpcy5lbGVtZW50KTtcbiAgICByZXR1cm4gZWxlbWVudC50b0lmYygpO1xuICB9XG59XG5leHBvcnQgZGVmYXVsdCBTcGluYWxOb2RlXG5zcGluYWxDb3JlLnJlZ2lzdGVyX21vZGVscyhbU3BpbmFsTm9kZV0pOyJdfQ==