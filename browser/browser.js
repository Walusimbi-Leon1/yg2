#!/usr/bin/env node
/**
 * browser.js — L4 Remote Browser CDP CLI
 * Control a Docker Chromium instance via Chrome DevTools Protocol.
 *
 * Usage:
 *   node browser.js status          — List open tabs
 *   node browser.js open <url>      — Open a new tab
 *   node browser.js eval <id> <js>  — Run JS in a tab
 *   node browser.js screenshot [id] — Screenshot a tab (or active tab)
 *   node browser.js navigate <id> <url> — Navigate a tab
 *   node browser.js close <id>      — Close a tab
 *   node browser.js html <id>       — Get page HTML
 */

import CDP from 'chrome-remote-interface';
const CDP_HOST = process.env.CDP_HOST || '127.0.0.1';
const CDP_PORT = parseInt(process.env.CDP_PORT || '9223', 10);

async function getTabs() {
  const list = await CDP.List({ host: CDP_HOST, port: CDP_PORT });
  return list;
}

async function main() {
  const [cmd, ...args] = process.argv.slice(2);

  if (!cmd || cmd === 'help') {
    console.log(`
Usage:
  node browser.js status              — List open tabs
  node browser.js open <url>          — Open a new tab
  node browser.js eval <id> <js>      — Run JS in a tab
  node browser.js screenshot [id]     — Screenshot a tab (or active)
  node browser.js navigate <id> <url> — Navigate a tab
  node browser.js close <id>          — Close a tab
  node browser.js html <id>           — Get page HTML
    `.trim());
    return;
  }

  switch (cmd) {
    case 'status': {
      const tabs = await getTabs();
      if (tabs.length === 0) {
        console.log('No open tabs.');
        return;
      }
      for (const tab of tabs) {
        console.log(`[${tab.id}] ${tab.title || '(untitled)'} — ${tab.url || '(no url)'}`);
      }
      break;
    }

    case 'open': {
      const url = args[0] || 'https://google.com';
      const tab = await CDP.New({ host: CDP_HOST, port: CDP_PORT, url });
      console.log(`Opened: [${tab.id}] ${tab.title || url}`);
      break;
    }

    case 'eval': {
      const [tabId, ...jsParts] = args;
      if (!tabId || jsParts.length === 0) {
        console.log('Usage: node browser.js eval <tabId> <javascript>');
        process.exit(1);
      }
      const js = jsParts.join(' ');
      const client = await CDP({ host: CDP_HOST, port: CDP_PORT, target: tabId });
      try {
        const { Runtime } = client;
        const result = await Runtime.evaluate({ expression: js, returnByValue: true });
        if (result.exceptionDetails) {
          console.error('Error:', result.exceptionDetails.text);
        } else {
          console.log(result.result.value);
        }
      } finally {
        client.close();
      }
      break;
    }

    case 'screenshot': {
      const tabId = args[0] || undefined;
      const client = tabId
        ? await CDP({ host: CDP_HOST, port: CDP_PORT, target: tabId })
        : await CDP({ host: CDP_HOST, port: CDP_PORT });
      try {
        const { Page } = client;
        await Page.enable();
        const { data } = await Page.captureScreenshot({ format: 'png', fromSurface: true });
        const path = tabId ? `screenshot-${tabId}.png` : 'screenshot.png';
        import('fs').then(fs => {
          fs.writeFileSync(path, Buffer.from(data, 'base64'));
          console.log(`Screenshot saved: ${path}`);
        });
      } finally {
        client.close();
      }
      break;
    }

    case 'navigate': {
      const [tabId, url] = args;
      if (!tabId || !url) {
        console.log('Usage: node browser.js navigate <tabId> <url>');
        process.exit(1);
      }
      const client = await CDP({ host: CDP_HOST, port: CDP_PORT, target: tabId });
      try {
        const { Page } = client;
        await Page.enable();
        await Page.navigate({ url });
        console.log(`Navigated [${tabId}] to ${url}`);
      } finally {
        client.close();
      }
      break;
    }

    case 'close': {
      const tabId = args[0];
      if (!tabId) {
        console.log('Usage: node browser.js close <tabId>');
        process.exit(1);
      }
      await CDP.Close({ host: CDP_HOST, port: CDP_PORT, id: tabId });
      console.log(`Closed tab: ${tabId}`);
      break;
    }

    case 'html': {
      const tabId = args[0];
      if (!tabId) {
        console.log('Usage: node browser.js html <tabId>');
        process.exit(1);
      }
      const client = await CDP({ host: CDP_HOST, port: CDP_PORT, target: tabId });
      try {
        const { DOM } = client;
        await DOM.enable();
        const { root } = await DOM.getDocument({ depth: -1 });
        const { nodeId } = root;
        const { outerHTML } = await DOM.getOuterHTML({ nodeId });
        console.log(outerHTML);
      } finally {
        client.close();
      }
      break;
    }

    default:
      console.log(`Unknown command: ${cmd}`);
      process.exit(1);
  }
}

main().catch(err => {
  if (err.message?.includes('connect ECONNREFUSED')) {
    console.error('❌ Cannot connect to CDP. Is the browser container running?');
    console.error('   Run: ./bin/start-browser');
  } else {
    console.error(err);
  }
  process.exit(1);
});
