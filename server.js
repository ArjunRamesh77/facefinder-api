const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const {v4: uuidv4 } = require('uuid');
const knex = require('knex');
const { response } = require('express');

const {ClarifaiStub, grpc} = require("clarifai-nodejs-grpc");

const stub = ClarifaiStub.grpc();

const metadata = new grpc.Metadata();
metadata.set("authorization", "Key 3d050599cda24fe0bb7aca4825d91dbb");

const clarifaiApiCall = (req, res) => {

    const {url} = req.body;

    stub.PostModelOutputs(
        {
            model_id: "a403429f2ddf4b49b307e318f00e528b",
            inputs: [{data: {image: {url: url}}}]
        },
        metadata,
        (err, response) => {

            if (err) {
                res.status(400).json("failed to obtain info");
                return;
            }
    
            if (response.status.code !== 10000) {
                res.status(400).json("failed to obtain info");
                return;
            }
    
            console.log("Predicted concepts, with confidence values:")
            res.json(response);
        }
    );
}

const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      port : '5432',
      user : 'postgres',
      password : 'test',
      database : 'facefinder'
    }
  });


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

app.post('/signin', async (req, res) => {
    
    const {email, password} = req.body;

    let got = false;
    const result = await db.select('email', 'hash').from('login')
    .where('email', '=', email)
    .then(async (data) => {
        console.log(data[0].hash)
        const isValid = bcrypt.compareSync(password, data[0].hash);
        if (isValid) {
            const result = await db.select('*').from("users")
            .where('email', '=', email)
            .then(user => {
                got = true;
                res.json(user[0]);
            })
        }
    });
    
    if(!got)
        res.status(400).json("error loggin in");
});

app.post('/register', (req, res) => {

    const {email, name, password} = req.body;

    bcrypt.hash(password, null, null, function(err, hash) {
        db.transaction(trx => {
            trx.insert({
                hash,
                email
            })
            .into("login")
            .returning('email')
            .then(loginEmail => {
                return trx('users')
                .returning("*")
                .insert({
                    email, 
                    name,
                    joined: new Date()
                }).then(user => {
                    res.json(user[0]);
                }).catch(err => {
                    console.log(err);
                    res.status(400).json('unable to register');
                })  
            })
            .then(trx.commit)
            .catch(trx => {
                trx.rollback;
                res.status(400).json('unable to register');
            })
        })
    });
});

app.post('/clarifai/image', (req, res) => {

    clarifaiApiCall(req, res);
});

app.get('/profile/:id', async (req, res) => {

    const {id} = req.params;

    const out = await db.select("*").from("users").where({id});
    if (out.length > 0) {
        return res.json(out[0]);
    }

    res.status(400).json("error retrieving profile");
});

app.put('/image', (req, res) => {
    const {id} = req.body;

    console.log(req);

    db("users")
        .where({id})
        .increment('entries', 1 )
        .returning('*')
        .then(entries => {
            if(entries.length > 0) {
                res.json(entries[0].entries);
            } else {
                throw Error("No entries");
            }
        }) 
        .catch(err => {
            res.status(404).json("user not found");
        })    
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