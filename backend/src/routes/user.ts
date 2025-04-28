import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import {  sign, verify } from 'hono/jwt';
import { signupInput, signinInput } from "@vansh17/blog-app";


export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string
        JWT_SECRET: string
    }
}>()

userRouter.post('/signup', async (c)  => {
    try {
      const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate())

      
      const body = await c.req.json();
      const { success } = signupInput.safeParse(body);
      if(!success){
        c.status(411)
        return c.json({
          message: "Inputs are not correct"
        })
      }
      const name = body.name || null;
      const email = body.email;
      const password = body.password;

      if(!email || !password){
        c.status(401);
        return c.text("enter valid credentials")
      }

      const exist = await prisma.user.findFirst({
        where: {
          email
        }
      })

      if(exist){
        c.status(409);
        return c.text("user already exist")
      }
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password
        },
        select: {
          id: true,
          name : true,
          email: true
        }
      })
      const token = await sign({id: user.id}, c.env.JWT_SECRET)
      return c.json({
        jwt: token,
      })
      
    } catch (error) {
      console.log(error)
      return c.text(`Database Error: ${(error as Error).message}`, 500)
    }
    
  })
  
userRouter.post('/signin', async (c) => {
    try {
      const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate())

    
      const body = await c.req.json();
      const { success } = signinInput.safeParse(body);
      if(!success){
        c.status(411)
        return c.json({
          message: "Inputs are not correct"
        })
      }

      const email = body.email
      const password = body.password;

      if(!email || !password){
        c.status(401);
        return c.text("enter valid credentials")
      }

      const user = await prisma.user.findUnique({
        where:{
          email
        },
        select: {
          id: true,
          password: true
        }
      })
      if(!user || user.password != password){
        c.status(403);
        return c.text("wrong email or password")
      }
  
      const token = await sign({id: user.id}, c.env.JWT_SECRET)
  
      return c.json({
        jwt: token
      })
      
    } catch (error) {
      return c.text(`Database Error: ${(error as Error).message}`, 500)
    }
    
  })

