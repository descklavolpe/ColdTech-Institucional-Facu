const serialport = require('serialport');
const express = require('express');
const mysql = require('mysql2');
const sql = require('mssql');

const SERIAL_BAUD_RATE = 9600;
const SERVIDOR_PORTA = 3300;
const HABILITAR_OPERACAO_INSERIR = true;

// escolha deixar a linha 'desenvolvimento' descomentada se quiser conectar seu arduino ao banco de dados local, MySQL Workbench
// const AMBIENTE = 'desenvolvimento';

// escolha deixar a linha 'producao' descomentada se quiser conectar seu arduino ao banco de dados remoto, SQL Server
const AMBIENTE = 'producao';

const serial = async (
    valoresIdSensor,
    valoresLm35Temperatura,
) => {
    let poolBancoDados = ''

    if (AMBIENTE == 'desenvolvimento') {
        poolBancoDados = mysql.createPool(
            {
                // CREDENCIAIS DO BANCO LOCAL - MYSQL WORKBENCH
                host: 'localhost',
                user: 'Aluno',
                password: 'sptech',
                database: 'coldtech'
            }
        ).promise();
    } else if (AMBIENTE == 'producao') {

        console.log('Projeto rodando inserindo dados em nuvem. Configure as credenciais abaixo.')

    } else {
        throw new Error('Ambiente não configurado. Verifique o arquivo "main.js" e tente novamente.');
    }


    const portas = await serialport.SerialPort.list();
    const portaArduino = portas.find((porta) => porta.vendorId == 2341 && porta.productId == 43);
    if (!portaArduino) {
        throw new Error('O arduino não foi encontrado em nenhuma porta serial');
    }
    const arduino = new serialport.SerialPort(
        {
            path: portaArduino.path,
            baudRate: SERIAL_BAUD_RATE
        }
    );
    arduino.on('open', () => {
        console.log(`A leitura do arduino foi iniciada na porta ${portaArduino.path} utilizando Baud Rate de ${SERIAL_BAUD_RATE}`);
    });
    arduino.pipe(new serialport.ReadlineParser({ delimiter: '\r\n' })).on('data', async (data) => {
        const valores = data.split(';');
        const lm35Temperatura = parseFloat(valores[0]);
        const idSensor = parseFloat(valores[1]);

        
        valoresLm35Temperatura.push(lm35Temperatura);
        valoresIdSensor.push(idSensor);


        if (HABILITAR_OPERACAO_INSERIR) {

            if (AMBIENTE == 'producao') {

                // Este insert irá inserir os dados na tabela "medida" -> altere se necessário
                // Este insert irá inserir dados de fk_aquario id=1 >> você deve ter o aquario de id 1 cadastrado.
                sqlquery = `INSERT INTO Dados (lm35_temperatura, fkSensor) VALUES (${lm35Temperatura - 30},${idSensor}),(${lm35Temperatura+(3*Math.random())},${idSensor}),(${lm35Temperatura-50},${idSensor})`;

                // CREDENCIAIS DO BANCO REMOTO - SQL SERVER
                const connStr = "Server=svr-1adsb-grupo6.database.windows.net;Database=coldtech;User Id=usuarioParaAPIArduino_datawriter;Password=#Gf_senhaParaAPI;";

                function inserirComando(conn, sqlquery) {
                    conn.query(sqlquery);
                    console.log("valores inseridos no banco: ", lm35Temperatura)
                }

                sql.connect(connStr)
                    .then(conn => inserirComando(conn, sqlquery))
                    .catch(err => console.log("erro! " + err));

            } else if (AMBIENTE == 'desenvolvimento') {

                // Este insert irá inserir os dados na tabela "medida" -> altere se necessário
                // Este insert irá inserir dados de fk_aquario id=1 >> você deve ter o aquario de id 1 cadastrado.
                await poolBancoDados.execute(
                    'INSERT INTO Dado (lm35_temperatura, fksensor) VALUES (?, ?)',
                    [lm35Temperatura, idSensor]
                );
                console.log("valores inseridos no banco: ", lm35Temperatura)

            } else {
                throw new Error('Ambiente não configurado. Verifique o arquivo "main.js" e tente novamente.');
            }

        }

    });
    arduino.on('error', (mensagem) => {
        console.error(`Erro no arduino (Mensagem: ${mensagem}`)
    });
}

