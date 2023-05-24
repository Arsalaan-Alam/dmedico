window.addEventListener('DOMContentLoaded', () => {
  const walletAddress = localStorage.getItem('walletAddress');

  if (!walletAddress) {
    window.location.href = 'index.html'; // Redirect to index.html or another appropriate page
  }
});

window.addEventListener('DOMContentLoaded', () => {
  const address = localStorage.getItem('walletAddress');
  displayWelcomeMessage(address);

  const addFileBtn = document.getElementById('addFileBtn');
  const fileInput = document.getElementById('fileInput');
  const fileDisplay = document.getElementById('fileDisplay');
  const submitButton = document.getElementById('submitButton');
  const dataTable = document.getElementById('dataTable');

  const signInAddr = localStorage.getItem('walletAddress')
  console.log(signInAddr)
  
  let dashboardArray = []
  const data1 = [ {"function" : "getFilesByOwner"}, {
    "owner": signInAddr
  }]
  
  fetch('https://dmedico-6k6gsdlfoa-em.a.run.app/update', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data1)
    })
    .then((res) => res.json())
    .then((data) => {
      // Process the fetched data
      console.log(data);
      dashboardArray = data.records
      console.log(dashboardArray)
    })
    .catch((error) => {
      console.error('Error fetching records:', error);
    });

  addFileBtn.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', () => {
    const selectedFile = fileInput.files[0];
    displayFileName(selectedFile.name);
    showSubmitButton();
  });
  /*
  submitButton.addEventListener('click', async () => {
    const selectedFile = fileInput.files[0];
    if (selectedFile) {
      const formData = new FormData();
      formData.append('uploadedFile', selectedFile);

      submitFile(formData);
      
    }
  });*/

  submitButton.addEventListener('click', async() => {
    const selectedFile = fileInput.files[0];
    console.log(selectedFile)
    if (selectedFile) {
      const formData = new FormData();
      formData.append('uploadedFile', selectedFile);
      
      
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      console.log(signer)              
      formData.append('signer', JSON.stringify(signer))  
  
      var dataObj = ''
      // Send the formData to the server or endpoint using fetch or other methods
      // Example:
      fetch('https://dmedico-6k6gsdlfoa-em.a.run.app/send', {
        method: 'POST',
        body: formData,
      })
        .then(res => res.json())
        .then(async(data) => {
          console.log('File submitted successfully:', data);
          const walletAddress = localStorage.getItem('walletAddress');
          console.log('Data.Response :',data.response)
          dataObj = data.response    
          doDeal(dataObj, signer)
            .then(res => {
              if ( res === 'success'){              
                  console.log(selectedFile.name)
                  fetch(`https://dmedico-6k6gsdlfoa-em.a.run.app/upload?filename=${selectedFile.name}`)                  
                    .then(res => res.json())
                    .then(data => {
                      console.log(data)
                      const iplink = data.url;
                      const serialNo = generateUniqueSerialNumber()
                      const dateT = getCurrentDateTime();
                      if (data.status === 'uploaded') {
                        const data = [ {"function" : "addFile"}, {
                          "id": serialNo.toString(),
                          "owner": walletAddress,
                          "filename": selectedFile.name,
                          "dateTime": dateT,
                          "ipfsurl": iplink
                        }
                      
                      ]
                      fetch ("https://dmedico-6k6gsdlfoa-em.a.run.app/update", {
                          method: 'POST',
                          headers: {
                              'Accept': 'application/json',
                              'Content-Type': 'application/json'
                            },
                          body: JSON.stringify(data),
                      })
                       .then((res) => res.json())
                       .then((data) => console.log(data))
                       .catch((e) => {console.error(e)})
                      }
                      else {
                        console.error('File was not uploaded...')
                      }
                    })
                    .catch((e) =>{
                      console.error('Upload error ' + e.name + ' ' + e.message)
                    })
                }
            })            
            .catch ((e) => console.log(e))
            
        })
        .catch(error => {
          console.error('Error submitting file:', error);
          // Handle the error as needed
        });
      submitFile(formData);
      clearFileInput();        
    }
  });

  const doDeal = async (obj, signer) => {
    return new Promise((resolve, reject) => {
      var contractABI = ''
      fetch('./DealClient.json')
        .then(response => response.json())
        .then(async(data) => { 
            contractABI = data.abi
            console.log('Contract abi',contractABI)
            const contractAddress = data.address
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
        resolve('success')
      })
      .catch((e) => {
        console.log(e)
      })
    })
    
  }  

  function generateUniqueSerialNumber() {
    return Math.floor(Math.random() * 900000) + 100000;
  }

  function getCurrentDateTime() {
    const currentDate = new Date();
    return currentDate.toLocaleString();
  }
  

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
  
  const table = document.getElementById('dataTable');
  const tableBody = table.querySelector('tbody');

  const dashboardData = [ {"function" : "getFilesByOwner"}, {
    "owner": signInAddr
  }]
  

