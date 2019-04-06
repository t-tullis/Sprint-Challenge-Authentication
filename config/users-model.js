const db = require('../database/dbConfig.js')

module.exports = {
    register,
    findById,
    findBy
}

function findBy(filter){
    return db('users').where(filter)
}

async function register(user){
    const [id] = await db('users').insert(user)
    
    return findById(id)
}

function findById(id){
    return db('users').where({id}).first();
}