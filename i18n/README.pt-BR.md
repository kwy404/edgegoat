<p align="right"><a href="https://github.com/kwy404/edgegoat/blob/main/README.md">English</a> | <strong>Português (Brasil)</strong></p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/edgegoat@main/assets/banner-dark.svg">
    <img src="https://cdn.jsdelivr.net/gh/kwy404/edgegoat@main/assets/banner.svg" width="880" alt="Banner do edgegoat com Ledge, a cabra montesa, na beira de um penhasco">
  </picture>
</p>

<h1 align="center">edgegoat</h1>

<p align="center"><strong>As entradas que quebram código, prontas para os seus testes.</strong></p>

<p align="center">
  <a href="https://www.npmjs.com/package/edgegoat"><img height="20" src="https://img.shields.io/npm/v/edgegoat.svg?color=2E9C8A" alt="versão no npm"></a>
  <a href="https://www.npmjs.com/package/edgegoat"><img height="20" src="https://img.shields.io/npm/dm/edgegoat?color=2E9C8A" alt="downloads por mês no npm"></a>
  <a href="https://github.com/kwy404/edgegoat/actions/workflows/ci.yml"><img height="20" src="https://github.com/kwy404/edgegoat/actions/workflows/ci.yml/badge.svg" alt="status do CI"></a>
  <a href="https://github.com/kwy404/edgegoat/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-2E9C8A.svg" alt="licença MIT"></a>
</p>

O edgegoat é um conjunto curado de <!-- total -->284<!-- /total --> entradas que sabidamente quebram código JavaScript: transições reais de horário de verão calculadas para cada fuso, Ano Novo em Pacific/Kiritimati, datas antes de 1970, pares substitutos, `-0`, caminhos do Windows, JSON profundo e arrays esparsos. Cada caso tem um rótulo e um motivo de uma linha, e encaixa direto no `test.each`. Zero dependências, ESM e CommonJS, tipos TypeScript incluídos.

