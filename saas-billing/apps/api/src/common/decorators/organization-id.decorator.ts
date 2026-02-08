import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const OrganizationId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers["x-organization-id"] ?? request.headers["x-organization"];
  },
);
