/**
 * Subhash Ramesh, 2014
 * Team: TheHardKoders
 * 
 * ChatsUp Application
 * 
 * This is my first hackathon submission. It is a realtime, and most importantly
 * a Globally translated chat application. There is one open room, in which users can chat. 
 * 
 * Users can chat in their language and recieve messages in their language. This is the same with 
 * every user. This way, people who speak different languages, can talk with each other, despite their
 * language difference. 
 * 
 * It's now possible for a person who speaks only English, to speak with a person who only speaks Chinese! * 
 * 
 * This is the backend server, written in NodeJS.NodeJS.
 * 
 * It uses the Express framework, and Redis for the database. The chat records are saved in Redis.
 * 
 * */
 
//PubNub Credentials. Please do not misuse! ;)
var PUBLISH_KEY = '';
var SUBSCRIBE_KEY = '';
var CHAT_CHANNEL = 'chat_channel';

var CHAT_LOG = 'chat_log';
var USER_STATUS_CHANNEL = 'user_status';

var express = require('express');
var app = express();


var DEVELOPMENT_MODE = false;


var bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

var pubnub;

var online_users = {}; //This will store the currently-online users.


setUpPubNub();


 var redis = require("redis"),
        client = redis.createClient();
        

        
client.on("connect", function() {
    console.log('Connected to redis.');
});        

client.on("error", function(err) {
    console.log('Error connecting to redis: ' + err);
}); 

//app.use(express.static(__dirname + '/js'));
app.use(express.static('./nodejs/frontend/js'));
app.use(express.static('./nodejs/frontend/css'));


//Used for DEVELOPMENT PURPOSES ONLY!
if(DEVELOPMENT_MODE === true) {
app.get('/deleteAllMsgs', function(req, res) {
   
   try {
       console.log('Deleting all messages...');
       client.del(CHAT_LOG);
       res.json({'success':'OK'});
       console.log('Done deleting...');
   } catch(e) {
       console.log(e);
       res.json({'success' : false, 'e' : e });
   }
    
});
}

/**
 * Home page. */
app.get('/', function(req, res){
  console.log(new Date() + ': Recieved request.');
 res.sendfile('./nodejs/frontend/html/index.html');

});

/**
 * Get online users. */
app.get('/getOnlineUsers', function(req, res) {
    var p = getUsersOnline();
    res.json(p);
});

function pushStatus(obj) {
    if(obj) {
         pubnub.publish({ 
            channel   : USER_STATUS_CHANNEL,
            message   : JSON.stringify(obj)
        });
    }
    
}


/**
 * User status update. This is only called when the user leaves the session.
 * */
app.post('/updateUserStatus', function (req, res) {
    console.log('Received status update...');
   if(req.body) {
       console.log("Body: " + JSON.stringify(req.body));
       var body = req.body;
       if(body.id && body.name && body.user_status) {
           var id = body.id;
           var name = body.name;
           var status = body.user_status;
           
           if(status === 0 || status === '0') {
               //User went offline
               console.log('Status update: User (' + id + ') went offline. Name: ' + name);
               delete online_users[id];
               
               console.log('Online users: ');
               console.log(online_users);
               console.log();
               
                //broadcast status update through PubNub.
               console.log('Sending user status for: ' + id + '...');
               console.log();
               pushStatus({'action':'user_status_update', 'id': id, 'name':name, 'user_status':'offline'});
           } else {
               //User came online
               online_users[id] = name;
               
               console.log('Online users: ');
               console.log(online_users);
               console.log();
               
                //broadcast status update through PubNub.
               console.log('Sending user status for: ' + id + '...');
               console.log();
               //broadcast status update through PubNub.
                console.log('Sending user status for: ' + id + '...');
                pushStatus({'action':'user_status_update', 'id': id, 'name':name, 'user_status':'online'});
           }
       } else {
           console.log('Ignoring request...');
       }
   } 
});



/**
 * Get all chats.
 * */
app.get('/getAllChats', function(req, res) {
   console.log(new Date() + ': Getting all chats...');
   if(req) {
       getALLChats(res);
   } 
});



var server = app.listen(3001, '0.0.0.0', function() {
  console.log('NodeJS server has started...\nListening on port %d', server.address().port);
});

/*
/**
 * Update the user's information 
function updateUserInfo(id, name) {
    if(id && name) {
        console.log('Updating user info for ' + id + '--> Name: ' + name);
        
        online_users[id] = name;
        
        
        
    }
} */

/**
 * Get Current online users 
 * */
function getUsersOnline() {
    var i = 0;
    
   var list = [];
   for (var id in online_users) {
       i++;
       list.push({'user_id' : id, 'name' : online_users[id]});
   } 
   
   if(list.length == 0) {
       return { 'count' : 0, 'isEmpty' : true };
   }
   return {'count' : i, 'isEmpty' : false, 'list' : list };
}


/** Add Chat message to Redis **/
function addChat(id, name, chat) {
    console.log('Adding chat message: ' + chat);
    if(client) {

      client.get(CHAT_LOG, function (err, reply) {

          if(reply) {
            var chat_log = JSON.parse(reply);
            console.log(chat_log);
            
           if(chat_log && chat_log.Chats) {
             //Chat log already exists.
             console.log('Chat log already exists... Here is the updated one');
             var list = chat_log.Chats;
             list.push({ 'id' : id, 'name': name, 'chat' : chat});
             
             chat_log.Chats = list;
             console.log(chat_log.Chats);
            
             
             save(CHAT_LOG, chat_log);
        
           } else {
             //Create a new chat log and save it.
             console.log('Creating a new chat log, to save...');
             var log = [];
             log.push({'id' : id, 'name': name, 'chat' : chat});
             var chatlog = { 'isEmpty': false, 'Chats' : log };
        
             save(CHAT_LOG, chatlog);
          }
        } else {
             //Create a new chat log and save it.
             console.log('Creating a new chat log, to save...');
             var log = [];
             log.push({'id' : id, 'name': name, 'chat' : chat});
             var chatlog = { 'isEmpty': false, 'Chats' : log };
        
             save(CHAT_LOG, chatlog);
        }
        

      });
    }
    
}


