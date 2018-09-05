"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
let Utilities = {};
const globalType = typeof window === "undefined" ? global : window;

Utilities.getViewer = function () {
  return new Promise((resolve, reject) => {
    if (globalType.v === "undefined") {
      let interval = setInterval(() => {
        if (globalType.v !== "undefined") {
          resolve(globalType.v);
          clearInterval(interval);
        }
      }, 500);
    } else resolve(globalType.v);
  });
};

Utilities.promiseGetProperties = function (_dbId) {
  return new Promise(resolve => {
    Utilities.getViewer().then(viewer => {
      viewer.getProperties(_dbId, resolve);
    });
  });
};

Utilities.promiseGetExternalIdMapping = function (_externalId) {
  return new Promise(resolve => {
    Utilities.getViewer().then(viewer => {
      viewer.model.getExternalIdMapping(res => {
        resolve(res[_externalId]);
      });
    });
  });
};

// Utilities.promiseLoad = function(_ptr) {
//   return new Promise(resolve => {
//     _ptr.load(resolve);
//   });
// }
Utilities.promiseLoad = function (_ptr) {
  if (_ptr instanceof globalType.Ptr && _ptr.data.value != 0 && typeof FileSystem._objects[_ptr.data.value] != "undefined") return Promise.resolve(FileSystem._objects[_ptr.data.value]);else return new Promise(resolve => {
    _ptr.load(resolve);
  });
};

Utilities.getExternalId = async function (_dbId) {
  let properties = await Utilities.promiseGetProperties(_dbId);
  return properties.externalId;
};

Utilities.getDbIdByExternalId = async function (_externalId) {
  let dbid = await Utilities.promiseGetExternalIdMapping(_externalId);
  return dbid;
};

Utilities.arraysEqual = function (arrayA, arrayB) {
  if (arrayA === arrayB) return true;
  if (arrayA == null || arrayB == null) return false;
  if (arrayA.length != arrayB.length) return false;
  arrayA.sort();
  arrayB.sort();
  for (var i = 0; i < arrayA.length; ++i) {
    if (arrayA[i] !== arrayB[i]) return false;
  }
  return true;
};

Utilities.containsLstById = function (_list, _node) {
  for (let index = 0; index < _list.length; index++) {
    const element = _list[index];
    if (element.id.get() == _node.id.get()) return true;
  }
  return false;
};

Utilities.containsLstModel = function (_list, _model) {
  for (let index = 0; index < _list.length; index++) {
    const element = _list[index];
    if (element.get() == _model.get()) return true;
  }
  return false;
};

Utilities.containsLst = function (_list, _element) {
  for (let index = 0; index < _list.length; index++) {
    const element = _list[index];
    if (element.get() == _element) return true;
  }
  return false;
};

Utilities.include = function (arr, obj) {
  return arr.indexOf(obj) != -1;
};

Utilities.getIndex = function (arr, obj) {
  return arr.indexOf(obj);
};

Utilities.getIds = function (array) {
  let res = [];
  for (let index = 0; index < array.length; index++) {
    res.push(array[index].id.get());
  }
  return res;
};
// Utilities.addNotExisting = function(arr, obj) {
//   return (arr.indexOf(obj));
// }

Utilities.concat = function (listA, listB) {
  let res = [];
  for (let index = 0; index < listA.length; index++) {
    res.push(listA[index]);
  }
  for (let index = 0; index < listB.length; index++) {
    res.push(listB[index]);
  }
  return res;
};

Utilities.allButMeById = function (_list, _node) {
  let res = [];
  for (let index = 0; index < _list.length; index++) {
    const node = _list[index];
    if (node.id.get() != _node.id.get()) {
      res.push(node);
    }
    return res;
  }
};

Utilities.guid = function (_constructor) {
  return _constructor + "-" + this.s4() + this.s4() + "-" + this.s4() + "-" + this.s4() + "-" + this.s4() + "-" + this.s4() + this.s4() + this.s4() + "-" + Date.now().toString(16);
};

Utilities.s4 = function () {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
};

Utilities.putOnTopLst = function (lst, elementB) {
  lst.remove_ref(elementB);
  lst.unshift(elementB);
  // for (let index = 0; index < lst.length; index++) {
  //   const element = lst[index];
  //   if (element.id.get() === elementB.id.get()) {
  //     lst.remove(index);
  //   }

  // }
};

