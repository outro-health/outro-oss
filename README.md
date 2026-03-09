# outro-oss

Open-source packages from [Outro Health](https://outro.com) for working with healthcare data formats.

## Packages

| Package | Description |
| --- | --- |
| [`@outro/jotform-to-markdown`](packages/jotform-to-markdown) | Convert Jotform form submissions to markdown |
| [`@outro/elation-to-markdown`](packages/elation-to-markdown) | Convert Elation EHR visit notes to markdown |

## Development

```sh
yarn install
yarn test:run     # run all tests
yarn typecheck    # typecheck all packages
yarn lint         # lint with biome
yarn format       # format with biome
yarn build        # build all packages
```

## License

MIT
