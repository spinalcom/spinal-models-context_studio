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
        relatedGraphPtr: new Ptr(relatedGraph)
      });
      this.relatedGraph = relatedGraph;
    }

    if (typeof this.relatedGraph == "undefined") var interval = setInterval(() => {
      if (typeof this.relatedGraphPtr !== "undefined") {
        this.relatedGraphPtr.load(t => {
          this.relatedGraph = t;
          clearInterval(interval);
        });
      }
    }, 100);
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
  addRelation(relation, argRelatedGraph = null) {
    if (!argRelatedGraph) argRelatedGraph = this.relatedGraph;

    if (!argRelatedGraph.isReserved(relation.type.get())) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TcGluYWxBcHBsaWNhdGlvbi5qcyJdLCJuYW1lcyI6WyJzcGluYWxDb3JlIiwicmVxdWlyZSIsImdsb2JhbFR5cGUiLCJ3aW5kb3ciLCJnbG9iYWwiLCJTcGluYWxBcHBsaWNhdGlvbiIsIk1vZGVsIiwiY29uc3RydWN0b3IiLCJfbmFtZSIsInJlbGF0aW9uc1R5cGVzTHN0IiwicmVsYXRlZEdyYXBoIiwibmFtZSIsIkZpbGVTeXN0ZW0iLCJfc2lnX3NlcnZlciIsImFkZF9hdHRyIiwidHlwZSIsInJlbGF0aW9uc0J5VHlwZSIsInJlbGF0aW9uc0xzdCIsIkxzdCIsInJlbGF0ZWRHcmFwaFB0ciIsIlB0ciIsImludGVydmFsIiwic2V0SW50ZXJ2YWwiLCJsb2FkIiwidCIsImNsZWFySW50ZXJ2YWwiLCJyZXNlcnZlVW5pcXVlUmVsYXRpb25UeXBlIiwicmVsYXRpb25UeXBlIiwic2V0U3RhcnRpbmdOb2RlIiwibm9kZSIsInN0YXJ0aW5nTm9kZSIsImFwcHMiLCJnZXQiLCJhZGRSZWxhdGlvblR5cGUiLCJpc1Jlc2VydmVkIiwiVXRpbGl0aWVzIiwiY29udGFpbnNMc3QiLCJwdXNoIiwiY29uc29sZSIsImxvZyIsInJlc2VydmVkUmVsYXRpb25zTmFtZXMiLCJnZXRDaGFyYWN0ZXJpc3RpY0VsZW1lbnQiLCJhZGRSZWxhdGlvbiIsInJlbGF0aW9uIiwiYXJnUmVsYXRlZEdyYXBoIiwibGlzdCIsImhhc1JlbGF0aW9uVHlwZSIsIndhcm4iLCJoYXNSZWxhdGlvblR5cGVEZWZpbmVkIiwiZ2V0UmVsYXRpb25zQnlUeXBlIiwiZ2V0UmVsYXRpb25zIiwiZ2V0UmVsYXRpb25zQnlOb2RlIiwiaGFzQXBwRGVmaW5lZCIsImdldFJlbGF0aW9uc0J5QXBwTmFtZSIsImdldFJlbGF0aW9uc0J5Tm9kZUJ5VHlwZSIsImdldFJlbGF0aW9uc0J5QXBwTmFtZUJ5VHlwZSIsImdldENlbnJhbE5vZGVzIiwicmVzIiwiaSIsImxlbmd0aCIsIm5vZGVMaXN0MSIsImdldE5vZGVMaXN0MSIsImoiLCJnZXRDZW5yYWxOb2Rlc0J5UmVsYXRpb25UeXBlIiwiZ2V0Q2VucmFsTm9kZXNFbGVtZW50cyIsImNlbnRyYWxOb2RlcyIsImluZGV4IiwiY2VudHJhbE5vZGUiLCJwcm9taXNlTG9hZCIsImVsZW1lbnQiLCJnZXRDZW5yYWxOb2Rlc0VsZW1lbnRzQnlSZWxhdGlvblR5cGUiLCJnZXRBc3NvY2lhdGVkRWxlbWVudHNCeU5vZGUiLCJyZWxhdGlvbnMiLCJub2RlTGlzdDIiLCJnZXROb2RlTGlzdDIiLCJnZXRBc3NvY2lhdGVkRWxlbWVudHNCeU5vZGVCeVJlbGF0aW9uVHlwZSIsImdldFJlbGF0aW9uVHlwZXMiLCJnZXRVc2VkUmVsYXRpb25UeXBlcyIsIm9ubHlEaXJlY3RlZCIsImlzRGlyZWN0ZWQiLCJnZXROb3RVc2VkUmVsYXRpb25UeXBlcyIsInJlZ2lzdGVyX21vZGVscyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBR0E7O0FBSEEsTUFBTUEsYUFBYUMsUUFBUSx5QkFBUixDQUFuQjtBQUNBLE1BQU1DLGFBQWEsT0FBT0MsTUFBUCxLQUFrQixXQUFsQixHQUFnQ0MsTUFBaEMsR0FBeUNELE1BQTVEOztBQU1BOzs7Ozs7QUFNQSxNQUFNRSxpQkFBTixTQUFnQ0gsV0FBV0ksS0FBM0MsQ0FBaUQ7QUFDL0M7Ozs7Ozs7O0FBUUFDLGNBQ0VDLEtBREYsRUFFRUMsaUJBRkYsRUFHRUMsWUFIRixFQUlFQyxPQUFPLG1CQUpULEVBS0U7QUFDQTtBQUNBLFFBQUlDLFdBQVdDLFdBQWYsRUFBNEI7QUFDMUIsV0FBS0MsUUFBTCxDQUFjO0FBQ1pILGNBQU1ILEtBRE07QUFFWk8sY0FBTSxFQUZNO0FBR1pOLDJCQUFtQkEsaUJBSFA7QUFJWk8seUJBQWlCLElBQUlWLEtBQUosRUFKTDtBQUtaVyxzQkFBYyxJQUFJQyxHQUFKLEVBTEY7QUFNWkMseUJBQWlCLElBQUlDLEdBQUosQ0FBUVYsWUFBUjtBQU5MLE9BQWQ7QUFRQSxXQUFLQSxZQUFMLEdBQW9CQSxZQUFwQjtBQUNEOztB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IjpbImNvbnN0IHNwaW5hbENvcmUgPSByZXF1aXJlKFwic3BpbmFsLWNvcmUtY29ubmVjdG9yanNcIik7XG5jb25zdCBnbG9iYWxUeXBlID0gdHlwZW9mIHdpbmRvdyA9PT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHdpbmRvdztcblxuaW1wb3J0IHtcbiAgVXRpbGl0aWVzXG59IGZyb20gXCIuL1V0aWxpdGllc1wiO1xuXG4vKipcbiAqXG4gKlxuICogQGNsYXNzIFNwaW5hbEFwcGxpY2F0aW9uXG4gKiBAZXh0ZW5kcyB7TW9kZWx9XG4gKi9cbmNsYXNzIFNwaW5hbEFwcGxpY2F0aW9uIGV4dGVuZHMgZ2xvYmFsVHlwZS5Nb2RlbCB7XG4gIC8qKlxuICAgKkNyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgU3BpbmFsQXBwbGljYXRpb24uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nW119IHJlbGF0aW9uc1R5cGVzTHN0XG4gICAqIEBwYXJhbSB7U3BpbmFsR3JhcGh9IHJlbGF0ZWRHcmFwaFxuICAgKiBAcGFyYW0ge3N0cmluZ30gW25hbWU9XCJTcGluYWxBcHBsaWNhdGlvblwiXVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIF9uYW1lLFxuICAgIHJlbGF0aW9uc1R5cGVzTHN0LFxuICAgIHJlbGF0ZWRHcmFwaCxcbiAgICBuYW1lID0gXCJTcGluYWxBcHBsaWNhdGlvblwiXG4gICkge1xuICAgIHN1cGVyKCk7XG4gICAgaWYgKEZpbGVTeXN0ZW0uX3NpZ19zZXJ2ZXIpIHtcbiAgICAgIHRoaXMuYWRkX2F0dHIoe1xuICAgICAgICBuYW1lOiBfbmFtZSxcbiAgICAgICAgdHlwZTogXCJcIixcbiAgICAgICAgcmVsYXRpb25zVHlwZXNMc3Q6IHJlbGF0aW9uc1R5cGVzTHN0LFxuICAgICAgICByZWxhdGlvbnNCeVR5cGU6IG5ldyBNb2RlbCgpLFxuICAgICAgICByZWxhdGlvbnNMc3Q6IG5ldyBMc3QoKSxcbiAgICAgICAgcmVsYXRlZEdyYXBoUHRyOiBuZXcgUHRyKHJlbGF0ZWRHcmFwaCksXG4gICAgICB9KTtcbiAgICAgIHRoaXMucmVsYXRlZEdyYXBoID0gcmVsYXRlZEdyYXBoO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgdGhpcy5yZWxhdGVkR3JhcGggPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgIHZhciBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0ZWRHcmFwaFB0ciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgIHRoaXMucmVsYXRlZEdyYXBoUHRyLmxvYWQodCA9PiB7XG4gICAgICAgICAgICB0aGlzLnJlbGF0ZWRHcmFwaCA9IHQ7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsKVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0sIDEwMCk7XG4gIH1cblxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIHJlc2VydmVVbmlxdWVSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlKSB7XG4gICAgdGhpcy5yZWxhdGVkR3JhcGgucmVzZXJ2ZVVuaXF1ZVJlbGF0aW9uVHlwZShyZWxhdGlvblR5cGUsIHRoaXMpO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGV9IG5vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBzZXRTdGFydGluZ05vZGUobm9kZSkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5zdGFydGluZ05vZGUgPT09IFwidW5kZWZpbmVkXCIpXG4gICAgICB0aGlzLmFkZF9hdHRyKHtcbiAgICAgICAgc3RhcnRpbmdOb2RlOiBub2RlXG4gICAgICB9KTtcbiAgICBlbHNlIHRoaXMuc3RhcnRpbmdOb2RlID0gbm9kZTtcblxuICAgIG5vZGUuYXBwcy5hZGRfYXR0cih7XG4gICAgICBbdGhpcy5uYW1lLmdldCgpXTogbmV3IE1vZGVsKClcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgYWRkUmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSkge1xuICAgIGlmICghdGhpcy5yZWxhdGVkR3JhcGguaXNSZXNlcnZlZChyZWxhdGlvblR5cGUpKSB7XG4gICAgICBpZiAoIVV0aWxpdGllcy5jb250YWluc0xzdCh0aGlzLnJlbGF0aW9uc1R5cGVzTHN0LCByZWxhdGlvblR5cGUpKSB7XG4gICAgICAgIHRoaXMucmVsYXRpb25zVHlwZXNMc3QucHVzaChyZWxhdGlvblR5cGUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEByZXR1cm5zIHRoZSBlbGVtZW50IHRvIGJpbmQgd2l0aFxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGdldENoYXJhY3RlcmlzdGljRWxlbWVudCgpIHtcbiAgICByZXR1cm4gdGhpcy5yZWxhdGlvbnNMc3Q7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsUmVsYXRpb259IHJlbGF0aW9uXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgYWRkUmVsYXRpb24ocmVsYXRpb24sIGFyZ1JlbGF0ZWRHcmFwaCA9IG51bGwpIHtcbiAgICBpZiAoIWFyZ1JlbGF0ZWRHcmFwaClcbiAgICAgIGFyZ1JlbGF0ZWRHcmFwaCA9IHRoaXMucmVsYXRlZEdyYXBoO1xuXG4gICAgaWYgKCFhcmdSZWxhdGVkR3JhcGguaXNSZXNlcnZlZChyZWxhdGlvbi50eXBlLmdldCgpKSkge1xuICAgICAgdGhpcy5hZGRSZWxhdGlvblR5cGUocmVsYXRpb24udHlwZS5nZXQoKSk7XG4gICAgICBpZiAodHlwZW9mIHRoaXMucmVsYXRpb25zQnlUeXBlW3JlbGF0aW9uLnR5cGUuZ2V0KCldID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGxldCBsaXN0ID0gbmV3IExzdCgpO1xuICAgICAgICBsaXN0LnB1c2gocmVsYXRpb24pO1xuICAgICAgICB0aGlzLnJlbGF0aW9uc0J5VHlwZS5hZGRfYXR0cih7XG4gICAgICAgICAgW3JlbGF0aW9uLnR5cGUuZ2V0KCldOiBsaXN0XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZWxhdGlvbnNCeVR5cGVbcmVsYXRpb24udHlwZS5nZXQoKV0ucHVzaChyZWxhdGlvbik7XG4gICAgICB9XG4gICAgICB0aGlzLnJlbGF0aW9uc0xzdC5wdXNoKHJlbGF0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIHJlbGF0aW9uLnR5cGUuZ2V0KCkgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvbi50eXBlLmdldCgpXVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqIGNoZWNrIGlmIHRoZSBhcHBsaWNhdGlvbiBkZWNsYXJlZCBhIHJlbGF0aW9uIHR5cGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgaGFzUmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSkge1xuICAgIGlmIChVdGlsaXRpZXMuY29udGFpbnNMc3QodGhpcy5yZWxhdGlvbnNUeXBlc0xzdCwgcmVsYXRpb25UeXBlKSlcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICB0aGlzLm5hbWUuZ2V0KCkgK1xuICAgICAgICBcIiBoYXMgbm90IGRlY2xhcmVkIFwiICtcbiAgICAgICAgcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgYXMgb25lIG9mIGl0cyByZWxhdGlvbiBUeXBlcy5cIlxuICAgICAgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqIGNoZWNrIGlmIHRoZSBhcHBsaWNhdGlvbiBjcmVhdGVkIHRoaXMga2luZCBvZiByZWxhdGlvbiBUeXBlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgYm9vbGVhblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGhhc1JlbGF0aW9uVHlwZURlZmluZWQocmVsYXRpb25UeXBlKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0aW9uc0J5VHlwZVtyZWxhdGlvblR5cGVdICE9PSBcInVuZGVmaW5lZFwiKSByZXR1cm4gdHJ1ZTtcbiAgICBlbHNlIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgXCJyZWxhdGlvbiBcIiArXG4gICAgICAgIHJlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGlzIG5vdCBkZWZpbmVkIGZvciBhcHAgXCIgK1xuICAgICAgICB0aGlzLm5hbWUuZ2V0KClcbiAgICAgICk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgYWxsIHJlbGF0aW9ucyBvZiB0aGUgc3BlY2lmaWVkIHR5cGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBnZXRSZWxhdGlvbnNCeVR5cGUocmVsYXRpb25UeXBlKSB7XG4gICAgaWYgKFxuICAgICAgdGhpcy5oYXNSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlKSAmJlxuICAgICAgdGhpcy5oYXNSZWxhdGlvblR5cGVEZWZpbmVkKHJlbGF0aW9uVHlwZSlcbiAgICApXG4gICAgICByZXR1cm4gdGhpcy5yZWxhdGlvbnNCeVR5cGVbcmVsYXRpb25UeXBlXTtcbiAgICBlbHNlIHJldHVybiBbXTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgYWxsIHJlbGF0aW9ucyByZWxhdGVkIHdpdGggdGhpcyBhcHBsaWNhdGlvblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGdldFJlbGF0aW9ucygpIHtcbiAgICByZXR1cm4gdGhpcy5yZWxhdGlvbnNMc3Q7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZX0gbm9kZVxuICAgKiBAcmV0dXJucyBhbGwgcmVsYXRpb25zIHJlbGF0ZWQgd2l0aCBhIG5vZGUgZm9yIHRoaXMgYXBwbGljYXRpb25cbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBnZXRSZWxhdGlvbnNCeU5vZGUobm9kZSkge1xuICAgIGlmIChub2RlLmhhc0FwcERlZmluZWQodGhpcy5uYW1lLmdldCgpKSlcbiAgICAgIHJldHVybiBub2RlLmdldFJlbGF0aW9uc0J5QXBwTmFtZSh0aGlzLm5hbWUuZ2V0KCkpO1xuICAgIGVsc2UgcmV0dXJuIFtdO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGV9IG5vZGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBhbGwgcmVsYXRpb25zIG9mIGEgc3BlY2lmaWMgdHlwZSByZWxhdGVkIHdpdGggYSBub2RlIGZvciB0aGlzIGFwcGxpY2F0aW9uXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgZ2V0UmVsYXRpb25zQnlOb2RlQnlUeXBlKG5vZGUsIHJlbGF0aW9uVHlwZSkge1xuICAgIHJldHVybiBub2RlLmdldFJlbGF0aW9uc0J5QXBwTmFtZUJ5VHlwZSh0aGlzLm5hbWUuZ2V0KCksIHJlbGF0aW9uVHlwZSk7XG4gIH1cbiAgLyoqXG4gICAqcmV0dXJucyB0aGUgbm9kZXMgb2YgdGhlIHN5c3RlbSBzdWNoIGFzIEJJTUVsZW1lbnROb2Rlc1xuICAgLCBBYnN0cmFjdE5vZGVzIGZyb20gUmVsYXRpb24gTm9kZUxpc3QxXG4gICAqXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgZ2V0Q2VucmFsTm9kZXMoKSB7XG4gICAgbGV0IHJlcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5yZWxhdGlvbnNMc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHJlbGF0aW9uID0gdGhpcy5yZWxhdGlvbnNMc3RbaV07XG4gICAgICBsZXQgbm9kZUxpc3QxID0gcmVsYXRpb24uZ2V0Tm9kZUxpc3QxKCk7XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG5vZGVMaXN0MS5sZW5ndGg7IGorKykge1xuICAgICAgICBjb25zdCBub2RlID0gbm9kZUxpc3QxW2pdO1xuICAgICAgICByZXMucHVzaChub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBhbGwgQklNRWxlbWVudCBvciBBYnN0cmFjdEVsZW1lbnQgTm9kZXMgKGluIE5vZGVMaXN0MSlcbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBnZXRDZW5yYWxOb2Rlc0J5UmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSkge1xuICAgIGxldCByZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucmVsYXRpb25zQnlUeXBlW3JlbGF0aW9uVHlwZV0ubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHJlbGF0aW9uID0gdGhpcy5yZWxhdGlvbnNCeVR5cGVbcmVsYXRpb25UeXBlXVtpXTtcbiAgICAgIGxldCBub2RlTGlzdDEgPSByZWxhdGlvbi5nZXROb2RlTGlzdDEoKTtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbm9kZUxpc3QxLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBub2RlTGlzdDFbal07XG4gICAgICAgIHJlcy5wdXNoKG5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEByZXR1cm5zICBBIHByb21pc2Ugb2YgYWxsIEJJTUVsZW1lbnQgb3IgQWJzdHJhY3RFbGVtZW50IChpbiBOb2RlTGlzdDEpXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgYXN5bmMgZ2V0Q2VucmFsTm9kZXNFbGVtZW50cygpIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgbGV0IGNlbnRyYWxOb2RlcyA9IHRoaXMuZ2V0Q2VucmFsTm9kZXMoKTtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgY2VudHJhbE5vZGVzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgY2VudHJhbE5vZGUgPSBjZW50cmFsTm9kZXNbaW5kZXhdO1xuICAgICAgcmVzLnB1c2goYXdhaXQgVXRpbGl0aWVzLnByb21pc2VMb2FkKGNlbnRyYWxOb2RlLmVsZW1lbnQpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBBIHByb21pc2Ugb2YgYWxsIEJJTUVsZW1lbnQgb3IgQWJzdHJhY3RFbGVtZW50IChpbiBOb2RlTGlzdDEpIG9mIGEgc3BlY2lmaWMgdHlwZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGFzeW5jIGdldENlbnJhbE5vZGVzRWxlbWVudHNCeVJlbGF0aW9uVHlwZShyZWxhdGlvblR5cGUpIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgbGV0IGNlbnRyYWxOb2RlcyA9IHRoaXMuZ2V0Q2VucmFsTm9kZXNCeVJlbGF0aW9uVHlwZShyZWxhdGlvblR5cGUpO1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBjZW50cmFsTm9kZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCBjZW50cmFsTm9kZSA9IGNlbnRyYWxOb2Rlc1tpbmRleF07XG4gICAgICByZXMucHVzaChhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQoY2VudHJhbE5vZGUuZWxlbWVudCkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZX0gbm9kZVxuICAgKiBAcmV0dXJucyBBIHByb21pc2Ugb2YgYWxsIGVsZW1lbnRzIG9mIChub2RlTGlzdDIpIGFzc29jaWF0ZWQgd2l0aCBhIHNwZWNpZmljIChjZW50cmFsKW5vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBhc3luYyBnZXRBc3NvY2lhdGVkRWxlbWVudHNCeU5vZGUobm9kZSkge1xuICAgIGxldCByZXMgPSBbXTtcbiAgICBsZXQgcmVsYXRpb25zID0gdGhpcy5nZXRSZWxhdGlvbnNCeU5vZGUobm9kZSk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZWxhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHJlbGF0aW9uID0gcmVsYXRpb25zW2ldO1xuICAgICAgY29uc3Qgbm9kZUxpc3QyID0gcmVsYXRpb24uZ2V0Tm9kZUxpc3QyKCk7XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG5vZGVMaXN0Mi5sZW5ndGg7IGorKykge1xuICAgICAgICBjb25zdCBub2RlID0gbm9kZUxpc3QyW2pdO1xuICAgICAgICByZXMucHVzaChhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQobm9kZS5lbGVtZW50KSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZX0gbm9kZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSBvZiBhbGwgZWxlbWVudHMgb2YgKG5vZGVMaXN0MikgYXNzb2NpYXRlZCB3aXRoIGEgc3BlY2lmaWMgKGNlbnRyYWwpbm9kZSBieSBhIHNwZWNpZmljIHJlbGF0aW9uIHR5cGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBhc3luYyBnZXRBc3NvY2lhdGVkRWxlbWVudHNCeU5vZGVCeVJlbGF0aW9uVHlwZShub2RlLCByZWxhdGlvblR5cGUpIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgbGV0IHJlbGF0aW9ucyA9IHRoaXMuZ2V0UmVsYXRpb25zQnlOb2RlQnlUeXBlKG5vZGUsIHJlbGF0aW9uVHlwZSk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZWxhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHJlbGF0aW9uID0gcmVsYXRpb25zW2ldO1xuICAgICAgY29uc3Qgbm9kZUxpc3QyID0gcmVsYXRpb24uZ2V0Tm9kZUxpc3QyKCk7XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG5vZGVMaXN0Mi5sZW5ndGg7IGorKykge1xuICAgICAgICBjb25zdCBub2RlID0gbm9kZUxpc3QyW2pdO1xuICAgICAgICByZXMucHVzaChhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQobm9kZS5lbGVtZW50KSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqIEByZXR1cm5zIGFuIGFycmF5IG9mIHJlbGF0aW9uIHR5cGVzXG4gICAqXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgZ2V0UmVsYXRpb25UeXBlcygpIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMucmVsYXRpb25zVHlwZXNMc3QubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5yZWxhdGlvbnNUeXBlc0xzdFtpbmRleF07XG4gICAgICByZXMucHVzaChlbGVtZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IG9ubHlEaXJlY3RlZFxuICAgKiBAcmV0dXJucyBhbiBhcnJheSBvZiByZWxhdGlvbiB0eXBlcyB0aGF0IGFyZSByZWFsbHkgdXNlZFxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGdldFVzZWRSZWxhdGlvblR5cGVzKG9ubHlEaXJlY3RlZCkge1xuICAgIGxldCByZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5yZWxhdGlvbnNUeXBlc0xzdC5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IHJlbGF0aW9uVHlwZSA9IHRoaXMucmVsYXRpb25zVHlwZXNMc3RbaW5kZXhdO1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0aW9uc0J5VHlwZVtyZWxhdGlvblR5cGVdICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGxldCByZWxhdGlvbiA9IHRoaXMucmVsYXRpb25zQnlUeXBlW3JlbGF0aW9uVHlwZV1bMF07XG4gICAgICAgIGlmIChvbmx5RGlyZWN0ZWQpIHtcbiAgICAgICAgICBpZiAocmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKSkge1xuICAgICAgICAgICAgcmVzLnB1c2gocmVsYXRpb25UeXBlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSByZXMucHVzaChyZWxhdGlvblR5cGUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyBhbiBhcnJheSBvZiByZWxhdGlvbiB0eXBlcyB0aGF0IGFyZSBuZXZlciB1c2VkIGluIHRoaXMgYXBwbGljYXRpb25cbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBnZXROb3RVc2VkUmVsYXRpb25UeXBlcygpIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMucmVsYXRpb25zVHlwZXNMc3QubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCByZWxhdGlvblR5cGUgPSB0aGlzLnJlbGF0aW9uc1R5cGVzTHN0W2luZGV4XTtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5yZWxhdGlvbnNCeVR5cGVbcmVsYXRpb25UeXBlXSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICByZXMucHVzaChyZWxhdGlvblR5cGUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG59XG5leHBvcnQgZGVmYXVsdCBTcGluYWxBcHBsaWNhdGlvbjtcbnNwaW5hbENvcmUucmVnaXN0ZXJfbW9kZWxzKFtTcGluYWxBcHBsaWNhdGlvbl0pOyJdfQ==