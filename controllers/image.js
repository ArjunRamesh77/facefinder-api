const handleImage = (req, res, db) => {
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
}

module.exports = {
    handleImage
}