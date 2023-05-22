window.addEventListener('DOMContentLoaded', async () => {
  const provider = await detectEthereumProvider();
  
  if (provider) {
    const loginBtn = document.getElementById('loginBtn');
    loginBtn.addEventListener('click', loginWithMetaMask);
  } else {
    window.alert('Please install MetaMask');
  }
});

async function loginWithMetaMask() {
  try {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const selectedAddress = accounts[0]; // The user's selected address
    console.log('User logged in with address:', selectedAddress);
    localStorage.setItem('walletAddress', selectedAddress);
    window.location.href = 'dashboard.html';
  } catch (error) {
    console.log('Error:', error.message);
  }
}

ethereum.on('accountsChanged', (accounts) => {
  const selectedAddress = accounts[0]; // The user's selected address
  console.log('User switched to address:', selectedAddress);
  const addressDisplay = document.getElementById('addressDisplay');
  addressDisplay.textContent = `Logged in address: ${selectedAddress}`;
});
