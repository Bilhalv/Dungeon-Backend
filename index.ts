import express from "express";
import foodsRoutes from "./routes/foods";
import carrinhoRoutes from "./routes/carrinho";
import loginRoutes from "./routes/login";
import recoveryRoutes from "./routes/recovery";
import registerRoutes from "./routes/register";
import monstersRoutes from "./routes/monsters";
import cors from "cors";

const app = express();
const port = 3004;

app.use(express.json());
app.use(cors());

app.use("/foods", foodsRoutes);
app.use("/carrinho", carrinhoRoutes);
app.use("/login", loginRoutes);
app.use("/recovery", recoveryRoutes);
app.use("/register", registerRoutes);
app.use("/monsters", monstersRoutes);

app.get("/", (req, res) => {
  res.send("API: Sistema de Gerenciamento de Restaurante");
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`);
});
