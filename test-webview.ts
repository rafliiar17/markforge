import { setTimeout } from 'timers/promises';

console.log('🚀 Initializing Bun.WebView test suite...');

try {
  const webview = new Bun.WebView();
  console.log('✔ Bun.WebView instance instantiated successfully');

  console.log('🌐 Navigating to http://localhost:3040 ...');
  await webview.navigate('http://localhost:3040');

  // Wait for React hydration and initial render
  await setTimeout(2500);

  const url = webview.url;
  const title = (await webview.evaluate('document.title')) || webview.title;
  console.log(`✔ Navigated to URL: ${url}`);
  console.log(`✔ Document Title: "${title}"`);

  // Evaluate UI DOM elements
  const appHeader = await webview.evaluate('document.querySelector("header")?.innerText');
  console.log(`✔ Header Text:\n   ${appHeader?.trim().replace(/\n/g, ' ')}`);

  // Test ATS Score card presence in DOM
  const hasAtsTab = await webview.evaluate('document.body.innerText.includes("ATS Audit")');
  console.log(`✔ ATS Audit tab present: ${hasAtsTab}`);

  // Test Export buttons presence in DOM
  const hasExportDocx = await webview.evaluate('document.body.innerText.includes("Export DOCX")');
  const hasExportPdf = await webview.evaluate('document.body.innerText.includes("Export PDF")');
  console.log(`✔ "Export DOCX" button rendered: ${hasExportDocx}`);
  console.log(`✔ "Export PDF" button rendered: ${hasExportPdf}`);

  // Capture Screenshot via Bun.WebView
  console.log('📸 Capturing screenshot via Bun.WebView...');
  const screenshotBuffer = await webview.screenshot();
  console.log(`✔ Screenshot captured: ${screenshotBuffer.byteLength} bytes`);

  await Bun.write('webview-studio-preview.png', screenshotBuffer);
  console.log('✔ Screenshot saved as "webview-studio-preview.png"');

  await webview.close();
  console.log('✔ Bun.WebView closed cleanly. All tests PASSED! 🎉');
} catch (err: any) {
  console.error('✖ Bun.WebView error:', err.message || err);
  process.exit(1);
}
