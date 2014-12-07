
/**
 * Create a bubble for the text. 
 *
 *  The user's bubble will always be blue and on the right. 
 *  The others'  will always be on the left, in green.
 * 
 *  The bubble will have the person's name.
 * 
 **/
 
 
 /**
  * 
  * For 'Other' bubbles
  * ----
  * <li class="other">
      <div class="avatar"></div>
      <div class="messages-other">
        <p>yeah, they do early flights cause they connect with big airports.  they wanna get u to your connection</p>
        <time datetime="2009-11-13T20:00">Timothy</time>
      </div>
    </li>
    
    
    For 'Self' bubbles
    -----
    <li class="self">
      <div class="avatar"></div>
      <div class="messages">
        <p>That makes sense.</p>
        <p>It's a pretty small airport.</p>
        <time datetime="2009-11-13T20:14">Subhash</time>
      </div>
    </li>
    
    
    Append these to #chats_viewer
    
  * 
  * */
function createBubble(name, id, text, isUser, container) {
    if(container && id && text && name) {
        console.log('Creting speech bubble...');

        var msgClass = 'messages-other';
        var liClass = 'other';
        
        var animClass = 'fadeInUp';
        

        if(isUser || isUser == true) {
            //This is the user's bubble.
            console.log('Creating a bubble for this user...');
            msgClass = "messages";
            liClass = "self";
        } else {
            console.log('Creating a bubble for this someone else...');
        }

        var id1 = id;
        var id = 'chatbubble-' + id;
        
        var p1 = '<li id="' + id + '" class="' + liClass + '">';
        var p2 = '<div class="avatar"></div>';
        var p3 = '<div class="' + msgClass + '">';
        var p4 = '<div>' + text.trim() + '</div>';
        
        var p5 = '<div id="user_name_chatmsg_lbl-' + id1 + '" class="username_chatmsg_Label" >' + name.trim() + '</div>';
       
        var p6 = '</div>';
        var p7 = '</li>';
        
        var bubble = $(p1 + p2 + p3 + p4 + p5 + p6 + p7); 
      
        return bubble;
    } else {
        return null;
    }
}

function checkStorage() {
    return typeof(Storage) !== 'undefined';
}


