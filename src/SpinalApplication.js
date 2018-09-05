const spinalCore = require("spinal-core-connectorjs");
const globalType = typeof window === "undefined" ? global : window;

import {
  Utilities
} from "./Utilities";

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
  constructor(
    _name,
    relationsTypesLst,
    relatedGraph,
    name = "SpinalApplication"
  ) {
    super();
    if (FileSystem._sig_server) {
      this.add_attr({
        name: _name,
        type: "",
        relationsTypesLst: relationsTypesLst,
        relationsByType: new Model(),
        relationsLst: new Lst(),
        relatedGraphPtr: new Ptr(relatedGraph),
      });
      this.relatedGraph = relatedGraph;
    }

    if (typeof this.relatedGraph == "undefined")
      var interval = setInterval(() => {
        if (typeof this.relatedGraphPtr !== "undefined") {
          this.relatedGraphPtr.load(t => {
            this.relatedGraph = t;
            clearInterval(interval)
          })
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
    if (typeof this.startingNode === "undefined")
      this.add_attr({
        startingNode: node
      });
    else this.startingNode = node;

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
      if (!Utilities.containsLst(this.relationsTypesLst, relationType)) {
        this.relationsTypesLst.push(relationType);
      }
    } else {
      console.log(
        relationType +
        " is reserved by " +
        this.reservedRelationsNames[relationType]
      );
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
      console.log(
        relation.type.get() +
        " is reserved by " +
        this.reservedRelationsNames[relation.type.get()]
      );
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
    if (Utilities.containsLst(this.relationsTypesLst, relationType))
      return true;
    else {
      console.warn(
        this.name.get() +
        " has not declared " +
        relationType +
        " as one of its relation Types."
      );
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
    if (typeof this.relationsByType[relationType] !== "undefined") return true;
    else {
      console.warn(
        "relation " +
        relationType +
        " is not defined for app " +
        this.name.get()
      );
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
    if (
      this.hasRelationType(relationType) &&
      this.hasRelationTypeDefined(relationType)
    )
      return this.relationsByType[relationType];
    else return [];
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
    if (node.hasAppDefined(this.name.get()))
      return node.getRelationsByAppName(this.name.get());
    else return [];
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
      res.push(await Utilities.promiseLoad(centralNode.element));
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
      res.push(await Utilities.promiseLoad(centralNode.element));
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
        res.push(await Utilities.promiseLoad(node.element));
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
        res.push(await Utilities.promiseLoad(node.element));
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
export default SpinalApplication;
spinalCore.register_models([SpinalApplication]);