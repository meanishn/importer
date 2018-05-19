var Crawler = require("simplecrawler");
const fs = require('fs');

function matcher(str, regex) {
    const matched = str.match(regex);
    if (matched === null) {
        return [];
    }
    return matched;
}

const data = [];
const crawlerInstances = [];

const urls = [
    'https://soundgasm.net/u/The_Lady_Aurora',
    'https://soundgasm.net/u/kinkyshibby'
]
urls.forEach((url) => {
    const crawler = new Crawler(url);
    crawlerInstances.push(crawler);
})

function run(crawlers) {
    if (!crawlers.length) {
        console.log(data);
        fs.writeFileSync('data.json', JSON.stringify(data));
        return;
    }
    (function (crawler) {
        scrape(crawler);
        crawler.on('complete', function(){
            run(crawlers);
        });
    }(crawlers.shift()))
}

function scrape(crawler) {
    crawler.interval = 0; // Ten seconds
    crawler.maxConcurrency = 2;

    crawler.discoverResources = function(buffer, queueItem) {
        var $ = cheerio.load(buffer.toString("utf8"));
        return $("a[href]").map(function () {
            return $(this).attr("href");
        }).get();
    };

    crawler.addFetchCondition(function(queueItem, referrerQueueItem, callback) {
        callback(null, queueItem.url.match(/^https:\/\/soundgasm\.net\/u\/(.*)\//gi));
    });

    crawler.on('fetchcomplete', function (queueItem, responseBuffer, response){
        console.log('FETCH COMPLETE:: ', queueItem.url);
        const _webpage = responseBuffer.toString("utf8");
        let title = matcher(_webpage, /aria-label="title">(.*)</)[1];
        let uploader = matcher(queueItem.url, /\/u\/(.*)\//)[1];
        let downloadUrl = matcher(_webpage, /(https:\/\/soundgasm.net\/sound.*)"/)[1];

        if (title && downloadUrl && uploader) {
            const sound = {
                title: title,
                uploader: uploader,
                downloadURL: downloadUrl
            };
            data.push(sound);
        }
                       
        
    });    
    crawler.on('queueadd', function (queueItem, referrerQueueItem){
        console.log(queueItem.url);
    });
    
    crawler.start(); 
}


run(crawlerInstances);