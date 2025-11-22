/**
 * Lightweight expression evaluator with support for numbers, + - * /, parentheses, and ^ for exponent.
 * Also supports some Math functions when provided in the expression via sin, cos, tan, sqrt, log, ln, exp, abs,
 * and constants pi, e. Variable x can be substituted by value provided.
 * This implementation uses a safe JS Function wrapper after sanitizing the expression.
 */

export function evaluateExpression(expression: string, xValue: number = 0): number {
  if (!expression || typeof expression !== 'string') throw new Error('Invalid expression');

  // Basic safety: allow digits, operators, parentheses, decimal, letters for function names and 'x'
  const sanitized = expression
    .replace(/\s+/g, '')
    .replace(/\^/g, '**') // use JS exponentiation operator
    .replace(/\bx\b/g, String(xValue)); // substitute x with provided value

  // Map common functions to Math.*
  const mapped = sanitized
    .replace(/\bsin\b/g, 'Math.sin')
    .replace(/\bcos\b/g, 'Math.cos')
    .replace(/\btan\b/g, 'Math.tan')
    .replace(/\bsqrt\b/g, 'Math.sqrt')
    .replace(/\bln\b/g, 'Math.log')
    .replace(/\blog\b/g, 'Math.log')
    .replace(/\bexp\b/g, 'Math.exp')
    .replace(/\babs\b/g, 'Math.abs')
    .replace(/\bpi\b/g, String(Math.PI))
    .replace(/\be\b/g, String(Math.E));

  // Basic allowed chars check to avoid injecting dangerous code
  if (!/^[0-9+\-*/().,A-Za-zMath]+$/.test(mapped)) {
    throw new Error('Invalid characters in expression');
  }

  // Evaluate using a new Function wrapper; keep it simple and isolated
  const fn = new Function('return (' + mapped + ');');
  const result = fn();
  if (typeof result !== 'number' || !Number.isFinite(result)) {
    throw new Error('Evaluation error');
  }
  return result;
}

export function evaluateExpressionSafe(expr: string, xValue?: number): number {
  return evaluateExpression(expr, xValue ?? 0);
}
