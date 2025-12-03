import express from 'express'
import { NODE_ENV, PORT } from './config/env.js';
import cookieParser from 'cookie-parser';
import subscriptionRouter from './routes/subscription.routes.js';
import userRouter from './routes/user.routes.js';
import authRouter from './routes/auth.routes.js';
import workflowRouter from './routes/workflow.routes.js';
import connectToDatabase from './database/mongodb.js';
import errorMiddleware from './middlewares/error.middleware.js';



const app = express();

app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(cookieParser())

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/subscriptions', subscriptionRouter)
app.use('/api/v1/workflows', workflowRouter)

app.use(errorMiddleware)
app.get('/',(req,res)=>{
    res.send('welcome to the subscription tracker api');
});


const port = PORT || 3000

const start = async () => {
    try {
        await connectToDatabase()
        app.listen(port, () => {
            console.log(`subscription tracker api is running in ${NODE_ENV} at the url http://localhost:${port}`)
        })
    } catch (error) {
        console.error('Failed to start application:', error)
        process.exit(1)
    }
}

start()

export default app