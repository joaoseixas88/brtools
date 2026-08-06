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

- 🔐 **Múltiplos Algoritmos**: Suporte a bcrypt, scrypt, MD5, SHA256, SHA512 e Base64
- 📄 **Texto e Arquivos**: Processa tanto textos quanto arquivos
- ⚙️ **Salt Configurável**: Permite configurar o salt para bcrypt (padrão: 10)
- 🅰️ **Compatível com AdonisJS**: `scrypt` gera a mesma PHC string do `@adonisjs/hash`
- 🔒 **Hashes Seguros**: bcrypt/scrypt para senhas, SHA256/SHA512 para integridade
- 🔑 **Gerador de Senha**: `--password` cria uma senha forte e devolve a senha junto do hash
- 📋 **Cópia para Clipboard**: Copia automaticamente o hash gerado

### Person

- 👤 **Dados Pessoais**: Gera nome, sobrenome, nome completo, CPF, telefone, RG e mais
- 📧 **E-mail Flexível**: Gera e-mails aleatórios ou derivados de nome com domínio customizável
- 🪪 **Perfil Completo**: Monta um perfil brasileiro simples com múltiplos campos em uma única execução
- 🚻 **Gênero Coerente**: `--gender` alinha o nome sorteado com o campo de gênero do perfil
- 🔑 **Senha Forte**: Gera senha no padrão comum (maiúscula, minúscula, dígito e símbolo) já com hash bcrypt no perfil
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
- **scrypt**: Hash de senha no formato PHC, compatível com o `@adonisjs/hash`
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

# Hash scrypt (formato PHC, igual ao AdonisJS)
brtools hash scrypt --text "minha senha"

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

#### Gerar e hashear uma senha

```bash
# Gera uma senha forte de 12 caracteres e devolve senha + hash bcrypt
brtools hash bcrypt --password

# Senha com tamanho customizado (8 a 64)
brtools hash bcrypt --password 20 --salt 12

# Em JSON, para uso em scripts e seeds
brtools hash bcrypt --password --json
```

```text
Senha: d7Auf5ST-$a7
Hash: $2b$10$z9MmiWaX9sWFP5.w28L7oeelWLdktjObh0i/bXmYquGt9E4yRd8xu
```

A senha segue o padrão forte mais comum: pelo menos uma letra maiúscula, uma
minúscula, um dígito e um símbolo (`!@#$%&*?-_`), com no mínimo 8 caracteres
(padrão 12) sorteados via `crypto.randomInt`. `--password` funciona com qualquer
algoritmo e não pode ser combinado com `--text` ou `--file`.

#### Hash compatível com AdonisJS (scrypt)

O algoritmo `scrypt` produz a mesma PHC string do driver padrão do
`@adonisjs/hash`, então o valor gerado aqui passa direto no `hash.verify()` da
aplicação — útil para semear usuários no banco:

```bash
# Senha forte + hash pronto para o seed, em JSON
brtools hash scrypt --password --json

# Hash de uma senha específica
brtools hash scrypt --text "senha123"
```

```json
{
  "algorithm": "scrypt",
  "password": "8tht?v$4VY6C",
  "hash": "$scrypt$n=16384,r=8,p=1$1Jlbga8EhQwUHIdvDNHlcg$MICJwl8JB8GsyLqER4Kykxl..."
}
```

Sem flags, os parâmetros são exatamente os defaults do Adonis, o que faz o
`needsReHash()` da aplicação retornar `false`. Para bater com um
`config/hash.ts` customizado, ajuste-os:

| Flag                    | Config do Adonis  | Padrão     | Faixa válida                       |
| ----------------------- | ----------------- | ---------- | ---------------------------------- |
| `--cost <n>`            | `cost`            | `16384`    | potência de 2, a partir de 2       |
| `--block-size <r>`      | `blockSize`       | `8`        | 1 ou mais                          |
| `--parallelization <p>` | `parallelization` | `1`        | 1 ou mais                          |
| `--salt-size <bytes>`   | `saltSize`        | `16`       | 8 a 1024                           |
| `--key-length <bytes>`  | `keyLength`       | `64`       | 64 a 128                           |
| `--max-memory <bytes>`  | `maxMemory`       | `33554432` | maior que `128 × cost × blockSize` |

```bash
# Mesmo config de uma app que subiu o custo
brtools hash scrypt --text "senha123" --cost 32768 --max-memory 67108864
```

Cada hash com o custo padrão leva algumas dezenas de milissegundos; para gerar
muitos de uma vez, vale baixar o `--cost`. O `--salt` (rounds) é exclusivo do
bcrypt e é ignorado pelo scrypt, que sorteia o próprio salt a cada execução.

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

#### Gerar senha

