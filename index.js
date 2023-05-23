window.addEventListener('DOMContentLoaded', async () => {
  const loginBtn = document.getElementById('loginBtn');
  loginBtn.addEventListener('click', loginWithMetaMask);
});

async function loginWithMetaMask() {
  const provider = await detectEthereumProvider();

  if (provider) {
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const selectedAddress = accounts[0]; // The user's selected address
      console.log('User logged in with address:', selectedAddress);
      localStorage.setItem('walletAddress', selectedAddress);
      window.location.href = 'dashboard.html';
    } catch (error) {
      console.log('Error:', error.message);
    }
  } else {
    alert('Please install MetaMask'); // Display alert popup
  }
}

ethereum.on('accountsChanged', (accounts) => {
  const selectedAddress = accounts[0]; // The user's selected address
  console.log('User switched to address:', selectedAddress);
  const addressDisplay = document.getElementById('addressDisplay');
  addressDisplay.textContent = `Logged in address: ${selectedAddress}`;
});
