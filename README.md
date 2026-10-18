# Lingui GitHub Action example

This repo shows how to translate Lingui `.po` catalogs automatically on every pull request with a GitHub Action. It's a small React and Lingui app with English as the source language and Swedish, Polish and Arabic as targets. When a pull request adds or changes a message, the [Localhero.ai](https://localhero.ai) action translates it and commits the updated catalogs to that same pull request.

## How it works

The translate workflow runs `lingui extract` on each pull request, which puts new messages into the catalogs. Then `localheroai/localhero-action` translates the messages the branch added or changed and writes them into `src/locales/{locale}/messages.po`. ICU plurals are adapted to each target language: the English source has `one` and `other`, Polish gets `one`, `few`, `many` and `other` and Arabic gets all six CLDR categories. Exact matches like `=0` and the `#` placeholder are kept. The app itself has no Localhero dependency; `lingui compile` builds the catalogs like in any Lingui project.

## Setup

1. Use Lingui's PO format. It's the default; this repo sets it explicitly in [`lingui.config.ts`](lingui.config.ts).
2. Run `npx @localheroai/cli init`. It detects Lingui, creates a project and writes [`localhero.json`](localhero.json). The `projectId` in this repo is a placeholder.
3. Add [`.github/workflows/localhero-translate.yml`](.github/workflows/localhero-translate.yml). The `paths` list includes your source files. That way the workflow runs on the pull request where a new `<Trans>` shows up.
4. Add your API key as the repository secret `LOCALHERO_API_KEY` and install the [Localhero.ai GitHub App](https://localhero.ai/docs/github-app). Without the App, GitHub doesn't run your CI on the translation commit.

## What a translation pull request looks like

Say a branch adds a pending invites counter:

```tsx
<Plural value={pendingCount} one="# pending invite" other="# pending invites" />
```

You push and open the pull request. The workflow extracts the new message, translates it and pushes one commit titled `Update translations` with you as co-author. The Polish catalog gets something like this:

```diff
 msgid "{pendingCount, plural, one {# pending invite} other {# pending invites}}"
-msgstr ""
+msgstr "{pendingCount, plural, one {# oczekujące zaproszenie} few {# oczekujące zaproszenia} many {# oczekujących zaproszeń} other {# oczekującego zaproszenia}}"
```

The action also comments on the pull request with a link where you can review and edit the translations. Edits made there come back as another commit on the same branch.

## CI

[`ci.yml`](.github/workflows/ci.yml) runs on every pull request:

- `lingui check sync` fails when the catalogs are out of date with the source. Run `npm run extract` and commit.
- `lingui compile --strict` fails when a message has no translation. Without `--strict` the build passes and shows English instead.
- `npm run check:plurals` fails when an ICU plural lacks a category its language needs, like `few` in Polish, or when a branch drops the `#` count. Lingui compiles both without complaint and renders wrong text for some numbers.
- `localhero check` fails when a translation drops a placeholder such as `{teamName}`. It runs offline and needs no API key.
- `npm run build` type-checks and builds the app.

A commit that adds messages fails CI until the translation commit lands on top of it. That's intended: the branch is only green once every language is complete.

## Run it locally

You need Node 22.19 or newer. Node 23 doesn't work: the Lingui CLI exits without doing anything and without an error.

```bash
npm ci
npm run dev
```

Switch languages in the top corner. Remove members to see the plural change, down to the `=0` case.

## Learn more

- [LinguiJS with Localhero.ai](https://localhero.ai/docs/lingui)
- [Lingui translations in CI](https://localhero.ai/docs/lingui-ci)
- [GitHub Actions setup](https://localhero.ai/docs/github-actions)

## License

[MIT](LICENSE)
