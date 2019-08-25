require('dotenv').config()

const mongoose = require('mongoose')
const { ApolloServer } = require('apollo-server-express')
const schema = require('./graphql')
const { verifyToken, getUserFromToken } = require('./helpers/auth')

const app = require('./app')
const server = new ApolloServer({
    schema,
    context: async ({ req, res }) => {
        try {
            let authToken = await req.headers.authorization
            if (authToken) {
                ;[bearer, token] = authToken.split(' ')
                const valid = await verifyToken(token)

                if (bearer.toLowerCase() === 'bearer' && valid) {
                    const user = await getUserFromToken(token)
                    return { user }
                }

                return null
            }
        } catch (error) {
            return {
                error,
            }
        }
    },
})
const PORT = process.env.PORT || 8000
const DB = process.env.MONGO_DB_CONNECTION.replace(
    /<password>/,
    process.env.MONGO_DB_PASSWORD
)

server.applyMiddleware({ app })

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
    })
    .then(connection => {
        console.log(`Connection Successful`)
    })
    .catch(err => console.log(`error: ${err}`))

app.listen(PORT, () => console.log(`Server running at ${PORT}`))
