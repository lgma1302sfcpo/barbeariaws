# Revisão de SEO — Barbershop WS

Revisão de 5 de outubro de 2026. Domínio confirmado pelo proprietário: https://barbeariaws.vercel.app/. Alterações implementadas no projeto local; publicação na Vercel ainda não realizada.

## 1. O que estava errado

- O HTML inicial continha apenas o elemento de montagem React. Texto, localização e serviços dependiam da execução do JavaScript.
- H1 genérico, pouco contexto local nos títulos das seções e metadados iguais nas diferentes rotas.
- Ausência de canonical, Open Graph/Twitter, JSON-LD, robots e sitemap.
- Login, cadastro e admin não tinham diretivas específicas de exclusão da indexação.
- Rotas desconhecidas devolviam a home com status 200, criando páginas duplicadas e soft 404.
- Fotos de cortes em PNG somavam 3.916.507 bytes. O logo quadrado tinha 403.381 bytes, inclusive em exibição pequena.
- Imagens institucionais sem dimensões, fotos antes/depois com ALT genérico, vídeo carregando metadados antes de ser solicitado.
- Menu sem estado expandido associado; galeria sem nome acessível e sem controle de foco; campo de quantidade no detalhe sem nome acessível; controle antes/depois invisível até durante o foco.
- Texto branco no verde do botão WhatsApp precisava de melhor contraste.

## 2. O que foi alterado

- Pré-renderização da home usando React e o SSR do Vite já instalado; hidratação no navegador para preservar as interações.
- Dados públicos centralizados em `src/data/business.js`. Valores aproveitados: Barbershop WS, Duque de Caxias, 1026, Boqueirão, Praia Grande/SP, WhatsApp +55 13 98823-5036 e Instagram existente.
- Textos locais nas seções atuais, CTAs para consultar/agendar, contato telefônico visível, endereço semântico e FAQ pequena.
- Metadados em HTML para home, contas e produtos. As páginas de produto consultam o mesmo catálogo público utilizado pela loja.
- Respostas HTTP 404 reais para páginas/produtos inexistentes; normalização de aliases HTML; links e caminhos de produtos existentes preservados.
- Imagens WebP, favicon reduzido, dimensões reais conhecidas, decodificação assíncrona e lazy loading abaixo da primeira dobra. Originais preservados.
- Admin, autenticação e detalhe de produto carregados em arquivos JavaScript separados. Animações mantidas, com respeito à preferência por movimento reduzido.
- Correções de foco, teclado, labels, autofill e contraste. Carrinho, formulários, botões de pagamento e integrações permanecem no projeto.

## 3. Arquivos modificados e adicionados

| Grupo | Arquivos |
| --- | --- |
| Entrada e build | `index.html`, `package.json`, `vite.config.js`, `vercel.json`, `src/main.jsx`, `src/App.jsx`, `src/entry-server.jsx`, `scripts/prerender.mjs` |
| Dados e metadados | `src/data/business.js`, `src/data/siteContent.js`, `src/data/imageDimensions.json`, `src/lib/seo.js` |
| Conteúdo e acessibilidade | `src/components/Hero.jsx`, `Services.jsx`, `Location.jsx`, `Footer.jsx`, `Header.jsx`, `Gallery.jsx`, `BeforeAfter.jsx`, `AuthPage.jsx`, `Admin.jsx` (somente alvo do link de pular conteúdo), `Products.jsx`, `ProductDetail.jsx`, `FAQ.jsx`, `NotFound.jsx`, `src/components/shared/CountUp.jsx`, `SiteImage.jsx`, `src/index.css` |
| Respostas públicas do servidor | `server/index.js`, `server/lib/publicSeo.js`, `api/seo.js` |
| Imagens | `public/assets/optimized/logo-square.webp`, `barbershop-fachada.webp`, `antes.webp`, `depois.webp`, `corte-01.webp` a `corte-04.webp`, `favicon.png`; `public/assets/og-barbershop-ws.jpg` |
| Validação e documentação | `scripts/optimize-images.py`, `scripts/seo.test.mjs`, `scripts/seo-routes.test.mjs`, `README.md`, `SEO-REPORT.md` |

`dist/robots.txt`, HTMLs e o template do servidor são gerados pelo build. `/sitemap.xml` é servido dinamicamente. Não edite `dist` manualmente.

Já havia alterações em `src/components/HeaderCart.jsx` e arquivos em `public/assets/posts/` quando a revisão começou. Foram preservados e não fazem parte das alterações de SEO desta revisão.

## 4. Melhorias de SEO técnico

