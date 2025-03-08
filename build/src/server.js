"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_2 = require("express");
const accounts_1 = require("./accounts/accounts");
const port = 3000;
const server = (0, express_1.default)();
const routes = (0, express_2.Router)();
// definir as rotas. 
// a rota tem um verbo/método http (GET, POST, PUT, DELETE)
routes.get('/', (req, res) => {
    res.statusCode = 403;
    res.send('Acesso não permitido.');
});
// vamos organizar as rotas em outro local 
// login...
routes.post('/login', accounts_1.AccountsHandler.loginHandler);
server.use(routes);
server.listen(port, () => {
    console.log(`Server is running on: ${port}`);
});
