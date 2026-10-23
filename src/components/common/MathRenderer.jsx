// src/components/common/MathRenderer.jsx — Resilient Multi-Tier Mathematical Formula Renderer
import React from 'react';

/**
 * Greek letters, mathematical operators, and chemical symbol mapping for zero-dependency rendering
 */
const SYMBOL_MAP = {
  // Greek Lowercase
  '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\delta': 'δ', '\\epsilon': 'ε',
  '\\varepsilon': 'ε', '\\zeta': 'ζ', '\\eta': 'η', '\\theta': 'θ', '\\vartheta': 'ϑ',
  '\\iota': 'ι', '\\kappa': 'κ', '\\lambda': 'λ', '\\mu': 'μ', '\\nu': 'ν',
  '\\xi': 'ξ', '\\pi': 'π', '\\varpi': 'ϖ', '\\rho': 'ρ', '\\varrho': 'ϱ',
  '\\sigma': 'σ', '\\varsigma': 'ς', '\\tau': 'τ', '\\upsilon': 'υ', '\\phi': 'φ',
  '\\varphi': 'ϕ', '\\chi': 'χ', '\\psi': 'ψ', '\\omega': 'ω',

  // Greek Uppercase
  '\\Gamma': 'Γ', '\\Delta': 'Δ', '\\Theta': 'Θ', '\\Lambda': 'Λ', '\\Xi': 'Ξ',
  '\\Pi': 'Π', '\\Sigma': 'Σ', '\\Upsilon': 'Υ', '\\Phi': 'Φ', '\\Psi': 'Ψ', '\\Omega': 'Ω',

  // Arrows & Reactions
  '\\to': '→', '\\rightarrow': '→', '\\leftarrow': '←', '\\leftrightarrow': '↔',
  '\\Rightarrow': '⇒', '\\Leftarrow': '⇐', '\\Leftrightarrow': '⇔',
  '\\rightleftharpoons': '⇌', '\\uparrow': '↑', '\\downarrow': '↓',
  '\\implies': '⟹', '\\iff': '⟺',

  // Operators & Relations
  '\\cdot': '·', '\\cdots': '···', '\\ldots': '...', '\\times': '×', '\\div': '÷', '\\pm': '±', '\\mp': '∓',
  '\\approx': '≈', '\\sim': '∼', '\\propto': '∝', '\\equiv': '≡',
  '\\le': '≤', '\\leq': '≤', '\\ge': '≥', '\\geq': '≥', '\\ne': '≠', '\\neq': '≠',
  '\\ll': '≪', '\\gg': '≫', '\\in': '∈', '\\notin': '∉', '\\subset': '⊂', '\\subseteq': '⊆',
  '\\infty': '∞', '\\partial': '∂', '\\nabla': '∇', '\\circ': '°', '\\prime': '′',
  '\\sum': '∑', '\\prod': '∏', '\\int': '∫', '\\hbar': 'ℏ',
  '\\quad': '  ', '\\qquad': '    '
};

/**
 * Pure React fallback parser when KaTeX is unavailable (offline or in test runner)
 */
