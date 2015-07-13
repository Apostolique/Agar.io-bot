// ==UserScript==
// @name        AposLoader
// @namespace   AposLoader
// @description Loads bots without ever updating.
// @include     http://agar.io/
// @version     1
// @grant       none
// @author      http://www.twitch.tv/apostolique
// ==/UserScript==

var script1 = "https://github.com/Apostolique/Agar.io-bot/raw/master/launcher.user.js";
window.jQuery("head").append('<script type="text/javascript" src="' + script1 + '"></script>');
var script2 = "https://github.com/Apostolique/Agar.io-bot/raw/master/beta.user.js";
window.jQuery("head").append('<script type="text/javascript" src="' + script2 + '"></script>');
