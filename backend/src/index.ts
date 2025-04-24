import { Hono } from 'hono'

const app = new Hono()

app.post('/api/v1/user/signup', (c) => {
  return c.text('/api/v1/user/signup')
})

app.post('/api/v1/user/signin', (c) => {
  return c.text('/api/v1/user/signin')
})

app.post('/api/v1/blog', (c) => {
  return c.text('/api/v1/blog')
})

app.put('/api/v1/blog', (c) => {
  return c.text('/api/v1/blog')
})

app.get('/api/v1/blog/bulk', (c) => {
  return c.text('/api/v1/blog/bulk')
})

app.get('/api/v1/blog/:id', (c) => {
  return c.text('/api/v1/blog/:id')
})



export default app
