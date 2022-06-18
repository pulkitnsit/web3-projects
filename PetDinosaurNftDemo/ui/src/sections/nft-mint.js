import { useEffect, useState, useRef } from 'react';
import { Button, Box, Container, Flex, Text, Heading, Image } from 'theme-ui';

import callImage from 'assets/dinosaur-nft.png';
import contract from 'contracts/PtDemoDinosaur.json'

// import Web3 from "web3";
import Web3Modal from "web3modal";
// import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers } from 'ethers';


const NftMint = () => {

  const contractAddress = "0xDCD6a0B18E2EDB45D22E7F68f9e004259058db50"
  // const contractAddress = "0x5c0F91450E380a8E6a70D97e04cA4c25b26acadF"
  const abi = contract.abi
  const [nftPrice, setNftPrice] = useState(null)
  const [nftRemaining, setNftRemaining] = useState(null)
  // const [maxSupply, setMaxSupply] = useState(null)
  const [nftStatus, setNftStatus] = useState(null)
  
  const saleLimit = useRef(null)
  const startTime = useRef(null)
  const userContract = useRef(null)
  const generalContract = useRef(null)
  const maxSupply = 30
  let pSaleLimit = 0

  useEffect(() => {
    // console.log("In 1st useEffect")
    const provider = new ethers.providers.JsonRpcProvider({
      "url": "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
    })
    const contract = new ethers.Contract(contractAddress, abi, provider)
    generalContract.current = contract
    // console.log("In 1st useEffect mid")
    setInitialValue()
    // loadData()
    // console.log("In 1st useEffect end")
  }, [])

  useEffect(() => {
    // console.log("In 2nd useEffect")
    const interval = setInterval(() => {
      loadData()
    }, 10000);
    // console.log("In 2nd useEffect end")
    return () => clearInterval(interval);
  }, []);

  // function callback(event) {
  //   console.log(event);  // Problem: Every hooked variables are null here
  // }

  // useEffect(() => {
  //   if(account && _contract){
  //     _contract.events.MyEvent().on("data",(e) => callback(e)); 
  //   }
     
  //   return () => {
  //      //unscubscribe here
  //   }
  // }, [account, _contract])

  async function setInitialValue() {
    // console.log("setInitialValue start")
    const contract = generalContract.current
    const _saleConfig = await contract.saleConfig()
    // console.log(_saleConfig)
    // console.log(_saleConfig.startTime.toString())
    // console.log(ethers.utils.parseUnits(_saleConfig.startTime))
    startTime.current = _saleConfig.startTime
    const _saleLimit = await contract.publicSaleLimit()
    // console.log(_saleLimit)
    saleLimit.current = _saleLimit
    // console.log("saleLimit.current: " + saleLimit.current)
    // console.log("setInitialValue end")
    loadData()
  }

  async function loadData() {
    console.log("loadData start")
    const contract = generalContract.current
    const price = await contract.getPrice()
    const ethPrice = ethers.utils.formatUnits(price.toString(), 'ether')
    const parsePrice = ethers.utils.parseUnits(price.toString(), 'ether')
    // console.log("price " + price + " ethPrice: " + ethPrice + " parsePrice: " + parsePrice)
    setNftPrice(ethPrice)

    const totalSupply = await contract.totalSupply()
    
    // console.log(saleLimit.current - totalSupply)
    setNftRemaining(saleLimit.current - totalSupply)
    
    const saleStatus = await contract.getSaleStatus()
    // console.log(saleStatus)
    setNftStatus(saleStatus)
    // console.log("loadData end")
    // const nftMaxSupply = await contract.MAXSUPPLY()
    // console.log(nftMaxSupply)

    // console.log(publicSaleLimit)
    // setMaxSupply(publicSaleLimit)
  }

  async function mintNft() {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)

    const price = ethers.utils.parseUnits(nftPrice.toString(), 'ether')
    const transaction = await contract.publicSaleMint(1, {value: price})
    await transaction.wait()
  }

  // async function loadNFTs() {
  //   /* create a generic provider and query for unsold market items */
  //   const provider = new ethers.providers.JsonRpcProvider()
  //   const contract = new ethers.Contract(contractAddress, abi, provider)
  //   const data = await contract.fetchMarketItems()

  //   /*
  //   *  map over items returned from smart contract and format 
  //   *  them as well as fetch their token metadata
  //   */
  //   const items = await Promise.all(data.map(async i => {
  //     const tokenUri = await tokenContract.tokenURI(i.tokenId)
  //     const meta = await axios.get(tokenUri)
  //     let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
  //     let item = {
  //       price,
  //       tokenId: i.tokenId.toNumber(),
  //       seller: i.seller,
  //       owner: i.owner,
  //       image: meta.data.image,
  //       name: meta.data.name,
  //       description: meta.data.description,
  //     }
  //     return item
  //   }))
  //   setNfts(items)
  //   setLoadingState('loaded') 
  // }

  // const checkWalletIsConnected = () => { 
  //   const { ethereum } = window
  //   if (!ethereum) {
  //     console.log("MetaMask not found")
  //   }
  //   else {
  //     console.log("Ready to go")
  //   }
  // }

  // async function connectWalletHandler() { 
  //   try {
  //     const providerOptions = {
  //       // walletconnect: {
  //       //   package: WalletConnectProvider, // required
  //       //   options: {
  //       //     infuraId: "INFURA_ID" // required
  //       //   }
  //       // }
  //     };
      
  //     const web3Modal = new Web3Modal({
  //       network: "rinkeby", // optional
  //       cacheProvider: true, // optional
  //       providerOptions // required
  //     });
  //     const provider = await web3Modal.connect();
  //     const web3 = new Web3(provider);
  //   }
  //   catch(error) {
  //     console.log(error)
  //   }
  // }

  // const mintNftHandler = () => { }

  // const connectWalletButton = () => {
  //   return (
  //     // <Button onClick={connectWalletHandler}  sx={styles.button}>
  //     <Button onClick={mintNft}  sx={styles.button}>
  //       Connect Wallet
  //     </Button>
  //   )
  // }

  const mintNftButton = () => {
    if (nftRemaining != null) {
      if (nftRemaining > 0) {
        return (
          <Button onClick={mintNft}  sx={styles.button}>
            Mint NFT
          </Button>
        )
      }
      else {
        return (
          <Button sx={styles.button}>
            SOLD OUT
          </Button>
        )
      }
    }
  }

  return (
    <Box as="section" sx={styles.callToAction}>
      <Container>
        <Flex sx={styles.flex}>
          <Box sx={styles.images}>
            <Image src={callImage} alt="NFT" />
          </Box>
          <Box sx={styles.content}>
            <Text as="span">Get your own Pet Dinosaur</Text>
            <Heading as="h3">
              PetDinosaur
            </Heading>
            <Heading as="h5">
              Total Supply: {maxSupply}, NFTs Remaining: {nftRemaining != null ? nftRemaining : ""}
              <br />
              Current Price: {nftPrice != null ? nftPrice : ""} ETH
            </Heading>
            {/* <Link path="#" sx={styles.button}>
              Explore More
            </Link> */}
            <p></p>
            <center>
            {mintNftButton()}
            </center>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default NftMint;

const styles = {
  callToAction: {
    mt: ['-90px', null, null, null, '0'],
    py: ['50px', null, null, null, '110px', null, '140px'],
  },
  flex: {
    flexWrap: 'wrap',
  },
  content: {
    flex: ['0 0 100%', null, null, null, '0 0 38.5%'],
    textAlign: ['center', null, null, null, 'left'],
    pt: ['80px', null, null, null, '0'],
    maxWidth: ['100%', null, null, '80%', '100%'],
    mx: ['auto', null, null, null, '0'],
    mb: ['30px', null, null, null, '0'],
    span: {
      fontSize: '18px',
      fontWeight: 700,
      color: 'primary',
      display: 'block',
      lineHeight: 1,
    },
    h3: {
      color: '#0F2137',
      fontWeight: 700,
      fontSize: ['23px', null, null, null, '30px', '36px', '44px'],
      maxWidth: ['100%', null, null, null, null, '90%', '100%'],
      lineHeight: 1.36,
      letterSpacing: '-1.5px',
      mt: '20px',
      mb: '30px',
    },
    p: {
      color: '#02073E',
      fontSize: ['16px', null, null, '18px'],
      lineHeight: ['2', null, null, 2.33],
      mb: '30px',
    },
  },
  button: {
    display: 'inline-block',
    verticalAlign: 'middle',
    backgroundColor: '#02073E',
    color: '#fff',
    borderRadius: '5px',
    fontSize: '16px',
    fontWeight: 700,
    p: '6.5px 19px',
    letterSpacing: '-0.16px',
    transition: 'all 500ms ease',
    '&:hover': {
      opacity: 0.8,
    },
  },
  images: {
    flex: ['0 0 100%', null, null, null, '0 0 61.5%'],
  },
};
