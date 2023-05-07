const axios = require('axios');

const config = {
  method: 'post',
  url: 'https://dev.underdogprotocol.com/v2/projects/n/2/nfts',
  headers: { 
    'Authorization': `Bearer cdb8196620cb4f.0873c1f9158f440fb93fc1ff538bb0cb`,
    'Content-Type': 'application/json'
  },
  data: {
    "name": "Pandas",
    "symbol": "Pandas",
    "description": "This is an NFT",
    "image": "https://uploads-ssl.webflow.com/6320eecd0f98b4666b218021/63f0f42c0b3cfe430608b931_Early%20Adopter%20NFT_Final.webp",
    "attributes": {
      "Points": "40000",
      "Nickname": "Pandas"
    },
    "receiverAddress": "EcoygV1S93dZyFNqaRYi8m4C1Q36pXorUkP6gScSYnn2"
  }
};

axios(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));
  })
  .catch((error) => {
    console.log(error);
  });
