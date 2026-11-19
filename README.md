# Plugins do Claude Code

Marketplace de plugins do Claude Code de Ricardo Augusto Mesquita.

## Instalar

No Claude Code:

```
/plugin marketplace add ricamesq/claude-plugins
/plugin install video-aula-animada@ricamesq-plugins
```

O repositório é público: a instalação não pede conta nem senha do GitHub.

## Plugins

| Plugin | Para quê |
|---|---|
| `video-aula-animada` | Vídeo-aula curta e animada (16:9) a partir de um roteiro em JSON, com Remotion. O modelo traz o exemplo do débito cardíaco; o aluno troca o roteiro e as imagens. |

## Acrescentar um plugin

1. Pasta `plugins/<nome>/` com `.claude-plugin/plugin.json` (campo `name` igual ao nome da pasta) e as skills em `skills/<skill>/SKILL.md`.
2. Entrada em `.claude-plugin/marketplace.json` com o mesmo `name` e `"source": "./plugins/<nome>"`.
3. `claude plugin validate .` precisa terminar em "Validation passed".
