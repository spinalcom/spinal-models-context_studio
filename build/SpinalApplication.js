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
    for (let i = 0; i < relationsLst.length; i++) {
      const relation = relationsLst[i];
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
    for (let i = 0; i < relationsByType[relationType].length; i++) {
      const relation = relationsByType[relationType][i];
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TcGluYWxBcHBsaWNhdGlvbi5qcyJdLCJuYW1lcyI6WyJzcGluYWxDb3JlIiwicmVxdWlyZSIsImdsb2JhbFR5cGUiLCJ3aW5kb3ciLCJnbG9iYWwiLCJTcGluYWxBcHBsaWNhdGlvbiIsIk1vZGVsIiwiY29uc3RydWN0b3IiLCJfbmFtZSIsInJlbGF0aW9uc1R5cGVzTHN0IiwicmVsYXRlZEdyYXBoIiwibmFtZSIsIkZpbGVTeXN0ZW0iLCJfc2lnX3NlcnZlciIsImFkZF9hdHRyIiwidHlwZSIsInJlbGF0aW9uc0J5VHlwZSIsInJlbGF0aW9uc0xzdCIsIkxzdCIsInJlc2VydmVVbmlxdWVSZWxhdGlvblR5cGUiLCJyZWxhdGlvblR5cGUiLCJhZGRSZWxhdGlvblR5cGUiLCJpc1Jlc2VydmVkIiwiVXRpbGl0aWVzIiwiY29udGFpbnNMc3QiLCJwdXNoIiwiY29uc29sZSIsImxvZyIsInJlc2VydmVkUmVsYXRpb25zTmFtZXMiLCJnZXRDaGFyYWN0ZXJpc3RpY0VsZW1lbnQiLCJhZGRSZWxhdGlvbiIsInJlbGF0aW9uIiwiZ2V0IiwibGlzdCIsImhhc1JlbGF0aW9uVHlwZSIsIndhcm4iLCJoYXNSZWxhdGlvblR5cGVEZWZpbmVkIiwiZ2V0UmVsYXRpb25zQnlUeXBlIiwiZ2V0UmVsYXRpb25zIiwiZ2V0UmVsYXRpb25zQnlOb2RlIiwibm9kZSIsImhhc0FwcERlZmluZWQiLCJnZXRSZWxhdGlvbnNCeUFwcE5hbWUiLCJnZXRSZWxhdGlvbnNCeU5vZGVCeVR5cGUiLCJnZXRSZWxhdGlvbnNCeUFwcE5hbWVCeVR5cGUiLCJnZXRDZW5yYWxOb2RlcyIsInJlcyIsImkiLCJsZW5ndGgiLCJub2RlTGlzdDEiLCJnZXROb2RlTGlzdDEiLCJqIiwiZ2V0Q2VucmFsTm9kZXNCeVJlbGF0aW9uVHlwZSIsImdldENlbnJhbE5vZGVzRWxlbWVudHMiLCJjZW50cmFsTm9kZXMiLCJpbmRleCIsImNlbnRyYWxOb2RlIiwicHJvbWlzZUxvYWQiLCJlbGVtZW50IiwiZ2V0Q2VucmFsTm9kZXNFbGVtZW50c0J5UmVsYXRpb25UeXBlIiwiZ2V0QXNzb2NpYXRlZEVsZW1lbnRzQnlOb2RlIiwicmVsYXRpb25zIiwibm9kZUxpc3QyIiwiZ2V0Tm9kZUxpc3QyIiwiZ2V0QXNzb2NpYXRlZEVsZW1lbnRzQnlOb2RlQnlSZWxhdGlvblR5cGUiLCJyZWdpc3Rlcl9tb2RlbHMiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUdBOztBQUhBLE1BQU1BLGFBQWFDLFFBQVEseUJBQVIsQ0FBbkI7QUFDQSxNQUFNQyxhQUFhLE9BQU9DLE1BQVAsS0FBa0IsV0FBbEIsR0FBZ0NDLE1BQWhDLEdBQXlDRCxNQUE1RDs7QUFRQTs7Ozs7O0FBTUEsTUFBTUUsaUJBQU4sU0FBZ0NILFdBQVdJLEtBQTNDLENBQWlEO0FBQy9DOzs7Ozs7OztBQVFBQyxjQUFZQyxLQUFaLEVBQW1CQyxpQkFBbkIsRUFBc0NDLFlBQXRDLEVBQW9EQyxPQUNsRCxtQkFERixFQUN1QjtBQUNyQjtBQUNBLFFBQUlDLFdBQVdDLFdBQWYsRUFBNEI7QUFDMUIsV0FBS0MsUUFBTCxDQUFjO0FBQ1pILGNBQU1ILEtBRE07QUFFWk8sY0FBTSxFQUZNO0FBR1pOLDJCQUFtQkEsaUJBSFA7QUFJWk8seUJBQWlCLElBQUlWLEtBQUosRUFKTDtBQUtaVyxzQkFBYyxJQUFJQyxHQUFKLEVBTEY7QUFNWlIsc0JBQWNBO0FBTkYsT0FBZDtBQVFEO0FBQ0Y7QUFDRDs7Ozs7O0FBTUFTLDRCQUEwQkMsWUFBMUIsRUFBd0M7QUFDdEMsU0FBS1YsWUFBTCxDQUFrQlMseUJBQWxCLENBQTRDQyxZQUE1QyxFQUEwRCxJQUExRDtBQUNEOztBQUdEOzs7Ozs7QUFNQUMsa0JBQWdCRCxZQUFoQixFQUE4QjtBQUM1QixRQUFJLENBQUMsS0FBS1YsWUFBTCxDQUFrQlksVUFBbEIsQ0FBNkJGLFlBQTdCLENBQUwsRUFBaUQ7QUFDL0MsVUFBSSxDQUFDRyxxQkFBVUMsV0FBVixDQUFzQixLQUFLZixpQkFBM0IsRUFDRFcsWUFEQyxDQUFMLEVBQ21CO0FB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QUFNWCxPQUFPc0IsVUFBVVgsQ0FBVixDQUFiO0FBQ0FMLFlBQUlyQixJQUFKLEVBQVMsTUFBTUYscUJBQVVrQyxXQUFWLENBQXNCakIsS0FBS2tCLE9BQTNCLENBQWY7QUFDRDtBQUNGO0FBQ0QsV0FBT1osR0FBUDtBQUNEO0FBQ0Q7Ozs7Ozs7O0FBUUEsUUFBTWtCLHlDQUFOLENBQWdEeEIsSUFBaEQsRUFBc0RwQixZQUF0RCxFQUFvRTtBQUNsRSxRQUFJMEIsTUFBTSxFQUFWO0FBQ0EsUUFBSWUsWUFBWSxLQUFLbEIsd0JBQUwsQ0FBOEJILElBQTlCLEVBQW9DcEIsWUFBcEMsQ0FBaEI7QUFDQSxTQUFLLElBQUkyQixJQUFJLENBQWIsRUFBZ0JBLElBQUljLFVBQVViLE1BQTlCLEVBQXNDRCxHQUF0QyxFQUEyQztBQUN6QyxZQUFNaEIsV0FBVzhCLFVBQVVkLENBQVYsQ0FBakI7QUFDQSxZQUFNZSxZQUFZL0IsU0FBU2dDLFlBQVQsRUFBbEI7QUFDQSxXQUFLLElBQUlaLElBQUksQ0FBYixFQUFnQkEsSUFBSVcsVUFBVWQsTUFBOUIsRUFBc0NHLEdBQXRDLEVBQTJDO0FBQ3pDLGNBQU1YLE9BQU9zQixVQUFVWCxDQUFWLENBQWI7QUFDQUwsWUFBSXJCLElBQUosRUFBUyxNQUFNRixxQkFBVWtDLFdBQVYsQ0FBc0JqQixLQUFLa0IsT0FBM0IsQ0FBZjtBQUNEO0FBQ0Y7QUFDRCxXQUFPWixHQUFQO0FBQ0Q7O0FBM1I4QztrQkErUmxDekMsaUI7O0FBQ2ZMLFdBQVdpRSxlQUFYLENBQTJCLENBQUM1RCxpQkFBRCxDQUEzQiIsImZpbGUiOiJTcGluYWxBcHBsaWNhdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHNwaW5hbENvcmUgPSByZXF1aXJlKFwic3BpbmFsLWNvcmUtY29ubmVjdG9yanNcIik7XG5jb25zdCBnbG9iYWxUeXBlID0gdHlwZW9mIHdpbmRvdyA9PT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHdpbmRvdztcblxuaW1wb3J0IHtcbiAgVXRpbGl0aWVzXG59IGZyb20gXCIuL1V0aWxpdGllc1wiO1xuXG5cblxuLyoqXG4gKlxuICpcbiAqIEBjbGFzcyBTcGluYWxBcHBsaWNhdGlvblxuICogQGV4dGVuZHMge01vZGVsfVxuICovXG5jbGFzcyBTcGluYWxBcHBsaWNhdGlvbiBleHRlbmRzIGdsb2JhbFR5cGUuTW9kZWwge1xuICAvKipcbiAgICpDcmVhdGVzIGFuIGluc3RhbmNlIG9mIFNwaW5hbEFwcGxpY2F0aW9uLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0ge3N0cmluZ1tdfSByZWxhdGlvbnNUeXBlc0xzdFxuICAgKiBAcGFyYW0ge1NwaW5hbEdyYXBofSByZWxhdGVkR3JhcGhcbiAgICogQHBhcmFtIHtzdHJpbmd9IFtuYW1lPVwiU3BpbmFsQXBwbGljYXRpb25cIl1cbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBjb25zdHJ1Y3RvcihfbmFtZSwgcmVsYXRpb25zVHlwZXNMc3QsIHJlbGF0ZWRHcmFwaCwgbmFtZSA9XG4gICAgXCJTcGluYWxBcHBsaWNhdGlvblwiKSB7XG4gICAgc3VwZXIoKTtcbiAgICBpZiAoRmlsZVN5c3RlbS5fc2lnX3NlcnZlcikge1xuICAgICAgdGhpcy5hZGRfYXR0cih7XG4gICAgICAgIG5hbWU6IF9uYW1lLFxuICAgICAgICB0eXBlOiBcIlwiLFxuICAgICAgICByZWxhdGlvbnNUeXBlc0xzdDogcmVsYXRpb25zVHlwZXNMc3QsXG4gICAgICAgIHJlbGF0aW9uc0J5VHlwZTogbmV3IE1vZGVsKCksXG4gICAgICAgIHJlbGF0aW9uc0xzdDogbmV3IExzdCgpLFxuICAgICAgICByZWxhdGVkR3JhcGg6IHJlbGF0ZWRHcmFwaFxuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgcmVzZXJ2ZVVuaXF1ZVJlbGF0aW9uVHlwZShyZWxhdGlvblR5cGUpIHtcbiAgICB0aGlzLnJlbGF0ZWRHcmFwaC5yZXNlcnZlVW5pcXVlUmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSwgdGhpcylcbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBhZGRSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlKSB7XG4gICAgaWYgKCF0aGlzLnJlbGF0ZWRHcmFwaC5pc1Jlc2VydmVkKHJlbGF0aW9uVHlwZSkpIHtcbiAgICAgIGlmICghVXRpbGl0aWVzLmNvbnRhaW5zTHN0KHRoaXMucmVsYXRpb25zVHlwZXNMc3QsXG4gICAgICAgICAgcmVsYXRpb25UeXBlKSkge1xuICAgICAgICB0aGlzLnJlbGF0aW9uc1R5cGVzTHN0LnB1c2gocmVsYXRpb25UeXBlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIHJlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGlzIHJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgdGhpcy5yZXNlcnZlZFJlbGF0aW9uc05hbWVzW3JlbGF0aW9uVHlwZV1cbiAgICAgICk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyB0aGUgZWxlbWVudCB0byBiaW5kIHdpdGhcbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBnZXRDaGFyYWN0ZXJpc3RpY0VsZW1lbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVsYXRpb25zTHN0O1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbFJlbGF0aW9ufSByZWxhdGlvblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGFkZFJlbGF0aW9uKHJlbGF0aW9uKSB7XG4gICAgaWYgKCF0aGlzLnJlbGF0ZWRHcmFwaC5pc1Jlc2VydmVkKHJlbGF0aW9uLnR5cGUuZ2V0KCkpKSB7XG4gICAgICB0aGlzLmFkZFJlbGF0aW9uVHlwZShyZWxhdGlvbi50eXBlLmdldCgpKTtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5yZWxhdGlvbnNCeVR5cGVbcmVsYXRpb24udHlwZS5nZXQoKV0gPT09XG4gICAgICAgIFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgbGV0IGxpc3QgPSBuZXcgTHN0KClcbiAgICAgICAgbGlzdC5wdXNoKHJlbGF0aW9uKVxuICAgICAgICB0aGlzLnJlbGF0aW9uc0J5VHlwZS5hZGRfYXR0cih7XG4gICAgICAgICAgW3JlbGF0aW9uLnR5cGUuZ2V0KCldOiBsaXN0XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZWxhdGlvbnNCeVR5cGVbcmVsYXRpb24udHlwZS5nZXQoKV0ucHVzaChyZWxhdGlvbilcbiAgICAgIH1cbiAgICAgIHRoaXMucmVsYXRpb25zTHN0LnB1c2gocmVsYXRpb24pXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICByZWxhdGlvbi50eXBlLmdldCgpICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb24udHlwZS5nZXQoKV1cbiAgICAgICk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBcbiAgICogY2hlY2sgaWYgdGhlIGFwcGxpY2F0aW9uIGRlY2xhcmVkIGEgcmVsYXRpb24gdHlwZSBcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgaGFzUmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSkge1xuICAgIGlmIChVdGlsaXRpZXMuY29udGFpbnNMc3QodGhpcy5yZWxhdGlvbnNUeXBlc0xzdCwgcmVsYXRpb25UeXBlKSlcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4odGhpcy5uYW1lLmdldCgpICsgXCIgaGFzIG5vdCBkZWNsYXJlZCBcIiArIHJlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGFzIG9uZSBvZiBpdHMgcmVsYXRpb24gVHlwZXMuXCIpO1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKiBjaGVjayBpZiB0aGUgYXBwbGljYXRpb24gY3JlYXRlZCB0aGlzIGtpbmQgb2YgcmVsYXRpb24gVHlwZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBoYXNSZWxhdGlvblR5cGVEZWZpbmVkKHJlbGF0aW9uVHlwZSkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5yZWxhdGlvbnNCeVR5cGVbcmVsYXRpb25UeXBlXSAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oXCJyZWxhdGlvbiBcIiArIHJlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGlzIG5vdCBkZWZpbmVkIGZvciBhcHAgXCIgKyB0aGlzLm5hbWUuZ2V0KCkpO1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBhbGwgcmVsYXRpb25zIG9mIHRoZSBzcGVjaWZpZWQgdHlwZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGdldFJlbGF0aW9uc0J5VHlwZShyZWxhdGlvblR5cGUpIHtcbiAgICBpZiAodGhpcy5oYXNSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlKSAmJiB0aGlzLmhhc1JlbGF0aW9uVHlwZURlZmluZWQoXG4gICAgICAgIHJlbGF0aW9uVHlwZSkpXG4gICAgICByZXR1cm4gdGhpcy5yZWxhdGlvbnNCeVR5cGVbcmVsYXRpb25UeXBlXVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBbXVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyBhbGwgcmVsYXRpb25zIHJlbGF0ZWQgd2l0aCB0aGlzIGFwcGxpY2F0aW9uXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgZ2V0UmVsYXRpb25zKCkge1xuICAgIHJldHVybiB0aGlzLnJlbGF0aW9uc0xzdDtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxOb2RlfSBub2RlXG4gICAqIEByZXR1cm5zIGFsbCByZWxhdGlvbnMgcmVsYXRlZCB3aXRoIGEgbm9kZSBmb3IgdGhpcyBhcHBsaWNhdGlvblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGdldFJlbGF0aW9uc0J5Tm9kZShub2RlKSB7XG4gICAgaWYgKG5vZGUuaGFzQXBwRGVmaW5lZCh0aGlzLm5hbWUuZ2V0KCkpKVxuICAgICAgcmV0dXJuIG5vZGUuZ2V0UmVsYXRpb25zQnlBcHBOYW1lKHRoaXMubmFtZS5nZXQoKSlcbiAgICBlbHNlIHJldHVybiBbXVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGV9IG5vZGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBhbGwgcmVsYXRpb25zIG9mIGEgc3BlY2lmaWMgdHlwZSByZWxhdGVkIHdpdGggYSBub2RlIGZvciB0aGlzIGFwcGxpY2F0aW9uXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgZ2V0UmVsYXRpb25zQnlOb2RlQnlUeXBlKG5vZGUsIHJlbGF0aW9uVHlwZSkge1xuICAgIHJldHVybiBub2RlLmdldFJlbGF0aW9uc0J5QXBwTmFtZUJ5VHlwZSh0aGlzLm5hbWUuZ2V0KCksIHJlbGF0aW9uVHlwZSlcbiAgfVxuICAvKipcbiAgICpyZXR1cm5zIHRoZSBub2RlcyBvZiB0aGUgc3lzdGVtIHN1Y2ggYXMgQklNRWxlbWVudE5vZGVzXG4gICAsIEFic3RyYWN0Tm9kZXMgZnJvbSBSZWxhdGlvbiBOb2RlTGlzdDFcbiAgICpcbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBnZXRDZW5yYWxOb2RlcygpIHtcbiAgICBsZXQgcmVzID0gwqAgW11cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlbGF0aW9uc0xzdC5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgcmVsYXRpb24gPSByZWxhdGlvbnNMc3RbaV07XG4gICAgICBsZXQgbm9kZUxpc3QxID0gcmVsYXRpb24uZ2V0Tm9kZUxpc3QxKClcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbm9kZUxpc3QxLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBub2RlTGlzdDFbal07XG4gICAgICAgIHJlcy5wdXNoKG5vZGUpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgYWxsIEJJTUVsZW1lbnQgb3IgQWJzdHJhY3RFbGVtZW50IE5vZGVzIChpbiBOb2RlTGlzdDEpXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgZ2V0Q2VucmFsTm9kZXNCeVJlbGF0aW9uVHlwZShyZWxhdGlvblR5cGUpIHtcbiAgICBsZXQgcmVzID0gwqAgW11cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlbGF0aW9uc0J5VHlwZVtyZWxhdGlvblR5cGVdLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCByZWxhdGlvbiA9IHJlbGF0aW9uc0J5VHlwZVtyZWxhdGlvblR5cGVdW2ldO1xuICAgICAgbGV0IG5vZGVMaXN0MSA9IHJlbGF0aW9uLmdldE5vZGVMaXN0MSgpXG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG5vZGVMaXN0MS5sZW5ndGg7IGorKykge1xuICAgICAgICBjb25zdCBub2RlID0gbm9kZUxpc3QxW2pdO1xuICAgICAgICByZXMucHVzaChub2RlKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cblxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgIEEgcHJvbWlzZSBvZiBhbGwgQklNRWxlbWVudCBvciBBYnN0cmFjdEVsZW1lbnQgKGluIE5vZGVMaXN0MSlcbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBhc3luYyBnZXRDZW5yYWxOb2Rlc0VsZW1lbnRzKCkge1xuICAgIGxldCByZXMgPSDCoCBbXVxuICAgIGxldCBjZW50cmFsTm9kZXMgPSB0aGlzLmdldENlbnJhbE5vZGVzKClcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgY2VudHJhbE5vZGVzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgY2VudHJhbE5vZGUgPSBjZW50cmFsTm9kZXNbaW5kZXhdO1xuICAgICAgcmVzLnB1c2goYXdhaXQgVXRpbGl0aWVzLnByb21pc2VMb2FkKGNlbnRyYWxOb2RlLmVsZW1lbnQpKVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSBvZiBhbGwgQklNRWxlbWVudCBvciBBYnN0cmFjdEVsZW1lbnQgKGluIE5vZGVMaXN0MSkgb2YgYSBzcGVjaWZpYyB0eXBlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgYXN5bmMgZ2V0Q2VucmFsTm9kZXNFbGVtZW50c0J5UmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSkge1xuICAgIGxldCByZXMgPSDCoCBbXVxuICAgIGxldCBjZW50cmFsTm9kZXMgPSB0aGlzLmdldENlbnJhbE5vZGVzQnlSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlKVxuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBjZW50cmFsTm9kZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCBjZW50cmFsTm9kZSA9IGNlbnRyYWxOb2Rlc1tpbmRleF07XG4gICAgICByZXMucHVzaChhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQoY2VudHJhbE5vZGUuZWxlbWVudCkpXG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGV9IG5vZGVcbiAgICogQHJldHVybnMgQSBwcm9taXNlIG9mIGFsbCBlbGVtZW50cyBvZiAobm9kZUxpc3QyKSBhc3NvY2lhdGVkIHdpdGggYSBzcGVjaWZpYyAoY2VudHJhbClub2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgYXN5bmMgZ2V0QXNzb2NpYXRlZEVsZW1lbnRzQnlOb2RlKG5vZGUpIHtcbiAgICBsZXQgcmVzID0gW11cbiAgICBsZXQgcmVsYXRpb25zID0gdGhpcy5nZXRSZWxhdGlvbnNCeU5vZGUobm9kZSk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZWxhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHJlbGF0aW9uID0gcmVsYXRpb25zW2ldO1xuICAgICAgY29uc3Qgbm9kZUxpc3QyID0gcmVsYXRpb24uZ2V0Tm9kZUxpc3QyKClcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbm9kZUxpc3QyLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBub2RlTGlzdDJbal07XG4gICAgICAgIHJlcy5wdXNoKGF3YWl0IFV0aWxpdGllcy5wcm9taXNlTG9hZChub2RlLmVsZW1lbnQpKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGV9IG5vZGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBBIHByb21pc2Ugb2YgYWxsIGVsZW1lbnRzIG9mIChub2RlTGlzdDIpIGFzc29jaWF0ZWQgd2l0aCBhIHNwZWNpZmljIChjZW50cmFsKW5vZGUgYnkgYSBzcGVjaWZpYyByZWxhdGlvbiB0eXBlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgYXN5bmMgZ2V0QXNzb2NpYXRlZEVsZW1lbnRzQnlOb2RlQnlSZWxhdGlvblR5cGUobm9kZSwgcmVsYXRpb25UeXBlKSB7XG4gICAgbGV0IHJlcyA9IFtdXG4gICAgbGV0IHJlbGF0aW9ucyA9IHRoaXMuZ2V0UmVsYXRpb25zQnlOb2RlQnlUeXBlKG5vZGUsIHJlbGF0aW9uVHlwZSk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZWxhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHJlbGF0aW9uID0gcmVsYXRpb25zW2ldO1xuICAgICAgY29uc3Qgbm9kZUxpc3QyID0gcmVsYXRpb24uZ2V0Tm9kZUxpc3QyKClcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbm9kZUxpc3QyLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBub2RlTGlzdDJbal07XG4gICAgICAgIHJlcy5wdXNoKGF3YWl0IFV0aWxpdGllcy5wcm9taXNlTG9hZChub2RlLmVsZW1lbnQpKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cblxufVxuZXhwb3J0IGRlZmF1bHQgU3BpbmFsQXBwbGljYXRpb247XG5zcGluYWxDb3JlLnJlZ2lzdGVyX21vZGVscyhbU3BpbmFsQXBwbGljYXRpb25dKSJdfQ==