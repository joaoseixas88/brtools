# 🇧🇷 BRTools

Uma ferramenta CLI moderna para utilitários brasileiros, desenvolvida para facilitar tarefas do dia a dia relacionadas a documentos e validações do Brasil.

## 🚀 Funcionalidades

### CPF

- ✅ **Geração**: Gera CPFs válidos aleatoriamente
- 🔍 **Validação**: Valida CPFs existentes
- 🧮 **Dígitos Verificadores**: Calcula os dígitos verificadores de um CPF
- 📋 **Cópia para Clipboard**: Copia automaticamente o resultado
- 🎨 **Formatação**: Formata CPFs no padrão XXX.XXX.XXX-XX

### CNPJ

- ✅ **Geração**: Gera CNPJs válidos aleatoriamente
- 🔍 **Validação**: Valida CNPJs existentes
- 🧮 **Dígitos Verificadores**: Calcula os dígitos verificadores de um CNPJ
- 📋 **Cópia para Clipboard**: Copia automaticamente o resultado
- 🎨 **Formatação**: Formata CNPJs no padrão XX.XXX.XXX/XXXX-XX

### Hash

- 🔐 **Múltiplos Algoritmos**: Suporte a bcrypt, MD5, SHA256, SHA512 e Base64
- 📄 **Texto e Arquivos**: Processa tanto textos quanto arquivos
- ⚙️ **Salt Configurável**: Permite configurar o salt para bcrypt (padrão: 10)
- 🔒 **Hashes Seguros**: bcrypt para senhas, SHA256/SHA512 para integridade
- 📋 **Cópia para Clipboard**: Copia automaticamente o hash gerado

### Person

- 👤 **Dados Pessoais**: Gera nome, sobrenome, nome completo, CPF, telefone, RG e mais
- 📧 **E-mail Flexível**: Gera e-mails aleatórios ou derivados de nome com domínio customizável
- 🪪 **Perfil Completo**: Monta um perfil brasileiro simples com múltiplos campos em uma única execução
- 🚻 **Gênero Coerente**: `--gender` alinha o nome sorteado com o campo de gênero do perfil
- 🧾 **Saída em JSON**: Permite uso em automações com a opção `--json`

## 📦 Instalação

Pré-requisito: Node.js 18 ou superior.

```bash
npm install -g @joaoseixas/brtools
```

Também é possível executar sem instalação global:

```bash
npx @joaoseixas/brtools cpf --generate
```

> **Nota**: A opção `--copy` depende de suporte de clipboard no sistema. No Linux, pode ser necessário instalar `xclip`.

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

### Comando CNPJ

#### Gerar CNPJ

```bash
# Gerar um CNPJ válido
brtools cnpj --generate

# Gerar CNPJ formatado
brtools cnpj --generate --formatted

# Gerar CNPJ e copiar para área de transferência
brtools cnpj --generate --copy
```

#### Validar CNPJ

```bash
# Validar um CNPJ
brtools cnpj --validate 11222333000181

# Validar CNPJ formatado
brtools cnpj --validate 11.222.333/0001-81
```

#### Calcular Dígitos Verificadores

```bash
# Calcular dígitos verificadores para os 12 primeiros números
brtools cnpj --digits 112223330001
```

### Comando Hash

#### Algoritmos Disponíveis

- **bcrypt**: Hash seguro para senhas (com salt configurável)
- **md5**: Hash MD5 (128 bits)
- **sha256**: Hash SHA-256 (256 bits)
- **sha512**: Hash SHA-512 (512 bits)
- **base64**: Codificação Base64

#### Gerar Hash de Texto

```bash
# Hash bcrypt com texto
brtools hash bcrypt --text "minha senha"

# Hash bcrypt com salt customizado
brtools hash bcrypt --text "minha senha" --salt 12

# Hash SHA-256 de um texto
brtools hash sha256 --text "dados importantes"

# Hash MD5 de um texto
brtools hash md5 --text "texto qualquer"

# Codificar em Base64
brtools hash base64 --text "texto para codificar"

# Qualquer hash com cópia para clipboard
brtools hash sha512 --text "meu texto" --copy
```

