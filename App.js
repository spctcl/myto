import { ethers } from 'ethers';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Permissions } from 'expo-barcode-scanner';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import SvgQRCode from 'react-native-qrcode-svg';

const private_key = process.env.PRIVATE_KEY;

// Instantiate a wallet.
const wallet = new ethers.Wallet(private_key);
console.log('wallet address: ', wallet.address, '\n');

// Instantiate JSON RPC provider.
const provider = new ethers.providers.InfuraProvider("kovan", process.env.INFURA_KOVAN_ENDPOINT);

const owner = process.env.OWNER_ADDRESS;

// Instantiate the contract for device pairing.
const address = process.env.PAIRING_CONTRACT;
const contract = {address: process.env.CONTRACT_ADDRESS}
// const contract = new ethers.Contract(address, abi, wallet); // TODO: The contract ABI must be supplied.

// Create the transaction to be signed.
const unsignedTx = {
  to: contract.address,
  value: ethers.utils.parseEther('0.1'),
  gasLimit: 10000000,
  gasPrice: "0x07f9acf02",
  nonce: 3,
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
    console.log("showScanner: ", setShowScanner);
    setShowScanner(true);
  }
  
  const relayTx = () => {
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
