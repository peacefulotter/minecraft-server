# mc-server

## Installation

Install dependencies:

```bash
bun install
```

Then, create the required json arrays

```bash
bun run ./static/mapper.ts
```

TODO: explain generate server data
https://wiki.vg/Data_Generators
https://www.minecraft.net/en-us/download/server ! https://mcversions.net/
java -DbundlerMainClass=net.minecraft.data.Main -jar server.jar --all
copy reports/registries.json to ./static

## Run

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.0.22. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## TODO:

open / interact / close containers
crafting recipes
enchant items
