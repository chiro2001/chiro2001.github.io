resize = function() {
    $('.chat-frame').height($('html').height() - $('header').height() - 4);
  };
  window.onresize = resize;
  $(document).ready(resize);
  frameCount = 0;
  tabNow = 0;
  var gtabs = new Array();
  
  setTimeout(function() {$('.mdui-tab-indicator').remove();}, 1000);
  function tabShow(target) {
    tabNow = '' + target;
    jQuery('.chat-frame').hide();
    jQuery('.chat-tab').css('font-weight', '');
    jQuery('#chat-frame-' + target).show();
    jQuery('#chat-tab-' + target).removeClass('mdui-color-theme-a100');
    jQuery('#chat-tab-' + target).css('font-weight', '600');
    jQuery('.mdui-tab-active').removeClass('mdui-tab-active');
    jQuery('#chat-tab-' + target).addClass('mdui-text-color-theme-accent');
    jQuery('#chat-tab-' + target).addClass('mdui-tab-active');
    
    frames = $('.chat-frame');
    frames.find('chatinput').focus(false);
    if (frames) {
      for (i=0; i<frames.length; i++) {
        try {
          frames[i].contentWindow.windowActive = false;
        } catch (___) {}
      }
    }
    var subWindow = $('#chat-frame-' + target)[0];
    if (subWindow) {
      subWindow.contentWindow.unread = 0;
      subWindow.contentWindow.windowActive = true;
      if (subWindow.contentWindow.updateTitle)
        subWindow.contentWindow.updateTitle();
    }
      $('.mdui-tab-indicator').remove();
      mdui.mutation();
  }
    $('#chat-new-room-text').bind('keydown',function(event){
        if(event.keyCode == "13")    
        {
            openNewRoom();
        }
    });
  
  function openNewRoom(room) {
    if (!gtabs) {
      gtabs = new Array();
    }
    gtabs.push('' + frameCount);
    try {
      dialogNewRoom.close();
    } catch(e) {
        console.log('chat-new-room close err', e);
    }
    if (room != '_index')
      room = $('#chat-new-room-text').val();
    else
      room = '';
    var inst = new mdui.Tab('#chat-tabs');
    var frames = $('#chat-frames');
    var tabs = $('#chat-tabs');
    var target = 'chat-frame-' + frameCount;
    var target_tab = 'chat-tab-' + frameCount;
    var mtab = $('<a href="#' + target + '" class="mdui-ripple chat-tab" onclick="tabShow(\'' + frameCount + '\');" id="' + target_tab + '">' + room + '</a>');
    var mframe = $('<iframe src="core.html?' + room + '&tabId=' + frameCount + '" frameborder="0" width="100%" seamless class="chat-frame" id="' + target + '"></iframe>');
    $(tabs).append(mtab);
    $(frames).append(mframe);
    tabShow(frameCount);
    frameCount = frameCount + 1;
    
    mdui.mutation();
    resize();
    setTimeout(resize, 2000);
      mdui.mutation();
  }
  
  function closeRoom(tid) {
    if (!tid) {
      tid = tabNow;
    }
    var target = 'chat-frame-' + tid;
    var target_tab = 'chat-tab-' + tid;
    $('#' + target).remove();
    $('#' + target_tab).remove();
    
//    console.log('tid', tid);
    var index = gtabs.indexOf(tid);
//    delete gtabs[index];
    gtabs[index] = undefined;
    var found = false;
    for (i=index; i<gtabs.length; i++) {
      if (gtabs[i] != undefined) {
//        var target2 = 'chat-frame-' + gtabs[i];
        tabShow(gtabs[i]);
        found = true;
        break;
      }
    }
    if (!found) {
      for (i=index; i>=0; i--) {
        if (gtabs[i] != undefined) {
          tabShow(gtabs[i]);
          found = true;
          break;
        }
      }
    }
    if (!found) {
      dialogNewRoom.open();
    }
      mdui.mutation();
}
    
function readfile(input, callback) {  
    var filename = input.files[0].name
    //支持chrome IE10  
    if (window.FileReader) {  
        var file = input.files[0];  
//        filename = file.name.split(".")[0];  
        var reader = new FileReader();  
        reader.onload = function() {  
//            console.log(this.result);  
            uploadImage(this.result, filename, callback);
        }  
        reader.readAsText(file);  
    }   
    //支持IE 7 8 9 10  
    else if (typeof window.ActiveXObject != 'undefined'){  
        var xmlDoc;   
        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");   
        xmlDoc.async = false;   
        xmlDoc.load(input.value);   
//        console.log(xmlDoc.xml);   
        uploadImage(xmlDoc.xml, filename, callback);
    }   
    //支持FF  
    else if (document.implementation && document.implementation.createDocument) {   
        var xmlDoc;   
        xmlDoc = document.implementation.createDocument("", "", null);   
        xmlDoc.async = false;   
        xmlDoc.load(input.value);   
//        console.log(xmlDoc.xml);
        uploadImage(xmlDoc.xml, filename, callback);
    } else {   
        alert('读取文件错误');   
    }   
}

function figurebedUpload() {
    $('.btn-copy').hide();
    if (!$('#file').get(0).files[0]) {
        mdui.snackbar('请先选择文件');
        return;
    }
    $('#figurebed-result').empty();
    uploadImage($('#file').get(0).files[0], $('#file').get(0).files[0].name, function(r) {
        console.log(r.message)
        if (r.success && !r.cos_url) {
            url = r.data.url;
        } else {
            mdui.snackbar(r.message);
            if (r.cos_url) {
                url = r.cos_url;
            } else
                return;
        }
        url = encodeURI(url);
        console.log(url);
        $('#figurebed-result').append($('<a href="' + url + '" target="_blank">图像链接</a>'));
        var tmpText = $('<div class="mdui-textfield"><textarea id="bed-result" class="mdui-textfield-input" type="text" autocomplete="off" autofocus=""></textarea></div>');
        $('.mdui-textfield-input', tmpText).val('![img](' + url + ')');
        $('#figurebed-result').append(tmpText);
        $('.btn-copy').fadeIn('slow');
        new mdui.Dialog('#dialog-figurebed').handleUpdate();
    });
}

$(document).ready(function(){  
    var clipboard = new ClipboardJS('.btn-copy');
    clipboard.on('success', function(e) {
        mdui.snackbar('复制成功');
    });
    clipboard.on('error', function(e) {
        mdui.snackbar('复制失败');
    });
});
  
    dialogNewRoom = new mdui.Dialog('#chat-new-room', {
        history: false
    });
    cbase = new CBase();
    openNewRoom('_index');