#!/usr/bin/env node
/**
 * L4 Git Dashboard — port 3002
 *
 * Shows workspace vs repo status with commit+push controls.
 * Pure Node.js, zero dependencies.
 */

import http from 'node:http';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { URL } from 'node:url';

const PORT = parseInt(process.env.GIT_DASHBOARD_PORT || '3002', 10);
const WORKSPACE = process.env.GIT_DASHBOARD_WORKSPACE ||
  (() => { try { return execSync('git rev-parse --show-toplevel 2>/dev/null').toString().trim(); } catch { return process.cwd(); } })();

// ─── Helpers ────────────────────────────────────────────────

function sh(cmd, opts = {}) {
  try {
    const out = execSync(cmd, { cwd: WORKSPACE, encoding: 'utf-8', ...opts });
    return { ok: true, stdout: out.trim(), stderr: '' };
  } catch (e) {
    return { ok: false, stdout: e.stdout?.trim() || '', stderr: e.stderr?.trim() || e.message };
  }
}

// ─── API handlers ───────────────────────────────────────────

function apiStatus() {
  const status = sh('git status --porcelain');
  if (!status.ok) return { error: status.stderr };

  const lines = status.stdout ? status.stdout.split('\n').filter(Boolean) : [];
  const staged = [];
  const unstaged = [];
  const untracked = [];

  for (const line of lines) {
    const xy = line.slice(0, 2);
    const file = line.slice(3);
    if (xy[0] !== ' ' && xy[0] !== '?') staged.push({ status: xy[0], file });
    if (xy[1] !== ' ') unstaged.push({ status: xy[1], file });
    if (xy === '??') untracked.push({ file: line.slice(3) });
  }

  // Branch info
  const branch = sh('git rev-parse --abbrev-ref HEAD');
  const commit = sh('git rev-parse --short HEAD');
  const remote = sh(`git rev-parse --abbrev-ref --symbolic-full-name @{upstream} 2>/dev/null`);

  // Ahead / behind counts
  const behind = sh(`git rev-list --count HEAD..@{upstream} 2>/dev/null`);
  const ahead = sh(`git rev-list --count @{upstream}..HEAD 2>/dev/null`);

  // Last commit info
  const lastCommit = sh(`git log -1 --format="%h %s (%ar)"`);

  return {
    branch: branch.stdout || 'unknown',
    commit: commit.stdout || 'unknown',
    remote: remote.stdout || '(no remote)',
    behind: behind.ok ? parseInt(behind.stdout || '0') : 0,
    ahead: ahead.ok ? parseInt(ahead.stdout || '0') : 0,
    lastCommit: lastCommit.stdout || '(no commits)',
    staged,
    unstaged,
    untracked,
    dirty: lines.length > 0,
    clean: lines.length === 0,
  };
}

function apiDiff(type) {
  let cmd;
  switch (type) {
    case 'staged':   cmd = 'git diff --cached --stat'; break;
    case 'unstaged': cmd = 'git diff --stat'; break;
    case 'all':      cmd = 'git diff --stat'; break;
    default:         cmd = 'git diff --stat'; break;
  }
  const r = sh(cmd);
  if (!r.ok) return { error: r.stderr };
  return { diff: r.stdout || '(no diff)' };
}

function apiCommit(message) {
  if (!message || !message.trim()) return { error: 'Commit message is required' };

  // Stage everything first
  const add = sh('git add -A');
  if (!add.ok) return { error: `git add failed: ${add.stderr}` };

  const msg = message.trim();
  // Handle multi-line: use -m safely
  const commit = sh(`git commit -m ${JSON.stringify(msg)}`);
  if (!commit.ok) return { error: `git commit failed: ${commit.stderr}` };

  return { ok: true, message: commit.stdout };
}

