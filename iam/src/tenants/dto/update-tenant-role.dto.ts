import { IsNotEmpty, IsString } from "class-validator";

export class UpdateTenantRoleDto {
  @IsString()
  @IsNotEmpty()
  role: string;
}
