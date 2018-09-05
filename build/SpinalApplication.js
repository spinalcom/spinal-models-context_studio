"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Utilities = require("./Utilities");

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const spinalCore = require("spinal-core-connectorjs");
const globalType = typeof window === "undefined" ? global : window;

/**
 *
 *
 * @class SpinalApplication
 * @extends {Model}
 */
class SpinalApplication extends globalType.Model {
  /**
   *Creates an instance of SpinalApplication.
   * @param {string} name
   * @param {string[]} relationsTypesLst
   * @param {SpinalGraph} relatedGraph
   * @param {string} [name="SpinalApplication"]
   * @memberof SpinalApplication
   */
  constructor(_name, relationsTypesLst, relatedGraph, name = "SpinalApplication") {
    super();
    if (FileSystem._sig_server) {
      this.add_attr({
        name: _name,
        type: "",
        relationsTypesLst: relationsTypesLst,
        relationsByType: new Model(),
        relationsLst: new Lst(),
        relatedGraph: relatedGraph
      });
    }
  }
  /**
   *
   *
   * @param {string} relationType
   * @memberof SpinalApplication
   */
  reserveUniqueRelationType(relationType) {
    this.relatedGraph.reserveUniqueRelationType(relationType, this);
  }
  /**
   *
   *
   * @param {SpinalNode} node
   * @memberof SpinalApplication
   */
  setStartingNode(node) {
    if (typeof this.startingNode === "undefined") this.add_attr({
      startingNode: node
    });else this.startingNode = node;

    node.apps.add_attr({
      [this.name.get()]: new Model()
    });
  }

  /**
   *
   *
   * @param {string} relationType
   * @memberof SpinalApplication
   */
  addRelationType(relationType) {
    if (!this.relatedGraph.isReserved(relationType)) {
      if (!_Utilities.Utilities.containsLst(this.relationsTypesLst, relationType)) {
        this.relationsTypesLst.push(relationType);
      }
    } else {
      console.log(relationType + " is reserved by " + this.reservedRelationsNames[relationType]);
    }
  }
  /**
   *
   *
   * @returns the element to bind with
   * @memberof SpinalApplication
   */
  getCharacteristicElement() {
    return this.relationsLst;
  }
  /**
   *
   *
   * @param {SpinalRelation} relation
   * @memberof SpinalApplication
   */
  addRelation(relation) {
    if (!this.relatedGraph.isReserved(relation.type.get())) {
      this.addRelationType(relation.type.get());
      if (typeof this.relationsByType[relation.type.get()] === "undefined") {
        let list = new Lst();
        list.push(relation);
        this.relationsByType.add_attr({
          [relation.type.get()]: list
        });
      } else {
        this.relationsByType[relation.type.get()].push(relation);
      }
      this.relationsLst.push(relation);
    } else {
      console.log(relation.type.get() + " is reserved by " + this.reservedRelationsNames[relation.type.get()]);
    }
  }
  /**
   *
   * check if the application declared a relation type
   * @param {string} relationType
   * @returns boolean
   * @memberof SpinalApplication
   */
  hasRelationType(relationType) {
    if (_Utilities.Utilities.containsLst(this.relationsTypesLst, relationType)) return true;else {
      console.warn(this.name.get() + " has not declared " + relationType + " as one of its relation Types.");
      return false;
    }
  }
  /**
   *
   * check if the application created this kind of relation Type
   * @param {string} relationType
   * @returns boolean
   * @memberof SpinalApplication
   */
  hasRelationTypeDefined(relationType) {
    if (typeof this.relationsByType[relationType] !== "undefined") return true;else {
      console.warn("relation " + relationType + " is not defined for app " + this.name.get());
      return false;
    }
  }

