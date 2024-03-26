import { Camera, CameraType } from "expo-camera";
import { useState } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function App() {
  const [tipo, setTipo] = useState(CameraType.back);
  const [permissao, solicitarPermissao] = Camera.useCameraPermissions();

  if (!permissao) {
    // As permissões da câmera ainda estão carregando
    return <View />;
  }

  if (!permissao.granted) {
    // As permissões da câmera ainda não foram concedidas
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          Precisamos da sua permissão para mostrar a câmera
        </Text>
      </View>
    );
  }

  function alternarTipoCamera() {
    setTipo((atual) =>
      atual === CameraType.back ? CameraType.front : CameraType.back
    );
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={tipo}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={alternarTipoCamera}>
            <Text style={styles.text}>Virar</Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});
