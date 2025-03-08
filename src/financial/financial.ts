import e, {Request, RequestHandler, Response} from "express";
import { get, validateHeaderName } from "http";
import OracleDB, { STMT_TYPE_UNKNOWN } from "oracledb";
import dotenv from 'dotenv'; 
dotenv.config();
import { AccountsManager } from "../accounts/accounts";
import { EventsManager } from "../events/events";



export namespace FinacialManager{

    async function betOnEvent(title:string, betvalue:number, token:string, guess:string) {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        let checkbet = await connection.execute(
            `SELECT WALLET_VALUE FROM ACCOUNTS WHERE WALLET_VALUE < :betvalue AND TOKEN = :token`,
            [betvalue, token]
        );
        

        if(checkbet.rows && checkbet.rows.length <= 0){

            let cstatus = await connection.execute(
                `SELECT STATUS FROM EVENTS WHERE STATUS = 'APPROVED' AND TITLE = :title`,
                [title]
            );
            

            if(cstatus.rows && cstatus.rows.length > 0){
                let checkminimunbet = await connection.execute(
                    `SELECT TITLE FROM EVENTS WHERE VALORDABET <= :betvalue AND TITLE = :title`,
                    [betvalue, title]
                );
                
          
                if(checkminimunbet.rows && checkminimunbet.rows.length > 0){
                    let bet = await connection.execute(
                        `INSERT INTO BETS(
                        ID,
                        TOKEN,
                        BETVALUE,
                        EVENT_TITLE,
                        GUESS
                        )
                        VALUES(
                        SEQ_BETS.NEXTVAL,
                        :token,
                        :betvalue,
                        :title,
                        :guess
                        )`,
                        [token, betvalue, title, guess]
                    );
                    await connection.commit();
                    

                    let updatewallet = await connection.execute(
                        `UPDATE ACCOUNTS SET WALLET_VALUE = WALLET_VALUE - :betvalue WHERE TOKEN = :token`,
                        [betvalue, token]
                    );
                    

                    await connection.commit();
                    await connection.close();
                    return updatewallet;
                }
                else{
                    return true;
                }
            }
            else{
                await connection.close();
                return true;
            }
            
        }
        else{
            await connection.close();
            return true;
        }
       


    }
    
    async function getBalance(email:string, password:String, value: number) {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        let showfunds = await connection.execute(
            `SELECT EMAIL FROM ACCOUNTS WHERE WALLET_VALUE < :value AND  EMAIL = :email AND PASSWORD = :password`,
            [value, email, password]
        );

        if(showfunds.rows && showfunds.rows.length <= 0)
        {
            await connection.close();
            return true 
        }
        else{
            await connection.close();
            return false;
        }
    }

