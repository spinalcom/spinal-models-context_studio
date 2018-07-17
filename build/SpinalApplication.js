"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Utilities = require("./Utilities");

const spinalCore = require("spinal-core-connectorjs");
const globalType = typeof window === "undefined" ? global : window;

class SpinalApplication extends globalType.Model {
  constructor(_name, relationsTypesLst, relatedGraph, name = "SpinalApplication") {
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
    this.relatedGraph.reserveUniqueRelationType(relationType, this);
  }

  addRelationType(relationType) {
    if (!this.relatedGraph.isReserved(relationType)) {
      if (!_Utilities.Utilities.containsLst(this.relationsTypesLst, relationType)) {
        this.relationsTypesLst.push(relationType);
      }
    } else {
      console.log(relationType + " is reserved by " + this.reservedRelationsNames[relationType]);
    }
  }

  addRelation(relation) {
    if (!this.relatedGraph.isReserved(relation.type.get())) {
      this.addRelationType(relation.type.get());
      if (typeof this.relationsByType[relation.type.get()] === "undefined") {
        let list = new Lst();
        list.push(relation);
        this.relationsByType.add_attr({
          [relation.type.get()]: new Ptr(list)
        });
      } else {
        this.relationsByType[relation.type.get()].load(relationTypeLst => {
          relationTypeLst.push(relation);
        });
      }
    } else {
      console.log(relation.type.get() + " is reserved by " + this.reservedRelationsNames[relation.type.get()]);
    }
  }

  hasRelationType(relationType) {
    if (_Utilities.Utilities.containsLst(this.relationsTypesLst, relationType)) return true;else {
      console.warn(this.name.get() + " has not declared " + relationType + " as one of its relation Types.");
      return false;
    }
  }

  hasRelationTypeDefined(relationType) {
    if (typeof this.relationsByType[relationType] !== "undefined") return true;else {
      console.warn("relation " + relationType + " is not defined for app " + this.name.get());
      return false;
    }
  }

  async getRelationsByType(relationType) {
    if (this.hasRelationType(relationType) && this.hasRelationTypeDefined(relationType)) return await _Utilities.Utilities.promiseLoad(this.relationsByType[relationType]);else return [];
  }

  getRelationsByNode(node) {
    if (node.hasAppDefined(this.name.get())) return node.getRelationsByAppName(this.name.get());else return [];
  }

  getRelationsByNodeByType(node, relationType) {
    if (node.hasRelationByAppByTypeDefined(this.name.get(), relationType)) return node.getRelationsByAppNameByType(this.name.get(), relationType);else return [];
  }

}
exports.default = SpinalApplication;

