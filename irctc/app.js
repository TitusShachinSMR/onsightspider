import express from "express";
import path from "path";
import { fileURLToPath } from "url";
const app = express();
import * as puppeteer from "puppeteer";
import bodyParser from "body-parser";
// Get __filename and __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(bodyParser.json()); // Parse JSON data
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded data
const PORT = process.env.PORT || 3500;
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/dashboard.html"));
});

async function fetchPNRStatus(trainnumber) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  console.log(trainnumber);
  // navigating to pnr website
  await page.goto(
    `https://www.ixigo.com/trains/${trainnumber}/running-status`,
    {
      waitUntil: "networkidle2",
    }
  );
  try {
    // extracting data from the page
    const data = await page.evaluate(() => {
      const result = {};
      result.trainName = document.querySelector(
        "#content > div > div > div.u-ib.u-layout-col-1.u-pos-rel > div.train-info > h1"
      ).textContent;
      result.date = document.querySelector(
        "#content > div > div > div.u-ib.u-layout-col-1.u-pos-rel > div.running-status-cntr > div > div.date-list-cntr.u-ib > div.date-item.u-ib.selected > div.date-str"
      ).textContent;
      result.currentsituation = document.querySelector(
        "#content > div > div > div.u-ib.u-layout-col-1.u-pos-rel > div.running-status-cntr > div > div.info-cntr.u-ib > div.overall-delay.green > div"
      ).textContent;
      result.table = document.querySelector(
        "#content > div > div > div.u-ib.u-layout-col-1.u-pos-rel > div.running-status-cntr > div > table"
      ).innerHTML;
      return result;
    });

    await browser.close();
    return data;
  } catch (err) {
    await browser.close();
    console.error(err);
    return { error: "Failed to fetch PNR status" };
  }
}
app.post("/trainname", async function (req, res) {
  const { trainnumber } = req.body;

  console.log(trainnumber);
  const traindata = await fetchPNRStatus(trainnumber);
  res.json(traindata);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
