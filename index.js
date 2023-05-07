const axios = require('axios');
const fs = require('fs');
const csvParser = require('csv-parser');
const csvWriter = require('csv-writer');
const FormData = require('form-data');

const config = require('./config.json');

function getApiBaseUrl(environment) {
  if (environment === 'dev') {
    return 'https://dev.underdogprotocol.com';
  } else if (environment === 'prod') {
    return 'https://api.underdogprotocol.com';
  } else {
    throw new Error(`Invalid environment: ${environment}`);
  }
}

function getNftEndpoint(type) {
  const baseUrl = getApiBaseUrl(config.environment);
  if (type === 'create') {
    return `${baseUrl}/v2/projects/${config.transferable}/${config.projectId}/nfts`;
  } else if (type === 'claim') {
    return `${baseUrl}/v2/projects/${config.transferable}/${config.projectId}/nfts`;
  }
}

async function createNFT(receiverAddress, imageUrl) {
  const data = {
    name: config.attributes.Nickname,
    symbol: config.symbol,
    description: config.description,
    image: imageUrl,
    attributes: config.attributes,
    receiverAddress: receiverAddress,
  };

  console.log('Data:', JSON.stringify(data, null, 2));
  console.log('URL:', getNftEndpoint('create'));
  console.log('Headers:', {
    Authorization: `Bearer ${config.token}`,
    "Content-Type": "application/json",
  });

  try {
    const response = await axios.post(`${getNftEndpoint('create')}`, data, {
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error(`Error creating NFT for ${receiverAddress}: ${error.message}`);
    console.error('Error details:', JSON.stringify(error.toJSON(), null, 2));
    if (error.response) {
      console.error('Response:', error.response.status, error.response.statusText);
      console.error('Response Data:', error.response.data);
    }
    if (error.request) {
      console.error('Request:', error.request);
    }

    return {}; // Return an empty object when an error occurs
  }
}

async function generateClaimLink(nftId) {
  try {
    const axiosConfig = {
      method: 'get',
      url: `${getApiBaseUrl(config.environment)}/v2/projects/${config.transferable}/${config.projectId}/nfts/${nftId}/claim`,
      headers: {
        Authorization: `Bearer ${config.token}`,
      },
    };

    const response = await axios(axiosConfig);
    return response.data;
  } catch (error) {
    console.error(`Error generating claim link for ${nftId}: ${error.message}`);
    if (error.response) {
      console.error('Response:', error.response.status, error.response.statusText);
      console.error('Response Data:', error.response.data);
    }
    if (error.request) {
      console.error('Request:', error.request);
    }
  }
}

(async () => {
  const imageUrl = config.imageUrl;

  const csvStream = csvWriter.createObjectCsvWriter({
    path: 'output.csv',
    header: [
      { id: 'wallet', title: 'WALLET' },
      { id: 'link', title: 'LINK' },
    ],
  });

  const records = [];

  const wallets = fs
  .readFileSync('wallets.csv', 'utf-8')
  .split('\n')
  .filter(Boolean);

for (const wallet of wallets) {
  const createNftResponse = await createNFT(wallet, imageUrl);

  if (createNftResponse.id) {
    const nftId = createNftResponse.id;

    if (nftId) {
      const claimData = await generateClaimLink(nftId);
      if (claimData && claimData.link) {
        console.log(`NFT created for ${wallet}: ${claimData.link}`);
        records.push({ wallet: wallet, link: claimData.link });
      } else {
        console.log(`Error: Unable to generate claim link for ${wallet}`);
      }
    } else {
      console.log(`Error: Unable to get NFT ID for ${wallet}`);
    }
  } else {
    console.log(`Error: Unable to create NFT for ${wallet}`);
  }
}

await csvStream.writeRecords(records);
console.log('Output saved to output.csv');
})();

