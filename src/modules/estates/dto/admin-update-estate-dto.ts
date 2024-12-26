import { PartialType } from '@nestjs/swagger';

import { AdminCreateEstateDto } from './admin-create-estate.dto';

export class AdminUpdateEstateDto extends PartialType(AdminCreateEstateDto) {}
