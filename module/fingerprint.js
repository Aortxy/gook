const VIEWPORTS = [
  { width: 1920, height: 1080 },
  { width: 1536, height: 864 },
  { width: 1440, height: 900 },
  { width: 1366, height: 768 },
  { width: 1680, height: 1050 },
];

const LOCALES = [
  "en-US,en;q=0.9",
  "en-GB,en;q=0.9",
  "en-US,en;q=0.9,de;q=0.8",
];

const USER_AGENTS = [
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36",
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function applyFingerprint(page) {
  const viewport = pick(VIEWPORTS);
  const locale = pick(LOCALES);
  try {
    await page.setViewport(viewport);
  } catch (e) {}
  await page.setExtraHTTPHeaders({
    "Accept-Language": locale,
  });
  return { viewport, locale };
}

module.exports = {
  applyFingerprint,
  USER_AGENTS,
};
