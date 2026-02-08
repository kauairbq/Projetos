import { IsEnum, IsString } from "class-validator";

export enum OrganizationRoleDto {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

export class AddOrganizationUserDto {
  @IsString()
  userId: string;

  @IsEnum(OrganizationRoleDto)
  role: OrganizationRoleDto;
}
