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

  resize = function() {
    $('.chat-frame').height($('html').height() - $('header').height() - 4);
  };
  window.onresize = resize;
  $(document).ready(resize);
  frameCount = 0;
  tabNow = 0;
  var gtabs = new Array();
  
  function figurebedUpload() {
    $('.btn-copy').hide();
    if (!$('#file').get(0).files[0]) {
        mdui.snackbar('请先选择文件');
        return;
    }
    mdui.snackbar("图片开始上传");
    var count = $('#file').get(0).files.length;
    var finish = 0;
    for (file of $('#file').get(0).files) {
      uploadImage(file, $('#file').get(0).files[0].name, function(r) {
          console.log(r.message)
          if (r.success && !r.cos_url) {
              url = r.data.url;
          } else {
//              mdui.snackbar(r.message);
              if (r.cos_url) {
                  url = r.cos_url;
              } else
                  return;
          }
          url = encodeURI(url);
          console.log(url);
          $('#bed-result').insertAtCaret('![img](' + url + ')\n');
          $('.btn-copy').fadeIn('slow');
          finish += 1;
          $('.mdui-progress-determinate').css('width', '' + 100 * (finish / count) + '%');
      });
    }
    mdui.snackbar('图片全部上传完成');
}

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

function b64Encode(str) {
  return btoa(encodeURIComponent(str));
}

function b64Decode(str) {
  return decodeURIComponent(atob(str));
}

//imgToken = 'PP8y8OFkPv17aBTnsy1KAuQqqvAP48VW';
function uploadImage(data, filename, callback) {
    if (!filename) {
        filename = randomString(6) + '.jpg';
    }
    filename = randomString(6) + '_' + filename;
//    filetype = filename.slice(filename.lastIndexOf('.')+1, filename.length).toLowerCase();
    console.log('upload image:', filename)
    
    if (!cbase) {
        console.log("CBase error!");
        return;
    }
    cbase.write('my_imgs/' + filename, data).then(function(d) {
//       // 等待程序反应
//        var retry = 0;
//        var wait = function() {
//            try {
//                cbase.read('result/img_s/' + filename + '.json').then(r => {
//                    console.log(r);
//                    try {
//                        result = JSON.parse(r.Body)
//                    } catch (e2) {
//                        retry = retry + 1;
//                        if (retry < 10)
//                            setTimeout(wait, 1000);
//                        else {
//                            mdui.alert('图片转化失败！' + e2);
//                            console.log(e2);
//                        }
//                    }
//                });
//            } catch (e) {
//                mdui.alert('图片上传失败！' + e);
//                console.log(e);
//            }
//        };
//        setTimeout(wait, 8000);
        
//        var retry = 0;
//        var wait = function() {
//            $.ajax({
//                url: 'http://bed-1254016670.cos.ap-guangzhou.myqcloud.com/result/imgs/' + filename + '.json'
//            }).success(function(r) {
//                console.log(r);
////                try {
////                    result = JSON.parse(r.Body)
////                } catch (e2) {
////                    mdui.alert('图片转化失败！' + e2);
////                    console.log('图片转化失败！', e2);
////                }
//                if (r.code == 'invalid_source') {
//                    callback({
//                        'success': false,
//                        'message': '图片转化错误(' + r.message + ')，返回cos_url',
//                        'cos_url': 'http://bed-1254016670.cos.ap-guangzhou.myqcloud.com/imgs/' + filename
//                    });
//                }
//                callback(r);
//                return;
//            }).fail(function(e) {
//                retry ++;
//                if (retry > 10) {
////                    mdui.snackbar('图片转化超时！' + e);
////                    console.log('图片转化超时！', e);
//                    callback({
//                        'success': false,
//                        'message': '图片转化超时，返回cos_url',
//                        'cos_url': 'http://bed-1254016670.cos.ap-guangzhou.myqcloud.com/imgs/' + filename
//                    });
//                    return;
//                }
//                setTimeout(wait, 1000);
//            });
//        };
//        mdui.snackbar("上传完毕");
//        console.log('upload ok! wait for processing...')
//        setTimeout(wait, 10000);
        callback({
            'success': true,
            'message': undefined,
            'cos_url': 'http://bed-1254016670.cos.ap-guangzhou.myqcloud.com/my_imgs/' + filename
        })
    });
}
//x my api: http://service-47e2cy1w-1254016670.gz.apigw.tencentcs.com/
// use cos

//$('#send').click(function() {
//    getToken('LanceLiang2018', '1352040930lxr').then(token => {
//        uploadImage($('#file').get(0).files[0], token).then(url => {
//            console.log(url);
//            $('#res').append($('<img src="' + url + '">'));
//        }).fail(function() {console.log('upload Failed');});
//    }).fail(function() {console.log('getToken Failed')});
//})

$(document).ready(function(){  
    var clipboard = new ClipboardJS('.btn-copy');
    clipboard.on('success', function(e) {
        mdui.snackbar('复制成功');
    });
    clipboard.on('error', function(e) {
        mdui.snackbar('复制失败');
    });
});
  
cbase = new CBase();