fetch('https://dmedico-6k6gsdlfoa-em.a.run.app/update', {
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(dashboardData)
})
  .then((response) => response.json())
  .then((data) => {
    // Process the fetched data
    console.log(data);
    const dashboardArray = data.records;

    dashboardArray.forEach((record) => {
      const newRow = tableBody.insertRow();

      const fileIdCell = newRow.insertCell();
      fileIdCell.textContent = record.id;

      const fileNameCell = newRow.insertCell();
      fileNameCell.textContent = record.filename;

      const dateTimeCell = newRow.insertCell();
      dateTimeCell.textContent = record.dateTime;

      const permissionsCell = newRow.insertCell();
      const manageAccessBtn = document.createElement('button');
      manageAccessBtn.className = 'manageAccessBtn';
      manageAccessBtn.textContent = 'Manage Access';
      permissionsCell.appendChild(manageAccessBtn);
      
      const loggedinUser = localStorage.getItem('walletAddress');
      
      manageAccessBtn.addEventListener('click', () => {
        console.log("In manage access")
        let accessArray = []
        const popUpData = [ {"function" : "getAccessRecord"}, {
          "owner": loggedinUser,
          "ipfsurl": record.ipfsurl    
        }]
        fetch ("https://dmedico-6k6gsdlfoa-em.a.run.app/update", {
  
          method: 'POST',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
          body: JSON.stringify(popUpData),
        })
        .then((res) => res.json())
        .then((data) => {
          console.log(data)
          accessArray = data.records
          openPopupBox(accessArray);
        })
        .catch((e) => {
          console.error(e)
        })
  
        //openPopupBox(accessArray);
        //console.log(iplink)
        
        });

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
    });
  })
  .catch((error) => {
    console.error('Error fetching records:', error);
  });
  
  
