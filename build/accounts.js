"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountsManager = void 0;
const oracledb_1 = __importDefault(require("oracledb"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var AccountsManager;
(function (AccountsManager) {
    async function CheckEmail(email) {
        oracledb_1.default.outFormat = oracledb_1.default.OUT_FORMAT_OBJECT;
        let connection = await oracledb_1.default.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });
        let check = await connection.execute(`SELECT EMAIL FROM ACCOUNTS WHERE EMAIL = :email
            `, [email]);
        if (check.rows && check.rows.length > 0) {
            await connection.close();
            return false;
        }
        else {
            await connection.close();
            return true;
        }
        ;
    }
    AccountsManager.CheckEmail = CheckEmail;
    async function CheckPassword(email, password) {
        oracledb_1.default.outFormat = oracledb_1.default.OUT_FORMAT_OBJECT;
        let connection = await oracledb_1.default.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });
        let check = await connection.execute(`SELECT PASSWORD FROM ACCOUNTS WHERE EMAIL = :email AND PASSWORD = :password
            `, [email, password]);
        if (check.rows && check.rows.length > 0) {
            await connection.close();
            return false;
        }
        else {
            await connection.close();
            return true;
        }
        ;
    }
    AccountsManager.CheckPassword = CheckPassword;
    async function SignUp(name, email, AccPassword, AccBirthdate) {
        oracledb_1.default.outFormat = oracledb_1.default.OUT_FORMAT_OBJECT;
        let connection = await oracledb_1.default.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });
        let SigningUp = await connection.execute(`insert into accounts(id, 
            complete_name, 
            email, 
            password, 
            birthdate, 
            token,
            conta
            )
            values(SEQ_ACCOUNTS.NEXTVAL, 
            :name, 
            :email, 
            :AccPassword, 
            :AccBirthdate, 
            dbms_random.string('x',32),
            'usuario'
            )
            `, [name, email, AccPassword, AccBirthdate]);
        await connection.commit();
        await connection.close();
    }
    ;
    async function login(email, password) {
        oracledb_1.default.outFormat = oracledb_1.default.OUT_FORMAT_OBJECT;
        // passo 1 - conectar-se ao oracle. 
        let connection = await oracledb_1.default.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });
        let accouts = await connection.execute('SELECT * FROM ACCOUNTS WHERE email = :email AND password = :password', [email, password]);
    }
    AccountsManager.LoginHandler = async (req, res) => {
        const pEmail = req.get('email');
        const pPassword = req.get('password');
        if (pEmail && pPassword) {
            // chamar a funcao de login. 
            var CheckE2 = true;
            CheckE2 = await CheckEmail(pEmail);
            if (CheckE2 === false) {
                var CheckP = true;
                CheckP = await CheckPassword(pEmail, pPassword);
                if (CheckP === false) {
                    await login(pEmail, pPassword);
                    res.statusCode = 200;
                    res.send('Login realizado... confira...');
                }
                else {
                    res.statusCode = 403;
                    res.send('Senha errada');
                }
            }
            else {
                res.statusCode = 403;
                res.send('Nao existe conta com esse email');
            }
        }
        else {
            res.statusCode = 400;
            res.send('Requisição inválida - Parâmetros faltando.');
        }
    };
    AccountsManager.signUpHandler = async (req, res) => {
        const name = req.get('name');
        const email = req.get('email');
        const AccPassword = req.get('AccPassword');
        const AccBirthdate = req.get('AccBirthdate');
        if (name && email && AccPassword && AccBirthdate) {
            var CheckE = true;
            CheckE = await CheckEmail(email);
            if (CheckE === true) {
                SignUp(name, email, AccPassword, AccBirthdate);
                res.statusCode = 200;
                res.send("Sign up feito com sucesso!");
            }
            else {
                res.statusCode = 403;
                res.send('Erro, conta com esse email ja existe');
            }
        }
        else {
            res.statusCode = 403;
            res.send('Algum dado foi inserido incorretamente ou nao inserido');
        }
    };
    AccountsManager.ViewToken = async (req, res) => {
    };
})(AccountsManager || (exports.AccountsManager = AccountsManager = {}));
