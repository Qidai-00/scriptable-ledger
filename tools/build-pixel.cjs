#!/usr/bin/env node
'use strict';

// Usage: node build-pixel.cjs <original-script> <theme.css> <output.js> [--check]
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function generate(originalBytes, cssBytes) {
  const original = originalBytes.toString('utf8');
  const css = cssBytes.toString('utf8');
  assert(Buffer.from(original).equals(originalBytes), 'Original must be UTF-8');
  assert(Buffer.from(css).equals(cssBytes), 'Theme must be UTF-8');
  assert(css.length && !/<\/style/i.test(css), 'Theme must be CSS only');

  const htmlLiteral = /^const html=("(?:[^"\\]|\\.)*")\.replace/m;
  const originalMatch = original.match(htmlLiteral);
  assert(originalMatch, 'Expected the v2.1.4 JSON-quoted HTML literal');
  const html = JSON.parse(originalMatch[1]);
  assert.equal((html.match(/<\/style>/g) || []).length, 1, 'Expected one style element');
  const added = '\n' + css;
  assert(!html.includes(added), 'Original must not contain the theme already');

  const themed = html.replace('</style>', () => added + '</style>');
  const offset = originalMatch.index + 'const html='.length;
  const themedLiteral = JSON.stringify(themed);
  const output = original.slice(0, offset) + themedLiteral
    + original.slice(offset + originalMatch[1].length);

  // Verify both sides of the Scriptable/HTML boundary before output.
  const outputMatch = output.match(htmlLiteral);
  assert.equal(outputMatch?.[1], themedLiteral);
  const reverted = output.slice(0, offset) + originalMatch[1]
    + output.slice(offset + themedLiteral.length);
  assert(Buffer.from(reverted).equals(originalBytes), 'Non-HTML script bytes changed');
  assert.equal(JSON.parse(outputMatch[1]).replace(added, ''), html, 'Non-theme HTML bytes changed');
  assert.equal((themed.match(/__BOOT_DATA__/g) || []).length, 1, 'Boot marker changed');
  const inline = themed.match(/<script>([\s\S]*?)<\/script>/);
  assert(inline, 'Inline browser script missing');
  new vm.Script(inline[1], { filename: 'inline-ledger.js' });
  return Buffer.from(output);
}

const [original, css, output, mode, ...extra] = process.argv.slice(2);
if (!original || !css || !output || extra.length || (mode && mode !== '--check')) {
  console.error('Usage: node build-pixel.cjs <original-script> <theme.css> <output.js> [--check]');
  process.exitCode = 2;
} else {
  assert(![original, css].some((input) => path.resolve(input) === path.resolve(output)),
    'The output path must differ from the inputs');
  if (fs.existsSync(output)) {
    assert(![original, css].some((input) => fs.realpathSync(input) === fs.realpathSync(output)),
      'The output must not be a symlink to either input');
  }
  const expected = generate(fs.readFileSync(original), fs.readFileSync(css));
  if (mode === '--check') {
    assert(expected.equals(fs.readFileSync(output)), 'Generated file is stale; rebuild it.');
    console.log('Generated script is current; only the CSS insertion differs from the original.');
  } else {
    fs.writeFileSync(output, expected);
  }
}
