import { Hono } from "hono"
import { verify } from "hono/jwt"
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
  
export const blogRouter = new Hono<{
    Bindings:{
        JWT_SECRET: string
        DATABASE_URL : string
    },
    Variables: {
        userId: string
    }
}>()

type JwtPayLoad = {
    id: string
}

blogRouter.use('/*', async (c, next) =>{
    const token = c.req.header("authorization")?.split(" ")[1] || "";
    const res  = await verify(token, c.env.JWT_SECRET) as JwtPayLoad;
    if(res){
        c.set("userId", res.id)
        next()
    }else{
        c.status(403)
        return c.json({error: "unauthorised"})
    }
  
})

blogRouter.post('/', async (c) => {
    try{
        const body = await c.req.json();
        const authorId = c.get("userId")
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate())

        const blog = await prisma.post.create({
            data: {
                title: body.title,
                content: body.content,
                authorId: authorId
            }
        })

        return c.json({
            id: blog.id
        })

    }catch(error){
        return c.text(`Internal Server Error: ${(error as Error).message}`, 500)
    }
    

    
  })
  
blogRouter.put('/', async (c) => {
    try{
        const body = await c.req.json();
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate())

        const blog = await prisma.post.update({
            where: {
                id: body.id
            },
            data: {
                title: body.title,
                content: body.content
            }
        })

        return c.json({
            id: blog.id
        })

    }catch(error){
        return c.text(`Internal Server Error: ${(error as Error).message}`, 500)
    }
})
  
blogRouter.get('/bulk', async(c) => {
    try{
        const body = await c.req.json();
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate())

        const blog = await prisma.post.findMany()

        return c.json({
            blog
        })

    }catch(error){
        return c.text(`Internal Server Error: ${(error as Error).message}`, 500)
    }
})
  
blogRouter.get('/:id', async (c) => {
    try{
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate())

        const blog = await prisma.post.findFirst({
            where: {
                id: c.req.query('id')
            }
        })

        if(!blog){
            return c.text("blog not found")
        }

        return c.json({
            id: blog.id
        })

    }catch(error){
        return c.text(`Internal Server Error: ${(error as Error).message}`, 500)
    }
}) 