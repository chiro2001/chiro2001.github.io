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
        if (err) {
            //alert('发生错误!');
            console.log(err);
            return;
        }
        if (!data) {
            return;
        }
        var body = JSON.parse(data.Body);
        var title = body.title;
        var time = body.time;
        context.cbase.read(path + 'content.md', function (err, data) {
            if (err) {
                //alert('发生错误!');
                console.log(err);
                return;
            }
            var content = data.Body
//            console.log({
//                'title': title,
//                'content': content
//            })
            callback(title, content, time);
        })
    })
}

// 检查是否已经部署了这个网站
CDisk.prototype.siteCheck = function (callback) {
    // 检查 {{website}}/articles
    var context = this;
//    this.cbase.listdir(add_domin('articles/'), function (err, data) {
//        
//    });
    this.cbase.read(add_domin('articles/'), function (err, data) {
        // 没有部署这个网站，重新弄文件夹
        if (err) {
            console.log('没有部署这个网站，重新弄文件夹');
            callback(false);
        }
        // 再检查 {{website}}/index.json
        context.cbase.read(add_domin('index.json'), function (err, data) {
            // 没有部署index.json，重新弄文件夹
            if (err) {
                console.log('没有部署index.json，重新弄文件夹');
                callback(false);
            }
            callback(true);
        })
    });
}

CDisk.prototype.siteInit = function(callback) {
    // 直接写入articles文件夹
    var context = this;
    this.cbase.write(add_domin('articles/'), '', function (err, data) {
        if (!data && err) {
            callback(false);
        }
        callback(true);
    });
}

CDisk.prototype.indexInit = function (callback) {
    // 获取!所有!文章信息
    // 保存一下上下文
    var context = this;
    res = {
        'articles': new Array(),
        'comments': new Array()
    };
    range_articles = 0;
    range_comments = 0;
    this.cbase.listdir(add_domin('articles/'), function (err, data) {
        if (err) {
//            alert('发生错误!');
            console.log(err);
            callback(false);
            return;
        }
        console.log('->indexInit:');
        console.log(data);
        for (i in data.CommonPrefixes) {
            obj = data.CommonPrefixes[i];
//            key = obj.Key;
            key = obj.Prefix;
            //if (key.length > 0 && key[key.length-1] == "/" && key[key.length-2] != 's') {
            if (key.length > 0) {
                console.log('获取key: ' + key);
                range_articles = range_articles + 1;
            }
        }
//        console.log('range_articles: ' + range_articles)
        if (range_articles == 0) {
            // 没有文章，直接新建index.json
            console.log('没有文章，直接新建index.json')
            var json_data = JSON.stringify(res);
            console.log(json_data);
            context.cbase.write(add_domin('index.json'), json_data, function(err, data) {
                console.log('indexInit: done');
                callback(true);
            });
        }
//        range_articles = data.Contents.length
        
        // 按照时间重新排序一下
        var key_sorted = new Array();
        for (i in data.CommonPrefixes) {
            obj = data.CommonPrefixes[i];
//            key = obj.Key;
            key = obj.Prefix;
            // 判断是一个文件夹->一个文章
            if (key.length > 0 && key[key.length-1] == "/") {
                key_sorted.push(key);
            }
        }
        
        key_sorted = key_sorted.sort();
//        console.log(key_sorted)
        key_sorted = key_sorted.reverse();
//        console.log(key_sorted)
        
        for (i in key_sorted) {
            key = key_sorted[i];
            // 尝试读取content.md和info.json
            context.articleRead(key, function (title, content, time) {
                res.articles.push({
                    'title': title,
                    'content': content,
                    'time': time
                })
//                    console.log(res.articles.length);
                // 判断有没有工作完（这里是bug）
                if (res.articles.length == range_articles) {
                    // 开始上传
                    var json_data = JSON.stringify(res);
                    console.log(json_data);
                    context.cbase.write(add_domin('index.json'), json_data, function(err, data) {
                        console.log('indexInit: done');
                        callback(true);
                    });
                }
            });
        }
    });
}

CDisk.prototype.indexRead = function (callback) {
    var context = this;
    this.cbase.read(add_domin('index.json'), function (err, data) {
        if (!data && err) {
            console.log('还没有初始化index.json');
            context.indexInit(function (result2) {
                if (result2) {
                    console.log('初始化index.json完成');
                    context.indexRead(callback);
                }
                console.log('初始化index.json失败');
                var result = {
                    'articles' : new Array(),
                    'comments' : new Array()
                };
                callback(result);
            });
            return;
        }
        var result = JSON.parse(data.Body);
//        console.log(data.Body)
        
        // 在这里排序好了
        result.articles.sort(function (x, y) {return y.time - x.time;});
        for (i in result.articles) {
            var time = result.articles[i].time;
            var mtime = new String(new Date(time).toLocaleTimeString()).slice(0, -3);
            result.articles[i].mtime = mtime;
        }
        callback(result);
    })
}

CDisk.prototype.articleWrite = function (title, fileObject, callback, callback2) {
//    path = 
    var date = new Date();
    var ms = date.getTime();
//    var mpath = add_domin('articles/' + ms + '/');
//    console.log('try to write dir: ' + mpath);
//    this.cbase.write(mpath, '');
    var mpath = add_domin('articles/' + ms + '/content.md');
    console.log('try to write: ' + mpath);
    this.cbase.write(mpath, fileObject);
    var info = {
        'title': title,
        'time': ms
    };
    var mpath = add_domin('articles/' + ms + '/info.json');
    console.log('try to write info: ' + mpath);
    this.cbase.write(mpath, JSON.stringify(info), callback);
    this.indexInit(function (result) {
        if (result) {
            console.log('articleWrite OK');
            callback2(true);
        } else {
            console.log('articleWrite Failed.(indexInit Failed)');
            callback2(false);
        }
    });
}

CDisk.prototype.articleRemove = function (aid, callback) {
    console.log('Try to remove:' + aid);
    console.log(add_domin('articles/' + aid + '/content.md'))
    var context = this;
    this.cbase.delete(add_domin('articles/' + aid + '/content.md'), function(err, data) {
        if (err) {
            callback(false);
            return;
        }
        context.cbase.delete(add_domin('articles/' + aid + '/info.json'), function(err, data) {
            if (err) {
                callback(false);
                return;
            }
            context.cbase.delete(add_domin('artcles/' + aid + '/'), function(err, data) {
                console.log(add_domin('artcles/' + aid + '/'))
                if (err) {
                    callback(false);
                    return;
                }
                context.indexInit(function(result) {
                    callback(result);
                })
            })
        })
    })
}