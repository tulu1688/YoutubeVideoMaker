var mysql = require('mysql');
var sql = require('sql-bricks');
var select = sql.select,
    insert = sql.insert,
    update = sql.update;
var or = sql.or,
    like = sql.like,
    lt = sql.lt;

dal = function () {
    this.con = null;
}

dal.prototype.connectDb = function (host, user, password, schema) {
    this.con = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: schema
    });

    this.con.connect(function (err) {
        if (err) throw err;

        console.log("Db Connected!");
    });
}

dal.prototype.getVideoInfosFromUrl = function (url, callback) {
    var self = this;
    var queryStr = select().from('video').where({
        url: url
    }).toString();
    self.con.query(queryStr, function (err, rows) {
        if (err)
            callback(err, null);
        callback(null, rows);
    });
}

dal.prototype.searchVideos = function (searchCriteria, callback) {
    var self = this;
    
    var queryStr = select().from('video').where(searchCriteria).toString();
    self.con.query(queryStr, function (err, rows) {
        if (err)
            callback(err, null);
        callback(null, rows);
    });
}

dal.prototype.createVideoInfoFromUrl = function (url, status, callback) {
    var self = this;
    var now = new Date().toISOString().replace('T', ' ').replace('Z', '');
    var transientVideoInfo = {
        url: url,
        status: status,
        created_timestamp: now,
        last_updated_timestamp: now
    };

    var queryStr = insert('video', transientVideoInfo).toString();
    self.con.query(queryStr, function (err, result) {
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            transientVideoInfo.id = result.insertId;
            callback(null, transientVideoInfo);
        }
    });
}

dal.prototype.updateVideoInfos = function (id, updatedData, callback) {
    var self = this;

    var now = new Date().toISOString().replace('T', ' ').replace('Z', '');
    var updatePayload = updatedData;
    updatePayload.last_updated_timestamp = now;

    var queryStr = update('video', updatePayload).where({
        id: id
    }).toString();
    self.con.query(queryStr, function (err, result) {
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, "\tDONE");
        }
    });
}

module.exports = new dal();
