let svr = new WebSocket('ws://localhost:8889');
let log = document.getElementById("log");

svr.addEventListener("open", () => {
    log.innerHTML = "sock open";
});

svr.addEventListener("message", msg => {
    msg = JSON.parse(msg.data);
    log.innerHTML = JSON.stringify(msg);
    
    console.log(msg);
});

svr.addEventListener("close", msg => {
    log.innerHTML = "sock close";
});

function sendMsg(msg){
    svr.send(msg);
}