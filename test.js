const sinon = require('sinon');

const tape = require('tape');
const proxy = require('./');

const memStorage = {
  store: {},
  getItem(name) { return this.store[name]; },
  setItem(name, value) { this.store[name] = value; },
  clear() { this.store = {}; },
};

const opts = {
  storage: memStorage,
  deserializer(v) {
    return v.replace(/'$/, '');
  },

  serializer(v) {
    return `${v}'`;
  },
};

sinon.spy(opts, 'serializer');
sinon.spy(opts, 'deserializer');
sinon.spy(memStorage, 'getItem');
sinon.spy(memStorage, 'setItem');

tape('Proxy', (t) => {
  const proxied = proxy(opts);

  const key = 'foo';
  t.notOk(proxied.getItem(key), 'Unspecified key should be falsey');
  t.notOk(opts.deserializer.called, 'Unspecified key does not call deserializer');

  proxied.setItem(key, 'abc');
  t.ok(opts.serializer.called, 'Call serialiser when set');
  t.ok(memStorage.setItem.called, 'Call storage.setItem when set');
  t.equal(memStorage.store[key], 'abc\'', 'Serializes value');

  t.equals(proxied.getItem(key), 'abc', 'Deserialized value');

  t.end();
});
