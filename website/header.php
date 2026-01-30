<?php
$page = basename($_SERVER['PHP_SELF'], '.php');
$pageTitle = [
  'index' => 'Bpanel — Something Fucking Refreshing',
  'docs' => 'Bpanel — Documentation',
  'install' => 'Bpanel — Installation Guide',
][$page] ?? 'Bpanel';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= htmlspecialchars($pageTitle) ?></title>
  <meta name="description" content="Bpanel - A web-based VPS management panel. File manager, code editor, and terminal in your browser.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/main.css">
  <link rel="stylesheet" href="/css/responsive.css">
</head>
<body>
  <nav class="navbar" id="navbar">
    <div class="container nav-container">
      <a href="/" class="nav-logo">B<span>panel</span></a>
      <button class="nav-toggle" id="nav-toggle" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
      <ul class="nav-links" id="nav-links">
        <li><a href="/" class="<?= $page === 'index' ? 'active' : '' ?>">Home</a></li>
        <li><a href="/docs.php" class="<?= $page === 'docs' ? 'active' : '' ?>">Docs</a></li>
        <li><a href="/install.php" class="<?= $page === 'install' ? 'active' : '' ?>">Install</a></li>
        <li><a href="https://github.com/convro/Bpanel" class="nav-github" target="_blank">GitHub</a></li>
      </ul>
    </div>
  </nav>
