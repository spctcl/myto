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
const deviceAddress = process.env.DEVICE_ACCOUNT_ADDRESS;

// Wallet
let wallet = new ethers.Wallet(private_key);
console.log('wallet.address: ', wallet.address, '\n');
wallet = wallet.connect(provider);
console.log("wallet provider: ", wallet.provider);

// Device pairing contract.
const pairingContract = new ethers.Contract(process.env.PAIRING_CONTRACT_ADDRESS, pairingABI, wallet);
console.log("pairingContract: ", pairingContract);

export default function App() {
  const [code, setCode] = useState("no_code");

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
 
  const generateCode = async ({}) => {
    const unsignedTx = createUnsignedTx();
    // Sign transaction.
    const signedTx = await wallet.signTransaction(unsignedTx);
    console.log("signedTx: ", signedTx);
  
    // Generate QR code from signed transaction.
    setCode(signedTx);
  };

  const scanQRCode = () => {
    setShowScanner(true);
  }

  // TODO: Embed signed message from device in transaction from user.
  // Use that to prove device identity.
  const createUnsignedTx = async () => {
     const to = process.env.PAIRING_CONTRACT_ADDRESS;
     const from = process.env.DEVICE_ACCOUNT_ADDRESS;
     const txCount= await provider.getTransactionCount(from);
     const nonce = ethers.utils.hexlify(txCount);
     const gasLimit = ethers.utils.hexlify(10000000);
     const gasPrice = ethers.utils.hexlify(1100000000);
     const chainId = 42;
     const data = pairingContract.interface.getFunction("pairDevice")
     const unsignedTx = new Transaction({
      to: to,
      nonce: nonce,
      gasLimit: gasLimit,
      gasPrice: gasPrice,
      data: data,
      chainId: chainId
     })
     console.log("unsignedTx: ", unsignedTx);

    return unsignedTx;
  }
  
  const relayTx = async () => {
    // Hardcoded transaction for testing relay without QR code/camera workflow.
    console.log("code/signedTxHex: ", code);
    await provider.sendTransaction(code);
  }

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setCode(data)
    alert(`Attempting to Pair Device with Signed Transaction: ${data}`);
    console.log("handleBarCodeScanned code: ", data);
    relayTx()
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
      <Button title="Pair Device" onPress={scanQRCode}/>
      {/* <Button title="Relay TX" onPress={relayTx}/> */}
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
