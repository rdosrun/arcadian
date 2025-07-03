
function set_url(){
    fetch("api/enviroment").then((result)=>{
        return result.json();
    }).then((data)=>{
        window.env.BASE_URL = data.BASE_URL;
    });
}


function url_fetch(url){
    return window.env.BASE_URL + url;
}



