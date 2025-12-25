import { prisma } from './src/lib/prisma';

async function checkVerificationCodes() {
    console.log('🔍 === CHECKING VERIFICATION CODES IN DATABASE ===\n');

    try {
        const codes = await prisma.emailVerification.findMany({
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        console.log(`Found ${codes.length} verification codes:\n`);

        codes.forEach((code, index) => {
            console.log(`${index + 1}. Email: ${code.email}`);
            console.log(`   Code: "${code.code}"`);
            console.log(`   Code type: ${typeof code.code}`);
            console.log(`   Code length: ${code.code.length}`);
            console.log(`   Code char codes: [${code.code.split('').map(c => c.charCodeAt(0)).join(', ')}]`);
            console.log(`   Expires at: ${code.expiresAt}`);
            console.log(`   Created at: ${code.createdAt}`);
            console.log(`   Is expired: ${new Date() > code.expiresAt}`);
            console.log('');
        });

        console.log('================================================\n');

    } catch (error) {
        console.error('Error querying database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkVerificationCodes();