#### Gerar Hash de Arquivo

```bash
# Hash SHA-256 de um arquivo
brtools hash sha256 --file "./documento.txt"

# Hash MD5 de um arquivo
brtools hash md5 --file "./imagem.jpg"

# bcrypt de conteúdo de arquivo
brtools hash bcrypt --file "./config.txt" --salt 12

# Base64 de um arquivo (útil para embeds)
brtools hash base64 --file "./logo.png"

# Hash de arquivo com cópia para clipboard
brtools hash sha512 --file "./arquivo.pdf" --copy
```

### Comando Person

#### Gerar dados unitários

```bash
# Gerar um nome
brtools person name

# Gerar um nome de um gênero específico
brtools person name --gender feminino

# Gerar um sobrenome
brtools person surname

# Gerar um nome completo
brtools person full-name

# Gerar um nome completo masculino
brtools person full-name --gender m

# Gerar um CPF formatado
brtools person cpf --formatted

# Gerar um celular formatado
brtools person phone --formatted

# Gerar um CEP em JSON
brtools person cep --json
```

#### Gerar e-mail

```bash
# Gerar e-mail aleatório
brtools person email

# Gerar e-mail derivado de nome completo
brtools person email --name "João Silva"

# Gerar e-mail derivado de nome e sobrenome com domínio customizado
brtools person email --first-name "Maria" --surname "Souza" --domain empresa.com.br
```

#### Gerar perfil completo

```bash
# Gerar perfil completo em texto
brtools person profile --formatted

# Gerar perfil completo em JSON
brtools person profile --formatted --json

# Gerar o perfil de um gênero específico (nome e campo gênero coerentes)
brtools person profile --gender feminino

# Gerar o perfil de uma pessoa com nome definido por você
brtools person profile --name "Thaís D'Ávila" --json
```

O e-mail do perfil é derivado do nome, sorteando entre seis combinações
(`joao.silva`, `joao_silva`, `joaosilva`, `j.silva`, `joao.s`, `silva.joao`),
com sufixo numérico em parte dos casos. O nome é saneado para gerar um e-mail
sempre válido: acentos e cedilha são convertidos, apóstrofos e hífens removidos,
e o resultado é limitado aos 64 caracteres do RFC 5321.

### Opções Globais

| Opção                        | Descrição                                      |
| ---------------------------- | ---------------------------------------------- |
| `-g, --generate`             | Gera um CPF/CNPJ válido                        |
| `-v, --validate <documento>` | Valida um CPF/CNPJ informado                   |
| `-d, --digits <digits>`      | Calcula dígitos verificadores                  |
| `-t, --text <texto>`         | Texto a ser hasheado                           |
| `-f, --file <arquivo>`       | Arquivo a ser processado/hasheado              |
| `-s, --salt <salt>`          | Salt para algoritmo bcrypt (padrão: 10)       |
| `-c, --copy`                 | Copia o resultado para a área de transferência |
| `-j, --json`                 | Retorna o resultado em JSON                    |
| `-f, --formatted`            | Formata o documento no padrão brasileiro       |
| `-g, --gender <gênero>`      | Gênero em `person`: masculino \| feminino \| m \| f |
| `--name <nome>`              | Nome completo usado por `person email/profile` |
| `--version`                  | Mostra a versão da ferramenta                  |
| `--help`                     | Mostra ajuda                                   |

## 📋 Exemplos

