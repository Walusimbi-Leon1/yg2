import CDP from 'chrome-remote-interface';

const host = '127.0.0.1';
const port = 9223;

async function main() {
  const tabId = process.argv[2];
  if (!tabId) { console.log('Usage: node check.js <tabId>'); process.exit(1); }

  let client;
  try {
    client = await CDP({ host, port, target: tabId });
    const { Runtime, Page, Console } = client;

    await Console.enable();
    Console.messageAdded((msg) => {
      console.log('[CONSOLE]', msg.message.level, ':', msg.message.text);
    });

    await Runtime.enable();
    await Page.enable();
    await Page.reload({ ignoreCache: true });

    // Wait for page + 5s timeout + name input appearance
    for (let i = 0; i < 12; i++) {
      await new Promise(r => setTimeout(r, 1000));
      
      const status = await Runtime.evaluate({ expression: 'document.querySelector("#splashStatus")?.textContent || ""' });
      const btn = await Runtime.evaluate({ expression: 'document.querySelector("#playBtn")?.textContent || ""' });
      const btnDisplay = await Runtime.evaluate({ expression: 'document.querySelector("#playBtn")?.style?.display || ""' });
      const title = await Runtime.evaluate({ expression: 'document.title' });
      
      console.log(`[${i+1}s] Title: "${title.result.value}" | Status: "${status.result.value}" | Play: "${btn.result.value}" display="${btnDisplay.result.value}"`);
    }

    // Take a screenshot
    const screenshot = await Page.captureScreenshot({ format: 'png' });
    console.log('SCREENSHOT:' + Buffer.from(screenshot.data, 'base64').toString('base64'));

  } catch (err) {
    console.error('Error:', err.message, err.stack?.split('\n').slice(0,3).join('\n'));
  } finally {
    if (client) await client.close();
  }
}

main();
