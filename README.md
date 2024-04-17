# mc-server

## Issues

If there is any issue during the installation process or when running the server, please file an issue on github ([link](https://github.com/peacefulotter/minecraft-server/issues))

## Installation

1. Install the dependencies
```bash
bun install
```

2. Run the script to generate files and setup stuff needed by the project.
```bash
bun setup
```

And you're done!

> [!NOTE]
> The setup downloads the `server.jar` from Mojang's servers and then executes it with Java, so make sure you have Java installed on your machine and pathed correctly.

###### You can always read the script or do this manually as instructed below:

<details>
  <summary>Manual Setup</summary>

  1. Go to this link: https://www.minecraft.net/en-us/download/server and download the server.jar
  2. Place it wherever on your disk such that you know its path
  3. Run the following, change the PATH/TO/SERVERJAR to the actual path where `server.jar` is stored
  ```bash
  java -DbundlerMainClass=net.minecraft.data.Main -jar PATH/TO/SERVERJAR/server.jar --all
  ```
  This step will create a bunch of folders, you should find a "reports" folder
  
  5. Move the json files under the generated "reports" folder to the "static" folder of the cloned minecraft-server repository
  6. Cd into the repo and run the following:
  ```bash
  bun install
  bun run ./static/mapper.ts
  ```
  This step should generate some ts files under ./src/db/
</details>

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
