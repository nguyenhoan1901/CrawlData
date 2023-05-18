const puppeteer = require('puppeteer');
const fs = require('fs');
const url = require('url');
const axios = require('axios');
const cheerio = require('cheerio');


const $ = cheerio.load('https://www.marinetraffic.com/en/ais/details/ships/shipid:5601460');
const element = $('#mmsi').text();
console.log(element); // Output: "Hello World!"
console.log("gsdfgsd");
// let electronicUrl = 'https://www.marinetraffic.com/en/ais/details/ships/shipid:5601460';
// (async () => {
//     const browser = await puppeteer.launch({ headless: true });
    

//     const page = await browser.newPage();

//     // Delete all cookies
//     const client = await page.target().createCDPSession();
//     await client.send('Network.clearBrowserCookies');

//     // Disable cache
//     await page.setCacheEnabled(false);

//     await page.goto(electronicUrl);

//     // const element = $('#community').text();
//     // console.log(element);
//     // let products = []; // tạo một array để có thể push dữ liệu của từng sản phẩm vào
//     // let product_wrapper = document.querySelectorAll('.product-wrapper');
    
//     // Lặp qua các NodeList để có thể lấy dữ liệu và chuyển thành object
//     // let dataJson = {};
//     // try {
//     // var paragraph = document.querySelector("#community");
//     // var text = paragraph.innerText; // lấy ra chuỗi "This is a paragraph."
//         // dataJson.mmsi = product.querySelector('#mmsi > b').innerText;
//         // dataJson.title = product.querySelector('.woocommerce-loop-product__title').innerText;
//         // dataJson.price = product.querySelector('.price').innerText;
//     // }
//     // catch (err) {
//     //     console.log(err)
//     // }
//     // products.push(dataJson);// Push dữ liệu object vào trong array
//     // console.log(text);
// })();
