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

app.get('/jobs/unpaid', getProfile, async (req, res) => {
    try {
        const unpaidJobs = await controller.getUnpaidJobs(req.profile);

        res.status(200).json(unpaidJobs);
    } catch(error) {
        console.log('ERROR: ', error);
        return res.status(500).send('Internal Server Error');
    }
});

app.post('/jobs/:job_id/pay', getProfile, async (req, res) => {
    try {
        const { job_id } = req.params;

        await controller.payJob(job_id, req.profile);

        res.status(200).end();
    } catch(error) {
        console.log('ERROR: ', error);
        return res.status(error.status || 500).send(error.message || 'Internal Server Error');
    }
});

app.post('/balances/deposit', getProfile, async (req, res) => {
    try {
        const { amount } = req.body;

        if(amount < 1) res.status(400).send('Amount must be a positive value');
        if(req.profile.type !== 'client') res.status(403).send('Must be a client');

        await controller.depositFundsToBalance(amount, req.profile)

        res.status(200).end();
    } catch(error) {
        console.log('ERROR: ', error);
        return res.status(error.status || 500).send(error.message || 'Internal Server Error');
    }
});

app.get('/admin/best-profession', async (req, res) => {
    try {
        const { start, end } = req.query;

        
    } catch(error) {
        console.log('ERROR: ', error);
        return res.status(500).send('Internal Server Error');
    }
});



module.exports = app;
