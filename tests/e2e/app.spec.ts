import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/GrooveKit/i);
  await expect(page.getByRole('link', { name: 'Start Playing' })).toBeVisible();
});

test('homepage has feature links', async ({ page }) => {
  await page.goto('/');
  const titles = [
    'Drum Pad',
    'Learn',
    'Rudiments',
    'Grooves',
    'Metronome',
    'Sequencer',
    'Rhythm Game',
  ] as const;
  for (const title of titles) {
    await expect(page.getByRole('link', { name: title })).toBeVisible();
  }
});

test('navigate to drum pad', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Start Playing' }).click();
  await expect(page).toHaveURL(/\/pad$/);
  await expect(page.getByRole('heading', { name: 'Drum Pad' })).toBeVisible();
  const pads = page.getByRole('group', { name: 'Drum pads' }).getByRole('button');
  await expect(pads).toHaveCount(9);
});

test('navigate to learn', async ({ page }) => {
  await page.goto('/learn');
  await expect(page.getByRole('heading', { name: 'Learn Drums' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Foundations' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Technique' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Mastery' })).toBeVisible();
});

test('navigate to rudiments', async ({ page }) => {
  await page.goto('/rudiments');
  await expect(page.getByRole('heading', { name: /40 PAS/i })).toBeVisible();
  for (const tab of ['Rolls', 'Diddles', 'Flams', 'Drags'] as const) {
    await expect(page.getByRole('button', { name: tab })).toBeVisible();
  }
});

test('navigate to grooves', async ({ page }) => {
  await page.goto('/grooves');
  await expect(page.getByRole('heading', { name: 'Groove Explorer' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Rock' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Funk' })).toBeVisible();
});

test('navigate to metronome', async ({ page }) => {
  await page.goto('/metronome');
  await expect(page.getByRole('heading', { name: 'Metronome' }).first()).toBeVisible();
  await expect(page.locator('#metronome-tempo')).toBeVisible();
  await expect(page.getByText('BPM').first()).toBeVisible();
});

test('navigate to sequencer', async ({ page }) => {
  await page.goto('/sequencer');
  await expect(page.getByRole('heading', { name: /Sequencer/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /^(Play|Stop)$/ })).toBeVisible();
});

test('navigate to rhythm game', async ({ page }) => {
  await page.goto('/rhythm-game');
  await expect(page.getByRole('heading', { name: 'Rhythm Game' })).toBeVisible();
});

test('navigate to profile', async ({ page }) => {
  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: 'Your Progress' })).toBeVisible();
  await expect(page.getByText(/Lv\s+\d+/)).toBeVisible();
  await expect(page.getByText(/\d+\s*\/\s*\d+\s+XP/)).toBeVisible();
});

test('sidebar navigation on desktop', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'Desktop layout only');

  await page.goto('/pad');
  const sidebar = page.locator('aside');
  const labels = [
    'Drum Pad',
    'Learn',
    'Rudiments',
    'Grooves',
    'Metronome',
    'Sequencer',
    'Rhythm Game',
    'Profile',
  ] as const;
  for (const label of labels) {
    await expect(sidebar.getByRole('link', { name: label })).toBeVisible();
  }

  await sidebar.getByRole('link', { name: 'Metronome' }).click();
  await expect(page).toHaveURL(/\/metronome$/);
  await expect(page.getByRole('heading', { name: 'Metronome' }).first()).toBeVisible();
});

test('drum pad keyboard shortcut display', async ({ page }) => {
  await page.goto('/pad');
  const pads = page.getByRole('group', { name: 'Drum pads' });
  for (const key of ['Q', 'W', 'E', 'A', 'S', 'D', 'Z', 'X', 'C'] as const) {
    await expect(pads.getByText(key, { exact: true })).toBeVisible();
  }
});

test('lesson list shows lessons', async ({ page }) => {
  await page.goto('/learn');
  const lessonRows = page.locator('main ul.divide-y > li');
  expect(await lessonRows.count()).toBeGreaterThanOrEqual(10);
});

test('sequencer grid renders', async ({ page }) => {
  await page.goto('/sequencer');
  const stepCells = page.locator('main button[aria-label*="step"]');
  expect(await stepCells.count()).toBeGreaterThanOrEqual(100);
});

test('mobile bottom navigation is visible', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Mobile project only');

  await page.goto('/pad');
  const bottomNav = page.locator('.flex.min-h-screen > nav');
  await expect(bottomNav).toBeVisible();
  await expect(bottomNav.getByRole('link', { name: 'Drum Pad' })).toBeVisible();
  await expect(bottomNav.getByRole('link', { name: 'Learn' })).toBeVisible();
});
