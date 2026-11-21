# HoraFit
A hora fit pg

## Documentação técnica

- [Guia permanente para agentes](AGENTS.md)
- [Arquitetura](docs/ARCHITECTURE.md)
- [Regras comerciais](docs/BUSINESS_RULES.md)
- [Contratos da API](docs/API.md)
- [Banco de dados](docs/DATABASE.md)
- [Deploy e operação](docs/DEPLOYMENT.md)
- [Status atual, riscos e decisões pendentes](docs/PROJECT_STATUS.md)
- [Roteiro de execução dos próximos passos](docs/PLANO_EXECUCAO_PROXIMOS_PASSOS.md)
- [Plano de evolução comercial](docs/COMMERCE_EVOLUTION_PLAN.md)
- [Roadmap histórico](docs/roadmap-next-sprint.md)

## Publicação

O frontend e o backend são serviços separados. O backend possui targets Docker distintos para migration e runtime; migration e seed não devem executar automaticamente no startup da API.

Variáveis, portas, comandos Docker, rate limiting, proxies, rollback e validação estão em [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). Não crie pedidos nem altere status ou estoque reais para smoke test em produção.
