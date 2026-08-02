# Contexto

Fotos e documentos de animais (`AnimalPhoto`/`AnimalDocument`) são salvos em disco local, em
`public/uploads/`, via `src/lib/upload.ts` (`saveUploadedFile`). Único caller hoje:
`src/app/(app)/cadastro/animais/actions.ts` (`uploadAnimalPhotoAction`,
`uploadAnimalDocumentAction`).

Problema: o Render (onde a aplicação roda, ver `docs/DEPLOY.md`) usa disco efêmero — o conteúdo de
`public/uploads/` é perdido a cada novo deploy. Ou seja, toda foto/documento de animal cadastrado
some na próxima vez que alguém subir uma mudança de código. Isso já está anotado como pendência em
`docs/DEPLOY.md` e precisa ser resolvido antes do sistema "ficar pronto".

Decisão tomada no Cowork: usar **Supabase Storage** como destino, não S3 — o projeto já usa
Supabase pro banco (mesma conta/projeto, sem credencial nova de outro fornecedor). Usar um bucket
**público** (parity com o comportamento atual: hoje os arquivos já ficam acessíveis por URL direta
sem autenticação, só "protegidos" por nome de arquivo ser um UUID aleatório — um bucket público do
Supabase Storage mantém o mesmo nível de proteção, não piora nada). Se no futuro quiser
endurecer isso com bucket privado + URLs assinadas, fica como próxima iteração, não precisa
resolver agora — comente essa possibilidade no código pra quem for mexer depois, mas não implemente.

Antes de começar, crie e mude para uma branch própria a partir da `master` atualizada:

```bash
git checkout master
git pull
git checkout -b feature/uploads-supabase-storage
```

# Tarefa

## 1. Configuração do Supabase Storage

No painel do Supabase (mesmo projeto do banco — ver `DATABASE_URL` em `.env`), criar um bucket
(sugestão de nome: `uploads`), público, se ainda não existir — documentar esse passo manual em
`docs/DEPLOY.md` já que não dá pra automatizar por código (precisa ser feito uma vez no painel ou
via Supabase CLI/Management API, à sua escolha, mas o passo manual mínimo deve ficar documentado
pra quem configurar um ambiente novo do zero).

Adicionar a dependência `@supabase/supabase-js` (client oficial) e duas novas env vars:
`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` (a service role key é necessária pra upload/delete
via server-side sem passar pelas RLS policies de usuário; nunca expor essa chave no client, só usar
em código server-side — `saveUploadedFile` já roda em server actions). Adicionar as duas em
`.env.example` com placeholder e documentar em `docs/SETUP.md` (mesma tabela de variáveis) e em
`docs/DEPLOY.md` (variáveis a configurar no Render).

## 2. Reescrever `src/lib/upload.ts`

Trocar a implementação de `saveUploadedFile` pra fazer upload pro bucket do Supabase Storage em vez
de `fs.writeFile` local, mantendo a mesma assinatura de função e mesmo formato de retorno (`{ url,
name }`) pra não precisar mexer nos callers além do necessário — `url` passa a ser a URL pública do
Supabase Storage em vez de `/uploads/...`.

Adicionar também uma função de exclusão (ex. `deleteUploadedFile(url)`) que remove o objeto do
bucket a partir da URL salva. Hoje `deleteAnimalPhotoAction`/`deleteAnimalDocumentAction`
(`src/app/(app)/cadastro/animais/actions.ts`) só apagam a linha do banco e nunca apagaram o arquivo
físico — no disco local isso não importava muito (efêmero mesmo), mas no Storage os arquivos vão
se acumular pra sempre se não forem removidos. Chamar essa nova função de exclusão nessas duas
actions antes/depois do `prisma...delete`.

## 3. Migração de dados já existentes

Não há como recuperar arquivos que já foram perdidos em deploys anteriores no Render (o disco já
não tem mais nada). Não precisa escrever script de migração de dados antigos — só confirmar (e
mencionar no resumo final) que registros de `AnimalPhoto`/`AnimalDocument` já existentes no banco
provavelmente apontam pra URLs `/uploads/...` que não existem mais fisicamente; isso é uma limpeza
manual de dados que cabe à Fernanda decidir depois (remover os registros órfãos ou não), não faz
parte deste prompt.

## 4. Testes

Se houver testes cobrindo `saveUploadedFile` ou as actions de upload, ajustar pra mockar o client
do Supabase Storage em vez de tocar sistema de arquivos real. Se não houver, não é obrigatório
criar do zero, mas é bom ter ao menos um teste de unidade do novo `upload.ts` mockando o client.

# Restrições

- Não commitar direto na `master`.
- Não mexer em `.env`, `.env.example` com segredos reais (só placeholder), nem em
  `.claude/settings.local.json`.
- Não gerar nem printar a `SUPABASE_SERVICE_ROLE_KEY` em nenhum log.
- Se a tarefa envolver mudança no `prisma/schema.prisma`, gerar a migration com
  `npx prisma migrate dev` (nunca `db:push`) — mas essa tarefa não deve precisar de migration
  nenhuma (os modelos `AnimalPhoto`/`AnimalDocument` não mudam de formato, só a origem do arquivo).
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
[passo manual de criar o bucket no painel do Supabase — já foi feito ou ainda precisa ser feito?
registros órfãos de fotos/documentos antigos — o que fazer com eles? qualquer outra decisão]
```
