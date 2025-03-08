import express from "express";
import {Request, Response, Router} from "express";
import { AccountsManager } from "./accounts/accounts";
import { FinacialManager } from "./financial/financial";  
import { finalization } from "process";
import { EventsManager } from "./events/events";
import cors from "cors"
import cookieParser from "cookie-parser";

const port = 3000; 
const server = express();
const routes = Router();
server.use(cors({
    origin: 'http://127.0.0.1:5500', 
    credentials: true, 
}));

server.use(cookieParser());


routes.get('/', (req: Request, res: Response)=>{
    res.statusCode = 403;
    res.send('Acesso não permitido.Rota default nao definida...');
});


routes.put('/signUp', AccountsManager.signUpHandler);                              //CONCLUIDA 
routes.get('/Login', AccountsManager.LoginHandler);                               // CONCLUIDA
routes.get('/getWalletBalance', FinacialManager.getWalletBalanceHandler);             //CONCLUIDA
routes.post('/WalletTransaction', FinacialManager.walletTransactionHandler);             //CONCLUIDA 
routes.post('/AddFundsToWallet', FinacialManager.addFundsHandler);                     //CONCLUIDA
routes.post('/WithdrawFunds', FinacialManager.withDrawFundsHandler);               //CONCLUIDA 
routes.get('/GetToken', AccountsManager.ViewTokenHandler);                    // CONCLUIDA 
routes.post('/EvaluateNewEvent', EventsManager.evaluateNewEvent);          //CONCLUIDA --FEITO SEPARADO EM APPROVE E Denie   
routes.post('/BetOnevent', FinacialManager.betOnEventHandler);          // CONCLUIDA   
routes.post('/CreateNewEvent', EventsManager.NewEventHandler);                // CONCLUIDA
routes.post('/DenieEvent', EventsManager.DenieEventHandler);                       // CONCLUIDA        
routes.post('/SearchEvent', EventsManager.searchEventHandler);                   //CONCLUIDA 
routes.post('/ApproveEvent', EventsManager.ApproveEventHandler);                // CONCLUIDA  
routes.get('/GetEvents', EventsManager.getEventsHandler);                      //CONCLUIDA                 
routes.post('/DeleteEvents', EventsManager.DeleteEventHandler);        //CONCLUIDA
routes.post('/FinishEvent', EventsManager.finishEventHandler);
routes.post('/TopBettedEvents', EventsManager.TopBettedEventsHandler);
routes.post('/GetEventsDate', EventsManager.GetEventsDateHandler);
routes.get('/getEventsQtyy', EventsManager.getProductsQttyHandler);
routes.post('/getEventsByPage', EventsManager.getEventsByPageHandler);
routes.post('/GetBetsByToken', EventsManager.GetBetsByTokenHandler);

server.use(routes);

server.listen(port, ()=>{
    console.log(`Server is running on: ${port}`);
})