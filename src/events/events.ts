import {Request, RequestHandler, Response} from "express";
import { appendFile } from "fs";
import { get } from "http";
import { availableParallelism } from "os";
import OracleDB, { AQ_DEQ_WAAQ_MSG_DELIV_MODE_PERSISTENTIT_FOREVER, converter, initOracleClient, oracleClientVersion } from "oracledb";
import dotenv from 'dotenv';
dotenv.config();
import { AccountsManager } from "../accounts/accounts";
import { NextFunction } from "express";

OracleDB.autoCommit = true;

export namespace EventsManager{ 

    async function GetBets(token:string){
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

       
        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        let search = await connection.execute(
            `SELECT * FROM BETS WHERE TOKEN = :token`,
            [token]
        );

        await connection.close();
        return search;
    }

    export const GetBetsByTokenHandler: RequestHandler = async (req: Request, res:Response) =>{
        const token = req.get('token');

        if (token){
            const result = await GetBets(token);
            res.statusCode = 200;
            res.send(result.rows);
        }
        else{
            res.statusCode = 403;
            res.send('Informação nao inserida');
        }
    }
    

    async function getEventsQtyy(category: string){
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

       
        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        let eventQtyy = await connection.execute(
            `SELECT count(TITLE) AS EventQtyy FROM EVENTS WHERE CATEGORIA = :category`,
            [category]
        );

        await connection.close();
        return eventQtyy;
    }

    async function getEventsByPage(page:number, pagesize:number, category: string){
        const startRecord = (page - 1) * pagesize;
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        let EventsQtty = await connection.execute(
            `SELECT * FROM EVENTS WHERE CATEGORIA = :category ORDER BY TITLE OFFSET :startRecord ROWS FETCH NEXT :pagesize ROWS ONLY`,
            [category, startRecord, pagesize]
        );

        await connection.close();
        return EventsQtty;
    }

    export const getEventsByPageHandler: RequestHandler = async (req: Request, res: Response) => {
            const pPage = req.get('page');
            const pPageSize = req.get('pageSize');
            const category = req.get("category");

            if(pPage && pPageSize && category){
                const events = await getEventsByPage(parseInt(pPage), parseInt(pPageSize), category);
                res.statusCode = 200;
                res.json(events.rows);
            } else {
                res.statusCode = 400;
                res.send('Requisição inválida - Parâmetros faltando.')
            }
        }

    export const getProductsQttyHandler: RequestHandler =  async (req: Request, res: Response) => {      
            const category = req.get("category");

            if( category){
                const prodsQtty = await getEventsQtyy(category);
                res.statusCode = 200;
                console.log(prodsQtty.rows)
                res.send(prodsQtty.rows);
            }
            else{
                res.statusCode = 403;
                res.send("erro");
            }
        
           
        }


    async function GetEventsDate(){
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        let getDates = await connection.execute(
            `SELECT * FROM EVENTS WHERE COMPLETION = 'Waiting'`
        );

        
        await connection.close();
        return getDates;
    }

    export const GetEventsDateHandler: RequestHandler = async (req: Request, res: Response) => {
        const dates = await GetEventsDate();

        if (dates){
            res.statusCode = 200;
            res.send(dates.rows);
                }
        else{
            res.statusCode = 403;
            res.send('erro')
        }
    }
        
    

    async function GetBettedEvents(){
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        let getBetted = await connection.execute(
            `SELECT EVENT_TITLE, COUNT(*) AS TOTAL_APOSTAS FROM BETS GROUP BY EVENT_TITLE ORDER BY COUNT(*) DESC`
        );

        console.log(getBetted);
        await connection.close();
        return getBetted;
        
    }

    export const TopBettedEventsHandler: RequestHandler = async (req: Request, res: Response) => {
       const events = await GetBettedEvents();

       if (events){
            res.statusCode = 200;
            res.json(events.rows);
       }
       else{
        res.statusCode = 403;
        res.send("erro");
       }
    }

