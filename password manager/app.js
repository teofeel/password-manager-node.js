var bodyParser = require('body-parser')
var express = require('express');
var path = require('path');
const fs = require('fs');

var app = express();
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.set("view engine", "ejs");

var loggedin_user;


function load_users(){
    let usersfile = fs.readFileSync('users.json', 'utf8');
    return JSON.parse(usersfile);
}
function check_login(username, password){
    let users = load_users();

    for(user in users.users){
        if(users.users[user].username == username && users.users[user].password == password) {
            return true;
        }
        else{
            continue;
        }
    }

    return false;
}
function check_register(username, password, confirm_password){
    let users = load_users();

    if(password!=confirm_password){
        return false;
    }

    for(user in users.users){
        if(users.users[user].username == username) {
            return false;
        }
        else{
            continue;
        }
    }

    return true;
}
async function add_new_user(username, password){
    var new_user = {"username": username, "password": password, "accounts": [] };
    let users = load_users();

    users['users'].push(new_user);
    new_users = JSON.stringify(users);
    fs.writeFileSync('users.json', new_users);

    return;
}
async function add_new_account(name,username,password){
    let users = load_users();

    for(u in users.users){
        if(users.users[u].username==loggedin_user){
            var new_account = {"name": name, "username": username, "password": password, "id": users.users[u].accounts.length};
            users.users[u].accounts.push(new_account);
            break;
        }
    }
    var update = JSON.stringify(users);
    fs.writeFileSync('users.json', update);
    return;
}

async function update_account(id, name, username, password){
    let users = load_users();
    console.log('ovde si');
    for(u in users.users){
        if(users.users[u].username==loggedin_user){
            console.log('ovde si1');
            for(acc in users.users[u].accounts){
                if(users.users[u].accounts[acc].id==id){
                    console.log('ovde si2');
                    users.users[u].accounts[acc].name = name;
                    users.users[u].accounts[acc].username = username;
                    users.users[u].accounts[acc].password = password;
                    break;
                }
            }
        }
    }
    var update = JSON.stringify(users);
    fs.writeFileSync('users.json', update);
    return;
}

async function delete_account(id){
    let users = load_users();
    for(u in users.users){
        if(users.users[u].username==loggedin_user){
            for(acc in users.users[u].accounts){
                if(users.users[u].accounts[acc].id==id){
                    delete users.users[u].accounts[acc];
                    break;
                }
            }
            users.users[u].accounts = users.users[u].accounts.filter(function (el) {
                return el != null;
            });
        }
    }
    
    var update = JSON.stringify(users);
    fs.writeFileSync('users.json', update);
    return;
}

app.get('/', (req,res)=>{
    res.sendFile(__dirname+"/welcome-page.html");
});

app.get('/login-page', (req,res)=>{
    res.sendFile(__dirname+"/login-page.html");
});

app.post('/login', (req,res)=>{
    var username = req.body.username;
    var password = req.body.password;

    if(check_login(username,password)){
        loggedin_user = username;
        res.redirect(`/users/${username}`);
    }  
    else{
        res.send('Username and password not matching');
    }
});

app.get('/register-page', (req,res)=>{
    res.sendFile(__dirname+"/register-page.html");
});

app.post('/register', (req,res)=>{
    var username = req.body.username;
    var password = req.body.password;
    var conf_password = req.body.confirm_password;

    if(check_register(username,password,conf_password)){
        add_new_user(username, password);
        loggedin_user = username
        res.redirect(`/users/${username}`);
    }  
    else{
        res.send('Try again');
    }
});

app.get('/users/:user', (req, res)=>{
    const {user} = req.params;
    let users = load_users();
    var accounts = new Array();
    for(u in users.users){
        if(users.users[u].username == user){
            
            for(acc in users.users[u].accounts){
                let account = {name: users.users[u].accounts[acc].name, username: users.users[u].accounts[acc].username, password: users.users[u].accounts[acc].password, id: users.users[u].accounts[acc].id};
                accounts.push(account);
            }
        }
    }
    res.render("index", {username: user, accounts: accounts});
});

app.get('/change/:id', (req,res)=>{
    const {id} = req.params;
    res.render("update_account", {username: loggedin_user, id: id});
});

app.post('/update-account/:id', (req,res)=>{
    const {id} = req.params;
    var name = req.body.name;
    var username = req.body.username;
    var password = req.body.password;

    update_account(id, name, username, password);

    res.redirect(`/users/${loggedin_user}`);
});

app.get('/delete/:id', (req,res)=>{
    const {id} = req.params;

    delete_account(id);

    res.redirect(`/users/${loggedin_user}`);
});

app.get('/new_account', (req,res)=>{
    res.render("new-account", {username: loggedin_user});
});

app.post('/new-account', (req,res)=>{
    var name = req.body.name;
    var username = req.body.username;
    var password = req.body.password;
    
    add_new_account(name,username,password);

    res.redirect(`/users/${loggedin_user}`);
});

app.listen(8080, function(){
    console.log("Server is running");
});