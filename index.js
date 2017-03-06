function identity(a) { return a; }

const defaultOptions = {
  storage: global.localStorage,
  serializer: identity,
  deserializer: identity,
  deserializeNull: false,
};

function isNullOrUndefined(value) {
  return value === null || value === undefined;
}

function chain(fns) {
  if (typeof fns === 'function') {
    return fns;
  }

  return v => fns.reduce((acc, fn) => fn(acc), v);
}

module.exports = function proxyStorage(opts) {
  const options = Object.assign({}, defaultOptions, opts);
  const { storage, serializer, deserializer, deserializeNull } = options;
  const deserializerFn = chain(deserializer);
  const serializerFn = chain(serializer);

  function getItem(name) {
    const item = storage.getItem(name);
    if (options.deserializeNull || !isNullOrUndefined(item)) {
      return deserializerFn(item);
    }

    return undefined;
  }

  function setItem(name, value) {
    return storage.setItem(name, serializerFn(value));
  }

  return new Proxy(storage, {
    get(target, name) {
      if (name === 'getItem') {
        return getItem;
      }

      if (name === 'setItem') {
        return setItem;
      }

      const prop = storage[name];
      return prop.bind ? prop.bind(storage) : prop;
    },
  });

};
