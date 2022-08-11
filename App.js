import { ethers } from 'ethers';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { StatusBar } from 'expo-status-bar';
import pairingABI from './DevicePairing.json' assert { type: 'json' };
import React, { useState, useEffect } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import SvgQRCode from 'react-native-qrcode-svg';

const private_key = process.env.PRIVATE_KEY;

// RPC Provider.
const provider = new ethers.providers.InfuraProvider("kovan", process.env.INFURA_KOVAN_ENDPOINT);
const owner = process.env.OWNER_ADDRESS;

// Wallet
let wallet = new ethers.Wallet(private_key);
console.log('wallet.address: ', wallet.address, '\n');
wallet = wallet.connect(provider);
console.log("wallet provider: ", wallet.provider);

// Device pairing contract.
const pairingContract = new ethers.Contract(process.env.PAIRING_CONTRACT_ADDRESS, pairingABI, wallet);
console.log("pairingContract: ", pairingContract);
const address = process.env.PAIRING_CONTRACT_ADDRESS;
const contract = {address: process.env.PAIRING_CONTRACT_ADDRESS}
// const contract = new ethers.Contract(address, abi, wallet); // TODO: The contract ABI must be supplied.

// Transaction to be signed.
const unsignedTx = {
  to: contract.address,
  value: ethers.utils.parseEther('0.1'),
  gasLimit: 10000000,
  gasPrice: "0x07f9acf02",
  nonce: 1,
  chainId: 42,
}
console.log("unsignedTx: ", unsignedTx);

export default function App() {
  const [code, setCode] = useState("none");

  // Camera permissions.
  const [showScanner, setShowScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    
    getBarCodeScannerPermissions();  
  }, []);
 
  const generateCode = async () => {
    // Sign transaction.
    const signedTx = await wallet.signTransaction(unsignedTx);
    console.log("signedTx: ", signedTx);
  
    // Generate QR code from signed transaction.
    // setCode(signedTx);
    setCode(signedTx);
  };

  const scanQRCode = () => {
    setShowScanner(true);
  }
  
  const relayTx = async () => {
    // Hardcoded transaction for testing relay without QR code/camera workflow.
    const signedTxHex = '0xf85803847f9acf02839896808088016345785d8a00008077a0e63324ad48ee7a61828d0bb04baf378d5dbfd6ee9e6816d71966b422bcd4d3dca03032b2ab9b5bcab0028af4112748154fa5c4aa7af87e999ee7749c651f068f40';
    console.log(signedTxHex);
    await provider.sendTransaction(signedTxHex);
  }

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Text>myto</Text>
      <Button title="Generate Pairing Code" onPress={generateCode}/>
      <Button title="Scan Pairing Code" onPress={scanQRCode}/>
      <Button title="Relay TX" onPress={relayTx}/>
      <SvgQRCode value={code}/>
  
      { showScanner ? <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
        /> : null }
        {showScanner && <Button title={'Cancel Scan'} onPress={() => setShowScanner(false)} />}
        {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
