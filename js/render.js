//创建实例
var converter = new showdown.Converter();
//应用一些特殊的类
var map_table = {
    'mdui-text-color-theme': new Array('h1', 'h2'),
    'mdui-text-color-theme-accent': new Array('strong', 'em'),
    'mdui-btn mdui-btn-raised mdui-ripple mdui-color-theme-accent': new Array('button'),
    'mdui-textfield-input': new Array('input', 'textarea')
}

function render() {
    var dist = $('#contain-dist');
    dist.html(converter.makeHtml($('#contain-src').val()));
    
    for (mclass in map_table) {
        var arr = map_table[mclass];
        for (j in arr) {
            console.log(mclass);
            $(arr[j], dist).addClass(mclass);
        }
    }
    
    dist.mutation();
}

function renderHtml(md, dist) {
    dist.html(converter.makeHtml(md));
    
    for (mclass in map_table) {
        var arr = map_table[mclass];
        for (j in arr) {
//            console.log(mclass);
            $(arr[j], dist).addClass(mclass);
        }
    }
    
    return dist;
}

function expandCard (aid) {
    // 打开'关闭'按钮，关闭'继续阅读'按钮
    
    $('.blog-btn-continue-id-' + aid).hide();
    $('.blog-btn-close-id-' + aid).show();
    
    var mdContent = $('.blog-content-id-' + aid);
    $(mdContent).empty();
    for (i in g_res.articles) {
        if (g_res.articles[i].time == aid) {
            renderHtml(g_res.articles[i].content, $(mdContent));
        }
    }
    $$(mdContent).mutation();
}

function closeCard (aid) {
    $('.blog-btn-continue-id-' + aid).show();
    $('.blog-btn-close-id-' + aid).hide();
    
    // 这里应该去掉一部分内容
    var mdContent = $('.blog-content-id-' + aid);
    
    // 这里应该去掉一部分内容
    var selected = new Array();
    var count = 0;
    var count_max = 4;
    var isNeedExpand = false;
    $('*', mdContent).each(function() {
        if (count < 4) {
            count += 1;
            if (count == count_max) {
                // 需要有继续阅读按钮
                isNeedExpand = true;
                $(this).addClass('mdui-text-truncate');
                $(this).text($(this).text() + '...');
            }
            selected.push($(this));
        }
    });
    $(mdContent).empty();
    for (i in selected) {
        $(mdContent).append(selected[i]);
    }

    $$(mdContent).mutation();
}

function formArticles (articles) {
    // 刷新
    $('#contain-dist').empty();
    for (i in articles) {
        article = articles[i];
        var tmp = $('#tmp_card').clone(true);
        tmp.show();
        
        var mdContent = $('.mdui-card-content', tmp);
        $(mdContent).addClass('blog-content-id-' + article.time);
        
        //在这里修改相关属性
        renderHtml(article.content, mdContent);
        $('.mdui-card-primary-title', tmp).text(article.title);
        $('.mdui-card-primary-subtitle', tmp).text(article.mtime);
        // 绑定按钮（？）给他增加属性
        $('.blog-continue', tmp).click(function(event) {
            var btn = $(event.currentTarget);
            var classes = $(btn).attr('class').split(' ');
            for (i in classes) {
                if (classes[i].indexOf('blog-btn-continue-id-') == 0) {
                    var aid = classes[i].slice(21);
                    expandCard(aid);
                }
            }
        }).addClass('blog-btn-continue-id-' + article.time);
        $('.blog-close', tmp).click(function(event) {
            var btn = $(event.currentTarget);
            var classes = $(btn).attr('class').split(' ');
            for (i in classes) {
                if (classes[i].indexOf('blog-btn-close-id-') == 0) {
                    var aid = classes[i].slice(18);
                    closeCard(aid);
                }
            }
        }).addClass('blog-btn-close-id-' + article.time);
        
        // 这里应该去掉一部分内容
        var selected = new Array();
        var count = 0;
        var count_max = 4;
        var isNeedExpand = false;
        $('*', mdContent).each(function() {
            if (count < 4) {
                count += 1;
                if (count == count_max) {
                    // 需要有继续阅读按钮
                    isNeedExpand = true;
                    $(this).addClass('mdui-text-truncate');
                    $(this).text($(this).text() + '...');
                }
                selected.push($(this));
            }
        });
        $(mdContent).empty();
        for (i in selected) {
            $(mdContent).append(selected[i]);
        }
        
        if (isNeedExpand) {
            $('.blog-continue', tmp).show();
        }
        
        $('#contain-dist').append($('<br>'));
        $('#contain-dist').append(tmp);
    }
}