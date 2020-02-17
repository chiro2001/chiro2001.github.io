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

function formArticles (articles) {
    for (i in articles) {
        article = articles[i];
        var tmp = $('#tmp_card').clone(true);
        tmp.show();
        
        var mdContent = $('.mdui-card-content', tmp);
        
        //在这里修改相关属性
        renderHtml(article.content, mdContent);
        $('.mdui-card-primary-title').text(article.title);
        $('.mdui-card-primary-subtitle').text('发布时间');
        
        // 这里应该去掉一部分内容
//        console.log('parent:')
//        console.log(mdContent);
//        
//        var parent = mdContent;
//        
////        $('*', mdContent).each(function (i) {
////            if (i > 4) {
////                $(this).remove('p');
////            }
////        })
//        
////        $(parent).remove('p');
//        $('p', parent).remove();
        var selected = new Array();
        var count = 0;
        var count_max = 4;
        $('*', mdContent).each(function() {
            if (count < 4) {
                count += 1;
                if (count == count_max) {
                    $(this).addClass('mdui-text-truncate');
                    $(this).text($(this).text() + '......');
                }
                selected.push($(this));
            }
        });
        $(mdContent).empty();
        for (i in selected) {
            $(mdContent).append(selected[i]);
        }
        
        $('#contain-dist').append($('<br>'));
        $('#contain-dist').append(tmp);
    }
}