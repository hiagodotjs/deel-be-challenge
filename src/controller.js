const { or, and, Op } = require('sequelize');

const { sequelize } = require('./model')


async function getContract(contractId, user) {
    const { Contract } = sequelize.models;

    const contract = await Contract.findOne({
        where: and(
            { id: contractId },
            or(
                { ClientId: user.id },
                { ContractorId: user.id }
            )
        )
    })

    return contract;
}

async function getContracts(user) {
    const { Contract } = sequelize.models;

    const contracts = await Contract.findAll({
        where: or(
            { ClientId: user.id },
            { ContractorId: user.id }
        )
    });

    return contracts;
}

async function getUnpaidJobs(user) {
    const { Contract, Job } = sequelize.models;

    const unpaidJobs = await Job.findAll({
        where: { paid: { [Op.not]: true } },
        include: [{
            model: Contract,
            required: true,
            where: and(
                { status: 'in_progress' },
                or(
                    { ClientId: user.id },
                    { ContractorId: user.id }
                )
            )
        }]
    });

    return unpaidJobs;
}

module.exports = {
    getContract,
    getContracts,
    getUnpaidJobs
}