const express = require('express')
const route = express.Router()
const bodyParser = require('body-parser')
const keys =require('./keys.json')
const mysql = require('mysql')
const {google} = require('googleapis')
let connection = mysql.createConnection({
    host: 'localhost',
    user: '****',
    password: '****',
    database: 'my_db'
  })

const client = new google.auth.JWT(
    keys.client_email,
    null,
    keys.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
);

client.authorize((err,tokens)=>{
    if(err) {
        console.log(err);
        return ;
    }
    else{
    console.log('connected');
    }
});

async function gsrun (cl,input){
    const gsapi  = google.sheets({
            version:'v4',
            auth:cl})
    const opt= {
        spreadsheetId:'1XUnYoUHnfhNEzfwMiAAD3UGQGff8ru02C7LDsUHGTts',
        range:'Data!A2:F'
    }

    let data=await gsapi.spreadsheets.values.get(opt)

    let finalRow= data.data.values.length+1
    console.log(finalRow);

    const updatedOpt= {
        spreadsheetId:'1XUnYoUHnfhNEzfwMiAAD3UGQGff8ru02C7LDsUHGTts',
        range:`Data!A${1+finalRow}`,
        valueInputOption: 'USER_ENTERED',
        resource:{values: [input] }
    }
    console.log(updatedOpt.range)
    let res=await gsapi.spreadsheets.values.update(updatedOpt)

    console.log(res)
}


route.use(bodyParser.urlencoded({extended:false}))
route.get('/',(req,res)=>{
    res.sendFile(__dirname + '/index.html')
})
route.post('/',(req,res)=>{
    console.log(req.body)
    connection.query(`INSERT INTO customer VALUES ('${req.body.name}' , '${req.body.pass}','${req.body.email}','${req.body["'1st'"]}','${req.body["'2nd'"]}')`,
    async function (err, rows, fields) {
        if (err) throw err
        let input= [req.body.name,req.body.pass,req.body.email,req.body["1st"],req.body["2nd"]]
        await gsrun(client,input)
    })
})



module.exports=route;