import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const p = await prisma.product.findMany();
  console.log("Products:", p);
  await prisma.$disconnect();
}
main().catch(console.error);
