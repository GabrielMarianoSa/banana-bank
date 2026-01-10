import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { fakeLogin } from "../services/fakeApi";
import { saveUser } from "../services/storage";
import { Assets } from "../theme/assets";
import { Colors } from "../theme/colors";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusField, setFocusField] = useState<"email" | "password" | null>(
    null
  );
  const [showPassword, setShowPassword] = useState(false);
  const emailRef = useRef<TextInput | null>(null);
  const passwordRef = useRef<TextInput | null>(null);

  async function handleLogin() {
    setLoading(true);
    setError("");

    try {
      const user = await fakeLogin(email, password);
      await saveUser(user);
      router.replace("/home");
    } catch (err: any) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoWrap}>
          <Image source={Assets.logo} style={styles.logo} />
        </View>
      </View>

      <View style={styles.card}>
        <Pressable
          onPress={() => emailRef.current?.focus()}
          style={[
            styles.inputWrap,
            focusField === "email" && styles.inputFocus,
          ]}
        >
          <MaterialCommunityIcons
            name="email-outline"
            size={18}
            color={
              focusField === "email" ? Colors.primary : Colors.textSecondary
            }
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            onFocus={() => setFocusField("email")}
            onBlur={() => setFocusField(null)}
            ref={emailRef}
          />
        </Pressable>

        <Pressable
          onPress={() => passwordRef.current?.focus()}
          style={[
            styles.inputWrap,
            focusField === "password" && styles.inputFocus,
          ]}
        >
          <MaterialCommunityIcons
            name="lock-outline"
            size={18}
            color={
              focusField === "password" ? Colors.primary : Colors.textSecondary
            }
          />
          <TextInput
            style={[styles.input, { flex: 1, borderWidth: 0, marginBottom: 0 }]}
            placeholder="Senha"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            onFocus={() => setFocusField("password")}
            onBlur={() => setFocusField(null)}
            ref={passwordRef}
          />
          <TouchableOpacity
            onPress={() => setShowPassword((s) => !s)}
            style={styles.eyeButton}
          >
            <MaterialCommunityIcons
              name={showPassword ? "eye-off" : "eye"}
              size={18}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          {loading ? (
            <ActivityIndicator color={Colors.textBrown} />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.hint}>teste@banana.com • 123456</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 140,
    height: 140,
    resizeMode: "contain",
  },
  card: {
    flex: 1,
    backgroundColor: Colors.card,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
  },
  input: {
    height: 48,
    paddingHorizontal: 8,
    fontSize: 16,
  },
  button: {
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  buttonText: {
    fontWeight: "600",
    color: Colors.textBrown,
  },
  error: {
    color: Colors.danger,
    marginBottom: 8,
  },
  hint: {
    marginTop: 16,
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  logoWrap: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.divider,
    height: 48,
    marginBottom: 12,
  },
  inputFocus: {
    borderColor: Colors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },
  eyeButton: {
    padding: 6,
  },
});
