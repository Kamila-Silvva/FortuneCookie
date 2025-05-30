import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions, Platform, Alert, StatusBar } from 'react-native';
import { Accelerometer } from 'expo-sensors';

// --- Configuração Inicial das Imagens ---
const closedCookieImage = require('./assets/biscoito_fechado.png');
const openCookieImage = require('./assets/biscoito_aberto.png');

// --- Frases da Sorte ---
const fortunes = [
  "Deixe de esperar. Comece a criar. AGORA.",
  "Disseram que era impossível? Ótimo. Esfregue o sucesso na cara deles.",
  "Sua energia atrai sua tribo. Certifique-se de que seja uma tribo de gigantes.",
  "Não apenas quebre as regras. Reescreva o manual do jogo.",
  "O universo está assistindo. Dê a ele um show que valha a pena.",
  "Menos dúvida, mais atitude. O resto é só barulho de fundo.",
  "Hoje é um excelente dia para começar a construir seu império.",
  "A sorte não é para os fracos. Vá lá e arranque o que é seu.",
  "Alerta de spoiler: você está prestes a ser incrível.",
  "Plano A falhou? Relaxe. O alfabeto tem mais um monte de letras e sua criatividade é infinita.",
  "'Normal' é só uma configuração na máquina de lavar. Não se aplique.",
  "Não peça permissão. Faça acontecer e, se reclamarem, dobre a aposta.",
  "O medo é uma reação. A coragem é uma decisão. Qual você escolhe HOJE?",
  "Alguns procuram o caminho. Os fodas constroem a própria estrada e ainda cobram pedágio.",
  "Seja a tempestade que faz todo mundo procurar abrigo. Com admiração.",
  "O roteiro da sua vida? Quem escreve é VOCÊ. Capriche na caneta.",
  "Se a vida te der limões, faça uma caipirinha e venda o dobro do preço.",
  "Não se contente com migalhas quando você pode ter o banquete inteiro."
];

const lightThemeColors = {
  background: '#FFF8E1',
  titleText: '#8B4513',  
  instructionsText: '#A0522D',
  fortuneContainerBackground: '#FFFFFF',
  fortuneContainerBorder: '#E0E0E0', 
  fortuneTitleText: '#A0522D', 
  fortuneText: '#4A4A4A', 
  buttonResetBackground: '#795548', 
  buttonText: '#FFFFFF',
  themeToggleText: '#795548', 
  statusBar: 'dark-content',
};


const darkThemeColors = {
  background: '#121212', 
  titleText: '#E0E0E0', 
  instructionsText: '#B0B0B0', 
  fortuneContainerBackground: '#1E1E1E', 
  fortuneContainerBorder: '#424242',
  fortuneTitleText: '#E0E0E0',
  fortuneText: '#CCCCCC',
  buttonResetBackground: '#333333',
  buttonText: '#E0E0E0',
  themeToggleText: '#E0E0E0', 
  statusBar: 'light-content',
};

