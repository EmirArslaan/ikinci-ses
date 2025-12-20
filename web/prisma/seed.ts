
import { PrismaClient, Role } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const hashedPassword = await bcrypt.hash('admin123', 10)

    const admin = await prisma.user.upsert({
        where: { email: 'admin@ikincises.com' },
        update: {},
        create: {
            email: 'admin@ikincises.com',
            name: 'Admin User',
            password: hashedPassword,
            role: Role.ADMIN,
            avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=8B4513&color=fff'
        },
    })

    console.log({ admin })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
