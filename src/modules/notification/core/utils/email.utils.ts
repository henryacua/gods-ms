export const RESET_PASSWORD_SUBJECT = 'Recuperación de Contraseña';

export const getBodyHTML = (resetLink: string) => `<!DOCTYPE html>
  <html lang="es">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recuperación de Contraseña</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f8f9fa;
              margin: 0;
              padding: 0;
          }
          .container {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
              background: #fff;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              overflow: hidden;
          }
          .header {
              background-color:rgb(187, 69, 255);
              color: #fff;
              text-align: center;
              padding: 20px;
          }
          .header img {
              max-width: 150px;
              margin-bottom: 10px;
          }
          .content {
              padding: 20px;
              text-align: center;
              color: #333;
          }
          .content h1 {
              font-size: 22px;
              margin-bottom: 10px;
          }
          .content p {
              font-size: 16px;
              line-height: 1.6;
          }
          .btn {
              display: inline-block;
              padding: 12px 24px;
              background: rgb(187, 69, 255);
              color: #fff;
              text-color: #fff;
              text-decoration: none;
              font-size: 18px;
              border-radius: 5px;
              margin-top: 20px;
          }
          .btn:hover {
              background: rgb(187, 69, 255);
          }
          .footer {
              text-align: center;
              padding: 15px;
              font-size: 14px;
              color: #666;
              background: #f1f1f1;
              margin-top: 20px;
          }
      </style>
  </head>
  <body>

      <div class="container">
          <!-- Encabezado con logo -->
          <div class="header">
              <img src="https://avatars.githubusercontent.com/u/196365554?s=200&v=4" alt="Bandidotes Logo">
              <h2>Bandidos recovery</h2>
          </div>

          <!-- Contenido principal -->
          <div class="content">
              <h1>¡Hola!</h1>
              <p>Hemos recibido una solicitud para restablecer tu contraseña. Si no hiciste esta solicitud, puedes ignorar este correo.</p>
              <p>Para recuperar tu cuenta, haz clic en el siguiente botón:</p>
              <a href="${resetLink}" class="btn">Restablecer Contraseña</a>
              <p>Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
              <p style="word-break: break-all;">${resetLink}</p>
              <p>Este enlace expirará en 24 horas.</p>
          </div>

          <!-- Pie de página -->
          <div class="footer">
              <p>Si necesitas ayuda, contáctanos en <a href="mailto:tremendos@bandidos.com">tremendos@bandidos.com</a></p>
              <p>&copy; 2025 Bandidos. Todos los derechos reservados.</p>
          </div>
      </div>

  </body>
  </html>`;
