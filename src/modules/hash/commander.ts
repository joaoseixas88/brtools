import { Command } from "commander";
import { HashModule } from ".";
import { makeModule } from "../../helpers/moduleBuilder";

export default function (program: Command) {
  program
    .command("hash")
    .argument("<algorithm>")
    .description("Gera um hash com algoritmo de sua escolha")
    .option("-t, --text <text>", "Texto a ser hasheado")
    .option("-c --copy", "Copia o CNPJ gerado/validado para o clipboard")
    .option("-s, --salt <salt>", "Salt, caso o algoritmo seja bcrypt")
    .action(makeModule(HashModule));
}
