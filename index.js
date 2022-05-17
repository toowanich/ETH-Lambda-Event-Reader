var AWS = require('aws-sdk');
const Web3 = require('web3')
const AWSWebsocketProvider = require('aws-web3-ws-provider')
const abi = require('./abi.js')
var firehose = new AWS.Firehose();
AWS.config.update({
    region: "ap-southeast-1",
  });
var docClient = new AWS.DynamoDB.DocumentClient();


exports.handler = async function(event, context) {
    var docParams = {
        TableName : process.env.TABLE_NAME,
        Key:{
            "id": "1"
        }
    };

  var block = await docClient.get(docParams).promise();
  console.log(block)
  
  const web3 = new Web3(new AWSWebsocketProvider(process.env.ETH_SOCKET));
  const tokenContract = new web3.eth.Contract(
    abi, process.env.CONTRACT,
    (error, result) => { if (error) console.log(error) }
  )
  let options = {
    filter: {
    },
    fromBlock: block["Item"]["block"]+1,
    // fromBlock: 1,
    toBlock: 'latest'
  }
  const events = await tokenContract.getPastEvents('allEvents', options)
  const filter = events.filter((element, index, array) => element.event !== 'Transfer')
  const toWrite = await Promise.all(filter.map(async (event) => {
      const {_from: address = null, royalty= 0, tokenId= 0, price=0, _to: to=""} = event.returnValues
      let date = await web3.eth.getBlock(event.blockNumber)
      date = new Date(date.timestamp*1000).toISOString().replace('T', ' ').substr(0, 19)
      
      return {
        event: event.event,
        address,
        tokenId,
        royalty,
        price: parseInt(price),
        to,
        date
      }
    }))
  console.log(toWrite)
    web3.currentProvider.connection.close();

  let writeString = toWrite.reduce((prev, current) => prev+JSON.stringify(current)+`\n`, "")
  console.log(writeString)
  if(filter.length > 0){
    var params = {
      DeliveryStreamName: process.env.STREAM_NAME,
      Record: { 
          Data: writeString
      }
  };
  firehose.putRecord(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log(data);           // successful response

      context.done();
  });
  }
  if(events.length > 0){
    var writeParams = {
    TableName:"blocks",
    Key:{
        "id": "1"
    },
    ExpressionAttributeNames:{
        "#b": "block"
    },
    UpdateExpression: "set #b = :r",
    ExpressionAttributeValues:{
        ":r":events[events.length -1]["blockNumber"],
    },
    ReturnValues:"UPDATED_NEW"
    }
  let x = await docClient.update(writeParams).promise();
  console.log(x)
  }
  
  
};

