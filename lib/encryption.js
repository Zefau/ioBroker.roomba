'use strict';
const _sodium = require('libsodium-wrappers');


/**
 * Library Encryption
 *
 * @description Library for encryption support
 * @author Zefau <https://github.com/Zefau/>
 * @license MIT License
 * @version 0.2.0
 * @date 2019-06-08
 *
 */
class Encryption
{
	/**
	 * Constructor.
	 *
	 * @param	{object}	adapter		ioBroker adpater object
	 *
	 */
    constructor(adapter)
	{
		this._adapter = adapter;
    }
	
	/**
	 * Generates an encryption key.
	 *
	 * @param	void
	 * @return	{string}				Encryption key
	 *
	 */
	getEncryptionKey()
	{
		return _sodium.to_hex(_sodium.crypto_secretbox_keygen());
	}
	
	/**
	 * Encrypts a message with given key.
	 *
	 * @param	{string}	key			Key to be used to encrypt message
	 * @param	{string}	message		Message to be encrypted
	 * @return	{string}				Encrypted message
	 *
	 */
	encrypt(key, message)
	{
		var nonce = _sodium.randombytes_buf(_sodium.crypto_secretbox_NONCEBYTES);
		try
		{
			return '';
			//return _sodium.to_hex(_concat(Uint8Array, nonce, _sodium.crypto_secretbox_easy(message, nonce, _sodium.from_hex(key))));
		}
		catch(e)
		{
			this._adapter.log.warn(e.message);
			return false;
		}
	}
	
	/**
	 * Decrypts a message with given key.
	 *
	 * @param	{string}	key			Key to be used to decrypt message
	 * @param	{string}	message		Message to be decrypted
	 * @return	{string}				Decrypted message
	 *
	 */
	decrypt(key, message)
	{
		try
		{
			let cypherText = new Buffer(payload, 'base64');
			let nonce = cypherText.slice(0, _sodium.crypto_secretbox_NONCEBYTES);
			
			let encryptionKey = new Buffer(32);
			encryptionKey.fill(0);
			encryptionKey.write(key);
			
			return _sodium.crypto_secretbox_open_easy(cypherText.slice(_sodium.crypto_secretbox_NONCEBYTES), nonce, encryptionKey, 'text');
		}
		catch(e)
		{
			this._adapter.log.warn(e.message);
			return false;
		}
	}
}

module.exports = Encryption;
