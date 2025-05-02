import { Hono } from "hono"
import { verify } from "hono/jwt"
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { updateBlogInput, createBlogInput } from "@vansh17/blog-app"
  
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
    // console.log(token)
    const res  = await verify(token, c.env.JWT_SECRET) as JwtPayLoad;
    if(res){
        c.set("userId", res.id)
        // console.log("authorized")
        return next()
    }else{
        c.status(403)
        return c.json({error: "unauthorised"})
    }
  
})

blogRouter.post('/newblog', async (c) => {
    try{
        const body = await c.req.json();
        const {success} = createBlogInput.safeParse(body)
        if(!success){
            c.status(411)
            return c.text("enter valid inputs")
        }
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
            blog_id: blog.id
        })

    }catch(error){
        console.log(error)
        return c.text(`Internal Server Error: ${(error as Error).message}`, 500)
    }
    

    
})
  
blogRouter.put('/update', async (c) => {
    try{
        const body = await c.req.json();
        const {success} = createBlogInput.safeParse(body)
        if(!success){
            c.status(411)
            return c.text("enter valid inputs")
        }
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
            blog_id: blog.id
        })

    }catch(error){
        return c.text(`Internal Server Error: ${(error as Error).message}`, 500)
    }
})
  
blogRouter.get('/bulk', async(c) => {
    try{
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate())

        const blog = await prisma.post.findMany(
            {
                select: {
                    id: true,
                    title: true,
                    content: true,
                    author : {
                        select : {
                            name: true
                        }
                    }
                }
            }
        )

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
                id: c.req.param("id")
            },
            select: {
                id: true,
                title: true,
                content: true,
                author : {
                    select : {
                        name: true
                    }
                }
            }
        })
        console.log(blog)

        if(!blog){
            return c.text("blog not found")
        }

        return c.json({
            blog
        })

    }catch(error){
        return c.text(`Internal Server Error: ${(error as Error).message}`, 500)
    }
}) 