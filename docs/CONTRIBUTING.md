# Contribuindo (fluxo de versionamento para múltiplas pessoas)

Hoje o repositório tem uma única branch (`master`) e histórico de um só desenvolvedor. Este guia existe para quando mais de uma pessoa (ou mais de uma sessão de Claude Code) passar a mexer no código ao mesmo tempo, sem pisar no trabalho uma da outra.

## Regra geral

**Ninguém commita direto na `master`.** Toda mudança nasce numa branch própria e chega na `master` por Pull Request. Isso vale igualmente para mudanças feitas manualmente ou via Claude Code.

## Fluxo de branches

1. Antes de começar qualquer tarefa, atualize a `master` local:
   ```bash
   git checkout master
   git pull
   ```
2. Crie uma branch a partir dela, com prefixo por tipo de mudança:
   - `feat/nome-curto` — funcionalidade nova (ex: `feat/relatorio-pastagens`)
   - `fix/nome-curto` — correção de bug (ex: `fix/boleto-duplicado`)
   - `chore/nome-curto` — manutenção, dependências, config
   - `test/nome-curto` — testes
   ```bash
   git checkout -b feat/nome-curto
   ```
3. Trabalhe e commite na sua branch. Dê push cedo e sempre na **mesma branch**, nunca direto na `master`:
   ```bash
   git push -u origin feat/nome-curto
   ```
4. Abra um Pull Request no GitHub para `master`. O workflow `tests.yml` já roda `npm test` automaticamente no PR.
5. Depois de aprovado e com os testes passando, faça o merge pelo GitHub (não `git push` direto na `master` local). Apague a branch depois do merge.

### Convenção de commits

O histórico já segue esse padrão — continue usando:

```
tipo: descrição curta no imperativo, em português

feat: notificação push real no celular (Web Push)
fix: recuar zoom automático (20 -> 18)
test: primeira suíte de testes automatizados (Vitest) + CI
perf: desliga o pré-carregamento automático dos links do menu
chore: ...
```

### Evitando conflito quando duas pessoas mexem em áreas parecidas

- Prefira branches de escopo pequeno e vida curta (dias, não semanas) — reduz a chance de duas branches divergirem muito da `master`.
- Se sua branch ficar velha, atualize com `git rebase master` (ou `git merge master`) antes de abrir o PR, e resolva conflitos localmente.
- Migrations do Prisma são o ponto mais sensível de conflito: se duas pessoas criarem migrations em paralelo, a ordem de aplicação importa. Sempre rode `git pull` na `master` e `npx prisma migrate dev` **depois** de já estar com o schema mais recente, para a nova migration nascer em cima da última.
- Nunca edite uma migration já commitada/aplicada — crie uma nova.

## Proteção da branch `master` no GitHub

Configuração feita uma vez pelo dono do repositório, em **Settings → Branches → Branch protection rules → Add rule** (padrão: `master`):

- ✅ **Require a pull request before merging** — bloqueia push direto na `master`.
- ✅ **Require approvals** (pelo menos 1) — se for mais de uma pessoa, alguém revisa antes do merge.
- ✅ **Require status checks to pass before merging** — marcar o check `test` do workflow `Testes` (`.github/workflows/tests.yml`), assim um PR com teste quebrado não pode ser mesclado.
- ✅ **Require branches to be up to date before merging** — força atualizar com a `master` antes de mesclar, evitando merge "cego".
- Opcional: **Do not allow bypassing the above settings**, se quiser que a regra valha até para admins.

Sem isso configurado, qualquer push direto na `master` (inclusive de uma sessão de Claude Code sem querer) sobrescreve o histórico compartilhado sem revisão.

## Usando Claude Code em equipe

- **Sempre crie/mude para uma branch de trabalho antes de pedir para o Claude Code fazer mudanças.** Nunca peça para ele trabalhar direto na `master`.
- **Uma pessoa (ou uma sessão) por branch.** Se duas pessoas rodarem Claude Code na mesma branch ao mesmo tempo, os commits de uma podem sobrescrever o entendimento de contexto da outra. Branches separadas evitam isso.
- **Puxe a `master` antes de começar uma sessão nova.** Contexto desatualizado (schema, componentes) leva o Claude Code a sugerir mudanças em cima de código que já mudou.
- **Revise o diff antes do merge**, mesmo quando o código "parece certo" — o mesmo cuidado que se teria com um PR de humano.
- **Nunca deixe o Claude Code commitar `.env` ou credenciais.** Já está no `.gitignore`; se aparecer staged, é sinal de que algo foi criado fora do padrão.
- **`.claude/settings.local.json` é pessoal e não deve ir pro git** (adicionado ao `.gitignore` agora) — cada máquina/desenvolvedor acumula ali permissões e, às vezes, tokens usados em sessões de debug (ex: troubleshooting de integração). `.claude/launch.json`, que já é versionado, é a configuração compartilhada (comandos de run) e pode continuar assim.

> Nota de segurança: o `.claude/settings.local.json` atual deste projeto tem, na lista de comandos permitidos, tokens de acesso do Meta/WhatsApp usados numa sessão de troubleshooting antiga. Esse arquivo nunca foi commitado (confirmado no histórico do git), mas vale considerar revogar/rotacionar esses tokens no Meta Business Manager caso ainda estejam ativos, já que ficaram em texto plano num arquivo local.

### Ciclo Cowork → Claude Code → documentação

Fluxo usado neste projeto para tarefas discutidas primeiro no Cowork:

1. A tarefa é discutida e definida no Cowork.
2. O Cowork cria um arquivo em [`prompts/`](../prompts/), seguindo a convenção `PROMPT_NNN_titulo.md` (ver [`prompts/README.md`](../prompts/README.md)) — já com a instrução de criar branch própria e terminar com um resumo padronizado.
3. Esse prompt é rodado no Claude Code, no terminal, dentro do repositório.
4. Ao final, o Claude Code devolve o resumo (mudanças, arquivos tocados, migration, testes, branch, pendências).
5. Esse resumo é colado de volta no Cowork, que atualiza `docs/` (arquitetura, banco, módulos etc.) com base no que foi feito de fato.

Isso mantém a documentação técnica sincronizada com o código mesmo quando a implementação acontece fora do Cowork. Os arquivos em `prompts/` ficam versionados no git — servem como histórico de decisões, útil pra quem entrar no time depois.

## Checklist antes de abrir um PR

- `npm test` passa localmente
- `npm run lint` sem erros novos
- Migration nova gerada com `prisma migrate dev` (se mexeu no schema) e commitada junto
- Nenhum arquivo de `.env`, upload ou `settings.local.json` staged
- Descrição do PR explica o "porquê", não só o "o quê" (útil pra quem revisa e pra sessões futuras de Claude Code lerem o histórico)