```bash
# Exemplo completo: gerar CPF formatado e copiar
brtools cpf --generate --formatted --copy
# Output: 123.456.789-01  ✅ Copiado para a área de transferência

# Validar um CPF
brtools cpf --validate 11144477735
# Output: ✅ CPF válido

# Calcular dígitos verificadores de CPF
brtools cpf --digits 111444777
# Output: Dígitos verificadores: 35

# Gerar CNPJ formatado
brtools cnpj --generate --formatted
# Output: 11.222.333/0001-81

# Validar CNPJ
brtools cnpj --validate 11222333000181
# Output: ✅ CNPJ válido

# Hash bcrypt de texto
brtools hash bcrypt --text "minha senha"
# Output: $2b$10$abc123...xyz789

# Hash SHA-256 de texto
brtools hash sha256 --text "dados importantes"
# Output: a1b2c3d4e5f6...

# Hash MD5 de arquivo
brtools hash md5 --file "./documento.txt"
# Output: 5d41402abc4b...

# Base64 de arquivo
brtools hash base64 --file "./imagem.png"
# Output: iVBORw0KGgoAAAANSUhEUgAA...

# Hash SHA-512 com cópia para clipboard
brtools hash sha512 --text "texto seguro" --copy
# Output: a1b2c3d4e5f6...  ✅ Copiado para a área de transferência

# Gerar nome completo
brtools person full-name
# Output: João Pereira

# Gerar e-mail em JSON
brtools person email --name "Maria Souza" --json
# Output: {"email":"maria.souza42@gmail.com"}

# Gerar perfil completo formatado
brtools person profile --formatted
# Output: Nome completo: Ana Costa
...demais campos...
```

## 🏗️ Arquitetura

O projeto segue uma arquitetura modular e extensível com carregamento automático de módulos:

```
src/
├── commander/           # Sistema de comandos
│   └── index.ts        # ProgramStarter - carrega módulos automaticamente
├── exceptions/          # Exceções customizadas
│   └── Validation.ts   # Tratamento de erros de validação
├── helpers/            # Funções utilitárias
│   └── numbers.ts      # Helpers para manipulação de números
├── modules/            # Módulos funcionais
│   ├── cpf/           # Módulo de operações com CPF
│   │   ├── index.ts   # Lógica principal do CPF
│   │   ├── commander.ts  # Configuração de comandos
│   │   └── cpf.spec.ts  # Testes do módulo
│   ├── cnpj/          # Módulo de operações com CNPJ
│   │   ├── index.ts   # Lógica principal do CNPJ
│   │   ├── commander.ts  # Configuração de comandos
│   │   └── cnpj.spec.ts  # Testes do módulo
│   ├── hash/          # Módulo de hash de textos
│   │   ├── index.ts   # Lógica principal do hash
│   │   ├── commander.ts  # Configuração de comandos
│   │   └── types.ts   # Tipos para algoritmos de hash
│   ├── person/        # Módulo de dados pessoais
│   │   ├── index.ts   # Lógica principal do módulo person
│   │   ├── commander.ts  # Configuração do comando person
│   │   ├── person.spec.ts  # Testes do módulo
│   │   └── types.ts   # Tipos do perfil de pessoa
│   └── module.ts      # Classe base abstrata
├── services/           # Serviços compartilhados
│   └── logger.ts      # Sistema de logging colorido
├── types/             # Definições de tipos TypeScript
└── index.ts           # Ponto de entrada da CLI
```

### Estrutura Modular

- **ProgramStarter**: Carrega automaticamente todos os módulos com comandos
- **CliModule**: Classe abstrata que define a interface para todos os módulos
- **CPF Module**: Implementa todas as operações relacionadas a CPF
- **CNPJ Module**: Implementa todas as operações relacionadas a CNPJ
- **Hash Module**: Implementa hash de textos e arquivos com múltiplos algoritmos (bcrypt, MD5, SHA256, SHA512, Base64)
- **Person Module**: Implementa geração de dados pessoais brasileiros unitários e em perfil completo
- **Logger Service**: Fornece logging colorido com chalk
- **ValidationException**: Tratamento especializado de erros de validação
- **NumbersHelper**: Funções utilitárias para manipulação de números

