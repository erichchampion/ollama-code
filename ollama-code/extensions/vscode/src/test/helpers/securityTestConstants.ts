/**
 * Security Test Constants
 * Shared constants for security vulnerability testing
 */

/**
 * CWE (Common Weakness Enumeration) IDs for security vulnerabilities
 * @see https://cwe.mitre.org/
 */
export const CWE_IDS = {
  SQL_INJECTION: 89,
  COMMAND_INJECTION: 78,
  XSS: 79,
  LDAP_INJECTION: 90,
  XPATH_INJECTION: 643,
  TEMPLATE_INJECTION: 94,
  NOSQL_INJECTION: 89, // MongoDB injection is still CWE-89
  PATH_TRAVERSAL: 22,
  SSRF: 918,
  XXE: 611,
  HARDCODED_SECRETS: 798,
  HARDCODED_CREDENTIALS: 798, // CWE-798 for hardcoded credentials
  WEAK_CRYPTO: 327,
  AUTH_BYPASS: 287,
  WEAK_PASSWORD: 521,
  SESSION_FIXATION: 384,
  DEBUG_ENABLED: 489,
} as const;

/**
 * OWASP Top 10 2021 categories
 * @see https://owasp.org/Top10/
 */
export const OWASP_CATEGORIES = {
  A01_BROKEN_ACCESS_CONTROL: 'A01:2021 – Broken Access Control',
  A02_CRYPTOGRAPHIC_FAILURES: 'A02:2021 – Cryptographic Failures',
  A03_INJECTION: 'A03:2021 – Injection',
  A04_INSECURE_DESIGN: 'A04:2021 – Insecure Design',
  A05_SECURITY_MISCONFIGURATION: 'A05:2021 – Security Misconfiguration',
  A06_VULNERABLE_COMPONENTS: 'A06:2021 – Vulnerable and Outdated Components',
  A07_AUTH_FAILURES: 'A07:2021 – Identification and Authentication Failures',
  A08_SOFTWARE_DATA_INTEGRITY: 'A08:2021 – Software and Data Integrity Failures',
  A09_SECURITY_LOGGING: 'A09:2021 – Security Logging and Monitoring Failures',
  A10_SSRF: 'A10:2021 – Server-Side Request Forgery',

  // Aliases for easier reference
  A01_ACCESS_CONTROL: 'A01:2021',
  A07_AUTHENTICATION: 'A07:2021',
} as const;

/**
 * Security vulnerability categories
 */
export const VULNERABILITY_CATEGORIES = {
  INJECTION: 'injection',
  XSS: 'xss',
  AUTHENTICATION: 'authentication',
  CRYPTOGRAPHY: 'cryptography',
  SECRETS: 'secrets',
  CONFIGURATION: 'configuration',
  DEPENDENCIES: 'dependencies',
  ACCESS_CONTROL: 'access_control',
  DATA_INTEGRITY: 'data_integrity',
  LOGGING: 'logging',
  SSRF: 'ssrf',
} as const;

/**
 * Parameterization markers used in safe SQL queries
 */
export const PARAMETERIZATION_MARKERS = [
  '?',      // MySQL, SQLite positional
  '$1',     // PostgreSQL numbered
  '$2',
  '$3',
  ':param', // Named parameters
  ':id',
  ':name',
  '@param', // SQL Server
  '@id',
  '@name',
] as const;

/**
 * Keywords indicating input sanitization/escaping
 */
export const ESCAPE_KEYWORDS = [
  'escape',
  'sanitize',
  'validate',
  'clean',
  'filter',
  'strip',
  'encode',
  'htmlspecialchars',
  'htmlentities',
  'escapeHtml',
  'escapeSql',
] as const;

/**
 * User input sources to watch for in security analysis
 */
export const USER_INPUT_SOURCES = [
  'req.query',
  'req.params',
  'req.body',
  'req.headers',
  'process.env',
  '$_GET',
  '$_POST',
  '$_REQUEST',
  'params.',
  'query.',
  'body.',
] as const;

/**
 * Severity levels for security vulnerabilities
 */
export const SEVERITY_LEVELS = {
  CRITICAL: 'critical' as const,
  HIGH: 'high' as const,
  MEDIUM: 'medium' as const,
  LOW: 'low' as const,
  INFO: 'info' as const,
};

/**
 * Confidence levels for vulnerability detection
 */
export const CONFIDENCE_LEVELS = {
  HIGH: 'high' as const,
  MEDIUM: 'medium' as const,
  LOW: 'low' as const,
};

/**
 * Security rule IDs from production SecurityAnalyzer
 */
