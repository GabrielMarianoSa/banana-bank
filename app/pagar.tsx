import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../theme/colors";

export default function PagarScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string }>();

  const [code, setCode] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (params.code) {
      setCode(params.code);
    }
  }, [params.code]);

  function handlePay() {
    setLoading(true);
    setSuccess(false);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
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

        {success && (
          <Text style={styles.success}>Pagamento realizado com sucesso</Text>
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
});