export function parseLatexToReact(latex, isBlock = false) {
  if (!latex) return null;

  // Clean raw escape tokens
  let clean = latex.trim();

  // Strip outer delimiters if present: $$...$$ or \[...\] or \(...\)
  if (clean.startsWith('$$') && clean.endsWith('$$')) clean = clean.slice(2, -2).trim();
  if (clean.startsWith('\\[') && clean.endsWith('\\]')) clean = clean.slice(2, -2).trim();
  if (clean.startsWith('\\(') && clean.endsWith('\\)')) clean = clean.slice(2, -2).trim();

  // Helper to parse nested braces e.g., \frac{num}{den}
  const extractBraceGroup = (str, startIndex) => {
    if (str[startIndex] !== '{') return { content: '', nextIndex: startIndex };
    let depth = 1;
    let i = startIndex + 1;
    while (i < str.length && depth > 0) {
      if (str[i] === '{') depth++;
      else if (str[i] === '}') depth--;
      i++;
    }
    return { content: str.slice(startIndex + 1, i - 1), nextIndex: i };
  };

  const elements = [];
  let i = 0;
  let keyCounter = 0;

  while (i < clean.length) {
    // Labeled arrow: \xrightarrow{label} or \xrightarrow[sub]{label}
    if (clean.startsWith('\\xrightarrow', i)) {
      let after = i + 11;
      let subData = null;
      if (clean[after] === '[') {
        const closeBracket = clean.indexOf(']', after);
        if (closeBracket !== -1) {
          subData = clean.slice(after + 1, closeBracket);
          after = closeBracket + 1;
        }
      }
      const brace = clean.indexOf('{', after);
      if (brace !== -1 && brace - after <= 2) {
        const labelData = extractBraceGroup(clean, brace);
        const arrowText = subData
          ? ` → (${labelData.content} / ${subData}) `
          : ` → (${labelData.content}) `;
        elements.push(
          <span key={`xarr-${keyCounter++}`} className="math-arrow-labeled">
            {arrowText}
          </span>
        );
        i = labelData.nextIndex;
        continue;
      }
    }

    // Overline / Bar: \bar{x}
    if (clean.startsWith('\\bar', i)) {
      const brace = clean.indexOf('{', i + 4);
      if (brace !== -1 && brace - (i + 4) <= 2) {
        const barData = extractBraceGroup(clean, brace);
        elements.push(
          <span key={`bar-${keyCounter++}`} style={{ textDecoration: 'overline' }}>
            {parseLatexToReact(barData.content)}
          </span>
        );
        i = barData.nextIndex;
        continue;
      }
    }

    // 1. Fractions: \frac{num}{den}
    if (clean.startsWith('\\frac', i)) {
      const brace1 = clean.indexOf('{', i + 5);
      if (brace1 !== -1) {
        const numData = extractBraceGroup(clean, brace1);
        const brace2 = clean.indexOf('{', numData.nextIndex);
        if (brace2 !== -1) {
          const denData = extractBraceGroup(clean, brace2);
          elements.push(
            <span key={`frac-${keyCounter++}`} className="math-frac" title="fraction">
              <span className="math-num">{parseLatexToReact(numData.content)}</span>
              <span className="math-den">{parseLatexToReact(denData.content)}</span>
            </span>
          );
          i = denData.nextIndex;
          continue;
        }
      }
    }

    // 2. Square root: \sqrt{body} or \sqrt[n]{body}
    if (clean.startsWith('\\sqrt', i)) {
      let radicalDegree = null;
      let afterDegree = i + 5;
      if (clean[afterDegree] === '[') {
        const closeBracket = clean.indexOf(']', afterDegree);
        if (closeBracket !== -1) {
          radicalDegree = clean.slice(afterDegree + 1, closeBracket);
          afterDegree = closeBracket + 1;
        }
      }
      const brace = clean.indexOf('{', afterDegree);
      if (brace !== -1) {
        const bodyData = extractBraceGroup(clean, brace);
        elements.push(
          <span key={`sqrt-${keyCounter++}`} className="math-sqrt">
            <span className="math-radicand">
              {radicalDegree ? <sup>{radicalDegree}</sup> : null}√
            </span>
            <span className="math-rad-body">{parseLatexToReact(bodyData.content)}</span>
          </span>
        );
        i = bodyData.nextIndex;
        continue;
      }
    }

    // 3. Text blocks: \text{...} or \mathrm{...}
    if (clean.startsWith('\\text', i) || clean.startsWith('\\mathrm', i)) {
      const prefixLen = clean.startsWith('\\mathrm', i) ? 7 : 5;
      const brace = clean.indexOf('{', i + prefixLen);
      if (brace !== -1 && brace - (i + prefixLen) <= 2) {
        const textData = extractBraceGroup(clean, brace);
        elements.push(
          <span key={`txt-${keyCounter++}`} className="math-text-upright">
            {textData.content}
          </span>
        );
        i = textData.nextIndex;
        continue;
      }
    }

    // 4. Superscripts with braces: ^{...} or single char: ^2
    if (clean[i] === '^') {
      if (clean[i + 1] === '{') {
        const supData = extractBraceGroup(clean, i + 1);
        elements.push(
          <sup key={`sup-${keyCounter++}`} className="math-sup">
            {parseLatexToReact(supData.content)}
          </sup>
        );
        i = supData.nextIndex;
        continue;
      } else if (i + 1 < clean.length && clean[i + 1] !== ' ') {
        elements.push(
          <sup key={`sup-${keyCounter++}`} className="math-sup">
            {clean[i + 1]}
          </sup>
        );
        i += 2;
        continue;
      }
    }

    // 5. Subscripts with braces: _{...} or single char: _s
    if (clean[i] === '_') {
      if (clean[i + 1] === '{') {
        const subData = extractBraceGroup(clean, i + 1);
        elements.push(
          <sub key={`sub-${keyCounter++}`} className="math-sub">
            {parseLatexToReact(subData.content)}
          </sub>
        );
        i = subData.nextIndex;
        continue;
      } else if (i + 1 < clean.length && clean[i + 1] !== ' ') {
        elements.push(
          <sub key={`sub-${keyCounter++}`} className="math-sub">
            {clean[i + 1]}
          </sub>
        );
        i += 2;
        continue;
      }
    }

    // 6. LaTeX Symbol Commands (e.g., \mu, \to, \times)
    if (clean[i] === '\\') {
      let matchedSymbol = null;
      let matchedKey = null;

      // Find longest matching symbol
      for (const [cmd, sym] of Object.entries(SYMBOL_MAP)) {
        if (clean.startsWith(cmd, i)) {
          // Check that next character is not a letter to prevent partial matches like \pi inside \pit
          const nextChar = clean[i + cmd.length];
          if (!nextChar || !/[a-zA-Z]/.test(nextChar)) {
            if (!matchedKey || cmd.length > matchedKey.length) {
              matchedKey = cmd;
              matchedSymbol = sym;
            }
          }
        }
      }

      if (matchedSymbol) {
        elements.push(
          <span key={`sym-${keyCounter++}`} className="math-symbol">
            {` ${matchedSymbol} `}
          </span>
        );
        i += matchedKey.length;
        continue;
      }

      // Special functions: \sin, \cos, \tan, \ln, \log, \exp
      const fnMatch = clean.slice(i).match(/^\\(sin|cos|tan|cot|sec|csc|ln|log|exp|min|max|det|lim)\b/);
      if (fnMatch) {
        elements.push(
          <span key={`fn-${keyCounter++}`} className="math-fn">
            {fnMatch[1]}
          </span>
        );
        i += fnMatch[0].length;
        continue;
      }

      // Parentheses sizing commands: \left(, \right), \left[, \right]
      const parenMatch = clean.slice(i).match(/^\\(left|right)([()[\]{}|])/);
      if (parenMatch) {
        elements.push(
          <span key={`paren-${keyCounter++}`} className="math-paren">
            {parenMatch[2]}
          </span>
        );
        i += parenMatch[0].length;
        continue;
      }

      // If unrecognized escape token, skip backslash and continue
      i++;
      continue;
    }

    // 7. Plain character (letters, numbers, operators +, =, -, (, ), etc.)
    elements.push(clean[i]);
    i++;
  }

  return isBlock ? (
    <div className="math-block-container" tabIndex={0} role="region" aria-label="Equation">
      <div className="math-block-content">{elements}</div>
    </div>
  ) : (
    <span className="math-inline">{elements}</span>
  );
}

