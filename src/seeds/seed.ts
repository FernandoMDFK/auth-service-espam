import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config'; // 1. Importamos el ConfigService

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const configService = app.get(ConfigService); // 2. Instanciamos el servicio

  // 3. Obtenemos la contraseña desde las variables de entorno de forma segura
  const adminPassword = configService.get<string>('ADMIN_SEED_PASSWORD');

  // Buena práctica: abortar si la contraseña no está configurada en el servidor
  if (!adminPassword) {
    throw new Error('CRÍTICO: La variable ADMIN_SEED_PASSWORD no está definida en el entorno.');
  }

  const existing = await usersService.findByEmail('admin@example.com');
  if (!existing) {
    await usersService.create({
      nombres: 'Admin',
      apellidos: 'Principal',
      dni: '9999999999',
      email: 'admin@example.com',
      password: adminPassword, // 4. Inyectamos la variable en lugar del texto plano
      role: UserRole.OPERADOR,
    });
    console.log('Operador inicial creado exitosamente');
  }
  await app.close();
}
bootstrap();