- Title da home: **Barbearia em Praia Grande | Corte e Barba | Barbershop WS**.
- Description: **Corte masculino, degradê e barba no Boqueirão, em Praia Grande – SP. Conheça os serviços e valores da Barbershop WS e consulte horários pelo WhatsApp.**
- Um H1 principal na home; H2 por seção e H3 nos serviços. Hierarquia original adequada preservada onde já funcionava.
- Canonical absoluto no domínio confirmado; parâmetros de compra e âncoras não geram URLs separadas no sitemap.
- Compartilhamento com imagem real da fachada em JPEG 1200 × 630, URLs absolutas e metadados disponíveis sem executar JavaScript.
- JSON-LD `HairSalon`, subtipo de LocalBusiness: nome, endereço, telefone, URL, imagem, logo, mapa, Instagram e assuntos relacionados aos serviços reais.
- Nenhum horário completo, CEP, coordenada, faixa de preços, estrela ou avaliação foi inventado no JSON-LD.
- Sitemap dinâmico contém a home e produtos públicos ativos; exclui admin, login, cadastro e APIs.
- Robots permite páginas públicas e assets; bloqueia `/api/` e `/_seo/`. As contas usam `noindex` no HTML e cabeçalho HTTP. Seu rastreamento permanece permitido para que o Google consiga ler o `noindex`; robots não substitui autenticação.
- Conteúdo direto e HTML semântico permitem identificar a empresa, localização, serviços e contato também em mecanismos de resposta.

## 5. Melhorias de SEO Local

- Praia Grande como localização principal, Boqueirão como bairro e Baixada Santista/São Paulo apenas como contexto.
- Nome, endereço e número provenientes de uma fonte comum para página, rodapé, WhatsApp e schema.
- Telefone clicável e botão Como chegar, com o mapa existente preservado e carregamento lazy.
- FAQ esclarece serviços, localização, contato e a necessidade de confirmar o atendimento de hoje.
- Não foram criadas páginas artificiais por cidade ou afirmações de superioridade sem comprovação.

## 6. Palavras-chave trabalhadas

Barbearia em Praia Grande, barbearia Praia Grande SP, barbearia no Boqueirão, barbeiro no Boqueirão, corte masculino, degradê/fade, barba, corte e barba, associados naturalmente a Praia Grande e aos serviços existentes.

“Perto de mim” é atendido pela identificação geográfica da empresa e deve ser reforçado pelo Perfil da Empresa; a expressão não foi repetida artificialmente nos textos. “Aberta hoje” aparece como pergunta com resposta honesta sobre confirmar os dias e o fechamento. “Melhor barbearia” não foi usado como promessa sem evidências.

## 7. Dados que o proprietário ainda precisa fornecer

| Informação | Onde adicionar/confirmar |
| --- | --- |
| Dias da semana, fechamento, intervalos e exceções | `src/data/business.js`: `openHours` e `openingHoursSpecification`; atualize ambos de forma consistente. O projeto só informava abertura às 09h. |
| CEP real da barbearia | `src/data/business.js`: `postalCode`. CEPs de entrega/configuração não foram assumidos como prova do endereço físico. |
| Coordenadas do pino correto, se desejado | `src/data/business.js`: `geo`, com `latitude` e `longitude` confirmadas no Maps. |
| Facebook/TikTok oficiais, se existirem | `src/data/business.js`: `facebookUrl` e `tiktokUrl`; entram automaticamente em `sameAs` quando preenchidos. |
| Faixa real de preços, se desejado | `src/data/business.js`: `priceRange`; os preços de cada serviço existentes foram preservados. |
| Origem e autorização dos depoimentos e dos números divulgados | `src/data/siteContent.js`: `testimonials` e `stats`. O projeto já continha números de clientes, experiência e avaliações, mas não fontes verificáveis. |
| URL do Perfil da Empresa e confirmação do pino/endereço | Confirmar no Google Maps e atualizar `mapsUrl`/`mapsEmbedUrl` se necessário. |

Após alterações nos dados públicos, execute novamente o build e publique a versão atualizada.

## 8. Recomendações para Google Business Profile

