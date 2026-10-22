import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  console.log("Connecting...");
  await prisma.$connect();
  console.log("Connected!");
  const p = await prisma.product.count();
  console.log("Products:", p);
  await prisma.$disconnect();
}
main().catch(console.error);
