const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const {v4: uuidv4 } = require('uuid');

const app = express();

app.use(bodyParser.json());
app.use(cors());

const database = {
    users: [
        {
            id: uuidv4(),
            name: "John",
            email: "john@gmail.com",
            password: "cookies",
            entries: 0,
            joined: new Date(),
        },
        {
            id: uuidv4(),
            name: "Sally",
            email: "sally@gmail.com",
            password: "bananas",
            entries: 0,
            joined: new Date(),
        }
    ]
}

app.get('/', (req, res) => {
    res.send(database.users);
});

app.post('/signin', (req, res) => {
    
    const {email, password} = req.body;

    const user = database.users.find(user => 
        (user.email === email) && 
        (user.password === password));
    
    if(user) {
        return res.json(user);
    }
    
    res.status(400).json("error loggin in");
});

app.post('/register', (req, res) => {

    const {email, name, password} = req.body;

    bcrypt.hash(password, null, null, (err, hash) => {
        console.log(hash);
    });

    database.users.push({
        id: uuidv4(),
        name: name,
        email: email,
        password: password,
        entries: 0,
        joined: new Date(),
    });

    res.json(database.users[database.users.length - 1]);
});

app.get('/profile/:id', (req, res) => {

    const {id} = req.params;

    const user = database.users.find(user => user.id === id)
    if(user) {
        return res.json(user);
    } 

    res.status(404).json("user not found");
});

app.put('/image', (req, res) => {
    const {id} = req.body;

    const user = database.users.find(user => user.id === id)
    if(user) {
        user.entries++;
        return res.json(user.entries);
    } 

    res.status(404).json("user not found");
});

/*
bcrypt.hash("bacon", null, null, (err, hash) => {

});

bcrypt.compare("bacon", hash, (err, res) => {

});

bcrypt.compare("veggies", hash, (err, res) => {

});
*/


app.listen(3100, () => {
    console.log("app is running on port, ", 3100);
});