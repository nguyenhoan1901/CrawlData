import scrapy
from scrapy_splash import SplashRequest
from ..items import VesselfinderItem

class VesselfinderSpider(scrapy.Spider):
    name = "vesselfinder"
    allowed_domains = ["www.vesselfinder.com"]
    start_urls = ["http://www.vesselfinder.com/"]

    render_script = """
        function main(splash)
            local url = splash.args.url
            assert(splash:go(url))
            assert(splash:wait(5))

            return {
                html = splash:html(),
                url = splash:url(),
            }
        end
        """
    def start_requests(self):
        for url in self.start_urls:
            yield SplashRequest(
                url,
                self.parse, 
                endpoint='render.html',
                args={
                    'wait': 5,
                    'lua_source': self.render_script,
                }
            )
    
    def parse(self, response):
        item = VesselfinderItem()
        questions = scrapy.Selector(response).xpath('//div[@class="lsb_content lsbact"]/div[@class="panel expanded"]/div/div[@class="panel-header flr"]/div[@class="panel-title fleft"]/div[@id="ais-type"]/text()')
        for Idex in questions:
            item = VesselfinderItem()
            item['MMSI'] = Idex.extract()
            yield item
        
        
        
        
        
    # def start_requests(self):
    #     yield scrapy.Request(url='https://www.vesselfinder.com/pro/map', callback=self.parse, meta={'playwright': True})

    # def parse(self, response):
    #     questions = scrapy.Selector(response).xpath('//div[@class="lsb_content lsbact"]/div[@class="panel expanded"]/div/div[@class="panel-header flr"]/div[@class="panel-title fleft"]/div[@id="ais-type"]/text()')
    #     for Idex in questions:
    #         item = VesselfinderItem()
    #         item['MMSI'] = Idex.extract()
    #         yield item

    
