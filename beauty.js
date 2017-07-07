var request = require('request'),
  fs = require('fs'),
  cheerio = require('cheerio');
asyncQuene = require('async').queue;

var _mainurl = ["http://www.xiumm.org/albums/MFStar.html"];
var page = 10;

function createurl(mainurl) {
  return new Promise(function(resolve, reject) {
    var list = [];
    var q = asyncQuene(function(url, back) {
      request(url, function(error, response, data) {
        if (!error && response.statusCode == 200) {
          var $ = cheerio.load(data);
          $(".pic_box a").each(function(index, el) {
            list.push($(el).attr('href'));
          });
          back();
        } else {
          back(error);
          return;
        }
      });
    }, 2);

    q.drain = function() {
      resolve(list);
    };
    q.push(mainurl, function(error) {
      console.log("createurl=error=" + error);
    });
  });
}

function getimgurl(urllist) {
  return new Promise(function(resolve, reject) {
    var imglist = [];
    console.log("create img src");
    var q = asyncQuene(function(url, back) {
      request(url, function(error, response, data) {
        if (!error && response.statusCode == 200) {
          var $ = cheerio.load(data);
          $(".pic_box img").each(function(index, el) {
            imglist.push("http://www.xiumm.org/" + $(el).attr('src'));
            //request($(el).attr('src')).pipe(fs.createWriteStream('result/file' + num + '.jpg'));                
          });
          back();
        } else {
          back(error);
          return;
        }
      });
    }, 10);

    q.drain = function() {
      console.log("imglist==" + imglist)
      resolve(imglist);
    };
    var newlist = [];
    urllist.forEach(function(item, index) {
      newlist.push(item);
      for (var i = 0; i < 4; i++) {
        newlist.push(item.substring(0, item.indexOf('html') - 1) + "-" + i + ".html");
      }
    })
    q.push(newlist, function(error) {
      console.log("getimgurl=error=" + error);
    });
  });
}

function createimg(list) {
  console.log("downloading img");
  //fs.mkdirSync("cloud2");
  var downloadCount = 0;
  var q = asyncQuene(function(url, taskDone) {
    /*    request(url, function(err, res) {
            if (err) {
              console.log(err);
              taskDone();
            } else {
              fs.writeFile('cloud2/beauty-' + downloadCount + '.jpg', res.body, function(err) {
                err ? console.log(err) : console.log(`finish 1`);
                downloadCount++;
                taskDone();
              });
            }
          })*/
    request(url).pipe(fs.createWriteStream('cloud2/beauty' + (downloadCount++) + '.jpg'));
    taskDone();
  }, 5);
  /**
   * 监听：当所有任务都执行完以后，将调用该函数
   */
  q.drain = function() {
    console.log('All img download');
  };
  q.push(list); //将所有任务加入队列
}

createurl(_mainurl).then(function(value) {
    console.log("url::" + value);
    return getimgurl(value);
  }).then(function(img) {
    return createimg(img);
  })
  //request("http://www.xiumm.org/photos/MFStar-18459.html").pipe(fs.createWriteStream("new1.html"));
