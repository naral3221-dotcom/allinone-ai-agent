import { InsightGenerator } from './insights';
import { poemoraClient } from './client.singleton';

const globalForInsight = globalThis as unknown as {
  insightGenerator: InsightGenerator | undefined;
};

export const insightGenerator =
  globalForInsight.insightGenerator ?? new InsightGenerator(poemoraClient);

if (process.env.NODE_ENV !== 'production') {
  globalForInsight.insightGenerator = insightGenerator;
}
