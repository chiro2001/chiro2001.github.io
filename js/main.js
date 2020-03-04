function init() {
    // 用password是否定义来看是否已经登录
    //password = '1352040930';
    if (getCookie('password') != '') {
        password = getCookie('password');
    }
    cdisk = new CDisk();
//    cdisk.indexInit();
//    cdisk.indexRead(function (data) {
//        console.log(data);
//        formArticles(data.articles);
//    });
    // 用来保存已经获取的index数据
    g_res = {
        'articles': new Array(),
        'comments': new Array()
    };

    // 流程 :>检查是否建设完成->建设网站↓（刷新）
    //      > 获取内容

    // 改成全异步吧
    
    currentPage = getQueryVariable('page');
    if (!currentPage || currentPage <= 0)
        currentPage = 1;
    countPage = 10;
    totalPage = 0;
    
    pagesInit().then(() => {
        refreshArticles();
    });
}

function refreshArticles() {
    var index;
    cdisk.indexRead(totalPage - currentPage + 1, countPage).then(data => {index = data}).then(() => {
        console.log('indexRead', index.articles);
        var paths = new Array();
        for (article of index.articles) {
            if (article.Key.indexOf('content.md') != -1) {
                paths.push(article.Key.slice(0, -10));
            }
        }
        console.log('paths', paths);
        cdisk.articlesRead(paths).then(d => {
            g_res.articles = d;
            formArticles(g_res.articles);
            // 文章加载完成，消去进度条
            $('#blog-progress').hide('slow');
        });
    });
}

function publishArticle() {
    console.log($('#new-article-title').val(), $('#new-article-content').val())

    cdisk.articleWrite($('#new-article-title').val(), $('#new-article-content').val()).then(result => {
        if (result) {
            mdui.snackbar('成功');
        } else {
            mdui.snackbar('失败');
        }
    }).then(() => {
        console.log('重新开始刷新')
        refreshArticles();
    })
}

function removeArticle(aid) {
    cdisk.articleRemove(aid).then(result => {
        if (result) {
            mdui.snackbar('成功');
            // 不知道会不会成功
            $(location).attr('href', '/')
        } else {
            mdui.snackbar('失败');
        }
        console.log('重新开始刷新');
        refreshArticles();
    })  
}

function clickNewArticle() {
    if (login) {
        var inst = new mdui.Dialog($('#dialog-new-article')).open();
    } else {
        // 弹出登录对话框
        var inst2 = new mdui.Dialog($('#dialog-login')).open();
//            password = '1352040930';
//            init();
    }
}

function clickLogin() {
    var t_password = $('#login-password').val();
    // 尝试登录
    $.ajax({'url': formLoginUrl(t_password)}).then(d => {
        if (d.code == 0) {
            password = t_password;
            mdui.snackbar('登陆成功');
            setCookie('password', password, 365);
            init();
            var inst3 = new mdui.Dialog($('#dialog-new-article')).open();
        } else {
            mdui.snackbar('密码错误');
            password = undefined;
        }
    }, d => {
        mdui.snackbar('登陆失败');
    })
}

async function pagesInit() {
    $('#blog-page-current').text(currentPage);
    var targetPage = parseInt(currentPage) - 1;
    if (targetPage < 1) {
        targetPage = 1;
        $('#blog-btn-backward').hide();
    }
    $('#blog-btn-backward').attr('href','//' + document.domain + '/?page=' + targetPage);
    var total = await cdisk.pageCount(countPage);
    totalPage = total;
    $('#blog-page-total').text(total);
    var targetPage = parseInt(currentPage) + 1;
    if (targetPage > totalPage) {
        targetPage = totalPage;
        $('#blog-btn-forward').hide();
    }
    $('#blog-btn-forward').attr('href','//' + document.domain + '/?page=' + targetPage);
}

function pagesBackward() {
    currentPage--;
    if (currentPage < 1)
        currentPage = 1;
    window.location.href = '/?page=' + currentPage;
}

function pagesForward() {
    currentPage++;
    if (currentPage > totalPage)
        currentPage = totalPage;
//    window.location.href = '/?page=' + currentPage;
    window.open('/?page=' + currentPage);
}