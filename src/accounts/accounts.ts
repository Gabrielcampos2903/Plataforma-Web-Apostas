import {Request, RequestHandler, Response} from "express";
import OracleDB from "oracledb";
import dotenv from 'dotenv'; 
import { checkServerIdentity } from "tls";
import { access } from "fs";
import { EventsManager } from "../events/events";
import { ppid } from "process";
import { FinacialManager } from "../financial/financial";
dotenv.config();

OracleDB.autoCommit = true;

export namespace AccountsManager {



    async function ViewToken(email:string, password:string)
    {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        let CheckToken = await connection.execute(
            `SELECT TOKEN FROM ACCOUNTS WHERE EMAIL = :email AND PASSWORD = :password`,
            [email, password]
        );


        if (CheckToken.rows && CheckToken.rows.length > 0) {
            const tokenRow = CheckToken.rows[0] as { TOKEN: string };
            return tokenRow.TOKEN; // Retorne apenas o valor do token
        } else {
            return null; // Retorne null se não encontrar o token
        }
        
       
    };

    export async function CheckEmail(email: string){

        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        let check = await connection.execute(

            `SELECT EMAIL FROM ACCOUNTS WHERE EMAIL = :email
            `,   
            [email]     
        );

        if(check.rows && check.rows.length > 0){
            await connection.close();
            return false;
        }else{
            await connection.close();
            return true;
        };

    }

    export async function CheckPassword(email: string, password: string){

        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        let check = await connection.execute(

            `SELECT PASSWORD FROM ACCOUNTS WHERE EMAIL = :email AND PASSWORD = :password
            `,   
            [email, password]     
        );

        if(check.rows && check.rows.length > 0){
            await connection.close();
            return false;
        }else{
            await connection.close();
            return true;
        };

    }

    async function SignUp(name: string, email: string, AccPassword: string, AccBirthdate: string){

        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });
       

        let SigningUp = await connection.execute(

            `insert into accounts(
            id, 
            complete_name, 
            email, 
            password, 
            birthdate, 
            token,
            conta,
            wallet_value
            )
            values(
            SEQ_ACCOUNTS.NEXTVAL, 
            :name, 
            :email, 
            :AccPassword, 
            :AccBirthdate, 
            '.',
            'usuario',
            0
            )
            `,
            [name, email, AccPassword, AccBirthdate]
        );

        
        await connection.close();
        return SigningUp;

    };

    async function generateToken(email:string) {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        // passo 1 - conectar-se ao oracle. 
        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        let generateToken = await connection.execute(
            `UPDATE ACCOUNTS SET TOKEN = dbms_random.string('x',32) WHERE EMAIL = :email`,
            [email]
        );

        return generateToken;

    }

    async function login(email: string, password: string) {

        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        // passo 1 - conectar-se ao oracle. 
        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        let accouts = await connection.execute(
            'SELECT * FROM ACCOUNTS WHERE email = :email AND password = :password',
            [email, password]
        );
        await connection.close();

        return accouts;
        }   

    export const LoginHandler: RequestHandler = async (req: Request, res: Response) => {
            const pEmail = req.get('email');
            const pPassword = req.get('password');
            if(pEmail && pPassword){
                var CheckE2 = await CheckEmail(pEmail);
                if(CheckE2 === false){
                    var CheckP = true;
                    CheckP = await CheckPassword(pEmail, pPassword);
                    if(CheckP === false){
                        const LoginId = await login(pEmail, pPassword);
                        await generateToken(pEmail);
                        res.statusCode = 200;
                        res.send(LoginId.rows);
                    }
                    else{
                        res.statusCode = 403;
                        res.send('Senha errada')
                    }
                }
                else{
                    res.statusCode = 403;
                    res.send('Nao existe conta com esse email')
                }
            } 
            else {
                res.statusCode = 403;
                res.send('Requisição inválida - Parâmetros faltando.')
            }
        }


    export const signUpHandler: RequestHandler = async (req: Request, res: Response) => {

        const name = req.get('username');
        const email = req.get('email');
        const AccPassword = req.get('Password'); 
        const AccBirthdate = req.get('BirthDate');        

        if(name && email && AccPassword && AccBirthdate){
            var CheckE = true;         
            CheckE = await CheckEmail(email);
            var CheckBd = await EventsManager.CheckDate(AccBirthdate);
                if(CheckBd === true){
                    if(CheckE === true){
                        const signUpID = await SignUp(name, email, AccPassword, AccBirthdate);
                        res.statusCode = 200;
                        res.send(signUpID.rows);
                    }
                    else{
                        res.statusCode = 403;
                        res.send('Erro, conta com esse email ja existe');
                    }
                }
                else{
                    res.statusCode = 403;
                    res.send('Data invalida')
                }

        }
        else{
            res.statusCode = 403;
            res.send('Algum dado foi inserido incorretamente ou nao inserido')
        }
    }

    export const ViewTokenHandler: RequestHandler = async (req: Request, res: Response) => {
        const AccEmail = req.get('email');
        const AccPassword = req.get('password');

        if (AccEmail && AccPassword){
            var ce = await CheckEmail(AccEmail);
            var cp = await CheckPassword(AccEmail, AccPassword);

            if ((ce === false) && (cp === false))
            {
                const token = await ViewToken(AccEmail, AccPassword);
                res.statusCode = 200;
                console.log(token);
                res.json(token);
            }
            else{
                res.statusCode = 403;
                res.send('Senha ou Email incorretos');
            }
        }
        else{
            res.statusCode = 403;
            res.send('Alguma informação nao foi digitada')
        }
    }
}