    async function getEvents(eventtype: string) {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        let get = await connection.execute(
            `SELECT * FROM EVENTS WHERE STATUS = :eventtype`,
            [eventtype]
        );

        if (get.rows && get.rows.length > 0)
        {
            console.log(get.rows);
            await connection.close();
            return true;
        }
        else{
            await connection.close();
            return false;
        }
    }

    async function searchEvent(title:string) {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        let search = await connection.execute(
            `SELECT * FROM EVENTS WHERE TITLE = :title`,
            [title]
        );

        await connection.close();
        return search;
    }

   

    
    async function ApproveEvent(title:string) {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        let ApproveEvent = await connection.execute(
            `UPDATE EVENTS SET STATUS = 'APPROVED' WHERE TITLE = :title`,
            [title]
        );

        await connection.commit();
        await connection.close();
    }
    export const ApproveEventHandler: RequestHandler = async (req: Request, res: Response) => {
        const titletoapprove = req.get('titletoapprove');
        
        var checke = true;
        checke = await CheckEvents(titletoapprove as string);

        if (titletoapprove)
            {
                if (checke === false){
                    await ApproveEvent(titletoapprove);
                    res.statusCode = 200;
                    res.send('Status alterado para approved');
                }
                else{
                    res.statusCode = 403;
                    res.send('Nao existe evento com esse titulo')
                }
        }
        else{
            res.statusCode = 403;
            res.send('Titulo nao enserido');
        }
        
    }


    async function DeleteEvent(titletoremove:string) {
        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        let deleteEvent = await connection.execute(
            `UPDATE EVENTS SET STATUS = 'DELETED' WHERE TITLE = :titletoremove`,
            [titletoremove]
        );

        await connection.commit();
        await connection.close();
    }

    export const DeleteEventHandler: RequestHandler = async (req: Request, res: Response) => {
        const titletoremove = req.get('titletoremove');


        if (titletoremove){
            const checkEvent = await CheckEvents(titletoremove);
            if (checkEvent === false){
                await DeleteEvent(titletoremove);
                res.statusCode = 200;
                res.send('Evento Deletado');
            }
            else{
                res.statusCode = 403;
                res.send('Evento nao existe')
            }
                
        }
        else{
            res.statusCode = 403;
            res.send('Informaçaõ nao inserida')
        }


    }

    async function DenieEvent(title:string, cause:string, causeSummary:string, EventCreatorEmail:string) {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        
        
        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        let denieEvent = await connection.execute(
            `DELETE FROM EVENTS WHERE TITLE = :title`,
            [title]
        );


    
        let addEventToTable = await connection.execute(
            `INSERT INTO EVENTSDENIED(
            TITLE,
            EMAIL_CREATING,
            SUMMARY,
            CAUSE,
            STATUS
            )
            VALUES(
            :title,
            :EventCreatorEmail,
            :causeSummary,
            :cause,
            'Denied'
            )`,
            [title, EventCreatorEmail, causeSummary, cause]
        );

        await connection.commit();
        await connection.close();
       
    

    }
    export const DenieEventHandler: RequestHandler = async (req: Request, res: Response) => {
        //gabriel
        const titleToDenie = req.get('titleToDenie');
        const cause = req.get('cause');
        const causeSummary = req.get('causeSummary');
        const EventCreatorEmail = req.get('EventCreatorEmail')
        
        
        const checke = await CheckEvents(titleToDenie as string);


        if (titleToDenie && cause && causeSummary && EventCreatorEmail)
            {
                const checkEmail = await AccountsManager.CheckEmail(EventCreatorEmail);
                if (checke === false && checkEmail === false){
                    await DenieEvent(titleToDenie, cause, causeSummary, EventCreatorEmail);
                    res.statusCode = 200;
                    res.send('Status alterado para denied');
                    console.log(`Caro ${EventCreatorEmail} seu evento foi recusado pelo motivo: ${cause}`);
                    
                }
                else{
                    res.statusCode = 403;
                    res.send('Nao existe evento com esse titulo')
                }
        }
        else{
            res.statusCode = 403;
            res.send('Informação nao enserida');
        }


    }
    async function NewEvent(eventname:string,descricao:string,valorbet:number,receveingbetdatebeg:string, receveingabetdateend:string, eventdate:string, token:string, categoria:string){
       
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        let creatingEvent = await connection.execute(
        `INSERT INTO EVENTS(
        TITLE,
        TOKEN,
        DESCRICAO,
        VALORDABET,
        EVENTDATE,
        DATERECEVEINGBEG,
        DATERECEVEINGEND,
        STATUS,
        COMPLETION,
        CATEGORIA
        )
        VALUES(
        :eventname,
        :token,
        :descricao,
        :valorbet,
        :eventdate,
        :receveingbetdatebeg,
        :receveingabetdateend,
        'Pending',
        'Waiting',
        :categoria
        )
        `
        ,
            [eventname, token, descricao, valorbet, eventdate, receveingbetdatebeg, receveingabetdateend, categoria]
        );

        await connection.close();
        return creatingEvent;

    }
      