exports.Utilities = Utilities;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9VdGlsaXRpZXMuanMiXSwibmFtZXMiOlsiVXRpbGl0aWVzIiwiZ2xvYmFsVHlwZSIsIndpbmRvdyIsImdsb2JhbCIsImdldFZpZXdlciIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwidiIsImludGVydmFsIiwic2V0SW50ZXJ2YWwiLCJjbGVhckludGVydmFsIiwicHJvbWlzZUdldFByb3BlcnRpZXMiLCJfZGJJZCIsInRoZW4iLCJ2aWV3ZXIiLCJnZXRQcm9wZXJ0aWVzIiwicHJvbWlzZUdldEV4dGVybmFsSWRNYXBwaW5nIiwiX2V4dGVybmFsSWQiLCJtb2RlbCIsImdldEV4dGVybmFsSWRNYXBwaW5nIiwicmVzIiwicHJvbWlzZUxvYWQiLCJfcHRyIiwiUHRyIiwiZGF0YSIsInZhbHVlIiwiRmlsZVN5c3RlbSIsIl9vYmplY3RzIiwibG9hZCIsImdldEV4dGVybmFsSWQiLCJwcm9wZXJ0aWVzIiwiZXh0ZXJuYWxJZCIsImdldERiSWRCeUV4dGVybmFsSWQiLCJkYmlkIiwiYXJyYXlzRXF1YWwiLCJhcnJheUEiLCJhcnJheUIiLCJsZW5ndGgiLCJzb3J0IiwiaSIsImNvbnRhaW5zTHN0QnlJZCIsIl9saXN0IiwiX25vZGUiLCJpbmRleCIsImVsZW1lbnQiLCJpZCIsImdldCIsImNvbnRhaW5zTHN0TW9kZWwiLCJfbW9kZWwiLCJjb250YWluc0xzdCIsIl9lbGVtZW50IiwiaW5jbHVkZSIsImFyciIsIm9iaiIsImluZGV4T2YiLCJnZXRJbmRleCIsImdldElkcyIsImFycmF5IiwicHVzaCIsImNvbmNhdCIsImxpc3RBIiwibGlzdEIiLCJhbGxCdXRNZUJ5SWQiLCJub2RlIiwiZ3VpZCIsIl9jb25zdHJ1Y3RvciIsInM0IiwiRGF0ZSIsIm5vdyIsInRvU3RyaW5nIiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwic3Vic3RyaW5nIiwicHV0T25Ub3BMc3QiLCJsc3QiLCJlbGVtZW50QiIsInJlbW92ZV9yZWYiLCJ1bnNoaWZ0Il0sIm1h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ZUU3RSxTLEdBQUFBLFMiLCJmaWxlIjoiVXRpbGl0aWVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsibGV0IFV0aWxpdGllcyA9IHt9XG5jb25zdCBnbG9iYWxUeXBlID0gdHlwZW9mIHdpbmRvdyA9PT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHdpbmRvdztcblxuVXRpbGl0aWVzLmdldFZpZXdlciA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGlmIChnbG9iYWxUeXBlLnYgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGxldCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgaWYgKGdsb2JhbFR5cGUudiAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgIHJlc29sdmUoZ2xvYmFsVHlwZS52KVxuICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpXG4gICAgICAgIH1cbiAgICAgIH0sIDUwMCk7XG4gICAgfSBlbHNlIHJlc29sdmUoZ2xvYmFsVHlwZS52KVxuICB9KVxufVxuXG5VdGlsaXRpZXMucHJvbWlzZUdldFByb3BlcnRpZXMgPSBmdW5jdGlvbihfZGJJZCkge1xuICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgVXRpbGl0aWVzLmdldFZpZXdlcigpLnRoZW4odmlld2VyID0+IHtcbiAgICAgIHZpZXdlci5nZXRQcm9wZXJ0aWVzKF9kYklkLCByZXNvbHZlKTtcbiAgICB9KVxuICB9KTtcbn1cblxuVXRpbGl0aWVzLnByb21pc2VHZXRFeHRlcm5hbElkTWFwcGluZyA9IGZ1bmN0aW9uKF9leHRlcm5hbElkKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICBVdGlsaXRpZXMuZ2V0Vmlld2VyKCkudGhlbih2aWV3ZXIgPT4ge1xuICAgICAgdmlld2VyLm1vZGVsLmdldEV4dGVybmFsSWRNYXBwaW5nKHJlcyA9PiB7XG4gICAgICAgIHJlc29sdmUocmVzW19leHRlcm5hbElkXSlcbiAgICAgIH0pO1xuICAgIH0pXG4gIH0pO1xufVxuXG4vLyBVdGlsaXRpZXMucHJvbWlzZUxvYWQgPSBmdW5jdGlvbihfcHRyKSB7XG4vLyAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbi8vICAgICBfcHRyLmxvYWQocmVzb2x2ZSk7XG4vLyAgIH0pO1xuLy8gfVxuVXRpbGl0aWVzLnByb21pc2VMb2FkID0gZnVuY3Rpb24oX3B0cikge1xuICBpZiAoXG4gICAgX3B0ciBpbnN0YW5jZW9mIGdsb2JhbFR5cGUuUHRyICYmXG4gICAgX3B0ci5kYXRhLnZhbHVlICE9IDAgJiZcbiAgICB0eXBlb2YgRmlsZVN5c3RlbS5fb2JqZWN0c1tfcHRyLmRhdGEudmFsdWVdICE9IFwidW5kZWZpbmVkXCJcbiAgKVxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoRmlsZVN5c3RlbS5fb2JqZWN0c1tfcHRyLmRhdGEudmFsdWVdKTtcbiAgZWxzZVxuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIF9wdHIubG9hZChyZXNvbHZlKTtcbiAgICB9KTtcbn07XG5cblxuXG5cblV0aWxpdGllcy5nZXRFeHRlcm5hbElkID0gYXN5bmMgZnVuY3Rpb24oX2RiSWQpIHtcbiAgbGV0IHByb3BlcnRpZXMgPSBhd2FpdCBVdGlsaXRpZXMucHJvbWlzZUdldFByb3BlcnRpZXMoX2RiSWQpO1xuICByZXR1cm4gcHJvcGVydGllcy5leHRlcm5hbElkO1xufVxuXG5VdGlsaXRpZXMuZ2V0RGJJZEJ5RXh0ZXJuYWxJZCA9IGFzeW5jIGZ1bmN0aW9uKF9leHRlcm5hbElkKSB7XG4gIGxldCBkYmlkID0gYXdhaXQgVXRpbGl0aWVzLnByb21pc2VHZXRFeHRlcm5hbElkTWFwcGluZyhfZXh0ZXJuYWxJZCk7XG4gIHJldHVybiBkYmlkO1xufVxuXG5VdGlsaXRpZXMuYXJyYXlzRXF1YWwgPSBmdW5jdGlvbihhcnJheUEsIGFycmF5Qikge1xuICBpZiAoYXJyYXlBID09PSBhcnJheUIpIHJldHVybiB0cnVlO1xuICBpZiAoYXJyYXlBID09IG51bGwgfHwgYXJyYXlCID09IG51bGwpIHJldHVybiBmYWxzZTtcbiAgaWYgKGFycmF5QS5sZW5ndGggIT0gYXJyYXlCLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICBhcnJheUEuc29ydCgpO1xuICBhcnJheUIuc29ydCgpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGFycmF5QS5sZW5ndGg7ICsraSkge1xuICAgIGlmIChhcnJheUFbaV0gIT09IGFycmF5QltpXSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5VdGlsaXRpZXMuY29udGFpbnNMc3RCeUlkID0gZnVuY3Rpb24oX2xpc3QsIF9ub2RlKSB7XG4gIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBfbGlzdC5sZW5ndGg7IGluZGV4KyspIHtcbiAgICBjb25zdCBlbGVtZW50ID0gX2xpc3RbaW5kZXhdO1xuICAgIGlmIChlbGVtZW50LmlkLmdldCgpID09IF9ub2RlLmlkLmdldCgpKVxuICAgICAgcmV0dXJuIHRydWVcbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuVXRpbGl0aWVzLmNvbnRhaW5zTHN0TW9kZWwgPSBmdW5jdGlvbihfbGlzdCwgX21vZGVsKSB7XG4gIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBfbGlzdC5sZW5ndGg7IGluZGV4KyspIHtcbiAgICBjb25zdCBlbGVtZW50ID0gX2xpc3RbaW5kZXhdO1xuICAgIGlmIChlbGVtZW50LmdldCgpID09IF9tb2RlbC5nZXQoKSlcbiAgICAgIHJldHVybiB0cnVlXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cblV0aWxpdGllcy5jb250YWluc0xzdCA9IGZ1bmN0aW9uKF9saXN0LCBfZWxlbWVudCkge1xuICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX2xpc3QubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgY29uc3QgZWxlbWVudCA9IF9saXN0W2luZGV4XTtcbiAgICBpZiAoZWxlbWVudC5nZXQoKSA9PSBfZWxlbWVudClcbiAgICAgIHJldHVybiB0cnVlXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cblV0aWxpdGllcy5pbmNsdWRlID0gZnVuY3Rpb24oYXJyLCBvYmopIHtcbiAgcmV0dXJuIChhcnIuaW5kZXhPZihvYmopICE9IC0xKTtcbn1cblxuVXRpbGl0aWVzLmdldEluZGV4ID0gZnVuY3Rpb24oYXJyLCBvYmopIHtcbiAgcmV0dXJuIChhcnIuaW5kZXhPZihvYmopKTtcbn1cblxuVXRpbGl0aWVzLmdldElkcyA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gIGxldCByZXMgPSBbXVxuICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgYXJyYXkubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgcmVzLnB1c2goYXJyYXlbaW5kZXhdLmlkLmdldCgpKVxuICB9XG4gIHJldHVybiByZXM7XG59XG4vLyBVdGlsaXRpZXMuYWRkTm90RXhpc3RpbmcgPSBmdW5jdGlvbihhcnIsIG9iaikge1xuLy8gICByZXR1cm4gKGFyci5pbmRleE9mKG9iaikpO1xuLy8gfVxuXG5VdGlsaXRpZXMuY29uY2F0ID0gZnVuY3Rpb24obGlzdEEsIGxpc3RCKSB7XG4gIGxldCByZXMgPSBbXVxuICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgbGlzdEEubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgcmVzLnB1c2gobGlzdEFbaW5kZXhdKVxuICB9XG4gIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBsaXN0Qi5sZW5ndGg7IGluZGV4KyspIHtcbiAgICByZXMucHVzaChsaXN0QltpbmRleF0pXG4gIH1cbiAgcmV0dXJuIHJlcztcbn1cblxuVXRpbGl0aWVzLmFsbEJ1dE1lQnlJZCA9IGZ1bmN0aW9uKF9saXN0LCBfbm9kZSkge1xuICBsZXQgcmVzID0gW107XG4gIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBfbGlzdC5sZW5ndGg7IGluZGV4KyspIHtcbiAgICBjb25zdCBub2RlID0gX2xpc3RbaW5kZXhdO1xuICAgIGlmIChub2RlLmlkLmdldCgpICE9IF9ub2RlLmlkLmdldCgpKSB7XG4gICAgICByZXMucHVzaChub2RlKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxufVxuXG5VdGlsaXRpZXMuZ3VpZCA9IGZ1bmN0aW9uKF9jb25zdHJ1Y3Rvcikge1xuICByZXR1cm4gKFxuICAgIF9jb25zdHJ1Y3RvciArXG4gICAgXCItXCIgK1xuICAgIHRoaXMuczQoKSArXG4gICAgdGhpcy5zNCgpICtcbiAgICBcIi1cIiArXG4gICAgdGhpcy5zNCgpICtcbiAgICBcIi1cIiArXG4gICAgdGhpcy5zNCgpICtcbiAgICBcIi1cIiArXG4gICAgdGhpcy5zNCgpICtcbiAgICBcIi1cIiArXG4gICAgdGhpcy5zNCgpICtcbiAgICB0aGlzLnM0KCkgK1xuICAgIHRoaXMuczQoKSArXG4gICAgXCItXCIgK1xuICAgIERhdGUubm93KCkudG9TdHJpbmcoMTYpXG4gICk7XG59XG5cblV0aWxpdGllcy5zNCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gTWF0aC5mbG9vcigoMSArIE1hdGgucmFuZG9tKCkpICogMHgxMDAwMClcbiAgICAudG9TdHJpbmcoMTYpXG4gICAgLnN1YnN0cmluZygxKTtcbn1cblxuVXRpbGl0aWVzLnB1dE9uVG9wTHN0ID0gZnVuY3Rpb24obHN0LCBlbGVtZW50Qikge1xuICBsc3QucmVtb3ZlX3JlZihlbGVtZW50Qik7XG4gIGxzdC51bnNoaWZ0KGVsZW1lbnRCKTtcbiAgLy8gZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGxzdC5sZW5ndGg7IGluZGV4KyspIHtcbiAgLy8gICBjb25zdCBlbGVtZW50ID0gbHN0W2luZGV4XTtcbiAgLy8gICBpZiAoZWxlbWVudC5pZC5nZXQoKSA9PT0gZWxlbWVudEIuaWQuZ2V0KCkpIHtcbiAgLy8gICAgIGxzdC5yZW1vdmUoaW5kZXgpO1xuICAvLyAgIH1cblxuICAvLyB9XG59XG5cblxuXG5leHBvcnQge1xuICBVdGlsaXRpZXNcbn0iXX0=