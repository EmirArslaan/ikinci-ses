/**
 * Email template for verification code
 */
export function getVerificationEmailTemplate(code: string): string {
    return `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>İkinci Ses - E-posta Doğrulama</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%); padding: 40px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">İkinci Ses</h1>
                            <p style="color: #FFE4B5; margin: 10px 0 0 0; font-size: 16px;">Müziğe Yeniden Hayat Ver</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">E-posta Doğrulama Kodu</h2>
                            <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                İkinci Ses platformuna kayıt olmanız için aşağıdaki doğrulama kodunu kullanmanız gerekmektedir.
                            </p>
                            
                            <!-- Verification Code -->
                            <div style="background-color: #8B4513; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
                                <div style="color: #ffffff; font-size: 42px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                    ${code}
                                </div>
                            </div>
                            
                            <p style="color: #999999; font-size: 14px; text-align: center; margin: 20px 0;">
                                Bu kod <strong>15 dakika</strong> içinde geçerliliğini yitirecektir.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Warning -->
                    <tr>
                        <td style="padding: 0 40px 40px 40px;">
                            <div style="background-color: #FFF3CD; border-left: 4px solid #FFC107; padding: 15px; border-radius: 4px;">
                                <p style="color: #856404; margin: 0; font-size: 14px;">
                                    <strong>⚠️ Güvenlik Uyarısı:</strong> Bu kodu kimseyle paylaşmayınız!
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
                            <p style="color: #999999; font-size: 12px; margin: 0;">
                                Bu e-postayı siz talep etmediyseniz, lütfen dikkate almayın.
                            </p>
                            <p style="color: #999999; font-size: 12px; margin: 10px 0 0 0;">
                                © 2024 İkinci Ses. Tüm hakları saklıdır.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
}

/**
 * Welcome email template
 */
export function getWelcomeEmailTemplate(name: string): string {
    return `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hoş Geldiniz - İkinci Ses</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%); padding: 40px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 32px;">Hoş Geldiniz!</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="color: #333333; font-size: 18px; margin: 0 0 20px 0;">
                                Merhaba <strong>${name}</strong>,
                            </p>
                            <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                                İkinci Ses ailesine katıldığınız için teşekkür ederiz! 🎸
                            </p>
                            <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                                Platformumuzda müzik ekipmanlarınızı alıp satabilir, sorularınızı sorabilir ve müzisyenlerle buluşabilirsiniz.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9f9f9; padding: 30px; text-align: center;">
                            <p style="color: #999999; font-size: 12px; margin: 0;">
                                © 2024 İkinci Ses
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
}

/**
 * Notification email template
 */
export function getNotificationEmailTemplate(title: string, message: string, link?: string): string {
    const buttonHtml = link ? `
        <tr>
            <td style="padding: 0 40px 40px 40px; text-align: center;">
                <a href="${link}" style="display: inline-block; background-color: #8B4513; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 25px; font-size: 16px; font-weight: bold;">
                    Görüntüle
                </a>
            </td>
        </tr>
    ` : '';

    return `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%); padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${title}</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0;">
                                ${message}
                            </p>
                        </td>
                    </tr>
                    
                    ${buttonHtml}
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9f9f9; padding: 20px; text-align: center;">
                            <p style="color: #999999; font-size: 12px; margin: 0;">
                                © 2024 İkinci Ses
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
}
