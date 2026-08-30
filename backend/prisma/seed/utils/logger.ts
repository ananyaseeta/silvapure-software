const RESET  = '\x1b[0m';
const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED    = '\x1b[31m';
const CYAN   = '\x1b[36m';
const DIM    = '\x1b[2m';

function timestamp(): string {
  return new Date().toISOString();
}

export const logger = {
  info(message: string, meta?: Record<string, unknown>): void {
    const suffix = meta ? ` ${DIM}${JSON.stringify(meta)}${RESET}` : '';
    console.log(`${CYAN}[SEED]${RESET} ${DIM}${timestamp()}${RESET} ${message}${suffix}`);
  },

  success(message: string, meta?: Record<string, unknown>): void {
    const suffix = meta ? ` ${DIM}${JSON.stringify(meta)}${RESET}` : '';
    console.log(`${GREEN}[SEED]${RESET} ${DIM}${timestamp()}${RESET} ✔ ${message}${suffix}`);
  },

  warn(message: string, meta?: Record<string, unknown>): void {
    const suffix = meta ? ` ${DIM}${JSON.stringify(meta)}${RESET}` : '';
    console.warn(`${YELLOW}[SEED]${RESET} ${DIM}${timestamp()}${RESET} ⚠ ${message}${suffix}`);
  },

  error(message: string, err?: unknown): void {
    console.error(`${RED}[SEED]${RESET} ${DIM}${timestamp()}${RESET} ✖ ${message}`);
    if (err instanceof Error) {
      console.error(`${RED}       ${err.message}${RESET}`);
      if (err.stack) console.error(`${DIM}${err.stack}${RESET}`);
    } else if (err !== undefined) {
      console.error(`${RED}       ${String(err)}${RESET}`);
    }
  },

  section(title: string): void {
    const line = '─'.repeat(60);
    console.log(`\n${CYAN}${line}${RESET}`);
    console.log(`${CYAN}  ${title}${RESET}`);
    console.log(`${CYAN}${line}${RESET}`);
  },

  summary(label: string, counts: Record<string, number>): void {
    logger.success(`${label} complete`, counts);
  },
};
