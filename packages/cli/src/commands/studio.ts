import { Command, Flags } from "@oclif/core";
import { createServer } from "@iconoma/studio";
import figlet from "figlet";
import gradient from "gradient-string";
import { createSpinner } from "nanospinner";
import open from "open";

export default class Studio extends Command {
  static override args = {};
  static override description = "Start the Iconoma Studio";
  static override examples = ["<%= config.bin %> <%= command.id %>"];
  static override flags = {
    port: Flags.string({ char: "p", description: "port to listen on" }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Studio);

    const port = Number(flags.port) || undefined;

    console.clear();

    await new Promise((resolve) => setTimeout(resolve, 100));

    const text = await figlet.text("Iconoma Studio");

    const coolGradient = gradient(["#e5e5e5", "#1447e6"]);

    console.log(coolGradient.multiline(text));

    const spinner = createSpinner("Starting Studio...").start();

    try {
      const { url } = await createServer({ port });

      await open(url, { wait: true });

      spinner.success({ text: `Studio started at ${url}` });
    } catch (error) {
      spinner.error({ text: `Failed to start Studio` });
      console.error(error);
      process.exit(1);
    }
  }
}
