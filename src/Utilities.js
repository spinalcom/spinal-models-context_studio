let Utilities = {}
const globalType = typeof window === "undefined" ? global : window;

Utilities.getViewer = function() {
  return globalType.v;
};

Utilities.promiseGetProperties = function(_dbId) {
  return new Promise(resolve => {
    let viewer = Utilities.getViewer()
    viewer.getProperties(_dbId, resolve);
  });
}

Utilities.promiseGetExternalIdMapping = function(_externalId) {
  return new Promise(resolve => {
    let viewer = Utilities.getViewer()
    viewer.model.getExternalIdMapping(res => {
      resolve(res[_externalId])
    });
  });
}

Utilities.promiseLoad = function(_ptr) {
  return new Promise(resolve => {
    _ptr.load(resolve);
  });
}




Utilities.getExternalId = async function(_dbId) {
  let properties = await Utilities.promiseGetProperties(_dbId);
  return properties.externalId;
}

Utilities.getDbIdByExternalId = async function(_externalId) {
  let dbid = await Utilities.promiseGetExternalIdMapping(_externalId);
  return dbid;
}

Utilities.arraysEqual = function(arrayA, arrayB) {
  if (arrayA === arrayB) return true;
  if (arrayA == null || arrayB == null) return false;
  if (arrayA.length != arrayB.length) return false;
  arrayA.sort();
  console.log(arrayA);

  arrayB.sort();
  for (var i = 0; i < arrayA.length; ++i) {
    if (arrayA[i] !== arrayB[i]) return false;
  }
  return true;
}

Utilities.contains = function(_list, _vertex) {
  for (let index = 0; index < _list.length; index++) {
    const element = _list[index];
    if (element.id.get() == _vertex.id.get())
      return true
  }
  return false
}

Utilities.include = function(arr, obj) {
  return (arr.indexOf(obj) != -1);
}

Utilities.getIndex = function(arr, obj) {
  return (arr.indexOf(obj));
}

Utilities.getIds = function(array) {
  let res = []
  for (let index = 0; index < array.length; index++) {
    res.push(array[index].id.get())
  }
  return res;
}
// Utilities.addNotExisting = function(arr, obj) {
//   return (arr.indexOf(obj));
// }


export {
  Utilities
}