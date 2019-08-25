const bcrypt = require('bcryptjs')
const { gql } = require('apollo-server-express')
const { makeExecutableSchema } = require('graphql-tools')

const { signToken, verifyToken } = require('../helpers/auth.js')
const User = require('../mongo/models/userModel')

const typeDefs = gql`
    type Query {
        hello: String!
        bye: String!
        user: User
    }
    type Mutation {
        signUp(
            firstname: String
            lastname: String
            username: String!
            password: String!
            passwordConfirm: String!
            email: String!
        ): String
        login(username: String!, password: String!): Token
        verifyUserToken(token: String!): Boolean
    }
    type User {
        username: String!
        email: String!
        firstname: String
        lastname: String
    }
    type Token {
        token: String
    }
`

const resolvers = {
    Query: {
        hello: () => 'Hello',
        bye: () => 'bye',
        user: (parent, args, ctx) => {
            if (!ctx.user) return null
            return ctx.user
        },
    },
    Mutation: {
        signUp: async (parent, args) => {
            try {
                const user = await User.create(args)
                return 'success'
            } catch (error) {
                console.log(error)
                throw new Error(`[${error.name}]`)
            }
        },
        login: async (_, { username, password }, ctx) => {
            try {
                if (ctx.user) return
                const user = await User.findOne({ username })
                const passwordCheck = await bcrypt.compare(
                    password,
                    user.password
                )
                if (user && passwordCheck) {
                    const token = signToken(user._id)
                    return { token }
                }
            } catch (error) {
                throw new Error('Login information not correct')
            }
        },
        verifyUserToken: (_, { token }) => {
            const valid = verifyToken(token)
            return valid
        },
    },
}

const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
})

module.exports = schema
