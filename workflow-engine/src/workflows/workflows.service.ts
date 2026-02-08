import { Injectable } from "@nestjs/common";

@Injectable()
export class WorkflowsService {
  create(input: any) {
    return { ok: true, input };
  }
  createVersion(id: string, input: any) {
    return { ok: true, id, input };
  }
  get(id: string) {
    return { ok: true, id };
  }
}
