# mc-server

## Installation

Install dependencies:

1. Go to this link: https://www.minecraft.net/en-us/download/server and download the server.jar
2. Place it wherever on your disk such that you know its path
3. Run: $ java -DbundlerMainClass=net.minecraft.data.Main -jar PATH/TO/SERVERJAR/server.jar --all
  This step will create a bunch of folders, you should find a "reports" folder
4. Move the json files under the generated "reports" folder to the "static" folder of the cloned minecraft-server repository
5. Cd into the repo and run the following:
   $ bun install
   $ bun run ./static/mapper.ts
      This step should generate some ts files under ./src/db/


## Run

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.0.22. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

### ------- TODO:

open / interact / close containers
crafting recipes
enchant items

#### ------- Resources
https://wiki.vg/Data_Generators
https://mcversions.net/
