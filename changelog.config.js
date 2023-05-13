module.exports = {
  disableEmoji: false,
  format: '{type}{scope}: {emoji}{subject}',
  list: ['feat', 'fix', 'refactor', 'content', 'chore', 'docs', 'test', 'style', 'perf'],
  maxMessageLength: 64,
  minMessageLength: 3,
  questions: ['type', 'subject', 'body', 'breaking'],
  scopes: [],
  types: {
    chore: {
      description: 'Build process or auxiliary tools',
      emoji: '🔧',
      value: 'chore'
    },
    content: {
      description: 'Content tweaks',
      emoji: '📝',
      value: 'content'
    },
    docs: {
      description: 'Documentation changes',
      emoji: '📚',
      value: 'docs'
    },
    feat: {
      description: 'New feature',
      emoji: '🌟',
      value: 'feat'
    },
    fix: {
      description: 'Bug fix',
      emoji: '🐞',
      value: 'fix'
    },
    perf: {
      description: 'Performance improvements',
      emoji: '⚡️',
      value: 'perf'
    },
    refactor: {
      description: 'Neither fix a bug or add a feature',
      emoji: '🔄',
      value: 'refactor'
    },
    style: {
      description: 'Markup, white-space, formatting, missing semi-colons…',
      emoji: '💅',
      value: 'style'
    },
    test: {
      description: 'Automated tests',
      emoji: '🧪',
      value: 'test'
    },
    messages: {
      type: 'Select the type of change that you\'re committing:',
      customScope: 'Select the scope this component affects:',
      subject: 'Write a short, imperative mood description of the change:\n',
      body: 'Provide a longer description of the change:\n ',
      breaking: 'List any breaking changes:\n',
      footer: 'Issues this commit closes, e.g #123:',
      confirmCommit: 'The packages that this commit has affected\n',
    },
  }
}
