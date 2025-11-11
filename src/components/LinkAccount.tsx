import React from 'react';
import MonoConnect from '@mono.co/connect.js';
import axios from 'axios';
// code_LbDBViEnE9d10JIend6hJt04
// 67d14ad2b8754b319ead0c8a
export default function LinkAccount() {
  const monoConnect = React.useMemo(() => {
    const monoInstance = new MonoConnect({
      onClose: () => console.log('Widget closed'),
      onLoad: () => console.log('Widget loaded successfully'),
      onSuccess: ({ code }) => console.log(`Linked successfully: ${code}`),
      key: "test_pk_s69umck991ti3jbe7ndo"
    })

    monoInstance.setup()
    
    return monoInstance;
  }, [])
  const verify = async() => {
    try {
        const response = await axios.post('https://api.withmono.com/v2/accounts/auth', {
          code: "code_LbDBViEnE9d10JIend6hJt04"
        }, {
          headers: {
            'Content-Type': 'application/json',
            'mono-sec-key': 'test_sk_xg4rln4n7xozwe68pz42' // Replace with your secret key
          }
        });
        console.log(response)
        return response.data.id; // Account ID
      } catch (error) {
        console.error('Error exchanging code for Account ID:', error.response ? error.response.data : error.message);
        throw error;
      }
  }
  return (
    <div>
      <button onClick={() => monoConnect.open()}>
        Link account with Mono
      </button>
      <button onClick={() => verify()}>
        verify
      </button>
    </div>
  )
}