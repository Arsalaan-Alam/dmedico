window.addEventListener('DOMContentLoaded', () => {
    const address = localStorage.getItem('walletAddress'); // Retrieve the wallet address from localStorage
    displayWelcomeMessage(address);
  
    const addFileBtn = document.getElementById('addFileBtn');
    const fileInput = document.getElementById('fileInput');
    const fileDisplay = document.getElementById('fileDisplay');
    const submitButton = document.getElementById('submitButton');
  
    addFileBtn.addEventListener('click', () => {
      fileInput.click();
    });
  
    fileInput.addEventListener('change', () => {
      const selectedFile = fileInput.files[0];
      displayFileName(selectedFile.name);
      showSubmitButton();
    });
  
    function displayWelcomeMessage(address) {
      const welcomeHeading = document.getElementById('welcomeHeading');
      if (address) {
        const shortenedAddress = shortenAddress(address);
        welcomeHeading.textContent = `Welcome ${shortenedAddress}`;
      } else {
        welcomeHeading.textContent = 'Welcome'; // Show a generic welcome message if the address is not found in localStorage
      }
    }
  
    function shortenAddress(address) {
      const start = address.substring(0, 6);
      const end = address.substring(address.length - 6);
      return `${start}......${end}`;
    }
  
    function displayFileName(fileName) {
      fileDisplay.textContent = fileName;
    }
  
    function showSubmitButton() {
      submitButton.style.display = 'block';
    }    
    

    const doDeal = async (obj, signer) => {
      var contractABI = ''
      fetch('./DealClient.json')
        .then(response => response.json())
        .then(async(data) => { 
            contractABI = data.abi
            console.log('Con abi',contractABI)
            const contractAddress = "0xf8B7524c3dbfDe0d3e6E06d371A06a9B7430333a"
        const dealClient = new ethers.Contract(
            contractAddress,
            contractABI,
            signer
            
        )        
        console.log('response object :',obj)
        const extraParamsV1 = [
          obj.carlink,
            obj.size,
            false, // taskArgs.skipIpniAnnounce,
            false, // taskArgs.removeUnsealedCopy
        ]
        const DealRequestStruct = [
            obj.pieceCid, //cidHex
            obj.pieceSize, //taskArgs.pieceSize,
            false, //taskArgs.verifiedDeal,
            obj.dataCid, //taskArgs.label,
            520000, // startEpoch
            1555200, // endEpoch
            0, // taskArgs.storagePricePerEpoch,
            0, // taskArgs.providerCollateral,
            0, // taskArgs.clientCollateral,
            1, //taskArgs.extraParamsVersion,
            extraParamsV1,
        ]
        console.log(dealClient.interface);
        const transaction = await dealClient.makeDealProposal(DealRequestStruct)
        console.log("Proposing deal...")
        const receipt = await transaction.wait()
        console.log(receipt)
        dealClient.on("DealProposalCreate", (id, size, verified, price) => {
            console.log(id, size, verified, price);
          })  
        console.log("Deal proposed! CID: " + obj.dataCid)
        })
        .catch((e) => {
          console.log(e)
        })
        

    }  
      
    submitButton.addEventListener('click', async() => {
      const selectedFile = fileInput.files[0];
      if (selectedFile) {
        const formData = new FormData();
        formData.append('uploadedFile', selectedFile);
        
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        console.log(signer)
                
        console.log(signer.provider)
        console.log(signer.address)
        const formatSigner = {}
        formatSigner.provider = signer.provider
        formatSigner.address = signer.address
        console.log(formatSigner.provider)        
        formData.append('signer', JSON.stringify(signer))  

        var dataObj = ''
        // Send the formData to the server or endpoint using fetch or other methods
        // Example:
        fetch('http://localhost:5000/send', {
          method: 'POST',
          body: formData,
        })
          .then(res => res.json())
          .then(async(data) => {
            console.log('File submitted successfully:', data);
            console.log('Data.Response :',data.response)
            dataObj = data.response    
            await doDeal(dataObj, signer)        
            // Handle the response from the server or endpoint
          })
          .catch(error => {
            console.error('Error submitting file:', error);
            // Handle the error as needed
          });
          
      }
    });
  });
  