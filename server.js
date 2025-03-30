const express = require("express");
const puppeteer = require("puppeteer-core");
const chromium = require("chrome-aws-lambda");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post("/download", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "No URL provided" });
  }

  let browser;
  try {
    // Launch browser with optimized settings for Railway
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath:
        (await chromium.executablePath) || "/usr/bin/google-chrome",
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    await page.goto("https://ssstik.io/en", { waitUntil: "networkidle2" });

    await page.type("input[name='id']", url);
    await page.click("button[type='submit']");

    await page.waitForSelector("a.without_watermark[href]", { timeout: 30000 });

    const videoLink = await page.$eval(
      "a.without_watermark[href]",
      (el) => el.href
    );

    await browser.close();
    return res.json({ videoUrl: videoLink });
  } catch (error) {
    console.error("Error:", error);
    if (browser) await browser.close();
    return res.status(500).json({ error: "Failed to fetch video" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
