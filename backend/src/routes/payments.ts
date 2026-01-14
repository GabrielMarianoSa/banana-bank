import { Router } from "express";
import { prisma } from "../prismaClient";

const router = Router();

function safeParseJson(value: string | null) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function toApiPayment(
  payment: { metadata: string | null } & Record<string, unknown>
) {
  return { ...payment, metadata: safeParseJson(payment.metadata) };
}

router.post("/", async (req, res) => {
  try {
    const { amount, method, metadata } = req.body;
    if (typeof amount !== "number" || !method) {
      return res.status(400).json({ error: "invalid payload" });
    }

    const payment = await prisma.payment.create({
      data: {
        amount,
        method,
        status: "pending",
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    res.status(201).json(toApiPayment(payment));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal error" });
  }
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: "invalid id" });
  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) return res.status(404).json({ error: "not found" });

  res.json(toApiPayment(payment));
});

// simulate webhook/confirmation
router.post("/:id/confirm", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    if (!["paid", "failed"].includes(status)) {
      return res.status(400).json({ error: "invalid status" });
    }

    const payment = await prisma.payment.update({
      where: { id },
      data: { status },
    });

    res.json(toApiPayment(payment));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal error" });
  }
});

export default router;
