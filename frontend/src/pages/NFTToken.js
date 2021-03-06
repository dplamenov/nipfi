import {useState, useEffect} from "react";
import {Typography, Container, TextField, Button} from "@mui/material";
import {useSelector} from "react-redux";
import {ethers} from "ethers";
import {useNavigate} from "react-router-dom";
import contracts from "../contracts/contracts.json";
import TokenMarketplaceABI from "../contracts/TokenMarketplaceABI.json";
import NFTTokenABI from "../contracts/NFTTokenABI.json";

function NFTToken() {
  const signer = useSelector(state => state.web3.signer);
  const account = useSelector(state => state.web3.account);

  const tokenMarketplace = new ethers.Contract(contracts.TokenMarketplace, TokenMarketplaceABI, signer);
  const nftToken = new ethers.Contract(contracts.NFTToken, NFTTokenABI, signer);

  const [buyTokens, setBuyTokens] = useState(0);
  const [buyEth, setBuyEth] = useState(0);
  const [saleTokens, setSaleTokens] = useState(0);
  const [saleEth, setSaleEth] = useState(0);
  const [liquidity, setLiquidity] = useState(0);
  const [contractBalance, setContractBalance] = useState(0);
  const [contractTokenBalance, setContractTokenBalance] = useState(0);
  const [provideTokens, setProvideTokens] = useState(0);
  const [provideEths, setProvideEths] = useState(0);
  const [userBalance, setUserBalance] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    nftToken.balanceOf(tokenMarketplace.address).then(balance => {
      setLiquidity(ethers.utils.formatEther(balance));
    });

    nftToken.balanceOf(account).then(balance => {
      setUserBalance(ethers.utils.formatEther(balance));
    });

    tokenMarketplace.getBalance().then(balance => {
      setContractBalance(+ethers.utils.formatEther(balance));
    });

    tokenMarketplace.getBalanceOfTokens().then(balance => {
      setContractTokenBalance(+ethers.utils.formatEther(balance));
    });
  }, []);

  const setBuyTokensHandler = (e) => {
    const k = contractBalance * contractTokenBalance;
    let value = +e.target.value;

    if (value >= contractTokenBalance) {
      value = contractTokenBalance - 0.001;
    }

    setBuyTokens(value);
    setBuyEth((k / (contractTokenBalance - value) - contractBalance).toFixed(5));
  }

  const setBuyEthHandler = (e) => {
    const k = contractBalance * contractTokenBalance;
    let value = +e.target.value;

    const tokensToBuy = (k / (contractBalance - value) - contractTokenBalance) === Infinity ? contractTokenBalance - 1 : (k / (contractBalance - value) - contractTokenBalance);

    if (value >= contractBalance) {
      value = contractBalance - 0.001;
    }

    if (tokensToBuy > contractTokenBalance || tokensToBuy < 0) {
      setBuyTokens(contractTokenBalance);
      setBuyEth((k / (contractTokenBalance - (contractTokenBalance - 1)) - contractBalance).toFixed(5));
    } else {
      setBuyEth(value);
      setBuyTokens(tokensToBuy);
    }
  };

  const setSaleEthHandler = (e) => {
    const k = contractBalance * contractTokenBalance;
    let value = +e.target.value;

    const tokensToSale = (k / (contractBalance - value) - contractTokenBalance) === Infinity ? contractTokenBalance - 1 : (k / (contractBalance - value) - contractTokenBalance);

    if (value >= contractBalance) {
      value = contractBalance - 0.001;
    }

    if (tokensToSale > userBalance || tokensToSale < 0) {
      setSaleTokens(userBalance);
      setSaleEth(Math.abs(k / (contractTokenBalance + userBalance) - contractBalance));
    } else {
      setSaleEth(value);
      setSaleTokens((k / (contractBalance - value) - contractTokenBalance).toFixed(5));
    }
  };

  const setSaleTokensHandler = (e) => {
    const k = contractBalance * contractTokenBalance;
    let value = +e.target.value;

    if (value >= contractTokenBalance) {
      value = contractTokenBalance - 0.001;
    }

    setSaleTokens(value);
    setSaleEth(Math.abs(k / (contractTokenBalance + value) - contractBalance));
  };

  const buyHandler = async () => {
    await tokenMarketplace.buy({value: ethers.utils.parseEther(buyEth.toString())});
    navigate('/profile');
  };

  const sellHandler = async () => {
    await nftToken.increaseAllowance(tokenMarketplace.address, ethers.utils.parseEther(saleTokens.toString()));
    await tokenMarketplace.sell(ethers.utils.parseEther(saleTokens.toString()));
    navigate('/profile');
  }

  const provideTokensHandler = (e) => {
    setProvideTokens(e.target.value);
  };

  const provideEthHandler = (e) => {
    setProvideEths(e.target.value);
  };

  const provideLiquidity = async () => {
    await nftToken.increaseAllowance(tokenMarketplace.address, ethers.utils.parseEther(provideTokens.toString()));
    await tokenMarketplace.addLiquidity(ethers.utils.parseEther(provideTokens.toString()), {value: ethers.utils.parseEther(provideEths.toString())});
  };

  return <>
    <Typography component='h1' variant='h1'>NFT Token</Typography>
    <Typography component="p" variant='p'>Available tokens: {Number(liquidity).toFixed(2)} NFTToken</Typography>
    <Container disableGutters maxWidth={false} sx={{display: 'flex'}}>
      <Container disableGutters maxWidth={false}>
        <Typography component='h2' variant='h2'>Buy</Typography>
        <Container disableGutters maxWidth={false} sx={{display: 'flex', gap: '10px'}}>
          <TextField id="buy-tokens-input" label="Tokens" variant="outlined" value={buyTokens}
                     onChange={setBuyTokensHandler}/>
          <TextField id="buy-eth-input" label="Eth" variant="outlined" value={buyEth} onChange={setBuyEthHandler}/>
        </Container>
        <Typography component="p" variant='p'>You will buy {Number(buyTokens).toFixed(2)} tokens for {Number(buyEth).toFixed(10)} ETH</Typography>
        <Button variant='contained' onClick={buyHandler}>Buy</Button>
      </Container>
      <Container disableGutters maxWidth={false}>
        <Typography component='h2' variant='h2'>Sell</Typography>
        <Container disableGutters maxWidth={false} sx={{display: 'flex', gap: '10px'}}>
          <TextField id="sell-tokens-input" label="Tokens" variant="outlined" value={saleTokens}
                     onChange={setSaleTokensHandler}/>
          <TextField id="sell-eth-input" label="Eth" variant="outlined" value={saleEth} onChange={setSaleEthHandler}/>
        </Container>
        <Typography component="p" variant='p'>You will sell {Number(saleTokens).toFixed(2)} tokens for {Number(saleEth).toFixed(10)} ETH</Typography>
        <Button variant='contained' onClick={sellHandler}>Sell</Button>
      </Container>
    </Container>
    <hr/>
    <Typography component='h2' variant='h2'>Provide liquidity</Typography>
    <Container maxWidth={false} disableGutters sx={{display: 'flex', gap: '15px'}}>
      <TextField id="provide-tokens-input" label="Tokens" variant="outlined" value={provideTokens}
                 onChange={provideTokensHandler}/>
      <TextField id="provide-eth-input" label="Eth" variant="outlined" value={provideEths}
                 onChange={provideEthHandler}/>
      <Button variant='contained' onClick={provideLiquidity}>Provide</Button>
    </Container>
  </>
}

export default NFTToken;
