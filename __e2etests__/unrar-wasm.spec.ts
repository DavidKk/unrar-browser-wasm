import { expect, test } from '@playwright/test'

test.describe('UnRAR WASM Browser Tests', () => {
  test('should load WASM module successfully', async ({ page }) => {
    // Monitor WASM file requests
    const wasmRequests: string[] = []
    const wasmResponses: { url: string; status: number; contentType: string }[] = []

    page.on('request', (request) => {
      const url = request.url()
      if (url.endsWith('.wasm')) {
        wasmRequests.push(url)
        // eslint-disable-next-line no-console
        console.log('WASM request:', url)
      }
    })

    page.on('response', async (response) => {
      const url = response.url()
      if (url.endsWith('.wasm')) {
        const contentType = response.headers()['content-type'] || ''
        wasmResponses.push({
          url,
          status: response.status(),
          contentType,
        })
        // eslint-disable-next-line no-console
        console.log('WASM response:', {
          url,
          status: response.status(),
          contentType,
        })
      }
    })

    // Visit demo page
    await page.goto('http://localhost:3000/unrar-browser-wasm/e2e-demo/')

    // Wait for module status
    const moduleStatus = page.locator('#moduleStatus')
    await page.waitForTimeout(5000)

    // Check WASM requests
    // eslint-disable-next-line no-console
    console.log('All WASM requests:', wasmRequests)
    // eslint-disable-next-line no-console
    console.log('All WASM responses:', wasmResponses)

    // Get status text
    const statusText = await moduleStatus.textContent({ timeout: 30000 })
    // eslint-disable-next-line no-console
    console.log('Module status:', statusText)

    // Verify module loaded successfully
    expect(statusText).toContain('loaded successfully')
  })

  test('should extract encrypted RAR file with correct content', async ({ page }) => {
    // Monitor console logs
    const consoleLogs: string[] = []
    page.on('console', (msg) => {
      const text = msg.text()
      consoleLogs.push(text)
      // eslint-disable-next-line no-console
      console.log('Browser console:', text)
    })

    // Visit demo page (will auto-load and extract encrypted file)
    await page.goto('http://localhost:3000/unrar-browser-wasm/e2e-demo/')

    // Wait for module to load
    await page.waitForSelector('#moduleStatus:has-text("loaded successfully")', {
      timeout: 30000,
    })
    // eslint-disable-next-line no-console
    console.log('✅ WASM module loaded')

    // Wait for extraction to complete (automatic)
    await page.waitForSelector('.status.success:has-text("tests completed")', {
      timeout: 15000,
    })
    // eslint-disable-next-line no-console
    console.log('✅ Extraction completed')

    // Wait for results section
    await page.waitForSelector('#results', { timeout: 5000 })
    const results = page.locator('#results')
    await expect(results).toBeVisible()

    // Check extracted files in encrypted results section
    const fileItems = page.locator('#encResults > div > div')
    const fileCount = await fileItems.count()
    // eslint-disable-next-line no-console
    console.log('Number of extracted files:', fileCount)
    expect(fileCount).toBeGreaterThan(0)

    // Check file details - should be encryption/encryption.txt
    const firstFile = fileItems.first()
    const fileText = await firstFile.textContent()
    // eslint-disable-next-line no-console
    console.log('File info:', fileText)

    // Should contain encryption
    expect(fileText).toContain('encryption')

    // Check file content
    const hasContent = (await firstFile.locator('pre').count()) > 0
    if (hasContent) {
      const content = await firstFile.locator('pre').textContent()
      // eslint-disable-next-line no-console
      console.log('File content:', JSON.stringify(content))

      // Should contain "passwor is 123" (注意：原文件内容少了'd')
      expect(content).toContain('passwor is 123')
      expect(content?.trim().length).toBeGreaterThan(0)
      // eslint-disable-next-line no-console
      console.log('✅ Encrypted file content is correct')
    } else {
      throw new Error('Expected file content but found none')
    }

    // Check password was set in logs
    const passwordSetLog = consoleLogs.find((log) => log.includes('Setting password'))
    expect(passwordSetLog).toBeTruthy()
    // eslint-disable-next-line no-console
    console.log('✅ Password was set')

    // Check text content in logs
    const textContentLog = consoleLogs.find((log) => log.includes('password is 123'))
    if (textContentLog) {
      // eslint-disable-next-line no-console
      console.log('✅ Text content found:', textContentLog)
    }

    // eslint-disable-next-line no-console
    console.log('✅ Encrypted file extraction test passed')
  })

  test('should display file name correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/unrar-browser-wasm/e2e-demo/')

    // Wait for module to load
    await page.waitForSelector('#moduleStatus:has-text("loaded successfully")', { timeout: 30000 })

    // Wait for extraction (automatic)
    await page.waitForSelector('.status.success', { timeout: 15000 })

    // Check file name in encrypted results - should be encryption/encryption.txt
    const fileName = await page.locator('#encResults strong').first().textContent()
    // eslint-disable-next-line no-console
    console.log('File name:', fileName)

    // Should contain "encryption"
    expect(fileName).toContain('encryption')
    // eslint-disable-next-line no-console
    console.log('✅ File name is correct')
  })
})
