import { Camera, CameraView } from "expo-camera";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ScanBoletoScreen() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  function handleBarCodeScanned({ data }: { data: string }) {
    router.replace({
      pathname: "/pagar",
      params: { code: data },
    });
  }

  if (hasPermission === null) {
    return (
      <View style={styles.center}>
        <Text>Solicitando permissão da câmera...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.center}>
        <Text>Permissão da câmera negada</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "code128"],
        }}
        onBarcodeScanned={handleBarCodeScanned}
      />

      <View style={styles.overlay}>
        <Text style={styles.instruction}>
          Aponte a câmera para o código do boleto
        </Text>

        <TouchableOpacity style={styles.cancel} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
    padding: 24,
  },
  instruction: {
    marginTop: 40,
    textAlign: "center",
    color: "#FFF",
    fontSize: 16,
  },
  cancel: {
    backgroundColor: "#000000AA",
    padding: 16,
    borderRadius: 12,
  },
  cancelText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "600",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
