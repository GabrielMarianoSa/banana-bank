import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../theme/colors";

export default function Recarga() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Recarga</Text>
      </View>

      <Text style={styles.subtitle}>
        Funcionalidade para recarga de créditos.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 56,
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 0,
    paddingBottom: 8,
    paddingHorizontal: 0,
    marginBottom: 8,
  },
  back: { color: Colors.textSecondary, fontSize: 14 },
  title: { fontSize: 22, fontWeight: "700", color: Colors.textPrimary },
  subtitle: { marginTop: 8, color: Colors.textSecondary },
});
