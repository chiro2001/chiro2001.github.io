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
});

// 切换强调色
$$(document).on('change', 'input[name="doc-theme-accent"]', function () {
  setDocsTheme({
    accent: $$(this).val()
  });
});

// 切换主题色
$$(document).on('change', 'input[name="doc-theme-layout"]', function () {
  setDocsTheme({
    layout: $$(this).val()
  });
});

// 恢复默认主题
$$(document).on('cancel.mdui.dialog', '#dialog-docs-theme', function () {
  setDocsTheme({
    primary: DEFAULT_PRIMARY,
    accent: DEFAULT_ACCENT,
    layout: DEFAULT_LAYOUT
  });
});

function getTheme() {
  var theme = {};
  theme.accent = getCookieByArray('docs-theme-accent');
  theme.primary = getCookieByArray('docs-theme-primary');
  theme.layout = getCookieByArray('docs-theme-layout');
  setDocsTheme(theme);
}

getTheme();

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
		return confirm('请确认这是您希望跳转的链接: ' + linkHref);
	}

	return true;
}

var verifyNickname = function (nick) {
	return /^[a-zA-Z0-9_]{1,24}$/.test(nick);
}

var frontpage = [
	"![Henrize Chat](http://chat.henrize.kim:3000/imgs/HC_Banner.png)",
	"欢迎来到Henrize的聊天室，这是一个简洁轻小的聊天室网站。",
	"**继续访问本网站则代表您完全同意[《Henrize的聊天室服务协议》](http://chat.henrize.kim:3000/agreement.html)**。",
	"加入聊天室输入昵称即可进行聊天，还有[**更多功能**](http://chat.henrize.kim:3000/more.html)丰富聊天体验。",
	"这里有一些常用的聊天室，欢迎加入：",
	"闲聊休息室： ?lounge",
	"--------------------",
	"站长邮箱：mail@to.henrize.kim",
	"开源许可和制作人员：[版权页](http://chat.henrize.kim:3000/copyright.html)",
	"Hack.Chat & Henrize Chat Dev Team",
	"2020/02/27",
	"Have a nice chat!"
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

var soundSwitch = document.getElementById("sound-switch")
var notifySetting = localStorageGet("notify-sound")
//
// Update localStorage with value of checkbox
soundSwitch.addEventListener('change', (event) => {
	localStorageSet("notify-sound", soundSwitch.checked)
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
		console.error("您的浏览器不支持浏览器通知。");
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
				console.error("播放声音时出现故障：\n" + error);
			});
		}
	}
}

$('#clear-messages').click(function () {
  $('#chat-frame-' + tabNow).contents().find('#messages').html('');
})

// Restore settings from localStorage

if (localStorageGet('enter-send') == 'false') {
//  $('#enter-send').hide();
  $_('#enter-send').checked = false;
} else {
//  $('#enter-send').show();
  $_('#enter-send').checked = true;
}

if (localStorageGet('emote') == 'false') {
//  $('#emote').hide();
  $_('#emote').checked = false;
} else {
//  $('#emote').show();
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
}

document.querySelector('#enter-send').onchange = function (e) {
	localStorageSet('enter-send', !!e.target.checked);
}

document.querySelector('#emote').onchange = function (e) {
	localStorageSet('emote', !!e.target.checked);
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
}

if (localStorageGet('syntax-highlight') == 'false') {
	$_('#syntax-highlight').checked = false;
	markdownOptions.doHighlight = false;
}

$_('#syntax-highlight').onchange = function (e) {
	var enabled = !!e.target.checked;
	localStorageSet('syntax-highlight', enabled);
	markdownOptions.doHighlight = enabled;
}

if (localStorageGet('allow-imgur') == 'false') {
	$_('#allow-imgur').checked = false;
	allowImages = false;
}

$_('#allow-imgur').onchange = function (e) {
	var enabled = !!e.target.checked;
	localStorageSet('allow-imgur', enabled);
	allowImages = enabled;
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
}

if (localStorageGet('highlight')) {
	setHighlight(localStorageGet('highlight'));
}


$_('#highlight-selector').value = currentHighlight;
//
///* main */
//
//if (myChannel == '') {
//	pushMessage({ text: frontpage });
////	$('#footer').classList.add('hidden');
////	$('#sidebar').classList.add('hidden');
//    $$('#footer').hide();
//} else {
//	join(myChannel);
//}

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
imgToken = 'PP8y8OFkPv17aBTnsy1KAuQqqvAP48VW';
function uploadImage(f, token) {
    var form = new FormData();
    form.append('smfile', f);
    form.append('Authorization', token)

    return $.ajax({
        type: 'POST',
        url: 'https://sm.ms/api/v2/upload',
        data: form,
        cache: false,
        contentType: false,
        processData: false
    }).then(d => {
        var data = JSON.parse(d);
        console.log(data.message);
        if (data.success == true) {
            return data.data.url;
        } else {
            if (data.code == 'image_repeated') {
                return data.images;
            }
        }
        console.log(data);
        return;
    });
}

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
                m_target_tab.addClass('mdui-color-theme-accent')
            else
                m_target_tab.removeClass('mdui-color-theme-accent');
        }
        else
            console.log('update title err', target_tab);
    }
});
//————————————————
//版权声明：本文为CSDN博主「故事佛小妞」的原创文章，遵循 CC 4.0 BY-SA 版权协议，转载请附上原文出处链接及本声明。
//原文链接：https://blog.csdn.net/guishifoxin/java/article/details/90236085