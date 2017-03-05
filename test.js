const { spy } = require('sinon');

const tape = require('tape');
const proxy = require('./');

const memStorage = {
  store: {},
  getItem(name) { return this.store[name]; },
  setItem(name, value) { this.store[name] = value; },
  clear() { this.store = {}; },
};

const deltaDeserializer = spy((v) => {
  return v.replace(/'$/, '');
});

const deltaSerializer = spy((v) => {
  return `${v}'`;
});

spy(memStorage, 'getItem');
spy(memStorage, 'setItem');
spy(memStorage, 'clear');

tape('proxy-storage', (test) => {
  test.test('Proxied with single (de)serializer', (t) => {
    const proxied = proxy({
      storage: memStorage,
      serializer: deltaSerializer,
      deserializer: deltaDeserializer,
    });

    const key = 'foo';
    t.notOk(proxied.getItem(key), 'Unspecified key should be falsey');
    t.notOk(deltaDeserializer.called, 'Unspecified key does not call deserializer');

    proxied.setItem(key, 'abc');
    t.ok(deltaSerializer.called, 'Call serialiser when set');
    t.ok(memStorage.setItem.called, 'Call storage.setItem when set');
    t.equal(memStorage.store[key], 'abc\'', 'Serializes value');

    t.equals(proxied.getItem(key), 'abc', 'Deserialized value');
    proxied.clear();
    t.ok(memStorage.clear.called, 'Calls proxied object functions');
    t.equals(proxied.getItem(key), undefined, 'Still keeps native store methods');

    t.end();
  });

  test.test('Proxied with chain of (de)serializers', (t) => {
    const proxied = proxy({
      storage: memStorage,
      serializer: [
        v => Object.assign({}, v, { test: `${v.test}'` }),
        JSON.stringify,
      ],
      deserializer: [
        JSON.parse,
        v => Object.assign({}, v, { test: v.test.replace(/'$/, '') }),
      ],
    });

    const key = 'fooObj';
    t.notOk(proxied.getItem(key), 'Unspecified key should be falsey');

    proxied.setItem(key, { test: 'abc' });
    t.deepEquals(JSON.parse(memStorage.store[key]), { test: 'abc\'' }, 'Serializes value');

    t.deepEquals(proxied.getItem(key), { test: 'abc' }, 'Deserialized value');

    t.end();
  });

});
