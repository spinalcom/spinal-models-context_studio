"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Utilities = require("./Utilities");

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const spinalCore = require("spinal-core-connectorjs");
const globalType = typeof window === "undefined" ? global : window;
const BIMForge = require("spinal-models-bim_forge");

class BIMElement extends BIMForge.SpinalBIMObjectForge {
  constructor(_id, _name, _type, name = "BIMElement") {
    super(_id, _name, 0);
    if (FileSystem._sig_server) {
      this.add_attr({
        type: _type || "",
        externalId: ""
      });
    }

    // this.name = _name;
    // this.mod_attr('id', this.guid())
  }

  initExternalId() {
    _Utilities.Utilities.getExternalId(this.id.get()).then(_externalId => {
      this.externalId.set(_externalId);
    });
  }

  initExternalIdAsync() {
    var _this = this;

    return _asyncToGenerator(function* () {
      let _externalId = yield _Utilities.Utilities.getExternalId(_this.id.get());
      _this.externalId.set(_externalId);
    })();
  }

  // guid() {
  //   return (
  //     this.constructor.name +
  //     "-" +
  //     this.s4() +
  //     this.s4() +
  //     "-" +
  //     this.s4() +
  //     "-" +
  //     this.s4() +
  //     "-" +
  //     this.s4() +
  //     "-" +
  //     this.s4() +
  //     this.s4() +
  //     this.s4() +
  //     "-" +
  //     Date.now().toString(16)
  //   );
  // }

  // s4() {
  //   return Math.floor((1 + Math.random()) * 0x10000)
  //     .toString(16)
  //     .substring(1);
  // }

  setName(_name) {
    this.name.set(_name);
  }

  toIfc() {
    return this.constructor.name + '(' + this.id.get() + ',' + this.name.get() + ');';
  }

}

