// Helpers for reading data out of Vue single-file components without running them.
// Templates are walked as a Vue AST; <script> blocks are parsed with Babel and only
// literal values (strings, numbers, arrays, plain objects) are ever evaluated.
import fs from 'node:fs';
import { parse as parseSfc } from '@vue/compiler-sfc';
import { parse as parseJs } from '@babel/parser';

const ELEMENT = 1;
const TEXT = 2;

export function readSfc(file) {
  const source = fs.readFileSync(file, 'utf8');
  const { descriptor, errors } = parseSfc(source, { filename: file });
  if (errors.length) {
    throw new Error(`Could not parse ${file}: ${errors.map((e) => e.message).join('; ')}`);
  }
  const scriptBlock = descriptor.script ?? descriptor.scriptSetup;
  return {
    template: descriptor.template?.ast ?? null,
    script: scriptBlock ? parseJs(scriptBlock.content, { sourceType: 'module' }) : null,
  };
}

/** Collapse whitespace the way a browser renders normal text (incl. &nbsp;). */
export function clean(text) {
  return text.replace(/[\s ]+/g, ' ').trim();
}

export function isElement(node, tag) {
  return node?.type === ELEMENT && (!tag || node.tag === tag);
}

export function children(node) {
  return (node?.children ?? []).filter((c) => c.type === ELEMENT || c.type === TEXT);
}

export function findAll(node, predicate, out = []) {
  if (!node) return out;
  for (const child of node.children ?? []) {
    if (child.type === ELEMENT) {
      if (predicate(child)) out.push(child);
      findAll(child, predicate, out);
    }
  }
  return out;
}

export function find(node, predicate) {
  return findAll(node, predicate)[0] ?? null;
}

/** Static attribute value, e.g. href="..." (bound attributes are ignored). */
export function attr(node, name) {
  const prop = (node?.props ?? []).find((p) => p.type === 6 && p.name === name);
  return prop?.value?.content ?? null;
}

export function hasClass(node, cls) {
  return (attr(node, 'class') ?? '').split(/\s+/).includes(cls);
}

/** Visible static text of an element; interpolations ({{ }}) are skipped. */
export function textOf(node) {
  const parts = [];
  (function collect(n) {
    for (const child of n.children ?? []) {
      if (child.type === TEXT) parts.push(child.content);
      else if (child.type === ELEMENT && child.tag !== 'svg') collect(child);
    }
  })(node);
  return clean(parts.join(' '));
}

function walkJs(node, visit) {
  if (!node || typeof node.type !== 'string') return;
  visit(node);
  for (const key of Object.keys(node)) {
    if (key === 'loc' || key === 'start' || key === 'end') continue;
    const value = node[key];
    if (Array.isArray(value)) value.forEach((v) => walkJs(v, visit));
    else if (value && typeof value.type === 'string') walkJs(value, visit);
  }
}

function keyName(key) {
  if (key.type === 'Identifier') return key.name;
  if (key.type === 'StringLiteral' || key.type === 'NumericLiteral') return String(key.value);
  return null;
}

/** Turn a literal AST node into a plain value. Anything dynamic throws. */
export function literalValue(node) {
  switch (node.type) {
    case 'StringLiteral':
    case 'NumericLiteral':
    case 'BooleanLiteral':
      return node.value;
    case 'NullLiteral':
      return null;
    case 'TemplateLiteral':
      if (node.expressions.length) throw new Error('Template literal with expressions');
      return node.quasis.map((q) => q.value.cooked).join('');
    case 'UnaryExpression':
      if (node.operator === '-' && node.argument.type === 'NumericLiteral') return -node.argument.value;
      break;
    case 'ArrayExpression':
      return node.elements.map((el) => literalValue(el));
    case 'ObjectExpression': {
      const out = {};
      for (const prop of node.properties) {
        if (prop.type !== 'ObjectProperty' || prop.computed) throw new Error('Non-literal object property');
        out[keyName(prop.key)] = literalValue(prop.value);
      }
      return out;
    }
    default:
      break;
  }
  throw new Error(`Unsupported value of type ${node.type}`);
}

/** Value of the first object property called `name` anywhere in the script. */
export function scriptProperty(scriptAst, name) {
  let found;
  walkJs(scriptAst?.program, (node) => {
    if (found === undefined && node.type === 'ObjectProperty' && !node.computed && keyName(node.key) === name) {
      found = node.value;
    }
  });
  return found === undefined ? undefined : literalValue(found);
}
