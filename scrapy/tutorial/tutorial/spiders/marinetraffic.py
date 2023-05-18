import scrapy
from ..items import MarinetrafficItem

class MarinetrafficSpider(scrapy.Spider):
    name = "marinetraffic"
    allowed_domains = ["https://www.vesselfinder.com"]
    start_urls = ["https://www.vesselfinder.com/login"]
    login_data = {
        'username': 'andesong2488@gmail.com',
        'password': 'RRw6JkkwK'
    }
    
    def parse(self, response):
        return scrapy.FormRequest.from_response(
            response,
            formdata=self.login_data,
            callback=self.after_login
        )
    
    def after_login(self, response):
        if "authentication failed" in response.body:
            self.logger.error("Login failed")
            return

        # Nếu đăng nhập thành công, tiếp tục crawl các trang cần thiết
        yield scrapy.Request(url='https://www.vesselfinder.com/pro/map', callback=self.parse_data, meta={'playwright': True})
        
    def parse_data(self, response):
        questions = scrapy.Selector(response).xpath('//ul[@class="listcomment"]/li')
        for question in questions:
            item = MarinetrafficItem()

            # item['VesselName'] = question.xpath(
            #     'div[@class="item-top"]/p[@class="txtname"]/text()').extract()
            item['MMSI'] = question.xpath(
                'div[@class="MuiAccordionDetails-root css-r86j8b"]/div[@class="MuiTypography-root MuiTypography-body1 MuiTypography-gutterBottom css-a9fb83"]/text()').extract_first()
            
    
    # def start_requests(self):
    #     return [scrapy.Request(self.start_urls[0], callback=self.login)]
    
    # def login(self, response):
    #     return scrapy.FormRequest.from_response(
    #         response,
    #         formdata=self.login_data,
    #         callback=self.after_login
    #     )
        
    # def after_login(self, response):
    #     # Kiểm tra xem đã đăng nhập thành công chưa
    #     if "authentication failed" in response.body:
    #         self.logger.error("Login failed")
    #         return
    
    #     # Nếu đăng nhập thành công, gửi các request cần thiết để crawl dữ liệu
    #     return scrapy.Request(url="https://www.marinetraffic.com/en/ais/details/ships/shipid:455382/mmsi:368920000/imo:9132129/vessel:HENSON", callback=self.parse)
        
    # def parse(self, response):
    #     questions = scrapy.Selector(response).xpath('//div[@class="MuiAccordionDetails-root css-r86j8b"]').extract_first()

    #     for question in questions:
    #         item = MarinetrafficItem()

    #         item['MMSI'] = question.xpath(
    #             'div[@class="MuiAccordionDetails-root css-r86j8b"]/div[@class="MuiTypography-root MuiTypography-body1 MuiTypography-gutterBottom css-a9fb83"]/text()').extract_first()

    #         yield item
        # questions = scrapy.Selector(response).xpath('//ul[@class="listcomment"]/li')
        # for question in questions:
        #     item = MarinetrafficItem()

        #     # item['VesselName'] = question.xpath(
        #     #     'div[@class="item-top"]/p[@class="txtname"]/text()').extract()
        #     item['MMSI'] = question.xpath(
        #         'div[@class="MuiAccordionDetails-root css-r86j8b"]/div[@class="MuiTypography-root MuiTypography-body1 MuiTypography-gutterBottom css-a9fb83"]/text()').extract_first()
        #     # item['long'] = question.xpath(
        #     #     'div[@class="item-click"]/a[@class="click-use"]/text()').extract_first()
        #     # item['lat'] = question.xpath(
        #     #     'div[@class="item-click"]/a[@class="click-use"]/text()').extract_first()

        #     yield item
