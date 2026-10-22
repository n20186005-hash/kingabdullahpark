# Local validation scope

The pinned pnpm11.24.0 installation now has a committed lockfile and explicit build-script choices for the existing esbuild/workerd tools. Source checks and a static build are required before release; they do not establish production readiness.

The forecast is requested at runtime through the same-origin Worker instead of during static prerendering. Its actual source model and delivered client callbacks are exercised in tests, including upstream errors, missing values and stale model times. The previous copied-helper-only test is replaced with tests of the real implementation. Existing page routes and Arabic RTL output are checked by the output script.

Actual desktop/mobile layout, image loading, controls, weather rendering, exact official deployment and production entrances still require separate acceptance. A source test or build result must not be described as that browser/production evidence.
