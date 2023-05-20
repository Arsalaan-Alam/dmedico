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
  
    submitButton.addEventListener('click', () => {
      const selectedFile = fileInput.files[0];
      if (selectedFile) {
        const formData = new FormData();
        formData.append('uploadedFile', selectedFile);

        //provider = new ethers.providers.JsonRpcProvider()
        const provider = new ethers.providers.JsonRpcProvider('https://api.hyperspace.node.glif.io/rpc/v1')
        signer = provider.getSigner(0);
        console.log(signer)


        // Send the formData to the server or endpoint using fetch or other methods
        // Example:
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
      }
    });
  });
  