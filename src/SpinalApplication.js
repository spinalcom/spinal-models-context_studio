const spinalCore = require("spinal-core-connectorjs");
const globalType = typeof window === "undefined" ? global : window;

import {
  Utilities
} from "./Utilities";
class SpinalApplication extends globalType.Model {
  constructor(_name, relationsTypesLst, relatedGraph, name =
    "SpinalApplication") {
    super();
    if (FileSystem._sig_server) {
      this.add_attr({
        name: _name,
        relationsTypesLst: relationsTypesLst,
        relationsByType: new Model(),
        relatedGraph: relatedGraph
      });
    }
  }

  reserveUniqueRelationType(relationType) {
    this.relatedGraph.reserveUniqueRelationType(relationType, this)
  }

  addRelationType(relationType) {
    if (!this.relatedGraph.isReserved(relationType)) {
      if (!Utilities.containsLst(this.relationsTypesLst,
          relationType)) {
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

  addRelation(relation) {
    if (!this.relatedGraph.isReserved(relation.type.get())) {
      this.addRelationType(relation.type.get());
      if (typeof this.relationsByType[relation.type.get()] ===
        "undefined") {
        let list = new Lst()
        list.push(relation)
        this.relationsByType.add_attr({
          [relation.type.get()]: new Ptr(list)
        });
      } else {
        this.relationsByType[relation.type.get()].load(relationTypeLst => {
          relationTypeLst.push(relation)
        })
      }
    } else {
      console.log(
        relation.type.get() +
        " is reserved by " +
        this.reservedRelationsNames[relation.type.get()]
      );
    }
  }

  hasRelationType(relationType) {
    if (Utilities.containsLst(this.relationsTypesLst, relationType))
      return true
    else {
      console.warn(this.name.get() + " has not declared " + relationType +
        " as one of its relation Types.");
      return false
    }
  }

  hasRelationTypeDefined(relationType) {
    if (typeof this.relationsByType[relationType] !== "undefined")
      return true
    else {
      console.warn("relation " + relationType +
        " is not defined for app " + this.name.get());
      return false
    }
  }



  async getRelationsByType(relationType) {
    if (this.hasRelationType(relationType) && this.hasRelationTypeDefined(
        relationType))
      return await Utilities.promiseLoad(this.relationsByType[relationType])
    else
      return []
  }

  getRelationsByNode(node) {
    if (node.hasAppDefined(this.name.get()))
      return node.getRelationsByAppName(this.name.get())
    else return []
  }

  getRelationsByNodeByType(node, relationType) {
    if (node.hasRelationByAppByTypeDefined(this.name.get(), relationType))
      return node.getRelationsByAppNameByType(this.name.get(), relationType)
    else return new Lst()
  }


}
export default SpinalApplication;
spinalCore.register_models([SpinalApplication])