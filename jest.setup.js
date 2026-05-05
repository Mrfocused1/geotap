// Suppress jest-expo/expo winter runtime issues with Jest 30.
// The lazy getters installed by expo/src/winter/installGlobal fire
// outside of test scope when first accessed, causing a ReferenceError.
// Pre-define all globals that expo/src/winter/runtime.native.ts installs
// so the lazy getters are never registered or triggered.

const defineSafe = (name, value) => {
  const existing = Object.getOwnPropertyDescriptor(global, name);
  if (!existing || existing.configurable) {
    Object.defineProperty(global, name, {
      value,
      configurable: true,
      writable: true,
      enumerable: false,
    });
  }
};

defineSafe('__ExpoImportMetaRegistry', { url: 'http://localhost/' });
if (typeof global.structuredClone !== 'function') {
  // Node 17+ has structuredClone natively; provide a fallback for older envs
  defineSafe('structuredClone', (obj) => JSON.parse(JSON.stringify(obj)));
}
// TextDecoder/TextEncoder are available natively in Node — no-op if present
if (typeof global.TextDecoder === 'undefined') {
  const { TextDecoder, TextEncoder } = require('util');
  defineSafe('TextDecoder', TextDecoder);
  defineSafe('TextEncoder', TextEncoder);
}
