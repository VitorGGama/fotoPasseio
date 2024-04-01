import React, { useState, useEffect } from "react";
import {
  View,
  Pressable,
  TextInput,
  StyleSheet,
  StatusBar,
  Image,
  Text,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { AsyncStorage } from "react-native";
import { FlatList } from "react-native";

const { width, height } = Dimensions.get("window");

export default function App() {
  const [nome, setNome] = useState("");
  const [localizacao, setLocalizacao] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);
  const [foto, setFoto] = useState(null);
  const [fotoTirada, setFotoTirada] = useState(false);
  const [dataHoraFoto, setDataHoraFoto] = useState(null);
  const [lugares, setLugares] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(false);

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
    setLoadingLocation(true);
    try {
      let { coords } = await Location.getCurrentPositionAsync({});
      setLocalizacao(coords);
      setMapRegion({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      await AsyncStorage.setItem("ultimaLocalizacao", JSON.stringify(coords));
    } catch (error) {
      console.error("Erro ao obter localização:", error);
    } finally {
      setLoadingLocation(false);
    }
  };

  const escolherFoto = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert(
        "Permissão negada",
        "Permissão para acessar a galeria foi negada!"
      );
      return;
    }

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
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert(
        "Permissão negada",
        "Permissão para acessar a câmera foi negada!"
      );
      return;
    }

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
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      <StatusBar />
      <View style={styles.container}>
        <Text style={styles.title}>Foto passeio</Text>
        <TextInput
          placeholder="Digite o nome do local"
          placeholderTextColor="white"
          value={nome}
          onChangeText={setNome}
          style={styles.input}
        />
        <Pressable style={styles.button} onPress={obterLocalizacao}>
          <Text style={styles.buttonText}>Obter Localização</Text>
        </Pressable>
        {loadingLocation && <ActivityIndicator color="#fff" />}
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
        <View style={styles.photoContainer}>
          {foto && (
            <>
              <Image source={{ uri: foto }} style={styles.image} />
              {dataHoraFoto && (
                <Text style={styles.dateText}>{dataHoraFoto}</Text>
              )}
            </>
          )}
          {fotoTirada && (
            <Pressable style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color="white" />
              <Text style={styles.backButtonText}>Voltar</Text>
            </Pressable>
          )}
        </View>
        <Pressable style={styles.button} onPress={escolherFoto}>
          <Text style={styles.buttonText}>Escolher Foto</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={acessarCamera}>
          <Text style={styles.buttonText}>Tirar Foto</Text>
        </Pressable>
        <FlatList
          data={lugares}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View>
              <Text>{item.nome}</Text>
              <Image
                source={{ uri: item.foto }}
                style={{ width: 100, height: 100 }}
              />
            </View>
          )}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#111",
    alignItems: "center",
    paddingVertical: 40,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: width * 0.8,
    height: 50,
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    color: "#fff",
  },
  button: {
    width: width * 0.8,
    backgroundColor: "#007bff",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  map: {
    width: width * 0.8,
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  photoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  image: {
    width: width * 0.8,
    height: height * 0.4,
    borderRadius: 10,
    marginBottom: 10,
  },
  dateText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 10,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 10,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 5,
  },
});
