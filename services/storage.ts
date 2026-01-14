import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_KEY = "@banana_user";

export const INSUFFICIENT_FUNDS_MESSAGE =
  "ops, você não tem saldo para essa transação!";

export async function saveUser(user: any) {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getUser() {
  const data = await AsyncStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
}

export async function removeUser() {
  await AsyncStorage.removeItem(USER_KEY);
}

type DebitResultOk = { ok: true; user: any };
type DebitResultErr = {
  ok: false;
  reason: "NO_USER" | "INVALID_AMOUNT" | "INSUFFICIENT_FUNDS";
  message: string;
};

function normalizeDebitAmount(value: number) {
  if (!Number.isFinite(value)) return null;
  const abs = Math.abs(value);
  if (abs <= 0) return null;
  return abs;
}

export async function debitAndRecordTransaction(input: {
  title: string;
  debitAmount: number; // positive in R$
}): Promise<DebitResultOk | DebitResultErr> {
  const debit = normalizeDebitAmount(input.debitAmount);
  if (!debit) {
    return { ok: false, reason: "INVALID_AMOUNT", message: "Valor inválido" };
  }

  const user = await getUser();
  if (!user) {
    return {
      ok: false,
      reason: "NO_USER",
      message: "Usuário não autenticado",
    };
  }

  const currentBalance =
    typeof user.balance === "number" && Number.isFinite(user.balance)
      ? user.balance
      : 0;

  if (currentBalance < debit) {
    return {
      ok: false,
      reason: "INSUFFICIENT_FUNDS",
      message: INSUFFICIENT_FUNDS_MESSAGE,
    };
  }

  const tx = {
    id: String(Date.now()),
    title: input.title,
    amount: -debit,
    date: new Date().toISOString(),
  };

  const updated = {
    ...user,
    balance: currentBalance - debit,
    transactions: [tx].concat(user.transactions || []),
  };

  await saveUser(updated);
  return { ok: true, user: updated };
}
