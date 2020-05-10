(function($){
    $.fn.extend({
        insertAtCaret: function(myValue){
            var $t=$(this)[0];
            if (document.selection) {
                this.focus();
                sel = document.selection.createRange();
                sel.text = myValue;
                this.focus();
            }
            else
                if ($t.selectionStart || $t.selectionStart == '0') {
                    var startPos = $t.selectionStart;
                    var endPos = $t.selectionEnd;
                    var scrollTop = $t.scrollTop;
                    $t.value = $t.value.substring(0, startPos) + myValue + $t.value.substring(endPos, $t.value.length);
                    this.focus();
                    $t.selectionStart = startPos + myValue.length;
                    $t.selectionEnd = startPos + myValue.length;
                    $t.scrollTop = scrollTop;
                }
                else {
                    this.value += myValue;
                    this.focus();
                }
        }
    })
})(jQuery);

function randomString(len) {
　　len = len || 32;
　　var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
　　var maxPos = $chars.length;
　　var pwd = '';
　　for (i = 0; i < len; i++) {
　　　　pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
　　}
　　return pwd;
}

content = $('#postit-content');
content_box = $('#postit-content-box');
resize_fun = function() {
    content.height(content_box.height());
};
fab = new mdui.Fab('#fab');
//fab.open();

window.onresize = resize_fun;

// 如果没有条子，就新建一个随机的

function openRandomPage() {
    var split = '';
    if (window.location.href[window.location.href.length-1] != '?')
        split += '?';
    else if (window.location.href[window.location.href.length-1] != '/' && 
            window.location.href[window.location.href.length-1] != '?')
        split += '/';
    if (window.location.href.endsWith('.html'))
        split += '';
    window.location.href = window.location.href + split + randomString(4);
}

if (window.location.href.indexOf('?') === -1)
    openRandomPage();

query = window.location.href.slice(window.location.href.indexOf('?')+1, window.location.href.length);
if (!query)
    openRandomPage();

// 展示模式
display = false;
if (query[0] == '+') {
    display = true;
    query = query.slice(1);
}
target_content = 'postit/' + query + '/content';

//mdui.snackbar(query);
console.log(query);

$(document).ready(function(){  
    var clipboard1 = new ClipboardJS('.btn-copy-url', {
        text: function(t) {
            return window.location.origin + window.location.pathname + '?+' + query;
        }
    });
        clipboard1.on('success', function(e) {
            mdui.snackbar('复制URL成功');
        });
        clipboard1.on('error', function(e) {
            mdui.snackbar('复制URL失败');
        });
    var clipboard2 = new ClipboardJS('.btn-copy-text');
        clipboard2.on('success', function(e) {
            mdui.snackbar('复制文本成功');
        });
        clipboard2.on('error', function(e) {
            mdui.snackbar('复制文本失败');
        });
    resize_fun();
});

cbase = new CBase();

function uploadBtn() {
    upload().then(function(d) {
        mdui.snackbar('上传成功');
    });
}

function jump() {
  var data = $('#postit-jump-target').val();
  window.location.href = window.location.origin + window.location.pathname + '?' + data;
}

function upload() {
    var data = content.val();
    return cbase.write(target_content, data).then(function(d) {
        console.log('saved', d);
    });
}

// 请保证文件存在
function read() {
    cbase.read(target_content).then(function(d) {
        console.log('readed', d);
        content.val(d.Body);
    })
}

timer = undefined;

function autoSave() {
    timer = undefined;
    upload();
}

function displayMode() {
    window.location.href = window.location.origin + window.location.pathname + '?+' + query;
}

function main() {
    cbase.listdir(target_content).then(function(d) {
//        console.log(d);
        if (!display) {
            $(content).keydown(function(e) {
                console.log('keydown', e.keyCode);
                if (e.keyCode == 13) {
                    autoSave();
                    if (timer) {
                        clearTimeout(timer);
                        timer = setTimeout(autoSave, 5000);
                    }
                }
                if (typeof timer == 'undefined') {
                    timer = setTimeout(autoSave, 5000);
                }
            })
            // 新建
            if (d.Contents.length == 0) {
                cbase.write(target_content, '').then(function(d) {
                    console.log(d);
                }).then(function() {
                    read();
                });
            } else {
                read();
            }
        } else {
            fab.hide();
            $(content).attr('readonly', '')
            read();
        }
    })
}

main();