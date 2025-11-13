import { test, expect } from '@playwright/test'

test.describe('UnRAR WASM Browser Tests', () => {
  test('should load WASM module successfully', async ({ page }) => {
    // Monitor WASM file requests
    const wasmRequests: string[] = []
    const wasmResponses: { url: string; status: number; contentType: string }[] = []

    page.on('request', (request) => {
      const url = request.url()
      if (url.endsWith('.wasm')) {
        wasmRequests.push(url)
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
    console.log('All WASM requests:', wasmRequests)
    console.log('All WASM responses:', wasmResponses)

    // Get status text
    const statusText = await moduleStatus.textContent({ timeout: 30000 })
    console.log('Module status:', statusText)

    // Verify module loaded successfully
    expect(statusText).toContain('loaded successfully')
  })

  test('should extract RAR file with correct content', async ({ page }) => {
    // Monitor console logs
    const consoleLogs: string[] = []
    page.on('console', (msg) => {
      const text = msg.text()
      consoleLogs.push(text)
      console.log('Browser console:', text)
    })

    // Visit demo page (will auto-load and extract)
    await page.goto('http://localhost:3000/unrar-browser-wasm/e2e-demo/')

    // Wait for module to load
    await page.waitForSelector('#moduleStatus:has-text("loaded successfully")', {
      timeout: 30000,
    })
    console.log('✅ WASM module loaded')

    // Wait for extraction to complete
    await page.waitForSelector('.status.success:has-text("extracted successfully")', {
      timeout: 15000,
    })
    console.log('✅ Extraction completed')

    // Wait for results section
    await page.waitForSelector('#results', { timeout: 5000 })
    const results = page.locator('#results')
    await expect(results).toBeVisible()

    // Check extracted files
    const fileItems = page.locator('#extractedFiles > div > div')
    const fileCount = await fileItems.count()
    console.log('Number of extracted files:', fileCount)
    expect(fileCount).toBeGreaterThan(0)

    // Check file details
    for (let i = 0; i < fileCount; i++) {
      const item = fileItems.nth(i)
      const itemText = await item.textContent()
      console.log(`File ${i + 1}:`, itemText)

      // Check if file has content displayed
      const hasContent = (await item.locator('pre').count()) > 0
      const hasEmptyWarning = itemText?.includes('Empty content')

      if (hasContent) {
        const content = await item.locator('pre').textContent()
        console.log('  File content:', JSON.stringify(content))

        // Verify content is not empty and not all zeros
        expect(content).toBeTruthy()
        expect(content?.trim().length).toBeGreaterThan(0)
      } else if (hasEmptyWarning) {
        console.log('  ⚠️ Empty content warning')
      }
    }

    // Check for zero-size warnings in logs
    const zeroSizeWarning = consoleLogs.find((log) => log.includes('Warning: Read data size is 0'))
    if (zeroSizeWarning) {
      console.error('❌ Found zero-size data warning!')
      console.error(
        'Relevant logs:',
        consoleLogs.filter((log) => log.includes('Reading') || log.includes('bytes') || log.includes('content'))
      )
      throw new Error('File content is empty - check C++ readSubData function')
    }

    // Check byte preview
    const bytePreview = consoleLogs.find((log) => log.includes('First 10 bytes'))
    if (bytePreview) {
      console.log('✅ File content preview:', bytePreview)
      // Verify not all zeros
      expect(bytePreview).not.toMatch(/00 00 00/)
    }

    // Check text content in logs
    const textContentLog = consoleLogs.find((log) => log.includes('Text content:'))
    if (textContentLog) {
      console.log('✅ Text content found:', textContentLog)
      // Should contain "123" for q.txt
      expect(textContentLog).toContain('123')
    } else {
      console.error('❌ No text content found in logs')
      console.error('All console logs:', consoleLogs)
      throw new Error('Expected text content "123" not found')
    }

    console.log('✅ File extraction test passed')
  })

  test('should display file name correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/unrar-browser-wasm/e2e-demo/')

    // Wait for extraction
    await page.waitForSelector('#moduleStatus:has-text("loaded successfully")', { timeout: 30000 })
    await page.waitForSelector('.status.success', { timeout: 15000 })

    // Check file name
    const fileName = await page.locator('#extractedFiles strong').first().textContent()
    console.log('File name:', fileName)

    // Should be "q.txt" not "q.t"
    expect(fileName).toBe('q.txt')
    console.log('✅ File name is correct')
  })
})
