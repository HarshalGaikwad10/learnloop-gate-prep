// src/components/common/FormattedContent.jsx — Universal Markdown & Engineering Math Renderer
import React from 'react';
import MathRenderer from './MathRenderer';
import ProcessFlowDiagram from './ProcessFlowDiagram';

/**
 * Parses inline string into rich React elements:
 * - Inline LaTeX: $...$
 * - Bold: **...**
 * - Italic: *...*
 * - Inline code: `...`
 * - Chemical subscripts: e.g. CO2, H2S, Ca(OH)2, Fe2+
 */
export function formatInlineText(text) {
  if (!text) return null;
  if (typeof text !== 'string') return String(text);

  // Regex tokens:
  // 1. Math: \$[^\$\n]+\$
  // 2. Bold: \*\*[^*]+\*\*
  // 3. Inline code: `[^`]+`
  // 4. Italic: \*[^*]+\*
  const tokenRegex = /(\$[^$\n]+\$|\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;

  const parts = [];
  let lastIndex = 0;
  let match;
  let keyIdx = 0;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(renderPlainTextWithChemicals(text.substring(lastIndex, match.index), `txt-${keyIdx++}`));
    }

    const token = match[0];

    // Math: $...$
    if (token.startsWith('$') && token.endsWith('$') && token.length > 2) {
      const mathContent = token.slice(1, -1);
      parts.push(<MathRenderer key={`m-${keyIdx++}`} math={mathContent} block={false} />);
    }
    // Bold: **...**
    else if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      parts.push(
        <strong key={`b-${keyIdx++}`} className="ll-prose-bold">
          {formatInlineText(token.slice(2, -2))}
        </strong>
      );
    }
    // Inline code: `...`
    else if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
      parts.push(
        <code key={`c-${keyIdx++}`} className="ll-inline-code">
          {token.slice(1, -1)}
        </code>
      );
    }
    // Italic: *...*
    else if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
      parts.push(
        <em key={`i-${keyIdx++}`} className="ll-prose-italic">
          {formatInlineText(token.slice(1, -1))}
        </em>
      );
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(renderPlainTextWithChemicals(text.substring(lastIndex), `txt-${keyIdx++}`));
  }

  return parts.length > 0 ? parts : text;
}

/**
 * Smart detection for chemical formulas and scientific units in plain text
 * (e.g. CO2 -> CO₂, Ca(OH)2 -> Ca(OH)₂, Fe2+ -> Fe²⁺, m3/s -> m³/s)
 */
function renderPlainTextWithChemicals(plainStr, key) {
  if (!plainStr) return null;

  // Common engineering chemical formula regex
  // Matches e.g. H2O, CO2, H2S, Ca(OH)2, Al(OH)3, CaSO4, Fe2+, Mn2+, O2, N2, NH3, HOCl, OCl-
  const chemRegex = /\b(H2O|CO2|H2S|O2|N2|NH3|NH2Cl|Ca\(OH\)2|Al\(OH\)3|CaSO4|Ca\(HCO3\)2|Fe\(OH\)3|MnO2|Fe2\+|Mn2\+|Cl2|Cl-|HOCl|OCl-|SO4\^?2-?)\b/g;

  if (!chemRegex.test(plainStr)) {
    return <React.Fragment key={key}>{plainStr}</React.Fragment>;
  }

  chemRegex.lastIndex = 0;
  const elements = [];
  let lastIndex = 0;
  let match;
  let chemIdx = 0;

  while ((match = chemRegex.exec(plainStr)) !== null) {
    if (match.index > lastIndex) {
      elements.push(plainStr.substring(lastIndex, match.index));
    }

    const chem = match[0];
    elements.push(
      <span key={`chem-${key}-${chemIdx++}`} className="ll-chem-formula">
        {convertChemicalToReact(chem)}
      </span>
    );
    lastIndex = chemRegex.lastIndex;
  }

  if (lastIndex < plainStr.length) {
    elements.push(plainStr.substring(lastIndex));
  }

  return <React.Fragment key={key}>{elements}</React.Fragment>;
}

function convertChemicalToReact(formula) {
  // Convert digits after letters to <sub> and signs to <sup>
  const parts = [];
  let i = 0;
  while (i < formula.length) {
    if (formula[i] === '2' && formula[i + 1] === '+') {
      parts.push(<sup key={i}>2+</sup>);
      i += 2;
    } else if (formula[i] === '-' && (i === formula.length - 1 || formula[i - 1] === 'l')) {
      parts.push(<sup key={i}>-</sup>);
      i++;
    } else if (/[0-9]/.test(formula[i]) && (i > 0 && /[a-zA-Z)]/.test(formula[i - 1]))) {
      parts.push(<sub key={i}>{formula[i]}</sub>);
      i++;
    } else {
      parts.push(formula[i]);
      i++;
    }
  }
  return parts;
}

