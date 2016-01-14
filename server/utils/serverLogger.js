var log4js = require('log4js'); 
log4js.loadAppender('file');
log4js.clearAppenders();
log4js.addAppender(log4js.appenders.file('server/logs/server.log'), 'server');
module.exports=log4js; 