/**
 * Universal MathRenderer Component
 * Uses KaTeX (Tier 1) when loaded, seamlessly falling back to structured React math (Tier 2).
 */
export default function MathRenderer({ math, block = false, className = '' }) {
  if (!math) return null;

  const rawLatex = typeof math === 'string' ? math.trim() : String(math);

  // Check if KaTeX is globally available on window (Tier 1)
  if (typeof window !== 'undefined' && window.katex && typeof window.katex.renderToString === 'function') {
    try {
      // Strip outer delimiters for KaTeX
      let cleanMath = rawLatex;
      if (cleanMath.startsWith('$$') && cleanMath.endsWith('$$')) {
        cleanMath = cleanMath.slice(2, -2).trim();
      } else if (cleanMath.startsWith('$') && cleanMath.endsWith('$')) {
        cleanMath = cleanMath.slice(1, -1).trim();
      }

      const html = window.katex.renderToString(cleanMath, {
        displayMode: block,
        throwOnError: false,
        output: 'htmlAndMathml'
      });

      if (block) {
        return (
          <div
            className={`math-block-container ${className}`}
            tabIndex={0}
            role="region"
            aria-label="Mathematical formula"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      }

      return (
        <span
          className={`math-inline ${className}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } catch {
      // Fall through to pure React parser on any KaTeX runtime exception
    }
  }

  // Tier 2: Pure React fallback
  return parseLatexToReact(rawLatex, block);
}
