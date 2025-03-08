"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsManager = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const accounts_1 = require("./accounts");
var EventsManager;
(function (EventsManager) {
    async function creatingEvent(eventname, summary, valorbet, receveingbetsdatebeginning, receveingbetsdateending, eventdate) {
    }
    EventsManager.ApproveEventHandler = (req, res) => {
    };
    EventsManager.getEventsHandler = (req, res) => {
    };
    EventsManager.deleteEventHandler = (req, res) => {
        //gabriel
    };
    EventsManager.NewEventHandler = async (req, res, next) => {
        //gabriel 
        //(Serviço para cadastrar um evento colocando-o na lista de espera para aprovação pelo moderador)
        await accounts_1.AccountsManager.LoginHandler(req, res, next);
        const eventname = req.get('eventname');
        const summary = req.get('summary');
        const valordabet = req.get('valordabet');
        const receveingbetdatebeg = req.get('receveingbetsdatebeginning');
        const receveingabetdateend = req.get('receveingbetsdateending');
        const eventdate = req.get('eventdate');
        if (eventname && summary && receveingabetdateend && receveingbetdatebeg && eventdate) {
            const valorbet = parseFloat(valordabet);
            if (valorbet >= 1 && valorbet) {
                res.statusCode = 200;
                res.send('Evento adicionado');
            }
            else {
                res.statusCode = 403;
                res.send('Não sao permitidas bets com valor inferior a R$1,00');
            }
        }
        else {
            res.statusCode = 403;
            res.send('Alguma informacao nao foi adicionada');
        }
    };
    EventsManager.finishEventHandler = (req, res) => {
        //gabriel
    };
    EventsManager.searchEventHandler = (req, res) => {
    };
    EventsManager.evaluateNewEvent = (req, res) => {
    };
})(EventsManager || (exports.EventsManager = EventsManager = {}));
