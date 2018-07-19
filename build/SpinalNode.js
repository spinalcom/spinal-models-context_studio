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

class SpinalNode extends globalType.Model {
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

  getAppsNames() {
    return this.apps._attribute_names;
  }

  async getApps() {
    let res = [];
    for (let index = 0; index < this.apps._attribute_names.length; index++) {
      const appName = this.apps._attribute_names[index];
      res.push((await _Utilities.Utilities.promiseLoad(this.relatedGraph.appsList[appName])));
    }
    return res;
  }

  changeDefaultRelation(relationType, relation, asParent) {
    if (relation.isDirected.get()) {
      if (asParent) {
        _Utilities.Utilities.putOnTopLst(this.relations[relationType + ">"], relation);
      } else {
        _Utilities.Utilities.putOnTopLst(this.relations[relationType + "<"], relation);
      }
    } else {
      _Utilities.Utilities.putOnTopLst(this.relations[relationType + "-"], relation);
    }
  }

  hasRelation() {
    return this.relations.length !== 0;
  }

  addDirectedRelationParent(relation, appName) {
    let name = relation.type.get();
    name = name.concat(">");
    if (typeof appName === "undefined") this.addRelation(relation, name);else this.addRelationByApp(relation, name, appName);
  }

  addDirectedRelationChild(relation, appName) {
    let name = relation.type.get();
    name = name.concat("<");
    if (typeof appName === "undefined") this.addRelation(relation, name);else this.addRelationByApp(relation, name, appName);
  }

  addNonDirectedRelation(relation, appName) {
    let name = relation.type.get();
    name = name.concat("-");
    if (typeof appName === "undefined") this.addRelation(relation, name);else this.addRelationByApp(relation, name, appName);
  }

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

  addRelation2(_relation, _name) {
    let classify = false;
    let name = _relation.type.get();
    if (typeof _name !== "undefined") {
      name = _name;
    }
    if (typeof this.relations[_relation.type.get()] !== "undefined") {
      if (_relation.isDirected.get()) {
        for (let index = 0; index < this.relations[_relation.type.get()].length; index++) {
          const element = this.relations[_relation.type.get()][index];
          if (_Utilities.Utilities.arraysEqual(_relation.getNodeList1Ids(), element.getNodeList1Ids())) {
            element.addNotExistingVerticestoNodeList2(_relation.nodeList2);
          } else {
            element.push(_relation);
            classify = true;
          }
        }
      } else {
        this.relations[_relation.type.get()].addNotExistingVerticestoRelation(_relation);
      }
    } else {
      if (_relation.isDirected.get()) {
        let list = new Lst();
        list.push(_relation);
        this.relations.add_attr({
          [name]: list
        });
        this._classifyRelation(_relation);
      } else {
        this.relations.add_attr({
          [name]: _relation
        });
        classify = true;
      }
    }
    if (classify) this._classifyRelation(_relation);
  }

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

  getRelationsByAppName(appName) {
    let res = [];
    if (this.hasAppDefined(appName)) {
      for (let index = 0; index < this.apps[appName]._attribute_names.length; index++) {
        const appRelation = this.apps[appName][this.apps[appName]._attribute_names[index]];
        res.push(appRelation);
      }
      return res;
    } else return undefined;
  }

  getRelationsByApp(app) {
    let appName = app.name.get();
    return this.getRelationsByAppName(appName);
  }

  getRelationsByAppNameByType(appName, relationType) {
    let res = [];
    if (this.hasRelationByAppByTypeDefined(appName, relationType)) {
      for (let index = 0; index < this.apps[appName]._attribute_names.length; index++) {
        const appRelation = this.apps[appName][this.apps[appName]._attribute_names[index]];
        if (appRelation.type.get() === relationType) res.push(appRelation);
      }
      return res;
    } else {
      return undefined;
    }
  }

  getRelationsByAppByType(app, relationType) {
    let appName = app.name.get();
    return this.getRelationsByAppNameByType(appName, relationType);
  }

  inNodeList(_nodelist) {
    for (let index = 0; index < _nodelist.length; index++) {
      const element = _nodelist[index];
      if (element.id.get() === this.id.get()) return true;
    }
    return false;
  }

  //TODO getChildren, getParent