    async function WalletTransaction(emailsending:string , passwordSending:string, emailreceveing:string, value:number) {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });
        let walletTransactionsend = await connection.execute(
            `UPDATE ACCOUNTS SET WALLET_VALUE = WALLET_VALUE - :value WHERE EMAIL = :emailsending AND PASSWORD = :passwordsending`,
            [value, emailsending, passwordSending]
        );

        let wallettransactionrec = await connection.execute(
            `UPDATE ACCOUNTS SET WALLET_VALUE = WALLET_VALUE + :value WHERE EMAIL = :emailreceveing`,
            [value, emailreceveing]
        );

        await connection.commit();
        await connection.close();
    }

    async function withDraw(token: string, newvalue:number) {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        let showfunds = await connection.execute(
            `SELECT EMAIL FROM ACCOUNTS WHERE WALLET_VALUE < :valuetowithdraw AND TOKEN = :token`,
            [newvalue, token]
        );

        
        if (showfunds.rows && showfunds.rows.length <= 0) {
            if ( newvalue <= 100){

               
                let addfunds = await connection.execute(
                `UPDATE ACCOUNTS SET WALLET_VALUE = (WALLET_VALUE - :newvalue) WHERE TOKEN = :token`,
                [newvalue, token]
            );
                
                await connection.commit();
                await connection.close();
                return addfunds;
            }

             else if ( newvalue >= 101 && newvalue <= 1000){

                    
                    
                    let addfunds = await connection.execute(
                    `UPDATE ACCOUNTS SET WALLET_VALUE = WALLET_VALUE - :newvalue WHERE TOKEN = :token`,
                    [newvalue, token]
                    );

                    await connection.commit();
                    await connection.close();
                    return addfunds;
                
             }
             else if ( newvalue >= 1001 && newvalue <= 5000){
                  
                    let addfunds = await connection.execute(
                    `UPDATE ACCOUNTS SET WALLET_VALUE = WALLET_VALUE - :newvalue  WHERE TOKEN = :token`,
                    [newvalue, token]
                );

                await connection.commit();
                await connection.close();
                return addfunds;
                
             }
             else if ( newvalue >= 5001 && newvalue < 100000){
                    
                    let addfunds = await connection.execute(
                    `UPDATE ACCOUNTS SET WALLET_VALUE = WALLET_VALUE - :newvalue WHERE TOKEN = :token`,
                    [newvalue, token]
                );
                await connection.commit();
                await connection.close();
                return addfunds;
                
             }
             else if ( newvalue >= 100000){
                    
                    let addfunds = await connection.execute(
                    `UPDATE ACCOUNTS SET WALLET_VALUE = WALLET_VALUE - :newvalue  WHERE TOKEN = :token`,
                    [newvalue, token]
                );
                await connection.commit();
                await connection.close();
                return addfunds;
            
        }

        }
        else{
            return false;
        }
    }

    async function getWalletBalance(token:string) {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        let getwallet = await connection.execute(
            `SELECT WALLET_VALUE FROM ACCOUNTS WHERE TOKEN = :token`,
            [token]
        );

        await connection.close();
        return getwallet;
        
    };

    export async function AddFunds(value: number, token: string) {

        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        console.log(value);
        console.log(token);

        let addfunds = await connection.execute(
            `UPDATE ACCOUNTS SET WALLET_VALUE = WALLET_VALUE + :valueToAdd WHERE TOKEN = :token`,
            [value, token]
        );


        await connection.commit();
        await connection.close();

        return addfunds;
    }
    
    export const addFundsHandler: RequestHandler = async (req: Request, res: Response) => {
        const value = req.get('value');
        const token = req.get('token')
    
        if (value && token){
            const DepositValue = parseFloat(value);
            
                if ( DepositValue > 0){
                    const deposit = await AddFunds(DepositValue, token);
                    res.statusCode = 200;
                    res.send(deposit.rows);
                }
                else{
                    res.statusCode = 403;
                    console.log('erro2');
                    res.send('Nao e possivel adiconar R$0.00 ou menos');
                }
        }
        else{
            res.statusCode = 403;
            console.log('erro1')
            res.send('Alguma informacao esta faltando ou errada')
        }
    }

    export const withDrawFundsHandler: RequestHandler = async (req: Request, res: Response) => {
        const valuetowithdraw = req.get('valuetowithdraw');
        const token = req.get("token");

        if (token && valuetowithdraw)
        {
            
            const valuewithdraw = parseFloat(valuetowithdraw);
            const withDrawf = await withDraw(token, valuewithdraw);
            if (withDrawf !== false)
            {
                res.statusCode = 200;
                res.send();
            }
            else{
                res.statusCode = 403;
                res.send('Valor insuficiente em conta Ou valores <= a 0 nao permitidos')
            }
        }
        else{
            res.statusCode = 403;
            res.send('Alguma informacao esta faltando')
        }

        
    }
    
    async function checkExistingBet(token:string, title:string) {
        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        let chechBets = await connection.execute(
            `SELECT TOKEN FROM BETS WHERE EVENT_TITLE = :title AND TOKEN = :token`,
            [title, token]
        );

        if (chechBets.rows && chechBets.rows.length > 0){
            return true;
        }
        else{
            return false;
        }
    }

    export const betOnEventHandler: RequestHandler = async (req: Request, res: Response) => {
        const title = req.get('title');
        const bet = req.get('bet');
        const token = req.get('token')
        const guess = req.get('guess');
        

        if(guess && title && bet && token){
            console.log(token);
            const betvalue = parseFloat(bet);
            const checkevent = await EventsManager.CheckEvents(title);
            const checkbet = await checkExistingBet(token, title)
            if(checkevent === false && checkbet === false)
            {
                const result = await betOnEvent(title, betvalue, token, guess);
                if(result !== true){
                    res.statusCode = 200;
                    res.send(result.rows);
                }
                else{
                    res.statusCode = 402;
                    res.send('Erro ao realizar bet, fundos insuficientes/evento nao existente/valor de aposta menor que valor minimo');
                }

            }
            else{
                res.statusCode = 403;
                res.send('Alguma informacao esta errada ou nao existente/ aposta ja realizada nesse evento');
            }
           
        }
        else{
            res.statusCode = 403;
            res.send('Informacões incompletas');
        }
    }

    export const getWalletBalanceHandler: RequestHandler = async (req: Request, res: Response) => {
        //
        const token = req.get('token')

        if (token)
        {
            const result = await getWalletBalance(token);
            res.statusCode = 200;
            res.send(result.rows);
           
        }
        else{
            res.statusCode = 403;
            res.send('Informacoes faltando');
        }

    }


    export const walletTransactionHandler: RequestHandler = async (req: Request, res: Response) => {
        const emailsending = req.get('Emailsending');
        const passwordSending = req.get ('PasswordSending');
        const emailreceveing = req.get('EmailReceveing');
        const transactionValue = req.get('TransactionValue');

        if (emailsending && emailreceveing && passwordSending && transactionValue){
            const value = parseFloat(transactionValue);
            const checke = await AccountsManager.CheckEmail(emailsending);
            const checkerec = await AccountsManager.CheckEmail(emailreceveing);
            const checkp = await AccountsManager.CheckPassword(emailsending, passwordSending);
            const balance = await getBalance(emailsending, passwordSending, value);
            
            if(balance === true && checke === false && checkerec === false && checkp === false){

                if (value > 0 && value){
                    var checker = await AccountsManager.CheckEmail(emailreceveing);
                    var checkes = await AccountsManager.CheckEmail(emailsending);
                    var checkps = await AccountsManager.CheckPassword(emailreceveing, passwordSending);

                    if ( checker === false && checkes === false && checkps === false ){
                        WalletTransaction(emailsending, passwordSending, emailreceveing, value);
                        res.statusCode = 200;
                        res.send('Transaco completa com sucesso')
                    }
                    else{
                        res.statusCode = 403;
                        res.send('Alguma conta nao existe ou senha foi inserida incorretamente')
                    }
                }
                else{
                    res.statusCode = 403;
                    res.send('Nao e possivel transferir menos de ou 0 reais')
                }}
            else{
                res.statusCode = 403;
                res.send('Fundos insuficientes para transação')
            }
        }
        else{
            res.statusCode = 403;
            res.send('Alguma informacao nao foi inserida');
        }
        }

    }