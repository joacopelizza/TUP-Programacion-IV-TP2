import { test, expect } from '@playwright/test';
import { resetDb } from './helpers';

test.describe('Notes E2E Flow', () => {
  test.beforeEach(async () => {
    await resetDb();
  });

  test('Happy Path: should create a note and then list it', async ({ request }) => {
    const newNote = {
      title: 'E2E Test Note',
      content: 'This is a test content for E2E',
      pinned: true
    };

    const createResponse = await request.post('/notes', {
      data: newNote
    });

    expect(createResponse.ok()).toBeTruthy();
    const createdNote = await createResponse.json();
    const noteId = createdNote.id;

    const listResponse = await request.get('/notes');
    expect(listResponse.ok()).toBeTruthy();

    const notes = await listResponse.json();
    const found = notes.find((n: any) => n.id === noteId);

    expect(found).toBeDefined();
    expect(found.title).toBe(newNote.title);
    expect(found.pinned).toBe(true);
  });

  test('Error Case: should return 404 when getting a non-existent note', async ({ request }) => {
    const response = await request.get('/notes/9999');

    expect(response.status()).toBe(404);
  });
});