const getStyles = (isDarkMode) => {
  const currentTheme = isDarkMode ? darkThemeColors : lightThemeColors;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.background,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
      paddingBottom: 20,
      paddingHorizontal: 20,
    },
    themeToggleContainer: {
      position: 'absolute',
      top: Platform.OS === 'android' ? StatusBar.currentHeight + 5 : 40,
      right: 15,
      zIndex: 1,
    },
    themeToggleButton: {
      backgroundColor: 'transparent',
      padding: 8,
    },
    themeToggleText: {
      fontSize: 28,
      color: currentTheme.themeToggleText,
    },
    title: {
      fontSize: 30,
      fontWeight: 'bold',
      color: currentTheme.titleText,
      marginBottom: 15,
      textAlign: 'center',
    },
    instructions: {
      fontSize: 16,
      color: currentTheme.instructionsText,
      marginBottom: 20,
      textAlign: 'center',
    },
    cookieImage: {
      width: width * 0.65,
      height: width * 0.65 * (250/300),
      resizeMode: 'contain',
      marginBottom: 20,
    },
    fortuneContainer: {
      backgroundColor: currentTheme.fortuneContainerBackground,
      borderRadius: 15,
      paddingVertical: 20,
      paddingHorizontal: 25,
      marginVertical: 20,
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: isDarkMode ? 1 : 3 },
      shadowOpacity: isDarkMode ? 0.15 : 0.25, 
      shadowRadius: isDarkMode ? 2 : 3.84,  
      elevation: isDarkMode ? 3 : 6,  
      minWidth: '95%',
      maxWidth: '95%',
      borderWidth: 1,
      borderColor: currentTheme.fortuneContainerBorder,
    },
    fortuneTextTitle: {
      fontSize: 17,
      fontWeight: 'bold',
      color: currentTheme.fortuneTitleText,
      marginBottom: 10,
    },
    fortuneText: {
      fontSize: 19,
      color: currentTheme.fortuneText,
      textAlign: 'center',
      fontStyle: 'italic',
      lineHeight: 26,
    },
    button: {
      borderRadius: 25,
      paddingVertical: 15,
      paddingHorizontal: 30,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDarkMode ? 0.1 : 0.20,
      shadowRadius: isDarkMode ? 1.5 : 2.5,
      elevation: isDarkMode ? 2 : 4,
      marginTop: 15,
      minWidth: '70%',
    },
    resetButton: {
      backgroundColor: currentTheme.buttonResetBackground,
    },
    buttonText: {
      color: currentTheme.buttonText,
      fontSize: 18,
      fontWeight: 'bold',
    },
  });
};

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const styles = getStyles(isDarkMode);

  const [isCookieBroken, setIsCookieBroken] = useState(false);
  const [currentFortune, setCurrentFortune] = useState('');
  const [imageSource, setImageSource] = useState(closedCookieImage);

  const [shakeData, setShakeData] = useState({});
  const [subscription, setSubscription] = useState(null);
  const SHAKE_THRESHOLD = 3.0;
  const hasShakenToBreak = useRef(false);

  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  useEffect(() => {
    StatusBar.setBarStyle(isDarkMode ? darkThemeColors.statusBar : lightThemeColors.statusBar, true);
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(isDarkMode ? darkThemeColors.background : lightThemeColors.background, true);
    }
  }, [isDarkMode]);


  const handleCookieInteraction = () => {
    if (!isCookieBroken) {
      setIsCookieBroken(true);
      setImageSource(openCookieImage);
    }
    const randomIndex = Math.floor(Math.random() * fortunes.length);
    setCurrentFortune(fortunes[randomIndex]);
  };

  const resetCookie = () => {
    setIsCookieBroken(false);
    setCurrentFortune('');
    setImageSource(closedCookieImage);
    hasShakenToBreak.current = false;
    setShakeData({});
  };

  const _subscribeToAccelerometer = async () => {
    const isAvailable = await Accelerometer.isAvailableAsync();
    if (isAvailable) {
      Accelerometer.setUpdateInterval(200);
      setSubscription(
        Accelerometer.addListener(accelerometerData => {
          setShakeData(accelerometerData);
        })
      );
    } else {
      if (Platform.OS !== 'web') {
        Alert.alert("Sensor Indisponível", "O acelerômetro não está disponível neste dispositivo.");
      }
      console.log("Acelerômetro não disponível.");
    }
  };

  const _unsubscribeFromAccelerometer = () => {
    if (subscription) {
      subscription.remove();
      setSubscription(null);
    }
  };

  useEffect(() => {
    if (!isCookieBroken) {
      hasShakenToBreak.current = false;
      _subscribeToAccelerometer();
    } else {
      _unsubscribeFromAccelerometer();
    }
    return () => _unsubscribeFromAccelerometer();
  }, [isCookieBroken]);

  useEffect(() => {
    if (!shakeData.x || !shakeData.y || !shakeData.z || isCookieBroken || hasShakenToBreak.current) {
      return;
    }
    const { x, y, z } = shakeData;
    const totalForce = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));

    if (totalForce > SHAKE_THRESHOLD) {
      if (!isCookieBroken && !hasShakenToBreak.current) {
        console.log('Telefone chacoalhado! Quebrando o biscoito.', totalForce);
        hasShakenToBreak.current = true;
        handleCookieInteraction();
      }
    }
  }, [shakeData, isCookieBroken]);

  return (
    <View style={styles.container}>
      <View style={styles.themeToggleContainer}>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeToggleButton}>
          <Text style={styles.themeToggleText}>{isDarkMode ? "☀️" : "🌙"}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Biscoito da Sorte Virtual</Text>
      <Text style={styles.instructions}>
        {isCookieBroken
          ? "Clique no biscoito para outra sorte!"
          : "Clique no biscoito ou agite o celular para quebrar!"}
      </Text>

      <TouchableOpacity onPress={handleCookieInteraction} activeOpacity={0.7}>
        <Image source={imageSource} style={styles.cookieImage} onError={(e) => console.log("Erro ao carregar imagem local:", e.nativeEvent.error)}/>
      </TouchableOpacity>

      {isCookieBroken && currentFortune ? (
        <View style={styles.fortuneContainer}>
          <Text style={styles.fortuneTextTitle}>Sua Sorte de Hoje:</Text>
          <Text style={styles.fortuneText}>{currentFortune}</Text>
        </View>
      ) : null}

      {isCookieBroken && (
        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={resetCookie}
        >
          <Text style={styles.buttonText}>Novo Biscoito</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const { width } = Dimensions.get('window');
