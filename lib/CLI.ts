// deno-lint-ignore no-explicit-any
export function cliCommands(cli: Record<string, any>) {
    const action: string = Deno.args[0];
    const func = cli[action];
    if (func) {
        func(...Deno.args.slice(1))
    } else {
        console.log(`Unknown command '${action}'. Available commands: ${Object.keys(cli).join(", ")}`)
    }
}