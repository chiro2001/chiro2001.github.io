$ = jQuery;
$$ = jQuery;
//$_ = document.querySelector;

function getCookieByArray(name){
 var cookies = document.cookie.split(';');
 var c;
 for(var i=0; i<cookies.length ; i++){
  c = cookies[i].split('=');
  if (c[0].replace(' ', '') == name) {
   return c[1];
  }
 }
}
/**
 * 设置文档主题
 */
var DEFAULT_PRIMARY = 'pink';
var DEFAULT_ACCENT = 'yellow';
var DEFAULT_LAYOUT = 'dark';

// 设置 cookie
var setCookie = function (key, value) {
  // cookie 有效期为 1 年
  var date = new Date();
  date.setTime(date.getTime() + 365*24*3600*1000);
  document.cookie = key + '=' + value + '; expires=' + date.toGMTString() + '; path=/';
};

var setDocsTheme = function (theme) {
  if (typeof theme.primary === 'undefined') {
    theme.primary = false;
  }
  if (typeof theme.accent === 'undefined') {
    theme.accent = false;
  }
  if (typeof theme.layout === 'undefined') {
    theme.layout = false;
  }

  var i, len;
  var $body = jQuery('body');

  var classStr = $body.attr('class');
  var classs = classStr.split(' ');

  // 设置主色
  if (theme.primary !== false) {
    for (i = 0, len = classs.length; i < len; i++) {
      if (classs[i].indexOf('mdui-theme-primary-') === 0) {
        $body.removeClass(classs[i])
      }
    }
    $body.addClass('mdui-theme-primary-' + theme.primary);
    setCookie('docs-theme-primary', theme.primary);
    $$('input[name="doc-theme-primary"][value="' + theme.primary + '"]').prop('checked', true);
  }

  // 设置强调色
  if (theme.accent !== false) {
    for (i = 0, len = classs.length; i < len; i++) {
      if (classs[i].indexOf('mdui-theme-accent-') === 0) {
        $body.removeClass(classs[i]);
      }
    }
    $body.addClass('mdui-theme-accent-' + theme.accent);
    setCookie('docs-theme-accent', theme.accent);
    $$('input[name="doc-theme-accent"][value="' + theme.accent + '"]').prop('checked', true);
  }

  // 设置主题色
  if (theme.layout !== false) {
    for (i = 0, len = classs.length; i < len; i++) {
      if (classs[i].indexOf('mdui-theme-layout-') === 0) {
        $body.removeClass(classs[i]);
      }
    }
    if (theme.layout !== '') {
      $body.addClass('mdui-theme-layout-' + theme.layout);
    }
    setCookie('docs-theme-layout', theme.layout);
    $$('input[name="doc-theme-layout"][value="' + theme.layout + '"]').prop('checked', true);
  }
};

// 切换主色
$$(document).on('change', 'input[name="doc-theme-primary"]', function () {
  setDocsTheme({
    primary: $$(this).val()
  });
    updateConfig();
});

// 切换强调色
$$(document).on('change', 'input[name="doc-theme-accent"]', function () {
  setDocsTheme({
    accent: $$(this).val()
  });
    updateConfig();
});

// 切换主题色
$$(document).on('change', 'input[name="doc-theme-layout"]', function () {
  setDocsTheme({
    layout: $$(this).val()
  });
    updateConfig();
});

// 恢复默认主题
$$(document).on('cancel.mdui.dialog', '#dialog-docs-theme', function () {
  setDocsTheme({
    primary: DEFAULT_PRIMARY,
    accent: DEFAULT_ACCENT,
    layout: DEFAULT_LAYOUT
  });
    updateConfig();
});

function getTheme() {
  var theme = {};
  theme.accent = getCookieByArray('docs-theme-accent');
  theme.primary = getCookieByArray('docs-theme-primary');
  theme.layout = getCookieByArray('docs-theme-layout');
  setDocsTheme(theme);
}

//getTheme();

/*
 *
 * NOTE: The client side of hack.chat is currently in development,
 * a new, more modern but still minimal version will be released
 * soon. As a result of this, the current code has been deprecated
 * and will not actively be updated.
 *
*/

// initialize markdown engine
var markdownOptions = {
	html: false,
	xhtmlOut: false,
	breaks: true,
	langPrefix: '',
	linkify: true,
	linkTarget: '_blank" rel="noreferrer',
	typographer:  true,
	quotes: `""''`,

	doHighlight: true,
	highlight: function (str, lang) {
		if (!markdownOptions.doHighlight || !window.hljs) { return ''; }

		if (lang && hljs.getLanguage(lang)) {
			try {
				return hljs.highlight(lang, str).value;
			} catch (__) {}
		}

		try {
			return hljs.highlightAuto(str).value;
		} catch (__) {}

		return '';
	}
};

