import scrapy
from scrapy import Spider
from ..items import dtdd

class CmtDtddSpider(Spider):
    name = "macbook"
    allowed_domains = ["www.thegioididong.com"]
    start_urls = ["https://www.thegioididong.com/laptop-apple-macbook"]

      
    
    def parse(self, response):
        questions = scrapy.Selector(response).xpath('//ul[@class="listproduct"]/li/a[@class="main-contain"]/@href')

        for url_item in questions:
            yield scrapy.Request(response.urljoin(url_item.extract()), callback=self.parse_macbook) # Nếu có sản phẩm thì sẽ gọi tới function parse_macbook
        
        # nếu có sản phẩm kế tiếp thì tiếp tục crawl
        # next_page = response.css("li.next > a ::attr(href)").extract_first()
        # if next_page:
        #     yield scrapy.Request(response.urljoin(next_page), callback=self.parse)
   
    def parse_macbook(self, response):    
        item = dtdd()
        item['product_name'] = scrapy.Selector(response).xpath('.//h1/text()').extract_first()
        item['price_sale'] = scrapy.Selector(response).xpath('.//div[@class="box-price"]/p[@class="box-price-present"]/text()').extract_first()
        yield item

