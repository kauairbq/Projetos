import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class InviteTenantUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  role: string;
}
