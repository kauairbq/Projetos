import { Body, Controller, Post, UseGuards, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { LogoutDto } from "./dto/logout.dto";
import { AuthGuard } from "@nestjs/passport";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post("refresh")
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto);
  }

  @Post("logout")
  logout(@Body() dto: LogoutDto) {
    return this.auth.logout(dto);
  }

  @UseGuards(AuthGuard("jwt"))
  @Post("logout-all")
  logoutAll(@Req() req: any) {
    return this.auth.logoutAll(req.user.sub);
  }
}
