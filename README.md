# ETH-Lambda-Event-Reader
## **Setup** 

Code for Lambda function that uses the getPastEvents Web3 API to pull events then pushes the event into Kinesis to be recorded to S3

Steps:
1. Create A DynamoDB Table
2. Create a Kinesis Data Stream
3. Deploy the contract (or use your own)
4. Create a Lambda function with this code!

Lambda Environment Variables:
TABLE_NAME: [DynamoDB Table Name]

CONTRACT: [Contract Address]

STREAM_NAME: [Kinesis Data Stream name]

ETH_SOCKET: [WSS Endpoint for ETH operations (Infura, Alchemy or others)]


## **Adapting for your own usage**
Within the code in the creation of the options object, you can adapt the filter to bring only the events you want for your needs, or extend the code to pull events from multiple contracts and use a mapping object to extend functionality further.

Example: 
``` js
let startingBlock = 0 //Acquire from state management
let lastBlockid = 1000 //currentBlock
let contracts = ["contract1Address", "contract2Address"]
let topicDecoder = {
    'topic1': topic1Function,
    'topic2': topic2Function
}
 let events = _(await Promise.all(
    Object.keys(topicDecoder).map(() => {
        return web3.eth.getPastLogs({
            address: contracts[i].address,
            fromBlock: startingBlock + 1,
            toBlock: lastBlockId,
            topics: [value]
            })
        })
    )).flatten().value()

for (const event of events) {
    //@ts-ignore
    let topic = event.topics[0]
    // @ts-ignore
    let fn = topicDecoder[topic]
    if (fn) {
        await fn(contracts[i], event)
    } else {
        console.error(`Unable to Process topic ${topic}`)
    }
}
```