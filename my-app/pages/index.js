import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "@/styles/Home.module.css";
import { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS } from "@/constants";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [isOwner, setIsOwner] = useState(false);
  const [presaleStarted, setPresaleStarted] = useState(false);
  const [presaleEnded, setPresaleEnded] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const web3ModalRef = useRef();

  const getOwner = async () => {
    try {
      const signer = await getProviderOrSigner();

      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );

      const owner = nftContract.owner();
      const userAddress = nftContract.address();

      if (userAddress.toLowerCase() == owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const checkIfPresaleEnded = async () => {
    try {
      const provider = await getProviderOrSigner();

      //get an instance of nft contract
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );

      //this will return a BigNumber because presaleEnded is uint256
      //this will return timestamp in seconds
      const presaleEndTime = await nftContract.presaleEnded();
      const currentTimeInSeconds = Date.now() / 1000;
      const hasPresaleEnded = presaleEndTime.lt(
        Math.floor(currentTimeInSeconds)
      );

      setPresaleEnded(hasPresaleEnded);
    } catch (error) {
      console.error(error);
    }
  };
  const startPresale = async () => {
    try {
      const signer = await getProviderOrSigner();

      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );

      const txn = await nftContract.startPresale();
      await txn.wait();

      setPresaleStarted(true);
    } catch (error) {
      console.error(error);
    }
  };

  const checkIfPresaleStarted = async () => {
    try {
      const provider = await getProviderOrSigner();

      //get an instance of nft contract
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );

      const isPresaleStarted = await nftContract.presaleStarted();
      setPresaleStarted(isPresaleStarted);
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.error(error);
    }
  };

  const getProviderOrSigner = async (needSigner = false) => {
    //we need to gain access to the provider/signer of metamask
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    //if user is not connected to goerli,tell them to swtich to goerli
    const { chainId } = await web3Provider.getNetwork();
    if (chainId != 5) {
      window.alert("Please switch to goerli network");
      throw new error("Incorrect network");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      checkIfPresaleStarted();
    }
  }, []);
  return (
    <div>
      <Head>
        <title>Crypto Devs NFT</title>
      </Head>
      <div className={styles.main}>
        {walletConnected ? null : (
          <button onClick={connectWallet} className={styles.button}>
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}
