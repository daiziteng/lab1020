function getCookie(name){
    //获取name在Cookie中起止位置
    var start = document.cookie.indexOf(name+"=");
    //如果找到的话
    if(start != -1){
        start = start + name.length + 1;
        //获取value的终止位置
        var end = document.cookie.indexOf(";",start);
        if(end == -1){
            end = document.cookie.length;
        }
        //截获cookie的value值，并返回
        return unescape(document.cookie.substring(start,end));
    }
    return "";
}
var username = getCookie("this is username");
