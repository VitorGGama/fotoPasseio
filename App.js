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
  const [foto, setFoto] = useState(null);

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

  const escolherFoto = async () => {
    let resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!resultado.cancelled) {
      setFoto(resultado.uri);
    }
  };

  const acessarCamera = async () => {
    let imagem = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!imagem.cancelled) {
      setFoto(imagem.uri);
    }
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
        <Button title="Obter Localização" onPress={obterLocalizacao} />
        {mapRegion && (
          <MapView
            style={styles.map}
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
        {foto && <Image source={{ uri: foto }} style={styles.image} />}
        <Button title="Escolher Foto" onPress={escolherFoto} />
        <Button title="Tirar Foto" onPress={acessarCamera} />
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
  map: {
    width: "100%",
    height: "50%",
  },
  image: {
    width: 300,
    height: 300,
    marginTop: 20,
  },
});
