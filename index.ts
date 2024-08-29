import express from 'express'
import foodsRoutes from './routes/foods'
import cors from 'cors'
const app = express()
const port = 3004

app.use(express.json())
app.use(cors())

app.use("/foods", foodsRoutes)

app.get('/', (req, res) => {
  res.send('API: Sistema de Gerenciamento de Restaurante')
})

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`)
})