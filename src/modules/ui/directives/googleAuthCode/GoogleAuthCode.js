(function () {
    'use strict';

    const { find, propEq } = require('ramda');

    /**
     * @param {typeof Base} Base
     * @param {JQuery} $element
     * @return {GoogleAuthCode}
     */
    const controller = function (Base, $element) {

        class GoogleAuthCode extends Base {

            /**
             * @type {GoogleAuthCode.onFillCode}
             */
            onFillCode = null;
            /**
             * @type {Array<HTMLInputElement>}
             * @private
             */
            _inputList = [];

            $postLink() {
                this._inputList = $element.find('input').toArray();
                this._setHandlers();
                this._setFirstEmptyInputFocus();
            }

            /**
             * @private
             */
            _setHandlers() {
                $element.on('input', 'input', e => this._onInput(e));
            }

            /**
             * @private
             */
            _onInput() {
                if (this._isAllFilled()) {
                    this.onFillCode({ code: this._getCode() });
                    this._clearAll();
                } else {
                    this._setFirstEmptyInputFocus();
                }
            }

            /**
             * @return {HTMLInputElement|void}
             * @private
             */
            _getFirstEmptyInput() {
                return find(propEq('value', ''), this._inputList);
            }

            _setFirstEmptyInputFocus() {
                const input = this._getFirstEmptyInput();
                if (input) {
                    input.focus();
                }
            }

            /**
             * @return string
             * @private
             */
            _getCode() {
                return this._inputList
                    .map(input => input.value)
                    .reduce((acc, value) => acc + value);
            }

            /**
             * @return boolean
             * @private
             */
            _isAllFilled() {
                return this._inputList.every(input => input.value !== '');
            }

            /**
             * @private
             */
            _clearAll() {
                this._inputList.forEach(input => {
                    input.value = '';
                });
            }

        }

        return new GoogleAuthCode();
    };

    controller.$inject = ['Base', '$element'];

    angular.module('app.ui').component('wGoogleAuthCode', {
        controller,
        bindings: {
            onFillCode: '&'
        },
        templateUrl: 'modules/ui/directives/googleAuthCode/template.html',
        scope: false,
        transclude: false
    });
})();

/**
 * @name GoogleAuthCode
 */

/**
 * @typedef {function} GoogleAuthCode#onFillCode
 * @param {object} data
 * @param {string} data.code
 * @return void
 */