  getNeighbors(_type) {
    let neighbors = [];
    let relations = this.getRelations(_type);
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

  removeRelation(_relation) {
    let relationLst = this.relations[_relation.type.get()];
    for (let index = 0; index < relationLst.length; index++) {
      const candidateRelation = relationLst[index];
      if (_relation.id.get() === candidateRelation.id.get()) relationLst.splice(index, 1);
    }
  }

  removeRelations(_relations) {
    for (let index = 0; index < _relations.length; index++) {
      this.removeRelation(_relations[index]);
    }
  }

  removeRelationType(_type) {
    if (Array.isArray(_type) || _type instanceof Lst) for (let index = 0; index < _type.length; index++) {
      const type = _type[index];
      this.relations.rem_attr(type);
    } else {
      this.relations.rem_attr(_type);
    }
  }

  hasAppDefined(appName) {
    if (typeof this.apps[appName] !== "undefined") return true;else {
      console.warn("app " + appName + " is not defined for node " + this.name.get());
      return false;
    }
  }

  hasRelationByAppByTypeDefined(appName, relationType) {
    if (this.hasAppDefined(appName) && typeof this.apps[appName][relationType] !== "undefined") return true;else {
      console.warn("relation " + relationType + " is not defined for node " + this.name.get() + " for application " + appName);
      return false;
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
    let element = await _Utilities.Utilities.promiseLoad(this.element);
    return element.toIfc();
  }
}

exports.default = SpinalNode;
spinalCore.register_models([SpinalNode]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TcGluYWxOb2RlLmpzIl0sIm5hbWVzIjpbInNwaW5hbENvcmUiLCJyZXF1aXJlIiwiZ2xvYmFsVHlwZSIsIndpbmRvdyIsImdsb2JhbCIsImdldFZpZXdlciIsInYiLCJTcGluYWxOb2RlIiwiTW9kZWwiLCJjb25zdHJ1Y3RvciIsIl9uYW1lIiwiZWxlbWVudCIsInJlbGF0ZWRHcmFwaCIsInJlbGF0aW9ucyIsIm5hbWUiLCJGaWxlU3lzdGVtIiwiX3NpZ19zZXJ2ZXIiLCJhZGRfYXR0ciIsIlB0ciIsImFwcHMiLCJjbGFzc2lmeU5vZGUiLCJfcmVsYXRpb25zIiwiQXJyYXkiLCJpc0FycmF5IiwiTHN0IiwiYWRkUmVsYXRpb25zIiwiYWRkUmVsYXRpb24iLCJnZXRBcHBzTmFtZXMiLCJfYXR0cmlidXRlX25hbWVzIiwiZ2V0QXBwcyIsInJlcyIsImluZGV4IiwibGVuZ3RoIiwiYXBwTmFtZSIsInB1c2giLCJVdGlsaXRpZXMiLCJwcm9taXNlTG9hZCIsImFwcHNMaXN0IiwiY2hhbmdlRGVmYXVsdFJlbGF0aW9uIiwicmVsYXRpb25UeXBlIiwicmVsYXRpb24iLCJhc1BhcmVudCIsImlzRGlyZWN0ZWQiLCJnZXQiLCJwdXRPblRvcExzdCIsImhhc1JlbGF0aW9uIiwiYWRkRGlyZWN0ZWRSZWxhdGlvblBhcmVudCIsInR5cGUiLCJjb25jYXQiLCJhZGRSZWxhdGlvbkJ5QXBwIiwiYWRkRGlyZWN0ZWRSZWxhdGlvbkNoaWxkIiwiYWRkTm9uRGlyZWN0ZWRSZWxhdGlvbiIsImlzUmVzZXJ2ZWQiLCJuYW1lVG1wIiwibGlzdCIsImNvbnNvbGUiLCJsb2ciLCJyZXNlcnZlZFJlbGF0aW9uc05hbWVzIiwiaGFzUmVzZXJ2YXRpb25DcmVkZW50aWFscyIsImNvbnRhaW5zQXBwIiwiZXJyb3IiLCJhZGRTaW1wbGVSZWxhdGlvbiIsIm5vZGUyIiwiYWRkTm9kZSIsInJlbCIsIlNwaW5hbFJlbGF0aW9uIiwiYWRkU2ltcGxlUmVsYXRpb25CeUFwcCIsImFkZFRvRXhpc3RpbmdSZWxhdGlvbiIsImV4aXN0aW5nUmVsYXRpb25zIiwiZ2V0UmVsYXRpb25zIiwiYWRkTm9kZXRvTm9kZUxpc3QxIiwiYWRkTm9kZXRvTm9kZUxpc3QyIiwiYWRkVG9FeGlzdGluZ1JlbGF0aW9uQnlBcHAiLCJhcHBSZWxhdGlvbnMiLCJnZXRSZWxhdGlvbnNCeUFwcE5hbWUiLCJhZGRSZWxhdGlvbjIiLCJfcmVsYXRpb24iLCJjbGFzc2lmeSIsImFycmF5c0VxdWFsIiwiZ2V0Tm9kZUxpc3QxSWRzIiwiYWRkTm90RXhpc3RpbmdWZXJ0aWNlc3RvTm9kZUxpc3QyIiwibm9kZUxpc3QyIiwiYWRkTm90RXhpc3RpbmdWZXJ0aWNlc3RvUmVsYXRpb24iLCJfY2xhc3NpZnlSZWxhdGlvbiIsImxvYWQiLCJpIiwicmVsTGlzdCIsImoiLCJnZXRSZWxhdGlvbnNCeVR5cGUiLCJpbmNsdWRlcyIsInQxIiwidDIiLCJ0MyIsImhhc0FwcERlZmluZWQiLCJhcHBSZWxhdGlvbiIsInVuZGVmaW5lZCIsImdldFJlbGF0aW9uc0J5QXBwIiwiYXBwIiwiZ2V0UmVsYXRpb25zQnlBcHBOYW1lQnlUeXBlIiwiaGFzUmVsYXRpb25CeUFwcEJ5VHlwZURlZmluZWQiLCJnZXRSZWxhdGlvbnNCeUFwcEJ5VHlwZSIsImluTm9kZUxpc3QiLCJfbm9kZWxpc3QiLCJpZCIsImdldE5laWdoYm9ycyIsIl90eXBlIiwibmVpZ2hib3JzIiwibm9kZUxpc3QxIiwiYWxsQnV0TWVCeUlkIiwicmVtb3ZlUmVsYXRpb24iLCJyZWxhdGlvbkxzdCIsImNhbmRpZGF0ZVJlbGF0aW9uIiwic3BsaWNlIiwicmVtb3ZlUmVsYXRpb25zIiwicmVtb3ZlUmVsYXRpb25UeXBlIiwicmVtX2F0dHIiLCJ3YXJuIiwidG9Kc29uIiwidG9Kc29uV2l0aFJlbGF0aW9ucyIsInRvSWZjIiwicmVnaXN0ZXJfbW9kZWxzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFFQTs7OztBQUtBOzs7O0FBUEEsTUFBTUEsYUFBYUMsUUFBUSx5QkFBUixDQUFuQjtBQUNBLE1BQU1DLGFBQWEsT0FBT0MsTUFBUCxLQUFrQixXQUFsQixHQUFnQ0MsTUFBaEMsR0FBeUNELE1BQTVEOztBQUVBLElBQUlFLFlBQVksWUFBVztBQUN6QixTQUFPSCxXQUFXSSxDQUFsQjtBQUNELENBRkQ7O0FBUWUsTUFBTUMsVUFBTixTQUF5QkwsV0FBV00sS0FBcEMsQ0FBMEM7QUFDdkRDLGNBQVlDLEtBQVosRUFBbUJDLE9BQW5CLEVBQTRCQyxZQUE1QixFQUEwQ0MsU0FBMUMsRUFBcURDLE9BQU8sWUFBNUQsRUFBMEU7QUFDeEU7QUFDQSxRQUFJQyxXQUFXQyxXQUFmLEVBQTRCO0FBQzFCLFdBQUtDLFFBQUwsQ0FBYztBQUNaSCxjQUFNSixLQURNO0FBRVpDLGlCQUFTLElBQUlPLEdBQUosQ0FBUVAsT0FBUixDQUZHO0FBR1pFLG1CQUFXLElBQUlMLEtBQUosRUFIQztBQUlaVyxjQUFNLElBQUlYLEtBQUosRUFKTTtBQUtaSSxzQkFBY0E7QUFMRixPQUFkO0FBT0EsVUFBSSxPQUFPLEtBQUtBLFlBQVosS0FBNkIsV0FBakMsRUFBOEM7QUFDNUMsYUFBS0EsWUFBTCxDQUFrQlEsWUFBbEIsQ0FBK0IsSUFBL0I7QUFDRDtBQUNELFVBQUksT0FBT0MsVUFBUCxLQUFzQixXQUExQixFQUF1QztBQUNyQyxZQUFJQyxNQUFNQyxPQUFOLENBQWNGLFVBQWQsS0FBNkJBLHNCQUFzQkcsR0FBdkQsRUFDRSxLQUFLQyxZQUFMLENBQWtCSixVQUFsQixFQURGLEtBRUssS0FBS0ssV0FBTCxDQUFpQkwsVUFBakI7QUFDTjtBQUNGO0FBQ0Y7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQU0saUJBQWU7QUFDYixXQUFPLEtBQUtSLElBQUwsQ0FBVVMsZ0JBQWpCO0FBQ0Q7O0FBRUQsUUFBTUMsT0FBTixHQUFnQjtBQUNkLFFBQUlDLE1BQU0sRUFBVjtBQUNBLFNBQUssSUFBSUMsUUFBUSxDQUFqQixFQUFvQkEsUUFBUSxLQUFLWixJQUFMLENBQVVTLGdCQUFWLENBQTJCSSxNQUF2RCxFQUErREQsT0FBL0QsRUFBd0U7QUFDdEUsWUFBTUUsVUFBVSxLQUFLZCxJQUFMLENBQVVTLGdCQUFWLENBQTJCRyxLQUEzQixDQUFoQjtBQUNBRCxVQUFJSSxJQUFKLEVBQVMsTUFBTUMscUJBQVVDLFdBQVYsQ0FBc0IsS0FBS3hCLFlBQUwsQ0FBa0J5QixRQUFsQixDQUNuQ0osT0FEbUMsQ0FBdEIsQ0FBZjtBQUVEO0FBQ0QsV0FBT0gsR0FBUDtBQUNEOztBQUVEUSx3QkFBc0JDLFlBQXRCLEVBQW9DQyxRQUFwQyxFQUE4Q0MsUUFBOUMsRUFBd0Q7QUFDdEQsUUFBSUQsU0FBU0UsVUFBVCxDQUFvQkMsR0FBcEIsRUFBSixFQUErQjtBQUM3QixVQUFJRixRQUFKLEVBQWM7QUFDWk4sNkJBQVVTLFdBQVYsQ0FBc0IsS0FBSy9CLFNBQUwsQ0FBZTBCLGVBQWUsR0FBOUIsQ0FBdEIsRUFBMERDLFFBQTFEO0FBQ0QsT0FGRCxNQUVPO0FBQ0xMLDZCQUFVUyxXQUFWLENBQXNCLEtBQUsvQixTQUFMLENBQWUwQixlQUFlLEdBQTlCLENBQXRCLEVBQTBEQyxRQUExRDtBQUNEO0FBQ0YsS0FORCxNQU1PO0FBQ0xMLDJCQUFVUyxXQUFWLENBQXNCLEtBQUsvQixTQUFMLENBQWUwQixlQUFlLEdBQTlCLENBQXRCLEVBQTBEQyxRQUExRDtBQUNEO0FBQ0Y7O0FBRURLLGdCQUFjO0FBQ1osV0FBTyxLQUFLaEMsU0FBTCxDQUFlbUIsTUFBZixLQUEwQixDQUFqQztBQUNEOztBQUVEYyw0QkFBMEJOLFFBQTFCLEVBQW9DUCxPQUFwQyxFQUE2QztBQUMzQyxRQUFJbkIsT0FBTzBCLFNBQVNPLElBQVQsQ0FBY0osR0FBZCxFQUFYO0FBQ0E3QixXQUFPQSxLQUFLa0MsTUFBTCxDQUFZLEdBQVosQ0FBUDtBQUNBLFFBQUksT0FBT2YsT0FBUCxLQUFtQixXQUF2QixFQUFvQyxLQUFLUCxXQUFMLENBQWlCYyxRQUFqQixFQUEyQjFCLElBQTNCLEVBQXBDLEtBQ0ssS0FBS21DLGdCQUFMLENBQXNCVCxRQUF0QixFQUFnQzFCLElBQWhDLEVBQXNDbUIsT0FBdEM7QUFDTjs7QUFFRGlCLDJCQUF5QlYsUUFBekIsRUFBbUNQLE9BQW5DLEVBQTRDO0FBQzFDLFFBQUluQixPQUFPMEIsU0FBU08sSUFBVCxDQUFjSixHQUFkLEVBQVg7QUFDQTdCLFdBQU9BLEtBQUtrQyxNQUFMLENBQVksR0FBWixDQUFQO0FBQ0EsUUFBSSxPQUFPZixPQUFQLEtBQW1CLFdBQXZCLEVBQW9DLEtBQUtQLFdBQUwsQ0FBaUJjLFFBQWpCLEVBQTJCMUIsSUFBM0IsRUFBcEMsS0FDSyxLQUFLbUMsZ0JBQUwsQ0FBc0JULFFBQXRCLEVBQWdDMUIsSUFBaEMsRUFBc0NtQixPQUF0QztBQUNOOztBQUVEa0IseUJBQXVCWCxRQUF2QixFQUFpQ1AsT0FBakMsRUFBMEM7QUFDeEMsUUFBSW5CLE9BQU8wQixTQUFTTyxJQUFULENBQWNKLEdBQWQsRUFBWDtBQUNBN0IsV0FBT0EsS0FBS2tDLE1BQUwsQ0FBWSxHQUFaLENBQVA7QUFDQSxRQUFJLE9BQU9mLE9BQVAsS0FBbUIsV0FBdkIsRUFBb0MsS0FBS1AsV0FBTCxDQUFpQmMsUUFBakIsRUFBMkIxQixJQUEzQixFQUFwQyxLQUNLLEtBQUttQyxnQkFBTCxDQUFzQlQsUUFBdEIsRUFBZ0MxQixJQUFoQyxFQUFzQ21CLE9BQXRDO0FBQ047O0FBRURQLGNBQVljLFFBQVosRUFBc0IxQixJQUF0QixFQUE0QjtBQUMxQixRQUFJLENBQUMsS0FBS0YsWUFBTCxDQUFrQndDLFVBQWxCLENBQTZCWixTQUFTTyxJQUFULENBQWNKLEdBQWQsRUFBN0IsQ0FBTCxFQUF3RDtBQUN0RCxVQUFJVSxVQUFVYixTQUFTTyxJQUFULENBQWNKLEdBQWQsRUFBZDtBQUNBLFVBQUksT0FBTzdCLElBQVAsS0FBZ0IsV0FBcEIsRUFBaUM7QUFDL0J1QyxrQkFBVXZDLElBQVY7QUFDRDtBQUNELFVBQUksT0FBTyxLQUFLRCxTQUFMLENBQWV3QyxPQUFmLENBQVAsS0FBbUMsV0FBdkMsRUFDRSxLQUFLeEMsU0FBTCxDQUFld0MsT0FBZixFQUF3Qm5CLElBQXhCLENBQTZCTSxRQUE3QixFQURGLEtBRUs7QUFDSCxZQUFJYyxPQUFPLElBQUk5QixHQUFKLEVBQVg7QUFDQThCLGFBQUtwQixJQUFMLENBQVVNLFFBQVY7QUFDQSxhQUFLM0IsU0FBTCxDQUFlSSxRQUFmLENBQXdCO0FBQ3RCLFdBQUNvQyxPQUFELEdBQVdDO0FBRFcsU0FBeEI7QUFHRDtBQUNGLEtBZEQsTUFjTztBQUNMQyxjQUFRQyxHQUFSLENBQ0VoQixTQUFTTyxJQUFULENBQWNKLEdBQWQsS0FDQSxrQkFEQSxHQUVBLEtBQUsvQixZQUFMLENBQWtCNkMsc0JBQWxCLENBQXlDakIsU0FBU08sSUFBVCxDQUFjSixHQUFkLEVBQXpDLENBSEY7QUFLRDtBQUNGOztBQUVETSxtQkFBaUJULFFBQWpCLEVBQTJCMUIsSUFBM0IsRUFBaUNtQixPQUFqQyxFQUEwQztBQUN4QyxRQUFJLEtBQUtyQixZQUFMLENBQWtCOEMseUJBQWxCLENBQTRDbEIsU0FBU08sSUFBVCxDQUFjSixHQUFkLEVBQTVDLEVBQ0FWLE9BREEsQ0FBSixFQUNjO0FBQ1osVUFBSSxLQUFLckIsWUFBTCxDQUFrQitDLFdBQWxCLENBQThCMUIsT0FBOUIsQ0FBSixFQUE0QztBQUMxQyxZQUFJb0IsVUFBVWIsU0FBU08sSUFBVCxDQUFjSixHQUFkLEVBQWQ7QUFDQSxZQUFJLE9BQU83QixJQUFQLEtBQWdCLFdBQXBCLEVBQWlDO0FBQy9CdUMsb0JBQVV2QyxJQUFWO0FBQ0Q7QUFDRCxZQUFJLE9BQU8sS0FBS0QsU0FBTCxDQUFld0MsT0FBZixDQUFQLEtBQW1DLFdBQXZDLEVBQ0UsS0FBS3hDLFNBQUwsQ0FBZXdDLE9BQWYsRUFBd0JuQixJQUF4QixDQUE2Qk0sUUFBN0IsRUFERixLQUVLO0FBQ0gsY0FBSWMsT0FBTyxJQUFJOUIsR0FBSixFQUFYO0FBQ0E4QixlQUFLcEIsSUFBTCxDQUFVTSxRQUFWO0FBQ0EsZUFBSzNCLFNBQUwsQ0FBZUksUUFBZixDQUF3QjtBQUN0QixhQUFDb0MsT0FBRCxHQUFXQztBQURXLFdBQXhCO0FBR0Q7QUFDRCxZQUFJLE9BQU8sS0FBS25DLElBQUwsQ0FBVWMsT0FBVixDQUFQLEtBQThCLFdBQWxDLEVBQ0UsS0FBS2QsSUFBTCxDQUFVYyxPQUFWLEVBQW1CaEIsUUFBbkIsQ0FBNEI7QUFDMUIsV0FBQ3VCLFNBQVNPLElBQVQsQ0FBY0osR0FBZCxFQUFELEdBQXVCSDtBQURHLFNBQTVCLEVBREYsS0FJSztBQUNILGNBQUljLE9BQU8sSUFBSTlDLEtBQUosRUFBWDtBQUNBOEMsZUFBS3JDLFFBQUwsQ0FBYztBQUNaLGFBQUN1QixTQUFTTyxJQUFULENBQWNKLEdBQWQsRUFBRCxHQUF1Qkg7QUFEWCxXQUFkO0FBR0EsZUFBS3JCLElBQUwsQ0FBVUYsUUFBVixDQUFtQjtBQUNqQixhQUFDZ0IsT0FBRCxHQUFXcUI7QUFETSxXQUFuQjtBQUdEO0FBQ0YsT0EzQkQsTUEyQk87QUFDTEMsZ0JBQVFLLEtBQVIsQ0FBYzNCLFVBQVUsaUJBQXhCO0FBQ0Q7QUFDRixLQWhDRCxNQWdDTztBQUNMc0IsY0FBUUMsR0FBUixDQUNFaEIsU0FBU08sSUFBVCxDQUFjSixHQUFkLEtBQ0Esa0JBREEsR0FFQSxLQUFLL0IsWUFBTCxDQUFrQjZDLHNCQUFsQixDQUF5Q2pCLFNBQVNPLElBQVQsQ0FBY0osR0FBZCxFQUF6QyxDQUhGO0FBS0Q7QUFDRjs7QUFFRGtCLG9CQUFrQnRCLFlBQWxCLEVBQWdDNUIsT0FBaEMsRUFBeUMrQixhQUFhLEtBQXRELEVBQTZEO0FBQzNELFFBQUksQ0FBQyxLQUFLOUIsWUFBTCxDQUFrQndDLFVBQWxCLENBQTZCYixZQUE3QixDQUFMLEVBQWlEO0FBQy9DLFVBQUl1QixRQUFRLEtBQUtsRCxZQUFMLENBQWtCbUQsT0FBbEIsQ0FBMEJwRCxPQUExQixDQUFaO0FBQ0EsVUFBSXFELE1BQU0sSUFBSUMsd0JBQUosQ0FBbUIxQixZQUFuQixFQUFpQyxDQUFDLElBQUQsQ0FBakMsRUFBeUMsQ0FBQ3VCLEtBQUQsQ0FBekMsRUFDUnBCLFVBRFEsQ0FBVjtBQUVBLFdBQUs5QixZQUFMLENBQWtCYyxXQUFsQixDQUE4QnNDLEdBQTlCO0FBQ0EsYUFBT0EsR0FBUDtBQUNELEtBTkQsTUFNTztBQUNMVCxjQUFRQyxHQUFSLENBQ0VqQixlQUNBLGtCQURBLEdBRUEsS0FBSzNCLFlBQUwsQ0FBa0I2QyxzQkFBbEIsQ0FBeUNsQixZQUF6QyxDQUhGO0FBS0Q7QUFDRjs7QUFFRDJCLHlCQUF1QmpDLE9BQXZCLEVBQWdDTSxZQUFoQyxFQUE4QzVCLE9BQTlDLEVBQXVEK0IsYUFBYSxLQUFwRSxFQUEyRTtBQUN6RSxRQUFJLEtBQUs5QixZQUFMLENBQWtCOEMseUJBQWxCLENBQTRDbkIsWUFBNUMsRUFBMEROLE9BQTFELENBQUosRUFBd0U7QUFDdEUsVUFBSSxLQUFLckIsWUFBTCxDQUFrQitDLFdBQWxCLENBQThCMUIsT0FBOUIsQ0FBSixFQUE0QztBQUMxQyxZQUFJNkIsUUFBUSxLQUFLbEQsWUFBTCxDQUFrQm1ELE9BQWxCLENBQTBCcEQsT0FBMUIsQ0FBWjtBQUNBLFlBQUlxRCxNQUFNLElBQUlDLHdCQUFKLENBQW1CMUIsWUFBbkIsRUFBaUMsQ0FBQyxJQUFELENBQWpDLEVBQXlDLENBQUN1QixLQUFELENBQXpDLEVBQ1JwQixVQURRLENBQVY7QUFFQSxhQUFLOUIsWUFBTCxDQUFrQmMsV0FBbEIsQ0FBOEJzQyxHQUE5QixFQUFtQy9CLE9BQW5DO0FBQ0EsZUFBTytCLEdBQVA7QUFDRCxPQU5ELE1BTU87QUFDTFQsZ0JBQVFLLEtBQVIsQ0FBYzNCLFVBQVUsaUJBQXhCO0FBQ0Q7QUFDRixLQVZELE1BVU87QUFDTHNCLGNBQVFDLEdBQVIsQ0FDRWpCLGVBQ0Esa0JBREEsR0FFQSxLQUFLM0IsWUFBTCxDQUFrQjZDLHNCQUFsQixDQUF5Q2xCLFlBQXpDLENBSEY7QUFLRDtBQUNGOztBQUVENEIsd0JBQ0U1QixZQURGLEVBRUU1QixPQUZGLEVBR0UrQixhQUFhLEtBSGYsRUFJRUQsV0FBVyxLQUpiLEVBS0U7QUFDQSxRQUFJLENBQUMsS0FBSzdCLFlBQUwsQ0FBa0J3QyxVQUFsQixDQUE2QmIsWUFBN0IsQ0FBTCxFQUFpRDtBQUMvQyxVQUFJdUIsUUFBUSxLQUFLbEQsWUFBTCxDQUFrQm1ELE9BQWxCLENBQTBCcEQsT0FBMUIsQ0FBWjtBQUNBLFVBQUl5RCxvQkFBb0IsS0FBS0MsWUFBTCxFQUF4QjtBQUNBLFdBQUssSUFBSXRDLFFBQVEsQ0FBakIsRUFBb0JBLFFBQVFxQyxrQkFBa0JwQyxNQUE5QyxFQUFzREQsT0FBdEQsRUFBK0Q7QUFDN0QsY0FBTVMsV0FBVzRCLGtCQUFrQnJDLEtBQWxCLENBQWpCO0FBQ0EsWUFDRVEsaUJBQWlCQSxZQUFqQixJQUNBRyxlQUFlRixTQUFTRSxVQUFULENBQW9CQyxHQUFwQixFQUZqQixFQUdFO0FBQ0EsY0FBSUQsVUFBSixFQUFnQjtBQUNkLGdCQUFJRCxRQUFKLEVBQWM7QUFDWkQsdUJBQVM4QixrQkFBVCxDQUE0QlIsS0FBNUI7QUFDQUEsb0JBQU1oQix5QkFBTixDQUFnQ04sUUFBaEM7QUFDQSxxQkFBT0EsUUFBUDtBQUNELGFBSkQsTUFJTztBQUNMQSx1QkFBUytCLGtCQUFULENBQTRCVCxLQUE1QjtBQUNBQSxvQkFBTVosd0JBQU4sQ0FBK0JWLFFBQS9CO0FBQ0EscUJBQU9BLFFBQVA7QUFDRDtBQUNGLFdBVkQsTUFVTztBQUNMQSxxQkFBUytCLGtCQUFULENBQTRCVCxLQUE1QjtBQUNBQSxrQkFBTVgsc0JBQU4sQ0FBNkJYLFFBQTdCO0FBQ0EsbUJBQU9BLFFBQVA7QUFDRDtBQUNGO0FBQ0Y7QUFDRCxVQUFJd0IsTUFBTSxLQUFLSCxpQkFBTCxDQUF1QnRCLFlBQXZCLEVBQXFDNUIsT0FBckMsRUFBOEMrQixVQUE5QyxDQUFWO0FBQ0EsYUFBT3NCLEdBQVA7QUFDRCxLQTVCRCxNQTRCTztBQUNMVCxjQUFRQyxHQUFSLENBQ0VqQixlQUNBLGtCQURBLEdBRUEsS0FBSzNCLFlBQUwsQ0FBa0I2QyxzQkFBbEIsQ0FBeUNsQixZQUF6QyxDQUhGO0FBS0Q7QUFDRjs7QUFFRGlDLDZCQUNFdkMsT0FERixFQUVFTSxZQUZGLEVBR0U1QixPQUhGLEVBSUUrQixhQUFhLEtBSmYsRUFLRUQsV0FBVyxLQUxiLEVBTUU7QUFDQSxRQUFJLEtBQUs3QixZQUFMLENBQWtCOEMseUJBQWxCLENBQTRDbkIsWUFBNUMsRUFBMEROLE9BQTFELENBQUosRUFBd0U7QUFDdEUsVUFBSSxLQUFLckIsWUFBTCxDQUFrQitDLFdBQWxCLENBQThCMUIsT0FBOUIsQ0FBSixFQUE0QztBQUMxQyxZQUFJNkIsUUFBUSxLQUFLbEQsWUFBTCxDQUFrQm1ELE9BQWxCLENBQTBCcEQsT0FBMUIsQ0FBWjtBQUNBLFlBQUksT0FBTyxLQUFLUSxJQUFMLENBQVVjLE9BQVYsQ0FBUCxLQUE4QixXQUFsQyxFQUErQztBQUM3QyxjQUFJd0MsZUFBZSxLQUFLQyxxQkFBTCxDQUEyQnpDLE9BQTNCLENBQW5CO0FBQ0EsZUFBSyxJQUFJRixRQUFRLENBQWpCLEVBQW9CQSxRQUFRMEMsYUFBYXpDLE1BQXpDLEVBQWlERCxPQUFqRCxFQUEwRDtBQUN4RCxrQkFBTVMsV0FBV2lDLGFBQWExQyxLQUFiLENBQWpCO0FBQ0EsZ0JBQ0VTLFNBQVNPLElBQVQsQ0FBY0osR0FBZCxPQUF3QkosWUFBeEIsSUFDQUcsZUFBZUYsU0FBU0UsVUFBVCxDQUFvQkMsR0FBcEIsRUFGakIsRUFHRTtBQUNBLGtCQUFJRCxVQUFKLEVBQWdCO0FBQ2Qsb0JBQUlELFFBQUosRUFBYztBQUNaRCwyQkFBUzhCLGtCQUFULENBQTRCUixLQUE1QjtBQUNBQSx3QkFBTWhCLHlCQUFOLENBQWdDTixRQUFoQyxFQUEwQ1AsT0FBMUM7QUFDQSx5QkFBT08sUUFBUDtBQUNELGlCQUpELE1BSU87QUFDTEEsMkJBQVMrQixrQkFBVCxDQUE0QlQsS0FBNUI7QUFDQUEsd0JBQU1aLHdCQUFOLENBQStCVixRQUEvQixFQUF5Q1AsT0FBekM7QUFDQSx5QkFBT08sUUFBUDtBQUNEO0FBQ0YsZUFWRCxNQVVPO0FBQ0xBLHlCQUFTK0Isa0JBQVQsQ0FBNEJULEtBQTVCO0FBQ0FBLHNCQUFNWCxzQkFBTixDQUE2QlgsUUFBN0IsRUFBdUNQLE9BQXZDO0FBQ0EsdUJBQU9PLFFBQVA7QUFDRDtBQUNGO0FBQ0Y7QUFDRjtBQUNELFlBQUl3QixNQUFNLEtBQUtFLHNCQUFMLENBQ1JqQyxPQURRLEVBRVJNLFlBRlEsRUFHUjVCLE9BSFEsRUFJUitCLFVBSlEsQ0FBVjtBQU1BLGVBQU9zQixHQUFQO0FBQ0QsT0FuQ0QsTUFtQ087QUFDTFQsZ0JBQVFLLEtBQVIsQ0FBYzNCLFVBQVUsaUJBQXhCO0FBQ0Q7QUFDRHNCLGNBQVFDLEdBQVIsQ0FDRWpCLGVBQ0Esa0JBREEsR0FFQSxLQUFLM0IsWUFBTCxDQUFrQjZDLHNCQUFsQixDQUF5Q2xCLFlBQXpDLENBSEY7QUFLRDtBQUNGOztBQUtEb0MsZUFBYUMsU0FBYixFQUF3QmxFLEtBQXhCLEVBQStCO0FBQzdCLFFBQUltRSxXQUFXLEtBQWY7QUFDQSxRQUFJL0QsT0FBTzhELFVBQVU3QixJQUFWLENBQWVKLEdBQWYsRUFBWDtBQUNBLFFBQUksT0FBT2pDLEtBQVAsS0FBaUIsV0FBckIsRUFBa0M7QUFDaENJLGFBQU9KLEtBQVA7QUFDRDtBQUNELFFBQUksT0FBTyxLQUFLRyxTQUFMLENBQWUrRCxVQUFVN0IsSUFBVixDQUFlSixHQUFmLEVBQWYsQ0FBUCxLQUFnRCxXQUFwRCxFQUFpRTtBQUMvRCxVQUFJaUMsVUFBVWxDLFVBQVYsQ0FBcUJDLEdBQXJCLEVBQUosRUFBZ0M7QUFDOUIsYUFDRSxJQUFJWixRQUFRLENBRGQsRUFDaUJBLFFBQVEsS0FBS2xCLFNBQUwsQ0FBZStELFVBQVU3QixJQUFWLENBQWVKLEdBQWYsRUFBZixFQUFxQ1gsTUFEOUQsRUFDc0VELE9BRHRFLEVBRUU7QUFDQSxnQkFBTXBCLFVBQVUsS0FBS0UsU0FBTCxDQUFlK0QsVUFBVTdCLElBQVYsQ0FBZUosR0FBZixFQUFmLEVBQXFDWixLQUFyQyxDQUFoQjtBQUNBLGNBQ0VJLHFCQUFVMkMsV0FBVixDQUNFRixVQUFVRyxlQUFWLEVBREYsRUFFRXBFLFFBQVFvRSxlQUFSLEVBRkYsQ0FERixFQUtFO0FBQ0FwRSxvQkFBUXFFLGlDQUFSLENBQTBDSixVQUFVSyxTQUFwRDtBQUNELFdBUEQsTUFPTztBQUNMdEUsb0JBQVF1QixJQUFSLENBQWEwQyxTQUFiO0FBQ0FDLHVCQUFXLElBQVg7QUFDRDtBQUNGO0FBQ0YsT0FqQkQsTUFpQk87QUFDTCxhQUFLaEUsU0FBTCxDQUFlK0QsVUFBVTdCLElBQVYsQ0FBZUosR0FBZixFQUFmLEVBQXFDdUMsZ0NBQXJDLENBQ0VOLFNBREY7QUFHRDtBQUNGLEtBdkJELE1BdUJPO0FBQ0wsVUFBSUEsVUFBVWxDLFVBQVYsQ0FBcUJDLEdBQXJCLEVBQUosRUFBZ0M7QUFDOUIsWUFBSVcsT0FBTyxJQUFJOUIsR0FBSixFQUFYO0FBQ0E4QixhQUFLcEIsSUFBTCxDQUFVMEMsU0FBVjtBQUNBLGFBQUsvRCxTQUFMLENBQWVJLFFBQWYsQ0FBd0I7QUFDdEIsV0FBQ0gsSUFBRCxHQUFRd0M7QUFEYyxTQUF4QjtBQUdBLGFBQUs2QixpQkFBTCxDQUF1QlAsU0FBdkI7QUFDRCxPQVBELE1BT087QUFDTCxhQUFLL0QsU0FBTCxDQUFlSSxRQUFmLENBQXdCO0FBQ3RCLFdBQUNILElBQUQsR0FBUThEO0FBRGMsU0FBeEI7QUFHQUMsbUJBQVcsSUFBWDtBQUNEO0FBQ0Y7QUFDRCxRQUFJQSxRQUFKLEVBQWMsS0FBS00saUJBQUwsQ0FBdUJQLFNBQXZCO0FBQ2Y7O0FBRURPLG9CQUFrQlAsU0FBbEIsRUFBNkI7QUFDM0IsU0FBS2hFLFlBQUwsQ0FBa0J3RSxJQUFsQixDQUF1QnhFLGdCQUFnQjtBQUNyQ0EsbUJBQWF1RSxpQkFBYixDQUErQlAsU0FBL0I7QUFDRCxLQUZEO0FBR0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUFQLGlCQUFlO0FBQ2IsUUFBSXZDLE1BQU0sRUFBVjtBQUNBLFNBQUssSUFBSXVELElBQUksQ0FBYixFQUFnQkEsSUFBSSxLQUFLeEUsU0FBTCxDQUFlZSxnQkFBZixDQUFnQ0ksTUFBcEQsRUFBNERxRCxHQUE1RCxFQUFpRTtBQUMvRCxZQUFNQyxVQUFVLEtBQUt6RSxTQUFMLENBQWUsS0FBS0EsU0FBTCxDQUFlZSxnQkFBZixDQUFnQ3lELENBQWhDLENBQWYsQ0FBaEI7QUFDQSxXQUFLLElBQUlFLElBQUksQ0FBYixFQUFnQkEsSUFBSUQsUUFBUXRELE1BQTVCLEVBQW9DdUQsR0FBcEMsRUFBeUM7QUFDdkMsY0FBTS9DLFdBQVc4QyxRQUFRQyxDQUFSLENBQWpCO0FBQ0F6RCxZQUFJSSxJQUFKLENBQVNNLFFBQVQ7QUFDRDtBQUNGO0FBQ0QsV0FBT1YsR0FBUDtBQUNEOztBQUVEMEQscUJBQW1CekMsSUFBbkIsRUFBeUI7QUFDdkIsUUFBSWpCLE1BQU0sRUFBVjtBQUNBLFFBQUksQ0FBQ2lCLEtBQUswQyxRQUFMLENBQWMsR0FBZCxFQUFtQjFDLEtBQUtmLE1BQUwsR0FBYyxDQUFqQyxDQUFELElBQ0YsQ0FBQ2UsS0FBSzBDLFFBQUwsQ0FBYyxHQUFkLEVBQW1CMUMsS0FBS2YsTUFBTCxHQUFjLENBQWpDLENBREMsSUFFRixDQUFDZSxLQUFLMEMsUUFBTCxDQUFjLEdBQWQsRUFBbUIxQyxLQUFLZixNQUFMLEdBQWMsQ0FBakMsQ0FGSCxFQUdFO0FBQ0EsVUFBSTBELEtBQUszQyxLQUFLQyxNQUFMLENBQVksR0FBWixDQUFUO0FBQ0FsQixZQUFNSyxxQkFBVWEsTUFBVixDQUFpQmxCLEdBQWpCLEVBQXNCLEtBQUt1QyxZQUFMLENBQWtCcUIsRUFBbEIsQ0FBdEIsQ0FBTjtBQUNBLFVBQUlDLEtBQUs1QyxLQUFLQyxNQUFMLENBQVksR0FBWixDQUFUO0FBQ0FsQixZQUFNSyxxQkFBVWEsTUFBVixDQUFpQmxCLEdBQWpCLEVBQXNCLEtBQUt1QyxZQUFMLENBQWtCc0IsRUFBbEIsQ0FBdEIsQ0FBTjtBQUNBLFVBQUlDLEtBQUs3QyxLQUFLQyxNQUFMLENBQVksR0FBWixDQUFUO0FBQ0FsQixZQUFNSyxxQkFBVWEsTUFBVixDQUFpQmxCLEdBQWpCLEVBQXNCLEtBQUt1QyxZQUFMLENBQWtCdUIsRUFBbEIsQ0FBdEIsQ0FBTjtBQUNEO0FBQ0QsUUFBSSxPQUFPLEtBQUsvRSxTQUFMLENBQWVrQyxJQUFmLENBQVAsS0FBZ0MsV0FBcEMsRUFBaURqQixNQUFNLEtBQUtqQixTQUFMLENBQ3JEa0MsSUFEcUQsQ0FBTjtBQUVqRCxXQUFPakIsR0FBUDtBQUNEOztBQUVENEMsd0JBQXNCekMsT0FBdEIsRUFBK0I7QUFDN0IsUUFBSUgsTUFBTSxFQUFWO0FBQ0EsUUFBSSxLQUFLK0QsYUFBTCxDQUFtQjVELE9BQW5CLENBQUosRUFBaUM7QUFDL0IsV0FBSyxJQUFJRixRQUFRLENBQWpCLEVBQW9CQSxRQUFRLEtBQUtaLElBQUwsQ0FBVWMsT0FBVixFQUFtQkwsZ0JBQW5CLENBQW9DSSxNQUFoRSxFQUF3RUQsT0FBeEUsRUFBaUY7QUFDL0UsY0FBTStELGNBQWMsS0FBSzNFLElBQUwsQ0FBVWMsT0FBVixFQUFtQixLQUFLZCxJQUFMLENBQVVjLE9BQVYsRUFBbUJMLGdCQUFuQixDQUNyQ0csS0FEcUMsQ0FBbkIsQ0FBcEI7QUFFQUQsWUFBSUksSUFBSixDQUFTNEQsV0FBVDtBQUNEO0FBQ0QsYUFBT2hFLEdBQVA7QUFDRCxLQVBELE1BT08sT0FBT2lFLFNBQVA7QUFDUjs7QUFFREMsb0JBQWtCQyxHQUFsQixFQUF1QjtBQUNyQixRQUFJaEUsVUFBVWdFLElBQUluRixJQUFKLENBQVM2QixHQUFULEVBQWQ7QUFDQSxXQUFPLEtBQUsrQixxQkFBTCxDQUEyQnpDLE9BQTNCLENBQVA7QUFDRDs7QUFFRGlFLDhCQUE0QmpFLE9BQTVCLEVBQXFDTSxZQUFyQyxFQUFtRDtBQUNqRCxRQUFJVCxNQUFNLEVBQVY7QUFDQSxRQUFJLEtBQUtxRSw2QkFBTCxDQUFtQ2xFLE9BQW5DLEVBQTRDTSxZQUE1QyxDQUFKLEVBQStEO0FBQzdELFdBQUssSUFBSVIsUUFBUSxDQUFqQixFQUFvQkEsUUFBUSxLQUFLWixJQUFMLENBQVVjLE9BQVYsRUFBbUJMLGdCQUFuQixDQUFvQ0ksTUFBaEUsRUFBd0VELE9BQXhFLEVBQWlGO0FBQy9FLGNBQU0rRCxjQUFjLEtBQUszRSxJQUFMLENBQVVjLE9BQVYsRUFBbUIsS0FBS2QsSUFBTCxDQUFVYyxPQUFWLEVBQW1CTCxnQkFBbkIsQ0FDckNHLEtBRHFDLENBQW5CLENBQXBCO0FBRUEsWUFBSStELFlBQVkvQyxJQUFaLENBQWlCSixHQUFqQixPQUEyQkosWUFBL0IsRUFBNkNULElBQUlJLElBQUosQ0FBUzRELFdBQVQ7QUFDOUM7QUFDRCxhQUFPaEUsR0FBUDtBQUNELEtBUEQsTUFPTztBQUNMLGFBQU9pRSxTQUFQO0FBQ0Q7QUFDRjs7QUFFREssMEJBQXdCSCxHQUF4QixFQUE2QjFELFlBQTdCLEVBQTJDO0FBQ3pDLFFBQUlOLFVBQVVnRSxJQUFJbkYsSUFBSixDQUFTNkIsR0FBVCxFQUFkO0FBQ0EsV0FBTyxLQUFLdUQsMkJBQUwsQ0FBaUNqRSxPQUFqQyxFQUEwQ00sWUFBMUMsQ0FBUDtBQUVEOztBQUVEOEQsYUFBV0MsU0FBWCxFQUFzQjtBQUNwQixTQUFLLElBQUl2RSxRQUFRLENBQWpCLEVBQW9CQSxRQUFRdUUsVUFBVXRFLE1BQXRDLEVBQThDRCxPQUE5QyxFQUF1RDtBQUNyRCxZQUFNcEIsVUFBVTJGLFVBQVV2RSxLQUFWLENBQWhCO0FBQ0EsVUFBSXBCLFFBQVE0RixFQUFSLENBQVc1RCxHQUFYLE9BQXFCLEtBQUs0RCxFQUFMLENBQVE1RCxHQUFSLEVBQXpCLEVBQXdDLE9BQU8sSUFBUDtBQUN6QztBQUNELFdBQU8sS0FBUDtBQUNEOztBQUVEOztBQUVBNkQsZUFBYUMsS0FBYixFQUFvQjtBQUNsQixRQUFJQyxZQUFZLEVBQWhCO0FBQ0EsUUFBSTdGLFlBQVksS0FBS3dELFlBQUwsQ0FBa0JvQyxLQUFsQixDQUFoQjtBQUNBLFNBQUssSUFBSTFFLFFBQVEsQ0FBakIsRUFBb0JBLFFBQVFsQixVQUFVbUIsTUFBdEMsRUFBOENELE9BQTlDLEVBQXVEO0FBQ3JELFlBQU1TLFdBQVczQixVQUFVa0IsS0FBVixDQUFqQjtBQUNBLFVBQUlTLFNBQVNFLFVBQVQsQ0FBb0JDLEdBQXBCLEVBQUosRUFBK0I7QUFDN0IsWUFBSSxLQUFLMEQsVUFBTCxDQUFnQjdELFNBQVNtRSxTQUF6QixDQUFKLEVBQ0VELFlBQVl2RSxxQkFBVWEsTUFBVixDQUFpQjBELFNBQWpCLEVBQTRCbEUsU0FBU3lDLFNBQXJDLENBQVosQ0FERixLQUVLeUIsWUFBWXZFLHFCQUFVYSxNQUFWLENBQWlCMEQsU0FBakIsRUFBNEJsRSxTQUFTbUUsU0FBckMsQ0FBWjtBQUNOLE9BSkQsTUFJTztBQUNMRCxvQkFBWXZFLHFCQUFVYSxNQUFWLENBQ1YwRCxTQURVLEVBRVZ2RSxxQkFBVXlFLFlBQVYsQ0FBdUJwRSxTQUFTbUUsU0FBaEMsQ0FGVSxDQUFaO0FBSUFELG9CQUFZdkUscUJBQVVhLE1BQVYsQ0FDVjBELFNBRFUsRUFFVnZFLHFCQUFVeUUsWUFBVixDQUF1QnBFLFNBQVN5QyxTQUFoQyxDQUZVLENBQVo7QUFJRDtBQUNGO0FBQ0QsV0FBT3lCLFNBQVA7QUFDRDs7QUFFREcsaUJBQWVqQyxTQUFmLEVBQTBCO0FBQ3hCLFFBQUlrQyxjQUFjLEtBQUtqRyxTQUFMLENBQWUrRCxVQUFVN0IsSUFBVixDQUFlSixHQUFmLEVBQWYsQ0FBbEI7QUFDQSxTQUFLLElBQUlaLFFBQVEsQ0FBakIsRUFBb0JBLFFBQVErRSxZQUFZOUUsTUFBeEMsRUFBZ0RELE9BQWhELEVBQXlEO0FBQ3ZELFlBQU1nRixvQkFBb0JELFlBQVkvRSxLQUFaLENBQTFCO0FBQ0EsVUFBSTZDLFVBQVUyQixFQUFWLENBQWE1RCxHQUFiLE9BQXVCb0Usa0JBQWtCUixFQUFsQixDQUFxQjVELEdBQXJCLEVBQTNCLEVBQ0VtRSxZQUFZRSxNQUFaLENBQW1CakYsS0FBbkIsRUFBMEIsQ0FBMUI7QUFDSDtBQUNGOztBQUVEa0Ysa0JBQWdCNUYsVUFBaEIsRUFBNEI7QUFDMUIsU0FBSyxJQUFJVSxRQUFRLENBQWpCLEVBQW9CQSxRQUFRVixXQUFXVyxNQUF2QyxFQUErQ0QsT0FBL0MsRUFBd0Q7QUFDdEQsV0FBSzhFLGNBQUwsQ0FBb0J4RixXQUFXVSxLQUFYLENBQXBCO0FBQ0Q7QUFDRjs7QUFFRG1GLHFCQUFtQlQsS0FBbkIsRUFBMEI7QUFDeEIsUUFBSW5GLE1BQU1DLE9BQU4sQ0FBY2tGLEtBQWQsS0FBd0JBLGlCQUFpQmpGLEdBQTdDLEVBQ0UsS0FBSyxJQUFJTyxRQUFRLENBQWpCLEVBQW9CQSxRQUFRMEUsTUFBTXpFLE1BQWxDLEVBQTBDRCxPQUExQyxFQUFtRDtBQUNqRCxZQUFNZ0IsT0FBTzBELE1BQU0xRSxLQUFOLENBQWI7QUFDQSxXQUFLbEIsU0FBTCxDQUFlc0csUUFBZixDQUF3QnBFLElBQXhCO0FBQ0QsS0FKSCxNQUtLO0FBQ0gsV0FBS2xDLFNBQUwsQ0FBZXNHLFFBQWYsQ0FBd0JWLEtBQXhCO0FBQ0Q7QUFDRjs7QUFFRFosZ0JBQWM1RCxPQUFkLEVBQXVCO0FBQ3JCLFFBQUksT0FBTyxLQUFLZCxJQUFMLENBQVVjLE9BQVYsQ0FBUCxLQUE4QixXQUFsQyxFQUNFLE9BQU8sSUFBUCxDQURGLEtBRUs7QUFDSHNCLGNBQVE2RCxJQUFSLENBQWEsU0FBU25GLE9BQVQsR0FDWCwyQkFEVyxHQUNtQixLQUFLbkIsSUFBTCxDQUFVNkIsR0FBVixFQURoQztBQUVBLGFBQU8sS0FBUDtBQUNEO0FBQ0Y7O0FBRUR3RCxnQ0FBOEJsRSxPQUE5QixFQUF1Q00sWUFBdkMsRUFBcUQ7QUFDbkQsUUFBSSxLQUFLc0QsYUFBTCxDQUFtQjVELE9BQW5CLEtBQStCLE9BQU8sS0FBS2QsSUFBTCxDQUFVYyxPQUFWLEVBQ3RDTSxZQURzQyxDQUFQLEtBR2pDLFdBSEYsRUFJRSxPQUFPLElBQVAsQ0FKRixLQUtLO0FBQ0hnQixjQUFRNkQsSUFBUixDQUFhLGNBQWM3RSxZQUFkLEdBQ1gsMkJBRFcsR0FDbUIsS0FBS3pCLElBQUwsQ0FBVTZCLEdBQVYsRUFEbkIsR0FFWCxtQkFGVyxHQUVXVixPQUZ4QjtBQUdBLGFBQU8sS0FBUDtBQUNEO0FBQ0Y7O0FBRURvRixXQUFTO0FBQ1AsV0FBTztBQUNMZCxVQUFJLEtBQUtBLEVBQUwsQ0FBUTVELEdBQVIsRUFEQztBQUVMN0IsWUFBTSxLQUFLQSxJQUFMLENBQVU2QixHQUFWLEVBRkQ7QUFHTGhDLGVBQVM7QUFISixLQUFQO0FBS0Q7O0FBRUQyRyx3QkFBc0I7QUFDcEIsUUFBSXpHLFlBQVksRUFBaEI7QUFDQSxTQUFLLElBQUlrQixRQUFRLENBQWpCLEVBQW9CQSxRQUFRLEtBQUtzQyxZQUFMLEdBQW9CckMsTUFBaEQsRUFBd0RELE9BQXhELEVBQWlFO0FBQy9ELFlBQU1TLFdBQVcsS0FBSzZCLFlBQUwsR0FBb0J0QyxLQUFwQixDQUFqQjtBQUNBbEIsZ0JBQVVxQixJQUFWLENBQWVNLFNBQVM2RSxNQUFULEVBQWY7QUFDRDtBQUNELFdBQU87QUFDTGQsVUFBSSxLQUFLQSxFQUFMLENBQVE1RCxHQUFSLEVBREM7QUFFTDdCLFlBQU0sS0FBS0EsSUFBTCxDQUFVNkIsR0FBVixFQUZEO0FBR0xoQyxlQUFTLElBSEo7QUFJTEUsaUJBQVdBO0FBSk4sS0FBUDtBQU1EOztBQUVELFFBQU0wRyxLQUFOLEdBQWM7QUFDWixRQUFJNUcsVUFBVSxNQUFNd0IscUJBQVVDLFdBQVYsQ0FBc0IsS0FBS3pCLE9BQTNCLENBQXBCO0FBQ0EsV0FBT0EsUUFBUTRHLEtBQVIsRUFBUDtBQUNEO0FBM2dCc0Q7O2tCQUFwQ2hILFU7QUE4Z0JyQlAsV0FBV3dILGVBQVgsQ0FBMkIsQ0FBQ2pILFVBQUQsQ0FBM0IiLCJmaWxlIjoiU3BpbmFsTm9kZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHNwaW5hbENvcmUgPSByZXF1aXJlKFwic3BpbmFsLWNvcmUtY29ubmVjdG9yanNcIik7XG5jb25zdCBnbG9iYWxUeXBlID0gdHlwZW9mIHdpbmRvdyA9PT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHdpbmRvdztcbmltcG9ydCBTcGluYWxSZWxhdGlvbiBmcm9tIFwiLi9TcGluYWxSZWxhdGlvblwiO1xubGV0IGdldFZpZXdlciA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gZ2xvYmFsVHlwZS52O1xufTtcblxuaW1wb3J0IHtcbiAgVXRpbGl0aWVzXG59IGZyb20gXCIuL1V0aWxpdGllc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTcGluYWxOb2RlIGV4dGVuZHMgZ2xvYmFsVHlwZS5Nb2RlbCB7XG4gIGNvbnN0cnVjdG9yKF9uYW1lLCBlbGVtZW50LCByZWxhdGVkR3JhcGgsIHJlbGF0aW9ucywgbmFtZSA9IFwiU3BpbmFsTm9kZVwiKSB7XG4gICAgc3VwZXIoKTtcbiAgICBpZiAoRmlsZVN5c3RlbS5fc2lnX3NlcnZlcikge1xuICAgICAgdGhpcy5hZGRfYXR0cih7XG4gICAgICAgIG5hbWU6IF9uYW1lLFxuICAgICAgICBlbGVtZW50OiBuZXcgUHRyKGVsZW1lbnQpLFxuICAgICAgICByZWxhdGlvbnM6IG5ldyBNb2RlbCgpLFxuICAgICAgICBhcHBzOiBuZXcgTW9kZWwoKSxcbiAgICAgICAgcmVsYXRlZEdyYXBoOiByZWxhdGVkR3JhcGhcbiAgICAgIH0pO1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0ZWRHcmFwaCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5jbGFzc2lmeU5vZGUodGhpcyk7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIF9yZWxhdGlvbnMgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoX3JlbGF0aW9ucykgfHwgX3JlbGF0aW9ucyBpbnN0YW5jZW9mIExzdClcbiAgICAgICAgICB0aGlzLmFkZFJlbGF0aW9ucyhfcmVsYXRpb25zKTtcbiAgICAgICAgZWxzZSB0aGlzLmFkZFJlbGF0aW9uKF9yZWxhdGlvbnMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIHJlZ2lzdGVyQXBwKGFwcCkge1xuICAvLyAgIHRoaXMuYXBwcy5hZGRfYXR0cih7XG4gIC8vICAgICBbYXBwLm5hbWUuZ2V0KCldOiBuZXcgUHRyKGFwcClcbiAgLy8gICB9KVxuICAvLyB9XG5cbiAgZ2V0QXBwc05hbWVzKCkge1xuICAgIHJldHVybiB0aGlzLmFwcHMuX2F0dHJpYnV0ZV9uYW1lcztcbiAgfVxuXG4gIGFzeW5jIGdldEFwcHMoKSB7XG4gICAgbGV0IHJlcyA9IFtdXG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMuYXBwcy5fYXR0cmlidXRlX25hbWVzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgYXBwTmFtZSA9IHRoaXMuYXBwcy5fYXR0cmlidXRlX25hbWVzW2luZGV4XTtcbiAgICAgIHJlcy5wdXNoKGF3YWl0IFV0aWxpdGllcy5wcm9taXNlTG9hZCh0aGlzLnJlbGF0ZWRHcmFwaC5hcHBzTGlzdFtcbiAgICAgICAgYXBwTmFtZV0pKVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgY2hhbmdlRGVmYXVsdFJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgcmVsYXRpb24sIGFzUGFyZW50KSB7XG4gICAgaWYgKHJlbGF0aW9uLmlzRGlyZWN0ZWQuZ2V0KCkpIHtcbiAgICAgIGlmIChhc1BhcmVudCkge1xuICAgICAgICBVdGlsaXRpZXMucHV0T25Ub3BMc3QodGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCI+XCJdLCByZWxhdGlvbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBVdGlsaXRpZXMucHV0T25Ub3BMc3QodGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCI8XCJdLCByZWxhdGlvbik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIFV0aWxpdGllcy5wdXRPblRvcExzdCh0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIi1cIl0sIHJlbGF0aW9uKTtcbiAgICB9XG4gIH1cblxuICBoYXNSZWxhdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5yZWxhdGlvbnMubGVuZ3RoICE9PSAwO1xuICB9XG5cbiAgYWRkRGlyZWN0ZWRSZWxhdGlvblBhcmVudChyZWxhdGlvbiwgYXBwTmFtZSkge1xuICAgIGxldCBuYW1lID0gcmVsYXRpb24udHlwZS5nZXQoKTtcbiAgICBuYW1lID0gbmFtZS5jb25jYXQoXCI+XCIpO1xuICAgIGlmICh0eXBlb2YgYXBwTmFtZSA9PT0gXCJ1bmRlZmluZWRcIikgdGhpcy5hZGRSZWxhdGlvbihyZWxhdGlvbiwgbmFtZSk7XG4gICAgZWxzZSB0aGlzLmFkZFJlbGF0aW9uQnlBcHAocmVsYXRpb24sIG5hbWUsIGFwcE5hbWUpO1xuICB9XG5cbiAgYWRkRGlyZWN0ZWRSZWxhdGlvbkNoaWxkKHJlbGF0aW9uLCBhcHBOYW1lKSB7XG4gICAgbGV0IG5hbWUgPSByZWxhdGlvbi50eXBlLmdldCgpO1xuICAgIG5hbWUgPSBuYW1lLmNvbmNhdChcIjxcIik7XG4gICAgaWYgKHR5cGVvZiBhcHBOYW1lID09PSBcInVuZGVmaW5lZFwiKSB0aGlzLmFkZFJlbGF0aW9uKHJlbGF0aW9uLCBuYW1lKTtcbiAgICBlbHNlIHRoaXMuYWRkUmVsYXRpb25CeUFwcChyZWxhdGlvbiwgbmFtZSwgYXBwTmFtZSk7XG4gIH1cblxuICBhZGROb25EaXJlY3RlZFJlbGF0aW9uKHJlbGF0aW9uLCBhcHBOYW1lKSB7XG4gICAgbGV0IG5hbWUgPSByZWxhdGlvbi50eXBlLmdldCgpO1xuICAgIG5hbWUgPSBuYW1lLmNvbmNhdChcIi1cIik7XG4gICAgaWYgKHR5cGVvZiBhcHBOYW1lID09PSBcInVuZGVmaW5lZFwiKSB0aGlzLmFkZFJlbGF0aW9uKHJlbGF0aW9uLCBuYW1lKTtcbiAgICBlbHNlIHRoaXMuYWRkUmVsYXRpb25CeUFwcChyZWxhdGlvbiwgbmFtZSwgYXBwTmFtZSk7XG4gIH1cblxuICBhZGRSZWxhdGlvbihyZWxhdGlvbiwgbmFtZSkge1xuICAgIGlmICghdGhpcy5yZWxhdGVkR3JhcGguaXNSZXNlcnZlZChyZWxhdGlvbi50eXBlLmdldCgpKSkge1xuICAgICAgbGV0IG5hbWVUbXAgPSByZWxhdGlvbi50eXBlLmdldCgpO1xuICAgICAgaWYgKHR5cGVvZiBuYW1lICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIG5hbWVUbXAgPSBuYW1lO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0aW9uc1tuYW1lVG1wXSAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgICAgdGhpcy5yZWxhdGlvbnNbbmFtZVRtcF0ucHVzaChyZWxhdGlvbik7XG4gICAgICBlbHNlIHtcbiAgICAgICAgbGV0IGxpc3QgPSBuZXcgTHN0KCk7XG4gICAgICAgIGxpc3QucHVzaChyZWxhdGlvbik7XG4gICAgICAgIHRoaXMucmVsYXRpb25zLmFkZF9hdHRyKHtcbiAgICAgICAgICBbbmFtZVRtcF06IGxpc3RcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICByZWxhdGlvbi50eXBlLmdldCgpICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uLnR5cGUuZ2V0KCldXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGFkZFJlbGF0aW9uQnlBcHAocmVsYXRpb24sIG5hbWUsIGFwcE5hbWUpIHtcbiAgICBpZiAodGhpcy5yZWxhdGVkR3JhcGguaGFzUmVzZXJ2YXRpb25DcmVkZW50aWFscyhyZWxhdGlvbi50eXBlLmdldCgpLFxuICAgICAgICBhcHBOYW1lKSkge1xuICAgICAgaWYgKHRoaXMucmVsYXRlZEdyYXBoLmNvbnRhaW5zQXBwKGFwcE5hbWUpKSB7XG4gICAgICAgIGxldCBuYW1lVG1wID0gcmVsYXRpb24udHlwZS5nZXQoKTtcbiAgICAgICAgaWYgKHR5cGVvZiBuYW1lICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgbmFtZVRtcCA9IG5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0aW9uc1tuYW1lVG1wXSAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgICAgICB0aGlzLnJlbGF0aW9uc1tuYW1lVG1wXS5wdXNoKHJlbGF0aW9uKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgbGV0IGxpc3QgPSBuZXcgTHN0KCk7XG4gICAgICAgICAgbGlzdC5wdXNoKHJlbGF0aW9uKTtcbiAgICAgICAgICB0aGlzLnJlbGF0aW9ucy5hZGRfYXR0cih7XG4gICAgICAgICAgICBbbmFtZVRtcF06IGxpc3RcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHRoaXMuYXBwc1thcHBOYW1lXSAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgICAgICB0aGlzLmFwcHNbYXBwTmFtZV0uYWRkX2F0dHIoe1xuICAgICAgICAgICAgW3JlbGF0aW9uLnR5cGUuZ2V0KCldOiByZWxhdGlvblxuICAgICAgICAgIH0pO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBsZXQgbGlzdCA9IG5ldyBNb2RlbCgpO1xuICAgICAgICAgIGxpc3QuYWRkX2F0dHIoe1xuICAgICAgICAgICAgW3JlbGF0aW9uLnR5cGUuZ2V0KCldOiByZWxhdGlvblxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMuYXBwcy5hZGRfYXR0cih7XG4gICAgICAgICAgICBbYXBwTmFtZV06IGxpc3RcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihhcHBOYW1lICsgXCIgZG9lcyBub3QgZXhpc3RcIik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICByZWxhdGlvbi50eXBlLmdldCgpICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uLnR5cGUuZ2V0KCldXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGFkZFNpbXBsZVJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgZWxlbWVudCwgaXNEaXJlY3RlZCA9IGZhbHNlKSB7XG4gICAgaWYgKCF0aGlzLnJlbGF0ZWRHcmFwaC5pc1Jlc2VydmVkKHJlbGF0aW9uVHlwZSkpIHtcbiAgICAgIGxldCBub2RlMiA9IHRoaXMucmVsYXRlZEdyYXBoLmFkZE5vZGUoZWxlbWVudCk7XG4gICAgICBsZXQgcmVsID0gbmV3IFNwaW5hbFJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgW3RoaXNdLCBbbm9kZTJdLFxuICAgICAgICBpc0RpcmVjdGVkKTtcbiAgICAgIHRoaXMucmVsYXRlZEdyYXBoLmFkZFJlbGF0aW9uKHJlbCk7XG4gICAgICByZXR1cm4gcmVsO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uVHlwZV1cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgYWRkU2ltcGxlUmVsYXRpb25CeUFwcChhcHBOYW1lLCByZWxhdGlvblR5cGUsIGVsZW1lbnQsIGlzRGlyZWN0ZWQgPSBmYWxzZSkge1xuICAgIGlmICh0aGlzLnJlbGF0ZWRHcmFwaC5oYXNSZXNlcnZhdGlvbkNyZWRlbnRpYWxzKHJlbGF0aW9uVHlwZSwgYXBwTmFtZSkpIHtcbiAgICAgIGlmICh0aGlzLnJlbGF0ZWRHcmFwaC5jb250YWluc0FwcChhcHBOYW1lKSkge1xuICAgICAgICBsZXQgbm9kZTIgPSB0aGlzLnJlbGF0ZWRHcmFwaC5hZGROb2RlKGVsZW1lbnQpO1xuICAgICAgICBsZXQgcmVsID0gbmV3IFNwaW5hbFJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgW3RoaXNdLCBbbm9kZTJdLFxuICAgICAgICAgIGlzRGlyZWN0ZWQpO1xuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5hZGRSZWxhdGlvbihyZWwsIGFwcE5hbWUpO1xuICAgICAgICByZXR1cm4gcmVsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihhcHBOYW1lICsgXCIgZG9lcyBub3QgZXhpc3RcIik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICByZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVsYXRlZEdyYXBoLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBhZGRUb0V4aXN0aW5nUmVsYXRpb24oXG4gICAgcmVsYXRpb25UeXBlLFxuICAgIGVsZW1lbnQsXG4gICAgaXNEaXJlY3RlZCA9IGZhbHNlLFxuICAgIGFzUGFyZW50ID0gZmFsc2VcbiAgKSB7XG4gICAgaWYgKCF0aGlzLnJlbGF0ZWRHcmFwaC5pc1Jlc2VydmVkKHJlbGF0aW9uVHlwZSkpIHtcbiAgICAgIGxldCBub2RlMiA9IHRoaXMucmVsYXRlZEdyYXBoLmFkZE5vZGUoZWxlbWVudCk7XG4gICAgICBsZXQgZXhpc3RpbmdSZWxhdGlvbnMgPSB0aGlzLmdldFJlbGF0aW9ucygpO1xuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGV4aXN0aW5nUmVsYXRpb25zLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCByZWxhdGlvbiA9IGV4aXN0aW5nUmVsYXRpb25zW2luZGV4XTtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIHJlbGF0aW9uVHlwZSA9PT0gcmVsYXRpb25UeXBlICYmXG4gICAgICAgICAgaXNEaXJlY3RlZCA9PT0gcmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKVxuICAgICAgICApIHtcbiAgICAgICAgICBpZiAoaXNEaXJlY3RlZCkge1xuICAgICAgICAgICAgaWYgKGFzUGFyZW50KSB7XG4gICAgICAgICAgICAgIHJlbGF0aW9uLmFkZE5vZGV0b05vZGVMaXN0MShub2RlMik7XG4gICAgICAgICAgICAgIG5vZGUyLmFkZERpcmVjdGVkUmVsYXRpb25QYXJlbnQocmVsYXRpb24pO1xuICAgICAgICAgICAgICByZXR1cm4gcmVsYXRpb247XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZWxhdGlvbi5hZGROb2RldG9Ob2RlTGlzdDIobm9kZTIpO1xuICAgICAgICAgICAgICBub2RlMi5hZGREaXJlY3RlZFJlbGF0aW9uQ2hpbGQocmVsYXRpb24pO1xuICAgICAgICAgICAgICByZXR1cm4gcmVsYXRpb247XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlbGF0aW9uLmFkZE5vZGV0b05vZGVMaXN0Mihub2RlMik7XG4gICAgICAgICAgICBub2RlMi5hZGROb25EaXJlY3RlZFJlbGF0aW9uKHJlbGF0aW9uKTtcbiAgICAgICAgICAgIHJldHVybiByZWxhdGlvbjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGxldCByZWwgPSB0aGlzLmFkZFNpbXBsZVJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgZWxlbWVudCwgaXNEaXJlY3RlZCk7XG4gICAgICByZXR1cm4gcmVsO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaC5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uVHlwZV1cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgYWRkVG9FeGlzdGluZ1JlbGF0aW9uQnlBcHAoXG4gICAgYXBwTmFtZSxcbiAgICByZWxhdGlvblR5cGUsXG4gICAgZWxlbWVudCxcbiAgICBpc0RpcmVjdGVkID0gZmFsc2UsXG4gICAgYXNQYXJlbnQgPSBmYWxzZVxuICApIHtcbiAgICBpZiAodGhpcy5yZWxhdGVkR3JhcGguaGFzUmVzZXJ2YXRpb25DcmVkZW50aWFscyhyZWxhdGlvblR5cGUsIGFwcE5hbWUpKSB7XG4gICAgICBpZiAodGhpcy5yZWxhdGVkR3JhcGguY29udGFpbnNBcHAoYXBwTmFtZSkpIHtcbiAgICAgICAgbGV0IG5vZGUyID0gdGhpcy5yZWxhdGVkR3JhcGguYWRkTm9kZShlbGVtZW50KTtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmFwcHNbYXBwTmFtZV0gIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBsZXQgYXBwUmVsYXRpb25zID0gdGhpcy5nZXRSZWxhdGlvbnNCeUFwcE5hbWUoYXBwTmFtZSk7XG4gICAgICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGFwcFJlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICAgIGNvbnN0IHJlbGF0aW9uID0gYXBwUmVsYXRpb25zW2luZGV4XTtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgcmVsYXRpb24udHlwZS5nZXQoKSA9PT0gcmVsYXRpb25UeXBlICYmXG4gICAgICAgICAgICAgIGlzRGlyZWN0ZWQgPT09IHJlbGF0aW9uLmlzRGlyZWN0ZWQuZ2V0KClcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICBpZiAoaXNEaXJlY3RlZCkge1xuICAgICAgICAgICAgICAgIGlmIChhc1BhcmVudCkge1xuICAgICAgICAgICAgICAgICAgcmVsYXRpb24uYWRkTm9kZXRvTm9kZUxpc3QxKG5vZGUyKTtcbiAgICAgICAgICAgICAgICAgIG5vZGUyLmFkZERpcmVjdGVkUmVsYXRpb25QYXJlbnQocmVsYXRpb24sIGFwcE5hbWUpO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlbGF0aW9uO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICByZWxhdGlvbi5hZGROb2RldG9Ob2RlTGlzdDIobm9kZTIpO1xuICAgICAgICAgICAgICAgICAgbm9kZTIuYWRkRGlyZWN0ZWRSZWxhdGlvbkNoaWxkKHJlbGF0aW9uLCBhcHBOYW1lKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiByZWxhdGlvbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVsYXRpb24uYWRkTm9kZXRvTm9kZUxpc3QyKG5vZGUyKTtcbiAgICAgICAgICAgICAgICBub2RlMi5hZGROb25EaXJlY3RlZFJlbGF0aW9uKHJlbGF0aW9uLCBhcHBOYW1lKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVsYXRpb247XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHJlbCA9IHRoaXMuYWRkU2ltcGxlUmVsYXRpb25CeUFwcChcbiAgICAgICAgICBhcHBOYW1lLFxuICAgICAgICAgIHJlbGF0aW9uVHlwZSxcbiAgICAgICAgICBlbGVtZW50LFxuICAgICAgICAgIGlzRGlyZWN0ZWRcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIHJlbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYXBwTmFtZSArIFwiIGRvZXMgbm90IGV4aXN0XCIpO1xuICAgICAgfVxuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIHJlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGlzIHJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5yZWxhdGVkR3JhcGgucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvblR5cGVdXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG5cblxuXG4gIGFkZFJlbGF0aW9uMihfcmVsYXRpb24sIF9uYW1lKSB7XG4gICAgbGV0IGNsYXNzaWZ5ID0gZmFsc2U7XG4gICAgbGV0IG5hbWUgPSBfcmVsYXRpb24udHlwZS5nZXQoKTtcbiAgICBpZiAodHlwZW9mIF9uYW1lICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBuYW1lID0gX25hbWU7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgdGhpcy5yZWxhdGlvbnNbX3JlbGF0aW9uLnR5cGUuZ2V0KCldICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBpZiAoX3JlbGF0aW9uLmlzRGlyZWN0ZWQuZ2V0KCkpIHtcbiAgICAgICAgZm9yIChcbiAgICAgICAgICBsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMucmVsYXRpb25zW19yZWxhdGlvbi50eXBlLmdldCgpXS5sZW5ndGg7IGluZGV4KytcbiAgICAgICAgKSB7XG4gICAgICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMucmVsYXRpb25zW19yZWxhdGlvbi50eXBlLmdldCgpXVtpbmRleF07XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgVXRpbGl0aWVzLmFycmF5c0VxdWFsKFxuICAgICAgICAgICAgICBfcmVsYXRpb24uZ2V0Tm9kZUxpc3QxSWRzKCksXG4gICAgICAgICAgICAgIGVsZW1lbnQuZ2V0Tm9kZUxpc3QxSWRzKClcbiAgICAgICAgICAgIClcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkTm90RXhpc3RpbmdWZXJ0aWNlc3RvTm9kZUxpc3QyKF9yZWxhdGlvbi5ub2RlTGlzdDIpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbGVtZW50LnB1c2goX3JlbGF0aW9uKTtcbiAgICAgICAgICAgIGNsYXNzaWZ5ID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucmVsYXRpb25zW19yZWxhdGlvbi50eXBlLmdldCgpXS5hZGROb3RFeGlzdGluZ1ZlcnRpY2VzdG9SZWxhdGlvbihcbiAgICAgICAgICBfcmVsYXRpb25cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKF9yZWxhdGlvbi5pc0RpcmVjdGVkLmdldCgpKSB7XG4gICAgICAgIGxldCBsaXN0ID0gbmV3IExzdCgpO1xuICAgICAgICBsaXN0LnB1c2goX3JlbGF0aW9uKTtcbiAgICAgICAgdGhpcy5yZWxhdGlvbnMuYWRkX2F0dHIoe1xuICAgICAgICAgIFtuYW1lXTogbGlzdFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fY2xhc3NpZnlSZWxhdGlvbihfcmVsYXRpb24pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZWxhdGlvbnMuYWRkX2F0dHIoe1xuICAgICAgICAgIFtuYW1lXTogX3JlbGF0aW9uXG4gICAgICAgIH0pO1xuICAgICAgICBjbGFzc2lmeSA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChjbGFzc2lmeSkgdGhpcy5fY2xhc3NpZnlSZWxhdGlvbihfcmVsYXRpb24pO1xuICB9XG5cbiAgX2NsYXNzaWZ5UmVsYXRpb24oX3JlbGF0aW9uKSB7XG4gICAgdGhpcy5yZWxhdGVkR3JhcGgubG9hZChyZWxhdGVkR3JhcGggPT4ge1xuICAgICAgcmVsYXRlZEdyYXBoLl9jbGFzc2lmeVJlbGF0aW9uKF9yZWxhdGlvbik7XG4gICAgfSk7XG4gIH1cblxuICAvL1RPRE8gOk5vdFdvcmtpbmdcbiAgLy8gYWRkUmVsYXRpb24oX3JlbGF0aW9uKSB7XG4gIC8vICAgdGhpcy5hZGRSZWxhdGlvbihfcmVsYXRpb24pXG4gIC8vICAgdGhpcy5yZWxhdGVkR3JhcGgubG9hZChyZWxhdGVkR3JhcGggPT4ge1xuICAvLyAgICAgcmVsYXRlZEdyYXBoLl9hZGROb3RFeGlzdGluZ1ZlcnRpY2VzRnJvbVJlbGF0aW9uKF9yZWxhdGlvbilcbiAgLy8gICB9KVxuICAvLyB9XG4gIC8vVE9ETyA6Tm90V29ya2luZ1xuICAvLyBhZGRSZWxhdGlvbnMoX3JlbGF0aW9ucykge1xuICAvLyAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBfcmVsYXRpb25zLmxlbmd0aDsgaW5kZXgrKykge1xuICAvLyAgICAgdGhpcy5hZGRSZWxhdGlvbihfcmVsYXRpb25zW2luZGV4XSk7XG4gIC8vICAgfVxuICAvLyB9XG5cbiAgZ2V0UmVsYXRpb25zKCkge1xuICAgIGxldCByZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucmVsYXRpb25zLl9hdHRyaWJ1dGVfbmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHJlbExpc3QgPSB0aGlzLnJlbGF0aW9uc1t0aGlzLnJlbGF0aW9ucy5fYXR0cmlidXRlX25hbWVzW2ldXTtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcmVsTGlzdC5sZW5ndGg7IGorKykge1xuICAgICAgICBjb25zdCByZWxhdGlvbiA9IHJlbExpc3Rbal07XG4gICAgICAgIHJlcy5wdXNoKHJlbGF0aW9uKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG4gIGdldFJlbGF0aW9uc0J5VHlwZSh0eXBlKSB7XG4gICAgbGV0IHJlcyA9IFtdO1xuICAgIGlmICghdHlwZS5pbmNsdWRlcyhcIj5cIiwgdHlwZS5sZW5ndGggLSAyKSAmJlxuICAgICAgIXR5cGUuaW5jbHVkZXMoXCI8XCIsIHR5cGUubGVuZ3RoIC0gMikgJiZcbiAgICAgICF0eXBlLmluY2x1ZGVzKFwiLVwiLCB0eXBlLmxlbmd0aCAtIDIpXG4gICAgKSB7XG4gICAgICBsZXQgdDEgPSB0eXBlLmNvbmNhdChcIj5cIik7XG4gICAgICByZXMgPSBVdGlsaXRpZXMuY29uY2F0KHJlcywgdGhpcy5nZXRSZWxhdGlvbnModDEpKTtcbiAgICAgIGxldCB0MiA9IHR5cGUuY29uY2F0KFwiPFwiKTtcbiAgICAgIHJlcyA9IFV0aWxpdGllcy5jb25jYXQocmVzLCB0aGlzLmdldFJlbGF0aW9ucyh0MikpO1xuICAgICAgbGV0IHQzID0gdHlwZS5jb25jYXQoXCItXCIpO1xuICAgICAgcmVzID0gVXRpbGl0aWVzLmNvbmNhdChyZXMsIHRoaXMuZ2V0UmVsYXRpb25zKHQzKSk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgdGhpcy5yZWxhdGlvbnNbdHlwZV0gIT09IFwidW5kZWZpbmVkXCIpIHJlcyA9IHRoaXMucmVsYXRpb25zW1xuICAgICAgdHlwZV07XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG4gIGdldFJlbGF0aW9uc0J5QXBwTmFtZShhcHBOYW1lKSB7XG4gICAgbGV0IHJlcyA9IFtdO1xuICAgIGlmICh0aGlzLmhhc0FwcERlZmluZWQoYXBwTmFtZSkpIHtcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLmFwcHNbYXBwTmFtZV0uX2F0dHJpYnV0ZV9uYW1lcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgYXBwUmVsYXRpb24gPSB0aGlzLmFwcHNbYXBwTmFtZV1bdGhpcy5hcHBzW2FwcE5hbWVdLl9hdHRyaWJ1dGVfbmFtZXNbXG4gICAgICAgICAgaW5kZXhdXTtcbiAgICAgICAgcmVzLnB1c2goYXBwUmVsYXRpb24pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlcztcbiAgICB9IGVsc2UgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG5cbiAgZ2V0UmVsYXRpb25zQnlBcHAoYXBwKSB7XG4gICAgbGV0IGFwcE5hbWUgPSBhcHAubmFtZS5nZXQoKVxuICAgIHJldHVybiB0aGlzLmdldFJlbGF0aW9uc0J5QXBwTmFtZShhcHBOYW1lKVxuICB9XG5cbiAgZ2V0UmVsYXRpb25zQnlBcHBOYW1lQnlUeXBlKGFwcE5hbWUsIHJlbGF0aW9uVHlwZSkge1xuICAgIGxldCByZXMgPSBbXTtcbiAgICBpZiAodGhpcy5oYXNSZWxhdGlvbkJ5QXBwQnlUeXBlRGVmaW5lZChhcHBOYW1lLCByZWxhdGlvblR5cGUpKSB7XG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5hcHBzW2FwcE5hbWVdLl9hdHRyaWJ1dGVfbmFtZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IGFwcFJlbGF0aW9uID0gdGhpcy5hcHBzW2FwcE5hbWVdW3RoaXMuYXBwc1thcHBOYW1lXS5fYXR0cmlidXRlX25hbWVzW1xuICAgICAgICAgIGluZGV4XV07XG4gICAgICAgIGlmIChhcHBSZWxhdGlvbi50eXBlLmdldCgpID09PSByZWxhdGlvblR5cGUpIHJlcy5wdXNoKGFwcFJlbGF0aW9uKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICB9XG4gIH1cblxuICBnZXRSZWxhdGlvbnNCeUFwcEJ5VHlwZShhcHAsIHJlbGF0aW9uVHlwZSkge1xuICAgIGxldCBhcHBOYW1lID0gYXBwLm5hbWUuZ2V0KClcbiAgICByZXR1cm4gdGhpcy5nZXRSZWxhdGlvbnNCeUFwcE5hbWVCeVR5cGUoYXBwTmFtZSwgcmVsYXRpb25UeXBlKVxuXG4gIH1cblxuICBpbk5vZGVMaXN0KF9ub2RlbGlzdCkge1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBfbm9kZWxpc3QubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gX25vZGVsaXN0W2luZGV4XTtcbiAgICAgIGlmIChlbGVtZW50LmlkLmdldCgpID09PSB0aGlzLmlkLmdldCgpKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy9UT0RPIGdldENoaWxkcmVuLCBnZXRQYXJlbnRcblxuICBnZXROZWlnaGJvcnMoX3R5cGUpIHtcbiAgICBsZXQgbmVpZ2hib3JzID0gW107XG4gICAgbGV0IHJlbGF0aW9ucyA9IHRoaXMuZ2V0UmVsYXRpb25zKF90eXBlKTtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcmVsYXRpb25zLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgcmVsYXRpb24gPSByZWxhdGlvbnNbaW5kZXhdO1xuICAgICAgaWYgKHJlbGF0aW9uLmlzRGlyZWN0ZWQuZ2V0KCkpIHtcbiAgICAgICAgaWYgKHRoaXMuaW5Ob2RlTGlzdChyZWxhdGlvbi5ub2RlTGlzdDEpKVxuICAgICAgICAgIG5laWdoYm9ycyA9IFV0aWxpdGllcy5jb25jYXQobmVpZ2hib3JzLCByZWxhdGlvbi5ub2RlTGlzdDIpO1xuICAgICAgICBlbHNlIG5laWdoYm9ycyA9IFV0aWxpdGllcy5jb25jYXQobmVpZ2hib3JzLCByZWxhdGlvbi5ub2RlTGlzdDEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmVpZ2hib3JzID0gVXRpbGl0aWVzLmNvbmNhdChcbiAgICAgICAgICBuZWlnaGJvcnMsXG4gICAgICAgICAgVXRpbGl0aWVzLmFsbEJ1dE1lQnlJZChyZWxhdGlvbi5ub2RlTGlzdDEpXG4gICAgICAgICk7XG4gICAgICAgIG5laWdoYm9ycyA9IFV0aWxpdGllcy5jb25jYXQoXG4gICAgICAgICAgbmVpZ2hib3JzLFxuICAgICAgICAgIFV0aWxpdGllcy5hbGxCdXRNZUJ5SWQocmVsYXRpb24ubm9kZUxpc3QyKVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmVpZ2hib3JzO1xuICB9XG5cbiAgcmVtb3ZlUmVsYXRpb24oX3JlbGF0aW9uKSB7XG4gICAgbGV0IHJlbGF0aW9uTHN0ID0gdGhpcy5yZWxhdGlvbnNbX3JlbGF0aW9uLnR5cGUuZ2V0KCldO1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCByZWxhdGlvbkxzdC5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IGNhbmRpZGF0ZVJlbGF0aW9uID0gcmVsYXRpb25Mc3RbaW5kZXhdO1xuICAgICAgaWYgKF9yZWxhdGlvbi5pZC5nZXQoKSA9PT0gY2FuZGlkYXRlUmVsYXRpb24uaWQuZ2V0KCkpXG4gICAgICAgIHJlbGF0aW9uTHN0LnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICB9XG5cbiAgcmVtb3ZlUmVsYXRpb25zKF9yZWxhdGlvbnMpIHtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX3JlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHRoaXMucmVtb3ZlUmVsYXRpb24oX3JlbGF0aW9uc1tpbmRleF0pO1xuICAgIH1cbiAgfVxuXG4gIHJlbW92ZVJlbGF0aW9uVHlwZShfdHlwZSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KF90eXBlKSB8fCBfdHlwZSBpbnN0YW5jZW9mIExzdClcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBfdHlwZS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgdHlwZSA9IF90eXBlW2luZGV4XTtcbiAgICAgICAgdGhpcy5yZWxhdGlvbnMucmVtX2F0dHIodHlwZSk7XG4gICAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLnJlbGF0aW9ucy5yZW1fYXR0cihfdHlwZSk7XG4gICAgfVxuICB9XG5cbiAgaGFzQXBwRGVmaW5lZChhcHBOYW1lKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLmFwcHNbYXBwTmFtZV0gIT09IFwidW5kZWZpbmVkXCIpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKFwiYXBwIFwiICsgYXBwTmFtZSArXG4gICAgICAgIFwiIGlzIG5vdCBkZWZpbmVkIGZvciBub2RlIFwiICsgdGhpcy5uYW1lLmdldCgpKTtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIGhhc1JlbGF0aW9uQnlBcHBCeVR5cGVEZWZpbmVkKGFwcE5hbWUsIHJlbGF0aW9uVHlwZSkge1xuICAgIGlmICh0aGlzLmhhc0FwcERlZmluZWQoYXBwTmFtZSkgJiYgdHlwZW9mIHRoaXMuYXBwc1thcHBOYW1lXVtcbiAgICAgICAgcmVsYXRpb25UeXBlXG4gICAgICBdICE9PVxuICAgICAgXCJ1bmRlZmluZWRcIilcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oXCJyZWxhdGlvbiBcIiArIHJlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGlzIG5vdCBkZWZpbmVkIGZvciBub2RlIFwiICsgdGhpcy5uYW1lLmdldCgpICtcbiAgICAgICAgXCIgZm9yIGFwcGxpY2F0aW9uIFwiICsgYXBwTmFtZSk7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cblxuICB0b0pzb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiB0aGlzLmlkLmdldCgpLFxuICAgICAgbmFtZTogdGhpcy5uYW1lLmdldCgpLFxuICAgICAgZWxlbWVudDogbnVsbFxuICAgIH07XG4gIH1cblxuICB0b0pzb25XaXRoUmVsYXRpb25zKCkge1xuICAgIGxldCByZWxhdGlvbnMgPSBbXTtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5nZXRSZWxhdGlvbnMoKS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IHJlbGF0aW9uID0gdGhpcy5nZXRSZWxhdGlvbnMoKVtpbmRleF07XG4gICAgICByZWxhdGlvbnMucHVzaChyZWxhdGlvbi50b0pzb24oKSk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBpZDogdGhpcy5pZC5nZXQoKSxcbiAgICAgIG5hbWU6IHRoaXMubmFtZS5nZXQoKSxcbiAgICAgIGVsZW1lbnQ6IG51bGwsXG4gICAgICByZWxhdGlvbnM6IHJlbGF0aW9uc1xuICAgIH07XG4gIH1cblxuICBhc3luYyB0b0lmYygpIHtcbiAgICBsZXQgZWxlbWVudCA9IGF3YWl0IFV0aWxpdGllcy5wcm9taXNlTG9hZCh0aGlzLmVsZW1lbnQpO1xuICAgIHJldHVybiBlbGVtZW50LnRvSWZjKCk7XG4gIH1cbn1cblxuc3BpbmFsQ29yZS5yZWdpc3Rlcl9tb2RlbHMoW1NwaW5hbE5vZGVdKTsiXX0=