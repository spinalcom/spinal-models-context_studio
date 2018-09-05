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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TcGluYWxBcHBsaWNhdGlvbi5qcyJdLCJuYW1lcyI6WyJzcGluYWxDb3JlIiwicmVxdWlyZSIsImdsb2JhbFR5cGUiLCJ3aW5kb3ciLCJnbG9iYWwiLCJTcGluYWxBcHBsaWNhdGlvbiIsIk1vZGVsIiwiY29uc3RydWN0b3IiLCJfbmFtZSIsInJlbGF0aW9uc1R5cGVzTHN0IiwicmVsYXRlZEdyYXBoIiwibmFtZSIsIkZpbGVTeXN0ZW0iLCJfc2lnX3NlcnZlciIsImFkZF9hdHRyIiwidHlwZSIsInJlbGF0aW9uc0J5VHlwZSIsInJlbGF0aW9uc0xzdCIsIkxzdCIsInJlbGF0ZWRHcmFwaFB0ciIsIlB0ciIsImludGVydmFsIiwic2V0SW50ZXJ2YWwiLCJsb2FkIiwidCIsImNsZWFySW50ZXJ2YWwiLCJyZXNlcnZlVW5pcXVlUmVsYXRpb25UeXBlIiwicmVsYXRpb25UeXBlIiwic2V0U3RhcnRpbmdOb2RlIiwibm9kZSIsInN0YXJ0aW5nTm9kZSIsImFwcHMiLCJnZXQiLCJhZGRSZWxhdGlvblR5cGUiLCJpc1Jlc2VydmVkIiwiVXRpbGl0aWVzIiwiY29udGFpbnNMc3QiLCJwdXNoIiwiY29uc29sZSIsImxvZyIsInJlc2VydmVkUmVsYXRpb25zTmFtZXMiLCJnZXRDaGFyYWN0ZXJpc3RpY0VsZW1lbnQiLCJhZGRSZWxhdGlvbiIsInJlbGF0aW9uIiwibGlzdCIsImhhc1JlbGF0aW9uVHlwZSIsIndhcm4iLCJoYXNSZWxhdGlvblR5cGVEZWZpbmVkIiwiZ2V0UmVsYXRpb25zQnlUeXBlIiwiZ2V0UmVsYXRpb25zIiwiZ2V0UmVsYXRpb25zQnlOb2RlIiwiaGFzQXBwRGVmaW5lZCIsImdldFJlbGF0aW9uc0J5QXBwTmFtZSIsImdldFJlbGF0aW9uc0J5Tm9kZUJ5VHlwZSIsImdldFJlbGF0aW9uc0J5QXBwTmFtZUJ5VHlwZSIsImdldENlbnJhbE5vZGVzIiwicmVzIiwiaSIsImxlbmd0aCIsIm5vZGVMaXN0MSIsImdldE5vZGVMaXN0MSIsImoiLCJnZXRDZW5yYWxOb2Rlc0J5UmVsYXRpb25UeXBlIiwiZ2V0Q2VucmFsTm9kZXNFbGVtZW50cyIsImNlbnRyYWxOb2RlcyIsImluZGV4IiwiY2VudHJhbE5vZGUiLCJwcm9taXNlTG9hZCIsImVsZW1lbnQiLCJnZXRDZW5yYWxOb2Rlc0VsZW1lbnRzQnlSZWxhdGlvblR5cGUiLCJnZXRBc3NvY2lhdGVkRWxlbWVudHNCeU5vZGUiLCJyZWxhdGlvbnMiLCJub2RlTGlzdDIiLCJnZXROb2RlTGlzdDIiLCJnZXRBc3NvY2lhdGVkRWxlbWVudHNCeU5vZGVCeVJlbGF0aW9uVHlwZSIsImdldFJlbGF0aW9uVHlwZXMiLCJnZXRVc2VkUmVsYXRpb25UeXBlcyIsIm9ubHlEaXJlY3RlZCIsImlzRGlyZWN0ZWQiLCJnZXROb3RVc2VkUmVsYXRpb25UeXBlcyIsInJlZ2lzdGVyX21vZGVscyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBR0E7O0FBSEEsTUFBTUEsYUFBYUMsUUFBUSx5QkFBUixDQUFuQjtBQUNBLE1BQU1DLGFBQWEsT0FBT0MsTUFBUCxLQUFrQixXQUFsQixHQUFnQ0MsTUFBaEMsR0FBeUNELE1BQTVEOztBQU1BOzs7Ozs7QUFNQSxNQUFNRSxpQkFBTixTQUFnQ0gsV0FBV0ksS0FBM0MsQ0FBaUQ7QUFDL0M7Ozs7Ozs7O0FBUUFDLGNBQ0VDLEtBREYsRUFFRUMsaUJBRkYsRUFHRUMsWUFIRixFQUlFQyxPQUFPLG1CQUpULEVBS0U7QUFDQTtBQUNBLFFBQUlDLFdBQVdDLFdBQWYsRUFBNEI7QUFDMUIsV0FBS0MsUUFBTCxDQUFjO0FBQ1pILGNBQU1ILEtBRE07QUFFWk8sY0FBTSxFQUZNO0FBR1pOLDJCQUFtQkEsaUJBSFA7QUFJWk8seUJBQWlCLElBQUlWLEtBQUosRUFKTDtBQUtaVyxzQkFBYyxJQUFJQyxHQUFKLEVBTEY7QUFNWkMseUJBQWlCLElBQUlDLEdBQUosQ0FBUVYsWUFBUjtBQU5MLE9BQWQ7QUFRQSxXQUFLQSxZQUFMLEdBQW9CQSxZQUFwQjtBQUNEOztBQUVELFFBQUksT0FBTyxLQUFL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QVEsS0FBS3hELGlCQUFMLENBQXVCaUQsTUFBbkQsRUFBMkRPLE9BQTNELEVBQW9FO0FBQ2xFLFlBQU10QyxlQUFlLEtBQUtsQixpQkFBTCxDQUF1QndELEtBQXZCLENBQXJCO0FBQ0EsVUFBSSxPQUFPLEtBQUtqRCxlQUFMLENBQXFCVyxZQUFyQixDQUFQLEtBQThDLFdBQWxELEVBQStEO0FBQzdELFlBQUlnQixXQUFXLEtBQUszQixlQUFMLENBQXFCVyxZQUFyQixFQUFtQyxDQUFuQyxDQUFmO0FBQ0EsWUFBSWtELFlBQUosRUFBa0I7QUFDaEIsY0FBSWxDLFNBQVNtQyxVQUFULENBQW9COUMsR0FBcEIsRUFBSixFQUErQjtBQUM3QndCLGdCQUFJbkIsSUFBSixDQUFTVixZQUFUO0FBQ0Q7QUFDRixTQUpELE1BSU82QixJQUFJbkIsSUFBSixDQUFTVixZQUFUO0FBQ1I7QUFDRjtBQUNELFdBQU82QixHQUFQO0FBQ0Q7QUFDRDs7Ozs7O0FBTUF1Qiw0QkFBMEI7QUFDeEIsUUFBSXZCLE1BQU0sRUFBVjtBQUNBLFNBQUssSUFBSVMsUUFBUSxDQUFqQixFQUFvQkEsUUFBUSxLQUFLeEQsaUJBQUwsQ0FBdUJpRCxNQUFuRCxFQUEyRE8sT0FBM0QsRUFBb0U7QUFDbEUsWUFBTXRDLGVBQWUsS0FBS2xCLGlCQUFMLENBQXVCd0QsS0FBdkIsQ0FBckI7QUFDQSxVQUFJLE9BQU8sS0FBS2pELGVBQUwsQ0FBcUJXLFlBQXJCLENBQVAsS0FBOEMsV0FBbEQsRUFBK0Q7QUFDN0Q2QixZQUFJbkIsSUFBSixDQUFTVixZQUFUO0FBQ0Q7QUFDRjtBQUNELFdBQU82QixHQUFQO0FBQ0Q7QUFuWDhDO2tCQXFYbENuRCxpQjs7QUFDZkwsV0FBV2dGLGVBQVgsQ0FBMkIsQ0FBQzNFLGlCQUFELENBQTNCIiwiZmlsZSI6IlNwaW5hbEFwcGxpY2F0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3Qgc3BpbmFsQ29yZSA9IHJlcXVpcmUoXCJzcGluYWwtY29yZS1jb25uZWN0b3Jqc1wiKTtcbmNvbnN0IGdsb2JhbFR5cGUgPSB0eXBlb2Ygd2luZG93ID09PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogd2luZG93O1xuXG5pbXBvcnQge1xuICBVdGlsaXRpZXNcbn0gZnJvbSBcIi4vVXRpbGl0aWVzXCI7XG5cbi8qKlxuICpcbiAqXG4gKiBAY2xhc3MgU3BpbmFsQXBwbGljYXRpb25cbiAqIEBleHRlbmRzIHtNb2RlbH1cbiAqL1xuY2xhc3MgU3BpbmFsQXBwbGljYXRpb24gZXh0ZW5kcyBnbG9iYWxUeXBlLk1vZGVsIHtcbiAgLyoqXG4gICAqQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBTcGluYWxBcHBsaWNhdGlvbi5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHBhcmFtIHtzdHJpbmdbXX0gcmVsYXRpb25zVHlwZXNMc3RcbiAgICogQHBhcmFtIHtTcGluYWxHcmFwaH0gcmVsYXRlZEdyYXBoXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbbmFtZT1cIlNwaW5hbEFwcGxpY2F0aW9uXCJdXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgX25hbWUsXG4gICAgcmVsYXRpb25zVHlwZXNMc3QsXG4gICAgcmVsYXRlZEdyYXBoLFxuICAgIG5hbWUgPSBcIlNwaW5hbEFwcGxpY2F0aW9uXCJcbiAgKSB7XG4gICAgc3VwZXIoKTtcbiAgICBpZiAoRmlsZVN5c3RlbS5fc2lnX3NlcnZlcikge1xuICAgICAgdGhpcy5hZGRfYXR0cih7XG4gICAgICAgIG5hbWU6IF9uYW1lLFxuICAgICAgICB0eXBlOiBcIlwiLFxuICAgICAgICByZWxhdGlvbnNUeXBlc0xzdDogcmVsYXRpb25zVHlwZXNMc3QsXG4gICAgICAgIHJlbGF0aW9uc0J5VHlwZTogbmV3IE1vZGVsKCksXG4gICAgICAgIHJlbGF0aW9uc0xzdDogbmV3IExzdCgpLFxuICAgICAgICByZWxhdGVkR3JhcGhQdHI6IG5ldyBQdHIocmVsYXRlZEdyYXBoKSxcbiAgICAgIH0pO1xuICAgICAgdGhpcy5yZWxhdGVkR3JhcGggPSByZWxhdGVkR3JhcGg7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0ZWRHcmFwaCA9PSBcInVuZGVmaW5lZFwiKVxuICAgICAgdmFyIGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMucmVsYXRlZEdyYXBoUHRyICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgdGhpcy5yZWxhdGVkR3JhcGhQdHIubG9hZCh0ID0+IHtcbiAgICAgICAgICAgIHRoaXMucmVsYXRlZEdyYXBoID0gdDtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSwgMTAwKTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgcmVzZXJ2ZVVuaXF1ZVJlbGF0aW9uVHlwZShyZWxhdGlvblR5cGUpIHtcbiAgICB0aGlzLnJlbGF0ZWRHcmFwaC5yZXNlcnZlVW5pcXVlUmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSwgdGhpcyk7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZX0gbm9kZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIHNldFN0YXJ0aW5nTm9kZShub2RlKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnN0YXJ0aW5nTm9kZSA9PT0gXCJ1bmRlZmluZWRcIilcbiAgICAgIHRoaXMuYWRkX2F0dHIoe1xuICAgICAgICBzdGFydGluZ05vZGU6IG5vZGVcbiAgICAgIH0pO1xuICAgIGVsc2UgdGhpcy5zdGFydGluZ05vZGUgPSBub2RlO1xuXG4gICAgbm9kZS5hcHBzLmFkZF9hdHRyKHtcbiAgICAgIFt0aGlzLm5hbWUuZ2V0KCldOiBuZXcgTW9kZWwoKVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBhZGRSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlKSB7XG4gICAgaWYgKCF0aGlzLnJlbGF0ZWRHcmFwaC5pc1Jlc2VydmVkKHJlbGF0aW9uVHlwZSkpIHtcbiAgICAgIGlmICghVXRpbGl0aWVzLmNvbnRhaW5zTHN0KHRoaXMucmVsYXRpb25zVHlwZXNMc3QsIHJlbGF0aW9uVHlwZSkpIHtcbiAgICAgICAgdGhpcy5yZWxhdGlvbnNUeXBlc0xzdC5wdXNoKHJlbGF0aW9uVHlwZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICByZWxhdGlvblR5cGUgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvblR5cGVdXG4gICAgICApO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgdGhlIGVsZW1lbnQgdG8gYmluZCB3aXRoXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgZ2V0Q2hhcmFjdGVyaXN0aWNFbGVtZW50KCkge1xuICAgIHJldHVybiB0aGlzLnJlbGF0aW9uc0xzdDtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtTcGluYWxSZWxhdGlvbn0gcmVsYXRpb25cbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBhZGRSZWxhdGlvbihyZWxhdGlvbikge1xuICAgIGlmICghdGhpcy5yZWxhdGVkR3JhcGguaXNSZXNlcnZlZChyZWxhdGlvbi50eXBlLmdldCgpKSkge1xuICAgICAgdGhpcy5hZGRSZWxhdGlvblR5cGUocmVsYXRpb24udHlwZS5nZXQoKSk7XG4gICAgICBpZiAodHlwZW9mIHRoaXMucmVsYXRpb25zQnlUeXBlW3JlbGF0aW9uLnR5cGUuZ2V0KCldID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGxldCBsaXN0ID0gbmV3IExzdCgpO1xuICAgICAgICBsaXN0LnB1c2gocmVsYXRpb24pO1xuICAgICAgICB0aGlzLnJlbGF0aW9uc0J5VHlwZS5hZGRfYXR0cih7XG4gICAgICAgICAgW3JlbGF0aW9uLnR5cGUuZ2V0KCldOiBsaXN0XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZWxhdGlvbnNCeVR5cGVbcmVsYXRpb24udHlwZS5nZXQoKV0ucHVzaChyZWxhdGlvbik7XG4gICAgICB9XG4gICAgICB0aGlzLnJlbGF0aW9uc0xzdC5wdXNoKHJlbGF0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIHJlbGF0aW9uLnR5cGUuZ2V0KCkgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvbi50eXBlLmdldCgpXVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqIGNoZWNrIGlmIHRoZSBhcHBsaWNhdGlvbiBkZWNsYXJlZCBhIHJlbGF0aW9uIHR5cGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgaGFzUmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSkge1xuICAgIGlmIChVdGlsaXRpZXMuY29udGFpbnNMc3QodGhpcy5yZWxhdGlvbnNUeXBlc0xzdCwgcmVsYXRpb25UeXBlKSlcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICB0aGlzLm5hbWUuZ2V0KCkgK1xuICAgICAgICBcIiBoYXMgbm90IGRlY2xhcmVkIFwiICtcbiAgICAgICAgcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgYXMgb25lIG9mIGl0cyByZWxhdGlvbiBUeXBlcy5cIlxuICAgICAgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqIGNoZWNrIGlmIHRoZSBhcHBsaWNhdGlvbiBjcmVhdGVkIHRoaXMga2luZCBvZiByZWxhdGlvbiBUeXBlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgYm9vbGVhblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGhhc1JlbGF0aW9uVHlwZURlZmluZWQocmVsYXRpb25UeXBlKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0aW9uc0J5VHlwZVtyZWxhdGlvblR5cGVdICE9PSBcInVuZGVmaW5lZFwiKSByZXR1cm4gdHJ1ZTtcbiAgICBlbHNlIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgXCJyZWxhdGlvbiBcIiArXG4gICAgICAgIHJlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGlzIG5vdCBkZWZpbmVkIGZvciBhcHAgXCIgK1xuICAgICAgICB0aGlzLm5hbWUuZ2V0KClcbiAgICAgICk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvblR5cGVcbiAgICogQHJldHVybnMgYWxsIHJlbGF0aW9ucyBvZiB0aGUgc3BlY2lmaWVkIHR5cGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBnZXRSZWxhdGlvbnNCeVR5cGUocmVsYXRpb25UeXBlKSB7XG4gICAgaWYgKFxuICAgICAgdGhpcy5oYXNSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlKSAmJlxuICAgICAgdGhpcy5oYXNSZWxhdGlvblR5cGVEZWZpbmVkKHJlbGF0aW9uVHlwZSlcbiAgICApXG4gICAgICByZXR1cm4gdGhpcy5yZWxhdGlvbnNCeVR5cGVbcmVsYXRpb25UeXBlXTtcbiAgICBlbHNlIHJldHVybiBbXTtcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgYWxsIHJlbGF0aW9ucyByZWxhdGVkIHdpdGggdGhpcyBhcHBsaWNhdGlvblxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGdldFJlbGF0aW9ucygpIHtcbiAgICByZXR1cm4gdGhpcy5yZWxhdGlvbnNMc3Q7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZX0gbm9kZVxuICAgKiBAcmV0dXJucyBhbGwgcmVsYXRpb25zIHJlbGF0ZWQgd2l0aCBhIG5vZGUgZm9yIHRoaXMgYXBwbGljYXRpb25cbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBnZXRSZWxhdGlvbnNCeU5vZGUobm9kZSkge1xuICAgIGlmIChub2RlLmhhc0FwcERlZmluZWQodGhpcy5uYW1lLmdldCgpKSlcbiAgICAgIHJldHVybiBub2RlLmdldFJlbGF0aW9uc0J5QXBwTmFtZSh0aGlzLm5hbWUuZ2V0KCkpO1xuICAgIGVsc2UgcmV0dXJuIFtdO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge1NwaW5hbE5vZGV9IG5vZGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBhbGwgcmVsYXRpb25zIG9mIGEgc3BlY2lmaWMgdHlwZSByZWxhdGVkIHdpdGggYSBub2RlIGZvciB0aGlzIGFwcGxpY2F0aW9uXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgZ2V0UmVsYXRpb25zQnlOb2RlQnlUeXBlKG5vZGUsIHJlbGF0aW9uVHlwZSkge1xuICAgIHJldHVybiBub2RlLmdldFJlbGF0aW9uc0J5QXBwTmFtZUJ5VHlwZSh0aGlzLm5hbWUuZ2V0KCksIHJlbGF0aW9uVHlwZSk7XG4gIH1cbiAgLyoqXG4gICAqcmV0dXJucyB0aGUgbm9kZXMgb2YgdGhlIHN5c3RlbSBzdWNoIGFzIEJJTUVsZW1lbnROb2Rlc1xuICAgLCBBYnN0cmFjdE5vZGVzIGZyb20gUmVsYXRpb24gTm9kZUxpc3QxXG4gICAqXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgZ2V0Q2VucmFsTm9kZXMoKSB7XG4gICAgbGV0IHJlcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5yZWxhdGlvbnNMc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHJlbGF0aW9uID0gdGhpcy5yZWxhdGlvbnNMc3RbaV07XG4gICAgICBsZXQgbm9kZUxpc3QxID0gcmVsYXRpb24uZ2V0Tm9kZUxpc3QxKCk7XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG5vZGVMaXN0MS5sZW5ndGg7IGorKykge1xuICAgICAgICBjb25zdCBub2RlID0gbm9kZUxpc3QxW2pdO1xuICAgICAgICByZXMucHVzaChub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBhbGwgQklNRWxlbWVudCBvciBBYnN0cmFjdEVsZW1lbnQgTm9kZXMgKGluIE5vZGVMaXN0MSlcbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBnZXRDZW5yYWxOb2Rlc0J5UmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSkge1xuICAgIGxldCByZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucmVsYXRpb25zQnlUeXBlW3JlbGF0aW9uVHlwZV0ubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHJlbGF0aW9uID0gdGhpcy5yZWxhdGlvbnNCeVR5cGVbcmVsYXRpb25UeXBlXVtpXTtcbiAgICAgIGxldCBub2RlTGlzdDEgPSByZWxhdGlvbi5nZXROb2RlTGlzdDEoKTtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbm9kZUxpc3QxLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBub2RlTGlzdDFbal07XG4gICAgICAgIHJlcy5wdXNoKG5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEByZXR1cm5zICBBIHByb21pc2Ugb2YgYWxsIEJJTUVsZW1lbnQgb3IgQWJzdHJhY3RFbGVtZW50IChpbiBOb2RlTGlzdDEpXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgYXN5bmMgZ2V0Q2VucmFsTm9kZXNFbGVtZW50cygpIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgbGV0IGNlbnRyYWxOb2RlcyA9IHRoaXMuZ2V0Q2VucmFsTm9kZXMoKTtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgY2VudHJhbE5vZGVzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgY2VudHJhbE5vZGUgPSBjZW50cmFsTm9kZXNbaW5kZXhdO1xuICAgICAgcmVzLnB1c2goYXdhaXQgVXRpbGl0aWVzLnByb21pc2VMb2FkKGNlbnRyYWxOb2RlLmVsZW1lbnQpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICAvKipcbiAgICpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uVHlwZVxuICAgKiBAcmV0dXJucyBBIHByb21pc2Ugb2YgYWxsIEJJTUVsZW1lbnQgb3IgQWJzdHJhY3RFbGVtZW50IChpbiBOb2RlTGlzdDEpIG9mIGEgc3BlY2lmaWMgdHlwZVxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGFzeW5jIGdldENlbnJhbE5vZGVzRWxlbWVudHNCeVJlbGF0aW9uVHlwZShyZWxhdGlvblR5cGUpIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgbGV0IGNlbnRyYWxOb2RlcyA9IHRoaXMuZ2V0Q2VucmFsTm9kZXNCeVJlbGF0aW9uVHlwZShyZWxhdGlvblR5cGUpO1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBjZW50cmFsTm9kZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCBjZW50cmFsTm9kZSA9IGNlbnRyYWxOb2Rlc1tpbmRleF07XG4gICAgICByZXMucHVzaChhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQoY2VudHJhbE5vZGUuZWxlbWVudCkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZX0gbm9kZVxuICAgKiBAcmV0dXJucyBBIHByb21pc2Ugb2YgYWxsIGVsZW1lbnRzIG9mIChub2RlTGlzdDIpIGFzc29jaWF0ZWQgd2l0aCBhIHNwZWNpZmljIChjZW50cmFsKW5vZGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBhc3luYyBnZXRBc3NvY2lhdGVkRWxlbWVudHNCeU5vZGUobm9kZSkge1xuICAgIGxldCByZXMgPSBbXTtcbiAgICBsZXQgcmVsYXRpb25zID0gdGhpcy5nZXRSZWxhdGlvbnNCeU5vZGUobm9kZSk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZWxhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHJlbGF0aW9uID0gcmVsYXRpb25zW2ldO1xuICAgICAgY29uc3Qgbm9kZUxpc3QyID0gcmVsYXRpb24uZ2V0Tm9kZUxpc3QyKCk7XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG5vZGVMaXN0Mi5sZW5ndGg7IGorKykge1xuICAgICAgICBjb25zdCBub2RlID0gbm9kZUxpc3QyW2pdO1xuICAgICAgICByZXMucHVzaChhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQobm9kZS5lbGVtZW50KSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqXG4gICAqIEBwYXJhbSB7U3BpbmFsTm9kZX0gbm9kZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpb25UeXBlXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSBvZiBhbGwgZWxlbWVudHMgb2YgKG5vZGVMaXN0MikgYXNzb2NpYXRlZCB3aXRoIGEgc3BlY2lmaWMgKGNlbnRyYWwpbm9kZSBieSBhIHNwZWNpZmljIHJlbGF0aW9uIHR5cGVcbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBhc3luYyBnZXRBc3NvY2lhdGVkRWxlbWVudHNCeU5vZGVCeVJlbGF0aW9uVHlwZShub2RlLCByZWxhdGlvblR5cGUpIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgbGV0IHJlbGF0aW9ucyA9IHRoaXMuZ2V0UmVsYXRpb25zQnlOb2RlQnlUeXBlKG5vZGUsIHJlbGF0aW9uVHlwZSk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZWxhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHJlbGF0aW9uID0gcmVsYXRpb25zW2ldO1xuICAgICAgY29uc3Qgbm9kZUxpc3QyID0gcmVsYXRpb24uZ2V0Tm9kZUxpc3QyKCk7XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG5vZGVMaXN0Mi5sZW5ndGg7IGorKykge1xuICAgICAgICBjb25zdCBub2RlID0gbm9kZUxpc3QyW2pdO1xuICAgICAgICByZXMucHVzaChhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUxvYWQobm9kZS5lbGVtZW50KSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqIEByZXR1cm5zIGFuIGFycmF5IG9mIHJlbGF0aW9uIHR5cGVzXG4gICAqXG4gICAqIEBtZW1iZXJvZiBTcGluYWxBcHBsaWNhdGlvblxuICAgKi9cbiAgZ2V0UmVsYXRpb25UeXBlcygpIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMucmVsYXRpb25zVHlwZXNMc3QubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5yZWxhdGlvbnNUeXBlc0xzdFtpbmRleF07XG4gICAgICByZXMucHVzaChlbGVtZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IG9ubHlEaXJlY3RlZFxuICAgKiBAcmV0dXJucyBhbiBhcnJheSBvZiByZWxhdGlvbiB0eXBlcyB0aGF0IGFyZSByZWFsbHkgdXNlZFxuICAgKiBAbWVtYmVyb2YgU3BpbmFsQXBwbGljYXRpb25cbiAgICovXG4gIGdldFVzZWRSZWxhdGlvblR5cGVzKG9ubHlEaXJlY3RlZCkge1xuICAgIGxldCByZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5yZWxhdGlvbnNUeXBlc0xzdC5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IHJlbGF0aW9uVHlwZSA9IHRoaXMucmVsYXRpb25zVHlwZXNMc3RbaW5kZXhdO1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLnJlbGF0aW9uc0J5VHlwZVtyZWxhdGlvblR5cGVdICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGxldCByZWxhdGlvbiA9IHRoaXMucmVsYXRpb25zQnlUeXBlW3JlbGF0aW9uVHlwZV1bMF07XG4gICAgICAgIGlmIChvbmx5RGlyZWN0ZWQpIHtcbiAgICAgICAgICBpZiAocmVsYXRpb24uaXNEaXJlY3RlZC5nZXQoKSkge1xuICAgICAgICAgICAgcmVzLnB1c2gocmVsYXRpb25UeXBlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSByZXMucHVzaChyZWxhdGlvblR5cGUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIC8qKlxuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyBhbiBhcnJheSBvZiByZWxhdGlvbiB0eXBlcyB0aGF0IGFyZSBuZXZlciB1c2VkIGluIHRoaXMgYXBwbGljYXRpb25cbiAgICogQG1lbWJlcm9mIFNwaW5hbEFwcGxpY2F0aW9uXG4gICAqL1xuICBnZXROb3RVc2VkUmVsYXRpb25UeXBlcygpIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMucmVsYXRpb25zVHlwZXNMc3QubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCByZWxhdGlvblR5cGUgPSB0aGlzLnJlbGF0aW9uc1R5cGVzTHN0W2luZGV4XTtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5yZWxhdGlvbnNCeVR5cGVbcmVsYXRpb25UeXBlXSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICByZXMucHVzaChyZWxhdGlvblR5cGUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG59XG5leHBvcnQgZGVmYXVsdCBTcGluYWxBcHBsaWNhdGlvbjtcbnNwaW5hbENvcmUucmVnaXN0ZXJfbW9kZWxzKFtTcGluYWxBcHBsaWNhdGlvbl0pOyJdfQ==