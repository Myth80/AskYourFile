/**
 * Deterministically extract an answer from context
 * Works well for command-based / factual documents
 */
export const extractAnswer = (context, question) => {
  const lines = context
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  const q = question.toLowerCase();

  // --- SQL / DBMS patterns ---
  if (q.includes('create database')) {
    return lines.find(l =>
      l.toUpperCase().includes('CREATE DATABASE')
    );
  }

  if (q.includes('use database')) {
    return lines.find(l =>
      l.toUpperCase().startsWith('USE ')
    );
  }

  if (q.includes('drop database') || q.includes('delete database')) {
    return lines.find(l =>
      l.toUpperCase().includes('DROP DATABASE')
    );
  }

  if (q.includes('show tables') || q.includes('check table')) {
    return lines.find(l =>
      l.toUpperCase().includes('SHOW TABLES')
    );
  }

  if (q.includes('alter database')) {
    return lines.find(l =>
      l.toUpperCase().includes('ALTER DATABASE')
    );
  }

  // --- fallback: return most command-like line ---
  return lines.find(l =>
    l.startsWith('--') || l.endsWith(';')
  );
};
