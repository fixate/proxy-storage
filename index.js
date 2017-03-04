function identity(a) { return a; }

var defaultOptions = {
  storage: global.localStorage,
  serializer: identity,
  deserialize: identity,
  deserializeNull: false,
};

function isNullOrUndefined(value) {
  return value === null || value === undefined;
}

module.exports = function proxyStorage(opts) {
  var options = Object.assign({}, defaultOptions, opts);
  var storage = options.storage;
  var serializer = options.serializer;
  var deserializer = options.deserializer;

  return Object.assign({}, storage, {
    getItem: function getItem(name) {
      var item = storage.getItem(name);
      if (options.deserializeNull || !isNullOrUndefined(item)) {
        return deserializer(item);
      }

      return undefined;
    },

    setItem: function setItem(name, value) {
      return storage.setItem(name, serializer(value));
    },
  });

};
