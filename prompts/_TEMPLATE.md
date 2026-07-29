<!--
Este é o molde usado para criar cada PROMPT_NNN_titulo.md.
Não é pra rodar este arquivo no Claude Code — é só a referência de formato.
-->

# Contexto

[Por que essa tarefa existe — o que foi discutido no Cowork, decisões já tomadas, o que já foi descartado.]

# Tarefa

Antes de começar, crie e mude para uma branch própria a partir da `master` atualizada:

```bash
git checkout master
git pull
git checkout -b tipo/nome-curto
```

[Descrição objetiva do que precisa ser feito. Arquivos/módulos prováveis envolvidos, comportamento esperado, casos de borda relevantes.]

# Restrições

- Não commitar direto na `master`.
- Não mexer em `.env`, `.env.example` com segredos reais, nem em `.claude/settings.local.json`.
- Se a tarefa envolver mudança no `prisma/schema.prisma`, gerar a migration com `npx prisma migrate dev` (nunca `db:push` em cima de dado real).
- Nunca aponte comandos de diff/resolve do Prisma (`--shadow-database-url` ou similar) para o `DATABASE_URL` real — o shadow database recria o schema do zero pra comparar, e se apontar pro banco de verdade por engano ele é apagado (já aconteceu neste projeto, ver `docs/DATABASE.md`). Se encontrar drift entre migrations e o banco, pare e pergunte antes de rodar qualquer comando de correção.
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
