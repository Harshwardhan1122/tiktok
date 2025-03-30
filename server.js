const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.post("/download", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "No URL provided" });
  }

  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto("https://ssstik.io/en", { waitUntil: "networkidle2" });

    await page.type("input[name='id']", url);
    await page.click("button[type='submit']");

    await page.waitForSelector("a.without_watermark[href]", { timeout: 20000 });
    const videoLink = await page.$eval(
      "a.without_watermark[href]",
      (el) => el.href
    );

    await browser.close();
    return res.json({ videoUrl: videoLink });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch video" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
