import { CandlestickData, Depth, Market, Ticker24h } from "@/types";
import axios from "axios";

export type Kline = {
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  quoteVolume: string;
  trades: string;
  start: string; // ISO datetime string
  end: string;   // ISO datetime string
};


export async function getKLines(symbol = 'SOL_USDC', interval = '5m', startTime = 1771443000): Promise<CandlestickData[]> {

  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_PROXY}/klines?symbol=${symbol}&interval=${interval}&startTime=${startTime}`);
    return res.data
      

  } catch (error) {
    console.log(error)
  }
  return []
}


export async function getCurrentData(): Promise<Market[]> {
  const res = await axios.get("https://price-indexer.workers.madlads.com/?ids=zero-gravity,doublezero,aave,act-i-the-ai-prophecy,cardano,aerodrome-finance,ai16z,anime,apecoin,apex-token-2,apriori,aptos,arbitrum,aster-2,aethir,avalanche-2,avantis,lombard-protocol,bitcoin-cash,berachain-bera,bluefin,blur,binancecoin,jeo-boden,book-of-meme,bonk,bitcoin,cetus-protocol,chill-guy,sanctum-2,curve-dao-token,debridge,deep,dogecoin,polkadot,drift-protocol,openeden,eigenlayer,ethena,eclipse-3,ethereum,ether-fi,euro-coin,fartcoin,falcon-finance-ff,flock-2,fogo,fragmetric,fantom,gala,galaxy-digital-inc-class-a-common-stock,goatseus-maximus,gusdt,habibi-sol,haedal,hedera-hashgraph,holograph,helium,hivemapper,huma-finance,hyperliquid,infinex-2,io,story-2,jambo,jito-governance-token,jupiter-exchange-solana,kaito,kgen,kamino,solayer,lido-dao,linea,chainlink,lighter,litecoin,maneki,matic-network,matr1x,magic-eden,melania-meme,meteora,cat-in-a-dogs-world,mantle,helium-mobile,monad,mon-protocol,moo-deng,morpho,mother-iggy,movement,near,suins-token,nyan,ondo-finance,optimism,orderly-network,pax-gold,pendle,pudgy-penguins,pepe,pipe-network,peanut-the-squirrel,polygon-ecosystem-token,parcl,pump-fun,pyth-network,paypal-usd,raydium,render-token,rainbow-3-2,roam-token,sonic-3,sei-network,suilend,sharky-fi,shuffle-2,shiba-inu,seeker,solana,sonic-svm,spx6900,stable-2,starknet,sui,switchboard,bittensor,celestia,tensor,the-open-network,official-trump,tron,unagi-token,uniswap,usd-coin,tether,vine,virtual-protocol,wormhole,walrus-2,connect-token-wct,wen-4,the-white-whale,dogwifcoin,worldcoin-wld,world-liberty-financial,tether-gold,stellar,monero,plasma,ripple,zama,zcash,zeus-network,zeta,polyhedra-network,zora,layerzero?sparkline=true")
//  console.log(res.data)
  return res.data
}


export async function getDepth(token: string): Promise<Depth> {
  try {

    const res = await axios.get<Depth>(`${process.env.NEXT_PUBLIC_PROXY}/depth?symbol=${token}`)
    return res.data
  } catch (error) {
    console.log("error", error)

    return {} as any
  }
}

export async function getCurrentTokenData(token: string): Promise<Market[]> {
  try {
    const res = await axios.get<Market[]>("https://price-indexer.workers.madlads.com/?ids=zero-gravity,doublezero,aave,act-i-the-ai-prophecy,cardano,aerodrome-finance,ai16z,anime,apecoin,apex-token-2,apriori,aptos,arbitrum,aster-2,aethir,avalanche-2,avantis,lombard-protocol,bitcoin-cash,berachain-bera,bluefin,blur,binancecoin,jeo-boden,book-of-meme,bonk,bitcoin,cetus-protocol,chill-guy,sanctum-2,curve-dao-token,debridge,deep,dogecoin,polkadot,drift-protocol,openeden,eigenlayer,ethena,eclipse-3,ethereum,ether-fi,euro-coin,fartcoin,falcon-finance-ff,flock-2,fogo,fragmetric,fantom,gala,galaxy-digital-inc-class-a-common-stock,goatseus-maximus,gusdt,habibi-sol,haedal,hedera-hashgraph,holograph,helium,hivemapper,huma-finance,hyperliquid,infinex-2,io,story-2,jambo,jito-governance-token,jupiter-exchange-solana,kaito,kgen,kamino,solayer,lido-dao,linea,chainlink,lighter,litecoin,maneki,matic-network,matr1x,magic-eden,melania-meme,meteora,cat-in-a-dogs-world,mantle,helium-mobile,monad,mon-protocol,moo-deng,morpho,mother-iggy,movement,near,suins-token,nyan,ondo-finance,optimism,orderly-network,pax-gold,pendle,pudgy-penguins,pepe,pipe-network,peanut-the-squirrel,polygon-ecosystem-token,parcl,pump-fun,pyth-network,paypal-usd,raydium,render-token,rainbow-3-2,roam-token,sonic-3,sei-network,suilend,sharky-fi,shuffle-2,shiba-inu,seeker,solana,sonic-svm,spx6900,stable-2,starknet,sui,switchboard,bittensor,celestia,tensor,the-open-network,official-trump,tron,unagi-token,uniswap,usd-coin,tether,vine,virtual-protocol,wormhole,walrus-2,connect-token-wct,wen-4,the-white-whale,dogwifcoin,worldcoin-wld,world-liberty-financial,tether-gold,stellar,monero,plasma,ripple,zama,zcash,zeus-network,zeta,polyhedra-network,zora,layerzero")
    const data = res.data.filter((t) => (t['symbol'] === token.toLocaleLowerCase()))

    return data
  } catch (error) {
    console.log("error", error)

    return []
  }
}
export async function getTicker24h(token: string): Promise<Ticker24h[]> {
  try {
    const res = await axios.get<Ticker24h[]>(`${process.env.NEXT_PUBLIC_PROXY}/tickers`)
    const data = res.data.filter((t) => (t['symbol'] === token))
    return data
  } catch (error) {
    console.log("error", error)

    return []
  }
}



// {"data":{"A":"0.06093","B":"0.02426","E":1771003771693848,"T":1771003771690207,"a":"68983.1","b":"68983.0","e":"bookTicker","s":"BTC_USDC","u":2442329321},"stream":"bookTicker.BTC_USDC"}