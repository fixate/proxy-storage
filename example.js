const proxy = require('./');
const lzString = require('lz-string');

const memStorage = {
  store: {},
  inspect() { return JSON.stringify(this.store); },
  getItem(name) { return this.store[name]; },
  setItem(name, value) { this.store[name] = value; },
  clear() { this.store = {}; },
};

const proxied = proxy({
  storage: memStorage,
  serializer: [
    JSON.stringify,
    lzString.compress,
  ],

  deserializer: [
    lzString.decompress,
    JSON.parse,
  ],
});

const input = {
  this: 'is', just: 'an', exmaple: { of: { a: { deeply: { nested: 'object' } } } }
};
console.log(`Input ${JSON.stringify(input)}`)
proxied.setItem('foo', input);
console.log(`Compressed value: ${memStorage.store.foo}`)

const result = proxied.getItem('foo');
console.log(`Deserialized ${JSON.stringify(result)}`)
