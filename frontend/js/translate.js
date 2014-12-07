/**
 * Translation functions and apis.
 * */
 function getTranslateURL(text, lang) {
	  return "https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20141206T122958Z.41fad462c688b91b.e66a53ab34caf7afa0359842ffd9f79fb1b6e615&lang=" + lang + "&text=" + encodeURI(text);
}
	
 $(document).ready(function() {
     var STORAGE = false;
     
     var select_lang = $('#select_language');
     
    init();

    
    select_lang.on('change', function() {
        set('lang', $(this).val());
        var url = getTranslateURL('Please refresh the page for the previous chats to be translated.', $(this).val());
         $.getJSON( url, function( data ) {
              if(!data) {
               $('#note-refresh').text('Please refresh the page for the previous chats to be translated.');
                return;
              }
              else {
                var translated_text = data.text[0];
                $('#note-refresh').text(translated_text);
              }
          });
        
        console.log( 'Your language: ' + $(this).val());
    });
    

    function init() {
        console.log(new Date() + ': Getting translation services up...');
        setStorage();
      
        addLangs();
    }
     
    function addLangs() {
	    console.log('Adding languages to select option...');
	    var isoLangs = getList();
	     jQuery.each(isoLangs, function(i, val) {
	         var option = new Option(val.name, val.shortName);
             select_lang.append($(option));
        });
        
        var l = get('lang');
        if(l) {
            select_lang.val(l);
        } else {
            select_lang.val("en"); 
        }
	}
	
	/** Return the translate url...*/
	function getTranslateURL(text, lang) {
	  return "https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20141206T122958Z.41fad462c688b91b.e66a53ab34caf7afa0359842ffd9f79fb1b6e615&lang=" + lang + "&text=" + encodeURI(text);
	}
     
     /**
      * Main translate function between two languages.
      * */
     function translate(to, text) {
         if(!to || !text) {
             return null;
         }
         
        console.log('Translating to ' + to + ': ' + text);
        var url = "https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20141206T122958Z.41fad462c688b91b.e66a53ab34caf7afa0359842ffd9f79fb1b6e615&lang=es&text=" + encodeURI(text);
            
          $.getJSON( url, function( data ) {
              if(!data)
               return null;
              else 
               console.log('Translated text: ' + data.text[0]);
         });
        
     }
     
     
    function get(key) {
        if(!STORAGE) 
          return null;
          
        return localStorage.getItem(key);
    }
     
     
    function set(key, val) {
        if(STORAGE) {
            localStorage.setItem(key, val);
            console.log('Saved (' + key + '): ' + val);
        }
    }
     
   
 
    function checkStorage() {
        return typeof(Storage) !== 'undefined';
    }
    
    function setStorage() {
        if(checkStorage()) {
            console.log('Storage exists.');
            STORAGE = true;
        }
    }
 

 });
 
 