    export async function CheckEvents(title:string) {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        let checkt = await connection.execute(
            `SELECT TITLE FROM EVENTS WHERE TITLE = :title
            `,   
            [title]     
        );

        if(checkt.rows && checkt.rows.length > 0){
            await connection.close();
            return false;
        }else{
            await connection.close();
            return true;
        };

    }

    export async function CheckDate(inputDate: string): Promise<boolean> {
        const CDate = new Date();
        const InsDate = new Date(inputDate); 
        console.log(CDate);
    
        return InsDate <= CDate;
    }

    
    export const NewEventHandler: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
       //gabriel 
       //(Serviço para cadastrar um evento colocando-o na lista de espera para aprovação pelo moderador
        const eventname = req.get('eventName');
        const descricao = req.get('summary');
        const valordabet = req.get('betvalue');
        const receveingbetdatebeg = req.get('betdatebeg');
        const receveingabetdateend = req.get('betdateend');
        const eventdate = req.get('eventdate');
        const token = req.get("token");
        const categoria = req.get('categoria');

        

        if(eventname && descricao && receveingabetdateend && receveingbetdatebeg && eventdate && token && valordabet && categoria)
            {

                var CDONE = await CheckDate(eventdate);
                var CDS = await CheckDate(receveingabetdateend);
                var CDT = await CheckDate(receveingbetdatebeg);
                const valorbet: number = parseFloat(valordabet as string);
                var checke = await CheckEvents(eventname);


                if(CDONE === false && CDS === false && CDT === false){
                    if (checke === true){
                        if (valorbet >= 1 && valorbet)
                            {
                            
                                    const Event = await NewEvent(eventname, descricao, valorbet, receveingbetdatebeg, receveingabetdateend, eventdate, token, categoria);
                                    res.statusCode = 200;
                                    res.send(Event.rows);
                            
                                    
                            }  
                        else{
                            console.log('erro2');
                            res.statusCode = 403;
                            res.send('Não sao permitidas bets com valor inferior a R$1,00');
                           
                        }}
                    else{
                        console.log('erro3');
                        res.statusCode = 403;
                        res.send('Evento com esse titulo ja existe')
                    }
                }
                else{
                    console.log('erro4');
                    res.statusCode = 403;
                    res.send('Datas invalidas')
                }
            }
            else {
                console.log('erro5');
                res.statusCode = 403;
                res.send('Alguma informacao nao foi adicionada');
            }
    }

    export const getEventsHandler: RequestHandler = async (req: Request, res: Response) => {
       const eventtype = req.get ('Tipo_do_evento_pending-finished-tohappen');

       if (eventtype){
            const chechget = await getEvents(eventtype);
            if ( chechget === true){
                req.statusCode = 200;
                res.send('Eventos achados');}
            else{
                res.statusCode = 403;
                res.send('Nao existe eventos com esse status');
            }
       }
       else{
        res.statusCode = 403;
        res.send('Nao foi inserido o tipo do evento');
       }
    }

    

    async function finishEvent(title:string, ocorreu:string) {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        let finishEvent = await connection.execute(
            `UPDATE EVENTS SET STATUS = 'finished', COMPLETION = :ocorreu WHERE TITLE = :title`, //ATUALIZA O STATUS DA BET PARA FINISHED E QUE OCORREU
            [ocorreu, title]
        );
        
        if (ocorreu === 'sim'){

                await connection.commit();

                await connection.execute(`ALTER SESSION DISABLE PARALLEL DML`);

                let update = await connection.execute(
                    `
                    UPDATE ACCOUNTS A
                    SET A.WALLET_VALUE = A.WALLET_VALUE + (
                        SELECT SUM(B.BETVALUE) * 2
                        FROM BETS B
                        WHERE B.TOKEN = A.TOKEN AND B.EVENT_TITLE = :title AND B.GUESS = 'sim'
                    )
                    WHERE EXISTS (
                        SELECT 1
                        FROM BETS B
                        WHERE B.TOKEN = A.TOKEN AND B.EVENT_TITLE = :title AND B.GUESS = 'sim'
                    )`,
                    [title, title]
                );

                let deleteExistingBets = await connection.execute(
                    `DELETE FROM BETS WHERE EVENT_TITLE = :title`,
                    [title]
                );

                await connection.commit();
                await connection.close();
                return true;
                    
        }
        else if (ocorreu === 'nao') {
            await connection.commit();

            await connection.execute(`ALTER SESSION DISABLE PARALLEL DML`);

            let update = await connection.execute(
                `
                UPDATE ACCOUNTS A
                SET A.WALLET_VALUE = A.WALLET_VALUE + (
                    SELECT SUM(B.BETVALUE) * 2
                    FROM BETS B
                    WHERE B.TOKEN = A.TOKEN AND B.EVENT_TITLE = :title AND B.GUESS = 'nao'
                )
                WHERE EXISTS (
                    SELECT 1
                    FROM BETS B
                    WHERE B.TOKEN = A.TOKEN AND B.EVENT_TITLE = :title AND B.GUESS = 'nao'
                )`,
                [title, title]
            );

            await connection.commit();
            await connection.close();
            return true;
        }
            
        else{
            await connection.close();
            return false;
        }
        
        
    }

    async function checkEventStatus(title:string){
        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        let checkEventStatus = await connection.execute(
            `SELECT STATUS FROM EVENTS WHERE TITLE = :title AND STATUS = 'finished'`,
            [title]
        );

        if(checkEventStatus.rows && checkEventStatus.rows.length > 0)
        {
            return true;
        }
        else{
            return false;
        }

    }

    export const finishEventHandler: RequestHandler = async (req: Request, res: Response) => {
        //gabriel
        const title = req.get('title');
        const ocorreu = req.get('ocorreu');

        if (title && ocorreu)
        {
            const event = await CheckEvents(title);
            const checkStatus = await checkEventStatus(title);
            if(event === false && checkStatus === false){
                const func = await finishEvent(title, ocorreu);
                if (func === true)
                {
                    res.statusCode = 200;
                    res.send('Evento finalizado e bets retornadas a apostadores');
                }
                else{
                    res.statusCode = 403;
                    res.send('Nao e aceito outra resposta alem de "sim" e "nao" ');
                }
            }
            else{
                res.statusCode = 403;
                res.send('Evento nao existe ou ja foi terminado');
            }
        }
        else{
            res.statusCode = 403;
            res.send('Informacao faltando')
        }
    }

    export const evaluateNewEvent: RequestHandler = (req: Request, res: Response) => {
        //FEITA DIVIDA EM APPROVE E DELETE 
    }


    

    export const searchEventHandler: RequestHandler = async (req: Request, res: Response) => {
        const title = req.get('title');

        const check = await CheckEvents(title as string);
       
        
        if(title){
            
            if(check === false){
                const event = await searchEvent(title);
                res.statusCode = 200;
                console.log(event.rows);
                res.json(event.rows);
            }
            else{
                res.statusCode = 403;
                res.send('Evento nao existe');
            }
        }
        else{
            res.statusCode = 403;
            res.send('Informacao nao inserida')
        }
    }
}

    

    