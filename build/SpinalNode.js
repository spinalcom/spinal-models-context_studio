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

  getRelationsByAppByType(app, type) {
    let appName = app.name.get();
    return this.getRelationsByAppNameByType(appName, type);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TcGluYWxOb2RlLmpzIl0sIm5hbWVzIjpbInNwaW5hbENvcmUiLCJyZXF1aXJlIiwiZ2xvYmFsVHlwZSIsIndpbmRvdyIsImdsb2JhbCIsImdldFZpZXdlciIsInYiLCJTcGluYWxOb2RlIiwiTW9kZWwiLCJjb25zdHJ1Y3RvciIsIl9uYW1lIiwiX2VsZW1lbnQiLCJfZ3JhcGgiLCJfcmVsYXRpb25zIiwibmFtZSIsIkZpbGVTeXN0ZW0iLCJfc2lnX3NlcnZlciIsImFkZF9hdHRyIiwiZWxlbWVudCIsIlB0ciIsInJlbGF0aW9ucyIsImFwcHMiLCJncmFwaCIsImNsYXNzaWZ5Tm9kZSIsIkFycmF5IiwiaXNBcnJheSIsIkxzdCIsImFkZFJlbGF0aW9ucyIsImFkZFJlbGF0aW9uIiwiZ2V0QXBwc05hbWVzIiwiX2F0dHJpYnV0ZV9uYW1lcyIsImdldEFwcHMiLCJyZXMiLCJpbmRleCIsImxlbmd0aCIsImFwcE5hbWUiLCJwdXNoIiwiYXBwc0xpc3QiLCJjaGFuZ2VEZWZhdWx0UmVsYXRpb24iLCJyZWxhdGlvblR5cGUiLCJyZWxhdGlvbiIsImFzUGFyZW50IiwiaXNEaXJlY3RlZCIsImdldCIsIlV0aWxpdGllcyIsInB1dE9uVG9wTHN0IiwiaGFzUmVsYXRpb24iLCJhZGREaXJlY3RlZFJlbGF0aW9uUGFyZW50IiwidHlwZSIsImNvbmNhdCIsImFkZFJlbGF0aW9uQnlBcHAiLCJhZGREaXJlY3RlZFJlbGF0aW9uQ2hpbGQiLCJhZGROb25EaXJlY3RlZFJlbGF0aW9uIiwiaXNSZXNlcnZlZCIsIm5hbWVUbXAiLCJsaXN0IiwiY29uc29sZSIsImxvZyIsInJlc2VydmVkUmVsYXRpb25zTmFtZXMiLCJoYXNSZXNlcnZhdGlvbkNyZWRlbnRpYWxzIiwiY29udGFpbnNBcHAiLCJlcnJvciIsImFkZFNpbXBsZVJlbGF0aW9uIiwibm9kZTIiLCJhZGROb2RlIiwicmVsIiwiU3BpbmFsUmVsYXRpb24iLCJhZGRTaW1wbGVSZWxhdGlvbkJ5QXBwIiwiYWRkVG9FeGlzdGluZ1JlbGF0aW9uIiwiZXhpc3RpbmdSZWxhdGlvbnMiLCJnZXRSZWxhdGlvbnMiLCJhZGROb2RldG9Ob2RlTGlzdDEiLCJhZGROb2RldG9Ob2RlTGlzdDIiLCJhZGRUb0V4aXN0aW5nUmVsYXRpb25CeUFwcCIsImFwcFJlbGF0aW9ucyIsImdldFJlbGF0aW9uc0J5QXBwTmFtZSIsImFkZFJlbGF0aW9uMiIsIl9yZWxhdGlvbiIsImNsYXNzaWZ5IiwiYXJyYXlzRXF1YWwiLCJnZXROb2RlTGlzdDFJZHMiLCJhZGROb3RFeGlzdGluZ1ZlcnRpY2VzdG9Ob2RlTGlzdDIiLCJub2RlTGlzdDIiLCJhZGROb3RFeGlzdGluZ1ZlcnRpY2VzdG9SZWxhdGlvbiIsIl9jbGFzc2lmeVJlbGF0aW9uIiwibG9hZCIsImkiLCJyZWxMaXN0IiwiaiIsImdldFJlbGF0aW9uc0J5VHlwZSIsImluY2x1ZGVzIiwidDEiLCJ0MiIsInQzIiwiYXBwUmVsYXRpb24iLCJnZXRSZWxhdGlvbnNCeUFwcCIsImFwcCIsImdldFJlbGF0aW9uc0J5QXBwTmFtZUJ5VHlwZSIsImdldFJlbGF0aW9uc0J5QXBwQnlUeXBlIiwiaW5Ob2RlTGlzdCIsIl9ub2RlbGlzdCIsImlkIiwiZ2V0TmVpZ2hib3JzIiwiX3R5cGUiLCJuZWlnaGJvcnMiLCJub2RlTGlzdDEiLCJhbGxCdXRNZUJ5SWQiLCJyZW1vdmVSZWxhdGlvbiIsInJlbGF0aW9uTHN0IiwiY2FuZGlkYXRlUmVsYXRpb24iLCJzcGxpY2UiLCJyZW1vdmVSZWxhdGlvbnMiLCJyZW1vdmVSZWxhdGlvblR5cGUiLCJyZW1fYXR0ciIsImhhc0FwcERlZmluZWQiLCJ3YXJuIiwiaGFzUmVsYXRpb25CeUFwcEJ5VHlwZURlZmluZWQiLCJ0b0pzb24iLCJ0b0pzb25XaXRoUmVsYXRpb25zIiwidG9JZmMiLCJwcm9taXNlTG9hZCIsInJlZ2lzdGVyX21vZGVscyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBRUE7Ozs7QUFLQTs7OztBQVBBLE1BQU1BLGFBQWFDLFFBQVEseUJBQVIsQ0FB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S0FBS0EsRUFBTCxDQUFRMUQsR0FBUixFQURDO0FBRUw3QixZQUFNLEtBQUtBLElBQUwsQ0FBVTZCLEdBQVYsRUFGRDtBQUdMekIsZUFBUyxJQUhKO0FBSUxFLGlCQUFXQTtBQUpOLEtBQVA7QUFNRDs7QUFFRCxRQUFNbUcsS0FBTixHQUFjO0FBQ1osUUFBSXJHLFVBQVUsTUFBTTBCLHFCQUFVNEUsV0FBVixDQUFzQixLQUFLdEcsT0FBM0IsQ0FBcEI7QUFDQSxXQUFPQSxRQUFRcUcsS0FBUixFQUFQO0FBQ0Q7QUFsZ0JzRDs7a0JBQXBDaEgsVTtBQXFnQnJCUCxXQUFXeUgsZUFBWCxDQUEyQixDQUFDbEgsVUFBRCxDQUEzQiIsImZpbGUiOiJTcGluYWxOb2RlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3Qgc3BpbmFsQ29yZSA9IHJlcXVpcmUoXCJzcGluYWwtY29yZS1jb25uZWN0b3Jqc1wiKTtcbmNvbnN0IGdsb2JhbFR5cGUgPSB0eXBlb2Ygd2luZG93ID09PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogd2luZG93O1xuaW1wb3J0IFNwaW5hbFJlbGF0aW9uIGZyb20gXCIuL1NwaW5hbFJlbGF0aW9uXCI7XG5sZXQgZ2V0Vmlld2VyID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBnbG9iYWxUeXBlLnY7XG59O1xuXG5pbXBvcnQge1xuICBVdGlsaXRpZXNcbn0gZnJvbSBcIi4vVXRpbGl0aWVzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNwaW5hbE5vZGUgZXh0ZW5kcyBnbG9iYWxUeXBlLk1vZGVsIHtcbiAgY29uc3RydWN0b3IoX25hbWUsIF9lbGVtZW50LCBfZ3JhcGgsIF9yZWxhdGlvbnMsIG5hbWUgPSBcIlNwaW5hbE5vZGVcIikge1xuICAgIHN1cGVyKCk7XG4gICAgaWYgKEZpbGVTeXN0ZW0uX3NpZ19zZXJ2ZXIpIHtcbiAgICAgIHRoaXMuYWRkX2F0dHIoe1xuICAgICAgICBuYW1lOiBfbmFtZSxcbiAgICAgICAgZWxlbWVudDogbmV3IFB0cihfZWxlbWVudCksXG4gICAgICAgIHJlbGF0aW9uczogbmV3IE1vZGVsKCksXG4gICAgICAgIGFwcHM6IG5ldyBNb2RlbCgpLFxuICAgICAgICBncmFwaDogX2dyYXBoXG4gICAgICB9KTtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5ncmFwaCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICB0aGlzLmdyYXBoLmNsYXNzaWZ5Tm9kZSh0aGlzKTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgX3JlbGF0aW9ucyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShfcmVsYXRpb25zKSB8fCBfcmVsYXRpb25zIGluc3RhbmNlb2YgTHN0KVxuICAgICAgICAgIHRoaXMuYWRkUmVsYXRpb25zKF9yZWxhdGlvbnMpO1xuICAgICAgICBlbHNlIHRoaXMuYWRkUmVsYXRpb24oX3JlbGF0aW9ucyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gcmVnaXN0ZXJBcHAoYXBwKSB7XG4gIC8vICAgdGhpcy5hcHBzLmFkZF9hdHRyKHtcbiAgLy8gICAgIFthcHAubmFtZS5nZXQoKV06IG5ldyBQdHIoYXBwKVxuICAvLyAgIH0pXG4gIC8vIH1cblxuICBnZXRBcHBzTmFtZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuYXBwcy5fYXR0cmlidXRlX25hbWVzO1xuICB9XG5cbiAgZ2V0QXBwcygpIHtcbiAgICBsZXQgcmVzID0gW11cbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5hcHBzLl9hdHRyaWJ1dGVfbmFtZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCBhcHBOYW1lID0gdGhpcy5hcHBzLl9hdHRyaWJ1dGVfbmFtZXNbaW5kZXhdO1xuICAgICAgcmVzLnB1c2godGhpcy5ncmFwaC5hcHBzTGlzdFthcHBOYW1lXSlcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG4gIGNoYW5nZURlZmF1bHRSZWxhdGlvbihyZWxhdGlvblR5cGUsIHJlbGF0aW9uLCBhc1BhcmVudCkge1xuICAgIGlmIChyZWxhdGlvbi5pc0RpcmVjdGVkLmdldCgpKSB7XG4gICAgICBpZiAoYXNQYXJlbnQpIHtcbiAgICAgICAgVXRpbGl0aWVzLnB1dE9uVG9wTHN0KHRoaXMucmVsYXRpb25zW3JlbGF0aW9uVHlwZSArIFwiPFwiXSwgcmVsYXRpb24pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgVXRpbGl0aWVzLnB1dE9uVG9wTHN0KHRoaXMucmVsYXRpb25zW3JlbGF0aW9uVHlwZSArIFwiPlwiXSwgcmVsYXRpb24pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBVdGlsaXRpZXMucHV0T25Ub3BMc3QodGhpcy5yZWxhdGlvbnNbcmVsYXRpb25UeXBlICsgXCItXCJdLCByZWxhdGlvbik7XG4gICAgfVxuICB9XG5cbiAgaGFzUmVsYXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucmVsYXRpb25zLmxlbmd0aCAhPT0gMDtcbiAgfVxuXG4gIGFkZERpcmVjdGVkUmVsYXRpb25QYXJlbnQocmVsYXRpb24sIGFwcE5hbWUpIHtcbiAgICBsZXQgbmFtZSA9IHJlbGF0aW9uLnR5cGUuZ2V0KCk7XG4gICAgbmFtZSA9IG5hbWUuY29uY2F0KFwiPFwiKTtcbiAgICBpZiAodHlwZW9mIGFwcE5hbWUgPT09IFwidW5kZWZpbmVkXCIpIHRoaXMuYWRkUmVsYXRpb24ocmVsYXRpb24sIG5hbWUpO1xuICAgIGVsc2UgdGhpcy5hZGRSZWxhdGlvbkJ5QXBwKHJlbGF0aW9uLCBuYW1lLCBhcHBOYW1lKTtcbiAgfVxuXG4gIGFkZERpcmVjdGVkUmVsYXRpb25DaGlsZChyZWxhdGlvbiwgYXBwTmFtZSkge1xuICAgIGxldCBuYW1lID0gcmVsYXRpb24udHlwZS5nZXQoKTtcbiAgICBuYW1lID0gbmFtZS5jb25jYXQoXCI+XCIpO1xuICAgIGlmICh0eXBlb2YgYXBwTmFtZSA9PT0gXCJ1bmRlZmluZWRcIikgdGhpcy5hZGRSZWxhdGlvbihyZWxhdGlvbiwgbmFtZSk7XG4gICAgZWxzZSB0aGlzLmFkZFJlbGF0aW9uQnlBcHAocmVsYXRpb24sIG5hbWUsIGFwcE5hbWUpO1xuICB9XG5cbiAgYWRkTm9uRGlyZWN0ZWRSZWxhdGlvbihyZWxhdGlvbiwgYXBwTmFtZSkge1xuICAgIGxldCBuYW1lID0gcmVsYXRpb24udHlwZS5nZXQoKTtcbiAgICBuYW1lID0gbmFtZS5jb25jYXQoXCItXCIpO1xuICAgIGlmICh0eXBlb2YgYXBwTmFtZSA9PT0gXCJ1bmRlZmluZWRcIikgdGhpcy5hZGRSZWxhdGlvbihyZWxhdGlvbiwgbmFtZSk7XG4gICAgZWxzZSB0aGlzLmFkZFJlbGF0aW9uQnlBcHAocmVsYXRpb24sIG5hbWUsIGFwcE5hbWUpO1xuICB9XG5cbiAgYWRkUmVsYXRpb24ocmVsYXRpb24sIG5hbWUpIHtcbiAgICBpZiAoIXRoaXMuZ3JhcGguaXNSZXNlcnZlZChyZWxhdGlvbi50eXBlLmdldCgpKSkge1xuICAgICAgbGV0IG5hbWVUbXAgPSByZWxhdGlvbi50eXBlLmdldCgpO1xuICAgICAgaWYgKHR5cGVvZiBuYW1lICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIG5hbWVUbXAgPSBuYW1lO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0aW9uc1tuYW1lVG1wXSAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgICAgdGhpcy5yZWxhdGlvbnNbbmFtZVRtcF0ucHVzaChyZWxhdGlvbik7XG4gICAgICBlbHNlIHtcbiAgICAgICAgbGV0IGxpc3QgPSBuZXcgTHN0KCk7XG4gICAgICAgIGxpc3QucHVzaChyZWxhdGlvbik7XG4gICAgICAgIHRoaXMucmVsYXRpb25zLmFkZF9hdHRyKHtcbiAgICAgICAgICBbbmFtZVRtcF06IGxpc3RcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICByZWxhdGlvbi50eXBlLmdldCgpICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLmdyYXBoLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb24udHlwZS5nZXQoKV1cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgYWRkUmVsYXRpb25CeUFwcChyZWxhdGlvbiwgbmFtZSwgYXBwTmFtZSkge1xuICAgIGlmICh0aGlzLmdyYXBoLmhhc1Jlc2VydmF0aW9uQ3JlZGVudGlhbHMocmVsYXRpb24udHlwZS5nZXQoKSwgYXBwTmFtZSkpIHtcbiAgICAgIGlmICh0aGlzLmdyYXBoLmNvbnRhaW5zQXBwKGFwcE5hbWUpKSB7XG4gICAgICAgIGxldCBuYW1lVG1wID0gcmVsYXRpb24udHlwZS5nZXQoKTtcbiAgICAgICAgaWYgKHR5cGVvZiBuYW1lICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgbmFtZVRtcCA9IG5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0aW9uc1tuYW1lVG1wXSAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgICAgICB0aGlzLnJlbGF0aW9uc1tuYW1lVG1wXS5wdXNoKHJlbGF0aW9uKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgbGV0IGxpc3QgPSBuZXcgTHN0KCk7XG4gICAgICAgICAgbGlzdC5wdXNoKHJlbGF0aW9uKTtcbiAgICAgICAgICB0aGlzLnJlbGF0aW9ucy5hZGRfYXR0cih7XG4gICAgICAgICAgICBbbmFtZVRtcF06IGxpc3RcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHRoaXMuYXBwc1thcHBOYW1lXSAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgICAgICB0aGlzLmFwcHNbYXBwTmFtZV0uYWRkX2F0dHIoe1xuICAgICAgICAgICAgW3JlbGF0aW9uLnR5cGUuZ2V0KCldOiByZWxhdGlvblxuICAgICAgICAgIH0pO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBsZXQgbGlzdCA9IG5ldyBNb2RlbCgpO1xuICAgICAgICAgIGxpc3QuYWRkX2F0dHIoe1xuICAgICAgICAgICAgW3JlbGF0aW9uLnR5cGUuZ2V0KCldOiByZWxhdGlvblxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMuYXBwcy5hZGRfYXR0cih7XG4gICAgICAgICAgICBbYXBwTmFtZV06IGxpc3RcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihhcHBOYW1lICsgXCIgZG9lcyBub3QgZXhpc3RcIik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICByZWxhdGlvbi50eXBlLmdldCgpICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLmdyYXBoLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb24udHlwZS5nZXQoKV1cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgYWRkU2ltcGxlUmVsYXRpb24ocmVsYXRpb25UeXBlLCBlbGVtZW50LCBpc0RpcmVjdGVkID0gZmFsc2UpIHtcbiAgICBpZiAoIXRoaXMuZ3JhcGguaXNSZXNlcnZlZChyZWxhdGlvblR5cGUpKSB7XG4gICAgICBsZXQgbm9kZTIgPSB0aGlzLmdyYXBoLmFkZE5vZGUoZWxlbWVudCk7XG4gICAgICBsZXQgcmVsID0gbmV3IFNwaW5hbFJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgW3RoaXNdLCBbbm9kZTJdLFxuICAgICAgICBpc0RpcmVjdGVkKTtcbiAgICAgIHRoaXMuZ3JhcGguYWRkUmVsYXRpb24ocmVsKTtcbiAgICAgIHJldHVybiByZWw7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICByZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMuZ3JhcGgucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvblR5cGVdXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGFkZFNpbXBsZVJlbGF0aW9uQnlBcHAoYXBwTmFtZSwgcmVsYXRpb25UeXBlLCBlbGVtZW50LCBpc0RpcmVjdGVkID0gZmFsc2UpIHtcbiAgICBpZiAodGhpcy5ncmFwaC5oYXNSZXNlcnZhdGlvbkNyZWRlbnRpYWxzKHJlbGF0aW9uVHlwZSwgYXBwTmFtZSkpIHtcbiAgICAgIGlmICh0aGlzLmdyYXBoLmNvbnRhaW5zQXBwKGFwcE5hbWUpKSB7XG4gICAgICAgIGxldCBub2RlMiA9IHRoaXMuZ3JhcGguYWRkTm9kZShlbGVtZW50KTtcbiAgICAgICAgbGV0IHJlbCA9IG5ldyBTcGluYWxSZWxhdGlvbihyZWxhdGlvblR5cGUsIFt0aGlzXSwgW25vZGUyXSxcbiAgICAgICAgICBpc0RpcmVjdGVkKTtcbiAgICAgICAgdGhpcy5ncmFwaC5hZGRSZWxhdGlvbihyZWwsIGFwcE5hbWUpO1xuICAgICAgICByZXR1cm4gcmVsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihhcHBOYW1lICsgXCIgZG9lcyBub3QgZXhpc3RcIik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICByZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMuZ3JhcGgucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvblR5cGVdXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGFkZFRvRXhpc3RpbmdSZWxhdGlvbihcbiAgICByZWxhdGlvblR5cGUsXG4gICAgZWxlbWVudCxcbiAgICBpc0RpcmVjdGVkID0gZmFsc2UsXG4gICAgYXNQYXJlbnQgPSBmYWxzZVxuICApIHtcbiAgICBpZiAoIXRoaXMuZ3JhcGguaXNSZXNlcnZlZChyZWxhdGlvblR5cGUpKSB7XG4gICAgICBsZXQgbm9kZTIgPSB0aGlzLmdyYXBoLmFkZE5vZGUoZWxlbWVudCk7XG4gICAgICBsZXQgZXhpc3RpbmdSZWxhdGlvbnMgPSB0aGlzLmdldFJlbGF0aW9ucygpO1xuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGV4aXN0aW5nUmVsYXRpb25zLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCByZWxhdGlvbiA9IGV4aXN0aW5nUmVsYXRpb25zW2luZGV4XTtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIHJlbGF0aW9uVHlwZSA9PT0gcmVsYXRpb25UeXBlICYmXG4gICAgICAgICAgaXNEaXJlY3RlZCA9PT0gcmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKVxuICAgICAgICApIHtcbiAgICAgICAgICBpZiAoaXNEaXJlY3RlZCkge1xuICAgICAgICAgICAgaWYgKGFzUGFyZW50KSB7XG4gICAgICAgICAgICAgIHJlbGF0aW9uLmFkZE5vZGV0b05vZGVMaXN0MShub2RlMik7XG4gICAgICAgICAgICAgIG5vZGUyLmFkZERpcmVjdGVkUmVsYXRpb25QYXJlbnQocmVsYXRpb24pO1xuICAgICAgICAgICAgICByZXR1cm4gcmVsYXRpb247XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZWxhdGlvbi5hZGROb2RldG9Ob2RlTGlzdDIobm9kZTIpO1xuICAgICAgICAgICAgICBub2RlMi5hZGREaXJlY3RlZFJlbGF0aW9uQ2hpbGQocmVsYXRpb24pO1xuICAgICAgICAgICAgICByZXR1cm4gcmVsYXRpb247XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlbGF0aW9uLmFkZE5vZGV0b05vZGVMaXN0Mihub2RlMik7XG4gICAgICAgICAgICBub2RlMi5hZGROb25EaXJlY3RlZFJlbGF0aW9uKHJlbGF0aW9uKTtcbiAgICAgICAgICAgIHJldHVybiByZWxhdGlvbjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGxldCByZWwgPSB0aGlzLmFkZFNpbXBsZVJlbGF0aW9uKHJlbGF0aW9uVHlwZSwgZWxlbWVudCwgaXNEaXJlY3RlZCk7XG4gICAgICByZXR1cm4gcmVsO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLmdyYXBoLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBhZGRUb0V4aXN0aW5nUmVsYXRpb25CeUFwcChcbiAgICBhcHBOYW1lLFxuICAgIHJlbGF0aW9uVHlwZSxcbiAgICBlbGVtZW50LFxuICAgIGlzRGlyZWN0ZWQgPSBmYWxzZSxcbiAgICBhc1BhcmVudCA9IGZhbHNlXG4gICkge1xuICAgIGlmICh0aGlzLmdyYXBoLmhhc1Jlc2VydmF0aW9uQ3JlZGVudGlhbHMocmVsYXRpb25UeXBlLCBhcHBOYW1lKSkge1xuICAgICAgaWYgKHRoaXMuZ3JhcGguY29udGFpbnNBcHAoYXBwTmFtZSkpIHtcbiAgICAgICAgbGV0IG5vZGUyID0gdGhpcy5ncmFwaC5hZGROb2RlKGVsZW1lbnQpO1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMuYXBwc1thcHBOYW1lXSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgIGxldCBhcHBSZWxhdGlvbnMgPSB0aGlzLmdldFJlbGF0aW9uc0J5QXBwTmFtZShhcHBOYW1lKTtcbiAgICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgYXBwUmVsYXRpb25zLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgY29uc3QgcmVsYXRpb24gPSBhcHBSZWxhdGlvbnNbaW5kZXhdO1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICByZWxhdGlvbi50eXBlLmdldCgpID09PSByZWxhdGlvblR5cGUgJiZcbiAgICAgICAgICAgICAgaXNEaXJlY3RlZCA9PT0gcmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgIGlmIChpc0RpcmVjdGVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFzUGFyZW50KSB7XG4gICAgICAgICAgICAgICAgICByZWxhdGlvbi5hZGROb2RldG9Ob2RlTGlzdDEobm9kZTIpO1xuICAgICAgICAgICAgICAgICAgbm9kZTIuYWRkRGlyZWN0ZWRSZWxhdGlvblBhcmVudChyZWxhdGlvbiwgYXBwTmFtZSk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcmVsYXRpb247XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHJlbGF0aW9uLmFkZE5vZGV0b05vZGVMaXN0Mihub2RlMik7XG4gICAgICAgICAgICAgICAgICBub2RlMi5hZGREaXJlY3RlZFJlbGF0aW9uQ2hpbGQocmVsYXRpb24sIGFwcE5hbWUpO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlbGF0aW9uO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZWxhdGlvbi5hZGROb2RldG9Ob2RlTGlzdDIobm9kZTIpO1xuICAgICAgICAgICAgICAgIG5vZGUyLmFkZE5vbkRpcmVjdGVkUmVsYXRpb24ocmVsYXRpb24sIGFwcE5hbWUpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZWxhdGlvbjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsZXQgcmVsID0gdGhpcy5hZGRTaW1wbGVSZWxhdGlvbkJ5QXBwKFxuICAgICAgICAgIGFwcE5hbWUsXG4gICAgICAgICAgcmVsYXRpb25UeXBlLFxuICAgICAgICAgIGVsZW1lbnQsXG4gICAgICAgICAgaXNEaXJlY3RlZFxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gcmVsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihhcHBOYW1lICsgXCIgZG9lcyBub3QgZXhpc3RcIik7XG4gICAgICB9XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLmdyYXBoLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuXG5cblxuICBhZGRSZWxhdGlvbjIoX3JlbGF0aW9uLCBfbmFtZSkge1xuICAgIGxldCBjbGFzc2lmeSA9IGZhbHNlO1xuICAgIGxldCBuYW1lID0gX3JlbGF0aW9uLnR5cGUuZ2V0KCk7XG4gICAgaWYgKHR5cGVvZiBfbmFtZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgbmFtZSA9IF9uYW1lO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHRoaXMucmVsYXRpb25zW19yZWxhdGlvbi50eXBlLmdldCgpXSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgaWYgKF9yZWxhdGlvbi5pc0RpcmVjdGVkLmdldCgpKSB7XG4gICAgICAgIGZvciAoXG4gICAgICAgICAgbGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLnJlbGF0aW9uc1tfcmVsYXRpb24udHlwZS5nZXQoKV0ubGVuZ3RoOyBpbmRleCsrXG4gICAgICAgICkge1xuICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLnJlbGF0aW9uc1tfcmVsYXRpb24udHlwZS5nZXQoKV1baW5kZXhdO1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIFV0aWxpdGllcy5hcnJheXNFcXVhbChcbiAgICAgICAgICAgICAgX3JlbGF0aW9uLmdldE5vZGVMaXN0MUlkcygpLFxuICAgICAgICAgICAgICBlbGVtZW50LmdldE5vZGVMaXN0MUlkcygpXG4gICAgICAgICAgICApXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBlbGVtZW50LmFkZE5vdEV4aXN0aW5nVmVydGljZXN0b05vZGVMaXN0MihfcmVsYXRpb24ubm9kZUxpc3QyKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWxlbWVudC5wdXNoKF9yZWxhdGlvbik7XG4gICAgICAgICAgICBjbGFzc2lmeSA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJlbGF0aW9uc1tfcmVsYXRpb24udHlwZS5nZXQoKV0uYWRkTm90RXhpc3RpbmdWZXJ0aWNlc3RvUmVsYXRpb24oXG4gICAgICAgICAgX3JlbGF0aW9uXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChfcmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKSkge1xuICAgICAgICBsZXQgbGlzdCA9IG5ldyBMc3QoKTtcbiAgICAgICAgbGlzdC5wdXNoKF9yZWxhdGlvbik7XG4gICAgICAgIHRoaXMucmVsYXRpb25zLmFkZF9hdHRyKHtcbiAgICAgICAgICBbbmFtZV06IGxpc3RcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX2NsYXNzaWZ5UmVsYXRpb24oX3JlbGF0aW9uKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucmVsYXRpb25zLmFkZF9hdHRyKHtcbiAgICAgICAgICBbbmFtZV06IF9yZWxhdGlvblxuICAgICAgICB9KTtcbiAgICAgICAgY2xhc3NpZnkgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoY2xhc3NpZnkpIHRoaXMuX2NsYXNzaWZ5UmVsYXRpb24oX3JlbGF0aW9uKTtcbiAgfVxuXG4gIF9jbGFzc2lmeVJlbGF0aW9uKF9yZWxhdGlvbikge1xuICAgIHRoaXMuZ3JhcGgubG9hZChncmFwaCA9PiB7XG4gICAgICBncmFwaC5fY2xhc3NpZnlSZWxhdGlvbihfcmVsYXRpb24pO1xuICAgIH0pO1xuICB9XG5cbiAgLy9UT0RPIDpOb3RXb3JraW5nXG4gIC8vIGFkZFJlbGF0aW9uKF9yZWxhdGlvbikge1xuICAvLyAgIHRoaXMuYWRkUmVsYXRpb24oX3JlbGF0aW9uKVxuICAvLyAgIHRoaXMuZ3JhcGgubG9hZChncmFwaCA9PiB7XG4gIC8vICAgICBncmFwaC5fYWRkTm90RXhpc3RpbmdWZXJ0aWNlc0Zyb21SZWxhdGlvbihfcmVsYXRpb24pXG4gIC8vICAgfSlcbiAgLy8gfVxuICAvL1RPRE8gOk5vdFdvcmtpbmdcbiAgLy8gYWRkUmVsYXRpb25zKF9yZWxhdGlvbnMpIHtcbiAgLy8gICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX3JlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgLy8gICAgIHRoaXMuYWRkUmVsYXRpb24oX3JlbGF0aW9uc1tpbmRleF0pO1xuICAvLyAgIH1cbiAgLy8gfVxuXG4gIGdldFJlbGF0aW9ucygpIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnJlbGF0aW9ucy5fYXR0cmlidXRlX25hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCByZWxMaXN0ID0gdGhpcy5yZWxhdGlvbnNbdGhpcy5yZWxhdGlvbnMuX2F0dHJpYnV0ZV9uYW1lc1tpXV07XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHJlbExpc3QubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgY29uc3QgcmVsYXRpb24gPSByZWxMaXN0W2pdO1xuICAgICAgICByZXMucHVzaChyZWxhdGlvbik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cblxuICBnZXRSZWxhdGlvbnNCeVR5cGUodHlwZSkge1xuICAgIGxldCByZXMgPSBbXTtcbiAgICBpZiAoIXR5cGUuaW5jbHVkZXMoXCI+XCIsIHR5cGUubGVuZ3RoIC0gMikgJiZcbiAgICAgICF0eXBlLmluY2x1ZGVzKFwiPFwiLCB0eXBlLmxlbmd0aCAtIDIpICYmXG4gICAgICAhdHlwZS5pbmNsdWRlcyhcIi1cIiwgdHlwZS5sZW5ndGggLSAyKVxuICAgICkge1xuICAgICAgbGV0IHQxID0gdHlwZS5jb25jYXQoXCI+XCIpO1xuICAgICAgcmVzID0gVXRpbGl0aWVzLmNvbmNhdChyZXMsIHRoaXMuZ2V0UmVsYXRpb25zKHQxKSk7XG4gICAgICBsZXQgdDIgPSB0eXBlLmNvbmNhdChcIjxcIik7XG4gICAgICByZXMgPSBVdGlsaXRpZXMuY29uY2F0KHJlcywgdGhpcy5nZXRSZWxhdGlvbnModDIpKTtcbiAgICAgIGxldCB0MyA9IHR5cGUuY29uY2F0KFwiLVwiKTtcbiAgICAgIHJlcyA9IFV0aWxpdGllcy5jb25jYXQocmVzLCB0aGlzLmdldFJlbGF0aW9ucyh0MykpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHRoaXMucmVsYXRpb25zW3R5cGVdICE9PSBcInVuZGVmaW5lZFwiKSByZXMgPSB0aGlzLnJlbGF0aW9uc1tcbiAgICAgIHR5cGVdO1xuICAgIHJldHVybiByZXM7XG4gIH1cblxuICBnZXRSZWxhdGlvbnNCeUFwcE5hbWUoYXBwTmFtZSkge1xuICAgIGxldCByZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5hcHBzW2FwcE5hbWVdLl9hdHRyaWJ1dGVfbmFtZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCBhcHBSZWxhdGlvbiA9IHRoaXMuYXBwc1thcHBOYW1lXVt0aGlzLmFwcHNbYXBwTmFtZV0uX2F0dHJpYnV0ZV9uYW1lc1tcbiAgICAgICAgaW5kZXhdXTtcbiAgICAgIHJlcy5wdXNoKGFwcFJlbGF0aW9uKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG4gIGdldFJlbGF0aW9uc0J5QXBwKGFwcCkge1xuICAgIGxldCBhcHBOYW1lID0gYXBwLm5hbWUuZ2V0KClcbiAgICByZXR1cm4gdGhpcy5nZXRSZWxhdGlvbnNCeUFwcE5hbWUoYXBwTmFtZSlcbiAgfVxuXG4gIGdldFJlbGF0aW9uc0J5QXBwTmFtZUJ5VHlwZShhcHBOYW1lLCB0eXBlKSB7XG4gICAgbGV0IHJlcyA9IG5ldyBMc3QoKTtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5hcHBzW2FwcE5hbWVdLl9hdHRyaWJ1dGVfbmFtZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCBhcHBSZWxhdGlvbiA9IHRoaXMuYXBwc1thcHBOYW1lXVt0aGlzLmFwcHNbYXBwTmFtZV0uX2F0dHJpYnV0ZV9uYW1lc1tcbiAgICAgICAgaW5kZXhdXTtcbiAgICAgIGlmIChhcHBSZWxhdGlvbi50eXBlLmdldCgpID09PSB0eXBlKSByZXMucHVzaChhcHBSZWxhdGlvbik7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cblxuICBnZXRSZWxhdGlvbnNCeUFwcEJ5VHlwZShhcHAsIHR5cGUpIHtcbiAgICBsZXQgYXBwTmFtZSA9IGFwcC5uYW1lLmdldCgpXG4gICAgcmV0dXJuIHRoaXMuZ2V0UmVsYXRpb25zQnlBcHBOYW1lQnlUeXBlKGFwcE5hbWUsIHR5cGUpXG4gIH1cblxuICBpbk5vZGVMaXN0KF9ub2RlbGlzdCkge1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBfbm9kZWxpc3QubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gX25vZGVsaXN0W2luZGV4XTtcbiAgICAgIGlmIChlbGVtZW50LmlkLmdldCgpID09PSB0aGlzLmlkLmdldCgpKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy9UT0RPIGdldENoaWxkcmVuLCBnZXRQYXJlbnRcblxuICBnZXROZWlnaGJvcnMoX3R5cGUpIHtcbiAgICBsZXQgbmVpZ2hib3JzID0gW107XG4gICAgbGV0IHJlbGF0aW9ucyA9IHRoaXMuZ2V0UmVsYXRpb25zKF90eXBlKTtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcmVsYXRpb25zLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgcmVsYXRpb24gPSByZWxhdGlvbnNbaW5kZXhdO1xuICAgICAgaWYgKHJlbGF0aW9uLmlzRGlyZWN0ZWQuZ2V0KCkpIHtcbiAgICAgICAgaWYgKHRoaXMuaW5Ob2RlTGlzdChyZWxhdGlvbi5ub2RlTGlzdDEpKVxuICAgICAgICAgIG5laWdoYm9ycyA9IFV0aWxpdGllcy5jb25jYXQobmVpZ2hib3JzLCByZWxhdGlvbi5ub2RlTGlzdDIpO1xuICAgICAgICBlbHNlIG5laWdoYm9ycyA9IFV0aWxpdGllcy5jb25jYXQobmVpZ2hib3JzLCByZWxhdGlvbi5ub2RlTGlzdDEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmVpZ2hib3JzID0gVXRpbGl0aWVzLmNvbmNhdChcbiAgICAgICAgICBuZWlnaGJvcnMsXG4gICAgICAgICAgVXRpbGl0aWVzLmFsbEJ1dE1lQnlJZChyZWxhdGlvbi5ub2RlTGlzdDEpXG4gICAgICAgICk7XG4gICAgICAgIG5laWdoYm9ycyA9IFV0aWxpdGllcy5jb25jYXQoXG4gICAgICAgICAgbmVpZ2hib3JzLFxuICAgICAgICAgIFV0aWxpdGllcy5hbGxCdXRNZUJ5SWQocmVsYXRpb24ubm9kZUxpc3QyKVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmVpZ2hib3JzO1xuICB9XG5cbiAgcmVtb3ZlUmVsYXRpb24oX3JlbGF0aW9uKSB7XG4gICAgbGV0IHJlbGF0aW9uTHN0ID0gdGhpcy5yZWxhdGlvbnNbX3JlbGF0aW9uLnR5cGUuZ2V0KCldO1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCByZWxhdGlvbkxzdC5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IGNhbmRpZGF0ZVJlbGF0aW9uID0gcmVsYXRpb25Mc3RbaW5kZXhdO1xuICAgICAgaWYgKF9yZWxhdGlvbi5pZC5nZXQoKSA9PT0gY2FuZGlkYXRlUmVsYXRpb24uaWQuZ2V0KCkpXG4gICAgICAgIHJlbGF0aW9uTHN0LnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICB9XG5cbiAgcmVtb3ZlUmVsYXRpb25zKF9yZWxhdGlvbnMpIHtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX3JlbGF0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHRoaXMucmVtb3ZlUmVsYXRpb24oX3JlbGF0aW9uc1tpbmRleF0pO1xuICAgIH1cbiAgfVxuXG4gIHJlbW92ZVJlbGF0aW9uVHlwZShfdHlwZSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KF90eXBlKSB8fCBfdHlwZSBpbnN0YW5jZW9mIExzdClcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBfdHlwZS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgdHlwZSA9IF90eXBlW2luZGV4XTtcbiAgICAgICAgdGhpcy5yZWxhdGlvbnMucmVtX2F0dHIodHlwZSk7XG4gICAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLnJlbGF0aW9ucy5yZW1fYXR0cihfdHlwZSk7XG4gICAgfVxuICB9XG5cbiAgaGFzQXBwRGVmaW5lZChhcHBOYW1lKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLmFwcHNbYXBwTmFtZV0gIT09IFwidW5kZWZpbmVkXCIpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKFwiYXBwIFwiICsgYXBwTmFtZSArXG4gICAgICAgIFwiIGlzIG5vdCBkZWZpbmVkIGZvciBub2RlIFwiICsgdGhpcy5nZXQoKSk7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cblxuICBoYXNSZWxhdGlvbkJ5QXBwQnlUeXBlRGVmaW5lZChhcHBOYW1lLCByZWxhdGlvblR5cGUpIHtcbiAgICBpZiAodGhpcy5oYXNBcHBEZWZpbmVkKGFwcE5hbWUpICYmIHR5cGVvZiB0aGlzLmFwcHNbYXBwTmFtZV1bXG4gICAgICAgIHJlbGF0aW9uVHlwZVxuICAgICAgXSAhPT1cbiAgICAgIFwidW5kZWZpbmVkXCIpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKFwicmVsYXRpb24gXCIgKyByZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyBub3QgZGVmaW5lZCBmb3Igbm9kZSBcIiArIHRoaXMubmFtZS5nZXQoKSArXG4gICAgICAgIFwiIGZvciBhcHBsaWNhdGlvbiBcIiArIGFwcE5hbWUpO1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG5cbiAgdG9Kc29uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpZDogdGhpcy5pZC5nZXQoKSxcbiAgICAgIG5hbWU6IHRoaXMubmFtZS5nZXQoKSxcbiAgICAgIGVsZW1lbnQ6IG51bGxcbiAgICB9O1xuICB9XG5cbiAgdG9Kc29uV2l0aFJlbGF0aW9ucygpIHtcbiAgICBsZXQgcmVsYXRpb25zID0gW107XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMuZ2V0UmVsYXRpb25zKCkubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCByZWxhdGlvbiA9IHRoaXMuZ2V0UmVsYXRpb25zKClbaW5kZXhdO1xuICAgICAgcmVsYXRpb25zLnB1c2gocmVsYXRpb24udG9Kc29uKCkpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IHRoaXMuaWQuZ2V0KCksXG4gICAgICBuYW1lOiB0aGlzLm5hbWUuZ2V0KCksXG4gICAgICBlbGVtZW50OiBudWxsLFxuICAgICAgcmVsYXRpb25zOiByZWxhdGlvbnNcbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgdG9JZmMoKSB7XG4gICAgbGV0IGVsZW1lbnQgPSBhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQodGhpcy5lbGVtZW50KTtcbiAgICByZXR1cm4gZWxlbWVudC50b0lmYygpO1xuICB9XG59XG5cbnNwaW5hbENvcmUucmVnaXN0ZXJfbW9kZWxzKFtTcGluYWxOb2RlXSk7Il19