export const SECURITY_RULE_IDS = {
  AUTH_BYPASS: 'auth_bypass',
  WEAK_CRYPTO: 'weak_crypto',
  SQL_INJECTION: 'sql_injection',
  COMMAND_INJECTION: 'command_injection',
  HARDCODED_SECRETS: 'hardcoded_secrets',
  DEBUG_ENABLED: 'debug_enabled',
  OUTDATED_DEPENDENCY: 'outdated_dependency',
  WEAK_PASSWORD_POLICY: 'weak_password_policy',
  XSS: 'xss_vulnerability',
  PATH_TRAVERSAL: 'path_traversal',
  CORS_MISCONFIGURATION: 'cors_misconfiguration',
  INSECURE_DESERIALIZATION: 'insecure_deserialization',
  SSRF: 'ssrf_vulnerability',
  XXE: 'xxe_vulnerability',
  CSRF: 'csrf_vulnerability',
} as const;

/**
 * File patterns for security scanning
 * Used to ensure consistent file pattern matching across all security rules
 */
export const FILE_PATTERNS = {
  /** Web languages: JavaScript, TypeScript, React */
  WEB_LANGUAGES: ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx'] as const,

  /** Backend languages: JS, TS, Python, Java, PHP */
  BACKEND_LANGUAGES: ['**/*.js', '**/*.ts', '**/*.py', '**/*.java', '**/*.php'] as const,

  /** Shell scripts */
  SHELL_SCRIPTS: ['**/*.sh', '**/*.bash'] as const,

  /** All code files */
  ALL_CODE: ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx', '**/*.py', '**/*.java', '**/*.php', '**/*.sh'] as const,

  /** React-specific files */
  REACT_FILES: ['**/*.jsx', '**/*.tsx'] as const,

  /** TypeScript files */
  TYPESCRIPT_FILES: ['**/*.ts', '**/*.tsx'] as const,
} as const;

/**
 * Vulnerability code templates
 * Reusable code snippets for testing vulnerability detection
 */
