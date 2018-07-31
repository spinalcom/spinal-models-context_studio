"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Utilities = require("./Utilities");

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
  async getCenralNodesElements() {
    let res = [];
    let centralNodes = this.getCenralNodes();
    for (let index = 0; index < centralNodes.length; index++) {
      const centralNode = centralNodes[index];
      res.push((await _Utilities.Utilities.promiseLoad(centralNode.element)));
    }
    return res;
  }
  /**
   *
   *
   * @param {string} relationType
   * @returns A promise of all BIMElement or AbstractElement (in NodeList1) of a specific type
   * @memberof SpinalApplication
   */
  async getCenralNodesElementsByRelationType(relationType) {
    let res = [];
    let centralNodes = this.getCenralNodesByRelationType(relationType);
    for (let index = 0; index < centralNodes.length; index++) {
      const centralNode = centralNodes[index];
      res.push((await _Utilities.Utilities.promiseLoad(centralNode.element)));
    }
    return res;
  }

  /**
   *
   *
   * @param {SpinalNode} node
   * @returns A promise of all elements of (nodeList2) associated with a specific (central)node
   * @memberof SpinalApplication
   */
  async getAssociatedElementsByNode(node) {
    let res = [];
    let relations = this.getRelationsByNode(node);
    for (let i = 0; i < relations.length; i++) {
      const relation = relations[i];
      const nodeList2 = relation.getNodeList2();
      for (let j = 0; j < nodeList2.length; j++) {
        const node = nodeList2[j];
        res.push((await _Utilities.Utilities.promiseLoad(node.element)));
      }
    }
    return res;
  }
  /**
   *
   *
   * @param {SpinalNode} node
   * @param {string} relationType
   * @returns A promise of all elements of (nodeList2) associated with a specific (central)node by a specific relation type
   * @memberof SpinalApplication
   */
  async getAssociatedElementsByNodeByRelationType(node, relationType) {
    let res = [];
    let relations = this.getRelationsByNodeByType(node, relationType);
    for (let i = 0; i < relations.length; i++) {
      const relation = relations[i];
      const nodeList2 = relation.getNodeList2();
      for (let j = 0; j < nodeList2.length; j++) {
        const node = nodeList2[j];
        res.push((await _Utilities.Utilities.promiseLoad(node.element)));
      }
    }
    return res;
  }

}
exports.default = SpinalApplication;