var md = new Remarkable('full', markdownOptions);

// image handler
var allowImages = true;
var imgHostWhitelist = [
	'nmbimg.fastmirror.org',
	'i.loli.net',
	's1.ax1x.com',
	'chat.henrize.kim',
];

function getDomain(link) {
	var a = document.createElement('a');
	a.href = link;
	return a.hostname;
}

function isWhiteListed(link) {
	return imgHostWhitelist.indexOf(getDomain(link)) !== -1;
}

md.renderer.rules.image = function (tokens, idx, options) {
	var src = Remarkable.utils.escapeHtml(tokens[idx].src);

	if (isWhiteListed(src) && allowImages) {
		var imgSrc = ' src="' + Remarkable.utils.escapeHtml(tokens[idx].src) + '"';
		var title = tokens[idx].title ? (' title="' + Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(tokens[idx].title)) + '"') : '';
		var alt = ' alt="' + (tokens[idx].alt ? Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(Remarkable.utils.unescapeMd(tokens[idx].alt))) : '') + '"';
		var suffix = options.xhtmlOut ? ' /' : '';
		var scrollOnload = isAtBottom() ? ' onload="window.scrollTo(0, document.body.scrollHeight)"' : '';
		return '<a href="' + src + '" target="_blank" rel="noreferrer"><img' + scrollOnload + imgSrc + alt + title + suffix + '></a>';
	}

  return '<a href="' + src + '" target="_blank" rel="noreferrer">' + Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(src)) + '</a>';
};

md.renderer.rules.link_open = function (tokens, idx, options) {
	var title = tokens[idx].title ? (' title="' + Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(tokens[idx].title)) + '"') : '';
  var target = options.linkTarget ? (' target="' + options.linkTarget + '"') : '';
  return '<a rel="noreferrer" onclick="return verifyLink(this)" href="' + Remarkable.utils.escapeHtml(tokens[idx].href) + '"' + title + target + '>';
};

md.renderer.rules.text = function(tokens, idx) {
	tokens[idx].content = Remarkable.utils.escapeHtml(tokens[idx].content);

	if (tokens[idx].content.indexOf('?') !== -1) {
		tokens[idx].content = tokens[idx].content.replace(/(^|\s)(\?)\S+?(?=[,.!?:)]?\s|$)/gm, function(match) {
			var channelLink = Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(match.trim()));
			var whiteSpace = '';
			if (match[0] !== '?') {
				whiteSpace = match[0];
			}
			return whiteSpace + '<a href="' + channelLink + '" target="_blank">' + channelLink + '</a>';
		});
	}

  return tokens[idx].content;
};

md.use(remarkableKatex);

function verifyLink(link) {
	var linkHref = Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(link.href));
	if (linkHref !== link.innerHTML) {
		return confirm('Please confirm that this is the link you want to jump to: ' + linkHref);
	}

	return true;
}

var verifyNickname = function (nick) {
	return /^[a-zA-Z0-9_]{1,24}$/.test(nick);
}

var frontpage = [
	"```",
	" _           _         _       _   ",
	"| |_ ___ ___| |_   ___| |_ ___| |_ ",
	"|   |_ ||  _| '_| |  _|   |_ ||  _|",
	"|_|_|__/|___|_,_|.|___|_|_|__/|_|  ",
	"                                   ",
	"```",
	"---",
	"Welcome to hack.chat, a minimal, distraction-free chat application.",
	"Channels are created, joined and shared with the url, create your own channel by changing the text after the question mark.",
	"If you wanted your channel name to be 'your-channel': https://hack.chat/?your-channel",
	"There are no channel lists, so a secret channel name can be used for private discussions.",
	"---",
	"Here are some pre-made channels you can join:",
	"?lounge ?meta ?math ?physics ?chemistry ?technology ?programming ?games ?banana ?chinese",
	"And here's a random one generated just for you: ?" + Math.random().toString(36).substr(2, 8),
	"---",
	"Formatting:",
	"This client includes a full Markdown engine, use \\`\\`\\`fencing\\`\\`\\` to preserve whitespace.",
	"Surround LaTeX with a dollar sign for inline style $\\zeta(2) = \\pi^2/6$, and two dollars for display. $$\\int_0^1 \\int_0^1 \\frac{1}{1-xy} dx dy = \\frac{\\pi^2}{6}$$",
	"For syntax highlight, wrap the code like: \\`\\`\\`<language> <the code>\\`\\`\\` where <language> is any known programming language.",
	"---",
	"Current Github: https://github.com/hack-chat",
	"Legacy GitHub: https://github.com/AndrewBelt/hack.chat",
	"Bots, Android clients, desktop clients, browser extensions, docker images, programming libraries, server modules and more:",
	"https://github.com/hack-chat/3rd-party-software-list",
	"---",
	"Server and web client released under the WTFPL and MIT open source license.",
	"No message history is retained on the hack.chat server."
].join("\n");

