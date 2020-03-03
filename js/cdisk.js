var sleep = function(time) {
    var startTime = new Date().getTime() + parseInt(time, 10);
    while(new Date().getTime() < startTime) {}
};

// 进一步封装
function CDisk() {
    this.cbase = new CBase();
}

CDisk.prototype.articlesRead = async function (paths) {
    var articles = new Array();
    // 多线程获取
    var promises = paths.map(async path => {
        var article = await this.articleRead(path);
        return article;
    })
    for (p of promises) {
        p.then(data => {articles.push(data)});
    }
    // 等待全部操作完成
    return Promise.all(promises).then((values) => {
        values = values.sort((a, b) => {return a.time < b.time});
        console.log('全部操作完成', values)
//        console.log(articles);
//        debugger;
        return values;
    });
}

CDisk.prototype.articleRead = async function (path) {
    var data_info = await this.cbase.read(path + 'info.json');
    var body_info = JSON.parse(data_info.Body);
    var title = body_info.title;
    var time = body_info.time;
    var mtime = new String((new Date(time).toLocaleDateString() == new Date().toLocaleDateString() ? '' : new Date(time).toLocaleDateString() + ' ') + new Date(time).toLocaleTimeString()).slice(0, -3);
    var data_content = await this.cbase.read(path + 'content.md');
    var content = data_content.Body;
    return {
        'title': title, 'content': content, 'time': time, 'mtime': mtime
    };
}

// 检查是否已经部署了这个网站(没有回调)
CDisk.prototype.siteCheck = async function () {
    return new Promise((resolve, reject) => {
        try {
            var result = this.cbase.read(add_domin('articles/'));
            resolve(true);
        } catch (e) {
            reject(false);
        }
    });
}

CDisk.prototype.pageCount = async function(count = 10) {
    var originList = await this.cbase.listdirAll(add_domin('articles'), 1000);
    var total = originList.Contents.length;
    return Math.ceil(total / count);
}

CDisk.prototype.siteInit = async function() {
//    return new Promise((resolve, reject) => {
//        var result = this.cbase.write(add_domin('articles'));
//        resolve(true);
//    })
    return true;
}

CDisk.prototype.indexRead = async function (page = 1, count = 10) {
    var res = {
        'articles': new Array(),
        'comments': new Array()
    };
    var nextMarker = undefined;
    while (page > 0) {
        console.log('page:', page);
        var originList = await this.cbase.listdirAll(add_domin('articles'), count, nextMarker);
        var allList = originList.Contents;
        console.log(nextMarker, '->', originList.NextMarker);
        nextMarker = originList.NextMarker
        page--;
        allList = allList.sort().reverse();
        res.articles = allList;
        console.log('allList', allList);
        console.log('originList', originList);
        if (typeof nextMarker == 'undefined' || nextMarker == add_domin('articles/'))
            break;
    }
    
    return res;
}

CDisk.prototype.articleWrite = async function (title, fileObject, tags) {
    var date = new Date();
    var ms = date.getTime();
    var mpath_content = add_domin('articles/' + ms + '/content.md');
    var mpath_info = add_domin('articles/' + ms + '/info.json');

    console.log('try to write', mpath_content, mpath_info)
    
    var info = {
        'title': title,
        'time': ms,
        'tags': tags
    };
    var jsonInfo = JSON.stringify(info);
    
    // 两个并行的上传
    var promiseContent = this.cbase.write(mpath_content, fileObject);
    var promiseInfo = this.cbase.write(mpath_info, jsonInfo);
    
    return Promise.all([promiseContent, promiseInfo])
        .then(values => {
        console.log('上传完成', values);
        return true;
    })
        .catch(reason => {
        console.log('错误', reason);
        return false;
    });
}

CDisk.prototype.articleRemove = async function (aid) {
    console.log('Try to remove:', aid);
    console.log(add_domin('articles/' + aid + '/content.md'));
    var result1 = await this.cbase.delete(add_domin('articles/' + aid + '/content.md'));
    var result2 = await this.cbase.delete(add_domin('articles/' + aid + '/info.md'));
    return result1 && result2;
}
