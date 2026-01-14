import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { debitAndRecordTransaction } from "../services/storage";
import { Colors } from "../theme/colors";

export default function TransferirScreen() {
  const router = useRouter();
  const [bank, setBank] = useState("");
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalSub, setModalSub] = useState("");

  function parseAmount(raw: string) {
    const normalized = (raw || "").trim().replace(/\./g, "").replace(/,/g, ".");
    const value = Number.parseFloat(normalized);
    if (!Number.isFinite(value) || value <= 0) return null;
    return value;
  }

  function handleTransfer() {
    setLoading(true);

    const parsed = parseAmount(amount);
    if (!parsed) {
      setLoading(false);
      setModalTitle("Ops");
      setModalSub("Informe um valor válido");
      setModalVisible(true);
      return;
    }

    setTimeout(async () => {
      try {
        const titleParts = [
          "Transferência",
          bank?.trim(),
          account?.trim(),
        ].filter((p) => !!p);
        const title =
          titleParts.length > 1 ? titleParts.join(" — ") : "Transferência";

        const result = await debitAndRecordTransaction({
          title,
          debitAmount: parsed,
        });

        setLoading(false);
        if (!result.ok) {
          if (result.reason === "NO_USER") router.replace("/login");
          else {
            setModalTitle("Ops");
            setModalSub(result.message);
            setModalVisible(true);
          }
          return;
        }

        setModalTitle("Transferência realizada");
        setModalSub("Transferência realizada com sucesso");
        setModalVisible(true);
      } catch {
        setLoading(false);
        setModalTitle("Ops");
        setModalSub("Erro ao transferir");
        setModalVisible(true);
      }
    }, 900);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Transferir</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Banco</Text>
        <TextInput
          style={styles.input}
          value={bank}
          onChangeText={setBank}
          placeholder="Nome do banco"
        />

        <Text style={styles.label}>Conta</Text>
        <TextInput
          style={styles.input}
          value={account}
          onChangeText={setAccount}
          placeholder="Agência / Conta"
        />

        <Text style={styles.label}>Valor</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="0,00"
        />

        <TouchableOpacity style={styles.button} onPress={handleTransfer}>
          {loading ? (
            <ActivityIndicator color={Colors.textBrown} />
          ) : (
            <Text style={styles.buttonText}>Confirmar transferência</Text>
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
