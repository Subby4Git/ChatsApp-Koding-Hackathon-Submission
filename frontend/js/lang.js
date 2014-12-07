/**
 * This is was edited by me. It was originally produced by:
 * 
 * @author Anatoly Mironov (mirontoli)
 * 
 * http://sharepointkunskap.wordpress.com
 * http://www.bool.se
 *  
 * http://stackoverflow.com/questions/3605495/generate-a-list-of-localized-language-names-with-links-to-google-translate/14800384#14800384
 * http://stackoverflow.com/questions/10997128/language-name-from-iso-639-1-code-in-javascript/14800499#14800499
 * 
 * using Phil Teare's answer on stackoverflow
 * http://stackoverflow.com/questions/3217492/list-of-language-codes-in-yaml-or-json/4900304#4900304
 * Just for testing only. Incorporate in your own javascript namespace
 * Example: getLanguageName("cv-RU") --> Chuvash
 */
 
 
    var select_lang = $('#select_language');

    
	var isoLangs = {
	    "sq":{
	        "shortName" : "sq",
			"name":"Albanian",
			"nativeName":"Shqip"
		},
	
		"ar":{
		    "shortName" : "ar",
			"name":"Arabic",
			"nativeName":"Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©"
		},
	
		"hy":{
		     "shortName" : "hy",
			"name":"Armenian",
			"nativeName":"Õ€Õ¡ÕµÕ¥Ö€Õ¥Õ¶"
		},
	
		"az":{
		    "shortName": "az",
			"name":"Azerbaijani",
			"nativeName":"azÉ™rbaycan dili"
		},
		
	
		"be":{
		    "shortName": "be",
			"name":"Belarusian",
			"nativeName":"Ð‘ÐµÐ»Ð°Ñ€ÑƒÑÐºÐ°Ñ"
		},

		"bs":{
		    "shortName": "bs",
			"name":"Bosnian",
			"nativeName":"bosanski jezik"
		},

		"bg":{
		    "shortName": "bg",
			"name":"Bulgarian",
			"nativeName":"Ð±ÑŠÐ»Ð³Ð°Ñ€ÑÐºÐ¸ ÐµÐ·Ð¸Ðº"
		},


		"ca":{
		    "shortName": "ca",
			"name":"Catalan",
			"nativeName":"CatalÃ "
		},


		"zh":{
		    "shortName": "zh",
			"name":"Chinese",
			"nativeName":"ä¸­æ–‡ (ZhÅngwÃ©n), æ±‰è¯­, æ¼¢èªž"
		},
	
		"hr":{
		    "shortName": "hr",
			"name":"Croatian",
			"nativeName":"hrvatski"
		},
		"cs":{
		    "shortName": "cs",
			"name":"Czech",
			"nativeName":"Äesky, ÄeÅ¡tina"
		},
		
		
		"da":{
		    "shortName": "da",
			"name":"Danish",
			"nativeName":"dansk"
		},

		"nl":{
		    "shortName": "nl",
			"name":"Dutch",
			"nativeName":"Nederlands, Vlaams"
		},
		"en":{
		    "shortName": "en",
			"name":"English (Default)",
			"nativeName":"English"
		},

		"et":{
		    "shortName": "et",
			"name":"Estonian",
			"nativeName":"eesti, eesti keel"
		},

		"fi":{
		    "shortName": "fi",
			"name":"Finnish",
			"nativeName":"suomi, suomen kieli"
		},
		"fr":{
		    "shortName": "fr",
			"name":"French",
			"nativeName":"franÃ§ais, langue franÃ§aise"
		},
		
	
		"ka":{
		    "shortName": "ka",
			"name":"Georgian",
			"nativeName":"áƒ¥áƒáƒ áƒ—áƒ£áƒšáƒ˜"
		},
		"de":{
		    "shortName": "de",
			"name":"German",
			"nativeName":"Deutsch"
		},
		"el":{
		    "shortName": "el",
			"name":"Greek, Modern",
			"nativeName":"Î•Î»Î»Î·Î½Î¹ÎºÎ¬"
		},
	
	
		"he":{
		    "shortName": "he",
			"name":"Hebrew (modern)",
			"nativeName":"×¢×‘×¨×™×ª"
		},
	
		"hu":{
		    "shortName": "hu",
			"name":"Hungarian",
			"nativeName":"Magyar"
		},
		
		
		
		"id":{
		    "shortName": "id",
			"name":"Indonesian",
			"nativeName":"Bahasa Indonesia"
		},
	
		"is":{
		    "shortName": "id",
			"name":"Icelandic",
			"nativeName":"Ãslenska"
		},
		"it":{
		    "shortName": "it",
			"name":"Italian",
			"nativeName":"Italiano"
		},
		
		
	
	
		"lt":{
		    "shortName": "lt",
			"name":"Lithuanian",
			"nativeName":"lietuviÅ³ kalba"
		},
	
		"lv":{
		    "shortName": "lv",
			"name":"Latvian",
			"nativeName":"latvieÅ¡u valoda"
		},
		
		
	
		"mk":{
		    "shortName": "mk",
			"name":"Macedonian",
			"nativeName":"Ð¼Ð°ÐºÐµÐ´Ð¾Ð½ÑÐºÐ¸ Ñ˜Ð°Ð·Ð¸Ðº"
		},
	
		"ms":{
		    "shortName": "ms",
			"name":"Malay",
			"nativeName":"bahasa Melayu, Ø¨Ù‡Ø§Ø³ Ù…Ù„Ø§ÙŠÙˆâ€Ž"
		},
	
		"mt":{
		    "shortName": "mt",
			"name":"Maltese",
			"nativeName":"Malti"
		},
		
		"no":{
		    "shortName": "no",
			"name":"Norwegian",
			"nativeName":"Norsk"
		},
	
		"pl":{
		    "shortName": "pl",
			"name":"Polish",
			"nativeName":"polski"
		},
		
		"pt":{
		    "shortName": "pt",
			"name":"Portuguese",
			"nativeName":"PortuguÃªs"
		},
	
		"ro":{
		    "shortName": "ro",
			"name":"Romanian",
			"nativeName":"romÃ¢nÄƒ"
		},
		"ru":{
		    "shortName": "ru",
			"name":"Russian",
			"nativeName":"Ñ€ÑƒÑÑÐºÐ¸Ð¹ ÑÐ·Ñ‹Ðº"
		},
		
		
	
		"sr":{
		    "shortName": "sr",
			"name":"Serbian",
			"nativeName":"ÑÑ€Ð¿ÑÐºÐ¸ Ñ˜ÐµÐ·Ð¸Ðº"
		},
		
		"sk":{
		    "shortName": "sk",
			"name":"Slovak",
			"nativeName":"slovenÄina"
		},
		"sl":{
		    "shortName": "sl",
			"name":"Slovenian",
			"nativeName":"slovenÅ¡Äina"
		},
	
		"es":{
		    "shortName": "es",
			"name":"Spanish",
			"nativeName":"espaÃ±ol, castellano"
		},
		
		"sv":{
		    "shortName": "sv",
			"name":"Swedish",
			"nativeName":"svenska"
		},
		
		
		"th":{
			"name":"Thai",
			"nativeName":"à¹„à¸—à¸¢"
		},
	
	
		"tr":{
		    "shortName": "tr",
			"name":"Turkish",
			"nativeName":"TÃ¼rkÃ§e"
		},
	
		"uk":{
		    "shortName": "uk",
			"name":"Ukrainian",
			"nativeName":"ÑƒÐºÑ€Ð°Ñ—Ð½ÑÑŒÐºÐ°"
		},
	
		"vi":{
		    "shortName": "vi",
			"name":"Vietnamese",
			"nativeName":"Tiáº¿ng Viá»‡t"
		}
	};
	
	function getList() {
	    return isoLangs;
	}
	
	function printLangs() {
	    console.log('Printing languages...');
	    jQuery.each(isoLangs, function(i, val) {
            console.log(val);
        });
	   
	}
	
	function onLangUpdate() {
	    console.log('Updated language: ' + select_lang.val());
	}
	

	
    function getLanguageName (key) {
		key = key.slice(0,2);
		var lang = isoLangs[key];
		return lang ? lang.name : undefined;
	}
	function getLanguageNativeName (key) {
		key = key.slice(0,2);
		var lang = isoLangs[key];
		return lang ? lang.nativveName : undefined;
	}
	