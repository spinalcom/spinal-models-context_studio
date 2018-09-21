let Utilities = {};
const globalType = typeof window === "undefined" ? global : window;

Utilities.getViewer = function() {
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

Utilities.promiseGetProperties = function(_dbId) {
  return new Promise(resolve => {
    Utilities.getViewer().then(viewer => {
      viewer.getProperties(_dbId, resolve);
    });
  });
};

Utilities.promiseGetExternalIdMapping = function(_externalId) {
  return new Promise(resolve => {
    Utilities.getViewer().then(viewer => {
      viewer.model.getExternalIdMapping(res => {
        resolve(res[_externalId]);
      });
    });
  });

}


// Utilities.promiseLoad = function(_ptr) {
//   return new Promise(resolve => {
//     _ptr.load(resolve);
//   });
// }
Utilities.promiseLoad = function(_ptr) {
  if (
    _ptr instanceof globalType.Ptr &&
    _ptr.data.value != 0 &&
    typeof FileSystem._objects[_ptr.data.value] != "undefined"
  )
    return Promise.resolve(FileSystem._objects[_ptr.data.value]);
  else
    return new Promise(resolve => {
      _ptr.load(resolve);
    });
};




Utilities.getExternalId = async function(_dbId) {
  let properties = await Utilities.promiseGetProperties(_dbId);
  return properties.externalId;
};

Utilities.getDbIdByExternalId = async function(_externalId) {
  let dbid = await Utilities.promiseGetExternalIdMapping(_externalId);
  return dbid;
};

Utilities.arraysEqual = function(arrayA, arrayB) {
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

Utilities.containsLstById = function(_list, _node) {
  for (let index = 0; index < _list.length; index++) {
    const element = _list[index];
    if (element.id.get() == _node.id.get()) return true;
  }
  return false;
};

Utilities.containsLstModel = function(_list, _model) {
  for (let index = 0; index < _list.length; index++) {
    const element = _list[index];
    if (element.get() == _model.get()) return true;
  }
  return false;
};

Utilities.containsLst = function(_list, _element) {
  for (let index = 0; index < _list.length; index++) {
    const element = _list[index];
    if (element.get() == _element) return true;
  }
  return false;
};

Utilities.include = function(arr, obj) {
  return arr.indexOf(obj) != -1;
};

Utilities.getIndex = function(arr, obj) {
  return arr.indexOf(obj);
};

Utilities.getIds = function(array) {
  let res = [];
  for (let index = 0; index < array.length; index++) {
    res.push(array[index].id.get());
  }
  return res;
};
// Utilities.addNotExisting = function(arr, obj) {
//   return (arr.indexOf(obj));
// }

Utilities.concat = function(listA, listB) {
  let res = [];
  for (let index = 0; index < listA.length; index++) {
    res.push(listA[index]);
  }
  for (let index = 0; index < listB.length; index++) {
    res.push(listB[index]);
  }
  return res;
};

Utilities.allButMeById = function(_list, _node) {
  let res = [];
  for (let index = 0; index < _list.length; index++) {
    const node = _list[index];
    if (node.id.get() != _node.id.get()) {
      res.push(node);
    }
    return res;
  }
};

Utilities.guid = function(_constructor) {
  return (
    _constructor +
    "-" +
    this.s4() +
    this.s4() +
    "-" +
    this.s4() +
    "-" +
    this.s4() +
    "-" +
    this.s4() +
    "-" +
    this.s4() +
    this.s4() +
    this.s4() +
    "-" +
    Date.now().toString(16)
  );
};

Utilities.s4 = function() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
};

Utilities.putOnTopLst = function(lst, elementB) {
  lst.remove_ref(elementB);
  lst.unshift(elementB);
  // for (let index = 0; index < lst.length; index++) {
  //   const element = lst[index];
  //   if (element.id.get() === elementB.id.get()) {
  //     lst.remove(index);
  //   }

  // }
};

export {
  Utilities
};