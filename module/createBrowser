const { connect } = require("puppeteer-real-browser")

async function createBrowser() {
    try {
        if (global.finished == true) return
        
        global.browser = null

        const { browser } = await connect({
            headless: false,
            turnstile: true,
            connectOption: { 
                defaultViewport: null,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--disable-gpu'
                ]
            },
            disableXvfb: false,
        })

        global.browser = browser;

        browser.on('disconnected', async () => {
            if (global.finished == true) return
            await new Promise(resolve => setTimeout(resolve, 3000));
            await createBrowser();
        })

    } catch (e) {
        if (global.finished == true) return
        await new Promise(resolve => setTimeout(resolve, 3000));
        await createBrowser();
    }
}

  createBrowser()
