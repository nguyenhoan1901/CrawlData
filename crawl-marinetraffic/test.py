import requests

cookies = {
    'SERVERID': 'app4nzs',
    'vTo': '1',
    'euconsent-v2': 'CPrSsYAPrSsYAAKAvAENDDCsAP_AAH_AAAwIJatd_H__bW9r-f5_aft0eY1P9_r77uQzDhfNk-4F3L_W_LwX52E7NF36tq4KmR4Eu3LBIUNlHNHUTVmwaokVryHsak2cpTNKJ6BEkHMZO2dYGF5umxtjeQKY5_p_d3fx2D-t_dv-39z3z81Xn3dZ_-_0-PCdU5_9Dfn9fRfb-9IL9_78v8v8_9_rk2_eX_3_79_77H9-f_9gloASYatxAF2ZY4M2gYRQIgRhWEhFAoAIKAYWiAgAcHBTsrAJ9YRIAUAoAjAiBDgCjIgEAAAkASEQASBFggAABEAgABAAgEQgAYGAQUAFgIBAACAaBiiFAAIEhAkRERCmBAVAkEBLZUIJQXSGmEAVZYAUAiNgoAEQSAisAAQFg4BgiQErFggSYg2iAAYAUAolQrUUnpoCFjMAAAAA.f_gAAAAAAAAA',
    'addtl_consent': '1~39.4.3.9.6.9.13.6.4.15.9.5.2.11.1.7.1.3.2.10.3.5.4.21.4.6.9.7.10.2.9.2.18.7.20.5.20.6.5.1.4.11.29.4.14.4.5.3.10.6.2.9.6.6.9.4.4.29.4.5.3.1.6.2.2.17.1.17.10.9.1.8.6.2.8.3.4.146.8.42.15.1.14.3.1.18.25.3.7.25.5.18.9.7.41.2.4.18.21.3.4.2.7.6.5.2.14.18.7.3.2.2.8.20.8.8.6.3.10.4.20.2.13.4.6.4.11.1.3.22.16.2.6.8.2.4.11.6.5.33.11.8.1.10.28.12.1.3.21.2.7.6.1.9.30.17.4.9.15.8.7.3.6.6.7.2.4.1.7.12.13.22.13.2.12.2.10.1.4.15.2.4.9.4.5.4.7.13.5.15.4.13.4.14.10.15.2.5.6.2.2.1.2.14.7.4.8.2.9.10.18.12.13.2.18.1.1.3.1.1.9.25.4.1.19.8.4.5.3.5.4.8.4.2.2.2.14.2.13.4.2.6.9.6.3.2.2.3.5.2.3.6.10.11.6.3.16.3.11.3.1.2.3.9.19.11.15.3.10.7.6.4.3.4.6.3.3.3.3.1.1.1.6.11.3.1.1.11.6.1.10.5.2.6.3.2.2.4.3.2.2.7.15.7.14.1.3.3.4.5.4.3.2.2.5.4.1.1.2.9.1.6.9.1.5.2.1.7.10.11.1.3.1.1.2.1.3.2.6.1.12.5.3.1.3.1.1.2.2.7.7.1.4.1.2.6.1.2.1.1.3.1.1.4.1.1.2.1.8.1.7.4.3.2.1.3.5.3.9.6.1.15.10.28.1.2.2.12.3.4.1.6.3.4.7.1.3.1.1.3.1.5.3.1.3.4.1.1.4.2.1.2.1.2.2.2.4.2.1.2.2.2.4.1.1.1.2.2.1.1.1.1.2.1.1.1.2.2.1.1.2.1.2.1.7.1.2.1.1.1.2.1.1.1.1.2.1.1.3.2.1.1.8.1.1.6.2.1.6.2.3.2.1.1.1.2.2.3.1.1.4.1.1.2.2.1.1.4.3.1.2.2.1.2.1.2.3.1.1.2.4.1.1.1.5.1.3.6.3.1.5.2.3.4.1.2.3.1.4.2.1.2.2.2.1.1.1.1.1.1.11.1.3.1.1.2.2.5.2.3.3.5.1.1.1.4.2.1.1.2.5.1.9.4.1.1.3.1.7.1.4.5.1.7.2.1.1.1.2.1.1.1.4.2.1.12.1.1.3.1.2.2.3.1.2.1.1.1.2.1.1.2.1.1.1.1.2.4.1.5.1.2.4.3.8.2.2.9.7.2.2.1.2.1.4.6.1.1.6.1.1.2.6.3.1.2.201.300.100',
    '_hjFirstSeen': '1',
    '_hjIncludedInSessionSample_1149958': '1',
    '_hjSession_1149958': 'eyJpZCI6ImQwYjA1ODRkLTNiYzgtNDZkNi1hOTU4LTNjMjM2ZDQyN2RlMCIsImNyZWF0ZWQiOjE2ODMzMTA5NDkxNDMsImluU2FtcGxlIjp0cnVlfQ==',
    '_hjAbsoluteSessionInProgress': '0',
    'hubspotutk': 'd9e6a8572e8c1c220fe05b9784a4cfb6',
    '_gid': 'GA1.2.1470636719.1683310949',
    '__hstc': '153128807.d9e6a8572e8c1c220fe05b9784a4cfb6.1683310949379.1683310949379.1683310949379.1',
    'hubspotutk': 'd9e6a8572e8c1c220fe05b9784a4cfb6',
    '__hssrc': '1',
    '_cc_id': '2ced99468963f3bc0d6449dab930cf90',
    'panoramaId_expiry': '1683915750441',
    'panoramaId': 'aae1c142239edd37ffb62e11302016d5393850603c489f99cebf1afa63ae31d6',
    'panoramaIdType': 'panoIndiv',
    '_pbjs_userid_consent_data': '3464874906356361',
    '_tfpvi': 'NDc3YzNiOTYtZjBjZS00ZTU3LTlmMjEtMjg0ODUzMGY4NTYyIzUtOA%3D%3D',
    'cto_bidid': 'voRtel9kSHg5U0xPSnpZTUt4TW5wUXFVb3hIWnU2TDNhWEg4dklxaHNHMGZWc0I4WnljTG1IM3gyMCUyRk1kSDVZNTEyNzF4JTJGQlhPbEV3VzZIVHIwJTJCRjdFVE9RdyUzRCUzRA',
    '__gads': 'ID=de8d6e09e5e9d7df:T=1683310958:S=ALNI_MZLYGIOaPL-D026gjlGauK-9mmqXg',
    '__gpi': 'UID=00000c01f8e27e94:T=1683310958:RT=1683310958:S=ALNI_MZbFzEAvrX4r-3iJiWDqXvzBoqcrA',
    'cto_bundle': 'dLF9p19abzRFNVpRT212Y285NnBaaHZTSlNYeFU1aFI0JTJCTks2NSUyRkRXbURGc3dBMVNGZ2VpWHRtc284ZVpNT3h0VXVmcXBXdmV2WTdwandkamMwdzFFdmVmbzc0dEcxcmZ0RlJ4Z2hDWWVyS09INUgzcTBPVXJVaTlXJTJGYmhKb1k2THNZRkNUU1BUM0lOUUxVRXI1ZmdiYXREVTBucSUyRm5rQ0dYTnlZJTJCYzRtRXo5WlBvJTNE',
    'CAKEPHP': 'mdj7vi307kk2i8c8vba76ojo4r',
    'authTokensExp': '1684607054',
    'AUTH': 'EMAIL=andusong2488@gmail.com&CHALLENGE=kU0PWfdYBuzqCfSJwPj1',
    'mt_user[UserID]': '5571857',
    '_hjSessionUser_1149958': 'eyJpZCI6IjVjNDk5YzFlLTU5ODUtNWVjMS1hYWUyLTU0YmFjMzRkNmQ2ZSIsImNyZWF0ZWQiOjE2ODMzMTA5NDkxNDEsImV4aXN0aW5nIjp0cnVlfQ==',
    'NPS_86adfcee_last_seen': '1683311058470',
    '__zlcmid': '1FilnYwAD2htdaB',
    '_hjHasCachedUserAttributes': 'true',
    'messagesUtk': '711d1d49536f4d1b8779a7ccf46c389d',
    'authTokens': '%7B%22access_token%22%3A%22eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJqdGkiOiIxNjgzMzEyOTkzLjgyMTMuZWUzMTJjMDUzMTBhYjE3MmRlMzkiLCJpc3MiOiJhdXRoLm1hcmluZXRyYWZmaWMuY29tIiwiYXVkIjoibWFyaW5ldHJhZmZpYy5jb20iLCJpYXQiOjE2ODMzMTI5OTMsIm5iZiI6MTY4MzMxMjk5MywiZXhwIjoxNjgzMzE0MTkzLCJ1c2VySWQiOjU1NzE4NTcsImltcGVyc29uYXRvcklkIjpudWxsfQ.lr-M6WMzNY3p13cc9TTpvH1qxma42nzrGS-9a3JhGHxrUhRcZMsMukwytEBJFxGEgJosRV2t-YocuhM_G3W7qwrRoAXIUxJAceZuUwZStEwfbjFgdExEmTKCw-KNfR6IKOOpRv09RLxMjPlDDwtt5puH4TmPbzZblo_0cKw324JwVe_XVltHh372oh5yXoW4N_DzrAlQRnN8FZPPVZZoEtHA6uO9Si9B4UpE3gMkJ-93N8-1nX7OTaqLH5pEFcdtKpHlnDQ8VBPYc8ydsNHclmGB9CE0zT2sbGeKYF9B2NlIah1o6Q6cAnmDkkGtTcQOKprVwZFpiHY2hIy4-8K8mq1gPMnVL3OfWOrTUbjfuPEXe1yE0C_7w5pyiFzK8g0RjnBeDTqkxwq1fFMpk8h0XN_OlUYuFxGFB4xChYABHKrlXr2zuiWj4gi5fq7nOkuLPYcojjzmXq4XZYZQRn8haTCo3aRjYPXWXGZrAZnhuzA0mCrF3ak5vHeljWboRt9od4WhDlrVsiEnCoEMUKQe2XbP2ysH5U3iSDJR3k__fzWGb6MZqxBDUmudsEtZ6VlVYQl-Dzdgn6NVDqWfPlsWoCESxORkOY-vG87S8g8OpgFUwKgyql35vhxEOdPOB45agce9TMddciZowYPP_IyorYdCxmcSsAsWAAtxlXKxqpk%22%2C%22refresh_token%22%3A%22X3zZZ5xHnTXL6H9fXY50KWtTMJsKlNoiWC1Z8ToUYdo2Zsq2BQJmZG3JPWpE1j9pVCSaiOBeonP94BFj7lmxslKJvceCGeir2FvfkaLeJOjXIkZmAFNiR4O1tiUrbRNFvKaEkHultsBjSw7rRFMW9sLc2Pe2dlMj0BUxiznVpRZ7Db6WGZOPMSC7RTXaWXXpxWZk7bClwQwfrrKtGPNicKUDiq5OjhgFuQRKSFjsUvzWONBoadY2bXdn5SebmtTtQgTWb1lCo1ngotu4DZQ6ZLLuwjgWfYxKaJn79hLrARcHJXwEdIznPE4yCWRp06VziUY36SIjKWUlwEqYbLDa9DrcoO0h8seQ1DjB5JRzGT4AIuUre8FsbnoJOcJc32uuvj5xO4acY4EEAhlxpMZSIDoBHvHDuqBmNMs7dUC8oX0fKbwZen0SpNw6yaVJMHcwZ5jXZu4Jzmg4Ox8x9RN1VNhmvhqt4ja7dkS6unjbT7eQDC3f4vNiRnl5Sk2XZuhC%22%2C%22exp%22%3A1683314193%7D',
    '__cf_bm': '86sWzDpGn2pxHMWSVx31oLR4Y17Vj_1t4chxfwwfjjs-1683312994-0-AfPs+zSCaBStvTEBZ8w5msixXUMoGnsCPkXiN3CcarBqiYKoW75Va8EWcvYdFAo5Hiy2gw4JSLSvk6Z3QFRPX/WBCAqQ6GXYqBy9emSZncYDH1VpkwguisDcpUvY20M6AQ==',
    '__hssc': '153128807.12.1683310949380',
    '_ga': 'GA1.1.155278098.1683310949',
    '_ga_0PK0N4C9B7': 'GS1.1.1683310949.1.1.1683312995.56.0.0',
    'mp_017900c581ab83839036748f85e0877f_mixpanel': '%7B%22distinct_id%22%3A%20%225571857%22%2C%22%24device_id%22%3A%20%22187ed26b22f43-0aa7cca710fedd-26031b51-15f900-187ed26b23011fa%22%2C%22%24initial_referrer%22%3A%20%22%24direct%22%2C%22%24initial_referring_domain%22%3A%20%22%24direct%22%2C%22%24user_id%22%3A%20%225571857%22%2C%22__timers%22%3A%20%7B%22MapType-Selected%22%3A%201683312996227%7D%7D',
}

