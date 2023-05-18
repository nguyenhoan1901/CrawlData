const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const url = require('url');
const  axios = require('axios');

puppeteer.use(StealthPlugin());


const extractMmsiFromUrl = (url) => {
    const regex = /mmsi:(\d+)/;
    const matches = url.match(regex);

    if (matches && matches.length > 1) {
        return matches[1];
    }

    return null;
}
// const data = require("./data.json")
(async () => {
    const tempData = ["255806028","311038200","257960000"]
    try {
        const data = fs.readFileSync('filtered_data.json');
        const jsonData = JSON.parse(data);
        const browser = await puppeteer.launch({

        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3');


        for (let i = 0; i < jsonData.length; i++) {

            // Delete all cookies
            const client = await page.target().createCDPSession();
            await client.send('Network.clearBrowserCookies');

            // Disable cache
            await page.setCacheEnabled(false);

            const shipId = jsonData[i].SHIP_ID;
            const url = `https://www.marinetraffic.com/en/ais/details/ships/shipid:${shipId}`;
            await page.goto(url);
            const currentUrl = page.url();
            const mmsi = extractMmsiFromUrl(currentUrl);
            if (mmsi !== null) {
                jsonData[i].MMSI = mmsi;
                console.log("Thanh cong thu " + i);
            }
            else {
                console.log("That bau thu " + i);

            }
        }

        fs.writeFileSync('updated_data.json', JSON.stringify(jsonData));

        await browser.close();

    } catch (error) {
        console.log(error)
    }
})();







// const data = fs.readFileSync('data.json');
// const json = JSON.parse(data);

// // Tạo một mảng mới chỉ chứa các thuộc tính cần thiết
// const filteredData = json.data.rows.map(({ SHIP_ID, LAT, LON }) => ({ SHIP_ID, LAT, LON }));

// // Ghi dữ liệu vào tệp JSON mới
// fs.writeFileSync('filtered_data.json', JSON.stringify(filteredData));