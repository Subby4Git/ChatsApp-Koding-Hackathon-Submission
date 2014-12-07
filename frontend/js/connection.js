/**
 * Make a POST request from the server.
 */
 
var GLOBAL_USER_ID = 'User id'; 
 
function sendToServer(path, params) {
    if(!path)
      return;

    console.log(new Date() + ': Sending POST request to server at ' + url);
    
    if(params) {
    $.post(path, params, function(data,status){
        if(status == 200) {
            console.log(new Date() +': Request successfull. (' + status + ')');
            console.log(data);
            return true;
        }
        else {
            console.log(new Date() + ': Request returned a non-200 request code. (' + status + ')');
            return false;
        }
    });
    } else {
    $.post(path, function(data,status){
        if(status == 200) {
            console.log(new Date() +': Request successfull. (' + status + ')');
            console.log(data);
            return true;
        }
        else {
            console.log(new Date() + ': Request returned a non-200 request code. (' + status + ')');
            return false;
        }
    });
    }
}

/**
 * Make a GET request from the server, and return the information recieved.
 */
function getFromServer(path, params) {
    var url;
    
    if(params) 
      url = path + "?" + params;
    else 
      url = path;
      
    console.log('Getting from server: ' + url);
    $.get(url,function(data,status){
        console.log('Data: ' + JSON.stringify(data));
        console.log('Status: ' + status);
        if(status == 'success') {
            return data;
        } else {
            return {'status' : status};
        }
    });
}