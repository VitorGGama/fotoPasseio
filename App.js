import React, { useState, useEffect } from "react";
import {
  View,
  Button,
  TextInput,
  StyleSheet,
  Alert,
  StatusBar,
  Image,
  Text,
  ScrollView,
} from "react-native";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import * as ImagePicker from "expo-image-picker";

export default function App() {
  const [nome, setNome] = useState("");
  const [localizacao, setLocalizacao] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);
  const [foto, setFoto] = useState(null);
  const [fotoTirada, setFotoTirada] = useState(false);
  const [dataHoraFoto, setDataHoraFoto] = useState(null);

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
    // Pedir permissão para acessar a galeria
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert(
        "Permissão negada",
        "Permissão para acessar a galeria foi negada!"
      );
      return;
    }

    // Selecionar a imagem
    let resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!resultado.cancelled) {
      setFoto(resultado.uri);
      setFotoTirada(true);
      setDataHoraFoto(new Date().toLocaleString());
    }
  };

  const acessarCamera = async () => {
    // Pedir permissão para acessar a câmera
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert(
        "Permissão negada",
        "Permissão para acessar a câmera foi negada!"
      );
      return;
    }

    // Tirar a foto
    let imagem = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!imagem.cancelled) {
      setFoto(imagem.assets[0].uri);
      setFotoTirada(true);
      setDataHoraFoto(new Date().toLocaleString());
    }
  };

  const handleBack = () => {
    setFoto(null);
    setFotoTirada(false);
    setDataHoraFoto(null);
  };

  return (
    <>
      <StatusBar />
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.container}>
          <TextInput
            placeholder="local"
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
          {foto && (
            <>
              <Image
                source={{ uri: foto }}
                style={[styles.image, { resizeMode: "contain" }]}
              />
              {dataHoraFoto && <Text>Data e Hora: {dataHoraFoto}</Text>}
            </>
          )}
          {fotoTirada && <Button title="Voltar" onPress={handleBack} />}
          <Button title="Escolher Foto" onPress={escolherFoto} />
          <Button title="Tirar Foto" onPress={acessarCamera} />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  input: {
    height: 50,
    width: "100%",
    marginVertical: 15,
    borderWidth: 1,
    padding: 10,
    borderColor: "#ddd",
    borderRadius: 10,
  },
  map: {
    width: "100%",
    height: 300,
    marginVertical: 15,
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
    borderWidth: 3,
    borderColor: "#007bff",
  },
});
