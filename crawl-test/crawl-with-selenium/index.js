const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const url = require('url');
const axios = require('axios');
const { Cluster } = require('puppeteer-cluster');

puppeteer.use(StealthPlugin());


const extractMmsiFromUrl = (url) => {
    const regex = /mmsi:(\d+)/;
    const matches = url.match(regex);

    if (matches && matches.length > 1) {
        return matches[1];
    }

    return null;
}
(async () => {
    try {
        const data = fs.readFileSync('filtered_data.json');
        const jsonData = JSON.parse(data);

        const cluster = await Cluster.launch({
            concurrency: Cluster.CONCURRENCY_CONTEXT,
            maxConcurrency: 5,
            puppeteerOptions: {
                headless: true,
            },
        });

        await cluster.task(async ({ page, data: url }) => {
            // Delete all cookies
            const client = await page.target().createCDPSession();
            await client.send('Network.clearBrowserCookies');

            // Disable cache
            await page.setCacheEnabled(false);

            await page.goto(url);
            const currentUrl = page.url();
            const mmsi = extractMmsiFromUrl(currentUrl);
            console.log(`MMSI for ${url}: ${mmsi}`);
        });

        for (const jsonDataItem of jsonData) {
            const shipId = jsonDataItem.SHIP_ID;
            const url = `https://www.marinetraffic.com/en/ais/details/ships/shipid:${shipId}`;
            await cluster.queue(url);
        }

        await cluster.idle();
        await cluster.close();

    } catch (error) {
        console.log(error)
    }
})();

// Số mini giây ban đầu




