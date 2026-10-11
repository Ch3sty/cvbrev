/**
 * test_type i logic_test_v4_sessions för ett test i testConfig. Samma
 * tabeller som hubben läser (getHubData.ts): de kognitiva testen ur
 * COGNITIVE_TEST_TYPE, proven ur PROV_TEST_TYPE_BY_ENDPOINT.
 */
import type { TestConfig } from '@/app/dashboard/tester/testConfig'
import { COGNITIVE_TEST_TYPE, PROV_TEST_TYPE_BY_ENDPOINT } from '@/app/dashboard/tester/getHubData'

export function testTypeForSlug(config: Pick<TestConfig, 'slug' | 'api'>): string | null {
  return (
    (COGNITIVE_TEST_TYPE as Record<string, string>)[config.slug] ??
    PROV_TEST_TYPE_BY_ENDPOINT[`${config.api}/session`] ??
    null
  )
}