## 🛣️ Roadmap

### Próximas Funcionalidades

- 🏦 **Códigos Bancários**: Validação de códigos de bancos brasileiros
- 📮 **CEP**: Consulta e validação de CEPs
- 🆔 **RG**: Validação por estado
- 📞 **Telefone**: Formatação e validação de números brasileiros
- 💳 **Cartão de Crédito**: Validação de números de cartão
- 🏛️ **Inscrição Estadual**: Validação por estado

## 🧪 Desenvolvimento

### Pré-requisitos

- Node.js 20+
- pnpm

### Scripts Disponíveis

```bash
# Instalar dependências
pnpm install --frozen-lockfile

# Compilar o projeto
pnpm build

# Executar testes
pnpm test

# Executar lint
pnpm lint

# Validar o pacote antes de publicar
pnpm release:check

# Validar, criar versão patch e publicar no npm
pnpm release:patch
```

### Publicação

O pacote publicado usa o binário compilado em `dist/index.js`. Antes de empacotar, o script `prepack` executa `pnpm build` para garantir que o `dist/` esteja atualizado.

Use `pnpm release:check` para rodar lint, build, testes e conferir o conteúdo do pacote com `npm pack --dry-run`. Use `pnpm release:patch` apenas quando quiser criar uma nova versão patch e publicar no npm com acesso público.

Ao fazer merge na branch `main`, o GitHub Actions publica automaticamente a versão do `package.json` se ela ainda não existir no npm. A publicação usa Trusted Publishing do npm com o workflow `.github/workflows/publish.yml`.

### Estrutura do Projeto

```bash
brtools/
├── src/                    # Código fonte TypeScript
│   ├── commander/         # Sistema de comandos
│   ├── exceptions/        # Exceções customizadas
│   ├── helpers/           # Funções utilitárias
│   ├── modules/           # Módulos funcionais (CPF, CNPJ, Hash, etc.)
│   ├── services/          # Serviços compartilhados
│   └── types/             # Definições de tipos
├── dist/                   # Código compilado (gerado automaticamente)
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

1. Crie uma nova pasta em `src/modules/nome-do-modulo/`
2. Implemente a classe que estenda `CliModule`
3. Crie o arquivo `commander.ts` com as configurações do comando
4. Adicione testes no arquivo `*.spec.ts`
5. O `ProgramStarter` carregará automaticamente o novo módulo

### Exemplo de Estrutura de Módulo

```typescript
// src/modules/exemplo/index.ts
import { CliModule } from '../module';

export class ExemploModule extends CliModule {
  handle(options: any): CliModule.Result {
    // Sua lógica aqui
    return 'resultado';
  }
}

// src/modules/exemplo/commander.ts
import { Command } from 'commander';
import { ExemploModule } from './index';

export default function (program: Command) {
  program
    .command('exemplo')
    .description('Descrição do seu módulo')
    .option('-o, --option', 'Sua opção')
    .action((options) => {
      const result = new ExemploModule().handle(options);
      console.log(result);
    });
}
```

## 🔧 Tecnologias Utilizadas

- **TypeScript**: Linguagem principal
- **Commander.js**: Framework para CLI
- **Chalk**: Colorização de output
- **Copy-paste**: Funcionalidade de clipboard
- **bcryptjs**: Biblioteca para hash seguro de senhas sem dependência nativa
- **Jest**: Framework de testes
- **Node.js**: Runtime

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

**João Seixas**

- GitHub: [github.com/joaoseixas88](https://github.com/joaoseixas88)
- Projeto: [github.com/joaoseixas88/brtools](https://github.com/joaoseixas88/brtools)

## 🌟 Agradecimentos

- Comunidade JavaScript/TypeScript brasileira
- Contributors e usuários da ferramenta
- Inspiração na necessidade de ferramentas brasileiras para desenvolvedores

---

**BRTools** - Facilitando a vida dos desenvolvedores brasileiros! 🇧🇷
