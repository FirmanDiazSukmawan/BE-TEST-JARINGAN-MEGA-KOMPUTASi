import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import helmet from "helmet"
import mainRouter from "./router/mainRouter.js"


const app = express()
const port =  3000

app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(mainRouter);
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.status(200).json({
    message: "server ready to use",
  });
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
