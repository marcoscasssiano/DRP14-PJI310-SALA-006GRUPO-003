const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

const user = process.env.DBUSER || 'admin'
const pass = process.env.DBPASS || 'admin'

const connectDB = async () => {
    try {
        await mongoose.connect(`mongodb+srv://${user}:${pass}@cluster0.f0ks7vy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true
        })
        console.log('banco de dados conectado com sucesso! \n')
    } catch (err) {
        console.error(err.message)
        process.exit(1)
    }
};

module.exports = connectDB