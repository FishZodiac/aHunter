var request = require('request'),
  fs = require('fs'),
  cheerio = require('cheerio'),
  http = require('http'),
  url = require('url'),
  path = require('path');

function createEm(params) {
  request('http://www.torrentkittyjx.org/s/' + params, function(error, response, data) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(data);
      var list = [];
      $(".j_a1").each(function(index, el) {
        list.push($(el).attr('href'));
      });

      for (var k in list) {
        request('http://www.torrentkittyjx.org/' + list[k], function(error, response, data) {
          if (!error && response.statusCode == 200) {
            var $ = cheerio.load(data);
            var num = parseInt(Math.random() * 1000);
            fs.writeFile('result/file' + num + '.txt', $("#magnetLink").val());
          }
        });
      }
    }
  });
}

var server = http.createServer(function(request, response) {
  if (request.url !== "/favicon.ico") {
    var pathname = url.parse(request.url).pathname;
    if (pathname.length > 1) {
      pathname = pathname.substr(1, pathname.length);
      createEm(pathname);
    }

    response.writeHead(200, {
      'Content-Type': 'text/html'
    });

    response.end('<h1>DOWNLOADING</h1>');
  }
});

server.listen(3000);

console.log("server is running at 3000");
