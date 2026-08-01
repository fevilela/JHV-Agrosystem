# Contexto

O `PROMPT_003_convite-redefinicao-senha.md` já foi implementado (commit `77ea7a4`, branch
`feature/convite-redefinicao-senha`): convite de senha na criação de usuário e fluxo de "esqueci
minha senha", ambos enviando e-mail via `enviarConviteSenhaEmail`/`enviarRedefinicaoSenhaEmail`
em `src/lib/email.ts`. Essas duas funções hoje usam `getEmailCredentials(organizationId)`, ou
seja, dependem do **Resend configurado na própria organização** (`Organization.resendApiKey` /
`resendFromEmail`, preenchido em `/admin/[id]`).

Isso gera um problema de ovo-e-galinha: toda organização nova que a Fernanda cadastra ainda não
tem Resend configurado, então o primeiro convite de senha do admin dela sempre cai no fallback de
"mostrar link na tela" em vez de mandar e-mail de verdade.

Decisão tomada no Cowork: a Fernanda tem uma conta Resend própria da JHV (plataforma), que deve
ser usada especificamente pros e-mails de sistema — convite de senha e redefinição de senha —
independente de a organização ter ou não o Resend dela configurada. O Resend por organização
(`resendApiKey`/`resendFromEmail` no banco) continua existindo exatamente como está, só que
exclusivamente para `enviarBoletoEmail` e `enviarContratoEmail` (e-mails de negócio da organização
pros clientes dela).

As credenciais da plataforma já foram adicionadas ao `.env` local (fora do git, não precisa mexer
nisso) como `RESEND_API_KEY` e `RESEND_FROM_EMAIL`. Seu trabalho é só fazer o código usar essas
duas env vars pros e-mails de sistema.

Referência de padrão já existente no projeto: `docs/SETUP.md` já documenta
`WHATSAPP_ACCESS_TOKEN`/etc. como "fallback de env vars — pode ser configurado por organização em
vez disso". Seguir essa mesma lógica de documentação pras novas variáveis.

Antes de começar, crie e mude para uma branch própria a partir da `master` atualizada:

```bash
git checkout master
git pull
git checkout -b fix/resend-plataforma-emails-sistema
```

(Se a branch `feature/convite-redefinicao-senha` ainda não tiver sido mergeada na `master`, pare e
me avise antes de prosseguir — preciso confirmar a ordem de merge com a Fernanda.)

# Tarefa

Em `src/lib/email.ts`:

1. Criar uma função (ex. `getPlatformEmailCredentials()`) que lê `process.env.RESEND_API_KEY` e
   `process.env.RESEND_FROM_EMAIL` diretamente — sem consultar o banco.
2. Alterar `enviarConviteSenhaEmail` e `enviarRedefinicaoSenhaEmail` para usar essa função em vez
   de `getEmailCredentials(organizationId)`. Se `organizationId` não for mais usado em nenhuma
   dessas duas funções depois da mudança, pode remover o parâmetro (ajustar os callers em
   `src/app/admin/actions.ts`, `src/app/esqueci-senha/actions.ts` e
   `src/app/redefinir-senha/[token]/actions.ts` — conferir se ele é usado só pra isso ou se tem
   outro uso antes de remover).
3. Manter o mesmo contrato de retorno (`{ success: true } | { skipped: true } | { error }`) e o
   mesmo comportamento de fallback já existente: quando as env vars não estiverem configuradas
   (`skipped: true`), a tela do admin (`invite-link-banner.tsx`) e as telas públicas de
   esqueci-senha/redefinir-senha continuam mostrando o link pra copiar — isso não muda, só a fonte
   da credencial muda de "banco por organização" para "env var de plataforma".
4. Não tocar em `enviarBoletoEmail` nem `enviarContratoEmail` — esses continuam usando
   `getEmailCredentials(organizationId)` normalmente.

Em `.env.example`: adicionar `RESEND_API_KEY` e `RESEND_FROM_EMAIL` com valores de placeholder
(nunca o valor real), com um comentário curto explicando que são só pros e-mails de sistema
(convite/redefinição de senha), não pros e-mails de negócio da organização.

Em `docs/SETUP.md`: adicionar uma linha na tabela de variáveis de ambiente pras duas novas
variáveis, seguindo o mesmo formato das outras linhas (coluna "Descrição" explicando a distinção
entre Resend de plataforma x Resend por organização).

Se houver testes existentes cobrindo `enviarConviteSenhaEmail`/`enviarRedefinicaoSenhaEmail` ou
`getEmailCredentials`, ajustar/adicionar testes pra cobrir a leitura das env vars de plataforma
(mockar `process.env` no teste, não usar valor real).

# Restrições

- Não commitar direto na `master`.
- Não escrever a chave/valor real do Resend em nenhum arquivo rastreado pelo git (só placeholder
  em `.env.example` e nada em `docs/`). O `.env` real já está preenchido localmente e é ignorado
  pelo git — não precisa e não deve tocar nele.
- Não mexer em `.claude/settings.local.json`.
- Se a tarefa envolver mudança no `prisma/schema.prisma`, gerar a migration com
  `npx prisma migrate dev` (nunca `db:push` em cima de dado real) — mas essa tarefa aqui não deve
  precisar de migration nenhuma, é só troca de fonte de credencial.
- Nunca aponte comandos de diff/resolve do Prisma (`--shadow-database-url` ou similar) para o
  `DATABASE_URL` real — ver `docs/DATABASE.md` sobre o incidente anterior.
- Rodar `npm test` e `npm run lint` antes de considerar terminado.

# Ao final, responda com um resumo neste formato (para eu colar no Cowork):

```
## O que foi feito
[lista objetiva das mudanças]

## Arquivos/módulos tocados
[lista de arquivos ou áreas do sistema]

## Banco de dados
[nova migration? qual? ou "nenhuma mudança de schema"]

## Testes
[passou / o que foi adicionado ou ajustado]

## Branch
[nome da branch criada, e se já tem PR aberto]

## Pendências ou decisões que ficaram em aberto
[qualquer coisa que precise de decisão minha ou da Fernanda antes do merge]
```
