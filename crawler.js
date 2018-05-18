const Crawler = require("simplecrawler");
const cheerio = require('cheerio');
const buffer = require('buffer');

const crawler = new Crawler('https://soundgasm.net/u/The_Lady_Aurora/');

const data = [];

// crawler.maxDepth = 3;
crawler.interval = 0; // Ten seconds
crawler.maxConcurrency = 2;

crawler.discoverResources = function(buffer, queueItem) {
    var $ = cheerio.load(buffer.toString("utf8"));
    return $("a[href]").map(function () {
        return $(this).attr("href");
    }).get();
};

crawler.addFetchCondition(function(queueItem, referrerQueueItem, callback) {
    // We only ever want to move one step away from example.com, so if the
    // referrer queue item reports a different domain, don't proceed
    callback(null, queueItem.url.match(/^https:\/\/soundgasm\.net\/u\/The_Lady_Aurora\//gi));
});

crawler.on('queueadd', (queueItem, referrerQueueItem) => {
    console.log(queueItem);
});

crawler.on('fetchcomplete', (queueItem, responseBuffer, response) => {
    (function (queueItem, responseBuffer, response) {
        setTimeout(() => {
            const webpage = responseBuffer.toString("utf8");
            const $ = cheerio.load(webpage);
            console.log(webpage);
            
            let title = $('.sound-details>a').textContent;
            let uploader = queueItem.path.match(/\/u\/(.*)\/?/)
            let downloadURL = webpage.match(/(https:\/\/soundgasm.net\/sound.*)"/)[1];
            let sound = {
                title: title,
                uploader: uploader,
                downloadURL: downloadURL
            };
            data.push(sound);
        }, 2000);
    }(queueItem, responseBuffer, response))
        
    
});

crawler.on('complete', () => {
    console.log(data);
})

crawler.start();