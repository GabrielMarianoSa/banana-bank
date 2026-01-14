import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  confirmPayment,
  createPayment,
  isDemoMode,
} from "../services/backendApi";
import { debitAndRecordTransaction, getUser } from "../services/storage";
import { Colors } from "../theme/colors";

export default function PagarScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string }>();

  const [code, setCode] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalSub, setModalSub] = useState("");

  useEffect(() => {
    if (params.code) {
      setCode(params.code);
    }
  }, [params.code]);

  function parseAmountToCents(raw: string) {
    // supports formats like: 10,50 / 10.50 / 1.234,56
    const normalized = raw
      .trim()
      .replace(/\./g, "")
      .replace(/,/g, ".")
      .replace(/\s/g, "");
    const value = Number.parseFloat(normalized);
    if (!Number.isFinite(value) || value <= 0) return null;
    return Math.round(value * 100);
  }

  async function handlePay() {
    setLoading(true);
    setModalVisible(false);

    const cents = parseAmountToCents(amount);
    if (!cents) {
      setLoading(false);
      setModalTitle("Ops");
      setModalSub("Informe um valor válido");
      setModalVisible(true);
      return;
    }

    if (!code.trim()) {
      setLoading(false);
      setModalTitle("Ops");
      setModalSub("Informe o código de barras");
      setModalVisible(true);
      return;
    }

    const debitAmount = cents / 100;
    try {
      const user = await getUser();
      if (!user) {
        setLoading(false);
        router.replace("/login");
        return;
      }

      const currentBalance =
        typeof user.balance === "number" && Number.isFinite(user.balance)
          ? user.balance
          : 0;
      if (currentBalance < debitAmount) {
        setLoading(false);
        setModalTitle("Ops");
        setModalSub("ops, você não tem saldo para essa transação!");
        setModalVisible(true);
        return;
      }
    } catch {
      // ignore balance check errors and let flow fail gracefully below
    }

    try {
      const payment = await createPayment({
        amount: cents,
        method: "boleto",
        metadata: { barcode: code.trim() },
      });

      // In demo mode we still simulate the confirmation step;
      // in backend mode, this endpoint is also a simulation.
      if (isDemoMode()) {
        await new Promise((r) => setTimeout(r, 600));
      }
      const confirmed = await confirmPayment(payment.id, "paid");

      if (confirmed.status !== "paid") {
        setModalTitle("Ops");
        setModalSub("Pagamento falhou. Tente novamente.");
        setModalVisible(true);
        return;
      }

      const debited = await debitAndRecordTransaction({
        title: "Pagamento — boleto",
        debitAmount,
      });
      if (!debited.ok) {
        if (debited.reason === "NO_USER") router.replace("/login");
        else {
          setModalTitle("Ops");
          setModalSub(debited.message);
          setModalVisible(true);
        }
      } else {
        setModalTitle("Pagamento realizado");
        setModalSub("Pagamento realizado com sucesso");
        setModalVisible(true);
      }
    } catch (e) {
      setModalTitle("Ops");
      setModalSub(
        e instanceof Error ? e.message : "Erro ao processar pagamento"
      );
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Pagar</Text>
      </View>

      {/* CARD */}
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => router.push("/scan-boleto" as any)}
        >
          <Text style={styles.scanText}>Escanear código de barras</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Código de barras</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite o código"
          value={code}
          onChangeText={setCode}
        />

        <Text style={styles.label}>Valor</Text>
        <TextInput
          style={styles.input}
          placeholder="0,00"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <TouchableOpacity style={styles.button} onPress={handlePay}>
          {loading ? (
            <ActivityIndicator color={Colors.textBrown} />
          ) : (
            <Text style={styles.buttonText}>Confirmar pagamento</Text>
          )}
        </TouchableOpacity>

        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View style={styles.successOverlay}>
            <View style={styles.successCard}>
              <Text style={styles.successTitle}>{modalTitle}</Text>
              <Text style={styles.successSub}>{modalSub}</Text>
              <TouchableOpacity
                style={styles.successButton}
                onPress={() => {
                  setModalVisible(false);
                  router.replace("/home");
                }}
              >
                <Text style={styles.buttonText}>Entendi!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: 24,
  },
  back: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  title: {
    marginTop: 16,
    fontSize: 26,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  card: {
    marginTop: 32,
    marginHorizontal: 16,
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    elevation: 4,
  },
  scanButton: {
    marginBottom: 16,
  },
  scanText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  label: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonText: {
    fontWeight: "600",
    color: Colors.textBrown,
  },
  success: {
    marginTop: 16,
    color: Colors.success,
    textAlign: "center",
    fontWeight: "600",
  },
  error: {
    marginTop: 16,
    color: Colors.danger,
    textAlign: "center",
    fontWeight: "600",
  },
  successOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  successCard: {
    width: "84%",
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 14,
    alignItems: "center",
    elevation: 6,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  successSub: {
    marginTop: 8,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  successButton: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
});
