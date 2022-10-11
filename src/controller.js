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

module.exports = {
    getContract
}