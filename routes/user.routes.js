import { Router } from "express";

const userRouter =Router();

userRouter.get('/',(req,res)=> res.send({title:'GET all users'}));

userRouter.get('/:id',(req,res)=> res.send({title:'GET all users'}));

userRouter.post('/',(req,res)=> res.send({title:'Create a new users'}));

userRouter.get('/:id',(req,res)=> res.send({title:'Update users'}));

userRouter.get('/:id',(req,res)=> res.send({title:'Delte users'}));

export default userRouter;