  /**
   *
   *
   * @param {string} relationType
   * @returns all relations of the specified type
   * @memberof SpinalApplication
   */
  getRelationsByType(relationType) {
    if (this.hasRelationType(relationType) && this.hasRelationTypeDefined(relationType)) return this.relationsByType[relationType];else return [];
  }
  /**
   *
   *
   * @returns all relations related with this application
   * @memberof SpinalApplication
   */
  getRelations() {
    return this.relationsLst;
  }
  /**
   *
   *
   * @param {SpinalNode} node
   * @returns all relations related with a node for this application
   * @memberof SpinalApplication
   */
  getRelationsByNode(node) {
    if (node.hasAppDefined(this.name.get())) return node.getRelationsByAppName(this.name.get());else return [];
  }
  /**
   *
   *
   * @param {SpinalNode} node
   * @param {string} relationType
   * @returns all relations of a specific type related with a node for this application
   * @memberof SpinalApplication
   */
  getRelationsByNodeByType(node, relationType) {
    return node.getRelationsByAppNameByType(this.name.get(), relationType);
  }
  /**
   *returns the nodes of the system such as BIMElementNodes
   , AbstractNodes from Relation NodeList1
   *
   * @memberof SpinalApplication
   */
  getCenralNodes() {
    let res = [];
    for (let i = 0; i < this.relationsLst.length; i++) {
      const relation = this.relationsLst[i];
      let nodeList1 = relation.getNodeList1();
      for (let j = 0; j < nodeList1.length; j++) {
        const node = nodeList1[j];
        res.push(node);
      }
    }
    return res;
  }
  /**
   *
   *
   * @param {string} relationType
   * @returns all BIMElement or AbstractElement Nodes (in NodeList1)
   * @memberof SpinalApplication
   */
  getCenralNodesByRelationType(relationType) {
    let res = [];
    for (let i = 0; i < this.relationsByType[relationType].length; i++) {
      const relation = this.relationsByType[relationType][i];
      let nodeList1 = relation.getNodeList1();
      for (let j = 0; j < nodeList1.length; j++) {
        const node = nodeList1[j];
        res.push(node);
      }
    }
    return res;
  }

  /**
   *
   *
   * @returns  A promise of all BIMElement or AbstractElement (in NodeList1)
   * @memberof SpinalApplication
   */
  getCenralNodesElements() {
    var _this = this;

    return _asyncToGenerator(function* () {
      let res = [];
      let centralNodes = _this.getCenralNodes();
      for (let index = 0; index < centralNodes.length; index++) {
        const centralNode = centralNodes[index];
        res.push((yield _Utilities.Utilities.promiseLoad(centralNode.element)));
      }
      return res;
    })();
  }
  /**
   *
   *
   * @param {string} relationType
   * @returns A promise of all BIMElement or AbstractElement (in NodeList1) of a specific type
   * @memberof SpinalApplication
   */
  getCenralNodesElementsByRelationType(relationType) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      let res = [];
      let centralNodes = _this2.getCenralNodesByRelationType(relationType);
      for (let index = 0; index < centralNodes.length; index++) {
        const centralNode = centralNodes[index];
        res.push((yield _Utilities.Utilities.promiseLoad(centralNode.element)));
      }
      return res;
    })();
  }

  /**
   *
   *
   * @param {SpinalNode} node
   * @returns A promise of all elements of (nodeList2) associated with a specific (central)node
   * @memberof SpinalApplication
   */
  getAssociatedElementsByNode(node) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      let res = [];
      let relations = _this3.getRelationsByNode(node);
      for (let i = 0; i < relations.length; i++) {
        const relation = relations[i];
        const nodeList2 = relation.getNodeList2();
        for (let j = 0; j < nodeList2.length; j++) {
          const node = nodeList2[j];
          res.push((yield _Utilities.Utilities.promiseLoad(node.element)));
        }
      }
      return res;
    })();
  }
  /**
   *
   *
   * @param {SpinalNode} node
   * @param {string} relationType
   * @returns A promise of all elements of (nodeList2) associated with a specific (central)node by a specific relation type
   * @memberof SpinalApplication
   */
  getAssociatedElementsByNodeByRelationType(node, relationType) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      let res = [];
      let relations = _this4.getRelationsByNodeByType(node, relationType);
      for (let i = 0; i < relations.length; i++) {
        const relation = relations[i];
        const nodeList2 = relation.getNodeList2();
        for (let j = 0; j < nodeList2.length; j++) {
          const node = nodeList2[j];
          res.push((yield _Utilities.Utilities.promiseLoad(node.element)));
        }
      }
      return res;
    })();
  }
  /**
   *
   * @returns an array of relation types
   *
   * @memberof SpinalApplication
   */
  getRelationTypes() {
    let res = [];
    for (let index = 0; index < this.relationsTypesLst.length; index++) {
      const element = this.relationsTypesLst[index];
      res.push(element);
    }
    return res;
  }

  /**
   *
   *
   * @param {boolean} onlyDirected
   * @returns an array of relation types that are really used
   * @memberof SpinalApplication
   */
  getUsedRelationTypes(onlyDirected) {
    let res = [];
    for (let index = 0; index < this.relationsTypesLst.length; index++) {
      const relationType = this.relationsTypesLst[index];
      if (typeof this.relationsByType[relationType] !== "undefined") {
        let relation = this.relationsByType[relationType][0];
        if (onlyDirected) {
          if (relation.isDirected.get()) {
            res.push(relationType);
          }
        } else res.push(relationType);
      }
    }
    return res;
  }
  /**
   *
   *
   * @returns an array of relation types that are never used in this application
   * @memberof SpinalApplication
   */
  getNotUsedRelationTypes() {
    let res = [];
    for (let index = 0; index < this.relationsTypesLst.length; index++) {
      const relationType = this.relationsTypesLst[index];
      if (typeof this.relationsByType[relationType] === "undefined") {
        res.push(relationType);
      }
    }
    return res;
  }
}
exports.default = SpinalApplication;