//Get all of the chats.
function getALLChats(res) {
     console.log('Searching Redis for chats...');
     client.get(CHAT_LOG, function (err, reply) {
          if(reply) {
              console.log('Redis records for all chats: ');
              
              var chats = JSON.parse(reply);
              
              console.log(chats);
              
              if(chats == null || chats === undefined || !chats || chats === 'undefined') {
                 console.log('No chats exist.');
                 var r = {'isEmpty' : true };
                 if(res)
                   res.json(r);
                   
                 return r;
              } else {
                  
                 console.log('Successfully retreived all of the messages...');
                
                 if(res)
                    res.json(chats);
                    
                 return chats;
              }
          }
          
     });
}

/*
//Get chats by user id.
function getChatsByUser(id) {
    var result = {};
    client.get(CHAT_LOG, function (err, reply) {
          if(reply) {
            var chats = JSON.parse(reply);
              
             if(chats == null || chats == undefined || !chats || chats.Chats.length == 0) {
                 return null;
             } else {
                var logs_user = [];
        
               for(var i = 0; i < json.length; i++) {
                   var obj = json[i];
                    if(obj.id == id) {
                      //This is a user's chat message.
                     logs_user.push(obj);
                }
 
           }
       
             return {'Chats' : logs_user};
          }
        }

      });
  
} */


//Save to Redis
function save(key, val) {
    if(client && key && val) {
        client.set(key, JSON.stringify(val), function (err, reply) {
           console.log("Saved: " + key + "\nStatus: " + reply.toString());
       });
    } else {
        return null;
    }
}

//Read from Redis.
function get(key) {
    if(client) {
    client.get(key, function (err, reply) {
          console.log('Reply: ' + JSON.parse(reply));
          console.log('Err: ' + err);
         if(reply) {
           return JSON.parse(reply);
         } else {
             return null;
         }

      });
    } else {
        return null;
    }
}


/**
 * Called upon a new message through the Chat channel.
 * **/
function onMessage(msg,env,channel) {
    console.log('Received from channel [' + channel + ']:');
    
    if(!msg) {
        return;
    }
    
    var reply = JSON.parse(msg);
    
    if(reply.id && reply.name && reply.msg) {
        
        var uid = reply.id;
        var name = reply.name;
        var msg = reply.msg;
        
        console.log('Recieved chat message from User (id: ' + uid + '; Name: ' + name);
        console.log('Message is: ' + msg);
            
        //Add the chat message to the Redis database.
        addChat(uid, name, msg);
    }
}


function getOnlineUserCount() {
    if(!online_users)
      return 0;
      
    var i = 0;
    for(var key in online_users ) {
        i++;
    }
    
    return i;
}


function onUserStatusChanged(msg, env, channel) {
  console.log('Recieved status: ');
  var status = JSON.parse(msg);
  
  if(status.action) {
      if(status.action == 'user_info') {
          
          var uid = status.id;
          var name = status.user_name;
          
          console.log('Updating user information: ID = ' + uid + '; Name = ' + name);
          online_users[uid] = name;
          
          client.get(CHAT_LOG, function (err, reply) {
    
            if(err) {
                return;
            }  
             
            if(reply) {
               var lo = JSON.parse(reply);
               var logs = lo.Chats;
               
               for(var i = 0; i < logs.length; i++) {
                   var obj = logs[i];
                   if(obj.id === uid) {
                       //Set the updated name for the user id.
                       obj.name = name;
                       logs[i] = obj;
                   }
                } 
                
                //Save the updated log.
                lo.Chats = logs;
                console.log('Updated chat log: ');
                console.log(lo.Chats);
                save(CHAT_LOG, lo);
                
             } else {
                return;
         }

      });
      }
      
      
      return;
  }
  
  var id = status.id;
  var userName = status.user_name;
  var online = status.user_status;
  
  if(online) {
      online_users[id] = userName;
      console.log('User (' + id + ') has come online.');
  } else {
      delete online_users[id];
      console.log('User (' + id + ') has went offline.');
  }
  
   console.log('Current online users...');
   var total = getOnlineUserCount();
   console.log('Total: ' + total);
   console.log();
   console.log(online_users);
}

/**
 * Called upon connecting to the PubNub service.
 * **/
function onConnected() {
    console.log(new Date() + ": Connected to PubNub.");
}

// ----------------- PubNub Services --------------------------------------------------------
function push(obj) {
    if(obj) {
         pubnub.publish({ 
            channel   : CHAT_CHANNEL,
            message   : obj
        });
    }
    
}

function setUpPubNub() {
    console.log('Setting up PubNub...');

     //Initialize
    pubnub = require("pubnub").init({
       publish_key:    PUBLISH_KEY,
       subscribe_key:  SUBSCRIBE_KEY
    });  

     //Subscribe to the chat channel
     pubnub.subscribe({
        channel: CHAT_CHANNEL,
        message: onMessage,
        connect: onConnected
     });
     
     //Subscribe to the user status channel.
     pubnub.subscribe({
         channel: USER_STATUS_CHANNEL,
         message: onUserStatusChanged,
         connect: onConnected
     });
    
}
