var mysql = require('mysql');

dal = function () {
    this.con = null;
}

dal.prototype.connectDb = function(host, user, password){
    this.con = mysql.createConnection({
        host: host,
        user: user,
        password: password
    });
    
    this.con.connect(function (err) {
        if (err) throw err;
        
        console.log("Db Connected!");
    });
}

module.exports = new dal();