const getAll = async () => {
    let ms = 0
    ms += 2 * 60 * 1000;
    ms += 1683347159;
    const url = `https://www.marinetraffic.com/getData/get_data_json_4/z:2/X:1/Y:0/station:0/?cb=_${1683348121}`
    const res = await axios.get(url, {
        headers: {
            'authority': 'www.marinetraffic.com',
            "path": "/getData/get_data_json_4/z:2/X:1/Y:0/station:0/?cb=_1683347159",
            "scheme": "https",
            "accept": "/",
            "cookie": "SERVERID=app5nzs;vTo=1;euconsent-v2=CPrSsYAPrSsYAAKAvAENDDCsAP_AAH_AAAwIJatd_H--bW9r-f5_aft0eY1P9_r77uQzDhfNk-4F3L_W_LwX52E7NF36tq4KmR4Eu3LBIUNlHNHUTVmwaokVryHsak2cpTNKJ6BEkHMZO2dYGF5umxtjeQKY5_p_d3fx2D-t_dv-39z3z81Xn3dZ_-_0-PCdU5_9Dfn9fRfb-9IL9_78v8v8_9_rk2_eX_3_79_77H9-f_9gloASYatxAF2ZY4M2gYRQIgRhWEhFAoAIKAYWiAgAcHBTsrAJ9YRIAUAoAjAiBDgCjIgEAAAkASEQASBFggAABEAgABAAgEQgAYGAQUAFgIBAACAaBiiFAAIEhAkRERCmBAVAkEBLZUIJQXSGmEAVZYAUAiNgoAEQSAisAAQFg4BgiQErFggSYg2iAAYAUAolQrUUnpoCFjMAAAAA.f_gAAAAAAAAA;addtl_consent=1~39.4.3.9.6.9.13.6.4.15.9.5.2.11.1.7.1.3.2.10.3.5.4.21.4.6.9.7.10.2.9.2.18.7.20.5.20.6.5.1.4.11.29.4.14.4.5.3.10.6.2.9.6.6.9.4.4.29.4.5.3.1.6.2.2.17.1.17.10.9.1.8.6.2.8.3.4.146.8.42.15.1.14.3.1.18.25.3.7.25.5.18.9.7.41.2.4.18.21.3.4.2.7.6.5.2.14.18.7.3.2.2.8.20.8.8.6.3.10.4.20.2.13.4.6.4.11.1.3.22.16.2.6.8.2.4.11.6.5.33.11.8.1.10.28.12.1.3.21.2.7.6.1.9.30.17.4.9.15.8.7.3.6.6.7.2.4.1.7.12.13.22.13.2.12.2.10.1.4.15.2.4.9.4.5.4.7.13.5.15.4.13.4.14.10.15.2.5.6.2.2.1.2.14.7.4.8.2.9.10.18.12.13.2.18.1.1.3.1.1.9.25.4.1.19.8.4.5.3.5.4.8.4.2.2.2.14.2.13.4.2.6.9.6.3.2.2.3.5.2.3.6.10.11.6.3.16.3.11.3.1.2.3.9.19.11.15.3.10.7.6.4.3.4.6.3.3.3.3.1.1.1.6.11.3.1.1.11.6.1.10.5.2.6.3.2.2.4.3.2.2.7.15.7.14.1.3.3.4.5.4.3.2.2.5.4.1.1.2.9.1.6.9.1.5.2.1.7.10.11.1.3.1.1.2.1.3.2.6.1.12.5.3.1.3.1.1.2.2.7.7.1.4.1.2.6.1.2.1.1.3.1.1.4.1.1.2.1.8.1.7.4.3.2.1.3.5.3.9.6.1.15.10.28.1.2.2.12.3.4.1.6.3.4.7.1.3.1.1.3.1.5.3.1.3.4.1.1.4.2.1.2.1.2.2.2.4.2.1.2.2.2.4.1.1.1.2.2.1.1.1.1.2.1.1.1.2.2.1.1.2.1.2.1.7.1.2.1.1.1.2.1.1.1.1.2.1.1.3.2.1.1.8.1.1.6.2.1.6.2.3.2.1.1.1.2.2.3.1.1.4.1.1.2.2.1.1.4.3.1.2.2.1.2.1.2.3.1.1.2.4.1.1.1.5.1.3.6.3.1.5.2.3.4.1.2.3.1.4.2.1.2.2.2.1.1.1.1.1.1.11.1.3.1.1.2.2.5.2.3.3.5.1.1.1.4.2.1.1.2.5.1.9.4.1.1.3.1.7.1.4.5.1.7.2.1.1.1.2.1.1.1.4.2.1.12.1.1.3.1.2.2.3.1.2.1.1.1.2.1.1.2.1.1.1.1.2.4.1.5.1.2.4.3.8.2.2.9.7.2.2.1.2.1.4.6.1.1.6.1.1.2.6.3.1.2.201.300--qca=P0-1945857792-1683309402266_gid=GA1.2.343625166.1683309hubspotutk=d8a6c413b6895e3e580f2095846c0--hssrc_hjSessionUser_1149958=eyJpZCI6ImUyNmE3ODVkLWEyNGItNTZmNS1iMzY0LWJhOWQ2YzQ5ZWJlZCIsImNyZWF0ZWQiOjE2ODMzMDk0MDU3NzAsImV4aXN0aW5nIjp0cn_gcl_au=1.1.711130966.16833096ln_or=eyI0OTk1NDAiOiJkIn_gaexp=GAX1.2._DshZARCSlqxxbaPORmoBw.19messagesUtk=7d89da50971a4c95bacd1208d32c3fCAKEPHP=2vimq77dtbkei6g81baqj2foNPS_86adfcee_last_seen=168331034authTokensExp=1684607113;AUTH=EMAIL=andusong2488@gmail.com&CHALLENGE=kU0PWfdYBuzqCfSJwPj1mt_user[UserID]=5571_hjHasCachedUserAttributes=t--zlcmid=1FjlnbB9iEUr6c--hstc=153128807.d8a6c413b6895e3e580f2095846c0738.1683309405716.1683331597005.16833396506mp_017900c581ab83839036748f85e0877f_mixpanel=%7B%22distinct_id%22%3A%20%225571857%22%2C%22%24device_id%22%3A%20%22187ed0f2564a73-0be36e04562ffb-26031b51-144000-187ed0f25656e8%22%2C%22%24initial_referrer%22%3A%20%22%24direct%22%2C%22%24initial_referring_domain%22%3A%20%22%24direct%22%2C%22%24user_id%22%3A%20%225571857%22%2C%22%24search_engine%22%3A%20%22google%22%2C%22--timers%22%3A%20%7B%22MapType-Selected%22%3A%201683341475634%7D%2C%22utm_source%22%3A%20%22website%22%2C%22utm_medium%22%3A%20%22banner%22%2C%22utm_campaign%22%3A%20%22adblock%22%2C%22utm_content%22%3A%20%22half_page%22%2C%22utm_term%22%3A%20%22satellite-global-plan%22%7_ga_0PK0N4C9B7=GS1.1.1683339650.6.1.1683341476.60_ga=GA1.1.1933511489.1683309--cf_bm=Ghupdjz4tNviX3duiO6A8R51BSMomrpKv8j0G1JJWIA-1683345919-0-AWYEMVXkO4m5LGrORi+jGdemITgCUyYTxyf1eBCDHLO8vEeueTfFpyIjt5CG/RcKTTOzGPz3hcA1okig7twmBVuhG9PqeGEo1jmES2ddmHEZ6nSZwKgboe8AD+KQAbr0MfLtCB+xrzscUphgVSRZ9NauthTokens=%7B%22access_token%22%3A%22eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJqdGkiOiIxNjgzMzQ1OTI0Ljc2NDQuYzVhMDZjZjUxZDdkNmY1OTE0ZjEiLCJpc3MiOiJhdXRoLm1hcmluZXRyYWZmaWMuY29tIiwiYXVkIjoibWFyaW5ldHJhZmZpYy5jb20iLCJpYXQiOjE2ODMzNDU5MjQsIm5iZiI6MTY4MzM0NTkyNCwiZXhwIjoxNjgzMzQ3MTI0LCJ1c2VySWQiOjU1NzE4NTcsImltcGVyc29uYXRvcklkIjpudWxsfQ.nqZt24LvP_roD3ZLlwuFFEU9SCVLbsSvrI2uJ8EcVPUGQCuAyqtfwLUFOuUstWJ-XlO4nfp31irfJDmv8r9kBwer738llcMc5XCQTNRpGj79NVAAEPnMbwU2z8Ff3nJ_L1jG1qcU5sBuUUXwCMOQjfu81iLMpmYJI-UgGS2xXPfuYDDl01B9gNdNO13fFfqVOKR-TM-ESeIsUv-P6tSUv7ulBW1nTwUp4CzuzwIkjYU_LHUYfaH1zNEVntFgjNkQPl0WmvoYo2ZikVUr2_99kRSVrAZplmrIwUKYRohRiBuze235cYWyIwcHa2MRMsMgZ5_-tZz9gcia2Hd4Ibaw2uiJ9Rul714BQZxBt2ha6vvSLco76Hb0amwKiWL4hgjNr6nlyIC5MY400mV5N_d8Z6dcBif3XEopqA5D4O2Z5cX3SF7tt4DZjcstqZS3CbMwMgQIuFp2LmTY1KKKd79a7E3gbIuI6CbXAzX6dDGYg8YIBKvseC3W5WkCRZAG4z3Uo9R5_NS5-F8VxtcVGl7geEMRRwNYEiZ9gDuJN5grK6LnyskiguDWNTkcwdzVe3DObEM6mGrYxDeg1POjamEkFBZNZZJM38XJuO3mEwtRdK1qTN6d4mrWUztyOKbiDVo6c2zNL8Yr4YfGxstKMKuWpvoJqnLCBRNOO22i6DmzNJE%22%2C%22refresh_token%22%3A%22xWRvfIN1q1C9cR37wCNUrsgFCnmriJxMEdtAnjHGV2R3TDtcevL5F19NEb4BQiWCyQR5QigEbBLHxZyFsw9WSMigxIROzUIUkws1bHXoePs0UShOGVFzABPndKPHdzGuLlzMAIeOwNuKduI0OhbeP28dUYaZyNga1ikq8jwEl6m12No2rhE1EP50ykLu6ub6M3tAb3sYV5CPJNmI6cLyUW2IB6BpZWyR0Z9u99lZIUQbLytj0mBUPn4hhc0mamRQ8SXfJBt9ovmgtRepFUOpNaYpl4QfOICtWBOnfnfiioXDOnSgHvMZvdUHMoG0mU1EF0zwkmGxU1U1OlcbrXeUbTnzWyVBBCylCt7kp2E5NZEMsduE1rmR6rxib6mGTvhA19Ir9Gi194Rq8hp5iQIyaC6bHUe2gM1BYBlW1RvGW2aCYOvUsSLZfr58uVtPd6hbfj2vqznUvDuOomaq5sp7zo5YLI3lRlI9njnInltrFA2abJLBU3z1WVlGM3jNtVp4%22%2C%22exp%22%3A16833471"
            "referer": "https://www.marinetraffic.com/en/ais/home/centerx:-133.1/centery:-18.6/zoom:2",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
            "  vessel- image": "000db95bbdd99312718fd5e13228b006a327",
            "x- newrelic - id": undefined,
            " x - requested -with": "XMLHttpRequest",
        }
    })
    console.log(getAll)
}

getAll()





// const data = fs.readFileSync('data.json');
// const json = JSON.parse(data);

// // Tạo một mảng mới chỉ chứa các thuộc tính cần thiết
// const filteredData = json.data.rows.map(({ SHIP_ID, LAT, LON }) => ({ SHIP_ID, LAT, LON }));

// // Ghi dữ liệu vào tệp JSON mới
// fs.writeFileSync('filtered_data.json', JSON.stringify(filteredData));