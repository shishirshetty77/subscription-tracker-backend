import express from 'express'
import { PORT } from './config/env.js';    
const app = express();
app.get('/',(req,res)=>{
    res.send('welcome to the subscription tracker api');
});

app.listen(PORT, () => {
    console.log('subscription tracker api is running at the url http://localhost:${PORT}')
})
export default app;