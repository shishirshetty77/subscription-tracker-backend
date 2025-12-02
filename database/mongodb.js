import mongoose from 'mongoose'
import { DB_URL } from '../config/env.js'

if (!DB_URL) {
    throw new Error('Please define the MongoDB URL environment variable (DB_URL or MONGODB_URI)')
}

const connectToDatabase = async () => {
    try {
        await mongoose.connect(DB_URL)
        console.log('Connected to MongoDB')
    } catch (error) {
        console.error('Error connecting to database:', error)
        process.exit(1)
    }
}

export default connectToDatabase