spinalCore.register_models([SpinalApplication]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TcGluYWxBcHBsaWNhdGlvbi5qcyJdLCJuYW1lcyI6WyJzcGluYWxDb3JlIiwicmVxdWlyZSIsImdsb2JhbFR5cGUiLCJ3aW5kb3ciLCJnbG9iYWwiLCJTcGluYWxBcHBsaWNhdGlvbiIsIk1vZGVsIiwiY29uc3RydWN0b3IiLCJfbmFtZSIsInJlbGF0aW9uc1R5cGVzTHN0IiwicmVsYXRlZEdyYXBoIiwibmFtZSIsIkZpbGVTeXN0ZW0iLCJfc2lnX3NlcnZlciIsImFkZF9hdHRyIiwidHlwZSIsInJlbGF0aW9uc0J5VHlwZSIsInJlbGF0aW9uc0xzdCIsIkxzdCIsInJlc2VydmVVbmlxdWVSZWxhdGlvblR5cGUiLCJyZWxhdGlvblR5cGUiLCJzZXRTdGFydGluZ05vZGUiLCJub2RlIiwic3RhcnRpbmdOb2RlIiwiYXBwcyIsImdldCIsImFkZFJlbGF0aW9uVHlwZSIsImlzUmVzZXJ2ZWQiLCJVdGlsaXRpZXMiLCJjb250YWluc0xzdCIsInB1c2giLCJjb25zb2xlIiwibG9nIiwicmVzZXJ2ZWRSZWxhdGlvbnNOYW1lcyIsImdldENoYXJhY3RlcmlzdGljRWxlbWVudCIsImFkZFJlbGF0aW9uIiwicmVsYXRpb24iLCJsaXN0IiwiaGFzUmVsYXRpb25UeXBlIiwid2FybiIsImhhc1JlbGF0aW9uVHlwZURlZmluZWQiLCJnZXRSZWxhdGlvbnNCeVR5cGUiLCJnZXRSZWxhdGlvbnMiLCJnZXRSZWxhdGlvbnNCeU5vZGUiLCJoYXNBcHBEZWZpbmVkIiwiZ2V0UmVsYXRpb25zQnlBcHBOYW1lIiwiZ2V0UmVsYXRpb25zQnlOb2RlQnlUeXBlIiwiZ2V0UmVsYXRpb25zQnlBcHBOYW1lQnlUeXBlIiwiZ2V0Q2VucmFsTm9kZXMiLCJyZXMiLCJpIiwibGVuZ3RoIiwibm9kZUxpc3QxIiwiZ2V0Tm9kZUxpc3QxIiwiaiIsImdldENlbnJhbE5vZGVzQnlSZWxhdGlvblR5cGUiLCJnZXRDZW5yYWxOb2Rlc0VsZW1lbnRzIiwiY2VudHJhbE5vZGVzIiwiaW5kZXgiLCJjZW50cmFsTm9kZSIsInByb21pc2VMb2FkIiwiZWxlbWVudCIsImdldENlbnJhbE5vZGVzRWxlbWVudHNCeVJlbGF0aW9uVHlwZSIsImdldEFzc29jaWF0ZWRFbGVtZW50c0J5Tm9kZSIsInJlbGF0aW9ucyIsIm5vZGVMaXN0MiIsImdldE5vZGVMaXN0MiIsImdldEFzc29jaWF0ZWRFbGVtZW50c0J5Tm9kZUJ5UmVsYXRpb25UeXBlIiwiZ2V0UmVsYXRpb25UeXBlcyIsImdldFVzZWRSZWxhdGlvblR5cGVzIiwib25seURpcmVjdGVkIiwiaXNEaXJlY3RlZCIsImdldE5vdFVzZWRSZWxhdGlvblR5cGVzIiwicmVnaXN0ZXJfbW9kZWxzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFHQTs7OztBQUhBLE1BQU1BLGFBQWFDLFFBQVEseUJBQVIsQ0FBbkI7QUFDQSxNQUFNQyxhQUFhLE9BQU9DLE1BQVAsS0FBa0IsV0FBbEIsR0FBZ0NDLE1BQWhDLEdBQXlDRCxNQUE1RDs7QUFJQTs7Ozs7O0FBTUEsTUFBTUUsaUJBQU4sU0FBZ0NILFdBQVdJLEtBQTNDLENBQWlEO0FBQy9DOzs7Ozs7OztBQVFBQyxjQUNFQyxLQURGLEVBRUVDLGlCQUZGLEVBR0VDLFlBSEYsRUFJRUMsT0FBTyxtQkFKVCxFQUtFO0FBQ0E7QUFDQSxRQUFJQyxXQUFXQyxXQUFmLEVBQTRCO0FBQzFCLFdBQUtDLFFBQUwsQ0FBYztBQUNaSCxjQUFNSCxLQURNO0FBRVpPLGNBQU0sRUFGTTtBQUdaTiwyQkFBbUJBLGlCQUhQO0FBSVpPLHlCQUFpQixJQUFJVixLQUFKLEVBSkw7QUFLWlcsc0JBQWMsSUFBSUMsR0FBSixFQUxGO0FBTVpSLHNCQUFjQTtBQU5GLE9BQWQ7QUFRRDtBQUNGO0FBQ0Q7Ozs7OztBQU1BUyw0QkFBMEJDLFlBQTFCLEVBQXdDO0FBQ3RDLFNBQUtWLFlBQUwsQ0FBa0JTLHlCQUFsQixDQUE0Q0MsWUFBNUMsRUFBMEQsSUFBMUQ7QUFDRDtBQUNEOzs7Ozs7QUFNQUMsa0JBQWdCQyxJQUFoQixFQUFzQjtBQUNwQixR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QUpELE1BSU82QixJQUFJbkIsSUFBSixDQUFTVixZQUFUO0FBQ1I7QUFDRjtBQUNELFdBQU82QixHQUFQO0FBQ0Q7QUFDRDs7Ozs7O0FBTUF1Qiw0QkFBMEI7QUFDeEIsUUFBSXZCLE1BQU0sRUFBVjtBQUNBLFNBQUssSUFBSVMsUUFBUSxDQUFqQixFQUFvQkEsUUFBUSxLQUFLakQsaUJBQUwsQ0FBdUIwQyxNQUFuRCxFQUEyRE8sT0FBM0QsRUFBb0U7QUFDbEUsWUFBTXRDLGVBQWUsS0FBS1gsaUJBQUwsQ0FBdUJpRCxLQUF2QixDQUFyQjtBQUNBLFVBQUksT0FBTyxLQUFLMUMsZUFBTCxDQUFxQkksWUFBckIsQ0FBUCxLQUE4QyxXQUFsRCxFQUErRDtBQUM3RDZCLFlBQUluQixJQUFKLENBQVNWLFlBQVQ7QUFDRDtBQUNGO0FBQ0QsV0FBTzZCLEdBQVA7QUFDRDtBQXZXOEM7a0JBeVdsQzVDLGlCOztBQUNmTCxXQUFXeUUsZUFBWCxDQUEyQixDQUFDcEUsaUJBQUQsQ0FBM0IiLCJmaWxlIjoiU3BpbmFsQXBwbGljYXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBzcGluYWxDb3JlID0gcmVxdWlyZShcInNwaW5hbC1jb3JlLWNvbm5lY3RvcmpzXCIpO1xuY29uc3QgZ2xvYmFsVHlwZSA9IHR5cGVvZiB3aW5kb3cgPT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB3aW5kb3c7XG5cbmltcG9ydCB7IFV0aWxpdGllcyB9IGZyb20gXCIuL1V0aWxpdGllc1wiO1xuXG4vKipcbiAqXG4gKlxuICogQGNsYXNzIFNwaW5hbEFwcGxpY2F0aW9uXG4gKiBAZXh0ZW5kcyB7TW9kZWx9XG4gKi9cbmNsYXNzIFNwaW5hbEFwcGxpY2F0aW9uIGV4dGVuZHMgZ2xvYmFsVHlwZS5Nb2RlbCB7XG4gIC8qKlxuICAgKkNyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgU3BpbmFsQXBwbGljYXRpb24uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nW119IHJlbGF0aW9uc1R5cGVzTHN0XG4gICAqIEBwYXJhbSB7U3BpbmFsR3JhcGh9IHJlbGF0ZWRHcmFwaFxuICAgKiBAcGFyYW0ge3N0cmluZ30gW25hbWU9XCJTcGluYWxBcHBsaWNhdGlvblwiXVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIF9uYW1lLFxuICAgIHJlbGF0aW9uc1R5cGVzTHN0LFxuICAgIHJlbGF0ZWRHcmFwaCxcbiAgICBuYW1lID0gXCJTcGluYWxBcHBsaWNhdGlvblwiXG4gICkge1xuICAgIHN1cGVyKCk7XG4gICAgaWYgKEZpbGVTeXN0ZW0uX3NpZ19zZXJ2ZXIpIHtcbiAgICAgIHRoaXMuYWRkX2F0dHIoe1xuICAgICAgICBuYW1lOiBfbmFtZSxcbiAgICAgICAgdHlwZTogXCJcIixcbiAgICAgICAgcmVsYXRpb25zVHlwZXNMc3Q6IHJlbGF0aW9uc1R5cGVzTHN0LFxuICAgICAgICByZWxhdGlvbnNCeVR5cGU6IG5ldyBNb2RlbCgpLFxuICAgICAgICByZWxhdGlvbnNMc3Q6IG5ldyBMc3QoKSxcbiAgICAgICAgcmVsYXRlZEdyYXBoOiByZWxhdGVkR3JhcGhcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIHJlc2VydmVVbmlxdWVSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlKSB7XG4gICAgdGhpcy5yZWxhdGVkR3JhcGgucmVzZXJ2ZVVuaXF1ZVJlbGF0aW9uVHlwZShyZWxhdGlvblR5cGUsIHRoaXMpO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGV9IG5vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBzZXRTdGFydGluZ05vZGUobm9kZSkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5zdGFydGluZ05vZGUgPT09IFwidW5kZWZpbmVkXCIpXG4gICAgICB0aGlzLmFkZF9hdHRyKHtcbiAgICAgICAgc3RhcnRpbmdOb2RlOiBub2RlXG4gICAgICB9KTtcbiAgICBlbHNlIHRoaXMuc3RhcnRpbmdOb2RlID0gbm9kZTtcblxuICAgIG5vZGUuYXBwcy5hZGRfYXR0cih7XG4gICAgICBbdGhpcy5uYW1lLmdldCgpXTogbmV3IE1vZGVsKClcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgYWRkUmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSkge1xuICAgIGlmICghdGhpcy5yZWxhdGVkR3JhcGguaXNSZXNlcnZlZChyZWxhdGlvblR5cGUpKSB7XG4gICAgICBpZiAoIVV0aWxpdGllcy5jb250YWluc0xzdCh0aGlzLnJlbGF0aW9uc1R5cGVzTHN0LCByZWxhdGlvblR5cGUpKSB7XG4gICAgICAgIHRoaXMucmVsYXRpb25zVHlwZXNMc3QucHVzaChyZWxhdGlvblR5cGUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb25UeXBlICtcbiAgICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgICAgdGhpcy5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uVHlwZV1cbiAgICAgICk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyB0aGUgZWxlbWVudCB0byBiaW5kIHdpdGhcbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBnZXRDaGFyYWN0ZXJpc3RpY0VsZW1lbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVsYXRpb25zTHN0O1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9ufSByZWxhdGlvblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGFkZFJlbGF0aW9uKHJlbGF0aW9uKSB7XG4gICAgaWYgKCF0aGlzLnJlbGF0ZWRHcmFwaC5pc1Jlc2VydmVkKHJlbGF0aW9uLnR5cGUuZ2V0KCkpKSB7XG4gICAgICB0aGlzLmFkZFJlbGF0aW9uVHlwZShyZWxhdGlvbi50eXBlLmdldCgpKTtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5yZWxhdGlvbnNCeVR5cGVbcmVsYXRpb24udHlwZS5nZXQoKV0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgbGV0IGxpc3QgPSBuZXcgTHN0KCk7XG4gICAgICAgIGxpc3QucHVzaChyZWxhdGlvbik7XG4gICAgICAgIHRoaXMucmVsYXRpb25zQnlUeXBlLmFkZF9hdHRyKHtcbiAgICAgICAgICBbcmVsYXRpb24udHlwZS5nZXQoKV06IGxpc3RcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJlbGF0aW9uc0J5VHlwZVtyZWxhdGlvbi50eXBlLmdldCgpXS5wdXNoKHJlbGF0aW9uKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucmVsYXRpb25zTHN0LnB1c2gocmVsYXRpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb24udHlwZS5nZXQoKSArXG4gICAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICAgIHRoaXMucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvbi50eXBlLmdldCgpXVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqIGNoZWNrIGlmIHRoZSBhcHBsaWNhdGlvbiBkZWNsYXJlZCBhIHJlbGF0aW9uIHR5cGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgaGFzUmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSkge1xuICAgIGlmIChVdGlsaXRpZXMuY29udGFpbnNMc3QodGhpcy5yZWxhdGlvbnNUeXBlc0xzdCwgcmVsYXRpb25UeXBlKSlcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICB0aGlzLm5hbWUuZ2V0KCkgK1xuICAgICAgICAgIFwiIGhhcyBub3QgZGVjbGFyZWQgXCIgK1xuICAgICAgICAgIHJlbGF0aW9uVHlwZSArXG4gICAgICAgICAgXCIgYXMgb25lIG9mIGl0cyByZWxhdGlvbiBUeXBlcy5cIlxuICAgICAgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqIGNoZWNrIGlmIHRoZSBhcHBsaWNhdGlvbiBjcmVhdGVkIHRoaXMga2luZCBvZiByZWxhdGlvbiBUeXBlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgYm9vbGVhblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGhhc1JlbGF0aW9uVHlwZURlZmluZWQocmVsYXRpb25UeXBlKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0aW9uc0J5VHlwZVtyZWxhdGlvblR5cGVdICE9PSBcInVuZGVmaW5lZFwiKSByZXR1cm4gdHJ1ZTtcbiAgICBlbHNlIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgXCJyZWxhdGlvbiBcIiArXG4gICAgICAgICAgcmVsYXRpb25UeXBlICtcbiAgICAgICAgICBcIiBpcyBub3QgZGVmaW5lZCBmb3IgYXBwIFwiICtcbiAgICAgICAgICB0aGlzLm5hbWUuZ2V0KClcbiAgICAgICk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgYWxsIHJlbGF0aW9ucyBvZiB0aGUgc3BlY2lmaWVkIHR5cGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBnZXRSZWxhdGlvbnNCeVR5cGUocmVsYXRpb25UeXBlKSB7XG4gICAgaWYgKFxuICAgICAgdGhpcy5oYXNSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlKSAmJlxuICAgICAgdGhpcy5oYXNSZWxhdGlvblR5cGVEZWZpbmVkKHJlbGF0aW9uVHlwZSlcbiAgICApXG4gICAgICByZXR1cm4gdGhpcy5yZWxhdGlvbnNCeVR5cGVbcmVsYXRpb25UeXBlXTtcbiAgICBlbHNlIHJldHVybiBbXTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgYWxsIHJlbGF0aW9ucyByZWxhdGVkIHdpdGggdGhpcyBhcHBsaWNhdGlvblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGdldFJlbGF0aW9ucygpIHtcbiAgICByZXR1cm4gdGhpcy5yZWxhdGlvbnNMc3Q7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZX0gbm9kZVxuICAgKiBAcmV0dXJucyBhbGwgcmVsYXRpb25zIHJlbGF0ZWQgd2l0aCBhIG5vZGUgZm9yIHRoaXMgYXBwbGljYXRpb25cbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBnZXRSZWxhdGlvbnNCeU5vZGUobm9kZSkge1xuICAgIGlmIChub2RlLmhhc0FwcERlZmluZWQodGhpcy5uYW1lLmdldCgpKSlcbiAgICAgIHJldHVybiBub2RlLmdldFJlbGF0aW9uc0J5QXBwTmFtZSh0aGlzLm5hbWUuZ2V0KCkpO1xuICAgIGVsc2UgcmV0dXJuIFtdO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGV9IG5vZGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBhbGwgcmVsYXRpb25zIG9mIGEgc3BlY2lmaWMgdHlwZSByZWxhdGVkIHdpdGggYSBub2RlIGZvciB0aGlzIGFwcGxpY2F0aW9uXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgZ2V0UmVsYXRpb25zQnlOb2RlQnlUeXBlKG5vZGUsIHJlbGF0aW9uVHlwZSkge1xuICAgIHJldHVybiBub2RlLmdldFJlbGF0aW9uc0J5QXBwTmFtZUJ5VHlwZSh0aGlzLm5hbWUuZ2V0KCksIHJlbGF0aW9uVHlwZSk7XG4gIH1cbiAgLyoqXG4gICAqcmV0dXJucyB0aGUgbm9kZXMgb2YgdGhlIHN5c3RlbSBzdWNoIGFzIEJJTUVsZW1lbnROb2Rlc1xuICAgLCBBYnN0cmFjdE5vZGVzIGZyb20gUmVsYXRpb24gTm9kZUxpc3QxXG4gICAqXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgZ2V0Q2VucmFsTm9kZXMoKSB7XG4gICAgbGV0IHJlcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5yZWxhdGlvbnNMc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHJlbGF0aW9uID0gdGhpcy5yZWxhdGlvbnNMc3RbaV07XG4gICAgICBsZXQgbm9kZUxpc3QxID0gcmVsYXRpb24uZ2V0Tm9kZUxpc3QxKCk7XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG5vZGVMaXN0MS5sZW5ndGg7IGorKykge1xuICAgICAgICBjb25zdCBub2RlID0gbm9kZUxpc3QxW2pdO1xuICAgICAgICByZXMucHVzaChub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBhbGwgQklNRWxlbWVudCBvciBBYnN0cmFjdEVsZW1lbnQgTm9kZXMgKGluIE5vZGVMaXN0MSlcbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBnZXRDZW5yYWxOb2Rlc0J5UmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSkge1xuICAgIGxldCByZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucmVsYXRpb25zQnlUeXBlW3JlbGF0aW9uVHlwZV0ubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHJlbGF0aW9uID0gdGhpcy5yZWxhdGlvbnNCeVR5cGVbcmVsYXRpb25UeXBlXVtpXTtcbiAgICAgIGxldCBub2RlTGlzdDEgPSByZWxhdGlvbi5nZXROb2RlTGlzdDEoKTtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbm9kZUxpc3QxLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBub2RlTGlzdDFbal07XG4gICAgICAgIHJlcy5wdXNoKG5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEByZXR1cm5zICBBIHByb21pc2Ugb2YgYWxsIEJJTUVsZW1lbnQgb3IgQWJzdHJhY3RFbGVtZW50IChpbiBOb2RlTGlzdDEpXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgYXN5bmMgZ2V0Q2VucmFsTm9kZXNFbGVtZW50cygpIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgbGV0IGNlbnRyYWxOb2RlcyA9IHRoaXMuZ2V0Q2VucmFsTm9kZXMoKTtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgY2VudHJhbE5vZGVzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgY2VudHJhbE5vZGUgPSBjZW50cmFsTm9kZXNbaW5kZXhdO1xuICAgICAgcmVzLnB1c2goYXdhaXQgVXRpbGl0aWVzLnByb21pc2VMb2FkKGNlbnRyYWxOb2RlLmVsZW1lbnQpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBBIHByb21pc2Ugb2YgYWxsIEJJTUVsZW1lbnQgb3IgQWJzdHJhY3RFbGVtZW50IChpbiBOb2RlTGlzdDEpIG9mIGEgc3BlY2lmaWMgdHlwZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGFzeW5jIGdldENlbnJhbE5vZGVzRWxlbWVudHNCeVJlbGF0aW9uVHlwZShyZWxhdGlvblR5cGUpIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgbGV0IGNlbnRyYWxOb2RlcyA9IHRoaXMuZ2V0Q2VucmFsTm9kZXNCeVJlbGF0aW9uVHlwZShyZWxhdGlvblR5cGUpO1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBjZW50cmFsTm9kZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCBjZW50cmFsTm9kZSA9IGNlbnRyYWxOb2Rlc1tpbmRleF07XG4gICAgICByZXMucHVzaChhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQoY2VudHJhbE5vZGUuZWxlbWVudCkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZX0gbm9kZVxuICAgKiBAcmV0dXJucyBBIHByb21pc2Ugb2YgYWxsIGVsZW1lbnRzIG9mIChub2RlTGlzdDIpIGFzc29jaWF0ZWQgd2l0aCBhIHNwZWNpZmljIChjZW50cmFsKW5vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBhc3luYyBnZXRBc3NvY2lhdGVkRWxlbWVudHNCeU5vZGUobm9kZSkge1xuICAgIGxldCByZXMgPSBbXTtcbiAgICBsZXQgcmVsYXRpb25zID0gdGhpcy5nZXRSZWxhdGlvbnNCeU5vZGUobm9kZSk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZWxhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHJlbGF0aW9uID0gcmVsYXRpb25zW2ldO1xuICAgICAgY29uc3Qgbm9kZUxpc3QyID0gcmVsYXRpb24uZ2V0Tm9kZUxpc3QyKCk7XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG5vZGVMaXN0Mi5sZW5ndGg7IGorKykge1xuICAgICAgICBjb25zdCBub2RlID0gbm9kZUxpc3QyW2pdO1xuICAgICAgICByZXMucHVzaChhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQobm9kZS5lbGVtZW50KSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZX0gbm9kZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSBvZiBhbGwgZWxlbWVudHMgb2YgKG5vZGVMaXN0MikgYXNzb2NpYXRlZCB3aXRoIGEgc3BlY2lmaWMgKGNlbnRyYWwpbm9kZSBieSBhIHNwZWNpZmljIHJlbGF0aW9uIHR5cGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBhc3luYyBnZXRBc3NvY2lhdGVkRWxlbWVudHNCeU5vZGVCeVJlbGF0aW9uVHlwZShub2RlLCByZWxhdGlvblR5cGUpIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgbGV0IHJlbGF0aW9ucyA9IHRoaXMuZ2V0UmVsYXRpb25zQnlOb2RlQnlUeXBlKG5vZGUsIHJlbGF0aW9uVHlwZSk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZWxhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHJlbGF0aW9uID0gcmVsYXRpb25zW2ldO1xuICAgICAgY29uc3Qgbm9kZUxpc3QyID0gcmVsYXRpb24uZ2V0Tm9kZUxpc3QyKCk7XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG5vZGVMaXN0Mi5sZW5ndGg7IGorKykge1xuICAgICAgICBjb25zdCBub2RlID0gbm9kZUxpc3QyW2pdO1xuICAgICAgICByZXMucHVzaChhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQobm9kZS5lbGVtZW50KSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqIEByZXR1cm5zIGFuIGFycmF5IG9mIHJlbGF0aW9uIHR5cGVzXG4gICAqXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgZ2V0UmVsYXRpb25UeXBlcygpIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMucmVsYXRpb25zVHlwZXNMc3QubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5yZWxhdGlvbnNUeXBlc0xzdFtpbmRleF07XG4gICAgICByZXMucHVzaChlbGVtZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IG9ubHlEaXJlY3RlZFxuICAgKiBAcmV0dXJucyBhbiBhcnJheSBvZiByZWxhdGlvbiB0eXBlcyB0aGF0IGFyZSByZWFsbHkgdXNlZFxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGdldFVzZWRSZWxhdGlvblR5cGVzKG9ubHlEaXJlY3RlZCkge1xuICAgIGxldCByZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5yZWxhdGlvbnNUeXBlc0xzdC5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IHJlbGF0aW9uVHlwZSA9IHRoaXMucmVsYXRpb25zVHlwZXNMc3RbaW5kZXhdO1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0aW9uc0J5VHlwZVtyZWxhdGlvblR5cGVdICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGxldCByZWxhdGlvbiA9IHRoaXMucmVsYXRpb25zQnlUeXBlW3JlbGF0aW9uVHlwZV1bMF07XG4gICAgICAgIGlmIChvbmx5RGlyZWN0ZWQpIHtcbiAgICAgICAgICBpZiAocmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKSkge1xuICAgICAgICAgICAgcmVzLnB1c2gocmVsYXRpb25UeXBlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSByZXMucHVzaChyZWxhdGlvblR5cGUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyBhbiBhcnJheSBvZiByZWxhdGlvbiB0eXBlcyB0aGF0IGFyZSBuZXZlciB1c2VkIGluIHRoaXMgYXBwbGljYXRpb25cbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBnZXROb3RVc2VkUmVsYXRpb25UeXBlcygpIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMucmVsYXRpb25zVHlwZXNMc3QubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCByZWxhdGlvblR5cGUgPSB0aGlzLnJlbGF0aW9uc1R5cGVzTHN0W2luZGV4XTtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5yZWxhdGlvbnNCeVR5cGVbcmVsYXRpb25UeXBlXSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICByZXMucHVzaChyZWxhdGlvblR5cGUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG59XG5leHBvcnQgZGVmYXVsdCBTcGluYWxBcHBsaWNhdGlvbjtcbnNwaW5hbENvcmUucmVnaXN0ZXJfbW9kZWxzKFtTcGluYWxBcHBsaWNhdGlvbl0pO1xuIl19