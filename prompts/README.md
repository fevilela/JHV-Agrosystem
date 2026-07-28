# Prompts para o Claude Code

Esta pasta guarda o histórico de tarefas que discutimos aqui no Cowork e que você roda no Claude Code (terminal), dentro deste mesmo repositório.

## O ciclo

1. **Discussão aqui no Cowork.** Conversamos sobre o que precisa ser feito no sistema.
2. **Eu crio o arquivo de prompt** nesta pasta, seguindo a convenção abaixo, já com a tarefa bem definida e uma instrução no final pedindo um resumo.
3. **Você roda no Claude Code**, no terminal, dentro da pasta do projeto — normalmente assim:
   ```bash
   claude "$(cat prompts/PROMPT_003_nome-da-tarefa.md)"
   ```
   (ou cola o conteúdo do arquivo direto no Claude Code interativo)
4. **O Claude Code termina e devolve um resumo** do que foi feito (é a última seção de todo prompt, ver template).
5. **Você cola esse resumo aqui no Cowork.**
6. **Eu atualizo a documentação** em `docs/` (e este índice, se fizer sentido) com base no que foi feito de verdade — não no que o prompt pedia, mas no que o resumo diz que aconteceu.

Isso mantém `docs/` sempre refletindo o estado real do sistema, mesmo com o trabalho de implementação acontecendo no Claude Code em vez de aqui.

## Convenção de nomes

```
PROMPT_NNN_titulo-curto-em-kebab-case.md
```

- `NNN` — número sequencial com 3 dígitos, sempre crescente (`001`, `002`, `003`...), nunca reaproveitado mesmo que uma tarefa seja abandonada.
- `titulo-curto-em-kebab-case` — resume a tarefa em poucas palavras (ex: `PROMPT_004_boleto-pix-avulso.md`).

O número mais alto já usado nesta pasta é a referência de "quantas tarefas já passaram pelo Claude Code" — não precisa de índice separado, os nomes dos arquivos já servem de histórico.

## Formato de cada prompt

Ver [`_TEMPLATE.md`](./_TEMPLATE.md). Todo prompt criado por mim segue essa estrutura: contexto, tarefa, restrições/coisas a não fazer, e a instrução final pedindo o resumo formatado.

## Branch

Cada prompt normalmente corresponde a uma branch própria (ver [`../docs/CONTRIBUTING.md`](../docs/CONTRIBUTING.md)) — o próprio prompt já inclui a instrução de criar a branch antes de mexer no código.
