import { } from 'dotenv/config'
import Web3 from 'web3';
import AWS from 'aws-sdk';
import AWSWebsocketProvider from 'aws-web3-ws-provider'
import { abi } from './abi.js';
import fetch from 'node-fetch'

const endpoint = process.env.ETH_SOCKET
let sts = new AWS.STS()
fetch(`http://169.254.169.254/latest/meta-data/iam/security-credentials/${process.env.ROLE}`).then((response) => {
  response.json().then(async (data) => {
    // console.log(data)

    process.env.AWS_ACCESS_KEY_ID = data["AccessKeyId"]
    process.env.AWS_SECRET_ACCESS_KEY= data["SecretAccessKey"]
    process.env.AWS_SESSION_TOKEN= data["Token"]
    const web3 = new Web3(new AWSWebsocketProvider(endpoint));
    web3.eth.getNodeInfo().then(console.log)
    const tokenContract = new web3.eth.Contract(
      abi, process.env.CONTRACT,
      (error, result) => { if (error) console.log(error) }
    )
    const blockObj = {currentBlock: 0}
    let options = {
      filter: {
      },
      fromBlock: blockObj !== null ? (parseInt(blockObj.currentBlock) + 1).toString() : 0,                  //Number || "earliest" || "pending" || "latest"
      toBlock: 'latest'
    };

    const events = await tokenContract.getPastEvents('allEvents', options)
    console.log(events)
    console.log(events.length)
    web3.currentProvider.connection.close();
          
  })
})
