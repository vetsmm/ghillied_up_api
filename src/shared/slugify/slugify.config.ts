import { registerAs } from '@nestjs/config';

export default registerAs('slugify', () => ({
  replacement: '-',
  lower: true,
  remove: /[*+~.()'"!:@]/g,
}));
