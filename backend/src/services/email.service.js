/**
 * Email Service — Envío de emails transaccionales
 *
 * Usa Resend con configuración vía variable de entorno RESEND_API_KEY.
 * Si no hay API key configurada (desarrollo), imprime el contenido
 * en la consola del servidor como fallback.
 */

import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_ADDRESS = process.env.EMAIL_FROM || 'VOY <noreply@voy.com.ar>';

/**
 * Envía un email de recuperación de contraseña.
 *
 * @param {string} to - Email del destinatario
 * @param {string} resetUrl - URL completa con token para restablecer
 */
export async function sendPasswordResetEmail(to, resetUrl) {
  const subject = 'Restablecé tu contraseña — VOY';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #2c3268; font-size: 28px; margin: 0;">🚌 VOY</h1>
      </div>
      
      <div style="background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        <h2 style="color: #1e2348; font-size: 20px; margin: 0 0 16px;">¿Olvidaste tu contraseña?</h2>
        
        <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
          Recibimos una solicitud para restablecer la contraseña de tu cuenta en VOY. 
          Hacé clic en el siguiente botón para crear una nueva contraseña:
        </p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" 
             style="display: inline-block; background: linear-gradient(135deg, #2c3268, #3d4590); color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 16px; font-weight: 700; letter-spacing: 0.3px;">
            Restablecer contraseña
          </a>
        </div>
        
        <p style="color: #9ca3af; font-size: 13px; line-height: 1.5; margin: 0 0 8px;">
          Si no solicitaste este cambio, podés ignorar este email de forma segura. 
          Tu contraseña no se va a modificar.
        </p>
        
        <p style="color: #9ca3af; font-size: 13px; line-height: 1.5; margin: 0 0 16px;">
          ⏱️ Este enlace expira en <strong>1 hora</strong>.
        </p>
        
        <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
        
        <p style="color: #d1d5db; font-size: 11px; line-height: 1.4; margin: 0;">
          Si el botón no funciona, copiá y pegá este enlace en tu navegador:<br/>
          <a href="${resetUrl}" style="color: #6366f1; word-break: break-all;">${resetUrl}</a>
        </p>
      </div>
      
      <p style="text-align: center; color: #d1d5db; font-size: 11px; margin-top: 24px;">
        © ${new Date().getFullYear()} VOY — Plataforma de pasajes de micro
      </p>
    </div>
  `;

  // Si hay Resend configurado, enviar email real
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: FROM_ADDRESS,
        to: [to],
        subject,
        html,
      });

      if (error) {
        console.error('❌ Error al enviar email con Resend:', error);
      } else {
        console.log(\`📧 Email de recuperación enviado a \${to} (ID: \${data.id})\`);
      }
    } catch (err) {
      console.error('❌ Error de conexión al enviar email:', err.message);
      // No lanzar error al usuario (anti-enumeración)
    }
  } else {
    // Fallback: imprimir en consola para desarrollo
    console.log('\\n╔══════════════════════════════════════════════════════╗');
    console.log('║   📧 EMAIL DE RECUPERACIÓN (modo desarrollo)        ║');
    console.log('╠══════════════════════════════════════════════════════╣');
    console.log(\`║ Para: \${to}\`);
    console.log(\`║ Asunto: \${subject}\`);
    console.log('║');
    console.log(\`║ 🔗 Link de reset:\`);
    console.log(\`║ \${resetUrl}\`);
    console.log('║');
    console.log('╚══════════════════════════════════════════════════════╝\\n');
  }
}
