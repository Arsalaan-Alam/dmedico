window.addEventListener('DOMContentLoaded', () => {
  const address = localStorage.getItem('walletAddress');
  displayWelcomeMessage(address);

  const addFileBtn = document.getElementById('addFileBtn');
  const fileInput = document.getElementById('fileInput');
  const fileDisplay = document.getElementById('fileDisplay');
  const submitButton = document.getElementById('submitButton');
  const dataTable = document.getElementById('dataTable');
  let serialNumber = 1; // Starting serial number

  addFileBtn.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', () => {
    const selectedFile = fileInput.files[0];
    displayFileName(selectedFile.name);
    showSubmitButton();
  });

  submitButton.addEventListener('click', async () => {
    const selectedFile = fileInput.files[0];
    if (selectedFile) {
      const formData = new FormData();
      formData.append('uploadedFile', selectedFile);

      submitFile(formData);
      clearFileInput();
    }
  });

  function displayWelcomeMessage(address) {
    const welcomeHeading = document.getElementById('welcomeHeading');
    if (address) {
      const shortenedAddress = shortenAddress(address);
      welcomeHeading.textContent = `Welcome ${shortenedAddress}`;
    } else {
      welcomeHeading.textContent = 'Welcome';
    }
    popupBox.style.display = 'none';
  }

  function shortenAddress(address) {
    const start = address.substring(0, 6);
    const end = address.substring(address.length - 6);
    return `${start}......${end}`;
  }

  function displayFileName(fileName) {
    fileDisplay.textContent = fileName;
    fileDisplay.style.fontFamily = 'Varela Round';
  }

  function showSubmitButton() {
    submitButton.style.display = 'block';
  }

  function submitFile(formData) {
    // Save the file data in local storage
    const fileData = {
      fileName: fileInput.files[0].name,
      dateTime: getCurrentDateTime(),
    };
    localStorage.setItem('fileData', JSON.stringify(fileData));

    // Add the file to the table
    addFileToTable(fileData);
  }

  function addFileToTable(fileData) {
    const newRow = document.createElement('tr');

    // Serial Number column
    const serialNoCell = document.createElement('td');
    serialNoCell.textContent = serialNumber;
    newRow.appendChild(serialNoCell);
    serialNumber++; // Increment the serial number for the next entry

    // IPFS Link (File Name) column
    const ipfsLinkCell = document.createElement('td');
    ipfsLinkCell.textContent = fileData.fileName;
    newRow.appendChild(ipfsLinkCell);

    // Date & Time column
    const dateTimeCell = document.createElement('td');
    dateTimeCell.textContent = fileData.dateTime;
    newRow.appendChild(dateTimeCell);

    // Permissions column
    const permissionsCell = document.createElement('td');
    const manageAccessBtn = document.createElement('button');
    manageAccessBtn.className = 'manageAccessBtn';
    manageAccessBtn.textContent = 'Manage Access';
    permissionsCell.appendChild(manageAccessBtn);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'removeBtn';
    removeBtn.textContent = 'Remove File';
    permissionsCell.appendChild(removeBtn);
    removeBtn.addEventListener('click', function() {
      // Get the row element that contains the remove button
      const row = this.closest('tr');
      
      // Remove the row from the table
      if (row) {
        row.remove();
      }
    });


    manageAccessBtn.addEventListener('click', () => {
      openPopupBox(fileData.fileName);
    });

  
    newRow.appendChild(permissionsCell);

    dataTable.querySelector('tbody').appendChild(newRow);
  }

  function getCurrentDateTime() {
    const currentDate = new Date();
    return currentDate.toLocaleString();
  }

  function clearFileInput() {
    fileInput.value = '';
    fileDisplay.textContent = '';
    submitButton.style.display = 'none';
  }
  

});

