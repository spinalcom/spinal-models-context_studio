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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TcGluYWxBcHBsaWNhdGlvbi5qcyJdLCJuYW1lcyI6WyJzcGluYWxDb3JlIiwicmVxdWlyZSIsImdsb2JhbFR5cGUiLCJ3aW5kb3ciLCJnbG9iYWwiLCJTcGluYWxBcHBsaWNhdGlvbiIsIk1vZGVsIiwiY29uc3RydWN0b3IiLCJfbmFtZSIsInJlbGF0aW9uc1R5cGVzTHN0IiwicmVsYXRlZEdyYXBoIiwibmFtZSIsIkZpbGVTeXN0ZW0iLCJfc2lnX3NlcnZlciIsImFkZF9hdHRyIiwidHlwZSIsInJlbGF0aW9uc0J5VHlwZSIsInJlbGF0aW9uc0xzdCIsIkxzdCIsInJlc2VydmVVbmlxdWVSZWxhdGlvblR5cGUiLCJyZWxhdGlvblR5cGUiLCJzZXRTdGFydGluZ05vZGUiLCJub2RlIiwic3RhcnRpbmdOb2RlIiwiYXBwcyIsImdldCIsImFkZFJlbGF0aW9uVHlwZSIsImlzUmVzZXJ2ZWQiLCJVdGlsaXRpZXMiLCJjb250YWluc0xzdCIsInB1c2giLCJjb25zb2xlIiwibG9nIiwicmVzZXJ2ZWRSZWxhdGlvbnNOYW1lcyIsImdldENoYXJhY3RlcmlzdGljRWxlbWVudCIsImFkZFJlbGF0aW9uIiwicmVsYXRpb24iLCJsaXN0IiwiaGFzUmVsYXRpb25UeXBlIiwid2FybiIsImhhc1JlbGF0aW9uVHlwZURlZmluZWQiLCJnZXRSZWxhdGlvbnNCeVR5cGUiLCJnZXRSZWxhdGlvbnMiLCJnZXRSZWxhdGlvbnNCeU5vZGUiLCJoYXNBcHBEZWZpbmVkIiwiZ2V0UmVsYXRpb25zQnlBcHBOYW1lIiwiZ2V0UmVsYXRpb25zQnlOb2RlQnlUeXBlIiwiZ2V0UmVsYXRpb25zQnlBcHBOYW1lQnlUeXBlIiwiZ2V0Q2VucmFsTm9kZXMiLCJyZXMiLCJpIiwibGVuZ3RoIiwibm9kZUxpc3QxIiwiZ2V0Tm9kZUxpc3QxIiwiaiIsImdldENlbnJhbE5vZGVzQnlSZWxhdGlvblR5cGUiLCJnZXRDZW5yYWxOb2Rlc0VsZW1lbnRzIiwiY2VudHJhbE5vZGVzIiwiaW5kZXgiLCJjZW50cmFsTm9kZSIsInByb21pc2VMb2FkIiwiZWxlbWVudCIsImdldENlbnJhbE5vZGVzRWxlbWVudHNCeVJlbGF0aW9uVHlwZSIsImdldEFzc29jaWF0ZWRFbGVtZW50c0J5Tm9kZSIsInJlbGF0aW9ucyIsIm5vZGVMaXN0MiIsImdldE5vZGVMaXN0MiIsImdldEFzc29jaWF0ZWRFbGVtZW50c0J5Tm9kZUJ5UmVsYXRpb25UeXBlIiwiZ2V0UmVsYXRpb25UeXBlcyIsImdldFVzZWRSZWxhdGlvblR5cGVzIiwib25seURpcmVjdGVkIiwiaXNEaXJlY3RlZCIsImdldE5vdFVzZWRSZWxhdGlvblR5cGVzIiwicmVnaXN0ZXJfbW9kZWxzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFHQTs7QUFIQSxNQUFNQSxhQUFhQyxRQUFRLHlCQUFSLENBQW5CO0FBQ0EsTUFBTUMsYUFBYSxPQUFPQyxNQUFQLEtBQWtCLFdBQWxCLEdBQWdDQyxNQUFoQyxHQUF5Q0QsTUFBNUQ7O0FBSUE7Ozs7OztBQU1BLE1BQU1FLGlCQUFOLFNBQWdDSCxXQUFXSSxLQUEzQyxDQUFpRDtBQUMvQzs7Ozs7Ozs7QUFRQUMsY0FDRUMsS0FERixFQUVFQyxpQkFGRixFQUdFQyxZQUhGLEVBSUVDLE9BQU8sbUJBSlQsRUFLRTtBQUNBO0FBQ0EsUUFBSUMsV0FBV0MsV0FBZixFQUE0QjtBQUMxQixXQUFLQyxRQUFMLENBQWM7QUFDWkgsY0FBTUgsS0FETTtBQUVaTyxjQUFNLEVBRk07QUFHWk4sMkJBQW1CQSxpQkFIUDtBQUlaTyx5QkFBaUIsSUFBSVYsS0FBSixFQUpMO0FBS1pXLHNCQUFjLElBQUlDLEdBQUosRUFMRjtBQU1aUixzQkFBY0E7QUFORixPQUFkO0FBUUQ7QUFDRjtBQUNEOzs7Ozs7QUFNQVMsNEJBQTBCQyxZQUExQixFQUF3QztBQUN0QyxTQUFLVixZQUFMLENBQWtCUyx5QkFBbEIsQ0FBNENDLFlBQTVDLEVBQTBELElBQTFEO0FBQ0Q7QUFDRDs7Ozs7O0FBTUFDLGtCQUFnQkMsSUFBaEIsRUFBc0I7QUFDcEIsUUFB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R0FBUDtBQUNEO0FBQ0Q7Ozs7OztBQU1BdUIsNEJBQTBCO0FBQ3hCLFFBQUl2QixNQUFNLEVBQVY7QUFDQSxTQUFLLElBQUlTLFFBQVEsQ0FBakIsRUFBb0JBLFFBQVEsS0FBS2pELGlCQUFMLENBQXVCMEMsTUFBbkQsRUFBMkRPLE9BQTNELEVBQW9FO0FBQ2xFLFlBQU10QyxlQUFlLEtBQUtYLGlCQUFMLENBQXVCaUQsS0FBdkIsQ0FBckI7QUFDQSxVQUFJLE9BQU8sS0FBSzFDLGVBQUwsQ0FBcUJJLFlBQXJCLENBQVAsS0FBOEMsV0FBbEQsRUFBK0Q7QUFDN0Q2QixZQUFJbkIsSUFBSixDQUFTVixZQUFUO0FBQ0Q7QUFDRjtBQUNELFdBQU82QixHQUFQO0FBQ0Q7QUF2VzhDO2tCQXlXbEM1QyxpQjs7QUFDZkwsV0FBV3lFLGVBQVgsQ0FBMkIsQ0FBQ3BFLGlCQUFELENBQTNCIiwiZmlsZSI6IlNwaW5hbEFwcGxpY2F0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3Qgc3BpbmFsQ29yZSA9IHJlcXVpcmUoXCJzcGluYWwtY29yZS1jb25uZWN0b3Jqc1wiKTtcbmNvbnN0IGdsb2JhbFR5cGUgPSB0eXBlb2Ygd2luZG93ID09PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogd2luZG93O1xuXG5pbXBvcnQgeyBVdGlsaXRpZXMgfSBmcm9tIFwiLi9VdGlsaXRpZXNcIjtcblxuLyoqXG4gKlxuICpcbiAqIEBjbGFzcyBTcGluYWxBcHBsaWNhdGlvblxuICogQGV4dGVuZHMge01vZGVsfVxuICovXG5jbGFzcyBTcGluYWxBcHBsaWNhdGlvbiBleHRlbmRzIGdsb2JhbFR5cGUuTW9kZWwge1xuICAvKipcbiAgICpDcmVhdGVzIGFuIGluc3RhbmNlIG9mIFNwaW5hbEFwcGxpY2F0aW9uLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0ge3N0cmluZ1tdfSByZWxhdGlvbnNUeXBlc0xzdFxuICAgKiBAcGFyYW0ge1NwaW5hbEdyYXBofSByZWxhdGVkR3JhcGhcbiAgICogQHBhcmFtIHtzdHJpbmd9IFtuYW1lPVwiU3BpbmFsQXBwbGljYXRpb25cIl1cbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBfbmFtZSxcbiAgICByZWxhdGlvbnNUeXBlc0xzdCxcbiAgICByZWxhdGVkR3JhcGgsXG4gICAgbmFtZSA9IFwiU3BpbmFsQXBwbGljYXRpb25cIlxuICApIHtcbiAgICBzdXBlcigpO1xuICAgIGlmIChGaWxlU3lzdGVtLl9zaWdfc2VydmVyKSB7XG4gICAgICB0aGlzLmFkZF9hdHRyKHtcbiAgICAgICAgbmFtZTogX25hbWUsXG4gICAgICAgIHR5cGU6IFwiXCIsXG4gICAgICAgIHJlbGF0aW9uc1R5cGVzTHN0OiByZWxhdGlvbnNUeXBlc0xzdCxcbiAgICAgICAgcmVsYXRpb25zQnlUeXBlOiBuZXcgTW9kZWwoKSxcbiAgICAgICAgcmVsYXRpb25zTHN0OiBuZXcgTHN0KCksXG4gICAgICAgIHJlbGF0ZWRHcmFwaDogcmVsYXRlZEdyYXBoXG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICByZXNlcnZlVW5pcXVlUmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSkge1xuICAgIHRoaXMucmVsYXRlZEdyYXBoLnJlc2VydmVVbmlxdWVSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlLCB0aGlzKTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxOb2RlfSBub2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgc2V0U3RhcnRpbmdOb2RlKG5vZGUpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMuc3RhcnRpbmdOb2RlID09PSBcInVuZGVmaW5lZFwiKVxuICAgICAgdGhpcy5hZGRfYXR0cih7XG4gICAgICAgIHN0YXJ0aW5nTm9kZTogbm9kZVxuICAgICAgfSk7XG4gICAgZWxzZSB0aGlzLnN0YXJ0aW5nTm9kZSA9IG5vZGU7XG5cbiAgICBub2RlLmFwcHMuYWRkX2F0dHIoe1xuICAgICAgW3RoaXMubmFtZS5nZXQoKV06IG5ldyBNb2RlbCgpXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGFkZFJlbGF0aW9uVHlwZShyZWxhdGlvblR5cGUpIHtcbiAgICBpZiAoIXRoaXMucmVsYXRlZEdyYXBoLmlzUmVzZXJ2ZWQocmVsYXRpb25UeXBlKSkge1xuICAgICAgaWYgKCFVdGlsaXRpZXMuY29udGFpbnNMc3QodGhpcy5yZWxhdGlvbnNUeXBlc0xzdCwgcmVsYXRpb25UeXBlKSkge1xuICAgICAgICB0aGlzLnJlbGF0aW9uc1R5cGVzTHN0LnB1c2gocmVsYXRpb25UeXBlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIHJlbGF0aW9uVHlwZSArXG4gICAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICAgIHRoaXMucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvblR5cGVdXG4gICAgICApO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgdGhlIGVsZW1lbnQgdG8gYmluZCB3aXRoXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgZ2V0Q2hhcmFjdGVyaXN0aWNFbGVtZW50KCkge1xuICAgIHJldHVybiB0aGlzLnJlbGF0aW9uc0xzdDtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbn0gcmVsYXRpb25cbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBhZGRSZWxhdGlvbihyZWxhdGlvbikge1xuICAgIGlmICghdGhpcy5yZWxhdGVkR3JhcGguaXNSZXNlcnZlZChyZWxhdGlvbi50eXBlLmdldCgpKSkge1xuICAgICAgdGhpcy5hZGRSZWxhdGlvblR5cGUocmVsYXRpb24udHlwZS5nZXQoKSk7XG4gICAgICBpZiAodHlwZW9mIHRoaXMucmVsYXRpb25zQnlUeXBlW3JlbGF0aW9uLnR5cGUuZ2V0KCldID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGxldCBsaXN0ID0gbmV3IExzdCgpO1xuICAgICAgICBsaXN0LnB1c2gocmVsYXRpb24pO1xuICAgICAgICB0aGlzLnJlbGF0aW9uc0J5VHlwZS5hZGRfYXR0cih7XG4gICAgICAgICAgW3JlbGF0aW9uLnR5cGUuZ2V0KCldOiBsaXN0XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZWxhdGlvbnNCeVR5cGVbcmVsYXRpb24udHlwZS5nZXQoKV0ucHVzaChyZWxhdGlvbik7XG4gICAgICB9XG4gICAgICB0aGlzLnJlbGF0aW9uc0xzdC5wdXNoKHJlbGF0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIHJlbGF0aW9uLnR5cGUuZ2V0KCkgK1xuICAgICAgICAgIFwiIGlzIHJlc2VydmVkIGJ5IFwiICtcbiAgICAgICAgICB0aGlzLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb24udHlwZS5nZXQoKV1cbiAgICAgICk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKiBjaGVjayBpZiB0aGUgYXBwbGljYXRpb24gZGVjbGFyZWQgYSByZWxhdGlvbiB0eXBlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgYm9vbGVhblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGhhc1JlbGF0aW9uVHlwZShyZWxhdGlvblR5cGUpIHtcbiAgICBpZiAoVXRpbGl0aWVzLmNvbnRhaW5zTHN0KHRoaXMucmVsYXRpb25zVHlwZXNMc3QsIHJlbGF0aW9uVHlwZSkpXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICBlbHNlIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgdGhpcy5uYW1lLmdldCgpICtcbiAgICAgICAgICBcIiBoYXMgbm90IGRlY2xhcmVkIFwiICtcbiAgICAgICAgICByZWxhdGlvblR5cGUgK1xuICAgICAgICAgIFwiIGFzIG9uZSBvZiBpdHMgcmVsYXRpb24gVHlwZXMuXCJcbiAgICAgICk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKlxuICAgKiBjaGVjayBpZiB0aGUgYXBwbGljYXRpb24gY3JlYXRlZCB0aGlzIGtpbmQgb2YgcmVsYXRpb24gVHlwZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBoYXNSZWxhdGlvblR5cGVEZWZpbmVkKHJlbGF0aW9uVHlwZSkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5yZWxhdGlvbnNCeVR5cGVbcmVsYXRpb25UeXBlXSAhPT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuIHRydWU7XG4gICAgZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgIFwicmVsYXRpb24gXCIgK1xuICAgICAgICAgIHJlbGF0aW9uVHlwZSArXG4gICAgICAgICAgXCIgaXMgbm90IGRlZmluZWQgZm9yIGFwcCBcIiArXG4gICAgICAgICAgdGhpcy5uYW1lLmdldCgpXG4gICAgICApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEByZXR1cm5zIGFsbCByZWxhdGlvbnMgb2YgdGhlIHNwZWNpZmllZCB0eXBlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgZ2V0UmVsYXRpb25zQnlUeXBlKHJlbGF0aW9uVHlwZSkge1xuICAgIGlmIChcbiAgICAgIHRoaXMuaGFzUmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSkgJiZcbiAgICAgIHRoaXMuaGFzUmVsYXRpb25UeXBlRGVmaW5lZChyZWxhdGlvblR5cGUpXG4gICAgKVxuICAgICAgcmV0dXJuIHRoaXMucmVsYXRpb25zQnlUeXBlW3JlbGF0aW9uVHlwZV07XG4gICAgZWxzZSByZXR1cm4gW107XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEByZXR1cm5zIGFsbCByZWxhdGlvbnMgcmVsYXRlZCB3aXRoIHRoaXMgYXBwbGljYXRpb25cbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBnZXRSZWxhdGlvbnMoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVsYXRpb25zTHN0O1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGV9IG5vZGVcbiAgICogQHJldHVybnMgYWxsIHJlbGF0aW9ucyByZWxhdGVkIHdpdGggYSBub2RlIGZvciB0aGlzIGFwcGxpY2F0aW9uXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgZ2V0UmVsYXRpb25zQnlOb2RlKG5vZGUpIHtcbiAgICBpZiAobm9kZS5oYXNBcHBEZWZpbmVkKHRoaXMubmFtZS5nZXQoKSkpXG4gICAgICByZXR1cm4gbm9kZS5nZXRSZWxhdGlvbnNCeUFwcE5hbWUodGhpcy5uYW1lLmdldCgpKTtcbiAgICBlbHNlIHJldHVybiBbXTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxOb2RlfSBub2RlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgYWxsIHJlbGF0aW9ucyBvZiBhIHNwZWNpZmljIHR5cGUgcmVsYXRlZCB3aXRoIGEgbm9kZSBmb3IgdGhpcyBhcHBsaWNhdGlvblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGdldFJlbGF0aW9uc0J5Tm9kZUJ5VHlwZShub2RlLCByZWxhdGlvblR5cGUpIHtcbiAgICByZXR1cm4gbm9kZS5nZXRSZWxhdGlvbnNCeUFwcE5hbWVCeVR5cGUodGhpcy5uYW1lLmdldCgpLCByZWxhdGlvblR5cGUpO1xuICB9XG4gIC8qKlxuICAgKnJldHVybnMgdGhlIG5vZGVzIG9mIHRoZSBzeXN0ZW0gc3VjaCBhcyBCSU1FbGVtZW50Tm9kZXNcbiAgICwgQWJzdHJhY3ROb2RlcyBmcm9tIFJlbGF0aW9uIE5vZGVMaXN0MVxuICAgKlxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGdldENlbnJhbE5vZGVzKCkge1xuICAgIGxldCByZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucmVsYXRpb25zTHN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCByZWxhdGlvbiA9IHRoaXMucmVsYXRpb25zTHN0W2ldO1xuICAgICAgbGV0IG5vZGVMaXN0MSA9IHJlbGF0aW9uLmdldE5vZGVMaXN0MSgpO1xuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBub2RlTGlzdDEubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVMaXN0MVtqXTtcbiAgICAgICAgcmVzLnB1c2gobm9kZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgYWxsIEJJTUVsZW1lbnQgb3IgQWJzdHJhY3RFbGVtZW50IE5vZGVzIChpbiBOb2RlTGlzdDEpXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgZ2V0Q2VucmFsTm9kZXNCeVJlbGF0aW9uVHlwZShyZWxhdGlvblR5cGUpIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnJlbGF0aW9uc0J5VHlwZVtyZWxhdGlvblR5cGVdLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCByZWxhdGlvbiA9IHRoaXMucmVsYXRpb25zQnlUeXBlW3JlbGF0aW9uVHlwZV1baV07XG4gICAgICBsZXQgbm9kZUxpc3QxID0gcmVsYXRpb24uZ2V0Tm9kZUxpc3QxKCk7XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG5vZGVMaXN0MS5sZW5ndGg7IGorKykge1xuICAgICAgICBjb25zdCBub2RlID0gbm9kZUxpc3QxW2pdO1xuICAgICAgICByZXMucHVzaChub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyAgQSBwcm9taXNlIG9mIGFsbCBCSU1FbGVtZW50IG9yIEFic3RyYWN0RWxlbWVudCAoaW4gTm9kZUxpc3QxKVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGFzeW5jIGdldENlbnJhbE5vZGVzRWxlbWVudHMoKSB7XG4gICAgbGV0IHJlcyA9IFtdO1xuICAgIGxldCBjZW50cmFsTm9kZXMgPSB0aGlzLmdldENlbnJhbE5vZGVzKCk7XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGNlbnRyYWxOb2Rlcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IGNlbnRyYWxOb2RlID0gY2VudHJhbE5vZGVzW2luZGV4XTtcbiAgICAgIHJlcy5wdXNoKGF3YWl0IFV0aWxpdGllcy5wcm9taXNlTG9hZChjZW50cmFsTm9kZS5lbGVtZW50KSk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgQSBwcm9taXNlIG9mIGFsbCBCSU1FbGVtZW50IG9yIEFic3RyYWN0RWxlbWVudCAoaW4gTm9kZUxpc3QxKSBvZiBhIHNwZWNpZmljIHR5cGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBhc3luYyBnZXRDZW5yYWxOb2Rlc0VsZW1lbnRzQnlSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlKSB7XG4gICAgbGV0IHJlcyA9IFtdO1xuICAgIGxldCBjZW50cmFsTm9kZXMgPSB0aGlzLmdldENlbnJhbE5vZGVzQnlSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlKTtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgY2VudHJhbE5vZGVzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgY2VudHJhbE5vZGUgPSBjZW50cmFsTm9kZXNbaW5kZXhdO1xuICAgICAgcmVzLnB1c2goYXdhaXQgVXRpbGl0aWVzLnByb21pc2VMb2FkKGNlbnRyYWxOb2RlLmVsZW1lbnQpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGV9IG5vZGVcbiAgICogQHJldHVybnMgQSBwcm9taXNlIG9mIGFsbCBlbGVtZW50cyBvZiAobm9kZUxpc3QyKSBhc3NvY2lhdGVkIHdpdGggYSBzcGVjaWZpYyAoY2VudHJhbClub2RlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgYXN5bmMgZ2V0QXNzb2NpYXRlZEVsZW1lbnRzQnlOb2RlKG5vZGUpIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgbGV0IHJlbGF0aW9ucyA9IHRoaXMuZ2V0UmVsYXRpb25zQnlOb2RlKG5vZGUpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVsYXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCByZWxhdGlvbiA9IHJlbGF0aW9uc1tpXTtcbiAgICAgIGNvbnN0IG5vZGVMaXN0MiA9IHJlbGF0aW9uLmdldE5vZGVMaXN0MigpO1xuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBub2RlTGlzdDIubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVMaXN0MltqXTtcbiAgICAgICAgcmVzLnB1c2goYXdhaXQgVXRpbGl0aWVzLnByb21pc2VMb2FkKG5vZGUuZWxlbWVudCkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGV9IG5vZGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBBIHByb21pc2Ugb2YgYWxsIGVsZW1lbnRzIG9mIChub2RlTGlzdDIpIGFzc29jaWF0ZWQgd2l0aCBhIHNwZWNpZmljIChjZW50cmFsKW5vZGUgYnkgYSBzcGVjaWZpYyByZWxhdGlvbiB0eXBlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgYXN5bmMgZ2V0QXNzb2NpYXRlZEVsZW1lbnRzQnlOb2RlQnlSZWxhdGlvblR5cGUobm9kZSwgcmVsYXRpb25UeXBlKSB7XG4gICAgbGV0IHJlcyA9IFtdO1xuICAgIGxldCByZWxhdGlvbnMgPSB0aGlzLmdldFJlbGF0aW9uc0J5Tm9kZUJ5VHlwZShub2RlLCByZWxhdGlvblR5cGUpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVsYXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCByZWxhdGlvbiA9IHJlbGF0aW9uc1tpXTtcbiAgICAgIGNvbnN0IG5vZGVMaXN0MiA9IHJlbGF0aW9uLmdldE5vZGVMaXN0MigpO1xuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBub2RlTGlzdDIubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVMaXN0MltqXTtcbiAgICAgICAgcmVzLnB1c2goYXdhaXQgVXRpbGl0aWVzLnByb21pc2VMb2FkKG5vZGUuZWxlbWVudCkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKiBAcmV0dXJucyBhbiBhcnJheSBvZiByZWxhdGlvbiB0eXBlc1xuICAgKlxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGdldFJlbGF0aW9uVHlwZXMoKSB7XG4gICAgbGV0IHJlcyA9IFtdO1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLnJlbGF0aW9uc1R5cGVzTHN0Lmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMucmVsYXRpb25zVHlwZXNMc3RbaW5kZXhdO1xuICAgICAgcmVzLnB1c2goZWxlbWVudCk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cblxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtib29sZWFufSBvbmx5RGlyZWN0ZWRcbiAgICogQHJldHVybnMgYW4gYXJyYXkgb2YgcmVsYXRpb24gdHlwZXMgdGhhdCBhcmUgcmVhbGx5IHVzZWRcbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBnZXRVc2VkUmVsYXRpb25UeXBlcyhvbmx5RGlyZWN0ZWQpIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMucmVsYXRpb25zVHlwZXNMc3QubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCByZWxhdGlvblR5cGUgPSB0aGlzLnJlbGF0aW9uc1R5cGVzTHN0W2luZGV4XTtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5yZWxhdGlvbnNCeVR5cGVbcmVsYXRpb25UeXBlXSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBsZXQgcmVsYXRpb24gPSB0aGlzLnJlbGF0aW9uc0J5VHlwZVtyZWxhdGlvblR5cGVdWzBdO1xuICAgICAgICBpZiAob25seURpcmVjdGVkKSB7XG4gICAgICAgICAgaWYgKHJlbGF0aW9uLmlzRGlyZWN0ZWQuZ2V0KCkpIHtcbiAgICAgICAgICAgIHJlcy5wdXNoKHJlbGF0aW9uVHlwZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgcmVzLnB1c2gocmVsYXRpb25UeXBlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgYW4gYXJyYXkgb2YgcmVsYXRpb24gdHlwZXMgdGhhdCBhcmUgbmV2ZXIgdXNlZCBpbiB0aGlzIGFwcGxpY2F0aW9uXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgZ2V0Tm90VXNlZFJlbGF0aW9uVHlwZXMoKSB7XG4gICAgbGV0IHJlcyA9IFtdO1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLnJlbGF0aW9uc1R5cGVzTHN0Lmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgcmVsYXRpb25UeXBlID0gdGhpcy5yZWxhdGlvbnNUeXBlc0xzdFtpbmRleF07XG4gICAgICBpZiAodHlwZW9mIHRoaXMucmVsYXRpb25zQnlUeXBlW3JlbGF0aW9uVHlwZV0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgcmVzLnB1c2gocmVsYXRpb25UeXBlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxufVxuZXhwb3J0IGRlZmF1bHQgU3BpbmFsQXBwbGljYXRpb247XG5zcGluYWxDb3JlLnJlZ2lzdGVyX21vZGVscyhbU3BpbmFsQXBwbGljYXRpb25dKTtcbiJdfQ==