function $_(query) {
	return document.querySelector(query);
}

function localStorageGet(key) {
	try {
		return window.localStorage[key]
	} catch (e) { }
}

function localStorageSet(key, val) {
	try {
		window.localStorage[key] = val
	} catch (e) { }
}

function updateConfig() {

    var soundSwitch = document.getElementById("sound-switch")
    var notifySetting = localStorageGet("notify-sound")
    //
    // Update localStorage with value of checkbox
    soundSwitch.addEventListener('change', (event) => {
        localStorageSet("notify-sound", soundSwitch.checked)
        updateConfig();
    })
    // Check if localStorage value is set, defaults to OFF
    if (notifySetting === null) {
        localStorageSet("notify-sound", "false")
        soundSwitch.checked = false
    }
    // Configure soundSwitch checkbox element
    if (notifySetting === "true" || notifySetting === true) {
        soundSwitch.checked = true
    } else if (notifySetting === "false" || notifySetting === false) {
        soundSwitch.checked = false
    }

    // Create a new notification after checking if permission has been granted
    function spawnNotification(title, body) {
        // Let's check if the browser supports notifications
        if (!("Notification" in window)) {
            console.error("Your browser does not support browser notifications.");
        } else if (Notification.permission === "granted") { // Check if notification permissions are already given
            // If it's okay let's create a notification
            var options = {
                body: body,
                icon: "/favicon-96x96.png"
            };
            var n = new Notification(title, options);
        }
        // Otherwise, we need to ask the user for permission
        else if (Notification.permission !== "denied") {
            if (RequestNotifyPermission()) {
                var options = {
                    body: body,
                    icon: "/favicon-96x96.png"
                };
                var n = new Notification(title, options);
            }
        } else if (Notification.permission == "denied") {
            // At last, if the user has denied notifications, and you
            // want to be respectful, there is no need to bother them any more.
        }
    }

    function notify(args) {
        // Spawn notification if enabled
        if (notifySwitch.checked) {
            spawnNotification("?" + myChannel + "  —  " + args.nick, args.text)
        }

        // Play sound if enabled
        if (soundSwitch.checked) {
            var soundPromise = document.getElementById("notify-sound").play();
            if (soundPromise) {
                soundPromise.catch(function (error) {
                    console.error("There was a problem playing the sound:\n" + error);
                });
            }
        }
    }

    $('#clear-messages').click(function () {
      $('#chat-frame-' + tabNow).contents().find('#messages').html('');
    })

    // Restore settings from localStorage

    if (localStorageGet('enter-send') == 'false') {
      $_('#enter-send').checked = false;
    } else {
      $_('#enter-send').checked = true;
    }

    if (localStorageGet('emote') == 'false') {
      $_('#emote').checked = false;
    } else {
      $_('#emote').checked = true;
    }

    if (localStorageGet('joined-left') == 'false') {
      $_('#joined-left').checked = false;
    } else {
      $_('#joined-left').checked = true;
    }

    if (localStorageGet('parse-latex') == 'false') {
        $_('#parse-latex').checked = false;
        md.inline.ruler.disable([ 'katex' ]);
        md.block.ruler.disable([ 'katex' ]);
    }

    document.querySelector('#joined-left').onchange = function (e) {
        localStorageSet('joined-left', !!e.target.checked);
        updateConfig();
    }

    document.querySelector('#enter-send').onchange = function (e) {
        localStorageSet('enter-send', !!e.target.checked);
        updateConfig();
    }

    document.querySelector('#emote').onchange = function (e) {
        localStorageSet('emote', !!e.target.checked);
        updateConfig();
    }

    $_('#parse-latex').onchange = function (e) {
        var enabled = !!e.target.checked;
        localStorageSet('parse-latex', enabled);
        if (enabled) {
            md.inline.ruler.enable([ 'katex' ]);
            md.block.ruler.enable([ 'katex' ]);
        } else {
            md.inline.ruler.disable([ 'katex' ]);
            md.block.ruler.disable([ 'katex' ]);
        }
        updateConfig();
    }

    if (localStorageGet('syntax-highlight') == 'false') {
        $_('#syntax-highlight').checked = false;
        markdownOptions.doHighlight = false;
    }

    $_('#syntax-highlight').onchange = function (e) {
        var enabled = !!e.target.checked;
        localStorageSet('syntax-highlight', enabled);
        markdownOptions.doHighlight = enabled;
        updateConfig();
    }

    if (localStorageGet('allow-imgur') == 'false') {
        $_('#allow-imgur').checked = false;
        allowImages = false;
    }

    $_('#allow-imgur').onchange = function (e) {
        var enabled = !!e.target.checked;
        localStorageSet('allow-imgur', enabled);
        allowImages = enabled;
        updateConfig();
    }

    var highlights = [
        'agate',
        'androidstudio',
        'atom-one-dark',
        'darcula',
        'github',
        'rainbow',
        'tomorrow',
        'xcode',
        'zenburn'
    ]

    //var currentScheme = 'atelier-dune';
    var currentHighlight = 'darcula';

    function setHighlight(scheme) {
        currentHighlight = scheme;
        $_('#highlight-link').href = "http://chat.henrize.kim:3000/vendor/hljs/styles/" + scheme + ".min.css";
        localStorageSet('highlight', scheme);
    }

    highlights.forEach(function (scheme) {
        var option = document.createElement('option');
        option.textContent = scheme;
        option.value = scheme;
        $_('#highlight-selector').append(option);
    });

    //$('#scheme-selector').onchange = function (e) {
    //	setScheme(e.target.value);
    //}
    //
    $_('#highlight-selector').onchange = function (e) {
        setHighlight(e.target.value);
        updateConfig();
    }

    if (localStorageGet('highlight')) {
        setHighlight(localStorageGet('highlight'));
    }

    $_('#highlight-selector').value = currentHighlight;
    
    getTheme();
    
    updateTabsConfig();
}