function openPopupBox(fileName) {
  const popupBox = document.getElementById('popupBox');
  const accessTable = document.getElementById('accessTable');
  const closePopupBtn = document.getElementById('closePopupBtn');
  const closePopupBtnNew = document.getElementById('closePopupBtnNew');

closePopupBtnNew.addEventListener('click', () => {
  popupBox.style.display = 'none';
  addAccessForm.style.display = 'none';
    addAccessBtn.style.display = 'block';
    closePopupBtn.style.display = 'block';
    accessTable.style.display = 'table';
    accessTable.style.width = '100%';
    const poi = document.getElementById('poi')
    poi.textContent = 'People Who Have Access';
  
});
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
while (accessTable.rows.length > 1) {
  accessTable.deleteRow(1);
}

// Fetch and display access data from localStorage or server

// Example usage: Display sample access data
const sampleAccessData = [
  { userName: 'John Doe', walletAddress: '0x123abc' },
  { userName: 'Jane Smith', walletAddress: '0x456def' },
  { userName: 'Alice Johnson', walletAddress: '0x789ghi' }
];

sampleAccessData.forEach(access => {
  const newRow = accessTable.insertRow();
  newRow.insertCell().textContent = access.userName;
  newRow.insertCell().textContent = access.walletAddress;
  const revokeCell = newRow.insertCell();
  const revokeBtn = document.createElement('button');
  revokeBtn.textContent = 'Revoke';
  revokeBtn.className = 'revoke';
  revokeCell.appendChild(revokeBtn);
});

// Show the popup box
popupBox.style.display = 'block';

// Close the popup box on "Close" button click
closePopupBtn.addEventListener('click', () => {
  popupBox.style.display = 'none';
});
}


document.addEventListener('DOMContentLoaded', () => {
const addAccessBtn = document.getElementById('addAccessBtn');
const addAccessForm = document.getElementById('addAccessForm');
const submitAccessBtn = document.getElementById('submitAccessBtn');

addAccessBtn.addEventListener('click', () => {
  addAccessBtn.style.display = 'none'; // Hide the "Add Access" button
  accessTable.style.display = 'none'; // Hide the previous table
  addAccessForm.style.display = 'block'; // Show the access form
  closePopupBtn.style.display = 'none';
  const poi = document.getElementById('poi')
  poi.textContent = 'Give Access';

});

submitAccessBtn.addEventListener('click', () => {
  // Handle the form submission, e.g., retrieve input values and perform actions
  const userName = document.getElementById('userNameInput').value;
  const walletAddress = document.getElementById('walletAddressInput').value;
  const remarks = document.getElementById('remarksInput').value;

  // Perform actions with the input values (e.g., store data, update table, etc.)

  // Reset the form
  document.getElementById('userNameInput').value = '';
  document.getElementById('walletAddressInput').value = '';
  document.getElementById('remarksInput').value = '';

  // Hide the form and show the "Add Access" button again
  addAccessForm.style.display = 'none';
  addAccessBtn.style.display = 'block';
  accessTable.style.display = 'table';
  accessTable.style.width = '100%';

  closePopupBtn.style.display = 'block';
  const poi = document.getElementById('poi')
  poi.textContent = 'People Who Have Access';

});

// Rest of your code...
});
const viewFilesBtn = document.getElementById('viewFilesBtn');
const dataTable = document.getElementById('dataTable');
const sharedFilesTable = document.getElementById('sharedFilesTable');
const addFileBtn = document.getElementById('addFileBtn');


let isViewingSharedFiles = false;

viewFilesBtn.addEventListener('click', () => {
if (isViewingSharedFiles) {
  viewFilesBtn.textContent = 'View Shared Files';
  dataTable.style.display = 'table';
  sharedFilesTable.style.display = 'none';
} else {
  viewFilesBtn.textContent = 'View Your Files';
  dataTable.style.display = 'none';
  sharedFilesTable.style.display = 'table';
}

isViewingSharedFiles = !isViewingSharedFiles;
});
addFileBtn.addEventListener('click', () => {
if (dataTable.style.display === 'none') {
  // If the shared files table is currently visible, show the data table
  dataTable.style.display = 'table';
  sharedFilesTable.style.display = 'none';
}
});