- Reivindique/verifique o perfil da Barbershop WS e utilize a categoria disponível mais adequada para barbearia.
- Mantenha nome, telefone, endereço e site iguais aos dados do projeto; confira o pino físico no mapa.
- Preencha dias, abertura, fechamento e horários especiais/feriados corretamente.
- Cadastre somente serviços e preços confirmados; publique fotos reais recentes de fachada, ambiente e trabalhos.
- Solicite avaliações honestas de clientes e responda às avaliações. Use depoimentos no site somente quando puder confirmar sua origem.
- Mantenha o perfil atualizado e acompanhe contatos e visitas. Relevância, distância e popularidade influenciam os resultados locais, segundo a [documentação do Google](https://support.google.com/business/answer/7091?hl=pt-BR).

## 9. Próximas ações para posicionamento

1. Publicação concluída na Vercel em 05/10/2026, a partir do commit `7ee76e6` enviado para `main`. `vercel.json` determina o build completo `npm run build`, com saída `dist` e inclusão do template da função SEO.
2. Verificação em produção concluída: `/`, `/robots.txt`, `/sitemap.xml` e `/produto/gel-fixador` retornam 200; login/admin retornam 200 com noindex; uma URL inexistente retorna 404/noindex. Canonical e tag de verificação estão presentes, e o sitemap responde como XML com home e produto público.
3. Propriedade `https://barbeariaws.vercel.app/` criada e verificada no Google Search Console por tag HTML. Manter a metatag `google-site-verification` em `index.html`. Sitemap enviado e reenviado em 05/10/2026: o Google confirmou o envio, mas o relatório ainda apresenta “Não foi possível buscar o sitemap”. O endpoint público responde 200 com XML válido, inclusive com User-Agent Googlebot; isso não comprova a leitura pelo rastreador real. A causa da falha do Search Console não foi determinada; conferir o processamento posteriormente. A inspeção informa que a home já está indexada. A solicitação de atualização foi recusada porque a cota diária da conta foi excedida; repetir no dia seguinte.
4. Validar o schema publicado no [Rich Results Test](https://search.google.com/test/rich-results) e no [Schema Markup Validator](https://validator.schema.org/). A validação local cobre a estrutura, mas não substitui esses serviços após o deploy.
5. Medir desempenho publicado com PageSpeed Insights/Search Console. Não foram calculadas notas Lighthouse ou métricas de campo LCP/CLS/INP nesta revisão.
6. Publicar trabalhos reais com textos úteis, manter serviços/preços atualizados e buscar referências legítimas em páginas locais da empresa/parceiros.

## 10. Problemas e limites que não foram alterados automaticamente

- Depoimentos e estatísticas sem origem: mantidos por já existirem; não utilizados como Review ou AggregateRating.
- Horários incompletos: não declaramos “aberto agora” nem inventamos dias/fechamento. A publicação desses horários depende do proprietário.
- Fotos de produtos enviadas pelo admin podem ser grandes e não fornecem dimensões na API. Dimensões reais foram adicionadas para imagens conhecidas; o fluxo de uploads e o catálogo não foram redesenhados.
- O backend e frontend têm fallback de produto de exemplo quando o catálogo falha. Esse comportamento já existia e foi preservado; confirme se o fallback deve estar disponível em produção. O sitemap reflete o mesmo catálogo público, inclusive o fallback quando utilizado pelo backend.
- Valores de frete, Stripe, Efí Pix, banco de dados, autenticação, CORS e permissões não foram reformulados. Não foram realizadas compras ou escritas no banco durante os testes.
- No preview Vite sem backend na porta 4242, o catálogo utilizou o fallback existente e o frete ficou indisponível. A adição/remoção do carrinho foi verificada; disponibilidade dos provedores de frete e pagamento em produção não foi certificada por esses testes.
- Não existe script de lint, configuração ESLint ou verificação TypeScript dedicada para este frontend JSX. Não foi adicionada uma ferramenta nova apenas para reportar um resultado.
- Publicação inspecionada por HTTP e pelo navegador após o push: metadados, robots, sitemap XML, produto e respostas de páginas internas/404 estão disponíveis em produção. A home publicada não apresentou erros de console nas observações feitas. A leitura do sitemap pelo Google ainda apresenta falha, e a atualização manual de indexação está limitada pela cota diária.
- A FAQ é conteúdo visível, sem schema de FAQ rich results: o [Google descontinuou esse recurso em 2026](https://developers.google.com/search/updates#june-2026).

### Auditoria final executada

| Verificação | Resultado |
| --- | --- |
| `npm run build` | Aprovado: Prisma, bundle do frontend e pré-renderização SSR |
| `npm run test:seo` | 14 testes aprovados: HTML inicial, schema, metadados, sitemap, internos noindex, assets/âncoras, escaping, função Vercel e respostas da API |
| Sintaxe Node e `git diff --check` | Aprovados |
| Respostas HTTP Express | Home/robots/sitemap/produto 200; login/cadastro/admin 200 com noindex; página/produto/API inexistentes 404; aliases HTML 308 |
| Segurança dos testes | Catálogo de teste em memória, sem consultas/escritas no banco real e sem pagamentos |
| Navegador | Sem erros de console/hidratação nas páginas verificadas; menu mobile e galeria com Escape/retorno de foco; produto, adição/remoção e fechamento do carrinho verificados |
| Responsividade | Sem overflow horizontal nos viewports efetivos de 488, 1600 e 1920 px. O navegador limitou o menor viewport solicitado; não foi uma simulação de aparelho físico de 320/390 px. |
| Performance objetiva dos arquivos | PNGs de cortes: 3.916.507 → 334.384 bytes (~91,5% menor). Logo: 403.381 → 5.570 bytes (~98,6% menor). JS inicial: ~219 KB / 66,43 KB gzip, com páginas internas separadas. |

O bloqueio temporário do arquivo de engine Prisma durante um build foi resolvido encerrando o servidor de testes, que mantinha a DLL aberta. O build final completo passou.

A versão exata do commit `7ee76e6` também foi extraída para uma pasta isolada e validada com build Vite, pré-renderização e os 14 testes de SEO aprovados. As alterações locais anteriores em `HeaderCart.jsx` e os arquivos de `public/assets/posts/` foram preservados e não incluídos no commit de SEO. O bundle desse commit tem aproximadamente 221 KB / 66,90 KB gzip de JavaScript inicial.
