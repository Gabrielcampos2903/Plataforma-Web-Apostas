"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_2 = require("express");
const accounts_1 = require("./accounts");
const financial_1 = require("./financial");
const events_1 = require("./events");
const port = 3000;
const server = (0, express_1.default)();
const routes = (0, express_2.Router)();
// definir as rotas. 
// a rota tem um verbo/método http (GET, POST, PUT, DELETE)
routes.get('/', (req, res) => {
    res.statusCode = 403;
    res.send('Acesso não permitido.Rota default nao definida...');
});
// vamos organizar as rotas em outro local 
routes.put('/signUp', accounts_1.AccountsManager.signUpHandler); //caiua CONCLUIDA 
routes.get('/Login', accounts_1.AccountsManager.LoginHandler); //caiua CONCLUIDA
routes.get('/getWalletBalance', financial_1.FinacialManager.getWalletBalanceHandler); //caiua
routes.post('/WalletTransaction', financial_1.FinacialManager.walletTransactionHandler); //mateus
routes.post('/AddFundsToWallet', financial_1.FinacialManager.addFundsHandler); //mateus
routes.post('/WithdrawFunds', financial_1.FinacialManager.withDrawFundsHandler); //mateus
routes.get('/GetToken', accounts_1.AccountsManager.ViewToken); //macerlinho
routes.post('/EvaluateNewEvent', events_1.EventsManager.evaluateNewEvent); //marcelinho
routes.post('/BetOnevent', financial_1.FinacialManager.betOnEventHandler); //marcelinho
routes.post('/CreateNewEvent', events_1.EventsManager.NewEventHandler); //gabriel
routes.post('/DeleteEvent', events_1.EventsManager.deleteEventHandler); //gabriel
routes.post('/FinishEvent', events_1.EventsManager.finishEventHandler); //gabriel
routes.get('/SearchEvent', events_1.EventsManager.searchEventHandler); //bruno
routes.post('/ApproveEvent', events_1.EventsManager.ApproveEventHandler); //bruno
routes.get('/GetEvents', events_1.EventsManager.getEventsHandler); //bruno
server.use(routes);
server.listen(port, () => {
    console.log(`Server is running on: ${port}`);
});