/*
  function loadDashboard(fileData) {
    const newRow = document.createElement('tr');

    // Serial Number column
    const assignedSerialNumbers = new Set();
    function generateUniqueSerialNumber() {
      const serialNumber = Math.floor(Math.random() * 900000) + 100000;
      if (assignedSerialNumbers.has(serialNumber)) {
        return generateUniqueSerialNumber();
      }
      assignedSerialNumbers.add(serialNumber);
      return serialNumber;
    }


    const serialNumber = generateUniqueSerialNumber();

    const serialNoCell = document.createElement('td');
    serialNoCell.textContent = fileData.id
    newRow.appendChild(serialNoCell);


    // IPFS Link (File Name) column
    const ipfsLinkCell = document.createElement('td');
    ipfsLinkCell.textContent = fileData.ipfsurl
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
  }*/

  function addFileToTable(fileData) {
    const newRow = document.createElement('tr');

    // Serial Number column
    const assignedSerialNumbers = new Set();
    function generateUniqueSerialNumber() {
      const serialNumber = Math.floor(Math.random() * 900000) + 100000;
      if (assignedSerialNumbers.has(serialNumber)) {
        return generateUniqueSerialNumber();
      }
      assignedSerialNumbers.add(serialNumber);
      return serialNumber;
    }


    const serialNumber = generateUniqueSerialNumber();

    const serialNoCell = document.createElement('td');
    serialNoCell.textContent = serialNumber;
    newRow.appendChild(serialNoCell);


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

    const walletAddress = localStorage.getItem('walletAddress');
    let sampleAccessData = []
    manageAccessBtn.addEventListener('click', () => {
      console.log("In manage access")
      const popUpData = [ {"function" : "getAccessRecord"}, {
        "owner": walletAddress,
        "ipfsurl": fileData.ipfsurl    
      }]
      fetch ("https://dmedico-6k6gsdlfoa-em.a.run.app/update", {

        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        body: JSON.stringify(popUpData),
      })
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        sampleAccessData = data.records

        
      })
      .catch((e) => {
        console.error(e)
      })

      openPopupBox(sampleAccessData);
      //console.log(iplink)
      
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

function openPopupBox(recordArray) {
  const popupBox = document.getElementById('popupBox');
  const accessTable = document.getElementById('accessTable');
  const closePopupBtn = document.getElementById('closePopupBtn');
  const closePopupBtnNew = document.getElementById('closePopupBtnNew');

  //const popupFileLink = document.getElementById('popupFileLink');
  //popupFileLink.textContent = iplink;
  const fileNameElement = document.getElementById('popupFileName');
  //fileNameElement.textContent = fileName;

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

while (accessTable.rows.length > 1) {
  accessTable.deleteRow(1);
}

// Fetch and display access data from localStorage or server

// Example usage: Display sample access data


/*const sampleAccessData = [
  { userName: 'John Doe', walletAddress: '0x123abc' },
  { userName: 'Jane Smith', walletAddress: '0x456def' },
  { userName: 'Alice Johnson', walletAddress: '0x789ghi' }
];*/
accessRecords(recordArray)

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

  function generateUniqueSerialNumber() {
    return Math.floor(Math.random() * 900000) + 100000;
  }

  // Handle the form submission, e.g., retrieve input values and perform actions
  const userName = document.getElementById('userNameInput').value;
  const walletAddress = document.getElementById('walletAddressInput').value;
  const remarks = document.getElementById('remarksInput').value;

  const slNo = generateUniqueSerialNumber()
  const ownerAddress = localStorage.getItem('walletAddress');
  console.log(ownerAddress)
  const lna = localStorage.getItem("fileData");
  const parsedData = JSON.parse(lna);
  const fname = parsedData.fileName;

  console.log(fname);


  const data3 = [ {"function" : "giveAccess"}, {
    "id": slNo.toString(),
    "owner": ownerAddress,
    "filename": fname,    
    "ipfsurl": "https://bafybeihiv7djpfbb6ypufrt32f6xg6eqi7ekya7l5gcykpoh2ge6dfywi4.ipfs.sphn.link",
    "username": userName,
    "userwallet": walletAddress
  }

]
fetch ("https://dmedico-6k6gsdlfoa-em.a.run.app/update", {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    body: JSON.stringify(data3),
})
 .then((res) => res.json())
 .then((data) => console.log(data))
 .catch((e) => {console.error(e)})

 
  

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
const tableBody = sharedFilesTable.querySelector('tbody'); // Get the table body element


let isViewingSharedFiles = false;

function updateDashboard() {
  const table = document.getElementById('dataTable');
const tableBody = table.querySelector('tbody');

const dashboardData = [ {"function" : "getFilesByOwner"}, {
  "owner": signInAddr
}]


fetch('https://dmedico-6k6gsdlfoa-em.a.run.app/update', {
method: 'POST',
headers: {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
},
body: JSON.stringify(dashboardData)
})
.then((response) => response.json())
.then((data) => {
  // Process the fetched data
  console.log(data);
  const dashboardArray = data.records;
  let owner = localStorage.getItem('walletAddress');
  console.log(owner)
  

  dashboardArray.forEach((record) => {
    const newRow = tableBody.insertRow();
    const iplink = record.ipfsurl
    const fileIdCell = newRow.insertCell();
    fileIdCell.textContent = record.id;

    const fileNameCell = newRow.insertCell();
    fileNameCell.textContent = record.filename;

    const dateTimeCell = newRow.insertCell();
    dateTimeCell.textContent = record.dateTime;

    const permissionsCell = newRow.insertCell();
    const manageAccessBtn = document.createElement('button');
    manageAccessBtn.className = 'manageAccessBtn';
    manageAccessBtn.textContent = 'Manage Access';
    permissionsCell.appendChild(manageAccessBtn);
    let submitBtnData = []
    manageAccessBtn.addEventListener('click', () => {
      console.log("In manage access")
      const popUpData = [ {"function" : "getAccessRecord"}, {
        "owner": owner,
        "ipfsurl": record.ipfsurl    
      }]
      fetch ("https://dmedico-6k6gsdlfoa-em.a.run.app/update", {

        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        body: JSON.stringify(popUpData),
      })
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        submitBtnData = data.records
      })
      .catch((e) => {
        console.error(e)
      })

      openPopupBox(submitBtnData);
      //console.log(iplink)
      
      });

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
  });
})
.catch((error) => {
  console.error('Error fetching records:', error);
});

}


