"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cpf = void 0;
var Validation_1 = require("../exceptions/Validation");
var module_1 = require("./module");
var Cpf = /** @class */ (function (_super) {
    __extends(Cpf, _super);
    function Cpf() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Cpf.prototype.handle = function (options) {
        var _this = this;
        var actions = ["generate", "validate", "digits"];
        var selectedActions = actions.filter(function (a) { return options[a]; });
        if (selectedActions.length !== 1) {
            throw new Validation_1.ValidationException("Você deve escolher exatamente uma das opções: --generate, --validate <cpf> ou --digits <000.000.000>");
        }
        var action = selectedActions[0];
        var result = {
            generate: function () { return _this.generate(options); },
            validate: function () {
                var isValid = _this.validate(options.validate);
                return isValid ? "✅ CPF válido" : "❌ CPF inválido";
            },
            digits: function () {
                return "D\u00EDgitos verificadores: ".concat(_this.digits(options.digits));
            },
        }[action]();
        return result;
    };
    Cpf.prototype.verifyFirstDigit = function (baseNumbers) {
        var total = baseNumbers.split("").reduce(function (acc, previous, index) {
            var multi = Number(previous) * (10 - index);
            acc += multi;
            return acc;
        }, 0);
        var rest = total % 11;
        var firstDigit = 0;
        if (rest <= 1) {
            firstDigit = 0;
        }
        else {
            firstDigit = 11 - rest;
        }
        return firstDigit;
    };
    Cpf.prototype.verifySecondDigit = function (baseNumbers, firstVeririedNumber) {
        var total = "".concat(baseNumbers).concat(firstVeririedNumber)
            .split("")
            .reduce(function (acc, previous, index) {
            var multi = Number(previous) * (11 - index);
            acc += multi;
            return acc;
        }, 0);
        var rest = total % 11;
        var secondDigit = 0;
        if (rest <= 1) {
            secondDigit = 0;
        }
        else {
            secondDigit = 11 - rest;
        }
        return secondDigit;
    };
    Cpf.prototype.generate = function (options) {
        var baseNumbers = Math.floor(Math.random() * 1000000000)
            .toString()
            .padStart(9, "0");
        var firstDigit = this.verifyFirstDigit(baseNumbers);
        var secondDigit = this.verifySecondDigit(baseNumbers, firstDigit);
        var cpf = "".concat(baseNumbers).concat(firstDigit).concat(secondDigit);
        if (options === null || options === void 0 ? void 0 : options.formatted) {
            return this.formatCpf(cpf);
        }
        return cpf;
    };
    Cpf.prototype.digits = function (baseNumbers) {
        var firstDigit = this.verifyFirstDigit(baseNumbers.toString());
        var secondDigit = this.verifySecondDigit(baseNumbers, firstDigit);
        return "".concat(firstDigit).concat(secondDigit);
    };
    Cpf.prototype.validate = function (cpf) {
        var cleanCpf = cpf.replace(/\D/g, "");
        if (cleanCpf.length !== 11) {
            return false;
        }
        var baseNumbers = cleanCpf.substring(0, 9);
        var checkDigits = cleanCpf.substring(9, 11);
        var firstDigit = this.verifyFirstDigit(baseNumbers);
        var secondDigit = this.verifySecondDigit(baseNumbers, firstDigit);
        return checkDigits === "".concat(firstDigit).concat(secondDigit);
    };
    Cpf.prototype.formatCpf = function (cpf) {
        return cpf
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    };
    return Cpf;
}(module_1.CliModule));
exports.Cpf = Cpf;
