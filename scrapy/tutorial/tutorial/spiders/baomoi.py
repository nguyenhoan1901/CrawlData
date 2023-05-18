# import scrapy
from scrapy import Spider
from scrapy.selector import Selector
from ..items import BaomoiItem

class BaomoiSpider(Spider):
    name = "baomoi"
    allowed_domains = ["https://baomoi.com"]
    start_urls = ["https://baomoi.com/sea-games-32/top/931.epi"]

    def parse(self, response):
        questions = Selector(response).xpath('//div[@class="bm_b list-topic-special bm_c"]')

        for question in questions:
            item = BaomoiItem()

            item['title'] = question.xpath(
                'div[@class="bm_B bm_Gw  bm_Gt"]/div[@class="bm_g"]/div[@class="bm_f"]/h4[@class="bm_J"]/span/a/text()').extract()
            # item['content'] = question.xpath(
            #     'div[@class="comment-content"]/p[@class="cmt_txt"]/text()').extract_first()

            yield item
