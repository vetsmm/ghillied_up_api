import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app/app.module";

import * as commander from "commander";
import { Command } from "commander";
import { hash } from 'bcrypt';
import slugify from "slugify";
import { UserAuthority } from "@prisma/client";
import { PrismaService } from "./prisma/prisma.service";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const configService = app.get(ConfigService);
  const prisma = app.get(PrismaService);

  const defaultAdminUserPassword = configService.get<string>(
    'defaultAdminUserPassword',
  );

  const program = commander.program;
  program
    // .command('createsuperuser')
    .requiredOption('-f, --first-name <first_name>', 'The First Name of the User.')
    .requiredOption('-l, --last-name <last_name>', 'The Last Name of the User.')
    .requiredOption('-u, --username <username>', 'The Username of the User.')
    .requiredOption('-p, --password <password>', 'The Password of the User.')
    .requiredOption('-e, --email <email>', 'The Email of the User.')
    .description('Creates a Super User for Ghillied Up.')
    .action(async (app: string, command: Command) => {

    });

  program.parse(process.argv);

  const options = program.opts();

  await prisma.user.create({
    data: {
      username: options.username,
      password: await hash(options.password, 10),
      email: options.email,
      firstName: options.firstName,
      lastName: options.lastName,
      slug: slugify(options.username, {
        replacement: '-',
        lower: false,
        strict: true,
        trim: true,
      }),
      authorities: [UserAuthority.ROLE_ADMIN, UserAuthority.ROLE_USER, UserAuthority.ROLE_MODERATOR],
      activated: true,
    },
  });

  console.log("Created Super User: ", options.username);

  await app.close();
}

bootstrap();
