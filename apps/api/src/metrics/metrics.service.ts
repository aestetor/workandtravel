import { Injectable } from "@nestjs/common";
import { collectDefaultMetrics, Registry } from "prom-client";

@Injectable()
export class MetricsService {
  private readonly registry: Registry;

  constructor() {
    this.registry = new Registry();
    collectDefaultMetrics({ register: this.registry, prefix: "worktravel_" });
  }

  async metrics() {
    return this.registry.metrics();
  }
}