spinalCore.register_models([SpinalApplication]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TcGluYWxBcHBsaWNhdGlvbi5qcyJdLCJuYW1lcyI6WyJzcGluYWxDb3JlIiwicmVxdWlyZSIsImdsb2JhbFR5cGUiLCJ3aW5kb3ciLCJnbG9iYWwiLCJTcGluYWxBcHBsaWNhdGlvbiIsIk1vZGVsIiwiY29uc3RydWN0b3IiLCJfbmFtZSIsInJlbGF0aW9uc1R5cGVzTHN0IiwicmVsYXRlZEdyYXBoIiwibmFtZSIsIkZpbGVTeXN0ZW0iLCJfc2lnX3NlcnZlciIsImFkZF9hdHRyIiwicmVsYXRpb25zQnlUeXBlIiwicmVzZXJ2ZVVuaXF1ZVJlbGF0aW9uVHlwZSIsInJlbGF0aW9uVHlwZSIsImFkZFJlbGF0aW9uVHlwZSIsImlzUmVzZXJ2ZWQiLCJVdGlsaXRpZXMiLCJjb250YWluc0xzdCIsInB1c2giLCJjb25zb2xlIiwibG9nIiwicmVzZXJ2ZWRSZWxhdGlvbnNOYW1lcyIsImFkZFJlbGF0aW9uIiwicmVsYXRpb24iLCJ0eXBlIiwiZ2V0IiwibGlzdCIsIkxzdCIsIlB0ciIsImxvYWQiLCJyZWxhdGlvblR5cGVMc3QiLCJoYXNSZWxhdGlvblR5cGUiLCJ3YXJuIiwiaGFzUmVsYXRpb25UeXBlRGVmaW5lZCIsImdldFJlbGF0aW9uc0J5VHlwZSIsInByb21pc2VMb2FkIiwiZ2V0UmVsYXRpb25zQnlOb2RlIiwibm9kZSIsImhhc0FwcERlZmluZWQiLCJnZXRSZWxhdGlvbnNCeUFwcE5hbWUiLCJnZXRSZWxhdGlvbnNCeU5vZGVCeVR5cGUiLCJoYXNSZWxhdGlvbkJ5QXBwQnlUeXBlRGVmaW5lZCIsImdldFJlbGF0aW9uc0J5QXBwTmFtZUJ5VHlwZSIsInJlZ2lzdGVyX21vZGVscyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBR0E7O0FBSEEsTUFBTUEsYUFBYUMsUUFBUSx5QkFBUixDQUFuQjtBQUNBLE1BQU1DLGFBQWEsT0FBT0MsTUFBUCxLQUFrQixXQUFsQixHQUFnQ0MsTUFBaEMsR0FBeUNELE1BQTVEOztBQUtBLE1BQU1FLGlCQUFOLFNB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LFlBQXpCLEVBQXVDO0FBQ3JDLFFBQUksS0FBS2tCLGVBQUwsQ0FBcUJsQixZQUFyQixLQUFzQyxLQUFLb0Isc0JBQUwsQ0FDdENwQixZQURzQyxDQUExQyxFQUVFLE9BQU8sTUFBTUcscUJBQVVtQixXQUFWLENBQXNCLEtBQUt4QixlQUFMLENBQXFCRSxZQUFyQixDQUF0QixDQUFiLENBRkYsS0FJRSxPQUFPLEVBQVA7QUFDSDs7QUFFRHVCLHFCQUFtQkMsSUFBbkIsRUFBeUI7QUFDdkIsUUFBSUEsS0FBS0MsYUFBTCxDQUFtQixLQUFLL0IsSUFBTCxDQUFVa0IsR0FBVixFQUFuQixDQUFKLEVBQ0UsT0FBT1ksS0FBS0UscUJBQUwsQ0FBMkIsS0FBS2hDLElBQUwsQ0FBVWtCLEdBQVYsRUFBM0IsQ0FBUCxDQURGLEtBRUssT0FBTyxFQUFQO0FBQ047O0FBRURlLDJCQUF5QkgsSUFBekIsRUFBK0J4QixZQUEvQixFQUE2QztBQUMzQyxRQUFJd0IsS0FBS0ksNkJBQUwsQ0FBbUMsS0FBS2xDLElBQUwsQ0FBVWtCLEdBQVYsRUFBbkMsRUFBb0RaLFlBQXBELENBQUosRUFDRSxPQUFPd0IsS0FBS0ssMkJBQUwsQ0FBaUMsS0FBS25DLElBQUwsQ0FBVWtCLEdBQVYsRUFBakMsRUFBa0RaLFlBQWxELENBQVAsQ0FERixLQUVLLE9BQU8sRUFBUDtBQUNOOztBQWpHOEM7a0JBcUdsQ1osaUI7O0FBQ2ZMLFdBQVcrQyxlQUFYLENBQTJCLENBQUMxQyxpQkFBRCxDQUEzQiIsImZpbGUiOiJTcGluYWxBcHBsaWNhdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHNwaW5hbENvcmUgPSByZXF1aXJlKFwic3BpbmFsLWNvcmUtY29ubmVjdG9yanNcIik7XG5jb25zdCBnbG9iYWxUeXBlID0gdHlwZW9mIHdpbmRvdyA9PT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHdpbmRvdztcblxuaW1wb3J0IHtcbiAgVXRpbGl0aWVzXG59IGZyb20gXCIuL1V0aWxpdGllc1wiO1xuY2xhc3MgU3BpbmFsQXBwbGljYXRpb24gZXh0ZW5kcyBnbG9iYWxUeXBlLk1vZGVsIHtcbiAgY29uc3RydWN0b3IoX25hbWUsIHJlbGF0aW9uc1R5cGVzTHN0LCByZWxhdGVkR3JhcGgsIG5hbWUgPVxuICAgIFwiU3BpbmFsQXBwbGljYXRpb25cIikge1xuICAgIHN1cGVyKCk7XG4gICAgaWYgKEZpbGVTeXN0ZW0uX3NpZ19zZXJ2ZXIpIHtcbiAgICAgIHRoaXMuYWRkX2F0dHIoe1xuICAgICAgICBuYW1lOiBfbmFtZSxcbiAgICAgICAgcmVsYXRpb25zVHlwZXNMc3Q6IHJlbGF0aW9uc1R5cGVzTHN0LFxuICAgICAgICByZWxhdGlvbnNCeVR5cGU6IG5ldyBNb2RlbCgpLFxuICAgICAgICByZWxhdGVkR3JhcGg6IHJlbGF0ZWRHcmFwaFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcmVzZXJ2ZVVuaXF1ZVJlbGF0aW9uVHlwZShyZWxhdGlvblR5cGUpIHtcbiAgICB0aGlzLnJlbGF0ZWRHcmFwaC5yZXNlcnZlVW5pcXVlUmVsYXRpb25UeXBlKHJlbGF0aW9uVHlwZSwgdGhpcylcbiAgfVxuXG4gIGFkZFJlbGF0aW9uVHlwZShyZWxhdGlvblR5cGUpIHtcbiAgICBpZiAoIXRoaXMucmVsYXRlZEdyYXBoLmlzUmVzZXJ2ZWQocmVsYXRpb25UeXBlKSkge1xuICAgICAgaWYgKCFVdGlsaXRpZXMuY29udGFpbnNMc3QodGhpcy5yZWxhdGlvbnNUeXBlc0xzdCxcbiAgICAgICAgICByZWxhdGlvblR5cGUpKSB7XG4gICAgICAgIHRoaXMucmVsYXRpb25zVHlwZXNMc3QucHVzaChyZWxhdGlvblR5cGUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgaXMgcmVzZXJ2ZWQgYnkgXCIgK1xuICAgICAgICB0aGlzLnJlc2VydmVkUmVsYXRpb25zTmFtZXNbcmVsYXRpb25UeXBlXVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBhZGRSZWxhdGlvbihyZWxhdGlvbikge1xuICAgIGlmICghdGhpcy5yZWxhdGVkR3JhcGguaXNSZXNlcnZlZChyZWxhdGlvbi50eXBlLmdldCgpKSkge1xuICAgICAgdGhpcy5hZGRSZWxhdGlvblR5cGUocmVsYXRpb24udHlwZS5nZXQoKSk7XG4gICAgICBpZiAodHlwZW9mIHRoaXMucmVsYXRpb25zQnlUeXBlW3JlbGF0aW9uLnR5cGUuZ2V0KCldID09PVxuICAgICAgICBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGxldCBsaXN0ID0gbmV3IExzdCgpXG4gICAgICAgIGxpc3QucHVzaChyZWxhdGlvbilcbiAgICAgICAgdGhpcy5yZWxhdGlvbnNCeVR5cGUuYWRkX2F0dHIoe1xuICAgICAgICAgIFtyZWxhdGlvbi50eXBlLmdldCgpXTogbmV3IFB0cihsaXN0KVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucmVsYXRpb25zQnlUeXBlW3JlbGF0aW9uLnR5cGUuZ2V0KCldLmxvYWQocmVsYXRpb25UeXBlTHN0ID0+IHtcbiAgICAgICAgICByZWxhdGlvblR5cGVMc3QucHVzaChyZWxhdGlvbilcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIHJlbGF0aW9uLnR5cGUuZ2V0KCkgK1xuICAgICAgICBcIiBpcyByZXNlcnZlZCBieSBcIiArXG4gICAgICAgIHRoaXMucmVzZXJ2ZWRSZWxhdGlvbnNOYW1lc1tyZWxhdGlvbi50eXBlLmdldCgpXVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBoYXNSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlKSB7XG4gICAgaWYgKFV0aWxpdGllcy5jb250YWluc0xzdCh0aGlzLnJlbGF0aW9uc1R5cGVzTHN0LCByZWxhdGlvblR5cGUpKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICBlbHNlIHtcbiAgICAgIGNvbnNvbGUud2Fybih0aGlzLm5hbWUuZ2V0KCkgKyBcIiBoYXMgbm90IGRlY2xhcmVkIFwiICsgcmVsYXRpb25UeXBlICtcbiAgICAgICAgXCIgYXMgb25lIG9mIGl0cyByZWxhdGlvbiBUeXBlcy5cIik7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cblxuICBoYXNSZWxhdGlvblR5cGVEZWZpbmVkKHJlbGF0aW9uVHlwZSkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5yZWxhdGlvbnNCeVR5cGVbcmVsYXRpb25UeXBlXSAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oXCJyZWxhdGlvbiBcIiArIHJlbGF0aW9uVHlwZSArXG4gICAgICAgIFwiIGlzIG5vdCBkZWZpbmVkIGZvciBhcHAgXCIgKyB0aGlzLm5hbWUuZ2V0KCkpO1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG5cblxuXG4gIGFzeW5jIGdldFJlbGF0aW9uc0J5VHlwZShyZWxhdGlvblR5cGUpIHtcbiAgICBpZiAodGhpcy5oYXNSZWxhdGlvblR5cGUocmVsYXRpb25UeXBlKSAmJiB0aGlzLmhhc1JlbGF0aW9uVHlwZURlZmluZWQoXG4gICAgICAgIHJlbGF0aW9uVHlwZSkpXG4gICAgICByZXR1cm4gYXdhaXQgVXRpbGl0aWVzLnByb21pc2VMb2FkKHRoaXMucmVsYXRpb25zQnlUeXBlW3JlbGF0aW9uVHlwZV0pXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIFtdXG4gIH1cblxuICBnZXRSZWxhdGlvbnNCeU5vZGUobm9kZSkge1xuICAgIGlmIChub2RlLmhhc0FwcERlZmluZWQodGhpcy5uYW1lLmdldCgpKSlcbiAgICAgIHJldHVybiBub2RlLmdldFJlbGF0aW9uc0J5QXBwTmFtZSh0aGlzLm5hbWUuZ2V0KCkpXG4gICAgZWxzZSByZXR1cm4gW11cbiAgfVxuXG4gIGdldFJlbGF0aW9uc0J5Tm9kZUJ5VHlwZShub2RlLCByZWxhdGlvblR5cGUpIHtcbiAgICBpZiAobm9kZS5oYXNSZWxhdGlvbkJ5QXBwQnlUeXBlRGVmaW5lZCh0aGlzLm5hbWUuZ2V0KCksIHJlbGF0aW9uVHlwZSkpXG4gICAgICByZXR1cm4gbm9kZS5nZXRSZWxhdGlvbnNCeUFwcE5hbWVCeVR5cGUodGhpcy5uYW1lLmdldCgpLCByZWxhdGlvblR5cGUpXG4gICAgZWxzZSByZXR1cm4gW11cbiAgfVxuXG5cbn1cbmV4cG9ydCBkZWZhdWx0IFNwaW5hbEFwcGxpY2F0aW9uO1xuc3BpbmFsQ29yZS5yZWdpc3Rlcl9tb2RlbHMoW1NwaW5hbEFwcGxpY2F0aW9uXSkiXX0=