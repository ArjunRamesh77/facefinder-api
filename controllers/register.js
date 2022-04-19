
const handleRegister = (req, res, db, bcrypt) => {

    const {email, name, password} = req.body;

    if(!email || !name || !password) {
        res.status(400).json('Incorrect form submission');
        return
    }

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
}

module.exports = {
    handleRegister,
}