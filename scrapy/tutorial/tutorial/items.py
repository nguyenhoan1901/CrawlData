# Define here the models for your scraped items
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/items.html

import scrapy


class TutorialItem(scrapy.Item):
    # define the fields for your item here like:
    # name = scrapy.Field()
    author = scrapy.Field()
    
class dtdd(scrapy.Item):
    # define the fields for your item here like:
    # name = scrapy.Field()
    product_name = scrapy.Field()
    # price = scrapy.Field()
    price_sale = scrapy.Field()
        
class BaomoiItem(scrapy.Item):
    # define the fields for your item here like:
    # name = scrapy.Field()
    title = scrapy.Field()
    # content = scrapy.Field()

class MarinetrafficItem(scrapy.Item):
    # VesselName = scrapy.Field()
    MMSI = scrapy.Field()
    # long = scrapy.Field()
    # lat = scrapy.Field()
    
class VesselfinderItem(scrapy.Item):
    # VesselName = scrapy.Field()
    MMSI = scrapy.Field()
    # long = scrapy.Field()
    # lat = scrapy.Field()