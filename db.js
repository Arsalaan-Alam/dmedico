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
    manageAccessBtn.addEventListener('click', () => {
      openPopupBox(fileData.fileName);
    });

    const giveAccessBtn = document.createElement('button');
    giveAccessBtn.className = 'giveAccessBtn';
    giveAccessBtn.textContent = 'Give Access';
    permissionsCell.appendChild(giveAccessBtn);

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
  
  // Clear existing table rows
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
    revokeCell.appendChild(revokeBtn);
  });

  // Show the popup box
  popupBox.style.display = 'block';

  // Close the popup box on "Close" button click
  closePopupBtn.addEventListener('click', () => {
    popupBox.style.display = 'none';
  });
}
























/*window.addEventListener('DOMContentLoaded', () => {
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
  
    submitButton.addEventListener('click', async() => {
      const selectedFile = fileInput.files[0];
      if (selectedFile) {
        const formData = new FormData();
        formData.append('uploadedFile', selectedFile);

        //provider = new ethers.providers.JsonRpcProvider()
        const provider = new ethers.providers.JsonRpcProvider('https://api.hyperspace.node.glif.io/rpc/v1')
        signer = await provider.getSigner(0)
        formData.append('signer', signer)
        /*
          .then((res) => {
            console.log(res.json())
          })
          .catch((e) => {
            console.log(e)
          })
        */


        // Send the formData to the server or endpoint using fetch or other methods
        // Example:
/*
        fetch('http://localhost:5000/send', {
          method: 'POST',
          body: formData,
        })
          .then(response => response.json())
          .then(data => {
            console.log('File submitted successfully:', data);
            // Handle the response from the server or endpoint
          })
          .catch(error => {
            console.error('Error submitting file:', error);
            // Handle the error as needed
          });
          window.alert("File Uploaded Successfully!")
          submitButton.style.display = 'none';
          fileDisplay.style.display = 'none';

      }
    });
  });
*/