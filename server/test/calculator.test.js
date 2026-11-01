import test from 'node:test';
import assert from 'node:assert/strict';
import { initial, labelOf, press } from '../../web/src/lib/calculator.js';

const run = (keys) => keys.reduce((state, key) => press(state, key), initial);

test('the calculator evaluates a chain of operations', () => {
  assert.equal(labelOf(run(['2', '+', '3', '='])), '5');
  assert.equal(labelOf(run(['9', '-', '4', '='])), '5');
  assert.equal(labelOf(run(['6', '*', '7', '='])), '42');
  assert.equal(labelOf(run(['8', '/', '2', '='])), '4');
});

test('the calculator handles decimals and percentages', () => {
  assert.equal(labelOf(run(['1', '.', '5', '+', '2', '.', '2', '5', '='])), '3.75');
  assert.equal(labelOf(run(['5', '0', '%'])), '0.5');
});

test('division by zero is shown as an error, not Infinity', () => {
  const state = run(['9', '/', '0', '=']);
  assert.equal(state.error, 'Cannot divide by zero');
  assert.equal(labelOf(state), 'Cannot divide by zero');
});

test('the square root rejects negative numbers', () => {
  assert.equal(labelOf(run(['9', 'sqrt'])), '3');
  assert.equal(labelOf(run(['4', '-', '9', '=', 'sqrt'])), 'Not a number');
});

test('backspace removes one digit and clear resets the display', () => {
  assert.equal(labelOf(run(['1', '2', 'back'])), '1');
  assert.equal(labelOf(run(['1', '2', 'clear'])), '0');
});

test('typing after an error starts a new number', () => {
  assert.equal(labelOf(run(['9', '/', '0', '=', '4'])), '4');
});
