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
    for (let index = 0; index < this.apps[appName]._attribute_names.length; index++) {
      const appRelation = this.apps[appName][this.apps[appName]._attribute_names[index]];
      res.push(appRelation);
    }
    return res;
  }

  getRelationsByApp(app) {
    let appName = app.name.get();
    return this.getRelationsByAppName(appName);
  }

  getRelationsByAppNameByType(appName, type) {
    let res = new Lst();

    for (let index = 0; index < this.apps[appName]._attribute_names.length; index++) {
      const appRelation = this.apps[appName][this.apps[appName]._attribute_names[index]];
      if (appRelation.type.get() === type) res.push(appRelation);
    }
    return res;
  }

  getRelationsByAppByType(app, relationType) {
    let appName = app.name.get();
    if (this.hasRelationByAppByTypeDefined(appName, relationType)) return this.getRelationsByAppNameByType(appName, relationType);else {
      return undefined;
    }
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
      console.warn("app " + appName + " is not defined for node " + this.get());
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TcGluYWxOb2RlLmpzIl0sIm5hbWVzIjpbInNwaW5hbENvcmUiLCJyZXF1aXJlIiwiZ2xvYmFsVHlwZSIsIndpbmRvdyIsImdsb2JhbCIsImdldFZpZXdlciIsInYiLCJTcGluYWxOb2RlIiwiTW9kZWwiLCJjb25zdHJ1Y3RvciIsIl9uYW1lIiwiX2VsZW1lbnQiLCJfZ3JhcGgiLCJfcmVsYXRpb25zIiwibmFtZSIsIkZpbGVTeXN0ZW0iLCJfc2lnX3NlcnZlciIsImFkZF9hdHRyIiwiZWxlbWVudCIsIlB0ciIsInJlbGF0aW9ucyIsImFwcHMiLCJncmFwaCIsImNsYXNzaWZ5Tm9kZSIsIkFycmF5IiwiaXNBcnJheSIsIkxzdCIsImFkZFJlbGF0aW9ucyIsImFkZFJlbGF0aW9uIiwiZ2V0QXBwc05hbWVzIiwiX2F0dHJpYnV0ZV9uYW1lcyIsImdldEFwcHMiLCJyZXMiLCJpbmRleCIsImxlbmd0aCIsImFwcE5hbWUiLCJwdXNoIiwiYXBwc0xpc3QiLCJjaGFuZ2VEZWZhdWx0UmVsYXRpb24iLCJyZWxhdGlvblR5cGUiLCJyZWxhdGlvbiIsImFzUGFyZW50IiwiaXNEaXJlY3RlZCIsImdldCIsIlV0aWxpdGllcyIsInB1dE9uVG9wTHN0IiwiaGFzUmVsYXRpb24iLCJhZGREaXJlY3RlZFJlbGF0aW9uUGFyZW50IiwidHlwZSIsImNvbmNhdCIsImFkZFJlbGF0aW9uQnlBcHAiLCJhZGREaXJlY3RlZFJlbGF0aW9uQ2hpbGQiLCJhZGROb25EaXJlY3RlZFJlbGF0aW9uIiwiaXNSZXNlcnZlZCIsIm5hbWVUbXAiLCJsaXN0IiwiY29uc29sZSIsImxvZyIsInJlc2VydmVkUmVsYXRpb25zTmFtZXMiLCJoYXNSZXNlcnZhdGlvbkNyZWRlbnRpYWxzIiwiY29udGFpbnNBcHAiLCJlcnJvciIsImFkZFNpbXBsZVJlbGF0aW9uIiwibm9kZTIiLCJhZGROb2RlIiwicmVsIiwiU3BpbmFsUmVsYXRpb24iLCJhZGRTaW1wbGVSZWxhdGlvbkJ5QXBwIiwiYWRkVG9FeGlzdGluZ1JlbGF0aW9uIiwiZXhpc3RpbmdSZWxhdGlvbnMiLCJnZXRSZWxhdGlvbnMiLCJhZGROb2RldG9Ob2RlTGlzdDEiLCJhZGROb2RldG9Ob2RlTGlzdDIiLCJhZGRUb0V4aXN0aW5nUmVsYXRpb25CeUFwcCIsImFwcFJlbGF0aW9ucyIsImdldFJlbGF0aW9uc0J5QXBwTmFtZSIsImFkZFJlbGF0aW9uMiIsIl9yZWxhdGlvbiIsImNsYXNzaWZ5IiwiYXJyYXlzRXF1YWwiLCJnZXROb2RlTGlzdDFJZHMiLCJhZGROb3RFeGlzdGluZ1ZlcnRpY2VzdG9Ob2RlTGlzdDIiLCJub2RlTGlzdDIiLCJhZGROb3RFeGlzdGluZ1ZlcnRpY2VzdG9SZWxhdGlvbiIsIl9jbGFzc2lmeVJlbGF0aW9uIiwibG9hZCIsImkiLCJyZWxMaXN0IiwiaiIsImdldFJlbGF0aW9uc0J5VHlwZSIsImluY2x1ZGVzIiwidDEiLCJ0MiIsInQzIiwiYXBwUmVsYXRpb24iLCJnZXRSZWxhdGlvbnNCeUFwcCIsImFwcCIsImdldFJlbGF0aW9uc0J5QXBwTmFtZUJ5VHlwZSIsImdldFJlbGF0aW9uc0J5QXBwQnlUeXBlIiwiaGFzUmVsYXRpb25CeUFwcEJ5VHlwZURlZmluZWQiLCJ1bmRlZmluZWQiLCJpbk5vZGVMaXN0IiwiX25vZGVsaXN0IiwiaWQiLCJnZXROZWlnaGJvcnMiLCJfdHlwZSIsIm5laWdoYm9ycyIsIm5vZGVMaXN0MSIsImFsbEJ1dE1lQnlJZCIsInJlbW92ZVJlbGF0aW9uIiwicmVsYXRpb25Mc3QiLCJjYW5kaWRhdGVSZWxhdGlvbiIsInNwbGljZSIsInJlbW92ZVJlbGF0aW9ucyIsInJlbW92ZVJlbGF0aW9uVHlwZSIsInJlbV9hdHRyIiwiaGFzQXBwRGVmaW5lZCIsIndhcm4iLCJ0b0pzb24iLCJ0b0pzb25XaXRoUmVsYXRpb25zIiwidG9JZmMiLCJwcm9taXNlTG9hZCIsInJlZ2lzdGVyX21vZGVscyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBRUE7Ozs7QUFLQTs7OztBQVBBLE1BQU1BLGFBQWFDLFFB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SzhCLFlBQUwsR0FBb0JyQyxLQUFwQixDQUFqQjtBQUNBYixnQkFBVWdCLElBQVYsQ0FBZUksU0FBUzhFLE1BQVQsRUFBZjtBQUNEO0FBQ0QsV0FBTztBQUNMZixVQUFJLEtBQUtBLEVBQUwsQ0FBUTVELEdBQVIsRUFEQztBQUVMN0IsWUFBTSxLQUFLQSxJQUFMLENBQVU2QixHQUFWLEVBRkQ7QUFHTHpCLGVBQVMsSUFISjtBQUlMRSxpQkFBV0E7QUFKTixLQUFQO0FBTUQ7O0FBRUQsUUFBTW9HLEtBQU4sR0FBYztBQUNaLFFBQUl0RyxVQUFVLE1BQU0wQixxQkFBVTZFLFdBQVYsQ0FBc0IsS0FBS3ZHLE9BQTNCLENBQXBCO0FBQ0EsV0FBT0EsUUFBUXNHLEtBQVIsRUFBUDtBQUNEO0FBdmdCc0Q7O2tCQUFwQ2pILFU7QUEwZ0JyQlAsV0FBVzBILGVBQVgsQ0FBMkIsQ0FBQ25ILFVBQUQsQ0FBM0IiLCJmaWxlIjoiU3BpbmFsTm9kZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHNwaW5hbENvcmUgPSByZXF1aXJlKFwic3BpbmFsLWNvcmUtY29ubmVjdG9yanNcIik7XG5jb25zdCBnbG9iYWxUeXBlID0gdHlwZW9mIHdpbmRvdyA9PT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHdpbmRvdztcbmltcG9ydCBTcGluYWxSZWxhdGlvbiBmcm9tIFwiLi9TcGluYWxSZWxhdGlvblwiO1xubGV0IGdldFZpZXdlciA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gZ2xvYmFsVHlwZS52O1xufTtcblxuaW1wb3J0IHtcbiAgVXRpbGl0aWVzXG59IGZyb20gXCIuL1V0aWxpdGllc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTcGluYWxOb2RlIGV4dGVuZHMgZ2xvYmFsVHlwZS5Nb2RlbCB7XG4gIGNvbnN0cnVjdG9yKF9uYW1lLCBfZWxlbWVudCwgX2dyYXBoLCBfcmVsYXRpb25zLCBuYW1lID0gXCJTcGluYWxOb2RlXCIpIHtcbiAgICBzdXBlcigpO1xuICAgIGlmIChGaWxlU3lzdGVtLl9zaWdfc2VydmVyKSB7XG4gICAgICB0aGlzLmFkZF9hdHRyKHtcbiAgICAgICAgbmFtZTogX25hbWUsXG4gICAgICAgIGVsZW1lbnQ6IG5ldyBQdHIoX2VsZW1lbnQpLFxuICAgICAgICByZWxhdGlvbnM6IG5ldyBNb2RlbCgpLFxuICAgICAgICBhcHBzOiBuZXcgTW9kZWwoKSxcbiAgICAgICAgZ3JhcGg6IF9ncmFwaFxuICAgICAgfSk7XG4gICAgICBpZiAodHlwZW9mIHRoaXMuZ3JhcGggIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgdGhpcy5ncmFwaC5jbGFzc2lmeU5vZGUodGhpcyk7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIF9yZWxhdGlvbnMgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoX3JlbGF0aW9ucykgfHwgX3JlbGF0aW9ucyBpbnN0YW5jZW9mIExzdClcbiAgICAgICAgICB0aGlzLmFkZFJlbGF0aW9ucyhfcmVsYXRpb25zKTtcbiAgICAgICAgZWxzZSB0aGlzLmFkZFJlbGF0aW9uKF9yZWxhdGlvbnMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIHJlZ2lzdGVyQXBwKGFwcCkge1xuICAvLyAgIHRoaXMuYXBwcy5hZGRfYXR0cih7XG4gIC8vICAgICBbYXBwLm5hbWUuZ2V0KCldOiBuZXcgUHRyKGFwcClcbiAgLy8gICB9KVxuICAvLyB9XG5cbiAgZ2V0QXBwc05hbWVzKCkge1xuICAgIHJldHVybiB0aGlzLmFwcHMuX2F0dHJpYnV0ZV9uYW1lcztcbiAgfVxuXG4gIGdldEFwcHMoKSB7XG4gICAgbGV0IHJlcyA9IFtdXG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMuYXBwcy5fYXR0cmlidXRlX25hbWVzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgYXBwTmFtZSA9IHRoaXMuYXBwcy5fYXR0cmlidXRlX25hbWVzW2luZGV4XTtcbiAgICAgIHJlcy5wdXNoKHRoaXMuZ3JhcGguYXBwc0xpc3RbYXBwTmFtZV0pXG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cblxuICBjaGFuZ2VEZWZhdWx0UmVsYXRpb24ocmVsYXRpb25UeXBlLCByZWxhdGlvbiwgYXNQYXJlbnQpIHtcbiAgICBpZiAocmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKSkge1xuICAgICAgaWYgKGFzUGFyZW50KSB7XG4gICAgICAgIFV0aWxpdGllcy5wdXRPblRvcExzdCh0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIjxcIl0sIHJlbGF0aW9uKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIFV0aWxpdGllcy5wdXRPblRvcExzdCh0aGlzLnJlbGF0aW9uc1tyZWxhdGlvblR5cGUgKyBcIj5cIl0sIHJlbGF0aW9uKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgVXRpbGl0aWVzLnB1dE9uVG9wTHN0KHRoaXMucmVsYXRpb25zW3JlbGF0aW9uVHlwZSArIFwiLVwiXSwgcmVsYXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIGhhc1JlbGF0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnJlbGF0aW9ucy5sZW5ndGggIT09IDA7XG4gIH1cblxuICBhZGREaXJlY3RlZFJlbGF0aW9uUGFyZW50KHJlbGF0aW9uLCBhcHBOYW1lKSB7XG4gICAgbGV0IG5hbWUgPSByZWxhdGlvbi50eXBlLmdldCgpO1xuICAgIG5hbWUgPSBuYW1lLmNvbmNhdChcIjxcIik7XG4gICAgaWYgKHR5cGVvZiBhcHBOYW1lID09PSBcInVuZGVmaW5lZFwiKSB0aGlzLmFkZFJlbGF0aW9uKHJlbGF0aW9uLCBuYW1lKTtcbiAgICBlbHNlIHRoaXMuYWRkUmVsYXRpb25CeUFwcChyZWxhdGlvbiwgbmFtZSwgYXBwTmFtZSk7XG4gIH1cblxuICBhZGREaXJlY3RlZFJlbGF0aW9uQ2hpbGQocmVsYXRpb24sIGFwcE5hbWUpIHtcbiAgICBsZXQgbmFtZSA9IHJlbGF0aW9uLnR5cGUuZ2V0KCk7XG4gICAgbmFtZSA9IG5hbWUuY29uY2F0KFwiPlwiKTtcbiAgICBpZiAodHlwZW9mIGFwcE5hbWUgPT09IFwidW5kZWZpbmVkXCIpIHRoaXMuYWRkUmVsYXRpb24ocmVsYXRpb24sIG5hbWUpO1xuICAgIGVsc2UgdGhpcy5hZGRSZWxhdGlvbkJ5QXBwKHJlbGF0aW9uLCBuYW1lLCBhcHBOYW1lKTtcbiAgfVxuXG4gIGFkZE5vbkRpcmVjdGVkUmVsYXRpb24ocmVsYXRpb24sIGFwcE5hbWUpIHtcbiAgICBsZXQgbmFtZSA9IHJlbGF0aW9uLnR5cGUuZ2V0KCk7XG4gICAgbmFtZSA9IG5hbWUuY29uY2F0KFwiLVwiKTtcbiAgICBpZiAodHlwZW9mIGFwcE5hbWUgPT09IFwidW5kZWZpbmVkXCIpIHRoaXMuYWRkUmVsYXRpb24ocmVsYXRpb24sIG5hbWUpO1xuICAgIGVsc2UgdGhpcy5hZGRSZWxhdGlvbkJ5QXBwKHJlbGF0aW9uLCBuYW1lLCBhcHBOYW1lKTtcbiAgfVxuXG4gIGFkZFJlbGF0aW9uKHJlbGF0aW9uLCBuYW1lKSB7XG4gICAgaWYgKCF0aGlzLmdyYXBoLmlzUmVzZXJ2ZWQocmVsYXRpb24udHlwZS5nZXQoKSkpIHtcbiAgICAgIGxldCBuYW1lVG1wID0gcmVsYXRpb24udHlwZS5nZXQoKTtcbiAgICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBuYW1lVG1wID0gbmFtZTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgdGhpcy5yZWxhdGlvbnNbbmFtZVRtcF0gIT09IFwidW5kZWZpbmVkXCIpXG4gICAgICAgIHRoaXMucmVsYXRpb25zW25hbWVUbXBdLnB1c2gocmVsYXRpb24pO1xuICAgICAgZWxzZSB7XG4gICAgICAgIGxldCBsaXN0ID0gbmV3IExzdCgpO1xuICAgICAgICBsaXN0LnB1c2gocmVsYXRpb24pO1xuICAgICAgICB0aGlzLnJlbGF0aW9ucy5hZGRfYXR0cih7XG4gICAgICAgICAgW25hbWVUbXBdOiBsaXN0XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb24udHlwZS5nZXQoKSArXG4gICAgICAgIFwiIGlzIHJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5ncmFwaC5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uLnR5cGUuZ2V0KCldXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGFkZFJlbGF0aW9uQnlBcHAocmVsYXRpb24sIG5hbWUsIGFwcE5hbWUpIHtcbiAgICBpZiAodGhpcy5ncmFwaC5oYXNSZXNlcnZhdGlvbkNyZWRlbnRpYWxzKHJlbGF0aW9uLnR5cGUuZ2V0KCksIGFwcE5hbWUpKSB7XG4gICAgICBpZiAodGhpcy5ncmFwaC5jb250YWluc0FwcChhcHBOYW1lKSkge1xuICAgICAgICBsZXQgbmFtZVRtcCA9IHJlbGF0aW9uLnR5cGUuZ2V0KCk7XG4gICAgICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgIG5hbWVUbXAgPSBuYW1lO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5yZWxhdGlvbnNbbmFtZVRtcF0gIT09IFwidW5kZWZpbmVkXCIpXG4gICAgICAgICAgdGhpcy5yZWxhdGlvbnNbbmFtZVRtcF0ucHVzaChyZWxhdGlvbik7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGxldCBsaXN0ID0gbmV3IExzdCgpO1xuICAgICAgICAgIGxpc3QucHVzaChyZWxhdGlvbik7XG4gICAgICAgICAgdGhpcy5yZWxhdGlvbnMuYWRkX2F0dHIoe1xuICAgICAgICAgICAgW25hbWVUbXBdOiBsaXN0XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmFwcHNbYXBwTmFtZV0gIT09IFwidW5kZWZpbmVkXCIpXG4gICAgICAgICAgdGhpcy5hcHBzW2FwcE5hbWVdLmFkZF9hdHRyKHtcbiAgICAgICAgICAgIFtyZWxhdGlvbi50eXBlLmdldCgpXTogcmVsYXRpb25cbiAgICAgICAgICB9KTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgbGV0IGxpc3QgPSBuZXcgTW9kZWwoKTtcbiAgICAgICAgICBsaXN0LmFkZF9hdHRyKHtcbiAgICAgICAgICAgIFtyZWxhdGlvbi50eXBlLmdldCgpXTogcmVsYXRpb25cbiAgICAgICAgICB9KTtcbiAgICAgICAgICB0aGlzLmFwcHMuYWRkX2F0dHIoe1xuICAgICAgICAgICAgW2FwcE5hbWVdOiBsaXN0XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYXBwTmFtZSArIFwiIGRvZXMgbm90IGV4aXN0XCIpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb24udHlwZS5nZXQoKSArXG4gICAgICAgIFwiIGlzIHJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5ncmFwaC5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uLnR5cGUuZ2V0KCldXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGFkZFNpbXBsZVJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgZWxlbWVudCwgaXNEaXJlY3RlZCA9IGZhbHNlKSB7XG4gICAgaWYgKCF0aGlzLmdyYXBoLmlzUmVzZXJ2ZWQocmVsYXRpb25UeXBlKSkge1xuICAgICAgbGV0IG5vZGUyID0gdGhpcy5ncmFwaC5hZGROb2RlKGVsZW1lbnQpO1xuICAgICAgbGV0IHJlbCA9IG5ldyBTcGluYWxSZWxhdGlvbihyZWxhdGlvblR5cGUsIFt0aGlzXSwgW25vZGUyXSxcbiAgICAgICAgaXNEaXJlY3RlZCk7XG4gICAgICB0aGlzLmdyYXBoLmFkZFJlbGF0aW9uKHJlbCk7XG4gICAgICByZXR1cm4gcmVsO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLmdyYXBoLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBhZGRTaW1wbGVSZWxhdGlvbkJ5QXBwKGFwcE5hbWUsIHJlbGF0aW9uVHlwZSwgZWxlbWVudCwgaXNEaXJlY3RlZCA9IGZhbHNlKSB7XG4gICAgaWYgKHRoaXMuZ3JhcGguaGFzUmVzZXJ2YXRpb25DcmVkZW50aWFscyhyZWxhdGlvblR5cGUsIGFwcE5hbWUpKSB7XG4gICAgICBpZiAodGhpcy5ncmFwaC5jb250YWluc0FwcChhcHBOYW1lKSkge1xuICAgICAgICBsZXQgbm9kZTIgPSB0aGlzLmdyYXBoLmFkZE5vZGUoZWxlbWVudCk7XG4gICAgICAgIGxldCByZWwgPSBuZXcgU3BpbmFsUmVsYXRpb24ocmVsYXRpb25UeXBlLCBbdGhpc10sIFtub2RlMl0sXG4gICAgICAgICAgaXNEaXJlY3RlZCk7XG4gICAgICAgIHRoaXMuZ3JhcGguYWRkUmVsYXRpb24ocmVsLCBhcHBOYW1lKTtcbiAgICAgICAgcmV0dXJuIHJlbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYXBwTmFtZSArIFwiIGRvZXMgbm90IGV4aXN0XCIpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLmdyYXBoLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBhZGRUb0V4aXN0aW5nUmVsYXRpb24oXG4gICAgcmVsYXRpb25UeXBlLFxuICAgIGVsZW1lbnQsXG4gICAgaXNEaXJlY3RlZCA9IGZhbHNlLFxuICAgIGFzUGFyZW50ID0gZmFsc2VcbiAgKSB7XG4gICAgaWYgKCF0aGlzLmdyYXBoLmlzUmVzZXJ2ZWQocmVsYXRpb25UeXBlKSkge1xuICAgICAgbGV0IG5vZGUyID0gdGhpcy5ncmFwaC5hZGROb2RlKGVsZW1lbnQpO1xuICAgICAgbGV0IGV4aXN0aW5nUmVsYXRpb25zID0gdGhpcy5nZXRSZWxhdGlvbnMoKTtcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBleGlzdGluZ1JlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgcmVsYXRpb24gPSBleGlzdGluZ1JlbGF0aW9uc1tpbmRleF07XG4gICAgICAgIGlmIChcbiAgICAgICAgICByZWxhdGlvblR5cGUgPT09IHJlbGF0aW9uVHlwZSAmJlxuICAgICAgICAgIGlzRGlyZWN0ZWQgPT09IHJlbGF0aW9uLmlzRGlyZWN0ZWQuZ2V0KClcbiAgICAgICAgKSB7XG4gICAgICAgICAgaWYgKGlzRGlyZWN0ZWQpIHtcbiAgICAgICAgICAgIGlmIChhc1BhcmVudCkge1xuICAgICAgICAgICAgICByZWxhdGlvbi5hZGROb2RldG9Ob2RlTGlzdDEobm9kZTIpO1xuICAgICAgICAgICAgICBub2RlMi5hZGREaXJlY3RlZFJlbGF0aW9uUGFyZW50KHJlbGF0aW9uKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlbGF0aW9uO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVsYXRpb24uYWRkTm9kZXRvTm9kZUxpc3QyKG5vZGUyKTtcbiAgICAgICAgICAgICAgbm9kZTIuYWRkRGlyZWN0ZWRSZWxhdGlvbkNoaWxkKHJlbGF0aW9uKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlbGF0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZWxhdGlvbi5hZGROb2RldG9Ob2RlTGlzdDIobm9kZTIpO1xuICAgICAgICAgICAgbm9kZTIuYWRkTm9uRGlyZWN0ZWRSZWxhdGlvbihyZWxhdGlvbik7XG4gICAgICAgICAgICByZXR1cm4gcmVsYXRpb247XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBsZXQgcmVsID0gdGhpcy5hZGRTaW1wbGVSZWxhdGlvbihyZWxhdGlvblR5cGUsIGVsZW1lbnQsIGlzRGlyZWN0ZWQpO1xuICAgICAgcmV0dXJuIHJlbDtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIHJlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGlzIHJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5ncmFwaC5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uVHlwZV1cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgYWRkVG9FeGlzdGluZ1JlbGF0aW9uQnlBcHAoXG4gICAgYXBwTmFtZSxcbiAgICByZWxhdGlvblR5cGUsXG4gICAgZWxlbWVudCxcbiAgICBpc0RpcmVjdGVkID0gZmFsc2UsXG4gICAgYXNQYXJlbnQgPSBmYWxzZVxuICApIHtcbiAgICBpZiAodGhpcy5ncmFwaC5oYXNSZXNlcnZhdGlvbkNyZWRlbnRpYWxzKHJlbGF0aW9uVHlwZSwgYXBwTmFtZSkpIHtcbiAgICAgIGlmICh0aGlzLmdyYXBoLmNvbnRhaW5zQXBwKGFwcE5hbWUpKSB7XG4gICAgICAgIGxldCBub2RlMiA9IHRoaXMuZ3JhcGguYWRkTm9kZShlbGVtZW50KTtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmFwcHNbYXBwTmFtZV0gIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBsZXQgYXBwUmVsYXRpb25zID0gdGhpcy5nZXRSZWxhdGlvbnNCeUFwcE5hbWUoYXBwTmFtZSk7XG4gICAgICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGFwcFJlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICAgIGNvbnN0IHJlbGF0aW9uID0gYXBwUmVsYXRpb25zW2luZGV4XTtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgcmVsYXRpb24udHlwZS5nZXQoKSA9PT0gcmVsYXRpb25UeXBlICYmXG4gICAgICAgICAgICAgIGlzRGlyZWN0ZWQgPT09IHJlbGF0aW9uLmlzRGlyZWN0ZWQuZ2V0KClcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICBpZiAoaXNEaXJlY3RlZCkge1xuICAgICAgICAgICAgICAgIGlmIChhc1BhcmVudCkge1xuICAgICAgICAgICAgICAgICAgcmVsYXRpb24uYWRkTm9kZXRvTm9kZUxpc3QxKG5vZGUyKTtcbiAgICAgICAgICAgICAgICAgIG5vZGUyLmFkZERpcmVjdGVkUmVsYXRpb25QYXJlbnQocmVsYXRpb24sIGFwcE5hbWUpO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlbGF0aW9uO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICByZWxhdGlvbi5hZGROb2RldG9Ob2RlTGlzdDIobm9kZTIpO1xuICAgICAgICAgICAgICAgICAgbm9kZTIuYWRkRGlyZWN0ZWRSZWxhdGlvbkNoaWxkKHJlbGF0aW9uLCBhcHBOYW1lKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiByZWxhdGlvbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVsYXRpb24uYWRkTm9kZXRvTm9kZUxpc3QyKG5vZGUyKTtcbiAgICAgICAgICAgICAgICBub2RlMi5hZGROb25EaXJlY3RlZFJlbGF0aW9uKHJlbGF0aW9uLCBhcHBOYW1lKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVsYXRpb247XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHJlbCA9IHRoaXMuYWRkU2ltcGxlUmVsYXRpb25CeUFwcChcbiAgICAgICAgICBhcHBOYW1lLFxuICAgICAgICAgIHJlbGF0aW9uVHlwZSxcbiAgICAgICAgICBlbGVtZW50LFxuICAgICAgICAgIGlzRGlyZWN0ZWRcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIHJlbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYXBwTmFtZSArIFwiIGRvZXMgbm90IGV4aXN0XCIpO1xuICAgICAgfVxuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIHJlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGlzIHJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5ncmFwaC5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uVHlwZV1cbiAgICAgICk7XG4gICAgfVxuICB9XG5cblxuXG5cbiAgYWRkUmVsYXRpb24yKF9yZWxhdGlvbiwgX25hbWUpIHtcbiAgICBsZXQgY2xhc3NpZnkgPSBmYWxzZTtcbiAgICBsZXQgbmFtZSA9IF9yZWxhdGlvbi50eXBlLmdldCgpO1xuICAgIGlmICh0eXBlb2YgX25hbWUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIG5hbWUgPSBfbmFtZTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0aW9uc1tfcmVsYXRpb24udHlwZS5nZXQoKV0gIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGlmIChfcmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKSkge1xuICAgICAgICBmb3IgKFxuICAgICAgICAgIGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5yZWxhdGlvbnNbX3JlbGF0aW9uLnR5cGUuZ2V0KCldLmxlbmd0aDsgaW5kZXgrK1xuICAgICAgICApIHtcbiAgICAgICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5yZWxhdGlvbnNbX3JlbGF0aW9uLnR5cGUuZ2V0KCldW2luZGV4XTtcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBVdGlsaXRpZXMuYXJyYXlzRXF1YWwoXG4gICAgICAgICAgICAgIF9yZWxhdGlvbi5nZXROb2RlTGlzdDFJZHMoKSxcbiAgICAgICAgICAgICAgZWxlbWVudC5nZXROb2RlTGlzdDFJZHMoKVxuICAgICAgICAgICAgKVxuICAgICAgICAgICkge1xuICAgICAgICAgICAgZWxlbWVudC5hZGROb3RFeGlzdGluZ1ZlcnRpY2VzdG9Ob2RlTGlzdDIoX3JlbGF0aW9uLm5vZGVMaXN0Mik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsZW1lbnQucHVzaChfcmVsYXRpb24pO1xuICAgICAgICAgICAgY2xhc3NpZnkgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZWxhdGlvbnNbX3JlbGF0aW9uLnR5cGUuZ2V0KCldLmFkZE5vdEV4aXN0aW5nVmVydGljZXN0b1JlbGF0aW9uKFxuICAgICAgICAgIF9yZWxhdGlvblxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoX3JlbGF0aW9uLmlzRGlyZWN0ZWQuZ2V0KCkpIHtcbiAgICAgICAgbGV0IGxpc3QgPSBuZXcgTHN0KCk7XG4gICAgICAgIGxpc3QucHVzaChfcmVsYXRpb24pO1xuICAgICAgICB0aGlzLnJlbGF0aW9ucy5hZGRfYXR0cih7XG4gICAgICAgICAgW25hbWVdOiBsaXN0XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLl9jbGFzc2lmeVJlbGF0aW9uKF9yZWxhdGlvbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJlbGF0aW9ucy5hZGRfYXR0cih7XG4gICAgICAgICAgW25hbWVdOiBfcmVsYXRpb25cbiAgICAgICAgfSk7XG4gICAgICAgIGNsYXNzaWZ5ID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGNsYXNzaWZ5KSB0aGlzLl9jbGFzc2lmeVJlbGF0aW9uKF9yZWxhdGlvbik7XG4gIH1cblxuICBfY2xhc3NpZnlSZWxhdGlvbihfcmVsYXRpb24pIHtcbiAgICB0aGlzLmdyYXBoLmxvYWQoZ3JhcGggPT4ge1xuICAgICAgZ3JhcGguX2NsYXNzaWZ5UmVsYXRpb24oX3JlbGF0aW9uKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vVE9ETyA6Tm90V29ya2luZ1xuICAvLyBhZGRSZWxhdGlvbihfcmVsYXRpb24pIHtcbiAgLy8gICB0aGlzLmFkZFJlbGF0aW9uKF9yZWxhdGlvbilcbiAgLy8gICB0aGlzLmdyYXBoLmxvYWQoZ3JhcGggPT4ge1xuICAvLyAgICAgZ3JhcGguX2FkZE5vdEV4aXN0aW5nVmVydGljZXNGcm9tUmVsYXRpb24oX3JlbGF0aW9uKVxuICAvLyAgIH0pXG4gIC8vIH1cbiAgLy9UT0RPIDpOb3RXb3JraW5nXG4gIC8vIGFkZFJlbGF0aW9ucyhfcmVsYXRpb25zKSB7XG4gIC8vICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IF9yZWxhdGlvbnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gIC8vICAgICB0aGlzLmFkZFJlbGF0aW9uKF9yZWxhdGlvbnNbaW5kZXhdKTtcbiAgLy8gICB9XG4gIC8vIH1cblxuICBnZXRSZWxhdGlvbnMoKSB7XG4gICAgbGV0IHJlcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5yZWxhdGlvbnMuX2F0dHJpYnV0ZV9uYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgcmVsTGlzdCA9IHRoaXMucmVsYXRpb25zW3RoaXMucmVsYXRpb25zLl9hdHRyaWJ1dGVfbmFtZXNbaV1dO1xuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCByZWxMaXN0Lmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGNvbnN0IHJlbGF0aW9uID0gcmVsTGlzdFtqXTtcbiAgICAgICAgcmVzLnB1c2gocmVsYXRpb24pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgZ2V0UmVsYXRpb25zQnlUeXBlKHR5cGUpIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgaWYgKCF0eXBlLmluY2x1ZGVzKFwiPlwiLCB0eXBlLmxlbmd0aCAtIDIpICYmXG4gICAgICAhdHlwZS5pbmNsdWRlcyhcIjxcIiwgdHlwZS5sZW5ndGggLSAyKSAmJlxuICAgICAgIXR5cGUuaW5jbHVkZXMoXCItXCIsIHR5cGUubGVuZ3RoIC0gMilcbiAgICApIHtcbiAgICAgIGxldCB0MSA9IHR5cGUuY29uY2F0KFwiPlwiKTtcbiAgICAgIHJlcyA9IFV0aWxpdGllcy5jb25jYXQocmVzLCB0aGlzLmdldFJlbGF0aW9ucyh0MSkpO1xuICAgICAgbGV0IHQyID0gdHlwZS5jb25jYXQoXCI8XCIpO1xuICAgICAgcmVzID0gVXRpbGl0aWVzLmNvbmNhdChyZXMsIHRoaXMuZ2V0UmVsYXRpb25zKHQyKSk7XG4gICAgICBsZXQgdDMgPSB0eXBlLmNvbmNhdChcIi1cIik7XG4gICAgICByZXMgPSBVdGlsaXRpZXMuY29uY2F0KHJlcywgdGhpcy5nZXRSZWxhdGlvbnModDMpKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0aW9uc1t0eXBlXSAhPT0gXCJ1bmRlZmluZWRcIikgcmVzID0gdGhpcy5yZWxhdGlvbnNbXG4gICAgICB0eXBlXTtcbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgZ2V0UmVsYXRpb25zQnlBcHBOYW1lKGFwcE5hbWUpIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMuYXBwc1thcHBOYW1lXS5fYXR0cmlidXRlX25hbWVzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgYXBwUmVsYXRpb24gPSB0aGlzLmFwcHNbYXBwTmFtZV1bdGhpcy5hcHBzW2FwcE5hbWVdLl9hdHRyaWJ1dGVfbmFtZXNbXG4gICAgICAgIGluZGV4XV07XG4gICAgICByZXMucHVzaChhcHBSZWxhdGlvbik7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cblxuICBnZXRSZWxhdGlvbnNCeUFwcChhcHApIHtcbiAgICBsZXQgYXBwTmFtZSA9IGFwcC5uYW1lLmdldCgpXG4gICAgcmV0dXJuIHRoaXMuZ2V0UmVsYXRpb25zQnlBcHBOYW1lKGFwcE5hbWUpXG4gIH1cblxuICBnZXRSZWxhdGlvbnNCeUFwcE5hbWVCeVR5cGUoYXBwTmFtZSwgdHlwZSkge1xuICAgIGxldCByZXMgPSBuZXcgTHN0KCk7XG5cbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5hcHBzW2FwcE5hbWVdLl9hdHRyaWJ1dGVfbmFtZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCBhcHBSZWxhdGlvbiA9IHRoaXMuYXBwc1thcHBOYW1lXVt0aGlzLmFwcHNbYXBwTmFtZV0uX2F0dHJpYnV0ZV9uYW1lc1tcbiAgICAgICAgaW5kZXhdXTtcbiAgICAgIGlmIChhcHBSZWxhdGlvbi50eXBlLmdldCgpID09PSB0eXBlKSByZXMucHVzaChhcHBSZWxhdGlvbik7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cblxuICBnZXRSZWxhdGlvbnNCeUFwcEJ5VHlwZShhcHAsIHJlbGF0aW9uVHlwZSkge1xuICAgIGxldCBhcHBOYW1lID0gYXBwLm5hbWUuZ2V0KClcbiAgICBpZiAodGhpcy5oYXNSZWxhdGlvbkJ5QXBwQnlUeXBlRGVmaW5lZChhcHBOYW1lLCByZWxhdGlvblR5cGUpKVxuICAgICAgcmV0dXJuIHRoaXMuZ2V0UmVsYXRpb25zQnlBcHBOYW1lQnlUeXBlKGFwcE5hbWUsIHJlbGF0aW9uVHlwZSlcbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICB9XG4gIH1cblxuICBpbk5vZGVMaXN0KF9ub2RlbGlzdCkge1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBfbm9kZWxpc3QubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gX25vZGVsaXN0W2luZGV4XTtcbiAgICAgIGlmIChlbGVtZW50LmlkLmdldCgpID09PSB0aGlzLmlkLmdldCgpKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy9UT0RPIGdldENoaWxkcmVuLCBnZXRQYXJlbnRcblxuICBnZXROZWlnaGJvcnMoX3R5cGUpIHtcbiAgICBsZXQgbmVpZ2hib3JzID0gW107XG4gICAgbGV0IHJlbGF0aW9ucyA9IHRoaXMuZ2V0UmVsYXRpb25zKF90eXBlKTtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcmVsYXRpb25zLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgcmVsYXRpb24gPSByZWxhdGlvbnNbaW5kZXhdO1xuICAgICAgaWYgKHJlbGF0aW9uLmlzRGlyZWN0ZWQuZ2V0KCkpIHtcbiAgICAgICAgaWYgKHRoaXMuaW5Ob2RlTGlzdChyZWxhdGlvbi5ub2RlTGlzdDEpKVxuICAgICAgICAgIG5laWdoYm9ycyA9IFV0aWxpdGllcy5jb25jYXQobmVpZ2hib3JzLCByZWxhdGlvbi5ub2RlTGlzdDIpO1xuICAgICAgICBlbHNlIG5laWdoYm9ycyA9IFV0aWxpdGllcy5jb25jYXQobmVpZ2hib3JzLCByZWxhdGlvbi5ub2RlTGlzdDEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmVpZ2hib3JzID0gVXRpbGl0aWVzLmNvbmNhdChcbiAgICAgICAgICBuZWlnaGJvcnMsXG4gICAgICAgICAgVXRpbGl0aWVzLmFsbEJ1dE1lQnlJZChyZWxhdGlvbi5ub2RlTGlzdDEpXG4gICAgICAgICk7XG4gICAgICAgIG5laWdoYm9ycyA9IFV0aWxpdGllcy5jb25jYXQoXG4gICAgICAgICAgbmVpZ2hib3JzLFxuICAgICAgICAgIFV0aWxpdGllcy5hbGxCdXRNZUJ5SWQocmVsYXRpb24ubm9kZUxpc3QyKVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmVpZ2hib3JzO1xuICB9XG5cbiAgcmVtb3ZlUmVsYXRpb24oX3JlbGF0aW9uKSB7XG4gICAgbGV0IHJlbGF0aW9uTHN0ID0gdGhpcy5yZWxhdGlvbnNbX3JlbGF0aW9uLnR5cGUuZ2V0KCldO1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCByZWxhdGlvbkxzdC5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IGNhbmRpZGF0ZVJlbGF0aW9uID0gcmVsYXRpb25Mc3RbaW5kZXhdO1xuICAgICAgaWYgKF9yZWxhdGlvbi5pZC5nZXQoKSA9PT0gY2FuZGlkYXRlUmVsYXRpb24uaWQuZ2V0KCkpXG4gICAgICAgIHJlbGF0aW9uTHN0LnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICB9XG5cbiAgcmVtb3ZlUmVsYXRpb25zKF9yZWxhdGlvbnMpIHtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX3JlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHRoaXMucmVtb3ZlUmVsYXRpb24oX3JlbGF0aW9uc1tpbmRleF0pO1xuICAgIH1cbiAgfVxuXG4gIHJlbW92ZVJlbGF0aW9uVHlwZShfdHlwZSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KF90eXBlKSB8fCBfdHlwZSBpbnN0YW5jZW9mIExzdClcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBfdHlwZS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgdHlwZSA9IF90eXBlW2luZGV4XTtcbiAgICAgICAgdGhpcy5yZWxhdGlvbnMucmVtX2F0dHIodHlwZSk7XG4gICAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLnJlbGF0aW9ucy5yZW1fYXR0cihfdHlwZSk7XG4gICAgfVxuICB9XG5cbiAgaGFzQXBwRGVmaW5lZChhcHBOYW1lKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLmFwcHNbYXBwTmFtZV0gIT09IFwidW5kZWZpbmVkXCIpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKFwiYXBwIFwiICsgYXBwTmFtZSArXG4gICAgICAgIFwiIGlzIG5vdCBkZWZpbmVkIGZvciBub2RlIFwiICsgdGhpcy5nZXQoKSk7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cblxuICBoYXNSZWxhdGlvbkJ5QXBwQnlUeXBlRGVmaW5lZChhcHBOYW1lLCByZWxhdGlvblR5cGUpIHtcbiAgICBpZiAodGhpcy5oYXNBcHBEZWZpbmVkKGFwcE5hbWUpICYmIHR5cGVvZiB0aGlzLmFwcHNbYXBwTmFtZV1bXG4gICAgICAgIHJlbGF0aW9uVHlwZVxuICAgICAgXSAhPT1cbiAgICAgIFwidW5kZWZpbmVkXCIpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKFwicmVsYXRpb24gXCIgKyByZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyBub3QgZGVmaW5lZCBmb3Igbm9kZSBcIiArIHRoaXMubmFtZS5nZXQoKSArXG4gICAgICAgIFwiIGZvciBhcHBsaWNhdGlvbiBcIiArIGFwcE5hbWUpO1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG5cbiAgdG9Kc29uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpZDogdGhpcy5pZC5nZXQoKSxcbiAgICAgIG5hbWU6IHRoaXMubmFtZS5nZXQoKSxcbiAgICAgIGVsZW1lbnQ6IG51bGxcbiAgICB9O1xuICB9XG5cbiAgdG9Kc29uV2l0aFJlbGF0aW9ucygpIHtcbiAgICBsZXQgcmVsYXRpb25zID0gW107XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMuZ2V0UmVsYXRpb25zKCkubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCByZWxhdGlvbiA9IHRoaXMuZ2V0UmVsYXRpb25zKClbaW5kZXhdO1xuICAgICAgcmVsYXRpb25zLnB1c2gocmVsYXRpb24udG9Kc29uKCkpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IHRoaXMuaWQuZ2V0KCksXG4gICAgICBuYW1lOiB0aGlzLm5hbWUuZ2V0KCksXG4gICAgICBlbGVtZW50OiBudWxsLFxuICAgICAgcmVsYXRpb25zOiByZWxhdGlvbnNcbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgdG9JZmMoKSB7XG4gICAgbGV0IGVsZW1lbnQgPSBhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQodGhpcy5lbGVtZW50KTtcbiAgICByZXR1cm4gZWxlbWVudC50b0lmYygpO1xuICB9XG59XG5cbnNwaW5hbENvcmUucmVnaXN0ZXJfbW9kZWxzKFtTcGluYWxOb2RlXSk7Il19