export const VULNERABILITY_CODE_TEMPLATES = {
  SQL_INJECTION: {
    STRING_CONCAT: (source: string) => `
const query = "SELECT * FROM users WHERE id = " + ${source};
db.execute(query);
`,
    TEMPLATE_LITERAL: (source: string) => `
const query = \`SELECT * FROM users WHERE username = '\${${source}}'\`;
db.query(query);
`,
    SAFE_PARAMETERIZED: (source: string) => `
const query = 'SELECT * FROM users WHERE id = $1';
db.query(query, [${source}]);
`,
  },

  NOSQL_INJECTION: {
    DIRECT_INPUT: (source: string) => `
const user = await User.find(${source});
`,
    WHERE_OPERATOR: (source: string) => `
const users = await User.find({ $where: ${source} });
`,
    SAFE_SANITIZED: (source: string) => `
const sanitizedQuery = validator.escape(${source});
const user = await User.findOne({ username: sanitizedQuery });
`,
  },

  COMMAND_INJECTION: {
    EXEC: (source: string) => `
const { exec } = require('child_process');
exec('ls ' + ${source});
`,
    SPAWN_SHELL: (source: string) => `
spawn(${source}, [], { shell: true });
`,
    EVAL: (source: string) => `
eval(${source});
`,
    SAFE_EXECFILE: (source: string) => `
const { execFile } = require('child_process');
const allowedCommands = ['ls', 'pwd'];
const cmd = allowedCommands.includes(${source}) ? ${source} : 'ls';
execFile(cmd, ['-la']);
`,
  },

  LDAP_INJECTION: {
    FILTER_CONCAT: (source: string) => `
const filter = 'uid=' + ${source};
ldapClient.search(baseDN, { filter }, callback);
`,
    SAFE_ESCAPED: (source: string) => `
const escapedUsername = ldap.escapeFilter(${source});
const filter = 'uid=' + escapedUsername;
ldapClient.search(baseDN, { filter }, callback);
`,
  },

  XPATH_INJECTION: {
    CONCAT: (source: string) => `
const xpath = '/users/user[username="' + ${source} + '"]';
const result = doc.select(xpath);
`,
    SAFE_ESCAPED: (source: string) => `
const escapedUser = xpath.escape(${source});
const xpath = '/users/user[username="' + escapedUser + '"]';
const result = doc.select(xpath);
`,
  },

  TEMPLATE_INJECTION: {
    COMPILE: (source: string) => `
const template = ${source};
const compiled = Handlebars.compile(template);
`,
    UNESCAPED: (source: string) => `
const html = '{{{ ${source} }}}';
`,
    SAFE_SANITIZED: (source: string) => `
const sanitizedInput = sanitize(${source});
const html = '{{ safeInput }}'; // Auto-escaped by Handlebars
`,
  },

  XSS: {
    INNER_HTML: (source: string) => `
const userInput = ${source};
document.getElementById('output').innerHTML = userInput;
`,
    OUTER_HTML: (source: string) => `
const userInput = ${source};
element.outerHTML = userInput;
`,
    DOCUMENT_WRITE: (source: string) => `
const content = ${source};
document.write(content);
`,
    DOM_LOCATION: (source: string) => `
const hash = ${source};
document.getElementById('output').innerHTML = hash;
`,
    REACT_DANGEROUS: (source: string) => `
function UserContent({ userInput }) {
  return (
    <div dangerouslySetInnerHTML={{ __html: ${source} }} />
  );
}
`,
    SAFE_TEXT_CONTENT: (source: string) => `
const message = ${source};
document.getElementById('output').textContent = message; // Safe - textContent escapes HTML
`,
    SAFE_SANITIZED: (source: string) => `
import DOMPurify from 'dompurify';
const message = ${source};
const sanitized = DOMPurify.sanitize(message);
document.getElementById('output').innerHTML = sanitized;
`,
    SAFE_REACT: (source: string) => `
function UserContent({ userInput }) {
  return (
    <div>{${source}}</div> // Safe - React escapes by default
  );
}
`,
  },

  AUTHENTICATION: {
    HARDCODED_PASSWORD: (password: string = 'SuperSecret123!') => `
const DB_PASSWORD = "${password}";
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'admin',
  password: DB_PASSWORD
});
`,
    HARDCODED_API_KEY: (apiKey: string = 'sk_live_1234567890abcdefghijklmnop') => `
const apiKey = "${apiKey}";
fetch('https://api.example.com/data', {
  headers: { 'Authorization': \`Bearer \${apiKey}\` }
});
`,
    HARDCODED_NUMERIC: (password: string = '12345678') => `
const apiKey = "${password}";
const secret = "00000000";
`,
    WEAK_PASSWORD_LENGTH: (minLength: number = 6) => `
function validatePassword(password) {
  if (password.length < ${minLength}) {
    return false;
  }
  return true;
}
`,
    WEAK_MIN_LENGTH_CONFIG: (minLength: number = 4) => `
const passwordSchema = {
  minLength: ${minLength},
  requireUppercase: false,
  requireNumbers: false
};
`,
    UNPROTECTED_ADMIN_ROUTE: () => `
app.get('/admin/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});
`,
    UNPROTECTED_API_ENDPOINT: () => `
router.post('/api/sensitive-data', async (req, res) => {
  const data = await SensitiveModel.create(req.body);
  res.json(data);
});
`,
    SESSION_FIXATION: () => `
app.post('/login', async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (user && user.validPassword(req.body.password)) {
    req.session.userId = user.id;
    req.session.user = user;
    res.redirect('/dashboard');
  }
});
`,
    SESSION_FIXATION_COMMENT: () => `
app.post('/login', async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (user && user.validPassword(req.body.password)) {
    req.session.userId = user.id;
    // TODO: Add session.regenerate() for security
    res.redirect('/dashboard');
  }
});
`,
    SAFE_ENV_VARS: () => `
const password = process.env.DB_PASSWORD;
const apiKey = process.env.API_KEY;
const connection = mysql.createConnection({
  host: 'localhost',
  password: password
});
`,
    SAFE_STRONG_PASSWORD: () => `
function validatePassword(password) {
  if (password.length < 8) {
    return false;
  }
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$/.test(password);
}
`,
    SAFE_PROTECTED_ROUTE: () => `
app.get('/admin/users', isAuthenticated, async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.post('/api/data', requireAuth, async (req, res) => {
  const data = await Model.create(req.body);
  res.json(data);
});
`,
    SAFE_SESSION_REGENERATE: () => `
app.post('/login', async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (user && user.validPassword(req.body.password)) {
    req.session.regenerate((err) => {
      if (err) return res.status(500).send('Session error');
      req.session.userId = user.id;
      req.session.user = user;
      res.redirect('/dashboard');
    });
  }
});
`,
  },
} as const;

/**
 * Expected vulnerability counts for test suites
 */
export const EXPECTED_VULNERABILITY_COUNTS = {
  SQL_INJECTION: 2,      // String concat + template literal
  NOSQL_INJECTION: 2,    // Direct input + $where
  COMMAND_INJECTION: 3,  // exec + spawn + eval
  LDAP_INJECTION: 1,     // Filter construction
  XPATH_INJECTION: 1,    // XPath expression
  TEMPLATE_INJECTION: 2, // Template compile + unescaped
} as const;
