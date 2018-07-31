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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TcGluYWxBcHBsaWNhdGlvbi5qcyJdLCJuYW1lcyI6WyJzcGluYWxDb3JlIiwicmVxdWlyZSIsImdsb2JhbFR5cGUiLCJ3aW5kb3ciLCJnbG9iYWwiLCJTcGluYWxBcHBsaWNhdGlvbiIsIk1vZGVsIiwiY29uc3RydWN0b3IiLCJfbmFtZSIsInJlbGF0aW9uc1R5cGVzTHN0IiwicmVsYXRlZEdyYXBoIiwibmFtZSIsIkZpbGVTeXN0ZW0iLCJfc2lnX3NlcnZlciIsImFkZF9hdHRyIiwidHlwZSIsInJlbGF0aW9uc0J5VHlwZSIsInJlbGF0aW9uc0xzdCIsIkxzdCIsInJlc2VydmVVbmlxdWVSZWxhdGlvblR5cGUiLCJyZWxhdGlvblR5cGUiLCJzZXRTdGFydGluZ05vZGUiLCJub2RlIiwic3RhcnRpbmdOb2RlIiwiYXBwcyIsImdldCIsImFkZFJlbGF0aW9uVHlwZSIsImlzUmVzZXJ2ZWQiLCJVdGlsaXRpZXMiLCJjb250YWluc0xzdCIsInB1c2giLCJjb25zb2xlIiwibG9nIiwicmVzZXJ2ZWRSZWxhdGlvbnNOYW1lcyIsImdldENoYXJhY3RlcmlzdGljRWxlbWVudCIsImFkZFJlbGF0aW9uIiwicmVsYXRpb24iLCJsaXN0IiwiaGFzUmVsYXRpb25UeXBlIiwid2FybiIsImhhc1JlbGF0aW9uVHlwZURlZmluZWQiLCJnZXRSZWxhdGlvbnNCeVR5cGUiLCJnZXRSZWxhdGlvbnMiLCJnZXRSZWxhdGlvbnNCeU5vZGUiLCJoYXNBcHBEZWZpbmVkIiwiZ2V0UmVsYXRpb25zQnlBcHBOYW1lIiwiZ2V0UmVsYXRpb25zQnlOb2RlQnlUeXBlIiwiZ2V0UmVsYXRpb25zQnlBcHBOYW1lQnlUeXBlIiwiZ2V0Q2VucmFsTm9kZXMiLCJyZXMiLCJpIiwibGVuZ3RoIiwibm9kZUxpc3QxIiwiZ2V0Tm9kZUxpc3QxIiwiaiIsImdldENlbnJhbE5vZGVzQnlSZWxhdGlvblR5cGUiLCJnZXRDZW5yYWxOb2Rlc0VsZW1lbnRzIiwiY2VudHJhbE5vZGVzIiwiaW5kZXgiLCJjZW50cmFsTm9kZSIsInByb21pc2VMb2FkIiwiZWxlbWVudCIsImdldENlbnJhbE5vZGVzRWxlbWVudHNCeVJlbGF0aW9uVHlwZSIsImdldEFzc29jaWF0ZWRFbGVtZW50c0J5Tm9kZSIsInJlbGF0aW9ucyIsIm5vZGVMaXN0MiIsImdldE5vZGVMaXN0MiIsImdldEFzc29jaWF0ZWRFbGVtZW50c0J5Tm9kZUJ5UmVsYXRpb25UeXBlIiwicmVnaXN0ZXJfbW9kZWxzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFHQTs7QUFIQSxNQUFNQSxhQUFhQyxRQUFRLHlCQUFSLENBQW5CO0FBQ0EsTUFBTUMsYUFBYSxPQUFPQyxNQUFQLEtBQWtCLFdBQWxCLEdBQWdDQyxNQUFoQyxHQUF5Q0QsTUFBNUQ7O0FBUUE7Ozs7OztBQU1BLE1BQU1FLGlCQUFOLFNBQWdDSCxXQUFXSSxLQUEzQyxDQUFpRDtBQUMvQzs7Ozs7Ozs7QUFRQUMsY0FBWUMsS0FBWixFQUFtQkMsaUJBQW5CLEVBQXNDQyxZQUF0QyxFQUFvREMsT0FDbEQsbUJBREYsRUFDdUI7QUFDckI7QUFDQSxRQUFJQyxXQUFXQyxXQUFmLEVBQTRCO0FBQzFCLFdBQUtDLFFBQUwsQ0FBYztBQUNaSCxjQUFNSCxLQURNO0FBRVpPLGNBQU0sRUFGTTtBQUdaTiwyQkFBbUJBLGlCQUhQO0FBSVpPLHlCQUFpQixJQUFJVixLQUFKLEVBSkw7QUFLWlcsc0JBQWMsSUFBSUMsR0FBSixFQUxGO0FBTVpSLHNCQUFjQTtBQU5GLE9BQWQ7QUFRRDtBQUNGO0FBQ0Q7Ozs7OztBQU1BUyw0QkFBMEJDLFlBQTFCLEVBQXdDO0FBQ3RDLFNBQUtWLFlBQUwsQ0FBa0JTLHlCQUFsQixDQUE0Q0MsWUFBNUMsRUFBMEQsSUFBMUQ7QUFDRDtBQUNEOzs7Ozs7QUFNQUMsa0JBQWdCQyxJQUFoQixFQUFzQjtBQUNwQixRQUFJLE9BQU8sS0FBS0MsWUFBWixLQUE2QixXQUFqQyxFQUNFLEtBQUtULFFBQUwsQ0FBYztBQUNaUyxvQkFBY0Q7QUFERixLQUFkLEVBREYsS0FLRSxLQUFL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LEVBQVMsTUFBTUYscUJBQVVnQyxXQUFWLENBQXNCdEMsS0FBS3VDLE9BQTNCLENBQWY7QUFDRDtBQUNGO0FBQ0QsV0FBT1osR0FBUDtBQUNEOztBQTdTOEM7a0JBaVRsQzVDLGlCOztBQUNmTCxXQUFXb0UsZUFBWCxDQUEyQixDQUFDL0QsaUJBQUQsQ0FBM0IiLCJmaWxlIjoiU3BpbmFsQXBwbGljYXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBzcGluYWxDb3JlID0gcmVxdWlyZShcInNwaW5hbC1jb3JlLWNvbm5lY3RvcmpzXCIpO1xuY29uc3QgZ2xvYmFsVHlwZSA9IHR5cGVvZiB3aW5kb3cgPT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB3aW5kb3c7XG5cbmltcG9ydCB7XG4gIFV0aWxpdGllc1xufSBmcm9tIFwiLi9VdGlsaXRpZXNcIjtcblxuXG5cbi8qKlxuICpcbiAqXG4gKiBAY2xhc3MgU3BpbmFsQXBwbGljYXRpb25cbiAqIEBleHRlbmRzIHtNb2RlbH1cbiAqL1xuY2xhc3MgU3BpbmFsQXBwbGljYXRpb24gZXh0ZW5kcyBnbG9iYWxUeXBlLk1vZGVsIHtcbiAgLyoqXG4gICAqQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBTcGluYWxBcHBsaWNhdGlvbi5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHBhcmFtIHtzdHJpbmdbXX0gcmVsYXRpb25zVHlwZXNMc3RcbiAgICogQHBhcmFtIHtTcGluYWxHcmFwaH0gcmVsYXRlZEdyYXBoXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbbmFtZT1cIlNwaW5hbEFwcGxpY2F0aW9uXCJdXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgY29uc3RydWN0b3IoX25hbWUsIHJlbGF0aW9uc1R5cGVzTHN0LCByZWxhdGVkR3JhcGgsIG5hbWUgPVxuICAgIFwiU3BpbmFsQXBwbGljYXRpb25cIikge1xuICAgIHN1cGVyKCk7XG4gICAgaWYgKEZpbGVTeXN0ZW0uX3NpZ19zZXJ2ZXIpIHtcbiAgICAgIHRoaXMuYWRkX2F0dHIoe1xuICAgICAgICBuYW1lOiBfbmFtZSxcbiAgICAgICAgdHlwZTogXCJcIixcbiAgICAgICAgcmVsYXRpb25zVHlwZXNMc3Q6IHJlbGF0aW9uc1R5cGVzTHN0LFxuICAgICAgICByZWxhdGlvbnNCeVR5cGU6IG5ldyBNb2RlbCgpLFxuICAgICAgICByZWxhdGlvbnNMc3Q6IG5ldyBMc3QoKSxcbiAgICAgICAgcmVsYXRlZEdyYXBoOiByZWxhdGVkR3JhcGhcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIHJlc2VydmVVbmlxdWVSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlKSB7XG4gICAgdGhpcy5yZWxhdGVkR3JhcGgucmVzZXJ2ZVVuaXF1ZVJlbGF0aW9uVHlwZShyZWxhdGlvblR5cGUsIHRoaXMpXG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZX0gbm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIHNldFN0YXJ0aW5nTm9kZShub2RlKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnN0YXJ0aW5nTm9kZSA9PT0gXCJ1bmRlZmluZWRcIilcbiAgICAgIHRoaXMuYWRkX2F0dHIoe1xuICAgICAgICBzdGFydGluZ05vZGU6IG5vZGVcbiAgICAgIH0pXG4gICAgZWxzZVxuICAgICAgdGhpcy5zdGFydGluZ05vZGUgPSBub2RlXG5cbiAgICBub2RlLmFwcHMuYWRkX2F0dHIoe1xuICAgICAgW3RoaXMubmFtZS5nZXQoKV06IG5ldyBNb2RlbCgpXG4gICAgfSlcbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBhZGRSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlKSB7XG4gICAgaWYgKCF0aGlzLnJlbGF0ZWRHcmFwaC5pc1Jlc2VydmVkKHJlbGF0aW9uVHlwZSkpIHtcbiAgICAgIGlmICghVXRpbGl0aWVzLmNvbnRhaW5zTHN0KHRoaXMucmVsYXRpb25zVHlwZXNMc3QsXG4gICAgICAgICAgcmVsYXRpb25UeXBlKSkge1xuICAgICAgICB0aGlzLnJlbGF0aW9uc1R5cGVzTHN0LnB1c2gocmVsYXRpb25UeXBlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIHJlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGlzIHJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uVHlwZV1cbiAgICAgICk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyB0aGUgZWxlbWVudCB0byBiaW5kIHdpdGhcbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBnZXRDaGFyYWN0ZXJpc3RpY0VsZW1lbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVsYXRpb25zTHN0O1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9ufSByZWxhdGlvblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGFkZFJlbGF0aW9uKHJlbGF0aW9uKSB7XG4gICAgaWYgKCF0aGlzLnJlbGF0ZWRHcmFwaC5pc1Jlc2VydmVkKHJlbGF0aW9uLnR5cGUuZ2V0KCkpKSB7XG4gICAgICB0aGlzLmFkZFJlbGF0aW9uVHlwZShyZWxhdGlvbi50eXBlLmdldCgpKTtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5yZWxhdGlvbnNCeVR5cGVbcmVsYXRpb24udHlwZS5nZXQoKV0gPT09XG4gICAgICAgIFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgbGV0IGxpc3QgPSBuZXcgTHN0KClcbiAgICAgICAgbGlzdC5wdXNoKHJlbGF0aW9uKVxuICAgICAgICB0aGlzLnJlbGF0aW9uc0J5VHlwZS5hZGRfYXR0cih7XG4gICAgICAgICAgW3JlbGF0aW9uLnR5cGUuZ2V0KCldOiBsaXN0XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZWxhdGlvbnNCeVR5cGVbcmVsYXRpb24udHlwZS5nZXQoKV0ucHVzaChyZWxhdGlvbilcbiAgICAgIH1cbiAgICAgIHRoaXMucmVsYXRpb25zTHN0LnB1c2gocmVsYXRpb24pXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICByZWxhdGlvbi50eXBlLmdldCgpICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb24udHlwZS5nZXQoKV1cbiAgICAgICk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBcbiAgICogY2hlY2sgaWYgdGhlIGFwcGxpY2F0aW9uIGRlY2xhcmVkIGEgcmVsYXRpb24gdHlwZSBcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgaGFzUmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSkge1xuICAgIGlmIChVdGlsaXRpZXMuY29udGFpbnNMc3QodGhpcy5yZWxhdGlvbnNUeXBlc0xzdCwgcmVsYXRpb25UeXBlKSlcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4odGhpcy5uYW1lLmdldCgpICsgXCIgaGFzIG5vdCBkZWNsYXJlZCBcIiArIHJlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGFzIG9uZSBvZiBpdHMgcmVsYXRpb24gVHlwZXMuXCIpO1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKiBjaGVjayBpZiB0aGUgYXBwbGljYXRpb24gY3JlYXRlZCB0aGlzIGtpbmQgb2YgcmVsYXRpb24gVHlwZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBoYXNSZWxhdGlvblR5cGVEZWZpbmVkKHJlbGF0aW9uVHlwZSkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5yZWxhdGlvbnNCeVR5cGVbcmVsYXRpb25UeXBlXSAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oXCJyZWxhdGlvbiBcIiArIHJlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGlzIG5vdCBkZWZpbmVkIGZvciBhcHAgXCIgKyB0aGlzLm5hbWUuZ2V0KCkpO1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBhbGwgcmVsYXRpb25zIG9mIHRoZSBzcGVjaWZpZWQgdHlwZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGdldFJlbGF0aW9uc0J5VHlwZShyZWxhdGlvblR5cGUpIHtcbiAgICBpZiAodGhpcy5oYXNSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlKSAmJiB0aGlzLmhhc1JlbGF0aW9uVHlwZURlZmluZWQoXG4gICAgICAgIHJlbGF0aW9uVHlwZSkpXG4gICAgICByZXR1cm4gdGhpcy5yZWxhdGlvbnNCeVR5cGVbcmVsYXRpb25UeXBlXVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBbXVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyBhbGwgcmVsYXRpb25zIHJlbGF0ZWQgd2l0aCB0aGlzIGFwcGxpY2F0aW9uXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgZ2V0UmVsYXRpb25zKCkge1xuICAgIHJldHVybiB0aGlzLnJlbGF0aW9uc0xzdDtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxOb2RlfSBub2RlXG4gICAqIEByZXR1cm5zIGFsbCByZWxhdGlvbnMgcmVsYXRlZCB3aXRoIGEgbm9kZSBmb3IgdGhpcyBhcHBsaWNhdGlvblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGdldFJlbGF0aW9uc0J5Tm9kZShub2RlKSB7XG4gICAgaWYgKG5vZGUuaGFzQXBwRGVmaW5lZCh0aGlzLm5hbWUuZ2V0KCkpKVxuICAgICAgcmV0dXJuIG5vZGUuZ2V0UmVsYXRpb25zQnlBcHBOYW1lKHRoaXMubmFtZS5nZXQoKSlcbiAgICBlbHNlIHJldHVybiBbXVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGV9IG5vZGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBhbGwgcmVsYXRpb25zIG9mIGEgc3BlY2lmaWMgdHlwZSByZWxhdGVkIHdpdGggYSBub2RlIGZvciB0aGlzIGFwcGxpY2F0aW9uXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgZ2V0UmVsYXRpb25zQnlOb2RlQnlUeXBlKG5vZGUsIHJlbGF0aW9uVHlwZSkge1xuICAgIHJldHVybiBub2RlLmdldFJlbGF0aW9uc0J5QXBwTmFtZUJ5VHlwZSh0aGlzLm5hbWUuZ2V0KCksIHJlbGF0aW9uVHlwZSlcbiAgfVxuICAvKipcbiAgICpyZXR1cm5zIHRoZSBub2RlcyBvZiB0aGUgc3lzdGVtIHN1Y2ggYXMgQklNRWxlbWVudE5vZGVzXG4gICAsIEFic3RyYWN0Tm9kZXMgZnJvbSBSZWxhdGlvbiBOb2RlTGlzdDFcbiAgICpcbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBnZXRDZW5yYWxOb2RlcygpIHtcbiAgICBsZXQgcmVzID0gwqAgW11cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucmVsYXRpb25zTHN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCByZWxhdGlvbiA9IHRoaXMucmVsYXRpb25zTHN0W2ldO1xuICAgICAgbGV0IG5vZGVMaXN0MSA9IHJlbGF0aW9uLmdldE5vZGVMaXN0MSgpXG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG5vZGVMaXN0MS5sZW5ndGg7IGorKykge1xuICAgICAgICBjb25zdCBub2RlID0gbm9kZUxpc3QxW2pdO1xuICAgICAgICByZXMucHVzaChub2RlKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEByZXR1cm5zIGFsbCBCSU1FbGVtZW50IG9yIEFic3RyYWN0RWxlbWVudCBOb2RlcyAoaW4gTm9kZUxpc3QxKVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGdldENlbnJhbE5vZGVzQnlSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlKSB7XG4gICAgbGV0IHJlcyA9IMKgIFtdXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnJlbGF0aW9uc0J5VHlwZVtyZWxhdGlvblR5cGVdLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCByZWxhdGlvbiA9IHRoaXMucmVsYXRpb25zQnlUeXBlW3JlbGF0aW9uVHlwZV1baV07XG4gICAgICBsZXQgbm9kZUxpc3QxID0gcmVsYXRpb24uZ2V0Tm9kZUxpc3QxKClcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbm9kZUxpc3QxLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBub2RlTGlzdDFbal07XG4gICAgICAgIHJlcy5wdXNoKG5vZGUpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyAgQSBwcm9taXNlIG9mIGFsbCBCSU1FbGVtZW50IG9yIEFic3RyYWN0RWxlbWVudCAoaW4gTm9kZUxpc3QxKVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGFzeW5jIGdldENlbnJhbE5vZGVzRWxlbWVudHMoKSB7XG4gICAgbGV0IHJlcyA9IMKgIFtdXG4gICAgbGV0IGNlbnRyYWxOb2RlcyA9IHRoaXMuZ2V0Q2VucmFsTm9kZXMoKVxuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBjZW50cmFsTm9kZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCBjZW50cmFsTm9kZSA9IGNlbnRyYWxOb2Rlc1tpbmRleF07XG4gICAgICByZXMucHVzaChhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQoY2VudHJhbE5vZGUuZWxlbWVudCkpXG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgQSBwcm9taXNlIG9mIGFsbCBCSU1FbGVtZW50IG9yIEFic3RyYWN0RWxlbWVudCAoaW4gTm9kZUxpc3QxKSBvZiBhIHNwZWNpZmljIHR5cGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBhc3luYyBnZXRDZW5yYWxOb2Rlc0VsZW1lbnRzQnlSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlKSB7XG4gICAgbGV0IHJlcyA9IMKgIFtdXG4gICAgbGV0IGNlbnRyYWxOb2RlcyA9IHRoaXMuZ2V0Q2VucmFsTm9kZXNCeVJlbGF0aW9uVHlwZShyZWxhdGlvblR5cGUpXG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGNlbnRyYWxOb2Rlcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IGNlbnRyYWxOb2RlID0gY2VudHJhbE5vZGVzW2luZGV4XTtcbiAgICAgIHJlcy5wdXNoKGF3YWl0IFV0aWxpdGllcy5wcm9taXNlTG9hZChjZW50cmFsTm9kZS5lbGVtZW50KSlcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZX0gbm9kZVxuICAgKiBAcmV0dXJucyBBIHByb21pc2Ugb2YgYWxsIGVsZW1lbnRzIG9mIChub2RlTGlzdDIpIGFzc29jaWF0ZWQgd2l0aCBhIHNwZWNpZmljIChjZW50cmFsKW5vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBhc3luYyBnZXRBc3NvY2lhdGVkRWxlbWVudHNCeU5vZGUobm9kZSkge1xuICAgIGxldCByZXMgPSBbXVxuICAgIGxldCByZWxhdGlvbnMgPSB0aGlzLmdldFJlbGF0aW9uc0J5Tm9kZShub2RlKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlbGF0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgcmVsYXRpb24gPSByZWxhdGlvbnNbaV07XG4gICAgICBjb25zdCBub2RlTGlzdDIgPSByZWxhdGlvbi5nZXROb2RlTGlzdDIoKVxuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBub2RlTGlzdDIubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVMaXN0MltqXTtcbiAgICAgICAgcmVzLnB1c2goYXdhaXQgVXRpbGl0aWVzLnByb21pc2VMb2FkKG5vZGUuZWxlbWVudCkpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZX0gbm9kZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSBvZiBhbGwgZWxlbWVudHMgb2YgKG5vZGVMaXN0MikgYXNzb2NpYXRlZCB3aXRoIGEgc3BlY2lmaWMgKGNlbnRyYWwpbm9kZSBieSBhIHNwZWNpZmljIHJlbGF0aW9uIHR5cGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBhc3luYyBnZXRBc3NvY2lhdGVkRWxlbWVudHNCeU5vZGVCeVJlbGF0aW9uVHlwZShub2RlLCByZWxhdGlvblR5cGUpIHtcbiAgICBsZXQgcmVzID0gW11cbiAgICBsZXQgcmVsYXRpb25zID0gdGhpcy5nZXRSZWxhdGlvbnNCeU5vZGVCeVR5cGUobm9kZSwgcmVsYXRpb25UeXBlKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlbGF0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgcmVsYXRpb24gPSByZWxhdGlvbnNbaV07XG4gICAgICBjb25zdCBub2RlTGlzdDIgPSByZWxhdGlvbi5nZXROb2RlTGlzdDIoKVxuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBub2RlTGlzdDIubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVMaXN0MltqXTtcbiAgICAgICAgcmVzLnB1c2goYXdhaXQgVXRpbGl0aWVzLnByb21pc2VMb2FkKG5vZGUuZWxlbWVudCkpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cblxuXG59XG5leHBvcnQgZGVmYXVsdCBTcGluYWxBcHBsaWNhdGlvbjtcbnNwaW5hbENvcmUucmVnaXN0ZXJfbW9kZWxzKFtTcGluYWxBcHBsaWNhdGlvbl0pIl19