viewFilesBtn.addEventListener('click', () => {
if (isViewingSharedFiles) {
  viewFilesBtn.textContent = 'View Shared Files';
  dataTable.style.display = 'table';
  sharedFilesTable.style.display = 'none';
  updateDashboard()
  
} else {
  viewFilesBtn.textContent = 'View Your Files';
  dataTable.style.display = 'none';
  sharedFilesTable.style.display = 'table';
  updateSharedFilesTable()
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
/*
// Add this function in your db.js code
function logoutFromMetaMask() {
  localStorage.removeItem('walletAddress');
  window.location.href = 'index.html';
}

// Add this event listener to your logout button
const logoutBtn = document.getElementById('logoutBtn');
logoutBtn.addEventListener('click', logoutFromMetaMask);*/

//const sharedFilesTable = document.getElementById('sharedFilesTable');
//const tableBody = sharedFilesTable.querySelector('tbody'); // Get the table body element


// Sample data for shared files

/*
const sharedFilesData = [
  {
    fileFrom: 'User A',
    fileName: 'File 1',
    remarks: 'Shared with User B',
    timeOfSharing: '2023-05-24 10:30 AM',
    viewLink: 'https://example.com/file1',
  },
  {
    fileFrom: 'User B',
    fileName: 'File 2',
    remarks: 'Shared with User A',
    timeOfSharing: '2023-05-24 11:45 AM',
    viewLink: 'https://example.com/file2',
  },
  // Add more shared files data as needed
];*/
function updateSharedFilesTable() {
  const tableForSharedFiles = document.getElementById('sharedFilesTable');
const tableBodyForSharedFiles = tableForSharedFiles.querySelector('tbody');

const walletAddress = localStorage.getItem('walletAddress');

const requestDataForFiles = [
  { "function": "getSharedFiles" },
  { "userwallet": walletAddress }
];
let sharedData = []
fetch("https://dmedico-6k6gsdlfoa-em.a.run.app/update", {
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(requestDataForFiles),
})
  .then((responseForFiles) => responseForFiles.json())
  .then((responseDataForFiles) => {
    console.log(responseDataForFiles.records);
    sharedData = responseDataForFiles.records

    tableBodyForSharedFiles.innerHTML = '';

    function formatDateAndTime(dateTimeValue) {
      const dateValue = new Date(dateTimeValue);
      const formattedDateValue = dateValue.toLocaleDateString();
      const formattedTimeValue = dateValue.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return formattedDateValue + ' ' + formattedTimeValue;
    }

    const prt = Object.values(sharedData)
    //console.log("PRT : ",prt)
    //const ele = prt[1]
    for ( let i=0; i<sharedData.length; i++){
      //console.log(prt[i])
      const newRowForFile = tableBodyForSharedFiles.insertRow();
      const fileFromCell = newRowForFile.insertCell();  
      fileFromCell.textContent = sharedData[i].username;    

      const fileNameCell = newRowForFile.insertCell();
      fileNameCell.textContent = sharedData[i].filename;

      const remarksCell = newRowForFile.insertCell();
      remarksCell.textContent = 'Shared with ' + sharedData[i].owner;

      const timeOfSharingCell = newRowForFile.insertCell();
      timeOfSharingCell.textContent = sharedData[i].id

      const viewCell = newRowForFile.insertCell();
      const viewLink = document.createElement('a');
      viewLink.textContent = 'View';
      viewLink.href = sharedData[i].ipfsurl;
      viewLink.target = '_blank';
      viewCell.appendChild(viewLink);

      
    }
    
  })
  .catch((errorForFiles) => {
    console.error(errorForFiles);
  });
}
// Function to dynamically update the shared files table


// Call the function to initially populate the table
//updateSharedFilesTable();

function accessRecords(accessData) {
  console.log("access records : ",accessData)
  accessData.forEach(access => {
    const newRow = accessTable.insertRow();
    newRow.insertCell().textContent = access.username;
    //newRow.insertCell().textContent = "Hardcoded"
    newRow.insertCell().textContent = access.userwallet;
    //newRow.insertCell().textContent = "hardcoded wallet"
    const revokeCell = newRow.insertCell();
    const revokeBtn = document.createElement('button');
    revokeBtn.textContent = 'Revoke';
    revokeBtn.className = 'revoke';
    revokeCell.appendChild(revokeBtn);
    revokeBtn.addEventListener('click', () => {
      const data5 = [ {"function" : "revokeAccess"}, {
        "id": access.id    
      }]
      fetch ("https://dmedico-6k6gsdlfoa-em.a.run.app/update", {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        body: JSON.stringify(data5),
      })
        .then((res) => res.json())
        .then((data) => console.log(data))
        .catch((e) => {console.error(e)})
        
        
      })
  });
  
}