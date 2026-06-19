const crypto = require('crypto');

if (!crypto.hash) {
  crypto.hash = function(algorithm, data, outputEncoding = 'hex') {
    return crypto.createHash(algorithm).update(data).digest(outputEncoding);
  };
}