const servidor = (
    valoresIdSensor,
    valoresLm35Temperatura,
) => {
    const app = express();
    app.use((request, response, next) => {
        response.header('Access-Control-Allow-Origin', '*');
        response.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
        next();
    });
    app.listen(SERVIDOR_PORTA, () => {
        console.log(`API executada com sucesso na porta ${SERVIDOR_PORTA}`);
    });
    app.get('/sensores/lm35/temperatura', (_, response) => {
        return response.json(valoresLm35Temperatura);
    });
    
    app.get('/sensores/fksensor', (_, response) => {
        return response.json(valoresIdSensor);
    });
}

(async () => {
    const valoresIdSensor =[];
    const valoresLm35Temperatura = [];
    await serial(
        valoresLm35Temperatura,
        valoresIdSensor
    );
    servidor(
        valoresLm35Temperatura,
        valoresIdSensor
    );
})();





// const serialport = require('serialport');
// const express = require('express');
// const mysql = require('mysql2');


// const SERIAL_BAUD_RATE = 9600;
// const SERVIDOR_PORTA = 3000;
// const HABILITAR_OPERACAO_INSERIR = true;

// const serial = async (
//     valoresIdSensor,
//     valoresLm35Temperatura,
// ) => {
//     const poolBancoDados = mysql.createPool(
//         {
//             host: 'localhost',
//             port: 3306,
//             user: 'aluno',
//             password: 'sptech',
//             database: 'coldTech'
//         }
//     ).promise();

//     const portas = await serialport.SerialPort.list();
//     const portaArduino = portas.find((porta) => porta.vendorId == 2341 && porta.productId == 43);
//     if (!portaArduino) {
//         throw new Error('O arduino não foi encontrado em nenhuma porta serial');
//     }
//     const arduino = new serialport.SerialPort(
//         {
//             path: portaArduino.path,
//             baudRate: SERIAL_BAUD_RATE
//         }
//     );
//     arduino.on('open', () => {
//         console.log(`A leitura do arduino foi iniciada na porta ${portaArduino.path} utilizando Baud Rate de ${SERIAL_BAUD_RATE}`);
//     });
//     arduino.pipe(new serialport.ReadlineParser({ delimiter: '\r\n' })).on('data', async (data) => {
//         const valores = data.split(';');
//         const idSensor = parseFloat(valores[1]);
//         const lm35Temperatura = parseFloat(valores[0]);

//         valoresIdSensor.push(idSensor);
//         valoresLm35Temperatura.push(lm35Temperatura);

//         if (HABILITAR_OPERACAO_INSERIR) {
//             await poolBancoDados.execute(
//                 'INSERT INTO Dado (lm35Temp, fksensor) VALUES (?, ?);',
//                 [lm35Temperatura, idSensor]
//             );
//             console.log("valores inseridos no banco: ", lm35Temperatura)
//         }

//     });
//     arduino.on('error', (mensagem) => {
//         console.error(`Erro no arduino (Mensagem: ${mensagem}`)
//     });
// }

// const servidor = (
//     valoresIdSensor,
//     valoresLm35Temperatura,
// ) => {
//     const app = express();
//     app.use((request, response, next) => {
//         response.header('Access-Control-Allow-Origin', '*');
//         response.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
//         next();
//     });
//     app.listen(SERVIDOR_PORTA, () => {
//         console.log(`API executada com sucesso na porta ${SERVIDOR_PORTA}`);
//     });
//     app.get('/sensores/lm35/temperatura', (_, response) => {
//         return response.json(valoresLm35Temperatura);
//     });
//     app.get('/sensores/fksensor', (_, response) => {
//         return response.json(valoresIdSensor);
//     });
// }

// (async () => {
//     const valoresIdSensor = [];
//     const valoresLm35Temperatura = [];
//     await serial(
//         valoresIdSensor,
//         valoresLm35Temperatura,
//     );
//     servidor(
//         valoresIdSensor,
//         valoresLm35Temperatura
//     );
// })();
