import React, { useState, useEffect } from "react";
import {
  View,
  Button,
  TextInput,
  StyleSheet,
  Alert,
  StatusBar,
  Image,
} from "react-native";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import * as ImagePicker from "expo-image-picker";

export default function App() {
  const [nome, setNome] = useState("");
  const [localizacao, setLocalizacao] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);

  useEffect(() => {
    (async () => {
      const { status: locationStatus } =
        await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== "granted") {
        Alert.alert(
          "Permissão negada",
          "Permissão para acessar a localização foi negada"
        );
        return;
      }

      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus !== "granted") {
        Alert.alert(
          "Permissão negada",
          "Permissão para acessar a câmera foi negada"
        );
        return;
      }
    })();
  }, []);

  const tirarFoto = async () => {
    let resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!resultado.canceled && typeof resultado.uri === "string") {
      const asset = await MediaLibrary.createAssetAsync(resultado.uri);
      setImagem(asset.uri); // Atualiza o estado para exibir a imagem
    }
  };

  const compartilharFoto = async () => {
    if (imagem && (await Sharing.isAvailableAsync())) {
      await Sharing.shareAsync(imagem);
    } else {
      Alert.alert(
        "Compartilhamento não disponível",
        "Não é possível compartilhar a foto no momento."
      );
    }
  };

  const obterLocalizacao = async () => {
    let { coords } = await Location.getCurrentPositionAsync({});
    setLocalizacao(coords);
    setMapRegion({
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
  };

  const voltar = () => {
    setImagem(null); // Isso irá remover a imagem da tela
  };

  return (
    <>
      <StatusBar />
      <View style={styles.container}>
        <TextInput
          placeholder="Digite o nome do local"
          value={nome}
          onChangeText={setNome}
          style={styles.input}
        />
        <Button title="Tirar Foto" onPress={tirarFoto} />
        {imagem ? (
          <>
            <Image source={{ uri: imagem }} style={estilos.imagem} />
            <Button title="Compartilhar Foto" onPress={compartilharFoto} />
            <Button title="Voltar" onPress={voltar} />
          </>
        ) : (
          <>
            <Button title="Obter Localização" onPress={obterLocalizacao} />
            {mapRegion && (
              <MapView
                style={estilos.mapa}
                region={mapRegion}
                showsUserLocation={true}
              >
                <Marker
                  coordinate={{
                    latitude: mapRegion.latitude,
                    longitude: mapRegion.longitude,
                  }}
                  title={nome}
                />
              </MapView>
            )}
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: "80%",
  },
  imagem: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  mapa: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.5,
  },
});
