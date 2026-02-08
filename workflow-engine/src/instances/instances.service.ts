import { Injectable } from "@nestjs/common";

@Injectable()
export class InstancesService {
  create(input: any) {
    return { ok: true, input };
  }
  get(id: string) {
    return { ok: true, id };
  }
  transition(id: string, input: any) {
    return { ok: true, id, input };
  }
  events(id: string) {
    return { ok: true, id, events: [] };
  }
}
