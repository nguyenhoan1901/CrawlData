from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
import os
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import requests
from pprint import pprint


# CONSTANTS
PROFILE_PATH = os.path.join(os.getcwd(), 'profile')



driver = uc.Chrome(user_data_dir=PROFILE_PATH, version_main=112)
driver.get('https://www.marinetraffic.com')

# wait for logged in
WebDriverWait(driver, 60*5).until(EC.presence_of_element_located, ((By.ID, 'user-logggin')))

# session = requests.Session()
# for cookie in driver.get_cookies():
#     session.cookies.set(cookie['name'], cookie['value'])

driver.minimize_window()
# driver.quit()    

def fetch(url):
    data = driver.execute_async_script(r"""
        let done = arguments[arguments.length - 1];
        let url = arguments[0];

        fetch(url, {
            "headers": {
                "accept": "*/*",
                "accept-language": "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5,zh;q=0.4,zh-CN;q=0.3,zh-HK;q=0.2,zh-TW;q=0.1",
                "sec-ch-ua": "\"Chromium\";v=\"112\", \"Google Chrome\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-newrelic-id": "undefined",
                "x-requested-with": "XMLHttpRequest"
            },
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        })
            .then(res => res.json())
            .then(data => done(data))   
            .catch(err => done(err))
    """, url)
    
    return data

while True:
    input('NEXT')
    url = 'https://www.marinetraffic.com/getData/get_data_json_4/z:4/X:6/Y:3/station:0/?cb=_1683312994'
    data = fetch(url)

    print(data)
# pprint(session.cookies.get_dict())


# res = session.get(url)
# print(res.text[:100])


input('PAUSE')