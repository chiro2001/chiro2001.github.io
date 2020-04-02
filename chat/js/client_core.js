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
  var $body = $$('body');

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

//getTheme();

xiaoice = 'XiaoIce';

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
	linkTarget: '_parent" rel="noreferrer',
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
    'bed-1254016670.cos.ap-guangzhou.myqcloud.com'
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
//			return whiteSpace + '<a href="' + channelLink + '" target="_blank">' + channelLink + '</a>';
            return whiteSpace + '<a rel="noreferrer" onclick="return verifyLink(this)" href="' + channelLink + '">' + channelLink + '</a>';
		});
	}

  return tokens[idx].content;
};

md.use(remarkableKatex);

function verifyLink(link) {
	var linkHref = Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(link.href));
	if (linkHref !== link.innerHTML) {
//		return confirm('请确认这是您希望跳转的链接: ' + linkHref);
//        self.window.location.href = linkHref;
        window.parent.postMessage({ link: linkHref, tabId: tabId }, '*');
        return false;
	}

	return false;
}

var verifyNickname = function (nick) {
	return /^[a-zA-Z0-9_]{1,24}$/.test(nick);
}

var frontpage = [
	"![Henrize Chat](http://chat.henrize.kim:3000/imgs/HC_Banner.png)",
	"欢迎来到Henrize的聊天室，这是一个简洁轻小的聊天室网站。",
	"**继续访问本网站则代表您完全同意[《Henrize的聊天室服务协议》](http://chat.henrize.kim:3000/agreement.html)**。",
	"加入聊天室输入昵称即可进行聊天，还有[**更多功能**](http://chat.henrize.kim:3000/more.html)丰富聊天体验。",
	"想找一些人来聊天？欢迎加入[**公共聊天室**](?lounge)。",
	"--------------------",
	"[第三方程序](http://chat.henrize.kim:3000/third-party.html) [版权页](http://chat.henrize.kim:3000/copyright.html) [站长邮箱](mailto://mail@to.henrize.kim)",
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

var ws;
var myNick = localStorageGet('my-nick') || '';
var myChannel = window.location.search.replace(/^\?/, '');
tabId = 0;
if (myChannel.indexOf('&') != -1) {
    var tail = myChannel.slice(myChannel.indexOf('&')+1, myChannel.length);
    //debugger;
    if (tail.startsWith('tabId=')) {
        tabId = tail.slice(6, tail.length);
    }
    myChannel = myChannel.slice(0, myChannel.indexOf('&'));
}
var lastSent = [""];
var lastSentPos = 0;

/** Notification switch and local storage behavior **/
var notifySwitch = document.getElementById("notify-switch")
var notifySetting = localStorageGet("notify-api")
var notifyPermissionExplained = 0; // 1 = granted msg shown, -1 = denied message shown

// Inital request for notifications permission
function RequestNotifyPermission() {
	try {
		var notifyPromise = Notification.requestPermission();
		if (notifyPromise) {
			notifyPromise.then(function (result) {
				console.log("Hack.Chat notification permission: " + result);
				if (result === "granted") {
					if (notifyPermissionExplained === 0) {
						pushMessage({
							cmd: "chat",
							nick: "*",
							text: "浏览器提示启动成功",
							time: null
						});
						notifyPermissionExplained = 1;
					}
					return false;
				} else {
					if (notifyPermissionExplained === 0) {
						pushMessage({
							cmd: "chat",
							nick: "*",
							text: "浏览器提示启动被拒绝，请检查您的站点权限设置。",
							time: null
						});
						notifyPermissionExplained = -1;
					}
					return true;
				}
			});
		}
	} catch (error) {
		pushMessage({
			cmd: "chat",
			nick: "*",
			text: "无法进行通知。",
			time: null
		});
		console.error("在试图通知的时候出现错误，可能是您的浏览器不支持此操作。\nDetails:")
		console.error(error)
		return false;
	}
}

// Update localStorage with value of checkbox
notifySwitch.addEventListener('change', (event) => {
	if (event.target.checked) {
		RequestNotifyPermission();
	}
	localStorageSet("notify-api", notifySwitch.checked)
})
// Check if localStorage value is set, defaults to OFF
if (notifySetting === null) {
	localStorageSet("notify-api", "false")
	notifySwitch.checked = false
}
// Configure notifySwitch checkbox element
if (notifySetting === "true" || notifySetting === true) {
	notifySwitch.checked = true
} else if (notifySetting === "false" || notifySetting === false) {
	notifySwitch.checked = false
}

/** Sound switch and local storage behavior **/
var soundSwitch = document.getElementById("sound-switch")
var notifySetting = localStorageGet("notify-sound")

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

function nicked(nick) {
    if (!nick)
        myNick = $('#chat-nick').val();
    else
        myNick = nick;
    if (dialogNick)
        dialogNick.close();
    if (myNick) {
        localStorageSet('my-nick', myNick);
        send({ cmd: 'join', channel: _channel, nick: myNick });
    }
    wasConnected = true;
}

var browser = {
    versions: function () {
        var u = navigator.userAgent, app = navigator.appVersion;
        return {         //移动终端浏览器版本信息
            trident: u.indexOf('Trident') > -1, //IE内核
            presto: u.indexOf('Presto') > -1, //opera内核
            webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
            gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
            mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
            android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或uc浏览器
            iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
            iPad: u.indexOf('iPad') > -1, //是否iPad
            webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
        };
    }(),
    language: (navigator.browserLanguage || navigator.language).toLowerCase()
}
//————————————————
//版权声明：本文为CSDN博主「niesiyuan000」的原创文章，遵循 CC 4.0 BY-SA 版权协议，转载请附上原文出处链接及本声明。
//原文链接：https://blog.csdn.net/niesiyuan000/java/article/details/80010414

function joined(channel, port) {
    ws = new WebSocket('ws://chat.henrize.kim:6060');

    var wasConnected = false;

    ws.onopen = function () {
        _channel = channel;
        dialogNick = new mdui.Dialog('#chat-dialog-nick', {
            history: false
        });
        if (!wasConnected) {
            if (location.hash) {
                myNick = location.hash.substr(1);
            } else {
                if (localStorageGet('my-nick')) {
                  $('#chat-nick').val(localStorageGet('my-nick'));
                    $('#chat-nick').bind('keydown',function(event){
                    if(event.keyCode == "13")    
                        nicked();
                    });
                }
                dialogNick.open();
//                if (browser.versions.mobile) {//判断是否是移动设备打开。browser代码在下面
//                    if (localStorageGet('my-nick')) {
//                      $('#chat-nick').val(localStorageGet('my-nick'));
//                        $('#chat-nick').bind('keydown',function(event){
//                        if(event.keyCode == "13")    
//                            nicked();
//                        });
//                    }
//                    dialogNick.open();
//                }else{
//                    //否则就是PC浏览器打开
//                    myNick = prompt('请输入您的昵称：', myNick);
//                    nicked(myNick);
//                }

          }
        }
    }

    ws.onclose = function () {
      if (wasConnected) {
          pushMessage({ nick: '!', text: "与服务器的连接已经断开，正在尝试重新连接……" });
      }

      window.setTimeout(function () {
          join(channel);
      }, 2000);
    }

    ws.onmessage = function (message) {
      var args = JSON.parse(message.data);
      var cmd = args.cmd;
      var command = COMMANDS[cmd];
      command.call(null, args);
    }
}

function join(channel) {
	if (document.domain == 'hack.chat') {
		// For https://hack.chat/
		ws = new WebSocket('wss://hack.chat/chat-ws');
	} else {
        joined(channel, undefined);
	}
}

var COMMANDS = {
	chat: function (args) {
		if (ignoredUsers.indexOf(args.nick) >= 0) {
			return;
		}
        if (args.nick == myNick) {
            unread = 0;
            updateTitle();
        }
		pushMessage(args);
	},

	info: function (args) {
		args.nick = '*';
		pushMessage(args);
	},

	warn: function (args) {
		args.nick = '!';
		pushMessage(args);
	},

	onlineSet: function (args) {
		var nicks = args.nicks;

		usersClear();

		nicks.forEach(function (nick) {
			userAdd(nick);
		});

		pushMessage({ nick: '*', text: "欢迎加入聊天室！请保证您已经阅读并同意了[**服务协议**](http://chat.henrize.kim:3000/agreement.html)。\n如果您所在的聊天室没有在线的用户，可以尝试加入聊天室 ?lounge\n在线的用户: " + nicks.join(", ") })
	},

	onlineAdd: function (args) {
		var nick = args.nick;

		userAdd(nick);

		if ($('#joined-left').is(":checked")) {
			pushMessage({ nick: '*', text: nick + " 加入聊天室" });
		}
	},

	onlineRemove: function (args) {
		var nick = args.nick;

		userRemove(nick);

		if ($('#joined-left').is(":checked")) {
			pushMessage({ nick: '*', text: nick + " 退出聊天室" });
		}
	}
}

function pushMessage(args) {
	// Message container
	var messageEl = document.createElement('div');

	if (
		typeof (myNick) === 'string' && (
			args.text.match(new RegExp('@' + myNick.split('#')[0] + '\\b', "gi")) ||
			((args.type === "whisper" || args.type === "invite") && args.from)
		)
	) {
		notify(args);
	}

	messageEl.classList.add('message');

	if (verifyNickname(myNick) && args.nick == myNick) {
		messageEl.classList.add('me');
	} else if (args.nick == '!') {
		messageEl.classList.add('warn');
	} else if (args.nick == '*') {
		messageEl.classList.add('info');
	} else if (args.admin) {
		messageEl.classList.add('admin');
	} else if (args.mod) {
		messageEl.classList.add('mod');
	}

	// Nickname
	var nickSpanEl = document.createElement('span');
	nickSpanEl.classList.add('nick');
	messageEl.append(nickSpanEl);

	if (args.nick) {
		var nickLinkEl = document.createElement('a');
		nickLinkEl.textContent = args.nick;

		nickLinkEl.onclick = function () {
			insertAtCursor("@" + args.nick + " ");
			$('#chatinput').focus();
		}

		var date = new Date(args.time || Date.now());
		nickLinkEl.title = date.toLocaleString();
		nickSpanEl.append(nickLinkEl);
	}
    
    if (args.trip) {
		var tripEl = document.createElement('span');
		tripEl.textContent = ' ' + args.trip;
		tripEl.classList.add('trip');
		nickSpanEl.append(tripEl);
	}

	// Text
	var textEl = document.createElement('p');
	textEl.classList.add('text');
	textEl.innerHTML = md.render(args.text);

	messageEl.append(textEl);

	// Scroll to bottom
	var atBottom = isAtBottom();
	$('#messages').append(messageEl);
    //mdui.mutation($('#messages'))
	if (atBottom) {
		window.scrollTo(0, document.body.scrollHeight);
	}

    if (args.nick != myNick && !$('#chatinput').is(":focus"))
	   unread += 1;
	updateTitle();
  
    // 修改一下主题
    $$('.trip').attr('class', 'mdui-text-color-grey');
}

function insertAtCursor(text) {
	var input = document.querySelector('#chatinput');
	var start = input.selectionStart || 0;
	var before = input.value.substr(0, start);
	var after = input.value.substr(start);

	before += text;
	input.value = before + after;
	input.selectionStart = input.selectionEnd = before.length;

	updateInputSize();
}

function send(data) {
	if (ws && ws.readyState == ws.OPEN) {
		ws.send(JSON.stringify(data));
	}
}

var windowActive = false;
var unread = 0;

function myOnFocus() {
//    windowActive = true;
	updateTitle();
}

function myOnBlur() {
//    windowActive = false;
	updateTitle();
}

window.onfocus = myOnFocus;
window.onblur = myOnBlur;

//document.contentWindow.addEventListener("focus",myOnFocus,false);
//document.contentWindow.addEventListener("blur",myOnBlur,false);

window.onscroll = function () {
	if (isAtBottom()) {
		updateTitle();
	}
}

function isAtBottom() {
	return (window.innerHeight + window.scrollY) >= (document.body.scrollHeight - 1);
}

function updateTitle() {
	if (windowActive && isAtBottom()) {
		unread = 0;
	}

	var title;
	if (myChannel) {
		title = myChannel;
	} else {
		title = "main";
	}

	if (unread > 0) {
		title = '[' + unread + '] ' + title;
	}

	document.title = title;
    // 通知父窗口改变
    window.parent.postMessage({ title: title, tabId: tabId }, '*');
}

$('#footer').onclick = function () {
	$('#chatinput').focus();
    window.scrollTo(0, document.body.scrollHeight);
}

function foo(data) {
//    data = JSON.parse(d);
    if (data['code'] != 0) {
        msg = '@' + xiaoice + '出现故障:' + data['other'];
//        console.log('tosend:', msg);
        send({ cmd: 'chat', text: msg });
    }
    msg = '@' + xiaoice + '说:' + $(data['data']).text();
//    console.log('tosend:', msg);
    send({ cmd: 'chat', text: msg });
}

function callXiaoice(text) {
    text.replace(new RegExp('@' + xiaoice,'g'),"b");
    $.ajax({
        url: 'http://wenku8.herokuapp.com/chat/' + text + '?callback=foo',
        dataType :'JSONP',
        jsonp: "foo",
        jsonpCallback:"foo",
        contentType: "application/json;charset=utf-8",
        success: function (d) {
            //console.info(d);
        }
    })
}

function submitMessage(text) {
  // Submit message
  if (text != '') {
      $('#chatinput').val('');
      //这里加上一点处理
      send({ cmd: 'chat', text: text });
      if (text.indexOf('@' + xiaoice) != -1) {
          callXiaoice(text);
      }
      lastSent[0] = text;
      lastSent.unshift("");
      lastSentPos = 0;
      updateInputSize();
  }
}

$('#chatinput').keydown(function (e) {
	if ((e.keyCode == 13 /* ENTER */ && !e.shiftKey && !enterSend) || 
        (enterSend && (e.keyCode == 13 && e.ctrlKey))) {
		e.preventDefault();
        submitMessage(e.target.value);
		
	} else if (e.keyCode == 38 /* UP */) {
		// Restore previous sent messages
		if (e.target.selectionStart === 0 && lastSentPos < lastSent.length - 1) {
			e.preventDefault();

			if (lastSentPos == 0) {
				lastSent[0] = e.target.value;
			}

			lastSentPos += 1;
			e.target.value = lastSent[lastSentPos];
			e.target.selectionStart = e.target.selectionEnd = e.target.value.length;

			updateInputSize();
		}
	} else if (e.keyCode == 40 /* DOWN */) {
		if (e.target.selectionStart === e.target.value.length && lastSentPos > 0) {
			e.preventDefault();

			lastSentPos -= 1;
			e.target.value = lastSent[lastSentPos];
			e.target.selectionStart = e.target.selectionEnd = 0;

			updateInputSize();
		}
	} else if (e.keyCode == 27 /* ESC */) {
		e.preventDefault();

		// Clear input field
		e.target.value = "";
		lastSentPos = 0;
		lastSent[lastSentPos] = "";

		updateInputSize();
	} else if (e.keyCode == 9 /* TAB */) {
		// Tab complete nicknames starting with @

		if (e.ctrlKey) {
			// Skip autocompletion and tab insertion if user is pressing ctrl
			// ctrl-tab is used by browsers to cycle through tabs
			return;
		}
		e.preventDefault();

		var pos = e.target.selectionStart || 0;
		var text = e.target.value;
		var index = text.lastIndexOf('@', pos);

		var autocompletedNick = false;

		if (index >= 0) {
			var stub = text.substring(index + 1, pos).toLowerCase();
			// Search for nick beginning with stub
			var nicks = onlineUsers.filter(function (nick) {
				return nick.toLowerCase().indexOf(stub) == 0
			});

			if (nicks.length > 0) {
				autocompletedNick = true;
				if (nicks.length == 1) {
					insertAtCursor(nicks[0].substr(stub.length) + " ");
				}
			}
		}

		// Since we did not insert a nick, we insert a tab character
		if (!autocompletedNick) {
			insertAtCursor('\t');
		}
	}
});

function updateInputSize() {
	var atBottom = isAtBottom();

	var input = document.querySelector('#chatinput');
    input.style.height = 0;
	input.style.height = input.scrollHeight + 'px';
	document.body.style.marginBottom = document.querySelector('#footer').offsetHeight + 'px';

	if (atBottom) {
		window.scrollTo(0, document.body.scrollHeight);
	}
}

document.querySelector('#chatinput').onfocus = function () {
    unread = 0;
    updateTitle();
}

document.querySelector('#chatinput').oninput = function () {
    unread = 0;
    updateTitle();
	updateInputSize();
}

updateInputSize();

// User list
var onlineUsers = [];
var ignoredUsers = [];

function userAdd(nick) {
	var user = document.createElement('a');
	user.textContent = nick;

	user.onclick = function (e) {
		userInvite(nick)
	}

	var userLi = document.createElement('li');
	userLi.append(user);
	$('#users').append(userLi);
	onlineUsers.push(nick);
    mdui.mutation();
}

function userRemove(nick) {
	var users = document.querySelector('#users');
	var children = users.children;

	for (var i = 0; i < children.length; i++) {
		var user = children[i];
		if (user.textContent == nick) {
			users.removeChild(user);
		}
	}

	var index = onlineUsers.indexOf(nick);
	if (index >= 0) {
		onlineUsers.splice(index, 1);
	}
}

function usersClear() {
	var users = document.querySelector('#users');

	while (users.firstChild) {
		users.removeChild(users.firstChild);
	}

	onlineUsers.length = 0;
}

function userInvite(nick) {
	send({ cmd: 'invite', nick: nick });
}

function userIgnore(nick) {
	ignoredUsers.push(nick);
}

function updateConfig() {
    if (localStorageGet('joined-left') == 'false') {
        $_('#joined-left').checked = false;
    }

    if (localStorageGet('parse-latex') == 'false') {
        $_('#parse-latex').checked = false;
        md.inline.ruler.disable([ 'katex' ]);
        md.block.ruler.disable([ 'katex' ]);
    }

    if (localStorageGet('syntax-highlight') == 'false') {
        $('#syntax-highlight').attr('checked', false);
        markdownOptions.doHighlight = false;
    }

    $_('#syntax-highlight').onchange = function (e) {
        var enabled = !!e.target.checked;
        localStorageSet('syntax-highlight', enabled);
        markdownOptions.doHighlight = enabled;
    }

    if (localStorageGet('allow-imgur') == 'false') {
        $('#allow-imgur').attr('checked', false);
        allowImages = false;
    }

    $_('#allow-imgur').onchange = function (e) {
        var enabled = !!e.target.checked;
        localStorageSet('allow-imgur', enabled);
        allowImages = enabled;
    }


    /* color scheme switcher */

    var schemes = [
        '安卓黑',
        '默认黑',
        '夜空黑',
        '终端黑',
        '初恋粉',
        '安卓白',
        '粉笔白',
        '石灰白',
        '寒夜蓝',
        '口罩蓝',
        '流行蓝',
        '天依蓝',
        '油漆蓝',
        '荒漠黄',
        '代码灰',
        '球场绿',
        '荧光绿',
        '芬达橙',
        '匿名版'
    ];

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

    var currentScheme = 'atelier-dune';
    var currentHighlight = 'darcula';

    function setScheme(scheme) {
        currentScheme = scheme;
        document.querySelector('#scheme-link').href = "schemes/" + scheme + ".css";
        localStorageSet('scheme', scheme);
    }

    function setHighlight(scheme) {
        currentHighlight = scheme;
        document.querySelector('#highlight-link').href = "vendor/hljs/styles/" + scheme + ".min.css";
        localStorageSet('highlight', scheme);
    }

    // Add scheme options to dropdown selector
    schemes.forEach(function (scheme) {
        var option = document.createElement('option');
        option.textContent = scheme;
        option.value = scheme;
        document.querySelector('#scheme-selector').append(option);
    });

    highlights.forEach(function (scheme) {
        var option = document.createElement('option');
        option.textContent = scheme;
        option.value = scheme;
        $('#highlight-selector').append(option);
    });

    document.querySelector('#scheme-selector').onchange = function (e) {
        setScheme(e.target.value);
    }

    document.querySelector('#highlight-selector').onchange = function (e) {
        setHighlight(e.target.value);
    }

    // Load sidebar configaration values from local storage if available
    if (localStorageGet('scheme')) {
        setScheme(localStorageGet('scheme'));
    }

    if (localStorageGet('highlight')) {
        setHighlight(localStorageGet('highlight'));
    }

    document.querySelector('#scheme-selector').value = currentScheme;
    document.querySelector('#highlight-selector').value = currentHighlight;

    if (!localStorageGet('enter-send')) {
      // 默认打钩
      localStorageSet('enter-send', true);
    }
    if (!localStorageGet('emote')) {
      // 默认打钩
      localStorageSet('emote', true);
    }

    enterSend = false;
    if (localStorageGet('enter-send') == 'false') {
      $('#enter-send').hide();
    } else {
      $('#enter-send').show();
      enterSend = true;
    }

    if (localStorageGet('emote') == 'false') {
      $('#emote').hide();
      $('.mdui-select').hide();
//      $('#emote').remove();
    } else {
//      $('#emote').show();
      $('.mdui-select').show();
      $('#emote').hide();
    }
    getTheme();
}

/* main */
updateConfig();

if (myChannel == '') {
	pushMessage({ text: frontpage });
    $('#footer').hide();
} else {
	join(myChannel);
}

function downloadFile(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    } else {
        pom.click();
    }
}

function downloadMessages() {
    var messages = $('#messages');
    var text = '';
    for (var i=0; i<messages.children().length; i++) {
        var child = $(messages.children()[i]);
        text = text + $('.nick', child).text() + '\r\n' + $('.text', child).text() + '' + '\r\n\r\n';
    }
//    var text = messages.text();
    downloadFile('' + myNick + ' in ' + myChannel + ' - ' + new Date() + '.txt', text);
//    console.log(text);
}