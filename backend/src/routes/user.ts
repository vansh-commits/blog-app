import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import {  sign, verify } from 'hono/jwt';

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
      const user = await prisma.user.create({
        data: {
          name: body.name || null,
          email : body.email,
          password: body.password
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
      const user = await prisma.user.findUnique({
        where:{
          email: body.email,
          password: body.password
        },
        select: {
          id: true
        }
      })
      if(!user){
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

