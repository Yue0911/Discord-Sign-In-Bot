var Discord = require('discord.js');
var logger = require('winston');
var auth = require('./auth.json');

var botadmin = require('./botadmin.json');
var sqldb = require('./sqldb.json');
var sqlhost = require('./sqlhost.json');
var sqlpass = require('./sqlpass.json');
var sqluser = require('./sqluser.json');
var version = require('./version.json');

var mysql = require("mysql");

var bot = new Discord.Client();
var db = mysql.createConnection({
    host: sqlhost.mysqlHost,
    user: sqluser.mysqlUser,
    password: sqlpass.mysqlPass,
    database: sqldb.mysqlDB,
	charset: "utf8_unicode_ci"
});
bot.on('ready', () => {
  console.log("Discord Bot is starting on "+version.version);
});

bot.on('message', message => {
  if (message.channel.type != 'text') return;
  if (message.content === '~getid') {
	message.author.send("Your ID: "+message.member.id);
  }
  if (message.content === '~help') {
    message.channel.send("HI我是管理簽到的機器人\n如果你還沒註冊的話, 請輸入 `~create` 來創建\n查看簽到資訊 `~check`\n簽到請打 `~sign`\n\n"+version.version);
  }
  if (message.content === '~check') {
			var id = message.member.id;
			db.query("SELECT date,day FROM discord WHERE dis_id='"+id+"'",[],function(err,rows){
				var obj = JSON.stringify(rows);
				var obj = JSON.parse(obj);
				if(obj[0] == null){
					console.log('[INFO] CheckDB: '+id+' not create a account');
					message.reply('你尚未註冊!');
					return false;
				}
				else{
					console.log('[INFO] CheckDB: '+id+' check sign in day on '+obj[0].day+' days, last sign in date: '+obj[0].date);
					message.reply('簽到資料\n已簽到: '+obj[0].day+' 天\n最後簽到日期: '+obj[0].date);
				}
			});
  }
  if (message.content === '~create') {
			var id = message.member.id;
			var name = message.member.user.tag
			var date = new Date();
			var year = date.getFullYear()
			var month = ('0'+(date.getMonth()*1+1)).substr(-2);
			var day = ('0'+(date.getDate()*1-1)).substr(-2);
			var now = year+'-'+month+'-'+day;
			
			db.query("SELECT date,day FROM discord WHERE dis_id='"+id+"'",[],function(err,rows){
				var obj = JSON.stringify(rows);
				var obj = JSON.parse(obj);
				if(obj[0] == null){
					console.log('[INFO] CheckDB: '+id+' not create a account');
					message.reply('成功創建!');
					db.query("INSERT INTO discord VALUES(NULL,'"+id+"','0','"+now+"','"+name+"')");
					return false;
				}
				else{
				console.log('[INFO] Success create at:'+id);
				message.reply('你已經註冊過了!');
				}
			});
  }
  if (message.content === '~sign') {
			var id = message.member.id;
			var date = new Date();
			var year = date.getFullYear()
			var month = ('0'+(date.getMonth()*1+1)).substr(-2);
			var day = ('0'+date.getDate()).substr(-2);
			var now = year+'-'+month+'-'+day;
			db.query("SELECT date,day FROM discord WHERE dis_id='"+id+"'",[],function(err,rows){
				var obj = JSON.stringify(rows);
				var obj = JSON.parse(obj);
				if(obj[0] == null){
					console.log('[INFO] UpdateDB: '+id+' not create a account');
					message.reply('你尚未註冊!');
					return false;
				}
				else{
					if(obj[0].date == now){
						console.log('[INFO] UpdateDB: '+id+' sign in failed');
						message.reply('今天你已經簽到過了!');
						return false;
					}
					else{
						db.query("UPDATE discord SET day='"+(obj[0].day*1+1)+"',date='"+now+"' WHERE dis_id='"+id+"'",[],function(err,rows){
							console.log('[INFO] UpdateDB: '+id+' sign in '+(obj[0].day*1+1)+' days successfuly');
							message.reply('簽到成功! 你已經簽到了 '+(obj[0].day*1+1)+' 天');
							return false;
						});
					}
				}
			});
  }
});
// Log our bot in using the token from https://discordapp.com/developers/applications/me
bot.login(auth.token);