spinalCore.register_models([SpinalApplication]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TcGluYWxBcHBsaWNhdGlvbi5qcyJdLCJuYW1lcyI6WyJzcGluYWxDb3JlIiwicmVxdWlyZSIsImdsb2JhbFR5cGUiLCJ3aW5kb3ciLCJnbG9iYWwiLCJTcGluYWxBcHBsaWNhdGlvbiIsIk1vZGVsIiwiY29uc3RydWN0b3IiLCJfbmFtZSIsInJlbGF0aW9uc1R5cGVzTHN0IiwicmVsYXRlZEdyYXBoIiwibmFtZSIsIkZpbGVTeXN0ZW0iLCJfc2lnX3NlcnZlciIsImFkZF9hdHRyIiwidHlwZSIsInJlbGF0aW9uc0J5VHlwZSIsInJlbGF0aW9uc0xzdCIsIkxzdCIsInJlc2VydmVVbmlxdWVSZWxhdGlvblR5cGUiLCJyZWxhdGlvblR5cGUiLCJzZXRTdGFydGluZ05vZGUiLCJub2RlIiwic3RhcnRpbmdOb2RlIiwiYWRkUmVsYXRpb25UeXBlIiwiaXNSZXNlcnZlZCIsIlV0aWxpdGllcyIsImNvbnRhaW5zTHN0IiwicHVzaCIsImNvbnNvbGUiLCJsb2ciLCJyZXNlcnZlZFJlbGF0aW9uc05hbWVzIiwiZ2V0Q2hhcmFjdGVyaXN0aWNFbGVtZW50IiwiYWRkUmVsYXRpb24iLCJyZWxhdGlvbiIsImdldCIsImxpc3QiLCJoYXNSZWxhdGlvblR5cGUiLCJ3YXJuIiwiaGFzUmVsYXRpb25UeXBlRGVmaW5lZCIsImdldFJlbGF0aW9uc0J5VHlwZSIsImdldFJlbGF0aW9ucyIsImdldFJlbGF0aW9uc0J5Tm9kZSIsImhhc0FwcERlZmluZWQiLCJnZXRSZWxhdGlvbnNCeUFwcE5hbWUiLCJnZXRSZWxhdGlvbnNCeU5vZGVCeVR5cGUiLCJnZXRSZWxhdGlvbnNCeUFwcE5hbWVCeVR5cGUiLCJnZXRDZW5yYWxOb2RlcyIsInJlcyIsImkiLCJsZW5ndGgiLCJub2RlTGlzdDEiLCJnZXROb2RlTGlzdDEiLCJqIiwiZ2V0Q2VucmFsTm9kZXNCeVJlbGF0aW9uVHlwZSIsImdldENlbnJhbE5vZGVzRWxlbWVudHMiLCJjZW50cmFsTm9kZXMiLCJpbmRleCIsImNlbnRyYWxOb2RlIiwicHJvbWlzZUxvYWQiLCJlbGVtZW50IiwiZ2V0Q2VucmFsTm9kZXNFbGVtZW50c0J5UmVsYXRpb25UeXBlIiwiZ2V0QXNzb2NpYXRlZEVsZW1lbnRzQnlOb2RlIiwicmVsYXRpb25zIiwibm9kZUxpc3QyIiwiZ2V0Tm9kZUxpc3QyIiwiZ2V0QXNzb2NpYXRlZEVsZW1lbnRzQnlOb2RlQnlSZWxhdGlvblR5cGUiLCJyZWdpc3Rlcl9tb2RlbHMiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUdBOztBQUhBLE1BQU1BLGFBQWFDLFFBQVEseUJBQVIsQ0FBbkI7QUFDQSxNQUFNQyxhQUFhLE9BQU9DLE1BQVAsS0FBa0IsV0FBbEIsR0FBZ0NDLE1BQWhDLEdBQXlDRCxNQUE1RDs7QUFRQTs7Ozs7O0FBTUEsTUFBTUUsaUJBQU4sU0FBZ0NILFdBQVdJLEtBQTNDLENBQWlEO0FBQy9DOzs7Ozs7OztBQVFBQyxjQUFZQyxLQUFaLEVBQW1CQyxpQkFBbkIsRUFBc0NDLFlBQXRDLEVBQW9EQyxPQUNsRCxtQkFERixFQUN1QjtBQUNyQjtBQUNBLFFBQUlDLFdBQVdDLFdBQWYsRUFBNEI7QUFDMUIsV0FBS0MsUUFBTCxDQUFjO0FBQ1pILGNBQU1ILEtBRE07QUFFWk8sY0FBTSxFQUZNO0FBR1pOLDJCQUFtQkEsaUJBSFA7QUFJWk8seUJBQWlCLElBQUlWLEtBQUosRUFKTDtBQUtaVyxzQkFBYyxJQUFJQyxHQUFKLEVBTEY7QUFNWlIsc0JBQWNBO0FBTkYsT0FBZDtBQVFEO0FBQ0Y7QUFDRDs7Ozs7O0FBTUFTLDRCQUEwQkMsWUFBMUIsRUFBd0M7QUFDdEMsU0FBS1YsWUFBTCxDQUFrQlMseUJBQWxCLENBQTRDQyxZQUE1QyxFQUEwRCxJQUExRDtBQUNEO0FBQ0Q7Ozs7OztBQU1BQyxrQkFBZ0JDLElBQWhCLEVBQXNCO0FBQ3BCLFFBQUksT0FBTyxLQUFLQyxZQUFaLEtBQTZCLFdBQWpDLEVBQ0UsS0FBS1QsUUFBTCxDQUFjO0FBQ1pTLG9CQUFjRDtBQURGLEtBQWQsRUFERixLQUtFLEtBQUtDLFlBQUws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OztBQUNmTCxXQUFXbUUsZUFBWCxDQUEyQixDQUFDOUQsaUJBQUQsQ0FBM0IiLCJmaWxlIjoiU3BpbmFsQXBwbGljYXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBzcGluYWxDb3JlID0gcmVxdWlyZShcInNwaW5hbC1jb3JlLWNvbm5lY3RvcmpzXCIpO1xuY29uc3QgZ2xvYmFsVHlwZSA9IHR5cGVvZiB3aW5kb3cgPT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB3aW5kb3c7XG5cbmltcG9ydCB7XG4gIFV0aWxpdGllc1xufSBmcm9tIFwiLi9VdGlsaXRpZXNcIjtcblxuXG5cbi8qKlxuICpcbiAqXG4gKiBAY2xhc3MgU3BpbmFsQXBwbGljYXRpb25cbiAqIEBleHRlbmRzIHtNb2RlbH1cbiAqL1xuY2xhc3MgU3BpbmFsQXBwbGljYXRpb24gZXh0ZW5kcyBnbG9iYWxUeXBlLk1vZGVsIHtcbiAgLyoqXG4gICAqQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBTcGluYWxBcHBsaWNhdGlvbi5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHBhcmFtIHtzdHJpbmdbXX0gcmVsYXRpb25zVHlwZXNMc3RcbiAgICogQHBhcmFtIHtTcGluYWxHcmFwaH0gcmVsYXRlZEdyYXBoXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbbmFtZT1cIlNwaW5hbEFwcGxpY2F0aW9uXCJdXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgY29uc3RydWN0b3IoX25hbWUsIHJlbGF0aW9uc1R5cGVzTHN0LCByZWxhdGVkR3JhcGgsIG5hbWUgPVxuICAgIFwiU3BpbmFsQXBwbGljYXRpb25cIikge1xuICAgIHN1cGVyKCk7XG4gICAgaWYgKEZpbGVTeXN0ZW0uX3NpZ19zZXJ2ZXIpIHtcbiAgICAgIHRoaXMuYWRkX2F0dHIoe1xuICAgICAgICBuYW1lOiBfbmFtZSxcbiAgICAgICAgdHlwZTogXCJcIixcbiAgICAgICAgcmVsYXRpb25zVHlwZXNMc3Q6IHJlbGF0aW9uc1R5cGVzTHN0LFxuICAgICAgICByZWxhdGlvbnNCeVR5cGU6IG5ldyBNb2RlbCgpLFxuICAgICAgICByZWxhdGlvbnNMc3Q6IG5ldyBMc3QoKSxcbiAgICAgICAgcmVsYXRlZEdyYXBoOiByZWxhdGVkR3JhcGhcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIHJlc2VydmVVbmlxdWVSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlKSB7XG4gICAgdGhpcy5yZWxhdGVkR3JhcGgucmVzZXJ2ZVVuaXF1ZVJlbGF0aW9uVHlwZShyZWxhdGlvblR5cGUsIHRoaXMpXG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZX0gbm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIHNldFN0YXJ0aW5nTm9kZShub2RlKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnN0YXJ0aW5nTm9kZSA9PT0gXCJ1bmRlZmluZWRcIilcbiAgICAgIHRoaXMuYWRkX2F0dHIoe1xuICAgICAgICBzdGFydGluZ05vZGU6IG5vZGVcbiAgICAgIH0pXG4gICAgZWxzZVxuICAgICAgdGhpcy5zdGFydGluZ05vZGUgPSBub2RlXG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgYWRkUmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSkge1xuICAgIGlmICghdGhpcy5yZWxhdGVkR3JhcGguaXNSZXNlcnZlZChyZWxhdGlvblR5cGUpKSB7XG4gICAgICBpZiAoIVV0aWxpdGllcy5jb250YWluc0xzdCh0aGlzLnJlbGF0aW9uc1R5cGVzTHN0LFxuICAgICAgICAgIHJlbGF0aW9uVHlwZSkpIHtcbiAgICAgICAgdGhpcy5yZWxhdGlvbnNUeXBlc0xzdC5wdXNoKHJlbGF0aW9uVHlwZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICByZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvblR5cGVdXG4gICAgICApO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgdGhlIGVsZW1lbnQgdG8gYmluZCB3aXRoXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgZ2V0Q2hhcmFjdGVyaXN0aWNFbGVtZW50KCkge1xuICAgIHJldHVybiB0aGlzLnJlbGF0aW9uc0xzdDtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbn0gcmVsYXRpb25cbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBhZGRSZWxhdGlvbihyZWxhdGlvbikge1xuICAgIGlmICghdGhpcy5yZWxhdGVkR3JhcGguaXNSZXNlcnZlZChyZWxhdGlvbi50eXBlLmdldCgpKSkge1xuICAgICAgdGhpcy5hZGRSZWxhdGlvblR5cGUocmVsYXRpb24udHlwZS5nZXQoKSk7XG4gICAgICBpZiAodHlwZW9mIHRoaXMucmVsYXRpb25zQnlUeXBlW3JlbGF0aW9uLnR5cGUuZ2V0KCldID09PVxuICAgICAgICBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGxldCBsaXN0ID0gbmV3IExzdCgpXG4gICAgICAgIGxpc3QucHVzaChyZWxhdGlvbilcbiAgICAgICAgdGhpcy5yZWxhdGlvbnNCeVR5cGUuYWRkX2F0dHIoe1xuICAgICAgICAgIFtyZWxhdGlvbi50eXBlLmdldCgpXTogbGlzdFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucmVsYXRpb25zQnlUeXBlW3JlbGF0aW9uLnR5cGUuZ2V0KCldLnB1c2gocmVsYXRpb24pXG4gICAgICB9XG4gICAgICB0aGlzLnJlbGF0aW9uc0xzdC5wdXNoKHJlbGF0aW9uKVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb24udHlwZS5nZXQoKSArXG4gICAgICAgIFwiIGlzIHJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uLnR5cGUuZ2V0KCldXG4gICAgICApO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICogXG4gICAqIGNoZWNrIGlmIHRoZSBhcHBsaWNhdGlvbiBkZWNsYXJlZCBhIHJlbGF0aW9uIHR5cGUgXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgYm9vbGVhblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGhhc1JlbGF0aW9uVHlwZShyZWxhdGlvblR5cGUpIHtcbiAgICBpZiAoVXRpbGl0aWVzLmNvbnRhaW5zTHN0KHRoaXMucmVsYXRpb25zVHlwZXNMc3QsIHJlbGF0aW9uVHlwZSkpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKHRoaXMubmFtZS5nZXQoKSArIFwiIGhhcyBub3QgZGVjbGFyZWQgXCIgKyByZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBhcyBvbmUgb2YgaXRzIHJlbGF0aW9uIFR5cGVzLlwiKTtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICogY2hlY2sgaWYgdGhlIGFwcGxpY2F0aW9uIGNyZWF0ZWQgdGhpcyBraW5kIG9mIHJlbGF0aW9uIFR5cGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgaGFzUmVsYXRpb25UeXBlRGVmaW5lZChyZWxhdGlvblR5cGUpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMucmVsYXRpb25zQnlUeXBlW3JlbGF0aW9uVHlwZV0gIT09IFwidW5kZWZpbmVkXCIpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKFwicmVsYXRpb24gXCIgKyByZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyBub3QgZGVmaW5lZCBmb3IgYXBwIFwiICsgdGhpcy5uYW1lLmdldCgpKTtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgYWxsIHJlbGF0aW9ucyBvZiB0aGUgc3BlY2lmaWVkIHR5cGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBnZXRSZWxhdGlvbnNCeVR5cGUocmVsYXRpb25UeXBlKSB7XG4gICAgaWYgKHRoaXMuaGFzUmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSkgJiYgdGhpcy5oYXNSZWxhdGlvblR5cGVEZWZpbmVkKFxuICAgICAgICByZWxhdGlvblR5cGUpKVxuICAgICAgcmV0dXJuIHRoaXMucmVsYXRpb25zQnlUeXBlW3JlbGF0aW9uVHlwZV1cbiAgICBlbHNlXG4gICAgICByZXR1cm4gW11cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgYWxsIHJlbGF0aW9ucyByZWxhdGVkIHdpdGggdGhpcyBhcHBsaWNhdGlvblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGdldFJlbGF0aW9ucygpIHtcbiAgICByZXR1cm4gdGhpcy5yZWxhdGlvbnNMc3Q7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZX0gbm9kZVxuICAgKiBAcmV0dXJucyBhbGwgcmVsYXRpb25zIHJlbGF0ZWQgd2l0aCBhIG5vZGUgZm9yIHRoaXMgYXBwbGljYXRpb25cbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBnZXRSZWxhdGlvbnNCeU5vZGUobm9kZSkge1xuICAgIGlmIChub2RlLmhhc0FwcERlZmluZWQodGhpcy5uYW1lLmdldCgpKSlcbiAgICAgIHJldHVybiBub2RlLmdldFJlbGF0aW9uc0J5QXBwTmFtZSh0aGlzLm5hbWUuZ2V0KCkpXG4gICAgZWxzZSByZXR1cm4gW11cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxOb2RlfSBub2RlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgYWxsIHJlbGF0aW9ucyBvZiBhIHNwZWNpZmljIHR5cGUgcmVsYXRlZCB3aXRoIGEgbm9kZSBmb3IgdGhpcyBhcHBsaWNhdGlvblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGdldFJlbGF0aW9uc0J5Tm9kZUJ5VHlwZShub2RlLCByZWxhdGlvblR5cGUpIHtcbiAgICByZXR1cm4gbm9kZS5nZXRSZWxhdGlvbnNCeUFwcE5hbWVCeVR5cGUodGhpcy5uYW1lLmdldCgpLCByZWxhdGlvblR5cGUpXG4gIH1cbiAgLyoqXG4gICAqcmV0dXJucyB0aGUgbm9kZXMgb2YgdGhlIHN5c3RlbSBzdWNoIGFzIEJJTUVsZW1lbnROb2Rlc1xuICAgLCBBYnN0cmFjdE5vZGVzIGZyb20gUmVsYXRpb24gTm9kZUxpc3QxXG4gICAqXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgZ2V0Q2VucmFsTm9kZXMoKSB7XG4gICAgbGV0IHJlcyA9IMKgIFtdXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnJlbGF0aW9uc0xzdC5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgcmVsYXRpb24gPSB0aGlzLnJlbGF0aW9uc0xzdFtpXTtcbiAgICAgIGxldCBub2RlTGlzdDEgPSByZWxhdGlvbi5nZXROb2RlTGlzdDEoKVxuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBub2RlTGlzdDEubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVMaXN0MVtqXTtcbiAgICAgICAgcmVzLnB1c2gobm9kZSlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBhbGwgQklNRWxlbWVudCBvciBBYnN0cmFjdEVsZW1lbnQgTm9kZXMgKGluIE5vZGVMaXN0MSlcbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBnZXRDZW5yYWxOb2Rlc0J5UmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSkge1xuICAgIGxldCByZXMgPSDCoCBbXVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5yZWxhdGlvbnNCeVR5cGVbcmVsYXRpb25UeXBlXS5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgcmVsYXRpb24gPSB0aGlzLnJlbGF0aW9uc0J5VHlwZVtyZWxhdGlvblR5cGVdW2ldO1xuICAgICAgbGV0IG5vZGVMaXN0MSA9IHJlbGF0aW9uLmdldE5vZGVMaXN0MSgpXG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG5vZGVMaXN0MS5sZW5ndGg7IGorKykge1xuICAgICAgICBjb25zdCBub2RlID0gbm9kZUxpc3QxW2pdO1xuICAgICAgICByZXMucHVzaChub2RlKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cblxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgIEEgcHJvbWlzZSBvZiBhbGwgQklNRWxlbWVudCBvciBBYnN0cmFjdEVsZW1lbnQgKGluIE5vZGVMaXN0MSlcbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBhc3luYyBnZXRDZW5yYWxOb2Rlc0VsZW1lbnRzKCkge1xuICAgIGxldCByZXMgPSDCoCBbXVxuICAgIGxldCBjZW50cmFsTm9kZXMgPSB0aGlzLmdldENlbnJhbE5vZGVzKClcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgY2VudHJhbE5vZGVzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgY2VudHJhbE5vZGUgPSBjZW50cmFsTm9kZXNbaW5kZXhdO1xuICAgICAgcmVzLnB1c2goYXdhaXQgVXRpbGl0aWVzLnByb21pc2VMb2FkKGNlbnRyYWxOb2RlLmVsZW1lbnQpKVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSBvZiBhbGwgQklNRWxlbWVudCBvciBBYnN0cmFjdEVsZW1lbnQgKGluIE5vZGVMaXN0MSkgb2YgYSBzcGVjaWZpYyB0eXBlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgYXN5bmMgZ2V0Q2VucmFsTm9kZXNFbGVtZW50c0J5UmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSkge1xuICAgIGxldCByZXMgPSDCoCBbXVxuICAgIGxldCBjZW50cmFsTm9kZXMgPSB0aGlzLmdldENlbnJhbE5vZGVzQnlSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlKVxuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBjZW50cmFsTm9kZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCBjZW50cmFsTm9kZSA9IGNlbnRyYWxOb2Rlc1tpbmRleF07XG4gICAgICByZXMucHVzaChhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQoY2VudHJhbE5vZGUuZWxlbWVudCkpXG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGV9IG5vZGVcbiAgICogQHJldHVybnMgQSBwcm9taXNlIG9mIGFsbCBlbGVtZW50cyBvZiAobm9kZUxpc3QyKSBhc3NvY2lhdGVkIHdpdGggYSBzcGVjaWZpYyAoY2VudHJhbClub2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgYXN5bmMgZ2V0QXNzb2NpYXRlZEVsZW1lbnRzQnlOb2RlKG5vZGUpIHtcbiAgICBsZXQgcmVzID0gW11cbiAgICBsZXQgcmVsYXRpb25zID0gdGhpcy5nZXRSZWxhdGlvbnNCeU5vZGUobm9kZSk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZWxhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHJlbGF0aW9uID0gcmVsYXRpb25zW2ldO1xuICAgICAgY29uc3Qgbm9kZUxpc3QyID0gcmVsYXRpb24uZ2V0Tm9kZUxpc3QyKClcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbm9kZUxpc3QyLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBub2RlTGlzdDJbal07XG4gICAgICAgIHJlcy5wdXNoKGF3YWl0IFV0aWxpdGllcy5wcm9taXNlTG9hZChub2RlLmVsZW1lbnQpKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGV9IG5vZGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBBIHByb21pc2Ugb2YgYWxsIGVsZW1lbnRzIG9mIChub2RlTGlzdDIpIGFzc29jaWF0ZWQgd2l0aCBhIHNwZWNpZmljIChjZW50cmFsKW5vZGUgYnkgYSBzcGVjaWZpYyByZWxhdGlvbiB0eXBlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgYXN5bmMgZ2V0QXNzb2NpYXRlZEVsZW1lbnRzQnlOb2RlQnlSZWxhdGlvblR5cGUobm9kZSwgcmVsYXRpb25UeXBlKSB7XG4gICAgbGV0IHJlcyA9IFtdXG4gICAgbGV0IHJlbGF0aW9ucyA9IHRoaXMuZ2V0UmVsYXRpb25zQnlOb2RlQnlUeXBlKG5vZGUsIHJlbGF0aW9uVHlwZSk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZWxhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHJlbGF0aW9uID0gcmVsYXRpb25zW2ldO1xuICAgICAgY29uc3Qgbm9kZUxpc3QyID0gcmVsYXRpb24uZ2V0Tm9kZUxpc3QyKClcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbm9kZUxpc3QyLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBub2RlTGlzdDJbal07XG4gICAgICAgIHJlcy5wdXNoKGF3YWl0IFV0aWxpdGllcy5wcm9taXNlTG9hZChub2RlLmVsZW1lbnQpKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cblxufVxuZXhwb3J0IGRlZmF1bHQgU3BpbmFsQXBwbGljYXRpb247XG5zcGluYWxDb3JlLnJlZ2lzdGVyX21vZGVscyhbU3BpbmFsQXBwbGljYXRpb25dKSJdfQ==