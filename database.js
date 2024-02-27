var sqlite3 = require('sqlite3').verbose()
const DBSOURCE = "db.sqlite"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    }else{
        console.log('Connected to the SQLite database.')
        db.run(`CREATE TABLE settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name text, 
            value text
            )`,
        (err) => {
            if (err) {
                // Table already created
            }else{
                // Table just created, creating some rows
                var insert = 'INSERT INTO settings (name, value) VALUES (?,?)'
                db.run(insert, ["openai_key","12345678910"])
            }
        });  

        db.run(`CREATE TABLE pipeline (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name text, 
            value text
            )`,
        (err) => {
            if (err) {
                // Table already created
            }else{
                // Table just created, creating some rows
                var insert = 'INSERT INTO pipeline (name, value) VALUES (?,?)'
                db.run(insert, ["textPromptAssistant",""])
                db.run(insert, ["textPromptInput",""])
                db.run(insert, ["textPromptResult",""])
                db.run(insert, ["audio","[]"])
                db.run(insert, ["image","[]"])
                db.run(insert, ["video","[]"])
            }
        });

        db.run(`CREATE TABLE logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category text, 
            value text
            )`,
        (err) => {
            if (err) {
                // Table already created
            }else{
                // Table just created, creating some rows
            }
        });
    }
});


module.exports = db