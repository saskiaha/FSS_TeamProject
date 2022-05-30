var sqlite3 = require('sqlite3').verbose()

const DBSOURCE = "db.sqlite"

let db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    // Cannot open database
    console.error(err.message)
    throw err
  } else {
    console.log('Connected to the SQLite database.')
    db.run(`CREATE TABLE interaction (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userID INTEGER,
            treatment INTEGER,
            task INTEGER,
            time INTEGER, 
            type STRING,
            parameters JSON
            )`,

      (err) => {
        if (err) {
          // Table already created
        } else {
          // Table just created, creating some rows
        }
      });
  }
});


module.exports = db