```bash
# Senha forte de 12 caracteres
brtools person password

# Senha com tamanho customizado (8 a 64)
brtools person password --length 20

# Várias senhas de uma vez, em JSON
brtools person password --count 5 --json
```

A senha segue o padrão forte mais comum — pelo menos uma letra maiúscula, uma
minúscula, um dígito e um símbolo (`!@#$%&*?-_`) — com no mínimo 8 caracteres
(padrão 12). Os caracteres são sorteados via `crypto.randomInt`, não `Math.random`.

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

# Ajustar a senha do perfil: tamanho e rounds do bcrypt
brtools person profile --length 16 --salt 12 --json
```

O perfil traz `password` (senha em texto, no padrão forte) e `passwordHash`
(bcrypt da mesma senha), pensados para seed de banco: use o hash no insert e a
senha para logar. `--salt` aceita de 4 a 15 rounds (padrão 10) — vale baixar em
lotes grandes, já que cada perfil paga o custo de um bcrypt.

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
| `-n, --count <n>`            | Gera vários itens de uma vez (valores únicos)  |
| `-p, --password [tamanho]`   | Em `hash`: gera uma senha forte e a hasheia    |
| `-l, --length <tamanho>`     | Tamanho da senha em `person`: 8 a 64 (padrão 12) |
| `--cost`, `--block-size`...  | Parâmetros do `hash scrypt` (ver acima)        |
| `--name <nome>`              | Nome completo usado por `person email/profile` |
| `-v, --version`              | Mostra a versão da ferramenta                  |
| `--help`                     | Mostra ajuda                                   |

## 🔁 Geração em lote

Use `--count` para gerar vários itens de uma vez. Os valores são garantidamente
únicos dentro do lote, o que evita colisão ao popular tabela com coluna única.

```bash
# 100 CPFs, um por linha
brtools cpf --generate --count 100

# 50 CNPJs formatados direto para um arquivo
brtools cnpj --generate --formatted --count 50 > cnpjs.txt

# 10 perfis completos como array JSON
brtools person profile --count 10 --json

# 20 senhas fortes
brtools person password --count 20
```

Com `--json` a saída é sempre um array — inclusive com `--count 1`, para não
quebrar script que passa a quantidade por variável. Cada item é o valor gerado
na sua forma natural: string nos geradores escalares, objeto em `person address`
e `person profile`.

```bash
brtools cpf --generate --count 2 --json
# ["51827689072","22390325530"]

brtools person profile --count 2 --json
# [{"fullName":"Bruno Souza","cpf":"...","address":{...},...}, {...}]
```

Em texto, registros de uma linha saem um por linha — seguro para `grep`, `wc` e
pipe. Só registros de múltiplas linhas (`person profile`) ganham uma linha em
branco entre si, para dar pra distinguir onde um termina e o outro começa.

O limite é 10.000 itens por execução, e `--count` só se aplica à geração — usar
junto de `--validate` é erro.

## 📥 Lendo do stdin

Passe `-` no lugar do valor para ler da entrada padrão, uma ocorrência por linha:

```bash
# Validar uma lista de CPFs
cat cpfs.txt | brtools cpf --validate -

# Dígitos verificadores de vários CNPJs
cat bases.txt | brtools cnpj --digits -

# Hash do conteúdo que vem pelo pipe
cat contrato.pdf | brtools hash sha256 --text -
```

Saída da validação em lote:

```
86112763702  ✅ CPF válido
11111111111  ❌ CPF inválido
```

## ↩️ Códigos de saída

| Código | Significado                                         |
| ------ | --------------------------------------------------- |
| `0`    | Sucesso — e, na validação, documento válido          |
| `1`    | Documento inválido (qualquer linha, no modo lote)    |
| `2`    | Erro de uso: opção inválida, entrada vazia, etc.     |

Isso permite usar a CLI em script:

```bash
if brtools cpf --validate "$documento" > /dev/null; then
  echo "documento ok"
fi
```

## 🔔 Aviso de versão

Quando há versão nova, a CLI avisa **no stderr** — nunca no stdout, para não
contaminar pipes. A consulta ao registry acontece no máximo uma vez por dia e é
silenciosa quando a saída não é um terminal. Para desligar, defina
`NO_UPDATE_NOTIFIER=1` (ou rode em CI, onde já é automático).

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
│   ├── numbers.ts      # Helpers para manipulação de números
│   ├── password.ts     # Geração de senha forte e hash bcrypt
│   └── scrypt.ts       # scrypt em formato PHC, compatível com o AdonisJS
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
- **Hash Module**: Implementa hash de textos e arquivos com múltiplos algoritmos (bcrypt, scrypt, MD5, SHA256, SHA512, Base64)
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
- **node:crypto**: scrypt e geração de salt para o hash compatível com o AdonisJS
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
