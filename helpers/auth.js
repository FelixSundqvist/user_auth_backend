const jwt = require('jsonwebtoken')
const Users = require('../mongo/models/userModel')

const verifyToken = token =>
    jwt.verify(token, process.env.JWT, async (error, decoded) => {
        try {
            const user = await Users.findById(decoded.id)
            if (user) {
                return true
            }
        } catch (error) {
            return false
        }
    })

const getUserFromToken = token =>
    jwt.verify(token, process.env.JWT, async (error, decoded) => {
        try {
            const user = await Users.findById(decoded.id)
            return user
        } catch (error) {
            return 'ERROR'
        }
    })

const signToken = id => jwt.sign({ id }, process.env.JWT)

module.exports = {
    verifyToken,
    signToken,
    getUserFromToken,
}
