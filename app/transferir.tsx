import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../theme/colors";

export default function TransferirScreen() {
  const router = useRouter();
  const [bank, setBank] = useState("");
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleTransfer() {
    setLoading(true);
    setSuccess(false);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
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

        {success && (
          <Text style={styles.success}>
            Transferência realizada com sucesso
          </Text>
        )}
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
});
