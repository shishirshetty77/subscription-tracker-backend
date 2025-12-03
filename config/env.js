import { config } from 'dotenv'

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` })

export const {
  NODE_ENV,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  QSTASH_TOKEN,
  QSTASH_URL,
  ARCJET_KEY,
  EMAIL_PASSWORD,
  SERVER_URL,
} = process.env

export const PORT = Number(process.env.PORT || 3000)
export const DB_URL = process.env.DB_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/subscriptions'
