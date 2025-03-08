"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinacialManager = void 0;
/*TUDO DENTRO DESSE MODULO VAI TRATAR DE FINACAS NA PLATAFORMA
-SALDO DE CARTEIRA
-TRANFERENCIA DE DINHEIRO ENTRE CARTEIRAS
*/
var FinacialManager;
(function (FinacialManager) {
    FinacialManager.addFundsHandler = (req, res) => {
        //Marcelinho
    };
    FinacialManager.withDrawFundsHandler = (req, res) => {
        //Marcelinho
    };
    FinacialManager.betOnEventHandler = (req, res) => {
        //Mateus
    };
    FinacialManager.getWalletBalanceHandler = (req, res) => {
        //
        const accemail = req.get('email');
        if (!accemail || typeof accemail !== 'string') {
            res.statusCode = 400;
            res.send('E preciso um email');
        }
    };
    FinacialManager.walletTransactionHandler = (req, res) => {
    };
})(FinacialManager || (exports.FinacialManager = FinacialManager = {}));