headers = {
    'authority': 'www.marinetraffic.com',
    'accept': '*/*',
    'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5,zh;q=0.4,zh-CN;q=0.3,zh-HK;q=0.2,zh-TW;q=0.1',
    'cookie': 'SERVERID=app4nzs; vTo=1; euconsent-v2=CPrSsYAPrSsYAAKAvAENDDCsAP_AAH_AAAwIJatd_H__bW9r-f5_aft0eY1P9_r77uQzDhfNk-4F3L_W_LwX52E7NF36tq4KmR4Eu3LBIUNlHNHUTVmwaokVryHsak2cpTNKJ6BEkHMZO2dYGF5umxtjeQKY5_p_d3fx2D-t_dv-39z3z81Xn3dZ_-_0-PCdU5_9Dfn9fRfb-9IL9_78v8v8_9_rk2_eX_3_79_77H9-f_9gloASYatxAF2ZY4M2gYRQIgRhWEhFAoAIKAYWiAgAcHBTsrAJ9YRIAUAoAjAiBDgCjIgEAAAkASEQASBFggAABEAgABAAgEQgAYGAQUAFgIBAACAaBiiFAAIEhAkRERCmBAVAkEBLZUIJQXSGmEAVZYAUAiNgoAEQSAisAAQFg4BgiQErFggSYg2iAAYAUAolQrUUnpoCFjMAAAAA.f_gAAAAAAAAA; addtl_consent=1~39.4.3.9.6.9.13.6.4.15.9.5.2.11.1.7.1.3.2.10.3.5.4.21.4.6.9.7.10.2.9.2.18.7.20.5.20.6.5.1.4.11.29.4.14.4.5.3.10.6.2.9.6.6.9.4.4.29.4.5.3.1.6.2.2.17.1.17.10.9.1.8.6.2.8.3.4.146.8.42.15.1.14.3.1.18.25.3.7.25.5.18.9.7.41.2.4.18.21.3.4.2.7.6.5.2.14.18.7.3.2.2.8.20.8.8.6.3.10.4.20.2.13.4.6.4.11.1.3.22.16.2.6.8.2.4.11.6.5.33.11.8.1.10.28.12.1.3.21.2.7.6.1.9.30.17.4.9.15.8.7.3.6.6.7.2.4.1.7.12.13.22.13.2.12.2.10.1.4.15.2.4.9.4.5.4.7.13.5.15.4.13.4.14.10.15.2.5.6.2.2.1.2.14.7.4.8.2.9.10.18.12.13.2.18.1.1.3.1.1.9.25.4.1.19.8.4.5.3.5.4.8.4.2.2.2.14.2.13.4.2.6.9.6.3.2.2.3.5.2.3.6.10.11.6.3.16.3.11.3.1.2.3.9.19.11.15.3.10.7.6.4.3.4.6.3.3.3.3.1.1.1.6.11.3.1.1.11.6.1.10.5.2.6.3.2.2.4.3.2.2.7.15.7.14.1.3.3.4.5.4.3.2.2.5.4.1.1.2.9.1.6.9.1.5.2.1.7.10.11.1.3.1.1.2.1.3.2.6.1.12.5.3.1.3.1.1.2.2.7.7.1.4.1.2.6.1.2.1.1.3.1.1.4.1.1.2.1.8.1.7.4.3.2.1.3.5.3.9.6.1.15.10.28.1.2.2.12.3.4.1.6.3.4.7.1.3.1.1.3.1.5.3.1.3.4.1.1.4.2.1.2.1.2.2.2.4.2.1.2.2.2.4.1.1.1.2.2.1.1.1.1.2.1.1.1.2.2.1.1.2.1.2.1.7.1.2.1.1.1.2.1.1.1.1.2.1.1.3.2.1.1.8.1.1.6.2.1.6.2.3.2.1.1.1.2.2.3.1.1.4.1.1.2.2.1.1.4.3.1.2.2.1.2.1.2.3.1.1.2.4.1.1.1.5.1.3.6.3.1.5.2.3.4.1.2.3.1.4.2.1.2.2.2.1.1.1.1.1.1.11.1.3.1.1.2.2.5.2.3.3.5.1.1.1.4.2.1.1.2.5.1.9.4.1.1.3.1.7.1.4.5.1.7.2.1.1.1.2.1.1.1.4.2.1.12.1.1.3.1.2.2.3.1.2.1.1.1.2.1.1.2.1.1.1.1.2.4.1.5.1.2.4.3.8.2.2.9.7.2.2.1.2.1.4.6.1.1.6.1.1.2.6.3.1.2.201.300.100; _hjFirstSeen=1; _hjIncludedInSessionSample_1149958=1; _hjSession_1149958=eyJpZCI6ImQwYjA1ODRkLTNiYzgtNDZkNi1hOTU4LTNjMjM2ZDQyN2RlMCIsImNyZWF0ZWQiOjE2ODMzMTA5NDkxNDMsImluU2FtcGxlIjp0cnVlfQ==; _hjAbsoluteSessionInProgress=0; hubspotutk=d9e6a8572e8c1c220fe05b9784a4cfb6; _gid=GA1.2.1470636719.1683310949; __hstc=153128807.d9e6a8572e8c1c220fe05b9784a4cfb6.1683310949379.1683310949379.1683310949379.1; hubspotutk=d9e6a8572e8c1c220fe05b9784a4cfb6; __hssrc=1; _cc_id=2ced99468963f3bc0d6449dab930cf90; panoramaId_expiry=1683915750441; panoramaId=aae1c142239edd37ffb62e11302016d5393850603c489f99cebf1afa63ae31d6; panoramaIdType=panoIndiv; _pbjs_userid_consent_data=3464874906356361; _tfpvi=NDc3YzNiOTYtZjBjZS00ZTU3LTlmMjEtMjg0ODUzMGY4NTYyIzUtOA%3D%3D; cto_bidid=voRtel9kSHg5U0xPSnpZTUt4TW5wUXFVb3hIWnU2TDNhWEg4dklxaHNHMGZWc0I4WnljTG1IM3gyMCUyRk1kSDVZNTEyNzF4JTJGQlhPbEV3VzZIVHIwJTJCRjdFVE9RdyUzRCUzRA; __gads=ID=de8d6e09e5e9d7df:T=1683310958:S=ALNI_MZLYGIOaPL-D026gjlGauK-9mmqXg; __gpi=UID=00000c01f8e27e94:T=1683310958:RT=1683310958:S=ALNI_MZbFzEAvrX4r-3iJiWDqXvzBoqcrA; cto_bundle=dLF9p19abzRFNVpRT212Y285NnBaaHZTSlNYeFU1aFI0JTJCTks2NSUyRkRXbURGc3dBMVNGZ2VpWHRtc284ZVpNT3h0VXVmcXBXdmV2WTdwandkamMwdzFFdmVmbzc0dEcxcmZ0RlJ4Z2hDWWVyS09INUgzcTBPVXJVaTlXJTJGYmhKb1k2THNZRkNUU1BUM0lOUUxVRXI1ZmdiYXREVTBucSUyRm5rQ0dYTnlZJTJCYzRtRXo5WlBvJTNE; CAKEPHP=mdj7vi307kk2i8c8vba76ojo4r; authTokensExp=1684607054; AUTH=EMAIL=andusong2488@gmail.com&CHALLENGE=kU0PWfdYBuzqCfSJwPj1; mt_user[UserID]=5571857; _hjSessionUser_1149958=eyJpZCI6IjVjNDk5YzFlLTU5ODUtNWVjMS1hYWUyLTU0YmFjMzRkNmQ2ZSIsImNyZWF0ZWQiOjE2ODMzMTA5NDkxNDEsImV4aXN0aW5nIjp0cnVlfQ==; NPS_86adfcee_last_seen=1683311058470; __zlcmid=1FilnYwAD2htdaB; _hjHasCachedUserAttributes=true; messagesUtk=711d1d49536f4d1b8779a7ccf46c389d; authTokens=%7B%22access_token%22%3A%22eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJqdGkiOiIxNjgzMzEyOTkzLjgyMTMuZWUzMTJjMDUzMTBhYjE3MmRlMzkiLCJpc3MiOiJhdXRoLm1hcmluZXRyYWZmaWMuY29tIiwiYXVkIjoibWFyaW5ldHJhZmZpYy5jb20iLCJpYXQiOjE2ODMzMTI5OTMsIm5iZiI6MTY4MzMxMjk5MywiZXhwIjoxNjgzMzE0MTkzLCJ1c2VySWQiOjU1NzE4NTcsImltcGVyc29uYXRvcklkIjpudWxsfQ.lr-M6WMzNY3p13cc9TTpvH1qxma42nzrGS-9a3JhGHxrUhRcZMsMukwytEBJFxGEgJosRV2t-YocuhM_G3W7qwrRoAXIUxJAceZuUwZStEwfbjFgdExEmTKCw-KNfR6IKOOpRv09RLxMjPlDDwtt5puH4TmPbzZblo_0cKw324JwVe_XVltHh372oh5yXoW4N_DzrAlQRnN8FZPPVZZoEtHA6uO9Si9B4UpE3gMkJ-93N8-1nX7OTaqLH5pEFcdtKpHlnDQ8VBPYc8ydsNHclmGB9CE0zT2sbGeKYF9B2NlIah1o6Q6cAnmDkkGtTcQOKprVwZFpiHY2hIy4-8K8mq1gPMnVL3OfWOrTUbjfuPEXe1yE0C_7w5pyiFzK8g0RjnBeDTqkxwq1fFMpk8h0XN_OlUYuFxGFB4xChYABHKrlXr2zuiWj4gi5fq7nOkuLPYcojjzmXq4XZYZQRn8haTCo3aRjYPXWXGZrAZnhuzA0mCrF3ak5vHeljWboRt9od4WhDlrVsiEnCoEMUKQe2XbP2ysH5U3iSDJR3k__fzWGb6MZqxBDUmudsEtZ6VlVYQl-Dzdgn6NVDqWfPlsWoCESxORkOY-vG87S8g8OpgFUwKgyql35vhxEOdPOB45agce9TMddciZowYPP_IyorYdCxmcSsAsWAAtxlXKxqpk%22%2C%22refresh_token%22%3A%22X3zZZ5xHnTXL6H9fXY50KWtTMJsKlNoiWC1Z8ToUYdo2Zsq2BQJmZG3JPWpE1j9pVCSaiOBeonP94BFj7lmxslKJvceCGeir2FvfkaLeJOjXIkZmAFNiR4O1tiUrbRNFvKaEkHultsBjSw7rRFMW9sLc2Pe2dlMj0BUxiznVpRZ7Db6WGZOPMSC7RTXaWXXpxWZk7bClwQwfrrKtGPNicKUDiq5OjhgFuQRKSFjsUvzWONBoadY2bXdn5SebmtTtQgTWb1lCo1ngotu4DZQ6ZLLuwjgWfYxKaJn79hLrARcHJXwEdIznPE4yCWRp06VziUY36SIjKWUlwEqYbLDa9DrcoO0h8seQ1DjB5JRzGT4AIuUre8FsbnoJOcJc32uuvj5xO4acY4EEAhlxpMZSIDoBHvHDuqBmNMs7dUC8oX0fKbwZen0SpNw6yaVJMHcwZ5jXZu4Jzmg4Ox8x9RN1VNhmvhqt4ja7dkS6unjbT7eQDC3f4vNiRnl5Sk2XZuhC%22%2C%22exp%22%3A1683314193%7D; __cf_bm=86sWzDpGn2pxHMWSVx31oLR4Y17Vj_1t4chxfwwfjjs-1683312994-0-AfPs+zSCaBStvTEBZ8w5msixXUMoGnsCPkXiN3CcarBqiYKoW75Va8EWcvYdFAo5Hiy2gw4JSLSvk6Z3QFRPX/WBCAqQ6GXYqBy9emSZncYDH1VpkwguisDcpUvY20M6AQ==; __hssc=153128807.12.1683310949380; _ga=GA1.1.155278098.1683310949; _ga_0PK0N4C9B7=GS1.1.1683310949.1.1.1683312995.56.0.0; mp_017900c581ab83839036748f85e0877f_mixpanel=%7B%22distinct_id%22%3A%20%225571857%22%2C%22%24device_id%22%3A%20%22187ed26b22f43-0aa7cca710fedd-26031b51-15f900-187ed26b23011fa%22%2C%22%24initial_referrer%22%3A%20%22%24direct%22%2C%22%24initial_referring_domain%22%3A%20%22%24direct%22%2C%22%24user_id%22%3A%20%225571857%22%2C%22__timers%22%3A%20%7B%22MapType-Selected%22%3A%201683312996227%7D%7D',
    'referer': 'https://www.marinetraffic.com/en/ais/home/centerx:108.6/centery:-13.9/zoom:4',
    'sec-ch-ua': '"Chromium";v="112", "Google Chrome";v="112", "Not:A-Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
    'vessel-image': '007b841ddb85ca49811df91f3e892dab5429',
    'x-newrelic-id': 'undefined',
    'x-requested-with': 'XMLHttpRequest',
}

params = {
    'cb': '_1683313177',
}

session = requests.Session()
session.cookies.update(cookies)
session.headers = headers

import cloudscraper

scraper = cloudscraper.create_scraper(sess=session)  

response = scraper.get('https://www.marinetraffic.com/getData/get_data_json_4/z:4/X:6/Y:3/station:0/',
    params=params,)


print(response.text[:100])