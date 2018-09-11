(function () {
    'use strict';

    /**
     * @return {Service2FA}
     */
    const factory = () => {

        const ds = require('data-service');

        class Service2FA {

            url = '/google-auth';
            signKey = [];

            hasIn2faService(key) {
                return this.checkPKey(key)
                    .then(() => {
                        this.signKey.push(key);
                        return true;
                    })
                    .catch(() => false);
            }

            check2FAKeys(keys) {
                const hasIn2fa = this.hasIn2faService.bind(this);
                this.signKey = [];
                return Promise.all(keys.map(hasIn2fa))
                    .then(hasList => hasList && hasList.some(Boolean));
            }

            checkPKey(pkey) {
                return ds.fetch(`${Service2FA.url}/${pkey}`);
            }

            getPKeyAndSec(pKey = null, secret = null) {
                // TODO get new 2fa pkey and secret
                return { pKey, secret };
            }

            getSign(signable, code) {
                const request = this.signRequest.bind(this, this.signKey[0]);
                return signable.sign2fa({ code, request });
            }

            signRequest(pKey, { code, signData: data }) {
                // TODO get signature from Dimas's serevice
                // TODO get base64 from bytes
                // libs.base64.fromByteArray();
                return ds.fetch(`${Service2FA.url}/${pKey}`, {
                    method: 'POST',
                    body: { data, code }
                });
            }

            setServiceUrl(url) {
                Service2FA.url = url;
            }

        }

        return new Service2FA();
    };

    factory.$inject = [
    ];

    angular.module('app').factory('s2FAService', factory);
})();
