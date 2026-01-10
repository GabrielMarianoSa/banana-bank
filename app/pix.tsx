import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { getUser, saveUser } from "../services/storage";
import { Colors } from "../theme/colors";

export default function PixScreen() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  async function handleSend() {
    setLoading(true);
    setSuccess(false);

    // parse amount (allow comma or dot)
    const parsed = parseFloat(
      (amount || "").toString().replace(".", ".").replace(",", ".")
    );
    if (isNaN(parsed) || parsed <= 0) {
      setLoading(false);
      return;
    }

    setTimeout(async () => {
      try {
        const user = await getUser();
        if (!user) {
          setLoading(false);
          router.replace("/login");
          return;
        }

        const tx = {
          id: String(Date.now()),
          title: `Pix — ${key || "transferência"}`,
          amount: -Math.abs(parsed),
          date: new Date().toISOString(),
        };

        const updated = {
          ...user,
          balance: Math.max(0, (user.balance || 0) - Math.abs(parsed)),
          transactions: [tx].concat(user.transactions || []),
        };

        await saveUser(updated);
        setLoading(false);
        setSuccess(true);
      } catch (err) {
        console.warn(err);
        setLoading(false);
      }
    }, 800);
  }

  useEffect(() => {
    if (success) {
      scaleAnim.setValue(0);
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
      }).start();
      (async () => {
        try {
          const Haptics: any = await import("expo-haptics");
          Haptics.notificationAsync &&
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
      })();
    }
  }, [success, scaleAnim]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Pix</Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.label}>Chave Pix</Text>
        <TextInput
          style={styles.input}
          value={key}
          onChangeText={setKey}
          placeholder="CPF, email ou telefone"
        />

        <Text style={styles.label}>Valor</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="0,00"
        />

        <TouchableOpacity style={styles.button} onPress={handleSend}>
          {loading ? (
            <ActivityIndicator color={Colors.textBrown} />
          ) : (
            <Text style={styles.buttonText}>Enviar Pix</Text>
          )}
        </TouchableOpacity>

        <Modal visible={success} animationType="slide" transparent={true}>
          <View style={styles.successOverlay}>
            <Animated.View
              style={[
                styles.successCard,
                { transform: [{ scale: scaleAnim }] },
              ]}
            >
              <Text style={styles.successTitle}>Transferência realizada</Text>
              <Text style={styles.successSub}>
                Seu Pix foi enviado com sucesso.
              </Text>
              <TouchableOpacity
                style={styles.successButton}
                onPress={() => {
                  setSuccess(false);
                  router.replace("/home");
                }}
              >
                <Text style={styles.buttonText}>Entendi!</Text>
              </TouchableOpacity>
            </Animated.View>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
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
