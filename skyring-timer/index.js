const Skyring = require("skyring");
const server = new Skyring();
 
function onSignal() {
    server.close(()=>{
        console.log("shutting down");
    });
}
 
server.listen(3000, (err) => {
    if (err) throw err;
    console.log("skyring listening at %s", "http://0.0.0.0:3000");
});
 
process.once("SIGINT", onSignal);
process.once("SIGTERM", onSignal);