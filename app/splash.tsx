import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";

import { Assets } from "../theme/assets";
import { Colors } from "../theme/colors";

export default function SplashScreen() {
  const router = useRouter();

  const fullText = "Banana Bank";
  const [text, setText] = useState("");

  // animação de digitação
  useEffect(() => {
    let index = 0;

    const interval = setInterval(() => {
      setText(fullText.slice(0, index));
      index++;

      if (index > fullText.length) {
        clearInterval(interval);
      }
    }, 120);

    return () => clearInterval(interval);
  }, []);

  // timer para ir pro login
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/login");
    }, 2600);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <Image source={Assets.logo} style={styles.logo} />

      <Text style={styles.brand}>{text}</Text>

      <ActivityIndicator size="large" color={Colors.textBrown} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 220,
    height: 220,
    resizeMode: "contain",
    marginBottom: 24,
  },
  brand: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.textBrown,
    letterSpacing: 1,
    marginBottom: 32,
  },
});
