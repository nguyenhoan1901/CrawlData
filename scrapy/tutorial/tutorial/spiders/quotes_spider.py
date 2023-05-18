import scrapy
from ..items import TutorialItem

class QuotesSpider(scrapy.Spider):  #extend class scrapy.Spider
    name = "quotes"
    allowed_domains = ["https://quotes.toscrape.com"]
    start_urls = ["https://quotes.toscrape.com/page/1/"]
    # def start_requests(self):
    #     url = "https://quotes.toscrape.com/js/"
    #     yield scrapy.Request(url, callback=self.parse)
    
    def parse(self, response):
        questions = scrapy.Selector(response).xpath('//div[@class="quote"]')
        for question in questions:
            item = TutorialItem()
            item['author'] = question.xpath('.//span/small/text()').extract()
            
            yield item
