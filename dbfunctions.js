/****************************
 * DATABASE FUNCTIONS
 */
var db = require("./database.js")

async function getPipelineVal(columnName)
{
    let query = 'SELECT * FROM pipeline WHERE name = \''+columnName+'\''
    
    console.log('Running query :'+query)
    return new Promise((resolve, reject) => {

   db.all(query,
        (err, row) => {
            if (err) {
              console.log('Error! '+err)
              return {"error":err.message};
            }
            console.log('getPipelineVal('+query+'):'+row[0].value+"")
            resolve(row[0].value)
        }
    )
    })
}

async function setPipelineVal(columnName,columnValue)
{
    let query = "UPDATE pipeline SET value = ? where name = '"+columnName+"'"
    let params = [columnValue]
    console.log('Running query :'+query+" param:"+columnName)
    return new Promise((resolve, reject) => {

    db.run(query,params,
        (err) => {
            if (err) {
              return {"error":err.message};
            }}
    )
    resolve()
    })
}


async function setSettingVal(newValue)
{
    var sql = 'update settings set value = ? where name = \'openai_key\''
    var params = [newValue]
    
    return new Promise((resolve, reject) => {

    //console.log('Running query :'+sql+" param:"+newValue)
    db.run(sql,params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        //console.log('setSettingVal: Executed!')
    });
    resolve()
    })
}

async function getSettingVal(res,columnName)
{
    var sql = "select value from settings where name = ?"
    var params = [columnName]
    
    console.log('Running query :'+sql+" param:"+columnName)
    return new Promise((resolve, reject) => {

    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          resolve(err)
          return;
        }

        console.log('getSettingVal:'+rows[0].value)
        resolve(rows[0].value)
      });
    })
}

async function writeLog(categoryName,pValue)
{
   let timestamp =  new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
   var sql = 'insert into logs (category,value) VALUES (?,?)'
   var params = [categoryName,timestamp+" "+pValue]
   
   return new Promise((resolve, reject) => {

   db.run(sql,params, function (err, result) {
       if (err){
           res.status(400).json({"error": err.message})
           return;
       }
      });
   resolve()
   })
}

async function getLogs(categoryName)
{
   let timestamp =  new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
   var sql = 'select * from logs where category = ?'
   var params = [categoryName]
   let final = {result:''}
   return new Promise((resolve, reject) => {

    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          resolve(err)
          return;
        }

        for(var cRow=0;cRow < rows.length;cRow++)
        final.result = final.result +rows[cRow].value+"\n"  
        resolve(final)
      });

   })
}


async function resetLogs()
{
  let query = "DELETE from logs"
  return new Promise((resolve, reject) => {

  db.run(query,
      (err) => {
          if (err) {
            return {"error":err.message};
          }}
  )
  resolve()
  })
}

module.exports = {getPipelineVal,setPipelineVal,getSettingVal,setSettingVal,writeLog,getLogs,resetLogs}