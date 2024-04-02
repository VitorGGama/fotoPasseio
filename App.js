import React, { useState, useEffect } from "react";
import {
  View,
  Pressable,
  TextInput,
  StyleSheet,
  Alert,
  StatusBar,
  Image,
  Text,
  ScrollView,
  Dimensions,
} from "react-native";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { AsyncStorage } from "react-native"; // Adicionando import do AsyncStorage
import { FlatList } from "react-native"; // Adicionando import da FlatList

const { width, height } = Dimensions.get("window");

export default function App() {
  // Definição dos estados usando useState
  const [nome, setNome] = useState("");
  const [localizacao, setLocalizacao] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);
  const [foto, setFoto] = useState(null);
  const [fotoTirada, setFotoTirada] = useState(false);
  const [dataHoraFoto, setDataHoraFoto] = useState(null);
  const [lugares, setLugares] = useState([]); // Adicionando estado para armazenar os lugares visitados

  // Efeito colateral para obter permissões de localização e câmera ao carregar o componente
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

  // Função para obter a localização atual e salvar no AsyncStorage
  const obterLocalizacao = async () => {
    let { coords } = await Location.getCurrentPositionAsync({});
    setLocalizacao(coords);
    setMapRegion({
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });

    await AsyncStorage.setItem("ultimaLocalizacao", JSON.stringify(coords));
  };

  // Função para escolher uma foto da galeria
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

    if (!resultado.canceled) {
      setFoto(resultado.uri);
      setFotoTirada(true);
      setDataHoraFoto(new Date().toLocaleString());
    }
  };

  // Função para acessar a câmera e tirar uma foto
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

    if (!imagem.canceled) {
      setFoto(imagem.assets[0].uri);
      setFotoTirada(true);
      setDataHoraFoto(new Date().toLocaleString());
    }
  };

  // Função para lidar com o retorno para a foto anterior
  const handleBack = () => {
    setFoto(null);
    setFotoTirada(false);
    setDataHoraFoto(null);
  };

  // Renderização do componente
  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      <>
        <StatusBar />

        {/* View principal do aplicativo */}
        <View style={styles.container}>
          {/* Título do aplicativo */}
          <Text style={styles.title}>Foto passeio</Text>

          {/* Input para inserir o nome do local */}
          <TextInput
            placeholder="Digite o nome do local"
            placeholderTextColor="white"
            value={nome}
            onChangeText={setNome}
            style={styles.input}
          />

          {/* Botão para obter a localização */}
          <Pressable style={styles.button} onPress={obterLocalizacao}>
            <Text style={styles.buttonText}>Obter Localização</Text>
          </Pressable>

          {/* Mapa para exibir a localização atual */}
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

          {/* Container para exibir a foto */}
          <View style={styles.photoContainer}>
            {foto && (
              <>
                <Image source={{ uri: foto }} style={styles.image} />
                {dataHoraFoto && (
                  <Text style={styles.dateText}>{dataHoraFoto}</Text>
                )}
              </>
            )}
            {/* Botão para voltar para a foto anterior */}
            {fotoTirada && (
              <Pressable style={styles.backButton} onPress={handleBack}>
                <Ionicons name="arrow-back" size={24} color="white" />
                <Text style={styles.backButtonText}>Voltar</Text>
              </Pressable>
            )}
          </View>

          {/* Botão para escolher uma foto da galeria */}
          <Pressable style={styles.button} onPress={escolherFoto}>
            <Text style={styles.buttonText}>Escolher Foto</Text>
          </Pressable>

          {/* Botão para acessar a câmera e tirar uma foto */}
          <Pressable style={styles.button} onPress={acessarCamera}>
            <Text style={styles.buttonText}>Tirar Foto</Text>
          </Pressable>

          {/* Lista de lugares visitados */}
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
      </>
    </ScrollView>
  );
}

// Estilos do componente
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
