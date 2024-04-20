const crypto = require('crypto');
const pkcs7 = require("pkcs7");

const privateKey   = 'CIPHERKEY01234567890123456789012'; // set random encryption key
const ivKey        = 'CIPHERIVKEY01234'; // set random initialisation vector
const chainingMode = "AES-256-CBC";

// AES256 CBC 암호화
const encrypt = (utf8Text) => {
    const cipher = crypto.createCipheriv(chainingMode, privateKey, ivKey);
    cipher.setAutoPadding(false);
    let encrypted = cipher.update(pkcs7Pad(utf8Text), undefined, "base64");
    encrypted += cipher.final("base64");
    return encrypted;
};

// AES256 CBC 복화
const decrypt = (base64Text) => {
    const decipher = crypto.createDecipheriv(chainingMode, privateKey, this._ivKey);
    decipher.setAutoPadding(false);
    let decrypted = decipher.update(base64Text, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return pkcs7Unpad(decrypted);
};

// CBC로 변환하는 암호화
const pkcs7Pad = (params) => {
    const buffer = Buffer.from(params, "utf8");
    const bytes = new Uint8Array(buffer.length);
    let i = buffer.length;
    while (i--) {
        bytes[i] = buffer[i];
    }
    return Buffer.from(pkcs7.pad(bytes));
}

// CBC를 복호화
const pkcs7Unpad = (params) => {
    const buffer = Buffer.from(params, "utf8");
    const bytes = new Uint8Array(buffer.length);
    let i = buffer.length;
    while (i--) {
        bytes[i] = buffer[i];
    }
    const result = Buffer.from(pkcs7.unpad(bytes));
    return result.toString("utf8");
}

module.exports = {
    encrypt: encrypt,
    decrypt: decrypt
}
