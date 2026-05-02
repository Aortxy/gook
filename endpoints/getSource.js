const { applyFingerprint, pick, USER_AGENTS } = require("../module/fingerprint");

function getSource({ url, proxy, waitForMs, waitForSelector, waitForSelectorTimeout, cookies }) {
  return new Promise(async (resolve, reject) => {
    if (!url) return reject("Missing url parameter");

    const context = await global.browser
      .createBrowserContext({
        proxyServer: proxy ? `http://${proxy.host}:${proxy.port}` : undefined,
      })
      .catch(() => null);
    
    if (!context) return reject("Failed to create browser context");

    let isResolved = false;
    const cl = setTimeout(async () => {
      if (!isResolved) {
        await context.close().catch(() => {});
        reject("Timeout Error");
      }
    }, global.timeOut || 60000);

    try {
      const page = await context.newPage();
      await applyFingerprint(page);
      await page.setUserAgent(pick(USER_AGENTS));

      if (cookies?.length > 0) await page.setCookie(...cookies);
      
      if (proxy?.username && proxy?.password) {
        await page.authenticate({
          username: proxy.username,
          password: proxy.password,
        });
      }

      await page.setRequestInterception(true);
      page.on("request", (req) => {
        const resource = req.resourceType();
        if (["image", "media", "font"].includes(resource)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

      await page.waitForFunction(() => {
        const selectors = ['#cf-challenge', '#challenge-running', '#challenge-form', '#trk_jschal_js', '.ray_id', '.loading-msg'];
        const isCF = selectors.some(s => document.querySelector(s));
        const isCFTitle = /Just a moment|Attention Required|Cloudflare/i.test(document.title);
        return !isCF && !isCFTitle && document.readyState === 'complete';
      }, { timeout: 30000, polling: 2000 }).catch(() => {});

      if (waitForSelector) {
        await page.waitForSelector(waitForSelector, { 
          timeout: Math.min(waitForSelectorTimeout || 30000, 60000) 
        }).catch(() => {});
      } else if (waitForMs) {
        await new Promise(r => setTimeout(r, Math.min(waitForMs, 30000)));
      }

      const html = await page.content();
      
      isResolved = true;
      clearTimeout(cl);
      await context.close();
      resolve(html);

    } catch (e) {
      if (!isResolved) {
        clearTimeout(cl);
        await context.close().catch(() => {});
        reject(e.message);
      }
    }
  });
}

module.exports = getSource;
