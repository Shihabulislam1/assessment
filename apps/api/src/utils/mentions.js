export function extractMentions(content) {
  if (!content) return [];
  
  // 1. Match @[Name] format (often used by mention libraries)
  const bracketMatches = content.match(/@\[([^\]]+)\]/g);
  const names = bracketMatches ? bracketMatches.map(m => m.slice(2, -1)) : [];

  // 2. Match standard @Name (stops at spaces or special chars)
  const standardMatches = content.match(/@(\w+)/g);
  if (standardMatches) {
    names.push(...standardMatches.map(m => m.slice(1)));
  }

  // 3. Match HTML spans with data-value (from quill-mention)
  const spanMatches = content.match(/data-value="([^"]+)"/g);
  if (spanMatches) {
    names.push(...spanMatches.map(m => m.slice(12, -1)));
  }

  // Sanitize names to prevent injection/XSS (only allow alphanumeric, spaces, and hyphens)
  const sanitizedNames = names
    .map(name => name.replace(/[^\w\s-]/g, '').trim())
    .filter(name => name.length > 0);

  return [...new Set(sanitizedNames)];
}
