import React, { useState, useEffect } from "react";
import {
  View,
  Button,
  TextInput,
  Image,
  StyleSheet,
  Dimensions,
  Alert,
  StatusBar,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";

export default function App() {
  const [imagem, setImagem] = useState(null);
  const [localizacao, setLocalizacao] = useState(null);
  const [nome, setNome] = useState("");
  const [mapRegion, setMapRegion] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão negada",
          "Permissão para acessar a localização foi negada"
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocalizacao(location.coords);
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
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
      <View style={estilos.container}>
        <TextInput
          placeholder="Local"
          value={nome}
          onChangeText={setNome}
          style={estilos.entrada}
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

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  entrada: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: Dimensions.get("window").width * 0.8,
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
