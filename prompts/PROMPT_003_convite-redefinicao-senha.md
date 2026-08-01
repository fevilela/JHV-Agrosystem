# Contexto

Hoje, quando um admin cria um usuário em `/admin/[id]/usuarios` (via `UserForm` em
`src/app/admin/[id]/add-user-form.tsx` e as actions `createUser`/`updateUser` em
`src/app/admin/actions.ts`), ele mesmo digita a senha do cliente no formulário. Não existe
convite por e-mail nem "esqueci minha senha" — combinamos no Cowork implementar isso agora.

Decisões já tomadas na conversa (não reabrir):

- **Criação de usuário passa a ser sempre por convite por e-mail.** O admin não digita mais a
  senha do cliente na criação. O sistema gera um token de convite e envia um e-mail pro cliente
  definir a própria senha. (O campo de senha na edição de um usuário já existente pode continuar
  existindo para o admin resetar manualmente se quiser — ver seção Tarefa.)
- **Sem Resend configurado, não bloquear.** A organização só envia e-mail se tiver
  `resendApiKey`/`resendFromEmail` preenchidos (ver `src/lib/email.ts`, `getEmailCredentials`).
  Quando não tiver, a função de envio deve continuar funcionando (gerar o token e retornar o link),
  e a tela do admin deve mostrar o link de convite/redefinição para ele copiar e mandar manualmente
  (WhatsApp, etc.), em vez de travar a ação.
- Autenticação é NextAuth v5 com Credentials provider, ver `src/lib/auth.ts` (compara
  `passwordHash` com bcryptjs). Login atual em `src/app/login/actions.ts` +
  `src/app/login/page.tsx` (conferir estrutura da página ao implementar).

Antes de começar, crie e mude para uma branch própria a partir da `master` atualizada:

```bash
git checkout master
git pull
git checkout -b feature/convite-redefinicao-senha
```

# Tarefa

## 1. Schema (Prisma)

Adicionar um model para os tokens, algo como:

```prisma
model PasswordResetToken {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String    @unique
  kind      String    // "INVITE" | "RESET" — usar pra diferenciar texto do e-mail/tela, mesma tabela serve pros dois fluxos
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime  @default(now())

  @@map("password_reset_tokens")
}
```

Ajustar `User` com a relação inversa (`passwordResetTokens PasswordResetToken[]`). Gerar a
migration com `npx prisma migrate dev --name add_password_reset_tokens` (nunca `db push`).

Token: usar algo criptograficamente aleatório (ex.: `crypto.randomBytes(32).toString("hex")` do
Node), não UUID sequencial. Expiração sugerida: 7 dias para convite, 1 hora para reset de senha
esquecida — mas deixe isso como constante fácil de achar (ex. `src/lib/password-reset.ts`).

## 2. Lib de e-mail

Em `src/lib/email.ts`, seguir o mesmo padrão de `enviarBoletoEmail`/`enviarContratoEmail`: nova
função `enviarConviteSenhaEmail({ organizationId, email, nomeUsuario, link, kind })` (ou duas
funções separadas, convite e redefinição, se ficar mais claro). Igual às outras, retorna
`{ success: true } | { skipped: true } | { error }` — `skipped: true` quando a org não tem
`resendApiKey`/`resendFromEmail`, sem lançar erro.

## 3. Lógica de geração/validação de token

Um módulo (ex. `src/lib/password-reset.ts`) com:

- `criarTokenSenha(userId, kind)`: gera o token, salva no banco com expiração, devolve o token e o
  link completo (`${NEXTAUTH_URL ou similar}/redefinir-senha/[token]` — checar em `.env.example`
  qual variável de URL base já existe no projeto antes de inventar uma nova).
- `validarToken(token)`: busca o token, confere `usedAt` nulo e `expiresAt` no futuro; devolve o
  usuário associado ou erro (`"não encontrado"`, `"expirado"`, `"já usado"` — mensagens distintas
  ajudam o usuário final).
- `consumirToken(token, novaSenha)`: valida de novo, faz hash da senha com bcryptjs (igual ao
  resto do projeto), atualiza `passwordHash` do usuário, marca `usedAt`.