**Teste no navegador:** escolha um tipo de dado [no site](https://kwy404.github.io/edgegoat/), veja os casos extremos aparecerem e rode todos eles contra uma função sua.

```ts
import { test, expect } from 'vitest';
import { dates, withTimeZone } from 'edgegoat';

test.each(dates({ tags: ['dst'] }))('$label', ({ value, zone }) => {
  withTimeZone(zone, () => expect(addDays(value, 1).getHours()).toBe(value.getHours()));
});
```

## Instalação

```sh
npm install --save-dev edgegoat
```

Node.js 18 ou mais recente, ou qualquer navegador moderno (o `withTimeZone` precisa do Node.js).

## Uso

Cada gerador devolve um array de objetos `{ label, value, why, tags }`. Os casos de data específicos de um fuso também trazem `zone`.

```ts
// Jest ou Vitest
test.each(numbers({ tags: ['sign'] }))('$label mantém o sinal', ({ value }) => {
  expect(formatNumber(value).startsWith('-')).toBe(value < 0);
});

// Não sabe qual gerador usar? Passe um valor de exemplo.
test.each(casesFor('ana@example.com'))('normalizeEmail($label)', ({ value }) => {
  expect(() => normalizeEmail(value)).not.toThrow();
});

// node:test ou Mocha: um laço simples
for (const { label, value } of paths({ tags: ['traversal'] })) {
  test(label, () => assert.throws(() => safeJoin('/srv/app', value)));
}
```

Exemplos executáveis estão em [`examples/`](https://github.com/kwy404/edgegoat/blob/main/examples).

## O que vem incluído

<!-- grid:start -->
<table>
<tr>
<td width="33%" valign="top"><img src="https://cdn.jsdelivr.net/gh/kwy404/edgegoat@main/assets/icons/dates.svg" width="40" height="40" alt="Calendar icon for date and daylight saving time edge cases"><br><strong>Datas</strong> <code>46 casos</code><br><sub>Horário de verão (lacunas e sobreposições), Ano Novo em 7 fusos, 29 de fevereiro, antes de 1970, 2038, ano 10000</sub></td>
<td width="33%" valign="top"><img src="https://cdn.jsdelivr.net/gh/kwy404/edgegoat@main/assets/icons/time-zones.svg" width="40" height="40" alt="Globe icon for time zone test cases"><br><strong>Fusos horários</strong> <code>18 casos</code><br><sub>Fusos IANA escolhidos: +05:45, +14:00, -11:00, horário de verão de 30 minutos e à meia-noite</sub></td>
<td width="33%" valign="top"><img src="https://cdn.jsdelivr.net/gh/kwy404/edgegoat@main/assets/icons/strings.svg" width="40" height="40" alt="Text icon for unicode test strings"><br><strong>Strings</strong> <code>49 casos</code><br><sub>Emoji, pares substitutos, NFC vs NFD, bidi, espaços invisíveis, i turco, quebras de linha</sub></td>
</tr>
<tr>
<td width="33%" valign="top"><img src="https://cdn.jsdelivr.net/gh/kwy404/edgegoat@main/assets/icons/numbers.svg" width="40" height="40" alt="Hash icon for JavaScript number edge cases like negative zero and NaN"><br><strong>Números</strong> <code>51 casos</code><br><sub>-0, NaN, Infinity, limites de inteiros seguros, 0.1 + 0.2, 1e21, strings numéricas e BigInt</sub></td>
<td width="33%" valign="top"><img src="https://cdn.jsdelivr.net/gh/kwy404/edgegoat@main/assets/icons/urls.svg" width="40" height="40" alt="Link icon for URL and email edge cases"><br><strong>URLs e emails</strong> <code>54 casos</code><br><sub>Surpresas do parser WHATWG, formatos de SSRF e open redirect, limites da RFC 5321</sub></td>
<td width="33%" valign="top"><img src="https://cdn.jsdelivr.net/gh/kwy404/edgegoat@main/assets/icons/paths.svg" width="40" height="40" alt="Folder icon for Windows and POSIX file path edge cases"><br><strong>Caminhos</strong> <code>30 casos</code><br><sub>Windows vs POSIX, UNC, nomes reservados, travessia com .., nomes em NFD</sub></td>
</tr>
<tr>
<td width="33%" valign="top"><img src="https://cdn.jsdelivr.net/gh/kwy404/edgegoat@main/assets/icons/json.svg" width="40" height="40" alt="Curly braces icon for JSON parsing edge cases"><br><strong>JSON</strong> <code>22 casos</code><br><sub>10000 níveis, chaves duplicadas, 2^53 + 1, __proto__, BOM</sub></td>
<td width="33%" valign="top"><img src="https://cdn.jsdelivr.net/gh/kwy404/edgegoat@main/assets/icons/arrays.svg" width="40" height="40" alt="Brackets icon for array edge cases with holes and huge lengths"><br><strong>Arrays</strong> <code>14 casos</code><br><sub>Buracos, length 2^32 - 1, NaN, sort padrão, grande demais para spread</sub></td>
<td width="33%" valign="top"><img src="https://cdn.jsdelivr.net/gh/kwy404/edgegoat@main/assets/icons/helpers.svg" width="40" height="40" alt="Stopwatch icon for the time zone and frozen time test helpers"><br><strong>Helpers</strong> <code>4 funções</code><br><sub>withTimeZone, withFrozenTime, check, assertNoThrow</sub></td>
</tr>
</table>
<!-- grid:end -->

```ts
dates({ tags: ['dst'] });                         // só horário de verão
dates({ zone: 'America/Sao_Paulo', year: 2018 }); // qualquer fuso IANA e ano
strings({ tags: ['emoji'], exclude: ['zwj'] });   // filtrar e excluir por tags
```

Veja todos os casos [no site](https://kwy404.github.io/edgegoat/#catalog) ou baixe o [catalog.json](https://kwy404.github.io/edgegoat/catalog.json).

## API

- Geradores: `dates()`, `timeZones()`, `strings()`, `numbers()`, `numericStrings()`, `bigints()`, `urls()`, `emails()`, `paths()`, `json()` e `arrays()`.
- `generatorFor(sample)` e `casesFor(sample, options?)`: escolhem o gerador a partir de um valor de exemplo.
- `pick(cases, ...labels)`: mantém só os casos com esses rótulos e lança erro se um rótulo não existir.
- `values(cases)`: só os valores, para laços e testes baseados em propriedades.
- `withTimeZone(zone, fn)`: executa `fn` com `process.env.TZ` igual a `zone` e restaura o fuso anterior. Só no Node.js.
- `withFrozenTime(date, fn)`: congela `Date.now()` e `new Date()` durante `fn`, sem fake timers.
- `check(fn, cases, predicate?)` e `assertNoThrow(fn, cases)`: rodam `fn` em cada caso e mostram o que falhou, com o motivo.

## Bugs que essas entradas encontraram

Bugs reais deste tipo, corrigidos nos projetos originais pelo autor do edgegoat:

- [github/relative-time-element#384](https://github.com/github/relative-time-element/pull/384): a verificação de "ano atual" usava UTC em vez do fuso de exibição.
- [mozilla/pdf.js#22017](https://github.com/mozilla/pdf.js/pull/22017): `util.printf` perdia o sinal de números negativos maiores que -1.
- [google/budoux#1411](https://github.com/google/budoux/pull/1411): a segmentação partia pares substitutos.
- [microsoft/vscode-js-debug#2423](https://github.com/microsoft/vscode-js-debug/pull/2423): o truncamento no estilo `trimEnd` partia pares substitutos.
- [salesforce/tough-cookie#644](https://github.com/salesforce/tough-cookie/pull/644): um max-age infinito precisa significar "nunca expira".

## Guias (em inglês)

- [Testing time zones](https://kwy404.github.io/edgegoat/test-timezones-javascript.html)
- [Testing daylight saving time](https://kwy404.github.io/edgegoat/test-daylight-saving-time-jest.html)
- [Unicode strings](https://kwy404.github.io/edgegoat/unicode-test-strings.html)
- [Numbers](https://kwy404.github.io/edgegoat/javascript-number-edge-cases.html)

## Como contribuir

Casos novos são bem-vindos quando já quebraram código de verdade. Veja o [CONTRIBUTING.md](https://github.com/kwy404/edgegoat/blob/main/CONTRIBUTING.md).

## Mais de kwy404

<!-- more:start -->
- [Monsoon](https://kwy404.github.io/monsoon/): CSS utilitário direto do CDN, sem etapa de build, com um tema inteiro a partir de uma cor.
- [Voodoo.js](https://kwy404.github.io/Voodoo.js/): O framework JavaScript que começa pelo HTML: diretivas reativas e JSX em um arquivo HTML simples.
- [breakhound](https://kwy404.github.io/breakhound/): Encontra bugs em qualquer biblioteca JavaScript ou TypeScript automaticamente, sem escrever testes.
- [vueleap](https://kwy404.github.io/vueleap/): Migra de Vue 2 para Vue 3 com um comando, com as flags exatas do @vue/compat que você precisa.
- [graphemely](https://kwy404.github.io/graphemely/): Trunca, corta e conta strings com emoji com segurança, por cluster de grafemas.
- [numberparrot](https://kwy404.github.io/numberparrot/): Converte números e moedas localizados de volta em números de verdade, para qualquer locale.
- [cookieowl](https://kwy404.github.io/cookieowl/): Banner de cookies gratuito para LGPD e GDPR que bloqueia rastreadores de verdade antes do consentimento.
- [installkite](https://kwy404.github.io/installkite/): Torne qualquer site instalável e com funcionamento offline com um comando.
- [a11ymedic](https://kwy404.github.io/a11ymedic/): O verificador de acessibilidade que explica cada problema e entrega a correção exata.
- [fontsketch](https://kwy404.github.io/fontsketch/): Crie uma fonte com a sua letra, grátis e no navegador.
- [kastor](https://kwy404.github.io/kastor/): O ORM para TypeScript para PostgreSQL, MySQL, SQLite, SQL Server, Oracle, MongoDB e mais.
<!-- more:end -->

## Autor

Feito por [Alexandre Kohler](https://github.com/kwy404) ([LinkedIn](https://www.linkedin.com/in/alexandre-silva-173687256/)). O site é feito com [Monsoon](https://kwy404.github.io/monsoon/), e as partes interativas com [Voodoo.js](https://kwy404.github.io/Voodoo.js/).

## Licença

[MIT](https://github.com/kwy404/edgegoat/blob/main/LICENSE) © 2026 Alexandre Kohler.
