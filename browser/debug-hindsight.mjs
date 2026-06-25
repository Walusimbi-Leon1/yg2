import CDP from 'chrome-remote-interface';

const host = '127.0.0.1';
const port = 9223;

async function main() {
  const targetId = process.argv[2];
  if (!targetId) { console.log('Usage: node debug.mjs <targetId>'); process.exit(1); }

  let client;
  try {
    client = await CDP({ host, port, target: targetId });
    const { Runtime, Console, Page } = client;

    await Console.enable();
    Console.messageAdded((msg) => {
      console.log('🟡', msg.message.level, ':', msg.message.text);
    });

    await Runtime.enable();
    Runtime.consoleAPICalled((msg) => {
      const args = msg.args.map(a => a.value || a.description).join(' ');
      console.log('🔵', msg.type, ':', args);
    });
    Runtime.exceptionThrown((exc) => {
      console.log('🔴 EXC:', exc.exceptionDetails?.text || exc.exceptionDetails?.exception?.description);
    });

    await Page.enable();

    // Reload to see fresh console
    await Page.reload({ ignoreCache: true });

    // Watch for status changes
    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 1000));
      try {
        const status = await Runtime.evaluate({ expression: 'document.querySelector("#splashStatus")?.textContent || "N/A"' });
        const btn = await Runtime.evaluate({ expression: 'typeof document.querySelector("#playBtn")?.onclick' });
        const body = await Runtime.evaluate({ expression: 'document.body?.innerText?.substring(0,300) || "N/A"' });
        console.log(`[${i+1}s] Status: "${status.result.value}" | onclick: ${btn.result.value}`);
        if (body.result.value !== 'N/A' && i % 3 === 0) {
          console.log(`  Body: ${body.result.value.replace(/\n/g, ' | ')}`);
        }
      } catch(e) {
        console.log(`[${i+1}s] Eval error: ${e.message}`);
      }
    }

    // Final screenshot
    const ss = await Page.captureScreenshot({ format: 'png', fromSurface: true });
    console.log('\nSCREENSHOT:' + ss.data);

    await client.close();
  } catch (err) {
    console.error('Fatal:', err.message);
    if (client) await client.close();
  }
}

main();
