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

async function payJob(jobId, user) {
    const { Contract, Job, Profile } = sequelize.models;

    if(user.type !== 'client') {
        throw new Error({
            message: 'User is not a client',
            status: 403
        })
    }

    const transaction = await sequelize.transaction();

    try {
        const job = await Job.findOne({
            where: { id: jobId },
            include: [{
                model: Contract,
                required: true,
                where: { ClientId: user.id }
            }],
            transaction
        });

        if(!job) {
            const error = new Error('Not found');
            error.status = 404;
            throw error;
        }

        if(job.paid) {
            const error = new Error('Job is already paid');
            error.status = 409;
            throw error;
        }

        if(user.balance < job.price) {
            const error = new Error('Insufficient funds');
            error.status = 406;
            throw error;
        }

        await Profile.increment({ balance: job.price }, { where: { id: job.Contract.ContractorId }, transaction });
        await Profile.increment({ balance: -job.price }, { where: { id: user.id }, transaction });
        await Job.update({ paid: true, paymentDate: new Date().toISOString() }, {
            where: {
            id: jobId
            }, transaction
        });

        await transaction.commit();
    } catch(error) {
        await transaction.rollback();
        if(error.status) {
            const customError = new Error(error.message);
            customError.status = error.status;
            throw customError;
        }
        throw new Error(error);
    }
}

async function depositFundsToBalance(amount, user) {
    const { Contract, Job, Profile } = sequelize.models;

    const transaction = await sequelize.transaction();

    try {

        const totalToPayInJobs = await Job.sum('price', {
            where: { paid: { [Op.not]: true } },
            include: [{
                model: Contract,
                required: true,
                where: and(
                    {status: 'in_progress'},
                    {ClientId: user.id},
                )
            }]
        });

        const maxValueAllowedToDeposit = totalToPayInJobs * 0.25;

        if(amount > maxValueAllowedToDeposit) {
            const error = new Error('Amount exceeds the allowable deposit amount');
            error.status = 406;
            throw error;
        }

        await Profile.increment({ balance: amount }, {
            where: { id: user.id },
            transaction
        });

        await transaction.commit();
    } catch(error) {
        await transaction.rollback();
        if(error.status) {
            const customError = new Error(error.message);
            customError.status = error.status;
            throw customError;
        }
        throw new Error(error);
    }

}


module.exports = {
    getContract,
    getContracts,
    getUnpaidJobs,
    payJob,
    depositFundsToBalance
}