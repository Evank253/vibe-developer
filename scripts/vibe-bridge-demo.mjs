#!/usr/bin/env node
/** Demo: Developer → Coder → Smoke without FastAPI */
import {
  runDeveloper,
  runCoder,
  runSmoke,
  whatShouldCoderBuild,
  status,
} from '../server/services/vibeBridge.js';

console.log('1) Developer publishes pins...');
console.log(JSON.stringify(runDeveloper({ notes: 'store package pins' }), null, 2));

console.log('\n2) Coder brief...');
console.log(JSON.stringify(whatShouldCoderBuild(), null, 2));

console.log('\n3) Coder implements against pins...');
console.log(
  JSON.stringify(
    runCoder({
      implemented: ['ensure script', 'smoke test', 'semver VERSION'],
      blockers: [],
    }),
    null,
    2,
  ),
);

console.log('\n4) Smoke...');
console.log(JSON.stringify(runSmoke({ ok: true, detail: 'local gate' }), null, 2));

console.log('\n5) Status...');
console.log(JSON.stringify(status(), null, 2));
