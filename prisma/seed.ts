async function main() {
  // Intentional no-op: PeachWeb strictly forbids pre-seeded dummy data or demo user accounts.
  // Use `npm run bootstrap:admin -- --email <email> --password-stdin` to provision the first ADMIN user.
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
