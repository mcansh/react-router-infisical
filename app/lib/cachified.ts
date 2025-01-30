import type { CachifiedOptions, CreateReporter } from "@epic-web/cachified";
import {
  cachified as baseCachified,
  mergeReporters,
  verboseReporter,
} from "@epic-web/cachified";
import type { Timings } from "./timing";
import { cachifiedTimingReporter } from "./timing";

type CachifiedOptionsWithTimings<Value> = CachifiedOptions<Value> & {
  timings?: Timings;
};

export async function cachified<Value>(
  { timings, ...options }: CachifiedOptionsWithTimings<Value>,
  reporter: CreateReporter<Value> = verboseReporter<Value>(),
): Promise<Value> {
  return baseCachified(
    options,
    mergeReporters(cachifiedTimingReporter(timings), reporter),
  );
}
