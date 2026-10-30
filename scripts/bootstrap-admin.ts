import { bootstrapInitialAdmin } from "../src/lib/account-admission/bootstrap";
import { createPrismaClient } from "../src/lib/prisma";

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8").trim();
}

function parseArgs(argv: string[]) {
  let email = "";
  let name = "Platform Administrator";
  let passwordStdin = false;
  let password = "";

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--email" && argv[i + 1]) {
      email = argv[i + 1];
      i += 1;
    } else if (arg === "--name" && argv[i + 1]) {
      name = argv[i + 1];
      i += 1;
    } else if (arg === "--password" && argv[i + 1]) {
      password = argv[i + 1];
      i += 1;
    } else if (arg === "--password-stdin") {
      passwordStdin = true;
    }
  }

  return { email, name, passwordStdin, password };
}

async function main() {
  const { email, name, passwordStdin, password: argPassword } = parseArgs(process.argv.slice(2));
  const password = passwordStdin ? await readStdin() : argPassword || process.env.BOOTSTRAP_ADMIN_PASSWORD || "";

  if (!email || !password) {
    console.error("Usage: npm run bootstrap:admin -- --email <email> [--name <name>] --password-stdin");
    process.exit(1);
  }

  const prisma = createPrismaClient();
  try {
    const admin = await bootstrapInitialAdmin(prisma, {
      email,
      password,
      name,
    });
    console.log(
      JSON.stringify({
        status: "bootstrapped",
        id: admin.id,
        email: admin.email,
        role: admin.role,
      }),
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
