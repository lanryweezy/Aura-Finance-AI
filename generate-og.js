import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateOgImage() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Set viewport to OG image dimensions
  await page.setViewportSize({ width: 1200, height: 630 });

  // Load the template
  const templatePath = 'file://' + path.join(__dirname, 'og-template.html');
  await page.goto(templatePath);

  // Wait for fonts to load
  await page.evaluateHandle(() => document.fonts.ready);

  // Capture screenshot
  await page.screenshot({
    path: 'og-image.png',
    type: 'png'
  });

  await browser.close();
  console.log('OG image generated successfully as og-image.png');
}

generateOgImage().catch(err => {
  console.error('Error generating OG image:', err);
  process.exit(1);
});
