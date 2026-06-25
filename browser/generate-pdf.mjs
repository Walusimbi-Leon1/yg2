#!/usr/bin/env node
/**
 * generate-pdf.js — Use Chrome CDP to print an HTML page to PDF
 * Usage: node generate-pdf.js <html-url> <output-path>
 */

import CDP from 'chrome-remote-interface';
import { writeFileSync } from 'node:fs';

const CDP_HOST = process.env.CDP_HOST || '127.0.0.1';
const CDP_PORT = parseInt(process.env.CDP_PORT || '9223', 10);
const url = process.argv[2];
const output = process.argv[3];

if (!url || !output) {
  console.error('Usage: node generate-pdf.js <url> <output.pdf>');
  process.exit(1);
}

let client;
try {
  client = await CDP({ host: CDP_HOST, port: CDP_PORT });
  const { Page } = client;

  await Page.enable();
  console.log(`   Loading: ${url}`);
  await Page.navigate({ url });
  await Page.loadEventFired();

  // Wait a bit for any async rendering
  await new Promise(r => setTimeout(r, 2000));

  console.log('   Generating PDF...');
  const { data } = await Page.printToPDF({
    landscape: false,
    displayHeaderFooter: false,
    printBackground: true,
    paperWidth: 8.27,
    paperHeight: 11.69,
    marginTop: 0.75,
    marginBottom: 0.75,
    marginLeft: 0.75,
    marginRight: 0.75,
  });

  writeFileSync(output, Buffer.from(data, 'base64'));
  console.log(`   ✅ PDF saved: ${output}`);
} catch (err) {
  console.error(`   ❌ Error: ${err.message}`);
  process.exit(1);
} finally {
  if (client) client.close();
}
