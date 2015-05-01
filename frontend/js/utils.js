window.onbeforeunload = function () {
  var id = 'no-id';
  if(typeof(Storage) !== 'undefined') {
      id = localStorage.getItem('user_id');
  }
    $.ajax({
      type: 'POST',
      async: true,
      url: '/updateUserStatus',
      data: {'id': id, 'name' : $('#user-name').text(), 'user_status': 0 }
    });
};
    

$(document).ready(function() {

/* Variables */

var rec;

var PUBLISH_KEY = '';
var SUBSCRIBE_KEY = '';

var pubNub;

var CHAT_CHANNEL = 'chat_channel';
var USER_STATUS_CHANNEL = 'user_status';

var DEFAULT_LANG = 'en-US';

var STORAGE = false;

var SPEECH = false;

var EDITING_NAME = false;

var recognizing = false;

var langs = {};

var username_lbl = $('#user-name');
var userhint = $('#user-name-hint');

var online_user_list = $('#online_people');

var chats_view = $('#chats_viewer');

var compose_field = $('#msg_text');

var spch_btn = $('#mic');

var note_refresh = $('#note-refresh');

var USER_NAME = 'user_name';
var USER_ID = 'user_id';



init();

//Event listeners

spch_btn.click(function() {
    if(recognizing === true) {
        showRecogStatus('reset');
        recognizing = false;
        stopListening();
    } else {
        showRecogStatus('showListening');
        recognizing = true;
        startListening();
    }
});

compose_field.keypress(function (e) {
     var key = e.which;
     
     if(key == 13) {
         
         if(!compose_field.val()) {
             return;
         }
         
         var msgText = compose_field.val().trim();
         //Add the message to the board. Publish to PubNub.
         
         var name = get(USER_NAME);
         var id = get(USER_ID);
         
         console.log('Adding chat bubble...');
         translateAndAdd(true, id, name, msgText);

         
        /* var bubble = createBubble(name, id, msgText, true, chats_view);
         console.log('Adding chat bubble...');
         
         bubble.appendTo(chats_view);*/
         
         //Publish the message through PubNub.
         NewChatMessage(name, id, msgText);
         compose_field.val('');
         return;
     }


});


username_lbl.click(function() {
   if(!EDITING_NAME) {
       EDITING_NAME = true;
       userhint.text('Click Enter to save your changes.');
   }
});

username_lbl.focusout(function() {
    console.log('Out of focus!');
    EDITING_NAME = false;
    userhint.text('Click to change your user name.');
    
    var name = username_lbl.text();
    if(name) {
        //User entered a name.
        name = name.trim();
        username_lbl.text(name);
        save(USER_NAME, name);
        
        //Update server.
        updateUserInfo(get(USER_ID), name);
    } else {
        var name = get(USER_NAME);
        save(USER_NAME, name);
        username_lbl.text(name);
    }
});

username_lbl.keypress(function (e) {
 var key = e.which;
 if(key == 13)  // the enter key code
  {
    EDITING_NAME = false;
    userhint.text('Click to change your user name.');
    var name = username_lbl.text();
    if(name) {
        //User entered a name.
        name = name.trim();
        username_lbl.text(name);
        save(USER_NAME, name);
        
        //Update server.
        updateUserInfo(get(USER_ID), name);

    } else {
        var name = get(USER_NAME);
        save(USER_NAME, name);
        username_lbl.text(name);
    }
    return false;  
  } else {
       var name = username_lbl.text();
    if(name) {
        name = name.trim();
        save(USER_NAME, name);
        
    } else {
        var name = get(USER_NAME);
        save(USER_NAME, name);
    }
  }
});   


/** Translate the text to the user's language and add it to the chats view. */
function translateAndAdd(isUser, uid, name, text, justCame) {
    if(!uid || !name || !text)
        return;
    
    var lang = getLangCode();
    
    
    var url = getTranslateURL(text, lang);
    
    $.getJSON( url, function( data ) {
              if(!data) {
                alert('Unable to translate the chat message to your language.');
                return;
              }
              else {
                var translated_text = data.text[0];
                console.log("Translated text to '" + lang + "': " + translated_text);
                
                if(!isUser && justCame) {
                    //Speak 
                    tts(translated_text);
                }
                
                var bubble = createBubble(name, uid, translated_text, isUser, chats_view);
                bubble.appendTo(chats_view);
              }
    });
    
}


//Called when a new chat message is posted.
function NewChatMessage(name, id, msg) {
    if(!name || !id || !msg)
       return;
       
    console.log('New chat message from User (ID: ' + id + '; Name: ' + name);
    console.log('Sending message: ' + msg);
    
    publish( { 'id': id, 'name': name, 'msg': msg } );
}


//Generate a unique id for the user.
function uniq_id() {
    return '_' + Math.random().toString(36).substr(2, 9) + new Date().getTime();
}

//Generate the default user name.
function genUserName() {
    return ("User-" + new Date().getTime()).trim();
}

//Initialize everything.
function init() {
    console.log('Getting ready...');
    checkStorage();
    setDefaults();
    checkSpeechRecog();
    setUpPubNub();
    sendUserStatus(true);
    getOnlinePeople();
    getAndShowPublicChats();
    note_refresh.text('');
    
   /* console.log('Is it checked? ' + isTTS());
    if(get('tts') === 'undefined') {
        console.log('setting tts to default, true.');
        save('tts', true);
        console.log('Setting to true.');
        $('#tts').prop('checked', true);
    } else {
        console.log('setting tts to: ' + get('tts'));
        var isenabled = get('tts');
        console.log('isEnabled: ' + isenabled);
         $('#tts').prop('checked', isenabled);
    } */
}



function getOnlinePeople() {
    console.log('Getting people online...');
    
     $.get('/getOnlineUsers',function(data,status){
        console.log('Data: ' + JSON.stringify(data));
        
       
        if(status == 'success') {

        if(data.isEmpty === true) {
            console.log('No people online...');
        } else if(data.count === 1 && data.list[0].user_id === get(USER_ID)) {
            console.log('This user is the only person online.');
        } else {
            console.log('Recieved online people:');
            console.log(data);
 //Example response: {"count":1,"isEmpty":false,"list":[{"user_id":"_lddw4fhc41417862871107","name":"John"}]} 
             
            var list = data.list;
            
            //Add each person the list.
            for(var i = 0; i < list.length; i++) {
               var user = list[i];
               if(user.user_id !== get(USER_ID)) {
                   //The user is not this person. Add him/her to the list.
                   var uname = user.name;
                   var uid = user.user_id;
                   
                   $("#user_element-" + uid).remove();
                  
                   var div = $('<div id="user_element-' + uid + '" style="display: block; background-color: transparent; border-top: thin solid beige; padding: 6px;" class="user_element">' + uname + '</div>');
                   div.appendTo(online_user_list);
  
               }
           }

        }
    } else {
        console.log('Response is empty.');
    }
        
    });
}

/**
 * When the page opens, the user will have the public room open on default.
 * */
function getAndShowPublicChats() {
    console.log('Retrieving chats...');
    
    var resp;
    
     $.get('/getAllChats',function(data,status){
        console.log('Data: ' + JSON.stringify(data));
        
        if(status == 'success') {
            
            resp = data;
            
            if(resp) {
                
               if(resp.status) {
                 console.log('Request non-OK result.');
                 return;
               }
             
             
             
             
        if(resp.isEmpty === true) {
            console.log('No chats so far...');
            //No messages displayed
        } else {
            console.log('Recieved chats:');
            //console.log(resp);

            var chatsLog = resp.Chats;
            
            if(chatsLog) {
                for(var i = 0; i < chatsLog.length; i++) {
                  var chat = chatsLog[i];
                  
                  var id = chat.id;
                  var name = chat.name;
                  var msg = chat.chat;
                  
                  //Add the chat bubble to the view.
                  if(id === get(USER_ID)) {
                      //This is this user's chat.
                      translateAndAdd(true, id, name, msg);
                      
                    /*  var bubble = createBubble(name, id, msg, true, chats_view);
                      bubble.appendTo(chats_view); */
                  } else {
                      //This is someone else's chat.
                      translateAndAdd(false, id, name, msg);

                      
                      
                    /* var bubble = createBubble(name, id, msg, false, chats_view);
                      bubble.appendTo(chats_view);*/
                  }
                }
            }
            
        }
    } else {
        console.log('Response is empty.');
    }
        } 
    });
    
}

function showRecogStatus(cmd) {
    if(cmd) {
        if(cmd === 'reset') {
            compose_field.val('');
            compose_field.attr("placeholder", "Compose here. Then, click Enter.");
        } else if(cmd === 'showListening') {
            compose_field.val('');
            compose_field.attr("placeholder", "Please speak your message.");
            compose_field.focus();
        } else if(cmd == 'reset placeholder') {
            compose_field.attr("placeholder", "Compose here. Then, click Enter.");
        } else if(cmd === 'clear') {
            //Clear the recog status.
            compose_field.val('');
        }
    }
}

// Set default values
function setDefaults() {
    console.log('Setting defaults...');
    setUserName();
    setUserID();
}

/**
 * Update the new user information through PubNub.*/
 
function updateUserInfo(id, name) {
    console.log('Sending new user information...');
    console.log('ID: ' + id + ', Name: ' + name);
    
    if(pubNub) {
         pubNub.publish({
          channel: USER_STATUS_CHANNEL,
          message: JSON.stringify({"action": "user_info", "id": id, "user_name" : name})
       });
      
      console.log('User information sent.');
    }
}

//Set default user name, if it doesn't exist.
function setUserName() {
    if(!exists(USER_NAME)) {
        var name = genUserName();
        save(USER_NAME, name);
        username_lbl.text(name);
        console.log("Generated user's name: " + name);
        //Inform server.
    } else {
        var name = get(USER_NAME);
        console.log("User's name already exists: " + name);
        username_lbl.text(name);
    }
}

//Set user id, if it doesn't exist.
function setUserID() {
    if(!exists(USER_ID)) {
        var id = uniq_id();
        save(USER_ID, id);
        console.log('Set User ID: ' + id);
    } else {
        console.log('User already has ID: ' + get(USER_ID));
    }
}

function exists(key) {
    var g = get(key);
    console.log('Exists: ' + g);
    if(g == null || g == undefined) {
        return false;
    } else {
        return true;
    }
}

/**
 * Speech recognition will only work in the Chrome browser, so make sure if the browser is Google Chrome.
 * **/
function checkSpeechRecog() {
    console.log('Checking for speech recognition...');
    var isChromium = window.chrome;
    var vendorName = window.navigator.vendor;
   if(isChromium !== null && isChromium !== undefined && vendorName === "Google Inc.") {
       //chrome
       SPEECH = true;
       console.log('Speech recognition is enabled.');
   } else { 
       //Not chrome.
       SPEECH = false;
       //Remove the speech mic icon
       $('#mic').remove();
       alert('The Speech recognition feature is not supported by your browser. It is only supported by Google Chrome.');
       
   }
}

//Stop listening.
function stopListening() {
    console.log('Stopping recognition...');
        try {
            rec.stop();
        } catch(e) {
            
        }
}

//Start listening.
function startListening() {
    if(!SPEECH) 
       return;
       
    else {
         stopListening(); //Stop listening, if recognition was already active.

        if(!rec)
           setUpSpeechRecog();
           
          
         rec.lang = getLangCode();
         try{
         rec.start();
         }catch(e) {
             
         }
    }
    
}

function isTTS() {
    return true; 
}

/**
 * Set up speech recognition.
 * */
function setUpSpeechRecog() {
   
   if(!SPEECH)
      return;
   
   var interimResult = '';
   var textArea = compose_field;
   var textAreaID = 'msg_text';
   
   
  var firstTime = true;
  var isFinished = false;
  rec = new webkitSpeechRecognition();
  rec.continuous = false;
  rec.interimResults = true;

  rec.onstart =  function() { 
        recognizing = true;
        console.log('Starting speech recognition...');
  };
  rec.onresult = function(event) { 
      
        if(firstTime) {
            showRecogStatus('clear');
            firstTime = false;
        }
        var pos = textArea.getCursorPosition() - interimResult.length;
            textArea.val(textArea.val().replace(interimResult, ''));
            interimResult = '';
            textArea.setCursorPosition(pos);
            for (var i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    isFinished = true;
                    recognizing = false;
                    console.log('Final result: ' + event.results[i][0].transcript);
                    insertAtCaret(textAreaID, event.results[i][0].transcript);
                    showRecogStatus('reset placeholder');
                    
                    
                     if(compose_field.val() === '' || !compose_field.val()) {
                     //Input was empty.
                      showRecogStatus('reset');
                      return;
                    }
                     //Add the new chat message.
                     var name = get(USER_NAME);
                     var id = get(USER_ID);
          
                     //Trim whitespaces
                     compose_field.val(compose_field.val().trim());
         
                     var text = compose_field.val();
         
                     console.log('Adding chat bubble...');
                     translateAndAdd(true, id, name, text);

                     //Publish the message through PubNub.
                     NewChatMessage(name, id, text);
                     showRecogStatus('reset');

                    stopListening();
                } else {
                    if(!isFinished) {
                    console.log('interim result: ' + event.results[i][0].transcript);
                    isFinished = false;
                    insertAtCaret(textAreaID, event.results[i][0].transcript + '\u200B');
                    interimResult += event.results[i][0].transcript + '\u200B';
                    }
                }
            }
   /* var interim_transcript = '';
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final_transcript += event.results[i][0].transcript;
      } else {
        interim_transcript += event.results[i][0].transcript;
      }
    }
    final_transcript = final_transcript.trim();
    console.log('Recognized: ' + final_transcript);*/
  };
  rec.onerror = function(event) { 
    recognizing = false;
    showRecogStatus('reset');
    
    if (event.error == 'no-speech') {
        
        rec.stop();
    }
    if (event.error == 'audio-capture') {
        rec.stop();
        alert('You do not have any microphone plugged in.');
    }
    if (event.error == 'not-allowed') {
         rec.stop();
      
    }
      
  };
  
  rec.onend = function() { 
        recognizing = false;
        console.log('Speech recognition has ended...');
        
       
  }
    
}


//Check for localStorage
function checkStorage() {
 if(!isStorageAvailable())
    alert('Due to an incompatible browser, your settings will not be saved across sessions.');
 else
  STORAGE = true;
}

//Save to starage
function save(key, val) {
    if(STORAGE) {
        console.log('Saving (key: ' + key + '): ' + val);
        localStorage.setItem(key, val);
    } else {
        console.log('No storage exists.');
    }
}

//Check if the object is not null.
function isDefined(obj) {
    return obj != null || obj != undefined;
}

//Read from starage
function get(key) {
    if(!STORAGE)
       return null;
    else 
       return localStorage.getItem(key);
}

//Check if storage is available
function isStorageAvailable() {
    return typeof(Storage) !== 'undefined';
}

/**
 * Called upon a new message through the Chat channel.
 * **/
function onMessage(mesg,env,channel) {
    console.log('Received from channel [' + channel + ']:');
    mesg = JSON.parse(mesg);
    console.log(mesg);
    if(mesg) {
        if(mesg.id && mesg.name && mesg.msg) {
           if(mesg.id !== get(USER_ID)) {
               var id = mesg.id;
               var name = mesg.name;
               var msg = mesg.msg;
               
               console.log('Recieved a new message from User (ID: ' + id + '; Name: ' + name);
               console.log('Chat message: ' + msg);
               
               console.log('Posting to the chat board.');
               
               translateAndAdd(false, id, name, msg, true);

               //var bubble = createBubble(name, id, msg, false, chats_view);
               console.log('Adding chat bubble...');
         
               //bubble.appendTo(chats_view);
               
           } else {
               console.log('Ignoring this new chat message, since it was sent from this user.');
           }
        }
    }
}

/**
 * Called upon connecting to the PubNub service.
 * **/
function onConnected() {
    console.log(new Date() + ": Connected to PubNub.");
}

//Set up PubNub
function setUpPubNub() {
     
     console.log('Setting up PubNub...');
   
     //Initialize
     pubNub = PUBNUB.init({                                  
         publish_key   : PUBLISH_KEY,
         subscribe_key : SUBSCRIBE_KEY
     });

     //Subscribe
     pubNub.subscribe({
        channel: CHAT_CHANNEL,
        message: onMessage,
        connect: onConnected
     });
     
     //User status channel.
     pubNub.subscribe({
         channel:USER_STATUS_CHANNEL,
         message: onUserStatusChanged,
         connect: onConnected
     })
    
    console.log('PubNub setup complete.');

   
}

/**
 * Called upon a new message through the User status channel.
 * **/
function onUserStatusChanged(msg,env,channel) {
     console.log('Recieved status: ');
  var status = JSON.parse(msg);
  
  //Check if the user's info has changed.
  if(status.action) {
      if(status.action == 'user_info') {
          
          var uid = status.id;
          var name = status.user_name;
          
          if(uid === get(USER_ID)) {
              //This user..
              console.log('Ignored update because it was this user... Only updating existing chats...');
              //Update existing chats (the user name).
              
            var lblID = '#user_name_chatmsg_lbl-' + uid;
            var nameLabels = $(lblID);
            
            var liLabels = $('#chatbubble-' + uid);
            console.log("Li labels: " + liLabels.length);
            
            if(chats_view.children().length !== 0) {
                console.log('Looping over each chat to update the label.');
                  //Loop over each chat and update the labeled name...
                
                  console.log('Label ID --> ' + lblID);
                  console.log('Labels Count: ' + nameLabels.length);
                  
                  nameLabels.each(function (index,item) {
                      $(item).text(name.trim());
                  }); 
              }
              
              return;
          }
          
          console.log('Updating user information: ID = ' + uid + '; Name = ' + name);
        
          //Update the user's information in the sidebar and in all of the messages.messages.
          $('#user_element-' + uid).remove();

         
          var div = $('<div id="user_element-' + uid + '" style="display: block; background-color: transparent;border-top: thin solid beige;padding: 6px;" class="user_element">' + name + '</div>');
          div.appendTo(online_user_list);
          
          //Also update the existing chats' that users' name.
           var lblID2 = '#user_name_chatmsg_lbl-' + uid;
           var nameLabels2 = $(lblID2);
           
           if(nameLabels2.length !== 0) {
                 console.log('Looping over each chat to update the label.');
                  //Loop over each chat and update the labeled name...
                  console.log('Label for other person: ' + lblID2);
                  
                  console.log('Labels Count: ' + nameLabels2.length);

                  nameLabels2.each(function (index,item) {
                     $(item).text(name.trim());
                  }); 
            } 
       
      } else if(status.action === 'user_status_update') {
          
          //User status update notification.
          
          var id = status.id;
          
          console.log('Recieved user_status_update command, for user id: ' + id);
          
          if(id === get(USER_ID)) {
              //This user.
              console.log('Ignored command, it was this user.');
              return;
          }
          
          var name = status.name;
          var userStatus = status.user_status;

          
          if(userStatus === 'online') {
              console.log('User ' + id + ' came online. Adding to the sidebar...');
              //This user came online. Add him to the sidebar.
              //Update the user's information in the sidebar and in all of the messages.messages.
          $('#user_element-' + id).remove();

         
          var div = $('<div id="user_element-' + id + '" style="display: block; background-color: transparent;border-top: thin solid beige;padding: 6px;" class="user_element">' + name + '</div>');
          
          div.appendTo(online_user_list);
          
          console.log('Added user to the sidebar: ' + id);
          
          } else if(userStatus === 'offline') {
              //The user went offline. Remove him from the sidebar.
               console.log('User ' + id + ' went offline. Removing from the sidebar...');
               $('#user_element-' + id).remove();
               console.log('Removed user: ' + id);
              
          }
          
      }
     
  
      
      
      return;
  }
  
  var id = status.id;
  var userName = status.user_name;
  var online = status.user_status;
  
  if(online) {
      console.log('User (' + id + ') has come online.');
      
      //Add the user to the list. online_user_list
      
      //{"count":1,"isEmpty":false,"list":[{"user_id":"_lddw4fhc41417862871107","name":"Subhash Ramesh"}]} 

      $("#user_element-" + id).remove();
      var div = $('<div id="user_element-' + id + '" style="display: block; background-color: transparent;border-top: thin solid beige;padding: 6px;" class="user_element">' + userName + '</div>');
      
      div.appendTo(online_user_list);

  } else {
      console.log('User (' + id + ') has went offline.');
        //Remove the user from the user list.
      online_user_list.children("user-" + id).remove();
  }
  
 console.log();
}

function displayOnlineUsers() {
    
}

/**
 * Send user status. 
 * */
function sendUserStatus(status) {
    var id = get(USER_ID);
    var name = get(USER_NAME);
    
    console.log('Sending user status (' + id + ', ' + name + ')...');
    if(pubNub) {
         pubNub.publish({
          channel: USER_STATUS_CHANNEL,
          message: JSON.stringify({"id": id, "user_name" : name, "user_status" : status })
      });
      
      console.log('User status sent.');
    }
}


//Publish chat message through the Chat Channel.
function publish(msg) {
     if(pubNub) {
         pubNub.publish({
          channel: CHAT_CHANNEL,
          message: JSON.stringify(msg)
      });
    }
}


//Set the language code.
function setLangCode(lang) {
    if(!lang) {
        localStorage.setItem('lang', DEFAULT_LANG);
    } else {
        localStorage.setItem('lang', lang);
    }
      
}

//Get language code.
function getLangCode() {
    if(!STORAGE)
      return DEFAULT_LANG;
  
    var lang = localStorage.getItem('lang');
    return lang ? lang : DEFAULT_LANG;
}

//Google Text-to-speech
 function tts (str) {
     if(!str )
        return;
      
   var isChromium = window.chrome;
   var vendorName = window.navigator.vendor;
   if(isChromium !== null && isChromium !== undefined && vendorName === "Google Inc.") {
       //chrome
       
    console.log('Speaking: ' + str.trim());
    var code = getLangCode();
    try {
    var u = new SpeechSynthesisUtterance(str.trim());
    u.lang = code;
    speechSynthesis.speak(u)
u.onend = function(e) {
  console.log('Finished speaking.');
};

speechSynthesis.speak(msg);
}catch(e) {
    console.log('Error trying to speak: ');
    console.log(e);
    console.log();
}
   
   } else {
       console.log('Browser does not support tts.');
   }
  
 };
  
// Checkbox state event handler 

/* $("#tts").change(function() {
    console.log('Enabling TTS: ' + this.checked);
    if(this.checked) 
       save('tts', true);
    else 
       save('tts', false);
}); */

});
