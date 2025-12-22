/**
 * NodeBB KaTeX Plugin - Main Entry Point
 * Renders LaTeX expressions using KaTeX
 */

const katex = require('katex');

const DELIMITERS = [
  // Display mode - double dollar $$...$$
  { left: '$$', right: '$$', display: true },
  // Display mode - brackets \[...\]
  { left: '\\[', right: '\\]', display: true },
  // Inline mode - parentheses \(...\)
  { left: '\\(', right: '\\)', display: false },
  // Inline mode - dollar signs $...$ (disabled by default)
  { left: '$', right: '$', display: false },
];

// Pattern to detect if content contains any math expression
const MATH_PATTERN = /(\$\$|\\[|\\(|\$)/;

/**
 * Find and render KaTeX expressions in text
 * @param {string} text - Input text
 * @param {Array} delimiters - Delimiter configuration
 * @returns {string} - HTML with rendered math
 */
function renderMath(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }

  // Quick check - if no math delimiters found, skip processing
  if (!MATH_PATTERN.test(text)) {
    return text;
  }

  let result = '';
  let lastIndex = 0;

  // Filter active delimiters (exclude inline $ if not needed)
  const activeDelimiters = DELIMITERS.slice(0, 3);

  for (let i = 0; i < text.length; i++) {
    let matched = false;

    // Try to match each delimiter
    for (const delimiter of activeDelimiters) {
      const leftLen = delimiter.left.length;

      if (text.substr(i, leftLen) === delimiter.left) {
        // Found opening delimiter
        const rightIndex = text.indexOf(delimiter.right, i + leftLen);

        if (rightIndex !== -1) {
          // Found closing delimiter
          try {
            // Add text before this expression
            result += text.substring(lastIndex, i);

            // Extract and render the expression
            const expression = text.substring(i + leftLen, rightIndex);
            const rendered = katex.renderToString(expression, {
              displayMode: delimiter.display,
              throwOnError: false,
              trust: true,
              strict: false,
            });

            // Wrap in appropriate class
            const className = delimiter.display ? 'katex-display' : 'katex-inline';
            result += `<span class="${className}">${rendered}</span>`;

            // Move to next unprocessed position
            lastIndex = rightIndex + delimiter.right.length;
            i = rightIndex + delimiter.right.length - 1;
            matched = true;
            break;
          } catch (err) {
            // If rendering fails, skip and continue
            console.error('KaTeX render error:', err.message);
            continue;
          }
        }
      }
    }

    if (matched === false && i === lastIndex) {
      lastIndex = i + 1;
    }
  }

  // Append remaining text
  result += text.substring(lastIndex);

  return result;
}

/**
 * Parse post hook - processes post content
 * @param {Object} data - Post data
 * @param {Function} callback - NodeBB callback
 */
function parsePost(data, callback) {
  if (data && data.postData && data.postData.content) {
    data.postData.content = renderMath(data.postData.content);
  }
  callback(null, data);
}

/**
 * Parse raw hook - processes raw text
 * @param {string} raw - Raw text
 * @param {Function} callback - NodeBB callback
 */
function parseRaw(raw, callback) {
  const rendered = renderMath(raw);
  callback(null, rendered);
}

/**
 * App load hook
 * @param {Object} params - NodeBB parameters
 * @param {Function} callback - NodeBB callback
 */
function onLoad(params, callback) {
  // Plugin initialization
  callback();
}

module.exports = {
  parsePost,
  parseRaw,
  onLoad,
  // Export for testing
  renderMath,
};