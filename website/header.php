<?php
$page = basename($_SERVER['PHP_SELF'], '.php');
$titles = [
  'index'   => 'Bpanel — Something Fucking Refreshing',
  'docs'    => 'Bpanel — Documentation',
  'install' => 'Bpanel — Install Guide',
];
$pageTitle = $titles[$page] ?? 'Bpanel';
$desc = 'Self-hosted VPS control panel. File manager, code editor, terminal, domains, SSL, databases, git, logs — all in your browser. No bloat, no Docker, one command.';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= htmlspecialchars($pageTitle) ?></title>
  <meta name="description" content="<?= htmlspecialchars($desc) ?>">
  <meta property="og:title" content="<?= htmlspecialchars($pageTitle) ?>">
  <meta property="og:description" content="<?= htmlspecialchars($desc) ?>">
  <meta property="og:type" content="website">
  <meta name="theme-color" content="#6366f1">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/main.css">
  <link rel="stylesheet" href="/css/responsive.css">
</head>
<body>
  <nav class="navbar" id="navbar">
    <div class="container nav-container">
      <a href="/" class="nav-logo">
        <span class="nav-logo-icon">B</span>panel
      </a>
      <button class="nav-toggle" id="nav-toggle" aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>
      <ul class="nav-links" id="nav-links">
        <li><a href="/" class="<?= $page === 'index' ? 'active' : '' ?>">Home</a></li>
        <li><a href="/install.php" class="<?= $page === 'install' ? 'active' : '' ?>">Install</a></li>
        <li><a href="/docs.php" class="<?= $page === 'docs' ? 'active' : '' ?>">Docs</a></li>
        <li>
          <a href="https://github.com/convro/Bpanel" class="nav-github" target="_blank" rel="noopener">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
            GitHub
          </a>
        </li>
      </ul>
    </div>
  </nav>
