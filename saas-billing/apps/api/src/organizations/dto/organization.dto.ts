import { IsOptional, IsString } from "class-validator";

export class CreateOrganizationDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;
}

export class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;
}