function updateTabsConfig() {
    frames = $('.chat-frame');
//    frames.find('chatinput').focus(false);
    if (frames) {
      for (i=0; i<frames.length; i++) {
        frames[i].contentWindow.updateConfig();
      }
    }
}

updateConfig();

function downloadTabMessage() {
    var subWindow = $('#chat-frame-' + tabNow)[0];
    if (subWindow) {
        if (subWindow.contentWindow.downloadMessages)
            subWindow.contentWindow.downloadMessages();
    }
}

function getToken(username, password) {
    return $.ajax({
        url:'https://sm.ms/api/v2/token', 
        data: {
          username:username, 
          password:password
        },
        type: "POST"
      }).then(d => {
        data = JSON.parse(d);
        console.log(data.message);
        if (data.code == 'success') {
            return data.data.token;
        }
      });
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
    console.log('upload image:', filename)
    
    if (!cbase) {
        console.log("CBase error!");
        return;
    }
    cbase.write('imgs/' + filename, data).then(function(d) {
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
        
        var retry = 0;
        var wait = function() {
            $.ajax({
                url: 'http://bed-1254016670.cos.ap-guangzhou.myqcloud.com/result/imgs/' + filename + '.json'
            }).success(function(r) {
                console.log(r);
//                try {
//                    result = JSON.parse(r.Body)
//                } catch (e2) {
//                    mdui.alert('图片转化失败！' + e2);
//                    console.log('图片转化失败！', e2);
//                }
                if (r.code == 'invalid_source') {
                    callback({
                        'success': false,
                        'message': 'Image conversion error(' + r.message + '), using cos_url',
                        'cos_url': 'http://bed-1254016670.cos.ap-guangzhou.myqcloud.com/imgs/' + filename
                    });
                }
                callback(r);
                return;
            }).fail(function(e) {
                retry ++;
                if (retry > 10) {
//                    mdui.snackbar('图片转化超时！' + e);
//                    console.log('图片转化超时！', e);
                    callback({
                        'success': false,
                        'message': 'Image conversion timeout, return cos_url',
                        'cos_url': 'http://bed-1254016670.cos.ap-guangzhou.myqcloud.com/imgs/' + filename
                    });
                    return;
                }
                setTimeout(wait, 1000);
            });
        };
        mdui.snackbar("Upload completed, waiting for image conversion...");
        console.log('upload ok! wait for processing...')
        setTimeout(wait, 10000);
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

window.addEventListener('message', (event) => {
    const op = event.data
//    console.log(op, event)
    if (op.title) {
        var target_tab = 'chat-tab-' + op.tabId;
        var target_frame = 'chat-frame-' + op.tabId;
        m_target_tab = jQuery('#' + target_tab);
        m_target_frame = jQuery('#' + target_frame);
        if (m_target_tab) {
            m_target_tab.text(op.title);
            if (!m_target_frame.is(':visible') && op.title.startsWith('['))
                m_target_tab.addClass('mdui-color-theme-a100')
            else
                m_target_tab.removeClass('mdui-color-theme-a100');
        }
        else
            console.log('update title err', target_tab);
    }
    if (op.link) {
        var target_frame = 'chat-frame-' + op.tabId;
        m_target_frame = jQuery('#' + target_frame);
        m_target_frame.attr('src', op.link);
    }
});