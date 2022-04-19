const {ClarifaiStub, grpc} = require("clarifai-nodejs-grpc");
const req = require('express/lib/request');

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

module.exports = {
    clarifaiApiCall
}