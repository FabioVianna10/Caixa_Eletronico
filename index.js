import inquirer from "inquirer";
import chalk from "chalk";
import fs from "fs";

operation();

//-----------Função para inicializar o sistema

function operation() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "Ola seja bem vindo ao banco Vianna, o que voce deseja fazer?",
        choices: [
          "Criar Conta",
          "Consultar Saldo",
          "Depositar",
          "Sacar",
          "Sair",
        ],
      },
    ])
    .then((answer) => {
      const action = answer["action"];
      if (action === "Criar Conta") {
        createAccount();
      } else if (action === "Depositar") {

        deposit();

      } else if (action === "Consultar Saldo") {

        checkBalance();

      } else if (action === "Sacar") {

        withdraw();

      } else if (action === "Sair") {

        console.log(chalk.bgBlue.black("Obrigado por utilizar nosso sitema!"));
        process.exit();
        
      }
    })
    .catch((err) => console.log(err));
}


//Função para iniciar o processo de criação da conta

function createAccount() {
  console.log(chalk.bgGreen.black("Parabéns por escolher o nosso banco!"));
  console.log(chalk.green("Defina as opções na sua conta a seguir"));

  buildAccount();
}

//Função para criar a conta

function buildAccount() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Digite um nome para a sua conta:",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      console.info(answer["accountName"]);

      if (!fs.existsSync("accounts")) {
        fs.mkdirSync("accounts");
      }

      if (fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(
          chalk.bgRed.black("Esta conta já existe, escolha outro nome!")
        );
        buildAccount();
        return;
      }

      fs.writeFileSync(
        `accounts/${accountName}.json`,
        '{"balance" : 0}',

        function (err) {
          console.log(err);
        }
      );

      console.log(chalk.green("Parabéns, sua conta foi criada com sucesso!"));
      operation();
    })
    .catch((err) => console.log(err));
}

// função para depositar na conta

function deposit() {
  inquirer
    .prompt([{ name: "accountName", message: "Qual o nome da sua conta? " }])
    .then((answer) => {
      const accountName = answer["accountName"];

      if (!checkAccount(accountName)) {
        return deposit();
      }

      inquirer
        .prompt([
          {
            name: "amount",
            message: "quanto você deseja depositar?",
          },
        ])
        .then((answer) => {
          const amount = answer["amount"];

          addAmount(accountName, amount);
          operation();
        });
    });
}

//função para checagem de conta

function checkAccount(accountName) {
  if (!fs.existsSync(`accounts/${accountName}.json`)) {
    console.log(
      chalk.bgRed.black("Esta conta não existe, escolha outra conta ")
    );
    return false;
  }

  return true;
}

// função para adicionar valor

function addAmount(accountName, amount) {
  const accountData = getAccount(accountName);

  if (!amount) {
    console.log(
      chalk.bgRed.black("Ocorreu um erro, tente novamente mais tarde")
    );
    return deposit();
  }

  accountData.balance = parseFloat(amount) + parseFloat(accountData.balance);

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function (err) {
      console.log(err);
    }
  );

  console.log(
    chalk.green(`Foi depositado o valor de R$${amount} na sua conta `)
  );
}

//Função para pegar a conta e transformar em json

function getAccount(accountName) {
  const accountJson = fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: "utf8",
    flag: "r",
  });

  return JSON.parse(accountJson);
}

//Função de Consultar Saldo

function checkBalance() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      if (!checkAccount(accountName)) {
        return checkBalance();
      }

      const accountData = getAccount(accountName);
      console.log(
        chalk.bgBlue.white(
          `O saldo da sua conta é de R$${accountData.balance}!!`
        )
      );
      operation();
    })

    .catch((err) => console.log(err));
}

// função para sacar

function withdraw() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta",
      },
    ])

    .then((answer) => {
      const accountName = answer["accountName"];

      if (!checkAccount(accountName)) {
        return withdraw();
      }

      inquirer
        .prompt([
          {
            name: "amount",
            message: "Qual o valor que você deseja sacar?",
          },
        ])
        .then((answer) => {
          const amount = answer["amount"];

          removoAmount(accountName, amount);
        })
        .catch((err) => console.log(err));
    })

    .catch((err) => console.log(err));
}

//função de validacao de valor

function removoAmount(accountName, amount) {
  const accountData = getAccount(accountName);

  if (!amount) {
    console.log(chalk.bgRed.black("Ocorreu um erro, tente novamente"));
    return withdraw();
  }

  if (accountData.balance < amount) {
    console.log(chalk.bgRed.black("Valor indisponivel"));
    return withdraw();
  }

  accountData.balance = parseFloat(accountData.balance) - parseFloat(amount);
  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),

    (err) => {
      console.log(err);
    }
  );

  console.log(
    chalk.bgGreen.black(`Foi realizado o saque de ${amount} da sua conta!`)
  ),
    operation();
}
