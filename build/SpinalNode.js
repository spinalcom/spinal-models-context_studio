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
  constructor(_name, _element, _graph, _relations, name = "SpinalNode") {
    super();
    if (FileSystem._sig_server) {
      this.add_attr({
        name: _name,
        element: new Ptr(_element),
        relations: new Model(),
        apps: new Model(),
        graph: _graph
      });
      if (typeof this.graph !== "undefined") {
        this.graph.classifyNode(this);
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

  getApps() {
    let res = [];
    for (let index = 0; index < this.apps._attribute_names.length; index++) {
      const appName = this.apps._attribute_names[index];
      res.push(this.graph.appsList[appName]);
    }
    return res;
  }

  changeDefaultRelation(relationType, relation, asParent) {
    if (relation.isDirected.get()) {
      if (asParent) {
        _Utilities.Utilities.putOnTopLst(this.relations[relationType + "<"], relation);
      } else {
        _Utilities.Utilities.putOnTopLst(this.relations[relationType + ">"], relation);
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
    name = name.concat("<");
    if (typeof appName === "undefined") this.addRelation(relation, name);else this.addRelationByApp(relation, name, appName);
  }

  addDirectedRelationChild(relation, appName) {
    let name = relation.type.get();
    name = name.concat(">");
    if (typeof appName === "undefined") this.addRelation(relation, name);else this.addRelationByApp(relation, name, appName);
  }

  addNonDirectedRelation(relation, appName) {
    let name = relation.type.get();
    name = name.concat("-");
    if (typeof appName === "undefined") this.addRelation(relation, name);else this.addRelationByApp(relation, name, appName);
  }

  addRelation(relation, name) {
    if (!this.graph.isReserved(relation.type.get())) {
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
      console.log(relation.type.get() + " is reserved by " + this.graph.reservedRelationsNames[relation.type.get()]);
    }
  }

  addRelationByApp(relation, name, appName) {
    if (this.graph.hasReservationCredentials(relation.type.get(), appName)) {
      if (this.graph.containsApp(appName)) {
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
      console.log(relation.type.get() + " is reserved by " + this.graph.reservedRelationsNames[relation.type.get()]);
    }
  }

  addSimpleRelation(relationType, element, isDirected = false) {
    if (!this.graph.isReserved(relationType)) {
      let node2 = this.graph.addNode(element);
      let rel = new _SpinalRelation2.default(relationType, [this], [node2], isDirected);
      this.graph.addRelation(rel);
      return rel;
    } else {
      console.log(relationType + " is reserved by " + this.graph.reservedRelationsNames[relationType]);
    }
  }

  addSimpleRelationByApp(appName, relationType, element, isDirected = false) {
    if (this.graph.hasReservationCredentials(relationType, appName)) {
      if (this.graph.containsApp(appName)) {
        let node2 = this.graph.addNode(element);
        let rel = new _SpinalRelation2.default(relationType, [this], [node2], isDirected);
        this.graph.addRelation(rel, appName);
        return rel;
      } else {
        console.error(appName + " does not exist");
      }
    } else {
      console.log(relationType + " is reserved by " + this.graph.reservedRelationsNames[relationType]);
    }
  }

  addToExistingRelation(relationType, element, isDirected = false, asParent = false) {
    if (!this.graph.isReserved(relationType)) {
      let node2 = this.graph.addNode(element);
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
      console.log(relationType + " is reserved by " + this.graph.reservedRelationsNames[relationType]);
    }
  }

  addToExistingRelationByApp(appName, relationType, element, isDirected = false, asParent = false) {
    if (this.graph.hasReservationCredentials(relationType, appName)) {
      if (this.graph.containsApp(appName)) {
        let node2 = this.graph.addNode(element);
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
      console.log(relationType + " is reserved by " + this.graph.reservedRelationsNames[relationType]);
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
    this.graph.load(graph => {
      graph._classifyRelation(_relation);
    });
  }

  //TODO :NotWorking
  // addRelation(_relation) {
  //   this.addRelation(_relation)
  //   this.graph.load(graph => {
  //     graph._addNotExistingVerticesFromRelation(_relation)
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TcGluYWxOb2RlLmpzIl0sIm5hbWVzIjpbInNwaW5hbENvcmUiLCJyZXF1aXJlIiwiZ2xvYmFsVHlwZSIsIndpbmRvdyIsImdsb2JhbCIsImdldFZpZXdlciIsInYiLCJTcGluYWxOb2RlIiwiTW9kZWwiLCJjb25zdHJ1Y3RvciIsIl9uYW1lIiwiX2VsZW1lbnQiLCJfZ3JhcGgiLCJfcmVsYXRpb25zIiwibmFtZSIsIkZpbGVTeXN0ZW0iLCJfc2lnX3NlcnZlciIsImFkZF9hdHRyIiwiZWxlbWVudCIsIlB0ciIsInJlbGF0aW9ucyIsImFwcHMiLCJncmFwaCIsImNsYXNzaWZ5Tm9kZSIsIkFycmF5IiwiaXNBcnJheSIsIkxzdCIsImFkZFJlbGF0aW9ucyIsImFkZFJlbGF0aW9uIiwiZ2V0QXBwc05hbWVzIiwiX2F0dHJpYnV0ZV9uYW1lcyIsImdldEFwcHMiLCJyZXMiLCJpbmRleCIsImxlbmd0aCIsImFwcE5hbWUiLCJwdXNoIiwiYXBwc0xpc3QiLCJjaGFuZ2VEZWZhdWx0UmVsYXRpb24iLCJyZWxhdGlvblR5cGUiLCJyZWxhdGlvbiIsImFzUGFyZW50IiwiaXNEaXJlY3RlZCIsImdldCIsIlV0aWxpdGllcyIsInB1dE9uVG9wTHN0IiwiaGFzUmVsYXRpb24iLCJhZGREaXJlY3RlZFJlbGF0aW9uUGFyZW50IiwidHlwZSIsImNvbmNhdCIsImFkZFJlbGF0aW9uQnlBcHAiLCJhZGREaXJlY3RlZFJlbGF0aW9uQ2hpbGQiLCJhZGROb25EaXJlY3RlZFJlbGF0aW9uIiwiaXNSZXNlcnZlZCIsIm5hbWVUbXAiLCJsaXN0IiwiY29uc29sZSIsImxvZyIsInJlc2VydmVkUmVsYXRpb25zTmFtZXMiLCJoYXNSZXNlcnZhdGlvbkNyZWRlbnRpYWxzIiwiY29udGFpbnNBcHAiLCJlcnJvciIsImFkZFNpbXBsZVJlbGF0aW9uIiwibm9kZTIiLCJhZGROb2RlIiwicmVsIiwiU3BpbmFsUmVsYXRpb24iLCJhZGRTaW1wbGVSZWxhdGlvbkJ5QXBwIiwiYWRkVG9FeGlzdGluZ1JlbGF0aW9uIiwiZXhpc3RpbmdSZWxhdGlvbnMiLCJnZXRSZWxhdGlvbnMiLCJhZGROb2RldG9Ob2RlTGlzdDEiLCJhZGROb2RldG9Ob2RlTGlzdDIiLCJhZGRUb0V4aXN0aW5nUmVsYXRpb25CeUFwcCIsImFwcFJlbGF0aW9ucyIsImdldFJlbGF0aW9uc0J5QXBwTmFtZSIsImFkZFJlbGF0aW9uMiIsIl9yZWxhdGlvbiIsImNsYXNzaWZ5IiwiYXJyYXlzRXF1YWwiLCJnZXROb2RlTGlzdDFJZHMiLCJhZGROb3RFeGlzdGluZ1ZlcnRpY2VzdG9Ob2RlTGlzdDIiLCJub2RlTGlzdDIiLCJhZGROb3RFeGlzdGluZ1ZlcnRpY2VzdG9SZWxhdGlvbiIsIl9jbGFzc2lmeVJlbGF0aW9uIiwibG9hZCIsImkiLCJyZWxMaXN0IiwiaiIsImdldFJlbGF0aW9uc0J5VHlwZSIsImluY2x1ZGVzIiwidDEiLCJ0MiIsInQzIiwiaGFzQXBwRGVmaW5lZCIsImFwcFJlbGF0aW9uIiwidW5kZWZpbmVkIiwiZ2V0UmVsYXRpb25zQnlBcHAiLCJhcHAiLCJnZXRSZWxhdGlvbnNCeUFwcE5hbWVCeVR5cGUiLCJoYXNSZWxhdGlvbkJ5QXBwQnlUeXBlRGVmaW5lZCIsImdldFJlbGF0aW9uc0J5QXBwQnlUeXBlIiwiaW5Ob2RlTGlzdCIsIl9ub2RlbGlzdCIsImlkIiwiZ2V0TmVpZ2hib3JzIiwiX3R5cGUiLCJuZWlnaGJvcnMiLCJub2RlTGlzdDEiLCJhbGxCdXRNZUJ5SWQiLCJyZW1vdmVSZWxhdGlvbiIsInJlbGF0aW9uTHN0IiwiY2FuZGlkYXRlUmVsYXRpb24iLCJzcGxpY2UiLCJyZW1vdmVSZWxhdGlvbnMiLCJyZW1vdmVSZWxhdGlvblR5cGUiLCJyZW1fYXR0ciIsIndhcm4iLCJ0b0pzb24iLCJ0b0pzb25XaXRoUmVsYXRpb25zIiwidG9JZmMiLCJwcm9taXNlTG9hZCIsInJlZ2lzdGVyX21vZGVscyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBRUE7Ozs7QUFLQTs7OztBQVBBLE1BQU1BLGFBQWFDLFFB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USxDQUFqQixFQUFvQkEsUUFBUSxLQUFLcUMsWUFBTCxHQUFvQnBDLE1BQWhELEVBQXdERCxPQUF4RCxFQUFpRTtBQUMvRCxZQUFNTyxXQUFXLEtBQUs4QixZQUFMLEdBQW9CckMsS0FBcEIsQ0FBakI7QUFDQWIsZ0JBQVVnQixJQUFWLENBQWVJLFNBQVM4RSxNQUFULEVBQWY7QUFDRDtBQUNELFdBQU87QUFDTGQsVUFBSSxLQUFLQSxFQUFMLENBQVE3RCxHQUFSLEVBREM7QUFFTDdCLFlBQU0sS0FBS0EsSUFBTCxDQUFVNkIsR0FBVixFQUZEO0FBR0x6QixlQUFTLElBSEo7QUFJTEUsaUJBQVdBO0FBSk4sS0FBUDtBQU1EOztBQUVELFFBQU1vRyxLQUFOLEdBQWM7QUFDWixRQUFJdEcsVUFBVSxNQUFNMEIscUJBQVU2RSxXQUFWLENBQXNCLEtBQUt2RyxPQUEzQixDQUFwQjtBQUNBLFdBQU9BLFFBQVFzRyxLQUFSLEVBQVA7QUFDRDtBQXpnQnNEOztrQkFBcENqSCxVO0FBNGdCckJQLFdBQVcwSCxlQUFYLENBQTJCLENBQUNuSCxVQUFELENBQTNCIiwiZmlsZSI6IlNwaW5hbE5vZGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBzcGluYWxDb3JlID0gcmVxdWlyZShcInNwaW5hbC1jb3JlLWNvbm5lY3RvcmpzXCIpO1xuY29uc3QgZ2xvYmFsVHlwZSA9IHR5cGVvZiB3aW5kb3cgPT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB3aW5kb3c7XG5pbXBvcnQgU3BpbmFsUmVsYXRpb24gZnJvbSBcIi4vU3BpbmFsUmVsYXRpb25cIjtcbmxldCBnZXRWaWV3ZXIgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGdsb2JhbFR5cGUudjtcbn07XG5cbmltcG9ydCB7XG4gIFV0aWxpdGllc1xufSBmcm9tIFwiLi9VdGlsaXRpZXNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3BpbmFsTm9kZSBleHRlbmRzIGdsb2JhbFR5cGUuTW9kZWwge1xuICBjb25zdHJ1Y3RvcihfbmFtZSwgX2VsZW1lbnQsIF9ncmFwaCwgX3JlbGF0aW9ucywgbmFtZSA9IFwiU3BpbmFsTm9kZVwiKSB7XG4gICAgc3VwZXIoKTtcbiAgICBpZiAoRmlsZVN5c3RlbS5fc2lnX3NlcnZlcikge1xuICAgICAgdGhpcy5hZGRfYXR0cih7XG4gICAgICAgIG5hbWU6IF9uYW1lLFxuICAgICAgICBlbGVtZW50OiBuZXcgUHRyKF9lbGVtZW50KSxcbiAgICAgICAgcmVsYXRpb25zOiBuZXcgTW9kZWwoKSxcbiAgICAgICAgYXBwczogbmV3IE1vZGVsKCksXG4gICAgICAgIGdyYXBoOiBfZ3JhcGhcbiAgICAgIH0pO1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLmdyYXBoICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHRoaXMuZ3JhcGguY2xhc3NpZnlOb2RlKHRoaXMpO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBfcmVsYXRpb25zICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KF9yZWxhdGlvbnMpIHx8IF9yZWxhdGlvbnMgaW5zdGFuY2VvZiBMc3QpXG4gICAgICAgICAgdGhpcy5hZGRSZWxhdGlvbnMoX3JlbGF0aW9ucyk7XG4gICAgICAgIGVsc2UgdGhpcy5hZGRSZWxhdGlvbihfcmVsYXRpb25zKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyByZWdpc3RlckFwcChhcHApIHtcbiAgLy8gICB0aGlzLmFwcHMuYWRkX2F0dHIoe1xuICAvLyAgICAgW2FwcC5uYW1lLmdldCgpXTogbmV3IFB0cihhcHApXG4gIC8vICAgfSlcbiAgLy8gfVxuXG4gIGdldEFwcHNOYW1lcygpIHtcbiAgICByZXR1cm4gdGhpcy5hcHBzLl9hdHRyaWJ1dGVfbmFtZXM7XG4gIH1cblxuICBnZXRBcHBzKCkge1xuICAgIGxldCByZXMgPSBbXVxuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLmFwcHMuX2F0dHJpYnV0ZV9uYW1lcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IGFwcE5hbWUgPSB0aGlzLmFwcHMuX2F0dHJpYnV0ZV9uYW1lc1tpbmRleF07XG4gICAgICByZXMucHVzaCh0aGlzLmdyYXBoLmFwcHNMaXN0W2FwcE5hbWVdKVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgY2hhbmdlRGVmYXVsdFJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgcmVsYXRpb24sIGFzUGFyZW50KSB7XG4gICAgaWYgKHJlbGF0aW9uLmlzRGlyZWN0ZWQuZ2V0KCkpIHtcbiAgICAgIGlmIChhc1BhcmVudCkge1xuICAgICAgICBVdGlsaXRpZXMucHV0T25Ub3BMc3QodGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCI8XCJdLCByZWxhdGlvbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBVdGlsaXRpZXMucHV0T25Ub3BMc3QodGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCI+XCJdLCByZWxhdGlvbik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIFV0aWxpdGllcy5wdXRPblRvcExzdCh0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIi1cIl0sIHJlbGF0aW9uKTtcbiAgICB9XG4gIH1cblxuICBoYXNSZWxhdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5yZWxhdGlvbnMubGVuZ3RoICE9PSAwO1xuICB9XG5cbiAgYWRkRGlyZWN0ZWRSZWxhdGlvblBhcmVudChyZWxhdGlvbiwgYXBwTmFtZSkge1xuICAgIGxldCBuYW1lID0gcmVsYXRpb24udHlwZS5nZXQoKTtcbiAgICBuYW1lID0gbmFtZS5jb25jYXQoXCI8XCIpO1xuICAgIGlmICh0eXBlb2YgYXBwTmFtZSA9PT0gXCJ1bmRlZmluZWRcIikgdGhpcy5hZGRSZWxhdGlvbihyZWxhdGlvbiwgbmFtZSk7XG4gICAgZWxzZSB0aGlzLmFkZFJlbGF0aW9uQnlBcHAocmVsYXRpb24sIG5hbWUsIGFwcE5hbWUpO1xuICB9XG5cbiAgYWRkRGlyZWN0ZWRSZWxhdGlvbkNoaWxkKHJlbGF0aW9uLCBhcHBOYW1lKSB7XG4gICAgbGV0IG5hbWUgPSByZWxhdGlvbi50eXBlLmdldCgpO1xuICAgIG5hbWUgPSBuYW1lLmNvbmNhdChcIj5cIik7XG4gICAgaWYgKHR5cGVvZiBhcHBOYW1lID09PSBcInVuZGVmaW5lZFwiKSB0aGlzLmFkZFJlbGF0aW9uKHJlbGF0aW9uLCBuYW1lKTtcbiAgICBlbHNlIHRoaXMuYWRkUmVsYXRpb25CeUFwcChyZWxhdGlvbiwgbmFtZSwgYXBwTmFtZSk7XG4gIH1cblxuICBhZGROb25EaXJlY3RlZFJlbGF0aW9uKHJlbGF0aW9uLCBhcHBOYW1lKSB7XG4gICAgbGV0IG5hbWUgPSByZWxhdGlvbi50eXBlLmdldCgpO1xuICAgIG5hbWUgPSBuYW1lLmNvbmNhdChcIi1cIik7XG4gICAgaWYgKHR5cGVvZiBhcHBOYW1lID09PSBcInVuZGVmaW5lZFwiKSB0aGlzLmFkZFJlbGF0aW9uKHJlbGF0aW9uLCBuYW1lKTtcbiAgICBlbHNlIHRoaXMuYWRkUmVsYXRpb25CeUFwcChyZWxhdGlvbiwgbmFtZSwgYXBwTmFtZSk7XG4gIH1cblxuICBhZGRSZWxhdGlvbihyZWxhdGlvbiwgbmFtZSkge1xuICAgIGlmICghdGhpcy5ncmFwaC5pc1Jlc2VydmVkKHJlbGF0aW9uLnR5cGUuZ2V0KCkpKSB7XG4gICAgICBsZXQgbmFtZVRtcCA9IHJlbGF0aW9uLnR5cGUuZ2V0KCk7XG4gICAgICBpZiAodHlwZW9mIG5hbWUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgbmFtZVRtcCA9IG5hbWU7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHRoaXMucmVsYXRpb25zW25hbWVUbXBdICE9PSBcInVuZGVmaW5lZFwiKVxuICAgICAgICB0aGlzLnJlbGF0aW9uc1tuYW1lVG1wXS5wdXNoKHJlbGF0aW9uKTtcbiAgICAgIGVsc2Uge1xuICAgICAgICBsZXQgbGlzdCA9IG5ldyBMc3QoKTtcbiAgICAgICAgbGlzdC5wdXNoKHJlbGF0aW9uKTtcbiAgICAgICAgdGhpcy5yZWxhdGlvbnMuYWRkX2F0dHIoe1xuICAgICAgICAgIFtuYW1lVG1wXTogbGlzdFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIHJlbGF0aW9uLnR5cGUuZ2V0KCkgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMuZ3JhcGgucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvbi50eXBlLmdldCgpXVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBhZGRSZWxhdGlvbkJ5QXBwKHJlbGF0aW9uLCBuYW1lLCBhcHBOYW1lKSB7XG4gICAgaWYgKHRoaXMuZ3JhcGguaGFzUmVzZXJ2YXRpb25DcmVkZW50aWFscyhyZWxhdGlvbi50eXBlLmdldCgpLCBhcHBOYW1lKSkge1xuICAgICAgaWYgKHRoaXMuZ3JhcGguY29udGFpbnNBcHAoYXBwTmFtZSkpIHtcbiAgICAgICAgbGV0IG5hbWVUbXAgPSByZWxhdGlvbi50eXBlLmdldCgpO1xuICAgICAgICBpZiAodHlwZW9mIG5hbWUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBuYW1lVG1wID0gbmFtZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHRoaXMucmVsYXRpb25zW25hbWVUbXBdICE9PSBcInVuZGVmaW5lZFwiKVxuICAgICAgICAgIHRoaXMucmVsYXRpb25zW25hbWVUbXBdLnB1c2gocmVsYXRpb24pO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBsZXQgbGlzdCA9IG5ldyBMc3QoKTtcbiAgICAgICAgICBsaXN0LnB1c2gocmVsYXRpb24pO1xuICAgICAgICAgIHRoaXMucmVsYXRpb25zLmFkZF9hdHRyKHtcbiAgICAgICAgICAgIFtuYW1lVG1wXTogbGlzdFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5hcHBzW2FwcE5hbWVdICE9PSBcInVuZGVmaW5lZFwiKVxuICAgICAgICAgIHRoaXMuYXBwc1thcHBOYW1lXS5hZGRfYXR0cih7XG4gICAgICAgICAgICBbcmVsYXRpb24udHlwZS5nZXQoKV06IHJlbGF0aW9uXG4gICAgICAgICAgfSk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGxldCBsaXN0ID0gbmV3IE1vZGVsKCk7XG4gICAgICAgICAgbGlzdC5hZGRfYXR0cih7XG4gICAgICAgICAgICBbcmVsYXRpb24udHlwZS5nZXQoKV06IHJlbGF0aW9uXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5hcHBzLmFkZF9hdHRyKHtcbiAgICAgICAgICAgIFthcHBOYW1lXTogbGlzdFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKGFwcE5hbWUgKyBcIiBkb2VzIG5vdCBleGlzdFwiKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIHJlbGF0aW9uLnR5cGUuZ2V0KCkgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMuZ3JhcGgucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvbi50eXBlLmdldCgpXVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBhZGRTaW1wbGVSZWxhdGlvbihyZWxhdGlvblR5cGUsIGVsZW1lbnQsIGlzRGlyZWN0ZWQgPSBmYWxzZSkge1xuICAgIGlmICghdGhpcy5ncmFwaC5pc1Jlc2VydmVkKHJlbGF0aW9uVHlwZSkpIHtcbiAgICAgIGxldCBub2RlMiA9IHRoaXMuZ3JhcGguYWRkTm9kZShlbGVtZW50KTtcbiAgICAgIGxldCByZWwgPSBuZXcgU3BpbmFsUmVsYXRpb24ocmVsYXRpb25UeXBlLCBbdGhpc10sIFtub2RlMl0sXG4gICAgICAgIGlzRGlyZWN0ZWQpO1xuICAgICAgdGhpcy5ncmFwaC5hZGRSZWxhdGlvbihyZWwpO1xuICAgICAgcmV0dXJuIHJlbDtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIHJlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGlzIHJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5ncmFwaC5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uVHlwZV1cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgYWRkU2ltcGxlUmVsYXRpb25CeUFwcChhcHBOYW1lLCByZWxhdGlvblR5cGUsIGVsZW1lbnQsIGlzRGlyZWN0ZWQgPSBmYWxzZSkge1xuICAgIGlmICh0aGlzLmdyYXBoLmhhc1Jlc2VydmF0aW9uQ3JlZGVudGlhbHMocmVsYXRpb25UeXBlLCBhcHBOYW1lKSkge1xuICAgICAgaWYgKHRoaXMuZ3JhcGguY29udGFpbnNBcHAoYXBwTmFtZSkpIHtcbiAgICAgICAgbGV0IG5vZGUyID0gdGhpcy5ncmFwaC5hZGROb2RlKGVsZW1lbnQpO1xuICAgICAgICBsZXQgcmVsID0gbmV3IFNwaW5hbFJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgW3RoaXNdLCBbbm9kZTJdLFxuICAgICAgICAgIGlzRGlyZWN0ZWQpO1xuICAgICAgICB0aGlzLmdyYXBoLmFkZFJlbGF0aW9uKHJlbCwgYXBwTmFtZSk7XG4gICAgICAgIHJldHVybiByZWw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKGFwcE5hbWUgKyBcIiBkb2VzIG5vdCBleGlzdFwiKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIHJlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGlzIHJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5ncmFwaC5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uVHlwZV1cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgYWRkVG9FeGlzdGluZ1JlbGF0aW9uKFxuICAgIHJlbGF0aW9uVHlwZSxcbiAgICBlbGVtZW50LFxuICAgIGlzRGlyZWN0ZWQgPSBmYWxzZSxcbiAgICBhc1BhcmVudCA9IGZhbHNlXG4gICkge1xuICAgIGlmICghdGhpcy5ncmFwaC5pc1Jlc2VydmVkKHJlbGF0aW9uVHlwZSkpIHtcbiAgICAgIGxldCBub2RlMiA9IHRoaXMuZ3JhcGguYWRkTm9kZShlbGVtZW50KTtcbiAgICAgIGxldCBleGlzdGluZ1JlbGF0aW9ucyA9IHRoaXMuZ2V0UmVsYXRpb25zKCk7XG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgZXhpc3RpbmdSZWxhdGlvbnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IHJlbGF0aW9uID0gZXhpc3RpbmdSZWxhdGlvbnNbaW5kZXhdO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgcmVsYXRpb25UeXBlID09PSByZWxhdGlvblR5cGUgJiZcbiAgICAgICAgICBpc0RpcmVjdGVkID09PSByZWxhdGlvbi5pc0RpcmVjdGVkLmdldCgpXG4gICAgICAgICkge1xuICAgICAgICAgIGlmIChpc0RpcmVjdGVkKSB7XG4gICAgICAgICAgICBpZiAoYXNQYXJlbnQpIHtcbiAgICAgICAgICAgICAgcmVsYXRpb24uYWRkTm9kZXRvTm9kZUxpc3QxKG5vZGUyKTtcbiAgICAgICAgICAgICAgbm9kZTIuYWRkRGlyZWN0ZWRSZWxhdGlvblBhcmVudChyZWxhdGlvbik7XG4gICAgICAgICAgICAgIHJldHVybiByZWxhdGlvbjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlbGF0aW9uLmFkZE5vZGV0b05vZGVMaXN0Mihub2RlMik7XG4gICAgICAgICAgICAgIG5vZGUyLmFkZERpcmVjdGVkUmVsYXRpb25DaGlsZChyZWxhdGlvbik7XG4gICAgICAgICAgICAgIHJldHVybiByZWxhdGlvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVsYXRpb24uYWRkTm9kZXRvTm9kZUxpc3QyKG5vZGUyKTtcbiAgICAgICAgICAgIG5vZGUyLmFkZE5vbkRpcmVjdGVkUmVsYXRpb24ocmVsYXRpb24pO1xuICAgICAgICAgICAgcmV0dXJuIHJlbGF0aW9uO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGV0IHJlbCA9IHRoaXMuYWRkU2ltcGxlUmVsYXRpb24ocmVsYXRpb25UeXBlLCBlbGVtZW50LCBpc0RpcmVjdGVkKTtcbiAgICAgIHJldHVybiByZWw7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICByZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMuZ3JhcGgucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvblR5cGVdXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGFkZFRvRXhpc3RpbmdSZWxhdGlvbkJ5QXBwKFxuICAgIGFwcE5hbWUsXG4gICAgcmVsYXRpb25UeXBlLFxuICAgIGVsZW1lbnQsXG4gICAgaXNEaXJlY3RlZCA9IGZhbHNlLFxuICAgIGFzUGFyZW50ID0gZmFsc2VcbiAgKSB7XG4gICAgaWYgKHRoaXMuZ3JhcGguaGFzUmVzZXJ2YXRpb25DcmVkZW50aWFscyhyZWxhdGlvblR5cGUsIGFwcE5hbWUpKSB7XG4gICAgICBpZiAodGhpcy5ncmFwaC5jb250YWluc0FwcChhcHBOYW1lKSkge1xuICAgICAgICBsZXQgbm9kZTIgPSB0aGlzLmdyYXBoLmFkZE5vZGUoZWxlbWVudCk7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5hcHBzW2FwcE5hbWVdICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgbGV0IGFwcFJlbGF0aW9ucyA9IHRoaXMuZ2V0UmVsYXRpb25zQnlBcHBOYW1lKGFwcE5hbWUpO1xuICAgICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBhcHBSZWxhdGlvbnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgICBjb25zdCByZWxhdGlvbiA9IGFwcFJlbGF0aW9uc1tpbmRleF07XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgIHJlbGF0aW9uLnR5cGUuZ2V0KCkgPT09IHJlbGF0aW9uVHlwZSAmJlxuICAgICAgICAgICAgICBpc0RpcmVjdGVkID09PSByZWxhdGlvbi5pc0RpcmVjdGVkLmdldCgpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgaWYgKGlzRGlyZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoYXNQYXJlbnQpIHtcbiAgICAgICAgICAgICAgICAgIHJlbGF0aW9uLmFkZE5vZGV0b05vZGVMaXN0MShub2RlMik7XG4gICAgICAgICAgICAgICAgICBub2RlMi5hZGREaXJlY3RlZFJlbGF0aW9uUGFyZW50KHJlbGF0aW9uLCBhcHBOYW1lKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiByZWxhdGlvbjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgcmVsYXRpb24uYWRkTm9kZXRvTm9kZUxpc3QyKG5vZGUyKTtcbiAgICAgICAgICAgICAgICAgIG5vZGUyLmFkZERpcmVjdGVkUmVsYXRpb25DaGlsZChyZWxhdGlvbiwgYXBwTmFtZSk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcmVsYXRpb247XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlbGF0aW9uLmFkZE5vZGV0b05vZGVMaXN0Mihub2RlMik7XG4gICAgICAgICAgICAgICAgbm9kZTIuYWRkTm9uRGlyZWN0ZWRSZWxhdGlvbihyZWxhdGlvbiwgYXBwTmFtZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlbGF0aW9uO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGxldCByZWwgPSB0aGlzLmFkZFNpbXBsZVJlbGF0aW9uQnlBcHAoXG4gICAgICAgICAgYXBwTmFtZSxcbiAgICAgICAgICByZWxhdGlvblR5cGUsXG4gICAgICAgICAgZWxlbWVudCxcbiAgICAgICAgICBpc0RpcmVjdGVkXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiByZWw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKGFwcE5hbWUgKyBcIiBkb2VzIG5vdCBleGlzdFwiKTtcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICByZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMuZ3JhcGgucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvblR5cGVdXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG5cblxuXG4gIGFkZFJlbGF0aW9uMihfcmVsYXRpb24sIF9uYW1lKSB7XG4gICAgbGV0IGNsYXNzaWZ5ID0gZmFsc2U7XG4gICAgbGV0IG5hbWUgPSBfcmVsYXRpb24udHlwZS5nZXQoKTtcbiAgICBpZiAodHlwZW9mIF9uYW1lICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBuYW1lID0gX25hbWU7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgdGhpcy5yZWxhdGlvbnNbX3JlbGF0aW9uLnR5cGUuZ2V0KCldICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBpZiAoX3JlbGF0aW9uLmlzRGlyZWN0ZWQuZ2V0KCkpIHtcbiAgICAgICAgZm9yIChcbiAgICAgICAgICBsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMucmVsYXRpb25zW19yZWxhdGlvbi50eXBlLmdldCgpXS5sZW5ndGg7IGluZGV4KytcbiAgICAgICAgKSB7XG4gICAgICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMucmVsYXRpb25zW19yZWxhdGlvbi50eXBlLmdldCgpXVtpbmRleF07XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgVXRpbGl0aWVzLmFycmF5c0VxdWFsKFxuICAgICAgICAgICAgICBfcmVsYXRpb24uZ2V0Tm9kZUxpc3QxSWRzKCksXG4gICAgICAgICAgICAgIGVsZW1lbnQuZ2V0Tm9kZUxpc3QxSWRzKClcbiAgICAgICAgICAgIClcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkTm90RXhpc3RpbmdWZXJ0aWNlc3RvTm9kZUxpc3QyKF9yZWxhdGlvbi5ub2RlTGlzdDIpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbGVtZW50LnB1c2goX3JlbGF0aW9uKTtcbiAgICAgICAgICAgIGNsYXNzaWZ5ID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucmVsYXRpb25zW19yZWxhdGlvbi50eXBlLmdldCgpXS5hZGROb3RFeGlzdGluZ1ZlcnRpY2VzdG9SZWxhdGlvbihcbiAgICAgICAgICBfcmVsYXRpb25cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKF9yZWxhdGlvbi5pc0RpcmVjdGVkLmdldCgpKSB7XG4gICAgICAgIGxldCBsaXN0ID0gbmV3IExzdCgpO1xuICAgICAgICBsaXN0LnB1c2goX3JlbGF0aW9uKTtcbiAgICAgICAgdGhpcy5yZWxhdGlvbnMuYWRkX2F0dHIoe1xuICAgICAgICAgIFtuYW1lXTogbGlzdFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fY2xhc3NpZnlSZWxhdGlvbihfcmVsYXRpb24pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZWxhdGlvbnMuYWRkX2F0dHIoe1xuICAgICAgICAgIFtuYW1lXTogX3JlbGF0aW9uXG4gICAgICAgIH0pO1xuICAgICAgICBjbGFzc2lmeSA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChjbGFzc2lmeSkgdGhpcy5fY2xhc3NpZnlSZWxhdGlvbihfcmVsYXRpb24pO1xuICB9XG5cbiAgX2NsYXNzaWZ5UmVsYXRpb24oX3JlbGF0aW9uKSB7XG4gICAgdGhpcy5ncmFwaC5sb2FkKGdyYXBoID0+IHtcbiAgICAgIGdyYXBoLl9jbGFzc2lmeVJlbGF0aW9uKF9yZWxhdGlvbik7XG4gICAgfSk7XG4gIH1cblxuICAvL1RPRE8gOk5vdFdvcmtpbmdcbiAgLy8gYWRkUmVsYXRpb24oX3JlbGF0aW9uKSB7XG4gIC8vICAgdGhpcy5hZGRSZWxhdGlvbihfcmVsYXRpb24pXG4gIC8vICAgdGhpcy5ncmFwaC5sb2FkKGdyYXBoID0+IHtcbiAgLy8gICAgIGdyYXBoLl9hZGROb3RFeGlzdGluZ1ZlcnRpY2VzRnJvbVJlbGF0aW9uKF9yZWxhdGlvbilcbiAgLy8gICB9KVxuICAvLyB9XG4gIC8vVE9ETyA6Tm90V29ya2luZ1xuICAvLyBhZGRSZWxhdGlvbnMoX3JlbGF0aW9ucykge1xuICAvLyAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBfcmVsYXRpb25zLmxlbmd0aDsgaW5kZXgrKykge1xuICAvLyAgICAgdGhpcy5hZGRSZWxhdGlvbihfcmVsYXRpb25zW2luZGV4XSk7XG4gIC8vICAgfVxuICAvLyB9XG5cbiAgZ2V0UmVsYXRpb25zKCkge1xuICAgIGxldCByZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucmVsYXRpb25zLl9hdHRyaWJ1dGVfbmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHJlbExpc3QgPSB0aGlzLnJlbGF0aW9uc1t0aGlzLnJlbGF0aW9ucy5fYXR0cmlidXRlX25hbWVzW2ldXTtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcmVsTGlzdC5sZW5ndGg7IGorKykge1xuICAgICAgICBjb25zdCByZWxhdGlvbiA9IHJlbExpc3Rbal07XG4gICAgICAgIHJlcy5wdXNoKHJlbGF0aW9uKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG4gIGdldFJlbGF0aW9uc0J5VHlwZSh0eXBlKSB7XG4gICAgbGV0IHJlcyA9IFtdO1xuICAgIGlmICghdHlwZS5pbmNsdWRlcyhcIj5cIiwgdHlwZS5sZW5ndGggLSAyKSAmJlxuICAgICAgIXR5cGUuaW5jbHVkZXMoXCI8XCIsIHR5cGUubGVuZ3RoIC0gMikgJiZcbiAgICAgICF0eXBlLmluY2x1ZGVzKFwiLVwiLCB0eXBlLmxlbmd0aCAtIDIpXG4gICAgKSB7XG4gICAgICBsZXQgdDEgPSB0eXBlLmNvbmNhdChcIj5cIik7XG4gICAgICByZXMgPSBVdGlsaXRpZXMuY29uY2F0KHJlcywgdGhpcy5nZXRSZWxhdGlvbnModDEpKTtcbiAgICAgIGxldCB0MiA9IHR5cGUuY29uY2F0KFwiPFwiKTtcbiAgICAgIHJlcyA9IFV0aWxpdGllcy5jb25jYXQocmVzLCB0aGlzLmdldFJlbGF0aW9ucyh0MikpO1xuICAgICAgbGV0IHQzID0gdHlwZS5jb25jYXQoXCItXCIpO1xuICAgICAgcmVzID0gVXRpbGl0aWVzLmNvbmNhdChyZXMsIHRoaXMuZ2V0UmVsYXRpb25zKHQzKSk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgdGhpcy5yZWxhdGlvbnNbdHlwZV0gIT09IFwidW5kZWZpbmVkXCIpIHJlcyA9IHRoaXMucmVsYXRpb25zW1xuICAgICAgdHlwZV07XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG4gIGdldFJlbGF0aW9uc0J5QXBwTmFtZShhcHBOYW1lKSB7XG4gICAgbGV0IHJlcyA9IFtdO1xuICAgIGlmICh0aGlzLmhhc0FwcERlZmluZWQoYXBwTmFtZSkpIHtcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLmFwcHNbYXBwTmFtZV0uX2F0dHJpYnV0ZV9uYW1lcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgYXBwUmVsYXRpb24gPSB0aGlzLmFwcHNbYXBwTmFtZV1bdGhpcy5hcHBzW2FwcE5hbWVdLl9hdHRyaWJ1dGVfbmFtZXNbXG4gICAgICAgICAgaW5kZXhdXTtcbiAgICAgICAgcmVzLnB1c2goYXBwUmVsYXRpb24pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlcztcbiAgICB9IGVsc2UgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG5cbiAgZ2V0UmVsYXRpb25zQnlBcHAoYXBwKSB7XG4gICAgbGV0IGFwcE5hbWUgPSBhcHAubmFtZS5nZXQoKVxuICAgIHJldHVybiB0aGlzLmdldFJlbGF0aW9uc0J5QXBwTmFtZShhcHBOYW1lKVxuICB9XG5cbiAgZ2V0UmVsYXRpb25zQnlBcHBOYW1lQnlUeXBlKGFwcE5hbWUsIHJlbGF0aW9uVHlwZSkge1xuICAgIGxldCByZXMgPSBbXTtcbiAgICBpZiAodGhpcy5oYXNSZWxhdGlvbkJ5QXBwQnlUeXBlRGVmaW5lZChhcHBOYW1lLCByZWxhdGlvblR5cGUpKSB7XG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5hcHBzW2FwcE5hbWVdLl9hdHRyaWJ1dGVfbmFtZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IGFwcFJlbGF0aW9uID0gdGhpcy5hcHBzW2FwcE5hbWVdW3RoaXMuYXBwc1thcHBOYW1lXS5fYXR0cmlidXRlX25hbWVzW1xuICAgICAgICAgIGluZGV4XV07XG4gICAgICAgIGlmIChhcHBSZWxhdGlvbi50eXBlLmdldCgpID09PSByZWxhdGlvblR5cGUpIHJlcy5wdXNoKGFwcFJlbGF0aW9uKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICB9XG4gIH1cblxuICBnZXRSZWxhdGlvbnNCeUFwcEJ5VHlwZShhcHAsIHJlbGF0aW9uVHlwZSkge1xuICAgIGxldCBhcHBOYW1lID0gYXBwLm5hbWUuZ2V0KClcbiAgICByZXR1cm4gdGhpcy5nZXRSZWxhdGlvbnNCeUFwcE5hbWVCeVR5cGUoYXBwTmFtZSwgcmVsYXRpb25UeXBlKVxuXG4gIH1cblxuICBpbk5vZGVMaXN0KF9ub2RlbGlzdCkge1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBfbm9kZWxpc3QubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gX25vZGVsaXN0W2luZGV4XTtcbiAgICAgIGlmIChlbGVtZW50LmlkLmdldCgpID09PSB0aGlzLmlkLmdldCgpKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy9UT0RPIGdldENoaWxkcmVuLCBnZXRQYXJlbnRcblxuICBnZXROZWlnaGJvcnMoX3R5cGUpIHtcbiAgICBsZXQgbmVpZ2hib3JzID0gW107XG4gICAgbGV0IHJlbGF0aW9ucyA9IHRoaXMuZ2V0UmVsYXRpb25zKF90eXBlKTtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcmVsYXRpb25zLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgcmVsYXRpb24gPSByZWxhdGlvbnNbaW5kZXhdO1xuICAgICAgaWYgKHJlbGF0aW9uLmlzRGlyZWN0ZWQuZ2V0KCkpIHtcbiAgICAgICAgaWYgKHRoaXMuaW5Ob2RlTGlzdChyZWxhdGlvbi5ub2RlTGlzdDEpKVxuICAgICAgICAgIG5laWdoYm9ycyA9IFV0aWxpdGllcy5jb25jYXQobmVpZ2hib3JzLCByZWxhdGlvbi5ub2RlTGlzdDIpO1xuICAgICAgICBlbHNlIG5laWdoYm9ycyA9IFV0aWxpdGllcy5jb25jYXQobmVpZ2hib3JzLCByZWxhdGlvbi5ub2RlTGlzdDEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmVpZ2hib3JzID0gVXRpbGl0aWVzLmNvbmNhdChcbiAgICAgICAgICBuZWlnaGJvcnMsXG4gICAgICAgICAgVXRpbGl0aWVzLmFsbEJ1dE1lQnlJZChyZWxhdGlvbi5ub2RlTGlzdDEpXG4gICAgICAgICk7XG4gICAgICAgIG5laWdoYm9ycyA9IFV0aWxpdGllcy5jb25jYXQoXG4gICAgICAgICAgbmVpZ2hib3JzLFxuICAgICAgICAgIFV0aWxpdGllcy5hbGxCdXRNZUJ5SWQocmVsYXRpb24ubm9kZUxpc3QyKVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmVpZ2hib3JzO1xuICB9XG5cbiAgcmVtb3ZlUmVsYXRpb24oX3JlbGF0aW9uKSB7XG4gICAgbGV0IHJlbGF0aW9uTHN0ID0gdGhpcy5yZWxhdGlvbnNbX3JlbGF0aW9uLnR5cGUuZ2V0KCldO1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCByZWxhdGlvbkxzdC5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IGNhbmRpZGF0ZVJlbGF0aW9uID0gcmVsYXRpb25Mc3RbaW5kZXhdO1xuICAgICAgaWYgKF9yZWxhdGlvbi5pZC5nZXQoKSA9PT0gY2FuZGlkYXRlUmVsYXRpb24uaWQuZ2V0KCkpXG4gICAgICAgIHJlbGF0aW9uTHN0LnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICB9XG5cbiAgcmVtb3ZlUmVsYXRpb25zKF9yZWxhdGlvbnMpIHtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX3JlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHRoaXMucmVtb3ZlUmVsYXRpb24oX3JlbGF0aW9uc1tpbmRleF0pO1xuICAgIH1cbiAgfVxuXG4gIHJlbW92ZVJlbGF0aW9uVHlwZShfdHlwZSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KF90eXBlKSB8fCBfdHlwZSBpbnN0YW5jZW9mIExzdClcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBfdHlwZS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgdHlwZSA9IF90eXBlW2luZGV4XTtcbiAgICAgICAgdGhpcy5yZWxhdGlvbnMucmVtX2F0dHIodHlwZSk7XG4gICAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLnJlbGF0aW9ucy5yZW1fYXR0cihfdHlwZSk7XG4gICAgfVxuICB9XG5cbiAgaGFzQXBwRGVmaW5lZChhcHBOYW1lKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLmFwcHNbYXBwTmFtZV0gIT09IFwidW5kZWZpbmVkXCIpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKFwiYXBwIFwiICsgYXBwTmFtZSArXG4gICAgICAgIFwiIGlzIG5vdCBkZWZpbmVkIGZvciBub2RlIFwiICsgdGhpcy5uYW1lLmdldCgpKTtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIGhhc1JlbGF0aW9uQnlBcHBCeVR5cGVEZWZpbmVkKGFwcE5hbWUsIHJlbGF0aW9uVHlwZSkge1xuICAgIGlmICh0aGlzLmhhc0FwcERlZmluZWQoYXBwTmFtZSkgJiYgdHlwZW9mIHRoaXMuYXBwc1thcHBOYW1lXVtcbiAgICAgICAgcmVsYXRpb25UeXBlXG4gICAgICBdICE9PVxuICAgICAgXCJ1bmRlZmluZWRcIilcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oXCJyZWxhdGlvbiBcIiArIHJlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGlzIG5vdCBkZWZpbmVkIGZvciBub2RlIFwiICsgdGhpcy5uYW1lLmdldCgpICtcbiAgICAgICAgXCIgZm9yIGFwcGxpY2F0aW9uIFwiICsgYXBwTmFtZSk7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cblxuICB0b0pzb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiB0aGlzLmlkLmdldCgpLFxuICAgICAgbmFtZTogdGhpcy5uYW1lLmdldCgpLFxuICAgICAgZWxlbWVudDogbnVsbFxuICAgIH07XG4gIH1cblxuICB0b0pzb25XaXRoUmVsYXRpb25zKCkge1xuICAgIGxldCByZWxhdGlvbnMgPSBbXTtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5nZXRSZWxhdGlvbnMoKS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IHJlbGF0aW9uID0gdGhpcy5nZXRSZWxhdGlvbnMoKVtpbmRleF07XG4gICAgICByZWxhdGlvbnMucHVzaChyZWxhdGlvbi50b0pzb24oKSk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBpZDogdGhpcy5pZC5nZXQoKSxcbiAgICAgIG5hbWU6IHRoaXMubmFtZS5nZXQoKSxcbiAgICAgIGVsZW1lbnQ6IG51bGwsXG4gICAgICByZWxhdGlvbnM6IHJlbGF0aW9uc1xuICAgIH07XG4gIH1cblxuICBhc3luYyB0b0lmYygpIHtcbiAgICBsZXQgZWxlbWVudCA9IGF3YWl0IFV0aWxpdGllcy5wcm9taXNlTG9hZCh0aGlzLmVsZW1lbnQpO1xuICAgIHJldHVybiBlbGVtZW50LnRvSWZjKCk7XG4gIH1cbn1cblxuc3BpbmFsQ29yZS5yZWdpc3Rlcl9tb2RlbHMoW1NwaW5hbE5vZGVdKTsiXX0=