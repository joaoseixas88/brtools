#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var commander_1 = require("commander");
var package_json_1 = require("../package.json");
var clipboardy_1 = __importDefault(require("clipboardy"));
var cpf_1 = require("./modules/cpf");
var commandWrapper = function (fn) { return function (options) {
    try {
        fn(options);
    }
    catch (error) {
        if (error.name === "ValidationException") {
            console.log(error.message);
            return;
        }
        else {
            console.error("Erro inesperado:", error);
        }
    }
}; };
commander_1.program
    .name(package_json_1.name)
    .version(package_json_1.version)
    .description(package_json_1.description || "A CLI tool to help you with your daily tasks");
commander_1.program
    .command("cpf")
    .description("Gera ou valida um CPF")
    .option("-g, --generate", "Gerar um CPF válido")
    .option("-v, --validate <cpf>", "Validar um CPF informado")
    .option("-d, --digits <digits>", "Digitos verificadores do CPF")
    .option("-c --copy", "Copia o CPF gerado/validado para o clipboard")
    .option("-f --formatted", "Formata o cpf criado")
    .action(commandWrapper(function (options) {
    var output = new cpf_1.Cpf().handle(options);
    if (options.copy) {
        clipboardy_1.default.writeSync(output);
        console.log("".concat(output, "  \u2705 Copiado para a \u00E1rea de transfer\u00EAncia"));
    }
    else {
        console.log(output);
    }
}));
commander_1.program.parse(process.argv);
