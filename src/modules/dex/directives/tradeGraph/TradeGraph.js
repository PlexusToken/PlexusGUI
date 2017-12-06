(function () {
    'use strict';

    /**
     * @param Base
     * @param utils
     * @param {Waves} waves
     * @param {function} createPoll
     * @return {TradeGraph}
     */
    const controller = function (Base, utils, waves, createPoll) {

        class TradeGraph extends Base {

            constructor() {
                super();

                /**
                 * @type {string}
                 */
                this._amountAssetId = null;
                /**
                 * @type {string}
                 */
                this._priceAssetId = null;
                /**
                 * @type {IAsset}
                 * @private
                 */
                this._amountAsset = null;
                /**
                 * @type {IAsset}
                 * @private
                 */
                this._priceAsset = null;

                this.options = {
                    margin: {
                        top: 10,
                        left: 70,
                        right: 70
                    },
                    grid: {
                        x: false,
                        y: false
                    },
                    tooltipHook: (d) => {
                        if (d) {
                            const x = d[0].row.x;
                            const precisionPrice = this._priceAsset && this._priceAsset.precision || 8;
                            const precisionAmount = this._amountAsset && this._amountAsset.precision || 8;
                            return {
                                abscissas: `Price ${x.toFixed(precisionPrice)}`,
                                rows: d.map((s) => {
                                    return {
                                        label: s.series.label,
                                        value: s.row.y1.toFixed(precisionAmount),
                                        color: s.series.color,
                                        id: s.series.id
                                    };
                                })
                            };
                        }
                    },
                    series: [
                        {
                            dataset: 'asks',
                            key: 'amount',
                            label: 'Asks',
                            color: '#f27057',
                            type: ['line', 'line', 'area']
                        },
                        {
                            dataset: 'bids',
                            key: 'amount',
                            label: 'Bids',
                            color: '#2b9f72',
                            type: ['line', 'line', 'area']
                        }
                    ],
                    axes: {
                        x: { key: 'price', type: 'linear', ticks: 4 },
                        y: { key: 'amount', ticks: 4 }
                    }
                };

                this.data = {
                    asks: [{ amount: 0, price: 0 }],
                    bids: [{ amount: 0, price: 0 }]
                };

                this.syncSettings({
                    _amountAssetId: 'dex.amountAssetId',
                    _priceAssetId: 'dex.priceAssetId'
                });

                this.observe(['_amountAssetId', '_priceAssetId'], this._onChangeAssets);
                /**
                 * @type {Poll}
                 * @private
                 */
                this._poll = createPoll(this, this._getOrderBook, this._setOrderBook, 1000);
            }

            _getOrderBook() {
                return waves.matcher.getOrderBook(this._priceAssetId, this._amountAssetId);
            }

            _setOrderBook([bids, asks]) {
                this.data.bids = bids;
                this.data.asks = asks;
            }

            _onChangeAssets() {
                waves.node.assets.info(this._priceAssetId)
                    .then((asset) => {
                        this._priceAsset = asset;
                    });
                waves.node.assets.info(this._amountAssetId)
                    .then((asset) => {
                        this._amountAsset = asset;
                    });
                return this._poll.restart();
            }

        }

        return new TradeGraph();
    };

    controller.$inject = ['Base', 'utils', 'waves', 'createPoll'];

    angular.module('app.dex')
        .component('wDexTradeGraph', {
            templateUrl: 'modules/dex/directives/tradeGraph/tradeGraph.html',
            controller
        });
})();
