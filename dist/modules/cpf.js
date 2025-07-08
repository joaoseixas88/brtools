"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cpf = void 0;
const Validation_1 = require("../exceptions/Validation");
const module_1 = require("./module");
class Cpf extends module_1.CliModule {
    handle(options) {
        const actions = ["generate", "validate", "digits"];
        const selectedActions = actions.filter((a) => options[a]);
        if (selectedActions.length !== 1) {
            throw new Validation_1.ValidationException("Você deve escolher exatamente uma das opções: --generate, --validate <cpf> ou --digits <000.000.000>");
        }
        const action = selectedActions[0];
        const result = {
            generate: () => this.generate(options),
            validate: () => {
                const isValid = this.validate(options.validate);
                return isValid ? "✅ CPF válido" : "❌ CPF inválido";
            },
            digits: () => {
                return `Dígitos verificadores: ${this.digits(options.digits)}`;
            },
        }[action]();
        return result;
    }
    verifyFirstDigit(baseNumbers) {
        const total = baseNumbers.split("").reduce((acc, previous, index) => {
            const multi = Number(previous) * (10 - index);
            acc += multi;
            return acc;
        }, 0);
        const rest = total % 11;
        let firstDigit = 0;
        if (rest <= 1) {
            firstDigit = 0;
        }
        else {
            firstDigit = 11 - rest;
        }
        return firstDigit;
    }
    verifySecondDigit(baseNumbers, firstVeririedNumber) {
        const total = `${baseNumbers}${firstVeririedNumber}`
            .split("")
            .reduce((acc, previous, index) => {
            const multi = Number(previous) * (11 - index);
            acc += multi;
            return acc;
        }, 0);
        const rest = total % 11;
        let secondDigit = 0;
        if (rest <= 1) {
            secondDigit = 0;
        }
        else {
            secondDigit = 11 - rest;
        }
        return secondDigit;
    }
    generate(options) {
        const baseNumbers = Math.floor(Math.random() * 1000000000)
            .toString()
            .padStart(9, "0");
        const firstDigit = this.verifyFirstDigit(baseNumbers);
        const secondDigit = this.verifySecondDigit(baseNumbers, firstDigit);
        const cpf = `${baseNumbers}${firstDigit}${secondDigit}`;
        if (options?.formatted) {
            return this.formatCpf(cpf);
        }
        return cpf;
    }
    digits(baseNumbers) {
        const firstDigit = this.verifyFirstDigit(baseNumbers.toString());
        const secondDigit = this.verifySecondDigit(baseNumbers, firstDigit);
        return `${firstDigit}${secondDigit}`;
    }
    validate(cpf) {
        const cleanCpf = cpf.replace(/\D/g, "");
        if (cleanCpf.length !== 11) {
            return false;
        }
        const baseNumbers = cleanCpf.substring(0, 9);
        const checkDigits = cleanCpf.substring(9, 11);
        const firstDigit = this.verifyFirstDigit(baseNumbers);
        const secondDigit = this.verifySecondDigit(baseNumbers, firstDigit);
        return checkDigits === `${firstDigit}${secondDigit}`;
    }
    formatCpf(cpf) {
        return cpf
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
}
exports.Cpf = Cpf;
