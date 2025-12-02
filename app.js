import express from 'express'
import { PORT } from './config/env.js';

import subscriptionRouter from './routes/subscription.routes.js';
import userRouter from './routes/user.routes.js';
import authRouter from './routes/auth.routes.js';

const app = express();

app.use('/api/v1/auth',authRouter);
app.use('/api/v1/users',userRouter);
app.use('/api/v1/subscriptions',subscriptionRouter);


app.get('/',(req,res)=>{
    res.send('welcome to the subscription tracker api');
});

const port = PORT || 3000;

app.listen(port, () => {
    console.log(`subscription tracker api is running at the url http://localhost:${port}`)
})
export default app;