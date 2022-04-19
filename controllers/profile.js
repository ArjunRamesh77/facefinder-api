
const handleProfile = async (req, res, db) => {

    const {id} = req.params;

    const out = await db.select("*").from("users").where({id});
    if (out.length > 0) {
        return res.json(out[0]);
    }

    res.status(400).json("error retrieving profile");
}

module.exports = {
    handleProfile
}