exports.default = BIMElement;
spinalCore.register_models([BIMElement]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9CSU1FbGVtZW50LmpzIl0sIm5hbWVzIjpbInNwaW5hbENvcmUiLCJyZXF1aXJlIiwiZ2xvYmFsVHlwZSIsIndpbmRvdyIsImdsb2JhbCIsIkJJTUZvcmdlIiwiQklNRWxlbWVudCIsIlNwaW5hbEJJTU9iamVjdEZvcmdlIiwiY29uc3RydWN0b3IiLCJfaWQiLCJfbmFtZSIsIl90eXBlIiwibmFtZSIsIkZpbGVTeXN0ZW0iLCJfc2lnX3NlcnZlciIsImFkZF9hdHRyIiwidHlwZSIsImV4dGVybmFsSWQiLCJpbml0RXh0ZXJuYWxJZCIsIlV0aWxpdGllcyIsImdldEV4dGVybmFsSWQiLCJpZCIsImdldCIsInRoZW4iLCJfZXh0ZXJuYWxJZCIsInNldCIsImluaXRFeHRlcm5hbElkQXN5bmMiLCJzZXROYW1lIiwidG9JZmMiLCJyZWdpc3Rlcl9tb2RlbHMiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUlBOzs7O0FBSkEsTUFBTUEsYUFBYUMsUUFBUSx5QkFBUixDQUFuQjtBQUNBLE1BQU1DLGFBQWEsT0FBT0MsTUFBUCxLQUFrQixXQUFsQixHQUFnQ0MsTUFBaEMsR0FBeUNELE1BQTVEO0FBQ0EsTUFBTUUsV0FBV0osUUFBUSx5QkFBUixDQUFqQjs7QUFNZSxNQUFNSyxVQUFOLFNBQXlCRCxTQUFTRSxvQkFBbEMsQ0FBdUQ7QUFDcEVDLGNBQVlDLEdBQVosRUFBaUJDLEtBQWpCLEVBQXdCQyxLQUF4QixFQUErQkMsT0FBTyxZQUF0QyxFQUFvRDtBQUNsRCxVQUFNSCxHQUFOLEVBQVdDLEtBQVgsRUFBa0IsQ0FBbEI7QUFDQSxRQUFJRyxXQUFXQyxXQUFmLEVBQTRCO0FBQzFCLFdBQUtDLFFBQUwsQ0FBYztBQUNaQyxjQUFNTCxTQUFTLEVBREg7QUFFWk0sb0JBQVk7QUFGQSxPQUFkO0FBSUQ7O0FBRUQ7QUFDQTtBQUNEOztBQUVEQyxtQkFBaUI7QUFDZkMseUJBQVVDLGFBQVYsQ0FBd0IsS0FBS0MsRUFBTCxDQUFRQyxHQUFSLEVBQXhCLEVBQXVDQyxJQUF2QyxDQUE0Q0MsZUFBZTtBQUN6RCxXQUFLUCxVQUFMLENBQWdCUSxHQUFoQixDQUFvQkQsV0FBcEI7QUFDRCxLQUZEO0FBR0Q7O0FBRUtFLHFCQUFOLEdBQTRCO0FBQUE7O0FBQUE7QUFDMUIsVUFBSUYsY0FBYyxNQUFNTCxxQkFBVUMsYUFBVixDQUF3QixNQUFLQyxFQUFMLENBQVFDLEdBQVIsRUFBeEIsQ0FBeEI7QUFDQSxZQUFLTCxVQUFMLENBQWdCUSxHQUFoQixDQUFvQkQsV0FBcEI7QUFGMEI7QUFHM0I7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBRyxVQUFRakIsS0FBUixFQUFlO0FBQ2IsU0FBS0UsSUFBTCxDQUFVYSxHQUFWLENBQWNmLEtBQWQ7QUFDRDs7QUFFRGtCLFVBQVE7QUFDTixXQUFPLEtBQUtwQixXQUFMLENBQWlCSSxJQUFqQixHQUF3QixHQUF4QixHQUE4QixLQUFLUyxFQUFMLENBQVFDLEdBQVIsRUFBOUIsR0FBOEMsR0FBOUMsR0FBb0QsS0FBS1YsSUFBTCxDQUFVVSxHQUFWLEVBQXBELEdBQ0wsSUFERjtBQUVEOztBQTNEbUU7O2tCQUFqRGhCLFU7QUErRHJCTixXQUFXNkIsZUFBWCxDQUEyQixDQUFDdkIsVUFBRCxDQUEzQiIsImZpbGUiOiJCSU1FbGVtZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3Qgc3BpbmFsQ29yZSA9IHJlcXVpcmUoXCJzcGluYWwtY29yZS1jb25uZWN0b3Jqc1wiKTtcbmNvbnN0IGdsb2JhbFR5cGUgPSB0eXBlb2Ygd2luZG93ID09PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogd2luZG93O1xuY29uc3QgQklNRm9yZ2UgPSByZXF1aXJlKFwic3BpbmFsLW1vZGVscy1iaW1fZm9yZ2VcIik7XG5cbmltcG9ydCB7XG4gIFV0aWxpdGllc1xufSBmcm9tIFwiLi9VdGlsaXRpZXNcIlxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCSU1FbGVtZW50IGV4dGVuZHMgQklNRm9yZ2UuU3BpbmFsQklNT2JqZWN0Rm9yZ2Uge1xuICBjb25zdHJ1Y3RvcihfaWQsIF9uYW1lLCBfdHlwZSwgbmFtZSA9IFwiQklNRWxlbWVudFwiKSB7XG4gICAgc3VwZXIoX2lkLCBfbmFtZSwgMCk7XG4gICAgaWYgKEZpbGVTeXN0ZW0uX3NpZ19zZXJ2ZXIpIHtcbiAgICAgIHRoaXMuYWRkX2F0dHIoe1xuICAgICAgICB0eXBlOiBfdHlwZSB8fCBcIlwiLFxuICAgICAgICBleHRlcm5hbElkOiBcIlwiXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyB0aGlzLm5hbWUgPSBfbmFtZTtcbiAgICAvLyB0aGlzLm1vZF9hdHRyKCdpZCcsIHRoaXMuZ3VpZCgpKVxuICB9XG5cbiAgaW5pdEV4dGVybmFsSWQoKSB7XG4gICAgVXRpbGl0aWVzLmdldEV4dGVybmFsSWQodGhpcy5pZC5nZXQoKSkudGhlbihfZXh0ZXJuYWxJZCA9PiB7XG4gICAgICB0aGlzLmV4dGVybmFsSWQuc2V0KF9leHRlcm5hbElkKVxuICAgIH0pXG4gIH1cblxuICBhc3luYyBpbml0RXh0ZXJuYWxJZEFzeW5jKCkge1xuICAgIGxldCBfZXh0ZXJuYWxJZCA9IGF3YWl0IFV0aWxpdGllcy5nZXRFeHRlcm5hbElkKHRoaXMuaWQuZ2V0KCkpXG4gICAgdGhpcy5leHRlcm5hbElkLnNldChfZXh0ZXJuYWxJZClcbiAgfVxuXG4gIC8vIGd1aWQoKSB7XG4gIC8vICAgcmV0dXJuIChcbiAgLy8gICAgIHRoaXMuY29uc3RydWN0b3IubmFtZSArXG4gIC8vICAgICBcIi1cIiArXG4gIC8vICAgICB0aGlzLnM0KCkgK1xuICAvLyAgICAgdGhpcy5zNCgpICtcbiAgLy8gICAgIFwiLVwiICtcbiAgLy8gICAgIHRoaXMuczQoKSArXG4gIC8vICAgICBcIi1cIiArXG4gIC8vICAgICB0aGlzLnM0KCkgK1xuICAvLyAgICAgXCItXCIgK1xuICAvLyAgICAgdGhpcy5zNCgpICtcbiAgLy8gICAgIFwiLVwiICtcbiAgLy8gICAgIHRoaXMuczQoKSArXG4gIC8vICAgICB0aGlzLnM0KCkgK1xuICAvLyAgICAgdGhpcy5zNCgpICtcbiAgLy8gICAgIFwiLVwiICtcbiAgLy8gICAgIERhdGUubm93KCkudG9TdHJpbmcoMTYpXG4gIC8vICAgKTtcbiAgLy8gfVxuXG4gIC8vIHM0KCkge1xuICAvLyAgIHJldHVybiBNYXRoLmZsb29yKCgxICsgTWF0aC5yYW5kb20oKSkgKiAweDEwMDAwKVxuICAvLyAgICAgLnRvU3RyaW5nKDE2KVxuICAvLyAgICAgLnN1YnN0cmluZygxKTtcbiAgLy8gfVxuXG4gIHNldE5hbWUoX25hbWUpIHtcbiAgICB0aGlzLm5hbWUuc2V0KF9uYW1lKVxuICB9XG5cbiAgdG9JZmMoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IubmFtZSArICcoJyArIHRoaXMuaWQuZ2V0KCkgKyAnLCcgKyB0aGlzLm5hbWUuZ2V0KCkgK1xuICAgICAgJyk7J1xuICB9XG5cbn1cblxuc3BpbmFsQ29yZS5yZWdpc3Rlcl9tb2RlbHMoW0JJTUVsZW1lbnRdKSJdfQ==