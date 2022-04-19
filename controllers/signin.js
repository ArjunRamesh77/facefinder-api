const handleSignin = async (req, res, db, bcrypt) => {
    
    const {email, password} = req.body;

    if(!email || !password) {
        res.status(400).json('Incorrect form submission');
        return
    }

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
}

module.exports = {
    handleSignin
}