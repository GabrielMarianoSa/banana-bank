import cors from "cors";
import express from "express";
import paymentsRouter from "./routes/payments";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/payments", paymentsRouter);

app.get("/", (req, res) =>
  res.send({ ok: true, service: "banana-bank-backend" })
);

const port = process.env.PORT ?? 4000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${port}`);
});
