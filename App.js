import { ethers } from 'ethers';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import SvgQRCode from 'react-native-qrcode-svg';

const private_key = process.env.PRIVATE_KEY;

// Instantiate a wallet.
const wallet = new ethers.Wallet(private_key);
console.log('wallet address: ', wallet.address, '\n');

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

  async function generateCode() {
    // Sign transaction.
    const signedTx = await wallet.signTransaction(unsignedTx);
    console.log("signedTx: ", signedTx);
  
    // Generate QR code from signed transaction.
    // setCode(signedTx);
    setCode(signedTx);
  }
  
  async function relayTx() {
    
  }

  return (
    <View style={styles.container}>
      <Text>myto</Text>
      <Button title="Generate Pairing Code" onClick={generateCode()}/>
      <Button title="Receive Pairing Code" onClick={relayTx()}/>
      <SvgQRCode value={code}/>
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
