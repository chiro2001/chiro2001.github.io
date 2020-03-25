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
var DEFAULT_PRIMARY = 'indigo';
var DEFAULT_ACCENT = 'pink';
var DEFAULT_LAYOUT = '';

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

getTheme()

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

function $(query) {
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

//var ws;
//var myNick = localStorageGet('my-nick') || '';
//var myChannel = window.location.search.replace(/^\?/, '');
//var lastSent = [""];
//var lastSentPos = 0;
//
///** Notification switch and local storage behavior **/
//var notifySwitch = document.getElementById("notify-switch")
//var notifySetting = localStorageGet("notify-api")
//var notifyPermissionExplained = 0; // 1 = granted msg shown, -1 = denied message shown

// Inital request for notifications permission
//function RequestNotifyPermission() {
//	try {
//		var notifyPromise = Notification.requestPermission();
//		if (notifyPromise) {
//			notifyPromise.then(function (result) {
//				console.log("Hack.Chat notification permission: " + result);
//				if (result === "granted") {
//					if (notifyPermissionExplained === 0) {
////						pushMessage({
////							cmd: "chat",
////							nick: "*",
////							text: "浏览器提示启动成功",
////							time: null
////						});
//                        alert('浏览器提示启动成功');
//						notifyPermissionExplained = 1;
//					}
//					return false;
//				} else {
//					if (notifyPermissionExplained === 0) {
////						pushMessage({
////							cmd: "chat",
////							nick: "*",
////							text: "浏览器提示启动被拒绝，请检查您的站点权限设置。",
////							time: null
////						});
//                        alert('浏览器提示启动被拒绝，请检查您的站点权限设置。');
//						notifyPermissionExplained = -1;
//					}
//					return true;
//				}
//			});
//		}
//	} catch (error) {
////		pushMessage({
////			cmd: "chat",
////			nick: "*",
////			text: "无法进行通知。",
////			time: null
////		});
//        alert('无法进行通知。');
//		console.error("在试图通知的时候出现错误，可能是您的浏览器不支持此操作。\nDetails:")
//		console.error(error)
//		return false;
//	}
//}

//// Update localStorage with value of checkbox
//notifySwitch.addEventListener('change', (event) => {
//	if (event.target.checked) {
//		RequestNotifyPermission();
//	}
//	localStorageSet("notify-api", notifySwitch.checked)
//})
//// Check if localStorage value is set, defaults to OFF
//if (notifySetting === null) {
//	localStorageSet("notify-api", "false")
//	notifySwitch.checked = false
//}
//// Configure notifySwitch checkbox element
//if (notifySetting === "true" || notifySetting === true) {
//	notifySwitch.checked = true
//} else if (notifySetting === "false" || notifySetting === false) {
//	notifySwitch.checked = false
//}
//
///** Sound switch and local storage behavior **/
var soundSwitch = document.getElementById("sound-switch")
var notifySetting = localStorageGet("notify-sound")
//
//// Update localStorage with value of checkbox
//soundSwitch.addEventListener('change', (event) => {
//	localStorageSet("notify-sound", soundSwitch.checked)
//})
//// Check if localStorage value is set, defaults to OFF
//if (notifySetting === null) {
//	localStorageSet("notify-sound", "false")
//	soundSwitch.checked = false
//}
//// Configure soundSwitch checkbox element
//if (notifySetting === "true" || notifySetting === true) {
//	soundSwitch.checked = true
//} else if (notifySetting === "false" || notifySetting === false) {
//	soundSwitch.checked = false
//}

// Create a new notification after checking if permission has been granted
//function spawnNotification(title, body) {
//	// Let's check if the browser supports notifications
//	if (!("Notification" in window)) {
//		console.error("您的浏览器不支持浏览器通知。");
//	} else if (Notification.permission === "granted") { // Check if notification permissions are already given
//		// If it's okay let's create a notification
//		var options = {
//			body: body,
//			icon: "/favicon-96x96.png"
//		};
//		var n = new Notification(title, options);
//	}
//	// Otherwise, we need to ask the user for permission
//	else if (Notification.permission !== "denied") {
//		if (RequestNotifyPermission()) {
//			var options = {
//				body: body,
//				icon: "/favicon-96x96.png"
//			};
//			var n = new Notification(title, options);
//		}
//	} else if (Notification.permission == "denied") {
//		// At last, if the user has denied notifications, and you
//		// want to be respectful, there is no need to bother them any more.
//	}
//}
//
//function notify(args) {
//	// Spawn notification if enabled
//	if (notifySwitch.checked) {
//		spawnNotification("?" + myChannel + "  —  " + args.nick, args.text)
//	}
//
//	// Play sound if enabled
//	if (soundSwitch.checked) {
//		var soundPromise = document.getElementById("notify-sound").play();
//		if (soundPromise) {
//			soundPromise.catch(function (error) {
//				console.error("播放声音时出现故障：\n" + error);
//			});
//		}
//	}
//}
//
//function joined(channel, port) {
//  ws = new WebSocket('ws://chat.henrize.kim:6060');
//  
//  var wasConnected = false;
//
//  ws.onopen = function () {
//      if (!wasConnected) {
//          if (location.hash) {
//              myNick = location.hash.substr(1);
//          } else {
//              myNick = prompt('请输入您的昵称：', myNick);
//          }
//      }
//
//      if (myNick) {
//          localStorageSet('my-nick', myNick);
//          send({ cmd: 'join', channel: channel, nick: myNick });
//      }
//
//      wasConnected = true;
//  }
//
//  ws.onclose = function () {
//      if (wasConnected) {
//          pushMessage({ nick: '!', text: "与服务器的连接已经断开，正在尝试重新连接……" });
//      }
//
//      window.setTimeout(function () {
//          join(channel);
//      }, 2000);
//  }
//
//  ws.onmessage = function (message) {
//      var args = JSON.parse(message.data);
//      var cmd = args.cmd;
//      var command = COMMANDS[cmd];
//      command.call(null, args);
//  }
//}
//
//function join(channel) {
//	if (document.domain == 'hack.chat') {
//		// For https://hack.chat/
//		ws = new WebSocket('wss://hack.chat/chat-ws');
//	} else {
//        joined(channel, undefined);
//	}
//}
//
//var COMMANDS = {
//	chat: function (args) {
//		if (ignoredUsers.indexOf(args.nick) >= 0) {
//			return;
//		}
//		pushMessage(args);
//	},
//
//	info: function (args) {
//		args.nick = '*';
//		pushMessage(args);
//	},
//
//	warn: function (args) {
//		args.nick = '!';
//		pushMessage(args);
//	},
//
//	onlineSet: function (args) {
//		var nicks = args.nicks;
//
//		usersClear();
//
//		nicks.forEach(function (nick) {
//			userAdd(nick);
//		});
//
//		pushMessage({ nick: '*', text: "欢迎加入聊天室！请保证您已经阅读并同意了[**服务协议**](http://chat.henrize.kim:3000/agreement.html)。\n如果您所在的聊天室没有在线的用户，可以尝试加入聊天室 ?lounge\n在线的用户: " + nicks.join(", ") })
//	},
//
//	onlineAdd: function (args) {
//		var nick = args.nick;
//
//		userAdd(nick);
//
//		if ($('#joined-left').checked) {
//			pushMessage({ nick: '*', text: nick + " 加入聊天室" });
//		}
//	},
//
//	onlineRemove: function (args) {
//		var nick = args.nick;
//
//		userRemove(nick);
//
//		if ($('#joined-left').checked) {
//			pushMessage({ nick: '*', text: nick + " 退出聊天室" });
//		}
//	}
//}
//
//function pushMessage(args) {
//	// Message container
//	var messageEl = document.createElement('div');
//
//	if (
//		typeof (myNick) === 'string' && (
//			args.text.match(new RegExp('@' + myNick.split('#')[0] + '\\b', "gi")) ||
//			((args.type === "whisper" || args.type === "invite") && args.from)
//		)
//	) {
//		notify(args);
//	}
//
//	messageEl.classList.add('message');
//
//	if (verifyNickname(myNick) && args.nick == myNick) {
//		messageEl.classList.add('me');
//	} else if (args.nick == '!') {
//		messageEl.classList.add('warn');
//	} else if (args.nick == '*') {
//		messageEl.classList.add('info');
//	} else if (args.admin) {
//		messageEl.classList.add('admin');
//	} else if (args.mod) {
//		messageEl.classList.add('mod');
//	}
//
//	// Nickname
//	var nickSpanEl = document.createElement('span');
//	nickSpanEl.classList.add('nick');
//	messageEl.appendChild(nickSpanEl);
//
//	if (args.trip) {
//		var tripEl = document.createElement('span');
//		tripEl.textContent = args.trip + " ";
//		tripEl.classList.add('trip');
//		nickSpanEl.appendChild(tripEl);
//	}
//
//	if (args.nick) {
//		var nickLinkEl = document.createElement('a');
//		nickLinkEl.textContent = args.nick;
//
//		nickLinkEl.onclick = function () {
//			insertAtCursor("@" + args.nick + " ");
//			$('#chatinput').focus();
//		}
//
//		var date = new Date(args.time || Date.now());
//		nickLinkEl.title = date.toLocaleString();
//		nickSpanEl.appendChild(nickLinkEl);
//	}
//
//	// Text
//	var textEl = document.createElement('p');
//	textEl.classList.add('text');
//	textEl.innerHTML = md.render(args.text);
//
//	messageEl.appendChild(textEl);
//
//	// Scroll to bottom
//	var atBottom = isAtBottom();
//	$('#messages').appendChild(messageEl);
//    //mdui.mutation($('#messages'))
//	if (atBottom) {
//		window.scrollTo(0, document.body.scrollHeight);
//	}
//
//	unread += 1;
//	updateTitle();
//  
//    // 修改一下主题
//    $$('.trip').attr('class', 'mdui-text-color-theme');
//}

//function insertAtCursor(text) {
//	var input = $('#chatinput');
//	var start = input.selectionStart || 0;
//	var before = input.value.substr(0, start);
//	var after = input.value.substr(start);
//
//	before += text;
//	input.value = before + after;
//	input.selectionStart = input.selectionEnd = before.length;
//
//	updateInputSize();
//}

//function send(data) {
//	if (ws && ws.readyState == ws.OPEN) {
//		ws.send(JSON.stringify(data));
//	}
//}

//var windowActive = true;
//var unread = 0;

//window.onfocus = function () {
//	windowActive = true;
//
//	updateTitle();
//}
//
//window.onblur = function () {
//	windowActive = false;
//}
//
//window.onscroll = function () {
//	if (isAtBottom()) {
//		updateTitle();
//	}
//}
//
//function isAtBottom() {
//	return (window.innerHeight + window.scrollY) >= (document.body.scrollHeight - 1);
//}

//function updateTitle() {
//	if (windowActive && isAtBottom()) {
//		unread = 0;
//	}
//
//	var title;
//	if (myChannel) {
//		title = myChannel + " - Henrize聊天室";
//	} else {
//		title = "Henrize聊天网站";
//	}
//
//	if (unread > 0) {
//		title = '[' + unread + '] ' + title;
//	}
//
//	document.title = title;
//}

//$('#footer').onclick = function () {
//	$('#chatinput').focus();
//}

//$('#chatinput').onkeydown = function (e) {
//	if (e.keyCode == 13 /* ENTER */ && !e.shiftKey) {
//		e.preventDefault();
//
//		// Submit message
//		if (e.target.value != '') {
//			var text = e.target.value;
//			e.target.value = '';
//
//			send({ cmd: 'chat', text: text });
//
//			lastSent[0] = text;
//			lastSent.unshift("");
//			lastSentPos = 0;
//
//			updateInputSize();
//		}
//	} else if (e.keyCode == 38 /* UP */) {
//		// Restore previous sent messages
//		if (e.target.selectionStart === 0 && lastSentPos < lastSent.length - 1) {
//			e.preventDefault();
//
//			if (lastSentPos == 0) {
//				lastSent[0] = e.target.value;
//			}
//
//			lastSentPos += 1;
//			e.target.value = lastSent[lastSentPos];
//			e.target.selectionStart = e.target.selectionEnd = e.target.value.length;
//
//			updateInputSize();
//		}
//	} else if (e.keyCode == 40 /* DOWN */) {
//		if (e.target.selectionStart === e.target.value.length && lastSentPos > 0) {
//			e.preventDefault();
//
//			lastSentPos -= 1;
//			e.target.value = lastSent[lastSentPos];
//			e.target.selectionStart = e.target.selectionEnd = 0;
//
//			updateInputSize();
//		}
//	} else if (e.keyCode == 27 /* ESC */) {
//		e.preventDefault();
//
//		// Clear input field
//		e.target.value = "";
//		lastSentPos = 0;
//		lastSent[lastSentPos] = "";
//
//		updateInputSize();
//	} else if (e.keyCode == 9 /* TAB */) {
//		// Tab complete nicknames starting with @
//
//		if (e.ctrlKey) {
//			// Skip autocompletion and tab insertion if user is pressing ctrl
//			// ctrl-tab is used by browsers to cycle through tabs
//			return;
//		}
//		e.preventDefault();
//
//		var pos = e.target.selectionStart || 0;
//		var text = e.target.value;
//		var index = text.lastIndexOf('@', pos);
//
//		var autocompletedNick = false;
//
//		if (index >= 0) {
//			var stub = text.substring(index + 1, pos).toLowerCase();
//			// Search for nick beginning with stub
//			var nicks = onlineUsers.filter(function (nick) {
//				return nick.toLowerCase().indexOf(stub) == 0
//			});
//
//			if (nicks.length > 0) {
//				autocompletedNick = true;
//				if (nicks.length == 1) {
//					insertAtCursor(nicks[0].substr(stub.length) + " ");
//				}
//			}
//		}
//
//		// Since we did not insert a nick, we insert a tab character
//		if (!autocompletedNick) {
//			insertAtCursor('\t');
//		}
//	}
//}

//function updateInputSize() {
//	var atBottom = isAtBottom();
//
//	var input = $('#chatinput');
//	input.style.height = 0;
//	input.style.height = input.scrollHeight + 'px';
//	document.body.style.marginBottom = $('#footer').offsetHeight + 'px';
//
//	if (atBottom) {
//		window.scrollTo(0, document.body.scrollHeight);
//	}
//}
//
//$('#chatinput').oninput = function () {
//	updateInputSize();
//}
//
//updateInputSize();

/* sidebar */

//$('#sidebar').onmouseenter = $('#sidebar').ontouchstart = function (e) {
//	$('#sidebar-content').classList.remove('hidden');
//	$('#sidebar').classList.add('expand');
//	e.stopPropagation();
//}
//
//$('#sidebar').onmouseleave = document.ontouchstart = function (event) {
//	var e = event.toElement || event.relatedTarget;
//	try {
//		if (e.parentNode == this || e == this) {
//	     return;
//	  }
//	} catch (e) { return; }
//
//	if (!$('#pin-sidebar').checked) {
//		$('#sidebar-content').classList.add('hidden');
//		$('#sidebar').classList.remove('expand');
//	}
//}

//$('#clear-messages').onclick = function () {
//	// Delete children elements
//	var messages = $('#messages');
//	messages.innerHTML = '';
//}
//

// Restore settings from localStorage

if (localStorageGet('pin-sidebar') == 'true') {
	$('#pin-sidebar').checked = true;
}

if (localStorageGet('joined-left') == 'false') {
	$('#joined-left').checked = false;
}

if (localStorageGet('parse-latex') == 'false') {
	$('#parse-latex').checked = false;
	md.inline.ruler.disable([ 'katex' ]);
	md.block.ruler.disable([ 'katex' ]);
}

$('#joined-left').onchange = function (e) {
	localStorageSet('joined-left', !!e.target.checked);
}

$('#parse-latex').onchange = function (e) {
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
	$('#syntax-highlight').checked = false;
	markdownOptions.doHighlight = false;
}

$('#syntax-highlight').onchange = function (e) {
	var enabled = !!e.target.checked;
	localStorageSet('syntax-highlight', enabled);
	markdownOptions.doHighlight = enabled;
}

if (localStorageGet('allow-imgur') == 'false') {
	$('#allow-imgur').checked = false;
	allowImages = false;
}

$('#allow-imgur').onchange = function (e) {
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
//
//function setScheme(scheme) {
//	currentScheme = scheme;
//	$('#scheme-link').href = "schemes/" + scheme + ".css";
//	localStorageSet('scheme', scheme);
//}
//
function setHighlight(scheme) {
	currentHighlight = scheme;
	$('#highlight-link').href = "http://chat.henrize.kim:3000/vendor/hljs/styles/" + scheme + ".min.css";
	localStorageSet('highlight', scheme);
}
//
//// Add scheme options to dropdown selector
//schemes.forEach(function (scheme) {
//	var option = document.createElement('option');
//	option.textContent = scheme;
//	option.value = scheme;
//	$('#scheme-selector').appendChild(option);
//});
//
highlights.forEach(function (scheme) {
	var option = document.createElement('option');
	option.textContent = scheme;
	option.value = scheme;
	$('#highlight-selector').appendChild(option);
});

//$('#scheme-selector').onchange = function (e) {
//	setScheme(e.target.value);
//}
//
$('#highlight-selector').onchange = function (e) {
	setHighlight(e.target.value);
}

//// Load sidebar configaration values from local storage if available
//if (localStorageGet('scheme')) {
//	setScheme(localStorageGet('scheme'));
//}
//
if (localStorageGet('highlight')) {
	setHighlight(localStorageGet('highlight'));
}

//$('#scheme-selector').value = currentScheme;
$('#highlight-selector').value = currentHighlight;
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
