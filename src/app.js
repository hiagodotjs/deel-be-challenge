const express = require('express');
const bodyParser = require('body-parser');

const controller = require('./controller');
const {sequelize} = require('./model')
const {getProfile} = require('./middleware/getProfile')
const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

app.get('/contracts/:id', getProfile, async (req, res) => {
    try {
        const { id } = req.params;

        const contract = await controller.getContract(id, req.profile);

        if(!contract) return res.status(404).end();

        res.status(200).json(contract);
    } catch(error) {
        console.log('ERROR: ', error);
        return res.status(500).send('Internal Server Error');
    }
});

app.get('/contracts', getProfile, async (req, res) => {
    try {
        const contracts = await controller.getContracts(req.profile);

        res.status(200).json(contracts);
    } catch(error) {
        console.log('ERROR: ', error);
        return res.status(500).send('Internal Server Error');
    }
});



module.exports = app;