## 4. Criação de usuário (admin) manda convite em vez de senha

Em `src/app/admin/[id]/add-user-form.tsx`: remover o campo de senha obrigatório na criação (pode
manter na edição de usuário existente, para o admin resetar manualmente se quiser — nesse caso
mantenha o comportamento atual de "deixe em branco pra manter a atual").

Em `createUser` (`src/app/admin/actions.ts`): criar o usuário com uma `passwordHash` temporária
inutilizável (ex. hash de um random, já que o campo é obrigatório no schema) ou reavaliar se vale
tornar `passwordHash` opcional no schema — decisão sua, documente qual caminho seguiu. Depois,
gerar o token de convite (`kind: "INVITE"`) e chamar o envio de e-mail.

Na tela de confirmação (após criar o usuário), sempre mostrar o link de convite gerado, com botão
de copiar — isso vale tanto se o e-mail foi enviado (Resend configurado) quanto se não foi
(mostrar aviso tipo "e-mail não configurado pra essa organização, copie o link abaixo e envie pro
cliente manualmente").

Adicionar também, na tela de edição de usuário (`/admin/[id]/usuarios/[userId]`), um botão
"Reenviar convite" / "Enviar link de redefinição de senha" que gera um novo token a qualquer
momento (útil se o link expirou ou o admin quer resetar a senha de alguém sem saber a senha
atual).

## 5. Telas públicas

- `src/app/redefinir-senha/[token]/page.tsx` (+ `actions.ts`): valida o token via
  `validarToken`, mostra formulário de nova senha (mín. 6 caracteres, igual à regra já usada em
  `admin/actions.ts`) com confirmação, chama `consumirToken`. Tratar os 3 casos de erro
  (não encontrado / expirado / já usado) com mensagens específicas. Ao concluir com sucesso,
  redirecionar pro `/login` com uma mensagem de sucesso.
- `src/app/esqueci-senha/page.tsx` (+ `actions.ts`): formulário só com e-mail. Sempre mostrar a
  mesma mensagem de sucesso genérica ("se esse e-mail existir, enviamos um link"), 
  independente de o e-mail existir ou não (evitar enumeração de usuários). Se existir, gera token
  `kind: "RESET"` e manda e-mail (mesmo fallback de "sem Resend" não se aplica aqui, já que é o
  próprio usuário pedindo — se a org não tiver Resend configurado, considere logar o link no
  servidor ou definir com a Fernanda depois; deixe um comentário `// TODO` explicando a limitação
  em vez de travar silenciosamente).
- Adicionar link "Esqueci minha senha" na tela de login (`src/app/login/page.tsx`).

## 6. i18n

Projeto tem `messages/pt-BR.json`, `messages/en.json`, `messages/es.json` (ver
`src/lib/labels.ts`). Adicionar as strings novas nos três arquivos, seguindo o padrão existente —
não deixar texto só em português hardcoded se o resto da tela usa o sistema de tradução; se as
telas de admin não usam esse sistema hoje, manter consistência com o que já existe ali (pt-BR
direto), mas as telas públicas novas (login/esqueci-senha/redefinir-senha) devem seguir o padrão
de i18n se o restante de `src/app/login` já usa.

# Restrições

- Não commitar direto na `master`.
- Não mexer em `.env`, `.env.example` com segredos reais, nem em `.claude/settings.local.json`.
- Gerar a migration com `npx prisma migrate dev` (nunca `db:push` em cima de dado real).
- Nunca aponte comandos de diff/resolve do Prisma (`--shadow-database-url` ou similar) para o
  `DATABASE_URL` real — o shadow database recria o schema do zero pra comparar, e se apontar pro
  banco de verdade por engano ele é apagado (já aconteceu neste projeto, ver `docs/DATABASE.md`).
  Se encontrar drift entre migrations e o banco, pare e pergunte antes de rodar qualquer comando de
  correção.
- Não enviar senha em texto puro por e-mail em nenhum fluxo — sempre link com token.
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
