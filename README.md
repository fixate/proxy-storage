# web-storage-proxy

Proxies `getItem` and `setItem` storage apis (e.g. localStorage, sessionStorage) and add in your
own serializers and deserializers.

## Installation

`npm install --save web-storage-proxy`

## Usage

The following code will serialize JavaScript objects and store them compressed in localStorage.

```javascript
const createStorageProxy = require('web-storage-proxy');
const lzString = require('lz-string');
const { localStorage } = global;

const compressedStorage = createStorageProxy({
  storage: localStorage,
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
compressedStorage.setItem('foo', input);
console.log(`Compressed value: ${memStorage.store.foo}`)

const result = compressedStorage.getItem('foo');
console.log(`Deserialized ${JSON.stringify(result)}`)
```

Play with `example.js` to learn more.


## Requirements

This library has no dependencies, however:

- ES6 [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
is used. If you are using this in the browser you should include the
[Proxy polyfill](https://github.com/GoogleChrome/proxy-polyfill).

- `Array.reduce` is used. Modern browsers support this.
