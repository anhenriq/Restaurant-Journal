import axe from 'axe-core'

/**
 * Tests run without the app's CSS, so both navigations (phone tab bar and desktop side nav) would
 * be visible at once. Hide the side nav, as the real stylesheet does below the `md` breakpoint.
 */
function emulatePhoneLayout(): void {
  if (document.getElementById('axe-phone-layout')) return
  const style = document.createElement('style')
  style.id = 'axe-phone-layout'
  style.textContent = '.hidden { display: none; }'
  document.head.append(style)
}

/**
 * Fails the test if axe-core finds WCAG A/AA problems in `container`.
 * (jsdom has no layout engine, so color-contrast is checked separately in tokens.test.ts.)
 */
export async function expectNoA11yViolations(container: Element = document.body): Promise<void> {
  emulatePhoneLayout()
  const results = await axe.run(container, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] },
    rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
  })
  const summary = results.violations.map(
    (v) => `${v.id}: ${v.help}\n${v.nodes.map((n) => `  ${n.target.join(' ')}`).join('\n')}`,
  )
  if (summary.length > 0) throw new Error(`Accessibility violations:\n${summary.join('\n')}`)
}
