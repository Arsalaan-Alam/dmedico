window.addEventListener('DOMContentLoaded', () => {
    const address = localStorage.getItem('walletAddress'); // Retrieve the wallet address from localStorage
    displayWelcomeMessage(address);
  
    const addFileBtn = document.getElementById('addFileBtn');
    const fileInput = document.getElementById('fileInput');
    const fileDisplay = document.getElementById('fileDisplay');
    const submitButton = document.createElement('button');
    submitButton.id = 'submitButton';
    submitButton.textContent = 'Submit';
    submitButton.style.display = 'none';
  
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
        const submitButton = document.getElementById('submitButton');
  submitButton.style.display = 'block';
      }
      
  });
  