# Contexto

Já existe um commit local, na branch `docs/documentacao-completa-e-fluxo-prompts`, com a documentação completa criada no Cowork (`docs/ARCHITECTURE.md`, `DATABASE.md`, `MODULES.md`, `SETUP.md`, `DEPLOY.md`, `CONTRIBUTING.md`, a pasta `prompts/` e ajustes no `README.md`/`.gitignore`). O Cowork não tem acesso às credenciais do GitHub para dar `git push` nem abrir Pull Request — isso precisa ser feito por aqui, com as credenciais já configuradas nesta máquina.

A branch `master` já está protegida no GitHub (exige Pull Request + aprovação + testes passando antes de mesclar), então não dá pra ir direto pra `master`.

# Tarefa

1. Confirme que está na branch `docs/documentacao-completa-e-fluxo-prompts` e que o commit já existe (`git log --oneline -3`, `git status`).
2. Dê `git push -u origin docs/documentacao-completa-e-fluxo-prompts`.
3. Se o `gh` (GitHub CLI) estiver instalado e autenticado, abra o Pull Request para `master` com `gh pr create --base master --head docs/documentacao-completa-e-fluxo-prompts --title "docs: documentação completa do sistema + fluxo de contribuição" --body "Documentação técnica completa (arquitetura, banco, módulos, setup, deploy), guia de contribuição com fluxo de branches e proteção da master, e a pasta prompts/ com o histórico de tarefas rodadas via Claude Code."` e me devolva o link do PR.
4. Se o `gh` não estiver disponível, não instale nada sozinho — só confirme que o push funcionou e me diga o link direto pra abrir o PR manualmente (`https://github.com/fevilela/JHV-Agrosystem/compare/master...docs/documentacao-completa-e-fluxo-prompts`).

# Restrições

- Não faça merge do PR — isso quem decide é a Fernanda, no GitHub, depois de revisar.
- Não crie commits novos nem mexa em outros arquivos além de confirmar o estado atual.

# Ao final, responda com um resumo neste formato (para eu colar no Cowork):

```
## O que foi feito
[push feito com sucesso? PR aberto ou só o link pra abrir manualmente?]

## Branch
docs/documentacao-completa-e-fluxo-prompts

## Link do PR (ou link pra abrir)
[url]

## Pendências
[ex: aguardando aprovação/merge da Fernanda no GitHub]
```
