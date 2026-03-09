# outro-oss

Open-source packages from [Outro Health](https://outro.com) for working with healthcare APIs and data formats.

## Packages

### API Clients

| Package | Description |
| --- | --- |
| [`@outro-health/elation-client`](packages/elation-client) | Typed client for the Elation EHR API v2 |
| [`@outro-health/helpscout-inbox-client`](packages/helpscout-inbox-client) | Typed client for the Help Scout Mailbox API v2 |
| [`@outro-health/helpscout-docs-client`](packages/helpscout-docs-client) | Typed client for the Help Scout Docs API v1 |

### Data Formatting

| Package | Description |
| --- | --- |
| [`@outro-health/jotform-to-markdown`](packages/jotform-to-markdown) | Convert Jotform form submissions to markdown |
| [`@outro-health/elation-to-markdown`](packages/elation-to-markdown) | Convert Elation EHR visit notes to markdown |

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
