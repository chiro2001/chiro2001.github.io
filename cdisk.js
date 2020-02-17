var sleep = function(time) {
    var startTime = new Date().getTime() + parseInt(time, 10);
    while(new Date().getTime() < startTime) {}
};

// 进一步封装
function CDisk() {
    this.cbase = new CBase();
}

CDisk.prototype.articleRead = function (path, callback) {
    // 先读取json再读取md
//    console.log('path:' + path)
    var context = this
    this.cbase.read(path + 'info.json', function (err, data) {
        if ('null' == typeof(err)) {
            //alert('发生错误!');
            console.log(err);
            return;
        }
        if ('undefined' == typeof(data)) {
            return;
        }
        var title = JSON.parse(data.Body).title
        context.cbase.read(path + 'content.md', function (err, data) {
            if (null == typeof(err)) {
                //alert('发生错误!');
                console.log(err);
                return;
            }
            var content = data.Body
//            console.log({
//                'title': title,
//                'content': content
//            })
            callback(title, content);
        })
    })
}

CDisk.prototype.indexInit = function () {
    // 获取!所有!文章信息
    // 保存一下上下文
    var context = this;
    queue = 0;
    res = {
        'articles': new Array(),
        'comments': new Array()
    };
    range_articles = 0;
    range_comments = 0;
    this.cbase.listdir('articles', function (err, data) {
        if (null == typeof(err)) {
            //alert('发生错误!');
            console.log(err);
            return;
        }
        for (i in data.Contents) {
            obj = data.Contents[i];
            key = obj.Key;
            if (key.length > 0 && key[key.length-1] == "/" && key[key.length-2] != 's') {
                range_articles = range_articles + 1;
            }
        }
//        console.log('range_articles: ' + range_articles)
//        range_articles = data.Contents.length
        for (i in data.Contents) {
            obj = data.Contents[i]
            key = obj.Key
            console.log(key)
            // 判断是一个文件夹->一个文章
            if (key.length > 0 && key[key.length-1] == "/") {
                // 尝试读取content.md和info.json
                context.articleRead(key, function (title, content) {
                    res.articles.push({
                        'title': title,
                        'content': content
                    })
//                    console.log(res.articles.length);
                    // 判断有没有工作完（这里是bug）
                    if (res.articles.length == range_articles) {
                        // 开始上传
                        var json_data = JSON.stringify(res)
                        console.log(json_data)
                        context.cbase.write(add_domin('index.json'), json_data, function(err, data) {
                            console.log('indexInit: done')
                        })
                    }
                });
            }
        }
    })
}

CDisk.prototype.indexRead = function (callback) {
    var context = this;
    this.cbase.read(add_domin('index.json'), function (err, data) {
        if (null == typeof(err)) {
            //alert('发生错误!');
            console.log(err);
            return;
        }
        var result = JSON.parse(data.Body);
//        console.log(result);
        callback(result);
    })
}

CDisk.prototype.articleWrite = function (title, fileObject, callback) {
//    path = 
    var date = new Date();
    var ms = date.getTime();
    var mpath = add_domin('articles/' + ms + '/');
    console.log('try to write dir: ' + mpath)
    this.cbase.write(mpath, '');
    var mpath = add_domin('articles/' + ms + '/content.md');
    console.log('try to write: ' + mpath)
    this.cbase.write(mpath, fileObject);
    var info = {
        'title': title
    };
    var mpath = add_domin('articles/' + ms + '/info.json');
    console.log('try to write info: ' + mpath)
    this.cbase.write(mpath, JSON.stringify(info), callback);
    this.indexInit();
}