function apiPush() {
  const branch = sh('git rev-parse --abbrev-ref HEAD');
  if (!branch.ok) return { error: 'Cannot determine branch' };

  const push = sh(`git push origin ${branch.stdout} 2>&1`);
  if (!push.ok) return { error: `Push failed: ${push.stderr}` };
  return { ok: true, message: push.stdout };
}

// ─── HTML page ──────────────────────────────────────────────

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>L4 Git Dashboard</title>
<style>
  :root {
    --bg: #0d1117;
    --card: #161b22;
    --border: #30363d;
    --text: #e6edf3;
    --muted: #8b949e;
    --green: #3fb950;
    --red: #f85149;
    --yellow: #d29922;
    --blue: #58a6ff;
    --btn-bg: #238636;
    --btn-hover: #2ea043;
    --btn-danger: #da3633;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    background: var(--bg);
    color: var(--text);
    padding: 24px;
    max-width: 960px;
    margin: 0 auto;
    line-height: 1.5;
  }
  h1 { font-size: 1.5rem; margin-bottom: 4px; display: flex; align-items: center; gap: 10px; }
  .subtitle { color: var(--muted); font-size: 0.85rem; margin-bottom: 20px; }
  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 16px 20px;
    margin-bottom: 16px;
  }
  .card h2 { font-size: 1rem; margin-bottom: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; }
  .row { display: flex; justify-content: space-between; padding: 4px 0; }
  .label { color: var(--muted); }
  .badge {
    display: inline-block; padding: 1px 8px; border-radius: 10px; font-size: 0.75rem; font-weight: 600;
  }
  .badge.green { background: #1b4527; color: var(--green); }
  .badge.red { background: #4d1b1b; color: var(--red); }
  .badge.yellow { background: #4d3d00; color: var(--yellow); }
  .badge.blue { background: #0a3158; color: var(--blue); }
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', monospace; }
  th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid var(--border); }
  th { color: var(--muted); font-weight: 500; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.5px; }
  td.status { width: 40px; font-weight: 700; }
  td.status.M { color: var(--yellow); }
  td.status.A { color: var(--green); }
  td.status.D { color: var(--red); }
  td.status.R { color: var(--blue); }
  td.status.QQ { color: var(--red); }
  td.file { word-break: break-all; }
  .empty { color: var(--muted); text-align: center; padding: 20px 0; font-size: 0.9rem; }
  textarea {
    width: 100%; background: #010409; border: 1px solid var(--border); border-radius: 6px;
    color: var(--text); padding: 10px 12px; font-size: 0.9rem; resize: vertical;
    font-family: inherit; min-height: 60px;
  }
  textarea:focus { outline: none; border-color: var(--blue); }
  .btn-row { display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap; }
  button {
    padding: 8px 20px; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; font-weight: 600;
    transition: all 0.15s;
  }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-primary { background: var(--btn-bg); color: #fff; }
  .btn-primary:hover:not(:disabled) { background: var(--btn-hover); }
  .btn-secondary { background: #21262d; color: var(--text); border: 1px solid var(--border); }
  .btn-secondary:hover:not(:disabled) { background: #30363d; }
  .btn-danger { background: var(--btn-danger); color: #fff; }
  .btn-danger:hover:not(:disabled) { background: #f03c3c; }
  #output {
    background: #010409; border: 1px solid var(--border); border-radius: 6px;
    padding: 12px 16px; font-family: 'SF Mono', monospace; font-size: 0.8rem; white-space: pre-wrap;
    max-height: 300px; overflow-y: auto; margin-top: 10px;
    display: none; color: var(--muted);
  }
  #output.show { display: block; }
  #output.error { color: var(--red); border-color: var(--red); }
  #output.success { color: var(--green); border-color: var(--green); }
  .spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid var(--border); border-top-color: var(--blue); border-radius: 50%; animation: spin 0.6s linear infinite; vertical-align: middle; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .ahead-behind { display: flex; gap: 16px; margin: 8px 0; }
  .stat { text-align: center; padding: 8px 16px; border-radius: 6px; background: #010409; flex: 1; }
  .stat .num { font-size: 1.5rem; font-weight: 700; }
  .stat .lbl { font-size: 0.7rem; text-transform: uppercase; color: var(--muted); letter-spacing: 0.5px; }
  .stat.dirty .num { color: var(--yellow); }
  .stat.clean .num { color: var(--green); }
  .stat .num.neutral { color: var(--muted); }
  .footer { text-align: center; color: var(--muted); font-size: 0.75rem; margin-top: 30px; }
</style>
</head>
<body>
  <h1>
    🥒 L4 Git Dashboard
    <span id="workState" class="badge">loading</span>
  </h1>
  <div class="subtitle" id="subtitle">Loading workspace state...</div>

  <div class="card">
    <h2>Status</h2>
    <div class="row"><span class="label">Branch</span><span id="branch">—</span></div>
    <div class="row"><span class="label">Last Commit</span><span id="lastCommit">—</span></div>
    <div class="row"><span class="label">Remote</span><span id="remote">—</span></div>
    <div class="ahead-behind">
      <div class="stat" id="aheadStat"><div class="num" id="aheadNum">-</div><div class="lbl">Ahead</div></div>
      <div class="stat" id="behindStat"><div class="num" id="behindNum">-</div><div class="lbl">Behind</div></div>
      <div class="stat" id="filesStat"><div class="num" id="filesNum">-</div><div class="lbl">Changed</div></div>
    </div>
  </div>

  <div class="card" id="stagedCard">
    <h2>📌 Staged</h2>
    <div id="stagedContent"><div class="empty">No staged changes</div></div>
  </div>

  <div class="card" id="unstagedCard">
    <h2>✏️ Unstaged</h2>
    <div id="unstagedContent"><div class="empty">No unstaged changes</div></div>
  </div>

  <div class="card" id="untrackedCard">
    <h2>📄 Untracked</h2>
    <div id="untrackedContent"><div class="empty">No untracked files</div></div>
  </div>

  <div class="card" id="commitCard">
    <h2>🚀 Commit &amp; Push</h2>
    <textarea id="commitMsg" placeholder="Describe what changed..." rows="2"></textarea>
    <div class="btn-row">
      <button class="btn-primary" id="btnCommit" onclick="commitAndPush()">Commit &amp; Push</button>
      <button class="btn-secondary" id="btnRefresh" onclick="loadStatus()">⟳ Refresh</button>
    </div>
    <div id="output"></div>
  </div>

  <div class="footer">
    Workspace: <code>${WORKSPACE}</code> &mdash; Updated <span id="updateTime">just now</span>
  </div>

<script>
let loading = false;

function $(id) { return document.getElementById(id); }

async function api(path, opts = {}) {
  const r = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts
  });
  return r.json();
}

function showOutput(msg, type = '') {
  const el = $('output');
  el.textContent = typeof msg === 'string' ? msg : JSON.stringify(msg, null, 2);
  el.className = type ? 'show ' + type : 'show';
}

function clearOutput() {
  $('output').className = '';
  $('output').textContent = '';
}

function renderFileTable(files, label) {
  if (!files || files.length === 0) return '<div class="empty">No ' + label + ' files</div>';
  let html = '<table><tr><th></th><th>File</th></tr>';
  for (const f of files) {
    const st = f.status || '?';
    const fileName = f.file || f;
    html += '<tr><td class="status ' + st + '">' + st + '</td><td class="file">' + escHtml(fileName) + '</td></tr>';
  }
  return html + '</table>';
}

function escHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

async function loadStatus() {
  if (loading) return;
  loading = true;
  $('btnRefresh').textContent = '⟳ Refreshing...';
  clearOutput();

  const data = await api('/api/status');

  if (data.error) {
    $('subtitle').textContent = '❌ ' + data.error;
    loading = false;
    $('btnRefresh').textContent = '⟳ Refresh';
    return;
  }

  // Branch info
  $('branch').textContent = data.branch || '—';
  $('lastCommit').textContent = data.lastCommit || '—';
  $('remote').textContent = data.remote || '—';

  // Ahead / behind
  $('aheadNum').textContent = data.ahead ?? '0';
  $('behindNum').textContent = data.behind ?? '0';
  $('filesNum').textContent = (data.staged.length + data.unstaged.length + data.untracked.length);

  // Work state badge
  const stateEl = $('workState');
  if (data.clean) {
    stateEl.textContent = '✅ Up to date';
    stateEl.className = 'badge green';
  } else if (data.dirty) {
    stateEl.textContent = '⚠️  Uncommitted';
    stateEl.className = 'badge yellow';
  }

  // Staged
  $('stagedContent').innerHTML = renderFileTable(data.staged, 'staged');
  $('stagedCard').style.display = data.staged.length > 0 ? '' : 'none';

  // Unstaged
  $('unstagedContent').innerHTML = renderFileTable(data.unstaged, 'unstaged');
  $('unstagedCard').style.display = data.unstaged.length > 0 ? '' : 'none';

  // Untracked
  $('untrackedContent').innerHTML = renderFileTable(data.untracked, 'untracked');
  $('untrackedCard').style.display = data.untracked.length > 0 ? '' : 'none';

  // Show/hide commit card
  $('commitCard').style.display = data.dirty ? '' : 'none';

  $('subtitle').textContent = 'Branch: ' + data.branch + '  •  HEAD: ' + data.commit;
  $('updateTime').textContent = new Date().toLocaleTimeString();
  $('btnRefresh').textContent = '⟳ Refresh';
  loading = false;
}

async function commitAndPush() {
  const msg = $('commitMsg').value.trim();
  if (!msg) {
    showOutput('Please enter a commit message.', 'error');
    return;
  }

  $('btnCommit').disabled = true;
  $('btnCommit').innerHTML = '<span class="spinner"></span> Committing...';
  clearOutput();

  // Step 1: Commit
  const commitRes = await api('/api/commit', {
    method: 'POST',
    body: JSON.stringify({ message: msg })
  });

  if (commitRes.error) {
    showOutput('❌ ' + commitRes.error, 'error');
    $('btnCommit').disabled = false;
    $('btnCommit').textContent = 'Commit & Push';
    return;
  }

  showOutput('✅ ' + (commitRes.message || 'Committed!'), 'success');

  // Step 2: Push
  $('btnCommit').innerHTML = '<span class="spinner"></span> Pushing...';
  const pushRes = await api('/api/push', { method: 'POST' });

  if (pushRes.error) {
    showOutput('⚠️ Commit OK, but push failed: ' + pushRes.error, 'error');
  } else {
    showOutput('✅ ' + (pushRes.message || 'Pushed to remote!'), 'success');
  }

  $('btnCommit').disabled = false;
  $('btnCommit').textContent = 'Commit & Push';
  $('commitMsg').value = '';

  // Refresh status
  setTimeout(loadStatus, 1000);
}

// Auto-refresh every 30s
loadStatus();
setInterval(loadStatus, 30000);
</script>
</body>
</html>`;

// ─── HTTP server ────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API routes
  if (path === '/api/status') {
    const data = apiStatus();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
    return;
  }

  if (path === '/api/diff') {
    const type = url.searchParams.get('type') || 'all';
    const data = apiDiff(type);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
    return;
  }

  if (path === '/api/commit' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { message } = JSON.parse(body);
        const data = apiCommit(message);
        res.writeHead(data.error ? 400 : 200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request: ' + e.message }));
      }
    });
    return;
  }

  if (path === '/api/push' && req.method === 'POST') {
    const data = apiPush();
    res.writeHead(data.error ? 400 : 200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
    return;
  }

  // Serve HTML
  if (path === '/' || path === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(HTML);
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🥒 L4 Git Dashboard → http://127.0.0.1:${PORT}`);
  console.log(`   Workspace: ${WORKSPACE}`);
});
