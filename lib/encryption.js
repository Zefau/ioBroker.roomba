'use strict';
const _sodium = require('libsodium-wrappers');
const _concat = require("concat-typed-array");

/**
 * Library Encryption
 *
 * @description Library for encryption support
 * @author Zefau <https://github.com/Zefau/>
 * @license MIT License
 * @version 0.1.0
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
			return _sodium.to_hex(_concat(Uint8Array, nonce, _sodium.crypto_secretbox_easy(message, nonce, _sodium.from_hex(key))));
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
			message = _sodium.from_hex(message);
			return _sodium.to_string(_sodium.crypto_secretbox_open_easy(message.slice(_sodium.crypto_secretbox_NONCEBYTES), message.slice(0, _sodium.crypto_secretbox_NONCEBYTES), _sodium.from_hex(key)));
		}
		catch(e)
		{
			this._adapter.log.warn(JSON.stringify(e.message));
			return false;
		}
	}
}

module.exports = Encryption;
