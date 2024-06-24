import mysql from 'mysql'

const connections = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "dpgomart"
})

connections.connect(function(err){
    if(err){
        console.log("Connection error");
    } else {
        console.log("MYSQL DB Connected...");
    }
})

export default connections