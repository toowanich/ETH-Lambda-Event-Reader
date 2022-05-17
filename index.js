import { } from 'dotenv/config'
import Web3 from 'web3';
import { abi } from './abi.js';
//create socket connection
const conectionOptions = {
    // Enable auto reconnection
    reconnect: {
      auto: true,
      delay: 5000, // ms
      maxAttempts: 5,
      onTimeout: false
    }
  };
const web3 = new Web3(
    new Web3.providers.WebsocketProvider(process.env.ETH_SOCKET, conectionOptions)
)
const tokenContract = new web3.eth.Contract(
    abi, process.env.CONTRACT,
    (error, result) => { if (error) console.log(error) }
  )

export const watchTokenTransfers = async () => {
    //FIXME sometimes gets stuck in running status
    //TODO implement creation of transaction when adding money
    // console.log(running)
    // if (running) {
    //   return
    // }
    // running = true;
    //set fromBlock to be last block checked
    const blockObj = {currentBlock: 0}
    console.log(blockObj !== null ? (parseInt(blockObj.currentBlock) + 1).toString() : 0)
    let options = {
      filter: {
      },
      fromBlock: blockObj !== null ? (parseInt(blockObj.currentBlock) + 1).toString() : 0,                  //Number || "earliest" || "pending" || "latest"
      toBlock: 'latest'
    };
  
    const events = await tokenContract.getPastEvents('allEvents', options)
    console.log(events)
    console.log(events.length)
  }
console.log("test")
watchTokenTransfers()