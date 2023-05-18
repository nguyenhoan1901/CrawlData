const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs");
const url = require("url");
const axios = require("axios");
const cron = require("node-cron");
const { json } = require("express");

puppeteer.use(StealthPlugin());

const extractMmsiFromUrl = (url) => {
  const regex = /mmsi:(\d+)/;
  const matches = url.match(regex);

  if (matches && matches.length > 1) {
    return matches[1];
  }

  return null;
};
const fetchData = async () => {
  try {
    const browser = await puppeteer.launch({
      handless: false
    });
    const page = await browser.newPage();
    let requestCount = 0;
    let isEvaluated = false;
    const temptData = [
      "6558323",
      "4235634",
      "5822293",
      "5892749",
      "6387411",
      "6390527",
      "461028",
      "211872",
      "704470",
      "6923578",
      "6002670",
      "993773",
      "6004215",
    ];
    page.on("response", async (response) => {
      const url = response.url();
      if (
        url.includes("https://www.marinetraffic.com/getData/get_data_json_4") &&
        !isEvaluated
      ) {
        const data = await response.json();

        filteredData = data.data.rows.filter((item) => {
          return temptData.some((id) => id === item.SHIP_ID);
        });

        if (filteredData.length > 0) {
          fs.writeFileSync("updated_data.json", JSON.stringify(filteredData));
        }
        isEvaluated = true;
      }
    });
    page.on("request", (request) => {
      if (
        request
          .url()
          .includes("https://www.marinetraffic.com/getData/get_data_json_4")
      ) {
        console.log(request.url());
        requestCount++;
      }
    });
    page.on("requestfinished", (request) => {
      if (
        request
          .url()
          .includes("https://www.marinetraffic.com/getData/get_data_json_4")
      ) {
        requestCount--;
      }
    });
    page.on("requestfailed", (request) => {
      if (
        request
          .url()
          .includes("https://www.marinetraffic.com/getData/get_data_json_4")
      ) {
        requestCount--;
      }
    });

    await page.goto("https://www.marinetraffic.com/users/login");

    await page.waitForSelector(".css-47sehv");
    // Click on the button
    await page.click(".css-47sehv");

    await page.waitForSelector("#email");
    await page.type("#email", "andusong2488@gmail.com");

    await page.waitForSelector("#password");
    await page.type("#password", "huongKhenh123");

    await page.waitForSelector("#login_form_submit");
    await page.click("#login_form_submit");

    await page.waitForNavigation();
    await page.goto(
      "https://www.marinetraffic.com/en/ais/home/centerx:107.4/centery:-2.0/zoom:7"
    );

    await page.waitForTimeout(30000);

    while (requestCount > 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    await browser.close();
  } catch (error) {
    console.log(error);
  }
};

cron.schedule("*/1 * * * *", () => {
  fetchData();
});

// const getMmsi = async () => {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   if (!fs.existsSync("updated_data.json")) {
//     console.log("File 'updated_data.json' not found.");
//     await browser.close();
//     return;
//   }
//   const data = fs.readFileSync("updated_data.json");
//   const jsonData = JSON.parse(data);
//   if (jsonData.length > 0) {
//     for (let i = 0; i < jsonData.length; i++) {
//       // Delete all cookies
//       const client = await page.target().createCDPSession();
//       await client.send("Network.clearBrowserCookies");
//       // Disable cache
//       await page.setCacheEnabled(false);
//       const shipId = jsonData[i].SHIP_ID;
//       const url = `https://www.marinetraffic.com/en/ais/details/ships/shipid:${shipId}`;
//       await page.goto(url);
//       const currentUrl = page.url();
//       const mmsi = extractMmsiFromUrl(currentUrl);
//       if (mmsi !== null) {
//         jsonData[i].MMSI = mmsi;
//         console.log("Thanh cong thu " + i);
//       } else {
//         console.log("That bau thu " + i);
//       }
//     }
//     fs.writeFileSync("input.json", JSON.stringify(jsonData));
//     fs.unlinkSync("updated_data.json");
//     await browser.close();
//   }
// };
// cron.schedule("*/1 * * * *", () => {
//   getMmsi();
// });