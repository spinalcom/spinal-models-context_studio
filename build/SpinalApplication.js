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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TcGluYWxBcHBsaWNhdGlvbi5qcyJdLCJuYW1lcyI6WyJzcGluYWxDb3JlIiwicmVxdWlyZSIsImdsb2JhbFR5cGUiLCJ3aW5kb3ciLCJnbG9iYWwiLCJTcGluYWxBcHBsaWNhdGlvbiIsIk1vZGVsIiwiY29uc3RydWN0b3IiLCJfbmFtZSIsInJlbGF0aW9uc1R5cGVzTHN0IiwicmVsYXRlZEdyYXBoIiwibmFtZSIsIkZpbGVTeXN0ZW0iLCJfc2lnX3NlcnZlciIsImFkZF9hdHRyIiwidHlwZSIsInJlbGF0aW9uc0J5VHlwZSIsInJlbGF0aW9uc0xzdCIsIkxzdCIsInJlc2VydmVVbmlxdWVSZWxhdGlvblR5cGUiLCJyZWxhdGlvblR5cGUiLCJzZXRTdGFydGluZ05vZGUiLCJub2RlIiwic3RhcnRpbmdOb2RlIiwiYWRkUmVsYXRpb25UeXBlIiwiaXNSZXNlcnZlZCIsIlV0aWxpdGllcyIsImNvbnRhaW5zTHN0IiwicHVzaCIsImNvbnNvbGUiLCJsb2ciLCJyZXNlcnZlZFJlbGF0aW9uc05hbWVzIiwiZ2V0Q2hhcmFjdGVyaXN0aWNFbGVtZW50IiwiYWRkUmVsYXRpb24iLCJyZWxhdGlvbiIsImdldCIsImxpc3QiLCJoYXNSZWxhdGlvblR5cGUiLCJ3YXJuIiwiaGFzUmVsYXRpb25UeXBlRGVmaW5lZCIsImdldFJlbGF0aW9uc0J5VHlwZSIsImdldFJlbGF0aW9ucyIsImdldFJlbGF0aW9uc0J5Tm9kZSIsImhhc0FwcERlZmluZWQiLCJnZXRSZWxhdGlvbnNCeUFwcE5hbWUiLCJnZXRSZWxhdGlvbnNCeU5vZGVCeVR5cGUiLCJnZXRSZWxhdGlvbnNCeUFwcE5hbWVCeVR5cGUiLCJnZXRDZW5yYWxOb2RlcyIsInJlcyIsImkiLCJsZW5ndGgiLCJub2RlTGlzdDEiLCJnZXROb2RlTGlzdDEiLCJqIiwiZ2V0Q2VucmFsTm9kZXNCeVJlbGF0aW9uVHlwZSIsImdldENlbnJhbE5vZGVzRWxlbWVudHMiLCJjZW50cmFsTm9kZXMiLCJpbmRleCIsImNlbnRyYWxOb2RlIiwicHJvbWlzZUxvYWQiLCJlbGVtZW50IiwiZ2V0Q2VucmFsTm9kZXNFbGVtZW50c0J5UmVsYXRpb25UeXBlIiwiZ2V0QXNzb2NpYXRlZEVsZW1lbnRzQnlOb2RlIiwicmVsYXRpb25zIiwibm9kZUxpc3QyIiwiZ2V0Tm9kZUxpc3QyIiwiZ2V0QXNzb2NpYXRlZEVsZW1lbnRzQnlOb2RlQnlSZWxhdGlvblR5cGUiLCJyZWdpc3Rlcl9tb2RlbHMiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUdBOztBQUhBLE1BQU1BLGFBQWFDLFFBQVEseUJBQVIsQ0FBbkI7QUFDQSxNQUFNQyxhQUFhLE9BQU9DLE1BQVAsS0FBa0IsV0FBbEIsR0FBZ0NDLE1BQWhDLEdBQXlDRCxNQUE1RDs7QUFRQTs7Ozs7O0FBTUEsTUFBTUUsaUJBQU4sU0FBZ0NILFdBQVdJLEtBQTNDLENBQWlEO0FBQy9DOzs7Ozs7OztBQVFBQyxjQUFZQyxLQUFaLEVBQW1CQyxpQkFBbkIsRUFBc0NDLFlBQXRDLEVBQW9EQyxPQUNsRCxtQkFERixFQUN1QjtBQUNyQjtBQUNBLFFBQUlDLFdBQVdDLFdBQWYsRUFBNEI7QUFDMUIsV0FBS0MsUUFBTCxDQUFjO0FBQ1pILGNBQU1ILEtBRE07QUFFWk8sY0FBTSxFQUZNO0FBR1pOLDJCQUFtQkEsaUJBSFA7QUFJWk8seUJBQWlCLElBQUlWLEtBQUosRUFKTDtBQUtaVyxzQkFBYyxJQUFJQyxHQUFKLEVBTEY7QUFNWlIsc0JBQWNBO0FBTkYsT0FBZDtBQVFEO0FBQ0Y7QUFDRDs7Ozs7O0FBTUFTLDRCQUEwQkMsWUFBMUIsRUFBd0M7QUFDdEMsU0FBS1YsWUFBTCxDQUFrQlMseUJBQWxCLENBQTRDQyxZQUE1QyxFQUEwRCxJQUExRDtBQUNEO0FBQ0Q7Ozs7OztBQU1BQyxrQkFBZ0JDLElBQWhCLEVBQXNCO0FBQ3BCLFFBQUksT0FBTyxLQUFLQyxZQUFaLEtBQTZCLFdBQWpDLEVBQ0UsS0FBS1QsUUFBTCxDQUFjO0FBQ1pTLG9CQUFjRDtBQURGLEtBQWQsRUFERixLQUtFLEtBQUtDLFlBQUws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QTNCIiwiZmlsZSI6IlNwaW5hbEFwcGxpY2F0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3Qgc3BpbmFsQ29yZSA9IHJlcXVpcmUoXCJzcGluYWwtY29yZS1jb25uZWN0b3Jqc1wiKTtcbmNvbnN0IGdsb2JhbFR5cGUgPSB0eXBlb2Ygd2luZG93ID09PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogd2luZG93O1xuXG5pbXBvcnQge1xuICBVdGlsaXRpZXNcbn0gZnJvbSBcIi4vVXRpbGl0aWVzXCI7XG5cblxuXG4vKipcbiAqXG4gKlxuICogQGNsYXNzIFNwaW5hbEFwcGxpY2F0aW9uXG4gKiBAZXh0ZW5kcyB7TW9kZWx9XG4gKi9cbmNsYXNzIFNwaW5hbEFwcGxpY2F0aW9uIGV4dGVuZHMgZ2xvYmFsVHlwZS5Nb2RlbCB7XG4gIC8qKlxuICAgKkNyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgU3BpbmFsQXBwbGljYXRpb24uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nW119IHJlbGF0aW9uc1R5cGVzTHN0XG4gICAqIEBwYXJhbSB7U3BpbmFsR3JhcGh9IHJlbGF0ZWRHcmFwaFxuICAgKiBAcGFyYW0ge3N0cmluZ30gW25hbWU9XCJTcGluYWxBcHBsaWNhdGlvblwiXVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGNvbnN0cnVjdG9yKF9uYW1lLCByZWxhdGlvbnNUeXBlc0xzdCwgcmVsYXRlZEdyYXBoLCBuYW1lID1cbiAgICBcIlNwaW5hbEFwcGxpY2F0aW9uXCIpIHtcbiAgICBzdXBlcigpO1xuICAgIGlmIChGaWxlU3lzdGVtLl9zaWdfc2VydmVyKSB7XG4gICAgICB0aGlzLmFkZF9hdHRyKHtcbiAgICAgICAgbmFtZTogX25hbWUsXG4gICAgICAgIHR5cGU6IFwiXCIsXG4gICAgICAgIHJlbGF0aW9uc1R5cGVzTHN0OiByZWxhdGlvbnNUeXBlc0xzdCxcbiAgICAgICAgcmVsYXRpb25zQnlUeXBlOiBuZXcgTW9kZWwoKSxcbiAgICAgICAgcmVsYXRpb25zTHN0OiBuZXcgTHN0KCksXG4gICAgICAgIHJlbGF0ZWRHcmFwaDogcmVsYXRlZEdyYXBoXG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICByZXNlcnZlVW5pcXVlUmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSkge1xuICAgIHRoaXMucmVsYXRlZEdyYXBoLnJlc2VydmVVbmlxdWVSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlLCB0aGlzKVxuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGV9IG5vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBzZXRTdGFydGluZ05vZGUobm9kZSkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5zdGFydGluZ05vZGUgPT09IFwidW5kZWZpbmVkXCIpXG4gICAgICB0aGlzLmFkZF9hdHRyKHtcbiAgICAgICAgc3RhcnRpbmdOb2RlOiBub2RlXG4gICAgICB9KVxuICAgIGVsc2VcbiAgICAgIHRoaXMuc3RhcnRpbmdOb2RlID0gbm9kZVxuICB9XG5cblxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGFkZFJlbGF0aW9uVHlwZShyZWxhdGlvblR5cGUpIHtcbiAgICBpZiAoIXRoaXMucmVsYXRlZEdyYXBoLmlzUmVzZXJ2ZWQocmVsYXRpb25UeXBlKSkge1xuICAgICAgaWYgKCFVdGlsaXRpZXMuY29udGFpbnNMc3QodGhpcy5yZWxhdGlvbnNUeXBlc0xzdCxcbiAgICAgICAgICByZWxhdGlvblR5cGUpKSB7XG4gICAgICAgIHRoaXMucmVsYXRpb25zVHlwZXNMc3QucHVzaChyZWxhdGlvblR5cGUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEByZXR1cm5zIHRoZSBlbGVtZW50IHRvIGJpbmQgd2l0aFxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGdldENoYXJhY3RlcmlzdGljRWxlbWVudCgpIHtcbiAgICByZXR1cm4gdGhpcy5yZWxhdGlvbnNMc3Q7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb259IHJlbGF0aW9uXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgYWRkUmVsYXRpb24ocmVsYXRpb24pIHtcbiAgICBpZiAoIXRoaXMucmVsYXRlZEdyYXBoLmlzUmVzZXJ2ZWQocmVsYXRpb24udHlwZS5nZXQoKSkpIHtcbiAgICAgIHRoaXMuYWRkUmVsYXRpb25UeXBlKHJlbGF0aW9uLnR5cGUuZ2V0KCkpO1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0aW9uc0J5VHlwZVtyZWxhdGlvbi50eXBlLmdldCgpXSA9PT1cbiAgICAgICAgXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBsZXQgbGlzdCA9IG5ldyBMc3QoKVxuICAgICAgICBsaXN0LnB1c2gocmVsYXRpb24pXG4gICAgICAgIHRoaXMucmVsYXRpb25zQnlUeXBlLmFkZF9hdHRyKHtcbiAgICAgICAgICBbcmVsYXRpb24udHlwZS5nZXQoKV06IGxpc3RcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJlbGF0aW9uc0J5VHlwZVtyZWxhdGlvbi50eXBlLmdldCgpXS5wdXNoKHJlbGF0aW9uKVxuICAgICAgfVxuICAgICAgdGhpcy5yZWxhdGlvbnNMc3QucHVzaChyZWxhdGlvbilcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIHJlbGF0aW9uLnR5cGUuZ2V0KCkgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvbi50eXBlLmdldCgpXVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIFxuICAgKiBjaGVjayBpZiB0aGUgYXBwbGljYXRpb24gZGVjbGFyZWQgYSByZWxhdGlvbiB0eXBlIFxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBoYXNSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlKSB7XG4gICAgaWYgKFV0aWxpdGllcy5jb250YWluc0xzdCh0aGlzLnJlbGF0aW9uc1R5cGVzTHN0LCByZWxhdGlvblR5cGUpKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICBlbHNlIHtcbiAgICAgIGNvbnNvbGUud2Fybih0aGlzLm5hbWUuZ2V0KCkgKyBcIiBoYXMgbm90IGRlY2xhcmVkIFwiICsgcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgYXMgb25lIG9mIGl0cyByZWxhdGlvbiBUeXBlcy5cIik7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqIGNoZWNrIGlmIHRoZSBhcHBsaWNhdGlvbiBjcmVhdGVkIHRoaXMga2luZCBvZiByZWxhdGlvbiBUeXBlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgYm9vbGVhblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGhhc1JlbGF0aW9uVHlwZURlZmluZWQocmVsYXRpb25UeXBlKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0aW9uc0J5VHlwZVtyZWxhdGlvblR5cGVdICE9PSBcInVuZGVmaW5lZFwiKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICBlbHNlIHtcbiAgICAgIGNvbnNvbGUud2FybihcInJlbGF0aW9uIFwiICsgcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgaXMgbm90IGRlZmluZWQgZm9yIGFwcCBcIiArIHRoaXMubmFtZS5nZXQoKSk7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEByZXR1cm5zIGFsbCByZWxhdGlvbnMgb2YgdGhlIHNwZWNpZmllZCB0eXBlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgZ2V0UmVsYXRpb25zQnlUeXBlKHJlbGF0aW9uVHlwZSkge1xuICAgIGlmICh0aGlzLmhhc1JlbGF0aW9uVHlwZShyZWxhdGlvblR5cGUpICYmIHRoaXMuaGFzUmVsYXRpb25UeXBlRGVmaW5lZChcbiAgICAgICAgcmVsYXRpb25UeXBlKSlcbiAgICAgIHJldHVybiB0aGlzLnJlbGF0aW9uc0J5VHlwZVtyZWxhdGlvblR5cGVdXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIFtdXG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEByZXR1cm5zIGFsbCByZWxhdGlvbnMgcmVsYXRlZCB3aXRoIHRoaXMgYXBwbGljYXRpb25cbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBnZXRSZWxhdGlvbnMoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVsYXRpb25zTHN0O1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGV9IG5vZGVcbiAgICogQHJldHVybnMgYWxsIHJlbGF0aW9ucyByZWxhdGVkIHdpdGggYSBub2RlIGZvciB0aGlzIGFwcGxpY2F0aW9uXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgZ2V0UmVsYXRpb25zQnlOb2RlKG5vZGUpIHtcbiAgICBpZiAobm9kZS5oYXNBcHBEZWZpbmVkKHRoaXMubmFtZS5nZXQoKSkpXG4gICAgICByZXR1cm4gbm9kZS5nZXRSZWxhdGlvbnNCeUFwcE5hbWUodGhpcy5uYW1lLmdldCgpKVxuICAgIGVsc2UgcmV0dXJuIFtdXG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZX0gbm9kZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEByZXR1cm5zIGFsbCByZWxhdGlvbnMgb2YgYSBzcGVjaWZpYyB0eXBlIHJlbGF0ZWQgd2l0aCBhIG5vZGUgZm9yIHRoaXMgYXBwbGljYXRpb25cbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBnZXRSZWxhdGlvbnNCeU5vZGVCeVR5cGUobm9kZSwgcmVsYXRpb25UeXBlKSB7XG4gICAgcmV0dXJuIG5vZGUuZ2V0UmVsYXRpb25zQnlBcHBOYW1lQnlUeXBlKHRoaXMubmFtZS5nZXQoKSwgcmVsYXRpb25UeXBlKVxuICB9XG4gIC8qKlxuICAgKnJldHVybnMgdGhlIG5vZGVzIG9mIHRoZSBzeXN0ZW0gc3VjaCBhcyBCSU1FbGVtZW50Tm9kZXNcbiAgICwgQWJzdHJhY3ROb2RlcyBmcm9tIFJlbGF0aW9uIE5vZGVMaXN0MVxuICAgKlxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGdldENlbnJhbE5vZGVzKCkge1xuICAgIGxldCByZXMgPSDCoCBbXVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVsYXRpb25zTHN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCByZWxhdGlvbiA9IHJlbGF0aW9uc0xzdFtpXTtcbiAgICAgIGxldCBub2RlTGlzdDEgPSByZWxhdGlvbi5nZXROb2RlTGlzdDEoKVxuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBub2RlTGlzdDEubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVMaXN0MVtqXTtcbiAgICAgICAgcmVzLnB1c2gobm9kZSlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBhbGwgQklNRWxlbWVudCBvciBBYnN0cmFjdEVsZW1lbnQgTm9kZXMgKGluIE5vZGVMaXN0MSlcbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBnZXRDZW5yYWxOb2Rlc0J5UmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSkge1xuICAgIGxldCByZXMgPSDCoCBbXVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVsYXRpb25zQnlUeXBlW3JlbGF0aW9uVHlwZV0ubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHJlbGF0aW9uID0gcmVsYXRpb25zQnlUeXBlW3JlbGF0aW9uVHlwZV1baV07XG4gICAgICBsZXQgbm9kZUxpc3QxID0gcmVsYXRpb24uZ2V0Tm9kZUxpc3QxKClcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbm9kZUxpc3QxLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBub2RlTGlzdDFbal07XG4gICAgICAgIHJlcy5wdXNoKG5vZGUpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyAgQSBwcm9taXNlIG9mIGFsbCBCSU1FbGVtZW50IG9yIEFic3RyYWN0RWxlbWVudCAoaW4gTm9kZUxpc3QxKVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGFzeW5jIGdldENlbnJhbE5vZGVzRWxlbWVudHMoKSB7XG4gICAgbGV0IHJlcyA9IMKgIFtdXG4gICAgbGV0IGNlbnRyYWxOb2RlcyA9IHRoaXMuZ2V0Q2VucmFsTm9kZXMoKVxuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBjZW50cmFsTm9kZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCBjZW50cmFsTm9kZSA9IGNlbnRyYWxOb2Rlc1tpbmRleF07XG4gICAgICByZXMucHVzaChhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQoY2VudHJhbE5vZGUuZWxlbWVudCkpXG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgQSBwcm9taXNlIG9mIGFsbCBCSU1FbGVtZW50IG9yIEFic3RyYWN0RWxlbWVudCAoaW4gTm9kZUxpc3QxKSBvZiBhIHNwZWNpZmljIHR5cGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBhc3luYyBnZXRDZW5yYWxOb2Rlc0VsZW1lbnRzQnlSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlKSB7XG4gICAgbGV0IHJlcyA9IMKgIFtdXG4gICAgbGV0IGNlbnRyYWxOb2RlcyA9IHRoaXMuZ2V0Q2VucmFsTm9kZXNCeVJlbGF0aW9uVHlwZShyZWxhdGlvblR5cGUpXG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGNlbnRyYWxOb2Rlcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IGNlbnRyYWxOb2RlID0gY2VudHJhbE5vZGVzW2luZGV4XTtcbiAgICAgIHJlcy5wdXNoKGF3YWl0IFV0aWxpdGllcy5wcm9taXNlTG9hZChjZW50cmFsTm9kZS5lbGVtZW50KSlcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZX0gbm9kZVxuICAgKiBAcmV0dXJucyBBIHByb21pc2Ugb2YgYWxsIGVsZW1lbnRzIG9mIChub2RlTGlzdDIpIGFzc29jaWF0ZWQgd2l0aCBhIHNwZWNpZmljIChjZW50cmFsKW5vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBhc3luYyBnZXRBc3NvY2lhdGVkRWxlbWVudHNCeU5vZGUobm9kZSkge1xuICAgIGxldCByZXMgPSBbXVxuICAgIGxldCByZWxhdGlvbnMgPSB0aGlzLmdldFJlbGF0aW9uc0J5Tm9kZShub2RlKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlbGF0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgcmVsYXRpb24gPSByZWxhdGlvbnNbaV07XG4gICAgICBjb25zdCBub2RlTGlzdDIgPSByZWxhdGlvbi5nZXROb2RlTGlzdDIoKVxuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBub2RlTGlzdDIubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVMaXN0MltqXTtcbiAgICAgICAgcmVzLnB1c2goYXdhaXQgVXRpbGl0aWVzLnByb21pc2VMb2FkKG5vZGUuZWxlbWVudCkpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZX0gbm9kZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSBvZiBhbGwgZWxlbWVudHMgb2YgKG5vZGVMaXN0MikgYXNzb2NpYXRlZCB3aXRoIGEgc3BlY2lmaWMgKGNlbnRyYWwpbm9kZSBieSBhIHNwZWNpZmljIHJlbGF0aW9uIHR5cGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBhc3luYyBnZXRBc3NvY2lhdGVkRWxlbWVudHNCeU5vZGVCeVJlbGF0aW9uVHlwZShub2RlLCByZWxhdGlvblR5cGUpIHtcbiAgICBsZXQgcmVzID0gW11cbiAgICBsZXQgcmVsYXRpb25zID0gdGhpcy5nZXRSZWxhdGlvbnNCeU5vZGVCeVR5cGUobm9kZSwgcmVsYXRpb25UeXBlKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlbGF0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgcmVsYXRpb24gPSByZWxhdGlvbnNbaV07XG4gICAgICBjb25zdCBub2RlTGlzdDIgPSByZWxhdGlvbi5nZXROb2RlTGlzdDIoKVxuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBub2RlTGlzdDIubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVMaXN0MltqXTtcbiAgICAgICAgcmVzLnB1c2goYXdhaXQgVXRpbGl0aWVzLnByb21pc2VMb2FkKG5vZGUuZWxlbWVudCkpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cblxuXG59XG5leHBvcnQgZGVmYXVsdCBTcGluYWxBcHBsaWNhdGlvbjtcbnNwaW5hbENvcmUucmVnaXN0ZXJfbW9kZWxzKFtTcGluYWxBcHBsaWNhdGlvbl0pIl19