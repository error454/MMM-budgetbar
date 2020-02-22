const NodeHelper = require("node_helper");
const url = require("url");
const http = require("http");

module.exports = NodeHelper.create({
    socketNotificationReceived: function(notification, config) {
        
        if(notification == "REGISTER") {
            console.log("Registering " + config);

            var that = this;
            const app = http.createServer((req, res) => {
                if (req.method === "GET") {
                    res.writeHead(200, { "Content-Type": "text/html" });
                    fs.createReadStream("./public/form.html", "UTF-8").pipe(res);
                } else if (req.method === "POST") {
                
                    var body = "";
                    req.on("data", function (chunk) {
                        body += chunk;
                    });
            
                    req.on("end", function(){
                        res.writeHead(200, { "Content-Type": "text/html" });
            
                        // ["Label": {"current": 35, "max": 50}]
                        var budget = JSON.parse(body);
                        that.sendSocketNotification(config.title, budget);
                        res.end(body);
                    });
                }
              });
            
            app.listen(config.port);
        }
    }
});