/**
 * Renders a Markdown table wrapped in a horizontally scrollable container for responsive mobile layouts
 */
function renderMarkdownTable(tableLines, tableKey) {
  if (tableLines.length < 2) return null;

  const headerLine = tableLines[0];
  const headerCells = headerLine
    .split('|')
    .slice(1, -1)
    .map(c => c.trim());

  // If table doesn't have leading/trailing pipes
  const effectiveHeaders = headerCells.length > 0
    ? headerCells
    : headerLine.split('|').filter(c => c.trim().length > 0).map(c => c.trim());

  // Data rows (skip delimiter line at index 1)
  const dataRows = tableLines.slice(2).map(rowLine => {
    const cells = rowLine.split('|');
    if (cells.length >= effectiveHeaders.length + 2) {
      return cells.slice(1, -1).map(c => c.trim());
    }
    return cells.filter(c => c.trim().length > 0).map(c => c.trim());
  });

  return (
    <div key={tableKey} className="ll-table-wrapper" tabIndex={0} role="region" aria-label="Data Table">
      <table className="ll-table">
        <thead>
          <tr>
            {effectiveHeaders.map((header, i) => (
              <th key={i}>{formatInlineText(header)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataRows.map((row, rIdx) => (
            <tr key={rIdx}>
              {row.map((cell, cIdx) => (
                <td key={cIdx}>{formatInlineText(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Main Universal FormattedContent Component
 */
export default function FormattedContent({
  content,
  inline = false,
  className = '',
  style = {}
}) {
  if (!content) return null;

  // If requested in inline mode (e.g. for MCQ options or question headers)
  if (inline) {
    return (
      <span className={`ll-formatted-inline ${className}`} style={style}>
        {formatInlineText(typeof content === 'string' ? content : String(content))}
      </span>
    );
  }

  const rawText = typeof content === 'string' ? content : String(content);
  const lines = rawText.split('\n');
  const elements = [];

  let inCodeBlock = false;
  let codeBuffer = [];
  let codeLang = '';

  let inTable = false;
  let tableBuffer = [];

  let inBlockMath = false;
  let mathBuffer = [];

  let inList = false;
  let listType = null; // 'ul' or 'ol'
  let listItems = [];

  const flushList = (key) => {
    if (listItems.length === 0) return;
    const ListTag = listType === 'ol' ? 'ol' : 'ul';
    elements.push(
      <ListTag key={key} className="ll-prose-list">
        {listItems.map((li, idx) => (
          <li key={idx} className="ll-prose-list-item">
            {formatInlineText(li)}
          </li>
        ))}
      </ListTag>
    );
    listItems = [];
    inList = false;
    listType = null;
  };

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();

    // ── 1. Block Math: $$...$$ ──────────────────────────────────────────────
    if (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 4) {
      if (inList) flushList(`list-before-math-${lineIdx}`);
      if (inTable) {
        elements.push(renderMarkdownTable(tableBuffer, `tbl-${lineIdx}`));
        tableBuffer = [];
        inTable = false;
      }
      const mathStr = trimmed.slice(2, -2).trim();

      // Smart detection: Multi-step process flow with 3+ arrows (\to, ->, →) and \text
      const arrowCount = (mathStr.match(/\\to|\\rightarrow|->|→/g) || []).length;
      if (arrowCount >= 3 && mathStr.includes('\\text')) {
        elements.push(<ProcessFlowDiagram key={`flow-${lineIdx}`} stages={mathStr} />);
        return;
      }

      elements.push(<MathRenderer key={`mb-${lineIdx}`} math={mathStr} block={true} />);
      return;
    }

    // Multiline Block Math
    if (trimmed.startsWith('$$')) {
      if (inBlockMath) {
        // End multiline math
        const fullMath = mathBuffer.join('\n');
        elements.push(<MathRenderer key={`mb-${lineIdx}`} math={fullMath} block={true} />);
        mathBuffer = [];
        inBlockMath = false;
      } else {
        // Start multiline math
        if (inList) flushList(`list-before-mmath-${lineIdx}`);
        inBlockMath = true;
        const rest = trimmed.slice(2).trim();
        if (rest) mathBuffer.push(rest);
      }
      return;
    }

    if (inBlockMath) {
      if (trimmed.endsWith('$$')) {
        const rest = trimmed.slice(0, -2).trim();
        if (rest) mathBuffer.push(rest);
        const fullMath = mathBuffer.join('\n');
        elements.push(<MathRenderer key={`mb-${lineIdx}`} math={fullMath} block={true} />);
        mathBuffer = [];
        inBlockMath = false;
      } else {
        mathBuffer.push(line);
      }
      return;
    }

    // ── 2. Code Block: ``` ──────────────────────────────────────────────────
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        if (codeLang === 'process-flow' || codeLang === 'flowchart') {
          elements.push(
            <ProcessFlowDiagram
              key={`flow-${lineIdx}`}
              stages={codeBuffer.join('\n')}
            />
          );
        } else {
          elements.push(
            <div key={`code-${lineIdx}`} className="ll-code-block-wrapper">
              {codeLang && <div className="ll-code-lang">{codeLang}</div>}
              <pre className="ll-code-block">
                <code>{codeBuffer.join('\n')}</code>
              </pre>
            </div>
          );
        }
        codeBuffer = [];
        codeLang = '';
        inCodeBlock = false;
      } else {
        if (inList) flushList(`list-before-code-${lineIdx}`);
        inCodeBlock = true;
        codeLang = trimmed.slice(3).trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    // ── 3. Table Rows: |...| ─────────────────────────────────────────────────
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (inList) flushList(`list-before-tbl-${lineIdx}`);
      inTable = true;
      tableBuffer.push(trimmed);
      return;
    } else if (inTable) {
      elements.push(renderMarkdownTable(tableBuffer, `tbl-${lineIdx}`));
      tableBuffer = [];
      inTable = false;
    }

    // ── 4. Headings: #, ##, ###, #### ───────────────────────────────────────
    if (line.startsWith('#### ')) {
      if (inList) flushList(`list-h4-${lineIdx}`);
      elements.push(
        <h4 key={`h4-${lineIdx}`} className="ll-prose-h4">
          {formatInlineText(line.slice(5))}
        </h4>
      );
      return;
    }
    if (line.startsWith('### ')) {
      if (inList) flushList(`list-h3-${lineIdx}`);
      elements.push(
        <h3 key={`h3-${lineIdx}`} className="ll-prose-h3">
          {formatInlineText(line.slice(4))}
        </h3>
      );
      return;
    }
    if (line.startsWith('## ')) {
      if (inList) flushList(`list-h2-${lineIdx}`);
      elements.push(
        <h2 key={`h2-${lineIdx}`} className="ll-prose-h2">
          {formatInlineText(line.slice(3))}
        </h2>
      );
      return;
    }
    if (line.startsWith('# ')) {
      if (inList) flushList(`list-h1-${lineIdx}`);
      elements.push(
        <h1 key={`h1-${lineIdx}`} className="ll-prose-h1">
          {formatInlineText(line.slice(2))}
        </h1>
      );
      return;
    }

    // ── 5. Blockquote: > ... ────────────────────────────────────────────────
    if (trimmed.startsWith('>')) {
      if (inList) flushList(`list-quote-${lineIdx}`);
      const quoteText = trimmed.replace(/^>\s?/, '');
      elements.push(
        <blockquote key={`quote-${lineIdx}`} className="ll-blockquote">
          {formatInlineText(quoteText)}
        </blockquote>
      );
      return;
    }

    // ── 6. Lists: - / * (unordered) or 1. (ordered) ─────────────────────────
    const ulMatch = line.match(/^(\s*)[-*]\s+(.+)/);
    const olMatch = line.match(/^(\s*)\d+\.\s+(.+)/);

    if (ulMatch) {
      if (inList && listType !== 'ul') flushList(`flush-ol-${lineIdx}`);
      inList = true;
      listType = 'ul';
      listItems.push(ulMatch[2]);
      return;
    }

    if (olMatch) {
      if (inList && listType !== 'ol') flushList(`flush-ul-${lineIdx}`);
      inList = true;
      listType = 'ol';
      listItems.push(olMatch[2]);
      return;
    }

    // Non-list line: flush any active list
    if (inList) {
      flushList(`flush-${lineIdx}`);
    }

    // ── 7. Blank lines ──────────────────────────────────────────────────────
    if (trimmed.length === 0) {
      // Empty line creates subtle vertical spacing without empty paragraph tags
      elements.push(<div key={`space-${lineIdx}`} className="ll-prose-spacer" />);
      return;
    }

    // ── 8. Standard Paragraph ───────────────────────────────────────────────
    elements.push(
      <p key={`p-${lineIdx}`} className="ll-prose-p">
        {formatInlineText(line)}
      </p>
    );
  });

  // Flush remaining buffers
  if (inBlockMath && mathBuffer.length > 0) {
    elements.push(<MathRenderer key="mb-final" math={mathBuffer.join('\n')} block={true} />);
  }
  if (inCodeBlock && codeBuffer.length > 0) {
    elements.push(
      <pre key="code-final" className="ll-code-block">
        <code>{codeBuffer.join('\n')}</code>
      </pre>
    );
  }
  if (inTable && tableBuffer.length > 0) {
    elements.push(renderMarkdownTable(tableBuffer, 'tbl-final'));
  }
  if (inList) {
    flushList('list-final');
  }

  return (
    <div className={`ll-formatted-content ${className}`} style={style}>
      {elements}
    </div>
  );
}
