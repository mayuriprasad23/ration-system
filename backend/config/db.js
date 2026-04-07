const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Mayuri@2305',
  database: 'ration_system'
});

db.connect(err => {
  if (err) console.log(err);
  else console.log('MySQL Connected ✅');
});

module.exports = db;