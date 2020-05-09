//@ts-check
module.exports = (function () {
  let port = 8080;
  let protocol = 'ws';
  let hostname = 'localhost';

  return {
    port: function (arg) {
      if (typeof arg === 'undefined') {
        return port;
      }

      port = parseInt(arg, 10) || port;
      return port;
    },

    protocol: function (arg) {
      if (typeof arg === 'undefined') {
        return protocol;
      }

      protocol = '' + arg || protocol;
      return protocol;
    },

    hostname: function (arg) {
      if (typeof arg === 'undefined') {
        return hostname;
      }

      hostname = '' + arg || hostname;
      return hostname;
    },

    getFullUrl: function () {
      return protocol + '://' + hostname + ':' + port + '/';
    },
  };
})();
