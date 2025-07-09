# 🇧🇷 BRTools

Uma ferramenta CLI moderna para utilitários brasileiros, desenvolvida para facilitar tarefas do dia a dia relacionadas a documentos e validações do Brasil.

## 🚀 Funcionalidades

### CPF
- ✅ **Geração**: Gera CPFs válidos aleatoriamente
- 🔍 **Validação**: Valida CPFs existentes  
- 🧮 **Dígitos Verificadores**: Calcula os dígitos verificadores de um CPF
- 📋 **Cópia para Clipboard**: Copia automaticamente o resultado
- 🎨 **Formatação**: Formata CPFs no padrão XXX.XXX.XXX-XX

## 📦 Instalação

```bash
npm install -g @joaoseixas/brtools
```

## 🛠️ Uso

### Comando CPF

#### Gerar CPF
```bash
# Gerar um CPF válido
brtools cpf --generate

# Gerar CPF formatado
brtools cpf --generate --formatted

# Gerar CPF e copiar para área de transferência
brtools cpf --generate --copy
```

#### Validar CPF
```bash
# Validar um CPF
brtools cpf --validate 12345678901

# Validar CPF formatado
brtools cpf --validate 123.456.789-01
```

#### Calcular Dígitos Verificadores
```bash
# Calcular dígitos verificadores para os 9 primeiros números
brtools cpf --digits 123456789
```

### Opções Globais

| Opção | Descrição |
|-------|-----------|
| `-g, --generate` | Gera um CPF válido |
| `-v, --validate <cpf>` | Valida um CPF informado |
| `-d, --digits <digits>` | Calcula dígitos verificadores |
| `-c, --copy` | Copia o resultado para a área de transferência |
| `-f, --formatted` | Formata o CPF no padrão XXX.XXX.XXX-XX |
| `--version` | Mostra a versão da ferramenta |
| `--help` | Mostra ajuda |

## 📋 Exemplos

```bash
# Exemplo completo: gerar CPF formatado e copiar
brtools cpf --generate --formatted --copy
# Output: 123.456.789-01  ✅ Copiado para a área de transferência

# Validar um CPF
brtools cpf --validate 11144477735
# Output: ✅ CPF válido

# Calcular dígitos verificadores
brtools cpf --digits 111444777
# Output: Dígitos verificadores: 35
```

## 🏗️ Arquitetura

O projeto segue uma arquitetura modular e extensível:

```
src/
├── exceptions/          # Exceções customizadas
│   └── Validation.ts   # Tratamento de erros de validação
├── modules/            # Módulos funcionais
│   ├── module.ts       # Classe base abstrata
│   └── cpf.ts         # Módulo de operações com CPF
└── index.ts           # Ponto de entrada da CLI
```

### Estrutura Modular

- **CliModule**: Classe abstrata que define a interface para todos os módulos
- **CPF Module**: Implementa todas as operações relacionadas a CPF
- **ValidationException**: Tratamento especializado de erros de validação

## 🛣️ Roadmap

### Próximas Funcionalidades
- 📱 **CNPJ**: Geração, validação e formatação
- 🏦 **Códigos Bancários**: Validação de códigos de bancos brasileiros
- 📮 **CEP**: Consulta e validação de CEPs
- 🆔 **RG**: Validação por estado
- 📞 **Telefone**: Formatação e validação de números brasileiros

## 🧪 Desenvolvimento

### Pré-requisitos
- Node.js 16+
- pnpm (recomendado) ou npm

### Scripts Disponíveis

```bash
# Compilar o projeto
npm run build

# Instalar dependências
pnpm install
```

### Estrutura do Projeto

```bash
brtools/
├── src/                    # Código fonte
├── dist/                   # Código compilado
├── package.json           # Configurações do projeto
├── tsconfig.json          # Configurações TypeScript
└── README.md             # Documentação
```

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Para contribuir:

1. 🍴 Faça um fork do projeto
2. 🌱 Crie uma branch para sua funcionalidade (`git checkout -b feature/nova-funcionalidade`)
3. ✨ Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. 📤 Push para a branch (`git push origin feature/nova-funcionalidade`)
5. 🔄 Abra um Pull Request

### Adicionando Novos Módulos

Para adicionar um novo módulo:

1. Crie uma nova classe que estenda `CliModule`
2. Implemente o método `handle(options)`
3. Adicione o comando no `index.ts`
4. Documente a funcionalidade

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

**João Seixas**
- GitHub: [github.com/joaoseixas88](https://github.com/joaoseixas88)
- Projeto: [github.com/joaoseixas88/brtools](https://github.com/joaoseixas88/brtools)

## 🌟 Agradecimentos

- Comunidade JavaScript/TypeScript brasileira
- Contributors e usuários da ferramenta

---

**BRTools** - Facilitando a vida dos desenvolvedores brasileiros! 🇧🇷
